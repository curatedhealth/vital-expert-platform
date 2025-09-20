-- Add prompts table and populate with required data
-- Working with existing capabilities table schema

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'create-fda-regulatory-strategy'
    display_name VARCHAR(255) NOT NULL, -- e.g., 'Create FDA Regulatory Strategy'
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,

    -- Prompt Definition
    system_prompt TEXT NOT NULL, -- Main prompt template
    user_prompt_template TEXT, -- Template for user inputs
    execution_instructions JSONB DEFAULT '{}', -- Step-by-step execution guide
    success_criteria JSONB DEFAULT '{}', -- What constitutes success

    -- Prompt Configuration
    model_requirements JSONB DEFAULT '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 2000}',
    input_schema JSONB DEFAULT '{}', -- Required input parameters
    output_schema JSONB DEFAULT '{}', -- Expected output format
    validation_rules JSONB DEFAULT '{}', -- Input/output validation

    -- Classification
    complexity_level VARCHAR(20) DEFAULT 'intermediate' CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    domain VARCHAR(100) NOT NULL DEFAULT 'general',
    estimated_tokens INTEGER DEFAULT 1000,

    -- Dependencies
    prerequisite_prompts TEXT[], -- Other prompt names required
    related_capabilities TEXT[], -- Capability names this prompt supports
    required_context TEXT[], -- Context requirements

    -- Validation & Quality
    validation_status VARCHAR(20) DEFAULT 'active' CHECK (validation_status IN ('active', 'inactive', 'beta', 'deprecated')),
    accuracy_threshold DECIMAL(3,2) DEFAULT 0.85 CHECK (accuracy_threshold >= 0 AND accuracy_threshold <= 1),
    testing_scenarios JSONB DEFAULT '[]',

    -- Compliance
    hipaa_relevant BOOLEAN DEFAULT false,
    phi_handling_rules JSONB DEFAULT '{}',
    compliance_tags TEXT[],

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived'))
);

-- Create agent_prompts junction table
CREATE TABLE IF NOT EXISTS agent_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false, -- Is this the default prompt for this capability?
    customizations JSONB DEFAULT '{}', -- Agent-specific prompt customizations
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, prompt_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_domain ON prompts(domain);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_agent_id ON agent_prompts(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_prompt_id ON agent_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_agent_prompts_default ON agent_prompts(agent_id, is_default) WHERE is_default = true;

-- Create update trigger
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompts ENABLE ROW LEVEL SECURITY;

-- Policies for prompts
CREATE POLICY "prompts_read_policy" ON prompts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "prompts_admin_write_policy" ON prompts
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

-- Policies for agent_prompts
CREATE POLICY "agent_prompts_read_policy" ON agent_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "agent_prompts_admin_write_policy" ON agent_prompts
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );