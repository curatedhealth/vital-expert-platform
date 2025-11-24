-- =====================================================================
-- MAP ROLES WITH MISSING DEPARTMENTS TO APPROPRIATE DEPARTMENTS
-- =====================================================================

BEGIN;

DO $$
DECLARE
    role_rec RECORD;
    dept_id UUID;
    medical_affairs_function_id UUID;
    pharma_tenant_id UUID;
    updated_count INTEGER := 0;
BEGIN
    -- Get pharma tenant ID
    SELECT id INTO pharma_tenant_id
    FROM public.tenants
    WHERE slug = 'pharmaceuticals' OR name ILIKE '%pharmaceutical%'
    LIMIT 1;
    
    -- Get Medical Affairs function ID
    SELECT id INTO medical_affairs_function_id
    FROM public.org_functions
    WHERE name::text ILIKE '%medical%affairs%' 
       OR name::text ILIKE '%medical affairs%'
       OR name::text ILIKE 'medical%'
    LIMIT 1;
    
    -- Map each role to its appropriate department
    FOR role_rec IN 
        SELECT r.id, r.name, r.tenant_id, r.function_id
        FROM public.org_roles r
        WHERE r.deleted_at IS NULL
          AND r.tenant_id = pharma_tenant_id
          AND r.department_id IS NULL
          AND (
            r.name ILIKE '%medical%'
            OR r.function_id = medical_affairs_function_id
          )
    LOOP
        -- Map based on role name patterns
        dept_id := NULL;
        
        -- Field Medical / MSL roles (comprehensive)
        IF role_rec.name ILIKE '%msl%' 
           OR role_rec.name ILIKE '%medical science liaison%'
           OR role_rec.name ILIKE '%field medical%'
           OR role_rec.name ILIKE '%field medical trainer%'
           OR role_rec.name ILIKE '%ta msl%'
           OR role_rec.name ILIKE '%ta msl lead%'
           OR role_rec.name ILIKE '%senior medical science liaison%'
           OR role_rec.name ILIKE '%head of field medical%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%field medical%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Information roles (comprehensive)
        ELSIF role_rec.name ILIKE '%medical info%'
              OR role_rec.name ILIKE '%medical information%'
              OR role_rec.name ILIKE '%medical librarian%'
              OR role_rec.name ILIKE '%senior medical info specialist%'
              OR role_rec.name ILIKE '%medical info manager%'
              OR role_rec.name ILIKE '%medical info specialist%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%medical information%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Communications roles (comprehensive)
        ELSIF role_rec.name ILIKE '%medical communication%'
              OR role_rec.name ILIKE '%medical education%'
              OR role_rec.name ILIKE '%medical training%'
              OR role_rec.name ILIKE '%head medical communication%'
              OR role_rec.name ILIKE '%medical communications manager%'
              OR role_rec.name ILIKE '%medical education director%'
              OR role_rec.name ILIKE '%medical training manager%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%medical communication%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Writer (regulatory) - CHECK FIRST (more specific)
        ELSIF role_rec.name ILIKE '%medical writer regulatory%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%regulatory submission%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Writer (publications) - CHECK SECOND (more specific)
        ELSIF role_rec.name ILIKE '%medical writer publication%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%medical publication%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Publications roles
        ELSIF role_rec.name ILIKE '%publication%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%medical publication%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Writer (generic - default to Communications) - CHECK LAST
        ELSIF role_rec.name ILIKE '%medical writer%'
              OR role_rec.name ILIKE '%medical editor%'
              OR role_rec.name ILIKE '%congress%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%medical communication%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Leadership roles (comprehensive)
        ELSIF role_rec.name ILIKE '%chief medical%'
              OR role_rec.name ILIKE '%vp medical%'
              OR role_rec.name ILIKE '%regional medical director%'
              OR role_rec.name ILIKE '%therapeutic area medical director%'
              OR role_rec.name ILIKE '%global medical advisor%'
              OR role_rec.name = 'Medical Director' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%leadership%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Strategy & Operations (comprehensive)
        ELSIF role_rec.name ILIKE '%medical strategy%'
              OR role_rec.name ILIKE '%medical business partner%'
              OR role_rec.name ILIKE '%medical affairs clinical liaison%'
              OR role_rec.name ILIKE '%medical operations manager%'
              OR role_rec.name ILIKE '%head of medical strategy%'
              OR role_rec.name ILIKE '%medical operations%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%medical strategy%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Excellence / Quality / Compliance (comprehensive)
        ELSIF role_rec.name ILIKE '%medical excellence%'
              OR role_rec.name ILIKE '%medical quality%'
              OR role_rec.name ILIKE '%medical compliance%'
              OR role_rec.name ILIKE '%medical qa%'
              OR role_rec.name ILIKE '%medical review committee%'
              OR role_rec.name ILIKE '%head of medical excellence%'
              OR role_rec.name ILIKE '%medical quality manager%'
              OR role_rec.name ILIKE '%medical compliance manager%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE (name ILIKE '%medical excellence%' OR name ILIKE '%regulatory submission%')
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Monitor / Clinical Operations
        ELSIF role_rec.name ILIKE '%medical monitor%' THEN
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%clinical operations support%'
              AND deleted_at IS NULL
            LIMIT 1;
        
        -- Medical Affairs Director (check if it's in Regulatory Leadership)
        ELSIF role_rec.name ILIKE '%medical affairs director%' THEN
            -- Try Regulatory Leadership first, then Leadership
            SELECT id INTO dept_id
            FROM public.org_departments
            WHERE name ILIKE '%regulatory leadership%'
              AND deleted_at IS NULL
            LIMIT 1;
            
            IF dept_id IS NULL THEN
                SELECT id INTO dept_id
                FROM public.org_departments
                WHERE name ILIKE '%leadership%'
                  AND deleted_at IS NULL
                LIMIT 1;
            END IF;
        END IF;
        
        -- Update the role if department found
        IF dept_id IS NOT NULL THEN
            UPDATE public.org_roles
            SET department_id = dept_id,
                updated_at = NOW()
            WHERE id = role_rec.id;
            
            updated_count := updated_count + 1;
            RAISE NOTICE 'Mapped role "%" to department "%"', role_rec.name, (SELECT name FROM public.org_departments WHERE id = dept_id);
        ELSE
            RAISE NOTICE 'Could not find department for role: %', role_rec.name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== COMPLETE ===';
    RAISE NOTICE 'Updated % roles with department mappings', updated_count;
END $$;

-- Verify the mappings
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

-- Show roles still without departments
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

