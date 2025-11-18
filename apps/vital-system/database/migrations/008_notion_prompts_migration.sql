-- Migration: Import Prompts from Notion Database
-- Source: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6
-- Database ID: 282345b0-299e-8034-bb48-c2f26d5faac6
-- Generated: 2025-01-29
-- 
-- STATUS: Database is accessible, but appears empty or entries not yet shared
-- 
-- To populate this migration:
-- 1. Ensure your Notion database has entries
-- 2. Share the database entries with "VITAL Expert Sync" integration
-- 3. Run: pnpm migrate:notion
-- 
-- OR manually add INSERT statements below

BEGIN;

-- TODO: Add INSERT statements here once database entries are accessible
-- Template for each prompt:
/*
INSERT INTO prompts (
  id,
  name,
  display_name,
  description,
  domain,
  system_prompt,
  user_prompt_template,
  category,
  complexity_level,
  status,
  version,
  metadata,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'prompt_slug',
  'Prompt Name',
  'Suite - Sub Suite',
  'medical_affairs',
  'Prompt content here...',
  'Prompt template here...',
  'category',
  'complexity',
  'active',
  '1.0.0',
  '{"notion_id": "...", "suite": "...", "sub_suite": "..."}'::jsonb,
  NOW(),
  NOW()
);
*/

-- Migration ready but waiting for database entries to be accessible

COMMIT;
