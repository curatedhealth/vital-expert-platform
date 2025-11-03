-- =========================================================================
-- UC_CD_002: Digital Biomarker Validation Strategy - PROMPTS SEEDING
-- =========================================================================
-- This file seeds all prompts for UC_CD_002 with proper hierarchy:
-- - Prompt Suites (stored in metadata)
-- - Prompt Sub-Suites (stored in metadata)
-- - Individual Prompts linked to tasks
-- =========================================================================

-- Session setup
CREATE TEMP TABLE IF NOT EXISTS session_config (
    tenant_id UUID
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM session_config) THEN
        INSERT INTO session_config (tenant_id)
        SELECT id FROM tenants WHERE slug = 'dev' LIMIT 1;
    END IF;
END $$;

-- =========================================================================
-- PROMPT SEEDING FOR UC_CD_002
-- =========================================================================

-- Get the use case and workflows
WITH use_case_data AS (
    SELECT 
        uc.id as use_case_id,
        uc.unique_id as use_case_uid
    FROM dh_use_case uc
    CROSS JOIN session_config sc
    WHERE uc.tenant_id = sc.tenant_id
      AND uc.code = 'UC_CD_002'
),
workflow_data AS (
    SELECT 
        w.id as workflow_id,
        w.unique_id as workflow_uid,
        w.name as workflow_name,
        uc.use_case_id
    FROM dh_workflow w
    CROSS JOIN session_config sc
    CROSS JOIN use_case_data uc
    WHERE w.tenant_id = sc.tenant_id
      AND w.use_case_id = uc.use_case_id
),
task_data AS (
    SELECT 
        t.id as task_id,
        t.unique_id as task_uid,
        t.code as task_code,
        t.title as task_title,
        w.workflow_uid,
        w.workflow_name
    FROM dh_task t
    CROSS JOIN session_config sc
    JOIN workflow_data w ON t.workflow_id = w.workflow_id
    WHERE t.tenant_id = sc.tenant_id
)

-- =========================================================================
-- PHASE 1: FOUNDATION & PLANNING (V1 + V2 Planning)
-- =========================================================================

