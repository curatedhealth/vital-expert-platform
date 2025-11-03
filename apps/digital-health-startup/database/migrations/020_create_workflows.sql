-- Migration: Create Workflow Designer Tables
-- Description: Database schema for Visual Workflow Designer
-- Date: 2025-11-03

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WORKFLOWS TABLE
-- ============================================================================
-- Stores workflow definitions with nodes, edges, and configuration
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  
  -- Workflow metadata
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT NOT NULL DEFAULT 'langgraph', -- 'langgraph', 'autogen', 'crewai'
  
  -- Workflow definition (nodes, edges, config)
  workflow_definition JSONB NOT NULL,
  
  -- Organization
  tags TEXT[],
  is_template BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Metrics
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX idx_workflows_framework ON workflows(framework);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX idx_workflows_is_template ON workflows(is_template) WHERE is_template = TRUE;
CREATE INDEX idx_workflows_is_public ON workflows(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);

-- ============================================================================
-- WORKFLOW VERSIONS TABLE
-- ============================================================================
-- Version control for workflows
CREATE TABLE IF NOT EXISTS workflow_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Version info
  version INTEGER NOT NULL,
  workflow_definition JSONB NOT NULL,
  commit_message TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique versions per workflow
  UNIQUE(workflow_id, version)
);

CREATE INDEX idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX idx_workflow_versions_created_at ON workflow_versions(created_at DESC);

-- ============================================================================
-- WORKFLOW SHARING TABLE
-- ============================================================================
-- Share workflows with other users or teams
CREATE TABLE IF NOT EXISTS workflow_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Who has access
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_team_id UUID, -- For future team support
  
  -- Permission level
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit', 'admin')),
  
  -- Metadata
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique shares
  UNIQUE(workflow_id, shared_with_user_id)
);

CREATE INDEX idx_workflow_shares_workflow_id ON workflow_shares(workflow_id);
CREATE INDEX idx_workflow_shares_user_id ON workflow_shares(shared_with_user_id);

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================================================
-- Track workflow execution history
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  workflow_version_id UUID REFERENCES workflow_versions(id),
  
  -- Execution details
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  inputs JSONB,
  outputs JSONB,
  error_message TEXT,
  
  -- Execution state snapshots
  execution_state JSONB, -- Node states, checkpoints, etc.
  
  -- Metrics
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  
  -- User context
  executed_by UUID REFERENCES auth.users(id),
  tenant_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_user_id ON workflow_executions(executed_by);
CREATE INDEX idx_workflow_executions_started_at ON workflow_executions(started_at DESC);

-- ============================================================================
-- WORKFLOW AUDIT LOG TABLE
-- ============================================================================
-- Audit trail for all workflow operations
CREATE TABLE IF NOT EXISTS workflow_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Action details
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'execute', 'share', 'unshare'
  changes JSONB, -- What changed (diff)
  metadata JSONB, -- Additional context
  
  -- User context
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_audit_log_workflow_id ON workflow_audit_log(workflow_id);
CREATE INDEX idx_workflow_audit_log_user_id ON workflow_audit_log(user_id);
CREATE INDEX idx_workflow_audit_log_action ON workflow_audit_log(action);
CREATE INDEX idx_workflow_audit_log_created_at ON workflow_audit_log(created_at DESC);

-- ============================================================================
-- AGENT TEMPLATES TABLE
-- ============================================================================
-- Pre-built agent configurations
CREATE TABLE IF NOT EXISTS agent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'research', 'writing', 'coding', 'analysis', etc.
  
  -- Agent configuration
  config JSONB NOT NULL, -- system_prompt, model, temperature, tools, etc.
  
  -- Template source
  is_builtin BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_templates_category ON agent_templates(category);
CREATE INDEX idx_agent_templates_builtin ON agent_templates(is_builtin) WHERE is_builtin = TRUE;
CREATE INDEX idx_agent_templates_usage ON agent_templates(usage_count DESC);

