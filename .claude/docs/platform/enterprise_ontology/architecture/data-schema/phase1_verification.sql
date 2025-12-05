-- ==========================================
-- FILE: phase1_verification.sql
-- PURPOSE: Standalone verification queries for Phase 1 Agent Cleanup
-- PHASE: 1 of 9 - Foundation Cleanup Verification
-- ==========================================

-- ==========================================
-- DATA INTEGRITY CHECKS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 1 VERIFICATION: DATA INTEGRITY CHECKS';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Check 1: Verify no NULL required fields in new tables
DO $$
DECLARE
    null_specializations INTEGER;
    null_tags INTEGER;
    null_prompt_starters INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_specializations FROM agent_specializations WHERE specialization IS NULL;
    SELECT COUNT(*) INTO null_tags FROM agent_tags WHERE tag IS NULL;
    SELECT COUNT(*) INTO null_prompt_starters FROM agent_prompt_starters WHERE text IS NULL;
    
    IF null_specializations > 0 OR null_tags > 0 OR null_prompt_starters > 0 THEN
        RAISE WARNING '⚠ Found NULL values in required fields:';
        RAISE WARNING '  Specializations with NULL: %', null_specializations;
        RAISE WARNING '  Tags with NULL: %', null_tags;
        RAISE WARNING '  Prompt starters with NULL text: %', null_prompt_starters;
    ELSE
        RAISE NOTICE '✓ No NULL values in required fields';
    END IF;
END $$;

-- Check 2: Verify foreign key integrity
DO $$
DECLARE
    orphan_specializations INTEGER;
    orphan_tags INTEGER;
    orphan_tenants INTEGER;
    orphan_color_schemes INTEGER;
    orphan_personality_traits INTEGER;
    orphan_prompt_starters INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_specializations 
    FROM agent_specializations 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_specializations.agent_id);
    
    SELECT COUNT(*) INTO orphan_tags 
    FROM agent_tags 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_tags.agent_id);
    
    SELECT COUNT(*) INTO orphan_tenants 
    FROM agent_tenants 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_tenants.agent_id);
    
    SELECT COUNT(*) INTO orphan_color_schemes 
    FROM agent_color_schemes 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_color_schemes.agent_id);
    
    SELECT COUNT(*) INTO orphan_personality_traits 
    FROM agent_personality_traits 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_personality_traits.agent_id);
    
    SELECT COUNT(*) INTO orphan_prompt_starters 
    FROM agent_prompt_starters 
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE id = agent_prompt_starters.agent_id);
    
    IF orphan_specializations > 0 OR orphan_tags > 0 OR orphan_tenants > 0 OR 
       orphan_color_schemes > 0 OR orphan_personality_traits > 0 OR orphan_prompt_starters > 0 THEN
        RAISE WARNING '⚠ Found orphaned records (FK violations):';
        RAISE WARNING '  Orphan specializations: %', orphan_specializations;
        RAISE WARNING '  Orphan tags: %', orphan_tags;
        RAISE WARNING '  Orphan tenants: %', orphan_tenants;
        RAISE WARNING '  Orphan color schemes: %', orphan_color_schemes;
        RAISE WARNING '  Orphan personality traits: %', orphan_personality_traits;
        RAISE WARNING '  Orphan prompt starters: %', orphan_prompt_starters;
    ELSE
        RAISE NOTICE '✓ No orphaned records - all foreign keys valid';
    END IF;
END $$;

-- Check 3: Verify dropped columns no longer exist
DO $$
DECLARE
    remaining_columns TEXT[];
BEGIN
    SELECT ARRAY_AGG(column_name) INTO remaining_columns
    FROM information_schema.columns 
    WHERE table_name = 'agents' 
    AND column_name IN ('specializations', 'tags', 'allowed_tenants', 'knowledge_domains', 
                        'color_scheme', 'personality_traits', 'prompt_starters');
    
    IF remaining_columns IS NOT NULL AND array_length(remaining_columns, 1) > 0 THEN
        RAISE WARNING '⚠ The following columns still exist in agents table: %', remaining_columns;
    ELSE
        RAISE NOTICE '✓ All JSONB/array columns successfully dropped from agents table';
    END IF;
