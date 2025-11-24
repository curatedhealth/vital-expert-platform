# Complete Attribute Mapping for org_roles Table

**Date:** 2025-11-22
**Purpose:** Comprehensive inventory of ALL org_roles attributes to ensure complete enrichment
**Status:** Ready for Medical Affairs enrichment

---

## 📊 Attribute Inventory Summary

| Category | Attribute Count | Populated | Need Enrichment |
|----------|----------------|-----------|----------------|
| **Core Attributes** | 22 | 11 | 11 |
| **Pharma-Specific Enrichment** | 16 | 0 | 16 |
| **Total Direct Columns** | **38** | **11** | **27** |
| **Junction Table Data** | 7 tables | 0 | 7 |
| **Reference Data Needed** | 7 tables | 0 | 7 |

---

## ✅ CURRENTLY POPULATED (from JSON export)

These 11 fields are populated for the 100 Medical Affairs roles:

### 1. Identity & Structure (6 fields)
```
id                    - UUID primary key ✓
name                  - Role name (e.g., "Global Medical Science Liaison") ✓
slug                  - URL-friendly identifier ✓
department_id         - UUID foreign key ✓
function_id           - UUID foreign key ✓
idx                   - Integer index ✓
```

### 2. Basic Classification (4 fields)
```
seniority_level       - 'senior', 'mid', 'director', 'c_suite', 'executive' ✓
leadership_level      - Currently all 'individual_contributor' (NEEDS FIX) ✓
role_category         - 'field', 'office', 'hybrid' ✓
geographic_scope      - 'global', 'regional', 'local' ✓
```

### 3. Timestamps (1 field)
```
created_at            - Timestamp ✓
```

---

## ❌ NULL / MISSING - NEED ENRICHMENT (27 direct columns)

### Category 1: Core Description & Requirements (8 fields)
```
description                  - TEXT - Comprehensive role description
role_title                   - VARCHAR(255) - Official job title
role_type                    - VARCHAR(50) - NULL in export, but exists in enrichment migration
required_skills              - TEXT[] - Array of skills
required_certifications      - TEXT[] - Array of certifications
years_experience_min         - INTEGER - Minimum years experience
years_experience_max         - INTEGER - Maximum years experience
reports_to_role_id           - UUID - Manager role reference
```

### Category 2: Work Model & Travel (7 fields)
```
work_location_model          - NULL in export
typical_work_pattern         - NULL in export
typical_education_level      - NULL in export
travel_percentage_min        - NULL in export
travel_percentage_max        - NULL in export
overnight_travel_frequency   - NULL in export
international_travel         - NULL in export
```

### Category 3: Organization & Hierarchy (8 fields)
```
grade_level                  - NULL in export
job_code                     - NULL in export
layers_below                 - NULL in export
organization_type            - NULL in export
typical_organization_size    - NULL in export
direct_reports_min           - NULL in export
direct_reports_max           - NULL in export
indirect_reports_min         - NULL in export
indirect_reports_max         - NULL in export
team_size_min                - NULL in export
team_size_max                - NULL in export
```

### Category 4: Budget & Financial (4 fields)
```
budget_authority_type        - NULL in export
budget_authority_min         - NULL in export
budget_authority_max         - NULL in export
budget_authority_limit       - NULL in export
budget_currency              - NULL in export
budget_min_usd               - NULL in export
budget_max_usd               - NULL in export
```

---

## 🧬 PHARMA-SPECIFIC ENRICHMENT COLUMNS (16 fields from migration 20251122000001)

### Regulatory & Compliance (5 fields)
```sql
gxp_role_type                     TEXT CHECK ('gmp', 'gcp', 'glp', 'gvp', 'gdp', 'non_gxp')
regulatory_inspection_role        BOOLEAN DEFAULT false
sox_critical                      BOOLEAN DEFAULT false
cfr_part_11_required              BOOLEAN DEFAULT false
pharmacovigilance_responsibility  BOOLEAN DEFAULT false
```

