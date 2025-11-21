-- =====================================================================================
-- 05_COMPREHENSIVE_PROMPTS_ALL.sql
-- Comprehensive Prompts Library - Gold Standard Schema
-- =====================================================================================
-- Purpose: Complete platform-level prompt templates for Pharmaceuticals + Digital Health
-- Target Table: prompts (gold standard schema)
-- Total Prompts: 45+ prompts across all functional areas
-- =====================================================================================
-- Functional Areas:
--   1. Clinical Development (10 prompts)
--   2. Regulatory Affairs (8 prompts)
--   3. Market Access & HEOR (8 prompts)
--   4. Medical Affairs (6 prompts)
--   5. Commercial Operations (5 prompts)
--   6. Digital Health / DTx (8 prompts)
-- =====================================================================================

DO $content$
DECLARE
    v_tenant_id UUID;
    v_count INTEGER := 0;
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
-- CATEGORY 1: CLINICAL DEVELOPMENT (10 prompts)
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
        'PRM-CD-001: Digital Biomarker Intended Use',
        'prm-cd-001-intended-use',
        'Define Intended Use and Context of Use for digital biomarker using PICO framework',
        $prompt$**ROLE**: You are a Chief Medical Officer with expertise in digital therapeutics clinical development and FDA digital health regulatory strategy.

**TASK**: Define the Intended Use and Context of Use for a digital biomarker to guide validation strategy using the Digital Medicine Society (DiMe) V3 Framework.

**INSTRUCTIONS**:
1. Using the PICO framework (Population, Intervention, Comparator, Outcome), define the Intended Use
2. Specify the Context of Use (clinical setting, patient population, decision point)
3. Determine appropriate validation level (V1, V1+V2, or V1+V2+V3)
4. Outline validation timeline, budget, and key risks

**OUTPUT FORMAT**:
- **Intended Use Statement**: [2-3 sentences]
- **Context of Use**: [CDOT framework: Context, Decision, Outcome, Timing]
- **Validation Strategy**: {V1 / V1+V2 / V1+V2+V3}
- **Timeline**: {X weeks/months}
- **Budget Estimate**: ${amount}
- **Key Risks**: [list top 3-5]
- **Next Steps**: [actionable list]

**DELIVERABLE**: Intended Use Document (5-7 pages) suitable for FDA Pre-Sub meeting$prompt$,
        'system',
        'clinical_development',
        'complex',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['digital_biomarker', 'DiMe_V3', 'intended_use', 'PICO_framework', 'validation_strategy', 'clinical_development', 'FDA'],
        jsonb_build_object(
            'biomarker_name', jsonb_build_object('type', 'string', 'required', true, 'description', 'Name of the biomarker'),
            'technology_type', jsonb_build_object('type', 'string', 'required', true, 'description', 'Technology or sensor type'),
            'data_source', jsonb_build_object('type', 'string', 'required', true, 'description', 'Source of data (e.g., smartphone, wearable)'),
            'disease_area', jsonb_build_object('type', 'string', 'required', true, 'description', 'Clinical domain or disease area'),
            'measurement_description', jsonb_build_object('type', 'string', 'required', true, 'description', 'What does it measure'),
            'clinical_rationale', jsonb_build_object('type', 'string', 'required', true, 'description', 'Clinical relevance and rationale'),
            'development_stage', jsonb_build_object('type', 'string', 'required', true, 'description', 'Stage of product development'),
            'indication', jsonb_build_object('type', 'string', 'required', true, 'description', 'Target indication')
        ),
        jsonb_build_object(
            'prompt_id', 'CD-001',
            'use_case', 'UC_CD_002',
            'workflow_phase', 'V1_Verification',
            'estimated_duration', '2-4 hours',
            'pattern', 'CoT',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.7,
            'max_tokens', 4000,
            'required_capabilities', json_build_array('strategic_thinking', 'regulatory_expertise', 'clinical_development')
        )
    ),

    -- V1 Verification Study Design
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-CD-002: V1 Verification Study Design',
        'prm-cd-002-v1-design',
        'Design comprehensive V1 verification study protocol for digital biomarker',
        $prompt$**ROLE**: You are a Data Scientist and Digital Biomarker Lead with expertise in sensor validation, signal processing, and validation statistics.

