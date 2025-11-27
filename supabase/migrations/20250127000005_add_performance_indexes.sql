-- Migration: Add Performance Indexes for Ask Expert
-- Purpose: Optimize multi-tenant queries and session lookups
-- Created: 2025-11-27
-- Priority: OPTIMIZATION - Performance improvement

-- ============================================================================
-- Indexes on agents table (for expert lookup)
-- ============================================================================

-- Tenant-scoped agent lookup
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id
  ON agents(tenant_id)
  WHERE deleted_at IS NULL;

-- Active agents by tier (for expert recommendation)
CREATE INDEX IF NOT EXISTS idx_agents_tier_status
  ON agents(tier, status)
  WHERE deleted_at IS NULL AND status = 'active';

-- Agent domain expertise lookup (for matching queries to experts)
CREATE INDEX IF NOT EXISTS idx_agents_knowledge_domains
  ON agents USING GIN (knowledge_domains)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- Indexes on user_agents table (for user's agent associations)
-- ============================================================================

-- User's active agents
CREATE INDEX IF NOT EXISTS idx_user_agents_user
  ON user_agents(user_id);

-- Agent's users (for counting active users)
CREATE INDEX IF NOT EXISTS idx_user_agents_agent
  ON user_agents(agent_id);

-- Composite index for tenant + user agent lookup
CREATE INDEX IF NOT EXISTS idx_user_agents_tenant_user
  ON user_agents(tenant_id, user_id);

-- ============================================================================
-- Additional composite indexes for Ask Expert queries
-- ============================================================================

-- Session lookup by tenant + user + status
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_user_status
  ON ask_expert_sessions(tenant_id, user_id, status);

-- Recent sessions by tenant (for analytics)
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_created
  ON ask_expert_sessions(tenant_id, created_at DESC);

-- Query lookup by session + created time
CREATE INDEX IF NOT EXISTS idx_queries_session_created
  ON ask_expert_queries(session_id, created_at DESC);

-- Response lookup by query + agent (for response history)
CREATE INDEX IF NOT EXISTS idx_responses_query_agent
  ON expert_query_responses(query_id, agent_id);

-- Panel session lookup by session + status
CREATE INDEX IF NOT EXISTS idx_panel_sessions_session_status
  ON expert_panel_sessions(session_id, status);

-- Panel responses by panel + confidence (for ranking)
CREATE INDEX IF NOT EXISTS idx_panel_responses_panel_confidence
  ON expert_panel_responses(panel_session_id, confidence_score DESC NULLS LAST);

-- Workflow execution by session + status (for monitoring)
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_status
  ON expert_workflow_executions(session_id, status);

-- ============================================================================
-- JSONB indexes for metadata searches (optional, uncomment if needed)
-- ============================================================================

-- If you frequently query metadata fields:
-- CREATE INDEX IF NOT EXISTS idx_sessions_metadata
--   ON ask_expert_sessions USING GIN (metadata);

-- CREATE INDEX IF NOT EXISTS idx_responses_sources
--   ON expert_query_responses USING GIN (sources);

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Run this to verify indexes were created:
-- SELECT schemaname, tablename, indexname
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('agents', 'user_agents', 'ask_expert_sessions',
--                     'ask_expert_queries', 'expert_query_responses',
--                     'expert_panel_sessions', 'expert_panel_responses',
--                     'expert_workflow_executions')
-- ORDER BY tablename, indexname;

-- Expected: ~30+ indexes across all tables
