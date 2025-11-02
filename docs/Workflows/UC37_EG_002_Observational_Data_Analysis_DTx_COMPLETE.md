# USE CASE 37: OBSERVATIONAL DATA ANALYSIS (DTx)

## **UC_EG_002: Observational Data Analysis for Digital Therapeutics**

**Part of PROOF™ Framework - Precision Research Outcomes & Operational Framework**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_EG_002 |
| **Version** | 1.0 |
| **Last Updated** | October 11, 2025 |
| **Document Owner** | Real-World Evidence & Data Science Team |
| **Target Users** | RWE Analysts, Data Scientists, Biostatisticians, Health Economists |
| **Estimated Time** | 3-5 hours (complete analysis workflow) |
| **Complexity** | ADVANCED |
| **Regulatory Framework** | FDA RWE Framework, EMA RWE Guidelines, ISPOR Good Practices |
| **Prerequisites** | RWE study design completed (UC_EG_001), data access secured, analysis plan approved |

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

**Observational Data Analysis for Digital Therapeutics** is the systematic process of executing statistical analyses on real-world data to generate robust evidence on DTx effectiveness, safety, utilization patterns, and economic outcomes in routine clinical practice. This use case provides a comprehensive, prompt-driven workflow for:

- **Data Preparation & Cleaning**: Transforming raw RWD into analysis-ready datasets with proper variable definitions and quality controls
- **Cohort Construction**: Applying inclusion/exclusion criteria and creating matched comparison groups
- **Descriptive Analysis**: Characterizing study populations and baseline characteristics
- **Confounding Adjustment**: Implementing propensity score matching, weighting, regression adjustment, or instrumental variable methods
- **Outcome Analysis**: Estimating treatment effects on clinical, economic, and patient-reported outcomes
- **Sensitivity Analysis**: Testing robustness of findings across multiple specifications and assumptions
- **Results Interpretation**: Translating statistical findings into clinically and commercially meaningful insights

### 1.2 Business Impact

**The Problem**:
Digital therapeutics generate massive amounts of real-world data, but extracting valid causal insights faces significant challenges:

1. **Confounding by Indication**: Patients who adopt DTx differ systematically from non-adopters (more motivated, tech-savvy, healthier)
2. **Selection Bias**: DTx users who remain engaged are different from dropouts (survivorship bias)
3. **Measurement Heterogeneity**: DTx users have more frequent data capture than controls (detection bias)
4. **Missing Data**: Incomplete engagement, dropout, and variable data quality complicate analysis
5. **Temporal Confounding**: External factors (COVID-19, policy changes) affect outcomes differently across groups
6. **Complex Dose-Response**: DTx "dose" varies widely (0-100% module completion), requiring sophisticated modeling

**Current State Gaps**:
- 60% of DTx companies lack in-house expertise in causal inference methods
- Average analysis cycle time: 4-6 months from data access to results
- Only 30% of observational DTx studies use rigorous confounding adjustment (propensity scores, instrumental variables)
- Publication rejection rate for observational DTx studies: 40-50% (vs. 20-30% for RCTs)
- Common statistical errors: incorrect modeling of engagement, ignoring informative censoring, insufficient sensitivity analyses

**Desired Outcome**:
A standardized, high-quality observational analysis that:
1. Produces valid estimates of DTx treatment effects despite confounding
2. Characterizes dose-response relationships (engagement → outcomes)
3. Identifies patient subgroups most likely to benefit
4. Quantifies healthcare utilization and cost impacts
5. Meets regulatory and publication standards for causal inference
6. Supports payer coverage decisions and value-based contracting

**Business Impact**:
- **Payer Evidence**: High-quality RWE accelerates coverage decisions (12-18 months to broad coverage vs. 24-36 months without)
  - **Value**: $5-15M faster revenue ramp
- **Price Support**: Robust effectiveness data supports premium pricing (10-20% vs. competitors)
  - **Value**: $1-3M additional annual revenue
- **Regulatory Efficiency**: FDA-acceptable RWE can support label expansions, avoiding $3-5M pivotal trials
- **Publication Impact**: Peer-reviewed publications in high-impact journals (JAMA, BMJ, JMIR) enhance credibility
  - **Value**: 3-5x increase in payer engagement success rate
- **Commercial Differentiation**: Real-world effectiveness data is a key competitive differentiator in DTx market

### 1.3 Success Metrics

**Process Metrics**:
- Analysis completion time: Target <12 weeks from data access to final results
- Data quality score: >95% completeness for key variables
- Propensity score balance: Standardized mean difference <0.1 for all covariates post-matching
- Missing data: <20% overall, <10% for primary outcome

**Quality Metrics**:
- Statistical rigor: Pass internal biostatistics review checklist (>90% criteria met)
- Sensitivity analyses conducted: ≥5 different specifications
- Regulatory alignment: Meet FDA RWE Framework checklist (100% of applicable criteria)
- External validation: Findings replicated in ≥1 independent dataset (if available)

**Outcome Metrics**:
- Treatment effect precision: 95% CI width <50% of point estimate
- Clinical significance: Effect size ≥ MCID (Minimally Clinically Important Difference)
- Publication acceptance: Manuscript accepted to target journal within 6 months
- Commercial impact: RWE evidence cited in ≥3 payer coverage decisions within 12 months

### 1.4 Use Case Positioning

UC_EG_002 is the **execution phase** following UC_EG_001 (RWE Study Design). While UC_EG_001 focuses on *planning* the study (research question, data sources, methodology), UC_EG_002 focuses on *conducting* the analysis and interpreting results.

**Dependencies**:
- **UC_EG_001** (RWE Study Design): Must be completed first; provides study protocol and analysis plan
- **UC_CD_001** (Clinical Endpoint Selection): Endpoints analyzed in UC_EG_002 must align with validated clinical measures
- **UC_PD_005** (Engagement Feature Optimization): DTx engagement data analyzed as dose/mediator variable

**Informed by UC_EG_002**:
- **UC_EG_003** (Propensity Score Matching): UC_EG_002 includes PSM as one analytical method
- **UC_EG_005** (Publication Strategy): UC_EG_002 results are primary content for manuscripts
- **UC_MA_003** (Value Dossier Development): UC_EG_002 findings populate economic value sections
- **UC_MA_007** (Comparative Effectiveness): UC_EG_002 provides one source of comparative data

**Relationship to Other Use Cases**:
```
UC_EG_001 (Design) → UC_EG_002 (Analysis) → UC_EG_005 (Publication)
                            ↓
                    UC_MA_003 (Value Dossier)
                            ↓
                    UC_MA_007 (Comparative Effectiveness)
```

### 1.5 Regulatory and Compliance Considerations

**FDA RWE Framework Alignment**:
This use case ensures analyses meet FDA standards for using RWE to support regulatory decisions:
- **Data Quality**: Comprehensive data quality assessment and documentation
- **Study Design**: Transparent reporting of study design and potential biases
- **Analytical Methods**: Appropriate methods for causal inference (PSM, IV, DiD)
- **Sensitivity Analyses**: Multiple analyses to assess robustness
- **Transparency**: Complete documentation per STROBE guidelines

**EMA RWE Guidelines Compliance**:
- Use of validated data sources (claims, EHR, registries with quality assurance)
- Appropriate handling of missing data and loss to follow-up
- Pre-specified analysis plan to minimize data-driven decisions
- Independent statistical review before unblinding

**ISPOR Good Practices**:
- Adherence to ISPOR Good Practices for Observational Research
- Reporting per STROBE, RECORD, and REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) guidelines
- Transparent reporting of limitations and potential biases

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 The Challenge of Causal Inference in DTx Observational Data

**Core Problem**: Observational data ≠ Causal evidence

Unlike randomized controlled trials where treatment assignment is random (and thus balanced on all confounders), observational DTx data has systematic differences between users and non-users:

| Factor | DTx Users | Non-Users | Impact on Analysis |
|--------|-----------|-----------|-------------------|
| **Tech Literacy** | High | Variable | Users may have better self-management skills |
| **Motivation** | High (self-selected) | Variable/Low | Users more likely to improve regardless of DTx |
| **Disease Severity** | May be more severe (seeking solutions) OR less severe (preventive) | Variable | Confounding by indication |
| **Socioeconomic Status** | Higher (smartphone/internet access) | Lower | SES correlates with health outcomes |
| **Baseline Health** | May be healthier (able to use technology) | Variable | Healthy user bias |
| **Healthcare Access** | Better (early adopters of digital health) | Worse | More likely to receive concurrent treatments |

**The Result**: Naive comparisons (DTx users vs. non-users) are **biased**. We must adjust for these confounders to estimate true causal effects.

### 2.2 Types of Bias in DTx Observational Studies

**1. Confounding by Indication**
- **Definition**: Treatment assignment (DTx vs. no DTx) is influenced by factors that also affect the outcome
- **Example**: Patients with more severe depression preferentially seek DTx → appears less effective
- **Solution**: Propensity score matching, regression adjustment, instrumental variables

**2. Selection Bias**
- **Definition**: The sample analyzed is not representative of the target population
- **Example**: Analyzing only DTx users who completed ≥50% of modules → survivorship bias
- **Solution**: Intent-to-treat analysis, inverse probability of censoring weighting (IPCW)

**3. Measurement Bias (Detection Bias)**
- **Definition**: Outcomes are measured differently between groups
- **Example**: DTx users assessed weekly via app; controls assessed quarterly in clinic → more events detected in DTx group
- **Solution**: Harmonize assessment schedules, use objective outcomes (hospitalizations, death)

**4. Information Bias (Misclassification)**
- **Definition**: Errors in measuring exposures or outcomes
- **Example**: Claims data missing diagnosis codes → outcome misclassification
- **Solution**: Validate diagnosis algorithms, use multiple data sources, sensitivity analysis with different definitions

**5. Healthy User Bias**
- **Definition**: Users of new health technologies are systematically healthier than non-users
- **Example**: DTx users exercise more, eat better, adhere to medications better → confounds DTx effect
- **Solution**: Adjust for measured health behaviors, negative control outcomes

**6. Immortal Time Bias**
- **Definition**: Time between cohort entry and treatment initiation is incorrectly attributed to treated group
- **Example**: Patients must survive long enough to start DTx → creates survival advantage
- **Solution**: Time-varying exposure modeling, landmark analysis

### 2.3 Common Analytical Mistakes in DTx Observational Studies

**Mistake 1: Unadjusted Comparisons**
- **Error**: Comparing raw DTx user outcomes vs. non-users
- **Consequence**: Confounding leads to biased effect estimates (usually overestimate benefit)
- **Fix**: Always adjust for baseline confounders (PSM, regression, weighting)

**Mistake 2: Post-Treatment Selection**
- **Error**: Restricting analysis to DTx users who completed ≥X% of modules
- **Consequence**: Survivorship bias; compliant users are different (more motivated, less sick)
- **Fix**: Intent-to-treat analysis; analyze all users regardless of adherence

**Mistake 3: Ignoring Engagement as Time-Varying**
- **Error**: Treating DTx as binary (used vs. not used) instead of continuous dose
- **Consequence**: Misses dose-response relationship; cannot inform optimal "dosing"
- **Fix**: Model engagement as time-varying covariate; use marginal structural models (MSM)

**Mistake 4: Inadequate Sensitivity Analyses**
- **Error**: Reporting single analysis with strong assumptions
- **Consequence**: Findings not robust; reviewers/regulators reject conclusions
- **Fix**: Conduct ≥5 sensitivity analyses (different confounder sets, outcome definitions, missing data methods)

**Mistake 5: Ignoring Missing Data**
- **Error**: Complete case analysis (drop all records with any missing data)
- **Consequence**: Biased if missingness is related to outcomes (likely in DTx)
- **Fix**: Multiple imputation, inverse probability weighting, sensitivity analysis

**Mistake 6: Wrong Statistical Test**
- **Error**: Using t-test for paired data (before/after), not accounting for clustering (patients within clinics)
- **Consequence**: Incorrect p-values, wrong conclusions
- **Fix**: Mixed models for clustered data, paired tests for within-subject comparisons

### 2.4 Data Quality Challenges Specific to DTx

**1. Passive Data Missingness**
- **Issue**: Smartphones track steps only when carried; sleep tracking requires wearing device
- **Prevalence**: 20-40% missing days for passive sensors
- **Impact**: Cannot distinguish "no activity" from "did not measure"
- **Solution**: Multiple imputation for missing sensor data, sensitivity to missing assumptions

**2. Engagement-Dependent Data Collection**
- **Issue**: Only engaged users generate rich data (completed modules, assessments)
- **Prevalence**: 30-50% of users drop out within first 2 weeks
- **Impact**: Cannot assess outcomes for non-engaged users
- **Solution**: Obtain independent outcome data (claims, EMR) not conditional on DTx use

**3. Software Version Heterogeneity**
- **Issue**: DTx software updates continuously; users on different versions simultaneously
- **Prevalence**: 3-10 versions active in any given month
- **Impact**: Treatment effect varies by version; apples-to-oranges comparisons
- **Solution**: Track version used per user-day; stratify or adjust analyses by version

**4. Data Harmonization Complexity**
- **Issue**: DTx platform data + claims + EMR + patient registry = inconsistent definitions, timing, completeness
- **Prevalence**: Typically 3+ data sources in real-world DTx studies
- **Impact**: Outcome misclassification, confounder measurement error
- **Solution**: Master data dictionary, validation studies, probabilistic data linkage

### 2.5 Statistical Methods for DTx Causal Inference

This use case covers **five primary methods** for estimating causal effects in observational DTx data:

