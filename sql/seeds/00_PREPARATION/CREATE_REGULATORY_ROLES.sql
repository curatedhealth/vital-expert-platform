-- ========================================
-- CREATE 38 REGULATORY AFFAIRS ROLES
-- ========================================
-- Purpose: Create complete Regulatory Affairs organizational structure
-- Date: 2025-11-17
-- Function: Regulatory (43382f04-a819-4839-88c1-c1054d5ae071)
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
-- ========================================

BEGIN;

-- ========================================
-- CREATE ALL 38 REGULATORY ROLES
-- ========================================


-- Create role: Chief Regulatory Officer
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Chief Regulatory Officer',
  'chief-regulatory-officer',
  'C-Suite regulatory leader responsible for global regulatory strategy, submissions, and compliance across all products and regions',
  'executive',
  'L1',
  10,
  'CEO',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-leadership-strategy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: SVP Regulatory Affairs
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'SVP Regulatory Affairs',
  'svp-regulatory-affairs',
  'Senior Vice President leading global regulatory operations, submissions, and regional regulatory teams',
  'executive',
  'L2',
  9,
  'Chief Regulatory Officer',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-leadership-strategy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: VP Regulatory Strategy
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'VP Regulatory Strategy',
  'vp-regulatory-strategy',
  'Vice President leading regulatory strategy, intelligence, policy, and strategic regulatory planning',
  'director',
  'L3',
  8,
  'SVP Regulatory Affairs',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-leadership-strategy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Head of Regulatory Operations
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Head of Regulatory Operations',
  'head-of-regulatory-operations',
  'Head of Regulatory Operations managing regulatory systems, processes, compliance, and operational excellence',
  'director',
  'L3',
  8,
  'SVP Regulatory Affairs',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-leadership-strategy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: VP Regulatory Submissions
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'VP Regulatory Submissions',
  'vp-regulatory-submissions',
  'Vice President leading global regulatory submissions (NDA, BLA, MAA) and regulatory writing teams',
  'director',
  'L3',
  8,
  'SVP Regulatory Affairs',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Submissions Director
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Submissions Director',
  'regulatory-submissions-director',
  'Director managing regulatory submission preparation, review, and filing for assigned region or portfolio',
  'director',
  'L4',
  7,
  'VP Regulatory Submissions',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Senior Regulatory Submissions Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Senior Regulatory Submissions Manager',
  'senior-regulatory-submissions-manager',
  'Senior Manager leading regulatory submission projects and regulatory writing for specific products or therapeutic areas',
  'senior',
  'L5',
  6,
  'Regulatory Submissions Director',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Submissions Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Submissions Manager',
  'regulatory-submissions-manager',
  'Manager coordinating regulatory submissions, dossier preparation, and agency interactions for assigned products',
  'senior',
  'L5',
  6,
  'Regulatory Submissions Director',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Senior Regulatory Writer
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Senior Regulatory Writer',
  'senior-regulatory-writer',
  'Senior Regulatory Writer authoring complex regulatory documents (Module 2, CSRs, briefing documents)',
  'senior',
  'L6',
  5,
  'Regulatory Submissions Manager',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Writer
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Writer',
  'regulatory-writer',
  'Regulatory Writer preparing regulatory documents and sections for submissions under guidance',
  'mid-level',
  'L6',
  4,
  'Regulatory Submissions Manager',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Publishing Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Publishing Manager',
  'regulatory-publishing-manager',
  'Manager overseeing regulatory publishing, eCTD compilation, and submission delivery',
  'senior',
  'L5',
  6,
  'VP Regulatory Submissions',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Document Specialist
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Document Specialist',
  'regulatory-document-specialist',
  'Specialist managing regulatory document control, publishing, and eCTD compilation',
  'mid-level',
  'L6',
  4,
  'Regulatory Publishing Manager',
  'centralized',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Coordinator
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Coordinator',
  'regulatory-coordinator',
  'Coordinator providing administrative and operational support for regulatory submissions and activities',
  'entry',
  'L7',
  3,
  'Regulatory Submissions Manager',
  'centralized',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-submissions-operations'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Intelligence Director
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Intelligence Director',
  'regulatory-intelligence-director',
  'Director leading regulatory intelligence, policy monitoring, and strategic regulatory insights',
  'director',
  'L4',
  7,
  'VP Regulatory Strategy',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-intelligence-policy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Senior Regulatory Intelligence Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Senior Regulatory Intelligence Manager',
  'senior-regulatory-intelligence-manager',
  'Senior Manager leading regulatory intelligence activities and strategic policy analysis',
  'senior',
  'L5',
  6,
  'Regulatory Intelligence Director',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-intelligence-policy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Intelligence Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Intelligence Manager',
  'regulatory-intelligence-manager',
  'Manager conducting regulatory intelligence, policy monitoring, and competitive analysis for assigned regions',
  'senior',
  'L5',
  6,
  'Regulatory Intelligence Director',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-intelligence-policy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Senior Regulatory Policy Analyst
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Senior Regulatory Policy Analyst',
  'senior-regulatory-policy-analyst',
  'Senior Analyst analyzing regulatory policies, guidelines, and emerging regulatory trends',
  'senior',
  'L6',
  5,
  'Regulatory Intelligence Manager',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-intelligence-policy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Policy Analyst
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Policy Analyst',
  'regulatory-policy-analyst',
  'Analyst monitoring and analyzing regulatory policies and their impact on submissions',
  'mid-level',
  'L6',
  4,
  'Regulatory Intelligence Manager',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-intelligence-policy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Intelligence Specialist
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Intelligence Specialist',
  'regulatory-intelligence-specialist',
  'Specialist supporting regulatory intelligence research, data collection, and reporting',
  'entry',
  'L7',
  3,
  'Regulatory Intelligence Manager',
  'centralized',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-intelligence-policy'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: CMC Regulatory Affairs Director
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'CMC Regulatory Affairs Director',
  'cmc-regulatory-affairs-director',
  'Director leading CMC regulatory strategy, submissions, and lifecycle management for Chemistry, Manufacturing, and Controls',
  'director',
  'L4',
  7,
  'VP Regulatory Submissions',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Senior CMC Regulatory Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Senior CMC Regulatory Manager',
  'senior-cmc-regulatory-manager',
  'Senior Manager leading CMC regulatory activities for assigned products or regions',
  'senior',
  'L5',
  6,
  'CMC Regulatory Affairs Director',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: CMC Regulatory Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'CMC Regulatory Manager',
  'cmc-regulatory-manager',
  'Manager coordinating CMC regulatory strategy and submissions for assigned products',
  'senior',
  'L5',
  6,
  'CMC Regulatory Affairs Director',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Senior CMC Regulatory Specialist
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Senior CMC Regulatory Specialist',
  'senior-cmc-regulatory-specialist',
  'Senior Specialist managing CMC regulatory sections, supporting submissions and lifecycle changes',
  'senior',
  'L6',
  5,
  'CMC Regulatory Manager',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: CMC Regulatory Specialist
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'CMC Regulatory Specialist',
  'cmc-regulatory-specialist',
  'Specialist preparing CMC regulatory documents and supporting submission activities',
  'mid-level',
  'L6',
  4,
  'CMC Regulatory Manager',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: CMC Regulatory Associate
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'CMC Regulatory Associate',
  'cmc-regulatory-associate',
  'Associate providing support for CMC regulatory documentation and submissions',
  'entry',
  'L7',
  3,
  'CMC Regulatory Specialist',
  'centralized',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: CMC Technical Writer
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'CMC Technical Writer',
  'cmc-technical-writer',
  'Technical Writer authoring CMC sections (Module 3) and supporting CMC regulatory documentation',
  'mid-level',
  'L6',
  4,
  'CMC Regulatory Manager',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'cmc-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Head of US Regulatory Affairs
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Head of US Regulatory Affairs',
  'head-of-us-regulatory-affairs',
  'Head of US Regulatory Affairs leading FDA strategy, submissions, and regulatory operations',
  'director',
  'L3',
  8,
  'SVP Regulatory Affairs',
  'national',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'global-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Head of EU Regulatory Affairs
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Head of EU Regulatory Affairs',
  'head-of-eu-regulatory-affairs',
  'Head of EU Regulatory Affairs leading EMA strategy, submissions, and European regulatory operations',
  'director',
  'L3',
  8,
  'SVP Regulatory Affairs',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'global-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: US Regulatory Affairs Director
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'US Regulatory Affairs Director',
  'us-regulatory-affairs-director',
  'Director managing US FDA submissions, regulatory strategy, and agency interactions',
  'director',
  'L4',
  7,
  'Head of US Regulatory Affairs',
  'national',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'global-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: EU Regulatory Affairs Director
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'EU Regulatory Affairs Director',
  'eu-regulatory-affairs-director',
  'Director managing EU EMA submissions, regulatory strategy, and European agency interactions',
  'director',
  'L4',
  7,
  'Head of EU Regulatory Affairs',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'global-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: APAC Regulatory Affairs Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'APAC Regulatory Affairs Manager',
  'apac-regulatory-affairs-manager',
  'Manager leading regulatory strategy and submissions for APAC region (PMDA, NMPA, TGA, etc.)',
  'senior',
  'L5',
  6,
  'SVP Regulatory Affairs',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'global-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: LatAm Regulatory Affairs Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'LatAm Regulatory Affairs Manager',
  'latam-regulatory-affairs-manager',
  'Manager leading regulatory strategy and submissions for Latin America region (ANVISA, COFEPRIS, etc.)',
  'senior',
  'L5',
  6,
  'SVP Regulatory Affairs',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'global-regulatory-affairs'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Compliance Director
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Compliance Director',
  'regulatory-compliance-director',
  'Director leading regulatory compliance, labeling, advertising review, and regulatory quality',
  'director',
  'L4',
  7,
  'Head of Regulatory Operations',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-compliance-systems'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Labeling Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Labeling Manager',
  'regulatory-labeling-manager',
  'Manager overseeing regulatory labeling strategy, development, and global harmonization',
  'senior',
  'L5',
  6,
  'Regulatory Compliance Director',
  'global',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-compliance-systems'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Compliance Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Compliance Manager',
  'regulatory-compliance-manager',
  'Manager ensuring regulatory compliance with GxP, CFR, and regulatory requirements',
  'senior',
  'L5',
  6,
  'Regulatory Compliance Director',
  'regional',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-compliance-systems'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Labeling Specialist
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Labeling Specialist',
  'regulatory-labeling-specialist',
  'Specialist developing and maintaining regulatory labeling for assigned products',
  'senior',
  'L6',
  5,
  'Regulatory Labeling Manager',
  'product',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-compliance-systems'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Systems Manager
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Systems Manager',
  'regulatory-systems-manager',
  'Manager overseeing regulatory information management systems (Veeva Vault, ARIS, etc.)',
  'senior',
  'L5',
  6,
  'Head of Regulatory Operations',
  'centralized',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-compliance-systems'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


