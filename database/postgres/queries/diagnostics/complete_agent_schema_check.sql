-- =====================================================
-- Complete Agent Schema Diagnostic
-- =====================================================
-- Run this to see the exact schema for agents and hierarchies
-- =====================================================

-- Query 1: Agents table complete schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agents'
ORDER BY ordinal_position;

-- Query 2: Agent Hierarchies table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_hierarchies'
ORDER BY ordinal_position;

-- Query 3: Check for other agent-related tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE '%agent%'
ORDER BY table_name;

-- Query 4: Show current agents in DB
SELECT 
    id,
    name,
    slug,
    LEFT(description, 60) || '...' as description_preview,
    created_at
FROM agents
ORDER BY created_at DESC;

-- Query 5: Show current hierarchies
SELECT 
    ah.id,
    pa.name as parent_agent,
    ca.name as child_agent,
    ah.relationship_type,
    ah.auto_delegate,
    ah.confidence_threshold
FROM agent_hierarchies ah
JOIN agents pa ON ah.parent_agent_id = pa.id
JOIN agents ca ON ah.child_agent_id = ca.id
ORDER BY pa.name, ca.name;

-- Query 6: Check for agent_skills table
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_skills'
ORDER BY ordinal_position;

-- Query 7: Check for agent_tools table
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_tools'
ORDER BY ordinal_position;

-- Query 8: Check for agent_knowledge table
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_knowledge'
ORDER BY ordinal_position;

-- Query 9: Check for agent_graphs table (from AgentOS 2.0)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_graphs'
ORDER BY ordinal_position;

-- Query 10: Check for rag_profiles table (from Phase 1)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'rag_profiles'
ORDER BY ordinal_position;

