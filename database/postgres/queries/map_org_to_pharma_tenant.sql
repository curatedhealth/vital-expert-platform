-- =====================================================================
-- MAP ALL FUNCTIONS, DEPARTMENTS, AND ROLES TO PHARMACEUTICALS TENANT
-- Creates junction table entries for multi-tenant support
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MAPPING ORG STRUCTURE TO PHARMACEUTICALS TENANT';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- STEP 1: Verify Pharmaceuticals Tenant Exists
-- =====================================================================

DO $$
DECLARE
    pharma_tenant_id UUID;
    pharma_tenant_name TEXT;
BEGIN
    SELECT id, name INTO pharma_tenant_id, pharma_tenant_name
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' AND deleted_at IS NULL
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found! Please create it first.';
    END IF;
    
    RAISE NOTICE '✓ Found Pharmaceuticals tenant: % (%)', pharma_tenant_name, pharma_tenant_id;
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- STEP 2: Map ALL Functions to Pharmaceuticals Tenant
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Mapping Functions to Pharmaceuticals tenant...';
END $$;

INSERT INTO public.function_tenants (function_id, tenant_id, created_at)
SELECT 
    f.id as function_id,
    t.id as tenant_id,
    NOW() as created_at
FROM public.org_functions f
CROSS JOIN public.tenants t
WHERE f.deleted_at IS NULL
  AND t.slug = 'pharmaceuticals'
  AND t.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.function_tenants ft
      WHERE ft.function_id = f.id AND ft.tenant_id = t.id
  );

DO $$
DECLARE
    mapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mapped_count
    FROM public.function_tenants ft
    JOIN public.tenants t ON ft.tenant_id = t.id
    WHERE t.slug = 'pharmaceuticals';
    
    RAISE NOTICE '✓ Mapped % functions to Pharmaceuticals tenant', mapped_count;
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- STEP 3: Map ALL Departments to Pharmaceuticals Tenant
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Mapping Departments to Pharmaceuticals tenant...';
END $$;

INSERT INTO public.department_tenants (department_id, tenant_id, created_at)
SELECT 
    d.id as department_id,
    t.id as tenant_id,
    NOW() as created_at
FROM public.org_departments d
CROSS JOIN public.tenants t
WHERE d.deleted_at IS NULL
  AND t.slug = 'pharmaceuticals'
  AND t.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.department_tenants dt
      WHERE dt.department_id = d.id AND dt.tenant_id = t.id
  );

DO $$
DECLARE
    mapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mapped_count
    FROM public.department_tenants dt
    JOIN public.tenants t ON dt.tenant_id = t.id
    WHERE t.slug = 'pharmaceuticals';
    
    RAISE NOTICE '✓ Mapped % departments to Pharmaceuticals tenant', mapped_count;
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- STEP 4: Map ALL Roles to Pharmaceuticals Tenant
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE 'Mapping Roles to Pharmaceuticals tenant...';
    RAISE NOTICE '(This may take a moment - mapping 600+ roles)';
    RAISE NOTICE '';
END $$;

INSERT INTO public.role_tenants (role_id, tenant_id, created_at)
SELECT 
    r.id as role_id,
    t.id as tenant_id,
    NOW() as created_at
FROM public.org_roles r
CROSS JOIN public.tenants t
WHERE r.deleted_at IS NULL
  AND t.slug = 'pharmaceuticals'
  AND t.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.role_tenants rt
      WHERE rt.role_id = r.id AND rt.tenant_id = t.id
  );

DO $$
DECLARE
    mapped_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mapped_count
    FROM public.role_tenants rt
    JOIN public.tenants t ON rt.tenant_id = t.id
    WHERE t.slug = 'pharmaceuticals';
    
    RAISE NOTICE '✓ Mapped % roles to Pharmaceuticals tenant', mapped_count;
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- STEP 5: VERIFICATION - Show Mapping Summary
-- =====================================================================

DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MAPPING VERIFICATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Summary by entity type
SELECT 
    'Functions' as entity_type,
    COUNT(DISTINCT f.id) as total_entities,
    COUNT(DISTINCT ft.function_id) as mapped_to_pharma,
    COUNT(DISTINCT f.id) - COUNT(DISTINCT ft.function_id) as unmapped
