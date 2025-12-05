-- =====================================================================
-- MEDICAL INFORMATION SPECIALIST SEED FILE
-- =====================================================================
-- Version: 2.1.0
-- Created: 2025-11-27
-- Source: ASHP, Pharmacy Times, Industry Research
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - MIS SKILLS
-- =====================================================================

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  ('SKILL-MIS-001', 'Drug Information Research', 'Clinical', 'Systematic literature searching and evidence evaluation using medical databases', true),
  ('SKILL-MIS-002', 'Medical Writing', 'Communication', 'Creating clear, accurate, and balanced responses to medical inquiries', true),
  ('SKILL-MIS-003', 'Active Listening', 'Communication', 'Understanding caller needs and asking clarifying questions', false),
  ('SKILL-MIS-004', 'Adverse Event Documentation', 'Clinical', 'Accurate capture and documentation of safety information per regulatory requirements', true),
  ('SKILL-MIS-005', 'Literature Evaluation', 'Clinical', 'Critical appraisal of medical literature and clinical study design', true)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - MIS COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-MIS-001', 'DRESS Methodology', 'Technical', 'Define, Research, Evaluate, Synthesize, Share approach to medical information', 12),
  ('COMP-MIS-002', 'Pharmacology & Therapeutics', 'Clinical', 'Deep knowledge of drug mechanisms, interactions, and therapeutic applications', 24),
  ('COMP-MIS-003', 'Regulatory Compliance', 'Compliance', 'Understanding of off-label communication rules and adverse event reporting requirements', 12)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - MIS KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-MIS-001', 'Inquiry Response Time', 'Quality', 'hours', 'Daily', true),
  ('KPI-MIS-002', 'Response Accuracy Rate', 'Quality', 'percentage', 'Monthly', true),
  ('KPI-MIS-003', 'Call Volume Handled', 'Activity', 'calls/day', 'Daily', true),
  ('KPI-MIS-004', 'AE/PQC Documentation Compliance', 'Compliance', 'percentage', 'Monthly', true),
  ('KPI-MIS-005', 'Customer Satisfaction Score', 'Quality', 'score (1-5)', 'Monthly', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 4: REFERENCE DATA - MIS TRAINING
-- =====================================================================

INSERT INTO ref_training_programs (unique_id, program_name, program_type, is_mandatory, frequency, estimated_hours, gxp_type)
VALUES
  ('TRN-MIS-001', 'Medical Information Fundamentals', 'Role-specific', true, 'One-time', 40, NULL),
  ('TRN-MIS-002', 'Adverse Event & PQC Handling', 'Compliance', true, 'Annual', 8, 'GVP'),
  ('TRN-MIS-003', 'Off-Label Communication Compliance', 'Compliance', true, 'Annual', 4, NULL),
  ('TRN-MIS-004', 'Literature Search & Evaluation', 'Technical', true, 'One-time', 16, NULL)
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
  WHERE name ILIKE '%Medical Information Specialist%' OR name ILIKE '%Drug Information%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE 'Medical Information Specialist role not found - skipping';
    RETURN;
  END IF;

  -- Skills
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-CLIN-001', 'SKILL-CLIN-002', 'SKILL-CLIN-003',
    'SKILL-COMM-001', 'SKILL-COMM-002',
    'SKILL-MIS-001', 'SKILL-MIS-002', 'SKILL-MIS-003', 'SKILL-MIS-004', 'SKILL-MIS-005'
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Advanced', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Advanced';
  END LOOP;

  -- Competencies
  FOR v_comp_id IN SELECT id FROM ref_competencies WHERE unique_id IN (
    'COMP-CLIN-002', 'COMP-CLIN-003',
    'COMP-MIS-001', 'COMP-MIS-002', 'COMP-MIS-003'
  ) LOOP
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Advanced', 2, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Advanced';
  END LOOP;

  -- KPIs
  FOR v_kpi_id IN SELECT id FROM ref_kpis WHERE unique_id IN (
    'KPI-MIS-001', 'KPI-MIS-002', 'KPI-MIS-003', 'KPI-MIS-004', 'KPI-MIS-005'
  ) LOOP
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, 'TBD', 'Monthly', 'Call Center System')
    ON CONFLICT (role_id, kpi_id) DO NOTHING;
  END LOOP;

  -- Specific targets
  UPDATE role_kpis_junction SET target_value = '24-48 hours', measurement_frequency = 'Daily' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MIS-001');
  UPDATE role_kpis_junction SET target_value = '98%+' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MIS-002');
  UPDATE role_kpis_junction SET target_value = '15-25/day', measurement_frequency = 'Daily' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MIS-003');
  UPDATE role_kpis_junction SET target_value = '100%' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MIS-004');
  UPDATE role_kpis_junction SET target_value = '4.5+' WHERE role_id = v_role_id AND kpi_id = (SELECT id FROM ref_kpis WHERE unique_id = 'KPI-MIS-005');

  -- Therapeutic Areas (broad coverage)
  FOR v_ta_id IN SELECT id FROM ref_therapeutic_areas LOOP
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, false)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END LOOP;

  -- Training
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-GXP-002', 'TRN-COMP-001',
    'TRN-MIS-001', 'TRN-MIS-002', 'TRN-MIS-003', 'TRN-MIS-004'
  ) LOOP
    INSERT INTO role_training (role_id, training_id, is_mandatory)
    VALUES (v_role_id, v_train_id, true)
    ON CONFLICT (role_id, training_id) DO NOTHING;
  END LOOP;

  -- Regulatory
  FOR v_reg_id IN SELECT id FROM ref_regulatory_frameworks WHERE unique_id IN (
    'REG-FDA-001', 'REG-PHRMA-001', 'REG-GVP-001'
  ) LOOP
    INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, applies_to_role)
    VALUES (v_role_id, v_reg_id, 'Advanced', true)
    ON CONFLICT (role_id, framework_id) DO NOTHING;
  END LOOP;

  -- GxP
  INSERT INTO role_gxp_requirements (role_id, gxp_type, is_critical, training_frequency)
  VALUES (v_role_id, 'GVP', true, 'Annual')
  ON CONFLICT (role_id, gxp_type) DO NOTHING;

  RAISE NOTICE 'Medical Information Specialist junction tables populated for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 6: UPDATE org_roles
