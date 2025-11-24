-- Migration: Enhance Services Registry and Create Library Tables
-- Description: Update existing tables and create new library features
-- Date: 2025-11-23
-- Note: This migration works with EXISTING schema and adds enhancements

-- ============================================================================
-- PART 1: ENHANCE EXISTING services_registry TABLE
-- ============================================================================
-- Add missing columns to existing services_registry table

ALTER TABLE public.services_registry 
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS service_category TEXT,
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS requires_auth BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS rate_limit_per_minute INTEGER,
  ADD COLUMN IF NOT EXISTS quota_per_day INTEGER,
  ADD COLUMN IF NOT EXISTS base_cost_per_use DECIMAL(10, 4),
  ADD COLUMN IF NOT EXISTS cost_per_token DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
  ADD COLUMN IF NOT EXISTS webhook_url TEXT,
  ADD COLUMN IF NOT EXISTS required_services TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS version TEXT,
  ADD COLUMN IF NOT EXISTS changelog TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_services_registry_category_v2 ON services_registry(service_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_registry_type_v2 ON services_registry(service_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_registry_public_v2 ON services_registry(is_public) WHERE deleted_at IS NULL AND is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_services_registry_tags_v2 ON services_registry USING GIN(tags) WHERE deleted_at IS NULL;

COMMENT ON TABLE services_registry IS 'Central registry for all platform services including Ask Expert, Ask Panel, Workflows, and Solutions Marketplace';

-- ============================================================================
-- PART 2: CREATE template_library TABLE (Unified template storage)
-- ============================================================================
-- This complements the existing 'prompts' table by adding library features

CREATE TABLE IF NOT EXISTS template_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Link to existing tables (prompts, workflow_templates, etc.)
  source_table TEXT, -- 'prompts', 'workflow_templates', 'agent_templates', 'custom'
  source_id UUID, -- ID from source table if applicable
  
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
  
  -- Variables & Schema
  variables JSONB,
  input_schema JSONB,
  output_schema JSONB,
  
  -- Example Usage
  example_usage JSONB,
  preview TEXT,
  
  -- Framework & Compatibility
  framework TEXT, -- 'langgraph', 'autogen', 'crewai', 'generic'
  compatible_services TEXT[],
  
  -- Availability
  is_enabled BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  is_builtin BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Versioning
  version TEXT DEFAULT '1.0.0',
  parent_template_id UUID REFERENCES template_library(id),
  
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
CREATE INDEX IF NOT EXISTS idx_template_library_source ON template_library(source_table, source_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE template_library IS 'Universal library for all types of templates with enhanced discovery and management features';

-- ============================================================================
-- PART 3: CREATE workflow_library TABLE (Enhanced workflow metadata)
-- ============================================================================
-- Extends the existing 'workflows' table with library-specific features

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
  is_verified BOOLEAN DEFAULT FALSE,
  
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
  required_tools TEXT[], -- Slugs from 'tools' table
  required_services TEXT[], -- Slugs from 'services_registry'
  required_api_keys TEXT[], -- e.g., 'openai', 'pinecone', 'tavily'
  
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

COMMENT ON TABLE workflow_library IS 'Enhanced workflow metadata for discovery, sharing, and management';

-- ============================================================================
-- PART 4: CREATE user_favorites TABLE
-- ============================================================================
-- Track user favorites for workflows, templates, and tools

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Favorited Item
  item_type TEXT NOT NULL, -- 'workflow', 'template', 'tool', 'service', 'prompt'
  item_id UUID NOT NULL,
  
  -- Metadata
  notes TEXT,
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
-- PART 5: CREATE user_ratings TABLE
-- ============================================================================
-- User ratings and reviews for workflows, templates, and tools

CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rated Item
  item_type TEXT NOT NULL, -- 'workflow', 'template', 'tool', 'prompt'
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
-- PART 6: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE template_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Template Library: Users can see public/builtin templates and their own
DROP POLICY IF EXISTS template_library_select_policy ON template_library;
CREATE POLICY template_library_select_policy ON template_library
  FOR SELECT
  USING (
    is_public = TRUE OR
    is_builtin = TRUE OR
    created_by = auth.uid() OR
    deleted_at IS NULL
  );

DROP POLICY IF EXISTS template_library_insert_policy ON template_library;
CREATE POLICY template_library_insert_policy ON template_library
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS template_library_update_policy ON template_library;
CREATE POLICY template_library_update_policy ON template_library
  FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS template_library_delete_policy ON template_library;
CREATE POLICY template_library_delete_policy ON template_library
  FOR DELETE
  USING (created_by = auth.uid());

-- Workflow Library: Follows workflow permissions
DROP POLICY IF EXISTS workflow_library_select_policy ON workflow_library;
CREATE POLICY workflow_library_select_policy ON workflow_library
  FOR SELECT
  USING (
    visibility = 'public' OR
    workflow_id IN (SELECT id FROM workflows WHERE created_by = auth.uid())
  );

DROP POLICY IF EXISTS workflow_library_insert_policy ON workflow_library;
CREATE POLICY workflow_library_insert_policy ON workflow_library
  FOR INSERT
  WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE created_by = auth.uid())
  );

DROP POLICY IF EXISTS workflow_library_update_policy ON workflow_library;
CREATE POLICY workflow_library_update_policy ON workflow_library
  FOR UPDATE
  USING (
    workflow_id IN (SELECT id FROM workflows WHERE created_by = auth.uid())
  );

-- User Favorites: Users can only manage their own favorites
DROP POLICY IF EXISTS user_favorites_select_policy ON user_favorites;
CREATE POLICY user_favorites_select_policy ON user_favorites
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_favorites_insert_policy ON user_favorites;
CREATE POLICY user_favorites_insert_policy ON user_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_favorites_delete_policy ON user_favorites;
CREATE POLICY user_favorites_delete_policy ON user_favorites
  FOR DELETE
  USING (user_id = auth.uid());

-- User Ratings: Users can see all ratings, but only manage their own
DROP POLICY IF EXISTS user_ratings_select_policy ON user_ratings;
CREATE POLICY user_ratings_select_policy ON user_ratings
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS user_ratings_insert_policy ON user_ratings;
CREATE POLICY user_ratings_insert_policy ON user_ratings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS user_ratings_update_policy ON user_ratings;
CREATE POLICY user_ratings_update_policy ON user_ratings
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_ratings_delete_policy ON user_ratings;
CREATE POLICY user_ratings_delete_policy ON user_ratings
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- PART 7: FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Trigger for template_library updated_at
DROP TRIGGER IF EXISTS template_library_updated_at ON template_library;
CREATE TRIGGER template_library_updated_at
  BEFORE UPDATE ON template_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workflow_library updated_at
DROP TRIGGER IF EXISTS workflow_library_updated_at ON workflow_library;
CREATE TRIGGER workflow_library_updated_at
  BEFORE UPDATE ON workflow_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_ratings updated_at
DROP TRIGGER IF EXISTS user_ratings_updated_at ON user_ratings;
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
  WHERE item_type = COALESCE(NEW.item_type, OLD.item_type) 
    AND item_id = COALESCE(NEW.item_id, OLD.item_id);
  
  -- Update appropriate table based on item_type
  IF COALESCE(NEW.item_type, OLD.item_type) = 'workflow' THEN
    UPDATE workflow_library
    SET rating_average = v_avg_rating, rating_count = v_rating_count
    WHERE workflow_id = COALESCE(NEW.item_id, OLD.item_id);
  ELSIF COALESCE(NEW.item_type, OLD.item_type) = 'template' THEN
    UPDATE template_library
    SET rating_average = v_avg_rating, rating_count = v_rating_count
    WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_ratings_aggregate_trigger ON user_ratings;
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

DROP TRIGGER IF EXISTS user_favorites_count_trigger ON user_favorites;
CREATE TRIGGER user_favorites_count_trigger
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_count();

-- ============================================================================
-- PART 8: SEED DATA - Update services_registry
-- ============================================================================

-- Update existing services with new fields
UPDATE services_registry 
SET 
  service_category = 'conversation',
  service_type = 'ai_agent',
  icon = 'MessageCircle'
WHERE service_name = 'ask_expert' AND service_category IS NULL;

UPDATE services_registry 
SET 
  service_category = 'conversation',
  service_type = 'ai_agent',
  icon = 'Users'
WHERE service_name = 'ask_panel' AND service_category IS NULL;

UPDATE services_registry 
SET 
  service_category = 'execution',
  service_type = 'workflow',
  icon = 'Workflow'
WHERE service_name = 'workflows' AND service_category IS NULL;

UPDATE services_registry 
SET 
  service_category = 'marketplace',
  service_type = 'integration',
  icon = 'Package'
WHERE service_name = 'solutions_marketplace' AND service_category IS NULL;

-- Insert services if they don't exist
INSERT INTO services_registry (service_name, service_slug, display_name, description, service_category, service_type, icon, config)
SELECT 'ask_expert', 'ask-expert', 'Ask Expert', '1:1 AI consultant conversations with specialized agents', 'conversation', 'ai_agent', 'MessageCircle',
  '{"max_concurrent_chats": 5, "default_model": "gpt-4", "enable_streaming": true, "supported_modes": [1, 2, 3, 4]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM services_registry WHERE service_name = 'ask_expert');

INSERT INTO services_registry (service_name, service_slug, display_name, description, service_category, service_type, icon, config)
SELECT 'ask_panel', 'ask-panel', 'Ask Panel', 'Multi-agent panel discussions with diverse expertise', 'conversation', 'ai_agent', 'Users',
  '{"max_panel_size": 8, "default_model": "gpt-4", "enable_streaming": true, "panel_types": ["structured", "open"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM services_registry WHERE service_name = 'ask_panel');

INSERT INTO services_registry (service_name, service_slug, display_name, description, service_category, service_type, icon, config)
SELECT 'workflows', 'workflows', 'Workflows', 'Automated multi-step AI-powered workflows', 'execution', 'workflow', 'Workflow',
  '{"supported_frameworks": ["langgraph", "autogen", "crewai"], "max_nodes": 50, "max_execution_time": 300}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM services_registry WHERE service_name = 'workflows');

INSERT INTO services_registry (service_name, service_slug, display_name, description, service_category, service_type, icon, config)
SELECT 'solutions_marketplace', 'solutions-marketplace', 'Solutions Marketplace', 'Pre-built solution packages for common use cases', 'marketplace', 'integration', 'Package',
  '{"enable_community_solutions": true, "enable_paid_solutions": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM services_registry WHERE service_name = 'solutions_marketplace');

-- ============================================================================
-- PART 9: SEED DATA - Create sample templates from existing prompts
-- ============================================================================

-- Migrate some existing prompts to template_library for testing
INSERT INTO template_library (
  source_table, source_id, template_name, template_slug, display_name, description,
  template_type, template_category, framework, is_builtin, is_public,
  content, variables, tags
)
SELECT 
  'prompts', 
  p.id,
  p.name,
  p.slug,
  COALESCE(p.title, p.name),
  p.description,
  'prompt',
  p.category,
  'generic',
  TRUE,
  TRUE,
  jsonb_build_object(
    'template', p.content,
    'system_prompt', p.system_prompt,
    'user_template', p.user_template,
    'role_type', p.role_type,
    'variables', p.variables
  ),
  to_jsonb(p.variables),
  p.tags
FROM prompts p
WHERE p.is_active = TRUE 
  AND p.expert_validated = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM template_library tl 
    WHERE tl.source_table = 'prompts' AND tl.source_id = p.id
  )
LIMIT 10; -- Migrate top 10 validated prompts as examples

-- ============================================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- ============================================================================

-- SELECT COUNT(*) as enhanced_services FROM services_registry WHERE service_category IS NOT NULL;
-- SELECT COUNT(*) as templates FROM template_library;
-- SELECT COUNT(*) as workflow_enhancements FROM workflow_library;
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('template_library', 'workflow_library', 'user_favorites', 'user_ratings');

