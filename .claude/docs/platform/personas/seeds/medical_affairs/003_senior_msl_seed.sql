-- =====================================================================
-- SENIOR MSL SEED FILE
-- =====================================================================
-- Version: 2.1.0
-- Created: 2025-11-27
-- Source: MSL Society 2024 Survey, Industry Research
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - ADDITIONAL SKILLS FOR SENIOR MSL
-- =====================================================================

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  ('SKILL-LEAD-001', 'Mentorship & Coaching', 'Leadership', 'Guiding junior MSLs and providing career development support', false),
  ('SKILL-STRAT-001', 'Strategic Planning', 'Strategic', 'Developing long-term KOL engagement and territory strategies', true),
  ('SKILL-CROSS-001', 'Cross-functional Collaboration', 'Communication', 'Working effectively across medical affairs, commercial, and R&D teams', true)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - ADDITIONAL COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-LEAD-001', 'Team Leadership & Mentoring', 'Leadership', 'Ability to guide, mentor, and develop junior team members', 24),
  ('COMP-STRAT-001', 'Strategic KOL Management', 'Strategic', 'Developing comprehensive KOL engagement strategies aligned with business objectives', 36)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - SENIOR MSL KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-SRMSL-001', 'Strategic KOL Engagements', 'Engagement', 'interactions/year', 'Monthly', true),
  ('KPI-SRMSL-002', 'Junior MSL Mentoring Sessions', 'Development', 'sessions/quarter', 'Quarterly', true),
  ('KPI-SRMSL-003', 'Advisory Board Participation', 'Strategic', 'boards/year', 'Annually', true),
  ('KPI-SRMSL-004', 'Cross-functional Project Leadership', 'Leadership', 'projects/year', 'Annually', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 4: POPULATE JUNCTION TABLES
-- =====================================================================

DO $$
DECLARE
  v_role_id UUID;
  v_skill_id UUID;
  v_comp_id UUID;
  v_kpi_id UUID;
  v_ta_id UUID;
  v_train_id UUID;
  v_reg_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM org_roles
  WHERE name ILIKE '%Senior MSL%' OR name ILIKE '%Senior Medical Science Liaison%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE 'Senior MSL role not found - skipping';
    RETURN;
  END IF;

  -- Skills (inherit MSL skills + leadership skills)
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-CLIN-001', 'SKILL-CLIN-002', 'SKILL-CLIN-003',
    'SKILL-COMM-001', 'SKILL-COMM-002', 'SKILL-COMM-003',
    'SKILL-REL-001', 'SKILL-TECH-001',
    'SKILL-LEAD-001', 'SKILL-STRAT-001', 'SKILL-CROSS-001'
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Expert', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Expert';
  END LOOP;

  -- Competencies
  FOR v_comp_id IN SELECT id FROM ref_competencies WHERE unique_id IN (
    'COMP-CLIN-001', 'COMP-CLIN-002', 'COMP-CLIN-003', 'COMP-SCI-001', 'COMP-REL-001',
    'COMP-LEAD-001', 'COMP-STRAT-001'
  ) LOOP
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Expert', 4, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Expert';
  END LOOP;

  -- KPIs
  FOR v_kpi_id IN SELECT id FROM ref_kpis WHERE unique_id IN (
    'KPI-MSL-001', 'KPI-MSL-002', 'KPI-MSL-003', 'KPI-MSL-005',
    'KPI-SRMSL-001', 'KPI-SRMSL-002', 'KPI-SRMSL-003', 'KPI-SRMSL-004'
  ) LOOP
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, 'Elevated targets', 'Monthly', 'Veeva CRM')
    ON CONFLICT (role_id, kpi_id) DO NOTHING;
  END LOOP;

  -- Specific KPI targets
  UPDATE role_kpis_junction SET target_value = '120-150/year' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-SRMSL-001');
  UPDATE role_kpis_junction SET target_value = '8-12/quarter' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-SRMSL-002');
  UPDATE role_kpis_junction SET target_value = '2-4/year' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-SRMSL-003');
  UPDATE role_kpis_junction SET target_value = '2-3/year' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-SRMSL-004');

  -- Therapeutic Areas
  FOR v_ta_id IN SELECT id FROM ref_therapeutic_areas WHERE unique_id IN ('TA-001', 'TA-002') LOOP
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, true)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END LOOP;

  -- Training
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-GXP-002', 'TRN-COMP-001', 'TRN-ROLE-001', 'TRN-ROLE-002'
  ) LOOP
    INSERT INTO role_training (role_id, training_id, is_mandatory)
    VALUES (v_role_id, v_train_id, true)
    ON CONFLICT (role_id, training_id) DO NOTHING;
  END LOOP;

  -- Regulatory frameworks
  FOR v_reg_id IN SELECT id FROM ref_regulatory_frameworks WHERE unique_id IN (
    'REG-FDA-001', 'REG-ICH-001', 'REG-PHRMA-001', 'REG-GVP-001'
  ) LOOP
    INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, applies_to_role)
    VALUES (v_role_id, v_reg_id, 'Expert', true)
    ON CONFLICT (role_id, framework_id) DO NOTHING;
  END LOOP;

  -- GxP Requirements
  INSERT INTO role_gxp_requirements (role_id, gxp_type, is_critical, training_frequency)
  VALUES (v_role_id, 'GCP', true, 'Annual'), (v_role_id, 'GVP', true, 'Annual')
  ON CONFLICT (role_id, gxp_type) DO NOTHING;

  RAISE NOTICE 'Senior MSL junction tables populated for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 5: UPDATE org_roles
