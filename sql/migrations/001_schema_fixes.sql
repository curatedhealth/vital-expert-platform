-- ============================================================================
-- SCHEMA FIXES FOR MULTI-TENANT MIGRATION
-- ============================================================================
-- Description: Fix schema mismatches and add missing tables/columns
-- Date: 2025-11-18
-- Purpose: Prepare database schema for multi-tenant data migration
-- Dependencies: 000_pre_migration_validation.sql
-- Rollback: 001_schema_fixes_rollback.sql
-- ============================================================================

BEGIN;

-- Track migration progress
INSERT INTO migration_tracking (migration_name, phase, status)
VALUES ('multi_tenant_migration', '001_schema_fixes', 'started');

SAVEPOINT schema_fixes_start;

-- ============================================================================
-- FIX #1: Tools Table - Add category column
-- ============================================================================

\echo 'Adding category column to tools table...'

-- Check if category column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'category'
    ) THEN
        -- Add category column
        ALTER TABLE tools
        ADD COLUMN category TEXT;

        -- Populate from category_id
        UPDATE tools t
        SET category = tc.name
        FROM tool_categories tc
        WHERE t.category_id = tc.id;

        -- Add index for performance
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tools_category
            ON tools(category);

        -- Add index for tenant + category queries
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tools_tenant_category
            ON tools(tenant_id, category);

        RAISE NOTICE 'Category column added to tools table';
    ELSE
        RAISE NOTICE 'Category column already exists in tools table';
    END IF;
END $$;

-- ============================================================================
-- FIX #2: Add tenant_id to tools if missing
-- ============================================================================

\echo 'Ensuring tenant_id column exists on tools table...'

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE tools
        ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

        CREATE INDEX IF NOT EXISTS idx_tools_tenant_id ON tools(tenant_id);

        RAISE NOTICE 'tenant_id column added to tools table';
    ELSE
        RAISE NOTICE 'tenant_id column already exists in tools table';
    END IF;
END $$;

-- ============================================================================
-- FIX #3: Ensure tenant_id on all required tables
-- ============================================================================

\echo 'Checking tenant_id columns on all tables...'

-- Prompts
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prompts_tenant_id
    ON prompts(tenant_id);

-- Knowledge base
ALTER TABLE knowledge_base
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_base_tenant_id
    ON knowledge_base(tenant_id);

-- Knowledge sources
ALTER TABLE knowledge_sources
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_sources_tenant_id
    ON knowledge_sources(tenant_id);

-- ============================================================================
-- FIX #4: Create business_functions table (if doesn't exist)
-- ============================================================================

\echo 'Creating business_functions table...'

CREATE TABLE IF NOT EXISTS business_functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Organization
    department TEXT,
    healthcare_category TEXT,

    -- Compliance
    regulatory_requirements TEXT[] DEFAULT '{}',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT business_functions_unique_name_per_tenant
        UNIQUE (tenant_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_functions_tenant
    ON business_functions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_business_functions_department
    ON business_functions(department);

CREATE INDEX IF NOT EXISTS idx_business_functions_category
    ON business_functions(healthcare_category);

-- RLS policies
ALTER TABLE business_functions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_functions_tenant_isolation"
    ON business_functions
    FOR ALL
    USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('super_admin', 'admin'))
    );

COMMENT ON TABLE business_functions IS 'Healthcare business functions and departments';

-- ============================================================================
-- FIX #5: Create org_departments table (if doesn't exist)
-- ============================================================================

\echo 'Creating org_departments table...'

CREATE TABLE IF NOT EXISTS org_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Hierarchy
    parent_department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 1,

    -- Healthcare specific
    healthcare_domain TEXT,
    clinical_area TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT org_departments_unique_code_per_tenant
        UNIQUE (tenant_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_departments_tenant
    ON org_departments(tenant_id);

CREATE INDEX IF NOT EXISTS idx_org_departments_parent
    ON org_departments(parent_department_id);

CREATE INDEX IF NOT EXISTS idx_org_departments_domain
    ON org_departments(healthcare_domain);

CREATE INDEX IF NOT EXISTS idx_org_departments_active
    ON org_departments(is_active) WHERE is_active = TRUE;

-- RLS policies
ALTER TABLE org_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_departments_tenant_isolation"
    ON org_departments
    FOR ALL
    USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('super_admin', 'admin'))
    );

COMMENT ON TABLE org_departments IS 'Organizational departments structure';

-- ============================================================================
-- FIX #6: Create organizational_levels table (if doesn't exist)
-- ============================================================================

