-- Market Access Missing Personas Generator
-- Generated: 2025-11-17
-- Total personas to generate: 143

BEGIN;

-- Persona 1: Daniel Rodriguez - Government Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Rodriguez', 'daniel-rodriguez-government-affairs-specialist-0', 'Government Affairs Specialist - Large Pharma (Portfolio Lead)',
  'mid-level', 7, 4, 11,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Specialist'
LIMIT 1;

-- Persona 2: Andrew Harris - Government Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Harris', 'andrew-harris-government-affairs-specialist-1', 'Government Affairs Specialist - Large Pharma (Portfolio Lead)',
  'mid-level', 9, 5, 13,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Specialist'
LIMIT 1;

-- Persona 3: Jessica Wright - Government Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jessica Wright', 'jessica-wright-government-affairs-specialist-2', 'Government Affairs Specialist - Mid-Size Pharma (Strategic Lead)',
  'mid-level', 7, 4, 8,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Specialist'
LIMIT 1;

-- Persona 4: Lauren Moore - Government Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Moore', 'lauren-moore-government-affairs-specialist-3', 'Government Affairs Specialist - Biotech (Rare Disease)',
  'mid-level', 6, 3, 8,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Specialist'
LIMIT 1;

-- Persona 5: David Wright - Policy & Advocacy Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'David Wright', 'david-wright-policy-advocacy-manager-4', 'Policy & Advocacy Manager - Emerging Biopharma (Lifecycle Management)',
  'senior', 13, 6, 18,
  'Emerging Biopharma', 7, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Policy & Advocacy Manager'
LIMIT 1;

-- Persona 6: Lisa King - Policy & Advocacy Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa King', 'lisa-king-policy-advocacy-manager-5', 'Policy & Advocacy Manager - Large Pharma (Strategic Lead)',
  'senior', 11, 6, 16,
  'Large Pharma', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Policy & Advocacy Manager'
LIMIT 1;

-- Persona 7: David Martinez - Policy & Advocacy Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'David Martinez', 'david-martinez-policy-advocacy-manager-6', 'Policy & Advocacy Manager - Mid-Size Pharma (Rare Disease)',
  'senior', 13, 5, 17,
  'Mid-Size Pharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Policy & Advocacy Manager'
LIMIT 1;

-- Persona 8: James King - Policy & Advocacy Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James King', 'james-king-policy-advocacy-manager-7', 'Policy & Advocacy Manager - Biotech (Strategic Lead)',
  'senior', 12, 3, 17,
  'Biotech', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Policy & Advocacy Manager'
LIMIT 1;

-- Persona 9: Robert Allen - Head of HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Allen', 'robert-allen-head-of-heor-8', 'Head of HEOR - Specialty Pharma (Launch Expert)',
  'director', 18, 3, 19,
  'Specialty Pharma', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR'
LIMIT 1;

-- Persona 10: James Moore - Head of HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Moore', 'james-moore-head-of-heor-9', 'Head of HEOR - Emerging Biopharma (Rare Disease)',
  'director', 12, 5, 17,
  'Emerging Biopharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR'
LIMIT 1;

-- Persona 11: Jessica Allen - Head of HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jessica Allen', 'jessica-allen-head-of-heor-10', 'Head of HEOR - Mid-Size Pharma (Oncology Focus)',
  'director', 17, 4, 18,
  'Mid-Size Pharma', 3, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR'
LIMIT 1;

-- Persona 12: Amanda Taylor - Head of HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Taylor', 'amanda-taylor-head-of-heor-11', 'Head of HEOR - Mid-Size Pharma (Oncology Focus)',
  'director', 15, 4, 19,
  'Mid-Size Pharma', 3, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR'
LIMIT 1;

-- Persona 13: Amanda Hill - Health Economics Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Hill', 'amanda-hill-health-economics-analyst-12', 'Health Economics Analyst - Mid-Size Pharma (Lifecycle Management)',
  'mid-level', 10, 6, 15,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economics Analyst'
LIMIT 1;

-- Persona 14: Michael Martinez - Health Economics Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael Martinez', 'michael-martinez-health-economics-analyst-13', 'Health Economics Analyst - Biotech (Rare Disease)',
  'mid-level', 9, 4, 10,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economics Analyst'
LIMIT 1;

-- Persona 15: James Lopez - Health Economics Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Lopez', 'james-lopez-health-economics-analyst-14', 'Health Economics Analyst - Specialty Pharma (Rare Disease)',
  'mid-level', 5, 4, 8,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economics Analyst'
LIMIT 1;

-- Persona 16: Kevin Wright - Health Economics Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Wright', 'kevin-wright-health-economics-analyst-15', 'Health Economics Analyst - Emerging Biopharma (Portfolio Lead)',
  'mid-level', 5, 3, 7,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economics Analyst'
LIMIT 1;

-- Persona 17: Lauren Allen - Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Allen', 'lauren-allen-health-economist-16', 'Health Economist - Large Pharma (Launch Expert)',
  'mid-level', 10, 3, 12,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economist'
LIMIT 1;

-- Persona 18: Amanda Harris - Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Harris', 'amanda-harris-health-economist-17', 'Health Economist - Mid-Size Pharma (Lifecycle Management)',
  'mid-level', 10, 3, 14,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economist'