FROM public.org_functions f
LEFT JOIN public.function_tenants ft ON ft.function_id = f.id
    AND ft.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1)
WHERE f.deleted_at IS NULL

UNION ALL

SELECT 
    'Departments' as entity_type,
    COUNT(DISTINCT d.id) as total_entities,
    COUNT(DISTINCT dt.department_id) as mapped_to_pharma,
    COUNT(DISTINCT d.id) - COUNT(DISTINCT dt.department_id) as unmapped
FROM public.org_departments d
LEFT JOIN public.department_tenants dt ON dt.department_id = d.id
    AND dt.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1)
WHERE d.deleted_at IS NULL

UNION ALL

SELECT 
    'Roles' as entity_type,
    COUNT(DISTINCT r.id) as total_entities,
    COUNT(DISTINCT rt.role_id) as mapped_to_pharma,
    COUNT(DISTINCT r.id) - COUNT(DISTINCT rt.role_id) as unmapped
FROM public.org_roles r
LEFT JOIN public.role_tenants rt ON rt.role_id = r.id
    AND rt.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1)
WHERE r.deleted_at IS NULL;

-- Detailed breakdown by function
DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE 'Breakdown by Function:';
    RAISE NOTICE '';
END $$;

SELECT 
    f.name as function_name,
    COUNT(DISTINCT d.id) as departments,
    COUNT(DISTINCT r.id) as roles,
    COUNT(DISTINCT ft.id) as func_mappings,
    COUNT(DISTINCT dt.id) as dept_mappings,
    COUNT(DISTINCT rt.id) as role_mappings
FROM public.org_functions f
LEFT JOIN public.org_departments d ON d.function_id = f.id AND d.deleted_at IS NULL
LEFT JOIN public.org_roles r ON r.function_id = f.id AND r.deleted_at IS NULL
LEFT JOIN public.function_tenants ft ON ft.function_id = f.id
    AND ft.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1)
LEFT JOIN public.department_tenants dt ON dt.department_id = d.id
    AND dt.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1)
LEFT JOIN public.role_tenants rt ON rt.role_id = r.id
    AND rt.tenant_id = (SELECT id FROM public.tenants WHERE slug = 'pharmaceuticals' LIMIT 1)
WHERE f.deleted_at IS NULL
GROUP BY f.id, f.name
ORDER BY COUNT(r.id) DESC, f.name;

-- =====================================================================
-- STEP 6: FINAL SUMMARY
-- =====================================================================

DO $$
DECLARE
    total_functions INTEGER;
    total_departments INTEGER;
    total_roles INTEGER;
    pharma_tenant_id UUID;
    pharma_tenant_name TEXT;
BEGIN
    -- Get tenant info
    SELECT id, name INTO pharma_tenant_id, pharma_tenant_name
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' AND deleted_at IS NULL
    LIMIT 1;
    
    -- Get counts
    SELECT COUNT(*) INTO total_functions FROM public.function_tenants ft
    WHERE ft.tenant_id = pharma_tenant_id;
    
    SELECT COUNT(*) INTO total_departments FROM public.department_tenants dt
    WHERE dt.tenant_id = pharma_tenant_id;
    
    SELECT COUNT(*) INTO total_roles FROM public.role_tenants rt
    WHERE rt.tenant_id = pharma_tenant_id;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'MAPPING COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tenant: % (%)', pharma_tenant_name, pharma_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Successfully Mapped:';
    RAISE NOTICE '  ✓ % functions', total_functions;
    RAISE NOTICE '  ✓ % departments', total_departments;
    RAISE NOTICE '  ✓ % roles', total_roles;
    RAISE NOTICE '';
    RAISE NOTICE 'Multi-Tenant Architecture:';
    RAISE NOTICE '  ✓ Ready to add more tenants';
    RAISE NOTICE '  ✓ Functions, departments, and roles can be shared';
    RAISE NOTICE '  ✓ Or tenant-specific entities can be added';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Enrich roles with attributes and relationships';
    RAISE NOTICE '  2. Add skills, tools, stakeholders, KPIs, etc.';
    RAISE NOTICE '  3. Create personas (4 MECE per role)';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

