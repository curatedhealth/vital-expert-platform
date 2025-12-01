-- =====================================================
-- VITAL Platform - Agent Enriched View
-- =====================================================
-- Purpose: Materialized view with computed metadata fields
-- Created: 2025-11-23
-- Owner: VITAL Data Strategist Agent
-- =====================================================

-- DROP existing view if exists
DROP MATERIALIZED VIEW IF EXISTS v_agents_enriched CASCADE;

-- =====================================================
-- View: v_agents_enriched
-- =====================================================
-- Provides all agent fields plus computed metadata fields
-- for easier querying without JSONB operators

CREATE MATERIALIZED VIEW v_agents_enriched AS
SELECT
  -- Core identity (all original columns)
  a.id,
  a.tenant_id,
  a.name,
  a.slug,
  a.tagline,
  a.description,
  a.title,

  -- Organization structure
  a.role_id,
  a.function_id,
  a.department_id,
  a.persona_id,
  a.agent_level_id,
  a.function_name,
  a.department_name,
  a.role_name,

  -- Agent characteristics
  a.expertise_level,
  a.years_of_experience,
  a.communication_style,

  -- Avatar & branding
  a.avatar_url,
  a.avatar_description,

  -- AI configuration
  a.system_prompt,
  a.base_model,
  a.temperature,
  a.max_tokens,

  -- Status & validation
  a.status,
  a.validation_status,

  -- Usage metrics
  a.usage_count,
  a.average_rating,
  a.total_conversations,

  -- Full metadata (original JSONB)
  a.metadata,

  -- Documentation
  a.documentation_path,
  a.documentation_url,

  -- Timestamps
  a.created_at,
  a.updated_at,
  a.deleted_at,

  -- ===================================================
  -- COMPUTED FIELDS (extracted from metadata)
  -- ===================================================

  -- Display name (fallback to name if not in metadata)
  COALESCE(a.metadata->>'displayName', a.name) as display_name,

  -- Tier (default 1 if not specified)
  COALESCE((a.metadata->>'tier')::INTEGER, 1) as tier,

  -- Tags (default empty array)
  COALESCE((a.metadata->'tags')::JSONB, '[]'::JSONB) as tags,

  -- Color (default based on tier)
  COALESCE(
    a.metadata->>'color',
    CASE COALESCE((a.metadata->>'tier')::INTEGER, 1)
      WHEN 3 THEN '#EF4444'
      WHEN 2 THEN '#8B5CF6'
      ELSE '#3B82F6'
    END
  ) as color,

  -- Evidence fields
  a.metadata->>'modelJustification' as model_justification,
  a.metadata->>'modelCitation' as model_citation,

  -- AI configuration from metadata
  COALESCE((a.metadata->>'contextWindow')::INTEGER, 8000) as context_window,
  COALESCE((a.metadata->>'costPerQuery')::NUMERIC, 0.0) as cost_per_query,

  -- Compliance flags
  COALESCE((a.metadata->>'hipaaCompliant')::BOOLEAN, FALSE) as hipaa_compliant,
  COALESCE((a.metadata->>'gdprCompliant')::BOOLEAN, FALSE) as gdpr_compliant,
  a.metadata->>'dataClassification' as data_classification,

  -- Feature flags
  COALESCE((a.metadata->>'ragEnabled')::BOOLEAN, FALSE) as rag_enabled,
  COALESCE((a.metadata->>'verifyEnabled')::BOOLEAN, FALSE) as verify_enabled,
  COALESCE((a.metadata->>'pharmaEnabled')::BOOLEAN, FALSE) as pharma_enabled,

  -- Safety metrics
  COALESCE((a.metadata->>'evidenceRequired')::BOOLEAN, FALSE) as evidence_required,
  (a.metadata->>'accuracyScore')::NUMERIC as accuracy_score,
  (a.metadata->>'hallucinationRate')::NUMERIC as hallucination_rate,
  a.metadata->>'clinicalValidationStatus' as clinical_validation_status,

  -- Performance metrics from metadata
  (a.metadata->>'averageLatencyMs')::NUMERIC as average_latency_ms,
  (a.metadata->>'averageResponseTime')::NUMERIC as average_response_time,
  (a.metadata->>'successRate')::NUMERIC as success_rate,
  (a.metadata->>'errorRate')::NUMERIC as error_rate,

  -- Metadata schema version
  a.metadata->>'schemaVersion' as schema_version

FROM agents a
WHERE a.deleted_at IS NULL;

-- =====================================================
-- INDEXES on materialized view
-- =====================================================

-- Primary key
CREATE UNIQUE INDEX idx_v_agents_enriched_id ON v_agents_enriched(id);

