-- ============================================================================
-- MINIMAL Unified RAG Domain Architecture Migration
-- ============================================================================
-- Simplified version for troubleshooting
-- ============================================================================

-- Step 1: Create ENUM types
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

-- Step 2: Create minimal table structure (without FK first)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.knowledge_domains_new (
  domain_id TEXT PRIMARY KEY,
  parent_domain_id TEXT,  -- Will add FK constraint after table exists
  
  -- Function classification
  function_id TEXT NOT NULL DEFAULT 'general',
  function_name TEXT NOT NULL DEFAULT 'General',
  
  -- Domain identification
  domain_name TEXT NOT NULL,
  domain_description_llm TEXT,
  
  -- Scope and ownership
  domain_scope domain_scope NOT NULL DEFAULT 'global',
  enterprise_id TEXT,
  owner_user_id TEXT,
  
  -- Tier and priority
  tier INTEGER NOT NULL DEFAULT 1,
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
  
  -- Tenant classification
  tenants_primary TEXT[] DEFAULT '{}',
  tenants_secondary TEXT[] DEFAULT '{}',
  is_cross_tenant BOOLEAN DEFAULT true,
  
  -- Legacy fields
  code TEXT,
  slug TEXT,
  name TEXT,
  description TEXT,
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

-- Step 3: Create basic indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_parent 
  ON public.knowledge_domains_new(parent_domain_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_scope 
  ON public.knowledge_domains_new(domain_scope);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_function 
  ON public.knowledge_domains_new(function_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_tier 
  ON public.knowledge_domains_new(tier);

CREATE INDEX IF NOT EXISTS idx_knowledge_domains_new_access_policy 
  ON public.knowledge_domains_new(access_policy);

-- Step 4: Add self-referencing foreign key (after table exists)
-- ============================================================================

-- Add FK constraint for parent_domain_id
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'knowledge_domains_new_parent_domain_id_fkey'
  ) THEN
    ALTER TABLE public.knowledge_domains_new
      ADD CONSTRAINT knowledge_domains_new_parent_domain_id_fkey
      FOREIGN KEY (parent_domain_id) 
      REFERENCES public.knowledge_domains_new(domain_id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Step 5: Verify table was created
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'knowledge_domains_new'
  ) THEN
    RAISE NOTICE '✅ Table knowledge_domains_new created successfully!';
  ELSE
    RAISE EXCEPTION '❌ Table knowledge_domains_new was NOT created!';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Minimal migration completed!';
  RAISE NOTICE '   Table: knowledge_domains_new';
  RAISE NOTICE '   Check with: SELECT * FROM knowledge_domains_new LIMIT 1;';
END $$;

