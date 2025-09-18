-- Enhanced JTBD Workflow Features Migration
-- This migration adds support for visual workflow configuration, dynamic agent selection, and advanced execution features

-- 1. Enhanced workflow steps with conditional logic
ALTER TABLE jtbd_process_steps
ADD COLUMN IF NOT EXISTS conditional_next JSONB,
ADD COLUMN IF NOT EXISTS parallel_steps TEXT[],
ADD COLUMN IF NOT EXISTS required_capabilities TEXT[],
ADD COLUMN IF NOT EXISTS agent_selection_strategy JSONB,
ADD COLUMN IF NOT EXISTS validation_rules JSONB,
ADD COLUMN IF NOT EXISTS retry_config JSONB,
ADD COLUMN IF NOT EXISTS timeout_config JSONB,
ADD COLUMN IF NOT EXISTS position JSONB,
ADD COLUMN IF NOT EXISTS monitoring_config JSONB;

-- Add comments for enhanced fields
COMMENT ON COLUMN jtbd_process_steps.conditional_next IS 'Conditional branching logic for dynamic workflows';
COMMENT ON COLUMN jtbd_process_steps.parallel_steps IS 'Array of step IDs that can be executed in parallel';
COMMENT ON COLUMN jtbd_process_steps.required_capabilities IS 'Required agent capabilities for this step';
COMMENT ON COLUMN jtbd_process_steps.agent_selection_strategy IS 'Strategy configuration for dynamic agent selection';
COMMENT ON COLUMN jtbd_process_steps.validation_rules IS 'Input/output validation rules';
COMMENT ON COLUMN jtbd_process_steps.retry_config IS 'Retry configuration for failed executions';
COMMENT ON COLUMN jtbd_process_steps.timeout_config IS 'Timeout and escalation configuration';
COMMENT ON COLUMN jtbd_process_steps.position IS 'Visual position in workflow designer (x, y coordinates)';
COMMENT ON COLUMN jtbd_process_steps.monitoring_config IS 'Step monitoring and alerting configuration';

-- 2. Workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Regulatory', 'Clinical', 'Market Access', 'Medical Affairs', 'Custom')),
  industry_tags TEXT[],
  complexity_level TEXT CHECK (complexity_level IN ('Low', 'Medium', 'High')),
  estimated_duration INTEGER, -- in minutes
  template_data JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_template_data CHECK (template_data ? 'steps'),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Add indexes for workflow templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_complexity ON workflow_templates(complexity_level);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_public ON workflow_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_usage ON workflow_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_rating ON workflow_templates(rating DESC);

-- 3. Workflow versions for change tracking
CREATE TABLE IF NOT EXISTS workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  version TEXT NOT NULL,
  workflow_definition JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(workflow_id, version),
  CONSTRAINT valid_version_format CHECK (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$')
);

-- Add indexes for workflow versions
CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_versions_created_at ON workflow_versions(created_at DESC);

-- 4. Agent performance metrics for dynamic selection
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  step_id TEXT,
  jtbd_id TEXT,
  execution_time INTEGER, -- in seconds
  success_rate DECIMAL(3,2) CHECK (success_rate >= 0 AND success_rate <= 1),
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  cost_per_token DECIMAL(10,6),
  user_satisfaction DECIMAL(3,2) CHECK (user_satisfaction >= 0 AND user_satisfaction <= 1),
  error_count INTEGER DEFAULT 0,
  capability_scores JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure valid metrics
  CONSTRAINT valid_execution_time CHECK (execution_time >= 0),
  CONSTRAINT valid_error_count CHECK (error_count >= 0)
);

