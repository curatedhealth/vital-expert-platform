-- ==========================================
-- FILE: phase2_verification.sql
-- PURPOSE: Standalone verification queries for Phase 2 Executable Skills & LangGraph
-- PHASE: 2 of 9 - Executable Skills Verification
-- ==========================================

-- ==========================================
-- DATA INTEGRITY CHECKS
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 2 VERIFICATION: EXECUTABLE SKILLS & LANGGRAPH';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- Check 1: Verify skill enhancement columns exist
DO $$
DECLARE
    skill_columns TEXT[];
BEGIN
    SELECT ARRAY_AGG(column_name) INTO skill_columns
    FROM information_schema.columns 
    WHERE table_name = 'skills' 
    AND column_name IN ('skill_type', 'python_module', 'callable_name', 'is_executable', 'version');
    
    IF skill_columns IS NULL OR array_length(skill_columns, 1) < 5 THEN
        RAISE WARNING '⚠ Missing columns in skills table: expected 5, found %', COALESCE(array_length(skill_columns, 1), 0);
    ELSE
        RAISE NOTICE '✓ All enhancement columns exist in skills table';
    END IF;
END $$;

-- Check 2: Verify no NULL values in required parameter fields
DO $$
DECLARE
    null_param_names INTEGER;
    null_param_types INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_param_names FROM skill_parameter_definitions WHERE parameter_name IS NULL;
    SELECT COUNT(*) INTO null_param_types FROM skill_parameter_definitions WHERE parameter_type IS NULL;
    
    IF null_param_names > 0 OR null_param_types > 0 THEN
        RAISE WARNING '⚠ Found NULL values in required fields:';
        RAISE WARNING '  Parameters with NULL name: %', null_param_names;
        RAISE WARNING '  Parameters with NULL type: %', null_param_types;
    ELSE
        RAISE NOTICE '✓ No NULL values in required parameter fields';
    END IF;
END $$;

-- Check 3: Verify LangGraph component uniqueness
DO $$
DECLARE
    duplicate_slugs INTEGER;
    duplicate_modules INTEGER;
BEGIN
    SELECT COUNT(*) - COUNT(DISTINCT slug) INTO duplicate_slugs FROM lang_components;
    SELECT COUNT(*) - COUNT(DISTINCT (python_module, callable_name, version)) INTO duplicate_modules FROM lang_components;
    
    IF duplicate_slugs > 0 OR duplicate_modules > 0 THEN
        RAISE WARNING '⚠ Found duplicate components:';
        RAISE WARNING '  Duplicate slugs: %', duplicate_slugs;
        RAISE WARNING '  Duplicate module/callable/version: %', duplicate_modules;
    ELSE
        RAISE NOTICE '✓ All LangGraph components are unique';
    END IF;
END $$;

-- Check 4: Verify foreign key integrity
DO $$
DECLARE
    orphan_params INTEGER;
    orphan_skill_components INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_params 
    FROM skill_parameter_definitions 
    WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = skill_parameter_definitions.skill_id);
    
    SELECT COUNT(*) INTO orphan_skill_components 
    FROM skill_components 
    WHERE NOT EXISTS (SELECT 1 FROM skills WHERE id = skill_components.skill_id)
       OR NOT EXISTS (SELECT 1 FROM lang_components WHERE id = skill_components.component_id);
    
    IF orphan_params > 0 OR orphan_skill_components > 0 THEN
        RAISE WARNING '⚠ Found orphaned records (FK violations):';
        RAISE WARNING '  Orphan skill parameters: %', orphan_params;
        RAISE WARNING '  Orphan skill components: %', orphan_skill_components;
    ELSE
        RAISE NOTICE '✓ No orphaned records - all foreign keys valid';
    END IF;
END $$;

-- ==========================================
-- ROW COUNT SUMMARY
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
    'Skills (total)' as metric,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_executable = true) as executable
FROM skills
UNION ALL
SELECT 
    'Skills with parameters',
    COUNT(DISTINCT skill_id),
    COUNT(*)
