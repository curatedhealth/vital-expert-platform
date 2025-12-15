-- =====================================================================
-- PERSONA SCHEMA NORMALIZATION MIGRATION
-- =====================================================================
-- Version: 1.0.0
-- Date: November 27, 2025
-- Purpose: Fix schema inconsistencies and improve normalization
-- =====================================================================

-- =====================================================================
-- PHASE 1: CREATE LOOKUP TABLES FOR COMMON VALUE SETS
-- These replace hardcoded check constraints with proper normalized tables
-- =====================================================================

-- 1.1 Timeframe Lookup Table
CREATE TABLE IF NOT EXISTS lookup_timeframes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_timeframes (code, display_name, description, sort_order) VALUES
    ('short_term', 'Short Term', '0-12 months', 1),
    ('medium_term', 'Medium Term', '1-3 years', 2),
    ('long_term', 'Long Term', '3+ years', 3)
ON CONFLICT (code) DO NOTHING;

-- 1.2 Urgency Level Lookup Table
CREATE TABLE IF NOT EXISTS lookup_urgency_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_urgency_levels (code, display_name, description, sort_order) VALUES
    ('immediate', 'Immediate', 'Requires action within days', 1),
    ('high', 'High', 'Requires action within weeks', 2),
    ('medium', 'Medium', 'Requires action within months', 3),
    ('low', 'Low', 'Can be addressed when convenient', 4)
ON CONFLICT (code) DO NOTHING;

-- 1.3 Impact/Importance Level Lookup Table
CREATE TABLE IF NOT EXISTS lookup_impact_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_impact_levels (code, display_name, description, sort_order) VALUES
    ('critical', 'Critical', 'Business-critical impact', 1),
    ('high', 'High', 'Significant impact', 2),
    ('medium', 'Medium', 'Moderate impact', 3),
    ('low', 'Low', 'Minor impact', 4)
ON CONFLICT (code) DO NOTHING;

-- 1.4 Complexity Level Lookup Table
CREATE TABLE IF NOT EXISTS lookup_complexity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_complexity_levels (code, display_name, description, sort_order) VALUES
    ('simple', 'Simple', 'Straightforward, minimal steps', 1),
    ('moderate', 'Moderate', 'Some complexity, multiple stakeholders', 2),
    ('complex', 'Complex', 'Many dependencies and approvals', 3),
    ('very_complex', 'Very Complex', 'Extensive process with many gates', 4)
ON CONFLICT (code) DO NOTHING;

-- 1.5 Trigger Type Lookup Table
CREATE TABLE IF NOT EXISTS lookup_trigger_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_trigger_types (code, display_name, description, sort_order) VALUES
    ('regulatory', 'Regulatory', 'Compliance or regulatory requirement', 1),
    ('competitive', 'Competitive', 'Competitive pressure or market dynamics', 2),
    ('internal_initiative', 'Internal Initiative', 'Internal business initiative or mandate', 3),
    ('crisis', 'Crisis', 'Urgent problem or crisis situation', 4),
    ('growth', 'Growth', 'Growth opportunity or expansion', 5)
ON CONFLICT (code) DO NOTHING;

-- 1.6 Challenge Type Lookup Table
CREATE TABLE IF NOT EXISTS lookup_challenge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_challenge_types (code, display_name, description, sort_order) VALUES
    ('technical', 'Technical', 'Technology or systems challenges', 1),
    ('organizational', 'Organizational', 'People, culture, or structure challenges', 2),
    ('resource', 'Resource', 'Budget, time, or staffing constraints', 3),
    ('strategic', 'Strategic', 'Direction, priorities, or alignment issues', 4),
    ('operational', 'Operational', 'Day-to-day process or execution challenges', 5)
ON CONFLICT (code) DO NOTHING;