-- TASK 1.1: Define Intended Use & Context of Use
, prompt_1_1 AS (
    INSERT INTO dh_prompt (
        tenant_id,
        task_id,
        unique_id,
        name,
        pattern,
        category,
        tags,
        system_prompt,
        user_template,
        metadata,
        prompt_identifier,
        version_label,
        owner,
        model_config,
        guardrails,
        evals,
        rollout
    )
    SELECT
        sc.tenant_id,
        t.task_id,
        'PRM-CD-002-1-1' as unique_id,
        'Digital Biomarker Intended Use Definition' as name,
        'Structured Output' as pattern,
        'Clinical Development' as category,
        ARRAY['digital_biomarker', 'validation', 'FDA', 'intended_use', 'DiMe_V3'] as tags,
        E'You are P06_DTXCMO, a Chief Medical Officer with expertise in digital therapeutics clinical development and FDA digital health regulatory strategy.

Your core competencies include:
- Digital biomarker validation strategy (DiMe V3 Framework)
- FDA Pre-Submission strategy for digital endpoints
- Clinical endpoint selection and validation planning
- Risk assessment for novel digital measures
- Regulatory precedent analysis (510(k), De Novo, BLA/NDA)

You have led 15+ digital health regulatory submissions and have deep relationships with FDA Digital Health Center of Excellence.' as system_prompt,
        
        E'**TASK**: Define the Intended Use and Context of Use for a digital biomarker to guide validation strategy.

**INPUT**:

**Digital Biomarker Overview**:
- Biomarker Name: {{biomarker_name}}
- Technology/Sensor: {{technology_type}}
- Data Source: {{data_source}}
- Clinical Domain: {{disease_area}}

**Preliminary Concept**:
- What does it measure?: {{brief_description}}
- Why is this clinically relevant?: {{clinical_rationale}}
- What existing measures does it relate to?: {{comparators}}

**Clinical Development Context**:
- Stage of Product Development: {{dev_stage}}
- Regulatory Strategy: {{reg_strategy}}
- Target Indication: {{indication}}
- Existing Clinical Endpoints: {{existing_endpoints}}

---

**INSTRUCTIONS**:

Using the PICO framework (Population, Intervention, Comparator, Outcome), define the Intended Use and Context of Use for this digital biomarker.

## PART A: INTENDED USE STATEMENT

Draft a clear, concise Intended Use statement following this template:

> "The {{biomarker_name}} is a digital measure derived from {{sensor_type}} that quantifies {{clinical_construct}} in {{patient_population}}. It is intended for use as {{endpoint_type}} in clinical trials evaluating {{intervention_type}} for {{indication}}."

## PART B: CONTEXT OF USE

**1. Patient Population (P)**
- Indication: [Define specific disease/condition]
- Disease Stage/Severity: [mild / moderate / severe]
- Age Range: [pediatric / adult / elderly]
- Inclusion Criteria (top 3)
- Exclusion Criteria (top 3)
- Justification: Why is this population appropriate?

**2. Clinical Construct Being Measured**
- What clinical concept does this biomarker measure?
- How is it currently measured (gold standard)?
- Why is a digital measure needed?
- Clinical Relevance:
  - How does this relate to disease burden?
  - How does this relate to treatment benefit?

**3. Endpoint Type & Regulatory Strategy**
Select appropriate endpoint classification:
- ☐ Exploratory Endpoint (minimal validation)
- ☐ Secondary Endpoint (V1+V2 validation)
- ☐ Primary Endpoint (Full V3 validation)

Regulatory Pathway:
- ☐ Clinical trial tool only
- ☐ Software as Medical Device (SaMD)
- ☐ FDA Biomarker Qualification
- ☐ Drug Development Tool (DDT) Qualification

**4. Comparator & Benchmarking Strategy**
- Gold Standard Comparator: [Define]
- Strategy: [equivalence / non-inferiority / superiority]
- Expected correlation with gold standard: [r > X or ICC > X]
- Expected MCID: [X units]

## PART C: VALIDATION STRATEGY DECISION

Based on endpoint type, determine validation level:
- Exploratory → V1 only (8-12 weeks, $150K-$300K)
- Secondary → V1 + V2 (16-24 weeks, $350K-$800K)
- Primary → V1 + V2 + V3 (12-24 months, $1.5M-$5M)

**Recommended Validation Level**: [V1 / V1+V2 / V1+V2+V3]
**Rationale**: [Explain why]

## PART D: RISK ASSESSMENT

**Regulatory Risks**:
1. Precedent Risk: [LOW / MEDIUM / HIGH]
   - Has FDA accepted similar digital biomarkers? [YES / NO]
   - Examples: [List or explain novelty]

2. Clinical Acceptance Risk: [LOW / MEDIUM / HIGH]
   - Will clinical community accept this measure?
   - Evidence needed: [KOL input / publications / etc.]

3. Commercial Risk: [LOW / MEDIUM / HIGH]
   - Will payers accept for reimbursement?
   - Evidence needed: [Health economics / MCID / etc.]

**Risk Mitigation Strategies**: [List 3-5 strategies]

## PART E: FDA PRE-SUBMISSION STRATEGY

Should you seek FDA Pre-Submission feedback?
- ☐ YES - Novel biomarker; primary endpoint; high risk
- ☐ NO - Strong precedent; exploratory use; low risk

If YES, Pre-Submission Topics:
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

Timing:
- Pre-Sub submission target: [Date]
- Meeting target: [Date - typically 75 days after]

---

## OUTPUT FORMAT

**Intended Use Statement**: [2-3 sentences]

**Context of Use Summary**: [1 paragraph]

**Validation Strategy**: [V1 / V1+V2 / V1+V2+V3]

**Timeline**: [X weeks/months]

**Budget**: $[amount]

**Key Risks**: [Top 3]

**Next Steps**: [Immediate actions]

**DELIVERABLE**: Intended Use Document (5-7 pages)' as user_template,
        
        jsonb_build_object(
            'suite', 'Digital Biomarker Validation',
            'sub_suite', 'Foundation & Planning',
            'step_number', '1.1',
            'estimated_time_hours', 3,
            'complexity', 'Intermediate',
            'inputs', jsonb_build_object(
                'biomarker_name', 'string',
                'technology_type', 'enum: wearable|smartphone|sensor|other',
                'data_source', 'string',
                'disease_area', 'string',
                'brief_description', 'text',
                'clinical_rationale', 'text',
                'comparators', 'text',
                'dev_stage', 'enum: preclinical|Phase_1|Phase_2|Phase_3',
                'reg_strategy', 'enum: IND|NDA|510k|De_Novo|other',
                'indication', 'string',
                'existing_endpoints', 'text'
            ),
            'outputs', jsonb_build_array(
                'Intended Use Statement (2-3 sentences)',
                'Context of Use Document (5-7 pages)',
                'Validation Strategy Recommendation',
                'Budget Estimate',
                'Risk Assessment',
                'FDA Pre-Submission Decision'
            ),
            'dependencies', jsonb_build_array(
                'Product description and features',
                'Preliminary data (if available)',
                'Regulatory strategy overview'
            ),
            'quality_criteria', jsonb_build_object(
                'clarity', 'Intended Use statement is clear and unambiguous',
                'completeness', 'All PICO elements defined',
                'alignment', 'Validation level matches endpoint type',
                'feasibility', 'Budget and timeline realistic'
            ),
            'regulatory_framework', 'FDA Digital Health, DiMe V3 Framework'
        ) as metadata,
        
        'CD_002_P1_1' as prompt_identifier,
        'v1.0' as version_label,
        jsonb_build_array('P06_DTXCMO') as owner,
        jsonb_build_object(
            'model', 'claude-3-5-sonnet-20241022',
            'temperature', 0.3,
            'max_tokens', 4000,
            'top_p', 0.95
        ) as model_config,
        jsonb_build_object(
            'output_validation', jsonb_build_object(
                'required_sections', jsonb_build_array(
                    'Intended Use Statement',
                    'Context of Use',
                    'Validation Strategy',
                    'Risk Assessment'
                ),
                'max_length_words', 3000
            )
        ) as guardrails,
        jsonb_build_object(
            'criteria', jsonb_build_array(
                jsonb_build_object('metric', 'completeness', 'threshold', 0.95),
                jsonb_build_object('metric', 'regulatory_alignment', 'threshold', 0.90),
                jsonb_build_object('metric', 'clarity', 'threshold', 0.85)
            )
        ) as evals,
        'stable' as rollout
    FROM session_config sc
    CROSS JOIN task_data t
    WHERE t.task_code = 'TSK-CD-002-01'
    ON CONFLICT (tenant_id, unique_id)
    DO UPDATE SET
        name = EXCLUDED.name,
        system_prompt = EXCLUDED.system_prompt,
        user_template = EXCLUDED.user_template,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id, unique_id, name
)

