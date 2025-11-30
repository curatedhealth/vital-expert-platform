-- =====================================================================
-- MSL (MEDICAL SCIENCE LIAISON) SEED FILE - NORMALIZED VERSION
-- =====================================================================
-- Version: 2.0.0
-- Created: 2025-11-27
-- Updated: 2025-11-27
-- Purpose: Normalized seed using junction tables instead of JSONB
-- Template: Use this as base for other Medical Affairs roles
-- =====================================================================
--
-- NORMALIZATION APPROACH:
-- - Reference tables store reusable data (skills, competencies, etc.)
-- - Junction tables link roles to reference data with metadata
-- - JSONB fields only used for truly dynamic/unstructured data
-- - Enables querying: "Find all roles requiring GCP training"
-- =====================================================================

-- =====================================================================
-- STEP 1: REFERENCE DATA - SKILLS
-- =====================================================================

INSERT INTO ref_skills (unique_id, skill_name, skill_category, description, pharma_specific)
VALUES
  ('SKILL-CLIN-001', 'Clinical Data Interpretation', 'Clinical', 'Analyze and interpret clinical trial results, efficacy data, and safety profiles', true),
  ('SKILL-CLIN-002', 'Literature Review & Synthesis', 'Clinical', 'Systematic review of medical literature and synthesis of scientific evidence', true),
  ('SKILL-CLIN-003', 'Pharmacovigilance', 'Clinical', 'Knowledge of adverse event reporting and drug safety monitoring', true),
  ('SKILL-COMM-001', 'Scientific Communication', 'Communication', 'Convey complex scientific information clearly to diverse audiences', true),
  ('SKILL-COMM-002', 'Medical Writing', 'Communication', 'Creating scientific documents, publications, and medical information', true),
  ('SKILL-COMM-003', 'Presentation Skills', 'Communication', 'Delivering engaging scientific presentations to HCPs and KOLs', false),
  ('SKILL-REL-001', 'KOL Relationship Management', 'Relationship', 'Building and maintaining peer-to-peer relationships with key opinion leaders', true),
  ('SKILL-TECH-001', 'Veeva CRM', 'Technical', 'Proficiency in Veeva CRM for medical field tracking and reporting', true)
ON CONFLICT (unique_id) DO UPDATE SET
  skill_name = EXCLUDED.skill_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 2: REFERENCE DATA - COMPETENCIES
-- =====================================================================

INSERT INTO ref_competencies (unique_id, competency_name, competency_category, description, typical_development_time_months)
VALUES
  ('COMP-CLIN-001', 'Clinical Trial Design & Methodology', 'Clinical', 'Understanding of clinical trial phases, endpoints, and regulatory requirements', 36),
  ('COMP-CLIN-002', 'Data Interpretation', 'Clinical', 'Expert analysis of clinical data including efficacy and safety signals', 24),
  ('COMP-CLIN-003', 'Pharmacovigilance & AE Reporting', 'Clinical', 'Adverse event identification, reporting timelines, and regulatory obligations', 12),
  ('COMP-SCI-001', 'Scientific Communication', 'Scientific', 'Peer-to-peer scientific exchange with healthcare professionals', 12),
  ('COMP-REL-001', 'KOL Relationship Management', 'Relationship', 'Strategic engagement with key opinion leaders', 24)
ON CONFLICT (unique_id) DO UPDATE SET
  competency_name = EXCLUDED.competency_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 3: REFERENCE DATA - CERTIFICATIONS
-- =====================================================================

INSERT INTO ref_certifications (unique_id, certification_name, issuing_organization, renewal_required, renewal_frequency_months, pharma_specific)
VALUES
  ('CERT-EDU-001', 'Doctor of Pharmacy (PharmD)', 'Accredited Pharmacy Schools', false, NULL, false),
  ('CERT-EDU-002', 'Doctor of Philosophy (PhD)', 'Accredited Universities', false, NULL, false),
  ('CERT-EDU-003', 'Doctor of Medicine (MD)', 'Medical Schools', true, 24, false),
  ('CERT-MSL-001', 'MAPS MSL Certification', 'Medical Affairs Professional Society', true, 24, true),
  ('CERT-GCP-001', 'GCP Certification', 'CITI / Transcelerate', true, 12, true)
ON CONFLICT (unique_id) DO UPDATE SET
  certification_name = EXCLUDED.certification_name,
  issuing_organization = EXCLUDED.issuing_organization;

-- =====================================================================
-- STEP 4: REFERENCE DATA - REGULATORY FRAMEWORKS
-- =====================================================================

