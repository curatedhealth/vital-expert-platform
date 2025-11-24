-- =============================================
-- Fix Field Medical Role Mappings
-- Map all Field Medical roles to correct dept/function/tenant
-- =============================================

DO $$
DECLARE
    pharma_tenant_id UUID := 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
    medical_affairs_function_id UUID := 'ae0283a2-222f-4703-a17d-06129789a156';
    field_medical_dept_id UUID := '9f2d5932-b700-4992-b15a-2d7a519ab442';
    updated_count INT := 0;
BEGIN
    RAISE NOTICE '=== Starting Field Medical Role Mapping Fix ===';
    RAISE NOTICE 'Tenant: % (Pharmaceuticals)', pharma_tenant_id;
    RAISE NOTICE 'Function: % (Medical Affairs)', medical_affairs_function_id;
    RAISE NOTICE 'Department: % (Field Medical)', field_medical_dept_id;
    RAISE NOTICE '';

    -- Fix roles with NULL department_id
    RAISE NOTICE '--- Fixing roles with NULL department_id ---';
    
    -- 1. Field Medical Trainer
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        function_id = medical_affairs_function_id,
        tenant_id = pharma_tenant_id,
        updated_at = NOW()
    WHERE id = '1ba3b439-131f-423e-b8d2-c36957a1838e'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Field Medical Trainer: % rows updated', updated_count;

    -- 2. Head of Field Medical
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        function_id = medical_affairs_function_id,
        tenant_id = pharma_tenant_id,
        updated_at = NOW()
    WHERE id = '184baf82-1381-4413-bfac-c497540497fd'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Head of Field Medical: % rows updated', updated_count;

    -- 3. Medical Science Liaison
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        function_id = medical_affairs_function_id,
        tenant_id = pharma_tenant_id,
        updated_at = NOW()
    WHERE id = '2015f823-3718-470c-ad01-4262c272ccc8'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Medical Science Liaison: % rows updated', updated_count;

    -- 4. Senior Medical Science Liaison (unmapped)
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        function_id = medical_affairs_function_id,
        tenant_id = pharma_tenant_id,
        updated_at = NOW()
    WHERE id = '0d764bd1-84d9-49fd-8b8a-517a4f659a79'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Senior Medical Science Liaison (unmapped): % rows updated', updated_count;

    -- 5. TA MSL Lead
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        function_id = medical_affairs_function_id,
        tenant_id = pharma_tenant_id,
        updated_at = NOW()
    WHERE id = '1f61c24c-4754-47e6-b443-9c4039f489a5'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ TA MSL Lead: % rows updated', updated_count;

    RAISE NOTICE '';
    RAISE NOTICE '--- Fixing roles with WRONG department_id ---';

    -- 6. Field Team Lead
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = 'b30ed3df-d557-4496-b5d7-9ce29367722a'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Field Team Lead: % rows updated', updated_count;

    -- 7. Global Field Medical Lead
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = 'd3125263-b6db-4c3e-9c1a-c79e383de667'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Global Field Medical Lead: % rows updated', updated_count;

    -- 8. Local Field Medical Team Lead
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = 'b413dec8-c070-4ec1-96c8-a5c4cf4fd1e9'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Local Field Medical Team Lead: % rows updated', updated_count;

    -- 9. Local Medical Science Liaison (MSL)
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = '1cccebb3-8709-4fb7-be37-6b2355ed653a'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Local Medical Science Liaison (MSL): % rows updated', updated_count;

    -- 10. Medical Scientific Manager
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = 'e30e741c-1a6d-4221-8a84-fd5796a7a7e0'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Medical Scientific Manager: % rows updated', updated_count;

    -- 11. Regional Field Medical Director
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = '9c7ab121-2da7-4267-897e-899fab7f3b27'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Regional Field Medical Director: % rows updated', updated_count;

    -- 12. Regional Medical Science Liaison
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = '8a78b723-2f38-4376-b63d-7ca24a1e3521'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Regional Medical Science Liaison: % rows updated', updated_count;

    -- 13. Senior Medical Science Liaison (mapped to wrong dept)
    UPDATE public.org_roles
    SET 
        department_id = field_medical_dept_id,
        updated_at = NOW()
    WHERE id = '6b9d704f-5cef-4ed9-81aa-ec6bc22c1022'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ Senior Medical Science Liaison (remap): % rows updated', updated_count;

    RAISE NOTICE '';
    RAISE NOTICE '--- Fixing role with NULL tenant_id ---';

    -- 14. MSL Manager (correct dept but NULL tenant)
    UPDATE public.org_roles
    SET 
        tenant_id = pharma_tenant_id,
        updated_at = NOW()
    WHERE id = 'bb7ca388-4417-47af-856d-8ca6baa57c71'
      AND deleted_at IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✓ MSL Manager: % rows updated', updated_count;

    RAISE NOTICE '';
    RAISE NOTICE '=== Verification ===';
    
    -- Verify all Field Medical roles now have correct mappings
    RAISE NOTICE 'Total Field Medical roles with correct mapping:';
    SELECT COUNT(*) INTO updated_count
    FROM public.org_roles
    WHERE department_id = field_medical_dept_id
      AND function_id = medical_affairs_function_id
      AND tenant_id = pharma_tenant_id
      AND deleted_at IS NULL;
    RAISE NOTICE '✓ % roles correctly mapped to Field Medical department', updated_count;

    RAISE NOTICE '';
    RAISE NOTICE '=== COMPLETE ===';
END $$;

-- Final verification query
SELECT 
    r.name as role_name,
    r.slug as role_slug,
    d.name as department_name,
    f.name::text as function_name,
    t.name as tenant_name,
    r.department_id,
    r.function_id,
    r.tenant_id
FROM public.org_roles r
LEFT JOIN public.org_departments d ON r.department_id = d.id
LEFT JOIN public.org_functions f ON r.function_id = f.id
LEFT JOIN public.tenants t ON r.tenant_id = t.id
WHERE r.id IN (
    '1ba3b439-131f-423e-b8d2-c36957a1838e',
    'b30ed3df-d557-4496-b5d7-9ce29367722a',
    'd3125263-b6db-4c3e-9c1a-c79e383de667',
    '184baf82-1381-4413-bfac-c497540497fd',
    'b413dec8-c070-4ec1-96c8-a5c4cf4fd1e9',
    '1cccebb3-8709-4fb7-be37-6b2355ed653a',
    '2015f823-3718-470c-ad01-4262c272ccc8',
    'e30e741c-1a6d-4221-8a84-fd5796a7a7e0',
    'bb7ca388-4417-47af-856d-8ca6baa57c71',
    '9c7ab121-2da7-4267-897e-899fab7f3b27',
    '8a78b723-2f38-4376-b63d-7ca24a1e3521',
    '0d764bd1-84d9-49fd-8b8a-517a4f659a79',
    '6b9d704f-5cef-4ed9-81aa-ec6bc22c1022',
    '1f61c24c-4754-47e6-b443-9c4039f489a5'
)
AND r.deleted_at IS NULL
ORDER BY r.name;

