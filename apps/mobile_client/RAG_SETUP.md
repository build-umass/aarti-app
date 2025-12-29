# RAG Chatbot Setup Guide

## Overview

This mobile client includes a RAG (Retrieval-Augmented Generation) chatbot powered by **Google Gemini API** and **SQLite vector search**. The system uses PDF legal documents from the assets folder, providing context-aware responses to user questions about legal rights and procedures.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAG Chatbot Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Query → Generate Embedding → Vector Search → Context      │
│       ↓                                                         │
│  Context + Query → Gemini LLM → Response → User                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | File | Description |
|-----------|------|-------------|
| **RAG Service** | `services/RAGService.ts` | Main orchestration service for document embedding and response generation |
| **PDF Service** | `services/PDFService.ts` | Loads and chunks PDF document content from JSON |
| **Gemini Integration** | `lib/gemini.ts` | Google Gemini API integration for embeddings and LLM responses |
| **Vector DB** | `lib/vector-db.ts` | SQLite-based vector storage and similarity search |
| **Chat UI** | `components/ChatScreen.tsx` | Chat interface with typing indicator |

## Security & Configuration

Following Expo's best practices, sensitive configuration like API keys is handled through:
- **Environment Variables**: Stored in `.env` file (not committed to git)
- **Dynamic Config**: `app.config.js` loads environment variables at build time
- **Runtime Access**: Available via `Constants.expoConfig.extra` in the app

This approach ensures API keys are never exposed in source code or app bundles.

## Environment Setup

### 1. Create Environment File

Create a `.env` file in the `apps/mobile_client/` directory:

