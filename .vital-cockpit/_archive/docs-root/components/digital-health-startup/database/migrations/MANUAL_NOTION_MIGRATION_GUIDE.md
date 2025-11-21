# Manual Notion to Supabase Migration Guide

Since the database isn't shared with the REST API integration yet, here's how to manually migrate the data.

## Option 1: Share Database and Auto-Generate

**Quickest method once database is shared:**

```bash
# 1. Share the database with your integration
# 2. Run the migration generator
pnpm migrate:notion

# This will create: database/migrations/008_notion_prompts_migration_*.sql
# Then run:
pnpm migrate
```

## Option 2: Export via Notion API (Manual)

### Steps:

1. **Share the database** with your integration at:
   - https://www.notion.so/282345b0299e8034bb48c2f26d5faac6
   - Click "..." → "Add connections" → Select your integration

2. **Run the generator:**
   ```bash
   pnpm migrate:notion
   ```

3. **Review the generated SQL file** in `database/migrations/`

4. **Apply the migration:**
   ```bash
   pnpm migrate
   ```

## Option 3: Manual CSV Import

If you need to import manually:

### 1. Export from Notion

- Open your Prompts database in Notion
- Use Notion's export feature (if available)
- Or copy data manually into a CSV/JSON format

### 2. Format for Supabase

Required columns mapping:

| Notion Field | Supabase Column | Notes |
|-------------|----------------|-------|
| Name | `display_name` | Also used for `name` (slugified) |
| Detailed_Prompt | `system_prompt` | Also used for `user_prompt_template` |
| Category | `category` | Use first value if multi-select |
| Complexity_Level | `complexity_level` | Lowercase |
| Is_Active | `status` | true → 'active', false → 'inactive' |
| Suite | `metadata->suite` | In JSON metadata |
| Sub_Suite | `metadata->sub_suite` | In JSON metadata |
| All other fields | `metadata` | Stored as JSON |

### 3. Generate SQL

Use this template for each prompt:

```sql
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
  gen_random_uuid(), -- Generate UUID
  'prompt_slug_here', -- Slugified name
  'Prompt Display Name', -- Original name
  'Suite - Sub Suite', -- Description
  'medical_affairs', -- Domain
  'System prompt text...', -- Detailed_Prompt from Notion
  'User prompt template...', -- Same as system_prompt
  'general', -- Category
  'intermediate', -- Complexity level
  'active', -- Status
  '1.0.0', -- Version
  '{
    "notion_id": "...",
    "suite": "...",
    "sub_suite": "...",
    "focus_areas": [...],
    "business_functions": [...]
  }'::jsonb,
  NOW(),
  NOW()
);
```

## Option 4: Use Supabase Import Tool

### Via Supabase Dashboard:

1. Go to your Supabase project → SQL Editor
2. Export data from Notion manually (copy/paste)
3. Format as INSERT statements (see template above)
4. Run the SQL in Supabase SQL Editor

### Via CSV Import:

1. Export Notion data to CSV
2. Use Supabase Table Editor → Import Data
3. Map columns appropriately

## Quick SQL Template Generator

For each prompt row in Notion, use this pattern:

```sql
INSERT INTO prompts (id, name, display_name, description, domain, system_prompt, user_prompt_template, category, complexity_level, status, version, metadata, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  lower(replace('{{NAME}}', ' ', '_')),  -- Replace {{NAME}} with actual name
  '{{NAME}}',
  '{{SUITE}} - {{SUB_SUITE}}',
  'medical_affairs',
  '{{DETAILED_PROMPT}}',  -- Escape single quotes: ' -> ''
  '{{DETAILED_PROMPT}}',
  '{{CATEGORY}}',
  lower('{{COMPLEXITY}}'),
  CASE WHEN {{IS_ACTIVE}} THEN 'active' ELSE 'inactive' END,
  '{{VERSION}}',
  jsonb_build_object(
    'notion_id', '{{NOTION_ID}}',
    'suite', '{{SUITE}}',
    'sub_suite', '{{SUB_SUITE}}',
    'focus_areas', '{{FOCUS_AREAS}}'::jsonb,
    'business_functions', '{{BUSINESS_FUNCTIONS}}'::jsonb,
    'synced_at', NOW()
  ),
  NOW(),
  NOW()
);
```

## Recommended Approach

**Best**: Share the database → Run `pnpm migrate:notion` → Review → Apply

**Fallback**: Manual export → Format as SQL → Apply via Supabase SQL Editor

## Next Steps After Migration

1. Verify data: Check a few prompts in Supabase
2. Update sync script: Once database is shared, `pnpm sync:notion` will keep it updated
3. Test queries: Ensure prompts are queryable in your app

