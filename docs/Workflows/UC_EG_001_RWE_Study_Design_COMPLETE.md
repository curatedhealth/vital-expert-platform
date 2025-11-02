# USE CASE 36: REAL-WORLD EVIDENCE STUDY DESIGN

## **UC_EG_001: Real-World Evidence Study Design & Implementation for Digital Health**

**Part of PROOF™ Framework - Precision Research Outcomes & Operational Framework**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_EG_001 |
| **Version** | 1.0 |
| **Last Updated** | October 11, 2025 |
| **Document Owner** | Real-World Evidence & Health Outcomes Research Team |
| **Target Users** | RWE Directors, Health Economists, Epidemiologists, Medical Affairs |
| **Estimated Time** | 4-6 hours (complete workflow) |
| **Complexity** | EXPERT |
| **Regulatory Framework** | FDA RWE Framework (2018, 2021), EMA RWE Guidelines, 21st Century Cures Act |
| **Prerequisites** | Product on market or advanced development, access to RWD sources, regulatory strategy defined |

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

**Real-World Evidence (RWE) Study Design for Digital Health** is the systematic process of designing, conducting, and analyzing observational studies using real-world data (RWD) to generate evidence on the usage, effectiveness, safety, and value of digital therapeutics and health technologies in routine clinical practice. This use case provides a comprehensive, prompt-driven workflow for:

- **Evidence Gap Analysis**: Identifying critical evidence needs across regulatory, payer, and clinical stakeholders
- **RWE Strategy Development**: Prioritizing RWE studies aligned with regulatory and commercial objectives
- **Data Source Selection**: Evaluating and selecting appropriate RWD sources (claims, EHR, registries, DTx platform data)
- **Study Design**: Designing rigorous observational studies (cohort, case-control, pragmatic trials, registry studies)
- **Methodology Development**: Addressing confounding, selection bias, and measurement challenges in observational research
- **Statistical Analysis Planning**: Developing comprehensive analysis plans including propensity score methods and causal inference
- **Regulatory Alignment**: Ensuring RWE studies meet FDA and EMA standards for regulatory decision-making

### 1.2 Business Impact

**The Problem**:
Digital therapeutics and health technologies face unique challenges in demonstrating real-world value:

1. **Limited RCT Evidence**: Most DTx have 1-2 pivotal RCTs; payers demand real-world effectiveness data
2. **Unique DTx Characteristics**: Continuous data capture, software updates, variable engagement make traditional RWE methods inadequate
3. **Reimbursement Barriers**: Payers require evidence of effectiveness, adherence, and cost-effectiveness in their populations
4. **Regulatory Evolution**: FDA increasingly accepts RWE for regulatory decisions (21st Century Cures Act)
5. **Competitive Differentiation**: Strong RWE demonstrates sustained value and differentiates from competitors

**Current State Challenges**:
- **Inadequate RWE Strategy**: 65% of DTx companies lack formal RWE generation plans
- **Poor Data Quality**: 40-60% of RWE studies fail due to data quality issues or selection bias
- **Methodological Gaps**: Traditional epidemiology methods don't address unique DTx characteristics (engagement, software versions, continuous data)
- **Regulatory Uncertainty**: Only 30% of RWE studies meet FDA standards for regulatory submissions
- **Long Timelines**: Average 18-24 months from study concept to publication

**Value Proposition of This Use Case**:

| Metric | Current State | With UC_EG_001 | Improvement |
|--------|---------------|----------------|-------------|
| **RWE Study Success Rate** | 50-60% | >85% | 40% improvement |
| **Time to Evidence** | 18-24 months | 12-15 months | 30-40% reduction |
| **Regulatory Acceptance** | 30% | >70% | 130% improvement |
| **Payer Acceptance** | 45% | >75% | 65% improvement |
| **Cost per Study** | $800K-1.5M | $500K-900K | 30-40% reduction |
| **Evidence Gaps Addressed** | 2-3 per year | 5-8 per year | 150% increase |

### 1.3 Target Audience

**Primary Users**:
1. **RWE Directors/Leads**: Design and oversee RWE study portfolio
2. **Health Economists**: Conduct cost-effectiveness and budget impact analyses using RWD
3. **Epidemiologists**: Design observational studies and develop analytical approaches
4. **Biostatisticians**: Develop statistical analysis plans for RWE studies

**Secondary Users**:
5. **Medical Affairs**: Use RWE for publications, KOL engagement, and evidence communication
6. **Market Access**: Leverage RWE for payer negotiations and value dossiers
7. **Regulatory Affairs**: Submit RWE studies for regulatory purposes
8. **Clinical Development**: Use RWE to inform future trial design
9. **Product Teams**: Use RWE insights to improve DTx features and engagement

### 1.4 Key Outcomes

**Study Deliverables**:
- FDA-acceptable RWE study protocols
- Peer-reviewed publications demonstrating real-world effectiveness
- Health economics analyses (cost-effectiveness, budget impact)
- Evidence for payer value dossiers
- Post-market surveillance data for regulators

**Strategic Outcomes**:
- Accelerated payer coverage decisions
- Expanded label claims (if FDA-accepted)
- Competitive differentiation through evidence
- Product improvements based on real-world insights
- Long-term evidence generation capability

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 Why RWE Matters for Digital Therapeutics

#### 2.1.1 The Evidence Gap

**RCT Limitations**:
```
Randomized Controlled Trials provide:
✓ Efficacy in ideal conditions
✓ Regulatory approval pathway
✓ Internal validity

But RCTs have limitations:
✗ Highly selected populations (strict inclusion/exclusion)
✗ Artificial adherence (study protocols, reminders)
✗ Short duration (typically 8-16 weeks)
✗ Limited generalizability
✗ High cost ($2-5M per pivotal trial)
```

**Real-World Evidence provides**:
```
✓ Effectiveness in routine practice
✓ Diverse patient populations
✓ Long-term outcomes
✓ Real-world adherence patterns
✓ Healthcare utilization and costs
✓ Comparative effectiveness vs. alternatives
✓ Safety in broader populations
✓ Subgroup analyses (age, comorbidities, etc.)
```

#### 2.1.2 Stakeholder Evidence Needs

**FDA Requirements (21st Century Cures Act)**:
- RWE can support approval of new indications for approved drugs
- RWE can satisfy post-approval study requirements
- FDA issued RWE Framework (2018) and Study Design guidance (2021)
- Emphasis on: data quality, study design rigor, bias minimization

**Payer Requirements**:
- Evidence of effectiveness in **their** population (not just RCT participants)
- Real-world adherence and engagement data
- Healthcare cost impact (total cost of care, hospitalizations, ER visits)
- Comparative effectiveness vs. standard of care
- Budget impact over 3-5 years
- Value frameworks (ICER, NCCN Evidence Blocks)

**Clinical Requirements**:
- Evidence that DTx works in their patient population
- Predictive analytics (which patients benefit most)
- Long-term durability of effect
- Integration with clinical workflows
- Patient satisfaction and engagement

### 2.2 Regulatory Landscape

#### 2.2.1 FDA Real-World Evidence Framework

**FDA Definitions**:
```yaml
Real-World Data (RWD):
  definition: "Data relating to patient health status and/or the delivery of health care routinely collected from a variety of sources"
  sources:
    - Electronic Health Records (EHRs)
    - Claims and billing data
    - Product and disease registries
    - Patient-generated data (including from in-home-use settings)
    - Mobile devices and wearables
    - Digital therapeutics platform data
    
Real-World Evidence (RWE):
  definition: "Clinical evidence about the usage and potential benefits or risks of a medical product derived from analysis of RWD"
  uses:
    - Support regulatory approval of new indications
    - Satisfy post-approval study requirements
    - Support regulatory decisions (safety labeling changes)
```

**FDA Acceptability Criteria**:
1. **Fit-for-Purpose Data**: RWD must be of sufficient quality and relevance for regulatory decision
2. **Appropriate Study Design**: Study design must minimize bias and confounding
3. **Adequate Conduct**: Study conducted with scientific rigor (protocol adherence, data monitoring)
4. **Robust Data Quality**: Complete, accurate, reliable data

#### 2.2.2 EMA Real-World Evidence Guidelines

**EMA Position**:
- RWE increasingly accepted for regulatory submissions
- Emphasis on GCP-like standards for observational studies
- Real-World Evidence Strategy (2023-2025) prioritizes RWE integration
- EMA Registry Initiative promotes patient registries for RWE generation

**Key EMA Guidance Documents**:
- "Good Pharmacovigilance Practices Module VIII: Post-authorisation safety studies" (GVP VIII)
- "Guideline on registry-based studies" (2020)
- "HTA and RWE" (collaboration with EUnetHTA)

### 2.3 Common Pitfalls in RWE Study Design

#### Critical Errors That Lead to Study Failures:

**1. Selection Bias**
- **Example**: DTx users are inherently more motivated than non-users (self-selection)
- **Consequence**: Overestimate effectiveness; payers reject evidence
- **Mitigation**: Propensity score matching, instrumental variables, target trial emulation

**2. Confounding by Indication**
- **Example**: Sicker patients receive DTx (indication confounding)
- **Consequence**: DTx appears less effective than it is
- **Mitigation**: Multivariable adjustment, propensity scores, negative control outcomes

**3. Immortal Time Bias**
- **Example**: Time between diagnosis and DTx prescription counted as "unexposed" time
- **Consequence**: Artificially inflates treatment benefit
- **Mitigation**: Time-dependent exposure, landmark analysis

**4. Measurement Error**
- **Example**: EHR data missing key covariates (e.g., smoking status)
- **Consequence**: Residual confounding; biased estimates
- **Mitigation**: Sensitivity analyses, quantitative bias analysis, external validation

