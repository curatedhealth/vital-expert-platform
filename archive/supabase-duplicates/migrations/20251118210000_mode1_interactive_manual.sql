-- Mode 1 Interactive Manual - Database Schema Migration
-- 
-- Creates tables required for Mode 1: Interactive Manual (Multi-Turn Conversation)
-- 
-- Tables:
-- - ask_expert_sessions: Conversation sessions
-- - ask_expert_messages: Individual messages in sessions
-- 
-- Author: VITAL AI Platform Team
-- Created: 2025-11-18

-- ============================================================================
-- TABLES
-- ============================================================================

-- Conversation Sessions
CREATE TABLE IF NOT EXISTS ask_expert_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL DEFAULT 'mode_1_interactive_manual'
        CHECK (mode IN ('mode_1_interactive_manual', 'mode_2_query_manual', 'mode_3_query_auto', 'mode_4_chat_auto')),
    status VARCHAR(50) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'ended', 'archived')),
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Messages
CREATE TABLE IF NOT EXISTS ask_expert_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ask_expert_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id),
    metadata JSONB DEFAULT '{}',
    tokens INTEGER,
    cost DECIMAL(10, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_tenant 
    ON ask_expert_sessions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_user 
    ON ask_expert_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_agent 
    ON ask_expert_sessions(agent_id);

CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_status 
    ON ask_expert_sessions(status);

CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_mode 
    ON ask_expert_sessions(mode);

CREATE INDEX IF NOT EXISTS idx_ask_expert_sessions_created 
    ON ask_expert_sessions(created_at DESC);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_ask_expert_messages_session 
    ON ask_expert_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_ask_expert_messages_agent 
    ON ask_expert_messages(agent_id);

CREATE INDEX IF NOT EXISTS idx_ask_expert_messages_created 
    ON ask_expert_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ask_expert_messages_role 
    ON ask_expert_messages(role);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE ask_expert_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_expert_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe way to handle IF NOT EXISTS)
DROP POLICY IF EXISTS "Users can view their own sessions" ON ask_expert_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON ask_expert_sessions;
DROP POLICY IF EXISTS "Users can update their sessions" ON ask_expert_sessions;
DROP POLICY IF EXISTS "Users can delete their sessions" ON ask_expert_sessions;
DROP POLICY IF EXISTS "Users can view their session messages" ON ask_expert_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON ask_expert_messages;

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
    ON ask_expert_sessions FOR SELECT
    USING (
        user_id = auth.uid() 
        OR tenant_id IN (
            SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create sessions"
    ON ask_expert_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their sessions"
    ON ask_expert_sessions FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their sessions"
    ON ask_expert_sessions FOR DELETE
    USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their session messages"
    ON ask_expert_messages FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM ask_expert_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their sessions"
    ON ask_expert_messages FOR INSERT
    WITH CHECK (
        session_id IN (
            SELECT id FROM ask_expert_sessions WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update session updated_at on message insert
CREATE OR REPLACE FUNCTION update_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ask_expert_sessions
    SET updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_updated_at
    AFTER INSERT ON ask_expert_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ask_expert_sessions IS 'Conversation sessions for Ask Expert service';
COMMENT ON TABLE ask_expert_messages IS 'Individual messages in Ask Expert conversations';

COMMENT ON COLUMN ask_expert_sessions.mode IS 'Ask Expert mode: mode_1_interactive_manual, mode_2_query_manual, mode_3_query_auto, mode_4_chat_auto';
COMMENT ON COLUMN ask_expert_sessions.status IS 'Session status: active, ended, archived';
COMMENT ON COLUMN ask_expert_sessions.total_messages IS 'Total number of messages in session';
COMMENT ON COLUMN ask_expert_sessions.total_tokens IS 'Total tokens used in session';
COMMENT ON COLUMN ask_expert_sessions.total_cost IS 'Total cost in USD';

COMMENT ON COLUMN ask_expert_messages.role IS 'Message role: user, assistant, system';
COMMENT ON COLUMN ask_expert_messages.metadata IS 'Message metadata: thinking_steps, citations, confidence, etc.';
COMMENT ON COLUMN ask_expert_messages.tokens IS 'Tokens used for this message';
COMMENT ON COLUMN ask_expert_messages.cost IS 'Cost in USD for this message';

