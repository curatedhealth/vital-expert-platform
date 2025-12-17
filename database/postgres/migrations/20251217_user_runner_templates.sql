-- ============================================================================
-- Migration: User Runner Templates
-- Date: 2025-12-17
-- Purpose: Enable users to create and customize runner templates via UI
--
-- Architecture: Hybrid (System YAML + User Database Overrides)
-- - System templates live in YAML files (immutable, version-controlled)
-- - User templates stored in database (customizable, real-time)
-- - At runtime: User template OVERRIDES or EXTENDS system template
-- ============================================================================

-- ============================================================================
-- SECTION 1: RUNNER TEMPLATE TABLES
-- ============================================================================

-- 1.1 User Runner Templates (main table)
CREATE TABLE IF NOT EXISTS user_runner_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Runner Reference
    run_code VARCHAR(100) NOT NULL,  -- References vital_runners.run_code

    -- Template Identity
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,

    -- Template Type
    template_type VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (template_type IN (
        'custom',      -- Fully custom template
        'override',    -- Overrides system template
        'extension'    -- Extends system template
    )),

    -- Visibility
    visibility VARCHAR(50) NOT NULL DEFAULT 'private' CHECK (visibility IN (
        'private',     -- Only creator can use
        'team',        -- Team/tenant can use
        'public'       -- Anyone can use (if approved)
    )),

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',       -- Work in progress
        'active',      -- Ready to use
        'archived',    -- No longer active
        'pending_review'  -- Awaiting approval for public
    )),

    -- Versioning
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    parent_version_id UUID REFERENCES user_runner_templates(id),

    -- Metadata
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,

    -- Constraints
    UNIQUE(user_id, run_code, template_name)
);

-- 1.2 Template Prompt Configuration
CREATE TABLE IF NOT EXISTS user_template_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Prompt Pattern
    prompt_pattern VARCHAR(50) NOT NULL CHECK (prompt_pattern IN (
        'chain_of_thought',
        'tree_of_thought',
        'react',
        'self_critique',
        'meta_prompting',
        'custom'
    )),

    -- Prompt Content
    system_prompt TEXT,
    user_prompt_template TEXT,

    -- Reasoning Structure (JSON array of steps)
    reasoning_steps JSONB DEFAULT '[]',

    -- Parameters
    parameters JSONB DEFAULT '{}',  -- Template variables like {input}, {context}

    -- Output Format
    output_format VARCHAR(50) DEFAULT 'json' CHECK (output_format IN (
        'json', 'markdown', 'text', 'structured'
    )),
    output_schema JSONB,  -- JSON Schema for structured output

    -- Version
    prompt_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One prompt config per template
    UNIQUE(template_id)
);

-- 1.3 Template Model Configuration
CREATE TABLE IF NOT EXISTS user_template_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Primary Model
    provider VARCHAR(50) NOT NULL DEFAULT 'openai',
    model_name VARCHAR(100) NOT NULL DEFAULT 'gpt-4-turbo',

    -- Model Parameters
    temperature DECIMAL(3,2) DEFAULT 0.3,
    max_tokens INTEGER DEFAULT 2000,
    top_p DECIMAL(3,2) DEFAULT 0.9,

    -- Fallback Models (JSON array)
    fallback_models JSONB DEFAULT '[]',

    -- Cost Controls
    max_cost_per_run DECIMAL(10,4) DEFAULT 0.50,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(template_id)
);

-- 1.4 Template Evaluation Configuration
CREATE TABLE IF NOT EXISTS user_template_evaluation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Evaluation Framework
    framework VARCHAR(50) DEFAULT 'ragas' CHECK (framework IN (
        'ragas', 'deepeval', 'custom', 'none'
    )),

    -- Metrics (JSON array of metric configs)
    metrics JSONB DEFAULT '[]',

    -- Confidence Scoring
    confidence_method VARCHAR(50) DEFAULT 'ensemble',
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,

    -- Quality Thresholds
    quality_thresholds JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(template_id)
);

