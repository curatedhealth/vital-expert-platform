# Pharmaceutical/Biotech Role Enrichment Strategy for VITAL Platform

**Document Version:** 1.0
**Created:** 2025-11-22
**Author:** VITAL Data Strategist Agent
**Status:** Strategic Planning Document

---

## Executive Summary

This document outlines a comprehensive strategy to enrich the `org_roles` table and related structures within the VITAL platform to support pharmaceutical and biotech organizations. The enrichment transforms basic role definitions into a complete, industry-specific knowledge base that captures:

- **Regulatory & Compliance Requirements** (GxP, FDA, EMA, ICH)
- **Healthcare-Specific Competencies** (Clinical trial expertise, therapeutic areas, drug development phases)
- **Performance Metrics** (KPIs, OKRs, success criteria)
- **Decision Authority** (Approval matrices, budget controls, sign-off responsibilities)
- **Career Development** (Progression paths, skill ladders, certifications)
- **Workflow Context** (Typical processes, collaboration patterns, day-in-the-life)

### Current State vs. Target State

| Dimension | Current State | Target State |
|-----------|--------------|--------------|
| **Core Attributes** | Basic identity, hierarchy, experience | ✓ Already comprehensive |
| **Regulatory Context** | None | GxP requirements, compliance frameworks, audit readiness |
| **Healthcare Competencies** | Generic skills array | Therapeutic areas, clinical phases, disease expertise |
| **Performance Metrics** | None | Role-specific KPIs with targets and measurement frequencies |
| **Decision Authority** | Budget ranges only | Approval matrices, sign-off authority, delegation levels |
| **Workflows** | None | Typical processes, RACI matrices, collaboration patterns |
| **Career Paths** | None | Progression trees, skill requirements per level, promotion criteria |
| **Certifications** | Generic array | Industry-specific credentials with renewal requirements |

---

## 1. Gap Analysis: What's Missing for Pharma/Biotech Context

### 1.1 Regulatory & Compliance Attributes

**Current State:** `compliance_requirements TEXT[]` exists only on `org_departments`, not roles.

**Missing:**
- **GxP Roles Classification:** Which roles are GxP-critical (GMP, GCP, GLP, GVP)?
- **Regulatory Framework Expertise:** FDA, EMA, ICH, PMDA knowledge requirements
- **SOX/21 CFR Part 11 Compliance:** Electronic signature authority, data integrity responsibilities
- **Inspection Readiness:** Which roles interface with regulators during audits?
- **Adverse Event Reporting:** Pharmacovigilance obligations per role
- **Training Requirements:** Mandatory GxP training, frequency, tracking

**Impact:** Without this, we can't:
- Identify which roles need specialized compliance training
- Assess regulatory risk exposure by role
- Generate compliant job descriptions for regulated environments
- Support audit trail requirements

### 1.2 Healthcare/Pharma-Specific Competencies

**Current State:** Generic `required_skills TEXT[]` and `required_certifications TEXT[]`

**Missing:**
- **Therapeutic Area Expertise:** Which disease areas must this role know?
- **Clinical Trial Phases:** Phase I-IV experience requirements
- **Drug Development Lifecycle:** Discovery, preclinical, clinical, commercial expertise
- **Medical Terminology:** ICD-10, CPT, SNOMED CT, MedDRA proficiency
- **Healthcare Standards:** HL7, FHIR, CDISC, BRIDG knowledge
- **Molecular Medicine:** Genomics, biomarkers, precision medicine understanding

**Impact:** Without this, we can't:
- Match roles to therapeutic programs
- Assess capability gaps for new drug pipelines
- Generate accurate personas for disease-specific workflows
- Support AI agent specialization by therapeutic area

### 1.3 Key Performance Indicators (KPIs)

**Current State:** No KPI tracking at role level

**Missing:**
- **Role-Specific Metrics:** What does success look like for this role?
- **Target Ranges:** Min/max acceptable performance
- **Measurement Frequency:** Daily, weekly, monthly, quarterly
- **Leading vs. Lagging Indicators:** Predictive vs. outcome metrics
- **Industry Benchmarks:** How do we compare to pharma standards?

**Examples by Role:**
- **MSL:** # KOL engagements/month (target: 8-12), Insight reports submitted (target: 10-15/quarter), Congress attendance (target: 2-4/year)
- **Regulatory Affairs Manager:** Submission cycle time (target: <90 days), Approval success rate (target: >85%), Query response time (target: <15 days)
- **Clinical Data Manager:** Data entry accuracy (target: >99.5%), Database lock time (target: <30 days post-LPO), Query resolution rate (target: >95% in 48hrs)

**Impact:** Without this, we can't:
- Generate realistic OKRs for personas
- Assess role performance objectively
- Train AI agents on success criteria
- Support workforce planning with performance data

### 1.4 Decision Authority & Approval Matrices

**Current State:** Only `budget_authority_type` and `budget_authority_limit`

**Missing:**
- **Approval Authority:** What can this role approve independently?
- **Sign-off Responsibilities:** Which documents require this role's signature?
- **Delegation Levels:** What authority can be delegated to direct reports?
- **Escalation Pathways:** When must this role escalate decisions?
- **Cross-functional Authority:** Can this role approve work from other functions?

**Examples:**
- **Medical Director:** Can approve medical education grants up to $50K, Must sign off on all clinical study protocols, Can delegate investigator contract reviews to Senior MSLs
- **QA Manager:** Final authority on batch release (if <$5M value), Must escalate deviations to VP if patient safety risk, Can delegate routine document approvals to Senior QA Specialists

**Impact:** Without this, we can't:
- Generate accurate RACI matrices
- Support delegation modeling in workflows
- Train AI agents on when to escalate
- Assess span of control accurately

### 1.5 Career Progression Paths

**Current State:** `seniority_level` only (no progression mapping)

**Missing:**
- **Typical Career Path:** What roles lead to this position?
- **Next Logical Roles:** Where do people in this role typically move?
- **Lateral Moves:** What parallel roles are common transitions?
- **Skill Gaps for Promotion:** What new skills are needed for next level?
- **Time-in-Role Expectations:** How long before typical promotion?

**Example: MSL Career Ladder**
```
Entry Point: Postdoc/Clinical Pharmacist → MSL (2-3 yrs) → Senior MSL (3-5 yrs) →
MSL Team Lead (2-3 yrs) → Regional Medical Director (4-6 yrs) → VP Medical Affairs
```

**Impact:** Without this, we can't:
- Generate realistic career personas (different stages)
- Support succession planning
- Identify skill development needs
- Model career trajectory workflows

### 1.6 Workflow & Process Context

**Current State:** No workflow information

**Missing:**
- **Typical Daily/Weekly Activities:** What does this role actually do?
- **Key Processes:** Which critical processes does this role execute?
- **Process Ownership:** Which processes does this role own vs. participate in?
- **Handoffs & Dependencies:** Who do they receive work from? Who do they hand off to?
- **Collaboration Patterns:** Frequency and nature of cross-functional work
- **Meeting Load:** Typical meeting hours per week

**Example: Regulatory Affairs Manager**
- **Daily:** Review submission status dashboards, respond to agency queries, coordinate with CMC team
- **Weekly:** Attend cross-functional submission planning meetings, conduct regulatory intelligence reviews
- **Monthly:** Present regulatory strategy to leadership, conduct training for new regulations
- **Quarterly:** Participate in regulatory audits, update submission plans

**Impact:** Without this, we can't:
- Generate realistic day-in-the-life personas
- Train AI agents on realistic workflows
- Identify process improvement opportunities
- Support change management for new systems

---

## 2. Proposed Enrichment Architecture

### 2.1 Direct Column Additions to `org_roles` Table

**Rationale:** Add attributes that are 1:1 with a role and rarely change.

```sql
-- Regulatory & Compliance
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS gxp_role_type TEXT CHECK (gxp_role_type IN ('gmp', 'gcp', 'glp', 'gvp', 'non_gxp'));
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS regulatory_inspection_role BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS sox_critical BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS cfr_part_11_required BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS pharmacovigilance_responsibility BOOLEAN DEFAULT false;

-- Clinical/Healthcare Context
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS clinical_trial_phase_focus TEXT[]; -- ['phase_1', 'phase_2', 'phase_3', 'phase_4']
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS drug_lifecycle_stage TEXT[]; -- ['discovery', 'preclinical', 'clinical', 'commercial', 'lifecycle_management']
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS patient_facing BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS hcp_facing BOOLEAN DEFAULT false;

-- Career & Development
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_time_in_role_years INTEGER; -- Average tenure before promotion
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS advancement_potential TEXT; -- 'high', 'moderate', 'limited', 'terminal'
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_entry_point BOOLEAN DEFAULT false; -- Is this a common first role in function?

-- Workflow Context
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS typical_meeting_hours_per_week INTEGER;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS administrative_load_percent INTEGER CHECK (administrative_load_percent >= 0 AND administrative_load_percent <= 100);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS strategic_vs_tactical TEXT; -- 'strategic', 'tactical', 'balanced'
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS innovation_vs_execution TEXT; -- 'innovation_focused', 'execution_focused', 'balanced'
```

**Total New Columns:** 16 direct attributes

### 2.2 New Reference Tables (Master Data)

**Purpose:** Create normalized catalogs of reusable entities that can be shared across multiple roles.