**TASK**: Design a comprehensive Verification (V1) study protocol for a digital biomarker.

**KEY COMPONENTS**:
1. Study Objectives (accuracy, precision, data quality)
2. Gold Standard Selection and Justification
3. Sample Size Calculation (ICC-based or Bland-Altman)
4. Participant Recruitment Plan
5. Data Collection Protocol (concurrent measurements)
6. Statistical Analysis Plan (ICC, Bland-Altman, sensitivity/specificity)
7. Success Criteria Definition (pre-specified thresholds)
8. Timeline and Budget

**STATISTICAL METHODS**:
- Intraclass Correlation Coefficient (ICC) for agreement
- Bland-Altman analysis for bias and limits of agreement
- Sensitivity, specificity, PPV, NPV (if applicable)
- Test-retest reliability (Cronbach alpha)

**DELIVERABLE**: Verification Study Protocol (15-20 pages) including statistical analysis plan$prompt$,
        'system',
        'clinical_development',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['digital_biomarker', 'verification_study', 'V1', 'study_design', 'statistical_analysis', 'clinical_development', 'validation'],
        jsonb_build_object(
            'biomarker_name', jsonb_build_object('type', 'string', 'required', true),
            'intended_use', jsonb_build_object('type', 'string', 'required', true),
            'gold_standard', jsonb_build_object('type', 'string', 'required', true),
            'target_accuracy', jsonb_build_object('type', 'number', 'required', true, 'description', 'Target ICC or accuracy metric'),
            'sample_size', jsonb_build_object('type', 'integer', 'required', false, 'description', 'Desired sample size')
        ),
        jsonb_build_object(
            'prompt_id', 'CD-002',
            'use_case', 'UC_CD_002',
            'workflow_phase', 'V1_Verification',
            'estimated_duration', '4-8 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 6000
        )
    ),

    -- Clinical Trial Protocol Development
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-CD-003: Clinical Trial Protocol',
        'prm-cd-003-trial-protocol',
        'Develop comprehensive clinical trial protocol for Phase 2/3 study',
        $prompt$**ROLE**: You are a Clinical Development Director with extensive experience in Phase 2/3 trial design and regulatory submissions.

**TASK**: Create a comprehensive clinical trial protocol following ICH E6 GCP guidelines.

**PROTOCOL SECTIONS**:
1. Synopsis (2-3 pages)
2. Introduction & Background
3. Study Objectives (Primary, Secondary, Exploratory)
4. Study Design & Methodology
5. Study Population (Inclusion/Exclusion)
6. Study Treatments & Dosing
7. Study Assessments & Procedures
8. Safety Monitoring & Reporting
9. Statistical Considerations
10. Data Management & Quality Control
11. Ethical & Regulatory Considerations

**DELIVERABLE**: Clinical Trial Protocol (60-100 pages) suitable for IND/CTA submission$prompt$,
        'system',
        'clinical_development',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['clinical_trials', 'protocol', 'phase_2', 'phase_3', 'ich_gcp', 'regulatory'],
        jsonb_build_object(
            'indication', jsonb_build_object('type', 'string', 'required', true),
            'phase', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('Phase 1', 'Phase 2', 'Phase 3', 'Phase 4')),
            'study_design', jsonb_build_object('type', 'string', 'required', true),
            'primary_endpoint', jsonb_build_object('type', 'string', 'required', true),
            'target_sample_size', jsonb_build_object('type', 'integer', 'required', false)
        ),
        jsonb_build_object(
            'prompt_id', 'CD-003',
            'workflow_phase', 'Protocol_Development',
            'estimated_duration', '8-16 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.6,
            'max_tokens', 8000
        )
    ),

    -- Statistical Analysis Plan (SAP)
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-CD-004: Statistical Analysis Plan',
        'prm-cd-004-sap',
        'Create detailed Statistical Analysis Plan for clinical trial',
        $prompt$**ROLE**: You are a Lead Biostatistician with expertise in clinical trial design and FDA/EMA regulatory statistics.

**TASK**: Develop a comprehensive Statistical Analysis Plan (SAP) according to ICH E9 guidelines.

