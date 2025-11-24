-- =====================================================
-- Get AGENTS table schema specifically
-- =====================================================

-- Query 1: AGENTS table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agents'
ORDER BY ordinal_position;

-- Query 2: Sample agent data to confirm structure
SELECT *
FROM agents
LIMIT 2;

-- Query 3: Count agents
SELECT COUNT(*) as total_agents FROM agents;

