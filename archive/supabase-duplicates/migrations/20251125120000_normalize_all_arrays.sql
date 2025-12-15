-- Migration: Normalize all array/JSONB fields to proper junction tables
-- This enables proper querying, filtering, and indexing of all data

-- ============================================================================
-- 1. LLM MODELS - Reference table for allowed LLM models
-- ============================================================================
CREATE TABLE IF NOT EXISTS llm_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL, -- openai, anthropic, etc.
    model_family VARCHAR(50), -- gpt-4, claude-3, etc.
    context_window INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: agent_levels <-> llm_models
CREATE TABLE IF NOT EXISTS agent_level_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_level_id UUID NOT NULL REFERENCES agent_levels(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES llm_models(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_level_id, model_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_level_models_level ON agent_level_models(agent_level_id);
CREATE INDEX IF NOT EXISTS idx_agent_level_models_model ON agent_level_models(model_id);

-- ============================================================================
-- 2. CHARACTERISTICS - Reference table for agent characteristics
-- ============================================================================
CREATE TABLE IF NOT EXISTS characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- cognitive, behavioral, technical
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: agent_levels <-> characteristics
CREATE TABLE IF NOT EXISTS agent_level_characteristics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_level_id UUID NOT NULL REFERENCES agent_levels(id) ON DELETE CASCADE,
    characteristic_id UUID NOT NULL REFERENCES characteristics(id) ON DELETE CASCADE,
    importance INTEGER DEFAULT 1, -- 1-5 scale
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_level_id, characteristic_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_level_chars_level ON agent_level_characteristics(agent_level_id);
CREATE INDEX IF NOT EXISTS idx_agent_level_chars_char ON agent_level_characteristics(characteristic_id);

-- ============================================================================
-- 3. USE CASES - Reference table for typical use cases
-- ============================================================================
CREATE TABLE IF NOT EXISTS use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- strategic, operational, technical
    complexity_level VARCHAR(20), -- low, medium, high
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: agent_levels <-> use_cases
CREATE TABLE IF NOT EXISTS agent_level_use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_level_id UUID NOT NULL REFERENCES agent_levels(id) ON DELETE CASCADE,
    use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_level_id, use_case_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_level_uc_level ON agent_level_use_cases(agent_level_id);
CREATE INDEX IF NOT EXISTS idx_agent_level_uc_case ON agent_level_use_cases(use_case_id);

-- ============================================================================
-- 4. TAGS - Universal reference table for all tags
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    tag_type VARCHAR(50) NOT NULL, -- skill, capability, general
    description TEXT,
    color VARCHAR(7), -- hex color
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(slug, tag_type)
);

CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Junction: skills <-> tags
CREATE TABLE IF NOT EXISTS skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(skill_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_tags_skill ON skill_tags(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_tags_tag ON skill_tags(tag_id);

-- Junction: capabilities <-> tags
CREATE TABLE IF NOT EXISTS capability_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(capability_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_capability_tags_cap ON capability_tags(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_tags_tag ON capability_tags(tag_id);

-- ============================================================================
-- 5. SKILL PREREQUISITES - Self-referential junction for skill dependencies
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    prerequisite_skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    proficiency_required VARCHAR(20) DEFAULT 'basic', -- basic, intermediate, advanced
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(skill_id, prerequisite_skill_id),
    CHECK (skill_id != prerequisite_skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_prereq_skill ON skill_prerequisites(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_prereq_prereq ON skill_prerequisites(prerequisite_skill_id);

-- ============================================================================
-- 6. LEARNING RESOURCES - Reference table for skill learning resources
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    resource_type VARCHAR(50) NOT NULL, -- documentation, video, course, article, tutorial
    url TEXT,
    description TEXT,
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    estimated_duration_minutes INTEGER,
    provider VARCHAR(100), -- Coursera, Udemy, internal, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_type ON learning_resources(resource_type);

-- Junction: skills <-> learning_resources
CREATE TABLE IF NOT EXISTS skill_learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(skill_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_lr_skill ON skill_learning_resources(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_lr_resource ON skill_learning_resources(resource_id);

-- ============================================================================
-- Enable RLS on all new tables
-- ============================================================================
ALTER TABLE llm_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_level_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_level_characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_level_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE capability_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_learning_resources ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables
CREATE POLICY "Allow all on llm_models" ON llm_models FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on agent_level_models" ON agent_level_models FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on characteristics" ON characteristics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on agent_level_characteristics" ON agent_level_characteristics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on use_cases" ON use_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on agent_level_use_cases" ON agent_level_use_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tags" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_tags" ON skill_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on capability_tags" ON capability_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_prerequisites" ON skill_prerequisites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on learning_resources" ON learning_resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_learning_resources" ON skill_learning_resources FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Add comments
-- ============================================================================
COMMENT ON TABLE llm_models IS 'Reference table for LLM models available in the system';
COMMENT ON TABLE agent_level_models IS 'Junction table linking agent levels to allowed LLM models';
COMMENT ON TABLE characteristics IS 'Reference table for agent characteristics/traits';
COMMENT ON TABLE agent_level_characteristics IS 'Junction table linking agent levels to their key characteristics';
COMMENT ON TABLE use_cases IS 'Reference table for typical use cases';
COMMENT ON TABLE agent_level_use_cases IS 'Junction table linking agent levels to their typical use cases';
COMMENT ON TABLE tags IS 'Universal tags table for skills, capabilities, and other entities';
COMMENT ON TABLE skill_tags IS 'Junction table linking skills to tags';
COMMENT ON TABLE capability_tags IS 'Junction table linking capabilities to tags';
COMMENT ON TABLE skill_prerequisites IS 'Self-referential junction table for skill dependencies';
COMMENT ON TABLE learning_resources IS 'Reference table for learning resources (courses, docs, videos)';
COMMENT ON TABLE skill_learning_resources IS 'Junction table linking skills to learning resources';