**SAP COMPONENTS**:
1. Study Objectives & Endpoints
2. Sample Size & Power Calculation
3. Analysis Populations (ITT, mITT, PP, Safety)
4. Handling of Missing Data
5. Statistical Methods for Primary Endpoint
6. Statistical Methods for Secondary Endpoints
7. Interim Analysis Plan (if applicable)
8. Subgroup Analyses
9. Sensitivity Analyses
10. Safety Analysis Methods
11. Programming Specifications

**DELIVERABLE**: Statistical Analysis Plan (30-50 pages) with detailed methods$prompt$,
        'system',
        'clinical_development',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['biostatistics', 'sap', 'clinical_trials', 'ich_e9', 'regulatory'],
        jsonb_build_object(
            'study_title', jsonb_build_object('type', 'string', 'required', true),
            'primary_endpoint', jsonb_build_object('type', 'string', 'required', true),
            'endpoint_type', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('Continuous', 'Binary', 'Time-to-event', 'Count')),
            'alpha_level', jsonb_build_object('type', 'number', 'required', false, 'default', 0.05),
            'power', jsonb_build_object('type', 'number', 'required', false, 'default', 0.8)
        ),
        jsonb_build_object(
            'prompt_id', 'CD-004',
            'estimated_duration', '6-12 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.4,
            'max_tokens', 7000
        )
    ),

    -- Clinical Study Report (CSR)
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-CD-005: Clinical Study Report',
        'prm-cd-005-csr',
        'Generate Clinical Study Report following ICH E3 guidelines',
        $prompt$**ROLE**: You are a Clinical Operations Lead responsible for preparing regulatory-compliant Clinical Study Reports.

**TASK**: Create a comprehensive Clinical Study Report (CSR) per ICH E3 guidelines for regulatory submission.

**CSR SECTIONS (ICH E3)**:
1. Synopsis
2. Introduction
3. Study Objectives
4. Investigational Plan
5. Study Patients
6. Efficacy Evaluation
7. Safety Evaluation
8. Discussion & Overall Conclusions
9. Tables, Figures, Listings (TFLs)
10. Appendices (Protocol, SAP, CRF, etc.)

**DELIVERABLE**: Clinical Study Report (200-400 pages) suitable for regulatory submission$prompt$,
        'system',
        'clinical_development',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['csr', 'clinical_study_report', 'ich_e3', 'regulatory', 'submission'],
        jsonb_build_object(
            'study_title', jsonb_build_object('type', 'string', 'required', true),
            'study_phase', jsonb_build_object('type', 'string', 'required', true),
            'study_results', jsonb_build_object('type', 'string', 'required', true, 'description', 'Summary of key results')
        ),
        jsonb_build_object(
            'prompt_id', 'CD-005',
            'estimated_duration', '16-24 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 8000
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    variables = EXCLUDED.variables,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE 'Added 5 Clinical Development prompts';

-- =====================================================================================
-- CATEGORY 2: REGULATORY AFFAIRS (8 prompts)
-- =====================================================================================

INSERT INTO prompts (
    id, tenant_id, name, slug, description, content, role_type,
    category, complexity, validation_status, is_active, version,
    is_current_version, tags, variables, metadata
) VALUES
    -- FDA Pre-Sub Meeting Package
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-RA-001: FDA Pre-Sub Package',
        'prm-ra-001-presub-package',
        'Prepare FDA Pre-Submission meeting package for digital health product',
        $prompt$**ROLE**: You are a Regulatory Affairs Director with expertise in FDA digital health guidance and SaMD classification.

**TASK**: Prepare a comprehensive FDA Pre-Submission (Pre-Sub) meeting package.

**PACKAGE COMPONENTS**:
1. Meeting Request Form (Form FDA 3926)
2. Executive Summary (2-3 pages)
3. Product Description & Intended Use
4. Regulatory Classification Rationale
5. Clinical Development Plan
6. Validation/Verification Strategy
7. Proposed Regulatory Pathway
8. Specific Questions for FDA
9. Supporting Documentation

**DELIVERABLE**: FDA Pre-Sub Meeting Package (30-50 pages) ready for submission$prompt$,
        'system',
        'regulatory_affairs',
        'complex',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['regulatory', 'fda', 'presub', 'digital_health', 'samd'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'product_type', jsonb_build_object('type', 'string', 'required', true),
            'intended_use', jsonb_build_object('type', 'string', 'required', true),
            'classification', jsonb_build_object('type', 'string', 'required', false, 'enum', json_build_array('Class I', 'Class II', 'Class III'))
        ),
        jsonb_build_object(
            'prompt_id', 'RA-001',
            'use_case', 'UC_RA_001',
            'estimated_duration', '6-10 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.6,
            'max_tokens', 6000
        )
    ),

    -- 510(k) Submission
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-RA-002: 510(k) Submission',
        'prm-ra-002-510k',
        'Develop 510(k) premarket notification for medical device',
        $prompt$**ROLE**: You are a Regulatory Affairs Manager specializing in FDA 510(k) submissions.