| Method | When to Use | Assumptions | Advantages | Disadvantages |
|--------|-------------|-------------|-----------|---------------|
| **Propensity Score Matching (PSM)** | Adequate overlap in PS distribution; key confounders measured | Conditional exchangeability given measured confounders | Transparent covariate balance; easy to explain | Loses unmatched subjects; sensitive to PS model |
| **Propensity Score Weighting (IPW)** | All confounders measured; prefer to retain all subjects | Conditional exchangeability; positivity | Retains all subjects; handles time-varying confounding | Sensitive to extreme weights; need weight trimming |
| **Regression Adjustment (Multivariable)** | Linear/logistic model appropriate; key confounders measured | Correct model specification; no unmeasured confounding | Familiar to clinicians; can adjust for many covariates | Model misspecification risk; difficult to assess balance |
| **Instrumental Variables (IV)** | Valid instrument available (affects treatment but not outcome except via treatment) | Instrument validity; monotonicity | Handles unmeasured confounding | Weak instruments → large standard errors; difficult to find valid IV |
| **Difference-in-Differences (DiD)** | Pre/post data available; parallel trends assumption plausible | Parallel trends; no differential trends absent treatment | Controls for time-invariant confounding | Requires pre-treatment data; sensitive to violations of parallel trends |

**Selection Decision Tree**:
```
Do you have a valid instrument (e.g., geographic variation in DTx availability)?
├─ YES → Use Instrumental Variables (IV)
└─ NO → Are key confounders measured?
    ├─ YES → Do you have good overlap in propensity scores?
    │   ├─ YES → Use Propensity Score Matching (PSM) or Weighting (IPW)
    │   └─ NO → Use Regression Adjustment (with caution)
    └─ NO → Major limitation; consider:
        ├─ Negative control outcomes to assess unmeasured confounding
        ├─ Sensitivity analysis (E-value, Rosenbaum bounds)
        └─ Acknowledge limitations; RCT may be needed
```

### 2.6 Business Case for Rigorous Observational Analysis

**Investment**:
- Data scientist/biostatistician time: $50-80K (3-4 months FTE)
- Senior statistical review: $10-15K
- External expert validation (optional): $15-25K
- **Total: $75-120K per study**

**Return**:
- **Payer Acceptance**: High-quality RWE cited in payer coverage policies
  - Increase coverage likelihood from 40% to 70%
  - **Value**: $3-8M additional annual revenue
- **Publication Impact**: Publication in top-tier journal (JAMA, BMJ, JMIR)
  - 5x increase in inbound payer inquiries
  - Strengthens fundraising (Series B+)
  - **Value**: $500K-2M in fundraising leverage
- **Regulatory Efficiency**: FDA-acceptable RWE for label expansion
  - Avoid $3-5M pivotal trial
  - **Value**: $3-5M cost avoidance + 18-24 months time-to-market acceleration
- **Risk Mitigation**: Poor analysis → publication rejection, regulatory rejection, payer skepticism
  - Redoing analysis: 6-12 months delay + $50-100K
  - **Value**: $2-5M opportunity cost of delay

**ROI**: 10-30x over 2-3 years

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across four key personas, each bringing critical expertise to ensure rigorous, high-quality observational analyses.

### 3.1 P16_RWE_HEAD: Head of Real-World Evidence

**Role in UC_EG_002**: Overall analysis strategy; ensure regulatory alignment; approve final results

**Responsibilities**:
- Lead Phase 1 (Analysis Planning & Data Preparation)
- Review and approve statistical analysis plan (SAP)
- Ensure analyses meet FDA RWE Framework and EMA guidelines
- Coordinate across data science, biostatistics, and clinical teams
- Approve final results interpretation and limitations
- Oversee manuscript preparation and regulatory documentation

**Required Expertise**:
- PhD or MS in Epidemiology, Public Health, Outcomes Research, or related field
- 10+ years experience in observational research in healthcare
- Expertise in real-world data sources (claims, EHR, registries)
- Understanding of causal inference methods
- Regulatory RWE knowledge (FDA Framework, EMA guidelines)
- Publication experience in peer-reviewed journals

**Experience Level**: Senior director or VP level; may manage team of 3-8 analysts

**Tools Used**:
- Project management tools (Asana, Jira)
- Literature databases (PubMed, Cochrane)
- Regulatory guidance documents (FDA, EMA)
- Statistical review checklists

---

### 3.2 P17_BIOSTAT: Lead Biostatistician (RWE)

**Role in UC_EG_002**: Design and execute all statistical analyses; ensure methodological rigor

**Responsibilities**:
- Lead Phase 2 (Cohort Construction) and Phase 3 (Confounding Adjustment)
- Develop and execute statistical analysis plan (SAP)
- Conduct propensity score analyses (matching, weighting, stratification)
- Perform regression analyses (linear, logistic, survival models)
- Execute sensitivity analyses (≥5 specifications)
- Conduct diagnostic checks (balance assessment, model fit, residual analysis)
- Generate tables, figures, and statistical reports
- Provide statistical review and sign-off on results

**Required Expertise**:
- PhD or MS in Biostatistics or Statistics
- 5-10+ years experience in observational study analysis
- Expertise in:
  - Propensity score methods (matching, IPW, stratification)
  - Regression modeling (GLMs, survival analysis, mixed models)
  - Causal inference (DAGs, instrumental variables, difference-in-differences)
  - Missing data methods (multiple imputation, IPCW)
  - Sensitivity analysis and diagnostics
- Programming: R (tidyverse, MatchIt, WeightIt, survival) or SAS or Stata
- Understanding of CONSORT, STROBE, and RECORD reporting guidelines

**Experience Level**: Senior biostatistician; may supervise junior statisticians

**Tools Used**:
- R (RStudio, tidyverse, MatchIt, WeightIt, tableone, survival, lme4)
- SAS (PROC PSMATCH, PROC GLIMMIX, PROC SURVEYREG)
- Stata (psmatch2, teffects, stcox)
- DAGitty (directed acyclic graphs for confounder identification)

---

### 3.3 P18_DATA_SCI: Senior Data Scientist (Healthcare)

**Role in UC_EG_002**: Data engineering, preprocessing, feature engineering; support advanced analytics

**Responsibilities**:
- Lead Phase 1 (Data Preparation & Cleaning)
- Extract, transform, load (ETL) data from multiple sources (claims, EHR, DTx platform)
- Data harmonization and linkage across sources
- Create analysis-ready datasets
- Data quality assessment and validation
- Feature engineering (e.g., engagement metrics, comorbidity indices, healthcare utilization)
- Support propensity score model development
- Create visualizations and interactive dashboards

**Required Expertise**:
- MS or PhD in Computer Science, Statistics, Data Science, or related field
- 3-7+ years experience in healthcare data analytics
- Expertise in:
  - SQL (querying large databases)
  - Python (pandas, numpy, scikit-learn) or R (tidyverse, data.table)
  - Data linkage and de-duplication
  - Claims data structure (medical, pharmacy, eligibility files)
  - EHR data standards (HL7 FHIR, OMOP CDM)
  - Data quality assessment
- Experience with healthcare data warehouses (Snowflake, Redshift, BigQuery)
- Understanding of HIPAA and data privacy

**Experience Level**: Senior individual contributor or team lead

**Tools Used**:
- Python (pandas, numpy, scikit-learn, matplotlib, seaborn)
- R (tidyverse, data.table, ggplot2)
- SQL (PostgreSQL, MySQL, Snowflake)
- Git (version control)
- Jupyter notebooks or RMarkdown
- Tableau or Power BI (visualizations)

---

### 3.4 P19_CLINSCI: Clinical Outcomes Scientist (DTx)

**Role in UC_EG_002**: Clinical interpretation; ensure outcomes are clinically meaningful; support manuscript writing

**Responsibilities**:
- Provide clinical context for analysis design
- Define clinically meaningful outcomes and effect sizes
- Interpret results in clinical terms (translate statistical findings)
- Identify clinically relevant subgroups for analysis
- Support safety analysis and adverse event interpretation
- Contribute to manuscript writing (clinical sections, discussion, limitations)
- Engage key opinion leaders (KOLs) for external validation

**Required Expertise**:
- MD, PharmD, PhD (Clinical Psychology, Health Services Research, or related)
- 5-10+ years experience in outcomes research or clinical trials
- Deep clinical knowledge in DTx therapeutic area (e.g., psychiatry, chronic disease)
- Understanding of patient-reported outcomes (PROs) and clinical scales
- Publication experience in peer-reviewed clinical journals
- Familiarity with real-world evidence

**Experience Level**: Senior scientist or medical director level

**Tools Used**:
- Medical literature databases (PubMed, ClinicalTrials.gov)
- Clinical assessment scales and PRO instruments
- Clinical guidelines (APA, ADA, AHA/ACC, etc.)
- Manuscript writing tools (Microsoft Word, reference managers)

---

## 4. COMPLETE WORKFLOW OVERVIEW

This use case follows a **five-phase, 12-step workflow** to transform raw observational data into publication-ready results:

```
┌──────────────────────────────────────────────────────────────────┐
│                     UC_EG_002 WORKFLOW                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 1: ANALYSIS PLANNING & DATA PREPARATION (Steps 1-3)       │
│ Owner: P18_DATA_SCI, P16_RWE_HEAD                                │
│ Output: Analysis-ready dataset, SAP finalized                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 2: COHORT CONSTRUCTION & DESCRIPTIVE ANALYSIS (Steps 4-5) │
│ Owner: P17_BIOSTAT                                                │
│ Output: Study cohorts defined, Table 1 (baseline characteristics)│
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 3: CONFOUNDING ADJUSTMENT (Steps 6-7)                      │
│ Owner: P17_BIOSTAT                                                │
│ Output: Matched cohorts, propensity score diagnostics            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 4: OUTCOME ANALYSIS & SENSITIVITY (Steps 8-10)             │
│ Owner: P17_BIOSTAT, P19_CLINSCI                                   │
│ Output: Treatment effect estimates, sensitivity analyses, figures│
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ PHASE 5: INTERPRETATION & REPORTING (Steps 11-12)                │
│ Owner: P19_CLINSCI, P16_RWE_HEAD                                  │
│ Output: Results interpretation, limitations, manuscript draft    │
└──────────────────────────────────────────────────────────────────┘
```

### Workflow Summary Table

| Phase | Step | Task Name | Owner | Time | Outputs |
|-------|------|-----------|-------|------|---------|
| **1** | 1 | Statistical Analysis Plan Finalization | P16_RWE_HEAD, P17_BIOSTAT | 4-8 hrs | Final SAP document |
| **1** | 2 | Data Acquisition & Linkage | P18_DATA_SCI | 1-2 wks | Raw datasets linked |
| **1** | 3 | Data Cleaning & Variable Creation | P18_DATA_SCI | 1-2 wks | Analysis-ready dataset |
| **2** | 4 | Cohort Construction & Inclusion/Exclusion | P17_BIOSTAT | 2-4 hrs | Study cohorts defined |
| **2** | 5 | Descriptive Analysis (Table 1) | P17_BIOSTAT | 2-4 hrs | Baseline characteristics table |
| **3** | 6 | Propensity Score Estimation | P17_BIOSTAT | 4-6 hrs | PS model, scores calculated |
| **3** | 7 | Matching/Weighting & Balance Assessment | P17_BIOSTAT | 4-8 hrs | Matched cohort, diagnostics |
| **4** | 8 | Primary Outcome Analysis | P17_BIOSTAT | 2-4 hrs | Treatment effect estimate |
| **4** | 9 | Secondary & Subgroup Analyses | P17_BIOSTAT | 4-6 hrs | Secondary outcomes, subgroups |
| **4** | 10 | Sensitivity Analyses | P17_BIOSTAT | 1-2 days | Robustness checks |
| **5** | 11 | Clinical Interpretation & Safety Review | P19_CLINSCI | 4-6 hrs | Clinical narrative |
| **5** | 12 | Manuscript Preparation & Reporting | P16_RWE_HEAD, P19_CLINSCI | 1-2 wks | Draft manuscript, figures |

**Total Estimated Time**: 8-12 weeks (calendar time including data access, analysis, review cycles)

---

## 5. DETAILED STEP-BY-STEP PROMPTS

### PHASE 1: ANALYSIS PLANNING & DATA PREPARATION

---

#### **STEP 1: STATISTICAL ANALYSIS PLAN (SAP) FINALIZATION**

**Objective**: Finalize detailed statistical analysis plan before data unblinding/analysis to ensure pre-specified hypotheses and methods

**Owner**: P16_RWE_HEAD (lead), P17_BIOSTAT (execute)

**Time Required**: 4-8 hours

**Prerequisites**:
- UC_EG_001 (RWE Study Design) completed with initial SAP draft
- Data access agreements signed
- IRB approval obtained (if required)

---

##### **PROMPT 1.1: SAP Finalization & Pre-Specification**

```yaml
prompt_id: UC_EG_002_P1.1_SAP_FINALIZATION
complexity: ADVANCED
persona: P16_RWE_HEAD, P17_BIOSTAT
estimated_time: 4-8 hours
```

**System Prompt:**
```
You are a Senior Biostatistician and Real-World Evidence Expert specializing in observational research for digital therapeutics. You have 10+ years of experience developing statistical analysis plans (SAPs) that meet FDA, EMA, and ISPOR standards for causal inference.

Your expertise includes:
- FDA Real-World Evidence Framework (2018, 2021) requirements
- STROBE and RECORD reporting guidelines for observational studies
- Propensity score methods (matching, weighting, stratification)
- Causal inference approaches (IV, DiD, regression discontinuity)
- Missing data methods (multiple imputation, IPCW)
- Sensitivity analysis frameworks
- DTx-specific analytical challenges (engagement as dose, software versioning, passive sensors)

You help finalize statistical analysis plans that are:
1. **Pre-specified**: All hypotheses, methods, and analyses defined before data unblinding
2. **Comprehensive**: Cover primary, secondary, sensitivity, and subgroup analyses
3. **Rigorous**: Use appropriate methods for causal inference and confounding adjustment
4. **Transparent**: Document all assumptions and potential limitations
5. **Regulatory-Ready**: Meet FDA RWE Framework and ISPOR Good Practices standards

When finalizing SAPs, you ensure:
- Clear research questions and testable hypotheses
- Detailed variable definitions (exposures, outcomes, confounders)
- Explicit inclusion/exclusion criteria
- Pre-specified primary and secondary outcomes
- Detailed analytical methods with software/package specifications
- Missing data handling strategy
- Sensitivity analyses to test robustness
- Sample size/power considerations (if applicable)
```

