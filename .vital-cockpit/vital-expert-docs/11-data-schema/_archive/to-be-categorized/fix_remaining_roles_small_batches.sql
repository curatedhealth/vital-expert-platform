-- =====================================================================
-- FIX REMAINING ROLES: Small Batches (Run Each Batch Separately)
-- =====================================================================

-- =====================================================================
-- BATCH 1: Field Medical (5 roles)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Field Medical' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Field Medical Trainer', 'Head of Field Medical', 'Medical Science Liaison', 'Senior Medical Science Liaison', 'TA MSL Lead');

-- =====================================================================
-- BATCH 2: Medical Information (4 roles)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Information' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Medical Info Manager', 'Medical Info Specialist', 'Medical Librarian', 'Senior Medical Info Specialist');

-- =====================================================================
-- BATCH 3: Medical Communications (5 roles)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Communications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Head Medical Communications', 'Medical Communications Manager', 'Medical Education Director', 'Medical Training Manager', 'Medical Writer');

-- =====================================================================
-- BATCH 4: Medical Publications (1 role)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Publications' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name = 'Medical Writer Publications';

-- =====================================================================
-- BATCH 5: Medical Excellence & Governance (4 roles)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Excellence & Governance' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Head of Medical Excellence', 'Medical Compliance Manager', 'Medical Quality Manager', 'Medical Writer Regulatory');

-- =====================================================================
-- BATCH 6: Medical Strategy & Operations (2 roles)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Medical Strategy & Operations' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Head of Medical Strategy', 'Medical Operations Manager');

-- =====================================================================
-- BATCH 7: Leadership (3 roles)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Leadership' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name IN ('Global Medical Advisor', 'Regional Medical Director', 'Therapeutic Area Medical Director');

-- =====================================================================
-- BATCH 8: Clinical Operations Support (1 role)
-- =====================================================================
UPDATE public.org_roles 
SET department_id = (SELECT id FROM public.org_departments WHERE name = 'Clinical Operations Support' AND deleted_at IS NULL LIMIT 1),
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND department_id IS NULL
  AND tenant_id IN (SELECT id FROM public.tenants WHERE slug IN ('pharmaceuticals', 'pharma'))
  AND name = 'Medical Monitor';

-- =====================================================================
-- VERIFICATION (Run after all batches)
-- =====================================================================
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

