-- ============================================================================
-- VITAL Platform - Ask Expert & Panel Normalized Schema
-- Migration: 20251213000001
-- Date: December 13, 2025
-- Description: Fully normalized schema for Ask Expert and Ask Panel services
-- ============================================================================

-- ============================================================================
-- PART 1: FEEDBACK TABLE (General feedback collection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback classification
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('general', 'feature_request', 'bug_report', 'improvement', 'praise')),
  category TEXT CHECK (category IN ('ui_ux', 'performance', 'functionality', 'documentation', 'support', 'other')),

  -- Content
  subject TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),

  -- Context (what the user was doing when they gave feedback)
  source_page TEXT,
  source_action TEXT,
  session_id TEXT,

  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'addressed', 'closed', 'wont_fix')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Response
  response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,

  -- Metadata (only for truly unstructured data)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_tenant ON feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

-- RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_feedback ON feedback;
CREATE POLICY tenant_isolation_feedback ON feedback
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);


-- ============================================================================
-- PART 2: MISSION_CHECKPOINTS TABLE (HITL approval points)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mission_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,

  -- Checkpoint identification
  step_number INTEGER NOT NULL,
  checkpoint_key TEXT NOT NULL, -- Unique identifier within mission
  checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN ('approval', 'review', 'decision', 'confirmation', 'escalation')),

  -- Question/prompt for user
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  instructions TEXT,

  -- Response tracking
  user_response TEXT,
  selected_option_id UUID, -- FK to mission_checkpoint_options
  approved BOOLEAN,
  confidence_score NUMERIC(3,2),

  -- User interaction
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  response_time_ms INTEGER,

  -- Auto-approval settings
  auto_approve_threshold NUMERIC(3,2),
  was_auto_approved BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'waiting', 'approved', 'rejected', 'skipped', 'timeout')),
  timeout_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint
  CONSTRAINT unique_mission_checkpoint UNIQUE (mission_id, checkpoint_key)
);

