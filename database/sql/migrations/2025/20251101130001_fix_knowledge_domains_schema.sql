-- ============================================================================
-- Fix Knowledge Domains Schema - Add Missing Columns
-- Date: 2025-11-02
-- Purpose: Add missing columns to existing knowledge_domains table
-- ============================================================================

-- Check if knowledge_domains table exists and add missing columns

-- Add domain_scope column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_domains' 
    AND column_name = 'domain_scope'
  ) THEN
    ALTER TABLE knowledge_domains 
    ADD COLUMN domain_scope TEXT NOT NULL DEFAULT 'global' 
    CHECK (domain_scope IN ('global','enterprise','user'));
  END IF;
END $$;

-- Add domain_id column if it doesn't exist (rename id to domain_id if needed)
-- Handle both UUID and TEXT types
DO $$ 
DECLARE
  id_type TEXT;
BEGIN
  -- Check if we have 'id' but not 'domain_id'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_domains' 
    AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_domains' 
    AND column_name = 'domain_id'
  ) THEN
    -- Get the data type of the id column
    SELECT data_type INTO id_type
    FROM information_schema.columns
    WHERE table_name = 'knowledge_domains'
    AND column_name = 'id';
    
    -- Rename id to domain_id
    ALTER TABLE knowledge_domains RENAME COLUMN id TO domain_id;
    
    -- Update the primary key constraint if needed
    ALTER TABLE knowledge_domains DROP CONSTRAINT IF EXISTS knowledge_domains_pkey;
    ALTER TABLE knowledge_domains ADD PRIMARY KEY (domain_id);
  ELSE
    -- Get the data type of domain_id if it exists
    SELECT data_type INTO id_type
    FROM information_schema.columns
    WHERE table_name = 'knowledge_domains'
    AND column_name = 'domain_id';
  END IF;
  
  -- If neither exists, add domain_id as UUID (most common case)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_domains' 
    AND column_name IN ('id', 'domain_id')
  ) THEN
    ALTER TABLE knowledge_domains ADD COLUMN domain_id UUID PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Add other missing columns that might not exist

DO $$ 
DECLARE
  id_type TEXT;
BEGIN
  -- Get the data type of domain_id to use for parent_domain_id
  SELECT data_type INTO id_type
  FROM information_schema.columns
  WHERE table_name = 'knowledge_domains'
  AND column_name = 'domain_id';
  
  -- parent_domain_id (use same type as domain_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'parent_domain_id') THEN
    IF id_type = 'uuid' THEN
      ALTER TABLE knowledge_domains ADD COLUMN parent_domain_id UUID REFERENCES knowledge_domains(domain_id) ON DELETE SET NULL;
    ELSE
      ALTER TABLE knowledge_domains ADD COLUMN parent_domain_id TEXT REFERENCES knowledge_domains(domain_id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- function_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'function_id') THEN
    ALTER TABLE knowledge_domains ADD COLUMN function_id TEXT NOT NULL DEFAULT 'default';
  END IF;

  -- function_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'function_name') THEN
    ALTER TABLE knowledge_domains ADD COLUMN function_name TEXT NOT NULL DEFAULT 'Default Function';
  END IF;

  -- domain_name (might be 'name')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'domain_name') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'name') THEN
      ALTER TABLE knowledge_domains RENAME COLUMN name TO domain_name;
    ELSE
      ALTER TABLE knowledge_domains ADD COLUMN domain_name TEXT NOT NULL DEFAULT 'Untitled Domain';
    END IF;
  END IF;

  -- domain_description_llm (might be 'description')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'domain_description_llm') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'description') THEN
      ALTER TABLE knowledge_domains RENAME COLUMN description TO domain_description_llm;
    ELSE
      ALTER TABLE knowledge_domains ADD COLUMN domain_description_llm TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- tenants_primary
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'tenants_primary') THEN
    ALTER TABLE knowledge_domains ADD COLUMN tenants_primary TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- tenants_secondary
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'tenants_secondary') THEN
    ALTER TABLE knowledge_domains ADD COLUMN tenants_secondary TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- is_cross_tenant
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'is_cross_tenant') THEN
    ALTER TABLE knowledge_domains ADD COLUMN is_cross_tenant BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- enterprise_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'enterprise_id') THEN
    ALTER TABLE knowledge_domains ADD COLUMN enterprise_id TEXT;
  END IF;

  -- owner_user_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'owner_user_id') THEN
    ALTER TABLE knowledge_domains ADD COLUMN owner_user_id TEXT;
  END IF;

  -- tier
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'tier') THEN
    ALTER TABLE knowledge_domains ADD COLUMN tier INTEGER NOT NULL DEFAULT 3;
  END IF;

  -- tier_label
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'tier_label') THEN
    ALTER TABLE knowledge_domains ADD COLUMN tier_label TEXT;
  END IF;

  -- maturity_level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'maturity_level') THEN
    ALTER TABLE knowledge_domains ADD COLUMN maturity_level TEXT NOT NULL DEFAULT 'Draft' CHECK (maturity_level IN ('Established','Specialized','Emerging','Draft'));
  END IF;

  -- regulatory_exposure
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'regulatory_exposure') THEN
    ALTER TABLE knowledge_domains ADD COLUMN regulatory_exposure TEXT NOT NULL DEFAULT 'Medium' CHECK (regulatory_exposure IN ('High','Medium','Low'));
  END IF;

  -- pii_sensitivity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'pii_sensitivity') THEN
    ALTER TABLE knowledge_domains ADD COLUMN pii_sensitivity TEXT NOT NULL DEFAULT 'Low' CHECK (pii_sensitivity IN ('None','Low','Medium','High'));
  END IF;

  -- lifecycle_stage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'lifecycle_stage') THEN
    ALTER TABLE knowledge_domains ADD COLUMN lifecycle_stage TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  END IF;

  -- governance_owner
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'governance_owner') THEN
    ALTER TABLE knowledge_domains ADD COLUMN governance_owner TEXT;
  END IF;

  -- last_review_owner_role
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'last_review_owner_role') THEN
    ALTER TABLE knowledge_domains ADD COLUMN last_review_owner_role TEXT;
  END IF;

  -- embedding_model
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'embedding_model') THEN
    ALTER TABLE knowledge_domains ADD COLUMN embedding_model TEXT;
  END IF;

  -- rag_priority_weight
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'rag_priority_weight') THEN
    ALTER TABLE knowledge_domains ADD COLUMN rag_priority_weight NUMERIC(4,3) NOT NULL DEFAULT 0.500;
  END IF;

  -- access_policy
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'access_policy') THEN
    ALTER TABLE knowledge_domains ADD COLUMN access_policy TEXT NOT NULL DEFAULT 'public' CHECK (access_policy IN ('public','enterprise_confidential','team_confidential','personal_draft'));
  END IF;

  -- metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'metadata') THEN
    ALTER TABLE knowledge_domains ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  -- is_active
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'is_active') THEN
    ALTER TABLE knowledge_domains ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  -- created_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'created_at') THEN
    ALTER TABLE knowledge_domains ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

  -- updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'updated_at') THEN
    ALTER TABLE knowledge_domains ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;

      -- code (might be required by existing schema)
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'code') THEN
        -- Add code column as TEXT, using domain_id as default if it exists
        ALTER TABLE knowledge_domains ADD COLUMN code TEXT;
      END IF;

      -- slug (might be required by existing schema)
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'slug') THEN
        -- Add slug column as TEXT
        ALTER TABLE knowledge_domains ADD COLUMN slug TEXT;
      END IF;
    END $$;

