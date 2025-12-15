-- Create LangChain-compatible vector search function
-- This function wraps the RAG search to work with LangChain's SupabaseVectorStore

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
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
    jsonb_build_object(
      'source_id', kc.source_id,
      'chunk_index', kc.chunk_index,
      'source_name', ks.name,
      'domain', ks.domain,
      'title', ks.title
    ) as metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  FROM rag_knowledge_chunks kc
  JOIN rag_knowledge_sources ks ON kc.source_id = ks.id
  WHERE
    ks.processing_status = 'completed'
    AND 1 - (kc.embedding <=> query_embedding) > 0.7
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_documents(vector(1536), int, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents(vector(1536), int, jsonb) TO anon;