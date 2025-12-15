-- =============================================================================
-- PHASE 2: MULTI-TENANCY FOUNDATION
-- =============================================================================
-- Purpose: Add tenant_id to all core tables, create tenants infrastructure
-- Time: ~10 minutes
-- Impact: Adds columns, creates default tenant, backfills data
-- =============================================================================

-- =============================================================================
-- STEP 1: CREATE TENANTS TABLE (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  domain varchar(255),

  -- Contact
  contact_email varchar(255) NOT NULL,
  contact_name varchar(255) NOT NULL,

  -- Billing
  tier tenant_tier NOT NULL DEFAULT 'free',
  status tenant_status NOT NULL DEFAULT 'trial',
  billing_email varchar(255),

  -- Limits
  max_users integer NOT NULL DEFAULT 5,
  max_agents integer NOT NULL DEFAULT 10,
  max_storage_gb integer NOT NULL DEFAULT 10,

  -- Current usage
  current_users integer NOT NULL DEFAULT 0 CHECK (current_users >= 0),
  current_agents integer NOT NULL DEFAULT 0 CHECK (current_agents >= 0),
  current_storage_gb numeric NOT NULL DEFAULT 0 CHECK (current_storage_gb >= 0),

  -- Trial management
  trial_ends_at timestamp with time zone,
  subscription_starts_at timestamp with time zone,
  subscription_ends_at timestamp with time zone,

  -- Feature flags
  features jsonb NOT NULL DEFAULT '{
    "custom_agents": true,
    "api_access": false,
    "advanced_analytics": false,
    "sso": false,
    "audit_logs": true
  }'::jsonb,

  -- Settings
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Audit
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,

  CONSTRAINT tenants_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT tenants_usage_within_limits CHECK (
    current_users <= max_users AND
    current_agents <= max_agents AND
    current_storage_gb <= max_storage_gb
  )
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tier);

COMMENT ON TABLE tenants IS 'Multi-tenant organization/customer accounts';

-- =============================================================================
-- STEP 2: CREATE TENANT MEMBERSHIP TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role tenant_role NOT NULL DEFAULT 'member',

  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  joined_at timestamp with time zone,
  last_active_at timestamp with time zone,

  CONSTRAINT tenant_members_unique UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_role ON tenant_members(tenant_id, role);

COMMENT ON TABLE tenant_members IS 'User membership in tenants with roles';

-- =============================================================================
-- STEP 3: CREATE DEFAULT TENANT
-- =============================================================================

INSERT INTO tenants (
  id,
  name,
  slug,
  contact_email,
  contact_name,
  tier,
  status,
  max_users,
  max_agents,
  max_storage_gb
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Default Tenant',
  'default',
  'admin@vital.ai',
  'System Administrator',
  'enterprise',
  'active',
  9999,
  9999,
  9999
) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✅ Default tenant created: 00000000-0000-0000-0000-000000000000';
END $$;

-- =============================================================================
-- STEP 4: ADD tenant_id TO CORE TABLES
-- =============================================================================

-- Table: agents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'agents'
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN tenant_id uuid;
    RAISE NOTICE '✅ Added tenant_id to agents table';
  ELSE
    RAISE NOTICE '⏭️  tenant_id already exists in agents table';
  END IF;
END $$;

-- Table: personas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'personas'
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE personas ADD COLUMN tenant_id uuid;
    RAISE NOTICE '✅ Added tenant_id to personas table';
  ELSE
    RAISE NOTICE '⏭️  tenant_id already exists in personas table';
  END IF;
END $$;

-- Table: jobs_to_be_done
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'jobs_to_be_done'
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE jobs_to_be_done ADD COLUMN tenant_id uuid;
    RAISE NOTICE '✅ Added tenant_id to jobs_to_be_done table';
  ELSE
    RAISE NOTICE '⏭️  tenant_id already exists in jobs_to_be_done table';
  END IF;
END $$;

-- Table: workflows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'workflows'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'workflows'
      AND column_name = 'tenant_id'
    ) THEN
      ALTER TABLE workflows ADD COLUMN tenant_id uuid;
      RAISE NOTICE '✅ Added tenant_id to workflows table';
    ELSE
      RAISE NOTICE '⏭️  tenant_id already exists in workflows table';
    END IF;
  ELSE
    RAISE NOTICE '⏭️  workflows table does not exist, skipping';
  END IF;
END $$;

-- Table: strategic_priorities
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'strategic_priorities'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'strategic_priorities'
      AND column_name = 'tenant_id'
    ) THEN
      ALTER TABLE strategic_priorities ADD COLUMN tenant_id uuid;
      RAISE NOTICE '✅ Added tenant_id to strategic_priorities table';
    ELSE
      RAISE NOTICE '⏭️  tenant_id already exists in strategic_priorities table';
    END IF;
  END IF;
