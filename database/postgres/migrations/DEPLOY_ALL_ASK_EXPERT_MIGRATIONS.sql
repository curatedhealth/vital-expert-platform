-- ============================================================================
-- CONSOLIDATED ASK EXPERT MIGRATIONS
-- Deploy all 4 migrations in one execution
-- Created: 2025-11-27
-- ============================================================================

-- MIGRATION 1: Enable RLS on agents and user_agents
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_agents table
DROP POLICY IF EXISTS "user_agents_select_own" ON user_agents;
CREATE POLICY "user_agents_select_own"
  ON user_agents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_agents_insert_own" ON user_agents;
CREATE POLICY "user_agents_insert_own"
  ON user_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_agents_delete_own" ON user_agents;
CREATE POLICY "user_agents_delete_own"
  ON user_agents FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "service_role_all_user_agents" ON user_agents;
CREATE POLICY "service_role_all_user_agents"
  ON user_agents FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- MIGRATION 2: Create Ask Expert Core Tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS ask_expert_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('single_expert', 'panel', 'workflow')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'error')),
  context jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_tenant
  ON ask_expert_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_user
  ON ask_expert_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_status
  ON ask_expert_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_created
  ON ask_expert_sessions(created_at DESC);
ALTER TABLE ask_expert_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ask_expert_sessions_select_own" ON ask_expert_sessions;
CREATE POLICY "ask_expert_sessions_select_own"
  ON ask_expert_sessions FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ask_expert_sessions_insert_own" ON ask_expert_sessions;
CREATE POLICY "ask_expert_sessions_insert_own"
  ON ask_expert_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "ask_expert_sessions_update_own" ON ask_expert_sessions;
CREATE POLICY "ask_expert_sessions_update_own"
  ON ask_expert_sessions FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "service_role_all_ask_expert_sessions" ON ask_expert_sessions;
CREATE POLICY "service_role_all_ask_expert_sessions"
  ON ask_expert_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
CREATE TABLE IF NOT EXISTS ask_expert_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  query_embedding vector(1536), -- For semantic search
  query_intent jsonb DEFAULT '{}'::jsonb,
  complexity_score numeric(3,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ask_expert_queries_session
  ON ask_expert_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_ask_expert_queries_created
  ON ask_expert_queries(created_at DESC);
ALTER TABLE ask_expert_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ask_expert_queries_select_own" ON ask_expert_queries;
CREATE POLICY "ask_expert_queries_select_own"
  ON ask_expert_queries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = ask_expert_queries.session_id
    AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "ask_expert_queries_insert_own" ON ask_expert_queries;
CREATE POLICY "ask_expert_queries_insert_own"
  ON ask_expert_queries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = ask_expert_queries.session_id
    AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "service_role_all_ask_expert_queries" ON ask_expert_queries;
CREATE POLICY "service_role_all_ask_expert_queries"
  ON ask_expert_queries FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
CREATE TABLE IF NOT EXISTS expert_query_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid NOT NULL REFERENCES ask_expert_queries(id) ON DELETE CASCADE,
  agent_id text NOT NULL, -- References agents table (using text for flexibility)
  response_text text NOT NULL,
  confidence_score numeric(3,2),
  sources jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expert_query_responses_query
  ON expert_query_responses(query_id);
CREATE INDEX IF NOT EXISTS idx_expert_query_responses_agent
  ON expert_query_responses(agent_id);
CREATE INDEX IF NOT EXISTS idx_expert_query_responses_created
  ON expert_query_responses(created_at DESC);
ALTER TABLE expert_query_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expert_query_responses_select_own" ON expert_query_responses;
CREATE POLICY "expert_query_responses_select_own"
  ON expert_query_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_queries q
    JOIN ask_expert_sessions s ON s.id = q.session_id
    WHERE q.id = expert_query_responses.query_id
    AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "service_role_all_expert_query_responses" ON expert_query_responses;
CREATE POLICY "service_role_all_expert_query_responses"
  ON expert_query_responses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- MIGRATION 3: Create Expert Panel Tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS expert_panel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  panel_configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"expert_ids": ["expert_001", "expert_002"], "consensus_strategy": "voting"}
  consensus_strategy text NOT NULL DEFAULT 'voting' CHECK (consensus_strategy IN ('voting', 'weighted', 'llm_aggregation', 'unanimous')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_expert_panel_sessions_session
  ON expert_panel_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_expert_panel_sessions_status
  ON expert_panel_sessions(status);
CREATE INDEX IF NOT EXISTS idx_expert_panel_sessions_created
  ON expert_panel_sessions(created_at DESC);
ALTER TABLE expert_panel_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expert_panel_sessions_select_own" ON expert_panel_sessions;
CREATE POLICY "expert_panel_sessions_select_own"
  ON expert_panel_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = expert_panel_sessions.session_id
    AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "service_role_all_expert_panel_sessions" ON expert_panel_sessions;
CREATE POLICY "service_role_all_expert_panel_sessions"
  ON expert_panel_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
CREATE TABLE IF NOT EXISTS expert_panel_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_session_id uuid NOT NULL REFERENCES expert_panel_sessions(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  response_text text NOT NULL,
  confidence_score numeric(3,2),
  vote_weight numeric(3,2) DEFAULT 1.0,
  sources jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expert_panel_responses_panel
  ON expert_panel_responses(panel_session_id);
CREATE INDEX IF NOT EXISTS idx_expert_panel_responses_agent
  ON expert_panel_responses(agent_id);
CREATE INDEX IF NOT EXISTS idx_expert_panel_responses_created
  ON expert_panel_responses(created_at DESC);
ALTER TABLE expert_panel_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expert_panel_responses_select_own" ON expert_panel_responses;
CREATE POLICY "expert_panel_responses_select_own"
  ON expert_panel_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM expert_panel_sessions ps
    JOIN ask_expert_sessions s ON s.id = ps.session_id
    WHERE ps.id = expert_panel_responses.panel_session_id
    AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "service_role_all_expert_panel_responses" ON expert_panel_responses;
CREATE POLICY "service_role_all_expert_panel_responses"
  ON expert_panel_responses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
CREATE TABLE IF NOT EXISTS expert_workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  workflow_definition jsonb NOT NULL,
  -- Example: {"steps": [{"type": "query_expert", "expert_id": "..."}, {...}]}
  current_step integer DEFAULT 0,
  step_results jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  error_message text,
  total_execution_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_expert_workflow_executions_session
  ON expert_workflow_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_expert_workflow_executions_status
  ON expert_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_expert_workflow_executions_created
  ON expert_workflow_executions(created_at DESC);
ALTER TABLE expert_workflow_executions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expert_workflow_executions_select_own" ON expert_workflow_executions;
CREATE POLICY "expert_workflow_executions_select_own"
  ON expert_workflow_executions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = expert_workflow_executions.session_id
    AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "service_role_all_expert_workflow_executions" ON expert_workflow_executions;
CREATE POLICY "service_role_all_expert_workflow_executions"
  ON expert_workflow_executions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_agents_user
  ON user_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agents_agent
  ON user_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_user_status
  ON ask_expert_sessions(tenant_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_created
  ON ask_expert_sessions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_session_created
  ON ask_expert_queries(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_query_agent
  ON expert_query_responses(query_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_panel_sessions_session_status
  ON expert_panel_sessions(session_id, status);
CREATE INDEX IF NOT EXISTS idx_panel_responses_panel_confidence
  ON expert_panel_responses(panel_session_id, confidence_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_session_status
  ON expert_workflow_executions(session_id, status);