```sql
-- 2.2.1 Regulatory Frameworks
CREATE TABLE IF NOT EXISTS regulatory_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'FDA 21 CFR Part 312', 'EMA Clinical Trial Regulation', 'ICH E6(R3)'
    framework_type TEXT, -- 'submission', 'compliance', 'quality', 'safety'
    region TEXT, -- 'US', 'EU', 'Global', 'APAC'
    authority TEXT, -- 'FDA', 'EMA', 'PMDA', 'ICH'
    description TEXT,
    effective_date DATE,
    revision_date DATE,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2.2 GxP Training Modules
CREATE TABLE IF NOT EXISTS gxp_training_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL UNIQUE, -- 'GCP Fundamentals', 'GMP for Manufacturing', 'Pharmacovigilance Essentials'
    gxp_category TEXT, -- 'GMP', 'GCP', 'GLP', 'GVP', 'GDP'
    required_for_gxp_roles BOOLEAN DEFAULT true,
    training_duration_hours NUMERIC(5,2),
    renewal_frequency_months INTEGER, -- How often must be refreshed
    regulatory_requirement BOOLEAN DEFAULT true,
    description TEXT,
    learning_objectives TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2.3 Clinical Competencies
CREATE TABLE IF NOT EXISTS clinical_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_name TEXT NOT NULL UNIQUE, -- 'Clinical Trial Design', 'Pharmacokinetics', 'Biostatistics'
    category TEXT, -- 'clinical_research', 'medical_science', 'regulatory', 'data_management'
    description TEXT,
    typical_roles TEXT[], -- Cached: which roles commonly need this
    learning_resources TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2.4 Approval Types (for decision authority)
CREATE TABLE IF NOT EXISTS approval_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_name TEXT NOT NULL UNIQUE, -- 'Clinical Study Protocol', 'IND Submission', 'Medical Education Grant'
    category TEXT, -- 'regulatory', 'clinical', 'commercial', 'financial', 'quality'
    regulatory_impact TEXT, -- 'high', 'medium', 'low', 'none'
    typical_turnaround_days INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2.5 Process Definitions
CREATE TABLE IF NOT EXISTS process_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_name TEXT NOT NULL UNIQUE, -- 'IND Submission', 'Clinical Study Startup', 'Adverse Event Reporting'
    process_type TEXT, -- 'regulatory', 'clinical', 'quality', 'commercial', 'safety'
    typical_duration_days INTEGER,
    complexity_level TEXT, -- 'low', 'medium', 'high', 'very_high'
    regulatory_requirement BOOLEAN DEFAULT false,
    sop_reference TEXT, -- Link to procedure document
    description TEXT,
    key_milestones TEXT[], -- JSON array of milestone names
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2.6 Career Progression Paths
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_name TEXT NOT NULL UNIQUE, -- 'MSL Career Track', 'Clinical Development Leadership Track'
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    description TEXT,
    typical_duration_years INTEGER, -- From entry to apex
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2.7 Workflow Activities
CREATE TABLE IF NOT EXISTS workflow_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_name TEXT NOT NULL UNIQUE, -- 'Review Regulatory Intelligence Reports', 'Conduct KOL Engagement'
    category TEXT, -- 'planning', 'execution', 'review', 'communication', 'administrative'
    typical_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'ad_hoc'
    typical_duration_hours NUMERIC(5,2),
    requires_collaboration BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Already Exist (from Gold Standard Schema):
-- ✓ therapeutic_areas
-- ✓ disease_areas
-- ✓ skills
-- ✓ tools
-- ✓ stakeholders
-- ✓ responsibilities
-- ✓ kpi_definitions
```

**Total New Reference Tables:** 7

### 2.3 New Junction Tables (Many-to-Many Relationships)

**Purpose:** Link roles to the reference data with role-specific context.

```sql
-- 2.3.1 Role Regulatory Frameworks
CREATE TABLE IF NOT EXISTS role_regulatory_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES regulatory_frameworks(id) ON DELETE CASCADE,
    proficiency_required TEXT, -- 'awareness', 'working_knowledge', 'expert'
    is_critical BOOLEAN DEFAULT false,
    assessment_frequency TEXT, -- 'annual', 'biannual', 'upon_hire'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, framework_id)
);

-- 2.3.2 Role GxP Training
CREATE TABLE IF NOT EXISTS role_gxp_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    training_module_id UUID NOT NULL REFERENCES gxp_training_modules(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT true,
    due_within_days_of_hire INTEGER DEFAULT 90, -- Must complete within X days of starting
    renewal_reminder_days INTEGER DEFAULT 30, -- Remind X days before expiration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, training_module_id)
);

-- 2.3.3 Role Clinical Competencies
CREATE TABLE IF NOT EXISTS role_clinical_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES clinical_competencies(id) ON DELETE CASCADE,
    required_proficiency TEXT, -- 'foundational', 'intermediate', 'advanced', 'expert'
    years_experience_in_competency INTEGER,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, competency_id)
);

-- 2.3.4 Role Approval Authority
CREATE TABLE IF NOT EXISTS role_approval_authority (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    approval_type_id UUID NOT NULL REFERENCES approval_types(id) ON DELETE CASCADE,
    authority_level TEXT, -- 'final_approver', 'co_approver', 'recommender', 'reviewer'
    monetary_limit NUMERIC(15,2), -- Max value that can be approved
    requires_escalation_above NUMERIC(15,2), -- Escalate if exceeds this amount
    can_delegate BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, approval_type_id)
);

-- 2.3.5 Role Process Participation
CREATE TABLE IF NOT EXISTS role_process_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    process_id UUID NOT NULL REFERENCES process_definitions(id) ON DELETE CASCADE,
    participation_type TEXT, -- 'owner', 'accountable', 'responsible', 'consulted', 'informed' (RACI)
    typical_involvement_hours INTEGER, -- Hours spent on this process per occurrence
    frequency_per_year INTEGER, -- How many times per year does this role do this process?
    is_critical_path BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, process_id)
);

-- 2.3.6 Career Path Steps
CREATE TABLE IF NOT EXISTS career_path_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    step_sequence INTEGER NOT NULL, -- 1 = entry, 2 = next, etc.
    typical_years_at_step INTEGER,
    skills_to_develop TEXT[], -- What to learn at this step to advance
    typical_transition_rate NUMERIC(3,2), -- % who move to next step (0.75 = 75%)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(career_path_id, step_sequence)
);

-- 2.3.7 Role Workflow Activities
CREATE TABLE IF NOT EXISTS role_workflow_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES workflow_activities(id) ON DELETE CASCADE,
    frequency TEXT, -- Can override typical_frequency from activity definition
    time_allocation_percent INTEGER CHECK (time_allocation_percent >= 0 AND time_allocation_percent <= 100),
    priority INTEGER, -- 1 = highest priority activity for this role
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, activity_id)
);

-- Already Exist (from Gold Standard Schema):
-- ✓ role_therapeutic_areas
-- ✓ role_disease_areas
-- ✓ role_company_sizes
-- ✓ role_responsibilities
-- ✓ role_kpis
-- ✓ role_skills
-- ✓ role_tools
-- ✓ role_internal_stakeholders
-- ✓ role_external_stakeholders
-- ✓ role_ai_maturity
-- ✓ role_vpanes_scores
```

**Total New Junction Tables:** 7

### 2.4 Summary of Schema Changes

| Change Type | Count | Impact |
|-------------|-------|--------|
| Direct columns added to `org_roles` | 16 | Low complexity, high query performance |
| New reference tables | 7 | Normalized, reusable master data |
| New junction tables | 7 | Flexible many-to-many relationships |
| **Total Schema Objects Added** | **30** | **Comprehensive enrichment** |

---

## 3. Healthcare/Pharma-Specific Attributes Deep Dive

### 3.1 GxP Role Classification

**What is GxP?**
- **GMP** (Good Manufacturing Practice): Roles in manufacturing, quality control, production
- **GCP** (Good Clinical Practice): Roles in clinical trials, patient safety, ethics
- **GLP** (Good Laboratory Practice): Roles in nonclinical lab studies, toxicology
- **GVP** (Good Pharmacovigilance Practice): Roles in adverse event reporting, safety surveillance
- **GDP** (Good Distribution Practice): Roles in supply chain, storage, distribution

**Why Map Roles to GxP?**
1. **Regulatory Training Requirements:** GxP roles require specific certifications
2. **Audit Readiness:** These roles are inspected by FDA/EMA
3. **Data Integrity:** GxP roles have stricter record-keeping requirements
4. **Career Mobility:** GxP experience opens specific career paths

**Implementation:**
```sql
-- Example: MSL (Medical Science Liaison)
UPDATE org_roles SET gxp_role_type = 'gcp', regulatory_inspection_role = false WHERE slug = 'medical-science-liaison';

-- Example: QA Manager
UPDATE org_roles SET gxp_role_type = 'gmp', regulatory_inspection_role = true, sox_critical = true WHERE slug = 'qa-manager';

-- Example: Clinical Research Associate
UPDATE org_roles SET gxp_role_type = 'gcp', regulatory_inspection_role = true, cfr_part_11_required = true WHERE slug = 'clinical-research-associate';

-- Example: Pharmacovigilance Specialist
UPDATE org_roles SET gxp_role_type = 'gvp', pharmacovigilance_responsibility = true WHERE slug = 'pharmacovigilance-specialist';
```

