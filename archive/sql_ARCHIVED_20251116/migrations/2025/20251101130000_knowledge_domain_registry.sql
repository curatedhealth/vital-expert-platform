-- ============================================================================
-- Knowledge Domain Registry & Knowledge Base Enhancements
-- Date: 2025-11-01
-- Notes:
--   * Introduces knowledge_domains catalog for unified RAG routing.
--   * Extends knowledge_base and documents tables with governance metadata.
--   * Adds helper indexes + defaults to support Pinecone metadata filters.
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_domains (
  domain_id TEXT PRIMARY KEY,
  parent_domain_id TEXT REFERENCES knowledge_domains(domain_id) ON DELETE SET NULL,
  function_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  domain_description_llm TEXT NOT NULL,
  tenants_primary TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  tenants_secondary TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_cross_tenant BOOLEAN NOT NULL DEFAULT FALSE,
  domain_scope TEXT NOT NULL CHECK (domain_scope IN ('global','enterprise','user')),
  enterprise_id TEXT,
  owner_user_id TEXT,
  tier INTEGER NOT NULL DEFAULT 3,
  tier_label TEXT,
  maturity_level TEXT NOT NULL DEFAULT 'Draft' CHECK (maturity_level IN ('Established','Specialized','Emerging','Draft')),
  regulatory_exposure TEXT NOT NULL DEFAULT 'Medium' CHECK (regulatory_exposure IN ('High','Medium','Low')),
  pii_sensitivity TEXT NOT NULL DEFAULT 'Low' CHECK (pii_sensitivity IN ('None','Low','Medium','High')),
  lifecycle_stage TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  governance_owner TEXT,
  last_review_owner_role TEXT,
  embedding_model TEXT,
  rag_priority_weight NUMERIC(4,3) NOT NULL DEFAULT 0.500,
  access_policy TEXT NOT NULL DEFAULT 'public' CHECK (access_policy IN ('public','enterprise_confidential','team_confidential','personal_draft')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_scope ON knowledge_domains(domain_scope);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_enterprise ON knowledge_domains(enterprise_id) WHERE enterprise_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_parent ON knowledge_domains(parent_domain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON knowledge_domains(rag_priority_weight DESC, tier ASC);

CREATE OR REPLACE FUNCTION trg_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_knowledge_domains_updated ON knowledge_domains;
CREATE TRIGGER trg_knowledge_domains_updated
  BEFORE UPDATE ON knowledge_domains
  FOR EACH ROW EXECUTE FUNCTION trg_update_timestamp();

COMMENT ON TABLE knowledge_domains IS 'Unified RAG domain registry spanning global, enterprise, and user scopes.';
COMMENT ON COLUMN knowledge_domains.domain_scope IS 'global | enterprise | user';

-- ============================================================================
-- knowledge_base extensions (ensure alignment with domain metadata)
-- ============================================================================

ALTER TABLE knowledge_base
  ADD COLUMN IF NOT EXISTS domain_id TEXT REFERENCES knowledge_domains(domain_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS enterprise_id TEXT,
  ADD COLUMN IF NOT EXISTS owner_user_id TEXT,
  ADD COLUMN IF NOT EXISTS tier INTEGER,
  ADD COLUMN IF NOT EXISTS tier_label TEXT,
  ADD COLUMN IF NOT EXISTS maturity_level TEXT CHECK (maturity_level IN ('Established','Specialized','Emerging','Draft')),
  ADD COLUMN IF NOT EXISTS regulatory_exposure TEXT CHECK (regulatory_exposure IN ('High','Medium','Low')),
  ADD COLUMN IF NOT EXISTS pii_sensitivity TEXT CHECK (pii_sensitivity IN ('None','Low','Medium','High')),
  ADD COLUMN IF NOT EXISTS rag_priority_weight NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS access_policy TEXT CHECK (access_policy IN ('public','enterprise_confidential','team_confidential','personal_draft'));

CREATE INDEX IF NOT EXISTS idx_knowledge_base_domain ON knowledge_base(domain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_access_policy ON knowledge_base(access_policy);

COMMENT ON COLUMN knowledge_base.domain_id IS 'Links knowledge asset to knowledge_domains.domain_id for routing.';

-- ============================================================================
-- documents extensions for RAG metadata
-- ============================================================================

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS domain_id TEXT REFERENCES knowledge_domains(domain_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tier INTEGER,
  ADD COLUMN IF NOT EXISTS maturity_level TEXT CHECK (maturity_level IN ('Established','Specialized','Emerging','Draft')),
  ADD COLUMN IF NOT EXISTS regulatory_exposure TEXT CHECK (regulatory_exposure IN ('High','Medium','Low')),
  ADD COLUMN IF NOT EXISTS pii_sensitivity TEXT CHECK (pii_sensitivity IN ('None','Low','Medium','High')),
  ADD COLUMN IF NOT EXISTS rag_priority_weight NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS access_policy TEXT CHECK (access_policy IN ('public','enterprise_confidential','team_confidential','personal_draft'));

CREATE INDEX IF NOT EXISTS idx_documents_domain ON documents(domain_id);
CREATE INDEX IF NOT EXISTS idx_documents_access_policy ON documents(access_policy);
CREATE INDEX IF NOT EXISTS idx_documents_priority ON documents(rag_priority_weight DESC NULLS LAST, tier ASC NULLS LAST);

COMMENT ON COLUMN documents.domain_id IS 'RAG domain ownership for this document chunk.';

