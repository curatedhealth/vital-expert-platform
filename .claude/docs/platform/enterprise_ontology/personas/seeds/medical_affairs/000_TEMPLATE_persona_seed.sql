-- =====================================================================
-- PERSONA SEED TEMPLATE - HYBRID APPROACH
-- =====================================================================
-- Version: 2.1.0
-- Created: 2025-11-27
-- Purpose: Copy this template for each new Medical Affairs role
-- =====================================================================
--
-- HYBRID APPROACH:
-- - Junction tables for QUERYABLE data (skills, KPIs, training, competencies)
-- - JSONB for NARRATIVE data (goals, challenges, motivations, frustrations)
-- - JSONB for DYNAMIC data (daily_activities, tools_used)
-- - Arrays for SIMPLE LISTS (therapeutic_areas, sample_quotes)
--
-- INSTRUCTIONS:
-- 1. Copy this file and rename: 003_[role_name]_seed.sql
-- 2. Replace all {{PLACEHOLDERS}} with actual values
-- 3. Add role-specific reference data in Steps 1-7
-- 4. Update junction table population in Step 8
-- 5. Customize org_roles UPDATE in Step 9
-- 6. Customize persona INSERT in Step 10
-- 7. Test by running in Supabase SQL Editor
--
-- PLACEHOLDER REFERENCE:
-- {{ROLE_NAME}}           - e.g., "Senior MSL", "Medical Director"
-- {{ROLE_NAME_SHORT}}     - e.g., "SrMSL", "MedDir"
-- {{PERSONA_ID}}          - e.g., "PERSONA-SRMSL-001", "PERSONA-MEDDIR-001"
-- {{PERSONA_NAME}}        - e.g., "Dr. Michael Torres, Senior MSL"
-- {{DEPARTMENT}}          - e.g., "Field Medical", "Medical Affairs Leadership"
-- {{GEOGRAPHIC_SCOPE}}    - global, regional, or local (lowercase!)
-- {{LEADERSHIP_LEVEL}}    - individual_contributor, manager, director, vp, c_level
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - SKILLS
-- =====================================================================
-- Add role-specific skills. Use existing unique_ids if skill already exists.
-- Check ref_skills table first: SELECT * FROM ref_skills;

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  -- Clinical skills
  ('SKILL-XXX-001', '{{SKILL_NAME_1}}', 'Clinical', '{{DESCRIPTION}}', true),
  -- Communication skills
  ('SKILL-XXX-002', '{{SKILL_NAME_2}}', 'Communication', '{{DESCRIPTION}}', false),
  -- Technical skills
  ('SKILL-XXX-003', '{{SKILL_NAME_3}}', 'Technical', '{{DESCRIPTION}}', true)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-XXX-001', '{{COMPETENCY_NAME}}', '{{CATEGORY}}', '{{DESCRIPTION}}', 24)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - CERTIFICATIONS
-- =====================================================================

INSERT INTO ref_certifications (unique_id, certification_name, issuing_organization, renewal_required, renewal_frequency_months, pharma_specific)
VALUES
  ('CERT-XXX-001', '{{CERTIFICATION_NAME}}', '{{ISSUING_ORG}}', true, 24, true)
ON CONFLICT (unique_id) DO UPDATE SET
  certification_name = EXCLUDED.certification_name,
  issuing_organization = EXCLUDED.issuing_organization;

-- =====================================================================
-- STEP 4: REFERENCE DATA - REGULATORY FRAMEWORKS
-- =====================================================================

-- Usually reuse existing frameworks. Common ones:
-- REG-FDA-001 (FDA 21 CFR Part 312), REG-ICH-001 (ICH GCP E6 R2)
-- REG-PHRMA-001 (PhRMA Code), REG-GVP-001 (GVP Module VI)

-- =====================================================================
-- STEP 5: REFERENCE DATA - KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-{{ROLE_SHORT}}-001', '{{KPI_NAME}}', '{{CATEGORY}}', '{{UNIT}}', 'Monthly', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 6: REFERENCE DATA - THERAPEUTIC AREAS
-- =====================================================================

-- Usually reuse existing TAs. Common ones:
-- TA-001 (Oncology), TA-002 (Immunology), TA-003 (Cardiovascular), TA-004 (Neuroscience)

-- =====================================================================
-- STEP 7: REFERENCE DATA - TRAINING PROGRAMS
-- =====================================================================

INSERT INTO ref_training_programs (unique_id, program_name, program_type, is_mandatory, frequency, estimated_hours, gxp_type)
VALUES
  ('TRN-{{ROLE_SHORT}}-001', '{{TRAINING_NAME}}', 'Role-specific', true, 'One-time', 40, NULL)
