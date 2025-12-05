-- Check the relationship_type constraint on agent_hierarchies
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'agent_hierarchies'::regclass
AND conname LIKE '%relationship_type%';

