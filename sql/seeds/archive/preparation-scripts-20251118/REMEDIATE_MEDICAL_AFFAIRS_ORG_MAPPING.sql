-- ========================================
-- MEDICAL AFFAIRS ORGANIZATIONAL MAPPING
-- ========================================
-- Date: 2025-11-17
-- Purpose: Map 185 Medical Affairs personas to departments and roles
-- Function: Medical Affairs (bd4cbbef-e3a2-4b22-836c-61ccfd7f042d)
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
-- ========================================

BEGIN;

-- ========================================
-- STEP 1: SET FUNCTION_ID FOR ALL MEDICAL AFFAIRS PERSONAS
-- ========================================

UPDATE personas
SET
  function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d',
  updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id IS NULL
  AND (
    title ILIKE '%medical%'
    OR title ILIKE '%MSL%'
    OR title ILIKE '%CMO%'
    OR title ILIKE '%biostatistician%'
    OR title ILIKE '%epidemiologist%'
    OR title ILIKE '%medical writer%'
    OR title ILIKE '%medical editor%'
    OR title ILIKE '%publication%'
    OR title ILIKE '%congress%'
    OR title ILIKE '%medical monitor%'
    OR title ILIKE '%clinical trial%'
    OR title ILIKE '%safety physician%'
  );


-- ========================================
-- STEP 2: MAP PERSONAS TO EXISTING ROLES
-- ========================================

-- Map personas to role: chief-medical-officer
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'aaaaaaaa-1111-2222-3333-444444444444',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'chief-medical-officer'
  AND (
    p.title ILIKE '%Chief Medical Officer%'
    OR p.title ILIKE '%CMO%'
  );

-- Map personas to role: vp-medical-affairs
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'aaaaaaaa-1111-2222-3333-444444444444',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'vp-medical-affairs'
  AND (
    p.title ILIKE '%VP Medical Affairs%'
  );

-- Map personas to role: medical-director
UPDATE personas p
SET
  role_id = r.id,
  department_id = 'aaaaaaaa-1111-2222-3333-444444444444',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'medical-director'
  AND (
    p.title ILIKE '%Medical Director -%'
    OR p.title ILIKE '%Regional Medical Director%'
  );

-- Map personas to role: senior-medical-science-liaison
UPDATE personas p
SET
  role_id = r.id,
  department_id = '36241f10-7950-4298-b0cd-4f4dccdf95a6',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'senior-medical-science-liaison'
  AND (
    p.title ILIKE '%Senior MSL%'
    OR p.title ILIKE '%MSL Manager%'
    OR p.title ILIKE '%TA MSL Lead%'
  );

-- Map personas to role: medical-science-liaison
UPDATE personas p
SET
  role_id = r.id,
  department_id = '36241f10-7950-4298-b0cd-4f4dccdf95a6',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'medical-science-liaison'
  AND (
    p.title ILIKE '%MSL Specialist%'
    OR p.title ILIKE '%MSL - %'
    OR p.title ILIKE '%Field Medical Trainer%'
  );

-- Map personas to role: medical-writer
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1eac426c-824f-47ef-a680-ef3821d0dd7a',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'medical-writer'
  AND (
    p.title ILIKE '%Medical Writer%'
  );

-- Map personas to role: senior-medical-writer
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1eac426c-824f-47ef-a680-ef3821d0dd7a',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'senior-medical-writer'
  AND (
    p.title ILIKE '%Senior Medical Writer%'
    OR p.title ILIKE '%Medical Editor%'
  );

-- Map personas to role: director-medical-publications
UPDATE personas p
SET
  role_id = r.id,
  department_id = '1eac426c-824f-47ef-a680-ef3821d0dd7a',
  updated_at = NOW()
FROM org_roles r
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.slug = 'director-medical-publications'
  AND (
    p.title ILIKE '%Head Medical Communications%'
    OR p.title ILIKE '%Publication Strategy%'
    OR p.title ILIKE '%Congress Manager%'
    OR p.title ILIKE '%Scientific Publications Manager%'
  );


-- ========================================
-- STEP 3: MAP REMAINING PERSONAS TO DEPARTMENTS
-- ========================================
-- For personas without role_id, set department_id based on title

-- Set department for unmatched personas
UPDATE personas
SET
  department_id = '047acfb6-ddb4-4d77-b8cf-273fee31db41',
  updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND role_id IS NULL
  AND (
    title ILIKE '%Medical Information%'
    OR title ILIKE '%Medical Info%'
    OR title ILIKE '%Medical Librarian%'
    OR title ILIKE '%Medical Content Manager%'
  );

-- Set department for unmatched personas
UPDATE personas
SET
  department_id = '962e2a96-0af8-491a-82fe-4e876b610be3',
  updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND role_id IS NULL
  AND (
    title ILIKE '%Medical Communications%'
    OR title ILIKE '%Medical Education%'
    OR title ILIKE '%Congress%'
  );

-- Set department for unmatched personas
UPDATE personas
SET
  department_id = '36241f10-7950-4298-b0cd-4f4dccdf95a6',
  updated_at = NOW()
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND role_id IS NULL
  AND (
    title ILIKE '%Field Medical%'
    OR title ILIKE '%MSL%'
  );


COMMIT;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Check Medical Affairs mapping status
SELECT 
  COUNT(*) as total_ma_personas,
  COUNT(function_id) as has_function,
  COUNT(department_id) as has_department,
  COUNT(role_id) as has_role,
  COUNT(*) - COUNT(role_id) as unmapped_roles
FROM personas
WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND deleted_at IS NULL
  AND function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d';

-- Show persona distribution by department
SELECT 
  COALESCE(d.name, 'NO DEPARTMENT') as department_name,
  COUNT(p.id) as persona_count,
  COUNT(p.role_id) as has_role,
  COUNT(p.id) - COUNT(p.role_id) as no_role
FROM personas p
LEFT JOIN org_departments d ON p.department_id = d.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
  AND p.deleted_at IS NULL
  AND p.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
GROUP BY d.name
ORDER BY persona_count DESC;
