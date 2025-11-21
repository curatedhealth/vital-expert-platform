-- Fix match_documents function to use rag_knowledge_chunks instead of document_chunks
-- Date: 2025-09-30

-- Drop the old function
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int, jsonb);

-- Create the corrected match_documents function for vector similarity search
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
    kc.id,
    kc.content,
    kc.medical_context as metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  FROM rag_knowledge_chunks kc
  WHERE
    -- Apply similarity threshold
    1 - (kc.embedding <=> query_embedding) > match_threshold
    -- Apply filters if provided (using medical_context as metadata)
    AND (
      filter = '{}'::jsonb
      OR kc.medical_context @> filter
    )
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_documents TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents TO anon;

-- Add comment
COMMENT ON FUNCTION match_documents IS 'Performs vector similarity search on rag_knowledge_chunks table using cosine similarity';