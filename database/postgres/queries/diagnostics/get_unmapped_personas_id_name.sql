-- =====================================================================
-- GET UNMAPPED PERSONAS - ID AND NAME ONLY
-- Returns persona ID and name for all 279 personas missing role, function, and department
-- =====================================================================

SELECT 
    p.id as persona_id,
    p.name as persona_name
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL
ORDER BY p.name;

