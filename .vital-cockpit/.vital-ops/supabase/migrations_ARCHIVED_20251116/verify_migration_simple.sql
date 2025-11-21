-- =============================================================================
-- SIMPLE MIGRATION VERIFICATION QUERIES
-- =============================================================================
-- Simplified queries that work with Supabase Dashboard
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

-- Query 3: List New Tables from Part 5 (Services)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'expert_consultations',
    'expert_messages',
    'consultation_sessions',
    'panel_discussions',
    'panel_members',
    'panel_messages',
    'panel_rounds'
  )
ORDER BY table_name;
-- Expected: All 7 tables exist

-- Query 4: List New Tables from Part 6 (Execution)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'workflow_executions',
    'workflow_execution_steps',
    'task_executions',
    'solutions',
    'solution_workflows'
  )
ORDER BY table_name;
-- Expected: All 5 tables exist

-- Query 5: List New Tables from Part 7 (Governance)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'token_usage_summary',
    'cost_allocation',
    'analytics_events',
    'user_sessions',
    'audit_log',
    'alerts',
    'rate_limit_usage',
    'quota_tracking'
  )
ORDER BY table_name;
-- Expected: All 8 tables exist

-- Query 6: Check Part 8 Indexes Exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_consultations_tenant_status',
    'idx_panels_tenant_status',
    'idx_consultations_user_started',
    'idx_workflow_execs_user_started'
  )
ORDER BY indexname;
-- Expected: These indexes from Part 8

-- Query 7: Check ENUM Types
SELECT typname
FROM pg_type
WHERE typtype = 'e'
  AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;
-- Expected: 20 ENUM types

-- Query 8: Verify Core Tables Exist
SELECT
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') as tenants_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') as user_profiles_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agents') as agents_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'personas') as personas_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'jobs_to_be_done') as jtbds_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') as workflows_exists,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') as tasks_exists;
-- Expected: All true

-- Query 9: Check Data Counts (Your Existing Data)
SELECT
  (SELECT COUNT(*) FROM agents) as agents_count,
  (SELECT COUNT(*) FROM personas) as personas_count,
  (SELECT COUNT(*) FROM jobs_to_be_done) as jtbds_count,
  (SELECT COUNT(*) FROM workflows) as workflows_count,
  (SELECT COUNT(*) FROM tasks) as tasks_count;
-- Shows current record counts

-- Query 10: List All Tables (for manual verification)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Review the complete list
