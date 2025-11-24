-- ============================================================================
-- CREATE COMPLETE PERSONA SCHEMA (Base + Gen AI)
-- This script creates all required types, tables, and indexes
-- Fully normalized - NO JSONB fields
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: CORE ENUMERATIONS
-- ============================================================================

-- Archetype Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'archetype_type') THEN
        CREATE TYPE archetype_type AS ENUM (
            'AUTOMATOR',      -- High AI maturity + Routine work
            'ORCHESTRATOR',   -- High AI maturity + Strategic work
            'LEARNER',        -- Low AI maturity + Routine work
            'SKEPTIC'         -- Low AI maturity + Strategic work
        );
    END IF;
END $$;

-- Seniority Level
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seniority_level') THEN
        CREATE TYPE seniority_level AS ENUM (
            'entry',
            'mid',
            'senior',
            'director',
            'executive',
            'c_suite'
        );
    END IF;
END $$;

-- Business Function (optional - only create if needed for opportunities table)
-- Note: Your schema uses function_id (UUID) instead of business_function enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_function') THEN
        CREATE TYPE business_function AS ENUM (
            'MEDICAL_AFFAIRS', 'SALES', 'MARKETING', 'FINANCE', 'HR',
            'ENGINEERING', 'PRODUCT', 'OPERATIONS', 'CUSTOMER_SUCCESS',
            'LEGAL', 'REGULATORY', 'SUPPLY_CHAIN', 'R_AND_D',
            'MARKET_ACCESS', 'IT', 'CORPORATE_STRATEGY'
        );
    END IF;
END $$;

-- Work Pattern
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_pattern') THEN
        CREATE TYPE work_pattern AS ENUM (
            'routine',        -- Repetitive, predictable tasks
            'strategic',      -- Variable, cross-functional, complex
            'mixed'           -- Combination of both
        );
    END IF;
END $$;

-- Technology Adoption
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'technology_adoption') THEN
        CREATE TYPE technology_adoption AS ENUM (
            'laggard',
            'late_majority',
            'early_majority',
            'early_adopter',
            'innovator'
        );
    END IF;
END $$;

-- Risk Tolerance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_tolerance') THEN
        CREATE TYPE risk_tolerance AS ENUM (
            'very_conservative',
            'conservative',
            'moderate',
            'aggressive'
        );
    END IF;
END $$;

-- Change Readiness
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'change_readiness') THEN
        CREATE TYPE change_readiness AS ENUM (
            'low',
            'moderate',
            'high'
        );
    END IF;
END $$;

-- Budget Authority Level
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'budget_authority_level') THEN
        CREATE TYPE budget_authority_level AS ENUM (
            'none',
            'limited',          -- < $100K
            'moderate',         -- $100K - $1M
            'significant',      -- $1M - $5M
            'high'              -- > $5M
        );
    END IF;
END $$;

-- Geographic Scope
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geographic_scope') THEN
        CREATE TYPE geographic_scope AS ENUM (
            'local',
            'country',
            'regional',
            'global'
        );
    END IF;
END $$;

-- Decision Making Style
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'decision_making_style') THEN
        CREATE TYPE decision_making_style AS ENUM (
            'data_driven',
            'analytical',
            'collaborative',
            'relationship_driven',
            'authoritative',
            'cautious',
            'intuitive'
        );
    END IF;
END $$;

-- Service Layer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_layer') THEN
        CREATE TYPE service_layer AS ENUM (
            'ASK_EXPERT',       -- L1: Single-agent Q&A
            'ASK_PANEL',        -- L2: Multi-agent reasoning
            'WORKFLOWS',        -- L3: Multi-step automation
            'SOLUTION_BUILDER'  -- L4: Integrated solutions
        );
    END IF;
END $$;

