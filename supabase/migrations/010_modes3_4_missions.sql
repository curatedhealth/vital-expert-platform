-- ============================================================================
-- Modes 3/4 Missions Foundation (Phase 1)
-- Non-destructive: checks for existing tables before creating.
-- ============================================================================

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MISSIONS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions') THEN
        CREATE TABLE missions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            user_id UUID NOT NULL,
            title TEXT NOT NULL,
            objective TEXT NOT NULL,
            mode INTEGER NOT NULL CHECK (mode IN (3,4)),
            status TEXT NOT NULL DEFAULT 'draft',
            todos JSONB DEFAULT '[]',
            selected_agents JSONB DEFAULT '[]',
            execution_plan JSONB DEFAULT '{}',
            budget_limit NUMERIC(10,2) DEFAULT 10.00,
            budget_spent NUMERIC(10,2) DEFAULT 0.00,
            workspace_path TEXT,
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX idx_missions_tenant ON missions(tenant_id);
        CREATE INDEX idx_missions_user ON missions(user_id);
        CREATE INDEX idx_missions_status ON missions(status);
        CREATE INDEX idx_missions_created ON missions(created_at DESC);
    END IF;
END $$;

-- Updated-at trigger
-- Define function (safe to re-create)
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $fn$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

-- Create trigger if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'missions_updated_at') THEN
        CREATE TRIGGER missions_updated_at
            BEFORE UPDATE ON missions
            FOR EACH ROW
            EXECUTE FUNCTION update_missions_updated_at();
    END IF;
END $$;

-- MISSION EVENTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mission_events') THEN
        CREATE TABLE mission_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
            event_type TEXT NOT NULL,
            event_data JSONB NOT NULL DEFAULT '{}',
            agent_name TEXT,
            agent_task TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX idx_mission_events_mission ON mission_events(mission_id);
        CREATE INDEX idx_mission_events_type ON mission_events(event_type);
        CREATE INDEX idx_mission_events_created ON mission_events(created_at);
    END IF;
END $$;

-- MISSION ARTIFACTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mission_artifacts') THEN
        CREATE TABLE mission_artifacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
            artifact_type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            file_path TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX idx_mission_artifacts_mission ON mission_artifacts(mission_id);
        CREATE INDEX idx_mission_artifacts_type ON mission_artifacts(artifact_type);
    END IF;
END $$;

-- MISSION CHECKPOINTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mission_checkpoints') THEN
        CREATE TABLE mission_checkpoints (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
            checkpoint_type TEXT NOT NULL,
            message TEXT NOT NULL,
            options JSONB NOT NULL,
            context JSONB DEFAULT '{}',
            status TEXT NOT NULL DEFAULT 'pending',
            response JSONB,
            responded_at TIMESTAMPTZ,
            timeout_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        CREATE INDEX idx_mission_checkpoints_mission ON mission_checkpoints(mission_id);
        CREATE INDEX idx_mission_checkpoints_status ON mission_checkpoints(status);
    END IF;
END $$;

-- RLS (tenant_id must match missions.tenant_id; assumes tenant_id claim in JWT)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_checkpoints ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent-ish via IF NOT EXISTS on policy name)
-- Policies (idempotent-ish via policyname)
DO $block$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'missions_select_tenant') THEN
        CREATE POLICY missions_select_tenant ON missions
            FOR SELECT USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'missions_insert_tenant') THEN
        CREATE POLICY missions_insert_tenant ON missions
            FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'missions_update_tenant') THEN
        CREATE POLICY missions_update_tenant ON missions
            FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'missions_delete_tenant') THEN
        CREATE POLICY missions_delete_tenant ON missions
            FOR DELETE USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
    END IF;
END $block$;

-- Inherit RLS for child tables
DO $block$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mission_events_select_tenant') THEN
        CREATE POLICY mission_events_select_tenant ON mission_events
            FOR SELECT USING (mission_id IN (SELECT id FROM missions WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mission_events_insert_tenant') THEN
        CREATE POLICY mission_events_insert_tenant ON mission_events
            FOR INSERT WITH CHECK (mission_id IN (SELECT id FROM missions WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
    END IF;
END $block$;

DO $block$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mission_artifacts_select_tenant') THEN
        CREATE POLICY mission_artifacts_select_tenant ON mission_artifacts
            FOR SELECT USING (mission_id IN (SELECT id FROM missions WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mission_artifacts_insert_tenant') THEN
        CREATE POLICY mission_artifacts_insert_tenant ON mission_artifacts
            FOR INSERT WITH CHECK (mission_id IN (SELECT id FROM missions WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
    END IF;
END $block$;

DO $block$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mission_checkpoints_select_tenant') THEN
        CREATE POLICY mission_checkpoints_select_tenant ON mission_checkpoints
            FOR SELECT USING (mission_id IN (SELECT id FROM missions WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mission_checkpoints_update_tenant') THEN
        CREATE POLICY mission_checkpoints_update_tenant ON mission_checkpoints
            FOR UPDATE USING (mission_id IN (SELECT id FROM missions WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));
    END IF;
END $block$;