LIMIT 1;

-- Persona 19: Michael Rodriguez - Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael Rodriguez', 'michael-rodriguez-health-economist-18', 'Health Economist - Emerging Biopharma (Lifecycle Management)',
  'mid-level', 9, 5, 13,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economist'
LIMIT 1;

-- Persona 20: Sarah Wilson - Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Wilson', 'sarah-wilson-health-economist-19', 'Health Economist - Large Pharma (Portfolio Lead)',
  'mid-level', 7, 4, 12,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Health Economist'
LIMIT 1;

-- Persona 21: Michelle Lopez - HEOR Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Lopez', 'michelle-lopez-heor-associate-20', 'HEOR Associate - Emerging Biopharma (Lifecycle Management)',
  'entry', 2, 2, 7,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Associate'
LIMIT 1;

-- Persona 22: Lauren Young - HEOR Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Young', 'lauren-young-heor-associate-21', 'HEOR Associate - Biotech (Lifecycle Management)',
  'entry', 5, 4, 9,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Associate'
LIMIT 1;

-- Persona 23: Amanda Lee - HEOR Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Lee', 'amanda-lee-heor-associate-22', 'HEOR Associate - Large Pharma (Operational Expert)',
  'entry', 3, 3, 6,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Associate'
LIMIT 1;

-- Persona 24: James Garcia - HEOR Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Garcia', 'james-garcia-heor-associate-23', 'HEOR Associate - Mid-Size Pharma (Oncology Focus)',
  'entry', 2, 2, 4,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Associate'
LIMIT 1;

-- Persona 25: Michelle Hill - HEOR Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Hill', 'michelle-hill-heor-director-24', 'HEOR Director - Emerging Biopharma (Operational Expert)',
  'director', 17, 5, 20,
  'Emerging Biopharma', 1, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director'
LIMIT 1;

-- Persona 26: Lisa Rodriguez - HEOR Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Rodriguez', 'lisa-rodriguez-heor-director-25', 'HEOR Director - Emerging Biopharma (Oncology Focus)',
  'director', 18, 5, 23,
  'Emerging Biopharma', 3, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director'
LIMIT 1;

-- Persona 27: Andrew Harris - HEOR Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Harris', 'andrew-harris-heor-director-26', 'HEOR Director - Specialty Pharma (Operational Expert)',
  'director', 18, 4, 23,
  'Specialty Pharma', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director'
LIMIT 1;

-- Persona 28: Rachel Taylor - HEOR Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Rachel Taylor', 'rachel-taylor-heor-director-27', 'HEOR Director - Large Pharma (Operational Expert)',
  'director', 17, 4, 18,
  'Large Pharma', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director'
LIMIT 1;

-- Persona 29: Robert Hall - HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Hall', 'robert-hall-heor-manager-28', 'HEOR Manager - Large Pharma (Lifecycle Management)',
  'senior', 9, 3, 11,
  'Large Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Manager'
LIMIT 1;

-- Persona 30: Amanda Walker - HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Walker', 'amanda-walker-heor-manager-29', 'HEOR Manager - Large Pharma (Strategic Lead)',
  'senior', 14, 3, 16,
  'Large Pharma', 20, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Manager'
LIMIT 1;

-- Persona 31: Lauren Hall - HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Hall', 'lauren-hall-heor-manager-30', 'HEOR Manager - Emerging Biopharma (Oncology Focus)',
  'senior', 14, 6, 17,
  'Emerging Biopharma', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Manager'
LIMIT 1;

-- Persona 32: James Allen - HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Allen', 'james-allen-heor-manager-31', 'HEOR Manager - Biotech (Portfolio Lead)',
  'senior', 14, 5, 17,
  'Biotech', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Manager'
LIMIT 1;

-- Persona 33: Robert Moore - Senior Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Moore', 'robert-moore-senior-health-economist-32', 'Senior Health Economist - Specialty Pharma (Operational Expert)',
  'senior', 13, 6, 17,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist'
LIMIT 1;

-- Persona 34: Rachel Lewis - Senior Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Rachel Lewis', 'rachel-lewis-senior-health-economist-33', 'Senior Health Economist - Emerging Biopharma (Launch Expert)',
  'senior', 13, 6, 18,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist'
LIMIT 1;

-- Persona 35: Daniel Rodriguez - Senior Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Rodriguez', 'daniel-rodriguez-senior-health-economist-34', 'Senior Health Economist - Large Pharma (Launch Expert)',
  'senior', 9, 3, 12,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist'
LIMIT 1;

-- Persona 36: Jessica Martinez - Senior Health Economist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jessica Martinez', 'jessica-martinez-senior-health-economist-35', 'Senior Health Economist - Biotech (Oncology Focus)',
  'senior', 13, 2, 14,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist'
LIMIT 1;