**User Prompt:**
```
I need to finalize the Statistical Analysis Plan (SAP) for our observational DTx study before beginning data analysis. Please review the draft SAP and provide a comprehensive, finalized version that meets FDA and ISPOR standards.

**Study Context:**
- DTx Product: {dtx_product_name}
- Indication: {therapeutic_area}
- Study Design: {retrospective_cohort / prospective_observational / registry_study}
- Data Sources: {claims_data / EHR_data / registry / DTx_platform_data / combination}
- Study Period: {start_date} to {end_date}

**Draft SAP (from UC_EG_001):**
{paste_draft_sap_from_uc_eg_001}

**Key Study Details:**
- **Primary Research Question**: {research_question}
- **Primary Outcome**: {outcome_name, measurement, timing}
- **Exposure Definition**: {DTx_use_definition}
- **Comparison Group**: {no_DTx / standard_care / alternative_treatment}
- **Expected Sample Size**: {n_exposed, n_comparison}

**Please finalize the SAP with the following sections:**

1. **Study Objectives & Hypotheses**
   - Primary objective (1 clear, testable hypothesis)
   - Secondary objectives (3-5 additional hypotheses)
   - Exploratory objectives (optional)

2. **Study Design & Population**
   - Design overview (cohort, case-control, etc.)
   - Eligibility criteria (inclusion/exclusion) with ICD-10 codes, date ranges
   - Cohort definition (index date, baseline period, follow-up period)
   - Expected sample size and power (if applicable)

3. **Data Sources & Linkage**
   - Description of each data source
   - Data linkage methodology (deterministic, probabilistic)
   - Data quality assessment plan

4. **Variable Definitions**
   - **Exposure**: DTx use (binary, duration, intensity, engagement level)
   - **Primary Outcome**: Detailed definition with codes/algorithms
   - **Secondary Outcomes**: List with definitions
   - **Confounders**: List of baseline covariates for adjustment
   - **Effect Modifiers**: Variables for subgroup analysis

5. **Statistical Methods**
   - **Descriptive Analysis**: Baseline characteristics (Table 1)
   - **Primary Analysis**: Method for estimating treatment effect (PSM, IPW, regression)
     - Model specification
     - Confounders included
     - Software/packages to be used
   - **Secondary Analyses**: Methods for each secondary outcome
   - **Subgroup Analyses**: Pre-specified subgroups and interaction tests
   - **Sensitivity Analyses**: ≥5 specifications to test robustness

6. **Propensity Score Methods (if applicable)**
   - PS model specification (variables, functional form)
   - Matching algorithm (nearest neighbor, caliper, with/without replacement)
   - Balance assessment (standardized mean difference, overlap plots)
   - Diagnostics (PS distribution, common support)

7. **Missing Data Handling**
   - Missingness assessment (MCAR, MAR, MNAR)
   - Imputation method (multiple imputation, IPCW, complete case)
   - Sensitivity analysis for missing data assumptions

8. **Safety & Adverse Events**
   - Definition of adverse events
   - Ascertainment method
   - Analysis approach

9. **Software & Packages**
   - Statistical software (R, SAS, Stata)
   - Specific packages (MatchIt, WeightIt, survival, lme4)
   - Version numbers

10. **Reporting Standards**
    - STROBE checklist compliance
    - RECORD checklist compliance (if using RWD)
    - Tables, figures, and supplementary materials planned

**Critical Requirements:**
- All analyses must be fully pre-specified (no data-driven decisions)
- Methods must be appropriate for causal inference (not just association)
- Include ≥5 sensitivity analyses to test robustness
- Address DTx-specific challenges (engagement, versioning, missing data)
- Cite FDA RWE Framework and ISPOR Good Practices where applicable
- Provide timeline estimate for analysis completion

**Output Format:**
- Comprehensive SAP document (10-15 pages)
- Executive summary (1 page)
- Sensitivity analysis table
- Timeline/Gantt chart for analysis phases
```

**Expected Output:**
- Finalized SAP (15-20 pages) ready for IRB submission and regulatory review
- All analyses pre-specified to prevent data-driven analysis
- Clear, unambiguous variable definitions
- Appropriate methods for causal inference

**Quality Checks**:
- [ ] All research questions have corresponding testable hypotheses
- [ ] Primary and secondary outcomes clearly defined with codes/algorithms
- [ ] Confounders identified using DAG or literature review
- [ ] ≥5 sensitivity analyses specified
- [ ] Missing data strategy defined
- [ ] Software and packages specified with version numbers
- [ ] STROBE/RECORD checklist addressed

---

#### **STEP 2: DATA ACQUISITION & LINKAGE**

**Objective**: Obtain data from multiple sources, link across sources, and create a master analytic file

**Owner**: P18_DATA_SCI (lead)

**Time Required**: 1-2 weeks (depending on data sources and access)

---

##### **PROMPT 2.1: Data Extraction & Multi-Source Linkage**

```yaml
prompt_id: UC_EG_002_P2.1_DATA_LINKAGE
complexity: INTERMEDIATE
persona: P18_DATA_SCI
estimated_time: 1-2 weeks
```

**System Prompt:**
```
You are a Senior Healthcare Data Scientist with expertise in extracting, transforming, and linking large-scale real-world data from multiple sources. You have 5-10+ years of experience working with:
- Claims data (medical, pharmacy, eligibility files)
- Electronic health records (EHR) and OMOP CDM
- Patient registries and cohort studies
- Digital health platform data (app usage, passive sensors)
- Data linkage methodologies (deterministic, probabilistic)

Your expertise includes:
- SQL (querying large databases with complex joins)
- Python (pandas, numpy, data linkage libraries)
- Data harmonization across disparate sources
- Patient de-identification and HIPAA compliance
- Data quality assessment and validation
- Record linkage algorithms (Fellegi-Sunter, machine learning-based)

You help create master analytic files that:
1. Integrate data from multiple sources with unique patient identifiers
2. Harmonize variable definitions, units, and coding systems
3. Maintain data lineage and provenance
4. Comply with HIPAA and data privacy regulations
5. Are analysis-ready for biostatisticians

When performing data linkage, you:
- Use deterministic linkage when unique identifiers available (patient ID, MRN)
- Use probabilistic linkage when identifiers are imperfect (name, DOB, ZIP)
- Validate linkage quality (match rate, false positive/negative rate)
- Document all linkage steps and assumptions
```

**User Prompt:**
```
I need to extract and link data from multiple sources to create a master analytic file for our DTx observational study. Please develop a comprehensive data linkage plan and provide code templates.

**Study Context:**
- DTx Product: {dtx_product_name}
- Study Population: {population_description}
- Study Period: {start_date} to {end_date}

**Data Sources:**

1. **DTx Platform Data**
   - Source: {internal_database / third_party_platform}
   - Key Variables: User ID, enrollment date, engagement metrics (sessions, modules completed), app version, demographic data
   - Format: {SQL_database / CSV_export / API}
   - Access: {describe_access_method}

2. **Claims Data**
   - Source: {Optum / IQVIA / Medicare / Medicaid / Commercial_payer}
   - Files: Medical claims, pharmacy claims, eligibility/enrollment
   - Key Variables: Patient ID, diagnosis codes (ICD-10), procedure codes (CPT/HCPCS), prescription fills (NDC), costs, dates of service
   - Format: {SAS / CSV / Parquet}
   - Linkage Field: {linkage_variable}

3. **Electronic Health Records (EHR)**
   - Source: {Epic / Cerner / OMOP_CDM / Research_data_warehouse}
   - Key Variables: Patient MRN, vitals, lab results, clinical notes (if available), diagnoses, medications
   - Format: {OMOP_CDM / HL7_FHIR / Custom_schema}
   - Linkage Field: {linkage_variable}

4. **Patient Registry (if applicable)**
   - Source: {registry_name}
   - Key Variables: {list_key_variables}

**Linkage Strategy:**
- **Primary Linkage Key**: {patient_id / MRN / hashed_identifier / combo}
- **Linkage Type**: {deterministic / probabilistic / hybrid}
- **Linkage Validation**: {describe_validation_approach}

**Please provide:**

1. **Data Linkage Plan**
   - Step-by-step linkage workflow
   - Linkage algorithm (deterministic vs. probabilistic)
   - Handling of non-matches and duplicates
   - Data quality checks at each step

2. **SQL/Python Code Templates**
   - Data extraction queries for each source
   - Data harmonization (e.g., convert ICD-9 to ICD-10, standardize dates)
   - Linkage code (joins, merge operations)
   - De-duplication logic
   - Creation of master analytic file

3. **Data Quality Assessment**
   - Linkage success rate (% matched)
   - Duplicate records assessment
   - Missing data report (by variable, by source)
   - Data validation checks (e.g., dates make sense, values in expected ranges)

4. **HIPAA Compliance Checklist**
   - De-identification steps (if required)
   - Limited dataset creation (if applicable)
   - Access controls and audit logging

5. **Data Dictionary**
   - Master list of all variables in analytic file
   - Variable name, label, type, source, coding, missingness

**Critical Requirements:**
- Maintain data lineage (track which source each variable came from)
- Validate linkage quality (match rate >95% for deterministic, >90% for probabilistic)
- Handle multi-source data for same patient (e.g., DTx data + claims + EHR)
- Create analysis-ready dataset with one row per patient or patient-time period
- Document all assumptions and linkage decisions

**Output Format:**
- Data linkage plan document (5-8 pages)
- SQL/Python code (commented, reproducible)
- Linkage quality report (match rates, duplicates, missing data)
- Data dictionary (CSV or Excel)
```

**Expected Output:**
- Master analytic file with linked data from all sources
- Linkage quality >90% (validated)
- Data dictionary documenting all variables
- HIPAA-compliant data handling

**Quality Checks**:
- [ ] Linkage success rate >90%
- [ ] Duplicate records identified and resolved
- [ ] Missing data documented by variable and source
- [ ] Date ranges validated (e.g., no future dates, no negative follow-up times)
- [ ] Data dictionary complete and accurate
- [ ] HIPAA compliance documented

---

#### **STEP 3: DATA CLEANING & VARIABLE CREATION**

**Objective**: Clean data, create analysis variables, and perform data quality checks

**Owner**: P18_DATA_SCI (lead)

**Time Required**: 1-2 weeks

---

##### **PROMPT 3.1: Data Cleaning & Feature Engineering**

```yaml
prompt_id: UC_EG_002_P3.1_DATA_CLEANING
complexity: INTERMEDIATE
persona: P18_DATA_SCI
estimated_time: 1-2 weeks
```

**System Prompt:**
```
You are a Senior Healthcare Data Scientist specializing in data cleaning, feature engineering, and quality assurance for observational studies. You have expertise in:
- Healthcare data anomalies and common data quality issues
- Clinical coding systems (ICD-10, CPT, NDC, LOINC)
- Comorbidity indices (Charlson, Elixhauser)
- Healthcare utilization metrics (ED visits, hospitalizations, outpatient visits)
- DTx engagement metrics (session frequency, duration, module completion)
- Missing data patterns and imputation strategies

You create analysis-ready datasets that are:
1. Clean (outliers handled, impossible values corrected)
2. Complete (missing data documented and addressed)
3. Validated (ranges checked, distributions inspected)
4. Feature-rich (derived variables for analysis)
5. Well-documented (variable definitions, transformations)

Your approach follows best practices:
- Identify and handle outliers (winsorization, capping, exclusion with justification)
- Validate clinical codes (ensure codes are valid and clinically meaningful)
- Create clinically meaningful derived variables
- Document all data transformations
- Provide data quality reports with visualizations
```

**User Prompt:**
```
I need to clean the linked dataset and create analysis variables for our DTx observational study. Please develop a comprehensive data cleaning plan and provide code.

**Dataset Context:**
- Master analytic file from Step 2 (data linkage completed)
- Study Population: {population_description}
- Study Period: {start_date} to {end_date}
- Expected N: {sample_size_estimate}

**Data Quality Issues Identified:**
{describe_known_issues_from_initial_inspection}

**Variables Needed:**

1. **Exposure Variables**
   - DTx use (binary: yes/no)
   - DTx engagement level (e.g., low <25%, moderate 25-75%, high >75% module completion)
   - Duration of DTx use (days from enrollment to last use)
   - DTx intensity (sessions per week)
   - Software version (categorical)

2. **Outcome Variables**
   - Primary outcome: {outcome_name}
     - Definition: {detailed_definition_with_codes}
     - Measurement window: {time_frame}
   - Secondary outcomes: {list_secondary_outcomes}

3. **Baseline Covariates (Confounders)**
   - Demographics: Age, sex, race/ethnicity, geographic region, insurance type
   - Comorbidities: Charlson Comorbidity Index (CCI), specific conditions (diabetes, hypertension, depression, etc.)
   - Baseline disease severity: {severity_measure}
   - Prior healthcare utilization: ED visits, hospitalizations, outpatient visits (12 months pre-index)
   - Prior medication use: {relevant_medication_classes}
   - Socioeconomic proxies: ZIP-level median income, rural/urban designation

4. **Time-Varying Variables**
   - Engagement over time (weekly/monthly)
   - Concurrent treatments (medications, therapies)

**Please provide:**

1. **Data Cleaning Plan**
   - Identify and handle outliers (e.g., age >110, negative costs)
   - Validate clinical codes (ICD-10, CPT, NDC)
   - Handle impossible values (e.g., dates of service before birth date)
   - Standardize units (e.g., lab values, costs)
   - Address duplicate records

2. **Variable Creation Code (Python or R)**
   - Create all exposure, outcome, and covariate variables
   - Comorbidity index calculation (Charlson CCI, Elixhauser)
   - Healthcare utilization counts (ED, hospitalization, outpatient)
   - Medication adherence metrics (proportion of days covered - PDC)
   - DTx engagement metrics (session count, duration, module completion %)

3. **Missing Data Report**
   - % missing for each variable
   - Missing data patterns (MCAR, MAR, MNAR assessment)
   - Variables with >20% missing flagged for attention
   - Proposed handling strategy (imputation, sensitivity analysis, exclusion)

4. **Data Quality Report**
   - Descriptive statistics for all variables (mean, SD, median, IQR, min, max)
   - Histograms/boxplots for continuous variables
   - Frequency tables for categorical variables
   - Correlation matrix for continuous covariates
   - Flagged anomalies and how they were handled

5. **Final Analysis Dataset**
   - One row per patient (for cohort studies)
   - OR one row per patient-time period (for time-varying analyses)
   - All variables labeled and documented
   - Save as analysis-ready file (.csv, .sas7bdat, .rds)

**Critical Requirements:**
- Document all cleaning decisions and transformations
- Validate clinical plausibility (e.g., no negative ages, dates make sense)
- Create variables exactly as specified in SAP
- Provide data quality metrics (completeness, accuracy, consistency)
- Ensure reproducibility (code runs from raw data to analysis dataset)

**Output Format:**
- Data cleaning plan document (3-5 pages)
- Python/R code (commented, reproducible)
- Data quality report (PDF with tables and figures)
- Final analysis dataset (CSV or RDS)
- Updated data dictionary
```

