-- =====================================================================
-- FIX: Update Medical Affairs Roles to have correct function_id
-- These roles should be in Medical Affairs function, not Regulatory
-- =====================================================================

BEGIN;

-- Update all Medical Affairs roles to point to Medical Affairs function
UPDATE public.org_roles r
SET function_id = (
    SELECT id FROM public.org_functions 
    WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%')
      AND deleted_at IS NULL
    LIMIT 1
),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.name ILIKE '%medical affairs%'
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND (
    -- Only update if currently pointing to Regulatory or NULL
    r.function_id IN (
      SELECT id FROM public.org_functions 
      WHERE name::text ILIKE '%regulatory%' AND deleted_at IS NULL
    )
    OR r.function_id IS NULL
  );

-- Also update Medical Affairs Director if it has NULL function
UPDATE public.org_roles r
SET function_id = (
    SELECT id FROM public.org_functions 
    WHERE (name::text ILIKE '%medical%affairs%' OR name::text ILIKE '%medical affairs%')
      AND deleted_at IS NULL
    LIMIT 1
),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.name = 'Medical Affairs Director'
  AND r.function_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'));

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
    '=== VERIFICATION: Medical Affairs Roles Function ===' as section;

SELECT 
    r.name as role_name,
    d.name as department_name,
    f.name::text as function_name,
    CASE 
        WHEN f.name::text ILIKE '%medical%affairs%' OR f.name::text ILIKE '%medical affairs%' THEN '✅ CORRECT - Medical Affairs Function'
        WHEN f.name::text ILIKE '%regulatory%' THEN '❌ WRONG - Regulatory Function'
        WHEN f.name IS NULL THEN '⚠️ No Function'
        ELSE '❓ Unknown Function'
    END as status
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.name ILIKE '%medical affairs%'
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
ORDER BY r.name;

COMMIT;