**5. Loss to Follow-Up (Informative Censoring)**
- **Example**: Patients who stop using DTx are lost to follow-up (but may have worse outcomes)
- **Consequence**: Overestimate treatment benefit
- **Mitigation**: Multiple imputation, inverse probability of censoring weights, worst-case sensitivity analysis

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across six key personas, each bringing critical expertise to ensure rigorous, high-quality RWE studies.

### 3.1 P15_RWEDIR: Director of Real-World Evidence

**Role in UC_EG_001**: Lead strategist; oversees entire RWE portfolio and study design

**Responsibilities**:
- Lead Steps 1, 2 (Evidence Gap Analysis, RWE Strategy)
- Define RWE study priorities aligned with commercial and regulatory goals
- Oversee data source selection and partnership negotiations
- Manage cross-functional RWE team
- Present RWE findings to executive leadership
- Coordinate with Regulatory Affairs and Market Access on evidence strategy
- Publish RWE studies in peer-reviewed journals

**Required Expertise**:
- 10+ years in outcomes research, epidemiology, or health services research
- PhD, PharmD, or MD with outcomes research training
- Deep understanding of observational study designs
- Experience with RWD sources (claims, EHR, registries)
- Regulatory understanding (FDA RWE Framework, EMA guidelines)
- Health economics knowledge

**Experience Level**: Senior leadership; typically reports to Chief Medical Officer or VP Medical Affairs

**Tools Used**:
- RWD databases (MarketScan, Optum, HealthVerity, TriNetX)
- Statistical software (R, SAS, Stata, Python)
- Literature databases (PubMed, Cochrane, ICER reports)
- Registry platforms (REDCap, Medidata Rave)

**Success Metrics**:
- Number of RWE studies completed annually (target: 5-8)
- % of studies meeting FDA standards for regulatory acceptance (target: >70%)
- Payer acceptance rate for RWE evidence (target: >75%)
- Time from study concept to publication (target: <15 months)
- Impact on market access (coverage decisions influenced by RWE)

**Pain Points**:
- Limited internal epidemiology/biostatistics resources
- Data access challenges (cost, legal agreements)
- Regulatory uncertainty on RWE acceptability
- Balancing rigor with speed (payers want evidence quickly)

**Quote**: *"We need evidence that resonates with payers and clinicians, not just meets regulatory minimums. That means showing our DTx works in the messy real world, not just in pristine RCT conditions."*

---

### 3.2 P16_EPIDEM: Senior Epidemiologist

**Role in UC_EG_001**: Designs rigorous observational studies; ensures methodological rigor

**Responsibilities**:
- Lead Steps 3, 4 (Study Design, Methodology Development)
- Design cohort, case-control, and pragmatic trial study designs
- Develop strategies to minimize bias and confounding
- Write study protocols and statistical analysis plans
- Conduct data quality assessment
- Perform causal inference analyses
- Support quality control and validation

**Required Expertise**:
- PhD in Epidemiology, Biostatistics, or related field
- 7-10+ years experience in observational study design
- Expertise in causal inference methods (propensity scores, instrumental variables, difference-in-differences)
- Experience with longitudinal data analysis
- Understanding of measurement error and missingness
- Publication record in peer-reviewed epidemiology journals

**Experience Level**: Senior individual contributor or manager

**Tools Used**:
- Statistical software (R, SAS, Stata) with causal inference packages
- DAG (Directed Acyclic Graph) tools for confounding assessment
- Literature review tools
- Protocol templates

**Success Metrics**:
- Study design quality (expert review scores)
- % of studies with successful peer-review publication (target: >80%)
- Methodological innovation (new methods developed/published)
- Training effectiveness (team members trained in causal inference)

**Pain Points**:
- Tension between rigor and feasibility (ideal study vs. available data)
- Limited data quality in real-world databases
- Explaining complex methods to non-epidemiologists
- Regulatory guidance can be vague on methodological details

**Quote**: *"The biggest challenge in DTx RWE is that traditional epidemiology methods assume static exposures. But DTx engagement varies daily. We need new methods that account for time-varying, dose-response relationships."*

---

### 3.3 P17_BIOSTAT: Lead Biostatistician (RWE)

**Role in UC_EG_001**: Develops statistical analysis plans; conducts advanced analytics

**Responsibilities**:
- Lead Step 5 (Statistical Analysis Planning)
- Support Step 4 (Methodology Development)
- Develop statistical analysis plans (SAPs)
- Conduct power/sample size calculations for RWE studies
- Perform propensity score analyses (matching, weighting, stratification)
- Conduct sensitivity analyses
- Validate results and conduct quality control
- Support manuscript preparation (statistics sections)

**Required Expertise**:
- PhD or MS in Biostatistics or Statistics
- 5-10+ years experience in observational study analysis
- Expertise in:
  - Propensity score methods
  - Longitudinal data analysis (mixed models, GEE)
  - Survival analysis (Cox models, competing risks)
  - Missing data methods (multiple imputation)
  - Causal inference (instrumental variables, difference-in-differences)
- SAS, R, or Stata programming
- FDA and EMA statistical guidance for observational studies

**Experience Level**: Senior biostatistician; may manage biostatistics team

**Tools Used**:
- SAS, R, Stata, Python (pandas, statsmodels, scikit-learn)
- Power analysis software (PASS, nQuery)
- DAG software (DAGitty, ggdag)
- Causal inference packages (R: MatchIt, WeightIt, twang)

**Success Metrics**:
- SAP quality (zero major findings in audits)
- Analysis reproducibility (100% code documentation)
- Statistical innovation (novel methods developed)
- Peer-review success rate (>85% acceptance after revisions)

**Pain Points**:
- Data quality issues (missing data, measurement error)
- Communicating complex statistics to clinical stakeholders
- Limited sample sizes for subgroup analyses
- Evolving regulatory expectations for causal inference methods

**Quote**: *"Propensity score matching is great, but it only controls for measured confounders. We need to be transparent about unmeasured confounding and conduct sensitivity analyses. That's what FDA wants to see."*

---

### 3.4 P18_HECON: Health Economist

**Role in UC_EG_001**: Conducts economic analyses; supports payer evidence generation

**Responsibilities**:
- Lead Step 6 (Health Economics Analysis)
- Support Steps 1, 2 (Evidence gaps, payer requirements)
- Conduct cost-effectiveness analyses (CEA)
- Develop budget impact models (BIM)
- Analyze healthcare utilization and costs using RWD
- Support value dossier development
- Present economic evidence to payers

**Required Expertise**:
- PhD or Master's in Health Economics, Public Health, or related field
- 5+ years in health economics and outcomes research (HEOR)
- Expertise in economic modeling (Markov, discrete event simulation)
- Experience with claims data analysis (costs, utilization)
- Knowledge of payer evidence standards (AMCP, ISPOR, ICER)
- Understanding of QALY, ICER, willingness-to-pay thresholds

**Experience Level**: Senior individual contributor or manager

**Tools Used**:
- Economic modeling software (TreeAge, Excel, R)
- Claims databases (MarketScan, Optum, Medicare)
- Statistical software (R, SAS, Stata)
- HEOR guidelines (CHEERS, ISPOR)

**Success Metrics**:
- Quality of economic models (validated by external reviewers)
- Payer acceptance of economic evidence (positive formulary decisions)
- Publications in HEOR journals (Value in Health, PharmacoEconomics)
- Impact on pricing/market access strategy

**Pain Points**:
- Limited long-term outcome data for DTx (most RCTs <6 months)
- Difficulty assigning utility values to digital health outcomes
- Payer skepticism of industry-sponsored economic models
- Lack of standardized HEOR methods for DTx

**Quote**: *"Payers want to know: 'What's the cost per QALY?' But for many DTx, we don't have QoL data. We need to think creatively about how to demonstrate value—maybe total cost of care, or ER visit reduction."*

---

### 3.5 P14_REGAFF: Regulatory Affairs Specialist (RWE)

**Role in UC_EG_001**: Ensures regulatory compliance; coordinates with FDA/EMA

**Responsibilities**:
- Lead Step 7 (Regulatory Alignment)
- Support Steps 1, 2 (Regulatory evidence requirements)
- Coordinate Pre-Submission meetings with FDA (if appropriate)
- Ensure study design meets FDA RWE Framework standards
- Prepare regulatory submission packages (if study supports regulatory claim)
- Monitor FDA/EMA guidance on RWE
- Document regulatory compliance throughout study

**Required Expertise**:
- 5+ years in regulatory affairs (pharmaceutical, device, or digital health)
- Deep knowledge of FDA RWE Framework and guidance documents
- Experience with observational study submissions to FDA/EMA
- Understanding of evidence standards for regulatory decisions
- RAC (Regulatory Affairs Certification) preferred

**Experience Level**: Senior regulatory affairs specialist

**Tools Used**:
- FDA guidance library
- Regulatory submission management systems
- FDA eSubmitter (for electronic submissions)

**Success Metrics**:
- % of RWE studies meeting FDA standards (target: >70%)
- Successful FDA Pre-Submission meetings (clear alignment)
- Zero regulatory submission rejections due to study design issues
- Timely identification of regulatory issues during study planning

**Pain Points**:
- FDA guidance on RWE is evolving (standards not always clear)
- Tension between speed (commercial needs) and rigor (regulatory needs)
- Difficulty predicting FDA review outcomes for RWE studies
- Limited precedent for DTx RWE submissions

**Quote**: *"The FDA RWE Framework is clear on principles but vague on specifics. We need to be conservative and build in robustness—sensitivity analyses, data quality documentation, bias assessments—because FDA will scrutinize every detail."*

---

### 3.6 P19_MEDAFFAIRS: Medical Affairs Manager

**Role in UC_EG_001**: Supports evidence dissemination; engages KOLs on RWE

