-- Create missing vector search functions for Ask Expert
-- Migration: 20250125000000_create_missing_vector_search_functions.sql

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. search_knowledge_by_embedding
-- Used by mode-1-query-automatic
-- Broad search across all knowledge domains
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding vector(1536),
  domain_filter text DEFAULT NULL,
  max_results int DEFAULT 10,
  similarity_threshold float DEFAULT 0.7
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.content,
    kd.metadata,
    1 - (kd.embedding <=> query_embedding) as similarity
  FROM knowledge_documents kd
  WHERE
    (domain_filter IS NULL OR kd.domain = domain_filter)
    AND kd.is_active = true
    AND (1 - (kd.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY kd.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 2. search_knowledge_for_agent
-- Used by mode-2-query-manual and mode-4-chat-manual
-- Agent-specific knowledge search
CREATE OR REPLACE FUNCTION search_knowledge_for_agent(
  query_embedding vector(1536),
  p_agent_id text,
  max_results int DEFAULT 10,
  similarity_threshold float DEFAULT 0.75
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.content,
    kd.metadata,
    1 - (kd.embedding <=> query_embedding) as similarity
  FROM knowledge_documents kd
  WHERE
    kd.agent_id = p_agent_id
    AND kd.is_active = true
    AND (1 - (kd.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY kd.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- 3. hybrid_search
-- Used by mode-3-chat-automatic and mode-5-agent-autonomous
-- Combined vector + keyword search
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(1536),
  query_text text,
  max_results int DEFAULT 10,
  similarity_threshold float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  keyword_score float,
  combined_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.content,
    kd.metadata,
    (1 - (kd.embedding <=> query_embedding)) as similarity,
    ts_rank(to_tsvector('english', kd.content), plainto_tsquery('english', query_text)) as keyword_score,
    (
      (1 - keyword_weight) * (1 - (kd.embedding <=> query_embedding)) +
      keyword_weight * ts_rank(to_tsvector('english', kd.content), plainto_tsquery('english', query_text))
    ) as combined_score
  FROM knowledge_documents kd
  WHERE
    kd.is_active = true
    AND (
      (1 - (kd.embedding <=> query_embedding)) >= similarity_threshold
      OR to_tsvector('english', kd.content) @@ plainto_tsquery('english', query_text)
    )
  ORDER BY combined_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Create knowledge_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}',
  domain text,
  agent_id text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_embedding
  ON knowledge_documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_content_search
  ON knowledge_documents USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain
  ON knowledge_documents(domain) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_agent
  ON knowledge_documents(agent_id) WHERE is_active = true;

-- Add comment
COMMENT ON TABLE knowledge_documents IS 'Stores knowledge base documents with embeddings for Ask Expert vector search';
COMMENT ON FUNCTION search_knowledge_by_embedding IS 'Search knowledge base by embedding similarity (broad search)';
COMMENT ON FUNCTION search_knowledge_for_agent IS 'Search agent-specific knowledge by embedding';
COMMENT ON FUNCTION hybrid_search IS 'Hybrid search combining vector similarity and keyword matching';
