-- =====================================================================
-- MAP ROLES TO FUNCTIONS AND DEPARTMENTS FIRST
-- This must be run BEFORE fixing personas
-- Maps roles like "Medical Science Liaison", "Medical Information Manager", etc.
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
        OR name::text ILIKE '%Medical%'
        OR slug ILIKE '%medical-affairs%'
        OR slug ILIKE '%medical%'
      )
    ORDER BY 
        CASE 
            WHEN name::text ILIKE '%Medical Affairs%' THEN 1
            WHEN name::text ILIKE '%Medical%' THEN 2
            ELSE 3
        END
    LIMIT 1;

    IF medical_affairs_function_id IS NULL THEN
        -- Show available functions for debugging
        RAISE NOTICE 'Available functions:';
        FOR rec IN 
            SELECT name, slug FROM public.org_functions 
            WHERE tenant_id = pharma_tenant_id 
            ORDER BY name
        LOOP
            RAISE NOTICE '  - % (slug: %)', rec.name, rec.slug;
        END LOOP;
        RAISE EXCEPTION 'Medical Affairs function not found. Please check available functions above.';
    END IF;

    -- Get departments
    SELECT id INTO field_medical_dept_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id
      AND (name ILIKE '%Field Medical%' OR slug ILIKE '%field-medical%')
    LIMIT 1;

    SELECT id INTO medical_info_dept_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id
      AND (name ILIKE '%Medical Information%' OR slug ILIKE '%medical-information%')
    LIMIT 1;

    SELECT id INTO medical_leadership_dept_id
    FROM public.org_departments
    WHERE tenant_id = pharma_tenant_id
      AND function_id = medical_affairs_function_id
      AND (name ILIKE '%Medical Leadership%' OR slug ILIKE '%medical-leadership%')
    LIMIT 1;

    RAISE NOTICE 'Medical Affairs Function ID: %', medical_affairs_function_id;
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
          AND name::text ILIKE '%Medical Science Liaison%'
          AND (function_id IS NULL OR department_id IS NULL);

        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        RAISE NOTICE 'Mapped Medical Science Liaison roles: %', roles_updated;
    END IF;

    -- Map Medical Information Manager to Medical Information Services
    IF medical_info_dept_id IS NOT NULL THEN
        UPDATE public.org_roles
        SET
            function_id = medical_affairs_function_id,
            department_id = medical_info_dept_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND name::text ILIKE '%Medical Information Manager%'
          AND (function_id IS NULL OR department_id IS NULL);

        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        RAISE NOTICE 'Mapped Medical Information Manager roles: %', roles_updated;
    END IF;

    -- Map Medical Affairs Director to Medical Leadership
    IF medical_leadership_dept_id IS NOT NULL THEN
        UPDATE public.org_roles
        SET
            function_id = medical_affairs_function_id,
            department_id = medical_leadership_dept_id,
            updated_at = NOW()
        WHERE tenant_id = pharma_tenant_id
          AND name::text ILIKE '%Medical Affairs Director%'
          AND (function_id IS NULL OR department_id IS NULL);

        GET DIAGNOSTICS roles_updated = ROW_COUNT;
        RAISE NOTICE 'Mapped Medical Affairs Director roles: %', roles_updated;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Role mapping complete. Now run fix_persona_mappings_comprehensive.sql';
END $$;

COMMIT;

-- Verify roles are mapped
SELECT 
    'VERIFICATION' as section,
    r.name as role_name,
    f.name as function_name,
    d.name as department_name
FROM public.org_roles r
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.org_departments d ON r.department_id = d.id
WHERE r.tenant_id = (
    SELECT id FROM public.tenants 
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1
)
AND r.name::text IN ('Medical Science Liaison', 'Medical Information Manager', 'Medical Affairs Director')
ORDER BY r.name;

