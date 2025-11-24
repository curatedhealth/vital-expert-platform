# Role Seed Template with Full Enrichment

## Overview

This template provides the complete structure for seeding organizational roles with all enrichment attributes. Roles represent the structural definition of a job within an organization.

## Role-Centric Architecture

**Remember:**
- **Roles** = Structural baseline (organizational expectation)
- **Personas** = Behavioral overlay (how individuals work within that role)
- Personas inherit ALL role attributes and can override specific ones

## Database Schema

### org_roles Table (Core Attributes)

```sql
CREATE TABLE IF NOT EXISTS public.org_roles (
  id UUID PRIMARY KEY,
  
  -- Org hierarchy
  function_id UUID REFERENCES org_functions(id),
  department_id UUID REFERENCES org_departments(id),
  reports_to_role_id UUID REFERENCES org_roles(id),
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  
  -- Classification
  role_category TEXT CHECK (role_category IN ('individual_contributor', 'leadership', 'specialist')),
  seniority_level TEXT CHECK (seniority_level IN ('entry', 'mid', 'senior', 'director', 'executive')),
  job_family TEXT,
  
  -- Scope
  geographic_scope TEXT CHECK (geographic_scope IN ('local', 'regional', 'global', 'multi_regional')),
  team_size_min INTEGER,
  team_size_max INTEGER,
  direct_reports_min INTEGER,
  direct_reports_max INTEGER,
  travel_percentage_min NUMERIC(5,2),
  travel_percentage_max NUMERIC(5,2),
  
  -- Experience & skills
  years_experience_min INTEGER,
  years_experience_max INTEGER,
  years_in_function_min INTEGER,
  years_in_function_max INTEGER,
  
  -- Budget & authority
  budget_min_usd NUMERIC,
  budget_max_usd NUMERIC,
  budget_currency TEXT DEFAULT 'USD',
  budget_authority_min NUMERIC,
  budget_authority_max NUMERIC,
  budget_authority_type TEXT,
  
  -- Context
  typical_organization_size TEXT,
  organization_type TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### Role Junction Tables (Baseline Data)

```sql
-- Responsibilities
CREATE TABLE IF NOT EXISTS public.role_responsibilities (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES org_roles(id),
  responsibility_id UUID REFERENCES responsibilities(id),
  responsibility_type TEXT,
  time_allocation_percent NUMERIC(5,2),
  is_mandatory BOOLEAN DEFAULT true,
  sequence_order INTEGER
);

-- Tools
CREATE TABLE IF NOT EXISTS public.role_tools (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES org_roles(id),
  tool_id UUID REFERENCES tools(id),
  usage_frequency TEXT,
  proficiency_level TEXT,
  is_required BOOLEAN DEFAULT true
);

-- Skills
CREATE TABLE IF NOT EXISTS public.role_skills (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES org_roles(id),
  skill_id UUID REFERENCES skills(id),
  required_proficiency TEXT,
  is_mandatory BOOLEAN DEFAULT true
);

-- Stakeholders
CREATE TABLE IF NOT EXISTS public.role_stakeholders (
  id UUID PRIMARY KEY,
  role_id UUID REFERENCES org_roles(id),
  stakeholder_id UUID REFERENCES stakeholders(id),
  relationship_type TEXT,
  influence_level TEXT,
  interaction_frequency TEXT
);

