# 🚀 Get Started in 5 Minutes

Complete setup guide for Notion ↔ Supabase Integration

## Prerequisites

- ✅ Python 3.8+ installed
- ✅ Notion account with workspace
- ✅ Supabase account with project
- ✅ 5 minutes of your time

## Step-by-Step Setup

### Step 1: Create Notion Integration (2 minutes)

1. **Go to Notion Integrations:**
   ```
   https://www.notion.so/my-integrations
   ```

2. **Click "+ New integration"**

3. **Fill in details:**
   - Name: `VITAL Supabase Sync`
   - Associated workspace: Select your workspace
   - Type: Internal integration

4. **Click "Submit"**

5. **Copy the Integration Token**
   - Starts with `secret_`
   - Keep this safe - you'll need it next

### Step 2: Get Supabase Credentials (1 minute)

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/_/settings/api
   ```

2. **Copy these values:**
   - **URL:** `https://xxxxx.supabase.co`
   - **Service Role Key:** `eyJhbGc...` (the longer one)

⚠️ **Use Service Role Key** for full database access (required for sync)

### Step 3: Configure Environment (1 minute)

1. **Edit `.env` file** in your project root:

   ```bash
   # Required
   NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJI...your-key-here
   
   # Optional
   NOTION_PARENT_PAGE_ID=  # To organize databases under a page
   ```

2. **Save the file**

### Step 4: Run Setup Script (1 minute)

```bash
./scripts/setup_integration.sh
```

This will:
- ✅ Check Python installation
- ✅ Install required packages
- ✅ Test Notion connection
- ✅ Test Supabase connection
- ✅ Verify everything is working

**Expected output:**
```
✅ Connected to Notion!
✅ Connected to Supabase!
✅ ALL TESTS PASSED!
```

### Step 5: Create Notion Databases (30 seconds)

```bash
python3 scripts/create_notion_databases_from_supabase.py
```

This creates 12 databases in your Notion workspace:
- 🏢 Organizations
- 🤖 Agents
- 🔄 Workflows
- ⚡ Capabilities
- 🛠️ Tools
- 📝 Prompts
- 🎯 Use Cases
- 👤 Personas
- 📚 Knowledge Domains
- 📄 Knowledge Documents
- 🔌 LLM Providers
- 🧠 LLM Models
- 💬 Chat Sessions

### Step 6: Share Databases (30 seconds)

**In Notion:**

1. Open your workspace
2. You'll see the new databases
3. For each database:
   - Open it
   - Click "..." (top right)
   - Click "Add connections"
   - Select "VITAL Supabase Sync"

**Pro tip:** Select all databases at once, right-click → "Add connections"

### Step 7: Initial Sync (30 seconds)

```bash
python3 scripts/sync_bidirectional.py to-notion
```

This populates Notion with data from your Supabase database.

**Expected output:**
```
=== Syncing Organizations ===
✓ Synced organization: Acme Corp
✓ Synced organization: BioTech Inc
...

=== Syncing Agents ===
✓ Synced agent: Clinical Expert
✓ Synced agent: Regulatory Analyst
...

✅ Sync completed in 23.45s
```

## 🎉 You're Done!

Your Notion ↔ Supabase integration is now active!

## What You Can Do Now

### View Data in Notion
Open your Notion workspace and explore the synced databases.

### Edit in Notion
Make changes to agent configurations, workflows, etc.

### Sync Changes Back
```bash
python3 scripts/sync_bidirectional.py from-notion
```

### Automated Daily Sync

**Morning sync (Supabase → Notion):**
```bash
python3 scripts/sync_bidirectional.py to-notion
```

**Evening sync (Notion → Supabase):**
```bash
python3 scripts/sync_bidirectional.py from-notion
```

## Quick Commands Reference

| Command | What It Does |
|---------|-------------|
| `./scripts/setup_integration.sh` | Initial setup & testing |
| `python3 scripts/test_integration_connection.py` | Test connections |
| `python3 scripts/create_notion_databases_from_supabase.py` | Create databases |
| `python3 scripts/sync_bidirectional.py to-notion` | Supabase → Notion |
| `python3 scripts/sync_bidirectional.py from-notion` | Notion → Supabase |
| `python3 scripts/sync_bidirectional.py both` | Both directions |

## Troubleshooting

### "NOTION_TOKEN not found"
→ Edit `.env` and add `NOTION_TOKEN=secret_your_token`

### "SUPABASE_URL not found"
→ Edit `.env` and add `SUPABASE_URL=https://your-project.supabase.co`

### "Unauthorized" when syncing
→ Share databases with integration in Notion (Step 6)

### "No data syncing"
→ Run `to-notion` first to populate Notion

### Python not found
→ Install Python 3.8+ from https://python.org

## Next Steps

1. ✅ **Read Quick Reference:**
   ```bash
   cat QUICK_REFERENCE.md
   ```

2. ✅ **Explore Documentation:**
   - `INTEGRATION_COMPLETE.md` - Full overview
   - `COMPLETE_NOTION_SUPABASE_INTEGRATION.md` - Detailed guide
   - `NOTION_DATABASE_CREATION_GUIDE.md` - Database info

3. ✅ **Set Up Automation:**
   Add to crontab for automatic syncing:
   ```bash
   # Every 6 hours: Supabase → Notion
   0 */6 * * * cd /path/to/VITAL-path && python3 scripts/sync_bidirectional.py to-notion
   
   # Every 6 hours (offset): Notion → Supabase
   0 3,9,15,21 * * * cd /path/to/VITAL-path && python3 scripts/sync_bidirectional.py from-notion
   ```

4. ✅ **Train Your Team:**
   - Show them the Notion databases
   - Explain the sync workflow
   - Set editing guidelines

## Support

Need help? Check:
- 📖 `QUICK_REFERENCE.md` - Command reference
- 📚 `INTEGRATION_COMPLETE.md` - Complete guide
- 🐛 Error logs in console output
- ⚙️ `.env` file configuration

## Success Checklist

After setup, you should have:

- ✅ Notion integration created
- ✅ Environment variables configured
- ✅ Connection tests passing
- ✅ 12 databases created in Notion
- ✅ Databases shared with integration
- ✅ Initial sync completed
- ✅ Data visible in Notion

**If all boxes are checked, you're ready to go!** 🚀

---

**Estimated Total Time:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** Production Ready ✅

