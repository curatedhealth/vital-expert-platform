-- ============================================================================
-- HIERARCHICAL MULTI-TENANCY MIGRATION - PHASE 1
-- ============================================================================
-- Description: Add new columns for 3-level hierarchy (platform > tenant > org)
-- Author: VITAL Database Architect
-- Date: 2025-11-26
-- Status: Safe to run (non-breaking, adds columns only)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create ENUMs
-- ============================================================================

-- Organization type (platform, tenant, organization)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type') THEN
    CREATE TYPE organization_type AS ENUM ('platform', 'tenant', 'organization');
  END IF;
END$$;

-- Sharing scope (platform-wide, tenant-wide, org-private)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sharing_scope_type') THEN
    CREATE TYPE sharing_scope_type AS ENUM ('platform', 'tenant', 'organization');
  END IF;
END$$;

COMMENT ON TYPE organization_type IS 'Hierarchy level: platform (VITAL) > tenant (Pharma/Digital Health) > organization (Novartis/Pfizer)';
COMMENT ON TYPE sharing_scope_type IS 'Resource visibility: platform (all users) / tenant (all orgs in tenant) / organization (single org only)';

-- ============================================================================
-- STEP 2: Add columns to organizations table
-- ============================================================================

-- Add hierarchy columns
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS organization_type organization_type,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN organizations.parent_organization_id IS 'Self-referential FK: orgs belong to tenants, tenants belong to platform';
COMMENT ON COLUMN organizations.organization_type IS 'Hierarchy level: platform, tenant, or organization';
COMMENT ON COLUMN organizations.slug IS 'URL-safe unique identifier (e.g., "novartis", "pharma-tenant")';
COMMENT ON COLUMN organizations.deleted_at IS 'Soft delete timestamp for HIPAA compliance';

-- ============================================================================
-- STEP 3: Add sharing_scope to all multi-tenant tables
-- ============================================================================

-- Agents
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN agents.sharing_scope IS 'Visibility: platform (all) / tenant (pharma-wide) / organization (Novartis-only)';

-- Knowledge documents
ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN knowledge_documents.sharing_scope IS 'Visibility level for RAG content';

-- Prompts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    ALTER TABLE prompts
      ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  END IF;
END$$;

-- Workflows
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    ALTER TABLE workflows
      ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  END IF;
END$$;

-- Use cases
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'use_cases') THEN
    ALTER TABLE use_cases
      ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  END IF;
END$$;

-- Capabilities
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capabilities') THEN
    ALTER TABLE capabilities
      ADD COLUMN IF NOT EXISTS sharing_scope sharing_scope_type,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  END IF;
END$$;

-- ============================================================================
-- STEP 4: Rename tenant_id to owner_organization_id (if needed)
-- ============================================================================

-- Agents
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'tenant_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE agents RENAME COLUMN tenant_id TO owner_organization_id;
    RAISE NOTICE 'Renamed agents.tenant_id to owner_organization_id';
  END IF;
END$$;

-- Knowledge documents
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents' AND column_name = 'tenant_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE knowledge_documents RENAME COLUMN tenant_id TO owner_organization_id;
    RAISE NOTICE 'Renamed knowledge_documents.tenant_id to owner_organization_id';
  END IF;
END$$;

-- If owner_organization_id doesn't exist but organization_id does, rename
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents' AND column_name = 'organization_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE knowledge_documents RENAME COLUMN organization_id TO owner_organization_id;
    RAISE NOTICE 'Renamed knowledge_documents.organization_id to owner_organization_id';
  END IF;
END$$;

-- Prompts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'tenant_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'owner_organization_id'
    ) THEN
      ALTER TABLE prompts RENAME COLUMN tenant_id TO owner_organization_id;
      RAISE NOTICE 'Renamed prompts.tenant_id to owner_organization_id';
    END IF;
  END IF;
END$$;

-- Workflows
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'workflows' AND column_name = 'tenant_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'workflows' AND column_name = 'owner_organization_id'
    ) THEN
      ALTER TABLE workflows RENAME COLUMN tenant_id TO owner_organization_id;
      RAISE NOTICE 'Renamed workflows.tenant_id to owner_organization_id';
    END IF;
  END IF;
END$$;

