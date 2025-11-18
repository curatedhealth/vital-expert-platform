-- Market Access Personas Import Script
-- Generated: 2025-11-17
-- Total personas: 157

BEGIN;

-- Persona 1: Dr. Alexandra Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Alexandra Thompson', 'dr-alexandra-thompson-cmao-large-pharma-global', 'Chief Market Access Officer - Large Pharma (Global)',
  'c-suite', 28, 9, 31,
  'large', '42-52', 'PhD', 'CEO', 150,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Chief Market Access Officer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 2: Dr. Richard Santos
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Richard Santos', 'dr-richard-santos-cmao-mid-pharma-us', 'Chief Market Access Officer - Mid-Size Pharma (US Focus)',
  'c-suite', 24, 8, 27,
  'large', '40-50', 'PhD', 'CEO', 60,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Chief Market Access Officer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 3: Dr. Jennifer Wu
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Wu', 'dr-jennifer-wu-cmao-specialty-rare-disease', 'Chief Market Access Officer - Specialty/Rare Disease',
  'c-suite', 22, 7, 25,
  'large', '39-49', 'PhD', 'CEO', 35,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Chief Market Access Officer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 4: Dr. Michael Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Rodriguez', 'dr-michael-rodriguez-cmao-emerging-markets', 'Chief Market Access Officer - Emerging Markets Focus',
  'c-suite', 20, 6, 23,
  'large', '38-48', 'PhD', 'CEO', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Chief Market Access Officer'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 5: Dr. Sarah Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Chen', 'dr-sarah-chen-vp-ma-global-strategy', 'VP Market Access - Global (Strategic)',
  'executive', 22, 7, 25,
  'large', '39-49', 'PhD', 'Senior', 80,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 6: Dr. James Peterson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. James Peterson', 'dr-james-peterson-vp-ma-global-operations', 'VP Market Access - Global (Operations)',
  'executive', 20, 6, 23,
  'large', '38-48', 'PhD', 'Senior', 75,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 7: Dr. Maria Gonzalez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Maria Gonzalez', 'dr-maria-gonzalez-vp-ma-global-commercial', 'VP Market Access - Global (Commercial)',
  'executive', 18, 6, 21,
  'large', '37-47', 'PhD', 'Senior', 65,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 8: Dr. David Kim
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Kim', 'dr-david-kim-vp-ma-global-regions', 'VP Market Access - Global (Regional Director)',
  'executive', 19, 6, 22,
  'large', '37-47', 'PhD', 'VP Market Access', 70,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 9: Dr. Laura Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Martinez', 'dr-laura-martinez-vp-ma-us-national', 'VP Market Access - US (National Accounts)',
  'executive', 20, 6, 23,
  'large', '38-48', 'PhD', 'Senior', 50,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 10: Dr. Robert Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Robert Wilson', 'dr-robert-wilson-vp-ma-us-specialty', 'VP Market Access - US (Specialty Pharma)',
  'executive', 18, 6, 21,
  'large', '37-47', 'PhD', 'Senior', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 11: Dr. Jennifer Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Davis', 'dr-jennifer-davis-vp-ma-us-launch', 'VP Market Access - US (Launch Leader)',
  'executive', 17, 5, 20,
  'large', '36-46', 'PhD', 'Senior', 35,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 12: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-vp-ma-us-portfolio', 'VP Market Access - US (Portfolio Management)',
  'executive', 16, 5, 19,
  'large', '36-46', 'PhD', 'Senior', 30,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VP Market Access - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 13: Dr. Robert Williams
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Robert Williams', 'dr-robert-williams-head-heor-global-large', 'Head of HEOR - Global (Large Pharma)',
  'director', 20, 6, 23,
  'large', '38-48', 'PhD', 'VP Market Access', 45,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 14: Dr. Patricia Anderson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Anderson', 'dr-patricia-anderson-head-heor-global-mid', 'Head of HEOR - Global (Mid-Size)',
  'director', 18, 6, 21,
  'large', '37-47', 'PhD', 'VP Market Access', 30,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 15: Dr. Thomas Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Thomas Brown', 'dr-thomas-brown-head-heor-global-specialty', 'Head of HEOR - Global (Specialty)',
  'director', 17, 5, 20,
  'large', '36-46', 'PhD', 'VP Market Access', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 16: Dr. Lisa White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Lisa White', 'dr-lisa-white-head-heor-global-emerging', 'Head of HEOR - Global (Emerging Markets)',
  'director', 15, 5, 18,
  'mid', '35-45', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 17: Dr. Kevin Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Kevin Martinez', 'dr-kevin-martinez-head-heor-global-transformation', 'Head of HEOR - Global (Digital Transformation)',
  'director', 16, 5, 19,
  'large', '36-46', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 18: Dr. Jennifer Taylor
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Taylor', 'dr-jennifer-taylor-head-heor-us-strategic', 'Head of HEOR - US (Strategic)',
  'director', 17, 5, 20,
  'large', '36-46', 'PhD', 'VP Market Access', 30,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 19: Dr. Michael Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Lee', 'dr-michael-lee-head-heor-us-operational', 'Head of HEOR - US (Operational)',
  'director', 15, 5, 18,
  'large', '35-45', 'PhD', 'VP Market Access', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 20: Dr. Amanda Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda Garcia', 'dr-amanda-garcia-head-heor-us-payer', 'Head of HEOR - US (Payer Relations)',
  'director', 14, 4, 17,
  'mid', '35-45', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 21: Dr. Christopher Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Davis', 'dr-christopher-davis-head-heor-us-launch', 'Head of HEOR - US (Launch Focus)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 22: Dr. Rebecca Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Rebecca Wilson', 'dr-rebecca-wilson-head-heor-eu-strategic', 'Head of HEOR - EU (Strategic)',
  'director', 16, 5, 19,
  'large', '36-46', 'PhD', 'VP Market Access', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 23: Dr. Daniel Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel Rodriguez', 'dr-daniel-rodriguez-head-heor-eu-operational', 'Head of HEOR - EU (Operational)',
  'director', 14, 4, 17,
  'mid', '35-45', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 24: Dr. Emily Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Martinez', 'dr-emily-martinez-head-heor-eu-hta', 'Head of HEOR - EU (HTA Focus)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 25: Dr. Brian Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Brian Thompson', 'dr-brian-thompson-head-heor-eu-apac', 'Head of HEOR - EU/APAC',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of HEOR - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 26: Dr. Michelle Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michelle Chen', 'dr-michelle-chen-heor-director-modeling-senior', 'HEOR Director - Modeling (Senior Expert)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - Modeling'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 27: Dr. Andrew Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Andrew Johnson', 'dr-andrew-johnson-heor-director-modeling-commercial', 'HEOR Director - Modeling (Commercial Focus)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - Modeling'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 28: Dr. Sarah Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Rodriguez', 'dr-sarah-rodriguez-heor-director-modeling-launch', 'HEOR Director - Modeling (Launch Support)',
  'director', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - Modeling'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 29: Dr. Jessica Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jessica Lee', 'dr-jessica-lee-heor-director-modeling-rwe', 'HEOR Director - Modeling (RWE Integration)',
  'mid-level', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - Modeling'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 30: Dr. Matthew Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Brown', 'dr-matthew-brown-heor-director-rwe-strategic', 'HEOR Director - RWE (Strategic)',
  'director', 11, 3, 14,
  'mid', '33-43', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 31: Dr. Laura Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Wilson', 'dr-laura-wilson-heor-director-rwe-operational', 'HEOR Director - RWE (Operational)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 9,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 32: Dr. Ryan Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Ryan Martinez', 'dr-ryan-martinez-heor-director-rwe-payer', 'HEOR Director - RWE (Payer Evidence)',
  'director', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 33: Dr. Catherine Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Catherine Lee', 'dr-catherine-lee-heor-director-rwe-launch', 'HEOR Director - RWE (Launch Evidence)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'HEOR Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 34: Dr. David Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Garcia', 'dr-david-garcia-senior-health-economist-cea-expert', 'Senior Health Economist - CEA (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - CEA'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 35: Dr. Emily Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Thompson', 'dr-emily-thompson-senior-health-economist-cea-mid', 'Senior Health Economist - CEA (Mid-Level)',
  'mid-level', 6, 2, 9,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - CEA'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 36: Dr. Michael Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Davis', 'dr-michael-davis-senior-health-economist-cea-junior', 'Senior Health Economist - CEA (Junior)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - CEA'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 37: Dr. Jennifer White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer White', 'dr-jennifer-white-senior-health-economist-bim-expert', 'Senior Health Economist - BIM (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - BIM'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 38: Dr. Christopher Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Rodriguez', 'dr-christopher-rodriguez-senior-health-economist-bim-mid', 'Senior Health Economist - BIM (Mid)',
  'mid-level', 6, 2, 9,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - BIM'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 39: Dr. Amanda Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda Martinez', 'dr-amanda-martinez-senior-health-economist-bim-junior', 'Senior Health Economist - BIM (Junior)',
  'junior', 3, 1, 6,
  'large', '29-39', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - BIM'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 40: Dr. Daniel Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel Wilson', 'dr-daniel-wilson-senior-health-economist-rwe-expert', 'Senior Health Economist - RWE (Expert)',
  'senior', 7, 2, 10,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 41: Dr. Lisa Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Lisa Garcia', 'dr-lisa-garcia-senior-health-economist-rwe-mid', 'Senior Health Economist - RWE (Mid)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Health Economist - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 42: Dr. Elizabeth Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Elizabeth Thompson', 'dr-elizabeth-thompson-head-veo-global-strategic', 'Head of VEO - Global (Strategic)',
  'director', 19, 6, 22,
  'large', '37-47', 'PhD', 'VP Market Access', 35,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of VEO - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 43: Dr. Richard Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Richard Martinez', 'dr-richard-martinez-head-veo-global-operational', 'Head of VEO - Global (Operational)',
  'director', 17, 5, 20,
  'large', '36-46', 'PhD', 'VP Market Access', 28,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of VEO - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 44: Dr. Jennifer Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Davis', 'dr-jennifer-davis-head-veo-global-commercial', 'Head of VEO - Global (Commercial)',
  'director', 15, 5, 18,
  'large', '35-45', 'PhD', 'VP Market Access', 22,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of VEO - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 45: Dr. Michael Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Rodriguez', 'dr-michael-rodriguez-head-veo-global-specialty', 'Head of VEO - Global (Specialty)',
  'director', 14, 4, 17,
  'mid', '35-45', 'PhD', 'VP Market Access', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of VEO - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 46: Dr. Sarah Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Wilson', 'dr-sarah-wilson-veo-director-value-senior', 'VEO Director - Value Strategy (Senior)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VEO Director - Value Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 47: Dr. David Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Brown', 'dr-david-brown-veo-director-value-mid', 'VEO Director - Value Strategy (Mid)',
  'director', 11, 3, 14,
  'mid', '33-43', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VEO Director - Value Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 48: Dr. Laura Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Garcia', 'dr-laura-garcia-veo-director-value-junior', 'VEO Director - Value Strategy (Junior)',
  'senior', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 9,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VEO Director - Value Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 49: Dr. Matthew Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Chen', 'dr-matthew-chen-veo-director-rwe-expert', 'VEO Director - RWE (Expert)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VEO Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 50: Dr. Rebecca Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Rebecca Lee', 'dr-rebecca-lee-veo-director-rwe-mid', 'VEO Director - RWE (Mid)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VEO Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 51: Dr. Christopher Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Martinez', 'dr-christopher-martinez-veo-director-rwe-junior', 'VEO Director - RWE (Junior)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'VEO Director - RWE'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 52: Dr. Amanda White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda White', 'dr-amanda-white-rwe-lead-design-expert', 'RWE Lead - Study Design (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE Lead - Study Design'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 53: Dr. Daniel Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel Thompson', 'dr-daniel-thompson-rwe-lead-design-mid', 'RWE Lead - Study Design (Mid)',
  'mid-level', 6, 2, 9,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE Lead - Study Design'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 54: Dr. Emily Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Rodriguez', 'dr-emily-rodriguez-rwe-lead-design-junior', 'RWE Lead - Study Design (Junior)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE Lead - Study Design'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 55: Dr. Brian Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Brian Johnson', 'dr-brian-johnson-rwe-lead-data-expert', 'RWE Lead - Data Analysis (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE Lead - Data Analysis'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 56: Dr. Michelle Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michelle Davis', 'dr-michelle-davis-rwe-lead-data-mid', 'RWE Lead - Data Analysis (Mid)',
  'mid-level', 6, 2, 9,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE Lead - Data Analysis'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 57: Dr. Andrew Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Andrew Wilson', 'dr-andrew-wilson-rwe-lead-data-junior', 'RWE Lead - Data Analysis (Junior)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'RWE Lead - Data Analysis'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 58: Dr. Sarah Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Martinez', 'dr-sarah-martinez-evidence-synthesis-expert', 'Evidence Synthesis Lead (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Evidence Synthesis Lead'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 59: Dr. Jessica Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jessica Brown', 'dr-jessica-brown-evidence-synthesis-mid', 'Evidence Synthesis Lead (Mid)',
  'mid-level', 6, 2, 9,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Evidence Synthesis Lead'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 60: Dr. Robert Anderson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Robert Anderson', 'dr-robert-anderson-head-pricing-global-strategic', 'Head of Pricing Strategy - Global (Strategic)',
  'director', 20, 6, 23,
  'large', '38-48', 'PhD', 'VP Market Access', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Pricing Strategy - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 61: Dr. Patricia Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Chen', 'dr-patricia-chen-head-pricing-global-operational', 'Head of Pricing Strategy - Global (Operational)',
  'director', 18, 6, 21,
  'large', '37-47', 'PhD', 'VP Market Access', 32,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Pricing Strategy - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 62: Dr. Michael Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Thompson', 'dr-michael-thompson-head-pricing-global-specialty', 'Head of Pricing Strategy - Global (Specialty)',
  'director', 16, 5, 19,
  'large', '36-46', 'PhD', 'VP Market Access', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Pricing Strategy - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 63: Dr. Jennifer Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Garcia', 'dr-jennifer-garcia-head-pricing-global-launch', 'Head of Pricing Strategy - Global (Launch Focus)',
  'director', 15, 5, 18,
  'large', '35-45', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Pricing Strategy - Global'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 64: Dr. David Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Martinez', 'dr-david-martinez-pricing-director-launch-senior', 'Pricing Director - Launch (Senior)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Launch'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 65: Dr. Sarah Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Lee', 'dr-sarah-lee-pricing-director-launch-mid', 'Pricing Director - Launch (Mid)',
  'director', 11, 3, 14,
  'mid', '33-43', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Launch'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 66: Dr. Christopher Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Wilson', 'dr-christopher-wilson-pricing-director-launch-junior', 'Pricing Director - Launch (Junior)',
  'senior', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 9,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Launch'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 67: Dr. Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Rodriguez', 'dr-laura-rodriguez-pricing-director-lifecycle-senior', 'Pricing Director - Lifecycle (Senior)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Lifecycle'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 68: Dr. Matthew Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Brown', 'dr-matthew-brown-pricing-director-lifecycle-mid', 'Pricing Director - Lifecycle (Mid)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Lifecycle'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 69: Dr. Emily Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Davis', 'dr-emily-davis-pricing-director-lifecycle-junior', 'Pricing Director - Lifecycle (Junior)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Lifecycle'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 70: Dr. Brian Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Brian Martinez', 'dr-brian-martinez-pricing-director-global-expert', 'Pricing Director - Global Markets (Expert)',
  'director', 14, 4, 17,
  'mid', '35-45', 'PhD', 'VP Market Access', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Global Markets'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 71: Dr. Rebecca Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Rebecca Thompson', 'dr-rebecca-thompson-pricing-director-global-mid', 'Pricing Director - Global Markets (Mid)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Global Markets'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 72: Dr. Daniel Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel Chen', 'dr-daniel-chen-pricing-director-global-junior', 'Pricing Director - Global Markets (Junior)',
  'senior', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Pricing Director - Global Markets'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 73: Dr. Amanda Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda Wilson', 'dr-amanda-wilson-reimbursement-director-us-expert', 'Reimbursement Director - US (Expert)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Director - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 74: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-reimbursement-director-us-mid', 'Reimbursement Director - US (Mid)',
  'director', 11, 3, 14,
  'mid', '33-43', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Director - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 75: Sarah Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Johnson', 'sarah-johnson-reimbursement-director-us-junior', 'Reimbursement Director - US (Junior)',
  'senior', 9, 3, 12,
  'mid', '32-42', 'MS/MBA', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Director - US'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 76: Dr. Michael Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Garcia', 'dr-michael-garcia-reimbursement-director-eu-expert', 'Reimbursement Director - EU (Expert)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Director - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 77: Dr. Jennifer Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Rodriguez', 'dr-jennifer-rodriguez-reimbursement-director-eu-mid', 'Reimbursement Director - EU (Mid)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Director - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 78: Dr. David White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David White', 'dr-david-white-reimbursement-director-eu-junior', 'Reimbursement Director - EU (Junior)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Director - EU'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 79: Dr. Lisa Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Lisa Martinez', 'dr-lisa-martinez-senior-pricing-manager-expert', 'Senior Pricing Manager - Strategy (Expert)',
  'senior', 9, 3, 12,
  'large', '32-42', 'PhD', 'Manager', 3,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Pricing Manager - Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 80: Dr. James Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. James Thompson', 'dr-james-thompson-senior-pricing-manager-mid', 'Senior Pricing Manager - Strategy (Mid)',
  'mid-level', 7, 2, 10,
  'large', '31-41', 'PhD', 'Manager', 2,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Pricing Manager - Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 81: Dr. Patricia Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Davis', 'dr-patricia-davis-senior-pricing-manager-junior', 'Senior Pricing Manager - Strategy (Junior)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'Manager', 1,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior Pricing Manager - Strategy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 82: Dr. Elizabeth Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Elizabeth Brown', 'dr-elizabeth-brown-head-payer-national-strategic', 'Head of Payer Relations - National (Strategic)',
  'director', 18, 6, 21,
  'large', '37-47', 'PhD', 'VP Market Access', 35,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Payer Relations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 83: Dr. Richard Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Richard Thompson', 'dr-richard-thompson-head-payer-national-operational', 'Head of Payer Relations - National (Operational)',
  'director', 16, 5, 19,
  'large', '36-46', 'PhD', 'VP Market Access', 30,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Payer Relations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 84: Dr. Michael Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Davis', 'dr-michael-davis-head-payer-national-launch', 'Head of Payer Relations - National (Launch)',
  'director', 14, 4, 17,
  'large', '35-45', 'PhD', 'VP Market Access', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Payer Relations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 85: Dr. Jennifer Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Wilson', 'dr-jennifer-wilson-head-payer-national-specialty', 'Head of Payer Relations - National (Specialty)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Payer Relations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 86: Dr. Sarah Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Martinez', 'dr-sarah-martinez-payer-director-accounts-senior', 'Payer Director - National Accounts (Senior)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Director - National Accounts'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 87: Dr. Christopher Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Garcia', 'dr-christopher-garcia-payer-director-accounts-mid', 'Payer Director - National Accounts (Mid)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Director - National Accounts'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 88: Dr. Laura Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Lee', 'dr-laura-lee-payer-director-accounts-junior', 'Payer Director - National Accounts (Junior)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 9,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Director - National Accounts'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 89: Dr. Matthew Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Rodriguez', 'dr-matthew-rodriguez-payer-director-regional-expert', 'Payer Director - Regional Plans (Expert)',
  'director', 11, 3, 14,
  'mid', '33-43', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Director - Regional Plans'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 90: Dr. Amanda Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda Chen', 'dr-amanda-chen-payer-director-regional-mid', 'Payer Director - Regional Plans (Mid)',
  'senior', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Director - Regional Plans'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 91: Dr. Daniel White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel White', 'dr-daniel-white-payer-director-regional-junior', 'Payer Director - Regional Plans (Junior)',
  'mid-level', 7, 2, 10,
  'large', '31-41', 'PhD', 'VP Market Access', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Payer Director - Regional Plans'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 92: Dr. Emily Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Johnson', 'dr-emily-johnson-contracting-director-specialty-expert', 'Contracting Director - Specialty Pharmacy (Expert)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Contracting Director - Specialty Pharmacy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 93: Dr. Brian Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Brian Thompson', 'dr-brian-thompson-contracting-director-specialty-mid', 'Contracting Director - Specialty Pharmacy (Mid)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Contracting Director - Specialty Pharmacy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 94: Dr. Rebecca Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Rebecca Martinez', 'dr-rebecca-martinez-contracting-director-specialty-junior', 'Contracting Director - Specialty Pharmacy (Junior)',
  'mid-level', 6, 2, 9,
  'large', '31-41', 'PhD', 'VP Market Access', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Contracting Director - Specialty Pharmacy'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 95: Dr. David Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Brown', 'dr-david-brown-regional-payer-director-ne-senior', 'Regional Payer Director - Northeast (Senior)',
  'director', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director - Northeast'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 96: Dr. Michelle Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michelle Davis', 'dr-michelle-davis-regional-payer-director-ne-mid', 'Regional Payer Director - Northeast (Mid)',
  'senior', 7, 2, 10,
  'mid', '31-41', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director - Northeast'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 97: Dr. Andrew Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Andrew Wilson', 'dr-andrew-wilson-regional-payer-director-ne-junior', 'Regional Payer Director - Northeast (Junior)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'VP Market Access', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director - Northeast'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 98: Dr. Sarah Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Garcia', 'dr-sarah-garcia-regional-payer-director-west-senior', 'Regional Payer Director - West (Senior)',
  'director', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 7,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director - West'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 99: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-regional-payer-director-west-mid', 'Regional Payer Director - West (Mid)',
  'senior', 6, 2, 9,
  'mid', '31-41', 'PhD', 'VP Market Access', 5,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director - West'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 100: Dr. Patricia Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Brown', 'dr-patricia-brown-regional-payer-director-west-junior', 'Regional Payer Director - West (Junior)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'VP Market Access', 3,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Regional Payer Director - West'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 101: Dr. Patricia Anderson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Anderson', 'dr-patricia-anderson-head-patient-access-national-large', 'Head of Patient Access - National (Large Pharma)',
  'director', 17, 5, 20,
  'large', '36-46', 'PhD', 'VP Market Access', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Patient Access - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 102: Dr. Michael Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Chen', 'dr-michael-chen-head-patient-access-national-mid', 'Head of Patient Access - National (Mid-Size)',
  'director', 15, 5, 18,
  'large', '35-45', 'PhD', 'VP Market Access', 30,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Patient Access - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 103: Dr. Jennifer Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Thompson', 'dr-jennifer-thompson-head-patient-access-national-specialty', 'Head of Patient Access - National (Specialty)',
  'director', 13, 4, 16,
  'large', '34-44', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Patient Access - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 104: Dr. David Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Martinez', 'dr-david-martinez-head-patient-access-national-rare', 'Head of Patient Access - National (Rare Disease)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Patient Access - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 105: Dr. Sarah Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Wilson', 'dr-sarah-wilson-patient-services-director-hub-expert', 'Patient Services Director - Hub Services (Expert)',
  'director', 10, 3, 13,
  'large', '33-43', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Services Director - Hub Services'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 106: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-patient-services-director-hub-mid', 'Patient Services Director - Hub Services (Mid)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Services Director - Hub Services'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 107: Dr. Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Rodriguez', 'dr-laura-rodriguez-patient-services-director-hub-junior', 'Patient Services Director - Hub Services (Junior)',
  'mid-level', 6, 2, 9,
  'mid', '31-41', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Services Director - Hub Services'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 108: Dr. Matthew Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Brown', 'dr-matthew-brown-patient-services-director-pap-expert', 'Patient Services Director - PAP (Expert)',
  'director', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Services Director - PAP'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 109: Dr. Emily Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Garcia', 'dr-emily-garcia-patient-services-director-pap-mid', 'Patient Services Director - PAP (Mid)',
  'senior', 7, 2, 10,
  'mid', '31-41', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Services Director - PAP'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 110: Dr. Brian Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Brian Davis', 'dr-brian-davis-patient-services-director-pap-junior', 'Patient Services Director - PAP (Junior)',
  'mid-level', 5, 1, 8,
  'mid', '30-40', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Patient Services Director - PAP'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 111: Sarah Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Sarah Thompson', 'sarah-thompson-hub-services-manager-operations-senior', 'Hub Services Manager - Operations (Senior)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'MS/MBA', 'Manager', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Hub Services Manager - Operations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 112: John Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'John Wilson', 'john-wilson-hub-services-manager-operations-mid', 'Hub Services Manager - Operations (Mid)',
  'mid-level', 6, 2, 9,
  'mid', '31-41', 'MS/MBA', 'Manager', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Hub Services Manager - Operations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 113: Dr. Rebecca Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Rebecca Martinez', 'dr-rebecca-martinez-hub-services-manager-operations-junior', 'Hub Services Manager - Operations (Junior)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Manager', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Hub Services Manager - Operations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 114: Dr. Daniel Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel Chen', 'dr-daniel-chen-hub-services-manager-benefits-senior', 'Hub Services Manager - Benefits Verification (Senior)',
  'senior', 7, 2, 10,
  'mid', '31-41', 'PhD', 'Manager', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Hub Services Manager - Benefits Verification'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 115: Dr. Amanda White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda White', 'dr-amanda-white-hub-services-manager-benefits-mid', 'Hub Services Manager - Benefits Verification (Mid)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'Manager', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Hub Services Manager - Benefits Verification'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 116: Dr. Michael Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Lee', 'dr-michael-lee-reimbursement-support-manager-appeals-senior', 'Reimbursement Support Manager - Appeals (Senior)',
  'senior', 6, 2, 9,
  'large', '31-41', 'PhD', 'Manager', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Support Manager - Appeals'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 117: Dr. Jennifer Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Rodriguez', 'dr-jennifer-rodriguez-reimbursement-support-manager-appeals-mid', 'Reimbursement Support Manager - Appeals (Mid)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Manager', 3,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Reimbursement Support Manager - Appeals'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 118: Dr. Elizabeth Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Elizabeth Davis', 'dr-elizabeth-davis-head-government-affairs-large', 'Head of Government Affairs - National (Large Pharma)',
  'director', 20, 6, 23,
  'large', '38-48', 'PhD', 'VP Market Access', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Government Affairs - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 119: Dr. Richard Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Richard Wilson', 'dr-richard-wilson-head-government-affairs-mid', 'Head of Government Affairs - National (Mid-Size)',
  'director', 16, 5, 19,
  'mid', '36-46', 'PhD', 'VP Market Access', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Government Affairs - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 120: Dr. Michael Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Martinez', 'dr-michael-martinez-head-government-affairs-specialty', 'Head of Government Affairs - National (Specialty)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Government Affairs - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 121: Dr. Jennifer Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Thompson', 'dr-jennifer-thompson-government-affairs-director-federal-expert', 'Government Affairs Director - Federal (Expert)',
  'director', 14, 4, 17,
  'mid', '35-45', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Director - Federal'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 122: Dr. Sarah Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Garcia', 'dr-sarah-garcia-government-affairs-director-federal-mid', 'Government Affairs Director - Federal (Mid)',
  'senior', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Director - Federal'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 123: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-government-affairs-director-state-expert', 'Government Affairs Director - State (Expert)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Director - State'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 124: Dr. Patricia Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Brown', 'dr-patricia-brown-government-affairs-director-state-mid', 'Government Affairs Director - State (Mid)',
  'senior', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 7,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Government Affairs Director - State'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 125: Dr. Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Rodriguez', 'dr-laura-rodriguez-medicare-medicaid-director-expert', 'Medicare & Medicaid Director (Expert)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Medicare & Medicaid Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 126: Dr. Matthew Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Chen', 'dr-matthew-chen-medicare-medicaid-director-mid', 'Medicare & Medicaid Director (Mid)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 5,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Medicare & Medicaid Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 127: Dr. Robert Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Robert Thompson', 'dr-robert-thompson-head-trade-distribution-large', 'Head of Trade & Distribution - National (Large Pharma)',
  'director', 18, 6, 21,
  'large', '37-47', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Trade & Distribution - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 128: Dr. Patricia Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Martinez', 'dr-patricia-martinez-head-trade-distribution-mid', 'Head of Trade & Distribution - National (Mid-Size)',
  'director', 14, 4, 17,
  'mid', '35-45', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Trade & Distribution - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 129: Dr. Michael Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Davis', 'dr-michael-davis-head-trade-distribution-specialty', 'Head of Trade & Distribution - National (Specialty)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of Trade & Distribution - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 130: Dr. Jennifer Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Wilson', 'dr-jennifer-wilson-trade-director-gpo-expert', 'Trade Director - GPO Relations (Expert)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Director - GPO Relations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 131: Dr. David Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Garcia', 'dr-david-garcia-trade-director-gpo-mid', 'Trade Director - GPO Relations (Mid)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'VP Market Access', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Director - GPO Relations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 132: Dr. Sarah Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Lee', 'dr-sarah-lee-trade-director-idn-expert', 'Trade Director - IDN Relations (Expert)',
  'director', 11, 3, 14,
  'mid', '33-43', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Director - IDN Relations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 133: Dr. Christopher Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Rodriguez', 'dr-christopher-rodriguez-trade-director-idn-mid', 'Trade Director - IDN Relations (Mid)',
  'senior', 7, 2, 10,
  'large', '31-41', 'PhD', 'VP Market Access', 4,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Trade Director - IDN Relations'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 134: Dr. Elizabeth Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Elizabeth Martinez', 'dr-elizabeth-martinez-head-ma-analytics-large', 'Head of MA Analytics - National (Large Pharma)',
  'director', 16, 5, 19,
  'mid', '36-46', 'PhD', 'VP Market Access', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Analytics - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 135: Dr. Richard Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Richard Brown', 'dr-richard-brown-head-ma-analytics-mid', 'Head of MA Analytics - National (Mid-Size)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Analytics - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 136: Dr. Michael Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Thompson', 'dr-michael-thompson-head-ma-analytics-specialty', 'Head of MA Analytics - National (Specialty)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Analytics - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 137: Dr. Jennifer Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Wilson', 'dr-jennifer-wilson-head-ma-analytics-launch', 'Head of MA Analytics - National (Launch Focus)',
  'director', 9, 3, 12,
  'mid', '32-42', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Analytics - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 138: Dr. David Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Garcia', 'dr-david-garcia-senior-ma-analyst-payer-intel-expert', 'Senior MA Analyst - Payer Intelligence (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior MA Analyst - Payer Intelligence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 139: Dr. Sarah Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Rodriguez', 'dr-sarah-rodriguez-senior-ma-analyst-payer-intel-mid', 'Senior MA Analyst - Payer Intelligence (Mid)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior MA Analyst - Payer Intelligence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 140: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-senior-ma-analyst-payer-intel-junior', 'Senior MA Analyst - Payer Intelligence (Junior)',
  'junior', 3, 1, 6,
  'large', '29-39', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior MA Analyst - Payer Intelligence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 141: Dr. Laura Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Martinez', 'dr-laura-martinez-senior-ma-analyst-forecasting-expert', 'Senior MA Analyst - Forecasting (Expert)',
  'senior', 7, 2, 10,
  'large', '31-41', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior MA Analyst - Forecasting'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 142: Dr. Matthew Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Matthew Chen', 'dr-matthew-chen-senior-ma-analyst-forecasting-mid', 'Senior MA Analyst - Forecasting (Mid)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior MA Analyst - Forecasting'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 143: Dr. Amanda White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Amanda White', 'dr-amanda-white-senior-ma-analyst-forecasting-junior', 'Senior MA Analyst - Forecasting (Junior)',
  'junior', 2, 1, 5,
  'large', '29-39', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Senior MA Analyst - Forecasting'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 144: Dr. Michael Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Lee', 'dr-michael-lee-ma-analyst-competitive-senior', 'MA Analyst - Competitive Intelligence (Senior)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Analyst - Competitive Intelligence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 145: Dr. Jennifer Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Rodriguez', 'dr-jennifer-rodriguez-ma-analyst-competitive-junior', 'MA Analyst - Competitive Intelligence (Junior)',
  'junior', 2, 1, 5,
  'large', '29-39', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Analyst - Competitive Intelligence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 146: Dr. Robert Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Robert Wilson', 'dr-robert-wilson-head-ma-operations-large', 'Head of MA Operations - National (Large Pharma)',
  'director', 17, 5, 20,
  'mid', '36-46', 'PhD', 'VP Market Access', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Operations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 147: Dr. Patricia Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Patricia Garcia', 'dr-patricia-garcia-head-ma-operations-mid', 'Head of MA Operations - National (Mid-Size)',
  'director', 13, 4, 16,
  'mid', '34-44', 'PhD', 'VP Market Access', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Operations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 148: Dr. Michael Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Michael Martinez', 'dr-michael-martinez-head-ma-operations-specialty', 'Head of MA Operations - National (Specialty)',
  'director', 10, 3, 13,
  'mid', '33-43', 'PhD', 'VP Market Access', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'Head of MA Operations - National'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 149: Dr. Jennifer Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Jennifer Lee', 'dr-jennifer-lee-ma-operations-director-excellence-expert', 'MA Operations Director - Excellence (Expert)',
  'director', 12, 4, 15,
  'mid', '34-44', 'PhD', 'VP Market Access', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Operations Director - Excellence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 150: Dr. David Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. David Thompson', 'dr-david-thompson-ma-operations-director-excellence-mid', 'MA Operations Director - Excellence (Mid)',
  'senior', 8, 2, 11,
  'mid', '32-42', 'PhD', 'VP Market Access', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Operations Director - Excellence'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 151: Dr. Sarah Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Sarah Rodriguez', 'dr-sarah-rodriguez-ma-strategy-manager-senior', 'MA Strategy Manager (Senior)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Manager', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Strategy Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 152: Dr. Christopher Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Christopher Chen', 'dr-christopher-chen-ma-strategy-manager-junior', 'MA Strategy Manager (Junior)',
  'mid-level', 4, 1, 7,
  'large', '30-40', 'PhD', 'Manager', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Strategy Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 153: Dr. Laura Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Laura Brown', 'dr-laura-brown-ma-process-improvement-expert', 'MA Process Improvement Manager (Expert)',
  'senior', 8, 2, 11,
  'large', '32-42', 'PhD', 'Manager', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Process Improvement Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 154: Dr. James Anderson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. James Anderson', 'dr-james-anderson-ma-process-improvement-junior', 'MA Process Improvement Manager (Junior)',
  'mid-level', 3, 1, 6,
  'large', '29-39', 'PhD', 'Manager', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Process Improvement Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 155: Dr. Emily Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Emily Davis', 'dr-emily-davis-ma-project-manager-senior', 'MA Project Manager (Senior)',
  'senior', 6, 2, 9,
  'large', '31-41', 'PhD', 'Manager', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Project Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 156: Dr. Daniel White
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Daniel White', 'dr-daniel-white-ma-project-manager-junior', 'MA Project Manager (Junior)',
  'junior', 2, 1, 5,
  'large', '29-39', 'PhD', 'Manager', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Project Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();

-- Persona 157: Dr. Lisa Taylor
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '4087be09-38e0-4c84-81e6-f79dd38151d3'::uuid,
  'Dr. Lisa Taylor', 'dr-lisa-taylor-ma-business-analyst-mid', 'MA Business Analyst (Mid)',
  'mid-level', 5, 1, 8,
  'large', '30-40', 'PhD', 'Senior', 0,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
  AND r.name = 'MA Business Analyst'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  seniority_level = EXCLUDED.seniority_level,
  years_of_experience = EXCLUDED.years_of_experience,
  updated_at = NOW();


COMMIT;

-- Verification
SELECT d.name as department, COUNT(*) as persona_count
FROM personas p
JOIN org_roles r ON p.role_id = r.id
JOIN org_departments d ON r.department_id = d.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3'
GROUP BY d.name
ORDER BY d.name;

SELECT COUNT(*) as total_market_access_personas
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3';

