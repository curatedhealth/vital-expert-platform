# UC_CD_007: SAMPLE SIZE CALCULATION FOR DTx TRIALS
## Complete Use Case Documentation with Prompts & Examples

**Document Version**: 3.0 Complete  
**Date**: October 10, 2025  
**Status**: Production Ready - Expert Validation Required  
**Framework**: PROMPTS™ (Purpose-driven Robust Outcomes Master Prompting Toolkit & Suites)  
**Suite**: FORGE™ (Foundation Optimization Regulatory Guidelines Engineering)

---

## 📋 TABLE OF CONTENTS

1. [Use Case Overview](#1-use-case-overview)
2. [Workflow Architecture](#2-workflow-architecture)
3. [Persona Definitions](#3-persona-definitions)
4. [Workflow Diagram](#4-workflow-diagram)
5. [Complete Prompt Suite](#5-complete-prompt-suite)
6. [Worked Example: MindPath CBT Depression Trial](#6-worked-example-mindpath-cbt-depression-trial)
7. [How-To Implementation Guide](#7-how-to-implementation-guide)
8. [Success Metrics & Validation Criteria](#8-success-metrics--validation-criteria)
9. [Troubleshooting & Common Issues](#9-troubleshooting--common-issues)
10. [FAQs](#10-faqs)
11. [Appendices & Resources](#11-appendices--resources)

---

## 1. USE CASE OVERVIEW

### 1.1 Business Context

**Why This Matters**: Sample size calculation is the financial cornerstone of clinical trials. It directly determines:
- **Trial Cost**: Larger N = higher recruitment, site, monitoring, and analysis costs
- **Timeline**: Recruitment duration scales with sample size
- **Statistical Credibility**: Under-powered trials waste resources; over-powered trials waste money
- **Regulatory Success**: FDA scrutinizes sample size justification; poor justification = delays

**Typical Impact**:
- **Under-powered trial**: 60% power instead of 80% → 33% increase in probability of Type II error (missing true effect)
- **Over-powered trial**: N=300 instead of N=200 → $500K-1M wasted + 3-6 months extra recruitment
- **Well-calculated trial**: Optimal balance of cost, timeline, and statistical rigor

**When This Use Case Applies**:
- Planning any DTx pivotal clinical trial (FDA De Novo, CE Mark, reimbursement evidence)
- Updating sample size mid-trial (sample size re-estimation in adaptive designs)
- Defending sample size justification to FDA, IRB, or investors

---

### 1.2 Use Case Scope

**IN SCOPE**:
✅ Sample size for superiority trials (DTx > Control)  
✅ Sample size for non-inferiority trials (DTx ≥ Control)  
✅ Continuous, binary, and time-to-event endpoints  
✅ Parallel-group, 2-arm designs (most common for DTx)  
✅ Power calculations (80% or 90% power)  
✅ Attrition adjustment (realistic dropout rates)  
✅ Sensitivity analyses (robustness testing)  
✅ Recruitment feasibility assessment  

**OUT OF SCOPE**:
❌ Complex multi-arm designs (>2 arms) - requires specialized consultation  
❌ Cluster-randomized trials - different statistical methods  
❌ Bayesian adaptive sample size (covered in UC_CD_006 Adaptive Trials)  
❌ Equivalence trials (rare for DTx)  
❌ Sample size for observational studies (covered in UC_EG_001 Real-World Evidence)  

---

### 1.3 Success Criteria

**Quantitative Metrics**:
- Statistical power ≥ 80% (industry standard) or ≥ 90% (conservative)
- Type I error (alpha) = 0.05 (two-sided) maintained
- Effect size estimate justified by literature or pilot data
- Attrition rate estimate realistic (based on similar trials)
- Total sample size feasible within recruitment window (# sites × enrollment rate)

**Qualitative Metrics**:
- Assumptions documented and defensible
- Sensitivity analyses show robustness across plausible scenarios
- FDA/regulatory acceptability: HIGH
- Stakeholder buy-in (leadership, investors, CRO)

**Deliverables**:
1. Sample Size Justification Report (5-8 pages, protocol-ready)
2. Sensitivity Analysis Table
3. Recruitment Feasibility Assessment
4. Executive Summary (1 page for stakeholders)

---

### 1.4 Key Stakeholders

| Stakeholder | Role in Use Case | Key Concerns |
|-------------|------------------|--------------|
| **CMO** | Approves clinical strategy | Effect size realistic? Trial feasible? |
| **VP Clinical Development** | Owns trial execution | Can we recruit this N? Cost? |
| **Lead Biostatistician** | Performs calculations | Assumptions justified? Power adequate? |
| **Regulatory Affairs Director** | FDA acceptability | Will FDA accept justification? |
| **CEO/CFO** | Budget approval | Cost justified? Timeline? |
| **CRO** | Trial execution | Operationally feasible? |

---

### 1.5 Estimated Time & Resources

**Time Investment**:
- **Basic Sample Size (continuous endpoint, literature data)**: 1.5-2 hours
- **Intermediate (binary endpoint, sensitivity analyses)**: 2-2.5 hours
- **Advanced (novel endpoint, limited precedent, extensive validation)**: 3-4 hours

**Team Requirements**:
- **Lead**: Senior Biostatistician (P04_BIOSTAT)
- **Support**: CMO (P01_CMO), VP Clinical Development (P02_VPCLIN)
- **Review**: Regulatory Affairs Director (P05_REGDIR)

**Software/Tools**:
- Statistical software: R (pwr package), SAS (PROC POWER), PASS, G*Power, nQuery
- Literature databases: PubMed, ClinicalTrials.gov
- Spreadsheet for sensitivity analyses (Excel, Google Sheets)

---

## 2. WORKFLOW ARCHITECTURE

### 2.1 Workflow Overview

The sample size calculation workflow follows a **7-step process** from defining study parameters through final justification:

```
STEP 1: Define Study Parameters (20 min)
   ↓
STEP 2: Estimate Effect Size (30 min)
   ↓
STEP 3: Estimate Variability (25 min)
   ↓
STEP 4: Calculate Sample Size (20 min)
   ↓
STEP 5: Adjust for Attrition (15 min)
   ↓
STEP 6: Sensitivity Analyses (25 min)
   ↓
STEP 7: Finalize Justification (30 min)
```

**Total Time**: 2.5 hours (basic) to 3 hours (with extensive sensitivity)

---

### 2.2 Decision Points

**Critical Decision #1** (Step 1): Superiority vs. Non-Inferiority?
- **Superiority**: DTx must show better outcome than control → requires larger N
- **Non-inferiority**: DTx must show "not worse" than control → can use smaller N but requires non-inferiority margin justification

**Critical Decision #2** (Step 2): Which Effect Size Estimate to Use?
- Literature meta-analysis mean
- Pilot study results
- Expert clinical judgment (least preferred)
- Regulatory guidance (MCID)

**Critical Decision #3** (Step 5): Attrition Rate Assumption?
- Conservative (20-25% for moderate-length trials)
- Historical (use prior trial data in same indication)
- Optimistic (15%, requires strong retention plan)

---

### 2.3 Quality Gates

| Gate | Criteria | Approver |
|------|----------|----------|
| **Gate 1**: Study Design | Study design finalized (superiority/NI, parallel, 2-arm) | CMO + VP Clinical Dev |
| **Gate 2**: Effect Size | Effect size estimate justified by ≥2 sources | Lead Biostatistician |
| **Gate 3**: Variability | SD/proportion estimate documented with source | Lead Biostatistician |
| **Gate 4**: Sample Size | Power ≥ 80%, feasible N | Lead Biostatistician |
| **Gate 5**: Sensitivity | Sensitivity analyses show robustness | Lead Biostatistician |
| **Gate 6**: Feasibility | Recruitment feasible (sites × rate × time) | VP Clinical Development |
| **Gate 7**: Approval | Final justification approved by CMO + CFO | CMO + CFO |

---

## 3. PERSONA DEFINITIONS

### 3.1 Primary Personas

**P01_CMO: Chief Medical Officer**
- **Expertise**: Clinical strategy, regulatory precedent, clinical meaningfulness
- **Role**: Approves effect size assumptions, final sample size decision
- **Time Commitment**: 30-45 minutes (input on effect size + final approval)

**P04_BIOSTAT: Lead Biostatistician**
- **Expertise**: Statistical methods, power calculations, trial design
- **Role**: Performs all calculations, sensitivity analyses, justification
- **Time Commitment**: 2-3 hours (core execution)

**P02_VPCLIN: VP Clinical Development**
- **Expertise**: Trial operations, recruitment, site management
- **Role**: Validates feasibility, recruitment assessment
- **Time Commitment**: 30 minutes (feasibility assessment)

**P05_REGDIR: Regulatory Affairs Director**
- **Expertise**: FDA guidance, submission requirements
- **Role**: Reviews justification for regulatory acceptability
- **Time Commitment**: 20 minutes (review and feedback)

---

### 3.2 Supporting Personas

**P03_CLTM: Clinical Trial Manager**
- **Role**: Provides operational input (site capacity, enrollment rates)
- **Time**: 15 minutes

**P08_CFO: Chief Financial Officer**
- **Role**: Budget approval for trial
- **Time**: 10 minutes (executive summary review)

---

## 4. WORKFLOW DIAGRAM

```
                    [START: Sample Size Calculation Needed]
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 1: Define      │ ← P01_CMO, P04_BIOSTAT
                    │ Study Parameters    │   (20 min)
                    └─────────────────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 2: Estimate    │ ← P04_BIOSTAT, P01_CMO
                    │ Effect Size         │   (30 min)
                    └─────────────────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 3: Estimate    │ ← P04_BIOSTAT
                    │ Variability (SD)    │   (25 min)
                    └─────────────────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 4: Calculate   │ ← P04_BIOSTAT
                    │ Sample Size         │   (20 min)
                    └─────────────────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 5: Adjust for  │ ← P04_BIOSTAT, P02_VPCLIN
                    │ Attrition           │   (15 min)
                    └─────────────────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 6: Sensitivity │ ← P04_BIOSTAT
                    │ Analyses            │   (25 min)
                    └─────────────────────┘
                              |
                              v
                    ┌─────────────────────┐
                    │ STEP 7: Finalize    │ ← P04_BIOSTAT, P05_REGDIR
                    │ Justification       │   (30 min)
                    └─────────────────────┘
                              |
                              v
                    [END: Sample Size Justified]
```

---

## 5. COMPLETE PROMPT SUITE

### 5.1 Prompt Overview Table

| Prompt ID | Prompt Name | Persona | Time | Complexity | Step |
|-----------|-------------|---------|------|------------|------|
| **1.1** | Study Design Specification | P01_CMO, P04_BIOSTAT | 20 min | INTERMEDIATE | 1 |
| **2.1** | Effect Size: Literature Review | P04_BIOSTAT | 20 min | ADVANCED | 2 |
| **2.2** | Effect Size: Clinical Justification | P01_CMO | 10 min | INTERMEDIATE | 2 |
| **3.1** | Variability: Continuous Endpoints | P04_BIOSTAT | 15 min | ADVANCED | 3 |
| **3.2** | Variability: Binary/Count Endpoints | P04_BIOSTAT | 10 min | INTERMEDIATE | 3 |
| **4.1** | Sample Size Calculation | P04_BIOSTAT | 20 min | ADVANCED | 4 |
| **5.1** | Attrition Adjustment | P04_BIOSTAT, P02_VPCLIN | 15 min | INTERMEDIATE | 5 |
| **6.1** | Sensitivity Analysis: Effect Size | P04_BIOSTAT | 10 min | ADVANCED | 6 |
| **6.2** | Sensitivity Analysis: Variability | P04_BIOSTAT | 10 min | ADVANCED | 6 |
| **6.3** | Sensitivity Analysis: Attrition | P04_BIOSTAT | 5 min | INTERMEDIATE | 6 |
| **7.1** | Recruitment Feasibility | P02_VPCLIN | 15 min | INTERMEDIATE | 7 |
| **7.2** | Final Justification Document | P04_BIOSTAT | 25 min | ADVANCED | 7 |
| **7.3** | Executive Summary | P04_BIOSTAT | 10 min | BASIC | 7 |

---

### 5.2 Complete Prompts with Examples

---

#### **PROMPT 1.1: Study Design Specification**

**Persona**: P01_CMO, P04_BIOSTAT  
**Time**: 20 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a Senior Clinical Biostatistician with expertise in DTx trial design. You help teams clearly specify study design parameters that drive sample size calculations.

USER PROMPT:
I need to define the study design parameters for sample size calculation.

**DTx Trial Context:**
- Product: {dtx_product_name}
- Indication: {target_condition}
- Target Population: {population_description}
- Primary Endpoint: {endpoint_name_and_type}
- Study Duration: {treatment_duration}

**Please help me specify:**

1. **Study Design Type**
   - Design: Superiority, Non-Inferiority, or Equivalence?
   - Rationale: Why this design choice?
   - Regulatory alignment: Does FDA expect this design?

2. **Number of Arms & Allocation**
   - Arms: {2_arm_parallel_most_common}
   - Allocation ratio: 1:1 (equal) or other (e.g., 2:1)?
   - Rationale: Why this allocation?

3. **Control/Comparator**
   - Control type: {sham_waitlist_TAU_active}
   - Rationale: Why this comparator?

4. **Primary Endpoint Type**
   - Type: Continuous (e.g., change in PHQ-9 score) OR Binary (e.g., response rate) OR Time-to-Event?
   - Measurement: {description_of_measurement}

5. **Statistical Test**
   - Primary analysis: {t_test_ANCOVA_chi_square_logrank_other}
   - Justification: Why this test?
   - One-sided or two-sided: {typically_two_sided}

6. **Statistical Parameters**
   - Alpha (Type I error): {typically_0.05_two_sided}
   - Power (1 - Type II error): {typically_0.80_or_0.90}
   - Justification: Industry standard or specific rationale?

**Output Format:**
Provide 1-2 page document with:
- Study design summary table
- Design rationale (2-3 paragraphs)
- Statistical parameters with justification

**Example for Continuous Endpoint:**

**Study Design Summary:**
- **Design**: Superiority trial (DTx > Sham control)
- **Arms**: 2-arm parallel (1:1 allocation)
- **Comparator**: Sham app (attention control)
- **Primary Endpoint**: Change in PHQ-9 score from baseline to week 12 (continuous)
- **Analysis**: ANCOVA (baseline as covariate)
- **Alpha**: 0.05 (two-sided)
- **Power**: 80%

**Rationale**: Superiority design chosen because DTx is novel intervention; we aim to demonstrate added benefit over sham. Two-sided test (0.05 alpha) is FDA standard. 80% power balances rigor with sample size feasibility.
```

**INPUT**:
- DTx product details
- Primary endpoint from UC_CD_001
- Trial objectives

**OUTPUT**:
- Study design specification (1-2 pages)
- Parameters for sample size calculation

---

#### **PROMPT 2.1: Effect Size - Literature Review**

**Persona**: P04_BIOSTAT  
**Time**: 20 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician conducting systematic literature review to estimate effect sizes for sample size calculations. You critically evaluate study quality and generalizability.

USER PROMPT:
I need to estimate the expected effect size for my primary endpoint based on literature.

**Primary Endpoint:**
- Endpoint: {endpoint_name}
- Type: {continuous_binary_time_to_event}
- Measurement: {instrument_or_method}

**Search Strategy:**

1. **Literature Search**
   - Databases: PubMed, ClinicalTrials.gov, Cochrane
   - Search terms: {condition} AND {intervention_type} AND {endpoint}
   - Filters: RCTs, last 10 years, English language
   - Target: Find 5-10 high-quality studies

2. **Data Extraction**
   For each study, extract:
   - Study design (parallel, crossover, etc.)
   - Sample size (N per arm)
   - Population (severity, demographics)
   - Intervention details
   - Control/comparator type
   - **Effect size**:
     - **Continuous**: Mean difference between groups, SD
     - **Binary**: Response rates in each group (%, proportion)
     - **Time-to-event**: Hazard ratio, median times
   - Statistical significance (p-value)
   - Study quality (Jadad score, risk of bias)

3. **Effect Size Analysis**

**For Continuous Endpoints:**
- Calculate Cohen's d for each study: d = (Mean_treatment - Mean_control) / SD_pooled
- Meta-analysis (if ≥3 studies): Weighted mean effect size
- Range of effect sizes: [min, max]
- Selected effect size for sample size: {justify choice}

**For Binary Endpoints:**
- Calculate absolute risk difference: p_treatment - p_control
- Calculate relative risk or odds ratio
- Range: [min, max]
- Selected proportions for sample size: {p_treatment, p_control}

4. **Quality Assessment**
   - Are studies in similar populations?
   - Are interventions comparable to our DTx?
   - Are comparators similar?
   - Any concerns about generalizability?

5. **Justification**
   - Recommended effect size: {value}
   - Rationale: Based on {which_studies} because {reasons}
   - Conservative adjustment: {if_applicable}

**Output Format:**
- Literature review summary table (1 page)
- Effect size justification (2-3 paragraphs)
- References (5-10 citations)

**Example for Depression DTx:**

**Literature Review: PHQ-9 Change in CBT App Trials**

| Study | N | Population | Intervention | Control | Mean Δ Treatment | Mean Δ Control | Effect Size (points) | p-value |
|-------|---|------------|--------------|---------|------------------|----------------|---------------------|---------|
| Deprexis 2015 | 396 | Moderate MDD | Web CBT | Waitlist | -5.2 | -2.9 | -2.3 | <0.001 |
| MoodGYM 2012 | 182 | Mild-Mod MDD | Web CBT | Attention | -4.1 | -2.3 | -1.8 | 0.02 |
| Beating Blues 2010 | 274 | Moderate MDD | CBT App | TAU | -6.3 | -3.8 | -2.5 | <0.001 |
| This Way Up 2013 | 330 | Moderate MDD | Online CBT | Waitlist | -7.8 | -3.2 | -4.6 | <0.001 |

**Effect Size Analysis:**
- Range: 1.8 to 4.6 points on PHQ-9
- Mean effect size: 2.8 points
- Meta-analysis (4 studies): Weighted mean = 2.9 points (95% CI: 2.1-3.7)

**Recommendation**: Use **3.0 points** as target effect size
- **Rationale**: Conservative estimate (below weighted mean), aligns with MCID (Löwe 2004: MCID = 5 points, but clinically meaningful ≥3 points), feasible with reasonable N
- **Quality**: All studies are high-quality RCTs with similar populations and interventions
```

**INPUT**:
- Primary endpoint details
- Literature databases access
- Indication/population

**OUTPUT**:
- Literature review summary table
- Effect size estimate with justification

---

#### **PROMPT 2.2: Effect Size - Clinical Justification**

**Persona**: P01_CMO  
**Time**: 10 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a Chief Medical Officer evaluating whether proposed effect sizes are clinically meaningful and achievable.

USER PROMPT:
The biostatistician has proposed an effect size based on literature. I need to validate this is clinically meaningful and realistic for our DTx.

**Proposed Effect Size:**
- Endpoint: {endpoint}
- Effect size: {value}
- Source: {literature_summary}

**Evaluate:**

1. **Clinical Meaningfulness**
   - Is this effect size noticeable to patients?
   - Would clinicians consider this meaningful improvement?
   - Comparison to MCID (Minimally Clinically Important Difference)
   - Impact on patient functioning/quality of life

2. **Achievability**
   - Given our DTx mechanism of action, is this effect realistic?
   - Are literature studies using similar interventions?
   - Any reasons our DTx might perform better or worse?
   - Pilot data (if available) - does it support this effect?

3. **Regulatory Perspective**
   - Would FDA consider this effect clinically significant?
   - Precedent: Have similar DTx achieved this effect and gained clearance?
   - Risk: What if we achieve smaller effect? Is it still worthwhile?

4. **Recommendation**
   - Approve proposed effect size: Yes/No
   - If No: Recommend alternative: {value}
   - Confidence level: High / Moderate / Low

**Output Format:**
- Clinical meaningfulness assessment (1 paragraph)
- Achievability assessment (1 paragraph)
- Regulatory perspective (1 paragraph)
- Final recommendation (approve or suggest alternative)

**Example:**

**Proposed Effect Size**: 3-point reduction in PHQ-9 (vs. control)

**Clinical Meaningfulness**: ✅ APPROVED
A 3-point reduction on PHQ-9 is clinically meaningful. While the established MCID is 5 points for individual patient monitoring, population-level improvements of ≥3 points are clinically significant (Löwe 2004). This represents approximately 15-20% symptom reduction for moderate MDD patients (baseline PHQ-9 ~15). Patients and clinicians would notice functional improvement at this level.

**Achievability**: ✅ REALISTIC
Our MindPath CBT app uses evidence-based CBT techniques similar to Deprexis and Beating Blues, which achieved 2.3-2.5 points. Our enhanced features (daily coaching, behavioral activation) justify targeting 3 points. Pilot data (N=45) showed 3.2-point difference vs. sham, supporting this estimate.

**Regulatory Perspective**: ✅ ACCEPTABLE
FDA precedent: reSET (substance use) and Somryst (insomnia) achieved FDA De Novo with similar effect sizes on validated PROs. 3-point PHQ-9 improvement is above typical placebo response (~1.5 points) and clinically actionable.

**Recommendation**: **APPROVE 3.0 points as target effect size**
Confidence: HIGH
```

**INPUT**:
- Proposed effect size from literature review
- DTx mechanism details
- Pilot data (if available)

**OUTPUT**:
- Clinical approval or recommended adjustment

---

#### **PROMPT 3.1: Variability Estimation (Continuous Endpoints)**

**Persona**: P04_BIOSTAT  
**Time**: 15 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician estimating variability (standard deviation) for continuous endpoints from literature and pilot data.

USER PROMPT:
I need to estimate the standard deviation (SD) for my continuous primary endpoint.

**Endpoint Details:**
- Endpoint: {endpoint_name}
- Measurement: {instrument}
- Analysis: {change_from_baseline_or_endpoint_value}

**Estimate Variability:**

1. **Literature-Based SD**
   From literature review (Prompt 2.1), extract:
   - SD of change scores (if change from baseline)
   - SD of endpoint values (if comparing final values)
   - Sample sizes (larger N = more reliable SD)
   - Population characteristics (similar to ours?)

**Example Table:**
| Study | N | SD of Change | SD at Endpoint | Population |
|-------|---|--------------|----------------|------------|
| Study A | 200 | 5.8 | 6.2 | Moderate MDD |
| Study B | 150 | 6.4 | 7.1 | Mild-Mod MDD |
| Study C | 300 | 5.2 | 5.9 | Moderate MDD |

2. **Pooled SD Estimate**
   - Calculate weighted mean SD (weight by sample size)
   - Range: [min, max]
   - Consider: Are populations similar?

3. **Pilot Data (if available)**
   - SD from pilot: {value}
   - Pilot N: {sample_size}
   - Confidence in pilot SD: {high_moderate_low}
   - Compare to literature: Consistent? Higher? Lower?

4. **Baseline Covariate Adjustment**
   - If using ANCOVA (baseline as covariate)
   - Expected reduction in residual variance: R² ≈ 0.3-0.5
   - Adjusted SD = SD_change × √(1 - R²)
   - Example: SD_change = 6.0, R² = 0.4 → Adjusted SD = 6.0 × √0.6 = 4.65

5. **Conservative Recommendation**
   - Use upper bound of plausible SD range
   - Rationale: Over-estimating SD → larger N → more power (conservative)
   - Selected SD: {value}

**Output Format:**
- Literature SD summary table
- Pooled SD calculation
- Pilot data comparison (if applicable)
- ANCOVA adjustment (if applicable)
- Final SD recommendation with justification

**Example for PHQ-9 Change:**

**Literature SD Summary:**
- Deprexis: SD = 5.8 (N=396)
- MoodGYM: SD = 6.4 (N=182)
- Beating Blues: SD = 5.2 (N=274)
- This Way Up: SD = 6.9 (N=330)

**Pooled SD**: Weighted mean = 6.1 (weights by N)

**Pilot Data**: SD = 6.3 (N=45) - consistent with literature

**ANCOVA Adjustment**:
- Using ANCOVA with baseline PHQ-9 as covariate
- Expected R² = 0.4 (moderate correlation)
- Adjusted SD = 6.1 × √(1-0.4) = 6.1 × 0.77 = **4.7**

**Recommendation**: Use **SD = 5.0** for sample size calculation
- **Rationale**: Conservative (slightly higher than adjusted SD of 4.7), accounts for potential heterogeneity in trial population, provides buffer
```

**INPUT**:
- Literature review results
- Pilot data (if available)
- Analysis method (ANCOVA, t-test)

**OUTPUT**:
- SD estimate with justification

---

#### **PROMPT 3.2: Variability Estimation (Binary Endpoints)**

**Persona**: P04_BIOSTAT  
**Time**: 10 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician estimating proportions for binary endpoint sample size calculations.

USER PROMPT:
I need to estimate expected response rates (proportions) for binary endpoint.

**Endpoint:**
- Endpoint: {binary_outcome_description}
- Definition: {threshold_or_criterion}
- Example: Response defined as ≥50% reduction in PHQ-9

**Estimate Proportions:**

1. **Literature-Based Rates**
   From literature:
   - Treatment group response rate: {p_treatment}
   - Control group response rate: {p_control}
   - Absolute risk difference: p_treatment - p_control

**Example Table:**
| Study | N | Treatment Response | Control Response | Difference |
|-------|---|-------------------|------------------|------------|
| Study A | 200 | 55% | 25% | 30% |
| Study B | 150 | 48% | 22% | 26% |
| Study C | 300 | 62% | 30% | 32% |

2. **Pooled Estimates**
   - Pooled treatment rate: {weighted_mean}
   - Pooled control rate: {weighted_mean}
   - Pooled difference: {value}

3. **Pilot Data (if available)**
   - Treatment response: {percent}
   - Control response: {percent}
   - Difference: {percent}
   - Consistent with literature? Yes/No

4. **Conservative Adjustment**
   - Assumption: Treatment effect may be lower in larger, more diverse trial
   - Recommendation: Use conservative (lower) treatment response or higher control response
   - Final estimates:
     - **p_treatment**: {value}
     - **p_control**: {value}
     - **Absolute difference**: {value}

**Output Format:**
- Literature summary table
- Pooled estimates
- Final recommended proportions with justification

**Example for PHQ-9 Response (≥50% reduction):**

**Literature Summary:**
- Deprexis: 55% treatment, 25% control (difference = 30%)
- MoodGYM: 48% treatment, 22% control (difference = 26%)
- Beating Blues: 62% treatment, 30% control (difference = 32%)

**Pooled Estimates**:
- Pooled treatment: 56%
- Pooled control: 26%
- Pooled difference: 30%

**Pilot Data**: 60% treatment, 28% control (difference = 32%) - slightly higher than pooled

**Recommendation**: Use conservative estimates
- **p_treatment = 55%** (below pilot, at pooled mean)
- **p_control = 27%** (slightly above pooled)
- **Difference = 28%** (conservative buffer)

**Rationale**: Conservative assumptions provide buffer against optimistic pilot results; larger trial may have more heterogeneous population
```

**INPUT**:
- Literature review
- Binary endpoint definition
- Pilot data (if available)

**OUTPUT**:
- Proportion estimates (p_treatment, p_control)

---

#### **PROMPT 4.1: Sample Size Calculation**

**Persona**: P04_BIOSTAT  
**Time**: 20 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician performing sample size calculations using standard statistical formulas and software validation.

USER PROMPT:
Perform sample size calculation given study parameters.

**Study Design:**
- Design: {superiority_non_inferiority}
- Arms: 2 parallel arms
- Allocation: {1_1_or_specify_ratio}
- Primary analysis: {statistical_test}

**Parameters:**

**For Continuous Endpoints:**
- Effect size (mean difference): {delta}
- Standard deviation: {sd}
- Alpha (significance level): {0.05_two_sided}
- Power: {0.80_or_0.90}

**For Binary Endpoints:**
- Treatment response rate: {p_treatment}
- Control response rate: {p_control}
- Alpha: {0.05}
- Power: {0.80}

**Calculate Sample Size:**

1. **Formula Application**

**For Continuous Outcome (Two-Sample t-test or ANCOVA):**

Formula:
n per group = 2 × (Z_α/2 + Z_β)² × σ² / Δ²

Where:
- Z_α/2 = 1.96 for alpha=0.05 (two-sided)
- Z_β = 0.84 for power=0.80 OR 1.28 for power=0.90
- σ = standard deviation
- Δ = effect size (mean difference)

**For Binary Outcome (Two-Proportion test):**

Formula:
n per group = (Z_α/2 + Z_β)² × [p1(1-p1) + p2(1-p2)] / (p1 - p2)²

Where:
- p1 = treatment response rate
- p2 = control response rate

2. **Hand Calculation**
   Step-by-step calculation with numbers plugged in

3. **Software Verification**
   Verify using statistical software:
   - **R code example**:
     ```r
     # For continuous endpoint
     power.t.test(delta = [EFFECT], sd = [SD], 
                  sig.level = 0.05, power = 0.80)
     
     # For binary endpoint
     power.prop.test(p1 = [P_TREATMENT], p2 = [P_CONTROL],
                     sig.level = 0.05, power = 0.80)
     ```
   - **SAS code**:
     ```sas
     proc power;
       twosamplemeans test=diff
       meandiff = [EFFECT]
       stddev = [SD]
       alpha = 0.05
       power = 0.80
       ntotal = .;
     run;
     ```

4. **Results**
   - n per group (completers): {value}
   - Total N (both arms): {value × 2}
   - Allocation: {if_1_1_then_equal_else_specify}

**Output Format:**
- Formula with parameters
- Hand calculation (show work)
- Software code and output
- Final sample size (n per group, total N)

**Example for MindPath CBT (Continuous):**

**Given Parameters:**
- Effect size: Δ = 3.0 points (PHQ-9)
- SD: σ = 5.0
- Alpha: 0.05 (two-sided)
- Power: 0.80
- Design: Two-arm parallel, 1:1 allocation

**Formula:**
n per group = 2 × (1.96 + 0.84)² × 5.0² / 3.0²
            = 2 × 7.84 × 25 / 9
            = 2 × 21.78
            = **43.6 → 44 per group**

**Software Verification (R):**
```r
power.t.test(delta = 3.0, sd = 5.0, sig.level = 0.05, power = 0.80)

Output:
     n = 44.0 per group
```

**Result:**
- **n per group (completers): 44**
- **Total N (completers): 88**
- Next step: Adjust for attrition
```

**INPUT**:
- Study parameters (effect, SD/proportions, alpha, power)

**OUTPUT**:
- Sample size (completers) with calculation details

---

#### **PROMPT 5.1: Attrition Adjustment**

**Persona**: P04_BIOSTAT, P02_VPCLIN  
**Time**: 15 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician and Clinical Operations Lead estimating trial attrition and adjusting enrollment targets.

USER PROMPT:
Adjust sample size for expected attrition (dropout/loss to follow-up).

**Completer Sample Size (from Step 4):**
- n per group (completers): {value}
- Total N (completers): {value}

**Estimate Attrition:**

1. **Historical Attrition Data**
   Search for attrition rates in similar trials:
   - Indication: {condition}
   - Intervention type: {dtx_or_behavioral}
   - Study duration: {weeks_or_months}
   - Population: {severity_demographics}

**Example Table:**
| Study | Duration | Intervention | Attrition Rate | Reason for Attrition |
|-------|----------|--------------|----------------|---------------------|
| Study A | 12 weeks | CBT app | 22% | Lost to follow-up, withdrew consent |
| Study B | 8 weeks | Coaching app | 18% | Technical issues, lack of interest |
| Study C | 16 weeks | Web CBT | 28% | Symptom worsening, study burden |

2. **Expected Attrition for Our Trial**
   - Typical range for this indication/duration: {range}
   - Our trial characteristics:
     - Duration: {weeks}
     - Retention strategies: {list_strategies}
     - Patient burden: {low_moderate_high}
   - **Estimated attrition: {percent}**
   - **Rationale**: {justify_assumption}

3. **Conservative vs. Realistic**
   - **Conservative estimate**: 25-30% (safest, but larger N)
   - **Realistic estimate**: Based on historical + our retention plan
   - **Optimistic estimate**: 10-15% (risky, requires excellent retention)
   - **Recommendation**: Use {which_estimate}

4. **Enrollment Target Calculation**

Formula:
n_enrollment per group = n_completer / (1 - attrition_rate)

Example:
- Completer target: 44 per group
- Attrition: 25%
- Enrollment target: 44 / (1 - 0.25) = 44 / 0.75 = **59 per group**

5. **Retention Strategy Validation**
   With VP Clinical Development (P02_VPCLIN):
   - Review retention strategies:
     - Engagement features (push notifications, rewards)
     - Regular check-ins (automated + personal)
     - Flexible visit windows
     - Retention incentives ($50-100 completion bonus?)
   - Is {estimated_attrition}% achievable? Yes/No
   - If No: Increase retention efforts or adjust attrition assumption

**Output Format:**
- Historical attrition summary
- Attrition estimate with justification
- Enrollment target calculation
- Retention strategy validation

**Example for MindPath CBT:**

**Historical Attrition:**
- Depression DTx trials (12 weeks): 18-28% attrition
- Mean: 23%

**Our Trial Estimate: 25%**
- **Rationale**: 12-week duration (moderate), fully remote (slightly higher dropout), but strong retention plan (engagement features, $100 completion incentive, weekly check-ins)
- Conservative: Assume 25% to provide buffer

**Enrollment Calculation:**
- Completer target: 44 per group
- Attrition: 25%
- **Enrollment target: 59 per group**
- **Total enrollment: 118 (both arms)**

**Retention Strategy:**
- Daily mood tracking with streaks (gamification)
- Weekly automated check-ins (chatbot)
- Bi-weekly human coach calls (retention touch-points)
- $100 Amazon gift card for completion
- Flexible ±3 day visit windows

**VP Clinical Development Review**: ✅ APPROVED
Retention strategy robust. 25% attrition is achievable. Recommend N=118 total enrollment.
```

**INPUT**:
- Completer sample size
- Historical attrition data
- Retention strategies

**OUTPUT**:
- Enrollment target (attrition-adjusted N)

---

#### **PROMPT 6.1: Sensitivity Analysis - Effect Size**

**Persona**: P04_BIOSTAT  
**Time**: 10 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician performing sensitivity analyses to assess robustness of sample size calculations.

USER PROMPT:
Test how sample size changes if effect size varies.

**Base Case Assumptions:**
- Effect size: {delta_base}
- SD: {sd_base}
- Power: {power_base}
- Sample size: {n_base}

**Sensitivity Scenarios:**

Test effect sizes at:
- **Scenario 1**: Effect -20% (more conservative)
- **Scenario 2**: Effect -10%
- **Base Case**: Effect (as planned)
- **Scenario 3**: Effect +10% (optimistic)
- **Scenario 4**: Effect +20% (very optimistic)

**For Each Scenario:**
1. Calculate required sample size
2. Calculate power with base case N
3. Interpret implications

**Output Table:**

| Scenario | Effect Size | Required N | Power with Base N | Interpretation |
|----------|-------------|------------|-------------------|----------------|
| -20% | {value} | {N} | {power} | {implication} |
| -10% | {value} | {N} | {power} | {implication} |
| Base | {value} | {N} | 80% | As planned |
| +10% | {value} | {N} | {power} | {implication} |
| +20% | {value} | {N} | {power} | {implication} |

**Interpretation:**
- **Robust**: If power remains >70% even with -20% effect → sample size is robust
- **At Risk**: If power drops below 70% with -20% effect → consider increasing N or accepting risk
- **Over-powered**: If power >90% with base effect → could reduce N, but conservative is safer

**Example for MindPath CBT:**

**Base Case:**
- Effect: 3.0 points
- SD: 5.0
- Power: 80%
- N: 59 per group (118 total)

**Sensitivity Table:**

| Scenario | Effect Size | Required N/group | Power with N=59 | Interpretation |
|----------|-------------|-----------------|-----------------|----------------|
| -20% | 2.4 points | 92 | 66% | **AT RISK**: Trial under-powered if effect is 20% lower |
| -10% | 2.7 points | 68 | 74% | Marginal: Power acceptable but not ideal |
| Base | 3.0 points | 59 | 80% | As planned |
| +10% | 3.3 points | 49 | 87% | Over-powered: Could reduce N |
| +20% | 3.6 points | 43 | 92% | Substantially over-powered |

**Conclusion:**
- **Risk**: If true effect is 2.4 points (20% lower), power drops to 66% → higher risk of false negative
- **Mitigation Options**:
  1. **Increase N to 92/group (184 total)** → Ensures 80% power even if effect is 20% lower (conservative)
  2. **Accept risk** → Proceed with N=59/group, acknowledge 66% power in worst case
  3. **Adaptive design** → Implement interim analysis at 50% enrollment to assess effect and adjust N if needed

**Recommendation**: Proceed with N=59/group (base case), but plan interim futility analysis to monitor effect size
```

**INPUT**:
- Base case assumptions
- Range for sensitivity (+/- 20%)

**OUTPUT**:
- Sensitivity table
- Risk assessment

---

#### **PROMPT 6.2: Sensitivity Analysis - Variability (SD)**

**Persona**: P04_BIOSTAT  
**Time**: 10 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician testing sensitivity to variability assumptions.

USER PROMPT:
Test how sample size changes if SD varies from assumption.

**Base Case:**
- Effect: {delta}
- SD: {sd_base}
- Power: {power}
- Sample size: {n_base}

**Sensitivity Scenarios:**

Test SD at:
- **Scenario 1**: SD -20%
- **Scenario 2**: SD -10%
- **Base Case**: SD (as assumed)
- **Scenario 3**: SD +10%
- **Scenario 4**: SD +20%

**Output Table:**

| Scenario | SD | Required N | Power with Base N | Interpretation |
|----------|-----|------------|-------------------|----------------|
| -20% | {value} | {N} | {power} | {implication} |
| -10% | {value} | {N} | {power} | {implication} |
| Base | {value} | {N} | 80% | As planned |
| +10% | {value} | {N} | {power} | {implication} |
| +20% | {value} | {N} | {power} | {implication} |

**Interpretation:**
- Higher SD → Larger N needed (or lower power)
- Lower SD → Smaller N needed (over-powered)

**Example:**

**Base Case:**
- Effect: 3.0 points
- SD: 5.0
- N: 59 per group

**Sensitivity Table:**

| Scenario | SD | Required N/group | Power with N=59 | Interpretation |
|----------|-----|-----------------|-----------------|----------------|
| -20% | 4.0 | 38 | 93% | Over-powered |
| -10% | 4.5 | 48 | 86% | Slightly over-powered |
| Base | 5.0 | 59 | 80% | As planned |
| +10% | 5.5 | 72 | 74% | Slightly under-powered |
| +20% | 6.0 | 85 | 69% | **AT RISK** |

**Conclusion:**
- **Risk**: If true SD is 6.0 (20% higher), power drops to 69%
- **Robustness**: Power acceptable across -10% to +10% SD range (74-86%)
- **Recommendation**: Base case N=59 is reasonable; SD estimate is conservative (upper end of literature range)
```

**INPUT**:
- Base case SD
- Effect size

**OUTPUT**:
- SD sensitivity table

---

#### **PROMPT 6.3: Sensitivity Analysis - Attrition**

**Persona**: P04_BIOSTAT  
**Time**: 5 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a Clinical Biostatistician testing impact of attrition assumptions on enrollment targets.

USER PROMPT:
Test how enrollment target changes with different attrition rates.

**Base Case:**
- Completer target: {n_completer}
- Assumed attrition: {percent}
- Enrollment target: {n_enrollment}

**Sensitivity Scenarios:**

| Attrition Rate | Enrollment Required | Change from Base |
|----------------|---------------------|------------------|
| 15% | {calculation} | {difference} |
| 20% | {calculation} | {difference} |
| **25% (Base)** | {n_base} | - |
| 30% | {calculation} | {difference} |
| 35% | {calculation} | {difference} |

**Example:**

**Base:** 44 completers, 25% attrition → 59 enrollment

| Attrition | Enrollment/group | Total N | Change from Base |
|-----------|------------------|---------|------------------|
| 15% | 52 | 104 | -14 (-12%) |
| 20% | 55 | 110 | -8 (-7%) |
| **25%** | **59** | **118** | - |
| 30% | 63 | 126 | +8 (+7%) |
| 35% | 68 | 136 | +18 (+15%) |

**Conclusion:**
- If attrition is worse than expected (30-35%), need 8-18 more participants/group
- Budget impact: +$50K-100K (assuming $5K/participant)
- Timeline impact: +1-2 months enrollment
- **Recommendation**: Plan for 25% but prepare for 30% scenario
```

**INPUT**:
- Completer target
- Base attrition assumption

**OUTPUT**:
- Attrition sensitivity table

---

#### **PROMPT 7.1: Recruitment Feasibility Assessment**

**Persona**: P02_VPCLIN  
**Time**: 15 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a VP Clinical Development assessing trial recruitment feasibility.

USER PROMPT:
Assess whether enrollment target is feasible within trial timeline and budget.

**Enrollment Target:**
- Total N to enroll: {n_total}
- N per arm: {n_per_arm}

**Trial Parameters:**
- Enrollment period: {months}
- Number of sites: {planned_sites}
- Geographic region: {US_EU_global}

**Feasibility Assessment:**

1. **Site Capacity**
   - Participants per site per month: {estimate}
   - Typical range: 1-5 participants/site/month for DTx trials
   - Total capacity: {sites} × {rate} × {months} = {total_capacity}
   - Target: {n_total}
   - **Sufficient capacity?** Yes/No

2. **Enrollment Rate Assumptions**
   - Screen:Enroll ratio: {estimate_3_1_to_2_1}
   - Total screens needed: {n_total} × {ratio} = {total_screens}
   - Screening capacity per site per month: {estimate}

3. **Recruitment Channels**
   - Clinician referrals (expected %)
   - Online advertising (expected %)
   - Patient registries (expected %)
   - Community partnerships (expected %)

4. **Timeline Calculation**

**Scenario 1: Best Case**
- Sites: {N}, Rate: {high}, Duration: {months}
- Enrollment completion: {date}

**Scenario 2: Base Case**
- Sites: {N}, Rate: {moderate}, Duration: {months}
- Enrollment completion: {date}

**Scenario 3: Worst Case**
- Sites: {N}, Rate: {low}, Duration: {months}
- Enrollment completion: {date}

5. **Risk Mitigation**
   - Slow enrollment triggers: If <X enrolled by Month 3
   - Mitigation actions:
     - Add more sites
     - Increase advertising budget
     - Expand eligibility criteria (if clinically appropriate)

**Output Format:**
- Feasibility assessment (1-2 pages)
- Enrollment timeline scenarios
- Risk mitigation plan

**Example for MindPath CBT (N=118):**

**Assessment:**
- Target: 118 participants (59/arm)
- Duration: 12 months enrollment
- Sites: 10 sites (mix of academic centers + community practices)

**Site Capacity:**
- Expected rate: 2 participants/site/month (conservative for fully remote DTx)
- Total capacity: 10 sites × 2/month × 12 months = **240 capacity**
- Target: 118
- **Sufficient? YES** (Capacity = 2× target)

**Screen:Enroll Ratio: 2:1**
- Screens needed: 118 × 2 = 236
- Screening rate: 4 per site/month
- Screening capacity: 10 × 4 × 12 = 480
- **Sufficient? YES**

**Timeline Scenarios:**

**Base Case**: 2 participants/site/month
- 10 sites × 2/month = 20 enrolled/month
- 118 / 20 = **5.9 months** → **6 months enrollment complete**

**Worst Case**: 1.5 participants/site/month
- 10 × 1.5 = 15/month
- 118 / 15 = **7.9 months** → **8 months**

**Best Case**: 2.5 participants/site/month
- 10 × 2.5 = 25/month
- 118 / 25 = **4.7 months** → **5 months**

**Conclusion: FEASIBLE**
- Expected 6 months enrollment (well within 12-month window)
- 6-month buffer for slow enrollment
- **Recommendation**: APPROVE N=118
```

**INPUT**:
- Enrollment target
- Site/recruitment plan

**OUTPUT**:
- Feasibility assessment
- Enrollment timeline

---

#### **PROMPT 7.2: Final Sample Size Justification Document**

**Persona**: P04_BIOSTAT  
**Time**: 25 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Lead Biostatistician preparing final sample size justification for protocol.

USER PROMPT:
Compile comprehensive sample size justification integrating all prior analyses.

**Document Structure:**

# SAMPLE SIZE JUSTIFICATION
## {Study Name}

### 1. EXECUTIVE SUMMARY (1 page)

**Study Design:**
- Design type: {superiority/non-inferiority}
- Arms: {2_parallel_1_1}
- Primary endpoint: {endpoint_description}
- Analysis: {statistical_test}

**Sample Size Recommendation:**
- **Enrollment target: {N} per arm ({Total} total)**
- **Completer target: {N} per arm ({Total} total)**
- Power: {80%_or_90%}
- Assumptions:
  - Effect size: {value}
  - Variability: SD = {value} OR Proportions = {p1, p2}
  - Attrition: {percent}

---

### 2. STUDY OBJECTIVES & HYPOTHESES

**Primary Objective:**
{statement_of_objective}

**Hypotheses:**
- H0 (Null): {no_difference}
- H1 (Alternative): {dtx_better_or_non_inferior}

**Statistical Test:**
- Test: {two_sample_t_test_ANCOVA_chi_square_etc}
- Significance level: α = 0.05 (two-sided)
- Power: 1-β = 0.80

---

### 3. EFFECT SIZE ESTIMATION

**3.1 Literature Review**

{Summary_table_from_Prompt_2.1}

**Key Findings:**
- Range of effect sizes: {min} to {max}
- Meta-analysis (if conducted): Weighted mean = {value}
- Studies most comparable to ours: {list}

**3.2 Clinical Justification**

{From_Prompt_2.2}
- Minimally Clinically Important Difference (MCID): {value}
- Proposed effect size: {value}
- Rationale: {justify}

**3.3 Pilot Data (if available)**

- Pilot N: {sample_size}
- Observed effect: {value}
- Consistency with literature: {yes_no_discussion}

**3.4 Selected Effect Size**

**Recommended: {Δ = value}**
- Rationale: {comprehensive_justification}
- Confidence level: {High_Moderate_Low}

---

### 4. VARIABILITY ESTIMATION

**4.1 Literature Standard Deviations**

{Table_from_Prompt_3.1_or_3.2}

**4.2 Pooled Estimate**

- Weighted mean SD: {value}
- Range: [{min}, {max}]

**4.3 ANCOVA Adjustment (if applicable)**

- Baseline covariate: {variable}
- Expected R²: {value}
- Adjusted SD: {value}

**4.4 Selected Variability**

**Recommended: σ = {value}** (continuous) OR **p_treatment={value}, p_control={value}** (binary)
- Rationale: {justification}

---

### 5. SAMPLE SIZE CALCULATION

**5.1 Formula & Parameters**

{From_Prompt_4.1}
- Formula: {equation}
- Parameters:
  - Effect size (Δ): {value}
  - SD (σ): {value} OR Proportions (p1, p2): {values}
  - Alpha (α): 0.05 (two-sided)
  - Power (1-β): 0.80
  - Allocation: 1:1

**5.2 Calculation**

{Show_hand_calculation_step_by_step}

**Result:**
- **n per group (completers): {N}**
- **Total N (completers): {2N}**

**5.3 Software Verification**

```r
{R_code_from_Prompt_4.1}
```

Output: n = {N} per group ✓ (matches hand calculation)

---

### 6. ATTRITION ADJUSTMENT

**6.1 Historical Attrition**

{From_Prompt_5.1}
- Similar trials: {attrition_range}
- Mean: {value}

**6.2 Expected Attrition**

- Our trial: {percent}
- Rationale: {justify_based_on_duration_retention_plan}

**6.3 Enrollment Target**

Formula: n_enroll = n_complete / (1 - attrition_rate)

Calculation:
- Completers: {N}
- Attrition: {percent}
- **Enrollment: {N_enroll} per group**
- **Total enrollment: {Total_enroll}**

---

### 7. SENSITIVITY ANALYSES

**7.1 Effect Size Sensitivity**

{Table_from_Prompt_6.1}

**Interpretation:** {robustness_assessment}

**7.2 Variability Sensitivity**

{Table_from_Prompt_6.2}

**Interpretation:** {robustness_assessment}

**7.3 Attrition Sensitivity**

{Table_from_Prompt_6.3}

**Interpretation:** {budget_timeline_implications}

**7.4 Overall Robustness**

- Power acceptable (>70%) across plausible scenarios: Yes/No
- Risks: {list_key_risks}
- Mitigation: {strategies}

---

### 8. RECRUITMENT FEASIBILITY

{From_Prompt_7.1}

**Summary:**
- Enrollment target: {N}
- Timeline: {months_to_complete}
- Sites: {number}
- **Feasible? YES / NO**

---

### 9. FINAL RECOMMENDATION

**Recommended Sample Size:**
- **Enrollment target: {N} per arm, {Total} total**
- **Completer target: {N} per arm, {Total} total**

**Justification:**
{1_paragraph_summary_of_key_rationale}

**Approval Signatures:**
- Lead Biostatistician: ________________ Date: _______
- Chief Medical Officer: ________________ Date: _______
- VP Clinical Development: ______________ Date: _______

---

### 10. REFERENCES

1. {Literature_citations}
2. {FDA_guidance_if_applicable}
3. {Statistical_software_references}

---

### 11. APPENDICES

**Appendix A**: Detailed Literature Review
**Appendix B**: Statistical Software Code
**Appendix C**: Sensitivity Analysis Details

---

**DOCUMENT COMPLETE**
```

**INPUT**:
- All outputs from Steps 1-6

**OUTPUT**:
- Final justification document (5-8 pages)

---

#### **PROMPT 7.3: Executive Summary for Stakeholders**

**Persona**: P04_BIOSTAT  
**Time**: 10 minutes  
**Complexity**: BASIC

```yaml
SYSTEM PROMPT:
You are a Lead Biostatistician preparing non-technical executive summary for leadership.

USER PROMPT:
Create 1-page executive summary of sample size recommendation.

**Template:**

---

# SAMPLE SIZE EXECUTIVE SUMMARY
## {Study Name}

**Date**: {date}  
**Prepared by**: {biostatistician_name}

---

### RECOMMENDATION

**Enroll {N} participants per group ({Total} total) to achieve 80% power.**

---

### KEY ASSUMPTIONS

| Parameter | Value | Source |
|-----------|-------|--------|
| **Primary Endpoint** | {description} | Protocol |
| **Expected Benefit** | {effect_size} | Literature meta-analysis |
| **Population Variability** | {SD_or_proportions} | Prior studies |
| **Statistical Power** | 80% | Industry standard |
| **Dropout Rate** | {percent} | Historical data |

---

### SENSITIVITY & RISK

**Robust Scenarios:**
- Power remains >70% even if effect is 20% smaller than expected
- Sample size adequate across plausible variability ranges

**Key Risks:**
- If dropout exceeds {percent}, may need additional {N} participants
- If effect smaller than {threshold}, trial may be under-powered

**Mitigation:**
- Strong retention plan (incentives, engagement features)
- Interim analysis at 50% enrollment to monitor effect

---

### FEASIBILITY

**Enrollment Timeline:**
- Target: {N} total participants
- Duration: {months} enrollment period
- Rate: {X} participants/site/month
- Sites: {number}

**Conclusion:** ✅ **FEASIBLE** (Capacity exceeds target by {percent})

---

### BUDGET IMPACT

- Participants: {N} × ${cost_per_participant} = ${total}
- Sites: {number} × ${cost_per_site} = ${total}
- Total trial cost: ~${total_estimate}

---

### NEXT STEPS

1. **CMO Approval**: Confirm effect size assumptions
2. **CFO Approval**: Budget for {N} participants
3. **CRO Selection**: Contract for enrollment support
4. **Protocol Finalization**: Incorporate sample size justification

---

**Questions?** Contact: {biostatistician_email}

---

**EXAMPLE:**

# SAMPLE SIZE EXECUTIVE SUMMARY
## MindPath CBT Depression Trial

**Date**: October 10, 2025  
**Prepared by**: Dr. Lisa Park, Lead Biostatistician

### RECOMMENDATION

**Enroll 59 participants per group (118 total) to achieve 80% power.**

### KEY ASSUMPTIONS

| Parameter | Value | Source |
|-----------|-------|--------|
| **Primary Endpoint** | Change in PHQ-9 (baseline to week 12) | Protocol |
| **Expected Benefit** | 3.0 points greater reduction vs. sham | Deprexis, Beating Blues trials |
| **Population Variability** | SD = 5.0 | Literature meta-analysis |
| **Statistical Power** | 80% | Industry standard |
| **Dropout Rate** | 25% | Depression DTx trials |

### SENSITIVITY & RISK

**Robust**: Power remains 74% even if effect is 10% smaller. Power 66% if effect is 20% smaller.

**Key Risk**: If dropout exceeds 30%, need 63/group (+8 participants).

**Mitigation**: $100 completion incentive, weekly check-ins, flexible scheduling.

### FEASIBILITY

**Enrollment Timeline:**
- Target: 118 participants
- Duration: 6 months (base case), up to 8 months (worst case)
- Rate: 2 participants/site/month
- Sites: 10 sites

**Conclusion:** ✅ **FEASIBLE** (Capacity = 2× target)

### BUDGET IMPACT

- Participants: 118 × $5K = $590K
- Sites: 10 × $15K = $150K
- **Total trial cost: ~$1.2M**

### NEXT STEPS

1. ✅ **Biostatistician**: Sample size justified
2. **CMO Approval**: Confirm 3-point effect is clinically meaningful
3. **CFO Approval**: Budget for N=118
4. **CRO Contract**: Finalize site agreements

**Questions?** lisa.park@mindpathdtx.com

---
```

**INPUT**:
- Final justification document

**OUTPUT**:
- 1-page executive summary (non-technical)

---

## 6. WORKED EXAMPLE: MINDPATH CBT DEPRESSION TRIAL

### 6.1 Complete Scenario

**Company**: MindPath Digital Therapeutics, Inc.  
**Product**: MindPath CBT - Cognitive Behavioral Therapy mobile app for Major Depressive Disorder  
**Stage**: Planning pivotal RCT for FDA De Novo submission  
**Timeline**: Trial start in 6 months  
**Budget**: $1.5M for clinical trial

**Product Details**:
- **Indication**: Major Depressive Disorder, moderate severity (PHQ-9 10-19)
- **Target Population**: Adults 18-65 years
- **Intervention**: 12-week CBT program via mobile app
  - Daily mood tracking
  - CBT skill training (cognitive restructuring, behavioral activation)
  - Thought records, activity scheduling
  - Progress visualization
- **Primary Endpoint**: Change in PHQ-9 score from baseline to week 12

**Trial Design (Already Decided in UC_CD_003)**:
- Design: Randomized, double-blind, sham-controlled, parallel-group, superiority trial
- Arms: 2 arms (1:1 allocation)
  - Arm 1: MindPath CBT app
  - Arm 2: Sham app (attention control)
- Duration: 12 weeks treatment + 4 weeks follow-up
- Analysis: ANCOVA with baseline PHQ-9 as covariate

**Team**:
- Dr. Sarah Chen, CMO (P01_CMO)
- Dr. Lisa Park, Lead Biostatistician (P04_BIOSTAT)
- Dr. James Martinez, VP Clinical Development (P02_VPCLIN)
- Tom Wilson, Regulatory Affairs Director (P05_REGDIR)

---

### 6.2 Step-by-Step Execution

---

**PHASE 1: STUDY DESIGN SPECIFICATION**

**Prompt 1.1 Executed by**: P01_CMO + P04_BIOSTAT  
**Time**: 15 minutes

**Input:**
- Product: MindPath CBT
- Indication: MDD, moderate (PHQ-9 10-19)
- Primary Endpoint: Change in PHQ-9 (baseline to week 12), continuous
- Design: Superiority, 2-arm parallel, 1:1, sham control
- Analysis: ANCOVA (baseline covariate)

**Output:**

```markdown
# STUDY DESIGN SPECIFICATION
## MindPath CBT Depression Trial

**Study Design Summary:**
- **Design**: Superiority trial (MindPath CBT > Sham)
- **Hypothesis**: MindPath CBT will produce greater reduction in PHQ-9 than sham control
- **Arms**: 2-arm parallel, 1:1 allocation
  - **Arm 1**: MindPath CBT app (12 weeks)
  - **Arm 2**: Sham app (attention control, 12 weeks)
- **Primary Endpoint**: Change in PHQ-9 score (baseline to week 12), continuous
- **Analysis Method**: ANCOVA with baseline PHQ-9 as covariate
- **Alpha**: 0.05 (two-sided)
- **Power**: 80%

**Rationale:**
- **Superiority**: Novel DTx intervention; aim to demonstrate added benefit beyond attention/engagement effects
- **Two-sided test**: FDA standard; we test if MindPath is better (or worse) than sham
- **ANCOVA**: Adjusts for baseline depression severity, increases statistical efficiency (reduces required N by ~20-30%)
- **80% Power**: Industry standard, balances statistical rigor with sample size feasibility
- **Sham control**: Controls for app usage, engagement, self-monitoring effects; maintains blinding

**Statistical Test:**
Primary Analysis: ANCOVA
- Dependent variable: PHQ-9 at week 12
- Independent variable: Treatment group (MindPath vs Sham)
- Covariate: Baseline PHQ-9
- Model: Y_week12 = β0 + β1×Group + β2×PHQ9_baseline + ε
- Test: H0: β1 = 0 vs H1: β1 ≠ 0 (two-sided, α=0.05)
```

**Dr. Chen (CMO)**: ✅ "Design specification approved. Proceed to effect size estimation."

---

**PHASE 2: EFFECT SIZE ESTIMATION**

**Step 2.1: Literature Review**

**Prompt 2.1 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 20 minutes

**Output:**

```markdown
# EFFECT SIZE: LITERATURE REVIEW
## PHQ-9 Change in CBT App Trials for Depression

**Search Strategy:**
- Databases: PubMed, ClinicalTrials.gov
- Terms: "depression" AND "digital therapeutic" OR "mobile app" OR "internet CBT" AND "PHQ-9"
- Filters: RCTs, 2010-2025, English, adults
- Results: 8 relevant RCTs identified

**Literature Summary:**

| Study | Year | N | Population | Intervention | Control | Treatment Δ | Control Δ | Difference | p-value | Notes |
|-------|------|---|------------|--------------|---------|-------------|-----------|------------|---------|-------|
| Deprexis | 2015 | 396 | Moderate MDD | Web CBT (9 wks) | Waitlist | -5.2 | -2.9 | **2.3** | <0.001 | German, CE Mark |
| MoodGYM | 2012 | 182 | Mild-Mod MDD | Web CBT (12 wks) | Attention | -4.1 | -2.3 | **1.8** | 0.02 | Australian |
| Beating Blues | 2010 | 274 | Moderate MDD | CBT App (8 wks) | TAU | -6.3 | -3.8 | **2.5** | <0.001 | UK, NICE approved |
| This Way Up | 2013 | 330 | Moderate MDD | Online CBT (10 wks) | Waitlist | -7.8 | -3.2 | **4.6** | <0.001 | Australian |
| Wysa | 2020 | 129 | Mild-Mod MDD | AI Chatbot (8 wks) | Waitlist | -4.7 | -2.1 | **2.6** | 0.003 | US pilot |
| Happify | 2017 | 221 | Subclinical | Gamified CBT (12 wks) | No treatment | -3.9 | -1.8 | **2.1** | 0.01 | US, healthier population |
| SilverCloud | 2018 | 310 | Moderate MDD | iCBT (8 wks) | TAU | -5.4 | -3.6 | **1.8** | 0.04 | Ireland |
| COMPASS | 2014 | 158 | Moderate MDD | Therapist-supported iCBT | Waitlist | -8.1 | -2.4 | **5.7** | <0.001 | High support |

**Effect Size Analysis:**

**Range**: 1.8 to 5.7 points on PHQ-9

**Mean Effect**: 2.9 points (unweighted)

**Weighted Mean** (by N): 
- Calculation: Σ(N_i × Effect_i) / Σ(N_i)
- Result: **2.9 points** (95% CI: 2.2-3.6)

**Subgroup Analysis:**

**By Control Type:**
- Waitlist controls: Mean effect = 3.4 points (larger, less conservative)
- Attention/Sham controls: Mean effect = 1.8 points (smaller, more conservative)
- TAU controls: Mean effect = 2.2 points

**By Intervention Duration:**
- 8-10 weeks: Mean = 2.3 points
- 12 weeks: Mean = 2.5 points

**By Population Severity:**
- Mild-Moderate: Mean = 2.0 points
- Moderate: Mean = 3.1 points

**Quality Assessment:**
- All studies are RCTs (Jadad score ≥3)
- Populations similar to ours (moderate MDD, adults)
- Interventions: All deliver CBT via digital platform
- ⚠️ Limitation: Most use waitlist controls (larger effects); fewer use sham/attention controls

**Selected Effect Size for Sample Size:**

**Recommendation: 3.0 points**

**Rationale:**
1. **Conservative**: Slightly above weighted mean (2.9), accounts for potential optimism bias in literature
2. **Sham Control Adjustment**: Our trial uses sham (attention control), which typically yields smaller effects than waitlist. Deprexis (attention control) showed 2.3 points; we target 3.0 (slightly optimistic but supported by pilot)
3. **Clinical Meaningfulness**: 3 points ≥ MCID for population-level improvement (Löwe 2004)
4. **Pilot Data**: Our pilot (N=45) showed 3.2-point difference vs sham (95% CI: 1.8-4.6) - supports 3.0 target
5. **Regulatory Precedent**: Somryst (insomnia DTx) achieved FDA De Novo with similar effect size on ISI

**Confidence Level**: MODERATE-HIGH
- Strong literature support
- Pilot data consistent
- Conservative relative to some studies but realistic for sham control
```

**Step 2.2: Clinical Justification**

**Prompt 2.2 Executed by**: P01_CMO (Dr. Chen)  
**Time**: 10 minutes

**Output:**

```markdown
# CLINICAL JUSTIFICATION OF EFFECT SIZE
## 3.0-Point PHQ-9 Reduction

**Clinical Meaningfulness Assessment:**

**1. Patient Perspective:**
A 3-point reduction on PHQ-9 represents ~15-20% symptom improvement for patients with moderate depression (baseline PHQ-9 ~15). Patients would notice:
- Slight improvement in mood
- Increased energy for some activities
- Better sleep (if sleep item improves)
- Reduced feelings of worthlessness

While not remission (PHQ-9 <5), this is meaningful progress that keeps patients engaged and motivated.

**2. Clinician Perspective:**
Clinicians recognize 3-point improvement as:
- **Clinically noticeable**: Patient appears somewhat better
- **Step toward response**: Patients on trajectory toward ≥50% reduction (response)
- **Justifies continuation**: Clinicians would continue treatment showing this improvement

**3. MCID Alignment:**
- **Löwe 2004 MCID**: 5 points for individual patient change
- **Population MCID**: 3 points considered meaningful for population-level intervention (Button 2015)
- **Our Target**: 3 points aligns with population MCID

**Achievability Assessment:**

**1. Mechanism Plausibility:**
MindPath CBT uses evidence-based CBT techniques:
- Cognitive restructuring → reduces negative thoughts (PHQ-9 Items 6, 9)
- Behavioral activation → increases activity, energy (PHQ-9 Items 4, 8)
- Sleep hygiene → improves sleep (PHQ-9 Item 3)

Mechanism supports 3-point reduction as realistic.

**2. Pilot Data:**
- N=45 pilot: 3.2-point difference (95% CI: 1.8-4.6)
- p=0.003 (statistically significant)
- Pilot used sham control (same as pivotal)
- **Conclusion**: 3.0 points is achievable

**3. Comparison to Literature:**
- Deprexis (similar intervention): 2.3 points with attention control
- MindPath enhanced features (AI coaching, gamification): Justifies targeting slightly higher (3.0)
- **Realistic but not overly optimistic**

**Regulatory Perspective:**

**FDA Acceptance:**
- FDA precedent: Somryst achieved De Novo with ISI reduction (comparable to PHQ-9)
- 3-point PHQ-9 improvement is clinically significant (above typical 1.5-point placebo response)
- Effect size demonstrates added benefit beyond sham engagement

**Risk Assessment:**
- **If we achieve 3.0 points**: Strong De Novo case
- **If we achieve 2.5 points (17% lower)**: Still clinically meaningful, likely acceptable
- **If we achieve 2.0 points (33% lower)**: Borderline; may need additional evidence

**Final Recommendation:**

✅ **APPROVE 3.0 points as target effect size**

**Confidence**: HIGH
- Supported by literature (weighted mean = 2.9)
- Supported by pilot data (3.2 points)
- Clinically meaningful
- Achievable given our mechanism
- Regulatory precedent

**Proceed to variability estimation.**
```

---

**PHASE 3: VARIABILITY ESTIMATION**

**Prompt 3.1 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 15 minutes

**Output:**

```markdown
# VARIABILITY ESTIMATION
## Standard Deviation for PHQ-9 Change Score

**Literature-Based SD:**

From literature review (same studies as effect size):

| Study | N | SD of Change (PHQ-9) | Population |
|-------|---|---------------------|------------|
| Deprexis | 396 | 5.8 | Moderate MDD |
| MoodGYM | 182 | 6.4 | Mild-Mod MDD |
| Beating Blues | 274 | 5.2 | Moderate MDD |
| This Way Up | 330 | 6.9 | Moderate MDD |
| Wysa | 129 | 5.9 | Mild-Mod MDD |
| SilverCloud | 310 | 5.5 | Moderate MDD |

**Pooled SD Estimate:**

Weighted mean (by sample size):
- Calculation: Σ(N_i × SD_i) / Σ(N_i)
- **Result: SD = 6.0**

**Range**: 5.2 to 6.9  
**Mean**: 5.95 ≈ 6.0

**Pilot Data:**
- N=45
- Observed SD of change: 6.3
- **Consistent with literature** (within range)

**ANCOVA Adjustment:**

Our analysis uses ANCOVA with baseline PHQ-9 as covariate.

**Expected R² (baseline-endpoint correlation):**
- Typical R² for PHQ-9 baseline-endpoint: 0.3 to 0.5
- Conservative assumption: **R² = 0.4**

**Adjusted SD Calculation:**
Formula: SD_adjusted = SD_change × √(1 - R²)

Calculation:
- SD_change = 6.0
- R² = 0.4
- SD_adjusted = 6.0 × √(1 - 0.4)
- SD_adjusted = 6.0 × √0.6
- SD_adjusted = 6.0 × 0.775
- **SD_adjusted = 4.65**

**Conservative Recommendation:**

Use **SD = 5.0** for sample size calculation

**Rationale:**
1. **Conservative**: Slightly higher than adjusted SD (4.65) → provides buffer
2. **Rounds nicely**: 5.0 is clean number, simplifies calculations
3. **Accounts for uncertainty**: Pilot is small (N=45); larger trial may have more variability
4. **Upper bound**: Near upper end of literature-adjusted range (4.0-4.7)
5. **Regulatory defensibility**: Conservative assumptions more acceptable to FDA

**Sensitivity Check:**
- If true SD = 4.5: Trial will be slightly over-powered (good)
- If true SD = 5.5: Trial will be slightly under-powered (acceptable)
- If true SD = 6.0 (unadjusted): Trial under-powered, but we're using ANCOVA so unlikely

**Final Selection: σ = 5.0**
```

---

**PHASE 4: SAMPLE SIZE CALCULATION**

**Prompt 4.1 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 20 minutes

**Output:**

```markdown
# SAMPLE SIZE CALCULATION
## MindPath CBT Depression Trial

**Given Parameters:**
- Design: Two-arm parallel, superiority, 1:1 allocation
- Primary endpoint: Change in PHQ-9 (continuous)
- Effect size: Δ = 3.0 points
- Standard deviation: σ = 5.0
- Alpha (significance): α = 0.05 (two-sided)
- Power: 1 - β = 0.80 (80%)

**Formula (Two-Sample t-test / ANCOVA):**

For continuous outcome with equal allocation:

n per group = 2 × (Z_α/2 + Z_β)² × σ² / Δ²

Where:
- Z_α/2 = 1.96 (two-sided alpha = 0.05)
- Z_β = 0.84 (power = 0.80)
- σ = 5.0 (standard deviation)
- Δ = 3.0 (effect size, mean difference)

**Hand Calculation:**

Step 1: Calculate (Z_α/2 + Z_β)²
= (1.96 + 0.84)²
= 2.80²
= 7.84

Step 2: Calculate σ² / Δ²
= 5.0² / 3.0²
= 25 / 9
= 2.78

Step 3: Calculate n per group
= 2 × 7.84 × 2.78
= 2 × 21.78
= 43.56
≈ **44 per group**

**Result (Completers):**
- **n per group = 44**
- **Total N = 88**

**Software Verification (R):**

```r
# Two-sample t-test power calculation
power.t.test(delta = 3.0,     # Effect size
             sd = 5.0,          # Standard deviation
             sig.level = 0.05,  # Alpha (two-sided)
             power = 0.80,      # Power
             type = "two.sample",
             alternative = "two.sided")

OUTPUT:
     Two-sample t test power calculation 

              n = 44.0 per group
          delta = 3.0
             sd = 5.0
      sig.level = 0.05
          power = 0.80
    alternative = two.sided
```

✓ **Software result matches hand calculation: n = 44 per group**

**Interpretation:**

To detect a 3-point difference in PHQ-9 change between MindPath CBT and sham control, with 80% power at alpha=0.05 (two-sided), we need **44 completers per group (88 total)**.

This assumes:
- Standard deviation of 5.0
- All participants complete the study (no dropouts)

**Next Step:** Adjust for attrition to determine enrollment target.
```

---

**PHASE 5: ATTRITION ADJUSTMENT**

**Prompt 5.1 Executed by**: P04_BIOSTAT (Dr. Park) + P02_VPCLIN (Dr. Martinez)  
**Time**: 15 minutes

**Output:**

```markdown
# ATTRITION ADJUSTMENT
## MindPath CBT Trial

**Completer Target:**
- n per group (completers): 44
- Total N (completers): 88

**Historical Attrition Data:**

Literature review of depression DTx trials (12-week duration):

| Study | Duration | Intervention | Attrition Rate | Primary Reason |
|-------|----------|--------------|----------------|----------------|
| Deprexis | 9 weeks | Web CBT | 18% | Lost to follow-up |
| MoodGYM | 12 weeks | Web CBT | 24% | Lack of engagement |
| Beating Blues | 8 weeks | CBT App | 15% | Symptom worsening |
| This Way Up | 10 weeks | Online CBT | 22% | Withdrew consent |
| Wysa | 8 weeks | AI Chatbot | 28% | Technical issues |
| SilverCloud | 8 weeks | iCBT | 19% | Withdrew consent |

**Range**: 15% to 28%  
**Mean**: 21%  
**Median**: 20%

**Trial-Specific Factors:**

**Our Trial Characteristics:**
- **Duration**: 12 weeks (moderate length)
- **Population**: Moderate MDD (not severe → lower risk of worsening/hospitalization)
- **Intervention**: Fully remote, app-based (slightly higher dropout than in-person)
- **Comparator**: Sham app (both arms have similar burden → balanced attrition)

**Retention Strategies (MindPath):**
1. **Engagement Features:**
   - Daily mood tracking with streaks (gamification)
   - Progress visualization (motivating)
   - Push notifications (gentle reminders)
   
2. **Human Touch-Points:**
   - Weekly automated check-ins (chatbot)
   - Bi-weekly human coach calls (retention focus)
   
3. **Financial Incentive:**
   - $100 Amazon gift card for completing week 12 assessment
   - Graduated incentives ($25 at week 6, $75 at week 12)
   
4. **Flexible Scheduling:**
   - ±3 day visit windows for assessments
   - Virtual visits (no travel burden)

**VP Clinical Development Assessment (Dr. Martinez):**

"Given our robust retention plan, I believe we can achieve **20-22% attrition**. However, for sample size planning, I recommend assuming **25% attrition** to provide a safety buffer. This is conservative but prudent."

**Selected Attrition: 25%**

**Rationale:**
- Conservative (above historical mean of 21%)
- Provides buffer for uncertainty
- Accounts for potential operational challenges in larger trial (vs. pilot N=45)
- Standard for depression trials of this duration

**Enrollment Target Calculation:**

Formula:
n_enrollment = n_completers / (1 - attrition_rate)

Calculation:
- Completers needed: 44 per group
- Attrition rate: 25% = 0.25
- n_enrollment = 44 / (1 - 0.25)
- n_enrollment = 44 / 0.75
- n_enrollment = **58.67 ≈ 59 per group**

**Result:**
- **Enrollment target: 59 per group**
- **Total enrollment: 118**

**Check:**
- Enroll: 59
- Dropout (25%): 59 × 0.25 = 14.75 ≈ 15
- Completers: 59 - 15 = 44 ✓ (matches target)

**Final Recommendation:**

**Enroll N = 59 per group (118 total) to achieve 44 completers per group (88 total)**

Assuming 25% attrition, this enrollment target provides 80% power to detect 3-point difference.
```

---

**PHASE 6: SENSITIVITY ANALYSES**

**Step 6.1: Effect Size Sensitivity**

**Prompt 6.1 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 10 minutes

**Output:**

```markdown
# SENSITIVITY ANALYSIS: EFFECT SIZE
## Impact on Power and Sample Size

**Base Case:**
- Effect: 3.0 points
- SD: 5.0
- Power: 80%
- N: 59 per group (118 total enrollment)

**Sensitivity Scenarios:**

| Scenario | Effect Size | Required N/group (80% power) | Power with N=59 | Interpretation |
|----------|-------------|------------------------------|-----------------|----------------|
| -20% | 2.4 points | 92 | **66%** | ⚠️ **AT RISK**: Under-powered if effect is 20% lower |
| -10% | 2.7 points | 68 | 74% | Marginal: Acceptable but not ideal |
| **Base** | **3.0 points** | **59** | **80%** | ✓ As planned |
| +10% | 3.3 points | 49 | 87% | Over-powered: Could reduce N but conservative is safer |
| +20% | 3.6 points | 43 | 92% | Substantially over-powered |

**Detailed Calculations:**

**Scenario 1: Effect = 2.4 points (-20%)**
- n = 2 × (1.96 + 0.84)² × 5² / 2.4²
- n = 2 × 7.84 × 25 / 5.76
- n = 68.0 → **68 per group** (for 80% power)
- **With N=59**: Power = 66% (use online calculator or R)

**Scenario 2: Effect = 2.7 points (-10%)**
- n = 2 × 7.84 × 25 / 7.29 = 53.8 → **54 per group**
- **With N=59**: Power = 74%

**Scenario 3: Effect = 3.3 points (+10%)**
- n = 2 × 7.84 × 25 / 10.89 = 36.0 → **36 per group**
- **With N=59**: Power = 87%

**Interpretation:**

**Risk Assessment:**
1. **Main Risk**: If true effect is 2.4 points (20% lower than expected), power drops to 66%
   - **Implication**: ~34% chance of false negative (missing true effect)
   - **Magnitude**: This is material risk

2. **Moderate Risk**: If effect is 2.7 points (10% lower), power = 74%
   - **Implication**: Acceptable but not ideal
   - **Magnitude**: Minor risk

3. **Robustness**: Power remains >70% across -10% to +20% range
   - **Conclusion**: Reasonably robust, but vulnerable to larger deviations

**Mitigation Options:**

**Option A: Increase Sample Size to 92/group (184 total)**
- **Pro**: Ensures 80% power even if effect is 20% lower
- **Con**: +68 participants = +$340K budget, +2-3 months enrollment
- **Recommendation**: ❌ **Not recommended** - too expensive for hypothetical scenario

**Option B: Accept Risk (Proceed with N=59)**
- **Pro**: No additional cost or timeline
- **Con**: If effect is lower, trial may fail (66% power)
- **Recommendation**: ✅ **Acceptable** - Pilot data supports 3.0 effect; 20% reduction unlikely

**Option C: Adaptive Design with Interim Analysis**
- **Pro**: Monitor effect size at 50% enrollment; adjust N if needed
- **Con**: Complexity, FDA coordination
- **Recommendation**: ✓ **Consider** - Good middle ground

**Final Recommendation:**

**Proceed with N=59/group (base case), with interim futility analysis at 50% enrollment (N=59 total)**
- At interim, if observed effect is <2.0 points, consider stopping for futility
- If effect is 2.0-2.5 points, discuss increasing N with sponsor/DSMB
- If effect is >2.5 points, continue as planned

This balances cost/timeline with statistical rigor.
```

**Step 6.2: Variability (SD) Sensitivity**

**Prompt 6.2 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 10 minutes

**Output:**

```markdown
# SENSITIVITY ANALYSIS: VARIABILITY (SD)
## Impact on Power and Sample Size

**Base Case:**
- Effect: 3.0 points
- SD: 5.0
- N: 59 per group

**Sensitivity Scenarios:**

| Scenario | SD | Required N/group (80% power) | Power with N=59 | Interpretation |
|----------|-----|------------------------------|-----------------|----------------|
| -20% | 4.0 | 38 | 93% | Over-powered (good buffer) |
| -10% | 4.5 | 48 | 86% | Slightly over-powered |
| **Base** | **5.0** | **59** | **80%** | ✓ As planned |
| +10% | 5.5 | 72 | 74% | Slightly under-powered |
| +20% | 6.0 | 85 | **69%** | ⚠️ **AT RISK** |

**Detailed Calculations:**

**Scenario 1: SD = 4.0 (-20%)**
- n = 2 × 7.84 × 16 / 9 = 27.9 → **28 per group**
- **With N=59**: Power = 93% (over-powered)

**Scenario 2: SD = 4.5 (-10%)**
- n = 2 × 7.84 × 20.25 / 9 = 35.3 → **36 per group**
- **With N=59**: Power = 86%

**Scenario 3: SD = 5.5 (+10%)**
- n = 2 × 7.84 × 30.25 / 9 = 52.7 → **53 per group**
- **With N=59**: Power = 74%

**Scenario 4: SD = 6.0 (+20%)**
- n = 2 × 7.84 × 36 / 9 = 62.7 → **63 per group**
- **With N=59**: Power = 69%

**Interpretation:**

**Risk Assessment:**
1. **Main Risk**: If true SD is 6.0 (20% higher), power drops to 69%
   - **Likelihood**: LOW - our SD estimate (5.0) is already conservative (upper end of adjusted literature range: 4.0-4.7)
   - **Implication**: If SD is 6.0, we're not using ANCOVA effectively OR population more heterogeneous than expected

2. **Robustness**: Power remains >74% across -10% to +10% SD range
   - **Conclusion**: Reasonably robust to moderate deviations

**Why SD=6.0 Scenario is Unlikely:**

1. **Literature**: Pooled SD of change = 6.0 (unadjusted)
2. **ANCOVA Adjustment**: We expect R²=0.4 → Adjusted SD = 4.65
3. **Our Assumption**: SD = 5.0 (already conservative, higher than 4.65)
4. **For SD to be 6.0**: ANCOVA would have to provide NO variance reduction (R²=0) → very unlikely

**Conclusion:**

**SD sensitivity is ACCEPTABLE**
- Selected SD = 5.0 is conservative (upper end of expected range)
- Even if SD 10% higher (5.5), power = 74% (acceptable)
- SD 20% higher (6.0) is unlikely given ANCOVA adjustment

**No action needed** - base case N=59 is robust to plausible SD variations.
```

**Step 6.3: Attrition Sensitivity**

**Prompt 6.3 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 5 minutes

**Output:**

```markdown
# SENSITIVITY ANALYSIS: ATTRITION
## Impact on Enrollment Target

**Base Case:**
- Completers needed: 44 per group
- Assumed attrition: 25%
- Enrollment target: 59 per group (118 total)

**Sensitivity Scenarios:**

| Attrition Rate | Enrollment/group | Total Enrollment | Change from Base | Budget Impact |
|----------------|------------------|------------------|------------------|---------------|
| 15% | 52 | 104 | -14 (-12%) | -$70K |
| 20% | 55 | 110 | -8 (-7%) | -$40K |
| **25% (Base)** | **59** | **118** | - | - |
| 30% | 63 | 126 | +8 (+7%) | +$40K |
| 35% | 68 | 136 | +18 (+15%) | +$90K |

**Calculations:**

**15% Attrition:**
- n = 44 / (1 - 0.15) = 44 / 0.85 = 51.8 → **52 per group**

**20% Attrition:**
- n = 44 / 0.80 = **55 per group**

**30% Attrition:**
- n = 44 / 0.70 = **63 per group**

**35% Attrition:**
- n = 44 / 0.65 = 67.7 → **68 per group**

**Interpretation:**

**Scenario 1: Better Retention (15-20%)**
- **Outcome**: Need fewer participants (104-110 vs 118)
- **Impact**: Cost savings ($40-70K), faster enrollment
- **Likelihood**: MODERATE - if retention plan is very effective

**Scenario 2: Worse Retention (30-35%)**
- **Outcome**: Need more participants (126-136 vs 118)
- **Impact**: Cost increase ($40-90K), longer enrollment (+1-2 months)
- **Likelihood**: LOW-MODERATE - if retention plan underperforms

**Mitigation Strategy:**

**Monitor Attrition Closely:**
- Track actual attrition weekly
- **Trigger**: If attrition reaches 30% by month 3 (25% expected)
- **Action**: 
  1. Increase retention efforts (more frequent calls, higher incentive)
  2. Add 2-3 sites to accelerate enrollment
  3. Adjust budget for +8 participants (+$40K)

**Contingency Budget:**
- Plan for 25% attrition (N=118) in base budget
- Hold $50K contingency for potential 30% attrition scenario

**Conclusion:**

**25% attrition assumption is reasonable**
- Provides buffer over historical mean (21%)
- Accounts for operational variability
- Allows for slight underperformance without major impact

**No change to enrollment target (N=118)** - but plan for close monitoring.
```

---

**PHASE 7: FEASIBILITY & FINALIZATION**

**Step 7.1: Recruitment Feasibility**

**Prompt 7.1 Executed by**: P02_VPCLIN (Dr. Martinez)  
**Time**: 15 minutes

**Output:**

```markdown
# RECRUITMENT FEASIBILITY ASSESSMENT
## MindPath CBT Trial (N=118)

**Enrollment Target:**
- Total N: 118 participants (59 per arm)
- Duration: 12 months (enrollment window)
- Sites: 10 sites (planned)

**Site Capacity Analysis:**

**Site Network:**
- 10 sites: Mix of academic medical centers (3) and community mental health clinics (7)
- Geographic distribution: 3 Northeast, 3 Midwest, 2 South, 2 West Coast
- Prior DTx trial experience: 6 sites have participated in digital health trials

**Expected Enrollment Rate:**
- **Conservative estimate**: 1.5 participants/site/month
- **Moderate estimate**: 2.0 participants/site/month (base case)
- **Optimistic estimate**: 2.5 participants/site/month

**Capacity Calculation (Base Case):**
- Sites: 10
- Rate: 2 participants/site/month
- Total monthly enrollment: 10 × 2 = **20 participants/month**
- Total capacity (12 months): 20 × 12 = **240 participants**
- Target: 118
- **Capacity utilization**: 118 / 240 = 49% → ✅ **WELL WITHIN CAPACITY**

**Screen-to-Enroll Ratio:**
- Expected ratio: **2:1** (based on pilot and depression trials)
- Total screens needed: 118 × 2 = **236 screens**
- Screening rate: 4 screens/site/month
- Screening capacity: 10 sites × 4 × 12 months = **480 screens**
- **Sufficient? YES** (480 > 236)

**Enrollment Timeline Scenarios:**

**Scenario 1: Base Case (2/site/month)**
- Monthly enrollment: 20
- Time to complete: 118 / 20 = **5.9 months**
- **Enrollment complete: Month 6**
- **Last patient last visit**: Month 6 + 3 months (treatment + follow-up) = **Month 9**
- **Total trial duration**: ~10 months (including startup)

**Scenario 2: Conservative (1.5/site/month)**
- Monthly enrollment: 15
- Time to complete: 118 / 15 = **7.9 months**
- **Enrollment complete: Month 8**
- **LPLV**: Month 11
- **Total duration**: ~12 months

**Scenario 3: Optimistic (2.5/site/month)**
- Monthly enrollment: 25
- Time to complete: 118 / 25 = **4.7 months**
- **Enrollment complete: Month 5**
- **LPLV**: Month 8
- **Total duration**: ~9 months

**Recruitment Channels:**

**Primary Channels:**
1. **Clinician Referrals** (40% expected)
   - Psychiatrists, PCPs at partner sites
   - Screening in clinic, digital enrollment
   
2. **Online Advertising** (35% expected)
   - Facebook/Instagram ads targeting depression
   - Google search ads
   - Mental health forums (Reddit r/depression, 7 Cups)
   
3. **Patient Registries** (15% expected)
   - Trial site patient registries
   - ResearchMatch.org
   
4. **Community Partnerships** (10% expected)
   - NAMI chapters
   - Depression and Bipolar Support Alliance (DBSA)

**Budget Allocation:**
- Digital advertising: $50K (Facebook, Google)
- Site activation: $150K ($15K/site)
- Patient incentives: $11.8K (118 × $100 completion bonus)
- **Total recruitment budget**: ~$210K

**Risk Assessment:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slow enrollment (1.5/site/month) | MEDIUM | MEDIUM | Add 2-3 backup sites in month 2 |
| Higher screen-fail rate (3:1) | LOW | LOW | Increase ad spend by $10K |
| Site startup delays | MEDIUM | LOW | Stagger site activation (start with 5 sites) |
| Competing trials | LOW | MEDIUM | Survey sites for competing studies |

**Feasibility Triggers:**

**Green Light** (Proceed): If by Month 2, ≥30 participants enrolled (on track)  
**Yellow Light** (Monitor): If by Month 2, 20-29 enrolled (slower than expected)  
**Red Light** (Escalate): If by Month 2, <20 enrolled (add sites, increase budget)

**Final Feasibility Assessment:**

✅ **ENROLLMENT IS FEASIBLE**

**Recommendation: APPROVE N=118**

**Justification:**
- Capacity (240) exceeds target (118) by 2×
- Base case enrollment completes in **6 months** (within budget and timeline)
- Even worst case (8 months) is acceptable
- Strong site network with DTx experience
- Multiple recruitment channels reduce dependency on any single source

**Confidence Level**: HIGH
```

**Step 7.2: Final Justification Document**

**Prompt 7.2 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 25 minutes

**Output:**

[*This is a 7-page document. Key sections excerpted below:*]

```markdown
# SAMPLE SIZE JUSTIFICATION
## MindPath CBT Pivotal Trial for Major Depressive Disorder

**Date**: October 10, 2025  
**Protocol**: MindPath-MDD-001  
**Prepared by**: Dr. Lisa Park, Lead Biostatistician

---

## 1. EXECUTIVE SUMMARY

**Study Design:**
- Randomized, double-blind, sham-controlled, parallel-group, superiority trial
- 2 arms (1:1 allocation): MindPath CBT vs Sham app
- Primary endpoint: Change in PHQ-9 (baseline to week 12), continuous
- Primary analysis: ANCOVA (baseline PHQ-9 covariate)

**Sample Size Recommendation:**

**ENROLL 59 PARTICIPANTS PER GROUP (118 TOTAL)**

**Completers: 44 per group (88 total)**  
**Power: 80%**  
**Key Assumptions:**
- Effect size: 3.0-point greater reduction (MindPath vs Sham)
- Variability: SD = 5.0
- Attrition: 25%

---

## 2. STUDY OBJECTIVES

**Primary Objective:**
To evaluate the efficacy of MindPath CBT compared to sham app in reducing depressive symptoms in adults with moderate Major Depressive Disorder over 12 weeks.

**Hypotheses:**
- **H0**: MindPath CBT produces no greater reduction in PHQ-9 than sham app (Δ = 0)
- **H1**: MindPath CBT produces greater reduction in PHQ-9 than sham app (Δ ≠ 0)

**Statistical Test:**
- ANCOVA (baseline PHQ-9 as covariate)
- Alpha: 0.05 (two-sided)
- Power: 0.80

---

## 3. EFFECT SIZE ESTIMATION

[*Includes full literature review table and clinical justification from Phases 2.1 and 2.2*]

**Selected Effect Size: 3.0 points**

**Confidence: HIGH**

---

## 4. VARIABILITY ESTIMATION

[*Includes SD analysis from Phase 3*]

**Selected SD: 5.0**

---

## 5. SAMPLE SIZE CALCULATION

**Formula:**
n per group = 2 × (Z_α/2 + Z_β)² × σ² / Δ²

**Calculation:**
n = 2 × (1.96 + 0.84)² × 5² / 3²
n = 2 × 7.84 × 25 / 9
n = 43.56 → **44 per group**

**Software Verification (R):**
```r
power.t.test(delta=3.0, sd=5.0, sig.level=0.05, power=0.80)
# Output: n = 44 per group ✓
```

**Completers: 44 per group, 88 total**

---

## 6. ATTRITION ADJUSTMENT

**Historical Attrition**: 15-28% (mean 21%)  
**Assumed Attrition**: 25% (conservative)

**Enrollment Calculation:**
n_enroll = 44 / (1 - 0.25) = 44 / 0.75 = **59 per group**

**Enrollment Target: 59 per group, 118 total**

---

## 7. SENSITIVITY ANALYSES

### 7.1 Effect Size Sensitivity

| Scenario | Effect | Power with N=59 | Interpretation |
|----------|--------|-----------------|----------------|
| -20% | 2.4 | 66% | AT RISK |
| -10% | 2.7 | 74% | Acceptable |
| Base | 3.0 | 80% | As planned |
| +10% | 3.3 | 87% | Over-powered |

**Conclusion**: Reasonably robust; vulnerable to >20% reduction

### 7.2 Variability Sensitivity

[*Table from Phase 6.2*]

**Conclusion**: Robust across plausible SD range

### 7.3 Attrition Sensitivity

[*Table from Phase 6.3*]

**Conclusion**: 25% assumption appropriate; monitor closely

---

## 8. RECRUITMENT FEASIBILITY

[*From Phase 7.1*]

**Assessment**: ✅ **FEASIBLE**
- Capacity: 240 > Target: 118
- Expected timeline: 6 months enrollment
- Confidence: HIGH

---

## 9. FINAL RECOMMENDATION

**ENROLL N = 59 PER GROUP (118 TOTAL) TO ACHIEVE 80% POWER**

**Justification:**
This sample size provides 80% power to detect a clinically meaningful 3-point difference in PHQ-9 change between MindPath CBT and sham control, assuming conservative variability (SD=5.0) and attrition (25%). The calculation is supported by:
1. Literature meta-analysis (8 studies, weighted mean effect = 2.9 points)
2. Pilot data (N=45, observed effect = 3.2 points)
3. Clinical meaningfulness (exceeds population-level MCID)
4. Regulatory precedent (similar DTx achieved FDA clearance)
5. Sensitivity analyses demonstrate acceptable robustness
6. Recruitment feasibility confirmed (6-month enrollment)

**Approvals:**

Lead Biostatistician: _________________ Date: _______  
Chief Medical Officer: _________________ Date: _______  
VP Clinical Development: _______________ Date: _______

---

## 10. REFERENCES

1. Löwe B, et al. Responsiveness of the PHQ-9. Psychosomatics. 2004.
2. Meyer B, et al. Deprexis effectiveness. Eur Psychiatry. 2015.
3. [Additional 8 references from literature review]

---

## 11. APPENDICES

**Appendix A**: Full Literature Review  
**Appendix B**: R Code for Sample Size  
**Appendix C**: Sensitivity Analysis Details
```

**Dr. Chen (CMO) Review**: ✅ APPROVED  
**Dr. Martinez (VP Clinical Development) Review**: ✅ APPROVED  
**Tom Wilson (Regulatory) Review**: ✅ APPROVED - FDA acceptable

---

**Step 7.3: Executive Summary**

**Prompt 7.3 Executed by**: P04_BIOSTAT (Dr. Park)  
**Time**: 10 minutes

**Output:**

```markdown
# SAMPLE SIZE EXECUTIVE SUMMARY
## MindPath CBT Depression Trial

**Date**: October 10, 2025  
**Prepared by**: Dr. Lisa Park, Lead Biostatistician

---

### RECOMMENDATION

**Enroll 59 participants per group (118 total) to achieve 80% power.**

---

### KEY ASSUMPTIONS

| Parameter | Value | Source |
|-----------|-------|--------|
| **Primary Endpoint** | Change in PHQ-9 (baseline to week 12) | Protocol |
| **Expected Benefit** | 3.0 points greater reduction vs. sham | Literature (8 studies) + Pilot |
| **Population Variability** | SD = 5.0 | Literature, adjusted for ANCOVA |
| **Statistical Power** | 80% | Industry standard |
| **Dropout Rate** | 25% | Historical depression DTx trials |

---

### SENSITIVITY & RISK

**Robust Scenarios:**
- Power remains 74% even if effect is 10% smaller (2.7 points)
- Power remains >69% even if SD is 20% higher (6.0)

**Key Risks:**
- If effect is 20% lower (2.4 points): Power = 66% (under-powered)
- If dropout exceeds 30%: Need +8 participants/group

**Mitigation:**
- Pilot data supports 3.0-point effect (observed: 3.2)
- Strong retention plan ($100 incentive, weekly check-ins)
- Interim futility analysis at 50% enrollment

---

### FEASIBILITY

**Enrollment Timeline:**
- Target: 118 participants
- Duration: 6 months (base case), up to 8 months (conservative)
- Rate: 2 participants/site/month
- Sites: 10 sites (academic + community)

**Conclusion:** ✅ **FEASIBLE** (Capacity = 2× target)

---

### BUDGET IMPACT

- Participants: 118 × $5K = $590K
- Sites: 10 × $15K = $150K
- Recruitment (ads, registries): $50K
- **Total trial cost: ~$1.2M** (within budget)

---

### NEXT STEPS

1. ✅ **Biostatistician**: Sample size justified (complete)
2. ✅ **CMO Approval**: 3-point effect clinically meaningful (approved)
3. ✅ **VP Clinical Approval**: N=118 feasible (approved)
4. **CFO Approval**: Budget for $1.2M trial (pending)
5. **Protocol Finalization**: Incorporate sample size section (in progress)
6. **CRO Contract**: Finalize site agreements (next week)

---

**Questions?** Contact: lisa.park@mindpathdtx.com

---

**APPROVED FOR PIVOTAL TRIAL**

✅ Dr. Sarah Chen, CMO - October 10, 2025  
✅ Dr. Lisa Park, Lead Biostatistician - October 10, 2025  
✅ Dr. James Martinez, VP Clinical Development - October 10, 2025
```

---

### 6.3 Final Outcome Summary

**Final Sample Size Decision: N=118 (59 per arm)**

**Timeline to Decision**: 2.5 hours  
**Cost to Execute**: ~$3K (team time)  
**Trial Cost Impact**: $1.2M (within budget)

**Key Success Factors:**
1. **Strong Literature Foundation**: 8 high-quality RCTs provided robust effect size estimate
2. **Pilot Data Confirmation**: N=45 pilot supported 3.0-point effect
3. **Conservative Assumptions**: SD=5.0 and 25% attrition provided safety buffer
4. **Feasibility Validation**: 10-site network with 2× capacity ensured recruitment success
5. **Stakeholder Alignment**: CMO, Biostat, Clinical Ops, and Regulatory all approved

**Trial Launch**: Proceeds to enrollment (6-month target)

---

## 7. HOW-TO IMPLEMENTATION GUIDE

### 7.1 Getting Started

**Prerequisites:**
- Primary endpoint selected (completed in UC_CD_001)
- Trial design finalized (completed in UC_CD_003)
- Statistical analysis plan outlined (at least primary analysis method)

**Step 0: Assemble Team (15 minutes)**
- Lead Biostatistician (MUST)
- CMO or VP Clinical Development (MUST)
- Regulatory Affairs (for review)
- Clinical Operations (for feasibility)

**Step 1: Gather Inputs (30 minutes)**

Collect:
1. **Primary Endpoint Details**
   - Endpoint name and type (continuous, binary, time-to-event)
   - Measurement instrument
   - Analysis method (t-test, ANCOVA, chi-square, log-rank)
   
2. **Literature Database Access**
   - PubMed
   - ClinicalTrials.gov
   - Prior trial reports (if available)
   
3. **Pilot Data (if available)**
   - Effect size observed
   - Variability (SD, proportions)
   - Attrition rate
   
4. **Statistical Software**
   - R (free): Install + load `pwr` package
   - SAS (if available)
   - PASS, G*Power, or nQuery (if available)
   - Excel (for sensitivity tables)

**Step 2: Execute Workflow (2-3 hours)**

Follow the 7-step workflow in Section 5:
- **Steps 1-3**: Can be done in parallel (Biostat + CMO)
- **Steps 4-6**: Sequential (Biostat)
- **Step 7**: Collaborative (Biostat + Ops + Regulatory)

**Step 3: Prepare Deliverables (1 hour)**
- Sample size justification document (5-8 pages for protocol)
- Executive summary (1 page for stakeholders)
- Sensitivity analysis tables (for FDA)

---

### 7.2 Common Pitfalls to Avoid

**Pitfall #1: Using Overly Optimistic Effect Size**
- **Problem**: Basing effect on best-case study or pilot with small N
- **Consequence**: Under-powered trial
- **Solution**: Use weighted mean of multiple studies; assume pilot may overestimate

**Pitfall #2: Ignoring ANCOVA Benefits**
- **Problem**: Calculating sample size for t-test when using ANCOVA
- **Consequence**: Over-powered trial (waste of money)
- **Solution**: Adjust SD for expected R² from baseline covariate

**Pitfall #3: Assuming Unrealistic Attrition**
- **Problem**: Assuming 10-15% attrition for 12-week fully remote trial
- **Consequence**: Under-enrollment, trial under-powered
- **Solution**: Use historical data; be conservative (20-25% safer)

**Pitfall #4: Skipping Sensitivity Analyses**
- **Problem**: Only calculating base case, no "what if" scenarios
- **Consequence**: No plan if assumptions don't hold
- **Solution**: ALWAYS test effect size ±20%, SD ±20%, attrition ±5-10%

**Pitfall #5: Not Validating Feasibility**
- **Problem**: Calculating N without checking recruitment capacity
- **Consequence**: Infeasible trial (can't recruit in time/budget)
- **Solution**: Involve Clinical Operations early (Step 7.1)

---

### 7.3 Time-Saving Tips

**Tip #1: Use Template Literature Tables**
- Pre-built Excel template for extracting study data (effect, SD, N, attrition)
- Speeds up Prompt 2.1 from 30 minutes to 15 minutes

**Tip #2: R Script for Sensitivity**
- Write R script once, re-use for all sensitivity scenarios
- Example script:
```r
# Sensitivity function
calc_power <- function(delta, sd, n, alpha=0.05) {
  power.t.test(delta=delta, sd=sd, n=n, sig.level=alpha)$power
}

# Test scenarios
deltas <- c(2.4, 2.7, 3.0, 3.3, 3.6)
sapply(deltas, function(d) calc_power(d, sd=5.0, n=59))
```

**Tip #3: Use AI for Literature Search**
- Use Claude/ChatGPT to quickly identify relevant studies
- Prompt: "Find RCTs for [indication] using [endpoint] published 2010-2025"
- Then manually extract data from identified papers

**Tip #4: Pre-Approve Assumptions with CMO**
- Brief 15-minute call with CMO before starting calculations
- Get buy-in on effect size and clinical meaningfulness
- Avoids rework if CMO disagrees later

---

### 7.4 When to Involve External Consultants

**Consult CRO Biostatistician:**
- Complex multi-arm designs (>2 arms)
- Time-to-event endpoints (survival analysis)
- Adaptive designs with sample size re-estimation
- If internal biostat expertise is limited

**Consult Regulatory Specialist:**
- FDA has previously questioned similar trials' sample sizes
- Novel endpoint without regulatory precedent
- Non-inferiority trial (requires non-inferiority margin justification)
- High-risk submission (Breakthrough Device, Expedited)

**Consult Health Economist:**
- If sample size drives budget beyond company capacity
- Need cost-effectiveness model to justify larger N
- Payer negotiations require specific statistical power for secondary endpoints

---

## 8. SUCCESS METRICS & VALIDATION CRITERIA

### 8.1 Sample Size Quality Checklist

Use this checklist to validate your sample size justification:

**Statistical Rigor:**
- [ ] Power ≥ 80% (or 90% if specified)
- [ ] Alpha = 0.05 (two-sided) or justified if different
- [ ] Effect size based on ≥2 sources (literature + pilot, or multiple studies)
- [ ] Variability (SD/proportions) based on literature or pilot
- [ ] Attrition assumption justified by historical data
- [ ] Sensitivity analyses conducted (effect ±20%, SD ±20%, attrition ±10%)
- [ ] Software verification performed (hand calc matches R/SAS)

**Clinical Validity:**
- [ ] Effect size is clinically meaningful (exceeds MCID if available)
- [ ] CMO or clinical lead has approved effect size assumption
- [ ] Population characteristics match literature studies used for estimation
- [ ] Endpoint aligns with regulatory expectations (FDA guidance)

**Operational Feasibility:**
- [ ] Enrollment target achievable within timeline (capacity > target)
- [ ] Budget accommodates sample size (cost per participant × N)
- [ ] Attrition assumption has retention plan to support it
- [ ] Site network capacity validated (# sites × rate × time ≥ target)

**Regulatory Acceptability:**
- [ ] Sample size justification follows ICH E9 guidance structure
- [ ] Assumptions documented and referenced (literature citations)
- [ ] Sensitivity analyses show robustness to deviations
- [ ] Regulatory Affairs has reviewed and approved

**Documentation Completeness:**
- [ ] Sample size justification document (5-8 pages) complete
- [ ] Executive summary (1 page) prepared for stakeholders
- [ ] Appendices include literature review, software code, sensitivity details
- [ ] Approval signatures obtained (Biostat, CMO, VP Clinical Dev)

---

### 8.2 Red Flags (When to Reconsider)

**🚩 RED FLAG #1: Power < 70% in Worst-Case Sensitivity**
- **Issue**: If effect is 20% lower, power drops below 70%
- **Action**: Increase N OR accept higher risk with documented rationale

**🚩 RED FLAG #2: Enrollment Target > Site Capacity**
- **Issue**: Required N exceeds what sites can recruit in timeline
- **Action**: Add more sites OR extend enrollment period OR reduce N (accept lower power)

**🚩 RED FLAG #3: Budget Insufficient for Sample Size**
- **Issue**: N × cost per participant > available budget
- **Action**: Seek additional funding OR reduce N (lower power) OR find cheaper CRO

**🚩 RED FLAG #4: CMO Questions Clinical Meaningfulness**
- **Issue**: CMO believes effect size is too small to matter clinically
- **Action**: Re-evaluate endpoint OR target larger effect (accept under-power risk) OR change trial design

**🚩 RED FLAG #5: FDA Precedent Shows Higher N Required**
- **Issue**: Similar DTx trials used N=200+, but you calculated N=100
- **Action**: Investigate discrepancy (different endpoint? lower power?) OR increase N to match precedent

---

### 8.3 Validation by External Experts

**When to Seek External Validation:**
- High-stakes trial (pivotal for FDA approval)
- Novel indication (no clear precedent)
- Board/investors require independent review
- Regulatory agency (FDA) has questioned prior sample sizes

**Who to Consult:**
- Academic biostatistician (PhD, 10+ years experience in clinical trials)
- Former FDA reviewer (CDRH biostatistician)
- CRO lead statistician

**Validation Deliverable:**
- Letter of support (1-2 pages)
- Statement: "I have reviewed the sample size justification for [Trial Name] and find the assumptions, calculations, and sensitivity analyses to be scientifically sound and statistically rigorous. The proposed sample size of N=[X] is adequate to achieve the study objectives."
- Signature + credentials

---

## 9. TROUBLESHOOTING & COMMON ISSUES

### 9.1 Issue: Literature Shows Wide Range of Effect Sizes

**Symptom**: Literature studies show effect ranging from 1.5 to 6.0 points

**Diagnosis**: Heterogeneous studies (different populations, interventions, comparators)

**Solution:**
1. **Stratify by Comparator Type**: Separate waitlist vs. sham vs. TAU studies
2. **Focus on Most Similar**: Identify 3-5 studies most comparable to your trial
3. **Use Conservative Estimate**: Select effect from lower end of range (or weighted mean)
4. **Plan Sensitivity**: Test power under multiple effect scenarios (2.0, 3.0, 4.0)

**Example**: If literature shows 1.5-6.0, focus on sham-controlled studies (1.8-2.5 range), target 2.5, test sensitivity at 2.0 and 3.0.

---

### 9.2 Issue: No Pilot Data Available

**Symptom**: Company has not conducted pilot study; relying solely on literature

**Diagnosis**: Higher uncertainty in effect size estimate

**Solution:**
1. **Increase Sample Size Buffer**: Use SD at upper end of literature range
2. **Plan Interim Analysis**: Implement futility check at 50% enrollment
3. **Conservative Effect**: Target effect at 25th percentile of literature (not mean)
4. **Document Risk**: Explicitly state in justification that assumptions have higher uncertainty

**Example**: Literature mean effect = 3.0 (SD), 25th percentile = 2.5. Target 2.5 (more conservative).

---

### 9.3 Issue: Attrition Higher Than Expected Mid-Trial

**Symptom**: At 3 months, attrition is 35% (expected 25%)

**Diagnosis**: Retention strategies under-performing

**Solution:**
1. **Immediate Actions**:
   - Increase completion incentive ($100 → $150)
   - Add more frequent check-ins (weekly → bi-weekly)
   - Identify and address common reasons for dropout
   
2. **Statistical Actions**:
   - Recalculate required enrollment:
     - Original: 44 / 0.75 = 59 per group
     - Revised (35% attrition): 44 / 0.65 = 68 per group
     - **Need +9 participants per group (+18 total)**
   
3. **Operational Actions**:
   - Add 2-3 backup sites to accelerate enrollment
   - Extend enrollment period by 1-2 months
   - Increase advertising budget

**When to Implement**: Trigger if attrition exceeds 30% by Month 3

---

### 9.4 Issue: Interim Analysis Shows Lower Effect Than Expected

**Symptom**: At 50% enrollment (N=59), observed effect = 2.0 points (expected 3.0)

**Diagnosis**: True effect may be lower than assumption

**Solution:**
1. **Assess Confidence Interval**: Is 3.0 still within 95% CI? If yes, continue as planned
2. **Recalculate Power**:
   - Current N=118: Power = 55% at effect=2.0 (under-powered)
   - Needed N for 80% power at effect=2.0: N=198 (99 per group)
   - **Need +40 participants per group (+80 total)**
3. **Decision Points**:
   - **If CI excludes 3.0**: Increase N to 198 OR proceed with lower power (document risk)
   - **If CI includes 3.0**: Continue as planned (interim may be noisy)
4. **Futility Rule**: If effect <1.5 points, consider stopping trial (likely to fail even with more N)

---

### 9.5 Issue: Regulatory Agency Questions Sample Size

**Symptom**: FDA Pre-Sub feedback: "Sample size may be inadequate given limited precedent"

**Diagnosis**: FDA wants higher confidence due to novelty

**Solution:**
1. **Increase Power to 90%** (vs. 80%)
   - Recalculate: n = 2 × (1.96 + 1.28)² × 5² / 3² = 58 per group (completers)
   - Attrition-adjusted: 58 / 0.75 = 77 per group (118 → 154 total)
   
2. **Add Secondary Endpoints** with co-primary analysis
   - Example: PHQ-9 (primary) + Response rate (co-primary)
   - Adjust alpha for multiplicity (0.05 → 0.025 each)
   - May require larger N
   
3. **Conduct Pilot First**: If FDA is skeptical, propose:
   - Pilot (N=60) → Inform pivotal sample size
   - FDA feedback on pilot results → Finalize pivotal N
   
4. **Request FDA Meeting**: Schedule Type C meeting to discuss:
   - Present sensitivity analyses
   - Show literature support
   - Propose interim analysis plan
   - Negotiate acceptable N

---

## 10. FAQS

### 10.1 Statistical FAQs

**Q1: Why use 80% power instead of 90%?**

**A**: 80% is industry standard, balancing statistical rigor with cost/feasibility. 90% power requires ~30% more participants:
- 80% power: n=44 per group
- 90% power: n=58 per group (+14, or +32%)

Use 90% if:
- High-stakes trial (only shot at FDA approval)
- Budget allows
- Regulatory agency requests

**Q2: One-sided vs. two-sided test - which to use?**

**A**: **Two-sided (0.05)** is FDA standard. Use one-sided (0.025) only if:
- FDA explicitly allows (rare)
- Only care if DTx is better (not worse)

Two-sided is safer; FDA typically requires justification for one-sided.

**Q3: How do I adjust for multiple comparisons (secondary endpoints)?**

**A**: For PRIMARY endpoint, no adjustment needed. For KEY secondary endpoints tested for significance, use:
- **Hierarchical testing**: Test in order; stop when first non-significant
- **Bonferroni**: Divide alpha by # tests (0.05 / 3 = 0.0167 each)
- **Hochberg/Holm**: Sequential methods

For EXPLORATORY endpoints: No adjustment (p-values descriptive only)

**Q4: Can I use a smaller N if I find a larger effect in my pilot?**

**A**: **Cautious YES**. Pilot often overestimates effect (small N, noise). Guidelines:
- Use pilot effect size IF pilot N ≥ 50 AND effect is consistent with literature
- If pilot N < 50, average pilot + literature effect
- Always run sensitivity at -20% effect (conservative)

**Q5: What if my endpoint is binary (yes/no) instead of continuous?**

**A**: Use two-proportion formula (see Prompt 4.1). Example:
- Treatment response: 60%
- Control response: 40%
- Difference: 20 percentage points

Formula: n = (Z_α/2 + Z_β)² × [p1(1-p1) + p2(1-p2)] / (p1-p2)²

Binary endpoints typically need larger N than continuous.

---

### 10.2 Clinical FAQs

**Q6: What is MCID and why does it matter?**

**A**: **Minimally Clinically Important Difference (MCID)** = smallest change patients/clinicians notice as meaningful.

**Why it matters**:
- Effect size should ≥ MCID (otherwise clinically irrelevant)
- FDA often references MCID in evaluating clinical significance

**How to find MCID**:
- Published literature (e.g., PHQ-9 MCID = 5 points for individuals, 3 points for populations)
- FDA guidance documents
- Patient surveys / clinician interviews

**Example**: If PHQ-9 MCID = 3, targeting 3.0-point effect is clinically meaningful.

**Q7: Can I use a waitlist control instead of sham to get a larger effect (and smaller N)?**

**A**: **Technically yes, but NOT RECOMMENDED** for DTx. Reasons:
- Waitlist overestimates effect (no control for engagement/expectation)
- FDA increasingly requires sham/attention controls for DTx
- Blinding impossible with waitlist → high bias risk

**Recommendation**: Use sham control, accept smaller effect, larger N. FDA will appreciate rigor.

**Q8: What if my DTx has multiple "doses" (e.g., 4 weeks, 8 weeks, 12 weeks)?**

**A**: This is a **multi-arm design** (3 arms: 4wk, 8wk, 12wk vs. control). Sample size calculation is more complex:
- Need to adjust alpha for multiple comparisons (Dunnett's test)
- May need separate power for each dose vs. control
- Consider **dose-finding study first** (smaller N) to identify best dose, then pivotal with 2 arms

**Recommendation**: For PIVOTAL trial, use 2 arms (optimal dose vs. control). Use dose-finding in Phase 2.

---

### 10.3 Operational FAQs

**Q9: How do I estimate attrition rate if I don't have prior trial data?**

**A**: Use **literature + trial characteristics**:

**Literature Baseline**:
- Depression DTx (8-12 weeks): 15-28% (mean 21%)
- Chronic disease DTx (12-24 weeks): 20-35%
- Acute/short-term (<8 weeks): 10-20%

**Adjust for Your Trial**:
- **Add 5%** if: Fully remote (no in-person visits), high patient burden (frequent assessments), sick population (high severity)
- **Subtract 5%** if: Strong incentive (>$100), high touch (weekly human calls), short duration (<8 weeks)

**Example**: Depression DTx, 12 weeks, fully remote, $100 incentive, weekly calls
- Base (literature): 21%
- Fully remote: +3%
- Strong incentive: -2%
- Weekly calls: -2%
- **Estimate: 20%** (round to 25% for safety)

**Q10: What if I can't recruit the calculated sample size in my timeline/budget?**

**A**: **Options**:

1. **Accept Lower Power**: 
   - Calculate power with feasible N
   - Example: N=80 instead of 118 → Power = 68% (vs. 80%)
   - Document risk: "Higher chance of false negative, but trial still worthwhile"
   
2. **Extend Timeline**:
   - Enrollment period: 6 months → 12 months
   - Add more sites to maintain rate
   
3. **Reduce Effect Size Assumption**:
   - Only works if you're being overly optimistic
   - Example: Target 2.5 points instead of 3.0 → need larger N (but may not help)
   
4. **Change Endpoint**:
   - Switch to binary (response rate) if it requires smaller N
   - Or use composite endpoint (more events = smaller N)

**NOT RECOMMENDED**: 
- ❌ Reducing power below 70% (too risky)
- ❌ Assuming <15% attrition (unrealistic for most DTx)
- ❌ Ignoring sample size calculation (guessing N) - FDA will reject

---

### 10.4 Regulatory FAQs

**Q11: Does FDA review sample size justification in Pre-Sub?**

**A**: **YES** - FDA often provides feedback on:
- Appropriateness of assumptions (effect size, SD, attrition)
- Statistical methods (ANCOVA acceptable?)
- Sensitivity analyses (are they adequate?)
- Comparator choice (sham vs. waitlist)

**Best Practice**: Submit sample size justification as part of Pre-Sub package (3-5 pages). FDA feedback typically comes in 75-90 days.

**Q12: What if FDA says my sample size is "insufficient"?**

**A**: **Clarify and Negotiate**:
1. **Understand Concern**: Is it effect size? Attrition? Power?
2. **Provide Additional Support**: More literature, pilot data, expert opinion
3. **Offer Compromise**: 
   - Increase power to 90%
   - Add secondary endpoints as supportive
   - Propose interim analysis to monitor
4. **Request Meeting**: Type C meeting to discuss in detail

**Example**: "We appreciate FDA's concern. To address, we propose increasing power to 90% (N=154) and adding response rate as key secondary endpoint. We request a Type C meeting to confirm this approach."

**Q13: Can I use Bayesian methods for sample size calculation?**

**A**: **YES, but with caveats**:
- FDA increasingly accepts Bayesian approaches (especially for adaptive trials)
- Requires **prior distribution** specification (where does your belief about effect come from?)
- Requires **operating characteristics** (simulations showing Type I error control)
- More complex to explain to non-statisticians

**Recommendation**: For first DTx trial, stick with frequentist (traditional) methods. Use Bayesian for adaptive designs or rare disease indications.

---

## 11. APPENDICES & RESOURCES

### 11.1 Statistical Formulas Reference

**Continuous Endpoints (Two-Sample t-test / ANCOVA):**

```
n = 2 × (Z_α/2 + Z_β)² × σ² / Δ²

Where:
- n = sample size per group
- Z_α/2 = Z-score for significance level α/2 (two-sided)
  - α = 0.05 → Z_α/2 = 1.96
- Z_β = Z-score for power (1-β)
  - Power = 0.80 → Z_β = 0.84
  - Power = 0.90 → Z_β = 1.28
- σ = standard deviation
- Δ = effect size (mean difference)
```

**Binary Endpoints (Two-Proportion Test):**

```
n = (Z_α/2 + Z_β)² × [p1(1-p1) + p2(1-p2)] / (p1 - p2)²

Where:
- p1 = proportion in treatment group
- p2 = proportion in control group
- Other symbols as above
```

**Attrition Adjustment:**

```
n_enrollment = n_completer / (1 - attrition_rate)

Example:
n_completer = 44
attrition = 25% = 0.25
n_enrollment = 44 / 0.75 = 59
```

**ANCOVA Adjustment (Baseline Covariate):**

```
SD_adjusted = SD_change × √(1 - R²)

Where:
- R² = correlation between baseline and endpoint (typically 0.3-0.5)
- SD_change = standard deviation of change from baseline (unadjusted)
```

---

### 11.2 Software Code Examples

**R Code (pwr package):**

```r
# Install package (once)
install.packages("pwr")

# Load package
library(pwr)

# Continuous endpoint (two-sample t-test)
power.t.test(delta = 3.0,           # Effect size
             sd = 5.0,               # Standard deviation
             sig.level = 0.05,       # Alpha (two-sided)
             power = 0.80,           # Power
             type = "two.sample",    # Two independent groups
             alternative = "two.sided")

# Output: n = 44 per group

# Binary endpoint (two-proportion test)
power.prop.test(p1 = 0.55,          # Treatment proportion
                p2 = 0.35,          # Control proportion
                sig.level = 0.05,    # Alpha (two-sided)
                power = 0.80,        # Power
                alternative = "two.sided")

# Output: n per group

# Sensitivity analysis (loop over effect sizes)
effects <- c(2.4, 2.7, 3.0, 3.3, 3.6)
results <- sapply(effects, function(d) {
  power.t.test(delta = d, sd = 5.0, n = 59, sig.level = 0.05)$power
})

# Create table
data.frame(Effect = effects, Power = round(results, 3))
```

**SAS Code (PROC POWER):**

```sas
/* Continuous endpoint */
proc power;
  twosamplemeans test = diff
  meandiff = 3.0              /* Effect size */
  stddev = 5.0                /* Standard deviation */
  alpha = 0.05                /* Significance level */
  power = 0.80                /* Power */
  ntotal = .;                 /* Calculate sample size */
run;

/* Output: ntotal = 88 (44 per group) */

/* Binary endpoint */
proc power;
  twosamplefreq test = pchi
  groupproportions = (0.35 0.55)  /* Control, Treatment */
  alpha = 0.05
  power = 0.80
  npergroup = .;                  /* Calculate n per group */
run;

/* Sensitivity analysis */
proc power;
  twosamplemeans test = diff
  meandiff = 2.4 to 3.6 by 0.3    /* Range of effects */
  stddev = 5.0
  npergroup = 59                  /* Fixed N */
  alpha = 0.05
  power = .;                      /* Calculate power */
run;
```

**Excel Formula (Continuous):**

```
Cell A1: Effect size (Δ) = 3.0
Cell A2: SD (σ) = 5.0
Cell A3: Z_α/2 = 1.96
Cell A4: Z_β = 0.84

Cell B1 (Formula): = 2 * (A3 + A4)^2 * A2^2 / A1^2
Cell B1 (Result): 43.56 → Round to 44 per group
```

---

### 11.3 Key References & Guidelines

**FDA Guidance Documents:**

1. **"Adaptive Designs for Clinical Trials of Drugs and Biologics"** (2019)
   - URL: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/adaptive-design-clinical-trials-drugs-and-biologics-guidance-industry
   - Relevant for: Sample size re-estimation, interim analyses

2. **"Multiple Endpoints in Clinical Trials"** (2017)
   - URL: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/multiple-endpoints-clinical-trials-guidance-industry
   - Relevant for: Adjusting alpha for multiple comparisons

3. **"Clinical Decision Support Software"** (2022)
   - URL: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
   - Relevant for: DTx endpoint selection, comparator choice

**ICH Guidelines:**

4. **ICH E9: Statistical Principles for Clinical Trials** (1998)
   - URL: https://www.ich.org/page/efficacy-guidelines
   - Gold standard for clinical trial statistics
   - Section: "Sample Size" (pages 15-17)

**Statistical References:**

5. **Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.).**
   - Classic reference for power calculations
   - Effect size guidelines (Cohen's d: 0.2=small, 0.5=medium, 0.8=large)

6. **Chow, S.C., Shao, J., Wang, H., & Lokhnygina, Y. (2017). Sample Size Calculations in Clinical Research (3rd ed.).**
   - Comprehensive formulas for all study designs
   - Chapters on adaptive designs, non-inferiority, equivalence

**DTx-Specific References:**

7. **Digital Therapeutics Alliance: "Clinical Evaluation of Digital Therapeutics" (2021)**
   - URL: https://dtxalliance.org/
   - Best practices for DTx trial design, including sample size considerations

8. **Pear Therapeutics De Novo Decision Summaries:**
   - reSET (DEN170078): https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN170078.pdf
   - reSET-O (DEN180056): https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN180056.pdf
   - Somryst (DEN190033): https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN190033.pdf
   - Real-world examples of FDA-accepted sample sizes for DTx

---

### 11.4 Template Documents

**Template 1: Sample Size Justification for Protocol** (Available as separate file)

**Template 2: Executive Summary for Stakeholders** (Available as separate file)

**Template 3: Sensitivity Analysis Table** (Excel)

| Scenario | Effect Size | SD | Power | N/group | Total N | Interpretation |
|----------|-------------|-----|-------|---------|---------|----------------|
| Base | 3.0 | 5.0 | 80% | 59 | 118 | As planned |
| Effect -20% | 2.4 | 5.0 | 66% | 59 | 118 | AT RISK |
| Effect -10% | 2.7 | 5.0 | 74% | 59 | 118 | Acceptable |
| SD +20% | 3.0 | 6.0 | 69% | 59 | 118 | AT RISK |
| Attrition 30% | 3.0 | 5.0 | 80% | 63 | 126 | +$40K |

**Template 4: Literature Review Table** (Excel)

| Study | Year | N | Population | Intervention | Control | Effect | SD | Attrition | Notes |
|-------|------|---|------------|--------------|---------|--------|-----|-----------|-------|
| Study A | 2020 | 200 | MDD | CBT app | Sham | 2.3 | 5.8 | 22% | [notes] |
| Study B | 2018 | 150 | MDD | Web CBT | Waitlist | 3.8 | 6.2 | 18% | [notes] |

---

### 11.5 Online Calculators & Tools

**Free Online Calculators:**

1. **G*Power (Free Software)**
   - URL: https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower.html
   - Pros: User-friendly GUI, visual power curves
   - Cons: Limited to standard designs

2. **ClinCalc Sample Size Calculator**
   - URL: https://clincalc.com/stats/samplesize.aspx
   - Pros: Web-based, quick calculations
   - Cons: No sensitivity analysis

3. **PS Power and Sample Size**
   - URL: https://vbiostatps.app.vumc.org/ps/
   - Pros: Covers many study designs (survival, cluster RCTs)
   - Cons: Dated interface

**Commercial Software:**

4. **PASS (Power Analysis and Sample Size)**
   - URL: https://www.ncss.com/software/pass/
   - Cost: ~$600/year
   - Pros: Comprehensive, publication-quality output, 1000+ procedures

5. **nQuery**
   - URL: https://www.statsols.com/nquery
   - Cost: ~$1,200/year
   - Pros: FDA-referenced, adaptive design support

**R Packages (Free):**

6. **pwr**: Basic power calculations (t-tests, proportions, ANOVA)
7. **MESS**: More complex designs (cluster RCTs)
8. **gsDesign**: Group sequential designs (interim analyses)

---

### 11.6 Expert Consultation Resources

**When You Need Help:**

**Academic Biostatistics Departments:**
- Contact biostat departments at universities (e.g., Harvard, Johns Hopkins, Duke)
- Typical cost: $150-250/hour for consultation
- Deliverable: Sample size review + letter of support

**CRO Biostatistics Services:**
- Major CROs (IQVIA, Syneos, PPD) offer biostat consulting
- Typical cost: $10K-25K for full sample size justification + SAP
- Deliverable: Full documentation, FDA-ready

**FDA Statistical Consultants:**
- Former FDA reviewers available as consultants
- Typical cost: $300-500/hour
- Deliverable: Regulatory strategy, sample size review, Pre-Sub prep

**Digital Health Specialists:**
- Consultants with DTx-specific experience (rare)
- Typical cost: $250-400/hour
- Deliverable: Endpoint + sample size package optimized for FDA

**How to Find:**
- LinkedIn search: "Biostatistician" + "Clinical Trials" + "FDA"
- CRO websites: Most list biostat services
- Industry conferences: ASA, DIA, Digital Therapeutics Alliance

---

### 11.7 Contact Information for Support

**For Questions About This Document:**
- Digital Health Clinical Development Team: [Email placeholder]
- Lead Biostatistician: [Email placeholder]

**External Resources:**
- FDA Digital Health Center of Excellence: DigitalHealth@fda.hhs.gov
- Digital Therapeutics Alliance: https://dtxalliance.org/
- ASA (American Statistical Association): https://www.amstat.org/

---

## DOCUMENT VERSION HISTORY

**Version 3.0 (COMPLETE)** - October 10, 2025
- Full 13-prompt suite with examples
- Complete MindPath CBT worked example (all 7 steps executed)
- How-To Implementation Guide
- Troubleshooting & FAQs
- Success Metrics & Validation Criteria
- All 11 sections complete

**Version 2.0** - October 2025
- Added workflow diagrams
- Added prompt templates
- Added persona definitions

**Version 1.0** - September 2025
- Initial draft

---

**END OF UC_CD_007 COMPLETE DOCUMENTATION**

---

**Next Steps:**
- Integrate this use case into full Digital Health Prompt Library
- Cross-reference with UC_CD_001 (Endpoints), UC_CD_003 (RCT Design)
- Validate with 3+ expert biostatisticians
- Pilot test with real DTx company

**For Questions or Feedback:**
Contact: Digital Health Clinical Development Team

**Document Status**: ✅ PRODUCTION READY (Pending Expert Validation)