-- =========================================================================
-- TASK 1.2: Design Verification Study (V1)
-- =========================================================================

, prompt_1_2 AS (
    INSERT INTO dh_prompt (
        tenant_id,
        task_id,
        unique_id,
        name,
        pattern,
        category,
        tags,
        system_prompt,
        user_template,
        metadata,
        prompt_identifier,
        version_label,
        owner,
        model_config,
        guardrails,
        evals,
        rollout
    )
    SELECT
        sc.tenant_id,
        t.task_id,
        'PRM-CD-002-1-2' as unique_id,
        'Verification Study Protocol Design' as name,
        'Chain of Thought' as pattern,
        'Clinical Development' as category,
        ARRAY['verification', 'V1', 'study_design', 'ICC', 'Bland_Altman', 'validation_statistics'] as tags,
        E'You are P07_DATASC, a Data Scientist and Digital Biomarker Lead with expertise in sensor validation, signal processing, and validation statistics.

Your core competencies include:
- DiMe V3 Verification (V1) study design
- Gold standard selection and benchmarking
- ICC, Bland-Altman, and agreement statistics
- Sample size calculations for validation studies
- Data quality assessment frameworks
- Regulatory validation requirements (FDA, EMA)

You have validated 20+ digital biomarkers across cardiovascular, neurology, psychiatry, and metabolic disease areas.' as system_prompt,
        
        E'**TASK**: Design a comprehensive Verification (V1) study protocol for a digital biomarker.

**INPUT**:

**Digital Biomarker**:
- Name: {{biomarker_name}}
- Sensor/Technology: {{sensor_type}}
- Data Type: {{data_type}}
- Measurement: {{what_it_measures}}
- Algorithm: {{algorithm_description}}

**Intended Use**:
- Population: {{patient_population}}
- Context: {{context}}
- Endpoint Type: {{endpoint_type}}

**Gold Standard**:
- Reference Method: {{gold_standard}}
- Measurement Units: {{units}}
- Expected Correlation: {{expected_correlation}}

**Study Constraints**:
- Budget: ${{budget}}
- Timeline: {{timeline_weeks}} weeks
- Sample Size Flexibility: {{sample_flexibility}}

---

**INSTRUCTIONS**:

Design a Verification study protocol following the structure below.

## PART A: STUDY OBJECTIVES

**Primary Objective**:
Demonstrate that {{biomarker_name}} produces accurate measurements of {{clinical_construct}} compared to the gold-standard {{reference_method}}.

**Secondary Objectives**:
1. Assess precision (test-retest reliability)
2. Evaluate data quality (missingness, artifacts)
3. Determine robustness across subgroups and conditions

## PART B: STUDY DESIGN

**Study Type**: [prospective_observational / lab-based / field-based]
**Study Duration**: [X days per participant]
**Study Setting**: [clinic / laboratory / free-living]
**Justification**: Why is this design appropriate?

## PART C: SAMPLE SIZE CALCULATION

**Accuracy Objective**:
- Hypothesis: Digital biomarker agrees with gold standard (ICC >0.85)
- Statistical Test: Intraclass Correlation Coefficient (ICC)
- Assumptions:
  - Expected ICC: 0.90
  - Acceptable lower 95% CI bound: 0.85
  - Alpha: 0.05
  - Power: 80%

**Sample Size Formula**:
```
n = [(Z_alpha + Z_beta) / (0.5 * ln((1+ICC_lower)/(1-ICC_lower)))]^2
```

For ICC=0.90, lower bound=0.85:
- **Estimated n = [Calculate] participants**

**Precision Objective** (Test-Retest):
- Hypothesis: Test-retest ICC >0.80
- Measurements: 2-3 repeated measures
- Sample Size: [Y participants] (subset)

**Total Sample Size**: [X participants]

## PART D: PARTICIPANT RECRUITMENT

**Inclusion Criteria**:
1. [Criterion 1]
2. [Criterion 2]
3. Able to wear/use digital device
4. Willing to complete gold standard measurements

**Exclusion Criteria**:
1. [Criterion 1]
2. [Criterion 2]
3. Conditions interfering with sensor performance

**Recruitment Strategy**:
- Sites: [clinic / online / community]
- Methods: [flyers / social_media / physician_referral]
- Enrollment Rate: [X per week]
- Duration: [Y weeks]

**Diversity Requirements**:
- Age: [range]; stratify by [young/middle/older]
- Sex: Target 50% female
- Race/Ethnicity: Reflect U.S. demographics
- Disease Severity: [mild/moderate/severe] if applicable

## PART E: DATA COLLECTION PROTOCOL

**Visit Schedule**:
| Visit | Timing | Duration | Procedures |
|-------|--------|----------|------------|
| Screening | Day 0 | 30 min | Consent, eligibility |
| Baseline | Day 1 | 2-3 hrs | Demographics, device setup, accuracy testing |
| Test-Retest | Day 3 | 1-2 hrs | Repeat testing |
| Follow-up | Day 7 | 1-2 hrs | Robustness testing |

**Accuracy Testing Protocol**:

Setup:
1. Participant fitted with digital device
2. Participant connected to gold standard
3. Synchronize timestamps

**Measurement Conditions** (Define 3-5 conditions):
[Example for gait speed:
- Normal walking speed (10-meter walk)
- Fast walking speed
- Slow walking speed
- Indoor environment
- Outdoor environment]

**Your Measurement Protocol**: [Define conditions]

## PART F: DATA QUALITY ASSESSMENT

**Missing Data Tracking**:
- Target: >90% device wear time
- Target: >95% gold standard collection
- Track reasons: [device_off / sensor_failure / poor_contact]

**Artifact Detection**:
- Define criteria: [signal_dropout / motion_artifact / saturation]
- Rejection threshold: [X% of data points]
- Manual review: [yes / no]

**Quality Control**:
- Real-time checks during study
- Flagging of poor-quality data
- Re-measurement protocol

## PART G: STATISTICAL ANALYSIS PLAN

### Analysis 1: Accuracy Assessment

**Primary: Intraclass Correlation Coefficient (ICC)**
- Calculate ICC(2,1) - Two-way random effects, absolute agreement
- Success Criterion: ICC >0.85 (95% CI lower bound >0.80)
- Interpretation:
  - ICC >0.90: Excellent
  - ICC 0.75-0.90: Good
  - ICC 0.50-0.75: Moderate
  - ICC <0.50: Poor

**Secondary: Bland-Altman Plot**
- Calculate mean difference (bias)
- Calculate limits of agreement: Mean ± 1.96*SD
- Success Criteria:
  - Mean bias close to zero
  - Limits clinically acceptable
  - No systematic bias

**Tertiary: Pearson/Spearman Correlation**
- Success Criterion: r >0.85

### Analysis 2: Precision (Test-Retest)
- Calculate test-retest ICC
- Time interval: 2-7 days (stable patients)
- Success Criterion: ICC >0.80

### Analysis 3: Data Quality
- Missing data: Target <10%
- Artifact rate: Target <5%

### Analysis 4: Subgroup & Robustness
Assess ICC in subgroups:
1. Age: <50 vs ≥50
2. Sex: Male vs Female
3. Disease Severity: Mild/Moderate/Severe
4. Environmental: Indoor vs Outdoor

Success: ICC >0.80 in all subgroups

## PART H: SUCCESS CRITERIA SUMMARY

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Accuracy (ICC) | >0.90 | 0.85-0.90 | <0.85 |
| Bias | ±[X units] | ±[1.5X] | >±[2X] |
| Test-Retest | >0.85 | 0.80-0.85 | <0.80 |
| Missing Data | <5% | 5-10% | >10% |
| Artifact Rate | <3% | 3-5% | >5% |

**Overall Pass/Fail**:
- PASS: All metrics Target or Acceptable
- CONDITIONAL: Majority acceptable; minor refinements
- FAIL: Any metric Unacceptable

## PART I: TIMELINE & MILESTONES

| Milestone | Target Date | Duration |
|-----------|-------------|----------|
| Protocol finalization | Week 0 | - |
| IRB submission | Week 1 | 1 week |
| IRB approval | Week 3 | 2 weeks |
| Recruitment | Week 4-8 | 4 weeks |
| Data collection | Week 4-12 | 8 weeks |
| Analysis | Week 13-14 | 2 weeks |
| Report | Week 15 | 1 week |
| **TOTAL** | **Week 15** | **~4 months** |

## PART J: BUDGET ESTIMATE

| Category | Cost |
|----------|------|
| Participant compensation | $[amount] |
| Gold standard equipment | $[amount] |
| Digital devices | $[amount] |
| Site costs | $[amount] |
| Data management | $[amount] |
| Statistical analysis | $[amount] |
| IRB fees | $[amount] |
| **TOTAL** | **$[total]** |

## PART K: RISK MITIGATION

**Risk 1: Poor Agreement**
- Mitigation: Pilot test (n=5-10) before full study
- Contingency: Algorithm modification if ICC <0.85

**Risk 2: High Missing Data**
- Mitigation: Training; reminders; troubleshooting
- Contingency: Over-recruit by 20%

**Risk 3: Recruitment Delays**
- Mitigation: Multiple sites; flexible criteria
- Contingency: Extend timeline by 4 weeks

---

## OUTPUT FORMAT

**Verification Study Protocol** (15-20 pages) with:
1. Study Objectives
2. Study Design
3. Sample Size Calculation
4. Recruitment Plan
5. Data Collection Protocol
6. Statistical Analysis Plan
7. Success Criteria
8. Timeline & Budget

**Appendices**:
- Informed Consent Form
- Case Report Forms
- Data Management Plan

**DELIVERABLE**: Protocol ready for IRB submission

**NEXT STEP**: Execute Verification Study (STEP 3)' as user_template,
        
        jsonb_build_object(
            'suite', 'Digital Biomarker Validation',
            'sub_suite', 'Verification (V1)',
            'step_number', '1.2',
            'estimated_time_hours', 40,
            'complexity', 'Advanced',
            'inputs', jsonb_build_object(
                'biomarker_name', 'string',
                'sensor_type', 'string',
                'data_type', 'string',
                'what_it_measures', 'text',
                'algorithm_description', 'text',
                'patient_population', 'string',
                'context', 'string',
                'endpoint_type', 'enum: exploratory|secondary|primary',
                'gold_standard', 'string',
                'units', 'string',
                'expected_correlation', 'number',
                'budget', 'number',
                'timeline_weeks', 'number',
                'sample_flexibility', 'enum: fixed|flexible'
            ),
            'outputs', jsonb_build_array(
                'Verification Study Protocol (15-20 pages)',
                'Sample Size Calculation',
                'Statistical Analysis Plan',
                'IRB Submission Package',
                'Timeline & Budget'
            ),
            'dependencies', jsonb_build_array(
                'Intended Use Document (from Task 1.1)',
                'Gold standard identification',
                'IRB requirements'
            ),
            'quality_criteria', jsonb_build_object(
                'scientific_rigor', 'Sample size adequately powered',
                'feasibility', 'Timeline and budget realistic',
                'statistical_validity', 'Analysis plan follows DiMe V3 guidelines',
                'regulatory_alignment', 'Meets FDA expectations for V1'
            ),
            'regulatory_framework', 'DiMe V3 Verification Guidelines'
        ) as metadata,
        
        'CD_002_P1_2' as prompt_identifier,
        'v1.0' as version_label,
        jsonb_build_array('P07_DATASC') as owner,
        jsonb_build_object(
            'model', 'claude-3-5-sonnet-20241022',
            'temperature', 0.2,
            'max_tokens', 8000,
            'top_p', 0.9
        ) as model_config,
        jsonb_build_object(
            'output_validation', jsonb_build_object(
                'required_sections', jsonb_build_array(
                    'Study Objectives',
                    'Sample Size Calculation',
                    'Statistical Analysis Plan',
                    'Success Criteria'
                ),
                'min_length_words', 2000,
                'max_length_words', 8000
            )
        ) as guardrails,
        jsonb_build_object(
            'criteria', jsonb_build_array(
                jsonb_build_object('metric', 'completeness', 'threshold', 0.95),
                jsonb_build_object('metric', 'statistical_validity', 'threshold', 0.90),
                jsonb_build_object('metric', 'feasibility', 'threshold', 0.85)
            )
        ) as evals,
        'stable' as rollout
    FROM session_config sc
    CROSS JOIN task_data t
    WHERE t.task_code = 'TSK-CD-002-02'
    ON CONFLICT (tenant_id, unique_id)
    DO UPDATE SET
        name = EXCLUDED.name,
        system_prompt = EXCLUDED.system_prompt,
        user_template = EXCLUDED.user_template,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id, unique_id, name
)

