-- ============================================================================
-- Migration 034: Medical Affairs Agent Additional Metadata Enrichment
-- Date: 2025-12-02
-- Purpose: Complete remaining metadata fields for all MA agents
-- ============================================================================
--
-- Fields covered:
--   - years_of_experience / expertise_years
--   - certifications (JSONB)
--   - version
--   - token_budget_min/max/recommended
--   - escalation routing (can_escalate_to, reports_to_agent_id)
--
-- ============================================================================

-- ============================================================================
-- PART 1: YEARS OF EXPERIENCE BY LEVEL
-- ============================================================================

-- L1 Masters - Executive level (15-20 years)
UPDATE agents SET
  years_of_experience = 18,
  expertise_years = 18
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0)
  AND status = 'active';

-- L2 Experts - Director level (12-15 years)
UPDATE agents SET
  years_of_experience = 12,
  expertise_years = 12
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0)
  AND status = 'active';

-- L3 Specialists - Manager level (7-10 years)
UPDATE agents SET
  years_of_experience = 8,
  expertise_years = 8
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0)
  AND status = 'active';

-- L4 Workers - Entry/Mid level (2-5 years)
UPDATE agents SET
  years_of_experience = 3,
  expertise_years = 3
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0)
  AND status = 'active';

-- L5 Tools - N/A for tools but set to 1 for completeness
UPDATE agents SET
  years_of_experience = 1,
  expertise_years = 1
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (years_of_experience IS NULL OR years_of_experience = 0)
  AND status = 'active';

-- ============================================================================
-- PART 2: CERTIFICATIONS BY DEPARTMENT
-- ============================================================================

-- Safety/Pharmacovigilance certifications
UPDATE agents SET
  certifications = jsonb_build_array(
    jsonb_build_object('name', 'Certified Drug Safety Associate (CDSA)', 'issuer', 'ACRP', 'year', 2020),
    jsonb_build_object('name', 'MedDRA Certification', 'issuer', 'MedDRA MSSO', 'year', 2023),
    jsonb_build_object('name', 'Good Pharmacovigilance Practice', 'issuer', 'DIA', 'year', 2022)
  )
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%safety%' OR department_name LIKE '%Pharmacovigilance%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb)
  AND status = 'active';

-- MSL certifications
UPDATE agents SET
  certifications = jsonb_build_array(
    jsonb_build_object('name', 'Board Certified Medical Science Liaison', 'issuer', 'MSLS', 'year', 2021),
    jsonb_build_object('name', 'Advanced MSL Training', 'issuer', 'MSL Society', 'year', 2022)
  )
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%msl%' OR department_name LIKE '%MSL%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb)
  AND status = 'active';

-- Medical Writing certifications
UPDATE agents SET
  certifications = jsonb_build_array(
    jsonb_build_object('name', 'Certified Medical Publication Professional (CMPP)', 'issuer', 'ISMPP', 'year', 2020),
    jsonb_build_object('name', 'Medical Writing Certification', 'issuer', 'AMWA', 'year', 2019)
  )
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%writer%' OR slug LIKE '%medcomms%' OR department_name LIKE '%Communications%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb)
  AND status = 'active';

-- HEOR certifications
UPDATE agents SET
  certifications = jsonb_build_array(
    jsonb_build_object('name', 'Health Technology Assessment Certification', 'issuer', 'ISPOR', 'year', 2021),
    jsonb_build_object('name', 'Certified Health Economist', 'issuer', 'iHEA', 'year', 2020)
  )
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%heor%' OR slug LIKE '%economist%' OR department_name LIKE '%HEOR%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb)
  AND status = 'active';

-- Medical Education certifications
UPDATE agents SET
  certifications = jsonb_build_array(
    jsonb_build_object('name', 'CME/CE Accreditation Specialist', 'issuer', 'ACCME', 'year', 2021),
    jsonb_build_object('name', 'Adult Learning Certification', 'issuer', 'ATD', 'year', 2020)
  )
WHERE function_name = 'Medical Affairs'
  AND (slug LIKE '%meded%' OR slug LIKE '%education%' OR department_name LIKE '%Education%')
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb)
  AND status = 'active';

-- Default Medical Affairs certifications for remaining
UPDATE agents SET
  certifications = jsonb_build_array(
    jsonb_build_object('name', 'Certified Medical Affairs Specialist', 'issuer', 'DIA', 'year', 2021),
    jsonb_build_object('name', 'GCP Certification', 'issuer', 'ACRP', 'year', 2022)
  )
