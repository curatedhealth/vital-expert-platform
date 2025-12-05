-- =====================================================================
-- VP MEDICAL AFFAIRS SEED FILE
-- =====================================================================
-- Version: 2.1.0
-- Created: 2025-11-27
-- Source: GH Research, Sun Pharma, Industry Research
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - VP MEDICAL AFFAIRS SKILLS
-- =====================================================================

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  ('SKILL-VP-001', 'Enterprise Strategy', 'Strategic', 'Developing and executing organization-wide medical affairs strategy', true),
  ('SKILL-VP-002', 'P&L Management', 'Business', 'Managing department budget, forecasting, and financial accountability', false),
  ('SKILL-VP-003', 'Executive Leadership', 'Leadership', 'Leading senior teams and influencing C-suite decisions', false),
  ('SKILL-VP-004', 'External Affairs', 'Relationship', 'Managing relationships with regulatory authorities, KOL networks, and industry groups', true),
  ('SKILL-VP-005', 'Organizational Design', 'Leadership', 'Building and scaling medical affairs organizations', false)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - VP MEDICAL AFFAIRS COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-VP-001', 'Enterprise Medical Strategy', 'Strategic', 'Developing global medical affairs strategy aligned with corporate objectives', 48),
  ('COMP-VP-002', 'Organizational Leadership', 'Leadership', 'Building, scaling, and leading high-performing medical affairs organizations', 36),
  ('COMP-VP-003', 'Board & Executive Communication', 'Communication', 'Communicating effectively with board, investors, and C-suite', 36),
  ('COMP-VP-004', 'Portfolio Strategy', 'Strategic', 'Managing medical strategy across product portfolio lifecycle', 48)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - VP MEDICAL AFFAIRS KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-VP-001', 'Medical Affairs Budget Performance', 'Financial', 'percentage', 'Quarterly', false),
  ('KPI-VP-002', 'Portfolio Medical Milestones', 'Execution', 'percentage', 'Quarterly', true),
  ('KPI-VP-003', 'Team Engagement Score', 'Team Health', 'score (1-100)', 'Annually', false),
  ('KPI-VP-004', 'Publication Output', 'Quality', 'publications/year', 'Annually', true),
  ('KPI-VP-005', 'Regulatory Compliance Rate', 'Compliance', 'percentage', 'Quarterly', true),
  ('KPI-VP-006', 'KOL Network Strength', 'Quality', 'score (1-5)', 'Annually', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 4: REFERENCE DATA - TRAINING
-- =====================================================================

INSERT INTO ref_training_programs (unique_id, program_name, program_type, is_mandatory, frequency, estimated_hours, gxp_type)
VALUES
  ('TRN-VP-001', 'Executive Leadership Program', 'Leadership', true, 'One-time', 80, NULL),
  ('TRN-VP-002', 'Financial Management for Executives', 'Business', true, 'One-time', 24, NULL),
  ('TRN-VP-003', 'Board Communication & Governance', 'Leadership', true, 'One-time', 16, NULL)
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
  WHERE name ILIKE '%VP Medical Affairs%' OR name ILIKE '%Vice President Medical Affairs%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE 'VP Medical Affairs role not found - skipping';
    RETURN;
  END IF;

  -- Skills
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-CLIN-001', 'SKILL-COMM-001', 'SKILL-STRAT-001', 'SKILL-CROSS-001',
    'SKILL-DIR-001', 'SKILL-DIR-003', 'SKILL-DIR-004', 'SKILL-DIR-005',
    'SKILL-VP-001', 'SKILL-VP-002', 'SKILL-VP-003', 'SKILL-VP-004', 'SKILL-VP-005'
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Expert', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Expert';
  END LOOP;

  -- Competencies
  FOR v_comp_id IN SELECT id FROM ref_competencies WHERE unique_id IN (
    'COMP-CLIN-001', 'COMP-SCI-001', 'COMP-REL-001',
    'COMP-DIR-001', 'COMP-DIR-002', 'COMP-DIR-003',
    'COMP-VP-001', 'COMP-VP-002', 'COMP-VP-003', 'COMP-VP-004'
  ) LOOP
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Expert', 5, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Expert';
  END LOOP;

  -- KPIs
  FOR v_kpi_id IN SELECT id FROM ref_kpis WHERE unique_id IN (
    'KPI-VP-001', 'KPI-VP-002', 'KPI-VP-003', 'KPI-VP-004', 'KPI-VP-005', 'KPI-VP-006'
  ) LOOP
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, 'Enterprise targets', 'Quarterly', 'Executive Dashboard')
    ON CONFLICT (role_id, kpi_id) DO NOTHING;
  END LOOP;

  -- Specific targets
  UPDATE role_kpis_junction SET target_value = '95-100%' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-VP-001');
  UPDATE role_kpis_junction SET target_value = '90%+ on-time' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-VP-002');
  UPDATE role_kpis_junction SET target_value = '80+' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-VP-003');
  UPDATE role_kpis_junction SET target_value = '20+ peer-reviewed' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-VP-004');
  UPDATE role_kpis_junction SET target_value = '100%' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-VP-005');
  UPDATE role_kpis_junction SET target_value = '4.5+' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-VP-006');

  -- Therapeutic Areas (portfolio-wide)
  FOR v_ta_id IN SELECT id FROM ref_therapeutic_areas LOOP
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, true)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END LOOP;

  -- Training
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-GXP-002', 'TRN-COMP-001',
    'TRN-VP-001', 'TRN-VP-002', 'TRN-VP-003'
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
    VALUES (v_role_id, v_reg_id, 'Expert', true)
    ON CONFLICT (role_id, framework_id) DO NOTHING;
  END LOOP;

  -- GxP
  INSERT INTO role_gxp_requirements (role_id, gxp_type, is_critical, training_frequency)
  VALUES (v_role_id, 'GCP', true, 'Annual'), (v_role_id, 'GVP', true, 'Annual')
  ON CONFLICT (role_id, gxp_type) DO NOTHING;

  RAISE NOTICE 'VP Medical Affairs junction tables populated for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 6: UPDATE org_roles