-- 1.5 Template HITL Configuration
CREATE TABLE IF NOT EXISTS user_template_hitl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- HITL Enable
    hitl_enabled BOOLEAN DEFAULT FALSE,

    -- Trigger Conditions (JSON array)
    triggers JSONB DEFAULT '[]',

    -- Approval Workflow
    approval_required BOOLEAN DEFAULT FALSE,
    approvers JSONB DEFAULT '[]',  -- Roles or user IDs

    -- Risk-Based Routing
    risk_routing JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(template_id)
);

-- 1.6 Template Tool Configuration
CREATE TABLE IF NOT EXISTS user_template_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Tool Reference
    tool_name VARCHAR(100) NOT NULL,
    mcp_server VARCHAR(100),

    -- Configuration
    is_required BOOLEAN DEFAULT FALSE,
    timeout_ms INTEGER DEFAULT 5000,
    fallback_behavior VARCHAR(50) DEFAULT 'skip',

    -- Tool-specific config
    config JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(template_id, tool_name)
);

-- ============================================================================
-- SECTION 2: TEMPLATE VERSIONING
-- ============================================================================

-- 2.1 Template Version History
CREATE TABLE IF NOT EXISTS user_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Version Info
    version VARCHAR(20) NOT NULL,
    version_notes TEXT,

    -- Snapshot of entire template configuration
    template_snapshot JSONB NOT NULL,

    -- Performance Metrics at this version
    performance_metrics JSONB DEFAULT '{}',

    -- Who created this version
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(template_id, version)
);

-- ============================================================================
-- SECTION 3: TEMPLATE SHARING & MARKETPLACE
-- ============================================================================

-- 3.1 Template Shares (for team sharing)
CREATE TABLE IF NOT EXISTS user_template_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Share Target
    shared_with_user_id UUID REFERENCES auth.users(id),
    shared_with_tenant_id UUID REFERENCES tenants(id),
    shared_with_role VARCHAR(100),

    -- Permissions
    can_view BOOLEAN DEFAULT TRUE,
    can_use BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_share BOOLEAN DEFAULT FALSE,

    -- Timestamps
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    shared_by UUID REFERENCES auth.users(id),

    -- Ensure at least one target
    CHECK (
        shared_with_user_id IS NOT NULL OR
        shared_with_tenant_id IS NOT NULL OR
        shared_with_role IS NOT NULL
    )
);

-- 3.2 Template Usage Analytics
CREATE TABLE IF NOT EXISTS user_template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES user_runner_templates(id) ON DELETE CASCADE,

    -- Usage Context
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMPTZ DEFAULT NOW(),

    -- Execution Details
    execution_time_ms INTEGER,
    confidence_score DECIMAL(3,2),
    success BOOLEAN,

    -- Cost
    cost_usd DECIMAL(10,4),
    tokens_used INTEGER
);

-- ============================================================================
-- SECTION 4: INDEXES
-- ============================================================================

-- Main template lookups
CREATE INDEX IF NOT EXISTS idx_user_runner_templates_user_id ON user_runner_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_runner_templates_tenant_id ON user_runner_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_runner_templates_run_code ON user_runner_templates(run_code);
CREATE INDEX IF NOT EXISTS idx_user_runner_templates_status ON user_runner_templates(status);
CREATE INDEX IF NOT EXISTS idx_user_runner_templates_visibility ON user_runner_templates(visibility);

-- Version lookups
CREATE INDEX IF NOT EXISTS idx_user_template_versions_template_id ON user_template_versions(template_id);

-- Sharing lookups
CREATE INDEX IF NOT EXISTS idx_user_template_shares_template_id ON user_template_shares(template_id);
CREATE INDEX IF NOT EXISTS idx_user_template_shares_user ON user_template_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_shares_tenant ON user_template_shares(shared_with_tenant_id);

