-- ============================================================================
-- SEARCH ANALYTICS LOGS TABLE
-- Version: 1.0.0
-- Date: 2025-01-27
-- Purpose: Track RAG search performance for analytics and optimization
-- ============================================================================

-- Search logs table for RAG analytics
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Search identification
    session_id UUID,  -- Links to user session
    conversation_id UUID,  -- Links to conversation
    query_id UUID,  -- Unique identifier for this query

    -- Query information
    query_text TEXT NOT NULL,
    query_embedding_id VARCHAR(255),  -- Reference to stored embedding
    query_intent VARCHAR(50),  -- regulatory, clinical, research, etc.
    query_complexity VARCHAR(20),  -- simple, moderate, complex, exploratory

    -- Strategy used
    rag_strategy VARCHAR(50) NOT NULL,  -- hybrid_enhanced, regulatory_precision, etc.
    strategy_weights JSONB,  -- {"graph": 0.3, "vector": 0.5, "keyword": 0.2}
    auto_selected BOOLEAN DEFAULT false,  -- Was strategy auto-selected?

    -- Search performance
    total_results INTEGER DEFAULT 0,
    vector_results INTEGER DEFAULT 0,
    keyword_results INTEGER DEFAULT 0,
    graph_results INTEGER DEFAULT 0,

    -- Timing (milliseconds)
    total_latency_ms INTEGER,
    vector_latency_ms INTEGER,
    keyword_latency_ms INTEGER,
    graph_latency_ms INTEGER,
    rerank_latency_ms INTEGER,
    fusion_latency_ms INTEGER,

    -- Quality scores
    avg_relevance_score DECIMAL(5,4),
    max_relevance_score DECIMAL(5,4),
    min_relevance_score DECIMAL(5,4),
    rerank_applied BOOLEAN DEFAULT false,
    rerank_model VARCHAR(50),  -- cohere, bge-reranker-local, none

    -- Evidence scoring
    avg_evidence_confidence DECIMAL(5,4),
    high_confidence_count INTEGER DEFAULT 0,
    low_confidence_count INTEGER DEFAULT 0,

    -- Faithfulness (response quality)
    faithfulness_score DECIMAL(5,4),
    hallucination_risk VARCHAR(10),  -- low, medium, high
    supported_claims INTEGER DEFAULT 0,
    unsupported_claims INTEGER DEFAULT 0,

    -- Namespaces/domains searched
    namespaces_searched TEXT[],  -- Array of namespace names
    domains_matched TEXT[],  -- Knowledge domains that matched

    -- User feedback (optional, filled later)
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    feedback_at TIMESTAMPTZ,

    -- Error tracking
    has_errors BOOLEAN DEFAULT false,
    error_type VARCHAR(100),
    error_message TEXT,

    -- Metadata
    tenant_id UUID,
    user_id UUID,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Foreign keys (optional - can be enabled if tables exist)
    -- FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    -- FOREIGN KEY (user_id) REFERENCES profiles(id),
    -- FOREIGN KEY (conversation_id) REFERENCES conversations(id)

    CONSTRAINT valid_latency CHECK (total_latency_ms >= 0),
    CONSTRAINT valid_scores CHECK (
        avg_relevance_score >= 0 AND avg_relevance_score <= 1
        AND faithfulness_score >= 0 AND faithfulness_score <= 1
    )
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at
    ON public.search_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_logs_tenant_user
    ON public.search_logs(tenant_id, user_id);

CREATE INDEX IF NOT EXISTS idx_search_logs_strategy
    ON public.search_logs(rag_strategy);

CREATE INDEX IF NOT EXISTS idx_search_logs_query_intent
    ON public.search_logs(query_intent);

CREATE INDEX IF NOT EXISTS idx_search_logs_session
    ON public.search_logs(session_id);

CREATE INDEX IF NOT EXISTS idx_search_logs_conversation
    ON public.search_logs(conversation_id);

-- Index for performance analysis queries
CREATE INDEX IF NOT EXISTS idx_search_logs_latency
    ON public.search_logs(total_latency_ms)
    WHERE total_latency_ms IS NOT NULL;

-- Index for quality analysis
CREATE INDEX IF NOT EXISTS idx_search_logs_quality
    ON public.search_logs(faithfulness_score, avg_relevance_score)
    WHERE faithfulness_score IS NOT NULL;

