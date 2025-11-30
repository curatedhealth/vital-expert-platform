-- =====================================================================
-- MSL MANAGER SEED FILE
-- =====================================================================
-- Version: 2.1.0
-- Created: 2025-11-27
-- Source: MSL Society 2024 Survey, MAPS, Industry Research
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - MSL MANAGER SKILLS
-- =====================================================================

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  ('SKILL-MGR-001', 'People Management', 'Leadership', 'Recruiting, developing, and retaining high-performing team members', false),
  ('SKILL-MGR-002', 'Performance Management', 'Leadership', 'Setting goals, providing feedback, and conducting performance reviews', false),
  ('SKILL-MGR-003', 'Budget Management', 'Business', 'Managing team budgets, forecasting, and resource allocation', false),
  ('SKILL-MGR-004', 'Territory Strategy', 'Strategic', 'Designing and optimizing MSL territory coverage and deployment', true)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - MSL MANAGER COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-MGR-001', 'Team Leadership', 'Leadership', 'Building and leading high-performing MSL teams', 24),
  ('COMP-MGR-002', 'Strategic Resource Deployment', 'Strategic', 'Optimizing MSL coverage and KOL engagement strategies', 18),
  ('COMP-MGR-003', 'Stakeholder Management', 'Relationship', 'Managing relationships with internal leadership and external stakeholders', 24)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - MSL MANAGER KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-MSLMGR-001', 'Team KOL Engagement Rate', 'Team Performance', 'percentage', 'Monthly', true),
  ('KPI-MSLMGR-002', 'MSL Retention Rate', 'Team Health', 'percentage', 'Annually', true),
  ('KPI-MSLMGR-003', 'Team Insight Quality Score', 'Quality', 'score (1-5)', 'Quarterly', true),
  ('KPI-MSLMGR-004', 'Budget Adherence', 'Financial', 'percentage', 'Quarterly', false),
  ('KPI-MSLMGR-005', 'MSL Development Progress', 'Development', 'percentage', 'Quarterly', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 4: REFERENCE DATA - TRAINING
-- =====================================================================

INSERT INTO ref_training_programs (unique_id, program_name, program_type, is_mandatory, frequency, estimated_hours, gxp_type)
VALUES
  ('TRN-MGR-001', 'MSL Manager Leadership Program', 'Leadership', true, 'One-time', 24, NULL),
  ('TRN-MGR-002', 'Performance Management Training', 'Leadership', true, 'Annual', 8, NULL),
  ('TRN-MGR-003', 'Budget & Resource Management', 'Business', true, 'One-time', 8, NULL)
ON CONFLICT (unique_id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  estimated_hours = EXCLUDED.estimated_hours;

-- =====================================================================
-- STEP 5: POPULATE JUNCTION TABLES
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
  WHERE name ILIKE '%MSL Manager%' OR name ILIKE '%Medical Science Liaison Manager%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE 'MSL Manager role not found - skipping';
    RETURN;
  END IF;

  -- Skills
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-CLIN-001', 'SKILL-COMM-001', 'SKILL-REL-001', 'SKILL-TECH-001',
    'SKILL-LEAD-001', 'SKILL-STRAT-001', 'SKILL-CROSS-001',
    'SKILL-MGR-001', 'SKILL-MGR-002', 'SKILL-MGR-003', 'SKILL-MGR-004'
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Expert', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Expert';
  END LOOP;

  -- Competencies
  FOR v_comp_id IN SELECT id FROM ref_competencies WHERE unique_id IN (
    'COMP-CLIN-001', 'COMP-SCI-001', 'COMP-REL-001',
    'COMP-LEAD-001', 'COMP-STRAT-001',
    'COMP-MGR-001', 'COMP-MGR-002', 'COMP-MGR-003'
  ) LOOP
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Expert', 3, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Expert';
  END LOOP;

  -- KPIs
  FOR v_kpi_id IN SELECT id FROM ref_kpis WHERE unique_id IN (
    'KPI-MSLMGR-001', 'KPI-MSLMGR-002', 'KPI-MSLMGR-003', 'KPI-MSLMGR-004', 'KPI-MSLMGR-005'
  ) LOOP
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, 'Team targets', 'Monthly', 'Veeva CRM / HR Systems')
    ON CONFLICT (role_id, kpi_id) DO NOTHING;
  END LOOP;

  -- Specific targets
  UPDATE role_kpis_junction SET target_value = '85%+', data_source = 'Veeva CRM' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MSLMGR-001');
  UPDATE role_kpis_junction SET target_value = '90%+', data_source = 'HR Systems' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MSLMGR-002');
  UPDATE role_kpis_junction SET target_value = '4.0+', data_source = 'Medical Insights' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MSLMGR-003');
  UPDATE role_kpis_junction SET target_value = '95-100%', data_source = 'Finance' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MSLMGR-004');
  UPDATE role_kpis_junction SET target_value = '100%', data_source = 'HR Systems' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MSLMGR-005');

  -- Therapeutic Areas
  FOR v_ta_id IN SELECT id FROM ref_therapeutic_areas WHERE unique_id IN ('TA-001', 'TA-002', 'TA-003') LOOP
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, true)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END LOOP;

  -- Training
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-GXP-002', 'TRN-COMP-001',
    'TRN-MGR-001', 'TRN-MGR-002', 'TRN-MGR-003'
  ) LOOP
    INSERT INTO role_training (role_id, training_id, is_mandatory)
    VALUES (v_role_id, v_train_id, true)
    ON CONFLICT (role_id, training_id) DO NOTHING;
  END LOOP;

  -- Regulatory
  FOR v_reg_id IN SELECT id FROM ref_regulatory_frameworks WHERE unique_id IN (
    'REG-FDA-001', 'REG-ICH-001', 'REG-PHRMA-001', 'REG-GVP-001'
  ) LOOP
    INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, applies_to_role)
    VALUES (v_role_id, v_reg_id, 'Advanced', true)
    ON CONFLICT (role_id, framework_id) DO NOTHING;
  END LOOP;

  -- GxP
  INSERT INTO role_gxp_requirements (role_id, gxp_type, is_critical, training_frequency)
  VALUES (v_role_id, 'GCP', true, 'Annual'), (v_role_id, 'GVP', true, 'Annual')
  ON CONFLICT (role_id, gxp_type) DO NOTHING;

  RAISE NOTICE 'MSL Manager junction tables populated for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 6: UPDATE org_roles
