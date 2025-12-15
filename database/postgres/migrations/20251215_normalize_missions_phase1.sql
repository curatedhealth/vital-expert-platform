-- Normalize missions JSONB (Phase 1 - non-destructive)
-- Adds relational tables for selected agents and plan steps; keeps JSONB for rollback.
-- Backfill attempts are best-effort; rows are skipped if shape is unexpected.

CREATE TABLE IF NOT EXISTS mission_selected_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    agent_id TEXT,
    agent_name TEXT,
    role TEXT,
    selection_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_selected_agents_mission ON mission_selected_agents(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_selected_agents_order ON mission_selected_agents(mission_id, selection_order);

CREATE TABLE IF NOT EXISTS mission_plan_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL DEFAULT 0,
    title TEXT,
    details TEXT,
    status TEXT DEFAULT 'pending',
    owner_agent TEXT,
    owner_runner TEXT,
    estimated_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_plan_steps_mission ON mission_plan_steps(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_plan_steps_order ON mission_plan_steps(mission_id, step_order);

-- Backfill selected_agents -> mission_selected_agents
DO $$
DECLARE
    rec RECORD;
    elem JSONB;
    ord INTEGER;
BEGIN
    FOR rec IN SELECT id, selected_agents FROM missions WHERE selected_agents IS NOT NULL AND jsonb_typeof(selected_agents) = 'array'
    LOOP
        ord := 0;
        FOR elem IN SELECT * FROM jsonb_array_elements(rec.selected_agents)
        LOOP
            ord := ord + 1;
            INSERT INTO mission_selected_agents (mission_id, agent_id, agent_name, role, selection_order)
            VALUES (
                rec.id,
                elem->> 'id',
                elem->> 'name',
                elem->> 'role',
                ord
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Backfill execution_plan (array or object) -> mission_plan_steps
DO $$
DECLARE
    rec RECORD;
    elem JSONB;
    ord INTEGER;
BEGIN
    FOR rec IN SELECT id, execution_plan FROM missions WHERE execution_plan IS NOT NULL
    LOOP
        ord := 0;
        IF jsonb_typeof(rec.execution_plan) = 'array' THEN
            FOR elem IN SELECT * FROM jsonb_array_elements(rec.execution_plan)
            LOOP
                ord := ord + 1;
                INSERT INTO mission_plan_steps (mission_id, step_order, title, details, status, owner_agent, owner_runner, estimated_minutes)
                VALUES (
                    rec.id,
                    ord,
                    elem->> 'title',
                    elem->> 'description',
                    COALESCE(elem->> 'status', 'pending'),
                    elem->> 'owner_agent',
                    elem->> 'owner_runner',
                    NULLIF(elem->> 'estimated_minutes', '')::int
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        ELSIF jsonb_typeof(rec.execution_plan) = 'object' THEN
            INSERT INTO mission_plan_steps (mission_id, step_order, title, details, status, owner_agent, owner_runner, estimated_minutes)
            VALUES (
                rec.id,
                1,
                rec.execution_plan->> 'title',
                rec.execution_plan->> 'description',
                COALESCE(rec.execution_plan->> 'status', 'pending'),
                rec.execution_plan->> 'owner_agent',
                rec.execution_plan->> 'owner_runner',
                NULLIF(rec.execution_plan->> 'estimated_minutes', '')::int
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;
