# USE CASE 13: PHARMACOVIGILANCE & ICSR PROCESSING

## **UC_PV_013: Individual Case Safety Report (ICSR) Processing & Signal Detection**

**Part of GUARDâ„¢ Framework - Global Understanding & Assessment of Risk & Drug Safety**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_PV_013 |
| **Version** | 1.0 |
| **Last Updated** | October 10, 2025 |
| **Document Owner** | Drug Safety & Pharmacovigilance Team |
| **Target Users** | Drug Safety Associates, PV Managers, Medical Safety Officers |
| **Estimated Time** | 3-4 hours (complete workflow) |
| **Complexity** | ADVANCED |
| **Regulatory Framework** | ICH E2A-E2F, 21 CFR 312.32, 314.80, EU GVP |
| **Prerequisites** | Safety database access, product knowledge, causality assessment training |

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

**Pharmacovigilance Individual Case Safety Report (ICSR) Processing** is the systematic evaluation, documentation, and reporting of adverse events (AEs) associated with pharmaceutical products, biologics, or medical devices. This use case provides a comprehensive, prompt-driven workflow for:

- **ICSR Receipt & Triage**: Rapid assessment of incoming safety reports for seriousness and regulatory reporting timelines
- **Case Processing**: Structured data capture, medical coding, and narrative generation following ICH E2B(R3) standards
- **Causality Assessment**: Systematic evaluation of the relationship between product exposure and adverse events
- **Regulatory Reporting**: Expedited (15-day, 7-day) and periodic safety reports to FDA, EMA, and global authorities
- **Signal Detection**: Identification of potential safety signals requiring further investigation

### 1.2 Business Impact

**The Problem**:
Pharmaceutical companies receive thousands of AE reports annually from diverse sources (spontaneous reports, clinical trials, literature, social media). Processing these reports requires:

1. **Speed**: Serious AEs must be reported to FDA within 7-15 days
2. **Accuracy**: Medical coding errors or incomplete narratives delay regulatory submissions
3. **Consistency**: Causality assessments must be reproducible and defensible
4. **Compliance**: Failure to meet reporting timelines results in FDA Warning Letters, fines, and consent decrees
5. **Signal Detection**: Early identification of safety signals can prevent patient harm and protect product value

**Current State Challenges**:
- **Manual Processing**: Average 4-6 hours per serious ICSR (coding, narrative, causality, QC)
- **High Error Rates**: 15-25% of ICSRs require corrections after initial submission
- **Missed Timelines**: 8-12% of expedited reports miss regulatory deadlines
- **Inconsistent Causality**: Inter-rater agreement for causality assessment is ~70-75%
- **Delayed Signal Detection**: Signals identified 6-12 months after emergence in some cases

**Value Proposition of This Use Case**:

| Metric | Current State | With UC_PV_013 | Improvement |
|--------|---------------|----------------|-------------|
| **Processing Time** | 4-6 hours/ICSR | 2-3 hours/ICSR | 40-50% reduction |
| **Error Rate** | 15-25% | <5% | 75% reduction |
| **Timeline Compliance** | 88-92% | >98% | 6-10% improvement |
| **Causality Consistency** | 70-75% agreement | >90% agreement | 20% improvement |
| **Signal Detection Speed** | 6-12 mo lag | 1-2 mo lag | 5x faster |
| **Annual Cost Savings** | Baseline | $500K-1M | Per 1000 ICSRs/year |

### 1.3 Target Audience

**Primary Users**:
1. **Drug Safety Associates** (DSA): Process incoming AE reports, perform medical coding, draft narratives
2. **Medical Safety Officers** (MSO): Review cases, conduct causality assessment, approve reports
3. **Pharmacovigilance Managers**: Oversee case processing, ensure timeline compliance, manage signal detection

**Secondary Users**:
4. **Regulatory Affairs**: Prepare regulatory submissions (IND Safety Reports, PSURs, PBRERs)
5. **Clinical Teams**: Review trial-related safety data
6. **Medical Information**: Respond to product complaints and medical inquiries

### 1.4 Key Success Metrics

**Process Metrics**:
- ✅ 100% of serious AEs triaged within 24 hours of receipt
- ✅ >98% of expedited reports submitted within regulatory timelines
- ✅ <5% error rate in medical coding (MedDRA, WHO-DD)
- ✅ >90% inter-rater agreement on causality assessments
- ✅ 100% of ICSRs include complete ICSR narrative per ICH E2B(R3)

**Quality Metrics**:
- ✅ Zero FDA Warning Letters for pharmacovigilance deficiencies
- ✅ Zero consent decrees related to safety reporting
- ✅ >95% of ICSRs pass external audit without findings
- ✅ <2% of ICSRs require post-submission corrections

**Business Impact Metrics**:
- ✅ 40-50% reduction in ICSR processing time
- ✅ $500K-1M annual cost savings per 1000 ICSRs
- ✅ 5x faster signal detection (from 6-12 months to 1-2 months)
- ✅ Improved patient safety through earlier signal identification

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 The Pharmacovigilance Challenge

Pharmacovigilance (PV) is the science and activities related to the detection, assessment, understanding, and prevention of adverse effects or any other drug-related problem. The core challenge is **balancing speed, accuracy, and compliance** in processing large volumes of safety data from diverse sources.

#### Key Challenges:

**1. Volume & Complexity**
- Large pharma companies process 50,000-200,000 ICSRs annually
- AE reports come from multiple sources: clinical trials, spontaneous reports, literature, social media, medical devices
- Each ICSR requires: medical review, coding (MedDRA, WHO-DD), causality assessment, narrative generation, QC review
- Complex cases (e.g., drug-drug interactions, special populations) require expert medical judgment

**2. Regulatory Compliance Burden**
- **FDA**: 21 CFR 312.32 (IND safety reporting), 21 CFR 314.80 (NDA/BLA safety reporting)
  - Serious, unexpected AEs: 15 calendar days
  - Fatal/life-threatening: 7 calendar days
  - Field Alert Reports: 3 business days
- **EMA**: EU Regulation 726/2004, Good Pharmacovigilance Practices (GVP)
  - Serious AEs: 15 days
  - Electronic submission via EudraVigilance
- **Global**: Over 140 regulatory authorities with varying requirements
- Failure to comply: FDA Warning Letters, consent decrees, product recalls

**3. Data Quality Issues**
- **Incomplete Reports**: 40-60% of spontaneous reports lack critical information (date of onset, outcome, concomitant medications)
- **Inconsistent Terminology**: Free-text descriptions vary widely; standardization via MedDRA is error-prone
- **Duplicate Reports**: Same event reported by patient, physician, and pharmacist creates duplicates
- **Language Barriers**: Reports in 50+ languages require translation

**4. Causality Assessment Complexity**
- **Subjectivity**: Causality is not black-and-white; requires medical judgment
- **Low Inter-Rater Agreement**: Published studies show 60-75% agreement between assessors
- **Algorithmic Limitations**: Naranjo, WHO-UMC, and other algorithms have limitations (designed for single drug, not polypharmacy)
- **Confounding Factors**: Underlying disease, concomitant medications, lifestyle factors complicate assessment

**5. Signal Detection Lag**
- **Manual Review**: Reviewing individual ICSRs does not identify patterns across thousands of reports
- **Statistical Methods**: Disproportionality analyses (ROR, PRR, EBGM) require sufficient case counts (typically 3-5 cases)
- **Delayed Recognition**: Average 6-12 months from signal emergence to formal evaluation
- **False Positives**: High noise-to-signal ratio; most statistical signals are not true safety concerns

### 2.2 Regulatory Landscape

#### ICH Guidelines (International Council for Harmonisation)

**ICH E2A**: Clinical Safety Data Management (Definitions and Standards)
- Defines serious adverse events (SAEs): death, life-threatening, hospitalization, disability, congenital anomaly, medically important event
- Establishes expectedness based on reference safety information (RSI)

**ICH E2B(R3)**: Electronic Transmission of Individual Case Safety Reports
- Standard format for electronic ICSRs (E2B R3 XML)
- Required data elements (mandatory vs. optional)
- MedDRA coding standards for adverse events and medical history

**ICH E2C(R2)**: Periodic Benefit-Risk Evaluation Reports (PBRER)
- Replaces older PSUR format
- Requires integrated benefit-risk analysis
- Submission at defined intervals (6 months, annual, etc.)

**ICH E2D**: Post-Approval Safety Data Management
- Defines expectations for post-marketing surveillance
- Requirements for Periodic Safety Update Reports (PSURs) and Development Safety Update Reports (DSURs)

**ICH E2E**: Pharmacovigilance Planning
- Risk Management Plan (RMP) structure
- Safety specification, pharmacovigilance plan, risk minimization measures
- Post-authorization safety studies (PASS)

**ICH E2F**: Development Safety Update Report (DSUR)
- Annual safety report for investigational products
- Replaces older IND Annual Report safety section
- Harmonized format for global submissions

#### FDA Requirements

**21 CFR 312.32**: IND Safety Reporting
- Serious, unexpected AEs related to investigational drug: 15 calendar days (IND Safety Report)
- Fatal/life-threatening: 7 calendar days (expedited)
- Annual IND reports: Safety update within 60 days of IND anniversary
- Aggregate safety analysis required

**21 CFR 314.80**: Post-marketing Reporting (NDA/BLA)
- 15-day Alert Reports for serious, unexpected AEs
- Periodic Adverse Drug Experience Reports (PADERs) - quarterly for first 3 years, annual thereafter
- Field Alert Reports for product quality issues: 3 business days

**FDA Guidance**: Safety Reporting Requirements for INDs and BA/BE Studies (2012)
- Clarifies expectedness determination
- When to file vs. not file
- Annual report requirements

#### EMA Requirements

**EU Regulation 726/2004**: Pharmacovigilance for centrally authorized products
**Good Pharmacovigilance Practices (GVP)**: Modules I-XVI covering all aspects of PV

**GVP Module VI**: Management and Reporting of Adverse Reactions
- Electronic reporting via EudraVigilance (EVDAS)
- ICSR submission timelines: 15 days for serious AEs
- Quality requirements for ICSRs

**GVP Module IX**: Signal Management
- Signal detection, validation, confirmation, analysis, prioritization
- Signal evaluation process and communication

### 2.3 Common Pitfalls in ICSR Processing

#### Critical Errors That Lead to Regulatory Actions:

**1. Missed Reporting Timelines**
- **Example**: Company failed to submit 47 serious AE reports within 15-day deadline
- **Consequence**: FDA Warning Letter, consent decree, $10M penalty
- **Root Cause**: Inadequate triage process; reports sat in queue unreviewed

**2. Incomplete or Inaccurate Medical Coding**
- **Example**: Myocardial infarction coded as "chest pain" (non-serious vs. serious)
- **Consequence**: Under-reporting of serious AEs; FDA inspection finding
- **Root Cause**: Insufficient medical review; reliance on reporter's verbatim terms

**3. Inadequate Causality Assessment**
- **Example**: All AEs automatically assessed as "not related" without medical review
- **Consequence**: FDA Form 483 observation; citation for inadequate PV system
- **Root Cause**: Over-reliance on algorithm without clinical judgment

**4. Failure to Detect Safety Signals**
- **Example**: 200+ cases of liver injury over 18 months; no signal detected
- **Consequence**: FDA mandated black box warning; market withdrawal
- **Root Cause**: No systematic signal detection process; cases reviewed individually

**5. Poor Narrative Quality**
- **Example**: ICSR narrative was copy-paste of patient verbatim report; no medical interpretation
- **Consequence**: Regulatory query; delayed approval of supplemental NDA
- **Root Cause**: Inadequate training; template-driven narratives without clinical context

### 2.4 Industry Benchmarks

| Metric | Poor Performance | Average | Best-in-Class |
|--------|------------------|---------|---------------|
| **Processing Time per ICSR** | 6-8 hours | 4-6 hours | 2-3 hours |
| **Error Rate (Medical Coding)** | 20-30% | 10-15% | <5% |
| **Timeline Compliance** | 80-85% | 90-95% | >98% |
| **Causality Agreement** | 60-70% | 75-85% | >90% |
| **Signal Detection Lag** | 12-18 mo | 6-9 mo | 1-3 mo |
| **Cost per ICSR** | $150-200 | $100-150 | $60-100 |
| **FDA Inspection Findings** | 5-10 per inspection | 2-4 | 0-1 |

### 2.5 Value Proposition of This Use Case

**Direct Benefits**:
1. **Regulatory Compliance**: >98% on-time submissions; zero Warning Letters
2. **Cost Reduction**: 40-50% faster processing = $500K-1M savings per 1000 ICSRs
3. **Quality Improvement**: <5% error rate in medical coding; >90% causality agreement
4. **Signal Detection**: 5x faster identification of safety signals (6-12 mo → 1-2 mo)
5. **Risk Mitigation**: Earlier detection prevents patient harm; protects product value

**Indirect Benefits**:
1. **Operational Efficiency**: Standardized workflows reduce training time
2. **Scalability**: Handle volume spikes (e.g., during safety signal or product launch) without proportional headcount increase
3. **Audit Readiness**: Complete documentation trail; easier to demonstrate GVP compliance
4. **Data-Driven Decisions**: Better data quality enables advanced analytics (signal detection, risk management)

### 2.6 Integration with Other Use Cases

UC_PV_013 depends on and informs several other use cases in the Life Sciences Prompt Library:

**Dependencies** (must complete first):
- **UC_REG_001** (Regulatory Strategy): Understanding product approval status and reference safety information (RSI)
- **UC_CLIN_005** (Clinical Safety Monitoring): AE data from clinical trials feeds into ICSR processing

**Informed by UC_PV_013**:
- **UC_PV_014** (Signal Detection & Management): Aggregate ICSR data is input for signal detection
- **UC_PV_015** (PSUR/PBRER Generation): Individual ICSRs aggregated for periodic safety reports
- **UC_PV_016** (Risk Management Planning): Safety profile informs Risk Management Plan (RMP) updates
- **UC_MED_008** (Medical Information Responses): Safety data used to answer HCP and patient inquiries

---

## 3. PERSONA DEFINITIONS

This use case requires collaboration across five key personas, each bringing critical expertise to ensure compliant, high-quality ICSR processing.

### 3.1 P11_DSA: Drug Safety Associate

**Role in UC_PV_013**: Front-line case processor; performs initial review, medical coding, narrative drafting

**Responsibilities**:
- Lead Steps 1, 2, 4 (Case Intake, Medical Coding, Narrative Generation)
- Conduct initial case review and data abstraction
- Perform MedDRA and WHO-DD coding of adverse events and medications
- Draft ICSR narratives following ICH E2B(R3) standards
- Enter data into safety database (e.g., Oracle Argus, ArisGlobal)
- Conduct follow-up with reporters for incomplete cases
- Support quality control review

**Required Expertise**:
- Pharmacology and medical terminology
- MedDRA coding certification (MSSO training)
- ICH E2B(R3) data standards
- Safety database proficiency (Argus, ArisGlobal, etc.)
- Regulatory reporting requirements (21 CFR 312.32, 314.80)
- ICH E2A adverse event definitions

**Experience Level**: 2-5 years in pharmacovigilance or clinical research

**Tools Used**:
- Safety databases (Oracle Argus, ArisGlobal LifeSphere, Veeva Vault Safety)
- MedDRA Browser
- WHO Drug Dictionary
- Medical literature databases (PubMed, Embase)

---

### 3.2 P12_MSO: Medical Safety Officer (Physician or PharmD)

**Role in UC_PV_013**: Medical reviewer; conducts causality assessment, approves ICSRs for submission

**Responsibilities**:
- Lead Step 3 (Causality Assessment)
- Review Step 5 (Regulatory Reporting Strategy)
- Conduct medical review of all serious and unexpected AEs
- Perform causality assessment using structured algorithms (Naranjo, WHO-UMC) and clinical judgment
- Approve final ICSR narratives and assessments
- Make expectedness determinations based on reference safety information (RSI)
- Identify potential signals requiring escalation
- Provide clinical context for complex cases

**Required Expertise**:
- MD, DO, PharmD, or equivalent clinical degree
- 5-10+ years clinical practice or pharmacovigilance experience
- Expert knowledge of drug safety, pharmacology, toxicology
- Causality assessment methodology (Naranjo, WHO-UMC, Karch-Lasagna)
- ICH E2A-E2F guidelines
- Regulatory submissions (IND Safety Reports, 15-day reports)

