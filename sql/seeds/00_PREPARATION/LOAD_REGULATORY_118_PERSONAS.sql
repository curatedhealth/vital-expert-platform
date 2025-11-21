-- Regulatory Affairs Personas Import Script
-- Generated: 2025-11-17
-- Total personas: 118

BEGIN;

-- Persona 1: Dr. Patricia Anderson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Patricia Anderson', 'dr-patricia-anderson-cro-large-pharma-global', 'Chief Regulatory Officer - Large Pharma (Global)',
  'c-suite', 25, 8, 28,
  'large', '44-54', 'PhD/PharmD', 'CEO', 200,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 2: Dr. Michael Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Chen', 'dr-michael-chen-cro-mid-pharma-us', 'Chief Regulatory Officer - Mid-Size Pharma (US/EU)',
  'c-suite', 22, 7, 25,
  'large', '43-53', 'PhD/PharmD', 'CEO', 100,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 3: Dr. Jennifer Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Martinez', 'dr-jennifer-martinez-cro-biotech-specialty', 'Chief Regulatory Officer - Biotech (Specialty)',
  'c-suite', 20, 6, 23,
  'large', '42-52', 'PhD/PharmD', 'CEO', 50,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 4: Dr. Robert Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Robert Thompson', 'dr-robert-thompson-svp-reg-large-portfolio', 'SVP Regulatory Affairs - Large Pharma (Portfolio)',
  'executive', 20, 6, 23,
  'large', '42-52', 'PhD/PharmD', 'CRO', 120,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 5: Dr. Sarah Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Wilson', 'dr-sarah-wilson-svp-reg-mid-biologics', 'SVP Regulatory Affairs - Mid-Size (Biologics)',
  'executive', 18, 6, 21,
  'large', '41-51', 'PhD/PharmD', 'CRO', 70,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 6: Dr. David Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Garcia', 'dr-david-garcia-svp-reg-specialty-rare', 'SVP Regulatory Affairs - Specialty (Rare Disease)',
  'executive', 16, 5, 19,
  'large', '40-50', 'PhD/PharmD', 'CRO', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 7: Dr. Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Rodriguez', 'dr-laura-rodriguez-vp-strategy-large-global', 'VP Regulatory Strategy - Large Pharma (Global)',
  'director', 15, 5, 18,
  'large', '39-49', 'PhD/PharmD', 'CRO', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 8: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-vp-strategy-mid-us-eu', 'VP Regulatory Strategy - Mid-Size (US/EU)',
  'director', 13, 4, 16,
  'large', '38-48', 'PhD/PharmD', 'CRO', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 9: Dr. Emily Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Brown', 'dr-emily-brown-vp-strategy-biotech-launch', 'VP Regulatory Strategy - Biotech (Launch Focus)',
  'director', 11, 3, 14,
  'large', '37-47', 'PhD/PharmD', 'CRO', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 10: Dr. Brian Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Brian Martinez', 'dr-brian-martinez-head-ops-large-enterprise', 'Head of Regulatory Operations - Large Pharma (Enterprise)',
  'director', 14, 4, 17,
  'large', '39-49', 'PhD/PharmD', 'CRO', 50,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 11: Amanda Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Amanda Thompson', 'amanda-thompson-head-ops-mid-efficiency', 'Head of Regulatory Operations - Mid-Size (Efficiency)',
  'director', 12, 4, 15,
  'large', '38-48', 'MS/RAC', 'CRO', 30,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 12: Dr. Michael Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Johnson', 'dr-michael-johnson-head-ops-specialty-digital', 'Head of Regulatory Operations - Specialty (Digital)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'CRO', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 13: Dr. Jennifer Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Davis', 'dr-jennifer-davis-vp-submissions-large-global', 'VP Regulatory Submissions - Large Pharma (Global)',
  'director', 16, 5, 19,
  'large', '40-50', 'PhD/PharmD', 'CRO', 60,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP Regulatory Submissions'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 14: Dr. David Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Wilson', 'dr-david-wilson-vp-submissions-mid-biologics', 'VP Regulatory Submissions - Mid-Size (Biologics)',
  'director', 14, 4, 17,
  'large', '39-49', 'PhD/PharmD', 'CRO', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP Regulatory Submissions'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 15: Dr. Sarah Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Garcia', 'dr-sarah-garcia-vp-submissions-specialty-launch', 'VP Regulatory Submissions - Specialty (Launch)',
  'director', 12, 4, 15,
  'large', '38-48', 'PhD/PharmD', 'CRO', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP Regulatory Submissions'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 16: Dr. Christopher Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Brown', 'dr-christopher-brown-vp-submissions-biotech-rare', 'VP Regulatory Submissions - Biotech (Rare Disease)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'CRO', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'VP Regulatory Submissions'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 17: Dr. Laura Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Chen', 'dr-laura-chen-submissions-director-large-nda', 'Regulatory Submissions Director - Large (NDA)',
  'director', 12, 4, 15,
  'large', '38-48', 'PhD/PharmD', 'VP', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Submissions Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 18: Dr. Michael Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Rodriguez', 'dr-michael-rodriguez-submissions-director-mid-bla', 'Regulatory Submissions Director - Mid (BLA)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'VP', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Submissions Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 19: Dr. Jennifer Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Lee', 'dr-jennifer-lee-submissions-director-specialty-maa', 'Regulatory Submissions Director - Specialty (MAA)',
  'senior', 9, 3, 12,
  'large', '36-46', 'PhD/PharmD', 'VP', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Submissions Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 20: Dr. Robert Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Robert Martinez', 'dr-robert-martinez-submissions-director-biotech-orphan', 'Regulatory Submissions Director - Biotech (Orphan)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'VP', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Regulatory Submissions Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 21: Dr. Emily Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Wilson', 'dr-emily-wilson-senior-submissions-mgr-large-oncology', 'Senior Regulatory Submissions Manager - Large (Oncology)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'Director', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 22: Dr. David Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Thompson', 'dr-david-thompson-senior-submissions-mgr-mid-cns', 'Senior Regulatory Submissions Manager - Mid (CNS)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 23: Dr. Sarah Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Johnson', 'dr-sarah-johnson-senior-submissions-mgr-specialty-rare', 'Senior Regulatory Submissions Manager - Specialty (Rare)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 4,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 24: Dr. Christopher Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Garcia', 'dr-christopher-garcia-submissions-mgr-large-portfolio', 'Regulatory Submissions Manager - Large (Portfolio)',
  'senior', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 5,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 25: Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Rodriguez', 'laura-rodriguez-submissions-mgr-mid-lifecycle', 'Regulatory Submissions Manager - Mid (Lifecycle)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'BS/MS', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 26: Dr. Brian Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Brian Davis', 'dr-brian-davis-submissions-mgr-specialty-launch', 'Regulatory Submissions Manager - Specialty (Launch)',
  'mid-level', 4, 1, 7,
  'mid', '34-44', 'PhD/PharmD', 'Director', 2,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 27: Jennifer Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Martinez', 'jennifer-martinez-publishing-mgr-large-ectd', 'Regulatory Publishing Manager - Large (eCTD)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'MS/RAC', 'Director', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 28: Michael Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Wilson', 'michael-wilson-publishing-mgr-mid-veeva', 'Regulatory Publishing Manager - Mid (Veeva)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'BS/MS', 'Director', 7,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 29: Sarah Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Thompson', 'sarah-thompson-publishing-mgr-specialty-quality', 'Regulatory Publishing Manager - Specialty (Quality)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'BS/MS', 'Director', 5,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 30: Dr. Emily Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Chen', 'dr-emily-chen-senior-writer-large-clinical', 'Senior Regulatory Writer - Large (Clinical)',
  'senior', 6, 2, 9,
  'large', '35-45', 'PhD/PharmD', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 31: David Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Rodriguez', 'david-rodriguez-senior-writer-mid-cmc', 'Senior Regulatory Writer - Mid (CMC)',
  'mid-level', 5, 1, 8,
  'large', '34-44', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 32: Laura Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Garcia', 'laura-garcia-senior-writer-specialty-rare', 'Senior Regulatory Writer - Specialty (Rare Disease)',
  'mid-level', 4, 1, 7,
  'large', '34-44', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 33: Jennifer Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Johnson', 'jennifer-johnson-regulatory-writer-large', 'Regulatory Writer - Large Pharma',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 34: Michael Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Brown', 'michael-brown-regulatory-writer-mid', 'Regulatory Writer - Mid-Size',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 35: Sarah Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Lee', 'sarah-lee-regulatory-writer-specialty', 'Regulatory Writer - Specialty',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 36: Emily Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Emily Martinez', 'emily-martinez-doc-specialist-large-publishing', 'Regulatory Document Specialist - Large (Publishing)',
  'mid-level', 4, 1, 7,
  'large', '34-44', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 37: Christopher Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Wilson', 'christopher-wilson-doc-specialist-mid-ectd', 'Regulatory Document Specialist - Mid (eCTD)',
  'junior', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 38: Laura Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Thompson', 'laura-thompson-doc-specialist-specialty-quality', 'Regulatory Document Specialist - Specialty (Quality)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 39: Jennifer Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Garcia', 'jennifer-garcia-reg-coordinator-large', 'Regulatory Coordinator - Large Pharma',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 40: Michael Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Rodriguez', 'michael-rodriguez-reg-coordinator-mid', 'Regulatory Coordinator - Mid-Size',
  'entry', 1, 1, 4,
  'large', '32-42', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 41: Sarah Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Davis', 'sarah-davis-reg-coordinator-specialty', 'Regulatory Coordinator - Specialty',
  'entry', 1, 1, 4,
  'large', '32-42', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 42: Dr. Robert Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Robert Thompson', 'dr-robert-thompson-intel-director-large-global', 'Regulatory Intelligence Director - Large (Global)',
  'director', 12, 4, 15,
  'large', '38-48', 'PhD/PharmD', 'VP', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 43: Dr. Patricia Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Patricia Wilson', 'dr-patricia-wilson-intel-director-mid-strategic', 'Regulatory Intelligence Director - Mid (Strategic)',
  'director', 10, 3, 13,
  'mid', '37-47', 'PhD/PharmD', 'VP', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 44: Dr. David Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Martinez', 'dr-david-martinez-intel-director-specialty-policy', 'Regulatory Intelligence Director - Specialty (Policy)',
  'senior', 9, 3, 12,
  'mid', '36-46', 'PhD/PharmD', 'VP', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 45: Dr. Jennifer Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Chen', 'dr-jennifer-chen-senior-intel-mgr-large-fda', 'Senior Regulatory Intelligence Manager - Large (FDA)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 46: Dr. Christopher Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Garcia', 'dr-christopher-garcia-senior-intel-mgr-mid-ema', 'Senior Regulatory Intelligence Manager - Mid (EMA)',
  'mid-level', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 47: Dr. Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Rodriguez', 'dr-laura-rodriguez-senior-intel-mgr-specialty-apac', 'Senior Regulatory Intelligence Manager - Specialty (APAC)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 48: Dr. Emily Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Johnson', 'dr-emily-johnson-intel-mgr-large-competitive', 'Regulatory Intelligence Manager - Large (Competitive)',
  'senior', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 4,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 49: Michael Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Davis', 'michael-davis-intel-mgr-mid-landscape', 'Regulatory Intelligence Manager - Mid (Landscape)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'BS/MS', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 50: Sarah Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Wilson', 'sarah-wilson-intel-mgr-specialty-horizon', 'Regulatory Intelligence Manager - Specialty (Horizon Scanning)',
  'mid-level', 4, 1, 7,
  'mid', '34-44', 'BS/MS', 'Director', 2,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 51: Dr. Brian Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Brian Thompson', 'dr-brian-thompson-senior-policy-analyst-large-us', 'Senior Regulatory Policy Analyst - Large (US)',
  'senior', 5, 1, 8,
  'large', '34-44', 'PhD/PharmD', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 52: Jennifer Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Martinez', 'jennifer-martinez-senior-policy-analyst-mid-eu', 'Senior Regulatory Policy Analyst - Mid (EU)',
  'mid-level', 4, 1, 7,
  'large', '34-44', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 53: David Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Rodriguez', 'david-rodriguez-senior-policy-analyst-specialty-orphan', 'Senior Regulatory Policy Analyst - Specialty (Orphan)',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 54: Laura Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Garcia', 'laura-garcia-policy-analyst-large-legislation', 'Regulatory Policy Analyst - Large (Legislation)',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 55: Christopher Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Wilson', 'christopher-wilson-policy-analyst-mid-guidance', 'Regulatory Policy Analyst - Mid (Guidance)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 56: Emily Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Emily Chen', 'emily-chen-policy-analyst-specialty-advocacy', 'Regulatory Policy Analyst - Specialty (Advocacy)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 57: Michael Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Johnson', 'michael-johnson-intel-specialist-large', 'Regulatory Intelligence Specialist - Large',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 58: Jennifer Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Davis', 'jennifer-davis-intel-specialist-mid', 'Regulatory Intelligence Specialist - Mid',
  'entry', 1, 1, 4,
  'large', '32-42', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 59: Sarah Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Brown', 'sarah-brown-intel-specialist-specialty', 'Regulatory Intelligence Specialist - Specialty',
  'entry', 1, 1, 4,
  'large', '32-42', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 60: Dr. Patricia Anderson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Patricia Anderson', 'dr-patricia-anderson-cmc-director-large-small-mol', 'CMC Regulatory Affairs Director - Large (Small Molecule)',
  'director', 12, 4, 15,
  'large', '38-48', 'PhD/PharmD', 'VP', 18,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 61: Dr. Michael Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Chen', 'dr-michael-chen-cmc-director-mid-biologics', 'CMC Regulatory Affairs Director - Mid (Biologics)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'VP', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 62: Dr. Jennifer Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Martinez', 'dr-jennifer-martinez-cmc-director-specialty-gene', 'CMC Regulatory Affairs Director - Specialty (Gene Therapy)',
  'senior', 9, 3, 12,
  'large', '36-46', 'PhD/PharmD', 'VP', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 63: Dr. David Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Wilson', 'dr-david-wilson-cmc-director-biotech-cell', 'CMC Regulatory Affairs Director - Biotech (Cell Therapy)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'VP', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'CMC Regulatory Affairs Director'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 64: Dr. Sarah Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Thompson', 'dr-sarah-thompson-senior-cmc-mgr-large-api', 'Senior CMC Regulatory Manager - Large (API)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior CMC Regulatory Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 65: Dr. Christopher Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Garcia', 'dr-christopher-garcia-senior-cmc-mgr-mid-drug-product', 'Senior CMC Regulatory Manager - Mid (Drug Product)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'Director', 5,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior CMC Regulatory Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 66: Dr. Laura Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Rodriguez', 'dr-laura-rodriguez-senior-cmc-mgr-specialty-mab', 'Senior CMC Regulatory Manager - Specialty (mAb)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior CMC Regulatory Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 67: Dr. Brian Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Brian Johnson', 'dr-brian-johnson-senior-cmc-mgr-biotech-viral-vector', 'Senior CMC Regulatory Manager - Biotech (Viral Vector)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'PhD/PharmD', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
