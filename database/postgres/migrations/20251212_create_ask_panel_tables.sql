-- ============================================================================
-- Migration: Create Ask Panel Tables (Board System)
-- Date: 2025-12-12
-- Description: Creates all tables needed for real Ask Panel functionality
--              Enables multi-expert panel discussions with LLM agents
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. BOARD_SESSION (Main Panel Table)
-- ============================================================================
-- Stores panel discussion sessions

CREATE TABLE IF NOT EXISTS board_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Panel Identity
    name TEXT NOT NULL,
    description TEXT,

    -- Panel Configuration
    archetype TEXT NOT NULL DEFAULT 'structured',  -- structured, open, socratic, adversarial, delphi, hybrid
    fusion_model TEXT DEFAULT 'autonomous',         -- autonomous, human_led, hybrid
    mode TEXT DEFAULT 'parallel',                   -- parallel, sequential

    -- Agenda (JSONB array of topics)
    agenda JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"topic": "What is the best approach?", "duration": 10, "max_rounds": 3}]

    -- Evidence/Context
    evidence_pack_id UUID,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft',  -- draft, active, paused, completed, failed, cancelled

    -- Ownership
    created_by UUID NOT NULL,
    organization_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT board_session_archetype_check CHECK (
        archetype IN ('structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid')
    ),
    CONSTRAINT board_session_status_check CHECK (
        status IN ('draft', 'active', 'paused', 'completed', 'failed', 'cancelled')
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_board_session_status ON board_session(status);
CREATE INDEX IF NOT EXISTS idx_board_session_created_by ON board_session(created_by);
CREATE INDEX IF NOT EXISTS idx_board_session_organization ON board_session(organization_id);
CREATE INDEX IF NOT EXISTS idx_board_session_created_at ON board_session(created_at DESC);

COMMENT ON TABLE board_session IS 'Multi-expert panel discussion sessions for Ask Panel';

-- ============================================================================
-- 2. BOARD_PANEL_MEMBER (Panel Members)
-- ============================================================================
-- Links agents to panel sessions

CREATE TABLE IF NOT EXISTS board_panel_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Member Configuration
    persona TEXT DEFAULT 'EXPERT',       -- Role/persona in panel
    role TEXT DEFAULT 'expert',          -- expert, moderator, observer
    weight DECIMAL(3, 2) DEFAULT 1.0,    -- Voting weight (0.0 - 1.0)

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: agent can only be in panel once
    UNIQUE(session_id, agent_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_board_panel_member_session ON board_panel_member(session_id);
CREATE INDEX IF NOT EXISTS idx_board_panel_member_agent ON board_panel_member(agent_id);

COMMENT ON TABLE board_panel_member IS 'Agent membership in panel sessions';

-- ============================================================================
-- 3. BOARD_REPLY (Expert Responses)
-- ============================================================================
-- Stores individual expert responses

CREATE TABLE IF NOT EXISTS board_reply (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE SET NULL,

    -- Response Data
    turn_no INTEGER NOT NULL DEFAULT 1,          -- Round number
    persona TEXT,                                 -- Expert persona/role
    answer TEXT NOT NULL,                         -- The actual response

    -- Quality Metrics
    confidence DECIMAL(3, 2) DEFAULT 0.75,       -- 0.0 - 1.0

    -- Evidence
    citations JSONB DEFAULT '[]'::jsonb,         -- Array of citation objects
    -- Example: [{"source": "FDA Guidance", "url": "...", "quote": "..."}]

    -- Flags
    flags TEXT[] DEFAULT '{}',                   -- ERROR, LOW_CONFIDENCE, NEEDS_REVIEW, etc.

    -- Token Usage
    tokens_used INTEGER,
    model TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_board_reply_session ON board_reply(session_id);
CREATE INDEX IF NOT EXISTS idx_board_reply_agent ON board_reply(agent_id);
CREATE INDEX IF NOT EXISTS idx_board_reply_turn ON board_reply(session_id, turn_no);
CREATE INDEX IF NOT EXISTS idx_board_reply_created ON board_reply(created_at DESC);

COMMENT ON TABLE board_reply IS 'Individual expert responses in panel discussions';

-- ============================================================================
-- 4. BOARD_SYNTHESIS (Consensus/Summary)
-- ============================================================================
-- Stores consensus and synthesis for each round

CREATE TABLE IF NOT EXISTS board_synthesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationships
    session_id UUID NOT NULL REFERENCES board_session(id) ON DELETE CASCADE,

    -- Round
    turn_no INTEGER NOT NULL DEFAULT 1,

    -- Synthesis Content
    summary_md TEXT,                             -- Markdown summary
    consensus TEXT,                              -- Consensus statement
    dissent TEXT,                                -- Dissenting opinions
    risks JSONB DEFAULT '[]'::jsonb,             -- Identified risks
    recommendations JSONB DEFAULT '[]'::jsonb,   -- Action items

    -- Approval
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,

    -- Metrics
    consensus_level DECIMAL(3, 2),               -- 0.0 - 1.0
    participant_count INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one synthesis per round
    UNIQUE(session_id, turn_no)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_board_synthesis_session ON board_synthesis(session_id);
CREATE INDEX IF NOT EXISTS idx_board_synthesis_turn ON board_synthesis(session_id, turn_no);

COMMENT ON TABLE board_synthesis IS 'Consensus and synthesis from panel rounds';

-- ============================================================================
-- 5. EVIDENCE_PACK (Optional - for RAG context)
-- ============================================================================
-- Stores evidence packs for panel context

CREATE TABLE IF NOT EXISTS evidence_pack (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    name TEXT NOT NULL,
    description TEXT,

    -- Sources (JSONB array)
    sources JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"type": "document", "therapeutic_area": "oncology", "url": "..."}]

    -- Ownership
    created_by UUID NOT NULL,
    organization_id UUID,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_pack_created_by ON evidence_pack(created_by);
CREATE INDEX IF NOT EXISTS idx_evidence_pack_organization ON evidence_pack(organization_id);

COMMENT ON TABLE evidence_pack IS 'Evidence packs for RAG context in panels';

-- Add foreign key from board_session to evidence_pack
ALTER TABLE board_session
    ADD CONSTRAINT fk_board_session_evidence_pack
    FOREIGN KEY (evidence_pack_id) REFERENCES evidence_pack(id) ON DELETE SET NULL;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_board_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_board_session_updated_at
    BEFORE UPDATE ON board_session
    FOR EACH ROW EXECUTE FUNCTION update_board_updated_at();

CREATE TRIGGER trg_board_panel_member_updated_at
    BEFORE UPDATE ON board_panel_member
    FOR EACH ROW EXECUTE FUNCTION update_board_updated_at();

CREATE TRIGGER trg_board_synthesis_updated_at
    BEFORE UPDATE ON board_synthesis
    FOR EACH ROW EXECUTE FUNCTION update_board_updated_at();

CREATE TRIGGER trg_evidence_pack_updated_at
    BEFORE UPDATE ON evidence_pack
    FOR EACH ROW EXECUTE FUNCTION update_board_updated_at();

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE board_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_panel_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reply ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_pack ENABLE ROW LEVEL SECURITY;

-- Policies for board_session
CREATE POLICY "board_session_select" ON board_session
    FOR SELECT USING (
        created_by = auth.uid()
        OR organization_id = (current_setting('app.current_tenant_id', true))::uuid
        OR organization_id IS NULL
    );

CREATE POLICY "board_session_insert" ON board_session
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        OR organization_id = (current_setting('app.current_tenant_id', true))::uuid
    );

CREATE POLICY "board_session_update" ON board_session
    FOR UPDATE USING (
        created_by = auth.uid()
        OR organization_id = (current_setting('app.current_tenant_id', true))::uuid
    );

CREATE POLICY "board_session_delete" ON board_session
    FOR DELETE USING (
        created_by = auth.uid()
    );

-- Service role has full access
CREATE POLICY "board_session_service" ON board_session
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Similar policies for other tables
CREATE POLICY "board_panel_member_all" ON board_panel_member
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM board_session bs
            WHERE bs.id = session_id
            AND (bs.created_by = auth.uid()
                 OR bs.organization_id = (current_setting('app.current_tenant_id', true))::uuid)
        )
    );

