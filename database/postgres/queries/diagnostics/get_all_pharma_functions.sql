-- =====================================================================
-- GET ALL PHARMA TENANT FUNCTIONS
-- Returns all functions with ID and name
-- =====================================================================

-- Diagnostic: Check if tenant exists
SELECT 
    '=== DIAGNOSTIC: Pharma Tenant Lookup ===' as section;

SELECT 
    id as tenant_id,
    name as tenant_name,
    slug as tenant_slug
FROM public.tenants 
WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
ORDER BY 
    CASE WHEN slug = 'pharmaceuticals' THEN 1 ELSE 2 END
LIMIT 5;

-- Main Query: Get all functions
SELECT 
    '=== ALL PHARMA FUNCTIONS ===' as section;

SELECT 
    f.id as function_id,
    f.name::text as function_name
FROM public.org_functions f
WHERE f.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND (f.deleted_at IS NULL)
ORDER BY f.name::text;

-- Alternative: If tenant lookup fails, try without tenant filter to see all functions
SELECT 
    '=== ALTERNATIVE: All Functions (if tenant filter returns nothing) ===' as section;

SELECT 
    f.id as function_id,
    f.name::text as function_name,
    f.tenant_id,
    t.name as tenant_name,
    t.slug as tenant_slug
FROM public.org_functions f
LEFT JOIN public.tenants t ON f.tenant_id = t.id
WHERE (f.deleted_at IS NULL)
ORDER BY t.name, f.name::text
LIMIT 50;

