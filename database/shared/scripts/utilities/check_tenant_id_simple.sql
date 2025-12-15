-- ============================================================================
-- SIMPLE TENANT_ID CHECKS - Run one query at a time
-- ============================================================================
-- These are lightweight queries you can run individually to avoid timeouts
-- ============================================================================

-- ============================================================================
-- CHECK 1: Basic count
-- ============================================================================
SELECT COUNT(*) as tables_with_tenant_id
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id';

-- ============================================================================
-- CHECK 2: Nullable tenant_id columns (first 20)
-- ============================================================================
SELECT table_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND is_nullable = 'YES'
ORDER BY table_name
LIMIT 20;

-- ============================================================================
-- CHECK 3: NOT NULL tenant_id columns (first 20)
-- ============================================================================
SELECT table_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
  AND is_nullable = 'NO'
ORDER BY table_name
LIMIT 20;

-- ============================================================================
-- CHECK 4: Foreign keys to tenants table (first 20)
-- ============================================================================
SELECT 
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'tenants'
    AND kcu.column_name = 'tenant_id'
ORDER BY tc.table_name
LIMIT 20;

-- ============================================================================
-- CHECK 5: Indexes on tenant_id (first 20)
-- ============================================================================
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexdef LIKE '%tenant_id%'
ORDER BY tablename
LIMIT 20;

-- ============================================================================
-- CHECK 6: Sample of tables with tenant_id (first 30)
-- ============================================================================
SELECT DISTINCT table_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
ORDER BY table_name
LIMIT 30;
