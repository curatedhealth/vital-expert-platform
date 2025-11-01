-- =====================================================
-- FEEDBACK AND AGENT ENRICHMENT SYSTEM
-- Migration: 20251101_feedback_and_enrichment_system
-- Purpose: Golden Rule #5 - User feedback informs agent selection
-- =====================================================

-- =====================================================
-- 1. USER FEEDBACK TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id TEXT NOT NULL,
    turn_id UUID,
    user_id UUID,
    
    -- Agent context
    agent_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    
    -- Feedback data
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_type TEXT CHECK (feedback_type IN ('helpful', 'not_helpful', 'incorrect', 'incomplete', 'excellent')),
    feedback_text TEXT,
    feedback_tags TEXT[],
    
    -- Metadata
    response_time_ms INTEGER,
    confidence_score FLOAT,
    rag_enabled BOOLEAN DEFAULT FALSE,
    tools_enabled BOOLEAN DEFAULT FALSE,
    model_used TEXT,
    
    -- Analytics
    was_edited BOOLEAN DEFAULT FALSE,
    edit_distance INTEGER,
    user_continued BOOLEAN DEFAULT TRUE,
    session_abandoned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT user_feedback_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_feedback_tenant_agent ON user_feedback(tenant_id, agent_id);
CREATE INDEX idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX idx_user_feedback_created ON user_feedback(created_at DESC);
CREATE INDEX idx_user_feedback_session ON user_feedback(tenant_id, session_id);

COMMENT ON TABLE user_feedback IS 'User feedback on agent responses for continuous improvement';
COMMENT ON COLUMN user_feedback.rating IS 'User rating 1-5 stars';
COMMENT ON COLUMN user_feedback.feedback_type IS 'Categorized feedback type';
COMMENT ON COLUMN user_feedback.session_abandoned IS 'Did user abandon session after this response';

-- =====================================================
-- 2. AGENT PERFORMANCE METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    
    -- Time window
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Performance metrics
    total_queries INTEGER DEFAULT 0,
    successful_queries INTEGER DEFAULT 0,
    failed_queries INTEGER DEFAULT 0,
    avg_response_time_ms FLOAT,
    avg_confidence FLOAT,
    avg_rating FLOAT,
    
    -- User satisfaction
    positive_feedback_count INTEGER DEFAULT 0,
    negative_feedback_count INTEGER DEFAULT 0,
    excellent_ratings INTEGER DEFAULT 0,
    poor_ratings INTEGER DEFAULT 0,
    
    -- Usage patterns
    domains_used TEXT[],
    common_query_types TEXT[],
    peak_usage_hours INTEGER[],
    
    -- Quality indicators
    hallucination_count INTEGER DEFAULT 0,
    citation_accuracy FLOAT,
    rag_usage_rate FLOAT,
    tool_usage_rate FLOAT,
    
    -- Computed scores
    recommendation_score FLOAT,
    success_rate FLOAT,
    positive_feedback_rate FLOAT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT agent_performance_metrics_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT agent_performance_metrics_unique UNIQUE (tenant_id, agent_id, period_start, period_end)
);

CREATE INDEX idx_agent_metrics_tenant ON agent_performance_metrics(tenant_id, agent_id);
CREATE INDEX idx_agent_metrics_period ON agent_performance_metrics(period_start, period_end);
CREATE INDEX idx_agent_metrics_recommendation ON agent_performance_metrics(recommendation_score DESC);

COMMENT ON TABLE agent_performance_metrics IS 'Aggregated agent performance metrics for ML-powered selection';
COMMENT ON COLUMN agent_performance_metrics.recommendation_score IS 'Weighted score for agent selection (0-5)';

