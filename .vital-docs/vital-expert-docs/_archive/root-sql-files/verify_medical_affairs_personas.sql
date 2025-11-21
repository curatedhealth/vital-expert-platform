-- =====================================================================
-- VERIFY MEDICAL AFFAIRS PERSONAS AND ROLES
-- =====================================================================

-- =====================================================================
-- SUMMARY STATISTICS
-- =====================================================================

SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    (SELECT COUNT(DISTINCT r.id) 
     FROM public.org_roles r
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
    ) as total_medical_affairs_roles,
    
    (SELECT COUNT(*) 
     FROM public.personas p
     JOIN public.org_roles r ON p.role_id = r.id
     WHERE p.deleted_at IS NULL
       AND r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
    ) as total_personas_created,
    
    (SELECT COUNT(DISTINCT r.id)
     FROM public.org_roles r
     JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
     GROUP BY r.id
     HAVING COUNT(DISTINCT p.archetype) = 4
    ) as roles_with_4_archetypes,
    
    (SELECT COUNT(DISTINCT r.id)
     FROM public.org_roles r
     LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
     GROUP BY r.id
     HAVING COUNT(p.id) < 4 OR COUNT(p.id) IS NULL
    ) as roles_missing_personas;

-- =====================================================================
-- ARCHETYPE DISTRIBUTION
-- =====================================================================

SELECT 
    '=== ARCHETYPE DISTRIBUTION ===' as section;

SELECT 
    p.archetype,
    COUNT(*) as persona_count,
    COUNT(DISTINCT p.role_id) as roles_represented,
    ROUND(AVG(p.work_complexity_score), 1) as avg_work_complexity,
    ROUND(AVG(p.ai_maturity_score), 1) as avg_ai_maturity,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM public.personas p2 JOIN public.org_roles r2 ON p2.role_id = r2.id WHERE p2.deleted_at IS NULL AND r2.deleted_at IS NULL AND r2.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1) AND r2.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)), 1) as percentage
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
WHERE p.deleted_at IS NULL
  AND r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
GROUP BY p.archetype
ORDER BY p.archetype;

-- =====================================================================
-- ROLES WITH PERSONA BREAKDOWN
-- =====================================================================

SELECT 
    '=== ROLES WITH PERSONA BREAKDOWN ===' as section;

SELECT 
    r.name as role_name,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT p.archetype) as unique_archetypes,
    STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text) as archetypes,
    CASE 
        WHEN COUNT(DISTINCT p.archetype) = 4 THEN '✅ Complete (MECE)'
        WHEN COUNT(DISTINCT p.archetype) = 3 THEN '⚠️ Missing 1 archetype'
        WHEN COUNT(DISTINCT p.archetype) = 2 THEN '⚠️ Missing 2 archetypes'
        WHEN COUNT(DISTINCT p.archetype) = 1 THEN '⚠️ Missing 3 archetypes'
        WHEN COUNT(DISTINCT p.id) = 0 THEN '❌ No personas'
        ELSE '⚠️ Incomplete'
    END as status
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
GROUP BY r.id, r.name, d.name
ORDER BY persona_count DESC, r.name;

-- =====================================================================
-- DEPARTMENT BREAKDOWN
-- =====================================================================

SELECT 
    '=== DEPARTMENT BREAKDOWN ===' as section;

SELECT 
    d.name as department_name,
    COUNT(DISTINCT r.id) as roles_count,
    COUNT(DISTINCT p.id) as personas_count,
    COUNT(DISTINCT CASE WHEN p.archetype = 'AUTOMATOR' THEN p.id END) as automators,
    COUNT(DISTINCT CASE WHEN p.archetype = 'ORCHESTRATOR' THEN p.id END) as orchestrators,
    COUNT(DISTINCT CASE WHEN p.archetype = 'LEARNER' THEN p.id END) as learners,
    COUNT(DISTINCT CASE WHEN p.archetype = 'SKEPTIC' THEN p.id END) as skeptics,
    ROUND(AVG(p.work_complexity_score), 1) as avg_work_complexity,
    ROUND(AVG(p.ai_maturity_score), 1) as avg_ai_maturity
FROM public.org_departments d
JOIN public.org_roles r ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
GROUP BY d.id, d.name
ORDER BY personas_count DESC, d.name;

-- =====================================================================
-- MECE COMPLIANCE CHECK
-- =====================================================================

SELECT 
    '=== MECE COMPLIANCE CHECK ===' as section;

SELECT 
    CASE 
        WHEN roles_with_4 = total_roles THEN '✅ PERFECT MECE COMPLIANCE'
        WHEN roles_with_4 >= total_roles * 0.9 THEN '✅ Excellent (90%+ compliance)'
        WHEN roles_with_4 >= total_roles * 0.75 THEN '⚠️ Good (75%+ compliance)'
        ELSE '❌ Needs improvement'
    END as compliance_status,
    roles_with_4 as roles_with_4_archetypes,
    total_roles as total_roles,
    ROUND(100.0 * roles_with_4 / NULLIF(total_roles, 0), 1) as compliance_percentage
FROM (
    SELECT 
        (SELECT COUNT(DISTINCT r.id)
         FROM public.org_roles r
         JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
         WHERE r.deleted_at IS NULL
           AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
           AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
         GROUP BY r.id
         HAVING COUNT(DISTINCT p.archetype) = 4
        ) as roles_with_4,
        (SELECT COUNT(DISTINCT r.id) 
         FROM public.org_roles r
         WHERE r.deleted_at IS NULL
           AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
           AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
        ) as total_roles
) stats;

-- =====================================================================
-- SAMPLE PERSONAS (First 10)
-- =====================================================================

SELECT 
    '=== SAMPLE PERSONAS (First 10) ===' as section;

SELECT 
    p.name as persona_name,
    p.title as persona_title,
    r.name as role_name,
    p.archetype,
    p.seniority_level,
    p.years_of_experience,
    p.work_complexity_score,
    p.ai_maturity_score,
    p.technology_adoption,
    p.work_pattern
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
WHERE p.deleted_at IS NULL
  AND r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%' LIMIT 1)
ORDER BY r.name, p.archetype
LIMIT 10;

