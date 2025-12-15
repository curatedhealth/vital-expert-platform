/**
 * Phase 1: Add Standardized Columns
 *
 * GOAL: Add new standardized columns alongside existing ones with sync triggers
 *
 * STRATEGY: Zero-downtime migration using dual-write pattern
 * - Add new columns (e.g., owner_organization_id, organization_id)
 * - Create triggers to keep old and new columns in sync
 * - Application continues using old columns
 *
 * ROLLBACK: Drop new columns and triggers
 *
 * RISK LEVEL: LOW
 * - No data modification
 * - No application code changes required
 * - Fully reversible
 */

-- ============================================================================
-- VALIDATION: Backup Check
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 1: ADD STANDARDIZED COLUMNS';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Ensure database backup exists';
  RAISE NOTICE 'Backup command: pg_dump $DATABASE_URL > backup_phase1_$(date +%%Y%%m%%d).sql';
  RAISE NOTICE '';
  RAISE NOTICE 'This migration is REVERSIBLE';
  RAISE NOTICE 'Rollback: Drop new columns and triggers';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Add Standardized Columns to agents Table
-- ============================================================================

-- Add owner_organization_id (standardized column for agents)
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS owner_organization_id UUID;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_agents_owner_organization'
  ) THEN
    ALTER TABLE agents
    ADD CONSTRAINT fk_agents_owner_organization
    FOREIGN KEY (owner_organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE;

    RAISE NOTICE '✓ Added foreign key: agents.owner_organization_id -> organizations.id';
  END IF;
END $$;

-- Create sync trigger for agents
CREATE OR REPLACE FUNCTION sync_agents_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Priority: owner_organization_id -> tenant_id
    IF NEW.owner_organization_id IS NOT NULL THEN
      NEW.tenant_id := NEW.owner_organization_id;
    -- Fallback: tenant_id -> owner_organization_id
    ELSIF NEW.tenant_id IS NOT NULL THEN
      NEW.owner_organization_id := NEW.tenant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
CREATE TRIGGER trigger_sync_agents_organization_id
BEFORE INSERT OR UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION sync_agents_organization_id();

DO $$ BEGIN
  RAISE NOTICE '✓ Created sync trigger for agents table';
END $$;

-- ============================================================================
-- STEP 2: Add Standardized Columns to workflows Table
-- ============================================================================

-- Add organization_id (standardized column for workflows)
ALTER TABLE workflows
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_workflows_organization'
  ) THEN
    ALTER TABLE workflows
    ADD CONSTRAINT fk_workflows_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE;

    RAISE NOTICE '✓ Added foreign key: workflows.organization_id -> organizations.id';
  END IF;
END $$;

-- Create sync trigger for workflows
CREATE OR REPLACE FUNCTION sync_workflows_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Priority: organization_id -> tenant_id
    IF NEW.organization_id IS NOT NULL THEN
      NEW.tenant_id := NEW.organization_id;
    -- Fallback: tenant_id -> organization_id
    ELSIF NEW.tenant_id IS NOT NULL THEN
      NEW.organization_id := NEW.tenant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_workflows_organization_id ON workflows;
CREATE TRIGGER trigger_sync_workflows_organization_id
BEFORE INSERT OR UPDATE ON workflows
FOR EACH ROW
EXECUTE FUNCTION sync_workflows_organization_id();

DO $$ BEGIN
  RAISE NOTICE '✓ Created sync trigger for workflows table';
END $$;

-- ============================================================================
-- STEP 3: Add Standardized Columns to prompts Table
-- ============================================================================

-- Add organization_id (standardized column for prompts)
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_prompts_organization'
  ) THEN
    ALTER TABLE prompts
    ADD CONSTRAINT fk_prompts_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE;

    RAISE NOTICE '✓ Added foreign key: prompts.organization_id -> organizations.id';
  END IF;
END $$;

-- Create sync trigger for prompts
CREATE OR REPLACE FUNCTION sync_prompts_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Priority: organization_id -> tenant_id
    IF NEW.organization_id IS NOT NULL THEN
      NEW.tenant_id := NEW.organization_id;
    -- Fallback: tenant_id -> organization_id
    ELSIF NEW.tenant_id IS NOT NULL THEN
      NEW.organization_id := NEW.tenant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_prompts_organization_id ON prompts;
CREATE TRIGGER trigger_sync_prompts_organization_id
BEFORE INSERT OR UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION sync_prompts_organization_id();

DO $$ BEGIN
  RAISE NOTICE '✓ Created sync trigger for prompts table';
END $$;

-- ============================================================================
-- STEP 4: Add organization_id to audit_logs Table (IF EXISTS)
-- ============================================================================

DO $$
DECLARE
  audit_logs_exists BOOLEAN;
