-- Normalize missions JSONB (Phase 2 - non-destructive)
-- Extract mission checkpoint options/responses and mission todo associations (tools/workers/specialists/sources) into relational tables.
-- Keeps existing JSONB columns for rollback; backfill is best-effort and skips unexpected shapes.

CREATE TABLE IF NOT EXISTS mission_checkpoint_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id UUID NOT NULL REFERENCES mission_checkpoints(id) ON DELETE CASCADE,
    option_key TEXT,
    option_label TEXT,
    is_default BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checkpoint_options_checkpoint ON mission_checkpoint_options(checkpoint_id);

CREATE TABLE IF NOT EXISTS mission_checkpoint_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkpoint_id UUID NOT NULL REFERENCES mission_checkpoints(id) ON DELETE CASCADE,
    decision TEXT,
    responder TEXT,
    notes TEXT,
    responded_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checkpoint_responses_checkpoint ON mission_checkpoint_responses(checkpoint_id);

CREATE TABLE IF NOT EXISTS mission_todo_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_id UUID NOT NULL REFERENCES mission_todos(id) ON DELETE CASCADE,
    tool_id TEXT,
    tool_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_todo_tools_todo ON mission_todo_tools(todo_id);

CREATE TABLE IF NOT EXISTS mission_todo_workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_id UUID NOT NULL REFERENCES mission_todos(id) ON DELETE CASCADE,
    worker_id TEXT,
    worker_role TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_todo_workers_todo ON mission_todo_workers(todo_id);

CREATE TABLE IF NOT EXISTS mission_todo_specialists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_id UUID NOT NULL REFERENCES mission_todos(id) ON DELETE CASCADE,
    specialist_id TEXT,
    specialty TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_todo_specialists_todo ON mission_todo_specialists(todo_id);

CREATE TABLE IF NOT EXISTS mission_todo_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    todo_id UUID NOT NULL REFERENCES mission_todos(id) ON DELETE CASCADE,
    source_ref TEXT,
    source_title TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mission_todo_sources_todo ON mission_todo_sources(todo_id);

-- Backfill checkpoint options/response from JSONB (options/response)
DO $$
DECLARE
    rec RECORD;
    opt JSONB;
BEGIN
    FOR rec IN SELECT id, options, response, responded_at FROM mission_checkpoints WHERE options IS NOT NULL LOOP
        IF jsonb_typeof(rec.options) = 'array' THEN
            FOR opt IN SELECT * FROM jsonb_array_elements(rec.options)
            LOOP
                INSERT INTO mission_checkpoint_options (checkpoint_id, option_key, option_label, is_default)
                VALUES (
                    rec.id,
                    opt->> 'key',
                    opt->> 'label',
                    (opt->> 'default')::boolean
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;

        IF rec.response IS NOT NULL THEN
            INSERT INTO mission_checkpoint_responses (checkpoint_id, decision, responder, notes, responded_at)
            VALUES (
                rec.id,
                rec.response->> 'decision',
                rec.response->> 'responder',
                rec.response->> 'notes',
                COALESCE((rec.response->> 'responded_at')::timestamptz, rec.responded_at)
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- Backfill todo associations from JSONB arrays: tools_used, workers_used, specialists_used, sources_found
DO $$
DECLARE
    rec RECORD;
    elem JSONB;
BEGIN
    FOR rec IN SELECT id, tools_used, workers_used, specialists_used, sources_found FROM mission_todos LOOP
        IF rec.tools_used IS NOT NULL AND jsonb_typeof(rec.tools_used) = 'array' THEN
            FOR elem IN SELECT * FROM jsonb_array_elements(rec.tools_used)
            LOOP
                INSERT INTO mission_todo_tools (todo_id, tool_id, tool_name)
                VALUES (
                    rec.id,
                    elem->> 'id',
                    elem->> 'name'
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;

        IF rec.workers_used IS NOT NULL AND jsonb_typeof(rec.workers_used) = 'array' THEN
            FOR elem IN SELECT * FROM jsonb_array_elements(rec.workers_used)
            LOOP
                INSERT INTO mission_todo_workers (todo_id, worker_id, worker_role)
                VALUES (
                    rec.id,
                    elem->> 'id',
                    elem->> 'role'
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;

        IF rec.specialists_used IS NOT NULL AND jsonb_typeof(rec.specialists_used) = 'array' THEN
            FOR elem IN SELECT * FROM jsonb_array_elements(rec.specialists_used)
            LOOP
                INSERT INTO mission_todo_specialists (todo_id, specialist_id, specialty)
                VALUES (
                    rec.id,
                    elem->> 'id',
                    elem->> 'specialty'
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;

        IF rec.sources_found IS NOT NULL AND jsonb_typeof(rec.sources_found) = 'array' THEN
            FOR elem IN SELECT * FROM jsonb_array_elements(rec.sources_found)
            LOOP
                INSERT INTO mission_todo_sources (todo_id, source_ref, source_title)
                VALUES (
                    rec.id,
                    elem->> 'id',
                    elem->> 'title'
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
    END LOOP;
END $$;
