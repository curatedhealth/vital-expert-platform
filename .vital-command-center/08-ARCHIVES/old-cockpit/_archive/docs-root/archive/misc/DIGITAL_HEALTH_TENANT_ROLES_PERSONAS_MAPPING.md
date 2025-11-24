# 🏥 DIGITAL HEALTH TENANT: COMPLETE ROLES & PERSONAS MAPPING

**Tenant ID:** `b8026534-02a7-4d24-bf4c-344591964e02`  
**Tenant Name:** Digital Health Startup  
**Tenant Slug:** `digital-health-startup`  
**Status:** `active`  
**Type:** `client`  
**Industry:** Digital Health  
**Subscription:** `standard` tier, `active` status

---

## 📊 **SUMMARY STATISTICS**

- **Total Roles (dh_role):** 15
  - All are `Human` type roles
  - Used for task assignments (Lead/Reviewer/Approver/Contributor)
  
- **Total Personas (dh_persona):** 35
  - All human organizational roles
  - Used for workflow oversight and task review/approval
  
- **Domains:** 5 (Clinical Development, Evidence Generation, Market Access, Product Development, Regulatory Affairs)
- **Use Cases:** 50
- **Workflows:** 116
- **Tasks:** 343

---

## 🔷 **ROLES (dh_role) - 15 Total**

Roles represent organizational positions that can be assigned to tasks. In this tenant, all roles are Human type.

### **Executive & Clinical Leadership**

| Code | Name | Unique ID | Department | Agent Type | Category |
|------|------|-----------|------------|------------|----------|
| P01_CMO | P01_CMO | AGT-P01-CMO | - | Human | HUMAN |
| P02_VPCLIN | P02_VPCLIN | AGT-P02-VPCLIN | - | Human | HUMAN |
| P03_CLTM | P03_CLTM | AGT-P03-CLTM | - | Human | HUMAN |

### **Regulatory Affairs**

| Code | Name | Unique ID | Department | Agent Type | Category |
|------|------|-----------|------------|------------|----------|
| P04_REGDIR | P04_REGDIR | AGT-P04-REGDIR | - | Human | HUMAN |
| P05_REGDIR | P05_REGDIR | AGT-P05-REGDIR | - | Human | HUMAN |

### **Clinical Research & Data Science**

| Code | Name | Unique ID | Department | Agent Type | Category |
|------|------|-----------|------------|------------|----------|
| P04_BIOSTAT | P04_BIOSTAT | AGT-P04-BIOSTAT | - | Human | HUMAN |
| P07_DATASC | P07_DATASC | AGT-P07-DATASC | - | Human | HUMAN |
| P08_CLINRES | P08_CLINRES | AGT-P08-CLINRES | - | Human | HUMAN |

### **Product & Digital Health**

| Code | Name | Unique ID | Department | Agent Type | Category |
|------|------|-----------|------------|------------|----------|
| P06_DTXCMO | P06_DTXCMO | AGT-P06-DTXCMO | - | Human | HUMAN |
| P06_PMDIG | P06_PMDIG | AGT-P06-PMDIG | - | Human | HUMAN |

### **Clinical Operations & Data Management**

| Code | Name | Unique ID | Department | Agent Type | Category |
|------|------|-----------|------------|------------|----------|
| P08_CLOPS | P08_CLOPS | AGT-P08-CLOPS | - | Human | HUMAN |
| P09_DMGR | P09_DMGR | AGT-P09-DMGR | - | Human | HUMAN |

### **Patient Advocacy & Medical Writing**

| Code | Name | Unique ID | Department | Agent Type | Category |
|------|------|-----------|------------|------------|----------|
| P10_PATADV | P10_PATADV | AGT-P10-PATADV | - | Human | HUMAN |
| P15_HEOR | P15_HEOR | AGT-P15-HEOR | - | Human | HUMAN |
| P16_MEDWRIT | P16_MEDWRIT | AGT-P16-MEDWRIT | - | Human | HUMAN |

---

## 👤 **PERSONAS (dh_persona) - 35 Total**