INSERT INTO ref_regulatory_frameworks (unique_id, framework_name, framework_type, description, applies_to_gxp)
VALUES
  ('REG-FDA-001', 'FDA 21 CFR Part 312', 'FDA', 'IND regulations governing clinical trials', true),
  ('REG-ICH-001', 'ICH GCP E6 (R2)', 'ICH', 'Good Clinical Practice guidelines', true),
  ('REG-PHRMA-001', 'PhRMA Code on HCP Interactions', 'PhRMA', 'Industry code for HCP interactions', false),
  ('REG-GVP-001', 'GVP Module VI', 'EMA', 'Pharmacovigilance guidelines for AE reporting', true)
ON CONFLICT (unique_id) DO UPDATE SET
  framework_name = EXCLUDED.framework_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 5: REFERENCE DATA - KPIs
-- =====================================================================

INSERT INTO ref_kpis (unique_id, kpi_name, kpi_category, measurement_unit, typical_frequency, pharma_specific)
VALUES
  ('KPI-MSL-001', 'Tier 1 KOL Interactions', 'Engagement', 'interactions/year', 'Monthly', true),
  ('KPI-MSL-002', 'Field Insights Submitted', 'Quality', 'insights/year', 'Monthly', true),
  ('KPI-MSL-003', 'Scientific Presentation Quality', 'Quality', 'score (1-5)', 'Quarterly', true),
  ('KPI-MSL-004', 'Congress Attendance', 'Activity', 'congresses/year', 'Annually', true),
  ('KPI-MSL-005', 'AE Reporting Compliance', 'Compliance', 'percentage', 'Monthly', true)
ON CONFLICT (unique_id) DO UPDATE SET
  kpi_name = EXCLUDED.kpi_name,
  measurement_unit = EXCLUDED.measurement_unit;

-- =====================================================================
-- STEP 6: REFERENCE DATA - THERAPEUTIC AREAS
-- =====================================================================

INSERT INTO ref_therapeutic_areas (unique_id, area_name, description, typical_trial_phases)
VALUES
  ('TA-001', 'Oncology', 'Cancer diagnosis, treatment, and supportive care', '["Phase 1", "Phase 2", "Phase 3", "Phase 4"]'),
  ('TA-002', 'Immunology', 'Autoimmune diseases and immune system disorders', '["Phase 2", "Phase 3", "Phase 4"]'),
  ('TA-003', 'Cardiovascular', 'Heart and circulatory system diseases', '["Phase 2", "Phase 3", "Phase 4"]'),
  ('TA-004', 'Neuroscience', 'Brain and nervous system disorders', '["Phase 1", "Phase 2", "Phase 3"]')
ON CONFLICT (unique_id) DO UPDATE SET
  area_name = EXCLUDED.area_name,
  description = EXCLUDED.description;

-- =====================================================================
-- STEP 7: REFERENCE DATA - TRAINING PROGRAMS
-- =====================================================================

INSERT INTO ref_training_programs (unique_id, program_name, program_type, is_mandatory, frequency, estimated_hours, gxp_type)
VALUES
  ('TRN-GXP-001', 'GCP Fundamentals', 'GxP', true, 'Annual', 8, 'GCP'),
  ('TRN-GXP-002', 'Pharmacovigilance & AE Reporting', 'GxP', true, 'Annual', 4, 'GVP'),
  ('TRN-COMP-001', 'PhRMA Code Training', 'Compliance', true, 'Annual', 2, NULL),
  ('TRN-ROLE-001', 'MSL Academy Certification', 'Role-specific', true, 'One-time', 40, NULL),
  ('TRN-ROLE-002', 'Therapeutic Area Deep Dive', 'Role-specific', true, 'Quarterly', 16, NULL)
ON CONFLICT (unique_id) DO UPDATE SET
  program_name = EXCLUDED.program_name,
  estimated_hours = EXCLUDED.estimated_hours;

-- =====================================================================
-- STEP 8: POPULATE JUNCTION TABLES (NORMALIZED RELATIONSHIPS)
-- =====================================================================
-- This is where normalization happens: linking roles to reference data
-- via junction tables instead of storing everything in JSONB columns.

