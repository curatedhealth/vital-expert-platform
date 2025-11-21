-- Enhance prompts schema for PRISM™ Enterprise Healthcare Prompt Library
-- This migration adds support for the comprehensive PRISM™ framework

-- First, ensure the base prompts table exists with correct structure
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

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompts' AND column_name = 'tags') THEN
        ALTER TABLE prompts ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create prompt systems table
CREATE TABLE IF NOT EXISTS prompt_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    format_type VARCHAR(50) NOT NULL, -- 'acronym', 'agent_spec', 'structured_template'
    variable_format VARCHAR(50) NOT NULL, -- '{simple_placeholders}', 'structured_schemas', '{{double_braces}}'
    execution_mode VARCHAR(50) NOT NULL, -- 'manual', 'semi_automated', 'fully_automated'
    training_required VARCHAR(50) DEFAULT 'minimal', -- 'minimal', 'moderate', 'technical'
    best_for TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create prompt domains table
CREATE TABLE IF NOT EXISTS prompt_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create complexity levels table
CREATE TABLE IF NOT EXISTS complexity_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    typical_time_min INTEGER, -- typical time in minutes
    typical_time_max INTEGER,
    user_level VARCHAR(50), -- 'entry', 'intermediate', 'experienced', 'expert', 'specialist'
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create prompt categories table (subcategories within domains)
CREATE TABLE IF NOT EXISTS prompt_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES prompt_domains(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(domain_id, name)
);

-- Create variable placeholders table
CREATE TABLE IF NOT EXISTS prompt_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    variable_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    variable_type VARCHAR(50) NOT NULL, -- 'text', 'select', 'multi_select', 'date', 'number', 'json'
    is_required BOOLEAN DEFAULT true,
    default_value TEXT,
    validation_rules JSONB DEFAULT '{}',
    options JSONB DEFAULT '[]', -- for select/multi_select types
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(prompt_id, variable_name)
);

-- Create prompt relationships table
CREATE TABLE IF NOT EXISTS prompt_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    child_prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'prerequisite', 'follow_up', 'alternative', 'enhancement'
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(parent_prompt_id, child_prompt_id, relationship_type)
);

