# Quick Setup: Notion → Supabase Prompts Sync

## ✅ What's Already Configured

- ✅ Sync script created at `scripts/sync-notion-prompts-to-supabase.ts`
- ✅ NPM command added: `pnpm sync:notion`
- ✅ Reads from `.env.local` in project root
- ✅ Supabase credentials already configured in `.env.local`

## 🚀 One-Time Setup Steps

### 1. Add Notion Integration Token

Add this to your `.env.local` file:

```bash
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxx
```

To get your token:
1. Visit https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "VITAL Prompts Sync"
4. Copy the integration token
5. Add it to `.env.local`

### 2. Share Notion Database with Integration

1. Open your Notion Prompts database: https://www.notion.so/282345b0299e8034bb48c2f26d5faac6
2. Click the "..." menu in the top right
3. Select "Add connections"
4. Search for "VITAL Prompts Sync"
5. Click "Confirm"

## 🎯 Run the Sync

```bash
cd apps/digital-health-startup
pnpm sync:notion
```

## 📊 Expected Output

```
🚀 Starting Notion to Supabase sync...
📋 Reading environment from .env.local
✅ Environment variables validated
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

## 🔄 Field Mapping

| Notion | Supabase |
|--------|----------|
| Name | name & display_name |
| Detailed_Prompt | system_prompt & user_prompt_template |
| Category | category |
| Complexity_Level | complexity_level |
| Is_Active | status (active/inactive) |
| Everything else | metadata JSON |

## 📝 What Gets Synced

- **Creates** new prompts if they don't exist (based on Notion ID)
- **Updates** existing prompts if they already exist
- **Preserves** all Notion metadata in the `metadata` JSON field
- **Idempotent** - safe to run multiple times

## 🛠️ Troubleshooting

### Missing NOTION_TOKEN
```bash
# Add to .env.local
NOTION_TOKEN=secret_xxxxx
```

### Database not accessible
- Check the integration has access to the database
- Verify database URL is correct

### Supabase connection failed
- Check `.env.local` has correct credentials
- Verify Supabase project is active

## 📚 Full Documentation

See `README-NOTION-SYNC.md` for complete documentation.

