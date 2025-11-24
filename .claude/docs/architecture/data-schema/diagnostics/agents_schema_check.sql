-- =====================================================
-- Agents Table Schema Diagnostic Query
-- =====================================================
-- Run this in Supabase SQL Editor to see the exact schema
-- =====================================================

-- Query 1: Get all column names and their data types
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

-- Query 2: Get table constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'agents'
ORDER BY tc.constraint_type, kcu.column_name;

-- Query 3: Get foreign key relationships
SELECT
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'agents'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Query 4: Check if agent_hierarchies exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'agent_hierarchies'
) as agent_hierarchies_exists;

-- Query 5: If agent_hierarchies exists, show its schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_hierarchies'
ORDER BY ordinal_position;

-- Query 6: Sample one agent to see actual data structure
SELECT 
    id,
    name,
    description,
    system_prompt,
    created_at,
    updated_at
FROM agents
LIMIT 1;

