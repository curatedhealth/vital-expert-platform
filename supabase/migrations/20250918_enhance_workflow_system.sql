-- Enhanced JTBD Workflow System Migration
-- Adds dynamic configuration capabilities, visual workflow building, and analytics

-- 1. Enhanced workflow steps with conditional logic
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS conditional_next JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS parallel_steps TEXT[];
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS required_capabilities TEXT[];
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS agent_selection_strategy JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS validation_rules JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS retry_config JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS timeout_config JSONB;
ALTER TABLE jtbd_process_steps ADD COLUMN IF NOT EXISTS position JSONB; -- For visual positioning

-- Add comments for documentation
COMMENT ON COLUMN jtbd_process_steps.conditional_next IS 'Array of conditional next step configurations with conditions and transformations';
COMMENT ON COLUMN jtbd_process_steps.parallel_steps IS 'Array of step IDs that can execute in parallel with this step';
COMMENT ON COLUMN jtbd_process_steps.required_capabilities IS 'Required agent capabilities for this step';
COMMENT ON COLUMN jtbd_process_steps.agent_selection_strategy IS 'Configuration for dynamic agent selection (manual, automatic, consensus, etc.)';
COMMENT ON COLUMN jtbd_process_steps.validation_rules IS 'Input/output validation rules for the step';
COMMENT ON COLUMN jtbd_process_steps.retry_config IS 'Retry configuration including max attempts and backoff strategy';
COMMENT ON COLUMN jtbd_process_steps.timeout_config IS 'Timeout settings for step execution';
COMMENT ON COLUMN jtbd_process_steps.position IS 'Visual positioning data for workflow builder (x, y coordinates)';

-- 2. Workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Regulatory', 'Clinical', 'Market Access', 'Medical Affairs', 'Custom')),
  industry_tags TEXT[] DEFAULT '{}',
  complexity_level TEXT CHECK (complexity_level IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  estimated_duration INTEGER, -- in minutes
  template_data JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Workflow versions for change tracking
CREATE TABLE IF NOT EXISTS workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  version TEXT NOT NULL,
  workflow_definition JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workflow_id, version)
);

