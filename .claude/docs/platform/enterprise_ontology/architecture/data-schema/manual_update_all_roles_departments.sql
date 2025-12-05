-- =====================================================================
-- MANUAL UPDATE: All Roles to Departments (Handles Both Tenants)
-- Updates each role individually, one by one
-- =====================================================================

BEGIN;

-- Update each role individually using ILIKE for flexible matching
-- This handles both tenants and any name variations

-- =====================================================================
-- FIELD MEDICAL ROLES → Field Medical
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Field Medical Trainer';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Head of Field Medical';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Science Liaison';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Senior Medical Science Liaison';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'TA MSL Lead';

-- =====================================================================
-- MEDICAL INFORMATION ROLES → Medical Information
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Info Manager';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Info Specialist';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Librarian';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Senior Medical Info Specialist';

-- =====================================================================
-- MEDICAL COMMUNICATIONS ROLES → Medical Communications
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Head Medical Communications';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Communications Manager';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Education Director';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Training Manager';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Writer'
  AND r.name NOT ILIKE '%publication%'
  AND r.name NOT ILIKE '%regulatory%';

-- =====================================================================
-- MEDICAL PUBLICATIONS ROLES → Medical Publications
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Publications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Writer Publications';

-- =====================================================================
-- REGULATORY SUBMISSIONS ROLES → Regulatory Submissions
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Regulatory Submissions' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Writer Regulatory';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Regulatory Submissions' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Compliance Manager';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Regulatory Submissions' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Quality Manager';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Regulatory Submissions' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Head of Medical Excellence';

-- =====================================================================
-- MEDICAL STRATEGY & OPERATIONS ROLES → Medical Strategy & Operations
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Strategy & Operations' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Head of Medical Strategy';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Strategy & Operations' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Operations Manager';

-- =====================================================================
-- LEADERSHIP ROLES → Leadership
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Global Medical Advisor';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Regional Medical Director';

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Therapeutic Area Medical Director';

-- =====================================================================
-- CLINICAL OPERATIONS SUPPORT ROLES → Clinical Operations Support
-- =====================================================================

UPDATE public.org_roles r
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE r.deleted_at IS NULL
  AND r.department_id IS NULL
  AND r.tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND r.name ILIKE 'Medical Monitor';

-- =====================================================================
-- VERIFICATION
-- =====================================================================

SELECT 
    '=== VERIFICATION: Updated Roles ===' as section;

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    t.slug as tenant_slug,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND t.slug IN ('pharmaceuticals', 'pharma')
  AND (
    r.name ILIKE '%medical%'
  )
GROUP BY d.name, r.id, r.name, t.slug
ORDER BY d.name NULLS LAST, r.name;

-- Show any roles still without departments
SELECT 
    '=== ROLES STILL WITHOUT DEPARTMENTS ===' as section;

SELECT 
    t.slug as tenant_slug,
    r.name as role_name
FROM public.org_roles r
JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.deleted_at IS NULL
  AND t.slug IN ('pharmaceuticals', 'pharma')
  AND r.department_id IS NULL
  AND r.name ILIKE '%medical%'
ORDER BY t.slug, r.name;

COMMIT;