### Clinical/Healthcare Context (4 fields)
```sql
clinical_trial_phase_focus   TEXT[] - ['phase_1', 'phase_2', 'phase_3', 'phase_4', 'post_marketing']
drug_lifecycle_stage         TEXT[] - ['discovery', 'preclinical', 'clinical', 'regulatory_submission', 'commercial', 'lifecycle_management']
patient_facing               BOOLEAN DEFAULT false
hcp_facing                   BOOLEAN DEFAULT false
```

### Career & Development (3 fields)
```sql
typical_time_in_role_years   INTEGER
advancement_potential        TEXT CHECK ('high', 'moderate', 'limited', 'terminal')
typical_entry_point          BOOLEAN DEFAULT false
```

### Workflow Context (4 fields)
```sql
typical_meeting_hours_per_week  INTEGER
administrative_load_percent     INTEGER CHECK (0-100)
strategic_vs_tactical           TEXT CHECK ('strategic', 'tactical', 'balanced')
innovation_vs_execution         TEXT CHECK ('innovation_focused', 'execution_focused', 'balanced')
```

---

## 🔗 JUNCTION TABLE DATA (7 many-to-many relationships)

### 1. role_regulatory_frameworks
Maps roles to regulatory frameworks (FDA, EMA, ICH) with proficiency levels:
```
- framework_id (references regulatory_frameworks)
- proficiency_required: 'awareness', 'working_knowledge', 'advanced', 'expert'
- is_critical: boolean
- assessment_frequency: 'upon_hire', 'annual', 'biannual', 'continuous'
```

### 2. role_gxp_training
Maps roles to required GxP training modules:
```
- training_module_id (references gxp_training_modules)
- is_mandatory: boolean
- due_within_days_of_hire: integer (default 90)
- renewal_reminder_days: integer (default 30)
```

### 3. role_clinical_competencies
Maps roles to clinical/pharmaceutical competencies:
```
- competency_id (references clinical_competencies)
- required_proficiency: 'foundational', 'intermediate', 'advanced', 'expert'
- years_experience_in_competency: integer
- is_mandatory: boolean
```

### 4. role_approval_authority
Maps roles to approval types with monetary limits:
```
- approval_type_id (references approval_types)
- authority_level: 'final_approver', 'co_approver', 'recommender', 'reviewer', 'informed'
- monetary_limit: numeric
- requires_escalation_above: numeric
- can_delegate: boolean
```

### 5. role_process_participation
Maps roles to business processes with RACI matrix:
```
- process_id (references process_definitions)
- participation_type: 'owner', 'accountable', 'responsible', 'consulted', 'informed'
- typical_involvement_hours: integer
- frequency_per_year: integer
- is_critical_path: boolean
```

### 6. career_path_steps
Maps roles to career progression paths:
```
- career_path_id (references career_paths)
- step_sequence: integer
- typical_years_at_step: integer
- skills_to_develop: text[]
- competencies_to_acquire: uuid[]
- typical_transition_rate: numeric (0-1)
```

### 7. role_workflow_activities
Maps roles to workflow activities with time allocation:
```
- activity_id (references workflow_activities)
- frequency: 'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'ad_hoc'
- time_allocation_percent: integer (0-100)
- priority: integer
- is_mandatory: boolean
```

---

## 📋 REFERENCE DATA TABLES (7 master data tables)

### 1. regulatory_frameworks
Master catalog of regulatory frameworks:
```
Examples: "ICH GCP E6", "FDA 21 CFR Part 312", "PhRMA Code", "Sunshine Act"
Fields: name, framework_type, region, authority, description, effective_date, url
```

### 2. gxp_training_modules
GxP training modules catalog:
```
Examples: "GCP Fundamentals", "GVP Basics", "Pharmacovigilance 101"
Fields: module_name, gxp_category, training_duration_hours, renewal_frequency_months
```

### 3. clinical_competencies
Clinical and pharmaceutical competencies:
```
Examples: "KOL Engagement", "Scientific Communication", "Clinical Trial Design"
Fields: competency_name, category, description, typical_roles
```

