-- =====================================================================
-- GET UNMAPPED PERSONAS - FULL DETAILS
-- Returns id, name, title, and tagline for all unmapped personas
-- (Personas missing role, function, and department)
-- =====================================================================

SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.title as persona_title,
    p.tagline as persona_tagline
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL
ORDER BY p.name;

