# Pharmaceutical/Biotech Role Enrichment - Schema Mapping Document

**Generated**: 2025-11-22
**Source Schema**: `supabase/migrations/20251120000002_comprehensive_schema.sql`
**Purpose**: Comprehensive schema extension plan for pharmaceutical/biotech role metadata enrichment

---

## Executive Summary

This document maps the schema extensions required to enrich the `org_roles` table with pharmaceutical/biotech-specific metadata. The plan maintains full compatibility with existing schema patterns while adding industry-specific depth.

### Key Metrics
- **Existing Tables**: 26 tables analyzed
- **Existing Junction Tables**: 13 junction tables
- **New Tables Proposed**: 11 reference tables
- **New Junction Tables Proposed**: 9 junction tables
- **Columns to Add**: 15 new columns to `org_roles`
- **Conflicts Found**: 2 (resolved below)

---

## 1. CURRENT SCHEMA ANALYSIS

### 1.1 Existing org_roles Table Structure

**Location**: Lines 60-89 in `20251120000002_comprehensive_schema.sql`

```sql
CREATE TABLE IF NOT EXISTS org_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255),
    description TEXT,
    seniority_level VARCHAR(50) CHECK (seniority_level IN ('Executive', 'Senior', 'Mid', 'Junior', 'Entry')),
    reports_to_role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_area VARCHAR(255),
    department_name VARCHAR(255),
    required_skills TEXT[],                    -- CONFLICT: Array field (to be normalized)
    required_certifications TEXT[],            -- CONFLICT: Array field (to be normalized)
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    migration_ready BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(role_name, '') || ' ' ||
            coalesce(role_title, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED
);
```

### 1.2 Existing Junction Tables (Role-Related)

**Current Junction Tables**:
1. `org_role_responsibilities` (lines 120-128) - Links roles to responsibilities
2. `org_department_roles` (lines 130-137) - Links departments to roles with headcount
3. `org_function_roles` (lines 139-145) - Links functions to roles
4. `role_goals` (lines 289-294) - Links roles to goals
5. `role_challenges` (lines 296-301) - Links roles to challenges
6. `role_motivations` (lines 303-308) - Links roles to motivations

### 1.3 Naming Patterns Identified

**Table Naming**:
- Reference tables: `{domain}` (e.g., `goals`, `challenges`, `motivations`)
- Organizational tables: `org_{entity}` (e.g., `org_roles`, `org_functions`)
- Junction tables: `{table1}_{table2}` (e.g., `role_goals`, `persona_jtbd`)

**Column Naming**:
- Primary keys: `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- Foreign keys: `{table_name}_id UUID REFERENCES {table}(id)`
- Timestamps: `created_at`, `updated_at` (TIMESTAMP DEFAULT NOW())
- Audit: `created_by`, `updated_by` (VARCHAR(255))
- Boolean flags: `is_{adjective}` or `{verb}_ready`
- Arrays: `{name}` (e.g., `tags TEXT[]`)

**Constraint Patterns**:
- Unique constraints: `UNIQUE({col1}, {col2})`
- Check constraints: `CHECK ({column} IN (...))`
- Foreign keys: `ON DELETE CASCADE` for junction tables, `ON DELETE SET NULL` for nullable references

### 1.4 Search and Indexing Patterns

**Full-Text Search**:
```sql
search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(field1, '') || ' ' || coalesce(field2, ''))
) STORED
```

**Triggers**: All main tables have `update_updated_at_column()` trigger

---

## 2. SCHEMA CONFLICTS & RESOLUTIONS

### 2.1 Conflict #1: Array Fields in org_roles

**Issue**: Current schema has:
- `required_skills TEXT[]`
- `required_certifications TEXT[]`

**Resolution Strategy**:
- **Phase 1 (Migration 1)**: Create normalized reference tables and junction tables
- **Phase 2 (Migration 2)**: Migrate data from arrays to junction tables
- **Phase 3 (Migration 3)**: Deprecate array columns (add `_deprecated` suffix, keep for rollback)
- **Phase 4 (Future)**: Remove deprecated columns after confirmed stable

**Migration Path**:
```sql
-- Phase 2: Migrate existing data
INSERT INTO role_skills (role_id, skill_id)
SELECT r.id, s.id
FROM org_roles r
CROSS JOIN LATERAL unnest(r.required_skills) AS skill_name
JOIN skills s ON s.name = skill_name;

-- Phase 3: Deprecate
ALTER TABLE org_roles RENAME COLUMN required_skills TO required_skills_deprecated;
ALTER TABLE org_roles RENAME COLUMN required_certifications TO required_certifications_deprecated;
```

### 2.2 Conflict #2: Tenant Column

**Issue**: Schema shows tenant_id added via ALTER statements (line 323)

**Resolution**: Ensure tenant_id is included in all new tables from the start

---

## 3. PROPOSED SCHEMA EXTENSIONS

### 3.1 New Columns for org_roles Table

**Add to org_roles** (Migration 1):

```sql
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS role_type VARCHAR(50)
    CHECK (role_type IN ('Clinical', 'Research', 'Regulatory', 'Commercial', 'Operations', 'Support', 'Leadership'));

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS regulatory_oversight BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS gxp_critical BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS patient_facing BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS safety_critical BOOLEAN DEFAULT false;

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS travel_requirement_pct INTEGER
    CHECK (travel_requirement_pct >= 0 AND travel_requirement_pct <= 100);

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS remote_eligible BOOLEAN DEFAULT false;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS oncall_required BOOLEAN DEFAULT false;

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS salary_band_min INTEGER;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS salary_band_max INTEGER;
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(3) DEFAULT 'USD';

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS job_family VARCHAR(100);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS career_level VARCHAR(50);
ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS succession_planning_priority INTEGER
    CHECK (succession_planning_priority >= 0 AND succession_planning_priority <= 100);

