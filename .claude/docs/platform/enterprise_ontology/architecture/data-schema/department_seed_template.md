# Department Seed Template

## Overview

This template provides the structure for seeding organizational departments within functions. Departments represent the next level of organizational hierarchy below functions.

## Database Schema

### org_departments Table Structure

```sql
CREATE TABLE IF NOT EXISTS public.org_departments (
  id UUID PRIMARY KEY,
  function_id UUID NOT NULL REFERENCES org_functions(id),
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  description TEXT,
  
  -- Classification
  department_type TEXT, -- operational, support, strategic
  mission_statement TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### Junction Table for Multi-Tenant

```sql
CREATE TABLE IF NOT EXISTS public.department_tenants (
  id UUID PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES org_departments(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, tenant_id)
);
```

## Template: Medical Affairs Departments (Pharmaceuticals)

### Function Context
- **Function:** Medical Affairs
- **Function ID:** `ae0283a2-222f-4703-a17d-06129789a156`
- **Tenant:** Pharmaceuticals (`f7aa6fd4-0af9-4706-8b31-034f1f7accda`)

### Departments

```sql
-- Medical Affairs Leadership
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Leadership',
  'medical-affairs-leadership',
  'strategic',
  'Strategic leadership and governance for the Medical Affairs function',
  'Provide strategic direction, governance, and leadership for Medical Affairs operations globally'
);

-- Field Medical
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Field Medical',
  'field-medical',
  'operational',
  'Medical Science Liaisons and field-based medical engagement with healthcare professionals',
  'Deliver scientific education and medical support to healthcare professionals through field-based expertise'
);

-- Medical Information Services
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Medical Information Services',
  'medical-information-services',
  'operational',
  'Responding to medical inquiries from healthcare professionals and patients',
  'Provide accurate, evidence-based medical information in response to inquiries from healthcare stakeholders'
);

-- Scientific Communications
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Scientific Communications',
  'scientific-communications',
  'operational',
  'Development and dissemination of scientific communications, publications, and medical writing',
  'Create and disseminate high-quality scientific communications that advance medical knowledge'
);

-- Medical Education
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Medical Education',
  'medical-education',
  'operational',
  'Educational programs and materials for healthcare professionals',
  'Develop and deliver evidence-based educational programs that enhance healthcare professional knowledge'
);

-- Evidence Generation & HEOR
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Evidence Generation & HEOR',
  'evidence-generation-heor',
  'strategic',
  'Health economics, outcomes research, and real-world evidence generation',
  'Generate robust real-world evidence to demonstrate product value and support market access'
);

-- Medical Publications
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Medical Publications',
  'medical-publications',
  'operational',
  'Planning and execution of medical publications strategy',
  'Execute publication strategy to share scientific findings with the medical community'
);

-- Clinical Operations Support
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Clinical Operations Support',
  'clinical-operations-support',
  'support',
  'Medical support for clinical trial operations',
  'Provide medical expertise and support to ensure clinical trial quality and compliance'
);

-- Medical Excellence & Governance
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  'ae0283a2-222f-4703-a17d-06129789a156',
  'Medical Excellence & Governance',
  'medical-excellence-governance',
  'support',
  'Quality assurance, compliance, and medical governance',
  'Ensure excellence, compliance, and governance across all Medical Affairs activities'
);
```

## Template: Market Access Departments (Pharmaceuticals)

### Function Context
- **Function:** Market Access
- **Tenant:** Pharmaceuticals

### Departments

```sql
-- Market Access Strategy & Leadership
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  '{function_id}',
  'Market Access Strategy & Leadership',
  'market-access-strategy-leadership',
  'strategic',
  'Strategic planning and leadership for market access activities',
  'Drive strategic market access planning to ensure patient access to therapies'
);

-- Health Economics & Outcomes Research
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  '{function_id}',
  'Health Economics & Outcomes Research',
  'heor',
  'strategic',
  'Economic modeling and outcomes research to demonstrate product value',
  'Generate health economic evidence to support value proposition and reimbursement'
);

-- Pricing & Contracting
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  '{function_id}',
  'Pricing & Contracting',
  'pricing-contracting',
  'operational',
  'Pricing strategy, contract negotiations, and managed care operations',
  'Optimize pricing and contracting strategies to maximize access while ensuring commercial viability'
);

-- Payer Relations
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  '{function_id}',
  'Payer Relations',
  'payer-relations',
  'operational',
  'Engagement and relationship management with payers and pharmacy benefit managers',
  'Build and maintain strategic relationships with payers to facilitate product access'
);

