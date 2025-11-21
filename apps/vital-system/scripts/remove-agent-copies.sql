-- Remove all agent copies from the database
-- This script removes:
-- 1. All agents with is_user_copy = true
-- 2. All agents with "(My Copy)" or "(Copy)" in display_name metadata

BEGIN;

-- Step 1: Find and list agent copies before deletion
DO $$
DECLARE
    copy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO copy_count
    FROM agents
    WHERE is_user_copy = true 
       OR (metadata->>'display_name')::text ILIKE '%My Copy%'
       OR (metadata->>'display_name')::text ILIKE '%(Copy)%';
    
    RAISE NOTICE 'Found % agent copy(ies) to delete', copy_count;
END $$;

-- Step 2: Delete from user_agents table first (foreign key constraint)
DELETE FROM user_agents
WHERE agent_id IN (
    SELECT id 
    FROM agents
    WHERE is_user_copy = true 
       OR (metadata->>'display_name')::text ILIKE '%My Copy%'
       OR (metadata->>'display_name')::text ILIKE '%(Copy)%'
);

-- Step 3: Delete agent copies from agents table
DELETE FROM agents
WHERE is_user_copy = true 
   OR (metadata->>'display_name')::text ILIKE '%My Copy%'
   OR (metadata->>'display_name')::text ILIKE '%(Copy)%';

COMMIT;

-- Verify deletion
SELECT COUNT(*) as remaining_copies
FROM agents
WHERE is_user_copy = true 
   OR (metadata->>'display_name')::text ILIKE '%My Copy%'
   OR (metadata->>'display_name')::text ILIKE '%(Copy)%';
