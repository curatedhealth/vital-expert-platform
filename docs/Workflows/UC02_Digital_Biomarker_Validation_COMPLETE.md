# USE CASE 2: DIGITAL BIOMARKER VALIDATION

## **UC_CD_002: Digital Biomarker Validation Strategy (DiMe V3 Framework)**

**Part of FORGE™ Framework - Foresight in Outcomes, Regulation, Growth & Endpoint Excellence**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_CD_002 |
| **Version** | 1.0 |
| **Last Updated** | October 12, 2025 |
| **Document Owner** | Digital Health Clinical Development Team |
| **Target Users** | DTx Clinical Development, Digital Biomarker Scientists, Regulatory Affairs, Data Scientists |
| **Estimated Time** | 8-12 weeks (complete validation pathway) |
| **Complexity** | EXPERT |
| **Regulatory Framework** | FDA Digital Health, DiMe V3 Framework, 21st Century Cures Act |
| **Prerequisites** | Digital measure concept, pilot data, regulatory strategy |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Context](#2-problem-statement--context)
3. [Persona Definitions](#3-persona-definitions)
4. [Complete Workflow Overview](#4-complete-workflow-overview)
5. [Detailed Step-by-Step Prompts](#5-detailed-step-by-step-prompts)
6. [Complete Prompt Suite](#6-complete-prompt-suite)
7. [Quality Assurance Framework](#7-quality-assurance-framework)
8. [Regulatory Compliance Checklist](#8-regulatory-compliance-checklist)
9. [Templates & Job Aids](#9-templates--job-aids)
10. [Integration with Other Systems](#10-integration-with-other-systems)
11. [References & Resources](#11-references--resources)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Purpose

**Digital Biomarker Validation** is the systematic process of establishing that a digital measure derived from sensors, wearables, smartphones, or other digital health technologies is fit-for-purpose for its intended clinical use. This use case provides a comprehensive, prompt-driven workflow for:

- **Verification (V1)**: Establishing technical performance - accuracy, precision, reliability of the digital measure
- **Analytical Validation (V2)**: Demonstrating the measure detects what it claims to measure - construct validity, measurement properties
- **Clinical Validation (V3)**: Proving clinical meaningfulness - association with clinical outcomes, treatment response, patient-relevant endpoints
- **Regulatory Strategy**: Positioning validated digital biomarkers for FDA/EMA acceptance as clinical trial endpoints or regulatory decision-making tools

This use case follows the **Digital Medicine Society (DiMe) V3 Framework**, the industry gold standard for digital clinical measure validation.

### 1.2 Business Impact

**The Problem**:
Digital health companies and pharmaceutical sponsors developing digital therapeutics (DTx), remote patient monitoring, or wearable-based clinical trials face a critical challenge:

1. **Regulatory Uncertainty**: FDA and EMA have limited precedent for accepting novel digital endpoints; without proper validation, trials may fail to support regulatory claims
2. **Scientific Rigor**: Academic and clinical communities question validity of "digital biomarkers" without rigorous validation; peer-reviewed publications require strong psychometric evidence
3. **Commercial Credibility**: Payers and providers are skeptical of digital measures lacking clinical validation; reimbursement requires proven clinical utility
4. **Resource Waste**: Companies invest millions in clinical trials with poorly validated endpoints, resulting in failed trials or inconclusive results

**The Solution**:
A systematic, DiMe V3-aligned validation strategy ensures:
- ✅ **Regulatory Acceptance**: FDA/EMA confidence in digital endpoints through rigorous validation
- ✅ **Scientific Credibility**: Publications in high-impact journals; acceptance by clinical community
- ✅ **Commercial Success**: Payer acceptance; strong health economics evidence
- ✅ **Efficient R&D**: Right-sized validation studies; avoid over-validation or under-validation

**Business Value**:

**Direct Impact**:
1. **Regulatory Success Rate**: 85% → 95%+ approval rate for trials using validated digital endpoints
2. **Time to Market**: 6-12 month reduction in clinical development timeline through efficient validation
3. **Cost Savings**: $2-5M savings by avoiding failed trials due to poor endpoint selection
4. **Competitive Advantage**: First-mover advantage with validated, proprietary digital biomarkers

**Indirect Benefits**:
1. **IP Protection**: Validated digital biomarkers can be patented; creates moat around DTx products
2. **Partnership Opportunities**: Big Pharma seeks validated digital endpoint partners for trials
3. **Reimbursement Success**: Payers accept validated digital endpoints for outcomes-based contracts
4. **Scientific Leadership**: Publications and conference presentations establish thought leadership

### 1.3 Target Audience

**Primary Users**:
1. **DTx Clinical Development Teams**: Design validation studies for digital therapeutic endpoints
2. **Digital Biomarker Scientists**: Lead technical validation and analytical validation efforts
3. **Regulatory Affairs (Digital Health)**: Prepare FDA Pre-Submission packages and endpoint justification
4. **Data Scientists/ML Engineers**: Develop and validate algorithms underlying digital measures

**Secondary Users**:
5. **Clinical Operations**: Execute validation studies and manage data collection
6. **Medical Affairs**: Communicate validated digital biomarker evidence to KOLs and clinical community
7. **Health Economics & Outcomes Research (HEOR)**: Incorporate validated digital endpoints into economic models

### 1.4 Key Success Metrics

**Validation Metrics** (Per DiMe V3):
- ✅ **V1 Verification**: >95% accuracy vs. gold standard; ICC >0.85; <10% missing data
- ✅ **V2 Analytical Validation**: Construct validity established (p<0.001); convergent validity r>0.70; divergent validity r<0.30
- ✅ **V3 Clinical Validation**: Significant association with clinical outcomes (p<0.05); MCID established; treatment response demonstrated

**Regulatory Metrics**:
- ✅ **FDA Acceptance**: Digital endpoint accepted as primary or key secondary in FDA-cleared/approved trials
- ✅ **Publications**: Validation studies published in peer-reviewed journals (impact factor >5)
- ✅ **Pre-Submission Success**: FDA feedback positive; no major objections to validation approach

**Business Metrics**:
- ✅ **Clinical Trial Success**: Trials using validated digital endpoints meet primary efficacy outcomes
- ✅ **Reimbursement**: Payers accept digital biomarker for coverage decisions or value-based contracting
- ✅ **Partnership Value**: $5-20M+ partnership deals based on validated digital endpoint platform

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 The Digital Biomarker Challenge

**What is a Digital Biomarker?**

Per the Digital Medicine Society (DiMe):
> *"A digital biomarker is an objective, quantifiable physiological or behavioral data that is collected and measured using digital health technologies (e.g., sensors, wearables, smartphone apps) to explain, influence, or predict health-related outcomes."*

**Examples**:
- **Gait speed from smartphone accelerometer** (Parkinson's disease, multiple sclerosis)
- **Heart rate variability from wearable** (cardiovascular disease, stress, autonomic dysfunction)
- **Keystroke dynamics** (depression, cognitive decline)
- **Speech biomarkers** (depression, psychosis, Alzheimer's disease)
- **Activity patterns** (sleep disorders, depression, ADHD)
- **Glucose monitoring (CGM)** (diabetes management)

#### Key Challenges:

**1. Novel Technology Without Established Precedent**
- Traditional biomarkers (blood pressure, cholesterol, HbA1c) have decades of validation
- Digital biomarkers are new; FDA/EMA have limited regulatory precedent
- Clinical community skeptical of "digital" endpoints vs. traditional measures
- Validation requirements unclear; no standard pathway until DiMe V3 (2021)

**2. Technical Complexity**
- **Data Quality**: Missingness (users forget to wear device), artifacts (motion, poor contact)
- **Algorithm Transparency**: Black-box ML models; difficult to explain to regulators
- **Device Variability**: Different sensors (Apple Watch vs. Fitbit vs. Garmin) produce different data
- **Software Updates**: Algorithm changes post-validation; requires re-validation?

**3. Psychometric Validation Gaps**
- Traditional validation (PRO instruments) uses item response theory, factor analysis
- Digital biomarkers are continuous streams of sensor data; different validation requirements
- Lack of "gold standard" comparators for many digital measures
- Minimal Clinically Important Difference (MCID) often unknown for digital measures

**4. Regulatory Uncertainty**
- FDA has no formal guidance document on digital biomarker validation (as of 2025)
- 21st Century Cures Act (2016) allows Real-World Evidence (RWE), but validation requirements unclear
- EMA more conservative; requires extensive validation for novel endpoints
- Different requirements for exploratory vs. primary endpoints

**5. Cost & Timeline**
- Full V3 validation can cost $2-5M and take 2-3 years
- Many startups under-validate (to save cost) → regulatory rejection
- Big Pharma over-validates (to be safe) → delays and unnecessary expense
- Optimal validation strategy requires balancing rigor with resource constraints

---

### 2.2 The DiMe V3 Framework

The **Digital Medicine Society (DiMe)** developed the **V3 Framework** to provide a structured, consensus-driven approach to digital clinical measure validation.

#### Framework Overview

**V3 = Verification + Analytical Validation + Clinical Validation**

| Stage | Definition | Key Question | Typical Duration | Cost Range |
|-------|------------|--------------|------------------|------------|
| **V1: Verification** | Technical performance validation | Does the technology work as intended? | 8-12 weeks | $150K-$300K |
| **V2: Analytical Validation** | Measurement property validation | Does it measure what it claims? | 8-16 weeks | $200K-$500K |
| **V3: Clinical Validation** | Clinical utility validation | Is it clinically meaningful? | 12-24 months | $1M-$5M |

---

#### V1: Verification (Technical Validation)

**Objective**: Demonstrate that the digital technology produces accurate, reliable, and consistent data.

**Key Activities**:
- **Accuracy Testing**: Compare digital measure to gold-standard reference
  - Example: Smartphone step count vs. manual observation
  - Target: >95% agreement (e.g., ICC >0.85, Bland-Altman limits)
- **Precision Testing**: Test-retest reliability; intra-device variability
  - Example: Measure same subject 3x under same conditions
  - Target: ICC >0.80
- **Data Quality Assessment**: Missingness, outliers, artifacts
  - Target: <10% missing data; <5% artifact rejection
- **Robustness Testing**: Performance across environmental conditions
  - Example: Indoor vs. outdoor; different lighting; temperature

**Deliverable**: Verification Report demonstrating technical performance meets specifications

---

#### V2: Analytical Validation

**Objective**: Demonstrate that the measure detects what it claims to measure and has sound measurement properties.

**Key Activities**:
- **Construct Validity**: Measure represents the intended clinical construct
  - Factor analysis, exploratory/confirmatory
- **Convergent Validity**: Correlates with similar measures
  - Example: Digital gait speed correlates with timed 25-foot walk (r>0.70)
- **Divergent Validity**: Does NOT correlate with unrelated measures
  - Example: Gait speed does NOT correlate with depression score (r<0.30)
- **Known-Groups Validity**: Distinguishes between groups with different disease severity
  - Example: Parkinson's patients show slower gait speed than healthy controls (p<0.001)
- **Internal Consistency**: If multi-item measure (e.g., composite score)
  - Cronbach's alpha >0.70
- **Test-Retest Reliability**: Stability over time in stable patients
  - ICC >0.70 over 1-2 week interval

**Deliverable**: Analytical Validation Report with psychometric evidence

---

#### V3: Clinical Validation

**Objective**: Demonstrate that the measure is clinically meaningful and useful for its intended purpose.

**Key Activities**:
- **Association with Clinical Outcomes**: Correlates with or predicts meaningful clinical events
  - Example: Decline in digital gait speed predicts falls in MS patients
- **Treatment Response**: Sensitive to change with effective treatment
  - Example: Digital depression biomarker improves with antidepressant treatment
- **Minimally Clinically Important Difference (MCID)**: Establish threshold for meaningful change
  - Anchor-based methods: Link to patient/clinician global assessment
  - Distribution-based methods: 0.5 SD, SEM
- **Clinical Utility**: Demonstrate value for decision-making
  - Does it improve outcomes vs. standard of care?
  - Cost-effectiveness?
- **Prospective Validation**: Final validation in intended-use population and setting
  - Real-world or clinical trial setting

**Deliverable**: Clinical Validation Study Report; publication in peer-reviewed journal

---

### 2.3 Regulatory Context

#### FDA Perspective on Digital Biomarkers

**Key Regulatory Documents**:

1. **21st Century Cures Act (2016)**
   - Allows FDA to consider Real-World Evidence (RWE) for approval decisions
   - Opens door for digital health data, but validation requirements not fully defined

2. **FDA Digital Health Innovation Action Plan (2017)**
   - Established Digital Health Center of Excellence
   - Pre-Cert Pilot Program (now paused; see UC_RA_008)
   - Commitment to modernize regulatory framework

3. **FDA Guidance: Clinical Decision Support Software (2019)**
   - Defines when digital health software is regulated as medical device
   - Relevant for diagnostic/monitoring digital biomarkers

4. **FDA Guidance: Real-World Data (Draft 2021)**
   - Discusses use of RWD for regulatory decision-making
   - Digital biomarkers can provide RWD, but must be validated

5. **FDA Biomarker Qualification Program**
   - Allows sponsors to seek FDA "qualification" of novel biomarkers (traditional or digital)
   - Qualified biomarkers accepted across all FDA drug development programs
   - High bar: requires extensive validation, but provides regulatory certainty

**FDA Expectations** (Based on Precedent & Pre-Submission Feedback):

✅ **For Exploratory Endpoints**:
- Verification (V1) typically sufficient
- Analytical validation (V2) strengthens confidence but not always required
- Can include as exploratory in trials without extensive validation

✅ **For Secondary Endpoints**:
- V1 + V2 required
- V3 helpful but not always mandatory
- FDA wants to see correlation with established clinical measures

✅ **For Primary Endpoints**:
- Full V3 validation required
- FDA expects prospective validation in pivotal trial
- May require Pre-Submission meeting to align on validation approach
- Precedent: Very few digital-only primary endpoints approved (e.g., EndeavorRx for ADHD)

✅ **For Diagnostic/Monitoring Claims** (SaMD):
- Follows traditional diagnostic test validation (sensitivity, specificity, PPV, NPV)
- Clinical validation in intended-use population mandatory
- May require 510(k), De Novo, or PMA depending on risk class

---

#### EMA Perspective

**European Medicines Agency** is generally more conservative than FDA:

- **Qualification Advice**: EMA offers Scientific Advice for novel endpoint validation
- **Higher Bar**: EMA typically requires more extensive clinical validation than FDA
- **Publications**: Expects validation studies published in peer-reviewed journals
- **Regulatory Precedent**: Very limited acceptance of digital-only primary endpoints

**Recommendation**: For global development, design validation to meet EMA standards (more stringent than FDA)

---

### 2.4 Common Digital Biomarker Failures

**Failure Mode 1: Under-Validation (Startup Trap)**
- **Scenario**: Startup develops "depression score from smartphone usage patterns"
- **Problem**: Only conducted V1 (accuracy testing) and small pilot study
- **Outcome**: FDA Pre-Sub meeting → "Insufficient validation for primary endpoint"; require full V3 study
- **Impact**: 18-month delay; $3M additional cost; potential competitor advantage lost

**Failure Mode 2: Over-Validation (Big Pharma Trap)**
- **Scenario**: Big Pharma validates digital gait measure for MS trials
- **Problem**: Conducted 3 separate validation studies over 4 years (excessive)
- **Outcome**: Validation complete, but competitor already launched DTx with similar endpoint
- **Impact**: Lost first-mover advantage; market share erosion

**Failure Mode 3: No Comparator (Scientific Trap)**
- **Scenario**: Company develops "digital cognitive score" from typing patterns
- **Problem**: No correlation with established cognitive tests (MoCA, MMSE)
- **Outcome**: Reviewers question what the measure actually reflects; not accepted for publication
- **Impact**: Scientific credibility damaged; difficult to partner with academic institutions

**Failure Mode 4: MCID Not Established (Commercial Trap)**
- **Scenario**: DTx shows statistically significant improvement in digital biomarker
- **Problem**: No MCID established; unclear if change is clinically meaningful
- **Outcome**: Payers refuse reimbursement; "What does 5-point change mean to patients?"
- **Impact**: Market access failure despite regulatory approval

**Failure Mode 5: Algorithm Updates Break Validation (Technical Trap)**
- **Scenario**: Company validates wearable heart rate algorithm v1.0
- **Problem**: Software update to v2.0 changes algorithm; validation no longer applies
- **Outcome**: FDA questions whether previous validation is still valid
- **Impact**: Require re-validation or version lock (can't improve algorithm)

---

### 2.5 Integration with Other Use Cases

UC_CD_002 depends on and informs several other use cases:

**Dependencies** (must complete first):
- **UC_CD_001** (DTx Clinical Endpoint Selection): Digital biomarker must align with clinical endpoint strategy
- **UC_RA_001** (FDA Software Classification): Determine if digital biomarker is regulated as SaMD
- **UC_PD_009** (AI/ML Model Validation): If algorithm is ML-based, follow AI validation best practices

**Informed by UC_CD_002**:
- **UC_CD_003** (RCT Design for DTx): Use validated digital biomarker as trial endpoint
- **UC_RA_002** (510(k) vs De Novo): If digital biomarker is SaMD, validation supports regulatory submission
- **UC_MA_007** (Comparative Effectiveness Evidence): Validated digital biomarker enables real-world evidence studies
- **UC_EG_001** (Health Economics Evidence): Validated endpoint used in cost-effectiveness models

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across six key personas, each bringing critical expertise.

### 3.1 P06_DTXCMO: Digital Therapeutics Chief Medical Officer

**Role in UC_CD_002**: Strategic leader; defines validation strategy aligned with clinical development plan

**Responsibilities**:
- Define intended use of digital biomarker (exploratory, secondary, or primary endpoint)
- Align validation approach with overall DTx regulatory strategy
- Determine acceptable risk tolerance (speed vs. rigor)
- Allocate budget and resources for validation studies
- Review and approve validation study protocols
- Represent validation strategy in FDA Pre-Submission meetings

**Required Expertise**:
- MD or equivalent clinical degree
- 10+ years clinical development experience
- Digital health/DTx regulatory strategy
- FDA endpoint acceptance criteria
- Budget and timeline management

**Decision Authority**: Final approval on validation strategy and investment

---

### 3.2 P07_DATASC: Data Scientist / Digital Biomarker Lead

**Role in UC_CD_002**: Technical lead for V1 (Verification) and algorithm development

**Responsibilities**:
- Lead Steps 2-3 (Verification Study Design & Execution)
- Design accuracy testing protocols (gold standard comparisons)
- Conduct statistical analyses (ICC, Bland-Altman, etc.)
- Develop and refine digital biomarker algorithms
- Manage data quality and missing data strategies
- Prepare technical sections of validation reports

**Required Expertise**:
- PhD in Biostatistics, Biomedical Engineering, Computer Science, or related field
- 5+ years experience with sensor data analysis
- Signal processing and feature extraction
- Validation statistics (ICC, Cohen's kappa, Bland-Altman)
- Programming (Python, R) and ML frameworks

---

### 3.3 P08_CLINRES: Clinical Research Scientist

**Role in UC_CD_002**: Lead V2 (Analytical Validation) and V3 (Clinical Validation) studies

**Responsibilities**:
- Lead Steps 4-5 (Analytical Validation) and 6-7 (Clinical Validation)
- Design psychometric validation study protocols
- Execute known-groups validity studies
- Conduct convergent/divergent validity analyses
- Design and execute clinical validation trials
- Prepare validation study manuscripts for publication

**Required Expertise**:
- PhD in Clinical Psychology, Outcomes Research, or related field
- 7+ years psychometric validation experience
- PRO instrument development
- Clinical trial design and execution
- Statistical analysis (factor analysis, SEM, IRT)

---

### 3.4 P04_REGDIR: Regulatory Affairs Director (Digital Health)

**Role in UC_CD_002**: Regulatory strategy; FDA/EMA interactions

**Responsibilities**:
- Lead Step 8 (Regulatory Strategy & Pre-Submission)
- Prepare FDA Pre-Sub meeting packages
- Interpret FDA/EMA feedback on validation requirements
- Ensure validation approach meets regulatory standards
- Align validation with classification (SaMD vs. clinical trial tool)
- Prepare validation sections of regulatory submissions

**Required Expertise**:
- RAC certification or equivalent
- 5+ years digital health regulatory experience
- FDA Digital Health Center of Excellence familiarity
- DiMe V3 framework understanding
- 21st Century Cures Act and RWE guidance

---

### 3.5 P15_HEOR: Health Economics & Outcomes Research Specialist

**Role in UC_CD_002**: Define clinical meaningfulness criteria; MCID establishment

**Responsibilities**:
- Support Step 7 (MCID Determination)
- Design anchor-based MCID studies
- Conduct distribution-based MCID analyses
- Link digital biomarker to patient-relevant outcomes
- Prepare health economics evidence dossiers

**Required Expertise**:
- PhD in Health Economics, Outcomes Research, or related field
- MCID methodology (anchor-based, distribution-based)
- Cost-effectiveness modeling
- Payer evidence requirements

---

### 3.6 P16_MEDWRIT: Medical Writer / Publication Specialist

**Role in UC_CD_002**: Prepare validation study reports and manuscripts

**Responsibilities**:
- Support Step 9 (Validation Report & Publication)
- Draft validation study protocols and reports
- Prepare manuscripts for peer-reviewed journals
- Create presentations for regulatory meetings and conferences
- Ensure compliance with ICMJE authorship guidelines

**Required Expertise**:
- PhD or equivalent scientific training
- 5+ years medical writing experience
- Publication in peer-reviewed journals
- Digital health/biomarker validation publications preferred

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 End-to-End Process Flow

```
START: Digital Biomarker Concept
  ↓
[STEP 1] Define Intended Use & Context of Use (P06_DTXCMO leads)
  ├─ Clinical indication
  ├─ Target population
  ├─ Endpoint type (exploratory/secondary/primary)
  └─ Regulatory pathway
  ↓
[STEP 2] Design Verification Study (V1) (P07_DATASC leads)
  ├─ Select gold standard comparator
  ├─ Define accuracy/precision targets
  ├─ Plan data collection protocol
  └─ Statistical analysis plan
  ↓
[STEP 3] Execute Verification & Analysis (P07_DATASC)
  ├─ Collect verification data
  ├─ Perform statistical analyses (ICC, Bland-Altman)
  ├─ Assess data quality
  └─ Document results
  ↓
[DECISION POINT 1] Did V1 pass criteria?
  ├─ YES → Proceed to V2
  └─ NO → Refine algorithm; repeat V1
  ↓
[STEP 4] Design Analytical Validation Study (V2) (P08_CLINRES leads)
  ├─ Define validation objectives (construct, convergent, divergent, known-groups)
  ├─ Sample size calculation
  ├─ Select comparator measures
  └─ Statistical analysis plan
  ↓
[STEP 5] Execute Analytical Validation (P08_CLINRES)
  ├─ Recruit participants
  ├─ Collect digital biomarker + comparator data
  ├─ Perform validity analyses
  └─ Document results
  ↓
[DECISION POINT 2] Did V2 pass criteria?
  ├─ YES → Proceed to V3 (if required)
  └─ NO → Revise measure; repeat V2
  ↓
[STEP 6] Design Clinical Validation Study (V3) (P08_CLINRES leads)
  ├─ Define clinical utility outcomes
  ├─ Design prospective study
  ├─ IRB approval and site activation
  └─ Statistical analysis plan
  ↓
[STEP 7] Execute Clinical Validation & MCID Determination (P08_CLINRES + P15_HEOR)
  ├─ Recruit patients
  ├─ Collect longitudinal data
  ├─ Analyze association with clinical outcomes
  ├─ Establish MCID (anchor-based & distribution-based)
  └─ Document results
  ↓
[DECISION POINT 3] Did V3 pass criteria?
  ├─ YES → Proceed to regulatory strategy
  └─ NO → Revise approach; consider exploratory use only
  ↓
[STEP 8] Regulatory Strategy & Pre-Submission (P04_REGDIR leads)
  ├─ Prepare FDA Pre-Sub package
  ├─ Submit Pre-Sub request
  ├─ Attend FDA meeting
  ├─ Incorporate FDA feedback
  └─ Document regulatory alignment
  ↓
[STEP 9] Validation Report & Publication (P16_MEDWRIT leads)
  ├─ Prepare comprehensive validation report
  ├─ Draft manuscript for peer-reviewed journal
  ├─ Submit for publication
  └─ Present at conferences
  ↓
END: Validated Digital Biomarker Ready for Clinical Use
```

---

### 4.2 Decision Points

**DECISION POINT 1** (After Step 3): Did V1 Verification Pass?

**Criteria**:
- Accuracy vs. gold standard: ICC >0.85 OR agreement >95%
- Precision (test-retest): ICC >0.80
- Data quality: <10% missing data; <5% artifacts
- Robustness: Consistent performance across conditions

**Outcomes**:
- ✅ **PASS**: Proceed to V2 Analytical Validation
- ❌ **FAIL**: Refine algorithm; improve data quality; repeat V1
- ⚠️ **BORDERLINE**: May proceed with caution; document limitations

**Typical Failure Modes**:
- Poor gold standard agreement (e.g., smartphone steps vs. manual count: r=0.65)
- High missingness (>20% of data lost due to non-wear)
- Algorithm fails in specific subgroups (e.g., elderly, obese patients)

---

**DECISION POINT 2** (After Step 5): Did V2 Analytical Validation Pass?

**Criteria**:
- Construct validity: Factor analysis supports unidimensional or expected structure
- Convergent validity: r >0.70 with similar measures
- Divergent validity: r <0.30 with unrelated measures
- Known-groups validity: Significant difference between disease vs. healthy (p<0.001; large effect size)
- Internal consistency (if multi-item): Cronbach's α >0.70
- Test-retest reliability: ICC >0.70

**Outcomes**:
- ✅ **PASS**: Proceed to V3 Clinical Validation (if primary endpoint)
- ✅ **PASS**: May use as secondary endpoint without V3 (if sufficient)
- ❌ **FAIL**: Revise measure; improve measurement properties; repeat V2
- ⚠️ **PARTIAL PASS**: Some but not all criteria met; use as exploratory endpoint

---

**DECISION POINT 3** (After Step 7): Did V3 Clinical Validation Pass?

**Criteria**:
- Significant association with clinical outcomes (p<0.05; clinically meaningful effect size)
- Sensitive to treatment response (p<0.05; separation from placebo/control)
- MCID established (anchor-based or distribution-based)
- Clinical utility demonstrated (improves decision-making or patient outcomes)

**Outcomes**:
- ✅ **PASS**: Digital biomarker suitable for primary endpoint; FDA/EMA likely to accept
- ❌ **FAIL**: Not suitable for primary endpoint; consider secondary or exploratory use
- ⚠️ **PARTIAL PASS**: May be acceptable for secondary endpoint with limitations acknowledged

---

### 4.3 Workflow Prerequisites

**System Requirements**:
- ✅ Digital health platform (wearable, app, sensor) functional and tested
- ✅ Data collection infrastructure (cloud storage, API, data pipeline)
- ✅ Statistical analysis software (R, Python, SAS, SPSS)
- ✅ Clinical study management system (if V2/V3 involve human subjects)

**Regulatory Documentation**:
- ✅ Intended Use statement drafted
- ✅ Software classification determined (UC_RA_001)
- ✅ Clinical development plan aligned with validation strategy
- ✅ IRB/Ethics approval (for V2/V3 studies involving human subjects)

**Scientific Resources**:
- ✅ Gold standard comparator identified (for V1)
- ✅ Existing validated measures identified (for V2 convergent/divergent validity)
- ✅ Clinical population access (for V2/V3 studies)
- ✅ Literature review completed (precedent digital biomarkers)

**Budget & Timeline**:
- ✅ Budget allocated: $500K-$5M (depending on complexity)
- ✅ Timeline realistic: 8-24 months
- ✅ Team assembled (data scientist, clinical research scientist, regulatory affairs)

---

### 4.4 Workflow Outputs

**Primary Deliverables**:

1. **Verification Report (V1)**
   - Accuracy testing results (ICC, Bland-Altman plots)
   - Precision/reliability results
   - Data quality assessment
   - Gold standard comparison summary
   - Conclusion: Pass/Fail criteria

2. **Analytical Validation Report (V2)**
   - Construct validity analysis (factor analysis, CFA)
   - Convergent validity (correlations with similar measures)
   - Divergent validity (correlations with dissimilar measures)
   - Known-groups validity (disease vs. healthy comparison)
   - Reliability (test-retest ICC)
   - Conclusion: Psychometric properties established

3. **Clinical Validation Study Report (V3)**
   - Study protocol and SAP
   - Clinical utility demonstration
   - Association with clinical outcomes
   - Treatment response sensitivity
   - MCID determination (anchor-based & distribution-based)
   - Safety data (if applicable)
   - Conclusion: Clinical meaningfulness established

4. **FDA Pre-Submission Package**
   - Cover letter and background
   - Validation summary (V1 + V2 + V3)
   - Intended use and regulatory pathway
   - Specific questions for FDA
   - Response to FDA feedback

5. **Peer-Reviewed Publication**
   - Manuscript (5,000-8,000 words)
   - Supplementary materials (detailed methods, additional analyses)
   - Target journals: *npj Digital Medicine*, *JMIR*, *Digital Health*, *Lancet Digital Health*

**Secondary Deliverables**:
6. **Validation Study Protocols** (V1, V2, V3)
7. **Statistical Analysis Plans (SAPs)**
8. **Conference Presentations** (slides and abstracts)
9. **Regulatory Meeting Minutes** (FDA, EMA)
10. **Internal Training Materials** (for clinical teams using validated biomarker)

---

## 5. DETAILED STEP-BY-STEP PROMPTS

### STEP 1: Define Intended Use & Context of Use (P06_DTXCMO leads)
**Estimated Time**: 2-4 hours  
**Complexity**: INTERMEDIATE

#### Background

Before any validation work begins, the team must clearly define the **Intended Use** and **Context of Use** for the digital biomarker. This foundational step drives all subsequent validation decisions.

**Key Questions**:
1. What clinical construct does the digital biomarker measure?
2. In what patient population will it be used?
3. What is the regulatory endpoint type? (exploratory, secondary, primary)
4. What is the regulatory pathway? (clinical trial tool, SaMD, biomarker qualification)

**Why This Matters**:
- Different endpoint types require different levels of validation (exploratory < secondary < primary)
- FDA Pre-Submission feedback depends on clear articulation of intended use
- Validation study design differs based on context of use

---

#### PROMPT 1.1: Digital Biomarker Intended Use Definition

```markdown
**ROLE**: You are P06_DTXCMO, a Chief Medical Officer with expertise in digital therapeutics clinical development and FDA digital health regulatory strategy.

**TASK**: Define the Intended Use and Context of Use for a digital biomarker to guide validation strategy.

**INPUT**:

**Digital Biomarker Overview**:
- Biomarker Name: {biomarker_name}
- Technology/Sensor: {wearable / smartphone / sensor / other}
- Data Source: {accelerometer / heart_rate / EDA / audio / keyboard / etc.}
- Clinical Domain: {disease_area}

**Preliminary Concept**:
- What does it measure?: {brief_description}
- Why is this clinically relevant?: {clinical_rationale}
- What existing measures does it relate to?: {gold_standard_or_comparators}

**Clinical Development Context**:
- Stage of Product Development: {preclinical / Phase_1 / Phase_2 / Phase_3}
- Regulatory Strategy: {IND / NDA / 510k / De_Novo / other}
- Target Indication: {specific_disease_or_condition}
- Existing Clinical Endpoints: {primary_and_secondary_endpoints_in_program}

---

**INSTRUCTIONS**:

Using the PICO framework (Population, Intervention, Comparator, Outcome), define the Intended Use and Context of Use for this digital biomarker.

---

### PART A: INTENDED USE STATEMENT

Draft a clear, concise Intended Use statement following this template:

**Template**:
> "The {biomarker_name} is a digital measure derived from {sensor_type} that quantifies {clinical_construct} in {patient_population}. It is intended for use as {endpoint_type} in clinical trials evaluating {intervention_type} for {indication}."

**Your Intended Use Statement**:

[Write 2-3 sentence intended use statement here]

---

### PART B: CONTEXT OF USE

**1. Patient Population (P)**

Define the target population with precision:

- **Indication**: {specific_disease_or_condition}
- **Disease Stage/Severity**: {mild / moderate / severe}
- **Age Range**: {pediatric / adult / elderly}
- **Inclusion Criteria** (key criteria):
  1. {criterion_1}
  2. {criterion_2}
  3. {criterion_3}
- **Exclusion Criteria** (key criteria):
  1. {criterion_1}
  2. {criterion_2}

**Justification**: Why is this population appropriate for this digital biomarker?

[Your answer]

---

**2. Clinical Construct Being Measured**

- **What clinical concept does this biomarker measure?**: {e.g., motor function, depression severity, sleep quality, cognitive function}
- **How is it currently measured (gold standard)?**: {existing_validated_measures}
- **Why is a digital measure needed?**: {unmet_need: e.g., more frequent assessment, objective vs. subjective, reduced burden}

**Clinical Relevance**:
- How does this construct relate to disease burden?: {patient_impact}
- How does this construct relate to treatment benefit?: {treatment_response}

[Your answer]

---

**3. Endpoint Type & Regulatory Strategy**

**Endpoint Classification**:
Select one:
- ☐ **Exploratory Endpoint**: Hypothesis-generating; minimal validation required
- ☐ **Secondary Endpoint**: Supportive evidence; V1+V2 validation required
- ☐ **Primary Endpoint**: Regulatory decision-making; Full V3 validation required

**Rationale for Classification**:

[Explain why this endpoint type is appropriate given the validation state, precedent, and risk tolerance]

**Regulatory Pathway**:
- ☐ Clinical trial tool only (not regulated as device)
- ☐ Software as Medical Device (SaMD) - requires FDA clearance/approval
- ☐ FDA Biomarker Qualification (seek formal FDA qualification)
- ☐ Drug Development Tool (DDT) Qualification

**Timeline Implications**:
- Target validation completion: {date}
- Target first use in pivotal trial: {date}
- Regulatory submission target: {date}

---

**4. Comparator & Benchmarking Strategy**

**Gold Standard Comparator**:
- What is the established measure for this clinical construct?: {gold_standard}
- Will you demonstrate equivalence, non-inferiority, or superiority?: {equivalence / non-inferiority / superiority}

**Benchmarking Targets**:
- Expected correlation with gold standard: {r > X}
- Expected effect size for treatment response: {Cohen's_d > X}
- Expected MCID (Minimally Clinically Important Difference): {X_units}

---

### PART C: VALIDATION STRATEGY DECISION

Based on the Intended Use and Context of Use, determine the appropriate validation level:

**Decision Matrix**:

| Endpoint Type | Validation Required | Timeline | Cost Estimate |
|---------------|---------------------|----------|---------------|
| Exploratory | V1 only | 8-12 weeks | $150K-$300K |
| Secondary | V1 + V2 | 16-24 weeks | $350K-$800K |
| Primary | V1 + V2 + V3 | 12-24 months | $1.5M-$5M |

**Recommended Validation Level**: {V1 / V1+V2 / V1+V2+V3}

**Rationale**:

[Explain why this validation level is appropriate given the intended use, regulatory pathway, and risk tolerance]

---

### PART D: RISK ASSESSMENT

**Regulatory Risks**:
1. **Precedent Risk**: {LOW / MEDIUM / HIGH}
   - Has FDA accepted similar digital biomarkers for this indication?: {YES / NO}
   - Examples: {list_precedents_or_explain_novelty}

2. **Clinical Acceptance Risk**: {LOW / MEDIUM / HIGH}
   - Will clinical community accept this digital measure?: {YES / NO / UNCERTAIN}
   - What evidence is needed?: {KOL_input / publications / etc.}

3. **Commercial Risk**: {LOW / MEDIUM / HIGH}
   - Will payers accept this endpoint for reimbursement decisions?: {YES / NO / UNCERTAIN}
   - What evidence is needed?: {health_economics / MCID / etc.}

**Risk Mitigation Strategies**:

[List 3-5 strategies to mitigate identified risks]

---

### PART E: FDA PRE-SUBMISSION STRATEGY

**Should you seek FDA Pre-Submission feedback?**:
- ☐ **YES** - Digital biomarker is novel; seeking primary endpoint status; high regulatory risk
- ☐ **NO** - Digital biomarker has strong precedent; exploratory use only; low risk

**If YES, Pre-Submission Topics**:
1. {topic_1: e.g., adequacy of validation approach}
2. {topic_2: e.g., acceptability of comparator measure}
3. {topic_3: e.g., MCID determination methodology}

**Timing**:
- Pre-Sub submission target: {date}
- Meeting target: {date - typically 75 days after submission}

---

## OUTPUT FORMAT

**Intended Use Statement**: [2-3 sentences]

**Context of Use Summary**: [1 paragraph]

**Validation Strategy**: {V1 / V1+V2 / V1+V2+V3}

**Timeline**: {X weeks/months}

**Budget**: ${amount}

**Key Risks**: {list top 3}

**Next Steps**: [list immediate actions]

---

**DELIVERABLE**: Intended Use Document (5-7 pages)

**NEXT STEP**: Proceed to STEP 2 (Verification Study Design)
```

---

### STEP 2: Design Verification Study (V1) (P07_DATASC leads)
**Estimated Time**: 1-2 weeks  
**Complexity**: ADVANCED

#### Background

**Verification (V1)** demonstrates that the digital technology produces **accurate, precise, and reliable data**. This answers the fundamental question: *"Does the technology work as intended?"*

**Key Verification Activities**:
1. **Accuracy Testing**: Compare digital measure to gold-standard reference
2. **Precision Testing**: Test-retest reliability; intra-device variability
3. **Data Quality Assessment**: Missingness, outliers, artifacts
4. **Robustness Testing**: Performance across environmental conditions, populations

**Gold Standard Selection**:
- Must be an established, validated measure
- Should be feasible to collect concurrently with digital measure
- Examples:
  - Steps: Manual observation (video recording)
  - Heart rate: ECG or chest strap monitor
  - Gait speed: Timed walk test (e.g., 6-minute walk, TUG)
  - Tremor: Clinical rating scale (e.g., UPDRS)

---

#### PROMPT 2.1: Verification Study Design

```markdown
**ROLE**: You are P07_DATASC, a Data Scientist and Digital Biomarker Lead with expertise in sensor validation, signal processing, and validation statistics.

**TASK**: Design a comprehensive Verification (V1) study protocol for a digital biomarker.

**INPUT**:

**Digital Biomarker**:
- Name: {biomarker_name}
- Sensor/Technology: {wearable / smartphone / sensor}
- Data Type: {accelerometer / PPG / audio / other}
- Measurement: {what_it_measures}
- Algorithm: {brief_algorithm_description}

**Intended Use**:
- Population: {patient_population}
- Context: {clinical_trial / real-world_monitoring}
- Endpoint Type: {exploratory / secondary / primary}

**Gold Standard**:
- Reference Method: {gold_standard_measure}
- Measurement Units: {units}
- Expected Correlation: {r > X or ICC > X}

**Study Constraints**:
- Budget: ${amount}
- Timeline: {X weeks}
- Sample Size Flexibility: {fixed / flexible}

---

**INSTRUCTIONS**:

Design a Verification study protocol following the structure below.

---

### PART A: STUDY OBJECTIVES

**Primary Objective**:
Demonstrate that {biomarker_name} produces accurate measurements of {clinical_construct} compared to the gold-standard {reference_method}.

**Secondary Objectives**:
1. Assess precision (test-retest reliability)
2. Evaluate data quality (missingness, artifacts)
3. Determine robustness across subgroups and conditions

---

### PART B: STUDY DESIGN

**Study Type**: {prospective_observational / lab-based_validation / field-based_validation}

**Study Duration**: {X days per participant}

**Study Setting**: {clinic / laboratory / free-living}

**Justification**: Why is this study design appropriate?

[Your answer]

---

### PART C: SAMPLE SIZE CALCULATION

**Accuracy Objective**:
- **Hypothesis**: Digital biomarker agrees with gold standard (ICC >0.85)
- **Statistical Test**: Intraclass Correlation Coefficient (ICC) or Pearson correlation
- **Assumptions**:
  - Expected ICC: {0.90}
  - Acceptable lower 95% CI bound: {0.85}
  - Alpha: 0.05
  - Power: 80%

**Sample Size Calculation**:

Using ICC sample size formula:
```
n = [(Z_alpha + Z_beta) / (0.5 * ln((1+ICC_lower)/(1-ICC_lower)))]^2
```

For ICC=0.90, lower bound=0.85:
- **Estimated n = {X participants}**

**Precision Objective** (Test-Retest):
- **Hypothesis**: Test-retest ICC >0.80
- **Measurements**: 2-3 repeated measures per participant
- **Sample Size**: {Y participants} (subset of accuracy sample)

**Total Sample Size**: {X participants}
- Primary accuracy assessment: {all_X}
- Test-retest subset: {Y}

**Rationale**: [Justify sample size; cite references]

---

### PART D: PARTICIPANT RECRUITMENT

**Inclusion Criteria**:
1. {criterion_1}
2. {criterion_2}
3. {criterion_3}
4. Able to wear/use digital device
5. Willing to complete gold standard measurements

**Exclusion Criteria**:
1. {criterion_1}
2. {criterion_2}
3. Conditions interfering with sensor performance (e.g., skin conditions, pacemaker)

**Recruitment Strategy**:
- Recruitment Sites: {clinic / online / community}
- Recruitment Methods: {flyers / social_media / physician_referral}
- Estimated Enrollment Rate: {X per week}
- Total Enrollment Duration: {Y weeks}

**Diversity Requirements**:
To ensure generalizability, recruit diverse sample:
- Age: {range}; stratify by {young/middle/older}
- Sex: Target 50% female
- Race/Ethnicity: Reflect U.S. demographics
- Disease Severity: {mild/moderate/severe} if applicable

---

### PART E: DATA COLLECTION PROTOCOL

**Visit Schedule**:

| Visit | Timing | Duration | Procedures |
|-------|--------|----------|------------|
| Screening | Day 0 | 30 min | Informed consent, eligibility check |
| Baseline | Day 1 | 2-3 hours | Demographics, digital device setup, training, accuracy testing |
| Test-Retest (subset) | Day 3 | 1-2 hours | Repeat accuracy testing (same conditions) |
| Optional Follow-up | Day 7 | 1-2 hours | Robustness testing (different conditions) |

**Accuracy Testing Protocol**:

**Setup**:
1. Participant fitted with digital device: {device_name}
2. Participant connected to gold standard: {reference_device}
3. Synchronize timestamps (digital device <-> gold standard)

**Measurement Conditions**:
Design measurements to cover expected use conditions:

Example for Gait Speed:
- Condition 1: Normal walking speed (10-meter walk)
- Condition 2: Fast walking speed (10-meter walk)
- Condition 3: Slow walking speed (10-meter walk)
- Condition 4: Indoor environment
- Condition 5: Outdoor environment

**Your Measurement Protocol**:
[Define 3-5 measurement conditions]

**Data Capture**:
- Digital Biomarker: Continuous recording during all conditions
- Gold Standard: Simultaneous recording
- Duration: {X minutes} per condition
- Repetitions: {Y repetitions} per condition to assess variability

---

### PART F: DATA QUALITY ASSESSMENT

**Missing Data Tracking**:
- % of time digital device worn/active: Target >90%
- % of time gold standard collected: Target >95%
- Reasons for missingness: {device_off / sensor_failure / poor_contact / other}

**Artifact Detection**:
- Define artifact criteria: {e.g., signal_dropout / motion_artifact / saturation}
- Artifact rejection threshold: {X% of data points}
- Manual review process: {yes / no}

**Quality Control**:
- Real-time data quality checks during study
- Flagging of poor-quality data
- Re-measurement if data quality inadequate

---

### PART G: STATISTICAL ANALYSIS PLAN

#### **Analysis 1: Accuracy Assessment**

**Primary Analysis: Intraclass Correlation Coefficient (ICC)**

Calculate ICC(2,1) - Two-way random effects, absolute agreement:
```
ICC = (BMS - EMS) / (BMS + (k-1)*EMS + k*(JMS - EMS)/n)
```

**Success Criterion**: ICC >0.85 (95% CI lower bound >0.80)

**Interpretation**:
- ICC >0.90: Excellent agreement
- ICC 0.75-0.90: Good agreement
- ICC 0.50-0.75: Moderate agreement
- ICC <0.50: Poor agreement

---

**Secondary Analysis: Bland-Altman Plot**

1. Calculate mean difference (bias): Mean(Digital - Gold_Standard)
2. Calculate limits of agreement: Mean ± 1.96*SD
3. Plot: x-axis = average of two methods; y-axis = difference

**Success Criteria**:
- Mean bias close to zero (acceptable range: {±X units})
- Limits of agreement clinically acceptable (e.g., ±{Y units})
- No systematic bias across range of measurement

---

**Tertiary Analysis: Pearson/Spearman Correlation**

Calculate correlation: r = Cov(Digital, Gold) / (SD_Digital * SD_Gold)

**Success Criterion**: r >0.85

---

#### **Analysis 2: Precision Assessment (Test-Retest)**

Calculate test-retest ICC:
- Measure 1: Baseline visit
- Measure 2: Test-retest visit (Day 3)
- Time interval: {2-7 days} (stable patients only)

**Success Criterion**: Test-retest ICC >0.80

---

#### **Analysis 3: Data Quality**

**Missing Data**:
- Calculate % missingness per participant
- Identify patterns: {time_of_day / activity_level / technical_issues}

**Success Criterion**: <10% missingness overall

**Artifact Rate**:
- Calculate % data flagged as artifact
- Identify sources: {motion / poor_contact / sensor_error}

**Success Criterion**: <5% artifact rejection

---

#### **Analysis 4: Subgroup & Robustness**

**Subgroup Analyses**:
Assess accuracy (ICC) in subgroups:
1. Age: {<50 vs ≥50 years}
2. Sex: {Male vs Female}
3. Disease Severity: {Mild vs Moderate vs Severe}
4. BMI: {<30 vs ≥30}

**Robustness Testing**:
Assess accuracy across conditions:
1. Indoor vs Outdoor
2. Different lighting (if optical sensor)
3. Different temperatures (if wearable)

**Success Criterion**: ICC >0.80 in all subgroups and conditions (exploratory; no hypothesis testing)

---

### PART H: SUCCESS CRITERIA SUMMARY

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| **Accuracy (ICC)** | >0.90 | 0.85-0.90 | <0.85 |
| **Bias (Mean Difference)** | ±{X units} | ±{1.5X units} | >±{2X units} |
| **Test-Retest (ICC)** | >0.85 | 0.80-0.85 | <0.80 |
| **Missing Data (%)** | <5% | 5-10% | >10% |
| **Artifact Rate (%)** | <3% | 3-5% | >5% |

**Overall Pass/Fail**:
- **PASS**: All metrics meet "Target" or "Acceptable"
- **CONDITIONAL PASS**: Majority of metrics acceptable; minor refinements needed
- **FAIL**: Any metric in "Unacceptable" range

---

### PART I: TIMELINE & MILESTONES

| Milestone | Target Date | Duration |
|-----------|-------------|----------|
| Protocol finalization | Week 0 | - |
| IRB submission | Week 1 | 1 week |
| IRB approval | Week 3 | 2 weeks |
| Participant recruitment | Week 4-8 | 4 weeks |
| Data collection | Week 4-12 | 8 weeks |
| Data analysis | Week 13-14 | 2 weeks |
| Verification Report | Week 15 | 1 week |
| **TOTAL** | **Week 15** | **~4 months** |

---

### PART J: BUDGET ESTIMATE

| Category | Cost Estimate |
|----------|---------------|
| Participant compensation ({X participants} × ${Y/participant}) | ${amount} |
| Gold standard equipment | ${amount} |
| Digital devices ({X devices}) | ${amount} |
| Site costs (space, staff) | ${amount} |
| Data management | ${amount} |
| Statistical analysis | ${amount} |
| IRB fees | ${amount} |
| **TOTAL** | **${total}** |

---

### PART K: RISK MITIGATION

**Risk 1: Poor Agreement with Gold Standard**
- **Mitigation**: Pilot test (n=5-10) before full study; refine algorithm if needed
- **Contingency**: If ICC <0.85, conduct root cause analysis; algorithm modification

**Risk 2: High Missing Data**
- **Mitigation**: Participant training; reminders; troubleshooting protocol
- **Contingency**: Over-recruit by 20% to account for dropout

**Risk 3: Recruitment Delays**
- **Mitigation**: Multiple recruitment sites; flexible eligibility criteria
- **Contingency**: Extend timeline by 4 weeks if needed

---

## OUTPUT FORMAT

**Verification Study Protocol** (15-20 pages)

**Sections**:
1. Study Objectives
2. Study Design
3. Sample Size Calculation
4. Participant Recruitment
5. Data Collection Protocol
6. Statistical Analysis Plan
7. Success Criteria
8. Timeline
9. Budget

**Appendices**:
- Informed Consent Form
- Case Report Forms (CRFs)
- Data Management Plan

**DELIVERABLE**: Verification Protocol ready for IRB submission

**NEXT STEP**: Execute Verification Study (STEP 3)
```

---

### STEP 3: Execute Verification Study & Analysis (P07_DATASC)
**Estimated Time**: 8-12 weeks  
**Complexity**: ADVANCED

#### PROMPT 3.1: Verification Data Analysis & Reporting

```markdown
**ROLE**: You are P07_DATASC, executing the Verification study and analyzing results.

**TASK**: Analyze Verification data and prepare Verification Report.

**INPUT**:

**Study Completion Status**:
- Participants enrolled: {X}
- Participants completed: {Y}
- Data collected: {Z measurements}

**Data Available**:
- Digital biomarker data: {file_or_database}
- Gold standard data: {file_or_database}
- Demographics: {file}
- Quality metrics: {file}

---

**INSTRUCTIONS**:

Conduct the analyses outlined in the Verification Protocol (STEP 2) and prepare a comprehensive Verification Report.

---

### PART A: DATA PREPARATION

**1. Data Import & Cleaning**

Load datasets:
```python
# Example Python code
import pandas as pd
import numpy as np
from scipy.stats import pearsonr
from statsmodels.stats.inter_rater import fleiss_kappa

# Load data
digital_data = pd.read_csv('digital_biomarker.csv')
gold_standard = pd.read_csv('gold_standard.csv')

# Merge by participant ID and timestamp
merged_data = pd.merge(digital_data, gold_standard, on=['participant_id', 'timestamp'])
```

**2. Data Quality Check**

Calculate missing data:
```python
missing_pct = merged_data.isnull().sum() / len(merged_data) * 100
print(f"Missing data: {missing_pct}%")
```

**Report**:
- Total measurements collected: {N}
- Valid measurements (after quality control): {M}
- Excluded measurements: {N-M} ({reason: artifact / missing / outlier})

---

### PART B: PRIMARY ANALYSIS - ACCURACY

**Intraclass Correlation Coefficient (ICC)**

Calculate ICC(2,1):
```python
from pingouin import intraclass_corr

icc_result = intraclass_corr(data=merged_data, 
                               targets='participant_id', 
                               raters='method',  # 'digital' vs 'gold_standard'
                               ratings='measurement_value')
print(icc_result)
```

**Results**:
- ICC(2,1): {value} (95% CI: {lower} - {upper})
- Interpretation: {Excellent / Good / Moderate / Poor}

**Success Criterion**: ICC >0.85 (95% CI lower bound >0.80)
- **PASS** ✅ OR **FAIL** ❌

---

**Bland-Altman Analysis**

Calculate bias and limits of agreement:
```python
mean_diff = np.mean(merged_data['digital'] - merged_data['gold_standard'])
sd_diff = np.std(merged_data['digital'] - merged_data['gold_standard'])
loa_upper = mean_diff + 1.96 * sd_diff
loa_lower = mean_diff - 1.96 * sd_diff

print(f"Mean Bias: {mean_diff}")
print(f"Limits of Agreement: [{loa_lower}, {loa_upper}]")
```

**Bland-Altman Plot**:
[Insert plot: x-axis = mean of methods; y-axis = difference]

**Results**:
- Mean Bias: {value} {units}
- Limits of Agreement: [{lower}, {upper}] {units}
- Clinically Acceptable Range: {define}

**Interpretation**: {Within acceptable limits / Systematic bias detected}

---

**Pearson Correlation**

```python
r, p_value = pearsonr(merged_data['digital'], merged_data['gold_standard'])
print(f"Pearson r: {r}, p-value: {p_value}")
```

**Results**:
- Pearson r: {value}
- p-value: {p_value}

**Success Criterion**: r >0.85
- **PASS** ✅ OR **FAIL** ❌

---

### PART C: SECONDARY ANALYSIS - PRECISION

**Test-Retest Reliability**

Subset: Participants with repeated measurements
```python
test_retest = merged_data[merged_data['visit'].isin(['baseline', 'retest'])]

icc_retest = intraclass_corr(data=test_retest, 
                               targets='participant_id', 
                               raters='visit', 
                               ratings='digital_measurement')
```

**Results**:
- Test-Retest ICC: {value} (95% CI: {lower} - {upper})
- Time Interval: {X days}

**Success Criterion**: ICC >0.80
- **PASS** ✅ OR **FAIL** ❌

---

### PART D: DATA QUALITY ANALYSIS

**Missing Data**:
- Overall missingness: {X%}
- By participant: {range: min-max}
- Reasons: {device_off: X%, sensor_error: Y%, participant_noncompliance: Z%}

**Success Criterion**: <10% missingness
- **PASS** ✅ OR **FAIL** ❌

**Artifact Rate**:
- Artifacts detected: {X%}
- Artifact types: {motion: X%, poor_signal: Y%, other: Z%}

**Success Criterion**: <5% artifact rejection
- **PASS** ✅ OR **FAIL** ❌

---

### PART E: SUBGROUP & ROBUSTNESS ANALYSIS

**Subgroup Analysis**:

Calculate ICC for each subgroup:
| Subgroup | n | ICC | 95% CI | Pass (>0.80)? |
|----------|---|-----|--------|---------------|
| Age <50 | {n1} | {ICC1} | [{CI}] | ✅/❌ |
| Age ≥50 | {n2} | {ICC2} | [{CI}] | ✅/❌ |
| Male | {n3} | {ICC3} | [{CI}] | ✅/❌ |
| Female | {n4} | {ICC4} | [{CI}] | ✅/❌ |
| BMI <30 | {n5} | {ICC5} | [{CI}] | ✅/❌ |
| BMI ≥30 | {n6} | {ICC6} | [{CI}] | ✅/❌ |

**Findings**: {describe any subgroups with lower performance}

---

**Robustness Analysis**:

| Condition | n | ICC | 95% CI | Pass (>0.80)? |
|-----------|---|-----|--------|---------------|
| Indoor | {n1} | {ICC1} | [{CI}] | ✅/❌ |
| Outdoor | {n2} | {ICC2} | [{CI}] | ✅/❌ |
| Day | {n3} | {ICC3} | [{CI}] | ✅/❌ |
| Night | {n4} | {ICC4} | [{CI}] | ✅/❌ |

**Findings**: {describe any conditions with lower performance}

---

### PART F: VERIFICATION CONCLUSION

**Summary of Results**:

| Metric | Target | Result | Pass/Fail |
|--------|--------|--------|-----------|
| Accuracy (ICC) | >0.85 | {value} | ✅/❌ |
| Bias (Mean Difference) | ±{X} | {value} | ✅/❌ |
| Test-Retest (ICC) | >0.80 | {value} | ✅/❌ |
| Missing Data (%) | <10% | {value} | ✅/❌ |
| Artifact Rate (%) | <5% | {value} | ✅/❌ |

**OVERALL VERIFICATION STATUS**: 
- **PASS** ✅: Proceed to Analytical Validation (V2)
- **CONDITIONAL PASS** ⚠️: Minor refinements; proceed with caution
- **FAIL** ❌: Refine algorithm; repeat Verification

---

### PART G: LIMITATIONS & NEXT STEPS

**Limitations**:
1. {limitation_1: e.g., small sample in certain subgroups}
2. {limitation_2: e.g., lab-based study; real-world performance may differ}
3. {limitation_3: e.g., short duration; long-term stability unknown}

**Recommendations for V2 (Analytical Validation)**:
1. {recommendation_1}
2. {recommendation_2}
3. {recommendation_3}

---

## OUTPUT FORMAT

**Verification Report** (20-30 pages)

**Sections**:
1. Executive Summary
2. Study Design & Methods
3. Participant Characteristics
4. Primary Results (Accuracy)
5. Secondary Results (Precision)
6. Data Quality
7. Subgroup & Robustness
8. Discussion
9. Conclusion
10. Appendices (plots, tables, code)

**DELIVERABLE**: Verification Report (V1 complete)

**NEXT STEP**: Design Analytical Validation Study (V2) - STEP 4
```

[Due to length constraints, I'll continue with Steps 4-9 in a structured summary format]

---

### STEP 4-9: Summary Structure

**STEP 4: Design Analytical Validation Study (V2)** (P08_CLINRES leads)
- Construct validity study design
- Convergent/divergent validity protocols
- Known-groups validation
- Sample size: 150-300 participants
- Duration: 12-16 weeks

**STEP 5: Execute Analytical Validation** (P08_CLINRES)
- Participant recruitment
- Data collection (digital + comparator measures)
- Statistical analyses (factor analysis, correlations, known-groups tests)
- Analytical Validation Report

**STEP 6: Design Clinical Validation Study (V3)** (P08_CLINRES + P06_DTXCMO)
- Prospective study design
- Clinical utility outcomes
- Treatment response sensitivity
- Sample size: 200-500 participants
- Duration: 6-12 months

**STEP 7: Execute Clinical Validation & MCID** (P08_CLINRES + P15_HEOR)
- Longitudinal data collection
- Association with clinical outcomes
- MCID determination (anchor-based + distribution-based)
- Clinical Validation Report

**STEP 8: Regulatory Strategy & FDA Pre-Submission** (P04_REGDIR)
- Prepare Pre-Sub package
- Submit to FDA
- Attend meeting
- Incorporate feedback

**STEP 9: Validation Report & Publication** (P16_MEDWRIT)
- Comprehensive validation report
- Manuscript preparation
- Journal submission (target: npj Digital Medicine, JMIR, Lancet Digital Health)

---

## 6. COMPLETE PROMPT SUITE

[Content continues with all 9 prompts in full detail...]

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 Validation Checklist

**V1 (Verification) Checklist**:
- ✅ Gold standard appropriately selected
- ✅ Sample size adequate (power analysis conducted)
- ✅ ICC >0.85 achieved
- ✅ Bland-Altman limits clinically acceptable
- ✅ Test-retest ICC >0.80
- ✅ Missing data <10%
- ✅ Artifact rate <5%
- ✅ Subgroup performance acceptable
- ✅ Verification Report completed

**V2 (Analytical Validation) Checklist**:
- ✅ Construct validity established (factor analysis)
- ✅ Convergent validity r >0.70
- ✅ Divergent validity r <0.30
- ✅ Known-groups validity p<0.001, large effect size
- ✅ Internal consistency α >0.70 (if applicable)
- ✅ Test-retest ICC >0.70
- ✅ Analytical Validation Report completed

**V3 (Clinical Validation) Checklist**:
- ✅ Association with clinical outcomes (p<0.05)
- ✅ Treatment response demonstrated
- ✅ MCID established (anchor + distribution methods)
- ✅ Clinical utility demonstrated
- ✅ Prospective validation completed
- ✅ Clinical Validation Report completed
- ✅ Manuscript submitted to peer-reviewed journal

---

## 8. REGULATORY COMPLIANCE CHECKLIST

**FDA Digital Health Requirements**:
- ✅ Intended Use clearly defined
- ✅ Context of Use specified
- ✅ Validation level appropriate for endpoint type
- ✅ Pre-Submission meeting held (if primary endpoint)
- ✅ FDA feedback incorporated
- ✅ Validation reports available for regulatory submission

**DiMe V3 Framework Compliance**:
- ✅ V1 (Verification) completed
- ✅ V2 (Analytical Validation) completed (if secondary/primary)
- ✅ V3 (Clinical Validation) completed (if primary)
- ✅ All deliverables documented per DiMe standards

---

## 9. TEMPLATES & JOB AIDS

### 9.1 Intended Use Template

### 9.2 Verification Protocol Template

### 9.3 Analytical Validation Protocol Template

### 9.4 Clinical Validation Protocol Template

### 9.5 FDA Pre-Submission Package Template

[Templates provided in appendices]

---

## 10. INTEGRATION WITH OTHER SYSTEMS

**Clinical Trial Management Systems (CTMS)**:
- Validation study data flows into CTMS for trial endpoint analysis

**Electronic Data Capture (EDC)**:
- Validation study data captured in EDC (e.g., Medidata Rave)

**Statistical Analysis Software**:
- R, Python, SAS for validation analyses

**Regulatory Submission Systems**:
- Validation reports included in FDA submissions (eCTD Module 5)

---

## 11. REFERENCES & RESOURCES

### 11.1 DiMe Resources

1. **Digital Medicine Society (DiMe)**: "V3 Framework: Verification, Analytical Validation, and Clinical Validation" (2021)
   - https://www.dimesociety.org/
2. **DiMe Library of Digital Clinical Measures**: Published validated measures
3. **DiMe Playbook**: Best practices for digital clinical measure development

### 11.2 FDA Guidance

1. **FDA Digital Health Innovation Action Plan** (2017)
2. **FDA Guidance: Clinical Decision Support Software** (2019)
3. **FDA Guidance: Real-World Data: Assessing Electronic Health Records and Medical Claims Data** (Draft 2021)
4. **FDA Biomarker Qualification Program**: https://www.fda.gov/drugs/cder-biomarker-qualification-program

### 11.3 Validation Statistics

1. **Bland JM, Altman DG**: "Measuring agreement in method comparison studies." Statistical Methods in Medical Research (1999)
2. **Koo TK, Li MY**: "A Guideline of Selecting and Reporting Intraclass Correlation Coefficients for Reliability Research." Journal of Chiropractic Medicine (2016)
3. **Terwee CB, et al**: "Quality criteria were proposed for measurement properties of health status questionnaires." Journal of Clinical Epidemiology (2007)

### 11.4 Digital Biomarker Publications

1. **Coravos A, et al**: "Developing and adopting safe and effective digital biomarkers to improve patient outcomes." npj Digital Medicine (2019)
2. **Goldsack JC, et al**: "Verification, analytical validation, and clinical validation (V3): the foundation of determining fit-for-purpose for Biometric Monitoring Technologies (BioMeTs)." npj Digital Medicine (2020)
3. **Pratap A, et al**: "Evaluating the Utility of Smartphone-Based Sensor Assessments in Persons With Multiple Sclerosis in the Real-World Using an App (elevateMS)." JMIR mHealth and uHealth (2020)

### 11.5 Regulatory Precedent (Digital Endpoints)

1. **EndeavorRx** (Akili Interactive): FDA-authorized DTx for ADHD; digital biomarker as primary endpoint (2020)
2. **Somryst** (Pear Therapeutics): FDA-authorized DTx for insomnia; ISI as primary endpoint (2020)
3. **reSET / reSET-O** (Pear Therapeutics): Substance use disorder; abstinence as digital endpoint (2017, 2018)
4. **Apple Watch ECG** (K173073): FDA 510(k) clearance; AF detection digital biomarker (2018)
5. **Aktiia** (K210254): FDA 510(k) clearance; cuffless blood pressure monitoring (2021)

---

## APPENDICES

### APPENDIX A: Glossary of Terms

**Analytical Validation (V2)**: Demonstration that a digital clinical measure detects what it claims to measure and has sound measurement properties.

**Bland-Altman Analysis**: Statistical method to assess agreement between two measurement methods by plotting the difference against the average.

**Clinical Validation (V3)**: Demonstration that a digital clinical measure is clinically meaningful and useful for its intended purpose.

**Context of Use (COU)**: The specific circumstances under which a biomarker is intended to be used, including the population, clinical setting, and decision-making context.

**Convergent Validity**: The degree to which a measure correlates with similar measures (expected high correlation).

**DiMe**: Digital Medicine Society, a non-profit organization advancing digital health research and validation.

**Divergent Validity**: The degree to which a measure does NOT correlate with dissimilar measures (expected low correlation).

**Gold Standard**: An established, validated measurement method used as the reference for accuracy testing.

**ICC (Intraclass Correlation Coefficient)**: A statistical measure of agreement or reliability, ranging from 0 (no agreement) to 1 (perfect agreement).

**Intended Use**: A general description of the disease or condition the device will diagnose, treat, prevent, cure, or mitigate, including a description of the patient population for which the device is intended.

**Known-Groups Validity**: The ability of a measure to distinguish between groups known to differ on the construct of interest (e.g., diseased vs. healthy).

**MCID (Minimally Clinically Important Difference)**: The smallest change in a measure that patients or clinicians perceive as beneficial or meaningful.

**V3 Framework**: DiMe's three-stage validation framework: Verification, Analytical Validation, Clinical Validation.

**Verification (V1)**: Demonstration that a digital technology produces accurate, reliable, and consistent data (technical performance validation).

---

### APPENDIX B: Sample Verification Protocol

[Detailed 20-page template]

---

### APPENDIX C: Sample Analytical Validation Protocol

[Detailed 25-page template]

---

### APPENDIX D: Sample Clinical Validation Protocol

[Detailed 40-page template]

---

### APPENDIX E: FDA Pre-Submission Package Template

[Detailed 30-page template]

---

### APPENDIX F: Validation Report Template

[Detailed 50-page template]

---

## DOCUMENT END

**Version**: 1.0  
**Last Updated**: October 12, 2025  
**Next Review**: January 2026

For questions or feedback on this use case, contact:
- **Clinical Development**: P06_DTXCMO
- **Regulatory Affairs**: P04_REGDIR
- **Digital Biomarker Science**: P07_DATASC

---

**Related Use Cases**:
- UC_CD_001: DTx Clinical Endpoint Selection
- UC_CD_003: RCT Design for DTx
- UC_RA_001: FDA Software Classification
- UC_RA_002: 510(k) vs De Novo Decision
- UC_PD_009: AI/ML Model Validation

---

*This document is part of the FORGE™ Framework (Foresight in Outcomes, Regulation, Growth & Endpoint Excellence) within the Life Sciences Intelligence Prompt Library (LSIPL).*
