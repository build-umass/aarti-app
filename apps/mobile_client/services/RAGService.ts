import { getDatabase } from '../lib/database';
import { generateEmbedding, generateRAGResponse, generateSimpleResponse } from '../lib/gemini';
import { storeEmbedding, searchSimilarEmbeddings } from '../lib/vector-db';
import { PDFService } from './PDFService';

export interface KnowledgeBaseDocument {
  id?: number;
  content: string;
  metadata?: Record<string, unknown>;
  content_type: 'quiz' | 'resource' | 'general';
  created_at?: string;
  similarity?: number;
}

export class RAGService {
  // Add a document to the knowledge base; embeddings are best-effort
  static async addDocument(content: string, contentType: 'quiz' | 'resource' | 'general' = 'general', metadata?: Record<string, unknown>): Promise<void> {
    const db = getDatabase();
    const metadataJson = metadata ? JSON.stringify(metadata) : null;

    const result = await db.runAsync(
      'INSERT INTO knowledge_base (content, metadata, content_type) VALUES (?, ?, ?)',
      [content, metadataJson, contentType]
    );
    const docId = result.lastInsertRowId.toString();

    try {
      const embedding = await generateEmbedding(content);
      await storeEmbedding(docId, embedding);
    } catch (embeddingError) {
      console.warn(`Embedding generation failed for document ${docId}, stored without embeddings:`, embeddingError);
    }
  }

  // Search for similar documents
  static async searchSimilarDocuments(query: string, topK: number = 5, contentType?: 'quiz' | 'resource' | 'general'): Promise<KnowledgeBaseDocument[]> {
    const queryEmbedding = await generateEmbedding(query);
    const similarEmbeddings = await searchSimilarEmbeddings(queryEmbedding, topK * 2);

    if (similarEmbeddings.length === 0) {
      return [];
    }

    const contentIds = similarEmbeddings.map(e => e.content_id);
    const placeholders = contentIds.map(() => '?').join(',');
    let queryString = `SELECT * FROM knowledge_base WHERE id IN (${placeholders})`;

    if (contentType) {
      queryString += ' AND content_type = ?';
    }

    const params = contentType ? [...contentIds, contentType] : contentIds;

    const documents = await getDatabase().getAllAsync<{
      id: number;
      content: string;
      metadata: string | null;
      content_type: string;
      created_at: string;
    }>(queryString, params);

    return documents
      .map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
        content_type: doc.content_type as 'quiz' | 'resource' | 'general',
        created_at: doc.created_at,
        similarity: similarEmbeddings.find(e => e.content_id === doc.id.toString())?.similarity ?? 0
      }))
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
      .slice(0, topK);
  }

  // Generate RAG response for a user query, falling back to plain generation
  static async generateResponse(userQuery: string): Promise<string> {
    try {
      const db = getDatabase();
      const docCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM knowledge_base');

      if ((docCount?.count ?? 0) === 0) {
        return await generateSimpleResponse(userQuery);
      }

      const relevantDocs = await this.searchSimilarDocuments(userQuery, 3);

      if (relevantDocs.length === 0 || (relevantDocs[0]?.similarity ?? 0) < 0.3) {
        return await generateSimpleResponse(userQuery);
      }

      return await generateRAGResponse(userQuery, relevantDocs.map(doc => doc.content));
    } catch (error) {
      console.error('Error generating RAG response:', error);
      return await generateSimpleResponse(userQuery);
    }
  }

  // Initialize knowledge base with PDF documents (no-op if already populated)
  static async initializeKnowledgeBase(): Promise<void> {
    const db = getDatabase();

    const existingDocs = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM knowledge_base'
    );

    if ((existingDocs?.count ?? 0) > 0) {
      await this.generateEmbeddingsForExistingDocuments();
      return;
    }

    const pdfDocuments = await PDFService.loadPDFDocuments();

    for (const pdfDoc of pdfDocuments) {
      try {
        await this.addChunkedDocument(pdfDoc);
      } catch (docError) {
        console.error(`Error storing document ${pdfDoc.filename}:`, docError);
      }
    }
  }

  private static async addChunkedDocument(pdfDoc: { content: string; metadata?: Record<string, unknown>; filename: string; title: string }): Promise<void> {
    const chunks = PDFService.chunkDocument(pdfDoc.content, 500, 50);
    const maxChunks = Math.min(chunks.length, 20);

    for (let i = 0; i < maxChunks; i++) {
      await this.addDocument(chunks[i], 'resource', {
        ...pdfDoc.metadata,
        filename: pdfDoc.filename,
        title: pdfDoc.title,
        chunk_index: i,
        total_chunks: chunks.length,
        document_type: 'pdf'
      });
    }
  }

  // Generate embeddings for documents that were stored without one
  static async generateEmbeddingsForExistingDocuments(): Promise<void> {
    const db = getDatabase();

    const documentsWithoutEmbeddings = await db.getAllAsync<{ id: number; content: string }>(`
      SELECT kb.id, kb.content
      FROM knowledge_base kb
      LEFT JOIN vector_embeddings ve ON kb.id = CAST(ve.content_id AS INTEGER)
      WHERE ve.content_id IS NULL
    `);

    for (const doc of documentsWithoutEmbeddings) {
      try {
        const embedding = await generateEmbedding(doc.content);
        await storeEmbedding(doc.id.toString(), embedding);
      } catch (error) {
        console.error(`Failed to generate embedding for document ${doc.id}:`, error);
      }
    }
  }
}
