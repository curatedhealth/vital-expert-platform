# Complete Notion Setup Instructions

## Step 1: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name it: "VITAL Path Sync"
4. Select your workspace
5. Set capabilities:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
6. Click "Submit"
7. **Copy the Internal Integration Token** (starts with `secret_`)
8. Save it as: `NOTION_API_KEY` in your `.env.local`

## Step 2: Create Databases in Notion

### Database 1: Agents Registry

1. Open Notion
2. Create a new page in your workspace
3. Type `/database` and select "Table - Inline"
4. Name it: **"VITAL Path - Agents Registry"**
5. Follow the schema in `agents-database-schema.md`
6. Add all 30 properties listed
7. Click "..." → "Add connections" → Select "VITAL Path Sync"
8. Copy the database URL
9. Extract the database ID (between the last `/` and the `?`)
   - URL: `https://notion.so/workspace/DATABASE_ID?v=...`
10. Save as: `NOTION_AGENTS_DATABASE_ID` in `.env.local`

### Database 2: Capabilities Registry

1. Create another new page
2. Type `/database` and select "Table - Inline"
3. Name it: **"VITAL Path - Capabilities Registry"**
4. Follow the schema in `capabilities-database-schema.md`
5. Add all 28 properties listed
6. Link to Agents database via Relations
7. Click "..." → "Add connections" → Select "VITAL Path Sync"
8. Copy the database URL
9. Extract the database ID
10. Save as: `NOTION_CAPABILITIES_DATABASE_ID` in `.env.local`

## Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Notion Integration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_AGENTS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CAPABILITIES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Sync Options
NOTION_SYNC_DIRECTION=both  # notion_to_supabase, supabase_to_notion, or both
NOTION_SYNC_INTERVAL=3600   # seconds (3600 = 1 hour)
NOTION_AUTO_SYNC=false      # true to enable automatic syncing
```

## Step 4: Install Dependencies

```bash
npm install @notionhq/client
```

## Step 5: Test Connection

```bash
# Test Notion connection
node scripts/test-notion-connection.js

# Test sync (dry run)
node scripts/sync-notion-to-supabase.js --dry-run

# Run actual sync
node scripts/sync-notion-to-supabase.js
```

## Step 6: Two-Way Sync Setup

Choose your sync strategy:

### Option A: Manual Sync
```bash
# Notion → Supabase
node scripts/sync-notion-to-supabase.js

# Supabase → Notion
node scripts/sync-supabase-to-notion.js
```

### Option B: Scheduled Sync
```bash
# Setup cron job (runs hourly)
crontab -e

# Add this line:
0 * * * * cd /path/to/project && node scripts/sync-notion-to-supabase.js >> logs/notion-sync.log 2>&1
```

### Option C: Real-time Sync (Webhooks)
Use Notion webhooks (requires paid plan) or polling with MCP server

## Step 7: Verify Setup

1. Add a test agent in Notion
2. Run sync: `node scripts/sync-notion-to-supabase.js`
3. Check Supabase: Visit http://localhost:3001/agents
4. Verify the agent appears

## Troubleshooting

### "Unauthorized" Error
- Check NOTION_API_KEY is correct
- Ensure database is shared with integration

### "Database not found"
- Verify NOTION_DATABASE_ID is correct
- Check database permissions

### "Invalid properties"
- Ensure property names match exactly
- Check property types are correct

## Using MCP Server

Since you have Notion MCP server connected to Claude:

1. I can help you create the databases via Claude
2. Tell me when you're ready and I'll use the MCP server to:
   - Create both databases
   - Set up all properties
   - Configure relations
   - Add sample data

Just say: "Create the Notion databases now" and I'll do it!