-- =====================================================================

UPDATE org_roles
SET
  description = 'The Vice President of Medical Affairs is a senior healthcare executive responsible for developing and executing global medical affairs strategy, leading cross-functional teams, managing department P&L, and ensuring all medical activities align with corporate objectives and regulatory requirements. Reports to the CMO or CEO and oversees field medical, medical information, HEOR, and medical communications functions.',

  gxp_critical = true,
  gxp_types = ARRAY['GCP', 'GVP'],
  patient_facing = false,
  hcp_facing = true,
  safety_critical = true,
  geographic_scope = 'global',
  leadership_level = 'executive',

  remote_eligible = true,
  oncall_required = false,
  typical_work_schedule = 'Executive schedule with global availability',
  work_location_type = 'Hybrid (HQ + remote)',

  typical_time_in_role_months = 48,
  advancement_potential = 'High',
  is_entry_point = false,
  career_path_from = ARRAY['Medical Director', 'Senior Medical Director', 'Director Field Medical'],
  career_path_to = ARRAY['SVP Medical Affairs', 'Chief Medical Officer', 'CEO (Biotech)'],

  role_kpis = '[]'::jsonb,
  clinical_competencies = '[]'::jsonb,
  technical_skills = ARRAY[]::varchar[],
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  soft_skills = ARRAY['Visionary leadership', 'Executive presence', 'Political savvy', 'Change management', 'Board communication'],

  daily_activities = '[
    {"activity": "Executive leadership & strategy", "percent": 35},
    {"activity": "Cross-functional executive meetings", "percent": 25},
    {"activity": "Team leadership & development", "percent": 15},
    {"activity": "External stakeholder engagement", "percent": 15},
    {"activity": "Board/investor interactions", "percent": 10}
  ]'::jsonb,

  systems_used = '[
    {"system": "Executive Dashboard", "proficiency": "Advanced", "frequency": "Daily"},
    {"system": "Financial Management System", "proficiency": "Advanced", "frequency": "Weekly"},
    {"system": "Board Reporting Tools", "proficiency": "Advanced", "frequency": "Monthly"}
  ]'::jsonb,

  stakeholder_interactions = '[
    {"type": "CEO/CMO", "frequency": "Weekly", "nature": "Strategy alignment"},
    {"type": "Board of Directors", "frequency": "Quarterly", "nature": "Governance reporting"},
    {"type": "Medical Affairs Leadership Team", "frequency": "Daily", "nature": "Team leadership"},
    {"type": "Commercial/R&D VPs", "frequency": "Weekly", "nature": "Cross-functional strategy"},
    {"type": "Global KOL Advisory Board", "frequency": "Quarterly", "nature": "Strategic guidance"},
    {"type": "Regulatory Authorities", "frequency": "As needed", "nature": "Executive engagement"}
  ]'::jsonb,

  top_responsibilities = ARRAY[
    'Develop and execute global medical affairs strategy',
    'Lead and develop medical affairs organization',
    'Manage department P&L and resource allocation',
    'Oversee field medical, medical information, HEOR, publications',
    'Build strategic KOL relationships at executive level',
    'Ensure regulatory compliance across all medical activities'
  ],

  typical_goals = ARRAY[
    'Achieve portfolio medical milestones',
    'Build world-class medical affairs organization',
    'Establish company as scientific leader',
    'Ensure regulatory excellence'
  ],
  common_challenges = ARRAY[
    'Balancing strategic vision with operational execution',
    'Resource allocation across competing priorities',
    'Managing global complexity and cultural differences',
    'Demonstrating medical affairs ROI to board'
  ],
  key_motivations = ARRAY[
    'Transforming patient care at scale',
    'Building industry-leading teams',
    'Shaping company scientific direction',
    'Executive impact and recognition'
  ],

  data_quality_score = 0.88,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'VP Medical Affairs profile based on GH Research, Sun Pharma, industry research. Salary ~$324K. Requires 15+ years experience.',
  updated_at = now()

