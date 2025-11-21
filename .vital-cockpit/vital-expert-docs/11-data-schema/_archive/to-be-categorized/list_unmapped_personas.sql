-- =====================================================================
-- LIST ALL UNMAPPED PERSONAS (Missing role, function, and department)
-- Returns persona ID and name for the 279 personas that need mapping
-- =====================================================================

-- =====================================================================
-- ALL UNMAPPED PERSONAS (JSON Format)
-- =====================================================================
SELECT 
    json_agg(
        json_build_object(
            'id', p.id,
            'name', p.name,
            'slug', p.slug,
            'title', p.title,
            'created_at', p.created_at
        )
        ORDER BY p.name
    ) as unmapped_personas
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

-- =====================================================================
-- ALL UNMAPPED PERSONAS (Table Format - Easy to Read)
-- =====================================================================
SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.slug as persona_slug,
    p.title as persona_title,
    p.created_at,
    p.updated_at
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL
ORDER BY p.name;

-- =====================================================================
-- COUNT VERIFICATION
-- =====================================================================
SELECT 
    '=== VERIFICATION ===' as section;

SELECT 
    COUNT(*) as total_unmapped_personas,
    'Personas missing role_id, function_id, and department_id' as description
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

-- =====================================================================
-- UNMAPPED PERSONAS GROUPED BY TENANT (if multiple tenants)
-- =====================================================================
SELECT 
    '=== UNMAPPED PERSONAS BY TENANT ===' as section;

SELECT 
    t.name as tenant_name,
    t.slug as tenant_slug,
    COUNT(*) as unmapped_count
FROM public.personas p
INNER JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL
GROUP BY t.id, t.name, t.slug
ORDER BY unmapped_count DESC;

-- =====================================================================
-- EXPORT FORMAT: Simple JSON Array (for easy copy-paste)
-- =====================================================================
SELECT 
    '=== SIMPLE JSON ARRAY (Copy this) ===' as section;

SELECT 
    json_agg(
        json_build_object(
            'id', p.id::text,
            'name', p.name
        )
        ORDER BY p.name
    )::text as json_output
FROM public.personas p
WHERE p.deleted_at IS NULL
  AND p.role_id IS NULL
  AND p.function_id IS NULL
  AND p.department_id IS NULL;

