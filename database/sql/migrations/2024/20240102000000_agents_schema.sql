-- Create agents table for storing AI agent configurations
CREATE TABLE IF NOT EXISTS agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  display_name varchar(255) NOT NULL,
  description text NOT NULL,
  avatar varchar(255) NOT NULL DEFAULT '🤖',
  color varchar(50) NOT NULL DEFAULT 'text-trust-blue',

  -- Agent Configuration
  system_prompt text NOT NULL,
  model varchar(100) NOT NULL DEFAULT 'gpt-4',
  temperature decimal(3,2) NOT NULL DEFAULT 0.7,
  max_tokens integer NOT NULL DEFAULT 2000,

  -- Capabilities and Features
  capabilities jsonb NOT NULL DEFAULT '[]',
  specializations jsonb NOT NULL DEFAULT '[]',
  tools jsonb NOT NULL DEFAULT '[]',

  -- Agent Metadata
  tier integer NOT NULL DEFAULT 1 CHECK (tier >= 1 AND tier <= 5),
  priority integer NOT NULL DEFAULT 1,
  implementation_phase integer NOT NULL DEFAULT 1,

  -- RAG and Knowledge
  rag_enabled boolean NOT NULL DEFAULT true,
  knowledge_domains jsonb NOT NULL DEFAULT '[]',
  data_sources jsonb NOT NULL DEFAULT '[]',

  -- Business Impact
  roi_metrics jsonb NOT NULL DEFAULT '{}',
  use_cases jsonb NOT NULL DEFAULT '[]',
  target_users jsonb NOT NULL DEFAULT '[]',

  -- Technical Requirements
  required_integrations jsonb NOT NULL DEFAULT '[]',
  security_level varchar(50) NOT NULL DEFAULT 'standard',
  compliance_requirements jsonb NOT NULL DEFAULT '[]',

  -- Status and Lifecycle
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'development', 'deprecated')),
  is_custom boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(name),
  UNIQUE(display_name)
);

-- Create agent categories table
CREATE TABLE IF NOT EXISTS agent_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE,
  display_name varchar(100) NOT NULL,
  description text,
  color varchar(50) NOT NULL DEFAULT 'text-medical-gray',
  icon varchar(10) NOT NULL DEFAULT '📁',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create agent_category_mapping table (many-to-many)
CREATE TABLE IF NOT EXISTS agent_category_mapping (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  category_id uuid REFERENCES agent_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(agent_id, category_id)
);

-- Create agent_collaborations table (agent workflow patterns)
CREATE TABLE IF NOT EXISTS agent_collaborations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text NOT NULL,
  workflow_pattern jsonb NOT NULL,
  primary_agent_id uuid REFERENCES agents(id),
  secondary_agents jsonb NOT NULL DEFAULT '[]',
  trigger_conditions jsonb NOT NULL DEFAULT '{}',
  success_metrics jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create agent_performance_metrics table
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),

  -- Usage Metrics
  query_count integer NOT NULL DEFAULT 0,
  success_rate decimal(5,2) NOT NULL DEFAULT 0.00,
  avg_response_time_ms integer NOT NULL DEFAULT 0,
  user_satisfaction_score decimal(3,2), -- 1-5 scale

  -- Business Metrics
  time_saved_minutes integer NOT NULL DEFAULT 0,
  documents_generated integer NOT NULL DEFAULT 0,
  decisions_supported integer NOT NULL DEFAULT 0,

  -- Quality Metrics
  accuracy_score decimal(3,2), -- 0-1 scale
  relevance_score decimal(3,2), -- 0-1 scale
  completeness_score decimal(3,2), -- 0-1 scale

  -- Period
  metric_date date NOT NULL DEFAULT current_date,

  created_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, user_id, metric_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);
CREATE INDEX IF NOT EXISTS idx_agents_implementation_phase ON agents(implementation_phase);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_date ON agent_performance_metrics(metric_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_collaborations_updated_at
    BEFORE UPDATE ON agent_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_category_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents (read-only for all authenticated users, write for admins only)
CREATE POLICY "Agents are viewable by authenticated users" ON agents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Agents are editable by admins" ON agents
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'admin@vitalpath.ai',
            'hicham.naim@example.com' -- Replace with actual admin email
        )
    );

-- RLS Policies for agent_categories
CREATE POLICY "Agent categories are viewable by authenticated users" ON agent_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for agent_category_mapping
CREATE POLICY "Agent category mapping is viewable by authenticated users" ON agent_category_mapping
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for agent_collaborations
CREATE POLICY "Agent collaborations are viewable by authenticated users" ON agent_collaborations
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for agent_performance_metrics
CREATE POLICY "Users can view their own agent metrics" ON agent_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent metrics" ON agent_performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent metrics" ON agent_performance_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert agent categories
INSERT INTO agent_categories (name, display_name, description, color, icon, sort_order) VALUES
('regulatory', 'Regulatory Affairs', 'FDA, EMA, and global regulatory guidance', 'text-trust-blue', '🏛️', 1),
('clinical', 'Clinical Development', 'Clinical trials, evidence generation, and biomarkers', 'text-clinical-green', '🔬', 2),
('market-access', 'Market Access', 'Reimbursement, HTA, and payer strategies', 'text-market-purple', '💰', 3),
('medical-writing', 'Medical Writing', 'Regulatory and clinical documentation', 'text-regulatory-gold', '📝', 4),
('commercial', 'Commercial Intelligence', 'Competitive analysis and business development', 'text-innovation-orange', '💼', 5),
('quality-compliance', 'Quality & Compliance', 'GxP compliance, audits, and quality systems', 'text-medical-gray', '🛡️', 6),
('safety', 'Safety & Pharmacovigilance', 'Adverse events and safety monitoring', 'text-clinical-red', '⚠️', 7),
('analytics', 'Data & Analytics', 'Statistical analysis and data orchestration', 'text-progress-teal', '📊', 8),
('specialized', 'Specialized Domains', 'DTx, AI/ML devices, and emerging technologies', 'text-market-purple', '🎯', 9)
ON CONFLICT (name) DO NOTHING;