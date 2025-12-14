-- ============================================================================
-- DIAGNOSTIC QUERIES FOR TENANT_ID COLUMNS
-- ============================================================================
-- This script helps identify potential issues with tenant_id columns:
-- 1. Missing foreign key constraints
-- 2. Missing indexes
-- 3. Tables with nullable tenant_id that should be NOT NULL
-- 4. Tables without RLS enabled
-- ============================================================================

-- ============================================================================
-- QUERY 1: Tables with tenant_id but missing foreign key constraints
-- ============================================================================
SELECT 
    t.table_name,
    c.column_name,
    'Missing FK constraint' as issue
FROM information_schema.tables t
INNER JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT 
        tc.table_name,
        kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND ccu.table_name = 'tenants'
        AND ccu.column_name = 'id'
) fk ON t.table_name = fk.table_name 
    AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND c.column_name = 'tenant_id'
  AND fk.table_name IS NULL
  AND t.table_name != 'tenants'  -- Exclude tenants table itself
ORDER BY t.table_name;

-- ============================================================================
-- QUERY 2: Tables with tenant_id but missing indexes
-- ============================================================================
SELECT 
    t.table_name,
    c.column_name,
    'Missing index' as issue
FROM information_schema.tables t
INNER JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT 
        tablename,
        indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
        AND indexdef LIKE '%tenant_id%'
) idx ON t.table_name = idx.tablename
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND c.column_name = 'tenant_id'
  AND idx.tablename IS NULL
  AND t.table_name != 'tenants'
ORDER BY t.table_name;

-- ============================================================================
-- QUERY 3: Tables with nullable tenant_id (potential data integrity issue)
-- ============================================================================
SELECT 
    table_name,
    column_name,
    is_nullable,
    column_default,
    'Nullable tenant_id - consider making NOT NULL' as issue
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND is_nullable = 'YES'
  AND table_name NOT LIKE '%backup%'
  AND table_name NOT LIKE '%deprecated%'
ORDER BY table_name;

-- ============================================================================
-- QUERY 4: Tables with tenant_id but RLS not enabled
-- ============================================================================
SELECT 
    t.table_name,
    'RLS not enabled' as issue
FROM information_schema.tables t
INNER JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN pg_tables pt
    ON t.table_name = pt.tablename
    AND t.table_schema = pt.schemaname
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND c.column_name = 'tenant_id'
  AND (pt.rowsecurity = false OR pt.rowsecurity IS NULL)
  AND t.table_name != 'tenants'
  AND t.table_name NOT LIKE 'v_%'  -- Exclude views
ORDER BY t.table_name;

-- ============================================================================
-- QUERY 5: Summary statistics
-- ============================================================================
SELECT 
    'Total tables with tenant_id' as metric,
    COUNT(DISTINCT table_name)::text as value
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
UNION ALL
SELECT 
    'Tables with NOT NULL tenant_id',
    COUNT(DISTINCT table_name)::text
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND is_nullable = 'NO'
UNION ALL
SELECT 
    'Tables with nullable tenant_id',
    COUNT(DISTINCT table_name)::text
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND is_nullable = 'YES'
UNION ALL
SELECT 
    'Tables with FK constraint to tenants',
    COUNT(DISTINCT tc.table_name)::text
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'tenants'
    AND ccu.column_name = 'id'
    AND kcu.column_name = 'tenant_id';
