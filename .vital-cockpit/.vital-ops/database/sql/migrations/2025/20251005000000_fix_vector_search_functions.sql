-- Fix vector search functions for LangChain compatibility
-- LangChain's SupabaseVectorStore expects (query_embedding, filter jsonb, match_count)
-- Not (query_embedding, match_user_id uuid, match_threshold, match_count)

-- Drop old functions
DROP FUNCTION IF EXISTS match_user_memory(vector(1536), UUID, FLOAT, INT);
DROP FUNCTION IF EXISTS match_chat_memory(vector(1536), UUID, FLOAT, INT);

-- Create LangChain-compatible match_user_memory function
CREATE OR REPLACE FUNCTION match_user_memory(
  query_embedding vector(1536),
  filter jsonb DEFAULT '{}'::jsonb,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  embedding vector(1536),
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  filter_user_id uuid;
  match_threshold float;
BEGIN
  -- Extract user_id from filter
  filter_user_id := (filter->>'user_id')::uuid;

  -- Extract threshold from filter (default 0.7)
  match_threshold := COALESCE((filter->>'match_threshold')::float, 0.7);

  -- Return matching rows
  RETURN QUERY
  SELECT
    user_long_term_memory.id,
    user_long_term_memory.content,
    user_long_term_memory.metadata,
    user_long_term_memory.embedding,
    1 - (user_long_term_memory.embedding <=> query_embedding) AS similarity
  FROM user_long_term_memory
  WHERE
    (filter_user_id IS NULL OR user_long_term_memory.user_id = filter_user_id)
    AND 1 - (user_long_term_memory.embedding <=> query_embedding) > match_threshold
  ORDER BY user_long_term_memory.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create LangChain-compatible match_chat_memory function
CREATE OR REPLACE FUNCTION match_chat_memory(
  query_embedding vector(1536),
  filter jsonb DEFAULT '{}'::jsonb,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  embedding vector(1536),
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  filter_session_id uuid;
  match_threshold float;
BEGIN
  -- Extract session_id from filter
  filter_session_id := (filter->>'session_id')::uuid;

  -- Extract threshold from filter (default 0.7)
  match_threshold := COALESCE((filter->>'match_threshold')::float, 0.7);

  -- Return matching rows
  RETURN QUERY
  SELECT
    chat_memory_vectors.id,
    chat_memory_vectors.content,
    chat_memory_vectors.metadata,
    chat_memory_vectors.embedding,
    1 - (chat_memory_vectors.embedding <=> query_embedding) AS similarity
  FROM chat_memory_vectors
  WHERE
    (filter_session_id IS NULL OR chat_memory_vectors.session_id = filter_session_id)
    AND 1 - (chat_memory_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY chat_memory_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_user_memory TO authenticated;
GRANT EXECUTE ON FUNCTION match_user_memory TO anon;
GRANT EXECUTE ON FUNCTION match_chat_memory TO authenticated;
GRANT EXECUTE ON FUNCTION match_chat_memory TO anon;

COMMENT ON FUNCTION match_user_memory IS 'LangChain-compatible vector similarity search for user long-term memory';
COMMENT ON FUNCTION match_chat_memory IS 'LangChain-compatible vector similarity search for chat memory';
