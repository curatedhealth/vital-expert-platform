-- Migration: Create match_documents function for vector similarity search
-- Date: 2025-09-30
-- Description: Adds the match_documents function required by LangChain's SupabaseVectorStore

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop function if exists
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int, jsonb);

-- Create the match_documents function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE
    -- Apply similarity threshold
    1 - (dc.embedding <=> query_embedding) > match_threshold
    -- Apply filters if provided
    AND (
      filter = '{}'::jsonb
      OR dc.metadata @> filter
    )
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_documents TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents TO anon;

-- Add comments for documentation
COMMENT ON FUNCTION match_documents IS 'Performs vector similarity search on document_chunks table using cosine similarity';

-- Note: The document_chunks_embedding_idx index will be created in the RAG schema migration
-- when the document_chunks table is created