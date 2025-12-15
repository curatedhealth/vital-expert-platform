-- Agent Metrics Table Migration
-- 
-- Creates detailed per-operation metrics table for historical tracking.
-- Also supports daily aggregation for dashboard summaries.
--
-- Design Decision:
-- - Detailed table: One row per agent operation (for analysis)
-- - Future: Can add daily rollup table if needed for performance
--
-- Created: January 29, 2025
-- Related: Phase 6 - Observability & Metrics

-- Drop existing table if it exists (for clean migration)
DROP TABLE IF EXISTS public.agent_metrics CASCADE;

-- Create detailed agent metrics table (per-operation)
CREATE TABLE IF NOT EXISTS public.agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent and context
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL, -- No FK to tenants to avoid circular deps
  conversation_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- For tracing across operations
  
  -- Operation details
  operation_type VARCHAR(50) NOT NULL, -- 'search' | 'selection' | 'execution' | 'mode2' | 'mode3' | 'orchestrator'
  query_text TEXT, -- User query (truncated if too long)
  search_method VARCHAR(50), -- 'graphrag_hybrid' | 'database' | 'fallback' | 'graph_traversal'
  selected_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  
  -- Performance metrics
  response_time_ms INTEGER NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0.0,
  
  -- Quality metrics
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  relevance_score DECIMAL(3, 2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  
  -- GraphRAG metrics
  graphrag_hit BOOLEAN DEFAULT false,
  graphrag_fallback BOOLEAN DEFAULT false,
  graph_traversal_depth INTEGER DEFAULT 0,
  
  -- Status
  success BOOLEAN NOT NULL DEFAULT true,
  error_occurred BOOLEAN DEFAULT false,
  error_type VARCHAR(100),
  error_message TEXT,
  
  -- Metadata (flexible JSON for additional context)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_id ON public.agent_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_tenant_id ON public.agent_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_created_at ON public.agent_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_operation_type ON public.agent_metrics(operation_type);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_user_id ON public.agent_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_conversation_id ON public.agent_metrics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_session_id ON public.agent_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_success ON public.agent_metrics(success) WHERE success = true;
CREATE INDEX IF NOT EXISTS idx_agent_metrics_error ON public.agent_metrics(error_occurred) WHERE error_occurred = true;

-- Composite index for common queries (agent + time range)
CREATE INDEX IF NOT EXISTS idx_agent_metrics_agent_created ON public.agent_metrics(agent_id, created_at DESC);

-- Composite index for tenant analytics (tenant + time range)
CREATE INDEX IF NOT EXISTS idx_agent_metrics_tenant_created ON public.agent_metrics(tenant_id, created_at DESC);

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_agent_metrics_metadata ON public.agent_metrics USING GIN(metadata);

-- Row Level Security Policies
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read metrics for agents in their tenant
CREATE POLICY "Users can read metrics in their tenant"
  ON public.agent_metrics FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid -- Platform tenant
  );

-- Policy: System can insert metrics (via service role or authenticated users)
CREATE POLICY "Authenticated users can insert metrics"
  ON public.agent_metrics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Only service role can update/delete metrics (system operations only)
CREATE POLICY "Service role can update metrics"
  ON public.agent_metrics FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete metrics"
  ON public.agent_metrics FOR DELETE
  USING (auth.role() = 'service_role');

-- Create daily aggregation view (optional, for dashboard performance)
CREATE OR REPLACE VIEW public.agent_metrics_daily AS
SELECT
  agent_id,
  tenant_id,
  DATE(created_at) as date,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE success = true) as successful_operations,
  COUNT(*) FILTER (WHERE error_occurred = true) as failed_operations,
  AVG(response_time_ms)::INTEGER as average_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms)::INTEGER as p95_latency_ms,
  SUM(tokens_input)::BIGINT as total_tokens_input,
  SUM(tokens_output)::BIGINT as total_tokens_output,
  SUM(cost_usd)::DECIMAL(10, 6) as total_cost_usd,
  AVG(satisfaction_score)::DECIMAL(3, 2) as average_satisfaction_score,
  AVG(confidence_score)::DECIMAL(3, 2) as average_confidence_score,
  COUNT(*) FILTER (WHERE graphrag_hit = true) as graphrag_hits,
  COUNT(*) FILTER (WHERE graphrag_fallback = true) as graphrag_fallbacks,
  MIN(created_at) as first_operation_at,
  MAX(created_at) as last_operation_at
FROM public.agent_metrics
GROUP BY agent_id, tenant_id, DATE(created_at);

-- Index for the view (if materialized)
-- Note: View is not materialized by default. Can add MATERIALIZED VIEW if needed for performance.

-- Comments for documentation
COMMENT ON TABLE public.agent_metrics IS 'Detailed per-operation metrics for agent operations. One row per agent operation.';
COMMENT ON COLUMN public.agent_metrics.operation_type IS 'Type of operation: search, selection, execution, mode2, mode3, orchestrator';
COMMENT ON COLUMN public.agent_metrics.query_text IS 'User query text (may be truncated for privacy/storage)';
COMMENT ON COLUMN public.agent_metrics.search_method IS 'Search method used: graphrag_hybrid, database, fallback, graph_traversal';
COMMENT ON COLUMN public.agent_metrics.graphrag_hit IS 'Whether GraphRAG search was successful (not fallback)';
COMMENT ON COLUMN public.agent_metrics.metadata IS 'Additional flexible JSON metadata (operation-specific data)';

COMMENT ON VIEW public.agent_metrics_daily IS 'Daily aggregated metrics for dashboard performance. Groups by agent_id, tenant_id, and date.';

