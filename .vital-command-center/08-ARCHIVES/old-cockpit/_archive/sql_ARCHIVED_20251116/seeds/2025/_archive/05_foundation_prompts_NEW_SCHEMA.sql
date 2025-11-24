-- =====================================================================================
-- 05_foundation_prompts_NEW_SCHEMA.sql
-- Foundation Prompts - Transformed for Gold Standard Schema
-- =====================================================================================
-- Purpose: Seed reusable prompt templates for AI workflows
-- Target Table: prompts (gold standard schema)
-- =====================================================================================

-- Prompts are platform-level (use platform tenant or NULL)
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Use platform tenant for platform-level resources
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'platform' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := NULL;
        RAISE NOTICE 'Platform tenant not found, using NULL tenant_id (platform-wide prompts)';
    ELSE
        RAISE NOTICE 'Using platform tenant for prompts (ID: %)', v_tenant_id;
    END IF;

-- =====================================================================================
-- SECTION 1: CLINICAL DEVELOPMENT PROMPTS
-- =====================================================================================

INSERT INTO prompts (
    id, tenant_id, name, slug, description, content, role_type,
    category, complexity, validation_status, is_active, version,
    is_current_version, tags, variables, metadata
) VALUES
    -- Digital Biomarker Intended Use Definition
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-CD-002-1.1-INTENDED-USE',
        'prm-cd-002-1-1-intended-use',
        'Define the Intended Use and Context of Use for a digital biomarker using the PICO framework',
        E'**ROLE**: You are a Chief Medical Officer with expertise in digital therapeutics clinical development and FDA digital health regulatory strategy.

**TASK**: Define the Intended Use and Context of Use for a digital biomarker to guide validation strategy.

**INSTRUCTIONS**: Using the PICO framework (Population, Intervention, Comparator, Outcome), define the Intended Use and Context of Use for this digital biomarker.

**OUTPUT FORMAT**:
- **Intended Use Statement**: [2-3 sentences]
- **Context of Use Summary**: [1 paragraph]
- **Validation Strategy**: {V1 / V1+V2 / V1+V2+V3}
- **Timeline**: {X weeks/months}
- **Budget**: ${amount}
- **Key Risks**: {list top 3}
- **Next Steps**: [list immediate actions]

**DELIVERABLE**: Intended Use Document (5-7 pages)',
        'system',
        'digital_biomarker_validation',
        'moderate',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['digital_biomarker', 'DiMe_V3', 'intended_use', 'PICO_framework', 'validation_strategy', 'clinical_development'],
        jsonb_build_object(
            'biomarker_name', jsonb_build_object('type', 'string', 'required', true, 'description', 'Name of the biomarker'),
            'technology_type', jsonb_build_object('type', 'string', 'required', true, 'description', 'Technology or sensor type'),
            'data_source', jsonb_build_object('type', 'string', 'required', true, 'description', 'Source of data'),
            'disease_area', jsonb_build_object('type', 'string', 'required', true, 'description', 'Clinical domain or disease area'),
            'measurement_description', jsonb_build_object('type', 'string', 'required', true, 'description', 'What does it measure'),
            'clinical_rationale', jsonb_build_object('type', 'string', 'required', true, 'description', 'Clinical relevance'),
            'comparator_measures', jsonb_build_object('type', 'string', 'required', false, 'description', 'Existing measures for comparison'),
            'development_stage', jsonb_build_object('type', 'string', 'required', true, 'description', 'Stage of product development'),
            'regulatory_pathway', jsonb_build_object('type', 'string', 'required', true, 'description', 'Regulatory strategy'),
            'indication', jsonb_build_object('type', 'string', 'required', true, 'description', 'Target indication'),
            'current_endpoints', jsonb_build_object('type', 'string', 'required', false, 'description', 'Existing clinical endpoints')
        ),
        jsonb_build_object(
            'prompt_id', '1.1',
            'use_case', 'UC_CD_002',
            'workflow_phase', 'V1_Verification',
            'task_code', 'TSK-CD-002-P1-01',
            'estimated_duration', '2-4 hours',
            'pattern', 'CoT',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.7,
            'max_tokens', 4000,
            'required_capabilities', json_build_array('strategic_thinking', 'regulatory_expertise', 'clinical_development'),
            'related_personas', json_build_array('P06_DTXCMO', 'P04_REGDIR', 'P06_PMDIG')
        )
    ),

    -- Verification Study Design (V1)
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-CD-002-2.1-V1-DESIGN',
        'prm-cd-002-2-1-v1-design',
        'Design comprehensive Verification study protocol including gold standard selection, accuracy testing, precision testing, and statistical analysis plan',
        E'**ROLE**: You are a Data Scientist and Digital Biomarker Lead with expertise in sensor validation, signal processing, and validation statistics.

