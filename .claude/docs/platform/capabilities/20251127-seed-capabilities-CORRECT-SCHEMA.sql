-- ============================================================================
-- AgentOS Capabilities Seeding - CORRECT SCHEMA
-- File: 20251127-seed-capabilities-CORRECT-SCHEMA.sql
-- ============================================================================
-- Schema: name, slug, description, category, complexity_level
-- ============================================================================

BEGIN;

INSERT INTO capabilities (
    name,
    slug,
    description,
    capability_type,
    category,
    complexity_level,
    is_public,
    metadata
) VALUES

-- MEDICAL AFFAIRS CAPABILITIES (24 sample)
-- Leadership (4)
('C-Suite Medical Leadership', 'c-suite-medical-leadership', 'Executive-level medical leadership across enterprise', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Leadership"}'),
('VP-Level Medical Strategy', 'vp-medical-strategy', 'Regional/global medical affairs strategy', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Leadership"}'),
('Medical Affairs Directorate Management', 'medical-affairs-directorate', 'Leading medical affairs function or TA', 'agent', 'strategic', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Leadership"}'),
('Medical Governance & Compliance Leadership', 'medical-governance-leadership', 'Medical governance frameworks and compliance', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Governance"}'),

-- Field Medical (6)
('MSL Core Competency - KOL Engagement', 'msl-kol-engagement', 'Building relationships with KOLs', 'agent', 'communication', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Field Medical"}'),
('MSL Territory & Account Management', 'msl-territory-management', 'Strategic territory management', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Field Medical"}'),
('MSL Scientific Presentation & Education', 'msl-scientific-presentation', 'Scientific presentations and education', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Field Medical"}'),
('MSL Clinical Trial Support', 'msl-clinical-trial-support', 'Supporting clinical trial activities', 'agent', 'clinical', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Field Medical"}'),
('Field Medical Team Leadership', 'field-medical-team-leadership', 'Leading MSL teams', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Field Medical"}'),
('Congress & Conference Management', 'congress-conference-management', 'Planning and executing congress strategies', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Field Medical"}'),

-- Medical Writing & Publications (5)
('Regulatory Medical Writing', 'regulatory-medical-writing', 'Writing regulatory documents', 'agent', 'regulatory', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Medical Writing"}'),
('Clinical Manuscript Development', 'clinical-manuscript-development', 'Developing peer-reviewed manuscripts', 'agent', 'communication', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Publications"}'),
('Congress Abstract & Poster Creation', 'congress-abstract-poster', 'Creating congress materials', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Publications"}'),
('Publication Planning & Strategy', 'publication-planning', 'Strategic publication planning', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Publications"}'),
('Scientific Communications Development', 'scientific-communications', 'Creating scientific communications', 'agent', 'communication', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Communications"}'),

-- Medical Information (4)
('Medical Inquiry Response Management', 'medical-inquiry-response', 'Responding to medical inquiries', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Medical Information"}'),
('Medical Information Database Management', 'mi-database-management', 'Managing MI reference library', 'agent', 'operational', 'intermediate', true, '{"function": "Medical Affairs", "subcategory": "Medical Information"}'),
('Adverse Event Processing & Reporting', 'adverse-event-processing', 'Processing and reporting AEs', 'agent', 'regulatory', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Medical Information"}'),
('Medical Information Operations', 'mi-operations', 'Managing MI operations', 'agent', 'operational', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Medical Information"}'),

-- Medical Education (4) - Last entry NO COMMA
('Medical Education Strategy & Planning', 'medical-education-strategy', 'Developing medical education strategy', 'agent', 'strategic', 'expert', true, '{"function": "Medical Affairs", "subcategory": "Medical Education"}'),
('Internal Sales Force Training', 'sales-force-training', 'Training commercial teams', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Medical Education"}'),
('Digital Medical Education Development', 'digital-medical-education', 'Creating digital education', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Medical Education"}'),
('HCP Education Program Execution', 'hcp-education-programs', 'Executing HCP education programs', 'agent', 'operational', 'advanced', true, '{"function": "Medical Affairs", "subcategory": "Medical Education"}')

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    complexity_level = EXCLUDED.complexity_level,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

COMMIT;

-- Verification
SELECT 
    'SEEDING COMPLETE!' as status,
    COUNT(*) as total_capabilities,
    COUNT(CASE WHEN category = 'strategic' THEN 1 END) as strategic,
    COUNT(CASE WHEN category = 'operational' THEN 1 END) as operational,
    COUNT(CASE WHEN category = 'communication' THEN 1 END) as communication,
    COUNT(CASE WHEN category = 'regulatory' THEN 1 END) as regulatory,
    COUNT(CASE WHEN category = 'clinical' THEN 1 END) as clinical
FROM capabilities
WHERE metadata->>'function' = 'Medical Affairs';

