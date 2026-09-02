import { getDatabase } from './database';

// Store embedding for a document
export const storeEmbedding = async (contentId: string, embedding: number[]): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO vector_embeddings (content_id, embedding) VALUES (?, ?)',
    [contentId, JSON.stringify(embedding)]
  );
};

// Search for similar embeddings using cosine similarity
export const searchSimilarEmbeddings = async (
  queryEmbedding: number[],
  topK: number = 5
): Promise<{ content_id: string; similarity: number }[]> => {
  const db = getDatabase();

  const embeddings = await db.getAllAsync<{
    content_id: string;
    embedding: string;
  }>('SELECT content_id, embedding FROM vector_embeddings');

  return embeddings
    .map((row) => ({
      content_id: row.content_id,
      similarity: cosineSimilarity(queryEmbedding, JSON.parse(row.embedding) as number[]),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
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
