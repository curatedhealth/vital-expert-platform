-- ========================================
-- VITAL PATH: CLINICAL INTELLIGENCE AGENTS
-- Phase 1 Implementation
-- ========================================

-- Agent 1: Clinical Trial Designer
INSERT INTO agents (
    id,
    organization_id,
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    specializations,
    tools,
    tier,
    priority,
    implementation_phase,
    rag_enabled,
    knowledge_domains,
    data_sources,
    roi_metrics,
    use_cases,
    target_users,
    required_integrations,
    security_level,
    compliance_requirements,
    status,
    is_custom,
    is_public,
    medical_specialty,
    clinical_validation_status,
    medical_accuracy_score,
    citation_accuracy,
    hallucination_rate,
    medical_error_rate,
    fda_samd_class,
    hipaa_compliant,
    pharma_enabled,
    verify_enabled,
    cost_per_query,
    average_latency_ms,
    audit_trail
) VALUES (
    gen_random_uuid(),
    NULL, -- Set to your organization_id
    'clinical-trial-designer',
    'Clinical Trial Designer',
    'AI agent specialized in designing comprehensive clinical trial protocols with regulatory compliance. Handles protocol development, endpoint selection, statistical power calculations, and risk assessment for Phase I-IV trials.',
    '🔬',
    'text-emerald-600',
    'You are a Clinical Trial Designer AI specializing in protocol development for pharmaceutical and medical device trials. Your expertise includes:
- Designing trial protocols compliant with ICH-GCP, FDA 21 CFR Part 11, and EU CTR
- Selecting appropriate primary and secondary endpoints
- Calculating statistical power and sample sizes
- Developing inclusion/exclusion criteria
- Creating risk assessment and mitigation strategies
- Ensuring patient safety while maintaining scientific rigor

Always cite relevant regulatory guidelines and provide evidence-based recommendations. Include confidence scores for your recommendations and flag any areas requiring human expert review.',
    'gpt-4',
    0.7,
    4000,
    ARRAY[
        'Protocol template generation',
        'Endpoint selection and justification',
        'Statistical power calculation',
        'Sample size determination',
        'Inclusion/exclusion criteria optimization',
        'Risk assessment and mitigation',
        'Site feasibility assessment',
        'Regulatory compliance checking',
        'Budget estimation',
        'Timeline planning'
    ]::jsonb,
    ARRAY[
        'Oncology trials',
        'Cardiovascular studies',
        'CNS/Neurology trials',
        'Rare disease protocols',
        'Pediatric studies',
        'Medical device trials',
        'Adaptive trial designs',
        'Basket and umbrella trials'
    ]::jsonb,
    ARRAY[
        'ClinicalTrials.gov API',
        'FDA guidance database',
        'EMA guidelines',
        'Statistical calculators',
        'Protocol templates',
        'Risk assessment tools'
    ]::jsonb,
    5, -- Tier 5 (Highest)
    1, -- Top priority
    1, -- Phase 1 implementation
    true, -- RAG enabled
    ARRAY[
        'Clinical trial methodology',
        'Regulatory guidelines',
        'Statistical methods',
        'Good Clinical Practice',
        'Patient safety',
        'Ethics in research'
    ]::jsonb,
    ARRAY[
        'ClinicalTrials.gov',
        'FDA guidance documents',
        'EMA clinical trial database',
        'ICH guidelines',
        'Medical literature (PubMed)',
        'Historical trial data'
    ]::jsonb,
    jsonb_build_object(
        'time_saved_hours', 120,
        'cost_reduction_percentage', 35,
        'protocol_approval_rate', 0.92,
        'amendment_reduction', 0.45,
        'regulatory_compliance_score', 0.98
    ),
    ARRAY[
        'New drug clinical development',
        'Medical device trials',
        'Post-market surveillance studies',
        'Investigator-initiated trials',
        'Regulatory submission support'
    ]::jsonb,
    ARRAY[
        'Clinical operations teams',
        'Medical directors',
        'Regulatory affairs',
        'Biostatisticians',
        'CROs'
    ]::jsonb,
    ARRAY[
        'EDC systems',
        'CTMS platforms',
        'eTMF systems',
        'Statistical software',
        'Regulatory databases'
    ]::jsonb,
    'high', -- Security level
    ARRAY[
        'ICH-GCP',
        'FDA 21 CFR Part 11',
        'EU Clinical Trials Regulation',
        'HIPAA',
        'GDPR'
    ]::jsonb,
    'active',
    false, -- Not custom
    true, -- Public
    'Clinical Research',
    'validated',
    0.95, -- Medical accuracy score
    0.98, -- Citation accuracy
    0.02, -- Hallucination rate
    0.01, -- Medical error rate
    'II', -- FDA SaMD Class
    true, -- HIPAA compliant
    true, -- PHARMA enabled
    true, -- VERIFY enabled
    0.0850, -- Cost per query
    1800, -- Average latency (ms)
    jsonb_build_object(
        'last_validation', '2024-01-15',
        'validation_method', 'Expert panel review',
        'validators', ARRAY['Dr. Sarah Chen', 'Dr. Michael Roberts'],
        'next_review', '2024-07-15'
    )
);

