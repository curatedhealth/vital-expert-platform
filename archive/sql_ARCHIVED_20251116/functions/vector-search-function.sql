-- Vector search function for knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  title varchar,
  content text,
  content_type varchar,
  source varchar,
  source_url text,
  tags text[],
  metadata jsonb,
  is_public boolean,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.content_type,
    kb.source,
    kb.source_url,
    kb.tags,
    kb.metadata,
    kb.is_public,
    kb.created_by,
    kb.created_at,
    kb.updated_at,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index on embedding column for faster similarity search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx
ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative function that works without vector extension (using JSONB)
CREATE OR REPLACE FUNCTION search_knowledge_base_json(
  query_terms text,
  match_count int DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  title varchar,
  content text,
  content_type varchar,
  source varchar,
  source_url text,
  tags text[],
  metadata jsonb,
  is_public boolean,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.content_type,
    kb.source,
    kb.source_url,
    kb.tags,
    kb.metadata,
    kb.is_public,
    kb.created_by,
    kb.created_at,
    kb.updated_at,
    0.8::float AS similarity  -- Mock similarity score
  FROM knowledge_base kb
  WHERE
    kb.content ILIKE '%' || query_terms || '%' OR
    kb.title ILIKE '%' || query_terms || '%' OR
    EXISTS (
      SELECT 1 FROM unnest(kb.tags) AS tag
      WHERE tag ILIKE '%' || query_terms || '%'
    )
  ORDER BY
    CASE
      WHEN kb.title ILIKE '%' || query_terms || '%' THEN 1
      WHEN kb.content ILIKE '%' || query_terms || '%' THEN 2
      ELSE 3
    END,
    kb.created_at DESC
  LIMIT match_count;
END;
$$;