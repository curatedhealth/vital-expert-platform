-- ============================================================================
-- Migration: AgentOS 3.0 Monitoring & Safety Tables
-- Date: 2025-11-23
-- Purpose: Create tables for clinical monitoring, fairness tracking, and drift detection
-- ============================================================================

BEGIN;

-- Drop existing tables if they exist (to ensure clean migration)
DROP TABLE IF EXISTS public.agent_interaction_logs CASCADE;
DROP TABLE IF EXISTS public.agent_diagnostic_metrics CASCADE;
DROP TABLE IF EXISTS public.agent_drift_alerts CASCADE;
DROP TABLE IF EXISTS public.agent_fairness_metrics CASCADE;

-- ============================================================================
-- 1. agent_interaction_logs
-- Purpose: Complete audit trail of all agent interactions
-- ============================================================================

CREATE TABLE public.agent_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifiers
  tenant_id UUID NOT NULL,
  user_id UUID,
  session_id UUID NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  service_type TEXT CHECK (service_type IN ('ask_expert', 'ask_panel', 'ask_critic', 'ask_planner')),
  
  -- Request data
  query TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  tier TEXT CHECK (tier IN ('tier_1', 'tier_2', 'tier_3')),
  
  -- Response data
  response TEXT,
  confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  citations JSONB DEFAULT '[]'::jsonb,
  
  -- Quality metrics
  was_successful BOOLEAN DEFAULT true,
  had_human_oversight BOOLEAN DEFAULT false,
  was_escalated BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  
  -- Performance
  execution_time_ms INTEGER CHECK (execution_time_ms >= 0),
  tokens_used INTEGER CHECK (tokens_used >= 0),
  cost_usd DECIMAL(10,4) CHECK (cost_usd >= 0),
  
  -- RAG metadata
  rag_profile_id UUID,
  context_chunks_used INTEGER DEFAULT 0,
  graph_paths_used INTEGER DEFAULT 0,
  
  -- Demographics (for fairness monitoring)
  user_age_group TEXT,
  user_gender TEXT,
  user_region TEXT,
  user_ethnicity TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_interactions_tenant_date 
  ON public.agent_interaction_logs(tenant_id, created_at DESC);

CREATE INDEX idx_interactions_agent 
  ON public.agent_interaction_logs(agent_id, created_at DESC);

CREATE INDEX idx_interactions_session 
  ON public.agent_interaction_logs(session_id);

CREATE INDEX idx_interactions_demographics 
  ON public.agent_interaction_logs(agent_id, user_age_group, user_gender, user_region, created_at DESC);

-- Comments
COMMENT ON TABLE public.agent_interaction_logs IS 'Complete audit trail of all agent interactions for monitoring and compliance';
COMMENT ON COLUMN public.agent_interaction_logs.confidence_score IS 'Agent confidence score (0-1)';
COMMENT ON COLUMN public.agent_interaction_logs.was_successful IS 'Whether the interaction was successful from user perspective';
COMMENT ON COLUMN public.agent_interaction_logs.had_human_oversight IS 'Whether human oversight was applied (Tier 3)';

-- ============================================================================
-- 2. agent_diagnostic_metrics
-- Purpose: Clinical-style diagnostic metrics per agent (sensitivity, specificity, etc.)
-- ============================================================================

CREATE TABLE public.agent_diagnostic_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  metric_period TEXT NOT NULL CHECK (metric_period IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Diagnostic metrics (confusion matrix)
  total_interactions INTEGER DEFAULT 0 CHECK (total_interactions >= 0),
  true_positives INTEGER DEFAULT 0 CHECK (true_positives >= 0),
  true_negatives INTEGER DEFAULT 0 CHECK (true_negatives >= 0),
  false_positives INTEGER DEFAULT 0 CHECK (false_positives >= 0),
  false_negatives INTEGER DEFAULT 0 CHECK (false_negatives >= 0),
  
  -- Calculated metrics (0-1 range)
  sensitivity DECIMAL(5,4) CHECK (sensitivity >= 0 AND sensitivity <= 1),
  specificity DECIMAL(5,4) CHECK (specificity >= 0 AND specificity <= 1),
  precision_score DECIMAL(5,4) CHECK (precision_score >= 0 AND precision_score <= 1),
  f1_score DECIMAL(5,4) CHECK (f1_score >= 0 AND f1_score <= 1),
  accuracy DECIMAL(5,4) CHECK (accuracy >= 0 AND accuracy <= 1),
  
  -- Confidence metrics
  avg_confidence DECIMAL(5,4) CHECK (avg_confidence >= 0 AND avg_confidence <= 1),
  confidence_std_dev DECIMAL(5,4),
  calibration_error DECIMAL(5,4),
  
  -- Performance metrics
  avg_response_time_ms INTEGER CHECK (avg_response_time_ms >= 0),
  p95_response_time_ms INTEGER CHECK (p95_response_time_ms >= 0),
  p99_response_time_ms INTEGER CHECK (p99_response_time_ms >= 0),
  
  -- Cost metrics
  total_cost_usd DECIMAL(10,2) CHECK (total_cost_usd >= 0),
  avg_cost_per_query DECIMAL(10,4) CHECK (avg_cost_per_query >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, metric_period, period_start)
);

-- Indexes
CREATE INDEX idx_diagnostic_agent_period 
  ON public.agent_diagnostic_metrics(agent_id, metric_period, period_start DESC);

