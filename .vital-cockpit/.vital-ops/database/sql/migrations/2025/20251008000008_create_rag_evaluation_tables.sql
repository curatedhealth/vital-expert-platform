-- RAG Evaluation Tables for RAGAs Framework
-- Stores evaluation metrics and results for RAG system performance monitoring

-- Create rag_evaluations table
CREATE TABLE IF NOT EXISTS public.rag_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  answer TEXT NOT NULL,
  retrieval_strategy TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  session_id TEXT,
  user_id UUID,
  
  -- RAGAs Core Metrics (0-1 scale)
  context_precision FLOAT NOT NULL CHECK (context_precision >= 0 AND context_precision <= 1),
  context_recall FLOAT NOT NULL CHECK (context_recall >= 0 AND context_recall <= 1),
  faithfulness FLOAT NOT NULL CHECK (faithfulness >= 0 AND faithfulness <= 1),
  answer_relevancy FLOAT NOT NULL CHECK (answer_relevancy >= 0 AND answer_relevancy <= 1),
  
  -- Overall Score (0-100)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Additional Metrics
  context_count INTEGER NOT NULL DEFAULT 0,
  avg_context_length INTEGER NOT NULL DEFAULT 0,
  
  -- Recommendations and Analysis
  recommendations TEXT[] DEFAULT '{}',
  detailed_analysis JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rag_evaluations_session_id ON public.rag_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_rag_evaluations_user_id ON public.rag_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_evaluations_strategy ON public.rag_evaluations(retrieval_strategy);
CREATE INDEX IF NOT EXISTS idx_rag_evaluations_overall_score ON public.rag_evaluations(overall_score);
CREATE INDEX IF NOT EXISTS idx_rag_evaluations_created_at ON public.rag_evaluations(created_at);

-- Create evaluation_summary table for aggregated metrics
CREATE TABLE IF NOT EXISTS public.rag_evaluation_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_period TEXT NOT NULL, -- 'hour', 'day', 'week', 'month'
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Aggregated Metrics
  total_evaluations INTEGER NOT NULL DEFAULT 0,
  average_score FLOAT NOT NULL DEFAULT 0,
  average_precision FLOAT NOT NULL DEFAULT 0,
  average_recall FLOAT NOT NULL DEFAULT 0,
  average_faithfulness FLOAT NOT NULL DEFAULT 0,
  average_relevancy FLOAT NOT NULL DEFAULT 0,
  
  -- Score Distribution
  excellent_count INTEGER DEFAULT 0, -- 90-100
  good_count INTEGER DEFAULT 0,      -- 70-89
  fair_count INTEGER DEFAULT 0,      -- 50-69
  poor_count INTEGER DEFAULT 0,      -- 0-49
  
  -- Strategy Performance
  strategy_metrics JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(time_period, period_start, period_end)
);

-- Create evaluation_benchmarks table for A/B testing
CREATE TABLE IF NOT EXISTS public.rag_evaluation_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_name TEXT NOT NULL,
  description TEXT,
  
  -- Test Configuration
  retrieval_strategies TEXT[] NOT NULL,
  test_queries JSONB NOT NULL, -- Array of test queries with ground truth
  evaluation_criteria JSONB DEFAULT '{}',
  
  -- Results
  results JSONB DEFAULT '{}',
  winner_strategy TEXT,
  statistical_significance FLOAT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create evaluation_alerts table for monitoring