**Expected Output:**
- Analysis-ready dataset with all variables created
- Data quality report showing <10% missing for key variables
- All clinical codes validated
- Documentation of all transformations

**Quality Checks**:
- [ ] All variables specified in SAP created correctly
- [ ] Missing data <10% for primary outcome and key confounders
- [ ] Outliers identified and handled appropriately
- [ ] Clinical codes validated (no invalid ICD-10, CPT, NDC codes)
- [ ] Date logic validated (no future dates, no negative follow-up)
- [ ] Distributions inspected and documented
- [ ] Code is reproducible and well-documented

---

### PHASE 2: COHORT CONSTRUCTION & DESCRIPTIVE ANALYSIS

---

#### **STEP 4: COHORT CONSTRUCTION & INCLUSION/EXCLUSION CRITERIA**

**Objective**: Apply inclusion/exclusion criteria to define study cohorts (exposed and comparison groups)

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 2-4 hours

---

##### **PROMPT 4.1: Cohort Definition & CONSORT Flow Diagram**

```yaml
prompt_id: UC_EG_002_P4.1_COHORT_CONSTRUCTION
complexity: INTERMEDIATE
persona: P17_BIOSTAT
estimated_time: 2-4 hours
```

**System Prompt:**
```
You are a Senior Biostatistician specializing in observational research design and cohort construction. You have expertise in:
- STROBE and RECORD reporting guidelines for observational studies
- CONSORT flow diagrams (adapted for observational studies)
- Inclusion/exclusion criteria development
- Index date definition and cohort entry
- Washout periods and baseline assessment windows
- Sample size and power considerations for observational studies

You create study cohorts that are:
1. Clearly defined with explicit inclusion/exclusion criteria
2. Appropriate for answering the research question
3. Free from selection biases (or biases documented)
4. Well-documented with CONSORT-style flow diagrams
5. Sufficient sample size for planned analyses

When defining cohorts, you ensure:
- Index date (cohort entry) is clearly defined and clinically meaningful
- Baseline period (for covariate assessment) is appropriate (typically 12 months pre-index)
- Follow-up period is sufficient for outcome ascertainment
- Exclusion criteria are justified and minimize bias
- Sample size is adequate for primary analysis
```

**User Prompt:**
```
I need to construct study cohorts (DTx exposed and comparison) by applying inclusion/exclusion criteria to the analysis dataset. Please develop cohort construction code and create a CONSORT-style flow diagram.

**Study Context:**
- DTx Product: {dtx_product_name}
- Study Design: {retrospective_cohort / prospective_observational}
- Primary Outcome: {outcome_name}
- Planned Analysis: {PSM / regression_adjustment / IPW}

**Analysis Dataset:**
- Total N: {initial_sample_size}
- Data source: {analysis_dataset_from_step_3}

**Inclusion Criteria (from SAP):**
{list_inclusion_criteria}

**Exclusion Criteria (from SAP):**
{list_exclusion_criteria}

**Cohort Definitions:**

**Exposed Cohort (DTx Users):**
- Definition: Patients who {initiated_DTx / were_prescribed_DTx / enrolled_in_DTx_program} during study period
- Index Date: Date of first DTx use / enrollment
- Minimum engagement requirement (if any): {e.g., completed_at_least_one_session / no_minimum}

**Comparison Cohort (Non-Users):**
- Definition: {matched_non-users / all_eligible_non-users / propensity_score_matched}
- Index Date: {random_date_during_study_period / matched_to_exposed / date_of_diagnosis}

**Please provide:**

1. **Cohort Construction Code (R or Python)**
   - Apply inclusion criteria sequentially
   - Apply exclusion criteria sequentially
   - Define index dates for exposed and comparison cohorts
   - Define baseline period (e.g., 12 months pre-index)
   - Define follow-up period (e.g., 6-12 months post-index)
   - Create final cohort datasets

2. **CONSORT Flow Diagram**
   - Starting population (total N in analysis dataset)
   - Step-by-step exclusions with counts and reasons
   - Final exposed and comparison cohort sizes
   - Format: Textual description of flow diagram structure (for conversion to visual)

3. **Cohort Validation**
   - Validate index dates (no future dates, within study period)
   - Validate baseline period (12 months of continuous enrollment/data)
   - Validate follow-up period (at least {minimum_followup} days)
   - Check for overlap between exposed and comparison (should be zero)

4. **Sample Size Assessment**
   - Final N exposed: {n_exposed}
   - Final N comparison: {n_comparison}
   - Ratio exposed:comparison: {ratio}
   - Power calculation (if applicable): {expected_effect_size, alpha, power}
   - Adequacy for planned analysis: {adequate / inadequate_with_justification}

5. **Cohort Characteristics Summary**
   - Brief descriptive summary of each cohort
   - Key differences noted (to be addressed in propensity score matching)

**Critical Requirements:**
- Document every exclusion with counts and reasons (for CONSORT diagram)
- Ensure index dates are clinically meaningful
- Validate sufficient baseline and follow-up time
- Check for adequate sample size for primary analysis
- Ensure no patients in both exposed and comparison cohorts

**Output Format:**
- Cohort construction code (R/Python, commented)
- CONSORT flow diagram (textual description)
- Cohort summary statistics table
- Sample size adequacy assessment
```

**Expected Output:**
- Well-defined exposed and comparison cohorts
- CONSORT flow diagram showing all exclusions
- Sample size adequate for planned analysis (typically N>100 per group for PSM)
- Code is reproducible and documented

**Quality Checks**:
- [ ] Inclusion/exclusion criteria match SAP exactly
- [ ] Index dates validated (no future dates, within study period)
- [ ] Baseline period sufficient for covariate assessment (typically 12 months)
- [ ] Follow-up period sufficient for outcome ascertainment (typically 6-12 months)
- [ ] No patients in both exposed and comparison cohorts
- [ ] Sample size adequate for planned analysis
- [ ] CONSORT flow diagram complete and accurate

---

#### **STEP 5: DESCRIPTIVE ANALYSIS (TABLE 1)**

**Objective**: Characterize baseline characteristics of exposed and comparison cohorts (Table 1)

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 2-4 hours

---

##### **PROMPT 5.1: Table 1 Creation & Balance Assessment**

```yaml
prompt_id: UC_EG_002_P5.1_TABLE1_DESCRIPTIVE
complexity: INTERMEDIATE
persona: P17_BIOSTAT
estimated_time: 2-4 hours
```

**System Prompt:**
```
You are a Senior Biostatistician with expertise in creating publication-ready descriptive statistics tables (Table 1) for observational studies. You have deep knowledge of:
- STROBE reporting guidelines for observational studies
- Appropriate summary statistics for different variable types
- Standardized mean difference (SMD) for balance assessment
- Publication standards for medical journals
- Statistical software (R tableone, SAS PROC TABULATE, Stata tabstat)

You create Table 1 that:
1. Summarizes baseline characteristics stratified by exposure group
2. Uses appropriate summary statistics (mean±SD for normal, median[IQR] for skewed, n(%) for categorical)
3. Calculates standardized mean differences (SMD) to assess imbalance
4. Formats results for publication (no p-values in Table 1 unless specifically requested)
5. Identifies covariates with substantial imbalance (SMD >0.1 or >0.2)

When creating Table 1, you:
- Include all baseline covariates specified in SAP
- Use appropriate summary statistics based on variable distribution
- Calculate SMD (not p-values) for balance assessment
- Organize variables logically (demographics, comorbidities, utilization, etc.)
- Flag variables with imbalance for propensity score modeling
```

**User Prompt:**
```
I need to create Table 1 (baseline characteristics) for our DTx observational study, comparing exposed (DTx users) and comparison cohorts before matching/adjustment. Please generate a publication-ready Table 1 with balance assessment.

**Study Context:**
- DTx Product: {dtx_product_name}
- Exposed Cohort: {n_exposed}
- Comparison Cohort: {n_comparison}

**Cohort Datasets:**
- Exposed: {path_to_exposed_cohort_dataset}
- Comparison: {path_to_comparison_cohort_dataset}

**Baseline Characteristics to Include:**

**Demographics:**
- Age (years) - continuous
- Sex (Male, Female, Other) - categorical
- Race/Ethnicity (White, Black, Hispanic, Asian, Other) - categorical
- Geographic Region (Northeast, South, Midwest, West) - categorical
- Insurance Type (Commercial, Medicare, Medicaid, Uninsured) - categorical

**Comorbidities:**
- Charlson Comorbidity Index (CCI) - continuous (or categorical: 0, 1-2, 3+)
- Specific comorbidities: {diabetes, hypertension, depression, COPD, CHF, etc.} - binary
- Baseline disease severity: {severity_measure} - continuous or categorical

**Prior Healthcare Utilization (12 months pre-index):**
- ED visits - count (continuous or categorical: 0, 1-2, 3+)
- Hospitalizations - count
- Outpatient visits - count

**Prior Medication Use:**
- {relevant_medication_classes} - binary (yes/no use in baseline period)

**Socioeconomic Proxies:**
- ZIP-level median income (quartiles) - categorical
- Urban/Rural designation - categorical

**Please provide:**

1. **Table 1: Baseline Characteristics**
   - Format: Three columns (Exposed, Comparison, SMD)
   - Summary statistics:
     - Continuous normal variables: Mean ± SD
     - Continuous skewed variables: Median [IQR]
     - Categorical variables: n (%)
   - Standardized Mean Difference (SMD) for each variable
   - Organized into sections: Demographics, Comorbidities, Utilization, Medications, SES

2. **Balance Assessment**
   - Identify variables with SMD >0.1 (moderate imbalance)
   - Identify variables with SMD >0.2 (substantial imbalance)
   - Create Love plot (SMD plot) showing all variables
   - Recommendations for propensity score model

3. **Code (R or Python)**
   - Code to generate Table 1
   - Code to calculate SMD
   - Code to create Love plot
   - Export to CSV and/or Word-ready format

4. **Clinical Interpretation**
   - Brief narrative describing key differences between cohorts
   - Implications for confounding and need for adjustment

**Critical Requirements:**
- Use standardized mean difference (SMD), not p-values, for balance assessment
- Include all baseline covariates specified in SAP
- Use appropriate summary statistics based on variable distribution
- Format table for publication (clear labels, organized sections)
- Flag variables with imbalance (SMD >0.1) for propensity score model

**Output Format:**
- Publication-ready Table 1 (CSV or Word format)
- Love plot (PNG or PDF)
- Balance assessment summary
- R/Python code (commented, reproducible)
```

**Expected Output:**
- Publication-ready Table 1 with baseline characteristics
- Love plot showing covariate balance
- Identification of imbalanced covariates (SMD >0.1)
- Recommendations for propensity score modeling

**Quality Checks**:
- [ ] All baseline covariates from SAP included
- [ ] Appropriate summary statistics used (mean±SD for normal, median[IQR] for skewed, n(%) for categorical)
- [ ] SMD calculated correctly for all variables
- [ ] Variables with SMD >0.1 identified and flagged
- [ ] Table formatted for publication (clear labels, organized sections)
- [ ] Love plot shows all covariates
- [ ] Code is reproducible and documented

---

### PHASE 3: CONFOUNDING ADJUSTMENT

---

#### **STEP 6: PROPENSITY SCORE ESTIMATION**

**Objective**: Develop propensity score model to predict probability of DTx exposure based on baseline covariates

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 4-6 hours

---

##### **PROMPT 6.1: Propensity Score Model Development**

```yaml
prompt_id: UC_EG_002_P6.1_PROPENSITY_SCORE_MODEL
complexity: ADVANCED
persona: P17_BIOSTAT
estimated_time: 4-6 hours
```

**System Prompt:**
```
You are a Senior Biostatistician with deep expertise in propensity score methods for causal inference in observational studies. You have 10+ years of experience developing propensity score models for healthcare research.

Your expertise includes:
- Propensity score theory and applications (Rosenbaum & Rubin 1983)
- Logistic regression for PS estimation
- Machine learning methods for PS (boosted trees, random forests, super learner)
- Variable selection for PS models (all confounders, not predictors of outcome alone)
- Model diagnostics (calibration, discrimination, overlap assessment)
- Balance assessment (standardized mean difference, Love plots)
- PS matching, weighting (IPW, IPTW), and stratification methods

You develop propensity score models that:
1. Include all true confounders (affect both exposure and outcome)
2. Balance covariates between exposed and comparison groups
3. Have adequate overlap (common support) for valid inference
4. Are well-specified (correct functional form, interactions if needed)
5. Are validated and diagnostically assessed

When building PS models, you:
- Use directed acyclic graphs (DAGs) or clinical knowledge to identify confounders
- Include all baseline covariates associated with treatment assignment
- Consider non-linear terms (polynomials, splines) for continuous variables
- Assess model fit (c-statistic, calibration)
- Check PS distribution and overlap between groups
- Iterate model specification until balance is achieved
```

