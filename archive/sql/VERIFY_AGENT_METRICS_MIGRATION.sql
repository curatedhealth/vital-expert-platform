-- Verification Queries for Agent Metrics Migration
-- Run these queries in your Supabase SQL Editor to verify the migration

-- 1. Check if table exists
SELECT 
  schemaname, 
  tablename, 
  tableowner
FROM pg_tables 
WHERE tablename = 'agent_metrics';

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_metrics'
ORDER BY ordinal_position;

-- 3. Check all indexes created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'agent_metrics'
ORDER BY indexname;

-- 4. Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'agent_metrics'
ORDER BY policyname;

-- 5. Check if view exists
SELECT 
  schemaname, 
  viewname
FROM pg_views 
WHERE viewname = 'agent_metrics_daily';

-- 6. Count indexes (should be 9: 7 regular + 2 composite + 1 GIN)
SELECT COUNT(*) as total_indexes
FROM pg_indexes 
WHERE tablename = 'agent_metrics';

-- 7. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'agent_metrics';

-- Expected Results:
-- ✅ Table exists in public schema
-- ✅ 16 columns (id, agent_id, tenant_id, operation_type, etc.)
-- ✅ 9-10 indexes (including composite and GIN)
-- ✅ 4 RLS policies (read, insert, update, delete)
-- ✅ View 'agent_metrics_daily' exists
-- ✅ RLS enabled (rowsecurity = true)

