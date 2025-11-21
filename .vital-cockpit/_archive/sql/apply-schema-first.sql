-- Apply the database schema first, then upload data
-- This ensures all tables and columns exist before data upload

-- =============================================
-- ENABLE REQUIRED EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CREATE/UPDATE LLM PROVIDERS TABLE
-- =============================================

-- Create llm_providers table with correct structure
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  api_key TEXT,
  base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  rate_limits JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  models JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE/UPDATE AGENTS TABLE
-- =============================================

-- Create agents table with all required columns
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  avatar TEXT,
  color TEXT,
  system_prompt TEXT,
  model TEXT DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  context_window INTEGER DEFAULT 8000,
  capabilities TEXT[],
  business_function TEXT,
  department TEXT,
  role TEXT,
  tier INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active',
  is_public BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID,
  organization_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE/UPDATE KNOWLEDGE DOMAINS TABLE
-- =============================================

-- Create knowledge_domains table
CREATE TABLE IF NOT EXISTS public.knowledge_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.knowledge_domains(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_domains ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE BASIC POLICIES
-- =============================================

-- LLM providers policies
CREATE POLICY "Authenticated users can view providers" ON public.llm_providers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Agents policies
CREATE POLICY "Authenticated users can view public agents" ON public.agents
  FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');

-- Knowledge domains policies
CREATE POLICY "Authenticated users can view knowledge domains" ON public.knowledge_domains
  FOR SELECT USING (auth.role() = 'authenticated');