-- =====================================================================

UPDATE org_roles
SET
  description = 'An MSL Manager leads and develops a team of Medical Science Liaisons, responsible for strategic deployment, performance management, career development, and ensuring alignment with medical affairs objectives. They bridge field insights with corporate strategy while maintaining team engagement and scientific excellence.',

  gxp_critical = true,
  gxp_types = ARRAY['GCP', 'GVP'],
  patient_facing = false,
  hcp_facing = true,
  safety_critical = true,
  geographic_scope = 'regional',
  leadership_level = 'people_manager',

  remote_eligible = true,
  oncall_required = false,
  typical_work_schedule = 'Standard business hours with team availability',
  work_location_type = 'Hybrid (home office + regional travel)',

  typical_time_in_role_months = 36,
  advancement_potential = 'High',
  is_entry_point = false,
  career_path_from = ARRAY['Senior MSL', 'Medical Science Liaison'],
  career_path_to = ARRAY['Director Field Medical', 'Medical Director', 'VP Medical Affairs'],

  role_kpis = '[]'::jsonb,
  clinical_competencies = '[]'::jsonb,
  technical_skills = ARRAY[]::varchar[],
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  soft_skills = ARRAY['People leadership', 'Coaching', 'Strategic thinking', 'Conflict resolution', 'Executive communication'],

  daily_activities = '[
    {"activity": "Team management & 1:1s", "percent": 30},
    {"activity": "Strategic planning", "percent": 20},
    {"activity": "Cross-functional meetings", "percent": 20},
    {"activity": "Field coaching rides", "percent": 15},
    {"activity": "Administrative & reporting", "percent": 10},
    {"activity": "Personal development", "percent": 5}
  ]'::jsonb,

  systems_used = '[
    {"system": "Veeva CRM", "proficiency": "Expert", "frequency": "Daily"},
    {"system": "HR Management Systems", "proficiency": "Advanced", "frequency": "Weekly"},
    {"system": "Budget Management Tools", "proficiency": "Advanced", "frequency": "Monthly"},
    {"system": "Performance Management Platform", "proficiency": "Advanced", "frequency": "Weekly"}
  ]'::jsonb,

  stakeholder_interactions = '[
    {"type": "MSL Team", "frequency": "Daily", "nature": "Leadership & coaching"},
    {"type": "Medical Director", "frequency": "Weekly", "nature": "Strategic alignment"},
    {"type": "HR Business Partner", "frequency": "Monthly", "nature": "Talent management"},
    {"type": "Commercial Leadership", "frequency": "Monthly", "nature": "Cross-functional alignment"},
    {"type": "KOLs", "frequency": "Monthly", "nature": "Strategic relationships"}
  ]'::jsonb,

  top_responsibilities = ARRAY[
    'Lead and develop MSL team members',
    'Set and monitor team performance goals',
    'Optimize territory coverage and KOL engagement strategy',
    'Manage team budget and resources',
    'Conduct field coaching and ride-alongs',
    'Represent field medical in cross-functional initiatives'
  ],

  typical_goals = ARRAY[
    'Build high-performing MSL team',
    'Achieve team engagement targets',
    'Develop MSL talent pipeline',
    'Optimize resource deployment'
  ],
  common_challenges = ARRAY[
    'Nearly 60% receive no upskilling for transition to management',
    'Balancing administrative duties with team support',
    'Managing remote/field-based team members',
    'Navigating organizational complexity'
  ],
  key_motivations = ARRAY[
    'Developing team members careers',
    'Building high-performing teams',
    'Strategic influence on medical affairs',
    'Leadership recognition'
  ],

  data_quality_score = 0.90,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'MSL Manager profile based on MSL Society 2024 data. Salary ~$209K. Note: 60% receive no transition training.',
  updated_at = now()