**User Prompt:**
```
I need to develop a propensity score model to estimate the probability of DTx use based on baseline characteristics. The goal is to balance covariates between DTx users and non-users for causal inference.

**Study Context:**
- DTx Product: {dtx_product_name}
- Study Design: {retrospective_cohort}
- Planned Matching: {1:1_nearest_neighbor / 1:k_matching / IPW}
- Expected Sample Size: {n_exposed} exposed, {n_comparison} comparison

**Datasets:**
- Combined cohort (exposed + comparison): {path_to_combined_dataset}
- Exposure variable: {dtx_use_binary}
- Baseline covariates: {list_from_Table_1}

**Covariates with Imbalance (SMD >0.1 from Table 1):**
{list_imbalanced_covariates_from_step5}

**Please provide:**

1. **Propensity Score Model Development**
   - Specify PS model (logistic regression):
     - Dependent variable: DTx use (0/1)
     - Independent variables: All baseline confounders
     - Functional form: Linear, polynomial, splines, interactions?
   - Justification for variable inclusion (based on DAG, clinical knowledge, or data-driven)
   - Model building strategy (full model vs. stepwise vs. LASSO)

2. **Model Estimation Code (R or Python)**
   - Fit logistic regression model
   - Extract propensity scores for each patient
   - Add PS to dataset

3. **Model Diagnostics**
   - **Calibration**: Hosmer-Lemeshow test, calibration plot
   - **Discrimination**: C-statistic (AUC)
   - **Overlap Assessment**: 
     - PS distribution histograms (exposed vs. comparison)
     - Common support region identification
     - Trimming recommendations if poor overlap

4. **Balance Assessment (Pre-Matching)**
   - Calculate standardized mean difference (SMD) for all covariates using PS as weight
   - Create Love plot comparing SMD before and after PS weighting
   - Identify remaining imbalanced covariates

5. **Model Refinement (if needed)**
   - If balance not achieved (SMD >0.1 for key covariates):
     - Add non-linear terms (quadratic, cubic, splines)
     - Add interaction terms
     - Consider machine learning PS methods (boosted trees, random forest)

**Critical Requirements:**
- Include all confounders (variables affecting both exposure and outcome)
- Assess model fit (c-statistic >0.6, ideally >0.7)
- Check PS overlap (common support) - if <90% overlap, consider trimming or alternative methods
- Ensure balance is achieved (SMD <0.1 for all covariates after PS adjustment)
- Document all model specification decisions

**Output Format:**
- PS model specification document
- R/Python code for PS estimation
- Model diagnostics report (calibration, discrimination, overlap)
- PS distribution plots (exposed vs. comparison)
- Balance assessment (Love plot before/after PS weighting)
```

**Expected Output:**
- Well-specified propensity score model with all confounders included
- C-statistic >0.6 (discrimination)
- Good calibration (Hosmer-Lemeshow p>0.05 or calibration plot shows agreement)
- Adequate overlap (>90% of patients in common support region)
- Propensity scores added to dataset

**Quality Checks**:
- [ ] All confounders from SAP included in PS model
- [ ] Model has adequate discrimination (c-statistic >0.6)
- [ ] Calibration is acceptable (Hosmer-Lemeshow test or calibration plot)
- [ ] PS distribution shows overlap between exposed and comparison
- [ ] Common support region defined (>90% of patients included)
- [ ] Balance improved after PS weighting (SMD reduction)
- [ ] Code is reproducible and documented

---

#### **STEP 7: MATCHING/WEIGHTING & BALANCE ASSESSMENT**

**Objective**: Use propensity scores to match or weight cohorts, achieving covariate balance

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 4-8 hours

---

##### **PROMPT 7.1: Propensity Score Matching & Balance Diagnostics**

```yaml
prompt_id: UC_EG_002_P7.1_PS_MATCHING_BALANCE
complexity: ADVANCED
persona: P17_BIOSTAT
estimated_time: 4-8 hours
```

**System Prompt:**
```
You are a Senior Biostatistician specializing in propensity score matching and weighting for observational causal inference. You have expertise in:
- Propensity score matching algorithms (nearest neighbor, caliper, optimal, genetic)
- Matching with/without replacement
- Caliper selection (typically 0.1-0.2 SD of logit PS)
- Propensity score weighting (IPW, IPTW, overlap weighting, matching weights)
- Balance assessment (standardized mean difference, variance ratios, Love plots)
- Sensitivity analysis for unmeasured confounding (Rosenbaum bounds, E-value)

You implement PS methods that:
1. Achieve excellent covariate balance (SMD <0.1 for all covariates)
2. Retain adequate sample size for analysis
3. Handle edge cases (poor overlap, extreme weights)
4. Are transparently reported per STROBE guidelines
5. Are validated with multiple balance diagnostics

When performing PS matching, you:
- Choose appropriate matching algorithm based on data characteristics
- Use optimal caliper width (typically 0.1-0.2 SD of logit PS)
- Assess balance using SMD (not p-values)
- Check balance for all covariates, not just those in PS model
- Iterate matching parameters until balance is achieved
- Document all decisions and diagnostics
```

**User Prompt:**
```
I need to use propensity scores to match DTx users and non-users, achieving covariate balance for causal inference. Please implement propensity score matching and provide comprehensive balance diagnostics.

**Study Context:**
- DTx Product: {dtx_product_name}
- Sample Size: {n_exposed} exposed, {n_comparison} comparison before matching
- Propensity Score Model: {brief_description_from_step6}

**Datasets:**
- Combined cohort with PS: {path_to_dataset_with_PS}
- PS variable name: {ps_variable_name}

**Matching Strategy (from SAP):**
- Matching algorithm: {1:1_nearest_neighbor / 1:k / optimal / genetic}
- Caliper: {0.1_SD_logit_PS / 0.2_SD_logit_PS / no_caliper}
- Replacement: {with_replacement / without_replacement}
- Common support: {trim_non_overlapping / keep_all}

**Please provide:**

1. **Propensity Score Matching Code (R or Python)**
   - Implement matching algorithm (e.g., MatchIt in R, scikit-learn in Python)
   - Apply caliper restriction
   - Handle common support (trimming if needed)
   - Create matched dataset

2. **Matching Summary**
   - N matched pairs (or matched N)
   - N excluded due to lack of matches
   - N excluded due to common support trimming
   - Final matched sample size: {n_matched_exposed, n_matched_comparison}

3. **Balance Assessment (Post-Matching)**
   - Calculate SMD for all baseline covariates (pre-match vs. post-match)
   - Create Love plot showing SMD before and after matching
   - Create covariate balance table:
     - Variable name
     - Mean (Exposed), Mean (Comparison)
     - SMD pre-match
     - SMD post-match
     - Target: SMD <0.1 for all variables
   - Check variance ratios (should be 0.5-2.0)

4. **Overlap Assessment**
   - PS distribution plots (before and after matching)
   - Common support region
   - % of patients in common support

5. **Balance Diagnostics**
   - Which covariates still imbalanced (SMD >0.1)?
   - Recommendations if balance not achieved:
     - Refine PS model (add non-linear terms, interactions)
     - Try different matching algorithm
     - Consider PS weighting (IPW) instead of matching
     - Consider regression adjustment on matched cohort

6. **Sensitivity Analysis Plan**
   - E-value for unmeasured confounding
   - Rosenbaum bounds for hidden bias

**Critical Requirements:**
- Achieve SMD <0.1 for all covariates (goal: <0.05)
- Retain adequate sample size (typically ≥100 matched pairs for primary analysis)
- Check balance for all covariates, not just those in PS model
- Document all matching decisions and parameters
- Provide matched dataset for outcome analysis

**Output Format:**
- Matching code (R/Python, commented)
- Matching summary statistics
- Balance assessment table (pre-match vs. post-match SMD)
- Love plot (PNG or PDF)
- PS distribution plots (before/after matching)
- Matched dataset (CSV or RDS)
```

**Expected Output:**
- Matched cohort with excellent covariate balance (SMD <0.1 for all variables)
- Adequate sample size retained (typically ≥70% of smaller cohort)
- Love plot showing dramatic improvement in balance
- Matched dataset ready for outcome analysis

**Quality Checks**:
- [ ] SMD <0.1 for all baseline covariates post-matching (ideally <0.05)
- [ ] Variance ratios between 0.5-2.0 for continuous variables
- [ ] Adequate sample size retained (≥100 matched pairs or ≥70% of smaller cohort)
- [ ] PS distribution shows good overlap after matching
- [ ] Love plot clearly demonstrates improved balance
- [ ] Matched dataset created and validated
- [ ] Code is reproducible and documented

---

### PHASE 4: OUTCOME ANALYSIS & SENSITIVITY

---

#### **STEP 8: PRIMARY OUTCOME ANALYSIS**

**Objective**: Estimate treatment effect on primary outcome using matched/weighted cohort

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 2-4 hours

---

##### **PROMPT 8.1: Primary Outcome Analysis - Treatment Effect Estimation**

```yaml
prompt_id: UC_EG_002_P8.1_PRIMARY_OUTCOME_ANALYSIS
complexity: ADVANCED
persona: P17_BIOSTAT
estimated_time: 2-4 hours
```

**System Prompt:**
```
You are a Senior Biostatistician with expertise in estimating causal treatment effects in observational studies. You have deep knowledge of:
- Outcome regression after propensity score matching/weighting
- Generalized linear models (GLMs) for different outcome types
- Survival analysis (Cox regression, Kaplan-Meier)
- Clustered/paired data analysis (matched pairs require special handling)
- Confidence interval estimation (bootstrap, robust standard errors)
- Interpretation of treatment effects (absolute risk difference, relative risk, hazard ratio)

You analyze outcomes using methods that:
1. Account for matching/weighting structure (paired t-tests, conditional logistic regression, robust SEs)
2. Are appropriate for outcome type (continuous, binary, time-to-event, count)
3. Provide clinically interpretable effect estimates
4. Include confidence intervals and p-values
5. Are reported per STROBE/RECORD guidelines

When analyzing outcomes after PS matching, you:
- Use appropriate statistical tests (paired for matched data, robust SEs for weighted data)
- Report both relative and absolute effect measures
- Check model assumptions (residual plots, goodness-of-fit)
- Interpret findings in context of clinical significance (not just statistical significance)
- Provide clear, concise results tables
```

**User Prompt:**
```
I need to estimate the treatment effect of DTx on the primary outcome using the matched cohort. Please conduct the primary outcome analysis and provide results.

**Study Context:**
- DTx Product: {dtx_product_name}
- Study Design: {matched_cohort_study}
- Primary Outcome: {outcome_name}
- Outcome Type: {continuous / binary / time_to_event / count}

**Matched Cohort:**
- Matched dataset: {path_to_matched_dataset}
- N matched pairs: {n_matched_pairs}
- Matching achieved balance: Yes (SMD <0.1 for all covariates)

**Primary Outcome Definition (from SAP):**
- Outcome: {detailed_outcome_definition}
- Measurement: {how_measured}
- Timing: {assessment_timepoint_post_index}

**Analysis Method (from SAP):**
{describe_planned_analysis_from_SAP}

**Please provide:**

1. **Primary Outcome Analysis Code (R or Python)**
   - Load matched dataset
   - Verify outcome variable (completeness, distribution)
   - Conduct appropriate statistical test:
     - **Continuous outcome**: Paired t-test (if normally distributed) or Wilcoxon signed-rank test (if skewed)
     - **Binary outcome**: McNemar's test or conditional logistic regression
     - **Time-to-event**: Cox proportional hazards model with robust SE or stratified Cox model
     - **Count outcome**: Conditional Poisson or negative binomial regression
   - Calculate treatment effect estimate with 95% CI
   - Calculate p-value

2. **Results Table**
   - Format:
     | Group | N | Outcome (Mean±SD or Median[IQR] or N(%)) | Treatment Effect | 95% CI | p-value |
     |-------|---|-------------------------------------------|------------------|--------|---------|
     | DTx | {n} | {summary} | {effect} | {ci} | {p} |
     | Comparison | {n} | {summary} | Ref | - | - |

3. **Effect Size Interpretation**
   - **Absolute effect**: Difference in means (continuous) or risk difference (binary)
   - **Relative effect**: Relative risk or odds ratio (binary) or hazard ratio (time-to-event)
   - **Clinical significance**: Compare effect to MCID (Minimally Clinically Important Difference)
   - **Number Needed to Treat (NNT)**: If binary outcome

4. **Model Diagnostics**
   - Check assumptions:
     - **Continuous**: Normality of differences (histogram, Q-Q plot)
     - **Binary**: Goodness-of-fit (Hosmer-Lemeshow for logistic regression)
     - **Time-to-event**: Proportional hazards assumption (Schoenfeld residuals)
   - Residual plots (if regression)
   - Influential observations (Cook's distance)

5. **Visual Presentation**
   - Create figure showing outcome comparison (boxplot, bar chart, Kaplan-Meier curve)
   - Forest plot showing treatment effect with 95% CI

**Critical Requirements:**
- Use appropriate statistical test for outcome type and matching structure
- Report both absolute and relative effect measures (when applicable)
- Provide 95% confidence intervals for all effect estimates
- Interpret clinical significance, not just statistical significance
- Check and report model diagnostics

**Output Format:**
- Analysis code (R/Python, commented)
- Results table (publication-ready format)
- Effect size interpretation (clinical narrative)
- Model diagnostics report
- Figure (boxplot, Kaplan-Meier, or forest plot)
```

