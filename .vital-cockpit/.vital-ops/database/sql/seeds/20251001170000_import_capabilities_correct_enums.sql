-- =====================================================================
-- Import Capabilities with Correct Enum Values
-- Maps batch file data to database schema enums
-- =====================================================================

INSERT INTO capabilities (
  capability_key,
  name,
  description,
  category,
  domain,
  complexity_level,
  status,
  stage,
  vital_component,
  priority,
  maturity,
  is_new,
  panel_recommended,
  competencies,
  implementation_timeline,
  depends_on,
  enables
) VALUES
-- Clinical Trial Design
(
  'clinical-trial-design',
  'Clinical Trial Design',
  'Design and structure clinical trials for medical devices including protocol development, endpoint selection, and statistical planning',
  'clinical',
  'medical',
  'advanced',
  'active',
  'clinical_validation',
  'T_transformation_design',
  'critical_immediate',
  'level_4_leading',
  false,
  true,
  '{"methodology": {"approach": "evidence-based", "steps": ["Define primary and secondary endpoints", "Determine study population and inclusion/exclusion criteria", "Calculate sample size and statistical power", "Design randomization and blinding strategy", "Develop data collection plan", "Create safety monitoring plan"]}, "quality_metrics": {"accuracy_target": "95%", "time_target": "4 hours", "compliance_requirements": ["ICH-GCP", "FDA 21 CFR Part 820", "ISO 14155"]}, "prerequisite_knowledge": ["Good Clinical Practice (GCP)", "Medical Device Regulations", "Clinical Biostatistics", "Ethics in Clinical Research"]}'::jsonb,
  4,
  ARRAY['regulatory-pathway-analysis', 'risk-assessment'],
  ARRAY['clinical-validation', 'regulatory-submission']
),
-- Regulatory Submission
(
  'regulatory-submission',
  'Regulatory Submission Preparation',
  'Prepare comprehensive regulatory submissions including 510(k), PMA, CE-MDR technical documentation',
  'regulatory',
  'regulatory',
  'expert',
  'active',
  'regulatory_pathway',
  'A_acceleration_execution',
  'critical_immediate',
  'level_5_transformative',
  false,
  true,
  '{"methodology": {"approach": "systematic", "steps": ["Conduct predicate device analysis", "Prepare substantial equivalence comparison", "Compile clinical evidence", "Develop risk analysis documentation", "Create labeling and instructions for use", "Prepare quality system documentation"]}, "quality_metrics": {"accuracy_target": "98%", "time_target": "8 hours", "compliance_requirements": ["FDA 21 CFR 807", "CE-MDR Annex II", "ISO 13485"]}, "prerequisite_knowledge": ["FDA Regulatory Framework", "CE-MDR Requirements", "Quality System Regulations", "Clinical Evaluation Principles"]}'::jsonb,
  8,
  ARRAY['device-classification', 'risk-assessment', 'clinical-evidence-evaluation'],
  ARRAY['market-authorization', 'commercialization']
),
-- Health Economics
(
  'health-economics',
  'Health Economic Analysis',
  'Conduct health economic evaluations, budget impact analyses, and cost-effectiveness studies for medical technologies',
  'commercial',
  'commercial',
  'advanced',
  'active',
  'reimbursement_strategy',
  'V_value_discovery',
  'near_term_90_days',
  'level_4_leading',
  false,
  true,
  '{"methodology": {"approach": "evidence-based", "steps": ["Define economic research question", "Develop economic model structure", "Identify and value relevant costs", "Measure health outcomes and utilities", "Conduct sensitivity analyses", "Interpret and present results"]}, "quality_metrics": {"accuracy_target": "92%", "time_target": "6 hours", "compliance_requirements": ["ISPOR Guidelines", "NICE Methods Guide", "ICER Framework"]}, "prerequisite_knowledge": ["Health Economics Principles", "Health Technology Assessment", "Healthcare Costing Methods", "Quality of Life Measurement"]}'::jsonb,
  6,
  ARRAY['clinical-evidence-evaluation', 'market-analysis', 'statistical-modeling'],
  ARRAY['market-access', 'payer-engagement']
),
-- Quality Systems
(
  'quality-systems',
  'Quality Management Systems',
  'Develop and implement quality management systems compliant with ISO 13485 and FDA QSR',
  'quality',
  'technical',
  'advanced',
  'active',
  'regulatory_pathway',
  'T_transformation_design',
  'critical_immediate',
  'level_5_transformative',
  false,
  true,
  '{"methodology": {"approach": "systematic", "steps": ["Conduct gap analysis against standards", "Develop quality manual and procedures", "Implement design controls", "Establish document control system", "Create training and competency programs", "Design audit and review processes"]}, "quality_metrics": {"accuracy_target": "96%", "time_target": "5 hours", "compliance_requirements": ["ISO 13485", "FDA 21 CFR 820", "ISO 9001"]}, "prerequisite_knowledge": ["ISO 13485 Requirements", "FDA Quality System Regulation", "Design Control Principles", "Risk Management (ISO 14971)"]}'::jsonb,
  5,
  ARRAY['risk-management', 'document-control', 'process-validation'],
  ARRAY['regulatory-compliance', 'certification']
),
-- Statistical Analysis
(
  'statistical-analysis',
  'Clinical Statistical Analysis',
  'Perform statistical analyses for clinical studies including descriptive statistics, hypothesis testing, and survival analysis',
  'clinical',
  'medical',
  'advanced',
  'active',
  'clinical_validation',
  'I_intelligence_gathering',
  'critical_immediate',
  'level_4_leading',
  false,
  true,
  '{"methodology": {"approach": "statistical", "steps": ["Define statistical analysis plan", "Conduct data quality assessment", "Perform descriptive analyses", "Execute inferential statistical tests", "Conduct sensitivity analyses", "Generate statistical report"]}, "quality_metrics": {"accuracy_target": "97%", "time_target": "4 hours", "compliance_requirements": ["ICH E9", "FDA Statistical Guidance", "EMA Statistical Guidelines"]}, "prerequisite_knowledge": ["Biostatistics", "Clinical Trial Statistics", "Regulatory Statistics", "Statistical Software Proficiency"]}'::jsonb,
  4,
  ARRAY['clinical-data-management', 'study-design', 'data-validation'],
  ARRAY['regulatory-submission', 'publication']
);
