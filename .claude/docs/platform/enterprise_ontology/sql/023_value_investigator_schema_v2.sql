-- ============================================================================
-- VALUE INVESTIGATOR AI COMPANION SCHEMA (FIXED v2)
-- Fixed: Dollar quoting conflict
-- ============================================================================

-- Skip agent creation if exists (already created via REST API)
-- Agent ID: d1a9904f-05b7-4e5c-acb2-ba4e14683537

-- ============================================================================
-- SECTION 1: VALUE INVESTIGATOR SESSIONS TABLE
-- Track analysis sessions for context continuity and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_investigator_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session context
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID,  -- Future: link to users table
    session_token TEXT UNIQUE,  -- For multi-turn conversations

    -- Query context
    query TEXT NOT NULL,
    context_type TEXT,  -- 'jtbd', 'role', 'function', 'category', 'driver'
    context_id UUID,    -- ID of context entity

    -- Analysis results
    analysis_type TEXT NOT NULL,  -- Classification result
    response TEXT NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence BETWEEN 0 AND 1),
    model_used TEXT NOT NULL,
    reasoning_steps JSONB DEFAULT '[]'::jsonb,

    -- Structured outputs
    recommendations JSONB DEFAULT '[]'::jsonb,
    citations JSONB DEFAULT '[]'::jsonb,
    insights JSONB DEFAULT '[]'::jsonb,

    -- Retrieved data snapshot (for debugging/audit)
    retrieved_data JSONB DEFAULT '{}'::jsonb,
    domain_context JSONB DEFAULT '{}'::jsonb,

    -- Performance metrics
    processing_time_ms INTEGER,
    token_count_input INTEGER,
    token_count_output INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes for common queries
    CONSTRAINT valid_analysis_type CHECK (analysis_type IN (
        'dashboard_analysis', 'category_deep_dive', 'driver_analysis',
        'jtbd_value_analysis', 'role_value_analysis', 'gap_analysis',
        'roi_deep_dive', 'general_value_inquiry'
    ))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vis_tenant ON value_investigator_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vis_analysis_type ON value_investigator_sessions(analysis_type);