**Experience Level**: Senior level; board certification preferred

**Clinical Specialties** (depending on product portfolio):
- Internal Medicine, Cardiology, Oncology, Neurology, Psychiatry, etc.

---

### 3.3 P13_PVMGR: Pharmacovigilance Manager

**Role in UC_PV_013**: Oversees case processing operations; ensures timeline compliance and quality standards

**Responsibilities**:
- Oversee entire UC_PV_013 workflow
- Monitor regulatory timeline compliance (7-day, 15-day reports)
- Conduct quality control reviews (random audits of ICSRs)
- Manage case escalations and complex scenarios
- Coordinate with Regulatory Affairs for submissions
- Maintain pharmacovigilance system master file (PSMF)
- Prepare for regulatory inspections and audits
- Oversee signal detection activities

**Required Expertise**:
- 7-10+ years pharmacovigilance experience
- RAC (Regulatory Affairs Certification) preferred
- Global PV regulations (FDA, EMA, ICH)
- Good Pharmacovigilance Practices (GVP)
- Quality management systems (ISO 9001, ICH Q10)
- Risk management (RMP, REMS)

**Experience Level**: Senior management; often reports to VP of Pharmacovigilance

**Tools Used**:
- Safety databases (oversight level)
- Quality metrics dashboards
- Regulatory tracking systems
- Project management tools (for inspection readiness)

---

### 3.4 P14_REGAFF: Regulatory Affairs Specialist (Safety)

**Role in UC_PV_013**: Prepares regulatory submissions; ensures compliance with agency-specific requirements

**Responsibilities**:
- Lead Step 5 (Regulatory Reporting Strategy)
- Support Step 6 (Expedited Report Submission)
- Determine reportability to specific health authorities (FDA, EMA, PMDA, etc.)
- Prepare regulatory submission packages (IND Safety Reports, 15-day Alert Reports, etc.)
- Manage electronic submissions (FDA ESG, EudraVigilance, etc.)
- Track submission acknowledgments and follow-up queries
- Maintain regulatory correspondence files

**Required Expertise**:
- Regulatory Affairs Certification (RAC) preferred
- 5-7+ years regulatory submissions experience
- Global regulatory requirements (FDA, EMA, PMDA, Health Canada, etc.)
- Electronic submission formats (ICH E2B R3 XML, FDA ESG)
- Regulatory databases (EudraVigilance, FAERS, VigiBase)

**Experience Level**: Senior level

**Tools Used**:
- Regulatory submission portals (FDA ESG, EudraVigilance gateway)
- Electronic Common Technical Document (eCTD) tools
- XML validators (ICH E2B R3)

---

### 3.5 P15_SIGDET: Signal Detection Specialist

**Role in UC_PV_013**: Analyzes aggregate safety data for potential signals; prioritizes for investigation

**Responsibilities**:
- Support Step 7 (Signal Detection Screening)
- Conduct statistical signal detection analyses (ROR, PRR, IC, EBGM)
- Review literature for emerging safety concerns
- Analyze social media and patient forums for patient-reported signals
- Prioritize signals for formal evaluation
- Prepare signal evaluation reports
- Coordinate with Medical Safety Officers for clinical review

**Required Expertise**:
- Epidemiology or biostatistics background (MPH, MS Biostats)
- Statistical methods (disproportionality analyses, Bayesian methods)
- Safety databases (FAERS, VigiBase, EudraVigilance)
- Text mining and natural language processing (for literature review)
- Signal management frameworks (EMA GVP Module IX)

**Experience Level**: 3-5+ years pharmacoepidemiology or signal detection

**Tools Used**:
- Statistical software (SAS, R, Python)
- Safety databases (internal + external: FAERS, VigiBase)
- Literature review tools (PubMed, Embase)
- Social media monitoring tools

---

### 3.6 Persona Collaboration Matrix

| Step | Lead Persona | Supporting Personas | Decision Authority | Time |
|------|-------------|---------------------|-------------------|------|
| **Step 1: Case Intake & Triage** | P11_DSA | P13_PVMGR | P13_PVMGR (escalation) | 20 min |
| **Step 2: Medical Coding** | P11_DSA | None | P11_DSA (with QC by P12_MSO) | 30 min |
| **Step 3: Causality Assessment** | P12_MSO | P11_DSA (data gathering) | P12_MSO | 30 min |
| **Step 4: Narrative Generation** | P11_DSA | P12_MSO (review) | P12_MSO (approval) | 40 min |
| **Step 5: Regulatory Reporting Strategy** | P14_REGAFF | P12_MSO, P13_PVMGR | P12_MSO | 20 min |
| **Step 6: Expedited Report Submission** | P14_REGAFF | P13_PVMGR | P13_PVMGR | 15 min |
| **Step 7: Signal Detection Screening** | P15_SIGDET | P12_MSO | P13_PVMGR | 25 min |

**Total Workflow Time**: 3-4 hours per ICSR (for serious, expedited cases)

**Note**: Non-serious, non-expedited cases may be streamlined (Steps 1, 2, 4 only; no causality assessment required).

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 High-Level Workflow Diagram

```
                [START: AE Report Received]
                          |
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 1: CASE INTAKE & TRIAGE                    ║
          ║  Time: 20 minutes                                 ║
          ║  Personas: P11_DSA, P13_PVMGR                     ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 1:       │
                  │ Case Intake   │
                  │ & Triage      │
                  └───────┬───────┘
                          │
                          v
              ┌───────────────────────┐
              │ Is Case Serious?      │◄─────┐
              │ (ICH E2A criteria)    │      │
              └─────┬─────────────────┘      │
                    │                        │
        ┌───────────┴───────────┐            │
        │                       │            │
        v                       v            │
   [YES: Serious]          [NO: Non-serious]│
        │                       │            │
        │                       └────────────┤
        v                                    │
╔═══════════════════════════════════════════│════╗
║  PHASE 2: MEDICAL CODING                  │    ║
║  Time: 30 minutes                         │    ║
║  Personas: P11_DSA                        │    ║
╚═══════════════════════════════════════════│════╝
        │                                    │
        v                                    │
┌───────────────┐                            │
│ STEP 2:       │                            │
│ Medical Coding│                            │
│ (MedDRA, WHO) │                            │
└───────┬───────┘                            │
        │                                    │
        v                                    │
╔═══════════════════════════════════════════│════╗
║  PHASE 3: CAUSALITY ASSESSMENT            │    ║
║  Time: 30 minutes                         │    ║
║  Personas: P12_MSO, P11_DSA               │    ║
╚═══════════════════════════════════════════│════╝
        │                                    │
        │◄───────────────────────────────────┘
        │ (Skip causality for non-serious)
        v
┌───────────────┐
│ STEP 3:       │
│ Causality     │
│ Assessment    │
└───────┬───────┘
        │
        v
╔═══════════════════════════════════════════════╗
║  PHASE 4: NARRATIVE GENERATION                ║
║  Time: 40 minutes                             ║
║  Personas: P11_DSA, P12_MSO                   ║
╚═══════════════════════════════════════════════╝
        │
        v
┌───────────────┐
│ STEP 4:       │
│ Generate ICSR │
│ Narrative     │
└───────┬───────┘
        │
        v
╔═══════════════════════════════════════════════╗
║  PHASE 5: REGULATORY REPORTING                ║
║  Time: 35 minutes                             ║
║  Personas: P14_REGAFF, P12_MSO, P13_PVMGR     ║
╚═══════════════════════════════════════════════╝
        │
        ├────────────────────┐
        v                    v
┌───────────────┐    ┌───────────────┐
│ STEP 5:       │    │ STEP 6:       │
│ Regulatory    │    │ Expedited     │
│ Strategy      │───>│ Submission    │
└───────────────┘    └───────┬───────┘
                             │
                             v
╔═══════════════════════════════════════════════╗
║  PHASE 6: SIGNAL DETECTION                    ║
║  Time: 25 minutes                             ║
║  Personas: P15_SIGDET, P12_MSO                ║
╚═══════════════════════════════════════════════╝
                             │
                             v
                     ┌───────────────┐
                     │ STEP 7:       │
                     │ Signal        │
                     │ Detection     │
                     └───────┬───────┘
                             │
                             v
               [END: ICSR Complete & Submitted]

╔════════════════════════════════════════════════════╗
║ TOTAL TIME: 3-4 hours per serious ICSR            ║
║ CRITICAL PATH: Steps 1→2→3→4→5→6 (sequential)     ║
║ PARALLEL OPPORTUNITIES: Step 7 can run in parallel║
╚════════════════════════════════════════════════════╝
```

---

### 4.2 Workflow Decision Points

**DECISION POINT 1** (Step 1): Is the case serious per ICH E2A?
- **YES** → Proceed to full workflow (Steps 2-7)
- **NO** → Abbreviated workflow (Steps 2, 4 only; skip causality)

**DECISION POINT 2** (Step 1): Is the case valid per ICH E2A minimum criteria?
- **YES** → Proceed
- **NO** → Case rejected; document rationale

**Minimum Criteria for Valid ICSR** (ICH E2A):
1. Identifiable reporter (name/initials)
2. Identifiable patient (age/sex/initials)
3. At least one adverse event
4. At least one suspected product

**DECISION POINT 3** (Step 1): Is the case expedited (7-day or 15-day)?
- **Fatal/Life-threatening + Unexpected** → 7-day FDA report
- **Serious + Unexpected** → 15-day FDA report
- **Serious + Expected** → Non-expedited (periodic reporting)

**DECISION POINT 4** (Step 3): What is the causality assessment outcome?
- **Related** → Reportable to FDA/EMA
- **Not Related** → May not be reportable (depending on regulatory requirements)
- **Insufficient Information** → Request follow-up; may delay reporting

**DECISION POINT 5** (Step 5): Which health authorities require reporting?
- **FDA** (IND or NDA/BLA)
- **EMA** (via EudraVigilance)
- **Other** (PMDA, Health Canada, etc.)
- Depends on: Product approval status, marketing authorization, study location

**DECISION POINT 6** (Step 7): Is there a potential safety signal?
- **YES** → Escalate for formal signal evaluation (separate process)
- **NO** → Continue routine surveillance

---

### 4.3 Workflow Prerequisites

Before starting UC_PV_013, ensure the following are in place:

**System Requirements**:
- ✅ Safety database configured (Oracle Argus, ArisGlobal, etc.)
- ✅ MedDRA and WHO Drug Dictionary licenses active
- ✅ Regulatory submission gateways set up (FDA ESG, EudraVigilance)
- ✅ Electronic submission capability (ICH E2B R3 XML)

**Regulatory Documentation**:
- ✅ Reference Safety Information (RSI) current and approved
- ✅ IND/NDA/BLA number(s) documented
- ✅ Marketing authorization numbers for all countries
- ✅ Pharmacovigilance System Master File (PSMF) current

**Training & Competency**:
- ✅ All DSAs trained on ICH E2B(R3) standards
- ✅ All DSAs MedDRA certified (MSSO training)
- ✅ MSOs trained on causality assessment methods
- ✅ Regulatory Affairs trained on submission procedures

**Templates & SOPs**:
- ✅ ICSR narrative templates available
- ✅ SOPs for case processing, causality assessment, regulatory reporting
- ✅ Quality control checklists

---

### 4.4 Workflow Outputs

**Primary Deliverables**:
1. **Completed ICSR** (in safety database)
   - All required data elements per ICH E2B(R3)
   - MedDRA-coded adverse events
   - WHO-DD coded medications
   - Causality assessment documented
   - Narrative text (structured format)

2. **Regulatory Submission Package** (if expedited)
   - IND Safety Report (FDA Form 3500A or MedWatch)
   - 15-day Alert Report (FDA)
   - ICSR XML file (ICH E2B R3) for electronic submission
   - Cover letter and supporting documentation

3. **Quality Control Documentation**
   - QC checklist completed
   - Any corrections documented
   - Final approval signatures

4. **Signal Detection Output** (if applicable)
   - Signal flag in database
   - Preliminary signal evaluation summary
   - Escalation to signal management team

**Secondary Deliverables**:
5. **Follow-up Request Letters** (if incomplete case)
6. **Acknowledgment Tracking** (submission receipts from agencies)
7. **Audit Trail** (all data changes logged in safety database)

---

## 5. DETAILED STEP-BY-STEP PROMPTS

This section contains the complete, production-ready prompts for each step in the UC_PV_013 workflow. Each prompt follows best practices from Anthropic, OpenAI, Google, and Microsoft's Responsible AI frameworks.

---

### PHASE 1: CASE INTAKE & TRIAGE (20 minutes)

---

#### **STEP 1: Case Intake & Triage** (20 minutes)

**Objective**: Rapidly assess incoming AE report for validity, seriousness, expectedness, and regulatory reporting timeline.

**Persona**: P11_DSA (Lead), P13_PVMGR (Escalation support)

**Prerequisites**:
- AE report received (spontaneous report, clinical trial, literature, etc.)
- Safety database access
- Reference Safety Information (RSI) available

**Process**:

1. **Review Source Information** (5 minutes)
   - Identify report source (spontaneous, trial, literature, etc.)
   - Confirm reporter type (patient, HCP, pharmacist, etc.)
   - Check for duplicate reports (same patient, event, date)

2. **Execute Triage Prompt** (10 minutes)
   - Complete all input variables
   - Generate triage assessment
   - Document in safety database

3. **Escalate if Needed** (5 minutes)
   - If UNCLEAR or complex case → escalate to P13_PVMGR
   - If expedited (7-day/15-day) → flag for priority processing

---

**PROMPT 1.1: AE Report Triage Assessment**

