-- ============================================================================
-- VITAL PLATFORM - ADD TENANT COLUMNS (SIMPLE VERSION)
-- Migration: Add Tenant Columns to Agents Table
-- Version: 1.0.2 (SIMPLE - Just add columns, no new tables)
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Add tenant ownership and sharing columns to existing agents table
-- Simplified: Only modifies agents table, doesn't create tools/prompts/workflows
-- ============================================================================

-- ============================================================================
-- 1. ADD TENANT COLUMNS TO AGENTS TABLE
-- ============================================================================

DO $$
BEGIN
    -- Add tenant ownership column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE agents ADD COLUMN tenant_id UUID;
        RAISE NOTICE 'Added column: tenant_id';
    END IF;

    -- Add created_by_user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'created_by_user_id'
    ) THEN
        ALTER TABLE agents ADD COLUMN created_by_user_id UUID;
        RAISE NOTICE 'Added column: created_by_user_id';
    END IF;

    -- Add is_shared
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'is_shared'
    ) THEN
        ALTER TABLE agents ADD COLUMN is_shared BOOLEAN DEFAULT false NOT NULL;
        RAISE NOTICE 'Added column: is_shared';
    END IF;

    -- Add sharing_mode
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'sharing_mode'
    ) THEN
        ALTER TABLE agents ADD COLUMN sharing_mode VARCHAR(50) DEFAULT 'private';
        RAISE NOTICE 'Added column: sharing_mode';
    END IF;

    -- Add shared_with
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'shared_with'
    ) THEN
        ALTER TABLE agents ADD COLUMN shared_with UUID[] DEFAULT '{}';
        RAISE NOTICE 'Added column: shared_with';
    END IF;

    -- Add resource_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'resource_type'
    ) THEN
        ALTER TABLE agents ADD COLUMN resource_type VARCHAR(50) DEFAULT 'custom';
        RAISE NOTICE 'Added column: resource_type';
    END IF;

    -- Add tags
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'tags'
    ) THEN
        ALTER TABLE agents ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added column: tags';
    END IF;

    -- Add category
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'category'
    ) THEN
        ALTER TABLE agents ADD COLUMN category VARCHAR(100);
        RAISE NOTICE 'Added column: category';
    END IF;

    -- Add access_count
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'access_count'
    ) THEN
        ALTER TABLE agents ADD COLUMN access_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added column: access_count';
    END IF;

    -- Add last_accessed_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'last_accessed_at'
    ) THEN
        ALTER TABLE agents ADD COLUMN last_accessed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added column: last_accessed_at';
    END IF;
END $$;

-- ============================================================================
-- 2. ADD FOREIGN KEY CONSTRAINT (after column exists)
-- ============================================================================

DO $$
BEGIN
    -- Add FK constraint to tenants table if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'agents_tenant_id_fkey'
    ) THEN
        ALTER TABLE agents
            ADD CONSTRAINT agents_tenant_id_fkey
            FOREIGN KEY (tenant_id)
            REFERENCES tenants(id)
            ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint: agents_tenant_id_fkey';
    END IF;
END $$;

-- ============================================================================
-- 3. ADD CHECK CONSTRAINTS
-- ============================================================================

DO $$
BEGIN
    -- Check constraint for sharing_mode
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'agents_sharing_mode_check'
    ) THEN
        ALTER TABLE agents
            ADD CONSTRAINT agents_sharing_mode_check
            CHECK (sharing_mode IN ('private', 'global', 'selective'));
        RAISE NOTICE 'Added check constraint: agents_sharing_mode_check';
    END IF;

    -- Check constraint for resource_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'agents_resource_type_check'
    ) THEN
        ALTER TABLE agents
            ADD CONSTRAINT agents_resource_type_check
            CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom'));
        RAISE NOTICE 'Added check constraint: agents_resource_type_check';
    END IF;
END $$;

-- ============================================================================
-- 4. CREATE INDEXES FOR TENANT-BASED QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_sharing ON agents(is_shared, sharing_mode) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_agents_resource_type ON agents(resource_type);
CREATE INDEX IF NOT EXISTS idx_agents_shared_with ON agents USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags) WHERE array_length(tags, 1) > 0;

-- ============================================================================
-- 5. ADD COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN agents.tenant_id IS 'Owner tenant of this agent. NULL for legacy agents (will be assigned in Migration 4)';
COMMENT ON COLUMN agents.is_shared IS 'Whether this agent is shared with other tenants';
COMMENT ON COLUMN agents.sharing_mode IS 'Sharing mode: private (owner only), global (all tenants), selective (specific tenants)';
COMMENT ON COLUMN agents.shared_with IS 'Array of tenant IDs for selective sharing';
COMMENT ON COLUMN agents.resource_type IS 'Resource type: platform (shared with all), solution, industry, or custom (tenant-created)';
COMMENT ON COLUMN agents.tags IS 'Tags for organization and filtering';
COMMENT ON COLUMN agents.category IS 'Category for grouping agents';

-- ============================================================================
-- 6. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_column_count INTEGER;
    v_agent_count INTEGER;
BEGIN
    -- Count new columns added
    SELECT COUNT(*) INTO v_column_count
    FROM information_schema.columns
    WHERE table_name = 'agents'
    AND column_name IN ('tenant_id', 'is_shared', 'sharing_mode', 'shared_with', 'resource_type',
                        'tags', 'category', 'access_count', 'last_accessed_at', 'created_by_user_id');

    -- Count total agents
    SELECT COUNT(*) INTO v_agent_count FROM agents;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ Migration 20251026000002 (SIMPLE) completed successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Results:';
    RAISE NOTICE '   • Added % new columns to agents table', v_column_count;
    RAISE NOTICE '   • Total agents in database: %', v_agent_count;
    RAISE NOTICE '   • Foreign key constraint: agents → tenants';
    RAISE NOTICE '   • Indexes created: 5 indexes';
    RAISE NOTICE '';
    RAISE NOTICE '📋 New Columns:';
    RAISE NOTICE '   • tenant_id (UUID)         - Owner tenant';
    RAISE NOTICE '   • is_shared (BOOLEAN)      - Sharing flag';
    RAISE NOTICE '   • sharing_mode (VARCHAR)   - Sharing mode';
    RAISE NOTICE '   • shared_with (UUID[])     - Tenant IDs';
    RAISE NOTICE '   • resource_type (VARCHAR)  - Resource type';
    RAISE NOTICE '   • tags (TEXT[])            - Tags';
    RAISE NOTICE '   • category (VARCHAR)       - Category';
    RAISE NOTICE '';
    RAISE NOTICE '⏭️  Next Step:';
    RAISE NOTICE '   Run Migration 3: 20251026000003_update_rls_policies.sql';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
