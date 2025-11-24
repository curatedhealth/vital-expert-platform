-- =====================================================================
-- FIX PERSONAS - INHERIT FROM ROLES
-- Simple script to ensure personas inherit function_id and department_id from their roles
-- =====================================================================

BEGIN;

-- Step 1: Update personas to inherit function_id and department_id from their roles
UPDATE public.personas p
SET
    function_id = r.function_id,
    department_id = r.department_id,
    updated_at = NOW()
FROM public.org_roles r
WHERE p.role_id = r.id
  AND p.role_id IS NOT NULL
  AND (
    p.function_id IS NULL 
    OR p.department_id IS NULL
    OR p.function_id != r.function_id
    OR p.department_id != r.department_id
  );

COMMIT;

-- Verification
SELECT 
    'VERIFICATION' as section,
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped
FROM public.personas p
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (p.deleted_at IS NULL);

