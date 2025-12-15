-- ==========================================
-- FILE: phase6_tool_schemas.sql
-- PURPOSE: Add explicit argument schemas, validation rules, and safety scopes to tools
-- PHASE: 6 of 9 - Tool Schemas & Hardening
-- DEPENDENCIES: tools table
-- GOLDEN RULES: Explicit schemas, no JSONB for tool arguments, safety-first
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 6: TOOL SCHEMAS & HARDENING';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- ==========================================
-- SECTION 1: ENHANCE TOOLS TABLE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '--- Enhancing Tools Table ---';
END $$;

ALTER TABLE tools
ADD COLUMN IF NOT EXISTS safety_level TEXT CHECK (safety_level IN ('safe', 'moderate', 'high_risk', 'admin_only')),
ADD COLUMN IF NOT EXISTS requires_human_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allowed_failure_rate NUMERIC(3,2) DEFAULT 0.10 CHECK (allowed_failure_rate >= 0 AND allowed_failure_rate <= 1),
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS idempotent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_side_effects BOOLEAN DEFAULT false;

DO $$
BEGIN
    RAISE NOTICE '✓ Enhanced tools table with safety columns';
END $$;

-- ==========================================
-- SECTION 2: CREATE TOOL ARGUMENT SCHEMAS
-- ==========================================

CREATE TABLE IF NOT EXISTS tool_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    
    -- Schema Identity
    schema_version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    
    -- Argument definition
    argument_name TEXT NOT NULL,
    argument_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array', 'file'
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    
    -- Validation
    validation_rule TEXT,
    min_length INTEGER,
    max_length INTEGER,
    min_value NUMERIC,
    max_value NUMERIC,
    allowed_values TEXT[], -- Enum values
    
    -- Documentation
    description TEXT,
    example_value TEXT,
    
    -- Metadata
    sequence_order INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tool_id, schema_version, argument_name)
);

COMMENT ON TABLE tool_schemas IS 'Explicit tool argument schemas with validation rules';

DO $$
BEGIN
    RAISE NOTICE '✓ Created tool_schemas table';
END $$;

-- ==========================================
-- SECTION 3: CREATE TOOL SAFETY SCOPES
-- ==========================================

CREATE TABLE IF NOT EXISTS tool_safety_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    
    -- Safety scope definition
    scope_name TEXT NOT NULL,
    scope_type TEXT CHECK (scope_type IN ('data_access', 'external_api', 'file_system', 'database_write', 'email_send', 'admin_action')),
    
    -- Risk assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    requires_approval BOOLEAN DEFAULT false,
    
    -- Constraints
    max_records_affected INTEGER,
    max_cost_per_call NUMERIC(10,6),
    
    -- Documentation
    description TEXT,
    mitigation_strategy TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tool_id, scope_name)
);

COMMENT ON TABLE tool_safety_scopes IS 'Safety scopes and risk assessments for tools';

DO $$
BEGIN
    RAISE NOTICE '✓ Created tool_safety_scopes table';
END $$;

-- ==========================================
-- SECTION 4: CREATE TOOL EXECUTION POLICIES
-- ==========================================

CREATE TABLE IF NOT EXISTS tool_execution_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Policy
    is_enabled BOOLEAN DEFAULT true,
    max_calls_per_minute INTEGER DEFAULT 60,
    max_calls_per_day INTEGER,
    max_concurrent_executions INTEGER DEFAULT 10,
    
    -- Cost controls
    max_cost_per_call NUMERIC(10,6),
    max_cost_per_day NUMERIC(10,2),
    
    -- Approval requirements
    requires_approval_above_cost NUMERIC(10,6),
    approval_required_for_scopes TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tool_id, tenant_id)
);

COMMENT ON TABLE tool_execution_policies IS 'Per-tenant execution policies and rate limits for tools';

DO $$
BEGIN
    RAISE NOTICE '✓ Created tool_execution_policies table';
END $$;

-- ==========================================
-- SECTION 5: CREATE INDEXES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '--- Creating Indexes ---';
END $$;

-- Tool enhancements
CREATE INDEX IF NOT EXISTS idx_tools_safety_level ON tools(safety_level);
CREATE INDEX IF NOT EXISTS idx_tools_requires_approval ON tools(requires_human_approval);

-- Tool schemas
CREATE INDEX IF NOT EXISTS idx_tool_schemas_tool ON tool_schemas(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_schemas_required ON tool_schemas(is_required);
CREATE INDEX IF NOT EXISTS idx_tool_schemas_active ON tool_schemas(is_active);

-- Tool safety scopes
CREATE INDEX IF NOT EXISTS idx_tool_safety_scopes_tool ON tool_safety_scopes(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_safety_scopes_risk ON tool_safety_scopes(risk_level);
CREATE INDEX IF NOT EXISTS idx_tool_safety_scopes_type ON tool_safety_scopes(scope_type);

-- Tool execution policies
CREATE INDEX IF NOT EXISTS idx_tool_execution_policies_tool ON tool_execution_policies(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_execution_policies_tenant ON tool_execution_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tool_execution_policies_enabled ON tool_execution_policies(is_enabled);

DO $$
BEGIN
    RAISE NOTICE '✓ All indexes created successfully';
END $$;

-- ==========================================
-- VERIFICATION
-- ==========================================

DO $$
DECLARE
    schema_count INTEGER;
    scope_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO schema_count FROM tool_schemas;
    SELECT COUNT(*) INTO scope_count FROM tool_safety_scopes;
    SELECT COUNT(*) INTO policy_count FROM tool_execution_policies;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== PHASE 6 COMPLETE ===';
    RAISE NOTICE 'Tool schemas: %', schema_count;
    RAISE NOTICE 'Tool safety scopes: %', scope_count;
    RAISE NOTICE 'Tool execution policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 6 COMPLETE: TOOL SCHEMAS & HARDENING';
    RAISE NOTICE '=================================================================';
END $$;

SELECT 
    'Tool Schemas' as entity,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM tool_schemas
UNION ALL
SELECT 'Tool Safety Scopes', COUNT(*), COUNT(*)
FROM tool_safety_scopes
UNION ALL
SELECT 'Tool Execution Policies', COUNT(*), COUNT(*) FILTER (WHERE is_enabled = true)
FROM tool_execution_policies;

