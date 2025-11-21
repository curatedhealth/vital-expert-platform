-- =====================================================
-- Add Missing Tables to Remote Database
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON public.conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see conversations in their tenant
CREATE POLICY "Users can view conversations in their tenant"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy: Users can create conversations in their tenant
CREATE POLICY "Users can create conversations in their tenant"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- 2. AGENT_TOOLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agent_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, tool_id)
);

-- Indexes for agent_tools
CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id ON public.agent_tools(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_tool_id ON public.agent_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_enabled ON public.agent_tools(enabled);

-- RLS for agent_tools
ALTER TABLE public.agent_tools ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view enabled agent-tool relationships
CREATE POLICY "Anyone can view enabled agent tools"
ON public.agent_tools
FOR SELECT
TO anon, authenticated
USING (enabled = true);

-- Policy: Authenticated users can manage agent tools
CREATE POLICY "Authenticated users can manage agent tools"
ON public.agent_tools
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. ORGANIZATIONAL_ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizational_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('executive', 'senior', 'mid', 'junior', 'entry')),
  responsibilities TEXT[],
  required_skills TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for organizational_roles
CREATE INDEX IF NOT EXISTS idx_organizational_roles_slug ON public.organizational_roles(slug);
CREATE INDEX IF NOT EXISTS idx_organizational_roles_department_id ON public.organizational_roles(department_id);
CREATE INDEX IF NOT EXISTS idx_organizational_roles_level ON public.organizational_roles(level);

-- RLS for organizational_roles
ALTER TABLE public.organizational_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view organizational roles
CREATE POLICY "Anyone can view organizational roles"
ON public.organizational_roles
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Authenticated users can manage roles
CREATE POLICY "Authenticated users can manage organizational roles"
ON public.organizational_roles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. BUSINESS_FUNCTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.business_functions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT CHECK (category IN ('core', 'support', 'strategic', 'operational')),
  parent_function_id UUID REFERENCES public.business_functions(id) ON DELETE SET NULL,
  key_activities TEXT[],
  success_metrics TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for business_functions
CREATE INDEX IF NOT EXISTS idx_business_functions_slug ON public.business_functions(slug);
CREATE INDEX IF NOT EXISTS idx_business_functions_category ON public.business_functions(category);
CREATE INDEX IF NOT EXISTS idx_business_functions_parent_id ON public.business_functions(parent_function_id);

-- RLS for business_functions
ALTER TABLE public.business_functions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view business functions
CREATE POLICY "Anyone can view business functions"
ON public.business_functions
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Authenticated users can manage business functions
CREATE POLICY "Authenticated users can manage business functions"
ON public.business_functions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 5. USER_MEMORY TABLE (Enhanced user memory storage)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('preference', 'context', 'fact', 'goal', 'history')),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 1.0,
  source TEXT, -- Where this memory came from (conversation_id, import, etc)
  embedding VECTOR(1536), -- For semantic search
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tenant_id, memory_type, key)
);

-- Indexes for user_memory
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON public.user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_tenant_id ON public.user_memory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_memory_type ON public.user_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_user_memory_key ON public.user_memory(key);
CREATE INDEX IF NOT EXISTS idx_user_memory_expires_at ON public.user_memory(expires_at) WHERE expires_at IS NOT NULL;

-- RLS for user_memory
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own memory
CREATE POLICY "Users can view their own memory"
ON public.user_memory
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can create their own memory
CREATE POLICY "Users can create their own memory"
ON public.user_memory
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Policy: Users can update their own memory
CREATE POLICY "Users can update their own memory"
ON public.user_memory
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own memory
CREATE POLICY "Users can delete their own memory"
ON public.user_memory
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_tools_updated_at
  BEFORE UPDATE ON public.agent_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizational_roles_updated_at
  BEFORE UPDATE ON public.organizational_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_functions_updated_at
  BEFORE UPDATE ON public.business_functions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this after executing the above to verify all tables exist:
/*
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('conversations', 'agent_tools', 'organizational_roles', 'business_functions', 'user_memory')
ORDER BY table_name;
*/

-- Check RLS policies
/*
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'agent_tools', 'organizational_roles', 'business_functions', 'user_memory')
ORDER BY tablename, policyname;
*/
