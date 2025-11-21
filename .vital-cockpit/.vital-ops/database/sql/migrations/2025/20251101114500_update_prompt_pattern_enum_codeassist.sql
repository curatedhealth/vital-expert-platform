-- ============================================================================
-- Update dh_prompt.pattern CHECK to allow 'Code-Assist'
-- Date: 2025-11-01
-- ============================================================================

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
  NULL;
END $$;

ALTER TABLE dh_prompt
  ADD CONSTRAINT dh_prompt_pattern_check
  CHECK (pattern IN ('CoT','Few-Shot','ReAct','Direct','RAG','Code-Assist','Other'));

