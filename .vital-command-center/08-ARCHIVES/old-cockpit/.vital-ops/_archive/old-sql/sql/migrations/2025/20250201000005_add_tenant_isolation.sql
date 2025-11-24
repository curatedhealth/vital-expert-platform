-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT RESOURCES (Phase 7.1)
-- Migration: Add Tenant Isolation to Resource Tables
-- Version: 2.0.0
-- Date: 2025-02-01
-- ============================================================================
-- Purpose: Add tenant ownership and sharing columns to all resource tables:
--   - agents
--   - tools (create if doesn't exist)
--   - prompts (create if doesn't exist)
-- ============================================================================
-- Note: This migration is idempotent (checks for existing columns first)
-- ============================================================================

-- ============================================================================
-- 1. ADD TENANT COLUMNS TO AGENTS TABLE
-- ============================================================================

DO $$
BEGIN
    -- Add tenant ownership columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE agents
            ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

        RAISE NOTICE 'Added tenant_id column to agents table';
    ELSE
        RAISE NOTICE 'tenant_id column already exists in agents table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'created_by_user_id'
    ) THEN
        ALTER TABLE agents
            ADD COLUMN created_by_user_id UUID;  -- References auth.users

        RAISE NOTICE 'Added created_by_user_id column to agents table';
    ELSE
        RAISE NOTICE 'created_by_user_id column already exists in agents table';
    END IF;

    -- Add sharing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'is_shared'
    ) THEN
        ALTER TABLE agents
            ADD COLUMN is_shared BOOLEAN DEFAULT false NOT NULL;

        RAISE NOTICE 'Added is_shared column to agents table';
    ELSE
        RAISE NOTICE 'is_shared column already exists in agents table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'sharing_mode'
    ) THEN
        ALTER TABLE agents
            ADD COLUMN sharing_mode VARCHAR(50) DEFAULT 'private'
                CHECK (sharing_mode IN ('private', 'global', 'selective'));

        RAISE NOTICE 'Added sharing_mode column to agents table';
    ELSE
        RAISE NOTICE 'sharing_mode column already exists in agents table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'shared_with'
    ) THEN
        ALTER TABLE agents
            ADD COLUMN shared_with UUID[] DEFAULT '{}';

        RAISE NOTICE 'Added shared_with column to agents table';
    ELSE
        RAISE NOTICE 'shared_with column already exists in agents table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'resource_type'
    ) THEN
        ALTER TABLE agents
            ADD COLUMN resource_type VARCHAR(50) DEFAULT 'custom'
                CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom'));

        RAISE NOTICE 'Added resource_type column to agents table';
    ELSE
        RAISE NOTICE 'resource_type column already exists in agents table';
    END IF;
END $$;

-- Create indexes for tenant-based queries
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_sharing ON agents(is_shared, sharing_mode) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_agents_resource_type ON agents(resource_type);
CREATE INDEX IF NOT EXISTS idx_agents_shared_with ON agents USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'agents_tenant_id_fkey'
        AND table_name = 'agents'
    ) THEN
        ALTER TABLE agents
            ADD CONSTRAINT agents_tenant_id_fkey
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

        RAISE NOTICE 'Added foreign key constraint for agents.tenant_id';
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN agents.tenant_id IS 'Owner tenant of this agent. NULL for legacy agents (will be backfilled)';
COMMENT ON COLUMN agents.is_shared IS 'Whether this agent is shared with other tenants';
COMMENT ON COLUMN agents.sharing_mode IS 'Sharing mode: private (owner only), global (all tenants), selective (specific tenants)';
COMMENT ON COLUMN agents.shared_with IS 'Array of tenant IDs for selective sharing';
COMMENT ON COLUMN agents.resource_type IS 'Resource type: platform (shared with all), solution (solution-specific), industry (industry-specific), custom (tenant-created)';

