# RAG Chatbot Setup Guide

## Overview
This mobile client now includes a RAG (Retrieval-Augmented Generation) chatbot powered by Google Gemini API and SQLite vector search.

## Overview
This mobile client now includes a RAG (Retrieval-Augmented Generation) chatbot powered by Google Gemini API and SQLite vector search. The system uses only PDF legal documents from the admin resources folder, excluding quiz content.

## Security & Configuration

Following Expo's best practices, sensitive configuration like API keys is handled through:
- **Environment Variables**: Stored in `.env` file (not committed to git)
- **Dynamic Config**: `app.config.js` loads environment variables at build time
- **Runtime Access**: Available via `Constants.expoConfig.extra` in the app

This approach ensures API keys are never exposed in source code or app bundles.

## Environment Setup

1. **Create Environment File**:
   - Create a `.env` file in the `apps/mobile_client/` directory
   - Add your Gemini API key:
```bash
# Google Gemini API Configuration
EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

2. **Get Google Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Replace `your_actual_gemini_api_key_here` with your real API key

**Security Note**: The API key is loaded through Expo's automatic environment variable system using the `EXPO_PUBLIC_` prefix. This follows Expo's recommended approach for client-side environment variables.

**Important**:
- Make sure `.env` is added to your `.gitignore` file to avoid committing sensitive information to version control
- Expo automatically loads `EXPO_PUBLIC_*` variables from `.env` files at build time
- The API key gets inlined into your app bundle (not recommended for production, but necessary for client-side API calls)

**Add to .gitignore** (if not already present):
```
# Environment variables
.env
.env.local
.env.production
```

### Troubleshooting API Key Issues

If you're getting "Gemini API not configured" errors:

1. **Verify .env file location**: Ensure `.env` file is in the **project root** (`aarti-app/.env`), not `apps/mobile_client/`
2. **Check API key format**: Ensure your key starts with "AIza" (Gemini's API key format)
3. **Restart the development server**: Run `npx expo start --clear` to reload environment variables
4. **Check console logs**: Look for detailed debug messages

**When you restart the app, the console will show**:
```
🔍 DEBUG: EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY loaded: ***SET***
✅ Gemini AI initialized successfully
🔍 Testing Gemini API connection...
✅ Gemini API test successful: Hello
🚀 API key is working! You can now generate embeddings for the documents.
💡 Tip: Call RAGService.generateEmbeddingsForExistingDocuments() to create embeddings
```

**If you see**:
```
🔍 DEBUG: EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY loaded: NOT_SET
❌ Gemini API not configured
```

**Troubleshooting**:
- Ensure `.env` file is in `apps/mobile_client/` directory
- Verify API key starts with `AIzaSy`
- Try `npx expo start --clear` to restart with clean cache
- Check that the `.env` file is not empty or corrupted

### Database Issues

**If you see "Error finalizing statement" errors:**

This usually means there's a database schema or data size issue. The system will automatically reset and recreate tables, but you can also manually reset:

1. **Automatic Reset** - The system now automatically resets the database schema on initialization

2. **Manual Reset** (if needed):
```javascript
// Clear all knowledge base data and recreate tables
RAGService.resetKnowledgeBase().then(() => {
  console.log('Knowledge base reset');
  location.reload(); // Restart the app
});
```

3. **Check logs** - Look for detailed error messages showing exactly where the failure occurs

**Expected successful initialization:**
```
Loading PDF documents...
Found 12 PDF documents ready for processing
🔍 Testing Gemini API connection...
✅ Gemini API test successful: Hello
✅ API key is working! Generating embeddings for documents...
✅ Successfully embedded 12 PDF documents
🚀 Knowledge base fully initialized with embeddings!
```

## Features

### Vector Database
- Uses SQLite with vector extensions for local embeddings storage
- Implements cosine similarity search for document retrieval
- Optimized for mobile performance

### Knowledge Base
- **Legal Documents Only**: PDF content from admin resources is processed and chunked
- **12 Legal Document Types**: Comprehensive coverage of women's rights, child protection, cyber safety, domestic violence, workplace harassment, and legal procedures
- **Intelligent Chunking**: Large documents are split into 800-token chunks with 100-token overlap for optimal retrieval

### Supported Document Types
- Trafficking of Women and Children FAQs
- Stalking FAQ
- PCPNDT FAQs (Pre-natal diagnostic techniques)
- Harassment at Workplace FAQs
- Dowry FAQ
- Domestic Violence FAQ
- Cyber Abuse FAQs
- Child Sexual Abuse FAQs
- Child Marriage FAQs
- Abandonment of Woman by Husband FAQs
- Process of Filing an FIR
- Property Rights of Women in Andhra Pradesh

## Technical Implementation

### Architecture
1. **Document Processing**: PDFs are loaded and chunked into manageable pieces
2. **Embedding Generation**: Google Gemini `text-embedding-004` creates vector representations
3. **Vector Storage**: Embeddings stored in SQLite with efficient indexing
4. **Retrieval**: Cosine similarity search finds most relevant content
5. **Generation**: Gemini 1.5 Flash generates contextual responses

### Free Tier Usage
- Uses `text-embedding-004` (free tier embedding model)
- Uses `gemini-1.5-flash` (free tier LLM)
- Optimized chunking reduces API calls
- Local vector search minimizes latency

### Performance Optimizations
- Document chunking (800 tokens with 100 token overlap)
- Batch processing for embeddings
- Efficient SQLite queries
- Similarity threshold filtering

## Usage

The chatbot will automatically:
1. Load and process all quiz questions on first app launch
2. Index legal PDF documents from the knowledge base
3. Provide context-aware responses based on user queries
4. Fallback to general responses when no relevant context is found

## Future Enhancements

### Turso/libSQL Integration
For cloud-based vector operations:
1. Set up Turso database instance
2. Configure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
3. Update vector-db.ts to use libSQL client
4. Enable cross-device knowledge base synchronization

### Advanced Features
- Real-time document updates
- Multi-language support
- Custom knowledge base management
- Advanced RAG techniques (reranking, hybrid search)

## Troubleshooting

### Common Issues
1. **API Key Not Set**: Ensure `.env` file exists with valid Gemini API key
2. **Knowledge Base Empty**: Check app logs for initialization errors
3. **Slow Responses**: Verify internet connection for Gemini API calls

### Debug Commands
```bash
# Check knowledge base stats
# (Access via RAGService.getKnowledgeBaseStats())

# Clear and reinitialize knowledge base
# (Access via RAGService.clearKnowledgeBase())
```

## Security Notes
- API keys are loaded from environment variables (not committed to code)
- All processing happens locally when possible
- Vector search doesn't expose sensitive document content externally
