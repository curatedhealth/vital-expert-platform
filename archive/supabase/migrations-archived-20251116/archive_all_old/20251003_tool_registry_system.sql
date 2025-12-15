-- ============================================================================
-- Tool Registry System
-- Manages available tools and their assignments to agents
-- ============================================================================

-- Create tool_categories table
CREATE TABLE IF NOT EXISTS public.tool_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_key TEXT NOT NULL UNIQUE, -- e.g., 'web_search', 'pubmed_search'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.tool_categories(id) ON DELETE SET NULL,

  -- Tool configuration
  tool_type TEXT NOT NULL, -- 'api', 'function', 'hybrid'
  implementation_path TEXT, -- Path to implementation function
  api_endpoint TEXT, -- External API endpoint if applicable
  requires_api_key BOOLEAN DEFAULT FALSE,
  api_key_env_var TEXT, -- e.g., 'TAVILY_API_KEY'

  -- Tool metadata
  input_schema JSONB, -- Zod schema as JSON
  output_format TEXT, -- 'json', 'text', 'structured'
  max_iterations INTEGER DEFAULT 1,
  timeout_seconds INTEGER DEFAULT 30,
  rate_limit_per_minute INTEGER,

  -- Cost & performance
  estimated_cost_per_call DECIMAL(10, 6), -- in USD
  avg_response_time_ms INTEGER,

  -- Usage restrictions
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,

  -- Documentation
  usage_examples JSONB,
  best_practices TEXT[],
  limitations TEXT[],
  documentation_url TEXT,

  -- Analytics
  total_calls INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2), -- percentage
  avg_confidence_score DECIMAL(5, 2),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tool_tags table for flexible categorization
CREATE TABLE IF NOT EXISTS public.tool_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create many-to-many relationship: tools <-> tags
CREATE TABLE IF NOT EXISTS public.tool_tag_assignments (
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tool_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create agent_tool_assignments table
CREATE TABLE IF NOT EXISTS public.agent_tool_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,

  -- Assignment configuration
  is_enabled BOOLEAN DEFAULT TRUE,
  auto_use BOOLEAN DEFAULT FALSE, -- Automatically use for relevant queries
  requires_confirmation BOOLEAN DEFAULT FALSE, -- Ask user before using
  priority INTEGER DEFAULT 0, -- Higher priority tools used first

  -- Usage limits for this agent
  max_uses_per_conversation INTEGER,
  max_uses_per_day INTEGER,
  current_day_usage INTEGER DEFAULT 0,

  -- Performance tracking
  times_used INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_user_satisfaction DECIMAL(3, 2),

  -- Assignment metadata
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (agent_id, tool_id)
);

-- Create tool_usage_logs table for analytics
CREATE TABLE IF NOT EXISTS public.tool_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversation_id UUID, -- Reference to chat conversation

  -- Usage details
  input JSONB,
  output JSONB,
  success BOOLEAN,
  error_message TEXT,

  -- Performance metrics
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  cost DECIMAL(10, 6),

  -- Context
  query_context TEXT,
  relevance_score DECIMAL(3, 2), -- How relevant was this tool call
  user_feedback INTEGER, -- -1, 0, 1 (negative, neutral, positive)

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_tools_tool_key ON public.tools(tool_key);
CREATE INDEX idx_tools_category ON public.tools(category_id);
CREATE INDEX idx_tools_is_active ON public.tools(is_active);
CREATE INDEX idx_agent_tools_agent ON public.agent_tool_assignments(agent_id);
CREATE INDEX idx_agent_tools_tool ON public.agent_tool_assignments(tool_id);
CREATE INDEX idx_tool_usage_tool ON public.tool_usage_logs(tool_id);
CREATE INDEX idx_tool_usage_agent ON public.tool_usage_logs(agent_id);
CREATE INDEX idx_tool_usage_created ON public.tool_usage_logs(created_at);

