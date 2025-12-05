-- =====================================================================
-- COMPREHENSIVE ORG STRUCTURE VERIFICATION
-- Verifies all functions, departments, and roles in the gold standard schema
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'GOLD STANDARD PHARMACEUTICAL ORG STRUCTURE VERIFICATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. EXECUTIVE SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_functions INTEGER;
    total_departments INTEGER;
    total_roles INTEGER;
    total_global INTEGER;
    total_regional INTEGER;
    total_local INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_functions FROM public.org_functions WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_departments FROM public.org_departments WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    SELECT 
        COUNT(CASE WHEN geographic_scope = 'global' THEN 1 END),
        COUNT(CASE WHEN geographic_scope = 'regional' THEN 1 END),
        COUNT(CASE WHEN geographic_scope = 'local' THEN 1 END)
    INTO total_global, total_regional, total_local
    FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'EXECUTIVE SUMMARY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Functions:   %', total_functions;
    RAISE NOTICE 'Total Departments: %', total_departments;
    RAISE NOTICE 'Total Roles:       %', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'Geographic Distribution:';
    RAISE NOTICE '  Global:   % roles (%.1f%%)', total_global, (total_global::FLOAT / total_roles * 100);
    RAISE NOTICE '  Regional: % roles (%.1f%%)', total_regional, (total_regional::FLOAT / total_roles * 100);
    RAISE NOTICE '  Local:    % roles (%.1f%%)', total_local, (total_local::FLOAT / total_roles * 100);
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 2. ROLES BY FUNCTION (Detailed Breakdown)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ROLES BY FUNCTION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rank,
    f.name as function_name,
    COUNT(DISTINCT d.id) as departments,
    COUNT(r.id) as total_roles,
    COUNT(CASE WHEN r.geographic_scope = 'global' THEN 1 END) as global,
    COUNT(CASE WHEN r.geographic_scope = 'regional' THEN 1 END) as regional,
    COUNT(CASE WHEN r.geographic_scope = 'local' THEN 1 END) as local,
    ROUND(COUNT(r.id)::NUMERIC / COUNT(DISTINCT d.id), 1) as avg_roles_per_dept
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.deleted_at IS NULL
WHERE f.deleted_at IS NULL
GROUP BY f.id, f.name
ORDER BY COUNT(r.id) DESC, f.name;

-- =====================================================================
-- 3. SENIORITY DISTRIBUTION
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SENIORITY DISTRIBUTION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    COALESCE(seniority_level::TEXT, 'Not Set') as seniority_level,
    COUNT(*) as role_count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM public.org_roles WHERE deleted_at IS NULL) * 100, 1) as percentage
FROM public.org_roles
WHERE deleted_at IS NULL
GROUP BY seniority_level
ORDER BY 
    CASE seniority_level
        WHEN 'c_suite' THEN 1
        WHEN 'executive' THEN 2
        WHEN 'director' THEN 3
        WHEN 'senior' THEN 4
        WHEN 'mid' THEN 5
        WHEN 'entry' THEN 6
        ELSE 7
    END;

-- =====================================================================
-- 4. ROLE CATEGORY DISTRIBUTION
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ROLE CATEGORY DISTRIBUTION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    COALESCE(role_category::TEXT, 'Not Set') as role_category,
    COUNT(*) as role_count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM public.org_roles WHERE deleted_at IS NULL) * 100, 1) as percentage
FROM public.org_roles
WHERE deleted_at IS NULL
GROUP BY role_category
ORDER BY COUNT(*) DESC;

-- =====================================================================
-- 5. TOP 10 LARGEST DEPARTMENTS
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'TOP 10 LARGEST DEPARTMENTS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rank,
    f.name as function_name,
    d.name as department_name,
    COUNT(r.id) as total_roles,
    COUNT(CASE WHEN r.geographic_scope = 'global' THEN 1 END) as global,
    COUNT(CASE WHEN r.geographic_scope = 'regional' THEN 1 END) as regional,
    COUNT(CASE WHEN r.geographic_scope = 'local' THEN 1 END) as local