```bash
# Google Gemini API Configuration
EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 2. Get Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Replace `your_actual_gemini_api_key_here` with your real API key

### 3. Add to .gitignore

Ensure `.env` is in your `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production
```

## Document Processing

### How Documents Are Loaded

Since React Native/Expo doesn't have native PDF parsing support, we use a **pre-extracted JSON approach**:

1. **PDF text is extracted** and stored in `assets/Resources/documents.json`
2. **PDFService.ts** loads documents from this JSON file at runtime
3. **RAGService.ts** chunks and embeds these documents for vector search

### Document Files

```
assets/Resources/
├── documents.json              # Pre-extracted text from PDFs
├── Trafficking of Women and Children FAQs.docx.pdf
├── Stalking FAQ.docx.pdf
├── PCPNDT FAQs.docx.pdf
├── Harassment at workplace FAQs.docx.pdf
├── Dowry - FAQ.docx.pdf
├── Domestic Violence FAQ.docx.pdf
├── Cyber Abuse FAQs.docx.pdf
├── Child Sexual Abuse FAQs.docx.pdf
├── Child Marriage FAQs.docx.pdf
├── Abandonment_of_a_Woman_by_Husband_FAQs.pdf
├── Note on Process of Filing an FIR.docx.pdf
└── Note on - Property Rights of Women in Andhra Pradesh.docx.pdf
```

### Supported Document Categories

| Category | Topics Covered |
|----------|---------------|
| **Human Rights** | Trafficking of Women and Children |
| **Violence** | Stalking, Domestic Violence, Cyber Abuse |
| **Child Protection** | Child Sexual Abuse, Child Marriage, POCSO |
| **Workplace Rights** | Harassment at Workplace |
| **Marriage Rights** | Dowry, Abandonment by Husband |
| **Legal Procedures** | Filing an FIR |
| **Property Rights** | Women's Property Rights in AP |
| **Health Rights** | PCPNDT (Sex Selection) |

## Technical Implementation

### Embedding Generation

```typescript
// Embeddings are generated using Gemini's text-embedding-004 model
const embedding = await generateEmbedding(documentContent);
// Returns a 768-dimensional vector
```

### Document Chunking

Large documents are chunked for better retrieval:
- **Chunk size**: 500 words
- **Overlap**: 50 words
- **Max chunks per document**: 20

```typescript
const chunks = PDFService.chunkDocument(content, 500, 50);
```

### Vector Similarity Search

```typescript
// Cosine similarity is used to find relevant documents
const relevantDocs = await RAGService.searchSimilarDocuments(query, topK);
```

### Response Generation

```typescript
// RAG response with context
const response = await RAGService.generateResponse(userQuery);
// Falls back to simple response if no relevant context found
```

## Chat UI Features

### Typing Indicator

The chat shows a smooth animated typing indicator while Aarti is generating a response:

- Three bouncing dots animation using `react-native-reanimated`
- Input is disabled while response is being generated
- Auto-scroll to latest message

### Internationalization

Chat messages are fully internationalized:
- **English** (`locales/en/chat.json`)
- **Telugu** (`locales/te/chat.json`)

Translation keys:
- `initial_message`: Welcome message from Aarti
- `input_placeholder`: Input field placeholder
- `thinking_placeholder`: Shown while generating response
- `error_message`: Fallback error message

## Free Tier Usage

The implementation is optimized for Google's free tier:

| Feature | Model | Free Tier Limit |
|---------|-------|-----------------|
| Embeddings | `text-embedding-004` | 1,500 requests/min |
| Chat | `gemini-1.5-flash` | 15 requests/min |

## Troubleshooting

### API Key Issues

If you see `"Gemini API not configured"` errors:

1. **Verify .env file location**: Ensure `.env` is in `apps/mobile_client/`
2. **Check API key format**: Gemini keys start with `AIzaSy`
3. **Restart dev server**: Run `npx expo start --clear`
4. **Check console logs**: Look for debug messages

**Expected successful output:**
```
🔍 DEBUG: EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY loaded: ***SET***
✅ Gemini AI initialized successfully
🔍 Testing Gemini API connection...
✅ Gemini API test successful
Loaded 12 PDF documents from documents.json
✅ Successfully embedded 12 PDF documents
🚀 Knowledge base fully initialized with embeddings!
```

### Database Issues

If you see database errors:

```javascript
// Reset knowledge base
await RAGService.resetKnowledgeBase();
```

### Variable Scoping Errors

The `"result is not defined"` error was fixed by properly scoping the database result variable in `RAGService.addDocument()`.

## Debug Commands

```javascript
// Get knowledge base statistics
const stats = await RAGService.getKnowledgeBaseStats();
console.log(stats);

// Get document statistics
const docStats = await PDFService.getDocumentStats();
console.log(docStats);

// Reset knowledge base (for troubleshooting)
await RAGService.resetKnowledgeBase();

// Clear knowledge base data
await RAGService.clearKnowledgeBase();
```

## Database Schema

### knowledge_base table
```sql
CREATE TABLE knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  embedding TEXT,
  metadata TEXT,
  content_type TEXT DEFAULT 'resource',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### vector_embeddings table
```sql
CREATE TABLE vector_embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id TEXT NOT NULL,
  embedding TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

- API keys are loaded from environment variables (not committed to code)
- All processing happens locally when possible
- Vector search doesn't expose sensitive document content externally
- Embeddings are stored locally in SQLite

## Related Files

| File | Purpose |
|------|---------|
| `services/RAGService.ts` | Main RAG orchestration |
| `services/PDFService.ts` | Document loading and chunking |
| `lib/gemini.ts` | Gemini API integration |
| `lib/vector-db.ts` | Vector storage and search |
| `lib/database.ts` | SQLite database initialization |
| `components/ChatScreen.tsx` | Chat UI with typing indicator |
| `components/TypingIndicator.tsx` | Animated loading dots |
| `components/MessageBubble.tsx` | Chat message display |
| `components/InputBar.tsx` | Chat input with disabled state |
| `assets/Resources/documents.json` | Pre-extracted PDF content |
| `locales/en/chat.json` | English translations |
| `locales/te/chat.json` | Telugu translations |
