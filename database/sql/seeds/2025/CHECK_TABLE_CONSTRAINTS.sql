-- =====================================================================================
-- DIAGNOSTIC: Check which agent/persona assignment tables exist
-- Run this to debug the ON CONFLICT error
-- =====================================================================================

\echo '=== Checking which task assignment tables exist ==='
\echo ''

SELECT 
  table_name,
  CASE 
    WHEN table_name = 'dh_task_agent' THEN '✅ NEW (20251102 migration)'
    WHEN table_name = 'dh_task_agent_assignment' THEN '⚠️  OLD (20251101 migration)'
    WHEN table_name = 'dh_task_persona' THEN '✅ NEW (20251102 migration)'
    ELSE '?'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%task_agent%' 
  OR table_name LIKE '%task_persona%'
ORDER BY table_name;

\echo ''
\echo '=== Checking UNIQUE constraints on dh_task_agent (if it exists) ==='
\echo ''

SELECT
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'dh_task_agent'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name;

\echo ''
\echo '=== Checking UNIQUE constraints on dh_task_persona (if it exists) ==='
\echo ''

SELECT
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'dh_task_persona'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name;

\echo ''
\echo '=== Checking UNIQUE constraints on dh_task_tool ==='
\echo ''

SELECT
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'dh_task_tool'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name;

\echo ''
\echo '=== Checking UNIQUE constraints on dh_task_rag ==='
\echo ''

SELECT
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'dh_task_rag'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.constraint_name;

\echo ''
\echo '=== INTERPRETATION ==='
\echo 'Expected UNIQUE constraints for seed files to work:'
\echo '  dh_task_agent: (tenant_id, task_id, agent_id, assignment_type)'
\echo '  dh_task_persona: (tenant_id, task_id, persona_id, responsibility)'
\echo '  dh_task_tool: (task_id, tool_id)'
\echo '  dh_task_rag: (task_id, rag_source_id)'
\echo ''
\echo 'If your constraints are different, the seed files need to be updated!'
\echo ''

