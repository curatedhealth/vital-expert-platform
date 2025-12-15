-- Create prompts table for CSV import
-- Run this SQL in your Supabase SQL Editor before running the sync script

CREATE TABLE IF NOT EXISTS prompts (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Prompt Definition
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT,
    execution_instructions JSONB DEFAULT '{}',
    success_criteria JSONB DEFAULT '{}',
    
    -- Prompt Configuration
    model_requirements JSONB DEFAULT '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 2000}',
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',
    
    -- Classification
    complexity_level VARCHAR(20) DEFAULT 'intermediate' CHECK (complexity_level IN ('basic', 'intermediate', 'advanced', 'expert')),
    domain VARCHAR(100) NOT NULL DEFAULT 'general',
    estimated_tokens INTEGER DEFAULT 1000,
    
    -- Dependencies
    prerequisite_prompts TEXT[],
    prerequisite_capabilities TEXT[] DEFAULT '{}',
    related_capabilities TEXT[],
    required_context TEXT[],
    
    -- Validation & Quality
    validation_status VARCHAR(20) DEFAULT 'active' CHECK (validation_status IN ('active', 'inactive', 'beta', 'deprecated')),
    accuracy_threshold DECIMAL(3,2) DEFAULT 0.85 CHECK (accuracy_threshold >= 0 AND accuracy_threshold <= 1),
    testing_scenarios JSONB DEFAULT '[]',
    
    -- Compliance
    hipaa_relevant BOOLEAN DEFAULT false,
    phi_handling_rules JSONB DEFAULT '{}',
    compliance_tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_domain ON prompts(domain);
CREATE INDEX IF NOT EXISTS idx_prompts_complexity ON prompts(complexity_level);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_validation_status ON prompts(validation_status);
CREATE INDEX IF NOT EXISTS idx_prompts_capabilities ON prompts USING GIN(prerequisite_capabilities);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(compliance_tags);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