-- Persona 37: Kevin Martinez - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Martinez', 'kevin-martinez-senior-heor-manager-36', 'Senior HEOR Manager - Specialty Pharma (Rare Disease)',
  'senior', 9, 5, 10,
  'Specialty Pharma', 2, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 38: Lauren Clark - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Clark', 'lauren-clark-senior-heor-manager-37', 'Senior HEOR Manager - Specialty Pharma (Operational Expert)',
  'senior', 9, 6, 12,
  'Specialty Pharma', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 39: Brian Hall - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Hall', 'brian-hall-senior-heor-manager-38', 'Senior HEOR Manager - Biotech (Oncology Focus)',
  'senior', 14, 5, 16,
  'Biotech', 19, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 40: Emily Moore - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Emily Moore', 'emily-moore-senior-heor-manager-39', 'Senior HEOR Manager - Mid-Size Pharma (Lifecycle Management)',
  'senior', 13, 4, 17,
  'Mid-Size Pharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 41: Christopher Clark - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Christopher Clark', 'christopher-clark-senior-heor-manager-40', 'Senior HEOR Manager - Large Pharma (Rare Disease)',
  'senior', 14, 5, 17,
  'Large Pharma', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 42: Michelle Lopez - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Lopez', 'michelle-lopez-senior-heor-manager-41', 'Senior HEOR Manager - Mid-Size Pharma (Strategic Lead)',
  'senior', 12, 5, 16,
  'Mid-Size Pharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 43: Andrew Garcia - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Garcia', 'andrew-garcia-senior-heor-manager-42', 'Senior HEOR Manager - Emerging Biopharma (Portfolio Lead)',
  'senior', 8, 6, 10,
  'Emerging Biopharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 44: Michael Wright - Senior HEOR Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael Wright', 'michael-wright-senior-heor-manager-43', 'Senior HEOR Manager - Specialty Pharma (Portfolio Lead)',
  'senior', 14, 6, 17,
  'Specialty Pharma', 19, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior HEOR Manager'
LIMIT 1;

-- Persona 45: Lisa Garcia - Senior Director Market Access
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Garcia', 'lisa-garcia-senior-director-market-access-44', 'Senior Director Market Access - Specialty Pharma (Oncology Focus)',
  'director', 15, 4, 18,
  'Specialty Pharma', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Director Market Access'
LIMIT 1;

-- Persona 46: Daniel Lee - Senior Director Market Access
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Lee', 'daniel-lee-senior-director-market-access-45', 'Senior Director Market Access - Specialty Pharma (Portfolio Lead)',
  'director', 18, 6, 20,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Director Market Access'
LIMIT 1;

-- Persona 47: Andrew Lopez - Senior Director Market Access
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Lopez', 'andrew-lopez-senior-director-market-access-46', 'Senior Director Market Access - Mid-Size Pharma (Lifecycle Management)',
  'director', 17, 2, 18,
  'Mid-Size Pharma', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Director Market Access'
LIMIT 1;

-- Persona 48: Jessica Lopez - Senior Director Market Access
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jessica Lopez', 'jessica-lopez-senior-director-market-access-47', 'Senior Director Market Access - Specialty Pharma (Operational Expert)',
  'director', 15, 5, 19,
  'Specialty Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Director Market Access'
LIMIT 1;

-- Persona 49: Daniel Martinez - Market Access Analytics Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Martinez', 'daniel-martinez-market-access-analytics-director-48', 'Market Access Analytics Director - Emerging Biopharma (Oncology Focus)',
  'director', 14, 5, 17,
  'Emerging Biopharma', 16, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analytics Director'
LIMIT 1;

-- Persona 50: Michael Rodriguez - Market Access Analytics Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael Rodriguez', 'michael-rodriguez-market-access-analytics-director-49', 'Market Access Analytics Director - Large Pharma (Oncology Focus)',
  'director', 20, 4, 22,
  'Large Pharma', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analytics Director'
LIMIT 1;

-- Persona 51: Lisa Clark - Market Access Analytics Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Clark', 'lisa-clark-market-access-analytics-director-50', 'Market Access Analytics Director - Biotech (Launch Expert)',
  'director', 15, 2, 20,
  'Biotech', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analytics Director'
LIMIT 1;

-- Persona 52: David Lee - Market Access Analytics Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'David Lee', 'david-lee-market-access-analytics-director-51', 'Market Access Analytics Director - Emerging Biopharma (Lifecycle Management)',
  'director', 19, 4, 23,
  'Emerging Biopharma', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analytics Director'
LIMIT 1;

-- Persona 53: Kevin Anderson - MA Operations Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Anderson', 'kevin-anderson-ma-operations-coordinator-52', 'MA Operations Coordinator - Emerging Biopharma (Strategic Lead)',
  'entry', 4, 3, 6,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Operations Coordinator'
LIMIT 1;

-- Persona 54: Michelle Walker - MA Operations Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Walker', 'michelle-walker-ma-operations-coordinator-53', 'MA Operations Coordinator - Specialty Pharma (Strategic Lead)',
  'entry', 5, 5, 8,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Operations Coordinator'
LIMIT 1;

-- Persona 55: Robert Hill - MA Operations Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Hill', 'robert-hill-ma-operations-coordinator-54', 'MA Operations Coordinator - Emerging Biopharma (Launch Expert)',
  'entry', 3, 2, 6,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Operations Coordinator'
LIMIT 1;

-- Persona 56: Brian Moore - MA Operations Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Moore', 'brian-moore-ma-operations-coordinator-55', 'MA Operations Coordinator - Biotech (Oncology Focus)',
  'entry', 3, 3, 5,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Operations Coordinator'
