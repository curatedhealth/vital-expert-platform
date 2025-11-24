-- =====================================================================
-- DELETE ALL UNMAPPED PERSONAS
-- Soft deletes (sets deleted_at) all 279 personas missing role, function, and department
-- =====================================================================

BEGIN;

-- =====================================================================
-- STEP 1: PREVIEW - See what will be deleted
-- =====================================================================
SELECT 
    '=== PREVIEW: Personas that will be deleted ===' as section;

SELECT 
    COUNT(*) as personas_to_delete,
    'These personas have NULL role_id, function_id, and department_id' as reason
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

-- Show sample of what will be deleted
SELECT 
    '=== SAMPLE OF PERSONAS TO BE DELETED (First 20) ===' as section;

SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL
ORDER BY p.name
LIMIT 20;

-- =====================================================================
-- STEP 2: SOFT DELETE - Set deleted_at timestamp
-- =====================================================================
-- Uncomment the UPDATE statement below to actually perform the deletion
-- Make sure you've reviewed the preview above!

/*
UPDATE public.personas
SET 
    deleted_at = NOW(),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND role_id IS NULL
  AND function_id IS NULL
  AND department_id IS NULL;
*/

-- =====================================================================
-- STEP 3: VERIFICATION - Check deletion results
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

-- =====================================================================
-- ALTERNATIVE: HARD DELETE (Permanent removal)
-- =====================================================================
-- WARNING: This permanently removes records from the database!
-- Only use if you're absolutely sure you want to permanently delete them.
-- Uncomment the DELETE statement below if you want hard delete instead of soft delete.

/*
BEGIN;

DELETE FROM public.personas
WHERE deleted_at IS NULL
  AND role_id IS NULL
  AND function_id IS NULL
  AND department_id IS NULL;

COMMIT;
*/