```markdown
**ROLE**: You are P11_DSA, a Drug Safety Associate with expertise in ICH E2A adverse event definitions and regulatory reporting requirements.

**TASK**: Conduct a rapid triage assessment of an incoming adverse event report to determine validity, seriousness, expectedness, and regulatory reporting timeline.

**INPUT**:

**Source Information**:
- Report Source: {spontaneous_report / clinical_trial / literature / other}
- Reporter Type: {patient / physician / pharmacist / other_hcp}
- Reporter Name/Contact: {reporter_identifiers}
- Date Report Received: {YYYY-MM-DD}
- Report ID (if any): {report_id}

**Product Information**:
- Suspected Product(s): {product_name(s)}
- Indication for Use: {indication}
- Dose/Route/Frequency: {dose_route_frequency}
- Product Status: {IND / NDA_approved / marketed_worldwide}
- Start Date: {YYYY-MM-DD or UNKNOWN}
- Stop Date: {YYYY-MM-DD or ONGOING or UNKNOWN}

**Patient Information**:
- Patient Identifiers: {initials / age / sex}
- Age: {XX years or UNKNOWN}
- Sex: {M / F / UNKNOWN}
- Weight: {XX kg or UNKNOWN}
- Relevant Medical History: {brief_summary or NONE}

**Adverse Event(s)**:
- Event Description (verbatim): {reporter_description}
- Event Onset Date: {YYYY-MM-DD or UNKNOWN}
- Event Outcome: {recovered / recovering / not_recovered / fatal / unknown}
- Was event serious? (per reporter): {YES / NO / UNKNOWN}
- Reason for seriousness (if applicable): {death / life_threatening / hospitalization / disability / congenital_anomaly / medically_important}

**Concomitant Medications**:
- List: {medication_list or NONE}

**Additional Context**:
- Is there a dechallenge (drug stopped)?: {YES / NO / NOT_APPLICABLE}
- Is there a rechallenge (drug restarted)?: {YES / NO / NOT_APPLICABLE}
- Did event recur on rechallenge?: {YES / NO / NOT_APPLICABLE}

**Reference Safety Information (RSI)**:
- Is this event listed in current RSI?: {YES / NO / UNCLEAR}
- RSI Section: {section_reference or N/A}

---

**INSTRUCTIONS**:

Conduct a comprehensive triage assessment following this structure:

### 1. CASE VALIDITY (ICH E2A Minimum Criteria)

Assess whether this case meets the four minimum criteria for a valid ICSR:

**Criterion 1: Identifiable Reporter**
- ✅ or ❌: {assessment}
- Rationale: {brief_explanation}

**Criterion 2: Identifiable Patient**
- ✅ or ❌: {assessment}
- Rationale: {brief_explanation}

**Criterion 3: At Least One Adverse Event**
- ✅ or ❌: {assessment}
- Event(s) Described: {list_events}

**Criterion 4: At Least One Suspected Product**
- ✅ or ❌: {assessment}
- Suspected Product(s): {list_products}

**VALIDITY CONCLUSION**:
- ✅ **VALID CASE** → Proceed with processing
- ❌ **INVALID CASE** → Reject case and document rationale
- ⚠️ **UNCLEAR** → Request additional information

If INVALID, document rejection rationale and STOP processing.

---

### 2. SERIOUSNESS ASSESSMENT (ICH E2A)

Determine if the adverse event meets ICH E2A criteria for a serious adverse event (SAE).

**ICH E2A Serious Criteria** (any ONE of the following):

**Death**
- Did the event result in death? {YES / NO}
- If YES, date of death: {YYYY-MM-DD}

**Life-Threatening**
- Did the event place the patient at immediate risk of death? {YES / NO}
- Rationale: {explanation}

**Hospitalization or Prolongation**
- Did the event require initial or prolonged hospitalization? {YES / NO}
- Hospital admission date: {YYYY-MM-DD}
- Discharge date: {YYYY-MM-DD or ONGOING}

**Persistent or Significant Disability/Incapacity**
- Did the event result in persistent or significant disability? {YES / NO}
- Description: {brief_description}

**Congenital Anomaly/Birth Defect**
- Did the event involve congenital anomaly? {YES / NO}
- (Applies to offspring of exposed patient)

**Medically Important Event**
- Does the event require medical intervention to prevent one of the above outcomes? {YES / NO}
- Clinical Judgment Rationale: {explanation}
- Examples: allergic bronchospasm requiring treatment, blood dyscrasias, seizures

**SERIOUSNESS CONCLUSION**:
- ✅ **SERIOUS** (meets ≥1 criterion)
- ❌ **NON-SERIOUS**

If SERIOUS, specify which criterion/criteria apply: {list}

---

### 3. EXPECTEDNESS ASSESSMENT

Compare the reported event to Reference Safety Information (RSI) to determine if the event is expected or unexpected.

**RSI Review**:
- Current RSI Source: {IB / Package_Insert / IFU}
- Version Date: {YYYY-MM-DD}
- Is event listed in RSI?: {YES / NO / UNCLEAR}
- RSI Section/Location: {section_reference}

**Expectedness Determination**:
- Event term in RSI: {verbatim_RSI_text or NOT_LISTED}
- Specificity match: {event_description_matches_RSI_specificity / more_specific / less_specific}

**EXPECTEDNESS CONCLUSION**:
- ✅ **EXPECTED** (event listed in RSI with comparable specificity)
- ❌ **UNEXPECTED** (event not listed OR listed with less specificity)

**Rationale**: {brief_explanation}

**Note**: If UNCLEAR, default to UNEXPECTED for regulatory reporting purposes (conservative approach).

---

### 4. REGULATORY REPORTING TIMELINE

Determine the appropriate regulatory reporting timeline based on seriousness and expectedness.

**FDA Requirements (21 CFR 312.32 for IND, 21 CFR 314.80 for NDA/BLA)**:

**7-Day Expedited Report**:
- Criteria: Serious + Unexpected + (Fatal OR Life-threatening)
- Does this case meet criteria? {YES / NO}

**15-Day Expedited Report**:
- Criteria: Serious + Unexpected
- Does this case meet criteria? {YES / NO}

**Non-Expedited (Periodic) Report**:
- Criteria: Non-serious OR (Serious + Expected)
- Does this case meet criteria? {YES / NO}

**REPORTING TIMELINE CONCLUSION**:
- 🚨 **7-DAY REPORT** (Due: {YYYY-MM-DD at 5 PM EST})
- 🔔 **15-DAY REPORT** (Due: {YYYY-MM-DD at 5 PM EST})
- 📅 **PERIODIC REPORT** (Include in next quarterly/annual report)

**Clock Start Date**: {date_report_received}
**Due Date Calculation**: {show_calculation}

---

### 5. CASE PRIORITIZATION & NEXT STEPS

**Case Priority**:
- 🔴 **HIGH**: 7-day report, fatal outcome, or significant safety concern
- 🟡 **MEDIUM**: 15-day report, serious but not life-threatening
- 🟢 **LOW**: Non-serious, expected, periodic reporting

**Assigned Priority**: {HIGH / MEDIUM / LOW}

**Immediate Actions Required**:
1. {action_1}
2. {action_2}
3. {action_3}

**Information Gaps** (if any):
- Missing data element: {description}
- Follow-up required?: {YES / NO}
- Follow-up method: {phone_call / letter / not_applicable}

**Escalation Needed?**:
- Complex medical scenario?: {YES / NO}
- Unclear expectedness?: {YES / NO}
- Multiple product suspects?: {YES / NO}
- If YES, escalate to: {P13_PVMGR / P12_MSO}

---

### 6. TRIAGE SUMMARY

**Case Triage Summary Table**:

| Element | Assessment |
|---------|-----------|
| **Case Valid?** | {VALID / INVALID / UNCLEAR} |
| **Serious?** | {YES / NO} |
| **Serious Criteria** | {list_criteria or N/A} |
| **Expected?** | {YES / NO / UNCLEAR} |
| **Reporting Timeline** | {7-DAY / 15-DAY / PERIODIC} |
| **Due Date** | {YYYY-MM-DD or N/A} |
| **Priority** | {HIGH / MEDIUM / LOW} |
| **Next Step** | {proceed_to_coding / follow-up_needed / escalate / reject} |

**Safety Database Entry**:
- Case ID: {assign_unique_case_id}
- Triage completed by: {DSA_name}
- Triage date/time: {YYYY-MM-DD HH:MM}

---

**OUTPUT FORMAT**:
- Completed triage assessment (2-3 pages)
- Clear determination of validity, seriousness, expectedness, timeline
- Action plan for next steps
- Documented in safety database

**QUALITY CHECKS**:
- [ ] All four ICH E2A minimum criteria evaluated
- [ ] Seriousness criteria systematically reviewed
- [ ] RSI consulted for expectedness
- [ ] Reporting timeline calculated correctly
- [ ] Case prioritized appropriately
- [ ] Next steps clearly defined

```

**Expected Output**:
- Complete Triage Assessment (2-3 pages)
- Case prioritization (HIGH/MEDIUM/LOW)
- Reporting timeline determination (7-day, 15-day, periodic)
- Action plan documented in safety database

**Quality Check**:
- [ ] Case validity confirmed
- [ ] Seriousness assessed per ICH E2A
- [ ] Expectedness determination made
- [ ] Reporting timeline calculated
- [ ] Priority assigned
- [ ] Safety database entry complete

**Deliverable**: Triage Assessment (save in safety database as Case Note)

---

### PHASE 2: MEDICAL CODING (30 minutes)

---

#### **STEP 2: Medical Coding (MedDRA & WHO-DD)** (30 minutes)

**Objective**: Assign standardized medical codes to adverse events (MedDRA) and medications (WHO Drug Dictionary) to enable global regulatory reporting and signal detection.

**Persona**: P11_DSA (Lead)

**Prerequisites**:
- Completed triage (Step 1)
- MedDRA and WHO-DD access
- ICH E2B(R3) coding rules

**Process**:

1. **Review Verbatim Terms** (5 minutes)
   - Identify all adverse events described in report
   - Identify all suspected and concomitant medications
   - Note any medical history terms requiring coding

2. **Execute Medical Coding Prompt** (20 minutes)
   - Code adverse events using MedDRA
   - Code medications using WHO Drug Dictionary
   - Document in safety database

3. **Quality Control** (5 minutes)
   - Review coding for accuracy
   - Verify PT-level (Preferred Term) codes used for AEs
   - Verify drug codes include substance + product form

---

**PROMPT 2.1: MedDRA and WHO-DD Medical Coding**

```markdown
**ROLE**: You are P11_DSA, a MedDRA-certified Drug Safety Associate with expertise in medical terminology and ICH E2B(R3) coding standards.

**TASK**: Assign standardized medical codes to adverse events and medications following MedDRA and WHO Drug Dictionary coding rules.

**INPUT**:

**Case Context**:
- Case ID: {case_id}
- Product: {product_name}
- Patient Demographics: {age / sex}
- Report Source: {spontaneous / trial / literature}

**Adverse Event(s) to Code**:

For EACH adverse event reported:

**Event 1**:
- Verbatim Term (reporter's words): {verbatim_description}
- Onset Date: {YYYY-MM-DD or UNKNOWN}
- Outcome: {recovered / recovering / not_recovered / fatal / unknown}
- Seriousness: {YES / NO}
- Additional Clinical Details: {relevant_context}

**Event 2**:
- Verbatim Term: {verbatim_description}
- [... repeat for all events]

**Suspected Medication(s) to Code**:

For EACH suspected product:

**Medication 1**:
- Verbatim Term: {product_name_as_reported}
- Active Ingredient(s): {ingredient_1, ingredient_2, ...}
- Strength: {dose_and_units}
- Dosage Form: {tablet / capsule / injection / etc.}
- Route: {oral / IV / topical / etc.}
- Manufacturer: {company_name if known}

**Medication 2**:
- [... repeat for all suspected products]

**Concomitant Medication(s) to Code**:

For EACH concomitant medication:

**Concomitant 1**:
- Verbatim Term: {product_name_as_reported}
- Active Ingredient(s): {ingredient_1, ...}
- [... same fields as above]

**Medical History Terms to Code** (if any):
- Verbatim Term 1: {history_term}
- Verbatim Term 2: {history_term}

---

**INSTRUCTIONS**:

### PART A: MEDDRA CODING FOR ADVERSE EVENTS

For each adverse event, assign MedDRA codes following ICH E2B(R3) rules.

**MedDRA Coding Principles**:
1. **Use Preferred Term (PT) level** for adverse event coding (not LLT or HLT)
2. **Code what the patient experienced**, not the underlying diagnosis (unless diagnosis is the AE)
3. **Code each sign/symptom separately** if they represent distinct events
4. **Do not code lab values** alone; code the clinical interpretation (e.g., not "ALT 200", but "hepatotoxicity" or "hepatic enzyme increased")
5. **Code outcome separately** if it represents a distinct event (e.g., "myocardial infarction" + "death" as separate terms)

**For EACH Adverse Event:**

**Event 1 Coding**:

**Step 1: Identify Clinical Concept**
- What is the clinical condition described?: {clinical_interpretation}
- Is this a diagnosis, sign, symptom, or lab finding?: {category}

**Step 2: Search MedDRA**
- Potential MedDRA PTs considered:
  1. {PT_option_1} (Code: {XXXXXXXX})
  2. {PT_option_2} (Code: {XXXXXXXX})
  3. {PT_option_3} (Code: {XXXXXXXX})

**Step 3: Select Best PT**
- **Selected PT**: {preferred_term_name}
- **MedDRA Code**: {XXXXXXXX}
- **SOC (System Organ Class)**: {SOC_name}
- **HLGT (High Level Group Term)**: {HLGT_name}
- **HLT (High Level Term)**: {HLT_name}

**Rationale for PT Selection**:
{Explain why this PT was chosen over alternatives. Consider:
- Specificity (choose most specific PT that accurately describes event)
- Severity (PT should reflect severity if part of event description)
- Medical accuracy (consult medical reference if needed)}

**Coding Confidence**: {HIGH / MEDIUM / LOW}
- If LOW, note reason and consider escalation to P12_MSO for medical review

---

**Event 2 Coding**:
[Repeat structure for Event 2]

---

**Event 3 Coding** (if applicable):
[Repeat structure for Event 3]

---

**MedDRA Coding Summary Table**:

| Event Verbatim | Selected MedDRA PT | PT Code | SOC | Seriousness | Outcome |
|----------------|-------------------|---------|-----|-------------|---------|
| {verbatim_1} | {PT_1} | {code_1} | {SOC_1} | {Y/N} | {outcome_1} |
| {verbatim_2} | {PT_2} | {code_2} | {SOC_2} | {Y/N} | {outcome_2} |
| {verbatim_3} | {PT_3} | {code_3} | {SOC_3} | {Y/N} | {outcome_3} |

---

### PART B: WHO DRUG DICTIONARY CODING FOR MEDICATIONS

For each suspected and concomitant medication, assign WHO Drug Dictionary codes.

**WHO-DD Coding Principles**:
1. **Code at drug substance level** + product form (e.g., "Atorvastatin tablet")
2. **Include combination products** as single entry (e.g., "Amoxicillin + Clavulanic acid")
3. **Use generic name** when available
4. **Specify route** if relevant to AE (e.g., "Epinephrine injection" vs. "Epinephrine inhalation")

**For EACH Medication:**

**Suspected Medication 1 Coding**:

**Step 1: Identify Drug Substance(s)**
- Active ingredient(s): {ingredient_1, ingredient_2 if combination}
- Is this a single-agent or combination product?: {single / combination}

**Step 2: Identify Product Characteristics**
- Dosage form: {tablet / capsule / injection / cream / etc.}
- Strength: {dose_and_units}
- Route: {oral / IV / IM / topical / etc.}
- Manufacturer/Trade name: {if_available}

**Step 3: Search WHO Drug Dictionary**
- Potential WHO-DD entries considered:
  1. {drug_entry_option_1} (Code: {XXXXXX})
  2. {drug_entry_option_2} (Code: {XXXXXX})

**Step 4: Select WHO-DD Entry**
- **Selected WHO-DD Term**: {drug_name_dosage_form}
- **WHO-DD Code**: {XXXXXX}
- **ATC Code**: {AXXX (Anatomical Therapeutic Chemical Classification)}
- **Drug Role**: {SUSPECT / CONCOMITANT}

**Rationale**: {brief_explanation}

---

**Suspected Medication 2 Coding** (if applicable):
[Repeat structure]

---

**Concomitant Medication 1 Coding**:
[Repeat structure, marking as CONCOMITANT]

---

**WHO-DD Coding Summary Table**:

| Verbatim Product Name | WHO-DD Term | WHO-DD Code | ATC Code | Role | Indication |
|-----------------------|-------------|-------------|----------|------|------------|
| {verbatim_1} | {WHO-DD_term_1} | {code_1} | {ATC_1} | SUSPECT | {indication} |
| {verbatim_2} | {WHO-DD_term_2} | {code_2} | {ATC_2} | CONCOMITANT | {indication} |
| {verbatim_3} | {WHO-DD_term_3} | {code_3} | {ATC_3} | CONCOMITANT | {indication} |

---

### PART C: MEDICAL HISTORY CODING (if applicable)

For each relevant medical history term:

**Medical History 1**:
- Verbatim: {medical_history_term}
- MedDRA PT: {preferred_term}
- MedDRA Code: {XXXXXXXX}
- SOC: {SOC_name}

**Medical History 2**:
[Repeat as needed]

---

### PART D: QUALITY CONTROL CHECKS

**Coding Quality Checklist**:

**MedDRA Coding**:
- [ ] All adverse events coded at PT level (not LLT or HLT)
- [ ] Most specific PT selected for each event
- [ ] Serious events coded appropriately (e.g., not "chest pain" when "myocardial infarction" is accurate)
- [ ] Multiple PTs used if patient experienced distinct events
- [ ] Coding confidence documented (HIGH/MEDIUM/LOW)

**WHO-DD Coding**:
- [ ] All suspected products coded
- [ ] All concomitant products coded (at minimum, those relevant to causality assessment)
- [ ] Drug substance + dosage form specified
- [ ] Combination products coded as single entries
- [ ] ATC codes included

**ICH E2B(R3) Compliance**:
- [ ] Coding follows ICH E2B(R3) data element requirements
- [ ] Required fields populated (PT, PT Code, SOC for AEs; Drug name, code for products)

**Escalation Needed?**:
- Complex medical terminology?: {YES / NO} → If YES, escalate to P12_MSO
- Uncertainty in PT selection?: {YES / NO} → If YES, request medical review
- Rare event not in MedDRA?: {YES / NO} → If YES, consult MedDRA MSSO

---

### PART E: CODING SUMMARY FOR DATABASE ENTRY

**Final Coded Data Entry**:

**Adverse Events**:
1. {verbatim_term} → MedDRA PT: {PT_name} (Code: {XXXXXXXX})
2. {verbatim_term} → MedDRA PT: {PT_name} (Code: {XXXXXXXX})
3. [... list all events]

**Medications**:
1. {verbatim_product} → WHO-DD: {drug_term} (Code: {XXXXXX}) [SUSPECT]
2. {verbatim_product} → WHO-DD: {drug_term} (Code: {XXXXXX}) [CONCOMITANT]
3. [... list all medications]

**Coding Completed By**: {DSA_name}
**Coding Date**: {YYYY-MM-DD}
**QC Review Required**: {YES / NO}

---

**OUTPUT FORMAT**:
- Completed medical coding (all events and products coded)
- MedDRA PT codes (8-digit codes)
- WHO-DD codes (6-digit codes)
- Coding rationale documented for complex cases
- QC checklist completed
- Data entered in safety database

**CRITICAL REQUIREMENTS**:
- Use MedDRA **current version** (check version date)
- Use WHO-DD **current version**
- Follow ICH E2B(R3) coding rules
- Document coding rationale for auditability
- Escalate uncertain cases for medical review

```

