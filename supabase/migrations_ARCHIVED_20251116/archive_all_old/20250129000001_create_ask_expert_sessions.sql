-- Ask Expert Sessions Migration
-- Creates tables for Mode 1: Interactive Manual session and message management
-- Following gold standard patterns from enterprise AI/ML systems

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversation Sessions Table
CREATE TABLE IF NOT EXISTS ask_expert_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    mode VARCHAR(50) NOT NULL DEFAULT 'mode_1_interactive_manual',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
    metadata JSONB DEFAULT '{}',
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 6) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Messages Table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON ask_expert_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON ask_expert_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON ask_expert_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON ask_expert_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON ask_expert_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON ask_expert_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON ask_expert_messages(created_at DESC);

-- Row Level Security (if using Supabase Auth)
-- ALTER TABLE ask_expert_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ask_expert_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (commented out - enable if using Supabase Auth)
/*
CREATE POLICY "Users can view their own sessions"
    ON ask_expert_sessions FOR SELECT
    USING (user_id = auth.uid() OR tenant_id IN (
        SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view their session messages"
    ON ask_expert_messages FOR SELECT
    USING (session_id IN (
        SELECT id FROM ask_expert_sessions WHERE user_id = auth.uid()
    ));
*/

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ask_expert_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ask_expert_sessions_updated_at
    BEFORE UPDATE ON ask_expert_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_ask_expert_sessions_updated_at();

