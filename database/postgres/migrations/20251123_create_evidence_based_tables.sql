-- Migration: Evidence-Based Selection Support Tables
BEGIN;

-- Drop existing agent_tiers if it exists with wrong schema
DROP TABLE IF EXISTS public.agent_tiers CASCADE;

-- Create agent_tiers with correct schema
CREATE TABLE public.agent_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  target_accuracy_min DECIMAL(5,4),
  target_accuracy_max DECIMAL(5,4),
  max_response_time_seconds INTEGER,
  cost_per_query DECIMAL(10,2),
  escalation_rate DECIMAL(5,4),
  requires_human_oversight BOOLEAN DEFAULT false,
  requires_panel BOOLEAN DEFAULT false,
  requires_critic BOOLEAN DEFAULT false,
  min_confidence_threshold DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert tier definitions with explicit column names
INSERT INTO public.agent_tiers (
  tier_name,
  display_name,
  description,
  target_accuracy_min,
  target_accuracy_max,
  max_response_time_seconds,
  cost_per_query,
  escalation_rate,
  requires_human_oversight,
  requires_panel,
  requires_critic,
  min_confidence_threshold
) VALUES
  ('tier_1', 'Rapid Response', 'Fast responses for simple queries', 0.85, 0.92, 5, 0.10, 0.08, false, false, false, 0.75),
  ('tier_2', 'Expert Analysis', 'Deep expertise for complex queries', 0.90, 0.96, 30, 0.50, 0.12, false, false, false, 0.80),
  ('tier_3', 'Deep Reasoning', 'Maximum accuracy with human oversight', 0.94, 0.98, 120, 2.00, 0.05, true, true, true, 0.85)
ON CONFLICT (tier_name) DO NOTHING;

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_queries INTEGER DEFAULT 0,
  successful_queries INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(3,2),
  tier_1_count INTEGER DEFAULT 0,
  tier_2_count INTEGER DEFAULT 0,
  tier_3_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, metric_date)
);

-- Create selection logs table
CREATE TABLE IF NOT EXISTS public.agent_selection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  query TEXT NOT NULL,
  tier TEXT NOT NULL,
  selected_agent_ids UUID[],
  selection_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_agent_date ON agent_performance_metrics(agent_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_logs_tenant ON agent_selection_logs(tenant_id, created_at DESC);

COMMIT;
