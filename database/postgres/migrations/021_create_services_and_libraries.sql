-- Migration: Create Services Registry and Libraries
-- Description: Comprehensive schema for services, tools, templates, and libraries
-- Date: 2025-11-23

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SERVICES REGISTRY TABLE
-- ============================================================================
-- Central registry for all available services (Ask Expert, Ask Panel, Workflows, etc.)
CREATE TABLE IF NOT EXISTS services_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Service Identity
  service_name TEXT NOT NULL UNIQUE, -- 'ask_expert', 'ask_panel', 'workflows', 'solutions_marketplace'
  service_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Icon identifier (e.g., 'MessageCircle', 'Users', 'Workflow')
  
  -- Service Type & Category
  service_category TEXT NOT NULL, -- 'conversation', 'execution', 'marketplace', 'utility'
  service_type TEXT, -- 'ai_agent', 'workflow', 'tool', 'integration'
  
  -- Status & Availability
  is_enabled BOOLEAN DEFAULT TRUE,
  is_beta BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  requires_auth BOOLEAN DEFAULT TRUE,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  -- Example config:
  -- {
  --   "max_concurrent_sessions": 5,
  --   "default_model": "gpt-4",
  --   "enable_streaming": true,
  --   "supported_frameworks": ["langgraph", "autogen", "crewai"],
  --   "default_timeout_seconds": 300
  -- }
  
  -- Limits & Quotas
  rate_limit_per_minute INTEGER,
  rate_limit_per_hour INTEGER,
  quota_per_day INTEGER,
  quota_per_month INTEGER,
  
  -- Pricing (optional)
  base_cost_per_use DECIMAL(10, 4),
  cost_per_token DECIMAL(10, 6),
  
  -- API & Endpoints
  api_endpoint TEXT,
  webhook_url TEXT,
  
  -- Dependencies
  required_services TEXT[], -- Array of service IDs this depends on
  
  -- Metadata
  tags TEXT[],
  version TEXT,
  changelog TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for services_registry