FROM org_roles r
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.name = 'Senior CMC Regulatory Manager'
LIMIT 1
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  role_id = EXCLUDED.role_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- Persona 68: Dr. Emily Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Davis', 'dr-emily-davis-cmc-mgr-large-process-dev', 'CMC Regulatory Manager - Large (Process Development)',
  'senior', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 69: Dr. Robert Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Robert Martinez', 'dr-robert-martinez-cmc-mgr-mid-analytical', 'CMC Regulatory Manager - Mid (Analytical)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'PhD/PharmD', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 70: Dr. Jennifer Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Wilson', 'dr-jennifer-wilson-cmc-mgr-specialty-scale-up', 'CMC Regulatory Manager - Specialty (Scale-up)',
  'mid-level', 4, 1, 7,
  'mid', '34-44', 'PhD/PharmD', 'Director', 2,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 71: Dr. Michael Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Brown', 'dr-michael-brown-senior-cmc-specialist-large-stability', 'Senior CMC Regulatory Specialist - Large (Stability)',
  'senior', 5, 1, 8,
  'large', '34-44', 'PhD/PharmD', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 72: Dr. Sarah Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Garcia', 'dr-sarah-garcia-senior-cmc-specialist-mid-container', 'Senior CMC Regulatory Specialist - Mid (Container/Closure)',
  'mid-level', 4, 1, 7,
  'large', '34-44', 'PhD/PharmD', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 73: Dr. Christopher Lee
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Lee', 'dr-christopher-lee-senior-cmc-specialist-specialty-formulation', 'Senior CMC Regulatory Specialist - Specialty (Formulation)',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'PhD/PharmD', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 74: Dr. Laura Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Thompson', 'dr-laura-thompson-cmc-specialist-large-manufacturing', 'CMC Regulatory Specialist - Large (Manufacturing)',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'PhD/PharmD', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 75: Jennifer Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Rodriguez', 'jennifer-rodriguez-cmc-specialist-mid-quality', 'CMC Regulatory Specialist - Mid (Quality)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 76: David Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Johnson', 'david-johnson-cmc-specialist-specialty-tech-transfer', 'CMC Regulatory Specialist - Specialty (Tech Transfer)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 77: Emily Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Emily Martinez', 'emily-martinez-cmc-technical-writer-large', 'CMC Technical Writer - Large Pharma',
  'mid-level', 4, 1, 7,
  'large', '34-44', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 78: Michael Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Wilson', 'michael-wilson-cmc-technical-writer-mid', 'CMC Technical Writer - Mid-Size',
  'junior', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 79: Sarah Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Davis', 'sarah-davis-cmc-technical-writer-specialty', 'CMC Technical Writer - Specialty',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 80: Christopher Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Brown', 'christopher-brown-cmc-associate-large', 'CMC Regulatory Associate - Large',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 81: Laura Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Garcia', 'laura-garcia-cmc-associate-mid', 'CMC Regulatory Associate - Mid',
  'entry', 1, 1, 4,
  'large', '32-42', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 82: Jennifer Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Chen', 'jennifer-chen-cmc-associate-specialty', 'CMC Regulatory Associate - Specialty',
  'entry', 1, 1, 4,
  'large', '32-42', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 83: Dr. Robert Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Robert Thompson', 'dr-robert-thompson-head-us-reg-large-fda', 'Head of US Regulatory Affairs - Large (FDA)',
  'director', 15, 5, 18,
  'large', '39-49', 'PhD/PharmD', 'CRO', 40,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 84: Dr. Patricia Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Patricia Wilson', 'dr-patricia-wilson-head-us-reg-mid-nda', 'Head of US Regulatory Affairs - Mid (NDA Focus)',
  'director', 13, 4, 16,
  'large', '38-48', 'PhD/PharmD', 'CRO', 25,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 85: Dr. Michael Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Garcia', 'dr-michael-garcia-head-us-reg-specialty-orphan', 'Head of US Regulatory Affairs - Specialty (Orphan)',
  'director', 11, 3, 14,
  'large', '37-47', 'PhD/PharmD', 'CRO', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 86: Dr. Jennifer Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Martinez', 'dr-jennifer-martinez-head-eu-reg-large-ema', 'Head of EU Regulatory Affairs - Large (EMA)',
  'director', 14, 4, 17,
  'large', '39-49', 'PhD/PharmD', 'CRO', 35,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 87: Dr. David Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Rodriguez', 'dr-david-rodriguez-head-eu-reg-mid-maa', 'Head of EU Regulatory Affairs - Mid (MAA)',
  'director', 12, 4, 15,
  'large', '38-48', 'PhD/PharmD', 'CRO', 22,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 88: Dr. Sarah Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Chen', 'dr-sarah-chen-head-eu-reg-specialty-advanced', 'Head of EU Regulatory Affairs - Specialty (Advanced Therapies)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'CRO', 14,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 89: Dr. Christopher Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Johnson', 'dr-christopher-johnson-us-director-large-biologics', 'US Regulatory Affairs Director - Large (Biologics)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'VP', 15,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 90: Dr. Laura Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Davis', 'dr-laura-davis-us-director-mid-small-mol', 'US Regulatory Affairs Director - Mid (Small Molecule)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'VP', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 91: Dr. Brian Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Brian Wilson', 'dr-brian-wilson-us-director-specialty-rare', 'US Regulatory Affairs Director - Specialty (Rare Disease)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'VP', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 92: Dr. Emily Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Brown', 'dr-emily-brown-eu-director-large-centralized', 'EU Regulatory Affairs Director - Large (Centralized)',
  'director', 9, 3, 12,
  'large', '36-46', 'PhD/PharmD', 'VP', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 93: Dr. Michael Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Thompson', 'dr-michael-thompson-eu-director-mid-decentralized', 'EU Regulatory Affairs Director - Mid (Decentralized)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'VP', 9,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 94: Dr. Jennifer Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Garcia', 'dr-jennifer-garcia-eu-director-specialty-orphan', 'EU Regulatory Affairs Director - Specialty (Orphan)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'VP', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 95: Dr. Sarah Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Rodriguez', 'dr-sarah-rodriguez-apac-mgr-large-japan', 'APAC Regulatory Affairs Manager - Large (Japan PMDA)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'Director', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 96: Dr. David Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Martinez', 'dr-david-martinez-apac-mgr-mid-china', 'APAC Regulatory Affairs Manager - Mid (China NMPA)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 97: Dr. Laura Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Wilson', 'dr-laura-wilson-apac-mgr-specialty-anz', 'APAC Regulatory Affairs Manager - Specialty (ANZ TGA)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'PhD/PharmD', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 98: Dr. Christopher Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Chen', 'dr-christopher-chen-latam-mgr-large-brazil', 'LatAm Regulatory Affairs Manager - Large (Brazil ANVISA)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 99: Dr. Emily Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Emily Garcia', 'dr-emily-garcia-latam-mgr-mid-mexico', 'LatAm Regulatory Affairs Manager - Mid (Mexico COFEPRIS)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'PhD/PharmD', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 100: Dr. Robert Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Robert Johnson', 'dr-robert-johnson-latam-mgr-specialty-regional', 'LatAm Regulatory Affairs Manager - Specialty (Regional)',
  'mid-level', 4, 1, 7,
  'mid', '34-44', 'PhD/PharmD', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 101: Dr. Patricia Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Patricia Thompson', 'dr-patricia-thompson-compliance-director-large-global', 'Regulatory Compliance Director - Large (Global)',
  'director', 12, 4, 15,
  'large', '38-48', 'PhD/PharmD', 'VP', 20,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 102: Dr. Michael Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Michael Davis', 'dr-michael-davis-compliance-director-mid-us-eu', 'Regulatory Compliance Director - Mid (US/EU)',
  'director', 10, 3, 13,
  'large', '37-47', 'PhD/PharmD', 'VP', 12,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 103: Dr. Jennifer Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Jennifer Wilson', 'dr-jennifer-wilson-compliance-director-specialty-labeling', 'Regulatory Compliance Director - Specialty (Labeling)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'VP', 10,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 104: Dr. Sarah Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Sarah Martinez', 'dr-sarah-martinez-labeling-mgr-large-global', 'Regulatory Labeling Manager - Large (Global)',
  'senior', 8, 2, 11,
  'mid', '36-46', 'PhD/PharmD', 'Director', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 105: Dr. Christopher Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Christopher Rodriguez', 'dr-christopher-rodriguez-labeling-mgr-mid-us', 'Regulatory Labeling Manager - Mid (US)',
  'mid-level', 6, 2, 9,
  'mid', '35-45', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 106: Dr. Laura Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Laura Garcia', 'dr-laura-garcia-labeling-mgr-specialty-eu', 'Regulatory Labeling Manager - Specialty (EU)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'PhD/PharmD', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 107: Dr. Brian Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. Brian Johnson', 'dr-brian-johnson-compliance-mgr-large-promotional', 'Regulatory Compliance Manager - Large (Promotional)',
  'senior', 7, 2, 10,
  'mid', '35-45', 'PhD/PharmD', 'Director', 6,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 108: Emily Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Emily Thompson', 'emily-thompson-compliance-mgr-mid-advertising', 'Regulatory Compliance Manager - Mid (Advertising)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'BS/MS', 'Director', 4,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 109: Dr. David Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Dr. David Wilson', 'dr-david-wilson-compliance-mgr-specialty-medical', 'Regulatory Compliance Manager - Specialty (Medical Info)',
  'mid-level', 4, 1, 7,
  'mid', '34-44', 'PhD/PharmD', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 110: Michael Chen
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Chen', 'michael-chen-systems-mgr-large-veeva', 'Regulatory Systems Manager - Large (Veeva Vault)',
  'senior', 6, 2, 9,
  'mid', '35-45', 'MS/RAC', 'Director', 8,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 111: Jennifer Davis
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Davis', 'jennifer-davis-systems-mgr-mid-aris', 'Regulatory Systems Manager - Mid (ARIS)',
  'mid-level', 5, 1, 8,
  'mid', '34-44', 'BS/MS', 'Director', 5,
  'hybrid', r.id, r.department_id, NOW(), NOW()
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

