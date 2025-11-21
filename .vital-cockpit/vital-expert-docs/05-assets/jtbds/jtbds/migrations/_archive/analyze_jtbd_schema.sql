-- ============================================================================
-- JTBD Schema Analysis Queries
-- Run these to understand the full JTBD data structure
-- Date: 2025-11-19
-- ============================================================================

-- ============================================================================
-- 1. ALL JTBD-RELATED TABLES
-- ============================================================================

SELECT
    '1. JTBD TABLES' as section,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND (
    table_name LIKE 'jtbd%'
    OR table_name = 'jobs_to_be_done'
    OR table_name = 'capability_jtbd_mapping'
  )
ORDER BY table_name;

-- ============================================================================
-- 2. DETAILED COLUMN STRUCTURE FOR ALL JTBD TABLES
-- ============================================================================

SELECT
    '2. COLUMN DETAILS' as section,
    c.table_name,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.is_nullable,
    c.column_default,
    CASE
        WHEN c.udt_name = 'jsonb' THEN 'JSONB'
        WHEN c.udt_name = 'json' THEN 'JSON'
        WHEN c.data_type = 'ARRAY' THEN 'ARRAY'
        ELSE 'NORMALIZED'
    END as storage_type
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (
    c.table_name LIKE 'jtbd%'
    OR c.table_name = 'jobs_to_be_done'
    OR c.table_name = 'capability_jtbd_mapping'
  )
ORDER BY c.table_name, c.ordinal_position;

-- ============================================================================
-- 3. FOREIGN KEY RELATIONSHIPS
-- ============================================================================

SELECT
    '3. FK RELATIONSHIPS' as section,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    tc.table_name LIKE 'jtbd%'
    OR tc.table_name = 'jobs_to_be_done'
    OR tc.table_name = 'capability_jtbd_mapping'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 4. PRIMARY KEYS AND UNIQUE CONSTRAINTS
-- ============================================================================

SELECT
    '4. CONSTRAINTS' as section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND (
    tc.table_name LIKE 'jtbd%'
    OR tc.table_name = 'jobs_to_be_done'
    OR tc.table_name = 'capability_jtbd_mapping'
  )
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

-- ============================================================================
-- 5. CURRENT DATA COUNTS
-- ============================================================================

WITH table_counts AS (
    SELECT 'jobs_to_be_done' as table_name, COUNT(*) as record_count FROM jobs_to_be_done
    UNION ALL SELECT 'jtbd_personas', COUNT(*) FROM jtbd_personas
    UNION ALL SELECT 'jtbd_outcomes', COUNT(*) FROM jtbd_outcomes
    UNION ALL SELECT 'jtbd_obstacles', COUNT(*) FROM jtbd_obstacles
    UNION ALL SELECT 'jtbd_constraints', COUNT(*) FROM jtbd_constraints
    UNION ALL SELECT 'jtbd_workflow_stages', COUNT(*) FROM jtbd_workflow_stages
    UNION ALL SELECT 'jtbd_competitive_alternatives', COUNT(*) FROM jtbd_competitive_alternatives
    UNION ALL SELECT 'jtbd_value_drivers', COUNT(*) FROM jtbd_value_drivers
    UNION ALL SELECT 'jtbd_solution_requirements', COUNT(*) FROM jtbd_solution_requirements
    UNION ALL SELECT 'jtbd_gen_ai_opportunities', COUNT(*) FROM jtbd_gen_ai_opportunities
    UNION ALL SELECT 'jtbd_gen_ai_use_cases', COUNT(*) FROM jtbd_gen_ai_use_cases
    UNION ALL SELECT 'jtbd_evidence_sources', COUNT(*) FROM jtbd_evidence_sources
    UNION ALL SELECT 'capability_jtbd_mapping', COUNT(*) FROM capability_jtbd_mapping
    UNION ALL SELECT 'jtbd_kpis', COUNT(*) FROM jtbd_kpis
    UNION ALL SELECT 'jtbd_success_criteria', COUNT(*) FROM jtbd_success_criteria
    UNION ALL SELECT 'jtbd_dependencies', COUNT(*) FROM jtbd_dependencies
    UNION ALL SELECT 'jtbd_workflow_activities', COUNT(*) FROM jtbd_workflow_activities
)
SELECT
    '5. DATA COUNTS' as section,
    table_name,
    record_count,
    CASE
        WHEN record_count = 0 THEN 'EMPTY'
        WHEN record_count < 10 THEN 'LOW'
        WHEN record_count < 50 THEN 'MEDIUM'
        ELSE 'HIGH'
    END as data_status
