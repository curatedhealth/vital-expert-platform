-- =====================================================================
-- FORCE UPDATE: Map Each Role to Its Department (One by One)
-- =====================================================================

BEGIN;

DO $$
DECLARE
    role_id_var UUID;
    dept_id_var UUID;
    pharma_tenant_id UUID;
    updated_count INTEGER := 0;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    -- =====================================================================
    -- FIELD MEDICAL ROLES
    -- =====================================================================
    
    -- Field Medical Trainer → Field Medical
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Field Medical Trainer' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Field Medical' AND d.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Field Medical Trainer → Field Medical';
    END IF;
    
    -- Head of Field Medical → Field Medical
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Head of Field Medical' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Head of Field Medical → Field Medical';
    END IF;
    
    -- Medical Science Liaison → Field Medical
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Science Liaison' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Science Liaison → Field Medical';
    END IF;
    
    -- Senior Medical Science Liaison → Field Medical
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Senior Medical Science Liaison' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Senior Medical Science Liaison → Field Medical';
    END IF;
    
    -- TA MSL Lead → Field Medical
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'TA MSL Lead' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: TA MSL Lead → Field Medical';
    END IF;
    
    -- =====================================================================
    -- MEDICAL INFORMATION ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Medical Information' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Medical Info Manager → Medical Information
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Info Manager' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Info Manager → Medical Information';
    END IF;
    
    -- Medical Info Specialist → Medical Information
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Info Specialist' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Info Specialist → Medical Information';
    END IF;
    
    -- Medical Librarian → Medical Information
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Librarian' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Librarian → Medical Information';
    END IF;
    
    -- Senior Medical Info Specialist → Medical Information
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Senior Medical Info Specialist' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Senior Medical Info Specialist → Medical Information';
    END IF;
    
    -- =====================================================================
    -- MEDICAL COMMUNICATIONS ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Medical Communications' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Head Medical Communications → Medical Communications
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Head Medical Communications' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Head Medical Communications → Medical Communications';
    END IF;
    
    -- Medical Communications Manager → Medical Communications
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Communications Manager' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Communications Manager → Medical Communications';
    END IF;
    
    -- Medical Education Director → Medical Communications
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Education Director' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Education Director → Medical Communications';
    END IF;
    
    -- Medical Training Manager → Medical Communications
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Training Manager' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Training Manager → Medical Communications';
    END IF;
    
    -- Medical Writer → Medical Communications
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Writer' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Writer → Medical Communications';
    END IF;
    
    -- =====================================================================
    -- MEDICAL PUBLICATIONS ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Medical Publications' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Medical Writer Publications → Medical Publications
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Writer Publications' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Writer Publications → Medical Publications';
    END IF;
    
    -- =====================================================================
    -- REGULATORY SUBMISSIONS ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Regulatory Submissions' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Medical Writer Regulatory → Regulatory Submissions
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Writer Regulatory' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Writer Regulatory → Regulatory Submissions';
    END IF;
    
    -- Medical Compliance Manager → Regulatory Submissions
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Compliance Manager' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Compliance Manager → Regulatory Submissions';
    END IF;
    
    -- Medical Quality Manager → Regulatory Submissions
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Quality Manager' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Quality Manager → Regulatory Submissions';
    END IF;
    
    -- Head of Medical Excellence → Regulatory Submissions
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Head of Medical Excellence' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Head of Medical Excellence → Regulatory Submissions';
    END IF;
    
    -- =====================================================================
    -- MEDICAL STRATEGY & OPERATIONS ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Medical Strategy & Operations' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Head of Medical Strategy → Medical Strategy & Operations
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Head of Medical Strategy' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Head of Medical Strategy → Medical Strategy & Operations';
    END IF;
    
    -- Medical Operations Manager → Medical Strategy & Operations
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Operations Manager' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Operations Manager → Medical Strategy & Operations';
    END IF;
    
    -- =====================================================================
    -- LEADERSHIP ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Leadership' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Global Medical Advisor → Leadership
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Global Medical Advisor' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Global Medical Advisor → Leadership';
    END IF;
    
    -- Regional Medical Director → Leadership
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Regional Medical Director' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Regional Medical Director → Leadership';
    END IF;
    
    -- Therapeutic Area Medical Director → Leadership
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Therapeutic Area Medical Director' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Therapeutic Area Medical Director → Leadership';
    END IF;
    
    -- =====================================================================
    -- CLINICAL OPERATIONS SUPPORT ROLES
    -- =====================================================================
    
    SELECT d.id INTO dept_id_var FROM public.org_departments d WHERE d.name = 'Clinical Operations Support' AND d.deleted_at IS NULL LIMIT 1;
    
    -- Medical Monitor → Clinical Operations Support
    SELECT r.id INTO role_id_var FROM public.org_roles r WHERE r.name = 'Medical Monitor' AND r.tenant_id = pharma_tenant_id AND r.deleted_at IS NULL LIMIT 1;
    IF role_id_var IS NOT NULL AND dept_id_var IS NOT NULL THEN
        UPDATE public.org_roles SET department_id = dept_id_var, updated_at = NOW() WHERE id = role_id_var;
        updated_count := updated_count + 1;
        RAISE NOTICE 'Updated: Medical Monitor → Clinical Operations Support';
    END IF;
    
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Total roles updated: %', updated_count;
END $$;

-- Verify all roles now have departments
SELECT 
    '=== VERIFICATION: Roles with Departments ===' as section;

SELECT 
    COALESCE(d.name, 'No Department') as department_name,
    r.name as role_name,
    COUNT(p.id) as persona_count
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.personas p ON p.role_id = r.id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND (
    r.name ILIKE '%medical%'
    OR r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%' LIMIT 1)
  )
GROUP BY d.name, r.id, r.name
ORDER BY d.name NULLS LAST, r.name;

-- Show any roles still without departments
SELECT 
    '=== ROLES STILL WITHOUT DEPARTMENTS ===' as section;

SELECT 
    r.name as role_name,
    f.name::text as function_name
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
WHERE r.deleted_at IS NULL
  AND r.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%' LIMIT 1)
  AND r.department_id IS NULL
  AND (
    r.name ILIKE '%medical%'
    OR r.function_id = (SELECT id FROM public.org_functions WHERE name::text ILIKE '%medical%' LIMIT 1)
  )
ORDER BY r.name;

COMMIT;

