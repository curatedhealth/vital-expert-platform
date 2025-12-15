-- Migration: Import Prompts from Notion Database
-- Template file - populate with actual data from Notion
-- 
-- To populate this file:
-- 1. Run: pnpm migrate:notion (once database is shared)
-- 2. Or manually copy data from Notion and format as INSERT statements
--
-- Expected columns in prompts table:
--   - id (UUID)
--   - name (slug)
--   - display_name (text)
--   - description (text)
--   - domain (text)
--   - system_prompt (text)
--   - user_prompt_template (text)
--   - category (text)
--   - complexity_level (text)
--   - status (text: 'active' or 'inactive')
--   - version (text)
--   - metadata (jsonb)
--   - created_at (timestamptz)
--   - updated_at (timestamptz)

BEGIN;

-- Example INSERT statement structure:
-- INSERT INTO prompts (
--   id,
--   name,
--   display_name,
--   description,
--   domain,
--   system_prompt,
--   user_prompt_template,
--   category,
--   complexity_level,
--   status,
--   version,
--   metadata,
--   created_at,
--   updated_at
-- ) VALUES
--   (
--     '00000000-0000-0000-0000-000000000001',
--     'example_prompt',
--     'Example Prompt',
--     'An example prompt description',
--     'medical_affairs',
--     'This is the system prompt text...',
--     'This is the user prompt template...',
--     'general',
--     'intermediate',
--     'active',
--     '1.0.0',
--     '{"notion_id": "...", "suite": "...", "sub_suite": "..."}'::jsonb,
--     NOW(),
--     NOW()
--   );

-- TODO: Add INSERT statements here
-- Use the generate-notion-migration.ts script to auto-generate these

COMMIT;

