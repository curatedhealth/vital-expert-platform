-- ============================================================================
-- Migration: Add Knowledge Graph Sync Log
-- Date: 2025-11-23
-- Purpose: Track synchronization between Postgres and Neo4j
-- Priority: LOW
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Drop existing table if it exists (clean migration)
-- ============================================================================

DROP TABLE IF EXISTS public.kg_sync_log CASCADE;

-- ============================================================================
-- 2. KG Sync Log Table
-- ============================================================================

CREATE TABLE public.kg_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sync metadata
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'entity',              -- Single entity sync
    'relationship',        -- Single relationship sync
    'agent_graph_projection', -- Full agent graph projection
    'bulk_entity',         -- Bulk entity sync
    'bulk_relationship',   -- Bulk relationship sync
    'full_sync'           -- Complete database sync
  )),
  
  -- Source/target
  source_id UUID,
  source_table TEXT,
  target_neo4j_label TEXT,
  target_neo4j_id TEXT,
  
  -- Direction
  direction TEXT DEFAULT 'postgres_to_neo4j' CHECK (direction IN (
    'postgres_to_neo4j',
    'neo4j_to_postgres',
    'bidirectional'
  )),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'success', 'error', 'skipped')),
  message TEXT,
  error_details JSONB,
  
  -- Performance
  records_synced INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  
  -- Context
  triggered_by TEXT, -- 'manual', 'scheduled', 'trigger', 'api'
  triggered_by_user_id UUID REFERENCES auth.users(id),
  batch_id UUID, -- Groups related sync operations
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_kg_sync_log_type ON public.kg_sync_log(sync_type);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_status ON public.kg_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_source ON public.kg_sync_log(source_id, source_table);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_batch ON public.kg_sync_log(batch_id);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_created ON public.kg_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kg_sync_log_completed ON public.kg_sync_log(completed_at DESC) WHERE status = 'success';

-- ============================================================================
-- 4. Helper Functions
-- ============================================================================

-- Function to get sync statistics
CREATE OR REPLACE FUNCTION get_kg_sync_stats(
  p_time_window_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  sync_type TEXT,
  total_syncs BIGINT,
  successful_syncs BIGINT,
  failed_syncs BIGINT,
  avg_execution_time_ms NUMERIC,
  total_records_synced BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.sync_type,
    COUNT(*) as total_syncs,
    COUNT(*) FILTER (WHERE l.status = 'success') as successful_syncs,
    COUNT(*) FILTER (WHERE l.status = 'error') as failed_syncs,
    AVG(l.execution_time_ms) as avg_execution_time_ms,
    SUM(l.records_synced) as total_records_synced,
    ROUND(
      COUNT(*) FILTER (WHERE l.status = 'success')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
      2
    ) as success_rate
  FROM public.kg_sync_log l
  WHERE l.created_at >= NOW() - (p_time_window_hours || ' hours')::INTERVAL
  GROUP BY l.sync_type
  ORDER BY total_syncs DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to log sync operation
CREATE OR REPLACE FUNCTION log_kg_sync(
  p_sync_type TEXT,
  p_source_id UUID,
  p_source_table TEXT,
  p_status TEXT,
  p_message TEXT DEFAULT NULL,
  p_records_synced INTEGER DEFAULT 0,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_sync_id UUID;
BEGIN
  INSERT INTO public.kg_sync_log (
    sync_type,
    source_id,
    source_table,
    status,
    message,
    records_synced,
    execution_time_ms,
    started_at,
    completed_at
  ) VALUES (
    p_sync_type,
    p_source_id,
    p_source_table,
    p_status,
    p_message,
    p_records_synced,
    p_execution_time_ms,
    CASE WHEN p_status = 'in_progress' THEN NOW() ELSE NULL END,
    CASE WHEN p_status IN ('success', 'error') THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_sync_id;
  
  RETURN v_sync_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Comments
-- ============================================================================

COMMENT ON TABLE public.kg_sync_log IS 'Tracks synchronization between Postgres and Neo4j knowledge graph';
COMMENT ON COLUMN public.kg_sync_log.sync_type IS 'Type of sync operation: entity, relationship, graph projection, etc.';
COMMENT ON COLUMN public.kg_sync_log.source_id IS 'UUID of source record in Postgres';
COMMENT ON COLUMN public.kg_sync_log.target_neo4j_id IS 'Node/relationship ID in Neo4j';
COMMENT ON COLUMN public.kg_sync_log.batch_id IS 'Groups related sync operations together';

COMMENT ON FUNCTION get_kg_sync_stats IS 'Get sync statistics for a time window (default 24 hours)';
COMMENT ON FUNCTION log_kg_sync IS 'Helper function to log a sync operation';

COMMIT;

-- Verification
SELECT 'kg_sync_log' AS table_name, COUNT(*) AS row_count FROM public.kg_sync_log;

-- Show sync stats (will be empty initially)
SELECT * FROM get_kg_sync_stats(24);

