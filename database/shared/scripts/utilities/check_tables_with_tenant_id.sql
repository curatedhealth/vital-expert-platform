-- ============================================================================
-- CHECK ALL TABLES WITH TENANT_ID COLUMN
-- ============================================================================
-- This script queries the information_schema to find all tables that have
-- a tenant_id column in the public schema.
-- Run this via Supabase CLI: supabase db execute -f database/scripts/utilities/check_tables_with_tenant_id.sql
-- Or via Supabase Dashboard SQL Editor
-- ============================================================================

-- Query 1: List all tables with tenant_id column
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id'
ORDER BY table_name;

-- Query 2: Count tables with tenant_id
SELECT 
    COUNT(DISTINCT table_name) as total_tables_with_tenant_id
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'tenant_id';

-- Query 3: List all tables in public schema (for comparison)
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
              AND c.table_name = t.table_name
              AND c.column_name = 'tenant_id'
        ) THEN 'YES'
        ELSE 'NO'
    END as has_tenant_id
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
    has_tenant_id DESC,
    table_name;

-- Query 4: Detailed view with foreign key constraints
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    CASE 
        WHEN fk.constraint_name IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END as has_foreign_key,
    fk.foreign_table_name,
    fk.foreign_column_name
FROM information_schema.tables t
INNER JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT 
        tc.table_name,
        kcu.column_name,
        tc.constraint_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
) fk ON t.table_name = fk.table_name 
    AND c.column_name = fk.column_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND c.column_name = 'tenant_id'
ORDER BY t.table_name;
