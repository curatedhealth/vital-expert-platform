-- Fix missions status constraint to include all valid status values
-- The workflow uses 'awaiting_checkpoint' but the constraint didn't include it
-- Also includes 'pending' which exists in production data

-- Drop the existing constraint (if any)
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_status_check;

-- Add updated constraint with ALL valid statuses:
-- - idle: Initial state (from state.py)
-- - draft: Initial creation state
-- - pending: Queued for execution
-- - planning: Strategy/planning phase
-- - running: Active execution
-- - awaiting_checkpoint: HITL checkpoint waiting for user input (Mode 3)
-- - refining: Refining results based on feedback
-- - verifying: Quality verification phase
-- - completed: Successfully finished
-- - failed: Execution failed
-- - cancelled: User cancelled
-- - paused: User paused execution
ALTER TABLE missions ADD CONSTRAINT missions_status_check
CHECK (status IN (
  'idle',
  'draft',
  'pending',
  'planning',
  'running',
  'awaiting_checkpoint',
  'refining',
  'verifying',
  'completed',
  'failed',
  'cancelled',
  'paused'
));