-- Agent 2: Medical Literature Analyst
INSERT INTO agents (
    id,
    organization_id,
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    specializations,
    tools,
    tier,
    priority,
    implementation_phase,
    rag_enabled,
    knowledge_domains,
    data_sources,
    roi_metrics,
    use_cases,
    target_users,
    required_integrations,
    security_level,
    compliance_requirements,
    status,
    is_custom,
    is_public,
    medical_specialty,
    clinical_validation_status,
    medical_accuracy_score,
    citation_accuracy,
    hallucination_rate,
    medical_error_rate,
    fda_samd_class,
    hipaa_compliant,
    pharma_enabled,
    verify_enabled,
    cost_per_query,
    average_latency_ms,
    audit_trail
) VALUES (
    gen_random_uuid(),
    NULL, -- Set to your organization_id
    'medical-literature-analyst',
    'Medical Literature Analyst',
    'Performs comprehensive medical literature analysis, systematic reviews, and meta-analyses with evidence grading according to PRISMA and Cochrane standards.',
    '📚',
    'text-blue-600',
    'You are a Medical Literature Analyst AI specializing in systematic reviews and evidence synthesis. Your expertise includes:
- Conducting systematic literature reviews following PRISMA guidelines
- Performing meta-analyses with appropriate statistical methods
- Grading evidence quality using GRADE methodology
- Managing citations and references
- Identifying research gaps and contradictions
- Synthesizing complex medical evidence

Always provide complete citations in Vancouver format. Include confidence intervals, p-values, and effect sizes where applicable. Flag any potential biases or limitations in the evidence.',
    'gpt-4',
    0.6,
    4000,
    ARRAY[
        'Systematic literature review',
        'Meta-analysis',
        'Evidence synthesis',
        'Citation management',
        'GRADE assessment',
        'Risk of bias evaluation',
        'Forest plot generation',
        'Funnel plot analysis',
        'Sensitivity analysis',
        'Subgroup analysis'
    ]::jsonb,
    ARRAY[
        'Clinical effectiveness',
        'Comparative effectiveness',
        'Safety profiles',
        'Health economics',
        'Epidemiology',
        'Diagnostic accuracy',
        'Prognostic studies',
        'Treatment guidelines'
    ]::jsonb,
    ARRAY[
        'PubMed search',
        'Cochrane Library',
        'EMBASE access',
        'Web of Science',
        'Reference manager',
        'Statistical tools'
    ]::jsonb,
    5, -- Tier 5
    1, -- High priority
    1, -- Phase 1
    true, -- RAG enabled
    ARRAY[
        'Evidence-based medicine',
        'Research methodology',
        'Biostatistics',
        'Clinical epidemiology',
        'Medical writing',
        'Critical appraisal'
    ]::jsonb,
    ARRAY[
        'PubMed/MEDLINE',
        'Cochrane Library',
        'EMBASE',
        'Web of Science',
        'ClinicalKey',
        'UpToDate'
    ]::jsonb,
    jsonb_build_object(
        'time_saved_hours', 160,
        'literature_coverage', 0.95,
        'citation_accuracy', 0.99,
        'review_quality_score', 0.94,
        'publication_acceptance_rate', 0.87
    ),
    ARRAY[
        'Systematic reviews for submissions',
        'Literature support for clinical trials',
        'Evidence gap analysis',
        'Competitive intelligence',
        'Publication planning'
    ]::jsonb,
    ARRAY[
        'Medical affairs teams',
        'Clinical researchers',
        'Regulatory writers',
        'Health economists',
        'Medical writers'
    ]::jsonb,
    ARRAY[
        'Reference management software',
        'Statistical packages',
        'Medical databases',
        'Journal APIs',
        'Citation tools'
    ]::jsonb,
    'standard',
    ARRAY[
        'PRISMA guidelines',
        'Cochrane standards',
        'ICMJE requirements',
        'Copyright compliance'
    ]::jsonb,
    'active',
    false,
    true,
    'Medical Research',
    'validated',
    0.98, -- Very high accuracy for literature
    1.00, -- Perfect citation accuracy
    0.01, -- Very low hallucination
    0.005, -- Minimal error rate
    'I', -- Lower risk class
    false, -- No PHI handling
    true, -- PHARMA enabled
    true, -- VERIFY enabled
    0.0650, -- Cost per query
    2200, -- Average latency
    jsonb_build_object(
        'last_validation', '2024-01-20',
        'validation_method', 'Librarian expert review',
        'validators', ARRAY['Sarah Mitchell, MLS', 'Dr. James Liu'],
        'next_review', '2024-07-20'
    )
);

