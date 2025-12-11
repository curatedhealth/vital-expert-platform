-- Mission persistence for Modes 3/4

CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    mode INTEGER NOT NULL CHECK (mode IN (3, 4)),
    goal TEXT NOT NULL,
    expert_id UUID,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','planning','running','paused','completed','failed','cancelled')),
    metadata JSONB DEFAULT '{}',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mission_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    agent_level TEXT NOT NULL CHECK (agent_level IN ('L1','L2','L3','L4','L5')),
    agent_code TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','in_progress','completed','failed','skipped')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB,
    error_message TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_usd NUMERIC(12,6) DEFAULT 0,
    duration_ms INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(mission_id, step_index)
);

CREATE TABLE IF NOT EXISTS mission_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES mission_steps(id),
    checkpoint_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    title TEXT NOT NULL,
    description TEXT,
    context JSONB NOT NULL DEFAULT '{}',
    options JSONB DEFAULT '[]',
    user_response JSONB,
    responded_by UUID,
    responded_at TIMESTAMPTZ,
    timeout_seconds INTEGER DEFAULT 900,
    timeout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES mission_steps(id),
    artifact_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL DEFAULT 'application/json',
    content JSONB NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES mission_steps(id),
    source_type TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    citation TEXT,
    snippet TEXT,
    relevance_score NUMERIC(4,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_tool_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES mission_steps(id),
    tool_name TEXT NOT NULL,
    tool_category TEXT,
    input_args JSONB NOT NULL,
    output_result JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_usd NUMERIC(12,6) DEFAULT 0,
    duration_ms INTEGER,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mission_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES mission_steps(id),
    cost_type TEXT NOT NULL,
    model_name TEXT,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost_usd NUMERIC(12,6) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_missions_tenant ON missions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(tenant_id,status);
CREATE INDEX IF NOT EXISTS idx_mission_steps_mission ON mission_steps(mission_id, step_index);
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_pending ON mission_checkpoints(mission_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_mission_artifacts_mission ON mission_artifacts(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_sources_mission ON mission_sources(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_tool_calls_mission ON mission_tool_calls(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_costs_mission ON mission_costs(mission_id);