Personas represent human organizational roles with detailed expertise, authority, and responsibility levels. They are used for workflow oversight, task review, and approval.

### **Executive Leadership**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P03_CEO | Chief Executive Officer | PERSONA-P03-CEO | Executive | EXPERT | VERY_HIGH | 15+ |
| P01_CMO | Chief Medical Officer | PERSONA-P01-CMO | Clinical Development | EXPERT | VERY_HIGH | 15+ |
| P02_VPCLIN | VP Clinical Development | PERSONA-P02-VPCLIN | Clinical Development | EXPERT | HIGH | 10-15 |

### **Clinical Development Leadership**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P06_DTXCMO | DTx Chief Medical Officer | PER-P06-DTXCMO | Clinical Development | EXPERT | VERY_HIGH | 10+ |
| P12_CLINICAL | Clinical Research Scientist | PERSONA-P12-CLINICAL | Clinical Development | EXPERT | HIGH | 8-15 |
| P08_CLINRES | Clinical Research Scientist | PER-P08-CLINRES | Clinical Research | ADVANCED | HIGH | 8+ |
| P06_MEDDIR | Medical Director | PER-P06-MEDDIR | Medical Affairs | ADVANCED | HIGH | 8+ |

### **Biostatistics & Data Science**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P04_BIOSTAT | Principal Biostatistician | PERSONA-P04-BIOSTAT | Biostatistics | EXPERT | HIGH | 8-15 |
| P09_DATASCIENCE | Data Science Director | PERSONA-P09-DATASCIENCE | Data Science | EXPERT | HIGH | 8-12 |
| P07_DATASC | Data Scientist - Digital Biomarker | PER-P07-DATASC | Data Science | ADVANCED | HIGH | 7+ |
| P08_DATADIR | Data Management Director | PER-P08-DATADIR | Data Management | INTERMEDIATE | MEDIUM | 5+ |
| P15_DATA_MANAGER | Clinical Data Manager | PERSONA-P15-DATA-MANAGER | Data Management | ADVANCED | MEDIUM | 8-12 |

### **Regulatory Affairs**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P05_REGAFF | Regulatory Affairs Director | PERSONA-P05-REGAFF | Regulatory Affairs | EXPERT | VERY_HIGH | 10-15 |
| P05_REGDIR | VP Regulatory Affairs | PER-P05-REGDIR | Regulatory Affairs | ADVANCED | HIGH | 10+ |
| P04_REGDIR | Regulatory Affairs Director | PER-P04-REGDIR | Regulatory Affairs | ADVANCED | HIGH | 8+ |

### **Clinical Operations**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P12_CLINICAL_OPS | Clinical Operations Director | PERSONA-P12-CLINICAL-OPS | Clinical Operations | EXPERT | HIGH | 10-15 |
| P08_CLOPS | Clinical Operations Director | PER-P08-CLOPS | Clinical Operations | ADVANCED | HIGH | 10+ |
| P03_CLTM | Clinical Trial Manager | PER-P03-CLTM | Clinical Operations | INTERMEDIATE | MEDIUM | 5+ |
| P10_PROJMGR | Clinical Project Manager | PER-P10-PROJMGR | Project Management | INTERMEDIATE | MEDIUM | 5+ |
| P11_SITEPI | Principal Investigator | PER-P11-SITEPI | Site Operations | EXPERT | ADVISORY | 10+ |

### **Product Development**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P16_ENG_LEAD | Engineering Lead | PERSONA-P16-ENG-LEAD | Engineering | EXPERT | VERY_HIGH | 10-15 |
| P06_PMDIG | Product Manager (Digital Health) | PERSONA-P06-PMDIG | Product | ADVANCED | MEDIUM | 5-10 |
| P03_PRODMGR | Product Manager - Digital Health | PER-P03-PRODMGR | Product Management | INTERMEDIATE | MEDIUM | 5+ |
| P17_UX_DESIGN | UX Design Lead | PERSONA-P17-UX-DESIGN | Design | ADVANCED | MEDIUM | 7-12 |

