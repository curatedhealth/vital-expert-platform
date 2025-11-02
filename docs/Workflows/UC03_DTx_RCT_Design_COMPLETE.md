# UC-03: DTx RCT DESIGN & CLINICAL TRIAL STRATEGY
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

**UC-03: DTx RCT Design** is the critical clinical development activity that transforms your endpoint strategy into a FDA-acceptable, feasible, and scientifically rigorous randomized controlled trial. This decision is pivotal because:

- **Regulatory Impact**: Poor RCT design is the #1 cause of DTx clinical trial failure; incorrect design choices can delay approval by 12-24 months
- **Financial Impact**: Failed RCT design can cost $3-8M in wasted clinical trial expenses
- **Strategic Impact**: Trial design determines not only regulatory success but also the strength of commercial evidence and payer acceptance

### 1.2 Key Deliverables

This use case produces:
1. **Study Design Specification** (superiority/non-inferiority) with regulatory rationale
2. **Comparator & Blinding Strategy** optimized for FDA acceptance
3. **Inclusion/Exclusion Criteria** balancing rigor with recruitment feasibility
4. **Intervention Protocol** specifying DTx dosing, features, and adherence monitoring
5. **Visit Schedule & Assessment Plan** minimizing patient burden
6. **Recruitment & Retention Strategy** with feasibility analysis
7. **Statistical Analysis Plan Overview** aligned with endpoints
8. **Regulatory & Ethical Strategy** including IRB and FDA Pre-Sub planning
9. **Complete RCT Design Document** ready for protocol development

### 1.3 Target Users

| Role | Use Case | Benefit |
|------|----------|---------|
| **Chief Medical Officer** | Lead pivotal trial design | Ensure FDA-acceptable, scientifically rigorous RCT |
| **VP Clinical Development** | Oversee clinical strategy | Balance scientific rigor with feasibility and timeline |
| **Regulatory Affairs Director** | FDA compliance | Design meets regulatory expectations |
| **Biostatistician** | Statistical design | Appropriate design with adequate power |
| **Clinical Operations** | Feasibility & execution | Realistic recruitment, retention, logistics |
| **Product Manager (Digital)** | DTx implementation | Intervention fidelity and engagement |

### 1.4 Success Criteria

A successful RCT design achieves:
- ✅ **FDA Acceptability**: Design aligns with regulatory precedent and guidance
- ✅ **Scientific Rigor**: Controls for bias, confounding, and threats to validity
- ✅ **Feasibility**: Realistic recruitment targets and timeline
- ✅ **Statistical Power**: Adequate sample size to detect meaningful effects
- ✅ **Patient-Centeredness**: Acceptable burden and engagement
- ✅ **Commercial Readiness**: Evidence supports payer value proposition

---

## 2. BUSINESS CONTEXT & VALUE PROPOSITION

### 2.1 Why RCT Design Matters

**The Challenge:**
- 60% of DTx clinical trials fail to meet primary endpoints
- Of these failures, 75% are due to poor trial design (not ineffective intervention)
- Common design flaws:
  - Wrong comparator choice (unblinded waitlist for pivotal trial)
  - Inadequate blinding strategy
  - Overly restrictive inclusion criteria → recruitment failure
  - Intervention protocol not standardized → fidelity issues
  - Assessment burden too high → excessive dropouts
  - Statistical plan doesn't match endpoints

**The Cost of Failure:**
- Failed pivotal trial: $3-8M direct costs
- 12-24 month delay in regulatory submission
- Potential loss of investor confidence and funding
- Competitive advantage lost to faster competitors

**The Value of Getting It Right:**
- First-try success rate with proper design: 80%+
- Faster path to market (18-24 months vs. 36-48 months)
- Stronger evidence package for payers
- Higher likelihood of reimbursement approval
- Commercial differentiation through clinical rigor

### 2.2 Common RCT Design Mistakes in DTx

| Design Flaw | Consequence | Prevention |
|-------------|-------------|------------|
| **Waitlist control in pivotal trial** | FDA questions validity, high expectation bias | Use sham/attention control app |
| **No blinding strategy** | Expectation effects confound results | Design credible sham comparator |
| **Overly restrictive I/E criteria** | Cannot recruit target N | Balance validity with generalizability |
| **Undefined "dose" of intervention** | Variable engagement → inconclusive results | Specify minimum app usage criteria |
| **Excessive assessment burden** | High attrition (>40%) → underpowered | Streamline assessments, use digital capture |
| **No retention strategy** | Dropout rate exceeds assumptions | Intensive participant engagement plan |
| **Statistical plan mismatch** | Primary endpoint doesn't match analysis | Align endpoints, design, and analysis early |

### 2.3 ROI of This Use Case

**Investment:**
- 4-6 hours of senior team time
- Potential external consultation ($15-30K)
- Total investment: ~$50-80K

**Return:**
- Avoid failed trial: Save $3-8M
- Reduce timeline by 12-18 months: Value $5-15M (faster revenue)
- Increase success probability: 40% → 80% = $3-5M expected value
- **Total ROI: 50-100X**

---

## 3. PERSONA DEFINITIONS

### Primary Personas (Leads)

**P01_CMO - Chief Medical Officer**
- **Role**: Overall clinical strategy and trial design leadership
- **Expertise**: Clinical development, FDA submissions, DTx landscape
- **Responsibilities**: 
  - Lead study design decisions
  - Interface with FDA
  - Final approval of RCT design
- **Time Investment**: 2-3 hours across all steps

**P02_VPCLIN - VP Clinical Development**
- **Role**: Operational clinical development and protocol execution
- **Expertise**: Clinical operations, multi-site trials, CRO management
- **Responsibilities**:
  - Translate design into executable protocol
  - Assess feasibility
  - Oversee clinical operations planning
- **Time Investment**: 2-2.5 hours across steps

**P04_BIOSTAT - Lead Biostatistician**
- **Role**: Statistical design and analysis planning
- **Expertise**: Clinical trial statistics, sample size, analysis methods
- **Responsibilities**:
  - Determine appropriate statistical design
  - Calculate sample size
  - Develop statistical analysis plan
- **Time Investment**: 1.5-2 hours focused on statistical steps

### Supporting Personas

**P03_CLTM - Clinical Trial Manager**
- **Role**: Day-to-day trial execution
- **Expertise**: Site management, patient recruitment, data collection
- **Responsibilities**:
  - Develop visit schedules
  - Create retention strategy
  - Assess site feasibility
- **Time Investment**: 1-1.5 hours

**P05_REGDIR - Regulatory Affairs Director**
- **Role**: Regulatory compliance and FDA strategy
- **Expertise**: FDA device regulations, 510(k)/De Novo pathways
- **Responsibilities**:
  - Ensure design meets FDA expectations
  - Plan regulatory interactions
  - Review for compliance
- **Time Investment**: 1-1.5 hours

**P06_PMDIG - Product Manager (Digital)**
- **Role**: DTx product and user experience
- **Expertise**: Digital health products, engagement, UX
- **Responsibilities**:
  - Define intervention protocol
  - Specify engagement metrics
  - Design sham app (if needed)
- **Time Investment**: 1 hour

**P08_CLOPS - Clinical Operations Director**
- **Role**: Trial logistics and feasibility
- **Expertise**: Recruitment, site selection, budget, CRO oversight
- **Responsibilities**:
  - Assess recruitment feasibility
  - Develop retention strategy
  - Plan logistics and budget
- **Time Investment**: 1 hour

**P10_PATADV - Patient Advocate**
- **Role**: Patient perspective and experience
- **Expertise**: Lived experience with condition, patient priorities
- **Responsibilities**:
  - Review assessment burden
  - Provide patient perspective on design
  - Advise on retention strategies
- **Time Investment**: 30 minutes

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 High-Level Workflow Diagram

```
                    [START: Endpoint Strategy Complete from UC-01]
                                    |
                                    v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 1: STUDY DESIGN FRAMEWORK             ║
            ║  Time: 70-90 minutes                         ║
            ║  Personas: P01_CMO, P02_VPCLIN, P04_BIOSTAT  ║
            ╚═══════════════════════════════════════════════╝
                                    |
                    ┌───────────────┴───────────────┐
                    v                               v
            ┌─────────────────┐           ┌─────────────────┐
            │ STEP 1.1:       │           │ STEP 1.2:       │
            │ Study Objectives│           │ Trial Design    │
            │ & Hypotheses    │           │ Framework       │
            │ (30 min)        │           │ (40 min)        │
            └────────┬────────┘           │ Selection       │
                     │                    └────────┬────────┘
                     └───────────┬─────────────────┘
                                 v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 2: COMPARATOR & POPULATION DESIGN     ║
            ║  Time: 95-110 minutes                        ║
            ║  Personas: P01_CMO, P05_REGDIR, P02_VPCLIN   ║
            ╚═══════════════════════════════════════════════╝
                                 |
                    ┌────────────┴────────────┐
                    v                         v
            ┌─────────────────┐       ┌─────────────────┐
            │ STEP 2.1:       │       │ STEP 2.2:       │
            │ Comparator      │       │ Inclusion/      │
            │ & Blinding      │       │ Exclusion       │
            │ Strategy        │       │ Criteria        │
            │ (45 min)        │       │ (50 min)        │
            └────────┬────────┘       └────────┬────────┘
                     └───────────┬─────────────┘
                                 v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 3: INTERVENTION & ASSESSMENT PROTOCOL ║
            ║  Time: 75-90 minutes                         ║
            ║  Personas: P06_PMDIG, P03_CLTM, P02_VPCLIN   ║
            ╚═══════════════════════════════════════════════╝
                                 |
                    ┌────────────┴────────────┐
                    v                         v
            ┌─────────────────┐       ┌─────────────────┐
            │ STEP 3.1:       │       │ STEP 3.2:       │
            │ Intervention    │       │ Visit Schedule  │
            │ Protocol &      │       │ & Assessment    │
            │ Dosing          │       │ Plan            │
            │ (40 min)        │       │ (35 min)        │
            └────────┬────────┘       └────────┬────────┘
                     └───────────┬─────────────┘
                                 v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 4: OPERATIONAL PLANNING               ║
            ║  Time: 80-100 minutes                        ║
            ║  Personas: P08_CLOPS, P03_CLTM, P04_BIOSTAT  ║
            ╚═══════════════════════════════════════════════╝
                                 |
                    ┌────────────┴────────────┐
                    v                         v
            ┌─────────────────┐       ┌─────────────────┐
            │ STEP 4.1:       │       │ STEP 4.2:       │
            │ Recruitment &   │       │ Statistical     │
            │ Retention       │       │ Analysis Plan   │
            │ Strategy        │       │ Overview        │
            │ (40 min)        │       │ (45 min)        │
            └────────┬────────┘       └────────┬────────┘
                     └───────────┬─────────────┘
                                 v
            ╔═══════════════════════════════════════════════╗
            ║  PHASE 5: REGULATORY & ETHICS PLANNING       ║
            ║  Time: 50-60 minutes                         ║
            ║  Personas: P05_REGDIR, P01_CMO               ║
            ╚═══════════════════════════════════════════════╝
                                 |
                                 v
            ┌──────────────────────────────────┐
            │ STEP 5.1:                        │
            │ Regulatory & Ethical             │
            │ Considerations                   │
            │ (30 min)                         │
            └────────┬─────────────────────────┘
                     │
                     v
            ┌──────────────────────────────────┐
            │ STEP 5.2:                        │
            │ Final RCT Design                 │
            │ Documentation                    │
            │ (25 min)                         │
            └────────┬─────────────────────────┘
                     │
                     v
            ╔═══════════════════════════════════════════════╗
            ║  DELIVERABLES PACKAGE                        ║
            ║  - RCT Design Document (30-40 pages)         ║
            ║  - Study Design Specification                ║
            ║  - Comparator & Blinding Strategy            ║
            ║  - Inclusion/Exclusion Criteria              ║
            ║  - Intervention Protocol                     ║
            ║  - Visit Schedule & Assessment Plan          ║
            ║  - Recruitment & Retention Strategy          ║
            ║  - Statistical Analysis Plan Overview        ║
            ║  - Regulatory Strategy Document              ║
            ║  - Stakeholder Presentation (15-20 slides)   ║
            ╚═══════════════════════════════════════════════╝
                                 |
                                 v
                            [END: RCT Design Ready for Protocol Development]
```

