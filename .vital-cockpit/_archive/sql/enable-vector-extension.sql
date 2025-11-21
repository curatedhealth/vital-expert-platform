-- Enable vector extension for RAG functionality
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is enabled
SELECT extname FROM pg_extension WHERE extname = 'vector';