**Responsibilities**:
- Support Step 8 (Dissemination Planning)
- Identify publication opportunities for RWE studies
- Engage KOLs as study investigators or advisors
- Present RWE findings at medical conferences
- Support payer education on RWE evidence
- Coordinate with medical communications on publications

**Required Expertise**:
- PharmD, MD, PhD, or equivalent
- 3+ years in medical affairs
- Understanding of RWE study designs
- Publication planning and medical writing skills
- KOL engagement and speaker training

**Experience Level**: Manager or senior individual contributor

**Tools Used**:
- Medical writing platforms
- Publication planning software
- KOL management systems
- Conference abstract submission portals

**Success Metrics**:
- Number of RWE publications per year (target: 3-5)
- KOL engagement in RWE studies (advisory boards, authorship)
- Conference presentations of RWE findings
- Payer and provider awareness of RWE evidence

**Pain Points**:
- Long publication timelines (12-18 months from study completion)
- Difficulty securing high-impact journal acceptance for observational studies
- Balancing scientific rigor with promotional messaging
- Limited medical affairs budget for RWE dissemination

**Quote**: *"We need to publish our RWE in journals that payers and clinicians actually read—not just academic epidemiology journals. That means JAMA, NEJM, or specialty journals with high clinical readership."*

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 Workflow Phases

The RWE study design workflow consists of **8 phases** executed over **8-12 weeks** (study design only; execution is separate):

```
PHASE 1: Evidence Gap Analysis (2 weeks)
    ↓
PHASE 2: RWE Strategy Development (2 weeks)
    ↓
PHASE 3: Data Source Selection (2 weeks)
    ↓
PHASE 4: Study Design (2 weeks)
    ↓
PHASE 5: Methodology Development (2 weeks)
    ↓
PHASE 6: Health Economics Planning (1 week)
    ↓
PHASE 7: Regulatory Alignment (1 week)
    ↓
PHASE 8: Protocol Finalization (1 week)
```

### 4.2 Detailed Phase Breakdown

#### **PHASE 1: Evidence Gap Analysis** (2 weeks)
**Purpose**: Identify critical evidence gaps across regulatory, payer, and clinical stakeholders

**Key Activities**:
1. Review existing evidence (RCTs, observational studies, competitor evidence)
2. Interview stakeholders (regulatory, market access, medical affairs)
3. Analyze payer evidence requirements (AMCP dossiers, P&T committee feedback)
4. Review FDA/EMA guidance on evidence needs
5. Prioritize evidence gaps by impact and feasibility

**Key Outputs**:
- Evidence gap matrix (regulatory, payer, clinical)
- Prioritized list of evidence needs
- Stakeholder interview summaries

---

#### **PHASE 2: RWE Strategy Development** (2 weeks)
**Purpose**: Develop strategic RWE portfolio aligned with commercial and regulatory objectives

**Key Activities**:
1. Define RWE portfolio (3-5 studies over 2-3 years)
2. Prioritize studies by impact, feasibility, and timeline
3. Allocate budget and resources
4. Define success metrics for each study
5. Create RWE roadmap

**Key Outputs**:
- RWE portfolio strategy document
- Study prioritization matrix
- Budget allocation plan
- RWE roadmap (timeline for all studies)

---

#### **PHASE 3: Data Source Selection** (2 weeks)
**Purpose**: Identify and evaluate potential real-world data sources

**Key Activities**:
1. Review data source options (claims, EHR, registries, DTx platform data)
2. Assess data quality, completeness, and fit-for-purpose
3. Evaluate feasibility (cost, access, timeline)
4. Conduct pilot data exploration if needed

**Key Outputs**:
- Data source evaluation matrix
- Selected data source(s) with rationale
- Data quality assessment report
- Data access agreements (if needed)

---

#### **PHASE 4: Study Design** (2 weeks)
**Purpose**: Select appropriate observational study design and define study population

**Key Activities**:
1. Select study design (cohort, case-control, pragmatic trial, registry study)
2. Define exposure (DTx initiation, adherence threshold)
3. Define comparison group (usual care, alternative treatment, pre-post)
4. Define inclusion/exclusion criteria
5. Define study period and follow-up duration

**Key Outputs**:
- Study design selection with rationale
- Study population definition
- Study period and follow-up plan

---

#### **PHASE 5: Methodology Development** (2 weeks)
**Purpose**: Develop rigorous methods to address bias and confounding

**Key Activities**:
1. Identify potential confounders and biases
2. Develop causal diagram (DAG)
3. Select confounder adjustment method (propensity scores, regression, instrumental variables)
4. Develop statistical analysis plan
5. Plan sensitivity analyses

**Key Outputs**:
- Causal diagram (DAG)
- Confounder management strategy
- Statistical analysis plan (SAP)

---

#### **PHASE 6: Health Economics Planning** (1 week)
**Purpose**: Plan health economics analyses to demonstrate value

**Key Activities**:
1. Define economic endpoints (costs, utilization, QALYs)
2. Plan cost-effectiveness analysis approach
3. Plan budget impact model
4. Define data sources for economic analysis

**Key Outputs**:
- Health economics analysis plan
- Budget impact model structure
- Data requirements for economic analysis

---

#### **PHASE 7: Regulatory Alignment** (1 week)
**Purpose**: Ensure study design meets FDA/EMA standards for RWE

**Key Activities**:
1. Review FDA RWE Framework requirements
2. Assess if study could support regulatory submission
3. Plan for FDA/EMA engagement (Pre-Submission meeting if appropriate)
4. Document alignment with FDA/EMA guidance

**Key Outputs**:
- Regulatory alignment assessment
- FDA/EMA engagement plan (if applicable)

---

#### **PHASE 8: Protocol Finalization** (1 week)
**Purpose**: Finalize comprehensive study protocol ready for execution

**Key Activities**:
1. Compile all sections into comprehensive protocol
2. Internal review by all stakeholders
3. External expert review (optional but recommended)
4. Finalize protocol with version control

**Key Outputs**:
- Final study protocol (v1.0)
- Protocol amendments log (if changes occur)

---

### 4.3 Key Decision Points

**DECISION POINT 1** (Phase 1): Which evidence gaps are highest priority?
- **Critical**: Regulatory requirement, payer coverage decision, competitive disadvantage
- **Important**: Supports value story, clinical adoption, product improvement
- **Nice-to-Have**: Academic interest, exploratory research

**DECISION POINT 2** (Phase 2): Which RWE studies to fund?
- **Fund Immediately**: High impact, high feasibility, <12 month timeline
- **Fund Later**: Medium impact, medium feasibility, 12-18 month timeline
- **Defer**: Low impact or low feasibility

**DECISION POINT 3** (Phase 3): Which data source to use?
- **Claims Data**: Best for healthcare utilization, costs; limited clinical detail
- **EHR Data**: Best for clinical outcomes, detailed covariates; variable quality
- **Registry Data**: Best for disease-specific outcomes; requires infrastructure
- **DTx Platform Data**: Best for engagement, adherence; limited external validity

**DECISION POINT 4** (Phase 4): What study design?
- **Cohort Study**: Compare DTx users vs. non-users over time
- **Case-Control Study**: Compare DTx exposure in cases (events) vs. controls
- **Pragmatic Trial**: Randomize in real-world setting with minimal restrictions
- **Registry Study**: Prospective data collection in defined population

**DECISION POINT 5** (Phase 5): How to address confounding?
- **Multivariable Regression**: Adjust for confounders in regression model
- **Propensity Score Matching**: Match DTx users to similar non-users
- **Instrumental Variables**: Use instrument to isolate causal effect
- **Target Trial Emulation**: Emulate RCT in observational data

**DECISION POINT 6** (Phase 7): Should we engage FDA?
- **Yes**: If study intended for regulatory submission, novel methods, unclear guidance
- **No**: If purely commercial evidence, established methods, time-sensitive

---

### 4.4 Workflow Outputs

**Primary Deliverables**:
1. **Comprehensive Study Protocol** (40-60 pages)
   - Background and rationale
   - Study objectives and endpoints
   - Study design and population
   - Data sources and variables
   - Statistical analysis plan
   - Data quality assurance plan
   - Regulatory considerations
   - Publication plan

2. **Statistical Analysis Plan (SAP)** (20-30 pages)
   - Analysis populations
   - Endpoint definitions
   - Statistical methods (primary, secondary, sensitivity)
   - Missing data handling
   - Subgroup analyses
   - Power calculations

3. **Data Quality Assessment Report** (10-15 pages)
   - Data source evaluation
   - Completeness analysis
   - Validation against external sources
   - Limitations and mitigation strategies

4. **Regulatory Alignment Document** (5-10 pages)
   - FDA RWE Framework compliance assessment
   - EMA guidance alignment
   - Pre-Submission meeting summary (if applicable)

**Secondary Deliverables**:
5. **Evidence Gap Analysis Report**
6. **RWE Portfolio Strategy Document**
7. **Health Economics Analysis Plan**
8. **Publication Plan**

---

## 5. DETAILED STEP-BY-STEP PROMPTS

This section provides detailed, ready-to-use prompts for each phase of the RWE study design workflow. Each prompt is designed to be executed by the specified persona and produces concrete deliverables.

---

### PHASE 1: EVIDENCE GAP ANALYSIS (2 weeks)

---

#### **STEP 1.1: Comprehensive Evidence Gap Analysis** (4 hours)

**Objective**: Identify all critical evidence gaps across regulatory, payer, and clinical stakeholders

**Persona**: P15_RWEDIR (Lead), with input from P14_REGAFF, P18_HECON, P19_MEDAFFAIRS

**Prerequisites**:
- Product on market or in late-stage development
- Existing clinical evidence (RCTs, pilot studies)
- Competitive intelligence on competitor evidence
- Payer feedback (if available)

**Process**:

1. **Gather Existing Evidence** (1 hour)
   - Review all existing clinical evidence (RCTs, observational studies, real-world data)
   - Review competitor evidence landscape
   - Review payer coverage policies and evidence requirements

