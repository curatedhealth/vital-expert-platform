-- Fix missions table schema for panel_autonomous.py
-- Add missing columns required by the Panel Autonomous API

-- Add user_id column
ALTER TABLE missions ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add title column
ALTER TABLE missions ADD COLUMN IF NOT EXISTS title TEXT;

-- Add objective column
ALTER TABLE missions ADD COLUMN IF NOT EXISTS objective TEXT;

-- Add budget_limit column
ALTER TABLE missions ADD COLUMN IF NOT EXISTS budget_limit NUMERIC(12,6) DEFAULT 10.0;

-- Add current_checkpoint_id column (used by ask_expert_autonomous.py)
ALTER TABLE missions ADD COLUMN IF NOT EXISTS current_checkpoint_id UUID REFERENCES mission_checkpoints(id);

-- Add completed_at column if missing
ALTER TABLE missions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add started_at column if missing
ALTER TABLE missions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_missions_user ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_status ON missions(user_id, status);