-- =====================================================================

UPDATE org_roles
SET
  description = 'A Medical Information Specialist (MIS) responds to unsolicited medical inquiries from healthcare professionals and consumers, providing accurate, balanced, and compliant drug information. They use the DRESS methodology (Define, Research, Evaluate, Synthesize, Share) to research and communicate scientific information while documenting adverse events and product quality complaints.',

  gxp_critical = true,
  gxp_types = ARRAY['GVP'],
  patient_facing = false,
  hcp_facing = true,
  safety_critical = true,
  geographic_scope = 'global',
  leadership_level = 'individual_contributor',

  remote_eligible = true,
  oncall_required = true,
  typical_work_schedule = 'Shift-based to cover call center hours',
  work_location_type = 'Office/Call Center or Remote',

  typical_time_in_role_months = 24,
  advancement_potential = 'Medium',
  is_entry_point = true,
  career_path_from = ARRAY['Clinical Pharmacist', 'Drug Information Resident', 'PharmD Graduate'],
  career_path_to = ARRAY['Senior Medical Information Specialist', 'Medical Information Manager', 'MSL', 'Medical Writer'],

  role_kpis = '[]'::jsonb,
  clinical_competencies = '[]'::jsonb,
  technical_skills = ARRAY[]::varchar[],
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  soft_skills = ARRAY['Active listening', 'Clear communication', 'Attention to detail', 'Empathy', 'Time management'],

  daily_activities = '[
    {"activity": "Responding to medical inquiries", "percent": 50},
    {"activity": "Literature research", "percent": 20},
    {"activity": "AE/PQC documentation", "percent": 15},
    {"activity": "Response letter drafting", "percent": 10},
    {"activity": "Training & meetings", "percent": 5}
  ]'::jsonb,

  systems_used = '[
    {"system": "Call Center Platform", "proficiency": "Expert", "frequency": "Daily"},
    {"system": "Medical Information Database", "proficiency": "Expert", "frequency": "Daily"},
    {"system": "PubMed/Medical Databases", "proficiency": "Advanced", "frequency": "Daily"},
    {"system": "Safety Database", "proficiency": "Advanced", "frequency": "Daily"},
    {"system": "Document Management System", "proficiency": "Intermediate", "frequency": "Weekly"}
  ]'::jsonb,

  stakeholder_interactions = '[
    {"type": "Healthcare Professionals", "frequency": "Daily", "nature": "Medical inquiries"},
    {"type": "Consumers/Patients", "frequency": "Daily", "nature": "Drug information"},
    {"type": "Pharmacovigilance", "frequency": "Daily", "nature": "AE handoff"},
    {"type": "MSLs", "frequency": "Weekly", "nature": "Complex inquiry escalation"},
    {"type": "Regulatory Affairs", "frequency": "Monthly", "nature": "Compliance review"}
  ]'::jsonb,

  top_responsibilities = ARRAY[
    'Respond to unsolicited medical inquiries within SLA',
    'Research and synthesize evidence-based responses',
    'Document adverse events and product quality complaints',
    'Maintain accuracy and regulatory compliance',
    'Escalate complex inquiries to MSLs or medical directors',
    'Update standard response documents'
  ],

  typical_goals = ARRAY[
    'Maintain high response accuracy and quality',
    'Meet response time SLAs',
    'Ensure 100% AE/PQC documentation compliance',
    'Develop therapeutic area expertise'
  ],
  common_challenges = ARRAY[
    'High call volume with time pressure',
    'Navigating off-label communication boundaries',
    'Keeping current with evolving product information',
    'Managing emotionally charged caller interactions'
  ],
  key_motivations = ARRAY[
    'Direct impact on patient safety',
    'Intellectual challenge of complex inquiries',
    'Being a trusted information resource',
    'Work-life balance (often remote/shift-based)'
  ],

  data_quality_score = 0.90,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'Medical Information Specialist profile based on ASHP and industry research.',
  updated_at = now()

