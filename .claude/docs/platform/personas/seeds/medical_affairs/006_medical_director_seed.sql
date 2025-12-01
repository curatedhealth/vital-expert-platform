-- =====================================================================
-- MEDICAL DIRECTOR SEED FILE
-- =====================================================================
-- Version: 2.1.0
-- Created: 2025-11-27
-- Source: ICON, Non-Clinical Careers, Industry Research
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - MEDICAL DIRECTOR SKILLS
-- =====================================================================

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  ('SKILL-DIR-001', 'Clinical Trial Oversight', 'Clinical', 'Overseeing clinical trial design, execution, and data interpretation', true),
  ('SKILL-DIR-002', 'Protocol Development', 'Clinical', 'Designing clinical trial protocols with meaningful endpoints', true),
  ('SKILL-DIR-003', 'Regulatory Strategy', 'Regulatory', 'Developing regulatory submission strategies and FDA interactions', true),
  ('SKILL-DIR-004', 'Medical Strategy', 'Strategic', 'Creating comprehensive medical affairs and development strategies', true),
  ('SKILL-DIR-005', 'Executive Communication', 'Communication', 'Presenting to senior leadership and external stakeholders', false)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - MEDICAL DIRECTOR COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-DIR-001', 'Development Strategy', 'Strategic', 'Creating and executing clinical development plans', 36),
  ('COMP-DIR-002', 'Cross-functional Leadership', 'Leadership', 'Orchestrating multiple functions (clinical, regulatory, commercial)', 24),
  ('COMP-DIR-003', 'External Expert Engagement', 'Relationship', 'Building relationships with global KOLs and regulatory authorities', 36),
  ('COMP-DIR-004', 'Data Interpretation & Decision Making', 'Clinical', 'Analyzing clinical data and making go/no-go recommendations', 36)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - MEDICAL DIRECTOR KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-DIR-001', 'Clinical Milestones Achieved', 'Execution', 'milestones', 'Quarterly', true),
  ('KPI-DIR-002', 'Regulatory Submissions On-Time', 'Compliance', 'percentage', 'Annually', true),
  ('KPI-DIR-003', 'Study Enrollment to Target', 'Execution', 'percentage', 'Monthly', true),
  ('KPI-DIR-004', 'Safety Signal Management', 'Quality', 'incidents', 'Monthly', true),
  ('KPI-DIR-005', 'KOL Advisory Board Effectiveness', 'Quality', 'score (1-5)', 'Annually', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 4: REFERENCE DATA - TRAINING
-- =====================================================================

INSERT INTO ref_training_programs (unique_id, program_name, program_type, is_mandatory, frequency, estimated_hours, gxp_type)
VALUES
  ('TRN-DIR-001', 'Medical Director Leadership Program', 'Leadership', true, 'One-time', 40, NULL),
  ('TRN-DIR-002', 'Regulatory Strategy & FDA Interactions', 'Regulatory', true, 'Annual', 16, NULL),
  ('TRN-DIR-003', 'Clinical Data Interpretation', 'Clinical', true, 'Annual', 8, 'GCP')
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
  WHERE name ILIKE '%Medical Director%' AND name NOT ILIKE '%VP%' AND name NOT ILIKE '%Vice%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE 'Medical Director role not found - skipping';
    RETURN;
  END IF;

  -- Skills
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-CLIN-001', 'SKILL-CLIN-002', 'SKILL-CLIN-003',
    'SKILL-COMM-001', 'SKILL-COMM-002', 'SKILL-COMM-003',
    'SKILL-STRAT-001', 'SKILL-CROSS-001',
    'SKILL-DIR-001', 'SKILL-DIR-002', 'SKILL-DIR-003', 'SKILL-DIR-004', 'SKILL-DIR-005'
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Expert', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Expert';
  END LOOP;

  -- Competencies
  FOR v_comp_id IN SELECT id FROM ref_competencies WHERE unique_id IN (
    'COMP-CLIN-001', 'COMP-CLIN-002', 'COMP-SCI-001', 'COMP-REL-001',
    'COMP-DIR-001', 'COMP-DIR-002', 'COMP-DIR-003', 'COMP-DIR-004'
  ) LOOP
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Expert', 5, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Expert';
  END LOOP;

  -- KPIs
  FOR v_kpi_id IN SELECT id FROM ref_kpis WHERE unique_id IN (
    'KPI-DIR-001', 'KPI-DIR-002', 'KPI-DIR-003', 'KPI-DIR-004', 'KPI-DIR-005'
  ) LOOP
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, 'Strategic targets', 'Quarterly', 'Clinical Systems')
    ON CONFLICT (role_id, kpi_id) DO NOTHING;
  END LOOP;

  -- Specific targets
  UPDATE role_kpis_junction SET target_value = '100% on-time' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-DIR-001');
  UPDATE role_kpis_junction SET target_value = '100%' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-DIR-002');
  UPDATE role_kpis_junction SET target_value = '90%+' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-DIR-003');
  UPDATE role_kpis_junction SET target_value = 'Zero critical' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-DIR-004');
  UPDATE role_kpis_junction SET target_value = '4.5+' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-DIR-005');

  -- Therapeutic Areas
  FOR v_ta_id IN SELECT id FROM ref_therapeutic_areas WHERE unique_id IN ('TA-001', 'TA-002') LOOP
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, true)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END LOOP;

  -- Training
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-GXP-002', 'TRN-COMP-001',
    'TRN-DIR-001', 'TRN-DIR-002', 'TRN-DIR-003'
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

  RAISE NOTICE 'Medical Director junction tables populated for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 6: UPDATE org_roles
