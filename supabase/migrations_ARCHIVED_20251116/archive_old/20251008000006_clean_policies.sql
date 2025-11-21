-- Clean Policies Migration
-- This migration drops all existing policies and recreates them cleanly

-- =============================================
-- DROP ALL EXISTING POLICIES
-- =============================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.llm_usage_logs;
DROP POLICY IF EXISTS "Users can insert own usage logs" ON public.llm_usage_logs;
DROP POLICY IF EXISTS "Authenticated users can view providers" ON public.llm_providers;
DROP POLICY IF EXISTS "Authenticated users can view public agents" ON public.agents;
DROP POLICY IF EXISTS "Users can create agents" ON public.agents;
DROP POLICY IF EXISTS "Users can update own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Authenticated users can view knowledge domains" ON public.knowledge_domains;
DROP POLICY IF EXISTS "Users can view public documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.knowledge_documents;
DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view messages in own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view public workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can create workflows" ON public.workflows;
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admin users can view audit logs" ON public.audit_logs;

-- =============================================
-- RECREATE ALL POLICIES CLEANLY
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- User organizations policies
CREATE POLICY "Users can view own memberships" ON public.user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Agents policies
CREATE POLICY "Authenticated users can view public agents" ON public.agents
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Users can create agents" ON public.agents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own agents" ON public.agents
  FOR UPDATE USING (created_by = auth.uid());

-- LLM providers policies
CREATE POLICY "Authenticated users can view providers" ON public.llm_providers
  FOR SELECT USING (auth.role() = 'authenticated');

-- LLM usage logs policies
CREATE POLICY "Users can view own usage logs" ON public.llm_usage_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own usage logs" ON public.llm_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Knowledge domains policies
CREATE POLICY "Authenticated users can view knowledge domains" ON public.knowledge_domains
  FOR SELECT USING (auth.role() = 'authenticated');

-- Knowledge documents policies
CREATE POLICY "Users can view public documents" ON public.knowledge_documents
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Users can create documents" ON public.knowledge_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages in own sessions" ON public.chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Workflows policies
CREATE POLICY "Users can view public workflows" ON public.workflows
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Analytics events policies
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Audit logs policies (admin only)
CREATE POLICY "Admin users can view audit logs" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'service_role');