FROM table_counts
ORDER BY
    CASE table_name
        WHEN 'jobs_to_be_done' THEN 1
        WHEN 'jtbd_personas' THEN 2
        WHEN 'jtbd_outcomes' THEN 3
        ELSE 99
    END,
    table_name;

-- ============================================================================
-- 6. JTBD COVERAGE ANALYSIS (Per JTBD)
-- ============================================================================

SELECT
    '6. JTBD COVERAGE' as section,
    j.code,
    j.name,
    j.functional_area,
    j.complexity,
    j.status,

    -- Org mapping
    CASE WHEN j.industry_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_industry,
    CASE WHEN j.org_function_id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_function,
    (SELECT COUNT(*) FROM jtbd_personas WHERE jtbd_id = j.id) as persona_count,

    -- ODI coverage
    (SELECT COUNT(*) FROM jtbd_outcomes WHERE jtbd_id = j.id) as outcomes,
    (SELECT COUNT(*) FROM jtbd_obstacles WHERE jtbd_id = j.id) as obstacles,
    (SELECT COUNT(*) FROM jtbd_constraints WHERE jtbd_id = j.id) as constraints,
    (SELECT COUNT(*) FROM jtbd_workflow_stages WHERE jtbd_id = j.id) as workflow_stages,
    (SELECT COUNT(*) FROM jtbd_value_drivers WHERE jtbd_id = j.id) as value_drivers,

    -- Gen AI
    CASE WHEN EXISTS(SELECT 1 FROM jtbd_gen_ai_opportunities WHERE jtbd_id = j.id)
         THEN 'Yes' ELSE 'No' END as has_gen_ai,
    (SELECT COUNT(*) FROM jtbd_gen_ai_use_cases WHERE jtbd_id = j.id) as ai_use_cases,

    -- Evidence
    (SELECT COUNT(*) FROM jtbd_evidence_sources WHERE jtbd_id = j.id) as evidence_sources

FROM jobs_to_be_done j
WHERE j.deleted_at IS NULL
ORDER BY j.code;

-- ============================================================================
-- 7. ODI OUTCOME ANALYSIS
-- ============================================================================

SELECT
    '7. ODI OUTCOMES' as section,
    j.code as jtbd_code,
    jo.outcome_id,
    jo.outcome_statement,
    jo.outcome_type,
    jo.importance_score,
    jo.satisfaction_score,
    jo.opportunity_score,
    jo.opportunity_priority,
    jo.evidence_source
FROM jtbd_outcomes jo
JOIN jobs_to_be_done j ON j.id = jo.jtbd_id
ORDER BY jo.opportunity_score DESC NULLS LAST;

-- ============================================================================
-- 8. PERSONA MAPPING ANALYSIS
-- ============================================================================

SELECT
    '8. PERSONA MAPPINGS' as section,
    j.code as jtbd_code,
    j.name as jtbd_name,
    p.name as persona_name,
    p.seniority_level,
    r.name as role_name,
    f.name as function_name,
    jp.relevance_score,
    jp.is_primary,
    jp.mapping_source
FROM jtbd_personas jp
JOIN jobs_to_be_done j ON j.id = jp.jtbd_id
JOIN personas p ON p.id = jp.persona_id
LEFT JOIN org_roles r ON r.id = p.role_id
LEFT JOIN org_functions f ON f.id = p.function_id
ORDER BY j.code, jp.relevance_score DESC;

-- ============================================================================
-- 9. GEN AI OPPORTUNITIES SUMMARY
-- ============================================================================

SELECT
    '9. GEN AI OPPORTUNITIES' as section,
    j.code as jtbd_code,
    j.name as jtbd_name,
    gai.automation_potential_score,
    gai.augmentation_potential_score,
    (gai.automation_potential_score + gai.augmentation_potential_score) as total_ai_score,
    gai.total_estimated_value,
    gai.implementation_complexity,
    gai.time_to_value,
    gai.key_ai_capabilities,
    (SELECT COUNT(*) FROM jtbd_gen_ai_use_cases WHERE gen_ai_opportunity_id = gai.id) as use_case_count
