-- =====================================================================================
-- 04_foundation_kpis.sql
-- Foundation KPIs - Performance Metrics for Workflows & Tasks
-- =====================================================================================
-- Purpose: Seed foundational KPI definitions for measuring task/workflow performance
-- Dependencies: Tenant must exist, dh_kpi table must be created
-- Execution Order: 4 (foundation - after agents, personas, tools, RAG sources)
-- =====================================================================================
--
-- KPI CATEGORIES:
-- - Execution Quality (completeness, accuracy, consistency)
-- - Execution Efficiency (time, resource utilization)
-- - Clinical/Scientific Quality (clinical validity, scientific rigor)
-- - Regulatory Compliance (FDA alignment, GCP compliance)
-- - Business Impact (cost, timeline, risk reduction)
-- - User/Patient Experience (burden, satisfaction)
-- =====================================================================================

-- =====================================================================================
-- SECTION 0: TENANT LOOKUP & SESSION CONFIGURATION
-- =====================================================================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_tenant_slug TEXT := 'digital-health-startup';
BEGIN
  SELECT id INTO v_tenant_id 
  FROM tenants 
  WHERE slug = v_tenant_slug;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant with slug "%" not found. Please create tenant first.', v_tenant_slug;
  END IF;
  
  RAISE NOTICE 'Using tenant: % (ID: %)', v_tenant_slug, v_tenant_id;
END $$;

CREATE TEMP TABLE IF NOT EXISTS session_config (
  tenant_id UUID,
  tenant_slug TEXT
);

DELETE FROM session_config;

INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug 
FROM tenants 
WHERE slug = 'digital-health-startup';

-- =====================================================================================
-- SECTION 1: EXECUTION QUALITY KPIs
-- =====================================================================================