-- 1.7 Goal Type Lookup Table
CREATE TABLE IF NOT EXISTS lookup_goal_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_goal_types (code, display_name, description, sort_order) VALUES
    ('professional', 'Professional', 'Career and skill development goals', 1),
    ('personal', 'Personal', 'Work-life balance and personal fulfillment', 2),
    ('organizational', 'Organizational', 'Company or team success goals', 3),
    ('career', 'Career', 'Long-term career advancement', 4)
ON CONFLICT (code) DO NOTHING;

-- 1.8 Conference Type Lookup Table
CREATE TABLE IF NOT EXISTS lookup_conference_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_conference_types (code, display_name, description, sort_order) VALUES
    ('industry', 'Industry', 'Industry-specific conferences', 1),
    ('technical', 'Technical', 'Technical or scientific conferences', 2),
    ('leadership', 'Leadership', 'Executive and leadership events', 3),
    ('networking', 'Networking', 'Networking-focused events', 4),
    ('regulatory', 'Regulatory', 'Regulatory and compliance conferences', 5)
ON CONFLICT (code) DO NOTHING;

-- 1.9 Conference Role Lookup Table
CREATE TABLE IF NOT EXISTS lookup_conference_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_conference_roles (code, display_name, description, sort_order) VALUES
    ('attendee', 'Attendee', 'General attendee', 1),
    ('speaker', 'Speaker', 'Presenting or speaking', 2),
    ('exhibitor', 'Exhibitor', 'Exhibiting at booth', 3),
    ('organizer', 'Organizer', 'Organizing or hosting', 4)
ON CONFLICT (code) DO NOTHING;

-- =====================================================================
-- PHASE 2: FIX DENORMALIZED COLUMNS IN PERSONAS TABLE
-- Remove duplicate name/slug columns, keep only IDs
-- =====================================================================

-- 2.1 Create a view for backward compatibility that JOINs the data
CREATE OR REPLACE VIEW v_personas_full AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.title,
    p.tagline,
    p.one_liner,
    -- Role info from org_roles
    p.role_id,
    COALESCE(r.name, p.role_name) as role_name,
    COALESCE(r.slug, p.role_slug) as role_slug,
    -- Function info from org_functions
    p.function_id,
    COALESCE(f.name::text, p.function_name) as function_name,
    COALESCE(f.slug, p.function_slug) as function_slug,
    -- Department info from org_departments
    p.department_id,
    COALESCE(d.name, p.department_name) as department_name,
    COALESCE(d.slug, p.department_slug) as department_slug,
    -- All other columns
    p.seniority_level,
    p.years_of_experience,
    p.years_in_current_role,
    p.years_in_industry,
    p.years_in_function,
    p.typical_organization_size,
    p.organization_type,
    p.geographic_scope,
    p.reporting_to,
    p.team_size,
    p.team_size_typical,
    p.direct_reports,
    p.budget_authority,
    p.budget_authority_level,
    p.education_level,
    p.work_style,
    p.work_arrangement,
    p.learning_style,
    p.decision_making_style,
    p.technology_adoption,
    p.risk_tolerance,
    p.change_readiness,
    p.archetype,
    p.archetype_confidence,
    p.work_pattern,
    p.work_complexity_score,
    p.ai_maturity_score,
    p.gen_ai_readiness_level,
    p.preferred_service_layer,
    p.gen_ai_adoption_score,
    p.gen_ai_trust_score,
    p.gen_ai_usage_frequency,
    p.gen_ai_primary_use_case,
    p.background_story,
    p.a_day_in_the_life,
    p.salary_min_usd,
    p.salary_max_usd,
    p.salary_median_usd,
    p.salary_currency,
    p.salary_year,
    p.is_active,
    p.validation_status,
    p.created_at,
    p.updated_at,
    p.deleted_at
FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
LEFT JOIN org_departments d ON p.department_id = d.id;

COMMENT ON VIEW v_personas_full IS 'Full persona view with role/function/department names resolved from related tables';