-- First, get the MSL role ID (we'll use a CTE for cleaner SQL)
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
  -- Get MSL role ID
  SELECT id INTO v_role_id FROM org_roles
  WHERE name ILIKE '%Medical Science Liaison%' OR name ILIKE '%MSL%'
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE NOTICE 'MSL role not found - skipping junction tables';
    RETURN;
  END IF;

  -- ===== ROLE_SKILLS =====
  -- Link MSL to required skills with proficiency levels
  FOR v_skill_id IN SELECT id FROM ref_skills WHERE unique_id IN (
    'SKILL-CLIN-001', 'SKILL-CLIN-002', 'SKILL-CLIN-003',
    'SKILL-COMM-001', 'SKILL-COMM-002', 'SKILL-COMM-003',
    'SKILL-REL-001', 'SKILL-TECH-001'
  ) LOOP
    INSERT INTO role_skills (role_id, skill_id, proficiency_required, is_required)
    VALUES (v_role_id, v_skill_id, 'Advanced', true)
    ON CONFLICT (role_id, skill_id) DO UPDATE SET proficiency_required = 'Advanced';
  END LOOP;

  -- ===== ROLE_COMPETENCIES =====
  -- Clinical Trial Design - Advanced, 3 years
  SELECT id INTO v_comp_id FROM ref_competencies WHERE unique_id = 'COMP-CLIN-001';
  IF v_comp_id IS NOT NULL THEN
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Advanced', 3, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Advanced';
  END IF;

  -- Data Interpretation - Advanced, 2 years
  SELECT id INTO v_comp_id FROM ref_competencies WHERE unique_id = 'COMP-CLIN-002';
  IF v_comp_id IS NOT NULL THEN
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Advanced', 2, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Advanced';
  END IF;

  -- Pharmacovigilance - Intermediate, 1 year
  SELECT id INTO v_comp_id FROM ref_competencies WHERE unique_id = 'COMP-CLIN-003';
  IF v_comp_id IS NOT NULL THEN
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Intermediate', 1, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Intermediate';
  END IF;

  -- Scientific Communication - Advanced, 1 year
  SELECT id INTO v_comp_id FROM ref_competencies WHERE unique_id = 'COMP-SCI-001';
  IF v_comp_id IS NOT NULL THEN
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Advanced', 1, false)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Advanced';
  END IF;

  -- KOL Relationship Management - Advanced, 2 years
  SELECT id INTO v_comp_id FROM ref_competencies WHERE unique_id = 'COMP-REL-001';
  IF v_comp_id IS NOT NULL THEN
    INSERT INTO role_competencies (role_id, competency_id, proficiency_level, years_to_develop, is_critical)
    VALUES (v_role_id, v_comp_id, 'Advanced', 2, true)
    ON CONFLICT (role_id, competency_id) DO UPDATE SET proficiency_level = 'Advanced';
  END IF;

  -- ===== ROLE_CERTIFICATIONS =====
  -- PharmD - Preferred (77% of MSLs have doctorate)
  SELECT id INTO v_cert_id FROM ref_certifications WHERE unique_id = 'CERT-EDU-001';
  IF v_cert_id IS NOT NULL THEN
    INSERT INTO role_certifications (role_id, certification_id, is_required, is_preferred)
    VALUES (v_role_id, v_cert_id, false, true)
    ON CONFLICT (role_id, certification_id) DO NOTHING;
  END IF;

  -- PhD - Preferred
  SELECT id INTO v_cert_id FROM ref_certifications WHERE unique_id = 'CERT-EDU-002';
  IF v_cert_id IS NOT NULL THEN
    INSERT INTO role_certifications (role_id, certification_id, is_required, is_preferred)
    VALUES (v_role_id, v_cert_id, false, true)
    ON CONFLICT (role_id, certification_id) DO NOTHING;
  END IF;

  -- MD - Preferred
  SELECT id INTO v_cert_id FROM ref_certifications WHERE unique_id = 'CERT-EDU-003';
  IF v_cert_id IS NOT NULL THEN
    INSERT INTO role_certifications (role_id, certification_id, is_required, is_preferred)
    VALUES (v_role_id, v_cert_id, false, true)
    ON CONFLICT (role_id, certification_id) DO NOTHING;
  END IF;

  -- MAPS MSL Certification - Preferred
  SELECT id INTO v_cert_id FROM ref_certifications WHERE unique_id = 'CERT-MSL-001';
  IF v_cert_id IS NOT NULL THEN
    INSERT INTO role_certifications (role_id, certification_id, is_required, is_preferred)
    VALUES (v_role_id, v_cert_id, false, true)
    ON CONFLICT (role_id, certification_id) DO NOTHING;
  END IF;

  -- GCP Certification - Required
  SELECT id INTO v_cert_id FROM ref_certifications WHERE unique_id = 'CERT-GCP-001';
  IF v_cert_id IS NOT NULL THEN
    INSERT INTO role_certifications (role_id, certification_id, is_required, is_preferred)
    VALUES (v_role_id, v_cert_id, true, false)
    ON CONFLICT (role_id, certification_id) DO NOTHING;
  END IF;

  -- ===== ROLE_REGULATORY_FRAMEWORKS =====
  FOR v_reg_id IN SELECT id FROM ref_regulatory_frameworks WHERE unique_id IN (
    'REG-FDA-001', 'REG-ICH-001', 'REG-PHRMA-001', 'REG-GVP-001'
  ) LOOP
    INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_level, applies_to_role)
    VALUES (v_role_id, v_reg_id, 'Advanced', true)
    ON CONFLICT (role_id, framework_id) DO NOTHING;
  END LOOP;

  -- ===== ROLE_KPIS_JUNCTION =====
  -- Tier 1 KOL Interactions
  SELECT id INTO v_kpi_id FROM ref_kpis WHERE unique_id = 'KPI-MSL-001';
  IF v_kpi_id IS NOT NULL THEN
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, '100-120/year', 'Monthly', 'Veeva CRM')
    ON CONFLICT (role_id, kpi_id) DO UPDATE SET target_value = '100-120/year';
  END IF;

  -- Field Insights Submitted
  SELECT id INTO v_kpi_id FROM ref_kpis WHERE unique_id = 'KPI-MSL-002';
  IF v_kpi_id IS NOT NULL THEN
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, '24/year', 'Monthly', 'Medical Insights Platform')
    ON CONFLICT (role_id, kpi_id) DO UPDATE SET target_value = '24/year';
  END IF;

  -- Scientific Presentation Quality
  SELECT id INTO v_kpi_id FROM ref_kpis WHERE unique_id = 'KPI-MSL-003';
  IF v_kpi_id IS NOT NULL THEN
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, '4.5/5.0', 'Quarterly', 'Manager Assessment')
    ON CONFLICT (role_id, kpi_id) DO UPDATE SET target_value = '4.5/5.0';
  END IF;

  -- Congress Attendance
  SELECT id INTO v_kpi_id FROM ref_kpis WHERE unique_id = 'KPI-MSL-004';
  IF v_kpi_id IS NOT NULL THEN
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, '4-6/year', 'Annually', 'Travel System')
    ON CONFLICT (role_id, kpi_id) DO UPDATE SET target_value = '4-6/year';
  END IF;

  -- AE Reporting Compliance
  SELECT id INTO v_kpi_id FROM ref_kpis WHERE unique_id = 'KPI-MSL-005';
  IF v_kpi_id IS NOT NULL THEN
    INSERT INTO role_kpis_junction (role_id, kpi_id, target_value, measurement_frequency, data_source)
    VALUES (v_role_id, v_kpi_id, '100%', 'Monthly', 'Safety Database')
    ON CONFLICT (role_id, kpi_id) DO UPDATE SET target_value = '100%';
  END IF;

  -- ===== ROLE_THERAPEUTIC_AREAS =====
  -- Oncology - Primary
  SELECT id INTO v_ta_id FROM ref_therapeutic_areas WHERE unique_id = 'TA-001';
  IF v_ta_id IS NOT NULL THEN
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, true)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END IF;

  -- Immunology - Secondary
  SELECT id INTO v_ta_id FROM ref_therapeutic_areas WHERE unique_id = 'TA-002';
  IF v_ta_id IS NOT NULL THEN
    INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary)
    VALUES (v_role_id, v_ta_id, false)
    ON CONFLICT (role_id, therapeutic_area_id) DO NOTHING;
  END IF;

  -- ===== ROLE_TRAINING =====
  FOR v_train_id IN SELECT id FROM ref_training_programs WHERE unique_id IN (
    'TRN-GXP-001', 'TRN-GXP-002', 'TRN-COMP-001', 'TRN-ROLE-001', 'TRN-ROLE-002'
  ) LOOP
    INSERT INTO role_training (role_id, training_id, is_mandatory)
    VALUES (v_role_id, v_train_id, true)
    ON CONFLICT (role_id, training_id) DO NOTHING;
  END LOOP;

  -- ===== ROLE_GXP_REQUIREMENTS =====
  INSERT INTO role_gxp_requirements (role_id, gxp_type, is_critical, training_frequency)
  VALUES
    (v_role_id, 'GCP', true, 'Annual'),
    (v_role_id, 'GVP', true, 'Annual')
  ON CONFLICT (role_id, gxp_type) DO NOTHING;

  RAISE NOTICE 'MSL junction tables populated successfully for role_id: %', v_role_id;