-- Create prompt templates table for reusable components
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- 'framework', 'section', 'output_format', 'success_criteria'
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    usage_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create prompt usage analytics table
CREATE TABLE IF NOT EXISTS prompt_usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    execution_time_seconds INTEGER,
    success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
    completion_status VARCHAR(50), -- 'completed', 'partial', 'failed', 'abandoned'
    feedback TEXT,
    variables_used JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alter existing prompts table to add new PRISM™ specific fields
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS prompt_system_id UUID REFERENCES prompt_systems(id),
ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES prompt_domains(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES prompt_categories(id),
ADD COLUMN IF NOT EXISTS complexity_level_id UUID REFERENCES complexity_levels(id),
ADD COLUMN IF NOT EXISTS acronym VARCHAR(50), -- for PRISM™ acronym prompts
ADD COLUMN IF NOT EXISTS framework_components JSONB DEFAULT '{}', -- analysis steps, deliverables, etc.
ADD COLUMN IF NOT EXISTS target_users TEXT[], -- target user types
ADD COLUMN IF NOT EXISTS use_cases TEXT[], -- primary use cases
ADD COLUMN IF NOT EXISTS regulatory_requirements TEXT[], -- specific regulatory needs
ADD COLUMN IF NOT EXISTS integration_points JSONB DEFAULT '{}', -- how it integrates with other systems
ADD COLUMN IF NOT EXISTS customization_guide TEXT, -- instructions for customization
ADD COLUMN IF NOT EXISTS quality_assurance JSONB DEFAULT '{}'; -- QA checklist and requirements

-- Update complexity_level column to reference the new table
-- First, we'll keep the old column for migration purposes

-- Create basic indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_prompts_name ON prompts(name);
CREATE INDEX IF NOT EXISTS idx_prompts_domain ON prompts(domain);
CREATE INDEX IF NOT EXISTS idx_prompts_complexity ON prompts(complexity_level);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON prompts(is_active);
-- CREATE INDEX IF NOT EXISTS idx_prompts_capabilities ON prompts USING GIN(prerequisite_capabilities); -- Column will be added in later migration
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(compliance_tags);

-- Create PRISM™ enhanced indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_system ON prompts(prompt_system_id);
CREATE INDEX IF NOT EXISTS idx_prompts_domain ON prompts(domain_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_complexity_level ON prompts(complexity_level_id);
CREATE INDEX IF NOT EXISTS idx_prompts_acronym ON prompts(acronym);
CREATE INDEX IF NOT EXISTS idx_prompts_target_users ON prompts USING GIN(target_users);
CREATE INDEX IF NOT EXISTS idx_prompts_use_cases ON prompts USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_prompts_regulatory ON prompts USING GIN(regulatory_requirements);

CREATE INDEX IF NOT EXISTS idx_prompt_variables_prompt ON prompt_variables(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_variables_type ON prompt_variables(variable_type);
CREATE INDEX IF NOT EXISTS idx_prompt_variables_required ON prompt_variables(is_required);

CREATE INDEX IF NOT EXISTS idx_prompt_relationships_parent ON prompt_relationships(parent_prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_relationships_child ON prompt_relationships(child_prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_relationships_type ON prompt_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_type ON prompt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_name ON prompt_templates(name);

CREATE INDEX IF NOT EXISTS idx_prompt_usage_prompt ON prompt_usage_analytics(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_user ON prompt_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_date ON prompt_usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_usage_rating ON prompt_usage_analytics(success_rating);

-- Create basic prompts table trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompts_updated_at') THEN
        CREATE TRIGGER update_prompts_updated_at
            BEFORE UPDATE ON prompts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create update triggers for new tables (with existence checks)
DO $$
BEGIN
    -- Trigger for prompt_systems
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompt_systems_updated_at') THEN
        CREATE TRIGGER update_prompt_systems_updated_at
            BEFORE UPDATE ON prompt_systems
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger for prompt_domains
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompt_domains_updated_at') THEN
        CREATE TRIGGER update_prompt_domains_updated_at
            BEFORE UPDATE ON prompt_domains
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger for prompt_templates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompt_templates_updated_at') THEN
        CREATE TRIGGER update_prompt_templates_updated_at
            BEFORE UPDATE ON prompt_templates
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on prompts table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'prompts' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create basic RLS policies for prompts if they don't exist
DO $$
BEGIN
    -- Public prompts are viewable by everyone
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Public prompts are viewable by everyone') THEN
        CREATE POLICY "Public prompts are viewable by everyone"
            ON prompts FOR SELECT
            USING (is_active = true);
    END IF;

    -- Authenticated users can create prompts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Authenticated users can create prompts') THEN
        CREATE POLICY "Authenticated users can create prompts"
            ON prompts FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;

    -- Users can update their own prompts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Users can update their own prompts') THEN
        CREATE POLICY "Users can update their own prompts"
            ON prompts FOR UPDATE
            TO authenticated
            USING (created_by = auth.uid());
    END IF;

    -- Users can delete their own prompts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompts' AND policyname = 'Users can delete their own prompts') THEN
        CREATE POLICY "Users can delete their own prompts"
            ON prompts FOR DELETE
            TO authenticated
            USING (created_by = auth.uid());
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE prompt_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE complexity_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reference data (public read) - with existence checks
DO $$
BEGIN
    -- Policy for prompt_systems
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_systems' AND policyname = 'Public read access to prompt systems') THEN
        CREATE POLICY "Public read access to prompt systems" ON prompt_systems FOR SELECT USING (true);
    END IF;

    -- Policy for prompt_domains
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_domains' AND policyname = 'Public read access to prompt domains') THEN
        CREATE POLICY "Public read access to prompt domains" ON prompt_domains FOR SELECT USING (true);
    END IF;

    -- Policy for complexity_levels
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'complexity_levels' AND policyname = 'Public read access to complexity levels') THEN
        CREATE POLICY "Public read access to complexity levels" ON complexity_levels FOR SELECT USING (true);
    END IF;

    -- Policy for prompt_categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_categories' AND policyname = 'Public read access to prompt categories') THEN
        CREATE POLICY "Public read access to prompt categories" ON prompt_categories FOR SELECT USING (true);
    END IF;

    -- Policy for prompt_templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_templates' AND policyname = 'Public read access to prompt templates') THEN
        CREATE POLICY "Public read access to prompt templates" ON prompt_templates FOR SELECT USING (true);
    END IF;
END $$;

-- RLS Policies for prompt variables, relationships, and analytics - with existence checks
DO $$
BEGIN
    -- Policy for prompt variables
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_variables' AND policyname = 'Prompt variables follow prompt access') THEN
        CREATE POLICY "Prompt variables follow prompt access" ON prompt_variables FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM prompts
                    WHERE prompts.id = prompt_variables.prompt_id
                    AND prompts.is_active = true
                )
            );
    END IF;

    -- Policy for prompt relationships
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_relationships' AND policyname = 'Prompt relationships follow prompt access') THEN
        CREATE POLICY "Prompt relationships follow prompt access" ON prompt_relationships FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM prompts
                    WHERE prompts.id = prompt_relationships.parent_prompt_id
                    AND prompts.is_active = true
                )
            );
    END IF;

    -- Policy for usage analytics - view own data
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_usage_analytics' AND policyname = 'Users can view their own usage analytics') THEN
        CREATE POLICY "Users can view their own usage analytics" ON prompt_usage_analytics FOR SELECT
            TO authenticated
            USING (user_id = auth.uid());
    END IF;

    -- Policy for usage analytics - insert own data
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_usage_analytics' AND policyname = 'Users can insert their own usage analytics') THEN
        CREATE POLICY "Users can insert their own usage analytics" ON prompt_usage_analytics FOR INSERT
            TO authenticated
            WITH CHECK (user_id = auth.uid());
    END IF;

    -- Admin policy for prompt systems (only if user_profiles table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_systems' AND policyname = 'Admins can manage prompt systems') THEN
            CREATE POLICY "Admins can manage prompt systems" ON prompt_systems FOR ALL
                TO authenticated
                USING (
                    EXISTS (
                        SELECT 1 FROM user_profiles
                        WHERE user_profiles.id = auth.uid()
                        AND user_profiles.role IN ('admin', 'super_admin')
                    )
                );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prompt_domains' AND policyname = 'Admins can manage prompt domains') THEN
            CREATE POLICY "Admins can manage prompt domains" ON prompt_domains FOR ALL
                TO authenticated
                USING (
                    EXISTS (
                        SELECT 1 FROM user_profiles
                        WHERE user_profiles.id = auth.uid()
                        AND user_profiles.role IN ('admin', 'super_admin')
                    )
                );
        END IF;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE prompt_systems IS 'Different prompt systems (PRISM™ Acronym, VITAL Path, Digital Health Structured)';
COMMENT ON TABLE prompt_domains IS 'Healthcare domains (Medical Affairs, Compliance, Commercial, etc.)';
COMMENT ON TABLE complexity_levels IS 'Complexity levels with time estimates and user requirements';
COMMENT ON TABLE prompt_categories IS 'Subcategories within domains for better organization';
COMMENT ON TABLE prompt_variables IS 'Variable placeholders for dynamic prompt generation';
COMMENT ON TABLE prompt_relationships IS 'Relationships between prompts (prerequisites, follow-ups, etc.)';
COMMENT ON TABLE prompt_templates IS 'Reusable components for building prompts';
COMMENT ON TABLE prompt_usage_analytics IS 'Analytics and feedback for prompt usage';

COMMENT ON COLUMN prompts.acronym IS 'PRISM™ acronym for memorable identification';
COMMENT ON COLUMN prompts.framework_components IS 'JSON structure defining analysis steps, deliverables, etc.';
COMMENT ON COLUMN prompts.target_users IS 'Array of target user types (business users, managers, etc.)';
COMMENT ON COLUMN prompts.use_cases IS 'Array of primary use cases';
COMMENT ON COLUMN prompts.regulatory_requirements IS 'Array of regulatory compliance requirements';
COMMENT ON COLUMN prompts.integration_points IS 'JSON defining integration with other systems';
COMMENT ON COLUMN prompts.customization_guide IS 'Instructions for adapting the prompt';
COMMENT ON COLUMN prompts.quality_assurance IS 'QA checklist and quality requirements';
