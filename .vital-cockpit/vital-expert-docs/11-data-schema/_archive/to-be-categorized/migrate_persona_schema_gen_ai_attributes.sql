-- ============================================================================
-- MIGRATION: Add Gen AI Opportunity Attributes to Persona Schema
-- Version: 4.1 (Gen AI Enhancement)
-- Date: 2025-01-27
-- Purpose: Add attributes for Gen AI opportunity discovery and mapping
-- Based on: GEN_AI_OPPORTUNITY_ALIGNMENT.md
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION 1: NEW ENUMERATIONS
-- ============================================================================

-- Gen AI Opportunity Type
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

-- Service Layer Preference (for personas)
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

-- Gen AI Readiness Level
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
-- SECTION 2: VERIFY BASE SCHEMA EXISTS
-- ============================================================================

-- Check if required tables exist and verify column names
DO $$
DECLARE
    personas_pk_column VARCHAR;
BEGIN
    -- Check personas table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN
        RAISE EXCEPTION 'Base schema not found. personas table does not exist. Please run PERSONA_DATABASE_SCHEMA_NORMALIZED.sql first.';
    END IF;
    
    -- Check if personas table has persona_id or id column
    SELECT column_name INTO personas_pk_column
    FROM information_schema.columns
    WHERE table_name = 'personas'
      AND table_schema = 'public'
      AND column_name IN ('persona_id', 'id')
    LIMIT 1;
    
    IF personas_pk_column IS NULL THEN
        RAISE EXCEPTION 'personas table exists but does not have persona_id or id column. Please check your schema.';
    END IF;
    
    -- Store the column name for use in foreign keys
    -- We'll use a session variable or just proceed with the detected column name
    RAISE NOTICE 'personas table uses % as primary key. Migration will use this column.', personas_pk_column;
    
    -- Check opportunities table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
        RAISE EXCEPTION 'opportunities table does not exist. Please run create_missing_opportunities_table.sql first.';
    END IF;
    
    -- Check persona_pain_points table (optional - only needed if we're updating it)
    -- IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_pain_points') THEN
    --     RAISE NOTICE 'persona_pain_points table does not exist. Skipping pain points updates.';
    -- END IF;
    
    -- Check persona_goals table (optional - only needed if we're updating it)
    -- IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_goals') THEN
    --     RAISE NOTICE 'persona_goals table does not exist. Skipping goals updates.';
    -- END IF;
END $$;

-- ============================================================================
-- SECTION 3: ADD COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add Gen AI attributes to personas table
ALTER TABLE personas
ADD COLUMN IF NOT EXISTS gen_ai_readiness_level gen_ai_readiness_level,
ADD COLUMN IF NOT EXISTS preferred_service_layer service_layer_preference,
ADD COLUMN IF NOT EXISTS gen_ai_adoption_score DECIMAL(5,2) CHECK (gen_ai_adoption_score >= 0 AND gen_ai_adoption_score <= 100),
ADD COLUMN IF NOT EXISTS gen_ai_usage_frequency VARCHAR(50), -- 'never', 'rarely', 'weekly', 'daily', 'constant'
ADD COLUMN IF NOT EXISTS gen_ai_trust_score DECIMAL(5,2) CHECK (gen_ai_trust_score >= 0 AND gen_ai_trust_score <= 100),
ADD COLUMN IF NOT EXISTS gen_ai_primary_use_case VARCHAR(100), -- 'automation', 'research', 'analysis', 'communication', 'planning'
ADD COLUMN IF NOT EXISTS gen_ai_barriers TEXT[], -- Array of barriers: 'trust', 'skill', 'time', 'cost', 'compliance'
ADD COLUMN IF NOT EXISTS gen_ai_enablers TEXT[]; -- Array of enablers: 'training', 'examples', 'support', 'transparency'

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_personas_gen_ai_readiness ON personas(gen_ai_readiness_level);
CREATE INDEX IF NOT EXISTS idx_personas_preferred_service_layer ON personas(preferred_service_layer);
CREATE INDEX IF NOT EXISTS idx_personas_gen_ai_adoption_score ON personas(gen_ai_adoption_score DESC);

-- Add comments
COMMENT ON COLUMN personas.gen_ai_readiness_level IS 'Gen AI readiness level based on maturity and adoption';
COMMENT ON COLUMN personas.preferred_service_layer IS 'Preferred VITAL service layer based on archetype and work pattern';
COMMENT ON COLUMN personas.gen_ai_adoption_score IS '0-100 score: likelihood to adopt Gen AI tools';
COMMENT ON COLUMN personas.gen_ai_trust_score IS '0-100 score: trust level in Gen AI outputs';

-- Add Gen AI opportunity type to opportunities table
ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS gen_ai_opportunity_type gen_ai_opportunity_type,
ADD COLUMN IF NOT EXISTS estimated_roi_multiplier DECIMAL(5,2) CHECK (estimated_roi_multiplier >= 0), -- e.g., 1.5x for Automators
ADD COLUMN IF NOT EXISTS implementation_complexity VARCHAR(50), -- 'low', 'medium', 'high', 'very_high'
ADD COLUMN IF NOT EXISTS time_to_value_weeks INTEGER,
ADD COLUMN IF NOT EXISTS requires_training BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE;

-- Add index
CREATE INDEX IF NOT EXISTS idx_opportunities_gen_ai_type ON opportunities(gen_ai_opportunity_type);

-- Add comment
COMMENT ON COLUMN opportunities.gen_ai_opportunity_type IS 'Type of Gen AI opportunity: automation, augmentation, learning, transparency';
COMMENT ON COLUMN opportunities.estimated_roi_multiplier IS 'ROI multiplier by archetype (e.g., 1.5x for Automators vs 1.2x for Skeptics)';

-- ============================================================================
-- SECTION 4: NEW TABLES FOR GEN AI OPPORTUNITY MAPPING
-- ============================================================================

-- Opportunity-Archetype Mapping (many-to-many)
-- Allows one opportunity to benefit multiple archetypes with different scores
CREATE TABLE IF NOT EXISTS opportunity_archetypes (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    archetype archetype_type NOT NULL,
    
    -- Archetype-specific scoring
    priority_score DECIMAL(5,2) CHECK (priority_score >= 0 AND priority_score <= 100), -- 0-100: how important for this archetype
    estimated_adoption_rate DECIMAL(5,2) CHECK (estimated_adoption_rate >= 0 AND estimated_adoption_rate <= 100), -- 0-100: % likely to adopt
    estimated_roi_multiplier DECIMAL(5,2) CHECK (estimated_roi_multiplier >= 0), -- e.g., 1.5x for Automators, 1.2x for Skeptics
    time_to_adoption_weeks INTEGER, -- Expected time for this archetype to adopt
    
    -- Service layer preferences for this archetype-opportunity combination
    primary_service_layer service_layer,
    secondary_service_layers service_layer[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(opportunity_id, archetype)
);

CREATE INDEX idx_opp_arch_opportunity ON opportunity_archetypes(opportunity_id);
CREATE INDEX idx_opp_arch_archetype ON opportunity_archetypes(archetype);
CREATE INDEX idx_opp_arch_priority ON opportunity_archetypes(priority_score DESC);

COMMENT ON TABLE opportunity_archetypes IS 'Maps opportunities to archetypes with archetype-specific scoring';
COMMENT ON COLUMN opportunity_archetypes.priority_score IS 'How important this opportunity is for this archetype (0-100)';
COMMENT ON COLUMN opportunity_archetypes.estimated_adoption_rate IS 'Percentage of this archetype likely to adopt (0-100)';

-- Opportunity-Service Layer Mapping (many-to-many)
-- Maps which service layers are needed for each opportunity
CREATE TABLE IF NOT EXISTS opportunity_service_layers (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    service_layer service_layer NOT NULL,
    
    -- Relationship
    is_primary BOOLEAN DEFAULT FALSE, -- Primary service layer for this opportunity
    is_required BOOLEAN DEFAULT TRUE, -- Required vs optional
    priority INTEGER CHECK (priority >= 1 AND priority <= 4), -- 1 = highest priority
    
    -- Implementation details
    implementation_effort VARCHAR(50), -- 'low', 'medium', 'high'
    estimated_development_weeks INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(opportunity_id, service_layer)
);

CREATE INDEX idx_opp_svc_opportunity ON opportunity_service_layers(opportunity_id);
CREATE INDEX idx_opp_svc_layer ON opportunity_service_layers(service_layer);
CREATE INDEX idx_opp_svc_primary ON opportunity_service_layers(is_primary) WHERE is_primary = TRUE;

COMMENT ON TABLE opportunity_service_layers IS 'Maps opportunities to required/optional service layers';
COMMENT ON COLUMN opportunity_service_layers.is_primary IS 'TRUE if this is the primary service layer for the opportunity';

-- Persona Service Layer Usage Tracking
-- Tracks which service layers each persona actually uses
-- Only create if personas table exists
DO $$
DECLARE
    pk_column_name VARCHAR;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas' AND table_schema = 'public') THEN
        -- Determine the actual primary key column name
        SELECT column_name INTO pk_column_name
        FROM information_schema.columns
        WHERE table_name = 'personas'
          AND table_schema = 'public'
          AND column_name IN ('persona_id', 'id')
        LIMIT 1;
        
        -- Create table without foreign key first, then add it
        CREATE TABLE IF NOT EXISTS persona_service_layer_usage (
            usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            persona_id UUID NOT NULL,
            service_layer service_layer NOT NULL,
            
            -- Usage metrics
            usage_frequency VARCHAR(50), -- 'never', 'rarely', 'weekly', 'daily', 'constant'
            usage_count_last_30_days INTEGER DEFAULT 0,
            last_used_at TIMESTAMP WITH TIME ZONE,
            
            -- Satisfaction
            satisfaction_score DECIMAL(3,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5), -- 0-5 stars
            would_recommend BOOLEAN,
            
            -- Barriers
            barriers_encountered TEXT[], -- 'complexity', 'time', 'trust', 'quality', 'cost'
            
            -- Metadata
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            UNIQUE(persona_id, service_layer)
        );
        
        -- Add foreign key constraint if it doesn't exist
        IF pk_column_name IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'persona_service_layer_usage_persona_id_fkey'
                AND table_name = 'persona_service_layer_usage'
            ) THEN
                EXECUTE format(
                    'ALTER TABLE persona_service_layer_usage
                     ADD CONSTRAINT persona_service_layer_usage_persona_id_fkey
                     FOREIGN KEY (persona_id) REFERENCES personas(%I) ON DELETE CASCADE',
                    pk_column_name
                );
            END IF;
        END IF;
        
        CREATE INDEX IF NOT EXISTS idx_persona_svc_usage_persona ON persona_service_layer_usage(persona_id);
        CREATE INDEX IF NOT EXISTS idx_persona_svc_usage_layer ON persona_service_layer_usage(service_layer);
        CREATE INDEX IF NOT EXISTS idx_persona_svc_usage_frequency ON persona_service_layer_usage(usage_frequency);
        
        COMMENT ON TABLE persona_service_layer_usage IS 'Tracks actual service layer usage by personas for analytics';
    ELSE
        RAISE NOTICE 'personas table does not exist. Skipping persona_service_layer_usage table creation.';
    END IF;
END $$;

-- Gen AI Opportunity Discovery Log
-- Tracks how opportunities were discovered (from pain points, goals, etc.)
CREATE TABLE IF NOT EXISTS gen_ai_opportunity_discovery (
    discovery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    
    -- Discovery source
    discovery_source VARCHAR(100), -- 'pain_point', 'goal', 'challenge', 'jtbd', 'analytics', 'user_feedback'
    source_id UUID, -- ID of the source (pain_point_id, goal_id, etc.)
    source_type VARCHAR(50), -- 'pain_point', 'goal', 'challenge', 'jtbd'
    
    -- Discovery details
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discovered_by UUID, -- User or system
    discovery_method VARCHAR(100), -- 'automated', 'manual', 'ai_analysis', 'user_report'
    
    -- Confidence
    discovery_confidence DECIMAL(5,2) CHECK (discovery_confidence >= 0 AND discovery_confidence <= 100),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discovery_opportunity ON gen_ai_opportunity_discovery(opportunity_id);
CREATE INDEX idx_discovery_source ON gen_ai_opportunity_discovery(discovery_source, source_type);
CREATE INDEX idx_discovery_date ON gen_ai_opportunity_discovery(discovered_at DESC);

COMMENT ON TABLE gen_ai_opportunity_discovery IS 'Tracks how Gen AI opportunities were discovered for analytics';

-- ============================================================================
-- SECTION 5: UPDATE PAIN POINTS TABLE
-- ============================================================================

-- Add Gen AI opportunity classification to pain points (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_pain_points') THEN
        ALTER TABLE persona_pain_points
ADD COLUMN IF NOT EXISTS gen_ai_opportunity_type gen_ai_opportunity_type,
ADD COLUMN IF NOT EXISTS gen_ai_addressability_score DECIMAL(5,2) CHECK (gen_ai_addressability_score >= 0 AND gen_ai_addressability_score <= 100),
ADD COLUMN IF NOT EXISTS recommended_service_layer service_layer,
ADD COLUMN IF NOT EXISTS estimated_time_savings_hours DECIMAL(8,2);

        CREATE INDEX IF NOT EXISTS idx_pain_points_gen_ai_type ON persona_pain_points(gen_ai_opportunity_type);
        CREATE INDEX IF NOT EXISTS idx_pain_points_addressability ON persona_pain_points(gen_ai_addressability_score DESC);
        
        COMMENT ON COLUMN persona_pain_points.gen_ai_opportunity_type IS 'Type of Gen AI opportunity this pain point represents';
        COMMENT ON COLUMN persona_pain_points.gen_ai_addressability_score IS '0-100: How well Gen AI can address this pain point';
    END IF;
END $$;

-- ============================================================================
-- SECTION 6: UPDATE GOALS TABLE
-- ============================================================================

-- Add Gen AI assistance details to goals (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'persona_goals') THEN
        ALTER TABLE persona_goals
ADD COLUMN IF NOT EXISTS gen_ai_assistance_type gen_ai_opportunity_type,
ADD COLUMN IF NOT EXISTS gen_ai_assistance_score DECIMAL(5,2) CHECK (gen_ai_assistance_score >= 0 AND gen_ai_assistance_score <= 100),
ADD COLUMN IF NOT EXISTS recommended_service_layer service_layer,
ADD COLUMN IF NOT EXISTS estimated_goal_achievement_improvement DECIMAL(5,2) CHECK (estimated_goal_achievement_improvement >= 0 AND estimated_goal_achievement_improvement <= 100);

        CREATE INDEX IF NOT EXISTS idx_goals_gen_ai_type ON persona_goals(gen_ai_assistance_type);
        CREATE INDEX IF NOT EXISTS idx_goals_assistance_score ON persona_goals(gen_ai_assistance_score DESC);
        
        COMMENT ON COLUMN persona_goals.gen_ai_assistance_type IS 'Type of Gen AI assistance for this goal';
        COMMENT ON COLUMN persona_goals.gen_ai_assistance_score IS '0-100: How much Gen AI can help achieve this goal';
    END IF;
END $$;

-- ============================================================================
-- SECTION 7: HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate Gen AI readiness level from persona attributes
CREATE OR REPLACE FUNCTION calculate_gen_ai_readiness_level(
    p_ai_maturity_score DECIMAL,
    p_technology_adoption technology_adoption,
    p_risk_tolerance risk_tolerance,
    p_change_readiness change_readiness
) RETURNS gen_ai_readiness_level AS $$
DECLARE
    readiness_score DECIMAL;
BEGIN
    -- Calculate composite readiness score (0-100)
    readiness_score := (
        COALESCE(p_ai_maturity_score, 50) * 0.4 +
        CASE p_technology_adoption
            WHEN 'innovator' THEN 100
            WHEN 'early_adopter' THEN 80
            WHEN 'early_majority' THEN 60
            WHEN 'late_majority' THEN 40
            WHEN 'laggard' THEN 20
            ELSE 50
        END * 0.3 +
        CASE p_risk_tolerance
            WHEN 'aggressive' THEN 80
            WHEN 'moderate' THEN 60
            WHEN 'conservative' THEN 40
            WHEN 'very_conservative' THEN 20
            ELSE 50
        END * 0.2 +
        CASE p_change_readiness
            WHEN 'high' THEN 80
            WHEN 'moderate' THEN 50
            WHEN 'low' THEN 20
            ELSE 50
        END * 0.1
    );
    
    -- Map to readiness level
    IF readiness_score >= 76 THEN
        RETURN 'advanced';
    ELSIF readiness_score >= 51 THEN
        RETURN 'ready';
    ELSIF readiness_score >= 26 THEN
        RETURN 'exploring';
    ELSE
        RETURN 'not_ready';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_gen_ai_readiness_level IS 'Calculates Gen AI readiness level from persona attributes';

-- Function to infer preferred service layer from archetype
CREATE OR REPLACE FUNCTION infer_preferred_service_layer(
    p_archetype archetype_type,
    p_work_pattern work_pattern
) RETURNS service_layer_preference AS $$
BEGIN
    CASE p_archetype
        WHEN 'AUTOMATOR' THEN
            RETURN 'WORKFLOWS';
        WHEN 'ORCHESTRATOR' THEN
            RETURN 'ASK_PANEL';
        WHEN 'LEARNER' THEN
            RETURN 'ASK_EXPERT';
        WHEN 'SKEPTIC' THEN
            IF p_work_pattern = 'strategic' THEN
                RETURN 'ASK_PANEL';
            ELSE
                RETURN 'MIXED';
            END IF;
        ELSE
            RETURN 'MIXED';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION infer_preferred_service_layer IS 'Infers preferred service layer from archetype and work pattern';

-- ============================================================================
-- SECTION 8: TRIGGERS FOR AUTO-POPULATION
-- ============================================================================

-- Trigger to auto-calculate Gen AI readiness level
CREATE OR REPLACE FUNCTION update_gen_ai_readiness_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.gen_ai_readiness_level := calculate_gen_ai_readiness_level(
        NEW.ai_maturity_score,
        NEW.technology_adoption,
        NEW.risk_tolerance,
        NEW.change_readiness
    );
    
    -- Also update preferred service layer if not set
    IF NEW.preferred_service_layer IS NULL THEN
        NEW.preferred_service_layer := infer_preferred_service_layer(
            NEW.archetype,
            NEW.work_pattern
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gen_ai_readiness
    BEFORE INSERT OR UPDATE OF ai_maturity_score, technology_adoption, risk_tolerance, change_readiness, archetype, work_pattern
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_gen_ai_readiness_level();

COMMENT ON TRIGGER trigger_update_gen_ai_readiness ON personas IS 'Auto-calculates Gen AI readiness level and preferred service layer';

-- ============================================================================
-- SECTION 9: VIEWS FOR ANALYTICS
-- ============================================================================

-- View: Gen AI Opportunities by Archetype
CREATE OR REPLACE VIEW v_gen_ai_opportunities_by_archetype AS
SELECT 
    oa.archetype,
    o.gen_ai_opportunity_type,
    COUNT(DISTINCT o.opportunity_id) as opportunity_count,
    AVG(oa.priority_score) as avg_priority_score,
    AVG(oa.estimated_adoption_rate) as avg_adoption_rate,
    AVG(oa.estimated_roi_multiplier) as avg_roi_multiplier,
    SUM(CASE WHEN o.status = 'deployed' THEN 1 ELSE 0 END) as deployed_count
FROM opportunities o
JOIN opportunity_archetypes oa ON o.opportunity_id = oa.opportunity_id
WHERE o.is_active = TRUE
GROUP BY oa.archetype, o.gen_ai_opportunity_type
ORDER BY oa.archetype, opportunity_count DESC;

COMMENT ON VIEW v_gen_ai_opportunities_by_archetype IS 'Gen AI opportunities grouped by archetype and type';

-- View: Persona Gen AI Readiness Dashboard
CREATE OR REPLACE VIEW v_persona_gen_ai_readiness AS
SELECT 
    p.archetype,
    p.gen_ai_readiness_level,
    COUNT(*) as persona_count,
    AVG(p.gen_ai_adoption_score) as avg_adoption_score,
    AVG(p.gen_ai_trust_score) as avg_trust_score,
    COUNT(DISTINCT psl.service_layer) as service_layers_used,
    STRING_AGG(DISTINCT p.preferred_service_layer::text, ', ') as preferred_layers
FROM personas p
LEFT JOIN persona_service_layer_usage psl ON p.persona_id = psl.persona_id
WHERE p.is_active = TRUE
GROUP BY p.archetype, p.gen_ai_readiness_level
ORDER BY p.archetype, p.gen_ai_readiness_level;

COMMENT ON VIEW v_persona_gen_ai_readiness IS 'Persona Gen AI readiness dashboard by archetype';

-- ============================================================================
-- SECTION 10: SAMPLE DATA QUERIES
-- ============================================================================

-- Example: Find top Gen AI opportunities for Automators
/*
SELECT 
    o.opportunity_name,
    o.gen_ai_opportunity_type,
    oa.priority_score,
    oa.estimated_adoption_rate,
    oa.estimated_roi_multiplier,
    osl.service_layer
FROM opportunities o
JOIN opportunity_archetypes oa ON o.opportunity_id = oa.opportunity_id
JOIN opportunity_service_layers osl ON o.opportunity_id = osl.opportunity_id
WHERE oa.archetype = 'AUTOMATOR'
  AND o.gen_ai_opportunity_type = 'automation'
  AND o.is_active = TRUE
ORDER BY oa.priority_score DESC, oa.estimated_adoption_rate DESC
LIMIT 10;
*/

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- ✅ Added 4 new enumerations (gen_ai_opportunity_type, service_layer_preference, gen_ai_readiness_level)
-- ✅ Added 8 new columns to personas table (Gen AI attributes)
-- ✅ Added 5 new columns to opportunities table (Gen AI attributes)
-- ✅ Added 4 new columns to persona_pain_points table
-- ✅ Added 4 new columns to persona_goals table
-- ✅ Created 4 new tables (opportunity_archetypes, opportunity_service_layers, persona_service_layer_usage, gen_ai_opportunity_discovery)
-- ✅ Added 2 helper functions (calculate_gen_ai_readiness_level, infer_preferred_service_layer)
-- ✅ Added 1 trigger (auto-calculate readiness level)
-- ✅ Created 2 analytics views

