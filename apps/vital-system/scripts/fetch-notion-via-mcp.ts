/**
 * Attempt to fetch Notion database via MCP or direct API
 */

import dotenv from 'dotenv';
import path from 'path';

const projectRoot = path.resolve(process.cwd(), '../..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const DATABASE_ID = '282345b0-299e-8034-bb48-c2f26d5faac6'; // From URL

async function fetchViaMCP() {
  console.log('🔍 Attempting to fetch Notion database via available methods...\n');
  console.log(`📊 Database ID: ${DATABASE_ID}\n`);
  
  // Since I don't have direct MCP tool access in this script context,
  // let's create a migration file based on the schema we know from earlier
  
  console.log('📝 Creating migration file based on database schema...\n');
  
  // We know the schema from the earlier fetch attempt
  // Let's generate a template that can be populated
  
  const migrationSQL = `-- Migration: Import Prompts from Notion Database (282345b0-299e-8034-bb48-c2f26d5faac6)
-- Generated: ${new Date().toISOString()}
-- 
-- This migration imports prompts from your Notion "Prompts" database.
-- 
-- To populate this file:
-- Option 1: Share database with integration and run: pnpm migrate:notion
-- Option 2: Export data from Notion manually and format as INSERT statements below
-- Option 3: Use Notion API directly once database is shared

BEGIN;

-- Template structure - replace with actual data from Notion
-- Each prompt should be formatted like this:

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
  'prompt_slug', -- slugified name
  'Prompt Display Name', -- from Notion "Name" field
  'Suite - Sub Suite', -- from Suite + Sub_Suite
  'medical_affairs', -- default domain
  'Detailed prompt text here...', -- from "Detailed_Prompt" field
  'Detailed prompt text here...', -- same as system_prompt
  'general', -- from "Category" field (first value)
  'intermediate', -- from "Complexity_Level" field (lowercase)
  'active', -- from "Is_Active" checkbox (true → 'active', false → 'inactive')
  '1.0.0', -- from "Version" field
  jsonb_build_object(
    'notion_id', 'notion-page-id-here',
    'suite', 'Suite name',
    'sub_suite', 'Sub Suite name',
    'focus_areas', ARRAY['area1', 'area2']::text[],
    'business_functions', ARRAY['func1']::text[],
    'departments', ARRAY['dept1']::text[],
    'business_roles', ARRAY['role1']::text[],
    'prompt_starters', ARRAY['starter1']::text[],
    'synced_at', NOW()
  ),
  NOW(),
  NOW()
);

-- TODO: Add all your prompts here
-- You can export them from Notion and format using the template above
-- Or run pnpm migrate:notion once the database is shared

COMMIT;
`;

  const migrationPath = path.join(
    projectRoot,
    'apps/digital-health-startup/database/migrations',
    `008_notion_prompts_migration_${Date.now()}.sql`
  );

  require('fs').writeFileSync(migrationPath, migrationSQL);
  
  console.log(`✅ Migration template created: ${migrationPath}\n`);
  console.log('📋 Next steps:');
  console.log('   1. Share your Notion database with the integration');
  console.log('   2. Run: pnpm migrate:notion');
  console.log('   3. Or manually populate the SQL file with your data');
  console.log('   4. Apply: pnpm migrate\n');
}

fetchViaMCP().catch(console.error);