ON CONFLICT (unique_id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  estimated_hours = EXCLUDED.estimated_hours;

-- =====================================================================
-- STEP 8: POPULATE JUNCTION TABLES (NORMALIZED RELATIONSHIPS)
-- =====================================================================

DO $$
DECLARE
  v_role_id UUID;
  v_skill_id UUID;
  v_comp_id UUID;
  v_cert_id UUID;
  v_reg_id UUID;
  v_kpi_id UUID;
  v_ta_id UUID;
  v_train_id UUID;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id FROM org_roles
  WHERE name ILIKE '%{{ROLE_NAME}}%' OR name ILIKE '%{{ROLE_NAME_SHORT}}%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE '{{ROLE_NAME}} role not found - skipping junction tables';
    RETURN;
  END IF;

  -- ===== ROLE_SKILLS =====
  -- Link role to required skills
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-XXX-001', 'SKILL-XXX-002', 'SKILL-XXX-003'
    -- Add more skill unique_ids as needed
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Advanced', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Advanced';
  END LOOP;

  -- ===== ROLE_COMPETENCIES =====
  -- Add each competency with proficiency level and development time
  SELECT id INTO v_comp_id FROM ref_competencies WHERE unique_id = 'COMP-XXX-001';
  IF v_comp_id IS NOT NULL THEN
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Advanced', 2, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Advanced';
  END IF;

  -- ===== ROLE_CERTIFICATIONS =====
  -- Add required and preferred certifications
  SELECT id INTO v_cert_id FROM ref_certifications WHERE unique_id = 'CERT-XXX-001';
  IF v_cert_id IS NOT NULL THEN
    INSERT INTO role_certifications (role_id, certification_id, is_required, is_preferred)
    VALUES (v_role_id, v_cert_id, true, false)
    ON CONFLICT (role_id, certification_id) DO NOTHING;
  END IF;

  -- ===== ROLE_REGULATORY_FRAMEWORKS =====
  FOR v_reg_id IN SELECT id FROM ref_regulatory_frameworks WHERE unique_id IN (
    'REG-FDA-001', 'REG-ICH-001'
    -- Add applicable frameworks
  ) LOOP
    INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, applies_to_role)
    VALUES (v_role_id, v_reg_id, 'Advanced', true)
    ON CONFLICT (role_id, framework_id) DO NOTHING;
  END LOOP;

  -- ===== ROLE_KPIS_JUNCTION =====
  SELECT id INTO v_kpi_id FROM ref_kpis WHERE unique_id = 'KPI-{{ROLE_SHORT}}-001';
  IF v_kpi_id IS NOT NULL THEN
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, '{{TARGET}}', 'Monthly', '{{DATA_SOURCE}}')
    ON CONFLICT (role_id, kpi_id) DO UPDATE SET target_value = '{{TARGET}}';
  END IF;

  -- ===== ROLE_THERAPEUTIC_AREAS =====
  SELECT id INTO v_ta_id FROM ref_therapeutic_areas WHERE unique_id = 'TA-001';
  IF v_ta_id IS NOT NULL THEN
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, true)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END IF;

  -- ===== ROLE_TRAINING =====
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-{{ROLE_SHORT}}-001'
  ) LOOP
    INSERT INTO role_training (role_id, training_id, is_mandatory)
    VALUES (v_role_id, v_train_id, true)
    ON CONFLICT (role_id, training_id) DO NOTHING;
  END LOOP;

  -- ===== ROLE_GXP_REQUIREMENTS =====
  -- Adjust based on role (GCP, GVP, GMP, GLP, GDP)
  INSERT INTO role_gxp_requirements (role_id, gxp_type, is_critical, training_frequency)
  VALUES
    (v_role_id, 'GCP', true, 'Annual')
  ON CONFLICT (role_id, gxp_type) DO NOTHING;

  RAISE NOTICE '{{ROLE_NAME}} junction tables populated for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 9: UPDATE ROLE IN org_roles (SIMPLIFIED)
-- =====================================================================

