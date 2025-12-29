// PDF processing service for loading and parsing PDF documents
// Uses pre-extracted text content from JSON for mobile compatibility

import documentsData from '../assets/Resources/documents.json';

export interface PDFDocument {
  filename: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

interface DocumentsJSON {
  documents: Array<{
    filename: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
}

export class PDFService {
  /**
   * Load PDF documents from the pre-extracted JSON file
   * 
   * Note: In React Native/Expo, directly parsing PDF files is challenging
   * because native PDF parsing libraries aren't well-supported. The recommended
   * approach is to pre-extract text content from PDFs and store them in a JSON
   * file that can be bundled with the app.
   * 
   * The documents.json file contains the extracted text from all PDF files in
   * the assets/Resources directory.
   */
  static async loadPDFDocuments(): Promise<PDFDocument[]> {
    try {
      // Load documents from the bundled JSON file
      const data = documentsData as DocumentsJSON;

      if (!data.documents || !Array.isArray(data.documents)) {
        console.warn('Invalid documents.json format - expected { documents: [...] }');
        return [];
      }

      console.log(`Loaded ${data.documents.length} PDF documents from documents.json`);

      // Map to PDFDocument interface
      const pdfDocuments: PDFDocument[] = data.documents.map(doc => ({
        filename: doc.filename,
        title: doc.title,
        content: doc.content.trim(),
        metadata: doc.metadata
      }));

      return pdfDocuments;
    } catch (error) {
      console.error('Error loading PDF documents:', error);
      // Return empty array on error to allow app to continue
      return [];
    }
  }

  /**
   * Process and chunk large documents for better embedding and retrieval
   * 
   * Chunking improves RAG performance by:
   * 1. Creating more focused context for each embedding
   * 2. Enabling more precise retrieval of relevant sections
   * 3. Keeping chunk sizes within model token limits
   * 
   * @param content - The full document content to chunk
   * @param chunkSize - Target number of words per chunk (default: 500)
   * @param overlap - Number of words to overlap between chunks (default: 50)
   * @returns Array of text chunks
   */
  static chunkDocument(content: string, chunkSize: number = 500, overlap: number = 50): string[] {
    // Split by whitespace while preserving paragraph structure
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const chunks: string[] = [];

    if (words.length === 0) {
      return [];
    }

    // If content is smaller than chunk size, return as single chunk
    if (words.length <= chunkSize) {
      return [content.trim()];
    }

    // Create overlapping chunks
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunkWords = words.slice(i, Math.min(i + chunkSize, words.length));
      const chunk = chunkWords.join(' ').trim();

      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Break if we've covered the entire content
      if (i + chunkSize >= words.length) break;
    }

    return chunks;
  }

  /**
   * Get document statistics for debugging
   */
  static async getDocumentStats(): Promise<{
    totalDocuments: number;
    documentsByCategory: Record<string, number>;
    totalContentLength: number;
  }> {
    const documents = await this.loadPDFDocuments();

    const documentsByCategory: Record<string, number> = {};
    let totalContentLength = 0;

    documents.forEach(doc => {
      const category = doc.metadata?.category || 'uncategorized';
      documentsByCategory[category] = (documentsByCategory[category] || 0) + 1;
      totalContentLength += doc.content.length;
    });

    return {
      totalDocuments: documents.length,
      documentsByCategory,
      totalContentLength
    };
  }
}