-- Gen AI Opportunity Type (for Gen AI migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gen_ai_opportunity_type') THEN
        CREATE TYPE gen_ai_opportunity_type AS ENUM (
            'automation',        -- Workflow automation, template generation
            'augmentation',      -- Intelligence augmentation, multi-agent reasoning
            'learning',          -- Guided learning, progressive complexity
            'transparency',      -- Trust building, validation, citations
            'integration'        -- Cross-functional, multi-service layer
        );
    END IF;
END $$;

-- Service Layer Preference (for Gen AI migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_layer_preference') THEN
        CREATE TYPE service_layer_preference AS ENUM (
            'ASK_EXPERT',           -- Prefers single-agent Q&A
            'ASK_PANEL',            -- Prefers multi-agent reasoning
            'WORKFLOWS',            -- Prefers automated workflows
            'SOLUTION_BUILDER',     -- Prefers integrated solutions
            'MIXED'                 -- Uses multiple service layers
        );
    END IF;
END $$;

-- Gen AI Readiness Level (for Gen AI migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gen_ai_readiness_level') THEN
        CREATE TYPE gen_ai_readiness_level AS ENUM (
            'not_ready',        -- 0-25: Low readiness
            'exploring',        -- 26-50: Exploring, learning
            'ready',            -- 51-75: Ready for adoption
            'advanced'          -- 76-100: Advanced user
        );
    END IF;
END $$;

-- ============================================================================
-- SECTION 2: CORE PERSONAS TABLE
-- ============================================================================

-- Create personas table only if it doesn't exist
-- If it exists, we'll just add missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas' AND table_schema = 'public') THEN
        -- Create new table
        CREATE TABLE personas (
            -- Primary Key
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            
            -- Core Profile
            name VARCHAR(255) NOT NULL,
            title VARCHAR(255),
            slug VARCHAR(255) UNIQUE NOT NULL,
            tagline VARCHAR(500),
            
            -- Archetype Assignment
            archetype archetype_type,
            archetype_confidence DECIMAL(5,4) CHECK (archetype_confidence >= 0 AND archetype_confidence <= 1),
            archetype_assigned_at TIMESTAMP WITH TIME ZONE,
            archetype_requires_review BOOLEAN DEFAULT FALSE,
            
            -- Business Context (using IDs - matches your schema)
            function_id UUID,
            department_id UUID,
            role_id UUID,
            role_slug VARCHAR(255),
            
            -- Professional Context
            seniority_level seniority_level,
            years_of_experience INTEGER CHECK (years_of_experience >= 0),
            team_size_typical INTEGER CHECK (team_size_typical >= 0),
            direct_reports INTEGER CHECK (direct_reports >= 0),
            budget_authority DECIMAL(15,2) CHECK (budget_authority >= 0),
            budget_authority_level budget_authority_level,
            
            -- Work Patterns
            work_pattern work_pattern,
            work_complexity_score DECIMAL(5,2) CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100),
            
            -- Behavioral Attributes
            technology_adoption technology_adoption,
            risk_tolerance risk_tolerance,
            change_readiness change_readiness,
            ai_maturity_score DECIMAL(5,2) CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
            
            -- Preferences
            decision_making_style decision_making_style,
            
            -- Geographic & Location
            geographic_scope geographic_scope,
            
            -- Organizational Context
            typical_org_size VARCHAR(100),
            tenant_id UUID,
            
            -- Status & Metadata
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID,
            updated_by UUID,
            version INTEGER DEFAULT 1
        );
    ELSE
        -- Table exists - add missing columns if they don't exist
        -- Archetype columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'archetype') THEN
            ALTER TABLE personas ADD COLUMN archetype archetype_type;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'archetype_confidence') THEN
            ALTER TABLE personas ADD COLUMN archetype_confidence DECIMAL(5,4) CHECK (archetype_confidence >= 0 AND archetype_confidence <= 1);
        END IF;
        
        -- Work pattern columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'work_pattern') THEN
            ALTER TABLE personas ADD COLUMN work_pattern work_pattern;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'work_complexity_score') THEN
            ALTER TABLE personas ADD COLUMN work_complexity_score DECIMAL(5,2) CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100);
        END IF;
        
        -- Behavioral attributes
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'technology_adoption') THEN
            ALTER TABLE personas ADD COLUMN technology_adoption technology_adoption;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'risk_tolerance') THEN
            ALTER TABLE personas ADD COLUMN risk_tolerance risk_tolerance;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'change_readiness') THEN
            ALTER TABLE personas ADD COLUMN change_readiness change_readiness;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'ai_maturity_score') THEN
            ALTER TABLE personas ADD COLUMN ai_maturity_score DECIMAL(5,2) CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100);
        END IF;
        
        -- Other optional columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'budget_authority_level') THEN
            ALTER TABLE personas ADD COLUMN budget_authority_level budget_authority_level;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'geographic_scope') THEN
            ALTER TABLE personas ADD COLUMN geographic_scope geographic_scope;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'decision_making_style') THEN
            ALTER TABLE personas ADD COLUMN decision_making_style decision_making_style;
        END IF;
    END IF;
