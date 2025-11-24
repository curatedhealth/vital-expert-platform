-- =====================================================================
-- GET ROLES WITH LESS THAN 4 PERSONAS
-- Returns role ID and name for all roles that have fewer than 4 personas assigned
-- =====================================================================

SELECT 
    r.id as role_id,
    r.name as role_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name
HAVING COUNT(p.id) < 4
ORDER BY persona_count ASC, r.name;

