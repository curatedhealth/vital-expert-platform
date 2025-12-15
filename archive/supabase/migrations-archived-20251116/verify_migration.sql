-- =============================================================================
-- MIGRATION VERIFICATION QUERIES
-- =============================================================================
-- Run these queries in Supabase Dashboard to verify migration success
-- =============================================================================

-- Query 1: Check Total Tables
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Expected: ~123 tables

-- Query 2: Check Total Indexes
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';
-- Expected: ~237+ indexes

-- Query 3: List New Tables from Parts 5-7
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    -- Part 5: Services
    'expert_consultations', 'expert_messages', 'consultation_sessions',
    'panel_discussions', 'panel_members', 'panel_messages', 'panel_rounds',
    'panel_consensus', 'panel_votes', 'panel_templates', 'panel_facilitator_configs',
    -- Part 6: Execution
    'workflow_executions', 'workflow_execution_steps', 'task_executions',
    'solutions', 'solution_workflows', 'solution_library',
    'subscriptions', 'subscription_tiers', 'subscription_usage',
    -- Part 7: Governance
    'token_usage_summary', 'cost_allocation', 'analytics_events',
    'user_sessions', 'audit_log', 'alerts', 'rate_limit_usage', 'quota_tracking'
  )
ORDER BY table_name;
-- Expected: All 27 tables exist

-- Query 4: Check Part 8 Indexes
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_consultations_%'
    OR indexname LIKE 'idx_panels_%'
    OR indexname LIKE 'idx_workflow_execs_%'
    OR indexname LIKE 'idx_jtbd_personas_%'
    OR indexname LIKE 'idx_analytics_events_%'
  )
ORDER BY indexname;
-- Expected: ~15 new indexes from Part 8

-- Query 5: Check ENUM Types
SELECT typname
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;
-- Expected: 20 ENUM types

-- Query 6: Verify Core Tables Exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN '✅'
    ELSE '❌'
  END as tenants,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN '✅'
    ELSE '❌'
  END as user_profiles,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agents') THEN '✅'
    ELSE '❌'
  END as agents,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personas') THEN '✅'
    ELSE '❌'
  END as personas,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs_to_be_done') THEN '✅'
    ELSE '❌'
  END as jobs_to_be_done,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN '✅'
    ELSE '❌'
  END as workflows,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN '✅'
    ELSE '❌'
  END as tasks;
-- Expected: All ✅

-- Query 7: Check Data Counts (Your Existing Data)
SELECT
  (SELECT COUNT(*) FROM agents) as agents_count,
  (SELECT COUNT(*) FROM personas) as personas_count,
  (SELECT COUNT(*) FROM jobs_to_be_done) as jtbds_count,
  (SELECT COUNT(*) FROM workflows) as workflows_count,
  (SELECT COUNT(*) FROM tasks) as tasks_count;
-- Expected: 254 agents, 335 personas, 338 JTBDs (if data already imported)

-- Query 8: Check Foreign Key Constraints
SELECT
  tc.table_name,
  kcu.column_name,
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
  AND tc.table_name IN ('expert_consultations', 'panel_discussions', 'workflow_executions')
ORDER BY tc.table_name, kcu.column_name;
-- Expected: FK constraints to tenants, user_profiles, agents, etc.

-- Query 9: Check Index Usage Statistics (Optional - Run After Some Usage)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agents', 'personas', 'jobs_to_be_done', 'expert_consultations', 'panel_discussions')
ORDER BY tablename, idx_scan DESC;
-- Shows which indexes are being used

-- Query 10: Check for Missing Columns (Should be empty or show expected missing columns)
SELECT
  'agents' as table_name,
  ARRAY_AGG(column_name) FILTER (WHERE column_name IN ('is_active', 'function_id', 'tenant_id', 'average_rating')) as missing_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agents'
HAVING COUNT(*) FILTER (WHERE column_name IN ('is_active', 'function_id', 'tenant_id', 'average_rating')) < 4
UNION ALL
SELECT
  'workflows' as table_name,
  ARRAY_AGG(column_name) FILTER (WHERE column_name IN ('slug', 'workflow_type', 'is_active', 'tags')) as missing_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workflows'
HAVING COUNT(*) FILTER (WHERE column_name IN ('slug', 'workflow_type', 'is_active', 'tags')) < 4
UNION ALL
SELECT
  'tasks' as table_name,
  ARRAY_AGG(column_name) FILTER (WHERE column_name IN ('slug', 'task_type', 'is_active')) as missing_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tasks'
HAVING COUNT(*) FILTER (WHERE column_name IN ('slug', 'task_type', 'is_active')) < 3;
-- Expected: Shows which columns are missing (these are why indexes were skipped)