-- =====================================================================

UPDATE org_roles
SET
  description = 'A Medical Director in pharmaceutical medical affairs serves as a scientific expert, conscience keeper, people leader, and external face of the organization. They oversee clinical development strategy, protocol design, safety reviews, and regulatory interactions while building relationships with global KOLs and making high-impact go/no-go decisions.',

  gxp_critical = true,
  gxp_types = ARRAY['GCP', 'GVP'],
  patient_facing = false,
  hcp_facing = true,
  safety_critical = true,
  geographic_scope = 'global',
  leadership_level = 'people_manager',

  remote_eligible = true,
  oncall_required = false,
  typical_work_schedule = 'Standard business hours with global meeting flexibility',
  work_location_type = 'Hybrid (office + remote)',

  typical_time_in_role_months = 48,
  advancement_potential = 'High',
  is_entry_point = false,
  career_path_from = ARRAY['Senior MSL', 'MSL Manager', 'Clinical Development Manager', 'Associate Medical Director'],
  career_path_to = ARRAY['Senior Medical Director', 'VP Medical Affairs', 'Chief Medical Officer'],

  role_kpis = '[]'::jsonb,
  clinical_competencies = '[]'::jsonb,
  technical_skills = ARRAY[]::varchar[],
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  soft_skills = ARRAY['Strategic vision', 'Executive presence', 'Influence', 'Decision-making under uncertainty', 'Cross-cultural communication'],

  daily_activities = '[
    {"activity": "Strategic planning & meetings", "percent": 30},
    {"activity": "Clinical data review", "percent": 20},
    {"activity": "Cross-functional collaboration", "percent": 20},
    {"activity": "External expert engagement", "percent": 15},
    {"activity": "Team leadership", "percent": 10},
    {"activity": "Regulatory interactions", "percent": 5}
  ]'::jsonb,

  systems_used = '[
    {"system": "Clinical Trial Management System", "proficiency": "Advanced", "frequency": "Daily"},
    {"system": "Safety Database", "proficiency": "Advanced", "frequency": "Weekly"},
    {"system": "Document Management", "proficiency": "Intermediate", "frequency": "Weekly"},
    {"system": "Veeva CRM", "proficiency": "Intermediate", "frequency": "Weekly"}
  ]'::jsonb,

  stakeholder_interactions = '[
    {"type": "VP Medical Affairs/CMO", "frequency": "Weekly", "nature": "Strategy alignment"},
    {"type": "Clinical Development Team", "frequency": "Daily", "nature": "Trial oversight"},
    {"type": "Regulatory Affairs", "frequency": "Weekly", "nature": "Submission strategy"},
    {"type": "Global KOLs", "frequency": "Monthly", "nature": "Scientific partnership"},
    {"type": "FDA/Regulatory Authorities", "frequency": "Quarterly", "nature": "Regulatory meetings"},
    {"type": "Commercial Leadership", "frequency": "Monthly", "nature": "Launch planning"}
  ]'::jsonb,

  top_responsibilities = ARRAY[
    'Direct clinical development strategy',
    'Oversee clinical trial design and execution',
    'Review safety and efficacy data',
    'Make go/no-go development decisions',
    'Build relationships with global KOLs',
    'Lead regulatory authority interactions'
  ],

  typical_goals = ARRAY[
    'Achieve clinical development milestones',
    'Ensure regulatory submissions on-time',
    'Build robust KOL advisory network',
    'Develop next-generation leaders'
  ],
  common_challenges = ARRAY[
    'Balancing scientific rigor with business timelines',
    'Managing uncertainty in clinical data interpretation',
    'Navigating complex global regulatory landscapes',
    'Resource constraints vs ambitious portfolios'
  ],
  key_motivations = ARRAY[
    'Bringing new treatments to patients',
    'Scientific impact on medicine',
    'Building high-performing teams',
    'Strategic leadership at enterprise level'
  ],

  data_quality_score = 0.92,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'Medical Director profile based on ICON, industry research. Salary ~$232K.',
  updated_at = now()

