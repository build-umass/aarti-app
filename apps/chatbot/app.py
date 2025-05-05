import pandas as pd
import chromadb
from flask import Flask, request, jsonify
from chromadb.utils import embedding_functions
import os
import time
import random
import logging
import pdfplumber
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Constants
COLLECTION_NAME = "document_logs"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
PDF_DIR = "Resources"  # Directory containing PDF files

def wait_for_chroma():
    """Wait for ChromaDB to be ready"""
    max_retries = 30
    retry_delay = 1  # seconds
    
    for i in range(max_retries):
        try:
            client = chromadb.HttpClient(
                host=os.getenv("CHROMA_HOST", "localhost"),
                port=int(os.getenv("CHROMA_PORT", 8000))
            )
            client.heartbeat()
            print("Successfully connected to ChromaDB")
            return client
        except Exception as e:
            print(f"Waiting for ChromaDB to be ready... (Attempt {i+1}/{max_retries})")
            if i < max_retries - 1:
                time.sleep(retry_delay)
    raise Exception("Could not connect to ChromaDB")

# Initialize ChromaDB client
print("Initializing ChromaDB client...")
client = wait_for_chroma()

# Initialize embedding function
print("Initializing embedding function...")
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=MODEL_NAME
)

def create_collection():
    """Create or get ChromaDB collection with error handling"""
    try:
        # Delete existing collection if it exists
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception as e:
            print(f"No existing collection to delete: {str(e)}")
        
        # Create new collection WITH configuration
        collection = client.create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},  # Optional, depending on server
            embedding_function=None   # HttpClient cannot accept embedding function
        )
        print(f"Created new collection: {COLLECTION_NAME}")
        return collection
    except Exception as e:
        print(f"Error creating collection: {str(e)}")
        raise

# Initialize ChromaDB client
def init_chroma():
    """Initialize ChromaDB client with error handling"""
    try:
        client = chromadb.HttpClient(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port=int(os.getenv("CHROMA_PORT", 8000))
        )
        client.heartbeat()
        logger.info("Successfully connected to ChromaDB")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize ChromaDB: {str(e)}")
        raise

# Initialize embedding function
def init_embedding():
    """Initialize embedding function with error handling"""
    try:
        return embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name=MODEL_NAME
        )
    except Exception as e:
        logger.error(f"Failed to initialize embedding function: {str(e)}")
        raise

try:
    client = init_chroma()
    embedding_function = init_embedding()
except Exception as e:
    logger.error(f"Initialization failed: {str(e)}")
    raise

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "chroma_status": "connected" if client.heartbeat() else "disconnected"
    })

@app.route('/load-data', methods=['POST'])
def load_data():
    """Load data from PDFs into ChromaDB"""
    try:
        # Create collection
        collection = create_collection()
        
        # Get list of PDF files
        pdf_files = list(Path(PDF_DIR).glob("*.pdf"))
        logger.info(f"Found {len(pdf_files)} PDF files")

        # Process each PDF
        documents = []
        metadatas = []
        ids = []

        for pdf_path in pdf_files:
            # Extract text from PDF
            doc_text = extract_text_from_pdf(pdf_path)
            if not doc_text:
                continue

            # Create unique ID from filename
            doc_id = pdf_path.stem.replace(" ", "_").lower()

            # Create metadata
            metadata = {
                "file_name": pdf_path.name,
                "title": pdf_path.stem,
                "file_path": str(pdf_path),
                "type": "legal_faq"
            }

            documents.append(doc_text)
            metadatas.append(metadata)
            ids.append(doc_id)

        embeddings = embedding_function(documents)

        # Add data to collection in smaller batches
        batch_size = 5  # Smaller batch size for larger documents
        for i in range(0, len(documents), batch_size):
            end_idx = min(i + batch_size, len(documents))
            collection.add(
                documents=documents[i:end_idx],
                metadatas=metadatas[i:end_idx],
                ids=ids[i:end_idx],
                embeddings=embeddings[i:end_idx]
            )

        return jsonify({
            "message": "Data loaded successfully",
            "files_processed": len(pdf_files),
            "documents_loaded": len(documents),
            "status": "success"
        }), 200

    except Exception as e:
        logger.error(f"Error loading PDFs: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "details": {
                "pdf_dir": os.path.abspath(PDF_DIR),
                "exists": os.path.exists(PDF_DIR),
                "files_in_directory": os.listdir(PDF_DIR) if os.path.exists(PDF_DIR) else []
            }
        }), 500

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from {pdf_path}: {str(e)}")
        return ""

@app.route('/search', methods=['POST'])
def search():
    """Search for documents based on query"""
    try:
        data = request.json
        query_text = data.get('query', '')
        n_results = data.get('top_k', 5)
        
        collection = client.get_collection(name=COLLECTION_NAME)

        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )

        formatted_results = []
        for i in range(len(results['ids'][0])):
            result = {
                "id": results['ids'][0][i],
                "metadata": results['metadatas'][0][i],
                "document": results['documents'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None
            }
            formatted_results.append(result)

        return jsonify({
            "results": formatted_results,
            "status": "success"
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/add-file', methods=['POST'])
def add_document():
    """Add a new resouce file"""
    try:
        data = request.json
        collection = client.get_collection(name=COLLECTION_NAME)

        # Create document text (NEED TO CHANGE/DISCUSS)
        doc_text = f"{data.get('about', '')} {data.get('skills', '')} {data.get('tags', '')}".strip()

        # Add document to collection
        collection.add(
            documents=[doc_text],
            metadatas=[data],
            ids=[data['resource_id']]
        )

        return jsonify({
            "message": "Document added successfully",
            "status": "success"
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500
    
@app.route('/delete-file/<resource_id>', methods=['DELETE'])
def delete_user(resource_id):
    """Delete a file"""
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
        
        collection.delete(ids=[resource_id])
        
        return jsonify({
            "message": f"User {resource_id} deleted successfully",
            "status": "success"
        }), 200

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

@app.route('/database-stats', methods=['GET'])
def get_database_stats():
    """Return statistics about the database"""
    logger.debug("Accessing database-stats endpoint")
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
        logger.debug(f"Retrieved collection: {COLLECTION_NAME}")
        
        # Get collection stats
        all_results = collection.get()
        total_rows = len(all_results['ids'])
        logger.info(f"Total rows in database: {total_rows}")
        
        return jsonify({
            "total_rows": total_rows,
            "collection_name": COLLECTION_NAME,
            "status": "success"
        }), 200
        
    except Exception as e:
        logger.error(f"Error in database-stats: {str(e)}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500
    
@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify API is working"""
    return jsonify({"status": "API is running"}), 200


if __name__ == '__main__':
    # Add debug output for registered routes
    logger.info("Registered routes:")
    for rule in app.url_map.iter_rules():
        logger.info(f"{rule.endpoint}: {rule.methods} {rule}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)