ALTER TABLE org_roles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
```

**Column Descriptions**:

| Column | Type | Purpose | Pharma-Specific |
|--------|------|---------|-----------------|
| `role_type` | VARCHAR(50) | High-level role categorization | Yes - includes Clinical, Regulatory |
| `regulatory_oversight` | BOOLEAN | Role has regulatory oversight duties | Yes |
| `gxp_critical` | BOOLEAN | Role involves GxP compliance (GCP, GLP, GMP) | Yes |
| `patient_facing` | BOOLEAN | Direct patient interaction | Yes |
| `safety_critical` | BOOLEAN | Pharmacovigilance/safety responsibilities | Yes |
| `travel_requirement_pct` | INTEGER | Percentage of time traveling (0-100) | No |
| `remote_eligible` | BOOLEAN | Can work remotely | No |
| `oncall_required` | BOOLEAN | On-call rotation required | No |
| `salary_band_min` | INTEGER | Minimum salary (for planning) | No |
| `salary_band_max` | INTEGER | Maximum salary (for planning) | No |
| `salary_currency` | VARCHAR(3) | ISO currency code | No |
| `job_family` | VARCHAR(100) | HR job family classification | No |
| `career_level` | VARCHAR(50) | Career progression level | No |
| `succession_planning_priority` | INTEGER | Priority for succession planning (0-100) | No |
| `metadata` | JSONB | Extensible JSON metadata | No |

---

### 3.2 New Reference Tables

#### 3.2.1 Skills Registry

**Purpose**: Normalized skills catalog with taxonomy

```sql
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100), -- 'Technical', 'Clinical', 'Regulatory', 'Soft Skills', etc.
    skill_type VARCHAR(50) CHECK (skill_type IN ('Hard', 'Soft', 'Technical', 'Domain')),
    proficiency_levels TEXT[], -- ['Basic', 'Intermediate', 'Advanced', 'Expert']
    is_pharma_specific BOOLEAN DEFAULT false,
    is_certification_required BOOLEAN DEFAULT false,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_type ON skills(skill_type);
CREATE INDEX idx_skills_pharma_specific ON skills(is_pharma_specific);
CREATE INDEX idx_skills_search ON skills USING GIN(search_vector);

COMMENT ON TABLE skills IS 'Master registry of skills required for pharmaceutical/biotech roles';
```

#### 3.2.2 Certifications Registry

**Purpose**: Professional certifications and licenses

```sql
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(50),
    description TEXT,
    issuing_organization VARCHAR(255),
    certification_type VARCHAR(50) CHECK (certification_type IN ('License', 'Certification', 'Credential', 'Training')),
    is_regulatory_required BOOLEAN DEFAULT false,
    requires_renewal BOOLEAN DEFAULT false,
    renewal_period_months INTEGER,
    prerequisites TEXT[],
    geographic_scope VARCHAR(50), -- 'Global', 'US', 'EU', etc.
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(abbreviation, '') || ' ' ||
            coalesce(description, '')
        )
    ) STORED,
    UNIQUE(name, issuing_organization)
);

CREATE INDEX idx_certifications_type ON certifications(certification_type);
CREATE INDEX idx_certifications_required ON certifications(is_regulatory_required);
CREATE INDEX idx_certifications_search ON certifications USING GIN(search_vector);

COMMENT ON TABLE certifications IS 'Registry of professional certifications and licenses for pharma roles';
```

#### 3.2.3 Competencies Framework

**Purpose**: Core competencies and behavioral indicators

```sql
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    competency_type VARCHAR(50) CHECK (competency_type IN ('Leadership', 'Technical', 'Interpersonal', 'Strategic', 'Operational')),
    category VARCHAR(100), -- 'Core', 'Functional', 'Leadership'
    behavioral_indicators TEXT[],
    proficiency_levels JSONB, -- [{level: 'Basic', description: '...', indicators: []}]
    is_pharma_specific BOOLEAN DEFAULT false,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_competencies_type ON competencies(competency_type);
CREATE INDEX idx_competencies_category ON competencies(category);
CREATE INDEX idx_competencies_search ON competencies USING GIN(search_vector);

COMMENT ON TABLE competencies IS 'Competency framework defining capabilities required for roles';
```

#### 3.2.4 KPIs/Metrics Registry

**Purpose**: Key Performance Indicators for role success measurement

```sql
CREATE TABLE IF NOT EXISTS kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'Quality', 'Efficiency', 'Compliance', 'Innovation', 'People'
    measurement_type VARCHAR(50) CHECK (measurement_type IN ('Quantitative', 'Qualitative', 'Boolean', 'Percentage')),
    unit_of_measure VARCHAR(50), -- '%', 'days', 'count', '$', etc.
    target_value DECIMAL(12,2),
    target_operator VARCHAR(10) CHECK (target_operator IN ('>=', '<=', '=', '>', '<')),
    calculation_method TEXT,
    measurement_frequency VARCHAR(50), -- 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'
    is_regulatory BOOLEAN DEFAULT false,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED,
    UNIQUE(name, category)
);

CREATE INDEX idx_kpis_category ON kpis(category);
CREATE INDEX idx_kpis_measurement_type ON kpis(measurement_type);
CREATE INDEX idx_kpis_regulatory ON kpis(is_regulatory);
CREATE INDEX idx_kpis_search ON kpis USING GIN(search_vector);

COMMENT ON TABLE kpis IS 'Key Performance Indicators for measuring role success and effectiveness';
```

#### 3.2.5 Training Programs

**Purpose**: Required and recommended training programs

```sql
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    program_type VARCHAR(50) CHECK (program_type IN ('Onboarding', 'Compliance', 'Technical', 'Leadership', 'Continuing Education')),
    duration_hours DECIMAL(6,2),
    delivery_method VARCHAR(50), -- 'In-Person', 'Virtual', 'Self-Paced', 'Hybrid'
    is_mandatory BOOLEAN DEFAULT false,
    is_gxp_training BOOLEAN DEFAULT false,
    recertification_required BOOLEAN DEFAULT false,
    recertification_period_months INTEGER,
    prerequisites TEXT[],
    learning_objectives TEXT[],
    provider VARCHAR(255),
    cost_per_participant DECIMAL(10,2),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_training_programs_type ON training_programs(program_type);