### **Health Economics & Outcomes Research**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P15_HEOR | Health Economics & Outcomes Research | PER-P15-HEOR | Health Economics | ADVANCED | HIGH | 8+ |
| P08_HEOR | Health Economics & Outcomes Research Director | PERSONA-P08-HEOR | Health Economics | EXPERT | MEDIUM | 8-12 |
| P07_VPMA | VP Market Access | PERSONA-P07-VPMA | Commercial | EXPERT | HIGH | 10-15 |

### **Medical Writing & Communications**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P16_MEDWRIT | Medical Writer | PER-P16-MEDWRIT | Medical Writing | INTERMEDIATE | LOW | 5+ |
| P11_MEDICAL | Medical Writer | PERSONA-P11-MEDICAL | Medical Affairs | ADVANCED | MEDIUM | 5-10 |
| P11_MEDICAL_WRITER | Medical Writer | PERSONA-P11-MEDICAL-WRITER | Medical Affairs | ADVANCED | LOW | 5-10 |

### **Patient Advocacy**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P10_PATADV | Patient Advocate | PERSONA-P10-PATADV | Patient Advocacy | ADVANCED | ADVISORY | 5-10 |

### **Quality & Compliance**

| Code | Name | Unique ID | Department | Expertise | Decision Authority | Years Experience |
|------|------|-----------|------------|-----------|-------------------|-----------------|
| P13_QA | Quality Assurance Director | PERSONA-P13-QA | Quality Assurance | EXPERT | HIGH | 10-15 |
| P14_PHARMACOVIGILANCE | Pharmacovigilance Director | PERSONA-P14-PHARMACOVIGILANCE | Safety & Pharmacovigilance | EXPERT | VERY_HIGH | 10-15 |
| P18_INFO_SEC | Information Security Officer | PERSONA-P18-INFO-SEC | Information Security | EXPERT | VERY_HIGH | 10-15 |

---

## 🔗 **ROLES → TASKS MAPPING**

Roles are assigned to tasks with specific responsibilities:
- **Lead:** Primary responsible party
- **Reviewer:** Reviews and provides feedback
- **Approver:** Final approval authority
- **Contributor:** Participates in execution

**Note:** Currently, no task-role assignments exist in the database for this tenant.

---

## 🔗 **PERSONAS → TASKS MAPPING**

Personas are assigned to tasks for review, approval, and input. **Top personas by task assignment:**

| Persona | Task Count | Department | Expertise | Decision Authority |
|---------|------------|------------|-----------|-------------------|
| P01_CMO (Chief Medical Officer) | 44 | Clinical Development | EXPERT | VERY_HIGH |
| P05_REGAFF (Regulatory Affairs Director) | 42 | Regulatory Affairs | EXPERT | VERY_HIGH |
| P04_BIOSTAT (Principal Biostatistician) | 42 | Biostatistics | EXPERT | HIGH |
| P02_VPCLIN (VP Clinical Development) | 37 | Clinical Development | EXPERT | HIGH |
| P04_REGDIR (Regulatory Affairs Director) | 20 | Regulatory Affairs | ADVANCED | HIGH |
| P09_DATASCIENCE (Data Science Director) | 10 | Data Science | EXPERT | HIGH |
| P08_HEOR (HEOR Director) | 9 | Health Economics | EXPERT | MEDIUM |
| P12_CLINICAL_OPS (Clinical Operations Director) | 6 | Clinical Operations | EXPERT | HIGH |

### **Chief Medical Officer (P01_CMO) - 44 Task Assignments**

**Approval Responsibilities (Blocking):**
- Clinical Context Assessment (TSK-CD-004-P1-02)
- Active Control Evaluation (TSK-CD-004-P2-02)
- Apply Decision Framework (TSK-CD-004-P3-01)
- Define Clinical Context (TSK-CD-001-P1-01)
- Evaluate Psychometric Properties (TSK-CD-001-P4-01)
- Prepare Stakeholder Communication (TSK-CD-001-P5-04)

