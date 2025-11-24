-- =====================================================================
-- VERIFY PERSONA ROLE_ID MATCHES ORG_ROLES
-- Checks if personas are mapped to valid roles and if those roles have org structure
-- =====================================================================

-- Check if persona role_ids exist in org_roles and their org structure status
SELECT 
    'PERSONA_ROLE_VERIFICATION' as section,
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.role_id as persona_role_id,
    r.id as org_role_id,
    r.name as org_role_name,
    r.function_id as role_function_id,
    r.department_id as role_department_id,
    f.name as function_name,
    d.name as department_name,
    CASE 
        WHEN r.id IS NULL THEN 'ROLE_NOT_FOUND'
        WHEN r.function_id IS NULL THEN 'ROLE_MISSING_FUNCTION'
        WHEN r.department_id IS NULL THEN 'ROLE_MISSING_DEPARTMENT'
        WHEN r.function_id IS NOT NULL AND r.department_id IS NOT NULL THEN 'ROLE_COMPLETE'
        ELSE 'UNKNOWN'
    END as status
FROM public.personas p
LEFT JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND p.role_id IS NOT NULL
AND (p.deleted_at IS NULL)
ORDER BY status, p.name;

-- Summary of issues
WITH persona_issues AS (
    SELECT 
        p.id,
        CASE 
            WHEN r.id IS NULL THEN 'ROLE_NOT_FOUND'
            WHEN r.function_id IS NULL THEN 'ROLE_MISSING_FUNCTION'
            WHEN r.department_id IS NULL THEN 'ROLE_MISSING_DEPARTMENT'
            WHEN r.function_id IS NOT NULL AND r.department_id IS NOT NULL THEN 'ROLE_COMPLETE'
            ELSE 'UNKNOWN'
        END as issue_type,
        r.name as role_name
    FROM public.personas p
    LEFT JOIN public.org_roles r ON p.role_id = r.id
    WHERE p.tenant_id = (
        SELECT id FROM public.tenants 
        WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
        LIMIT 1
    )
    AND p.role_id IS NOT NULL
    AND (p.deleted_at IS NULL)
)
SELECT 
    'ISSUE_SUMMARY' as section,
    issue_type,
    COUNT(*) as count,
    STRING_AGG(DISTINCT role_name, ', ' ORDER BY role_name) FILTER (WHERE role_name IS NOT NULL) as affected_roles
FROM persona_issues
GROUP BY issue_type
ORDER BY 
    CASE issue_type
        WHEN 'ROLE_NOT_FOUND' THEN 1
        WHEN 'ROLE_MISSING_FUNCTION' THEN 2
        WHEN 'ROLE_MISSING_DEPARTMENT' THEN 3
        WHEN 'ROLE_COMPLETE' THEN 4
        ELSE 5
    END;

-- Check if there are correct roles with org structure that match the persona role names
SELECT 
    'POTENTIAL_CORRECT_ROLES' as section,
    r.id as role_id,
    r.name as role_name,
    r.function_id,
    r.department_id,
    f.name as function_name,
    d.name as department_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (
    r.name::text ILIKE '%Medical Science Liaison%'
    OR r.name::text ILIKE '%Medical Information Manager%'
    OR r.name::text ILIKE '%Medical Affairs Director%'
)
AND r.function_id IS NOT NULL
AND r.department_id IS NOT NULL
GROUP BY r.id, r.name, r.function_id, r.department_id, f.name, d.name
ORDER BY r.name;

