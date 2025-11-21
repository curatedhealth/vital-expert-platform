-- ============================================================
-- MASTER QUERY: Complete Persona Schema Extraction
-- ============================================================
-- Run this and share the output to get full schema visibility

-- 1. ALL PERSONA TABLES WITH COLUMN DETAILS
\echo '========== PERSONA TABLES & COLUMNS =========='
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name LIKE 'persona%'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 2. ALL CHECK CONSTRAINTS (for enums)
\echo ''
\echo '========== CHECK CONSTRAINTS (Enum Values) =========='
SELECT 
    rel.relname as table_name,
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE con.contype = 'c' 
  AND rel.relname LIKE 'persona%'
  AND nsp.nspname = 'public'
ORDER BY rel.relname, con.conname;

-- 3. ALL UNIQUE CONSTRAINTS
\echo ''
\echo '========== UNIQUE CONSTRAINTS =========='
SELECT 
    tc.table_name,
    tc.constraint_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name LIKE 'persona%'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- 4. ALL FOREIGN KEYS
\echo ''
\echo '========== FOREIGN KEY RELATIONSHIPS =========='
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name LIKE 'persona%'
ORDER BY tc.table_name, kcu.column_name;

-- 5. ALL ENUM TYPES
\echo ''
\echo '========== CUSTOM ENUM TYPES =========='
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- 6. NOT NULL COLUMNS (Required Fields)
\echo ''
\echo '========== NOT NULL COLUMNS (Required Fields) =========='
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE 'persona%'
  AND is_nullable = 'NO'
  AND column_default IS NULL  -- No default means truly required
ORDER BY table_name, column_name;

-- 7. TABLE ROW COUNTS
\echo ''
\echo '========== CURRENT DATA COUNTS =========='
SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname LIKE 'persona%'
ORDER BY relname;
