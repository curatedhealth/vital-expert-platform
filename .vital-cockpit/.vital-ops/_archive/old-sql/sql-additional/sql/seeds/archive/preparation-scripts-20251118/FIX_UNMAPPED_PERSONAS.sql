-- Fix Unmapped Medical Affairs Personas
-- Generated: 2025-11-17
-- Maps real personas to roles and handles placeholder data

BEGIN;

-- ==================================================
-- PART 1: Map Real Personas to Roles (34 personas)
-- ==================================================

-- Chief Medical Officer
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Chief Medical Officer' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Chief Medical Officer'
  AND p.role_id IS NULL;

-- VP Medical Affairs
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'VP Medical Affairs' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'VP Medical Affairs'
  AND p.role_id IS NULL;

-- Regional Medical Director
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Regional Medical Director' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Regional Medical Director'
  AND p.role_id IS NULL;

-- Medical Director
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Director' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Director'
  AND p.role_id IS NULL;

-- Head of Field Medical
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Head of Field Medical' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Head of Field Medical'
  AND p.role_id IS NULL;

-- Head of Medical Information
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Head of Medical Information' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Head of Medical Information'
  AND p.role_id IS NULL;

-- Head of Medical Communications
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Head Medical Communications' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Head of Medical Communications'
  AND p.role_id IS NULL;

-- Medical Education Director
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Education Director' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Education Director'
  AND p.role_id IS NULL;

-- Therapeutic Area MSL Lead
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'TA MSL Lead' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Therapeutic Area MSL Lead'
  AND p.role_id IS NULL;

-- MSL Manager
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'MSL Manager' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'MSL Manager'
  AND p.role_id IS NULL;

-- Medical Communications Manager
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Communications Manager' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Communications Manager'
  AND p.role_id IS NULL;

-- Medical Content Manager
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Content Manager' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Content Manager'
  AND p.role_id IS NULL;

-- Medical Information Manager (2 personas)
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Info Manager' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Information Manager'
  AND p.role_id IS NULL;

-- Congress & Events Manager
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Congress Manager' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Congress & Events Manager'
  AND p.role_id IS NULL;

-- Scientific Publications Manager
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Scientific Publications Manager' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Scientific Publications Manager'
  AND p.role_id IS NULL;

-- Publication Strategy Lead
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Publication Strategy Lead' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Publication Strategy Lead'
  AND p.role_id IS NULL;

-- Senior Medical Science Liaison
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Senior Medical Science Liaison' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Senior Medical Science Liaison'
  AND p.role_id IS NULL;

-- Medical Science Liaison
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Science Liaison' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Science Liaison'
  AND p.role_id IS NULL;

-- Senior Medical Information Specialist (2 personas)
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Senior Medical Info Specialist' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Senior Medical Information Specialist'
  AND p.role_id IS NULL;

-- Medical Information Specialist
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Info Specialist' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Information Specialist'
  AND p.role_id IS NULL;

-- Field Medical Trainer
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Field Medical Trainer' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Field Medical Trainer'
  AND p.role_id IS NULL;

-- Epidemiologist
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Epidemiologist' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Epidemiologist'
  AND p.role_id IS NULL;

-- RWE Lead → RWE Specialist
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'RWE Specialist' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'RWE Lead'
  AND p.role_id IS NULL;

-- Medical Writer - Publications
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Writer Publications' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Writer - Publications'
  AND p.role_id IS NULL;

-- Medical Writer - Regulatory
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Writer Regulatory' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Writer - Regulatory'
  AND p.role_id IS NULL;

-- Medical Writer - Scientific
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Writer Scientific' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Writer - Scientific'
  AND p.role_id IS NULL;

-- Medical Editor → Medical Writer
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Writer' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Editor'
  AND p.role_id IS NULL;

-- Publication Coordinator
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Publication Coordinator' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Publication Coordinator'
  AND p.role_id IS NULL;

-- Medical Librarian (2 personas)
UPDATE personas p
SET role_id = (SELECT id FROM org_roles WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda' AND name = 'Medical Librarian' LIMIT 1),
    updated_at = NOW()
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND p.title = 'Medical Librarian'
  AND p.role_id IS NULL;

-- ==================================================
-- PART 2: Handle Placeholder Personas
-- ==================================================

-- Option 1: Delete placeholder personas (recommended)
DELETE FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND title = 'Professional'
  AND name LIKE 'Persona %';

-- Option 2: If you want to keep them, uncomment this instead:
-- (They will remain unmapped until proper titles are assigned)

COMMIT;

-- ==================================================
-- Verification Queries
-- ==================================================

-- Check mapping status
SELECT
  CASE WHEN role_id IS NULL THEN 'UNMAPPED' ELSE 'MAPPED' END as status,
  COUNT(*) as count
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
GROUP BY status;

-- Check any remaining unmapped personas
SELECT
  title,
  COUNT(*) as count
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND role_id IS NULL
GROUP BY title
ORDER BY count DESC;

-- Final count by function
SELECT
  CASE
    WHEN function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d' THEN 'Medical Affairs'
    WHEN function_id = '4087be09-38e0-4c84-81e6-f79dd38151d3' THEN 'Market Access'
    ELSE 'Other'
  END as function,
  COUNT(*) as total_personas,
  COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) as mapped,
  COUNT(CASE WHEN role_id IS NULL THEN 1 END) as unmapped,
  ROUND(100.0 * COUNT(CASE WHEN role_id IS NOT NULL THEN 1 END) / COUNT(*), 1) as pct_mapped
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND function_id IN (
    'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
    '4087be09-38e0-4c84-81e6-f79dd38151d3'
  )
GROUP BY function;