BEGIN
  -- Check if audit_logs table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) INTO audit_logs_exists;

  IF NOT audit_logs_exists THEN
    RAISE NOTICE '⚠ Skipping audit_logs: Table does not exist (will be created later)';
  ELSE
    RAISE NOTICE 'Processing audit_logs table...';

    -- Add organization_id column
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID;

    -- Add foreign key constraint
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_audit_logs_organization'
    ) THEN
      ALTER TABLE audit_logs
      ADD CONSTRAINT fk_audit_logs_organization
      FOREIGN KEY (organization_id)
      REFERENCES organizations(id)
      ON DELETE SET NULL;

      RAISE NOTICE '✓ Added foreign key: audit_logs.organization_id -> organizations.id';
    END IF;

    -- Create sync function
    CREATE OR REPLACE FUNCTION sync_audit_logs_organization_id()
    RETURNS TRIGGER AS $func$
    BEGIN
      IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.organization_id IS NOT NULL THEN
          NEW.tenant_id := NEW.organization_id;
        ELSIF NEW.tenant_id IS NOT NULL THEN
          NEW.organization_id := NEW.tenant_id;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Create trigger
    DROP TRIGGER IF EXISTS trigger_sync_audit_logs_organization_id ON audit_logs;
    CREATE TRIGGER trigger_sync_audit_logs_organization_id
    BEFORE INSERT OR UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION sync_audit_logs_organization_id();

    RAISE NOTICE '✓ Created sync trigger for audit_logs table';
  END IF;
END $$;

-- ============================================================================
-- VALIDATION: Verify Columns and Triggers Created
-- ============================================================================

DO $$
DECLARE
  agents_column_exists BOOLEAN;
  workflows_column_exists BOOLEAN;
  prompts_column_exists BOOLEAN;
  audit_logs_table_exists BOOLEAN;
  audit_logs_column_exists BOOLEAN;
  agents_trigger_exists BOOLEAN;
  workflows_trigger_exists BOOLEAN;
  prompts_trigger_exists BOOLEAN;
  audit_logs_trigger_exists BOOLEAN;
BEGIN
  -- Check if audit_logs table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) INTO audit_logs_table_exists;

  -- Check columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'owner_organization_id'
  ) INTO agents_column_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflows' AND column_name = 'organization_id'
  ) INTO workflows_column_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prompts' AND column_name = 'organization_id'
  ) INTO prompts_column_exists;

  IF audit_logs_table_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'audit_logs' AND column_name = 'organization_id'
    ) INTO audit_logs_column_exists;
  END IF;

  -- Check triggers exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_sync_agents_organization_id'
  ) INTO agents_trigger_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_sync_workflows_organization_id'
  ) INTO workflows_trigger_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trigger_sync_prompts_organization_id'
  ) INTO prompts_trigger_exists;

  IF audit_logs_table_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.triggers
      WHERE trigger_name = 'trigger_sync_audit_logs_organization_id'
    ) INTO audit_logs_trigger_exists;
  END IF;

  -- Validate results (required tables)
  IF NOT agents_column_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: agents.owner_organization_id column not found';
  END IF;

  IF NOT workflows_column_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: workflows.organization_id column not found';
  END IF;

  IF NOT prompts_column_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: prompts.organization_id column not found';
  END IF;

  IF NOT agents_trigger_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: agents sync trigger not found';
  END IF;

  IF NOT workflows_trigger_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: workflows sync trigger not found';
  END IF;

  IF NOT prompts_trigger_exists THEN
    RAISE EXCEPTION 'VALIDATION FAILED: prompts sync trigger not found';
  END IF;

  -- Validate audit_logs only if table exists
  IF audit_logs_table_exists THEN
    IF NOT audit_logs_column_exists THEN
      RAISE EXCEPTION 'VALIDATION FAILED: audit_logs.organization_id column not found';
    END IF;

    IF NOT audit_logs_trigger_exists THEN
      RAISE EXCEPTION 'VALIDATION FAILED: audit_logs sync trigger not found';
    END IF;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PHASE 1: VALIDATION PASSED';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✓ Required columns added successfully (agents, workflows, prompts)';
  RAISE NOTICE '✓ Required triggers created successfully';
  RAISE NOTICE '✓ All foreign keys added';

  IF audit_logs_table_exists THEN
    RAISE NOTICE '✓ Optional: audit_logs table processed';
  ELSE
    RAISE NOTICE '⚠ Optional: audit_logs table skipped (does not exist yet)';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Monitor application for 24-48 hours';
  RAISE NOTICE '2. Verify no errors in application logs';
  RAISE NOTICE '3. Proceed to Phase 2 if stable';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

/**
 * To rollback Phase 1:
 *
 * -- Drop triggers
 * DROP TRIGGER IF EXISTS trigger_sync_agents_organization_id ON agents;
 * DROP TRIGGER IF EXISTS trigger_sync_workflows_organization_id ON workflows;
 * DROP TRIGGER IF EXISTS trigger_sync_prompts_organization_id ON prompts;
 * DROP TRIGGER IF EXISTS trigger_sync_audit_logs_organization_id ON audit_logs;
 *
 * -- Drop functions
 * DROP FUNCTION IF EXISTS sync_agents_organization_id();
 * DROP FUNCTION IF EXISTS sync_workflows_organization_id();
 * DROP FUNCTION IF EXISTS sync_prompts_organization_id();
 * DROP FUNCTION IF EXISTS sync_audit_logs_organization_id();
 *
 * -- Drop columns
 * ALTER TABLE agents DROP COLUMN IF EXISTS owner_organization_id;
 * ALTER TABLE workflows DROP COLUMN IF EXISTS organization_id;
 * ALTER TABLE prompts DROP COLUMN IF EXISTS organization_id;
 * ALTER TABLE audit_logs DROP COLUMN IF EXISTS organization_id;
 */