UPDATE org_roles
SET
  description = '{{ROLE_DESCRIPTION}}',

  -- Pharma context
  gxp_critical = true,
  gxp_types = ARRAY['GCP'],  -- Adjust: GCP, GVP, GMP, GLP, GDP
  patient_facing = false,
  hcp_facing = true,
  safety_critical = false,
  geographic_scope = '{{GEOGRAPHIC_SCOPE}}',  -- global, regional, or local
  leadership_level = '{{LEADERSHIP_LEVEL}}',

  -- Work environment
  remote_eligible = true,
  oncall_required = false,
  typical_work_schedule = '{{WORK_SCHEDULE}}',
  work_location_type = '{{WORK_LOCATION}}',

  -- Career
  typical_time_in_role_months = 24,
  advancement_potential = 'High',
  is_entry_point = false,
  career_path_from = ARRAY['{{PRIOR_ROLE_1}}', '{{PRIOR_ROLE_2}}'],
  career_path_to = ARRAY['{{NEXT_ROLE_1}}', '{{NEXT_ROLE_2}}'],

  -- NORMALIZED: Empty - data in junction tables
  role_kpis = '[]'::jsonb,
  clinical_competencies = '[]'::jsonb,
  technical_skills = ARRAY[]::varchar[],
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  -- Soft skills (kept as array)
  soft_skills = ARRAY['{{SOFT_SKILL_1}}', '{{SOFT_SKILL_2}}'],

  -- Dynamic data (kept as JSONB)
  daily_activities = '[
    {"activity": "{{ACTIVITY_1}}", "percent": 40},
    {"activity": "{{ACTIVITY_2}}", "percent": 30},
    {"activity": "{{ACTIVITY_3}}", "percent": 30}
  ]'::jsonb,

  systems_used = '[
    {"system": "{{SYSTEM_1}}", "proficiency": "Advanced", "frequency": "Daily"}
  ]'::jsonb,

  stakeholder_interactions = '[
    {"type": "{{STAKEHOLDER_1}}", "frequency": "Weekly", "nature": "{{NATURE}}"}
  ]'::jsonb,

  -- Responsibilities, Goals, Challenges, Motivations (arrays)
  top_responsibilities = ARRAY['{{RESPONSIBILITY_1}}', '{{RESPONSIBILITY_2}}'],
  typical_goals = ARRAY['{{GOAL_1}}', '{{GOAL_2}}'],
  common_challenges = ARRAY['{{CHALLENGE_1}}', '{{CHALLENGE_2}}'],
  key_motivations = ARRAY['{{MOTIVATION_1}}', '{{MOTIVATION_2}}'],

  -- Metadata
  data_quality_score = 0.90,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'Normalized v2.0 - {{ROLE_NAME}} profile.',
  updated_at = now()

WHERE name ILIKE '%{{ROLE_NAME}}%'
  OR name ILIKE '%{{ROLE_NAME_SHORT}}%';

-- =====================================================================
-- STEP 10: CREATE PERSONA (LINKED TO ROLE)
-- =====================================================================

INSERT INTO personas (
  unique_id,
  persona_name,
  persona_type,
  source_role_id,
  title,
  description,
  age_range,
  experience_level,
  education_level,
  department,
  function_area,
  geographic_scope,
  goals,
  challenges,
  motivations,
  frustrations,
  daily_activities,
  tools_used,
  skills,
  competencies,
  success_metrics,
  sample_quotes,
  gxp_requirements,
  therapeutic_areas,
  is_active,
  data_quality_score,
  created_by
)
SELECT
  '{{PERSONA_ID}}',
  '{{PERSONA_NAME}}',
  'Role-based',
  r.id,
  '{{ROLE_NAME}}',
  '{{ROLE_DESCRIPTION}}',
  '{{AGE_RANGE}}',  -- e.g., '30-40', '40-50'
  '{{EXPERIENCE_LEVEL}}',  -- e.g., 'Senior Individual Contributor', 'Manager'
  '{{EDUCATION_LEVEL}}',
  '{{DEPARTMENT}}',
  'Medical Affairs',
  '{{GEOGRAPHIC_SCOPE}}',
  '["{{GOAL_1}}", "{{GOAL_2}}"]'::jsonb,
  '["{{CHALLENGE_1}}", "{{CHALLENGE_2}}"]'::jsonb,
  '["{{MOTIVATION_1}}", "{{MOTIVATION_2}}"]'::jsonb,
  '["{{FRUSTRATION_1}}", "{{FRUSTRATION_2}}"]'::jsonb,
  '[{"activity": "{{ACTIVITY_1}}", "percent": 40}]'::jsonb,
  '[{"tool": "{{TOOL_1}}", "proficiency": "Advanced"}]'::jsonb,
  '[]'::jsonb,  -- NORMALIZED: via role_skills
  '[]'::jsonb,  -- NORMALIZED: via role_competencies
  '[]'::jsonb,  -- NORMALIZED: via role_kpis_junction
  ARRAY['{{QUOTE_1}}', '{{QUOTE_2}}'],
  '[{"type": "GCP", "critical": true}]'::jsonb,
  ARRAY['{{TA_1}}', '{{TA_2}}'],
  true,
  0.90,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%{{ROLE_NAME}}%' OR r.name ILIKE '%{{ROLE_NAME_SHORT}}%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  updated_at = now();

-- =====================================================================
-- STEP 11: VERIFICATION
-- =====================================================================

-- Verify persona created
-- SELECT unique_id, persona_name, department FROM personas WHERE unique_id = '{{PERSONA_ID}}';

-- Verify junction tables populated
-- SELECT COUNT(*) as skill_count FROM role_skills rs
-- JOIN org_roles r ON rs.role_id = r.id
-- WHERE r.name ILIKE '%{{ROLE_NAME}}%';
