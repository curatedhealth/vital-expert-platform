-- ============================================================================
-- Skills Full Content Schema Migration
-- ============================================================================
-- Adds columns for storing complete SKILL.md content
-- ============================================================================

BEGIN;

-- Add new columns
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS full_content TEXT,
ADD COLUMN IF NOT EXISTS content_format VARCHAR(50) DEFAULT 'markdown',
ADD COLUMN IF NOT EXISTS content_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS content_loaded_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN skills.full_content IS 'Complete skill content from SKILL.md file';
COMMENT ON COLUMN skills.content_format IS 'Format of content: markdown, yaml, json';
COMMENT ON COLUMN skills.content_source IS 'Source: vital-command-center, awesome-claude, internal';
COMMENT ON COLUMN skills.file_path IS 'Original file path for reference';
COMMENT ON COLUMN skills.content_loaded_at IS 'Timestamp when content was loaded';

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_skills_full_content_search 
ON skills USING gin(to_tsvector('english', COALESCE(full_content, '')));

-- Create index on content source
CREATE INDEX IF NOT EXISTS idx_skills_content_source 
ON skills(content_source) 
WHERE content_source IS NOT NULL;

COMMIT;

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'skills' 
AND column_name IN ('full_content', 'content_format', 'content_source', 'file_path', 'content_loaded_at')
ORDER BY ordinal_position;