-- =====================================================================

UPDATE org_roles
SET
  description = 'A Senior Medical Science Liaison (Senior MSL) is an experienced field-based scientific expert who has demonstrated excellence in KOL engagement and scientific communication. Senior MSLs take on additional responsibilities including mentoring junior MSLs, leading strategic initiatives, participating in advisory boards, and contributing to cross-functional projects. They serve as subject matter experts within their therapeutic area.',

  gxp_critical = true,
  gxp_types = ARRAY['GCP', 'GVP'],
  patient_facing = false,
  hcp_facing = true,
  safety_critical = true,
  geographic_scope = 'global',
  leadership_level = 'individual_contributor',

  remote_eligible = true,
  oncall_required = false,
  typical_work_schedule = 'Flexible with increased strategic meetings',
  work_location_type = 'Field-based (home office + travel)',

  typical_time_in_role_months = 36,
  advancement_potential = 'High',
  is_entry_point = false,
  career_path_from = ARRAY['Medical Science Liaison'],
  career_path_to = ARRAY['MSL Manager', 'Medical Director', 'Regional Medical Director'],

  role_kpis = '[]'::jsonb,
  clinical_competencies = '[]'::jsonb,
  technical_skills = ARRAY[]::varchar[],
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  soft_skills = ARRAY['Strategic thinking', 'Mentorship', 'Executive presence', 'Influence without authority', 'Cross-functional collaboration'],

  daily_activities = '[
    {"activity": "Strategic KOL engagements", "percent": 35},
    {"activity": "Cross-functional collaboration", "percent": 20},
    {"activity": "Junior MSL mentoring", "percent": 15},
    {"activity": "Travel", "percent": 10},
    {"activity": "Strategic planning", "percent": 10},
    {"activity": "Training & development", "percent": 10}
  ]'::jsonb,

  systems_used = '[
    {"system": "Veeva CRM", "proficiency": "Expert", "frequency": "Daily"},
    {"system": "Medical Insights Platform", "proficiency": "Advanced", "frequency": "Daily"},
    {"system": "Advisory Board Management", "proficiency": "Advanced", "frequency": "Monthly"}
  ]'::jsonb,

  stakeholder_interactions = '[
    {"type": "Tier 1 KOLs", "frequency": "Weekly", "nature": "Strategic partnership"},
    {"type": "Junior MSLs", "frequency": "Weekly", "nature": "Mentoring"},
    {"type": "Medical Director", "frequency": "Weekly", "nature": "Strategic alignment"},
    {"type": "Commercial Leadership", "frequency": "Monthly", "nature": "Cross-functional projects"}
  ]'::jsonb,

  top_responsibilities = ARRAY[
    'Manage strategic relationships with Tier 1 KOLs',
    'Mentor and develop junior MSLs',
    'Lead cross-functional medical initiatives',
    'Participate in advisory boards and scientific steering committees',
    'Contribute to medical strategy development',
    'Provide therapeutic area expertise'
  ],

  typical_goals = ARRAY[
    'Develop next-generation KOL relationships',
    'Successfully mentor 2-3 junior MSLs',
    'Lead strategic medical initiatives',
    'Contribute to publication and congress strategy'
  ],
  common_challenges = ARRAY[
    'Balancing field work with strategic responsibilities',
    'Managing expanded stakeholder expectations',
    'Transitioning from individual contributor to informal leader',
    'Maintaining scientific depth while broadening scope'
  ],
  key_motivations = ARRAY[
    'Developing others and seeing their success',
    'Strategic impact on medical affairs direction',
    'Recognition as therapeutic area expert',
    'Career progression opportunities'
  ],

  data_quality_score = 0.92,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'Senior MSL profile based on MSL Society 2024 data. Salary ~$195K.',
  updated_at = now()