-- Junction table for checkpoint options (normalized from JSONB)
CREATE TABLE IF NOT EXISTS mission_checkpoint_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_id UUID NOT NULL REFERENCES mission_checkpoints(id) ON DELETE CASCADE,

  option_key TEXT NOT NULL,
  option_label TEXT NOT NULL,
  option_description TEXT,
  display_order INTEGER DEFAULT 0,
  is_recommended BOOLEAN DEFAULT FALSE,

  -- What happens if selected
  action_type TEXT CHECK (action_type IN ('continue', 'modify', 'skip', 'abort', 'escalate')),
  action_params JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_checkpoint_option UNIQUE (checkpoint_id, option_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_mission ON mission_checkpoints(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_status ON mission_checkpoints(status);
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_type ON mission_checkpoints(checkpoint_type);
CREATE INDEX IF NOT EXISTS idx_checkpoint_options_checkpoint ON mission_checkpoint_options(checkpoint_id);

-- RLS (checkpoints inherit mission's tenant)
ALTER TABLE mission_checkpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mission_checkpoints_access ON mission_checkpoints;
CREATE POLICY mission_checkpoints_access ON mission_checkpoints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = mission_checkpoints.mission_id
      AND m.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );

ALTER TABLE mission_checkpoint_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS checkpoint_options_access ON mission_checkpoint_options;
CREATE POLICY checkpoint_options_access ON mission_checkpoint_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM mission_checkpoints mc
      JOIN missions m ON m.id = mc.mission_id
      WHERE mc.id = mission_checkpoint_options.checkpoint_id
      AND m.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );


-- ============================================================================
-- PART 3: MISSION_ARTIFACTS TABLE (Outputs and deliverables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mission_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,

  -- Artifact identification
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('document', 'report', 'data', 'visualization', 'code', 'summary', 'analysis', 'recommendation')),
  artifact_format TEXT CHECK (artifact_format IN ('markdown', 'html', 'pdf', 'json', 'csv', 'xlsx', 'png', 'svg')),

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- For text-based artifacts

  -- File storage (for binary artifacts)
  file_url TEXT,
  file_path TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  checksum TEXT, -- For integrity verification

  -- Generation context
  step_generated INTEGER,
  generated_by_agent UUID REFERENCES agents(id),
  generation_prompt TEXT,
  generation_time_ms INTEGER,
  tokens_used INTEGER,

  -- Quality
  quality_score NUMERIC(3,2),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Status
  status TEXT DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'reviewed', 'approved', 'archived', 'deleted')),

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_artifact_id UUID REFERENCES mission_artifacts(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mission_artifacts_mission ON mission_artifacts(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_artifacts_type ON mission_artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_mission_artifacts_agent ON mission_artifacts(generated_by_agent);
CREATE INDEX IF NOT EXISTS idx_mission_artifacts_status ON mission_artifacts(status);

-- RLS
ALTER TABLE mission_artifacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mission_artifacts_access ON mission_artifacts;
CREATE POLICY mission_artifacts_access ON mission_artifacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = mission_artifacts.mission_id
      AND m.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );


-- ============================================================================
-- PART 4: CONVERSATION_MESSAGES TABLE (Individual messages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Optional links to specific sessions
  consultation_id UUID REFERENCES expert_consultations(id) ON DELETE SET NULL,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  panel_discussion_id UUID REFERENCES panel_discussions(id) ON DELETE SET NULL,

  -- Message core
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool', 'function')),
  content TEXT NOT NULL,

  -- For assistant messages
  agent_id UUID REFERENCES agents(id),
  model_used TEXT,

  -- Tool usage (normalized)
  has_tool_calls BOOLEAN DEFAULT FALSE,
  has_tool_results BOOLEAN DEFAULT FALSE,

  -- RAG context
  has_retrieved_documents BOOLEAN DEFAULT FALSE,

  -- Performance metrics
  response_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd NUMERIC(10,6),

  -- Quality
  confidence_score NUMERIC(3,2),

  -- User feedback on this specific message
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  was_helpful BOOLEAN,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for tool calls (normalized from JSONB)
CREATE TABLE IF NOT EXISTS message_tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,

  tool_name TEXT NOT NULL,
  tool_call_id TEXT, -- OpenAI-style call ID
  arguments JSONB DEFAULT '{}',

  -- Result
  result TEXT,
  result_type TEXT CHECK (result_type IN ('success', 'error', 'timeout', 'cancelled')),
  execution_time_ms INTEGER,

  call_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for retrieved documents (normalized from JSONB)
CREATE TABLE IF NOT EXISTS message_retrieved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,

  document_id UUID, -- FK to knowledge base if applicable
  document_title TEXT,
  document_url TEXT,
  chunk_text TEXT,

  relevance_score NUMERIC(5,4),
  retrieval_rank INTEGER,

  source_type TEXT CHECK (source_type IN ('rag', 'web', 'database', 'file', 'api')),
  namespace TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for citations/sources (normalized from JSONB)
CREATE TABLE IF NOT EXISTS message_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,

  source_type TEXT CHECK (source_type IN ('publication', 'website', 'database', 'document', 'expert', 'regulatory')),
  title TEXT NOT NULL,
  url TEXT,
  citation TEXT,
  authors TEXT,
  publication_date DATE,
  doi TEXT,

  confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
  evidence_level TEXT CHECK (evidence_level IN ('1a', '1b', '2a', '2b', '3', '4', '5')),

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_consultation ON conversation_messages(consultation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_mission ON conversation_messages(mission_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(role);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created ON conversation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_tool_calls_message ON message_tool_calls(message_id);
CREATE INDEX IF NOT EXISTS idx_message_retrieved_docs_message ON message_retrieved_documents(message_id);
CREATE INDEX IF NOT EXISTS idx_message_sources_message ON message_sources(message_id);

-- RLS
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS conversation_messages_access ON conversation_messages;
CREATE POLICY conversation_messages_access ON conversation_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

ALTER TABLE message_tool_calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_tool_calls_access ON message_tool_calls;
CREATE POLICY message_tool_calls_access ON message_tool_calls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversation_messages cm
      JOIN conversations c ON c.id = cm.conversation_id
      WHERE cm.id = message_tool_calls.message_id
      AND c.user_id = auth.uid()
    )
  );

ALTER TABLE message_retrieved_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_retrieved_docs_access ON message_retrieved_documents;
CREATE POLICY message_retrieved_docs_access ON message_retrieved_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversation_messages cm
      JOIN conversations c ON c.id = cm.conversation_id
      WHERE cm.id = message_retrieved_documents.message_id
      AND c.user_id = auth.uid()
    )
  );

