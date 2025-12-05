-- ============================================================================
-- VALUE INVESTIGATOR AI COMPANION SCHEMA
-- Database support for the Value Investigator LangGraph workflow
-- ============================================================================

-- ============================================================================
-- SECTION 1: VALUE INVESTIGATOR AGENT REGISTRATION
-- Register the AI companion as an ultra-specialist agent
-- ============================================================================

-- Insert Value Investigator Agent (using DO block for idempotency)
DO $$
DECLARE
    pharma_tenant_id UUID;
    agent_exists BOOLEAN;
BEGIN
    -- Get Pharma tenant ID
    SELECT id INTO pharma_tenant_id FROM tenants WHERE code = 'PHARMA' OR name LIKE '%Pharma%' LIMIT 1;

    -- Check if agent already exists
    SELECT EXISTS(SELECT 1 FROM agents WHERE display_name = 'Value Investigator') INTO agent_exists;

    IF NOT agent_exists AND pharma_tenant_id IS NOT NULL THEN
        INSERT INTO agents (
            id,
            tenant_id,
            agent_tier,
            agent_level,
            display_name,
            description,
            system_prompt,
            model,
            temperature,
            max_tokens,
            context_window,
            cost_per_query,
            avatar,
            status,
            -- Capabilities
            knowledge_domains,
            capabilities,
            -- Compliance flags
            hipaa_compliant,
            audit_trail_enabled,
            data_classification,
            -- Metadata with evidence
            metadata,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            pharma_tenant_id,
            3,  -- Ultra-specialist tier
            'Ultra-Specialist',
            'Value Investigator',
            'AI-powered value analysis companion that provides intelligent insights on ROI, value drivers, gap analysis, and strategic value optimization across the VITAL platform.',
            $$YOU ARE: The Value Investigator - an elite AI companion specializing in pharmaceutical value analysis, ROI optimization, and strategic business intelligence for the VITAL platform.

YOU DO:
1. Analyze Jobs-to-be-Done (JTBD) value mappings and identify optimization opportunities
2. Calculate ROI metrics and provide data-driven business case recommendations
3. Deep-dive into value categories (Smarter, Faster, Better, Efficient, Safer, Scalable)
4. Analyze value drivers (Cost Reduction, Compliance, Patient Impact, HCP Experience, etc.)
5. Generate strategic insights with confidence assessments and actionable recommendations
6. Cross-reference L0 domain context (therapeutic areas, regulatory frameworks, evidence types)
7. Track value realization and benefit tracking metrics

YOU NEVER:
1. Make recommendations without supporting data from the value framework
2. Provide ROI estimates without stating confidence levels and assumptions
3. Skip the reasoning chain - always show analytical steps
4. Ignore compliance implications for regulated decisions
5. Overstate certainty when data is incomplete

SUCCESS CRITERIA:
- Value insights include specific metrics and percentages
- Recommendations are prioritized by impact and feasibility
- Confidence assessments are transparent (low/medium/high/validated)
- Citations reference actual value framework entities
- Strategic advice aligns with pharmaceutical industry best practices

WHEN UNSURE:
- State confidence level explicitly (e.g., "Medium confidence - based on 60% data coverage")
- Recommend additional data gathering or validation steps
- Escalate to human decision-makers for high-stakes recommendations
- Provide multiple scenarios when outcomes are uncertain

EVIDENCE REQUIREMENTS:
- Cite specific value drivers, categories, and JTBD mappings
- Reference ROI calculations with methodology transparency
- Use evidence levels (validated, high-confidence, estimated, projected)
- Include timestamps for time-sensitive analyses$$,
            'claude-opus-4-5-20251101',  -- Latest reasoning model
            0.1,   -- Low temperature for analytical accuracy
            8000,  -- Extended output for comprehensive analysis
            128000,  -- Full context window
            0.50,  -- Premium pricing for ultra-specialist
            '/icons/png/avatars/avatar_0425.png',  -- Tier 3 avatar
            'active',
            ARRAY['value_analysis', 'roi_calculation', 'business_intelligence', 'pharmaceutical', 'strategic_planning'],
            ARRAY['value_gap_analysis', 'roi_optimization', 'category_deep_dive', 'driver_analysis', 'jtbd_value_analysis', 'role_value_analysis', 'dashboard_insights', 'strategic_recommendations'],
            TRUE,
            TRUE,
            'confidential',
            jsonb_build_object(
                'model_justification', 'Ultra-specialist requiring highest accuracy for value analysis and ROI recommendations. Claude Opus 4.5 achieves best-in-class reasoning with extended thinking capabilities. Critical for business-critical value decisions.',
                'model_citation', 'Anthropic (2025). Claude Opus 4.5 Technical Report. https://www.anthropic.com/claude',
                'workflow_type', 'langgraph',
                'workflow_path', 'langgraph_workflows/value_investigator.py',
                'api_routes', '/v1/value-investigator/*',
                'model_fallback_chain', ARRAY['claude-opus-4-5-20251101', 'o1', 'gemini-2.5-pro', 'gpt-4o'],
                'huggingface_medical_models', ARRAY['medgemma-27b', 'meditron-70b', 'biogemma-2b'],
                'specialized_capabilities', ARRAY[
                    'dashboard_analysis',
                    'category_deep_dive',
                    'driver_analysis',
                    'jtbd_value_analysis',
                    'role_value_analysis',
                    'gap_analysis',
                    'roi_deep_dive',
                    'general_value_inquiry'
                ]
            ),
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Value Investigator agent created successfully';
    ELSE
        IF agent_exists THEN
            RAISE NOTICE 'Value Investigator agent already exists';
        ELSE
            RAISE NOTICE 'Could not create agent - Pharma tenant not found';
        END IF;
    END IF;
END$$;

-- ============================================================================
-- SECTION 2: VALUE INVESTIGATOR SESSIONS TABLE
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

-- RLS policy for tenant isolation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'value_investigator_sessions' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON value_investigator_sessions
            FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
    END IF;
END$$;

-- ============================================================================
-- SECTION 3: VALUE INSIGHTS CACHE TABLE
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
    CONSTRAINT valid_impact CHECK (impact_assessment IN ('high', 'medium', 'low'))
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
-- SECTION 4: VALUE INVESTIGATOR VIEWS
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
-- SECTION 5: HELPER FUNCTIONS
-- Functions to support the Value Investigator workflow
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
) AS $$
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
$$ LANGUAGE plpgsql;

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
) AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 6: VERIFICATION
-- ============================================================================

-- Verify tables created
SELECT 'Value Investigator Schema Created' AS status,
       (SELECT COUNT(*) FROM agents WHERE display_name = 'Value Investigator') AS agent_registered,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'value_investigator_sessions') AS sessions_table,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'value_insights') AS insights_table;