-- If code column exists but domain_id-based values aren't set, populate them
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'code') THEN
    -- Update NULL codes with a generated value from domain_id or domain_name
    UPDATE knowledge_domains
    SET code = COALESCE(
      code,
      -- Try to use domain_id if it's text-like
      CASE
        WHEN domain_id::text ~ '^[a-zA-Z_-]+$' THEN domain_id::text
        ELSE lower(regexp_replace(domain_name, '[^a-zA-Z0-9]+', '_', 'g'))
      END
    )
    WHERE code IS NULL;

    -- Make code NOT NULL after populating
    ALTER TABLE knowledge_domains ALTER COLUMN code SET NOT NULL;
  END IF;
END $$;

-- If slug column exists but values aren't set, populate them
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'knowledge_domains' AND column_name = 'slug') THEN
    -- Update NULL slugs with a generated value from code or domain_name
    UPDATE knowledge_domains
    SET slug = COALESCE(
      slug,
      code,
      lower(regexp_replace(domain_name, '[^a-zA-Z0-9]+', '-', 'g'))
    )
    WHERE slug IS NULL;

    -- Make slug NOT NULL after populating
    ALTER TABLE knowledge_domains ALTER COLUMN slug SET NOT NULL;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_scope ON knowledge_domains(domain_scope);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_enterprise ON knowledge_domains(enterprise_id) WHERE enterprise_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_parent ON knowledge_domains(parent_domain_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_domains_priority ON knowledge_domains(rag_priority_weight DESC, tier ASC);

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION trg_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trg_knowledge_domains_updated ON knowledge_domains;
CREATE TRIGGER trg_knowledge_domains_updated
  BEFORE UPDATE ON knowledge_domains
  FOR EACH ROW
  EXECUTE FUNCTION trg_update_timestamp();

COMMENT ON TABLE knowledge_domains IS 'Registry of knowledge domains for unified RAG routing and governance';
COMMENT ON COLUMN knowledge_domains.domain_scope IS 'Scope: global (all tenants), enterprise (specific enterprise), or user (personal)';
COMMENT ON COLUMN knowledge_domains.rag_priority_weight IS 'Priority weight for RAG retrieval (0.000-1.000)';