-- =========================================================================
-- VERIFICATION QUERIES
-- =========================================================================

SELECT 
    '✅ Prompts seeded for UC_CD_002' as status,
    COUNT(*) as total_prompts
FROM dh_prompt p
CROSS JOIN session_config sc
JOIN dh_task t ON p.task_id = t.id
JOIN dh_workflow w ON t.workflow_id = w.id
JOIN dh_use_case uc ON w.use_case_id = uc.id
WHERE p.tenant_id = sc.tenant_id
  AND uc.code = 'UC_CD_002';

-- Show prompt details
SELECT 
    uc.code as use_case_code,
    w.name as workflow_name,
    t.code as task_code,
    t.title as task_title,
    p.unique_id as prompt_uid,
    p.name as prompt_name,
    p.pattern,
    p.category,
    p.metadata->>'suite' as suite,
    p.metadata->>'sub_suite' as sub_suite,
    p.metadata->>'step_number' as step,
    p.metadata->>'complexity' as complexity,
    p.metadata->>'estimated_time_hours' as hours,
    array_length(p.tags, 1) as tag_count,
    p.version_label
FROM dh_prompt p
CROSS JOIN session_config sc
JOIN dh_task t ON p.task_id = t.id
JOIN dh_workflow w ON t.workflow_id = w.id
JOIN dh_use_case uc ON w.use_case_id = uc.id
WHERE p.tenant_id = sc.tenant_id
  AND uc.code = 'UC_CD_002'
ORDER BY w.position, t.position, p.unique_id;

