-- =====================================================================
-- VERIFY CURRENT STATISTICS - PHARMA TENANT ONLY
-- Breakdown by Function, Department, Roles, and Personas
-- =====================================================================

-- Get Pharmaceuticals tenant ID
WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)

-- =====================================================================
-- OVERALL STATISTICS - PHARMA TENANT
-- =====================================================================
SELECT 
    '=== OVERALL STATISTICS - PHARMA TENANT ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    (SELECT COUNT(*) FROM public.org_functions f, pharma_tenant pt WHERE f.tenant_id = pt.tenant_id AND f.deleted_at IS NULL) as total_functions,
    (SELECT COUNT(*) FROM public.org_departments d, pharma_tenant pt WHERE d.tenant_id = pt.tenant_id AND d.deleted_at IS NULL) as total_departments,
    (SELECT COUNT(*) FROM public.org_roles r, pharma_tenant pt WHERE (r.tenant_id = pt.tenant_id OR r.tenant_id IS NULL) AND r.deleted_at IS NULL) as total_roles,
    (SELECT COUNT(*) FROM public.personas p, pharma_tenant pt WHERE p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL) as total_personas,
    (SELECT COUNT(*) FROM public.org_roles r, pharma_tenant pt WHERE r.tenant_id = pt.tenant_id AND r.deleted_at IS NULL) as tenant_specific_roles,
    (SELECT COUNT(*) FROM public.org_roles r, pharma_tenant pt WHERE r.tenant_id IS NULL AND r.deleted_at IS NULL) as tenant_agnostic_roles_available;

-- =====================================================================
-- STATISTICS BY FUNCTION - PHARMA TENANT
-- =====================================================================
SELECT 
    '=== STATISTICS BY FUNCTION - PHARMA TENANT ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    f.id as function_id,
    f.name::text as function_name,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN r.tenant_id = pt.tenant_id THEN r.id END) as tenant_specific_roles,
    COUNT(DISTINCT CASE WHEN r.tenant_id IS NULL THEN r.id END) as tenant_agnostic_roles
FROM public.org_functions f
CROSS JOIN pharma_tenant pt
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.tenant_id = pt.tenant_id AND d.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.function_id = f.id AND (r.tenant_id = pt.tenant_id OR r.tenant_id IS NULL) AND r.deleted_at IS NULL
LEFT JOIN public.personas p ON p.function_id = f.id AND p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL
WHERE f.tenant_id = pt.tenant_id AND f.deleted_at IS NULL
GROUP BY f.id, f.name::text, pt.tenant_id
ORDER BY persona_count DESC, role_count DESC, department_count DESC, f.name::text;

-- =====================================================================
-- STATISTICS BY DEPARTMENT - PHARMA TENANT
-- =====================================================================
SELECT 
    '=== STATISTICS BY DEPARTMENT - PHARMA TENANT ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    d.id as department_id,
    d.name as department_name,
    f.name::text as function_name,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN r.tenant_id = pt.tenant_id THEN r.id END) as tenant_specific_roles,
    COUNT(DISTINCT CASE WHEN r.tenant_id IS NULL THEN r.id END) as tenant_agnostic_roles,
    COUNT(DISTINCT CASE WHEN p.role_id IS NOT NULL THEN p.id END) as personas_with_role,
    COUNT(DISTINCT CASE WHEN p.role_id IS NULL THEN p.id END) as personas_without_role
FROM public.org_departments d
CROSS JOIN pharma_tenant pt
LEFT JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND (r.tenant_id = pt.tenant_id OR r.tenant_id IS NULL) AND r.deleted_at IS NULL
LEFT JOIN public.personas p ON p.department_id = d.id AND p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL
WHERE d.tenant_id = pt.tenant_id AND d.deleted_at IS NULL
GROUP BY d.id, d.name, f.name::text, pt.tenant_id
ORDER BY persona_count DESC, role_count DESC, d.name;

-- =====================================================================
-- STATISTICS BY DEPARTMENT (SUMMARY) - PHARMA TENANT
-- =====================================================================
SELECT 
    '=== DEPARTMENT SUMMARY - PHARMA TENANT (Ordered by Persona Count) ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    d.name as department_name,
    f.name::text as function_name,
    COUNT(DISTINCT r.id) as role_count,
    COUNT(DISTINCT p.id) as persona_count,
    COUNT(DISTINCT CASE WHEN p.role_id IS NOT NULL THEN p.id END) as personas_with_role,
    COUNT(DISTINCT CASE WHEN p.role_id IS NULL THEN p.id END) as personas_without_role,
    COUNT(DISTINCT CASE WHEN r.tenant_id = pt.tenant_id THEN r.id END) as tenant_specific_roles,
    COUNT(DISTINCT CASE WHEN r.tenant_id IS NULL THEN r.id END) as tenant_agnostic_roles
FROM public.org_departments d
CROSS JOIN pharma_tenant pt
LEFT JOIN public.org_functions f ON d.function_id = f.id
LEFT JOIN public.org_roles r ON r.department_id = d.id AND (r.tenant_id = pt.tenant_id OR r.tenant_id IS NULL) AND r.deleted_at IS NULL
LEFT JOIN public.personas p ON p.department_id = d.id AND p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL
WHERE d.tenant_id = pt.tenant_id AND d.deleted_at IS NULL
GROUP BY d.name, f.name::text, pt.tenant_id
ORDER BY persona_count DESC, role_count DESC;