-- ============================================================================
-- 2. CREATE OR UPDATE TOOLS TABLE WITH TENANT SUPPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS tools (
    -- Primary Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ownership
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by_user_id UUID,

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(100),

    -- Tool Configuration
    tool_type VARCHAR(50) CHECK (tool_type IN ('api', 'function', 'integration', 'search', 'calculation')),
    endpoint_url VARCHAR(500),
    method VARCHAR(10) CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
    headers JSONB DEFAULT '{}'::jsonb,
    parameters_schema JSONB DEFAULT '{}'::jsonb,  -- JSON Schema for parameters
    response_schema JSONB DEFAULT '{}'::jsonb,    -- JSON Schema for response

    -- Authentication
    auth_type VARCHAR(50) CHECK (auth_type IN ('none', 'api_key', 'oauth', 'bearer')),
    auth_config JSONB DEFAULT '{}'::jsonb,

    -- Sharing Configuration
    is_shared BOOLEAN DEFAULT false NOT NULL,
    sharing_mode VARCHAR(50) DEFAULT 'private'
        CHECK (sharing_mode IN ('private', 'global', 'selective')),
    shared_with UUID[] DEFAULT '{}',
    resource_type VARCHAR(50) DEFAULT 'custom'
        CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom')),

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    capabilities TEXT[] DEFAULT '{}',

    -- Usage & Performance
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    average_response_time INTEGER,  -- milliseconds
    success_rate DECIMAL(5,2),

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    enabled BOOLEAN DEFAULT true,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Create indexes for tools
CREATE INDEX IF NOT EXISTS idx_tools_tenant ON tools(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tools_sharing ON tools(is_shared, sharing_mode) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_tools_resource_type ON tools(resource_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tools_shared_with ON tools USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_tools_tags ON tools USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status) WHERE deleted_at IS NULL;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE tools IS 'Tools that agents can use (APIs, functions, integrations)';
COMMENT ON COLUMN tools.tenant_id IS 'Owner tenant of this tool';
COMMENT ON COLUMN tools.is_shared IS 'Whether this tool is shared with other tenants';

-- ============================================================================
-- 3. CREATE OR UPDATE PROMPTS TABLE WITH TENANT SUPPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompts (
    -- Primary Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ownership
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by_user_id UUID,

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),

    -- Prompt Content
    prompt_text TEXT NOT NULL,
    system_prompt TEXT,
    user_prompt_template TEXT,
    assistant_prompt TEXT,

    -- Configuration
    variables JSONB DEFAULT '[]'::jsonb,  -- Array of variable names expected in template
    example_inputs JSONB DEFAULT '[]'::jsonb,
    example_outputs JSONB DEFAULT '[]'::jsonb,

    -- Model Settings
    recommended_model VARCHAR(50),
    temperature DECIMAL(3,2),
    max_tokens INTEGER,
    top_p DECIMAL(3,2),

    -- Use Cases
    use_cases TEXT[] DEFAULT '{}',
    target_roles TEXT[] DEFAULT '{}',  -- Who should use this prompt

    -- Sharing Configuration
    is_shared BOOLEAN DEFAULT false NOT NULL,
    sharing_mode VARCHAR(50) DEFAULT 'private'
        CHECK (sharing_mode IN ('private', 'global', 'selective')),
    shared_with UUID[] DEFAULT '{}',
    resource_type VARCHAR(50) DEFAULT 'custom'
        CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom')),

    -- Metadata
    tags TEXT[] DEFAULT '{}',

    -- Usage & Quality
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    quality_score DECIMAL(3,2),
    user_rating DECIMAL(3,2),

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'draft')),
    version VARCHAR(20) DEFAULT '1.0.0',

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Create indexes for prompts
CREATE INDEX IF NOT EXISTS idx_prompts_tenant ON prompts(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prompts_sharing ON prompts(is_shared, sharing_mode) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_prompts_resource_type ON prompts(resource_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prompts_shared_with ON prompts USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status) WHERE deleted_at IS NULL;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE prompts IS 'Reusable prompt templates for agents and users';
COMMENT ON COLUMN prompts.tenant_id IS 'Owner tenant of this prompt';
COMMENT ON COLUMN prompts.is_shared IS 'Whether this prompt is shared with other tenants';

-- ============================================================================
-- 4. ADD TENANT COLUMNS TO RAG_KNOWLEDGE_SOURCES (if exists)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rag_knowledge_sources') THEN
        -- Add tenant columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rag_knowledge_sources' AND column_name = 'tenant_id'
        ) THEN
            ALTER TABLE rag_knowledge_sources
                ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

            RAISE NOTICE 'Added tenant_id column to rag_knowledge_sources table';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rag_knowledge_sources' AND column_name = 'created_by_user_id'
        ) THEN
            ALTER TABLE rag_knowledge_sources
                ADD COLUMN created_by_user_id UUID;

            RAISE NOTICE 'Added created_by_user_id column to rag_knowledge_sources table';
        END IF;

        -- Add sharing columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rag_knowledge_sources' AND column_name = 'is_shared'
        ) THEN
            ALTER TABLE rag_knowledge_sources
                ADD COLUMN is_shared BOOLEAN DEFAULT false NOT NULL;

            RAISE NOTICE 'Added is_shared column to rag_knowledge_sources table';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rag_knowledge_sources' AND column_name = 'sharing_mode'
        ) THEN
            ALTER TABLE rag_knowledge_sources
                ADD COLUMN sharing_mode VARCHAR(50) DEFAULT 'private'
                    CHECK (sharing_mode IN ('private', 'global', 'selective'));

            RAISE NOTICE 'Added sharing_mode column to rag_knowledge_sources table';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rag_knowledge_sources' AND column_name = 'shared_with'
        ) THEN
            ALTER TABLE rag_knowledge_sources
                ADD COLUMN shared_with UUID[] DEFAULT '{}';

            RAISE NOTICE 'Added shared_with column to rag_knowledge_sources table';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rag_knowledge_sources' AND column_name = 'resource_type'
        ) THEN
            ALTER TABLE rag_knowledge_sources
                ADD COLUMN resource_type VARCHAR(50) DEFAULT 'custom'
                    CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom'));

            RAISE NOTICE 'Added resource_type column to rag_knowledge_sources table';
        END IF;

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_rag_sources_tenant ON rag_knowledge_sources(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_rag_sources_sharing ON rag_knowledge_sources(is_shared, sharing_mode) WHERE is_shared = true;
        CREATE INDEX IF NOT EXISTS idx_rag_sources_shared_with ON rag_knowledge_sources USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;
    ELSE
        RAISE NOTICE 'Table rag_knowledge_sources does not exist, skipping';
    END IF;
END $$;

-- ============================================================================
-- 5. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_agents_has_tenant BOOLEAN;
    v_tools_exists BOOLEAN;
    v_prompts_exists BOOLEAN;
    v_agents_indexes_count INTEGER;
BEGIN
    -- Check if agents has tenant_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'tenant_id'
    ) INTO v_agents_has_tenant;

    -- Check if tools table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'tools'
    ) INTO v_tools_exists;

    -- Check if prompts table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'prompts'
    ) INTO v_prompts_exists;

    -- Count indexes on agents table
    SELECT COUNT(*) INTO v_agents_indexes_count
    FROM pg_indexes
    WHERE tablename = 'agents'
    AND indexname LIKE 'idx_agents_tenant%' OR indexname LIKE 'idx_agents_sharing%';

    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Migration 20250201000005: Add Tenant Isolation - COMPLETE';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Agents table has tenant_id: %', v_agents_has_tenant;
    RAISE NOTICE 'Tools table exists: %', v_tools_exists;
    RAISE NOTICE 'Prompts table exists: %', v_prompts_exists;
    RAISE NOTICE 'Tenant-related indexes on agents: %', v_agents_indexes_count;
    RAISE NOTICE 'Next step: Run 20250201000006_update_rls_policies.sql';
    RAISE NOTICE '============================================================================';
END $$;