FROM public.org_departments d
JOIN public.org_functions f ON d.function_id = f.id AND f.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.department_id = d.id AND r.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY f.name, d.name, d.id
ORDER BY COUNT(r.id) DESC
LIMIT 10;

-- =====================================================================
-- 6. DATA QUALITY CHECKS
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'DATA QUALITY CHECKS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

WITH quality_checks AS (
    SELECT 
        'Departments without roles' as check_type,
        COUNT(*) as count
    FROM public.org_departments d
    WHERE d.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM public.org_roles r WHERE r.department_id = d.id AND r.deleted_at IS NULL)
    
    UNION ALL
    
    SELECT 
        'Roles without seniority' as check_type,
        COUNT(*) as count
    FROM public.org_roles
    WHERE deleted_at IS NULL AND seniority_level IS NULL
    
    UNION ALL
    
    SELECT 
        'Roles without category' as check_type,
        COUNT(*) as count
    FROM public.org_roles
    WHERE deleted_at IS NULL AND role_category IS NULL
    
    UNION ALL
    
    SELECT 
        'Functions without departments' as check_type,
        COUNT(*) as count
    FROM public.org_functions f
    WHERE f.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM public.org_departments d WHERE d.function_id = f.id AND d.deleted_at IS NULL)
)
SELECT 
    check_type,
    count,
    CASE WHEN count = 0 THEN '✓ PASS' ELSE '⚠ WARNING' END as status
FROM quality_checks
ORDER BY count DESC;

-- =====================================================================
-- 7. SAMPLE ROLES (First 5 from each geographic scope)
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SAMPLE ROLES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

WITH ranked_roles AS (
    SELECT 
        r.name as role_name,
        f.name as function_name,
        d.name as department_name,
        r.geographic_scope,
        r.seniority_level,
        r.role_category,
        ROW_NUMBER() OVER (PARTITION BY r.geographic_scope ORDER BY f.name, d.name, r.name) as rn
    FROM public.org_roles r
    JOIN public.org_departments d ON r.department_id = d.id AND d.deleted_at IS NULL
    JOIN public.org_functions f ON r.function_id = f.id AND f.deleted_at IS NULL
    WHERE r.deleted_at IS NULL
)
SELECT 
    geographic_scope,
    role_name,
    function_name,
    department_name,
    seniority_level,
    role_category
FROM ranked_roles
WHERE rn <= 5
ORDER BY geographic_scope, rn;

-- =====================================================================
-- 8. FINAL SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_functions INTEGER;
    total_departments INTEGER;
    total_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_functions FROM public.org_functions WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_departments FROM public.org_departments WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO total_roles FROM public.org_roles WHERE deleted_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'VERIFICATION COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Gold Standard Pharmaceutical Org Structure Created';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  • % pharmaceutical functions', total_functions;
    RAISE NOTICE '  • % departments across all functions', total_departments;
    RAISE NOTICE '  • % unique roles (global/regional/local variants)', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'Schema Features:';
    RAISE NOTICE '  ✓ Role-centric design';
    RAISE NOTICE '  ✓ Normalized structure';
    RAISE NOTICE '  ✓ Multi-tenant ready';
    RAISE NOTICE '  ✓ Geographic scope support';
    RAISE NOTICE '  ✓ Seniority & category attributes';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run: map_org_to_pharma_tenant.sql';
    RAISE NOTICE '     (Map all entities to Pharmaceuticals tenant)';
    RAISE NOTICE '';
    RAISE NOTICE '  2. Run: enrich_roles_*.sql scripts';
    RAISE NOTICE '     (Add team sizes, budgets, skills, tools, etc.)';
    RAISE NOTICE '';
    RAISE NOTICE '  3. Begin persona creation';
    RAISE NOTICE '     (4 MECE personas per role = 2,400+ personas)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