ALTER TABLE message_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_sources_access ON message_sources;
CREATE POLICY message_sources_access ON message_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversation_messages cm
      JOIN conversations c ON c.id = cm.conversation_id
      WHERE cm.id = message_sources.message_id
      AND c.user_id = auth.uid()
    )
  );


-- ============================================================================
-- PART 5: USER_PANELS TABLE (Custom panels - FULLY NORMALIZED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

  -- Panel identity
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,

  -- Classification
  category TEXT DEFAULT 'personal' CHECK (category IN ('industry_specific', 'cross_functional', 'personal', 'shared', 'template')),
  base_panel_slug TEXT REFERENCES panels(slug),

  -- Execution mode
  mode TEXT DEFAULT 'sequential' CHECK (mode IN ('sequential', 'parallel', 'debate', 'voting', 'custom')),
  framework TEXT DEFAULT 'langgraph' CHECK (framework IN ('langgraph', 'react_flow', 'custom')),

  -- Panel settings (normalized - key settings as columns)
  max_rounds INTEGER DEFAULT 3,
  allow_debate BOOLEAN DEFAULT FALSE,
  require_consensus BOOLEAN DEFAULT TRUE,
  user_guidance_level TEXT DEFAULT 'medium' CHECK (user_guidance_level IN ('minimal', 'low', 'medium', 'high', 'full')),
  timeout_minutes INTEGER DEFAULT 30,

  -- Visibility
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,

  -- Metadata (only for truly unstructured/experimental data)
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT unique_user_panel_name UNIQUE (user_id, name)
);

-- Junction table: Panel Agents (replaces selected_agents UUID[] and agent_roles JSONB)
CREATE TABLE IF NOT EXISTS user_panel_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES user_panels(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  -- Role in panel
  role TEXT NOT NULL CHECK (role IN ('moderator', 'expert', 'reviewer', 'observer', 'facilitator', 'challenger')),
  speaking_order INTEGER DEFAULT 0,

  -- Agent-specific settings
  is_required BOOLEAN DEFAULT TRUE,
  weight NUMERIC(3,2) DEFAULT 1.0, -- For voting/consensus
  max_response_tokens INTEGER,
  temperature_override NUMERIC(3,2),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_panel_agent UNIQUE (panel_id, agent_id)
);

-- Junction table: Panel Tags (replaces tags TEXT[])
CREATE TABLE IF NOT EXISTS user_panel_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES user_panels(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_panel_tag UNIQUE (panel_id, tag)
);

-- Workflow Definition (replaces workflow_definition JSONB - fully normalized)
CREATE TABLE IF NOT EXISTS user_panel_workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES user_panels(id) ON DELETE CASCADE,

  -- Node identification
  node_key TEXT NOT NULL, -- e.g., "start", "expert-1", "end"
  node_type TEXT NOT NULL CHECK (node_type IN ('start', 'end', 'expert', 'router', 'aggregator', 'condition', 'human_input', 'tool')),

  -- Position (for React Flow rendering)
  position_x NUMERIC(10,2) DEFAULT 0,
  position_y NUMERIC(10,2) DEFAULT 0,

  -- Node data
  label TEXT,
  agent_id UUID REFERENCES agents(id), -- For expert nodes

  -- Node settings
  settings JSONB DEFAULT '{}', -- Only for node-specific config that varies widely

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_panel_node UNIQUE (panel_id, node_key)
);

CREATE TABLE IF NOT EXISTS user_panel_workflow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES user_panels(id) ON DELETE CASCADE,

  -- Edge definition
  edge_key TEXT NOT NULL, -- e.g., "e1", "start-to-expert"
  source_node_key TEXT NOT NULL,
  target_node_key TEXT NOT NULL,

  -- Edge type
  edge_type TEXT DEFAULT 'default' CHECK (edge_type IN ('default', 'conditional', 'loop', 'error')),

  -- Condition (for conditional edges)
  condition_expression TEXT,
  condition_label TEXT,

  -- Styling
  animated BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_panel_edge UNIQUE (panel_id, edge_key)
);