-- =====================================================
-- 3. AGENT SELECTION HISTORY TABLE (ML Training Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_selection_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Query context
    query TEXT NOT NULL,
    query_intent TEXT,
    query_domains TEXT[],
    query_complexity TEXT,
    query_embedding VECTOR(1536),
    
    -- Agent selection
    agents_considered JSONB,
    agent_selected TEXT NOT NULL,
    selection_method TEXT CHECK (selection_method IN ('automatic', 'manual', 'ml_model', 'fallback')),
    selection_confidence FLOAT,
    
    -- Outcome
    was_successful BOOLEAN,
    user_rating INTEGER,
    user_switched_agent BOOLEAN DEFAULT FALSE,
    alternative_agent TEXT,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT agent_selection_history_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_selection_history_tenant ON agent_selection_history(tenant_id);
CREATE INDEX idx_selection_history_session ON agent_selection_history(tenant_id, session_id);
CREATE INDEX idx_selection_history_agent ON agent_selection_history(agent_selected);
CREATE INDEX idx_selection_history_query_embedding ON agent_selection_history USING ivfflat (query_embedding vector_cosine_ops);

COMMENT ON TABLE agent_selection_history IS 'Agent selection history for ML training and analysis';
COMMENT ON COLUMN agent_selection_history.agents_considered IS 'JSON array of {agent_id, score, reason}';
COMMENT ON COLUMN agent_selection_history.was_successful IS 'Was the selection ultimately successful based on feedback';

-- =====================================================
-- 4. ENHANCED CONVERSATIONS TABLE
-- =====================================================

-- Add new columns to existing conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS system_prompt TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS rag_context JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tools_used TEXT[];
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS model_used TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tokens_used INTEGER;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS confidence FLOAT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS key_entities JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS extracted_facts JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_preferences JSONB;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(tenant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);

COMMENT ON COLUMN conversations.summary IS 'AI-generated summary of conversation turn';
COMMENT ON COLUMN conversations.key_entities IS 'Extracted entities {type: [values]}';
COMMENT ON COLUMN conversations.extracted_facts IS 'Factual statements extracted from conversation';
COMMENT ON COLUMN conversations.user_preferences IS 'Learned user preferences';

-- =====================================================
-- 5. AGENT KNOWLEDGE ENRICHMENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_knowledge_enrichment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    agent_id TEXT NOT NULL,
    
    -- Source
    source_type TEXT CHECK (source_type IN ('feedback', 'tool_result', 'web_search', 'manual', 'rag_miss')) NOT NULL,
    source_query TEXT NOT NULL,
    source_session_id TEXT,
    source_turn_id UUID,
    
    -- Content
    content TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('fact', 'procedure', 'guideline', 'case_study', 'definition', 'regulation')),
    extracted_entities JSONB,
    
    -- Quality
    confidence FLOAT DEFAULT 0.8,
    relevance_score FLOAT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Usage tracking
    times_referenced INTEGER DEFAULT 0,
    last_referenced TIMESTAMP WITH TIME ZONE,
    effectiveness_score FLOAT,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT agent_knowledge_enrichment_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_enrichment_tenant_agent ON agent_knowledge_enrichment(tenant_id, agent_id);
CREATE INDEX idx_enrichment_source_type ON agent_knowledge_enrichment(source_type);
CREATE INDEX idx_enrichment_verified ON agent_knowledge_enrichment(verified);
CREATE INDEX idx_enrichment_times_referenced ON agent_knowledge_enrichment(times_referenced DESC);
CREATE INDEX idx_enrichment_created ON agent_knowledge_enrichment(created_at DESC);

COMMENT ON TABLE agent_knowledge_enrichment IS 'Auto-captured knowledge from tool outputs and feedback';
COMMENT ON COLUMN agent_knowledge_enrichment.source_type IS 'Source of enriched knowledge';
COMMENT ON COLUMN agent_knowledge_enrichment.times_referenced IS 'How many times this knowledge was used in responses';
COMMENT ON COLUMN agent_knowledge_enrichment.effectiveness_score IS 'How effective this knowledge was in improving responses';

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_selection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_enrichment ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_feedback
CREATE POLICY user_feedback_tenant_isolation ON user_feedback
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Create RLS policies for agent_performance_metrics
CREATE POLICY agent_performance_metrics_tenant_isolation ON agent_performance_metrics
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Create RLS policies for agent_selection_history
CREATE POLICY agent_selection_history_tenant_isolation ON agent_selection_history
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Create RLS policies for agent_knowledge_enrichment
CREATE POLICY agent_knowledge_enrichment_tenant_isolation ON agent_knowledge_enrichment
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update agent performance metrics automatically
CREATE OR REPLACE FUNCTION update_agent_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert metrics for the current day
    INSERT INTO agent_performance_metrics (
        tenant_id,
        agent_id,
        agent_type,
        period_start,
        period_end,
        total_queries,
        avg_rating,
        positive_feedback_count,
        negative_feedback_count
    )
    VALUES (
        NEW.tenant_id,
        NEW.agent_id,
        NEW.agent_type,
        DATE_TRUNC('day', NEW.created_at),
        DATE_TRUNC('day', NEW.created_at) + INTERVAL '1 day',
        1,
        NEW.rating,
        CASE WHEN NEW.rating >= 4 THEN 1 ELSE 0 END,
        CASE WHEN NEW.rating <= 2 THEN 1 ELSE 0 END
    )
    ON CONFLICT (tenant_id, agent_id, period_start, period_end)
    DO UPDATE SET
        total_queries = agent_performance_metrics.total_queries + 1,
        avg_rating = (agent_performance_metrics.avg_rating * agent_performance_metrics.total_queries + NEW.rating) / (agent_performance_metrics.total_queries + 1),
        positive_feedback_count = agent_performance_metrics.positive_feedback_count + CASE WHEN NEW.rating >= 4 THEN 1 ELSE 0 END,
        negative_feedback_count = agent_performance_metrics.negative_feedback_count + CASE WHEN NEW.rating <= 2 THEN 1 ELSE 0 END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_agent_metrics
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_agent_performance_metrics();

