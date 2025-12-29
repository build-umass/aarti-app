# Next Steps - RAG Chatbot Enhancement Roadmap

This document outlines the planned enhancements for the Aarti RAG chatbot system.

## Current State (v1.0)

✅ **Completed Features:**
- Basic RAG implementation with Gemini API
- SQLite-based vector storage
- Document chunking and embedding
- Cosine similarity search
- Chat UI with typing indicator
- English and Telugu internationalization
- Pre-extracted PDF content in JSON format
- Error handling and fallback responses

## Priority 1: Dynamic PDF Processing from Admin Portal

### Overview

Currently, PDF content is pre-extracted and stored in `documents.json`. The next major enhancement is to enable **real-time PDF parsing** when documents are uploaded from the admin portal.

### Implementation Plan

#### 1. Server-Side PDF Processing (Backend)

Add PDF text extraction capability to the backend:

```bash
# Install pdf-parse in backend
cd apps/backend
npm install pdf-parse
```

**New Endpoint:**
```typescript
// POST /api/resources/upload
// Accepts PDF file, extracts text, stores in MongoDB
```

**Schema Update:**
```typescript
interface Resource {
  _id: ObjectId;
  filename: string;
  title: string;
  content: string;           // Extracted text
  category: string;
  uploadedAt: Date;
  contentHash: string;       // For change detection
  chunkCount: number;
}
```

#### 2. Admin Client Upload UI

Add PDF upload functionality to admin dashboard:

```
apps/admin_client/
├── app/
│   └── resources/
│       ├── page.tsx          # Resource list with upload
│       └── upload/
│           └── page.tsx      # Upload form
├── components/
│   └── PDFUploader.tsx       # Drag-and-drop uploader
```

#### 3. Mobile Client Sync

Add sync mechanism to fetch new documents:

```typescript
// services/SyncService.ts
class SyncService {
  static async syncResources(): Promise<void> {
    // 1. Fetch resources from backend
    // 2. Compare with local documents
    // 3. Download new/updated content
    // 4. Generate embeddings
    // 5. Update knowledge base
  }
}
```

### Files to Create/Modify

| Location | File | Changes |
|----------|------|---------|
| Backend | `controllers/resourceController.ts` | PDF upload endpoint |
| Backend | `services/pdfService.ts` | PDF text extraction |
| Backend | `models/Resource.ts` | Resource schema |
| Admin | `app/resources/page.tsx` | Upload UI |
| Mobile | `services/SyncService.ts` | Resource sync |
| Mobile | `services/PDFService.ts` | Dynamic loading |

---

## Priority 2: Improved Vector Search

### Hybrid Search

Combine vector similarity with keyword matching:

```typescript
async searchDocuments(query: string) {
  const vectorResults = await vectorSearch(query);
  const keywordResults = await keywordSearch(query);
  return mergeAndRank(vectorResults, keywordResults);
}
```

### Re-ranking

Add a re-ranking step for better relevance:

```typescript
async rerank(query: string, documents: Document[]) {
  // Use Gemini to score document relevance
  const scores = await Promise.all(
    documents.map(doc => scoreRelevance(query, doc))
  );
  return documents.sort((a, b) => scores[b] - scores[a]);
}
```

---

## Priority 3: Conversation Memory

### Implementation

Add conversation context for multi-turn dialogues:

```typescript
interface Conversation {
  id: string;
  messages: Message[];
  context: string[];  // Accumulated context
  createdAt: Date;
}

async generateResponse(query: string, conversationId: string) {
  const conversation = await getConversation(conversationId);
  const context = buildContext(conversation, query);
  return await generateRAGResponse(query, context);
}
```