-- Panel viewport settings (replaces viewport in workflow_definition JSONB)
CREATE TABLE IF NOT EXISTS user_panel_viewport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES user_panels(id) ON DELETE CASCADE,

  viewport_x NUMERIC(10,2) DEFAULT 0,
  viewport_y NUMERIC(10,2) DEFAULT 0,
  zoom NUMERIC(5,2) DEFAULT 1.0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_panel_viewport UNIQUE (panel_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_panels_user ON user_panels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_tenant ON user_panels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_panels_category ON user_panels(category);
CREATE INDEX IF NOT EXISTS idx_user_panels_public ON user_panels(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_panels_template ON user_panels(is_template) WHERE is_template = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_panel_agents_panel ON user_panel_agents(panel_id);
CREATE INDEX IF NOT EXISTS idx_user_panel_agents_agent ON user_panel_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_panel_tags_panel ON user_panel_tags(panel_id);
CREATE INDEX IF NOT EXISTS idx_user_panel_tags_tag ON user_panel_tags(tag);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_panel ON user_panel_workflow_nodes(panel_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_panel ON user_panel_workflow_edges(panel_id);

-- RLS
ALTER TABLE user_panels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_own_panels ON user_panels;
CREATE POLICY user_own_panels ON user_panels
  FOR ALL USING (user_id = auth.uid() OR is_public = TRUE);

ALTER TABLE user_panel_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_panel_agents_access ON user_panel_agents;
CREATE POLICY user_panel_agents_access ON user_panel_agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_panels up
      WHERE up.id = user_panel_agents.panel_id
      AND (up.user_id = auth.uid() OR up.is_public = TRUE)
    )
  );

ALTER TABLE user_panel_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_panel_tags_access ON user_panel_tags;
CREATE POLICY user_panel_tags_access ON user_panel_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_panels up
      WHERE up.id = user_panel_tags.panel_id
      AND (up.user_id = auth.uid() OR up.is_public = TRUE)
    )
  );

ALTER TABLE user_panel_workflow_nodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_nodes_access ON user_panel_workflow_nodes;
CREATE POLICY workflow_nodes_access ON user_panel_workflow_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_panels up
      WHERE up.id = user_panel_workflow_nodes.panel_id
      AND (up.user_id = auth.uid() OR up.is_public = TRUE)
    )
  );

ALTER TABLE user_panel_workflow_edges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_edges_access ON user_panel_workflow_edges;
CREATE POLICY workflow_edges_access ON user_panel_workflow_edges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_panels up
      WHERE up.id = user_panel_workflow_edges.panel_id
      AND (up.user_id = auth.uid() OR up.is_public = TRUE)
    )
  );

ALTER TABLE user_panel_viewport ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS viewport_access ON user_panel_viewport;
CREATE POLICY viewport_access ON user_panel_viewport
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_panels up
      WHERE up.id = user_panel_viewport.panel_id
      AND (up.user_id = auth.uid() OR up.is_public = TRUE)
    )
  );


-- ============================================================================
-- PART 6: PANEL_RESPONSE_TEMPLATES TABLE (FULLY NORMALIZED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS panel_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Template identity
  template_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Classification
  expert_category TEXT NOT NULL CHECK (expert_category IN ('regulatory', 'clinical', 'market_access', 'heor', 'commercial', 'medical_affairs', 'pharmacovigilance', 'manufacturing', 'general')),

  -- Template content
  response_template TEXT NOT NULL,

  -- Output format settings
  output_format TEXT DEFAULT 'markdown' CHECK (output_format IN ('markdown', 'json', 'structured', 'html', 'plain')),
  max_tokens INTEGER DEFAULT 2000,

  -- Quality requirements
  confidence_threshold NUMERIC(3,2) DEFAULT 0.70 CHECK (confidence_threshold BETWEEN 0 AND 1),
  evidence_level_required TEXT DEFAULT 'medium' CHECK (evidence_level_required IN ('high', 'medium', 'low', 'any')),

  -- Citation settings
  include_citations BOOLEAN DEFAULT TRUE,
  citation_style TEXT DEFAULT 'vancouver' CHECK (citation_style IN ('apa', 'chicago', 'vancouver', 'harvard', 'ieee', 'none')),
  min_citations INTEGER DEFAULT 0,

  -- Tone and language
  tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'academic', 'conversational', 'technical', 'executive')),
  language TEXT DEFAULT 'en',

  -- Status
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  average_quality_score NUMERIC(3,2) DEFAULT 0.00,
  total_quality_ratings INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_template_key_per_tenant UNIQUE (tenant_id, template_key)
);

