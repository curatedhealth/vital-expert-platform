-- =====================================================================
-- CHECK ALL PHARMA ROLES (with and without personas)
-- =====================================================================

-- Get pharma tenant ID
DO $$
DECLARE
    pharma_tenant_id UUID;
BEGIN
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
END $$;

-- =====================================================================
-- ALL PHARMA ROLES (with persona counts)
-- =====================================================================

SELECT 
    '=== ALL PHARMA ROLES ===' as section;

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.function_id,
    f.name as function_name,
    r.department_id,
    d.name as department_name,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT p.archetype) as unique_archetypes,
    STRING_AGG(DISTINCT p.archetype::text, ', ' ORDER BY p.archetype::text) as existing_archetypes,
    CASE 
        WHEN COUNT(DISTINCT p.id) = 0 THEN '❌ No personas'
        WHEN COUNT(DISTINCT p.archetype) = 4 THEN '✅ Complete (4 archetypes)'
        WHEN COUNT(DISTINCT p.archetype) = 3 THEN '⚠️ Missing 1 archetype'
        WHEN COUNT(DISTINCT p.archetype) = 2 THEN '⚠️ Missing 2 archetypes'
        WHEN COUNT(DISTINCT p.archetype) = 1 THEN '⚠️ Missing 3 archetypes'
        ELSE '⚠️ Incomplete'
    END as status
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
GROUP BY r.id, r.name, r.function_id, f.name, r.department_id, d.name
ORDER BY persona_count DESC, r.name
LIMIT 100;

-- =====================================================================
-- SUMMARY STATISTICS
-- =====================================================================

SELECT 
    '=== SUMMARY STATISTICS ===' as section;

SELECT 
    (SELECT COUNT(*) FROM public.org_roles r 
     WHERE r.deleted_at IS NULL 
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
    ) as total_pharma_roles,
    
    (SELECT COUNT(DISTINCT r.id) 
     FROM public.org_roles r
     LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND p.id IS NOT NULL
    ) as roles_with_personas,
    
    (SELECT COUNT(DISTINCT r.id) 
     FROM public.org_roles r
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
       AND NOT EXISTS (SELECT 1 FROM public.personas p WHERE p.role_id = r.id AND p.deleted_at IS NULL)
    ) as roles_without_personas,
    
    (SELECT COUNT(DISTINCT r.id)
     FROM public.org_roles r
     JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
     WHERE r.deleted_at IS NULL
       AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
     GROUP BY r.id
     HAVING COUNT(DISTINCT p.archetype) = 4
    ) as roles_with_4_archetypes;

-- =====================================================================
-- ROLES WITHOUT ANY PERSONAS
-- =====================================================================

SELECT 
    '=== ROLES WITHOUT PERSONAS ===' as section;

SELECT 
    r.id as role_id,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name,
    (SELECT COUNT(*) FROM public.personas p WHERE p.role_id = r.id AND p.deleted_at IS NULL) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM public.personas p WHERE p.role_id = r.id AND p.deleted_at IS NULL)
ORDER BY r.name
LIMIT 50;