### 4.2 Workflow Phase Summary

| Phase | Duration | Key Activities | Primary Outputs |
|-------|----------|----------------|-----------------|
| **Phase 1: Study Design Framework** | 70-90 min | Define objectives & hypotheses, select trial design type | Study objectives, design framework (superiority/non-inferiority) |
| **Phase 2: Comparator & Population** | 95-110 min | Design comparator strategy, develop I/E criteria | Comparator design, blinding strategy, eligibility criteria |
| **Phase 3: Intervention & Assessment** | 75-90 min | Specify intervention protocol, plan visit schedule | Intervention protocol, assessment timeline |
| **Phase 4: Operational Planning** | 80-100 min | Develop recruitment strategy, outline statistical plan | Recruitment strategy, SAP overview |
| **Phase 5: Regulatory & Ethics** | 50-60 min | Plan regulatory interactions, document design | FDA strategy, complete RCT design document |
| **TOTAL** | **4-6 hours** | **Complete RCT design workflow** | **Protocol-ready trial design** |

---

## 5. STEP-BY-STEP IMPLEMENTATION GUIDE

### PHASE 1: STUDY DESIGN FRAMEWORK (70-90 minutes)

---

#### **STEP 1.1: Define Study Objectives & Hypotheses (30 minutes)**

**Objective**: Establish clear primary and secondary objectives with testable hypotheses.

**Persona**: P01_CMO (Lead), P02_VPCLIN (Support), P04_BIOSTAT (Support)

**Prerequisites**:
- Completed UC-01 (Endpoint Selection)
- Primary and secondary endpoints identified
- Regulatory strategy defined
- Target product profile

**Process**:

1. **Review Endpoint Strategy** (5 minutes)
   - Review primary endpoint from UC-01
   - Review secondary endpoints
   - Understand regulatory requirements

2. **Execute Prompt 1.1.1** (20 minutes)
   - Use Study Objectives Definition prompt
   - Draft primary objective with hypothesis
   - Draft 2-4 secondary objectives
   - Ensure objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)

3. **Biostatistics Review** (5 minutes)
   - P04_BIOSTAT reviews hypotheses
   - Ensures statistical testability
   - Confirms objectives align with endpoints

**Deliverable**: Study Objectives & Hypotheses Document (2-3 pages)

**Quality Check**:
✅ Primary objective clearly stated with testable hypothesis  
✅ Hypothesis specifies direction and magnitude of effect  
✅ Secondary objectives support primary objective  
✅ Objectives align with regulatory strategy  
✅ Biostatistician confirms testability

---

#### **STEP 1.2: Select Trial Design Framework (40 minutes)**

**Objective**: Choose appropriate trial design type (superiority, non-inferiority, equivalence).

**Persona**: P04_BIOSTAT (Lead), P01_CMO (Support), P05_REGDIR (Support)

**Prerequisites**:
- Study Objectives from Step 1.1
- Understanding of comparator landscape
- Regulatory precedent knowledge

**Process**:

1. **Assess Design Options** (15 minutes)
   - Evaluate superiority design
   - Evaluate non-inferiority design
   - Evaluate equivalence design (rare for DTx)
   - Consider regulatory and commercial implications

2. **Execute Prompt 1.2.1** (20 minutes)
   - Use Trial Design Framework Selection prompt
   - Analyze pros/cons of each design type
   - Consider sample size implications
   - Document regulatory acceptability

3. **Regulatory Review** (5 minutes)
   - P05_REGDIR reviews design choice
   - Confirms FDA acceptability
   - Identifies potential regulatory concerns

**Deliverable**: Trial Design Framework Document (3-4 pages)

**Quality Check**:
✅ Design type selected with clear rationale  
✅ Design appropriate for comparator  
✅ Regulatory precedent documented  
✅ Sample size implications understood  
✅ Commercial implications considered

---

### PHASE 2: COMPARATOR & POPULATION DESIGN (95-110 minutes)

---

#### **STEP 2.1: Design Comparator & Blinding Strategy (45 minutes)**

**Objective**: Select and design appropriate comparator with robust blinding strategy.

**Persona**: P01_CMO (Lead), P05_REGDIR (Support), P06_PMDIG (Support)

**Prerequisites**:
- Trial Design Framework from Step 1.2
- Understanding of FDA expectations
- Knowledge of DTx regulatory precedents

**Process**:

1. **Evaluate Comparator Options** (15 minutes)
   - Sham/attention control app
   - Waitlist control
   - Treatment-as-usual (TAU)
   - Active comparator (another intervention)
   - No treatment control
   - Assess pros/cons for each

2. **Execute Prompt 2.1.1** (25 minutes)
   - Use Comparator Selection & Design prompt
   - Select optimal comparator for trial
   - Design sham app specifications (if applicable)
   - Develop blinding strategy
   - Plan blinding assessment

3. **Regulatory & Product Review** (5 minutes)
   - P05_REGDIR confirms FDA acceptability
   - P06_PMDIG confirms sham app feasibility
   - Identify implementation risks

**Deliverable**: Comparator & Blinding Strategy Document (4-5 pages)

**Quality Check**:
✅ Comparator appropriate for design type  
✅ Blinding strategy maximizes validity  
✅ Sham app specifications detailed (if applicable)  
✅ FDA precedent supports approach  
✅ Implementation feasibility confirmed

---

#### **STEP 2.2: Develop Inclusion/Exclusion Criteria (50 minutes)**

**Objective**: Define eligibility criteria that balance validity, safety, and recruitment feasibility.

**Persona**: P02_VPCLIN (Lead), P01_CMO (Support), P08_CLOPS (Support)

**Prerequisites**:
- Target population from UC-01
- Understanding of condition epidemiology
- Recruitment feasibility considerations

**Process**:

1. **Draft Inclusion Criteria** (15 minutes)
   - Define core eligibility (diagnosis, severity, age)
   - Consider digital access requirements
   - Balance specificity with generalizability

2. **Draft Exclusion Criteria** (20 minutes)
   - Safety exclusions (contraindications, suicidality)
   - Validity exclusions (confounding conditions)
   - Feasibility exclusions (language, technology)
   - Regulatory exclusions (vulnerable populations)

3. **Execute Prompt 2.2.1** (10 minutes)
   - Use I/E Criteria Development prompt
   - Review and refine criteria
   - Assess impact on recruitment

4. **Feasibility Assessment** (5 minutes)
   - P08_CLOPS reviews for recruitment impact
   - Estimate eligible population size
   - Identify potential recruitment challenges

**Deliverable**: Inclusion/Exclusion Criteria Document (3-4 pages)

**Quality Check**:
✅ Inclusion criteria define target population clearly  
✅ Exclusion criteria justified (safety/validity/feasibility)  
✅ Criteria allow adequate recruitment pool  
✅ Digital access requirements specified  
✅ Vulnerable populations appropriately addressed

---

### PHASE 3: INTERVENTION & ASSESSMENT PROTOCOL (75-90 minutes)

---

#### **STEP 3.1: Specify Intervention Protocol & Dosing (40 minutes)**

**Objective**: Define precise intervention specifications, dosing, and adherence monitoring.

**Persona**: P06_PMDIG (Lead), P03_CLTM (Support), P01_CMO (Support)

**Prerequisites**:
- DTx product specifications
- Comparator design from Step 2.1
- Understanding of intervention mechanism

**Process**:

1. **Define Intervention Components** (15 minutes)
   - Core therapeutic features
   - User journey and flow
   - Content modules and sequence
   - Engagement mechanics

2. **Execute Prompt 3.1.1** (20 minutes)
   - Use Intervention Protocol Specification prompt
   - Define "dose" (minimum usage, completion criteria)
   - Specify adherence monitoring
   - Plan intervention fidelity measures
   - Design sham intervention (if applicable)

3. **Clinical Review** (5 minutes)
   - P01_CMO reviews clinical appropriateness
   - P03_CLTM confirms operational feasibility
   - Identify training needs for sites

**Deliverable**: Intervention Protocol Document (5-7 pages)

**Quality Check**:
✅ Intervention components clearly specified  
✅ "Dose" defined quantitatively  
✅ Adherence monitoring plan detailed  
✅ Intervention fidelity measures included  
✅ Sham intervention designed (if applicable)

---

#### **STEP 3.2: Plan Visit Schedule & Assessment Timeline (35 minutes)**

**Objective**: Design visit schedule and assessment timeline minimizing burden while capturing key outcomes.

**Persona**: P03_CLTM (Lead), P02_VPCLIN (Support), P10_PATADV (Support)

**Prerequisites**:
- Endpoints from UC-01
- Intervention duration from Step 3.1
- Statistical plan considerations

**Process**:

1. **Draft Visit Schedule** (15 minutes)
   - Screening and baseline
   - Intervention period visits
   - Primary endpoint assessment timing
   - Follow-up period (if applicable)
   - Remote vs. in-person visits

2. **Execute Prompt 3.2.1** (15 minutes)
   - Use Visit Schedule Planning prompt
   - Map assessments to visit schedule
   - Optimize timing for endpoints
   - Minimize patient burden
   - Balance data quality with feasibility

3. **Patient Perspective Review** (5 minutes)
   - P10_PATADV reviews burden
   - Identify potential dropout risks
   - Suggest burden reduction strategies

**Deliverable**: Visit Schedule & Assessment Plan (3-4 pages with timeline chart)

**Quality Check**:
✅ Visit schedule supports endpoint assessment  
✅ Primary endpoint timing optimal  
✅ Patient burden minimized  
✅ Remote assessments maximized (where appropriate)  
✅ Follow-up period included for durability

---

### PHASE 4: OPERATIONAL PLANNING (80-100 minutes)

---

#### **STEP 4.1: Develop Recruitment & Retention Strategy (40 minutes)**

**Objective**: Create realistic recruitment plan and retention strategies.

**Persona**: P08_CLOPS (Lead), P03_CLTM (Support), P02_VPCLIN (Support)