-- Add indexes for agent performance metrics
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_step_id ON agent_performance_metrics(step_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_jtbd_id ON agent_performance_metrics(jtbd_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_recorded_at ON agent_performance_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_success_rate ON agent_performance_metrics(success_rate DESC);

-- 5. Agent selection logs for analytics
CREATE TABLE IF NOT EXISTS agent_selection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id TEXT NOT NULL,
  step_name TEXT,
  selected_agent_id UUID REFERENCES agents(id),
  selection_data JSONB NOT NULL,
  strategy TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for agent selection logs
CREATE INDEX IF NOT EXISTS idx_agent_selection_logs_step_id ON agent_selection_logs(step_id);
CREATE INDEX IF NOT EXISTS idx_agent_selection_logs_agent_id ON agent_selection_logs(selected_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_selection_logs_strategy ON agent_selection_logs(strategy);
CREATE INDEX IF NOT EXISTS idx_agent_selection_logs_recorded_at ON agent_selection_logs(recorded_at DESC);

-- 6. Workflow execution analytics
CREATE TABLE IF NOT EXISTS workflow_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  execution_id INTEGER REFERENCES jtbd_executions(id) ON DELETE CASCADE,
  total_duration INTEGER, -- in seconds
  step_durations JSONB,
  agent_utilization JSONB,
  bottlenecks JSONB,
  cost_breakdown JSONB,
  optimization_opportunities JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_duration CHECK (total_duration >= 0)
);

-- Add indexes for workflow analytics
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_workflow_id ON workflow_analytics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_execution_id ON workflow_analytics(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_recorded_at ON workflow_analytics(recorded_at DESC);

-- 7. Enhanced agent capabilities
-- Add more detailed capability tracking to existing agents table
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS performance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (performance_score >= 0 AND performance_score <= 1),
ADD COLUMN IF NOT EXISTS load_score DECIMAL(3,2) DEFAULT 1.0 CHECK (load_score >= 0 AND load_score <= 1),
ADD COLUMN IF NOT EXISTS cost_efficiency_score DECIMAL(3,2) DEFAULT 0.5 CHECK (cost_efficiency_score >= 0 AND cost_efficiency_score <= 1),
ADD COLUMN IF NOT EXISTS last_performance_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comments for agent performance fields
COMMENT ON COLUMN agents.performance_score IS 'Calculated performance score based on historical metrics';
COMMENT ON COLUMN agents.load_score IS 'Current load score (higher = less loaded)';
COMMENT ON COLUMN agents.cost_efficiency_score IS 'Cost efficiency score relative to other agents';
COMMENT ON COLUMN agents.last_performance_update IS 'Last time performance scores were calculated';

-- 8. Workflow step dependencies table for complex workflows
CREATE TABLE IF NOT EXISTS workflow_step_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  depends_on_step_id TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'sequential' CHECK (dependency_type IN ('sequential', 'parallel', 'conditional', 'optional')),
  condition_expression TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(workflow_id, step_id, depends_on_step_id)
);

-- Add indexes for step dependencies
CREATE INDEX IF NOT EXISTS idx_workflow_step_deps_workflow_id ON workflow_step_dependencies(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_deps_step_id ON workflow_step_dependencies(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_deps_depends_on ON workflow_step_dependencies(depends_on_step_id);

-- 9. User workflow customizations
CREATE TABLE IF NOT EXISTS user_workflow_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  customization_name TEXT NOT NULL,
  customizations JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, template_id, customization_name)
);

-- Add indexes for user customizations
CREATE INDEX IF NOT EXISTS idx_user_workflow_customizations_user_id ON user_workflow_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workflow_customizations_template_id ON user_workflow_customizations(template_id);

-- 10. Create views for easy querying

-- View for agent performance summary
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT
  a.id,
  a.name,
  a.tier,
  a.status,
  a.performance_score,
  a.load_score,
  a.cost_efficiency_score,
  COUNT(apm.id) as total_executions,
  AVG(apm.success_rate) as avg_success_rate,
  AVG(apm.quality_score) as avg_quality_score,
  AVG(apm.execution_time) as avg_execution_time,
  MAX(apm.recorded_at) as last_execution
FROM agents a
LEFT JOIN agent_performance_metrics apm ON a.id = apm.agent_id
WHERE a.status = 'active'
GROUP BY a.id, a.name, a.tier, a.status, a.performance_score, a.load_score, a.cost_efficiency_score;

-- View for workflow template analytics
CREATE OR REPLACE VIEW workflow_template_analytics AS
SELECT
  wt.*,
  COUNT(uwc.id) as customization_count,
  AVG(wa.total_duration) as avg_execution_time,
  COUNT(wa.id) as execution_count,
  (
    SELECT AVG(success_rate)
    FROM (
      SELECT
        CASE WHEN je.status = 'Completed' THEN 1.0 ELSE 0.0 END as success_rate
      FROM jtbd_executions je
      WHERE je.jtbd_id LIKE wt.name || '%'
    ) sr
  ) as success_rate
FROM workflow_templates wt
LEFT JOIN user_workflow_customizations uwc ON wt.id = uwc.template_id
LEFT JOIN workflow_analytics wa ON wt.name = wa.workflow_id
GROUP BY wt.id;

-- 11. Create functions for automated performance scoring

-- Function to update agent performance scores
CREATE OR REPLACE FUNCTION update_agent_performance_scores()
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET
    performance_score = COALESCE((
      SELECT AVG(
        (success_rate * 0.4) +
        (quality_score * 0.3) +
        (LEAST(300.0 / GREATEST(execution_time, 1), 1.0) * 0.3)
      )
      FROM agent_performance_metrics
      WHERE agent_id = agents.id
      AND recorded_at > NOW() - INTERVAL '30 days'
    ), 0.5),
    last_performance_update = NOW()
  WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate agent load scores
CREATE OR REPLACE FUNCTION update_agent_load_scores()
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET
    load_score = GREATEST(0, 1.0 - (
      SELECT COUNT(*)::FLOAT / 10.0
      FROM jtbd_executions
      WHERE status IN ('Running', 'Initializing')
      AND agents_used @> ARRAY[agents.id::TEXT]
    )),
    last_performance_update = NOW()
  WHERE status = 'active';
END;
$$ LANGUAGE plpgsql;

-- 12. Create triggers for automatic updates

-- Trigger to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workflow_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE name = NEW.jtbd_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for template usage tracking
DROP TRIGGER IF EXISTS trigger_increment_template_usage ON jtbd_executions;
CREATE TRIGGER trigger_increment_template_usage
  AFTER INSERT ON jtbd_executions
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- Trigger to update workflow template updated_at
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_timestamp
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();

-- 13. Create scheduler for periodic updates (using pg_cron if available)
-- Note: This requires pg_cron extension which may not be available in all environments

-- Schedule agent performance updates every hour
-- SELECT cron.schedule('update-agent-performance', '0 * * * *', 'SELECT update_agent_performance_scores();');
-- SELECT cron.schedule('update-agent-load', '*/5 * * * *', 'SELECT update_agent_load_scores();');

-- 14. Insert initial workflow templates
INSERT INTO workflow_templates (name, description, category, industry_tags, complexity_level, estimated_duration, template_data, is_public, version)
VALUES
(
  'Basic Regulatory Review',
  'Standard regulatory document review and compliance check workflow',
  'Regulatory',
  ARRAY['FDA', 'Regulatory', 'Compliance'],
  'Low',
  60,
  '{
    "id": "basic-regulatory-review",
    "name": "Basic Regulatory Review",
    "description": "Standard regulatory document review workflow",
    "version": "1.0",
    "category": "Regulatory",
    "steps": [
      {
        "id": "step-1",
        "jtbd_id": "basic-regulatory-review",
        "step_number": 1,
        "step_name": "Document Analysis",
        "step_description": "Analyze regulatory documents for compliance requirements",
        "estimated_duration": 30,
        "required_capabilities": ["regulatory_analysis", "document_review"],
        "position": {"x": 100, "y": 100}
      },
      {
        "id": "step-2",
        "jtbd_id": "basic-regulatory-review",
        "step_number": 2,
        "step_name": "Compliance Check",
        "step_description": "Verify compliance with current regulations",
        "estimated_duration": 30,
        "required_capabilities": ["compliance_analysis", "regulatory_guidance"],
        "position": {"x": 300, "y": 100}
      }
    ],
    "conditional_logic": [],
    "parallel_branches": [],
    "error_strategies": [],
    "success_criteria": {
      "required_outputs": ["analysis_report", "compliance_status"],
      "quality_thresholds": {"confidence": 0.8}
    },
    "metadata": {
      "created_at": "' || NOW() || '",
      "updated_at": "' || NOW() || '",
      "tags": ["regulatory", "basic"]
    }
  }'::jsonb,
  true,
  '1.0'
)
ON CONFLICT DO NOTHING;

-- 15. Grant appropriate permissions (adjust as needed for your RLS setup)
-- These would be customized based on your specific security requirements

-- Enable RLS on new tables if it's enabled in your system
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_selection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workflow_customizations ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your security model)
CREATE POLICY "Public templates are viewable by everyone" ON workflow_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own customizations" ON user_workflow_customizations
  FOR ALL USING (auth.uid() = user_id);

