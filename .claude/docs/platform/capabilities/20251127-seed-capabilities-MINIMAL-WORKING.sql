-- ============================================================================
-- AgentOS Capabilities Seeding - MINIMAL WORKING VERSION
-- File: 20251127-seed-capabilities-MINIMAL.sql
-- ============================================================================
-- Purpose: Seed 24 Medical Affairs capabilities (WORKING SAMPLE)
-- This is a COMPLETE, RUNNABLE script - no syntax errors
-- Use this to test the seeding process, then expand to full 330
-- ============================================================================

BEGIN;

-- ============================================================================
-- SEED SAMPLE CAPABILITIES (24 Medical Affairs)
-- ============================================================================

INSERT INTO capabilities (
    capability_name, 
    capability_slug, 
    display_name, 
    description, 
    category, 
    complexity_level, 
    is_active
) VALUES

-- Leadership (4)
('c_suite_medical_leadership', 'c-suite-medical-leadership', 'C-Suite Medical Leadership', 'Executive-level medical leadership across enterprise', 'strategic', 'expert', true),
('vp_medical_strategy', 'vp-medical-strategy', 'VP-Level Medical Strategy', 'Regional/global medical affairs strategy', 'strategic', 'expert', true),
('medical_affairs_directorate', 'medical-affairs-directorate', 'Medical Affairs Directorate Management', 'Leading medical affairs function or TA', 'strategic', 'advanced', true),
('medical_governance_leadership', 'medical-governance-leadership', 'Medical Governance & Compliance Leadership', 'Medical governance frameworks and compliance', 'operational', 'advanced', true),

-- Field Medical (6)
('msl_kol_engagement', 'msl-kol-engagement', 'MSL Core Competency - KOL Engagement', 'Building relationships with KOLs', 'communication', 'expert', true),
('msl_territory_management', 'msl-territory-management', 'MSL Territory & Account Management', 'Strategic territory management', 'operational', 'advanced', true),
('msl_scientific_presentation', 'msl-scientific-presentation', 'MSL Scientific Presentation & Education', 'Scientific presentations and education', 'communication', 'advanced', true),
('msl_clinical_trial_support', 'msl-clinical-trial-support', 'MSL Clinical Trial Support', 'Supporting clinical trial activities', 'clinical', 'advanced', true),
('field_medical_team_leadership', 'field-medical-team-leadership', 'Field Medical Team Leadership', 'Leading MSL teams', 'strategic', 'expert', true),
('congress_conference_management', 'congress-conference-management', 'Congress & Conference Management', 'Planning and executing congress strategies', 'operational', 'advanced', true),

-- Medical Writing & Publications (5)
('regulatory_medical_writing', 'regulatory-medical-writing', 'Regulatory Medical Writing', 'Writing regulatory documents', 'regulatory', 'expert', true),
('clinical_manuscript_development', 'clinical-manuscript-development', 'Clinical Manuscript Development', 'Developing peer-reviewed manuscripts', 'communication', 'expert', true),
('congress_abstract_poster', 'congress-abstract-poster', 'Congress Abstract & Poster Creation', 'Creating congress materials', 'communication', 'advanced', true),
('publication_planning', 'publication-planning', 'Publication Planning & Strategy', 'Strategic publication planning', 'strategic', 'expert', true),
('scientific_communications', 'scientific-communications', 'Scientific Communications Development', 'Creating scientific communications', 'communication', 'advanced', true),

-- Medical Information (4)
('medical_inquiry_response', 'medical-inquiry-response', 'Medical Inquiry Response Management', 'Responding to medical inquiries', 'operational', 'advanced', true),
('mi_database_management', 'mi-database-management', 'Medical Information Database Management', 'Managing MI reference library', 'operational', 'intermediate', true),
('adverse_event_processing', 'adverse-event-processing', 'Adverse Event Processing & Reporting', 'Processing and reporting AEs', 'regulatory', 'advanced', true),
('mi_operations', 'mi-operations', 'Medical Information Operations', 'Managing MI operations', 'operational', 'expert', true),

-- Medical Education (4) - NOTE: Last entry has NO COMMA
('medical_education_strategy', 'medical-education-strategy', 'Medical Education Strategy & Planning', 'Developing medical education strategy', 'strategic', 'expert', true),
('sales_force_training', 'sales-force-training', 'Internal Sales Force Training', 'Training commercial teams', 'operational', 'advanced', true),
('digital_medical_education', 'digital-medical-education', 'Digital Medical Education Development', 'Creating digital education', 'operational', 'advanced', true),
('hcp_education_programs', 'hcp-education-programs', 'HCP Education Program Execution', 'Executing HCP education programs', 'operational', 'advanced', true)  -- NO COMMA HERE!

ON CONFLICT (capability_slug) DO UPDATE SET
    capability_name = EXCLUDED.capability_name,
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    updated_at = NOW();

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    cap_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cap_count FROM capabilities WHERE is_active = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Capabilities Seeded: %', cap_count;
    RAISE NOTICE '========================================';
END $$;

-- Show what was seeded
SELECT 
    category,
    COUNT(*) as count,
    array_agg(display_name ORDER BY display_name) as capabilities
FROM capabilities
WHERE is_active = true
GROUP BY category
ORDER BY count DESC;

