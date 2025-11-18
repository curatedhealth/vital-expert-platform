-- =====================================================================
-- RAG INFRASTRUCTURE TABLES
-- Creates the core tables needed for the unified RAG service
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================================
-- 1. KNOWLEDGE_DOCUMENTS - Main document storage
-- =====================================================================
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  domain TEXT,
  domain_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  access_policy TEXT DEFAULT 'tenant_private',
  rag_priority_weight DECIMAL(3,2) DEFAULT 1.0,
  chunk_count INTEGER DEFAULT 0,
  processed_at TIMESTAMPTZ,
  tenant_id UUID,
  user_id UUID,
  allowed_tenants UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for knowledge_documents
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain ON knowledge_documents(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain_id ON knowledge_documents(domain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant_id ON knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_allowed_tenants ON knowledge_documents USING GIN (allowed_tenants);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tags ON knowledge_documents USING GIN (tags);

-- =====================================================================
-- 2. DOCUMENT_CHUNKS - Chunked content with embeddings
-- =====================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small / ada-002 dimension (pgvector limit: 2000)
  metadata JSONB DEFAULT '{}',
  domain_id TEXT,
  access_policy TEXT,
  rag_priority_weight DECIMAL(3,2),
  enterprise_id UUID,
  owner_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for document_chunks
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_domain_id ON document_chunks(domain_id);

-- Full-text search index for keyword search
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_fts ON document_chunks
  USING GIN (to_tsvector('english', content));

-- Vector similarity search index (IVFFlat for 1536d vectors)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================================
-- 3. EXTRACTED_ENTITIES - LangExtract entity storage
-- =====================================================================
CREATE TABLE IF NOT EXISTS extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_text TEXT NOT NULL,
  attributes JSONB DEFAULT '{}',
  confidence DECIMAL(3,2),
  char_start INTEGER,
  char_end INTEGER,
  context_before TEXT,
  context_after TEXT,
  original_text TEXT,
  verification_status TEXT DEFAULT 'unverified',
  extraction_model TEXT,
  extraction_version TEXT,
  extraction_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for extracted_entities
CREATE INDEX IF NOT EXISTS idx_extracted_entities_chunk_id ON extracted_entities(chunk_id);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_document_id ON extracted_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_type ON extracted_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_text ON extracted_entities(entity_text);

-- =====================================================================
-- 4. KNOWLEDGE_SOURCES - Alias view for documents API compatibility
-- =====================================================================
CREATE OR REPLACE VIEW knowledge_sources AS
SELECT
  id,
  title,
  file_name,
  file_size,
  file_type,
  domain,
  status,
  created_at,
  updated_at,
  tags,
  metadata,
  tenant_id,
  user_id,
  chunk_count
FROM knowledge_documents;

-- =====================================================================
-- 5. UPDATE TRIGGERS
-- =====================================================================
CREATE OR REPLACE FUNCTION update_knowledge_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_knowledge_documents_updated ON knowledge_documents;
CREATE TRIGGER trigger_knowledge_documents_updated
  BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_documents_timestamp();

-- =====================================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================================
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_entities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read documents they have access to
CREATE POLICY "Users can read accessible documents" ON knowledge_documents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) OR
    (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) = ANY(allowed_tenants) OR
    access_policy = 'public'
  );

-- Policy: Users can insert their own documents
CREATE POLICY "Users can insert own documents" ON knowledge_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update own documents" ON knowledge_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON knowledge_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Document chunks inherit access from parent document
CREATE POLICY "Users can read accessible chunks" ON document_chunks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_documents kd
      WHERE kd.id = document_chunks.document_id
      AND (
        auth.uid() = kd.user_id OR
        kd.tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) OR
        (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) = ANY(kd.allowed_tenants) OR
        kd.access_policy = 'public'
      )
    )
  );

-- Policy: Users can insert chunks for their documents
CREATE POLICY "Users can insert own chunks" ON document_chunks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledge_documents kd
      WHERE kd.id = document_chunks.document_id
      AND auth.uid() = kd.user_id
    )
  );

-- Policy: Entity access inherits from document
CREATE POLICY "Users can read accessible entities" ON extracted_entities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_documents kd
      WHERE kd.id = extracted_entities.document_id
      AND (
        auth.uid() = kd.user_id OR
        kd.tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) OR
        (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) = ANY(kd.allowed_tenants) OR
        kd.access_policy = 'public'
      )
    )
  );

-- =====================================================================
-- 7. SERVICE ROLE BYPASS POLICIES
-- =====================================================================
-- Allow service role full access for API operations
CREATE POLICY "Service role full access to documents" ON knowledge_documents
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to chunks" ON document_chunks
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to entities" ON extracted_entities
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================================
-- 8. SET DEFAULT TENANT ACCESS
-- =====================================================================
-- Set all existing documents to be accessible by all tenants
UPDATE knowledge_documents
SET allowed_tenants = ARRAY[
  'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'::uuid,  -- VITAL Expert Platform
  '684f6c2c-b50d-4726-ad92-c76c3b785a89'::uuid,  -- Digital Health
  'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'::uuid   -- Pharmaceuticals
]
WHERE allowed_tenants IS NULL OR allowed_tenants = '{}';

-- =====================================================================
-- VERIFICATION
-- =====================================================================
DO $$
BEGIN
  RAISE NOTICE 'RAG Infrastructure tables created successfully';
  RAISE NOTICE 'Tables: knowledge_documents, document_chunks, extracted_entities';
  RAISE NOTICE 'View: knowledge_sources (for documents API compatibility)';
END $$;