-- Function to calculate recommendation score
CREATE OR REPLACE FUNCTION calculate_recommendation_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate weighted recommendation score
    -- Rating: 40%, Success rate: 30%, Positive feedback: 30%
    NEW.success_rate := CASE 
        WHEN NEW.total_queries > 0 THEN 
            (NEW.total_queries - NEW.failed_queries)::FLOAT / NEW.total_queries 
        ELSE 0 
    END;
    
    NEW.positive_feedback_rate := CASE 
        WHEN NEW.total_queries > 0 THEN 
            NEW.positive_feedback_count::FLOAT / NEW.total_queries 
        ELSE 0 
    END;
    
    NEW.recommendation_score := (
        (COALESCE(NEW.avg_rating, 3.5) * 0.4) +
        (NEW.success_rate * 5 * 0.3) +
        (NEW.positive_feedback_rate * 5 * 0.3)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for recommendation score
CREATE TRIGGER trigger_calculate_recommendation_score
    BEFORE INSERT OR UPDATE ON agent_performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION calculate_recommendation_score();

-- =====================================================
-- 8. INITIAL DATA / SEED DATA
-- =====================================================

-- Create initial performance metrics for existing agents
INSERT INTO agent_performance_metrics (
    tenant_id,
    agent_id,
    agent_type,
    period_start,
    period_end,
    total_queries,
    avg_rating,
    recommendation_score
)
SELECT DISTINCT
    tenant_id,
    id as agent_id,
    agent_type,
    DATE_TRUNC('day', NOW()),
    DATE_TRUNC('day', NOW()) + INTERVAL '1 day',
    0,
    3.5,
    3.5
FROM agents
WHERE status = 'active'
ON CONFLICT (tenant_id, agent_id, period_start, period_end) DO NOTHING;

-- =====================================================
-- 9. VIEWS FOR ANALYTICS
-- =====================================================

-- View: Agent performance summary
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    apm.tenant_id,
    apm.agent_id,
    apm.agent_type,
    a.name as agent_name,
    AVG(apm.avg_rating) as overall_avg_rating,
    SUM(apm.total_queries) as total_queries_all_time,
    AVG(apm.success_rate) as overall_success_rate,
    AVG(apm.positive_feedback_rate) as overall_positive_rate,
    AVG(apm.recommendation_score) as overall_recommendation_score,
    MAX(apm.updated_at) as last_updated
FROM agent_performance_metrics apm
LEFT JOIN agents a ON apm.agent_id = a.id AND apm.tenant_id = a.tenant_id
GROUP BY apm.tenant_id, apm.agent_id, apm.agent_type, a.name;

COMMENT ON VIEW agent_performance_summary IS 'Aggregated agent performance across all time periods';

-- View: Recent feedback summary
CREATE OR REPLACE VIEW recent_feedback_summary AS
SELECT 
    tenant_id,
    agent_id,
    COUNT(*) as feedback_count,
    AVG(rating) as avg_rating,
    COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_count,
    COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_count,
    MAX(created_at) as last_feedback_date
FROM user_feedback
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY tenant_id, agent_id;

COMMENT ON VIEW recent_feedback_summary IS 'Feedback summary for last 7 days';

-- =====================================================
-- 10. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to service role
-- GRANT ALL ON user_feedback TO service_role;
-- GRANT ALL ON agent_performance_metrics TO service_role;
-- GRANT ALL ON agent_selection_history TO service_role;
-- GRANT ALL ON agent_knowledge_enrichment TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 20251101_feedback_and_enrichment_system completed successfully';
    RAISE NOTICE 'Tables created: user_feedback, agent_performance_metrics, agent_selection_history, agent_knowledge_enrichment';
    RAISE NOTICE 'RLS policies enabled for all tables';
    RAISE NOTICE 'Triggers created for automatic metrics updates';
    RAISE NOTICE 'Views created for analytics';
END $$;

