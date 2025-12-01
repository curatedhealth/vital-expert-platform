-- =====================================================
-- VITAL Platform - Backfill Agent Metadata
-- =====================================================
-- Purpose: Migrate existing agents to proper metadata structure
-- Created: 2025-11-23
-- Owner: VITAL Data Strategist Agent
-- =====================================================

-- CRITICAL: This is a DATA migration, run carefully
-- 1. Backup database first
-- 2. Test on staging environment
-- 3. Run during low-traffic window
-- 4. Monitor execution time (may take minutes for large datasets)

-- =====================================================
-- 1. PRE-MIGRATION VALIDATION
-- =====================================================

DO $$
DECLARE
  total_agents INTEGER;
  agents_with_metadata INTEGER;
  agents_without_metadata INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_agents FROM agents WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO agents_with_metadata FROM agents
    WHERE deleted_at IS NULL AND metadata IS NOT NULL AND metadata != '{}'::jsonb;
  agents_without_metadata := total_agents - agents_with_metadata;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'PRE-MIGRATION STATUS';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total agents: %', total_agents;
  RAISE NOTICE 'Agents with metadata: %', agents_with_metadata;
  RAISE NOTICE 'Agents without metadata: %', agents_without_metadata;
  RAISE NOTICE '';
END;
$$;

-- =====================================================
-- 2. ENSURE METADATA COLUMN EXISTS AND IS INITIALIZED
-- =====================================================

-- Initialize empty metadata for agents with NULL
UPDATE agents
SET metadata = '{}'::jsonb
WHERE metadata IS NULL
  AND deleted_at IS NULL;

-- =====================================================
-- 3. BACKFILL DISPLAY_NAME
-- =====================================================

-- Add display_name from name if missing
UPDATE agents
SET metadata = metadata || jsonb_build_object('displayName', name)
WHERE (metadata->>'displayName' IS NULL OR metadata->>'displayName' = '')
  AND name IS NOT NULL
  AND deleted_at IS NULL;

-- Clean up display names (title case, remove underscores)
UPDATE agents
SET metadata = metadata || jsonb_build_object(
  'displayName',
  INITCAP(REPLACE(metadata->>'displayName', '_', ' '))
)
WHERE metadata->>'displayName' LIKE '%_%'
  AND deleted_at IS NULL;

-- =====================================================
-- 4. BACKFILL TIER
-- =====================================================

-- Map expertise_level to tier
UPDATE agents
SET metadata = metadata || jsonb_build_object('tier',
  CASE
    WHEN expertise_level = 'expert' THEN 3
    WHEN expertise_level = 'advanced' THEN 2
    WHEN expertise_level IN ('intermediate', 'beginner') THEN 1
    ELSE 1
  END
)
WHERE (metadata->>'tier' IS NULL OR (metadata->>'tier')::INTEGER NOT IN (1, 2, 3))
  AND deleted_at IS NULL;

-- Validate tier values (must be 1, 2, or 3)
UPDATE agents
SET metadata = metadata || jsonb_build_object('tier', 1)
WHERE metadata->>'tier' IS NOT NULL
  AND (metadata->>'tier')::INTEGER NOT IN (1, 2, 3)
  AND deleted_at IS NULL;

-- =====================================================
-- 5. BACKFILL TAGS
-- =====================================================

-- Initialize empty tags array if missing
UPDATE agents
SET metadata = metadata || jsonb_build_object('tags', '[]'::jsonb)
WHERE NOT (metadata ? 'tags')
  AND deleted_at IS NULL;

-- Auto-tag based on function_name
UPDATE agents
SET metadata = jsonb_set(
  metadata,
  '{tags}',
  (metadata->'tags')::jsonb || to_jsonb(ARRAY[LOWER(function_name)])
)
WHERE function_name IS NOT NULL
  AND NOT (metadata->'tags' @> to_jsonb(ARRAY[LOWER(function_name)]))
  AND deleted_at IS NULL;

-- Auto-tag based on department_name
UPDATE agents
SET metadata = jsonb_set(
  metadata,
  '{tags}',
  (metadata->'tags')::jsonb || to_jsonb(ARRAY[LOWER(department_name)])
)
WHERE department_name IS NOT NULL
  AND NOT (metadata->'tags' @> to_jsonb(ARRAY[LOWER(department_name)]))
  AND deleted_at IS NULL;

