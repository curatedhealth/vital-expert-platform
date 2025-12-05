-- Check the actual enum type for proficiency_level
SELECT 
    column_name,
    udt_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'agent_skills'
    AND column_name = 'proficiency_level';

-- Get enum values
SELECT 
    e.enumlabel as valid_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN information_schema.columns c ON t.typname = c.udt_name
WHERE c.table_name = 'agent_skills' 
    AND c.column_name = 'proficiency_level'
ORDER BY e.enumsortorder;