INSERT INTO dh_kpi (
  tenant_id,
  code,
  name,
  unique_id,
  unit,
  description,
  metadata
)
SELECT 
  sc.tenant_id,
  k_data.code,
  k_data.name,
  k_data.unique_id,
  k_data.unit,
  k_data.description,
  k_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Completeness
    (
      'KPI-EXE-COMPLETENESS',
      'Output Completeness Score',
      'KPI-EXE-COMPLETENESS',
      '%',
      'Measures completeness of task output against expected deliverables. 100% means all required sections/components present.',
      jsonb_build_object(
        'category', 'EXECUTION_QUALITY',
        'target_range', jsonb_build_object('min', 90, 'optimal', 100),
        'calculation_method', 'Count of required elements present / Total required elements * 100',
        'applicable_to', json_build_array('All tasks with deliverables'),
        'interpretation', jsonb_build_object(
          '90-100', 'Excellent - All required elements present',
          '80-89', 'Good - Minor gaps',
          '70-79', 'Acceptable - Some gaps',
          'below_70', 'Needs improvement'
        )
      )
    ),
    
    -- Accuracy
    (
      'KPI-EXE-ACCURACY',
      'Output Accuracy Score',
      'KPI-EXE-ACCURACY',
      '%',
      'Measures factual accuracy and correctness of outputs. Includes citation accuracy, data accuracy, calculation correctness.',
      jsonb_build_object(
        'category', 'EXECUTION_QUALITY',
        'target_range', jsonb_build_object('min', 95, 'optimal', 100),
        'calculation_method', 'Correct facts/calculations / Total facts/calculations * 100',
        'applicable_to', json_build_array('Analysis tasks', 'Research tasks', 'Calculation tasks'),
        'interpretation', jsonb_build_object(
          '95-100', 'Excellent - No material errors',
          '90-94', 'Good - Minor errors only',
          '85-89', 'Acceptable - Some errors requiring correction',
          'below_85', 'Needs rework'
        )
      )
    ),
    
    -- Consistency
    (
      'KPI-EXE-CONSISTENCY',
      'Internal Consistency Score',
      'KPI-EXE-CONSISTENCY',
      '%',
      'Measures consistency across document sections, alignment between claims and evidence, and logical coherence.',
      jsonb_build_object(
        'category', 'EXECUTION_QUALITY',
        'target_range', jsonb_build_object('min', 90, 'optimal', 100),
        'calculation_method', 'Consistent elements / Total elements requiring consistency * 100',
        'applicable_to', json_build_array('Document generation', 'Analysis tasks'),
        'interpretation', jsonb_build_object(
          '95-100', 'Excellent - Fully consistent',
          '90-94', 'Good - Minor inconsistencies',
          '85-89', 'Acceptable - Some inconsistencies',
          'below_85', 'Needs harmonization'
        )
      )
    ),
    
    -- Relevance
    (
      'KPI-EXE-RELEVANCE',
      'Content Relevance Score',
      'KPI-EXE-RELEVANCE',
      '%',
      'Measures relevance of content to stated objectives and user requirements. Indicates focus and lack of off-topic content.',
      jsonb_build_object(
        'category', 'EXECUTION_QUALITY',
        'target_range', jsonb_build_object('min', 85, 'optimal', 95),
        'calculation_method', 'Relevant content / Total content * 100',
        'applicable_to', json_build_array('Research tasks', 'Analysis tasks', 'Literature review'),
        'interpretation', jsonb_build_object(
          '90-100', 'Excellent - Highly focused',
          '80-89', 'Good - Mostly relevant',
          '70-79', 'Acceptable - Some off-topic content',
          'below_70', 'Too much irrelevant content'
        )
      )
    ),
    
    -- Citation Quality
    (
      'KPI-EXE-CITATION-QUALITY',
      'Citation Quality Score',
      'KPI-EXE-CITATION-QUALITY',
      '%',
      'Measures quality of citations: correct format, accessible sources, appropriate recency, authoritative sources.',
      jsonb_build_object(
        'category', 'EXECUTION_QUALITY',
        'target_range', jsonb_build_object('min', 90, 'optimal', 100),
        'calculation_method', 'High-quality citations / Total citations * 100',
        'applicable_to', json_build_array('Research tasks', 'Regulatory analysis', 'Literature review'),
        'quality_criteria', json_build_array(
          'Correct format (AMA, APA, etc.)',
          'Verifiable/accessible source',
          'Appropriate recency',
          'Authoritative source',
          'Primary source when available'
        )
      )
    )
) AS k_data(
  code, name, unique_id, unit, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name,
  unique_id = EXCLUDED.unique_id,
  unit = EXCLUDED.unit,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 2: EXECUTION EFFICIENCY KPIs
-- =====================================================================================

INSERT INTO dh_kpi (
  tenant_id, code, name, unique_id, unit, description, metadata
)
SELECT 
  sc.tenant_id, k_data.code, k_data.name, k_data.unique_id, 
  k_data.unit, k_data.description, k_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Execution Time
    (
      'KPI-EFF-EXECUTION-TIME',
      'Task Execution Time',
      'KPI-EFF-EXECUTION-TIME',
      'minutes',
      'Actual time to complete task from start to human-approval-ready state.',
      jsonb_build_object(
        'category', 'EXECUTION_EFFICIENCY',
        'target_type', 'task_specific',
        'calculation_method', 'End timestamp - Start timestamp',
        'applicable_to', json_build_array('All executable tasks'),
        'benchmarks', jsonb_build_object(
          'research_task', '15-30 min',
          'analysis_task', '20-40 min',
          'writing_task', '30-60 min',
          'synthesis_task', '40-90 min'
        )
      )
    ),
    
    -- First-Time Success Rate
    (
      'KPI-EFF-FIRST-TIME-SUCCESS',
      'First-Time Success Rate',
      'KPI-EFF-FIRST-TIME-SUCCESS',
      '%',
      'Percentage of tasks that pass human review on first attempt without requiring agent rework.',
      jsonb_build_object(
        'category', 'EXECUTION_EFFICIENCY',
        'target_range', jsonb_build_object('min', 70, 'optimal', 90),
        'calculation_method', 'Tasks approved first time / Total tasks * 100',
        'applicable_to', json_build_array('All tasks with human review'),
        'interpretation', jsonb_build_object(
          '85-100', 'Excellent - Agent output consistently high quality',
          '70-84', 'Good - Acceptable rework rate',
          '50-69', 'Needs improvement - Too many iterations',
          'below_50', 'Agent needs retraining or prompt refinement'
        )
      )
    ),
    
    -- Iteration Count
    (
      'KPI-EFF-ITERATION-COUNT',
      'Average Iteration Count',
      'KPI-EFF-ITERATION-COUNT',
      'iterations',
      'Average number of agent-human feedback cycles before approval.',
      jsonb_build_object(
        'category', 'EXECUTION_EFFICIENCY',
        'target_range', jsonb_build_object('min', 1, 'optimal', 1.5),
        'calculation_method', 'Sum of iterations / Total tasks',
        'applicable_to', json_build_array('All tasks with iterative refinement'),
        'interpretation', jsonb_build_object(
          '1.0-1.5', 'Excellent - Minimal rework',
          '1.6-2.0', 'Good - Some refinement expected',
          '2.1-3.0', 'Acceptable - Moderate rework',
          'above_3.0', 'Needs improvement - Excessive iterations'
        )
      )
    ),
    
    -- Resource Utilization
    (
      'KPI-EFF-TOKEN-EFFICIENCY',
      'Token Efficiency Score',
      'KPI-EFF-TOKEN-EFFICIENCY',
      'tokens/output-page',
      'Tokens consumed per page of quality output. Lower is better (more efficient).',
      jsonb_build_object(
        'category', 'EXECUTION_EFFICIENCY',
        'target_type', 'minimize',
        'calculation_method', 'Total tokens consumed / Output pages',
        'applicable_to', json_build_array('All LLM-based tasks'),
        'benchmarks', jsonb_build_object(
          'research_summary', '2000-4000 tokens/page',
          'analysis', '3000-6000 tokens/page',
          'synthesis', '4000-8000 tokens/page'
        )
      )
    ),
    
    -- Workflow Velocity
    (
      'KPI-EFF-WORKFLOW-VELOCITY',
      'Workflow Completion Velocity',
      'KPI-EFF-WORKFLOW-VELOCITY',
      'days',
      'Total days from workflow start to completion (all tasks done and approved).',
      jsonb_build_object(
        'category', 'EXECUTION_EFFICIENCY',
        'target_type', 'workflow_specific',
        'calculation_method', 'Workflow end date - Workflow start date',
        'applicable_to', json_build_array('Complete workflows'),
        'benchmarks', jsonb_build_object(
          'endpoint_selection', '3-5 days',
          'protocol_development', '10-15 days',
          'statistical_plan', '5-7 days',
          'regulatory_submission', '15-25 days'
        )
      )
    )
) AS k_data(
  code, name, unique_id, unit, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  unit = EXCLUDED.unit, description = EXCLUDED.description,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 3: CLINICAL & SCIENTIFIC QUALITY KPIs
-- =====================================================================================

INSERT INTO dh_kpi (
  tenant_id, code, name, unique_id, unit, description, metadata
)
SELECT 
  sc.tenant_id, k_data.code, k_data.name, k_data.unique_id, 
  k_data.unit, k_data.description, k_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Clinical Validity
    (
      'KPI-QUAL-CLINICAL-VALIDITY',
      'Clinical Validity Score',
      'KPI-QUAL-CLINICAL-VALIDITY',
      '%',
      'Expert assessment of clinical validity and scientific rigor of recommendations and analyses.',
      jsonb_build_object(
        'category', 'CLINICAL_QUALITY',
        'target_range', jsonb_build_object('min', 85, 'optimal', 95),
        'calculation_method', 'Expert review scoring (validated rubric)',
        'applicable_to', json_build_array('Clinical endpoint selection', 'Study design', 'Clinical analysis'),
        'reviewers', json_build_array('P01_CMO', 'P02_VPCLIN', 'P04_BIOSTAT'),
        'quality_dimensions', json_build_array(
          'Scientific rigor',
          'Clinical meaningfulness',
          'Methodological soundness',
          'Evidence quality',
          'Risk assessment'
        )
      )
    ),
    
    -- Statistical Rigor
    (
      'KPI-QUAL-STATISTICAL-RIGOR',
      'Statistical Rigor Score',
      'KPI-QUAL-STATISTICAL-RIGOR',
      '%',
      'Biostatistician assessment of statistical methodology, assumptions, and analytical soundness.',
      jsonb_build_object(
        'category', 'CLINICAL_QUALITY',
        'target_range', jsonb_build_object('min', 90, 'optimal', 100),
        'calculation_method', 'Biostatistician review scoring',
        'applicable_to', json_build_array('Statistical analysis', 'Sample size calculation', 'Power analysis'),
        'reviewers', json_build_array('P04_BIOSTAT'),
        'quality_dimensions', json_build_array(
          'Appropriate methods selected',
          'Assumptions checked and valid',
          'Power calculations correct',
          'Missing data handled appropriately',
          'Multiple testing addressed'
        )
      )
    ),
    
    -- Evidence Quality
    (
      'KPI-QUAL-EVIDENCE-STRENGTH',
      'Evidence Strength Score',
      'KPI-QUAL-EVIDENCE-STRENGTH',
      'score',
      'Quality and strength of supporting evidence using standard evidence grading (e.g., GRADE approach).',
      jsonb_build_object(
        'category', 'CLINICAL_QUALITY',
        'target_range', jsonb_build_object('min', 3, 'optimal', 4),
        'scale', jsonb_build_object(
          '4', 'High quality - RCTs, systematic reviews',
          '3', 'Moderate quality - Well-designed observational studies',
          '2', 'Low quality - Case series, weak observational',
          '1', 'Very low quality - Expert opinion, case reports'
        ),
        'calculation_method', 'GRADE or similar evidence grading system',
        'applicable_to', json_build_array('Clinical recommendations', 'Regulatory strategy', 'Endpoint selection')
      )
    ),
    
    -- Patient-Centeredness
    (
      'KPI-QUAL-PATIENT-CENTERED',
      'Patient-Centeredness Score',
      'KPI-QUAL-PATIENT-CENTERED',
      '%',
      'Patient advocate assessment of patient relevance, burden, and patient-reported priorities.',
      jsonb_build_object(
        'category', 'CLINICAL_QUALITY',
        'target_range', jsonb_build_object('min', 80, 'optimal', 95),
        'calculation_method', 'Patient advocate review scoring',
        'applicable_to', json_build_array('Endpoint selection', 'Study design', 'PRO selection'),
        'reviewers', json_build_array('P10_PATADV'),
        'quality_dimensions', json_build_array(
          'Outcomes meaningful to patients',
          'Acceptable patient burden',
          'Clear patient communication',
          'Accessibility considerations',
          'Patient engagement'
        )
      )
    )
) AS k_data(
  code, name, unique_id, unit, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  unit = EXCLUDED.unit, description = EXCLUDED.description,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 4: REGULATORY COMPLIANCE KPIs
-- =====================================================================================

INSERT INTO dh_kpi (
  tenant_id, code, name, unique_id, unit, description, metadata
)
SELECT 
  sc.tenant_id, k_data.code, k_data.name, k_data.unique_id, 
  k_data.unit, k_data.description, k_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- FDA Alignment
    (
      'KPI-REG-FDA-ALIGNMENT',
      'FDA Guidance Alignment Score',
      'KPI-REG-FDA-ALIGNMENT',
      '%',
      'Regulatory affairs assessment of alignment with FDA guidance and regulatory precedent.',
      jsonb_build_object(
        'category', 'REGULATORY_COMPLIANCE',
        'target_range', jsonb_build_object('min', 90, 'optimal', 100),
        'calculation_method', 'Regulatory review scoring against FDA guidance',
        'applicable_to', json_build_array('Regulatory strategy', 'Submission documents', 'Study design'),
        'reviewers', json_build_array('P05_REGAFF'),
        'quality_dimensions', json_build_array(
          'FDA guidance adherence',
          'Regulatory precedent alignment',
          'Risk mitigation adequacy',
          'Submission readiness',
          'Potential FDA questions addressed'
        )
      )
    ),
    
    -- Regulatory Risk Score
    (
      'KPI-REG-RISK-SCORE',
      'Regulatory Risk Score',
      'KPI-REG-RISK-SCORE',
      'risk_level',
      'Overall regulatory risk assessment: LOW, MEDIUM, HIGH. Lower is better.',
      jsonb_build_object(
        'category', 'REGULATORY_COMPLIANCE',
        'target_value', 'LOW',
        'scale', jsonb_build_object(
          'LOW', 'Well-precedented, low FDA question risk',
          'MEDIUM', 'Some novel aspects, moderate FDA scrutiny expected',
          'HIGH', 'Novel approach, significant FDA interaction likely'
        ),
        'calculation_method', 'Regulatory expert assessment',
        'applicable_to', json_build_array('All regulatory-facing deliverables'),
        'reviewers', json_build_array('P05_REGAFF', 'P01_CMO')
      )
    ),
    
    -- GCP Compliance
    (
      'KPI-REG-GCP-COMPLIANCE',
      'GCP Compliance Score',
      'KPI-REG-GCP-COMPLIANCE',
      '%',
      'Quality assurance assessment of ICH-GCP compliance in study design and execution plans.',
      jsonb_build_object(
        'category', 'REGULATORY_COMPLIANCE',
        'target_range', jsonb_build_object('min', 95, 'optimal', 100),
        'calculation_method', 'QA review against ICH-GCP checklist',
        'applicable_to', json_build_array('Protocol', 'Study plans', 'Operational procedures'),
        'reviewers', json_build_array('P13_QA'),
        'compliance_areas', json_build_array(
          'Informed consent',
          'Ethics committee approval',
          'Investigator qualifications',
          'Monitoring procedures',
          'Data quality assurance'
        )
      )
    ),
    
    -- Precedent Coverage
    (
      'KPI-REG-PRECEDENT-COVERAGE',
      'Regulatory Precedent Coverage',
      'KPI-REG-PRECEDENT-COVERAGE',
      '%',
      'Percentage of key decisions backed by regulatory precedent (prior approvals, FDA feedback).',
      jsonb_build_object(
        'category', 'REGULATORY_COMPLIANCE',
        'target_range', jsonb_build_object('min', 70, 'optimal', 90),
        'calculation_method', 'Decisions with precedent / Total key decisions * 100',
        'applicable_to', json_build_array('Regulatory strategy', 'Endpoint selection', 'Study design'),
        'interpretation', jsonb_build_object(
          '85-100', 'Excellent - Well-precedented approach',
          '70-84', 'Good - Mostly precedented',
          '50-69', 'Moderate - Some novel elements',
          'below_50', 'High novelty - Proactive FDA interaction recommended'
        )
      )
    )
) AS k_data(
  code, name, unique_id, unit, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  unit = EXCLUDED.unit, description = EXCLUDED.description,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- SECTION 5: BUSINESS IMPACT KPIs
-- =====================================================================================

INSERT INTO dh_kpi (
  tenant_id, code, name, unique_id, unit, description, metadata
)
SELECT 
  sc.tenant_id, k_data.code, k_data.name, k_data.unique_id, 
  k_data.unit, k_data.description, k_data.metadata
FROM session_config sc
CROSS JOIN (
  VALUES
    -- Cost Savings
    (
      'KPI-BIZ-COST-SAVINGS',
      'Estimated Cost Savings',
      'KPI-BIZ-COST-SAVINGS',
      'USD',
      'Estimated cost savings from AI-assisted workflow vs traditional consultant/manual approach.',
      jsonb_build_object(
        'category', 'BUSINESS_IMPACT',
        'target_type', 'maximize',
        'calculation_method', 'Traditional cost - AI-assisted cost',
        'applicable_to', json_build_array('All workflows'),
        'cost_benchmarks', jsonb_build_object(
          'endpoint_selection_traditional', '$15,000-25,000',
          'endpoint_selection_ai', '$3,000-5,000',
          'protocol_development_traditional', '$50,000-100,000',
          'protocol_development_ai', '$10,000-20,000'
        )
      )
    ),
    
    -- Time Savings
    (
      'KPI-BIZ-TIME-SAVINGS',
      'Timeline Acceleration',
      'KPI-BIZ-TIME-SAVINGS',
      'days',
      'Days saved compared to traditional timeline for same deliverable.',
      jsonb_build_object(
        'category', 'BUSINESS_IMPACT',
        'target_type', 'maximize',
        'calculation_method', 'Traditional timeline - AI-assisted timeline',
        'applicable_to', json_build_array('All workflows'),
        'time_benchmarks', jsonb_build_object(
          'endpoint_selection_traditional', '10-15 days',
          'endpoint_selection_ai', '3-5 days',
          'protocol_traditional', '30-45 days',
          'protocol_ai', '10-15 days'
        )
      )
    ),
    
    -- Risk Mitigation Value
    (
      'KPI-BIZ-RISK-MITIGATION',
      'Risk Mitigation Value',
      'KPI-BIZ-RISK-MITIGATION',
      'USD',
      'Estimated value of risks avoided/mitigated (e.g., avoided FDA Complete Response Letter, better endpoint selection).',
      jsonb_build_object(
        'category', 'BUSINESS_IMPACT',
        'target_type', 'maximize',
        'calculation_method', 'Expected value of risks mitigated',
        'applicable_to', json_build_array('High-risk decisions'),
        'risk_values', jsonb_build_object(
          'avoided_crl', '$2M-5M',
          'avoided_endpoint_failure', '$3M-7M',
          'avoided_protocol_amendment', '$500K-2M',
          'avoided_study_failure', '$5M-15M'
        )
      )
    ),
    
    -- Approval Probability Improvement
    (
      'KPI-BIZ-APPROVAL-PROBABILITY',
      'Estimated Approval Probability Improvement',
      'KPI-BIZ-APPROVAL-PROBABILITY',
      '%',
      'Estimated percentage point improvement in regulatory approval probability from better decisions.',
      jsonb_build_object(
        'category', 'BUSINESS_IMPACT',
        'target_range', jsonb_build_object('min', 5, 'optimal', 15),
        'calculation_method', 'Expert estimate based on decision quality improvements',
        'applicable_to', json_build_array('Strategic workflows', 'Regulatory strategy'),
        'baseline_assumption', 'Baseline DTx approval rate ~40-50%',
        'interpretation', jsonb_build_object(
          '10-20pp', 'Excellent - Material improvement',
          '5-9pp', 'Good - Meaningful improvement',
          '1-4pp', 'Modest improvement',
          '0pp', 'No estimated impact'
        )
      )
    )
) AS k_data(
  code, name, unique_id, unit, description, metadata
)
ON CONFLICT (tenant_id, code)
DO UPDATE SET
  name = EXCLUDED.name, unique_id = EXCLUDED.unique_id,
  unit = EXCLUDED.unit, description = EXCLUDED.description,
  metadata = EXCLUDED.metadata, updated_at = CURRENT_TIMESTAMP;

-- =====================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================

-- Summary by category
SELECT 
  'Foundation KPIs by Category' as status,
  metadata->>'category' as category,
  COUNT(*) as kpi_count
FROM dh_kpi
WHERE tenant_id = (SELECT tenant_id FROM session_config)
  AND metadata->>'category' IS NOT NULL
GROUP BY metadata->>'category'
ORDER BY kpi_count DESC;

-- Overall summary
SELECT 
  'Foundation KPIs Seeded' as status,
  jsonb_build_object(
    'total_kpis', COUNT(*),
    'execution_quality', COUNT(*) FILTER (WHERE metadata->>'category' = 'EXECUTION_QUALITY'),
    'execution_efficiency', COUNT(*) FILTER (WHERE metadata->>'category' = 'EXECUTION_EFFICIENCY'),
    'clinical_quality', COUNT(*) FILTER (WHERE metadata->>'category' = 'CLINICAL_QUALITY'),
    'regulatory_compliance', COUNT(*) FILTER (WHERE metadata->>'category' = 'REGULATORY_COMPLIANCE'),
    'business_impact', COUNT(*) FILTER (WHERE metadata->>'category' = 'BUSINESS_IMPACT')
  ) as summary
FROM dh_kpi
WHERE tenant_id = (SELECT tenant_id FROM session_config);

-- List all KPIs with their units
SELECT 
  'All Foundation KPIs' as status,
  code,
  name,
  unit,
  metadata->>'category' as category,
  metadata->'target_range'->>'optimal' as optimal_target
FROM dh_kpi
WHERE tenant_id = (SELECT tenant_id FROM session_config)
ORDER BY metadata->>'category', code;

-- =====================================================================================
-- END OF SCRIPT
-- =====================================================================================