END $$;

-- =====================================================================
-- STEP 9: UPDATE MSL ROLE IN org_roles (SIMPLIFIED - NO JSONB DUPLICATION)
-- =====================================================================

UPDATE org_roles
SET
  description = 'A Medical Science Liaison (MSL) serves as a field-based scientific expert who establishes and maintains peer-to-peer relationships with Key Opinion Leaders (KOLs), healthcare professionals, and academic institutions. MSLs are non-promotional professionals who engage in scientific exchange, providing balanced, evidence-based information on therapeutic areas and clinical data.',

  -- Pharma context
  gxp_critical = true,
  gxp_types = ARRAY['GCP', 'GVP'],
  patient_facing = false,
  hcp_facing = true,
  safety_critical = true,
  geographic_scope = 'global',
  leadership_level = 'individual_contributor',

  -- Work environment
  remote_eligible = true,
  oncall_required = false,
  typical_work_schedule = 'Flexible to accommodate HCP availability',
  work_location_type = 'Field-based (home office + travel)',

  -- Career
  typical_time_in_role_months = 24,
  advancement_potential = 'High',
  is_entry_point = false,
  career_path_from = ARRAY['Clinical Research Associate', 'Pharmacy Resident', 'Clinical Pharmacist'],
  career_path_to = ARRAY['Senior MSL', 'MSL Manager', 'Medical Director'],

  -- NORMALIZED: KPIs now in role_kpis_junction table
  role_kpis = '[]'::jsonb,

  -- NORMALIZED: Competencies now in role_competencies table
  clinical_competencies = '[]'::jsonb,

  -- Soft skills (kept as array - no reference table needed)
  soft_skills = ARRAY['Relationship building', 'Scientific communication', 'Emotional intelligence', 'Active listening'],

  -- NORMALIZED: Technical skills now in role_skills table
  technical_skills = ARRAY[]::varchar[],

  -- Daily activities (kept as JSONB - dynamic/unstructured)
  daily_activities = '[
    {"activity": "KOL meetings and scientific exchange", "percent": 40},
    {"activity": "Travel to healthcare institutions", "percent": 15},
    {"activity": "Literature review", "percent": 15},
    {"activity": "CRM documentation and admin", "percent": 15},
    {"activity": "Internal meetings", "percent": 10},
    {"activity": "Training", "percent": 5}
  ]'::jsonb,

  -- Systems used (kept as JSONB - dynamic/unstructured)
  systems_used = '[
    {"system": "Veeva CRM", "proficiency": "Advanced", "frequency": "Daily"},
    {"system": "Medical Insights Platform", "proficiency": "Intermediate", "frequency": "Weekly"},
    {"system": "Safety Database", "proficiency": "Basic", "frequency": "As needed"}
  ]'::jsonb,

  -- Stakeholder interactions (kept as JSONB - dynamic/unstructured)
  stakeholder_interactions = '[
    {"type": "Key Opinion Leaders", "frequency": "Weekly", "nature": "Scientific exchange"},
    {"type": "Healthcare Providers", "frequency": "Daily", "nature": "Education"},
    {"type": "Clinical Development", "frequency": "Monthly", "nature": "Trial support"},
    {"type": "Regulatory Affairs", "frequency": "Quarterly", "nature": "Compliance"}
  ]'::jsonb,

  -- Responsibilities (kept as array - simple list)
  top_responsibilities = ARRAY[
    'Build peer-to-peer relationships with KOLs',
    'Provide scientific information to HCPs',
    'Report actionable medical insights',
    'Support investigator-initiated trials',
    'Present at medical congresses',
    'Report adverse events within 24 hours'
  ],

  -- Goals, Challenges, Motivations (kept as arrays - persona-specific)
  typical_goals = ARRAY[
    'Establish trusted relationships with Tier 1 KOLs',
    'Generate actionable medical insights',
    'Maintain scientific credibility',
    'Achieve 100% pharmacovigilance compliance'
  ],
  common_challenges = ARRAY[
    'Extensive travel (60-80%) impacts work-life balance',
    'Staying current with evolving clinical data',
    'Navigating PhRMA Code compliance',
    'Differentiating from sales representatives'
  ],
  key_motivations = ARRAY[
    'Impact on patient outcomes through HCP education',
    'Intellectual stimulation and continuous learning',
    'Building relationships with thought leaders',
    'Being at forefront of medical innovation'
  ],

  -- NORMALIZED: Training now in role_training table
  gxp_training = '[]'::jsonb,
  role_specific_training = '[]'::jsonb,

  -- Metadata
  data_quality_score = 0.95,
  last_validated = now(),
  validated_by = 'Data Agent Team',
  enrichment_notes = 'Normalized v2.0 - KPIs, competencies, skills, training linked via junction tables. JSONB kept only for daily_activities, systems_used, stakeholder_interactions.',
  updated_at = now()