CREATE INDEX idx_training_programs_mandatory ON training_programs(is_mandatory);
CREATE INDEX idx_training_programs_gxp ON training_programs(is_gxp_training);
CREATE INDEX idx_training_programs_search ON training_programs USING GIN(search_vector);

COMMENT ON TABLE training_programs IS 'Training programs required or recommended for pharmaceutical roles';
```

#### 3.2.6 Regulatory Requirements

**Purpose**: Regulatory compliance requirements by role

```sql
CREATE TABLE IF NOT EXISTS regulatory_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50) CHECK (requirement_type IN ('Training', 'Certification', 'Documentation', 'Audit', 'Reporting')),
    regulatory_body VARCHAR(100), -- 'FDA', 'EMA', 'MHRA', 'ICH', etc.
    regulation_reference VARCHAR(255), -- '21 CFR Part 11', 'ICH E6(R2)', etc.
    jurisdiction VARCHAR(50), -- 'US', 'EU', 'Global', etc.
    frequency VARCHAR(50), -- 'Once', 'Annual', 'Quarterly', etc.
    documentation_required TEXT[],
    consequences_of_non_compliance TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(description, '') || ' ' ||
            coalesce(regulation_reference, '')
        )
    ) STORED
);

CREATE INDEX idx_regulatory_requirements_type ON regulatory_requirements(requirement_type);
CREATE INDEX idx_regulatory_requirements_body ON regulatory_requirements(regulatory_body);
CREATE INDEX idx_regulatory_requirements_jurisdiction ON regulatory_requirements(jurisdiction);
CREATE INDEX idx_regulatory_requirements_search ON regulatory_requirements USING GIN(search_vector);

COMMENT ON TABLE regulatory_requirements IS 'Regulatory compliance requirements applicable to pharmaceutical roles';
```

#### 3.2.7 Software/Systems Registry

**Purpose**: Software and systems used in roles

```sql
CREATE TABLE IF NOT EXISTS systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    system_type VARCHAR(50) CHECK (system_type IN ('EHR', 'CTMS', 'LIMS', 'eTMF', 'Safety DB', 'QMS', 'Document Management', 'Analytics', 'Other')),
    vendor VARCHAR(255),
    is_validated_system BOOLEAN DEFAULT false,
    is_gxp_system BOOLEAN DEFAULT false,
    requires_training BOOLEAN DEFAULT false,
    typical_users TEXT[],
    integration_points TEXT[],
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_systems_type ON systems(system_type);
CREATE INDEX idx_systems_validated ON systems(is_validated_system);
CREATE INDEX idx_systems_gxp ON systems(is_gxp_system);
CREATE INDEX idx_systems_search ON systems USING GIN(search_vector);

COMMENT ON TABLE systems IS 'Registry of software systems and tools used in pharmaceutical operations';
```

#### 3.2.8 Deliverables/Work Products

**Purpose**: Key deliverables and work products produced by roles

```sql
CREATE TABLE IF NOT EXISTS deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deliverable_type VARCHAR(50) CHECK (deliverable_type IN ('Report', 'Document', 'Presentation', 'Analysis', 'Filing', 'Protocol', 'Plan', 'Other')),
    category VARCHAR(100), -- 'Regulatory', 'Clinical', 'Quality', 'Strategic', etc.
    typical_frequency VARCHAR(50), -- 'Ad-hoc', 'Daily', 'Weekly', 'Monthly', 'Per Project', etc.
    is_regulatory_submission BOOLEAN DEFAULT false,
    is_controlled_document BOOLEAN DEFAULT false,
    template_available BOOLEAN DEFAULT false,
    approval_required BOOLEAN DEFAULT false,
    typical_reviewers TEXT[],
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_deliverables_type ON deliverables(deliverable_type);
CREATE INDEX idx_deliverables_category ON deliverables(category);
CREATE INDEX idx_deliverables_regulatory ON deliverables(is_regulatory_submission);
CREATE INDEX idx_deliverables_search ON deliverables USING GIN(search_vector);

COMMENT ON TABLE deliverables IS 'Key deliverables and work products produced in pharmaceutical roles';
```

#### 3.2.9 Therapeutic Areas

**Purpose**: Therapeutic areas of expertise

```sql
CREATE TABLE IF NOT EXISTS therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_area_id UUID REFERENCES therapeutic_areas(id) ON DELETE SET NULL,
    icd_codes TEXT[],
    key_indications TEXT[],
    key_drugs TEXT[],
    regulatory_considerations TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_therapeutic_areas_parent ON therapeutic_areas(parent_area_id);
CREATE INDEX idx_therapeutic_areas_search ON therapeutic_areas USING GIN(search_vector);

COMMENT ON TABLE therapeutic_areas IS 'Therapeutic areas and disease states for pharmaceutical expertise';
```

#### 3.2.10 Interactions/Relationships

**Purpose**: Internal and external stakeholders roles interact with

```sql
CREATE TABLE IF NOT EXISTS stakeholder_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    stakeholder_category VARCHAR(50) CHECK (stakeholder_category IN ('Internal', 'External', 'Regulatory', 'Clinical', 'Commercial', 'Patient')),
    interaction_frequency VARCHAR(50), -- 'Daily', 'Weekly', 'Monthly', 'Ad-hoc'
    typical_interaction_purpose TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) STORED
);

CREATE INDEX idx_stakeholder_types_category ON stakeholder_types(stakeholder_category);
CREATE INDEX idx_stakeholder_types_search ON stakeholder_types USING GIN(search_vector);

COMMENT ON TABLE stakeholder_types IS 'Types of stakeholders pharmaceutical roles interact with';
```

#### 3.2.11 Career Paths

**Purpose**: Career progression pathways

```sql
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    path_type VARCHAR(50) CHECK (path_type IN ('Technical', 'Management', 'Hybrid', 'Specialist')),
    typical_duration_years INTEGER,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_career_paths_type ON career_paths(path_type);

