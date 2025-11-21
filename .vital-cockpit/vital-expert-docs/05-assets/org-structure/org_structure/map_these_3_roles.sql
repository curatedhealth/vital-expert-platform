-- =====================================================================
-- MAP THE 3 ROLES TO THEIR FUNCTIONS AND DEPARTMENTS
-- Medical Affairs Director, Medical Information Manager, Medical Science Liaison
-- =====================================================================

BEGIN;

DO $$
DECLARE
    pharma_tenant_id uuid;
    medical_affairs_function_id uuid;
    field_medical_dept_id uuid;
    medical_info_dept_id uuid;
    medical_leadership_dept_id uuid;
    roles_updated INTEGER := 0;
    rec RECORD;
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;

    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;

    -- Get Medical Affairs function (try multiple variations)
    SELECT id INTO medical_affairs_function_id
    FROM public.org_functions
    WHERE tenant_id = pharma_tenant_id
      AND (
        name::text ILIKE '%Medical Affairs%' 
        OR name::text = 'Medical Affairs'
        OR name::text ILIKE '%Medical%'
        OR slug ILIKE '%medical-affairs%'
        OR slug ILIKE '%medical%'
      )
    ORDER BY 
        CASE 
            WHEN name::text = 'Medical Affairs' THEN 1
            WHEN name::text ILIKE '%Medical Affairs%' THEN 2
            WHEN name::text ILIKE '%Medical%' THEN 3
            ELSE 4
        END
    LIMIT 1;

    IF medical_affairs_function_id IS NULL THEN
        -- Show all available functions for debugging
        RAISE NOTICE 'Available functions in Pharmaceuticals tenant:';
        FOR rec IN 
            SELECT name, slug FROM public.org_functions 
            WHERE tenant_id = pharma_tenant_id 
            ORDER BY name
        LOOP
            RAISE NOTICE '  - % (slug: %)', rec.name, rec.slug;
        END LOOP;
        RAISE EXCEPTION 'Medical Affairs function not found. Available functions listed above.';
    END IF;

    RAISE NOTICE 'Medical Affairs Function ID: %', medical_affairs_function_id;

    -- Get departments under Medical Affairs
    SELECT id INTO field_medical_dept_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id
      AND (
        name ILIKE '%Field Medical%'
        OR slug ILIKE '%field-medical%'
      )
    LIMIT 1;

    SELECT id INTO medical_info_dept_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id
      AND (
        name ILIKE '%Medical Information%'
        OR slug ILIKE '%medical-information%'
      )
    LIMIT 1;

    SELECT id INTO medical_leadership_dept_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id
      AND (
        name ILIKE '%Medical Leadership%'
        OR name ILIKE '%Leadership%'
        OR slug ILIKE '%medical-leadership%'
        OR slug ILIKE '%leadership%'
      )
    LIMIT 1;

    RAISE NOTICE 'Field Medical Dept ID: %', field_medical_dept_id;
    RAISE NOTICE 'Medical Information Dept ID: %', medical_info_dept_id;
    RAISE NOTICE 'Medical Leadership Dept ID: %', medical_leadership_dept_id;
    RAISE NOTICE '';

    -- Map Medical Science Liaison to Field Medical
    IF field_medical_dept_id IS NOT NULL THEN
        UPDATE public.org_roles
        SET
            function_id = medical_affairs_function_id,
            department_id = field_medical_dept_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND name::text = 'Medical Science Liaison'
          AND function_id IS NULL;

        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        RAISE NOTICE 'Mapped Medical Science Liaison: % role(s) updated', roles_updated;
    ELSE
        RAISE NOTICE 'WARNING: Field Medical department not found';
    END IF;

    -- Map Medical Information Manager to Medical Information Services
    IF medical_info_dept_id IS NOT NULL THEN
        UPDATE public.org_roles
        SET
            function_id = medical_affairs_function_id,
            department_id = medical_info_dept_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND name::text = 'Medical Information Manager'
          AND function_id IS NULL;

        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        RAISE NOTICE 'Mapped Medical Information Manager: % role(s) updated', roles_updated;
    ELSE
        RAISE NOTICE 'WARNING: Medical Information department not found';
    END IF;

    -- Map Medical Affairs Director to Medical Leadership
    IF medical_leadership_dept_id IS NOT NULL THEN
        UPDATE public.org_roles
        SET
            function_id = medical_affairs_function_id,
            department_id = medical_leadership_dept_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND name::text = 'Medical Affairs Director'
          AND function_id IS NULL;

        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        RAISE NOTICE 'Mapped Medical Affairs Director: % role(s) updated', roles_updated;
    ELSE
        RAISE NOTICE 'WARNING: Medical Leadership department not found';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping complete.';
END $$;

COMMIT;

-- Now update personas to inherit from roles
UPDATE public.personas p
SET
    function_id = r.function_id,
    department_id = r.department_id,
    updated_at = NOW()
FROM public.org_roles r
WHERE p.role_id = r.id
  AND p.role_id IS NOT NULL
  AND (
    p.function_id IS NULL 
    OR p.department_id IS NULL
    OR p.function_id != r.function_id
    OR p.department_id != r.department_id
  );

-- Verification
SELECT 
    'FINAL_VERIFICATION' as section,
    p.name as persona_name,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name
FROM public.personas p
JOIN public.org_roles r ON p.role_id = r.id
LEFT JOIN public.org_functions f ON p.function_id = f.id
LEFT JOIN public.org_departments d ON p.department_id = d.id
WHERE p.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND p.role_id IS NOT NULL
AND (p.deleted_at IS NULL)
ORDER BY f.name, d.name, r.name;