CREATE TABLE IF NOT EXISTS public.rag_evaluation_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'low_score', 'high_latency', 'poor_retrieval'
  threshold_value FLOAT NOT NULL,
  current_value FLOAT NOT NULL,
  message TEXT NOT NULL,
  
  -- Context
  evaluation_id UUID REFERENCES public.rag_evaluations(id),
  session_id TEXT,
  user_id UUID,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.rag_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_evaluation_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_evaluation_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_evaluation_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to rag_evaluations"
  ON public.rag_evaluations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to rag_evaluations"
  ON public.rag_evaluations
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access to rag_evaluation_summary"
  ON public.rag_evaluation_summary
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to rag_evaluation_summary"
  ON public.rag_evaluation_summary
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access to rag_evaluation_benchmarks"
  ON public.rag_evaluation_benchmarks
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to rag_evaluation_benchmarks"
  ON public.rag_evaluation_benchmarks
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access to rag_evaluation_alerts"
  ON public.rag_evaluation_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access to rag_evaluation_alerts"
  ON public.rag_evaluation_alerts
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create functions for evaluation analytics
CREATE OR REPLACE FUNCTION get_rag_performance_summary(
  time_period TEXT DEFAULT 'day',
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  total_evaluations BIGINT,
  average_score NUMERIC,
  average_precision NUMERIC,
  average_recall NUMERIC,
  average_faithfulness NUMERIC,
  average_relevancy NUMERIC,
  excellent_percentage NUMERIC,
  good_percentage NUMERIC,
  fair_percentage NUMERIC,
  poor_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC(time_period, re.created_at) as period_start,
    DATE_TRUNC(time_period, re.created_at) + 
      CASE time_period
        WHEN 'hour' THEN INTERVAL '1 hour'
        WHEN 'day' THEN INTERVAL '1 day'
        WHEN 'week' THEN INTERVAL '1 week'
        WHEN 'month' THEN INTERVAL '1 month'
      END as period_end,
    COUNT(*) as total_evaluations,
    ROUND(AVG(re.overall_score), 2) as average_score,
    ROUND(AVG(re.context_precision), 3) as average_precision,
    ROUND(AVG(re.context_recall), 3) as average_recall,
    ROUND(AVG(re.faithfulness), 3) as average_faithfulness,
    ROUND(AVG(re.answer_relevancy), 3) as average_relevancy,
    ROUND(COUNT(*) FILTER (WHERE re.overall_score >= 90) * 100.0 / COUNT(*), 1) as excellent_percentage,
    ROUND(COUNT(*) FILTER (WHERE re.overall_score >= 70 AND re.overall_score < 90) * 100.0 / COUNT(*), 1) as good_percentage,
    ROUND(COUNT(*) FILTER (WHERE re.overall_score >= 50 AND re.overall_score < 70) * 100.0 / COUNT(*), 1) as fair_percentage,
    ROUND(COUNT(*) FILTER (WHERE re.overall_score < 50) * 100.0 / COUNT(*), 1) as poor_percentage
  FROM public.rag_evaluations re
  WHERE re.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE_TRUNC(time_period, re.created_at)
  ORDER BY period_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function for strategy comparison
CREATE OR REPLACE FUNCTION compare_retrieval_strategies(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  strategy TEXT,
  total_evaluations BIGINT,
  average_score NUMERIC,
  average_precision NUMERIC,
  average_recall NUMERIC,
  average_faithfulness NUMERIC,
  average_relevancy NUMERIC,
  average_response_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    re.retrieval_strategy as strategy,
    COUNT(*) as total_evaluations,
    ROUND(AVG(re.overall_score), 2) as average_score,
    ROUND(AVG(re.context_precision), 3) as average_precision,
    ROUND(AVG(re.context_recall), 3) as average_recall,
    ROUND(AVG(re.faithfulness), 3) as average_faithfulness,
    ROUND(AVG(re.answer_relevancy), 3) as average_relevancy,
    ROUND(AVG(re.response_time_ms), 0) as average_response_time
  FROM public.rag_evaluations re
  WHERE re.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY re.retrieval_strategy
  ORDER BY average_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function for performance alerts
CREATE OR REPLACE FUNCTION check_rag_performance_alerts()
RETURNS TABLE (
  alert_type TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_performance AS (
    SELECT 
      AVG(overall_score) as avg_score,
      AVG(response_time_ms) as avg_response_time,
      AVG(context_precision) as avg_precision,
      COUNT(*) as total_evaluations
    FROM public.rag_evaluations
    WHERE created_at >= NOW() - INTERVAL '1 hour'
  )
  SELECT 
    'low_score' as alert_type,
    rp.avg_score as current_value,
    70.0 as threshold_value,
    'RAG performance below threshold: ' || ROUND(rp.avg_score, 1) || '%' as message
  FROM recent_performance rp
  WHERE rp.avg_score < 70 AND rp.total_evaluations >= 5
  
  UNION ALL
  
  SELECT 
    'high_latency' as alert_type,
    rp.avg_response_time as current_value,
    2000.0 as threshold_value,
    'RAG response time above threshold: ' || ROUND(rp.avg_response_time, 0) || 'ms' as message
  FROM recent_performance rp
  WHERE rp.avg_response_time > 2000 AND rp.total_evaluations >= 5
  
  UNION ALL
  
  SELECT 
    'poor_retrieval' as alert_type,
    rp.avg_precision as current_value,
    0.7 as threshold_value,
    'RAG retrieval precision below threshold: ' || ROUND(rp.avg_precision, 3) as message
  FROM recent_performance rp
  WHERE rp.avg_precision < 0.7 AND rp.total_evaluations >= 5;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating evaluation summary
CREATE OR REPLACE FUNCTION update_evaluation_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily summary
  INSERT INTO public.rag_evaluation_summary (
    time_period,
    period_start,
    period_end,
    total_evaluations,
    average_score,
    average_precision,
    average_recall,
    average_faithfulness,
    average_relevancy,
    excellent_count,
    good_count,
    fair_count,
    poor_count
  )
  SELECT 
    'day',
    DATE_TRUNC('day', NEW.created_at),
    DATE_TRUNC('day', NEW.created_at) + INTERVAL '1 day',
    COUNT(*),
    ROUND(AVG(overall_score), 2),
    ROUND(AVG(context_precision), 3),
    ROUND(AVG(context_recall), 3),
    ROUND(AVG(faithfulness), 3),
    ROUND(AVG(answer_relevancy), 3),
    COUNT(*) FILTER (WHERE overall_score >= 90),
    COUNT(*) FILTER (WHERE overall_score >= 70 AND overall_score < 90),
    COUNT(*) FILTER (WHERE overall_score >= 50 AND overall_score < 70),
    COUNT(*) FILTER (WHERE overall_score < 50)
  FROM public.rag_evaluations
  WHERE DATE_TRUNC('day', created_at) = DATE_TRUNC('day', NEW.created_at)
  ON CONFLICT (time_period, period_start, period_end) 
  DO UPDATE SET
    total_evaluations = EXCLUDED.total_evaluations,
    average_score = EXCLUDED.average_score,
    average_precision = EXCLUDED.average_precision,
    average_recall = EXCLUDED.average_recall,
    average_faithfulness = EXCLUDED.average_faithfulness,
    average_relevancy = EXCLUDED.average_relevancy,
    excellent_count = EXCLUDED.excellent_count,
    good_count = EXCLUDED.good_count,
    fair_count = EXCLUDED.fair_count,
    poor_count = EXCLUDED.poor_count,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evaluation_summary
  AFTER INSERT ON public.rag_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_evaluation_summary();

-- Insert sample evaluation data for testing
INSERT INTO public.rag_evaluations (
  query,
  answer,
  retrieval_strategy,
  response_time_ms,
  session_id,
  context_precision,
  context_recall,
  faithfulness,
  answer_relevancy,
  overall_score,
  context_count,
  avg_context_length,
  recommendations
) VALUES 
(
  'What are FDA requirements for 510(k) submissions?',
  'FDA 510(k) submissions require substantial equivalence to a predicate device, clinical data, and comprehensive documentation.',
  'hybrid_rerank',
  850,
  'test-session-1',
  0.85,
  0.78,
  0.92,
  0.88,
  86,
  5,
  1200,
  ARRAY['Consider increasing retrieval count for better recall']
),
(
  'How long does FDA review take?',
  'FDA review typically takes 90 days for 510(k) submissions, but can vary based on complexity.',
  'rag_fusion',
  1200,
  'test-session-2',
  0.72,
  0.65,
  0.85,
  0.82,
  76,
  4,
  950,
  ARRAY['Improve retrieval strategy', 'Add more context sources']
);

-- Create view for easy monitoring
CREATE OR REPLACE VIEW public.rag_performance_dashboard AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  retrieval_strategy,
  COUNT(*) as evaluations_count,
  ROUND(AVG(overall_score), 1) as avg_score,
  ROUND(AVG(response_time_ms), 0) as avg_response_time,
  ROUND(AVG(context_precision), 3) as avg_precision,
  ROUND(AVG(context_recall), 3) as avg_recall,
  ROUND(AVG(faithfulness), 3) as avg_faithfulness,
  ROUND(AVG(answer_relevancy), 3) as avg_relevancy
FROM public.rag_evaluations
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), retrieval_strategy
ORDER BY hour DESC, avg_score DESC;