**Expected Output**:
- All adverse events coded with MedDRA PTs (with 8-digit codes)
- All medications coded with WHO-DD terms (with 6-digit codes)
- Coding rationale documented
- Summary tables for audit trail

**Quality Check**:
- [ ] MedDRA PTs selected appropriately
- [ ] WHO-DD terms match verbatim products
- [ ] All required data elements coded
- [ ] Coding confidence documented
- [ ] Complex cases escalated if needed

**Deliverable**: Medical Coding Summary (entered in safety database)

---

### PHASE 3: CAUSALITY ASSESSMENT (30 minutes)

---

#### **STEP 3: Causality Assessment** (30 minutes)

**Objective**: Systematically evaluate the relationship between suspected product(s) and adverse event(s) using structured causality assessment methods and clinical judgment.

**Persona**: P12_MSO (Lead - Medical Safety Officer), P11_DSA (Support - data gathering)

**Prerequisites**:
- Completed triage and medical coding (Steps 1-2)
- Product prescribing information and safety data available
- Causality assessment algorithm training (Naranjo, WHO-UMC, etc.)

**Note**: Causality assessment is **required for serious, unexpected events** reported to FDA/EMA. It may be optional for non-serious, expected events depending on company SOPs.

**Process**:

1. **Review Case Data** (5 minutes)
   - Review completed ICSR data
   - Identify all potential causality factors
   - Gather relevant literature (if needed)

2. **Execute Causality Assessment Prompt** (20 minutes)
   - Apply structured algorithm (Naranjo, WHO-UMC)
   - Apply clinical judgment
   - Document assessment rationale

3. **Finalize Assessment** (5 minutes)
   - Document final causality category
   - Obtain P12_MSO approval
   - Enter in safety database

---

**PROMPT 3.1: Structured Causality Assessment**

```markdown
**ROLE**: You are P12_MSO, a Medical Safety Officer (physician or PharmD) with expertise in pharmacology, adverse drug reactions, and causality assessment methodology.

**TASK**: Conduct a comprehensive causality assessment to determine the relationship between suspected product(s) and reported adverse event(s).

**INPUT**:

**Case Summary**:
- Case ID: {case_id}
- Patient Demographics: {age / sex / weight}
- Indication for Treatment: {indication}
- Medical History: {relevant_history}

**Suspected Product(s)**:
- Product 1: {product_name}
  - Active Ingredient: {generic_name}
  - Dose/Route/Frequency: {dose_route_frequency}
  - Start Date: {YYYY-MM-DD}
  - Stop Date: {YYYY-MM-DD or ONGOING}
  - Indication: {indication_for_use}

- Product 2 (if applicable): {product_details}

**Adverse Event(s)**:
- Event: {MedDRA_PT}
  - Verbatim Description: {reporter_description}
  - Onset Date: {YYYY-MM-DD}
  - Time to Onset (from product start): {X days/weeks}
  - Outcome: {recovered / recovering / not_recovered / fatal}
  - Seriousness: {serious_criteria}

**Temporal Relationship**:
- Time from product start to event onset: {X days}
- Event occurred during product use?: {YES / NO}
- Event resolved after product stopped (dechallenge)?: {YES / NO / NOT_APPLICABLE}
- Event recurred when product restarted (rechallenge)?: {YES / NO / NOT_APPLICABLE}

**Concomitant Medications**:
- Medication 1: {name / dose / dates}
- Medication 2: {name / dose / dates}
- [... list all relevant concomitants]

**Alternative Explanations**:
- Underlying Disease: {could_disease_explain_event? / rationale}
- Concomitant Medications: {could_concomitants_explain_event? / which_ones / rationale}
- Other Factors: {any_other_factors? / rationale}

**Product Labeling Review**:
- Is this event listed in product labeling?: {YES / NO}
- Section where listed: {warnings_and_precautions / adverse_reactions / other}
- Frequency in labeling: {common / uncommon / rare / not_stated}

**Literature Review** (if conducted):
- Published case reports of this event with this product?: {YES / NO / number_of_cases}
- Mechanism of action supports event?: {YES / NO / rationale}
- Drug class effect?: {YES / NO / rationale}

---

**INSTRUCTIONS**:

Conduct a structured causality assessment using **BOTH** algorithmic and clinical judgment approaches.

---

### PART A: NARANJO ALGORITHM

Apply the Naranjo Adverse Drug Reaction Probability Scale.

**Instructions**: Answer each question with YES (+points), NO (0 or -points), or DO NOT KNOW/NOT APPLICABLE (0 points).

| Question | Response | Score |
|----------|----------|-------|
| 1. Are there previous conclusive reports on this reaction? | {YES +1 / NO 0 / DK 0} | {score} |
| 2. Did the adverse event appear after the suspected drug was administered? | {YES +2 / NO -1 / DK 0} | {score} |
| 3. Did the adverse reaction improve when the drug was discontinued or a specific antagonist was administered? | {YES +1 / NO 0 / DK 0} | {score} |
| 4. Did the adverse event reappear when the drug was re-administered? | {YES +2 / NO -1 / DK 0} | {score} |
| 5. Are there alternative causes (other than the drug) that could have caused the reaction? | {YES -1 / NO +2 / DK 0} | {score} |
| 6. Did the reaction reappear when a placebo was given? | {YES -1 / NO +1 / DK 0} | {score} |
| 7. Was the drug detected in blood (or other fluids) in concentrations known to be toxic? | {YES +1 / NO 0 / DK 0} | {score} |
| 8. Was the reaction more severe when the dose was increased or less severe when the dose was decreased? | {YES +1 / NO 0 / DK 0} | {score} |
| 9. Did the patient have a similar reaction to the same or similar drugs in any previous exposure? | {YES +1 / NO 0 / DK 0} | {score} |
| 10. Was the adverse event confirmed by any objective evidence? | {YES +1 / NO 0 / DK 0} | {score} |

**Naranjo Total Score**: {sum_of_scores}

**Naranjo Interpretation**:
- **≥9**: Definite
- **5-8**: Probable
- **1-4**: Possible
- **≤0**: Doubtful

**Naranjo Causality Category**: {Definite / Probable / Possible / Doubtful}

---

### PART B: WHO-UMC CAUSALITY CATEGORIES

Apply the WHO-UMC (Uppsala Monitoring Centre) causality assessment system.

**WHO-UMC Categories**:

**Certain**:
- Event or laboratory test abnormality with plausible time relationship to drug intake
- Cannot be explained by disease or other drugs
- Response to withdrawal clinically plausible
- Event definitive pharmacologically or phenomenologically (rechallenge satisfactory if necessary)

**Does this case meet "Certain" criteria?**: {YES / NO}
- Rationale: {explanation}

---

**Probable/Likely**:
- Event or laboratory test abnormality with reasonable time relationship to drug intake
- Unlikely to be attributed to disease or other drugs
- Response to withdrawal clinically reasonable
- Rechallenge not required

**Does this case meet "Probable" criteria?**: {YES / NO}
- Rationale: {explanation}

---

**Possible**:
- Event or laboratory test abnormality with reasonable time relationship to drug intake
- Could also be explained by disease or other drugs
- Information on drug withdrawal may be lacking or unclear

**Does this case meet "Possible" criteria?**: {YES / NO}
- Rationale: {explanation}

---

**Unlikely**:
- Event or laboratory test abnormality with time to drug intake that makes relationship improbable
- Other drugs, chemicals, or underlying disease provide plausible explanations

**Does this case meet "Unlikely" criteria?**: {YES / NO}
- Rationale: {explanation}

---

**Conditional/Unclassified**:
- Event or laboratory test abnormality
- More data for proper assessment needed OR additional data under examination

**Does this case meet "Conditional" criteria?**: {YES / NO}
- Rationale: {explanation}

---

**Unassessable/Unclassifiable**:
- Report suggesting adverse reaction
- Cannot be judged because information is insufficient or contradictory
- Data cannot be supplemented or verified

**Does this case meet "Unassessable" criteria?**: {YES / NO}
- Rationale: {explanation}

---

**WHO-UMC Causality Category**: {Certain / Probable / Possible / Unlikely / Conditional / Unassessable}

---

### PART C: CLINICAL JUDGMENT ASSESSMENT

Beyond algorithms, apply clinical expertise to assess causality.

**Clinical Considerations**:

**1. Temporal Plausibility**
- Is the time to onset consistent with known pharmacology of the drug?: {YES / NO}
- Rationale: {explanation}
  - Example: Anaphylaxis within minutes to hours → plausible for allergic reaction
  - Example: Cancer after 2 days of therapy → implausible (insufficient latency)

**2. Biologic Plausibility**
- Does the drug's mechanism of action support this event?: {YES / NO}
- Rationale: {explanation}
  - Example: Anticoagulant causing bleeding → biologically plausible
  - Example: Antibiotic causing hair loss → less plausible (no known mechanism)

**3. Dose-Response Relationship**
- Is there evidence of dose-response?: {YES / NO / INSUFFICIENT_DATA}
- Rationale: {explanation}
  - Did event worsen with dose increase?
  - Did event improve with dose decrease?

**4. Dechallenge (Drug Discontinuation)**
- Was drug discontinued?: {YES / NO}
- Did event improve after discontinuation?: {YES / NO / TOO_SOON_TO_ASSESS}
- Time to improvement: {X days or NOT_APPLICABLE}
- Clinical assessment: {positive_dechallenge / negative_dechallenge / unclear}

**5. Rechallenge (Drug Re-administration)**
- Was drug restarted?: {YES / NO / NOT_APPLICABLE}
- Did event recur?: {YES / NO / NOT_APPLICABLE}
- Time to recurrence: {X days or NOT_APPLICABLE}
- Clinical assessment: {positive_rechallenge / negative_rechallenge / unclear}
- **Note**: Rechallenge data is highly valuable but rarely available in spontaneous reports

**6. Alternative Explanations**
- Could underlying disease explain the event?: {YES / NO / PARTIALLY}
- Rationale: {explanation}
  - Example: Myocardial infarction in patient with known coronary artery disease → disease could contribute, but drug may also contribute

- Could concomitant medication(s) explain the event?: {YES / NO / PARTIALLY}
- Which medication(s)?: {list_if_applicable}
- Rationale: {explanation}

- Could other factors (e.g., diet, environment) explain the event?: {YES / NO}
- Factors: {list_if_applicable}

**7. Literature/Evidence Review**
- Published case reports of this event with this drug?: {YES / NO / number}
- Large clinical trials showing increased risk?: {YES / NO / cite_if_available}
- Mechanism of action studies supporting event?: {YES / NO}
- Drug class effect (e.g., all beta-blockers cause bradycardia)?: {YES / NO}

**Clinical Evidence Summary**:
{1-2 paragraph synthesis of clinical evidence supporting or refuting causality}

---

### PART D: FINAL CAUSALITY DETERMINATION

**Synthesis of Assessments**:

| Assessment Method | Result | Weight in Decision |
|------------------|--------|-------------------|
| **Naranjo Algorithm** | {Definite / Probable / Possible / Doubtful} | {High / Medium / Low} |
| **WHO-UMC Categories** | {Certain / Probable / Possible / Unlikely / Conditional / Unassessable} | {High / Medium / Low} |
| **Clinical Judgment** | {Strong evidence / Moderate evidence / Weak evidence / Insufficient evidence} | {HIGH} |

**Final Causality Category** (company-specific or WHO-UMC):
- ✅ **RELATED** (Certain, Probable/Likely, or Possible per WHO-UMC)
- ❌ **NOT RELATED** (Unlikely per WHO-UMC)
- ⚠️ **INSUFFICIENT INFORMATION** (Conditional/Unassessable per WHO-UMC)

**Rationale for Final Assessment** (2-3 paragraphs):
{Explain why you reached this conclusion. Address:
- Key factors supporting causality (temporal relationship, dechallenge, literature, etc.)
- Key factors against causality (alternative explanations, implausible mechanism, etc.)
- How you weighed competing factors
- Whether this is a known, labeled event or novel signal
- Any uncertainty or areas requiring follow-up}

**Causality Confidence Level**: {HIGH / MEDIUM / LOW}
- HIGH: Strong evidence; would be reproducible by other assessors
- MEDIUM: Moderate evidence; some uncertainty remains
- LOW: Weak evidence; conflicting data or insufficient information

---

### PART E: REGULATORY IMPACT

**Reporting Implications**:

**FDA Reporting (21 CFR 312.32 / 314.80)**:
- Causality category: {RELATED / NOT_RELATED}
- Does this event require expedited reporting (if serious + unexpected + related)?: {YES / NO}
- If NO, reason: {expected / not_serious / not_related}

**EMA Reporting (GVP)**:
- Causality category: {RELATED / NOT_RELATED}
- Does this event require reporting to EudraVigilance?: {YES / NO}

**Impact on Product Safety Profile**:
- Is this a new signal (not previously reported)?: {YES / NO}
- Does this require signal evaluation?: {YES / NO}
- Should this be escalated for signal management review?: {YES / NO}
- Does this impact benefit-risk assessment?: {YES / NO / UNCLEAR}

---

### PART F: DOCUMENTATION & APPROVAL

**Causality Assessment Summary**:

| Element | Assessment |
|---------|-----------|
| **Naranjo Score** | {score} ({category}) |
| **WHO-UMC Category** | {category} |
| **Clinical Judgment** | {supportive / neutral / refutes causality} |
| **Final Causality** | {RELATED / NOT_RELATED / INSUFFICIENT_INFO} |
| **Confidence Level** | {HIGH / MEDIUM / LOW} |
| **Assessed By** | {P12_MSO name and credentials} |
| **Assessment Date** | {YYYY-MM-DD} |
| **QC Review Required** | {YES / NO} |

**Follow-Up Actions** (if applicable):
- [ ] Request additional information from reporter
- [ ] Conduct literature search for similar cases
- [ ] Escalate to signal detection team
- [ ] Update product safety profile
- [ ] No further action required

**Approval**:
- Causality assessment reviewed and approved by: {P12_MSO signature}
- Date: {YYYY-MM-DD}

---

**OUTPUT FORMAT**:
- Completed causality assessment (3-4 pages)
- Naranjo and WHO-UMC scores documented
- Clinical rationale clearly explained
- Final causality category assigned
- Regulatory impact assessed
- P12_MSO approval documented

**QUALITY CHECKS**:
- [ ] Both algorithmic and clinical judgment applied
- [ ] Temporal relationship evaluated
- [ ] Alternative explanations considered
- [ ] Dechallenge/rechallenge data reviewed (if available)
- [ ] Literature reviewed
- [ ] Rationale clearly documented for audit trail
- [ ] Assessment reproducible by another MSO

**CRITICAL REQUIREMENTS**:
- Causality assessment must be **defensible** in regulatory inspection
- Assessment must be **consistent** across similar cases
- Any **uncertainty** must be documented (not hidden)
- **Clinical judgment** takes precedence over algorithm if there is conflict

```

**Expected Output**:
- Complete Causality Assessment (3-4 pages)
- Naranjo score and WHO-UMC category documented
- Clinical rationale clearly explained
- Final causality determination (RELATED / NOT RELATED)
- P12_MSO approval signature

