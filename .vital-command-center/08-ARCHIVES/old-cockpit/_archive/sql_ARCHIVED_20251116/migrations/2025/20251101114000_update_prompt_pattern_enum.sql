-- ============================================================================
-- Update dh_prompt.pattern CHECK to allow 'RAG'
-- Date: 2025-11-01
-- Notes: Makes migration idempotent by dropping constraint if present
-- ============================================================================

-- Attempt to drop the existing check constraint if it exists.
-- Default name is usually dh_prompt_pattern_check, but we try both common names.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'dh_prompt'
      AND c.conname = 'dh_prompt_pattern_check'
  ) THEN
    ALTER TABLE dh_prompt DROP CONSTRAINT dh_prompt_pattern_check;
  END IF;
EXCEPTION WHEN undefined_object THEN
  -- ignore if already dropped
END $$;

-- Re-add the constraint with expanded enum including 'RAG'
ALTER TABLE dh_prompt
  ADD CONSTRAINT dh_prompt_pattern_check
  CHECK (pattern IN ('CoT','Few-Shot','ReAct','Direct','RAG','Other'));