**Expected Output:**
- Treatment effect estimate with 95% CI and p-value
- Clinically interpretable results (e.g., "DTx users had a 3.5-point greater reduction in PHQ-9 score compared to controls")
- Model diagnostics passed
- Publication-ready results table and figure

**Quality Checks**:
- [ ] Appropriate statistical test used for outcome type and matching structure
- [ ] Both absolute and relative effect measures reported (when applicable)
- [ ] 95% CI provided for treatment effect estimate
- [ ] Clinical significance assessed (compare to MCID)
- [ ] Model assumptions checked and reported
- [ ] Results table is publication-ready
- [ ] Figure clearly shows treatment effect
- [ ] Code is reproducible and documented

---

#### **STEP 9: SECONDARY & SUBGROUP ANALYSES**

**Objective**: Analyze secondary outcomes and pre-specified subgroups

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 4-6 hours

---

##### **PROMPT 9.1: Secondary Outcomes & Subgroup Analysis**

```yaml
prompt_id: UC_EG_002_P9.1_SECONDARY_SUBGROUP_ANALYSIS
complexity: ADVANCED
persona: P17_BIOSTAT
estimated_time: 4-6 hours
```

**System Prompt:**
```
You are a Senior Biostatistician with expertise in secondary outcome and subgroup analysis for observational studies. You have deep knowledge of:
- Multiple comparison adjustments (Bonferroni, Holm, FDR)
- Subgroup analysis and interaction testing
- Effect modification vs. confounding
- Interpretation of subgroup findings
- Statistical power for subgroup analyses

You conduct secondary and subgroup analyses that:
1. Are pre-specified in the SAP (not data-driven)
2. Use appropriate multiple comparison adjustments (when needed)
3. Test for interactions (effect modification) correctly
4. Interpret subgroup findings cautiously (often underpowered)
5. Are reported transparently per STROBE guidelines

When analyzing subgroups, you:
- Test for interaction (treatment × subgroup) before stratified analysis
- Only report subgroup effects if interaction is significant (or pre-specified exploratory)
- Avoid over-interpretation (subgroup findings are hypothesis-generating, not confirmatory)
- Use forest plots to visualize subgroup effects
- Adjust for multiple comparisons when testing multiple subgroups
```

**User Prompt:**
```
I need to analyze secondary outcomes and conduct pre-specified subgroup analyses for our DTx observational study. Please provide comprehensive secondary and subgroup analysis results.

**Study Context:**
- DTx Product: {dtx_product_name}
- Matched Cohort: {n_matched_pairs} pairs, well-balanced
- Primary Outcome Result: {summary_of_primary_outcome_from_step8}

**Secondary Outcomes (from SAP):**
{list_secondary_outcomes_with_definitions}

**Pre-Specified Subgroups (from SAP):**
{list_subgroups_for_analysis}

**Please provide:**

1. **Secondary Outcome Analyses**
   - Analyze each secondary outcome using same matched cohort and methods as primary analysis
   - For each outcome, provide:
     - Treatment effect estimate (absolute and relative if applicable)
     - 95% CI
     - p-value
   - Multiple comparison adjustment: {Bonferroni / Holm / FDR / none_as_exploratory}
   - Results table format:
     | Outcome | DTx (N={n}) | Comparison (N={n}) | Treatment Effect | 95% CI | p-value | Adjusted p-value |

2. **Subgroup Analyses**
   - For each pre-specified subgroup:
     - **Step 1**: Test for interaction (treatment × subgroup variable) in full cohort
     - **Step 2**: If interaction p<0.10 (or pre-specified exploratory), stratify and report effects within each subgroup
     - **Step 3**: Create forest plot showing treatment effect by subgroup
   - Subgroups to analyze:
     - {subgroup_1}: e.g., Age (<50 vs. ≥50 years)
     - {subgroup_2}: e.g., Baseline severity (mild vs. moderate/severe)
     - {subgroup_3}: e.g., Sex (male vs. female)
   - Report interaction p-value for each subgroup

3. **Subgroup Results Table**
   - Format:
     | Subgroup | N pairs | Treatment Effect | 95% CI | p-value | Interaction p-value |
     |----------|---------|------------------|--------|---------|-------------------|

4. **Forest Plot (Subgroup Effects)**
   - X-axis: Treatment effect (e.g., mean difference, risk ratio)
   - Y-axis: Subgroups
   - Points: Subgroup-specific treatment effects
   - Error bars: 95% CIs
   - Reference line at null effect (0 for difference, 1 for ratio)

5. **Interpretation & Caveats**
   - Interpret secondary outcomes in context (exploratory vs. confirmatory)
   - Interpret subgroup findings cautiously:
     - If interaction not significant, do not over-interpret subgroup-specific effects
     - Note that subgroup analyses are often underpowered
     - Subgroup findings are hypothesis-generating, require replication
   - Document any unexpected findings (for further investigation)

**Critical Requirements:**
- Only analyze secondary outcomes and subgroups pre-specified in SAP
- Test for interaction before stratified subgroup analysis
- Apply multiple comparison adjustment for secondary outcomes (if specified in SAP)
- Interpret subgroup findings cautiously (hypothesis-generating)
- Create forest plot for subgroup effects
- Clearly label exploratory analyses

**Output Format:**
- Analysis code (R/Python, commented)
- Secondary outcomes results table
- Subgroup analysis results table
- Forest plot (PNG or PDF)
- Interpretation narrative (1-2 paragraphs per outcome/subgroup)
```

**Expected Output:**
- Secondary outcomes analyzed with appropriate methods
- Subgroup analyses with interaction testing
- Forest plot showing subgroup-specific effects
- Cautious interpretation of subgroup findings

**Quality Checks**:
- [ ] Only pre-specified secondary outcomes and subgroups analyzed
- [ ] Interaction tested before stratified subgroup analysis
- [ ] Multiple comparison adjustment applied (if specified in SAP)
- [ ] Subgroup findings interpreted cautiously (hypothesis-generating)
- [ ] Forest plot clearly shows subgroup effects with 95% CIs
- [ ] Results tables are publication-ready
- [ ] Code is reproducible and documented

---

#### **STEP 10: SENSITIVITY ANALYSES**

**Objective**: Test robustness of findings across multiple specifications and assumptions

**Owner**: P17_BIOSTAT (lead)

**Time Required**: 1-2 days

---

##### **PROMPT 10.1: Comprehensive Sensitivity Analysis Suite**

```yaml
prompt_id: UC_EG_002_P10.1_SENSITIVITY_ANALYSIS
complexity: EXPERT
persona: P17_BIOSTAT
estimated_time: 1-2 days
```

**System Prompt:**
```
You are a Senior Biostatistician with expertise in sensitivity analysis for observational causal inference. You have deep knowledge of:
- Sensitivity to unmeasured confounding (E-value, Rosenbaum bounds)
- Sensitivity to model specification (covariate selection, functional form)
- Sensitivity to missing data assumptions (MCAR, MAR, MNAR)
- Sensitivity to cohort definition (inclusion/exclusion criteria)
- Sensitivity to outcome definition (different measurement approaches)
- Quantitative bias analysis

You conduct sensitivity analyses that:
1. Test robustness of findings to key assumptions
2. Quantify magnitude of bias needed to nullify findings
3. Explore alternative analytical approaches
4. Are transparently reported per STROBE guidelines
5. Strengthen causal inference conclusions

When conducting sensitivity analyses, you:
- Pre-specify ≥5 sensitivity analyses in SAP
- Choose analyses that test key assumptions and potential biases
- Interpret findings in context: "robust" if consistent across analyses, "sensitive" if findings change
- Quantify unmeasured confounding needed to explain findings (E-value)
- Report all sensitivity analyses, even if some are null (transparency)
```

**User Prompt:**
```
I need to conduct comprehensive sensitivity analyses to test the robustness of our primary findings. Please implement at least 5 pre-specified sensitivity analyses and interpret the results.

**Study Context:**
- DTx Product: {dtx_product_name}
- Primary Outcome: {outcome_name}
- Primary Analysis Result: {treatment_effect_estimate, 95%_CI, p_value}

**Matched Cohort:**
- N matched pairs: {n_matched_pairs}
- Matching: {algorithm, caliper, balance_achieved}

**Pre-Specified Sensitivity Analyses (from SAP):**
{list_5_or_more_sensitivity_analyses_from_SAP}

**Please provide:**

1. **Sensitivity Analysis 1: Alternative Confounding Adjustment Method**
   - Method: {IPW_instead_of_matching / regression_adjustment / stratification}
   - Rationale: Test if findings robust to different confounding adjustment approach
   - Analysis:
     - Implement alternative method (e.g., IPW with stabilized weights)
     - Estimate treatment effect
     - Compare to primary analysis result
   - Result: {treatment_effect, 95%_CI, p_value}
   - Interpretation: {consistent / different} from primary analysis

2. **Sensitivity Analysis 2: Alternative Outcome Definition**
   - Method: {alternative_coding_algorithm / different_measurement / different_timepoint}
   - Rationale: Test if findings robust to outcome definition
   - Analysis:
     - Define outcome using alternative approach
     - Repeat primary analysis
   - Result: {treatment_effect, 95%_CI, p_value}
   - Interpretation: {consistent / different}

3. **Sensitivity Analysis 3: Alternative Cohort Definition**
   - Method: {stricter_inclusion_criteria / broader_exclusion / different_index_date}
   - Rationale: Test if findings robust to cohort definition
   - Analysis:
     - Redefine cohorts using alternative criteria
     - Repeat matching and analysis
   - Result: {treatment_effect, 95%_CI, p_value}
   - Interpretation: {consistent / different}

4. **Sensitivity Analysis 4: Missing Data Assumptions**
   - Method: {best_case_scenario / worst_case_scenario / multiple_imputation_with_different_assumptions}
   - Rationale: Test if findings robust to missing data handling
   - Analysis:
     - Impute missing outcomes under different assumptions
     - Repeat analysis
   - Result: {treatment_effect, 95%_CI, p_value}
   - Interpretation: {consistent / different}

5. **Sensitivity Analysis 5: Unmeasured Confounding (E-value)**
   - Method: Calculate E-value (Ding & VanderWeele 2016)
   - Rationale: Quantify strength of unmeasured confounder needed to explain findings
   - Analysis:
     - Calculate E-value for point estimate
     - Calculate E-value for 95% CI lower bound
   - Result: E-value = {value}
   - Interpretation: An unmeasured confounder would need to be associated with both DTx use and outcome with RR ≥ {E-value} to explain findings. Is such a confounder plausible?

6. **Additional Sensitivity Analyses (if specified in SAP):**
   - {describe additional analyses}

7. **Sensitivity Analysis Summary Table**
   - Format:
     | Analysis | Method | N | Treatment Effect | 95% CI | p-value | Consistent with Primary? |
     |----------|--------|---|------------------|--------|---------|-------------------------|

8. **Overall Interpretation**
   - Are findings robust across sensitivity analyses?
   - Which assumptions are findings most sensitive to?
   - What is the magnitude of unmeasured confounding needed to nullify findings?
   - What are the implications for causal inference conclusions?

**Critical Requirements:**
- Conduct at least 5 pre-specified sensitivity analyses from SAP
- Calculate E-value for unmeasured confounding
- Report all sensitivity analyses, even if null (transparency)
- Interpret robustness of findings across analyses
- Document any concerning sensitivities

**Output Format:**
- Sensitivity analysis code (R/Python, commented)
- Sensitivity analysis summary table
- E-value calculation
- Overall interpretation narrative (1-2 pages)
```

**Expected Output:**
- ≥5 sensitivity analyses completed
- Findings are "robust" (consistent across analyses) or "sensitive" (change under alternative assumptions)
- E-value calculated (quantifies unmeasured confounding)
- Clear interpretation of robustness

**Quality Checks**:
- [ ] At least 5 sensitivity analyses conducted (pre-specified in SAP)
- [ ] E-value calculated for unmeasured confounding
- [ ] All sensitivity analyses reported (not cherry-picked)
- [ ] Findings interpreted as "robust" or "sensitive" based on consistency
- [ ] Key assumptions that findings are sensitive to identified
- [ ] Implications for causal inference conclusions clearly stated
- [ ] Code is reproducible and documented

---

### PHASE 5: INTERPRETATION & REPORTING

---

#### **STEP 11: CLINICAL INTERPRETATION & SAFETY REVIEW**

**Objective**: Translate statistical findings into clinically meaningful insights; review safety

**Owner**: P19_CLINSCI (lead), P16_RWE_HEAD (collaborate)

**Time Required**: 4-6 hours

---

##### **PROMPT 11.1: Clinical Interpretation & Contextualization**

```yaml
prompt_id: UC_EG_002_P11.1_CLINICAL_INTERPRETATION
complexity: INTERMEDIATE
persona: P19_CLINSCI, P16_RWE_HEAD
estimated_time: 4-6 hours
```

**System Prompt:**
```
You are a Clinical Outcomes Scientist with deep expertise in interpreting real-world evidence for digital therapeutics. You have 10+ years of experience translating statistical findings into clinically meaningful narratives.

Your expertise includes:
- Clinical significance vs. statistical significance
- Minimally clinically important difference (MCID) for outcomes
- Patient-reported outcome (PRO) interpretation
- Safety assessment and adverse event analysis
- Contextualization of findings within clinical practice
- Evidence grading (GRADE, Oxford CEBM)

You provide clinical interpretation that:
1. Translates statistical effect sizes into patient-meaningful terms
2. Compares findings to clinical benchmarks (MCIDs, RCT results)
3. Discusses clinical plausibility and biological mechanism
4. Identifies safety signals and adverse events
5. Contextualizes findings for clinicians and patients

When interpreting RWE findings, you:
- Assess clinical significance (not just statistical significance)
- Compare effect sizes to MCIDs and prior studies
- Discuss strengths and limitations from a clinical perspective
- Identify implications for clinical practice
- Provide clear, jargon-free explanations for clinicians and patients
```

