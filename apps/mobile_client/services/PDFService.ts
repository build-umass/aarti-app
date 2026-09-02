// PDF content is pre-extracted into documents.json at build time because
// native PDF parsing is not practical in React Native/Expo.
import documentsData from '../assets/Resources/documents.json';

export interface PDFDocument {
  filename: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export class PDFService {
  static async loadPDFDocuments(): Promise<PDFDocument[]> {
    try {
      const data = documentsData as { documents: PDFDocument[] };

      if (!data.documents || !Array.isArray(data.documents)) {
        console.warn('Invalid documents.json format - expected { documents: [...] }');
        return [];
      }

      return data.documents.map((doc) => ({
        filename: doc.filename,
        title: doc.title,
        content: doc.content.trim(),
        metadata: doc.metadata,
      }));
    } catch (error) {
      console.error('Error loading PDF documents:', error);
      return [];
    }
  }

  // Create overlapping word chunks for better embedding granularity
  static chunkDocument(content: string, chunkSize: number = 500, overlap: number = 50): string[] {
    const words = content.split(/\s+/).filter((word) => word.length > 0);

    if (words.length === 0) {
      return [];
    }

    if (words.length <= chunkSize) {
      return [content.trim()];
    }

    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words
        .slice(i, Math.min(i + chunkSize, words.length))
        .join(' ')
        .trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      if (i + chunkSize >= words.length) break;
    }

    return chunks;
  }
}
