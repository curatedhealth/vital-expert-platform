-- =====================================================================
-- FIX: Map All Remaining Roles Without Departments
-- =====================================================================

BEGIN;

-- =====================================================================
-- FIELD MEDICAL ROLES → Field Medical
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Field Medical Trainer', 'Head of Field Medical', 'Medical Science Liaison', 'Senior Medical Science Liaison', 'TA MSL Lead');

-- =====================================================================
-- MEDICAL INFORMATION ROLES → Medical Information
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Medical Info Manager', 'Medical Info Specialist', 'Medical Librarian', 'Senior Medical Info Specialist');

-- =====================================================================
-- MEDICAL COMMUNICATIONS ROLES → Medical Communications
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Head Medical Communications', 'Medical Communications Manager', 'Medical Education Director', 'Medical Training Manager', 'Medical Writer');

-- =====================================================================
-- MEDICAL PUBLICATIONS ROLES → Medical Publications
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Publications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name = 'Medical Writer Publications';

-- =====================================================================
-- MEDICAL EXCELLENCE & GOVERNANCE ROLES
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Excellence & Governance' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Head of Medical Excellence', 'Medical Compliance Manager', 'Medical Quality Manager', 'Medical Writer Regulatory');

-- =====================================================================
-- MEDICAL STRATEGY & OPERATIONS ROLES
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Strategy & Operations' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Head of Medical Strategy', 'Medical Operations Manager');

-- =====================================================================
-- LEADERSHIP ROLES → Leadership
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Global Medical Advisor', 'Regional Medical Director', 'Therapeutic Area Medical Director');

-- =====================================================================
-- CLINICAL OPERATIONS SUPPORT ROLES
-- =====================================================================

UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name = 'Medical Monitor';

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
    '=== VERIFICATION: All Roles with Departments ===' as section;

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE '%medical%'
GROUP BY d.name, r.id, r.name
ORDER BY d.name NULLS LAST, r.name;

-- Show any roles still without departments
SELECT 
    '=== ROLES STILL WITHOUT DEPARTMENTS ===' as section;

SELECT 
    r.name as role_name
FROM public.org_roles r
WHERE r.deleted_at IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.department_id IS NULL
  AND r.name ILIKE '%medical%'
ORDER BY r.name;

COMMIT;