-- ============================================================================
-- WORKFLOW TEMPLATES TABLE
-- ============================================================================
-- Pre-built workflow configurations
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'customer_support', 'content_creation', 'data_analysis', etc.
  framework TEXT NOT NULL DEFAULT 'langgraph',
  
  -- Template definition
  workflow_definition JSONB NOT NULL,
  
  -- Template source
  is_builtin BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  
  -- Tags for search
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_framework ON workflow_templates(framework);
CREATE INDEX idx_workflow_templates_builtin ON workflow_templates(is_builtin) WHERE is_builtin = TRUE;
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING GIN(tags);
CREATE INDEX idx_workflow_templates_usage ON workflow_templates(usage_count DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- Workflows: Users can see their own workflows and shared workflows
CREATE POLICY workflows_select_policy ON workflows
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_public = TRUE OR
    id IN (SELECT workflow_id FROM workflow_shares WHERE shared_with_user_id = auth.uid())
  );

CREATE POLICY workflows_insert_policy ON workflows
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY workflows_update_policy ON workflows
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    id IN (SELECT workflow_id FROM workflow_shares WHERE shared_with_user_id = auth.uid() AND permission IN ('edit', 'admin'))
  );

CREATE POLICY workflows_delete_policy ON workflows
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    id IN (SELECT workflow_id FROM workflow_shares WHERE shared_with_user_id = auth.uid() AND permission = 'admin')
  );

-- Workflow Versions: Inherit permissions from parent workflow
CREATE POLICY workflow_versions_select_policy ON workflow_versions
  FOR SELECT
  USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid() OR is_public = TRUE)
  );

CREATE POLICY workflow_versions_insert_policy ON workflow_versions
  FOR INSERT
  WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

