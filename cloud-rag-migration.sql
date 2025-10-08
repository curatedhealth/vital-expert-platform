-- Cloud RAG System Migration
-- Creates comprehensive RAG and Vector Database system in cloud Supabase

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Domains Table
CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  tier INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 1,
  keywords TEXT[] DEFAULT '{}',
  sub_domains TEXT[] DEFAULT '{}',
  agent_count_estimate INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Documents
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

-- Document Embeddings (Vector Store)
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.knowledge_base_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Memory
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

-- Chat History
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  message_index INTEGER NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, message_index)
);

-- User Facts (Long-term Memory)
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

-- User Long Term Memory
CREATE TABLE IF NOT EXISTS public.user_long_term_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  memory_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_slug ON public.knowledge_domains(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_tier ON public.knowledge_domains(tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON public.knowledge_domains(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_active ON public.knowledge_domains(is_active);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id ON public.document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_domain ON public.knowledge_base_documents(domain);

CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id ON public.chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON public.chat_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_user_facts_user_id ON public.user_facts(user_id);

-- Enable RLS
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_long_term_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow public read access to knowledge_domains" ON public.knowledge_domains;
CREATE POLICY "Allow public read access to knowledge_domains"
  ON public.knowledge_domains
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to knowledge_base_documents" ON public.knowledge_base_documents;
CREATE POLICY "Allow public read access to knowledge_base_documents"
  ON public.knowledge_base_documents
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read access to document_embeddings" ON public.document_embeddings;
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

-- Hybrid search function (Vector + BM25)
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

-- Insert 30 Knowledge Domains
INSERT INTO public.knowledge_domains (code, name, slug, tier, priority, color, agent_count_estimate) VALUES
-- Tier 1: Core Domains (15)
('REG_AFFAIRS', 'Regulatory Affairs', 'regulatory_affairs', 1, 1, '#3B82F6', 85),
('CLIN_DEV', 'Clinical Development', 'clinical_development', 1, 2, '#8B5CF6', 37),
('PV', 'Pharmacovigilance', 'pharmacovigilance', 1, 3, '#EF4444', 25),
('QM', 'Quality Management', 'quality_management', 1, 4, '#10B981', 20),
('MED_AFF', 'Medical Affairs', 'medical_affairs', 1, 5, '#F59E0B', 15),
('COMM_STRAT', 'Commercial Strategy', 'commercial_strategy', 1, 6, '#F97316', 29),
('DRUG_DEV', 'Drug Development', 'drug_development', 1, 7, '#84CC16', 39),
('CLIN_DATA', 'Clinical Data Analytics', 'clinical_data_analytics', 1, 8, '#06B6D4', 18),
('MFG_OPS', 'Manufacturing Operations', 'manufacturing_operations', 1, 9, '#8B5CF6', 17),
('MED_DEV', 'Medical Devices', 'medical_devices', 1, 10, '#EC4899', 12),
('DIGITAL_HEALTH', 'Digital Health', 'digital_health', 1, 11, '#14B8A6', 34),
('SUPPLY_CHAIN', 'Supply Chain', 'supply_chain', 1, 12, '#6366F1', 15),
('LEGAL_COMP', 'Legal & Compliance', 'legal_compliance', 1, 13, '#A855F7', 10),
('HEOR', 'Health Economics', 'health_economics', 1, 14, '#F43F5E', 12),
('BIZ_STRAT', 'Business Strategy', 'business_strategy', 1, 15, '#0EA5E9', 10),

-- Tier 2: Specialized Domains (10)
('PROD_LABEL', 'Product Labeling', 'product_labeling', 2, 16, '#22C55E', 8),
('POST_MKT', 'Post-Market Activities', 'post_market_activities', 2, 17, '#EAB308', 10),
('CDX', 'Companion Diagnostics', 'companion_diagnostics', 2, 18, '#DC2626', 6),
('NONCLIN_SCI', 'Nonclinical Sciences', 'nonclinical_sciences', 2, 19, '#7C3AED', 12),
('PATIENT_ENG', 'Patient Engagement', 'patient_focus', 2, 20, '#DB2777', 5),
('RISK_MGMT', 'Risk Management', 'risk_management', 2, 21, '#059669', 8),
('SCI_PUB', 'Scientific Publications', 'scientific_publications', 2, 22, '#0891B2', 7),
('KOL_ENG', 'KOL & Stakeholder Engagement', 'stakeholder_engagement', 2, 23, '#BE185D', 6),
('EVID_GEN', 'Evidence Generation', 'evidence_generation', 2, 24, '#0D9488', 5),
('GLOBAL_ACCESS', 'Global Market Access', 'global_access', 2, 25, '#7C2D12', 8),

-- Tier 3: Emerging Domains (5)
('RWD', 'Real-World Data & Evidence', 'real_world_data', 3, 26, '#1E40AF', 8),
('PRECISION_MED', 'Precision Medicine', 'precision_medicine', 3, 27, '#7C2D12', 6),
('TELEMEDICINE', 'Telemedicine & Remote Care', 'telemedicine', 3, 28, '#BE185D', 5),
('SUSTAINABILITY', 'Sustainability & ESG', 'sustainability', 3, 29, '#059669', 3),
('RARE_DISEASES', 'Rare Diseases & Orphan Drugs', 'rare_diseases', 3, 30, '#DC2626', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample knowledge documents
INSERT INTO public.knowledge_base_documents (title, content, source_name, source_url, domain, document_type) VALUES
('FDA 510(k) Submission Guidelines', 'The 510(k) submission is a premarket submission made to FDA to demonstrate that the device to be marketed is at least as safe and effective, that is, substantially equivalent, to a legally marketed device that is not subject to PMA. A 510(k) is required when: 1) You are introducing a device into commercial distribution for the first time; 2) You are introducing a device into commercial distribution for the first time under your own name, even though other persons may have previously introduced the same type of device into commercial distribution; 3) The device you are proposing to market is one that has been significantly changed or modified from a previously cleared device in such a way that could significantly affect the safety or effectiveness of the device.', 'FDA Guidance', 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k', 'regulatory_affairs', 'guidance'),
('ICH E6 Good Clinical Practice Guidelines', 'Good Clinical Practice (GCP) is an international ethical and scientific quality standard for designing, conducting, recording, and reporting trials that involve the participation of human subjects. Compliance with this standard provides public assurance that the rights, safety, and well-being of trial subjects are protected and that the clinical trial data are credible. The objective of this ICH GCP Guideline is to provide a unified standard for the European Union (EU), Japan, and the United States to facilitate the mutual acceptance of clinical data by the regulatory authorities in these jurisdictions.', 'ICH Guidelines', 'https://www.ich.org/page/e6-r2-addendum', 'clinical_development', 'guidance'),
('Pharmacovigilance Risk Management Plan', 'A Risk Management Plan (RMP) is a detailed description of the risk management system for a medicinal product. It describes the known safety profile of the medicinal product, important potential risks, missing information, and the measures that are proposed to be taken to identify, characterize, prevent, or minimize risks relating to the medicinal product. The RMP should be updated throughout the life cycle of the medicinal product as new information becomes available.', 'EMA Guidelines', 'https://www.ema.europa.eu/en/human-regulatory/post-authorisation/pharmacovigilance/risk-management-plans', 'pharmacovigilance', 'guidance')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_knowledge_domains_updated_at ON public.knowledge_domains;
CREATE TRIGGER update_knowledge_domains_updated_at BEFORE UPDATE ON public.knowledge_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_documents_updated_at ON public.knowledge_base_documents;
CREATE TRIGGER update_knowledge_base_documents_updated_at BEFORE UPDATE ON public.knowledge_base_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_memory_updated_at ON public.chat_memory;
CREATE TRIGGER update_chat_memory_updated_at BEFORE UPDATE ON public.chat_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_facts_updated_at ON public.user_facts;
CREATE TRIGGER update_user_facts_updated_at BEFORE UPDATE ON public.user_facts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_long_term_memory_updated_at ON public.user_long_term_memory;
CREATE TRIGGER update_user_long_term_memory_updated_at BEFORE UPDATE ON public.user_long_term_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