-- =====================================================================
-- PHASE 3: FIX TRIGGER FUNCTION FOR GEN AI READINESS
-- The function expects enum types but receives text
-- =====================================================================

-- 3.1 Create or replace the function to handle both enum and text inputs
CREATE OR REPLACE FUNCTION calculate_gen_ai_readiness_level(
    p_ai_maturity_score NUMERIC,
    p_technology_adoption TEXT,
    p_risk_tolerance TEXT,
    p_change_readiness TEXT
) RETURNS TEXT AS $$
DECLARE
    v_score NUMERIC := 0;
    v_readiness TEXT;
BEGIN
    -- Base score from AI maturity (0-100 scale, contributes 40%)
    IF p_ai_maturity_score IS NOT NULL THEN
        v_score := v_score + (p_ai_maturity_score * 0.4);
    END IF;
    
    -- Technology adoption score (contributes 25%)
    CASE LOWER(COALESCE(p_technology_adoption, ''))
        WHEN 'innovator' THEN v_score := v_score + 25;
        WHEN 'early_adopter' THEN v_score := v_score + 20;
        WHEN 'early adopter' THEN v_score := v_score + 20;
        WHEN 'early_majority' THEN v_score := v_score + 15;
        WHEN 'early majority' THEN v_score := v_score + 15;
        WHEN 'late_majority' THEN v_score := v_score + 10;
        WHEN 'late majority' THEN v_score := v_score + 10;
        WHEN 'laggard' THEN v_score := v_score + 5;
        ELSE v_score := v_score + 10; -- default
    END CASE;
    
    -- Risk tolerance score (contributes 20%)
    CASE LOWER(COALESCE(p_risk_tolerance, ''))
        WHEN 'high' THEN v_score := v_score + 20;
        WHEN 'moderate' THEN v_score := v_score + 15;
        WHEN 'low' THEN v_score := v_score + 10;
        WHEN 'very_low' THEN v_score := v_score + 5;
        WHEN 'very low' THEN v_score := v_score + 5;
        ELSE v_score := v_score + 10; -- default
    END CASE;
    
    -- Change readiness score (contributes 15%)
    CASE LOWER(COALESCE(p_change_readiness, ''))
        WHEN 'very_high' THEN v_score := v_score + 15;
        WHEN 'very high' THEN v_score := v_score + 15;
        WHEN 'high' THEN v_score := v_score + 12;
        WHEN 'moderate' THEN v_score := v_score + 9;
        WHEN 'low' THEN v_score := v_score + 6;
        WHEN 'very_low' THEN v_score := v_score + 3;
        WHEN 'very low' THEN v_score := v_score + 3;
        ELSE v_score := v_score + 8; -- default
    END CASE;
    
    -- Determine readiness level based on total score
    IF v_score >= 80 THEN
        v_readiness := 'advanced';
    ELSIF v_score >= 60 THEN
        v_readiness := 'intermediate';
    ELSIF v_score >= 40 THEN
        v_readiness := 'developing';
    ELSE
        v_readiness := 'beginner';
    END IF;
    
    RETURN v_readiness;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_gen_ai_readiness_level(NUMERIC, TEXT, TEXT, TEXT) IS 
'Calculates Gen AI readiness level based on maturity score and behavioral attributes. Returns: advanced, intermediate, developing, or beginner';

