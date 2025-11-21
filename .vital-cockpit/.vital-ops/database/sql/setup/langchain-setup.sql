-- LangChain Supabase Vector Store Setup
-- This SQL creates the necessary table and function for LangChain's SupabaseVectorStore

-- Create the table for LangChain document chunks
CREATE TABLE IF NOT EXISTS document_chunks_langchain (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- Create an index on the embedding column for faster similarity search
CREATE INDEX IF NOT EXISTS document_chunks_langchain_embedding_idx
ON document_chunks_langchain USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create the similarity search function that LangChain expects
CREATE OR REPLACE FUNCTION match_documents_langchain(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT NULL,
  filter JSONB DEFAULT '{}'
) RETURNS TABLE(
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    document_chunks_langchain.id,
    document_chunks_langchain.content,
    document_chunks_langchain.metadata,
    (document_chunks_langchain.embedding <#> query_embedding) * -1 AS similarity
  FROM document_chunks_langchain
  WHERE (
    filter = '{}'::jsonb OR
    document_chunks_langchain.metadata @> filter
  )
  ORDER BY document_chunks_langchain.embedding <#> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON document_chunks_langchain TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE document_chunks_langchain_id_seq TO postgres, anon, authenticated, service_role;