WHERE name ILIKE '%Medical Science Liaison%'
  OR name ILIKE '%MSL%';

-- =====================================================================
-- STEP 10: CREATE MSL PERSONA (NORMALIZED - LINKED TO ROLE)
-- =====================================================================
-- Persona links to org_role via source_role_id
-- JSONB fields that ARE normalized (via junction tables): skills, competencies, success_metrics
-- JSONB fields KEPT as JSONB: goals, challenges, motivations, frustrations (persona-specific)
-- JSONB fields KEPT as JSONB: daily_activities, tools_used (dynamic/unstructured)

INSERT INTO personas (
  unique_id,
  persona_name,
  persona_type,
  source_role_id,  -- NORMALIZED: Link to org_roles
  title,
  description,
  age_range,
  experience_level,
  education_level,
  department,
  function_area,
  geographic_scope,
  -- Behavioral attributes (kept as JSONB - persona-specific narrative)
  goals,
  challenges,
  motivations,
  frustrations,
  -- Work patterns (kept as JSONB - dynamic/unstructured)
  daily_activities,
  tools_used,
  -- NORMALIZED: skills/competencies/success_metrics now via junction tables
  skills,
  competencies,
  success_metrics,
  -- Qualitative
  sample_quotes,
  -- Pharma-specific
  gxp_requirements,
  therapeutic_areas,
  -- Metadata
  is_active,
  data_quality_score,
  created_by
)
SELECT
  'PERSONA-MSL-001',
  'Dr. Sarah Chen, MSL',
  'Role-based',
  r.id,  -- Link to the actual org_role
  'Medical Science Liaison',
  'A field-based scientific expert who establishes peer-to-peer relationships with KOLs and HCPs, providing balanced, evidence-based information on therapeutic areas. Non-promotional professional focused on scientific exchange.',
  '30-40',
  'Senior Individual Contributor',
  'PharmD, PhD, or MD (77% hold doctorate)',
  'Field Medical',
  'Medical Affairs',
  'global',
  -- Behavioral attributes (persona narrative - kept as JSONB)
  '["Establish trusted KOL relationships", "Generate actionable insights", "Maintain scientific credibility", "100% pharmacovigilance compliance"]'::jsonb,
  '["60-80% travel impacts work-life balance", "Staying current with clinical data", "PhRMA Code compliance", "Differentiating from sales"]'::jsonb,
  '["Patient impact through HCP education", "Continuous learning", "Thought leader relationships", "Medical innovation access"]'::jsonb,
  '["Extensive travel demands", "Information overload", "Compliance constraints"]'::jsonb,
  -- Work patterns (kept as JSONB)
  '[{"activity": "KOL meetings", "percent": 40}, {"activity": "Travel", "percent": 15}, {"activity": "Literature review", "percent": 15}, {"activity": "Admin", "percent": 15}, {"activity": "Internal meetings", "percent": 10}, {"activity": "Training", "percent": 5}]'::jsonb,
  '[{"tool": "Veeva CRM", "proficiency": "Advanced"}, {"tool": "Medical Insights Platform", "proficiency": "Intermediate"}, {"tool": "PubMed", "proficiency": "Advanced"}]'::jsonb,
  -- NORMALIZED: Empty arrays - actual data in junction tables via source_role_id
  '[]'::jsonb,  -- skills via role_skills
  '[]'::jsonb,  -- competencies via role_competencies
  '[]'::jsonb,  -- success_metrics via role_kpis_junction
  -- Qualitative
  ARRAY[
    'My role is to be a trusted scientific peer to healthcare professionals.',
    'The best part is when a KOL says our conversation helped them think differently about treatment.',
    'Staying current with the science is both my biggest challenge and reward.'
  ],
  -- NORMALIZED: GxP via role_gxp_requirements, but keep summary for quick access
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  -- NORMALIZED: Therapeutic areas via role_therapeutic_areas, but keep array for filtering
  ARRAY['Oncology', 'Immunology'],
  -- Metadata
  true,
  0.95,
  'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Medical Science Liaison%' OR r.name ILIKE '%MSL%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  source_role_id = EXCLUDED.source_role_id,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  skills = '[]'::jsonb,
  competencies = '[]'::jsonb,
  success_metrics = '[]'::jsonb,
  updated_at = now();

