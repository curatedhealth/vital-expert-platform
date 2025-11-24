-- ========================================
-- CREATE MISSING MEDICAL AFFAIRS DEPARTMENTS
-- ========================================
-- Purpose: Create the 9 required Medical Affairs departments
-- Date: 2025-11-17
-- ========================================

BEGIN;

-- Create all required Medical Affairs departments
INSERT INTO org_departments (tenant_id, function_id, name, slug, created_at, updated_at)
VALUES
  -- Leadership department (may already exist as 'leadership')
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Medical Leadership', 'medical-leadership', NOW(), NOW()),

  -- Field Medical
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Field Medical', 'field-medical', NOW(), NOW()),

  -- Evidence & HEOR
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Evidence Generation & HEOR', 'evidence-heor', NOW(), NOW()),

  -- Clinical Operations Support
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Clinical Operations Support', 'clinical-operations-support', NOW(), NOW()),

  -- Medical Excellence & Governance
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Medical Excellence & Governance', 'medical-excellence-governance', NOW(), NOW()),

  -- Medical Strategy & Operations
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Medical Strategy & Operations', 'medical-strategy-operations', NOW(), NOW())
ON CONFLICT (tenant_id, slug) DO NOTHING;

COMMIT;

-- Verify departments
SELECT slug, name
FROM org_departments
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
ORDER BY slug;
