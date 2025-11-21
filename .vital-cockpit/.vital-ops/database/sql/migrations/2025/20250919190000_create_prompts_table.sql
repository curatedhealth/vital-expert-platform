-- Create prompts table for batch upload functionality
-- This table stores reusable prompt templates for the VITAL Path platform

CREATE TABLE IF NOT EXISTS prompts (
    -- Core Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('simple', 'moderate', 'complex')),
    estimated_duration_hours DECIMAL(4,2),

    -- Core Prompt Configuration
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,

    -- Input/Output Specifications
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',

    -- Quality and Validation
    success_criteria JSONB DEFAULT '{}',
    validation_rules JSONB DEFAULT '{}',

    -- Prerequisites and Dependencies
    prerequisite_capabilities TEXT[] DEFAULT '{}',
    prerequisite_prompts TEXT[] DEFAULT '{}',
    model_requirements JSONB DEFAULT '{}',

    -- Metadata
    compliance_tags TEXT[] DEFAULT '{}',
    estimated_tokens INTEGER,
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_domain ON prompts(domain);
CREATE INDEX IF NOT EXISTS idx_prompts_complexity ON prompts(complexity_level);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);
-- CREATE INDEX IF NOT EXISTS idx_prompts_capabilities ON prompts USING GIN(prerequisite_capabilities); -- Will be created by later migrations
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(compliance_tags);

-- Create prompt-capability relationship table
CREATE TABLE IF NOT EXISTS prompt_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(prompt_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_capabilities_prompt ON prompt_capabilities(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_capabilities_capability ON prompt_capabilities(capability_id);

-- Create update trigger for prompts
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompts
CREATE POLICY "Public prompts are viewable by everyone"
    ON prompts FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can create prompts"
    ON prompts FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update their own prompts"
    ON prompts FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own prompts"
    ON prompts FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- RLS Policies for prompt_capabilities
CREATE POLICY "Prompt capabilities are viewable with prompt access"
    ON prompt_capabilities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_capabilities.prompt_id
            AND prompts.is_active = true
        )
    );

CREATE POLICY "Authenticated users can manage prompt capabilities"
    ON prompt_capabilities FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM prompts
            WHERE prompts.id = prompt_capabilities.prompt_id
            AND prompts.created_by = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE prompts IS 'Reusable prompt templates for the VITAL Path platform';
COMMENT ON COLUMN prompts.name IS 'Unique identifier for the prompt (kebab-case)';
COMMENT ON COLUMN prompts.display_name IS 'Human-readable name for the prompt';
COMMENT ON COLUMN prompts.system_prompt IS 'System-level prompt instructions';
COMMENT ON COLUMN prompts.user_prompt_template IS 'Template with placeholders for user input';
COMMENT ON COLUMN prompts.input_schema IS 'JSON schema defining expected input parameters';
COMMENT ON COLUMN prompts.output_schema IS 'JSON schema defining expected output format';
COMMENT ON COLUMN prompts.success_criteria IS 'Criteria for evaluating prompt success';
COMMENT ON COLUMN prompts.validation_rules IS 'Rules for validating input and output';
COMMENT ON COLUMN prompts.prerequisite_capabilities IS 'Array of capability names required';
COMMENT ON COLUMN prompts.model_requirements IS 'AI model configuration requirements';
COMMENT ON COLUMN prompts.compliance_tags IS 'Regulatory/compliance tags (FDA, HIPAA, etc)';

COMMENT ON TABLE prompt_capabilities IS 'Many-to-many relationship between prompts and capabilities';