-- Workflow Shares: Users can see shares for their workflows or shares targeting them
CREATE POLICY workflow_shares_select_policy ON workflow_shares
  FOR SELECT
  USING (
    shared_with_user_id = auth.uid() OR
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY workflow_shares_insert_policy ON workflow_shares
  FOR INSERT
  WITH CHECK (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

CREATE POLICY workflow_shares_delete_policy ON workflow_shares
  FOR DELETE
  USING (
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

-- Workflow Executions: Users can see their own executions
CREATE POLICY workflow_executions_select_policy ON workflow_executions
  FOR SELECT
  USING (executed_by = auth.uid());

CREATE POLICY workflow_executions_insert_policy ON workflow_executions
  FOR INSERT
  WITH CHECK (executed_by = auth.uid());

-- Workflow Audit Log: Users can see audit logs for their workflows
CREATE POLICY workflow_audit_log_select_policy ON workflow_audit_log
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    workflow_id IN (SELECT id FROM workflows WHERE user_id = auth.uid())
  );

-- Agent Templates: Users can see builtin templates and their own
CREATE POLICY agent_templates_select_policy ON agent_templates
  FOR SELECT
  USING (is_builtin = TRUE OR created_by = auth.uid());

CREATE POLICY agent_templates_insert_policy ON agent_templates
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Workflow Templates: Users can see builtin templates and their own
CREATE POLICY workflow_templates_select_policy ON workflow_templates
  FOR SELECT
  USING (is_builtin = TRUE OR created_by = auth.uid());

CREATE POLICY workflow_templates_insert_policy ON workflow_templates
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workflows
CREATE TRIGGER workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for agent_templates
CREATE TRIGGER agent_templates_updated_at
  BEFORE UPDATE ON agent_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for workflow_templates
CREATE TRIGGER workflow_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create first version on workflow creation
CREATE OR REPLACE FUNCTION create_workflow_initial_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workflow_versions (workflow_id, version, workflow_definition, created_by, commit_message)
  VALUES (NEW.id, 1, NEW.workflow_definition, NEW.user_id, 'Initial version');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_initial_version
  AFTER INSERT ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION create_workflow_initial_version();

-- Function to audit workflow changes
CREATE OR REPLACE FUNCTION audit_workflow_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO workflow_audit_log (workflow_id, action, changes, user_id)
    VALUES (NEW.id, 'create', jsonb_build_object('workflow', row_to_json(NEW)), NEW.user_id);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO workflow_audit_log (workflow_id, action, changes, user_id)
    VALUES (NEW.id, 'update', jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)), NEW.user_id);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO workflow_audit_log (workflow_id, action, changes, user_id)
    VALUES (OLD.id, 'delete', jsonb_build_object('workflow', row_to_json(OLD)), OLD.user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_audit
  AFTER INSERT OR UPDATE OR DELETE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION audit_workflow_changes();

-- ============================================================================
-- SEED DATA: Built-in Agent Templates
-- ============================================================================

INSERT INTO agent_templates (id, name, description, category, config, is_builtin) VALUES
  (uuid_generate_v4(), 'Research Analyst', 'Expert at market research, competitive analysis, and trend identification', 'research', 
    '{"systemPrompt": "You are an expert research analyst with deep knowledge of market dynamics, competitive analysis, and trend forecasting. Provide comprehensive, data-driven insights.", "model": "gpt-4", "temperature": 0.7, "tools": ["web_search", "document_parser"]}', TRUE),
  
  (uuid_generate_v4(), 'Technical Writer', 'Creates clear, comprehensive technical documentation and API guides', 'writing',
    '{"systemPrompt": "You are an expert technical writer who creates clear, comprehensive documentation. Focus on clarity, accuracy, and user-friendliness.", "model": "gpt-4", "temperature": 0.3, "tools": ["code_analyzer", "documentation_generator"]}', TRUE),
  
  (uuid_generate_v4(), 'Data Analyst', 'Analyzes data, creates visualizations, and provides statistical insights', 'analysis',
    '{"systemPrompt": "You are an expert data analyst skilled in statistical analysis, data visualization, and deriving actionable insights from complex datasets.", "model": "gpt-4", "temperature": 0.5, "tools": ["data_analysis", "visualization"]}', TRUE),
  
  (uuid_generate_v4(), 'Code Generator', 'Generates high-quality code with best practices and proper documentation', 'coding',
    '{"systemPrompt": "You are an expert software engineer who writes clean, efficient, well-documented code following industry best practices.", "model": "gpt-4", "temperature": 0.2, "tools": ["code_execution", "linter"]}', TRUE),
  
  (uuid_generate_v4(), 'Content Marketer', 'Creates engaging marketing content and campaigns', 'marketing',
    '{"systemPrompt": "You are an expert content marketer who creates compelling, engaging content that drives results. Focus on clarity, persuasion, and audience engagement.", "model": "gpt-4", "temperature": 0.8, "tools": ["seo_analyzer", "sentiment_analysis"]}', TRUE);

-- ============================================================================
-- SEED DATA: Built-in Workflow Templates
-- ============================================================================

INSERT INTO workflow_templates (id, name, description, category, framework, workflow_definition, is_builtin, tags) VALUES
  (uuid_generate_v4(), 'Customer Support Workflow', 'Automated ticket triage, classification, and response generation', 'customer_support', 'langgraph',
    '{"nodes": [{"id": "start", "type": "start", "label": "START"}, {"id": "classifier", "type": "agent", "label": "Ticket Classifier", "config": {"agentTemplate": "classifier"}}, {"id": "priority_check", "type": "condition", "label": "Priority Check"}, {"id": "responder", "type": "agent", "label": "Response Generator"}], "edges": [{"source": "start", "target": "classifier"}, {"source": "classifier", "target": "priority_check"}, {"source": "priority_check", "target": "responder"}]}', TRUE, ARRAY['support', 'automation', 'customer_service']),
  
  (uuid_generate_v4(), 'Content Creation Pipeline', 'Research, write, and optimize content for SEO', 'content_creation', 'langgraph',
    '{"nodes": [{"id": "start", "type": "start", "label": "START"}, {"id": "researcher", "type": "agent", "label": "Research Analyst"}, {"id": "writer", "type": "agent", "label": "Content Writer"}, {"id": "seo", "type": "agent", "label": "SEO Optimizer"}], "edges": [{"source": "start", "target": "researcher"}, {"source": "researcher", "target": "writer"}, {"source": "writer", "target": "seo"}]}', TRUE, ARRAY['content', 'marketing', 'seo']);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE workflows IS 'User-created workflow definitions with nodes, edges, and configuration';
COMMENT ON TABLE workflow_versions IS 'Version history for workflows, enabling rollback and tracking';
COMMENT ON TABLE workflow_shares IS 'Workflow sharing permissions for collaboration';
COMMENT ON TABLE workflow_executions IS 'Execution history and results for workflows';
COMMENT ON TABLE workflow_audit_log IS 'Audit trail for all workflow operations';
COMMENT ON TABLE agent_templates IS 'Pre-built agent configurations for rapid workflow creation';
COMMENT ON TABLE workflow_templates IS 'Pre-built workflow templates for common use cases';