**Quality Check**:
- [ ] Algorithmic methods applied
- [ ] Clinical judgment documented
- [ ] Alternative explanations considered
- [ ] Final assessment defensible
- [ ] MSO approval obtained

**Deliverable**: Causality Assessment (entered in safety database)

---

### PHASE 4: NARRATIVE GENERATION (40 minutes)

---

#### **STEP 4: ICSR Narrative Generation** (40 minutes)

**Objective**: Create a clear, concise, medically accurate narrative summary of the ICSR following ICH E2B(R3) standards and company templates.

**Persona**: P11_DSA (Lead - drafts narrative), P12_MSO (Review - approves narrative)

**Prerequisites**:
- Completed triage, coding, and causality assessment (Steps 1-3)
- ICSR narrative template available
- Medical writing guidelines

**Process**:

1. **Review Case Data** (5 minutes)
   - Review all completed sections (triage, coding, causality)
   - Identify key elements for narrative
   - Note any special circumstances (pregnancy, pediatric, etc.)

2. **Execute Narrative Generation Prompt** (30 minutes)
   - Draft narrative following structured template
   - Include all ICH E2B(R3) required elements
   - Apply medical writing best practices

3. **Medical Review & Approval** (5 minutes)
   - P12_MSO reviews narrative for medical accuracy
   - Edits as needed
   - Approves final narrative

---

**PROMPT 4.1: ICSR Narrative Generation**

```markdown
**ROLE**: You are P11_DSA, a Drug Safety Associate with expertise in medical writing and ICH E2B(R3) narrative standards.

**TASK**: Generate a clear, concise, medically accurate ICSR narrative that synthesizes all case information and follows ICH E2B(R3) and company narrative standards.

**INPUT**:

**Case Overview**:
- Case ID: {case_id}
- Reporting Date: {YYYY-MM-DD}
- Case Priority: {7-DAY / 15-DAY / PERIODIC}

**Reporter Information**:
- Reporter Type: {physician / pharmacist / patient / other_hcp}
- Reporter Country: {country}
- Report Source: {spontaneous / clinical_trial / literature / other}

**Patient Information**:
- Age: {XX years or age_range}
- Sex: {M / F}
- Weight: {XX kg or UNKNOWN}
- Ethnicity: {if_available or NOT_REPORTED}
- Relevant Medical History: {summary or NONE}

**Product Information**:
- Suspected Product(s): {product_name(s)}
- Active Ingredient(s): {generic_name(s)}
- Indication for Use: {indication}
- Dose/Route/Frequency: {dose_route_frequency}
- Therapy Start Date: {YYYY-MM-DD}
- Therapy Stop Date: {YYYY-MM-DD or ONGOING}
- Lot/Batch Number: {if_available}

**Concomitant Medications**:
- Medication 1: {name / indication}
- Medication 2: {name / indication}
- [... list all relevant concomitants]

**Adverse Event(s)**:
- Event 1: {MedDRA_PT}
  - Verbatim: {reporter_description}
  - Onset Date: {YYYY-MM-DD}
  - Time to Onset: {X days from product start}
  - Seriousness: {serious_criteria}
  - Outcome: {recovered / recovering / not_recovered / fatal}
  - Dechallenge: {event_resolved_after_product_stopped? / timeline}
  - Rechallenge: {event_recurred_on_restart? / timeline}

- Event 2 (if applicable): {details}

**Causality Assessment**:
- Causality Category: {RELATED / NOT_RELATED}
- Naranjo Score: {score} ({category})
- WHO-UMC Category: {category}
- Clinical Rationale: {brief_summary}

**Laboratory/Diagnostic Test Results** (if relevant):
- Test 1: {test_name / date / result / units / reference_range}
- Test 2: {test_name / date / result / units / reference_range}
- Clinical Significance: {interpretation}

**Treatment for Adverse Event** (if applicable):
- Interventions: {medications_given / procedures / hospitalizations}
- Response to Treatment: {improved / no_change / worsened}

**Outcome**:
- Final Outcome: {recovered_fully / recovering / permanent_sequelae / fatal}
- Date of Outcome: {YYYY-MM-DD}
- If Fatal, Date of Death: {YYYY-MM-DD}

**Follow-Up Information** (if applicable):
- Follow-up conducted?: {YES / NO}
- Additional information obtained: {summary}

---

**INSTRUCTIONS**:

Generate a structured ICSR narrative following ICH E2B(R3) standards and the template below.

**Narrative Structure**:
1. **Introduction** (patient demographics, product, indication)
2. **Event Description** (what happened, when, severity)
3. **Clinical Course** (progression, interventions, outcome)
4. **Relevant History & Concomitants** (context)
5. **Causality & Assessment** (reporter's opinion, company assessment)
6. **Conclusion** (outcome, current status)

**Narrative Writing Principles**:
- **Clarity**: Use plain language; avoid jargon unless necessary
- **Conciseness**: Typically 200-400 words (1-2 paragraphs for simple cases, up to 1 page for complex cases)
- **Completeness**: Include all ICH E2B(R3) required elements
- **Medical Accuracy**: Ensure clinical details are correct
- **Objectivity**: Present facts; avoid speculation
- **Chronology**: Present events in logical, temporal sequence
- **Passive Voice**: Standard in regulatory writing (e.g., "the patient was hospitalized" not "we hospitalized the patient")

---

### ICSR NARRATIVE

**Case Narrative for Case ID: {case_id}**

**Paragraph 1: Introduction & Event Description**

{Write a clear, concise introduction that includes:
- Patient demographics (age, sex)
- Indication for treatment
- Suspected product(s), dose, route, start date
- Adverse event(s) reported (MedDRA PT or verbatim if PT is not descriptive)
- Date of event onset
- Seriousness (e.g., "resulted in hospitalization")}

Example Structure:
"This is a spontaneous report received from a [reporter_type] concerning a [age]-year-old [male/female] patient who was treated with [PRODUCT_NAME] ([generic_name], [dose], [route], [frequency]) for [indication]. On [date], approximately [X days/weeks] after starting therapy, the patient experienced [EVENT_DESCRIPTION] which [serious_outcome, e.g., resulted in hospitalization]."

---

**Paragraph 2: Clinical Course, Interventions, & Outcome**

{Describe the clinical course of the event:
- How did the event progress?
- What interventions were performed? (labs, diagnostics, treatments)
- What was the response to interventions?
- Was the suspected product stopped (dechallenge)? What happened?
- Was the suspected product restarted (rechallenge)? What happened?
- What was the final outcome?}

Example Structure:
"[On date], the patient [describe_clinical_progression]. Laboratory tests revealed [relevant_lab_results_with_dates]. The suspected product was [discontinued/continued]. [Treatment_for_AE] was initiated. [Describe_response_to_treatment]. The event [resolved / is resolving / did not resolve / was fatal] on [date or ONGOING]."

---

**Paragraph 3: Relevant Medical History & Concomitant Medications**

{Provide context that may be relevant to causality:
- Relevant past medical history (only conditions relevant to AE)
- Concomitant medications (focus on those potentially related to AE)
- Any other relevant factors (alcohol use, smoking, recent surgeries, etc.)}

Example Structure:
"The patient's medical history included [relevant_conditions]. Concomitant medications included [medication_list_with_indications]. [Any_other_relevant_context, e.g., patient had no prior history of allergic reactions]."

---

**Paragraph 4: Causality Assessment & Reporter's Opinion**

{State the reporter's opinion (if provided) and the company's causality assessment:
- Reporter's causality assessment (if stated): "related" / "not related" / "unknown"
- Company causality assessment: RELATED / NOT RELATED
- Brief rationale (1-2 sentences) for company assessment}

Example Structure:
"The reporting [physician/pharmacist/patient] assessed the event as [related/not_related/unknown] to [PRODUCT_NAME]. The company's causality assessment is [RELATED / NOT RELATED] based on [brief_rationale: temporal relationship / dechallenge / known event / alternative explanation]."

---

**Paragraph 5: Follow-Up & Additional Information** (if applicable)

{If follow-up was conducted or additional information obtained:
- Date of follow-up
- Information obtained
- Impact on assessment}

Example Structure:
"Follow-up information was requested and received on [date]. Additional information revealed [new_information]. [Impact_on_assessment if any]."

---

**Conclusion Statement**:

{Final statement summarizing current case status and outcome:
- Current outcome (recovered, fatal, etc.)
- Whether case is complete or follow-up pending}

Example Structure:
"The patient [recovered fully / is recovering / experienced permanent sequelae / died] from [event]. [If fatal: The cause of death was [cause]]. This case is considered [COMPLETE / INCOMPLETE pending additional information]."

---

### NARRATIVE EXAMPLE (COMPLETE):

**Case Narrative for Case ID: 2025-US-012345**

This is a spontaneous report received on 15-OCT-2025 from a cardiologist concerning a 68-year-old male patient who was treated with CardioStatin (atorvastatin 80 mg, oral, once daily) for hyperlipidemia. On 10-OCT-2025, approximately 14 days after starting therapy, the patient experienced severe muscle pain and dark urine, which resulted in hospitalization for suspected rhabdomyolysis.

Upon admission on 10-OCT-2025, laboratory tests revealed elevated creatine kinase (CK) of 25,000 U/L (normal range: 20-200 U/L), elevated serum creatinine of 2.5 mg/dL (baseline 1.0 mg/dL), and myoglobinuria. CardioStatin was immediately discontinued on 10-OCT-2025. The patient was treated with intravenous fluids, urine alkalinization, and supportive care. Following discontinuation of CardioStatin and initiation of treatment, the patient's CK levels gradually decreased to 1,200 U/L by 13-OCT-2025, and serum creatinine returned to baseline by 15-OCT-2025. The patient was discharged on 16-OCT-2025 with full resolution of symptoms.

The patient's medical history included hypertension and type 2 diabetes mellitus. Concomitant medications included lisinopril 20 mg daily for hypertension, metformin 1000 mg twice daily for diabetes, and gemfibrozil 600 mg twice daily for hypertriglyceridemia (started 7 days prior to CardioStatin). The patient had no prior history of muscle disorders or statin intolerance.

The reporting cardiologist assessed the event as related to CardioStatin. The company's causality assessment is RELATED based on the temporal relationship (onset 14 days after starting therapy), positive dechallenge (event resolved after drug discontinuation), biological plausibility (rhabdomyolysis is a known adverse reaction to statins), and the presence of a drug-drug interaction (concomitant gemfibrozil increases statin exposure and rhabdomyolysis risk).

The patient recovered fully from rhabdomyolysis. This case is considered COMPLETE.

---

### QUALITY CONTROL CHECKLIST

**Narrative Content**:
- [ ] Patient demographics included (age, sex)
- [ ] Suspected product, dose, route, frequency included
- [ ] Indication for use stated
- [ ] Adverse event(s) clearly described
- [ ] Onset date and time to onset provided
- [ ] Seriousness criteria specified (e.g., hospitalization)
- [ ] Clinical course described (progression, treatment, outcome)
- [ ] Dechallenge/rechallenge information included (if applicable)
- [ ] Relevant labs/diagnostics included with dates
- [ ] Medical history provided (relevant conditions only)
- [ ] Concomitant medications listed (relevant ones only)
- [ ] Causality assessment stated (reporter + company)
- [ ] Final outcome specified (recovered, fatal, etc.)

**Narrative Quality**:
- [ ] Clear and concise (200-400 words typical)
- [ ] Chronological presentation of events
- [ ] Medically accurate terminology
- [ ] No jargon or abbreviations (spell out terms on first use)
- [ ] Objective tone (no speculation)
- [ ] Grammar and spelling correct
- [ ] Passive voice used appropriately
- [ ] ICH E2B(R3) compliant

**Regulatory Requirements**:
- [ ] Narrative suitable for FDA submission (Form 3500A)
- [ ] Narrative suitable for EMA submission (EudraVigilance)
- [ ] All required data elements present
- [ ] No Protected Health Information (PHI) included (patient name, address, etc.)
- [ ] Reporter name included (or "reporter withheld" if anonymous)

**Approval**:
- [ ] Narrative reviewed by P12_MSO for medical accuracy
- [ ] Edits incorporated
- [ ] Final narrative approved for submission

**Final Approval**:
- Narrative reviewed and approved by: {P12_MSO name}
- Date: {YYYY-MM-DD}

---

**OUTPUT FORMAT**:
- Completed ICSR narrative (1-2 pages, typically 200-500 words)
- Structured format (introduction, clinical course, history, causality, conclusion)
- Medically accurate and regulatory-compliant
- QC checklist completed
- P12_MSO approval documented

**DELIVERABLE**: Final ICSR Narrative (entered in safety database, ready for regulatory submission)

```

**Expected Output**:
- Complete ICSR Narrative (1-2 pages, 200-500 words)
- Structured and chronological
- Medically accurate
- ICH E2B(R3) compliant
- P12_MSO approved

**Quality Check**:
- [ ] All required elements included
- [ ] Clear and concise writing
- [ ] Medical accuracy verified
- [ ] ICH E2B(R3) standards met
- [ ] MSO approval obtained

**Deliverable**: Final ICSR Narrative (entered in safety database)

---

### PHASE 5: REGULATORY REPORTING (35 minutes)

---

#### **STEP 5: Regulatory Reporting Strategy** (20 minutes)

**Objective**: Determine which health authorities require reporting and prepare regulatory submission strategy.

**Persona**: P14_REGAFF (Lead - Regulatory Affairs), P12_MSO (Support), P13_PVMGR (Support)

**Prerequisites**:
- Completed ICSR with approved causality and narrative (Steps 1-4)
- Product registration status documented
- Regulatory requirements database access

**Process**:

1. **Review Reportability** (10 minutes)
   - Determine which authorities require reporting
   - Check reporting timelines
   - Identify submission format requirements

2. **Execute Regulatory Strategy Prompt** (15 minutes)
   - Document reporting strategy
   - Identify submission pathways
   - Flag any complexities

3. **Obtain Approvals** (5 minutes)
   - P12_MSO medical review
   - P13_PVMGR compliance review
   - Document in safety database

---

**PROMPT 5.1: Regulatory Reporting Strategy Development**

