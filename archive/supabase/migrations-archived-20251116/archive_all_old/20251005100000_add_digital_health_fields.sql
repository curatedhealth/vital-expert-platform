-- Migration: Add Digital Health specific fields to agents table
-- Created: 2025-10-05
-- Description: Add fields for FDA SaMD classification and other digital health requirements

-- Add FDA SaMD classification field
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS fda_samd_class text;

-- Add comment
COMMENT ON COLUMN public.agents.fda_samd_class IS 'FDA Software as a Medical Device classification (Class I, Class II, Class III)';