END $$;

-- Create alias column if it doesn't exist (for compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'personas' AND column_name = 'persona_id'
    ) THEN
        ALTER TABLE personas ADD COLUMN persona_id UUID;
        UPDATE personas SET persona_id = id WHERE persona_id IS NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_personas_persona_id ON personas(persona_id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(archetype);
CREATE INDEX IF NOT EXISTS idx_personas_function_id ON personas(function_id);
CREATE INDEX IF NOT EXISTS idx_personas_department_id ON personas(department_id);
CREATE INDEX IF NOT EXISTS idx_personas_role_id ON personas(role_id);
CREATE INDEX IF NOT EXISTS idx_personas_seniority ON personas(seniority_level);
CREATE INDEX IF NOT EXISTS idx_personas_role_slug ON personas(role_slug);
CREATE INDEX IF NOT EXISTS idx_personas_active ON personas(is_active);
CREATE INDEX IF NOT EXISTS idx_personas_work_pattern ON personas(work_pattern);
CREATE INDEX IF NOT EXISTS idx_personas_slug ON personas(slug);
CREATE INDEX IF NOT EXISTS idx_personas_tenant ON personas(tenant_id);

COMMENT ON TABLE personas IS 'Core persona table - each row represents one persona variant (role + archetype combination)';

-- ============================================================================
-- SECTION 3: PAIN POINTS TABLE
-- ============================================================================

-- Create persona_pain_points table or add missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_pain_points' AND table_schema = 'public') THEN
        CREATE TABLE persona_pain_points (
            pain_point_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL,
            
            -- Pain Point Content
            pain_point_text TEXT NOT NULL,
            pain_category VARCHAR(100),
            severity VARCHAR(50),  -- 'low', 'medium', 'high', 'critical'
            frequency VARCHAR(50), -- 'rare', 'occasional', 'frequent', 'constant'
            
            -- Impact
            time_impact_hours_per_week DECIMAL(8,2),
            cost_impact_annual DECIMAL(15,2),
            quality_impact_score DECIMAL(3,2) CHECK (quality_impact_score >= 0 AND quality_impact_score <= 10),
            
            -- Classification
            is_ai_addressable BOOLEAN DEFAULT TRUE,
            addressable_via_service_layer service_layer,
            
            -- Ordering
            display_order INTEGER,
            
            -- Metadata
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add missing columns if table exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'pain_category') THEN
            ALTER TABLE persona_pain_points ADD COLUMN pain_category VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'severity') THEN
            ALTER TABLE persona_pain_points ADD COLUMN severity VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'is_ai_addressable') THEN
            ALTER TABLE persona_pain_points ADD COLUMN is_ai_addressable BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END $$;

-- Add foreign key if personas table exists
DO $$
DECLARE
    pk_column VARCHAR;
BEGIN
    SELECT column_name INTO pk_column
    FROM information_schema.columns
    WHERE table_name = 'personas'
      AND table_schema = 'public'
      AND column_name IN ('persona_id', 'id')
    LIMIT 1;
    
    IF pk_column IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'persona_pain_points_persona_id_fkey'
    ) THEN
        EXECUTE format(
            'ALTER TABLE persona_pain_points
             ADD CONSTRAINT persona_pain_points_persona_id_fkey
             FOREIGN KEY (persona_id) REFERENCES personas(%I) ON DELETE CASCADE',
            pk_column
        );
    END IF;
END $$;

-- Create indexes only if columns exist
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_pain_points_persona ON persona_pain_points(persona_id);
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'severity') THEN
        CREATE INDEX IF NOT EXISTS idx_pain_points_severity ON persona_pain_points(severity);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_pain_points' AND column_name = 'pain_category') THEN
        CREATE INDEX IF NOT EXISTS idx_pain_points_category ON persona_pain_points(pain_category);
    END IF;
END $$;

COMMENT ON TABLE persona_pain_points IS 'Normalized pain points - one row per pain point per persona';

-- ============================================================================
-- SECTION 4: GOALS TABLE
-- ============================================================================

