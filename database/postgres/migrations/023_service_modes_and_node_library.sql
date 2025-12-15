-- Migration: Service Modes, Templates, and Reusable Nodes
-- Description: Enhanced service architecture with modes, templates, and node library
-- Date: 2025-11-23
-- Depends on: 022_enhance_services_and_create_libraries.sql

-- ============================================================================
-- PART 1: SERVICE MODES TABLE
-- ============================================================================
-- Defines modes/configurations for each service
-- Ask Expert: 4 modes, Ask Panel: 6 modes, etc.

CREATE TABLE IF NOT EXISTS service_modes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Link to service
  service_id UUID NOT NULL REFERENCES services_registry(id) ON DELETE CASCADE,
  
  -- Mode Identity
  mode_name TEXT NOT NULL, -- 'mode_1', 'mode_2', 'expert_mode', 'panel_structured', etc.
  mode_code TEXT NOT NULL, -- Unique code for API/routing
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Mode Configuration
  mode_type TEXT, -- 'basic', 'advanced', 'expert', 'custom'
  mode_config JSONB DEFAULT '{}'::jsonb,
  -- Example config:
  -- {
  --   "max_agents": 3,
  --   "enable_tools": true,
  --   "require_approval": false,
  --   "default_model": "gpt-4",
  --   "panel_type": "structured",
  --   "voting_mechanism": "consensus"
  -- }
  
  -- UI Configuration
  ui_config JSONB DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "layout": "chat",
  --   "show_agent_avatars": true,
  --   "enable_streaming": true,
  --   "color_scheme": "blue"
  -- }
  
  -- Workflow Association
  workflow_template_id UUID, -- Optional: linked workflow template
  default_workflow_definition JSONB, -- Or embedded workflow definition
  
  -- Availability
  is_enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  requires_subscription BOOLEAN DEFAULT FALSE,
  minimum_tier TEXT, -- 'free', 'pro', 'enterprise'
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(service_id, mode_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_modes_service ON service_modes(service_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_modes_code ON service_modes(mode_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_service_modes_enabled ON service_modes(is_enabled) WHERE deleted_at IS NULL AND is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_modes_default ON service_modes(is_default) WHERE deleted_at IS NULL AND is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_modes_order ON service_modes(display_order);

COMMENT ON TABLE service_modes IS 'Service modes/configurations (e.g., Ask Expert modes 1-4, Ask Panel modes 1-6)';

-- ============================================================================
-- PART 2: SERVICE_MODE_TEMPLATES (Many-to-Many)
-- ============================================================================
-- Links templates to service modes

CREATE TABLE IF NOT EXISTS service_mode_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  service_mode_id UUID NOT NULL REFERENCES service_modes(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES template_library(id) ON DELETE CASCADE,
  
  -- Template Role in Mode
  template_role TEXT, -- 'system_prompt', 'user_prompt', 'agent_config', 'panel_config'
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Configuration Override
  config_override JSONB DEFAULT '{}'::jsonb, -- Mode-specific template customization
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(service_mode_id, template_id, template_role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_mode_templates_mode ON service_mode_templates(service_mode_id);
CREATE INDEX IF NOT EXISTS idx_service_mode_templates_template ON service_mode_templates(template_id);
CREATE INDEX IF NOT EXISTS idx_service_mode_templates_role ON service_mode_templates(template_role);
CREATE INDEX IF NOT EXISTS idx_service_mode_templates_default ON service_mode_templates(is_default) WHERE is_default = TRUE;

COMMENT ON TABLE service_mode_templates IS 'Many-to-many relationship between service modes and templates';

-- ============================================================================
-- PART 3: NODE LIBRARY (Reusable Workflow Steps)
-- ============================================================================
-- Library of reusable nodes/steps for workflow designer

CREATE TABLE IF NOT EXISTS node_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Node Identity
  node_name TEXT NOT NULL,
  node_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Node Type & Category
  node_type TEXT NOT NULL, -- 'start', 'end', 'agent', 'tool', 'condition', 'parallel', 'human', 'subgraph', 'orchestrator'
  node_category TEXT, -- 'control_flow', 'data_processing', 'ai_agents', 'integrations', 'decision_making'
  
  -- Node Definition
  node_config JSONB NOT NULL,
  -- Example for agent node:
  -- {
  --   "agent_type": "research_analyst",
  --   "default_prompt": "...",
  --   "tools": ["web_search", "document_parser"],
  --   "model": "gpt-4",
  --   "temperature": 0.7
  -- }
  
  -- Input/Output Schema
  input_schema JSONB, -- JSON Schema for node inputs
  output_schema JSONB, -- JSON Schema for node outputs
  input_ports JSONB, -- Input port definitions
  output_ports JSONB, -- Output port definitions
  
  -- Visual Configuration
  visual_config JSONB DEFAULT '{}'::jsonb,
  -- {
  --   "color": "#4F46E5",
  --   "width": 200,
  --   "height": 100,
  --   "icon_position": "left"
  -- }
  
  -- Documentation
  usage_instructions TEXT,
  example_usage JSONB,
  documentation_url TEXT,
  
  -- Requirements
  required_tools TEXT[], -- Tool slugs required
  required_services TEXT[], -- Service slugs required
  
  -- Framework Compatibility
  framework TEXT, -- 'langgraph', 'autogen', 'crewai', 'generic'
  compatible_frameworks TEXT[],
  
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
  parent_node_id UUID REFERENCES node_library(id), -- For forked nodes
  
  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_node_library_type ON node_library(node_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_node_library_category ON node_library(node_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_node_library_framework ON node_library(framework) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_node_library_enabled ON node_library(is_enabled) WHERE deleted_at IS NULL AND is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_node_library_public ON node_library(is_public) WHERE deleted_at IS NULL AND is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_node_library_builtin ON node_library(is_builtin) WHERE deleted_at IS NULL AND is_builtin = TRUE;
CREATE INDEX IF NOT EXISTS idx_node_library_featured ON node_library(is_featured) WHERE deleted_at IS NULL AND is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_node_library_creator ON node_library(created_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_node_library_tags ON node_library USING GIN(tags) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_node_library_usage ON node_library(usage_count DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_node_library_rating ON node_library(rating_average DESC NULLS LAST) WHERE deleted_at IS NULL;

COMMENT ON TABLE node_library IS 'Library of reusable workflow nodes/steps for the workflow designer';

-- ============================================================================
-- PART 4: WORKFLOW PUBLICATIONS TABLE
-- ============================================================================
-- Track workflows published to services

CREATE TABLE IF NOT EXISTS workflow_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Workflow
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Publication Target
  service_id UUID REFERENCES services_registry(id) ON DELETE CASCADE,
  service_mode_id UUID REFERENCES service_modes(id) ON DELETE CASCADE,
  
  -- Publication Details
  publication_type TEXT NOT NULL, -- 'service', 'mode', 'marketplace', 'library'
  publication_status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  
  -- Versioning
  published_version INTEGER DEFAULT 1,
  workflow_snapshot JSONB NOT NULL, -- Snapshot of workflow at publication time
  
  -- Publication Configuration
  publication_config JSONB DEFAULT '{}'::jsonb,
  -- {
  --   "enable_analytics": true,
  --   "allow_forking": true,
  --   "require_approval": false,
  --   "custom_branding": {...}
  -- }
  
  -- Metadata
  publish_notes TEXT,
  changelog TEXT,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  unpublished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(workflow_id, service_id, service_mode_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_publications_workflow ON workflow_publications(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_publications_service ON workflow_publications(service_id);
CREATE INDEX IF NOT EXISTS idx_workflow_publications_mode ON workflow_publications(service_mode_id);
CREATE INDEX IF NOT EXISTS idx_workflow_publications_status ON workflow_publications(publication_status);
CREATE INDEX IF NOT EXISTS idx_workflow_publications_type ON workflow_publications(publication_type);
CREATE INDEX IF NOT EXISTS idx_workflow_publications_published_at ON workflow_publications(published_at DESC);

COMMENT ON TABLE workflow_publications IS 'Tracks workflows published to services and modes';

-- ============================================================================
-- PART 5: NODE COLLECTIONS (Optional - for organizing nodes)
-- ============================================================================
-- Group related nodes together

CREATE TABLE IF NOT EXISTS node_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Collection Identity
  collection_name TEXT NOT NULL,
  collection_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Collection Type
  collection_type TEXT, -- 'starter_pack', 'industry_specific', 'advanced_tools', 'custom'
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  
  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS node_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  collection_id UUID NOT NULL REFERENCES node_collections(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES node_library(id) ON DELETE CASCADE,
  
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(collection_id, node_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_node_collections_public ON node_collections(is_public) WHERE deleted_at IS NULL AND is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_node_collections_featured ON node_collections(is_featured) WHERE deleted_at IS NULL AND is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_node_collection_items_collection ON node_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_node_collection_items_node ON node_collection_items(node_id);

COMMENT ON TABLE node_collections IS 'Collections/groups of related nodes';
COMMENT ON TABLE node_collection_items IS 'Items in node collections';

-- ============================================================================
-- PART 6: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE service_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_mode_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_collection_items ENABLE ROW LEVEL SECURITY;

-- Service Modes: Public read
DROP POLICY IF EXISTS service_modes_select_policy ON service_modes;
CREATE POLICY service_modes_select_policy ON service_modes
  FOR SELECT
  USING (is_enabled = TRUE OR deleted_at IS NULL);

-- Service Mode Templates: Follow mode visibility
DROP POLICY IF EXISTS service_mode_templates_select_policy ON service_mode_templates;
CREATE POLICY service_mode_templates_select_policy ON service_mode_templates
  FOR SELECT
  USING (
    service_mode_id IN (SELECT id FROM service_modes WHERE is_enabled = TRUE)
  );

-- Node Library: Public/builtin + user-owned
DROP POLICY IF EXISTS node_library_select_policy ON node_library;
CREATE POLICY node_library_select_policy ON node_library
  FOR SELECT
  USING (
    is_public = TRUE OR
    is_builtin = TRUE OR
    created_by = auth.uid() OR
    deleted_at IS NULL
  );

DROP POLICY IF EXISTS node_library_insert_policy ON node_library;
CREATE POLICY node_library_insert_policy ON node_library
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS node_library_update_policy ON node_library;
CREATE POLICY node_library_update_policy ON node_library
  FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS node_library_delete_policy ON node_library;
CREATE POLICY node_library_delete_policy ON node_library
  FOR DELETE
  USING (created_by = auth.uid());

-- Workflow Publications: User-owned
DROP POLICY IF EXISTS workflow_publications_select_policy ON workflow_publications;
CREATE POLICY workflow_publications_select_policy ON workflow_publications
  FOR SELECT
  USING (
    workflow_id IN (SELECT id FROM workflows WHERE created_by = auth.uid()) OR
    publication_status = 'published'
  );

DROP POLICY IF EXISTS workflow_publications_insert_policy ON workflow_publications;
CREATE POLICY workflow_publications_insert_policy ON workflow_publications
  FOR INSERT
  WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE created_by = auth.uid())
  );

-- Node Collections: Public + user-owned
DROP POLICY IF EXISTS node_collections_select_policy ON node_collections;
CREATE POLICY node_collections_select_policy ON node_collections
  FOR SELECT
  USING (
    is_public = TRUE OR
    created_by = auth.uid() OR
    deleted_at IS NULL
  );

DROP POLICY IF EXISTS node_collections_insert_policy ON node_collections;
CREATE POLICY node_collections_insert_policy ON node_collections
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- PART 7: TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS service_modes_updated_at ON service_modes;
CREATE TRIGGER service_modes_updated_at
  BEFORE UPDATE ON service_modes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS node_library_updated_at ON node_library;
CREATE TRIGGER node_library_updated_at
  BEFORE UPDATE ON node_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS workflow_publications_updated_at ON workflow_publications;
CREATE TRIGGER workflow_publications_updated_at
  BEFORE UPDATE ON workflow_publications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS node_collections_updated_at ON node_collections;
CREATE TRIGGER node_collections_updated_at
  BEFORE UPDATE ON node_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 8: SEED DATA - Service Modes
-- ============================================================================

-- Ask Expert - 4 Modes
INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order, is_default)
SELECT 
  s.id,
  'mode_1_ask_expert',
  'ae_mode_1',
  'Ask Expert Mode 1 - Direct Expert',
  'Direct conversation with a single expert agent',
  'basic',
  '{"max_agents": 1, "enable_tools": false, "conversation_style": "direct"}'::jsonb,
  1,
  TRUE
FROM services_registry s WHERE s.service_name = 'ask_expert'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_2_ask_expert',
  'ae_mode_2',
  'Ask Expert Mode 2 - Expert with Tools',
  'Expert with access to research and analysis tools',
  'advanced',
  '{"max_agents": 1, "enable_tools": true, "tools": ["web_search", "document_parser"]}'::jsonb,
  2
FROM services_registry s WHERE s.service_name = 'ask_expert'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_3_ask_expert',
  'ae_mode_3',
  'Ask Expert Mode 3 - Specialist Consultation',
  'Deep domain expertise with specialized knowledge',
  'expert',
  '{"max_agents": 1, "enable_tools": true, "enable_rag": true, "depth": "deep"}'::jsonb,
  3
FROM services_registry s WHERE s.service_name = 'ask_expert'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_4_ask_expert',
  'ae_mode_4',
  'Ask Expert Mode 4 - Research & Analysis',
  'Comprehensive research with citations and analysis',
  'expert',
  '{"max_agents": 1, "enable_tools": true, "enable_rag": true, "enable_citations": true, "output_format": "detailed_report"}'::jsonb,
  4
FROM services_registry s WHERE s.service_name = 'ask_expert'
ON CONFLICT DO NOTHING;

-- Ask Panel - 6 Modes
INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order, is_default)
SELECT 
  s.id,
  'mode_1_ask_panel',
  'ap_mode_1',
  'Ask Panel Mode 1 - Open Discussion',
  'Open panel discussion with multiple perspectives',
  'basic',
  '{"max_agents": 4, "panel_type": "open", "voting_enabled": false}'::jsonb,
  1,
  TRUE
FROM services_registry s WHERE s.service_name = 'ask_panel'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_2_ask_panel',
  'ap_mode_2',
  'Ask Panel Mode 2 - Structured Panel',
  'Structured panel with defined roles and order',
  'advanced',
  '{"max_agents": 6, "panel_type": "structured", "speaking_order": "sequential"}'::jsonb,
  2
FROM services_registry s WHERE s.service_name = 'ask_panel'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_3_ask_panel',
  'ap_mode_3',
  'Ask Panel Mode 3 - Consensus Building',
  'Panel discussion with consensus-driven decision making',
  'advanced',
  '{"max_agents": 5, "panel_type": "structured", "voting_enabled": true, "voting_mechanism": "consensus"}'::jsonb,
  3
FROM services_registry s WHERE s.service_name = 'ask_panel'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_4_ask_panel',
  'ap_mode_4',
  'Ask Panel Mode 4 - Debate Panel',
  'Adversarial panel with debate and counter-arguments',
  'expert',
  '{"max_agents": 6, "panel_type": "debate", "enable_rebuttals": true, "rounds": 3}'::jsonb,
  4
FROM services_registry s WHERE s.service_name = 'ask_panel'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_5_ask_panel',
  'ap_mode_5',
  'Ask Panel Mode 5 - Expert Review',
  'Expert review panel with detailed analysis',
  'expert',
  '{"max_agents": 8, "panel_type": "review", "enable_tools": true, "depth": "comprehensive"}'::jsonb,
  5
FROM services_registry s WHERE s.service_name = 'ask_panel'
ON CONFLICT DO NOTHING;

INSERT INTO service_modes (service_id, mode_name, mode_code, display_name, description, mode_type, mode_config, display_order)
SELECT 
  s.id,
  'mode_6_ask_panel',
  'ap_mode_6',
  'Ask Panel Mode 6 - Multi-Phase Analysis',
  'Multi-phase panel with discovery, analysis, and synthesis',
  'expert',
  '{"max_agents": 8, "panel_type": "multi_phase", "phases": ["discovery", "analysis", "synthesis"], "enable_tools": true}'::jsonb,
  6
FROM services_registry s WHERE s.service_name = 'ask_panel'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 9: SEED DATA - Built-in Nodes
-- ============================================================================

-- Control Flow Nodes
INSERT INTO node_library (node_name, node_slug, display_name, description, node_type, node_category, framework, is_builtin, node_config, input_ports, output_ports, visual_config)
VALUES
  ('start_node', 'start', 'Start', 'Workflow entry point', 'start', 'control_flow', 'generic', TRUE,
    '{"type": "start"}'::jsonb,
    '[]'::jsonb,
    '[{"id": "output", "label": "Next"}]'::jsonb,
    '{"color": "#10B981", "icon": "Play"}'::jsonb),
  
  ('end_node', 'end', 'End', 'Workflow completion point', 'end', 'control_flow', 'generic', TRUE,
    '{"type": "end"}'::jsonb,
    '[{"id": "input", "label": "Previous"}]'::jsonb,
    '[]'::jsonb,
    '{"color": "#EF4444", "icon": "Square"}'::jsonb),
  
  ('condition_node', 'condition', 'Condition', 'Branch based on conditions', 'condition', 'control_flow', 'generic', TRUE,
    '{"type": "condition", "operator": "equals"}'::jsonb,
    '[{"id": "input", "label": "Input"}]'::jsonb,
    '[{"id": "true", "label": "True"}, {"id": "false", "label": "False"}]'::jsonb,
    '{"color": "#F59E0B", "icon": "GitBranch"}'::jsonb)
ON CONFLICT (node_slug) DO NOTHING;

-- AI Agent Nodes
INSERT INTO node_library (node_name, node_slug, display_name, description, node_type, node_category, framework, is_builtin, node_config, input_ports, output_ports, visual_config, required_services)
VALUES
  ('agent_node', 'agent', 'AI Agent', 'Execute AI agent task', 'agent', 'ai_agents', 'langgraph', TRUE,
    '{"type": "agent", "model": "gpt-4", "temperature": 0.7}'::jsonb,
    '[{"id": "input", "label": "Input"}]'::jsonb,
    '[{"id": "output", "label": "Result"}]'::jsonb,
    '{"color": "#6366F1", "icon": "Bot"}'::jsonb,
    ARRAY['ask_expert']),
  
  ('orchestrator_node', 'orchestrator', 'Orchestrator', 'Coordinate multiple agents', 'orchestrator', 'ai_agents', 'langgraph', TRUE,
    '{"type": "orchestrator", "coordination_strategy": "sequential"}'::jsonb,
    '[{"id": "input", "label": "Task"}]'::jsonb,
    '[{"id": "output", "label": "Result"}]'::jsonb,
    '{"color": "#8B5CF6", "icon": "Network"}'::jsonb,
    ARRAY['ask_expert', 'ask_panel'])
ON CONFLICT (node_slug) DO NOTHING;

-- Tool Nodes
INSERT INTO node_library (node_name, node_slug, display_name, description, node_type, node_category, framework, is_builtin, node_config, input_ports, output_ports, visual_config, required_tools)
VALUES
  ('web_search_node', 'web-search', 'Web Search', 'Search the web for information', 'tool', 'integrations', 'generic', TRUE,
    '{"type": "tool", "tool_name": "web_search", "max_results": 10}'::jsonb,
    '[{"id": "query", "label": "Search Query"}]'::jsonb,
    '[{"id": "results", "label": "Search Results"}]'::jsonb,
    '{"color": "#3B82F6", "icon": "Search"}'::jsonb,
    ARRAY['web_search']),
  
  ('document_parser_node', 'document-parser', 'Document Parser', 'Parse and extract document content', 'tool', 'integrations', 'generic', TRUE,
    '{"type": "tool", "tool_name": "document_parser"}'::jsonb,
    '[{"id": "document_url", "label": "Document URL"}]'::jsonb,
    '[{"id": "text", "label": "Extracted Text"}]'::jsonb,
    '{"color": "#14B8A6", "icon": "FileText"}'::jsonb,
    ARRAY['document_parser'])
ON CONFLICT (node_slug) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (commented out)
-- ============================================================================

-- SELECT COUNT(*) FROM service_modes;
-- SELECT COUNT(*) FROM node_library WHERE is_builtin = TRUE;
-- SELECT s.service_name, COUNT(sm.id) as mode_count 
-- FROM services_registry s 
-- LEFT JOIN service_modes sm ON s.id = sm.service_id 
-- GROUP BY s.service_name;