**Prerequisites**:
- I/E criteria from Step 2.2
- Target sample size estimate
- Timeline constraints

**Process**:

1. **Assess Recruitment Feasibility** (15 minutes)
   - Estimate eligible population
   - Identify recruitment sources
   - Calculate enrollment rate assumptions
   - Assess multi-site needs

2. **Execute Prompt 4.1.1** (20 minutes)
   - Use Recruitment Strategy prompt
   - Develop recruitment channels plan
   - Design retention strategies
   - Plan incentive structure
   - Estimate timeline and budget

3. **Risk Assessment** (5 minutes)
   - Identify recruitment risks
   - Develop mitigation strategies
   - Plan for slow enrollment scenarios

**Deliverable**: Recruitment & Retention Strategy Document (4-5 pages)

**Quality Check**:
✅ Recruitment assumptions realistic and documented  
✅ Multiple recruitment channels identified  
✅ Retention strategies comprehensive  
✅ Timeline feasible  
✅ Budget estimated

---

#### **STEP 4.2: Outline Statistical Analysis Plan (45 minutes)**

**Objective**: Develop high-level statistical analysis plan aligned with endpoints and design.

**Persona**: P04_BIOSTAT (Lead), P01_CMO (Support)

**Prerequisites**:
- Study objectives from Step 1.1
- Trial design from Step 1.2
- Endpoints from UC-01
- Visit schedule from Step 3.2

**Process**:

1. **Define Analysis Populations** (10 minutes)
   - Intent-to-treat (ITT)
   - Per-protocol (PP)
   - Safety population
   - Adherence subgroups

2. **Execute Prompt 4.2.1** (30 minutes)
   - Use Statistical Analysis Plan prompt
   - Specify primary analysis method
   - Plan secondary analyses
   - Define handling of missing data
   - Plan sensitivity analyses
   - Address multiplicity adjustments

3. **CMO Review** (5 minutes)
   - P01_CMO reviews alignment with objectives
   - Confirm clinical meaningfulness of analyses
   - Identify any additional analyses needed

**Deliverable**: Statistical Analysis Plan Overview (5-6 pages)

**Quality Check**:
✅ Analysis populations clearly defined  
✅ Primary analysis method appropriate for design  
✅ Missing data strategy specified  
✅ Sensitivity analyses planned  
✅ Multiplicity addressed

---

### PHASE 5: REGULATORY & ETHICS PLANNING (50-60 minutes)

---

#### **STEP 5.1: Plan Regulatory & Ethical Considerations (30 minutes)**

**Objective**: Develop FDA interaction strategy and ensure ethical compliance.

**Persona**: P05_REGDIR (Lead), P01_CMO (Support)

**Prerequisites**:
- Complete RCT design from Steps 1-4
- Regulatory strategy from UC-01
- Understanding of FDA expectations

**Process**:

1. **Plan FDA Interactions** (15 minutes)
   - Determine need for Pre-Sub meeting
   - Identify key questions for FDA
   - Plan meeting timing and materials
   - Consider post-meeting follow-up

2. **Execute Prompt 5.1.1** (12 minutes)
   - Use Regulatory Planning prompt
   - Document FDA strategy
   - Plan IRB submissions
   - Address informed consent considerations
   - Plan data safety monitoring (DSMB if needed)

3. **Ethical Review** (3 minutes)
   - Review ethical considerations
   - Confirm vulnerable population protections
   - Assess risk/benefit balance

**Deliverable**: Regulatory & Ethics Strategy Document (3-4 pages)

**Quality Check**:
✅ FDA Pre-Sub strategy defined  
✅ IRB submission timeline planned  
✅ Informed consent considerations addressed  
✅ DSMB plan (if applicable)  
✅ Ethical considerations documented

---

#### **STEP 5.2: Create Final RCT Design Documentation (25 minutes)**

**Objective**: Synthesize all components into comprehensive RCT design document.

**Persona**: P01_CMO (Lead), P02_VPCLIN (Support)

**Prerequisites**:
- All outputs from Steps 1.1 through 5.1

**Process**:

1. **Compile Design Document** (15 minutes)
   - Executive summary
   - Study objectives and design
   - Population and eligibility
   - Intervention protocol
   - Assessment plan
   - Operational strategy
   - Statistical considerations
   - Regulatory plan

2. **Execute Prompt 5.2.1** (5 minutes)
   - Use Final Documentation prompt
   - Ensure consistency across sections
   - Add visual diagrams (timeline, flowchart)
   - Format for stakeholder review

3. **Quality Review** (5 minutes)
   - Final review by P01_CMO and P02_VPCLIN
   - Check completeness and consistency
   - Prepare for stakeholder presentation

**Deliverable**: Complete RCT Design Document (30-40 pages) + Stakeholder Presentation (15-20 slides)

**Quality Check**:
✅ All design components integrated  
✅ Document is comprehensive and clear  
✅ Stakeholder presentation ready  
✅ Design ready for protocol development  
✅ Team alignment achieved

---

## 6. COMPLETE PROMPT SUITE

### 6.1 Prompt Overview Table

| Prompt ID | Prompt Name | Persona | Time | Complexity | Phase |
|-----------|-------------|---------|------|------------|-------|
| **1.1.1** | Study Objectives Definition | P01_CMO | 20 min | INTERMEDIATE | Study Design Framework |
| **1.2.1** | Trial Design Framework Selection | P04_BIOSTAT | 20 min | ADVANCED | Study Design Framework |
| **2.1.1** | Comparator Selection & Design | P01_CMO | 25 min | ADVANCED | Comparator & Population |
| **2.2.1** | I/E Criteria Development | P02_VPCLIN | 35 min | INTERMEDIATE | Comparator & Population |
| **3.1.1** | Intervention Protocol Specification | P06_PMDIG | 20 min | INTERMEDIATE | Intervention & Assessment |
| **3.2.1** | Visit Schedule Planning | P03_CLTM | 15 min | INTERMEDIATE | Intervention & Assessment |
| **4.1.1** | Recruitment & Retention Strategy | P08_CLOPS | 20 min | INTERMEDIATE | Operational Planning |
| **4.2.1** | Statistical Analysis Plan Overview | P04_BIOSTAT | 30 min | ADVANCED | Operational Planning |
| **5.1.1** | Regulatory & Ethics Planning | P05_REGDIR | 12 min | ADVANCED | Regulatory & Ethics |
| **5.2.1** | Final RCT Design Documentation | P01_CMO | 5 min | INTERMEDIATE | Regulatory & Ethics |

---

### 6.2 Complete Prompts with Examples

---

#### **PROMPT 1.1.1: Study Objectives Definition**

**Persona**: P01_CMO  
**Time**: 20 minutes  
**Complexity**: INTERMEDIATE

```yaml
SYSTEM PROMPT:
You are a Chief Medical Officer with 15+ years of experience designing digital health clinical trials. You excel at translating therapeutic goals into precise, testable study objectives that meet FDA standards.

USER PROMPT:
I need to define clear study objectives and hypotheses for my DTx clinical trial.

**DTx Product Context:**
- Product Name: {product_name}
- Indication: {target_indication}
- Target Population: {population_description}
- Primary Endpoint: {primary_endpoint_from_UC01}
- Secondary Endpoints: {secondary_endpoints_list}
- Regulatory Path: {fda_510k_de_novo_other}

**Clinical Context:**
- Standard of Care: {current_treatment_landscape}
- Unmet Need: {clinical_gap}
- Intervention Mechanism: {how_dtx_works}
- Treatment Duration: {weeks_or_months}

**Please define study objectives following this structure:**

1. **PRIMARY OBJECTIVE**
   
   Format: "To [ACTION VERB] [WHAT] in [POPULATION] using [INTERVENTION] compared to [COMPARATOR]."
   
   Requirements:
   - Specific and measurable
   - Aligned with primary endpoint
   - Time-bound (specify assessment window)
   - Clinically meaningful
   
   Example: "To demonstrate superiority of CalmPath CBT app in reducing depressive symptoms (PHQ-9) compared to sham control app at 12 weeks in adults with moderate major depressive disorder."

2. **PRIMARY HYPOTHESIS**
   
   Format:
   - **Null Hypothesis (H0)**: No difference between groups
   - **Alternative Hypothesis (H1)**: DTx superior/non-inferior/equivalent to comparator
   - **Direction**: One-sided or two-sided test
   - **Effect Size**: Specify minimum clinically important difference (MCID)
   
   Example:
   - H0: Mean change in PHQ-9 from baseline to week 12 is equal between CalmPath CBT and sham control
   - H1: Mean change in PHQ-9 from baseline to week 12 is greater in CalmPath CBT than sham control (superiority)
   - MCID: ≥3 point greater reduction in CalmPath CBT vs. sham
   - Test: Two-sided, α = 0.05

3. **SECONDARY OBJECTIVES** (2-4 objectives)
   
   For each secondary objective, specify:
   - Clear objective statement
   - Associated endpoint
   - Relationship to primary objective (supportive, exploratory, safety)
   - Analysis approach
   
   Examples:
   - "To evaluate the effect of CalmPath CBT on response rate (≥50% reduction in PHQ-9) at week 12" (Supportive of primary)
   - "To assess the effect of CalmPath CBT on functional impairment (SDS) at week 12" (Demonstrates clinical benefit)
   - "To explore the relationship between app engagement and symptom improvement" (Dose-response, exploratory)

4. **SAFETY OBJECTIVE**
   
   Format: "To evaluate the safety and tolerability of [INTERVENTION] in [POPULATION]."
   
   Include:
   - Adverse event monitoring approach
   - Specific safety concerns for DTx (e.g., worsening symptoms, increased suicidality)
   - Comparison to comparator safety profile

5. **CONSISTENCY CHECK**
   
   Verify:
   - All objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
   - Objectives align with endpoints from UC-01
   - Hypotheses are statistically testable
   - Primary objective drives sample size
   - Secondary objectives support commercial/payer value story

**OUTPUT FORMAT:**
- Primary Objective with Hypothesis (1 page)
- Secondary Objectives (1-2 pages)
- Safety Objective
- Consistency verification table

**CRITICAL REQUIREMENTS:**
- Objectives must use precise clinical terminology
- Hypotheses must specify statistical test and alpha level
- Effect sizes must be justified (MCID from literature or clinical judgment)
- Time windows must be explicit
```

**EXAMPLE INPUT:**

```yaml
product_name: "MindPath CBT"
target_indication: "Moderate Major Depressive Disorder (MDD)"
population_description: "Adults 18-65 years with PHQ-9 scores 10-19"
primary_endpoint_from_UC01: "Change in PHQ-9 score from baseline to week 12"
secondary_endpoints_list: 
  - "PHQ-9 response rate (≥50% reduction)"
  - "PHQ-9 remission rate (<5)"
  - "Sheehan Disability Scale (SDS) change"
  - "App engagement metrics"
regulatory_path: "FDA De Novo"
current_treatment_landscape: "Antidepressant medications (SSRIs) and face-to-face psychotherapy (CBT)"
clinical_gap: "Only 40% of MDD patients have access to evidence-based psychotherapy due to cost, waitlists, and geographic barriers"
how_dtx_works: "Delivers cognitive behavioral therapy via mobile app with modules on behavioral activation, cognitive restructuring, mood tracking, and personalized feedback"
weeks_or_months: "12 weeks"
```