CREATE INDEX IF NOT EXISTS idx_services_registry_category ON services_registry(service_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_registry_type ON services_registry(service_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_registry_enabled ON services_registry(is_enabled) WHERE deleted_at IS NULL AND is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_services_registry_public ON services_registry(is_public) WHERE deleted_at IS NULL AND is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_services_registry_tags ON services_registry USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE services_registry IS 'Central registry for all platform services including Ask Expert, Ask Panel, Workflows, and Solutions Marketplace';

-- ============================================================================
-- TOOL LIBRARY TABLE
-- ============================================================================
-- Library of reusable tools and services that can be used in workflows
CREATE TABLE IF NOT EXISTS tool_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tool Identity
  tool_name TEXT NOT NULL,
  tool_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Tool Type & Category
  tool_category TEXT NOT NULL, -- 'search', 'data', 'communication', 'analysis', 'integration', 'utility'
  tool_type TEXT NOT NULL, -- 'api', 'function', 'webhook', 'external_service', 'builtin'
  
  -- Tool Configuration
  config JSONB NOT NULL,
  -- Example config for API tool:
  -- {
  --   "method": "POST",
  --   "endpoint": "https://api.example.com/search",
  --   "headers": {"Authorization": "Bearer {{api_key}}"},
  --   "body_template": {"query": "{{input}}"},
  --   "response_mapping": {"result": "$.data.results"}
  -- }
  
  -- Input/Output Schema
  input_schema JSONB, -- JSON Schema for tool inputs
  output_schema JSONB, -- JSON Schema for tool outputs
  
  -- Examples & Documentation
  example_usage JSONB, -- Example inputs and expected outputs
  documentation_url TEXT,
  
  -- Authentication & Security
  requires_api_key BOOLEAN DEFAULT FALSE,
  api_key_field TEXT, -- Field name for API key in config
  auth_type TEXT, -- 'bearer', 'api_key', 'oauth', 'none'
  
  -- Performance & Limits
  timeout_seconds INTEGER DEFAULT 30,
  max_retries INTEGER DEFAULT 3,
  rate_limit_per_minute INTEGER,
  
  -- Availability
  is_enabled BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  is_builtin BOOLEAN DEFAULT FALSE,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID, -- For tenant-specific tools
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  
  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for tool_library
CREATE INDEX IF NOT EXISTS idx_tool_library_category ON tool_library(tool_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tool_library_type ON tool_library(tool_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tool_library_enabled ON tool_library(is_enabled) WHERE deleted_at IS NULL AND is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_tool_library_public ON tool_library(is_public) WHERE deleted_at IS NULL AND is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_tool_library_builtin ON tool_library(is_builtin) WHERE deleted_at IS NULL AND is_builtin = TRUE;
CREATE INDEX IF NOT EXISTS idx_tool_library_creator ON tool_library(created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tool_library_tenant ON tool_library(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tool_library_tags ON tool_library USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tool_library_usage ON tool_library(usage_count DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE tool_library IS 'Library of reusable tools and services for workflows and AI agents';

-- ============================================================================
-- TEMPLATE LIBRARY TABLE
-- ============================================================================
-- Library for all types of templates (prompts, workflows, agents, etc.)
CREATE TABLE IF NOT EXISTS template_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Identity
  template_name TEXT NOT NULL,
  template_slug TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Template Type
  template_type TEXT NOT NULL, -- 'prompt', 'workflow', 'agent', 'panel', 'system_message', 'user_message'
  template_category TEXT, -- 'research', 'writing', 'analysis', 'customer_support', 'healthcare', etc.
  
  -- Template Content
  content JSONB NOT NULL,
  -- For prompt templates:
  -- {
  --   "template": "You are a {{role}}. Your task is to {{task}}.",
  --   "variables": ["role", "task"],
  --   "default_values": {"role": "assistant", "task": "help the user"}
  -- }
  -- For workflow templates: (reference to workflow_definition)
  -- {
  --   "workflow_id": "uuid",
  --   "nodes": [...],
  --   "edges": [...]
  -- }
  
  -- Variables & Schema
  variables JSONB, -- List of variables and their types
  input_schema JSONB, -- JSON Schema for template inputs
  output_schema JSONB, -- JSON Schema for expected outputs
  
  -- Example Usage
  example_usage JSONB,
  preview TEXT, -- Human-readable preview
  
  -- Framework & Compatibility
  framework TEXT, -- 'langgraph', 'autogen', 'crewai', 'generic'
  compatible_services TEXT[], -- Services this template works with
  
  -- Availability
  is_enabled BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  is_builtin BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID,
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2), -- Average rating (1.00 - 5.00)
  rating_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  parent_template_id UUID REFERENCES template_library(id), -- For forked templates
  
  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for template_library
CREATE INDEX IF NOT EXISTS idx_template_library_type ON template_library(template_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_category ON template_library(template_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_framework ON template_library(framework) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_enabled ON template_library(is_enabled) WHERE deleted_at IS NULL AND is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_library_public ON template_library(is_public) WHERE deleted_at IS NULL AND is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_library_builtin ON template_library(is_builtin) WHERE deleted_at IS NULL AND is_builtin = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_library_featured ON template_library(is_featured) WHERE deleted_at IS NULL AND is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_library_creator ON template_library(created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_tenant ON template_library(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_tags ON template_library USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_usage ON template_library(usage_count DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_template_library_rating ON template_library(rating_average DESC NULLS LAST) WHERE deleted_at IS NULL;

COMMENT ON TABLE template_library IS 'Universal library for all types of templates including prompts, workflows, agents, and panels';

-- ============================================================================
-- WORKFLOW LIBRARY TABLE (Enhanced workflow storage)
-- ============================================================================
-- Enhanced workflow storage with library features
CREATE TABLE IF NOT EXISTS workflow_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Library Metadata
  library_category TEXT, -- 'starter', 'advanced', 'industry_specific', 'community'
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  estimated_execution_time INTEGER, -- In seconds
  
  -- Visibility & Sharing
  visibility TEXT NOT NULL DEFAULT 'private', -- 'private', 'organization', 'public'
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE, -- Verified by platform team
  
  -- Usage & Engagement
  view_count INTEGER DEFAULT 0,
  clone_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  
  -- SEO & Discovery
  search_keywords TEXT[],
  related_workflow_ids UUID[],
  
  -- Requirements
  required_tools TEXT[], -- List of tool slugs required
  required_services TEXT[], -- List of service slugs required
  required_api_keys TEXT[], -- List of API providers needed (e.g., 'openai', 'pinecone')
  
  -- Documentation
  setup_instructions TEXT,
  usage_guide TEXT,
  troubleshooting_guide TEXT,
  video_tutorial_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(workflow_id)
);

-- Indexes for workflow_library
CREATE INDEX IF NOT EXISTS idx_workflow_library_workflow ON workflow_library(workflow_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_library_category ON workflow_library(library_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_library_difficulty ON workflow_library(difficulty_level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_library_visibility ON workflow_library(visibility) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_library_featured ON workflow_library(is_featured) WHERE deleted_at IS NULL AND is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflow_library_verified ON workflow_library(is_verified) WHERE deleted_at IS NULL AND is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflow_library_keywords ON workflow_library USING GIN(search_keywords) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_library_rating ON workflow_library(rating_average DESC NULLS LAST) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflow_library_popularity ON workflow_library(view_count DESC, clone_count DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE workflow_library IS 'Enhanced workflow storage with library features for discovery and sharing';

-- ============================================================================
-- USER FAVORITES TABLE
-- ============================================================================
-- Track user favorites for workflows, templates, and tools
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Favorited Item
  item_type TEXT NOT NULL, -- 'workflow', 'template', 'tool', 'service'
  item_id UUID NOT NULL,
  
  -- Metadata
  notes TEXT, -- User's personal notes
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_item ON user_favorites(item_type, item_id);

COMMENT ON TABLE user_favorites IS 'User favorites for workflows, templates, tools, and services';

-- ============================================================================
-- USER RATINGS TABLE
-- ============================================================================
-- User ratings and reviews for workflows, templates, and tools
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rated Item
  item_type TEXT NOT NULL, -- 'workflow', 'template', 'tool'
  item_id UUID NOT NULL,
  
  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Helpful Votes
  helpful_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for user_ratings
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_user_ratings_helpful ON user_ratings(helpful_count DESC);

COMMENT ON TABLE user_ratings IS 'User ratings and reviews for workflows, templates, and tools';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE services_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Services Registry: Public read, admin write
CREATE POLICY services_registry_select_policy ON services_registry
  FOR SELECT
  USING (is_public = TRUE OR deleted_at IS NULL);

-- Tool Library: Users can see public/builtin tools and their own
CREATE POLICY tool_library_select_policy ON tool_library
  FOR SELECT
  USING (
    is_public = TRUE OR
    is_builtin = TRUE OR
    created_by = auth.uid() OR
    deleted_at IS NULL
  );

CREATE POLICY tool_library_insert_policy ON tool_library
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY tool_library_update_policy ON tool_library
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY tool_library_delete_policy ON tool_library
  FOR DELETE
  USING (created_by = auth.uid());

-- Template Library: Users can see public/builtin templates and their own
CREATE POLICY template_library_select_policy ON template_library
  FOR SELECT
  USING (
    is_public = TRUE OR
    is_builtin = TRUE OR
    created_by = auth.uid() OR
    deleted_at IS NULL
  );

CREATE POLICY template_library_insert_policy ON template_library
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY template_library_update_policy ON template_library
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY template_library_delete_policy ON template_library
  FOR DELETE
  USING (created_by = auth.uid());

-- Workflow Library: Follows workflow permissions
CREATE POLICY workflow_library_select_policy ON workflow_library
  FOR SELECT
  USING (
    visibility = 'public' OR
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY workflow_library_insert_policy ON workflow_library
  FOR INSERT
  WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY workflow_library_update_policy ON workflow_library
  FOR UPDATE
  USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

-- User Favorites: Users can only manage their own favorites
CREATE POLICY user_favorites_select_policy ON user_favorites
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_favorites_insert_policy ON user_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_favorites_delete_policy ON user_favorites
  FOR DELETE
  USING (user_id = auth.uid());

-- User Ratings: Users can see all ratings, but only manage their own
CREATE POLICY user_ratings_select_policy ON user_ratings
  FOR SELECT
  USING (TRUE);

CREATE POLICY user_ratings_insert_policy ON user_ratings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_ratings_update_policy ON user_ratings
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY user_ratings_delete_policy ON user_ratings
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Trigger for services_registry updated_at
CREATE TRIGGER services_registry_updated_at
  BEFORE UPDATE ON services_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tool_library updated_at
CREATE TRIGGER tool_library_updated_at
  BEFORE UPDATE ON tool_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for template_library updated_at
CREATE TRIGGER template_library_updated_at
  BEFORE UPDATE ON template_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workflow_library updated_at
CREATE TRIGGER workflow_library_updated_at
  BEFORE UPDATE ON workflow_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_ratings updated_at
CREATE TRIGGER user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update rating aggregates
CREATE OR REPLACE FUNCTION update_rating_aggregates()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3, 2);
  v_rating_count INTEGER;
BEGIN
  -- Calculate new aggregates
  SELECT 
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO v_avg_rating, v_rating_count
  FROM user_ratings
  WHERE item_type = NEW.item_type AND item_id = NEW.item_id;
  
  -- Update appropriate table based on item_type
  IF NEW.item_type = 'workflow' THEN
    UPDATE workflow_library
    SET rating_average = v_avg_rating, rating_count = v_rating_count
    WHERE workflow_id = NEW.item_id;
  ELSIF NEW.item_type = 'template' THEN
    UPDATE template_library
    SET rating_average = v_avg_rating, rating_count = v_rating_count
    WHERE id = NEW.item_id;
  ELSIF NEW.item_type = 'tool' THEN
    -- Tools don't have rating fields in current schema, but could be added
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_ratings_aggregate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_aggregates();

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
DECLARE
  v_favorite_count INTEGER;
BEGIN
  -- Calculate new favorite count
  SELECT COUNT(*)
  INTO v_favorite_count
  FROM user_favorites
  WHERE item_type = COALESCE(NEW.item_type, OLD.item_type) 
    AND item_id = COALESCE(NEW.item_id, OLD.item_id);
  
  -- Update appropriate table based on item_type
  IF COALESCE(NEW.item_type, OLD.item_type) = 'workflow' THEN
    UPDATE workflow_library
    SET favorite_count = v_favorite_count
    WHERE workflow_id = COALESCE(NEW.item_id, OLD.item_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_favorites_count_trigger
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_count();

-- ============================================================================
-- SEED DATA: Core Services
-- ============================================================================

INSERT INTO services_registry (service_name, service_slug, display_name, description, service_category, service_type, icon, config) VALUES
  ('ask_expert', 'ask-expert', 'Ask Expert', '1:1 AI consultant conversations with specialized agents', 'conversation', 'ai_agent', 'MessageCircle',
    '{"max_concurrent_chats": 5, "default_model": "gpt-4", "enable_streaming": true, "supported_modes": [1, 2, 3, 4]}'::jsonb),
  
  ('ask_panel', 'ask-panel', 'Ask Panel', 'Multi-agent panel discussions with diverse expertise', 'conversation', 'ai_agent', 'Users',
    '{"max_panel_size": 8, "default_model": "gpt-4", "enable_streaming": true, "panel_types": ["structured", "open"]}'::jsonb),
  
  ('workflows', 'workflows', 'Workflows', 'Automated multi-step AI-powered workflows', 'execution', 'workflow', 'Workflow',
    '{"supported_frameworks": ["langgraph", "autogen", "crewai"], "max_nodes": 50, "max_execution_time": 300}'::jsonb),
  
  ('solutions_marketplace', 'solutions-marketplace', 'Solutions Marketplace', 'Pre-built solution packages for common use cases', 'marketplace', 'integration', 'Package',
    '{"enable_community_solutions": true, "enable_paid_solutions": true}'::jsonb);

-- ============================================================================
-- SEED DATA: Built-in Tools
-- ============================================================================

INSERT INTO tool_library (tool_name, tool_slug, display_name, description, tool_category, tool_type, is_builtin, config, input_schema, output_schema) VALUES
  ('web_search', 'web-search', 'Web Search', 'Search the web for current information', 'search', 'builtin', TRUE,
    '{"provider": "tavily", "max_results": 10}'::jsonb,
    '{"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}'::jsonb,
    '{"type": "object", "properties": {"results": {"type": "array"}}}'::jsonb),
  
  ('document_parser', 'document-parser', 'Document Parser', 'Parse and extract content from documents', 'data', 'builtin', TRUE,
    '{"supported_formats": ["pdf", "docx", "txt", "md"]}'::jsonb,
    '{"type": "object", "properties": {"file_url": {"type": "string"}}, "required": ["file_url"]}'::jsonb,
    '{"type": "object", "properties": {"text": {"type": "string"}, "metadata": {"type": "object"}}}'::jsonb),
  
  ('code_analyzer', 'code-analyzer', 'Code Analyzer', 'Analyze code for quality, security, and best practices', 'analysis', 'builtin', TRUE,
    '{"supported_languages": ["python", "javascript", "typescript", "java"]}'::jsonb,
    '{"type": "object", "properties": {"code": {"type": "string"}, "language": {"type": "string"}}, "required": ["code"]}'::jsonb,
    '{"type": "object", "properties": {"issues": {"type": "array"}, "suggestions": {"type": "array"}}}'::jsonb),
  
  ('http_request', 'http-request', 'HTTP Request', 'Make HTTP requests to external APIs', 'integration', 'api', TRUE,
    '{"timeout": 30, "max_retries": 3}'::jsonb,
    '{"type": "object", "properties": {"url": {"type": "string"}, "method": {"type": "string"}, "headers": {"type": "object"}, "body": {"type": "object"}}, "required": ["url", "method"]}'::jsonb,
    '{"type": "object", "properties": {"status": {"type": "number"}, "body": {"type": "object"}}}'::jsonb);

-- ============================================================================
-- SEED DATA: Prompt Templates
-- ============================================================================

INSERT INTO template_library (template_name, template_slug, display_name, description, template_type, template_category, framework, is_builtin, content, variables) VALUES
  ('research_analyst_prompt', 'research-analyst', 'Research Analyst Prompt', 'System prompt for research and analysis tasks', 'prompt', 'research', 'generic', TRUE,
    '{"template": "You are an expert research analyst with deep knowledge of {{domain}}. Your task is to {{task}}. Provide comprehensive, data-driven insights with proper citations.", "variables": ["domain", "task"], "default_values": {"domain": "market dynamics", "task": "analyze trends"}}'::jsonb,
    '["domain", "task"]'::jsonb),
  
  ('technical_writer_prompt', 'technical-writer', 'Technical Writer Prompt', 'System prompt for technical writing tasks', 'prompt', 'writing', 'generic', TRUE,
    '{"template": "You are an expert technical writer creating {{document_type}} for {{audience}}. Focus on clarity, accuracy, and user-friendliness. Use {{tone}} tone.", "variables": ["document_type", "audience", "tone"], "default_values": {"document_type": "documentation", "audience": "developers", "tone": "professional"}}'::jsonb,
    '["document_type", "audience", "tone"]'::jsonb),
  
  ('code_reviewer_prompt', 'code-reviewer', 'Code Reviewer Prompt', 'System prompt for code review tasks', 'prompt', 'coding', 'generic', TRUE,
    '{"template": "You are an expert {{language}} developer reviewing code. Focus on: code quality, security vulnerabilities, performance issues, and adherence to {{standard}} standards. Provide specific, actionable feedback.", "variables": ["language", "standard"], "default_values": {"language": "Python", "standard": "PEP 8"}}'::jsonb,
    '["language", "standard"]'::jsonb),
  
  ('customer_support_prompt', 'customer-support', 'Customer Support Prompt', 'System prompt for customer support interactions', 'prompt', 'customer_support', 'generic', TRUE,
    '{"template": "You are a friendly and professional customer support agent for {{company_name}}. Help users with {{product_name}} issues. Be empathetic, clear, and solution-oriented. {{additional_context}}", "variables": ["company_name", "product_name", "additional_context"], "default_values": {"company_name": "our company", "product_name": "our product", "additional_context": ""}}'::jsonb,
    '["company_name", "product_name", "additional_context"]'::jsonb);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN services_registry.config IS 'Service configuration including limits, models, and feature flags';
COMMENT ON COLUMN tool_library.config IS 'Tool configuration including API endpoints, authentication, and parameters';
COMMENT ON COLUMN template_library.content IS 'Template content with variables, can be prompt text or workflow definition';
COMMENT ON COLUMN workflow_library.required_api_keys IS 'List of external API providers needed (e.g., openai, pinecone, tavily)';

