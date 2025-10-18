-- Expert consultation sessions
CREATE TABLE expert_consultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    expert_type TEXT NOT NULL,
    original_query TEXT NOT NULL,
    business_context JSONB,
    status TEXT NOT NULL DEFAULT 'running',
    reasoning_mode TEXT NOT NULL DEFAULT 'react',
    budget DECIMAL(10, 4) NOT NULL DEFAULT 10.0,
    max_iterations INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reasoning steps (for analytics)
CREATE TABLE reasoning_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES expert_consultation_sessions(id) ON DELETE CASCADE,
    iteration INTEGER NOT NULL,
    phase TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session costs
CREATE TABLE session_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES expert_consultation_sessions(id) ON DELETE CASCADE,
    cost_accumulated DECIMAL(10, 4) NOT NULL DEFAULT 0.0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost_by_phase JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session checkpoints (named)
CREATE TABLE session_checkpoints (
    id TEXT PRIMARY KEY,
    session_id UUID REFERENCES expert_consultation_sessions(id) ON DELETE CASCADE,
    label TEXT,
    checkpoint_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution analytics
CREATE TABLE execution_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES expert_consultation_sessions(id) ON DELETE CASCADE,
    metrics JSONB NOT NULL,
    insights TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user ON expert_consultation_sessions(user_id);
CREATE INDEX idx_sessions_status ON expert_consultation_sessions(status);
CREATE INDEX idx_sessions_created ON expert_consultation_sessions(created_at);
CREATE INDEX idx_reasoning_session ON reasoning_steps(session_id);
CREATE INDEX idx_reasoning_phase ON reasoning_steps(phase);
CREATE INDEX idx_costs_session ON session_costs(session_id);
CREATE INDEX idx_checkpoints_session ON session_checkpoints(session_id);
CREATE INDEX idx_analytics_session ON execution_analytics(session_id);

-- RLS Policies
ALTER TABLE expert_consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON expert_consultation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON expert_consultation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON expert_consultation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Reasoning steps are accessible with session access
CREATE POLICY "Users can view reasoning steps for own sessions" ON reasoning_steps
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM expert_consultation_sessions 
            WHERE user_id = auth.uid()
        )
    );

-- Similar policies for other tables
CREATE POLICY "Users can view costs for own sessions" ON session_costs
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM expert_consultation_sessions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view checkpoints for own sessions" ON session_checkpoints
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM expert_consultation_sessions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view analytics for own sessions" ON execution_analytics
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM expert_consultation_sessions 
            WHERE user_id = auth.uid()
        )
    );

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_session_analytics(p_session_id UUID)
RETURNS TABLE (
    session_id UUID,
    total_cost DECIMAL,
    iterations_completed INTEGER,
    phases_completed TEXT[],
    average_confidence DECIMAL,
    execution_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        COALESCE(sc.cost_accumulated, 0),
        COUNT(DISTINCT rs.iteration)::INTEGER,
        ARRAY_AGG(DISTINCT rs.phase),
        AVG((rs.metadata->>'confidence')::DECIMAL),
        s.updated_at - s.created_at
    FROM expert_consultation_sessions s
    LEFT JOIN session_costs sc ON s.id = sc.session_id
    LEFT JOIN reasoning_steps rs ON s.id = rs.session_id
    WHERE s.id = p_session_id
    GROUP BY s.id, sc.cost_accumulated, s.created_at, s.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user performance metrics
CREATE OR REPLACE FUNCTION get_user_performance_metrics(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_sessions INTEGER,
    average_cost DECIMAL,
    average_iterations DECIMAL,
    success_rate DECIMAL,
    average_duration INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER,
        AVG(sc.cost_accumulated),
        AVG(COUNT(DISTINCT rs.iteration)::DECIMAL),
        AVG(CASE WHEN s.status = 'completed' THEN 1.0 ELSE 0.0 END),
        AVG(s.updated_at - s.created_at)
    FROM expert_consultation_sessions s
    LEFT JOIN session_costs sc ON s.id = sc.session_id
    LEFT JOIN reasoning_steps rs ON s.id = rs.session_id
    WHERE s.user_id = p_user_id 
    AND s.created_at >= NOW() - INTERVAL '1 day' * p_days
    GROUP BY s.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
