-- =====================================================================
-- ROOT CAUSE ANALYSIS: Why departments weren't updated
-- =====================================================================

-- Step 1: Check if roles exist with exact names
SELECT '=== CHECKING IF ROLES EXIST ===' as section;

SELECT 
    r.id,
    r.name as role_name,
    r.department_id,
    d.name as current_department,
    r.tenant_id,
    t.name as tenant_name
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.name IN (
    'Field Medical Trainer',
    'Global Medical Advisor',
    'Head Medical Communications',
    'Head of Field Medical',
    'Head of Medical Excellence',
    'Head of Medical Strategy',
    'Medical Communications Manager',
    'Medical Compliance Manager',
    'Medical Education Director',
    'Medical Info Manager',
    'Medical Info Specialist',
    'Medical Librarian',
    'Medical Monitor',
    'Medical Operations Manager',
    'Medical Quality Manager',
    'Medical Science Liaison',
    'Medical Training Manager',
    'Medical Writer',
    'Medical Writer Publications',
    'Medical Writer Regulatory',
    'Regional Medical Director',
    'Senior Medical Info Specialist',
    'Senior Medical Science Liaison',
    'TA MSL Lead',
    'Therapeutic Area Medical Director'
  )
ORDER BY r.name;

-- Step 2: Check what department names actually exist
SELECT '=== CHECKING DEPARTMENT NAMES ===' as section;

SELECT 
    id,
    name as department_name
FROM public.org_departments
WHERE deleted_at IS NULL
  AND (
    name ILIKE '%field medical%'
    OR name ILIKE '%medical information%'
    OR name ILIKE '%medical communication%'
    OR name ILIKE '%medical publication%'
    OR name ILIKE '%regulatory submission%'
    OR name ILIKE '%medical strategy%'
    OR name ILIKE '%leadership%'
    OR name ILIKE '%clinical operations support%'
  )
ORDER BY name;

-- Step 3: Check if roles exist but with different names (fuzzy match)
SELECT '=== CHECKING FOR SIMILAR ROLE NAMES ===' as section;

SELECT 
    r.id,
    r.name as role_name,
    r.department_id,
    d.name as current_department
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.department_id IS NULL
  AND (
    r.name ILIKE '%field medical%'
    OR r.name ILIKE '%medical science liaison%'
    OR r.name ILIKE '%medical info%'
    OR r.name ILIKE '%medical librarian%'
    OR r.name ILIKE '%medical communication%'
    OR r.name ILIKE '%medical writer%'
    OR r.name ILIKE '%medical monitor%'
    OR r.name ILIKE '%medical operations%'
    OR r.name ILIKE '%medical quality%'
    OR r.name ILIKE '%medical compliance%'
    OR r.name ILIKE '%medical excellence%'
    OR r.name ILIKE '%medical strategy%'
    OR r.name ILIKE '%medical education%'
    OR r.name ILIKE '%medical training%'
    OR r.name ILIKE '%global medical%'
    OR r.name ILIKE '%regional medical%'
    OR r.name ILIKE '%therapeutic area medical%'
    OR r.name ILIKE '%ta msl%'
  )
ORDER BY r.name;

-- Step 4: Check tenant lookup
SELECT '=== CHECKING TENANT LOOKUP ===' as section;

SELECT 
    id,
    name,
    slug
FROM public.tenants
WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%';

