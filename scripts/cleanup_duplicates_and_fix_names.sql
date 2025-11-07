-- ============================================================================
-- COMPREHENSIVE CLEANUP: Remove Duplicates & Fix Slug Names
-- ============================================================================
-- This script will:
-- 1. Keep only the OLDEST record for each duplicate agent (by created_at)
-- 2. Generate proper display names from slug names
-- ============================================================================

BEGIN;

-- Step 1: Create a temporary table with agents to KEEP (oldest by created_at)
CREATE TEMP TABLE agents_to_keep AS
SELECT DISTINCT ON (name)
    id,
    name,
    created_at
FROM agents
ORDER BY name, created_at ASC;

-- Step 2: Show what will be deleted (for verification)
-- DELETE all agents that are NOT in the agents_to_keep list
WITH deletion_preview AS (
    SELECT 
        a.id,
        a.name,
        a.title,
        a.created_at,
        a.metadata->>'source' as source,
        a.metadata->>'batch' as batch
    FROM agents a
    LEFT JOIN agents_to_keep atk ON a.id = atk.id
    WHERE atk.id IS NULL
)
SELECT 
    COUNT(*) as total_duplicates_to_delete,
    COUNT(DISTINCT name) as unique_agents_affected
FROM deletion_preview;

-- Step 3: DELETE all duplicate records (keeping only oldest)
DELETE FROM agents
WHERE id NOT IN (SELECT id FROM agents_to_keep);

-- Step 4: Update slug names to display names
-- Convert names like "medical_science_liaison_coordinator" to "Medical Science Liaison Coordinator"
-- Convert names like "heor-director" to "HEOR Director"

UPDATE agents
SET name = CASE
    -- First, handle special cases (acronyms and specific terms)
    WHEN LOWER(name) = 'heor-director' THEN 'HEOR Director'
    WHEN LOWER(name) = 'nlp_expert' THEN 'NLP Expert'
    WHEN LOWER(name) = 'ai_ml_model_validator' THEN 'AI/ML Model Validator'
    WHEN LOWER(name) = 'etl_developer' THEN 'ETL Developer'
    WHEN LOWER(name) = 'dmpk_specialist' THEN 'DMPK Specialist'
    
    -- Handle names with hyphens (replace with space and title case)
    WHEN name LIKE '%-%' THEN
        INITCAP(REPLACE(name, '-', ' '))
    
    -- Handle names with underscores (replace with space and title case)
    WHEN name LIKE '%_%' THEN
        INITCAP(REPLACE(name, '_', ' '))
    
    -- Default: just title case
    ELSE INITCAP(name)
END
WHERE name LIKE '%-%' OR name LIKE '%_%';

-- Step 5: Verify the cleanup
SELECT 
    'After Cleanup' as status,
    COUNT(*) as total_agents,
    COUNT(DISTINCT name) as unique_agents,
    COUNT(*) - COUNT(DISTINCT name) as remaining_duplicates
FROM agents;

-- Step 6: Show sample of updated names
SELECT 
    name,
    title,
    metadata->>'source' as source,
    created_at
FROM agents
ORDER BY created_at DESC
LIMIT 20;

COMMIT;

-- ============================================================================
-- Summary Report
-- ============================================================================
SELECT 
    '=== CLEANUP COMPLETE ===' as message,
    (SELECT COUNT(*) FROM agents) as total_agents_remaining,
    (SELECT COUNT(DISTINCT name) FROM agents) as unique_agent_names,
    (SELECT COUNT(*) FROM agents WHERE name LIKE '%_%' OR name LIKE '%-%') as agents_still_with_slugs;

