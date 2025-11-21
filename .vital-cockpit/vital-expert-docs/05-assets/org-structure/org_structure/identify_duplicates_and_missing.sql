-- =====================================================================
-- IDENTIFY DUPLICATES AND MISSING FUNCTIONS/DEPARTMENTS
-- =====================================================================

-- Get Pharmaceuticals tenant ID
DO $$
DECLARE
    pharma_tenant_id uuid;
    func_record RECORD;
    duplicate_count INTEGER := 0;
    missing_count INTEGER := 0;
BEGIN
    -- Get Pharmaceuticals tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    IF pharma_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Pharmaceuticals tenant not found';
    END IF;
    
    RAISE NOTICE 'Pharmaceuticals Tenant ID: %', pharma_tenant_id;
    RAISE NOTICE '';
    RAISE NOTICE '=== DUPLICATE FUNCTIONS (Same name, different slugs) ===';
    
    -- Find duplicate functions (same name, different slugs)
    FOR func_record IN
        SELECT 
            f.name,
            COUNT(*) as duplicate_count,
            string_agg(f.slug, ', ' ORDER BY f.created_at) as slugs,
            string_agg(f.id::text, ', ' ORDER BY f.created_at) as ids
        FROM public.org_functions f
        WHERE f.tenant_id = pharma_tenant_id
        GROUP BY f.name
        HAVING COUNT(*) > 1
        ORDER BY f.name
    LOOP
        RAISE NOTICE 'Duplicate: "%" appears % times', func_record.name, func_record.duplicate_count;
        RAISE NOTICE '  Slugs: %', func_record.slugs;
        RAISE NOTICE '  IDs: %', func_record.ids;
        RAISE NOTICE '';
        duplicate_count := duplicate_count + 1;
    END LOOP;
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE 'No duplicate functions found.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MISSING FUNCTIONS (From Comprehensive List) ===';
    
    -- Check for missing functions from comprehensive list
    FOR func_record IN
        SELECT * FROM (VALUES
            ('Medical Affairs'),
            ('Market Access'),
            ('Commercial Organization'),
            ('Regulatory Affairs'),
            ('Research & Development (R&D)'),
            ('Manufacturing & Supply Chain'),
            ('Finance & Accounting'),
            ('Human Resources'),
            ('Information Technology (IT) / Digital'),
            ('Legal & Compliance'),
            ('Corporate Communications'),
            ('Strategic Planning / Corporate Development'),
            ('Business Intelligence / Analytics'),
            ('Procurement'),
            ('Facilities / Workplace Services')
        ) AS v(function_name)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.org_functions
            WHERE tenant_id = pharma_tenant_id
            AND name::text = v.function_name
        )
    LOOP
        RAISE NOTICE 'Missing Function: %', func_record.function_name;
        missing_count := missing_count + 1;
    END LOOP;
    
    IF missing_count = 0 THEN
        RAISE NOTICE 'All required functions exist!';
    ELSE
        RAISE NOTICE 'Total missing functions: %', missing_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== FUNCTION NAME MAPPINGS (Current vs Required) ===';
    RAISE NOTICE 'Current: "Commercial" → Required: "Commercial Organization"';
    RAISE NOTICE 'Current: "Regulatory" → Required: "Regulatory Affairs"';
    RAISE NOTICE 'Current: "Research & Development" → Required: "Research & Development (R&D)"';
    RAISE NOTICE 'Current: "Manufacturing" → Required: "Manufacturing & Supply Chain"';
    RAISE NOTICE 'Current: "Finance" → Required: "Finance & Accounting"';
    RAISE NOTICE 'Current: "HR" → Required: "Human Resources"';
    RAISE NOTICE 'Current: "IT/Digital" → Required: "Information Technology (IT) / Digital"';
    RAISE NOTICE 'Current: "Legal" → Required: "Legal & Compliance"';
    RAISE NOTICE '';
    RAISE NOTICE '=== RECOMMENDATION ===';
    RAISE NOTICE '1. Review and consolidate duplicate functions';
    RAISE NOTICE '2. Update function names to match comprehensive list';
    RAISE NOTICE '3. Add missing functions from comprehensive list';
    RAISE NOTICE '4. Run check_and_add_pharma_functions_departments.sql to add missing items';
END $$;