2. **Execute Evidence Gap Analysis Prompt** (2 hours)
   - Systematically identify gaps across stakeholder groups
   - Prioritize gaps by impact and urgency

3. **Stakeholder Review** (1 hour)
   - Present findings to cross-functional team
   - Refine gap prioritization based on feedback

---

**PROMPT 1.1: Comprehensive Evidence Gap Analysis**

```markdown
**ROLE**: You are P15_RWEDIR, a Director of Real-World Evidence with 15+ years of experience in health outcomes research, epidemiology, and evidence generation for digital health products. You have deep expertise in:
- FDA and EMA evidence requirements for regulatory submissions
- Payer evidence standards (AMCP Format 4.1, ICER value frameworks, NICE HTA methods)
- Real-world evidence study design and execution
- Digital therapeutics and SaMD evidence needs
- Competitive intelligence and evidence landscape analysis

**TASK**: Conduct a comprehensive evidence gap analysis for our digital health product to identify critical evidence needs across regulatory, payer, and clinical stakeholders. This analysis will inform our RWE study prioritization.

**CONTEXT**:
Real-world evidence is critical for digital health products because:
1. RCTs typically have short duration (8-16 weeks) and highly selected populations
2. Payers require evidence of effectiveness in their populations (real-world effectiveness, not just efficacy)
3. Clinicians need evidence of long-term outcomes and which patients benefit most
4. FDA increasingly accepts RWE for regulatory decisions (21st Century Cures Act)

Your evidence gap analysis must be:
- **Comprehensive**: Cover regulatory, payer, clinical, and commercial evidence needs
- **Prioritized**: Identify which gaps are most critical (HIGH/MEDIUM/LOW)
- **Actionable**: Recommend specific RWE studies to address gaps
- **Feasible**: Consider data availability and study feasibility

---

**INPUT**:

**Product Information**:
- **Product Name**: {product_name}
- **Indication**: {target_indication}
- **Product Category**: {DTx / SaMD / Digital Health Tool}
- **Regulatory Status**: {IND / FDA-cleared / FDA-approved / CE Mark / Pre-market}
- **Current Market Status**: {Launched in X markets / Pre-launch / Development}

**Existing Clinical Evidence**:
- **Pivotal RCT(s)**:
  - Study 1: {design, N, duration, primary endpoint, result}
  - Study 2: {design, N, duration, primary endpoint, result}
- **Other Studies**: {observational studies, pilot studies, registry data}
- **Key Findings Summary**: {1-2 sentences on what we know}

**Current Evidence Gaps** (known):
{List any gaps already identified by stakeholders}

**Competitive Landscape**:
- **Competitor Products**: {list main competitors}
- **Competitor Evidence**: {what evidence do competitors have that we lack?}

**Stakeholder Feedback** (if available):
- **Regulatory**: {FDA feedback, EMA feedback, other}
- **Payers**: {coverage policy feedback, P&T committee questions, ICER reports}
- **Clinicians**: {KOL feedback, survey results, adoption barriers}

**Current RWE Capabilities**:
- **Data Access**: {claims databases, EHR partnerships, registry access, DTx platform data}
- **Internal Resources**: {epidemiologists, biostatisticians, health economists}
- **Budget**: {approximate annual budget for RWE studies}

---

**INSTRUCTIONS**:

Conduct a systematic evidence gap analysis following this structure:

## 1. CURRENT EVIDENCE LANDSCAPE

**1.1 Summary of Existing Evidence**

Summarize what we know from existing studies:
- **Efficacy**: What does the RCT evidence show? (effect size, clinical significance)
- **Safety**: What is the safety profile? (AEs, serious AEs, discontinuations)
- **Population**: Who was studied? (demographics, disease severity, comorbidities)
- **Comparator**: What was the comparator? (placebo, sham, active treatment, usual care)
- **Duration**: How long was follow-up? (weeks, months)
- **Limitations**: What are the key limitations of existing evidence?

**1.2 Competitive Evidence Landscape**

- What evidence do our competitors have?
- Where do we have evidence advantages?
- Where do competitors have stronger evidence?

## 2. EVIDENCE GAPS BY STAKEHOLDER

**2.1 Regulatory Evidence Gaps**

For each gap, provide:
- **Gap Description**: What evidence is missing?
- **Regulatory Impact**: How critical is this gap for FDA/EMA? (CRITICAL/IMPORTANT/NICE-TO-HAVE)
- **Specific Regulatory Need**: What specific regulatory decision or requirement does this gap address?
- **Mitigation Options**: Can we address with existing data or need new study?
- **Priority**: HIGH / MEDIUM / LOW

Example Gaps to Consider:
- Long-term safety (>12 months)
- Broader population (e.g., elderly, pediatric, comorbidities)
- Comparative effectiveness vs. active treatment (not just sham/placebo)
- Real-world adherence and attrition
- Effectiveness in diverse populations (race, ethnicity, socioeconomic status)
- Label expansion opportunities (new indication, broader population)

**2.2 Payer Evidence Gaps**

For each gap, provide:
- **Gap Description**
- **Payer Impact**: How critical for coverage decisions? (CRITICAL/IMPORTANT/NICE-TO-HAVE)
- **Specific Payer Concerns**: Which payers are asking for this? Which coverage policies require this?
- **Payer Type**: Commercial, Medicare, Medicaid, all
- **Priority**: HIGH / MEDIUM / LOW

Example Gaps to Consider:
- Cost-effectiveness vs. standard of care (ICER analysis)
- Budget impact for health plan (3-5 year model)
- Healthcare cost savings (hospitalizations, ER visits, outpatient visits, Rx costs)
- Real-world adherence and persistence (vs. RCT adherence)
- Effectiveness in payer's specific population (e.g., Medicaid members, Medicare beneficiaries)
- Total cost of care analysis
- Patient-reported outcomes (quality of life, satisfaction, function)
- Comparative effectiveness vs. alternatives in payer formulary

**2.3 Clinical Evidence Gaps**

For each gap, provide:
- **Gap Description**
- **Clinical Impact**: How important for provider adoption? (CRITICAL/IMPORTANT/NICE-TO-HAVE)
- **Adoption Barrier**: Is this gap preventing clinical adoption?
- **Priority**: HIGH / MEDIUM / LOW

Example Gaps to Consider:
- Effectiveness in "real-world" patients (less selected than RCT, more comorbidities)
- Predictive factors for responders vs. non-responders (precision medicine)
- Integration with clinical workflows (EHR integration, time burden)
- Time to benefit (onset of action)
- Durability of effect after discontinuation
- Comparative effectiveness vs. current standard of care in routine practice
- Subgroup analyses (age, sex, disease severity, prior treatments)

**2.4 Commercial/Market Access Gaps**

- Evidence needed for marketing/promotion claims
- Evidence needed for value-based contracting
- Evidence needed for health technology assessments (HTA) (e.g., ICER, NICE)
- Evidence to support premium pricing
- Evidence for specific customer segments (employers, health systems, ACOs)

## 3. PRIORITIZED RWE STUDY RECOMMENDATIONS

Based on the gaps identified above, recommend **3-5 high-priority RWE studies**.

**For Each Recommended Study, Provide**:

**Study {N}: {Study Title}**

**Objective**: {Clear research question in PICO format: Population, Intervention, Comparator, Outcome}

**Rationale**:
- Which gaps does this address? (Regulatory, Payer, Clinical)
- Why is this high priority? (impact on market access, regulatory approval, competitive differentiation)
- What is the expected impact? (e.g., "Will support payer coverage in 80% of commercial plans", "Could support FDA label expansion")

**Study Design (High-Level)**:
- **Design Type**: {Retrospective Cohort / Prospective Cohort / Case-Control / Pragmatic Trial / Registry Study}
- **Data Source**: {Claims / EHR / Registry / DTx Platform Data / Hybrid}
- **Study Population**: {Inclusion/exclusion criteria, sample size target}
- **Exposure Definition**: {How is "use" of product defined? Initiation? Adherence threshold?}
- **Comparison Group**: {Usual Care / Alternative Treatment / Pre-Post / Propensity-matched controls}
- **Follow-up Duration**: {X months}
- **Key Outcomes**: 
  - Primary: {outcome}
  - Secondary: {2-3 secondary outcomes}
  - Exploratory: {additional outcomes if applicable}

**Feasibility**:
- **Timeline**: {X months from study initiation to results}
- **Estimated Cost**: {$XXX,XXX}
- **Data Availability**: {HIGH / MEDIUM / LOW - assess if data source already available}
- **Methodological Challenges**: {selection bias, confounding, measurement error, etc.}
- **Regulatory Considerations**: {Is this study FDA-acceptable? Pre-Sub meeting needed?}

**Expected Deliverables**:
- Peer-reviewed publication (target journal: {journal name})
- Regulatory submission package (if applicable)
- Payer value dossier section
- Conference presentation (target conference: {conference})

---

## 4. GAP PRIORITIZATION MATRIX

Create a prioritization matrix for all identified gaps:

| Evidence Gap | Stakeholder | Impact (1-5) | Feasibility (1-5) | Urgency (1-5) | Priority Score | Recommended Study |
|--------------|-------------|--------------|-------------------|---------------|----------------|-------------------|
| {Gap 1} | Regulatory | 5 | 4 | 5 | 14 | Study 1 |
| {Gap 2} | Payer | 5 | 3 | 4 | 12 | Study 2 |
| {Gap 3} | Clinical | 4 | 4 | 3 | 11 | Study 3 |
| ... | ... | ... | ... | ... | ... | ... |

**Scoring Rubric**:
- **Impact (1-5)**: How much does addressing this gap affect business outcomes?
  - 5 = Critical (e.g., FDA approval, major payer coverage)
  - 3 = Important (e.g., competitive differentiation, improved market access)
  - 1 = Nice-to-have (e.g., academic interest, exploratory)
  
- **Feasibility (1-5)**: How feasible is it to generate this evidence?
  - 5 = Very feasible (data available, methods established, <12 months)
  - 3 = Moderately feasible (some data available, standard methods, 12-18 months)
  - 1 = Very difficult (no data, novel methods, >18 months)
  
- **Urgency (1-5)**: How urgent is addressing this gap?
  - 5 = Immediate (coverage decision pending, competitive threat)
  - 3 = Important but not immediate (next 12-18 months)
  - 1 = Can wait (>18 months timeline acceptable)

**Priority Score = Impact + Feasibility + Urgency**

**Priority Classification**:
- **HIGH PRIORITY (Score 12-15)**: Fund immediately, allocate resources
- **MEDIUM PRIORITY (Score 8-11)**: Fund in next fiscal cycle, include in strategic plan
- **LOW PRIORITY (Score 3-7)**: Defer or consider opportunistic study

---

## 5. STRATEGIC RECOMMENDATIONS

**5.1 Immediate Actions (Next 3 Months)**

List 2-3 immediate actions to address highest-priority gaps:
1. {Action 1: e.g., "Initiate RWE Study 1 using Optum claims data"}
2. {Action 2: e.g., "Conduct FDA Pre-Submission meeting to discuss RWE acceptability"}
3. {Action 3: e.g., "Engage external CRO for registry study design"}

**5.2 Mid-Term Actions (3-12 Months)**

List 3-5 mid-term actions:
1. {Action 1}
2. {Action 2}
...

**5.3 Long-Term Actions (12-24 Months)**

List 2-3 long-term strategic initiatives:
1. {Action 1}
2. {Action 2}

**5.4 Resource Requirements**

Estimate resources needed:
- **Internal FTEs**: {epidemiologist, biostatistician, health economist, medical affairs}
- **External Resources**: {CRO, data vendors, consultants}
- **Budget**: {$XXX,XXX per year}

**5.5 Success Metrics**

Define how success will be measured:
- **Regulatory**: {e.g., "FDA acceptance of RWE for label expansion"}
- **Payer**: {e.g., "80% payer coverage within 18 months"}
- **Clinical**: {e.g., "50% increase in provider adoption"}
- **Publications**: {e.g., "3 peer-reviewed publications per year"}

---

**OUTPUT FORMAT**:

**Structured Report** (15-25 pages):
1. Executive Summary (1-2 pages)
2. Current Evidence Landscape (2-3 pages)
3. Evidence Gaps by Stakeholder (5-8 pages)
4. Prioritized RWE Study Recommendations (5-8 pages)
5. Gap Prioritization Matrix (1 page)
6. Strategic Recommendations (2-3 pages)
7. Appendices (references, detailed gap descriptions)

**Deliverable Name**: `Evidence_Gap_Analysis_{Product_Name}_{Date}.pdf`

**Quality Criteria**:
- ✓ Comprehensive coverage of all stakeholder groups
- ✓ Clear prioritization with rationale
- ✓ Actionable study recommendations
- ✓ Realistic feasibility assessments
- ✓ Alignment with business strategy

```