-- GIN index for namespace array searches
CREATE INDEX IF NOT EXISTS idx_search_logs_namespaces
    ON public.search_logs USING GIN(namespaces_searched);

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Daily search metrics
CREATE OR REPLACE VIEW v_search_metrics_daily AS
SELECT
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*) AS total_searches,
    COUNT(DISTINCT session_id) AS unique_sessions,
    COUNT(DISTINCT user_id) AS unique_users,

    -- Strategy distribution
    COUNT(*) FILTER (WHERE rag_strategy = 'hybrid_enhanced') AS hybrid_searches,
    COUNT(*) FILTER (WHERE rag_strategy = 'regulatory_precision') AS regulatory_searches,
    COUNT(*) FILTER (WHERE rag_strategy = 'clinical_evidence') AS clinical_searches,
    COUNT(*) FILTER (WHERE rag_strategy = 'research_comprehensive') AS research_searches,
    COUNT(*) FILTER (WHERE rag_strategy = 'graphrag_entity') AS graph_searches,

    -- Performance
    AVG(total_latency_ms) AS avg_latency_ms,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_latency_ms) AS p50_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_latency_ms) AS p95_latency_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY total_latency_ms) AS p99_latency_ms,

    -- Quality
    AVG(avg_relevance_score) AS avg_relevance,
    AVG(faithfulness_score) AS avg_faithfulness,
    COUNT(*) FILTER (WHERE hallucination_risk = 'high') AS high_risk_count,

    -- Reranking stats
    COUNT(*) FILTER (WHERE rerank_applied) AS reranked_count,
    AVG(rerank_latency_ms) FILTER (WHERE rerank_applied) AS avg_rerank_latency_ms,

    -- Errors
    COUNT(*) FILTER (WHERE has_errors) AS error_count
FROM public.search_logs
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;

-- Strategy performance comparison
CREATE OR REPLACE VIEW v_strategy_performance AS
SELECT
    rag_strategy,
    query_intent,
    COUNT(*) AS search_count,
    AVG(total_latency_ms) AS avg_latency_ms,
    AVG(avg_relevance_score) AS avg_relevance,
    AVG(faithfulness_score) AS avg_faithfulness,
    AVG(total_results) AS avg_results,
    AVG(user_rating) FILTER (WHERE user_rating IS NOT NULL) AS avg_user_rating,
    COUNT(*) FILTER (WHERE has_errors) / NULLIF(COUNT(*), 0)::DECIMAL AS error_rate
FROM public.search_logs
GROUP BY rag_strategy, query_intent
ORDER BY search_count DESC;

-- User feedback analysis
CREATE OR REPLACE VIEW v_search_feedback_analysis AS
SELECT
    rag_strategy,
    user_rating,
    COUNT(*) AS feedback_count,
    AVG(faithfulness_score) AS avg_faithfulness,
    AVG(avg_relevance_score) AS avg_relevance
FROM public.search_logs
WHERE user_rating IS NOT NULL
GROUP BY rag_strategy, user_rating
ORDER BY rag_strategy, user_rating;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to log a search
CREATE OR REPLACE FUNCTION log_search(
    p_query_text TEXT,
    p_rag_strategy VARCHAR(50),
    p_total_latency_ms INTEGER,
    p_total_results INTEGER,
    p_tenant_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.search_logs (
        query_text,
        rag_strategy,
        total_latency_ms,
        total_results,
        tenant_id,
        user_id,
        session_id,
        metadata
    ) VALUES (
        p_query_text,
        p_rag_strategy,
        p_total_latency_ms,
        p_total_results,
        p_tenant_id,
        p_user_id,
        p_session_id,
        p_metadata
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update search log with quality scores
CREATE OR REPLACE FUNCTION update_search_quality(
    p_log_id UUID,
    p_avg_relevance DECIMAL(5,4),
    p_faithfulness_score DECIMAL(5,4),
    p_hallucination_risk VARCHAR(10),
    p_supported_claims INTEGER,
    p_unsupported_claims INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE public.search_logs
    SET
        avg_relevance_score = p_avg_relevance,
        faithfulness_score = p_faithfulness_score,
        hallucination_risk = p_hallucination_risk,
        supported_claims = p_supported_claims,
        unsupported_claims = p_unsupported_claims
    WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (Optional)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access to search_logs"
    ON public.search_logs
    FOR ALL
    USING (true);

-- Policy for users (view their own logs)
CREATE POLICY "Users can view their own search logs"
    ON public.search_logs
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR tenant_id = (
            SELECT organization::uuid FROM profiles WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.search_logs IS 'RAG search analytics and performance tracking';
COMMENT ON COLUMN public.search_logs.rag_strategy IS 'RAG strategy used: hybrid_enhanced, regulatory_precision, clinical_evidence, etc.';
COMMENT ON COLUMN public.search_logs.faithfulness_score IS 'RAGAS-style faithfulness score (0-1) - measures response grounding in context';
COMMENT ON COLUMN public.search_logs.hallucination_risk IS 'Detected hallucination risk level: low, medium, high';
COMMENT ON VIEW v_search_metrics_daily IS 'Daily aggregated search metrics for dashboards';
COMMENT ON VIEW v_strategy_performance IS 'Performance comparison across RAG strategies';

-- Grant permissions
GRANT SELECT ON public.search_logs TO authenticated;
GRANT INSERT ON public.search_logs TO authenticated;
GRANT SELECT ON v_search_metrics_daily TO authenticated;
GRANT SELECT ON v_strategy_performance TO authenticated;
GRANT SELECT ON v_search_feedback_analysis TO authenticated;
