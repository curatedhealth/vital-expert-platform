-- Migration: Create Ask Expert Core Tables
-- Purpose: Session tracking, query logging, response storage
-- Created: 2025-11-27
-- Priority: HIGH - Required for Ask Expert functionality

-- ============================================================================
-- Table 1: ask_expert_sessions
-- Purpose: Track user consultation sessions
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_tenant
  ON ask_expert_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_user
  ON ask_expert_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_status
  ON ask_expert_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_created
  ON ask_expert_sessions(created_at DESC);

-- RLS Policies
ALTER TABLE ask_expert_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ask_expert_sessions_select_own"
  ON ask_expert_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ask_expert_sessions_insert_own"
  ON ask_expert_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ask_expert_sessions_update_own"
  ON ask_expert_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "service_role_all_ask_expert_sessions"
  ON ask_expert_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Table 2: ask_expert_queries
-- Purpose: Store individual queries within sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS ask_expert_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  query_embedding vector(1536), -- For semantic search
  query_intent jsonb DEFAULT '{}'::jsonb,
  complexity_score numeric(3,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ask_expert_queries_session
  ON ask_expert_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_ask_expert_queries_created
  ON ask_expert_queries(created_at DESC);

-- RLS Policies
ALTER TABLE ask_expert_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ask_expert_queries_select_own"
  ON ask_expert_queries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = ask_expert_queries.session_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "ask_expert_queries_insert_own"
  ON ask_expert_queries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ask_expert_sessions s
    WHERE s.id = ask_expert_queries.session_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "service_role_all_ask_expert_queries"
  ON ask_expert_queries FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Table 3: expert_query_responses
-- Purpose: Store expert responses to queries
-- ============================================================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expert_query_responses_query
  ON expert_query_responses(query_id);
CREATE INDEX IF NOT EXISTS idx_expert_query_responses_agent
  ON expert_query_responses(agent_id);
CREATE INDEX IF NOT EXISTS idx_expert_query_responses_created
  ON expert_query_responses(created_at DESC);

-- RLS Policies
ALTER TABLE expert_query_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expert_query_responses_select_own"
  ON expert_query_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ask_expert_queries q
    JOIN ask_expert_sessions s ON s.id = q.session_id
    WHERE q.id = expert_query_responses.query_id
    AND s.user_id = auth.uid()
  ));

CREATE POLICY "service_role_all_expert_query_responses"
  ON expert_query_responses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Run this to verify tables exist with RLS enabled:
-- SELECT tablename,
--        rowsecurity AS rls_enabled,
--        (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) AS policy_count
-- FROM pg_tables t
-- WHERE schemaname = 'public'
--   AND tablename IN ('ask_expert_sessions', 'ask_expert_queries', 'expert_query_responses');

-- Expected output:
-- ask_expert_sessions        | t | 4
-- ask_expert_queries         | t | 3
-- expert_query_responses     | t | 2