-- Usage analytics
CREATE INDEX IF NOT EXISTS idx_user_template_usage_template_id ON user_template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_user_template_usage_used_at ON user_template_usage(used_at);

-- ============================================================================
-- SECTION 5: VIEWS
-- ============================================================================

-- 5.1 View: Effective Template (merges system + user config)
CREATE OR REPLACE VIEW v_effective_runner_templates AS
SELECT
    urt.id AS user_template_id,
    urt.user_id,
    urt.tenant_id,
    urt.run_code,
    urt.template_name,
    urt.template_description,
    urt.template_type,
    urt.visibility,
    urt.status,
    urt.version,
    urt.usage_count,
    urt.created_at,
    urt.updated_at,

    -- System runner info
    vr.run_name AS system_runner_name,
    vr.cat_code AS system_category,
    vr.algo_core AS system_algorithm,
    vr.complexity AS system_complexity,

    -- Prompt config
    utp.prompt_pattern,
    utp.system_prompt,
    utp.user_prompt_template,
    utp.reasoning_steps,
    utp.output_format,
    utp.output_schema,

    -- Model config
    utm.provider,
    utm.model_name,
    utm.temperature,
    utm.max_tokens,
    utm.fallback_models,
    utm.max_cost_per_run,

    -- Evaluation config
    ute.framework AS eval_framework,
    ute.metrics AS eval_metrics,
    ute.confidence_method,
    ute.confidence_threshold,

    -- HITL config
    uth.hitl_enabled,
    uth.triggers AS hitl_triggers,
    uth.approval_required

FROM user_runner_templates urt
LEFT JOIN vital_runners vr ON vr.run_code = urt.run_code
LEFT JOIN user_template_prompts utp ON utp.template_id = urt.id
LEFT JOIN user_template_models utm ON utm.template_id = urt.id
LEFT JOIN user_template_evaluation ute ON ute.template_id = urt.id
LEFT JOIN user_template_hitl uth ON uth.template_id = urt.id
WHERE urt.status = 'active';

-- 5.2 View: User's available templates (own + shared)
CREATE OR REPLACE VIEW v_user_available_templates AS
SELECT
    urt.*,
    CASE
        WHEN urt.user_id = auth.uid() THEN 'owner'
        WHEN uts.can_edit THEN 'editor'
        WHEN uts.can_use THEN 'user'
        ELSE 'viewer'
    END AS access_level
FROM user_runner_templates urt
LEFT JOIN user_template_shares uts ON uts.template_id = urt.id
WHERE
    urt.status = 'active'
    AND (
        urt.user_id = auth.uid()  -- Own templates
        OR urt.visibility = 'public'  -- Public templates
        OR uts.shared_with_user_id = auth.uid()  -- Shared with user
        OR uts.shared_with_tenant_id = (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )  -- Shared with tenant
    );

-- ============================================================================
-- SECTION 6: FUNCTIONS
-- ============================================================================