-- =====================================================================
-- STATISTICS BY ROLE - PHARMA TENANT
-- =====================================================================
SELECT 
    '=== STATISTICS BY ROLE - PHARMA TENANT (Ordered by Persona Count) ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    r.id as role_id,
    r.name as role_name,
    d.name as department_name,
    f.name::text as function_name,
    COUNT(DISTINCT p.id) as persona_count,
    CASE WHEN r.tenant_id IS NULL THEN 'Tenant-Agnostic' ELSE 'Tenant-Specific' END as role_type
FROM public.org_roles r
CROSS JOIN pharma_tenant pt
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND (r.tenant_id = pt.tenant_id OR r.tenant_id IS NULL)
GROUP BY r.id, r.name, d.name, f.name::text, r.tenant_id
ORDER BY persona_count DESC, r.name;

-- =====================================================================
-- PERSONA MAPPING STATISTICS - PHARMA TENANT
-- =====================================================================
SELECT 
    '=== PERSONA MAPPING STATISTICS - PHARMA TENANT ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    COUNT(*) as total_personas,
    COUNT(role_id) as personas_with_role,
    COUNT(function_id) as personas_with_function,
    COUNT(department_id) as personas_with_department,
    COUNT(CASE WHEN role_id IS NOT NULL AND function_id IS NOT NULL AND department_id IS NOT NULL THEN 1 END) as fully_mapped,
    COUNT(CASE WHEN role_id IS NULL AND function_id IS NULL AND department_id IS NULL THEN 1 END) as completely_unmapped,
    COUNT(CASE WHEN role_id IS NOT NULL AND (function_id IS NULL OR department_id IS NULL) THEN 1 END) as partially_mapped
FROM public.personas p
CROSS JOIN pharma_tenant pt
WHERE p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL;

-- =====================================================================
-- PHARMA TENANT DETAILED BREAKDOWN
-- =====================================================================
SELECT 
    '=== PHARMA TENANT DETAILED BREAKDOWN ===' as section;

WITH pharma_tenant AS (
    SELECT id as tenant_id, name as tenant_name, slug as tenant_slug
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
SELECT 
    pt.tenant_id,
    pt.tenant_name,
    pt.tenant_slug,
    COUNT(DISTINCT f.id) as function_count,
    COUNT(DISTINCT d.id) as department_count,
    COUNT(DISTINCT CASE WHEN r.tenant_id = pt.tenant_id THEN r.id END) as tenant_specific_roles,
    COUNT(DISTINCT CASE WHEN r.tenant_id IS NULL THEN r.id END) as tenant_agnostic_roles_available,
    COUNT(DISTINCT p.id) as persona_count
FROM pharma_tenant pt
LEFT JOIN public.org_functions f ON f.tenant_id = pt.tenant_id AND f.deleted_at IS NULL
LEFT JOIN public.org_departments d ON d.tenant_id = pt.tenant_id AND d.deleted_at IS NULL
LEFT JOIN public.org_roles r ON (r.tenant_id = pt.tenant_id OR r.tenant_id IS NULL) AND r.deleted_at IS NULL
LEFT JOIN public.personas p ON p.tenant_id = pt.tenant_id AND p.deleted_at IS NULL
GROUP BY pt.tenant_id, pt.tenant_name, pt.tenant_slug;

-- =====================================================================
-- DUPLICATE ROLES STATISTICS
-- =====================================================================
SELECT 
    '=== DUPLICATE ROLES STATISTICS ===' as section;

SELECT 
    COUNT(DISTINCT r.name) as unique_role_names,
    COUNT(*) as total_roles,
    COUNT(DISTINCT r.tenant_id) as unique_tenants,
    COUNT(CASE WHEN r.tenant_id IS NULL THEN 1 END) as tenant_agnostic_roles,
    COUNT(CASE WHEN r.deleted_at IS NOT NULL THEN 1 END) as deleted_roles,
    COUNT(*) - COUNT(DISTINCT r.name) as duplicate_instances
FROM public.org_roles r;

-- Roles duplicated across tenants
SELECT 
    '=== ROLES DUPLICATED ACROSS TENANTS ===' as section;

SELECT 
    r.name as role_name,
    COUNT(DISTINCT r.tenant_id) as tenant_count,
    COUNT(DISTINCT r.id) as role_instance_count,
    COUNT(DISTINCT CASE WHEN r.tenant_id IS NULL THEN r.id END) as tenant_agnostic_count,
    SUM(COALESCE(persona_counts.persona_count, 0)) as total_personas,
    STRING_AGG(DISTINCT COALESCE(t.name, 'Tenant-Agnostic'), ', ' ORDER BY COALESCE(t.name, 'Tenant-Agnostic')) as tenant_names
FROM public.org_roles r
LEFT JOIN public.tenants t ON r.tenant_id = t.id
LEFT JOIN (
    SELECT role_id, COUNT(*) as persona_count
    FROM public.personas
    WHERE deleted_at IS NULL
    GROUP BY role_id
) persona_counts ON persona_counts.role_id = r.id
WHERE r.deleted_at IS NULL
GROUP BY r.name
HAVING COUNT(DISTINCT r.tenant_id) > 1 OR COUNT(DISTINCT CASE WHEN r.tenant_id IS NULL THEN r.id END) > 0
ORDER BY tenant_count DESC, role_instance_count DESC, total_personas DESC
LIMIT 30;