-- 4. Agent performance metrics for dynamic selection
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  step_id TEXT,
  jtbd_id TEXT,
  execution_time INTEGER, -- in milliseconds
  success_rate DECIMAL(5,4) CHECK (success_rate >= 0 AND success_rate <= 1),
  quality_score DECIMAL(5,4) CHECK (quality_score >= 0 AND quality_score <= 1),
  cost_per_token DECIMAL(10,6),
  user_satisfaction DECIMAL(3,2) CHECK (user_satisfaction >= 0 AND user_satisfaction <= 5),
  error_count INTEGER DEFAULT 0,
  capability_scores JSONB, -- Map of capability -> score
  metadata JSONB, -- Additional metrics and context
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Workflow execution analytics
CREATE TABLE IF NOT EXISTS workflow_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  execution_id INTEGER REFERENCES jtbd_executions(id) ON DELETE CASCADE,
  total_duration INTEGER, -- in milliseconds
  step_durations JSONB, -- Map of step_id -> duration
  agent_utilization JSONB, -- Map of agent_id -> utilization stats
  bottlenecks JSONB, -- Identified bottlenecks and delays
  cost_breakdown JSONB, -- Detailed cost analysis
  optimization_opportunities JSONB, -- AI-suggested optimizations
  performance_metrics JSONB, -- Overall performance scores
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Workflow configurations for dynamic behavior
CREATE TABLE IF NOT EXISTS workflow_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  name TEXT NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_public ON workflow_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_step_id ON agent_performance_metrics(step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_workflow_id ON workflow_analytics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_execution_id ON workflow_analytics(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_configurations_workflow_id ON workflow_configurations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_configurations_active ON workflow_configurations(is_active) WHERE is_active = true;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_templates_updated_at
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_configurations_updated_at
    BEFORE UPDATE ON workflow_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_configurations ENABLE ROW LEVEL SECURITY;

-- Policies for workflow_templates
CREATE POLICY "Users can view public templates and their own" ON workflow_templates
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create their own templates" ON workflow_templates
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON workflow_templates
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates" ON workflow_templates
    FOR DELETE USING (created_by = auth.uid());

-- Policies for workflow_versions
CREATE POLICY "Users can view workflow versions they have access to" ON workflow_versions
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create workflow versions" ON workflow_versions
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Policies for agent_performance_metrics
CREATE POLICY "Users can view agent performance metrics" ON agent_performance_metrics
    FOR SELECT USING (true); -- Allow read access for performance optimization

CREATE POLICY "System can insert performance metrics" ON agent_performance_metrics
    FOR INSERT WITH CHECK (true); -- Allow system to record metrics

-- Policies for workflow_analytics
CREATE POLICY "Users can view their workflow analytics" ON workflow_analytics
    FOR SELECT USING (true); -- Allow read access for analytics

CREATE POLICY "System can insert workflow analytics" ON workflow_analytics
    FOR INSERT WITH CHECK (true); -- Allow system to record analytics

-- Policies for workflow_configurations
CREATE POLICY "Users can manage their workflow configurations" ON workflow_configurations
    FOR ALL USING (created_by = auth.uid());

-- Insert sample workflow templates
INSERT INTO workflow_templates (name, description, category, industry_tags, complexity_level, estimated_duration, template_data, is_public) VALUES
('FDA 510(k) Submission Workflow', 'Complete workflow for FDA 510(k) medical device submission process', 'Regulatory', ARRAY['medical-device', 'fda', 'regulatory'], 'High', 2880,
'{
  "steps": [
    {
      "id": "device_classification",
      "name": "Device Classification",
      "description": "Determine FDA device classification and predicate device identification",
      "capabilities": ["Regulatory Guidance", "Device Classification"],
      "estimated_duration": 480
    },
    {
      "id": "predicate_analysis",
      "name": "Predicate Device Analysis",
      "description": "Analyze predicate devices and substantial equivalence documentation",
      "capabilities": ["Regulatory Research", "Comparative Analysis"],
      "estimated_duration": 720
    },
    {
      "id": "submission_preparation",
      "name": "510(k) Submission Preparation",
      "description": "Prepare complete 510(k) submission package",
      "capabilities": ["Technical Writing", "Regulatory Documentation"],
      "estimated_duration": 1440
    },
    {
      "id": "quality_review",
      "name": "Quality Review and Submission",
      "description": "Final quality review and FDA submission",
      "capabilities": ["Quality Assurance", "Submission Management"],
      "estimated_duration": 240
    }
  ],
  "workflow_config": {
    "allow_parallel": false,
    "require_approval": true,
    "auto_assign_agents": true
  }
}', true),

('Clinical Trial Protocol Development', 'End-to-end clinical trial protocol development workflow', 'Clinical', ARRAY['clinical-trials', 'protocol', 'gcp'], 'High', 1920,
'{
  "steps": [
    {
      "id": "protocol_design",
      "name": "Protocol Design",
      "description": "Design clinical trial protocol structure and objectives",
      "capabilities": ["Clinical Research", "Protocol Design"],
      "estimated_duration": 480
    },
    {
      "id": "statistical_plan",
      "name": "Statistical Analysis Plan",
      "description": "Develop statistical analysis plan and sample size calculations",
      "capabilities": ["Biostatistics", "Clinical Research"],
      "estimated_duration": 360
    },
    {
      "id": "regulatory_review",
      "name": "Regulatory Review",
      "description": "Review protocol for regulatory compliance",
      "capabilities": ["Regulatory Guidance", "Clinical Compliance"],
      "estimated_duration": 240
    },
    {
      "id": "protocol_finalization",
      "name": "Protocol Finalization",
      "description": "Finalize protocol document and prepare for submission",
      "capabilities": ["Technical Writing", "Document Management"],
      "estimated_duration": 360
    }
  ],
  "workflow_config": {
    "allow_parallel": true,
    "require_approval": true,
    "auto_assign_agents": true
  }
}', true),

('Market Access Strategy Development', 'Comprehensive market access strategy development workflow', 'Market Access', ARRAY['market-access', 'pricing', 'reimbursement'], 'Medium', 1440,
'{
  "steps": [
    {
      "id": "market_analysis",
      "name": "Market Analysis",
      "description": "Analyze target markets and competitive landscape",
      "capabilities": ["Market Research", "Competitive Analysis"],
      "estimated_duration": 360
    },
    {
      "id": "value_proposition",
      "name": "Value Proposition Development",
      "description": "Develop health economic value proposition",
      "capabilities": ["Health Economics", "Value Assessment"],
      "estimated_duration": 480
    },
    {
      "id": "pricing_strategy",
      "name": "Pricing Strategy",
      "description": "Develop pricing and reimbursement strategy",
      "capabilities": ["Pricing Strategy", "Reimbursement Planning"],
      "estimated_duration": 360
    },
    {
      "id": "access_plan",
      "name": "Market Access Plan",
      "description": "Create comprehensive market access execution plan",
      "capabilities": ["Strategic Planning", "Market Access"],
      "estimated_duration": 240
    }
  ],
  "workflow_config": {
    "allow_parallel": true,
    "require_approval": false,
    "auto_assign_agents": true
  }
}', true);

-- Add sample performance data for agents
INSERT INTO agent_performance_metrics (agent_id, step_id, jtbd_id, execution_time, success_rate, quality_score, cost_per_token, user_satisfaction, capability_scores)
SELECT
  a.id,
  'regulatory_review',
  'test_jtbd_001',
  FLOOR(RANDOM() * 300000 + 60000)::INTEGER, -- 1-5 minutes
  (RANDOM() * 0.3 + 0.7)::DECIMAL(5,4), -- 70-100% success rate
  (RANDOM() * 0.3 + 0.7)::DECIMAL(5,4), -- 70-100% quality
  (RANDOM() * 0.001 + 0.001)::DECIMAL(10,6), -- $0.001-0.002 per token
  (RANDOM() * 1.5 + 3.5)::DECIMAL(3,2), -- 3.5-5.0 satisfaction
  '{"Regulatory Guidance": 0.9, "Compliance Review": 0.85, "Risk Assessment": 0.8}'::JSONB
FROM agents a
WHERE a.name ILIKE '%regulatory%' OR a.name ILIKE '%compliance%'
LIMIT 5;

COMMIT;