\echo 'Creating organizational_levels table...'

CREATE TABLE IF NOT EXISTS organizational_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Hierarchy
    level_number INTEGER NOT NULL,
    parent_level_id UUID REFERENCES organizational_levels(id) ON DELETE SET NULL,

    -- Role type
    role_type TEXT, -- 'executive', 'management', 'professional', 'operational'

    -- Permissions
    default_permissions JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT organizational_levels_unique_code_per_tenant
        UNIQUE (tenant_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizational_levels_tenant
    ON organizational_levels(tenant_id);

CREATE INDEX IF NOT EXISTS idx_organizational_levels_number
    ON organizational_levels(level_number);

CREATE INDEX IF NOT EXISTS idx_organizational_levels_type
    ON organizational_levels(role_type);

CREATE INDEX IF NOT EXISTS idx_organizational_levels_active
    ON organizational_levels(is_active) WHERE is_active = TRUE;

-- RLS policies
ALTER TABLE organizational_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizational_levels_tenant_isolation"
    ON organizational_levels
    FOR ALL
    USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('super_admin', 'admin'))
    );

COMMENT ON TABLE organizational_levels IS 'Organizational hierarchy levels and roles';

-- ============================================================================
-- FIX #7: Add updated_at triggers to new tables
-- ============================================================================

\echo 'Adding updated_at triggers...'

CREATE TRIGGER update_business_functions_updated_at
    BEFORE UPDATE ON business_functions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_departments_updated_at
    BEFORE UPDATE ON org_departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizational_levels_updated_at
    BEFORE UPDATE ON organizational_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIX #8: Create composite indexes for common queries
-- ============================================================================

\echo 'Creating composite indexes for performance...'

-- Agents: tenant + tier + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_tenant_tier_status
    ON agents(tenant_id, tier, status)
    WHERE status = 'active';

-- Prompts: tenant + domain + status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prompts_tenant_domain_status
    ON prompts(tenant_id, domain, status)
    WHERE status = 'active';

-- Knowledge base: tenant + domain + active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_base_tenant_domain_active
    ON knowledge_base(tenant_id, domain, is_active)
    WHERE is_active = TRUE;

-- Tools: tenant + tool_type + active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tools_tenant_type_active
    ON tools(tenant_id, tool_type, is_active)
    WHERE is_active = TRUE;

-- ============================================================================
-- VALIDATION
-- ============================================================================

\echo 'Validating schema fixes...'

DO $$
DECLARE
    v_tools_category_exists BOOLEAN;
    v_tools_tenant_exists BOOLEAN;
    v_business_functions_exists BOOLEAN;
    v_org_departments_exists BOOLEAN;
    v_organizational_levels_exists BOOLEAN;
BEGIN
    -- Check tools.category column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'category'
    ) INTO v_tools_category_exists;

    -- Check tools.tenant_id column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tools' AND column_name = 'tenant_id'
    ) INTO v_tools_tenant_exists;

    -- Check tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'business_functions'
    ) INTO v_business_functions_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'org_departments'
    ) INTO v_org_departments_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'organizational_levels'
    ) INTO v_organizational_levels_exists;

    -- Validation
    IF NOT v_tools_category_exists THEN
        RAISE EXCEPTION 'Validation failed: tools.category column does not exist';
    END IF;

    IF NOT v_tools_tenant_exists THEN
        RAISE EXCEPTION 'Validation failed: tools.tenant_id column does not exist';
    END IF;

    IF NOT v_business_functions_exists THEN
        RAISE EXCEPTION 'Validation failed: business_functions table does not exist';
    END IF;

    IF NOT v_org_departments_exists THEN
        RAISE EXCEPTION 'Validation failed: org_departments table does not exist';
    END IF;

    IF NOT v_organizational_levels_exists THEN
        RAISE EXCEPTION 'Validation failed: organizational_levels table does not exist';
    END IF;

    RAISE NOTICE 'Schema validation passed!';
END $$;

-- ============================================================================
-- COMMIT
-- ============================================================================

-- Update migration tracking
UPDATE migration_tracking
SET status = 'completed',
    completed_at = NOW(),
    metrics = jsonb_build_object(
        'tools_category_added', true,
        'tools_tenant_added', true,
        'business_functions_created', true,
        'org_departments_created', true,
        'organizational_levels_created', true
    )
WHERE migration_name = 'multi_tenant_migration'
  AND phase = '001_schema_fixes';

COMMIT;

\echo '============================================'
\echo 'Schema fixes completed successfully!'
\echo '============================================'
