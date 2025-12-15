-- ============================================================================
-- Quick Check: Do knowledge source tables have data?
-- ============================================================================

-- Check domains
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM domains LIMIT 1) THEN
        RAISE NOTICE 'domains table has data';
    ELSE
        RAISE NOTICE 'domains table is EMPTY';
    END IF;
END $$;

SELECT 'domains count' as section, COUNT(*) as count FROM domains;
SELECT 'domains sample' as section, * FROM domains LIMIT 5;

-- Check knowledge_base
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM knowledge_base LIMIT 1) THEN
        RAISE NOTICE 'knowledge_base table has data';
    ELSE
        RAISE NOTICE 'knowledge_base table is EMPTY';
    END IF;
END $$;

SELECT 'knowledge_base count' as section, COUNT(*) as count FROM knowledge_base;

-- Check knowledge_sources
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM knowledge_sources LIMIT 1) THEN
        RAISE NOTICE 'knowledge_sources table has data';
    ELSE
        RAISE NOTICE 'knowledge_sources table is EMPTY';
    END IF;
END $$;

SELECT 'knowledge_sources count' as section, COUNT(*) as count FROM knowledge_sources;
SELECT 'knowledge_sources schema' as section, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'knowledge_sources' AND table_schema = 'public'
ORDER BY ordinal_position;
SELECT 'knowledge_sources sample' as section, * FROM knowledge_sources LIMIT 5;