WHERE function_name = 'Medical Affairs'
  AND agent_level_id IN (SELECT id FROM agent_levels WHERE level_number <= 3)
  AND (certifications IS NULL OR certifications = '[]'::jsonb)
  AND status = 'active';

-- ============================================================================
-- PART 3: VERSION NUMBERING
-- ============================================================================

-- All MA agents get version 1.0.0 as baseline
UPDATE agents SET
  version = '1.0.0'
WHERE function_name = 'Medical Affairs'
  AND (version IS NULL OR version = '')
  AND status = 'active';

-- ============================================================================
-- PART 4: TOKEN BUDGETS BY LEVEL
-- ============================================================================

-- L1 Masters - Highest budget for complex orchestration
UPDATE agents SET
  token_budget_min = 2000,
  token_budget_max = 8000,
  token_budget_recommended = 4000
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 1 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0)
  AND status = 'active';

-- L2 Experts - High budget for strategic decisions
UPDATE agents SET
  token_budget_min = 1500,
  token_budget_max = 6000,
  token_budget_recommended = 3000
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0)
  AND status = 'active';

-- L3 Specialists - Medium budget for domain expertise
UPDATE agents SET
  token_budget_min = 1000,
  token_budget_max = 4000,
  token_budget_recommended = 2000
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0)
  AND status = 'active';

-- L4 Workers - Lower budget for task execution
UPDATE agents SET
  token_budget_min = 500,
  token_budget_max = 2000,
  token_budget_recommended = 1000
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0)
  AND status = 'active';

-- L5 Tools - Minimal budget for atomic operations
UPDATE agents SET
  token_budget_min = 100,
  token_budget_max = 500,
  token_budget_recommended = 250
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (token_budget_recommended IS NULL OR token_budget_recommended = 0)
  AND status = 'active';

-- ============================================================================
-- PART 5: ESCALATION ROUTING
-- ============================================================================

-- Set reports_to_agent_id for L2 (reports to L1)
UPDATE agents SET
  reports_to_agent_id = (SELECT id FROM agents WHERE slug = 'vp-medical-affairs' LIMIT 1)
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND reports_to_agent_id IS NULL
  AND status = 'active';

-- Set can_escalate_to for L2 heads
UPDATE agents SET
  can_escalate_to = 'vp-medical-affairs'
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 2 LIMIT 1)
  AND (can_escalate_to IS NULL OR can_escalate_to = '')
  AND status = 'active';

-- L3 Specialists - escalate to their department head
UPDATE agents a SET
  can_escalate_to = CASE
    WHEN a.slug = 'msl-specialist' THEN 'head-of-msl'
    WHEN a.slug = 'medinfo-scientist' THEN 'head-of-medinfo'
    WHEN a.slug = 'medical-writer' THEN 'head-of-medcomms'
    WHEN a.slug = 'safety-scientist' THEN 'head-of-safety'
    WHEN a.slug = 'health-economist' THEN 'head-of-heor'
    WHEN a.slug = 'kol-strategist' THEN 'head-of-kol'
    WHEN a.slug = 'meded-specialist' THEN 'head-of-meded'
    WHEN a.slug = 'medstrategy-analyst' THEN 'head-of-medstrategy'
    ELSE 'vp-medical-affairs'
  END
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 3 LIMIT 1)
  AND (a.can_escalate_to IS NULL OR a.can_escalate_to = '')
  AND a.status = 'active';

-- L4 Workers - escalate to their L3 specialist
UPDATE agents a SET
  can_escalate_to = CASE
    WHEN a.slug LIKE '%msl%' THEN 'msl-specialist'
    WHEN a.slug LIKE '%medinfo%' OR a.slug = 'medical-information-specialist' THEN 'medinfo-scientist'
    WHEN a.slug LIKE '%publication%' OR a.slug LIKE '%medcomms%' THEN 'medical-writer'
    WHEN a.slug LIKE '%safety%' THEN 'safety-scientist'
    WHEN a.slug LIKE '%heor%' THEN 'health-economist'
    WHEN a.slug LIKE '%kol%' THEN 'kol-strategist'
    WHEN a.slug LIKE '%meded%' THEN 'meded-specialist'
    WHEN a.slug LIKE '%strategy%' THEN 'medstrategy-analyst'
    ELSE 'medaffairs-generalist'
  END
