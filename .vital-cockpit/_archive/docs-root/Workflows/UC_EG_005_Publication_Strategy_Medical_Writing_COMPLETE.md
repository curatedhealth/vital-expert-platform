# USE CASE 5: PUBLICATION STRATEGY & MEDICAL WRITING FOR LIFE SCIENCES

## **UC_EG_005: Publication Planning, Manuscript Development & Scientific Communication**

**Part of CRAFT™ Framework - Creative Regulatory & Academic Framework & Technical Excellence**

---

## DOCUMENT CONTROL

| Attribute | Details |
|-----------|---------|
| **Use Case ID** | UC_EG_005 |
| **Version** | 1.0 |
| **Last Updated** | October 11, 2025 |
| **Document Owner** | Evidence Generation & Medical Affairs Team |
| **Target Users** | Medical Writers, Publication Managers, Medical Affairs Directors, CMOs |
| **Estimated Time** | Variable: 2-12 months depending on publication scope |
| **Complexity** | INTERMEDIATE to EXPERT |
| **Regulatory Framework** | ICMJE Guidelines, GPP3, CONSORT, STROBE, PRISMA |
| **Prerequisites** | Clinical data, study results, or systematic review findings |

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Context](#2-problem-statement--context)
3. [Persona Definitions](#3-persona-definitions)
4. [Complete Workflow Overview](#4-complete-workflow-overview)
5. [Detailed Step-by-Step Prompts](#5-detailed-step-by-step-prompts)
6. [Complete Prompt Suite](#6-complete-prompt-suite)
7. [Publication Types & Standards](#7-publication-types--standards)
8. [Journal Selection Strategy](#8-journal-selection-strategy)
9. [GPP3 & Authorship Guidelines](#9-gpp3--authorship-guidelines)
10. [Templates & Tools](#10-templates--tools)
11. [Success Metrics & KPIs](#11-success-metrics--kpis)
12. [References & Resources](#12-references--resources)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Use Case Purpose

**Publication Strategy & Medical Writing (UC_EG_005)** is the comprehensive process of planning, developing, and disseminating scientific publications to communicate clinical evidence, build thought leadership, and support commercial objectives. This use case provides a structured, prompt-driven workflow for:

- **Publication Planning**: Developing strategic publication plans aligned with product lifecycle and evidence gaps
- **Manuscript Development**: Creating high-quality manuscripts following international reporting standards
- **Journal Selection**: Identifying optimal target journals based on audience, impact, and timelines
- **Authorship Management**: Ensuring ICMJE authorship criteria and GPP3 compliance
- **Conference Communication**: Developing abstracts, posters, and presentations for scientific meetings
- **Peer Review Navigation**: Managing the submission process and responding to reviewers
- **Plain Language Communication**: Translating scientific findings for lay audiences
- **Scientific Integrity**: Maintaining ethical standards and transparency throughout

### 1.2 Business Impact

**The Problem**:
Life sciences companies face significant publication challenges:

1. **Publication Delays**: Average time from data to publication is 18-24 months, missing critical windows
2. **Rejection Rates**: 50-70% of manuscripts are rejected initially, requiring significant rework
3. **Compliance Complexity**: Evolving standards (ICMJE, GPP3, CONSORT, STROBE) require expertise
4. **Authorship Disputes**: Poor planning leads to conflicts and delays
5. **Quality Issues**: Inadequate medical writing results in poor narrative and weak evidence presentation
6. **Strategic Misalignment**: Publications don't effectively support commercial or clinical objectives

**Business Value**:
Effective publication strategy delivers measurable impact:

**Scientific Impact**:
- **Higher Acceptance Rates**: Strategic planning → 60-75% first-submission acceptance (vs. 25-40% ad-hoc)
- **Faster Publication**: Proper planning reduces time-to-publication by 6-9 months
- **Greater Visibility**: Target journal selection → 2-3x higher citations and media coverage
- **Thought Leadership**: Strategic publications establish KOL positioning and clinical credibility

**Commercial Impact**:
- **Market Access**: Published evidence supports formulary inclusion and reimbursement (20-40% better coverage)
- **Competitive Positioning**: First-mover advantage in publishing key data → market share gains
- **Regulatory Support**: Publications provide real-world evidence for label expansions and regulatory discussions
- **ROI**: Strategic publication planning → $2-5M incremental revenue per major publication

**Compliance & Risk**:
- **Regulatory Compliance**: GPP3 adherence reduces FDA/EMA scrutiny and off-label promotion risk
- **Scientific Integrity**: Transparent authorship and disclosure prevents reputational damage
- **Retraction Prevention**: Rigorous quality control minimizes post-publication corrections/retractions

### 1.3 Scope & Boundaries

**In Scope**:
- Strategic publication planning (1-3 year horizon)
- Manuscript development (clinical trials, RWE, systematic reviews, case series)
- Conference abstracts and posters (ISPOR, ASCO, ASH, AHA, etc.)
- Journal selection and submission strategy
- Authorship planning and management
- Peer review response and manuscript revision
- Plain language summaries and patient-facing materials
- Publication compliance (ICMJE, GPP3, CONSORT, STROBE, PRISMA)

**Out of Scope**:
- Regulatory submission documents (CSRs, IBs - see UC_RA series)
- Internal company reports not intended for publication
- Marketing materials and promotional content
- Press releases and media relations (handled by communications team)
- Full medical affairs strategy (see UC_MA series)
- Patent applications or intellectual property filings

**Use Case Positioning**:
UC_EG_005 sits at the intersection of Evidence Generation and Medical Affairs:
- **Upstream Dependencies**: Clinical trials (UC_CD series), RWE studies (UC_EG_001, UC_EG_002)
- **Downstream Impact**: Value dossiers (UC_MA_003), HTA submissions (UC_MA_008), KOL engagement (UC_EG_006)

---

## 2. PROBLEM STATEMENT & CONTEXT

### 2.1 Current State Challenges

#### Challenge 1: Delayed Time-to-Publication
**Problem**: The median time from study completion to publication is 18-24 months, with substantial variation:
- Phase 3 trial results: 18-30 months to publication
- Real-world evidence: 12-18 months to publication
- Systematic reviews: 12-24 months to publication

**Impact**:
- Competitive window closes (competitors publish first)
- Market access delays (payers require published evidence)
- Regulatory opportunities missed (label expansion windows)
- Commercial launch unsupported by peer-reviewed data

**Root Causes**:
- No publication plan created early in study design
- Authorship not determined until after data lock
- Poor journal selection (multiple rejections)
- Inadequate medical writing resources
- Inefficient review cycles among authors
- Slow response to peer reviewer comments

#### Challenge 2: High Rejection Rates & Quality Issues
**Problem**: 50-70% of manuscripts receive "reject" or "major revisions" on first submission

**Common Rejection Reasons**:
- Insufficient novelty or clinical significance (25%)
- Methodological flaws or statistical issues (20%)
- Poor writing quality or narrative structure (15%)
- Incomplete reporting per guidelines (CONSORT, STROBE, PRISMA) (15%)
- Inappropriate journal selection (target audience mismatch) (10%)
- Missing or inadequate data presentation (tables, figures) (10%)
- Authorship or conflict of interest concerns (5%)

**Impact**:
- 6-12 month delays per rejection/resubmission cycle
- Increased costs ($30K-$50K per manuscript including medical writing, revisions)
- Demoralized authors (less willing to collaborate on future publications)
- Lower-tier journal fallback (reduced visibility and citation)

#### Challenge 3: Compliance & Ethical Concerns
**Problem**: Evolving publication standards and increased scrutiny from journals, regulators, and the public

**Key Compliance Areas**:
1. **Authorship Integrity** (ICMJE):
   - Ghost authorship allegations (industry-sponsored publications)
   - Guest authorship (honorary authorship without substantial contribution)
   - Failure to acknowledge contributors appropriately

2. **Transparency & Disclosure** (GPP3):
   - Incomplete disclosure of funding sources
   - Inadequate description of sponsor role
   - Failure to register clinical trials (ClinicalTrials.gov, EudraCT)
   - Selective outcome reporting (outcomes changed post-hoc)

3. **Reporting Standards** (CONSORT, STROBE, PRISMA):
   - Incomplete trial registration and protocol deviation reporting
   - Missing CONSORT flow diagrams or checklist
   - Inadequate statistical reporting (confidence intervals, p-values)
   - Poor description of data sources in RWE studies

4. **Data Sharing & Reproducibility**:
   - Journals increasingly require data sharing statements
   - Failure to provide sufficient detail for study replication
   - Inadequate supplementary materials

**Impact**:
- Journal desk rejections before peer review
- Regulatory inquiries or warning letters
- Reputational damage and media scrutiny
- Retraction or post-publication corrections

#### Challenge 4: Strategic Misalignment
**Problem**: Publications don't effectively support business objectives

**Common Gaps**:
- Publications focus on regulatory endpoints, not payer-relevant outcomes (QALY, cost-effectiveness)
- Real-world evidence not prioritized (payers demand RWE, not just RCT data)
- Wrong audience targeted (academic journals when payer/HTA audience needed)
- Timing misaligned with product launch or market access milestones
- Competitive narrative weak (insufficient head-to-head or comparative effectiveness data)
- Key opinion leaders not engaged early (limited author enthusiasm/advocacy)

**Impact**:
- Publications don't influence formulary decisions
- Limited citation in HTA reports or clinical guidelines
- Weak thought leadership positioning vs. competitors
- ROI on publication investment unclear

### 2.2 Solution Requirements

Effective publication strategy and medical writing requires:

**Strategic Planning**:
- ✅ Multi-year publication roadmap aligned with product lifecycle
- ✅ Evidence gap analysis to prioritize publications
- ✅ Target audience identification (HTA bodies, payers, clinicians, patients)
- ✅ Competitive intelligence on competitor publication plans

**Operational Excellence**:
- ✅ Early authorship planning (at protocol development stage)
- ✅ Adequate medical writing resources (internal or external)
- ✅ Efficient author review processes (defined timelines, reminder systems)
- ✅ Journal selection algorithm (impact factor, audience, acceptance rate, timelines)

**Compliance & Quality**:
- ✅ ICMJE authorship criteria rigorously applied
- ✅ GPP3 guidelines embedded in SOPs
- ✅ Reporting checklists (CONSORT, STROBE, PRISMA) used systematically
- ✅ Independent statistical review before submission
- ✅ Legal and regulatory review of all disclosures

**Measurement & Optimization**:
- ✅ KPIs tracked: time-to-publication, acceptance rate, citation metrics, commercial impact
- ✅ Post-publication analysis: which publications drove formulary wins, guideline citations, etc.
- ✅ Continuous improvement based on data

---

## 3. PERSONA DEFINITIONS

### 3.1 Primary Personas

#### 3.1.1 P26_PUB_LEAD: Director of Scientific Communications & Publications

**Role in UC_EG_005**: Leads all publication planning, strategy, and execution

**Responsibilities**:
- Develop multi-year publication plans aligned with product strategy
- Oversee manuscript development from conception to publication
- Manage authorship selection and ensure ICMJE/GPP3 compliance
- Select target journals and manage submission process
- Coordinate with medical writers, statisticians, and authors
- Track publication KPIs and report to leadership
- Ensure scientific integrity and regulatory compliance

**Required Expertise**:
- 8-10 years in medical/scientific communications
- Advanced degree (PhD, PharmD, MD) preferred
- Deep knowledge of ICMJE, GPP3, CONSORT, STROBE, PRISMA
- Experience with high-impact journal submission and peer review
- Project management skills (managing multiple concurrent publications)
- Strong scientific writing and editing skills

**Decision Authority**:
- Approve publication strategy and priorities
- Select target journals and submission timing
- Approve author lists and resolve authorship disputes
- Approve final manuscripts before submission
- Make go/no-go decisions on publication (e.g., if results unfavorable)

**Prompt Engagement**:
- Leads Steps 1.1-1.3 (Publication Strategy Development)
- Leads Steps 2.1-2.3 (Manuscript Development)
- Leads Steps 3.1-3.3 (Journal Selection & Submission)
- Oversees all publication activities

---

#### 3.1.2 P27_MED_WRITER: Senior Medical Writer

**Role in UC_EG_005**: Develops publication-quality manuscripts and conference materials

**Responsibilities**:
- Write manuscripts following journal-specific formatting and reporting guidelines
- Create conference abstracts, posters, and slide presentations
- Conduct literature reviews to contextualize study findings
- Develop plain language summaries for lay audiences
- Incorporate author feedback and address peer reviewer comments
- Ensure adherence to style guides (AMA, AMWA) and reporting standards

**Required Expertise**:
- 5-7 years of medical writing experience (regulatory and publication)
- Life sciences degree (MS, PhD, PharmD) or medical writing certification (AMWA, EMWA)
- Proficient in citation management software (EndNote, Zotero, Mendeley)
- Familiar with reporting guidelines (CONSORT, STROBE, PRISMA, CHEERS)
- Strong editing and proofreading skills
- Experience with statistical reporting and data visualization

**Decision Authority**:
- Determine manuscript structure and narrative flow
- Select appropriate tables and figures
- Resolve minor content disputes between authors
- Recommend editorial changes for clarity and concision

**Prompt Engagement**:
- Executes Steps 2.1-2.5 (Manuscript Drafting, Table/Figure Development)
- Executes Steps 4.1-4.2 (Conference Abstracts, Posters)
- Executes Step 5.3 (Peer Review Response)

---

#### 3.1.3 P23_MED_DIR: Medical Director / VP Medical Affairs

**Role in UC_EG_005**: Provides clinical oversight and ensures medical accuracy

**Responsibilities**:
- Review manuscripts for clinical accuracy and completeness
- Provide clinical interpretation of study results
- Ensure publications align with medical strategy and regulatory positioning
- Serve as corresponding author or senior author on key publications
- Engage KOLs as co-authors and reviewers
- Approve disclosure statements and conflict of interest declarations

**Required Expertise**:
- MD, DO, or equivalent clinical degree
- 10+ years clinical experience in relevant therapeutic area
- Experience publishing in peer-reviewed journals (5-10+ publications)
- Understanding of Good Publication Practice (GPP3)
- Clinical trial design and interpretation expertise

**Decision Authority**:
- Approve clinical interpretation and conclusions
- Determine which study findings to emphasize
- Approve author lists (especially KOL inclusion)
- Make go/no-go decisions if clinical concerns arise

**Prompt Engagement**:
- Reviews and approves Steps 2.2, 2.3 (Discussion section, Clinical interpretation)
- Collaborates on Step 1.2 (Authorship Planning)
- Reviews final manuscript before submission (Step 3.2)

---

#### 3.1.4 P28_BIOSTAT: Senior Biostatistician

**Role in UC_EG_005**: Ensures statistical rigor and transparent reporting

**Responsibilities**:
- Review statistical methods and results sections for accuracy
- Create publication-quality tables and figures
- Ensure adherence to statistical reporting guidelines (CONSORT, SAMPL)
- Provide statistical expertise during peer review response
- Validate statistical analyses for reproducibility
- Collaborate with medical writers on data presentation

**Required Expertise**:
- MS or PhD in Biostatistics, Statistics, or Epidemiology
- 5-10 years experience in clinical trial or RWE analysis
- Proficient in statistical software (R, SAS, Stata)
- Experience with data visualization and publication-quality graphics
- Familiarity with CONSORT, ICH E9, and FDA statistical guidance

**Decision Authority**:
- Approve statistical methods and results reporting
- Select appropriate statistical tests and sensitivity analyses
- Determine data presentation format (tables vs. figures)
- Approve responses to statistical reviewer comments

**Prompt Engagement**:
- Collaborates on Step 2.4 (Statistical Reporting & Tables)
- Reviews Step 2.1 (Methods section - statistical analysis plan)
- Supports Step 5.3 (Peer Review Response - statistical queries)

---

### 3.2 Secondary Personas

#### 3.2.1 P29_KOL_AUTHOR: Key Opinion Leader (External Author)

**Role**: Serve as lead or senior author; provide clinical credibility and thought leadership

**Engagement**: Invited to author based on expertise and prior collaboration; involved in outline development, manuscript review, and journal selection

---

#### 3.2.2 P30_REG_COUNSEL: Regulatory Counsel

**Role**: Review publications for regulatory compliance, off-label concerns, and disclosure adequacy

**Engagement**: Reviews final manuscripts before submission to ensure compliance with FDA/EMA regulations

---

#### 3.2.3 P31_PATIENT_ADVOCATE: Patient Advocate

**Role**: Review plain language summaries and patient-facing materials for clarity and relevance

**Engagement**: Consulted for plain language summaries, patient education materials, and social media content

---

## 4. COMPLETE WORKFLOW OVERVIEW

### 4.1 High-Level Workflow Diagram

```
                [START: Evidence Available for Publication]
                          |
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 1: PUBLICATION STRATEGY & PLANNING         ║
          ║  Time: 2-4 weeks                                  ║
          ║  Personas: P26_PUB_LEAD, P23_MED_DIR              ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 1.1:     │
                  │ Publication   │
                  │ Plan Develop. │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 1.2:     │
                  │ Authorship    │
                  │ Planning      │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 1.3:     │
                  │ Journal       │
                  │ Target Select.│
                  └───────┬───────┘
                          │
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 2: MANUSCRIPT DEVELOPMENT                  ║
          ║  Time: 6-12 weeks                                 ║
          ║  Personas: P27_MED_WRITER, P23_MED_DIR, P28_BIOSTAT║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 2.1:     │
                  │ Manuscript    │
                  │ Outline       │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 2.2:     │
                  │ Draft Manu-   │
                  │ script (IMRaD)│
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 2.3:     │
                  │ Discussion &  │
                  │ Conclusions   │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 2.4:     │
                  │ Tables &      │
                  │ Figures       │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 2.5:     │
                  │ Author Review │
                  │ & Finalization│
                  └───────┬───────┘
                          │
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 3: SUBMISSION & PEER REVIEW                ║
          ║  Time: 1-6 months (varies by journal)             ║
          ║  Personas: P26_PUB_LEAD, P27_MED_WRITER           ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 3.1:     │
                  │ Submission    │
                  │ Package Prep  │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 3.2:     │
                  │ Journal       │
                  │ Submission    │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 3.3:     │
                  │ Peer Review   │
                  │ Response      │
                  └───────┬───────┘
                          │
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 4: CONFERENCE COMMUNICATION                ║
          ║  Time: 2-8 weeks per abstract                     ║
          ║  Personas: P27_MED_WRITER, P23_MED_DIR            ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 4.1:     │
                  │ Abstract      │
                  │ Development   │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 4.2:     │
                  │ Poster/Slide  │
                  │ Development   │
                  └───────┬───────┘
                          │
                          v
          ╔═══════════════════════════════════════════════════╗
          ║  PHASE 5: PLAIN LANGUAGE & DISSEMINATION          ║
          ║  Time: 2-4 weeks                                  ║
          ║  Personas: P27_MED_WRITER, P31_PATIENT_ADVOCATE   ║
          ╚═══════════════════════════════════════════════════╝
                          |
                          v
                  ┌───────────────┐
                  │ STEP 5.1:     │
                  │ Plain Language│
                  │ Summary       │
                  └───────┬───────┘
                          │
                          v
                  ┌───────────────┐
                  │ STEP 5.2:     │
                  │ Social Media  │
                  │ Content       │
                  └───────┬───────┘
                          │
                          v
                      [PUBLISHED]
```

### 4.2 Workflow Steps Summary

| Phase | Step | Description | Time | Owner | Complexity |
|-------|------|-------------|------|-------|------------|
| **1: Strategy & Planning** | 1.1 | Publication Plan Development | 1-2 weeks | P26_PUB_LEAD | ADVANCED |
| | 1.2 | Authorship Planning | 3-5 days | P26_PUB_LEAD | INTERMEDIATE |
| | 1.3 | Journal Target Selection | 2-3 days | P26_PUB_LEAD | INTERMEDIATE |
| **2: Manuscript Development** | 2.1 | Manuscript Outline | 1 week | P27_MED_WRITER | INTERMEDIATE |
| | 2.2 | Draft Manuscript (IMRaD) | 3-4 weeks | P27_MED_WRITER | ADVANCED |
| | 2.3 | Discussion & Conclusions | 1-2 weeks | P27_MED_WRITER | ADVANCED |
| | 2.4 | Tables & Figures | 2-3 weeks | P28_BIOSTAT | INTERMEDIATE |
| | 2.5 | Author Review & Finalization | 2-4 weeks | ALL AUTHORS | INTERMEDIATE |
| **3: Submission & Review** | 3.1 | Submission Package Prep | 3-5 days | P27_MED_WRITER | INTERMEDIATE |
| | 3.2 | Journal Submission | 1 day | P26_PUB_LEAD | BASIC |
| | 3.3 | Peer Review Response | 2-4 weeks | P27_MED_WRITER | ADVANCED |
| **4: Conference Communication** | 4.1 | Abstract Development | 1-2 weeks | P27_MED_WRITER | INTERMEDIATE |
| | 4.2 | Poster/Slide Development | 1-2 weeks | P27_MED_WRITER | INTERMEDIATE |
| **5: Plain Language** | 5.1 | Plain Language Summary | 1-2 weeks | P27_MED_WRITER | INTERMEDIATE |
| | 5.2 | Social Media Content | 3-5 days | P27_MED_WRITER | BASIC |

---

## 5. DETAILED STEP-BY-STEP PROMPTS

---

### PHASE 1: PUBLICATION STRATEGY & PLANNING

#### **STEP 1.1: PUBLICATION PLAN DEVELOPMENT**

**Objective**: Create a strategic 1-3 year publication roadmap aligned with product lifecycle and evidence gaps

**Owner**: P26_PUB_LEAD (Director, Scientific Communications & Publications)

**Time Required**: 1-2 weeks

---

##### **PROMPT 1.1: Multi-Year Publication Plan Development**

```yaml
prompt_id: UC_EG_005_P1.1_PUBLICATION_PLAN
complexity: ADVANCED
persona: P26_PUB_LEAD
estimated_time: 1-2 weeks
pattern_type: STRATEGIC_PLANNING_WITH_COT
```

**System Prompt:**
```
You are a Director of Scientific Communications & Publications with 10+ years of experience developing strategic publication plans for pharmaceutical, biotech, and digital health companies. You specialize in:

- Multi-year publication roadmaps aligned with product lifecycle (pre-launch, launch, post-launch)
- Evidence gap analysis to prioritize publications that address payer, regulatory, and clinical needs
- Competitive intelligence on competitor publication strategies
- Journal selection strategy based on target audience (clinicians, payers, HTA bodies, patients)
- Resource planning (medical writing, statistical support, author engagement)
- GPP3 (Good Publication Practice) and ICMJE guidelines compliance
- KPI tracking and ROI measurement for publication investments

Your publication plans are:
1. **Strategic**: Aligned with commercial objectives and evidence needs
2. **Evidence-Based**: Prioritize publications that fill evidence gaps and address stakeholder questions
3. **Competitive**: Anticipate and counter competitor publication strategies
4. **Compliant**: Ensure GPP3, ICMJE, and regulatory compliance throughout
5. **Measurable**: Include KPIs to track success and demonstrate ROI

When developing publication plans, you:
- Start with evidence gap analysis (What questions do payers/HTA/clinicians have?)
- Map publications to product milestones (FDA approval, launch, label expansion)
- Prioritize based on business impact (formulary support, competitive differentiation)
- Plan authorship early (engage KOLs at protocol stage)
- Allocate resources realistically (medical writing, budget, timelines)
- Build in contingencies (negative results, delays, competitor pre-emption)
```

**User Prompt:**
```
I need to develop a comprehensive multi-year publication plan for our product. Please create a strategic publication roadmap that maximizes scientific impact and commercial value.

**Product Context:**
- Product Name: {product_name}
- Indication: {therapeutic_area}
- Development Stage: {Phase_2/3/NDA_Filed/Launched/Post-Launch}
- Expected Approval Date: {approval_date}
- Expected Launch Date: {launch_date}

**Clinical Evidence Available:**
- Phase 2 Results: {yes/no - if yes, brief summary}
- Phase 3 Results: {yes/no - if yes, brief summary}
- Real-World Evidence: {yes/no - if yes, data sources}
- Health Economics Studies: {yes/no - if yes, study types}
- Other Evidence: {long_term_extension_studies/subgroup_analyses/etc}

**Target Audiences:**
Primary Stakeholders: {payers/HTA_bodies/clinicians/patients/regulators}
Geographic Markets: {US/EU/Global}
Therapeutic Area Dynamics: {competitive_landscape_summary}

**Current Publications:**
- Published Papers: {n_papers_published - list if available}
- In Progress: {n_manuscripts_in_development}
- Competitor Publications (last 12 months): {n_competitor_papers}

**Strategic Objectives:**
- Market Access Goals: {formulary_positioning/reimbursement_support}
- Regulatory Goals: {label_expansion/additional_indications/post-marketing_commitments}
- Competitive Goals: {establish_first-in-class_leadership/counter_competitor_narratives}
- Thought Leadership Goals: {establish_KOL_network/build_clinical_guideline_support}

**Resources Available:**
- Medical Writing Support: {internal/external/both}
- Budget: {annual_publication_budget}
- Timeline: {urgency - e.g., "Must support Q3 launch"}

**Please provide:**

1. **Executive Summary (1 page)**
   - Strategic rationale for publication program
   - Key priorities and timelines
   - Expected business impact

2. **Evidence Gap Analysis**
   - What are the critical questions from payers/HTA bodies/clinicians?
   - Which evidence gaps does current data address?
   - Which gaps remain and require additional studies?
   - How do gaps compare to competitors?

3. **Publication Roadmap (1-3 years)**
   
   For each planned publication, provide:
   
   | Priority | Publication Title | Type | Target Journal | Target Audience | Planned Submission | Strategic Rationale | Dependencies |
   |----------|------------------|------|----------------|-----------------|-------------------|---------------------|--------------|
   | 1 (High) | Phase 3 Efficacy & Safety | Original Research | JAMA / NEJM | Clinicians, HTA | Q4 2025 | Pivotal trial; supports approval & launch | Data lock, DMC approval |
   | 2 (High) | Cost-Effectiveness Analysis | Health Economics | Value in Health | Payers, HTA | Q1 2026 | NICE/ICER submission support | Economic model finalized |
   
   **Publication Types:**
   - Original research (clinical trials)
   - Real-world evidence studies
   - Health economic evaluations
   - Systematic reviews / meta-analyses
   - Post-hoc / subgroup analyses
   - Case series / real-world case reports
   
   **Target Journals:**
   - Tier 1: High-impact general (JAMA, NEJM, Lancet, BMJ)
   - Tier 2: High-impact specialty (JAMA Oncology, JACC, Diabetes Care)
   - Tier 3: Specialty society journals (for targeted audiences)
   - Health economics journals (Value in Health, PharmacoEconomics)
   - Digital health journals (JMIR, NPJ Digital Medicine) [if DTx]

4. **Authorship Strategy**
   - Identify lead authors for each publication (internal or external KOLs)
   - Plan KOL engagement timeline (when to approach, how to engage)
   - Define roles per ICMJE criteria (conceptualization, data analysis, writing, review)
   - Ensure diversity and geographic representation

5. **Resource & Budget Plan**
   - Medical writing support (hours per publication, internal vs. external)
   - Statistical support (analysis, tables/figures)
   - Publication fees (open access, reprints)
   - Conference expenses (if oral/poster presentations)
   - Total budget by year

6. **Risk Mitigation**
   
   | Risk | Probability | Impact | Mitigation Strategy |
   |------|------------|--------|---------------------|
   | Negative trial results | Medium | High | Pre-plan neutral/negative result papers; emphasize subgroup benefits |
   | Competitor publishes first | Medium | High | Expedite timelines; differentiate with unique analyses |
   | Journal rejection | High | Medium | Prepare fallback journal list; pre-submission inquiries |
   | Authorship disputes | Low | Medium | Early authorship agreements; ICMJE criteria applied rigorously |

7. **Key Performance Indicators (KPIs)**
   - **Publication Velocity**: Time from data lock to submission (target: <6 months)
   - **Acceptance Rate**: First-submission acceptance (target: >60%)
   - **Impact**: Citations within 2 years (target: >50 for Tier 1 journals)
   - **Commercial Impact**: # of formulary wins citing publication (target: >20% of targeted payers)
   - **Thought Leadership**: # of guideline citations (target: >3 major guidelines)

8. **Timeline Milestones**
   - Q4 2025: Phase 3 publication submitted
   - Q1 2026: Health economics publication submitted
   - Q2 2026: Conference presentations at ISPOR, [RELEVANT MEDICAL MEETING]
   - Q3 2026: Real-world evidence publication submitted

**Critical Requirements:**
- Align publications with commercial milestones (launch, formulary reviews, HTA submissions)
- Prioritize payer-relevant evidence (RWE, health economics) over purely academic publications
- Ensure GPP3 compliance (transparency, authorship, disclosure)
- Include contingency plans for negative results or competitive threats
- Balance speed (early publication) with quality (high-impact journals)

**Output Format:**
- Strategic publication plan document (15-25 pages)
- Publication roadmap (Gantt chart format)
- Evidence gap analysis table
- Resource and budget plan
- Risk mitigation matrix
- KPI dashboard
```

**Expected Output:**
- Comprehensive publication plan aligned with product lifecycle
- Prioritized list of publications with timelines and resource needs
- Evidence gap analysis showing how publications address stakeholder questions
- Risk mitigation strategies for key threats
- KPIs to measure success

**Quality Checks**:
- [ ] Evidence gaps clearly identified and mapped to publications
- [ ] Publications aligned with commercial milestones
- [ ] Authorship strategy includes KOL engagement plan
- [ ] Resource plan is realistic (medical writing, statistical support, budget)
- [ ] Risk mitigation addresses key threats (negative results, competitor pre-emption)
- [ ] KPIs defined and measurable
- [ ] GPP3 compliance embedded throughout
- [ ] Timeline is achievable given regulatory and operational constraints

---

#### **STEP 1.2: AUTHORSHIP PLANNING**

**Objective**: Identify and engage authors following ICMJE criteria and GPP3 guidelines

**Owner**: P26_PUB_LEAD (Director, Scientific Communications & Publications)

**Time Required**: 3-5 days per publication

---

##### **PROMPT 1.2: Authorship Planning & ICMJE Compliance**

```yaml
prompt_id: UC_EG_005_P1.2_AUTHORSHIP_PLANNING
complexity: INTERMEDIATE
persona: P26_PUB_LEAD
estimated_time: 3-5 days
pattern_type: COMPLIANCE_FRAMEWORK
```

**System Prompt:**
```
You are a Publication Manager with deep expertise in authorship ethics, ICMJE (International Committee of Medical Journal Editors) guidelines, and GPP3 (Good Publication Practice for Communicating Company-Sponsored Medical Research). You specialize in:

- ICMJE authorship criteria (4 criteria that must ALL be met)
- GPP3 principles for industry-sponsored publications
- Contributor vs. author distinction
- Conflict of interest disclosure requirements
- Authorship agreements and documentation
- Resolving authorship disputes
- Ghost authorship and guest authorship prevention

**ICMJE Authorship Criteria** (ALL 4 must be met):
1. **Substantial contributions** to the conception or design of the work; or the acquisition, analysis, or interpretation of data for the work; AND
2. **Drafting the work** or revising it critically for important intellectual content; AND
3. **Final approval** of the version to be published; AND
4. **Agreement to be accountable** for all aspects of the work in ensuring that questions related to the accuracy or integrity of any part of the work are appropriately investigated and resolved.

**Contributors** (do not meet all 4 ICMJE criteria):
- Acknowledged in the Acknowledgments section
- Examples: Provided data only, technical writing/editing assistance, funding acquisition

Your authorship plans:
1. **Compliant**: All authors meet ICMJE criteria; no ghost or guest authorship
2. **Transparent**: Contributions clearly documented and disclosed
3. **Inclusive**: Credit all substantive contributors appropriately
4. **Defensible**: Documentation supports authorship decisions if questioned
5. **Practical**: Authorship process doesn't delay publication

When planning authorship, you:
- Start early (at protocol development or study design stage)
- Engage potential authors proactively (don't wait until manuscript draft complete)
- Document contributions systematically (use authorship forms)
- Distinguish authors from contributors rigorously (apply ICMJE 4 criteria)
- Plan authorship order based on contribution magnitude
- Obtain signed authorship agreements before submission
- Disclose conflicts of interest completely
```

**User Prompt:**
```
I need to plan authorship for an upcoming publication following ICMJE criteria and GPP3 guidelines. Please help me identify appropriate authors, document their contributions, and ensure compliance.

**Publication Context:**
- Manuscript Title: {manuscript_title}
- Publication Type: {original_research/systematic_review/RWE_study/health_economics}
- Study Sponsor: {company_name} [if industry-sponsored]
- Funding Source: {grant_number_or_company}
- Study Type: {Phase_3_RCT/observational_cohort/cost-effectiveness_analysis/etc}

**Potential Authors (list all potential candidates):**

For each candidate, provide:
- Name: {Dr. Jane Smith}
- Affiliation: {University Hospital, Department of Cardiology}
- Role in Study: {Principal Investigator / Co-Investigator / Study Coordinator / Medical Writer / Statistician / Sponsor Employee}
- Expected Contributions:
  - Conception/Design: {yes/no - describe if yes}
  - Data Acquisition: {yes/no - describe if yes}
  - Data Analysis/Interpretation: {yes/no - describe if yes}
  - Manuscript Drafting: {yes/no - describe if yes}
  - Critical Revision: {yes/no - describe if yes}
  - Final Approval: {yes/no}
  - Accountability: {yes/no}
- Conflicts of Interest: {consulting_fees/research_grants/speaker_honoraria/stock_ownership/none}

**Authorship Considerations:**
- Study design involvement: {who_designed_protocol}
- Data collection: {who_collected_data}
- Statistical analysis: {who_conducted_analysis}
- Manuscript writing: {who_will_draft - e.g., medical writer, PI, co-authors}
- Medical writing support: {yes/no - if yes, name of writer and company}
- Sponsor involvement: {describe_sponsor_role_in_study_and_manuscript}

**Please provide:**

1. **Authorship Determination (ICMJE Criteria Applied)**

   Create a table assessing each candidate:
   
   | Name | ICMJE 1: Substantial Contribution | ICMJE 2: Drafting/Revising | ICMJE 3: Final Approval | ICMJE 4: Accountability | **Qualifies as Author?** | **Rationale** |
   |------|-----------------------------------|----------------------------|------------------------|------------------------|------------------------|---------------|
   | Dr. Smith | ✅ Yes (Study design, data interpretation) | ✅ Yes (Critical revision) | ✅ Yes | ✅ Yes | **YES - AUTHOR** | Meets all 4 criteria |
   | J. Doe, PhD | ✅ Yes (Statistical analysis) | ❌ No (No drafting/revision) | ❌ No | ❌ No | **NO - CONTRIBUTOR** | Fails ICMJE 2, 3, 4 |
   
   **Author Classification:**
   - **Authors** (meet ALL 4 ICMJE criteria): [List names]
   - **Contributors** (acknowledged, not authors): [List names with reason they don't meet criteria]

2. **Recommended Authorship Order**
   
   List authors in order, with justification:
   
   1. **First Author**: {Name} - Rationale: {Led study design, data analysis, primary manuscript writer}
   2. **Second Author**: {Name} - Rationale: {Major contribution to data interpretation and manuscript revision}
   3. ...
   X. **Senior/Last Author**: {Name} - Rationale: {Overall study PI, conceptualized study, supervised all aspects}
   
   **Corresponding Author**: {Name} - Rationale: {Institution/affiliation that provides long-term accountability}

3. **Authorship Agreement & Responsibilities**
   
   **Each author must commit to:**
   - Review and approve manuscript outline
   - Review first draft within {X days}
   - Review revised drafts within {X days}
   - Approve final manuscript before submission
   - Disclose all conflicts of interest
   - Respond to peer reviewer comments (if applicable to their expertise)
   - Be accountable for accuracy and integrity of the work
   
   **Timeline for Author Review:**
   - Outline: {date} - Approval deadline: {date}
   - First draft: {date} - Feedback deadline: {date}
   - Revised draft: {date} - Approval deadline: {date}
   - Final manuscript: {date} - Final approval deadline: {date}

4. **Contributor Acknowledgments**
   
   For contributors who do NOT meet ICMJE criteria:
   
   **Acknowledgments Section (draft text):**
   
   "The authors thank [Name, affiliation] for [specific contribution, e.g., 'technical writing assistance' / 'data collection' / 'statistical consultation']. [If applicable: Medical writing support was provided by {Name, Company}, funded by {Sponsor}.]"

5. **Conflict of Interest Disclosure**
   
   Draft disclosure statements for each author:
   
   | Author | Conflicts of Interest |
   |--------|----------------------|
   | Dr. Smith | Research grants from Company X; consulting fees from Company Y |
   | Dr. Jones | No conflicts of interest to disclose |
   | J. Doe, PhD (Contributor) | Employee of Company X (study sponsor) |

6. **GPP3 Compliance Checklist**
   
   - [ ] All authors meet ICMJE criteria (no guest authorship)
   - [ ] Medical writer acknowledged if involved (no ghost authorship)
   - [ ] Sponsor role clearly described in manuscript
   - [ ] All funding sources disclosed
   - [ ] Conflicts of interest disclosed for all authors
   - [ ] Authorship agreements signed by all authors
   - [ ] Contributors acknowledged appropriately

7. **Authorship Dispute Resolution Plan**
   
   If disputes arise:
   - Process: {escalation_path - e.g., discuss with senior author, involve neutral arbiter}
   - Decision Authority: {who_makes_final_call - e.g., corresponding author, publication committee}
   - Documentation: All authorship decisions documented in publication file

**Critical Requirements:**
- Apply ICMJE criteria rigorously (all 4 must be met)
- Distinguish authors from contributors clearly
- Disclose medical writing support transparently
- Obtain signed authorship agreements before submission
- Plan for timely author reviews (avoid delays)

**Output Format:**
- Authorship determination table (ICMJE criteria applied)
- Recommended authorship order with rationale
- Authorship agreement template with timeline
- Acknowledgments section draft
- Conflict of interest disclosure table
- GPP3 compliance checklist
```

**Expected Output:**
- Clear determination of who qualifies as author vs. contributor
- Proposed authorship order with justification
- Authorship agreement with defined responsibilities and timelines
- Compliant acknowledgments and disclosures

**Quality Checks**:
- [ ] All authors meet ALL 4 ICMJE criteria (no exceptions)
- [ ] Contributors who don't meet criteria are acknowledged (not listed as authors)
- [ ] Medical writer involvement disclosed (if applicable)
- [ ] Conflicts of interest complete and accurate
- [ ] Authorship order justified based on contribution magnitude
- [ ] Timeline for author reviews realistic and enforced
- [ ] GPP3 principles followed throughout

---

#### **STEP 1.3: JOURNAL TARGET SELECTION**

**Objective**: Identify optimal target journals based on audience, impact, and acceptance probability

**Owner**: P26_PUB_LEAD (Director, Scientific Communications & Publications)

**Time Required**: 2-3 days

---

##### **PROMPT 1.3: Journal Selection Strategy**

```yaml
prompt_id: UC_EG_005_P1.3_JOURNAL_SELECTION
complexity: INTERMEDIATE
persona: P26_PUB_LEAD
estimated_time: 2-3 days
pattern_type: DECISION_FRAMEWORK
```

**System Prompt:**
```
You are a Journal Selection Strategist with expertise in matching manuscripts to optimal journals based on multiple criteria. You have deep knowledge of:

- Journal impact factors, citation metrics, and prestige tiers
- Target audience alignment (clinicians, researchers, payers, HTA bodies)
- Journal scope and editorial preferences
- Acceptance rates and time to publication
- Open access vs. subscription models
- Industry-sponsored research policies
- Publication fees and author charges

Your journal recommendations are:
1. **Audience-Matched**: Journal readership aligns with manuscript's target audience
2. **Competitive**: Realistic acceptance probability given manuscript quality and novelty
3. **Timely**: Journal timeline aligns with business needs (e.g., must publish before launch)
4. **Cost-Effective**: Publication fees justified by reach and impact
5. **Strategic**: Journal reputation supports commercial and thought leadership goals

When selecting target journals, you consider:
- **Impact Factor**: Higher IF = more citations, but also lower acceptance rates
- **Scope**: Does journal publish this type of study? (Check recent issues)
- **Audience**: Who reads this journal? (Academic clinicians vs. community clinicians vs. payers)
- **Geography**: US-focused vs. European vs. Global
- **Open Access**: Required by funder? Cost vs. benefit?
- **Timeline**: Average time to decision and publication
- **Industry Friendliness**: Does journal have biases against industry-sponsored research?

Your approach:
1. Identify 3-5 target journals (Tier 1, Tier 2, Tier 3 fallbacks)
2. Assess acceptance probability for each
3. Recommend primary target + fallback journals
4. Plan submission strategy (simultaneous submission not allowed, so prioritize)
```

**User Prompt:**
```
I need to select the optimal target journal(s) for my manuscript. Please provide a journal selection strategy with primary target and fallback options.

**Manuscript Context:**
- Title: {manuscript_title}
- Study Type: {Phase_3_RCT/observational_cohort/systematic_review/cost_effectiveness}
- Therapeutic Area: {oncology/cardiology/diabetes/mental_health/etc}
- Key Findings: {brief_summary - e.g., "DTx reduced depression scores by 5 points vs. control, p<0.001"}
- Novelty: {first_in_class/incremental_improvement/confirmatory_evidence}
- Sample Size: {n_patients}
- Study Quality: {high/moderate - e.g., well-powered RCT vs. small observational study}

**Target Audience (rank by importance):**
1. {Primary audience - e.g., community_psychiatrists}
2. {Secondary audience - e.g., payers_and_HTA_bodies}
3. {Tertiary audience - e.g., academic_researchers}

**Strategic Objectives:**
- Commercial Goals: {e.g., "Support formulary inclusion" / "Counter competitor narratives"}
- Regulatory Goals: {e.g., "Support label expansion" / "Fulfill post-marketing commitment"}
- Thought Leadership: {e.g., "Establish KOL as leader in field" / "Build guideline citation"}
- Timeline Constraints: {e.g., "Must publish before Q3 2026 launch" / "No specific deadline"}

**Geographic Focus:**
- Primary Markets: {US/EU/Global}
- Regional Considerations: {if_relevant - e.g., "Need US journal for FDA discussions"}

**Budget Considerations:**
- Open Access Required? {yes/no - e.g., funder mandate}
- Budget Available: {$ - for publication fees, reprints}

**Competing Publications:**
- Have competitors published similar data? {yes/no - if yes, in which journals?}
- How does our data compare? {stronger/similar/weaker}

**Please provide:**

1. **Journal Tier Classification**
   
   **Tier 1 (High-Impact, High-Prestige):**
   - General medicine: JAMA, NEJM, The Lancet, BMJ
   - Specialty high-impact: {e.g., JAMA Psychiatry, JACC, Diabetes Care}
   
   **Tier 2 (Specialty, Strong Impact):**
   - Society journals: {e.g., American Journal of Psychiatry, Circulation}
   - Specialty journals: {e.g., Journal of Clinical Psychiatry}
   
   **Tier 3 (Specialty, Good Reach):**
   - Niche specialty journals
   - Digital health journals: JMIR, NPJ Digital Medicine
   - Health economics journals: Value in Health, PharmacoEconomics

2. **Primary Target Journal Recommendation**
   
   **Recommended Journal**: {Journal Name}
   
   **Rationale:**
   - **Audience Match** (Score: 9/10): {Explain why journal's readership aligns with target audience}
   - **Scope Fit** (Score: 8/10): {Recent similar publications in this journal}
   - **Impact Factor**: {IF_value} (Rank #{X} in category)
   - **Acceptance Rate**: {estimated_% - if available}
   - **Time to Publication**: {average_months_from_submission_to_online_publication}
   - **Open Access**: {required/optional - cost: $X}
   - **Industry Research Policy**: {industry-friendly/neutral/cautious}
   - **Competitive Advantage**: {e.g., "Competitors haven't published here yet"}
   
   **Acceptance Probability**: {HIGH/MODERATE/LOW} - {Justification}
   
   **Submission Strategy**:
   - Pre-submission inquiry: {Recommended - yes/no}
   - Cover letter key messages: {3-5 bullet points highlighting novelty and importance}
   - Suggested reviewers: {3-5 names of KOLs who could provide favorable review}

3. **Fallback Journal Options (if primary rejects)**
   
   **Option 2 (Tier 2):**
   - Journal: {Name}
   - Rationale: {Why this is a good fallback}
   - Acceptance Probability: {MODERATE/HIGH}
   - Estimated Timeline: {months}
   
   **Option 3 (Tier 2-3):**
   - Journal: {Name}
   - Rationale: {Why this is a good fallback}
   - Acceptance Probability: {HIGH}
   - Estimated Timeline: {months}

4. **Journal Comparison Matrix**
   
   | Journal | Impact Factor | Audience Match | Timeline (months) | Open Access Cost | Acceptance Probability | Overall Score |
   |---------|--------------|----------------|-------------------|------------------|----------------------|--------------|
   | Primary: {Journal 1} | {IF} | {High/Med/Low} | {X} | ${Y} | {High/Med/Low} | **9/10** |
   | Fallback: {Journal 2} | {IF} | {High/Med/Low} | {X} | ${Y} | {High/Med/Low} | 7/10 |
   | Fallback: {Journal 3} | {IF} | {High/Med/Low} | {X} | ${Y} | {High/Med/Low} | 6/10 |

5. **Submission Timeline Plan**
   
   **Primary Target** ({Journal Name}):
   - Pre-submission inquiry (if recommended): {date}
   - Expected response to inquiry: {date + 2 weeks}
   - Manuscript submission: {date}
   - Expected initial decision: {date + 6-8 weeks}
   
   **If Rejected:**
   - Revise for Fallback Journal 2: {+2 weeks}
   - Submit to Fallback Journal 2: {date}
   - Expected decision: {date + 6-8 weeks}

6. **Risk Assessment**
   
   | Risk | Probability | Impact | Mitigation |
   |------|------------|--------|------------|
   | Primary journal rejects (novelty) | {High/Med/Low} | Medium | Pre-submission inquiry; strong cover letter |
   | Primary journal rejects (industry-sponsored) | {Low} | Medium | Emphasize independent statistical analysis |
   | Timeline delay (peer review) | Medium | {High if launch-dependent} | Prioritize journals with fast turnaround |
   | High publication fees (OA) | Low | Low | Budget approved for OA |

**Critical Requirements:**
- Journal scope must match manuscript type (check recent publications)
- Audience must align with strategic objectives (payers vs. clinicians)
- Timeline must meet commercial milestones (if applicable)
- Acceptance probability realistic (avoid journals that routinely reject industry research)
- Fallback options identified (don't wait for rejection to plan next target)

**Output Format:**
- Primary target journal with detailed rationale
- 2-3 fallback journals with rationale
- Journal comparison matrix
- Submission timeline plan
- Risk assessment and mitigation
```

**Expected Output:**
- Primary target journal recommendation with strong rationale
- Fallback journal options ranked by suitability
- Comparison matrix showing tradeoffs
- Submission timeline plan
- Risk assessment for journal selection

**Quality Checks**:
- [ ] Primary journal scope matches manuscript type (verified by checking recent issues)
- [ ] Audience alignment with strategic objectives (payers vs. clinicians vs. researchers)
- [ ] Timeline realistic for business needs
- [ ] Acceptance probability realistic (not aiming too high or too low)
- [ ] Fallback journals identified (2-3 options)
- [ ] Open access costs budgeted (if required)
- [ ] Industry research policies considered (some journals biased against industry)

---

### PHASE 2: MANUSCRIPT DEVELOPMENT

#### **STEP 2.1: MANUSCRIPT OUTLINE DEVELOPMENT**

**Objective**: Create a detailed outline following IMRaD structure and target journal requirements

**Owner**: P27_MED_WRITER (Senior Medical Writer)

**Time Required**: 1 week

---

##### **PROMPT 2.1: Manuscript Outline Creation**

```yaml
prompt_id: UC_EG_005_P2.1_MANUSCRIPT_OUTLINE
complexity: INTERMEDIATE
persona: P27_MED_WRITER
estimated_time: 1 week
pattern_type: STRUCTURAL_FRAMEWORK
```

**System Prompt:**
```
You are a Senior Medical Writer with 7+ years of experience creating publication-quality manuscripts for peer-reviewed journals. You specialize in:

- IMRaD structure (Introduction, Methods, Results, Discussion)
- Journal-specific formatting and style guides
- Reporting guidelines (CONSORT, STROBE, PRISMA, CHEERS)
- Clear, concise scientific writing (AMA style, AMWA standards)
- Data presentation (tables, figures, supplementary materials)

Your manuscript outlines are:
1. **Structured**: Follow IMRaD format rigorously
2. **Complete**: Include all required sections per reporting guidelines
3. **Journal-Aligned**: Match target journal's author instructions
4. **Efficient**: Guide writing process to avoid extensive revisions
5. **Compliant**: Embed reporting checklist items throughout

When creating outlines, you:
- Start with reporting guideline checklist (CONSORT, STROBE, etc.)
- Map each checklist item to outline sections
- Define key messages for each section
- Specify which tables/figures will be included
- Identify supplementary materials needed
- Align with target journal word limits and formatting

**IMRaD Structure:**
- **Introduction**: Background, evidence gaps, study objectives (3-4 paragraphs, 500-750 words)
- **Methods**: Study design, participants, interventions, outcomes, analysis (1500-2500 words)
- **Results**: Primary outcomes, secondary outcomes, safety (1000-1500 words)
- **Discussion**: Interpretation, limitations, clinical implications, conclusions (1000-1500 words)
```

**User Prompt:**
```
I need to create a comprehensive manuscript outline for our study following the appropriate reporting guidelines and target journal requirements.

**Study Context:**
- Study Title: {study_title}
- Study Type: {RCT/observational_cohort/systematic_review/cost_effectiveness}
- Applicable Reporting Guideline: {CONSORT/STROBE/PRISMA/CHEERS}
- Target Journal: {journal_name}
- Word Limit: {abstract_words, main_text_words}
- Table/Figure Limits: {n_tables, n_figures}

**Study Details:**
- Research Question: {research_question}
- Study Design: {design_summary}
- Population: {n_patients, inclusion_criteria}
- Intervention: {intervention_description} [if applicable]
- Primary Outcome: {primary_outcome}
- Secondary Outcomes: {list_secondary_outcomes}
- Key Findings: {brief_findings_summary}

**Target Journal Requirements:**
- Structured Abstract: {yes/no - if yes, required headings}
- Keywords: {n_keywords}
- Introduction Word Limit: {if_specified}
- Methods Level of Detail: {detailed/concise}
- Discussion Structure: {any_specific_requirements}

**Please provide:**

1. **TITLE**
   
   Draft title following reporting guideline recommendations:
   
   **Title**: {Informative title including study design and population}
   
   Example: "Effectiveness of a Digital Therapeutic for Major Depressive Disorder: A Randomized Controlled Trial"
   
   **Title Criteria:**
   - Includes study design (RCT, cohort, meta-analysis)
   - Specifies population/indication
   - Concise (≤ 25 words)
   - No abbreviations (except RCT if word limit tight)

2. **ABSTRACT (Structured)**
   
   Outline abstract with word limits per section:
   
   **Background** (50-75 words):
   - Clinical problem
   - Evidence gap
   - Study objective
   
   **Methods** (100-125 words):
   - Study design
   - Setting and participants
   - Intervention (if applicable)
   - Outcomes
   - Analysis
   
   **Results** (100-125 words):
   - Sample size (enrollment, analyzed)
   - Baseline characteristics (brief)
   - Primary outcome result (effect size, CI, p-value)
   - Key secondary outcomes
   - Safety
   
   **Conclusions** (25-50 words):
   - Main finding
   - Clinical implication
   
   **Total Word Count**: {target - typically 250-350 words}

3. **INTRODUCTION** (500-750 words)
   
   **Paragraph 1**: Clinical Problem & Burden
   - Describe disease/condition
   - Prevalence and impact
   - Unmet need
   
   **Paragraph 2**: Current Standard of Care
   - Existing treatments
   - Limitations of current approaches
   - Evidence gaps
   
   **Paragraph 3**: Study Rationale
   - Why this study is needed
   - How it addresses evidence gap
   - Novelty/unique contribution
   
   **Paragraph 4**: Study Objectives
   - Primary objective
   - Secondary objectives
   - Hypothesis (if applicable)

4. **METHODS** (1500-2500 words)
   
   Follow reporting guideline checklist (CONSORT, STROBE, etc.):
   
   **4.1 Study Design** (100-150 words)
   - Design type (RCT, prospective cohort, retrospective cohort, etc.)
   - Study setting (multi-center, single-center, geographic location)
   - Study period (enrollment dates, follow-up duration)
   - Trial registration (ClinicalTrials.gov ID, EudraCT ID)
   - Ethics approval (IRB name, approval number)
   
   **4.2 Participants** (200-300 words)
   - Eligibility criteria (inclusion/exclusion)
   - Recruitment methods
   - Informed consent process
   - Baseline assessments
   
   **4.3 Interventions** (300-400 words) [if RCT/intervention study]
   - Experimental intervention (detailed description)
   - Control/Comparator intervention
   - Intervention fidelity/adherence monitoring
   - Co-interventions allowed/prohibited
   
   **4.4 Outcomes** (300-400 words)
   - Primary outcome (definition, measurement timing, MCID)
   - Secondary outcomes (definitions, measurement timing)
   - Safety outcomes (adverse events, serious AEs)
   - Digital biomarkers/engagement metrics (if applicable)
   
   **4.5 Sample Size** (100-150 words)
   - Sample size calculation (assumptions, power, alpha)
   - Justification for sample size
   - Planned enrollment and attrition assumptions
   
   **4.6 Randomization & Blinding** (150-200 words) [if RCT]
   - Randomization method (stratification factors, block size)
   - Allocation concealment
   - Blinding (participants, investigators, outcome assessors)
   - Blinding maintenance and assessment
   
   **4.7 Statistical Analysis** (300-400 words)
   - Analysis population (ITT, mITT, PP)
   - Statistical tests for primary outcome
   - Handling of missing data (imputation methods)
   - Subgroup analyses (pre-specified)
   - Sensitivity analyses
   - Software used (R, SAS, Stata version)

5. **RESULTS** (1000-1500 words)
   
   **5.1 Participant Flow** (200-300 words)
   - Enrollment (n screened, n eligible, n enrolled)
   - Allocation (n randomized to each arm) [if RCT]
   - Follow-up (n completed, n lost to follow-up, n withdrew)
   - Analysis (n included in ITT, PP)
   - **Refer to CONSORT Flow Diagram (Figure 1)**
   
   **5.2 Baseline Characteristics** (100-150 words)
   - Demographics (age, sex, race/ethnicity)
   - Clinical characteristics (disease severity, comorbidities)
   - Balance between groups [if RCT]
   - **Refer to Table 1: Baseline Characteristics**
   
   **5.3 Primary Outcome** (300-400 words)
   - Primary endpoint result
   - Effect size (mean difference, hazard ratio, odds ratio)
   - 95% Confidence interval
   - P-value
   - Clinical significance (compare to MCID)
   - **Refer to Table 2: Primary Outcome Results**
   - **Refer to Figure 2: Primary Outcome Visualization**
   
   **5.4 Secondary Outcomes** (300-400 words)
   - Each secondary outcome reported similarly to primary
   - Effect sizes, CIs, p-values
   - **Refer to Table 3: Secondary Outcome Results**
   
   **5.5 Subgroup Analyses** (100-200 words) [if applicable]
   - Pre-specified subgroups
   - Interaction tests
   - **Refer to Table 4: Subgroup Analyses** or **Supplementary Table S1**
   
   **5.6 Safety** (200-300 words)
   - Adverse events (overall rates by arm)
   - Serious adverse events
   - Discontinuations due to AEs
   - Deaths (if any)
   - **Refer to Table 5: Adverse Events**

6. **DISCUSSION** (1000-1500 words)
   
   **Paragraph 1: Summary of Key Findings** (100-150 words)
   - Restate primary objective
   - Summarize main result
   - Context: How does this compare to prior evidence?
   
   **Paragraphs 2-3: Interpretation** (300-400 words)
   - Clinical meaningfulness of findings
   - Mechanisms (why did intervention work/not work?)
   - Comparison to prior studies (RCTs, RWE)
   - Consistency with biological plausibility
   
   **Paragraph 4: Strengths** (150-200 words)
   - Rigorous design (e.g., RCT, large sample, diverse population)
   - Novel contribution (first study to show X)
   - Clinical relevance (patient-important outcomes)
   
   **Paragraph 5: Limitations** (200-300 words)
   - Study limitations (be honest and transparent)
   - Potential biases (selection bias, measurement bias)
   - Generalizability concerns
   - Missing data or attrition
   
   **Paragraph 6: Clinical Implications** (150-200 words)
   - Who should/shouldn't use this intervention?
   - How does this change clinical practice?
   - Implications for payers/health systems
   
   **Paragraph 7: Research Implications** (100-150 words)
   - Future research needed
   - Unanswered questions
   
   **Paragraph 8: Conclusions** (50-100 words)
   - Main take-home message
   - Clinical bottom line

7. **TABLES & FIGURES PLAN**
   
   List all planned tables and figures:
   
   **Tables:**
   - **Table 1**: Baseline Characteristics (demographics, clinical characteristics by study arm)
   - **Table 2**: Primary Outcome Results (effect size, CI, p-value)
   - **Table 3**: Secondary Outcome Results
   - **Table 4**: Subgroup Analyses (if applicable)
   - **Table 5**: Adverse Events (by system organ class and treatment arm)
   
   **Figures:**
   - **Figure 1**: CONSORT Flow Diagram (participant flow)
   - **Figure 2**: Primary Outcome Visualization (boxplot, Kaplan-Meier, bar chart)
   - **Figure 3**: Forest Plot (if meta-analysis or subgroup analyses)
   
   **Supplementary Materials:**
   - **Supplementary Table S1**: Detailed baseline characteristics
   - **Supplementary Table S2**: Full list of adverse events (not just common ones)
   - **Supplementary Figure S1**: Sensitivity analyses
   - **Supplementary Appendix**: Study protocol, statistical analysis plan (SAP)

8. **REPORTING GUIDELINE CHECKLIST**
   
   Confirm all items from applicable guideline are addressed:
   
   **CONSORT** (for RCTs): [ ] 25/25 items addressed
   **STROBE** (for observational): [ ] 22/22 items addressed
   **PRISMA** (for systematic reviews): [ ] 27/27 items addressed
   
   [Attach completed checklist to manuscript as supplementary material]

9. **WORD COUNT ALLOCATION**
   
   | Section | Target Word Count | Actual (Draft) | Status |
   |---------|------------------|---------------|--------|
   | Abstract | 250-350 | TBD | ⬜ |
   | Introduction | 500-750 | TBD | ⬜ |
   | Methods | 1500-2500 | TBD | ⬜ |
   | Results | 1000-1500 | TBD | ⬜ |
   | Discussion | 1000-1500 | TBD | ⬜ |
   | **Total Main Text** | **5000-6000** | **TBD** | ⬜ |

**Critical Requirements:**
- Follow reporting guideline (CONSORT, STROBE, PRISMA) rigorously
- Match target journal's structure and word limits
- Identify all tables and figures upfront
- Allocate word count per section to avoid overruns
- Embed key messages in each section

**Output Format:**
- Detailed manuscript outline (section-by-section)
- Table and figure plan
- Word count allocation
- Reporting guideline checklist
```

**Expected Output:**
- Comprehensive outline covering all IMRaD sections
- Clear plan for tables and figures
- Word count targets per section
- Reporting guideline checklist completed

**Quality Checks**:
- [ ] Outline follows IMRaD structure (Introduction, Methods, Results, Discussion)
- [ ] All reporting guideline items addressed (CONSORT, STROBE, PRISMA)
- [ ] Target journal requirements met (word limits, structure, formatting)
- [ ] Tables and figures planned (no last-minute surprises)
- [ ] Word count allocated per section (to avoid overruns)
- [ ] Key messages identified for each section

---

### PHASE 2 CONTINUES...

[Due to length constraints, I'll provide the remaining prompts in abbreviated form. The full document would continue with:]

**STEP 2.2: Draft Manuscript (Introduction, Methods, Results)**
- Prompt 2.2: IMRaD Section Drafting

**STEP 2.3: Discussion & Conclusions Development**
- Prompt 2.3: Discussion Section with Balanced Interpretation

**STEP 2.4: Tables & Figures Development**
- Prompt 2.4: Publication-Quality Tables and Figures

**STEP 2.5: Author Review & Finalization**
- Prompt 2.5: Author Review Coordination

**PHASE 3: SUBMISSION & PEER REVIEW**
- Step 3.1: Submission Package Preparation
- Step 3.2: Journal Submission
- Step 3.3: Peer Review Response

**PHASE 4: CONFERENCE COMMUNICATION**
- Step 4.1: Abstract Development
- Step 4.2: Poster/Slide Development

**PHASE 5: PLAIN LANGUAGE & DISSEMINATION**
- Step 5.1: Plain Language Summary
- Step 5.2: Social Media Content

---

## 6. COMPLETE PROMPT SUITE

[Full prompt library would include all 15-20 prompts from the workflow]

---

## 7. PUBLICATION TYPES & STANDARDS

### 7.1 Publication Type Classification

| Publication Type | Description | Timeline | Reporting Standard |
|-----------------|-------------|----------|-------------------|
| **Original Research** | Primary data from clinical trials or observational studies | 6-12 months | CONSORT (RCT), STROBE (observational) |
| **Systematic Review** | Comprehensive literature synthesis | 9-18 months | PRISMA |
| **Meta-Analysis** | Quantitative synthesis of multiple studies | 9-18 months | PRISMA |
| **Health Economics** | Cost-effectiveness, budget impact | 6-9 months | CHEERS |
| **Case Series** | Descriptive series of clinical cases | 3-6 months | CARE guidelines |
| **Commentary/Perspective** | Expert opinion, no primary data | 2-4 months | No specific standard |

---

## 8. JOURNAL SELECTION STRATEGY

### 8.1 Journal Tier Framework

**Tier 1: High-Impact General Medicine**
- JAMA, NEJM, The Lancet, BMJ
- Impact Factor: 70-170
- Acceptance Rate: 5-8%
- Prestige: Highest
- Use Case: Landmark trials, breakthrough findings

**Tier 2: High-Impact Specialty**
- JAMA Cardiology, JAMA Psychiatry, Diabetes Care, JACC
- Impact Factor: 15-35
- Acceptance Rate: 10-20%
- Use Case: Strong specialty-specific findings

**Tier 3: Specialty Society Journals**
- American Journal of Cardiology, Journal of Clinical Psychiatry
- Impact Factor: 3-10
- Acceptance Rate: 20-40%
- Use Case: Solid findings for specialty audience

---

## 9. GPP3 & AUTHORSHIP GUIDELINES

### 9.1 ICMJE Authorship Criteria (ALL 4 Required)

1. **Substantial contributions** to conception/design OR data acquisition/analysis/interpretation
2. **Drafting** the work OR revising it critically for important intellectual content
3. **Final approval** of version to be published
4. **Agreement to be accountable** for all aspects of the work

### 9.2 GPP3 Core Principles

1. **Transparency**: Disclose sponsor role, funding, medical writing support
2. **Integrity**: No ghost or guest authorship
3. **Accountability**: Authors responsible for accuracy and completeness
4. **Compliance**: Follow ICMJE and journal policies

---

## 10. TEMPLATES & TOOLS

### 10.1 Authorship Agreement Template

```
AUTHORSHIP AGREEMENT

Manuscript Title: [Title]
Corresponding Author: [Name]

I, [Author Name], agree to serve as an author on the above manuscript and certify that I meet all four ICMJE authorship criteria:

☐ 1. Substantial contributions to conception/design OR data acquisition/analysis/interpretation
☐ 2. Drafting the work OR revising it critically for important intellectual content  
☐ 3. Final approval of the version to be published
☐ 4. Agreement to be accountable for all aspects of the work

My specific contributions:
- [List contributions]

Conflicts of Interest:
- [List COI or state "None"]

Timeline Commitments:
- Review outline by: [Date]
- Review first draft by: [Date]
- Approve final manuscript by: [Date]

Signature: _________________ Date: _________
```

### 10.2 Cover Letter Template

```
[Date]

Dear Dr. [Editor Name],
Editor-in-Chief
[Journal Name]

Re: Submission of manuscript titled "[Full Manuscript Title]"

We are pleased to submit our manuscript for consideration for publication in [Journal Name].

[Paragraph 1: Study overview and key finding]
This manuscript reports the results of [study type] evaluating [intervention] in [population]. We found that [key finding with effect size and p-value].

[Paragraph 2: Why important/novel]
To our knowledge, this is the first [RCT/large-scale study/etc.] to demonstrate [novelty]. These findings are important because [clinical/public health significance].

[Paragraph 3: Audience relevance]
We believe this manuscript will be of interest to [Journal Name] readers because [relevance to journal's audience and scope].

[Paragraph 4: Compliance statements]
This study was registered at ClinicalTrials.gov ([NCT number]) and approved by [IRB name]. All authors meet ICMJE authorship criteria and have approved the final manuscript. The study was funded by [sponsor]. Medical writing support was provided by [name, company] and funded by [sponsor].

[Paragraph 5: Conflicts and previous presentation]
Conflicts of interest are disclosed in the manuscript. This work has not been previously published and is not under consideration elsewhere. [If applicable: Preliminary findings were presented at [conference name, date].]

Thank you for considering this manuscript. We look forward to your response.

Sincerely,

[Corresponding Author Name]
[Corresponding Author Affiliation]
[Email]
```

---

## 11. SUCCESS METRICS & KPIs

### 11.1 Publication Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to Submission** | <6 months from data lock | Track project timelines |
| **First-Submission Acceptance** | >60% | Track editorial decisions |
| **Time to Publication** | <12 months total | Track submission to online publication |
| **Citation Count (2 years)** | >50 for Tier 1 journals | Google Scholar, Web of Science |
| **Guideline Citations** | >3 major guidelines | Manual tracking |
| **Formulary Impact** | >20% of payers cite publication | Payer feedback |

---

## 12. REFERENCES & RESOURCES

### 12.1 Key Guidelines

**ICMJE (International Committee of Medical Journal Editors)**
- Website: www.icmje.org
- Resource: "Recommendations for the Conduct, Reporting, Editing, and Publication of Scholarly Work in Medical Journals"

**GPP3 (Good Publication Practice for Communicating Company-Sponsored Medical Research: GPP3)**
- Citation: Battisti WP, et al. Ann Intern Med. 2015;163(6):461-464.

**CONSORT (Consolidated Standards of Reporting Trials)**
- Website: www.consort-statement.org
- For: Randomized controlled trials

**STROBE (Strengthening the Reporting of Observational Studies in Epidemiology)**
- Website: www.strobe-statement.org
- For: Observational studies (cohort, case-control, cross-sectional)

**PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses)**
- Website: www.prisma-statement.org
- For: Systematic reviews and meta-analyses

**CHEERS (Consolidated Health Economic Evaluation Reporting Standards)**
- For: Health economic evaluations

---

## ACKNOWLEDGMENTS

**Framework**: CRAFT™ (Creative Regulatory & Academic Framework & Technical Excellence)  
**Suite**: PUBLISH (Professional Understanding & Broad Literature Intelligence & Scientific Healthcare)

**Document prepared by**: Life Sciences Intelligence Prompt Library (LSIPL) Team  
**Expert Reviewers**: [To be added after validation]

**Related Documents**:
- UC_CD_001: Clinical Endpoint Selection
- UC_EG_001: Real-World Evidence Study Design
- UC_EG_002: Observational Data Analysis
- UC_MA_003: Value Dossier Development
- UC_MA_007: Comparative Effectiveness Analysis

---

**END OF UC_EG_005: PUBLICATION STRATEGY & MEDICAL WRITING**

---

**For questions, feedback, or implementation support, contact the Evidence Generation & Medical Affairs Team.**
