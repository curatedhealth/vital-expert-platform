-- Comprehensive Digital Health Capability Registry
-- Implementation of the enhanced VITAL AI Capability Framework
-- Supports 125 capabilities with 100 expert agents and virtual advisory boards

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM Types for controlled vocabularies
CREATE TYPE lifecycle_stage AS ENUM (
  'unmet_needs_investigation',
  'solution_design',
  'prototyping_development',
  'clinical_validation',
  'regulatory_pathway',
  'reimbursement_strategy',
  'go_to_market',
  'post_market_optimization'
);

CREATE TYPE vital_framework AS ENUM (
  'V_value_discovery',
  'I_intelligence_gathering',
  'T_transformation_design',
  'A_acceleration_execution',
  'L_leadership_scale'
);

CREATE TYPE priority_level AS ENUM (
  'critical_immediate',
  'near_term_90_days',
  'strategic_180_days',
  'future_horizon'
);

CREATE TYPE maturity_level AS ENUM (
  'level_1_initial',
  'level_2_developing',
  'level_3_advanced',
  'level_4_leading',
  'level_5_transformative'
);

CREATE TYPE agent_domain AS ENUM (
  'design_ux',
  'healthcare_clinical',
  'technology_engineering',
  'business_strategy',
  'global_regulatory',
  'patient_advocacy'
);

-- Drop existing capabilities table if it exists (backup first)
-- CREATE TABLE capabilities_backup AS SELECT * FROM capabilities WHERE EXISTS (SELECT 1 FROM capabilities LIMIT 1);

-- Enhanced Capabilities Table
DROP TABLE IF EXISTS capabilities CASCADE;
CREATE TABLE capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capability_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  stage lifecycle_stage NOT NULL,
  vital_component vital_framework NOT NULL,
  priority priority_level NOT NULL,
  maturity maturity_level NOT NULL,
  is_new BOOLEAN DEFAULT FALSE,
  panel_recommended BOOLEAN DEFAULT FALSE,

  -- Competencies as JSONB for flexibility
  competencies JSONB NOT NULL DEFAULT '[]',

  -- Tools and Knowledge Base
  tools JSONB DEFAULT '[]',
  knowledge_base JSONB DEFAULT '[]',

  -- Metrics and Success Criteria
  success_metrics JSONB DEFAULT '{}',
  implementation_timeline INTEGER, -- in days

  -- Dependencies
  depends_on UUID[] DEFAULT '{}',
  enables UUID[] DEFAULT '{}',

  -- Legacy fields for backward compatibility
  category VARCHAR(100) DEFAULT 'general',
  icon VARCHAR(10) DEFAULT '⚡',
  color VARCHAR(50) DEFAULT 'text-trust-blue',
  complexity_level VARCHAR(20) DEFAULT 'intermediate',
  domain VARCHAR(100) DEFAULT 'general',
  prerequisites JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  average_execution_time INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  requires_training BOOLEAN DEFAULT FALSE,
  requires_api_access BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  version VARCHAR(20) DEFAULT '1.0.0',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID,

  -- Search vector for full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', description), 'B') ||
    setweight(to_tsvector('english', COALESCE(competencies::text, '')), 'C')
  ) STORED
);

-- Enhanced Expert Agents Table
DROP TABLE IF EXISTS expert_agents CASCADE;
CREATE TABLE expert_agents (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  domain agent_domain NOT NULL,
  focus_area TEXT NOT NULL,
  key_expertise TEXT NOT NULL,

  -- Extended Profile
  years_experience INTEGER,
  credentials JSONB DEFAULT '[]',
  publications JSONB DEFAULT '[]',
  specializations JSONB DEFAULT '[]',

  -- Availability and Engagement
  availability VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly'
  engagement_tier INTEGER CHECK (engagement_tier BETWEEN 1 AND 4),
  timezone VARCHAR(50),
  languages JSONB DEFAULT '["English"]',

  -- Contact and Integration
  communication_preferences JSONB DEFAULT '{}',
  virtual_board_memberships JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT TRUE,

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', organization), 'B') ||
    setweight(to_tsvector('english', key_expertise), 'C')
  ) STORED
);

-- Capability-Agent Relationships
DROP TABLE IF EXISTS capability_agents CASCADE;
CREATE TABLE capability_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES expert_agents(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL, -- 'lead', 'support', 'reviewer', 'advisor'
  expertise_score DECIMAL(3,2) CHECK (expertise_score >= 0 AND expertise_score <= 1),

  -- Engagement Details
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_review TIMESTAMP WITH TIME ZONE,
  contribution_notes TEXT,

  -- Unique constraint to prevent duplicates
  UNIQUE(capability_id, agent_id, relationship_type)
);