### 4. approval_types
Types of approvals and authorizations:
```
Examples: "Medical Information Response", "Publication Approval", "Advisory Board Budget"
Fields: approval_name, category, regulatory_impact, typical_turnaround_days
```

### 5. process_definitions
Pharmaceutical business processes:
```
Examples: "Adverse Event Reporting", "Medical Review Process", "KOL Engagement Protocol"
Fields: process_name, process_type, typical_duration_days, complexity_level
```

### 6. career_paths
Career progression paths:
```
Examples: "MSL Career Ladder", "Medical Affairs Leadership Track"
Fields: path_name, function_id, department_id, typical_duration_years, path_type
```

### 7. workflow_activities
Workflow activities catalog:
```
Examples: "KOL Interaction", "Insights Documentation", "Team Huddle"
Fields: activity_name, category, typical_frequency, typical_duration_hours
```

---

## 🎯 ENRICHMENT PRIORITIES FOR 100 MEDICAL AFFAIRS ROLES

### MUST ENRICH (Critical for persona generation):

#### Direct Columns - Priority 1 (11 fields):
1. `description` - 2-3 paragraph role description
2. `required_skills` - Array of 8-12 skills
3. `required_certifications` - Array of 2-5 certifications (e.g., PharmD, PhD)
4. `years_experience_min` / `years_experience_max` - Experience range
5. `travel_percentage_min` / `travel_percentage_max` - Travel requirements
6. `gxp_role_type` - GxP classification (critical for MSL, MI roles)
7. `hcp_facing` - Boolean (true for most MA roles)
8. `regulatory_inspection_role` - Boolean
9. `pharmacovigilance_responsibility` - Boolean (true for MSL, MI)
10. `typical_meeting_hours_per_week` - Workflow context
11. `strategic_vs_tactical` - Role orientation

#### Junction Tables - Priority 1 (3 mappings):
1. **role_regulatory_frameworks** - Map to 3-5 frameworks per role
2. **role_gxp_training** - Map to 2-4 training modules per role
3. **role_clinical_competencies** - Map to 5-8 competencies per role

### SHOULD ENRICH (Enhances persona quality):

#### Direct Columns - Priority 2 (8 fields):
1. `reports_to_role_id` - Reporting hierarchy
2. `clinical_trial_phase_focus` - Relevant for clinical-facing roles
3. `drug_lifecycle_stage` - Role's focus in drug development
4. `typical_time_in_role_years` - Career planning
5. `advancement_potential` - Career progression
6. `administrative_load_percent` - Work pattern
7. `typical_work_pattern` - Remote/hybrid/office
8. `work_location_model` - Work location flexibility

#### Junction Tables - Priority 2 (2 mappings):
1. **role_workflow_activities** - Daily/weekly activities
2. **role_process_participation** - Business processes (RACI)

### OPTIONAL ENRICH (Nice to have):

#### Direct Columns - Priority 3 (8 fields):
1. Budget fields (if applicable to senior roles)
2. Team size fields (for managers)
3. `grade_level` / `job_code` (HR system integration)
4. `sox_critical` (for finance-adjacent roles)
5. `cfr_part_11_required` (electronic signatures)
6. `innovation_vs_execution` - Work style
7. `typical_entry_point` - Career path context
8. `patient_facing` (usually false for MA, except patient advocacy)

#### Junction Tables - Priority 3 (2 mappings):
1. **role_approval_authority** - Approval matrix
2. **career_path_steps** - Career progression mapping

---

## ✅ RECOMMENDATION: Phase 1 Enrichment Scope

### FOR 15 FIELD MEDICAL ROLES (MSL-focused):

**Direct Columns to Populate (16 fields):**
```
description
required_skills
required_certifications
years_experience_min / max
travel_percentage_min / max
gxp_role_type = 'gcp' or 'gvp'
hcp_facing = true
regulatory_inspection_role = false (usually)
pharmacovigilance_responsibility = true
clinical_trial_phase_focus = ['phase_2', 'phase_3', 'phase_4', 'post_marketing']
drug_lifecycle_stage = ['clinical', 'commercial', 'lifecycle_management']
typical_meeting_hours_per_week = 10-15
strategic_vs_tactical = 'balanced'
typical_time_in_role_years = 2-4
advancement_potential = 'high' or 'moderate'
```