-- JTBDs
CREATE TABLE IF NOT EXISTS public.jtbd_roles (
  id UUID PRIMARY KEY,
  jtbd_id UUID REFERENCES jtbd(id),
  role_id UUID REFERENCES org_roles(id),
  role_name TEXT,  -- Cached
  relevance_score NUMERIC(3,2),
  is_primary BOOLEAN DEFAULT false,
  importance TEXT,
  frequency TEXT
);
```

## Complete Role Template: Medical Science Liaison (MSL)

### Core Role Data

```sql
INSERT INTO org_roles (
  function_id,
  department_id,
  name,
  slug,
  title,
  description,
  role_category,
  seniority_level,
  job_family,
  geographic_scope,
  team_size_min,
  team_size_max,
  direct_reports_min,
  direct_reports_max,
  travel_percentage_min,
  travel_percentage_max,
  years_experience_min,
  years_experience_max,
  years_in_function_min,
  years_in_function_max,
  budget_min_usd,
  budget_max_usd,
  budget_authority_min,
  budget_authority_max,
  budget_authority_type,
  typical_organization_size,
  organization_type
) VALUES (
  '{medical_affairs_function_id}',
  '{field_medical_department_id}',
  'Medical Science Liaison',
  'medical-science-liaison',
  'MSL / Medical Science Liaison',
  'Field-based medical professional who serves as a scientific expert and resource to key external stakeholders, including KOLs, clinical investigators, and healthcare professionals. Provides scientific education, gathers medical insights, and supports clinical research activities.',
  'specialist',
  'senior',
  'Medical Affairs',
  'regional',
  0,  -- Individual contributor
  0,
  0,  -- No direct reports typically
  0,
  60,  -- Heavy travel
  80,
  5,   -- 5+ years experience
  15,
  2,   -- 2+ years in Medical Affairs
  8,
  50000,   -- Event/congress budget
  150000,
  10000,   -- Speaker/consultant honoraria
  50000,
  'external_spending',
  'mid_large',  -- Typically in companies with established products
  'pharmaceutical'
);
```

### Role Responsibilities

```sql
-- Core responsibilities for MSL role
INSERT INTO role_responsibilities (role_id, responsibility_id, responsibility_type, time_allocation_percent, is_mandatory, sequence_order)
VALUES
  ('{msl_role_id}', '{kol_engagement_resp_id}', 'core', 30.0, true, 1),
  ('{msl_role_id}', '{scientific_education_resp_id}', 'core', 25.0, true, 2),
  ('{msl_role_id}', '{insights_gathering_resp_id}', 'core', 15.0, true, 3),
  ('{msl_role_id}', '{clinical_trial_support_resp_id}', 'core', 10.0, true, 4),
  ('{msl_role_id}', '{congress_support_resp_id}', 'secondary', 10.0, false, 5),
  ('{msl_role_id}', '{publication_support_resp_id}', 'secondary', 5.0, false, 6),
  ('{msl_role_id}', '{field_coordination_resp_id}', 'administrative', 5.0, true, 7);
```

### Role Tools

```sql
-- Tools used by MSL role
INSERT INTO role_tools (role_id, tool_id, usage_frequency, proficiency_level, is_required)
VALUES
  ('{msl_role_id}', '{crm_tool_id}', 'daily', 'advanced', true),
  ('{msl_role_id}', '{medical_portal_tool_id}', 'daily', 'advanced', true),
  ('{msl_role_id}', '{literature_database_tool_id}', 'weekly', 'advanced', true),
  ('{msl_role_id}', '{presentation_tool_id}', 'weekly', 'intermediate', true),
  ('{msl_role_id}', '{webex_zoom_tool_id}', 'daily', 'intermediate', true),
  ('{msl_role_id}', '{reference_manager_tool_id}', 'weekly', 'intermediate', false),
  ('{msl_role_id}', '{expense_tool_id}', 'weekly', 'basic', true);
```

### Role Skills

```sql
-- Skills required for MSL role
INSERT INTO role_skills (role_id, skill_id, required_proficiency, is_mandatory)
VALUES
  ('{msl_role_id}', '{scientific_communication_skill_id}', 'expert', true),
  ('{msl_role_id}', '{clinical_trial_knowledge_skill_id}', 'advanced', true),
  ('{msl_role_id}', '{relationship_building_skill_id}', 'advanced', true),
  ('{msl_role_id}', '{therapeutic_area_expertise_skill_id}', 'expert', true),
  ('{msl_role_id}', '{data_interpretation_skill_id}', 'advanced', true),
  ('{msl_role_id}', '{presentation_skill_id}', 'advanced', true),
  ('{msl_role_id}', '{insights_synthesis_skill_id}', 'advanced', true),
  ('{msl_role_id}', '{compliance_knowledge_skill_id}', 'advanced', true);
