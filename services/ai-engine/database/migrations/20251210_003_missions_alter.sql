-- Align existing missions table to the new schema (idempotent).

ALTER TABLE missions
    ADD COLUMN IF NOT EXISTS goal TEXT,
    ADD COLUMN IF NOT EXISTS mode INTEGER,
    ADD COLUMN IF NOT EXISTS expert_id UUID,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure mode only allows 3 or 4
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'missions_mode_check'
        AND conrelid = 'missions'::regclass
    ) THEN
        ALTER TABLE missions ADD CONSTRAINT missions_mode_check CHECK (mode IN (3,4));
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END$$;

-- Ensure status values are constrained (best effort)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'missions_status_check'
        AND conrelid = 'missions'::regclass
    ) THEN
        ALTER TABLE missions ADD CONSTRAINT missions_status_check
        CHECK (status IN ('pending','planning','running','paused','completed','failed','cancelled'));
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END$$;