-- Junction table: Required Fields (replaces required_fields TEXT[])
CREATE TABLE IF NOT EXISTS template_required_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES panel_response_templates(id) ON DELETE CASCADE,

  field_name TEXT NOT NULL,
  field_label TEXT,
  field_description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_template_field UNIQUE (template_id, field_name)
);

-- Junction table: Template Sections (for structured templates)
CREATE TABLE IF NOT EXISTS template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES panel_response_templates(id) ON DELETE CASCADE,

  section_key TEXT NOT NULL,
  section_title TEXT NOT NULL,
  section_prompt TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  min_words INTEGER,
  max_words INTEGER,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_template_section UNIQUE (template_id, section_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_response_templates_tenant ON panel_response_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_response_templates_category ON panel_response_templates(expert_category);
CREATE INDEX IF NOT EXISTS idx_response_templates_key ON panel_response_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_response_templates_active ON panel_response_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_required_fields_template ON template_required_fields(template_id);
CREATE INDEX IF NOT EXISTS idx_template_sections_template ON template_sections(template_id);

-- RLS
ALTER TABLE panel_response_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_templates ON panel_response_templates;
CREATE POLICY tenant_isolation_templates ON panel_response_templates
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE template_required_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS template_fields_access ON template_required_fields;
CREATE POLICY template_fields_access ON template_required_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM panel_response_templates prt
      WHERE prt.id = template_required_fields.template_id
      AND prt.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );

ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS template_sections_access ON template_sections;
CREATE POLICY template_sections_access ON template_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM panel_response_templates prt
      WHERE prt.id = template_sections.template_id
      AND prt.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );


-- ============================================================================
-- PART 7: USEFUL VIEWS
-- ============================================================================

-- View: Complete user panel with agents
CREATE OR REPLACE VIEW v_user_panel_complete AS
SELECT
  up.id,
  up.user_id,
  up.tenant_id,
  up.name,
  up.slug,
  up.description,
  up.category,
  up.mode,
  up.framework,
  up.max_rounds,
  up.allow_debate,
  up.require_consensus,
  up.is_template,
  up.is_public,
  up.version,
  up.usage_count,
  up.average_rating,
  up.created_at,
  up.updated_at,
  -- Aggregated agents
  COALESCE(
    (SELECT json_agg(json_build_object(
      'agent_id', upa.agent_id,
      'role', upa.role,
      'speaking_order', upa.speaking_order,
      'is_required', upa.is_required,
      'agent_name', a.name,
      'agent_slug', a.slug
    ) ORDER BY upa.speaking_order)
    FROM user_panel_agents upa
    JOIN agents a ON a.id = upa.agent_id
    WHERE upa.panel_id = up.id AND upa.is_active = TRUE),
    '[]'::json
  ) AS agents,
  -- Aggregated tags
  COALESCE(
    (SELECT array_agg(upt.tag ORDER BY upt.tag)
    FROM user_panel_tags upt
    WHERE upt.panel_id = up.id),
    ARRAY[]::text[]
  ) AS tags,
  -- Workflow summary
  (SELECT count(*) FROM user_panel_workflow_nodes WHERE panel_id = up.id) AS node_count,
  (SELECT count(*) FROM user_panel_workflow_edges WHERE panel_id = up.id) AS edge_count
FROM user_panels up
WHERE up.deleted_at IS NULL;