### 3.2 Therapeutic Area & Disease Expertise

**Already Supported in Gold Standard Schema:**
- `therapeutic_areas` table
- `disease_areas` table (with FK to therapeutic area)
- `role_therapeutic_areas` junction (with `is_primary` flag)
- `role_disease_areas` junction

**Enrichment Strategy:**
```sql
-- Seed therapeutic areas
INSERT INTO therapeutic_areas (name, description) VALUES
    ('Oncology', 'Cancer and tumor-related diseases'),
    ('Cardiovascular', 'Heart and circulatory system diseases'),
    ('Neurology', 'Brain and nervous system disorders'),
    ('Immunology', 'Immune system and autoimmune diseases'),
    ('Infectious Disease', 'Bacterial, viral, and parasitic infections'),
    ('Metabolic Disorders', 'Diabetes, obesity, and metabolic syndromes'),
    ('Rare Diseases', 'Orphan drugs and rare genetic disorders');

-- Map MSL role to therapeutic areas (can be multi-TA)
INSERT INTO role_therapeutic_areas (role_id, therapeutic_area_id, is_primary) VALUES
    ('{msl_role_id}', '{oncology_id}', true),
    ('{msl_role_id}', '{immunology_id}', false); -- Secondary TA
```

**Use Case:**
- **Persona Generation:** Create "MSL - Oncology" vs. "MSL - Cardiology" personas
- **Agent Specialization:** Train AI agents on TA-specific literature
- **Workflow Customization:** Different congress calendars per TA

### 3.3 Clinical Trial Phase Expertise

**New Array Column on `org_roles`:**
```sql
clinical_trial_phase_focus TEXT[] -- ['phase_1', 'phase_2', 'phase_3', 'phase_4', 'post_marketing']
```

**Examples:**
```sql
-- Early Development Scientist (Phase I/II focus)
UPDATE org_roles SET clinical_trial_phase_focus = ARRAY['phase_1', 'phase_2'] WHERE slug = 'early-development-scientist';

-- Clinical Operations Manager (typically Phase III)
UPDATE org_roles SET clinical_trial_phase_focus = ARRAY['phase_3'] WHERE slug = 'clinical-operations-manager';

-- Medical Affairs (post-approval, Phase IV)
UPDATE org_roles SET clinical_trial_phase_focus = ARRAY['phase_4', 'post_marketing'] WHERE slug = 'medical-science-liaison';
```

**Use Case:**
- **Skill Matching:** Phase I requires PK/PD expertise, Phase III requires large trial logistics
- **Workflow Differences:** Phase I = investigator-initiated, Phase III = sponsor-controlled
- **Regulatory Context:** Phase III triggers different regulatory submissions

### 3.4 Drug Development Lifecycle Stage

**New Array Column on `org_roles`:**
```sql
drug_lifecycle_stage TEXT[] -- ['discovery', 'preclinical', 'clinical', 'regulatory_submission', 'commercial', 'lifecycle_management']
```

**Examples:**
```sql
-- Research Scientist (Discovery & Preclinical)
UPDATE org_roles SET drug_lifecycle_stage = ARRAY['discovery', 'preclinical'] WHERE slug = 'research-scientist';

-- Regulatory Affairs Manager (Regulatory Submission)
UPDATE org_roles SET drug_lifecycle_stage = ARRAY['regulatory_submission', 'lifecycle_management'] WHERE slug = 'regulatory-affairs-manager';

-- Commercial Excellence Manager (Commercial & Lifecycle)
UPDATE org_roles SET drug_lifecycle_stage = ARRAY['commercial', 'lifecycle_management'] WHERE slug = 'commercial-excellence-manager';
```

**Use Case:**
- **Function Alignment:** Roles map to different lifecycle stages
- **Transition Planning:** As product moves through lifecycle, different roles activate
- **Portfolio Management:** Understand organizational capability by lifecycle stage

### 3.5 Regulatory Framework Expertise

**New Reference Table + Junction Table:**
```sql
-- Seed regulatory frameworks
INSERT INTO regulatory_frameworks (name, framework_type, region, authority, description) VALUES
    ('FDA 21 CFR Part 312 (IND)', 'submission', 'US', 'FDA', 'Investigational New Drug application requirements'),
    ('FDA 21 CFR Part 314 (NDA)', 'submission', 'US', 'FDA', 'New Drug Application requirements'),
    ('EMA Clinical Trial Regulation (EU CTR)', 'submission', 'EU', 'EMA', 'European clinical trial authorization'),
    ('ICH E6(R3) GCP', 'compliance', 'Global', 'ICH', 'Good Clinical Practice guidelines'),
    ('ICH M4 CTD', 'submission', 'Global', 'ICH', 'Common Technical Document format'),
    ('FDA 21 CFR Part 11', 'compliance', 'US', 'FDA', 'Electronic records and signatures'),
    ('EU Annex 11', 'compliance', 'EU', 'EMA', 'Computerized systems in GMP'),
    ('ICH Q9 Quality Risk Management', 'quality', 'Global', 'ICH', 'Risk-based quality management');

-- Map Regulatory Affairs Manager to frameworks
INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_required, is_critical) VALUES
    ('{reg_affairs_mgr_id}', '{fda_ind_id}', 'expert', true),
    ('{reg_affairs_mgr_id}', '{fda_nda_id}', 'expert', true),
    ('{reg_affairs_mgr_id}', '{ich_ctd_id}', 'expert', true),
    ('{reg_affairs_mgr_id}', '{fda_part_11_id}', 'working_knowledge', false);
```

**Use Case:**
- **Training Plans:** Auto-generate training curricula based on required frameworks
- **Audit Preparation:** Identify which roles need refresher training before inspections
- **Hiring Criteria:** "Must have expert knowledge of FDA 21 CFR Part 312"

---

## 4. Phased Implementation Approach

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Add core schema objects and seed critical reference data

**Tasks:**
1. **Create Reference Tables** (7 tables)
   - regulatory_frameworks
   - gxp_training_modules
   - clinical_competencies
   - approval_types
   - process_definitions
   - career_paths
   - workflow_activities

2. **Create Junction Tables** (7 tables)
   - role_regulatory_frameworks
   - role_gxp_training
   - role_clinical_competencies
   - role_approval_authority
   - role_process_participation
   - career_path_steps
   - role_workflow_activities

3. **Add Direct Columns to org_roles** (16 columns)
   - GxP classification columns
   - Clinical/healthcare context columns
   - Career development columns
   - Workflow context columns

4. **Seed Critical Reference Data**
   - 20-30 regulatory frameworks (FDA, EMA, ICH standards)
   - 15-20 GxP training modules
   - 30-40 clinical competencies
   - Therapeutic areas (if not already seeded)
   - Disease areas (top 50-100)

**Deliverables:**
- ✅ Migration SQL script: `20251122_role_enrichment_phase1_foundation.sql`
- ✅ Seed data SQL: `20251122_seed_pharma_reference_data.sql`
- ✅ Validation queries to confirm schema changes

**Success Criteria:**
- All tables created without errors
- Reference data loaded (min 100 records across tables)
- Foreign key constraints validated
- Existing roles unaffected (no data loss)

---

### Phase 2: Medical Affairs Enrichment (Weeks 3-4)
**Goal:** Fully enrich Medical Affairs roles as pilot/template

**Scope:** ~43 Medical Affairs roles across 6 departments
- Field Medical
- Medical Information
- Medical Communications
- HEOR & Evidence Generation
- Pharmacovigilance
- Medical Affairs Leadership

**Tasks:**
1. **Direct Attribute Enrichment**
   - Set GxP role types (mostly GCP/GVP)
   - Set clinical trial phase focus
   - Set drug lifecycle stages
   - Set patient/HCP facing flags
   - Set typical time in role

2. **Junction Table Population**
   - Map roles to regulatory frameworks (ICH E6, ICH E9, GCP)
   - Map roles to GxP training modules
   - Map roles to clinical competencies
   - Map roles to therapeutic areas
   - Map roles to approval authority
   - Map roles to typical processes
   - Map roles to workflow activities

3. **KPI Definition**
   - Define 5-10 KPIs per Medical Affairs role
   - Set target ranges and measurement frequencies
   - Link via existing `role_kpis` junction table

