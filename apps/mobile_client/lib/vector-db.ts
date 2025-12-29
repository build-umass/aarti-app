import { createClient } from '@libsql/client';
import { getDatabase } from './database';
import { generateEmbedding } from './gemini';

// libSQL client for vector operations
let vectorClient: any = null;

// Initialize vector database
export const initializeVectorDB = async () => {
  // For now, we'll use local SQLite with vector search
  // In the future, this can be upgraded to Turso/libSQL
  const db = getDatabase();

  try {
    // Create vector search tables
    await db.execAsync(`
      -- Install sqlite-vss extension if available
      -- Note: sqlite-vss provides vector similarity search

      -- Vector embeddings table
      CREATE TABLE IF NOT EXISTS vector_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_id TEXT NOT NULL, -- Reference to knowledge_base.id
        embedding TEXT NOT NULL, -- JSON array of float values
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_vector_embeddings_content_id ON vector_embeddings(content_id);
    `);

    console.log('Vector database initialized successfully');
  } catch (error) {
    console.error('Error initializing vector database:', error);
    throw error;
  }
};

// Store embedding for a document
export const storeEmbedding = async (contentId: string, embedding: number[]): Promise<void> => {
  const db = getDatabase();

  try {
    const embeddingJson = JSON.stringify(embedding);
    console.log(`Storing embedding for contentId ${contentId}: ${embeddingJson.length} chars`);

    await db.runAsync(
      'INSERT OR REPLACE INTO vector_embeddings (content_id, embedding) VALUES (?, ?)',
      [contentId, embeddingJson]
    );
    console.log(`Embedding stored successfully for contentId ${contentId}`);
  } catch (error) {
    console.error(`Error storing embedding for contentId ${contentId}:`, error);
    throw error;
  }
};

// Search for similar embeddings using cosine similarity
export const searchSimilarEmbeddings = async (
  queryEmbedding: number[],
  topK: number = 5
): Promise<Array<{ content_id: string; similarity: number; embedding: number[] }>> => {
  const db = getDatabase();

  try {
    // Get all embeddings
    const embeddings = await db.getAllAsync<{
      content_id: string;
      embedding: string;
    }>('SELECT content_id, embedding FROM vector_embeddings');

    // Calculate cosine similarity for each embedding
    const similarities = embeddings.map(row => {
      const embedding = JSON.parse(row.embedding) as number[];
      const similarity = cosineSimilarity(queryEmbedding, embedding);

      return {
        content_id: row.content_id,
        similarity: similarity,
        embedding: embedding
      };
    });

    // Sort by similarity (descending) and return top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);

  } catch (error) {
    console.error('Error searching similar embeddings:', error);
    throw error;
  }
};

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

// Clean up embeddings for a content ID
export const removeEmbeddings = async (contentId: string): Promise<void> => {
  const db = getDatabase();

  try {
    await db.runAsync('DELETE FROM vector_embeddings WHERE content_id = ?', [contentId]);
  } catch (error) {
    console.error('Error removing embeddings:', error);
    throw error;
  }
};

// Get vector database statistics
export const getVectorStats = async (): Promise<{ total_embeddings: number } > => {
  const db = getDatabase();

  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM vector_embeddings'
    );
    return { total_embeddings: result?.count || 0 };
  } catch (error) {
    console.error('Error getting vector stats:', error);
    return { total_embeddings: 0 };
  }
};
