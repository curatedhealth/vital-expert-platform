-- Insert Capabilities with correct enum values
INSERT INTO capabilities (
  capability_key,
  name,
  description,
  category,
  stage,
  vital_component,
  priority,
  maturity,
  is_new,
  panel_recommended
) VALUES
(
  'clinical-trial-design',
  'Clinical Trial Design',
  'Design and structure clinical trials for medical devices including protocol development, endpoint selection, and statistical planning',
  'clinical',
  'clinical_validation',
  'clinical_development',
  'high',
  'mature',
  false,
  true
),
(
  'regulatory-submission',
  'Regulatory Submission Preparation',
  'Prepare comprehensive regulatory submissions including 510(k), PMA, CE-MDR technical documentation',
  'regulatory',
  'regulatory_pathway',
  'regulatory',
  'critical',
  'mature',
  false,
  true
),
(
  'health-economics',
  'Health Economic Analysis',
  'Conduct health economic evaluations, budget impact analyses, and cost-effectiveness studies for medical technologies',
  'commercial',
  'reimbursement_strategy',
  'commercial',
  'high',
  'mature',
  false,
  true
),
(
  'quality-systems',
  'Quality Management Systems',
  'Develop and implement quality management systems compliant with ISO 13485 and FDA QSR',
  'quality',
  'regulatory_pathway',
  'quality',
  'critical',
  'mature',
  false,
  true
),
(
  'statistical-analysis',
  'Clinical Statistical Analysis',
  'Perform statistical analyses for clinical studies including descriptive statistics, hypothesis testing, and survival analysis',
  'clinical',
  'clinical_validation',
  'clinical_development',
  'high',
  'mature',
  false,
  true
);
