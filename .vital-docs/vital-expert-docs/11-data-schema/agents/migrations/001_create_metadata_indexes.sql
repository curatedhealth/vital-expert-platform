-- =====================================================
-- VITAL Platform - Agent Metadata JSONB Indexes
-- =====================================================
-- Purpose: Optimize queries on metadata JSONB fields
-- Created: 2025-11-23
-- Owner: VITAL Data Strategist Agent
-- =====================================================

-- PREREQUISITE: Agents table must exist with metadata JSONB column
-- Run this AFTER initial schema is created

-- =====================================================
-- 1. EXPRESSION INDEXES (for exact matches)
-- =====================================================

-- Index: Display name (most commonly queried metadata field)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_display_name
  ON agents ((metadata->>'displayName'))
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_metadata_display_name IS
  'Optimize queries filtering by metadata.displayName';

-- Index: Tier (commonly filtered for agent selection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_tier
  ON agents (((metadata->>'tier')::INTEGER))
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_metadata_tier IS
  'Optimize queries filtering by metadata.tier (cast to INTEGER)';

-- Index: HIPAA compliance flag
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_hipaa
  ON agents (((metadata->>'hipaaCompliant')::BOOLEAN))
  WHERE deleted_at IS NULL
    AND (metadata->>'hipaaCompliant')::BOOLEAN = TRUE;

COMMENT ON INDEX idx_agents_metadata_hipaa IS
  'Partial index for HIPAA-compliant agents only (frequently filtered)';

-- Index: Data classification (security filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_classification
  ON agents ((metadata->>'dataClassification'))
  WHERE deleted_at IS NULL
    AND metadata->>'dataClassification' IS NOT NULL;

COMMENT ON INDEX idx_agents_metadata_classification IS
  'Optimize queries filtering by metadata.dataClassification';

-- =====================================================
-- 2. GIN INDEXES (for containment and array operations)
-- =====================================================

-- Index: Tags array (for @> and ? operators)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_tags
  ON agents USING GIN ((metadata->'tags'))
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_metadata_tags IS
  'GIN index for metadata.tags array containment queries (e.g., tags @> ["clinical"])';

-- Index: Full metadata containment
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_gin
  ON agents USING GIN (metadata jsonb_path_ops)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_metadata_gin IS
  'GIN index for general metadata containment queries (e.g., metadata @> {"tier": 3})';

-- =====================================================
-- 3. FULL-TEXT SEARCH INDEXES
-- =====================================================

-- Index: Display name full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_display_name_fts
  ON agents USING GIN (to_tsvector('english', COALESCE(metadata->>'displayName', name)))
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_metadata_display_name_fts IS
  'Full-text search index for metadata.displayName (fallback to name)';

-- Index: Model justification full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_metadata_justification_fts
  ON agents USING GIN (to_tsvector('english', metadata->>'modelJustification'))
  WHERE deleted_at IS NULL
    AND metadata->>'modelJustification' IS NOT NULL;

COMMENT ON INDEX idx_agents_metadata_justification_fts IS
  'Full-text search index for metadata.modelJustification';

-- =====================================================
-- 4. COMPOSITE INDEXES (for common query patterns)
-- =====================================================

-- Index: Status + Tier (common filtering combination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_status_tier
  ON agents (status, ((metadata->>'tier')::INTEGER))
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_status_tier IS
  'Composite index for status + tier filtering (e.g., active Tier-3 agents)';

-- Index: Tenant + Status + Tier (multi-tenant queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_tenant_status_tier
  ON agents (tenant_id, status, ((metadata->>'tier')::INTEGER))
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_agents_tenant_status_tier IS
  'Composite index for tenant-aware agent queries with status and tier filters';

-- =====================================================
-- 5. VALIDATE INDEX CREATION
-- =====================================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'agents'
    AND indexname LIKE 'idx_agents_metadata%';

  RAISE NOTICE 'Created % metadata-related indexes on agents table', index_count;

  IF index_count < 5 THEN
    RAISE WARNING 'Expected at least 5 metadata indexes, but found %', index_count;
  END IF;
END;
$$;

-- =====================================================
-- 6. QUERY PERFORMANCE VERIFICATION
-- =====================================================

-- Explain analyze for common queries (run manually to test)
/*
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM agents
WHERE metadata->>'tier' = '3'
  AND status = 'active'
  AND deleted_at IS NULL;

EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM agents
WHERE metadata->'tags' @> '["clinical"]'::jsonb
  AND deleted_at IS NULL;

EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM agents
WHERE to_tsvector('english', metadata->>'displayName') @@ to_tsquery('medical')
  AND deleted_at IS NULL;
*/

-- =====================================================
-- 7. INDEX MAINTENANCE NOTES
-- =====================================================

COMMENT ON TABLE agents IS
  'Agent registry with JSONB metadata. See AGENT_DATA_ARCHITECTURE.md for schema details.
   Metadata indexes created by 001_create_metadata_indexes.sql migration.';

-- Monitor index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'agents' AND indexname LIKE 'idx_agents_metadata%'
-- ORDER BY idx_scan DESC;

-- Rebuild indexes if fragmented (monthly maintenance):
-- REINDEX INDEX CONCURRENTLY idx_agents_metadata_display_name;