```

### Role Stakeholders

```sql
-- Stakeholders for MSL role
INSERT INTO role_stakeholders (role_id, stakeholder_id, relationship_type, influence_level, interaction_frequency)
VALUES
  ('{msl_role_id}', '{kol_stakeholder_id}', 'external_partner', 'high', 'weekly'),
  ('{msl_role_id}', '{clinical_investigator_stakeholder_id}', 'external_partner', 'high', 'monthly'),
  ('{msl_role_id}', '{hcp_stakeholder_id}', 'external_partner', 'medium', 'monthly'),
  ('{msl_role_id}', '{medical_director_stakeholder_id}', 'manager', 'high', 'weekly'),
  ('{msl_role_id}', '{clinical_ops_stakeholder_id}', 'internal_partner', 'medium', 'monthly'),
  ('{msl_role_id}', '{medical_info_stakeholder_id}', 'internal_partner', 'medium', 'weekly'),
  ('{msl_role_id}', '{regulatory_stakeholder_id}', 'internal_partner', 'low', 'quarterly');
```

### Role JTBDs

```sql
-- JTBDs mapped to MSL role
INSERT INTO jtbd_roles (jtbd_id, role_id, relevance_score, is_primary, importance, frequency)
VALUES
  ('{engage_kols_jtbd_id}', '{msl_role_id}', 1.0, true, 'critical', 'daily'),
  ('{deliver_scientific_education_jtbd_id}', '{msl_role_id}', 1.0, true, 'critical', 'weekly'),
  ('{gather_medical_insights_jtbd_id}', '{msl_role_id}', 0.9, true, 'high', 'weekly'),
  ('{support_clinical_trials_jtbd_id}', '{msl_role_id}', 0.7, false, 'medium', 'monthly'),
  ('{respond_medical_inquiries_jtbd_id}', '{msl_role_id}', 0.5, false, 'medium', 'weekly'),
  ('{support_publications_jtbd_id}', '{msl_role_id}', 0.6, false, 'medium', 'quarterly');
```

## Enrichment Attribute Guide

### 1. Scope Attributes

**Geographic Scope:**
- `local`: Single city/territory
- `regional`: Multiple territories/states
- `multi_regional`: Multiple regions
- `global`: Worldwide

**Team Size:**
- Include both min and max for typical team sizes
- Set to 0 for individual contributors
- For matrix organizations, consider indirect reports

**Travel Percentage:**
- Entry: 0-20%
- Field roles: 40-80%
- Leadership: 20-40%

### 2. Experience Ranges

**Years of Experience:**
- Entry: 0-3 years
- Mid: 3-7 years
- Senior: 7-12 years
- Director: 10-15 years
- Executive: 15+ years

**Function-Specific Experience:**
- Usually 2-5 years less than total experience
- Critical for specialist roles

### 3. Budget Authority

**Types:**
- `operational`: Day-to-day expenses
- `project`: Project-specific budgets
- `external_spending`: KOL fees, grants, honoraria
- `capital`: Equipment, infrastructure
- `personnel`: Hiring, compensation

**Ranges by Seniority:**
- Individual Contributor: $10K-$100K (operational)
- Senior/Manager: $100K-$500K (project)
- Director: $500K-$2M (departmental)
- VP/Executive: $2M+ (functional)

### 4. Organization Context

**Organization Size:**
- `small`: <500 employees
- `mid`: 500-2000 employees
- `mid_large`: 2000-10000 employees
- `large`: 10000+ employees

**Organization Type:**
- `pharmaceutical`: Traditional pharma
- `biotech`: Biotech companies
- `medtech`: Medical device/technology
- `cro`: Contract research organization
- `consulting`: Consulting/advisory

## Role Categories & Job Families

### Role Categories
1. **individual_contributor**: IC roles, no direct reports
2. **leadership**: People management, strategic direction
3. **specialist**: Deep expertise in specific domain

### Common Job Families by Function

**Medical Affairs:**
- Medical Science Liaison
- Medical Information
- Medical Communications
- Medical Education
- HEOR/Epidemiology
- Medical Affairs Leadership

**Commercial:**
- Sales Representative
- Account Manager
- Key Account Manager
- Commercial Operations
- Sales Management

**Market Access:**
- HEOR Analyst
- Payer Relations Manager
- Pricing & Contracting
- Reimbursement Specialist

## Verification Queries

```sql
-- Check roles with all enrichment
SELECT 
  r.name,
  r.seniority_level,
  r.role_category,
  r.geographic_scope,
  CONCAT(r.years_experience_min, '-', r.years_experience_max) as experience_range,
  CONCAT('$', r.budget_min_usd/1000, 'K-$', r.budget_max_usd/1000, 'K') as budget_range,
  COUNT(DISTINCT rr.id) as responsibilities_count,
  COUNT(DISTINCT rt.id) as tools_count,
  COUNT(DISTINCT rs.id) as skills_count,
  COUNT(DISTINCT rstake.id) as stakeholders_count,
  COUNT(DISTINCT jr.id) as jtbds_count