CREATE INDEX IF NOT EXISTS idx_vis_created ON value_investigator_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vis_context ON value_investigator_sessions(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_vis_session_token ON value_investigator_sessions(session_token);

-- Enable RLS
ALTER TABLE value_investigator_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 2: VALUE INSIGHTS CACHE TABLE
-- Cache generated insights for quick retrieval and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS value_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Insight identification
    insight_type TEXT NOT NULL,  -- 'gap', 'opportunity', 'recommendation', 'trend', 'anomaly'
    insight_category TEXT,       -- 'cost', 'efficiency', 'compliance', 'growth', 'risk'

    -- Context
    tenant_id UUID REFERENCES tenants(id),
    entity_type TEXT,            -- 'jtbd', 'role', 'function', 'driver', 'category'
    entity_id UUID,
    entity_name TEXT,

    -- Insight content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact_assessment TEXT,      -- 'high', 'medium', 'low'
    priority_score DECIMAL(3,2) CHECK (priority_score BETWEEN 0 AND 1),

    -- Supporting data
    metrics JSONB DEFAULT '{}'::jsonb,
    supporting_evidence JSONB DEFAULT '[]'::jsonb,
    related_entities JSONB DEFAULT '[]'::jsonb,

    -- AI generation metadata
    generated_by_model TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    session_id UUID REFERENCES value_investigator_sessions(id),

    -- Status tracking
    status TEXT DEFAULT 'active',  -- 'active', 'archived', 'implemented', 'dismissed'
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,  -- For time-sensitive insights

    -- Constraints
    CONSTRAINT valid_insight_type CHECK (insight_type IN (
        'gap', 'opportunity', 'recommendation', 'trend', 'anomaly', 'warning'
    )),
    CONSTRAINT valid_impact CHECK (impact_assessment IS NULL OR impact_assessment IN ('high', 'medium', 'low'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vi_tenant ON value_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vi_type ON value_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_vi_entity ON value_insights(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vi_status ON value_insights(status);
CREATE INDEX IF NOT EXISTS idx_vi_priority ON value_insights(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_vi_created ON value_insights(created_at DESC);

-- Enable RLS
ALTER TABLE value_insights ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 3: VALUE INVESTIGATOR VIEWS
-- Aggregated views for dashboard and analytics
-- ============================================================================

-- View: Session analytics by analysis type
CREATE OR REPLACE VIEW v_value_investigator_analytics AS
SELECT
    analysis_type,
    COUNT(*) as session_count,
    AVG(confidence) as avg_confidence,
    AVG(processing_time_ms) as avg_processing_time_ms,
    AVG(token_count_output) as avg_tokens_output,
    mode() WITHIN GROUP (ORDER BY model_used) as most_used_model,
    MIN(created_at) as first_session,
    MAX(created_at) as last_session
FROM value_investigator_sessions
GROUP BY analysis_type
ORDER BY session_count DESC;

-- View: Top insights by priority
CREATE OR REPLACE VIEW v_top_value_insights AS
SELECT
    vi.id,
    vi.insight_type,
    vi.insight_category,
    vi.title,
    vi.description,
    vi.impact_assessment,
    vi.priority_score,
    vi.entity_type,
    vi.entity_name,
    vi.confidence_score,
    vi.status,
    vi.created_at,
    t.name as tenant_name
FROM value_insights vi
LEFT JOIN tenants t ON vi.tenant_id = t.id
WHERE vi.status = 'active'
ORDER BY vi.priority_score DESC, vi.created_at DESC;

-- View: Value investigation summary by tenant
CREATE OR REPLACE VIEW v_tenant_value_investigation_summary AS
SELECT
    t.id as tenant_id,
    t.name as tenant_name,
    COUNT(DISTINCT vis.id) as total_sessions,
    COUNT(DISTINCT vi.id) as total_insights,
    AVG(vis.confidence) as avg_session_confidence,
    COUNT(DISTINCT vis.id) FILTER (WHERE vis.analysis_type = 'gap_analysis') as gap_analyses,
    COUNT(DISTINCT vis.id) FILTER (WHERE vis.analysis_type = 'roi_deep_dive') as roi_analyses,
    COUNT(DISTINCT vi.id) FILTER (WHERE vi.impact_assessment = 'high') as high_impact_insights,
    MAX(vis.created_at) as last_investigation
FROM tenants t
LEFT JOIN value_investigator_sessions vis ON vis.tenant_id = t.id
LEFT JOIN value_insights vi ON vi.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY total_sessions DESC;

-- ============================================================================
-- SECTION 4: HELPER FUNCTIONS
-- ============================================================================

-- Function: Get recent insights for an entity
CREATE OR REPLACE FUNCTION get_entity_insights(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    insight_type TEXT,
    title TEXT,
    description TEXT,
    priority_score DECIMAL,
    confidence_score DECIMAL,
    created_at TIMESTAMPTZ
) AS $func$
BEGIN
    RETURN QUERY
    SELECT
        vi.id,
        vi.insight_type,
        vi.title,
        vi.description,
        vi.priority_score,
        vi.confidence_score,
        vi.created_at
    FROM value_insights vi
    WHERE vi.entity_type = p_entity_type
      AND vi.entity_id = p_entity_id
      AND vi.status = 'active'
    ORDER BY vi.priority_score DESC, vi.created_at DESC
    LIMIT p_limit;
END;
$func$ LANGUAGE plpgsql;

-- Function: Get session history for context
CREATE OR REPLACE FUNCTION get_investigation_history(
    p_tenant_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    query TEXT,
    analysis_type TEXT,
    confidence DECIMAL,
    model_used TEXT,
    recommendations_count INTEGER,
    created_at TIMESTAMPTZ
) AS $func$
BEGIN
    RETURN QUERY
    SELECT
        vis.id,
        vis.query,
        vis.analysis_type,
        vis.confidence,
        vis.model_used,
        jsonb_array_length(vis.recommendations)::INTEGER as recommendations_count,
        vis.created_at
    FROM value_investigator_sessions vis
    WHERE vis.tenant_id = p_tenant_id
    ORDER BY vis.created_at DESC
    LIMIT p_limit;
END;
$func$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: VERIFICATION
-- ============================================================================

SELECT 'Value Investigator Schema Created' AS status,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'value_investigator_sessions') AS sessions_table,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'value_insights') AS insights_table;
