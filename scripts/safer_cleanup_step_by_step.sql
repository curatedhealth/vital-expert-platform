-- ============================================================================
-- SAFER STEP-BY-STEP CLEANUP
-- ============================================================================
-- Execute these queries ONE AT A TIME to safely clean up duplicates
-- ============================================================================

-- STEP 1: ANALYZE THE PROBLEM
-- ============================================================================
-- See how many duplicates exist
SELECT 
    COUNT(*) as total_agents,
    COUNT(DISTINCT name) as unique_agents,
    COUNT(*) - COUNT(DISTINCT name) as duplicate_records,
    ROUND((COUNT(*) - COUNT(DISTINCT name)) * 100.0 / COUNT(*), 1) as duplicate_percentage
FROM agents;

-- STEP 2: PREVIEW DUPLICATES
-- ============================================================================
-- See which agents are duplicated and how many times
SELECT 
    name,
    COUNT(*) as duplicate_count,
    string_agg(DISTINCT metadata->>'source', ', ') as sources,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM agents
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, name
LIMIT 50;

-- STEP 3: PREVIEW WHICH RECORDS WILL BE KEPT VS DELETED
-- ============================================================================
-- This shows you which record will be KEPT (the oldest one) for each agent
WITH ranked_agents AS (
    SELECT 
        id,
        name,
        title,
        created_at,
        metadata->>'source' as source,
        metadata->>'batch' as batch,
        ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
    FROM agents
)
SELECT 
    CASE WHEN rn = 1 THEN '✅ KEEP' ELSE '❌ DELETE' END as action,
    name,
    title,
    created_at,
    source,
    batch,
    id
FROM ranked_agents
WHERE name IN (
    SELECT name FROM agents GROUP BY name HAVING COUNT(*) > 1
)
ORDER BY name, rn
LIMIT 100;

-- STEP 4: COUNT HOW MANY WILL BE DELETED
-- ============================================================================
WITH ranked_agents AS (
    SELECT 
        id,
        name,
        ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
    FROM agents
)
SELECT 
    COUNT(*) as records_to_delete,
    COUNT(DISTINCT name) as agents_affected
FROM ranked_agents
WHERE rn > 1;

-- STEP 5: DELETE DUPLICATES (KEEPING OLDEST RECORD)
-- ============================================================================
-- ⚠️ WARNING: This will permanently delete duplicate records!
-- Only run this after reviewing the preview above!

WITH ranked_agents AS (
    SELECT 
        id,
        name,
        ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
    FROM agents
)
DELETE FROM agents
WHERE id IN (
    SELECT id FROM ranked_agents WHERE rn > 1
);

-- STEP 6: VERIFY DUPLICATES ARE GONE
-- ============================================================================
SELECT 
    COUNT(*) as total_agents,
    COUNT(DISTINCT name) as unique_agents,
    COUNT(*) - COUNT(DISTINCT name) as remaining_duplicates
FROM agents;

-- ============================================================================
-- PART 2: FIX SLUG NAMES TO DISPLAY NAMES
-- ============================================================================

-- STEP 7: PREVIEW NAME CHANGES
-- ============================================================================
SELECT 
    name as current_slug_name,
    CASE
        -- Special acronyms
        WHEN LOWER(name) = 'heor-director' THEN 'HEOR Director'
        WHEN LOWER(name) = 'nlp_expert' THEN 'NLP Expert'
        WHEN LOWER(name) = 'ai_ml_model_validator' THEN 'AI/ML Model Validator'
        WHEN LOWER(name) = 'etl_developer' THEN 'ETL Developer'
        WHEN LOWER(name) = 'dmpk_specialist' THEN 'DMPK Specialist'
        WHEN LOWER(name) = 'ind_enabling_study_coordinator' THEN 'IND Enabling Study Coordinator'
        
        -- Hyphens to spaces
        WHEN name LIKE '%-%' THEN INITCAP(REPLACE(name, '-', ' '))
        
        -- Underscores to spaces
        WHEN name LIKE '%_%' THEN INITCAP(REPLACE(name, '_', ' '))
        
        ELSE INITCAP(name)
    END as new_display_name,
    title as current_title,
    COUNT(*) as agent_count
FROM agents
WHERE name LIKE '%-%' OR name LIKE '%_%'
GROUP BY name, title
ORDER BY name
LIMIT 50;

-- STEP 8: UPDATE NAMES FROM SLUG TO DISPLAY FORMAT
-- ============================================================================
-- ⚠️ WARNING: This will change agent names!
-- Only run this after reviewing the preview above!

UPDATE agents
SET name = CASE
    -- Special acronyms
    WHEN LOWER(name) = 'heor-director' THEN 'HEOR Director'
    WHEN LOWER(name) = 'nlp_expert' THEN 'NLP Expert'
    WHEN LOWER(name) = 'ai_ml_model_validator' THEN 'AI/ML Model Validator'
    WHEN LOWER(name) = 'etl_developer' THEN 'ETL Developer'
    WHEN LOWER(name) = 'dmpk_specialist' THEN 'DMPK Specialist'
    WHEN LOWER(name) = 'ind_enabling_study_coordinator' THEN 'IND Enabling Study Coordinator'
    WHEN LOWER(name) = 'in_vitro_model_specialist' THEN 'In Vitro Model Specialist'
    WHEN LOWER(name) = 'in_vivo_model_specialist' THEN 'In Vivo Model Specialist'
    
    -- Hyphens to spaces
    WHEN name LIKE '%-%' THEN INITCAP(REPLACE(name, '-', ' '))
    
    -- Underscores to spaces
    WHEN name LIKE '%_%' THEN INITCAP(REPLACE(name, '_', ' '))
    
    ELSE INITCAP(name)
END
WHERE name LIKE '%-%' OR name LIKE '%_%';

-- STEP 9: VERIFY NAME CHANGES
-- ============================================================================
SELECT 
    COUNT(*) as total_agents,
    COUNT(CASE WHEN name LIKE '%-%' OR name LIKE '%_%' THEN 1 END) as agents_still_with_slugs,
    COUNT(CASE WHEN name NOT LIKE '%-%' AND name NOT LIKE '%_%' THEN 1 END) as agents_with_display_names
FROM agents;

-- STEP 10: FINAL VERIFICATION - SAMPLE OF CLEANED AGENTS
-- ============================================================================
SELECT 
    name,
    title,
    metadata->>'source' as source,
    created_at
FROM agents
ORDER BY name
LIMIT 50;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================
SELECT 
    '=== CLEANUP COMPLETE ===' as status,
    COUNT(*) as total_agents,
    COUNT(DISTINCT name) as unique_agent_names,
    COUNT(*) - COUNT(DISTINCT name) as remaining_duplicates,
    COUNT(CASE WHEN name LIKE '%_%' OR name LIKE '%-%' THEN 1 END) as agents_still_with_slugs
FROM agents;