LIMIT 1;

-- Persona 57: Michelle Thompson - Patient Access Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Thompson', 'michelle-thompson-patient-access-coordinator-56', 'Patient Access Coordinator - Biotech (Portfolio Lead)',
  'entry', 3, 3, 5,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Coordinator'
LIMIT 1;

-- Persona 58: Matthew Hall - Patient Access Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Hall', 'matthew-hall-patient-access-coordinator-57', 'Patient Access Coordinator - Emerging Biopharma (Rare Disease)',
  'entry', 3, 2, 7,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Coordinator'
LIMIT 1;

-- Persona 59: Lauren Martinez - Patient Access Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Martinez', 'lauren-martinez-patient-access-coordinator-58', 'Patient Access Coordinator - Biotech (Rare Disease)',
  'entry', 4, 4, 6,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Coordinator'
LIMIT 1;

-- Persona 60: Christopher Wilson - Patient Access Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Christopher Wilson', 'christopher-wilson-patient-access-coordinator-59', 'Patient Access Coordinator - Emerging Biopharma (Rare Disease)',
  'entry', 5, 3, 8,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Coordinator'
LIMIT 1;

-- Persona 61: Sarah Lopez - Patient Access Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Lopez', 'sarah-lopez-patient-access-specialist-60', 'Patient Access Specialist - Mid-Size Pharma (Lifecycle Management)',
  'mid-level', 5, 4, 8,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Specialist'
LIMIT 1;

-- Persona 62: Matthew Walker - Patient Access Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Walker', 'matthew-walker-patient-access-specialist-61', 'Patient Access Specialist - Specialty Pharma (Operational Expert)',
  'mid-level', 9, 4, 11,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Specialist'
LIMIT 1;

-- Persona 63: James Thompson - Patient Access Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Thompson', 'james-thompson-patient-access-specialist-62', 'Patient Access Specialist - Emerging Biopharma (Oncology Focus)',
  'mid-level', 5, 5, 7,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Specialist'
LIMIT 1;

-- Persona 64: Kevin Young - Patient Access Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Young', 'kevin-young-patient-access-specialist-63', 'Patient Access Specialist - Biotech (Lifecycle Management)',
  'mid-level', 6, 3, 11,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Access Specialist'
LIMIT 1;

-- Persona 65: Michelle Moore - National Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Moore', 'michelle-moore-national-payer-director-64', 'National Payer Director - Emerging Biopharma (Launch Expert)',
  'director', 15, 6, 18,
  'Emerging Biopharma', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'National Payer Director'
LIMIT 1;

-- Persona 66: Christopher Anderson - National Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Christopher Anderson', 'christopher-anderson-national-payer-director-65', 'National Payer Director - Mid-Size Pharma (Launch Expert)',
  'director', 13, 5, 18,
  'Mid-Size Pharma', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'National Payer Director'
LIMIT 1;

-- Persona 67: Brian Allen - National Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Allen', 'brian-allen-national-payer-director-66', 'National Payer Director - Biotech (Operational Expert)',
  'director', 16, 2, 19,
  'Biotech', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'National Payer Director'
LIMIT 1;

-- Persona 68: Lauren Martinez - National Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lauren Martinez', 'lauren-martinez-national-payer-director-67', 'National Payer Director - Mid-Size Pharma (Lifecycle Management)',
  'director', 12, 5, 16,
  'Mid-Size Pharma', 12, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'National Payer Director'
LIMIT 1;

-- Persona 69: Amanda Young - Payer Account Executive
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Young', 'amanda-young-payer-account-executive-68', 'Payer Account Executive - Large Pharma (Operational Expert)',
  'mid-level', 9, 4, 13,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Account Executive'
LIMIT 1;

-- Persona 70: Andrew Wilson - Payer Account Executive
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Wilson', 'andrew-wilson-payer-account-executive-69', 'Payer Account Executive - Specialty Pharma (Operational Expert)',
  'mid-level', 6, 4, 7,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Account Executive'
LIMIT 1;

-- Persona 71: Nicole Lopez - Payer Account Executive
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Nicole Lopez', 'nicole-lopez-payer-account-executive-70', 'Payer Account Executive - Mid-Size Pharma (Portfolio Lead)',
  'mid-level', 8, 4, 12,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Account Executive'
LIMIT 1;

-- Persona 72: Robert Garcia - Payer Account Executive
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Garcia', 'robert-garcia-payer-account-executive-71', 'Payer Account Executive - Specialty Pharma (Operational Expert)',
  'mid-level', 10, 4, 14,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Account Executive'
LIMIT 1;

-- Persona 73: Lisa Clark - Regional Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Clark', 'lisa-clark-regional-payer-director-72', 'Regional Payer Director - Mid-Size Pharma (Rare Disease)',
  'director', 12, 4, 16,
  'Mid-Size Pharma', 1, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director'
LIMIT 1;

-- Persona 74: Amanda Rodriguez - Regional Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Rodriguez', 'amanda-rodriguez-regional-payer-director-73', 'Regional Payer Director - Emerging Biopharma (Operational Expert)',
  'director', 12, 3, 17,
  'Emerging Biopharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director'