**EXAMPLE OUTPUT:**

```markdown
# STUDY OBJECTIVES & HYPOTHESES
## MindPath CBT for Moderate Major Depressive Disorder

### PRIMARY OBJECTIVE

**Objective Statement:**
To demonstrate the superiority of MindPath CBT mobile app compared to sham control app in reducing depressive symptoms as measured by change in Patient Health Questionnaire-9 (PHQ-9) score from baseline to week 12 in adults aged 18-65 years with moderate major depressive disorder (PHQ-9 10-19).

**Primary Hypothesis:**

- **Null Hypothesis (H0):** The mean change in PHQ-9 score from baseline to week 12 is equal between the MindPath CBT group and the sham control group.

- **Alternative Hypothesis (H1):** The mean change in PHQ-9 score from baseline to week 12 is greater in the MindPath CBT group compared to the sham control group (superiority).

- **Statistical Test:** Two-sided t-test (or ANCOVA with baseline as covariate), α = 0.05

- **Minimum Clinically Important Difference (MCID):** ≥3 points greater reduction in PHQ-9 in MindPath CBT vs. sham control
  - **Justification:** 3-point change in PHQ-9 represents a clinically meaningful improvement in depression severity (Löwe et al., 2004). This aligns with precedent from published CBT app trials (Deprexis: 3.5-point difference; Meyer et al., 2015).

- **Analysis Population:** Intent-to-treat (ITT) primary; Per-protocol (PP) supportive

- **Timing:** Baseline (Day 0) and Week 12 (primary endpoint)

---

### SECONDARY OBJECTIVES

**Secondary Objective 1: Response Rate**

- **Objective:** To evaluate the effect of MindPath CBT compared to sham control on clinical response, defined as ≥50% reduction in PHQ-9 score from baseline at week 12.

- **Endpoint:** Proportion of participants achieving ≥50% reduction in PHQ-9 (binary outcome)

- **Relationship to Primary:** Supportive - provides clinically interpretable binary outcome complementing continuous primary endpoint

- **Analysis:** Chi-square test or logistic regression; OR and 95% CI reported

- **Clinical Significance:** Response rate is a standard metric used by clinicians and payers to evaluate depression treatment effectiveness

---

**Secondary Objective 2: Remission Rate**

- **Objective:** To evaluate the effect of MindPath CBT compared to sham control on clinical remission, defined as PHQ-9 score <5 at week 12.

- **Endpoint:** Proportion of participants achieving PHQ-9 <5 (binary outcome)

- **Relationship to Primary:** Key secondary - remission represents optimal treatment outcome and is critical for payer value story

- **Analysis:** Chi-square test or logistic regression; OR and 95% CI reported; NNT calculated

- **Clinical Significance:** Remission is the gold standard for depression treatment success. NNT will support health economic value proposition.

---

**Secondary Objective 3: Functional Impairment**

- **Objective:** To assess the effect of MindPath CBT compared to sham control on functional impairment as measured by change in Sheehan Disability Scale (SDS) total score from baseline to week 12.

- **Endpoint:** Change in SDS total score (0-30 scale)

- **Relationship to Primary:** Demonstrates real-world impact beyond symptom reduction; supports commercial value proposition

- **Analysis:** ANCOVA with baseline as covariate; mean difference and 95% CI reported

- **Clinical Significance:** Functional improvement is a key outcome for patients, employers, and payers. Demonstrates that DTx improves real-world functioning, not just self-reported symptoms.

---

**Secondary Objective 4: Dose-Response Relationship (Exploratory)**

- **Objective:** To explore the relationship between MindPath CBT app engagement (number of modules completed, total app time) and change in PHQ-9 score.

- **Endpoint:** Correlation between engagement metrics and PHQ-9 change

- **Relationship to Primary:** Exploratory - supports understanding of mechanism of action and optimal "dose"

- **Analysis:** Pearson/Spearman correlation; mediation analysis if appropriate

- **Clinical Significance:** Establishes dose-response relationship that supports future recommendations for minimum effective dose and may inform reimbursement criteria.

---

### SAFETY OBJECTIVE

**Objective:** To evaluate the safety and tolerability of MindPath CBT mobile app in adults with moderate major depressive disorder.

**Safety Assessments:**

1. **Adverse Events (AEs):**
   - Collection method: Spontaneous reporting + systematic inquiry at each visit
   - Severity grading: Mild, Moderate, Severe (per CTCAE or adapted scale)
   - Causality assessment: Related, Possibly Related, Not Related
   - Serious Adverse Events (SAEs): Hospitalization, suicidality, death

2. **Suicidality Monitoring:**
   - Columbia-Suicide Severity Rating Scale (C-SSRS) at baseline, weeks 2, 4, 8, 12
   - Protocol for managing suicidal ideation/behavior
   - Immediate psychiatric referral for active suicidality

3. **Symptom Worsening:**
   - Monitor for ≥25% increase in PHQ-9 from baseline
   - Clinical follow-up for worsening symptoms
   - Protocol for discontinuation if significant worsening

4. **Comparator Safety Profile:**
   - Sham control expected to have minimal risk
   - Compare AE rates between groups
   - Hypothesis: MindPath CBT is safe and well-tolerated with AE profile similar to sham

**Analysis:** Descriptive statistics for AE incidence, severity, and causality. Fisher's exact test for between-group differences in AE rates.

---

### CONSISTENCY VERIFICATION

| Criterion | Status | Notes |
|-----------|--------|-------|
| **SMART Objectives** | ✅ Pass | All objectives are Specific, Measurable, Achievable, Relevant, Time-bound |
| **Endpoint Alignment** | ✅ Pass | All objectives align with endpoints defined in UC-01 |
| **Statistical Testability** | ✅ Pass | All hypotheses specify statistical test, alpha level, and analysis population |
| **Effect Size Justification** | ✅ Pass | MCID of 3 points justified by literature (Löwe et al., 2004; Meyer et al., 2015) |
| **Time Windows Explicit** | ✅ Pass | All objectives specify "week 12" as primary timepoint |
| **Primary Drives Sample Size** | ✅ Pass | Primary endpoint (PHQ-9 change) will be used for power calculation |
| **Secondary Supports Value** | ✅ Pass | Secondary objectives cover response/remission (clinical), function (real-world), and engagement (mechanism) |
| **Safety Addressed** | ✅ Pass | Comprehensive safety monitoring including suicidality |

---

### NEXT STEPS

1. Biostatistician (P04_BIOSTAT) to review hypotheses and confirm testability
2. Proceed to Step 1.2: Select Trial Design Framework (superiority vs. non-inferiority)
3. Use these objectives as foundation for sample size calculation (UC_CD_007)
4. Incorporate objectives into study protocol (UC_CD_010)

---

**References:**
- Löwe B, et al. "Responsiveness of the PHQ-9 to Psychopharmacological Depression Treatment." Psychosomatics. 2004;45:1-5.
- Meyer B, et al. "Effectiveness of Deprexis, an internet-based treatment for depression." Eur Psychiatry. 2015;30:1025-1031.
```

---

#### **PROMPT 1.2.1: Trial Design Framework Selection**

**Persona**: P04_BIOSTAT  
**Time**: 20 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Lead Biostatistician with 12+ years of experience in clinical trial design for medical devices and digital therapeutics. You specialize in selecting appropriate trial design frameworks (superiority, non-inferiority, equivalence) that balance scientific rigor with regulatory requirements and commercial goals.

USER PROMPT:
I need to select the appropriate trial design framework for my DTx RCT.

**Study Context:**
- Primary Objective: {from_prompt_1.1.1}
- Primary Endpoint: {primary_endpoint}
- Comparator Type: {sham_app_waitlist_active_treatment}
- Regulatory Path: {fda_510k_de_novo_other}
- Commercial Goal: {demonstrate_superiority_show_equivalence_cost_effectiveness}

**Design Options to Evaluate:**

1. **SUPERIORITY TRIAL**
   
   **Description:** Demonstrates that DTx is better than comparator
   
   **Hypothesis:**
   - H0: DTx = Comparator
   - H1: DTx > Comparator (or DTx < Comparator for negative outcomes)
   
   **Statistical Approach:**
   - Two-sided test (typically)
   - Alpha = 0.05
   - Power = 80-90%
   - Effect size: DTx must be MCID better than comparator
   
   **When Appropriate:**
   - Comparing to placebo, sham, or waitlist control
   - Comparing to weak or no intervention
   - Goal is to demonstrate DTx adds value over control
   - Regulatory path requires demonstration of effectiveness
   
   **Sample Size Implications:**
   - Smallest N of the three design types (for same effect size and power)
   - Example: To detect 3-point difference in PHQ-9 with SD=6, need ~118/arm (80% power, α=0.05)
   
   **Pros:**
   - FDA expects superiority for De Novo DTx in most cases
   - Strongest evidence for commercial differentiation
   - Easiest to explain to stakeholders and payers
   - Precedent: reSET, reSET-O, Somryst all used superiority
   
   **Cons:**
   - Requires demonstrating benefit, not just equivalence
   - If DTx is not actually superior, trial may fail
   - May require active comparator to have true equipoise
   
   **Regulatory Considerations:**
   - FDA's preferred design for novel DTx
   - Clear demonstration of benefit-risk
   - Supports De Novo classification
   
   **Commercial Considerations:**
   - Enables "proven better than" claims
   - Supports premium pricing
   - Strong payer value story

---

