-- =====================================================================
-- PHASE 4.1: MEDICAL AFFAIRS PERSONA EXTENSIONS
-- Creates specialized attributes for Medical Affairs personas
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 4.1: MEDICAL AFFAIRS PERSONA EXTENSIONS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. PERSONA_MEDICAL_AFFAIRS_ATTRIBUTES
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating persona_medical_affairs_attributes...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_medical_affairs_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE UNIQUE,
    
    -- Medical/Scientific Background
    medical_degree_type TEXT CHECK (medical_degree_type IN ('MD', 'DO', 'PhD', 'PharmD', 'MS', 'BS', 'RN', 'other', 'none')),
    board_certified BOOLEAN DEFAULT false,
    clinical_specialty TEXT,
    
    -- Experience & Expertise
    therapeutic_area_expertise TEXT[],
    years_in_medical_affairs INTEGER,
    years_in_clinical_practice INTEGER,
    years_in_research INTEGER,
    
    -- Academic & Research Profile
    publication_count INTEGER DEFAULT 0,
    h_index INTEGER,
    presentations_count INTEGER DEFAULT 0,
    manuscripts_authored INTEGER DEFAULT 0,
    
    -- Network & Influence
    kol_network_size INTEGER,
    professional_associations TEXT[],
    speaking_engagements_per_year INTEGER,
    
    -- Regulatory & Compliance
    regulatory_experience TEXT[],
    gcp_certified BOOLEAN DEFAULT false,
    regulatory_submission_experience BOOLEAN DEFAULT false,
    
    -- Clinical Trials
    clinical_trial_experience TEXT CHECK (clinical_trial_experience IN ('none', 'site_investigator', 'sub_investigator', 'medical_monitor', 'extensive')),
    phases_experienced TEXT[], -- ['phase_i', 'phase_ii', 'phase_iii', 'phase_iv']
    trials_led_count INTEGER DEFAULT 0,
    
    -- Medical Information & Communications
    medical_writing_experience BOOLEAN DEFAULT false,
    peer_review_experience BOOLEAN DEFAULT false,
    advisory_board_experience BOOLEAN DEFAULT false,
    
    -- Languages & Global Experience
    languages_spoken TEXT[],
    countries_worked_in TEXT[],
    global_launch_experience BOOLEAN DEFAULT false,
    
    -- Technology & Digital
    medical_ai_tools_proficiency TEXT CHECK (medical_ai_tools_proficiency IN ('none', 'basic', 'intermediate', 'advanced', 'expert')),
    clinical_data_analysis_tools TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persona_med_affairs_persona ON public.persona_medical_affairs_attributes(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_med_affairs_degree ON public.persona_medical_affairs_attributes(medical_degree_type);
CREATE INDEX IF NOT EXISTS idx_persona_med_affairs_therapeutic_areas ON public.persona_medical_affairs_attributes USING GIN(therapeutic_area_expertise);
CREATE INDEX IF NOT EXISTS idx_persona_med_affairs_pub_count ON public.persona_medical_affairs_attributes(publication_count DESC);
CREATE INDEX IF NOT EXISTS idx_persona_med_affairs_kol_network ON public.persona_medical_affairs_attributes(kol_network_size DESC);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_medical_affairs_attributes created'; END $$;

-- =====================================================================
-- 2. HELPER VIEW - Medical Affairs Personas with Extensions
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating v_medical_affairs_personas_full...'; END $$;

CREATE OR REPLACE VIEW v_medical_affairs_personas_full AS
SELECT 
    p.id AS persona_id,
    p.name AS persona_name,
    p.slug AS persona_slug,
    p.title,
    p.archetype,
    p.seniority_level,
    p.role_id,
    p.role_name,
    p.department_id,
    p.department_name,
    p.function_id,
    p.function_name,
    
    -- Medical Affairs specific attributes
    ma.medical_degree_type,
    ma.board_certified,
    ma.clinical_specialty,
    ma.therapeutic_area_expertise,
    ma.years_in_medical_affairs,
    ma.years_in_clinical_practice,
    ma.publication_count,
    ma.h_index,
    ma.kol_network_size,
    ma.regulatory_experience,
    ma.clinical_trial_experience,
    ma.medical_writing_experience,
    ma.global_launch_experience,
    ma.medical_ai_tools_proficiency
    
FROM public.personas p
LEFT JOIN public.persona_medical_affairs_attributes ma ON p.id = ma.persona_id
WHERE p.function_name = 'Medical Affairs'
  AND p.deleted_at IS NULL;

DO $$ BEGIN RAISE NOTICE '  ✓ v_medical_affairs_personas_full created'; END $$;

-- =====================================================================
-- 3. SUMMARY
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MEDICAL AFFAIRS PERSONA EXTENSIONS CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '  ✓ persona_medical_affairs_attributes';
    RAISE NOTICE '';
    RAISE NOTICE 'Views Created:';
    RAISE NOTICE '  ✓ v_medical_affairs_personas_full';
    RAISE NOTICE '';
    RAISE NOTICE 'Attributes Captured:';
    RAISE NOTICE '  • Medical degree & board certification';
    RAISE NOTICE '  • Therapeutic area expertise';
    RAISE NOTICE '  • Years of experience (MA, clinical, research)';
    RAISE NOTICE '  • Publication count, H-index, presentations';
    RAISE NOTICE '  • KOL network size';
    RAISE NOTICE '  • Regulatory & clinical trial experience';
    RAISE NOTICE '  • Medical writing & peer review';
    RAISE NOTICE '  • Global experience & languages';
    RAISE NOTICE '  • Medical AI tools proficiency';
    RAISE NOTICE '';
    RAISE NOTICE 'Next: Run create_function_extension_templates.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

