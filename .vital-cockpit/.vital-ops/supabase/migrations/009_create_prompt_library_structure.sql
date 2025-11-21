-- ============================================================================
-- PROMPTS™ Framework - Prompt Library Database Structure
-- ============================================================================
-- Purpose: Create normalized tables for prompt suites, subsuites, and prompts
-- Version: 1.0.0
-- Date: 2025-01-17
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. CLEANUP - Drop existing tables if they exist
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS prompt_validations CASCADE;
DROP TABLE IF EXISTS prompt_performance CASCADE;
DROP TABLE IF EXISTS prompt_variables CASCADE;
DROP TABLE IF EXISTS prompt_examples CASCADE;
DROP TABLE IF EXISTS suite_prompts CASCADE;
DROP TABLE IF EXISTS agent_prompts CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS prompt_library CASCADE;
DROP TABLE IF EXISTS prompt_sub_suites CASCADE;
DROP TABLE IF EXISTS prompt_suites CASCADE;

-- ----------------------------------------------------------------------------
-- 1. PROMPT SUITES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE prompt_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_code VARCHAR(20) NOT NULL UNIQUE,
    suite_name VARCHAR(255) NOT NULL,
    suite_full_name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    purpose TEXT,
    target_roles TEXT[],
    coverage_areas TEXT[],
    icon VARCHAR(50),
    color VARCHAR(20),
    prompt_count INTEGER DEFAULT 0,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_prompt_suites_code ON prompt_suites(suite_code);
CREATE INDEX idx_prompt_suites_active ON prompt_suites(is_active);

-- ----------------------------------------------------------------------------
-- 2. PROMPT SUB-SUITES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE prompt_sub_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suite_id UUID NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,
    sub_suite_code VARCHAR(20) NOT NULL,
    sub_suite_name VARCHAR(255) NOT NULL,
    sub_suite_full_name TEXT NOT NULL,
    description TEXT,
    purpose TEXT,
    prompt_count INTEGER DEFAULT 0,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Unique constraint: sub_suite_code must be unique within a suite
    UNIQUE(suite_id, sub_suite_code)
);

-- Indexes for performance
CREATE INDEX idx_prompt_sub_suites_suite ON prompt_sub_suites(suite_id);
CREATE INDEX idx_prompt_sub_suites_code ON prompt_sub_suites(sub_suite_code);
CREATE INDEX idx_prompt_sub_suites_active ON prompt_sub_suites(is_active);

-- ----------------------------------------------------------------------------
-- 3. ENHANCED PROMPTS TABLE
-- ----------------------------------------------------------------------------
-- Create new prompts table with proper normalization
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identification
    prompt_code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500),
    description TEXT,

    -- Content
    content TEXT NOT NULL,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('system', 'user', 'assistant')),

    -- Classification
    category VARCHAR(50),
    function VARCHAR(100),
    task_type VARCHAR(100),
    complexity VARCHAR(20) CHECK (complexity IN ('basic', 'intermediate', 'advanced', 'expert')),

    -- Prompt Engineering
    pattern_type VARCHAR(50),
    system_prompt TEXT,
    user_template TEXT,

    -- Metadata
    tags TEXT[],
    variables TEXT[],
    estimated_time_minutes INTEGER,

    -- Performance Metrics
    accuracy_clinical DECIMAL(5,2),
    accuracy_regulatory DECIMAL(5,2),
    user_satisfaction DECIMAL(3,2),
    avg_latency_ms INTEGER,
    usage_count INTEGER DEFAULT 0,

    -- Validation
    expert_validated BOOLEAN DEFAULT FALSE,
    validation_date TIMESTAMP,
    validator_name VARCHAR(255),
    validator_credentials VARCHAR(255),

    -- Version Control
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- RAG Configuration
    rag_enabled BOOLEAN DEFAULT FALSE,
    rag_context_sources TEXT[]
);

-- Indexes for prompts table
CREATE INDEX idx_prompts_code ON prompts(prompt_code);
CREATE INDEX idx_prompts_slug ON prompts(slug);
CREATE INDEX idx_prompts_role_type ON prompts(role_type);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_complexity ON prompts(complexity);
CREATE INDEX idx_prompts_active ON prompts(is_active);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);

-- ----------------------------------------------------------------------------
-- 4. JUNCTION TABLE: SUITE_PROMPTS
-- ----------------------------------------------------------------------------
-- Links prompts to suites and sub-suites
CREATE TABLE suite_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    suite_id UUID NOT NULL REFERENCES prompt_suites(id) ON DELETE CASCADE,
    sub_suite_id UUID REFERENCES prompt_sub_suites(id) ON DELETE CASCADE,

    -- Ordering
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Partial unique indexes (handling NULL sub_suite_id)
CREATE UNIQUE INDEX idx_suite_prompts_unique_with_sub
ON suite_prompts(prompt_id, suite_id, sub_suite_id)
WHERE sub_suite_id IS NOT NULL;