-- =====================================================
-- 6. BACKFILL COLOR (based on tier)
-- =====================================================

-- Tier 1: Blue (#3B82F6)
-- Tier 2: Purple (#8B5CF6)
-- Tier 3: Red (#EF4444)

UPDATE agents
SET metadata = metadata || jsonb_build_object('color',
  CASE (metadata->>'tier')::INTEGER
    WHEN 3 THEN '#EF4444'
    WHEN 2 THEN '#8B5CF6'
    ELSE '#3B82F6'
  END
)
WHERE metadata->>'color' IS NULL
  AND metadata->>'tier' IS NOT NULL
  AND deleted_at IS NULL;

-- =====================================================
-- 7. BACKFILL AI CONFIGURATION METADATA
-- =====================================================

-- Move AI config to metadata (context_window, cost_per_query)
UPDATE agents
SET metadata = metadata ||
  jsonb_build_object('contextWindow', 8000) ||
  jsonb_build_object('costPerQuery',
    CASE base_model
      WHEN 'gpt-4' THEN 0.35
      WHEN 'gpt-4-turbo' THEN 0.10
      WHEN 'gpt-3.5-turbo' THEN 0.015
      WHEN 'claude-3-opus' THEN 0.40
      WHEN 'claude-3-sonnet' THEN 0.15
      ELSE 0.10
    END
  )
WHERE NOT (metadata ? 'contextWindow')
  AND base_model IS NOT NULL
  AND deleted_at IS NULL;

-- =====================================================
-- 8. BACKFILL COMPLIANCE FLAGS
-- =====================================================

-- Initialize HIPAA compliance flag (default false)
UPDATE agents
SET metadata = metadata || jsonb_build_object('hipaaCompliant', FALSE)
WHERE NOT (metadata ? 'hipaaCompliant')
  AND deleted_at IS NULL;

-- Mark clinical agents as HIPAA-compliant (based on tags)
UPDATE agents
SET metadata = metadata || jsonb_build_object('hipaaCompliant', TRUE)
WHERE metadata->'tags' @> '["clinical"]'::jsonb
  AND (metadata->>'hipaaCompliant')::BOOLEAN = FALSE
  AND deleted_at IS NULL;

-- Initialize data classification
UPDATE agents
SET metadata = metadata || jsonb_build_object('dataClassification',
  CASE
    WHEN metadata->'tags' @> '["clinical"]'::jsonb THEN 'restricted'
    WHEN metadata->'tags' @> '["regulatory"]'::jsonb THEN 'confidential'
    ELSE 'internal'
  END
)
WHERE NOT (metadata ? 'dataClassification')
  AND deleted_at IS NULL;

-- =====================================================
-- 9. BACKFILL RAG/VERIFY FLAGS
-- =====================================================

-- Initialize feature flags (default false)
UPDATE agents
SET metadata = metadata ||
  jsonb_build_object('ragEnabled', FALSE) ||
  jsonb_build_object('verifyEnabled', FALSE) ||
  jsonb_build_object('pharmaEnabled', FALSE)
WHERE NOT (metadata ? 'ragEnabled')
  AND deleted_at IS NULL;

-- Enable RAG for Tier 2+ agents
UPDATE agents
SET metadata = metadata || jsonb_build_object('ragEnabled', TRUE)
WHERE (metadata->>'tier')::INTEGER >= 2
  AND (metadata->>'ragEnabled')::BOOLEAN = FALSE
  AND deleted_at IS NULL;

-- =====================================================
-- 10. BACKFILL SCHEMA VERSION
-- =====================================================

-- Add schema version to all agents
UPDATE agents
SET metadata = metadata || jsonb_build_object('schemaVersion', '1.0')
WHERE NOT (metadata ? 'schemaVersion')
  AND deleted_at IS NULL;

-- =====================================================
-- 11. POST-MIGRATION VALIDATION
-- =====================================================

DO $$
DECLARE
  total_agents INTEGER;
  agents_with_display_name INTEGER;
  agents_with_tier INTEGER;
  agents_with_tags INTEGER;
  agents_with_color INTEGER;
  agents_with_schema_version INTEGER;
  validation_errors INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO total_agents FROM agents WHERE deleted_at IS NULL;

  SELECT COUNT(*) INTO agents_with_display_name FROM agents
    WHERE deleted_at IS NULL AND metadata->>'displayName' IS NOT NULL;

  SELECT COUNT(*) INTO agents_with_tier FROM agents
    WHERE deleted_at IS NULL AND metadata->>'tier' IS NOT NULL;

  SELECT COUNT(*) INTO agents_with_tags FROM agents
    WHERE deleted_at IS NULL AND metadata ? 'tags';

  SELECT COUNT(*) INTO agents_with_color FROM agents
    WHERE deleted_at IS NULL AND metadata->>'color' IS NOT NULL;

  SELECT COUNT(*) INTO agents_with_schema_version FROM agents
    WHERE deleted_at IS NULL AND metadata->>'schemaVersion' = '1.0';

  RAISE NOTICE '====================================';
  RAISE NOTICE 'POST-MIGRATION STATUS';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total agents: %', total_agents;
  RAISE NOTICE 'Agents with displayName: % (%%%)', agents_with_display_name,
    ROUND(100.0 * agents_with_display_name / NULLIF(total_agents, 0), 2);
  RAISE NOTICE 'Agents with tier: % (%%%)', agents_with_tier,
    ROUND(100.0 * agents_with_tier / NULLIF(total_agents, 0), 2);
  RAISE NOTICE 'Agents with tags: % (%%%)', agents_with_tags,
    ROUND(100.0 * agents_with_tags / NULLIF(total_agents, 0), 2);
  RAISE NOTICE 'Agents with color: % (%%%)', agents_with_color,
    ROUND(100.0 * agents_with_color / NULLIF(total_agents, 0), 2);
  RAISE NOTICE 'Agents with schemaVersion: % (%%%)', agents_with_schema_version,
    ROUND(100.0 * agents_with_schema_version / NULLIF(total_agents, 0), 2);
  RAISE NOTICE '';

  -- Check for validation errors
  IF agents_with_display_name < total_agents THEN
    validation_errors := validation_errors + 1;
    RAISE WARNING 'Missing displayName in % agents', (total_agents - agents_with_display_name);
  END IF;

  IF agents_with_tier < total_agents THEN
    validation_errors := validation_errors + 1;
    RAISE WARNING 'Missing tier in % agents', (total_agents - agents_with_tier);
  END IF;

  IF validation_errors > 0 THEN
    RAISE WARNING 'Migration completed with % validation errors', validation_errors;
  ELSE
    RAISE NOTICE '✅ Migration completed successfully with no validation errors';
  END IF;
END;
$$;

-- =====================================================
-- 12. SAMPLE DATA VERIFICATION
-- =====================================================

-- Show sample agents with metadata
SELECT
  id,
  name,
  metadata->>'displayName' as display_name,
  (metadata->>'tier')::INTEGER as tier,
  metadata->'tags' as tags,
  metadata->>'color' as color,
  metadata->>'schemaVersion' as schema_version
FROM agents
WHERE deleted_at IS NULL
ORDER BY (metadata->>'tier')::INTEGER DESC, name
LIMIT 10;

-- =====================================================
-- 13. CLEANUP (Optional - Run manually if needed)
-- =====================================================

/*
-- Remove duplicate/inconsistent data
-- (Only run if you have specific cleanup needs)

-- Example: Remove legacy fields from metadata if they exist as columns
UPDATE agents
SET metadata = metadata - 'name' - 'description' - 'status'
WHERE deleted_at IS NULL;
*/

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
-- TO ROLLBACK THIS MIGRATION:

-- 1. Restore from backup (preferred)
-- 2. Or manually remove added metadata fields:

UPDATE agents
SET metadata = metadata - 'displayName' - 'tier' - 'tags' - 'color'
  - 'contextWindow' - 'costPerQuery' - 'hipaaCompliant'
  - 'dataClassification' - 'ragEnabled' - 'verifyEnabled'
  - 'pharmaEnabled' - 'schemaVersion'
WHERE deleted_at IS NULL;
*/
