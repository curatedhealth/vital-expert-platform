-- =============================================================================
-- PHASE 2: MULTI-TENANCY FOUNDATION (SAFE VERSION)
-- =============================================================================
-- Purpose: Add tenant_id to all core tables, create tenants infrastructure
-- Time: ~10 minutes
-- Impact: Adds columns, creates default tenant, backfills data
-- NOTE: This version checks if tables exist before trying to modify them
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
-- STEP 4: ADD tenant_id TO CORE TABLES (ONLY IF THEY EXIST)
-- =============================================================================

-- Helper function to add tenant_id to a table if it exists
DO $$
DECLARE
  table_names TEXT[] := ARRAY['agents', 'personas', 'jobs_to_be_done', 'workflows', 'strategic_priorities'];
  table_name TEXT;
  table_exists BOOLEAN;
  column_exists BOOLEAN;
  record_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Adding tenant_id to core tables';
  RAISE NOTICE '========================================';

  FOREACH table_name IN ARRAY table_names
  LOOP
    -- Check if table exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND information_schema.tables.table_name = table_name
    ) INTO table_exists;

    IF NOT table_exists THEN
      RAISE WARNING '⏭️  Table "%" does not exist - skipping', table_name;
      CONTINUE;
    END IF;

    -- Check if column already exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND information_schema.columns.table_name = table_name
      AND column_name = 'tenant_id'
    ) INTO column_exists;

    IF column_exists THEN
      RAISE NOTICE '⏭️  tenant_id already exists in % table', table_name;
      CONTINUE;
    END IF;

    -- Add column
    EXECUTE format('ALTER TABLE %I ADD COLUMN tenant_id uuid', table_name);
    RAISE NOTICE '✅ Added tenant_id to % table', table_name;

    -- Backfill with default tenant
    EXECUTE format('UPDATE %I SET tenant_id = %L WHERE tenant_id IS NULL',
      table_name, '00000000-0000-0000-0000-000000000000');
    EXECUTE format('SELECT COUNT(*) FROM %I WHERE tenant_id IS NOT NULL', table_name) INTO record_count;
    RAISE NOTICE '✅ Backfilled % records in % with default tenant_id', record_count, table_name;

    -- Make NOT NULL
    EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET NOT NULL', table_name);
    RAISE NOTICE '✅ Made tenant_id NOT NULL on %', table_name;

    -- Add FK constraint
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE',
      table_name, table_name || '_tenant_id_fkey');
    RAISE NOTICE '✅ Added FK constraint on %.tenant_id', table_name;

    -- Create index
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant ON %I(tenant_id) WHERE deleted_at IS NULL',
      table_name, table_name);
    RAISE NOTICE '✅ Created index on %.tenant_id', table_name;
    RAISE NOTICE '';

  END LOOP;
END $$;

-- =============================================================================
-- STEP 5: VERIFICATION
-- =============================================================================

DO $$
DECLARE
  tenant_count INTEGER;
  agents_exists BOOLEAN;
  personas_exists BOOLEAN;
  jtbd_exists BOOLEAN;
  agents_with_tenant INTEGER := 0;
  personas_with_tenant INTEGER := 0;
  jtbd_with_tenant INTEGER := 0;
BEGIN
  -- Count tenants
  SELECT COUNT(*) INTO tenant_count FROM tenants;

  -- Check if tables exist and count records
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'agents'
  ) INTO agents_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'personas'
  ) INTO personas_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'jobs_to_be_done'
  ) INTO jtbd_exists;

  -- Count records with tenant_id (only if table exists)
  IF agents_exists THEN
    SELECT COUNT(*) INTO agents_with_tenant FROM agents WHERE tenant_id IS NOT NULL;
  END IF;

  IF personas_exists THEN
    SELECT COUNT(*) INTO personas_with_tenant FROM personas WHERE tenant_id IS NOT NULL;
  END IF;

  IF jtbd_exists THEN
    SELECT COUNT(*) INTO jtbd_with_tenant FROM jobs_to_be_done WHERE tenant_id IS NOT NULL;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MULTI-TENANCY FOUNDATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tenants: %', tenant_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Core Tables Status:';
  RAISE NOTICE '  agents: % (% with tenant_id)', CASE WHEN agents_exists THEN 'EXISTS' ELSE 'MISSING' END, agents_with_tenant;
  RAISE NOTICE '  personas: % (% with tenant_id)', CASE WHEN personas_exists THEN 'EXISTS' ELSE 'MISSING' END, personas_with_tenant;
  RAISE NOTICE '  jobs_to_be_done: % (% with tenant_id)', CASE WHEN jtbd_exists THEN 'EXISTS' ELSE 'MISSING' END, jtbd_with_tenant;
  RAISE NOTICE '';

  IF NOT agents_exists OR NOT personas_exists OR NOT jtbd_exists THEN
    RAISE WARNING '⚠️  Some core tables are MISSING!';
    RAISE WARNING 'Your database reset dropped existing tables.';
    RAISE WARNING '';
    RAISE WARNING 'RECOMMENDED ACTIONS:';
    RAISE WARNING '1. If you have a backup: Restore from backup';
    RAISE WARNING '2. If no backup: Run "supabase db push" to apply all migrations';
    RAISE WARNING '3. Or manually apply the table creation migrations';
  ELSE
    RAISE NOTICE '✅ Ready for Phase 3: Create Test Tenants';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

-- =============================================================================
-- ROLLBACK (if needed)
-- =============================================================================
/*
-- Drop constraints first (only from tables that exist)
DO $$
DECLARE
  table_names TEXT[] := ARRAY['agents', 'personas', 'jobs_to_be_done', 'workflows', 'strategic_priorities'];
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY table_names
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND information_schema.tables.table_name = table_name) THEN
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', table_name, table_name || '_tenant_id_fkey');
      EXECUTE format('DROP INDEX IF EXISTS idx_%I_tenant', table_name);
      EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS tenant_id', table_name);
    END IF;
  END LOOP;
END $$;

-- Drop tables
DROP TABLE IF EXISTS tenant_members CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
*/
