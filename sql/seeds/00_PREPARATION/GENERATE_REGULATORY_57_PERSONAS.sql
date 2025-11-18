-- ==========================================
-- GENERATE 57 MISSING REGULATORY AFFAIRS PERSONAS
-- Target: 4 personas per role (176 total)
-- Current: 119 personas
-- Adding: 57 personas
-- ==========================================
-- Tenant: f7aa6fd4-0af9-4706-8b31-034f1f7accda
-- Function: 43382f04-a819-4839-88c1-c1054d5ae071 (Regulatory Affairs)
-- Date: 2025-11-17
--

BEGIN;

-- Persona 1: James Martinez - Regulatory Affairs Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'James Martinez', 'james-martinez-regulatory-affairs-director-1', 'Regulatory Affairs Director - Biotech (Operational Expert)',
  'director', 17, 3, 16,
  'Biotech', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 2: Kimberly Jackson - Regulatory Affairs Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Kimberly Jackson', 'kimberly-jackson-regulatory-affairs-director-2', 'Regulatory Affairs Director - Emerging Biopharma (Rare Disease)',
  'director', 17, 5, 19,
  'Emerging Biopharma', 12, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 3: Matthew Jones - Regulatory Affairs Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Matthew Jones', 'matthew-jones-regulatory-affairs-director-3', 'Regulatory Affairs Director - Large Pharma (Rare Disease)',
  'director', 15, 6, 20,
  'Large Pharma', 19, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 4: James Lee - Regulatory Affairs Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'James Lee', 'james-lee-regulatory-affairs-director-4', 'Regulatory Affairs Director - Emerging Biopharma (Launch Expert)',
  'director', 16, 6, 18,
  'Emerging Biopharma', 20, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 5: Michael Taylor - Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Taylor', 'michael-taylor-regulatory-affairs-manager-5', 'Regulatory Affairs Manager - Biotech (APAC Market)',
  'manager', 7, 4, 11,
  'Biotech', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 6: Kevin Smith - Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Kevin Smith', 'kevin-smith-regulatory-affairs-manager-6', 'Regulatory Affairs Manager - Mid-Size Pharma (Rare Disease)',
  'manager', 10, 5, 14,
  'Mid-Size Pharma', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 7: Michael Robinson - Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Robinson', 'michael-robinson-regulatory-affairs-manager-7', 'Regulatory Affairs Manager - Large Pharma (Operational Expert)',
  'manager', 9, 5, 15,
  'Large Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 8: Jessica Robinson - Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jessica Robinson', 'jessica-robinson-regulatory-affairs-manager-8', 'Regulatory Affairs Manager - Specialty Pharma (EU Market)',
  'manager', 8, 2, 10,
  'Specialty Pharma', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 9: Rebecca Hernandez - Regulatory Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Rebecca Hernandez', 'rebecca-hernandez-regulatory-affairs-specialist-9', 'Regulatory Affairs Specialist - Emerging Biopharma (Lifecycle Management)',
  'associate', 6, 2, 10,
  'Emerging Biopharma', 2, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 10: Christopher Martinez - Regulatory Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Martinez', 'christopher-martinez-regulatory-affairs-specialist-10', 'Regulatory Affairs Specialist - Large Pharma (Portfolio Lead)',
  'associate', 6, 3, 6,
  'Large Pharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 11: Jennifer Thompson - Regulatory Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Thompson', 'jennifer-thompson-regulatory-affairs-specialist-11', 'Regulatory Affairs Specialist - Large Pharma (Strategic Lead)',
  'associate', 6, 2, 7,
  'Large Pharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 12: Brian Lewis - Regulatory Affairs Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Brian Lewis', 'brian-lewis-regulatory-affairs-specialist-12', 'Regulatory Affairs Specialist - Emerging Biopharma (APAC Market)',
  'associate', 5, 2, 6,
  'Emerging Biopharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Affairs Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 13: Emily Davis - Regulatory Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Emily Davis', 'emily-davis-regulatory-associate-13', 'Regulatory Associate - Specialty Pharma (LatAm Market)',
  'associate', 7, 3, 10,
  'Specialty Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Associate'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 14: Jennifer Davis - Regulatory Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Davis', 'jennifer-davis-regulatory-associate-14', 'Regulatory Associate - Specialty Pharma (Strategic Lead)',
  'associate', 4, 1, 7,
  'Specialty Pharma', 7, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Associate'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 15: Mark Anderson - Regulatory Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Mark Anderson', 'mark-anderson-regulatory-associate-15', 'Regulatory Associate - Specialty Pharma (APAC Market)',
  'associate', 3, 1, 4,
  'Specialty Pharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Associate'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 16: Robert Taylor - Regulatory Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Robert Taylor', 'robert-taylor-regulatory-associate-16', 'Regulatory Associate - Biotech (Strategic Lead)',
  'associate', 3, 2, 9,
  'Biotech', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Associate'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 17: Kimberly Anderson - Senior Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Kimberly Anderson', 'kimberly-anderson-senior-regulatory-affairs-manager-17', 'Senior Regulatory Affairs Manager - Mid-Size Pharma (Portfolio Lead)',
  'senior_manager', 12, 3, 11,
  'Mid-Size Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 18: David Williams - Senior Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Williams', 'david-williams-senior-regulatory-affairs-manager-18', 'Senior Regulatory Affairs Manager - Biotech (Oncology Focus)',
  'senior_manager', 8, 4, 14,
  'Biotech', 9, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 19: Elizabeth Martin - Senior Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Elizabeth Martin', 'elizabeth-martin-senior-regulatory-affairs-manager-19', 'Senior Regulatory Affairs Manager - Biotech (Operational Expert)',
  'senior_manager', 13, 5, 8,
  'Biotech', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 20: Rebecca Lewis - Senior Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Rebecca Lewis', 'rebecca-lewis-senior-regulatory-affairs-manager-20', 'Senior Regulatory Affairs Manager - Emerging Biopharma (APAC Market)',
  'senior_manager', 7, 5, 14,
  'Emerging Biopharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 21: Nicole Martinez - VP of Regulatory Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Nicole Martinez', 'nicole-martinez-vp-of-regulatory-affairs-21', 'VP of Regulatory Affairs - Biotech (Oncology Focus)',
  'vp', 15, 7, 24,
  'Biotech', 36, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP of Regulatory Affairs'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 22: Rachel Brown - VP of Regulatory Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Rachel Brown', 'rachel-brown-vp-of-regulatory-affairs-22', 'VP of Regulatory Affairs - Biotech (LatAm Market)',
  'vp', 20, 6, 18,
  'Biotech', 37, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP of Regulatory Affairs'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 23: Laura Gonzalez - VP of Regulatory Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Gonzalez', 'laura-gonzalez-vp-of-regulatory-affairs-23', 'VP of Regulatory Affairs - Biotech (Oncology Focus)',
  'vp', 21, 8, 19,
  'Biotech', 24, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP of Regulatory Affairs'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 24: Melissa Anderson - APAC Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Melissa Anderson', 'melissa-anderson-apac-regulatory-affairs-manager-24', 'APAC Regulatory Affairs Manager - Emerging Biopharma (Launch Expert)',
  'manager', 9, 3, 8,
  'Emerging Biopharma', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'APAC Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 25: Rebecca Brown - Chief Regulatory Officer
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Rebecca Brown', 'rebecca-brown-chief-regulatory-officer-25', 'Chief Regulatory Officer - Biotech (Launch Expert)',
  'vp', 21, 7, 19,
  'Biotech', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Chief Regulatory Officer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 26: Laura Anderson - CMC Regulatory Associate
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Anderson', 'laura-anderson-cmc-regulatory-associate-26', 'CMC Regulatory Associate - Biotech (Rare Disease)',
  'associate', 5, 2, 7,
  'Biotech', 4, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Associate'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 27: Robert Miller - CMC Regulatory Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Robert Miller', 'robert-miller-cmc-regulatory-manager-27', 'CMC Regulatory Manager - Specialty Pharma (Strategic Lead)',
  'manager', 9, 3, 9,
  'Specialty Pharma', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 28: David Taylor - CMC Regulatory Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Taylor', 'david-taylor-cmc-regulatory-specialist-28', 'CMC Regulatory Specialist - Emerging Biopharma (Launch Expert)',
  'associate', 7, 3, 7,
  'Emerging Biopharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 29: Brian White - CMC Technical Writer
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Brian White', 'brian-white-cmc-technical-writer-29', 'CMC Technical Writer - Biotech (APAC Market)',
  'manager', 9, 2, 8,
  'Biotech', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Technical Writer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 30: Andrew Miller - EU Regulatory Affairs Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Andrew Miller', 'andrew-miller-eu-regulatory-affairs-director-30', 'EU Regulatory Affairs Director - Specialty Pharma (Global Filings)',
  'director', 18, 4, 14,
  'Specialty Pharma', 22, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'EU Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 31: Matthew Lee - Head of EU Regulatory Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Matthew Lee', 'matthew-lee-head-of-eu-regulatory-affairs-31', 'Head of EU Regulatory Affairs - Mid-Size Pharma (CMC Specialist)',
  'senior_director', 19, 7, 20,
  'Mid-Size Pharma', 27, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Head of EU Regulatory Affairs'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 32: Thomas Wilson - Head of Regulatory Operations
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Thomas Wilson', 'thomas-wilson-head-of-regulatory-operations-32', 'Head of Regulatory Operations - Biotech (LatAm Market)',
  'senior_director', 20, 4, 19,
  'Biotech', 27, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Head of Regulatory Operations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 33: James Lopez - Head of US Regulatory Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'James Lopez', 'james-lopez-head-of-us-regulatory-affairs-33', 'Head of US Regulatory Affairs - Large Pharma (EU Market)',
  'senior_director', 22, 4, 24,
  'Large Pharma', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Head of US Regulatory Affairs'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 34: Kevin Thompson - LatAm Regulatory Affairs Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Kevin Thompson', 'kevin-thompson-latam-regulatory-affairs-manager-34', 'LatAm Regulatory Affairs Manager - Large Pharma (Rare Disease)',
  'manager', 8, 5, 8,
  'Large Pharma', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'LatAm Regulatory Affairs Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 35: Mark Jackson - Regulatory Compliance Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Mark Jackson', 'mark-jackson-regulatory-compliance-director-35', 'Regulatory Compliance Director - Biotech (Launch Expert)',
  'director', 11, 7, 22,
  'Biotech', 16, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Compliance Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 36: Thomas Robinson - Regulatory Compliance Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Thomas Robinson', 'thomas-robinson-regulatory-compliance-manager-36', 'Regulatory Compliance Manager - Large Pharma (Global Filings)',
  'manager', 13, 3, 12,
  'Large Pharma', 14, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Compliance Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 37: Sarah Williams - Regulatory Coordinator
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Williams', 'sarah-williams-regulatory-coordinator-37', 'Regulatory Coordinator - Biotech (Launch Expert)',
  'associate', 5, 2, 6,
  'Biotech', 2, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Coordinator'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 38: Laura Wilson - Regulatory Document Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Wilson', 'laura-wilson-regulatory-document-specialist-38', 'Regulatory Document Specialist - Emerging Biopharma (CMC Specialist)',
  'associate', 3, 1, 7,
  'Emerging Biopharma', 3, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Document Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 39: James Harris - Regulatory Intelligence Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'James Harris', 'james-harris-regulatory-intelligence-director-39', 'Regulatory Intelligence Director - Biotech (Lifecycle Management)',
  'director', 11, 5, 17,
  'Biotech', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Intelligence Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 40: Robert Robinson - Regulatory Intelligence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Robert Robinson', 'robert-robinson-regulatory-intelligence-manager-40', 'Regulatory Intelligence Manager - Emerging Biopharma (Portfolio Lead)',
  'manager', 9, 5, 18,
  'Emerging Biopharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Intelligence Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 41: Joseph Jones - Regulatory Intelligence Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Joseph Jones', 'joseph-jones-regulatory-intelligence-specialist-41', 'Regulatory Intelligence Specialist - Specialty Pharma (Rare Disease)',
  'associate', 5, 1, 7,
  'Specialty Pharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Intelligence Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 42: Sarah Walker - Regulatory Labeling Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Walker', 'sarah-walker-regulatory-labeling-manager-42', 'Regulatory Labeling Manager - Biotech (Portfolio Lead)',
  'manager', 10, 4, 18,
  'Biotech', 13, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Labeling Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 43: David Hernandez - Regulatory Labeling Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Hernandez', 'david-hernandez-regulatory-labeling-specialist-43', 'Regulatory Labeling Specialist - Mid-Size Pharma (Oncology Focus)',
  'associate', 7, 3, 5,
  'Mid-Size Pharma', 8, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Labeling Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 44: Laura Martin - Regulatory Policy Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Martin', 'laura-martin-regulatory-policy-analyst-44', 'Regulatory Policy Analyst - Large Pharma (CMC Specialist)',
  'manager', 11, 2, 9,
  'Large Pharma', 5, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Policy Analyst'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 45: Brian Anderson - Regulatory Publishing Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Brian Anderson', 'brian-anderson-regulatory-publishing-manager-45', 'Regulatory Publishing Manager - Large Pharma (EU Market)',
  'manager', 9, 5, 14,
  'Large Pharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Publishing Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 46: Christopher Wilson - Regulatory Submissions Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Wilson', 'christopher-wilson-regulatory-submissions-manager-46', 'Regulatory Submissions Manager - Large Pharma (CMC Specialist)',
  'manager', 13, 3, 13,
  'Large Pharma', 12, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Submissions Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 47: Melissa Brown - Regulatory Systems Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Melissa Brown', 'melissa-brown-regulatory-systems-manager-47', 'Regulatory Systems Manager - Large Pharma (APAC Market)',
  'manager', 11, 3, 14,
  'Large Pharma', 7, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Systems Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 48: Lisa Jackson - Regulatory Systems Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Lisa Jackson', 'lisa-jackson-regulatory-systems-specialist-48', 'Regulatory Systems Specialist - Biotech (CMC Specialist)',
  'associate', 5, 1, 5,
  'Biotech', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Systems Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 49: William Young - Regulatory Writer
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'William Young', 'william-young-regulatory-writer-49', 'Regulatory Writer - Biotech (Operational Expert)',
  'manager', 9, 5, 18,
  'Biotech', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Writer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 50: Christopher Smith - Senior CMC Regulatory Specialist
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Smith', 'christopher-smith-senior-cmc-regulatory-specialist-50', 'Senior CMC Regulatory Specialist - Mid-Size Pharma (Portfolio Lead)',
  'senior_manager', 13, 2, 11,
  'Mid-Size Pharma', 15, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior CMC Regulatory Specialist'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 51: Rachel Lewis - Senior Regulatory Intelligence Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Rachel Lewis', 'rachel-lewis-senior-regulatory-intelligence-manager-51', 'Senior Regulatory Intelligence Manager - Large Pharma (LatAm Market)',
  'senior_manager', 11, 4, 17,
  'Large Pharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Intelligence Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 52: Nicole Martin - Senior Regulatory Policy Analyst
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Nicole Martin', 'nicole-martin-senior-regulatory-policy-analyst-52', 'Senior Regulatory Policy Analyst - Specialty Pharma (Operational Expert)',
  'senior_manager', 9, 2, 13,
  'Specialty Pharma', 13, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Policy Analyst'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 53: Daniel Jackson - Senior Regulatory Submissions Manager
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Daniel Jackson', 'daniel-jackson-senior-regulatory-submissions-manager-53', 'Senior Regulatory Submissions Manager - Mid-Size Pharma (EU Market)',
  'senior_manager', 12, 3, 14,
  'Mid-Size Pharma', 6, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Submissions Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 54: Stephanie Jones - Senior Regulatory Writer
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Stephanie Jones', 'stephanie-jones-senior-regulatory-writer-54', 'Senior Regulatory Writer - Large Pharma (US Market)',
  'senior_manager', 11, 2, 17,
  'Large Pharma', 13, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior Regulatory Writer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 55: Rachel Robinson - SVP Regulatory Affairs
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Rachel Robinson', 'rachel-robinson-svp-regulatory-affairs-55', 'SVP Regulatory Affairs - Large Pharma (CMC Specialist)',
  'vp', 15, 7, 18,
  'Large Pharma', 21, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'SVP Regulatory Affairs'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 56: Laura Smith - US Regulatory Affairs Director
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Smith', 'laura-smith-us-regulatory-affairs-director-56', 'US Regulatory Affairs Director - Biotech (Oncology Focus)',
  'director', 10, 4, 17,
  'Biotech', 10, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'US Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 57: Melissa Gonzalez - VP Regulatory Strategy
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, team_size, work_style,
  role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Melissa Gonzalez', 'melissa-gonzalez-vp-regulatory-strategy-57', 'VP Regulatory Strategy - Mid-Size Pharma (Global Filings)',
  'vp', 17, 6, 18,
  'Mid-Size Pharma', 30, 'hybrid',
  r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP Regulatory Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

COMMIT;

-- Total personas generated: 57


-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check total Regulatory Affairs personas
SELECT COUNT(*) as total_personas
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = '43382f04-a819-4839-88c1-c1054d5ae071';

-- Check average personas per role
WITH role_counts AS (
  SELECT r.id, r.name, COUNT(p.id) as persona_count
  FROM org_roles r
  LEFT JOIN personas p ON p.role_id = r.id
  WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  GROUP BY r.id, r.name
)
SELECT
  COUNT(*) as total_roles,
  SUM(persona_count) as total_personas,
  ROUND(AVG(persona_count), 2) as avg_per_role,
  MIN(persona_count) as min_per_role,
  MAX(persona_count) as max_per_role
FROM role_counts;

-- Check roles with < 4 personas (should be 0)
SELECT
  r.name as role_name,
  COUNT(p.id) as persona_count
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
GROUP BY r.id, r.name
HAVING COUNT(p.id) < 4
ORDER BY persona_count, r.name;

-- END OF SCRIPT
