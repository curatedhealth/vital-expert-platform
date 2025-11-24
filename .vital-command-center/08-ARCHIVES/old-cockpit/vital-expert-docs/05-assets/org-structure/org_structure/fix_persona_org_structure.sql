-- =====================================================================
-- FIX PERSONA ORGANIZATIONAL STRUCTURE
-- Updates personas to inherit function_id and department_id from their roles
-- =====================================================================

BEGIN;

-- Step 1: Update personas that have role_id but missing function_id or department_id
-- Get these values from the role itself
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

-- Show results
SELECT 
    'FIXED_PERSONAS' as section,
    COUNT(*) as personas_updated
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
WHERE p.role_id IS NOT NULL
  AND p.function_id = r.function_id
  AND p.department_id = r.department_id;

COMMIT;

-- Verification: Check remaining issues
SELECT 
    'REMAINING_ISSUES' as section,
    COUNT(*) as personas_with_missing_org_structure
FROM public.personas p
WHERE p.role_id IS NOT NULL
  AND (p.function_id IS NULL OR p.department_id IS NULL);