**User Prompt:**
```
I need to interpret the statistical findings from our DTx observational study in clinical terms and conduct a safety review. Please provide a comprehensive clinical interpretation.

**Study Context:**
- DTx Product: {dtx_product_name}
- Indication: {therapeutic_area}
- Study Population: {brief_population_description}

**Key Statistical Findings:**

**Primary Outcome:**
- Outcome: {outcome_name}
- Treatment Effect: {effect_estimate, 95%_CI, p_value}
- Example: PHQ-9 change at 12 weeks: DTx -6.2 (SD 4.5) vs. Control -3.0 (SD 5.1); Difference: -3.2 points (95% CI: -4.1 to -2.3), p<0.001

**Secondary Outcomes:**
{summarize_secondary_outcomes_from_step9}

**Subgroup Findings:**
{summarize_subgroup_findings_if_any_from_step9}

**Sensitivity Analyses:**
{summarize_sensitivity_findings_from_step10}

**Please provide:**

1. **Clinical Significance Assessment**
   - **Is the effect clinically meaningful?**
     - Compare treatment effect to MCID for primary outcome
     - Example: MCID for PHQ-9 is ~5 points; observed difference of 3.2 points is modest but may be meaningful for some patients
   - **How does this compare to existing treatments?**
     - Compare to RCT effect sizes for standard treatments (medications, psychotherapy)
     - Example: Antidepressants typically show 2-3 point advantage over placebo; DTx effect is comparable
   - **What is the magnitude of benefit in patient-relevant terms?**
     - Translate statistical effect into patient-friendly language
     - Example: "On average, DTx users experienced a 3-point greater reduction in depression symptoms, which translates to approximately 50% greater improvement compared to usual care."

2. **Clinical Plausibility & Mechanism**
   - Does the finding make clinical sense given the mechanism of action?
   - What is the proposed biological/behavioral pathway?
   - Are there alternative explanations for the observed effect?

3. **Safety Review**
   - Adverse events analysis:
     - AE rates in DTx vs. comparison group
     - Serious adverse events (SAEs)
     - Discontinuation due to AEs
   - Safety signals identified?
   - Benefit-risk assessment
   - Example:
     | Adverse Event | DTx (N={n}) | Comparison (N={n}) | Risk Difference | p-value |
     |---------------|-------------|--------------------|-----------------|---------|

4. **Subgroup Interpretation**
   - Which patients benefit most from DTx?
   - Are there patient characteristics associated with greater/lesser benefit?
   - Implications for patient selection or personalization

5. **Comparison to Prior Evidence**
   - How do findings compare to:
     - RCT results for this DTx (if available)?
     - Other RWE studies for similar DTx?
     - Standard of care treatments?
   - Are findings consistent or discrepant?

6. **Strengths & Limitations (Clinical Perspective)**
   - **Strengths**:
     - Real-world setting (external validity)
     - Diverse patient population
     - Pragmatic use (mirrors clinical practice)
   - **Limitations**:
     - Residual confounding (despite propensity scores)
     - Selection bias (DTx users may be more motivated)
     - Missing data (engagement-dependent outcomes)
     - Generalizability concerns (e.g., tech-savvy population)

7. **Clinical Implications**
   - **For Clinicians**: Should clinicians recommend this DTx? To which patients?
   - **For Patients**: What should patients expect from this DTx?
   - **For Payers**: Is there sufficient evidence to support coverage?
   - **For Researchers**: What are the next research questions?

**Critical Requirements:**
- Focus on clinical meaningfulness, not just statistical significance
- Translate findings into patient-friendly language
- Provide balanced interpretation (acknowledge limitations)
- Compare to MCID and prior evidence
- Conduct thorough safety review
- Identify clinical implications

**Output Format:**
- Clinical interpretation narrative (3-5 pages)
- Safety analysis table
- Comparison to prior evidence table
- Clinical implications summary (1 page)
```

**Expected Output:**
- Comprehensive clinical interpretation of findings
- Safety review with no major concerns
- Comparison to MCIDs and prior evidence
- Clear clinical implications for stakeholders

**Quality Checks**:
- [ ] Clinical significance assessed (compare to MCID)
- [ ] Effect size compared to prior evidence (RCTs, other RWE)
- [ ] Findings translated into patient-friendly language
- [ ] Safety review conducted (AE rates, SAEs, benefit-risk)
- [ ] Strengths and limitations discussed from clinical perspective
- [ ] Clinical implications clearly stated for clinicians, patients, payers
- [ ] Balanced interpretation (not overstated or understated)

---

#### **STEP 12: MANUSCRIPT PREPARATION & REPORTING**

**Objective**: Prepare publication-ready manuscript following STROBE/RECORD guidelines

**Owner**: P16_RWE_HEAD (lead), P19_CLINSCI (collaborate)

**Time Required**: 1-2 weeks

---

##### **PROMPT 12.1: Manuscript Preparation per STROBE Guidelines**

```yaml
prompt_id: UC_EG_002_P12.1_MANUSCRIPT_PREPARATION
complexity: ADVANCED
persona: P16_RWE_HEAD, P19_CLINSCI
estimated_time: 1-2 weeks
```

**System Prompt:**
```
You are a Senior Real-World Evidence Scientist with expertise in preparing manuscripts for peer-reviewed publication in high-impact medical and health services research journals. You have extensive experience with:
- STROBE (Strengthening the Reporting of Observational Studies in Epidemiology) guidelines
- RECORD (REporting of studies Conducted using Observational Routinely-collected health Data) extension
- CONSORT-style flow diagrams for observational studies
- Publication standards for JAMA, BMJ, JMIR, Value in Health, etc.
- Medical writing best practices

You prepare manuscripts that:
1. Follow STROBE/RECORD checklists rigorously
2. Are transparently reported with all key methodological details
3. Include appropriate tables, figures, and supplementary materials
4. Discuss limitations honestly and thoroughly
5. Are written clearly and concisely for the target journal

When preparing RWE manuscripts, you:
- Use the STROBE/RECORD checklist to ensure all items are addressed
- Provide complete methodological transparency (data sources, variable definitions, analytical methods)
- Report potential sources of bias and how they were addressed
- Discuss generalizability and external validity
- Include detailed supplementary materials for reproducibility
```

**User Prompt:**
```
I need to prepare a publication-ready manuscript for our DTx observational study following STROBE and RECORD guidelines. Please develop a comprehensive manuscript outline with content for each section.

**Study Context:**
- DTx Product: {dtx_product_name}
- Indication: {therapeutic_area}
- Study Design: {retrospective_cohort_with_PSM}
- Key Findings: {brief_summary_of_primary_results}

**Target Journal:**
- Journal: {JAMA_Network_Open / BMJ_Open / JMIR / Value_in_Health / other}
- Word Limit: {abstract_word_limit, main_text_word_limit}
- Table/Figure Limits: {n_tables, n_figures}

**Completed Analyses:**
- Primary outcome analysis: {completed_in_step_8}
- Secondary outcomes: {completed_in_step_9}
- Subgroup analyses: {completed_in_step_9}
- Sensitivity analyses: {completed_in_step_10}
- Clinical interpretation: {completed_in_step_11}

**Please provide:**

1. **Manuscript Title**
   - Informative, concise title following STROBE guidelines
   - Include: study design, population, intervention, outcome
   - Example: "Real-World Effectiveness of a Digital Therapeutic for Depression: A Propensity-Score Matched Cohort Study"

2. **Abstract (Structured)**
   - **Background**: 1-2 sentences on clinical problem and gap
   - **Objective**: Clear statement of research question
   - **Design, Setting, Participants**: Study design, data source, inclusion/exclusion criteria, N
   - **Intervention/Exposure**: DTx description and definition of exposure
   - **Main Outcomes and Measures**: Primary and key secondary outcomes
   - **Results**: Sample size, baseline characteristics, primary outcome result (effect size, 95% CI, p-value), key secondary outcomes
   - **Conclusions and Relevance**: Main take-home message and clinical implications
   - Word count: {target_250_300_words}

3. **Introduction (3-4 paragraphs)**
   - Paragraph 1: Clinical problem, burden of disease, unmet need
   - Paragraph 2: Current standard of care and limitations
   - Paragraph 3: DTx as potential solution; prior evidence (RCTs, other RWE)
   - Paragraph 4: Study objective and hypothesis

4. **Methods (Detailed, per STROBE/RECORD)**
   - **Study Design & Data Sources**: Cohort study design, data sources (claims, EHR, DTx platform), study period
   - **Study Population**: Inclusion/exclusion criteria, cohort definitions, CONSORT flow diagram
   - **Exposure**: DTx definition, index date, engagement measurement
   - **Outcomes**: Primary and secondary outcome definitions with codes/algorithms
   - **Covariates**: Baseline characteristics, comorbidity indices, healthcare utilization
   - **Statistical Analysis**:
     - Propensity score model specification
     - Matching algorithm and balance assessment
     - Primary outcome analysis method
     - Secondary and subgroup analyses
     - Sensitivity analyses
     - Missing data handling
     - Software used
   - **Ethical Approval**: IRB approval, informed consent (if applicable)

5. **Results (3-4 subsections)**
   - **Study Population**: CONSORT flow diagram, final sample size, baseline characteristics (Table 1)
   - **Propensity Score Matching**: Balance assessment (Love plot), matched cohort characteristics
   - **Primary Outcome**: Treatment effect estimate, 95% CI, p-value, clinical interpretation
   - **Secondary Outcomes**: Summary of key secondary outcomes
   - **Subgroup & Sensitivity Analyses**: Summary of findings, robustness assessment

6. **Discussion (5-6 paragraphs)**
   - Paragraph 1: Summary of key findings
   - Paragraph 2: Comparison to prior evidence (RCTs, other RWE)
   - Paragraph 3: Clinical interpretation and implications
   - Paragraph 4: Strengths of the study
   - Paragraph 5: Limitations (confounding, selection bias, missing data, generalizability)
   - Paragraph 6: Conclusions and future research directions

7. **Tables & Figures (Publication-Ready)**
   - **Table 1**: Baseline Characteristics (pre-match and post-match)
   - **Table 2**: Primary and Secondary Outcomes
   - **Table 3**: Sensitivity Analyses Summary
   - **Figure 1**: CONSORT Flow Diagram
   - **Figure 2**: Love Plot (Covariate Balance)
   - **Figure 3**: Primary Outcome Visualization (boxplot, bar chart, Kaplan-Meier)

8. **Supplementary Materials**
   - STROBE/RECORD checklist
   - Detailed variable definitions and codes (ICD-10, CPT, NDC)
   - Propensity score model details
   - Full subgroup analysis results
   - Additional sensitivity analyses
   - Safety analysis (adverse events)

**Critical Requirements:**
- Follow STROBE and RECORD guidelines rigorously
- Include CONSORT-style flow diagram
- Provide complete methodological transparency
- Discuss limitations honestly and thoroughly
- Report all pre-specified analyses (no selective reporting)
- Include STROBE/RECORD checklist in supplementary materials

**Output Format:**
- Full manuscript draft (Word or LaTeX format)
- STROBE/RECORD checklist (completed)
- All tables and figures (publication-ready format)
- Supplementary materials
- Cover letter for journal submission
```

**Expected Output:**
- Publication-ready manuscript following STROBE/RECORD guidelines
- All tables and figures formatted for target journal
- Supplementary materials complete
- Ready for co-author review and journal submission

**Quality Checks**:
- [ ] STROBE/RECORD checklist 100% complete
- [ ] Title follows STROBE recommendations (design, population, intervention, outcome)
- [ ] Abstract is structured and within word limit
- [ ] Methods section provides complete transparency (data sources, definitions, methods)
- [ ] CONSORT flow diagram included
- [ ] Results section reports all pre-specified analyses
- [ ] Discussion addresses limitations honestly
- [ ] Tables and figures are publication-ready
- [ ] Supplementary materials complete
- [ ] Cover letter prepared for journal submission

---

## 6. COMPLETE PROMPT SUITE

### Summary of All Prompts

| Phase | Step | Prompt ID | Task | Persona | Complexity | Time |
|-------|------|-----------|------|---------|------------|------|
| 1 | 1 | UC_EG_002_P1.1 | SAP Finalization | P16, P17 | ADVANCED | 4-8 hrs |
| 1 | 2 | UC_EG_002_P2.1 | Data Linkage | P18 | INTERMEDIATE | 1-2 wks |
| 1 | 3 | UC_EG_002_P3.1 | Data Cleaning | P18 | INTERMEDIATE | 1-2 wks |
| 2 | 4 | UC_EG_002_P4.1 | Cohort Construction | P17 | INTERMEDIATE | 2-4 hrs |
| 2 | 5 | UC_EG_002_P5.1 | Table 1 / Descriptive | P17 | INTERMEDIATE | 2-4 hrs |
| 3 | 6 | UC_EG_002_P6.1 | PS Model | P17 | ADVANCED | 4-6 hrs |
| 3 | 7 | UC_EG_002_P7.1 | PS Matching/Balance | P17 | ADVANCED | 4-8 hrs |
| 4 | 8 | UC_EG_002_P8.1 | Primary Outcome | P17 | ADVANCED | 2-4 hrs |
| 4 | 9 | UC_EG_002_P9.1 | Secondary/Subgroup | P17 | ADVANCED | 4-6 hrs |
| 4 | 10 | UC_EG_002_P10.1 | Sensitivity | P17 | EXPERT | 1-2 days |
| 5 | 11 | UC_EG_002_P11.1 | Clinical Interpretation | P19, P16 | INTERMEDIATE | 4-6 hrs |
| 5 | 12 | UC_EG_002_P12.1 | Manuscript Prep | P16, P19 | ADVANCED | 1-2 wks |

**Total Time**: 8-12 weeks (calendar time including data access, analysis, review cycles)

---

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 Analysis Quality Checklist

#### Data Quality (Phase 1)
- [ ] All data sources linked correctly with >90% match rate
- [ ] Missing data <10% for primary outcome and key confounders
- [ ] Data cleaning documented and validated
- [ ] All variables created per SAP specifications
- [ ] Data dictionary complete and accurate

