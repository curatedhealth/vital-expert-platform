-- Migration: Enable RLS on agents and user_agents tables
-- Purpose: Fix security vulnerability - RLS was disabled
-- Created: 2025-11-27
-- Priority: CRITICAL - Security fix

-- ============================================================================
-- Enable RLS on agents table
-- ============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Note: Policies already exist from previous migrations:
-- - agents_select_tenant_agents
-- - agents_insert_tenant_agents
-- - agents_update_tenant_agents
-- - service_role_all_agents
-- Just enabling RLS to activate them

-- ============================================================================
-- Enable RLS on user_agents table
-- ============================================================================

ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_agents table
-- Policy 1: Users can view their own agent associations
CREATE POLICY "user_agents_select_own"
  ON user_agents FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can create their own agent associations
CREATE POLICY "user_agents_insert_own"
  ON user_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can delete their own agent associations
CREATE POLICY "user_agents_delete_own"
  ON user_agents FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 4: Service role has full access
CREATE POLICY "service_role_all_user_agents"
  ON user_agents FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Run this to verify RLS is enabled:
-- SELECT tablename,
--        rowsecurity AS rls_enabled,
--        (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) AS policy_count
-- FROM pg_tables t
-- WHERE schemaname = 'public'
--   AND tablename IN ('agents', 'user_agents');

-- Expected output:
-- agents        | t | 4
-- user_agents   | t | 4