-- Create RLS policies
ALTER TABLE public.tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can read tool categories and tools
CREATE POLICY "Tool categories are viewable by everyone"
  ON public.tool_categories FOR SELECT
  USING (true);

CREATE POLICY "Tools are viewable by everyone"
  ON public.tools FOR SELECT
  USING (true);

CREATE POLICY "Tool tags are viewable by everyone"
  ON public.tool_tags FOR SELECT
  USING (true);

CREATE POLICY "Tool tag assignments are viewable by everyone"
  ON public.tool_tag_assignments FOR SELECT
  USING (true);

-- Users can view tool assignments for their agents
CREATE POLICY "Users can view their agent tool assignments"
  ON public.agent_tool_assignments FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE created_by = auth.uid()
    )
  );

-- Users can manage tool assignments for their agents
CREATE POLICY "Users can manage their agent tool assignments"
  ON public.agent_tool_assignments FOR ALL
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE created_by = auth.uid()
    )
  );

-- Users can view their own tool usage logs
CREATE POLICY "Users can view their tool usage logs"
  ON public.tool_usage_logs FOR SELECT
  USING (user_id = auth.uid());

-- System can insert usage logs
CREATE POLICY "System can insert tool usage logs"
  ON public.tool_usage_logs FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_tool_categories_updated_at
  BEFORE UPDATE ON public.tool_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tool_assignments_updated_at
  BEFORE UPDATE ON public.agent_tool_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Seed Data: Tool Categories
-- ============================================================================

INSERT INTO public.tool_categories (name, description, icon, display_order) VALUES
('Evidence Research', 'Search and retrieve evidence from medical literature, clinical trials, and regulatory databases', '🔬', 1),
('Regulatory & Standards', 'Access regulatory guidelines, standards, and compliance information', '📋', 2),
('Digital Health', 'Digital medicine resources, decentralized trials, and digital endpoints', '💻', 3),
('Knowledge Management', 'Internal knowledge bases and documentation', '📚', 4),
('Computation', 'Mathematical calculations and data analysis', '🔢', 5),
('General Research', 'Web search and general information retrieval', '🌐', 6);

-- ============================================================================
-- Seed Data: Tools (13 Expert Tools)
-- ============================================================================

INSERT INTO public.tools (
  tool_key, name, description, category_id, tool_type, implementation_path,
  requires_api_key, api_key_env_var, input_schema, output_format,
  timeout_seconds, is_active, is_premium, documentation_url
) VALUES
-- General Research
(
  'web_search',
  'Web Search',
  'Search the web for current information, news, research papers, regulatory updates, clinical trial data, or drug approvals using Tavily API.',
  (SELECT id FROM public.tool_categories WHERE name = 'General Research'),
  'api',
  'expert-tools.createWebSearchTool',
  true,
  'TAVILY_API_KEY',
  '{"query": "string", "maxResults": "number"}',
  'json',
  30,
  true,
  false,
  'https://docs.tavily.com'
),

-- Evidence Research
(
  'pubmed_search',
  'PubMed Search',
  'Search PubMed for peer-reviewed medical research papers, clinical studies, and systematic reviews.',
  (SELECT id FROM public.tool_categories WHERE name = 'Evidence Research'),
  'api',
  'expert-tools.createPubMedSearchTool',
  false,
  NULL,
  '{"query": "string", "maxResults": "number"}',
  'json',
  30,
  true,
  false,
  'https://www.ncbi.nlm.nih.gov/books/NBK25501/'
),

(
  'search_clinical_trials',
  'ClinicalTrials.gov Search',
  'Search ClinicalTrials.gov for clinical trials by condition, intervention, sponsor, phase, or status.',
  (SELECT id FROM public.tool_categories WHERE name = 'Evidence Research'),
  'api',
  'evidence-retrieval.createClinicalTrialsSearchTool',
  false,
  NULL,
  '{"query": "string", "condition": "string", "intervention": "string", "phase": "string", "status": "string", "maxResults": "number"}',
  'json',
  30,
  true,
  false,
  'https://clinicaltrials.gov/api/v2/'
),

