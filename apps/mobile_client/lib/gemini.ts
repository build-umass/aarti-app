import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY || '';

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const EMBEDDING_MODEL = 'gemini-embedding-001';
const TEXT_MODEL = 'gemini-flash-latest';
const EMBEDDING_DIMENSIONS = 768;

// The embedding model defines the vector space. When this constant changes,
// stored embeddings become incompatible; RAGService re-seeds the knowledge
// base based on the model recorded in the rag_meta table.
export const EMBEDDING_MODEL_ID = EMBEDDING_MODEL;

const NOT_CONFIGURED_ERROR =
  'Gemini API key not configured. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in .env file (in project root).';

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!ai) {
    throw new Error(NOT_CONFIGURED_ERROR);
  }

  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const values = result.embeddings?.[0]?.values;

  if (!values || values.length === 0) {
    throw new Error('Gemini returned no embedding values');
  }

  return values;
}

// Generate text response using RAG context
export async function generateRAGResponse(query: string, context: string[]): Promise<string> {
  if (!ai) {
    throw new Error(NOT_CONFIGURED_ERROR);
  }

  const contextText = context.join('\n\n');
  const prompt = `
You are a helpful educational assistant for the Aarti learning app. Use the following context to answer the user's question accurately and helpfully.

Context:
${contextText}

User Question: ${query}

Please provide a clear, educational response based on the context provided. If the context doesn't contain relevant information, acknowledge this and provide general guidance.
`;

  const result = await ai.models.generateContent({ model: TEXT_MODEL, contents: prompt });
  return result.text ?? '';
}

// Simple text generation without RAG context
export async function generateSimpleResponse(message: string): Promise<string> {
  if (!ai) {
    return "I'm sorry, I'm not configured yet. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in .env file (in project root) to enable AI responses.";
  }

  try {
    const prompt = `
You are a helpful educational assistant for the Aarti learning app, which helps users learn through quizzes and educational content.

User: ${message}

Provide a helpful, educational response that encourages learning and engagement with the app's features.
`;

    const result = await ai.models.generateContent({ model: TEXT_MODEL, contents: prompt });
    return result.text ?? '';
  } catch (error) {
    console.error('Error generating simple response:', error);
    return "I'm sorry, I encountered an error. Please try again.";
  }
}