END $$;

-- =============================================================================
-- STEP 5: BACKFILL tenant_id WITH DEFAULT TENANT
-- =============================================================================

-- Backfill agents
UPDATE agents
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Backfill personas
UPDATE personas
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Backfill jobs_to_be_done
UPDATE jobs_to_be_done
SET tenant_id = '00000000-0000-0000-0000-000000000000'
WHERE tenant_id IS NULL;

-- Backfill workflows (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
    UPDATE workflows SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
    RAISE NOTICE '✅ Backfilled tenant_id in workflows';
  END IF;
END $$;

-- Backfill strategic_priorities (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategic_priorities') THEN
    UPDATE strategic_priorities SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
    RAISE NOTICE '✅ Backfilled tenant_id in strategic_priorities';
  END IF;
END $$;

-- =============================================================================
-- STEP 6: ADD FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- agents
ALTER TABLE agents
  ADD CONSTRAINT agents_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- personas
ALTER TABLE personas
  ADD CONSTRAINT personas_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- jobs_to_be_done
ALTER TABLE jobs_to_be_done
  ADD CONSTRAINT jobs_to_be_done_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- workflows (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
    ALTER TABLE workflows
      ADD CONSTRAINT workflows_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added FK constraint to workflows';
  END IF;
END $$;

-- strategic_priorities (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategic_priorities') THEN
    ALTER TABLE strategic_priorities
      ADD CONSTRAINT strategic_priorities_tenant_id_fkey
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Added FK constraint to strategic_priorities';
  END IF;
END $$;

-- =============================================================================
-- STEP 7: MAKE tenant_id NOT NULL
-- =============================================================================

ALTER TABLE agents ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE personas ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE jobs_to_be_done ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
    ALTER TABLE workflows ALTER COLUMN tenant_id SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategic_priorities') THEN
    ALTER TABLE strategic_priorities ALTER COLUMN tenant_id SET NOT NULL;
  END IF;
END $$;

-- =============================================================================
-- STEP 8: ADD INDEXES FOR tenant_id
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_agents_tenant ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_personas_tenant ON personas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_tenant ON jobs_to_be_done(tenant_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') THEN
    CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows(tenant_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategic_priorities') THEN
    CREATE INDEX IF NOT EXISTS idx_strategic_priorities_tenant ON strategic_priorities(tenant_id);
  END IF;
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  tenant_count INTEGER;
  agents_with_tenant INTEGER;
  personas_with_tenant INTEGER;
  jtbd_with_tenant INTEGER;
BEGIN
  -- Count tenants
  SELECT COUNT(*) INTO tenant_count FROM tenants;

  -- Count records with tenant_id
  SELECT COUNT(*) INTO agents_with_tenant FROM agents WHERE tenant_id IS NOT NULL;
  SELECT COUNT(*) INTO personas_with_tenant FROM personas WHERE tenant_id IS NOT NULL;
  SELECT COUNT(*) INTO jtbd_with_tenant FROM jobs_to_be_done WHERE tenant_id IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MULTI-TENANCY FOUNDATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tenants: %', tenant_count;
  RAISE NOTICE 'Agents with tenant_id: %', agents_with_tenant;
  RAISE NOTICE 'Personas with tenant_id: %', personas_with_tenant;
  RAISE NOTICE 'JTBDs with tenant_id: %', jtbd_with_tenant;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ready for Phase 3: Fix NULL Fields';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================
/*
-- Drop constraints first
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_tenant_id_fkey;
ALTER TABLE personas DROP CONSTRAINT IF EXISTS personas_tenant_id_fkey;
ALTER TABLE jobs_to_be_done DROP CONSTRAINT IF EXISTS jobs_to_be_done_tenant_id_fkey;
ALTER TABLE workflows DROP CONSTRAINT IF EXISTS workflows_tenant_id_fkey;
ALTER TABLE strategic_priorities DROP CONSTRAINT IF EXISTS strategic_priorities_tenant_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS idx_agents_tenant;
DROP INDEX IF EXISTS idx_personas_tenant;
DROP INDEX IF EXISTS idx_jtbd_tenant;
DROP INDEX IF EXISTS idx_workflows_tenant;
DROP INDEX IF EXISTS idx_strategic_priorities_tenant;

-- Drop columns
ALTER TABLE agents DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE personas DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE jobs_to_be_done DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE workflows DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE strategic_priorities DROP COLUMN IF EXISTS tenant_id;

-- Drop tables
DROP TABLE IF EXISTS tenant_members CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
*/