FROM jtbd_gen_ai_opportunities gai
JOIN jobs_to_be_done j ON j.id = gai.jtbd_id
ORDER BY (gai.automation_potential_score + gai.augmentation_potential_score) DESC NULLS LAST;

-- ============================================================================
-- 10. COMPLETENESS SUMMARY
-- ============================================================================

WITH completeness AS (
    SELECT
        j.id,
        j.code,
        j.name,

        -- Calculate completeness score (0-10)
        (
            CASE WHEN j.industry_id IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN j.org_function_id IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_personas WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_outcomes WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_obstacles WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_constraints WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_workflow_stages WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_value_drivers WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_gen_ai_opportunities WHERE jtbd_id = j.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS(SELECT 1 FROM jtbd_evidence_sources WHERE jtbd_id = j.id) THEN 1 ELSE 0 END
        ) as completeness_score

    FROM jobs_to_be_done j
    WHERE j.deleted_at IS NULL
)
SELECT
    '10. COMPLETENESS' as section,
    code,
    name,
    completeness_score,
    ROUND(completeness_score * 10.0, 0) as completeness_pct,
    CASE
        WHEN completeness_score >= 8 THEN 'COMPLETE'
        WHEN completeness_score >= 5 THEN 'PARTIAL'
        WHEN completeness_score >= 2 THEN 'STARTED'
        ELSE 'EMPTY'
    END as status
FROM completeness
ORDER BY completeness_score DESC, code;

-- ============================================================================
-- 11. SCHEMA RELATIONSHIP DIAGRAM (Text-based)
-- ============================================================================

SELECT '11. SCHEMA RELATIONSHIPS' as section,
'
JTBD SCHEMA RELATIONSHIPS
==========================

jobs_to_be_done (Core)
├── industry_id → industries
├── org_function_id → org_functions
├── domain_id → domains
├── strategic_priority_id → strategic_priorities
│
├── ORGANIZATIONAL CONTEXT
│   └── jtbd_personas → personas
│       └── relevance_score, is_primary
│
├── ODI ANALYSIS
│   ├── jtbd_outcomes
│   │   └── importance, satisfaction → opportunity_score
│   ├── jtbd_obstacles
│   │   └── obstacle_type, severity
│   ├── jtbd_constraints
│   │   └── constraint_type, impact
│   ├── jtbd_workflow_stages
│   │   └── jtbd_workflow_activities
│   ├── jtbd_value_drivers
│   │   └── quantified_impact, beneficiary
│   ├── jtbd_kpis
│   └── jtbd_success_criteria
│
├── MARKET CONTEXT
│   ├── jtbd_competitive_alternatives
│   ├── jtbd_evidence_sources
│   └── jtbd_solution_requirements
│
├── GEN AI STRATEGY
│   └── jtbd_gen_ai_opportunities (1:1)
│       └── jtbd_gen_ai_use_cases (1:N)
│
├── DEPENDENCIES
│   └── jtbd_dependencies (self-referential)
│
└── CAPABILITY MAPPING
    └── capability_jtbd_mapping → capabilities
' as diagram;

-- ============================================================================
-- 12. ENUMS USED IN JTBD SCHEMA
-- ============================================================================

SELECT
    '12. ENUMS' as section,
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
    'functional_area_type', 'job_category_type', 'complexity_type',
    'frequency_type', 'jtbd_status', 'mapping_source_type',
    'outcome_type', 'obstacle_type', 'constraint_type',
    'severity_type', 'requirement_category_type',
    'evidence_source_type', 'confidence_level_type'
)
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================================================
-- 13. INDEXES ON JTBD TABLES
-- ============================================================================

SELECT
    '13. INDEXES' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'jtbd%'
    OR tablename = 'jobs_to_be_done'
    OR tablename = 'capability_jtbd_mapping'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- END OF ANALYSIS
-- ============================================================================

SELECT 'JTBD Schema Analysis Complete' as status;