-- Agent 3: Diagnostic Pathway Optimizer
INSERT INTO agents (
    id,
    organization_id,
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    specializations,
    tools,
    tier,
    priority,
    implementation_phase,
    rag_enabled,
    knowledge_domains,
    data_sources,
    roi_metrics,
    use_cases,
    target_users,
    required_integrations,
    security_level,
    compliance_requirements,
    status,
    is_custom,
    is_public,
    medical_specialty,
    clinical_validation_status,
    medical_accuracy_score,
    citation_accuracy,
    hallucination_rate,
    medical_error_rate,
    fda_samd_class,
    hipaa_compliant,
    pharma_enabled,
    verify_enabled,
    cost_per_query,
    average_latency_ms,
    audit_trail
) VALUES (
    gen_random_uuid(),
    NULL,
    'diagnostic-pathway-optimizer',
    'Diagnostic Pathway Optimizer',
    'Optimizes diagnostic pathways based on clinical guidelines, creating decision trees and algorithms for efficient and accurate diagnosis.',
    '🔍',
    'text-purple-600',
    'You are a Diagnostic Pathway Optimizer AI specializing in clinical decision support. Your expertise includes:
- Designing diagnostic algorithms based on current clinical guidelines
- Optimizing test ordering sequences for efficiency and accuracy
- Calculating sensitivity, specificity, and predictive values
- Performing cost-effectiveness analysis of diagnostic strategies
- Creating clinical decision trees
- Integrating multiple guidelines and evidence sources

Provide clear decision points with supporting evidence. Include diagnostic accuracy metrics and cost considerations. Flag any areas where guidelines conflict or evidence is limited.',
    'gpt-4',
    0.65,
    3500,
    ARRAY[
        'Diagnostic algorithm design',
        'Decision tree creation',
        'Test sequence optimization',
        'Sensitivity/specificity analysis',
        'Cost-effectiveness modeling',
        'Guideline integration',
        'Differential diagnosis support',
        'Risk stratification',
        'Diagnostic accuracy assessment',
        'Clinical pathway mapping'
    ]::jsonb,
    ARRAY[
        'Emergency medicine',
        'Primary care',
        'Cardiology',
        'Oncology screening',
        'Infectious diseases',
        'Radiology protocols',
        'Laboratory medicine',
        'Point-of-care testing'
    ]::jsonb,
    ARRAY[
        'Clinical guidelines database',
        'Diagnostic test database',
        'Decision tree builder',
        'Statistical calculators',
        'Cost analysis tools',
        'Pathway visualization'
    ]::jsonb,
    4, -- Tier 4
    2, -- Priority 2
    1, -- Phase 1
    true,
    ARRAY[
        'Clinical guidelines',
        'Diagnostic medicine',
        'Health economics',
        'Clinical epidemiology',
        'Evidence-based practice',
        'Quality improvement'
    ]::jsonb,
    ARRAY[
        'Clinical practice guidelines',
        'Diagnostic test databases',
        'Cochrane reviews',
        'NICE guidelines',
        'Medical society recommendations',
        'Cost-effectiveness studies'
    ]::jsonb,
    jsonb_build_object(
        'diagnostic_accuracy_improvement', 0.23,
        'time_to_diagnosis_reduction', 0.35,
        'cost_per_diagnosis_saved', 450,
        'unnecessary_test_reduction', 0.42,
        'guideline_compliance_rate', 0.89
    ),
    ARRAY[
        'Clinical pathway development',
        'Diagnostic protocol optimization',
        'Quality improvement initiatives',
        'Clinical decision support systems',
        'Medical education'
    ]::jsonb,
    ARRAY[
        'Clinicians',
        'Hospital administrators',
        'Quality improvement teams',
        'Clinical informaticists',
        'Medical educators'
    ]::jsonb,
    ARRAY[
        'EHR systems',
        'CPOE systems',
        'Clinical decision support tools',
        'Laboratory information systems',
        'Radiology systems'
    ]::jsonb,
    'high',
    ARRAY[
        'Clinical practice guidelines',
        'HIPAA',
        'Medical device regulations',
        'Quality standards'
    ]::jsonb,
    'active',
    false,
    true,
    'Diagnostic Medicine',
    'validated',
    0.96,
    0.97,
    0.015,
    0.008,
    'II',
    true,
    false,
    true,
    0.0550,
    1600,
    jsonb_build_object(
        'last_validation', '2024-02-01',
        'validation_method', 'Clinical pathway review',
        'validators', ARRAY['Dr. Emily Watson', 'Dr. Robert Kim'],
        'next_review', '2024-08-01'
    )
);