**TASK**: Design a comprehensive Verification (V1) study protocol for a digital biomarker.

**KEY COMPONENTS**:
1. Study Objectives (accuracy, precision, data quality)
2. Sample Size Calculation (ICC-based)
3. Participant Recruitment Plan
4. Data Collection Protocol
5. Statistical Analysis Plan (ICC, Bland-Altman)
6. Success Criteria Definition
7. Timeline and Budget

**DELIVERABLE**: Verification Study Protocol (15-20 pages)',
        'system',
        'digital_biomarker_validation',
        'complex',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['digital_biomarker', 'verification_study', 'V1', 'study_design', 'statistical_analysis', 'clinical_development'],
        jsonb_build_object(
            'biomarker_name', jsonb_build_object('type', 'string', 'required', true),
            'intended_use', jsonb_build_object('type', 'string', 'required', true),
            'gold_standard', jsonb_build_object('type', 'string', 'required', true),
            'target_accuracy', jsonb_build_object('type', 'number', 'required', true, 'description', 'Target ICC or accuracy metric'),
            'sample_size', jsonb_build_object('type', 'integer', 'required', false, 'description', 'Desired sample size'),
            'study_duration', jsonb_build_object('type', 'string', 'required', false, 'description', 'Study duration estimate')
        ),
        jsonb_build_object(
            'prompt_id', '2.1',
            'use_case', 'UC_CD_002',
            'workflow_phase', 'V1_Verification',
            'task_code', 'TSK-CD-002-P2-01',
            'estimated_duration', '4-8 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 6000,
            'required_capabilities', json_build_array('statistical_analysis', 'study_design', 'biomarker_validation'),
            'related_personas', json_build_array('P07_DATASC', 'P06_DTXCMO', 'P03_CLIN_DIR')
        )
    ),

    -- Market Access Value Dossier
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-MA-001-VALUE-DOSSIER',
        'prm-ma-001-value-dossier',
        'Create comprehensive payer value dossier with clinical, economic, and real-world evidence',
        E'**ROLE**: You are a Market Access Director with expertise in value communication, health economics, and payer engagement.

**TASK**: Develop a comprehensive Payer Value Dossier for a pharmaceutical product.

**KEY SECTIONS**:
1. Executive Summary
2. Disease Burden & Unmet Need
3. Product Profile & Clinical Evidence
4. Economic Value & Budget Impact
5. Real-World Evidence
6. Patient Access & Affordability
7. Payer-Specific Considerations

**DELIVERABLE**: Payer Value Dossier (40-60 pages)',
        'system',
        'market_access',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['market_access', 'value_dossier', 'payer_engagement', 'health_economics', 'HEOR'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'indication', jsonb_build_object('type', 'string', 'required', true),
            'clinical_data', jsonb_build_object('type', 'string', 'required', true),
            'comparators', jsonb_build_object('type', 'array', 'required', true),
            'target_payers', jsonb_build_object('type', 'array', 'required', false),
            'pricing_strategy', jsonb_build_object('type', 'string', 'required', false)
        ),
        jsonb_build_object(
            'prompt_id', 'MA-001',
            'use_case', 'JTBD-MA-001',
            'workflow_phase', 'Value_Communication',
            'estimated_duration', '8-16 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.6,
            'max_tokens', 8000,
            'required_capabilities', json_build_array('health_economics', 'market_access', 'evidence_synthesis'),
            'related_personas', json_build_array('P02_MA_DIR', 'P01_HEOR_DIR')
        )
    ),

    -- Literature Review & Evidence Synthesis
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-001-LITERATURE-REVIEW',
        'prm-gen-001-literature-review',
        'Conduct systematic literature review and evidence synthesis',
        E'**ROLE**: You are a Scientific Research Analyst with expertise in systematic reviews, meta-analysis, and evidence synthesis.