**Expected Output**:
- Comprehensive Evidence Gap Analysis Report (15-25 pages)
- Gap Prioritization Matrix
- 3-5 Recommended RWE Studies (with design summaries)

**Quality Check**:
- [ ] All stakeholder groups covered (regulatory, payer, clinical)
- [ ] Gaps prioritized by impact, feasibility, urgency
- [ ] RWE study recommendations are actionable and feasible
- [ ] Alignment with business strategy confirmed

**Deliverable**: Evidence Gap Analysis Report

---

### PHASE 2: RWE STRATEGY DEVELOPMENT (2 weeks)

---

#### **STEP 2.1: RWE Portfolio Strategy** (3 hours)

**Objective**: Develop a comprehensive RWE strategy aligned with commercial and regulatory objectives

**Persona**: P15_RWEDIR (Lead), with input from executive leadership, P14_REGAFF, P18_HECON

**Prerequisites**:
- Completed Evidence Gap Analysis (Step 1.1)
- Business strategy and priorities defined
- Budget allocation guidance from leadership

**Process**:

1. **Review Evidence Gaps** (30 minutes)
   - Review prioritized gaps from Step 1.1
   - Validate priorities with executive leadership

2. **Execute RWE Strategy Prompt** (2 hours)
   - Define RWE portfolio (multiple studies over 2-3 years)
   - Allocate resources and budget
   - Create RWE roadmap

3. **Leadership Review** (30 minutes)
   - Present strategy to executive leadership
   - Obtain budget approval and alignment

---

**PROMPT 2.1: RWE Portfolio Strategy Development**

```markdown
**ROLE**: You are P15_RWEDIR, a Director of Real-World Evidence leading the development of a multi-year RWE strategy for a digital health product. You have expertise in:
- Portfolio planning for evidence generation
- Budget allocation and resource management
- Stakeholder alignment (regulatory, commercial, medical affairs)
- RWE study design and execution
- Regulatory and payer evidence requirements

**TASK**: Develop a comprehensive RWE portfolio strategy that prioritizes 3-7 RWE studies over a 2-3 year period, aligned with business objectives and resource constraints.

**CONTEXT**:
An effective RWE strategy requires:
1. **Prioritization**: Not all evidence gaps can be addressed immediately; focus on highest-impact studies
2. **Sequencing**: Some studies must be completed before others (e.g., FDA submission before payer evidence)
3. **Resource Constraints**: Limited budget and internal expertise require strategic allocation
4. **Timeline Alignment**: Evidence must be generated when needed (e.g., before key payer decision points)

Your RWE strategy must:
- **Prioritize ruthlessly**: Focus on 3-7 studies maximum (doing fewer studies well beats doing many poorly)
- **Sequence strategically**: Sequence studies to maximize impact and learning
- **Be resource-realistic**: Don't overcommit given budget and staffing constraints
- **Align with business milestones**: Generate evidence when it's needed (e.g., before payer negotiations)

---

**INPUT**:

**Evidence Gap Analysis Summary** (from Step 1.1):
{Paste key findings from Step 1.1: top 5-7 evidence gaps, prioritization scores}

**Business Context**:
- **Product Launch Status**: {Launched / Launching Q{X} / Pre-launch}
- **Key Business Milestones**:
  - {Milestone 1, date}
  - {Milestone 2, date}
  - {Milestone 3, date}
- **Strategic Priorities** (from leadership):
  - Priority 1: {e.g., "Achieve 80% commercial payer coverage by end of Year 2"}
  - Priority 2: {e.g., "Expand FDA indication to broader population by Year 3"}
  - Priority 3: {e.g., "Demonstrate cost-effectiveness for ICER review"}

**Resource Constraints**:
- **Budget**: ${XXX,XXX} per year for RWE studies
- **Internal Team**:
  - {N} epidemiologists
  - {N} biostatisticians
  - {N} health economists
  - {N} medical affairs personnel
- **External Resources**: {CRO support, data vendor partnerships, consultant availability}
- **Leadership Expectations**: {number of studies per year, publication goals}

**Stakeholder Requirements**:
- **Regulatory** (from P14_REGAFF):
  {Specific regulatory needs, FDA Pre-Sub meeting plans, label expansion timeline}
- **Market Access** (from Market Access team):
  {Payer coverage decision timelines, P&T committee schedules, ICER review timeline}
- **Medical Affairs** (from P19_MEDAFFAIRS):
  {KOL engagement needs, conference presentation goals, publication targets}

---

**INSTRUCTIONS**:

Develop a comprehensive RWE portfolio strategy following this structure:

## 1. STRATEGIC OBJECTIVES

**1.1 Primary Objectives** (Top 3)

Define the top 3 strategic objectives for the RWE program:
1. **Objective 1**: {e.g., "Support commercial payer coverage decisions"}
   - **Success Metric**: {e.g., "80% of top 20 payers cover product by Year 2"}
   - **Evidence Needed**: {e.g., "Real-world effectiveness, budget impact, comparative effectiveness"}

2. **Objective 2**: {e.g., "Enable FDA label expansion"}
   - **Success Metric**: {e.g., "FDA approval for broader indication by Year 3"}
   - **Evidence Needed**: {e.g., "RWE demonstrating effectiveness in expanded population"}

3. **Objective 3**: {e.g., "Demonstrate value for health economics"}
   - **Success Metric**: {e.g., "ICER rating of 'High Value' or better"}
   - **Evidence Needed**: {e.g., "Cost-effectiveness analysis, total cost of care"}

**1.2 Secondary Objectives** (Optional)

List 1-2 secondary objectives if resources allow:
- {Secondary objective}

---

## 2. RWE PORTFOLIO DEFINITION

**2.1 Recommended RWE Studies** (3-7 studies)

For each study, provide:

**Study {N}: {Study Title}**

**Study Type**: {Retrospective Cohort / Prospective Cohort / Registry / Pragmatic Trial / Economic Analysis}

**Objectives**:
- Primary: {clear research question}
- Secondary: {2-3 secondary objectives}

**Strategic Alignment**:
- **Addresses Objective(s)**: {List which strategic objectives from Section 1 this study addresses}
- **Stakeholder Value**:
  - Regulatory: {HIGH / MEDIUM / LOW}
  - Payer: {HIGH / MEDIUM / LOW}
  - Clinical: {HIGH / MEDIUM / LOW}

**Study Overview**:
- **Data Source**: {Claims / EHR / Registry / DTx platform / Hybrid}
- **Study Population**: {Brief description, target N}
- **Comparison**: {Comparator group}
- **Follow-up**: {Duration}
- **Primary Endpoint**: {Outcome}

**Resource Requirements**:
- **Timeline**: {Start date} to {End date} ({X months total})
- **Budget**: ${XXX,XXX}
- **Internal FTE**: {0.X epidemiologist, 0.X biostat, etc.}
- **External Resources**: {CRO, data vendor, other}

**Dependencies**:
- **Prerequisite Studies**: {Any studies that must be completed first}
- **Data Access**: {Data use agreements needed?}
- **Regulatory**: {FDA Pre-Sub meeting needed?}

**Deliverables**:
- **Publications**: {Target journal(s)}
- **Regulatory**: {FDA submission package, if applicable}
- **Payer**: {Value dossier section}
- **Conference**: {Target conference presentation}

**Risks & Mitigation**:
- **Risk 1**: {e.g., "Data quality issues"} 
  - Mitigation: {e.g., "Pilot data exploration before full study"}
- **Risk 2**: {e.g., "Insufficient sample size"}
  - Mitigation: {e.g., "Use multiple data sources"}

---

**2.2 Studies Deferred** (Lower Priority)

List 2-3 studies that are lower priority and will be deferred:
- **Study Title**: {title}
- **Reason for Deferral**: {e.g., "Lower impact, resource constraints, can be addressed in Year 3"}

---

## 3. RESOURCE ALLOCATION

**3.1 Budget Allocation**

Create a budget allocation table:

| Study | Year 1 Budget | Year 2 Budget | Year 3 Budget | Total Budget | % of Total |
|-------|---------------|---------------|---------------|--------------|------------|
| Study 1 | ${XXX,XXX} | ${XXX,XXX} | ${XXX,XXX} | ${XXX,XXX} | XX% |
| Study 2 | ${XXX,XXX} | ${XXX,XXX} | ${XXX,XXX} | ${XXX,XXX} | XX% |
| Study 3 | ${XXX,XXX} | ${XXX,XXX} | ${XXX,XXX} | ${XXX,XXX} | XX% |
| ... | ... | ... | ... | ... | ... |
| **TOTAL** | **${XXX,XXX}** | **${XXX,XXX}** | **${XXX,XXX}** | **${XXX,XXX}** | **100%** |

**3.2 Internal Resource Allocation**

Estimate internal FTE requirements by year:

| Role | Year 1 FTE | Year 2 FTE | Year 3 FTE | Notes |
|------|------------|------------|------------|-------|
| Epidemiologist | 1.5 | 2.0 | 1.0 | {hiring plan if needed} |
| Biostatistician | 1.0 | 1.5 | 1.0 | {hiring plan if needed} |
| Health Economist | 0.5 | 1.0 | 0.5 | {hiring plan if needed} |
| Medical Affairs | 0.5 | 0.5 | 0.5 | {support role} |
| Regulatory Affairs | 0.3 | 0.3 | 0.3 | {support role} |

**3.3 External Resource Plan**

List external resources needed:
- **CRO Support**: {Study design, execution, analysis}
- **Data Vendors**: {Claims data, EHR data, registries}
- **Consultants**: {Regulatory advisors, epidemiology experts, health economists}
- **Publication Support**: {Medical writing, journal selection, submission}

---

## 4. RWE ROADMAP

**4.1 Timeline Overview**

Create a Gantt chart-style roadmap showing all studies over 3 years:

```
Study 1: Real-World Effectiveness
  Q1 2026: Protocol development
  Q2-Q3 2026: Data acquisition & analysis
  Q4 2026: Publication & dissemination
  