WHERE a.function_name = 'Medical Affairs'
  AND a.agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 4 LIMIT 1)
  AND (a.can_escalate_to IS NULL OR a.can_escalate_to = '')
  AND a.status = 'active';

-- L5 Tools - escalate to context engineer (no escalation typically)
UPDATE agents SET
  can_escalate_to = 'generic-context-engineer'
WHERE function_name = 'Medical Affairs'
  AND agent_level_id = (SELECT id FROM agent_levels WHERE level_number = 5 LIMIT 1)
  AND (can_escalate_to IS NULL OR can_escalate_to = '')
  AND status = 'active';

-- ============================================================================
-- PART 6: METADATA CONSOLIDATION
-- Add enrichment_version to track migration state
-- ============================================================================

UPDATE agents SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'enrichment_version', '034',
    'enrichment_date', NOW()::text,
    'enrichment_scope', 'comprehensive',
    'migrations_applied', ARRAY['027', '028', '029', '030', '031', '032', '033', '034']
  )
WHERE function_name = 'Medical Affairs'
  AND status = 'active';

-- ============================================================================
-- PART 7: VALIDATION STATUS UPDATE
-- Mark enriched agents as validated
-- ============================================================================

UPDATE agents SET
  validation_status = 'validated'
WHERE function_name = 'Medical Affairs'
  AND status = 'active'
  AND prompt_section_you_are IS NOT NULL
  AND prompt_section_you_do IS NOT NULL
  AND model_justification IS NOT NULL;

-- ============================================================================
-- PART 8: COMPREHENSIVE VERIFICATION
-- ============================================================================

-- Overall enrichment summary
SELECT
  'MA Agent Enrichment Summary' as report,
  COUNT(*) as total_agents,
  COUNT(model_justification) as with_model_justification,
  COUNT(model_citation) as with_model_citation,
  COUNT(CASE WHEN personality_formality > 0 THEN 1 END) as with_personality,
  COUNT(CASE WHEN comm_verbosity > 0 THEN 1 END) as with_comm_style,
  COUNT(prompt_section_you_are) as with_prompt_sections,
  COUNT(CASE WHEN years_of_experience > 0 THEN 1 END) as with_experience,
  COUNT(CASE WHEN certifications IS NOT NULL AND certifications != '[]' THEN 1 END) as with_certifications,
  COUNT(version) as with_version,
  COUNT(CASE WHEN token_budget_recommended > 0 THEN 1 END) as with_token_budget,
  COUNT(can_escalate_to) as with_escalation_path
FROM agents
WHERE function_name = 'Medical Affairs' AND status = 'active';

-- Junction table summary
SELECT
  'Junction Tables' as report,
  (SELECT COUNT(DISTINCT agent_id) FROM agent_capabilities ac JOIN agents a ON ac.agent_id = a.id WHERE a.function_name = 'Medical Affairs') as agents_with_capabilities,
  (SELECT COUNT(DISTINCT agent_id) FROM agent_skill_assignments asa JOIN agents a ON asa.agent_id = a.id WHERE a.function_name = 'Medical Affairs') as agents_with_skills,
  (SELECT COUNT(DISTINCT agent_id) FROM agent_responsibilities ar JOIN agents a ON ar.agent_id = a.id WHERE a.function_name = 'Medical Affairs') as agents_with_responsibilities,
  (SELECT COUNT(DISTINCT agent_id) FROM agent_prompt_starters aps JOIN agents a ON aps.agent_id = a.id WHERE a.function_name = 'Medical Affairs') as agents_with_prompt_starters;

-- By level summary
SELECT
  al.level_number,
  al.level_name,
  COUNT(a.*) as agents,
  AVG(a.years_of_experience) as avg_experience,
  AVG(a.token_budget_recommended) as avg_token_budget,
  COUNT(CASE WHEN a.validation_status = 'validated' THEN 1 END) as validated
FROM agents a
JOIN agent_levels al ON a.agent_level_id = al.id
WHERE a.function_name = 'Medical Affairs'
  AND a.status = 'active'
GROUP BY al.level_number, al.level_name
ORDER BY al.level_number;

-- Final migration status
SELECT
  'Migration 034 Complete' as status,
  NOW() as completed_at,
  (SELECT COUNT(*) FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active') as total_ma_agents,
  (SELECT COUNT(*) FROM agents WHERE function_name = 'Medical Affairs' AND status = 'active' AND validation_status = 'validated') as validated_agents;
