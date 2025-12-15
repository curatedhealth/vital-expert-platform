-- ============================================================================
-- Migration: Add detailed_description field to skills table
-- Description: Adds markdown content field for detailed skill documentation
-- Date: 2025-12-15
-- ============================================================================

BEGIN;

-- Add detailed_description column for markdown content
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Add source_url column for external documentation links
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add github_url column for GitHub repository links
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Create index for full-text search on detailed_description
CREATE INDEX IF NOT EXISTS idx_skills_detailed_description_search
ON public.skills USING gin(to_tsvector('english', COALESCE(detailed_description, '')));

-- Add comment for documentation
COMMENT ON COLUMN public.skills.detailed_description IS 'Detailed markdown documentation for the skill including usage examples, workflows, and code snippets';
COMMENT ON COLUMN public.skills.source_url IS 'External URL to skill documentation or source';
COMMENT ON COLUMN public.skills.github_url IS 'GitHub repository URL for the skill';

COMMIT;

-- Verification
DO $$
DECLARE
    col_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'skills'
        AND column_name = 'detailed_description'
    ) INTO col_exists;

    IF col_exists THEN
        RAISE NOTICE '✓ detailed_description column added successfully';
    ELSE
        RAISE EXCEPTION '✗ Failed to add detailed_description column';
    END IF;
END $$;
