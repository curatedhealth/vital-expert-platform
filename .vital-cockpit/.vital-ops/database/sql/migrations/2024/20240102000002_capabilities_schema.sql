-- Create capabilities table for managing agent capabilities
CREATE TABLE IF NOT EXISTS capabilities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL UNIQUE,
  display_name varchar(255) NOT NULL,
  description text NOT NULL,
  category varchar(100) NOT NULL DEFAULT 'general',
  icon varchar(10) DEFAULT '⚡',
  color varchar(50) DEFAULT 'text-trust-blue',

  -- Capability Metadata
  complexity_level varchar(20) DEFAULT 'intermediate' CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  domain varchar(100) NOT NULL DEFAULT 'general',
  prerequisites jsonb DEFAULT '[]',

  -- Usage and Performance
  usage_count integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 0.0,
  average_execution_time integer DEFAULT 0, -- in milliseconds

  -- Configuration
  is_premium boolean DEFAULT false,
  requires_training boolean DEFAULT false,
  requires_api_access boolean DEFAULT false,

  -- Status and Lifecycle
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'beta', 'deprecated')),
  version varchar(20) DEFAULT '1.0.0',

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Indexes
  CONSTRAINT capabilities_name_key UNIQUE (name)
);

-- Create agent_capabilities mapping table for many-to-many relationship
CREATE TABLE IF NOT EXISTS agent_capabilities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  capability_id uuid NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,

  -- Capability Configuration for this Agent
  proficiency_level varchar(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  custom_config jsonb DEFAULT '{}',
  is_primary boolean DEFAULT false, -- Is this a primary capability for this agent?

  -- Performance Tracking
  usage_count integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 0.0,
  last_used_at timestamptz,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, capability_id)
);

-- Create capability categories table for better organization
CREATE TABLE IF NOT EXISTS capability_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE,
  display_name varchar(255) NOT NULL,
  description text,
  icon varchar(10) DEFAULT '📁',
  color varchar(50) DEFAULT 'text-medical-gray',
  sort_order integer DEFAULT 0,
  parent_id uuid REFERENCES capability_categories(id),

  -- Status
  is_active boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_capabilities_category ON capabilities(category);
CREATE INDEX IF NOT EXISTS idx_capabilities_domain ON capabilities(domain);
CREATE INDEX IF NOT EXISTS idx_capabilities_status ON capabilities(status);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_agent_id ON agent_capabilities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_capability_id ON agent_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_agent_capabilities_proficiency ON agent_capabilities(proficiency_level);
CREATE INDEX IF NOT EXISTS idx_capability_categories_parent ON capability_categories(parent_id);

-- Enable Row Level Security
ALTER TABLE capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for capabilities (read access for authenticated users)
CREATE POLICY "capabilities_read_policy" ON capabilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "agent_capabilities_read_policy" ON agent_capabilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "capability_categories_read_policy" ON capability_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin write access (replace with actual admin emails)
CREATE POLICY "capabilities_admin_write_policy" ON capabilities
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

CREATE POLICY "agent_capabilities_admin_write_policy" ON agent_capabilities
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

CREATE POLICY "capability_categories_admin_write_policy" ON capability_categories
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_capabilities_updated_at BEFORE UPDATE ON capabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_capabilities_updated_at BEFORE UPDATE ON agent_capabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capability_categories_updated_at BEFORE UPDATE ON capability_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();