FROM skill_parameter_definitions
UNION ALL
SELECT 
    'Agent-Skill assignments',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_enabled = true)
FROM agent_skills
UNION ALL
SELECT 
    'LangGraph Components',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_active = true)
FROM lang_components
UNION ALL
SELECT 
    'Skill-Component mappings',
    COUNT(*),
    COUNT(*) FILTER (WHERE is_primary_component = true)
FROM skill_components;

-- ==========================================
-- COMPONENT TYPE DISTRIBUTION
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== LANGGRAPH COMPONENT TYPE DISTRIBUTION ===';
END $$;

SELECT 
    component_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM lang_components
GROUP BY component_type
ORDER BY count DESC;

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

-- Sample: Executable skills with parameters
SELECT 
    s.skill_name,
    s.skill_type,
    s.python_module,
    s.callable_name,
    COUNT(spd.id) as parameter_count
FROM skills s
LEFT JOIN skill_parameter_definitions spd ON s.id = spd.skill_id
WHERE s.is_executable = true
GROUP BY s.id, s.skill_name, s.skill_type, s.python_module, s.callable_name
LIMIT 10;

-- Sample: Skills with their LangGraph components
SELECT 
    s.skill_name,
    lc.name as component_name,
    lc.component_type,
    lc.python_module,
    sc.is_primary_component
FROM skills s
INNER JOIN skill_components sc ON s.id = sc.skill_id
INNER JOIN lang_components lc ON sc.component_id = lc.id
WHERE lc.is_active = true
LIMIT 10;

-- Sample: Agents with executable skills
SELECT 
    a.name as agent_name,
    s.skill_name,
    s.skill_type,
    ags.execution_priority,
    ags.is_enabled
FROM agents a
INNER JOIN agent_skills ags ON a.id = ags.agent_id
INNER JOIN skills s ON ags.skill_id = s.id
WHERE s.is_executable = true
  AND a.deleted_at IS NULL
ORDER BY a.name, ags.execution_priority
LIMIT 20;

-- Sample: Parameter definitions with binding info
SELECT 
    s.skill_name,
    spd.parameter_name,
    spd.parameter_type,
    spd.is_required,
    spd.binding_source,
    spd.validation_rule
FROM skills s
INNER JOIN skill_parameter_definitions spd ON s.id = spd.skill_id
WHERE s.is_executable = true
ORDER BY s.skill_name, spd.sequence_order
LIMIT 30;

-- ==========================================
-- INDEX VERIFICATION
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== INDEX VERIFICATION ===';
END $$;

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('skills', 'skill_parameter_definitions', 'lang_components', 'skill_components', 'agent_skills')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ==========================================
-- VERIFICATION SUMMARY
-- ==========================================

DO $$
DECLARE
    skill_count INTEGER;
    executable_count INTEGER;
    param_count INTEGER;
    component_count INTEGER;
    mapping_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO skill_count FROM skills;
    SELECT COUNT(*) INTO executable_count FROM skills WHERE is_executable = true;
    SELECT COUNT(*) INTO param_count FROM skill_parameter_definitions;
    SELECT COUNT(*) INTO component_count FROM lang_components WHERE is_active = true;
    SELECT COUNT(*) INTO mapping_count FROM skill_components;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHASE 2 VERIFICATION COMPLETE';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'Total skills: %', skill_count;
    RAISE NOTICE 'Executable skills: %', executable_count;
    RAISE NOTICE 'Skill parameters: %', param_count;
    RAISE NOTICE 'Active LangGraph components: %', component_count;
    RAISE NOTICE 'Skill-component mappings: %', mapping_count;
    RAISE NOTICE '';
    
    IF component_count >= 5 THEN
        RAISE NOTICE '✓ PHASE 2 MIGRATION SUCCESSFUL';
    ELSE
        RAISE WARNING '⚠ PHASE 2 VERIFICATION - Review component seeding';
    END IF;
END $$;

