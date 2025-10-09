-- Cloud RAG System Migration - Clean SQL Version
-- Execute this in Supabase SQL Editor

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Base Documents Table
CREATE TABLE IF NOT EXISTS public.knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  domain TEXT,
  document_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Embeddings Table
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.knowledge_base_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Memory Table
CREATE TABLE IF NOT EXISTS public.chat_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  memory_key VARCHAR(255) NOT NULL,
  memory_value TEXT NOT NULL,
  strategy VARCHAR(50) NOT NULL DEFAULT 'buffer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, memory_key, strategy)
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  message_index INTEGER NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, message_index)
);

-- User Facts Table
CREATE TABLE IF NOT EXISTS public.user_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  fact TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('preference', 'context', 'history', 'goal', 'constraint')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source VARCHAR(20) NOT NULL CHECK (source IN ('explicit', 'inferred')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Long Term Memory Table
CREATE TABLE IF NOT EXISTS public.user_long_term_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  memory_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_domain ON public.knowledge_base_documents(domain);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id ON public.document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id ON public.chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON public.chat_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_user_facts_user_id ON public.user_facts(user_id);

-- Enable RLS
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_long_term_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to knowledge_base_documents"
  ON public.knowledge_base_documents
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to document_embeddings"
  ON public.document_embeddings
  FOR SELECT
  USING (true);

-- Vector Search Functions
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter_domain TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT
    de.id,
    de.chunk_text as content,
    de.metadata,
    1 - (de.embedding <=> query_embedding) as similarity
  FROM document_embeddings de
  JOIN knowledge_base_documents kbd ON de.document_id = kbd.id
  WHERE (filter_domain IS NULL OR kbd.domain = filter_domain)
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search (
  query_embedding VECTOR(1536),
  query_text TEXT,
  match_count INT DEFAULT 5,
  filter_domain TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  WITH vector_search AS (
    SELECT
      de.id,
      de.chunk_text as content,
      de.metadata,
      1 - (de.embedding <=> query_embedding) as vector_similarity
    FROM document_embeddings de
    JOIN knowledge_base_documents kbd ON de.document_id = kbd.id
    WHERE (filter_domain IS NULL OR kbd.domain = filter_domain)
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  text_search AS (
    SELECT
      de.id,
      de.chunk_text as content,
      de.metadata,
      ts_rank(to_tsvector('english', de.chunk_text), plainto_tsquery('english', query_text)) as text_similarity
    FROM document_embeddings de
    JOIN knowledge_base_documents kbd ON de.document_id = kbd.id
    WHERE (filter_domain IS NULL OR kbd.domain = filter_domain)
      AND to_tsvector('english', de.chunk_text) @@ plainto_tsquery('english', query_text)
    ORDER BY text_similarity DESC
    LIMIT match_count * 2
  )
  SELECT
    COALESCE(vs.id, ts.id) as id,
    COALESCE(vs.content, ts.content) as content,
    COALESCE(vs.metadata, ts.metadata) as metadata,
    (COALESCE(vs.vector_similarity, 0) * 0.6 + COALESCE(ts.text_similarity, 0) * 0.4) as similarity
  FROM vector_search vs
  FULL OUTER JOIN text_search ts ON vs.id = ts.id
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Insert sample knowledge documents
INSERT INTO public.knowledge_base_documents (title, content, source_name, source_url, domain, document_type) VALUES
('FDA 510(k) Submission Guidelines', 'The 510(k) submission is a premarket submission made to FDA to demonstrate that the device to be marketed is at least as safe and effective, that is, substantially equivalent, to a legally marketed device that is not subject to PMA. A 510(k) is required when: 1) You are introducing a device into commercial distribution for the first time; 2) You are introducing a device into commercial distribution for the first time under your own name, even though other persons may have previously introduced the same type of device into commercial distribution; 3) The device you are proposing to market is one that has been significantly changed or modified from a previously cleared device in such a way that could significantly affect the safety or effectiveness of the device.', 'FDA Guidance', 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k', 'regulatory_affairs', 'guidance'),
('ICH E6 Good Clinical Practice Guidelines', 'Good Clinical Practice (GCP) is an international ethical and scientific quality standard for designing, conducting, recording, and reporting trials that involve the participation of human subjects. Compliance with this standard provides public assurance that the rights, safety, and well-being of trial subjects are protected and that the clinical trial data are credible. The objective of this ICH GCP Guideline is to provide a unified standard for the European Union (EU), Japan, and the United States to facilitate the mutual acceptance of clinical data by the regulatory authorities in these jurisdictions.', 'ICH Guidelines', 'https://www.ich.org/page/e6-r2-addendum', 'clinical_development', 'guidance'),
('Pharmacovigilance Risk Management Plan', 'A Risk Management Plan (RMP) is a detailed description of the risk management system for a medicinal product. It describes the known safety profile of the medicinal product, important potential risks, missing information, and the measures that are proposed to be taken to identify, characterize, prevent, or minimize risks relating to the medicinal product. The RMP should be updated throughout the life cycle of the medicinal product as new information becomes available.', 'EMA Guidelines', 'https://www.ema.europa.eu/en/human-regulatory/post-authorisation/pharmacovigilance/risk-management-plans', 'pharmacovigilance', 'guidance')
ON CONFLICT DO NOTHING;