**Approval Responsibilities (Non-Blocking):**
- Define Study Objectives & Endpoints (TSK-CD-010-01)
- Define Study Objectives & Hypotheses (TSK-CD-003-P1-01)
- Define Study Parameters (TSK-CD-007-01)
- Develop Inclusion/Exclusion Criteria (TSK-CD-003-P2-02)
- Define Engagement Taxonomy (TSK-CD-008-P1-01)
- Define Interpretation Framework (TSK-CD-009-05)
- Create Safety Monitoring Plan (TSK-CD-010-05)
- Finalize Sample Size Justification (TSK-CD-007-07)
- Final PRO Selection Decision (TSK-CD-005-07)
- Finalize for Regulatory Submission (TSK-CD-010-08)
- Internal Review & Revisions (TSK-CD-010-07)
- Draft DSMB Charter (TSK-CD-006-P4-01)
- Develop Strategic Rationale (TSK-CD-006-P1-02)
- Identify Candidate Subgroups (TSK-CD-009-01)

**Review Responsibilities:**
- Assess Digital Implementation Feasibility (TSK-CD-001-P4-02)
- Assess FDA Compliance (TSK-CD-005-04)
- Assess Patient Burden (TSK-CD-005-06)
- Calculate Subgroup Power (TSK-CD-009-03)
- Comparative Analysis Dashboard (TSK-CD-004-P2-04)
- Design Clinical Validation Study (TSK-CD-002-P3-01)
- Design Dose-Response Analysis (TSK-CD-008-P3-01)
- Develop Justification Document (TSK-CD-004-P3-02)
- Develop Regulatory Positioning (TSK-CD-008-P5-01)
- Develop Secondary Endpoint Package (TSK-CD-001-P3-02)
- Estimate Effect Size (TSK-CD-007-02)
- Evaluate Patient Burden (TSK-CD-001-P4-03)
- Execute Clinical Validation & MCID (TSK-CD-002-P3-02)
- Identify Patient-Centered Outcomes (TSK-CD-001-P1-02)
- Identify Primary Endpoint Candidates (TSK-CD-001-P3-01)
- Make Final Recommendation (TSK-CD-001-P5-03)
- Plan Mediation Analysis (TSK-CD-008-P4-01)
- Regulatory Strategy & FDA Pre-Submission (TSK-CD-002-P3-03)
- Research DTx Regulatory Precedent (TSK-CD-001-P2-01)
- Select Trial Design Framework (TSK-CD-003-P1-02)
- Validation Report & Publication (TSK-CD-002-P3-04)
- Write Core Protocol Sections (TSK-CD-010-03)

**Input Responsibilities:**
- Stakeholder Input Collection (TSK-CD-004-P1-03) - PARALLEL

### **Clinical Operations Director (P12_CLINICAL_OPS) - 6 Task Assignments**

**Approval Responsibilities:**
- Create Monitoring Plan (TSK-MA-008-05)
- Outline Statistical Analysis Plan (TSK-CD-003-P4-02)

**Review Responsibilities:**
- Clinical Context Assessment (TSK-CD-004-P1-02) - PARALLEL
- Conduct Feasibility Assessment (TSK-CD-010-06)
- Design Trial Structure (TSK-CD-010-02)
- Develop Inclusion/Exclusion Criteria (TSK-CD-003-P2-02)

---

## 📋 **ORGANIZATIONAL STRUCTURE BY DOMAIN**

### **1. Clinical Development (CD) Domain**

**Use Cases:** 10
- UC_CD_001: DTx Clinical Endpoint Selection & Validation
- UC_CD_002: Digital Biomarker Validation Strategy (DiMe V3 Framework)
- UC_CD_003: RCT Design & Clinical Trial Strategy for DTx
- UC_CD_004: Comparator Selection Strategy
- UC_CD_005: Patient-Reported Outcome (PRO) Instrument Selection
- UC_CD_006: DTx Adaptive Trial Design
- UC_CD_007: Sample Size Calculation for DTx Trials
- UC_CD_008: DTx Engagement Metrics as Endpoints
- UC_CD_009: Subgroup Analysis Planning
- UC_CD_010: Clinical Trial Protocol Development

