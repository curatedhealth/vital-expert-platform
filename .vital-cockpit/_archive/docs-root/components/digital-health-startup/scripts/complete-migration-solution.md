# Complete Notion → Supabase Migration Solution

## Current Setup ✅

You have:
- ✅ Notion token configured (`NOTION_TOKEN` in `.env.local`)
- ✅ MCP Notion configured (in `.cursor/mcp.json`)
- ✅ Migration scripts ready
- ✅ Supabase credentials configured

## The Challenge

**MCP Notion tools** are configured but not appearing in my current tool context.  
**REST API access** requires the database to be shared with the integration.

## Solutions (Choose One)

### Solution 1: Use MCP Directly (If Available)

If MCP Notion tools become available in Cursor chat:
1. I can fetch the database directly via MCP
2. Generate the migration SQL immediately
3. You apply it to Supabase

**Check**: Try restarting Cursor to refresh MCP connections

### Solution 2: Share Database + Auto-Generate (Recommended)

**Once database is shared:**

1. **Share the database** (one-time):
   - Open: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6
   - Click "..." → "Add connections"
   - Select "VITAL Expert Sync" integration

2. **Generate migration**:
   ```bash
   cd apps/digital-health-startup
   pnpm migrate:notion
   ```

3. **Review & apply**:
   ```bash
   # Review the generated SQL file
   cat database/migrations/008_notion_prompts_migration_*.sql
   
   # Apply it
   pnpm migrate
   ```

### Solution 3: Manual Export (Fallback)

1. Export data from Notion manually
2. Use the template in `008_notion_prompts_migration.sql`
3. Format and apply manually

## Ready-to-Use Scripts

All scripts are ready and waiting:

- `pnpm test:notion` - Test connection
- `pnpm migrate:notion` - Generate migration (needs DB shared)
- `pnpm sync:notion` - Ongoing sync (needs DB shared)
- `pnpm find:databases` - List accessible databases

## Recommendation

**Best approach**: Share the database with the REST API integration, then run:
```bash
pnpm migrate:notion
```

This gives you:
- ✅ Automated migration generation
- ✅ Future sync capabilities
- ✅ CI/CD compatibility

## What Happens After Migration

Once data is in Supabase:
- `pnpm sync:notion` keeps it updated automatically
- Changes in Notion sync to Supabase
- Full field mapping preserved