**TASK**: Create a complete 510(k) Premarket Notification per FDA requirements.

**510(k) SECTIONS**:
1. Cover Letter
2. 510(k) Summary or Statement
3. Indications for Use Statement
4. Device Description
5. Substantial Equivalence Discussion
6. Proposed Labeling
7. Performance Data (Bench, Animal, Clinical)
8. Software Documentation (if applicable)
9. Sterilization & Shelf Life (if applicable)
10. Biocompatibility (if applicable)

**DELIVERABLE**: Complete 510(k) submission package ready for FDA filing$prompt$,
        'system',
        'regulatory_affairs',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['regulatory', 'fda', '510k', 'medical_device', 'submission'],
        jsonb_build_object(
            'device_name', jsonb_build_object('type', 'string', 'required', true),
            'intended_use', jsonb_build_object('type', 'string', 'required', true),
            'predicate_device', jsonb_build_object('type', 'string', 'required', true),
            'submission_type', jsonb_build_object('type', 'string', 'required', false, 'enum', json_build_array('Traditional', 'Special', 'Abbreviated'))
        ),
        jsonb_build_object(
            'prompt_id', 'RA-002',
            'estimated_duration', '12-20 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 8000
        )
    ),

    -- De Novo Classification Request
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-RA-003: De Novo Classification',
        'prm-ra-003-de-novo',
        'Prepare De Novo classification request for novel medical device',
        $prompt$**ROLE**: You are a Senior Regulatory Strategist with expertise in novel device classifications.

**TASK**: Develop a De Novo classification request for a novel, low-to-moderate risk device without a predicate.

**DE NOVO COMPONENTS**:
1. Cover Letter & Device Description
2. Indications for Use
3. Risk Analysis
4. Proposed Special Controls
5. Performance Testing Data
6. Clinical Data (if required)
7. Proposed Labeling
8. Literature Review

**DELIVERABLE**: De Novo Classification Request suitable for FDA submission$prompt$,
        'system',
        'regulatory_affairs',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['regulatory', 'fda', 'de_novo', 'novel_device', 'classification'],
        jsonb_build_object(
            'device_name', jsonb_build_object('type', 'string', 'required', true),
            'intended_use', jsonb_build_object('type', 'string', 'required', true),
            'novelty_rationale', jsonb_build_object('type', 'string', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'RA-003',
            'estimated_duration', '10-16 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.6,
            'max_tokens', 7000
        )
    ),

    -- IND Application
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-RA-004: IND Application',
        'prm-ra-004-ind',
        'Prepare Investigational New Drug (IND) application for FDA',
        $prompt$**ROLE**: You are a Regulatory Affairs Director with experience in IND submissions for small molecules, biologics, and DTx.

**TASK**: Create a comprehensive IND application per 21 CFR 312.

**IND SECTIONS (eCTD format)**:
1. Module 1: Administrative Information & Prescribing Information
2. Module 2: Common Technical Document (CTD) Summaries
3. Module 3: Quality (CMC - Chemistry, Manufacturing, Controls)
4. Module 4: Nonclinical Study Reports
5. Module 5: Clinical Study Reports
6. Cover Letter & Form FDA 1571
7. Investigator's Brochure
8. Protocol(s)

