-- Drop existing match_documents functions
DROP FUNCTION IF EXISTS match_documents(vector(1536), int, jsonb);
DROP FUNCTION IF EXISTS match_documents(vector(1536), double precision, int, jsonb);

-- Create match_documents function with LangChain's expected parameter order
-- LangChain calls: match_documents(filter, match_count, query_embedding)
CREATE OR REPLACE FUNCTION match_documents(
  filter jsonb DEFAULT '{}'::jsonb,
  match_count int DEFAULT 10,
  query_embedding vector(1536) DEFAULT NULL
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
  -- If no embedding provided, return empty result
  IF query_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    jsonb_build_object(
      'source_id', kc.source_id,
      'chunk_index', kc.chunk_index,
      'source_name', ks.name,
      'domain', ks.domain,
      'title', ks.title,
      'file_path', ks.file_path,
      'mime_type', ks.mime_type
    ) as metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  FROM rag_knowledge_chunks kc
  JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
  WHERE
    ks.processing_status = 'completed'
    AND 1 - (kc.embedding <=> query_embedding) > 0.5
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_documents(jsonb, int, vector(1536)) TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents(jsonb, int, vector(1536)) TO anon;
GRANT EXECUTE ON FUNCTION match_documents(jsonb, int, vector(1536)) TO service_role;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_embedding
ON rag_knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);