-- Persona 112: Sarah Rodriguez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Sarah Rodriguez', 'sarah-rodriguez-systems-mgr-specialty-digital', 'Regulatory Systems Manager - Specialty (Digital)',
  'mid-level', 4, 1, 7,
  'mid', '34-44', 'BS/MS', 'Director', 3,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 113: Laura Martinez
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Laura Martinez', 'laura-martinez-labeling-specialist-large-artwork', 'Regulatory Labeling Specialist - Large (Artwork)',
  'senior', 4, 1, 7,
  'large', '34-44', 'MS/RAC', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 114: Christopher Garcia
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Christopher Garcia', 'christopher-garcia-labeling-specialist-mid-patient-info', 'Regulatory Labeling Specialist - Mid (Patient Info)',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 115: Emily Wilson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Emily Wilson', 'emily-wilson-labeling-specialist-specialty-translations', 'Regulatory Labeling Specialist - Specialty (Translations)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 116: David Thompson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'David Thompson', 'david-thompson-systems-specialist-large-admin', 'Regulatory Systems Specialist - Large (Admin)',
  'mid-level', 3, 1, 6,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 117: Jennifer Johnson
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Jennifer Johnson', 'jennifer-johnson-systems-specialist-mid-user-support', 'Regulatory Systems Specialist - Mid (User Support)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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

-- Persona 118: Michael Brown
INSERT INTO personas (
  tenant_id, function_id, name, slug, title,
  seniority_level, years_of_experience, years_in_current_role, years_in_industry,
  typical_organization_size, age_range, education_level, reporting_to, team_size,
  work_style, role_id, department_id, created_at, updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid, '43382f04-a819-4839-88c1-c1054d5ae071'::uuid,
  'Michael Brown', 'michael-brown-systems-specialist-specialty-training', 'Regulatory Systems Specialist - Specialty (Training)',
  'junior', 2, 1, 5,
  'large', '33-43', 'BS/MS', 'Director', 0,
  'office', r.id, r.department_id, NOW(), NOW()
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


COMMIT;

-- Verification
SELECT COUNT(*) as total_regulatory_personas
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = '43382f04-a819-4839-88c1-c1054d5ae071';

SELECT 
  r.name as role_name,
  COUNT(p.id) as persona_count
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
GROUP BY r.name
ORDER BY persona_count, r.name;