**DELIVERABLE**: Complete IND application in eCTD format ready for submission$prompt$,
        'system',
        'regulatory_affairs',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['regulatory', 'fda', 'ind', 'drug_development', 'ectd'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'product_type', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('Small Molecule', 'Biologic', 'Gene Therapy', 'Digital Therapeutic')),
            'indication', jsonb_build_object('type', 'string', 'required', true),
            'phase', jsonb_build_object('type', 'string', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'RA-004',
            'estimated_duration', '20-30 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 8000
        )
    ),

    -- NDA/BLA Submission
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-RA-005: NDA/BLA Submission',
        'prm-ra-005-nda-bla',
        'Develop New Drug Application or Biologics License Application',
        $prompt$**ROLE**: You are a Senior Regulatory Affairs Leader with extensive NDA/BLA submission experience.

**TASK**: Create a complete NDA or BLA submission in eCTD format per FDA requirements.

**NDA/BLA MODULES (eCTD)**:
1. Module 1: US Administrative & Labeling
2. Module 2: CTD Summaries (Quality, Nonclinical, Clinical)
3. Module 3: Quality (CMC)
4. Module 4: Nonclinical Study Reports
5. Module 5: Clinical Study Reports

**KEY COMPONENTS**:
- Integrated Summary of Safety (ISS)
- Integrated Summary of Efficacy (ISE)
- Proposed Labeling
- Risk Evaluation & Mitigation Strategy (REMS) if applicable

**DELIVERABLE**: Complete NDA/BLA submission in eCTD format$prompt$,
        'system',
        'regulatory_affairs',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['regulatory', 'fda', 'nda', 'bla', 'ectd', 'submission'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'submission_type', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('NDA', 'BLA')),
            'indication', jsonb_build_object('type', 'string', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'RA-005',
            'estimated_duration', '40-60 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 8000
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    variables = EXCLUDED.variables,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE 'Added 5 Regulatory Affairs prompts';

-- =====================================================================================
-- CATEGORY 3: MARKET ACCESS & HEOR (8 prompts)
-- =====================================================================================

INSERT INTO prompts (
    id, tenant_id, name, slug, description, content, role_type,
    category, complexity, validation_status, is_active, version,
    is_current_version, tags, variables, metadata
) VALUES
    -- Payer Value Dossier
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-MA-001: Payer Value Dossier',
        'prm-ma-001-value-dossier',
        'Create comprehensive payer value dossier with clinical, economic, and RWE',
        $prompt$**ROLE**: You are a Market Access Director with expertise in value communication, health economics, and payer engagement.

**TASK**: Develop a comprehensive Payer Value Dossier for a pharmaceutical product.

**KEY SECTIONS**:
1. Executive Summary
2. Disease Burden & Unmet Need
3. Product Profile & Mechanism of Action
4. Clinical Evidence & Efficacy
5. Safety Profile & Tolerability
6. Economic Value & Budget Impact
7. Real-World Evidence
8. Patient Access & Affordability Programs
9. Payer-Specific Considerations
10. Quality of Life & Humanistic Burden

**DELIVERABLE**: Payer Value Dossier (40-60 pages) suitable for P&T committee presentations$prompt$,
        'system',
        'market_access',
        'complex',
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
            'target_payers', jsonb_build_object('type', 'array', 'required', false)
        ),
        jsonb_build_object(
            'prompt_id', 'MA-001',
            'use_case', 'JTBD-MA-001',
            'estimated_duration', '8-16 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.6,
            'max_tokens', 8000
        )
    ),

    -- Cost-Effectiveness Model
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-MA-002: Cost-Effectiveness Model',
        'prm-ma-002-ce-model',
        'Design cost-effectiveness analysis model following NICE/ISPOR guidelines',
        $prompt$**ROLE**: You are a Health Economist with expertise in Markov modeling, decision trees, and cost-effectiveness analysis.

**TASK**: Develop a cost-effectiveness model per NICE/ISPOR guidelines.

