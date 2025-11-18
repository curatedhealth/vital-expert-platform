# Notion ↔ Supabase Quick Reference Card

## 🚀 Quick Start (3 Steps)

```bash
# Step 1: Create Notion databases from Supabase schema
python scripts/create_notion_databases_from_supabase.py

# Step 2: Share all databases with your Notion integration

# Step 3: Populate Notion from Supabase
python scripts/sync_bidirectional.py to-notion
```

## 📝 Command Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `create_notion_databases_from_supabase.py` | Create Notion DB structure | First time only |
| `sync_bidirectional.py to-notion` | Supabase → Notion | Populate/update Notion |
| `sync_bidirectional.py from-notion` | Notion → Supabase | Update DB from Notion |
| `sync_bidirectional.py both` | Both directions | Full bidirectional sync |

## 🔄 Sync Directions

### Supabase → Notion (Populate)
```bash
python scripts/sync_bidirectional.py to-notion
```
- Reads from Supabase database
- Creates/updates Notion pages
- Safe to run anytime (upsert logic)

### Notion → Supabase (Update)
```bash
python scripts/sync_bidirectional.py from-notion
```
- Reads from Notion databases
- Updates Supabase records
- Uses UUID matching (no duplicates)

## 📊 Databases Synced

| Database | Supabase Table | Notion DB |
|----------|----------------|-----------|
| Organizations | `organizations` | 🏢 Organizations |
| Agents | `agents` | 🤖 Agents |
| Workflows | `workflows` | 🔄 Workflows |
| Capabilities | `agent_capabilities` | ⚡ Capabilities |
| Tools | - | 🛠️ Tools |
| Prompts | - | 📝 Prompts |
| Knowledge Domains | `knowledge_domains` | 📚 Knowledge Domains |
| Knowledge Docs | `knowledge_documents` | 📄 Knowledge Documents |
| LLM Providers | `llm_providers` | 🔌 LLM Providers |
| LLM Models | `llm_models` | 🧠 LLM Models |
| Chat Sessions | `chat_sessions` | 💬 Chat Sessions |
| Use Cases | - | 🎯 Use Cases |
| Personas | - | 👤 Personas |

## ⚙️ Environment Variables

```bash
# Required in .env
NOTION_TOKEN=secret_xxxxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# Optional
NOTION_PARENT_PAGE_ID=xxx  # Organize databases under page
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `notion_database_ids.json` | Database IDs (auto-generated) |
| `.env` | API credentials |
| `logs/sync-*.log` | Sync operation logs |

## 🎯 Common Workflows

### Initial Setup
```bash
# 1. Create structure
python scripts/create_notion_databases_from_supabase.py

# 2. Share with integration (in Notion UI)

# 3. Populate data
python scripts/sync_bidirectional.py to-notion
```

### Daily Work
```bash
# Morning: Sync latest to Notion
python scripts/sync_bidirectional.py to-notion

# Work in Notion all day...

# Evening: Sync changes back
python scripts/sync_bidirectional.py from-notion
```

### Automated (Cron)
```bash
# Every 6 hours to Notion
0 */6 * * * python scripts/sync_bidirectional.py to-notion

# Every 6 hours from Notion (offset 3h)
0 3,9,15,21 * * * python scripts/sync_bidirectional.py from-notion
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "notion_database_ids.json not found" | Run `create_notion_databases_from_supabase.py` first |
| "Unauthorized" error | Share databases with integration in Notion |
| No data in Notion | Run `sync_bidirectional.py to-notion` |
| Changes not in Supabase | Run `sync_bidirectional.py from-notion` |
| Duplicate records | Delete duplicates, ensure "Supabase ID" property exists |

## 📋 Pre-Sync Checklist

- [ ] `.env` file configured with all keys
- [ ] Notion integration created
- [ ] `notion_database_ids.json` exists
- [ ] All databases shared with integration
- [ ] Supabase connection tested

## 🔍 Verify Sync

```bash
# Check sync logs
tail -n 50 logs/sync-to-notion.log

# Count synced records
grep "✓ Synced" logs/sync-to-notion.log | wc -l

# Check for errors
grep "ERROR" logs/*.log
```

## 💡 Pro Tips

1. **First Time:** Always run `to-notion` before `from-notion`
2. **Testing:** Start with one database, verify, then sync all
3. **Backup:** Export Notion workspace before first sync
4. **Conflicts:** Supabase → Notion overwrites, choose carefully
5. **Relations:** Sync parent tables before child tables
6. **Properties:** Add "Supabase ID" manually if missing

## 📞 Quick Help

```bash
# Show help
python scripts/sync_bidirectional.py

# Test Notion connection
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✓ Token:', os.getenv('NOTION_TOKEN')[:20] + '...')"

# Test Supabase connection
python -c "import os; from dotenv import load_dotenv; from supabase import create_client; load_dotenv(); s = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY')); print('✓ Connected:', s.table('agents').select('count').execute())"
```

## 🎨 Data Flow Diagram

```
┌─────────────┐
│  Supabase   │
│    (DB)     │
└──────┬──────┘
       │ to-notion
       ▼
┌─────────────┐
│   Notion    │
│ (Workspace) │
└──────┬──────┘
       │ from-notion
       ▼
┌─────────────┐
│  Supabase   │
│  (Updated)  │
└─────────────┘
```

## 📚 Full Documentation

- **Complete Guide:** `COMPLETE_NOTION_SUPABASE_INTEGRATION.md`
- **Database Creation:** `NOTION_DATABASE_CREATION_GUIDE.md`
- **Notion Sync:** `NOTION_SYNC_GUIDE.md`

---

**Version:** 1.0.0 | **Updated:** 2025-01-08 | **Status:** ✅ Production Ready