-- Create persona_goals table or add missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_goals' AND table_schema = 'public') THEN
        CREATE TABLE persona_goals (
            goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL,
            
            -- Goal Content
            goal_text TEXT NOT NULL,
            goal_category VARCHAR(100),
            priority VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
            time_horizon VARCHAR(50), -- 'immediate', 'short_term', 'medium_term', 'long_term'
            
            -- Measurability
            is_measurable BOOLEAN DEFAULT FALSE,
            measurement_metric VARCHAR(255),
            target_value VARCHAR(255),
            
            -- AI Relevance
            ai_can_assist BOOLEAN DEFAULT TRUE,
            assistance_type VARCHAR(100), -- 'automation', 'augmentation', 'insight', 'validation'
            
            -- Ordering
            display_order INTEGER,
            
            -- Metadata
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add missing columns if table exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'goal_category') THEN
            ALTER TABLE persona_goals ADD COLUMN goal_category VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'priority') THEN
            ALTER TABLE persona_goals ADD COLUMN priority VARCHAR(50);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'ai_can_assist') THEN
            ALTER TABLE persona_goals ADD COLUMN ai_can_assist BOOLEAN DEFAULT TRUE;
        END IF;
    END IF;
END $$;

-- Add foreign key if personas table exists
DO $$
DECLARE
    pk_column VARCHAR;
BEGIN
    SELECT column_name INTO pk_column
    FROM information_schema.columns
    WHERE table_name = 'personas'
      AND table_schema = 'public'
      AND column_name IN ('persona_id', 'id')
    LIMIT 1;
    
    IF pk_column IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'persona_goals_persona_id_fkey'
    ) THEN
        EXECUTE format(
            'ALTER TABLE persona_goals
             ADD CONSTRAINT persona_goals_persona_id_fkey
             FOREIGN KEY (persona_id) REFERENCES personas(%I) ON DELETE CASCADE',
            pk_column
        );
    END IF;
END $$;

-- Create indexes only if columns exist
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_goals_persona ON persona_goals(persona_id);
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'priority') THEN
        CREATE INDEX IF NOT EXISTS idx_goals_priority ON persona_goals(priority);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'persona_goals' AND column_name = 'goal_category') THEN
        CREATE INDEX IF NOT EXISTS idx_goals_category ON persona_goals(goal_category);
    END IF;
END $$;

COMMENT ON TABLE persona_goals IS 'Normalized goals - one row per goal per persona';

-- ============================================================================
-- SECTION 5: OPPORTUNITIES TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunities (
    opportunity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Opportunity Definition
    opportunity_name VARCHAR(255) NOT NULL,
    opportunity_description TEXT NOT NULL,
    opportunity_category VARCHAR(100),
    
    -- Targeting
    target_archetype archetype_type,
    target_functions business_function[], -- Optional: can be NULL if using function_id instead
    target_function_ids UUID[], -- Array of function IDs (alternative to target_functions)
    target_personas UUID[],
    
    -- Impact Scoring
    reach_score DECIMAL(5,2) CHECK (reach_score >= 0 AND reach_score <= 100),
    impact_score DECIMAL(5,2) CHECK (impact_score >= 0 AND impact_score <= 100),
    feasibility_score DECIMAL(5,2) CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    adoption_readiness_score DECIMAL(5,2) CHECK (adoption_readiness_score >= 0 AND adoption_readiness_score <= 100),
    overall_score DECIMAL(5,2),
    
    -- Solution
    recommended_service_layer service_layer,
    solution_description TEXT,
    
    -- Value
    estimated_time_savings_hours_per_week DECIMAL(8,2),
    estimated_annual_value_usd DECIMAL(15,2),
    
    -- Status
    status VARCHAR(50),
    priority VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    assigned_to UUID,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_opportunities_archetype ON opportunities(target_archetype);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority);

COMMENT ON TABLE opportunities IS 'AI opportunities discovered through persona and JTBD analysis';

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    type_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('personas', 'persona_pain_points', 'persona_goals', 'opportunities');
    
    SELECT COUNT(*) INTO type_count
    FROM pg_type
    WHERE typname IN ('archetype_type', 'technology_adoption', 'service_layer', 'gen_ai_opportunity_type');
    
    RAISE NOTICE '✅ Created/Verified: % tables, % types', table_count, type_count;
END $$;

