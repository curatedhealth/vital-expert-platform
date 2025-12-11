-- ============================================================================
-- VITAL Platform: Modes 3/4 Mission Infrastructure
-- Version: 1.0
-- Date: December 9, 2025
-- 
-- Run AFTER seed_runners_v4_isolated.sql
-- This creates the mission execution tables needed for autonomous workflows
-- ============================================================================

-- ============================================================================
-- MISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS missions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tenant & User (multi-tenant support)
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Mission Details
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    
    -- Mode: 3 = Autonomous-Manual, 4 = Autonomous-Automatic
    mode INTEGER NOT NULL DEFAULT 3 CHECK (mode IN (3, 4)),
    
    -- Agent Selection
    -- Mode 3: User-selected starting agent(s)
    -- Mode 4: Empty (system selects via GraphRAG)
    selected_agents JSONB DEFAULT '[]',
    
    -- Mission Template (from mission_templates table)
    template_id VARCHAR(100),
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',        -- Initial state
        'selecting',    -- Mode 4 only: AI selecting agents
        'briefing',     -- Planning phase (showing pre-flight)
        'ready',        -- Pre-flight approved, awaiting launch
        'running',      -- Execution in progress
        'paused',       -- User paused
        'checkpoint',   -- Awaiting HITL decision
        'completed',    -- Successfully finished
        'failed',       -- Error occurred
        'aborted'       -- User cancelled
    )),
    
    -- Planning Data (JSON)
    todos JSONB DEFAULT '[]',
    execution_plan JSONB DEFAULT '{}',
    
    -- Budget Management
    budget_limit DECIMAL(10,2) DEFAULT 10.00,
    budget_spent DECIMAL(10,2) DEFAULT 0.00,
    
    -- File System Path
    workspace_path TEXT,
    
    -- Results
    summary TEXT,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_missions_tenant ON missions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_missions_user ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_mode ON missions(mode);
CREATE INDEX IF NOT EXISTS idx_missions_template ON missions(template_id);
CREATE INDEX IF NOT EXISTS idx_missions_created ON missions(created_at DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS missions_updated_at ON missions;
CREATE TRIGGER missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_missions_updated_at();


-- ============================================================================
-- MISSION EVENTS TABLE (Event Sourcing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    -- Event Data
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    
    -- Agent Info (optional)
    agent_name TEXT,
    agent_level INTEGER,
    agent_task TEXT,
    
    -- Runner Info (optional, links to vital_runners)
    runner_code VARCHAR(100),
    
    -- Timing
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_events_mission ON mission_events(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_events_type ON mission_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mission_events_runner ON mission_events(runner_code);
CREATE INDEX IF NOT EXISTS idx_mission_events_created ON mission_events(created_at);


-- ============================================================================
-- MISSION ARTIFACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    -- Artifact Details
    artifact_type TEXT NOT NULL CHECK (artifact_type IN (
        'report', 'table', 'chart', 'timeline', 
        'comparison', 'recommendation', 'summary', 
        'raw_data', 'document', 'analysis'
    )),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_path TEXT,
    
    -- Creator
    created_by_agent TEXT,
    created_by_runner VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_artifacts_mission ON mission_artifacts(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_artifacts_type ON mission_artifacts(artifact_type);


-- ============================================================================
-- MISSION CHECKPOINTS TABLE (HITL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    -- Checkpoint Details
    checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN (
        'budget',       -- Budget threshold reached
        'quality',      -- Quality review needed
        'direction',    -- Strategic decision needed
        'approval',     -- Explicit approval required
        'error'         -- Error recovery decision
    )),
    message TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    context JSONB DEFAULT '{}',
    
    -- Response
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'modified', 'timeout'
    )),
    response JSONB,
    responded_at TIMESTAMPTZ,
    
    -- Timing
    timeout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_mission ON mission_checkpoints(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_checkpoints_status ON mission_checkpoints(status);


-- ============================================================================
-- MISSION SOURCES TABLE (Evidence/Citations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    -- Source Details
    title TEXT NOT NULL,
    source_type TEXT NOT NULL,
    content_preview TEXT,
    url TEXT,
    
    -- Relevance
    relevance_score DECIMAL(5,4),
    cited_by JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_sources_mission ON mission_sources(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_sources_type ON mission_sources(source_type);


-- ============================================================================
-- MISSION TODOS TABLE (Task Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    
    -- Todo Details
    description TEXT NOT NULL,
    assigned_agent TEXT,
    assigned_runner VARCHAR(100),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'failed', 'skipped'
    )),
    
    -- Ordering
    sequence_order INTEGER DEFAULT 0,
    depends_on UUID[],
    
    -- Results
    result_summary TEXT,
    result_detail_path TEXT,
    sources_found JSONB DEFAULT '[]',
    
    -- Execution Info
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    
    -- L3/L4/L5 tracking
    specialists_used JSONB DEFAULT '[]',
    workers_used JSONB DEFAULT '[]',
    tools_used JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mission_todos_mission ON mission_todos(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_todos_status ON mission_todos(status);
CREATE INDEX IF NOT EXISTS idx_mission_todos_sequence ON mission_todos(mission_id, sequence_order);


-- ============================================================================
-- VIEWS
-- ============================================================================

-- Mission summary view
CREATE OR REPLACE VIEW v_missions_summary AS
SELECT 
    m.id,
    m.title,
    m.mode,
    m.status,
    m.template_id,
    mt.name AS template_name,
    mt.family AS template_family,
    m.budget_limit,
    m.budget_spent,
    (SELECT COUNT(*) FROM mission_todos t WHERE t.mission_id = m.id) AS total_todos,
    (SELECT COUNT(*) FROM mission_todos t WHERE t.mission_id = m.id AND t.status = 'completed') AS completed_todos,
    (SELECT COUNT(*) FROM mission_artifacts a WHERE a.mission_id = m.id) AS artifact_count,
    (SELECT COUNT(*) FROM mission_checkpoints c WHERE c.mission_id = m.id AND c.status = 'pending') AS pending_checkpoints,
    m.created_at,
    m.started_at,
    m.completed_at
FROM missions m
LEFT JOIN mission_templates mt ON m.template_id = mt.id;


-- Mission with recent events
CREATE OR REPLACE VIEW v_missions_with_events AS
SELECT 
    m.*,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'event_type', e.event_type,
                'agent_name', e.agent_name,
                'created_at', e.created_at
            ) ORDER BY e.created_at DESC
        )
        FROM (
            SELECT * FROM mission_events 
            WHERE mission_id = m.id 
            ORDER BY created_at DESC 
            LIMIT 10
        ) e
    ) AS recent_events
FROM missions m;


-- ============================================================================
-- RLS POLICIES (Optional - enable if using Supabase RLS)
-- ============================================================================

-- Uncomment these if you want Row Level Security

-- ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_artifacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_checkpoints ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_todos ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY missions_tenant_isolation ON missions
--     FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);


-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'Mission Infrastructure Created' AS status;

SELECT 
    'missions' AS tbl, 'main mission table' AS purpose
UNION ALL SELECT 
    'mission_events', 'event sourcing'
UNION ALL SELECT 
    'mission_artifacts', 'output files/reports'
UNION ALL SELECT 
    'mission_checkpoints', 'HITL pause points'
UNION ALL SELECT 
    'mission_sources', 'evidence/citations'
UNION ALL SELECT 
    'mission_todos', 'task tracking';
