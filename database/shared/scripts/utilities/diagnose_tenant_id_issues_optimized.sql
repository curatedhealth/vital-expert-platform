-- ============================================================================
-- OPTIMIZED DIAGNOSTIC QUERIES FOR TENANT_ID COLUMNS
-- ============================================================================
-- These queries are optimized to avoid timeouts by:
-- 1. Using more efficient joins
-- 2. Limiting result sets
-- 3. Using EXISTS instead of complex LEFT JOINs
-- ============================================================================

-- ============================================================================
-- QUERY 1: Quick count of tables with tenant_id
-- ============================================================================
SELECT COUNT(DISTINCT table_name) as total_tables_with_tenant_id
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id';

-- ============================================================================
-- QUERY 2: Tables with nullable tenant_id (quick check)
-- ============================================================================
SELECT 
    table_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND is_nullable = 'YES'
  AND table_name NOT LIKE '%backup%'
  AND table_name NOT LIKE '%deprecated%'
ORDER BY table_name
LIMIT 50;

-- ============================================================================
-- QUERY 3: Check foreign key constraints (optimized)
-- ============================================================================
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'tenants'
    AND ccu.column_name = 'id'
    AND kcu.column_name = 'tenant_id'
ORDER BY tc.table_name
LIMIT 100;

-- ============================================================================
-- QUERY 4: Check indexes on tenant_id (optimized)
-- ============================================================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND (indexdef LIKE '%tenant_id%' OR indexname LIKE '%tenant%')
ORDER BY tablename
LIMIT 100;

-- ============================================================================
-- QUERY 5: Tables with tenant_id but missing FK (simplified)
-- ============================================================================
-- First, get list of tables with tenant_id
WITH tables_with_tenant_id AS (
    SELECT DISTINCT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'tenant_id'
      AND table_name != 'tenants'
),
tables_with_fk AS (
    SELECT DISTINCT tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND ccu.table_name = 'tenants'
        AND ccu.column_name = 'id'
        AND kcu.column_name = 'tenant_id'
)
SELECT 
    t.table_name,
    'Missing FK to tenants' as issue
FROM tables_with_tenant_id t
WHERE NOT EXISTS (
    SELECT 1 FROM tables_with_fk fk WHERE fk.table_name = t.table_name
)
ORDER BY t.table_name
LIMIT 50;

-- ============================================================================
-- QUERY 6: RLS status check (simplified)
-- ============================================================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'tenant_id'
          AND table_name != 'tenants'
    )
    AND rowsecurity = false
ORDER BY tablename
LIMIT 50;