**Example: Medical Science Liaison (MSL) Full Enrichment**
```sql
-- Direct attributes
UPDATE org_roles SET
    gxp_role_type = 'gcp',
    regulatory_inspection_role = false,
    pharmacovigilance_responsibility = true, -- MSLs report AEs
    clinical_trial_phase_focus = ARRAY['phase_3', 'phase_4', 'post_marketing'],
    drug_lifecycle_stage = ARRAY['clinical', 'commercial', 'lifecycle_management'],
    patient_facing = false,
    hcp_facing = true,
    typical_time_in_role_years = 3,
    advancement_potential = 'high', -- Can move to Med Director, Head of Medical Affairs
    typical_meeting_hours_per_week = 5,
    administrative_load_percent = 20,
    strategic_vs_tactical = 'tactical',
    innovation_vs_execution = 'balanced'
WHERE slug = 'medical-science-liaison';

-- Regulatory frameworks
INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_required, is_critical)
SELECT r.id, f.id, 'working_knowledge', true
FROM org_roles r, regulatory_frameworks f
WHERE r.slug = 'medical-science-liaison'
AND f.name IN ('ICH E6(R3) GCP', 'FDA Guidance for Industry - Good Pharmacovigilance Practices', 'ICH E2A Clinical Safety');

-- GxP training
INSERT INTO role_gxp_training (role_id, training_module_id, is_mandatory, due_within_days_of_hire)
SELECT r.id, t.id, true, 30
FROM org_roles r, gxp_training_modules t
WHERE r.slug = 'medical-science-liaison'
AND t.module_name IN ('GCP Fundamentals', 'Pharmacovigilance Essentials', 'Medical Information Response Standards');

-- Clinical competencies
INSERT INTO role_clinical_competencies (role_id, competency_id, required_proficiency, is_mandatory)
SELECT r.id, c.id, 'expert', true
FROM org_roles r, clinical_competencies c
WHERE r.slug = 'medical-science-liaison'
AND c.competency_name IN ('Scientific Communication', 'Clinical Trial Design', 'Therapeutic Area Expertise', 'Medical Literature Evaluation');

-- Approval authority
INSERT INTO role_approval_authority (role_id, approval_type_id, authority_level, monetary_limit, can_delegate)
SELECT r.id, a.id, 'recommender', 5000, false
FROM org_roles r, approval_types a
WHERE r.slug = 'medical-science-liaison'
AND a.approval_name IN ('Medical Education Grant', 'Investigator-Initiated Study Support');

-- Process participation
INSERT INTO role_process_participation (role_id, process_id, participation_type, typical_involvement_hours, frequency_per_year)
SELECT r.id, p.id, 'responsible', 20, 12
FROM org_roles r, process_definitions p
WHERE r.slug = 'medical-science-liaison'
AND p.process_name = 'KOL Engagement';

INSERT INTO role_process_participation (role_id, process_id, participation_type, typical_involvement_hours, frequency_per_year)
SELECT r.id, p.id, 'consulted', 5, 4
FROM org_roles r, process_definitions p
WHERE r.slug = 'medical-science-liaison'
AND p.process_name = 'Clinical Study Protocol Development';

-- Workflow activities
INSERT INTO role_workflow_activities (role_id, activity_id, frequency, time_allocation_percent, priority)
SELECT r.id, a.id, 'weekly', 30, 1
FROM org_roles r, workflow_activities a
WHERE r.slug = 'medical-science-liaison'
AND a.activity_name = 'Conduct KOL Engagements';

INSERT INTO role_workflow_activities (role_id, activity_id, frequency, time_allocation_percent, priority)
SELECT r.id, a.id, 'weekly', 15, 2
FROM org_roles r, workflow_activities a
WHERE r.slug = 'medical-science-liaison'
AND a.activity_name = 'Gather and Synthesize Medical Insights';

-- KPIs (using existing role_kpis table)
INSERT INTO role_kpis (role_id, kpi_id, is_primary, target_min, target_max, measurement_frequency)
SELECT r.id, k.id, true, 8, 12, 'monthly'
FROM org_roles r, kpi_definitions k
WHERE r.slug = 'medical-science-liaison'
AND k.name = 'KOL Engagements per Month';

INSERT INTO role_kpis (role_id, kpi_id, is_primary, target_min, target_max, measurement_frequency)
SELECT r.id, k.id, true, 10, 15, 'quarterly'
FROM org_roles r, kpi_definitions k
WHERE r.slug = 'medical-science-liaison'
AND k.name = 'Medical Insights Submitted per Quarter';
```

**Deliverables:**
- ✅ Enrichment SQL: `20251122_enrich_medical_affairs_roles.sql`
- ✅ Verification report: Enrichment coverage per role (% complete)
- ✅ Documentation: Medical Affairs enrichment guide (template for other functions)

**Success Criteria:**
- 100% of Medical Affairs roles have GxP classification
- 100% of Medical Affairs roles mapped to ≥3 regulatory frameworks
- 100% of Medical Affairs roles have ≥5 KPIs defined
- 100% of Medical Affairs roles mapped to ≥5 workflow activities
- 80%+ of Medical Affairs roles have complete enrichment

---

### Phase 3: Regulatory Affairs Enrichment (Weeks 5-6)
**Goal:** Enrich Regulatory Affairs roles (highest compliance needs)

**Scope:** ~114 Regulatory Affairs roles across 6 departments
- Regulatory Leadership & Strategy
- Regulatory Submissions & Operations
- Regulatory Intelligence & Policy
- CMC Regulatory Affairs
- Global Regulatory Affairs
- Regulatory Compliance & Systems

**Tasks:**
- Apply Medical Affairs enrichment template
- Add Regulatory-specific attributes:
  - Higher regulatory framework proficiency requirements
  - Extensive approval authority mapping
  - Complex process ownership (IND, NDA, BLA submissions)
  - Submission-specific KPIs (cycle time, approval rates)

**Regulatory-Specific Enrichment Examples:**
```sql
-- Regulatory Affairs Manager: High regulatory framework expertise
INSERT INTO role_regulatory_frameworks (role_id, framework_id, proficiency_required, is_critical)
SELECT r.id, f.id, 'expert', true
FROM org_roles r, regulatory_frameworks f
WHERE r.slug = 'regulatory-affairs-manager'
AND f.name IN (
    'FDA 21 CFR Part 312 (IND)',
    'FDA 21 CFR Part 314 (NDA)',
    'ICH M4 CTD',
    'FDA 21 CFR Part 11',
    'ICH E2 Pharmacovigilance'
);

-- Regulatory Affairs Manager: Final approval authority on submissions
INSERT INTO role_approval_authority (role_id, approval_type_id, authority_level, monetary_limit, requires_escalation_above)
SELECT r.id, a.id, 'final_approver', NULL, NULL
FROM org_roles r, approval_types a
WHERE r.slug = 'regulatory-affairs-manager'
AND a.approval_name IN ('IND Submission', '510(k) Submission', 'NDA Module Finalization');

-- Regulatory Affairs Manager: Process ownership
INSERT INTO role_process_participation (role_id, process_id, participation_type, typical_involvement_hours, frequency_per_year, is_critical_path)
SELECT r.id, p.id, 'accountable', 200, 2, true
FROM org_roles r, process_definitions p
WHERE r.slug = 'regulatory-affairs-manager'
AND p.process_name = 'IND Submission';
```

**Deliverables:**
- ✅ Enrichment SQL: `20251122_enrich_regulatory_affairs_roles.sql`
- ✅ Regulatory compliance matrix (which roles can approve what)
- ✅ Process ownership map (RACI matrix for regulatory processes)

**Success Criteria:**
- 100% of Regulatory roles mapped to ≥5 regulatory frameworks
- 100% of Regulatory roles have approval authority defined
- 100% of Regulatory roles mapped to key processes with RACI
- 90%+ complete enrichment

---

### Phase 4: Commercial & R&D Enrichment (Weeks 7-10)
**Goal:** Enrich remaining major functions

**Scope:**
- **Commercial:** Sales, Marketing, Market Access, Patient Services
- **R&D:** Discovery, Preclinical, Clinical Development, Translational Medicine
- **Clinical Operations:** Site Management, Clinical Trial Management, Data Management

**Tasks:**
- Apply enrichment template per function
- Function-specific customizations:
  - **Commercial:** Sales KPIs, HCP/payer stakeholders, market access processes
  - **R&D:** Preclinical competencies, discovery workflows, lab-based activities
  - **Clinical Ops:** GCP training, site management processes, patient recruitment KPIs

**Deliverables:**
- ✅ Enrichment SQL per function (3-4 scripts)
- ✅ Function-specific KPI catalogs
- ✅ Process maps per function

**Success Criteria:**
- 70%+ of Commercial roles enriched
- 70%+ of R&D roles enriched
- 70%+ of Clinical Ops roles enriched

---

### Phase 5: Remaining Functions & Long-Tail (Weeks 11-12)
**Goal:** Complete enrichment for all remaining roles

**Scope:**
- Quality Assurance & Quality Control
- Manufacturing & Supply Chain
- IT & Digital
- Finance, HR, Legal (support functions)

**Tasks:**
- Enrich support functions (often lower priority but still important)
- Fill gaps from earlier phases
- Run comprehensive validation queries

**Deliverables:**
- ✅ Final enrichment scripts
- ✅ Complete enrichment coverage report
- ✅ Data quality audit

**Success Criteria:**
- 90%+ of all roles have GxP classification (if applicable)
- 85%+ of all roles mapped to ≥3 reference data entities (skills, tools, frameworks, etc.)
- 80%+ of all roles have ≥5 KPIs defined
- 75%+ of all roles mapped to career paths

---

### Phase 6: Validation & Documentation (Weeks 13-14)
**Goal:** Ensure data quality and create usage documentation

**Tasks:**
1. **Data Quality Validation**
   - Run completeness queries (what % of roles have each enrichment?)
   - Check for orphaned records (junction table entries pointing to deleted roles)
   - Validate referential integrity
   - Check for duplicate or inconsistent data

2. **Generate Reports**
   - Enrichment coverage by function/department
   - Top 20 most enriched roles
   - Roles still missing critical enrichments
   - Regulatory framework coverage heatmap
   - KPI definition coverage

3. **Create Documentation**
   - Data dictionary for new tables/columns
   - Enrichment usage guide for product teams
   - Query cookbook (common queries for enriched data)
   - Data governance policy for ongoing maintenance