-- 16. Create helpful functions for the application

-- Function to get agent recommendations for a step
CREATE OR REPLACE FUNCTION get_agent_recommendations(
  step_capabilities TEXT[],
  exclude_agent_ids UUID[] DEFAULT ARRAY[]::UUID[]
)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  tier INTEGER,
  capability_match_score DECIMAL,
  performance_score DECIMAL,
  load_score DECIMAL,
  overall_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.tier,
    CASE
      WHEN array_length(step_capabilities, 1) = 0 THEN 1.0
      ELSE (
        SELECT COUNT(*)::DECIMAL / array_length(step_capabilities, 1)
        FROM unnest(step_capabilities) AS required_cap
        WHERE required_cap = ANY(a.capabilities)
      )
    END as capability_match_score,
    COALESCE(a.performance_score, 0.5) as performance_score,
    COALESCE(a.load_score, 1.0) as load_score,
    (
      CASE
        WHEN array_length(step_capabilities, 1) = 0 THEN 1.0
        ELSE (
          SELECT COUNT(*)::DECIMAL / array_length(step_capabilities, 1)
          FROM unnest(step_capabilities) AS required_cap
          WHERE required_cap = ANY(a.capabilities)
        )
      END * 0.4 +
      COALESCE(a.performance_score, 0.5) * 0.3 +
      COALESCE(a.load_score, 1.0) * 0.2 +
      (CASE WHEN a.tier = 1 THEN 0.1 WHEN a.tier = 2 THEN 0.05 ELSE 0 END)
    ) as overall_score
  FROM agents a
  WHERE a.status = 'active'
  AND NOT (a.id = ANY(exclude_agent_ids))
  ORDER BY overall_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Commit the transaction
COMMIT;

-- Add helpful comments
COMMENT ON TABLE workflow_templates IS 'Predefined workflow templates for pharmaceutical processes';
COMMENT ON TABLE workflow_versions IS 'Version history for workflow definitions';
COMMENT ON TABLE agent_performance_metrics IS 'Historical performance data for agent selection optimization';
COMMENT ON TABLE agent_selection_logs IS 'Log of agent selection decisions for analytics';
COMMENT ON TABLE workflow_analytics IS 'Execution analytics for workflow optimization';
COMMENT ON TABLE workflow_step_dependencies IS 'Complex dependencies between workflow steps';
COMMENT ON TABLE user_workflow_customizations IS 'User-specific customizations of workflow templates';

-- Show completion message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced JTBD Workflow Features migration completed successfully!';
  RAISE NOTICE 'Added support for:';
  RAISE NOTICE '- Visual workflow configuration';
  RAISE NOTICE '- Dynamic agent selection';
  RAISE NOTICE '- Workflow templates and versions';
  RAISE NOTICE '- Performance analytics';
  RAISE NOTICE '- Advanced execution features';
END $$;