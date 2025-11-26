-- ============================================================================
-- AgentOS Capabilities Seeding - FINAL CORRECT SCHEMA
-- File: 20251127-seed-capabilities-FINAL.sql
-- ============================================================================
-- Schema: name, slug, description, capability_type, maturity_level, tags
-- Based on actual table structure from database
-- ============================================================================

BEGIN;

INSERT INTO capabilities (
    name,
    slug,
    description,
    capability_type,
    maturity_level,
    tags,
    is_active
) VALUES

-- MEDICAL AFFAIRS CAPABILITIES (24 sample)

-- Leadership (4)
('C-Suite Medical Leadership', 'c-suite-medical-leadership', 'Executive-level medical leadership across enterprise', 'leadership', 'expert', ARRAY['medical-affairs', 'leadership', 'strategic'], true),
('VP-Level Medical Strategy', 'vp-medical-strategy', 'Regional/global medical affairs strategy', 'leadership', 'expert', ARRAY['medical-affairs', 'leadership', 'strategic'], true),
('Medical Affairs Directorate Management', 'medical-affairs-directorate', 'Leading medical affairs function or TA', 'leadership', 'advanced', ARRAY['medical-affairs', 'leadership', 'management'], true),
('Medical Governance & Compliance Leadership', 'medical-governance-leadership', 'Medical governance frameworks and compliance', 'business', 'advanced', ARRAY['medical-affairs', 'governance', 'compliance'], true),

-- Field Medical (6)
('MSL Core Competency - KOL Engagement', 'msl-kol-engagement', 'Building relationships with KOLs', 'interpersonal', 'expert', ARRAY['medical-affairs', 'field-medical', 'engagement'], true),
('MSL Territory & Account Management', 'msl-territory-management', 'Strategic territory management', 'business', 'advanced', ARRAY['medical-affairs', 'field-medical', 'operations'], true),
('MSL Scientific Presentation & Education', 'msl-scientific-presentation', 'Scientific presentations and education', 'interpersonal', 'advanced', ARRAY['medical-affairs', 'field-medical', 'education'], true),
('MSL Clinical Trial Support', 'msl-clinical-trial-support', 'Supporting clinical trial activities', 'technical', 'advanced', ARRAY['medical-affairs', 'field-medical', 'clinical'], true),
('Field Medical Team Leadership', 'field-medical-team-leadership', 'Leading MSL teams', 'leadership', 'expert', ARRAY['medical-affairs', 'field-medical', 'leadership'], true),
('Congress & Conference Management', 'congress-conference-management', 'Planning and executing congress strategies', 'business', 'advanced', ARRAY['medical-affairs', 'field-medical', 'events'], true),

-- Medical Writing & Publications (5)
('Regulatory Medical Writing', 'regulatory-medical-writing', 'Writing regulatory documents', 'technical', 'expert', ARRAY['medical-affairs', 'medical-writing', 'regulatory'], true),
('Clinical Manuscript Development', 'clinical-manuscript-development', 'Developing peer-reviewed manuscripts', 'technical', 'expert', ARRAY['medical-affairs', 'publications', 'scientific-writing'], true),
('Congress Abstract & Poster Creation', 'congress-abstract-poster', 'Creating congress materials', 'technical', 'advanced', ARRAY['medical-affairs', 'publications', 'scientific-writing'], true),
('Publication Planning & Strategy', 'publication-planning', 'Strategic publication planning', 'business', 'expert', ARRAY['medical-affairs', 'publications', 'strategic'], true),
('Scientific Communications Development', 'scientific-communications', 'Creating scientific communications', 'technical', 'advanced', ARRAY['medical-affairs', 'communications', 'scientific-writing'], true),

-- Medical Information (4)
('Medical Inquiry Response Management', 'medical-inquiry-response', 'Responding to medical inquiries', 'business', 'advanced', ARRAY['medical-affairs', 'medical-information', 'operations'], true),
('Medical Information Database Management', 'mi-database-management', 'Managing MI reference library', 'technical', 'intermediate', ARRAY['medical-affairs', 'medical-information', 'data-management'], true),
('Adverse Event Processing & Reporting', 'adverse-event-processing', 'Processing and reporting AEs', 'technical', 'advanced', ARRAY['medical-affairs', 'medical-information', 'safety'], true),
('Medical Information Operations', 'mi-operations', 'Managing MI operations', 'business', 'expert', ARRAY['medical-affairs', 'medical-information', 'operations'], true),

-- Medical Education (4)
('Medical Education Strategy & Planning', 'medical-education-strategy', 'Developing medical education strategy', 'business', 'expert', ARRAY['medical-affairs', 'medical-education', 'strategic'], true),
('Internal Sales Force Training', 'sales-force-training', 'Training commercial teams', 'interpersonal', 'advanced', ARRAY['medical-affairs', 'medical-education', 'training'], true),
('Digital Medical Education Development', 'digital-medical-education', 'Creating digital education', 'technical', 'advanced', ARRAY['medical-affairs', 'medical-education', 'digital'], true),
('HCP Education Program Execution', 'hcp-education-programs', 'Executing HCP education programs', 'business', 'advanced', ARRAY['medical-affairs', 'medical-education', 'operations'], true);

-- Note: ON CONFLICT removed because slug column doesn't have UNIQUE constraint
-- If you need to update existing records, delete them first:
-- DELETE FROM capabilities WHERE 'medical-affairs' = ANY(tags);

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    '✅ SEEDING COMPLETE!' as status,
    COUNT(*) as total_capabilities,
    COUNT(DISTINCT capability_type) as capability_types,
    array_agg(DISTINCT capability_type) as types_present
FROM capabilities
WHERE 'medical-affairs' = ANY(tags);

-- Show breakdown by type
SELECT 
    capability_type,
    maturity_level,
    COUNT(*) as count
FROM capabilities
WHERE 'medical-affairs' = ANY(tags)
GROUP BY capability_type, maturity_level
ORDER BY capability_type, maturity_level;

-- Show all capabilities
SELECT 
    name,
    capability_type,
    maturity_level,
    array_to_string(tags, ', ') as tags
FROM capabilities
WHERE 'medical-affairs' = ANY(tags)
ORDER BY capability_type, name;