LIMIT 1;

-- Persona 75: Lisa Anderson - Regional Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Anderson', 'lisa-anderson-regional-payer-director-74', 'Regional Payer Director - Large Pharma (Strategic Lead)',
  'director', 14, 6, 18,
  'Large Pharma', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director'
LIMIT 1;

-- Persona 76: James Clark - Regional Payer Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Clark', 'james-clark-regional-payer-director-75', 'Regional Payer Director - Specialty Pharma (Portfolio Lead)',
  'director', 17, 2, 22,
  'Specialty Pharma', 2, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director'
LIMIT 1;

-- Persona 77: Emily Wilson - Director of Pricing
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Emily Wilson', 'emily-wilson-director-of-pricing-76', 'Director of Pricing - Mid-Size Pharma (Launch Expert)',
  'director', 17, 6, 22,
  'Mid-Size Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director of Pricing'
LIMIT 1;

-- Persona 78: Robert King - Director of Pricing
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert King', 'robert-king-director-of-pricing-77', 'Director of Pricing - Large Pharma (Portfolio Lead)',
  'director', 17, 2, 20,
  'Large Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director of Pricing'
LIMIT 1;

-- Persona 79: Christopher Lopez - Director of Pricing
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Christopher Lopez', 'christopher-lopez-director-of-pricing-78', 'Director of Pricing - Biotech (Lifecycle Management)',
  'director', 17, 6, 19,
  'Biotech', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director of Pricing'
LIMIT 1;

-- Persona 80: Sarah Garcia - Director of Pricing
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Garcia', 'sarah-garcia-director-of-pricing-79', 'Director of Pricing - Biotech (Strategic Lead)',
  'director', 14, 6, 15,
  'Biotech', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director of Pricing'
LIMIT 1;

-- Persona 81: Brian Hall - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Hall', 'brian-hall-reimbursement-manager-80', 'Reimbursement Manager - Mid-Size Pharma (Strategic Lead)',
  'senior', 10, 3, 15,
  'Mid-Size Pharma', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 82: Robert Taylor - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Taylor', 'robert-taylor-reimbursement-manager-81', 'Reimbursement Manager - Biotech (Lifecycle Management)',
  'senior', 9, 6, 14,
  'Biotech', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 83: David Lewis - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'David Lewis', 'david-lewis-reimbursement-manager-82', 'Reimbursement Manager - Specialty Pharma (Oncology Focus)',
  'senior', 11, 5, 14,
  'Specialty Pharma', 19, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 84: Jennifer Martinez - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jennifer Martinez', 'jennifer-martinez-reimbursement-manager-83', 'Reimbursement Manager - Mid-Size Pharma (Strategic Lead)',
  'senior', 15, 6, 20,
  'Mid-Size Pharma', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 85: Emily Clark - Market Access Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Emily Clark', 'emily-clark-market-access-analyst-84', 'Market Access Analyst - Emerging Biopharma (Portfolio Lead)',
  'mid-level', 5, 3, 9,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analyst'
LIMIT 1;

-- Persona 86: Matthew Lewis - Market Access Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Lewis', 'matthew-lewis-market-access-analyst-85', 'Market Access Analyst - Biotech (Rare Disease)',
  'mid-level', 10, 2, 13,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analyst'
LIMIT 1;

-- Persona 87: Sarah Lewis - Market Access Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Lewis', 'sarah-lewis-market-access-analyst-86', 'Market Access Analyst - Emerging Biopharma (Launch Expert)',
  'mid-level', 6, 5, 9,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analyst'
LIMIT 1;

-- Persona 88: Matthew Wright - Market Access Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Wright', 'matthew-wright-market-access-analyst-87', 'Market Access Analyst - Mid-Size Pharma (Rare Disease)',
  'mid-level', 6, 2, 9,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Analyst'
LIMIT 1;

-- Persona 89: Matthew King - Pricing Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew King', 'matthew-king-pricing-analyst-88', 'Pricing Analyst - Large Pharma (Launch Expert)',
  'mid-level', 10, 3, 11,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Analyst'
LIMIT 1;

-- Persona 90: Matthew Moore - Pricing Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Moore', 'matthew-moore-pricing-analyst-89', 'Pricing Analyst - Large Pharma (Lifecycle Management)',
  'mid-level', 7, 2, 11,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Analyst'
LIMIT 1;

-- Persona 91: Amanda Hill - Pricing Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Hill', 'amanda-hill-pricing-analyst-90', 'Pricing Analyst - Specialty Pharma (Strategic Lead)',
  'mid-level', 9, 2, 11,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Analyst'
LIMIT 1;

-- Persona 92: Rachel Wright - Pricing Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Rachel Wright', 'rachel-wright-pricing-analyst-91', 'Pricing Analyst - Biotech (Launch Expert)',
  'mid-level', 6, 2, 10,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Analyst'
LIMIT 1;