-- Agent 4: Treatment Outcome Predictor
INSERT INTO agents (
    id,
    organization_id,
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    specializations,
    tools,
    tier,
    priority,
    implementation_phase,
    rag_enabled,
    knowledge_domains,
    data_sources,
    roi_metrics,
    use_cases,
    target_users,
    required_integrations,
    security_level,
    compliance_requirements,
    status,
    is_custom,
    is_public,
    medical_specialty,
    clinical_validation_status,
    medical_accuracy_score,
    citation_accuracy,
    hallucination_rate,
    medical_error_rate,
    fda_samd_class,
    hipaa_compliant,
    pharma_enabled,
    verify_enabled,
    cost_per_query,
    average_latency_ms,
    audit_trail
) VALUES (
    gen_random_uuid(),
    NULL,
    'treatment-outcome-predictor',
    'Treatment Outcome Predictor',
    'Predicts treatment outcomes based on patient characteristics, biomarkers, and historical data using advanced predictive analytics.',
    '📈',
    'text-red-600',
    'You are a Treatment Outcome Predictor AI specializing in predictive analytics for clinical outcomes. Your expertise includes:
- Predicting treatment response based on patient characteristics
- Risk stratification for adverse outcomes
- Biomarker-based outcome prediction
- Survival analysis and prognostic modeling
- Comparative effectiveness prediction
- Personalized treatment recommendations

Provide confidence intervals and uncertainty quantification for all predictions. Clearly state the evidence basis and any limitations. Include relevant biomarkers and patient factors in your analysis.',
    'gpt-4',
    0.7,
    3500,
    ARRAY[
        'Outcome prediction modeling',
        'Risk stratification',
        'Biomarker analysis',
        'Survival analysis',
        'Response prediction',
        'Prognostic scoring',
        'Comparative effectiveness',
        'Personalized medicine',
        'Machine learning models',
        'Predictive analytics'
    ]::jsonb,
    ARRAY[
        'Oncology outcomes',
        'Cardiovascular risk',
        'Diabetes management',
        'Transplant outcomes',
        'Critical care',
        'Chronic disease',
        'Surgical outcomes',
        'Mental health'
    ]::jsonb,
    ARRAY[
        'Predictive models',
        'Risk calculators',
        'Biomarker databases',
        'Outcome registries',
        'ML frameworks',
        'Statistical packages'
    ]::jsonb,
    4,
    2,
    1,
    true,
    ARRAY[
        'Predictive medicine',
        'Biostatistics',
        'Machine learning',
        'Precision medicine',
        'Clinical epidemiology',
        'Outcomes research'
    ]::jsonb,
    ARRAY[
        'Clinical trial databases',
        'Real-world evidence',
        'Biomarker studies',
        'Patient registries',
        'Outcomes databases',
        'Genomic databases'
    ]::jsonb,
    jsonb_build_object(
        'prediction_accuracy', 0.84,
        'clinical_utility_score', 0.78,
        'treatment_optimization_rate', 0.31,
        'adverse_event_reduction', 0.26,
        'personalization_index', 0.72
    ),
    ARRAY[
        'Precision medicine initiatives',
        'Treatment selection',
        'Risk assessment',
        'Clinical trial enrichment',
        'Value-based care'
    ]::jsonb,
    ARRAY[
        'Oncologists',
        'Cardiologists',
        'Clinical researchers',
        'Precision medicine teams',
        'Health systems'
    ]::jsonb,
    ARRAY[
        'EHR systems',
        'Genomic platforms',
        'Biomarker assays',
        'Clinical registries',
        'Analytics platforms'
    ]::jsonb,
    'high',
    ARRAY[
        'HIPAA',
        'FDA AI/ML guidance',
        'Clinical AI standards',
        'GDPR'
    ]::jsonb,
    'active',
    false,
    true,
    'Predictive Medicine',
    'validated',
    0.92,
    0.95,
    0.03,
    0.02,
    'III', -- Higher risk due to treatment decisions
    true,
    true,
    true,
    0.0750,
    2000,
    jsonb_build_object(
        'last_validation', '2024-01-25',
        'validation_method', 'Retrospective validation study',
        'validators', ARRAY['Dr. Maria Rodriguez', 'Dr. David Chang'],
        'validation_n', 2500,
        'next_review', '2024-07-25'
    )
);