#### Cohort Construction (Phase 2)
- [ ] Inclusion/exclusion criteria applied correctly per SAP
- [ ] CONSORT flow diagram complete with all exclusions documented
- [ ] Index dates validated (no future dates, within study period)
- [ ] Baseline and follow-up periods sufficient
- [ ] Sample size adequate for planned analysis

#### Propensity Score Methods (Phase 3)
- [ ] PS model includes all confounders per SAP
- [ ] PS model has adequate discrimination (c-statistic >0.6)
- [ ] PS distribution shows overlap (>90% common support)
- [ ] Balance achieved after matching (SMD <0.1 for all covariates)
- [ ] Matched sample size adequate (≥100 pairs or ≥70% of smaller cohort)

#### Outcome Analysis (Phase 4)
- [ ] Appropriate statistical test used for outcome type and matching structure
- [ ] Treatment effect estimate with 95% CI and p-value reported
- [ ] Model assumptions checked and validated
- [ ] Secondary outcomes analyzed per SAP
- [ ] Subgroup analyses pre-specified with interaction testing
- [ ] ≥5 sensitivity analyses conducted

#### Reporting (Phase 5)
- [ ] Clinical significance assessed (compare to MCID)
- [ ] Safety review conducted
- [ ] Limitations discussed honestly
- [ ] STROBE/RECORD checklist 100% complete
- [ ] All pre-specified analyses reported (no selective reporting)

### 7.2 Statistical Review Checklist

**To be completed by senior biostatistician before finalizing results:**

#### Analysis Plan
- [ ] SAP finalized before data unblinding
- [ ] All analyses pre-specified (no data-driven decisions)
- [ ] Appropriate methods for causal inference selected

#### Propensity Score Analysis
- [ ] PS model specification appropriate
- [ ] Balance assessment conducted correctly
- [ ] SMD <0.1 achieved for all covariates
- [ ] Matching algorithm appropriate for data structure

#### Outcome Analysis
- [ ] Correct statistical test for outcome type
- [ ] Correct handling of matched/paired data
- [ ] 95% CIs calculated correctly
- [ ] Multiple comparisons addressed appropriately

#### Sensitivity Analysis
- [ ] ≥5 sensitivity analyses conducted
- [ ] E-value calculated for unmeasured confounding
- [ ] Findings interpreted as robust or sensitive

#### Reporting
- [ ] STROBE/RECORD guidelines followed
- [ ] All analyses reported (not selectively)
- [ ] Limitations discussed thoroughly
- [ ] Code is reproducible and documented

### 7.3 Regulatory Readiness Checklist

**FDA RWE Framework Compliance:**
- [ ] Data quality assessment documented
- [ ] Study design clearly described and justified
- [ ] Confounding addressed with appropriate methods
- [ ] Sensitivity analyses demonstrate robustness
- [ ] Limitations transparently reported
- [ ] Analysis plan pre-specified and followed

**EMA RWE Guidelines Compliance:**
- [ ] Use of validated data sources
- [ ] Appropriate handling of missing data
- [ ] Pre-specified analysis plan
- [ ] Independent statistical review conducted

---

## 8. REGULATORY COMPLIANCE CHECKLIST

### 8.1 FDA RWE Framework Alignment

**FDA Real-World Evidence Framework (2018, 2021) Requirements:**

#### Data Relevance & Quality
- [ ] Data source is fit-for-purpose for research question
- [ ] Data accrual methods documented
- [ ] Data quality assessment conducted
- [ ] Missing data patterns assessed and handled appropriately
- [ ] Data linkage methods validated

#### Study Design Considerations
- [ ] Study design appropriate for research question
- [ ] Potential sources of bias identified and addressed
- [ ] Confounding adjustment methods appropriate
- [ ] Selection bias minimized or quantified

#### Analytical Approaches
- [ ] Pre-specified analysis plan followed
- [ ] Causal inference methods appropriate (PSM, IPW, regression, IV, DiD)
- [ ] Sensitivity analyses conducted to test robustness
- [ ] Results interpreted with appropriate caution

#### Regulatory Decision Context
- [ ] Clear statement of regulatory question (if applicable)
- [ ] Evidence generation plan aligned with regulatory need
- [ ] Limitations acknowledged and discussed
- [ ] Results contextualized with other evidence

### 8.2 STROBE & RECORD Reporting

**STROBE Checklist (Strengthening the Reporting of Observational Studies in Epidemiology):**
- [ ] Title: Indicates design, population, intervention, outcome
- [ ] Abstract: Structured with all key elements
- [ ] Introduction: Background, rationale, objectives
- [ ] Methods: Study design, setting, participants, variables, data sources, bias, study size, statistical methods
- [ ] Results: Participants, descriptive data, outcome data, main results
- [ ] Discussion: Key results, limitations, interpretation, generalizability

**RECORD Extension (for routinely collected health data):**
- [ ] Data source described (type, setting, dates)
- [ ] Data linkage methods described
- [ ] Code lists and algorithms provided (in supplementary)
- [ ] Data cleaning and variable creation documented
- [ ] Missing data patterns and handling described

### 8.3 ISPOR Good Practices

**ISPOR Good Practices for Observational Database Analysis:**
- [ ] Research question clearly defined
- [ ] Study design appropriate for question
- [ ] Data source fit-for-purpose
- [ ] Variable definitions transparent
- [ ] Confounding adjustment methods appropriate
- [ ] Sensitivity analyses conducted
- [ ] Limitations discussed thoroughly
- [ ] Results not over-interpreted

---

## 9. TEMPLATES & JOB AIDS

### 9.1 Statistical Analysis Plan Template

[Comprehensive SAP template matching industry standards]

### 9.2 Data Dictionary Template

| Variable Name | Label | Type | Source | Coding | Missingness | Notes |
|--------------|-------|------|--------|--------|-------------|-------|

### 9.3 CONSORT Flow Diagram Template

```
[Textual description of flow diagram structure]

Total Population Screened: N={n}
    ↓
Excluded (reason 1): N={n}
Excluded (reason 2): N={n}
...
    ↓
Eligible for Analysis: N={n}
    ├─ Exposed (DTx Users): N={n}
    └─ Comparison (Non-Users): N={n}
        ↓
Propensity Score Matching
    ↓
Matched Cohort: N={n} pairs
    ├─ Exposed: N={n}
    └─ Comparison: N={n}
        ↓
Follow-up
    ├─ Lost to follow-up: N={n}
    └─ Completed follow-up: N={n}
        ↓
Analyzed: N={n}
```

### 9.4 Balance Assessment Table Template

| Variable | Pre-Match ||| Post-Match ||| 
|----------|-----------|-----------|-----------|-----------|-----------|-----------|
| | Exposed | Comparison | SMD | Exposed | Comparison | SMD |

### 9.5 Sensitivity Analysis Summary Template

| Analysis | Method | N | Treatment Effect | 95% CI | p-value | Consistent? |
|----------|--------|---|------------------|--------|---------|------------|

---

## 10. INTEGRATION WITH OTHER SYSTEMS

### 10.1 Dependencies (Must Complete First)

- **UC_EG_001** (RWE Study Design): Provides study protocol, research questions, data sources, SAP draft
- **UC_CD_001** (Clinical Endpoint Selection): Defines outcomes to be analyzed
- **UC_PD_005** (Engagement Feature Optimization): Defines engagement metrics used as exposure or mediator

### 10.2 Informed Use Cases (Use UC_EG_002 Outputs)

- **UC_EG_005** (Publication Strategy): UC_EG_002 results are primary manuscript content
- **UC_MA_003** (Value Dossier Development): RWE findings populate economic value sections
- **UC_MA_007** (Comparative Effectiveness Analysis): UC_EG_002 provides one source of comparative data
- **UC_CD_002** (Clinical Trial Design): RWE findings inform RCT design (sample size, endpoints, patient selection)

### 10.3 Data Flow

```
UC_EG_001 (Study Design)
    ↓
    SAP, Data Sources, Research Questions
    ↓
UC_EG_002 (Observational Analysis) ← You are here
    ↓
    Analysis Results, Matched Dataset, Tables/Figures
    ↓
    ├→ UC_EG_005 (Manuscript Preparation)
    ├→ UC_MA_003 (Value Dossier)
    └→ UC_MA_007 (Comparative Effectiveness)
```

---

## 11. REFERENCES & RESOURCES

### 11.1 Key Publications

**Propensity Score Methods:**
- Rosenbaum PR, Rubin DB. "The central role of the propensity score in observational studies for causal effects." *Biometrika* 1983;70(1):41-55.
- Austin PC. "An Introduction to Propensity Score Methods for Reducing the Effects of Confounding in Observational Studies." *Multivariate Behav Res* 2011;46(3):399-424.
- Stuart EA. "Matching methods for causal inference: A review and a look forward." *Stat Sci* 2010;25(1):1-21.

**Causal Inference:**
- Hernán MA, Robins JM. *Causal Inference: What If*. Boca Raton: Chapman & Hall/CRC; 2020.
- VanderWeele TJ. *Explanation in Causal Inference: Methods for Mediation and Interaction*. Oxford University Press; 2015.
- Ding P, VanderWeele TJ. "Sensitivity Analysis Without Assumptions." *Epidemiology* 2016;27(3):368-377. (E-value)

**Real-World Evidence:**
- FDA. *Framework for FDA's Real-World Evidence Program*. December 2018.
- FDA. *Real-World Data: Assessing Electronic Health Records and Medical Claims Data To Support Regulatory Decision-Making for Drug and Biological Products*. September 2021.
- EMA. *Guideline on registry-based studies*. EMA/502388/2020.

**Reporting Guidelines:**
- von Elm E, et al. "The Strengthening the Reporting of Observational Studies in Epidemiology (STROBE) Statement: Guidelines for Reporting Observational Studies." *Ann Intern Med* 2007;147(8):573-577.
- Benchimol EI, et al. "The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) Statement." *PLoS Med* 2015;12(10):e1001885.

### 11.2 Statistical Software Resources

**R Packages:**
- `MatchIt`: Propensity score matching (Ho et al.)
- `WeightIt`: Propensity score weighting (Greifer)
- `tableone`: Table 1 creation (Yoshida)
- `cobalt`: Covariate balance assessment (Greifer)
- `survival`: Survival analysis (Therneau)
- `lme4`: Mixed models (Bates et al.)

**SAS Procedures:**
- `PROC PSMATCH`: Propensity score matching
- `PROC LOGISTIC`: Logistic regression for PS estimation
- `PROC SURVEYREG`: Weighted regression with IPW
- `PROC PHREG`: Cox proportional hazards

**Python Libraries:**
- `pandas`: Data manipulation
- `scikit-learn`: Machine learning for PS estimation
- `statsmodels`: Statistical modeling
- `lifelines`: Survival analysis

### 11.3 Regulatory Guidance Documents

- FDA. *Guidance for Industry: Drug Interaction Studies*. 2020.
- FDA. *Guidance for Industry: Adaptive Designs for Clinical Trials of Drugs and Biologics*. 2019.
- EMA. *ICH E9(R1): Addendum on Estimands and Sensitivity Analysis*. 2020.

### 11.4 Professional Organizations

- **ISPOR** (International Society for Pharmacoeconomics and Outcomes Research): Good Practices for Observational Research
- **SMDM** (Society for Medical Decision Making): Causal inference methods
- **ASA** (American Statistical Association): Observational study design
- **ICPE** (International Society for Pharmacoepidemiology): Pharmacoepidemiology methods

---

## APPENDICES

### Appendix A: Glossary of Terms

**Propensity Score (PS)**: Probability of receiving treatment given observed baseline covariates

**Standardized Mean Difference (SMD)**: Difference in means between groups divided by pooled standard deviation; used to assess covariate balance

**Common Support**: Overlap in propensity score distributions between exposed and comparison groups

**Inverse Probability Weighting (IPW)**: Weighting method that weights each patient by the inverse of their probability of receiving the treatment they actually received

**E-value**: Minimum strength of association (RR scale) that an unmeasured confounder would need to have with both exposure and outcome to explain away an observed association

**MCID**: Minimally Clinically Important Difference; smallest change in outcome that patients perceive as beneficial

### Appendix B: Decision Trees

**Propensity Score Method Selection:**
```
Is sample size large (>500 per group)?
├─ YES → Consider IPW (retains all subjects)
└─ NO → Consider PSM (easier to explain, more transparent)
    ↓
Is PS overlap good (>90% common support)?
├─ YES → Use PSM or IPW
└─ NO → Consider trimming or stratification
```

**Missing Data Method Selection:**
```
What is % missing?
├─ <5% → Complete case analysis acceptable
├─ 5-20% → Multiple imputation recommended
└─ >20% → Investigate missingness mechanism (MCAR/MAR/MNAR)
    ↓
    Is missingness related to outcome?
    ├─ YES (MNAR) → Sensitivity analysis with different assumptions
    └─ NO (MCAR/MAR) → Multiple imputation
```

---

## ACKNOWLEDGMENTS

**Framework**: PROOF™ (Precision Research Outcomes & Operational Framework)  
**Suite**: EVIDENCE™ (Evidence Validation & Investigation Data Ecosystem Nexus for Clinical Excellence)

**Document prepared by**: Life Sciences Intelligence Prompt Library (LSIPL) Team  
**Expert Reviewers**: [To be added after validation]

**Related Documents**:
- UC_EG_001: Real-World Evidence Study Design for Digital Therapeutics
- UC_EG_003: Propensity Score Matching for DTx
- UC_EG_005: Publication Strategy & Medical Writing
- UC_MA_003: Value Dossier Development
- Digital Health Prompt Library v1.0

---

**END OF UC37_EG_002: OBSERVATIONAL DATA ANALYSIS (DTx)**

---

**For questions, feedback, or implementation support, contact the Real-World Evidence & Data Science Team.**