-- Persona 93: Jennifer King - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jennifer King', 'jennifer-king-reimbursement-manager-92', 'Reimbursement Manager - Specialty Pharma (Strategic Lead)',
  'senior', 12, 6, 15,
  'Specialty Pharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 94: Kevin Wright - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Wright', 'kevin-wright-reimbursement-manager-93', 'Reimbursement Manager - Large Pharma (Operational Expert)',
  'senior', 15, 3, 16,
  'Large Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 95: David Taylor - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'David Taylor', 'david-taylor-reimbursement-manager-94', 'Reimbursement Manager - Emerging Biopharma (Rare Disease)',
  'senior', 13, 5, 17,
  'Emerging Biopharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 96: Brian Hill - Reimbursement Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Hill', 'brian-hill-reimbursement-manager-95', 'Reimbursement Manager - Large Pharma (Portfolio Lead)',
  'senior', 13, 3, 17,
  'Large Pharma', 1, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Manager'
LIMIT 1;

-- Persona 97: Rachel Harris - Distribution Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Rachel Harris', 'rachel-harris-distribution-analyst-96', 'Distribution Analyst - Biotech (Launch Expert)',
  'mid-level', 8, 5, 10,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Distribution Analyst'
LIMIT 1;

-- Persona 98: Matthew Hall - Distribution Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Hall', 'matthew-hall-distribution-analyst-97', 'Distribution Analyst - Mid-Size Pharma (Strategic Lead)',
  'mid-level', 8, 3, 11,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Distribution Analyst'
LIMIT 1;

-- Persona 99: Kevin Rodriguez - Distribution Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Rodriguez', 'kevin-rodriguez-distribution-analyst-98', 'Distribution Analyst - Specialty Pharma (Lifecycle Management)',
  'mid-level', 8, 3, 13,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Distribution Analyst'
LIMIT 1;

-- Persona 100: Lisa Wright - Distribution Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Wright', 'lisa-wright-distribution-analyst-99', 'Distribution Analyst - Large Pharma (Strategic Lead)',
  'mid-level', 7, 5, 9,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Distribution Analyst'
LIMIT 1;

-- Persona 101: Kevin Thompson - Trade Channel Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Thompson', 'kevin-thompson-trade-channel-manager-100', 'Trade Channel Manager - Mid-Size Pharma (Oncology Focus)',
  'senior', 14, 5, 15,
  'Mid-Size Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Channel Manager'
LIMIT 1;

-- Persona 102: Brian Young - Trade Channel Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Young', 'brian-young-trade-channel-manager-101', 'Trade Channel Manager - Biotech (Lifecycle Management)',
  'senior', 12, 3, 13,
  'Biotech', 7, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Channel Manager'
LIMIT 1;

-- Persona 103: Sarah Walker - Trade Channel Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Walker', 'sarah-walker-trade-channel-manager-102', 'Trade Channel Manager - Large Pharma (Lifecycle Management)',
  'senior', 12, 6, 14,
  'Large Pharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Channel Manager'
LIMIT 1;

-- Persona 104: Emily Allen - Trade Channel Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Emily Allen', 'emily-allen-trade-channel-manager-103', 'Trade Channel Manager - Biotech (Portfolio Lead)',
  'senior', 9, 3, 14,
  'Biotech', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Channel Manager'
LIMIT 1;

-- Persona 105: Jennifer Martinez - Outcomes Research Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jennifer Martinez', 'jennifer-martinez-outcomes-research-analyst-104', 'Outcomes Research Analyst - Biotech (Oncology Focus)',
  'mid-level', 10, 6, 14,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Outcomes Research Analyst'
LIMIT 1;

-- Persona 106: Andrew Taylor - Outcomes Research Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Taylor', 'andrew-taylor-outcomes-research-analyst-105', 'Outcomes Research Analyst - Specialty Pharma (Rare Disease)',
  'mid-level', 8, 3, 12,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Outcomes Research Analyst'
LIMIT 1;

-- Persona 107: Brian Martinez - Outcomes Research Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Martinez', 'brian-martinez-outcomes-research-analyst-106', 'Outcomes Research Analyst - Large Pharma (Oncology Focus)',
  'mid-level', 8, 3, 11,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Outcomes Research Analyst'
LIMIT 1;

-- Persona 108: Robert Hill - Outcomes Research Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Hill', 'robert-hill-outcomes-research-analyst-107', 'Outcomes Research Analyst - Large Pharma (Portfolio Lead)',
  'mid-level', 6, 2, 9,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Outcomes Research Analyst'
LIMIT 1;

-- Persona 109: Kevin Lee - RWE & Outcomes Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Lee', 'kevin-lee-rwe-outcomes-lead-108', 'RWE & Outcomes Lead - Large Pharma (Strategic Lead)',
  'senior', 14, 6, 16,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE & Outcomes Lead'
LIMIT 1;

-- Persona 110: Brian Anderson - RWE & Outcomes Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Anderson', 'brian-anderson-rwe-outcomes-lead-109', 'RWE & Outcomes Lead - Specialty Pharma (Launch Expert)',
  'senior', 9, 5, 10,
  'Specialty Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE & Outcomes Lead'
LIMIT 1;

-- Persona 111: Jennifer Anderson - RWE & Outcomes Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jennifer Anderson', 'jennifer-anderson-rwe-outcomes-lead-110', 'RWE & Outcomes Lead - Mid-Size Pharma (Operational Expert)',
  'senior', 13, 4, 18,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE & Outcomes Lead'
LIMIT 1;