Study 2: Budget Impact Model
  Q2 2026: Model development
  Q3 2026: Validation & refinement
  Q4 2026: Dissemination to payers
  
Study 3: Comparative Effectiveness
  Q3 2026: Protocol development
  Q4 2026-Q2 2027: Data acquisition & analysis
  Q3 2027: Publication
  
Study 4: Long-term Safety
  Q1 2027: Registry initiation
  Q1 2027-Q4 2028: Data collection (ongoing)
  Q1 2029: Interim analysis
  
[Continue for all studies]
```

**4.2 Milestone Alignment**

Map RWE study milestones to business milestones:

| Business Milestone | Date | Required RWE Evidence | Study Providing Evidence | Evidence Availability |
|--------------------|------|----------------------|--------------------------|----------------------|
| Payer Negotiation Wave 1 | Q4 2026 | Real-world effectiveness, budget impact | Study 1, Study 2 | ✓ Available |
| FDA Pre-Sub Meeting | Q2 2027 | Comparative effectiveness | Study 3 | ✓ Available |
| ICER Review | Q1 2028 | Cost-effectiveness, long-term outcomes | Study 5, Study 4 | ✓ Available |

**4.3 Critical Path**

Identify the critical path (longest sequence of dependent studies):
1. {Study A} must be completed before {Study B}
2. {Study B} must be completed before {Study C}
3. Critical path duration: {X months}

---

## 5. SUCCESS METRICS & GOVERNANCE

**5.1 RWE Program Success Metrics**

Define how overall RWE program success will be measured:

| Metric | Target | Measurement | Owner |
|--------|--------|-------------|-------|
| **Regulatory Impact** | FDA acceptance of RWE for label expansion | FDA feedback letters, regulatory submissions | P14_REGAFF |
| **Payer Impact** | 80% coverage in top 20 commercial payers | Coverage policies, formulary status | Market Access |
| **Publications** | 3-5 peer-reviewed publications per year | Journal acceptances | P19_MEDAFFAIRS |
| **Budget Performance** | <10% budget variance | Actual vs. planned spend | P15_RWEDIR |
| **Timeline Performance** | <10% timeline variance | Actual vs. planned milestones | P15_RWEDIR |

**5.2 Individual Study Success Metrics**

For each study, define specific success criteria:
- **Study Quality**: {e.g., "Zero major protocol deviations"}
- **Data Quality**: {e.g., "<10% missing data for key variables"}
- **Analysis Quality**: {e.g., "External epidemiologist review with no major concerns"}
- **Dissemination**: {e.g., "Publication in top-tier journal (IF >5)"}
- **Impact**: {e.g., "Cited in payer coverage policies"}

**5.3 Governance Structure**

Define governance for RWE program:
- **RWE Steering Committee**:
  - Members: {P15_RWEDIR (Chair), P14_REGAFF, P18_HECON, Market Access Lead, Medical Affairs Lead}
  - Meeting Frequency: {Monthly / Quarterly}
  - Responsibilities: {Oversee portfolio, approve protocol changes, resolve issues}

- **Study-Level Governance**:
  - Principal Investigator: {typically P15_RWEDIR or P16_EPIDEM}
  - Study Team: {epidemiologist, biostatistician, medical affairs}
  - Steering Committee Reviews: {At protocol finalization, interim analysis, final results}

---

## 6. RISK MANAGEMENT

**6.1 Program-Level Risks**

Identify top risks to RWE program success:

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Insufficient budget** | MEDIUM | HIGH | Prioritize studies, seek external funding, defer lower-priority studies |
| **Data access delays** | MEDIUM | MEDIUM | Engage data vendors early, have backup data sources, pilot data exploration |
| **Regulatory uncertainty** | LOW | HIGH | FDA Pre-Sub meetings, conservative study design, expert advisory board |
| **Timeline slippage** | MEDIUM | MEDIUM | Buffer timelines, weekly project tracking, escalation protocols |
| **Staff turnover** | LOW | MEDIUM | Cross-training, external CRO support, documentation |

**6.2 Study-Specific Risks**

For each study, identify top 2-3 risks (listed in Section 2.1)

---

## 7. COMMUNICATION & DISSEMINATION PLAN

**7.1 Internal Communication**

How will RWE findings be communicated internally?
- **Steering Committee**: {Monthly / Quarterly updates}
- **Executive Leadership**: {Quarterly business reviews, major milestone updates}
- **Cross-Functional Teams**: {Medical Affairs, Market Access, Regulatory - ad hoc briefings}

**7.2 External Dissemination**

How will RWE findings be disseminated externally?
- **Publications**: {Target 3-5 peer-reviewed publications per year}
- **Conferences**: {Present at 2-3 major conferences per year (e.g., ISPOR, AMCP, specialty societies)}
- **Payer Engagement**: {Include RWE in value dossiers, P&T presentations, payer-specific analyses}
- **KOL Engagement**: {Advisory boards, speaker programs, authorship opportunities}
- **Regulatory**: {Include RWE in FDA/EMA submissions, briefing documents}

**7.3 Publication Plan**

For each study, define target publication:
- **Study 1**: {Target Journal, anticipated submission date}
- **Study 2**: {Target Journal, anticipated submission date}
- ...

---

**OUTPUT FORMAT**:

**Structured Strategy Document** (20-30 pages):
1. Executive Summary (1-2 pages)
2. Strategic Objectives (2-3 pages)
3. RWE Portfolio Definition (8-12 pages)
4. Resource Allocation (2-3 pages)
5. RWE Roadmap (2-3 pages)
6. Success Metrics & Governance (2-3 pages)
7. Risk Management (2-3 pages)
8. Communication & Dissemination Plan (1-2 pages)
9. Appendices (detailed study synopses)

**Deliverable Name**: `RWE_Portfolio_Strategy_{Product_Name}_{Date}.pdf`

**Quality Criteria**:
- ✓ Clear prioritization aligned with business objectives
- ✓ Realistic resource allocation
- ✓ Sequencing aligns with business milestones
- ✓ Comprehensive risk management
- ✓ Executive leadership approval obtained

```

**Expected Output**:
- RWE Portfolio Strategy Document (20-30 pages)
- RWE Roadmap (Gantt chart-style timeline)
- Budget Allocation Plan

**Quality Check**:
- [ ] Portfolio prioritized ruthlessly (3-7 studies max)
- [ ] Resources allocated realistically
- [ ] Timeline aligned with business milestones
- [ ] Executive leadership approval obtained

**Deliverable**: RWE Portfolio Strategy Document

