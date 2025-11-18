-- ============================================================================
-- VITAL PLATFORM - MULTI-TENANT RESOURCES
-- Migration: Add Tenant Columns to Resource Tables
-- Version: 1.0.0
-- Date: 2025-10-26
-- ============================================================================
-- Purpose: Add tenant ownership and sharing columns to all resource tables:
--   - agents
--   - rag_knowledge_sources
--   - tools (if exists)
--   - prompts (if exists)
-- ============================================================================

-- ============================================================================
-- 1. ADD TENANT COLUMNS TO AGENTS TABLE
-- ============================================================================

-- Add tenant ownership columns
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_by_user_id UUID;  -- References auth.users

-- Add sharing columns
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN IF NOT EXISTS sharing_mode VARCHAR(50) DEFAULT 'private'
        CHECK (sharing_mode IN ('private', 'global', 'selective')),
    ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50) DEFAULT 'custom'
        CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom'));

-- Add resource metadata
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add usage tracking
ALTER TABLE agents
    ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

-- Create indexes for tenant-based queries
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_sharing ON agents(is_shared, sharing_mode) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_agents_resource_type ON agents(resource_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_shared_with ON agents USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags) WHERE array_length(tags, 1) > 0;

-- Add comments
COMMENT ON COLUMN agents.tenant_id IS 'Owner tenant of this agent. NULL for legacy agents (will be backfilled)';
COMMENT ON COLUMN agents.is_shared IS 'Whether this agent is shared with other tenants';
COMMENT ON COLUMN agents.sharing_mode IS 'Sharing mode: private (owner only), global (all tenants), selective (specific tenants)';
COMMENT ON COLUMN agents.shared_with IS 'Array of tenant IDs for selective sharing';
COMMENT ON COLUMN agents.resource_type IS 'Resource type: platform (shared with all), solution (solution-specific), industry (industry-specific), custom (tenant-created)';

-- ============================================================================
-- 2. ADD TENANT COLUMNS TO RAG_KNOWLEDGE_SOURCES TABLE
-- ============================================================================

-- Check if table exists (it should from migration 012)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rag_knowledge_sources') THEN
        -- Add tenant columns
        ALTER TABLE rag_knowledge_sources
            ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS created_by_user_id UUID;

        -- Add sharing columns
        ALTER TABLE rag_knowledge_sources
            ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false NOT NULL,
            ADD COLUMN IF NOT EXISTS sharing_mode VARCHAR(50) DEFAULT 'private'
                CHECK (sharing_mode IN ('private', 'global', 'selective')),
            ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS resource_type VARCHAR(50) DEFAULT 'custom'
                CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom'));

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_rag_sources_tenant ON rag_knowledge_sources(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_rag_sources_sharing ON rag_knowledge_sources(is_shared, sharing_mode) WHERE is_shared = true;
        CREATE INDEX IF NOT EXISTS idx_rag_sources_shared_with ON rag_knowledge_sources USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;

        -- Add comments
        COMMENT ON COLUMN rag_knowledge_sources.tenant_id IS 'Owner tenant of this knowledge source';
        COMMENT ON COLUMN rag_knowledge_sources.is_shared IS 'Whether this knowledge source is shared with other tenants';

        RAISE NOTICE 'Added tenant columns to rag_knowledge_sources';
    ELSE
        RAISE NOTICE 'Table rag_knowledge_sources does not exist, skipping';
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE TOOLS TABLE (IF DOESN'T EXIST) WITH TENANT SUPPORT
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
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE tools IS 'Tools that agents can use (APIs, functions, integrations)';
COMMENT ON COLUMN tools.tenant_id IS 'Owner tenant of this tool';
COMMENT ON COLUMN tools.is_shared IS 'Whether this tool is shared with other tenants';

-- ============================================================================
-- 4. CREATE PROMPTS TABLE WITH TENANT SUPPORT
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
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE prompts IS 'Reusable prompt templates for agents and users';
COMMENT ON COLUMN prompts.tenant_id IS 'Owner tenant of this prompt';
COMMENT ON COLUMN prompts.is_shared IS 'Whether this prompt is shared with other tenants';

-- ============================================================================
-- 5. CREATE WORKFLOWS TABLE WITH TENANT SUPPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
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

    -- Workflow Definition
    workflow_type VARCHAR(50) CHECK (workflow_type IN ('sequential', 'parallel', 'conditional', 'dag')),
    steps JSONB NOT NULL,  -- Array of workflow steps
    inputs_schema JSONB DEFAULT '{}'::jsonb,
    outputs_schema JSONB DEFAULT '{}'::jsonb,

    -- Agents & Resources
    agent_ids UUID[] DEFAULT '{}',  -- Agents used in workflow
    tool_ids UUID[] DEFAULT '{}',   -- Tools used in workflow
    prompt_ids UUID[] DEFAULT '{}', -- Prompts used in workflow

    -- Sharing Configuration
    is_shared BOOLEAN DEFAULT false NOT NULL,
    sharing_mode VARCHAR(50) DEFAULT 'private'
        CHECK (sharing_mode IN ('private', 'global', 'selective')),
    shared_with UUID[] DEFAULT '{}',
    resource_type VARCHAR(50) DEFAULT 'custom'
        CHECK (resource_type IN ('platform', 'solution', 'industry', 'custom')),

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    use_cases TEXT[] DEFAULT '{}',

    -- Usage & Performance
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    average_execution_time INTEGER,  -- milliseconds
    success_rate DECIMAL(5,2),

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'draft')),
    version VARCHAR(20) DEFAULT '1.0.0',
    is_published BOOLEAN DEFAULT false,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- Create indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_sharing ON workflows(is_shared, sharing_mode) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_workflows_resource_type ON workflows(resource_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_shared_with ON workflows USING GIN(shared_with) WHERE array_length(shared_with, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status) WHERE deleted_at IS NULL;

-- Add trigger for updated_at
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE workflows IS 'Multi-agent workflows and JTBD templates';
COMMENT ON COLUMN workflows.tenant_id IS 'Owner tenant of this workflow';
COMMENT ON COLUMN workflows.is_shared IS 'Whether this workflow is shared with other tenants';

-- ============================================================================
-- 6. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_agents_has_tenant BOOLEAN;
    v_rag_has_tenant BOOLEAN;
BEGIN
    -- Check if agents has tenant_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'agents' AND column_name = 'tenant_id'
    ) INTO v_agents_has_tenant;

    -- Check if rag_knowledge_sources has tenant_id
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rag_knowledge_sources' AND column_name = 'tenant_id'
    ) INTO v_rag_has_tenant;

    RAISE NOTICE 'Migration 20251026000002 completed successfully';
    RAISE NOTICE 'Agents table has tenant_id: %', v_agents_has_tenant;
    RAISE NOTICE 'RAG knowledge sources has tenant_id: %', v_rag_has_tenant;
    RAISE NOTICE 'Created tables: tools, prompts, workflows (if did not exist)';
    RAISE NOTICE 'All tables now support multi-tenant architecture';
    RAISE NOTICE 'Next step: Run 20251026000003_update_rls_policies.sql';
END $$;