COMMENT ON TABLE career_paths IS 'Career progression pathways within pharmaceutical organizations';
```

---

### 3.3 New Junction Tables

#### 3.3.1 role_skills

**Purpose**: Many-to-many relationship between roles and skills with proficiency

```sql
CREATE TABLE IF NOT EXISTS role_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_proficiency VARCHAR(50) CHECK (required_proficiency IN ('Basic', 'Intermediate', 'Advanced', 'Expert')),
    is_required BOOLEAN DEFAULT true, -- vs. preferred
    importance_rank INTEGER, -- 1 = most important
    can_train_on_job BOOLEAN DEFAULT false,
    typical_time_to_proficiency_months INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, skill_id)
);

CREATE INDEX idx_role_skills_role ON role_skills(role_id);
CREATE INDEX idx_role_skills_skill ON role_skills(skill_id);
CREATE INDEX idx_role_skills_required ON role_skills(is_required);

COMMENT ON TABLE role_skills IS 'Skills required for each role with proficiency levels';
```

#### 3.3.2 role_certifications

**Purpose**: Required certifications per role

```sql
CREATE TABLE IF NOT EXISTS role_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true, -- vs. preferred
    must_have_before_hire BOOLEAN DEFAULT false,
    can_obtain_after_hire_months INTEGER,
    priority INTEGER CHECK (priority >= 0 AND priority <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, certification_id)
);

CREATE INDEX idx_role_certifications_role ON role_certifications(role_id);
CREATE INDEX idx_role_certifications_cert ON role_certifications(certification_id);
CREATE INDEX idx_role_certifications_required ON role_certifications(is_required);

COMMENT ON TABLE role_certifications IS 'Certifications required or preferred for each role';
```

#### 3.3.3 role_competencies

**Purpose**: Core competencies required for role success

```sql
CREATE TABLE IF NOT EXISTS role_competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    required_level VARCHAR(50), -- Maps to proficiency_levels in competencies
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1), -- Importance weight (sum to 1.0)
    is_core BOOLEAN DEFAULT false, -- Core vs. supporting competency
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, competency_id)
);

CREATE INDEX idx_role_competencies_role ON role_competencies(role_id);
CREATE INDEX idx_role_competencies_competency ON role_competencies(competency_id);
CREATE INDEX idx_role_competencies_core ON role_competencies(is_core);

COMMENT ON TABLE role_competencies IS 'Competencies required for role with proficiency levels and weights';
```

#### 3.3.4 role_kpis

**Purpose**: KPIs used to measure role performance

```sql
CREATE TABLE IF NOT EXISTS role_kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    target_value DECIMAL(12,2),
    weight DECIMAL(3,2) CHECK (weight >= 0 AND weight <= 1), -- Importance in performance review
    is_primary BOOLEAN DEFAULT false,
    measurement_frequency VARCHAR(50), -- Can override default from kpi
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, kpi_id)
);

CREATE INDEX idx_role_kpis_role ON role_kpis(role_id);
CREATE INDEX idx_role_kpis_kpi ON role_kpis(kpi_id);
CREATE INDEX idx_role_kpis_primary ON role_kpis(is_primary);

COMMENT ON TABLE role_kpis IS 'KPIs used to measure performance for each role';
```

#### 3.3.5 role_training_programs

**Purpose**: Training programs required for role

```sql
CREATE TABLE IF NOT EXISTS role_training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    training_program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    timing VARCHAR(50) CHECK (timing IN ('Pre-hire', 'Onboarding', 'First 30 Days', 'First 90 Days', 'Ongoing', 'Annual')),
    priority INTEGER CHECK (priority >= 0 AND priority <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, training_program_id)
);

CREATE INDEX idx_role_training_programs_role ON role_training_programs(role_id);
CREATE INDEX idx_role_training_programs_training ON role_training_programs(training_program_id);
CREATE INDEX idx_role_training_programs_required ON role_training_programs(is_required);

COMMENT ON TABLE role_training_programs IS 'Training programs required for each role';
```

#### 3.3.6 role_regulatory_requirements

**Purpose**: Regulatory requirements applicable to role

```sql
CREATE TABLE IF NOT EXISTS role_regulatory_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    regulatory_requirement_id UUID NOT NULL REFERENCES regulatory_requirements(id) ON DELETE CASCADE,
    compliance_criticality VARCHAR(50) CHECK (compliance_criticality IN ('Low', 'Medium', 'High', 'Critical')),
    audit_frequency VARCHAR(50),
    responsible_for_compliance BOOLEAN DEFAULT false, -- vs. just subject to
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, regulatory_requirement_id)
);

CREATE INDEX idx_role_regulatory_requirements_role ON role_regulatory_requirements(role_id);
CREATE INDEX idx_role_regulatory_requirements_req ON role_regulatory_requirements(regulatory_requirement_id);
CREATE INDEX idx_role_regulatory_requirements_criticality ON role_regulatory_requirements(compliance_criticality);

COMMENT ON TABLE role_regulatory_requirements IS 'Regulatory requirements applicable to each role';
```

#### 3.3.7 role_systems

**Purpose**: Systems and software used in role

```sql
CREATE TABLE IF NOT EXISTS role_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    access_level VARCHAR(50) CHECK (access_level IN ('View', 'Edit', 'Admin', 'Power User')),
    usage_frequency VARCHAR(50) CHECK (usage_frequency IN ('Daily', 'Weekly', 'Monthly', 'Occasionally', 'Rarely')),
    is_primary_system BOOLEAN DEFAULT false,
    training_required_hours DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, system_id)
);

CREATE INDEX idx_role_systems_role ON role_systems(role_id);
CREATE INDEX idx_role_systems_system ON role_systems(system_id);
CREATE INDEX idx_role_systems_primary ON role_systems(is_primary_system);

COMMENT ON TABLE role_systems IS 'Systems and software tools used in each role';
```

#### 3.3.8 role_deliverables

**Purpose**: Key deliverables produced by role

```sql
CREATE TABLE IF NOT EXISTS role_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    is_primary_owner BOOLEAN DEFAULT false, -- vs. contributor
    typical_frequency VARCHAR(50),
    estimated_hours_per_occurrence DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, deliverable_id)
);

CREATE INDEX idx_role_deliverables_role ON role_deliverables(role_id);
CREATE INDEX idx_role_deliverables_deliverable ON role_deliverables(deliverable_id);
CREATE INDEX idx_role_deliverables_primary_owner ON role_deliverables(is_primary_owner);