**Workflows:** 60+ workflows across these use cases

**Key Personas Involved:**
- Chief Medical Officer (P01_CMO) - Primary approver for most clinical decisions
- VP Clinical Development (P02_VPCLIN) - Strategic oversight
- Principal Biostatistician (P04_BIOSTAT) - Statistical design
- Clinical Operations Director (P12_CLINICAL_OPS) - Operational execution
- Clinical Research Scientist (P08_CLINRES) - Scientific validation

### **2. Evidence Generation (EG) Domain**

**Use Cases:** 10
- UC_EG_001: Real-World Evidence Study Design
- UC_EG_002: Observational Data Analysis (DTx)
- UC_EG_003: Propensity Score Matching for DTx
- UC_EG_004: Patient Registry Design
- UC_EG_005: Publication Strategy & Medical Writing
- UC_EG_006: KOL Engagement & Advisory Boards
- UC_EG_007: Health Outcomes Research Design
- UC_EG_008: Patient-Centered Outcomes Research
- UC_EG_009: Meta-Analysis & Systematic Review
- UC_EG_010: Evidence Synthesis for HTAs

**Workflows:** 50+ workflows

**Key Personas Involved:**
- Health Economics & Outcomes Research Director (P08_HEOR)
- Data Science Director (P09_DATASCIENCE)
- Clinical Research Scientist (P12_CLINICAL)
- Medical Writer (P11_MEDICAL)

### **3. Market Access (MA) Domain**

**Use Cases:** 10
- UC_MA_001: Payer Value Dossier Development
- UC_MA_002: Health Economics Model (DTx)
- UC_MA_003: CPT/HCPCS Code Strategy
- UC_MA_004: Formulary Positioning Strategy
- UC_MA_005: P&T Committee Presentation
- UC_MA_006: Budget Impact Model (BIM)
- UC_MA_007: Comparative Effectiveness Analysis
- UC_MA_008: Value-Based Contracting Strategy
- UC_MA_009: Health Technology Assessment (HTA)
- UC_MA_010: Patient Assistance Program Design

**Workflows:** 50+ workflows

**Key Personas Involved:**
- VP Market Access (P07_VPMA)
- Health Economics & Outcomes Research (P15_HEOR)
- Health Economics Director (P08_HEOR)

### **4. Product Development (PD) Domain**

**Use Cases:** 10
- UC_PD_001: Clinical Requirements Documentation
- UC_PD_002: User Experience (UX) Clinical Validation
- UC_PD_003: EHR Integration Strategy (FHIR)
- UC_PD_004: Digital Therapeutic Algorithm Design
- UC_PD_005: Engagement Feature Optimization
- UC_PD_006: Behavioral Science Integration
- UC_PD_007: Accessibility & Inclusivity Design
- UC_PD_008: Data Privacy Architecture (HIPAA)
- UC_PD_009: AI/ML Model Clinical Validation
- UC_PD_010: Usability Testing Protocol

**Workflows:** 50+ workflows

**Key Personas Involved:**
- Engineering Lead (P16_ENG_LEAD)
- Product Manager (P06_PMDIG)
- UX Design Lead (P17_UX_DESIGN)
- Data Scientist - Digital Biomarker (P07_DATASC)
- Information Security Officer (P18_INFO_SEC)

### **5. Regulatory Affairs (RA) Domain**

**Use Cases:** 10
- UC_RA_001: FDA Software Classification (SaMD)
- UC_RA_002: 510(k) vs De Novo Pathway Determination
- UC_RA_003: Predicate Device Identification
- UC_RA_004: Pre-Submission Meeting Preparation
- UC_RA_005: Clinical Evaluation Report (CER)
- UC_RA_006: FDA Breakthrough Designation Strategy
- UC_RA_007: International Harmonization Strategy
- UC_RA_008: Cybersecurity Documentation (FDA)
- UC_RA_009: Software Validation Documentation
- UC_RA_010: Post-Market Surveillance Planning