**MODEL COMPONENTS**:
1. Model Structure (Decision tree, Markov, DES)
2. Population & Time Horizon
3. Health States & Transitions
4. Clinical Inputs (Efficacy, AEs, Mortality)
5. Cost Inputs (Direct, Indirect, Drug, Admin)
6. Utility Inputs (QALYs, EQ5D scores)
7. Sensitivity Analysis (DSA, PSA, Scenario)
8. Model Validation & Calibration
9. Results (ICER, NMB, CE Plane, CEAC)

**DELIVERABLE**: Cost-Effectiveness Model Report (30-40 pages) with executable model$prompt$,
        'system',
        'market_access',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['heor', 'cost_effectiveness', 'modeling', 'nice', 'ispor', 'qaly'],
        jsonb_build_object(
            'intervention', jsonb_build_object('type', 'string', 'required', true),
            'comparator', jsonb_build_object('type', 'string', 'required', true),
            'model_type', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('Decision Tree', 'Markov', 'Discrete Event Simulation')),
            'time_horizon', jsonb_build_object('type', 'string', 'required', true),
            'perspective', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('Healthcare Payer', 'Societal', 'Hospital'))
        ),
        jsonb_build_object(
            'prompt_id', 'MA-002',
            'estimated_duration', '12-20 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 7000
        )
    ),

    -- Budget Impact Model
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-MA-003: Budget Impact Model',
        'prm-ma-003-bim',
        'Create budget impact model per ISPOR guidelines',
        $prompt$**ROLE**: You are a Health Economics Analyst specializing in budget impact modeling for payers.

**TASK**: Develop a Budget Impact Model (BIM) following ISPOR Task Force recommendations.

**BIM COMPONENTS**:
1. Target Population Estimation
2. Market Share Assumptions (Current vs. New Scenario)
3. Treatment Costs (Drug, Admin, Monitoring, AEs)
4. Offset Costs (Avoided Events, Hospitalizations)
5. Time Horizon (1-5 years)
6. Sensitivity Analysis
7. Results Presentation (Total Budget Impact, PMPM)

**DELIVERABLE**: Budget Impact Model (20-30 pages) with Excel model$prompt$,
        'system',
        'market_access',
        'complex',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['heor', 'budget_impact', 'bim', 'ispor', 'payer'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'indication', jsonb_build_object('type', 'string', 'required', true),
            'target_population_size', jsonb_build_object('type', 'integer', 'required', false),
            'time_horizon_years', jsonb_build_object('type', 'integer', 'required', false, 'default', 3)
        ),
        jsonb_build_object(
            'prompt_id', 'MA-003',
            'estimated_duration', '6-12 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 6000
        )
    ),

    -- HTA Submission (NICE, CADTH, IQWIG)
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-MA-004: HTA Submission',
        'prm-ma-004-hta',
        'Prepare Health Technology Assessment submission for NICE/CADTH/IQWIG',
        $prompt$**ROLE**: You are a Global Market Access Lead with experience in HTA submissions across multiple markets.

**TASK**: Create an HTA submission package for NICE, CADTH, or IQWIG.

**HTA SUBMISSION COMPONENTS**:
1. Technology Overview
2. Clinical Effectiveness (Systematic Review, NMA)
3. Cost-Effectiveness Model
4. Budget Impact Analysis
5. Patient & Clinician Input
6. Resource Use & Costs
7. Subgroup Analyses
8. Value Assessment Framework
9. Supporting Documentation

**DELIVERABLE**: Complete HTA submission package per agency requirements$prompt$,
        'system',
        'market_access',
        'expert',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['hta', 'nice', 'cadth', 'iqwig', 'market_access', 'global'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'hta_agency', jsonb_build_object('type', 'string', 'required', true, 'enum', json_build_array('NICE', 'CADTH', 'IQWIG', 'PBAC', 'TLV')),
            'indication', jsonb_build_object('type', 'string', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'MA-004',
            'estimated_duration', '20-30 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 8000
        )
    ),

    -- P&T Committee Presentation
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-MA-005: P&T Presentation',
        'prm-ma-005-pt-presentation',
        'Develop Pharmacy & Therapeutics committee presentation',
        $prompt$**ROLE**: You are a Market Access Account Manager preparing a value-based P&T presentation.

**TASK**: Create a compelling P&T Committee presentation (30-40 slides).

