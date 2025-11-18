-- =============================================================================
-- PHASE 26: Performance Indexes & Optimizations
-- =============================================================================
-- PURPOSE: Add comprehensive indexing for <200ms query performance
-- TABLES: 0 new tables (adds indexes to existing tables)
-- TIME: ~30 minutes
-- =============================================================================

-- NOTE: Most critical indexes were created inline with table definitions
-- This phase adds additional composite indexes and optimizations

-- =============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- =============================================================================

-- Multi-tenant filtered queries (tenant_id + status/active)
CREATE INDEX IF NOT EXISTS idx_agents_tenant_active ON agents(tenant_id, is_active) WHERE deleted_at IS NULL AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_active ON workflows(tenant_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_tenant_status ON expert_consultations(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_panels_tenant_status ON panel_discussions(tenant_id, status) WHERE deleted_at IS NULL;

-- User activity queries
CREATE INDEX IF NOT EXISTS idx_consultations_user_started ON expert_consultations(user_id, started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_panels_user_started ON panel_discussions(user_id, started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_execs_user_started ON workflow_executions(triggered_by, started_at DESC) WHERE deleted_at IS NULL;

-- Agent performance queries
CREATE INDEX IF NOT EXISTS idx_agents_function_status ON agents(function_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agents_industry_status ON agent_industries(industry_id, agent_id) WHERE is_primary = true;

-- JTBD and Persona queries
CREATE INDEX IF NOT EXISTS idx_jtbds_function_status ON jobs_to_be_done(functional_area, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_function_active ON personas(function_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jtbd_personas_jtbd_score ON jtbd_personas(jtbd_id, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_personas_persona_score ON jtbd_personas(persona_id, relevance_score DESC);

-- Knowledge and RAG queries
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tenant_active ON knowledge_sources(tenant_id, is_active) WHERE deleted_at IS NULL AND processing_status = 'completed';
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_index ON knowledge_chunks(source_id, chunk_index);

-- Workflow execution queries
CREATE INDEX IF NOT EXISTS idx_workflow_execs_workflow_started ON workflow_executions(workflow_id, started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_exec_status ON workflow_execution_steps(execution_id, status);

-- Message and conversation queries
CREATE INDEX IF NOT EXISTS idx_expert_messages_consultation_index ON expert_messages(consultation_id, message_index);
CREATE INDEX IF NOT EXISTS idx_panel_messages_panel_index ON panel_messages(panel_id, message_index);
CREATE INDEX IF NOT EXISTS idx_panel_messages_round_index ON panel_messages(round_id, message_index);

-- Cost and usage tracking
CREATE INDEX IF NOT EXISTS idx_llm_usage_tenant_created ON llm_usage_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_summary_tenant_period ON token_usage_summary(tenant_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_cost_alloc_tenant_date ON cost_allocation(tenant_id, allocation_date DESC);

-- Analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_timestamp ON analytics_events(tenant_id, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON analytics_events(user_id, event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_tenant_start ON user_sessions(tenant_id, session_start DESC);

-- Audit and compliance
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_created ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_created ON audit_log(entity_type, entity_id, created_at DESC);

-- =============================================================================
-- COVERING INDEXES (Include frequently accessed columns)
-- =============================================================================

-- Agent lookup with frequently accessed fields
CREATE INDEX IF NOT EXISTS idx_agents_lookup ON agents(id, tenant_id, name, status, average_rating) WHERE deleted_at IS NULL;

-- Workflow execution lookup
CREATE INDEX IF NOT EXISTS idx_workflow_exec_lookup ON workflow_executions(id, workflow_id, status, progress_percentage) WHERE deleted_at IS NULL;

-- =============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =============================================================================

-- Active/published content only
CREATE INDEX IF NOT EXISTS idx_prompts_active_public ON prompts(tenant_id) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_solutions_public_active ON solutions(status) WHERE deleted_at IS NULL AND is_public = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_templates_public_active ON templates(tenant_id) WHERE deleted_at IS NULL AND is_public = true AND is_active = true;

-- Failed/error tracking
CREATE INDEX IF NOT EXISTS idx_workflow_execs_failed ON workflow_executions(workflow_id, started_at DESC) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_workflow_exec_steps_failed ON workflow_execution_steps(execution_id) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_alerts_open ON alerts(tenant_id, triggered_at DESC) WHERE status = 'open';

-- Rate limit exceeded
CREATE INDEX IF NOT EXISTS idx_rate_usage_exceeded ON rate_limit_usage(config_id, window_start DESC) WHERE is_exceeded = true;
CREATE INDEX IF NOT EXISTS idx_quota_exceeded ON quota_tracking(tenant_id, quota_type) WHERE is_exceeded = true;

-- =============================================================================
-- EXPRESSION INDEXES (for computed queries)
-- =============================================================================

-- Search by email domain (for user queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_domain ON user_profiles(LOWER(split_part(email, '@', 2))) WHERE deleted_at IS NULL;

-- Date-based partitioning helpers
CREATE INDEX IF NOT EXISTS idx_llm_usage_year_month ON llm_usage_logs(tenant_id, EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));
CREATE INDEX IF NOT EXISTS idx_analytics_events_year_month ON analytics_events(tenant_id, EXTRACT(YEAR FROM event_timestamp), EXTRACT(MONTH FROM event_timestamp));

-- =============================================================================
-- STATISTICS UPDATES
-- =============================================================================

-- Update statistics for better query planning
ANALYZE tenants;
ANALYZE user_profiles;
ANALYZE agents;
ANALYZE personas;
ANALYZE jobs_to_be_done;
ANALYZE workflows;
ANALYZE expert_consultations;
ANALYZE panel_discussions;
ANALYZE knowledge_sources;
ANALYZE knowledge_chunks;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PHASE 26 COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total indexes created: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Index Categories:';
    RAISE NOTICE '  - Single-column indexes (created with tables)';
    RAISE NOTICE '  - Composite indexes for multi-column queries';
    RAISE NOTICE '  - Covering indexes with included columns';
    RAISE NOTICE '  - Partial indexes for filtered queries';
    RAISE NOTICE '  - Expression indexes for computed values';
    RAISE NOTICE '  - Vector indexes (HNSW/IVFFlat) for embeddings';
    RAISE NOTICE '';
    RAISE NOTICE 'Performance Target: <200ms for all queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run Phase 27 (Row Level Security)';
    RAISE NOTICE '';
END $$;