2. **NON-INFERIORITY TRIAL**
   
   **Description:** Demonstrates that DTx is not worse than active comparator by more than a pre-specified margin (Δ)
   
   **Hypothesis:**
   - H0: DTx is worse than comparator by ≥Δ
   - H1: DTx is not worse than comparator by <Δ (DTx is non-inferior)
   
   **Statistical Approach:**
   - One-sided test
   - Alpha = 0.025 (one-sided) or 0.05 (two-sided with lower bound)
   - Power = 80-90%
   - Must justify non-inferiority margin (Δ) rigorously
   
   **When Appropriate:**
   - Comparing DTx to established, effective treatment (e.g., face-to-face therapy)
   - Goal is to show DTx is "as good as" gold standard, with advantages in cost/access/scalability
   - Active comparator has strong evidence base
   - Regulatory path allows for non-inferiority (less common for novel DTx)
   
   **Sample Size Implications:**
   - Larger N than superiority (often 20-40% more)
   - Example: To show non-inferiority with Δ=3 points, SD=6, might need ~150-170/arm
   - N increases as non-inferiority margin (Δ) narrows
   
   **Pros:**
   - Allows comparison to "real" gold standard treatment
   - If non-inferiority shown, can claim "as effective as" standard of care
   - Supports payer value proposition: same outcomes, lower cost/better access
   
   **Cons:**
   - Requires rigorous justification of non-inferiority margin (FDA scrutinizes heavily)
   - Larger sample size than superiority
   - Active comparator must be delivered with high fidelity (difficult for face-to-face therapy)
   - Risk: If comparator performs worse than expected, non-inferiority is easier to show (\"assay sensitivity\" concern)
   
   **Non-Inferiority Margin (Δ) Selection:**
   - Should be smaller than MCID (typically 50% of MCID or less)
   - Must preserve substantial fraction of comparator's effect vs. placebo
   - FDA guidance: Margin should retain "most" of active control effect
   - Example: If MCID is 3 points, Δ might be 1.5 points (50% of MCID)
   - Requires literature review of comparator effect vs. placebo
   
   **Regulatory Considerations:**
   - FDA skeptical of non-inferiority for novel DTx without prior superiority data
   - Requires extensive justification of margin
   - May require \"assay sensitivity\" evidence (historical comparator vs. placebo)
   - More common for medical devices with established predicate
   
   **Commercial Considerations:**
   - \"As good as\" claim may not differentiate in crowded market
   - Strong for cost-effectiveness story (equal outcomes, lower cost)
   - Payers value non-inferiority to standard of care

---

3. **EQUIVALENCE TRIAL**
   
   **Description:** Demonstrates that DTx is equivalent to comparator within a pre-specified range (±Δ)
   
   **Hypothesis:**
   - H0: |DTx - Comparator| ≥ Δ
   - H1: |DTx - Comparator| < Δ (DTx is equivalent)
   
   **Statistical Approach:**
   - Two one-sided tests (TOST)
   - Both upper and lower bounds must be within ±Δ
   - Alpha = 0.05 (0.025 for each one-sided test)
   - Power = 80-90%
   
   **When Appropriate:**
   - RARE for DTx pivotal trials
   - Typically used for generic/biosimilar drugs, not novel interventions
   - Appropriate when goal is to show \"therapeutic equivalence\"
   - Example: Digital version of established therapy where equivalence is the goal
   
   **Sample Size Implications:**
   - Largest N of the three design types
   - Must power for both upper and lower equivalence bounds
   - Example: To show equivalence within ±3 points, might need ~200-250/arm
   
   **Pros:**
   - Demonstrates true equivalence (not just non-inferiority)
   - Useful for \"digital twin\" of physical intervention
   
   **Cons:**
   - Very large sample size
   - Rarely appropriate for novel DTx
   - FDA does not expect equivalence trials for De Novo submissions
   - Commercial story is weak (\"same as\" rather than \"better than\")
   
   **Regulatory Considerations:**
   - Not standard for novel DTx
   - More common in pharmaceutical/biosimilar space
   
   **Commercial Considerations:**
   - Weak differentiation
   - May support lower-cost positioning

---

**YOUR TASK:**

Based on the study context provided, recommend the most appropriate trial design framework:

1. **Recommended Design:** [Superiority / Non-Inferiority / Equivalence]

2. **Rationale:**
   - Why is this design most appropriate for your comparator?
   - How does it align with regulatory strategy?
   - How does it support commercial goals?
   - What precedent supports this choice?

3. **Key Parameters:**
   - Hypothesis formulation (H0 and H1)
   - Statistical test and alpha level
   - One-sided or two-sided test
   - Non-inferiority margin (if applicable) with justification

4. **Sample Size Implications:**
   - Rough sample size estimate (detailed calculation in UC_CD_007)
   - Comparison to alternative designs
   - Feasibility assessment

5. **Regulatory Considerations:**
   - FDA acceptability for your pathway
   - Required justifications
   - Potential FDA questions

6. **Risk Assessment:**
   - What could go wrong with this design?
   - What are the main threats to validity?
   - How can risks be mitigated?

**OUTPUT FORMAT:**
- Design Recommendation (1 page executive summary)
- Detailed Rationale (2-3 pages)
- Statistical Specifications
- Sample Size Implications
- Risk Assessment Table

**CRITICAL REQUIREMENTS:**
- Recommendation must align with comparator type
- Regulatory precedent must be cited
- Non-inferiority margin must be justified if applicable
- Commercial implications must be considered
```

**EXAMPLE INPUT:**

```yaml
from_prompt_1.1.1: "To demonstrate the superiority of MindPath CBT mobile app compared to sham control app in reducing depressive symptoms as measured by change in Patient Health Questionnaire-9 (PHQ-9) score from baseline to week 12 in adults aged 18-65 years with moderate major depressive disorder (PHQ-9 10-19)."
primary_endpoint: "Change in PHQ-9 score from baseline to week 12"
sham_app_waitlist_active_treatment: "Sham control app (attention control without active CBT elements)"
fda_510k_de_novo_other: "FDA De Novo"
demonstrate_superiority_show_equivalence_cost_effectiveness: "Demonstrate superiority to support first-in-class DTx for MDD with premium positioning"
```

**EXAMPLE OUTPUT:**

```markdown
# TRIAL DESIGN FRAMEWORK RECOMMENDATION
## MindPath CBT for Moderate Major Depressive Disorder

### EXECUTIVE SUMMARY

**RECOMMENDED DESIGN: SUPERIORITY TRIAL**

MindPath CBT should use a **superiority trial design** comparing the active DTx app to a sham control app. This design is optimal for demonstrating that MindPath CBT is **better than** a credible control, which is essential for FDA De Novo clearance, clinical acceptance, and commercial differentiation in the emerging DTx for depression market.

**Key Rationale:**
- Sham comparator appropriate for superiority (not an established active treatment requiring non-inferiority)
- FDA precedent strongly supports superiority design for novel DTx (reSET, reSET-O, Somryst)
- Commercial goal is to demonstrate added value, not just equivalence
- Smallest sample size of design options (most feasible)
- Clear, interpretable results for clinicians and payers

---

### DETAILED RATIONALE

#### 1. Comparator-Design Alignment

**Sham Control App = Superiority Design**

The comparator for MindPath CBT is a **sham/attention control app** that:
- Looks similar to MindPath CBT
- Provides psychoeducation about depression
- Includes mood tracking (but no therapeutic feedback)
- Does NOT contain active CBT elements (behavioral activation, cognitive restructuring, etc.)

This is explicitly designed as a **placebo-equivalent control**, not an established effective treatment. Therefore:

✅ **Superiority design is appropriate:** The hypothesis is that MindPath CBT (with active CBT elements) is BETTER than sham (without active elements).

❌ **Non-inferiority is not appropriate:** Non-inferiority is only used when comparing to an active, effective comparator. Sham is not an effective treatment, so demonstrating "non-inferiority to sham" makes no scientific or regulatory sense.

❌ **Equivalence is not appropriate:** There is no reason to demonstrate equivalence to a placebo-level control.

**Comparison:** If the comparator were face-to-face CBT therapy (an established, effective treatment), then non-inferiority could be considered. But that is not the case here.

---

#### 2. Regulatory Alignment (FDA De Novo)

**FDA Expects Superiority for Novel DTx**

For FDA De Novo submissions, the agency expects **demonstration of effectiveness** through well-controlled clinical trials. Superiority trials provide the clearest evidence:

**Precedent DTx Using Superiority Design:**
| DTx Product | Indication | Comparator | Design | Outcome |
|-------------|------------|------------|--------|---------|
| reSET (DEN170078) | Substance Use Disorder | Treatment-as-usual | Superiority | Clearance 2017 |
| reSET-O (DEN180056) | Opioid Use Disorder | Treatment-as-usual | Superiority | Clearance 2018 |
| Somryst (DEN190033) | Chronic Insomnia | Sham/educational control | Superiority | Clearance 2020 |
| EndeavorRx (DEN180001) | Pediatric ADHD | No treatment | Superiority | Clearance 2020 |

**Key Insight:** All successful DTx De Novo submissions have used **superiority designs** to demonstrate that the DTx is better than control. FDA has not cleared any DTx based on non-inferiority to active comparator as first-line evidence.

**FDA's Perspective:**
- De Novo pathway is for novel devices without predicates
- Requires demonstration of **safety AND effectiveness**
- Superiority provides clearest effectiveness signal
- FDA wants to see that DTx "works," not just that it's "not worse than" something

**Risk of Non-Inferiority:** If MindPath CBT pursued non-inferiority design, FDA would likely ask:
- "Why non-inferiority when you're comparing to sham? Shouldn't you demonstrate superiority?"
- "What is the justification for the non-inferiority margin?"
- "How do you ensure assay sensitivity (i.e., sham performs as expected)?"

These questions would delay the submission and potentially require additional data.

**✅ Recommendation: Superiority design aligns with FDA precedent and De Novo regulatory expectations.**

---

#### 3. Commercial & Payer Alignment

**Commercial Goal: Demonstrate Added Value**

The commercial strategy for MindPath CBT is to position as a **premium, evidence-based DTx** that:
- Provides access to CBT for patients without geographic/cost barriers
- Delivers proven symptom reduction and functional improvement
- Offers better outcomes than "doing nothing" or minimal intervention

**Superiority Design Supports This Story:**
- **"Proven Better Than" Claims:** Superiority allows marketing claims like "clinically proven to reduce depression symptoms significantly more than control"
- **Payer Value Proposition:** Payers want to see that DTx adds value. Superiority demonstrates that paying for MindPath CBT results in better patient outcomes than not paying for intervention.
- **Differentiation:** In an emerging DTx market, being able to say "superior to control" is stronger than "not worse than control."

**Non-Inferiority Implications:**
- If MindPath CBT pursued non-inferiority to face-to-face CBT, the commercial story would be: "MindPath CBT is as good as therapy, but cheaper and more accessible."
- This is a valid strategy **IF** face-to-face CBT were the comparator. But it's not—sham is the comparator.
- Non-inferiority to sham makes no commercial sense.

**✅ Recommendation: Superiority design supports premium positioning and strong payer value proposition.**

---

#### 4. Sample Size & Feasibility

**Superiority = Smallest Sample Size**

For the same effect size and power, superiority trials require the **smallest sample size** compared to non-inferiority or equivalence:

**Rough Sample Size Comparison:**
(Assuming PHQ-9 change, effect size = 3 points, SD = 6, power = 80%, α = 0.05)

| Design Type | Sample Size (per arm) | Total N |
|-------------|------------------------|---------|
| **Superiority** | ~118 | ~236 |
| **Non-Inferiority** (Δ=1.5) | ~150-170 | ~300-340 |
| **Equivalence** (±Δ=3) | ~200-250 | ~400-500 |

*Note: Detailed calculation in UC_CD_007*

**Feasibility Impact:**
- Smaller N = Faster recruitment, lower cost, shorter timeline
- MindPath CBT can reach FDA submission ~6-12 months faster with superiority design
- Budget savings: ~$500K-1M (recruitment, site costs, monitoring)

**✅ Recommendation: Superiority design is most feasible from recruitment and budget perspective.**

---

#### 5. Statistical Specifications

**Hypothesis Formulation:**

- **Null Hypothesis (H0):** The mean change in PHQ-9 score from baseline to week 12 is equal between MindPath CBT and sham control.
  - Mathematically: μ_MindPath - μ_Sham = 0

- **Alternative Hypothesis (H1):** The mean change in PHQ-9 score from baseline to week 12 is greater in MindPath CBT compared to sham control (superiority).
  - Mathematically: μ_MindPath - μ_Sham > 0
  - Specifically: μ_MindPath - μ_Sham ≥ 3 points (MCID)

**Statistical Test:**
- **Primary Analysis:** ANCOVA (Analysis of Covariance) with baseline PHQ-9 as covariate
  - Alternative: Mixed model for repeated measures (MMRM) if multiple timepoints analyzed
- **Test Type:** Two-sided test, α = 0.05
  - Two-sided is standard and more conservative
  - One-sided could be considered but FDA may prefer two-sided for objectivity
- **Power:** 80% (standard) or 90% (more conservative, requires larger N)

**Effect Size:**
- **Target:** ≥3 point greater reduction in MindPath CBT vs. sham
- **Justification:** MCID for PHQ-9 is 3-5 points; 3 points is conservative and clinically meaningful

**Analysis Population:**
- **Primary:** Intent-to-Treat (ITT) - all randomized patients
- **Supportive:** Per-Protocol (PP) - patients who completed treatment per protocol
- **Sensitivity:** Multiple imputation for missing data

---

#### 6. Risk Assessment

| Risk Factor | Likelihood | Impact | Mitigation Strategy |
|-------------|------------|--------|---------------------|
| **Sham app shows larger improvement than expected** | MEDIUM | High - reduces effect size, may fail to show superiority | Design sham carefully with NO active CBT elements; pilot test sham to verify minimal effect |
| **MindPath CBT effect smaller than assumed** | MEDIUM | High - underpowered, may fail endpoint | Conduct pilot study to validate effect size; use conservative assumptions for sample size |
| **High attrition (>30%)** | MEDIUM | High - underpowered, missing data issues | Intensive retention strategies; digital reminders; compensation; intent-to-treat analysis with imputation |
| **FDA questions superiority design choice** | LOW | Low - easy to defend | Cite regulatory precedent (reSET, Somryst); emphasize sham comparator; document in Pre-Sub |
| **Engagement too low (dose-response absent)** | MEDIUM | Medium - unclear mechanism | Define minimum "dose" a priori; include engagement as secondary endpoint; UX optimization |

---

### REGULATORY STRATEGY

**FDA Pre-Submission Meeting Plan:**

**Timing:** 6 months before trial initiation

**Key Questions for FDA:**
1. "Is superiority design appropriate for MindPath CBT vs. sham control for De Novo submission?"
   - Expected FDA Answer: Yes, superiority is appropriate and preferred.

2. "Is PHQ-9 change an acceptable primary endpoint, given precedent in published literature?"
   - Expected FDA Answer: Yes, if well-justified and validated.

3. "What are FDA's expectations for sham control app design?"
   - Expected FDA Answer: Sham should be credible but lack active therapeutic elements; provide sham specifications.

**Documentation for Pre-Sub:**
- This trial design framework document
- Regulatory precedent analysis (reSET, Somryst)
- Endpoint justification from UC-01
- Sham app specifications

**Post-Meeting Actions:**
- Incorporate FDA feedback into final protocol
- Address any FDA concerns proactively
- Document FDA agreement with superiority design

---

### CONCLUSION

**FINAL RECOMMENDATION: SUPERIORITY TRIAL DESIGN**

**Summary of Decision:**
- ✅ **Comparator Alignment:** Sham control appropriate for superiority, not non-inferiority
- ✅ **Regulatory Alignment:** FDA precedent strongly supports superiority for De Novo DTx
- ✅ **Commercial Alignment:** Superiority enables "proven better than" claims and premium positioning
- ✅ **Feasibility:** Smallest sample size, fastest timeline, most cost-effective
- ✅ **Risk Profile:** Manageable risks with clear mitigation strategies

**Statistical Specifications:**
- Hypothesis: MindPath CBT superior to sham (μ_MindPath - μ_Sham ≥ 3 points)
- Test: Two-sided ANCOVA, α = 0.05, power = 80%
- Analysis: ITT primary, PP supportive

**Next Steps:**
1. Biostatistician calculates detailed sample size (UC_CD_007)
2. Proceed to Step 2.1: Design comparator & blinding strategy
3. Document decision in study protocol
4. Include in FDA Pre-Submission materials

---

**References:**
- FDA De Novo Decision Summaries: DEN170078 (reSET), DEN180056 (reSET-O), DEN190033 (Somryst)
- FDA Guidance: "Design Considerations for Pivotal Clinical Investigations for Medical Devices" (2013)
- ICH E9: "Statistical Principles for Clinical Trials" (1998)
```

---

#### **PROMPT 2.1.1: Comparator Selection & Design**

**Persona**: P01_CMO  
**Time**: 25 minutes  
**Complexity**: ADVANCED

```yaml
SYSTEM PROMPT:
You are a Chief Medical Officer with deep expertise in designing comparators and blinding strategies for digital therapeutic clinical trials. You understand the FDA's expectations for control groups and have successfully designed sham digital interventions for multiple DTx trials.

USER PROMPT:
I need to select and design the optimal comparator for my DTx RCT, including a comprehensive blinding strategy.

**Study Context:**
- DTx Product: {product_name}
- Indication: {target_indication}
- Trial Design: {superiority_non_inferiority_from_prompt_1.2.1}
- Primary Objective: {from_prompt_1.1.1}
- Intervention Duration: {weeks}

**Current Context:**
- Standard of Care: {current_treatments}
- Patient Recruitment Source: {where_patients_come_from}
- Budget Constraints: {high_medium_low}

**COMPARATOR OPTIONS TO EVALUATE:**

---

### OPTION 1: SHAM/ATTENTION CONTROL APP

**Description:**
A digital app that visually resembles the active DTx but lacks the therapeutic mechanism. Designed to control for:
- App usage (attention, time spent)
- Self-monitoring (tracking symptoms/behaviors)
- Expectancy effects (believing you're receiving treatment)
- Device/technology interaction

**Design Principles:**
1. **Visual Similarity:** Same look-and-feel as active app (colors, layout, navigation)
2. **Engagement Parity:** Similar time commitment and interaction frequency
3. **NO Active Elements:** Must NOT include therapeutic components (e.g., CBT techniques, skills training, therapeutic feedback)
4. **Credible Content:** Psychoeducation, general health information, neutral content

**Example Sham Components (for depression DTx):**
- ✅ Psychoeducation articles about depression (informational only, no skills)
- ✅ Mood tracking (data collected but NO personalized feedback/intervention)
- ✅ General wellness tips (sleep hygiene, nutrition - not behavioral activation)
- ✅ Progress dashboard (shows engagement, not therapeutic progress)
- ❌ CBT modules (e.g., thought challenging, behavioral activation)
- ❌ Personalized therapeutic feedback
- ❌ Skills training or practice exercises
- ❌ AI-driven therapeutic recommendations

**Pros:**
- **Best Blinding:** Participants don't know which app is "real" treatment
- **Controls for Non-Specific Effects:** Isolates active therapeutic elements
- **FDA Precedent:** Used successfully in reSET, Somryst
- **Ethical:** All participants receive an intervention (even if minimal)
- **Retention:** Similar engagement in both arms reduces differential dropout

**Cons:**
- **Development Cost:** Requires building sham app ($50-150K depending on complexity)
- **Sham Effect Risk:** Even minimal intervention may have some benefit (reduces effect size)
- **Blinding Integrity Risk:** If sham is poorly designed, participants may guess assignment
- **Regulatory Scrutiny:** FDA will evaluate whether sham is appropriate control

**When to Use:**
- ✅ Pivotal trials for FDA submission (De Novo, 510(k))
- ✅ When you want to isolate specific DTx effects
- ✅ When standard care is available (patients can receive usual care alongside trial)
- ✅ When budget allows for sham development

**Sample Size Impact:** Neutral (standard calculation applies)

**FDA Acceptability:** **HIGH** - FDA prefers sham/attention control for DTx pivotal trials

---

### OPTION 2: WAITLIST CONTROL

**Description:**
Participants randomized to waitlist receive NO intervention for X weeks, then receive active DTx after control period ends.

**Timeline:**
- Baseline assessment (Week 0)
- Waitlist period (Weeks 1-12) - NO intervention
- Primary endpoint assessment (Week 12)
- Crossover to active DTx (Weeks 13-24) - Waitlist participants receive DTx

**Pros:**
- **No Sham Development:** No additional app development cost
- **Clear Difference:** Easier to detect DTx effect (larger effect size)
- **Ethical Appeal:** All participants eventually receive DTx
- **Participant Appeal:** Promise of DTx access aids recruitment

**Cons:**
- **UNBLINDED:** Participants and providers know assignment (major bias risk)
- **High Expectation Bias:** Waitlist participants may seek other treatments, deteriorate due to hopelessness, or improve due to natural history
- **FDA Skepticism:** FDA questions validity of unblinded trials for pivotal submissions
- **Differential Dropout:** Waitlist arm often has higher attrition (30-40% vs. 15-20% in active arm)
- **Ethical Concerns:** Withholding potentially beneficial treatment for 12+ weeks
- **No Treatment-Emergent Data:** Cannot assess if DTx causes harm vs. control receiving same content

**When to Use:**
- ✅ Early feasibility/pilot studies (not pivotal trials)
- ✅ When blinding is impossible or unnecessary
- ✅ When rapid recruitment is priority (waitlist appeals to participants)
- ❌ NOT for FDA pivotal trials (FDA strongly prefers blinded designs)

**Sample Size Impact:** May reduce required N (larger effect size due to no placebo effect in waitlist), but differential dropout may negate this advantage

**FDA Acceptability:** **LOW** for pivotal trials; **MEDIUM** for exploratory studies

---

### OPTION 3: TREATMENT-AS-USUAL (TAU)

**Description:**
Participants continue their current standard of care (medications, therapy, etc.) without any study-provided intervention. DTx arm receives DTx PLUS usual care.

**Design:**
- TAU arm: Continue current treatments (antidepressants, therapy, etc.)
- DTx arm: Receive DTx + continue current treatments

**Pros:**
- **Real-World Comparison:** Assesses added value of DTx to standard care
- **Pragmatic:** Reflects clinical practice (DTx would be adjunctive)
- **No Sham Development:** Cost-effective
- **Ethical:** No treatment withdrawal

**Cons:**
- **TAU Heterogeneity:** Standard care varies widely (some patients on meds, some in therapy, some both, some neither)
- **Unblinded:** Participants know assignment
- **Difficult to Interpret:** Hard to attribute results to DTx vs. changes in TAU
- **Adjunctive vs. Monotherapy:** Not clear if DTx works alone or only as add-on
- **Adherence Variability:** TAU adherence is uncontrolled and unmeasured
- **FDA Questions:** Agency prefers controlled comparisons

**When to Use:**
- ✅ Pragmatic effectiveness trials (post-approval)
- ✅ Payer-focused studies (demonstrating value as adjunctive intervention)
- ✅ When DTx is clearly intended as add-on to standard care, not monotherapy
- ❌ NOT ideal for FDA pivotal trials (prefer more controlled comparators)

**Sample Size Impact:** May require larger N due to heterogeneity and smaller effect size

**FDA Acceptability:** **MEDIUM** - acceptable for adjunctive indications, but agency prefers more controlled designs

---

### OPTION 4: ACTIVE COMPARATOR (Another Intervention)

**Description:**
Compare DTx head-to-head with established active treatment (e.g., face-to-face CBT therapy, another DTx, medication).

**Examples:**
- MindPath CBT app vs. face-to-face CBT therapy (8-12 sessions with therapist)
- DTx-A vs. DTx-B (competitive comparison)
- DTx vs. antidepressant medication (SSRI)

**Pros:**
- **Head-to-Head Evidence:** Directly compares effectiveness
- **Payer Value:** Demonstrates DTx is "as good as" or "better than" established treatment
- **Real Equipoise:** If both interventions have evidence, true clinical equipoise exists

**Cons:**
- **Requires Both Interventions:** Must deliver active comparator with high fidelity
- **Large Sample Size:** Non-inferiority or equivalence designs require much larger N
- **High Cost:** Delivering face-to-face therapy or active comparator is expensive
- **Recruitment Challenges:** Harder to recruit if active comparator is already available
- **FDA Scrutiny:** Must justify non-inferiority margin rigorously

**When to Use:**
- ✅ Post-approval comparative effectiveness studies
- ✅ When payers demand head-to-head vs. standard of care
- ✅ When DTx company wants to demonstrate superiority over competitor
- ❌ RARELY used for first-in-class DTx pivotal trials (too expensive, complex)

**Sample Size Impact:** Large N required (non-inferiority/equivalence design)

**FDA Acceptability:** **MEDIUM-HIGH** if comparator is gold standard and design is rigorous

---

### OPTION 5: NO TREATMENT CONTROL

**Description:**
Participants receive no intervention, no app, no contact beyond study assessments.

**Pros:**
- **Simplest:** No comparator development
- **Maximum Effect Size:** Largest difference between DTx and control

**Cons:**
- **UNETHICAL:** Inappropriate if effective treatments exist
- **Retention Issues:** No engagement, high dropout
- **FDA Unacceptable:** For conditions with available treatments, FDA will not accept no-treatment control
- **Nocebo Effect:** Patients may deteriorate due to lack of care

**When to Use:**
- ❌ RARELY appropriate for DTx trials
- Only if: (1) no effective treatments exist, AND (2) condition is self-limiting/non-serious

**FDA Acceptability:** **VERY LOW** for most indications

---

**YOUR TASK:**

1. **SELECT OPTIMAL COMPARATOR:**
   - Which comparator is most appropriate for your trial?
   - Provide detailed rationale

2. **DESIGN COMPARATOR (if sham app):**
   - Specify sham app components in detail
   - What content is included?
   - What content is explicitly EXCLUDED?
   - How does sham match active app in engagement?

3. **BLINDING STRATEGY:**
   - Who is blinded? (Participant, Investigator, Assessor, Statistician)
   - How is blinding maintained?
   - How is allocation concealment ensured?
   - What is the blinding assessment plan?

4. **RISK MITIGATION:**
   - What threatens blinding integrity?
   - What if sham shows unexpected benefit?
   - How to handle unblinding events?

5. **REGULATORY JUSTIFICATION:**
   - Why will FDA accept this comparator?
   - What precedent supports this choice?
   - What documentation is needed?

**OUTPUT FORMAT:**
- Comparator Selection Decision (1 page)
- Sham App Specifications (2-3 pages if applicable)
- Blinding Strategy Document (2 pages)
- Risk Mitigation Plan (1 page)

**CRITICAL REQUIREMENTS:**
- Comparator must align with trial design type (superiority/non-inferiority)
- Sham app must NOT include active therapeutic elements
- Blinding strategy must be detailed and feasible
- FDA precedent must be cited
```

**EXAMPLE INPUT:**

```yaml
product_name: "MindPath CBT"
target_indication: "Moderate Major Depressive Disorder (MDD)"
superiority_non_inferiority_from_prompt_1.2.1: "Superiority"
from_prompt_1.1.1: "To demonstrate the superiority of MindPath CBT mobile app compared to sham control app..."
weeks: "12 weeks"
current_treatments: "Antidepressant medications (SSRIs/SNRIs) and face-to-face psychotherapy (CBT, IPT)"
where_patients_come_from: "Primary care clinics, psychiatry clinics, community mental health centers, digital recruitment (social media, patient registries)"
high_medium_low: "Medium budget - can invest $75-100K in sham app development"
```

**EXAMPLE OUTPUT:**

```markdown
# COMPARATOR SELECTION & BLINDING STRATEGY
## MindPath CBT for Moderate Major Depressive Disorder

### EXECUTIVE SUMMARY

**RECOMMENDED COMPARATOR: SHAM/ATTENTION CONTROL APP**

For the MindPath CBT pivotal RCT, the optimal comparator is a **sham/attention control app** that visually resembles MindPath CBT but lacks active cognitive behavioral therapy elements. This comparator:
- ✅ Supports superiority trial design
- ✅ Maximizes blinding to reduce bias
- ✅ Has FDA precedent (Somryst, reSET)
- ✅ Controls for non-specific effects (app usage, self-monitoring, expectancy)
- ✅ Is ethical (all participants receive an app)

**Blinding Strategy:** Double-blind design with participants, investigators, and outcome assessors blinded to treatment assignment.

---

### 1. COMPARATOR SELECTION DECISION

**CHOICE: Sham/Attention Control App**

**Rationale:**

**Why Not Waitlist Control?**
- Waitlist is unblinded → high risk of expectation bias and differential dropout
- FDA strongly prefers blinded designs for pivotal trials
- Precedent: No DTx has received De Novo clearance using waitlist as primary comparator in pivotal trial
- Risk: FDA may require additional blinded trial, delaying approval by 12-18 months

**Why Not Treatment-as-Usual (TAU)?**
- TAU is heterogeneous (some patients on SSRIs, some in therapy, some neither)
- TAU is unblinded
- TAU doesn't isolate DTx-specific effects (attributability problem)
- Better suited for post-approval pragmatic effectiveness studies

**Why Not Active Comparator (face-to-face CBT)?**
- Would require non-inferiority design (larger sample size, ~300-340 vs. ~236 for superiority)
- Delivering high-fidelity face-to-face CBT across multiple sites is expensive ($250K-500K for therapist training, supervision, fidelity monitoring)
- Recruitment challenges (patients with access to therapy less likely to enroll)
- Timeline: Would add 6-12 months to study
- **Better as post-approval study** to demonstrate "as good as" face-to-face therapy for payers

**Why Sham App is Optimal:**
1. **Supports Superiority Design:** Sham is an appropriate control for demonstrating DTx is better than minimal intervention
2. **FDA Precedent:** Somryst (insomnia DTx) used sham app and received De Novo clearance (DEN190033)
3. **Blinding:** Participants don't know which app is active, reducing expectation bias
4. **Controls Non-Specific Effects:** Isolates active CBT elements from app usage, self-monitoring, attention
5. **Ethical:** All participants receive an app (not "nothing")
6. **Retention:** Similar engagement in both arms reduces differential dropout
7. **Budget-Feasible:** Sham app can be developed for $75-100K (within budget)

**Decision:** **Sham/Attention Control App**

---

### 2. SHAM APP SPECIFICATIONS

**CRITICAL PRINCIPLE: Sham app must be credible but LACK active CBT therapeutic elements.**

#### Overview
The sham app (working title: "MindPath Lite") will:
- **Look similar** to MindPath CBT (same branding, colors, navigation)
- **Provide psychoeducation** about depression (informational only)
- **Include mood tracking** (data collected but NO therapeutic feedback)
- **Match time commitment** (~20-30 min/week, same as active app)
- **NOT include** CBT modules, skills training, therapeutic feedback, or AI-driven recommendations

---

#### Detailed Component Specifications

| Feature | MindPath CBT (Active App) | MindPath Lite (Sham App) |
|---------|--------------------------|--------------------------|
| **Onboarding** | Interactive, personalized goal-setting | Standard onboarding, no personalization |
| **Home Dashboard** | Personalized therapeutic progress | Generic wellness dashboard |
| **Mood Tracking** | Daily mood + context + therapeutic feedback | Daily mood only, no feedback |
| **Educational Content** | CBT psychoeducation + skills training | General depression psychoeducation (no CBT skills) |
| **Behavioral Activation** | ✅ Module with activity scheduling, pleasurable activities, goal-setting | ❌ NOT included |
| **Cognitive Restructuring** | ✅ Module with thought records, cognitive distortions, reframing | ❌ NOT included |
| **Problem-Solving** | ✅ Module with structured problem-solving steps | ❌ NOT included |
| **Relaxation** | ✅ Guided relaxation with therapeutic intent | ✅ Generic relaxation audio (non-therapeutic) |
| **Progress Reports** | Weekly therapeutic progress with insights | Weekly engagement report (no therapeutic insights) |
| **Reminders** | ✅ Personalized therapeutic reminders | ✅ Generic reminders to use app |
| **AI/Personalization** | ✅ Adaptive content based on user data | ❌ Static content, no adaptation |
| **Therapist Chat (if applicable)** | ✅ Access to coaching/support | ❌ NOT included |

---

#### Sham App User Journey (Week-by-Week)

**Week 1-2: Onboarding & Baseline**
- Sham: Complete onboarding, read "Understanding Depression" articles, start daily mood tracking
- Active: Complete onboarding, set therapy goals, start CBT Module 1 (Behavioral Activation), mood tracking

**Week 3-4: Psychoeducation**
- Sham: Read articles on "Symptoms of Depression," "Depression and the Brain," "Getting Support"
- Active: Complete Module 2 (Cognitive Restructuring), practice thought records

**Week 5-8: Continued Content**
- Sham: Read articles on "Sleep and Mood," "Exercise and Mental Health," "Nutrition Basics"
- Active: Complete Modules 3-4 (Problem-Solving, Relapse Prevention), mood tracking with feedback

**Week 9-12: Maintenance**
- Sham: Review past articles, continue mood tracking, receive engagement report
- Active: Consolidate skills, receive personalized relapse prevention plan, prepare for maintenance

**Key Difference:** Sham provides information (passive learning), while active provides skills training and personalized therapeutic intervention (active learning + practice).

---

#### Content Examples

**SHAM APP - "Understanding Depression" Article (Sample):**
```
Depression is a common mental health condition affecting millions of people.

Symptoms of depression include:
- Persistent sad mood
- Loss of interest in activities
- Changes in sleep or appetite
- Fatigue
- Difficulty concentrating

Depression is treatable. Common treatments include medication (antidepressants) and psychotherapy (such as cognitive behavioral therapy).

If you're experiencing depression, it's important to seek help from a healthcare provider.
```

**→ Note: This is psychoeducation only, no actionable CBT skills.**

**ACTIVE APP - "Behavioral Activation Module" (Sample):**
```
Behavioral Activation is a proven CBT technique to combat depression.

When we're depressed, we often withdraw from activities we used to enjoy. This creates a cycle: less activity → worse mood → even less activity.

Behavioral Activation breaks this cycle by:
1. Identifying activities that give you pleasure or a sense of accomplishment
2. Scheduling these activities into your week
3. Tracking your mood before and after activities
4. Noticing how activity improves mood

YOUR TASK THIS WEEK:
- Choose 3 pleasurable activities from the list below
- Schedule them in your calendar (at least 1 per day)
- Complete the activities and rate your mood after each

[Interactive activity selection tool]
[Calendar scheduling feature]
[Mood tracking with feedback: "Great! You did Activity X and your mood improved by 2 points!"]
```

**→ Note: This is active skills training with personalized feedback - NOT in sham app.**

---

#### Blinding Integrity Protections

**How to Prevent Participants from Guessing Assignment:**

1. **Consistent Branding:** Both apps use "MindPath" branding
2. **Similar Engagement:** Both require ~20-30 min/week
3. **Both "Do Something":** Sham isn't passive; participants read articles and track mood (feels active)
4. **No Explicit Labels:** Don't call them "Active" vs. "Sham" in any participant-facing materials
5. **Informed Consent:** "You will be randomly assigned to one of two versions of the MindPath app. Both versions are designed to help with depression, but they use different approaches. You won't know which version you receive."
6. **Pilot Testing:** Test sham app with 10-15 participants to ensure it feels credible and doesn't raise suspicion

---

### 3. BLINDING STRATEGY

#### Who is Blinded?

| Role | Blinded? | How Blinding is Maintained |
|------|----------|----------------------------|
| **Participants** | ✅ YES | Randomized to "MindPath App A" or "MindPath App B" (no mention of "active" vs. "sham") |
| **Site Investigators** | ✅ YES | Investigators don't know assignment; apps distributed via centralized system |
| **Outcome Assessors** | ✅ YES | PHQ-9 is self-report (participant completes via app/online portal); assessors don't see app assignment |
| **Statistician** | ✅ YES | Data coded as "Group A" and "Group B" until final analysis; unblinding only after database lock |
| **CRO Staff** | ✅ YES | Data entry and monitoring staff don't have access to assignment |
| **App Developers** | ❌ NO | Developers know which is active/sham (necessary for technical support), but have no participant contact |

#### Allocation Concealment

**Randomization System:**
- Centralized web-based randomization system (IWRS/IVRS)
- Randomization performed AFTER baseline assessments complete
- Stratification factors: Site, baseline PHQ-9 severity (10-14 vs. 15-19)
- Block randomization (block size 4 or 6, randomly varied)

**App Distribution:**
- Participants receive unique login credentials via email
- App assignment linked to credentials in backend (participants see generic "MindPath" app)
- Both apps available on same app stores (no visual difference in download)

#### Blinding Assessment

**End-of-Study Blinding Survey:**

At week 12, participants will complete a blinding assessment survey:

1. "Which version of the MindPath app do you think you received?"
   - Version A
   - Version B
   - I don't know

2. "How confident are you in your guess?"
   - Very confident
   - Somewhat confident
   - Not confident / Just guessing

3. "Did you feel like you received an active treatment?"
   - Yes
   - No
   - Unsure

**Analysis:**
- Calculate proportion correctly guessing assignment
- Success criterion: <60% correct guesses (near chance = 50%)
- If >60% correct, blinding may have been compromised (sensitivity analysis)

#### Unblinding Procedures

**Emergency Unblinding:**
- Available 24/7 for safety events (e.g., serious suicidal ideation, adverse event requiring knowledge of intervention)
- Investigator contacts medical monitor → Randomization system provides assignment
- Participant can continue in study if appropriate
- Unblinding events documented and reviewed

**Planned Unblinding:**
- Final unblinding after database lock and primary analysis complete
- Secondary analyses may use unblinded data

---

### 4. RISK MITIGATION PLAN

| Risk Factor | Likelihood | Impact | Mitigation Strategy |
|-------------|------------|--------|---------------------|
| **Sham app shows larger benefit than expected** | MEDIUM | HIGH | (1) Design sham carefully to lack active CBT elements; (2) Pilot test sham to verify minimal effect; (3) Monitor mood changes in sham arm during trial; (4) If sham effect large, emphasize superiority still achieved |
| **Participants guess assignment (blinding failure)** | MEDIUM | MEDIUM | (1) Ensure sham is credible and engaging; (2) Don't use terms like "active" vs. "control" with participants; (3) Conduct blinding assessment; (4) Sensitivity analysis excluding participants who correctly guessed |
| **Differential dropout (sham arm higher)** | MEDIUM | MEDIUM | (1) Intensive retention strategies in both arms; (2) Compensation equal in both arms; (3) Monitor dropout weekly and intervene early; (4) Intent-to-treat analysis |
| **Sham app technical issues** | LOW | MEDIUM | (1) Thorough testing of sham app before launch; (2) 24/7 technical support for both apps; (3) Monitor app crashes/errors; (4) Quick bug fixes |
| **FDA questions sham design** | LOW | MEDIUM | (1) Document sham rationale thoroughly; (2) Cite Somryst precedent; (3) Include in Pre-Sub materials; (4) Be prepared to justify each sham component |

**Key Mitigation Actions:**
1. **Pilot Test Sham App:** Recruit 10-15 participants to use sham app for 4 weeks. Assess: (1) Is it engaging? (2) Do they suspect it's not "real" treatment? (3) Does it show unexpected therapeutic benefit?

2. **Monitor Sham Arm Closely:** If sham arm shows >1-point improvement in PHQ-9 (more than expected placebo), this could reduce effect size. Be prepared to adjust sample size if needed.

3. **Document Everything:** Create detailed sham app specifications document for FDA. Clearly articulate why each component is included/excluded.

---

### 5. REGULATORY JUSTIFICATION

#### FDA Precedent

**Somryst (DEN190033) - Chronic Insomnia DTx**
- **Comparator:** Sham/educational control app
- **Sham Design:** Provided sleep education but NO cognitive behavioral therapy for insomnia (CBT-I) techniques
- **Outcome:** FDA De Novo clearance in 2020
- **Key Learning:** FDA accepted sham control that provided information without active therapeutic techniques

**Why FDA Will Accept MindPath CBT Sham App:**

1. **Clear Precedent:** Somryst demonstrates FDA acceptance of sham app comparators for DTx pivotal trials

2. **Well-Controlled Design:** Sham controls for:
   - App usage and engagement
   - Self-monitoring (mood tracking)
   - Attention and expectancy effects
   - Technology/device interaction

3. **Superiority Design Alignment:** Sham is appropriate comparator for demonstrating superiority (DTx is better than minimal intervention)

4. **Ethical:** All participants receive an app; no one receives "nothing"

5. **Scientific Rigor:** Double-blind design minimizes bias

6. **Documented Rationale:** Detailed sham specifications show careful consideration of what is/isn't therapeutic

#### FDA Pre-Submission Strategy

**Recommended Topics for Pre-Sub:**

1. **Comparator Justification:**
   - "Is sham/attention control app an acceptable comparator for demonstrating MindPath CBT effectiveness?"
   - Provide: Sham app specifications, rationale for component inclusion/exclusion

2. **Blinding Strategy:**
   - "Is our blinding strategy adequate?"
   - Provide: Blinding procedures, allocation concealment, blinding assessment plan

3. **Sham Effect Concerns:**
   - "If sham arm shows modest improvement (<2 points PHQ-9), is this acceptable, or does it raise concerns?"
   - Discuss: Expectations for sham effect size, superiority margin remains clinically meaningful

**FDA's Expected Response:**
- Sham app is acceptable comparator ✅
- Ensure sham does not include active CBT elements ✅
- Document sham design thoroughly ✅
- Blinding strategy is adequate ✅
- Monitor sham effect size during trial ✅

---

### CONCLUSION

**FINAL RECOMMENDATION: Sham/Attention Control App**

The sham app comparator optimally supports the MindPath CBT pivotal trial by:
- ✅ Enabling superiority design (most feasible, FDA-preferred)
- ✅ Maximizing blinding to reduce bias
- ✅ Controlling for non-specific effects
- ✅ Providing regulatory precedent (Somryst)
- ✅ Being ethically sound (all participants receive app)
- ✅ Being budget-feasible ($75-100K development cost)

**Next Steps:**
1. Develop detailed sham app requirements document
2. Engage app development team to build sham app
3. Pilot test sham app with 10-15 participants
4. Include sham specifications in FDA Pre-Sub package
5. Proceed to Step 2.2: Develop Inclusion/Exclusion Criteria

---

**Appendices:**
- Appendix A: Detailed Sham App Wireframes (to be developed)
- Appendix B: Sham vs. Active App Feature Comparison Matrix
- Appendix C: Somryst De Novo Decision Summary (DEN190033)
```

---

*[Due to length constraints, I'll continue with a summary of the remaining prompts. The full document would continue with all 10 prompts in similar detail.]*

---

#### **Remaining Prompts Summary:**

**PROMPT 2.2.1: I/E Criteria Development** (35 min) - Develops comprehensive inclusion/exclusion criteria balancing validity, safety, and recruitment feasibility

**PROMPT 3.1.1: Intervention Protocol Specification** (20 min) - Defines precise intervention "dose," adherence monitoring, and fidelity measures

**PROMPT 3.2.1: Visit Schedule Planning** (15 min) - Creates assessment timeline optimizing data quality while minimizing patient burden

**PROMPT 4.1.1: Recruitment & Retention Strategy** (20 min) - Develops realistic recruitment plan with retention strategies

**PROMPT 4.2.1: Statistical Analysis Plan Overview** (30 min) - Outlines primary/secondary analyses, missing data handling, sensitivity analyses

**PROMPT 5.1.1: Regulatory & Ethics Planning** (12 min) - Plans FDA Pre-Sub meeting, IRB strategy, DSMB (if needed)

**PROMPT 5.2.1: Final RCT Design Documentation** (5 min) - Synthesizes all components into complete design document

---

## 7. PRACTICAL EXAMPLES & CASE STUDIES

[This section would include 2-3 complete worked examples similar to the MindPath CBT depression example, covering different indications and design challenges]

---

## 8. HOW-TO IMPLEMENTATION GUIDE

### 8.1 Getting Started
### 8.2 Common Pitfalls to Avoid
### 8.3 Time-Saving Tips
### 8.4 When to Involve External Consultants

---

## 9. SUCCESS METRICS & VALIDATION CRITERIA

### 9.1 Design Quality Metrics
### 9.2 FDA Acceptability Checklist
### 9.3 Feasibility Assessment
### 9.4 Stakeholder Alignment

---

## 10. TROUBLESHOOTING & FAQs

### 10.1 Common Design Challenges
### 10.2 FAQ: Comparator Selection
### 10.3 FAQ: Sample Size & Power
### 10.4 FAQ: FDA Interactions

---

## 11. APPENDICES

### 11.1 Glossary of Terms
### 11.2 Regulatory References
### 11.3 Template Documents
### 11.4 Additional Resources

---

**END OF UC-03 DOCUMENT**

**Document Status:** Phase 1 Complete (Prompts 1.1.1, 1.2.1, 2.1.1 detailed)  
**Remaining:** Complete detail for Prompts 2.2.1 through 5.2.1, Sections 7-11  
**Estimated Completion:** Additional 30-40 pages
