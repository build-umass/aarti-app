import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables (EXPO_PUBLIC_ variables are inlined at build time by Expo)
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY || 'your_api_key_here';

console.log('🔍 DEBUG: EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY loaded:', GEMINI_API_KEY === 'your_api_key_here' ? 'PLACEHOLDER' : (GEMINI_API_KEY ? '***SET***' : 'NOT_SET'));

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error);
  }
}

// Models - Using free tier models
export const embeddingModel = genAI?.getGenerativeModel({ model: 'text-embedding-004' }) || null; // Free tier embedding model
export const textModel = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' }) || null; // Free tier LLM

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!genAI || !embeddingModel) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in .env file (in project root).');
  }

  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Generate text response using RAG context
export async function generateRAGResponse(query: string, context: string[]): Promise<string> {
  if (!genAI || !textModel) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in .env file (in project root).');
  }

  try {
    const contextText = context.join('\n\n');
    const prompt = `
You are a helpful educational assistant for the Aarti learning app. Use the following context to answer the user's question accurately and helpfully.

Context:
${contextText}

User Question: ${query}

Please provide a clear, educational response based on the context provided. If the context doesn't contain relevant information, acknowledge this and provide general guidance.
`;

    const result = await textModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
}

// Simple text generation without RAG
export async function generateSimpleResponse(message: string): Promise<string> {
  if (!genAI || !textModel) {
    return "I'm sorry, I'm not configured yet. Please set EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY in .env file (in project root) to enable AI responses.";
  }

  try {
    const prompt = `
You are a helpful educational assistant for the Aarti learning app, which helps users learn through quizzes and educational content.

User: ${message}

Provide a helpful, educational response that encourages learning and engagement with the app's features.
`;

    const result = await textModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating simple response:', error);
    return "I'm sorry, I encountered an error. Please try again.";
  }
}

// Test function to verify API key is working
export async function testGeminiConnection(): Promise<boolean> {
  if (!genAI || !textModel) {
    console.error('❌ Gemini API not configured');
    return false;
  }

  try {
    const result = await textModel.generateContent('Say "Hello" if you can read this.');
    const response = await result.response.text();
    console.log('✅ Gemini API test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return false;
  }
}