-- Virtual Advisory Boards
CREATE TABLE virtual_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  board_type VARCHAR(100) NOT NULL,
  focus_areas JSONB NOT NULL DEFAULT '[]',

  -- Board Configuration
  lead_agent_id INTEGER REFERENCES expert_agents(id),
  consensus_method VARCHAR(50), -- 'voting', 'delphi', 'weighted', 'unanimous'
  quorum_requirement INTEGER DEFAULT 5,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT TRUE
);

-- Board Memberships
CREATE TABLE board_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES virtual_boards(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES expert_agents(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'chair', 'member', 'advisor', 'observer'
  voting_weight DECIMAL(3,2) DEFAULT 1.0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  UNIQUE(board_id, agent_id)
);

-- Capability Workflows
CREATE TABLE capability_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  stage lifecycle_stage NOT NULL,

  -- Workflow Definition
  workflow_steps JSONB NOT NULL DEFAULT '[]',
  required_capabilities UUID[] NOT NULL DEFAULT '{}',
  required_agents INTEGER[] NOT NULL DEFAULT '{}',

  -- Timing and Dependencies
  estimated_duration INTEGER, -- in days
  prerequisites JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Legacy agent_capabilities table for backward compatibility
DROP TABLE IF EXISTS agent_capabilities CASCADE;
CREATE TABLE agent_capabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID NOT NULL,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,

  -- Capability Configuration for this Agent
  proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  custom_config JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,

  -- Performance Tracking
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, capability_id)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_capabilities_stage ON capabilities(stage);
CREATE INDEX IF NOT EXISTS idx_capabilities_vital ON capabilities(vital_component);
CREATE INDEX IF NOT EXISTS idx_capabilities_priority ON capabilities(priority);
CREATE INDEX IF NOT EXISTS idx_capabilities_maturity ON capabilities(maturity);
CREATE INDEX IF NOT EXISTS idx_capabilities_search ON capabilities USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_capabilities_category ON capabilities(category);
CREATE INDEX IF NOT EXISTS idx_capabilities_domain ON capabilities(domain);
CREATE INDEX IF NOT EXISTS idx_capabilities_status ON capabilities(status);

CREATE INDEX IF NOT EXISTS idx_agents_domain ON expert_agents(domain);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON expert_agents(engagement_tier);
CREATE INDEX IF NOT EXISTS idx_agents_search ON expert_agents USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_cap_agents_capability ON capability_agents(capability_id);
CREATE INDEX IF NOT EXISTS idx_cap_agents_agent ON capability_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_cap_agents_type ON capability_agents(relationship_type);

CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability_id ON agent_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_proficiency ON agent_capabilities(proficiency_level);

-- Row Level Security
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth requirements)
CREATE POLICY "Public read access" ON capabilities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON expert_agents FOR SELECT USING (true);
CREATE POLICY "Public read access" ON capability_agents FOR SELECT USING (true);
CREATE POLICY "Public read access" ON virtual_boards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON board_memberships FOR SELECT USING (true);
CREATE POLICY "Public read access" ON capability_workflows FOR SELECT USING (true);
CREATE POLICY "Public read access" ON agent_capabilities FOR SELECT USING (true);

-- Authenticated users can insert/update
CREATE POLICY "Authenticated write access" ON capabilities
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access" ON expert_agents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access" ON capability_agents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access" ON virtual_boards
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access" ON board_memberships
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access" ON capability_workflows
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access" ON agent_capabilities
  FOR ALL USING (auth.role() = 'authenticated');

-- Database functions for RAG management