**TASK**: Conduct a comprehensive literature review and synthesize findings.

**METHODOLOGY**:
1. Define search strategy (PICO framework)
2. Database selection and search terms
3. Inclusion/exclusion criteria
4. Quality assessment
5. Data extraction
6. Evidence synthesis
7. GRADE or similar framework

**DELIVERABLE**: Literature Review Report with Evidence Tables',
        'system',
        'research',
        'moderate',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['literature_review', 'evidence_synthesis', 'systematic_review', 'meta_analysis', 'research'],
        jsonb_build_object(
            'research_question', jsonb_build_object('type', 'string', 'required', true),
            'population', jsonb_build_object('type', 'string', 'required', true),
            'intervention', jsonb_build_object('type', 'string', 'required', true),
            'comparator', jsonb_build_object('type', 'string', 'required', false),
            'outcomes', jsonb_build_object('type', 'array', 'required', true),
            'databases', jsonb_build_object('type', 'array', 'required', false)
        ),
        jsonb_build_object(
            'prompt_id', 'GEN-001',
            'use_case', 'GENERAL',
            'workflow_phase', 'Evidence_Synthesis',
            'estimated_duration', '4-8 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 6000,
            'required_capabilities', json_build_array('research', 'analysis', 'evidence_synthesis')
        )
    ),

    -- Data Analysis & Visualization
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-002-DATA-ANALYSIS',
        'prm-gen-002-data-analysis',
        'Analyze dataset and create visualizations with insights',
        E'**ROLE**: You are a Data Analyst with expertise in statistical analysis, data visualization, and insight generation.

**TASK**: Analyze provided dataset and generate actionable insights with visualizations.

**DELIVERABLES**:
1. Data quality assessment
2. Descriptive statistics
3. Statistical tests and hypothesis testing
4. Visualizations (charts, graphs, tables)
5. Key insights and recommendations
6. Executive summary

**OUTPUT**: Analysis report with visualizations and code (Python/R)',
        'system',
        'data_analysis',
        'moderate',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['data_analysis', 'statistics', 'visualization', 'insights', 'analytics'],
        jsonb_build_object(
            'dataset_description', jsonb_build_object('type', 'string', 'required', true),
            'analysis_objective', jsonb_build_object('type', 'string', 'required', true),
            'variables_of_interest', jsonb_build_object('type', 'array', 'required', true),
            'statistical_methods', jsonb_build_object('type', 'array', 'required', false)
        ),
        jsonb_build_object(
            'prompt_id', 'GEN-002',
            'use_case', 'GENERAL',
            'workflow_phase', 'Analysis',
            'estimated_duration', '2-4 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.4,
            'max_tokens', 4000,
            'required_capabilities', json_build_array('data_analysis', 'statistics', 'python', 'r')
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    role_type = EXCLUDED.role_type,
    category = EXCLUDED.category,
    complexity = EXCLUDED.complexity,
    variables = EXCLUDED.variables,
    metadata = EXCLUDED.metadata,
    validation_status = EXCLUDED.validation_status,
    version = EXCLUDED.version,
    is_current_version = EXCLUDED.is_current_version,
    tags = EXCLUDED.tags,
    updated_at = NOW();

    RAISE NOTICE '✅ Imported % foundation prompts', (SELECT COUNT(*) FROM prompts WHERE tenant_id = v_tenant_id OR (v_tenant_id IS NULL AND tenant_id IS NULL));

END $$;
