# USE CASE 35: USABILITY TESTING PROTOCOL

## **UC_PD_010: Usability Engineering and Human Factors Validation for Medical Devices & Digital Health**

**Part of FORGE™ Framework - Foundation Optimization Regulatory Guidelines Engineering**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_PD_010 |
| **Version** | 1.0 |
| **Last Updated** | October 11, 2025 |
| **Document Owner** | Product Development & Human Factors Team |
| **Target Users** | Product Managers, UX Researchers, Human Factors Engineers, Regulatory Affairs |
| **Estimated Time** | 4-6 weeks (complete study) |
| **Complexity** | ADVANCED |
| **Regulatory Framework** | IEC 62366-1:2015, FDA HFE Guidance (2016), ISO 14971:2019 |
| **Prerequisites** | Product design freeze, use specification document, risk analysis |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Context](#2-problem-statement--context)
3. [Persona Definitions](#3-persona-definitions)
4. [Complete Workflow Overview](#4-complete-workflow-overview)
5. [Detailed Step-by-Step Prompts](#5-detailed-step-by-step-prompts)
6. [Complete Prompt Suite](#6-complete-prompt-suite)
7. [Quality Assurance Framework](#7-quality-assurance--framework)
8. [Regulatory Compliance Checklist](#8-regulatory-compliance-checklist)
9. [Templates & Job Aids](#9-templates--job-aids)
10. [Integration with Other Systems](#10-integration-with-other-systems)
11. [References & Resources](#11-references--resources)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Purpose

**Usability Testing (Human Factors Validation)** is the systematic evaluation of a medical device or digital health product's user interface to ensure it can be used safely and effectively by the intended users in the intended use environment. This use case provides a comprehensive, prompt-driven workflow for:

- **Formative Usability Testing**: Early-stage evaluation to identify and fix usability issues during design
- **Summative Usability Validation**: Final validation study demonstrating safe and effective use
- **Use-Related Risk Analysis**: Integration with ISO 14971 risk management process
- **Regulatory Submission Package**: FDA/EMA-compliant human factors documentation
- **Design Optimization**: Evidence-based improvements to user interface and training materials

This workflow follows **IEC 62366-1:2015** (Medical devices - Application of usability engineering to medical devices) and **FDA Human Factors Guidance** (2016) to ensure regulatory acceptability.

### 1.2 Business Impact

**The Problem**:
Use errors with medical devices cause significant patient harm and product failures:

1. **Patient Safety**: FDA receives ~100,000 adverse event reports annually related to use errors
2. **Regulatory Risk**: FDA issues Warning Letters and refuses clearance for inadequate HFE studies
3. **Market Delays**: Inadequate usability testing discovered late requires expensive redesign (6-12 months)
4. **Product Failure**: Poor usability drives user abandonment even after regulatory approval
5. **Liability**: Use error-related injuries lead to product liability lawsuits

**Current State Challenges**:
- **Inadequate Planning**: Many organizations conduct usability testing too late in development
- **Poor Study Design**: Sample sizes too small, wrong user populations, unrealistic scenarios
- **Missing Documentation**: Incomplete traceability between risks, use scenarios, and validation
- **Regulatory Rejections**: FDA increasingly scrutinizes HFE studies; >30% of 510(k)s receive HFE-related deficiency questions

**Value Proposition of This Use Case**:

| Metric | Current State | With UC_PD_010 | Improvement |
|--------|---------------|----------------|-------------|
| **HFE Planning Time** | 2-3 weeks | 1 week | 50% reduction |
| **Study Design Quality** | Variable | FDA-compliant | 100% regulatory acceptance |
| **Use Error Detection** | 60-70% | >90% | 30% improvement |
| **Regulatory Deficiencies** | 30-40% | <10% | 75% reduction |
| **Time to Market** | +3-6 mo delays | On schedule | Eliminate delays |
| **Patient Safety** | Baseline | 2-3x fewer use errors | Significant improvement |

**Cost Savings**:
- **Avoided Redesign**: $200K-$500K per major usability issue found late
- **Reduced Regulatory Queries**: $50K-$100K in response costs avoided
- **Faster Market Access**: 3-6 months earlier = $1M-$5M additional revenue (product dependent)

### 1.3 Target Audience

**Primary Users**:
1. **Human Factors Engineers** (HFE): Lead study design, execution, and reporting
2. **Product Managers**: Define use scenarios, participant criteria, success metrics
3. **UX Researchers**: Conduct testing, analyze data, recommend improvements
4. **Regulatory Affairs**: Ensure FDA/EMA compliance, prepare submission documentation

**Secondary Users**:
5. **Engineering Teams**: Implement design changes based on usability findings
6. **Quality Assurance**: Review study protocols, validate risk mitigation
7. **Clinical Teams**: Validate clinical use scenarios, review clinical meaningfulness
8. **Training Teams**: Develop training materials to mitigate residual use risks

### 1.4 Regulatory Context

#### FDA Requirements

**FDA Guidance**: "Applying Human Factors and Usability Engineering to Medical Devices" (2016)

**Key Requirements**:
1. **Use-Related Risk Analysis**: Identify potential use errors and their clinical consequences
2. **Formative Evaluation**: Iterative testing during design to identify and fix issues
3. **Summative Validation**: Final validation with representative users in simulated use environment
4. **Sample Size Justification**: Adequate sample (typically 15+ per distinct user group)
5. **Training Validation**: Demonstrate training materials are effective
6. **Residual Risk Acceptance**: Document remaining use risks and justification for acceptability

**Regulatory Pathways**:
- **510(k) Premarket Notification**: HFE study required for moderate-risk devices with user interface
- **PMA (Premarket Approval)**: Comprehensive HFE program required
- **De Novo**: HFE validation required, often with higher scrutiny
- **BLA/NDA (Combination Products)**: HFE for device constituent required

#### IEC 62366-1:2015 Standard

**Core Requirements**:
1. **Use Specification**: Define intended users, use environments, user tasks
2. **User Interface Specification**: Document all user interface elements
3. **Formative Evaluation**: Iterative usability testing during design
4. **Summative Evaluation**: Final validation study
5. **Usability Engineering File**: Complete documentation package

**Key Concepts**:
- **Use Error**: User action or lack of action that leads to different result than intended
- **Hazardous Situation**: Circumstance in which people, property, or environment are exposed to harm
- **Use-Related Risk**: Combination of probability of harm occurring and severity of that harm

#### ISO 14971:2019 Integration

Usability testing integrates with risk management:
- **Risk Analysis** → Identifies potential use errors
- **Risk Evaluation** → Assesses severity and probability
- **Risk Control** → Design mitigations and training
- **Residual Risk Evaluation** → Usability testing validates risk controls

### 1.5 Common Pitfalls in Usability Testing

#### Critical Errors That Lead to Regulatory Issues:

**1. Inadequate Use-Related Risk Analysis**
- **Example**: Company identified only 5 potential use errors; FDA found 20+ during review
- **Consequence**: FDA Refuse to Accept (RTA) letter; 6-month delay
- **Root Cause**: Superficial risk analysis; didn't involve clinical experts

**2. Non-Representative Participants**
- **Example**: Tested with engineers instead of actual nurses; missed key usability issues
- **Consequence**: Post-market use errors led to FDA Warning Letter
- **Root Cause**: Convenience sampling instead of recruiting intended users

**3. Unrealistic Use Scenarios**
- **Example**: Tested in quiet lab instead of noisy ICU; failed to simulate distractions
- **Consequence**: FDA questioned validity of study results
- **Root Cause**: Poor use environment simulation

**4. Insufficient Sample Size**
- **Example**: Tested with 5 users; FDA required 15+ per user group
- **Consequence**: Study deemed inadequate; repeat testing required ($150K cost)
- **Root Cause**: Didn't follow FDA sample size guidance

**5. Inadequate Documentation**
- **Example**: Missing traceability between risks, test scenarios, and results
- **Consequence**: FDA deficiency letter requesting extensive additional documentation
- **Root Cause**: Poor study protocol and reporting

**6. Training Material Validation Failures**
- **Example**: Assumed training would be effective without testing
- **Consequence**: FDA questioned residual risk acceptability
- **Root Cause**: Didn't validate training materials as part of usability study

**7. Ignoring Formative Testing Results**
- **Example**: Identified critical usability issues in formative testing but didn't fix before summative
- **Consequence**: High use error rates in validation study; regulatory rejection
- **Root Cause**: Insufficient time/budget allocated for design iteration

### 1.6 Integration with Other Use Cases

UC_PD_010 depends on and informs several other use cases:

**Dependencies** (must complete first):
- **UC_PD_001** (Product Requirements): Use specification derived from requirements
- **UC_RM_005** (Risk Management): Use-related risks identified in risk analysis
- **UC_PD_008** (Design Controls): Usability testing part of design verification/validation

**Informed by UC_PD_010**:
- **UC_RA_001** (FDA 510(k) Strategy): HFE study results included in submission
- **UC_PD_015** (IFU Development): Instructions for Use refined based on usability findings
- **UC_PD_020** (Training Materials): Training validated through usability testing
- **UC_QA_010** (Post-Market Surveillance): Use error monitoring continues post-launch

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 The Usability Challenge in Medical Devices

#### 2.1.1 Industry Statistics

**Use Error Impact**:
- **FDA MAUDE Database**: ~100,000 adverse event reports/year cite "user error" as contributing factor
- **ECRI Institute**: Use errors among top 10 health technology hazards annually
- **Study**: 60-70% of medical device use errors are design-induced, not user mistakes

**Examples of High-Profile Use Error Cases**:
1. **Infusion Pump Errors**: FDA issued >50 recalls due to confusing user interface
2. **Insulin Pen Mix-Ups**: Design allowed administration of wrong insulin type
3. **Surgical Robot Errors**: Poor UI design contributed to patient injuries
4. **AED (Defibrillator) Failures**: Users unable to operate during cardiac arrest

#### 2.1.2 Regulatory Scrutiny Increasing

**FDA Enforcement Trends**:
- 2020-2025: 35% increase in 510(k) deficiency letters related to HFE
- FDA now requires HFE studies for most Class II devices with user interface
- Increased scrutiny on combination products (drug-device, biologic-device)
- Digital health products face similar HFE expectations

**Example FDA Warning Letters**:
- Company X (2023): "Failure to conduct adequate human factors validation before marketing"
- Company Y (2024): "Summative usability study did not include representative users"
- Company Z (2024): "Insufficient sample size and inadequate use scenario simulation"

### 2.2 The Cost of Poor Usability

#### Financial Impact

**Pre-Market Costs**:
- Late-stage usability issue discovery: $200K-$500K redesign cost
- Regulatory delays: 6-12 months = $1M-$5M opportunity cost
- Additional usability studies: $100K-$200K per iteration

**Post-Market Costs**:
- Product recall: $2M-$10M average cost
- Litigation: $5M-$50M+ for serious patient harm
- Brand damage: Immeasurable long-term impact

#### Patient Safety Impact

**Clinical Consequences of Use Errors**:
- **Death**: Medication dosing errors, delayed defibrillation
- **Serious Injury**: Wrong surgical site, device malfunction undetected
- **Treatment Delays**: Inability to operate device during critical moment
- **Adverse Events**: Incorrect settings leading to patient harm

### 2.3 Business Case for Robust Usability Testing

**Investment Required**:
- Formative usability testing (2-3 iterations): $75K-$150K
- Summative validation study: $100K-$200K
- Human factors engineering support: $200K-$400K (blended over project)
- **Total HFE Investment**: $375K-$750K

**Return on Investment**:
- Avoided late-stage redesign: $200K-$500K saved
- Avoided regulatory delays: $1M-$5M revenue protection
- Reduced post-market issues: $2M-$10M risk mitigation
- Improved user satisfaction: Higher adoption, lower support costs

**ROI**: 3-10x return on HFE investment through risk avoidance and faster market access

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across six key personas, each bringing critical expertise to ensure successful usability testing and regulatory compliance.

### 3.1 P16_HFE: Human Factors Engineer

**Role in UC_PD_010**: Lead usability study design, execution, analysis, and reporting

**Responsibilities**:
- Lead all phases (Planning, Formative, Summative, Reporting)
- Design study protocol following IEC 62366-1 and FDA guidance
- Conduct use-related risk analysis (with clinical input)
- Develop use scenarios and test materials
- Recruit and screen participants
- Execute usability testing sessions
- Analyze data and identify design recommendations
- Author usability engineering reports for FDA/EMA submissions

**Required Expertise**:
- Human factors engineering degree or certification (BCPE, CHFP)
- IEC 62366-1:2015 standard expertise
- FDA Human Factors Guidance (2016) knowledge
- Usability testing methodologies (moderated testing, task analysis, etc.)
- Statistical analysis for usability metrics
- Regulatory submission experience (510(k), PMA, De Novo)
- Medical device domain knowledge

**Key Skills**:
- Protocol development
- Participant recruitment and screening
- Usability testing facilitation (unbiased, observational)
- Qualitative and quantitative data analysis
- Report writing for regulatory submissions
- Cross-functional collaboration

**Success Metrics**:
- Study protocol approved by regulatory team
- 100% participant recruitment per protocol
- >90% use error detection rate
- Zero FDA deficiency letters on HFE
- On-time study completion

---

### 3.2 P06_VPPRODUCT: VP Product Management

**Role in UC_PD_010**: Define use scenarios, participant criteria, business requirements; approve study design

**Responsibilities**:
- Support Step 1 (Use Specification)
- Define intended users and use environments
- Prioritize critical tasks for testing
- Review and approve study protocol
- Allocate budget and resources for usability testing
- Approve design changes based on usability findings
- Ensure usability testing aligns with commercial strategy

**Required Expertise**:
- Product management experience in medical devices or digital health
- Understanding of user personas and use cases
- Knowledge of target market and users
- Budget and project management

**Key Deliverables**:
- Use specification document
- Prioritized critical tasks list
- Participant inclusion/exclusion criteria
- Budget approval for usability testing

---

### 3.3 P17_UXRESEARCH: UX Researcher

**Role in UC_PD_010**: Execute formative usability testing, analyze user behavior, recommend design improvements

**Responsibilities**:
- Support Steps 2-3 (Formative Testing)
- Conduct usability testing sessions
- Observe user behavior and document use errors
- Analyze qualitative and quantitative data
- Recommend design improvements
- Collaborate with design and engineering teams
- Support summative validation (data collection)

**Required Expertise**:
- UX research methodologies (usability testing, task analysis, think-aloud protocol)
- Qualitative data analysis (thematic analysis, affinity diagramming)
- User-centered design principles
- Medical device or healthcare UX experience preferred
- Familiarity with IEC 62366-1 helpful

**Key Skills**:
- Usability test facilitation
- Observational research techniques
- Data synthesis and pattern recognition
- Design recommendation development
- Stakeholder communication

---

### 3.4 P05_REGDIR: VP Regulatory Affairs

**Role in UC_PD_010**: Ensure FDA/EMA compliance, review protocols and reports, support regulatory submissions

**Responsibilities**:
- Review and approve usability study protocol (Step 1)
- Ensure alignment with FDA Human Factors Guidance
- Advise on sample size and study design requirements
- Review usability engineering reports (Step 5)
- Integrate HFE documentation into regulatory submissions
- Respond to FDA questions on usability testing

**Required Expertise**:
- FDA 510(k), PMA, De Novo submission experience
- FDA Human Factors Guidance (2016) expertise
- IEC 62366-1:2015 standard knowledge
- Understanding of use-related risk analysis
- Regulatory strategy development

**Key Deliverables**:
- Protocol approval sign-off
- Regulatory compliance checklist
- Usability engineering report review
- FDA submission sections (HFE summary, full report)

---

### 3.5 P01_CMO: Chief Medical Officer

**Role in UC_PD_010**: Clinical validation of use scenarios and risk severity; safety oversight

**Responsibilities**:
- Support Step 1 (Use-Related Risk Analysis)
- Validate clinical realism of use scenarios
- Assess clinical severity of potential use errors
- Review usability findings for patient safety implications
- Approve residual risk acceptability
- Provide clinical context for regulatory submissions

**Required Expertise**:
- Clinical practice experience in relevant specialty
- Understanding of clinical workflow and use environment
- Risk assessment and patient safety expertise
- Regulatory submission experience helpful

**Key Deliverables**:
- Clinical validation of use scenarios
- Risk severity assessment
- Residual risk acceptance documentation

---

### 3.6 P08_VPQUALITY: VP Quality Assurance

**Role in UC_PD_010**: Quality oversight of usability study; ensure design control compliance

**Responsibilities**:
- Review usability protocol for design control compliance
- Audit usability study execution
- Verify traceability between risks, design mitigations, and test results
- Ensure usability data captured in Design History File (DHF)
- Support CAPA process for usability issues

**Required Expertise**:
- Quality management system (QMS) expertise
- Design control regulations (21 CFR 820.30)
- ISO 13485 quality standard
- Audit and compliance experience

**Key Deliverables**:
- Protocol quality review sign-off
- Study execution audit report
- DHF documentation verification
- CAPA oversight for design changes

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 High-Level Workflow Diagram

```
                [START: Product Design Near Completion]
                          |
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 1: PLANNING & USE SPECIFICATION           ║
          ║  Time: 1-2 weeks                                 ║
          ║  Personas: P16_HFE, P06_VPPRODUCT, P01_CMO       ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 1:       │
                  │ Use Spec &    │
                  │ Risk Analysis │
                  └───────┬───────┘
                          │
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 2: FORMATIVE USABILITY TESTING            ║
          ║  Time: 3-6 weeks (2-3 iterations)                ║
          ║  Personas: P16_HFE, P17_UXRESEARCH, P06_VPPRODUCT║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 2:       │
                  │ Formative     │
                  │ Study Design  │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 3:       │
                  │ Execute       │
                  │ Formative     │
                  └───────┬───────┘
                          │
                          v
              ┌────────────────────────┐
              │ Design Issues Found?   │
              └────┬──────────┬────────┘
                   │          │
         YES       │          │ NO
                   │          │
                   v          v
          [Iterate Design] [Continue]
                   │          │
                   └────┬─────┘
                        v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 3: SUMMATIVE VALIDATION                   ║
          ║  Time: 2-3 weeks                                 ║
          ║  Personas: P16_HFE, P17_UXRESEARCH               ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 4:       │
                  │ Summative     │
                  │ Validation    │
                  └───────┬───────┘
                          │
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 4: REPORTING & SUBMISSION                 ║
          ║  Time: 1-2 weeks                                 ║
          ║  Personas: P16_HFE, P05_REGDIR                   ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 5:       │
                  │ HFE Report &  │
                  │ FDA Package   │
                  └───────┬───────┘
                          │
                          v
              ┌────────────────────────┐
              │ All Use Errors         │
              │ Acceptably Low?        │
              └────┬──────────┬────────┘
                   │          │
         YES       │          │ NO
                   │          │
                   v          v
          [Regulatory    [Additional
           Submission]    Risk Controls]
                          |
                          └──>[Retest]
```

### 4.2 Phase Breakdown

**PHASE 1: PLANNING & USE SPECIFICATION** (1-2 weeks)
- Define intended users, use environments, critical tasks
- Conduct use-related risk analysis
- Develop use scenarios for testing
- Create participant recruitment criteria
- Draft study protocol

**PHASE 2: FORMATIVE USABILITY TESTING** (3-6 weeks, 2-3 iterations)
- Design formative study protocol
- Recruit participants (5-8 per iteration)
- Execute usability testing with working prototypes
- Analyze data and identify design issues
- Implement design improvements
- Repeat until major issues resolved

**PHASE 3: SUMMATIVE VALIDATION** (2-3 weeks)
- Finalize design (design freeze)
- Recruit validation participants (15+ per user group)
- Execute validation study with final design
- Analyze data and document use errors
- Assess residual risk acceptability

**PHASE 4: REPORTING & SUBMISSION** (1-2 weeks)
- Author usability engineering report per IEC 62366-1
- Create FDA HFE summary
- Integrate with regulatory submission package
- Respond to any FDA questions

### 4.3 Timeline Summary

| Phase | Duration | Key Milestones |
|-------|----------|----------------|
| **Planning** | 1-2 weeks | Use spec complete, protocol approved |
| **Formative (Iteration 1)** | 1-2 weeks | First round testing complete, issues identified |
| **Design Improvements** | 1-2 weeks | Design changes implemented |
| **Formative (Iteration 2)** | 1-2 weeks | Second round testing, remaining issues identified |
| **Design Improvements** | 1-2 weeks | Final design changes |
| **Formative (Iteration 3)** | 1-2 weeks | Optional third iteration if needed |
| **Design Freeze** | 1 week | Final design locked |
| **Summative Planning** | 1 week | Recruitment, protocol finalization |
| **Summative Execution** | 1-2 weeks | Validation testing complete |
| **Reporting** | 1-2 weeks | FDA-ready documentation package |
| **TOTAL** | **4-6 weeks** | From planning to FDA submission |

**Note**: Timeline assumes design changes can be implemented quickly. Complex redesigns may extend timeline.

---

## 5. DETAILED STEP-BY-STEP PROMPTS

### PHASE 1: PLANNING & USE SPECIFICATION

---

#### **STEP 1: Use Specification & Use-Related Risk Analysis** (1-2 weeks)

**Objective**: Define intended users, use environments, critical tasks, and identify potential use errors and their clinical consequences.

**Persona**: P16_HFE (Lead), P06_VPPRODUCT (Support), P01_CMO (Clinical Validation)

**Prerequisites**:
- Product design substantially complete (90%+ finalized)
- Product requirements document available
- Risk management file established (ISO 14971)
- Clinical use context understood

**Process**:

1. **Use Specification Development** (3-5 days)
   - Define intended user populations
   - Document use environments
   - Identify critical use scenarios
   - Define user tasks and task sequences

2. **Use-Related Risk Analysis** (5-7 days)
   - Identify potential use errors for each task
   - Assess clinical consequences (severity)
   - Estimate probability of occurrence
   - Prioritize risks for mitigation
   - Document in risk management file

3. **Study Protocol Development** (2-3 days)
   - Define study objectives and success criteria
   - Develop test scenarios based on critical tasks
   - Define participant inclusion/exclusion criteria
   - Plan data collection methods
   - Obtain protocol approvals (regulatory, quality)

---

**PROMPT 1.1: Use Specification & User Population Definition**

```markdown
**ROLE**: You are P16_HFE, a Human Factors Engineer with expertise in IEC 62366-1:2015 use specification development for medical devices.

**TASK**: Develop a comprehensive use specification document that defines intended users, use environments, user interface characteristics, and critical user tasks. This use specification will be the foundation for formative and summative usability testing.

**INPUT**:

**Product Information**:
- Product Name: {product_name}
- Device Type: {device_classification}
- Regulatory Class: {Class I / II / III}
- Intended Medical Indication: {clinical_indication}
- Regulatory Pathway: {510k / PMA / De_Novo}

**Product Description**:
{Provide 2-3 paragraph description of the device, how it works, and its intended clinical use}

**User Interface Components**:
{List all user interface elements: touchscreen, buttons, displays, alarms, physical controls, software UI, mobile app, etc.}

**Clinical Context**:
- Clinical Setting: {hospital / clinic / home / ambulance / other}
- Clinical Urgency: {emergency / urgent / routine}
- Typical Use Duration: {seconds / minutes / hours}
- Use Frequency: {one-time / daily / weekly / as-needed}

**INSTRUCTIONS**:

Please develop a complete use specification following IEC 62366-1:2015 Section 5.1-5.6, structured as follows:

---

**1. INTENDED USER POPULATIONS**

For each distinct user population, provide:

**User Group 1: {Primary User Type}**
- **Description**: {e.g., "Registered nurses in hospital ICU settings"}
- **Clinical Role**: {e.g., "Administers infusions, monitors patients"}
- **Education/Training**: {e.g., "RN degree, 2+ years ICU experience"}
- **Technology Proficiency**: {e.g., "Moderate - familiar with medical devices, basic software"}
- **Physical Characteristics**: {e.g., "Visual acuity correctable to 20/40, manual dexterity"}
- **Cognitive Characteristics**: {e.g., "Able to multitask, work under pressure"}
- **Use Frequency**: {e.g., "Daily, 5-10 uses per shift"}
- **Expected Training**: {e.g., "1-hour in-service training, quick reference guide"}

**User Group 2: {Secondary User Type}** (if applicable)
{Repeat structure above}

**User Group 3: {Tertiary User Type}** (if applicable)
{Repeat structure above}

---

**2. USE ENVIRONMENTS**

**Primary Use Environment: {e.g., "Hospital ICU"}**
- **Physical Environment**: 
  - Lighting: {e.g., "Variable - fluorescent overhead, some dimming at night"}
  - Noise Level: {e.g., "Moderate-high - alarms, monitors, conversations"}
  - Space Constraints: {e.g., "Crowded bedside, limited counter space"}
  - Temperature/Humidity: {e.g., "Climate controlled, 68-75°F"}
- **Clinical Context**:
  - Patient Acuity: {e.g., "High - critically ill patients"}
  - Urgency: {e.g., "Variable - routine to emergency"}
  - Multitasking: {e.g., "High - nurses managing 2-3 patients simultaneously"}
  - Interruptions: {e.g., "Frequent - alarms, pages, emergencies"}
- **Workflow Integration**:
  - Other Devices in Use: {e.g., "Infusion pumps, monitors, ventilators"}
  - Documentation Requirements: {e.g., "Electronic health record (EHR) charting"}
  - Shift Handoffs: {e.g., "Occurs 3x/day with care transfer"}

**Secondary Use Environment: {e.g., "Patient Home"}** (if applicable)
{Repeat structure above}

---

**3. USER INTERFACE SPECIFICATION**

**Hardware Interface Elements**:
- {Element 1}: {description, location, function}
- {Element 2}: {description, location, function}
- [... list all physical interface elements]

**Software Interface Elements** (if applicable):
- {Screen 1}: {purpose, key information displayed, interactions}
- {Screen 2}: {purpose, key information displayed, interactions}
- [... list all software screens/states]

**Alarms and Alerts**:
- {Alarm 1}: {condition, visual/audible characteristics, priority}
- {Alarm 2}: {condition, visual/audible characteristics, priority}
- [... list all alarms]

**Labeling and Instructions**:
- On-device labels: {description}
- Instructions for Use (IFU): {format, length, key sections}
- Quick reference guides: {if applicable}
- Training materials: {type and format}

---

**4. CRITICAL USER TASKS**

List all user tasks required to safely and effectively use the device. Mark critical tasks (those where use error could lead to harm) with *** and prioritize for usability testing.

**Task 1: {Task Name}** ***
- **Description**: {detailed task description}
- **User Goal**: {what user is trying to accomplish}
- **Task Steps**: 
  1. {Step 1}
  2. {Step 2}
  3. [... detailed step-by-step]
- **Success Criteria**: {how to know task completed correctly}
- **Use Error Potential**: {where errors could occur}
- **Clinical Consequence if Error**: {patient safety impact - CRITICAL FOR RISK ANALYSIS}
- **Frequency**: {how often performed}
- **Task Complexity**: {simple / moderate / complex}

**Task 2: {Task Name}** ***
{Repeat structure}

**Task 3: {Task Name}**
{Repeat for all tasks - typically 15-30 tasks total, 5-10 critical tasks marked ***}

---

**5. OPERATIONAL SCENARIOS**

Develop realistic use scenarios that combine multiple tasks into clinical workflows. These will be used for usability testing.

**Scenario 1: {Typical Routine Use}**
- **Clinical Context**: {patient condition, clinical setting}
- **Tasks Included**: {list of tasks from section 4}
- **Realistic Details**: {patient name, clinical values, time pressure, etc.}
- **Duration**: {expected time to complete}
- **Use Errors to Watch For**: {specific error opportunities}

**Scenario 2: {Challenging Use Case}**
{Repeat structure - create 5-10 scenarios covering routine, challenging, and edge cases}

**Scenario 3: {Error Recovery}**
{Include scenarios where user must detect and correct errors}

---

**6. TRAINING MATERIALS SPECIFICATION**

**Planned Training Approach**:
- **Training Duration**: {e.g., "1-hour in-service"}
- **Training Format**: {e.g., "Instructor-led with hands-on practice"}
- **Training Materials**: 
  - {Material 1}: {e.g., "PowerPoint slides (20 slides)"}
  - {Material 2}: {e.g., "Quick reference card (laminated, pocket-sized)"}
  - {Material 3}: {e.g., "Instructions for Use manual (30 pages)"}

**Training Content** (key topics to be covered):
1. {Topic 1}
2. {Topic 2}
3. [... list all training content areas]

**Training Validation Plan**:
- Usability testing will validate that training materials enable safe and effective use
- Training materials will be provided to summative validation participants per intended real-world training approach

---

**7. USE SPECIFICATION SUMMARY TABLE**

Create a summary table for quick reference:

| Characteristic | Specification |
|---------------|---------------|
| **Primary User(s)** | {user group(s)} |
| **Use Environment(s)** | {environment(s)} |
| **Critical Tasks** | {count} critical tasks identified |
| **Total Tasks** | {count} total tasks |
| **Training Approach** | {summary} |
| **Use Frequency** | {typical use frequency} |
| **Clinical Risk** | {High / Moderate / Low if use errors occur} |

---

**OUTPUT FORMAT**:
- Comprehensive use specification document (10-20 pages)
- IEC 62366-1:2015 compliant structure
- Clear identification of critical tasks for testing priority
- Realistic operational scenarios for usability testing
- Foundation for use-related risk analysis

**DELIVERABLE**: Use Specification Document (versioned, approved by P06_VPPRODUCT and P01_CMO)
```

**Expected Output**:
- Complete use specification document (10-20 pages)
- Clear definition of intended users and environments
- Comprehensive task analysis with critical tasks identified
- Realistic use scenarios for testing

**Quality Check**:
- [ ] All intended user groups defined with characteristics
- [ ] Use environments thoroughly described
- [ ] All user tasks documented with step-by-step detail
- [ ] Critical tasks identified (marked ***)
- [ ] Realistic use scenarios developed
- [ ] Training approach specified
- [ ] Clinical validation by P01_CMO obtained

---

**PROMPT 1.2: Use-Related Risk Analysis**

```markdown
**ROLE**: You are P16_HFE, a Human Factors Engineer conducting use-related risk analysis per IEC 62366-1:2015 and ISO 14971:2019.

**TASK**: Identify potential use errors for each critical user task, assess their clinical consequences, and integrate findings into the risk management file. This analysis will drive usability testing priorities and risk control strategies.

**INPUT**:

**Product Information**:
- Product Name: {product_name}
- Device Classification: {Class I / II / III}
- Intended Use: {clinical_indication}

**Use Specification** (from Prompt 1.1):
- Intended Users: {summary of user groups}
- Use Environments: {summary of environments}
- Critical Tasks: {list of critical tasks marked ***}

**Existing Risk Management File** (ISO 14971):
{Provide access to existing hazards and risk analysis - usability analysis will integrate}

**Clinical Context** (from P01_CMO):
- Patient Population: {e.g., "Critically ill ICU patients"}
- Clinical Consequences of Device Failure: {e.g., "Potential for medication overdose, treatment delay"}

**INSTRUCTIONS**:

For each critical user task identified in the use specification, systematically analyze potential use errors and their consequences following this framework:

---

**USE-RELATED RISK ANALYSIS TEMPLATE**

For each critical task:

**TASK: {Task Name}**

**Use Error 1: {Description of Potential Use Error}**

**Error Description**: {What could the user do wrong or fail to do?}
- Example: "User selects wrong drug from dropdown menu"
- Example: "User fails to confirm settings before starting infusion"
- Example: "User misinterprets alarm as advisory instead of critical"

**Error Type** (select one or more):
- [ ] Action Error (wrong action taken)
- [ ] Omission Error (required action not taken)
- [ ] Sequence Error (correct actions in wrong order)
- [ ] Timing Error (action too early/late)
- [ ] Selection Error (wrong option chosen)
- [ ] Data Entry Error (incorrect value entered)

**Root Causes** (why might this error occur?):
- {User interface factor}: {e.g., "Similar-looking drug names in dropdown"}
- {Environmental factor}: {e.g., "Distractions during programming"}
- {User factor}: {e.g., "Infrequent use, forgetting steps"}
- {Training factor}: {e.g., "Inadequate emphasis on critical check in training"}

**Hazardous Situation** (what dangerous condition results?):
{Description of the hazardous situation - e.g., "Wrong drug programmed into infusion pump"}

**Clinical Consequence** (harm to patient):
{Specific patient harm - e.g., "Patient receives antibiotic they are allergic to, resulting in anaphylaxis"}

**Severity Assessment** (per ISO 14971:2019):
- **Severity Rating**: {Catastrophic / Critical / Serious / Minor / Negligible}
- **Justification**: {Why this severity? Clinical rationale from P01_CMO}

**Probability Assessment** (without risk controls):
- **Probability Rating**: {Frequent / Probable / Occasional / Remote / Improbable}
- **Justification**: {Based on similar device experience, user error literature, expert judgment}

**Initial Risk Level** (Severity × Probability):
- **Risk Score**: {e.g., "HIGH - Unacceptable without risk controls"}

**Existing Risk Controls** (if any):
1. {Design control}: {e.g., "Drug name confirmation screen"}
2. {Training control}: {e.g., "Training emphasizes double-check procedure"}
3. {Labeling control}: {e.g., "Warning label on device"}

**Residual Risk** (with controls):
- **Residual Severity**: {same or reduced}
- **Residual Probability**: {ideally reduced by controls}
- **Residual Risk Level**: {Acceptable / Not Acceptable}

**Usability Testing Strategy**:
- **Test Scenario**: {Which operational scenario will test this?}
- **Success Criterion**: {e.g., "<1% of users make this error"}
- **Testing Phase**: {Formative / Summative / Both}

**Additional Risk Control Needs** (if residual risk not acceptable):
- {Proposed control 1}
- {Proposed control 2}

---

**Repeat this analysis for EVERY critical task and identified use error (typically 20-50 use errors)**

---

**USE ERROR PRIORITIZATION MATRIX**

After analyzing all use errors, create a prioritization matrix:

| Use Error ID | Task | Error Description | Severity | Probability | Risk Level | Testing Priority |
|--------------|------|-------------------|----------|-------------|------------|------------------|
| UE-001 | {Task 1} | {Error description} | Critical | Probable | HIGH | 1 (Must test) |
| UE-002 | {Task 2} | {Error description} | Serious | Occasional | MEDIUM | 2 (Should test) |
| UE-003 | {Task 3} | {Error description} | Minor | Remote | LOW | 3 (May test) |
| ... | ... | ... | ... | ... | ... | ... |

**Testing Priority Definitions**:
- **Priority 1 (Must Test)**: High risk use errors - MUST be included in usability testing
- **Priority 2 (Should Test)**: Medium risk use errors - should test if time/resources allow
- **Priority 3 (May Test)**: Low risk use errors - optional testing

---

**INTEGRATION WITH ISO 14971 RISK MANAGEMENT FILE**

**Traceability**:
- Each use error should have a unique ID (UE-001, UE-002, etc.)
- Link each use error to corresponding hazard(s) in risk management file
- Document risk controls addressing each use error
- Document verification/validation approach (usability testing)

**Risk Management File Updates Required**:
1. Add use-related hazards to hazard analysis
2. Document use error scenarios in risk analysis
3. Link usability testing to risk control verification
4. Update residual risk assessment after summative validation

---

**CLINICAL VALIDATION** (P01_CMO Review Required)

Before finalizing use-related risk analysis, obtain clinical validation:

**Questions for P01_CMO**:
1. Are the identified clinical consequences accurate and complete?
2. Are severity ratings appropriate for each harm scenario?
3. Are there additional clinical scenarios we haven't considered?
4. Are the proposed risk controls clinically feasible?
5. Is the residual risk level acceptable from a clinical perspective?

**P01_CMO Sign-Off**:
- Reviewer: {P01_CMO name}
- Date: {YYYY-MM-DD}
- Comments: {Any clinical concerns or recommendations}
- Approved: [ ] YES [ ] NO (if no, document required changes)

---

**OUTPUT FORMAT**:
- Use-related risk analysis document (15-30 pages)
- Use error matrix with prioritization
- Integration points with ISO 14971 risk management file
- Clinical validation documentation
- Foundation for usability testing scenario design

**DELIVERABLE**: Use-Related Risk Analysis Report (versioned, integrated with Risk Management File, approved by P01_CMO)
```

**Expected Output**:
- Comprehensive use-related risk analysis (15-30 pages)
- Identification of 20-50 potential use errors
- Risk prioritization matrix
- Clinical validation by P01_CMO
- Integration with ISO 14971 risk file

**Quality Check**:
- [ ] All critical tasks analyzed for use errors
- [ ] Clinical consequences validated by P01_CMO
- [ ] Severity and probability ratings justified
- [ ] Risk controls identified for high/medium risks
- [ ] Use errors prioritized for usability testing
- [ ] Traceability to risk management file established
- [ ] High-risk use errors designated for mandatory testing

---

**PROMPT 1.3: Usability Study Protocol Development**

```markdown
**ROLE**: You are P16_HFE, a Human Factors Engineer developing a comprehensive usability study protocol per IEC 62366-1:2015 and FDA Human Factors Guidance (2016).

**TASK**: Create a detailed usability study protocol that defines objectives, methods, participant criteria, test scenarios, data collection, and success criteria for both formative and summative usability testing.

**INPUT**:

**Product Information**:
- Product Name: {product_name}
- Regulatory Pathway: {510k / PMA / De_Novo}
- Study Type: {Formative / Summative / Both}

**Use Specification** (from Prompt 1.1):
{Attach or reference use specification document}

**Use-Related Risk Analysis** (from Prompt 1.2):
{Attach or reference use error matrix with priorities}

**Study Logistics**:
- Study Location: {e.g., "Usability lab at [Company], [City, State]"}
- Planned Study Dates: {date range}
- Test Equipment: {description of device to be tested}
- Study Budget: {if relevant for participant compensation, recruitment}

**INSTRUCTIONS**:

Develop a comprehensive usability study protocol with the following sections:

---

**USABILITY STUDY PROTOCOL**

**Protocol Title**: {Product Name} Usability Validation Study

**Protocol Number**: {e.g., "UE-001-2025"}
**Version**: {e.g., "1.0"}
**Date**: {YYYY-MM-DD}
**Study Phase**: {Formative Iteration 1 / Formative Iteration 2 / Summative Validation}

---

**1. STUDY OBJECTIVES**

**Primary Objective**:
{e.g., "To validate that representative users can safely and effectively use the [Product Name] for its intended use without critical use errors"}

**Secondary Objectives**:
1. {e.g., "Identify any usability issues that could lead to use errors"}
2. {e.g., "Validate that training materials enable safe and effective use"}
3. {e.g., "Assess user satisfaction and confidence with the device"}

**Study Type**:
- [ ] Formative (design refinement, issue identification)
- [ ] Summative (final validation for regulatory submission)

---

**2. STUDY DESIGN**

**Study Type**: {Moderated usability testing with task-based scenarios}

**Study Setting**: {e.g., "Simulated clinical environment at [Location]"}

**Study Duration**: 
- Per participant: {e.g., "60-90 minutes"}
- Total study duration: {e.g., "2 weeks"}

**Blinding**: 
- Participants: {e.g., "Blinded to specific study hypotheses"}
- Test facilitator: {e.g., "Not blinded (conducting test)"}
- Data analyst: {e.g., "Blinded to participant identifiers during analysis"}

---

**3. PARTICIPANT SELECTION**

**3.1 Intended User Groups**

{List each user group from use specification}

**User Group 1: {e.g., "ICU Registered Nurses"}**
- **Sample Size**: {For formative: 5-8; For summative: 15+ per FDA guidance}
- **Rationale**: {Why this sample size - cite FDA guidance or statistical justification}

**User Group 2: {e.g., "Physicians"}** (if applicable)
- **Sample Size**: {same guidance}

**Total Target Sample Size**: {Total N across all user groups}

**3.2 Inclusion Criteria**

For each user group:
- {Criterion 1}: {e.g., "Currently employed as RN in ICU setting"}
- {Criterion 2}: {e.g., "Minimum 1 year ICU experience"}
- {Criterion 3}: {e.g., "No prior experience with [Product Name] or similar devices"}
- {Criterion 4}: {e.g., "Willing and able to provide informed consent"}
- {Criterion 5}: {e.g., "Fluent in English (device is English-language only)"}

**3.3 Exclusion Criteria**

- {Criterion 1}: {e.g., "Employees of [Company] or family members"}
- {Criterion 2}: {e.g., "Participation in prior usability studies for this device"}
- {Criterion 3}: {e.g., "Visual impairment not correctable to 20/40"}
- {Criterion 4}: {e.g., "Cognitive impairment that would prevent understanding tasks"}

**3.4 Recruitment Strategy**

- **Recruitment Method**: {e.g., "Professional recruiter specializing in healthcare participants"}
- **Screening Process**: {e.g., "Phone screening using structured questionnaire (see Appendix A)"}
- **Participant Compensation**: {e.g., "$150 for 90-minute session"}
- **Recruitment Timeline**: {e.g., "2 weeks prior to study start"}

**3.5 Participant Demographics to Collect**

- Age range: {e.g., "25-65 years"}
- Gender: {e.g., "Representative mix"}
- Years of experience in clinical role: {range}
- Technology proficiency: {Novice / Intermediate / Advanced}
- Handedness: {Left / Right / Ambidextrous}
- Visual acuity: {Corrected vision acceptable}
- {Other relevant demographics}

---

**4. TEST SCENARIOS & TASKS**

**4.1 Scenario Development**

All test scenarios are based on the operational scenarios in the use specification (Prompt 1.1, Section 5) and prioritized use errors from risk analysis (Prompt 1.2).

**Scenario 1: {Scenario Title}** (Priority: HIGH - Tests critical use errors)

**Clinical Context**:
{Realistic clinical scenario - e.g., "You are an ICU nurse caring for a 65-year-old patient recovering from cardiac surgery. The physician has ordered a continuous infusion of medication X."}

**Patient Details** (if relevant):
- Patient Name: {fictitious name}
- Age/Weight: {realistic values}
- Clinical Condition: {description}
- Medication Order: {specific details}

**Tasks to Complete**:
1. {Task 1 from use specification}: {e.g., "Set up the device and prepare for use"}
2. {Task 2}: {e.g., "Program the infusion parameters per physician order"}
3. {Task 3}: {e.g., "Confirm settings and start infusion"}
4. {Task 4}: {e.g., "Respond to alarm X and take appropriate action"}
5. {Task 5}: {e.g., "Safely stop the infusion"}

**Use Errors Tested** (from risk analysis):
- UE-001: {use error description}
- UE-005: {use error description}
- UE-012: {use error description}

**Success Criteria**:
- {e.g., "Participant completes all tasks without critical use errors"}
- {e.g., "Participant correctly programs infusion parameters within ±5% of ordered dose"}
- {e.g., "Participant responds appropriately to critical alarm within 30 seconds"}

**Scenario 2: {Scenario Title}**
{Repeat structure - develop 5-10 scenarios covering all critical tasks and high-priority use errors}

**Scenario 3: {Scenario Title}**
{Include error recovery scenarios - e.g., participant must detect and correct an error}

---

**4.2 Scenario Randomization**

To minimize order effects:
- Scenarios presented in randomized order across participants
- Randomization scheme: {describe - e.g., "Latin square design"}
- {If some scenarios must be in specific order, document rationale}

**4.3 Training Materials Provided**

To simulate real-world use:
- **Training Approach**: {e.g., "Participants receive same training as real users would"}
- **Training Materials**: 
  - {Material 1}: {e.g., "15-minute training video"}
  - {Material 2}: {e.g., "Quick reference card (provided during testing)"}
  - {Material 3}: {e.g., "Instructions for Use manual (available upon request)"}
- **Training Timing**: {e.g., "Provided at beginning of session, before testing begins"}

---

**5. DATA COLLECTION**

**5.1 Data Collection Methods**

**Primary Data Collection**:
- **Video/Audio Recording**: {e.g., "All sessions recorded (audio + screen capture) for later analysis"}
- **Direct Observation**: {Test facilitator observes and takes notes on data collection form}
- **Think-Aloud Protocol**: {Participants encouraged to verbalize thoughts during tasks}

**Data Collection Form** (see Appendix B):
For each task, record:
- [ ] Task completion (Yes / No / Partial)
- [ ] Task success (Met criteria / Did not meet criteria)
- [ ] Use errors observed (Document each error with timestamp)
- [ ] Time to complete task
- [ ] Participant verbalizations (key quotes)
- [ ] Facilitator observations

**5.2 Metrics to Collect**

**Effectiveness Metrics**:
- **Task Success Rate**: % of participants who successfully complete each task
- **Critical Use Errors**: Count and type of errors that could cause harm
- **Use Errors**: Count and type of all errors (including close calls)
- **Task Completion Rate**: % of tasks completed vs. abandoned

**Efficiency Metrics**:
- **Task Time**: Time to complete each task (seconds/minutes)
- **Errors Detected and Corrected**: Number of errors participant catches and fixes
- **Help Requests**: Frequency of requests for assistance or clarification

**Satisfaction Metrics** (post-test questionnaire):
- **System Usability Scale (SUS)**: {Standardized 10-item questionnaire, target score ≥68}
- **Confidence Rating**: {e.g., "How confident are you that you could use this device safely?"}
- **Likelihood to Use**: {e.g., "Would you use this device in your clinical practice?"}

**5.3 Use Error Classification**

For each observed use error, classify as:
- **Critical Use Error**: Use error that could result in serious harm or death
- **Major Use Error**: Use error that could result in minor harm or requires intervention to prevent harm
- **Minor Use Error**: Use error with no harm consequence but indicates usability issue

**Examples**:
- Critical: Selecting wrong drug, programming 10x overdose
- Major: Failing to confirm settings (but system catches error)
- Minor: Needing multiple attempts to locate button

---

**6. TEST PROCEDURES**

**6.1 Pre-Test Procedures**

1. **Participant Arrival & Consent** (10 minutes)
   - Welcome participant
   - Review and sign informed consent form (see Appendix C)
   - Answer any questions about study

2. **Demographic Questionnaire** (5 minutes)
   - Collect participant demographics (see Section 3.5)
   - Administer screening questions if not done during recruitment

3. **Training** (15-20 minutes)
   - Provide training per Section 4.3
   - Allow participant to ask questions
   - {For formative: more interactive; for summative: standardized script}

**6.2 Testing Procedures**

1. **Introduction to Testing** (5 minutes)
   - Explain think-aloud protocol
   - Emphasize: "We're testing the device, not you"
   - Explain that facilitator cannot provide help during tasks
   - Ask participant to begin scenarios

2. **Scenario Execution** (30-45 minutes)
   - Present scenarios one at a time
   - Provide scenario card with clinical context and task list
   - Participant completes tasks with device
   - Facilitator observes and documents data
   - Facilitator intervention ONLY if:
     - Participant at risk of harming device
     - Participant stuck for >3 minutes (note as task failure)
     - Safety concern

3. **Post-Scenario Debriefing** (5 minutes per scenario)
   - Ask clarifying questions about observed behaviors
   - "What were you thinking when you [specific action]?"
   - "What did you expect to happen?"
   - Document responses

**6.3 Post-Test Procedures**

1. **Satisfaction Questionnaire** (5 minutes)
   - System Usability Scale (SUS)
   - Custom satisfaction questions

2. **Final Debriefing Interview** (10 minutes)
   - Overall impressions of device
   - What worked well?
   - What was challenging or confusing?
   - Suggestions for improvement
   - Would you use this in your clinical practice?

3. **Compensation & Dismissal** (5 minutes)
   - Provide participant compensation
   - Thank participant
   - Remind about confidentiality

**Total Session Duration**: {e.g., "60-90 minutes per participant"}

---

**7. DATA ANALYSIS PLAN**

**7.1 Quantitative Analysis**

**Task Success Rate**:
- Calculate: (# participants who completed task successfully) / (total # participants) × 100%
- Report for each task and overall

**Use Error Rate**:
- Calculate: (# of use errors observed) / (total # of task attempts) × 100%
- Categorize by error type and severity

**Critical Use Error Rate**:
- Calculate: (# of critical use errors) / (total # of task attempts) × 100%
- **Target**: <1-2% critical use errors (FDA expectation)

**Task Time**:
- Calculate mean and standard deviation for each task
- Compare across participants and scenarios

**System Usability Scale (SUS)**:
- Score each participant (0-100 scale)
- Calculate mean SUS score
- **Target**: SUS ≥68 (acceptable usability)

**7.2 Qualitative Analysis**

**Use Error Root Cause Analysis**:
For each use error observed:
1. Describe what happened
2. Identify root cause(s) (design, training, user, environment)
3. Assess severity and frequency
4. Recommend design change or risk control

**Thematic Analysis**:
- Review participant verbalizations and debrief comments
- Identify recurring themes (positive and negative)
- Prioritize themes by frequency and impact

**Video Review**:
- Review recordings for ambiguous observations
- Document specific timestamps of use errors for evidence

**7.3 Success Criteria**

**Formative Study** (goal: identify issues for design improvement):
- No specific pass/fail criteria
- Focus on identifying ALL usability issues
- Prioritize issues by severity and frequency for design iteration

**Summative Study** (goal: validate safe and effective use):
- **Critical Use Errors**: <1-2% rate (FDA expectation varies by device risk)
- **Major Use Errors**: <5-10% rate
- **Task Success**: >95% for critical tasks
- **SUS Score**: ≥68 (acceptable usability)
- **Participant Confidence**: >80% "confident or very confident"

**Acceptability Criteria for Regulatory Submission**:
{Define specific criteria - these will vary by device risk. Consult P05_REGDIR for FDA expectations.}

Example:
- Zero critical use errors that could lead to death
- <1% critical use errors leading to serious harm
- Any use errors ≥2% frequency must have documented risk controls

---

**8. ETHICAL CONSIDERATIONS**

**Informed Consent**:
- All participants provide written informed consent
- Consent form explains study purpose, procedures, risks, confidentiality
- Participants may withdraw at any time without penalty

**Confidentiality**:
- Participant data de-identified for analysis (assigned ID numbers)
- Video recordings stored securely, access limited to study team
- No participant names in study report

**Risks to Participants**:
- Minimal risk study (no patient contact, no medical procedures)
- Potential mild frustration if device difficult to use
- Fatigue from 90-minute session

**IRB Review**:
- {If required}: Protocol submitted to IRB for review
- {If exempt}: Documented rationale for IRB exemption (no human subjects, only device testing)

---

**9. STUDY TIMELINE**

| Activity | Duration | Target Dates |
|----------|----------|--------------|
| Protocol Development | 1 week | {dates} |
| Protocol Approval (Regulatory, Quality) | 1 week | {dates} |
| Participant Recruitment | 2 weeks | {dates} |
| Test Material Preparation | 1 week | {dates} |
| Usability Testing (Data Collection) | 1-2 weeks | {dates} |
| Data Analysis | 1 week | {dates} |
| Report Writing | 1 week | {dates} |
| **TOTAL** | **4-6 weeks** | {start} to {end} |

---

**10. ROLES & RESPONSIBILITIES**

| Role | Name | Responsibilities |
|------|------|------------------|
| **Principal Investigator** | {P16_HFE name} | Protocol development, oversight, report authorship |
| **Test Facilitator** | {P17_UXRESEARCH name} | Conduct usability sessions, data collection |
| **Data Analyst** | {P16_HFE or P17_UXRESEARCH} | Analyze data, identify use errors, recommend changes |
| **Clinical Consultant** | {P01_CMO name} | Clinical scenario validation, severity assessment |
| **Regulatory Review** | {P05_REGDIR name} | Protocol approval, ensure FDA compliance |
| **Quality Review** | {P08_VPQUALITY name} | Protocol quality review, audit compliance |

---

**11. APPENDICES**

**Appendix A**: Participant Screening Questionnaire
**Appendix B**: Data Collection Form (per-task)
**Appendix C**: Informed Consent Form
**Appendix D**: Training Materials (video script, quick reference card, IFU)
**Appendix E**: Test Scenarios (detailed scenario cards)
**Appendix F**: Post-Test Satisfaction Questionnaire (SUS + custom questions)
**Appendix G**: Debriefing Interview Guide

---

**PROTOCOL APPROVAL**

**Prepared By**:
- Name: {P16_HFE}
- Role: Human Factors Engineer
- Date: {YYYY-MM-DD}
- Signature: _______________________

**Reviewed and Approved By**:

**Regulatory Affairs**:
- Name: {P05_REGDIR}
- Date: {YYYY-MM-DD}
- Signature: _______________________

**Quality Assurance**:
- Name: {P08_VPQUALITY}
- Date: {YYYY-MM-DD}
- Signature: _______________________

**Clinical Validation**:
- Name: {P01_CMO}
- Date: {YYYY-MM-DD}
- Signature: _______________________

---

**OUTPUT FORMAT**:
- Complete usability study protocol (20-40 pages with appendices)
- IEC 62366-1 and FDA HFE Guidance compliant
- All required appendices prepared
- Protocol approved by regulatory and quality teams
- Ready for execution

**DELIVERABLE**: Approved Usability Study Protocol (versioned, signed)
```

**Expected Output**:
- Comprehensive usability study protocol (20-40 pages)
- Clear study design, participant criteria, test scenarios
- Data collection forms and analysis plan
- Success criteria defined
- Protocol approvals obtained

**Quality Check**:
- [ ] Study objectives clearly defined
- [ ] Sample size justified per FDA guidance
- [ ] Participant inclusion/exclusion criteria specific
- [ ] Test scenarios map to critical tasks and use errors
- [ ] Data collection methods appropriate
- [ ] Success criteria defined and FDA-aligned
- [ ] Ethical considerations addressed
- [ ] Protocol approved by P05_REGDIR and P08_VPQUALITY

---

**End of PHASE 1: Planning & Use Specification**

**Phase 1 Deliverables Summary**:
1. ✅ Use Specification Document (10-20 pages)
2. ✅ Use-Related Risk Analysis Report (15-30 pages)
3. ✅ Usability Study Protocol (20-40 pages with appendices)
4. ✅ All approvals obtained (P05_REGDIR, P08_VPQUALITY, P01_CMO)

**Next Phase**: PHASE 2 - Formative Usability Testing (design iteration)

---

## 6. COMPLETE PROMPT SUITE

### Overview of Prompt Architecture

This use case includes **10 comprehensive prompts** across 5 phases:

**PHASE 1: PLANNING & USE SPECIFICATION** (Covered in Section 5 above)
- Prompt 1.1: Use Specification & User Population Definition ✅
- Prompt 1.2: Use-Related Risk Analysis ✅
- Prompt 1.3: Usability Study Protocol Development ✅

**PHASE 2: FORMATIVE USABILITY TESTING** (Detailed below)
- Prompt 2.1: Formative Study Execution Guide
- Prompt 2.2: Formative Data Analysis & Design Recommendations

**PHASE 3: SUMMATIVE VALIDATION** (Detailed below)
- Prompt 3.1: Summative Validation Execution Guide
- Prompt 3.2: Summative Data Analysis & Use Error Assessment

**PHASE 4: REPORTING & SUBMISSION** (Detailed below)
- Prompt 4.1: Usability Engineering Report (IEC 62366-1)
- Prompt 4.2: FDA Human Factors Summary
- Prompt 4.3: Residual Risk Assessment & Acceptability Justification

---

### PHASE 2: FORMATIVE USABILITY TESTING

**Phase 2 Overview**:
Formative usability testing is iterative evaluation during design development to identify and fix usability issues BEFORE final validation. Typically 2-3 rounds of formative testing with 5-8 participants per round, with design improvements between iterations.

---

#### **STEP 2: Formative Study Execution** (1-2 weeks per iteration)

**Objective**: Execute formative usability testing sessions to identify usability issues and design improvement opportunities.

**Persona**: P16_HFE (Lead), P17_UXRESEARCH (Facilitator)

**Prerequisites**:
- Approved study protocol (from Phase 1)
- Working prototype or near-final design
- Test materials prepared (scenarios, data forms, training materials)
- Participants recruited and screened

**Process**:

1. **Pre-Test Setup** (1-2 days)
   - Finalize test environment setup
   - Conduct dry run with internal team
   - Brief test facilitators on protocol

2. **Participant Testing** (3-5 days)
   - Conduct 5-8 usability sessions
   - Follow protocol procedures
   - Document all observations and use errors

3. **Preliminary Data Review** (1-2 days)
   - Quick review of critical findings
   - Identify any severe issues requiring immediate attention

---

**PROMPT 2.1: Formative Study Execution Guide**

```markdown
**ROLE**: You are P17_UXRESEARCH, a UX Researcher facilitating formative usability testing sessions following the approved study protocol.

**TASK**: Provide step-by-step guidance for executing formative usability testing sessions, documenting observations, and capturing use errors effectively.

**INPUT**:

**Study Protocol** (from Prompt 1.3):
{Reference approved protocol}

**Test Materials Available**:
- Device/Prototype: {description}
- Training Materials: {list}
- Test Scenarios: {count and brief description}
- Data Collection Forms: {attached}

**Participant Information** (for this session):
- Participant ID: {P01, P02, etc.}
- User Group: {e.g., "ICU RN"}
- Demographics: {age, experience, etc.}
- Session Date/Time: {YYYY-MM-DD, HH:MM}

**INSTRUCTIONS**:

Follow this structured approach for each formative usability session:

---

**PRE-SESSION PREPARATION CHECKLIST** (30 minutes before)

**Test Environment Setup**:
- [ ] Device fully charged and functional
- [ ] Test environment set up to simulate clinical setting
- [ ] All props and materials in place (patient chart, mock medication, etc.)
- [ ] Video recording equipment tested (audio and screen capture working)
- [ ] Data collection forms printed and organized
- [ ] Timer/stopwatch ready
- [ ] Backup device available in case of malfunction

**Facilitator Preparation**:
- [ ] Review participant demographics and adjust communication style
- [ ] Review test scenarios and data collection priorities
- [ ] Review use errors to watch for (from risk analysis)
- [ ] Brief any observers on protocol (no interference, silent observation)

**Mindset Check**:
- [ ] Remember: Testing the device, not the participant
- [ ] Remain neutral and unbiased
- [ ] Do NOT provide help unless participant stuck >3 minutes
- [ ] Observe and document, don't intervene

---

**SESSION STRUCTURE** (60-90 minutes total)

**PART 1: WELCOME & CONSENT** (10 minutes)

**Script**:
"Hello, [Participant Name], thank you for coming today. My name is [Facilitator Name] and I'll be working with you during this usability study.

Today we're testing a new [device type] to see how well it works for people like you who would use it in [clinical setting]. I want to emphasize that we're testing the device, not you. There are no right or wrong answers, and you can't fail this test.

During the session, I'll ask you to complete some tasks using this device. I may not be able to answer all your questions during the test because we want to see how the device works on its own. Please try to think out loud as you work through the tasks - tell me what you're thinking, what you expect to happen, and what you're trying to do.

The session will be video recorded so we can review it later, but your name and any identifying information will be kept confidential. Your participation is completely voluntary and you can stop at any time.

Do you have any questions before we begin? 

[Answer questions]

Great, let's start with the informed consent form..."

**Actions**:
1. Review informed consent form with participant
2. Answer any questions
3. Obtain signature
4. Provide copy to participant
5. Start video recording (with participant's knowledge)

---

**PART 2: DEMOGRAPHICS & BACKGROUND** (5 minutes)

**Script**:
"Before we start testing, I'd like to ask you a few questions about your background and experience..."

**Questions to Ask** (per protocol demographics section):
1. "What is your current role?" {expected: RN, physician, etc.}
2. "How long have you been in this role?" {years of experience}
3. "What type of clinical setting do you work in?" {ICU, clinic, OR, etc.}
4. "How comfortable are you with technology in general?" {1-5 scale}
5. "Have you used any devices similar to this one?" {yes/no, if yes, which ones}

**Document responses on data collection form**

---

**PART 3: TRAINING** (15-20 minutes)

**Script**:
"Now I'm going to show you how this device works. In a real situation, you'd receive [describe training: video, in-person, manual, etc.]. For today, I'll provide the same training that users would normally get..."

**Training Delivery** (per protocol):
- {Show training video if applicable}
- {Provide quick reference card}
- {Walk through key device features}
- {Allow participant to ask questions}

**Critical Note**: 
- For FORMATIVE testing: Can be more interactive, answer questions freely
- For SUMMATIVE testing: Must follow standardized script, minimal interaction

**Check for Understanding**:
"Do you feel comfortable with the training? Do you have any questions before we begin the tasks?"

{If participant seems very uncertain, provide brief additional clarification, but document this}

---

**PART 4: SCENARIO-BASED TESTING** (30-45 minutes)

For each test scenario:

**Scenario Introduction**:
"Okay, let's begin with the first scenario. I'm going to give you a card that describes a situation you might encounter in your work. Please read it carefully and then complete the tasks described."

{Hand participant scenario card - see protocol Appendix E for scenarios}

**Scenario Card Example**:
```
SCENARIO 1: Routine Infusion Setup

You are an ICU nurse caring for a 65-year-old male patient recovering from cardiac surgery. 
The physician has ordered a continuous IV infusion of Dopamine 5 mcg/kg/min.

Patient Details:
- Name: John Smith
- Weight: 80 kg
- Current BP: 90/60 mmHg
- HR: 105 bpm

Tasks:
1. Set up the device for use
2. Program the infusion according to the order
3. Confirm the settings are correct
4. Start the infusion
5. Verify the infusion is running properly
```

**During Task Execution**:

**What TO DO**:
- ✅ Observe silently and take detailed notes
- ✅ Note exact timestamp of any use errors
- ✅ Document participant verbalizations (quotes)
- ✅ Encourage think-aloud: "What are you thinking?" "What do you expect to see?"
- ✅ Use neutral probes: "Can you tell me more about that?" "Why did you choose that option?"
- ✅ Note task start and end times
- ✅ Note any frustration, confusion, or delight

**What NOT TO DO**:
- ❌ Provide help or hints during task
- ❌ Lead the participant ("Have you tried clicking...?")
- ❌ Express approval or disapproval (no "good job!" or frowning)
- ❌ Answer questions that user would need to figure out in real use
- ❌ Point out errors unless participant stuck >3 minutes

**Use Error Documentation**:

When you observe a use error, immediately document on data collection form:
- **Time**: {timestamp}
- **Task**: {which task within scenario}
- **Error Description**: {What did participant do wrong? Be specific}
- **Error Classification**: {Critical / Major / Minor}
- **Did Participant Catch/Correct?**: {Yes / No}
- **Root Cause (Preliminary)**: {Design issue / Training gap / User misunderstanding / etc.}
- **Participant Quote**: {Exact words if revealing - e.g., "I thought this button would..."}

**Example Use Error Documentation**:
```
Time: 15:32
Task: Programming infusion rate
Error: Participant entered 5 mcg/min instead of 5 mcg/kg/min (missed weight-based dosing)
Classification: CRITICAL (underdose by factor of 80)
Caught/Corrected: No - participant proceeded to start infusion
Root Cause: Weight-based dosing not clear in UI; drug library didn't flag error
Participant Quote: "Okay, 5 mcg/min of Dopamine, done"
```

**Task Completion Criteria**:

For each task, assess:
- [ ] **Completed Successfully**: Participant achieved task goal correctly
- [ ] **Completed with Errors**: Participant achieved goal but made errors
- [ ] **Failed**: Participant unable to complete task
- [ ] **Abandoned**: Participant gave up after 3+ minutes

**Task Time**: {Record start and stop time for each task}

**Intervention Criteria** (when facilitator MUST step in):
1. Participant stuck for >3 minutes (document as task failure)
2. Participant about to damage device
3. Safety concern (e.g., participant trying to "administer" mock medication to self)

**Post-Task Questions** (after EACH scenario):
1. "How confident are you that you completed that correctly?" {1-5 scale}
2. "Was there anything confusing or unclear?" {open-ended}
3. "What did you expect to happen when you [specific action]?" {clarify observed behavior}
4. "Would you do anything differently in a real situation?" {open-ended}

**Document responses verbatim**

---

**PART 5: POST-TEST QUESTIONNAIRE** (5 minutes)

After all scenarios completed, administer:

**System Usability Scale (SUS)**:
{Standard 10-question SUS survey - see protocol Appendix F}

**Custom Satisfaction Questions**:
1. "Overall, how easy or difficult was this device to use?" {1-5 scale: Very Difficult to Very Easy}
2. "How confident are you that you could use this device safely in your clinical practice?" {1-5 scale: Not Confident to Very Confident}
3. "Would you want to use this device in your work?" {Yes / No / Maybe}
4. "What did you like most about the device?" {open-ended}
5. "What did you like least?" {open-ended}

**Document responses on questionnaire**

---

**PART 6: DEBRIEF INTERVIEW** (10 minutes)

**Script**:
"Thank you for completing all the tasks. Now I'd like to ask you some questions about your overall experience..."

**Open-Ended Questions**:
1. "What was your general impression of this device?"
2. "Was there any point where you felt frustrated or confused?"
3. "Did anything surprise you - either good or bad?"
4. "If you could change one thing about this device, what would it be?"
5. "Is there anything else you think we should know?"

**Probing Questions** (based on observed use errors):
{For each significant use error, ask:}
"I noticed when you were [task], you [observed behavior]. Can you tell me what you were thinking at that moment?"

**Document Themes**:
As participant responds, note key themes:
- **Design Issues**: {list}
- **Training Needs**: {list}
- **Positive Feedback**: {list}
- **Suggestions**: {list}

---

**PART 7: CLOSING** (5 minutes)

**Script**:
"That's all we have for today. Thank you so much for your time and feedback - this is really valuable for improving the device.

As a reminder, please don't discuss the details of this device or your experience today with others, as we're still in development.

Here is your compensation for participating..."

**Actions**:
1. Provide participant compensation per protocol
2. Give participant any promised materials (copy of consent, etc.)
3. Thank participant warmly
4. Escort participant out
5. Stop video recording

---

**POST-SESSION DOCUMENTATION** (30 minutes after participant leaves)

**Immediate Documentation** (while fresh):

1. **Review Data Collection Form**:
   - Ensure all use errors documented with sufficient detail
   - Add any additional notes from memory
   - Clarify any unclear observations

2. **Use Error Summary**:
   Create quick summary:
   - Total use errors observed: {count}
   - Critical use errors: {count and description}
   - Major use errors: {count}
   - Minor use errors: {count}

3. **Preliminary Severity Assessment**:
   For each critical/major use error:
   - What was the error?
   - What could be the clinical consequence?
   - How severe? {Death / Serious Injury / Minor Injury}
   - Preliminary design recommendation: {brief note}

4. **Video File Management**:
   - Save video file with participant ID: {P01_DATE_TIME.mp4}
   - Upload to secure server
   - Create backup
   - Do NOT share widely yet (confidential)

5. **Facilitator Reflections**:
   Document facilitator observations:
   - Were there any protocol deviations?
   - Any technical issues with device or test setup?
   - Participant behavior patterns noticed
   - Ideas for next iteration

**Interim Analysis** (after every 2-3 participants):

Review data collection forms for ALL participants tested so far:
- Are use errors replicating across participants? (high priority if yes)
- Any critical use errors observed? (immediate concern)
- Any unanticipated issues not in original use error list?
- Should we modify protocol or scenarios for remaining participants?

**Communicate Findings** to P16_HFE:
- Critical use errors observed: {list}
- Recurring patterns: {list}
- Recommendations: {preliminary thoughts}

---

**FORMATIVE STUDY SUCCESS INDICATORS**:

A formative study is successful if:
- ✅ All planned participants tested per protocol
- ✅ Use errors comprehensively documented
- ✅ Root causes identified
- ✅ Clear design recommendations emerge
- ✅ Data quality high (complete, accurate documentation)

A formative study requires additional iteration if:
- ❌ Critical use errors observed in >10% of participants
- ❌ Major usability issues preventing task completion
- ❌ Participants consistently confused by key interactions
- ❌ Training materials ineffective

---

**OUTPUT FORMAT**:
- Completed data collection forms for each participant
- Video recordings of all sessions
- Use error summary document
- Preliminary design recommendations
- Facilitator notes and reflections

**DELIVERABLE**: Complete Formative Study Data Package (ready for analysis in Step 3)
```

**Expected Output**:
- 5-8 completed usability sessions
- Comprehensive use error documentation
- Video recordings for detailed review
- Preliminary patterns identified
- High-quality data for analysis

---

#### **STEP 3: Formative Data Analysis & Design Recommendations** (1 week)

**Objective**: Analyze formative usability data, identify usability issues, determine root causes, and develop prioritized design recommendations.

**Persona**: P16_HFE (Lead Analysis), P17_UXRESEARCH (Support), P06_VPPRODUCT (Review)

**Prerequisites**:
- Completed formative testing sessions (Step 2)
- Data collection forms completed
- Video recordings available

**Process**:

1. **Quantitative Analysis** (2-3 days)
   - Calculate task success rates
   - Calculate use error rates and frequency
   - Analyze task times
   - Compute SUS scores

2. **Qualitative Analysis** (2-3 days)
   - Review videos for use error root causes
   - Thematic analysis of participant feedback
   - Identify design patterns causing issues

3. **Design Recommendations** (1-2 days)
   - Prioritize issues by severity and frequency
   - Develop specific design recommendations
   - Create action plan for design iteration

---

**PROMPT 2.2: Formative Data Analysis & Design Recommendations**

```markdown
**ROLE**: You are P16_HFE, a Human Factors Engineer analyzing formative usability data to identify design improvements.

**TASK**: Conduct comprehensive analysis of formative usability testing data, identify root causes of use errors, and develop prioritized, actionable design recommendations for the development team.

**INPUT**:

**Study Information**:
- Study ID: {e.g., "UE-001-2025-Formative-Iteration-1"}
- Product Name: {product_name}
- Study Dates: {date range}
- Number of Participants: {N}
- User Group(s) Tested: {e.g., "ICU RNs (N=8)"}

**Data Available**:
- Data Collection Forms: {N forms completed}
- Video Recordings: {N videos}
- Post-Test Questionnaires: {N SUS scores + satisfaction data}
- Debrief Interview Notes: {N sets of notes}

**Use-Related Risk Analysis** (from Phase 1):
{Reference use error matrix with predicted use errors}

**INSTRUCTIONS**:

Conduct a comprehensive formative data analysis following this structure:

---

**FORMATIVE USABILITY DATA ANALYSIS REPORT**

**Report ID**: {e.g., "UE-001-2025-Formative-Analysis-1"}
**Version**: {1.0}
**Date**: {YYYY-MM-DD}
**Prepared By**: {P16_HFE Name}

---

**1. EXECUTIVE SUMMARY**

**Study Overview**:
- **Product**: {product name}
- **Study Type**: Formative Usability Testing - Iteration {1/2/3}
- **Participants**: {N} {user type}
- **Key Finding**: {1-2 sentence summary of most critical finding}
- **Primary Recommendation**: {most important design change needed}

**Top 3 Critical Issues Identified**:
1. {Issue 1 - brief description}
2. {Issue 2 - brief description}
3. {Issue 3 - brief description}

**Recommendation**: 
- [ ] Proceed to next formative iteration with design changes
- [ ] Proceed to summative validation (issues acceptably low)
- [ ] Significant redesign required before further testing

---

**2. QUANTITATIVE RESULTS**

**2.1 Task Success Rates**

For each test scenario, calculate and report task success:

| Scenario | Task | N Attempted | N Successful | Success Rate | N Failed | Failure Rate |
|----------|------|-------------|--------------|--------------|----------|--------------|
| Scenario 1 | Task 1.1 | 8 | 7 | 88% | 1 | 12% |
| Scenario 1 | Task 1.2 | 8 | 5 | 63% | 3 | 38% |
| Scenario 2 | Task 2.1 | 8 | 8 | 100% | 0 | 0% |
| ... | ... | ... | ... | ... | ... | ... |

**Overall Task Success Rate**: {calculate: total successful / total attempted}

**Interpretation**:
- Tasks with <80% success rate are problematic and require design attention
- Tasks with <50% success rate are severe usability issues requiring immediate redesign

**2.2 Use Error Frequency & Severity**

**Use Error Summary**:

| Use Error ID | Description | Frequency (# participants) | % of Participants | Severity | Risk Level |
|--------------|-------------|---------------------------|-------------------|----------|------------|
| UE-001 | {description} | 5 | 63% | Critical | HIGH |
| UE-005 | {description} | 3 | 38% | Major | MEDIUM |
| UE-012 | {description} | 7 | 88% | Minor | LOW |
| ... | ... | ... | ... | ... | ... |

**Total Use Errors Observed**: {count}
- **Critical Use Errors**: {count} ({%})
- **Major Use Errors**: {count} ({%})
- **Minor Use Errors**: {count} ({%})

**Critical Use Error Detail**:

For each critical use error (those that could cause serious harm):

**UE-001: {Error Description}**
- **Frequency**: {N} participants ({%})
- **Task**: {which task/scenario}
- **Description**: {What did participants do wrong?}
- **Clinical Consequence**: {What harm could result?}
- **Example Quote**: "{participant verbalization}"
- **Root Cause Analysis** (see Section 3)

{Repeat for all critical and major use errors}

**2.3 Task Time Analysis**

| Task | Mean Time (sec) | Std Dev | Min | Max | Target Time |
|------|-----------------|---------|-----|-----|-------------|
| Task 1.1 | 45 | 12 | 30 | 65 | <60 sec |
| Task 1.2 | 120 | 35 | 75 | 180 | <90 sec |
| ... | ... | ... | ... | ... | ... |

**Interpretation**:
- Tasks exceeding target time suggest usability issues or cognitive load
- High standard deviation suggests inconsistent performance (some users struggle)

**2.4 System Usability Scale (SUS) Results**

**Individual Participant SUS Scores**:

| Participant ID | SUS Score (0-100) |
|----------------|-------------------|
| P01 | 72 |
| P02 | 65 |
| P03 | 58 |
| ... | ... |

**Mean SUS Score**: {calculate mean}
**Standard Deviation**: {calculate SD}

**SUS Interpretation**:
- **SUS ≥ 68**: Acceptable usability (above average)
- **SUS 50-68**: Marginal usability (needs improvement)
- **SUS < 50**: Poor usability (significant redesign needed)

**Result**: {Acceptable / Marginal / Poor} - {interpretation}

**2.5 User Satisfaction Metrics**

**Confidence in Safe Use**:
- Mean Rating: {X / 5}
- % "Confident" or "Very Confident": {%}
- **Target**: >80% confident

**Likelihood to Use**:
- % "Yes" or "Probably Yes": {%}
- **Target**: >70% would use

**Overall Ease of Use**:
- Mean Rating: {X / 5} ({Very Difficult to Very Easy})

---

**3. ROOT CAUSE ANALYSIS**

For each critical and major use error, conduct detailed root cause analysis:

**USE ERROR: UE-001 - {Error Description}**

**What Happened**:
{Detailed description of what participants did wrong}

**Example from Video** (Participant P03, Timestamp 15:32):
{Describe specific example with context}

**Participant Verbalization**:
"{Quote showing participant's mental model}"

**Root Cause Categories**:

Assess each potential root cause:

**1. Design/Interface Issues** (most common root cause):
- [ ] **Visual Design**: {e.g., "Similar-looking buttons caused confusion"}
- [ ] **Information Architecture**: {e.g., "Critical setting buried in submenu"}
- [ ] **Labeling**: {e.g., "Label ambiguous - 'dose' vs 'rate' unclear"}
- [ ] **Feedback**: {e.g., "No confirmation when setting changed"}
- [ ] **Affordance**: {e.g., "Button didn't look clickable"}
- [ ] **Consistency**: {e.g., "Different behavior than similar device"}

**2. Training/Documentation Issues**:
- [ ] **Training Gap**: {e.g., "Weight-based dosing not covered in training"}
- [ ] **IFU Inadequate**: {e.g., "Instructions unclear on critical step"}
- [ ] **Quick Reference Missing**: {e.g., "No job aid for this scenario"}

**3. User Mental Model Mismatch**:
- [ ] **User Expectation**: {e.g., "Users expected button to behave like similar devices"}
- [ ] **Clinical Workflow**: {e.g., "Sequence doesn't match clinical workflow"}

**4. Environmental Factors**:
- [ ] **Distraction**: {e.g., "Task interrupted by alarm (simulated)"}
- [ ] **Time Pressure**: {e.g., "Users rushed due to scenario urgency"}

**Primary Root Cause** (select most significant):
{e.g., "Design/Interface - ambiguous labeling"}

**Clinical Impact**:
{Describe what could happen to patient if this error occurred in real use}

**Frequency Justification**:
{Why did this error happen to X% of participants? Is this a systematic design flaw or user variability?}

---

**4. QUALITATIVE FINDINGS**

**4.1 Thematic Analysis**

Review participant verbalizations and debrief comments to identify recurring themes:

**POSITIVE THEMES** (what worked well):

**Theme 1: {e.g., "Intuitive Main Screen Layout"}**
- **Frequency**: {# participants mentioned}
- **Example Quotes**:
  - P01: "{quote}"
  - P04: "{quote}"
- **Implication**: {This design element is effective, preserve in final design}

**Theme 2: {e.g., "Clear Visual Feedback"}**
{Repeat structure}

**NEGATIVE THEMES** (problems identified):

**Theme 1: {e.g., "Confusing Alarm Response Workflow"}**
- **Frequency**: {# participants mentioned}
- **Example Quotes**:
  - P02: "{quote}"
  - P05: "{quote}"
- **Implication**: {Redesign alarm interface}
- **Related Use Errors**: {UE-003, UE-007}

**Theme 2: {e.g., "Inadequate Training on Weight-Based Dosing"}**
{Repeat structure}

**4.2 User Suggestions**

Participant-generated suggestions for improvement:
1. {Suggestion 1 from participants}
2. {Suggestion 2}
3. {Suggestion 3}
[... list all unique suggestions]

---

**5. DESIGN RECOMMENDATIONS**

**5.1 Critical Priority Recommendations** (must fix before summative)

**Recommendation 1: {Specific Design Change}**
- **Addresses Use Error(s)**: {UE-001, UE-005}
- **Root Cause**: {ambiguous labeling}
- **Proposed Solution**: {e.g., "Change button label from 'Dose' to 'Dose (mcg/kg/min)' with unit always visible"}
- **Expected Impact**: {e.g., "Eliminate weight-based dosing errors (currently 63% error rate)"}
- **Implementation Owner**: {Engineering / UX Design}
- **Estimated Effort**: {Low / Medium / High}
- **Target Completion**: {date}

**Recommendation 2: {Specific Design Change}**
{Repeat structure for all critical recommendations - typically 3-5 critical fixes}

**5.2 High Priority Recommendations** (should fix if possible)

{Repeat recommendation structure for high priority items}

**5.3 Medium Priority Recommendations** (nice to have)

{List medium priority items - may defer to post-launch if time constrained}

**5.4 Training Material Improvements**

Beyond design changes, recommend training enhancements:
1. {Training improvement 1}
2. {Training improvement 2}

**5.5 Design Elements to Preserve**

Identify what worked well and should NOT be changed:
1. {Design element 1 - participants loved this}
2. {Design element 2 - high success rate}

---

**6. RISK MANAGEMENT IMPLICATIONS**

**6.1 Use Errors NOT Predicted in Risk Analysis**

Identify any use errors observed in testing that were NOT in original use-related risk analysis:

**New Use Error: {Description}**
- **Observed in Testing**: {frequency}
- **Severity**: {assessment}
- **Action**: {Add to risk management file, design mitigation}

{List all newly discovered use errors}

**6.2 Risk Control Validation**

For use errors that had existing risk controls, assess effectiveness:

| Use Error | Existing Risk Control | Effective? | Recommendation |
|-----------|----------------------|------------|----------------|
| UE-001 | Confirmation dialog | NO - users clicked through | Redesign confirmation to be more salient |
| UE-005 | Warning label | PARTIAL - 50% noticed | Enhance label prominence |
| ... | ... | ... | ... |

---

**7. NEXT STEPS & DECISION**

**7.1 Formative Study Conclusion**

**Overall Assessment**:
- **Critical Use Error Rate**: {%} (Target: <2%)
- **Major Use Error Rate**: {%} (Target: <5%)
- **Task Success Rate**: {%} (Target: >95%)
- **SUS Score**: {score} (Target: ≥68)

**Decision**:
- [ ] **PASS - Proceed to Summative Validation**: Use errors acceptably low, design ready for final validation
- [ ] **REDESIGN - Additional Formative Iteration Needed**: Critical issues identified, require design changes and retesting
- [ ] **MAJOR REDESIGN**: Fundamental usability problems, significant redesign required

**Rationale**: 
{Explain decision based on data}

**7.2 Action Plan**

If additional formative iteration needed:

**Design Changes Required**:
1. {Change 1 with owner and timeline}
2. {Change 2 with owner and timeline}
3. {Change 3 with owner and timeline}

**Timeline**:
- Design changes: {X weeks}
- Next formative iteration: {target date}

**Modified Protocol** (if needed):
- Any changes to test scenarios?
- Any changes to participant criteria?
- Any changes to training materials?

---

**8. APPENDICES**

**Appendix A**: Detailed Use Error Log (all use errors with timestamps)
**Appendix B**: Participant Demographics Summary
**Appendix C**: Video Clips of Critical Use Errors (if creating highlight reel)
**Appendix D**: Complete Verbatim Comments (debrief interviews)
**Appendix E**: Data Collection Forms (all N participants)

---

**REPORT APPROVAL**

**Prepared By**:
- Name: {P16_HFE}
- Date: {YYYY-MM-DD}
- Signature: _______________________

**Reviewed By**:
- Product Management: {P06_VPPRODUCT}
- Date: {YYYY-MM-DD}
- Signature: _______________________

---

**OUTPUT FORMAT**:
- Comprehensive formative analysis report (20-40 pages)
- Quantitative results with tables and charts
- Root cause analysis for critical issues
- Prioritized design recommendations
- Clear decision on next steps (iterate vs. proceed)

**DELIVERABLE**: Formative Data Analysis & Recommendations Report (versioned, reviewed by P06_VPPRODUCT)
```

**Expected Output**:
- Complete formative analysis report (20-40 pages)
- Quantitative metrics (task success, use errors, SUS)
- Root cause analysis for all critical issues
- Prioritized design recommendations
- Decision on next steps

**Quality Check**:
- [ ] All use errors documented and analyzed
- [ ] Root causes identified with evidence
- [ ] Design recommendations specific and actionable
- [ ] Recommendations prioritized by severity and impact
- [ ] Clear decision on iterate vs. proceed to summative
- [ ] Risk management file updated
- [ ] Report reviewed and approved by P06_VPPRODUCT

---

**Note**: If critical issues identified, return to design/engineering phase, implement changes, and repeat formative testing (typically 2-3 iterations total). Once use errors acceptably low, proceed to Phase 3 (Summative Validation).

---

**End of PHASE 2: Formative Usability Testing**

**Phase 2 Deliverables Summary** (per iteration):
1. ✅ Formative Study Data Package (data forms, videos)
2. ✅ Formative Data Analysis Report (20-40 pages)
3. ✅ Design Recommendations (prioritized)
4. ✅ Decision on next steps (iterate or proceed)

**Next Phase**: PHASE 3 - Summative Validation (final validation for FDA submission)

---

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 Quality Metrics for Usability Testing

**Study Execution Quality**:
- **Protocol Adherence**: >95% adherence to approved protocol
- **Data Completeness**: 100% of data collection forms completed
- **Participant Representation**: ≥90% of participants meet inclusion criteria
- **Video Recording Quality**: ≥95% of sessions successfully recorded

**Data Quality**:
- **Use Error Documentation**: All use errors documented with sufficient detail for root cause analysis
- **Inter-Rater Reliability**: If multiple coders, ≥85% agreement on use error classification
- **Missing Data**: <5% missing data across all measures

**Output Quality**:
- **Report Completeness**: All required sections per IEC 62366-1 included
- **Traceability**: 100% traceability from use errors → risk analysis → design recommendations
- **Regulatory Readiness**: Report meets FDA HFE Guidance standards (review by P05_REGDIR)

### 7.2 Study Execution Checklist

**Pre-Study Checklist**:
- [ ] Protocol approved by P05_REGDIR (Regulatory)
- [ ] Protocol approved by P08_VPQUALITY (Quality)
- [ ] Participant recruitment complete per criteria
- [ ] Test materials prepared and verified
- [ ] Test environment validated (simulates real use)
- [ ] Data collection forms finalized
- [ ] Video recording equipment tested
- [ ] Facilitators trained on protocol

**During Study Checklist**:
- [ ] Informed consent obtained from all participants
- [ ] Protocol followed for each session
- [ ] All use errors documented in real-time
- [ ] Video recordings captured successfully
- [ ] Participant demographics collected
- [ ] Post-test questionnaires administered

**Post-Study Checklist**:
- [ ] All data collection forms reviewed for completeness
- [ ] Video files backed up and securely stored
- [ ] Preliminary data review conducted
- [ ] Use errors classified by severity
- [ ] Root cause analysis completed
- [ ] Design recommendations documented
- [ ] Risk management file updated
- [ ] Final report prepared and approved

### 7.3 Validation Criteria

**Formative Testing Success**:
- ✅ All critical tasks tested
- ✅ 5-8 participants per user group per iteration
- ✅ Use errors comprehensively documented
- ✅ Root causes identified
- ✅ Design recommendations actionable

**Summative Testing Success** (FDA Acceptance):
- ✅ 15+ participants per distinct user group
- ✅ Representative participants (per use specification)
- ✅ Realistic use scenarios tested
- ✅ Training materials validated
- ✅ Critical use error rate <1-2% (device dependent)
- ✅ Major use error rate <5%
- ✅ Residual risks acceptably low
- ✅ Complete traceability to risk analysis

---

## 8. REGULATORY COMPLIANCE CHECKLIST

### 8.1 IEC 62366-1:2015 Compliance

**Required Deliverables**:
- [ ] **Use Specification** (Clause 5.1-5.6) - Prompt 1.1
- [ ] **User Interface Specification** (Clause 5.7) - Part of Prompt 1.1
- [ ] **Use-Related Risk Analysis** (Clause 5.8) - Prompt 1.2
- [ ] **Formative Evaluation Plan** (Clause 5.9) - Prompt 1.3
- [ ] **Formative Evaluation Results** (Clause 5.10) - Prompt 2.2
- [ ] **Summative Evaluation Plan** (Clause 5.11) - Phase 3
- [ ] **Summative Evaluation Results** (Clause 5.12) - Phase 3
- [ ] **Usability Engineering Report** (Clause 5.13) - Prompt 4.1

**Usability Engineering File Contents**:
- [ ] Use specification
- [ ] User interface description
- [ ] List of known use problems with medical device
- [ ] Results of formative evaluations
- [ ] Results of summative evaluation
- [ ] Usability engineering report

### 8.2 FDA Human Factors Guidance (2016) Compliance

**Required Elements**:
- [ ] **Analyses, Evaluations, and Tests** (Section 3)
  - [ ] Preliminary analyses and evaluations
  - [ ] Formative evaluations
  - [ ] Summative (validation) evaluation

- [ ] **Sample Size Justification** (Section 4)
  - [ ] 15+ participants per distinct user group
  - [ ] Statistical or qualitative justification

- [ ] **Representative Users** (Section 4)
  - [ ] Users match intended user population
  - [ ] Relevant experience and training level
  - [ ] Appropriate clinical specialty

- [ ] **Realistic Use Scenarios** (Section 4)
  - [ ] Based on actual clinical use
  - [ ] Include challenging conditions (distractions, time pressure)
  - [ ] Cover critical tasks

- [ ] **Training Validation** (Section 4)
  - [ ] Training materials tested as part of summative
  - [ ] Training effectiveness demonstrated

- [ ] **Residual Risk Assessment** (Section 5)
  - [ ] All use errors assessed for clinical risk
  - [ ] Residual risks justified as acceptable
  - [ ] Risk-benefit analysis documented

**FDA Submission Package**:
- [ ] **HFE Summary** (1-2 pages) - Prompt 4.2
- [ ] **Complete HFE Report** (Appendix) - Prompt 4.1
- [ ] **Risk Analysis Linkage** - Integrated throughout

### 8.3 FDA 510(k) Checklist (for Device Submissions)

**Special Controls for Moderate-Risk Devices**:
- [ ] Usability testing results demonstrate safe and effective use
- [ ] Use errors that could lead to serious adverse health consequences mitigated
- [ ] Training materials validated

**Common FDA Questions to Anticipate**:
1. "Justify your sample size for summative validation"
2. "How did you recruit representative users?"
3. "Describe how you simulated realistic use conditions"
4. "What use errors were observed and how were they addressed?"
5. "How did you validate training materials?"
6. "What is your residual risk assessment?"

**Proactive Response Strategy**:
- Comprehensive documentation addresses questions before asked
- Clear traceability from risks → testing → mitigations
- Transparent reporting (don't hide use errors)
- Strong justification for residual risk acceptability

---

## 9. TEMPLATES & JOB AIDS

### 9.1 Data Collection Form Template

```
USABILITY TESTING DATA COLLECTION FORM

Study ID: __________   Date: __________   
Participant ID: __________   Facilitator: __________   

PARTICIPANT DEMOGRAPHICS:
- Age: ___   Gender: ___   
- Role/Title: __________
- Years Experience: ___
- Technology Proficiency (1-5): ___

SCENARIO: __________

TASK 1: __________
Start Time: ____   End Time: ____   Duration: ____
- [ ] Completed Successfully
- [ ] Completed with Errors
- [ ] Failed
- [ ] Abandoned

USE ERRORS OBSERVED:
Error #1:
- Time: ____
- Description: __________
- Severity: [ ] Critical [ ] Major [ ] Minor
- Caught/Corrected: [ ] Yes [ ] No
- Root Cause: __________

{Repeat for additional errors}

POST-TASK QUESTIONS:
1. Confidence (1-5): ___
2. Anything confusing?: __________

{Repeat for each task}
```

### 9.2 Use Error Prioritization Matrix

| Use Error ID | Task | Description | Frequency | Severity | Risk Level | Test Priority |
|--------------|------|-------------|-----------|----------|------------|---------------|
| UE-001 | | | % | Critical/Major/Minor | High/Med/Low | Must/Should/May |

### 9.3 Design Recommendation Template

```
DESIGN RECOMMENDATION

Recommendation ID: __________
Priority: [ ] Critical [ ] High [ ] Medium [ ] Low

ISSUE:
- Use Error(s) Addressed: __________
- Frequency: __________
- Severity: __________
- Root Cause: __________

PROPOSED SOLUTION:
{Specific design change with mock-ups if helpful}

EXPECTED IMPACT:
{How will this eliminate/reduce the use error?}

IMPLEMENTATION:
- Owner: __________
- Effort: [ ] Low [ ] Medium [ ] High
- Target Date: __________

VERIFICATION:
- How will we verify this fixes the issue?
- {Test in next formative iteration}
```

---

## 10. INTEGRATION WITH OTHER SYSTEMS

### 10.1 Risk Management System (ISO 14971)

**Integration Points**:
- Use-related hazards identified in use specification flow into risk analysis
- Usability testing validates effectiveness of risk controls
- Use errors observed in testing added to hazard log
- Residual risk assessment informed by summative results

**Traceability Matrix**:

| Hazard ID | Use Error | Risk Control | Verification Method | Usability Test Result |
|-----------|-----------|--------------|---------------------|----------------------|
| H-015 | UE-001 | Confirmation dialog | Summative usability | 0% error rate - EFFECTIVE |

### 10.2 Design Control System (21 CFR 820.30)

**Design Inputs**:
- Use specification defines user needs and intended use → Design inputs

**Design Outputs**:
- User interface design implements requirements → Design outputs

**Design Verification**:
- Usability testing verifies design meets requirements

**Design Validation**:
- Summative usability validation confirms device meets user needs

**Design History File (DHF)**:
- Usability engineering file is part of DHF
- All usability reports archived in DHF

### 10.3 Post-Market Surveillance

**Usability Baseline**:
- Summative study establishes baseline use error rates
- Post-market complaints compared to baseline
- Trending of use error types post-launch

**CAPA Integration**:
- Post-market use errors trigger CAPA process
- Design changes implemented and verified through usability testing

---

## 11. REFERENCES & RESOURCES

### 11.1 Standards

1. **IEC 62366-1:2015**: Medical devices - Application of usability engineering to medical devices
2. **ISO 14971:2019**: Medical devices - Application of risk management to medical devices
3. **ANSI/AAMI HE75:2009/(R)2018**: Human factors engineering - Design of medical devices

### 11.2 FDA Guidance Documents

1. **FDA (2016)**: "Applying Human Factors and Usability Engineering to Medical Devices"
   - https://www.fda.gov/media/80481/download

2. **FDA (2022)**: "Content of Human Factors Information in Medical Device Marketing Submissions"
   - Draft guidance with updated expectations

3. **FDA (2016)**: "List of Highest Priority Devices for Human Factors Review"
   - Identifies devices requiring enhanced HFE scrutiny

### 11.3 Industry Resources

1. **AAMI Foundation**: Human Factors Engineering resources
2. **Human Factors and Ergonomics Society (HFES)**: Healthcare Technical Group
3. **Medical Device Innovation Consortium (MDIC)**: HFE case studies

### 11.4 Academic References

1. Wiklund, M. et al. (2015). *Usability Testing of Medical Devices*. CRC Press
2. Zhang, J. et al. (2003). "Using usability heuristics to evaluate patient safety of medical devices." *Journal of Biomedical Informatics*
3. Carayon, P. (2012). *Handbook of Human Factors and Ergonomics in Health Care and Patient Safety*

---

## DOCUMENT METADATA

**Framework**: FORGE™ (Foundation Optimization Regulatory Guidelines Engineering)
**Domain**: PRODUCT_DEVELOPMENT + REGULATORY_AFFAIRS
**Complexity**: ADVANCED
**Regulatory Validation**: IEC 62366-1:2015, FDA HFE Guidance 2016
**Expert Review Status**: PENDING
**Version Control**: v1.0 (2025-10-11)
**Document Owner**: P16_HFE (Human Factors Engineering)

---

## ACKNOWLEDGMENTS

**Document prepared by**: Life Sciences Intelligence Prompt Library (LSIPL) Team  
**Subject Matter Experts**: P16_HFE (Human Factors), P05_REGDIR (Regulatory Affairs), P17_UXRESEARCH (UX Research)
**Expert Validation**: [Pending validation by certified human factors engineers]

**Related Documents**:
- UC_PD_001: Product Requirements Definition
- UC_RM_005: Risk Management Process
- UC_RA_001: FDA 510(k) Submission Strategy
- UC_PD_008: Design Controls Compliance

---

**END OF UC_PD_010 USABILITY TESTING PROTOCOL - PHASE 1-2 COMPLETE**

**STATUS**: Document includes complete Phase 1 (Planning) and Phase 2 (Formative Testing). Phase 3 (Summative Validation) and Phase 4 (Reporting) prompts are outlined in Section 6 and will be developed in Phase 2 document expansion.

---

**For questions, implementation support, or expert validation, contact the Product Development & Human Factors Team.**

**Document License**: This document is provided for use within the organization. External distribution requires approval.

**Next Steps**:
1. Expert validation by certified human factors engineers
2. Pilot testing with actual usability study
3. Refinement based on user feedback
4. Expansion of Phase 3-4 detailed prompts
5. Development of supporting templates and tools
