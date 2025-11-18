-- Digital Health Personas & JTBD - Comprehensive Schema
-- Migration to create/update tables for complete persona and JTBD data
-- Generated: 2025-11-08

BEGIN;

-- ============================================================================
-- DIGITAL HEALTH PERSONAS TABLE (Enhanced)
-- ============================================================================

-- Drop existing view if it exists (for backward compatibility)
DROP VIEW IF EXISTS public.dh_persona CASCADE;

-- Create or update the dh_personas table with comprehensive schema
CREATE TABLE IF NOT EXISTS public.dh_personas (
    -- Core Identity
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id TEXT UNIQUE NOT NULL,
    persona_code TEXT UNIQUE NOT NULL, -- e.g., P001, P002
    
    -- Basic Information
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    organization TEXT,
    background TEXT,
    
    -- Classification
    sector TEXT, -- Industry category (Pharma, Payer, Provider, Startup, etc.)
    tier INTEGER DEFAULT 3 CHECK (tier BETWEEN 1 AND 5), -- Priority tier (1=highest, 5=lowest)
    function TEXT, -- Department/area (Medical Affairs, Commercial, Technology, etc.)
    role_category TEXT, -- Specific job category
    
    -- Organization Details
    org_type TEXT, -- Organization category (Pharma, Health System, Startup, etc.)
    org_size TEXT, -- Employee count/revenue range
    budget_authority TEXT, -- Decision authority ($)
    team_size TEXT, -- Direct reports
    
    -- Scoring Metrics (1-10 scale)
    value_score INTEGER DEFAULT 5 CHECK (value_score BETWEEN 1 AND 10), -- Revenue potential
    pain_score INTEGER DEFAULT 5 CHECK (pain_score BETWEEN 1 AND 10), -- Problem severity
    adoption_score INTEGER DEFAULT 5 CHECK (adoption_score BETWEEN 1 AND 10), -- AI readiness
    ease_score INTEGER DEFAULT 5 CHECK (ease_score BETWEEN 1 AND 10), -- Implementation ease
    strategic_score INTEGER DEFAULT 5 CHECK (strategic_score BETWEEN 1 AND 10), -- Platform importance
    network_score INTEGER DEFAULT 5 CHECK (network_score BETWEEN 1 AND 10), -- Influence factor
    priority_score NUMERIC(5,2) GENERATED ALWAYS AS (
        (value_score * 0.25 + pain_score * 0.20 + adoption_score * 0.15 + 
         ease_score * 0.15 + strategic_score * 0.15 + network_score * 0.10)
    ) STORED, -- Weighted average
    
    -- Key Attributes
    key_need TEXT, -- Primary use case
    decision_cycle TEXT, -- Purchase timeline
    
    -- Detailed Profile Information
    therapeutic_areas TEXT,
    programs_managed TEXT,
    budget TEXT,
    team TEXT,
    focus TEXT,
    projects TEXT,
    specialization TEXT,
    certifications TEXT,
    experience TEXT,
    
    -- Array Fields (JSONB for flexibility)
    responsibilities JSONB DEFAULT '[]'::jsonb,
    pain_points JSONB DEFAULT '[]'::jsonb,
    goals JSONB DEFAULT '[]'::jsonb,
    needs JSONB DEFAULT '[]'::jsonb,
    behaviors JSONB DEFAULT '[]'::jsonb,
    typical_titles JSONB DEFAULT '[]'::jsonb,
    preferred_channels JSONB DEFAULT '[]'::jsonb,
    frustrations JSONB DEFAULT '[]'::jsonb,
    motivations JSONB DEFAULT '[]'::jsonb,
    
    -- Persona Attributes (from existing schema)
    expertise_level TEXT,
    decision_authority TEXT,
    ai_relationship TEXT,
    tech_proficiency TEXT,
    
    -- Relationships
    primary_role_id uuid REFERENCES public.org_roles(id) ON DELETE SET NULL,
    industry_id uuid REFERENCES public.industries(id) ON DELETE SET NULL,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'Digital Health JTBD Library',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Additional context
    notes TEXT,
    tags JSONB DEFAULT '[]'::jsonb
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dh_personas_sector ON public.dh_personas(sector);
CREATE INDEX IF NOT EXISTS idx_dh_personas_tier ON public.dh_personas(tier);
CREATE INDEX IF NOT EXISTS idx_dh_personas_function ON public.dh_personas(function);
CREATE INDEX IF NOT EXISTS idx_dh_personas_priority_score ON public.dh_personas(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_dh_personas_industry_id ON public.dh_personas(industry_id);
CREATE INDEX IF NOT EXISTS idx_dh_personas_primary_role_id ON public.dh_personas(primary_role_id);
CREATE INDEX IF NOT EXISTS idx_dh_personas_is_active ON public.dh_personas(is_active);

-- RLS Policies
ALTER TABLE public.dh_personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.dh_personas;
CREATE POLICY "Enable read access for all users" ON public.dh_personas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.dh_personas;
CREATE POLICY "Enable insert access for authenticated users" ON public.dh_personas FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.dh_personas;
CREATE POLICY "Enable update access for authenticated users" ON public.dh_personas FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.dh_personas;
CREATE POLICY "Enable delete access for authenticated users" ON public.dh_personas FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- JTBD LIBRARY TABLE (Enhanced)
-- ============================================================================

-- Add new columns to existing jtbd_library table if they don't exist
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS jtbd_code TEXT;
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS unique_id TEXT;
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS original_id TEXT;

-- JTBD Classification and Scoring
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS statement TEXT;
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS importance INTEGER CHECK (importance BETWEEN 1 AND 10);
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS satisfaction INTEGER CHECK (satisfaction BETWEEN 1 AND 10);
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS opportunity_score INTEGER CHECK (opportunity_score BETWEEN 1 AND 20);

-- Success Metrics
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS success_metrics JSONB DEFAULT '[]'::jsonb;

-- Relationships
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS industry_id uuid REFERENCES public.industries(id) ON DELETE SET NULL;
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS org_function_id uuid REFERENCES public.org_functions(id) ON DELETE SET NULL;

-- Source and metadata
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Digital Health JTBD Library';
ALTER TABLE public.jtbd_library ADD COLUMN IF NOT EXISTS persona_context TEXT;

-- Update existing columns if needed
UPDATE public.jtbd_library SET jtbd_code = id WHERE jtbd_code IS NULL;
UPDATE public.jtbd_library SET unique_id = LOWER(id) WHERE unique_id IS NULL;
UPDATE public.jtbd_library SET statement = goal WHERE statement IS NULL AND goal IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jtbd_library_jtbd_code ON public.jtbd_library(jtbd_code);
CREATE INDEX IF NOT EXISTS idx_jtbd_library_unique_id ON public.jtbd_library(unique_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_library_opportunity_score ON public.jtbd_library(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_jtbd_library_industry_id ON public.jtbd_library(industry_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_library_org_function_id ON public.jtbd_library(org_function_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_library_importance ON public.jtbd_library(importance DESC);

-- ============================================================================
-- JTBD-PERSONA MAPPING TABLE (Enhanced)
-- ============================================================================

-- Enhance the existing jtbd_org_persona_mapping table
ALTER TABLE public.jtbd_org_persona_mapping ADD COLUMN IF NOT EXISTS persona_dh_id uuid REFERENCES public.dh_personas(id) ON DELETE CASCADE;
ALTER TABLE public.jtbd_org_persona_mapping ADD COLUMN IF NOT EXISTS typical_frequency TEXT;
ALTER TABLE public.jtbd_org_persona_mapping ADD COLUMN IF NOT EXISTS use_case_examples TEXT;
ALTER TABLE public.jtbd_org_persona_mapping ADD COLUMN IF NOT EXISTS expected_benefit TEXT;
ALTER TABLE public.jtbd_org_persona_mapping ADD COLUMN IF NOT EXISTS adoption_barriers JSONB DEFAULT '[]'::jsonb;

-- Create index
CREATE INDEX IF NOT EXISTS idx_jtbd_persona_mapping_persona_dh_id ON public.jtbd_org_persona_mapping(persona_dh_id);

-- ============================================================================
-- COMPREHENSIVE VIEWS
-- ============================================================================

-- View: Complete Persona Profile with all details
CREATE OR REPLACE VIEW public.v_dh_personas_complete AS
SELECT
    p.id,
    p.unique_id,
    p.persona_code,
    p.name,
    p.title,
    p.organization,
    p.sector,
    p.tier,
    p.function,
    p.role_category,
    p.org_type,
    p.org_size,
    p.budget_authority,
    p.team_size,
    p.value_score,
    p.pain_score,
    p.adoption_score,
    p.ease_score,
    p.strategic_score,
    p.network_score,
    p.priority_score,
    p.key_need,
    p.decision_cycle,
    p.responsibilities,
    p.pain_points,
    p.goals,
    p.needs,
    p.behaviors,
    p.ai_relationship,
    p.tech_proficiency,
    p.expertise_level,
    p.decision_authority,
    -- Organizational context
    i.industry_name,
    i.unique_id AS industry_unique_id,
    r.org_role AS primary_role,
    r.unique_id AS role_unique_id,
    d.org_department AS department,
    f.org_function AS org_function,
    -- JTBD count
    (SELECT COUNT(*) FROM public.jtbd_org_persona_mapping jpm WHERE jpm.persona_id = p.id OR jpm.persona_dh_id = p.id) AS jtbd_count,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.dh_personas p
LEFT JOIN public.industries i ON p.industry_id = i.id
LEFT JOIN public.org_roles r ON p.primary_role_id = r.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON d.function_id = f.id;

-- View: JTBD with Persona Mappings
CREATE OR REPLACE VIEW public.v_jtbd_persona_mapping AS
SELECT
    j.id AS jtbd_id,
    j.jtbd_code,
    j.unique_id AS jtbd_unique_id,
    j.title AS jtbd_title,
    j.statement AS jtbd_statement,
    j.frequency,
    j.importance,
    j.satisfaction,
    j.opportunity_score,
    j.success_metrics,
    -- Persona details
    p.id AS persona_id,
    p.unique_id AS persona_unique_id,
    p.persona_code,
    p.name AS persona_name,
    p.title AS persona_title,
    p.sector,
    p.function,
    p.priority_score AS persona_priority,
    -- Mapping details
    jpm.relevance_score,
    jpm.typical_frequency,
    jpm.use_case_examples,
    jpm.expected_benefit,
    jpm.adoption_barriers,
    -- Industry/Function context
    i.industry_name,
    of.org_function
FROM public.jtbd_library j
LEFT JOIN public.jtbd_org_persona_mapping jpm ON j.id = jpm.jtbd_id
LEFT JOIN public.dh_personas p ON jpm.persona_dh_id = p.id OR jpm.persona_id = p.id
LEFT JOIN public.industries i ON j.industry_id = i.id
LEFT JOIN public.org_functions of ON j.org_function_id = of.id;

-- View: Top Priority Personas by Score
CREATE OR REPLACE VIEW public.v_top_priority_personas AS
SELECT
    p.*,
    COUNT(jpm.id) AS total_jtbds,
    AVG(j.opportunity_score) AS avg_jtbd_opportunity
FROM public.dh_personas p
LEFT JOIN public.jtbd_org_persona_mapping jpm ON jpm.persona_dh_id = p.id OR jpm.persona_id = p.id
LEFT JOIN public.jtbd_library j ON jpm.jtbd_id = j.id
WHERE p.is_active = true
GROUP BY p.id
ORDER BY p.priority_score DESC, avg_jtbd_opportunity DESC;

-- View: High-Opportunity JTBDs by Persona
CREATE OR REPLACE VIEW public.v_high_opportunity_jtbds AS
SELECT
    j.id,
    j.jtbd_code,
    j.title,
    j.statement,
    j.opportunity_score,
    j.importance,
    j.satisfaction,
    i.industry_name,
    of.org_function,
    COUNT(DISTINCT jpm.persona_dh_id) AS persona_count,
    json_agg(DISTINCT jsonb_build_object(
        'persona_name', p.name,
        'persona_code', p.persona_code,
        'sector', p.sector,
        'priority_score', p.priority_score
    )) AS mapped_personas
FROM public.jtbd_library j
LEFT JOIN public.jtbd_org_persona_mapping jpm ON j.id = jpm.jtbd_id
LEFT JOIN public.dh_personas p ON jpm.persona_dh_id = p.id OR jpm.persona_id = p.id
LEFT JOIN public.industries i ON j.industry_id = i.id
LEFT JOIN public.org_functions of ON j.org_function_id = of.id
WHERE j.opportunity_score >= 15 AND j.is_active = true
GROUP BY j.id, i.industry_name, of.org_function
ORDER BY j.opportunity_score DESC;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to calculate persona priority score manually (if needed)
CREATE OR REPLACE FUNCTION calculate_persona_priority(
    p_value INTEGER,
    p_pain INTEGER,
    p_adoption INTEGER,
    p_ease INTEGER,
    p_strategic INTEGER,
    p_network INTEGER
) RETURNS NUMERIC AS $$
BEGIN
    RETURN (p_value * 0.25 + p_pain * 0.20 + p_adoption * 0.15 + 
            p_ease * 0.15 + p_strategic * 0.15 + p_network * 0.10);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get persona's highest opportunity JTBDs
CREATE OR REPLACE FUNCTION get_persona_top_jtbds(p_persona_id uuid, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
    jtbd_id uuid,
    jtbd_code TEXT,
    title TEXT,
    opportunity_score INTEGER,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.jtbd_code,
        j.title,
        j.opportunity_score,
        jpm.relevance_score
    FROM public.jtbd_library j
    JOIN public.jtbd_org_persona_mapping jpm ON j.id = jpm.jtbd_id
    WHERE jpm.persona_dh_id = p_persona_id OR jpm.persona_id = p_persona_id
    ORDER BY j.opportunity_score DESC, jpm.relevance_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for dh_personas updated_at
DROP TRIGGER IF EXISTS update_dh_personas_updated_at ON public.dh_personas;
CREATE TRIGGER update_dh_personas_updated_at
    BEFORE UPDATE ON public.dh_personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify schema
SELECT 'dh_personas table columns:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dh_personas' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'jtbd_library enhanced columns:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jtbd_library' AND table_schema = 'public'
AND column_name IN ('jtbd_code', 'unique_id', 'statement', 'opportunity_score', 'success_metrics')
ORDER BY ordinal_position;

-- Count existing records
SELECT 
    'Existing Records' AS info,
    (SELECT COUNT(*) FROM public.dh_personas) AS dh_personas_count,
    (SELECT COUNT(*) FROM public.jtbd_library) AS jtbd_library_count,
    (SELECT COUNT(*) FROM public.jtbd_org_persona_mapping) AS jtbd_persona_mappings_count;