COMMENT ON TABLE role_deliverables IS 'Key deliverables and work products produced by each role';
```

#### 3.3.9 role_therapeutic_areas

**Purpose**: Therapeutic areas of expertise for role

```sql
CREATE TABLE IF NOT EXISTS role_therapeutic_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    therapeutic_area_id UUID NOT NULL REFERENCES therapeutic_areas(id) ON DELETE CASCADE,
    expertise_level VARCHAR(50) CHECK (expertise_level IN ('Awareness', 'Working Knowledge', 'Proficient', 'Expert')),
    is_primary_focus BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, therapeutic_area_id)
);

CREATE INDEX idx_role_therapeutic_areas_role ON role_therapeutic_areas(role_id);
CREATE INDEX idx_role_therapeutic_areas_area ON role_therapeutic_areas(therapeutic_area_id);
CREATE INDEX idx_role_therapeutic_areas_primary ON role_therapeutic_areas(is_primary_focus);

COMMENT ON TABLE role_therapeutic_areas IS 'Therapeutic areas relevant to each role';
```

#### 3.3.10 role_stakeholder_interactions

**Purpose**: Stakeholders role interacts with

```sql
CREATE TABLE IF NOT EXISTS role_stakeholder_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    stakeholder_type_id UUID NOT NULL REFERENCES stakeholder_types(id) ON DELETE CASCADE,
    interaction_frequency VARCHAR(50) CHECK (interaction_frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Ad-hoc', 'Rarely')),
    interaction_type VARCHAR(50), -- 'Meetings', 'Email', 'Phone', 'Presentations', etc.
    influence_level VARCHAR(50) CHECK (influence_level IN ('Informational', 'Collaborative', 'Decision-Making', 'Leadership')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, stakeholder_type_id)
);

CREATE INDEX idx_role_stakeholder_interactions_role ON role_stakeholder_interactions(role_id);
CREATE INDEX idx_role_stakeholder_interactions_stakeholder ON role_stakeholder_interactions(stakeholder_type_id);

COMMENT ON TABLE role_stakeholder_interactions IS 'Stakeholder interactions for each role';
```

#### 3.3.11 role_career_paths

**Purpose**: Career progression pathways from role

```sql
CREATE TABLE IF NOT EXISTS role_career_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    to_role_id UUID NOT NULL REFERENCES org_roles(id) ON DELETE CASCADE,
    career_path_id UUID REFERENCES career_paths(id) ON DELETE SET NULL,
    typical_years_in_role INTEGER,
    transition_probability DECIMAL(3,2) CHECK (transition_probability >= 0 AND transition_probability <= 1),
    required_skills_gap_id UUID, -- Could reference a skills gap analysis
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_role_id, to_role_id)
);

CREATE INDEX idx_role_career_paths_from ON role_career_paths(from_role_id);
CREATE INDEX idx_role_career_paths_to ON role_career_paths(to_role_id);

COMMENT ON TABLE role_career_paths IS 'Career progression pathways between roles';
```

---

## 4. MIGRATION STRATEGY

### 4.1 Migration Sequence

**Migration 1**: Core Reference Tables
- Create all 11 new reference tables
- Add new columns to org_roles
- Create triggers for new tables
- Add RLS policies

**Migration 2**: Junction Tables
- Create all 11 new junction tables
- Add indexes
- Add comments

**Migration 3**: Data Migration from Arrays
- Migrate required_skills to role_skills
- Migrate required_certifications to role_certifications
- Validate data integrity

**Migration 4**: Deprecate Array Columns
- Rename array columns to *_deprecated
- Update application code
- Monitor for issues

**Migration 5** (Future): Remove Deprecated Columns
- Drop deprecated array columns after 6 months of stability

### 4.2 Rollback Strategy

Each migration includes a corresponding rollback script:
- Drop tables in reverse order (junctions, then references)
- Remove columns from org_roles
- Restore array columns if needed

### 4.3 Performance Considerations

**Indexes Required**:
- Foreign key columns in all junction tables
- Category/type columns in reference tables
- Boolean flags used in WHERE clauses
- Full-text search indexes on search_vector columns

**Query Optimization**:
- Use materialized views for complex role reports
- Implement caching for frequently accessed role profiles
- Consider partitioning junction tables if >1M rows

---

## 5. DATA TYPES & CONSTRAINTS SUMMARY

### 5.1 Standard Column Types

| Pattern | Type | Notes |
|---------|------|-------|
| Primary Keys | UUID | `DEFAULT uuid_generate_v4()` |
| Foreign Keys | UUID | With appropriate ON DELETE action |
| Names | VARCHAR(255) | Standard length for names |
| Short Names | VARCHAR(50-100) | For codes, abbreviations |
| Descriptions | TEXT | No length limit |
| Booleans | BOOLEAN | Default values specified |
| Timestamps | TIMESTAMP | `DEFAULT NOW()` |
| Decimals | DECIMAL(p,s) | Precision/scale as needed |
| Arrays | TEXT[] | For lists (minimized in new schema) |
| JSON | JSONB | For flexible metadata |
| Percentages | INTEGER 0-100 | With CHECK constraint |
| Weights | DECIMAL(3,2) 0-1 | For importance weights |

### 5.2 Constraint Patterns

**CHECK Constraints**:
```sql
CHECK (column IN ('value1', 'value2', ...))
CHECK (column >= min AND column <= max)
```

**UNIQUE Constraints**:
```sql
UNIQUE(col1, col2) -- Composite unique in junction tables
UNIQUE(name) -- Single column unique in reference tables
```

**Foreign Keys**:
```sql
REFERENCES table(id) ON DELETE CASCADE  -- Junction tables
REFERENCES table(id) ON DELETE SET NULL -- Nullable references
```

---

## 6. INDEXING STRATEGY

### 6.1 Index Types

**B-tree Indexes** (default):
- Foreign keys
- Enum/category columns
- Boolean flags
- Frequently filtered columns

**GIN Indexes**:
- Full-text search (search_vector)
- JSONB columns (if queried)
- Array columns (if filtered)

**Partial Indexes**:
- Only where beneficial (e.g., WHERE is_active = true)

### 6.2 Index Naming Convention

```
idx_{table}_{column(s)}
idx_{table}_{purpose}
```

Examples:
- `idx_role_skills_role`
- `idx_role_skills_required`
- `idx_skills_search`

---

## 7. ROW LEVEL SECURITY (RLS)

### 7.1 Policy Pattern for New Tables

All new tables should include:

```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all authenticated users" ON {table}
    FOR SELECT TO authenticated USING (true);