### Storage

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  messages TEXT,  -- JSON array
  context TEXT,   -- JSON array
  created_at TEXT,
  updated_at TEXT
);
```

---

## Priority 4: Multi-language Document Support

### Telugu Document Processing

1. **OCR for Telugu PDFs**: Use Tesseract with Telugu language pack
2. **Telugu Embeddings**: Explore multilingual embedding models
3. **Cross-lingual Search**: Allow English queries on Telugu documents

### Implementation

```typescript
// lib/gemini.ts
async function generateEmbedding(text: string, language: 'en' | 'te') {
  // Use multilingual model for non-English
  const model = language === 'en' 
    ? 'text-embedding-004'
    : 'multilingual-embedding-002';
  // ...
}
```

---

## Priority 5: Performance Optimizations

### Lazy Loading

Load embeddings on-demand instead of at startup:

```typescript
class RAGService {
  private static initialized = false;
  
  static async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeKnowledgeBase();
      this.initialized = true;
    }
  }
}
```

### Caching

Cache frequent queries:

```typescript
const queryCache = new Map<string, CachedResponse>();

async function getCachedResponse(query: string) {
  const hash = hashQuery(query);
  if (queryCache.has(hash)) {
    return queryCache.get(hash);
  }
  const response = await generateResponse(query);
  queryCache.set(hash, { response, timestamp: Date.now() });
  return response;
}
```

### Background Embedding

Process embeddings in background:

```typescript
// Use expo-background-fetch for iOS
// Use WorkManager for Android
async function backgroundEmbedding() {
  const pendingDocs = await getPendingDocuments();
  for (const doc of pendingDocs) {
    await embedDocument(doc);
    await markAsEmbedded(doc.id);
  }
}
```

---

## Priority 6: Analytics and Monitoring

### Query Analytics

Track query patterns for improvement:

```sql
CREATE TABLE query_analytics (
  id INTEGER PRIMARY KEY,
  query TEXT,
  response_time_ms INTEGER,
  documents_used INTEGER,
  user_feedback TEXT,  -- 'helpful' | 'not_helpful' | null
  created_at TEXT
);
```

### Dashboard

Add analytics dashboard to admin client:

- Most common queries
- Average response time
- Document usage statistics
- User feedback summary

---

## Priority 7: Advanced RAG Techniques

### Hypothetical Document Embeddings (HyDE)

Generate hypothetical answer first, then search:

```typescript
async function hydeSearch(query: string) {
  const hypotheticalAnswer = await generateHypotheticalAnswer(query);
  const embedding = await generateEmbedding(hypotheticalAnswer);
  return await searchByEmbedding(embedding);
}
```

### Query Decomposition

Break complex queries into sub-queries:

```typescript
async function decomposeQuery(query: string) {
  const subQueries = await llm.decompose(query);
  const results = await Promise.all(
    subQueries.map(sq => searchDocuments(sq))
  );
  return mergeResults(results);
}
```

---

## Immediate TODOs

### This Week

- [ ] Set up PDF parsing endpoint in backend
- [ ] Create resource upload page in admin client
- [ ] Add sync button to mobile chat screen
- [ ] Write tests for RAGService

### This Month

- [ ] Implement full PDF upload flow
- [ ] Add conversation memory
- [ ] Improve error handling
- [ ] Add user feedback mechanism

### This Quarter

- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Performance optimizations
- [ ] Advanced RAG techniques

---

## Dependencies to Add

### Backend
```json
{
  "pdf-parse": "^1.1.1",
  "multer": "^1.4.5-lts.1"
}
```

### Mobile Client
```json
{
  "@tanstack/react-query": "^5.0.0"  // For data sync
}
```

---

## Testing Plan

### Unit Tests

```typescript
// __tests__/RAGService.test.ts
describe('RAGService', () => {
  it('should add document to knowledge base');
  it('should search similar documents');
  it('should generate response with context');
  it('should fallback on API error');
});
```

### Integration Tests

```typescript
// __tests__/integration/rag-flow.test.ts
describe('RAG Flow', () => {
  it('should load PDFs and generate embeddings');
  it('should answer questions from document context');
});
```

---

## Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

*Last Updated: December 29, 2024*
