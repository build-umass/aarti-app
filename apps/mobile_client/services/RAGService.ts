import { getDatabase } from '../lib/database';
import { generateEmbedding, generateRAGResponse, generateSimpleResponse, testGeminiConnection } from '../lib/gemini';
import { storeEmbedding, searchSimilarEmbeddings, removeEmbeddings } from '../lib/vector-db';
import { PDFService } from './PDFService';

export interface KnowledgeBaseDocument {
  id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  content_type: 'quiz' | 'resource' | 'general';
  created_at?: string;
  similarity?: number; // Added for search results
}

// Cosine similarity calculation
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RAGService {
  // Add a document to the knowledge base
  static async addDocument(content: string, contentType: 'quiz' | 'resource' | 'general' = 'general', metadata?: Record<string, any>): Promise<void> {
    try {
      const db = getDatabase();

      // Store document in knowledge base first
      let metadataJson = null;
      try {
        metadataJson = metadata ? JSON.stringify(metadata) : null;
      } catch (jsonError) {
        console.error('Error serializing metadata:', jsonError);
        metadataJson = JSON.stringify({ error: 'metadata serialization failed' });
      }

      console.log(`Storing document: ${content.length} chars, metadata: ${metadataJson?.length || 0} chars`);

      // Check content size - SQLite has limits
      if (content.length > 1000000) { // 1MB limit
        console.warn(`Content too large (${content.length} chars), truncating...`);
        content = content.substring(0, 500000); // Truncate to 500KB
      }

      let result;
      try {
        result = await db.runAsync(
          'INSERT INTO knowledge_base (content, embedding, metadata, content_type) VALUES (?, ?, ?, ?)',
          [
            content,
            null, // embedding will be added later
            metadataJson,
            contentType
          ]
        );
        console.log(`Document inserted with ID: ${result.lastInsertRowId}`);
      } catch (insertError) {
        console.error('Error during INSERT operation:', insertError);
        console.error('Content length:', content.length);
        console.error('Metadata length:', metadataJson?.length || 0);
        throw insertError;
      }

      // Get the inserted document ID
      const docId = result.lastInsertRowId?.toString() || 'unknown';

      try {
        // Generate embedding for the content
        const embedding = await generateEmbedding(content);

        // Store embedding in vector database
        await storeEmbedding(docId, embedding);
        console.log(`Document added to knowledge base with embeddings (ID: ${docId})`);
      } catch (embeddingError: any) {
        console.warn(`Embedding generation failed for document ${docId}, stored without embeddings:`, embeddingError.message);
        // Document is still stored in knowledge_base, just without embeddings
      }

    } catch (error) {
      console.error('Error adding document to knowledge base:', error);
      throw error;
    }
  }

  // Search for similar documents
  static async searchSimilarDocuments(query: string, topK: number = 5, contentType?: 'quiz' | 'resource' | 'general'): Promise<KnowledgeBaseDocument[]> {
    try {
      const db = getDatabase();

      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);

      // Search for similar embeddings in vector database
      const similarEmbeddings = await searchSimilarEmbeddings(queryEmbedding, topK * 2); // Get more candidates

      if (similarEmbeddings.length === 0) {
        return [];
      }

      // Get document details for the similar embeddings
      const contentIds = similarEmbeddings.map(e => e.content_id);
      const placeholders = contentIds.map(() => '?').join(',');
      let queryString = `SELECT * FROM knowledge_base WHERE id IN (${placeholders})`;

      if (contentType) {
        queryString += ' AND content_type = ?';
      }

      const params = contentType ? [...contentIds, contentType] : contentIds;

      const documents = await db.getAllAsync<{
        id: number;
        content: string;
        metadata: string | null;
        content_type: string;
        created_at: string;
      }>(queryString, params);

      // Combine with similarity scores
      const results: KnowledgeBaseDocument[] = documents.map(doc => {
        const similarity = similarEmbeddings.find(e => e.content_id === doc.id.toString())?.similarity || 0;

        return {
          id: doc.id,
          content: doc.content,
          embedding: [], // Not needed in results
          metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
          content_type: doc.content_type as 'quiz' | 'resource' | 'general',
          created_at: doc.created_at,
          similarity: similarity
        };
      });

      // Sort by similarity (descending) and return top K
      results.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
      return results.slice(0, topK);

    } catch (error) {
      console.error('Error searching similar documents:', error);
      throw error;
    }
  }

  // Generate RAG response for a user query
  static async generateResponse(userQuery: string): Promise<string> {
    try {
      // Check if we have any documents in the knowledge base
      const db = getDatabase();
      const docCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM knowledge_base');
      const embeddingCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM vector_embeddings');

      if ((docCount?.count ?? 0) === 0 || (embeddingCount?.count ?? 0) === 0) {
        console.log('Knowledge base not fully initialized, using simple response');
        return await generateSimpleResponse(userQuery);
      }

      // Search for relevant documents
      const relevantDocs: KnowledgeBaseDocument[] = await this.searchSimilarDocuments(userQuery, 3);

      if (relevantDocs.length === 0 || (relevantDocs[0]?.similarity ?? 0) < 0.3) {
        // No relevant documents found or low similarity, use simple response
        console.log('No relevant documents found, using simple response');
        return await generateSimpleResponse(userQuery);
      }

      // Extract content from relevant documents
      const context = relevantDocs.map(doc => doc.content);

      // Generate RAG response using Gemini
      return await generateRAGResponse(userQuery, context);

    } catch (error) {
      console.error('Error generating RAG response:', error);
      // Fallback to simple response
      return await generateSimpleResponse(userQuery);
    }
  }

  // Initialize knowledge base with PDF documents only
  // This will only load documents if the knowledge base is empty
  static async initializeKnowledgeBase(): Promise<void> {
    try {
      const db = getDatabase();

      // Ensure tables exist (create if not present, but don't drop existing)
      await this.ensureTablesExist();

      // Check if knowledge base is already populated
      const existingDocs = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM knowledge_base'
      );

      const docCount = existingDocs?.count ?? 0;

      if (docCount > 0) {
        console.log(`📚 Knowledge base already initialized with ${docCount} documents`);

        // Check if embeddings exist
        const embeddingCount = await db.getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM vector_embeddings'
        );

        if ((embeddingCount?.count ?? 0) > 0) {
          console.log(`✅ Found ${embeddingCount?.count} embeddings - ready to use!`);
          return; // Already initialized, skip
        } else {
          console.log('⚠️ Documents exist but no embeddings found. Generating embeddings...');
          await this.generateEmbeddingsForExistingDocuments();
          return;
        }
      }

      console.log('🆕 First run - initializing knowledge base...');

      // Load PDF documents
      console.log('Loading PDF documents...');
      const pdfDocuments = await PDFService.loadPDFDocuments();
      console.log(`Found ${pdfDocuments.length} PDF documents ready for processing`);

      // Test API key connection first
      console.log('🔍 Testing Gemini API connection...');
      const apiTestResult = await testGeminiConnection();

      if (apiTestResult) {
        console.log('✅ API key is working! Generating embeddings for documents...');

        // Generate embeddings for all PDF documents
        let embeddedCount = 0;
        for (const pdfDoc of pdfDocuments) {
          try {
            // Chunk large documents for better retrieval (smaller chunks to avoid SQLite limits)
            const chunks = PDFService.chunkDocument(pdfDoc.content, 500, 50);

            // Limit chunks per document to avoid overwhelming the database
            const maxChunks = Math.min(chunks.length, 20);

            for (let i = 0; i < maxChunks; i++) {
              const chunkContent = chunks[i];
              const metadata = {
                ...pdfDoc.metadata,
                filename: pdfDoc.filename,
                title: pdfDoc.title,
                chunk_index: i,
                total_chunks: chunks.length,
                document_type: 'pdf'
              };

              await this.addDocument(chunkContent, 'resource', metadata);
            }
            embeddedCount++;
          } catch (docError) {
            console.error(`Error embedding document ${pdfDoc.filename}:`, docError);
            // Continue with other documents
          }
        }

        console.log(`✅ Successfully embedded ${embeddedCount} PDF documents`);
        console.log('🚀 Knowledge base fully initialized with embeddings!');

      } else {
        console.log('⚠️ API key test failed - storing documents without embeddings');
        console.log('Documents will be searchable but won\'t use AI for responses');
        console.log('Set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in .env file and restart to enable AI features');

        // Store documents without embeddings as fallback
        for (const pdfDoc of pdfDocuments) {
          try {
            const chunks = PDFService.chunkDocument(pdfDoc.content, 500, 50);
            // Limit chunks per document to avoid overwhelming the database
            const maxChunks = Math.min(chunks.length, 20);

            for (let i = 0; i < maxChunks; i++) {
              const chunkContent = chunks[i];
              const metadata = {
                ...pdfDoc.metadata,
                filename: pdfDoc.filename,
                title: pdfDoc.title,
                chunk_index: i,
                total_chunks: chunks.length,
                document_type: 'pdf'
              };

              // Add document without trying to embed (will fail gracefully)
              await this.addDocument(chunkContent, 'resource', metadata);
            }
          } catch (docError) {
            console.error(`Error storing document ${pdfDoc.filename}:`, docError);
          }
        }

        console.log('📚 Documents stored without embeddings - basic search available');
      }
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      throw error;
    }
  }

  // Ensure knowledge base tables exist without dropping existing data
  static async ensureTablesExist(): Promise<void> {
    try {
      const db = getDatabase();

      // Create tables if they don't exist (IF NOT EXISTS prevents errors)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          embedding TEXT,
          metadata TEXT,
          content_type TEXT DEFAULT 'resource',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS vector_embeddings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content_id TEXT NOT NULL,
          embedding TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_vector_embeddings_content_id ON vector_embeddings(content_id);
      `);
    } catch (error) {
      console.error('Error ensuring tables exist:', error);
      throw error;
    }
  }

  // Get knowledge base statistics
  static async getKnowledgeBaseStats(): Promise<{ total_documents: number; documents_by_type: Record<string, number> }> {
    try {
      const db = getDatabase();

      const totalDocs = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM knowledge_base');

      const docsByType = await db.getAllAsync<{ content_type: string; count: number }>(
        'SELECT content_type, COUNT(*) as count FROM knowledge_base GROUP BY content_type'
      );

      const documentsByType: Record<string, number> = {};
      docsByType.forEach(row => {
        documentsByType[row.content_type] = row.count;
      });

      return {
        total_documents: totalDocs?.count || 0,
        documents_by_type: documentsByType
      };
    } catch (error) {
      console.error('Error getting knowledge base stats:', error);
      return { total_documents: 0, documents_by_type: {} };
    }
  }

  // Generate embeddings for existing documents (call after API key is configured)
  static async generateEmbeddingsForExistingDocuments(): Promise<void> {
    try {
      const db = getDatabase();

      // Get documents that don't have embeddings
      const documentsWithoutEmbeddings = await db.getAllAsync<{
        id: number;
        content: string;
      }>(`
        SELECT kb.id, kb.content
        FROM knowledge_base kb
        LEFT JOIN vector_embeddings ve ON kb.id = CAST(ve.content_id AS INTEGER)
        WHERE ve.content_id IS NULL
      `);

      if (documentsWithoutEmbeddings.length === 0) {
        console.log('All documents already have embeddings');
        return;
      }

      console.log(`Generating embeddings for ${documentsWithoutEmbeddings.length} documents...`);

      for (const doc of documentsWithoutEmbeddings) {
        try {
          const embedding = await generateEmbedding(doc.content);
          await storeEmbedding(doc.id.toString(), embedding);
        } catch (error) {
          console.error(`Failed to generate embedding for document ${doc.id}:`, error);
          // Continue with other documents
        }
      }

      console.log('Embeddings generation completed');
    } catch (error) {
      console.error('Error generating embeddings for existing documents:', error);
      throw error;
    }
  }

  // Reset knowledge base completely (for troubleshooting)
  static async resetKnowledgeBase(): Promise<void> {
    try {
      const db = getDatabase();
      console.log('Dropping existing knowledge base tables...');
      await db.runAsync('DROP TABLE IF EXISTS knowledge_base');
      await db.runAsync('DROP TABLE IF EXISTS vector_embeddings');
      console.log('Knowledge base tables dropped');

      // Recreate tables
      console.log('Creating new knowledge base tables...');
      await db.execAsync(`
        CREATE TABLE knowledge_base (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          embedding TEXT,
          metadata TEXT,
          content_type TEXT DEFAULT 'resource',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE vector_embeddings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content_id TEXT NOT NULL,
          embedding TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_vector_embeddings_content_id ON vector_embeddings(content_id);
      `);

      console.log('Knowledge base tables created successfully');
    } catch (error) {
      console.error('Error resetting knowledge base:', error);
      throw error;
    }
  }

  // Clear knowledge base data (for testing/debugging)
  static async clearKnowledgeBase(): Promise<void> {
    try {
      const db = getDatabase();
      await db.runAsync('DELETE FROM knowledge_base');
      await db.runAsync('DELETE FROM vector_embeddings');
      console.log('Knowledge base data cleared');
    } catch (error) {
      console.error('Error clearing knowledge base:', error);
      throw error;
    }
  }
}