CREATE POLICY "board_panel_member_service" ON board_panel_member
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "board_reply_all" ON board_reply
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM board_session bs
            WHERE bs.id = session_id
            AND (bs.created_by = auth.uid()
                 OR bs.organization_id = (current_setting('app.current_tenant_id', true))::uuid)
        )
    );

CREATE POLICY "board_reply_service" ON board_reply
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "board_synthesis_all" ON board_synthesis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM board_session bs
            WHERE bs.id = session_id
            AND (bs.created_by = auth.uid()
                 OR bs.organization_id = (current_setting('app.current_tenant_id', true))::uuid)
        )
    );

CREATE POLICY "board_synthesis_service" ON board_synthesis
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

CREATE POLICY "evidence_pack_select" ON evidence_pack
    FOR SELECT USING (
        created_by = auth.uid()
        OR organization_id = (current_setting('app.current_tenant_id', true))::uuid
        OR organization_id IS NULL
    );

CREATE POLICY "evidence_pack_insert" ON evidence_pack
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
        OR organization_id = (current_setting('app.current_tenant_id', true))::uuid
    );

CREATE POLICY "evidence_pack_service" ON evidence_pack
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ============================================================================
-- 8. VERIFICATION
-- ============================================================================

DO $$
DECLARE
    tbl_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tbl_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('board_session', 'board_panel_member', 'board_reply', 'board_synthesis', 'evidence_pack');

    IF tbl_count = 5 THEN
        RAISE NOTICE '';
        RAISE NOTICE '============================================';
        RAISE NOTICE '  ASK PANEL TABLES CREATED SUCCESSFULLY';
        RAISE NOTICE '============================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Tables created:';
        RAISE NOTICE '  - board_session (panel sessions)';
        RAISE NOTICE '  - board_panel_member (agent membership)';
        RAISE NOTICE '  - board_reply (expert responses)';
        RAISE NOTICE '  - board_synthesis (consensus/summary)';
        RAISE NOTICE '  - evidence_pack (RAG context)';
        RAISE NOTICE '';
        RAISE NOTICE 'RLS policies enabled for all tables.';
        RAISE NOTICE '';
    ELSE
        RAISE WARNING 'Some tables may not have been created. Found %/5', tbl_count;
    END IF;
END $$;

COMMIT;