(
  'search_fda_approvals',
  'FDA OpenFDA Search',
  'Search FDA OpenFDA database for drug approvals, including brand names, generic names, approval dates, and indications.',
  (SELECT id FROM public.tool_categories WHERE name = 'Evidence Research'),
  'api',
  'evidence-retrieval.createFDAApprovalsSearchTool',
  false,
  NULL,
  '{"query": "string", "searchField": "string", "maxResults": "number"}',
  'json',
  30,
  true,
  false,
  'https://open.fda.gov/apis/'
),

-- Regulatory & Standards
(
  'search_ema_authorizations',
  'EMA Authorization Search',
  'Search European Medicines Agency (EMA) database for EU drug authorizations.',
  (SELECT id FROM public.tool_categories WHERE name = 'Regulatory & Standards'),
  'function',
  'evidence-retrieval.createEMASearchTool',
  false,
  NULL,
  '{"query": "string", "maxResults": "number"}',
  'json',
  30,
  true,
  false,
  'https://www.ema.europa.eu/en/medicines'
),

(
  'search_who_essential_medicines',
  'WHO Essential Medicines',
  'Search the WHO Model List of Essential Medicines to check if a drug is included.',
  (SELECT id FROM public.tool_categories WHERE name = 'Regulatory & Standards'),
  'function',
  'evidence-retrieval.createWHOEssentialMedicinesSearchTool',
  false,
  NULL,
  '{"query": "string"}',
  'json',
  30,
  true,
  false,
  'https://list.essentialmeds.org/'
),

(
  'search_multi_region_regulatory',
  'Multi-Region Regulatory Search',
  'Search regulatory databases across multiple regions (US FDA, EU EMA, Japan PMDA, Canada Health Canada) simultaneously.',
  (SELECT id FROM public.tool_categories WHERE name = 'Regulatory & Standards'),
  'function',
  'evidence-retrieval.createMultiRegionRegulatorySearchTool',
  false,
  NULL,
  '{"drugName": "string", "includeRegions": "array"}',
  'json',
  30,
  true,
  false,
  NULL
),

(
  'search_ich_guidelines',
  'ICH Guidelines Search',
  'Search ICH (International Council for Harmonisation) guidelines for pharmaceutical development covering Quality, Safety, Efficacy, and Multidisciplinary topics.',
  (SELECT id FROM public.tool_categories WHERE name = 'Regulatory & Standards'),
  'function',
  'clinical-standards-tools.createICHGuidelinesSearchTool',
  false,
  NULL,
  '{"query": "string", "category": "string"}',
  'json',
  30,
  true,
  false,
  'https://www.ich.org'
),

(
  'search_iso_standards',
  'ISO Standards Search',
  'Search ISO (International Organization for Standardization) standards relevant to healthcare, medical devices, and pharmaceutical quality.',
  (SELECT id FROM public.tool_categories WHERE name = 'Regulatory & Standards'),
  'function',
  'clinical-standards-tools.createISOStandardsSearchTool',
  false,
  NULL,
  '{"query": "string", "scope": "string"}',
  'json',
  30,
  true,
  false,
  'https://www.iso.org'
),

-- Digital Health
(
  'search_dime_resources',
  'DiMe Digital Health Resources',
  'Search Digital Medicine Society (DiMe) resources including digital endpoints library, playbooks for decentralized clinical trials, and regulatory guidance.',
  (SELECT id FROM public.tool_categories WHERE name = 'Digital Health'),
  'function',
  'clinical-standards-tools.createDiMeResourcesSearchTool',
  false,
  NULL,
  '{"query": "string", "resourceType": "string"}',
  'json',
  30,
  true,
  false,
  'https://www.dimesociety.org'
),