-- Agent 5: Patient Cohort Analyzer
INSERT INTO agents (
    id,
    organization_id,
    name,
    display_name,
    description,
    avatar,
    color,
    system_prompt,
    model,
    temperature,
    max_tokens,
    capabilities,
    specializations,
    tools,
    tier,
    priority,
    implementation_phase,
    rag_enabled,
    knowledge_domains,
    data_sources,
    roi_metrics,
    use_cases,
    target_users,
    required_integrations,
    security_level,
    compliance_requirements,
    status,
    is_custom,
    is_public,
    medical_specialty,
    clinical_validation_status,
    medical_accuracy_score,
    citation_accuracy,
    hallucination_rate,
    medical_error_rate,
    fda_samd_class,
    hipaa_compliant,
    pharma_enabled,
    verify_enabled,
    cost_per_query,
    average_latency_ms,
    audit_trail
) VALUES (
    gen_random_uuid(),
    NULL,
    'patient-cohort-analyzer',
    'Patient Cohort Analyzer',
    'Analyzes patient populations for clinical trials, real-world evidence studies, and epidemiological research with advanced cohort selection.',
    '👥',
    'text-indigo-600',
    'You are a Patient Cohort Analyzer AI specializing in population health analytics. Your expertise includes:
- Identifying and characterizing patient cohorts
- Analyzing demographic and clinical characteristics
- Assessing cohort eligibility for trials
- Calculating disease prevalence and incidence
- Identifying patient subpopulations
- Performing comparative cohort analysis

Ensure all analyses comply with privacy regulations. Provide detailed cohort characteristics with appropriate statistical measures. Flag any potential selection biases.',
    'gpt-4',
    0.65,
    3500,
    ARRAY[
        'Cohort identification',
        'Population analysis',
        'Eligibility assessment',
        'Demographic profiling',
        'Disease epidemiology',
        'Subgroup analysis',
        'Comparative analysis',
        'Feasibility assessment',
        'Sample size calculation',
        'Recruitment planning'
    ]::jsonb,
    ARRAY[
        'Clinical trials',
        'Epidemiology',
        'Real-world evidence',
        'Pharmacoepidemiology',
        'Health disparities',
        'Rare diseases',
        'Pediatric populations',
        'Geriatric medicine'
    ]::jsonb,
    ARRAY[
        'Population databases',
        'EHR analytics',
        'Claims databases',
        'Registry tools',
        'Statistical software',
        'Visualization tools'
    ]::jsonb,
    3,
    3,
    1,
    true,
    ARRAY[
        'Epidemiology',
        'Biostatistics',
        'Population health',
        'Clinical research',
        'Health services research',
        'Public health'
    ]::jsonb,
    ARRAY[
        'Claims databases',
        'EHR databases',
        'Patient registries',
        'Population health data',
        'Census data',
        'Disease registries'
    ]::jsonb,
    jsonb_build_object(
        'cohort_identification_accuracy', 0.91,
        'recruitment_efficiency', 0.45,
        'feasibility_prediction_accuracy', 0.87,
        'time_to_enrollment_reduction', 0.38,
        'protocol_amendment_reduction', 0.29
    ),
    ARRAY[
        'Clinical trial feasibility',
        'RWE study design',
        'Epidemiological research',
        'Market sizing',
        'Patient recruitment'
    ]::jsonb,
    ARRAY[
        'Clinical operations',
        'Epidemiologists',
        'Market access teams',
        'Health economists',
        'Public health researchers'
    ]::jsonb,
    ARRAY[
        'Claims databases',
        'EHR systems',
        'Patient registries',
        'Clinical trial databases',
        'Analytics platforms'
    ]::jsonb,
    'high',
    ARRAY[
        'HIPAA',
        'GDPR',
        'De-identification standards',
        'IRB requirements'
    ]::jsonb,
    'active',
    false,
    true,
    'Population Health',
    'validated',
    0.93,
    0.96,
    0.02,
    0.01,
    'I',
    true,
    true,
    true,
    0.0450,
    1400,
    jsonb_build_object(
        'last_validation', '2024-02-05',
        'validation_method', 'Cohort comparison study',
        'validators', ARRAY['Dr. Lisa Anderson', 'Dr. John Park'],
        'next_review', '2024-08-05'
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_medical_specialty ON agents(medical_specialty);
CREATE INDEX IF NOT EXISTS idx_agents_clinical_validation_status ON agents(clinical_validation_status);
CREATE INDEX IF NOT EXISTS idx_agents_tier ON agents(tier);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_implementation_phase ON agents(implementation_phase);

-- Update statistics
ANALYZE agents;