-- =====================================================================
-- PERSONA 2: REGIONAL MSL (EMEA)
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
  'PERSONA-MSL-002',
  'Dr. James Rodriguez, Regional MSL',
  'Role-based',
  r.id,
  'Medical Science Liaison - EMEA',
  'A regional MSL covering multiple European countries, adapting global medical strategy to local market needs while navigating diverse regulatory environments and cultural contexts.',
  '32-42',
  'Individual Contributor',
  'PhD in Pharmacology',
  'Field Medical',
  'Medical Affairs',
  'regional',
  '["Adapt global strategy to regional needs", "Build multi-country KOL network", "Navigate diverse regulatory environments", "Support regional clinical trials"]'::jsonb,
  '["Multi-language communication", "Cross-cultural engagement", "Varying regulatory requirements", "50-70% travel across countries"]'::jsonb,
  '["Cross-cultural impact", "Regional thought leadership", "Career growth to global role", "Building pan-European networks"]'::jsonb,
  '["Time zone coordination", "Language barriers", "Inconsistent local support"]'::jsonb,
  '[{"activity": "KOL meetings", "percent": 35}, {"activity": "International travel", "percent": 20}, {"activity": "Regional coordination", "percent": 15}, {"activity": "Literature review", "percent": 15}, {"activity": "Admin", "percent": 10}, {"activity": "Training", "percent": 5}]'::jsonb,
  '[{"tool": "Veeva CRM", "proficiency": "Advanced"}, {"tool": "Microsoft Teams", "proficiency": "Advanced"}, {"tool": "Translation Tools", "proficiency": "Intermediate"}]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  ARRAY[
    'Working across cultures is challenging but incredibly rewarding.',
    'I need to understand not just the science but how medicine is practiced differently in each country.',
    'Being a regional MSL prepared me for thinking globally while acting locally.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Oncology', 'Cardiovascular'],
  true, 0.90, 'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Medical Science Liaison%' OR r.name ILIKE '%MSL%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  geographic_scope = 'regional',
  updated_at = now();