(
  'search_ichom_standard_sets',
  'ICHOM Standard Sets',
  'Search ICHOM (International Consortium for Health Outcomes Measurement) standard sets for patient-centered outcome measures.',
  (SELECT id FROM public.tool_categories WHERE name = 'Digital Health'),
  'function',
  'clinical-standards-tools.createICHOMStandardSetsSearchTool',
  false,
  NULL,
  '{"condition": "string"}',
  'json',
  30,
  true,
  false,
  'https://www.ichom.org'
),

-- Knowledge Management
(
  'knowledge_base',
  'Knowledge Base Search',
  'Search internal company knowledge base with 1,268+ knowledge chunks including clinical research, regulatory compliance, and commercial strategy.',
  (SELECT id FROM public.tool_categories WHERE name = 'Knowledge Management'),
  'hybrid',
  'expert-tools.createKnowledgeBaseTool',
  false,
  NULL,
  '{"query": "string", "category": "string", "topK": "number"}',
  'json',
  30,
  true,
  false,
  NULL
),

-- Computation
(
  'calculator',
  'Calculator',
  'Perform mathematical calculations including arithmetic, percentages, financial calculations, and statistical operations.',
  (SELECT id FROM public.tool_categories WHERE name = 'Computation'),
  'function',
  'expert-tools.createCalculatorTool',
  false,
  NULL,
  '{"expression": "string", "context": "string"}',
  'json',
  10,
  true,
  false,
  NULL
);

-- ============================================================================
-- Seed Data: Tool Tags
-- ============================================================================

INSERT INTO public.tool_tags (name, color) VALUES
('Medical Research', '#10b981'),
('Clinical Trials', '#8b5cf6'),
('Regulatory', '#ef4444'),
('Drug Information', '#f59e0b'),
('Standards', '#3b82f6'),
('Digital Health', '#ec4899'),
('Internal', '#6366f1'),
('Mathematical', '#14b8a6');

-- ============================================================================
-- Seed Data: Tool Tag Assignments
-- ============================================================================

-- PubMed
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'pubmed_search'), (SELECT id FROM public.tool_tags WHERE name = 'Medical Research'));

-- ClinicalTrials.gov
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'search_clinical_trials'), (SELECT id FROM public.tool_tags WHERE name = 'Clinical Trials')),
((SELECT id FROM public.tools WHERE tool_key = 'search_clinical_trials'), (SELECT id FROM public.tool_tags WHERE name = 'Medical Research'));

-- FDA
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'search_fda_approvals'), (SELECT id FROM public.tool_tags WHERE name = 'Regulatory')),
((SELECT id FROM public.tools WHERE tool_key = 'search_fda_approvals'), (SELECT id FROM public.tool_tags WHERE name = 'Drug Information'));

-- ICH Guidelines
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'search_ich_guidelines'), (SELECT id FROM public.tool_tags WHERE name = 'Regulatory')),
((SELECT id FROM public.tools WHERE tool_key = 'search_ich_guidelines'), (SELECT id FROM public.tool_tags WHERE name = 'Standards'));

-- ISO Standards
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'search_iso_standards'), (SELECT id FROM public.tool_tags WHERE name = 'Standards'));

-- DiMe
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'search_dime_resources'), (SELECT id FROM public.tool_tags WHERE name = 'Digital Health'));

-- ICHOM
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'search_ichom_standard_sets'), (SELECT id FROM public.tool_tags WHERE name = 'Digital Health')),
((SELECT id FROM public.tools WHERE tool_key = 'search_ichom_standard_sets'), (SELECT id FROM public.tool_tags WHERE name = 'Standards'));

-- Knowledge Base
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'knowledge_base'), (SELECT id FROM public.tool_tags WHERE name = 'Internal'));

-- Calculator
INSERT INTO public.tool_tag_assignments (tool_id, tag_id) VALUES
((SELECT id FROM public.tools WHERE tool_key = 'calculator'), (SELECT id FROM public.tool_tags WHERE name = 'Mathematical'));