-- Most common filters
CREATE INDEX idx_v_agents_enriched_status ON v_agents_enriched(status);
CREATE INDEX idx_v_agents_enriched_tier ON v_agents_enriched(tier);
CREATE INDEX idx_v_agents_enriched_tenant ON v_agents_enriched(tenant_id);
CREATE INDEX idx_v_agents_enriched_display_name ON v_agents_enriched(display_name);

-- Compliance filtering
CREATE INDEX idx_v_agents_enriched_hipaa ON v_agents_enriched(hipaa_compliant)
  WHERE hipaa_compliant = TRUE;
CREATE INDEX idx_v_agents_enriched_classification ON v_agents_enriched(data_classification)
  WHERE data_classification IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX idx_v_agents_enriched_status_tier ON v_agents_enriched(status, tier);
CREATE INDEX idx_v_agents_enriched_tenant_status ON v_agents_enriched(tenant_id, status);

-- Full-text search on display name
CREATE INDEX idx_v_agents_enriched_display_name_fts
  ON v_agents_enriched USING GIN (to_tsvector('english', display_name));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON MATERIALIZED VIEW v_agents_enriched IS
  'Enriched agent view with computed metadata fields.
   Use this view instead of querying agents table directly with JSONB operators.
   Refresh periodically with: REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;';

COMMENT ON COLUMN v_agents_enriched.display_name IS
  'Computed from metadata.displayName with fallback to name';

COMMENT ON COLUMN v_agents_enriched.tier IS
  'Computed from metadata.tier with default 1 (1=Foundational, 2=Specialist, 3=Ultra-specialist)';

COMMENT ON COLUMN v_agents_enriched.tags IS
  'Computed from metadata.tags with default empty array';

COMMENT ON COLUMN v_agents_enriched.color IS
  'Computed from metadata.color with fallback to tier-based default';

-- =====================================================
-- REFRESH FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_agents_enriched()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_agents_enriched() IS
  'Refresh v_agents_enriched materialized view.
   Run this after agent updates: SELECT refresh_agents_enriched();';

-- =====================================================
-- TRIGGER to auto-refresh on agent changes
-- =====================================================

-- Function to schedule refresh (async)
CREATE OR REPLACE FUNCTION schedule_agents_enriched_refresh()
RETURNS TRIGGER AS $$
BEGIN
  -- Use pg_notify to trigger async refresh
  -- (Application should listen for this and refresh the view)
  PERFORM pg_notify('agents_enriched_refresh', 'refresh_needed');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on agents table changes
DROP TRIGGER IF EXISTS trigger_agents_enriched_refresh ON agents;
CREATE TRIGGER trigger_agents_enriched_refresh
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH STATEMENT
  EXECUTE FUNCTION schedule_agents_enriched_refresh();

COMMENT ON TRIGGER trigger_agents_enriched_refresh ON agents IS
  'Notifies when agents table changes, signaling need to refresh v_agents_enriched';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant read access to authenticated users
GRANT SELECT ON v_agents_enriched TO authenticated;

-- Grant refresh to service role
GRANT SELECT, INSERT, UPDATE, DELETE ON v_agents_enriched TO service_role;

-- =====================================================
-- INITIAL REFRESH
-- =====================================================

REFRESH MATERIALIZED VIEW v_agents_enriched;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

/*
-- Query active Tier-3 agents
SELECT * FROM v_agents_enriched
WHERE status = 'active' AND tier = 3;

-- Query HIPAA-compliant agents
SELECT * FROM v_agents_enriched
WHERE hipaa_compliant = TRUE;

-- Query by display name (no JSONB operators needed!)
SELECT * FROM v_agents_enriched
WHERE display_name ILIKE '%clinical%';

-- Group by tier
SELECT tier, COUNT(*) as agent_count
FROM v_agents_enriched
WHERE status = 'active'
GROUP BY tier
ORDER BY tier DESC;

-- Get agents needing evidence
SELECT id, display_name, tier, model_justification, model_citation
FROM v_agents_enriched
WHERE tier >= 2
  AND (model_justification IS NULL OR model_citation IS NULL);

-- Full-text search
SELECT * FROM v_agents_enriched
WHERE to_tsvector('english', display_name) @@ to_tsquery('medical & affairs');
*/

-- =====================================================
-- MAINTENANCE
-- =====================================================

-- Refresh view (run periodically, e.g., every 5 minutes)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;

-- Check view freshness
/*
SELECT
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size,
  (SELECT COUNT(*) FROM v_agents_enriched) AS row_count
FROM pg_matviews
WHERE matviewname = 'v_agents_enriched';
*/