-- View: Conversation with messages count
CREATE OR REPLACE VIEW v_conversation_summary AS
SELECT
  c.id,
  c.session_id,
  c.user_id,
  c.title,
  c.created_at,
  c.updated_at,
  (SELECT count(*) FROM conversation_messages cm WHERE cm.conversation_id = c.id) AS message_count,
  (SELECT max(cm.created_at) FROM conversation_messages cm WHERE cm.conversation_id = c.id) AS last_message_at,
  (SELECT sum(cm.total_tokens) FROM conversation_messages cm WHERE cm.conversation_id = c.id) AS total_tokens
FROM conversations c;

-- View: Mission with checkpoints and artifacts count
CREATE OR REPLACE VIEW v_mission_summary AS
SELECT
  m.id,
  m.tenant_id,
  m.user_id,
  m.expert_id,
  m.title,
  m.goal,
  m.mode,
  m.status,
  m.budget_limit,
  m.budget_spent,
  m.created_at,
  m.completed_at,
  (SELECT count(*) FROM mission_checkpoints mc WHERE mc.mission_id = m.id) AS checkpoint_count,
  (SELECT count(*) FROM mission_checkpoints mc WHERE mc.mission_id = m.id AND mc.status = 'approved') AS approved_checkpoints,
  (SELECT count(*) FROM mission_artifacts ma WHERE ma.mission_id = m.id) AS artifact_count,
  (SELECT count(*) FROM mission_artifacts ma WHERE ma.mission_id = m.id AND ma.status = 'approved') AS approved_artifacts
FROM missions m;


-- ============================================================================
-- PART 8: TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mission_checkpoints_updated_at ON mission_checkpoints;
CREATE TRIGGER update_mission_checkpoints_updated_at
  BEFORE UPDATE ON mission_checkpoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mission_artifacts_updated_at ON mission_artifacts;
CREATE TRIGGER update_mission_artifacts_updated_at
  BEFORE UPDATE ON mission_artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_panels_updated_at ON user_panels;
CREATE TRIGGER update_user_panels_updated_at
  BEFORE UPDATE ON user_panels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_panel_agents_updated_at ON user_panel_agents;
CREATE TRIGGER update_user_panel_agents_updated_at
  BEFORE UPDATE ON user_panel_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_panel_response_templates_updated_at ON panel_response_templates;
CREATE TRIGGER update_panel_response_templates_updated_at
  BEFORE UPDATE ON panel_response_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- PART 9: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE feedback IS 'General feedback collection for the VITAL platform';
COMMENT ON TABLE mission_checkpoints IS 'HITL approval checkpoints for Mode 3/4 missions';
COMMENT ON TABLE mission_checkpoint_options IS 'Available options for mission checkpoints (normalized from JSONB)';
COMMENT ON TABLE mission_artifacts IS 'Outputs and deliverables generated by missions';
COMMENT ON TABLE conversation_messages IS 'Individual messages within conversations';
COMMENT ON TABLE message_tool_calls IS 'Tool calls made during message generation (normalized from JSONB)';
COMMENT ON TABLE message_retrieved_documents IS 'Documents retrieved via RAG for messages (normalized from JSONB)';
COMMENT ON TABLE message_sources IS 'Citations and sources used in messages (normalized from JSONB)';
COMMENT ON TABLE user_panels IS 'Custom panels created by users via Workflow Designer';
COMMENT ON TABLE user_panel_agents IS 'Agents assigned to user panels (normalized from UUID[] and JSONB)';
COMMENT ON TABLE user_panel_tags IS 'Tags for user panels (normalized from TEXT[])';
COMMENT ON TABLE user_panel_workflow_nodes IS 'Workflow nodes for custom panels (normalized from JSONB)';
COMMENT ON TABLE user_panel_workflow_edges IS 'Workflow edges for custom panels (normalized from JSONB)';
COMMENT ON TABLE user_panel_viewport IS 'Viewport settings for workflow visualization';
COMMENT ON TABLE panel_response_templates IS 'Expert response templates for Ask Panel workflows';
COMMENT ON TABLE template_required_fields IS 'Required fields for response templates (normalized from TEXT[])';
COMMENT ON TABLE template_sections IS 'Structured sections for response templates';


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