WHERE name ILIKE '%Medical Information Specialist%' OR name ILIKE '%Drug Information%';

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
  'PERSONA-MIS-001',
  'Dr. Emily Watson, Medical Information Specialist',
  'Role-based',
  r.id,
  'Medical Information Specialist',
  'A drug information expert who responds to medical inquiries from HCPs and consumers, using the DRESS methodology to provide accurate, balanced, and compliant responses while documenting safety information.',
  '28-38',
  'Individual Contributor',
  'PharmD with Drug Information training',
  'Medical Information',
  'Medical Affairs',
  'global',
  '["Maintain high response accuracy", "Meet SLA targets", "100% AE compliance", "Develop TA expertise"]'::jsonb,
  '["High call volume pressure", "Off-label boundaries", "Keeping current", "Emotional caller interactions"]'::jsonb,
  '["Patient safety impact", "Intellectual challenge", "Trusted resource", "Work-life balance"]'::jsonb,
  '["Repetitive standard inquiries", "Time pressure vs quality", "Limited career visibility"]'::jsonb,
  '[{"activity": "Medical inquiries", "percent": 50}, {"activity": "Research", "percent": 20}, {"activity": "AE documentation", "percent": 15}, {"activity": "Letter drafting", "percent": 10}, {"activity": "Training", "percent": 5}]'::jsonb,
  '[{"tool": "Call Center Platform", "proficiency": "Expert"}, {"tool": "Medical Information DB", "proficiency": "Expert"}, {"tool": "PubMed", "proficiency": "Advanced"}, {"tool": "Safety Database", "proficiency": "Advanced"}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  ARRAY[
    'Every call matters - I might be the first person an HCP talks to at our company.',
    'The DRESS process keeps me focused on providing balanced, evidence-based answers.',
    'I love the detective work of researching complex drug interaction questions.'
  ],
  '[{"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Multiple therapeutic areas'],
  true,
  0.90,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Medical Information Specialist%' OR r.name ILIKE '%Drug Information%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  updated_at = now();