-- Comments
COMMENT ON TABLE public.agent_diagnostic_metrics IS 'Clinical-style diagnostic metrics for agent performance evaluation';
COMMENT ON COLUMN public.agent_diagnostic_metrics.sensitivity IS 'True Positive Rate: TP / (TP + FN)';
COMMENT ON COLUMN public.agent_diagnostic_metrics.specificity IS 'True Negative Rate: TN / (TN + FP)';
COMMENT ON COLUMN public.agent_diagnostic_metrics.precision_score IS 'Positive Predictive Value: TP / (TP + FP)';
COMMENT ON COLUMN public.agent_diagnostic_metrics.f1_score IS 'Harmonic mean of precision and recall';

-- ============================================================================
-- 3. agent_drift_alerts
-- Purpose: Detect and log performance drift over time
-- ============================================================================

CREATE TABLE public.agent_drift_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('accuracy_drop', 'latency_increase', 'cost_spike', 'confidence_drop', 'error_rate_increase')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Drift details
  metric_name TEXT NOT NULL,
  baseline_value DECIMAL(10,4),
  current_value DECIMAL(10,4),
  drift_magnitude DECIMAL(10,4),
  drift_percentage DECIMAL(5,2),
  
  -- Statistical test results
  test_name TEXT CHECK (test_name IN ('kolmogorov_smirnov', 't_test', 'chi_square', 'mann_whitney')),
  p_value DECIMAL(10,8) CHECK (p_value >= 0 AND p_value <= 1),
  is_significant BOOLEAN DEFAULT false,
  
  -- Context
  detection_window_days INTEGER DEFAULT 7 CHECK (detection_window_days > 0),
  affected_interactions INTEGER DEFAULT 0,
  
  -- Resolution tracking
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  assigned_to TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drift_agent_status 
  ON public.agent_drift_alerts(agent_id, status, created_at DESC);

CREATE INDEX idx_drift_severity 
  ON public.agent_drift_alerts(severity, status, created_at DESC);

-- Comments
COMMENT ON TABLE public.agent_drift_alerts IS 'Performance drift detection and alerting for agent quality monitoring';
COMMENT ON COLUMN public.agent_drift_alerts.p_value IS 'Statistical significance of drift detection';
COMMENT ON COLUMN public.agent_drift_alerts.is_significant IS 'Whether drift is statistically significant (p < 0.05)';

-- ============================================================================
-- 4. agent_fairness_metrics
-- Purpose: Track bias and fairness across demographics
-- ============================================================================

CREATE TABLE public.agent_fairness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  
  -- Protected attribute
  protected_attribute TEXT NOT NULL CHECK (protected_attribute IN ('age_group', 'gender', 'region', 'ethnicity', 'socioeconomic')),
  attribute_value TEXT NOT NULL,
  
  -- Metrics per demographic group
  total_interactions INTEGER DEFAULT 0 CHECK (total_interactions >= 0),
  successful_interactions INTEGER DEFAULT 0 CHECK (successful_interactions >= 0),
  avg_confidence DECIMAL(5,4) CHECK (avg_confidence >= 0 AND avg_confidence <= 1),
  avg_response_time_ms INTEGER CHECK (avg_response_time_ms >= 0),
  escalation_rate DECIMAL(5,4) CHECK (escalation_rate >= 0 AND escalation_rate <= 1),
  
  -- Fairness indicators
  success_rate DECIMAL(5,4) CHECK (success_rate >= 0 AND success_rate <= 1),
  demographic_parity DECIMAL(5,4), -- Difference from overall rate (-1 to 1)
  equal_opportunity DECIMAL(5,4), -- TPR difference
  
  -- Statistical significance
  sample_size_adequate BOOLEAN DEFAULT false,
  confidence_interval_lower DECIMAL(5,4),
  confidence_interval_upper DECIMAL(5,4),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(agent_id, metric_date, protected_attribute, attribute_value)
);

-- Indexes
CREATE INDEX idx_fairness_agent_date 
  ON public.agent_fairness_metrics(agent_id, metric_date DESC);

CREATE INDEX idx_fairness_attribute 
  ON public.agent_fairness_metrics(protected_attribute, attribute_value, metric_date DESC);

CREATE INDEX idx_fairness_parity 
  ON public.agent_fairness_metrics(demographic_parity, metric_date DESC) 
  WHERE ABS(demographic_parity) > 0.1;

-- Comments
COMMENT ON TABLE public.agent_fairness_metrics IS 'Bias and fairness tracking across protected demographics';
COMMENT ON COLUMN public.agent_fairness_metrics.demographic_parity IS 'Difference from overall success rate (target: < 0.1)';
COMMENT ON COLUMN public.agent_fairness_metrics.equal_opportunity IS 'True Positive Rate difference across groups';
COMMENT ON COLUMN public.agent_fairness_metrics.sample_size_adequate IS 'Whether sample size is sufficient for statistical significance (n >= 30)';

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check tables created
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('agent_interaction_logs', 'agent_diagnostic_metrics', 'agent_drift_alerts', 'agent_fairness_metrics')
ORDER BY table_name;

-- Check indexes created
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('agent_interaction_logs', 'agent_diagnostic_metrics', 'agent_drift_alerts', 'agent_fairness_metrics')
ORDER BY tablename, indexname;