-- Function to get available capabilities for an agent
CREATE OR REPLACE FUNCTION get_available_capabilities_for_agent(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    stage TEXT,
    vital_component TEXT,
    priority TEXT,
    maturity TEXT,
    competencies JSONB,
    is_assigned BOOLEAN,
    assignment_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name::TEXT,
        c.capability_key::TEXT as display_name,
        c.description::TEXT,
        c.stage::TEXT,
        c.vital_component::TEXT,
        c.priority::TEXT,
        c.maturity::TEXT,
        c.competencies,
        CASE WHEN ca.capability_id IS NOT NULL THEN true ELSE false END as is_assigned,
        COALESCE(ca.expertise_score * 100, 0)::INTEGER as assignment_priority
    FROM capabilities c
    LEFT JOIN capability_agents ca ON c.id = ca.capability_id
        AND ca.agent_id = (
            SELECT ea.id FROM expert_agents ea
            WHERE ea.name = agent_name_param
            LIMIT 1
        )
    WHERE c.status = 'active'
    ORDER BY
        is_assigned DESC,
        assignment_priority DESC,
        c.stage,
        c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assigned capabilities for an agent
CREATE OR REPLACE FUNCTION get_agent_assigned_capabilities(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    stage TEXT,
    vital_component TEXT,
    relationship_type TEXT,
    expertise_score DECIMAL,
    competencies JSONB,
    last_review TIMESTAMPTZ,
    contribution_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name::TEXT,
        c.capability_key::TEXT as display_name,
        c.description::TEXT,
        c.stage::TEXT,
        c.vital_component::TEXT,
        ca.relationship_type::TEXT,
        ca.expertise_score,
        c.competencies,
        ca.last_review,
        ca.contribution_notes::TEXT
    FROM capabilities c
    INNER JOIN capability_agents ca ON c.id = ca.capability_id
    INNER JOIN expert_agents ea ON ca.agent_id = ea.id
    WHERE ea.name = agent_name_param
    AND c.status = 'active'
    ORDER BY ca.expertise_score DESC, c.stage, c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get capabilities by stage
CREATE OR REPLACE FUNCTION get_capabilities_by_stage(stage_param TEXT)
RETURNS TABLE (
    id UUID,
    capability_key TEXT,
    name TEXT,
    description TEXT,
    vital_component TEXT,
    priority TEXT,
    maturity TEXT,
    is_new BOOLEAN,
    panel_recommended BOOLEAN,
    competencies JSONB,
    lead_agent_name TEXT,
    lead_agent_org TEXT,
    supporting_agents_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.capability_key::TEXT,
        c.name::TEXT,
        c.description::TEXT,
        c.vital_component::TEXT,
        c.priority::TEXT,
        c.maturity::TEXT,
        c.is_new,
        c.panel_recommended,
        c.competencies,
        lead_agent.name::TEXT as lead_agent_name,
        lead_agent.organization::TEXT as lead_agent_org,
        COALESCE(supporting_count.count, 0)::INTEGER as supporting_agents_count
    FROM capabilities c
    LEFT JOIN capability_agents lead_ca ON c.id = lead_ca.capability_id AND lead_ca.relationship_type = 'lead'
    LEFT JOIN expert_agents lead_agent ON lead_ca.agent_id = lead_agent.id
    LEFT JOIN (
        SELECT
            capability_id,
            COUNT(*) as count
        FROM capability_agents
        WHERE relationship_type != 'lead'
        GROUP BY capability_id
    ) supporting_count ON c.id = supporting_count.capability_id
    WHERE c.stage::TEXT = stage_param
    AND c.status = 'active'
    ORDER BY
        CASE c.priority
            WHEN 'critical_immediate' THEN 1
            WHEN 'near_term_90_days' THEN 2
            WHEN 'strategic_180_days' THEN 3
            WHEN 'future_horizon' THEN 4
        END,
        c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_capabilities_updated_at
    BEFORE UPDATE ON capabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_agents_updated_at
    BEFORE UPDATE ON expert_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_virtual_boards_updated_at
    BEFORE UPDATE ON virtual_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_capabilities_updated_at
    BEFORE UPDATE ON agent_capabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON capabilities TO authenticated;
GRANT ALL ON expert_agents TO authenticated;
GRANT ALL ON capability_agents TO authenticated;
GRANT ALL ON virtual_boards TO authenticated;
GRANT ALL ON board_memberships TO authenticated;
GRANT ALL ON capability_workflows TO authenticated;
GRANT ALL ON agent_capabilities TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_available_capabilities_for_agent(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_assigned_capabilities(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_capabilities_by_stage(TEXT) TO authenticated, anon;

-- Add table comments
COMMENT ON TABLE capabilities IS 'Enhanced capabilities registry for digital health interventions';
COMMENT ON TABLE expert_agents IS '100 expert agents for capability leadership and support';
COMMENT ON TABLE capability_agents IS 'Links agents to their assigned capabilities with expertise scores';
COMMENT ON TABLE virtual_boards IS 'Virtual advisory boards for capability governance';
COMMENT ON TABLE board_memberships IS 'Membership records for virtual advisory boards';
COMMENT ON TABLE capability_workflows IS 'Workflow definitions for capability implementation';

-- Show completion status
SELECT
    'Enhanced Capability Registry Setup Complete' as status,
    '6 tables created' as tables,
    '3 functions created' as functions,
    'RLS policies applied' as security,
    'Ready for 125 capabilities and 100 agents' as ready;