-- For tenant-scoped data:
CREATE POLICY "Tenant isolation" ON {table}
    FOR ALL TO authenticated
    USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);
```

### 7.2 Junction Table Policies

Junction tables inherit RLS from their parent tables through foreign key relationships.

---

## 8. TRIGGERS

### 8.1 Standard Triggers for New Tables

All reference tables with `updated_at` column:

```sql
CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 8.2 Additional Triggers

**Search Vector Updates**:
- Automatically maintained via GENERATED ALWAYS AS

**Audit Logging** (optional):
- Consider adding audit triggers for sensitive tables like regulatory_requirements

---

## 9. NAMING ALIGNMENT

### 9.1 Current Schema Patterns

**Confirmed Patterns**:
- Table names: lowercase with underscores
- Reference tables: singular or plural noun
- Junction tables: `{table1}_{table2}`
- Org tables: `org_{entity}`
- Columns: lowercase with underscores
- Booleans: `is_{adjective}` or `{verb}_ready`
- Foreign keys: `{table}_id`

### 9.2 Proposed Naming Follows Patterns

All proposed table and column names follow existing conventions:
- `skills`, `certifications`, `competencies` (plural nouns)
- `role_skills`, `role_certifications` (junction tables)
- `is_required`, `is_mandatory`, `is_primary` (boolean flags)
- `skill_id`, `role_id`, `certification_id` (foreign keys)

---

## 10. SCHEMA EXTENSION DIAGRAM

```
org_roles (EXTENDED)
├── [New Columns]
│   ├── role_type
│   ├── regulatory_oversight
│   ├── gxp_critical
│   ├── patient_facing
│   ├── safety_critical
│   ├── travel_requirement_pct
│   ├── remote_eligible
│   ├── oncall_required
│   ├── salary_band_min/max
│   ├── job_family
│   ├── career_level
│   └── metadata (JSONB)
│
├── [New Junction Tables]
│   ├── role_skills → skills
│   ├── role_certifications → certifications
│   ├── role_competencies → competencies
│   ├── role_kpis → kpis
│   ├── role_training_programs → training_programs
│   ├── role_regulatory_requirements → regulatory_requirements
│   ├── role_systems → systems
│   ├── role_deliverables → deliverables
│   ├── role_therapeutic_areas → therapeutic_areas
│   ├── role_stakeholder_interactions → stakeholder_types
│   └── role_career_paths → org_roles (self-join) + career_paths
│
└── [Existing Junction Tables]
    ├── role_goals → goals
    ├── role_challenges → challenges
    ├── role_motivations → motivations
    ├── org_role_responsibilities → org_responsibilities
    ├── org_department_roles → org_departments
    └── org_function_roles → org_functions
```

---

## 11. GENERATED TYPESCRIPT TYPES PREVIEW

Based on the schema mapper pattern, these TypeScript types would be auto-generated:

```typescript
export interface OrgRole {
  id: string;
  unique_id: string;
  role_name: string;
  role_title?: string | null;
  description?: string | null;
  seniority_level?: 'Executive' | 'Senior' | 'Mid' | 'Junior' | 'Entry' | null;
  reports_to_role_id?: string | null;
  function_area?: string | null;
  department_name?: string | null;
  years_experience_min?: number | null;
  years_experience_max?: number | null;

  // NEW FIELDS
  role_type?: 'Clinical' | 'Research' | 'Regulatory' | 'Commercial' | 'Operations' | 'Support' | 'Leadership' | null;
  regulatory_oversight?: boolean;
  gxp_critical?: boolean;
  patient_facing?: boolean;
  safety_critical?: boolean;
  travel_requirement_pct?: number | null;
  remote_eligible?: boolean;
  oncall_required?: boolean;
  salary_band_min?: number | null;
  salary_band_max?: number | null;
  salary_currency?: string;
  job_family?: string | null;
  career_level?: string | null;
  succession_planning_priority?: number | null;
  metadata?: Record<string, any>;

  // DEPRECATED (to be removed)
  required_skills_deprecated?: string[];
  required_certifications_deprecated?: string[];

  // Standard fields
  migration_ready?: boolean;
  is_active?: boolean;
  function_id?: string | null;
  department_id?: string | null;
  tenant_id?: string | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  skill_type?: 'Hard' | 'Soft' | 'Technical' | 'Domain' | null;
  proficiency_levels?: string[];
  is_pharma_specific?: boolean;
  is_certification_required?: boolean;
  tenant_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RoleSkill {
  id: string;
  role_id: string;
  skill_id: string;
  required_proficiency?: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert' | null;
  is_required?: boolean;
  importance_rank?: number | null;
  can_train_on_job?: boolean;
  typical_time_to_proficiency_months?: number | null;
  created_at: Date;
}

// ... similar for all other tables
```

---

## 12. ZOD VALIDATION SCHEMAS PREVIEW