-- 6.1 Function: Get effective template for a runner
CREATE OR REPLACE FUNCTION get_effective_template(
    p_run_code VARCHAR(100),
    p_user_id UUID DEFAULT NULL,
    p_template_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_system_config JSONB;
    v_user_config JSONB;
    v_effective JSONB;
BEGIN
    -- Get system default config from vital_runners
    SELECT jsonb_build_object(
        'run_code', run_code,
        'run_name', run_name,
        'cat_code', cat_code,
        'algo_core', algo_core,
        'complexity', complexity,
        'min_level', min_level,
        'max_level', max_level,
        'default_timeout', default_timeout,
        'default_tokens', default_tokens
    ) INTO v_system_config
    FROM vital_runners
    WHERE run_code = p_run_code;

    IF v_system_config IS NULL THEN
        RAISE EXCEPTION 'Runner not found: %', p_run_code;
    END IF;

    -- If specific template requested, get it
    IF p_template_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'template_id', urt.id,
            'template_name', urt.template_name,
            'template_type', urt.template_type,
            'prompt', jsonb_build_object(
                'pattern', utp.prompt_pattern,
                'system_prompt', utp.system_prompt,
                'user_prompt_template', utp.user_prompt_template,
                'reasoning_steps', utp.reasoning_steps,
                'output_format', utp.output_format,
                'output_schema', utp.output_schema
            ),
            'model', jsonb_build_object(
                'provider', utm.provider,
                'model_name', utm.model_name,
                'temperature', utm.temperature,
                'max_tokens', utm.max_tokens,
                'fallback_models', utm.fallback_models
            ),
            'evaluation', jsonb_build_object(
                'framework', ute.framework,
                'metrics', ute.metrics,
                'confidence_method', ute.confidence_method,
                'confidence_threshold', ute.confidence_threshold
            ),
            'hitl', jsonb_build_object(
                'enabled', uth.hitl_enabled,
                'triggers', uth.triggers,
                'approval_required', uth.approval_required
            )
        ) INTO v_user_config
        FROM user_runner_templates urt
        LEFT JOIN user_template_prompts utp ON utp.template_id = urt.id
        LEFT JOIN user_template_models utm ON utm.template_id = urt.id
        LEFT JOIN user_template_evaluation ute ON ute.template_id = urt.id
        LEFT JOIN user_template_hitl uth ON uth.template_id = urt.id
        WHERE urt.id = p_template_id AND urt.status = 'active';

    -- Otherwise, get user's default for this runner
    ELSIF p_user_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'template_id', urt.id,
            'template_name', urt.template_name,
            'template_type', urt.template_type,
            'prompt', jsonb_build_object(
                'pattern', utp.prompt_pattern,
                'system_prompt', utp.system_prompt,
                'user_prompt_template', utp.user_prompt_template,
                'reasoning_steps', utp.reasoning_steps,
                'output_format', utp.output_format,
                'output_schema', utp.output_schema
            ),
            'model', jsonb_build_object(
                'provider', utm.provider,
                'model_name', utm.model_name,
                'temperature', utm.temperature,
                'max_tokens', utm.max_tokens,
                'fallback_models', utm.fallback_models
            ),
            'evaluation', jsonb_build_object(
                'framework', ute.framework,
                'metrics', ute.metrics,
                'confidence_method', ute.confidence_method,
                'confidence_threshold', ute.confidence_threshold
            ),
            'hitl', jsonb_build_object(
                'enabled', uth.hitl_enabled,
                'triggers', uth.triggers,
                'approval_required', uth.approval_required
            )
        ) INTO v_user_config
        FROM user_runner_templates urt
        LEFT JOIN user_template_prompts utp ON utp.template_id = urt.id
        LEFT JOIN user_template_models utm ON utm.template_id = urt.id
        LEFT JOIN user_template_evaluation ute ON ute.template_id = urt.id
        LEFT JOIN user_template_hitl uth ON uth.template_id = urt.id
        WHERE urt.run_code = p_run_code
          AND urt.user_id = p_user_id
          AND urt.status = 'active'
          AND urt.is_favorite = TRUE
        LIMIT 1;
    END IF;

    -- Merge: user config overrides system config
    IF v_user_config IS NOT NULL THEN
        v_effective := v_system_config || v_user_config;
    ELSE
        v_effective := v_system_config;
    END IF;

    RETURN v_effective;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6.2 Function: Create template version snapshot
