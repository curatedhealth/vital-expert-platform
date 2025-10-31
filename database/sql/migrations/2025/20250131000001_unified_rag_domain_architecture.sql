-- ============================================================================
-- Unified RAG Domain Architecture Migration
-- ============================================================================
-- Implements multi-scope domain hierarchy: global → enterprise → user
-- Adds governance, access control, and priority weighting
-- ============================================================================

-- Step 1: Create ENUM types for domain attributes
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE domain_scope AS ENUM ('global', 'enterprise', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE access_policy_level AS ENUM (
    'public',
    'enterprise_confidential',
    'team_confidential',
    'personal_draft'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE maturity_level AS ENUM ('Established', 'Specialized', 'Emerging', 'Draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE exposure_level AS ENUM ('High', 'Medium', 'Low', 'None');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to knowledge_domains
-- ============================================================================

-- Change primary key from UUID to TEXT (domain_id)
-- First, create new table structure
CREATE TABLE IF NOT EXISTS public.knowledge_domains_new (
  domain_id TEXT PRIMARY KEY,  -- e.g., "regulatory_affairs" or "hta_reimbursement_assessment.enterprise_x"
  parent_domain_id TEXT REFERENCES public.knowledge_domains_new(domain_id) ON DELETE SET NULL,
  
  -- Function classification
  function_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  
  -- Domain identification
  domain_name TEXT NOT NULL,
  domain_description_llm TEXT,  -- LLM-readable description for routing
  
  -- Tenant classification
  tenants_primary TEXT[] DEFAULT '{}',
  tenants_secondary TEXT[] DEFAULT '{}',
  is_cross_tenant BOOLEAN DEFAULT true,
  
  -- Scope and ownership
  domain_scope domain_scope NOT NULL DEFAULT 'global',
  enterprise_id TEXT,  -- NULL for global, set for enterprise/user scopes
  owner_user_id TEXT,  -- NULL for global/enterprise, set for user scope
  
  -- Tier and priority
  tier INTEGER NOT NULL DEFAULT 1,  -- 1=Core, 2=Specialized, 3=Emerging
  tier_label TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  
  -- Maturity and compliance
  maturity_level maturity_level NOT NULL DEFAULT 'Established',
  regulatory_exposure exposure_level DEFAULT 'Medium',
  pii_sensitivity exposure_level DEFAULT 'Low',
  lifecycle_stage TEXT[] DEFAULT '{}',
  
  -- Governance
  governance_owner TEXT,
  last_review_owner_role TEXT,
  
  -- RAG configuration
  embedding_model TEXT DEFAULT 'text-embedding-3-large',
  rag_priority_weight DECIMAL(3,2) DEFAULT 0.9 CHECK (rag_priority_weight >= 0 AND rag_priority_weight <= 1),
  access_policy access_policy_level DEFAULT 'public',
  
  -- Legacy fields (for backward compatibility)
  code TEXT,
  slug TEXT,  -- Alias for domain_id for backward compatibility
  name TEXT,  -- Alias for domain_name
  description TEXT,  -- Alias for domain_description_llm
  keywords TEXT[] DEFAULT '{}',
  sub_domains TEXT[] DEFAULT '{}',
  agent_count_estimate INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'book',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  recommended_models JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Step 3: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_parent 
  ON public.knowledge_domains_new(parent_domain_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_scope 
  ON public.knowledge_domains_new(domain_scope);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_enterprise 
  ON public.knowledge_domains_new(enterprise_id) WHERE enterprise_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_owner 
  ON public.knowledge_domains_new(owner_user_id) WHERE owner_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_function 
  ON public.knowledge_domains_new(function_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_tier 
  ON public.knowledge_domains_new(tier);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_priority_weight 
  ON public.knowledge_domains_new(rag_priority_weight DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_access_policy 
  ON public.knowledge_domains_new(access_policy);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_tenants 
  ON public.knowledge_domains_new USING GIN(tenants_primary);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_lifecycle 
  ON public.knowledge_domains_new USING GIN(lifecycle_stage);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_keywords 
  ON public.knowledge_domains_new USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_slug 
  ON public.knowledge_domains_new(slug) WHERE slug IS NOT NULL;

-- Step 4: Update knowledge_documents to support new domain structure
-- ============================================================================

-- Add domain_id column (TEXT) to replace or complement existing domain field
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS domain_id TEXT;

-- Add enterprise_id and owner_user_id for multi-tenancy
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS enterprise_id TEXT;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS owner_user_id TEXT;

-- Add access control fields
ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS access_policy access_policy_level DEFAULT 'public';

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS rag_priority_weight DECIMAL(3,2) DEFAULT 0.9;

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS pii_sensitivity exposure_level DEFAULT 'Low';

ALTER TABLE public.knowledge_documents
  ADD COLUMN IF NOT EXISTS regulatory_exposure exposure_level DEFAULT 'Medium';

-- Create indexes for document queries
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain_id 
  ON public.knowledge_documents(domain_id) WHERE domain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_enterprise 
  ON public.knowledge_documents(enterprise_id) WHERE enterprise_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_owner 
  ON public.knowledge_documents(owner_user_id) WHERE owner_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_access_policy 
  ON public.knowledge_documents(access_policy);

-- Step 5: Update document_chunks for inheritance
-- ============================================================================

-- Chunks inherit domain_id from parent document, but we can denormalize for performance
ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS domain_id TEXT;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS enterprise_id TEXT;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS access_policy access_policy_level;

ALTER TABLE public.document_chunks
  ADD COLUMN IF NOT EXISTS rag_priority_weight DECIMAL(3,2);

-- Indexes for chunk queries
CREATE INDEX IF NOT EXISTS idx_document_chunks_domain_id 
  ON public.document_chunks(domain_id) WHERE domain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_chunks_enterprise 
  ON public.document_chunks(enterprise_id) WHERE enterprise_id IS NOT NULL;

-- Step 6: Helper function to get domain hierarchy (parent chain)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_domain_hierarchy(domain_id_text TEXT)
RETURNS TABLE(
  domain_id TEXT,
  parent_domain_id TEXT,
  level INTEGER
) AS $$
WITH RECURSIVE hierarchy AS (
  -- Base case: start with the given domain
  SELECT 
    d.domain_id,
    d.parent_domain_id,
    0 as level
  FROM public.knowledge_domains_new d
  WHERE d.domain_id = domain_id_text
  
  UNION ALL
  
  -- Recursive case: get parent
  SELECT 
    d.domain_id,
    d.parent_domain_id,
    h.level + 1
  FROM public.knowledge_domains_new d
  INNER JOIN hierarchy h ON d.domain_id = h.parent_domain_id
)
SELECT * FROM hierarchy;
$$ LANGUAGE sql STABLE;

-- Step 7: Helper function to get accessible domains for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_accessible_domains(
  p_enterprise_id TEXT,
  p_user_id TEXT,
  p_user_access_level access_policy_level
)
RETURNS TABLE(domain_id TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT d.domain_id
  FROM public.knowledge_domains_new d
  WHERE 
    -- Scope-based access
    (
      -- Global domains: accessible to all
      (d.domain_scope = 'global' AND d.access_policy <= p_user_access_level)
      OR
      -- Enterprise domains: accessible if enterprise matches
      (d.domain_scope = 'enterprise' AND d.enterprise_id = p_enterprise_id 
       AND d.access_policy <= p_user_access_level)
      OR
      -- User domains: accessible if owner matches
      (d.domain_scope = 'user' AND d.owner_user_id = p_user_id 
       AND d.access_policy <= p_user_access_level)
    )
    AND d.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 8: RLS policies for multi-tenant access
-- ============================================================================

-- Enable RLS on new table
ALTER TABLE public.knowledge_domains_new ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for global domains
CREATE POLICY "Public read global domains"
  ON public.knowledge_domains_new
  FOR SELECT
  USING (
    domain_scope = 'global' 
    AND access_policy = 'public'
    AND is_active = true
  );

-- Policy: Enterprise read access
CREATE POLICY "Enterprise read own domains"
  ON public.knowledge_domains_new
  FOR SELECT
  USING (
    (
      domain_scope = 'enterprise' 
      AND enterprise_id = current_setting('app.enterprise_id', true)
      AND access_policy IN ('public', 'enterprise_confidential')
    )
    OR
    (
      domain_scope = 'user'
      AND owner_user_id = auth.uid()
      AND access_policy IN ('public', 'enterprise_confidential', 'team_confidential', 'personal_draft')
    )
  );

-- Step 9: Update trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_knowledge_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_domains_new_updated_at
  BEFORE UPDATE ON public.knowledge_domains_new
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_domains_updated_at();

-- Step 10: Migration notes and validation
-- ============================================================================

COMMENT ON TABLE public.knowledge_domains_new IS 
'Unified RAG domain architecture with multi-scope hierarchy (global/enterprise/user)';

COMMENT ON COLUMN public.knowledge_domains_new.domain_id IS 
'Primary key: domain identifier (e.g., "regulatory_affairs" or "hta_reimbursement_assessment.enterprise_x")';

COMMENT ON COLUMN public.knowledge_domains_new.parent_domain_id IS 
'Foreign key to parent domain for inheritance hierarchy';

COMMENT ON COLUMN public.knowledge_domains_new.domain_scope IS 
'Scope: global (shared), enterprise (local), or user (personal)';

COMMENT ON COLUMN public.knowledge_domains_new.rag_priority_weight IS 
'Priority weight (0-1) for retrieval ranking. Higher = more authoritative';

COMMENT ON COLUMN public.knowledge_domains_new.access_policy IS 
'Access control level: public, enterprise_confidential, team_confidential, personal_draft';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Unified RAG Domain Architecture migration completed!';
  RAISE NOTICE '   - Created knowledge_domains_new table with hierarchy support';
  RAISE NOTICE '   - Added multi-scope domains (global/enterprise/user)';
  RAISE NOTICE '   - Added access control (access_policy)';
  RAISE NOTICE '   - Added priority weighting (rag_priority_weight)';
  RAISE NOTICE '   - Created helper functions for domain hierarchy';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Next steps:';
  RAISE NOTICE '   1. Migrate existing data from knowledge_domains to knowledge_domains_new';
  RAISE NOTICE '   2. Seed domains from RAG-Domains.json';
  RAISE NOTICE '   3. Update application code to use new schema';
  RAISE NOTICE '   4. Rename knowledge_domains_new → knowledge_domains after migration';
END $$;

