-- =====================================================================
-- FIX PHARMACEUTICALS TENANT ORG-STRUCTURE NORMALIZATION
-- This script fixes normalization issues found in the verification
-- =====================================================================

-- Pharmaceuticals Tenant ID
-- c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b

BEGIN;

-- =====================================================================
-- 1. FIX ORPHANED DEPARTMENTS (departments without valid function_id)
-- =====================================================================

-- Delete departments that don't have a valid function_id within Pharmaceuticals tenant
DELETE FROM org_departments
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        function_id IS NULL 
        OR function_id NOT IN (
            SELECT id FROM org_functions 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
    );

-- =====================================================================
-- 2. FIX ORPHANED ROLES (roles without valid function_id or department_id)
-- =====================================================================

-- Delete roles that don't have valid function_id or department_id within Pharmaceuticals tenant
DELETE FROM org_roles
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        function_id IS NULL 
        OR function_id NOT IN (
            SELECT id FROM org_functions 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
        OR department_id IS NULL
        OR department_id NOT IN (
            SELECT id FROM org_departments 
            WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        )
    );

-- =====================================================================
-- 3. FIX CROSS-TENANT RELATIONSHIPS
-- =====================================================================

-- Fix departments pointing to functions from different tenants
UPDATE org_departments d
SET function_id = (
    SELECT f.id 
    FROM org_functions f 
    WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        AND f.department_name = (
            SELECT department_name 
            FROM org_functions 
            WHERE id = d.function_id
        )
    LIMIT 1
)
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND EXISTS (
        SELECT 1 FROM org_functions f 
        WHERE f.id = d.function_id 
        AND f.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    );

-- Fix roles pointing to functions from different tenants
UPDATE org_roles r
SET function_id = (
    SELECT f.id 
    FROM org_functions f 
    WHERE f.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        AND f.department_name = (
            SELECT department_name 
            FROM org_functions 
            WHERE id = r.function_id
        )
    LIMIT 1
)
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND EXISTS (
        SELECT 1 FROM org_functions f 
        WHERE f.id = r.function_id 
        AND f.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    );

-- Fix roles pointing to departments from different tenants
UPDATE org_roles r
SET department_id = (
    SELECT d.id 
    FROM org_departments d 
    WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
        AND d.department_name = (
            SELECT department_name 
            FROM org_departments 
            WHERE id = r.department_id
        )
    LIMIT 1
)
WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND EXISTS (
        SELECT 1 FROM org_departments d 
        WHERE d.id = r.department_id 
        AND d.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    );

-- =====================================================================
-- 4. FIX DUPLICATE FUNCTION NAMES (keep first, delete others)
-- =====================================================================

DELETE FROM org_functions
WHERE id IN (
    SELECT id FROM (
        SELECT id,
            ROW_NUMBER() OVER (
                PARTITION BY department_name, tenant_id 
                ORDER BY created_at ASC
            ) as rn
        FROM org_functions
        WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    ) t
    WHERE rn > 1
);

-- =====================================================================
-- 5. FIX DUPLICATE DEPARTMENT NAMES (keep first, delete others)
-- =====================================================================

DELETE FROM org_departments
WHERE id IN (
    SELECT id FROM (
        SELECT id,
            ROW_NUMBER() OVER (
                PARTITION BY department_name, tenant_id 
                ORDER BY created_at ASC
            ) as rn
        FROM org_departments
        WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    ) t
    WHERE rn > 1
);

-- =====================================================================
-- 6. FIX DUPLICATE ROLE NAMES (keep first, delete others)
-- =====================================================================

DELETE FROM org_roles
WHERE id IN (
    SELECT id FROM (
        SELECT id,
            ROW_NUMBER() OVER (
                PARTITION BY role_name, tenant_id 
                ORDER BY created_at ASC
            ) as rn
        FROM org_roles
        WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    ) t
    WHERE rn > 1
);

-- =====================================================================
-- 7. FIX MISSING REQUIRED FIELDS
-- =====================================================================

-- Functions with missing department_name
UPDATE org_functions
SET department_name = 'Unknown Function'
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (department_name IS NULL OR department_name = '');

-- Functions with missing unique_id
UPDATE org_functions
SET unique_id = 'FN-PHARMA-' || SUBSTRING(id::text, 1, 8)
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND unique_id IS NULL;

-- Departments with missing department_name
UPDATE org_departments
SET department_name = 'Unknown Department'
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (department_name IS NULL OR department_name = '');

-- Departments with missing function_id - link to first function if exists
UPDATE org_departments
SET function_id = (
    SELECT id FROM org_functions 
    WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND function_id IS NULL
    AND EXISTS (
        SELECT 1 FROM org_functions 
        WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    );

-- Roles with missing role_name
UPDATE org_roles
SET role_name = 'Unknown Role'
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (role_name IS NULL OR role_name = '');

-- Roles with missing unique_id
UPDATE org_roles
SET unique_id = 'ROLE-PHARMA-' || SUBSTRING(id::text, 1, 8)
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND unique_id IS NULL;

-- Roles with missing function_id - link to first function if exists
UPDATE org_roles
SET function_id = (
    SELECT id FROM org_functions 
    WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND function_id IS NULL
    AND EXISTS (
        SELECT 1 FROM org_functions 
        WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    );

-- Roles with missing department_id - link to first department if exists
UPDATE org_roles
SET department_id = (
    SELECT id FROM org_departments 
    WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    ORDER BY created_at ASC
    LIMIT 1
)
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND department_id IS NULL
    AND EXISTS (
        SELECT 1 FROM org_departments 
        WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    );

-- =====================================================================
-- 8. VERIFY FIXES
-- =====================================================================

SELECT '=== FIXES APPLIED - VERIFICATION ===' as status;

-- Count remaining issues
SELECT 
    'Remaining Orphaned Departments' as issue_type,
    COUNT(*) as count
FROM org_departments d
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (function_id IS NULL 
         OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'));

SELECT 
    'Remaining Orphaned Roles' as issue_type,
    COUNT(*) as count
FROM org_roles r
WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND (
        function_id IS NULL 
        OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
        OR department_id IS NULL
        OR department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
    );

SELECT 
    'Remaining Cross-Tenant Links' as issue_type,
    COUNT(*) as count
FROM org_departments d
INNER JOIN org_functions f ON d.function_id = f.id
WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
    AND f.tenant_id != 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b';

-- Final summary
SELECT 
    'Pharmaceuticals Tenant - Final Status' as report_title,
    (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as functions_count,
    (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as departments_count,
    (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b') as roles_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM org_departments d
              WHERE d.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
              AND (function_id IS NULL OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'))) = 0
        AND (SELECT COUNT(*) FROM org_roles r
             WHERE r.tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'
             AND (function_id IS NULL OR department_id IS NULL 
                  OR function_id NOT IN (SELECT id FROM org_functions WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b')
                  OR department_id NOT IN (SELECT id FROM org_departments WHERE tenant_id = 'c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b'))) = 0
        THEN '✅ NORMALIZED'
        ELSE '⚠️ ISSUES REMAIN'
    END as normalization_status;

COMMIT;