CREATE UNIQUE INDEX idx_suite_prompts_unique_without_sub
ON suite_prompts(prompt_id, suite_id)
WHERE sub_suite_id IS NULL;

-- Performance indexes
CREATE INDEX idx_suite_prompts_prompt ON suite_prompts(prompt_id);
CREATE INDEX idx_suite_prompts_suite ON suite_prompts(suite_id);
CREATE INDEX idx_suite_prompts_sub_suite ON suite_prompts(sub_suite_id);

-- ----------------------------------------------------------------------------
-- 5. PROMPT EXAMPLES TABLE
-- ----------------------------------------------------------------------------
-- Store few-shot examples separately (normalized)
CREATE TABLE prompt_examples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

    example_title VARCHAR(255),
    example_input TEXT NOT NULL,
    example_output TEXT NOT NULL,
    example_context TEXT,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompt_examples_prompt ON prompt_examples(prompt_id);

-- ----------------------------------------------------------------------------
-- 6. PROMPT VARIABLES TABLE
-- ----------------------------------------------------------------------------
-- Store prompt variable definitions
CREATE TABLE prompt_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

    variable_name VARCHAR(100) NOT NULL,
    variable_type VARCHAR(50) NOT NULL,
    description TEXT,
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    validation_pattern TEXT,

    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(prompt_id, variable_name)
);

CREATE INDEX idx_prompt_variables_prompt ON prompt_variables(prompt_id);

-- ----------------------------------------------------------------------------
-- 7. PROMPT PERFORMANCE TRACKING TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE prompt_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

    user_id UUID,
    session_id UUID,

    -- Performance Metrics
    execution_time_ms INTEGER,
    tokens_used INTEGER,

    -- User Feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),
    clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),

    task_completed BOOLEAN,
    feedback_text TEXT,

    executed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompt_performance_prompt ON prompt_performance(prompt_id);
CREATE INDEX idx_prompt_performance_user ON prompt_performance(user_id);
CREATE INDEX idx_prompt_performance_executed ON prompt_performance(executed_at);

-- ----------------------------------------------------------------------------
-- 8. PROMPT VALIDATION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE prompt_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

    validator_name VARCHAR(255) NOT NULL,
    validator_credentials VARCHAR(255),
    validator_specialty VARCHAR(100),

    -- Validation Scores (1-10 scale)
    accuracy_score INTEGER CHECK (accuracy_score BETWEEN 1 AND 10),
    safety_score INTEGER CHECK (safety_score BETWEEN 1 AND 10),
    compliance_score INTEGER CHECK (compliance_score BETWEEN 1 AND 10),
    clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 10),

    comments TEXT,
    approved BOOLEAN DEFAULT FALSE,

    validated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompt_validations_prompt ON prompt_validations(prompt_id);
CREATE INDEX idx_prompt_validations_approved ON prompt_validations(approved);

-- ----------------------------------------------------------------------------
-- 9. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Function to update prompt count in suites
CREATE OR REPLACE FUNCTION update_suite_prompt_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update suite prompt count
    UPDATE prompt_suites
    SET prompt_count = (
        SELECT COUNT(DISTINCT sp.prompt_id)
        FROM suite_prompts sp
        WHERE sp.suite_id = NEW.suite_id
    ),
    updated_at = NOW()
    WHERE id = NEW.suite_id;

    -- Update sub-suite prompt count if applicable
    IF NEW.sub_suite_id IS NOT NULL THEN
        UPDATE prompt_sub_suites
        SET prompt_count = (
            SELECT COUNT(DISTINCT sp.prompt_id)
            FROM suite_prompts sp
            WHERE sp.sub_suite_id = NEW.sub_suite_id
        ),
        updated_at = NOW()
        WHERE id = NEW.sub_suite_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update counts
CREATE TRIGGER trigger_update_suite_prompt_count
AFTER INSERT OR UPDATE OR DELETE ON suite_prompts
FOR EACH ROW
EXECUTE FUNCTION update_suite_prompt_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER trigger_prompt_suites_updated_at
BEFORE UPDATE ON prompt_suites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_prompt_sub_suites_updated_at
BEFORE UPDATE ON prompt_sub_suites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS (adjust based on your RLS policies)
-- ============================================================================

-- Grant permissions to authenticated users (adjust as needed)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Prompt Library Structure Created Successfully';
    RAISE NOTICE '   - prompt_suites table';
    RAISE NOTICE '   - prompt_sub_suites table';
    RAISE NOTICE '   - prompts table';
    RAISE NOTICE '   - suite_prompts junction table';
    RAISE NOTICE '   - prompt_examples table';
    RAISE NOTICE '   - prompt_variables table';
    RAISE NOTICE '   - prompt_performance table';
    RAISE NOTICE '   - prompt_validations table';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Step: Run population script to insert PROMPTS™ Framework data';
END $$;
