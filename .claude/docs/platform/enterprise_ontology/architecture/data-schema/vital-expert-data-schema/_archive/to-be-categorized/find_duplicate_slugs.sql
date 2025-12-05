-- =============================================
-- Find and Fix Duplicate Slugs
-- Before applying unique constraints
-- =============================================

-- 1. Find duplicate slugs in org_functions
SELECT 
    '=== DUPLICATE FUNCTION SLUGS ===' as section;

SELECT 
    slug,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at) as function_ids,
    ARRAY_AGG(name ORDER BY created_at) as function_names,
    ARRAY_AGG(tenant_id::text ORDER BY created_at) as tenant_ids
FROM public.org_functions
WHERE deleted_at IS NULL
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Find duplicate slugs in org_departments
SELECT 
    '=== DUPLICATE DEPARTMENT SLUGS ===' as section;

SELECT 
    slug,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at) as department_ids,
    ARRAY_AGG(name ORDER BY created_at) as department_names,
    ARRAY_AGG(tenant_id::text ORDER BY created_at) as tenant_ids,
    ARRAY_AGG((SELECT COUNT(*) FROM org_roles WHERE department_id = org_departments.id AND deleted_at IS NULL) ORDER BY created_at) as role_counts
FROM public.org_departments
WHERE deleted_at IS NULL
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 3. Find duplicate slugs in org_roles
SELECT 
    '=== DUPLICATE ROLE SLUGS ===' as section;

SELECT 
    slug,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at) as role_ids,
    ARRAY_AGG(name ORDER BY created_at) as role_names,
    ARRAY_AGG(tenant_id::text ORDER BY created_at) as tenant_ids,
    ARRAY_AGG((SELECT COUNT(*) FROM personas WHERE role_id = org_roles.id AND deleted_at IS NULL) ORDER BY created_at) as persona_counts
FROM public.org_roles
WHERE deleted_at IS NULL
GROUP BY slug
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 4. Count total duplicates
SELECT 
    '=== SUMMARY ===' as section;

SELECT 
    'Functions' as entity_type,
    COUNT(DISTINCT slug) as duplicate_slug_count,
    SUM(cnt - 1) as extra_records_to_clean
FROM (
    SELECT slug, COUNT(*) as cnt
    FROM public.org_functions
    WHERE deleted_at IS NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
) f
UNION ALL
SELECT 
    'Departments' as entity_type,
    COUNT(DISTINCT slug) as duplicate_slug_count,
    SUM(cnt - 1) as extra_records_to_clean
FROM (
    SELECT slug, COUNT(*) as cnt
    FROM public.org_departments
    WHERE deleted_at IS NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
) d
UNION ALL
SELECT 
    'Roles' as entity_type,
    COUNT(DISTINCT slug) as duplicate_slug_count,
    SUM(cnt - 1) as extra_records_to_clean
FROM (
    SELECT slug, COUNT(*) as cnt
    FROM public.org_roles
    WHERE deleted_at IS NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
) r;