```markdown
**ROLE**: You are P14_REGAFF, a Regulatory Affairs Specialist with expertise in global pharmacovigilance reporting requirements.

**TASK**: Develop a comprehensive regulatory reporting strategy for this ICSR, including which health authorities require reporting, timelines, and submission formats.

**INPUT**:

**Case Summary**:
- Case ID: {case_id}
- Serious?: {YES / NO}
- Serious Criteria: {death / life_threatening / hospitalization / disability / congenital_anomaly / medically_important}
- Expected?: {YES / NO (per RSI)}
- Causality: {RELATED / NOT_RELATED}
- Reporter Country: {country}

**Product Registration Status**:
- FDA Status: {IND / NDA_approved / BLA_approved / not_registered}
- IND/NDA/BLA Number: {number}
- EMA Status: {MA_approved / clinical_trial / not_registered}
- MA Number: {EU_number}
- Other Countries Registered: {list_countries}

**Study Information** (if from clinical trial):
- Study ID: {protocol_number}
- Study Phase: {Phase_I / II / III / IV / post_approval}
- Study Country/Site: {country_and_site}
- IRB/EC: {IRB_name}

**Report Timing**:
- Date Case Received: {YYYY-MM-DD}
- Clock Start Date: {YYYY-MM-DD}
- Day 7 Due Date (if applicable): {YYYY-MM-DD}
- Day 15 Due Date (if applicable): {YYYY-MM-DD}
- Days Remaining: {X days}

---

**INSTRUCTIONS**:

Develop a comprehensive regulatory reporting strategy.

---

### PART A: REPORTABILITY DETERMINATION

For each major health authority, determine if this case requires reporting.

---

**FDA (United States)**

**Reportability Criteria Assessment**:

**IND Safety Reporting (21 CFR 312.32)**:
- Is product under IND?: {YES / NO}
- If YES, assess reportability:
  1. Is event serious?: {YES / NO}
  2. Is event unexpected?: {YES / NO}
  3. Is event related?: {YES / NO}
  4. Is event associated with use of drug?: {YES / NO}

**FDA IND Reportability**:
- ✅ **REPORTABLE to FDA** (meets all 4 criteria)
  - Timeline: {7-DAY / 15-DAY}
  - Form: IND Safety Report
  - Due Date: {YYYY-MM-DD}
- ❌ **NOT REPORTABLE to FDA**
  - Reason: {not_serious / expected / not_related / not_IND}

---

**NDA/BLA Post-Marketing Reporting (21 CFR 314.80 / 601.70)**:
- Is product FDA-approved (NDA/BLA)?: {YES / NO}
- If YES, assess reportability:
  1. Is event serious?: {YES / NO}
  2. Is event unexpected?: {YES / NO}
  3. Did event occur in U.S.?: {YES / NO / UNKNOWN}

**FDA Post-Marketing Reportability**:
- ✅ **REPORTABLE to FDA**
  - Timeline: 15-DAY Alert Report
  - Form: MedWatch (FDA 3500A)
  - Due Date: {YYYY-MM-DD}
- ❌ **NOT REPORTABLE as 15-day**
  - Will include in: {PADER / Annual Report / not_reportable}
  - Reason: {not_serious / expected / foreign_case_not_required}

---

**EMA (European Medicines Agency)**

**Reportability Criteria Assessment**:

**EMA/EudraVigilance Reporting (EU Regulation 726/2004, GVP Module VI)**:
- Is product MA-approved in EU?: {YES / NO}
- If YES, assess reportability:
  1. Is event serious?: {YES / NO}
  2. Did event occur in EEA?: {YES / NO / WORLDWIDE}
  3. Is event related (suspected)?: {YES / NO}

**EMA Reportability**:
- ✅ **REPORTABLE to EudraVigilance**
  - Timeline: 15 calendar days
  - Format: ICH E2B R3 XML
  - Due Date: {YYYY-MM-DD}
- ❌ **NOT REPORTABLE to EudraVigilance**
  - Reason: {not_MA_approved / not_serious / non_EEA_case}

---

**Other Health Authorities**

**Canada (Health Canada)**:
- Reportable?: {YES / NO}
- Timeline: {15_days / periodic}
- Format: {MedEffect_e-Reporting / CIOMS}

**Japan (PMDA)**:
- Reportable?: {YES / NO}
- Timeline: {15_days / 30_days / periodic}
- Format: {J-SGML / electronic}

**Other Countries** (if product is registered):
- Country 1: {reportability_status / timeline}
- Country 2: {reportability_status / timeline}

---

### PART B: SUBMISSION STRATEGY

**Priority Submission Schedule**:

| Authority | Reportable | Timeline | Due Date | Format | Priority |
|-----------|-----------|----------|----------|--------|----------|
| FDA | {YES/NO} | {7-DAY/15-DAY} | {YYYY-MM-DD} | IND Safety Report | {HIGH/MED/LOW} |
| EMA | {YES/NO} | {15-DAY} | {YYYY-MM-DD} | ICH E2B R3 XML | {HIGH/MED/LOW} |
| Health Canada | {YES/NO} | {15-DAY} | {YYYY-MM-DD} | MedEffect | {HIGH/MED/LOW} |
| PMDA | {YES/NO} | {15-DAY} | {YYYY-MM-DD} | J-SGML | {HIGH/MED/LOW} |

**Critical Path**:
1. {action_1 / timeline}
2. {action_2 / timeline}
3. {action_3 / timeline}

---

### PART C: SUBMISSION PREPARATION

**FDA Submission Details** (if reportable):

**IND Safety Report**:
- Form: FDA 3500A (MedWatch) or electronic via ESG
- Cover Letter: Required (indicate IND number, serious/unexpected, timeline)
- Submission Method: {ESG / fax / mail}
- ESG Gateway: {production_gateway_URL}
- IND Number: {IND_XXXXXX}
- Expected Acknowledgment: {within_XX_days}

**Required Elements for FDA Submission**:
- [ ] Completed FDA 3500A form
- [ ] ICSR narrative
- [ ] Cover letter identifying IND number and reporting timeline
- [ ] ICH E2B R3 XML file (if electronic submission)
- [ ] Causality assessment documented
- [ ] Reporter information (name, contact)
- [ ] Company contact (DUNS number, safety contact)

**15-Day Alert Report (NDA/BLA)**:
- Form: FDA 3500A or electronic via ESG
- Cover Letter: Required (indicate NDA/BLA number, alert report)
- Submission Method: {ESG / fax}
- NDA/BLA Number: {NDA_XXXXXX / BLA_XXXXXX}

---

**EMA Submission Details** (if reportable):

**EudraVigilance Submission**:
- Format: ICH E2B R3 XML
- Submission Gateway: EudraVigilance Gateway
- MA Number: {EU_MA_number}
- Expected Acknowledgment: {within_XX_days}
- EVDAS Identifier: {will_be_assigned_upon_submission}

**Required Elements for EMA Submission**:
- [ ] ICH E2B R3 XML file
- [ ] ICSR narrative
- [ ] MedDRA and WHO-DD coding
- [ ] Causality assessment
- [ ] Reporter information
- [ ] MA holder information
- [ ] Pass XML validation (EudraVigilance validator)

---

### PART D: ELECTRONIC SUBMISSION TECHNICAL REQUIREMENTS

**ICH E2B R3 XML Generation**:
- Safety Database: {Oracle_Argus / ArisGlobal / other}
- XML Export Function: {describe_process}
- Validation Tool: {EudraVigilance_validator / FDA_validator}
- Validation Status: {PASS / FAIL / NOT_YET_VALIDATED}
- If FAIL, errors: {list_errors}

**FDA ESG (Electronic Submissions Gateway)**:
- Account Status: {active / not_set_up}
- DUNS Number: {company_DUNS}
- Submission Type: {IND / NDA / BLA}
- Application Number: {number}
- Submission Format: {ICH_E2B_R3_XML / other}

**EudraVigilance Gateway**:
- Account Status: {active / not_set_up}
- Organization ID: {EV_org_ID}
- MA Number: {EU_MA_number}
- Validation: {pre-submission_validation_required}

---

### PART E: QUALITY CONTROL & COMPLIANCE

**QC Checklist for Regulatory Submission**:

**Data Completeness**:
- [ ] All ICH E2B(R3) mandatory data elements present
- [ ] Patient identifiers (age, sex, initials) provided
- [ ] Reporter identifiers provided
- [ ] Suspected product(s) identified
- [ ] Adverse event(s) coded (MedDRA PT)
- [ ] Dates provided (onset, report receipt, etc.)
- [ ] Seriousness criteria specified
- [ ] Causality assessment documented
- [ ] Narrative included and approved

**Regulatory Requirements**:
- [ ] Reporting timeline met (7-day or 15-day)
- [ ] Clock start date documented
- [ ] Due date calculated correctly
- [ ] Appropriate form used (FDA 3500A, ICH E2B R3 XML, etc.)
- [ ] Cover letter prepared (if required)
- [ ] Submission method confirmed (ESG, EudraVigilance, etc.)

**Medical Review**:
- [ ] Causality assessment reviewed by P12_MSO
- [ ] Narrative reviewed by P12_MSO
- [ ] Medical accuracy confirmed
- [ ] Serious criteria justified

**Final Approval**:
- [ ] Regulatory strategy reviewed by P13_PVMGR
- [ ] Ready for submission approval obtained
- [ ] Submission package complete

---

### PART F: RISK MITIGATION

**Potential Issues & Mitigation**:

**Issue 1: Incomplete Information**
- Risk: {HIGH / MEDIUM / LOW}
- Impact: May delay submission or result in incomplete report
- Mitigation: {follow-up_with_reporter / submit_with_available_info / request_extension}

**Issue 2: Missed Timeline**
- Risk: {HIGH / MEDIUM / LOW}
- Impact: Regulatory non-compliance; potential FDA Warning Letter
- Mitigation: {expedite_processing / escalate_to_management / proactive_communication_with_agency}

**Issue 3: XML Validation Failure**
- Risk: {HIGH / MEDIUM / LOW}
- Impact: Cannot submit electronically; must use alternative method
- Mitigation: {correct_validation_errors / manual_submission / IT_support}

**Issue 4: Unclear Causality**
- Risk: {HIGH / MEDIUM / LOW}
- Impact: May affect reportability determination
- Mitigation: {request_medical_review / default_to_related / request_follow-up}

---

### PART G: SUBMISSION TRACKING

**Submission Tracking Log**:

| Authority | Submission Date | Submission ID | Acknowledgment Date | Status | Follow-Up Needed |
|-----------|----------------|---------------|---------------------|--------|------------------|
| FDA | {YYYY-MM-DD} | {tracking_ID} | {YYYY-MM-DD or PENDING} | {submitted / pending / acknowledged} | {YES/NO} |
| EMA | {YYYY-MM-DD} | {EVPM_ID} | {YYYY-MM-DD or PENDING} | {submitted / pending / acknowledged} | {YES/NO} |
| Health Canada | {YYYY-MM-DD} | {tracking_ID} | {YYYY-MM-DD or PENDING} | {submitted / pending / acknowledged} | {YES/NO} |

**Expected Agency Follow-Up**:
- FDA: {queries_expected? / timeline}
- EMA: {queries_expected? / timeline}

**Contingency Plan**:
- If acknowledgment not received within {XX days}: {escalation_action}
- If agency query received: {response_process}

---

### PART H: REGULATORY STRATEGY SUMMARY

**Executive Summary**:

**Reportability**:
- FDA: {REPORTABLE / NOT_REPORTABLE} - {7-DAY / 15-DAY / PERIODIC}
- EMA: {REPORTABLE / NOT_REPORTABLE} - {15-DAY / PERIODIC}
- Other: {list_countries_and_timelines}

**Critical Deadlines**:
- Earliest Due Date: {YYYY-MM-DD} ({authority})
- Days Remaining: {X days}
- Priority: {HIGH / MEDIUM / LOW}

**Submission Formats**:
- FDA: {IND_Safety_Report / 15-Day_Alert / PADER}
- EMA: {ICH_E2B_R3_XML / EudraVigilance}
- Other: {formats}

**Risks**:
- {risk_1 / mitigation}
- {risk_2 / mitigation}

**Next Steps**:
1. {action_1 / owner / timeline}
2. {action_2 / owner / timeline}
3. {action_3 / owner / timeline}

**Approval**:
- Regulatory strategy reviewed and approved by: {P13_PVMGR name}
- Date: {YYYY-MM-DD}

---

**OUTPUT FORMAT**:
- Comprehensive regulatory reporting strategy (4-5 pages)
- Reportability determination for all major authorities
- Submission timeline and critical path
- QC checklist completed
- Risk mitigation plan
- P13_PVMGR approval

**DELIVERABLE**: Regulatory Reporting Strategy Document (saved in safety database and regulatory tracking system)

```

**Expected Output**:
- Comprehensive Regulatory Reporting Strategy (4-5 pages)
- Reportability determination for FDA, EMA, and other authorities
- Submission timeline and due dates
- Risk mitigation plan
- P13_PVMGR approval

**Quality Check**:
- [ ] Reportability correctly determined
- [ ] Timelines calculated accurately
- [ ] Submission formats identified
- [ ] Risks identified and mitigated
- [ ] PVMGR approval obtained

**Deliverable**: Regulatory Reporting Strategy Document

---

#### **STEP 6: Expedited Report Submission** (15 minutes)

**Objective**: Prepare and submit expedited safety reports to regulatory authorities within required timelines.

**Persona**: P14_REGAFF (Lead), P13_PVMGR (Oversight)

**Prerequisites**:
- Approved ICSR (Steps 1-4)
- Regulatory reporting strategy (Step 5)
- Electronic submission system access

**Process**:

1. **Prepare Submission Package** (5 minutes)
   - Generate electronic files (XML if applicable)
   - Prepare cover letter
   - Validate submission package

2. **Submit to Authorities** (5 minutes)
   - Upload to FDA ESG / EudraVigilance / other gateways
   - Document submission confirmation
   - Track acknowledgment

3. **Document Submission** (5 minutes)
   - Update safety database with submission details
   - Document in regulatory tracking system
   - File submission confirmation

---

**PROMPT 6.1: Expedited Report Submission**

```markdown
**ROLE**: You are P14_REGAFF executing the submission of an expedited safety report.

**TASK**: Prepare final submission package and submit to regulatory authorities.

**INPUT**:

**Case Summary**:
- Case ID: {case_id}
- Submission Timeline: {7-DAY / 15-DAY}
- Due Date: {YYYY-MM-DD}
- Days Until Due: {X days}

**Regulatory Authorities for Submission**:
- FDA: {YES / NO} - {IND_Safety_Report / 15-Day_Alert}
- EMA: {YES / NO} - {EudraVigilance}
- Other: {list_if_applicable}

**Submission Package Contents**:
- ICH E2B R3 XML file: {filename.xml}
- FDA 3500A form: {completed / not_applicable}
- ICSR narrative: {approved / pending}
- Cover letter: {drafted / pending}

---

**INSTRUCTIONS**:

Execute the final submission following the checklist below.

---

### STEP 6.1: PRE-SUBMISSION VALIDATION

**XML Validation** (if applicable):
- [ ] ICH E2B R3 XML file generated from safety database
- [ ] XML passed EudraVigilance validator
- [ ] XML passed FDA validator (if FDA submission)
- [ ] All mandatory data elements present
- [ ] No validation errors

**If validation errors exist**:
- Error 1: {description / resolution}
- Error 2: {description / resolution}
- Corrective action taken: {description}
- Re-validation status: {PASS / FAIL}

---

### STEP 6.2: SUBMISSION PACKAGE PREPARATION

**FDA Submission Package** (if applicable):

**For IND Safety Report**:
- [ ] Completed FDA 3500A form (or electronic equivalent)
- [ ] ICSR narrative (1-2 pages)
- [ ] Cover letter identifying:
  - IND number
  - Indication this is a 7-day or 15-day report
  - Date case received (clock start date)
  - Brief summary of event
- [ ] ICH E2B R3 XML file (if electronic submission)
- [ ] Company contact information (DUNS number, safety contact name/phone)

**Cover Letter Template** (FDA IND Safety Report):

```
[Company Letterhead]
[Date]

Food and Drug Administration
Center for Drug Evaluation and Research
Office of Drug Evaluation I/II/III/IV [as applicable]
[Address]

RE: IND [NUMBER] – [PRODUCT NAME]
     [7-DAY / 15-DAY] IND SAFETY REPORT
     CASE ID: [case_id]

Dear Sir/Madam:

In accordance with 21 CFR 312.32, [Company Name] is submitting this [7-day / 15-day] IND Safety Report for IND [NUMBER], [PRODUCT NAME], for the treatment of [INDICATION].

