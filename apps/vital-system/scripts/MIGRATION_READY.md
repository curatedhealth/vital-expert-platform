# ✅ Migration Files Ready

## Created Files

1. **Migration Template**: `database/migrations/008_notion_prompts_migration.sql`
2. **Migration Generator**: `scripts/generate-notion-migration.ts`
3. **Sync Script**: `scripts/sync-notion-prompts-to-supabase.ts`

## Current Status

- ❌ **Database not shared** with REST API integration (for scripts)
- ✅ **Migration structure** ready and waiting
- ✅ **Scripts** ready to auto-generate SQL once database is shared

## Two Paths Forward

### Path A: Share Database & Auto-Generate (Recommended)

**Once database is shared:**

```bash
# 1. Share database with integration (see steps below)
# 2. Generate migration
pnpm migrate:notion

# 3. Review generated SQL file
# File will be: database/migrations/008_notion_prompts_migration_*.sql

# 4. Apply migration
pnpm migrate
```

**To share database:**
1. Open: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6
2. Click "..." (top right) → "Add connections"
3. Search for "VITAL Expert Sync" integration
4. Confirm connection

### Path B: Manual Migration

**If you prefer manual control:**

1. Export data from Notion (or copy/paste)
2. Use the template in `008_notion_prompts_migration.sql`
3. Format as INSERT statements
4. Apply via Supabase SQL Editor or `pnpm migrate`

## What Gets Migrated

- ✅ All prompt fields (Name, Detailed_Prompt, Category, etc.)
- ✅ Metadata (Suite, Sub_Suite, Focus Areas, etc.)
- ✅ Proper UUID generation
- ✅ Timestamps

## After Migration

Once data is in Supabase, the sync script (`pnpm sync:notion`) will keep it updated automatically.