-- Persona 112: Brian Lopez - RWE & Outcomes Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Brian Lopez', 'brian-lopez-rwe-outcomes-lead-111', 'RWE & Outcomes Lead - Large Pharma (Launch Expert)',
  'senior', 12, 2, 13,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE & Outcomes Lead'
LIMIT 1;

-- Persona 113: Rachel Lewis - Senior Value & Evidence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Rachel Lewis', 'rachel-lewis-senior-value-evidence-manager-112', 'Senior Value & Evidence Manager - Emerging Biopharma (Launch Expert)',
  'senior', 15, 5, 20,
  'Emerging Biopharma', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Value & Evidence Manager'
LIMIT 1;

-- Persona 114: Daniel Walker - Senior Value & Evidence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Walker', 'daniel-walker-senior-value-evidence-manager-113', 'Senior Value & Evidence Manager - Emerging Biopharma (Launch Expert)',
  'senior', 13, 2, 18,
  'Emerging Biopharma', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Value & Evidence Manager'
LIMIT 1;

-- Persona 115: Michelle Hall - Senior Value & Evidence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Hall', 'michelle-hall-senior-value-evidence-manager-114', 'Senior Value & Evidence Manager - Specialty Pharma (Operational Expert)',
  'senior', 12, 2, 16,
  'Specialty Pharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Value & Evidence Manager'
LIMIT 1;

-- Persona 116: Robert Clark - Senior Value & Evidence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Clark', 'robert-clark-senior-value-evidence-manager-115', 'Senior Value & Evidence Manager - Mid-Size Pharma (Lifecycle Management)',
  'senior', 10, 3, 13,
  'Mid-Size Pharma', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Value & Evidence Manager'
LIMIT 1;

-- Persona 117: Sarah Wilson - Value Evidence Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Wilson', 'sarah-wilson-value-evidence-specialist-116', 'Value Evidence Specialist - Large Pharma (Operational Expert)',
  'mid-level', 6, 2, 11,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Value Evidence Specialist'
LIMIT 1;

-- Persona 118: Christopher Hall - Value Evidence Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Christopher Hall', 'christopher-hall-value-evidence-specialist-117', 'Value Evidence Specialist - Emerging Biopharma (Rare Disease)',
  'mid-level', 5, 3, 10,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Value Evidence Specialist'
LIMIT 1;

-- Persona 119: Michelle Wilson - Value Evidence Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Wilson', 'michelle-wilson-value-evidence-specialist-118', 'Value Evidence Specialist - Mid-Size Pharma (Portfolio Lead)',
  'mid-level', 9, 4, 11,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Value Evidence Specialist'
LIMIT 1;

-- Persona 120: Andrew Lewis - Value Evidence Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Andrew Lewis', 'andrew-lewis-value-evidence-specialist-119', 'Value Evidence Specialist - Biotech (Strategic Lead)',
  'mid-level', 8, 2, 10,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Value Evidence Specialist'
LIMIT 1;

-- Persona 121: Michelle Rodriguez - Director HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle Rodriguez', 'michelle-rodriguez-director-heor-120', 'Director HEOR - Mid-Size Pharma (Launch Expert)',
  'director', 15, 5, 16,
  'Mid-Size Pharma', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director HEOR'
LIMIT 1;

-- Persona 122: Jessica Clark - Director HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jessica Clark', 'jessica-clark-director-heor-121', 'Director HEOR - Emerging Biopharma (Launch Expert)',
  'director', 13, 4, 18,
  'Emerging Biopharma', 2, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director HEOR'
LIMIT 1;

-- Persona 123: Daniel Walker - Director HEOR
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Walker', 'daniel-walker-director-heor-122', 'Director HEOR - Specialty Pharma (Launch Expert)',
  'director', 14, 2, 15,
  'Specialty Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Director HEOR'
LIMIT 1;

-- Persona 124: Matthew Clark - Pricing Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Matthew Clark', 'matthew-clark-pricing-lead-123', 'Pricing Lead - Large Pharma (Strategic Lead)',
  'senior', 9, 2, 12,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Lead'
LIMIT 1;

-- Persona 125: Michael King - Pricing Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael King', 'michael-king-pricing-lead-124', 'Pricing Lead - Large Pharma (Oncology Focus)',
  'senior', 12, 5, 16,
  'Large Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Lead'
LIMIT 1;

-- Persona 126: James Lopez - Pricing Lead
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'James Lopez', 'james-lopez-pricing-lead-125', 'Pricing Lead - Mid-Size Pharma (Launch Expert)',
  'senior', 8, 6, 11,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Lead'
LIMIT 1;

-- Persona 127: Lisa Clark - Policy Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Lisa Clark', 'lisa-clark-policy-analyst-126', 'Policy Analyst - Emerging Biopharma (Launch Expert)',
  'mid-level', 9, 4, 12,
  'Emerging Biopharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Policy Analyst'
LIMIT 1;

-- Persona 128: Sarah Wilson - Policy Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Wilson', 'sarah-wilson-policy-analyst-127', 'Policy Analyst - Biotech (Strategic Lead)',
  'mid-level', 5, 2, 7,
  'Biotech', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Policy Analyst'
LIMIT 1;

