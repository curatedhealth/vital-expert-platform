-- =====================================================================
-- GET MEDICAL AFFAIRS STRUCTURE WITH IDS FOR JSON TEMPLATE
-- This query retrieves all Medical Affairs functions, departments, and roles
-- with their IDs for creating enrichment templates
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MEDICAL AFFAIRS STRUCTURE - COMPLETE WITH IDS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Get the complete Medical Affairs structure
SELECT 
    jsonb_build_object(
        'function', jsonb_build_object(
            'id', f.id,
            'name', f.name,
            'slug', f.slug
        ),
        'departments', (
            SELECT jsonb_agg(dept_info ORDER BY dept_info->>'name')
            FROM (
                SELECT jsonb_build_object(
                    'id', d2.id,
                    'name', d2.name,
                    'slug', d2.slug,
                    'role_count', (
                        SELECT COUNT(*) 
                        FROM public.org_roles r2 
                        WHERE r2.department_id = d2.id AND r2.deleted_at IS NULL
                    )
                ) as dept_info
                FROM public.org_departments d2
                WHERE d2.function_id = f.id AND d2.deleted_at IS NULL
            ) depts
        )
    ) as medical_affairs_structure
FROM public.org_functions f
WHERE f.slug = 'medical-affairs' AND f.deleted_at IS NULL;

-- Get all roles with their IDs
DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE 'Fetching all Medical Affairs roles...';
    RAISE NOTICE '';
END $$;

SELECT 
    jsonb_build_object(
        'department_id', d.id,
        'department_name', d.name,
        'roles', jsonb_agg(
            jsonb_build_object(
                'role_id', r.id,
                'role_name', r.name,
                'role_slug', r.slug,
                'geographic_scope', r.geographic_scope,
                'seniority_level', r.seniority_level,
                'role_category', r.role_category,
                'current_attributes', jsonb_build_object(
                    'team_size_min', r.team_size_min,
                    'team_size_max', r.team_size_max,
                    'travel_percentage_min', r.travel_percentage_min,
                    'travel_percentage_max', r.travel_percentage_max,
                    'budget_min_usd', r.budget_min_usd,
                    'budget_max_usd', r.budget_max_usd,
                    'years_experience_min', r.years_experience_min,
                    'years_experience_max', r.years_experience_max
                )
            ) ORDER BY r.geographic_scope, r.name
        )
    ) as department_roles
FROM public.org_departments d
JOIN public.org_functions f ON d.function_id = f.id AND f.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE f.slug = 'medical-affairs'
GROUP BY d.id, d.name
ORDER BY d.name;

-- Check what attributes are currently NULL
DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ATTRIBUTE GAPS ANALYSIS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    'Medical Affairs Roles' as entity,
    COUNT(*) as total_roles,
    COUNT(CASE WHEN team_size_min IS NULL THEN 1 END) as missing_team_size,
    COUNT(CASE WHEN travel_percentage_min IS NULL THEN 1 END) as missing_travel_pct,
    COUNT(CASE WHEN budget_min_usd IS NULL THEN 1 END) as missing_budget,
    COUNT(CASE WHEN years_experience_min IS NULL THEN 1 END) as missing_experience,
    COUNT(CASE WHEN reports_to_role_id IS NULL THEN 1 END) as missing_reports_to,
    COUNT(CASE WHEN direct_reports_min IS NULL THEN 1 END) as missing_direct_reports
FROM public.org_roles r
JOIN public.org_functions f ON r.function_id = f.id
WHERE f.slug = 'medical-affairs' AND r.deleted_at IS NULL;

-- Check junction table population
DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'JUNCTION TABLE STATUS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    'Medical Affairs Roles' as entity,
    COUNT(DISTINCT r.id) as total_roles,
    COUNT(DISTINCT rs.role_id) as roles_with_skills,
    COUNT(DISTINCT rt.role_id) as roles_with_tools,
    COUNT(DISTINCT rr.role_id) as roles_with_responsibilities,
    COUNT(DISTINCT rk.role_id) as roles_with_kpis,
    COUNT(DISTINCT ris.role_id) as roles_with_stakeholders
FROM public.org_roles r
JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.role_skills rs ON rs.role_id = r.id
LEFT JOIN public.role_tools rt ON rt.role_id = r.id
LEFT JOIN public.role_responsibilities rr ON rr.role_id = r.id
LEFT JOIN public.role_kpis rk ON rk.role_id = r.id
LEFT JOIN public.role_internal_stakeholders ris ON ris.role_id = r.id
WHERE f.slug = 'medical-affairs' AND r.deleted_at IS NULL;

-- Summary
DO $$
DECLARE
    total_roles INTEGER;
    total_deps INTEGER;
BEGIN
    SELECT COUNT(DISTINCT d.id) INTO total_deps
    FROM public.org_departments d
    JOIN public.org_functions f ON d.function_id = f.id
    WHERE f.slug = 'medical-affairs' AND d.deleted_at IS NULL;
    
    SELECT COUNT(*) INTO total_roles
    FROM public.org_roles r
    JOIN public.org_functions f ON r.function_id = f.id
    WHERE f.slug = 'medical-affairs' AND r.deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SUMMARY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Medical Affairs Structure:';
    RAISE NOTICE '  • % departments', total_deps;
    RAISE NOTICE '  • % roles', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'Ready to create enrichment template!';
    RAISE NOTICE '';
END $$;

