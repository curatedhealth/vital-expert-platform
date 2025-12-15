-- ============================================================================
-- Add workflow_definition to user_panels table
-- ============================================================================
-- This migration adds a workflow_definition JSONB field to store the complete
-- workflow diagram (nodes, edges, phases) created in the designer

-- Add workflow_definition column to user_panels
ALTER TABLE public.user_panels
ADD COLUMN IF NOT EXISTS workflow_definition JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.user_panels.workflow_definition IS 'Complete workflow definition including nodes, edges, and phases from the designer';

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_panels_workflow_definition ON public.user_panels USING GIN (workflow_definition);