**Deliverables:**
- ✅ Data quality report
- ✅ Enrichment coverage dashboard
- ✅ Documentation package
- ✅ Governance procedures

**Success Criteria:**
- <5% data quality issues identified
- Documentation complete and reviewed
- Governance procedures approved

---

## 5. Data Sources & Seed Data Generation

### 5.1 Regulatory Frameworks

**Primary Sources:**
1. **FDA Website** (www.fda.gov)
   - 21 CFR (Code of Federal Regulations)
   - Guidance for Industry documents
   - CDER Manual of Policies and Procedures (MAPPs)

2. **EMA Website** (www.ema.europa.eu)
   - EU Clinical Trial Regulation
   - EMA Guidelines
   - GMP Annexes

3. **ICH Website** (www.ich.org)
   - ICH E-series (Efficacy)
   - ICH M-series (Multidisciplinary)
   - ICH Q-series (Quality)
   - ICH S-series (Safety)

**Seed Data Template:**
```sql
INSERT INTO regulatory_frameworks (name, framework_type, region, authority, description, url) VALUES
    ('FDA 21 CFR Part 312', 'submission', 'US', 'FDA', 'Investigational New Drug Application', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312'),
    ('ICH E6(R3)', 'compliance', 'Global', 'ICH', 'Good Clinical Practice', 'https://www.ich.org/page/efficacy-guidelines');
```

**Generation Strategy:**
- Extract from official websites using web scraping or APIs
- Manual curation for critical frameworks (top 50)
- Community contribution for regional variations

---

### 5.2 GxP Training Modules

**Primary Sources:**
1. **CDER Learn** (FDA training portal)
2. **EMA Training Portal**
3. **RAPS (Regulatory Affairs Professionals Society)** training catalog
4. **SoCRA (Society of Clinical Research Associates)** certification programs
5. **ACRP (Association of Clinical Research Professionals)** courses

**Seed Data Template:**
```sql
INSERT INTO gxp_training_modules (module_name, gxp_category, training_duration_hours, renewal_frequency_months, description) VALUES
    ('GCP Fundamentals', 'GCP', 8, 24, 'Introduction to Good Clinical Practice principles and regulations'),
    ('ICH E6(R2) Update', 'GCP', 4, 24, 'Overview of ICH E6(R2) revisions and implementation'),
    ('GMP for Non-Manufacturing Personnel', 'GMP', 4, 12, 'GMP awareness training for support staff');
```

**Generation Strategy:**
- Map common industry training programs
- Consult with training vendors (Coursera, LinkedIn Learning, regulatory training providers)
- Use LLM to generate training module descriptions based on regulatory requirements

---

### 5.3 Clinical Competencies

**Primary Sources:**
1. **ASCO (American Society of Clinical Oncology)** competency frameworks
2. **ACCP (American College of Clinical Pharmacy)** competencies
3. **ISPE (International Society for Pharmaceutical Engineering)** competency models
4. **Job postings** from major pharma companies (extract required competencies)

**Seed Data Template:**
```sql
INSERT INTO clinical_competencies (competency_name, category, description) VALUES
    ('Clinical Trial Design', 'clinical_research', 'Ability to design scientifically rigorous and ethically sound clinical trials'),
    ('Pharmacokinetics', 'medical_science', 'Understanding of drug absorption, distribution, metabolism, and excretion'),
    ('Biostatistics', 'data_science', 'Application of statistical methods to biological and clinical data');
```

**Generation Strategy:**
- Extract from competency models published by professional societies
- Analyze job postings (Indeed, LinkedIn) for common competency requirements
- Use LLM to categorize and normalize competency names

---

### 5.4 KPI Definitions

**Primary Sources:**
1. **Industry benchmarking reports** (e.g., Tufts CSDD, PhRMA)
2. **Job descriptions** (what metrics are roles evaluated on?)
3. **Performance management systems** (extract common KPIs)
4. **Consulting frameworks** (Deloitte, McKinsey pharma practice KPIs)

**Seed Data Template:**
```sql
INSERT INTO kpi_definitions (name, category, description, measurement_unit) VALUES
    ('KOL Engagements per Month', 'medical_affairs', 'Number of meaningful interactions with Key Opinion Leaders', 'count'),
    ('Submission Cycle Time', 'regulatory', 'Days from submission readiness to agency filing', 'days'),
    ('Clinical Trial Enrollment Rate', 'clinical_operations', 'Patients enrolled per month per site', 'patients/month/site');
```

**Generation Strategy:**
- Manual curation from industry reports
- Extract from job descriptions (performance metrics section)
- Use LLM to generate KPI definitions based on role responsibilities

---

### 5.5 Approval Types

**Primary Sources:**
1. **Corporate approval matrices** (delegation of authority documents)
2. **Regulatory guidance** (what requires formal approval?)
3. **SOPs** (Standard Operating Procedures) from pharma companies

**Seed Data Template:**
```sql
INSERT INTO approval_types (approval_name, category, regulatory_impact, typical_turnaround_days, description) VALUES
    ('Clinical Study Protocol', 'clinical', 'high', 30, 'Final approval required before study initiation'),
    ('Medical Education Grant', 'medical_affairs', 'medium', 14, 'Approval for unsolicited grant requests'),
    ('Promotional Material', 'commercial', 'high', 7, 'Regulatory and medical review of marketing materials');
```

**Generation Strategy:**
- Extract from public FDA guidance on required approvals
- Map common pharma approval workflows
- Consult with regulatory/compliance SMEs

---

### 5.6 Process Definitions

**Primary Sources:**
1. **FDA guidance documents** (describe regulatory processes)
2. **CDISC (Clinical Data Interchange Standards Consortium)** process models
3. **PhUSE (Pharmaceutical Users Software Exchange)** working groups
4. **Industry white papers** (process best practices)

**Seed Data Template:**
```sql
INSERT INTO process_definitions (process_name, process_type, typical_duration_days, complexity_level, regulatory_requirement, description) VALUES
    ('IND Submission', 'regulatory', 180, 'very_high', true, 'End-to-end process for Investigational New Drug application to FDA'),
    ('Clinical Study Startup', 'clinical', 90, 'high', true, 'Site selection, IRB submission, contract execution, site initiation'),
    ('Adverse Event Reporting', 'safety', 7, 'high', true, 'Detection, assessment, documentation, and reporting of AEs');
```

**Generation Strategy:**
- Map standard industry processes from regulatory guidance
- Extract from project management tools (Smartsheet, MS Project templates)
- Use LLM to generate process descriptions from regulatory documents

---

### 5.7 Workflow Activities

**Primary Sources:**
1. **Time-motion studies** (how do pharma professionals spend their time?)
2. **Calendar analysis** (what meetings do they attend?)
3. **Day-in-the-life** content (LinkedIn posts, blog articles)
4. **Job shadowing** (observe actual workflow)

**Seed Data Template:**
```sql
INSERT INTO workflow_activities (activity_name, category, typical_frequency, typical_duration_hours, requires_collaboration, description) VALUES
    ('Review Regulatory Intelligence Reports', 'planning', 'weekly', 2, false, 'Stay current on regulatory landscape changes'),
    ('Conduct KOL Engagement', 'execution', 'weekly', 1.5, false, 'Face-to-face or virtual meeting with Key Opinion Leader'),
    ('Cross-Functional Team Meeting', 'communication', 'weekly', 1, true, 'Collaborate with clinical, regulatory, commercial teams'),
    ('Respond to Medical Information Requests', 'execution', 'daily', 0.5, false, 'Answer unsolicited medical inquiries from HCPs');
```

**Generation Strategy:**
- Analyze job descriptions (responsibilities section)
- Extract from calendar studies (what meetings are recurring?)
- Use LLM to generate activity descriptions from role responsibilities

---

### 5.8 LLM-Assisted Seed Data Generation

**Strategy:** Use Claude/GPT-4 to accelerate seed data creation

**Approach 1: Structured Prompt for Regulatory Frameworks**
```
You are a regulatory affairs expert. Generate 20 FDA regulatory frameworks relevant to pharmaceutical drug development. For each, provide:

1. Name (official CFR citation or guidance title)
2. Framework type (submission, compliance, quality, safety)
3. Region (US)
4. Authority (FDA)
5. Description (1-2 sentences)
6. Typical roles that need to know this framework

Output as JSON array.
```

**Approach 2: Role-Specific KPI Generation**
```
You are an expert in pharmaceutical Medical Affairs. For the role "Medical Science Liaison (MSL)", generate 10 key performance indicators (KPIs) that this role is typically measured on.

For each KPI, provide:
- KPI name
- Category (medical_affairs)
- Description
- Measurement unit
- Typical target range (min-max)
- Measurement frequency (monthly, quarterly, annual)

Output as JSON array formatted for SQL INSERT.
```

**Approach 3: Workflow Activity Extraction from Role Description**
```
Given this role description for "Regulatory Affairs Manager":
[paste full role description]

Extract 15-20 discrete workflow activities that this role performs. For each, identify:
- Activity name (verb phrase)
- Category (planning, execution, review, communication, administrative)
- Typical frequency (daily, weekly, monthly, etc.)
- Typical duration in hours
- Whether it requires collaboration (boolean)

Output as JSON array.
```

**LLM Output Validation:**
- Human review of generated data for accuracy
- Cross-reference with authoritative sources
- Iterative refinement with domain experts

---