-- Create role: Regulatory Systems Specialist
INSERT INTO org_roles (
  tenant_id,
  function_id,
  department_id,
  name,
  slug,
  description,
  seniority_level,
  leadership_level,
  career_level,
  reports_to,
  geographic_scope,
  created_at,
  updated_at
)
SELECT
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  d.id,
  'Regulatory Systems Specialist',
  'regulatory-systems-specialist',
  'Specialist managing regulatory systems, publishing tools, and eCTD platforms',
  'mid-level',
  'L7',
  4,
  'Regulatory Systems Manager',
  'centralized',
  NOW(),
  NOW()
FROM org_departments d
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.slug = 'regulatory-compliance-systems'
  AND d.deleted_at IS NULL
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  seniority_level = EXCLUDED.seniority_level,
  leadership_level = EXCLUDED.leadership_level,
  career_level = EXCLUDED.career_level,
  reports_to = EXCLUDED.reports_to,
  geographic_scope = EXCLUDED.geographic_scope,
  updated_at = NOW();


COMMIT;

SELECT 'All 38 Regulatory roles created successfully' as status;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Count roles by department
SELECT
  d.name as department,
  COUNT(r.id) as role_count
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND d.deleted_at IS NULL
GROUP BY d.name
ORDER BY d.name;

-- Count roles by leadership level
SELECT
  leadership_level,
  COUNT(*) as count
FROM org_roles
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND deleted_at IS NULL
GROUP BY leadership_level
ORDER BY leadership_level;

-- Show all roles
SELECT
  d.name as department,
  r.name as role_name,
  r.leadership_level,
  r.seniority_level,
  r.career_level,
  r.reports_to
FROM org_roles r
JOIN org_departments d ON d.id = r.department_id
WHERE r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND r.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND r.deleted_at IS NULL
ORDER BY d.name, r.career_level DESC, r.name;