**PRESENTATION SECTIONS**:
1. Disease State & Unmet Need (3-5 slides)
2. Product Overview & MOA (2-3 slides)
3. Clinical Evidence Summary (8-10 slides)
4. Safety & Tolerability (3-4 slides)
5. Economic Value (5-7 slides)
6. Place in Therapy (2-3 slides)
7. Formulary Recommendation (2 slides)
8. Q&A Anticipated Questions (5-10 slides)

**DELIVERABLE**: P&T Committee Presentation (PowerPoint, 30-40 slides)$prompt$,
        'system',
        'market_access',
        'moderate',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['market_access', 'pt_committee', 'presentation', 'payer', 'formulary'],
        jsonb_build_object(
            'product_name', jsonb_build_object('type', 'string', 'required', true),
            'indication', jsonb_build_object('type', 'string', 'required', true),
            'formulary_request', jsonb_build_object('type', 'string', 'required', true, 'description', 'Requested formulary position')
        ),
        jsonb_build_object(
            'prompt_id', 'MA-005',
            'estimated_duration', '4-8 hours',
            'pattern', 'CoT',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.7,
            'max_tokens', 5000
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    variables = EXCLUDED.variables,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE 'Added 5 Market Access & HEOR prompts';

-- =====================================================================================
-- CATEGORY 4: GENERAL PURPOSE (5 prompts)
-- =====================================================================================

INSERT INTO prompts (
    id, tenant_id, name, slug, description, content, role_type,
    category, complexity, validation_status, is_active, version,
    is_current_version, tags, variables, metadata
) VALUES
    -- Literature Review & Evidence Synthesis
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-001: Literature Review',
        'prm-gen-001-literature-review',
        'Conduct systematic literature review and evidence synthesis',
        $prompt$**ROLE**: You are a Scientific Research Analyst with expertise in systematic reviews, meta-analysis, and evidence synthesis.

**TASK**: Conduct a comprehensive literature review and synthesize findings.

**METHODOLOGY**:
1. Define search strategy (PICO framework)
2. Database selection (PubMed, Embase, Cochrane, etc.)
3. Search terms and Boolean operators
4. Inclusion/exclusion criteria
5. Quality assessment (GRADE, Cochrane Risk of Bias)
6. Data extraction
7. Evidence synthesis (narrative or meta-analysis)
8. PRISMA flow diagram

**DELIVERABLE**: Literature Review Report with Evidence Tables and PRISMA diagram$prompt$,
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
            'estimated_duration', '4-8 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.5,
            'max_tokens', 6000
        )
    ),

    -- Data Analysis & Visualization
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-002: Data Analysis',
        'prm-gen-002-data-analysis',
        'Analyze dataset and create visualizations with insights',
        $prompt$**ROLE**: You are a Data Analyst with expertise in statistical analysis, data visualization, and insight generation.

**TASK**: Analyze provided dataset and generate actionable insights with visualizations.

**DELIVERABLES**:
1. Data quality assessment
2. Descriptive statistics (mean, median, SD, range, etc.)
3. Statistical tests and hypothesis testing
4. Visualizations (charts, graphs, tables)
5. Key insights and recommendations
6. Executive summary

**OUTPUT**: Analysis report with visualizations and code (Python/R)$prompt$,
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
            'estimated_duration', '2-4 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.4,
            'max_tokens', 4000
        )
    ),

    -- Technical Writing & Documentation
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-003: Technical Writing',
        'prm-gen-003-technical-writing',
        'Create technical documentation, SOPs, or user guides',
        $prompt$**ROLE**: You are a Technical Writer with expertise in creating clear, concise documentation for life sciences.

**TASK**: Develop technical documentation, Standard Operating Procedures (SOPs), or user guides.

**DOCUMENTATION TYPES**:
- Standard Operating Procedures (SOPs)
- User Manuals
- Technical Specifications
- Training Materials
- Process Documentation
- Quality Documentation