-- Conversations (keep owner_organization_id, no sharing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'tenant_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE conversations RENAME COLUMN tenant_id TO owner_organization_id;
    RAISE NOTICE 'Renamed conversations.tenant_id to owner_organization_id';
  END IF;
END$$;

-- ============================================================================
-- STEP 5: Add owner_organization_id if not exists
-- ============================================================================

-- Agents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN owner_organization_id UUID;
    RAISE NOTICE 'Added agents.owner_organization_id';
  END IF;
END$$;

-- Knowledge documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_documents' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE knowledge_documents ADD COLUMN owner_organization_id UUID;
    RAISE NOTICE 'Added knowledge_documents.owner_organization_id';
  END IF;
END$$;

-- Prompts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'owner_organization_id'
    ) THEN
      ALTER TABLE prompts ADD COLUMN owner_organization_id UUID;
      RAISE NOTICE 'Added prompts.owner_organization_id';
    END IF;
  END IF;
END$$;

-- Workflows
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'workflows' AND column_name = 'owner_organization_id'
    ) THEN
      ALTER TABLE workflows ADD COLUMN owner_organization_id UUID;
      RAISE NOTICE 'Added workflows.owner_organization_id';
    END IF;
  END IF;
END$$;

-- Conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'owner_organization_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN owner_organization_id UUID;
    RAISE NOTICE 'Added conversations.owner_organization_id';
  END IF;
END$$;

-- Use cases
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'use_cases') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'use_cases' AND column_name = 'owner_organization_id'
    ) THEN
      ALTER TABLE use_cases ADD COLUMN owner_organization_id UUID;
      RAISE NOTICE 'Added use_cases.owner_organization_id';
    END IF;
  END IF;
END$$;

-- Capabilities
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'capabilities') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'capabilities' AND column_name = 'owner_organization_id'
    ) THEN
      ALTER TABLE capabilities ADD COLUMN owner_organization_id UUID;
      RAISE NOTICE 'Added capabilities.owner_organization_id';
    END IF;
  END IF;
END$$;

-- ============================================================================
-- STEP 6: Verify migration
-- ============================================================================

DO $$
DECLARE
  v_missing_columns TEXT[] := '{}';
  v_column_name TEXT;
BEGIN
  -- Check organizations table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'parent_organization_id'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'organizations.parent_organization_id');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'organization_type'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'organizations.organization_type');
  END IF;

  -- Check agents table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'owner_organization_id'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'agents.owner_organization_id');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'sharing_scope'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'agents.sharing_scope');
  END IF;

  -- Report results
  IF array_length(v_missing_columns, 1) > 0 THEN
    RAISE WARNING 'Missing columns after migration: %', array_to_string(v_missing_columns, ', ');
  ELSE
    RAISE NOTICE '✅ Phase 1 migration completed successfully!';
    RAISE NOTICE '   - Added organization hierarchy columns';
    RAISE NOTICE '   - Added sharing_scope to all multi-tenant tables';
    RAISE NOTICE '   - Renamed tenant_id to owner_organization_id where needed';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '   1. Run Phase 2 to backfill data';
    RAISE NOTICE '   2. Verify data in staging environment';
    RAISE NOTICE '   3. Run Phase 3 to add constraints and indexes';
  END IF;
END$$;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
-- CAREFUL: This will undo Phase 1 changes
--
-- BEGIN;
--
-- -- Remove new columns from organizations
-- ALTER TABLE organizations
--   DROP COLUMN IF EXISTS parent_organization_id,
--   DROP COLUMN IF EXISTS organization_type,
--   DROP COLUMN IF EXISTS slug,
--   DROP COLUMN IF EXISTS deleted_at;
--
-- -- Remove sharing_scope from all tables
-- ALTER TABLE agents DROP COLUMN IF EXISTS sharing_scope;
-- ALTER TABLE knowledge_documents DROP COLUMN IF EXISTS sharing_scope;
-- ALTER TABLE prompts DROP COLUMN IF EXISTS sharing_scope;
-- ALTER TABLE workflows DROP COLUMN IF EXISTS sharing_scope;
-- ALTER TABLE use_cases DROP COLUMN IF EXISTS sharing_scope;
-- ALTER TABLE capabilities DROP COLUMN IF EXISTS sharing_scope;
--
-- -- Rename back to tenant_id (if you need to)
-- -- ALTER TABLE agents RENAME COLUMN owner_organization_id TO tenant_id;
--
-- -- Drop ENUMs
-- DROP TYPE IF EXISTS organization_type;
-- DROP TYPE IF EXISTS sharing_scope_type;
--
-- COMMIT;