WHERE name ILIKE '%Medical Director%' AND name NOT ILIKE '%VP%' AND name NOT ILIKE '%Vice%';

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
  'PERSONA-MEDDIR-001',
  'Dr. David Kim, Medical Director',
  'Role-based',
  r.id,
  'Medical Director',
  'A senior medical affairs leader who directs clinical development strategy, oversees trial execution, makes critical go/no-go decisions, and serves as the scientific face of the organization to external stakeholders and regulatory authorities.',
  '42-52',
  'Director',
  'MD, PhD, or PharmD with 10+ years industry experience',
  'Medical Affairs',
  'Medical Affairs',
  'global',
  '["Achieve development milestones", "On-time regulatory submissions", "Build KOL network", "Develop future leaders"]'::jsonb,
  '["Science vs business timelines", "Data interpretation uncertainty", "Complex regulatory landscape", "Resource constraints"]'::jsonb,
  '["Bringing treatments to patients", "Scientific impact", "Team building", "Strategic leadership"]'::jsonb,
  '["Bureaucratic processes", "Competing priorities", "Global coordination complexity"]'::jsonb,
  '[{"activity": "Strategic planning", "percent": 30}, {"activity": "Data review", "percent": 20}, {"activity": "Cross-functional work", "percent": 20}, {"activity": "External engagement", "percent": 15}, {"activity": "Team leadership", "percent": 10}, {"activity": "Regulatory", "percent": 5}]'::jsonb,
  '[{"tool": "CTMS", "proficiency": "Advanced"}, {"tool": "Safety Database", "proficiency": "Advanced"}, {"tool": "Document Management", "proficiency": "Intermediate"}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY[
    'I am the center of the wheel, guiding clinical development, regulatory, and commercial teams.',
    'Every decision I make has to balance scientific rigor with the urgency of unmet patient need.',
    'The most rewarding moment is when a drug I helped develop gets approved and reaches patients.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Oncology', 'Immunology'],
  true,
  0.92,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Medical Director%' AND r.name NOT ILIKE '%VP%' AND r.name NOT ILIKE '%Vice%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  updated_at = now();