**Case Summary**:
- Report Type: [7-Day / 15-Day] Expedited Report
- Date Case Received: [YYYY-MM-DD]
- Adverse Event: [MedDRA PT] resulting in [serious_criterion: death / hospitalization / etc.]
- Expectedness: Unexpected (not listed in current Investigator's Brochure)
- Causality: Related to [PRODUCT NAME]

A completed IND Safety Report (FDA 3500A) and narrative are enclosed. This case is also being submitted electronically via ESG [if applicable].

If you have any questions, please contact:
[Safety Contact Name]
[Title]
Phone: [XXX-XXX-XXXX]
Email: [email@company.com]

Sincerely,

[Signature]
[Name, Title]
[Company Name]

Enclosures:
- FDA 3500A Form
- ICSR Narrative
- ICH E2B R3 XML File (if applicable)
```

---

**EMA Submission Package** (if applicable):

**For EudraVigilance**:
- [ ] ICH E2B R3 XML file validated
- [ ] ICSR narrative embedded in XML (or attached)
- [ ] MA number included in XML
- [ ] Organization ID confirmed
- [ ] Electronic signature (if required)

---

### STEP 6.3: ELECTRONIC SUBMISSION

**FDA ESG Submission** (if applicable):

**Pre-Submission Checklist**:
- [ ] ESG account active
- [ ] DUNS number confirmed
- [ ] IND/NDA/BLA number correct
- [ ] XML validation passed
- [ ] Cover letter and attachments ready

**Submission Steps**:
1. Log into FDA ESG portal: {URL}
2. Select application type: {IND / NDA / BLA}
3. Enter application number: {IND_XXXXXX / NDA_XXXXXX / BLA_XXXXXX}
4. Upload ICH E2B R3 XML file
5. Upload cover letter (PDF)
6. Upload FDA 3500A (PDF) if not embedded in XML
7. Review submission package
8. Submit
9. Confirm submission and obtain tracking number

**Submission Confirmation**:
- Submission Date: {YYYY-MM-DD HH:MM}
- Tracking Number: {ESG_tracking_ID}
- Expected Acknowledgment: {within_24-48_hours}

---

**EudraVigilance Submission** (if applicable):

**Pre-Submission Checklist**:
- [ ] EudraVigilance Gateway account active
- [ ] Organization ID confirmed: {EV_org_ID}
- [ ] MA number confirmed: {EU_MA_XXXXXX}
- [ ] XML validation passed (EudraVigilance validator)
- [ ] Electronic signature configured

**Submission Steps**:
1. Log into EudraVigilance Gateway: {URL}
2. Select "Submit ICSR"
3. Upload ICH E2B R3 XML file
4. Validate XML (gateway validation)
5. Review validation results
6. Apply electronic signature
7. Submit
8. Confirm submission and obtain EVPM identifier

**Submission Confirmation**:
- Submission Date: {YYYY-MM-DD HH:MM}
- EVPM Identifier: {EVPM_XXXXXX}
- Expected Acknowledgment: {within_24_hours}

---

### STEP 6.4: SUBMISSION TRACKING & ACKNOWLEDGMENT

**Submission Log**:

| Authority | Submission Date | Submission ID/Tracking Number | Acknowledgment Date | Acknowledgment Status |
|-----------|----------------|-------------------------------|---------------------|----------------------|
| FDA | {YYYY-MM-DD HH:MM} | {ESG_tracking_ID} | {YYYY-MM-DD or PENDING} | {received / pending / error} |
| EMA | {YYYY-MM-DD HH:MM} | {EVPM_ID} | {YYYY-MM-DD or PENDING} | {received / pending / error} |
| Health Canada | {YYYY-MM-DD HH:MM} | {tracking_ID} | {YYYY-MM-DD or PENDING} | {received / pending / error} |

**Acknowledgment Monitoring**:
- FDA: Check ESG portal daily for acknowledgment (expected within 24-48 hours)
- EMA: Check EudraVigilance Gateway for acknowledgment (expected within 24 hours)
- If acknowledgment not received within expected timeframe: {escalation_action}

**Error Resolution**:
- If submission rejected or errors flagged:
  - Error Description: {from_acknowledgment_message}
  - Root Cause: {analysis}
  - Corrective Action: {steps_to_resolve}
  - Re-Submission Date: {YYYY-MM-DD}

---

### STEP 6.5: POST-SUBMISSION DOCUMENTATION

**Safety Database Update**:
- [ ] Submission date recorded in safety database
- [ ] Submission tracking numbers entered
- [ ] Submission documents uploaded (cover letter, XML, acknowledgment)
- [ ] Submission status updated: {submitted / acknowledged / error}

**Regulatory Tracking System Update**:
- [ ] Submission logged in regulatory tracking system
- [ ] Timeline compliance confirmed: {ON_TIME / LATE / EARLY}
- [ ] Acknowledgment tracking enabled

**Quality Metrics**:
- Timeline compliance: {met_deadline? / days_early_or_late}
- Submission errors: {NONE / list_errors}
- Re-submission required?: {YES / NO}

---

### STEP 6.6: FOLLOW-UP ACTIONS

**Agency Queries** (if applicable):
- Expected agency queries?: {YES / NO / POSSIBLE}
- Query response deadline: {typically_10_calendar_days}
- Query response process: {assign_to_P12_MSO / prepare_response}

**Case Follow-Up**:
- Follow-up required?: {YES / NO}
- Follow-up method: {phone / letter / medical_records_request}
- Follow-up deadline: {YYYY-MM-DD}
- If follow-up information obtained, will require: {FOLLOW-UP_REPORT_to_FDA/EMA}

**Case Closure**:
- Is case complete?: {YES / NO / PENDING_FOLLOW-UP}
- If YES, close case in safety database
- If NO, set follow-up reminder for: {YYYY-MM-DD}

---

### SUMMARY

**Submission Summary**:
- Case ID: {case_id}
- Submitted to: {FDA / EMA / Health_Canada / Other}
- Submission Date: {YYYY-MM-DD}
- Timeline: {7-DAY / 15-DAY}
- Due Date: {YYYY-MM-DD}
- Compliance: {ON_TIME / EARLY / LATE}
- Tracking Numbers: {list}
- Acknowledgment Status: {received / pending}

**Completed by**: {P14_REGAFF name}
**Date**: {YYYY-MM-DD}
**Reviewed by**: {P13_PVMGR name}

---

**OUTPUT FORMAT**:
- Submission package complete and uploaded
- Submission confirmation and tracking numbers documented
- Safety database and regulatory tracking system updated
- Timeline compliance confirmed

**DELIVERABLE**: Submission Confirmation Documentation

```

**Expected Output**:
- Regulatory submissions completed (FDA, EMA, others)
- Submission tracking numbers documented
- Acknowledgments tracked
- Timeline compliance confirmed

**Quality Check**:
- [ ] Submissions completed on time
- [ ] Tracking numbers recorded
- [ ] Acknowledgments received
- [ ] Safety database updated
- [ ] No submission errors

**Deliverable**: Submission Confirmation & Tracking Documentation

---

### PHASE 6: SIGNAL DETECTION (25 minutes)

---

#### **STEP 7: Signal Detection Screening** (25 minutes)

**Objective**: Screen aggregate ICSR data for potential safety signals requiring further investigation.

**Persona**: P15_SIGDET (Lead - Signal Detection Specialist), P12_MSO (Medical review)

**Prerequisites**:
- Completed ICSR entered in safety database
- Access to aggregate safety data
- Statistical signal detection tools

**Note**: This step is typically performed **in parallel** or **periodically** (not for every individual case). However, for high-priority cases (e.g., new serious AE, fatal case), immediate signal screening is warranted.

**Process**:

1. **Review Case Context** (5 minutes)
   - Is this a novel AE (not previously reported)?
   - Is this a fatal or life-threatening outcome?
   - Is there a cluster of similar cases?

2. **Execute Signal Detection Prompt** (15 minutes)
   - Query safety database for similar cases
   - Apply statistical methods (ROR, PRR, etc.) if sufficient data
   - Review literature for emerging signals

3. **Escalate if Signal Detected** (5 minutes)
   - Document signal flag
   - Escalate to P13_PVMGR for formal signal evaluation
   - Initiate signal management process (separate workflow)

---

**PROMPT 7.1: Signal Detection Screening**

```markdown
**ROLE**: You are P15_SIGDET, a Signal Detection Specialist with expertise in pharmacoepidemiology and statistical signal detection.

**TASK**: Screen this ICSR and aggregate safety data for potential safety signals requiring further investigation.

**INPUT**:

**Current Case**:
- Case ID: {case_id}
- Product: {product_name}
- Adverse Event: {MedDRA_PT}
- Seriousness: {serious / non-serious}
- Outcome: {recovered / fatal / etc.}
- Causality: {RELATED / NOT_RELATED}

**Case Context**:
- Is this a new AE (not previously reported for this product)?: {YES / NO}
- Is this a serious or fatal outcome?: {YES / NO}
- Date Range for Analysis: {start_date to end_date}

**Aggregate Data Query**:
- Total ICSRs in database for this product: {X cases}
- Total ICSRs reporting this specific AE: {Y cases}
- Time period: {date_range}

---

**INSTRUCTIONS**:

Conduct a signal detection screening using the framework below.

---

### PART A: CASE PATTERN ANALYSIS

**Query 1: Historical Cases of This AE with This Product**

Search safety database for all cases of {MedDRA_PT} associated with {product_name}.

**Query Parameters**:
- Product: {product_name}
- Adverse Event (MedDRA PT): {MedDRA_PT_code}
- Date Range: {all_time / last_X_years}
- Seriousness: {serious / all}

**Query Results**:
- Total cases of {MedDRA_PT} with {product_name}: {X cases}
- Serious cases: {Y cases}
- Fatal cases: {Z cases}
- First case date: {YYYY-MM-DD}
- Most recent case date: {YYYY-MM-DD}

**Trend Analysis**:
- Cases per year:
  - 2023: {X cases}
  - 2024: {Y cases}
  - 2025: {Z cases}
- Is there an increasing trend?: {YES / NO / INSUFFICIENT_DATA}

---

**Query 2: Cluster Detection (Temporal or Geographic)**

**Temporal Clustering**:
- Have there been multiple cases in a short time period (e.g., 3+ cases in 30 days)?: {YES / NO}
- If YES, describe cluster: {dates / number_of_cases}

**Geographic Clustering**:
- Are cases concentrated in specific geographic regions?: {YES / NO}
- If YES, regions: {list_countries_or_states}

**Lot/Batch Analysis** (if product quality concern):
- Are cases associated with specific product lots?: {YES / NO}
- If YES, lot numbers: {list}
- Action: {escalate_to_quality_assurance}

---

**Query 3: Patient Population Analysis**

**Demographics of Cases**:
- Age distribution: {summary_statistics}
- Sex distribution: {M: X%, F: Y%}
- Specific populations affected (e.g., elderly, pediatric, pregnant)?: {describe}

**Medical History Patterns**:
- Common comorbidities: {list_if_pattern_identified}
- Concomitant medications: {list_if_pattern_identified}

---

### PART B: STATISTICAL SIGNAL DETECTION

**Disproportionality Analysis**:

Use statistical methods to compare observed vs. expected case counts.

**Method 1: Reporting Odds Ratio (ROR)**

Formula:
```
ROR = (a/b) / (c/d)

Where:
a = Number of cases with target product AND target AE
b = Number of cases with target product but NOT target AE
c = Number of cases with other products AND target AE
d = Number of cases with other products but NOT target AE
```

**Data**:
- a (Product X + AE Y): {X cases}
- b (Product X + other AEs): {Y cases}
- c (Other products + AE Y): {Z cases}
- d (Other products + other AEs): {W cases}

**Calculation**:
- ROR = {calculated_value}
- 95% Confidence Interval: {lower_bound - upper_bound}

**Interpretation**:
- ROR > 1: Possible signal (higher reporting than expected)
- 95% CI lower bound > 1: Statistically significant signal
- Signal Detected?: {YES / NO}

---

**Method 2: Proportional Reporting Ratio (PRR)**

Formula:
```
PRR = (a / (a+b)) / (c / (c+d))
```

**Calculation**:
- PRR = {calculated_value}
- Chi-square statistic: {value}
- P-value: {value}

**Interpretation**:
- PRR ≥ 2, Chi-square ≥ 4, and n ≥ 3 cases: Possible signal (WHO criteria)
- Signal Detected?: {YES / NO}

---

**Method 3: Information Component (IC) - Bayesian Method**

(Used by WHO Uppsala Monitoring Centre)

**Calculation**:
- IC = {calculated_value}
- IC_025 (lower 95% credibility interval): {value}

**Interpretation**:
- IC_025 > 0: Statistical signal
- Signal Detected?: {YES / NO}

---

**Method 4: Empirical Bayes Geometric Mean (EBGM)**

(Used by FDA FAERS)

**Calculation**:
- EBGM = {calculated_value}
- EB05 (lower 95% confidence bound): {value}

**Interpretation**:
- EB05 > 2: Possible signal (FDA threshold)
- Signal Detected?: {YES / NO}

---

**Statistical Summary**:

| Method | Value | Signal Threshold | Signal Detected? |
|--------|-------|------------------|------------------|
| ROR | {value} ({CI}) | ROR >1, CI lower >1 | {YES / NO} |
| PRR | {value} | PRR ≥2, χ² ≥4, n ≥3 | {YES / NO} |
| IC | {value} ({IC_025}) | IC_025 > 0 | {YES / NO} |
| EBGM | {value} ({EB05}) | EB05 > 2 | {YES / NO} |

**Overall Statistical Signal**: {DETECTED / NOT_DETECTED / INSUFFICIENT_DATA}

**Note**: Statistical signals are hypothesis-generating only; they do not prove causality. Further clinical and epidemiological evaluation is required.

---

### PART C: LITERATURE REVIEW

**Published Case Reports**:
- Search databases: PubMed, Embase
- Search terms: {product_name} AND {adverse_event_terms}
- Results: {X published case reports found}
- Summary: {brief_description_of_published_cases}

**Clinical Trials Data**:
- Review clinical trial safety data (if available)
- Event reported in clinical trials?: {YES / NO}
- Frequency in trials: {X / Y subjects (Z%)}

**Regulatory Actions**:
- Have other regulatory authorities issued warnings for this event?: {YES / NO}
- If YES, details: {list_authorities_and_actions}

**Drug Class Effect**:
- Is this a known effect for the drug class?: {YES / NO}
- If YES, class: {drug_class_name} and known effect: {description}

---

### PART D: CLINICAL SIGNIFICANCE ASSESSMENT

**Medical Review** (by P12_MSO):

**Clinical Plausibility**:
- Is this AE biologically plausible for this product?: {YES / NO}
- Mechanism: {describe_if_plausible}

**Clinical Impact**:
- Severity: {mild / moderate / severe / life-threatening / fatal}
- Reversibility: {typically_reversible / may_be_irreversible / unknown}
- Preventability: {preventable_with_monitoring / not_preventable / unknown}

**Patient Impact**:
- How does this event affect patient quality of life?: {significant / moderate / minor}
- Does this change benefit-risk profile?: {YES / NO / UNCLEAR}

---

### PART E: SIGNAL PRIORITIZATION

**Signal Priority Matrix**:

| Criterion | Score (0-3) | Rationale |
|-----------|-------------|-----------|
| **Clinical Seriousness** | {0-3} | 0=non-serious, 3=fatal/life-threatening |
| **Number of Cases** | {0-3} | 0=1 case, 3=10+ cases |
| **Statistical Strength** | {0-3} | 0=no signal, 3=strong signal all methods |
| **Novelty** | {0-3} | 0=known/labeled, 3=completely novel |
| **Preventability** | {0-3} | 0=not preventable, 3=easily preventable |
| **Biologic Plausibility** | {0-3} | 0=implausible, 3=clear mechanism |
| **Impact on Benefit-Risk** | {0-3} | 0=no impact, 3=major impact |

**Total Priority Score**: {sum_of_scores} / 21

**Priority Category**:
- **HIGH (15-21)**: Immediate formal signal evaluation required
- **MEDIUM (8-14)**: Signal evaluation within 30 days
- **LOW (0-7)**: Routine monitoring; no immediate action

**Assigned Priority**: {HIGH / MEDIUM / LOW}

---

### PART F: SIGNAL DECISION & NEXT STEPS

**Signal Conclusion**:
- Is there a potential safety signal?: {YES / NO / INSUFFICIENT_DATA}
- Signal strength: {STRONG / MODERATE / WEAK}
- Priority: {HIGH / MEDIUM / LOW}

**Rationale** (1-2 paragraphs):
{Explain the basis for your conclusion:
- Statistical findings
- Clinical plausibility
- Literature support
- Number and pattern of cases
- Any mitigating factors (e.g., confounding)}

---

**Recommended Actions**:

**If SIGNAL DETECTED (HIGH or MEDIUM priority)**:
- [ ] Escalate to P13_PVMGR for formal signal evaluation
- [ ] Initiate signal management process (separate workflow: UC_PV_014)
- [ ] Conduct detailed case review (all similar cases)
- [ ] Request follow-up information on key cases
- [ ] Conduct targeted literature review
- [ ] Prepare signal evaluation report
- [ ] Consider risk mitigation actions (e.g., DHCP letter, labeling update)
- [ ] Notify regulatory authorities if required

**If NO SIGNAL or LOW priority**:
- [ ] Document signal screening in database
- [ ] Continue routine surveillance
- [ ] Re-evaluate in {3 / 6 / 12} months with updated data

**If INSUFFICIENT DATA**:
- [ ] Flag for follow-up when more cases accumulate
- [ ] Set data threshold for re-analysis (e.g., when n=5 cases)
- [ ] Continue routine monitoring

---

### PART G: DOCUMENTATION

**Signal Screening Summary**:

| Element | Finding |
|---------|---------|
| **Product** | {product_name} |
| **Adverse Event** | {MedDRA_PT} |
| **Total Cases** | {X} |
| **Serious Cases** | {Y} |
| **Fatal Cases** | {Z} |
| **Statistical Signal** | {DETECTED / NOT_DETECTED} |
| **Clinical Significance** | {HIGH / MEDIUM / LOW} |
| **Signal Priority** | {HIGH / MEDIUM / LOW} |
| **Recommendation** | {ESCALATE / MONITOR / NO_ACTION} |
| **Screened By** | {P15_SIGDET name} |
| **Reviewed By** | {P12_MSO name} |
| **Date** | {YYYY-MM-DD} |

**Signal Flag in Database**:
- [ ] Signal flag set in safety database for this AE-product combination
- [ ] Alert created for future cases of this AE
- [ ] P13_PVMGR notified

---

**OUTPUT FORMAT**:
- Signal detection screening report (2-3 pages)
- Statistical analysis documented
- Clinical assessment by P12_MSO
- Signal priority assigned
- Next steps clearly defined

**DELIVERABLE**: Signal Detection Screening Report (saved in safety database and signal management system)

```

**Expected Output**:
- Signal Detection Screening Report (2-3 pages)
- Statistical analysis (ROR, PRR, IC, EBGM)
- Clinical significance assessment
- Signal priority (HIGH/MEDIUM/LOW)
- Recommendation (escalate, monitor, no action)

**Quality Check**:
- [ ] Aggregate data queried
- [ ] Statistical methods applied
- [ ] Literature reviewed
- [ ] Clinical significance assessed
- [ ] Signal priority assigned
- [ ] Next steps defined

**Deliverable**: Signal Detection Screening Report

---

## 6. COMPLETE PROMPT SUITE

### 6.1 Prompt Overview Table

| Prompt ID | Prompt Name | Persona | Time | Complexity | Phase |
|-----------|-------------|---------|------|------------|-------|
| **1.1** | AE Report Triage Assessment | P11_DSA | 20 min | INTERMEDIATE | Case Intake & Triage |
| **2.1** | MedDRA and WHO-DD Medical Coding | P11_DSA | 30 min | ADVANCED | Medical Coding |
| **3.1** | Structured Causality Assessment | P12_MSO | 30 min | EXPERT | Causality Assessment |
| **4.1** | ICSR Narrative Generation | P11_DSA, P12_MSO | 40 min | ADVANCED | Narrative Generation |
| **5.1** | Regulatory Reporting Strategy | P14_REGAFF | 20 min | ADVANCED | Regulatory Reporting |
| **6.1** | Expedited Report Submission | P14_REGAFF | 15 min | INTERMEDIATE | Expedited Submission |
| **7.1** | Signal Detection Screening | P15_SIGDET, P12_MSO | 25 min | EXPERT | Signal Detection |

**Total Workflow Time**: 3-4 hours per serious ICSR

---

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 QC Checkpoints

**Checkpoint 1: Case Validity (Step 1)**
- ✅ All four ICH E2A minimum criteria met
- ✅ Seriousness correctly assessed
- ✅ Expectedness determination documented
- ✅ Reporting timeline calculated accurately

**Checkpoint 2: Medical Coding Accuracy (Step 2)**
- ✅ MedDRA PTs selected appropriately (not LLT or HLT)
- ✅ Most specific PT chosen
- ✅ WHO-DD terms match verbatim products
- ✅ Coding confidence documented

**Checkpoint 3: Causality Assessment (Step 3)**
- ✅ Both algorithmic and clinical judgment applied
- ✅ Rationale clearly documented
- ✅ Alternative explanations considered
- ✅ P12_MSO approval obtained

**Checkpoint 4: Narrative Quality (Step 4)**
- ✅ All ICH E2B(R3) elements included
- ✅ Clear, concise, medically accurate
- ✅ Chronological presentation
- ✅ P12_MSO medical review and approval

**Checkpoint 5: Regulatory Compliance (Steps 5-6)**
- ✅ Reportability correctly determined
- ✅ Timelines met (0 late submissions)
- ✅ Submission format correct
- ✅ Acknowledgments tracked

**Checkpoint 6: Signal Detection (Step 7)**
- ✅ Aggregate data reviewed
- ✅ Statistical methods applied
- ✅ Clinical significance assessed
- ✅ Escalation to signal management (if warranted)

### 7.2 Quality Metrics Dashboard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Timeline Compliance** | >98% | {current_%} | {GREEN/YELLOW/RED} |
| **Medical Coding Accuracy** | <5% error rate | {current_%} | {GREEN/YELLOW/RED} |
| **Causality Agreement** | >90% inter-rater | {current_%} | {GREEN/YELLOW/RED} |
| **Narrative Quality** | <5% corrections | {current_%} | {GREEN/YELLOW/RED} |
| **Processing Time** | <3 hours/ICSR | {current_hours} | {GREEN/YELLOW/RED} |

### 7.3 Audit Readiness

**Documentation Requirements**:
- [ ] All case data fields complete (no critical missing data)
- [ ] Coding rationale documented for complex cases
- [ ] Causality assessment with clear rationale
- [ ] Medical review signatures obtained (P12_MSO)
- [ ] Regulatory submission documentation filed
- [ ] Acknowledgments received and tracked

**Audit Trail**:
- [ ] All data changes logged in safety database
- [ ] User IDs and timestamps for all actions
- [ ] Version history for narratives
- [ ] QC review documentation

---

## 8. REGULATORY COMPLIANCE CHECKLIST

### 8.1 ICH E2A Compliance

- [ ] Serious adverse event definitions applied correctly
- [ ] Expectedness determination based on current RSI
- [ ] Minimum criteria for valid ICSR met (reporter, patient, event, product)
- [ ] Reporting timelines followed (7-day, 15-day)

### 8.2 ICH E2B(R3) Compliance

- [ ] All mandatory data elements populated
- [ ] MedDRA coding at PT level
- [ ] WHO-DD coding for medications
- [ ] ICH E2B R3 XML format for electronic submissions
- [ ] Narrative included in submission

### 8.3 FDA Compliance (21 CFR 312.32 / 314.80)

- [ ] IND Safety Reports submitted within 7/15 calendar days
- [ ] Serious, unexpected, related events reported expeditely
- [ ] FDA 3500A form completed accurately
- [ ] Cover letter identifies IND/NDA/BLA number
- [ ] Electronic submission via FDA ESG (if applicable)

### 8.4 EMA Compliance (GVP)

- [ ] Serious AEs reported within 15 days to EudraVigilance
- [ ] ICH E2B R3 XML validation passed
- [ ] MA number included in submission
- [ ] Electronic signature applied
- [ ] Acknowledgment received and tracked

---

## 9. TEMPLATES & JOB AIDS

### 9.1 Case Triage Checklist

```
CASE TRIAGE CHECKLIST (Step 1)

Case ID: _______________
Date Received: _______________

☐ 1. VALIDITY CHECK
  ☐ Identifiable reporter
  ☐ Identifiable patient
  ☐ At least one AE
  ☐ At least one suspected product

☐ 2. SERIOUSNESS ASSESSMENT (check all that apply)
  ☐ Death
  ☐ Life-threatening
  ☐ Hospitalization / prolongation
  ☐ Disability / incapacity
  ☐ Congenital anomaly
  ☐ Medically important event

☐ 3. EXPECTEDNESS
  ☐ Event listed in RSI → EXPECTED
  ☐ Event not listed in RSI → UNEXPECTED

☐ 4. REPORTING TIMELINE
  ☐ 7-day report (fatal/life-threatening + unexpected)
  ☐ 15-day report (serious + unexpected)
  ☐ Periodic report (non-serious or expected)

☐ 5. PRIORITY ASSIGNMENT
  ☐ HIGH (7-day, fatal, or significant safety concern)
  ☐ MEDIUM (15-day, serious)
  ☐ LOW (non-serious, periodic)

Due Date: _______________
Assigned to: _______________
```

### 9.2 Medical Coding Quick Reference

```
MEDDRA CODING QUICK REFERENCE

CODING PRINCIPLES:
1. Use Preferred Term (PT) level
2. Code what the patient experienced (not diagnosis unless diagnosis is the AE)
3. Code each sign/symptom separately
4. Do not code lab values alone; code clinical interpretation
5. Most specific PT wins

COMMON CODING SCENARIOS:

Scenario 1: "Patient had chest pain and was found to have a heart attack"
→ Code: Myocardial infarction (PT) [NOT "Chest pain"]

Scenario 2: "Patient developed a rash and itching"
→ Code: Rash (PT) + Pruritus (PT) [Two separate PTs]

Scenario 3: "ALT was 200 U/L (normal <40)"
→ Code: Hepatic enzyme increased (PT) [NOT "ALT increased" which is an LLT]

Scenario 4: "Patient died from MI"
→ Code: Myocardial infarction (PT) + Death (PT) [Two separate events]

WHEN TO ESCALATE TO P12_MSO:
- Uncertain which PT to use (e.g., "syncope" vs. "loss of consciousness")
- Complex medical scenario (e.g., multiple overlapping events)
- Rare or unusual event not clearly in MedDRA
- Suspected new signal

WHO-DD CODING PRINCIPLES:
1. Use drug substance + dosage form (e.g., "Atorvastatin tablet")
2. Include combination products as single entry
3. Use generic name when available
4. Specify route if relevant to AE

```

### 9.3 Causality Assessment Job Aid

```
CAUSALITY ASSESSMENT JOB AID

NARANJO ALGORITHM QUICK SCORE:
≥9 = Definite
5-8 = Probable
1-4 = Possible
≤0 = Doubtful

WHO-UMC CATEGORIES:
- Certain: Plausible time relationship + cannot be explained by disease/other drugs + positive dechallenge + positive rechallenge (if done)
- Probable: Reasonable time relationship + unlikely due to disease/other drugs + reasonable dechallenge
- Possible: Reasonable time relationship + could be explained by disease/other drugs
- Unlikely: Improbable time relationship + other explanations more plausible
- Conditional: More data needed
- Unassessable: Insufficient/contradictory information

CLINICAL JUDGMENT FACTORS:
✓ Temporal relationship (did AE occur during therapy?)
✓ Dechallenge (did AE resolve after drug stopped?)
✓ Rechallenge (did AE recur when drug restarted?)
✓ Dose-response (worse with higher dose?)
✓ Biologic plausibility (known mechanism?)
✓ Alternative explanations (disease, concomitants?)
✓ Literature (other case reports?)

FINAL DETERMINATION:
- RELATED (Certain, Probable, Possible per WHO-UMC)
- NOT RELATED (Unlikely per WHO-UMC)
- INSUFFICIENT INFORMATION (Conditional/Unassessable)

DOCUMENTATION:
- Always document rationale (2-3 sentences minimum)
- Address alternative explanations explicitly
- Note confidence level (HIGH/MEDIUM/LOW)
```

---

## 10. INTEGRATION WITH OTHER SYSTEMS

### 10.1 Safety Database Integration

**Oracle Argus Safety**:
- Case intake via Argus Intake module
- Medical coding via MedDRA Browser plugin
- Causality assessment via Argus Medical Review
- Narrative generation via Argus Narrative Writer
- Regulatory submission via Argus Submissions module
- Signal detection via Argus Insights

**ArisGlobal LifeSphere Safety**:
- Case intake via AI-assisted triage
- Medical coding with AI suggestions
- Causality workflow with electronic signatures
- Narrative templates and generation
- Electronic submissions (ICH E2B R3 XML)
- Signal detection dashboards

**Veeva Vault Safety**:
- Integrated case processing workflows
- MedDRA and WHO-DD coding
- Causality assessment workflows
- Narrative generation
- Electronic submissions
- Signal detection analytics

### 10.2 Regulatory Submission Portals

**FDA ESG (Electronic Submissions Gateway)**:
- ICH E2B R3 XML submission
- IND Safety Reports
- 15-Day Alert Reports
- Submission tracking and acknowledgments

**EudraVigilance Gateway**:
- ICH E2B R3 XML submission
- ICSR electronic reporting
- Acknowledgment via EVPM identifiers
- Duplicate case detection

### 10.3 Signal Detection Tools

**WHO VigiBase**:
- Access to global ICSR database (30+ million cases)
- IC (Information Component) analysis
- Duplicate detection
- Benchmarking against global reporting patterns

**FDA FAERS (Adverse Event Reporting System)**:
- Public access to U.S. spontaneous reports
- EBGM (Empirical Bayes Geometric Mean) analysis
- Quarterly data extracts
- Open data for research

**Company Internal Signal Detection**:
- Statistical algorithms (ROR, PRR, IC, EBGM)
- Automated signal detection runs (weekly/monthly)
- Signal prioritization algorithms
- Integration with literature monitoring

---

## 11. REFERENCES & RESOURCES

### 11.1 ICH Guidelines

1. **ICH E2A**: Clinical Safety Data Management: Definitions and Standards for Expedited Reporting (1994)
2. **ICH E2B(R3)**: Clinical Safety Data Management: Data Elements for Transmission of Individual Case Safety Reports (2016)
3. **ICH E2C(R2)**: Periodic Benefit-Risk Evaluation Report (PBRER) (2012)
4. **ICH E2D**: Post-Approval Safety Data Management (2003)
5. **ICH E2E**: Pharmacovigilance Planning (2004)
6. **ICH E2F**: Development Safety Update Report (DSUR) (2010)

### 11.2 FDA Regulations & Guidance

1. **21 CFR 312.32**: IND Safety Reporting Requirements
2. **21 CFR 314.80**: Postmarketing Reporting of Adverse Drug Experiences (NDA)
3. **21 CFR 600.80**: Postmarketing Reporting of Adverse Experiences (BLA)
4. **FDA Guidance**: Safety Reporting Requirements for INDs and BA/BE Studies (2012)
5. **FDA Guidance**: Postmarketing Safety Reporting for Human Drug and Biological Products Including Vaccines (2001)

### 11.3 EMA Regulations & Guidance

1. **EU Regulation 726/2004**: Procedures for authorization and supervision of medicinal products
2. **Good Pharmacovigilance Practices (GVP) Module VI**: Management and Reporting of Adverse Reactions
3. **GVP Module IX**: Signal Management
4. **EudraVigilance**: European database of suspected adverse drug reaction reports

### 11.4 Causality Assessment Methods

1. **Naranjo Algorithm**: Naranjo CA, et al. "A method for estimating the probability of adverse drug reactions." Clin Pharmacol Ther. 1981;30(2):239-245.
2. **WHO-UMC Causality Categories**: Uppsala Monitoring Centre. "The use of the WHO-UMC system for standardised case causality assessment." (2018)
3. **Karch-Lasagna Algorithm**: Karch FE, Lasagna L. "Toward the operational identification of adverse drug reactions." Clin Pharmacol Ther. 1977;21(3):247-254.

### 11.5 Signal Detection Resources

1. **WHO VigiBase**: https://www.vigiaccess.org/
2. **FDA FAERS**: https://www.fda.gov/drugs/surveillance/questions-and-answers-fdas-adverse-event-reporting-system-faers
3. **EudraVigilance**: https://www.ema.europa.eu/en/human-regulatory/research-development/pharmacovigilance/eudravigilance
4. **Stephens Detection Method**: Stephens MDB. "Signal Detection in Pharmacovigilance." In: Andrews EB, Moore N, eds. Mann's Pharmacovigilance. 3rd ed. Wiley-Blackwell; 2014.

### 11.6 MedDRA & WHO-DD

1. **MedDRA MSSO**: https://www.meddra.org/
2. **WHO Drug Dictionary**: https://www.who-umc.org/vigibase/services/who-drug-dictionaries/
3. **MedDRA Coding Guidelines**: Available via MSSO subscription

### 11.7 Training Resources

1. **CIOMS Working Group Reports**: https://cioms.ch/publications/product/pharmacovigilance/
2. **DIA (Drug Information Association)**: Pharmacovigilance training courses
3. **Regulatory Affairs Professionals Society (RAPS)**: PV certifications

---

## VERSION CONTROL

**Document Version**: 1.0  
**Last Updated**: October 10, 2025  
**Document Owner**: Drug Safety & Pharmacovigilance Team  
**Next Review Date**: April 10, 2026

**Changes from Previous Version**: N/A (initial release)

---

**END OF UC_PV_013: PHARMACOVIGILANCE & ICSR PROCESSING**

For questions or feedback, contact: [Your Safety Team Contact]
