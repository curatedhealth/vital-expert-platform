-- ============================================================================
-- Verify User Panels Schema
-- ============================================================================
-- Run this script in Supabase SQL Editor to check if migrations are applied
-- Expected result: Should show all columns including workflow_definition

-- Check if user_panels table exists
SELECT
    'user_panels table' AS check_type,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'user_panels'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - Run migration 20251126000003'
    END AS status;

-- Check if workflow_definition column exists
SELECT
    'workflow_definition column' AS check_type,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_panels'
            AND column_name = 'workflow_definition'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING - Run migration 20251127000001'
    END AS status;

-- Show all columns in user_panels table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_panels'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_panels';