```typescript
import { z } from 'zod';

export const OrgRoleSchema = z.object({
  id: z.string().uuid(),
  unique_id: z.string().max(50),
  role_name: z.string().max(255),
  role_title: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  seniority_level: z.enum(['Executive', 'Senior', 'Mid', 'Junior', 'Entry']).nullable().optional(),

  // NEW FIELDS
  role_type: z.enum(['Clinical', 'Research', 'Regulatory', 'Commercial', 'Operations', 'Support', 'Leadership']).nullable().optional(),
  regulatory_oversight: z.boolean().default(false),
  gxp_critical: z.boolean().default(false),
  patient_facing: z.boolean().default(false),
  safety_critical: z.boolean().default(false),
  travel_requirement_pct: z.number().int().min(0).max(100).nullable().optional(),
  remote_eligible: z.boolean().default(false),
  oncall_required: z.boolean().default(false),
  salary_band_min: z.number().int().nullable().optional(),
  salary_band_max: z.number().int().nullable().optional(),
  salary_currency: z.string().length(3).default('USD'),
  metadata: z.record(z.any()).default({}),

  // ... other fields
});

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  description: z.string().nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  skill_type: z.enum(['Hard', 'Soft', 'Technical', 'Domain']).nullable().optional(),
  proficiency_levels: z.array(z.string()).optional(),
  is_pharma_specific: z.boolean().default(false),
  // ... other fields
});

// ... similar for all tables
```

---

## 13. QUERY EXAMPLES

### 13.1 Get Complete Role Profile

```sql
SELECT
  r.id,
  r.role_name,
  r.description,
  r.seniority_level,
  r.role_type,
  r.gxp_critical,

  -- Skills
  json_agg(DISTINCT jsonb_build_object(
    'skill_name', s.name,
    'category', s.category,
    'proficiency', rs.required_proficiency,
    'is_required', rs.is_required
  )) FILTER (WHERE s.id IS NOT NULL) as skills,

  -- Certifications
  json_agg(DISTINCT jsonb_build_object(
    'cert_name', c.name,
    'issuing_org', c.issuing_organization,
    'is_required', rc.is_required
  )) FILTER (WHERE c.id IS NOT NULL) as certifications,

  -- KPIs
  json_agg(DISTINCT jsonb_build_object(
    'kpi_name', k.name,
    'target_value', rk.target_value,
    'is_primary', rk.is_primary
  )) FILTER (WHERE k.id IS NOT NULL) as kpis

FROM org_roles r
LEFT JOIN role_skills rs ON r.id = rs.role_id
LEFT JOIN skills s ON rs.skill_id = s.id
LEFT JOIN role_certifications rc ON r.id = rc.role_id
LEFT JOIN certifications c ON rc.certification_id = c.id
LEFT JOIN role_kpis rk ON r.id = rk.role_id
LEFT JOIN kpis k ON rk.kpi_id = k.id

WHERE r.id = $1
GROUP BY r.id;
```

### 13.2 Find Roles Requiring Specific Skill

```sql
SELECT
  r.role_name,
  r.department_name,
  rs.required_proficiency,
  rs.is_required
FROM org_roles r
JOIN role_skills rs ON r.id = rs.role_id
JOIN skills s ON rs.skill_id = s.id
WHERE s.name = 'Clinical Trial Management'
  AND rs.is_required = true
ORDER BY rs.required_proficiency DESC;
```

### 13.3 Roles with High Regulatory Burden

```sql
SELECT
  r.role_name,
  r.role_type,
  COUNT(DISTINCT rrr.id) as regulatory_requirement_count,
  COUNT(DISTINCT rt.id) FILTER (WHERE tp.is_gxp_training = true) as gxp_training_count
FROM org_roles r
LEFT JOIN role_regulatory_requirements rrr ON r.id = rrr.role_id
LEFT JOIN role_training_programs rt ON r.id = rt.role_id
LEFT JOIN training_programs tp ON rt.training_program_id = tp.id
WHERE r.regulatory_oversight = true
  OR r.gxp_critical = true
GROUP BY r.id, r.role_name, r.role_type
HAVING COUNT(DISTINCT rrr.id) > 5
ORDER BY regulatory_requirement_count DESC;
```

### 13.4 Career Path Analysis

```sql
WITH RECURSIVE career_tree AS (
  -- Base case: starting role
  SELECT
    r.id,
    r.role_name,
    r.seniority_level,
    0 as level,
    ARRAY[r.id] as path
  FROM org_roles r
  WHERE r.id = $1

  UNION ALL

  -- Recursive case: next roles in career path
  SELECT
    r.id,
    r.role_name,
    r.seniority_level,
    ct.level + 1,
    ct.path || r.id
  FROM career_tree ct
  JOIN role_career_paths rcp ON ct.id = rcp.from_role_id
  JOIN org_roles r ON rcp.to_role_id = r.id
  WHERE NOT r.id = ANY(ct.path) -- Prevent cycles
    AND ct.level < 5 -- Max depth
)
SELECT * FROM career_tree ORDER BY level, role_name;
```

---

## 14. SEED DATA REQUIREMENTS

### 14.1 Priority Seed Data (Must Have)

**Skills** (~200 records):
- Clinical trial phases (Phase I-IV)
- GxP knowledge (GCP, GLP, GMP)
- Statistical analysis (SAS, R, Python)
- Regulatory writing
- Data management
- Project management
- Leadership skills
- Communication skills

**Certifications** (~50 records):
- Medical license (MD, DO)
- Pharmacy license (PharmD, RPh)
- Nursing credentials (RN, NP, PA)
- RAC (Regulatory Affairs Certification)
- PMP (Project Management)
- CRA (Clinical Research Associate)
- CCRA (Certified Clinical Research Associate)
- ASQ certifications
- Six Sigma

**Competencies** (~30 records):
- Scientific acumen
- Regulatory knowledge
- Analytical thinking
- Strategic planning
- Stakeholder management
- Risk management
- Change management
- Quality mindset

**KPIs** (~50 records):
- Enrollment rate
- Query resolution time
- Protocol deviation rate
- Submission timelines
- Inspection outcomes
- Safety reporting compliance
- Budget variance
- Team retention

**Therapeutic Areas** (~30 records):
- Oncology
- Neurology
- Cardiology
- Immunology
- Rare diseases
- Infectious diseases
- etc.

### 14.2 Optional Seed Data (Nice to Have)

- Training programs (can be added per tenant)
- Regulatory requirements (start with FDA/EMA basics)
- Systems (tenant-specific)
- Deliverables (can grow organically)
- Stakeholder types (fairly standard)

---

## 15. MIGRATION FILE STRUCTURE

Proposed migration file names (following existing convention):