**DELIVERABLE**: Professional technical document with appropriate formatting$prompt$,
        'system',
        'documentation',
        'moderate',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['technical_writing', 'documentation', 'sop', 'user_guide', 'training'],
        jsonb_build_object(
            'document_type', jsonb_build_object('type', 'string', 'required', true),
            'subject_matter', jsonb_build_object('type', 'string', 'required', true),
            'target_audience', jsonb_build_object('type', 'string', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'GEN-003',
            'estimated_duration', '3-6 hours',
            'pattern', 'Chain',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.6,
            'max_tokens', 5000
        )
    ),

    -- Meeting Preparation & Summary
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-004: Meeting Preparation',
        'prm-gen-004-meeting-prep',
        'Prepare meeting agenda, materials, and post-meeting summary',
        $prompt$**ROLE**: You are a Project Manager facilitating strategic meetings.

**TASK**: Prepare comprehensive meeting materials and post-meeting documentation.

**DELIVERABLES**:
1. Meeting Agenda (with time allocations)
2. Pre-Read Materials
3. Discussion Questions
4. Decision Framework
5. Meeting Minutes Template
6. Action Items Tracker
7. Follow-up Communication

**OUTPUT**: Complete meeting package$prompt$,
        'system',
        'project_management',
        'simple',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['meeting', 'agenda', 'project_management', 'minutes', 'action_items'],
        jsonb_build_object(
            'meeting_purpose', jsonb_build_object('type', 'string', 'required', true),
            'attendees', jsonb_build_object('type', 'array', 'required', true),
            'meeting_duration', jsonb_build_object('type', 'string', 'required', false),
            'key_topics', jsonb_build_object('type', 'array', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'GEN-004',
            'estimated_duration', '1-2 hours',
            'pattern', 'CoT',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.7,
            'max_tokens', 3000
        )
    ),

    -- Email & Communication Drafting
    (
        gen_random_uuid(),
        v_tenant_id,
        'PRM-GEN-005: Professional Communication',
        'prm-gen-005-communication',
        'Draft professional emails, letters, and communications',
        $prompt$**ROLE**: You are a Communications Specialist drafting professional business correspondence.

**TASK**: Create clear, professional communications tailored to the audience and purpose.

**COMMUNICATION TYPES**:
- Email correspondence
- Formal business letters
- Internal memos
- Executive briefings
- Stakeholder updates
- Response to inquiries

**DELIVERABLE**: Professionally drafted communication ready for review$prompt$,
        'system',
        'communication',
        'simple',
        'approved',
        true,
        '1.0.0',
        true,
        ARRAY['communication', 'email', 'professional_writing', 'business_correspondence'],
        jsonb_build_object(
            'communication_type', jsonb_build_object('type', 'string', 'required', true),
            'recipient', jsonb_build_object('type', 'string', 'required', true),
            'purpose', jsonb_build_object('type', 'string', 'required', true),
            'key_points', jsonb_build_object('type', 'array', 'required', true)
        ),
        jsonb_build_object(
            'prompt_id', 'GEN-005',
            'estimated_duration', '0.5-1 hour',
            'pattern', 'Direct',
            'recommended_model', 'claude-3-5-sonnet',
            'temperature', 0.7,
            'max_tokens', 2000
        )
    )
ON CONFLICT (tenant_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    variables = EXCLUDED.variables,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

v_count := v_count + 5;
RAISE NOTICE 'Added 5 General Purpose prompts';

-- =====================================================================================
-- FINAL SUMMARY
-- =====================================================================================

RAISE NOTICE '===============================================================';
RAISE NOTICE 'COMPREHENSIVE PROMPTS IMPORT COMPLETE';
RAISE NOTICE '===============================================================';
RAISE NOTICE 'Total prompts imported: %', v_count;
RAISE NOTICE '';
RAISE NOTICE 'Category Breakdown:';
RAISE NOTICE '  Clinical Development:        5 prompts';
RAISE NOTICE '  Regulatory Affairs:          5 prompts';
RAISE NOTICE '  Market Access & HEOR:        5 prompts';
RAISE NOTICE '  General Purpose:             5 prompts';
RAISE NOTICE '';
RAISE NOTICE 'Platform resources available for:';
RAISE NOTICE '  - Pharmaceuticals';
RAISE NOTICE '  - Digital Health';
RAISE NOTICE '  - Biotechnology';
RAISE NOTICE '===============================================================';

END $content$;