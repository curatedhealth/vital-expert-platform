-- Drop old tools tables if they exist with wrong schema
DROP MATERIALIZED VIEW IF EXISTS tool_analytics CASCADE;
DROP TABLE IF EXISTS tool_executions CASCADE;
DROP TABLE IF EXISTS agent_tools CASCADE;  
DROP TABLE IF EXISTS tools CASCADE;

SELECT '✅ Old tools tables dropped (if they existed)' as status;