-- Persona 129: Kevin Rodriguez - MA Process Excellence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Kevin Rodriguez', 'kevin-rodriguez-ma-process-excellence-manager-128', 'MA Process Excellence Manager - Specialty Pharma (Portfolio Lead)',
  'senior', 12, 5, 14,
  'Specialty Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Process Excellence Manager'
LIMIT 1;

-- Persona 130: Michael Harris - MA Process Excellence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael Harris', 'michael-harris-ma-process-excellence-manager-129', 'MA Process Excellence Manager - Specialty Pharma (Lifecycle Management)',
  'senior', 15, 5, 18,
  'Specialty Pharma', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Process Excellence Manager'
LIMIT 1;

-- Persona 131: Emily Harris - MA Strategy & Planning Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Emily Harris', 'emily-harris-ma-strategy-planning-manager-130', 'MA Strategy & Planning Manager - Specialty Pharma (Oncology Focus)',
  'senior', 9, 4, 14,
  'Specialty Pharma', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Strategy & Planning Manager'
LIMIT 1;

-- Persona 132: Daniel Garcia - MA Strategy & Planning Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Garcia', 'daniel-garcia-ma-strategy-planning-manager-131', 'MA Strategy & Planning Manager - Mid-Size Pharma (Lifecycle Management)',
  'senior', 11, 6, 13,
  'Mid-Size Pharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Strategy & Planning Manager'
LIMIT 1;

-- Persona 133: Amanda Lopez - Reimbursement Support Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Lopez', 'amanda-lopez-reimbursement-support-manager-132', 'Reimbursement Support Manager - Mid-Size Pharma (Operational Expert)',
  'senior', 9, 4, 11,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Support Manager'
LIMIT 1;

-- Persona 134: Daniel Young - Reimbursement Support Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Daniel Young', 'daniel-young-reimbursement-support-manager-133', 'Reimbursement Support Manager - Emerging Biopharma (Launch Expert)',
  'senior', 14, 5, 15,
  'Emerging Biopharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Support Manager'
LIMIT 1;

-- Persona 135: Rachel Lewis - Pricing Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Rachel Lewis', 'rachel-lewis-pricing-manager-134', 'Pricing Manager - Biotech (Portfolio Lead)',
  'senior', 13, 4, 14,
  'Biotech', 11, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Manager'
LIMIT 1;

-- Persona 136: Michelle King - Pricing Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michelle King', 'michelle-king-pricing-manager-135', 'Pricing Manager - Emerging Biopharma (Lifecycle Management)',
  'senior', 14, 5, 17,
  'Emerging Biopharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Manager'
LIMIT 1;

-- Persona 137: Robert Hill - Market Access Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Robert Hill', 'robert-hill-market-access-manager-136', 'Market Access Manager - Large Pharma (Lifecycle Management)',
  'senior', 9, 4, 12,
  'Large Pharma', 1, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Manager'
LIMIT 1;

-- Persona 138: Christopher Anderson - Market Access Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Christopher Anderson', 'christopher-anderson-market-access-manager-137', 'Market Access Manager - Specialty Pharma (Launch Expert)',
  'senior', 11, 3, 16,
  'Specialty Pharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Market Access Manager'
LIMIT 1;

-- Persona 139: Amanda Rodriguez - Head of Government Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Rodriguez', 'amanda-rodriguez-head-of-government-affairs-138', 'Head of Government Affairs - Emerging Biopharma (Launch Expert)',
  'director', 19, 3, 22,
  'Emerging Biopharma', 17, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Government Affairs'
LIMIT 1;

-- Persona 140: Amanda Allen - MA Data Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Amanda Allen', 'amanda-allen-ma-data-analyst-139', 'MA Data Analyst - Mid-Size Pharma (Rare Disease)',
  'mid-level', 9, 5, 13,
  'Mid-Size Pharma', 0, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Data Analyst'
LIMIT 1;

-- Persona 141: Nicole Lewis - Payer Account Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Nicole Lewis', 'nicole-lewis-payer-account-manager-140', 'Payer Account Manager - Specialty Pharma (Operational Expert)',
  'senior', 15, 6, 20,
  'Specialty Pharma', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Account Manager'
LIMIT 1;

-- Persona 142: Jessica Hill - Senior Pricing Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Jessica Hill', 'jessica-hill-senior-pricing-manager-141', 'Senior Pricing Manager - Large Pharma (Rare Disease)',
  'senior', 9, 2, 13,
  'Large Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Pricing Manager'
LIMIT 1;

-- Persona 143: Michael Wilson - Head of Trade Relations
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Michael Wilson', 'michael-wilson-head-of-trade-relations-142', 'Head of Trade Relations - Mid-Size Pharma (Operational Expert)',
  'director', 18, 3, 21,
  'Mid-Size Pharma', 18, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Trade Relations'
LIMIT 1;


COMMIT;

-- Verification
SELECT COUNT(*) as total_market_access_personas
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3';

SELECT 
  r.name as role_name,
  COUNT(p.id) as persona_count
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
GROUP BY r.name
HAVING COUNT(p.id) < 4
ORDER BY persona_count, r.name;


-- Expected: 143 new personas generated
-- Target total: 136 + 143 = 279 Market Access personas