## 6. Usage Examples & Query Cookbook

### 6.1 Get Complete Role Profile with All Enrichments

```sql
SELECT
    r.name AS role_name,
    r.seniority_level,
    r.role_category,
    r.gxp_role_type,
    r.clinical_trial_phase_focus,
    r.drug_lifecycle_stage,
    r.typical_time_in_role_years,

    -- Aggregated counts
    COUNT(DISTINCT rrf.id) AS regulatory_frameworks_count,
    COUNT(DISTINCT rgt.id) AS required_training_modules,
    COUNT(DISTINCT rcc.id) AS clinical_competencies_count,
    COUNT(DISTINCT raa.id) AS approval_authorities,
    COUNT(DISTINCT rpp.id) AS process_participations,
    COUNT(DISTINCT rwa.id) AS workflow_activities,
    COUNT(DISTINCT rk.id) AS kpis_count,
    COUNT(DISTINCT rs.id) AS skills_count,
    COUNT(DISTINCT rt.id) AS tools_count

FROM org_roles r
LEFT JOIN role_regulatory_frameworks rrf ON r.id = rrf.role_id
LEFT JOIN role_gxp_training rgt ON r.id = rgt.role_id
LEFT JOIN role_clinical_competencies rcc ON r.id = rcc.role_id
LEFT JOIN role_approval_authority raa ON r.id = raa.role_id
LEFT JOIN role_process_participation rpp ON r.id = rpp.role_id
LEFT JOIN role_workflow_activities rwa ON r.id = rwa.role_id
LEFT JOIN role_kpis rk ON r.id = rk.role_id
LEFT JOIN role_skills rs ON r.id = rs.role_id
LEFT JOIN role_tools rt ON r.id = rt.role_id
WHERE r.slug = 'medical-science-liaison'
GROUP BY r.id, r.name, r.seniority_level, r.role_category, r.gxp_role_type,
         r.clinical_trial_phase_focus, r.drug_lifecycle_stage, r.typical_time_in_role_years;
```

---

### 6.2 Find All Roles Requiring Specific Regulatory Framework

```sql
-- Find all roles that need ICH E6(R3) GCP expertise
SELECT
    r.name AS role_name,
    d.name AS department_name,
    f.name AS function_name,
    rrf.proficiency_required,
    rrf.is_critical
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON r.function_id = f.id
JOIN role_regulatory_frameworks rrf ON r.id = rrf.role_id
JOIN regulatory_frameworks rf ON rrf.framework_id = rf.id
WHERE rf.name = 'ICH E6(R3) GCP'
ORDER BY rrf.proficiency_required DESC, f.name, d.name;
```

---

### 6.3 Generate Training Plan for New Hire in Role

```sql
-- Get all mandatory GxP training for a Medical Science Liaison
SELECT
    gtm.module_name,
    gtm.gxp_category,
    gtm.training_duration_hours,
    gtm.renewal_frequency_months,
    rgt.due_within_days_of_hire,
    rgt.renewal_reminder_days,
    gtm.description
FROM org_roles r
JOIN role_gxp_training rgt ON r.id = rgt.role_id
JOIN gxp_training_modules gtm ON rgt.training_module_id = gtm.id
WHERE r.slug = 'medical-science-liaison'
AND rgt.is_mandatory = true
ORDER BY rgt.due_within_days_of_hire ASC, gtm.module_name;
```

---

### 6.4 Find Roles by Therapeutic Area Expertise

```sql
-- Find all roles with Oncology as primary therapeutic area
SELECT
    r.name AS role_name,
    r.seniority_level,
    d.name AS department_name,
    f.name AS function_name,
    rta.is_primary
FROM org_roles r
JOIN org_departments d ON r.department_id = d.id
JOIN org_functions f ON r.function_id = f.id
JOIN role_therapeutic_areas rta ON r.id = rta.role_id
JOIN therapeutic_areas ta ON rta.therapeutic_area_id = ta.id
WHERE ta.name = 'Oncology'
AND rta.is_primary = true
ORDER BY f.name, d.name, r.seniority_level;
```

---

### 6.5 Get RACI Matrix for a Specific Process

```sql
-- Get RACI for "IND Submission" process
SELECT
    r.name AS role_name,
    d.name AS department_name,
    rpp.participation_type, -- 'owner', 'accountable', 'responsible', 'consulted', 'informed'
    rpp.typical_involvement_hours,
    rpp.frequency_per_year,
    rpp.is_critical_path
FROM process_definitions p
JOIN role_process_participation rpp ON p.id = rpp.process_id
JOIN org_roles r ON rpp.role_id = r.id
JOIN org_departments d ON r.department_id = d.id
WHERE p.process_name = 'IND Submission'
ORDER BY
    CASE rpp.participation_type
        WHEN 'accountable' THEN 1
        WHEN 'responsible' THEN 2
        WHEN 'owner' THEN 3
        WHEN 'consulted' THEN 4
        WHEN 'informed' THEN 5
    END,
    d.name;
```

---

### 6.6 Find Approval Authority by Role

```sql
-- What can a Regulatory Affairs Manager approve?
SELECT
    r.name AS role_name,
    at.approval_name,
    at.category,
    raa.authority_level,
    raa.monetary_limit,
    raa.requires_escalation_above,
    raa.can_delegate
FROM org_roles r
JOIN role_approval_authority raa ON r.id = raa.role_id
JOIN approval_types at ON raa.approval_type_id = at.id
WHERE r.slug = 'regulatory-affairs-manager'
ORDER BY at.category, raa.authority_level;
```

---

### 6.7 Generate Weekly Time Allocation for a Role

```sql
-- How does a Medical Science Liaison spend their week?
SELECT
    wa.activity_name,
    wa.category,
    rwa.frequency,
    rwa.time_allocation_percent,
    (rwa.time_allocation_percent / 100.0) * 40 AS estimated_hours_per_week, -- Assume 40hr work week
    rwa.priority
FROM org_roles r
JOIN role_workflow_activities rwa ON r.id = rwa.role_id
JOIN workflow_activities wa ON rwa.activity_id = wa.id
WHERE r.slug = 'medical-science-liaison'
ORDER BY rwa.priority ASC;
```

---

### 6.8 Find Career Progression Path for a Role

```sql
-- What is the career path for a Medical Science Liaison?
SELECT
    cp.path_name,
    cps.step_sequence,
    r.name AS role_at_step,
    r.seniority_level,
    cps.typical_years_at_step,
    cps.skills_to_develop,
    cps.typical_transition_rate
FROM career_paths cp
JOIN career_path_steps cps ON cp.id = cps.career_path_id
JOIN org_roles r ON cps.role_id = r.id
WHERE cp.path_name = 'MSL Career Track'
ORDER BY cps.step_sequence ASC;
```

---

### 6.9 Enrichment Coverage Report (Data Quality)

```sql
-- Which roles are fully enriched vs. missing data?
WITH role_enrichment AS (
    SELECT
        r.id,
        r.name,
        CASE WHEN r.gxp_role_type IS NOT NULL THEN 1 ELSE 0 END AS has_gxp_classification,
        CASE WHEN r.clinical_trial_phase_focus IS NOT NULL THEN 1 ELSE 0 END AS has_clinical_phase,
        CASE WHEN r.typical_time_in_role_years IS NOT NULL THEN 1 ELSE 0 END AS has_time_in_role,
        CASE WHEN COUNT(DISTINCT rrf.id) >= 3 THEN 1 ELSE 0 END AS has_regulatory_frameworks,
        CASE WHEN COUNT(DISTINCT rgt.id) >= 2 THEN 1 ELSE 0 END AS has_training_modules,
        CASE WHEN COUNT(DISTINCT rcc.id) >= 3 THEN 1 ELSE 0 END AS has_competencies,
        CASE WHEN COUNT(DISTINCT rk.id) >= 5 THEN 1 ELSE 0 END AS has_kpis,
        CASE WHEN COUNT(DISTINCT rs.id) >= 5 THEN 1 ELSE 0 END AS has_skills,
        CASE WHEN COUNT(DISTINCT rwa.id) >= 5 THEN 1 ELSE 0 END AS has_workflow_activities
    FROM org_roles r
    LEFT JOIN role_regulatory_frameworks rrf ON r.id = rrf.role_id
    LEFT JOIN role_gxp_training rgt ON r.id = rgt.role_id
    LEFT JOIN role_clinical_competencies rcc ON r.id = rcc.role_id
    LEFT JOIN role_kpis rk ON r.id = rk.role_id
    LEFT JOIN role_skills rs ON r.id = rs.role_id
    LEFT JOIN role_workflow_activities rwa ON r.id = rwa.role_id
    GROUP BY r.id, r.name, r.gxp_role_type, r.clinical_trial_phase_focus, r.typical_time_in_role_years
)
SELECT
    name,
    (has_gxp_classification + has_clinical_phase + has_time_in_role + has_regulatory_frameworks +
     has_training_modules + has_competencies + has_kpis + has_skills + has_workflow_activities) AS enrichment_score,
    ROUND(((has_gxp_classification + has_clinical_phase + has_time_in_role + has_regulatory_frameworks +
            has_training_modules + has_competencies + has_kpis + has_skills + has_workflow_activities) / 9.0) * 100, 1) AS enrichment_percent
FROM role_enrichment
ORDER BY enrichment_score DESC, name;
```

---

