-- =====================================================================
-- DELETE ALL UNMAPPED PERSONAS (ACTIVE VERSION)
-- Soft deletes (sets deleted_at) all personas missing role, function, and department
-- =====================================================================

BEGIN;

-- =====================================================================
-- PREVIEW: See what will be deleted
-- =====================================================================
SELECT 
    '=== PREVIEW: Personas that will be deleted ===' as section;

SELECT 
    COUNT(*) as personas_to_delete
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

-- =====================================================================
-- SOFT DELETE: Set deleted_at timestamp
-- =====================================================================
UPDATE public.personas
SET 
    deleted_at = NOW(),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND role_id IS NULL
  AND function_id IS NULL
  AND department_id IS NULL;

-- =====================================================================
-- VERIFICATION: Check deletion results
-- =====================================================================
SELECT 
    '=== VERIFICATION: After deletion ===' as section;

SELECT 
    COUNT(*) as remaining_unmapped_personas,
    'Should be 0 if deletion was successful' as note
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

-- Total personas count
SELECT 
    '=== TOTAL PERSONAS COUNT ===' as section;

SELECT 
    COUNT(*) as total_active_personas,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped_personas
FROM public.personas
WHERE deleted_at IS NULL;

COMMIT;

