# Notion to Supabase Prompts Sync

This script syncs your Notion Prompts database to your Supabase `prompts` table, enabling you to manage prompts in Notion and keep them synchronized with your application database.

## Overview

The sync script:
- Connects to your Notion database using MCP
- Fetches all prompts from the Prompts database
- Maps Notion fields to Supabase schema
- Creates new prompts or updates existing ones based on Notion ID
- Preserves metadata in a JSON field for additional information

## Field Mapping

| Notion Field | Supabase Field | Notes |
|-------------|----------------|-------|
| `Name` | `name` & `display_name` | Display name is title, name is slugified |
| `Detailed_Prompt` | `system_prompt` & `user_prompt_template` | Main prompt content |
| `Category` | `category` | First category value used |
| `Complexity_Level` | `complexity_level` | Maps directly |
| `Is_Active` | `status` | Maps to 'active'/'inactive' |
| `Suite` | `metadata` | Stored in JSON metadata |
| `Sub_Suite` | `metadata` | Stored in JSON metadata |
| `Focus_Areas` | `metadata` | Array in JSON metadata |
| `Business_Functions` | `metadata` | Array in JSON metadata |
| `Departments` | `metadata` | Array in JSON metadata |
| `Business_Roles` | `metadata` | Array in JSON metadata |
| `Prompt_Starters` | `metadata` | Array in JSON metadata |
| `Version` | `version` | Maps directly |
| All others | `metadata` | Preserved in metadata JSON |

## Setup

### 1. Environment Variables

Ensure you have these environment variables set in `.env.local`:

```bash
# Notion Integration Token (add this if not present)
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxx

# Supabase Configuration (already in your .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xazinxsiglqokwfmogyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note**: Your Supabase configuration is already set up. You only need to add the `NOTION_TOKEN`.

### 2. Get Notion Integration Token

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "VITAL Prompts Sync")
4. Select the Prompts database
5. Copy the integration token

### 3. Share Notion Database with Integration

1. Open your Notion Prompts database
2. Click the "..." menu in the top right
3. Select "Add connections"
4. Search for your integration name
5. Click "Confirm"

### 4. Get Supabase Service Role Key

1. Go to your Supabase project
2. Settings → API
3. Copy the "service_role" key (keep this secret!)

## Running the Sync

### Basic Usage

```bash
# From the root directory
cd apps/digital-health-startup
pnpm sync:notion
```

Or from the project root:

```bash
pnpm --filter @vital/digital-health-startup sync:notion
```

### Expected Output

```
🚀 Starting Notion to Supabase sync...
📥 Fetching prompts from Notion...
✅ Fetched 150 prompts from Notion
📤 Syncing to Supabase...
✨ Created: Advisory Board Planning
🔄 Updated: KOL Mapping Strategy
...
📊 Sync Summary:
   Created: 45
   Updated: 105
   Skipped: 0
   Errors: 0
✅ Sync completed successfully!
```

## How It Works

1. **Fetch Phase**: Queries Notion database for all prompts
2. **Mapping Phase**: Converts Notion properties to Supabase schema
3. **Check Phase**: Looks up existing prompts by Notion ID in metadata
4. **Sync Phase**:
   - **Create**: If no existing prompt with the Notion ID
   - **Update**: If prompt exists (updates all fields)
5. **Metadata Preservation**: All Notion-specific fields stored in metadata JSON

## Troubleshooting

### "NOTION_TOKEN is not set"
- Check your `.env.local` file
- Ensure you've added the environment variable
- Restart your terminal/shell

### "Database not found"
- Check database ID matches: `282345b0-299e-8165-833e-000bf89bbd84`
- Ensure integration has access to the database
- Verify database is shared with integration

### "Supabase authentication failed"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure service role key (not anon key)
- Check Supabase project is active

### "No prompts found"
- Verify database URL is correct
- Check database has entries
- Ensure properties match expected names

## Customization

### Modify Field Mapping

Edit `mapNotionToSupabase()` function in `sync-notion-prompts-to-supabase.ts`:

```typescript
function mapNotionToSupabase(notionPrompt: NotionPrompt) {
  return {
    // Change domain mapping
    domain: getDomainFromSuite(notionPrompt.suite),
    
    // Add custom logic
    description: customDescription(notionPrompt),
    
    // ... etc
  };
}
```

### Add Additional Metadata

Add to metadata object in mapping:

```typescript
metadata: {
  notion_id: notionPrompt.id,
  suite: notionPrompt.suite,
  // Add custom fields
  custom_field: customValue,
  // ... etc
}
```

### Filter Prompts

Add filtering in `fetchNotionPrompts()`:

```typescript
const response = await notion.databases.query({
  database_id: NOTION_DATABASE_ID,
  page_size: 100,
  filter: {
    property: 'Is_Active',
    checkbox: { equals: true },
  },
});
```

## Advanced: Scheduling

### Via Cron (Linux/Mac)

Add to crontab:

```bash
# Sync every day at 2 AM
0 2 * * * cd /path/to/project/apps/digital-health-startup && pnpm sync:notion
```

### Via GitHub Actions

Create `.github/workflows/sync-notion.yml`:

```yaml
name: Sync Notion Prompts
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm sync:notion
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Data Integrity

- **Idempotent**: Running multiple times is safe
- **Updates**: Existing prompts are updated, not duplicated
- **Notion ID**: Used to identify records across systems
- **Metadata**: All Notion data preserved in metadata JSON
- **Timestamps**: Created and updated timestamps maintained

## Best Practices

1. **Test First**: Run on a development database first
2. **Backup**: Backup Supabase before first sync
3. **Monitor**: Check sync summary for errors
4. **Iterate**: Adjust field mapping as needed
5. **Version Control**: Keep sync script in version control
6. **Document**: Update this README with customizations

## Security Notes

⚠️ **Important**:
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access
- Keep `NOTION_TOKEN` secret - it has access to your Notion data
- Never commit `.env.local` to version control
- Use environment-specific keys for staging/production

## Support

For issues or questions:
1. Check this README
2. Check sync script output for errors
3. Verify environment variables
4. Check Notion and Supabase permissions

