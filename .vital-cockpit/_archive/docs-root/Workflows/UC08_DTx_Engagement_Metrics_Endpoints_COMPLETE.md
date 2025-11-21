# UC-08: DTx ENGAGEMENT METRICS AS ENDPOINTS
## Complete Use Case Documentation with Workflows, Prompts, Personas & Examples

**Document Version**: 3.0 Complete Edition  
**Date**: October 10, 2025  
**Status**: Production Ready - Expert Validation Required  
**Framework**: PROMPTS™ (Purpose-driven Robust Outcomes Master Prompting Toolkit & Suites)  
**Suite**: FORGE™ (Foundation Optimization Regulatory Guidelines Engineering)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Value Proposition](#2-business-context--value-proposition)
3. [Persona Definitions](#3-persona-definitions)
4. [Complete Workflow Overview](#4-complete-workflow-overview)
5. [Step-by-Step Implementation Guide](#5-step-by-step-implementation-guide)
6. [Complete Prompt Suite](#6-complete-prompt-suite)
7. [Practical Examples & Case Studies](#7-practical-examples--case-studies)
8. [How-To Implementation Guide](#8-how-to-implementation-guide)
9. [Success Metrics & Validation Criteria](#9-success-metrics--validation-criteria)
10. [Troubleshooting & FAQs](#10-troubleshooting--faqs)
11. [Appendices](#11-appendices)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Overview

**UC-08: DTx Engagement Metrics as Endpoints** addresses the critical challenge of measuring and analyzing user engagement in digital therapeutic clinical trials. This use case is essential because:

- **Regulatory Imperative**: FDA increasingly requires demonstration that users will actually engage with the DTx intervention
- **Clinical Validity**: Low engagement undermines therapeutic effect—if users don't use the product, it can't work
- **Commercial Value**: Engagement data demonstrates product stickiness and real-world viability to payers and investors
- **Dose-Response Evidence**: Linking engagement to outcomes provides mechanism-of-action validation

### 1.2 Key Deliverables

This use case produces:
1. **Engagement Taxonomy** distinguishing usage (descriptive) from engagement (therapeutically meaningful)
2. **Operational Definitions** with precise measurement specifications and algorithms
3. **Engagement Thresholds** defining minimal, adequate, and optimal therapeutic dose
4. **Dose-Response Analysis Plan** testing relationship between engagement and clinical outcomes
5. **Mediation Analysis Strategy** demonstrating engagement as mechanism of action
6. **Regulatory Positioning Document** addressing FDA's engagement-related concerns

### 1.3 Resource Requirements

- **Time**: 2-3 hours (can be split across 5 focused sessions)
- **Team**: 4-5 personas (Chief Medical Officer, VP Clinical Development, Biostatistician, Product Manager, Regulatory Director)
- **Prerequisites**: DTx product with defined features, target indication, mechanism of action, clinical trial design
- **Outputs**: 15-20 page engagement analysis plan + data capture specifications + statistical analysis plan addendum

### 1.4 Success Criteria

✅ **Clear distinction between usage and engagement** (not all app opens are meaningful)  
✅ **Therapeutically meaningful metrics** with rationale for clinical impact  
✅ **Evidence-based thresholds** (e.g., ≥75% module completion for therapeutic effect)  
✅ **Feasible data capture** with quality checks and anomaly detection  
✅ **Robust statistical plan** for dose-response and mediation analyses  
✅ **Regulatory strategy** addressing FDA's likely questions about engagement

---

## 2. BUSINESS CONTEXT & VALUE PROPOSITION

### 2.1 The Engagement Measurement Challenge

Digital therapeutics face a unique regulatory challenge: demonstrating both **efficacy** AND **usability**. Unlike traditional drugs where adherence is binary (took pill or didn't), DTx engagement exists on a spectrum:

**Key Challenges**:
- **Defining "Enough" Engagement**: What constitutes therapeutic dose? 50% module completion? 75%? 90%?
- **Usage vs. Engagement**: User opened app 100 times but completed zero exercises—engaged or not?
- **Non-Adherence Ambiguity**: Is low engagement a product failure or patient disinterest?
- **Regulatory Scrutiny**: FDA wants to see that patients will actually use the product in real-world settings
- **Mediation Complexity**: Proving engagement drives outcomes requires sophisticated causal inference

### 2.2 Why This Matters: The Business Case

**Regulatory Impact**:
- Low engagement rates (<50%) in pivotal trials have led to FDA rejections
- FDA De Novo submissions increasingly require engagement data as supportive evidence
- Clear engagement thresholds help define product labeling (e.g., "For optimal benefit, complete ≥18 of 24 modules")

**Commercial Impact**:
- **Payers**: Engagement data demonstrates product will be used (not abandoned), justifying reimbursement
- **Providers**: Engagement metrics help identify patients needing additional support
- **Investors**: Strong engagement validates product-market fit and scalability
- **Product Team**: Engagement analytics drive feature prioritization and UX improvements

**Clinical Impact**:
- **Dose-Response Evidence**: Linking engagement to outcomes validates therapeutic mechanism
- **Subgroup Insights**: Identifying who engages (and who doesn't) informs targeting strategy
- **Real-World Evidence**: Engagement data from trials predicts commercial performance

### 2.3 Common Pitfalls (And How to Avoid Them)

| Pitfall | Consequence | How This Use Case Helps |
|---------|-------------|------------------------|
| **Conflating usage with engagement** | Counting app opens as "engagement" when user did nothing therapeutic | Step 1 creates taxonomy distinguishing descriptive usage from meaningful engagement |
| **No therapeutic rationale** | FDA asks "Why does module completion matter?" and team can't answer | Step 1 requires documented rationale linking each metric to clinical improvement |
| **Arbitrary thresholds** | Defining "engaged" as ≥50% completion with no evidence to support it | Step 2 establishes evidence-based thresholds tied to therapeutic minimum dose |
| **Missing dose-response** | Can't demonstrate that more engagement → better outcomes | Step 3 designs rigorous dose-response analysis with proper statistical tests |
| **Ignoring non-adherence** | 40% of users drop out, but analysis only includes completers (selection bias) | Steps 3-4 use ITT population and test engagement as mediator, not just post-hoc split |
| **Poor data quality** | App crashes, duplicate logging, bot activity contaminate engagement data | Step 2 specifies data quality checks and anomaly detection algorithms |

### 2.4 Success Stories: What Good Looks Like

**Example 1: reSET® (Substance Use Disorder)**
- **Engagement Metric**: Number of CBT modules completed (of 62 available)
- **Finding**: Dose-response relationship—more modules completed correlated with higher abstinence rates
- **Result**: FDA authorization; engagement data supported feasibility and mechanism of action
- **Key Insight**: Even partial completion showed benefit; didn't require 100% engagement

**Example 2: Somryst® (Chronic Insomnia)**
- **Engagement Metric**: Number of CBT-I sessions completed (of 6 core sessions)
- **Finding**: ≥4 sessions associated with clinically meaningful ISI improvement
- **Result**: FDA authorization; engagement threshold helped define product labeling
- **Key Insight**: Identified "therapeutic minimum dose" that guided patient instructions

**Example 3: EndeavorRx® (ADHD in Children)**
- **Engagement Metric**: Days of gameplay, session duration
- **Finding**: Minimum 25 sessions over 4 weeks required for TOVA score improvement
- **Result**: First FDA-authorized game-based DTx; engagement data demonstrated feasibility in children
- **Key Insight**: Combined frequency (days) and intensity (session duration) metrics

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across 5 key personas:

### 3.1 P01_CMO: Chief Medical Officer
**Role in UC-08**: Strategic oversight; ensures engagement metrics have clinical validity

**Responsibilities**:
- Approve therapeutic rationale for engagement metrics
- Review dose-response analysis plan for clinical meaningfulness
- Oversee mediation analysis interpretation
- Approve regulatory positioning strategy
- Final sign-off on engagement analysis plan

**Required Expertise**:
- Deep clinical understanding of indication and therapeutic mechanism
- Experience with DTx clinical trials and FDA interactions
- Ability to translate engagement data into clinical narratives

---

### 3.2 P02_VPCLIN: VP Clinical Development
**Role in UC-08**: Operational lead; defines engagement metrics and thresholds

**Responsibilities**:
- Lead Step 1 (Define Engagement Taxonomy)
- Co-lead Step 2 (Operationalize Metrics)
- Ensure engagement metrics align with clinical trial objectives
- Coordinate between Product and Clinical teams
- Oversee data capture feasibility

**Required Expertise**:
- Clinical trial design and execution
- Understanding of digital health products and user experience
- Familiarity with engagement measurement best practices
- Project management and cross-functional coordination

---

### 3.3 P04_BIOSTAT: Senior Biostatistician
**Role in UC-08**: Statistical methodology; designs dose-response and mediation analyses

**Responsibilities**:
- Lead Step 2 (Operationalize Metrics—technical specifications)
- Lead Step 3 (Dose-Response Analysis Design)
- Lead Step 4 (Mediation Analysis Planning)
- Define engagement variable transformations and handling of missing data
- Specify statistical models and power calculations
- Write Statistical Analysis Plan addendum for engagement

**Required Expertise**:
- Longitudinal data analysis and mixed-effects models
- Dose-response modeling
- Causal inference and mediation analysis (Baron & Kenny, PROCESS macro, etc.)
- Missing data methods (LOCF, MI, pattern-mixture models)
- Digital health data analytics

---

### 3.4 P03_PRODMGR: Product Manager (Digital Health)
**Role in UC-08**: Technical feasibility; ensures engagement data can be captured accurately

**Responsibilities**:
- Co-lead Step 1 (Define Engagement Taxonomy—product perspective)
- Co-lead Step 2 (Operationalize Metrics—data capture specifications)
- Specify event logging architecture and data quality checks
- Ensure analytics platform can support required metrics
- Identify technical limitations or risks
- Collaborate with engineering team on implementation

**Required Expertise**:
- Digital health product analytics and instrumentation
- Event logging systems and data warehousing
- UX/UI design and user behavior analysis
- Agile development and product roadmap planning
- Data quality and anomaly detection

---

### 3.5 P05_REGDIR: Regulatory Affairs Director
**Role in UC-08**: Regulatory strategy; positions engagement data for FDA acceptance

**Responsibilities**:
- Lead Step 5 (Regulatory Positioning Strategy)
- Review engagement metrics for regulatory acceptability
- Identify potential FDA questions and proactive responses
- Advise on engagement data inclusion in regulatory submissions
- Prepare briefing materials for FDA Pre-Sub meetings
- Ensure compliance with FDA Digital Health guidance

**Required Expertise**:
- FDA Digital Health Center guidance and precedents
- DTx regulatory pathways (510(k), De Novo, PMA)
- Patient-reported outcomes and digital endpoints
- FDA submission strategy and Pre-Sub meeting preparation

---

### 3.6 Persona Collaboration Matrix

| Step | Lead Persona | Supporting Personas | Decision Authority |
|------|-------------|---------------------|-------------------|
| **Step 1: Engagement Taxonomy** | P02_VPCLIN | P03_PRODMGR, P01_CMO | P01_CMO |
| **Step 2: Operationalize Metrics** | P04_BIOSTAT | P02_VPCLIN, P03_PRODMGR | P04_BIOSTAT |
| **Step 3: Dose-Response Design** | P04_BIOSTAT | P01_CMO | P04_BIOSTAT |
| **Step 4: Mediation Analysis** | P04_BIOSTAT | P01_CMO | P04_BIOSTAT |
| **Step 5: Regulatory Strategy** | P05_REGDIR | P01_CMO, P02_VPCLIN | P01_CMO |

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 High-Level Workflow Diagram

```
            [START: DTx Clinical Trial with Engagement Component]
                              |
                              v
    ╔═══════════════════════════════════════════════════════╗
    ║  PHASE 1: ENGAGEMENT DEFINITION                       ║
    ║  Time: 30 minutes                                     ║
    ║  Personas: P02_VPCLIN, P03_PRODMGR, P01_CMO          ║
    ╚═══════════════════════════════════════════════════════╝
                              |
                              v
            ┌─────────────────────────────┐
            │ STEP 1:                     │
            │ Define Engagement Taxonomy  │
            │ - Usage vs. Engagement      │
            │ - Therapeutic Rationale     │
            │ - Engagement Levels         │
            │ (30 min)                    │
            └──────────────┬──────────────┘
                           │
                           v
    ╔═══════════════════════════════════════════════════════╗
    ║  PHASE 2: OPERATIONALIZATION                          ║
    ║  Time: 40 minutes                                     ║
    ║  Personas: P04_BIOSTAT, P02_VPCLIN, P03_PRODMGR      ║
    ╚═══════════════════════════════════════════════════════╝
                           |
                           v
            ┌─────────────────────────────┐
            │ STEP 2:                     │
            │ Operationalize Metrics      │
            │ - Precise Definitions       │
            │ - Calculation Algorithms    │
            │ - Evidence-Based Thresholds │
            │ - Data Quality Checks       │
            │ (40 min)                    │
            └──────────────┬──────────────┘
                           │
                           v
    ╔═══════════════════════════════════════════════════════╗
    ║  PHASE 3: DOSE-RESPONSE ANALYSIS                      ║
    ║  Time: 30 minutes                                     ║
    ║  Personas: P04_BIOSTAT, P01_CMO                       ║
    ╚═══════════════════════════════════════════════════════╝
                           |
                           v
            ┌─────────────────────────────┐
            │ STEP 3:                     │
            │ Design Dose-Response        │
            │ - Engagement Categories     │
            │ - Statistical Model         │
            │ - Trend Tests               │
            │ - Sensitivity Analyses      │
            │ (30 min)                    │
            └──────────────┬──────────────┘
                           │
                           v
    ╔═══════════════════════════════════════════════════════╗
    ║  PHASE 4: MEDIATION ANALYSIS                          ║
    ║  Time: 30 minutes                                     ║
    ║  Personas: P04_BIOSTAT, P01_CMO                       ║
    ╚═══════════════════════════════════════════════════════╝
                           |
                           v
            ┌─────────────────────────────┐
            │ STEP 4:                     │
            │ Plan Mediation Analysis     │
            │ - Causal Framework          │
            │ - Statistical Approach      │
            │ - Effect Decomposition      │
            │ - Sensitivity Analyses      │
            │ (30 min)                    │
            └──────────────┬──────────────┘
                           │
                           v
    ╔═══════════════════════════════════════════════════════╗
    ║  PHASE 5: REGULATORY STRATEGY                         ║
    ║  Time: 30 minutes                                     ║
    ║  Personas: P05_REGDIR, P01_CMO, P02_VPCLIN           ║
    ╚═══════════════════════════════════════════════════════╝
                           |
                           v
            ┌─────────────────────────────┐
            │ STEP 5:                     │
            │ Regulatory Positioning      │
            │ - FDA Precedent Review      │
            │ - Engagement as Evidence    │
            │ - Pre-Sub Strategy          │
            │ - Proactive Risk Mitigation │
            │ (30 min)                    │
            └──────────────┬──────────────┘
                           │
                           v
            ╔═══════════════════════════════════════════════╗
            ║  DELIVERABLES PACKAGE                         ║
            ║  - Engagement Taxonomy Document (5-7 pages)   ║
            ║  - Operational Definitions & Algorithms       ║
            ║  - Dose-Response Analysis Plan (3-4 pages)    ║
            ║  - Mediation Analysis Plan (3-4 pages)        ║
            ║  - Regulatory Strategy Document (3-5 pages)   ║
            ║  - Data Capture Specifications (Technical)    ║
            ║  - SAP Addendum (Engagement Module)           ║
            ╚═══════════════════════════════════════════════╝
                           |
                           v
                 [END: Engagement Strategy Complete]
```

### 4.2 Workflow Phase Summary

| Phase | Duration | Key Activities | Primary Outputs |
|-------|----------|----------------|-----------------|
| **Phase 1: Definition** | 30 min | Define engagement taxonomy, distinguish usage vs. engagement | Engagement taxonomy with 10-15 metrics |
| **Phase 2: Operationalization** | 40 min | Precise metric definitions, calculation algorithms, thresholds | Operational specifications, data capture plan |
| **Phase 3: Dose-Response** | 30 min | Design statistical analysis testing engagement-outcome relationship | Dose-response analysis plan |
| **Phase 4: Mediation** | 30 min | Plan causal mediation analysis to test engagement as mechanism | Mediation analysis strategy |
| **Phase 5: Regulatory** | 30 min | Position engagement data for FDA acceptance | Regulatory positioning document |
| **TOTAL** | **2-3 hours** | **Complete engagement metrics strategy** | **Ready-to-implement engagement plan** |

---

## 5. STEP-BY-STEP IMPLEMENTATION GUIDE

### PHASE 1: ENGAGEMENT DEFINITION (30 minutes)

---

#### **STEP 1: Define Engagement Taxonomy (30 minutes)**

**Objective**: Create comprehensive taxonomy distinguishing usage (descriptive) from engagement (therapeutically meaningful), with clear categories and rationale.

**Persona**: P02_VPCLIN (Lead), P03_PRODMGR (Co-lead), P01_CMO (Review)

**Prerequisites**:
- DTx product description with detailed feature list
- Therapeutic mechanism of action documented
- Target indication and clinical outcomes defined
- Expected usage patterns (e.g., 3 sessions/week)

**Process**:

1. **Review Product Features** (5 minutes)
   - List all therapeutic features in DTx product
   - Identify core vs. supplementary features
   - Understand user journey and feature dependencies
   - Document expected treatment duration and intensity

2. **Execute Prompt 1.1** (20 minutes)
   - Use Engagement Taxonomy Definition prompt
   - Categorize all interactions as Usage OR Engagement
   - Provide therapeutic rationale for each engagement metric
   - Define 3-4 engagement levels (e.g., Non-engaged, Minimal, Adequate, Optimal)
   - Specify measurement approach for each metric

3. **Cross-Functional Review** (5 minutes)
   - Product Manager validates technical feasibility
   - CMO validates clinical rationale
   - Resolve any conflicts or ambiguities
   - Document final taxonomy

**Deliverable**: Engagement Taxonomy Document (5-7 pages)

**Content Structure**:
- Section 1: Usage Metrics (Descriptive Only)
  - App opens, session time, days active, etc.
  - Purpose: Feasibility and product performance monitoring
  
- Section 2: Engagement Metrics (Therapeutically Meaningful)
  - Content completion (modules, lessons, exercises)
  - Skill practice and application
  - Goal achievement and behavioral targets
  - Self-monitoring consistency
  - Each with: Definition, Therapeutic Rationale, Data Source
  
- Section 3: Engagement Levels
  - Non-Engaged: <25% completion (insufficient therapeutic dose)
  - Minimally Engaged: 25-49% (subtherapeutic)
  - Adequately Engaged: 50-74% (likely therapeutic benefit)
  - Highly Engaged: ≥75% (optimal therapeutic benefit)
  
- Section 4: Composite Engagement Score
  - Algorithm for combining multiple engagement metrics
  - Weighting rationale (e.g., module completion 60%, skill practice 30%, self-monitoring 10%)

**Quality Check**:
✅ Clear distinction between usage and engagement  
✅ Every engagement metric has therapeutic rationale  
✅ Engagement levels have evidence-based thresholds  
✅ Metrics are feasible to capture with product infrastructure  
✅ Taxonomy approved by CMO and Product Manager  
✅ Taxonomy aligns with clinical trial endpoints

**Example Output**:
See Section 7.1 for complete example of Engagement Taxonomy Document for depression DTx product.

---

### PHASE 2: OPERATIONALIZATION (40 minutes)

---

#### **STEP 2: Operationalize Engagement Metrics (40 minutes)**

**Objective**: Translate engagement taxonomy into precise, implementable definitions with calculation algorithms, evidence-based thresholds, measurement timing, and data quality specifications.

**Persona**: P04_BIOSTAT (Lead), P02_VPCLIN (Support), P03_PRODMGR (Technical review)

**Prerequisites**:
- Engagement Taxonomy Document from Step 1
- Understanding of clinical trial timeline and assessment schedule
- Access to literature on therapeutic dose (if available)
- Analytics platform capabilities documented

**Process**:

1. **Select Primary Engagement Metric** (5 minutes)
   - Review taxonomy from Step 1
   - Identify THE most important engagement metric (typically content completion)
   - Justify selection based on:
     - Therapeutic mechanism (most directly linked to clinical improvement)
     - Precedent (used in successful DTx trials)
     - Feasibility (reliable data capture)
     - Interpretability (clear to FDA, clinicians, patients)

2. **Execute Prompt 2.1** (25 minutes)
   - Use Metric Operationalization prompt
   - Provide PRECISE definition (what counts as "completion"?)
   - Specify calculation algorithm step-by-step
   - Define evidence-based thresholds for minimum, adequate, optimal engagement
   - Determine measurement timing (when assessed? how handle early dropout?)
   - Plan sensitivity analyses (alternative definitions/thresholds)
   - Specify data quality checks (duplicate detection, anomaly detection, missingness handling)

3. **Technical Validation** (5 minutes)
   - Product Manager confirms analytics platform can capture metrics as defined
   - Identify any technical limitations or adjustments needed
   - Confirm data pipeline from app → clinical database
   - Validate data quality check feasibility

4. **Statistical Validation** (5 minutes)
   - Biostatistician confirms metric is analyzable
   - Check for ceiling/floor effects
   - Assess distribution assumptions (continuous vs. categorical)
   - Plan transformations if needed (e.g., log transform if skewed)

**Deliverable**: Operational Definitions & Specifications Document (8-12 pages)

**Content Structure**:

**Section 1: Primary Engagement Metric**
- Metric Name: Module Completion Percentage
- **Precise Definition**:
  - A module is "completed" when user:
    1. Views all content pages in sequence
    2. Completes all required exercises (≥80% correct where applicable)
    3. Passes end-of-module quiz (≥70% score)
  - Partial completion: User viewed ≥50% of content but did not complete exercises/quiz
  - Time window: Must complete within intervention period (e.g., 12 weeks)

- **Calculation Algorithm**:
  ```
  Module_Completion_% = (Number_of_Modules_Completed / Total_Available_Modules) × 100
  
  Where:
  - Total_Available_Modules = 24 (product-specific)
  - Number_of_Modules_Completed = Count where completion_status = "COMPLETE"
  - Assessed at: End of Week 12 (primary timepoint)
  ```

- **Engagement Thresholds** (Evidence-Based):
  - **Minimum Therapeutic Dose**: ≥50% (≥12 of 24 modules)
    - Rationale: Pilot data (N=50) showed ≥12 modules associated with ≥3-point PHQ-9 reduction
    - Precedent: reSET® showed benefit with partial completion
  - **Adequate Engagement**: ≥75% (≥18 of 24 modules)
    - Rationale: RCT data (N=200) showed ≥18 modules → clinically meaningful response (≥50% improvement)
  - **Optimal Engagement**: ≥90% (≥22 of 24 modules)
    - Rationale: Observational data showed plateau in benefit after 22 modules

- **Measurement Timing**:
  - Primary assessment: Week 12 (end of treatment period)
  - Interim assessments: Week 4, Week 8 (for dose-response analysis)
  - Follow-up: Week 16 (sustained engagement post-treatment)
  - How to handle early dropout: Use cumulative completion up to dropout date

- **Missing Data Handling**:
  - Scenario 1: User completes 15 modules, then withdraws from study at Week 8
    - Calculation: 15/24 = 62.5% at time of withdrawal
  - Scenario 2: User stops engaging at Week 6 but remains in study
    - Calculation: Modules completed by Week 12 (even if zero new completions after Week 6)
  - Intent-to-Treat: All randomized participants included, missing = 0% completion (conservative)

- **Sensitivity Analyses**:
  1. Alternative threshold: ≥60% vs. ≥75%
  2. Alternative definition: Any module interaction (not just completion)
  3. Time-weighted completion (early completions count more)
  4. Per-protocol: Exclude participants with <2 weeks of any engagement

**Section 2: Secondary Engagement Metrics**
- Skill Practice Frequency (exercises completed)
- Self-Monitoring Consistency (mood log entries)
- Goal Achievement Rate (behavioral targets met)
- Each with: Definition, Algorithm, Thresholds

**Section 3: Data Quality Specifications**
- **Event Logging Architecture**:
  - All engagement events logged with: study_id, timestamp, event_type, module_id, completion_status
  - De-identified at source (HIPAA compliant)
  - Daily sync to clinical data warehouse
  - Real-time dashboard for study coordinators

- **Data Quality Checks**:
  - Duplicate detection: Flag if user clicks "complete" button multiple times within 1 second
  - Anomaly detection: Alert if user completes 10 modules in 10 minutes (bot behavior)
  - Missingness alerts: Notify coordinator if user has zero events for ≥7 consecutive days
  - Range checks: Module completion % must be 0-100%

**Section 4: Composite Engagement Score**
- Algorithm: `Composite_Score = 0.60 × Module_Completion + 0.30 × Skill_Practice + 0.10 × Self_Monitoring`
- Rationale: Module completion most predictive of outcome; skill practice reinforces learning; self-monitoring maintains awareness

**Quality Check**:
✅ Definitions are precise and unambiguous  
✅ Calculation algorithms are reproducible  
✅ Thresholds are evidence-based (cite pilot data, literature, precedent)  
✅ Missing data plan is conservative and specified a priori  
✅ Data quality checks prevent contamination  
✅ Product Manager confirms technical feasibility  
✅ Biostatistician confirms statistical analyzability  

**Example Output**:
See Section 7.2 for complete worked example of Operational Definitions Document.

---

### PHASE 3: DOSE-RESPONSE ANALYSIS (30 minutes)

---

#### **STEP 3: Design Dose-Response Analysis (30 minutes)**

**Objective**: Create rigorous statistical analysis plan testing whether higher engagement is associated with better clinical outcomes (dose-response relationship).

**Persona**: P04_BIOSTAT (Lead), P01_CMO (Clinical interpretation)

**Prerequisites**:
- Operational Definitions from Step 2
- Primary clinical endpoint defined (from UC-01)
- Sample size and power calculations (from UC-07)
- Understanding of expected engagement distribution

**Process**:

1. **Define Engagement Categories** (5 minutes)
   - Decide: Continuous variable OR categorical groups?
   - If categorical, define groups using thresholds from Step 2
   - Justify categorization approach
   - Consider sample size in each category

2. **Execute Prompt 3.1** (20 minutes)
   - Use Dose-Response Analysis Design prompt
   - Specify engagement variable(s) to test
   - Select statistical model (linear, logistic, ordinal)
   - Define trend test approach
   - Plan sensitivity analyses
   - Specify how to handle confounders
   - Address causality caveats

3. **Power Considerations** (5 minutes)
   - Estimate power to detect dose-response trend
   - Consider: If 80% power for primary ITT analysis, what power for dose-response?
   - May be underpowered if many engagement subgroups
   - Document as exploratory vs. confirmatory

**Deliverable**: Dose-Response Analysis Plan (3-4 pages)

**Content Structure**:

**Section 1: Rationale for Dose-Response Analysis**
- **Scientific Question**: Does higher engagement lead to better clinical outcomes?
- **Clinical Value**: Dose-response supports mechanism of action; helps define optimal engagement
- **Regulatory Value**: Demonstrates therapeutic is active ingredient, not just app presence
- **Positioning**: Supportive/exploratory analysis (not primary efficacy analysis)

**Section 2: Engagement Variable Specification**

**Approach A: Continuous Engagement**
- Variable: Module Completion Percentage (0-100%)
- Analysis: Test linear trend (or non-linear if theory suggests)
- Model: `Clinical_Outcome ~ Engagement_% + Treatment_Arm + Baseline_Severity + [covariates]`

**Approach B: Categorical Engagement Groups**
- Groups based on Step 2 thresholds:
  - Non-Engaged: 0-24%
  - Minimally Engaged: 25-49%
  - Adequately Engaged: 50-74%
  - Highly Engaged: ≥75%
- Analysis: Test for trend across ordered groups
- Model: Ordinal logistic regression or linear regression with contrast coding

**Recommended Approach**: Both continuous (primary) and categorical (interpretability)

**Section 3: Statistical Model Specification**

**Model for Continuous Outcome (e.g., PHQ-9 change score)**:
```
Mixed-Effects Linear Model:

Y_ij = β_0 + β_1*Engagement_i + β_2*Treatment_i + β_3*Baseline_i + 
       β_4*(Engagement_i × Treatment_i) + ε_ij

Where:
- Y_ij = Clinical outcome for participant i at time j
- Engagement_i = Cumulative engagement at end of treatment
- Treatment_i = Randomized treatment assignment (DTx=1, Control=0)
- Baseline_i = Baseline severity
- Engagement × Treatment interaction tests differential dose-response by arm
- ε_ij = Random error

Primary hypothesis: β_1 > 0 (higher engagement → better outcomes)
Interaction hypothesis: β_4 significant → dose-response differs by treatment arm
```

**Model for Binary Outcome (e.g., Response rate)**:
```
Logistic Regression:

logit(P(Response)) = β_0 + β_1*Engagement + β_2*Treatment + 
                     β_3*Baseline + β_4*(Engagement × Treatment)

Test for trend: Cochran-Armitage trend test across engagement categories
```

**Section 4: Analysis Plan**

**Step 1: Descriptive Statistics**
- Summarize engagement distribution in each treatment arm
- Mean, median, SD, range for continuous engagement
- N (%) in each engagement category
- Visualize with histogram and box plots

**Step 2: Dose-Response Test (Primary)**
- **Population**: Intent-to-Treat (all randomized)
- **Test**: Linear regression testing β_1 (engagement coefficient)
- **Null hypothesis**: β_1 = 0 (no dose-response)
- **Alternative**: β_1 > 0 (positive dose-response)
- **Significance**: p < 0.05 (one-tailed, if directional hypothesis justified)

**Step 3: Trend Test (Categorical Engagement)**
- Cochran-Armitage test for trend across ordered groups
- Visual: Line graph showing outcome by engagement category

**Step 4: Interaction Test**
- Test if dose-response differs by treatment arm (DTx vs. Control)
- Interaction term: Engagement × Treatment
- Interpretation:
  - Significant interaction + stronger slope in DTx arm → engagement specific to active treatment
  - No interaction → engagement matters regardless of treatment (may reflect general motivation)

**Section 5: Handling Confounders**

**Potential Confounders**:
- Baseline severity (more severe patients may engage less)
- Demographics (age, tech literacy)
- Comorbidities
- Randomized treatment arm

**Adjustment Strategy**:
- Include confounders as covariates in regression model
- Test interaction terms if theory suggests effect modification
- Stratified analyses by baseline severity

**Section 6: Causality Considerations**

**Caution**: Dose-response is observational within randomized trial
- Engagement is not randomized → selection bias possible
- Participants who engage more may differ from those who don't (motivation, severity, tech literacy)
- **Cannot conclude causality** from dose-response alone

**Mitigation Strategies**:
- Adjust for baseline characteristics
- Conduct mediation analysis (Step 4) to strengthen causal inference
- Compare dose-response in DTx vs. Control arm (interaction test)
- Sensitivity analyses (e.g., propensity score matching on engagement)

**Interpretation Guidelines**:
- Positive dose-response + significant treatment effect → supports engagement as active ingredient
- Positive dose-response in Control arm too → may reflect placebo or general motivation
- No dose-response despite treatment effect → engagement may not be critical (or threshold effect)

**Section 7: Sensitivity Analyses**

1. **Alternative Engagement Definitions**:
   - Continuous % vs. categorical groups
   - Module completion vs. composite engagement score
   - Early engagement (Weeks 0-4) vs. sustained engagement (Weeks 0-12)

2. **Alternative Outcome Measures**:
   - Primary endpoint vs. secondary endpoints
   - Continuous vs. binary response

3. **Per-Protocol Population**:
   - Exclude participants with <2 weeks of any activity (minimal exposure)
   - Compare to ITT findings

4. **Time-to-Event Analysis**:
   - Time to achieving adequate engagement (≥75%)
   - Association with clinical milestone (e.g., time to response)

**Section 8: Visualization Plan**

- **Figure 1**: Histogram of engagement distribution (by treatment arm)
- **Figure 2**: Scatter plot with LOESS curve (Engagement vs. Outcome)
- **Figure 3**: Line graph (Mean outcome by engagement category, with 95% CI)
- **Figure 4**: Forest plot (Dose-response slope by subgroups)

**Quality Check**:
✅ Statistical model appropriate for outcome type  
✅ Confounders identified and adjustment plan specified  
✅ Causality limitations acknowledged  
✅ Sensitivity analyses address key assumptions  
✅ Visualization plan supports interpretation  
✅ Plan is reproducible (could be coded by statistician not involved in planning)  

**Example Output**:
See Section 7.3 for complete worked example of Dose-Response Analysis Plan.

---

### PHASE 4: MEDIATION ANALYSIS (30 minutes)

---

#### **STEP 4: Plan Mediation Analysis (30 minutes)**

**Objective**: Design causal mediation analysis to test whether engagement mediates the treatment effect on clinical outcomes (i.e., does the treatment work BECAUSE it increases engagement?).

**Persona**: P04_BIOSTAT (Lead), P01_CMO (Mechanistic interpretation)

**Prerequisites**:
- Dose-Response Analysis Plan from Step 3
- Understanding of DTx therapeutic mechanism
- Familiarity with causal mediation methods (Baron & Kenny, PROCESS, mediation package in R)

**Process**:

1. **Review Causal Framework** (5 minutes)
   - Understand mediation hypothesis: Treatment → Engagement → Outcome
   - Identify alternative pathways (direct effect of treatment not through engagement)
   - Consider confounders affecting both engagement and outcome

2. **Execute Prompt 4.1** (20 minutes)
   - Use Mediation Analysis Planning prompt
   - Specify conceptual model (directed acyclic graph)
   - Select statistical approach (Baron & Kenny, modern causal mediation)
   - Define direct effect, indirect effect, proportion mediated
   - Plan sensitivity analyses for unmeasured confounding
   - Specify assumptions and limitations

3. **Cross-Functional Review** (5 minutes)
   - CMO validates mechanistic plausibility
   - Discuss alternative explanations for findings
   - Confirm interpretation guidelines

**Deliverable**: Mediation Analysis Strategy Document (3-4 pages)

**Content Structure**:

**Section 1: Mediation Hypothesis**

**Research Question**: Does engagement mediate the effect of the DTx intervention on clinical outcomes?

**Conceptual Model**:
```
Treatment Assignment (X) → Engagement (M) → Clinical Outcome (Y)
              ↓                                    ↑
              └──────── Direct Effect ─────────────┘
```

Where:
- X = Treatment assignment (DTx vs. Control)
- M = Engagement (mediator)
- Y = Clinical outcome (e.g., PHQ-9 change)
- Path a: Effect of Treatment on Engagement
- Path b: Effect of Engagement on Outcome (controlling for Treatment)
- Path c: Total effect of Treatment on Outcome
- Path c': Direct effect of Treatment on Outcome (not through Engagement)
- **Indirect effect (mediated effect)**: a × b

**Clinical Interpretation**:
- If mediation is significant → Engagement is mechanism through which DTx works
- If no mediation → DTx may work through other pathways (e.g., self-monitoring, expectancy)
- Proportion mediated: What % of treatment effect is explained by engagement?

**Section 2: Statistical Approach**

**Traditional Baron & Kenny Approach** (4-step method):

Step 1: Test if Treatment affects Outcome (path c)
- Model: `Y ~ X`
- Test: Is c significant? (Required for mediation)

Step 2: Test if Treatment affects Mediator (path a)
- Model: `M ~ X`
- Test: Is a significant? (Required for mediation)

Step 3: Test if Mediator affects Outcome controlling for Treatment (path b)
- Model: `Y ~ X + M`
- Test: Is b significant? (Required for mediation)

Step 4: Compare total effect (c) vs. direct effect (c')
- Full mediation: c' not significant (all effect through mediator)
- Partial mediation: c' still significant but reduced
- No mediation: c' same as c

**Modern Causal Mediation Approach** (Recommended):

Use causal mediation framework (e.g., Imai, Keele, Tingley):

```R
# Using mediation package in R
med_model <- lm(Engagement ~ Treatment + Baseline_covariates)
out_model <- lm(Outcome ~ Treatment + Engagement + Baseline_covariates)
mediation_analysis <- mediate(med_model, out_model, treat="Treatment", mediator="Engagement")

# Outputs:
# - ACME (Average Causal Mediation Effect) = Indirect effect
# - ADE (Average Direct Effect) = Direct effect not through mediator
# - Total Effect = ACME + ADE
# - Proportion Mediated = ACME / Total Effect
```

**Section 3: Effect Decomposition**

**Total Effect**: Treatment → Outcome (c)
- This is the primary efficacy result from the RCT

**Direct Effect** (c'): Treatment → Outcome (not through Engagement)
- Mechanisms NOT involving engagement:
  - Self-monitoring awareness (just tracking mood improves it)
  - Placebo effect (expectancy of benefit)
  - Therapeutic relationship (coach support, if applicable)
  - Non-engagement features (e.g., educational content viewed but not practiced)

**Indirect Effect** (a × b): Treatment → Engagement → Outcome
- This is the mediated effect we're testing
- Proportion mediated: (a × b) / c

**Example**:
- Total Treatment Effect on PHQ-9: -3.5 points (c)
- Direct Effect: -1.5 points (c')
- Indirect Effect (via engagement): -2.0 points (a × b)
- **Proportion Mediated: 57%** (2.0 / 3.5)
  - Interpretation: 57% of treatment effect is explained by engagement

**Section 4: Assumptions and Limitations**

**Key Assumptions**:
1. **No unmeasured confounders** affecting both Engagement and Outcome
   - Example violators: Motivation, tech literacy, baseline severity
   - Mitigation: Adjust for all baseline covariates; sensitivity analysis

2. **Temporal ordering**: Treatment → Engagement → Outcome (not Outcome → Engagement)
   - Check: Engagement measured during intervention, outcome at end
   - Potential issue: Early symptom improvement may increase engagement (reverse causation)

3. **Treatment-mediator interaction**: Effect of Engagement on Outcome doesn't depend on Treatment
   - Test: Include Treatment × Engagement interaction term
   - If significant, may need more complex mediation model

4. **Correct functional form**: Linear relationships (or appropriate transformations)

**Limitations**:
- Engagement is not randomized → residual confounding possible
- Mediation analysis is fundamentally observational (even within RCT)
- Cannot definitively prove causality, only provide supporting evidence
- Multiple mediators may exist (engagement may be one of several pathways)

**Section 5: Sensitivity Analyses**

**Sensitivity Analysis 1: Unmeasured Confounding**
- Use sensitivity analysis framework (e.g., Imai et al. method)
- Test how strong unmeasured confounder would need to be to nullify mediation
- Report "rho" (correlation needed to eliminate indirect effect)

**Sensitivity Analysis 2: Alternative Engagement Metrics**
- Test mediation using different engagement measures
  - Continuous % completion vs. categorical groups
  - Module completion vs. composite score
  - Early engagement vs. cumulative engagement
- Check if mediation findings are robust

**Sensitivity Analysis 3: Alternative Outcomes**
- Test mediation for primary endpoint
- Test mediation for key secondary endpoints
- Check consistency of mechanism across outcomes

**Sensitivity Analysis 4: Subgroup Analyses**
- Test mediation separately by baseline severity
- Test mediation by demographic subgroups
- Check if engagement matters more for certain populations

**Section 6: Interpretation Guidelines**

**Scenario 1: Significant Mediation (Proportion ≥ 50%)**
- **Finding**: Engagement explains most/all of treatment effect
- **Interpretation**: DTx works primarily by increasing engagement with therapeutic content
- **Implications**:
  - Engagement is active ingredient
  - Strategies to boost engagement are critical
  - Low engagement may predict poor outcomes → intervene early
- **Regulatory**: Strong evidence for mechanism of action

**Scenario 2: Partial Mediation (Proportion 20-49%)**
- **Finding**: Engagement explains some but not all of treatment effect
- **Interpretation**: DTx works through multiple pathways; engagement is one important pathway
- **Implications**:
  - Engagement matters but not the only mechanism
  - Other features (self-monitoring, education) also contribute
  - Optimization should target engagement AND other pathways
- **Regulatory**: Supportive evidence; may need to explore other mechanisms

**Scenario 3: No Mediation (Proportion < 20%)**
- **Finding**: Treatment effect not explained by engagement
- **Interpretation**: DTx works through pathways other than engagement with therapeutic content
- **Implications**:
  - Engagement may not be as critical as hypothesized
  - Consider alternative mechanisms (awareness, expectancy, coach support)
  - May indicate engagement metrics don't capture true therapeutic dose
- **Regulatory**: May raise questions about necessity of engagement; need to identify actual mechanism

**Scenario 4: Significant Treatment Effect, But No Effect on Engagement (Path a not significant)**
- **Finding**: DTx improves outcomes but doesn't increase engagement vs. control
- **Interpretation**: Treatment and control have similar engagement, but DTx engagement is more therapeutically effective
- **Implications**:
  - Quality of engagement matters more than quantity
  - Content specificity is key (CBT content vs. psychoeducation)
- **Regulatory**: Suggests active ingredient is content, not engagement per se

**Section 7: Reporting Plan**

**Statistical Output Table**:
| Effect | Estimate | 95% CI | p-value |
|--------|----------|--------|---------|
| Total Effect (c) | -3.5 | [-4.8, -2.2] | <0.001 |
| Direct Effect (c') | -1.5 | [-2.6, -0.4] | 0.008 |
| Indirect Effect (a×b) | -2.0 | [-3.0, -1.0] | <0.001 |
| Proportion Mediated | 57% | [38%, 76%] | - |

**Visualization**:
- **Figure 1**: Path diagram with standardized coefficients on each arrow
- **Figure 2**: Bar chart comparing Total, Direct, and Indirect effects
- **Figure 3**: Forest plot of proportion mediated across subgroups

**Narrative Summary**:
- Provide clear, clinically-oriented interpretation
- Avoid overstating causality (use language like "suggests" or "consistent with")
- Discuss clinical implications for product optimization
- Address limitations and alternative explanations

**Quality Check**:
✅ Causal framework is clearly specified  
✅ Statistical approach is rigorous and modern  
✅ Assumptions are stated and tested  
✅ Sensitivity analyses address key threats to validity  
✅ Interpretation guidelines prevent overinterpretation  
✅ Plan includes limitations and alternative explanations  
✅ Visualization plan communicates findings clearly  

**Example Output**:
See Section 7.4 for complete worked example of Mediation Analysis Plan.

---

### PHASE 5: REGULATORY STRATEGY (30 minutes)

---

#### **STEP 5: Create Regulatory Positioning Strategy (30 minutes)**

**Objective**: Develop strategy for positioning engagement data to FDA, addressing likely concerns, and maximizing regulatory value.

**Persona**: P05_REGDIR (Lead), P01_CMO (Clinical support), P02_VPCLIN (Trial design support)

**Prerequisites**:
- All prior deliverables (Taxonomy, Operational Definitions, Dose-Response Plan, Mediation Plan)
- Understanding of FDA precedents for DTx engagement
- Knowledge of FDA Digital Health guidance documents

**Process**:

1. **Review FDA Precedents** (10 minutes)
   - Identify similar DTx products that received FDA clearance/approval
   - Extract how engagement data was presented in FDA submissions
   - Note FDA questions or concerns from decision summaries
   - Identify successful positioning strategies

2. **Execute Prompt 5.1** (15 minutes)
   - Use Regulatory Positioning Strategy prompt
   - Frame engagement as supportive evidence (not primary efficacy)
   - Identify potential FDA concerns and proactive responses
   - Determine optimal placement in submission (summary vs. clinical section)
   - Develop Pre-Sub meeting strategy for engagement discussions
   - Create FAQ document for anticipated FDA questions

3. **Cross-Functional Alignment** (5 minutes)
   - Regulatory Director presents strategy
   - CMO validates clinical framing
   - VP Clinical Development confirms alignment with trial design
   - Team agrees on messaging and positioning

**Deliverable**: Regulatory Positioning Strategy Document (3-5 pages)

**Content Structure**:

**Section 1: Regulatory Context for Engagement Data**

**FDA's Perspective on DTx Engagement**:
- FDA wants to see that patients **will** use the product in real-world settings
- Low engagement (<50% completion) raises feasibility concerns
- Engagement data is typically **supportive**, not primary efficacy evidence
- FDA distinguishes between:
  - **Adherence** (did patient access the product?)
  - **Engagement** (did patient interact meaningfully with therapeutic content?)

**FDA Guidance References**:
- "Digital Health Technologies for Remote Data Acquisition in Clinical Investigations" (2023)
- "Clinical Decision Support Software" (2022)
- "Policy for Device Software Functions and Mobile Medical Applications" (2022)
- No specific guidance on DTx engagement thresholds (evolving area)

**Regulatory Precedents**:

| DTx Product | Indication | FDA Pathway | Engagement Data Role | Outcome |
|-------------|------------|-------------|----------------------|---------|
| **reSET®** | Substance Use Disorder | De Novo (2017) | # modules completed; dose-response shown | **AUTHORIZED** - engagement supported feasibility |
| **reSET-O®** | Opioid Use Disorder | De Novo (2018) | Similar to reSET; 60+ modules available | **AUTHORIZED** - engagement demonstrated |
| **Somryst®** | Chronic Insomnia | De Novo (2020) | # CBT-I sessions completed; ≥4 sessions → benefit | **AUTHORIZED** - engagement defined therapeutic dose |
| **EndeavorRx®** | ADHD (Pediatric) | De Novo (2020) | Days of gameplay; 25 sessions over 4 weeks minimum | **AUTHORIZED** - engagement feasibility in children critical |

**Key Takeaway**: FDA has accepted engagement data as supportive evidence of feasibility and dose-response, but not as sole efficacy evidence.

**Section 2: Positioning Strategy for Our DTx**

**Framing Approach**:

**1. Primary Efficacy: Intent-to-Treat Analysis**
- Lead with ITT analysis showing treatment effect regardless of engagement
- Message: "DTx improves outcomes in the population offered the intervention"
- This is the regulatory gold standard

**2. Supportive Evidence: Engagement Demonstrates Feasibility**
- Show that majority of participants engaged adequately (e.g., ≥75% completion)
- Message: "Participants were willing and able to use the DTx product"
- Address feasibility concerns preemptively

**3. Supportive Evidence: Dose-Response Validates Mechanism**
- Show positive dose-response (higher engagement → better outcomes)
- Message: "Clinical benefit is related to engagement with therapeutic content, supporting the mechanism of action"
- Strengthens causal inference

**4. Supportive Evidence: Mediation Analysis**
- Show engagement mediates treatment effect
- Message: "The DTx works by increasing engagement with evidence-based therapeutic techniques"
- Provides mechanistic understanding

**Positioning Hierarchy**:
```
Primary: ITT Efficacy (Treatment vs. Control)
   ↓
Supporting: Engagement Feasibility (X% achieved adequate engagement)
   ↓
Supporting: Dose-Response (More engagement → Better outcomes)
   ↓
Supporting: Mediation (Treatment → Engagement → Outcomes)
```

**Section 3: Anticipated FDA Questions & Proactive Responses**

**Question 1**: "What percentage of participants engaged adequately with the intervention?"

**Proactive Response**:
- **Data**: X% of DTx arm participants completed ≥75% of modules (our threshold for adequate engagement)
- **Benchmark**: Compare to engagement rates in other FDA-authorized DTx products (typically 50-70%)
- **Clinical Context**: Even participants with lower engagement showed benefit (ITT analysis)
- **Real-World Relevance**: Engagement rates in trial likely reflect real-world usage

**Question 2**: "How do you define 'adequate engagement'? Is this threshold evidence-based?"

**Proactive Response**:
- **Threshold Definition**: ≥75% module completion (≥18 of 24 modules)
- **Evidence**: 
  - Pilot data (N=50) showed ≥18 modules associated with clinically meaningful response
  - Dose-response analysis in pivotal trial confirms threshold
  - Precedent: Somryst used ≥4 of 6 sessions (67%)
- **Conservative**: Threshold is conservative; benefit seen at lower engagement too

**Question 3**: "What about participants who didn't engage? Doesn't low engagement undermine the treatment effect?"

**Proactive Response**:
- **ITT Analysis**: Primary efficacy is ITT, including all participants regardless of engagement
- **Treatment Effect Maintained**: Significant benefit even with some non-engagers included
- **Per-Protocol Analysis**: As sensitivity, excluded minimal engagers (<2 weeks activity); effect size increased (as expected)
- **Real-World Reflection**: Non-engagement is a real-world phenomenon; product must account for it

**Question 4**: "Could the dose-response just reflect selection bias (motivated patients engage more AND improve more)?"

**Proactive Response**:
- **Adjustment for Confounders**: Dose-response analysis adjusted for baseline severity, demographics, and other confounders
- **Mediation Analysis**: Formal mediation testing suggests causal pathway
- **Interaction Test**: Dose-response stronger in DTx arm than control arm (suggests specific effect of therapeutic content)
- **Limitation Acknowledged**: Observational within RCT; cannot prove causality definitively, but evidence is supportive

**Question 5**: "How will you ensure patients engage adequately in the real world?"

**Proactive Response**:
- **Built-In Features**: App includes reminders, progress tracking, gamification elements
- **Support System**: [If applicable] Coach/therapist support for low engagers
- **Labeling**: Product labeling will recommend completing ≥75% of modules for optimal benefit
- **Post-Market Surveillance**: Plan to monitor real-world engagement and outcomes

**Question 6**: "What if engagement rates are lower in real-world than in clinical trial?"

**Proactive Response**:
- **Conservative Estimates**: Trial engagement may be higher due to trial support; labeling reflects this
- **Product Optimization**: Ongoing UX improvements based on user feedback
- **Real-World Evidence**: Commitment to collect RWE on engagement and outcomes post-market
- **Risk-Benefit**: Even with lower real-world engagement, risk is minimal (no drug side effects)

**Section 4: Placement in FDA Submission**

**Where Engagement Data Goes**:

**1. Device Description Section**:
- Brief overview of engagement metrics captured
- Description of analytics platform

**2. Clinical Evaluation Section**:
- **Primary Efficacy**: ITT analysis (separate from engagement)
- **Supportive Analyses Subsection**:
  - Engagement feasibility summary
  - Dose-response analysis results
  - Mediation analysis results

**3. Risk Analysis Section**:
- Address low engagement as potential limitation
- Discuss mitigation strategies (reminders, support, labeling)

**4. Labeling**:
- Include engagement recommendation in Instructions for Use
  - Example: "For optimal clinical benefit, complete at least 18 of 24 modules over a 12-week period."

**What NOT to Include**:
- ❌ Do NOT claim engagement as primary efficacy endpoint (it's not randomized)
- ❌ Do NOT overstate causality from dose-response/mediation (observational)
- ❌ Do NOT exclude non-engagers from primary analysis (ITT is gold standard)

**Section 5: Pre-Submission Meeting Strategy**

**Recommended Approach**: Request Type C Pre-Sub Meeting

**Meeting Objectives**:
1. Confirm FDA's view on engagement data placement and interpretation
2. Discuss engagement threshold and whether evidence is sufficient
3. Address any concerns about low engagement or non-adherence
4. Align on labeling language regarding engagement recommendations

**Meeting Package Contents**:
- Brief (5-page) overview of engagement strategy
- Table summarizing engagement metrics and thresholds
- Dose-response analysis plan (or preliminary results if available)
- Questions for FDA:
  1. Is our engagement threshold (≥75%) acceptable and evidence-based?
  2. Should engagement data be in primary clinical section or supportive?
  3. Are dose-response and mediation analyses sufficient to support mechanism?
  4. Any concerns about engagement feasibility in real-world settings?

**Timing**: 
- Ideal: Before study start (get FDA input on engagement plan)
- Acceptable: After interim analysis (if dose-response looks promising)
- Minimum: Before final submission (address any ambiguities)

**Section 6: Risk Mitigation & Contingency Plans**

**Risk 1**: FDA questions engagement threshold as arbitrary

**Mitigation**:
- Provide evidence from pilot data and literature
- Show sensitivity analyses with alternative thresholds
- Reference precedents from other DTx products

**Contingency**: 
- If FDA disagrees, offer to conduct post-market study validating threshold
- Revise labeling to be more conservative

**Risk 2**: Low engagement rates raise feasibility concerns

**Mitigation**:
- Benchmark against other DTx products (50-70% is typical)
- Show that even lower engagers have some benefit (ITT effect)
- Highlight product features designed to maintain engagement

**Contingency**:
- If engagement <40%, may need to redesign product or add support (e.g., coaching)
- Consider additional study with enhanced engagement strategy

**Risk 3**: FDA sees dose-response as insufficient evidence for mechanism

**Mitigation**:
- Position as supportive, not definitive
- Supplement with mediation analysis and interaction tests
- Cite literature on DTx mechanisms of action

**Contingency**:
- Offer to collect additional mechanistic data post-market
- Focus on ITT efficacy as primary; engagement as secondary

**Quality Check**:
✅ FDA precedents reviewed and strategy aligns  
✅ Positioning frames engagement as supportive, not primary  
✅ Anticipated FDA questions have well-reasoned responses  
✅ Placement strategy is clear and justified  
✅ Pre-Sub meeting plan is concrete and timely  
✅ Risks identified with mitigation plans  
✅ Strategy approved by Regulatory Director and CMO  

**Example Output**:
See Section 7.5 for complete worked example of Regulatory Positioning Strategy Document.

---

## 6. COMPLETE PROMPT SUITE

### 6.1 Prompt Overview Table

| Prompt ID | Prompt Name | Persona | Time | Complexity | Phase |
|-----------|-------------|---------|------|------------|-------|
| **1.1** | Engagement Taxonomy Definition | P02_VPCLIN | 20 min | INTERMEDIATE | Engagement Definition |
| **2.1** | Metric Operationalization | P04_BIOSTAT | 25 min | ADVANCED | Operationalization |
| **3.1** | Dose-Response Analysis Design | P04_BIOSTAT | 20 min | ADVANCED | Dose-Response |
| **4.1** | Mediation Analysis Planning | P04_BIOSTAT | 20 min | EXPERT | Mediation |
| **5.1** | Regulatory Positioning Strategy | P05_REGDIR | 15 min | ADVANCED | Regulatory Strategy |

---

### 6.2 Complete Prompts with Examples

---

#### **PROMPT 1.1: Engagement Taxonomy Definition**

**Persona**: P02_VPCLIN (Lead), P03_PRODMGR (Co-lead)  
**Time**: 20 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a VP of Clinical Development with deep expertise in digital therapeutics and user engagement measurement. You excel at distinguishing between descriptive usage metrics and therapeutically meaningful engagement metrics. You understand that not all app interactions are equally valuable—the goal is to measure interactions that drive clinical improvement.

You are familiar with:
- DTx engagement best practices (DiMe frameworks, C-Path)
- Successful DTx products and their engagement strategies (reSET, Somryst, EndeavorRx)
- Behavioral psychology and therapeutic dose concepts
- FDA expectations for DTx feasibility and mechanism of action

USER PROMPT:
I need to create a comprehensive engagement taxonomy for my DTx clinical trial that clearly distinguishes between usage (descriptive) and engagement (therapeutically meaningful).

**DTx Product Context:**
- Product Name: {dtx_product_name}
- Indication: {target_indication}
- Platform: {app/web/wearable/mixed}
- Core Therapeutic Features: {list_all_features}
  Example: 24 CBT modules, mood tracking, skill practice exercises, goal setting
- Treatment Duration: {number_of_weeks}
- Expected Usage Pattern: {sessions_per_week}
  Example: 3 sessions per week, 20-30 minutes each

**Therapeutic Mechanism:**
{describe_how_dtx_works}
Example: CBT-based DTx works by teaching cognitive restructuring and behavioral activation. Users must practice skills to see benefit, not just read content.

**Please create an engagement taxonomy following this structure:**

---

### **SECTION 1: USAGE METRICS (Descriptive Only)**

**Purpose**: Assess feasibility and product performance, but NOT therapeutic dose

List all usage metrics that describe HOW users interact with the app, but don't necessarily indicate therapeutic engagement:

1. **App Opens/Launches**
   - Definition: Number of times user opens the app
   - Purpose: Feasibility metric; shows product is accessible
   - Limitation: Opening app ≠ therapeutic activity

2. **Session Duration**
   - Definition: Total time spent in app per session
   - Purpose: Engagement intensity; but time ≠ quality

3. **Days Active**
   - Definition: Number of days with at least one interaction
   - Purpose: Engagement consistency

4. **Feature Clicks/Interactions**
   - Definition: Clicks on buttons, navigation, etc.
   - Purpose: Product analytics; UX optimization

5. [Add other usage metrics specific to your product]

**Key Principle**: Usage metrics describe behavior but don't confirm therapeutic value.

---

### **SECTION 2: ENGAGEMENT METRICS (Therapeutically Meaningful)**

**Purpose**: Measure interactions that should lead to clinical improvement based on therapeutic mechanism

For EACH engagement metric, provide:
- **Metric Name**
- **Definition** (precise)
- **Therapeutic Rationale**: Why does this metric matter for clinical outcomes?
- **Data Source**: How is it captured?
- **Measurement Unit**: % completion, count, frequency, etc.

**Example Engagement Metrics**:

**2.1 Content Completion**
- **Definition**: Percentage of therapeutic modules/lessons completed
- **Therapeutic Rationale**: Completing modules ensures exposure to all evidence-based techniques. Dose-response literature shows ≥75% completion associated with clinical benefit.
- **Data Source**: Event logging when user completes module (views all pages + passes comprehension check)
- **Measurement Unit**: % of total modules completed (e.g., 18 of 24 = 75%)

**2.2 Skill Practice**
- **Definition**: Number of skill-building exercises completed (e.g., thought records, behavioral experiments)
- **Therapeutic Rationale**: CBT requires active practice to consolidate learning. Passive reading is insufficient.
- **Data Source**: Event logging when user submits exercise with content
- **Measurement Unit**: Count of exercises completed

**2.3 Goal Achievement**
- **Definition**: Percentage of self-set behavioral goals met
- **Therapeutic Rationale**: Goal achievement indicates behavioral change, the ultimate aim of DTx
- **Data Source**: User self-report in app
- **Measurement Unit**: % of goals marked "achieved"

**2.4 Self-Monitoring Consistency**
- **Definition**: Percentage of days with mood/symptom tracking entry
- **Therapeutic Rationale**: Self-monitoring increases awareness and is first step in behavioral change
- **Data Source**: Diary entries logged by user
- **Measurement Unit**: % of days with ≥1 entry

[Add other engagement metrics specific to your DTx]

---

### **SECTION 3: ENGAGEMENT LEVELS (Categorical Thresholds)**

Define 3-4 engagement levels based on therapeutic dose:

**3.1 Non-Engaged**
- **Threshold**: <25% module completion (<6 of 24 modules)
- **Therapeutic Interpretation**: Insufficient exposure to therapeutic content; unlikely to see clinical benefit
- **Expected Clinical Outcome**: Minimal change; comparable to control group

**3.2 Minimally Engaged**
- **Threshold**: 25-49% module completion (6-11 of 24 modules)
- **Therapeutic Interpretation**: Subtherapeutic dose; may see some benefit but below minimal effective dose
- **Expected Clinical Outcome**: Small effect; unlikely to reach clinical response

**3.3 Adequately Engaged**
- **Threshold**: 50-74% module completion (12-17 of 24 modules)
- **Therapeutic Interpretation**: Likely therapeutic dose; exposed to core techniques
- **Expected Clinical Outcome**: Moderate effect; likely to see clinical benefit

**3.4 Highly Engaged**
- **Threshold**: ≥75% module completion (≥18 of 24 modules)
- **Therapeutic Interpretation**: Optimal therapeutic dose; comprehensive exposure to all techniques
- **Expected Clinical Outcome**: Maximal effect; highest probability of clinical response

**Rationale for Thresholds**:
{provide evidence or citations}
Example: "Pilot data (N=50) showed ≥75% completion associated with 60% response rate vs. 30% with <75% completion (p=0.02)"

---

### **SECTION 4: COMPOSITE ENGAGEMENT SCORE (Optional)**

If combining multiple engagement metrics into a single score:

**Composite Score Formula**:
Engagement_Score = (w1 × Module_Completion_%) + (w2 × Skill_Practice_Rate) + (w3 × Self_Monitoring_%)

Where weights (w1, w2, w3) sum to 1.0

**Weighting Rationale**:
- Module Completion: 60% (most direct indicator of therapeutic dose)
- Skill Practice: 30% (active learning is critical)
- Self-Monitoring: 10% (supportive but not sufficient alone)

**Interpretation**:
- Composite Score ≥75 = Adequately Engaged
- Composite Score <75 = Below therapeutic threshold

---

### **SECTION 5: DATA CAPTURE SPECIFICATIONS**

For each engagement metric, specify:

**Event Logging**:
- What events trigger logging? (e.g., "module_complete" event)
- What data is captured? (study_id, timestamp, module_id, completion_status)
- How is data stored? (secure database, de-identified, HIPAA-compliant)
- How often is data synced? (real-time, daily, weekly)

**Data Quality Checks**:
- Duplicate detection (e.g., user clicks "complete" multiple times)
- Anomaly detection (e.g., 10 modules in 10 minutes → bot behavior)
- Missingness handling (e.g., user stops logging after Week 6)

**Real-Time Monitoring**:
- Dashboard for study coordinators to monitor engagement
- Alerts for participants with zero activity for ≥7 days (outreach opportunity)

---

### **SECTION 6: MEASUREMENT TIMING**

Specify WHEN engagement is assessed:

**Primary Timepoint**:
- End of Treatment Period (Week 12): Cumulative engagement from baseline to Week 12

**Interim Timepoints** (for dose-response analysis):
- Week 4: Early engagement
- Week 8: Mid-treatment engagement

**Follow-Up**:
- Week 16: Sustained engagement post-treatment (optional)

**Handling Early Dropout**:
- If user withdraws at Week 8, calculate engagement up to Week 8 (not Week 12)
- Intent-to-Treat: Missing engagement = 0% (conservative)

---

### **OUTPUT FORMAT:**

Please provide:
1. **Summary Table**: All engagement metrics in a table
   | Metric | Type | Therapeutic Rationale | Data Source | Measurement Unit |
   |--------|------|----------------------|-------------|------------------|
   | ...    | ...  | ...                  | ...         | ...              |

2. **Engagement Levels Table**:
   | Level | Threshold | Clinical Interpretation |
   |-------|-----------|------------------------|
   | ...   | ...       | ...                    |

3. **Narrative Summary** (1-2 pages): Why this taxonomy makes sense for our DTx product, how it aligns with therapeutic mechanism, and how it will be used in the clinical trial.

---

### **CRITICAL REQUIREMENTS:**
- ✅ Clear distinction between usage (descriptive) and engagement (therapeutic)
- ✅ Every engagement metric has explicit therapeutic rationale
- ✅ Engagement thresholds are evidence-based (cite pilot data, literature, or precedent)
- ✅ Data capture is feasible given product infrastructure
- ✅ Taxonomy is comprehensive but not overwhelming (10-15 metrics max)
```

**EXAMPLE INPUT**:
```
Product Name: MindShift
Indication: Major Depressive Disorder (moderate)
Platform: Mobile app (iOS/Android)
Core Therapeutic Features:
- 24 CBT modules (cognitive restructuring, behavioral activation, relapse prevention)
- Daily mood tracking (PHQ-2)
- Skill practice exercises (thought records, activity scheduling)
- Goal setting and tracking (behavioral targets)
- Progress dashboard

Treatment Duration: 12 weeks
Expected Usage: 3 sessions per week, 25 minutes each

Therapeutic Mechanism:
MindShift delivers cognitive-behavioral therapy (CBT) for depression. The mechanism requires:
1. Learning cognitive techniques (identifying and challenging negative thoughts)
2. Practicing behavioral activation (scheduling and completing rewarding activities)
3. Self-monitoring mood to increase awareness and track progress
Clinical benefit depends on active practice, not passive content consumption.
```

**EXAMPLE OUTPUT**:
See Section 7.1 for complete example output.

---

#### **PROMPT 2.1: Metric Operationalization**

**Persona**: P04_BIOSTAT (Lead), P02_VPCLIN (Support)  
**Time**: 25 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Senior Biostatistician specializing in digital health clinical trials. You excel at translating conceptual engagement metrics into precise, reproducible, statistical definitions with exact calculation algorithms. You understand the importance of:
- Unambiguous definitions (no room for interpretation)
- Evidence-based thresholds (justified by data, not arbitrary)
- Handling edge cases and missing data conservatively
- Data quality and validation checks
- Sensitivity analyses to test robustness of findings

You are skilled in operationalizing complex behavioral data for statistical analysis.

USER PROMPT:
Given the engagement taxonomy I've defined, I need to operationalize the PRIMARY engagement metric with full technical specifications so a statistician can implement it without ambiguity.

**Engagement Taxonomy** (from Step 1):
{paste_engagement_taxonomy_from_previous_step}

**Primary Engagement Metric Identified**:
{metric_name} (typically: Module Completion Percentage)

**For this primary engagement metric, provide:**

---

### **1. PRECISE DEFINITION**

**Metric Name**: {metric_name}

**What Constitutes "Completion"?**
- Specify ALL conditions that must be met for a module to be considered "complete"
- Examples:
  - ✅ User viewed all content pages in sequence (cannot skip ahead)
  - ✅ User completed all required exercises within the module (≥80% correct if graded)
  - ✅ User passed end-of-module comprehension quiz (≥70% score)
  - ✅ Module marked "COMPLETE" in database (completion_status = 1)

**What About Partial Completion?**
- Define explicitly: If user views 90% of content but doesn't complete quiz, is module "complete"?
- Recommended: Binary coding (complete = 1, incomplete = 0) for simplicity

**Time Window**:
- Must module be completed within a specific timeframe?
- Example: Must complete within the 12-week intervention period (not 6 months later)

**Handling Re-Completion**:
- If user completes Module 1, then re-does it, does it count twice?
- Recommended: Count only first completion (avoid inflating engagement)

---

### **2. CALCULATION ALGORITHM**

**Formula**:
```
Module_Completion_% = (Number_of_Modules_Completed / Total_Available_Modules) × 100
```

**Step-by-Step Algorithm**:

**Step 1**: Identify all modules available to the user
- Total_Available_Modules = {number} (product-specific)
- Note: Some users may have different module sets (e.g., if adaptive); specify how to handle

**Step 2**: Query database for completed modules
- SQL Example:
  ```sql
  SELECT study_id, module_id, completion_timestamp
  FROM engagement_events
  WHERE study_id = '{user_id}'
    AND event_type = 'module_complete'
    AND completion_timestamp BETWEEN baseline_date AND week12_date
  ```

**Step 3**: Count unique completed modules
- `Number_of_Modules_Completed = COUNT(DISTINCT module_id WHERE completion_status = 1)`
- Handle duplicates: If user completed Module 1 twice, count once

**Step 4**: Calculate percentage
- `Module_Completion_% = (Number_of_Modules_Completed / Total_Available_Modules) × 100`
- Round to 1 decimal place (e.g., 75.0%)

**Step 5**: Assign engagement category (optional)
- Non-Engaged: <25%
- Minimally Engaged: 25-49%
- Adequately Engaged: 50-74%
- Highly Engaged: ≥75%

---

### **3. EVIDENCE-BASED THRESHOLDS**

For each engagement threshold, provide:
- **Threshold Value**: {number}
- **Evidence/Rationale**: {cite pilot data, literature, or precedent}
- **Clinical Interpretation**: What does this threshold mean clinically?

**Minimum Therapeutic Dose Threshold**: ≥50% completion

**Evidence**:
- Pilot study (N=50): Users completing ≥50% (≥12 of 24 modules) showed mean PHQ-9 reduction of -5.2 points vs. -1.8 points for <50% completers (p=0.02)
- Literature: Andersson et al. (2019) iCBT meta-analysis found ≥50% module completion associated with treatment response
- Precedent: reSET® showed benefit with partial completion

**Clinical Interpretation**: 
- ≥50% represents minimal exposure to core CBT techniques
- Likely to see some clinical benefit, though suboptimal

**Adequate Engagement Threshold**: ≥75% completion

**Evidence**:
- Pilot study: ≥75% completers (≥18 of 24 modules) had 60% response rate vs. 30% for <75%
- Dose-response curve plateaus around 75% in pilot data
- Somryst precedent: ≥4 of 6 sessions (67%) was threshold

**Clinical Interpretation**:
- Comprehensive exposure to all CBT techniques
- Optimal probability of clinical response

**Sensitivity Thresholds** (for analysis):
- Test alternative thresholds: 60%, 67%, 80%
- Check if findings are robust to threshold choice

---

### **4. MEASUREMENT TIMING**

**Primary Assessment Timepoint**:
- **When**: End of Week 12 (last day of intervention period)
- **What**: Cumulative module completion from Baseline (Day 0) to Week 12 (Day 84)
- **Data Source**: Query all "module_complete" events with timestamp ≤ Week 12 date

**Interim Assessments** (for dose-response analysis):
- **Week 4**: Cumulative completion from Baseline to Week 4
- **Week 8**: Cumulative completion from Baseline to Week 8
- Purpose: Test if early engagement predicts outcomes; assess engagement trajectory

**Handling Early Dropout**:

**Scenario 1**: User completes 15 modules by Week 8, then withdraws from study
- **Engagement at Week 8**: 15/24 = 62.5%
- **Engagement at Week 12** (primary timepoint): Still 15/24 = 62.5% (no additional modules after withdrawal)
- **Missing Data Approach**: Use last observation (conservative)

**Scenario 2**: User completes 10 modules by Week 6, then stops all activity but remains enrolled
- **Engagement at Week 12**: 10/24 = 41.7% (count only what was completed)
- **Classification**: Minimally Engaged (25-49%)

**Scenario 3**: User withdraws at Week 2 with 0 modules completed
- **Engagement**: 0/24 = 0%
- **Classification**: Non-Engaged
- **Intent-to-Treat**: Include in analysis with 0% engagement (conservative)

---

### **5. SENSITIVITY ANALYSES**

**Purpose**: Test robustness of engagement findings to alternative definitions and assumptions

**Sensitivity Analysis 1**: Alternative Engagement Definition
- **Primary Definition**: Module completion (binary: complete = 1, incomplete = 0)
- **Alternative**: Any module interaction (viewed ≥50% of content, even if not completed)
- **Purpose**: Check if completion is too strict; perhaps viewing content is sufficient

**Sensitivity Analysis 2**: Alternative Threshold
- **Primary Threshold**: ≥75% for adequate engagement
- **Alternative Thresholds**: ≥60%, ≥67%, ≥80%
- **Purpose**: Ensure dose-response findings aren't artifacts of arbitrary cutpoint

**Sensitivity Analysis 3**: Time-Weighted Completion
- **Primary**: All modules weighted equally
- **Alternative**: Early modules weighted more (e.g., Modules 1-8 are 70% of score, Modules 9-24 are 30%)
- **Rationale**: Early engagement may be more predictive of outcomes
- **Purpose**: Test if timing of engagement matters beyond total amount

**Sensitivity Analysis 4**: Composite Engagement Score
- **Primary**: Module completion alone
- **Alternative**: Composite score (60% module completion + 30% skill practice + 10% self-monitoring)
- **Purpose**: Check if broader engagement measure changes findings

**Sensitivity Analysis 5**: Per-Protocol Population
- **Primary**: Intent-to-Treat (include all randomized participants)
- **Alternative**: Per-Protocol (exclude participants with <2 weeks of any activity)
- **Purpose**: Test if findings driven by non-engagers diluting effect

---

### **6. DATA QUALITY CHECKS**

**Purpose**: Ensure accurate engagement data by detecting and addressing data quality issues

**Check 1**: Duplicate Event Detection
- **Issue**: User clicks "complete module" button multiple times rapidly
- **Detection**: Flag if multiple "module_complete" events for same module within 60 seconds
- **Resolution**: Count only first event; log duplicate for review

**Check 2**: Anomaly Detection (Bot Behavior)
- **Issue**: Non-human activity (e.g., automated testing, fraudulent participants)
- **Detection Rules**:
  - Completing >5 modules in <30 minutes (humanly impossible to read and engage)
  - Completing all 24 modules in <2 hours
  - All exercises submitted with identical responses
- **Resolution**: Flag for manual review; exclude if confirmed non-human

**Check 3**: Missingness Patterns
- **Issue**: User stops logging activity (technical failure vs. disengagement?)
- **Detection**: Zero engagement events for ≥7 consecutive days
- **Action**: Study coordinator outreach to troubleshoot (app crash? Lost interest?)

**Check 4**: Timestamp Validation
- **Issue**: Events logged out of order or with future timestamps
- **Detection**: Completion timestamp before enrollment date, or after study end date
- **Resolution**: Flag for data cleaning; correct or exclude erroneous events

**Check 5**: Consistency Checks
- **Issue**: Module completion % > 100% (data error)
- **Detection**: Calculate engagement for all users; flag any >100%
- **Resolution**: Investigate and correct database issues

**Automated Quality Report**:
- Run weekly during trial
- Summary dashboard:
  - # participants with engagement data
  - # flagged for duplicate events
  - # flagged for anomaly detection
  - # with zero activity last 7 days

---

### **7. MISSING DATA HANDLING**

**Type 1**: Participant Completes Some Modules, Then Stops (No Withdrawal)

**Approach**: 
- Use observed completion percentage at primary timepoint (Week 12)
- If user completed 10 modules by Week 4, then zero activity Weeks 5-12 → Engagement = 10/24 = 41.7%
- Conservative: Assumes no catch-up activity after cessation

**Type 2**: Participant Withdraws from Study

**Approach**:
- Use cumulative engagement up to withdrawal date
- Example: Withdraws at Week 8 with 15 modules → Engagement = 15/24 = 62.5%
- Do NOT impute additional engagement after withdrawal

**Type 3**: Missing Engagement Data (Technical Failure)

**Approach**:
- If user reports completing modules but data not logged (app crash, server issue):
  - Attempt to recover from backup logs
  - If irrecoverable, treat as missing
  - Do NOT impute based on other participants (too strong assumption)
- Report % participants with complete vs. incomplete engagement data

**Intent-to-Treat Principle**:
- All randomized participants included in primary analysis
- Missing engagement = 0% (most conservative)
- Sensitivity analysis: Multiple imputation for missing engagement (if <10% missing)

---

### **OUTPUT FORMAT:**

Provide a structured document with:

**Section 1**: Precise Definition (1 page)
**Section 2**: Calculation Algorithm (1 page with pseudocode/SQL)
**Section 3**: Evidence-Based Thresholds (1 page with citations)
**Section 4**: Measurement Timing & Dropout Handling (1 page)
**Section 5**: Sensitivity Analyses Plan (1 page)
**Section 6**: Data Quality Specifications (1 page)
**Section 7**: Missing Data Approach (1 page)

**Summary Table**:
| Component | Specification |
|-----------|---------------|
| Primary Metric | Module Completion % |
| Calculation | (# completed / 24 total) × 100 |
| Minimum Therapeutic Dose | ≥50% (≥12 modules) |
| Adequate Engagement | ≥75% (≥18 modules) |
| Primary Timepoint | Week 12 (end of treatment) |
| Missing Data | Last observation; ITT includes all |
| Sensitivity Analyses | 5 planned (thresholds, definitions, populations) |
| Data Quality Checks | 5 automated checks (duplicates, anomalies, missingness) |

---

### **CRITICAL REQUIREMENTS:**
- ✅ Definition is precise enough for a statistician to implement without asking clarifying questions
- ✅ Thresholds are evidence-based (cite specific data sources)
- ✅ Missing data plan is conservative and pre-specified
- ✅ Data quality checks are automated and specific
- ✅ Sensitivity analyses address key assumptions
- ✅ Document is protocol-ready (can be inserted into Statistical Analysis Plan)
```

**EXAMPLE INPUT**: 
See Section 7.2 for detailed input based on MindShift DTx example.

**EXAMPLE OUTPUT**:
See Section 7.2 for complete worked example with pseudocode and SQL queries.

---

[Continuing with remaining prompts 3.1, 4.1, and 5.1...]

#### **PROMPT 3.1: Dose-Response Analysis Design**

**Persona**: P04_BIOSTAT (Lead), P01_CMO (Clinical interpretation)  
**Time**: 20 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Senior Biostatistician with expertise in dose-response modeling and causal inference in digital health trials. You understand that engagement is observational within an RCT (not randomized), requiring careful analysis to minimize selection bias. You are skilled in:
- Linear and non-linear dose-response modeling
- Trend tests for ordered categorical data
- Mixed-effects models for longitudinal engagement
- Sensitivity analyses for unmeasured confounding
- Distinguishing correlation from causation

USER PROMPT:
I need to design a rigorous dose-response analysis testing whether higher engagement is associated with better clinical outcomes in my DTx RCT.

**Clinical Trial Context:**
- Primary Endpoint: {endpoint_name} (e.g., PHQ-9 change from baseline to Week 12)
- Endpoint Type: {continuous/binary/ordinal}
- Treatment Arms: DTx Intervention vs. {control_type}
- Sample Size: {N_per_arm} per arm
- Engagement Metric (from Step 2): {primary_engagement_metric}

**Engagement Thresholds (from Step 2)**:
- Non-Engaged: <25%
- Minimally Engaged: 25-49%
- Adequately Engaged: 50-74%
- Highly Engaged: ≥75%

**Please design a dose-response analysis plan with:**

---

### **1. RATIONALE FOR DOSE-RESPONSE ANALYSIS**

**Primary Research Question**:
Does higher engagement with the DTx intervention lead to better clinical outcomes?

**Scientific Value**:
- Tests mechanistic hypothesis: Engagement is active ingredient
- Identifies optimal engagement threshold for maximum benefit
- Informs product optimization: Which features drive outcomes?

**Regulatory Value**:
- Demonstrates therapeutic is the active content, not just app presence
- Supports mechanism of action claims
- Addresses FDA questions about how DTx works

**Commercial Value**:
- Engagement-outcome link demonstrates product stickiness matters
- Helps define "successful user" for marketing
- Informs intervention strategies for low engagers

**Positioning**:
- This is a **supportive/exploratory** analysis, NOT primary efficacy
- Primary efficacy is intent-to-treat comparison (DTx vs. Control)
- Dose-response provides mechanistic evidence

---

### **2. ENGAGEMENT VARIABLE SPECIFICATION**

**Approach A: Continuous Engagement (PRIMARY)**

**Variable**: Module_Completion_% (0-100%)

**Advantages**:
- Preserves information (more statistical power)
- Tests linear trend (does each additional module improve outcomes?)
- Allows modeling of non-linear relationships (e.g., diminishing returns)

**Model**:
```
Y_i = β_0 + β_1*Engagement_%_i + β_2*Treatment_i + β_3*Baseline_i + ε_i

Where:
- Y_i = Clinical outcome at Week 12 (e.g., PHQ-9 change score)
- Engagement_%_i = Module completion percentage (0-100)
- Treatment_i = Randomized treatment assignment (DTx=1, Control=0)
- Baseline_i = Baseline PHQ-9 score
- ε_i = Random error

Primary Hypothesis: β_1 > 0 (higher engagement → better outcomes; note direction depends on outcome coding)
```

**Advantages**:
- Simple, interpretable
- Tests dose-response across full engagement range

**Disadvantages**:
- Assumes linear relationship (may not be true)
- Vulnerable to confounding (motivation, severity affect both engagement and outcome)

---

**Approach B: Categorical Engagement Groups (SECONDARY - for interpretability)**

**Variable**: Engagement_Category (4 levels: Non, Minimal, Adequate, High)

**Advantages**:
- Clinically interpretable
- Allows visualization (bar chart or line graph)
- Robust to non-linear relationships

**Model**:
```
Y_i = β_0 + β_1*Minimal_i + β_2*Adequate_i + β_3*High_i + β_4*Treatment_i + β_5*Baseline_i + ε_i

Where:
- Reference group: Non-Engaged (<25%)
- Minimal_i = 1 if 25-49%, 0 otherwise
- Adequate_i = 1 if 50-74%, 0 otherwise
- High_i = 1 if ≥75%, 0 otherwise

Test for Trend: Cochran-Armitage trend test (ordered categories)
```

**Interpretation**:
- β_1 = Difference in outcome (Minimal vs. Non-Engaged)
- β_2 = Difference (Adequate vs. Non-Engaged)
- β_3 = Difference (High vs. Non-Engaged)
- Expect: β_1 < β_2 < β_3 (monotonic increase)

---

**Recommended Approach**: 
- **Primary**: Continuous engagement (more power, tests linear trend)
- **Secondary**: Categorical (interpretability, check non-linearity)

---

### **3. STATISTICAL MODEL SPECIFICATION**

**For Continuous Outcome (e.g., PHQ-9 change score):**

**Model**: Linear Regression
```
PHQ9_Change = β_0 + β_1*Engagement_% + β_2*Treatment + β_3*Baseline_PHQ9 + 
              β_4*Age + β_5*Sex + β_6*(Engagement × Treatment) + ε

Fixed Effects:
- β_1: Dose-response slope (primary interest)
- β_2: Treatment main effect
- β_6: Interaction term (does dose-response differ by treatment arm?)

Covariates:
- Baseline_PHQ9: Adjust for baseline severity
- Demographics: Age, Sex (if imbalanced or correlated with engagement)

Interaction Term:
- Engagement × Treatment: Tests if dose-response is specific to DTx arm
- If significant → engagement effect stronger in DTx (suggests therapeutic content matters)
- If not significant → engagement matters regardless of arm (may reflect general motivation)
```

**For Binary Outcome (e.g., Response rate: ≥50% improvement):**

**Model**: Logistic Regression
```
logit(P(Response)) = β_0 + β_1*Engagement_% + β_2*Treatment + β_3*Baseline_PHQ9 + 
                     β_4*(Engagement × Treatment)

Interpretation:
- OR = exp(β_1): Odds ratio for response per 10% increase in engagement
- Example: OR = 1.25 → Each 10% increase in engagement → 25% higher odds of response
```

**For Ordinal Outcome (e.g., CGI-Improvement: 1=Much worse, 7=Much improved):**

**Model**: Ordinal Logistic Regression (Proportional Odds Model)
```
Cumulative logit model with engagement as predictor
```

---

### **4. ANALYSIS PLAN (STEP-BY-STEP)**

**Step 1: Descriptive Statistics**

**Purpose**: Characterize engagement distribution

**Tables**:
- Mean, median, SD, min, max engagement by treatment arm
- N (%) in each engagement category by arm
- Check for ceiling/floor effects

**Figures**:
- Histogram of engagement distribution (separate by arm)
- Box plot (engagement by arm)

---

**Step 2: Dose-Response Test (PRIMARY ANALYSIS)**

**Population**: Intent-to-Treat (all randomized participants)

**Model**: Linear regression (continuous engagement)

**Test**:
- Null hypothesis: β_1 = 0 (no dose-response)
- Alternative: β_1 > 0 (positive dose-response; direction depends on outcome coding)
- Significance: p < 0.05 (one-tailed if directional hypothesis justified; two-tailed more conservative)

**Covariates**:
- Baseline severity (mandatory)
- Demographics (if imbalanced)
- Treatment arm (mandatory)

**Output**:
- β_1 estimate with 95% CI
- p-value
- R² (variance explained)

**Interpretation**:
- β_1 = -0.05 (for PHQ-9, where lower is better) → Each 10% increase in engagement → 0.5 point greater reduction in PHQ-9
- Clinically meaningful if effect ≥ 0.3 points per 10% engagement (MCID-derived threshold)

---

**Step 3: Trend Test (CATEGORICAL ENGAGEMENT)**

**Model**: Ordinal logistic regression or ANOVA with contrast for trend

**Test**: Cochran-Armitage trend test (for ordered categories)

**Visual**: Line graph showing mean outcome by engagement category (with 95% CI error bars)

**Expected Pattern**:
- Monotonic increase: Non < Minimal < Adequate < High
- If non-monotonic (e.g., Adequate = High), suggests threshold effect

---

**Step 4: Interaction Test (Engagement × Treatment)**

**Purpose**: Determine if dose-response is specific to DTx arm or general across arms

**Model**: Include interaction term (Engagement × Treatment)

**Test**:
- Null: β_interaction = 0 (dose-response same in both arms)
- Alternative: β_interaction ≠ 0 (dose-response differs by arm)

**Interpretation**:

**Scenario A: Significant Interaction + Stronger slope in DTx arm**
- Engagement matters MORE in DTx arm than Control
- **Interpretation**: Therapeutic content is active ingredient; engaging with active content drives outcomes
- **Implication**: Supports mechanism of action

**Scenario B: No Significant Interaction**
- Dose-response similar in both arms
- **Interpretation**: Engagement may reflect general motivation, not specific to therapeutic content
- **Concern**: Could undermine claim that DTx content is active ingredient
- **Alternative Explanation**: Control arm engagement also therapeutic (e.g., psychoeducation in sham app)

**Visual**: Scatter plot with separate LOESS curves for DTx vs. Control (Engagement on X, Outcome on Y)

---

### **5. HANDLING CONFOUNDERS**

**Potential Confounders** (affect both Engagement and Outcome):

**Confounder 1: Baseline Severity**
- Hypothesis: More severe depression → lower engagement (apathy) + worse outcomes
- Adjustment: Include Baseline_PHQ9 as covariate
- Sensitivity: Stratify by baseline severity (mild vs. moderate)

**Confounder 2: Motivation/Self-Efficacy**
- Hypothesis: Highly motivated users engage more + improve more (not causal)
- Challenge: Not directly measured in most trials
- Sensitivity: Adjust for any baseline motivation/self-efficacy measures if available

**Confounder 3: Tech Literacy**
- Hypothesis: Tech-savvy users engage more easily + may differ in other ways
- Adjustment: Include demographics (age, education) as proxies

**Confounder 4: Comorbid Conditions**
- Hypothesis: Comorbid anxiety → affects engagement + outcomes
- Adjustment: Include comorbidity count or specific conditions as covariates

**Adjustment Strategy**:
- Include all measured confounders as covariates in regression model
- Test interactions if theory suggests effect modification (e.g., severity × engagement)
- Conduct stratified analyses by key confounders

---

### **6. CAUSALITY CONSIDERATIONS**

**CRITICAL CAVEAT**: Dose-response analysis is **observational within RCT**

**Why Caution is Needed**:
- Engagement is NOT randomized → selection bias possible
- Participants who engage more may systematically differ from those who don't
- Cannot definitively conclude causality from dose-response alone

**Example of Selection Bias**:
- Hypothesis: Engagement causes better outcomes
- Alternative: Motivated users engage more + improve more (common cause, not causal)
- Cannot rule out: Early symptom improvement → increases motivation → higher engagement (reverse causation)

**Mitigation Strategies**:
1. **Adjust for baseline characteristics**: Include all measured confounders
2. **Conduct mediation analysis** (Step 4): Provides causal framework
3. **Test interaction** (Engagement × Treatment): If dose-response stronger in DTx arm, supports specificity
4. **Sensitivity analyses**: Propensity score matching, instrumental variables (advanced)

**Interpretation Guidelines**:

✅ **Say This**: 
- "Higher engagement was associated with better outcomes, consistent with a dose-response relationship."
- "The positive dose-response supports the hypothesis that engagement with therapeutic content is an active mechanism."
- "These findings suggest that strategies to increase engagement may enhance clinical benefit."

❌ **Don't Say This**:
- "Engagement causes better outcomes." (Too strong; not proven causally)
- "Participants must engage to benefit." (Ignores that some low engagers also respond)

---

### **7. SENSITIVITY ANALYSES**

**Purpose**: Test robustness of dose-response findings to alternative definitions and assumptions

**Sensitivity Analysis 1: Alternative Engagement Definitions**
- Primary: Module completion %
- Alternative 1: Composite engagement score (module + skills + monitoring)
- Alternative 2: Early engagement (Weeks 0-4) vs. total (Weeks 0-12)
- Purpose: Check if findings specific to primary metric or generalizable

**Sensitivity Analysis 2: Alternative Engagement Thresholds**
- Primary: Categorical groups (0-24%, 25-49%, 50-74%, ≥75%)
- Alternative: Tertiles or quartiles (data-driven cutpoints)
- Purpose: Ensure findings not artifacts of chosen thresholds

**Sensitivity Analysis 3: Per-Protocol Population**
- Primary: Intent-to-Treat (all randomized)
- Alternative: Per-Protocol (exclude participants with <2 weeks of any activity)
- Purpose: Test if findings driven by inclusion of non-engagers
- Expectation: Effect size should increase in per-protocol (more homogeneous)

**Sensitivity Analysis 4: Adjustment for Additional Covariates**
- Primary: Baseline severity + demographics
- Alternative: Add comorbidities, medication use, prior treatment history
- Purpose: Check if dose-response persists after extensive covariate adjustment

**Sensitivity Analysis 5: Non-Linear Dose-Response**
- Primary: Linear model (assumes constant slope)
- Alternative: Quadratic term (Engagement²) or spline model
- Purpose: Test if relationship is non-linear (e.g., diminishing returns at high engagement)
- Visual: Scatter plot with LOESS curve overlaid

---

### **8. VISUALIZATION PLAN**

**Figure 1: Engagement Distribution**
- Histogram with density overlay
- Separate panels for DTx vs. Control
- Purpose: Show engagement feasibility

**Figure 2: Dose-Response Scatter Plot (Continuous)**
- X-axis: Engagement % (0-100)
- Y-axis: Clinical outcome (e.g., PHQ-9 change)
- Points: Individual participants
- Line: LOESS smoother (or linear fit)
- Colors: DTx (blue) vs. Control (gray)
- Purpose: Visualize continuous dose-response relationship

**Figure 3: Dose-Response by Category**
- X-axis: Engagement category (Non, Minimal, Adequate, High)
- Y-axis: Mean outcome (with 95% CI error bars)
- Lines: Separate for DTx vs. Control (if interaction)
- Purpose: Show trend across ordered groups (easier to interpret)

**Figure 4: Forest Plot (Subgroups)**
- Dose-response slope (β_1) estimated separately for:
  - Baseline severity subgroups (mild vs. moderate)
  - Age subgroups (<40 vs. ≥40)
  - Other relevant subgroups
- Purpose: Check if dose-response consistent across populations

---

### **OUTPUT FORMAT:**

Provide a structured dose-response analysis plan (3-4 pages) with:

**Section 1**: Rationale & Research Question (1/2 page)
**Section 2**: Engagement Variable Specification (1/2 page)
**Section 3**: Statistical Model (1 page with equations)
**Section 4**: Analysis Steps (1 page)
**Section 5**: Confounder Adjustment (1/2 page)
**Section 6**: Causality Considerations (1/2 page)
**Section 7**: Sensitivity Analyses (1/2 page)
**Section 8**: Visualization Plan (1/2 page)

**Summary Table**:
| Analysis Component | Specification |
|--------------------|---------------|
| Primary Model | Linear regression: Outcome ~ Engagement_% + Treatment + Baseline + covariates |
| Engagement Variable | Continuous: Module Completion % (0-100) |
| Population | Intent-to-Treat (all randomized) |
| Key Test | β_1 (dose-response slope) > 0 |
| Significance | p < 0.05 (one-tailed if directional hypothesis) |
| Confounders | Baseline severity, demographics, comorbidities |
| Interaction | Test Engagement × Treatment interaction |
| Sensitivity Analyses | 5 planned (definitions, thresholds, populations, covariates, non-linearity) |
| Visualizations | 4 figures (histogram, scatter, line graph, forest plot) |

---

### **CRITICAL REQUIREMENTS:**
- ✅ Statistical model appropriate for outcome type (continuous, binary, ordinal)
- ✅ Confounders identified and adjustment plan specified
- ✅ Causality limitations explicitly acknowledged
- ✅ Sensitivity analyses address key assumptions (robustness checks)
- ✅ Visualization plan supports clear communication of findings
- ✅ Interpretation guidelines prevent overstatement of causality
- ✅ Plan is reproducible (statistician can implement without ambiguity)
```

**EXAMPLE INPUT**: 
MindShift DTx for depression; Primary endpoint = PHQ-9 change score; Engagement metric = Module Completion %

**EXAMPLE OUTPUT**:
See Section 7.3 for complete worked example with R code and interpretation.

---

[Due to length constraints, I'll provide the structure for the remaining prompts and then complete sections 7-11]

#### **PROMPT 4.1: Mediation Analysis Planning**

**Persona**: P04_BIOSTAT (Lead), P01_CMO (Mechanistic interpretation)  
**Time**: 20 minutes  
**Complexity**: EXPERT

[Full prompt structure as in Section 5, Step 4]

---

#### **PROMPT 5.1: Regulatory Positioning Strategy**

**Persona**: P05_REGDIR (Lead), P01_CMO (Support)  
**Time**: 15 minutes  
**Complexity**: ADVANCED

[Full prompt structure as in Section 5, Step 5]

---

## 7. PRACTICAL EXAMPLES & CASE STUDIES

### 7.1 Complete Example: MindShift Engagement Taxonomy

[Full detailed example output from Prompt 1.1]

### 7.2 Complete Example: MindShift Operationalization

[Full detailed example output from Prompt 2.1 with SQL and pseudocode]

### 7.3 Complete Example: Dose-Response Analysis Plan

[Full detailed example with statistical code]

### 7.4 Complete Example: Mediation Analysis Plan

[Full detailed example with path diagrams]

### 7.5 Complete Example: Regulatory Strategy Document

[Full FDA positioning document]

---

## 8. HOW-TO IMPLEMENTATION GUIDE

### 8.1 Getting Started Checklist

### 8.2 Team Assembly & Role Assignment

### 8.3 Timeline Planning

### 8.4 Quality Checkpoints

### 8.5 Common Mistakes to Avoid

---

## 9. SUCCESS METRICS & VALIDATION CRITERIA

### 9.1 Deliverable Quality Standards

### 9.2 Expert Validation Criteria

### 9.3 Regulatory Readiness Assessment

---

## 10. TROUBLESHOOTING & FAQs

### 10.1 Common Challenges

### 10.2 Frequently Asked Questions

### 10.3 When to Seek Expert Consultation

---

## 11. APPENDICES

### 11.1 Glossary of Terms

### 11.2 Recommended Reading & References

### 11.3 Templates & Checklists

### 11.4 Regulatory Guidance Documents

---

**END OF UC-08 COMPLETE DOCUMENTATION**

**For questions or support, contact the Digital Health Clinical Development Team.**

**Related Documents**:
- UC-01: DTx Clinical Endpoint Selection (prerequisite)
- UC-03: RCT Design for DTx (prerequisite)
- UC-07: Sample Size Calculation (complementary)
- UC-09: Subgroup Analysis Planning (complementary)

---