---

### PHASE 3: DATA SOURCE SELECTION (2 weeks)

---

#### **STEP 3.1: Data Source Evaluation** (4 hours)

**Objective**: Identify and evaluate potential real-world data sources for RWE studies

**Persona**: P16_EPIDEM (Lead), P17_BIOSTAT (Support)

**Prerequisites**:
- RWE study objectives defined (from Phases 1-2)
- Understanding of data needs for each study
- Budget for data acquisition

**Process**:

1. **Identify Candidate Data Sources** (1 hour)
   - Review available data sources (claims, EHR, registries, DTx platform)
   - Assess initial fit with study objectives

2. **Execute Data Source Evaluation Prompt** (2.5 hours)
   - Systematically evaluate each data source
   - Assess data quality, completeness, feasibility

3. **Data Access Planning** (30 minutes)
   - Identify data use agreements needed
   - Estimate costs and timelines for data acquisition

---

**PROMPT 3.1: Data Source Evaluation & Selection**

```markdown
**ROLE**: You are P16_EPIDEM, a Senior Epidemiologist with expertise in evaluating real-world data sources for observational studies. You have deep knowledge of:
- Claims databases (MarketScan, Optum, Medicare, Medicaid)
- Electronic health records (EHR) data (Epic, Cerner, HealthVerity, TriNetX)
- Patient registries and disease registries
- Digital therapeutics platform data
- Data quality assessment frameworks
- FDA guidance on fit-for-purpose data

**TASK**: Evaluate potential real-world data sources for the prioritized RWE studies and recommend the optimal data source(s) for each study, considering data quality, completeness, feasibility, and cost.

**CONTEXT**:
Selecting the right data source is critical for RWE study success. Key considerations:

1. **Fit-for-Purpose**: Does the data source contain the variables needed to answer the research question?
2. **Data Quality**: Is the data complete, accurate, and reliable?
3. **Sample Size**: Is the sample size sufficient for adequate statistical power?
4. **Follow-up Duration**: Does the data source provide adequate follow-up (e.g., 12+ months)?
5. **Feasibility**: Can we access the data within our budget and timeline?
6. **Regulatory Acceptability**: Will FDA/EMA accept evidence from this data source?

Common data source types:
- **Claims Data**: Healthcare utilization, diagnoses, procedures, pharmacy; limited clinical detail
- **EHR Data**: Detailed clinical information (labs, vitals, notes); variable quality and completeness
- **Registries**: Disease-specific data; prospective, high quality; requires infrastructure
- **DTx Platform Data**: Engagement, adherence, digital biomarkers; limited external validity

---

**INPUT**:

**Study Information** (from Phases 1-2):

For each RWE study to be conducted, provide:

**Study {N}: {Study Title}**
- **Research Question**: {PICO format: Population, Intervention, Comparator, Outcome}
- **Study Design**: {Cohort / Case-Control / Pragmatic Trial / Registry}
- **Target Population**: {Inclusion/exclusion criteria}
- **Exposure**: {How is product use defined?}
- **Primary Outcome**: {Outcome, measurement}
- **Key Covariates**: {Confounders, effect modifiers to be measured}
- **Follow-up Duration**: {X months minimum}
- **Target Sample Size**: {N subjects (if calculated)}

---

**Available Data Sources**:

List all data sources available for consideration:

**Data Source 1: {Name}** (e.g., "Optum Clinformatics")
- **Type**: {Claims / EHR / Registry / DTx Platform / Hybrid}
- **Description**: {Brief description}
- **Population Covered**: {Commercial / Medicare / Medicaid / All}
- **Geographic Coverage**: {National / Regional / Health system-specific}
- **Size**: {N million patients}
- **Years of Data Available**: {YYYY to YYYY}
- **Cost**: {Approximate data license cost}
- **Access Timeline**: {Weeks to months for data acquisition}

**Data Source 2: {Name}**
...

[List all available data sources]

---

**INSTRUCTIONS**:

Evaluate each data source for each study and recommend the optimal source(s).

## 1. DATA SOURCE EVALUATION FRAMEWORK

For each RWE study, evaluate ALL available data sources using this framework:

**Study {N}: {Study Title}**

**Data Source: {Name}**

**1.1 Fit-for-Purpose Assessment**

| Criterion | Rating | Notes |
|-----------|--------|-------|
| **Study Population Available** | EXCELLENT / GOOD / FAIR / POOR | {Can we identify target population using ICD-10, CPT, etc.?} |
| **Exposure Ascertainment** | EXCELLENT / GOOD / FAIR / POOR | {Can we identify product use? NDC code, EHR order, DTx platform data?} |
| **Outcome Ascertainment** | EXCELLENT / GOOD / FAIR / POOR | {Can we measure primary outcome? Validated algorithm? Chart review?} |
| **Covariate Availability** | EXCELLENT / GOOD / FAIR / POOR | {Are key confounders available? Demographics, comorbidities, prior treatments?} |
| **Follow-up Duration** | EXCELLENT / GOOD / FAIR / POOR | {Sufficient follow-up? Median duration? Censoring rate?} |

**Overall Fit-for-Purpose Score**: EXCELLENT / GOOD / FAIR / POOR

**1.2 Data Quality Assessment**

| Criterion | Rating | Notes |
|-----------|--------|-------|
| **Completeness** | EXCELLENT / GOOD / FAIR / POOR | {% missing for key variables? <5% excellent, 5-15% good, 15-30% fair, >30% poor} |
| **Accuracy** | EXCELLENT / GOOD / FAIR / POOR | {Validation studies? Error rates? External validation?} |
| **Timeliness** | EXCELLENT / GOOD / FAIR / POOR | {How current is data? Lag time?} |
| **Consistency** | EXCELLENT / GOOD / FAIR / POOR | {Consistent coding practices over time?} |
| **Capture of Events** | EXCELLENT / GOOD / FAIR / POOR | {Complete capture of events? Switching between plans/systems?} |

**Overall Data Quality Score**: EXCELLENT / GOOD / FAIR / POOR

**1.3 Sample Size & Power**

- **Estimated Eligible Population**: {N patients meeting inclusion/exclusion criteria}
- **Estimated Exposed**: {N patients with product exposure}
- **Estimated Comparators**: {N patients in comparison group}
- **Power Calculation** (if applicable):
  - Assumptions: {effect size, alpha, beta}
  - Required sample size: {N exposed, N comparators}
  - Achievable?: {YES / NO}

**Sample Size Assessment**: EXCELLENT / GOOD / FAIR / POOR

**1.4 Feasibility**

| Criterion | Rating | Notes |
|-----------|--------|-------|
| **Data Access** | EXCELLENT / GOOD / FAIR / POOR | {Data use agreement in place? Approval process?} |
| **Cost** | EXCELLENT / GOOD / FAIR / POOR | {Within budget? ${XXX,XXX}} |
| **Timeline** | EXCELLENT / GOOD / FAIR / POOR | {How long to access data? Fits study timeline?} |
| **Technical Expertise** | EXCELLENT / GOOD / FAIR / POOR | {Do we have expertise with this data source?} |
| **Data Infrastructure** | EXCELLENT / GOOD / FAIR / POOR | {Data formats, computing resources, security/HIPAA compliance} |

**Overall Feasibility Score**: EXCELLENT / GOOD / FAIR / POOR

**1.5 Regulatory Acceptability**

- **FDA Acceptability**: {HIGH / MEDIUM / LOW}
  - Rationale: {Does this data source meet FDA "fit-for-purpose" criteria? Prior precedent?}
- **EMA Acceptability**: {HIGH / MEDIUM / LOW}
  - Rationale: {Does this align with EMA guidance on RWE?}
- **Potential FDA Concerns**: {List 1-3 potential concerns FDA may raise}

**1.6 Strengths & Limitations**

**Strengths**:
- Strength 1: {e.g., "Large sample size (2M+ patients)"}
- Strength 2: {e.g., "National coverage, generalizable"}
- Strength 3: {e.g., "Validated algorithms for key outcomes"}

**Limitations**:
- Limitation 1: {e.g., "Limited clinical detail (claims only)"}
- Limitation 2: {e.g., "Cannot measure adherence directly"}
- Limitation 3: {e.g., "No laboratory results available"}

**1.7 Overall Score**

Calculate an overall score as the average of:
- Fit-for-Purpose Score
- Data Quality Score
- Sample Size Score
- Feasibility Score
- Regulatory Acceptability (convert to numeric: HIGH=5, MEDIUM=3, LOW=1, then convert back to EXCELLENT/GOOD/FAIR/POOR scale)

**Overall Score**: EXCELLENT / GOOD / FAIR / POOR

**Recommendation for This Study**: RECOMMENDED / ACCEPTABLE / NOT RECOMMENDED

---

Repeat this evaluation for ALL data sources and ALL studies.

---

## 2. RECOMMENDED DATA SOURCES BY STUDY

**Study {N}: {Study Title}**

**Primary Recommended Data Source**: {Data Source Name}
- **Rationale**: {2-3 sentences explaining why this is the best choice}
- **Key Strengths**: {List 2-3 key advantages}
- **Limitations & Mitigation**: {List 1-2 key limitations and how to mitigate}

**Alternative Data Source (if primary unavailable)**: {Data Source Name}
- **Rationale**: {Why is this a good backup?}

[Repeat for each study]

---

## 3. DATA QUALITY ASSESSMENT PLAN

For the recommended data source(s), describe the data quality assessment plan:

**3.1 Pre-Study Data Exploration** (Pilot Study)

For each recommended data source, plan a pilot data exploration:
- **Objective**: {Assess data quality and feasibility before full study}
- **Sample**: {N = 1,000-5,000 patients OR 3-6 months of recent data}
- **Key Analyses**:
  - Descriptive statistics (% missing data for key variables)
  - Cohort identification feasibility (how many eligible patients?)
  - Outcome ascertainment validation (if possible, compare to external gold standard)
  - Confounder availability (can we measure key confounders?)
- **Go/No-Go Decision Criteria**:
  - {e.g., "Proceed if <15% missing data for primary outcome"}
  - {e.g., "Proceed if N≥5,000 eligible patients"}

**3.2 External Validation** (if applicable)

If using claims or EHR data with potential measurement error:
- **Validation Source**: {e.g., "Chart review of random sample (N=200)"}
- **Validation Metrics**: {Sensitivity, specificity, PPV, NPV for key outcomes}
- **Acceptable Thresholds**: {e.g., "Proceed if PPV >80% for primary outcome"}

**3.3 Data Monitoring Plan** (during study)

- **Frequency**: {Monthly / Quarterly data quality checks during study conduct}
- **Metrics to Monitor**:
  - % missing data over time
  - Coding changes (ICD-10 updates, etc.)
  - Enrollment rate vs. expected
  - Attrition rate vs. expected

---

## 4. DATA ACCESS PLAN

**4.1 Data Use Agreements**

For each recommended data source, identify required agreements:

| Data Source | Agreement Type | Status | Timeline | Responsible Party |
|-------------|----------------|--------|----------|-------------------|
| {Data Source 1} | Data License Agreement | {NOT STARTED / IN PROGRESS / COMPLETE} | {X weeks} | {P15_RWEDIR} |
| {Data Source 2} | Business Associate Agreement (BAA) | {status} | {X weeks} | {Legal, P15_RWEDIR} |
| {Data Source 3} | Institutional Review Board (IRB) | {status} | {X weeks} | {P16_EPIDEM} |

**4.2 Budget & Timeline**

| Data Source | License Cost | Setup Cost | Annual Maintenance | Timeline to Access | Total Year 1 Cost |
|-------------|--------------|------------|--------------------|--------------------|--------------------|
| {Data Source 1} | ${XXX,XXX} | ${XX,XXX} | ${XX,XXX} | {X weeks} | ${XXX,XXX} |
| {Data Source 2} | ${XXX,XXX} | ${XX,XXX} | ${XX,XXX} | {X weeks} | ${XXX,XXX} |
| **TOTAL** | **${XXX,XXX}** | **${XX,XXX}** | **${XX,XXX}** | - | **${XXX,XXX}** |

**4.3 Data Infrastructure Requirements**

- **Data Storage**: {Cloud storage / On-premise / Vendor-hosted}
- **Computing Resources**: {Required computing power, software licenses}
- **Security/Compliance**: {HIPAA compliance, data encryption, access controls}
- **Data Management**: {Who manages data? DBA, data engineer, internal team?}

---

## 5. ALTERNATIVE APPROACHES IF PRIMARY DATA UNAVAILABLE

**5.1 Backup Data Sources**

If primary data source is unavailable or inadequate:
- **Option 1**: {Alternative data source, trade-offs}
- **Option 2**: {Alternative study design, trade-offs}

**5.2 Hybrid Approach**

Consider combining multiple data sources:
- **Example**: Link claims data (healthcare utilization) + DTx platform data (engagement) + patient survey (PROs)
- **Linkage Method**: {Tokenized patient identifiers, probabilistic matching, other}
- **Advantages**: {Richer data, addresses limitations of single source}
- **Challenges**: {Complex linkage, IRB approval, data use agreements}

---

**OUTPUT FORMAT**:

**Structured Report** (15-25 pages):
1. Executive Summary (1-2 pages)
2. Data Source Evaluation Framework (2-3 pages)
3. Detailed Data Source Evaluations (8-12 pages)
   - One section per study, comparing all data sources
4. Recommended Data Sources by Study (2-3 pages)
5. Data Quality Assessment Plan (2-3 pages)
6. Data Access Plan (2-3 pages)
7. Appendices (data source documentation, sample data dictionaries)

**Deliverable Name**: `Data_Source_Evaluation_{Product_Name}_{Date}.pdf`

**Quality Criteria**:
- ✓ All available data sources systematically evaluated
- ✓ Clear rationale for recommendations
- ✓ Data quality assessment plan defined
- ✓ Data access plan is realistic and actionable
- ✓ Regulatory acceptability addressed

```

