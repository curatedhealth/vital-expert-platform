-- Quick diagnostic query to check what exists
SELECT 
    'evidence_sources' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'evidence_sources') as exists
UNION ALL
SELECT 
    'evidence_links',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'evidence_links')
UNION ALL
SELECT 
    'role_evidence_sources',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'role_evidence_sources')
UNION ALL
SELECT 
    'persona_evidence_sources',
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'persona_evidence_sources');

-- Check if evidence_sources has evidence_source_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'evidence_sources'
ORDER BY ordinal_position;

