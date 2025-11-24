-- =====================================================================
-- CHECK ORG_ROLES TABLE COLUMNS
-- Diagnostic query to see what columns actually exist
-- =====================================================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'org_roles'
ORDER BY ordinal_position;

-- Also try to see a sample of the data
SELECT 
    id,
    unique_id,
    -- Try different possible column names
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'org_roles' AND column_name = 'role_name') 
        THEN (SELECT role_name FROM public.org_roles LIMIT 1)
        ELSE NULL
    END as has_role_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'org_roles' AND column_name = 'name') 
        THEN (SELECT name::text FROM public.org_roles LIMIT 1)
        ELSE NULL
    END as has_name,
    tenant_id,
    function_id,
    department_id
FROM public.org_roles
LIMIT 1;