CREATE OR REPLACE FUNCTION create_template_version(
    p_template_id UUID,
    p_version VARCHAR(20),
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_snapshot JSONB;
    v_version_id UUID;
BEGIN
    -- Build snapshot of current template state
    SELECT jsonb_build_object(
        'template', row_to_json(urt),
        'prompt', row_to_json(utp),
        'model', row_to_json(utm),
        'evaluation', row_to_json(ute),
        'hitl', row_to_json(uth),
        'tools', (SELECT jsonb_agg(row_to_json(t)) FROM user_template_tools t WHERE t.template_id = p_template_id)
    ) INTO v_snapshot
    FROM user_runner_templates urt
    LEFT JOIN user_template_prompts utp ON utp.template_id = urt.id
    LEFT JOIN user_template_models utm ON utm.template_id = urt.id
    LEFT JOIN user_template_evaluation ute ON ute.template_id = urt.id
    LEFT JOIN user_template_hitl uth ON uth.template_id = urt.id
    WHERE urt.id = p_template_id;

    -- Insert version record
    INSERT INTO user_template_versions (template_id, version, version_notes, template_snapshot, created_by)
    VALUES (p_template_id, p_version, p_notes, v_snapshot, auth.uid())
    RETURNING id INTO v_version_id;

    -- Update template version
    UPDATE user_runner_templates
    SET version = p_version, updated_at = NOW()
    WHERE id = p_template_id;

    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 7: RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_runner_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_evaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_hitl ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_usage ENABLE ROW LEVEL SECURITY;

-- Templates: Users can see own, shared, and public templates
CREATE POLICY "user_runner_templates_select" ON user_runner_templates
    FOR SELECT USING (
        user_id = auth.uid()
        OR visibility = 'public'
        OR id IN (
            SELECT template_id FROM user_template_shares
            WHERE shared_with_user_id = auth.uid()
        )
        OR tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Templates: Users can only modify own templates
CREATE POLICY "user_runner_templates_modify" ON user_runner_templates
    FOR ALL USING (user_id = auth.uid());

-- Sub-tables: Follow parent template's access
CREATE POLICY "user_template_prompts_access" ON user_template_prompts
    FOR ALL USING (
        template_id IN (
            SELECT id FROM user_runner_templates
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "user_template_models_access" ON user_template_models
    FOR ALL USING (
        template_id IN (
            SELECT id FROM user_runner_templates
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "user_template_evaluation_access" ON user_template_evaluation
    FOR ALL USING (
        template_id IN (
            SELECT id FROM user_runner_templates
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "user_template_hitl_access" ON user_template_hitl
    FOR ALL USING (
        template_id IN (
            SELECT id FROM user_runner_templates
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "user_template_tools_access" ON user_template_tools
    FOR ALL USING (
        template_id IN (
            SELECT id FROM user_runner_templates
            WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- SECTION 8: TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_runner_templates_updated
    BEFORE UPDATE ON user_runner_templates
    FOR EACH ROW EXECUTE FUNCTION update_template_timestamp();

CREATE TRIGGER trigger_user_template_prompts_updated
    BEFORE UPDATE ON user_template_prompts
    FOR EACH ROW EXECUTE FUNCTION update_template_timestamp();

CREATE TRIGGER trigger_user_template_models_updated
    BEFORE UPDATE ON user_template_models
    FOR EACH ROW EXECUTE FUNCTION update_template_timestamp();

-- Increment usage count trigger
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_runner_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_template_usage_increment
    AFTER INSERT ON user_template_usage
    FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

-- ============================================================================
-- SECTION 9: COMMENTS
-- ============================================================================

COMMENT ON TABLE user_runner_templates IS 'User-created or customized runner templates';
COMMENT ON TABLE user_template_prompts IS 'Prompt configuration for user templates';
COMMENT ON TABLE user_template_models IS 'Model configuration for user templates';
COMMENT ON TABLE user_template_evaluation IS 'Evaluation/QA configuration for user templates';
COMMENT ON TABLE user_template_hitl IS 'Human-in-the-loop configuration for user templates';
COMMENT ON TABLE user_template_tools IS 'Tool/MCP configuration for user templates';
COMMENT ON TABLE user_template_versions IS 'Version history for user templates';
COMMENT ON TABLE user_template_shares IS 'Sharing configuration for templates';
COMMENT ON TABLE user_template_usage IS 'Usage analytics for templates';

COMMENT ON FUNCTION get_effective_template IS 'Returns merged system + user template configuration';
COMMENT ON FUNCTION create_template_version IS 'Creates a version snapshot of a template';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
