-- ============================================================================
-- MIGRATION: Persona Schema - Gold Standard (Incremental Safe)
-- Version: 4.0.1
-- Date: 2025-11-28
-- Description: Safely updates persona schema to gold standard
--              Checks current state and only applies missing pieces
-- ============================================================================

-- DO NOT RUN IN TRANSACTION - Run each section separately if errors occur
-- BEGIN; -- Commented out for safety

-- ============================================================================
-- SECTION 1: ENUM TYPES (Safe - uses EXCEPTION handling)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE archetype_enum AS ENUM ('AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE work_pattern_enum AS ENUM ('routine', 'strategic', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE service_layer_preference AS ENUM ('ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER', 'MIXED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE gen_ai_readiness_level AS ENUM ('beginner', 'developing', 'proficient', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE budget_authority_level AS ENUM ('none', 'limited', 'moderate', 'significant', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM ('draft', 'pending_review', 'validated', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- SECTION 2: LOOKUP TABLES (Safe - uses IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lookup_seniority_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lookup_seniority_levels (code, display_name, years_experience_min, years_experience_max, sort_order) VALUES
    ('entry', 'Entry Level', 0, 2, 1),
    ('junior', 'Junior', 2, 4, 2),
    ('mid', 'Mid-Level', 4, 7, 3),
    ('senior', 'Senior', 7, 12, 4),
    ('lead', 'Lead', 10, 15, 5),
    ('manager', 'Manager', 8, 15, 6),
    ('director', 'Director', 12, 20, 7),
    ('vp', 'Vice President', 15, 25, 8),
    ('c_level', 'C-Level Executive', 20, 40, 9)
ON CONFLICT (code) DO NOTHING;

-- Add remaining lookup tables here (abbreviated for clarity)
-- ... (copy from full migration)

-- ============================================================================
-- SECTION 3: JUNCTION TABLES (Safe - uses IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    pain_point TEXT NOT NULL,
    category TEXT,
    severity TEXT DEFAULT 'medium',
    frequency TEXT DEFAULT 'often',
    is_ai_addressable BOOLEAN DEFAULT NULL,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add remaining junction tables here
-- ... (copy from full migration)

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT 'Migration Status Check' as status;

SELECT COUNT(*) as persona_count FROM personas;
SELECT COUNT(*) as pain_points_count FROM persona_pain_points;

-- END; -- Commented out
