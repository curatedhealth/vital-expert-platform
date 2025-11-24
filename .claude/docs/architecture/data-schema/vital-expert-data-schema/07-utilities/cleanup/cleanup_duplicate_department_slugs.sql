-- =============================================
-- Clean Up Duplicate Department Slugs
-- Consolidate into single departments with multi-tenant mapping
-- =============================================

DO $$
DECLARE
    duplicate_slug TEXT;
    keep_dept_id UUID;
    duplicate_dept_id UUID;
    duplicate_dept_ids UUID[];
    total_cleaned INT := 0;
    roles_updated INT := 0;
    tenants_merged INT := 0;
BEGIN
    RAISE NOTICE '=== Starting Department Duplicate Cleanup ===';
    RAISE NOTICE '';

    -- Loop through each duplicate slug
    FOR duplicate_slug IN 
        SELECT slug
        FROM public.org_departments
        WHERE deleted_at IS NULL
        GROUP BY slug
        HAVING COUNT(*) > 1
        ORDER BY slug
    LOOP
        RAISE NOTICE 'Processing duplicate slug: %', duplicate_slug;
        
        -- Find the department to KEEP (prioritize: most roles > oldest created_at)
        SELECT id INTO keep_dept_id
        FROM public.org_departments d
        WHERE d.slug = duplicate_slug
          AND d.deleted_at IS NULL
        ORDER BY 
            (SELECT COUNT(*) FROM public.org_roles WHERE department_id = d.id AND deleted_at IS NULL) DESC,
            d.created_at ASC
        LIMIT 1;
        
        -- Get all duplicate department IDs (excluding the one we're keeping)
        SELECT ARRAY_AGG(id) INTO duplicate_dept_ids
        FROM public.org_departments
        WHERE slug = duplicate_slug
          AND deleted_at IS NULL
          AND id != keep_dept_id;
        
        RAISE NOTICE '  → Keeping department: %', keep_dept_id;
        RAISE NOTICE '  → Cleaning up % duplicates', ARRAY_LENGTH(duplicate_dept_ids, 1);
        
        -- Process each duplicate
        FOREACH duplicate_dept_id IN ARRAY duplicate_dept_ids
        LOOP
            -- 1. Migrate tenant mappings from duplicate to kept department
            INSERT INTO public.department_tenants (department_id, tenant_id, created_at, updated_at)
            SELECT 
                keep_dept_id,
                dt.tenant_id,
                NOW(),
                NOW()
            FROM public.department_tenants dt
            WHERE dt.department_id = duplicate_dept_id
            ON CONFLICT (department_id, tenant_id) DO NOTHING;
            
            GET DIAGNOSTICS tenants_merged = ROW_COUNT;
            IF tenants_merged > 0 THEN
                RAISE NOTICE '    ✓ Migrated % tenant mappings from %', tenants_merged, duplicate_dept_id;
            END IF;
            
            -- 2. Update all roles pointing to duplicate department
            UPDATE public.org_roles
            SET 
                department_id = keep_dept_id,
                updated_at = NOW()
            WHERE department_id = duplicate_dept_id
              AND deleted_at IS NULL;
            
            GET DIAGNOSTICS roles_updated = ROW_COUNT;
            IF roles_updated > 0 THEN
                RAISE NOTICE '    ✓ Updated % roles to point to kept department', roles_updated;
            END IF;
            
            -- 3. Delete tenant mappings for duplicate department
            DELETE FROM public.department_tenants
            WHERE department_id = duplicate_dept_id;
            
            -- 4. Soft-delete the duplicate department
            UPDATE public.org_departments
            SET 
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE id = duplicate_dept_id;
            
            total_cleaned := total_cleaned + 1;
        END LOOP;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '=== Cleanup Complete ===';
    RAISE NOTICE '✓ Cleaned up % duplicate departments', total_cleaned;
    RAISE NOTICE '✓ Consolidated tenant mappings in junction table';
    RAISE NOTICE '✓ Updated role references to kept departments';
END $$;

-- Verification: Check for remaining duplicates
SELECT 
    '=== VERIFICATION: Remaining Duplicates ===' as section;

SELECT 
    slug,
    COUNT(*) as count
FROM public.org_departments
WHERE deleted_at IS NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- Show consolidated departments with tenant counts
SELECT 
    '=== DEPARTMENTS WITH MULTIPLE TENANTS ===' as section;

SELECT 
    d.id,
    d.name,
    d.slug,
    COUNT(dt.tenant_id) as tenant_count,
    ARRAY_AGG(t.name ORDER BY t.name) as tenant_names,
    (SELECT COUNT(*) FROM org_roles WHERE department_id = d.id AND deleted_at IS NULL) as role_count
FROM public.org_departments d
LEFT JOIN public.department_tenants dt ON d.id = dt.department_id
LEFT JOIN public.tenants t ON dt.tenant_id = t.id
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.slug
HAVING COUNT(dt.tenant_id) > 1
ORDER BY COUNT(dt.tenant_id) DESC, d.name
LIMIT 20;

-- Summary
SELECT 
    '=== SUMMARY ===' as section;

SELECT 
    COUNT(DISTINCT d.id) as total_unique_departments,
    COUNT(dt.tenant_id) as total_department_tenant_mappings,
    COUNT(DISTINCT dt.tenant_id) as unique_tenants_mapped
FROM public.org_departments d
LEFT JOIN public.department_tenants dt ON d.id = dt.department_id
WHERE d.deleted_at IS NULL;