**Workflows:** 50+ workflows

**Key Personas Involved:**
- Regulatory Affairs Director (P05_REGAFF)
- VP Regulatory Affairs (P05_REGDIR)
- Regulatory Affairs Director (P04_REGDIR)
- Chief Medical Officer (P01_CMO)
- Quality Assurance Director (P13_QA)

---

## 🎯 **KEY RELATIONSHIPS**

### **Persona → Task Assignments**
- **Chief Medical Officer:** 44 task assignments (highest responsibility)
- **Clinical Operations Director:** 6 task assignments
- **Other personas:** Various task assignments across workflows

### **Persona → Workflow Assignments**
- **Currently:** No workflow assignments exist in database
- **Intended Use:** Personas assigned to workflows for overall oversight
- **Responsibilities:** APPROVE, REVIEW, SUPPORT, CONSULT, INFORM
- **Review Stages:** PRE_EXECUTION, DURING, POST_EXECUTION, ON_EXCEPTION

### **Role → Task Assignments**
- Roles assigned to tasks with responsibilities: Lead, Reviewer, Approver, Contributor
- Currently no assignments in database (may be legacy structure)

---

## 📝 **NOTES**

1. **Role vs Persona Distinction:**
   - **Roles (dh_role):** Organizational positions (15 total, all Human type)
   - **Personas (dh_persona):** Detailed human job functions with expertise levels (35 total)

2. **Task Assignment Pattern:**
   - **18 personas** have task assignments (244 total task assignments)
   - **17 personas** have no task assignments yet (ready for future use)
   - Chief Medical Officer has the most assignments (44 tasks)
   - Regulatory Affairs Director and Principal Biostatistician each have 42 assignments
   - VP Clinical Development has 37 assignments

3. **Organizational Hierarchy:**
   - **Executive Level:** CEO, CMO, VP Clinical Development
   - **Director Level:** Regulatory, Clinical Operations, Data Science, Quality Assurance, etc.
   - **Specialist Level:** Biostatistician, Medical Writer, Data Scientist, etc.

4. **Workflow Coverage:**
   - 5 domains covering the full digital health product lifecycle
   - 50 use cases addressing key business needs
   - 116 workflows with detailed task breakdowns
   - 343 tasks across all workflows

5. **Persona Utilization:**
   - **Active Personas (with task assignments):** 18
   - **Inactive Personas (ready for use):** 17
   - Highest utilized: Chief Medical Officer (44 tasks)
   - Most personas are assigned to Clinical Development and Regulatory Affairs tasks

---

---

## 📊 **VISUAL ORGANIZATIONAL HIERARCHY**

### **Executive Level**
```
CEO (P03_CEO)
  └── CMO (P01_CMO) - 44 tasks
      └── VP Clinical Development (P02_VPCLIN) - 37 tasks
      └── DTx CMO (P06_DTXCMO) - 5 tasks
```

### **Clinical Development**
```
CMO (P01_CMO) - 44 tasks
├── VP Clinical Development (P02_VPCLIN) - 37 tasks
├── Clinical Research Scientist (P12_CLINICAL) - 1 task
├── Clinical Research Scientist (P08_CLINRES) - 1 task
└── Clinical Operations Director (P12_CLINICAL_OPS) - 6 tasks
    └── Clinical Operations Director (P08_CLOPS) - 0 tasks
    └── Clinical Trial Manager (P03_CLTM) - 0 tasks
    └── Clinical Project Manager (P10_PROJMGR) - 0 tasks
```

### **Regulatory Affairs**
```
Regulatory Affairs Director (P05_REGAFF) - 42 tasks
├── VP Regulatory Affairs (P05_REGDIR) - 0 tasks
└── Regulatory Affairs Director (P04_REGDIR) - 20 tasks
```

