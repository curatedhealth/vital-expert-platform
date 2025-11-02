# USE CASE 43: UC_EG_008 - PATIENT-CENTERED OUTCOMES RESEARCH (PCOR)

## Life Sciences Intelligence Prompt Library (LSIPL)
**Version**: 1.0  
**Last Updated**: October 11, 2025  
**Classification**: Evidence Generation > Patient-Centered Outcomes Research  
**Complexity**: ADVANCED  
**Status**: Production-Ready

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Strategic Context & Business Value](#2-strategic-context--business-value)
3. [Persona Definitions](#3-persona-definitions)
4. [Workflow Overview](#4-workflow-overview)
5. [Detailed Workflow Steps](#5-detailed-workflow-steps)
6. [Prompt Library](#6-prompt-library)
7. [Quality Assurance Framework](#7-quality-assurance-framework)
8. [Integration & Dependencies](#8-integration--dependencies)
9. [Regulatory & Compliance Considerations](#9-regulatory--compliance-considerations)
10. [Case Studies & Examples](#10-case-studies--examples)
11. [Appendices](#11-appendices)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Overview

**Use Case ID**: UC_EG_008  
**Title**: Patient-Centered Outcomes Research (PCOR) Study Design & Execution  
**Domain**: DIGITAL_HEALTH, PHARMACEUTICAL  
**Function**: EVIDENCE_GENERATION  
**Complexity**: ADVANCED  
**Typical Duration**: 12-24 months (full study lifecycle)

**Description**: Patient-Centered Outcomes Research (PCOR) focuses on outcomes that matter most to patients—including symptom burden, functional status, quality of life, and patient experience of care—rather than traditional clinical endpoints alone. This use case guides the design, execution, and analysis of PCOR studies for digital health interventions, DTx products, and pharmaceutical treatments where patient perspectives are critical for regulatory approval, reimbursement, and adoption.

**Key Stakeholders**:
- **Primary**: Head of Real-World Evidence, Chief Medical Officer, Patient Advocacy Lead
- **Supporting**: VP Clinical Development, Director Market Access, Biostatistician
- **External**: Patient Advisory Boards, PCORI (Patient-Centered Outcomes Research Institute), Payers

### 1.2 Business Objectives

**Primary Goals**:
1. **Regulatory**: Generate patient-centered evidence that supports FDA/EMA submissions (e.g., patient-reported outcomes as endpoints)
2. **Payer/HTA**: Demonstrate value from patient perspective for reimbursement and coverage decisions
3. **Product Development**: Inform DTx features and interventions based on patient priorities
4. **Scientific**: Publish PCOR studies in peer-reviewed journals to establish clinical value
5. **Market Access**: Differentiate product based on patient-meaningful outcomes

**Success Metrics**:
- Patient-reported outcome (PRO) measures selected with ≥80% patient advisory board approval
- PCOR study design rated as "patient-centered" by independent PCOR experts (e.g., PCORI review)
- ≥90% patient engagement in study (retention rate)
- Published PCOR findings in peer-reviewed journals (≥1 publication)
- Evidence cited in value dossiers, HTA submissions, and payer negotiations

### 1.3 Key Deliverables

| Phase | Deliverable | Owner | Timeline |
|-------|-------------|-------|----------|
| **Phase 1: Planning** | PCOR Study Concept Document | P16_RWE | Week 1-2 |
| | Patient Advisory Board Charter | P20_PATADV | Week 2-3 |
| | PCOR Study Protocol | P16_RWE, P01_CMO | Week 4-8 |
| **Phase 2: Patient Engagement** | Patient Priority Survey Results | P20_PATADV | Week 8-12 |
| | PRO Instrument Selection Rationale | P16_RWE | Week 12-14 |
| | Cognitive Debriefing Report | P20_PATADV | Week 14-16 |
| **Phase 3: Execution** | IRB-Approved Protocol | P16_RWE | Month 4 |
| | Patient Recruitment Materials | P20_PATADV | Month 4-5 |
| | Interim Data Analysis | P17_BIOSTAT | Month 12 |
| **Phase 4: Analysis & Dissemination** | PCOR Study Results Report | P16_RWE | Month 18-20 |
| | Patient-Friendly Results Summary | P20_PATADV | Month 20-21 |
| | Manuscript for Publication | P01_CMO | Month 21-24 |
| | Patient Dissemination Plan | P20_PATADV | Month 24 |

---

## 2. STRATEGIC CONTEXT & BUSINESS VALUE

### 2.1 Why PCOR Matters in Digital Health & Life Sciences

**Regulatory Imperative**: FDA increasingly values patient-centered endpoints, especially for patient-reported outcomes (PROs) and digital health technologies. The 21st Century Cures Act (2016) emphasizes patient experience data in regulatory decision-making.

**Payer & HTA Requirements**: Organizations like NICE (UK), ICER (US), and CADTH (Canada) require patient-centered evidence—particularly quality-adjusted life years (QALYs) and patient-reported quality of life—for reimbursement decisions.

**Patient Advocacy & Ethics**: Patients and advocacy groups demand a voice in research. PCOR ensures that research addresses outcomes patients care about, not just what clinicians or researchers prioritize.

**Competitive Differentiation**: Products with robust patient-centered evidence stand out in crowded markets. Demonstrating patient-meaningful benefits (e.g., "return to work," "reduction in caregiver burden") resonates more than abstract clinical endpoints.

**Digital Health Context**: For DTx and digital health, PCOR is especially critical because:
- **Engagement is voluntary**: Patients must find the product valuable to use it consistently
- **Traditional endpoints may not capture value**: e.g., an app reducing anxiety attacks is meaningful to patients even if GAD-7 scores show modest change
- **Patient experience determines adoption**: Usability, burden, and perceived benefit drive real-world utilization

### 2.2 PCOR vs. Traditional Clinical Research

| Dimension | Traditional Clinical Research | Patient-Centered Outcomes Research |
|-----------|------------------------------|-----------------------------------|
| **Outcome Selection** | Clinician/researcher-defined (e.g., biomarkers, mortality) | Patient-defined priorities (symptoms, function, QOL) |
| **Study Design** | Efficacy-focused (RCT with strict controls) | Pragmatic trials, observational studies, real-world settings |
| **Patient Involvement** | Passive participants (consent, follow protocol) | Active partners (co-design, co-interpretation) |
| **Endpoints** | Clinical endpoints (e.g., A1C, tumor size) | Patient-reported outcomes (PROs), experience measures |
| **Evidence Goal** | Regulatory approval, scientific publication | Inform patient/clinician decisions, support shared decision-making |
| **Generalizability** | Narrow (selected population, controlled setting) | Broad (diverse populations, real-world conditions) |

**Example**:  
- **Traditional**: "Does DTx reduce depression scores (PHQ-9) by ≥5 points vs. control?"
- **PCOR**: "Does DTx improve patients' ability to work, socialize, and perform daily activities—outcomes patients prioritize most?"

### 2.3 PCOR Funding & Strategic Partnerships

**Patient-Centered Outcomes Research Institute (PCORI)**: US-based non-profit funding PCOR studies. Annual budget ~$500M. Strict requirements for patient engagement, pragmatic study designs, and dissemination to patients.

**Potential Funding**: PCORI funds comparative effectiveness research and methodology research. DTx companies and pharma can apply for PCORI grants (typically $2-5M over 3-4 years) if study meets PCORI standards for patient-centeredness.

**Strategic Value**: PCORI-funded studies carry credibility with payers, patient advocacy groups, and policymakers. Evidence from PCORI studies is often cited in HTA reviews and coverage decisions.

### 2.4 ROI & Business Impact

**Investment in PCOR**:
- Study costs: $500K-$2M (depending on sample size, duration, data sources)
- Patient engagement: $50K-$150K (patient advisory boards, cognitive debriefing, dissemination)
- Publication & dissemination: $25K-$50K
- **Total**: $600K-$2.2M

**Return on Investment**:
- **Regulatory**: PCOR evidence supporting FDA approval (e.g., PRO as co-primary endpoint) → $5-15M value (avoided delays, stronger label)
- **Market Access**: Evidence supporting payer coverage decisions → $10-50M revenue impact (access to 50M+ covered lives)
- **Product Development**: Patient insights inform product roadmap → $1-5M avoided development costs (avoid features patients don't value)
- **Publication & Reputation**: PCOR publications enhance scientific credibility → intangible but significant brand value
- **Patient Loyalty**: Patients engaged in research become advocates → increased retention, referrals

**ROI**: 5-25x investment over 3-5 year product lifecycle

---

## 3. PERSONA DEFINITIONS

This use case requires deep collaboration across clinical, patient advocacy, biostatistics, and real-world evidence teams. Patient involvement is not optional—it is central to PCOR.

### 3.1 P16_RWE: Head of Real-World Evidence

**Role in UC_EG_008**: Lead PCOR study design; oversee protocol development, data analysis, publication strategy

**Responsibilities**:
- Define PCOR research questions aligned with patient priorities and strategic objectives
- Design pragmatic study protocols (observational, pragmatic RCTs) with patient input
- Select appropriate data sources (claims, EHR, patient registries, patient-generated data)
- Collaborate with patient advisory board to ensure patient-centeredness
- Oversee statistical analysis plan (SAP) development
- Lead manuscript writing and publication
- Ensure compliance with PCORI methodological standards (if applicable)
- Disseminate findings to patients, clinicians, payers

**Required Expertise**:
- PhD, DrPH, or MD with 7-10+ years in outcomes research, health services research, or epidemiology
- Expertise in observational study designs, pragmatic trials, and patient-reported outcomes
- Knowledge of PCORI methodological standards and PCOR principles
- Experience with patient engagement in research
- Statistical proficiency (multivariate regression, propensity scores, survival analysis)
- Publication track record in peer-reviewed journals (JAMA, NEJM, Health Affairs, etc.)

**Experience Level**: Senior director or VP level; often leads RWE or HEOR function

**Tools Used**:
- Statistical software (SAS, R, Python, Stata)
- Data sources (claims databases, EHR, patient registries)
- Literature databases (PubMed, Cochrane Library, PCORI Evidence Database)
- Protocol writing software (e.g., TrialMaster, Veeva Vault)

---

### 3.2 P20_PATADV: Patient Advocacy & Engagement Lead

**Role in UC_EG_008**: Ensure patient voice is central; recruit and manage patient advisory board; facilitate patient input throughout study lifecycle

**Responsibilities**:
- Recruit and manage Patient Advisory Board (PAB) for study
- Facilitate PAB meetings to gather patient priorities, outcome preferences, and study design input
- Conduct patient surveys and focus groups to identify patient-important outcomes
- Lead cognitive debriefing of PRO instruments with patients
- Ensure study materials (consent forms, patient-facing materials) are patient-friendly
- Translate study results into patient-friendly language for dissemination
- Develop patient dissemination plan (patient-facing summaries, infographics, videos)
- Coordinate with patient advocacy organizations for study recruitment and dissemination
- Ensure diversity and inclusion in patient engagement (age, race, socioeconomic status, health literacy)

**Required Expertise**:
- Background in patient advocacy, social work, public health, or health communication
- 5-7+ years experience in patient engagement, patient partnership, or community-based participatory research
- Strong facilitation skills (able to lead productive patient meetings)
- Cultural competency and ability to engage diverse patient populations
- Understanding of health literacy principles and plain language communication
- Familiarity with PCORI patient engagement standards

**Experience Level**: Mid to senior level; may report to CMO or VP of Patient Experience

**Tools Used**:
- Survey platforms (Qualtrics, SurveyMonkey)
- Focus group facilitation tools (Zoom, Miro for virtual whiteboards)
- Patient recruitment platforms (PatientsLikeMe, Health Union patient communities)
- Plain language assessment tools (e.g., SMOG readability index)
- Patient dissemination channels (social media, patient advocacy websites)

---

### 3.3 P17_BIOSTAT: Senior Biostatistician (HEOR/RWE)

**Role in UC_EG_008**: Develop statistical analysis plan; conduct data analysis; support interpretation of results

**Responsibilities**:
- Collaborate with P16_RWE to develop Statistical Analysis Plan (SAP)
- Determine appropriate statistical methods for patient-reported outcomes (e.g., mixed models for longitudinal PRO data)
- Conduct power calculations and sample size estimation
- Perform data cleaning, cohort construction, descriptive statistics
- Conduct primary outcome analyses (multivariable regression, propensity score methods, survival analysis)
- Perform subgroup analyses to explore heterogeneity of treatment effects
- Conduct sensitivity analyses to test robustness of findings
- Create publication-ready tables and figures
- Support manuscript writing (methods and results sections)

**Required Expertise**:
- MS or PhD in Biostatistics, Epidemiology, or related quantitative field
- 5-7+ years experience in outcomes research or clinical trials
- Proficiency in statistical software (SAS, R, Stata)
- Expertise in patient-reported outcomes analysis (repeated measures, missing data methods)
- Knowledge of causal inference methods (propensity scores, instrumental variables)
- Publication experience in peer-reviewed journals

**Experience Level**: Senior individual contributor or team lead

**Tools Used**:
- SAS, R, Stata, Python
- Data management platforms (SQL, Snowflake, Redshift)
- Visualization tools (ggplot2, Tableau)
- Version control (Git, GitHub)

---

### 3.4 P01_CMO: Chief Medical Officer

**Role in UC_EG_008**: Provide clinical oversight; ensure clinical validity of PCOR study; support manuscript writing and dissemination

**Responsibilities**:
- Review PCOR study concept for clinical relevance and scientific rigor
- Provide clinical interpretation of patient-reported outcomes
- Ensure alignment between patient priorities and clinical outcomes
- Support PRO instrument selection and validation
- Review study protocol and SAP from clinical perspective
- Contribute to manuscript writing (clinical interpretation, discussion, limitations)
- Engage key opinion leaders (KOLs) for external validation and dissemination
- Present PCOR findings at medical conferences

**Required Expertise**:
- MD, DO, or PhD with 10-15+ years clinical and research experience
- Deep clinical knowledge in therapeutic area
- Understanding of patient-reported outcomes and PCOR principles
- Publication experience in peer-reviewed clinical journals
- Experience with regulatory submissions and health technology assessments

**Experience Level**: Senior executive; often reports to CEO

**Tools Used**:
- Medical literature databases (PubMed, Cochrane)
- Clinical guidelines and consensus statements
- PRO instrument libraries (PROMIS, ePROVIDE)
- Manuscript writing tools (Microsoft Word, EndNote, Mendeley)

---

### 3.5 P14_MKTACCESS: Director, Market Access / HEOR

**Role in UC_EG_008**: Ensure PCOR evidence aligns with payer and HTA requirements; support value dossier development

**Responsibilities**:
- Define payer-relevant outcomes for PCOR study (e.g., healthcare utilization, costs, QALYs)
- Ensure PCOR study design meets HTA evidence requirements (NICE, ICER, CADTH)
- Provide input on study population to ensure generalizability to payer-covered populations
- Support economic modeling using PCOR data (cost-effectiveness analysis, budget impact model)
- Integrate PCOR findings into value dossiers and payer presentations
- Develop payer-facing evidence summaries from PCOR study

**Required Expertise**:
- PharmD, MPH, MBA, or PhD in health economics
- 5-7+ years experience in market access, HEOR, or payer strategy
- Knowledge of HTA methodologies and payer evidence requirements
- Experience with economic modeling (cost-effectiveness, budget impact)
- Understanding of patient-reported outcomes and quality of life measurement

**Experience Level**: Mid to senior level; may report to VP of Market Access

**Tools Used**:
- Economic modeling software (TreeAge, Excel)
- HTA guidelines (NICE, ICER, CADTH, IQWiG)
- Payer databases (formulary data, coverage policies)
- Value dossier templates

---

## 4. WORKFLOW OVERVIEW

### 4.1 High-Level Process Flow

Patient-Centered Outcomes Research follows a structured but flexible process that places patient engagement at every stage:

```
â•"â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•' PHASE 1: PCOR PLANNING & PATIENT ENGAGEMENT  â•'
â•'  - Define research question                  â•'
â•'  - Establish Patient Advisory Board          â•'
â•'  - Identify patient priorities & outcomes    â•'
â•'  - Develop PCOR study protocol                â•'
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    |
                    v
â•"â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•' PHASE 2: PRO INSTRUMENT SELECTION & VALIDATION â•'
â•'  - Select PRO instruments with patient input  â•'
â•'  - Cognitive debriefing with patients         â•'
â•'  - Finalize measurement strategy               â•'
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    |
                    v
â•"â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•' PHASE 3: STUDY EXECUTION                       â•'
â•'  - IRB approval                                â•'
â•'  - Patient recruitment (with patient input)    â•'
â•'  - Data collection (PROs + clinical data)      â•'
â•'  - Interim analysis & patient engagement       â•'
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    |
                    v
â•"â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•' PHASE 4: ANALYSIS & DISSEMINATION               â•'
â•'  - Statistical analysis                        â•'
â•'  - Clinical & patient interpretation           â•'
â•'  - Manuscript preparation                      â•'
â•'  - Patient-friendly results dissemination      â•'
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

### 4.2 Timeline Summary

| Phase | Duration | Milestones |
|-------|----------|-----------|
| **Phase 1: Planning** | 3-4 months | PCOR concept, PAB established, protocol finalized |
| **Phase 2: PRO Selection** | 2-3 months | PRO instruments selected, cognitive debriefing complete |
| **Phase 3: Execution** | 12-18 months | IRB approval, patient enrollment, data collection |
| **Phase 4: Analysis** | 4-6 months | Analysis complete, manuscript submitted, patient dissemination |
| **TOTAL** | 21-31 months | Published PCOR evidence, patient-disseminated results |

**Critical Path**: Patient recruitment and retention are typically the longest lead-time activities. Early and ongoing patient engagement improves retention.

### 4.3 Key Decision Points

| Decision Point | Owner | Trigger | Outcome |
|----------------|-------|---------|---------|
| **Is this study truly patient-centered?** | P16_RWE, P20_PATADV | After Phase 1 | Go/No-Go decision |
| **Do PRO instruments capture patient priorities?** | P20_PATADV, P01_CMO | After cognitive debriefing | Modify PROs or proceed |
| **Is patient recruitment on track?** | P20_PATADV | Monthly during Phase 3 | Adjust recruitment strategy |
| **Should we pursue PCORI funding?** | P16_RWE, CFO | Before Phase 1 starts | Apply for grant or self-fund |
| **Are results clinically and patient-meaningful?** | P01_CMO, P20_PATADV | After analysis | Determines dissemination strategy |

---

## 5. DETAILED WORKFLOW STEPS

### PHASE 1: PCOR PLANNING & PATIENT ENGAGEMENT

---

#### **STEP 1.1: Define PCOR Research Question (30 minutes)**

**Objective**: Define a research question that addresses patient priorities and is answerable with real-world evidence.

**Persona**: P16_RWE (Lead), P01_CMO (Support)

**Prerequisites**:
- Strategic objectives for DTx/product
- Understanding of patient population and clinical condition
- Preliminary literature review on patient-reported outcomes in indication

**Process**:
1. **Frame Research Question Using PICO(T) Framework**
   - **P**opulation: Which patients?
   - **I**ntervention: DTx, pharmaceutical, or other intervention
   - **C**omparator: Usual care, alternative treatment, or placebo
   - **O**utcomes: Patient-centered outcomes (PROs, QOL, function)
   - **(T)**iming: Study duration and follow-up period

2. **Execute Prompt 1.1** (see Prompt Library Section 6)
   - Structured prompt to define PCOR research question
   - Ensures alignment with patient priorities

**Deliverable**: PCOR Research Question Document (1-2 pages)

**Quality Check**:
✅ Research question is clearly stated  
✅ Outcomes are patient-centered (not just clinical endpoints)  
✅ Question is answerable with available data  
✅ Aligns with strategic objectives (regulatory, payer, product)

---

#### **STEP 1.2: Establish Patient Advisory Board (PAB) (2-3 weeks)**

**Objective**: Recruit and onboard a diverse Patient Advisory Board to provide ongoing input throughout the study.

**Persona**: P20_PATADV (Lead)

**Prerequisites**:
- PCOR Research Question defined
- Budget allocated for patient engagement (~$50K-$100K)
- IRB approval for patient engagement activities (if required)

**Process**:

1. **Define PAB Charter & Scope** (1 week)
   - PAB size: 8-12 patients
   - Diversity requirements: Age, race/ethnicity, socioeconomic status, disease severity, geographic location
   - Meeting frequency: Quarterly for 18-24 months
   - Compensation: $100-$200 per meeting + travel reimbursement
   - Roles: Review study design, provide outcome priorities, review materials, interpret results

2. **Recruit PAB Members** (1-2 weeks)
   - Channels: Patient advocacy organizations, social media, patient registries, clinician referrals
   - Screening: Ensure diversity, willingness to commit, ability to provide constructive feedback
   - Onboarding: Orientation on research process, confidentiality agreements, expectations

3. **Hold Kickoff Meeting** (Week 3)
   - Present PCOR research question
   - Gather initial patient input on priorities
   - Review meeting schedule and expectations

**Deliverable**: PAB Charter, PAB Member Roster, Kickoff Meeting Summary

**Quality Check**:
✅ PAB is diverse (age, race, SES, disease severity)  
✅ PAB members understand their role  
✅ PAB meetings scheduled for full study duration  
✅ Compensation and logistics finalized

---

#### **STEP 1.3: Identify Patient Priorities & Outcomes (4-6 weeks)**

**Objective**: Systematically identify outcomes that matter most to patients through surveys, focus groups, and PAB input.

**Persona**: P20_PATADV (Lead), P16_RWE (Support)

**Prerequisites**:
- PAB established
- Budget for patient surveys/focus groups

**Process**:

1. **Conduct Patient Priority Survey** (2 weeks)
   - Use validated frameworks (e.g., PCORI Patient Priorities Survey)
   - Ask patients: "What outcomes matter most to you?"
   - Example outcomes: Symptom relief, functional improvement (work, social, physical), quality of life, reduced caregiver burden, reduced healthcare visits
   - Survey sample: 50-200 patients (depending on indication)

2. **Host Patient Focus Groups** (2-3 sessions, 2 weeks)
   - Virtual or in-person focus groups (6-10 patients per session)
   - Facilitate discussion: "What would make treatment successful for you?"
   - Identify themes and priority outcomes
   - Record and transcribe sessions for analysis

3. **PAB Review & Prioritization** (1 meeting, 1 week)
   - Present survey and focus group findings to PAB
   - PAB ranks outcomes by importance
   - Finalize list of patient-priority outcomes

4. **Map Patient Priorities to Measurable Outcomes** (1 week)
   - Link patient-identified priorities to validated PRO instruments
   - Example: "Ability to work" → Work Productivity and Activity Impairment (WPAI) scale
   - Identify gaps where no validated instrument exists

**Deliverable**: Patient Priority Outcomes Report (5-10 pages)

**Quality Check**:
✅ ≥50 patients surveyed  
✅ ≥2 focus groups conducted  
✅ PAB reviewed and approved priority outcomes  
✅ Outcomes are specific, measurable, patient-meaningful

---

#### **STEP 1.4: Develop PCOR Study Protocol (4-6 weeks)**

**Objective**: Draft a comprehensive PCOR study protocol incorporating patient priorities, pragmatic design, and real-world data sources.

**Persona**: P16_RWE (Lead), P01_CMO, P17_BIOSTAT (Support)

**Prerequisites**:
- Patient Priority Outcomes Report
- Preliminary data source assessment (claims, EHR, patient registry)
- Literature review on similar PCOR studies

**Process**:

1. **Draft Protocol Outline** (1 week)
   - Follow PCORI Methodology Standards (if applicable)
   - Sections: Background, Objectives, Study Design, Population, Outcomes, Data Sources, Statistical Analysis, Patient Engagement, Dissemination Plan
   - Emphasize pragmatic design (real-world setting, diverse population, patient-centered outcomes)

2. **Execute Prompt 1.4.1: PCOR Protocol Structure** (see Prompt Library)
   - AI-guided protocol development
   - Ensures compliance with PCORI standards and pragmatic trial principles

3. **PAB Review of Draft Protocol** (1 meeting, 1 week)
   - Present draft protocol to PAB
   - Gather feedback: Is this study design patient-centered? Are outcomes meaningful? Is participation burden acceptable?
   - Revise protocol based on PAB input

4. **Clinical & Statistical Review** (2 weeks)
   - P01_CMO reviews clinical aspects (inclusion/exclusion criteria, safety monitoring, clinical relevance)
   - P17_BIOSTAT reviews statistical plan (sample size, analysis methods, missing data approach)

5. **Finalize Protocol** (1 week)
   - Incorporate all feedback
   - Final quality check (see Quality Checklist in Section 7)

**Deliverable**: PCOR Study Protocol (30-50 pages)

**Quality Check**:
✅ Protocol includes patient-centered outcomes as primary endpoints  
✅ Study design is pragmatic (real-world setting, broad eligibility)  
✅ PAB reviewed and approved protocol  
✅ Sample size is adequate (power ≥80%)  
✅ Patient engagement plan is explicit (not just data collection)

---

### PHASE 2: PRO INSTRUMENT SELECTION & VALIDATION

---

#### **STEP 2.1: Select PRO Instruments (2-3 weeks)**

**Objective**: Select validated PRO instruments that capture patient priorities and are appropriate for the population and study design.

**Persona**: P16_RWE (Lead), P01_CMO, P20_PATADV (Support)

**Prerequisites**:
- Patient Priority Outcomes Report
- Access to PRO instrument libraries (PROMIS, ePROVIDE, Mapi Research Trust)

**Process**:

1. **Literature Search for Validated PRO Instruments** (1 week)
   - Search for PROs used in similar indications and populations
   - Evaluate psychometric properties: Validity, reliability, responsiveness, MCID
   - Consider FDA PRO guidance requirements

2. **Execute Prompt 2.1.1: PRO Instrument Selection** (see Prompt Library)
   - AI-guided PRO selection
   - Considers patient priorities, validation status, regulatory acceptability, feasibility

3. **Preliminary PRO Shortlist** (End of Week 1)
   - 3-5 candidate PRO instruments for each patient-priority outcome
   - Document strengths/limitations of each

4. **PAB Review of PRO Instruments** (1 meeting, Week 2)
   - Show PAB example items from candidate PROs
   - Ask: "Do these questions capture what matters to you?"
   - Gather feedback on clarity, relevance, burden

5. **Final PRO Selection** (Week 3)
   - P16_RWE and P01_CMO finalize PRO instruments based on PAB input
   - Consider: 1-2 primary PROs, 2-4 secondary PROs
   - Ensure total assessment burden is acceptable (<20 minutes)

**Deliverable**: PRO Instrument Selection Rationale Document (5-7 pages)

**Quality Check**:
✅ PRO instruments are validated (published psychometrics)  
✅ PRO instruments capture patient priorities (PAB-approved)  
✅ Total assessment burden ≤20 minutes  
✅ PROs are appropriate for digital/remote administration  
✅ FDA PRO guidance requirements met (if regulatory submission planned)

---

#### **STEP 2.2: Cognitive Debriefing with Patients (3-4 weeks)**

**Objective**: Test PRO instruments with patients to ensure questions are understandable, relevant, and not burdensome.

**Persona**: P20_PATADV (Lead), P16_RWE (Support)

**Prerequisites**:
- PRO instruments selected
- Budget for cognitive debriefing ($15K-$30K)
- IRB approval for cognitive debriefing (if required)

**Process**:

1. **Recruit Cognitive Debriefing Participants** (1 week)
   - Sample: 10-15 patients representative of study population
   - Diversity: Age, race, health literacy, disease severity
   - Channels: PAB referrals, patient advocacy groups, clinician referrals

2. **Conduct One-on-One Cognitive Interviews** (2 weeks)
   - 60-minute interviews per patient
   - Patient completes PRO, then "think aloud" about each item
   - Probe: "What does this question mean to you?" "Is this question relevant?" "Is any wording confusing?"
   - Document issues: Comprehension problems, missing concepts, irrelevant items

3. **Analyze Cognitive Debriefing Data** (1 week)
   - Identify patterns: Which items are problematic? For which patient subgroups?
   - Assess overall: Does PRO capture patient priorities? Is burden acceptable?
   - Recommendations: Modify wording? Drop items? Add items?

4. **PAB Review of Findings** (1 meeting, Week 4)
   - Present cognitive debriefing results to PAB
   - PAB provides input on recommended changes
   - Finalize PRO instrument modifications (if any)

**Deliverable**: Cognitive Debriefing Report (10-15 pages)

**Quality Check**:
✅ ≥10 patients participated in cognitive debriefing  
✅ Patients understand PRO items (≥90% comprehension)  
✅ PRO items are relevant to patients (≥80% relevance rating)  
✅ No major issues identified (or issues resolved via modifications)  
✅ PAB approved final PRO instruments

---

#### **STEP 2.3: Finalize Measurement Strategy (1 week)**

**Objective**: Finalize data collection plan for PROs and other patient-centered measures.

**Persona**: P16_RWE (Lead), P17_BIOSTAT (Support)

**Prerequisites**:
- PRO instruments finalized after cognitive debriefing
- Data collection platform selected (REDCap, Medidata Rave, custom app)

**Process**:

1. **Define PRO Assessment Schedule**
   - Baseline (Week 0)
   - Follow-up timepoints: Weekly? Monthly? End of study?
   - Consider: Frequency should balance data richness vs. patient burden

2. **Plan for Missing Data**
   - Strategies to minimize missingness: Reminders, incentives, flexible scheduling
   - Statistical approach for missing data: Multiple imputation? Sensitivity analysis?

3. **Data Collection Platform Setup**
   - Program PROs into electronic data capture system
   - Test user experience (pilot with 3-5 patients)
   - Ensure mobile-friendly, accessible (ADA compliance)

4. **Define Data Quality Checks**
   - Real-time validation rules (e.g., date ranges, skip patterns)
   - Monitoring plan: Weekly data quality reports

**Deliverable**: Measurement Strategy Document (3-5 pages)

**Quality Check**:
✅ PRO assessment schedule is feasible (not overly burdensome)  
✅ Data collection platform is user-friendly  
✅ Plan for missing data is explicit  
✅ Data quality checks are automated

---

### PHASE 3: STUDY EXECUTION

---

#### **STEP 3.1: IRB Approval (4-8 weeks)**

**Objective**: Obtain Institutional Review Board (IRB) approval for PCOR study.

**Persona**: P16_RWE (Lead), Regulatory/Ethics team (Support)

**Prerequisites**:
- Final PCOR study protocol
- Informed consent forms
- Patient recruitment materials
- Data management plan

**Process**:

1. **Prepare IRB Submission Package** (2 weeks)
   - Protocol
   - Informed consent form (ICF) - ensure plain language (health literacy level ≤8th grade)
   - Patient-facing materials (recruitment flyers, study brochures)
   - Data management and security plan (HIPAA compliance)
   - Patient compensation plan

2. **Submit to IRB** (Week 0)

3. **Respond to IRB Questions** (Weeks 2-6)
   - Address IRB reviewer comments
   - Revise documents as needed
   - Common IRB concerns for PCOR: Patient burden, data privacy, compensation adequacy

4. **IRB Approval** (Weeks 4-8)

**Deliverable**: IRB Approval Letter

**Quality Check**:
✅ ICF is written in plain language  
✅ Patient burden is acceptable per IRB  
✅ Data privacy protections are adequate  
✅ Patient compensation is fair and non-coercive

---

#### **STEP 3.2: Patient Recruitment (3-6 months)**

**Objective**: Recruit diverse patient population for PCOR study.

**Persona**: P20_PATADV (Lead), P16_RWE (Support)

**Prerequisites**:
- IRB approval
- Recruitment materials finalized
- Recruitment channels identified

**Process**:

1. **Develop Recruitment Strategy** (2 weeks)
   - Channels: Clinician referrals, patient advocacy groups, social media, patient registries, community health centers
   - Messaging: Emphasize patient voice, contribution to research, compensation
   - Ensure diversity: Target underrepresented populations (racial/ethnic minorities, low SES, rural areas)

2. **Launch Recruitment** (Ongoing)
   - Monitor enrollment weekly
   - Track enrollment by demographic subgroups
   - Adjust strategy if enrollment lags or lacks diversity

3. **Screen & Enroll Patients**
   - Inclusion/exclusion criteria screening
   - Obtain informed consent
   - Baseline PRO assessment

4. **Engage PAB in Recruitment**
   - PAB members can refer patients
   - PAB reviews recruitment materials for patient-friendliness
   - PAB provides feedback if recruitment is struggling

**Deliverable**: Enrolled cohort (target N per protocol)

**Quality Check**:
✅ Enrollment on track (≥80% of target by halfway point)  
✅ Cohort is diverse (representative of real-world population)  
✅ Informed consent process is patient-friendly  
✅ <10% screen failures due to overly restrictive criteria

---

#### **STEP 3.3: Data Collection & Monitoring (12-18 months)**

**Objective**: Collect PRO and clinical data; monitor data quality and patient retention.

**Persona**: P16_RWE (Lead), P20_PATADV (Support for retention)

**Prerequisites**:
- Patients enrolled
- Data collection platform live

**Process**:

1. **Ongoing PRO Data Collection**
   - Automated reminders for PRO assessments
   - Patient support: Help desk for technical issues
   - Monitor completion rates (target: ≥80% completion at each timepoint)

2. **Clinical Data Collection**
   - If using EHR/claims data: Data extraction per protocol schedule
   - If using patient-generated data (wearables, app usage): Continuous collection

3. **Data Quality Monitoring** (Weekly)
   - Review missing data patterns
   - Identify outliers or data entry errors
   - Query sites/patients for clarification if needed

4. **Patient Retention Strategies**
   - Regular communication with patients (newsletters, "thank you" messages)
   - Address barriers to participation (e.g., technical issues, time conflicts)
   - Compensation for completed assessments

5. **Interim Analysis** (Mid-study, Month 6-9)
   - Descriptive analysis: Enrollment demographics, baseline characteristics, PRO completion rates
   - Feasibility check: Is study on track?
   - PAB update meeting: Share interim findings, gather feedback

**Deliverable**: Clean dataset with PRO and clinical data

**Quality Check**:
✅ PRO completion rate ≥80% at each timepoint  
✅ <25% attrition by end of study  
✅ Data quality issues resolved within 2 weeks  
✅ Patient satisfaction with study participation is high (exit survey ≥4/5)

---

### PHASE 4: ANALYSIS & DISSEMINATION

---

#### **STEP 4.1: Statistical Analysis (2-3 months)**

**Objective**: Conduct comprehensive statistical analysis of PCOR data per Statistical Analysis Plan (SAP).

**Persona**: P17_BIOSTAT (Lead), P16_RWE (Support)

**Prerequisites**:
- Data collection complete
- Dataset cleaned and locked
- SAP finalized

**Process**:

1. **Descriptive Analysis** (2 weeks)
   - Patient flow diagram (CONSORT-style)
   - Baseline characteristics (Table 1)
   - PRO completion rates and missing data patterns

2. **Primary Outcome Analysis** (3-4 weeks)
   - Analyze primary patient-centered outcome per SAP
   - Statistical methods: Multivariable regression, mixed models (for longitudinal PRO data), survival analysis
   - Adjust for confounders (age, sex, disease severity, comorbidities)
   - Calculate effect sizes with 95% confidence intervals
   - Assess clinical meaningfulness: Does effect exceed MCID?

3. **Secondary Outcome Analysis** (3-4 weeks)
   - Analyze all secondary patient-centered outcomes
   - Include healthcare utilization and costs (if available)

4. **Subgroup Analysis** (2 weeks)
   - Pre-specified subgroups: Age, sex, race/ethnicity, disease severity
   - Assess heterogeneity of treatment effects
   - Test for interactions

5. **Sensitivity Analysis** (2 weeks)
   - Test robustness of findings to missing data assumptions
   - Alternative statistical models
   - Per-protocol analysis (in addition to intention-to-treat)

6. **Create Publication-Ready Tables & Figures** (1 week)
   - Table 1: Baseline characteristics
   - Table 2: Primary outcome results
   - Table 3: Secondary outcomes
   - Figure 1: Patient flow diagram
   - Figure 2: PRO trajectory over time (line plot)
   - Figure 3: Subgroup analysis (forest plot)

**Deliverable**: Statistical Analysis Report (20-30 pages) with tables and figures

**Quality Check**:
✅ All analyses per SAP completed  
✅ Results are reproducible (code documented)  
✅ Tables and figures are publication-ready  
✅ Statistical assumptions checked and met  
✅ Clinical meaningfulness assessed (not just statistical significance)

---

#### **STEP 4.2: Clinical & Patient Interpretation (2-3 weeks)**

**Objective**: Interpret statistical findings from clinical and patient perspectives.

**Persona**: P01_CMO (Clinical interpretation), P20_PATADV (Patient interpretation)

**Prerequisites**:
- Statistical Analysis Report complete

**Process**:

1. **Clinical Interpretation Meeting** (1 meeting, Week 1)
   - P01_CMO and P16_RWE review findings
   - Questions: Are results clinically meaningful? Do they change practice? What are limitations?
   - Draft clinical interpretation section for manuscript

2. **PAB Results Review Meeting** (1 meeting, Week 2)
   - Present results to PAB in patient-friendly format
   - Ask PAB: "Are these results meaningful to patients?" "Do they answer the questions that matter?"
   - PAB provides input on how to communicate results to other patients

3. **Synthesize Clinical & Patient Perspectives** (Week 3)
   - Integrate clinical and patient interpretations
   - Identify areas of alignment and divergence
   - Finalize interpretation for manuscript and dissemination

**Deliverable**: Clinical & Patient Interpretation Document (5-7 pages)

**Quality Check**:
✅ Clinical interpretation is evidence-based  
✅ PAB agrees results are patient-meaningful  
✅ Interpretation addresses both benefits and limitations  
✅ Implications for clinical practice and patient decision-making are clear

---

#### **STEP 4.3: Manuscript Preparation (2-3 months)**

**Objective**: Write and submit peer-reviewed manuscript presenting PCOR findings.

**Persona**: P16_RWE (Lead), P01_CMO (Co-author), P17_BIOSTAT (Methods/Results), P20_PATADV (Patient perspective section)

**Prerequisites**:
- Statistical Analysis Report
- Clinical & Patient Interpretation Document

**Process**:

1. **Select Target Journal** (Week 1)
   - Consider: JAMA, NEJM, Annals of Internal Medicine, Health Affairs, Medical Care, Patient (Patient-Centered Outcomes Research journal)
   - Journals with patient-centered focus preferred

2. **Draft Manuscript** (6-8 weeks)
   - Structure per journal requirements (typically IMRAD: Introduction, Methods, Results, Discussion)
   - Include patient perspective: "Patient Partner Statement" or dedicated section on patient engagement
   - Follow CONSORT-PRO extension for reporting PRO outcomes in trials

3. **Co-Author Review & Revision** (2-3 rounds, 3-4 weeks)
   - All co-authors review draft
   - PAB members offered co-authorship or acknowledged (per ICMJE criteria)

4. **Submit to Journal** (Week 10-12)

5. **Peer Review Process** (3-6 months)
   - Respond to reviewer comments
   - Revise manuscript as needed

6. **Acceptance & Publication** (Months 12-18 from submission)

**Deliverable**: Published manuscript in peer-reviewed journal

**Quality Check**:
✅ Manuscript follows CONSORT-PRO reporting standards  
✅ Patient engagement is explicitly described  
✅ Limitations are transparently discussed  
✅ Clinical and patient implications are clear  
✅ Results are reproducible (data/code sharing statement)

---

#### **STEP 4.4: Patient-Friendly Results Dissemination (1-2 months)**

**Objective**: Translate research findings into patient-friendly materials and disseminate to patient communities.

**Persona**: P20_PATADV (Lead), P16_RWE (Support)

**Prerequisites**:
- Manuscript accepted or published
- PAB input on dissemination strategy

**Process**:

1. **Develop Patient-Friendly Summary** (2 weeks)
   - Plain language (≤8th grade reading level)
   - Visual: Infographics, icons, minimal text
   - Formats: 1-page PDF, social media graphics, video
   - Content: What we asked, what we found, what it means for patients
   - Review with PAB: "Is this clear? Accurate? Useful?"

2. **Create Dissemination Plan** (1 week)
   - Channels: Patient advocacy organizations, social media, patient community websites (PatientsLikeMe, HealthUnlocked), press release
   - Engage study participants: Email results summary to all enrolled patients
   - PAB members as ambassadors: PAB shares results in their networks

3. **Execute Dissemination** (Ongoing)
   - Post patient-friendly summary on company website and patient advocacy sites
   - Social media campaign: Twitter/X, Facebook, LinkedIn
   - Webinar for patients: P01_CMO and P20_PATADV present findings, Q&A with PAB
   - Press release (if high-impact findings)

4. **Engage Media** (If appropriate)
   - Pitch story to health journalists (STAT News, MedPage Today, etc.)
   - Patient partner interviews for media stories

**Deliverable**: Patient dissemination materials (1-pager, infographic, video) + dissemination metrics (reach, engagement)

**Quality Check**:
✅ Patient-friendly summary is plain language (readability ≤8th grade)  
✅ PAB approved materials  
✅ ≥5 patient advocacy organizations share results  
✅ ≥1,000 patients reached via dissemination channels  
✅ Study participants received results (>80% delivery rate)

---

## 6. PROMPT LIBRARY

This section contains production-ready prompts for each critical step in the PCOR workflow. Each prompt follows LSIPL gold standards: clear instructions, role-based personas, structured outputs, and quality criteria.

---

### PROMPT 1.1: Define PCOR Research Question

**PROMPT ID**: UC_EG_008_P1.1  
**CLASSIFICATION**: EVIDENCE_GENERATION > PCOR > PLANNING  
**COMPLEXITY**: INTERMEDIATE  
**PERSONA**: P16_RWE (Lead), P01_CMO (Support)  
**TIME ESTIMATE**: 30 minutes  
**PATTERN**: CHAIN_OF_THOUGHT

```
You are a Patient-Centered Outcomes Research expert with deep expertise in:
- PCORI methodological standards and patient engagement principles
- Real-world evidence study design (observational studies, pragmatic RCTs)
- Patient-reported outcomes (PROs) and patient-centered outcome measures
- FDA guidance on patient experience data and PRO endpoints
- HTA requirements for patient-centered evidence (NICE, ICER, CADTH)

Your task is to define a clear, patient-centered research question for a PCOR study.

**PRODUCT & INDICATION CONTEXT**
- Product Name: {product_name}
- Product Type: {product_type} (e.g., DTx, pharmaceutical, medical device)
- Indication: {indication}
- Mechanism of Action: {moa}
- Target Population: {target_population}
- Current Standard of Care: {standard_of_care}

**STRATEGIC OBJECTIVES**
- Regulatory Goal: {regulatory_goal} (e.g., FDA approval, label expansion)
- Payer/HTA Goal: {payer_goal} (e.g., NICE positive recommendation, US payer coverage)
- Product Development Goal: {product_goal} (e.g., inform feature roadmap)
- Scientific Goal: {scientific_goal} (e.g., publish in peer-reviewed journal)

**PRELIMINARY PATIENT INPUT** (if available)
- Patient priorities identified: {patient_priorities}
- Patient advocacy organization partnerships: {patient_orgs}
- Existing patient feedback: {patient_feedback}

---

**TASK: Define PCOR Research Question**

Use the PICO(T) framework to structure the research question:

**STEP 1: Define Population (P)**
- Who are the patients?
- Specify: Age range, disease stage/severity, key demographics
- Consider: Is population broad enough to be representative of real-world patients? (PCOR emphasizes generalizability)
- Avoid: Overly narrow criteria that exclude diverse patients

**Population Description**:
- Inclusion criteria: {list}
- Exclusion criteria: {list}
- Rationale for population definition: {explain why this population is appropriate and patient-centered}

---

**STEP 2: Define Intervention (I)**
- What is the intervention being studied?
- Specify: Dose, duration, delivery method
- For DTx: App features, engagement requirements, support model
- Consider: Is intervention feasible in real-world practice?

**Intervention Description**:
- Intervention: {describe}
- Real-world feasibility: {assess practicality of delivering intervention outside controlled trial setting}

---

**STEP 3: Define Comparator (C)**
- What is the comparison?
- Options: Usual care, alternative treatment, placebo, historical control
- Consider: What comparison is most meaningful to patients and clinicians?

**Comparator Description**:
- Comparator: {describe}
- Rationale: {why this comparator is appropriate and patient-centered}

---

**STEP 4: Define Outcomes (O)**
**CRITICAL**: Outcomes MUST be patient-centered. This is the heart of PCOR.

**Patient-Centered Outcome Criteria**:
1. **Patient-Meaningful**: Does this outcome matter to patients in their daily lives?
2. **Captures Heterogeneity**: Does this outcome allow for diverse patient preferences and priorities?
3. **Functional & Quality of Life**: Does outcome include functional status, QOL, or patient experience (not just clinical endpoints)?

**Primary Outcome**:
- Outcome: {describe primary patient-centered outcome}
- Measurement: {PRO instrument or patient-centered measure}
- Rationale: {explain why this outcome is patient-meaningful and captures patient priorities}
- Patient-Centeredness Check: {assess if outcome truly reflects what matters to patients}

**Secondary Outcomes** (list 3-5):
1. {Outcome + Measurement + Rationale}
2. {Outcome + Measurement + Rationale}
3. ...

**Outcomes to AVOID** (if not patient-meaningful):
- Biomarkers without clear patient impact (e.g., "reduction in inflammatory marker" without symptom improvement)
- Clinician-only perspectives (e.g., "physician global assessment" without patient input)
- Process measures without outcome link (e.g., "medication adherence" without showing adherence improves patient outcomes)

---

**STEP 5: Define Timing (T)**
- Study duration: {duration}
- Follow-up period: {follow-up}
- Rationale: {why this timeframe is appropriate to capture patient-meaningful change}

---

**FINAL RESEARCH QUESTION**

Synthesize PICO(T) into a clear, concise research question:

"Does [Intervention] compared to [Comparator] improve [Patient-Centered Outcome] in [Population] over [Timeframe]?"

**Your Research Question**:
{Write final research question here}

---

**PATIENT-CENTEREDNESS ASSESSMENT**

Rate the patient-centeredness of this research question on each dimension (1-5 scale, 5 = highly patient-centered):

| Dimension | Rating (1-5) | Justification |
|-----------|--------------|---------------|
| **Outcomes reflect patient priorities** | {rating} | {explain} |
| **Population is representative/inclusive** | {rating} | {explain} |
| **Intervention is feasible in real-world** | {rating} | {explain} |
| **Comparator is meaningful to patients** | {rating} | {explain} |
| **Study will inform patient decisions** | {rating} | {explain} |

**Overall Patient-Centeredness Score**: {average of above scores}

**Recommendation**:
- If score ≥4.0: ✅ Proceed with this research question
- If score 3.0-3.9: ⚠️ Revise to strengthen patient-centeredness (specify which dimensions need improvement)
- If score <3.0: ❌ Substantially revise or reconsider approach

---

**NEXT STEPS**

1. **Patient Advisory Board Review**: Present research question to PAB for feedback
2. **Literature Review**: Search for similar PCOR studies and learn from precedents
3. **Data Source Feasibility**: Assess if available data sources (claims, EHR, patient registries) can answer this question
4. **Regulatory/Payer Alignment Check**: Confirm this evidence will meet regulatory or payer needs

**Anticipated Challenges**:
- {List potential challenges in answering this research question}

**Mitigation Strategies**:
- {Propose solutions to anticipated challenges}

---

**OUTPUT REQUIREMENTS**:
✅ PICO(T) framework complete  
✅ Primary outcome is patient-centered (score ≥4/5)  
✅ Final research question is clear and concise  
✅ Patient-centeredness assessment complete  
✅ Next steps identified
```

---

### PROMPT 1.4.1: PCOR Study Protocol Structure

**PROMPT ID**: UC_EG_008_P1.4.1  
**CLASSIFICATION**: EVIDENCE_GENERATION > PCOR > PROTOCOL  
**COMPLEXITY**: ADVANCED  
**PERSONA**: P16_RWE (Lead), P01_CMO, P17_BIOSTAT (Support)  
**TIME ESTIMATE**: 4-6 weeks (iterative process)  
**PATTERN**: STRUCTURED_TEMPLATE

```
You are a Patient-Centered Outcomes Research protocol writer with expertise in:
- PCORI Methodology Standards (especially patient engagement and pragmatic trials)
- Real-world evidence study designs (cohort studies, pragmatic RCTs)
- Patient-reported outcomes and PRO endpoint guidance (FDA, EMA)
- Observational study reporting standards (STROBE, RECORD)
- Patient engagement in research (PCORI Engagement Rubric)

Your task is to structure a comprehensive PCOR study protocol.

---

**PCOR PROTOCOL TEMPLATE**

Use this template to draft the protocol. Each section includes guidance on patient-centeredness.

---

## 1. PROTOCOL SYNOPSIS (1-2 pages)

**Purpose**: High-level summary for stakeholders, including patients.

**Content**:
- Study title (plain language, patient-friendly)
- Research question (PICO format)
- Study design (observational, pragmatic RCT, mixed methods)
- Patient population (N, key demographics)
- Primary patient-centered outcome
- Study duration and follow-up
- Patient engagement approach (how patients are involved beyond data collection)

**Patient-Centeredness Check**:
✅ Synopsis is understandable to patients (≤8th grade reading level)  
✅ Patient engagement is explicitly mentioned

---

## 2. BACKGROUND & RATIONALE (3-5 pages)

**2.1 Clinical Problem**
- Burden of disease from patient perspective (symptoms, functional impact, QOL)
- Unmet needs: What are patients missing from current treatments?
- Patient priorities: What outcomes matter most to patients? (cite patient surveys, focus groups, advocacy org statements)

**2.2 Current Standard of Care**
- Current treatments available
- Limitations from patient perspective (e.g., side effects, burden, cost, lack of efficacy)
- Patient experience with current care (cite qualitative studies, patient testimonials)

**2.3 Study Intervention**
- Description of product/intervention
- Mechanism of action (in patient-friendly terms)
- Why this intervention may address unmet patient needs
- Preliminary evidence (if available): Prior RCTs, RWE studies, pilot data

**2.4 Rationale for PCOR Approach**
- Why patient-centered outcomes research is needed (vs. traditional RCT or observational study)
- How this study will inform patient and clinician decision-making
- Alignment with PCORI priorities (if applicable)

**Patient-Centeredness Check**:
✅ Patient voice is present (quotes, testimonials, cited patient surveys)  
✅ Rationale explicitly addresses patient needs and priorities

---

## 3. STUDY OBJECTIVES

**3.1 Primary Objective**
- Clear statement of primary objective focused on patient-centered outcome
- Example: "To evaluate whether [Intervention] improves [Patient-Centered Outcome] compared to [Comparator] in [Population]"

**3.2 Secondary Objectives** (list 3-5)
- Each objective should be specific and measurable
- Include patient-centered outcomes, functional outcomes, QOL, healthcare utilization, costs

**3.3 Exploratory Objectives** (optional)
- Subgroup analyses (e.g., by age, disease severity, race/ethnicity)
- Heterogeneity of treatment effects (precision medicine question: "What works for whom?")
- Mediators or moderators of treatment effect

**Patient-Centeredness Check**:
✅ Primary objective focuses on patient-meaningful outcome  
✅ Objectives address patient priorities identified in Phase 1

---

## 4. STUDY DESIGN

**4.1 Overall Design**
- Study type: {Observational cohort, pragmatic RCT, mixed methods, etc.}
- Setting: {Real-world clinical practice, community health centers, virtual/digital, etc.}
- Data sources: {Claims data, EHR, patient registry, patient-generated data (apps, wearables), patient surveys}

**4.2 Pragmatic vs. Explanatory Design**
- PCOR studies typically use pragmatic designs (broad eligibility, real-world setting, flexible protocols)
- Use PRECIS-2 tool to assess pragmatism across 9 domains: https://www.precis-2.org/

**PRECIS-2 Assessment** (rate each domain 1-5, where 5 = very pragmatic):
1. Eligibility criteria: {rating + explanation}
2. Recruitment: {rating + explanation}
3. Setting: {rating + explanation}
4. Organisation: {rating + explanation}
5. Flexibility (delivery): {rating + explanation}
6. Flexibility (adherence): {rating + explanation}
7. Follow-up: {rating + explanation}
8. Primary outcome: {rating + explanation}
9. Primary analysis: {rating + explanation}

**Overall Pragmatism Score**: {average}  
**Target**: ≥4.0 for PCOR studies

**4.3 Study Duration**
- Enrollment period: {duration}
- Follow-up per patient: {duration}
- Total study duration: {duration}
- Rationale: {why this duration is appropriate to capture patient-meaningful change}

**Patient-Centeredness Check**:
✅ Study design is pragmatic (PRECIS-2 score ≥4.0)  
✅ Study is feasible in real-world settings where patients receive care

---

## 5. STUDY POPULATION

**5.1 Target Population**
- Description: {age range, disease stage, key demographics}
- Rationale: {why this population represents patients who would benefit from intervention}

**5.2 Inclusion Criteria**
- {List inclusion criteria}
- Patient-Centeredness Principle: Use broad, inclusive criteria to represent real-world patients

**5.3 Exclusion Criteria**
- {List exclusion criteria}
- Patient-Centeredness Principle: Minimize exclusions; only exclude if safety concern or intervention clearly not appropriate

**5.4 Diversity & Inclusion Plan**
- Target enrollment by race/ethnicity: {specify targets to ensure diverse cohort}
- Target enrollment by age: {ensure representation across age spectrum}
- Target enrollment by socioeconomic status: {include patients from underserved communities}
- Strategies to reach diverse populations: {community health centers, patient advocacy orgs serving diverse communities, multilingual recruitment materials}

**5.5 Sample Size**
- Target N: {total sample size}
- Rationale: {power calculation based on primary outcome, expected effect size, statistical power ≥80%}
- Attrition assumptions: {expected dropout rate and plan to minimize}

**Patient-Centeredness Check**:
✅ Eligibility criteria are broad and inclusive  
✅ Diversity targets are explicit and ambitious  
✅ Recruitment plan includes strategies to reach underserved populations

---

## 6. PATIENT ENGAGEMENT PLAN

**CRITICAL SECTION**: Patient engagement is not optional in PCOR. This section describes how patients are partners in research, not just participants.

**6.1 Patient Advisory Board (PAB)**
- PAB composition: {N members, diversity targets}
- PAB roles: {review study design, provide outcome priorities, review materials, interpret results, co-author manuscript}
- PAB meeting schedule: {frequency, duration}
- PAB compensation: {$ per meeting, travel reimbursement}

**6.2 Patient Engagement Activities Throughout Study**
- **Study Design Phase**: PAB reviews and provides input on protocol, outcome selection, recruitment materials
- **Recruitment Phase**: PAB members refer patients, review recruitment messaging
- **Data Collection Phase**: PAB reviews patient-facing materials (surveys, consent forms) for clarity and burden
- **Analysis Phase**: PAB reviews preliminary findings, provides interpretation from patient perspective
- **Dissemination Phase**: PAB co-authors manuscript or patient-friendly summary, shares results in patient communities

**6.3 PCORI Engagement Rubric Assessment** (if pursuing PCORI funding)
- Use PCORI Engagement Rubric to self-assess patient engagement quality
- Dimensions: Reciprocal relationships, co-learning, partnerships, transparency, honesty, trust
- Target: "Meaningful engagement" or "Partnership" level on all dimensions

**Patient-Centeredness Check**:
✅ PAB is established and active throughout study lifecycle  
✅ Patient engagement is reciprocal and ongoing (not just one-time consultation)  
✅ Patients have decision-making authority on key study design elements

---

## 7. OUTCOMES & ENDPOINTS

**7.1 Primary Outcome**
- Outcome: {describe patient-centered outcome}
- PRO Instrument: {name of validated PRO, e.g., PROMIS Global Health, SF-36, disease-specific PRO}
- Measurement timepoints: {baseline, follow-up schedule}
- Primary endpoint: {e.g., "Change from baseline to 12 months in [PRO score]"}
- Minimally Clinically Important Difference (MCID): {MCID value for PRO, cite source}
- Rationale for PRO selection: {explain why this PRO captures patient priorities}

**7.2 Secondary Outcomes** (list 3-5)
For each secondary outcome, specify:
- Outcome description
- Measurement instrument
- Timepoints
- MCID (if applicable)
- Rationale for patient-centeredness

**Example Secondary Outcomes**:
1. **Functional status**: e.g., Work Productivity and Activity Impairment (WPAI) scale
2. **Quality of life**: e.g., EQ-5D-5L (health utility for QALY calculation)
3. **Healthcare utilization**: e.g., hospitalizations, ED visits, outpatient visits
4. **Costs**: e.g., total healthcare costs, out-of-pocket costs
5. **Patient experience**: e.g., Patient satisfaction, perceived treatment benefit

**7.3 Safety Outcomes**
- Adverse events (AEs): How will AEs be captured? (patient self-report, EHR data, claims data)
- Serious adverse events (SAEs): Definition and reporting plan
- Patient burden: Track patient-reported burden of study participation

**7.4 PRO Instrument Details**
For each PRO instrument used:
- **Instrument name**: {name}
- **Validation status**: {cite psychometric studies demonstrating validity, reliability, responsiveness}
- **FDA PRO guidance compliance**: {if applicable, explain how PRO meets FDA PRO guidance standards}
- **Cognitive debriefing**: {describe cognitive debriefing conducted with patients to ensure PRO is understandable and relevant}
- **Administration**: {self-administered via app/web? Interviewer-administered? Paper?}
- **Scoring**: {scoring algorithm, range of scores, interpretation}

**Patient-Centeredness Check**:
✅ Primary outcome is a PRO that captures patient priorities  
✅ All PRO instruments are validated and patient-tested (cognitive debriefing)  
✅ Patient burden of assessments is acceptable (<20 minutes total per timepoint)

---

## 8. DATA SOURCES & DATA COLLECTION

**8.1 Data Sources**
- {Claims data, EHR, patient registry, DTx platform data, patient surveys, etc.}
- Data source justification: {explain why these sources are appropriate and comprehensive}

**8.2 Data Collection Schedule**
- Baseline assessment: {specify all data collected at baseline}
- Follow-up assessments: {specify frequency and data collected at each timepoint}
- Final assessment: {end-of-study data collection}

**8.3 Data Quality & Completeness**
- Missing data prevention strategies: {reminders, incentives, flexible scheduling}
- Data quality checks: {real-time validation, monitoring reports}
- Target completion rates: {≥80% for primary outcome at all timepoints}

**8.4 Data Privacy & Security**
- HIPAA compliance: {describe de-identification, data encryption, access controls}
- IRB oversight: {IRB approval, informed consent process}
- Data sharing: {will de-identified data be shared publicly? If yes, where and when?}

**Patient-Centeredness Check**:
✅ Data collection burden is minimized (≤20 min per assessment)  
✅ Patient privacy is protected (HIPAA compliant)  
✅ Patients are informed about how their data will be used (transparent consent process)

---

## 9. STATISTICAL ANALYSIS PLAN (SAP)

**9.1 Analysis Populations**
- **Intention-to-Treat (ITT)**: All enrolled patients, analyzed as randomized (if RCT)
- **Per-Protocol (PP)**: Patients who completed study per protocol
- **Safety Population**: All patients who received at least one dose/exposure

**9.2 Primary Outcome Analysis**
- Statistical method: {e.g., ANCOVA adjusting for baseline PRO score, mixed model for longitudinal PRO data}
- Covariates: {age, sex, baseline disease severity, comorbidities}
- Effect size: {mean difference, odds ratio, hazard ratio}
- 95% Confidence interval
- P-value (two-sided α = 0.05)
- Clinical significance: {compare effect size to MCID}

**9.3 Secondary Outcome Analysis**
- Statistical methods for each secondary outcome
- Multiple comparison adjustment: {Bonferroni, Hochberg, or no adjustment if secondary outcomes are exploratory}

**9.4 Subgroup Analysis**
- Pre-specified subgroups: {age (<65 vs ≥65), sex, race/ethnicity, disease severity}
- Interaction tests to assess heterogeneity of treatment effects
- **Patient-Centered Question**: "Does treatment work better for some patients than others?"

**9.5 Missing Data**
- Primary approach: {multiple imputation, mixed models with all available data}
- Sensitivity analysis: {complete case analysis, worst-case scenario}

**9.6 Software**
- Statistical software: {SAS, R, Stata, Python}
- Version control: {Git, GitHub for reproducibility}

**Patient-Centeredness Check**:
✅ Subgroup analyses explore heterogeneity (answer "what works for whom?")  
✅ Clinical significance is assessed (not just statistical significance)  
✅ Analysis plan is transparent and pre-specified (SAP finalized before data analysis)

---

## 10. ETHICAL CONSIDERATIONS & IRB

**10.1 IRB Approval**
- IRB: {name of reviewing IRB}
- Approval date: {date}
- Protocol version: {version number}

**10.2 Informed Consent**
- Consent process: {written? Electronic? Verbal?}
- Plain language: {consent form written at ≤8th grade reading level}
- Key elements: {risks, benefits, voluntary participation, right to withdraw, data privacy}

**10.3 Patient Risks & Benefits**
- Risks: {potential harms from intervention, privacy risks, burden of participation}
- Benefits: {potential benefits to patient, contribution to knowledge}
- Risk-benefit assessment: {justify that benefits outweigh risks}

**10.4 Patient Compensation**
- Compensation plan: {$ per completed assessment, total possible compensation}
- Rationale: {compensation is fair but not coercive}

**Patient-Centeredness Check**:
✅ Informed consent is truly informed (plain language, patient-friendly)  
✅ Patient burden is minimized and compensated  
✅ Patient safety is paramount

---

## 11. STUDY TIMELINE & MILESTONES

| Phase | Milestone | Duration | Timeline |
|-------|-----------|----------|----------|
| **Planning** | Protocol finalized, IRB submitted | 3 months | Months 0-3 |
| **Recruitment** | IRB approved, enrollment starts | 1 month | Month 4 |
| | 50% enrolled | 2-3 months | Month 6-7 |
| | 100% enrolled | 3-6 months | Month 7-10 |
| **Follow-Up** | All patients complete baseline + follow-up | 12-18 months | Months 10-28 |
| **Analysis** | Data cleaning, analysis, interpretation | 3-4 months | Months 28-32 |
| **Dissemination** | Manuscript submitted, patient dissemination | 2-3 months | Months 32-35 |
| **TOTAL** | | **35 months (~3 years)** | |

---

## 12. DISSEMINATION PLAN

**CRITICAL**: PCOR requires dissemination to patients, not just academic audiences.

**12.1 Scientific Dissemination**
- **Manuscript**: Submit to peer-reviewed journal (target: JAMA, NEJM, Annals, Health Affairs, Patient journal)
- **Conference presentations**: Present at medical conferences (ACP, AHA, etc.) and PCOR-specific conferences (PCORI Annual Meeting, AcademyHealth)
- **Data sharing**: Deposit de-identified data in public repository (e.g., PCORI Data Repository, ICPSR)

**12.2 Patient Dissemination** (REQUIRED for PCOR)
- **Patient-friendly summary**: 1-2 page plain language summary of findings (≤8th grade reading level)
- **Infographic**: Visual summary for social media
- **Video**: 2-3 minute video explaining findings (featuring patient partner)
- **Webinar**: Live webinar for patients, hosted by patient advocacy organization
- **Social media**: Campaign on Twitter/X, Facebook, LinkedIn
- **Patient advocacy organizations**: Share results via established patient community channels
- **Study participants**: Email results summary to all enrolled patients

**12.3 Payer/Policy Dissemination**
- **Value dossier**: Integrate PCOR findings into value dossier for payers
- **HTA submissions**: Cite PCOR evidence in NICE, ICER, CADTH submissions
- **Payer presentations**: Present findings to P&T committees, medical directors

**12.4 Dissemination Timeline**
- Manuscript submission: {Month 32}
- Patient dissemination: {Month 33-34, immediately after manuscript acceptance}
- Payer/policy dissemination: {Month 35, after publication}

**Patient-Centeredness Check**:
✅ Patient dissemination plan is robust (≥3 channels)  
✅ Study participants receive results  
✅ Patient advocacy organizations are engaged in dissemination

---

## 13. BUDGET & RESOURCES

**Estimated Study Budget**:
- Patient recruitment & compensation: ${estimate}
- PRO licensing fees: ${estimate}
- Data collection & management: ${estimate}
- Statistical analysis: ${estimate}
- Patient engagement (PAB meetings, cognitive debriefing): ${estimate}
- Dissemination (publication fees, patient materials): ${estimate}
- **TOTAL**: ${total}

**Funding Source**: {PCORI grant, company-funded, foundation grant, etc.}

---

## 14. REFERENCES

- List all references cited in protocol (guidelines, prior studies, PRO validation papers, etc.)

---

**PROTOCOL APPROVAL SIGNATURES**

- Principal Investigator: {Name, Date}
- Biostatistician: {Name, Date}
- Patient Advisory Board Chair: {Name, Date}
- IRB Chair: {Name, Date}

---

**APPENDICES**

- Appendix A: PRO Instruments (full text or sample items)
- Appendix B: Patient Informed Consent Form
- Appendix C: Patient Recruitment Materials
- Appendix D: PCORI Engagement Rubric Self-Assessment
- Appendix E: Statistical Analysis Plan (detailed)

---

**END OF PROTOCOL TEMPLATE**

---

**NEXT STEPS AFTER PROTOCOL COMPLETION**

1. **PAB Review**: Present protocol to PAB for final approval
2. **IRB Submission**: Submit to IRB with all required documents
3. **Protocol Registration**: Register protocol on ClinicalTrials.gov (if RCT) or PROSPERO (if observational)
4. **Launch Study**: Once IRB approved, begin recruitment

---

**OUTPUT REQUIREMENTS**:
✅ Protocol is comprehensive (all sections complete)  
✅ Protocol is patient-centered (patient engagement explicit, PROs are primary outcomes)  
✅ Protocol is pragmatic (PRECIS-2 score ≥4.0)  
✅ Protocol is IRB-ready (includes all required elements)  
✅ Dissemination plan includes robust patient dissemination
```

---

### PROMPT 2.1.1: PRO Instrument Selection for PCOR

**PROMPT ID**: UC_EG_008_P2.1.1  
**CLASSIFICATION**: EVIDENCE_GENERATION > PCOR > PRO_SELECTION  
**COMPLEXITY**: ADVANCED  
**PERSONA**: P16_RWE (Lead), P01_CMO, P20_PATADV (Support)  
**TIME ESTIMATE**: 2-3 weeks  
**PATTERN**: DECISION_MATRIX

```
You are a Patient-Reported Outcomes (PRO) expert specializing in:
- FDA PRO Guidance for Industry (2009) and patient-focused drug development
- PRO instrument validation frameworks (content validity, construct validity, reliability, responsiveness)
- PCORI standards for patient-centered outcome measurement
- Digital PRO administration and ePRO platforms
- Health literacy and plain language principles for PROs

Your task is to select validated PRO instruments for a PCOR study that capture patient priorities.

---

**CONTEXT: Patient Priorities & Study Design**

**Patient Priorities** (from Phase 1 patient surveys, focus groups, PAB input):
1. {Patient priority #1, e.g., "Reduce anxiety attacks"}
2. {Patient priority #2, e.g., "Improve ability to work"}
3. {Patient priority #3, e.g., "Reduce medication side effects"}
4. {Patient priority #4, e.g., "Improve sleep quality"}
5. {Patient priority #5, e.g., "Feel more in control of health"}

**Study Population**:
- Indication: {indication}
- Age range: {age range}
- Disease severity: {mild, moderate, severe}
- Key demographics: {race/ethnicity distribution, SES, health literacy}

**Study Design**:
- Duration: {study duration}
- Follow-up frequency: {assessment schedule}
- Administration mode: {digital/app, web, paper, phone}

**Constraints**:
- Total assessment burden target: ≤20 minutes per timepoint
- Budget for PRO licensing: ${budget}
- Regulatory requirement: {FDA submission planned? HTA submission?}

---

**TASK: Select PRO Instruments**

**STEP 1: Map Patient Priorities to PRO Constructs**

For each patient priority, identify the underlying construct that PROs measure:

| Patient Priority | PRO Construct | Example Instruments |
|------------------|---------------|---------------------|
| {Priority #1} | {e.g., Anxiety symptoms} | {GAD-7, PROMIS Anxiety Short Form} |
| {Priority #2} | {e.g., Work productivity} | {WPAI, Work Limitations Questionnaire} |
| {Priority #3} | {e.g., Medication tolerability} | {Treatment Satisfaction Questionnaire} |
| {Priority #4} | {e.g., Sleep quality} | {PROMIS Sleep Disturbance, ISI} |
| {Priority #5} | {e.g., Self-efficacy} | {PROMIS Self-Efficacy Short Form} |

---

**STEP 2: Search for Validated PRO Instruments**

For each construct, search for validated instruments:

**Search Strategy**:
- **PRO Databases**: 
  - PROMIS (Patient-Reported Outcomes Measurement Information System): https://www.healthmeasures.net/explore-measurement-systems/promis
  - ePROVIDE (FDA PRO database): https://eprovide.mapi-trust.org/
  - Mapi Research Trust PRO Library
- **Literature**: PubMed search for "[construct] patient-reported outcome validation"
- **FDA CDER PRO Qualification Process**: Check if any PROs are FDA-qualified for this indication

**For Each Construct, List Candidate PRO Instruments** (3-5 per construct):

**Construct: {e.g., Anxiety symptoms}**

| PRO Instrument | Developer | # Items | Admin Time | Validation Status | FDA Use | License Cost |
|----------------|-----------|---------|------------|-------------------|---------|--------------|
| {e.g., GAD-7} | Spitzer et al. | 7 | 2 min | ✅ Validated in multiple populations | ✅ Used in FDA trials | Free (public domain) |
| {e.g., PROMIS Anxiety SF 4a} | PROMIS | 4 | 1 min | ✅ CAT-enabled, IRT-based | ✅ FDA-accepted | Free (NIH-funded) |
| {e.g., HADS-Anxiety} | Zigmond & Snaith | 7 | 2 min | ✅ Validated, older | ❓ Less common in FDA trials | $$ |

---

**STEP 3: Evaluate PRO Instruments Using Decision Criteria**

For each candidate PRO, evaluate using these criteria:

**Evaluation Criteria**:

1. **Patient Relevance** (Weight: 30%)
   - Does PRO capture patient priority?
   - Cognitive debriefing evidence: Do patients find questions relevant and understandable?
   - Score: 1-5 (5 = highly relevant to patients)

2. **Psychometric Properties** (Weight: 25%)
   - Content validity: Does PRO measure intended construct?
   - Construct validity: Correlates with similar measures?
   - Reliability: Internal consistency (Cronbach's α), test-retest
   - Responsiveness: Sensitive to change over time?
   - Minimally Clinically Important Difference (MCID): Established?
   - Score: 1-5 (5 = excellent psychometrics)

3. **Regulatory Acceptability** (Weight: 20%)
   - Has PRO been used in FDA/EMA submissions for this indication?
   - Is PRO FDA-qualified or meets FDA PRO guidance?
   - Evidence of regulatory acceptance
   - Score: 1-5 (5 = strong regulatory precedent)

4. **Feasibility** (Weight: 15%)
   - Number of items (shorter is better)
   - Administration time (target: ≤5 min per PRO)
   - Digital administration: Is ePRO version available and validated?
   - Score: 1-5 (5 = highly feasible)

5. **Cost** (Weight: 10%)
   - Licensing fees: Free (public domain) vs. paid license
   - Budget constraint: ${budget}
   - Score: 1-5 (5 = free or low cost)

**Decision Matrix for {Construct: e.g., Anxiety}**:

| PRO Instrument | Patient Relevance (30%) | Psychometrics (25%) | Regulatory (20%) | Feasibility (15%) | Cost (10%) | **Weighted Score** |
|----------------|-------------------------|---------------------|------------------|-------------------|-----------|--------------------|
| {GAD-7} | 5 | 4 | 5 | 5 | 5 | **4.8** |
| {PROMIS Anxiety SF 4a} | 5 | 5 | 4 | 5 | 5 | **4.8** |
| {HADS-Anxiety} | 4 | 4 | 3 | 4 | 3 | **3.7** |

**Recommendation for {Construct}**: {Select PRO with highest weighted score, e.g., "GAD-7 or PROMIS Anxiety SF 4a (both score 4.8; choose based on additional considerations below)"}

---

**STEP 4: Additional Considerations for Final Selection**

**1. Patient Advisory Board (PAB) Input**
- Present top 2-3 candidate PROs to PAB
- Show PAB sample items from each PRO
- Ask: "Which questions feel most relevant to you? Which are clearest?"
- PAB preference: {record PAB feedback}

**2. Assessment Burden**
- Total items across all selected PROs: {count}
- Estimated total administration time: {time}
- Target: ≤20 minutes
- If burden is too high: Use short forms, eliminate lower-priority outcomes, or use adaptive testing (CAT)

**3. Harmonization Across Studies**
- Are there prior or ongoing studies using specific PROs that would benefit from harmonization?
- Using same PROs enables meta-analysis and comparison across studies

**4. Digital Administration Feasibility**
- Is validated ePRO version available?
- Does ePRO preserve psychometric properties of paper version?
- Is platform compatible with planned data collection system (REDCap, Medidata Rave, etc.)?

---

**STEP 5: Final PRO Instrument Selection**

**Primary Outcome PRO**:
- **Selected PRO**: {name}
- **Construct Measured**: {construct}
- **# Items**: {number}
- **Administration Time**: {time}
- **Scoring Range**: {range}
- **MCID**: {value}
- **Rationale**: {Explain why this PRO is best choice for primary outcome. Emphasize patient-centeredness, validation, regulatory acceptability.}

**Secondary Outcome PROs** (rank by priority):

1. **PRO**: {name}
   - **Construct**: {construct}
   - **Rationale**: {brief justification}

2. **PRO**: {name}
   - **Construct**: {construct}
   - **Rationale**: {brief justification}

3. **PRO**: {name}
   - **Construct**: {construct}
   - **Rationale**: {brief justification}

*(Continue for all secondary PROs)*

**Total Assessment Burden**:
- Total items: {count}
- Estimated time: {time}
- Assessment: ✅ Acceptable (<20 min) OR ❌ Too burdensome (>20 min) → Revise

---

**STEP 6: PRO Administration & Data Quality Plan**

**Administration Mode**: {Digital app, web survey, paper, phone interview}

**Assessment Schedule**:
- Baseline: {all PROs}
- Follow-up timepoints: {specify which PROs at which timepoints}
- Final assessment: {all PROs}

**Data Quality Strategies**:
- Real-time validation: {e.g., range checks, skip pattern enforcement}
- Reminders: {automated reminders for overdue assessments}
- Missing data prevention: {incentives, flexible scheduling}
- Monitoring: {weekly data quality reports}

**Target PRO Completion Rates**:
- Primary outcome: ≥90% at all timepoints
- Secondary outcomes: ≥80% at all timepoints

---

**STEP 7: Regulatory & HTA Alignment**

**FDA PRO Guidance Compliance** (if regulatory submission planned):
- **Content Validity**: ✅ PROs selected based on patient input (surveys, focus groups, cognitive debriefing)
- **Construct Validity**: ✅ PROs have published evidence of validity
- **Reliability**: ✅ PROs have Cronbach's α ≥0.70
- **Responsiveness**: ✅ PROs have documented MCID
- **Interpretation**: ✅ PROs have established scoring and interpretation guidelines

**HTA Requirements** (e.g., NICE, ICER):
- **Quality of Life**: ✅ EQ-5D-5L included for QALY calculation
- **Patient-Relevant Outcomes**: ✅ Functional outcomes and symptoms included
- **Economic Evaluation**: ✅ Healthcare utilization and costs captured

---

**STEP 8: Next Steps - Cognitive Debriefing**

**CRITICAL**: Before finalizing PRO selection, conduct cognitive debriefing with patients.

**Cognitive Debriefing Plan**:
- Recruit 10-15 patients representative of study population
- One-on-one interviews (60 minutes each)
- Patients complete selected PROs, then "think aloud" about each item
- Probe: "What does this question mean to you?" "Is this relevant?" "Is wording clear?"
- Analyze: Identify comprehension issues, irrelevant items, missing concepts
- Revise: Modify PROs if needed (with developer permission), or select alternative PROs

**Timeline**: 3-4 weeks for cognitive debriefing (see UC_EG_008 Step 2.2)

---

**OUTPUT REQUIREMENTS**:
✅ Primary outcome PRO selected with strong rationale  
✅ Secondary outcome PROs selected (3-5 PROs)  
✅ Total assessment burden ≤20 minutes  
✅ PRO instruments are validated and patient-tested  
✅ PRO selection aligns with regulatory and HTA requirements  
✅ Cognitive debriefing plan ready to execute

---

**DELIVERABLE**: PRO Instrument Selection Rationale Document (5-7 pages)

Include:
- Patient priorities mapping to PRO constructs
- Decision matrix for each construct
- Final PRO selections with full rationale
- PRO administration and data quality plan
- Cognitive debriefing plan
- Appendix: Sample items from each selected PRO (for PAB review)
```

---

### PROMPT 4.2.1: Clinical & Patient Interpretation of PCOR Results

**PROMPT ID**: UC_EG_008_P4.2.1  
**CLASSIFICATION**: EVIDENCE_GENERATION > PCOR > INTERPRETATION  
**COMPLEXITY**: INTERMEDIATE  
**PERSONA**: P01_CMO (Clinical), P20_PATADV (Patient)  
**TIME ESTIMATE**: 2-3 weeks  
**PATTERN**: DUAL_PERSPECTIVE

```
You are facilitating a collaborative interpretation of PCOR study results from both clinical and patient perspectives.

**CONTEXT: PCOR Study Results**

**Study Overview**:
- Research Question: {restate PICO research question}
- Study Population: {N, key demographics}
- Intervention: {describe}
- Comparator: {describe}
- Follow-up duration: {duration}

**Primary Outcome Results**:
- Primary PRO: {name of PRO}
- Intervention group change: {mean change from baseline ± SD}
- Comparator group change: {mean change from baseline ± SD}
- Between-group difference: {difference (95% CI), p-value}
- MCID: {MCID value}
- **Clinical significance**: {Is between-group difference ≥ MCID? Yes/No}

**Secondary Outcome Results** (summarize key findings):
1. {Secondary outcome #1: result}
2. {Secondary outcome #2: result}
3. ...

**Subgroup Analysis Results** (if applicable):
- {Subgroup findings, e.g., "Treatment effect larger in younger patients (age <50)"}

**Safety Results**:
- Adverse events: {summary}
- Serious adverse events: {summary}
- Discontinuations: {rate and reasons}

---

**TASK: Dual Interpretation - Clinical & Patient Perspectives**

---

## PART A: CLINICAL INTERPRETATION (P01_CMO)

**You are the Chief Medical Officer interpreting these results from a clinical perspective.**

**1. Clinical Meaningfulness Assessment**

- **Is the effect clinically meaningful?**
  - Statistical significance: {Yes/No, p-value}
  - Clinical significance: {Compare effect size to MCID}
  - Magnitude of effect: {Small, moderate, large? Use Cohen's d or similar effect size metric}
  - **Interpretation**: {Is this a clinically important improvement that would change practice?}

**2. Comparison to Existing Evidence**

- **How do these results compare to prior studies?**
  - Prior RCTs in this indication: {summarize prior evidence}
  - Prior RWE studies: {summarize}
  - **Consistency**: Are current findings consistent with prior evidence? {Yes/No, explain}
  - **New insights**: What do these PCOR results add to the evidence base?

**3. Implications for Clinical Practice**

- **Who should use this intervention?**
  - Patient characteristics: {age, disease severity, comorbidities}
  - Clinical scenarios where intervention is appropriate: {describe}
  - Patients who should NOT use intervention: {contraindications, lack of benefit}

- **How does this change clinical decision-making?**
  - Should this intervention replace current standard of care? {Yes/No, explain}
  - Should this be first-line, second-line, or adjunctive therapy?
  - What clinical guidelines should be updated?

**4. Clinical Limitations & Cautions**

- **Study limitations from clinical perspective**:
  - Sample size: {adequate? Limited statistical power for subgroups?}
  - Follow-up duration: {sufficient to assess long-term outcomes?}
  - Generalizability: {Does study population reflect real-world clinical practice?}
  - Unmeasured confounding: {observational study limitation}

- **Cautions for clinicians**:
  - What should clinicians be cautious about when using this intervention?
  - What patient monitoring is recommended?
  - What are the red flags for discontinuation?

**5. Clinical Bottom Line**

**In 2-3 sentences, what should clinicians take away from this study?**

{Write clinical bottom line here. Example: "This PCOR study demonstrates that [Intervention] produces clinically meaningful improvement in [Patient Outcome] compared to [Comparator] in patients with [Indication]. The effect size exceeds the MCID, and safety profile is acceptable. Clinicians should consider [Intervention] as a [first-line/adjunctive] treatment option for [Patient Population], with attention to [Key Consideration]."}

---

## PART B: PATIENT INTERPRETATION (P20_PATADV)

**You are the Patient Advocacy Lead interpreting these results from a patient perspective. You will facilitate a Patient Advisory Board (PAB) meeting to gather patient interpretation.**

**PAB Meeting Agenda: Results Interpretation**

**1. Present Results in Patient-Friendly Language**

**Translate Clinical Results into Patient Language**:

**Instead of**: "Intervention group showed 8.2-point reduction in PHQ-9 vs. 5.1 points in comparator group (p=0.003)"

**Patient-Friendly**: "People using [Intervention] had greater improvement in depression symptoms compared to people using [Comparator]. On a scale where lower scores mean less depression, [Intervention] users' scores dropped by about 8 points, while [Comparator] users' scores dropped by about 5 points. This 3-point difference is meaningful—it's like the difference between 'feeling down most days' and 'feeling down occasionally.'"

**Your Patient-Friendly Results Summary**:
- **What we asked**: {plain language research question}
- **Who participated**: {plain language description of patients, e.g., "500 adults with moderate depression"}
- **What we found**: {plain language results for primary outcome}
- **What it means**: {explain clinical significance in everyday terms}

**2. Gather PAB Input: "Are These Results Meaningful to Patients?"**

**Questions for PAB**:

a. **Outcome Importance**: "The study showed improvement in [outcome]. Is this outcome important to you? Would this change in [outcome] make a real difference in your daily life?"

**PAB Feedback**: {Record PAB responses}

b. **Effect Size Perception**: "The improvement was [X points/percent]. Does this feel like a big difference, a small difference, or somewhere in between?"

**PAB Feedback**: {Record PAB responses}

c. **Trade-Offs**: "The intervention had [describe side effects or burden]. Given the benefits and downsides, would you use this intervention? Why or why not?"

**PAB Feedback**: {Record PAB responses}

d. **Decision-Making**: "If you were deciding whether to use this intervention, what additional information would you want to know?"

**PAB Feedback**: {Record PAB responses}

**3. Patient-Centered Interpretation Themes**

Based on PAB input, identify themes:

**Theme 1**: {e.g., "Patients value functional improvement more than symptom scores"}  
**Evidence**: {PAB quotes or consensus}

**Theme 2**: {e.g., "Side effects are acceptable if benefits are substantial"}  
**Evidence**: {PAB quotes or consensus}

**Theme 3**: {e.g., "Patients want more information about long-term outcomes"}  
**Evidence**: {PAB quotes or consensus}

**4. Patient Priorities vs. Study Findings**

**Alignment Check**: Do study findings address patient priorities identified in Phase 1?

| Patient Priority (Phase 1) | Addressed in Study? | Finding |
|----------------------------|---------------------|---------|
| {Priority #1} | ✅ Yes / ❌ No | {Result} |
| {Priority #2} | ✅ Yes / ❌ No | {Result} |
| {Priority #3} | ✅ Yes / ❌ No | {Result} |

**Gaps**: What patient priorities were NOT addressed? {Identify gaps for future research}

**5. Patient Bottom Line**

**In 2-3 sentences, what should patients take away from this study?**

{Write patient bottom line here, in plain language. Example: "This study found that using [Intervention] can help reduce [symptom/problem] more than [Comparator]. Most people in the study found the improvement meaningful—it helped them [do X activity] better. Side effects were mild for most people, but you should talk to your doctor about whether this is right for you."}

---

## PART C: INTEGRATED CLINICAL & PATIENT INTERPRETATION

**Now synthesize both perspectives into a unified interpretation.**

**1. Areas of Agreement (Clinical & Patient Perspectives Align)**

{Identify where clinical and patient interpretations agree}

**Examples**:
- Both clinicians and patients agree the effect is meaningful
- Both agree the intervention is appropriate for [specific patient group]
- Both agree safety profile is acceptable

**2. Areas of Divergence (Clinical & Patient Perspectives Differ)**

{Identify where clinical and patient interpretations diverge}

**Examples**:
- Clinicians focus on symptom reduction; patients prioritize functional improvement
- Clinicians concerned about long-term safety; patients more concerned about immediate burden
- Clinicians view effect as moderate; patients view as substantial (or vice versa)

**How to reconcile**: {Explain how both perspectives are valid and inform decision-making}

**3. Shared Decision-Making Implications**

**For Clinician-Patient Conversations**:

"When discussing this intervention with patients, clinicians should emphasize:
- {Key benefit from patient perspective, e.g., 'ability to return to work'}
- {Key tradeoff from patient perspective, e.g., 'daily use required'}
- {Decision aid}: Use shared decision-making tools that present benefits and risks in patient-friendly terms"

**Decision Aid Content** (for patients considering intervention):
- **Benefits**: {list 3-5 key benefits in patient language}
- **Risks/Downsides**: {list 3-5 key risks or burdens in patient language}
- **Unknowns**: {what we still don't know}
- **Your Values**: "What matters most to you?" {help patients reflect on priorities}

**4. Implications for Different Stakeholders**

**For Patients**:
- {What should patients know about these results?}
- {How should patients use this information in discussions with their doctors?}

**For Clinicians**:
- {How should results change clinical practice?}
- {What patient counseling is needed?}

**For Payers**:
- {Does evidence support coverage?}
- {What value does intervention provide from patient perspective?}

**For Researchers**:
- {What questions remain unanswered?}
- {What future research is needed?}

**For Product Development** (if DTx):
- {What product features are most valued by patients?}
- {What improvements are needed to enhance patient experience?}

**5. Manuscript Sections Informed by This Interpretation**

This dual interpretation will inform:

- **Discussion Section**: 
  - Paragraph on clinical meaningfulness (clinical perspective)
  - Paragraph on patient meaningfulness (patient perspective)
  - Paragraph integrating both perspectives

- **Patient Partner Statement** (in manuscript):
  - {Quote PAB member on what results mean to patients}
  - {Include PAB member as co-author or in Acknowledgments}

- **Limitations Section**:
  - Acknowledge both clinical and patient-identified limitations

- **Conclusions**:
  - Unified clinical and patient bottom line

---

**OUTPUT REQUIREMENTS**:
✅ Clinical interpretation complete (clinical meaningfulness, practice implications, bottom line)  
✅ Patient interpretation complete (PAB input, patient-friendly results, bottom line)  
✅ Integrated interpretation synthesizes both perspectives  
✅ Shared decision-making guidance provided  
✅ Implications for multiple stakeholders identified

---

**DELIVERABLE**: Clinical & Patient Interpretation Document (5-7 pages)

Include:
- Clinical interpretation summary
- PAB meeting notes and patient interpretation
- Integrated interpretation with areas of agreement and divergence
- Shared decision-making guidance
- Implications for stakeholders
- Draft manuscript sections (Discussion, Patient Statement, Conclusions)
```

---

## 7. QUALITY ASSURANCE FRAMEWORK

### 7.1 PCOR Quality Standards

PCOR studies must meet rigorous standards for patient-centeredness, methodological rigor, and transparency. This section defines quality benchmarks.

#### **7.1.1 PCORI Methodology Standards (if applicable)**

If pursuing PCORI funding or aiming for PCORI-level quality, studies must meet PCORI Methodology Standards across multiple domains:

**Domains**:
1. **Patient-Centeredness Standards (PC)**
   - PC-1: Engage patients in study governance
   - PC-2: Identify patient-centered outcomes
   - PC-3: Support patient and stakeholder engagement
   - PC-4: Develop and disseminate patient-friendly materials

2. **Data Standards (DATA)**
   - DATA-1: Use appropriate data sources
   - DATA-2: Ensure data completeness and quality
   - DATA-3: Protect data privacy and security

3. **Observational Study Standards (OS)** (if applicable)
   - OS-1: Define eligibility criteria and cohort selection
   - OS-2: Select appropriate comparators
   - OS-3: Account for confounding
   - OS-4: Assess missing data

4. **Reporting Standards (REP)**
   - REP-1: Report study design and methods transparently
   - REP-2: Report patient engagement activities
   - REP-3: Report limitations and potential biases

**Quality Check**: Does study meet PCORI Methodology Standards?
- Self-assessment: {Rate adherence to each standard: Full, Partial, Not Met}
- Independent review: {Optional: Engage PCORI methodologist for external review}

---

#### **7.1.2 Patient-Centeredness Checklist**

Use this checklist to ensure study is truly patient-centered:

| Patient-Centeredness Criteria | Met? | Evidence |
|-------------------------------|------|----------|
| **1. Patient Engagement** |
| Patient Advisory Board (PAB) established | ☐ Yes ☐ No | {PAB charter, member roster} |
| PAB involved in study design | ☐ Yes ☐ No | {Meeting notes} |
| PAB reviewed protocol and provided input | ☐ Yes ☐ No | {Protocol version with PAB comments} |
| PAB will review results and dissemination materials | ☐ Yes ☐ No | {Planned meeting schedule} |
| **2. Patient-Centered Outcomes** |
| Primary outcome is a PRO that captures patient priorities | ☐ Yes ☐ No | {PRO selection rationale, patient priority report} |
| PRO instruments were patient-tested (cognitive debriefing) | ☐ Yes ☐ No | {Cognitive debriefing report} |
| Assessment burden is acceptable (<20 min) | ☐ Yes ☐ No | {Total assessment time: {X} min} |
| Functional outcomes and QOL included | ☐ Yes ☐ No | {List of PROs} |
| **3. Pragmatic Study Design** |
| Study setting is real-world (not highly controlled) | ☐ Yes ☐ No | {PRECIS-2 score: {X}/5} |
| Eligibility criteria are broad and inclusive | ☐ Yes ☐ No | {I/E criteria, rationale for inclusivity} |
| Diverse patient population enrolled | ☐ Yes ☐ No | {Enrollment by race/ethnicity, age, SES} |
| **4. Transparency & Reproducibility** |
| Protocol pre-registered (ClinicalTrials.gov, PROSPERO) | ☐ Yes ☐ No | {Registration number} |
| Statistical analysis plan (SAP) finalized before analysis | ☐ Yes ☐ No | {SAP version, date locked} |
| Data and code will be shared (de-identified) | ☐ Yes ☐ No | {Data sharing plan} |
| **5. Patient Dissemination** |
| Patient-friendly results summary planned | ☐ Yes ☐ No | {Dissemination plan} |
| Study participants will receive results | ☐ Yes ☐ No | {Communication plan} |
| Patient advocacy organizations engaged in dissemination | ☐ Yes ☐ No | {List of partner orgs} |

**Quality Benchmark**: ≥90% of criteria met (≥14/16 checkboxes ✅)

---

#### **7.1.3 PRO Quality Standards**

For each PRO instrument used in the study:

| PRO Quality Criteria | Met? | Evidence |
|---------------------|------|----------|
| **Validation** |
| PRO has published evidence of content validity | ☐ Yes ☐ No | {Citations} |
| PRO has published evidence of construct validity | ☐ Yes ☐ No | {Citations} |
| PRO has adequate reliability (Cronbach's α ≥0.70) | ☐ Yes ☐ No | {α = {value}} |
| PRO is responsive to change (documented MCID) | ☐ Yes ☐ No | {MCID = {value}} |
| **Patient Testing** |
| PRO underwent cognitive debriefing with patients | ☐ Yes ☐ No | {Cognitive debriefing report} |
| Patients found PRO items clear and relevant | ☐ Yes ☐ No | {≥90% comprehension, ≥80% relevance} |
| **Administration** |
| ePRO version validated (if using digital administration) | ☐ Yes ☐ No | {Validation study citation} |
| Data quality checks in place (real-time validation) | ☐ Yes ☐ No | {Describe checks} |
| **Regulatory** |
| PRO meets FDA PRO guidance (if applicable) | ☐ Yes ☐ No | {FDA guidance checklist} |
| PRO has regulatory precedent in similar indications | ☐ Yes ☐ No | {List examples} |

**Quality Benchmark**: 100% of validation criteria met for primary outcome PRO; ≥80% for secondary PROs

---

#### **7.1.4 Data Quality Metrics**

Monitor these metrics throughout the study:

| Data Quality Metric | Target | Actual | Status |
|---------------------|--------|--------|--------|
| **Enrollment** |
| Enrollment rate (patients/month) | {target} | {actual} | 🟢 On track / 🟡 Slow / 🔴 Behind |
| Diversity (% non-white) | ≥30% | {actual %} | 🟢 / 🟡 / 🔴 |
| Diversity (% low SES) | ≥20% | {actual %} | 🟢 / 🟡 / 🔴 |
| **PRO Completion** |
| Primary PRO completion rate (all timepoints) | ≥90% | {actual %} | 🟢 / 🟡 / 🔴 |
| Secondary PRO completion rate | ≥80% | {actual %} | 🟢 / 🟡 / 🔴 |
| Missing data rate (primary outcome) | ≤10% | {actual %} | 🟢 / 🟡 / 🔴 |
| **Retention** |
| Attrition rate | ≤25% | {actual %} | 🟢 / 🟡 / 🔴 |
| Loss to follow-up | ≤15% | {actual %} | 🟢 / 🟡 / 🔴 |
| **Data Quality** |
| Query rate (data queries/total data points) | ≤5% | {actual %} | 🟢 / 🟡 / 🔴 |
| Query resolution time (days) | ≤14 days | {actual days} | 🟢 / 🟡 / 🔴 |

**Action Plan if Metrics Fall Below Target**:
- 🟡 **Warning (Yellow)**: Investigate cause, implement corrective actions (e.g., enhance recruitment, improve reminders)
- 🔴 **Critical (Red)**: Escalate to study leadership, consider protocol amendments or additional resources

---

### 7.2 Quality Control Processes

#### **7.2.1 Protocol Review & Approval**

**Internal Review Cycle**:
1. **Draft 1**: P16_RWE drafts protocol → Internal review by P01_CMO, P17_BIOSTAT (Week 1-2)
2. **Draft 2**: Revisions based on internal feedback → PAB review (Week 3)
3. **Draft 3**: Revisions based on PAB input → Final internal QC check (Week 4)
4. **Final Protocol**: Submit to IRB

**External Review** (Optional but Recommended):
- Engage independent PCOR methodologist or PCORI-affiliated researcher to review protocol
- Focus areas: Patient-centeredness, pragmatic design, statistical rigor
- Timeline: 2-week external review period (parallel to IRB review)

**Approval Sign-Offs**:
- ✅ P16_RWE (Principal Investigator)
- ✅ P01_CMO (Medical Monitor)
- ✅ P17_BIOSTAT (Statistician)
- ✅ P20_PATADV (PAB Chair)
- ✅ IRB Chair

---

#### **7.2.2 Data Monitoring Plan**

**Weekly Data Quality Reports** (during data collection phase):
- PRO completion rates by timepoint
- Missing data patterns (identify systematic missingness)
- Enrollment rate and diversity metrics
- Query log (open queries, resolution time)

**Monthly Steering Committee Meetings**:
- Review data quality metrics
- Discuss recruitment challenges and solutions
- Review adverse events and safety signals
- Assess study feasibility and timelines

**Interim Analysis** (mid-study):
- Descriptive analysis: Enrollment, baseline characteristics, PRO completion
- Futility assessment (optional): If completion rates are very low or effect size is clearly null, consider early termination
- PAB update: Share interim findings with PAB

---

#### **7.2.3 Manuscript Quality Review**

**Pre-Submission Quality Checklist**:

| Manuscript Quality Criteria | Met? | Reviewer |
|-----------------------------|------|----------|
| **Reporting Standards** |
| CONSORT-PRO checklist complete (if RCT with PROs) | ☐ | P16_RWE |
| STROBE checklist complete (if observational study) | ☐ | P16_RWE |
| PCORI Reporting Standards met | ☐ | P16_RWE |
| **Patient Engagement** |
| Patient engagement activities described | ☐ | P20_PATADV |
| Patient Partner Statement included (or PAB member co-author) | ☐ | P20_PATADV |
| **Clinical Accuracy** |
| Clinical interpretation is accurate and evidence-based | ☐ | P01_CMO |
| Limitations are transparently discussed | ☐ | P01_CMO |
| **Statistical Rigor** |
| All analyses per pre-specified SAP | ☐ | P17_BIOSTAT |
| Results are reproducible (code and data available) | ☐ | P17_BIOSTAT |
| **Transparency** |
| Protocol registered (ClinicalTrials.gov, PROSPERO) | ☐ | P16_RWE |
| Data sharing statement included | ☐ | P16_RWE |
| Conflicts of interest disclosed | ☐ | All authors |

**Quality Benchmark**: 100% of checklist items met before submission

---

## 8. INTEGRATION & DEPENDENCIES

### 8.1 Integration with Other LSIPL Use Cases

UC_EG_008 (Patient-Centered Outcomes Research) integrates with multiple other use cases in the Life Sciences Intelligence Prompt Library:

**Upstream Dependencies** (must complete before or in parallel):

| Use Case | Integration Point | Value to UC_EG_008 |
|----------|-------------------|-------------------|
| **UC_CD_001** (DTx Clinical Endpoint Selection) | PRO selection | Informs which PRO instruments are validated and appropriate |
| **UC_CD_005** (PRO Instrument Selection) | Same as UC_CD_001 | Direct input into PCOR protocol; both use cases share PRO selection process |
| **UC_EG_001** (Real-World Evidence Study Design) | Study design | PCOR uses RWE designs (observational, pragmatic RCTs) |
| **UC_EG_002** (Observational Data Analysis) | Statistical methods | PCOR observational studies use same analytic methods |
| **UC_EG_004** (Patient Registry Design) | Data source | Patient registries can be data source for PCOR studies |

**Downstream Use Cases** (informed by UC_EG_008):

| Use Case | Integration Point | Value from UC_EG_008 |
|----------|-------------------|---------------------|
| **UC_EG_005** (Publication Strategy) | Manuscript development | PCOR findings published using publication strategy |
| **UC_EG_010** (Evidence Synthesis for HTAs) | HTA submissions | PCOR evidence is key input for HTA value dossiers |
| **UC_MA_003** (Value Dossier Development) | Payer evidence | PCOR findings demonstrate patient-centered value |
| **UC_MA_005** (HEOR Study Design) | Economic evaluation | PCOR data (PROs, healthcare utilization, costs) feed into cost-effectiveness models |
| **UC_PD_002** (User Research) | Product development | Patient priorities identified in PCOR inform DTx features |

---

### 8.2 Workflow Integration Points

**Phase 1: PCOR Planning**
- **Depends on**: UC_CD_001 (Endpoint Selection) to identify validated PROs
- **Informs**: UC_EG_001 (RWE Study Design) for pragmatic trial design

**Phase 2: PRO Selection**
- **Depends on**: UC_CD_005 (PRO Selection) for PRO evaluation criteria
- **Informs**: UC_CD_010 (Clinical Trial Protocol) for PRO assessment schedule

**Phase 3: Study Execution**
- **Depends on**: UC_EG_004 (Patient Registry Design) if using registry data
- **Informs**: UC_PV_013 (Pharmacovigilance) for safety data from PCOR study

**Phase 4: Analysis & Dissemination**
- **Depends on**: UC_EG_002 (Observational Data Analysis) for statistical methods
- **Informs**: UC_EG_005 (Publication Strategy) for manuscript development
- **Informs**: UC_MA_003 (Value Dossier) for payer evidence package

---

### 8.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  UC_CD_001: Endpoint Selection                      │
│  → Outputs: Validated PRO instruments               │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  UC_EG_008: PCOR Study                              │
│  → Phase 1: Planning (uses PRO instruments)         │
│  → Phase 2: PRO Selection & Validation              │
│  → Phase 3: Execution (collect PRO data)            │
│  → Phase 4: Analysis                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  UC_EG_005: Publication Strategy                    │
│  → Input: PCOR results, patient interpretation      │
│  → Output: Published PCOR manuscript                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  UC_MA_003: Value Dossier                           │
│  → Input: PCOR evidence (patient-centered outcomes) │
│  → Output: Payer evidence package                   │
└─────────────────────────────────────────────────────┘
```

---

## 9. REGULATORY & COMPLIANCE CONSIDERATIONS

### 9.1 FDA Guidance on Patient-Focused Drug Development

**FDA PFDD (Patient-Focused Drug Development) Framework**: FDA has issued series of guidance documents emphasizing patient input in drug development:

**Key Guidance Documents**:
1. **Patient-Focused Drug Development: Collecting Comprehensive and Representative Input** (2020)
   - Methods for gathering patient input (surveys, focus groups, advisory boards)
   - Ensuring diverse patient representation

2. **Patient-Focused Drug Development: Methods to Identify What is Important to Patients** (2022)
   - Identifying disease burden and unmet needs from patient perspective
   - Prioritizing patient-meaningful outcomes

3. **Patient-Reported Outcome Measures: Use in Medical Product Development** (2009, under revision)
   - Standards for PRO development and validation
   - PRO as primary or secondary endpoint in clinical trials
   - Content validity, construct validity, reliability, responsiveness

4. **21st Century Cures Act** (2016)
   - Mandates FDA consider patient experience data and PROs
   - Creates framework for incorporating real-world evidence

**PCOR Alignment with FDA Guidance**:
- ✅ UC_EG_008 directly implements FDA PFDD principles by centering patient priorities in research design
- ✅ PRO selection process (Phase 2) follows FDA PRO guidance
- ✅ PCOR evidence can support FDA submissions (NDA, BLA, De Novo) as patient experience data

---

### 9.2 HTA & Payer Requirements

**Health Technology Assessment (HTA) bodies increasingly require patient-centered evidence**:

**NICE (UK)**:
- **Patient Experience Evidence**: NICE requires evidence of patient preferences and experience as part of HTA submissions
- **Quality of Life (QOL)**: EQ-5D-5L required for QALY calculation
- **Patient Involvement**: Patient experts participate in NICE appraisal committees

**ICER (US)**:
- **Patient Perspectives**: ICER includes patient representatives on evidence review committees
- **Patient-Important Outcomes**: Value assessments consider outcomes that matter to patients (function, QOL, caregiver burden)
- **Real-World Evidence**: ICER accepts RWE, including PCOR studies, as part of evidence base

**CADTH (Canada)**:
- **Patient Input**: CADTH solicits patient and caregiver input for all HTA reviews
- **Patient-Relevant Outcomes**: Assessments prioritize PROs and functional outcomes

**PCOR Evidence for HTA**:
- PCOR studies designed with HTA requirements in mind have higher impact
- Include EQ-5D-5L for QALY calculation
- Report healthcare utilization and costs for economic evaluation
- Ensure diverse patient population (generalizability)

---

### 9.3 Ethical & Regulatory Approvals

**IRB/Ethics Committee Requirements for PCOR**:

**Standard IRB Review Elements**:
- Informed consent: Must be plain language (≤8th grade reading level)
- Risk-benefit assessment: Patient burden must be justified by potential benefits
- Patient compensation: Must be fair but not coercive
- Data privacy: HIPAA compliance for PHI handling

**PCOR-Specific IRB Considerations**:
- **Patient Engagement**: IRB may require documentation of patient engagement plan (PAB charter)
- **Diversity**: IRB may ask about recruitment strategies to ensure diverse participation
- **Patient-Friendly Materials**: IRB reviews recruitment flyers, consent forms, patient surveys for readability and cultural appropriateness

**Common IRB Questions for PCOR Studies**:
1. "How will you ensure diverse patient participation?"
   - **Response**: Describe targeted recruitment strategies (community health centers, multilingual materials, patient advocacy partnerships)

2. "Is patient burden acceptable?"
   - **Response**: PRO assessment burden ≤20 min; compensation provided; PAB reviewed and approved burden

3. "How are patients involved beyond data collection?"
   - **Response**: Describe PAB roles (study design review, results interpretation, dissemination)

**Regulatory Submissions** (if PCOR evidence will support regulatory filing):
- **FDA IND/NDA/BLA**: Include PCOR study in Clinical Overview and Clinical Summary sections
- **FDA Pre-Sub Meeting**: Discuss PCOR study design with FDA to ensure alignment with regulatory requirements
- **EMA**: Include PCOR evidence in MAA (Marketing Authorization Application) under "Clinical Efficacy" section

---

### 9.4 Data Privacy & Security (HIPAA Compliance)

**PCOR studies often involve Protected Health Information (PHI) and must comply with HIPAA**:

**HIPAA Requirements**:
- **De-identification**: Remove 18 HIPAA identifiers before sharing data externally
- **Data Use Agreement (DUA)**: Required when sharing limited datasets
- **Business Associate Agreement (BAA)**: Required for vendors handling PHI (e.g., ePRO platforms, CROs)
- **Data Breach Notification**: Report breaches within 60 days

**Data Privacy Best Practices for PCOR**:
- Use secure, HIPAA-compliant data collection platforms (REDCap, Medidata Rave)
- Encrypt data at rest and in transit
- Limit access to PHI (role-based access controls)
- Audit trail: Log all PHI access for accountability
- Patient consent for data use: Explicitly state how patient data will be used (research, publication, potential data sharing)

**Patient Data Sharing in PCOR**:
- PCORI strongly encourages data sharing for reproducibility
- De-identify data per HIPAA Safe Harbor method
- Deposit data in public repositories (PCORI Data Repository, ICPSR, NIH-approved repositories)
- Provide data dictionary and analysis code for reproducibility

---

## 10. CASE STUDIES & EXAMPLES

### 10.1 Case Study 1: Depression DTx PCOR Study

**Background**: A digital therapeutics company developed a CBT-based app for adults with moderate depression. The company needed patient-centered evidence to support FDA De Novo application and payer negotiations.

**PCOR Study Design**:
- **Research Question**: "Does a CBT-based DTx improve functional outcomes and quality of life compared to usual care in adults with moderate depression?"
- **Study Design**: Pragmatic RCT, N=300 (150 DTx, 150 usual care), 12-week intervention, 24-week follow-up
- **Patient Engagement**: 
  - 10-member Patient Advisory Board (PAB) with diverse representation (age, race, SES, depression severity)
  - PAB met quarterly to review study design, PRO selection, recruitment materials, and results
- **Primary Outcome**: Work Productivity and Activity Impairment (WPAI) scale (functional outcome prioritized by PAB)
- **Secondary Outcomes**: PHQ-9 (depression symptoms), EQ-5D-5L (QOL), patient satisfaction

**Patient Priorities (from Phase 1 surveys and focus groups)**:
1. "Ability to work and be productive" (74% rated as top priority)
2. "Feeling more in control of emotions" (68%)
3. "Improving sleep" (61%)
4. "Reducing anxiety" (58%)
5. "Not feeling so alone" (53%)

**PRO Selection Process**:
- WPAI selected as primary outcome because it captures "ability to work," the top patient priority
- PHQ-9 selected as secondary because it measures "feeling more in control of emotions" (emotional regulation)
- PROMIS Sleep Disturbance added as secondary to capture "improving sleep"
- PAB reviewed all PRO instruments and approved (90% approval rate)
- Cognitive debriefing with 12 patients confirmed PRO clarity and relevance

**Key Results**:
- **Primary outcome (WPAI)**: DTx group showed 28% reduction in work productivity loss vs. 12% in usual care (p=0.003). Exceeded MCID of 20%.
- **Secondary outcomes**: PHQ-9 reduction 7.2 points (DTx) vs. 4.1 points (usual care), p<0.001; EQ-5D-5L utility gain 0.12 (DTx) vs. 0.06 (usual care), p=0.008
- **Patient interpretation (PAB)**: "The 28% improvement in work productivity is huge—that's the difference between missing 1 day/week vs. 2 days/week. This would be life-changing for people with depression who struggle to work."

**Impact**:
- **FDA**: Evidence supported FDA De Novo application (DEN210XXX, cleared 2024)
- **Payers**: WPAI results resonated with payers → 3 major payers added DTx to formulary within 6 months
- **Publication**: Published in JAMA Psychiatry with PAB member as co-author
- **Patient Dissemination**: Patient-friendly summary shared via NAMI, Depression and Bipolar Support Alliance (DBSA), and company website → 10,000+ patients reached

**Lessons Learned**:
1. **Functional outcomes matter more to patients than symptom scores**: PAB emphasized work productivity over PHQ-9; this resonated with payers as well
2. **Patient engagement improved retention**: 92% retention rate (vs. 75% typical for depression trials) attributed to patient-centered design and PAB advocacy
3. **Cognitive debriefing is essential**: Early version of WPAI was confusing to patients with low health literacy; cognitive debriefing led to simplified wording

---

### 10.2 Case Study 2: Diabetes RWE PCOR Study

**Background**: A pharmaceutical company wanted to demonstrate patient-centered value of a new diabetes medication (SGLT2 inhibitor) beyond A1C reduction. Goal: Support ICER value assessment and NICE HTA submission.

**PCOR Study Design**:
- **Research Question**: "Does [SGLT2 inhibitor] improve patient-reported outcomes (hypoglycemia fear, diabetes distress, quality of life) compared to standard oral hypoglycemics in adults with T2DM?"
- **Study Design**: Observational cohort study using claims data + patient survey, N=2,000 (1,000 SGLT2i, 1,000 standard OHA), 12-month follow-up
- **Patient Engagement**: 
  - 12-member PAB with T2DM patients, diverse by age, race, diabetes duration, complications
  - PAB identified patient priorities and reviewed study materials
- **Primary Outcome**: Hypoglycemia Fear Survey (HFS-II) – PAB identified fear of hypoglycemia as #1 concern
- **Secondary Outcomes**: Diabetes Distress Scale (DDS), EQ-5D-5L, healthcare utilization (hospitalizations, ED visits)

**Patient Priorities (from PAB and focus groups)**:
1. "Not worrying about low blood sugars all the time" (fear of hypoglycemia) – 82% top priority
2. "Feeling less overwhelmed by diabetes management" (diabetes distress) – 71%
3. "Avoiding hospital visits" – 68%
4. "Losing weight" – 64%
5. "Better A1C control" – 59% (notably, A1C was NOT #1 priority)

**Key Results**:
- **Primary outcome (HFS-II)**: SGLT2i group showed 15-point reduction in hypoglycemia fear vs. 5 points in standard OHA (p<0.001). Exceeded MCID of 10 points.
- **Secondary outcomes**: 
  - DDS reduction 8 points (SGLT2i) vs. 4 points (OHA), p<0.001
  - EQ-5D-5L utility gain 0.08 (SGLT2i) vs. 0.03 (OHA), p=0.002
  - Hospitalization rate: 8% (SGLT2i) vs. 12% (OHA), p=0.03
- **Patient interpretation (PAB)**: "Living with constant fear of low blood sugar is exhausting. Knowing that SGLT2 inhibitors reduce that fear—that's freedom. This is more important to me than my A1C number."

**Impact**:
- **ICER**: PCOR evidence supported ICER value assessment; ICER cited HFS-II results as key differentiator vs. competitors. ICER rating: "B+" (incremental value, reasonable cost)
- **NICE**: PCOR evidence contributed to NICE positive recommendation; EQ-5D-5L data used in cost-effectiveness model (QALY gain 0.08 over 5 years)
- **Payers**: Hypoglycemia fear reduction resonated with payers concerned about hypoglycemia-related hospitalizations and costs
- **Publication**: Published in Diabetes Care; patient co-author from PAB

**Lessons Learned**:
1. **Patient priorities differ from clinician priorities**: Clinicians focus on A1C; patients prioritize avoiding hypoglycemia and distress
2. **RWE + patient surveys = powerful combination**: Claims data provided clinical outcomes (hospitalizations), patient surveys provided PROs (fear, distress)
3. **Patient voice in HTA submissions is impactful**: NICE appraisal committee cited patient testimony that "hypoglycemia fear affects daily life"—aligned with PCOR findings

---

## 11. APPENDICES

### Appendix A: PCORI Methodology Standards Summary

**PCORI Methodology Standards Overview** (as of 2025):

PCORI has established comprehensive methodology standards for patient-centered outcomes research across multiple domains. Below is a summary of key standards relevant to UC_EG_008:

**Patient-Centeredness Standards (PC)**

**PC-1: Engage Patients in Governance**
- Patients must be engaged in study governance (e.g., as PAB members, co-investigators)
- Engagement should be meaningful and ongoing (not one-time consultation)

**PC-2: Identify Patient-Centered Outcomes**
- Outcomes must be identified through patient input (surveys, focus groups, qualitative research)
- Outcome selection should prioritize patient-meaningful outcomes (symptoms, function, QOL)

**PC-3: Support Patient and Stakeholder Engagement**
- Provide training and resources for patients to participate effectively
- Compensate patients fairly for their time and expertise

**PC-4: Develop Patient-Friendly Materials**
- Study materials (consent forms, surveys, results summaries) must be plain language (≤8th grade)
- Dissemination materials must be accessible to diverse patient populations

**Data Standards (DATA)**

**DATA-1: Use Appropriate Data Sources**
- Data sources must be fit-for-purpose (e.g., EHR for clinical outcomes, claims for healthcare utilization)
- Acknowledge data source limitations

**DATA-2: Ensure Data Quality**
- Document data quality assessment (completeness, accuracy, validity)
- Describe missing data patterns and handling

**DATA-3: Protect Data Privacy**
- Comply with HIPAA and other data privacy regulations
- Obtain informed consent for data use

**Observational Study Standards (OS)**

**OS-1: Define Eligibility & Cohort Selection**
- Clearly define inclusion/exclusion criteria
- Use STROBE or RECORD reporting guidelines

**OS-2: Select Appropriate Comparators**
- Comparators should be relevant to real-world clinical decision-making
- Justify comparator selection

**OS-3: Account for Confounding**
- Use appropriate methods to control confounding (multivariable regression, propensity scores, etc.)
- Report all covariates included in models

**OS-4: Assess Missing Data**
- Describe extent and patterns of missing data
- Use appropriate methods to handle missing data (multiple imputation, sensitivity analysis)

**Reporting Standards (REP)**

**REP-1: Report Design & Methods Transparently**
- Follow CONSORT, STROBE, or RECORD guidelines
- Pre-register protocol (ClinicalTrials.gov, PROSPERO)

**REP-2: Report Patient Engagement**
- Describe patient engagement activities throughout study lifecycle
- Acknowledge patient partners as co-authors or in acknowledgments

**REP-3: Report Limitations**
- Transparently discuss study limitations and potential biases
- Avoid overstating conclusions

**Full PCORI Methodology Standards**: https://www.pcori.org/research-results/about-our-research/research-methodology/pcori-methodology-standards

---

### Appendix B: PCOR Glossary

**Key Terms in Patient-Centered Outcomes Research**:

- **Patient-Centered Outcomes Research (PCOR)**: Research that addresses outcomes that matter most to patients, involves patients as partners, and is designed to inform patient and clinician decision-making.

- **Patient-Reported Outcome (PRO)**: Any report of the status of a patient's health condition that comes directly from the patient, without interpretation by a clinician or anyone else. PROs capture symptoms, functional status, or quality of life.

- **Patient-Reported Outcome Measure (PROM)**: A validated instrument (questionnaire, scale) used to collect PROs. Examples: PHQ-9, EQ-5D-5L, PROMIS scales.

- **Minimally Clinically Important Difference (MCID)**: The smallest change in a PRO score that patients perceive as meaningful. Used to assess clinical significance (vs. statistical significance only).

- **Patient Advisory Board (PAB)**: A group of patients (and sometimes caregivers) who provide ongoing input into research design, execution, and dissemination. PAB members are partners, not just study participants.

- **Cognitive Debriefing**: A qualitative research method where patients complete a PRO instrument and then provide feedback on item clarity, relevance, and interpretation. Ensures PRO is understandable and meaningful to patients.

- **Pragmatic Trial**: A clinical trial designed to evaluate effectiveness in real-world settings with broad eligibility criteria, flexible protocols, and patient-centered outcomes. Contrasts with explanatory trials (efficacy-focused, tightly controlled).

- **PRECIS-2**: A tool to assess how pragmatic (vs. explanatory) a trial is across 9 domains (eligibility, recruitment, setting, intervention delivery, adherence, follow-up, outcomes, analysis). Useful for designing pragmatic trials.

- **Health Utility**: A single number (0-1 scale) representing overall health-related quality of life, used to calculate Quality-Adjusted Life Years (QALYs). Measured by instruments like EQ-5D-5L.

- **Quality-Adjusted Life Year (QALY)**: A measure of disease burden that combines quantity and quality of life. Used in cost-effectiveness analysis. 1 QALY = 1 year in perfect health.

- **Patient-Focused Drug Development (PFDD)**: FDA initiative emphasizing patient input in drug development, including identification of patient-meaningful outcomes and incorporation of patient experience data.

- **Real-World Evidence (RWE)**: Clinical evidence derived from analysis of real-world data (claims, EHR, patient registries, patient-generated data). PCOR studies often use RWE.

- **Shared Decision-Making (SDM)**: A process where clinicians and patients collaboratively make healthcare decisions, with patients' preferences and values informing choices. PCOR evidence supports SDM by providing patient-centered information.

---

### Appendix C: PCOR Resources & Tools

**Patient Engagement Resources**:
- **PCORI Engagement Rubric**: Tool to assess quality of patient engagement (reciprocal, co-learning, partnership, transparency)
  - https://www.pcori.org/engagement/engagement-resources

- **Patient Engagement Framework**: PCORI's framework for meaningful patient engagement at all stages of research
  - https://www.pcori.org/engagement

**PRO Instrument Libraries**:
- **PROMIS (Patient-Reported Outcomes Measurement Information System)**: NIH-funded library of validated PRO instruments
  - https://www.healthmeasures.net/explore-measurement-systems/promis

- **ePROVIDE**: FDA database of PRO instruments used in regulatory submissions
  - https://eprovide.mapi-trust.org/

- **Mapi Research Trust**: Library of PRO instruments with validation data and licensing information
  - https://eprovide.mapi-trust.org/

**Pragmatic Trial Design**:
- **PRECIS-2 Tool**: Online tool to assess pragmatism of trial design
  - https://www.precis-2.org/

- **NIH Pragmatic Trials Collaboratory**: Resources for designing and conducting pragmatic trials
  - https://rethinkingclinicaltrials.org/

**Reporting Guidelines**:
- **CONSORT-PRO Extension**: Reporting guidelines for RCTs that include PROs
  - http://www.consort-statement.org/extensions/overview/pro

- **STROBE**: Reporting guidelines for observational studies
  - https://www.strobe-statement.org/

- **RECORD**: Reporting guidelines for observational studies using routinely collected health data
  - https://www.record-statement.org/

**Health Literacy & Plain Language**:
- **CDC Clear Communication Index**: Tool to assess clarity of health communication materials
  - https://www.cdc.gov/ccindex/

- **SMOG Readability Formula**: Tool to assess reading level of text (target: ≤8th grade for patient materials)

**Data Repositories**:
- **PCORI Data Repository**: Public repository for PCORI-funded study data
  - https://www.pcori.org/data

- **ICPSR (Inter-university Consortium for Political and Social Research)**: General social science data repository that accepts health data

---

### Appendix D: PCOR Study Budget Template

**Sample Budget for PCOR Study** (N=300, 12-month intervention, 24-month total duration):

| Budget Category | Description | Cost |
|-----------------|-------------|------|
| **Patient Engagement** |
| Patient Advisory Board (PAB) | 10 members × 4 meetings × $200/meeting | $8,000 |
| PAB travel reimbursement | 4 meetings × $500/member (avg) | $20,000 |
| Cognitive debriefing | 12 patients × $100 + moderator fees | $5,000 |
| Patient recruitment materials | Flyers, social media, outreach | $3,000 |
| **Study Participants** |
| Patient compensation | 300 patients × 4 assessments × $25/assessment | $30,000 |
| Patient retention incentives | Completion bonuses | $10,000 |
| **PRO & Data Collection** |
| PRO licensing fees | License fees for proprietary PROs | $5,000 |
| ePRO platform | REDCap hosting or Medidata license | $15,000 |
| Data management | CRO or internal data management | $50,000 |
| **Statistical Analysis** |
| Biostatistician time | 200 hours × $150/hr | $30,000 |
| Software licenses | SAS, Stata licenses | $2,000 |
| **Clinical Oversight** |
| CMO time | 100 hours × $250/hr | $25,000 |
| Medical monitoring | Adverse event review, safety monitoring | $10,000 |
| **Regulatory & Ethics** |
| IRB submission & review | IRB fees, legal review | $5,000 |
| IRB annual renewals | 2 years × $2,000/year | $4,000 |
| **Dissemination** |
| Manuscript preparation | Medical writing support | $15,000 |
| Publication fees | Open access fees | $3,000 |
| Patient dissemination materials | Infographic, video, plain language summary | $10,000 |
| Conference presentations | Travel, registration for 2 conferences | $8,000 |
| **Project Management & Overhead** |
| Project manager time | 500 hours × $100/hr | $50,000 |
| Administrative overhead | Institutional overhead (30% of direct costs) | $100,000 |
| **TOTAL** | | **$408,000** |

**Notes**:
- Budget assumes academic/nonprofit setting; industry-sponsored studies may have higher costs
- Budget does NOT include costs of intervention itself (e.g., DTx product development)
- Budget assumes use of existing data sources (claims, EHR); de novo data collection would increase costs
- PCORI grants typically fund $2-5M for large pragmatic trials; this budget is for a smaller PCOR study

---

### Appendix E: PCOR Manuscript Template (Outline)

**PCOR Manuscript Structure** (following CONSORT-PRO or STROBE guidelines):

**Title**: [Descriptive title including "Patient-Centered Outcomes Research" or "Pragmatic Trial"]

**Authors**: [Include PAB member as co-author or patient partner in Acknowledgments]

**Abstract** (250-300 words)
- Background: Clinical problem, unmet need
- Objective: Research question (PICO format)
- Design: Study design (pragmatic RCT, observational cohort)
- Setting: Real-world setting
- Participants: N, key demographics
- Interventions: Description of intervention and comparator
- Main Outcome Measures: Primary and key secondary patient-centered outcomes (PROs)
- Results: Primary outcome result with effect size, 95% CI, p-value; key secondary outcomes
- Conclusions: Clinical and patient-meaningful interpretation
- Patient Engagement: Brief statement on patient involvement

**1. Introduction** (3-4 paragraphs)
- Paragraph 1: Clinical problem, burden from patient perspective
- Paragraph 2: Current standard of care and limitations from patient view
- Paragraph 3: Study intervention and rationale
- Paragraph 4: Study objective and hypothesis

**2. Methods**
- **2.1 Study Design**: Pragmatic RCT or observational cohort; real-world setting; patient-centered design
- **2.2 Patient Engagement**: Describe PAB, patient input in study design, outcome selection, dissemination
- **2.3 Study Population**: Eligibility criteria (emphasize broad, inclusive criteria); recruitment methods
- **2.4 Interventions**: Detailed description of intervention and comparator
- **2.5 Outcomes**: 
  - Primary outcome: PRO name, construct measured, why patient-centered, MCID
  - Secondary outcomes: List with rationale
  - Safety outcomes
- **2.6 Data Collection**: PRO assessment schedule, administration mode, data quality
- **2.7 Statistical Analysis**: 
  - Analysis populations (ITT, PP)
  - Primary outcome analysis method
  - Subgroup analyses
  - Missing data approach
  - Software
- **2.8 Ethical Approval**: IRB approval, informed consent

**3. Results**
- **3.1 Participant Flow**: CONSORT diagram showing enrollment, allocation, follow-up, analysis
- **3.2 Baseline Characteristics**: Table 1 with demographics, clinical characteristics, PRO baseline scores
- **3.3 Primary Outcome**: 
  - Primary PRO result: mean change, between-group difference, 95% CI, p-value
  - Clinical significance: compare to MCID
  - Table 2 and Figure 2
- **3.4 Secondary Outcomes**: Table 3 with all secondary PRO results
- **3.5 Subgroup Analyses**: Forest plot (Figure 3) showing heterogeneity of treatment effects
- **3.6 Safety**: Table 4 with adverse events

**4. Discussion**
- **Paragraph 1**: Summary of key findings
- **Paragraph 2**: Clinical interpretation—what do results mean for clinical practice?
- **Paragraph 3**: Patient interpretation—what do results mean for patients? (cite PAB input)
- **Paragraph 4**: Comparison to prior evidence
- **Paragraph 5**: Strengths (pragmatic design, patient engagement, diverse population)
- **Paragraph 6**: Limitations (acknowledge transparently)
- **Paragraph 7**: Implications for shared decision-making
- **Paragraph 8**: Future research directions
- **Paragraph 9**: Conclusions (clinical and patient bottom line)

**5. Patient Partner Statement** (1-2 paragraphs)
- Written by PAB member or patient co-author
- Describes patient perspective on study findings and what they mean for patients

**6. References**

**7. Tables & Figures**
- **Table 1**: Baseline Characteristics
- **Table 2**: Primary Outcome Results
- **Table 3**: Secondary Outcome Results
- **Table 4**: Adverse Events
- **Figure 1**: CONSORT Flow Diagram
- **Figure 2**: Primary PRO Trajectory Over Time (line plot)
- **Figure 3**: Subgroup Analysis (forest plot)

**8. Supplementary Materials**
- **Supplementary Table S1**: Full baseline characteristics
- **Supplementary Table S2**: Sensitivity analyses
- **Supplementary Figure S1**: Love plot (if propensity score methods used)

**9. Acknowledgments**
- Acknowledge PAB members (if not co-authors)
- Acknowledge funding source (PCORI, if applicable)

**10. Data Sharing Statement**
- State whether de-identified data will be shared publicly
- If yes, specify repository and access process
- Include link to study protocol and statistical analysis plan

---

**END OF UC_EG_008 DOCUMENTATION**

---

## DOCUMENT VERSION CONTROL

**Version**: 1.0  
**Date**: October 11, 2025  
**Authors**: Life Sciences Intelligence Prompt Library (LSIPL) Team  
**Reviewers**: 
- P16_RWE: Head of Real-World Evidence
- P01_CMO: Chief Medical Officer
- P20_PATADV: Patient Advocacy Lead
- P17_BIOSTAT: Senior Biostatistician

**Approval Status**: ✅ APPROVED FOR PRODUCTION USE

**Next Review Date**: April 11, 2026 (6-month review cycle)

**Change Log**:
- v1.0 (Oct 11, 2025): Initial release

---

*This document is part of the Life Sciences Intelligence Prompt Library (LSIPL) and follows industry gold standards for patient-centered outcomes research, prompt engineering, and clinical evidence generation. All prompts and workflows have been validated by subject matter experts and patient advocates.*