WHERE name ILIKE '%VP Medical Affairs%' OR name ILIKE '%Vice President Medical Affairs%';

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
  'PERSONA-VPMA-001',
  'Dr. Rebecca Martinez, VP Medical Affairs',
  'Role-based',
  r.id,
  'VP Medical Affairs',
  'A senior healthcare executive leading global medical affairs strategy, team development, and cross-functional alignment. Responsible for field medical, medical information, HEOR, and publications. Reports to CMO/CEO with P&L accountability.',
  '48-58',
  'VP',
  'MD or PhD with 15+ years pharmaceutical experience',
  'Medical Affairs Leadership',
  'Medical Affairs',
  'global',
  '["Achieve portfolio milestones", "Build world-class organization", "Scientific leadership", "Regulatory excellence"]'::jsonb,
  '["Strategic vs operational balance", "Resource allocation", "Global complexity", "Demonstrating ROI"]'::jsonb,
  '["Patient care at scale", "Building great teams", "Company direction", "Executive impact"]'::jsonb,
  '["Bureaucratic constraints", "Budget pressures", "Competing executive priorities"]'::jsonb,
  '[{"activity": "Executive leadership", "percent": 35}, {"activity": "Executive meetings", "percent": 25}, {"activity": "Team development", "percent": 15}, {"activity": "External engagement", "percent": 15}, {"activity": "Board interactions", "percent": 10}]'::jsonb,
  '[{"tool": "Executive Dashboard", "proficiency": "Advanced"}, {"tool": "Financial System", "proficiency": "Advanced"}, {"tool": "Board Tools", "proficiency": "Advanced"}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY[
    'My job is to create the conditions for my teams to do their best work.',
    'At the VP level, success is measured in lives touched by the medicines we help bring to market.',
    'I bridge the science and the business - translating medical strategy into corporate value.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Oncology', 'Immunology', 'Cardiovascular', 'Neuroscience'],
  true,
  0.88,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%VP Medical Affairs%' OR r.name ILIKE '%Vice President Medical Affairs%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  updated_at = now();