END $$;

-- ==========================================
-- ROW COUNT COMPARISONS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'ROW COUNT SUMMARY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

SELECT 
    'Agents (total)' as metric,
    COUNT(*) as count
FROM agents WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Agent Specializations',
    COUNT(*)
FROM agent_specializations
UNION ALL
SELECT 
    'Agent Tags',
    COUNT(*)
FROM agent_tags
UNION ALL
SELECT 
    'Agent Tenants',
    COUNT(*)
FROM agent_tenants
UNION ALL
SELECT 
    'Agent Color Schemes',
    COUNT(*)
FROM agent_color_schemes
UNION ALL
SELECT 
    'Agent Personality Traits',
    COUNT(*)
FROM agent_personality_traits
UNION ALL
SELECT 
    'Agent Prompt Starters',
    COUNT(*)
FROM agent_prompt_starters;

-- ==========================================
-- SAMPLE DATA QUERIES
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'SAMPLE DATA QUERIES';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Sample: Agents with their specializations
SELECT 
    a.name as agent_name,
    STRING_AGG(ags.specialization, ', ' ORDER BY ags.specialization) as specializations,
    COUNT(ags.id) as specialization_count
FROM agents a
LEFT JOIN agent_specializations ags ON a.id = ags.agent_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name
LIMIT 10;

-- Sample: Agents with their tags
SELECT 
    a.name as agent_name,
    STRING_AGG(agt.tag, ', ' ORDER BY agt.tag) as tags,
    COUNT(agt.id) as tag_count
FROM agents a
LEFT JOIN agent_tags agt ON a.id = agt.agent_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name
LIMIT 10;

-- Sample: Agents with color schemes
SELECT 
    a.name as agent_name,
    acs.primary_color,
    acs.secondary_color,
    acs.accent_color
FROM agents a
INNER JOIN agent_color_schemes acs ON a.id = acs.agent_id
WHERE a.deleted_at IS NULL
LIMIT 10;

-- Sample: Agents with personality traits
SELECT 
    a.name as agent_name,
    apt.trait_name,
    apt.trait_value
FROM agents a
INNER JOIN agent_personality_traits apt ON a.id = apt.agent_id
WHERE a.deleted_at IS NULL
ORDER BY a.name, apt.trait_name
LIMIT 20;

-- Sample: Agents with prompt starters
SELECT 
    a.name as agent_name,
    aps.text as prompt_text,
    aps.icon,
    aps.sequence_order
FROM agents a
INNER JOIN agent_prompt_starters aps ON a.id = aps.agent_id
WHERE a.deleted_at IS NULL AND aps.is_active = true
ORDER BY a.name, aps.sequence_order
LIMIT 20;

-- ==========================================
-- AGENTS TABLE COLUMN CHECK
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'FINAL AGENTS TABLE STRUCTURE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- List remaining columns in agents table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'agents'
ORDER BY ordinal_position;

-- ==========================================
-- VERIFICATION SUMMARY
-- ==========================================

DO $$
DECLARE
    agent_count INTEGER;
    backup_count INTEGER;
    table_count INTEGER;
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO backup_count FROM agents_backup_pre_agentos2;
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_name IN ('agent_specializations', 'agent_tags', 'agent_tenants', 
                         'agent_color_schemes', 'agent_personality_traits', 'agent_prompt_starters');
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE indexname LIKE 'idx_agent_%' AND tablename LIKE 'agent_%';
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 1 VERIFICATION COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Agents (active): %', agent_count;
    RAISE NOTICE 'Backup row count: %', backup_count;
    RAISE NOTICE 'New tables created: %', table_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE '';
    
    IF backup_count = agent_count AND table_count = 6 THEN
        RAISE NOTICE '✓ PHASE 1 MIGRATION SUCCESSFUL';
    ELSE
        RAISE WARNING '⚠ PHASE 1 VERIFICATION - Review counts above';
    END IF;
END $$;