-- =====================================================================
-- PERSONA 3: LOCAL MSL (Japan)
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
  'PERSONA-MSL-003',
  'Dr. Yuki Tanaka, Local MSL',
  'Role-based',
  r.id,
  'Medical Science Liaison - Japan',
  'A local MSL with deep expertise in the Japanese healthcare market, navigating unique PMDA regulations and building relationships with Japanese KOLs in their native language and cultural context.',
  '35-45',
  'Individual Contributor',
  'PharmD from Japanese university',
  'Field Medical',
  'Medical Affairs',
  'local',
  '["Build deep local KOL relationships", "Navigate PMDA requirements", "Adapt global data to local context", "Support Japan-specific studies"]'::jsonb,
  '["Strict hierarchical HCP relationships", "PMDA-specific requirements", "Language localization of materials", "40-60% domestic travel"]'::jsonb,
  '["Deep market expertise", "Native language advantage", "Local patient impact", "Cultural bridge role"]'::jsonb,
  '["Global materials not Japan-ready", "Time zone challenges with HQ", "Unique local regulations"]'::jsonb,
  '[{"activity": "KOL meetings", "percent": 40}, {"activity": "Domestic travel", "percent": 15}, {"activity": "Material localization", "percent": 15}, {"activity": "Literature review", "percent": 15}, {"activity": "HQ coordination", "percent": 10}, {"activity": "Training", "percent": 5}]'::jsonb,
  '[{"tool": "Veeva CRM", "proficiency": "Advanced"}, {"tool": "Local Medical DB", "proficiency": "Expert"}, {"tool": "J-Stage", "proficiency": "Advanced"}]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  ARRAY[
    'Understanding the nuances of Japanese medical culture is essential for building trust.',
    'I bridge the gap between global strategy and local implementation.',
    'My native fluency allows me to have deeper scientific discussions than a non-Japanese MSL could.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Oncology', 'Neuroscience'],
  true, 0.88, 'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Medical Science Liaison%' OR r.name ILIKE '%MSL%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  geographic_scope = 'local',
  updated_at = now();

-- =====================================================================
-- PERSONA 4: ENTRY-LEVEL MSL
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
  'PERSONA-MSL-004',
  'Dr. Priya Sharma, Entry-Level MSL',
  'Role-based',
  r.id,
  'Medical Science Liaison - Entry Level',
  'A newly hired MSL transitioning from clinical practice, learning to apply scientific expertise in a field-based pharmaceutical role while building their first KOL network.',
  '28-35',
  'Entry Level',
  'PharmD with 2 years clinical residency',
  'Field Medical',
  'Medical Affairs',
  'regional',
  '["Complete MSL Academy certification", "Build initial KOL relationships", "Learn CRM and field processes", "Achieve first-year targets"]'::jsonb,
  '["Steep learning curve", "Building credibility with experienced KOLs", "Transitioning from clinical mindset", "Managing extensive travel for first time"]'::jsonb,
  '["Career change opportunity", "Better work-life than clinical practice", "Intellectual challenge", "Patient impact at scale"]'::jsonb,
  '["Information overload", "Imposter syndrome with senior KOLs", "Missing clinical patient interaction"]'::jsonb,
  '[{"activity": "KOL meetings", "percent": 30}, {"activity": "Training & onboarding", "percent": 25}, {"activity": "Travel", "percent": 15}, {"activity": "Mentoring sessions", "percent": 15}, {"activity": "Admin", "percent": 10}, {"activity": "Literature review", "percent": 5}]'::jsonb,
  '[{"tool": "Veeva CRM", "proficiency": "Basic"}, {"tool": "Medical Insights Platform", "proficiency": "Basic"}, {"tool": "Training LMS", "proficiency": "Intermediate"}]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  ARRAY[
    'Every KOL meeting is a learning experience in my first year.',
    'I miss the direct patient care but love the broader impact I can have.',
    'My mentor has been invaluable in helping me navigate the transition from clinic to field.'
  ],
  '[{"type": "GCP", "critical": true}, {"type": "GVP", "critical": true}]'::jsonb,
  ARRAY['Immunology'],
  true, 0.85, 'Data Agent Team'