-- Reimbursement & Access
INSERT INTO org_departments (function_id, name, slug, department_type, description, mission_statement) VALUES
(
  '{function_id}',
  'Reimbursement & Access',
  'reimbursement-access',
  'operational',
  'Reimbursement strategy and patient access programs',
  'Ensure patients can access and afford our therapies through comprehensive access programs'
);
```

## Customization Guide

### 1. Identify Function Context
```sql
-- Query to get function ID
SELECT id, name FROM org_functions WHERE slug = 'your-function-slug';
```

### 2. Define Department Types
- **strategic:** Sets direction, makes high-level decisions
- **operational:** Executes day-to-day operations
- **support:** Enables and supports other departments

### 3. Write Mission Statements
Format: "Verb + Object + Purpose"
- Example: "Provide [what] to [whom] for [purpose]"
- Example: "Ensure [outcome] through [method]"

### 4. Generate Slugs
- Lowercase, hyphen-separated
- Descriptive and URL-friendly
- Unique across all departments
- Pattern: `{function-name}-{department-name}` or just `{department-name}` if clear

### 5. Map to Tenants
```sql
-- After inserting departments, map to tenant
INSERT INTO department_tenants (department_id, tenant_id)
SELECT d.id, t.id
FROM org_departments d, tenants t
WHERE d.function_id = '{your_function_id}'
  AND t.slug = 'pharmaceuticals';
```

## Standard Pharmaceutical Departments by Function

### Medical Affairs (9 departments)
1. Leadership
2. Field Medical
3. Medical Information Services
4. Scientific Communications
5. Medical Education
6. Evidence Generation & HEOR
7. Medical Publications
8. Clinical Operations Support
9. Medical Excellence & Governance

### Commercial Organization (11 departments)
1. Sales Leadership & Strategy
2. Account Management
3. Specialty Sales
4. Primary Care Sales
5. Hospital / Institutional Sales
6. Key Account Management
7. Commercial Operations & Analytics
8. Sales Training & Enablement
9. Incentive Compensation
10. Territory Management
11. Customer Engagement & Omnichannel

### Market Access (10 departments)
1. Market Access Strategy & Leadership
2. Health Economics & Outcomes Research
3. Pricing & Contracting
4. Payer Relations
5. Reimbursement & Access
6. Government Affairs & Policy
7. Value & Evidence Communication
8. Patient Services & Hub Operations
9. Specialty Pharmacy Relations
10. Trade & Distribution

### Regulatory Affairs (6 departments)
1. Regulatory Leadership & Strategy
2. Regulatory Submissions
3. Regulatory Intelligence
4. Regulatory Operations
5. Labeling & Advertising Review
6. Product Surveillance & Compliance

## Verification Queries

```sql
-- Check departments by function
SELECT 
  f.name as function_name,
  COUNT(d.id) as department_count,
  STRING_AGG(d.name, ', ' ORDER BY d.name) as departments
FROM org_functions f
LEFT JOIN org_departments d ON f.id = d.function_id
GROUP BY f.id, f.name
ORDER BY f.name;

-- Check tenant mappings
SELECT 
  t.name as tenant_name,
  f.name as function_name,
  d.name as department_name,
  d.department_type
FROM department_tenants dt
JOIN org_departments d ON dt.department_id = d.id
JOIN org_functions f ON d.function_id = f.id
JOIN tenants t ON dt.tenant_id = t.id
ORDER BY t.name, f.name, d.name;

-- Check for unmapped departments
SELECT 
  f.name as function_name,
  d.name as department_name
FROM org_departments d
JOIN org_functions f ON d.function_id = f.id
WHERE NOT EXISTS (
  SELECT 1 FROM department_tenants dt 
  WHERE dt.department_id = d.id
)
ORDER BY f.name, d.name;
```

## Best Practices

1. **Consistent Naming:** Use clear, industry-standard department names
2. **Mission Alignment:** Ensure mission statements support function goals
3. **Type Classification:** Accurately categorize as strategic/operational/support
4. **Unique Slugs:** Generate descriptive, URL-friendly slugs
5. **Tenant Mapping:** Always map departments to appropriate tenants
6. **Documentation:** Include descriptions that explain department scope
7. **Verification:** Run verification queries after seeding

## Next Steps

After creating departments:
1. Create roles within each department → Use `role_seed_template.md`
2. Map roles to tenants via `role_tenants` junction table
3. Generate 4 MECE personas per role → Use `persona_seed_template.md`
4. Verify org structure completeness → Run verification queries