WHERE name ILIKE '%MSL Manager%' OR name ILIKE '%Medical Science Liaison Manager%';

-- =====================================================================
-- STEP 7: CREATE PERSONA
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
  'PERSONA-MSLMGR-001',
  'Dr. Jennifer Park, MSL Manager',
  'Role-based',
  r.id,
  'MSL Manager',
  'A people leader responsible for developing and managing a team of MSLs. Focuses on team performance, career development, strategic deployment, and bridging field insights with corporate medical strategy.',
  '38-48',
  'Manager',
  'PharmD, PhD, or MD with 7+ years MSL experience',
  'Field Medical',
  'Medical Affairs',
  'regional',
  '["Build high-performing team", "Achieve engagement targets", "Develop talent pipeline", "Optimize deployment"]'::jsonb,
  '["Limited management training", "Balancing admin vs team support", "Managing remote team", "Organizational complexity"]'::jsonb,
  '["Developing careers", "Building great teams", "Strategic influence", "Leadership recognition"]'::jsonb,
  '["Administrative burden", "Insufficient training for role", "Less scientific engagement"]'::jsonb,
  '[{"activity": "Team management", "percent": 30}, {"activity": "Strategic planning", "percent": 20}, {"activity": "Cross-functional meetings", "percent": 20}, {"activity": "Field coaching", "percent": 15}, {"activity": "Admin", "percent": 10}, {"activity": "Development", "percent": 5}]'::jsonb,
  '[{"tool": "Veeva CRM", "proficiency": "Expert"}, {"tool": "HR Systems", "proficiency": "Advanced"}, {"tool": "Budget Tools", "proficiency": "Advanced"}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY[
    'My success is measured by my team success - when they grow, we all win.',
    'The hardest part was transitioning from being a top MSL to leading MSLs.',
    'I spend more time in meetings than in the field, but that is where I can have the most impact now.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Oncology', 'Immunology', 'Cardiovascular'],
  true,
  0.90,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%MSL Manager%' OR r.name ILIKE '%Medical Science Liaison Manager%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  updated_at = now();