WHERE name ILIKE '%Senior MSL%' OR name ILIKE '%Senior Medical Science Liaison%';

-- =====================================================================
-- STEP 6: CREATE PERSONA
-- =====================================================================

INSERT INTO personas (
  unique_id, persona_name, persona_type, source_role_id, title, description,
  age_range, experience_level, education_level, department, function_area, geographic_scope,
  goals, challenges, motivations, frustrations,
  daily_activities, tools_used, skills, competencies, success_metrics,
  sample_quotes, gxp_requirements, therapeutic_areas,
  is_active, data_quality_score, created_by
)
SELECT
  'PERSONA-SRMSL-001',
  'Dr. Michael Torres, Senior MSL',
  'Role-based',
  r.id,
  'Senior Medical Science Liaison',
  'An experienced field-based scientific expert who mentors junior MSLs, manages strategic KOL relationships, and leads cross-functional medical initiatives. Recognized therapeutic area expert with 5+ years MSL experience.',
  '35-45',
  'Senior Individual Contributor',
  'PharmD, PhD, or MD with 5+ years MSL experience',
  'Field Medical',
  'Medical Affairs',
  'global',
  '["Develop strategic KOL partnerships", "Successfully mentor junior MSLs", "Lead medical initiatives", "Contribute to TA strategy"]'::jsonb,
  '["Balancing field work with strategic duties", "Managing expanded expectations", "Informal leadership challenges", "Maintaining scientific depth"]'::jsonb,
  '["Developing others", "Strategic impact", "TA expert recognition", "Career advancement"]'::jsonb,
  '["Increased administrative burden", "Less direct KOL time", "Competing priorities"]'::jsonb,
  '[{"activity": "Strategic KOL engagements", "percent": 35}, {"activity": "Cross-functional work", "percent": 20}, {"activity": "Mentoring", "percent": 15}, {"activity": "Travel", "percent": 10}, {"activity": "Planning", "percent": 10}, {"activity": "Development", "percent": 10}]'::jsonb,
  '[{"tool": "Veeva CRM", "proficiency": "Expert"}, {"tool": "Medical Insights Platform", "proficiency": "Advanced"}, {"tool": "Advisory Board Tools", "proficiency": "Advanced"}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY[
    'The most rewarding part of being a Senior MSL is seeing the junior team members I mentor succeed.',
    'At this level, it is about strategic impact - not just individual KOL interactions.',
    'I bridge the gap between field insights and corporate medical strategy.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Oncology', 'Immunology'],
  true,
  0.92,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Senior MSL%' OR r.name ILIKE '%Senior Medical Science Liaison%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  updated_at = now();