### **Biostatistics & Data Science**
```
Principal Biostatistician (P04_BIOSTAT) - 42 tasks
├── Data Science Director (P09_DATASCIENCE) - 10 tasks
├── Data Scientist - Digital Biomarker (P07_DATASC) - 2 tasks
└── Data Management Director (P08_DATADIR) - 0 tasks
    └── Clinical Data Manager (P15_DATA_MANAGER) - 0 tasks
```

### **Health Economics & Market Access**
```
VP Market Access (P07_VPMA) - 0 tasks
├── HEOR Director (P08_HEOR) - 9 tasks
└── Health Economics & Outcomes Research (P15_HEOR) - 2 tasks
```

### **Product Development**
```
Engineering Lead (P16_ENG_LEAD) - 0 tasks
├── Product Manager (P06_PMDIG) - 5 tasks
├── Product Manager - Digital Health (P03_PRODMGR) - 0 tasks
└── UX Design Lead (P17_UX_DESIGN) - 0 tasks
```

### **Medical Affairs & Writing**
```
Medical Director (P06_MEDDIR) - 0 tasks
├── Medical Writer (P11_MEDICAL_WRITER) - 5 tasks
├── Medical Writer (P11_MEDICAL) - 2 tasks
└── Medical Writer (P16_MEDWRIT) - 2 tasks
```

### **Quality & Compliance**
```
Quality Assurance Director (P13_QA) - 4 tasks
├── Pharmacovigilance Director (P14_PHARMACOVIGILANCE) - 0 tasks
└── Information Security Officer (P18_INFO_SEC) - 0 tasks
```

### **Patient Advocacy**
```
Patient Advocate (P10_PATADV) - 5 tasks
└── Principal Investigator (P11_SITEPI) - 0 tasks
```

---

## 🎯 **PERSONA BY DOMAIN ASSIGNMENT**

### **Clinical Development Domain**
**Primary Personas:**
- Chief Medical Officer (P01_CMO) - 44 tasks
- VP Clinical Development (P02_VPCLIN) - 37 tasks
- Principal Biostatistician (P04_BIOSTAT) - 42 tasks
- Clinical Operations Director (P12_CLINICAL_OPS) - 6 tasks
- Clinical Research Scientist (P08_CLINRES, P12_CLINICAL) - 2 tasks
- DTx Chief Medical Officer (P06_DTXCMO) - 5 tasks

**Supporting Personas:**
- Patient Advocate (P10_PATADV) - 5 tasks
- Medical Writer (P11_MEDICAL_WRITER, P11_MEDICAL, P16_MEDWRIT) - 9 tasks

### **Regulatory Affairs Domain**
**Primary Personas:**
- Regulatory Affairs Director (P05_REGAFF) - 42 tasks
- Regulatory Affairs Director (P04_REGDIR) - 20 tasks
- VP Regulatory Affairs (P05_REGDIR) - 0 tasks (available)

**Supporting Personas:**
- Chief Medical Officer (P01_CMO) - Cross-domain approvals
- Quality Assurance Director (P13_QA) - 4 tasks

### **Evidence Generation Domain**
**Primary Personas:**
- Health Economics & Outcomes Research Director (P08_HEOR) - 9 tasks
- Data Science Director (P09_DATASCIENCE) - 10 tasks
- Clinical Research Scientist (P12_CLINICAL) - Scientific validation

### **Market Access Domain**
**Primary Personas:**
- Health Economics & Outcomes Research Director (P08_HEOR) - 9 tasks
- Health Economics & Outcomes Research (P15_HEOR) - 2 tasks
- VP Market Access (P07_VPMA) - 0 tasks (available)

### **Product Development Domain**
**Primary Personas:**
- Product Manager (P06_PMDIG) - 5 tasks
- Engineering Lead (P16_ENG_LEAD) - 0 tasks (available)
- UX Design Lead (P17_UX_DESIGN) - 0 tasks (available)
- Data Scientist - Digital Biomarker (P07_DATASC) - 2 tasks

---

**Document Generated:** 2025-01-27  
**Tenant ID:** b8026534-02a7-4d24-bf4c-344591964e02  
**Status:** Active Client Tenant

