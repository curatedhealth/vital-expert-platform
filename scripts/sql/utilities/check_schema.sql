-- Check what prompt-related tables exist and their schemas
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE '%prompt%'
  AND table_name NOT LIKE '%_old%'
ORDER BY table_name, ordinal_position;

-- Count records in each table
SELECT 'dh_prompt' as table_name, COUNT(*) as count FROM dh_prompt WHERE is_active = true
UNION ALL
SELECT 'dh_prompt_suite', COUNT(*) FROM dh_prompt_suite WHERE is_active = true;