```
20251122000001_pharma_roles_reference_tables.sql
20251122000002_pharma_roles_junction_tables.sql
20251122000003_pharma_roles_extend_org_roles.sql
20251122000004_pharma_roles_migrate_array_data.sql
20251122000005_pharma_roles_seed_core_data.sql
```

Each with corresponding rollback:

```
20251122000001_pharma_roles_reference_tables.rollback.sql
20251122000002_pharma_roles_junction_tables.rollback.sql
etc.
```

---

## 16. VALIDATION CHECKLIST

### 16.1 Before Migration

- [ ] Review all table names for conflicts
- [ ] Verify foreign key references exist
- [ ] Check constraint values are realistic
- [ ] Validate index strategy
- [ ] Review RLS policies
- [ ] Test on development database
- [ ] Generate TypeScript types
- [ ] Update API documentation

### 16.2 After Migration

- [ ] Verify all tables created successfully
- [ ] Check all indexes exist
- [ ] Validate triggers are working
- [ ] Test RLS policies
- [ ] Run sample queries
- [ ] Load seed data
- [ ] Verify application integration
- [ ] Performance test junction table queries
- [ ] Validate full-text search
- [ ] Check tenant isolation

---

## 17. PERFORMANCE ESTIMATES

### 17.1 Storage Impact

**Reference Tables**: ~50MB (with seed data)
**Junction Tables**: ~10KB initial, scales with usage
**Indexes**: ~30% overhead on junction tables
**Total Initial Impact**: ~100MB

### 17.2 Query Performance

**Simple Role Lookup**: <10ms (with proper indexes)
**Full Role Profile** (with all junctions): <50ms
**Complex Analytics** (career paths, etc.): <200ms
**Full-Text Search**: <100ms (GIN indexes)

### 17.3 Scalability

**Expected Scale**:
- Roles: ~500-2,000 per tenant
- Skills: ~500 global
- Junction records: ~50K-500K per tenant
- Performance should remain acceptable up to 10M junction records

---

## 18. RISK ASSESSMENT

### 18.1 Schema Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Array column migration | Medium | Phased approach with rollback |
| Junction table cardinality | Low | Proper indexing strategy |
| Query performance | Low | Indexes on all FK columns |
| Data integrity | Medium | Foreign key constraints + validation |
| Over-normalization | Low | JSONB metadata field for flexibility |

### 18.2 Implementation Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Seed data quality | Medium | Expert review of pharma-specific data |
| Application integration | Medium | Generate types, comprehensive testing |
| User adoption | Low | Optional fields, gradual rollout |
| Maintenance complexity | Medium | Clear documentation, consistent patterns |

---

## 19. FUTURE ENHANCEMENTS

### 19.1 Phase 2 Additions (Future)

**Workflow Management**:
- `role_workflows` - Standard workflows per role
- `role_approvals` - Approval matrices

**Collaboration**:
- `role_teams` - Standard team compositions
- `role_meetings` - Recurring meetings

**Analytics**:
- Materialized views for common role reports
- Dashboard definitions
- Benchmark data

**AI/ML Integration**:
- Skills gap analysis
- Role recommendation engine
- Career path predictions

### 19.2 Integration Points

**With Existing Schema**:
- Link to `personas` table (already exists)
- Link to `agents` table (via role expertise)
- Link to `jtbd_core` (role-specific JTBDs)

**External Systems**:
- HRIS integration (Workday, SuccessFactors)
- LMS integration (learning management)
- Performance management systems

---

## 20. DOCUMENTATION DELIVERABLES

### 20.1 Technical Documentation

- [x] This schema mapping document
- [ ] Migration SQL files (5 files)
- [ ] Rollback SQL files (5 files)
- [ ] Seed data SQL files
- [ ] TypeScript type definitions (auto-generated)
- [ ] Zod validation schemas (auto-generated)

### 20.2 User Documentation

- [ ] Role enrichment user guide
- [ ] Data entry templates
- [ ] API documentation updates
- [ ] Query examples library
- [ ] Dashboard/reporting guide

---

## 21. SUMMARY

### 21.1 What's Being Added

- **15 new columns** to `org_roles` for pharma-specific metadata
- **11 new reference tables** for normalized pharma domain data
- **11 new junction tables** for many-to-many relationships
- **Full-text search** on all reference tables
- **Comprehensive indexing** for query performance
- **Row Level Security** for tenant isolation
- **Audit triggers** for data tracking

### 21.2 What's Being Deprecated

- `required_skills TEXT[]` → Migrated to `role_skills` junction table
- `required_certifications TEXT[]` → Migrated to `role_certifications` junction table

### 21.3 What Stays the Same

- All existing `org_roles` columns (except 2 arrays)
- All existing junction tables
- All existing reference tables
- All existing relationships and foreign keys
- All existing RLS policies
- All existing triggers

### 21.4 Key Benefits

1. **Pharmaceutical Specificity**: Industry-specific fields (GxP, regulatory, therapeutic areas)
2. **Career Development**: Clear career pathways and competency frameworks
3. **Compliance Tracking**: Built-in regulatory requirement management
4. **Skill Management**: Granular skills with proficiency levels
5. **Performance Measurement**: Role-specific KPIs and metrics
6. **Training Integration**: Link roles to required training programs
7. **Reporting Flexibility**: JSONB metadata for custom attributes
8. **Data Integrity**: Normalized structure with referential integrity
9. **Query Performance**: Comprehensive indexing strategy
10. **Type Safety**: Auto-generated TypeScript types and Zod schemas

---

## 22. NEXT STEPS

1. **Review & Approval**: Review this mapping document with stakeholders
2. **Seed Data Collection**: Work with SMEs to gather pharma-specific seed data
3. **Migration File Creation**: Generate SQL migration files from this spec
4. **Testing**: Test migrations on development database
5. **Type Generation**: Run type generation scripts
6. **Application Updates**: Update API and UI to use new schema
7. **Documentation**: Create user-facing documentation
8. **Deployment**: Execute migrations in staging, then production
9. **Monitoring**: Monitor performance and data quality
10. **Iteration**: Gather feedback and refine as needed

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Author**: VITAL Schema Mapper Agent
**Status**: Ready for Review
