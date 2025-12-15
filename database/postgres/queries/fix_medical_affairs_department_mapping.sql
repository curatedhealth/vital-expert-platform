-- =====================================================================
-- FIX: Remap Medical Affairs Roles from Regulatory to Medical Affairs Departments
-- =====================================================================

BEGIN;

-- First, let's see what Medical Affairs departments exist
-- Then remap the roles correctly

-- =====================================================================
-- REMOVE INCORRECT MAPPINGS (Regulatory Affairs departments)
-- =====================================================================

-- Medical Affairs Director should be in Medical Affairs Leadership, not Regulatory Leadership
UPDATE public.org_roles r
SET department_id = NULL,
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.name = 'Medical Affairs Director'
  AND r.department_id IN (
    SELECT id FROM public.org_departments 
    WHERE name ILIKE '%regulatory%' 
    AND deleted_at IS NULL
  );

-- Medical Affairs roles should be in Medical Affairs departments, not Regulatory Submissions
UPDATE public.org_roles r
SET department_id = NULL,
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.name IN (
    'Medical Affairs Compliance Officer',
    'Medical Affairs Operations Manager',
    'Medical Affairs Strategist',
    'Medical Editor',
    'Medical Excellence Director',
    'Medical QA Manager',
    'Medical Review Committee Coordinator'
  )
  AND r.department_id IN (
    SELECT id FROM public.org_departments 
    WHERE name ILIKE '%regulatory%' 
    AND deleted_at IS NULL
  );

-- =====================================================================
-- MAP TO CORRECT MEDICAL AFFAIRS DEPARTMENTS
-- =====================================================================

-- Medical Affairs Director → Leadership (Medical Affairs)
UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name = 'Medical Affairs Director'
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'));

-- Medical Excellence Director → Medical Excellence & Governance (if exists) or Leadership
UPDATE public.org_roles r
SET department_id = COALESCE(
    (SELECT id FROM public.org_departments WHERE name ILIKE '%medical excellence%' AND deleted_at IS NULL LIMIT 1),
    (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1)
),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name = 'Medical Excellence Director'
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'));

-- Medical Affairs Compliance Officer, QA Manager, Review Committee Coordinator → Medical Excellence & Governance
UPDATE public.org_roles r
SET department_id = COALESCE(
    (SELECT id FROM public.org_departments WHERE name ILIKE '%medical excellence%' AND deleted_at IS NULL LIMIT 1),
    (SELECT id FROM public.org_departments WHERE name ILIKE '%medical governance%' AND deleted_at IS NULL LIMIT 1),
    (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1)
),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name IN ('Medical Affairs Compliance Officer', 'Medical QA Manager', 'Medical Review Committee Coordinator')
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'));

-- Medical Affairs Operations Manager, Strategist → Medical Strategy & Operations
UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Strategy & Operations' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name IN ('Medical Affairs Operations Manager', 'Medical Affairs Strategist')
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'));

-- Medical Editor → Medical Communications (if it's for medical content) or Medical Publications
UPDATE public.org_roles r
SET department_id = COALESCE(
    (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    (SELECT id FROM public.org_departments WHERE name = 'Medical Publications' AND deleted_at IS NULL LIMIT 1)
),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.name = 'Medical Editor'
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'));

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
    '=== VERIFICATION: Medical Affairs Roles ===' as section;

SELECT 
    r.name as role_name,
    d.name as department_name,
    f.name::text as function_name,
    CASE 
        WHEN d.name ILIKE '%regulatory%' THEN '❌ WRONG - Regulatory Affairs'
        WHEN d.name ILIKE '%medical%' OR d.name ILIKE '%field medical%' OR d.name ILIKE '%leadership%' OR d.name ILIKE '%clinical%' OR d.name ILIKE '%heor%' OR d.name ILIKE '%evidence%' THEN '✅ CORRECT - Medical Affairs'
        WHEN d.name IS NULL THEN '⚠️ No Department'
        ELSE '❓ Unknown'
    END as status
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.name ILIKE '%medical affairs%'
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
ORDER BY r.name;

COMMIT;