## 7. Data Governance & Maintenance

### 7.1 Ownership Model

| Data Domain | Primary Owner | Update Frequency | Approval Required |
|-------------|--------------|------------------|-------------------|
| **Regulatory Frameworks** | Chief Regulatory Officer | Quarterly | Yes (Regulatory Leadership) |
| **GxP Training Modules** | Head of Quality Training | Annually | Yes (QA/Training) |
| **Clinical Competencies** | VP Medical Affairs | Annually | No (delegated) |
| **Approval Types** | Chief Compliance Officer | As needed | Yes (Legal/Compliance) |
| **Process Definitions** | Process Excellence Team | Semi-annually | Yes (Department Head) |
| **Career Paths** | Chief People Officer | Annually | Yes (HR Leadership) |
| **Workflow Activities** | Department Heads | As needed | No (delegated) |
| **KPI Definitions** | Performance Management Team | Semi-annually | Yes (Function VP) |

### 7.2 Update Triggers

**When to Update Role Enrichments:**
1. **New Regulatory Guidance:** Add new regulatory framework, map affected roles
2. **Organizational Restructure:** Update reporting relationships, department assignments
3. **Job Family Changes:** Revise seniority levels, career paths
4. **Process Re-engineering:** Update process participation, RACI matrices
5. **Competency Model Refresh:** Add/remove clinical competencies
6. **Performance Management Cycle:** Review and update KPIs annually

### 7.3 Quality Assurance

**Monthly Data Quality Checks:**
```sql
-- Check 1: Roles missing critical enrichments
SELECT COUNT(*) AS roles_without_gxp_classification
FROM org_roles
WHERE gxp_role_type IS NULL
AND function_id IN (SELECT id FROM org_functions WHERE slug IN ('medical-affairs', 'regulatory-affairs', 'clinical-operations'));

-- Check 2: Orphaned junction table entries
SELECT COUNT(*) AS orphaned_framework_mappings
FROM role_regulatory_frameworks rrf
WHERE NOT EXISTS (SELECT 1 FROM org_roles r WHERE r.id = rrf.role_id);

-- Check 3: KPI targets missing measurement frequency
SELECT COUNT(*) AS kpis_missing_frequency
FROM role_kpis
WHERE measurement_frequency IS NULL;
```

**Quarterly Enrichment Audits:**
- Generate enrichment coverage report
- Identify roles with <50% enrichment
- Prioritize enrichment backlog
- Review data quality issues

### 7.4 Version Control

**Approach:** Track changes to reference data (especially regulatory frameworks)

```sql
-- Add versioning columns to reference tables
ALTER TABLE regulatory_frameworks ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE regulatory_frameworks ADD COLUMN previous_version_id UUID REFERENCES regulatory_frameworks(id);
ALTER TABLE regulatory_frameworks ADD COLUMN superseded_by_id UUID REFERENCES regulatory_frameworks(id);
ALTER TABLE regulatory_frameworks ADD COLUMN effective_from DATE;
ALTER TABLE regulatory_frameworks ADD COLUMN effective_to DATE;

-- Example: Update ICH E6 to R3
INSERT INTO regulatory_frameworks (name, framework_type, region, authority, version, previous_version_id, effective_from)
VALUES ('ICH E6(R3) GCP', 'compliance', 'Global', 'ICH', 3, '{ich_e6_r2_id}', '2024-05-09');

UPDATE regulatory_frameworks
SET superseded_by_id = '{ich_e6_r3_id}', effective_to = '2024-05-08'
WHERE id = '{ich_e6_r2_id}';
```

---

## 8. Persona Generation Impact

### 8.1 How Enriched Roles Enable Better Personas

**Current Persona Generation:**
- 4 MECE personas per role based on behavioral differences only
- Limited context on what personas actually DO
- Generic goals/challenges not grounded in real workflows

**With Role Enrichment:**
- **Persona 1: Early-Career MSL (2 years in role)**
  - Inherits all role attributes
  - Override: Lower confidence in KOL engagement, higher need for mentorship
  - Workflow focus: 60% tactical execution (KOL meetings), 40% learning
  - KPI targets: Lower end of range (8 KOL engagements/month vs. 12 for senior)

- **Persona 2: Senior MSL (5+ years, on leadership track)**
  - Inherits all role attributes
  - Override: Higher strategic involvement, mentors junior MSLs
  - Workflow focus: 50% execution, 30% strategy, 20% mentorship
  - Additional approval authority: Can approve grants up to $10K (vs. $5K for junior)

- **Persona 3: Specialist MSL (Oncology expert, not interested in management)**
  - Inherits all role attributes
  - Override: Deep therapeutic area expertise, not on management track
  - Workflow focus: 70% tactical, 30% scientific deep-dives
  - Career path: Lateral move to Medical Director (IC track) vs. people management

- **Persona 4: Transition MSL (From clinical practice, <1 year in industry)**
  - Inherits all role attributes
  - Override: Strong clinical background, learning industry norms
  - Workflow focus: 50% execution, 50% adaptation/learning
  - Training needs: Additional industry-specific modules beyond standard GxP

### 8.2 Persona Differentiation Matrix

| Attribute | Early-Career MSL | Senior MSL | Specialist MSL | Transition MSL |
|-----------|-----------------|------------|----------------|----------------|
| **Base Role Attributes** | ✓ Inherits all | ✓ Inherits all | ✓ Inherits all | ✓ Inherits all |
| **Time in Role** | 2 years | 5+ years | 8+ years | <1 year |
| **KOL Engagement Target** | 8-10/month | 10-12/month | 10-12/month | 6-8/month |
| **Strategic Involvement** | Low (10%) | High (30%) | Medium (15%) | Low (5%) |
| **Approval Authority** | $5K grants | $10K grants | $5K grants | $3K grants |
| **Career Aspiration** | Learn & grow | Team leadership | Therapeutic expert | Industry transition |
| **Training Needs** | Standard GxP | Leadership dev | Advanced TA courses | Industry fundamentals + GxP |
| **Workflow Focus** | Execution (60%) | Strategy (30%) + Execution (50%) | Deep science (30%) + Execution (70%) | Learning (50%) + Execution (50%) |

---

## 9. AI Agent Training Impact

### 9.1 How Enriched Roles Enable Smarter AI Agents

**Current AI Agent Training:**
- Generic prompts: "You are a helpful medical affairs assistant"
- No role-specific context
- Can't assess when to escalate decisions
- No understanding of regulatory constraints

**With Role Enrichment:**

**Example 1: Regulatory Compliance Agent**
```
System Prompt:
You are a Regulatory Affairs Manager AI assistant with the following context:

ROLE PROFILE:
- GxP Role Type: GCP (Good Clinical Practice)
- Regulatory Inspection Role: Yes (interact with FDA during inspections)
- SOX Critical: Yes (financial controls apply)
- 21 CFR Part 11 Required: Yes (electronic signatures binding)

REGULATORY FRAMEWORKS (Expert Level):
- FDA 21 CFR Part 312 (IND submissions)
- FDA 21 CFR Part 314 (NDA submissions)
- ICH M4 CTD (Common Technical Document)
- FDA 21 CFR Part 11 (Electronic records)

APPROVAL AUTHORITY:
- Final Approver: IND Submission, 510(k) Submission, NDA Module Finalization
- Escalation Required: If submission involves novel endpoint (escalate to VP Regulatory)

KEY PROCESSES (Accountable):
- IND Submission (200 hours involvement, 2x per year, critical path)
- Regulatory Intelligence Monitoring (10 hours/month, ongoing)

TYPICAL WORKFLOW:
- Daily: Review submission status dashboards, respond to agency queries
- Weekly: Cross-functional submission planning meetings
- Monthly: Present regulatory strategy to leadership

Based on this context, when a user asks you to approve a document or make a regulatory decision:
1. Check if it falls within your approval authority
2. If monetary value exceeds $X or involves novel science, recommend escalation
3. Reference relevant regulatory frameworks in your response
4. Consider GCP compliance and 21 CFR Part 11 requirements
```

**Example 2: Medical Science Liaison Agent**
```
System Prompt:
You are a Medical Science Liaison (MSL) AI assistant with the following context:

ROLE PROFILE:
- GxP Role Type: GCP
- Pharmacovigilance Responsibility: Yes (must report adverse events)
- Therapeutic Area: Oncology (primary)
- Clinical Trial Phase Focus: Phase 3, Phase 4, Post-marketing
- Patient Facing: No / HCP Facing: Yes

CLINICAL COMPETENCIES (Expert Level):
- Scientific Communication
- Clinical Trial Design
- Therapeutic Area Expertise (Oncology)
- Medical Literature Evaluation

KPIs:
- KOL Engagements: 8-12 per month
- Medical Insights: 10-15 per quarter
- Congress Attendance: 2-4 per year

WORKFLOW ACTIVITIES (Time Allocation):
- Conduct KOL Engagements: 30% of time (weekly frequency, priority #1)
- Gather Medical Insights: 15% of time (weekly frequency, priority #2)
- Respond to Medical Inquiries: 10% of time (daily frequency, priority #3)

APPROVAL AUTHORITY:
- Recommender: Medical Education Grants (up to $5K, cannot approve alone)
- Escalation: Investigator-Initiated Study Support requests to Medical Director

Based on this context:
1. When discussing clinical data, cite relevant oncology trials and KOL opinions
2. If an adverse event is mentioned, remind user of pharmacovigilance reporting requirements
3. If user requests grant approval >$5K, explain that this exceeds your authority
4. Prioritize KOL engagement strategies in your recommendations
```