-- 3.2 Update the trigger function to use the fixed function
CREATE OR REPLACE FUNCTION update_gen_ai_readiness_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate if we have the necessary inputs
    IF NEW.ai_maturity_score IS NOT NULL THEN
        NEW.gen_ai_readiness_level := calculate_gen_ai_readiness_level(
            NEW.ai_maturity_score,
            NEW.technology_adoption::TEXT,
            NEW.risk_tolerance::TEXT,
            NEW.change_readiness::TEXT
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_gen_ai_readiness_level() IS 
'Trigger function to auto-calculate gen_ai_readiness_level on persona insert/update';

-- =====================================================================
-- PHASE 4: ADD INDEXES FOR PERFORMANCE
-- =====================================================================

-- Lookup table indexes
CREATE INDEX IF NOT EXISTS idx_lookup_timeframes_code ON lookup_timeframes(code);
CREATE INDEX IF NOT EXISTS idx_lookup_urgency_levels_code ON lookup_urgency_levels(code);
CREATE INDEX IF NOT EXISTS idx_lookup_impact_levels_code ON lookup_impact_levels(code);
CREATE INDEX IF NOT EXISTS idx_lookup_complexity_levels_code ON lookup_complexity_levels(code);
CREATE INDEX IF NOT EXISTS idx_lookup_trigger_types_code ON lookup_trigger_types(code);
CREATE INDEX IF NOT EXISTS idx_lookup_challenge_types_code ON lookup_challenge_types(code);
CREATE INDEX IF NOT EXISTS idx_lookup_goal_types_code ON lookup_goal_types(code);
CREATE INDEX IF NOT EXISTS idx_lookup_conference_types_code ON lookup_conference_types(code);
CREATE INDEX IF NOT EXISTS idx_lookup_conference_roles_code ON lookup_conference_roles(code);

-- Persona table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(archetype) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_tenant_archetype ON personas(tenant_id, archetype) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_seniority ON personas(seniority_level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_personas_ai_maturity ON personas(ai_maturity_score DESC) WHERE deleted_at IS NULL;

-- =====================================================================
-- PHASE 5: CREATE HELPER FUNCTIONS FOR SEEDING
-- =====================================================================

-- 5.1 Function to validate constraint values before insert
CREATE OR REPLACE FUNCTION validate_persona_constraint_value(
    p_table_name TEXT,
    p_column_name TEXT,
    p_value TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_valid BOOLEAN := FALSE;
    v_constraint_def TEXT;
BEGIN
    -- Get the check constraint definition
    SELECT pg_get_constraintdef(con.oid)
    INTO v_constraint_def
    FROM pg_constraint con
    JOIN pg_class c ON con.conrelid = c.oid
    WHERE c.relname = p_table_name
    AND con.conname LIKE '%' || p_column_name || '%check%';
    
    -- Check if value is in the constraint
    IF v_constraint_def IS NOT NULL THEN
        v_valid := v_constraint_def LIKE '%''' || p_value || '''%';
    ELSE
        v_valid := TRUE; -- No constraint found, allow any value
    END IF;
    
    RETURN v_valid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_persona_constraint_value IS 
'Validates if a value is allowed by a check constraint on a persona table';

-- 5.2 Function to get valid values for a column
CREATE OR REPLACE FUNCTION get_valid_constraint_values(
    p_table_name TEXT,
    p_column_name TEXT
) RETURNS TEXT[] AS $$
DECLARE
    v_constraint_def TEXT;
    v_values TEXT[];
BEGIN
    -- Get the check constraint definition
    SELECT pg_get_constraintdef(con.oid)
    INTO v_constraint_def
    FROM pg_constraint con
    JOIN pg_class c ON con.conrelid = c.oid
    WHERE c.relname = p_table_name
    AND con.conname LIKE '%' || p_column_name || '%check%';
    
    IF v_constraint_def IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Extract values from ARRAY[...] in constraint
    -- This is a simplified extraction - works for most cases
    SELECT array_agg(trim(both '''' from val))
    INTO v_values
    FROM regexp_matches(v_constraint_def, '''([^'']+)''', 'g') AS m(val);
    
    RETURN v_values;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_valid_constraint_values IS 
'Returns array of valid values for a check-constrained column';

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Changes made:
-- 1. Created 9 lookup tables for common value sets
-- 2. Created v_personas_full view for backward compatibility
-- 3. Fixed calculate_gen_ai_readiness_level function to accept TEXT
-- 4. Added performance indexes
-- 5. Created helper functions for validation
-- =====================================================================

