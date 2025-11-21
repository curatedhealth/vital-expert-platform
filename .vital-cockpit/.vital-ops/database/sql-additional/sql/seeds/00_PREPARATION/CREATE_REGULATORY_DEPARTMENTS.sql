-- ========================================
-- CREATE REGULATORY AFFAIRS DEPARTMENTS
-- ========================================
-- Purpose: Normalize and create 6 standardized Regulatory departments
-- Date: 2025-11-17
-- Function: Regulatory (43382f04-a819-4839-88c1-c1054d5ae071)
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
-- ========================================

BEGIN;

-- ========================================
-- STEP 1: HANDLE DUPLICATE DEPARTMENTS
-- ========================================

-- Consolidate duplicate "Regulatory Submissions" departments
-- Keep 'regulatory-submissions' slug, delete 'reg-sub' duplicate

-- First, move any roles from duplicate to the primary department
UPDATE org_roles
SET department_id = (
  SELECT id FROM org_departments
  WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND slug = 'regulatory-submissions'
  LIMIT 1
)
WHERE department_id = (
  SELECT id FROM org_departments
  WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    AND slug = 'reg-sub'
  LIMIT 1
);

-- Soft delete the duplicate department
UPDATE org_departments
SET deleted_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND slug = 'reg-sub'
  AND deleted_at IS NULL;

-- ========================================
-- STEP 2: CREATE/UPDATE STANDARDIZED DEPARTMENTS
-- ========================================

-- Department 1: Regulatory Leadership & Strategy
INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  'Regulatory Leadership & Strategy',
  'regulatory-leadership-strategy',
  'Executive regulatory leadership, strategic planning, governance, and enterprise regulatory operations',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  function_id = EXCLUDED.function_id,
  updated_at = NOW();

-- Department 2: Regulatory Submissions & Operations
INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  'Regulatory Submissions & Operations',
  'regulatory-submissions-operations',
  'Regulatory submissions (NDA, BLA, MAA), regulatory writing, dossier management, and publishing',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  function_id = EXCLUDED.function_id,
  updated_at = NOW();

-- Department 3: Regulatory Intelligence & Policy
INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  'Regulatory Intelligence & Policy',
  'regulatory-intelligence-policy',
  'Regulatory intelligence, policy monitoring, strategic insights, and competitive regulatory analysis',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  function_id = EXCLUDED.function_id,
  updated_at = NOW();

-- Department 4: CMC Regulatory Affairs
INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  'CMC Regulatory Affairs',
  'cmc-regulatory-affairs',
  'Chemistry, Manufacturing, and Controls regulatory strategy, submissions, and lifecycle management',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  function_id = EXCLUDED.function_id,
  updated_at = NOW();

-- Department 5: Global Regulatory Affairs
INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  'Global Regulatory Affairs',
  'global-regulatory-affairs',
  'Regional regulatory strategy and operations (US FDA, EU EMA, APAC, LatAm)',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  function_id = EXCLUDED.function_id,
  updated_at = NOW();

-- Department 6: Regulatory Compliance & Systems
INSERT INTO org_departments (tenant_id, function_id, name, slug, description, created_at, updated_at)
VALUES (
  'f7aa6fd4-0af9-4706-8b31-034f1f7accda',
  '43382f04-a819-4839-88c1-c1054d5ae071',
  'Regulatory Compliance & Systems',
  'regulatory-compliance-systems',
  'Regulatory compliance, labeling, advertising review, and regulatory information systems',
  NOW(),
  NOW()
)
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  function_id = EXCLUDED.function_id,
  updated_at = NOW();

COMMIT;

-- ========================================
-- VALIDATION
-- ========================================

SELECT 'Regulatory Departments Created Successfully' as status;

-- Show all Regulatory departments
SELECT
  d.slug,
  d.name,
  d.description,
  COUNT(r.id) as current_roles
FROM org_departments d
LEFT JOIN org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE d.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND d.function_id = '43382f04-a819-4839-88c1-c1054d5ae071'
  AND d.deleted_at IS NULL
GROUP BY d.slug, d.name, d.description
ORDER BY d.slug;