FROM org_roles r
LEFT JOIN role_responsibilities rr ON r.id = rr.role_id
LEFT JOIN role_tools rt ON r.id = rt.role_id
LEFT JOIN role_skills rs ON r.id = rs.role_id
LEFT JOIN role_stakeholders rstake ON r.id = rstake.role_id
LEFT JOIN jtbd_roles jr ON r.id = jr.role_id
WHERE r.function_id = '{your_function_id}'
GROUP BY r.id, r.name, r.seniority_level, r.role_category, r.geographic_scope,
         r.years_experience_min, r.years_experience_max, r.budget_min_usd, r.budget_max_usd
ORDER BY r.name;

-- Find roles missing enrichment
SELECT 
  r.name,
  CASE WHEN r.years_experience_min IS NULL THEN 'Missing experience range' END as experience_gap,
  CASE WHEN r.budget_min_usd IS NULL THEN 'Missing budget' END as budget_gap,
  CASE WHEN r.team_size_min IS NULL THEN 'Missing team size' END as team_gap,
  CASE WHEN COUNT(DISTINCT rr.id) = 0 THEN 'No responsibilities' END as resp_gap,
  CASE WHEN COUNT(DISTINCT rt.id) = 0 THEN 'No tools' END as tools_gap,
  CASE WHEN COUNT(DISTINCT jr.id) = 0 THEN 'No JTBDs' END as jtbd_gap
FROM org_roles r
LEFT JOIN role_responsibilities rr ON r.id = rr.role_id
LEFT JOIN role_tools rt ON r.id = rt.role_id
LEFT JOIN jtbd_roles jr ON r.id = jr.role_id
GROUP BY r.id, r.name, r.years_experience_min, r.budget_min_usd, r.team_size_min
HAVING 
  r.years_experience_min IS NULL OR
  r.budget_min_usd IS NULL OR
  r.team_size_min IS NULL OR
  COUNT(DISTINCT rr.id) = 0 OR
  COUNT(DISTINCT rt.id) = 0 OR
  COUNT(DISTINCT jr.id) = 0;
```

## Best Practices

1. **Start with Core Role Attributes:** Define name, description, classification first
2. **Add Scope Ranges:** Be realistic about experience, team size, budget
3. **Map Baseline Junctions:** At minimum, add responsibilities and tools
4. **Link to JTBDs:** Every role should map to 3-10 core JTBDs
5. **Verify Completeness:** Run verification queries to catch gaps
6. **Document Assumptions:** Note any assumptions in role descriptions
7. **Use Real-World Data:** Base ranges on market research and job postings

## Next Steps

After creating roles:
1. Map roles to tenants via `role_tenants` junction table
2. Generate 4 MECE personas per role → Use `persona_seed_template.md`
3. Personas inherit ALL baseline attributes from roles
4. Personas can override specific attributes via persona junction tables
5. Verify persona coverage with quality queries