### 9.2 Dynamic Agent Behavior Based on Enrichments

**Scenario: User asks AI agent to approve a medical education grant**

**Without Enrichment:**
```
AI: "I can help you with that. What is the grant amount?"
User: "$15,000"
AI: "I've noted your request. Is there anything else I can help with?"
```

**With Enrichment (MSL Agent):**
```
AI: "I can help you with the medical education grant request. However, I need to inform you that as an MSL, my approval authority is limited to grants up to $5,000. This $15,000 request exceeds my delegation limit and requires approval from the Medical Director.

Would you like me to:
1. Prepare a recommendation memo for the Medical Director?
2. Check if this grant aligns with our therapeutic area strategy (Oncology)?
3. Review similar grants approved in the past quarter for benchmarking?
```

**With Enrichment (Medical Director Agent):**
```
AI: "I can review this $15,000 medical education grant request. Based on my approval authority, I can approve grants up to $50,000 independently.

Before I proceed, let me verify:
1. Is this grant consistent with our Oncology strategy?
2. Does the requesting institution have a current MSA (Master Services Agreement)?
3. Have we budgeted for this in the current fiscal year?
4. Does this align with our KOL engagement strategy?

Also, per our pharmacovigilance policy, I'll flag that any adverse events reported during this educational program must be captured in our safety database within 24 hours.
```

---

## 10. Success Metrics & KPIs for Enrichment Initiative

### 10.1 Data Completeness Metrics

| Metric | Target | Current Baseline | How Measured |
|--------|--------|------------------|--------------|
| % Roles with GxP Classification | 100% (for GxP-relevant roles) | 0% | `COUNT(roles with gxp_role_type) / COUNT(total GxP roles)` |
| % Roles Mapped to ≥3 Regulatory Frameworks | 85% | 0% | `COUNT(roles with ≥3 frameworks) / COUNT(all roles)` |
| % Roles with ≥5 KPIs Defined | 80% | ~10% (existing KPI table) | `COUNT(roles with ≥5 KPIs) / COUNT(all roles)` |
| % Roles Mapped to ≥5 Workflow Activities | 75% | 0% | `COUNT(roles with ≥5 activities) / COUNT(all roles)` |
| % Roles with Career Path Mapping | 70% | 0% | `COUNT(roles in career_path_steps) / COUNT(all roles)` |
| % Roles with Approval Authority Defined | 60% | 0% | `COUNT(roles with ≥1 approval type) / COUNT(all roles)` |

### 10.2 Data Quality Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Orphaned Junction Table Records | <1% | `COUNT(junction records with no parent) / COUNT(all junction records)` |
| Duplicate Reference Data | <0.5% | `COUNT(duplicate names in reference tables) / COUNT(all reference records)` |
| Missing Mandatory Enrichments | <5% | `COUNT(roles missing critical fields) / COUNT(all roles)` |
| Data Freshness (Last Updated) | 90% updated in last 12 months | `COUNT(roles updated in last year) / COUNT(all roles)` |

### 10.3 Business Impact Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Persona Accuracy (User Feedback) | >4.0/5.0 | User survey: "How accurately does this persona reflect real-world roles?" |
| AI Agent Helpfulness (Role-Specific) | >4.2/5.0 | User survey: "How helpful was the AI agent for your role?" |
| Time to Generate Role-Based Workflow | <5 minutes | System metric: Time from role selection to workflow generation |
| Regulatory Compliance Incidents | 0 | Audit findings related to role/training misalignment |

### 10.4 Adoption Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Product Teams Using Enriched Data | 100% (all teams) | # Teams querying enriched tables / Total product teams |
| AI Agents Leveraging Role Context | 80% of agents | # Agents with role-based prompts / Total agents |
| Personas Generated from Enriched Roles | 100% (all new personas) | # Personas using enrichment data / Total personas |

---

## 11. Risks & Mitigation Strategies

### 11.1 Data Maintenance Burden

**Risk:** Enrichment creates extensive data that becomes stale if not maintained.

**Mitigation:**
- Assign clear ownership for each reference table (Section 7.1)
- Automate data quality checks (monthly scheduled jobs)
- Implement version control for regulatory frameworks (they change frequently)
- Prioritize: Medical Affairs and Regulatory Affairs roles updated quarterly, others annually

### 11.2 Over-Specification

**Risk:** Too much detail makes data rigid and hard to apply across contexts.

**Mitigation:**
- Use ranges (min/max) instead of exact values where possible
- Flag attributes as "typical" vs. "mandatory"
- Allow persona overrides of role attributes
- Document that enrichments represent "baseline" not "absolute truth"

### 11.3 Regulatory Change Velocity

**Risk:** Regulatory frameworks change frequently (e.g., FDA guidance updates).

**Mitigation:**
- Implement versioning for regulatory_frameworks table
- Subscribe to FDA/EMA/ICH update notifications
- Quarterly review cycle for regulatory data
- "Effective from/to" dates to track framework validity

### 11.4 Cross-Cultural Applicability

**Risk:** Enrichments may be US-centric and not apply globally.

**Mitigation:**
- Add `region` field to reference tables
- Create region-specific variants (e.g., "FDA 21 CFR Part 312" vs. "EMA Clinical Trial Regulation")
- Allow multi-region mapping (role can have both FDA and EMA frameworks)
- Document assumptions (e.g., "KPI targets based on US pharma benchmarks")

### 11.5 User Confusion

**Risk:** Users may not understand which data comes from roles vs. personas.

**Mitigation:**
- Clear documentation: "Roles = structural baseline, Personas = behavioral overlay"
- UI design: Show inherited vs. overridden attributes in persona views
- Training materials explaining role-persona relationship
- Query examples demonstrating inheritance

---

## 12. Next Steps & Recommendations

### Immediate Actions (Next 2 Weeks)

1. **Schema Approval**
   - Review proposed schema changes with Data Team
   - Get sign-off from vital-platform-orchestrator
   - Validate against ARD/PRD requirements

2. **Phase 1 Implementation**
   - Create migration script for new tables and columns
   - Seed critical reference data (regulatory frameworks, therapeutic areas)
   - Run validation queries

3. **Pilot with Medical Affairs**
   - Select 5 representative Medical Affairs roles
   - Manually enrich with full attribute set
   - Test persona generation from enriched roles
   - Gather feedback from Medical Affairs SMEs

### Short-Term (Next 3 Months)

4. **Complete Medical Affairs & Regulatory Affairs**
   - Follow phased approach (Phases 2-3)
   - Achieve 90%+ enrichment for these critical functions
   - Document enrichment patterns as templates

5. **Build Tooling**
   - Create web UI for data stewards to update reference data
   - Build enrichment validation dashboard
   - Develop LLM-assisted seed data generation scripts

6. **Integrate with Persona System**
   - Update persona generation logic to inherit from enriched roles
   - Test AI agent prompts with role context
   - Validate workflow generation accuracy

### Long-Term (6-12 Months)

7. **Expand to All Functions**
   - Complete Commercial, R&D, Clinical Ops (Phase 4)
   - Complete support functions (Phase 5)
   - Achieve 75%+ overall enrichment

8. **Advanced Analytics**
   - Build capability heat maps (which roles can execute which processes?)
   - Create regulatory risk dashboards (which roles are audit-exposed?)
   - Develop career progression simulators

9. **Continuous Improvement**
   - Establish quarterly review cycles
   - Implement user feedback loops
   - Expand to adjacent industries (medtech, biotech, CROs)

---

## 13. Conclusion

This enrichment strategy transforms the VITAL platform's `org_roles` table from a basic organizational directory into a **comprehensive, industry-specific knowledge base** that captures the full context of pharmaceutical and biotech roles.

**Key Benefits:**
- **Regulatory Compliance:** Built-in GxP classification, training requirements, framework expertise
- **Healthcare Context:** Therapeutic areas, clinical phases, drug lifecycle stages
- **Performance Management:** Role-specific KPIs with targets and frequencies
- **Decision Support:** Approval matrices, process ownership, RACI clarity
- **Career Development:** Progression paths, skill requirements, time-in-role expectations
- **Workflow Intelligence:** Day-in-the-life activities, time allocation, collaboration patterns

**Strategic Impact:**
- **Better Personas:** 4 MECE personas per role with realistic, grounded attributes
- **Smarter AI Agents:** Context-aware agents that understand regulatory constraints and approval limits
- **Faster Onboarding:** Auto-generated training plans and role expectations
- **Risk Mitigation:** Clear visibility into GxP roles and audit exposure
- **Data-Driven Decisions:** Objective role comparisons, capability gap analysis

**Implementation Path:**
- Phased approach over 12-14 weeks
- Start with Medical Affairs (pilot) → Regulatory Affairs → Commercial/R&D → Support Functions
- Balance manual curation with LLM-assisted generation
- Strong data governance from day one

This enrichment positions VITAL as the **gold standard** for pharmaceutical role intelligence, enabling unprecedented precision in persona modeling, AI agent specialization, and workflow automation.

---

**Document Prepared By:** VITAL Data Strategist Agent
**Review Status:** Awaiting vital-platform-orchestrator approval
**Next Review Date:** Upon completion of Phase 1 implementation
