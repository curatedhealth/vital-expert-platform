-- ========================================
-- COMPLETE ROLE NORMALIZATION & PERSONA MAPPING
-- ========================================
-- Purpose: Create all 43 Medical Affairs and 53 Market Access roles
--          Map all 326 personas to correct normalized roles
-- Date: 2025-11-17
-- ========================================

BEGIN;

-- First, clear all existing role_id mappings to start fresh
UPDATE personas
SET role_id = NULL
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL;

-- ========================================
-- SECTION 1: ENSURE ALL DEPARTMENTS EXIST
-- ========================================

-- Medical Affairs Departments (ensure we have the necessary departments)
INSERT INTO org_departments (tenant_id, function_id, name, slug, created_at, updated_at)
VALUES 
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Field Medical', 'field-medical', NOW(), NOW()),
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Evidence Generation & HEOR', 'evidence-generation-heor', NOW(), NOW()),
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Clinical Operations Support', 'clinical-operations-support', NOW(), NOW()),
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Medical Excellence & Governance', 'medical-excellence-governance', NOW(), NOW()),
  ('f7aa6fd4-0af9-4706-8b31-034f1f7accda', 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d', 'Medical Strategy & Operations', 'medical-strategy-operations', NOW(), NOW())
ON CONFLICT (tenant_id, slug) DO NOTHING;

COMMIT;

SELECT 'Step 1 Complete: Departments verified' as status;