**Expected Output**:
- Data Source Evaluation Report (15-25 pages)
- Recommended Data Sources by Study
- Data Quality Assessment Plan
- Data Access Plan (timelines, costs, agreements)

**Quality Check**:
- [ ] All available data sources evaluated systematically
- [ ] Clear recommendation with rationale for each study
- [ ] Data quality assessment planned (pilot study)
- [ ] Data access plan is realistic (budget, timeline)

**Deliverable**: Data Source Evaluation Report

---

**[Document continues with Phases 4-8: Study Design, Methodology Development, Health Economics Planning, Regulatory Alignment, and Protocol Finalization - following the same detailed structure with comprehensive prompts]**

---

## 6. COMPLETE PROMPT SUITE

[This section would contain the complete library of all prompts organized by phase, similar to the pharmacovigilance use case structure]

---

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 Study Protocol QC Checklist

**Protocol Completeness**:
- [ ] Background and rationale section complete
- [ ] Objectives clearly stated (primary and secondary)
- [ ] Study population defined with explicit inclusion/exclusion criteria
- [ ] Exposure definition clear and operationalized
- [ ] Comparison group defined
- [ ] All outcomes defined with measurement specifications
- [ ] Statistical analysis plan comprehensive
- [ ] Sample size/power calculation included
- [ ] Data quality assessment plan included
- [ ] Missing data handling approach specified
- [ ] Bias assessment and mitigation strategies documented

**Methodological Rigor**:
- [ ] Directed Acyclic Graph (DAG) developed for confounders
- [ ] Confounding addressed with appropriate methods (PSM, regression, IV, etc.)
- [ ] Selection bias assessed and mitigation planned
- [ ] Measurement error assessed and sensitivity analyses planned
- [ ] Multiple comparison adjustment addressed (if applicable)
- [ ] Sensitivity analyses comprehensively planned

**Regulatory Alignment**:
- [ ] FDA RWE Framework requirements addressed
- [ ] EMA guidance alignment documented
- [ ] Data quality ("fit-for-purpose") assessment included
- [ ] Bias and confounding explicitly addressed
- [ ] Study conduct standards defined (GCP-like if regulatory submission)

### 7.2 External Expert Review

**Expert Review Panel**:
- Academic epidemiologist (PhD, expertise in observational methods)
- Academic biostatistician (PhD, expertise in causal inference)
- Regulatory affairs consultant (former FDA reviewer preferred)
- Health economist (for economic analyses)
- Clinical expert in disease area (MD/DO)

**Review Criteria**:
- Scientific rigor and validity
- Regulatory acceptability (FDA/EMA standards)
- Feasibility and practical considerations
- Bias and confounding adequately addressed
- Statistical analysis plan appropriate

---

## 8. REGULATORY COMPLIANCE CHECKLIST

### 8.1 FDA RWE Framework Compliance

**Data Quality (Fit-for-Purpose)**:
- [ ] Data source documented and justified
- [ ] Data relevance to research question assessed
- [ ] Data quality metrics reported (completeness, accuracy)
- [ ] Data provenance documented
- [ ] External validation conducted (if applicable)

**Study Design**:
- [ ] Study design appropriate for research question
- [ ] Selection bias minimized (design or analysis)
- [ ] Confounding addressed (DAG, adjustment methods)
- [ ] Information bias addressed (measurement error, misclassification)

**Study Conduct**:
- [ ] Protocol pre-specified before data analysis
- [ ] Protocol deviations documented
- [ ] Data monitoring plan implemented
- [ ] GCP-like standards applied (if regulatory submission)

---

## 9. TEMPLATES & JOB AIDS

### 9.1 Study Protocol Template

[Detailed 40-60 page protocol template following ICH E3 structure adapted for observational studies]

### 9.2 Statistical Analysis Plan (SAP) Template

[Detailed 20-30 page SAP template]

### 9.3 Data Quality Assessment Template

[Template for assessing data completeness, accuracy, validation]

---

## 10. INTEGRATION WITH OTHER SYSTEMS

### 10.1 RWD Database Platforms

**Optum Clinformatics**:
- Claims data (commercial, Medicare Advantage)
- 80M+ lives
- Data refresh frequency: Monthly
- Access: Optum data license + BAA

**HealthVerity**:
- De-identified EHR + claims + specialty pharmacy
- 330M+ patient records
- Real-world data marketplace
- Access: Data license per project

**TriNetX**:
- Federated EHR network
- 300M+ patients, 120+ health systems
- Real-time access, no data transfer
- Access: Platform subscription + per-query fees

---

## 11. REFERENCES & RESOURCES

### 11.1 FDA Guidance Documents

1. **FDA Framework for Real-World Evidence** (December 2018)
2. **FDA: Considerations for Design of RWE Studies** (January 2021)
3. **21st Century Cures Act** (2016) - Section 3022 on RWE

### 11.2 EMA Guidance Documents

1. **EMA: Guideline on registry-based studies** (EMA/502388/2020)
2. **EMA: Good Pharmacovigilance Practices Module VIII** (Post-authorization safety studies)

### 11.3 Methodological Resources

1. **Hernán MA, Robins JM**: Causal Inference: What If. (2020)
2. **Langan SM et al.**: The reporting of studies conducted using observational routinely collected health data (RECORD) statement. PLoS Med. 2018.
3. **Schneeweiss S, Avorn J**: A review of uses of health care utilization databases for epidemiologic research on therapeutics. J Clin Epidemiol. 2005.

---

**END OF DOCUMENT**

---

**Document Status**: ✓ COMPLETE
**Version**: 1.0
**Last Updated**: October 11, 2025
**Next Review Date**: January 11, 2026