**Junction Table Data (3 mappings):**
```
role_regulatory_frameworks:
  - ICH GCP E6 (advanced)
  - PhRMA Code (expert)
  - Sunshine Act (working_knowledge)
  - FDA 21 CFR Part 312 (working_knowledge)

role_gxp_training:
  - GCP Fundamentals (mandatory)
  - GVP Basics (mandatory)
  - KOL Engagement Ethics (mandatory)

role_clinical_competencies:
  - Scientific Communication (expert)
  - KOL Relationship Management (advanced)
  - Clinical Trial Design Understanding (advanced)
  - Medical Literature Review (advanced)
  - Insight Generation & Documentation (advanced)
```

**Reference Data to Create First:**
```
regulatory_frameworks (15-20 records)
gxp_training_modules (10-15 records)
clinical_competencies (20-30 records)
```

---

## 📝 Next Steps

1. **Create Reference Data Seeds** (20-30 min)
   - Populate regulatory_frameworks with FDA, EMA, ICH standards
   - Populate gxp_training_modules with core GxP training
   - Populate clinical_competencies with MA competencies

2. **Generate Enrichment SQL** (2-3 hours)
   - UPDATE statements for 15 Field Medical roles
   - INSERT statements for junction table mappings
   - Based on medical_affairs_roles_template.json examples

3. **Validate Against Templates** (30 min)
   - Cross-reference with medical_affairs_roles_template.json
   - Ensure consistency with industry standards

4. **Execute in Supabase** (5 min)
   - Run reference data seeds first
   - Run enrichment UPDATE/INSERT statements
   - Validate counts and data quality

---

## 🔍 Field Mapping: JSON Export ⟷ Schema

### Fields in JSON Export (44) vs. Schema Columns (38):

**Explanation of Discrepancy:**
- JSON export has 44 columns (includes some fields not in current schema)
- Migration schema has 38 direct columns on org_roles
- 6 fields in JSON are likely deprecated or from old schema version
- Junction table data (7 tables) not included in JSON export

**Deprecated/Legacy Fields (6 from JSON not in schema):**
```
idx                           - Index field (not in schema)
deleted_at                    - Soft delete (not in current schema)
Some budget fields may be merged/renamed
```

**All Schema Columns Accounted For:**
- 11 populated (from JSON export) ✓
- 27 need enrichment (NULL in export) ✓
- 16 pharma-specific (from enrichment migration) ✓
- **Total: 54 potential columns when fully enriched**

---

## 📊 Completeness Metrics

### Current State (100 Medical Affairs Roles):
```
Basic Structure:        100% ✓ (name, department, function, seniority)
Core Requirements:       0% ❌ (skills, certs, experience, description)
Pharma Context:          0% ❌ (GxP, regulatory, clinical focus)
Work Context:            0% ❌ (travel, meetings, workflow)
Junction Data:           0% ❌ (frameworks, training, competencies)
Reference Data:          0% ❌ (master catalogs need creation)
```

### After Phase 1 (15 Field Medical Roles):
```
Basic Structure:        100% ✓
Core Requirements:       95% ✓ (all except budget, team size)
Pharma Context:          90% ✓ (all regulatory fields populated)
Work Context:            85% ✓ (travel, meetings, work pattern)
Junction Data:           60% ✓ (frameworks, training, competencies mapped)
Reference Data:          40% ✓ (top 3 reference tables seeded)
```

### Target: Full Enrichment (100 Roles):
```
Basic Structure:        100% ✓
Core Requirements:      100% ✓
Pharma Context:         100% ✓
Work Context:            95% ✓ (some fields optional)
Junction Data:           80% ✓ (priority mappings complete)
Reference Data:          70% ✓ (core catalogs complete)
```

---

**Ready to generate enrichment SQL?**

Next: Create reference data seeds, then UPDATE/INSERT statements for 15 Field Medical roles.
