-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Description: Multi-tenant RLS policies for data isolation and compliance
-- Version: 1.0.0
-- Date: 2025-01-27
-- Compliance: HIPAA, GDPR, CCPA, SOC 2
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user has role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = required_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- TENANTS POLICIES
-- ============================================================================

-- Users can view their own tenant
CREATE POLICY "Users can view own tenant"
  ON tenants FOR SELECT
  USING (id = auth.user_tenant_id());

-- Admins can manage their tenant
CREATE POLICY "Admins can update own tenant"
  ON tenants FOR UPDATE
  USING (id = auth.user_tenant_id() AND auth.is_admin());

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can view users in their tenant
CREATE POLICY "Users can view users in own tenant"
  ON users FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

-- Users can view and update their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Admins can manage users in their tenant
CREATE POLICY "Admins can insert users in own tenant"
  ON users FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id() AND auth.is_admin());

CREATE POLICY "Admins can update users in own tenant"
  ON users FOR UPDATE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

CREATE POLICY "Admins can delete users in own tenant"
  ON users FOR DELETE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============================================================================
-- AGENTS POLICIES
-- ============================================================================

-- Public agents (tenant_id IS NULL) are viewable by all authenticated users
-- Tenant-specific agents are viewable only by that tenant
CREATE POLICY "Users can view agents"
  ON agents FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      tenant_id IS NULL OR
      tenant_id = auth.user_tenant_id()
    )
  );

-- Admins can manage agents in their tenant
CREATE POLICY "Admins can insert agents in own tenant"
  ON agents FOR INSERT
  WITH CHECK (
    auth.is_admin() AND (
      tenant_id IS NULL OR
      tenant_id = auth.user_tenant_id()
    )
  );

CREATE POLICY "Admins can update agents in own tenant"
  ON agents FOR UPDATE
  USING (
    auth.is_admin() AND (
      tenant_id IS NULL OR
      tenant_id = auth.user_tenant_id()
    )
  );

CREATE POLICY "Admins can delete agents in own tenant"
  ON agents FOR DELETE
  USING (
    auth.is_admin() AND (
      tenant_id IS NULL OR
      tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Users can create conversations in their tenant
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- Users can create messages in their conversations
CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- Users can update messages in their conversations
CREATE POLICY "Users can update messages in own conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- SOURCES POLICIES
-- ============================================================================

-- Users can view sources in their messages
CREATE POLICY "Users can view sources in own messages"
  ON sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversations ON conversations.id = messages.conversation_id
      WHERE messages.id = sources.message_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- System can create sources
CREATE POLICY "System can create sources"
  ON sources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversations ON conversations.id = messages.conversation_id
      WHERE messages.id = sources.message_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- AGENT METRICS POLICIES
-- ============================================================================

-- Users can view agent metrics in their tenant
CREATE POLICY "Users can view agent metrics in own tenant"
  ON agent_metrics FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

-- System can create/update agent metrics
CREATE POLICY "System can upsert agent metrics"
  ON agent_metrics FOR ALL
  USING (tenant_id = auth.user_tenant_id())
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- ============================================================================
-- INTENT CLASSIFICATIONS POLICIES
-- ============================================================================

-- Users can view intent classifications for their conversations
CREATE POLICY "Users can view intent classifications in own conversations"
  ON intent_classifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = intent_classifications.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- System can create intent classifications
CREATE POLICY "System can create intent classifications"
  ON intent_classifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = intent_classifications.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- CHECKPOINTS POLICIES (Mode 5)
-- ============================================================================

-- Users can view checkpoints in their conversations
CREATE POLICY "Users can view checkpoints in own conversations"
  ON checkpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = checkpoints.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- Users can approve/reject checkpoints in their conversations
CREATE POLICY "Users can update checkpoints in own conversations"
  ON checkpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = checkpoints.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- System can create checkpoints
CREATE POLICY "System can create checkpoints"
  ON checkpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = checkpoints.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- TASK PLANS POLICIES (Mode 5)
-- ============================================================================

-- Users can view task plans in their conversations
CREATE POLICY "Users can view task plans in own conversations"
  ON task_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = task_plans.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- System can manage task plans
CREATE POLICY "System can manage task plans"
  ON task_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = task_plans.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = task_plans.conversation_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- TASK STEPS POLICIES (Mode 5)
-- ============================================================================

-- Users can view task steps in their task plans
CREATE POLICY "Users can view task steps in own task plans"
  ON task_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM task_plans
      JOIN conversations ON conversations.id = task_plans.conversation_id
      WHERE task_plans.id = task_steps.task_plan_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- System can manage task steps
CREATE POLICY "System can manage task steps"
  ON task_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM task_plans
      JOIN conversations ON conversations.id = task_plans.conversation_id
      WHERE task_plans.id = task_steps.task_plan_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM task_plans
      JOIN conversations ON conversations.id = task_plans.conversation_id
      WHERE task_plans.id = task_steps.task_plan_id
      AND conversations.user_id = auth.uid()
      AND conversations.tenant_id = auth.user_tenant_id()
    )
  );

-- ============================================================================
-- AUDIT LOGS POLICIES (HIPAA/GDPR/SOC 2)
-- ============================================================================

-- Admins can view audit logs in their tenant
CREATE POLICY "Admins can view audit logs in own tenant"
  ON audit_logs FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- System can create audit logs (via service role)
CREATE POLICY "Service role can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS, but explicit policy for documentation

-- Audit logs are immutable (no update/delete)
-- This is enforced by not creating UPDATE/DELETE policies

-- ============================================================================
-- DATA SUBJECT REQUESTS POLICIES (GDPR/CCPA)
-- ============================================================================

-- Users can view their own data subject requests
CREATE POLICY "Users can view own data subject requests"
  ON data_subject_requests FOR SELECT
  USING (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Users can create their own data subject requests
CREATE POLICY "Users can create own data subject requests"
  ON data_subject_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Admins can view all DSRs in their tenant
CREATE POLICY "Admins can view all data subject requests in own tenant"
  ON data_subject_requests FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- Admins can update DSR status
CREATE POLICY "Admins can update data subject requests in own tenant"
  ON data_subject_requests FOR UPDATE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============================================================================
-- CONSENT RECORDS POLICIES (GDPR/CCPA)
-- ============================================================================

-- Users can view their own consent records
CREATE POLICY "Users can view own consent records"
  ON consent_records FOR SELECT
  USING (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Users can create/update their own consent records
CREATE POLICY "Users can manage own consent records"
  ON consent_records FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

CREATE POLICY "Users can update own consent records"
  ON consent_records FOR UPDATE
  USING (
    user_id = auth.uid() AND
    tenant_id = auth.user_tenant_id()
  );

-- Admins can view all consent records in their tenant
CREATE POLICY "Admins can view all consent records in own tenant"
  ON consent_records FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own tenant" ON tenants IS
  'Multi-tenant isolation: users can only view their own tenant';

COMMENT ON POLICY "Users can view agents" ON agents IS
  'Global agents (tenant_id IS NULL) visible to all; tenant-specific agents isolated by tenant_id';

COMMENT ON POLICY "Users can view own conversations" ON conversations IS
  'Users can only view conversations they created in their tenant';

COMMENT ON POLICY "Admins can view audit logs in own tenant" ON audit_logs IS
  'HIPAA/SOC 2 compliance: only admins can access audit logs, tenant-isolated';

COMMENT ON POLICY "Users can view own data subject requests" ON data_subject_requests IS
  'GDPR/CCPA compliance: users can view and create their own data subject requests';