FROM org_roles r
WHERE r.name ILIKE '%Medical Science Liaison%' OR r.name ILIKE '%MSL%'
LIMIT 1
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  experience_level = 'Entry Level',
  updated_at = now();

-- =====================================================================
-- STEP 11: VERIFICATION QUERIES (NORMALIZED DATA)
-- =====================================================================

-- 1. Basic persona check
-- SELECT unique_id, persona_name, department, data_quality_score FROM personas WHERE unique_id = 'PERSONA-MSL-001';

-- 2. Get persona with linked role
/*
SELECT
  p.persona_name,
  p.title,
  r.name as source_role,
  p.data_quality_score
FROM personas p
JOIN org_roles r ON p.source_role_id = r.id
WHERE p.unique_id = 'PERSONA-MSL-001';
*/

-- 3. Get role with all skills (via junction table)
/*
SELECT
  r.name as role_name,
  s.skill_name,
  s.skill_category,
  rs.proficiency_required,
  rs.is_required
FROM org_roles r
JOIN role_skills rs ON r.id = rs.role_id
JOIN ref_skills s ON rs.skill_id = s.id
WHERE r.name ILIKE '%Medical Science Liaison%'
ORDER BY s.skill_category, s.skill_name;
*/

-- 4. Get role with all KPIs and targets (via junction table)
/*
SELECT
  r.name as role_name,
  k.kpi_name,
  rk.target_value,
  rk.measurement_frequency,
  rk.data_source
FROM org_roles r
JOIN role_kpis_junction rk ON r.id = rk.role_id
JOIN ref_kpis k ON rk.kpi_id = k.id
WHERE r.name ILIKE '%Medical Science Liaison%'
ORDER BY k.kpi_category;
*/

-- 5. Get role with required training (via junction table)
/*
SELECT
  r.name as role_name,
  t.program_name,
  t.program_type,
  t.frequency,
  t.estimated_hours,
  rt.is_mandatory
FROM org_roles r
JOIN role_training rt ON r.id = rt.role_id
JOIN ref_training_programs t ON rt.training_id = t.id
WHERE r.name ILIKE '%Medical Science Liaison%'
ORDER BY t.program_type;
*/

-- 6. Find all roles requiring GCP training (power of normalization!)
/*
SELECT DISTINCT r.name
FROM org_roles r
JOIN role_gxp_requirements rgxp ON r.id = rgxp.role_id
WHERE rgxp.gxp_type = 'GCP';
*/

-- 7. Complete MSL profile with all normalized relationships
/*
WITH msl_role AS (
  SELECT id, name, description
  FROM org_roles
  WHERE name ILIKE '%Medical Science Liaison%' OR name ILIKE '%MSL%'
  LIMIT 1
)
SELECT
  mr.name as role_name,
  p.persona_name,
  (SELECT array_agg(s.skill_name) FROM role_skills rs JOIN ref_skills s ON rs.skill_id = s.id WHERE rs.role_id = mr.id) as skills,
  (SELECT array_agg(c.competency_name) FROM role_competencies rc JOIN ref_competencies c ON rc.competency_id = c.id WHERE rc.role_id = mr.id) as competencies,
  (SELECT array_agg(k.kpi_name) FROM role_kpis_junction rk JOIN ref_kpis k ON rk.kpi_id = k.id WHERE rk.role_id = mr.id) as kpis,
  (SELECT array_agg(t.program_name) FROM role_training rt JOIN ref_training_programs t ON rt.training_id = t.id WHERE rt.role_id = mr.id) as training
FROM msl_role mr
LEFT JOIN personas p ON p.source_role_id = mr.id;
*/
