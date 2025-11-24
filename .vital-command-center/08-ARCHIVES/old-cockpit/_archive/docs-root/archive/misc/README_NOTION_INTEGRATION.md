# VITAL Expert - Notion ↔ Supabase Integration

Complete bidirectional synchronization system between Notion and Supabase for the VITAL Expert platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [Workflow](#workflow)
- [FAQ](#faq)

## Overview

This integration enables your team to use **Notion as a collaborative interface** while keeping **Supabase as your production database**. Changes can flow in both directions with full support for relationships and data types.

### Key Features

- ✅ **12+ Databases** synced automatically
- ✅ **Bidirectional sync** (both directions)
- ✅ **Relationship preservation** (many-to-many, one-to-many)
- ✅ **Type safety** (automatic type conversion)
- ✅ **No duplicates** (UUID-based matching)
- ✅ **Production ready** (error handling, logging, transactions)

## Quick Start

### 1. Setup Environment

```bash
# Copy and edit .env
cp .env.example .env

# Add your credentials:
# NOTION_TOKEN=secret_xxxxx
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_SERVICE_KEY=xxxxx
```

### 2. Create Notion Databases

```bash
python scripts/create_notion_databases_from_supabase.py
```

This creates 12 databases matching your Supabase schema.

### 3. Share with Integration

In Notion:
1. Open each database
2. Click "..." → "Add connections"
3. Select "VITAL Supabase Sync" integration

### 4. Initial Sync

```bash
# Populate Notion from Supabase
python scripts/sync_bidirectional.py to-notion
```

### 5. You're Done! 🎉

Work in Notion, sync changes back:

```bash
python scripts/sync_bidirectional.py from-notion
```

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                 VITAL Expert System                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────┐              ┌──────────────┐    │
│   │  Supabase   │ ◄──────────► │    Notion    │    │
│   │ Production  │  Bidirectional │ Collaborative │    │
│   │  Database   │     Sync      │  Workspace   │    │
│   └─────────────┘              └──────────────┘    │
│          │                             │            │
│          │                             │            │
│   ┌──────▼─────────┐          ┌───────▼──────┐    │
│   │ • AI Engine    │          │ • Team Edit  │    │
│   │ • API Gateway  │          │ • Comments   │    │
│   │ • Workflows    │          │ • Views      │    │
│   │ • Real-time    │          │ • Templates  │    │
│   └────────────────┘          └──────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** | Overview & summary | Start here |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Command reference | Daily use |
| **[COMPLETE_NOTION_SUPABASE_INTEGRATION.md](COMPLETE_NOTION_SUPABASE_INTEGRATION.md)** | Complete workflow | Full understanding |
| **[NOTION_DATABASE_CREATION_GUIDE.md](NOTION_DATABASE_CREATION_GUIDE.md)** | Database setup | Initial setup |
| **[NOTION_SYNC_GUIDE.md](NOTION_SYNC_GUIDE.md)** | Original sync docs | Reference |

## Scripts

### Database Creator

**File:** `scripts/create_notion_databases_from_supabase.py`

Creates Notion databases from Supabase schema.

```bash
python scripts/create_notion_databases_from_supabase.py
```

**Creates:**
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

### Bidirectional Sync

**File:** `scripts/sync_bidirectional.py`

Syncs data between systems.

```bash
# Supabase → Notion (populate/update Notion)
python scripts/sync_bidirectional.py to-notion

# Notion → Supabase (update database)
python scripts/sync_bidirectional.py from-notion

# Both directions
python scripts/sync_bidirectional.py both
```

### Legacy Scripts

- `scripts/sync_notion_to_supabase.py` - Original Notion → Supabase only
- `scripts/notion_sync_quickstart.sh` - Quick setup helper

## Workflow

### Initial Setup (One Time)

```bash
# 1. Create databases
python scripts/create_notion_databases_from_supabase.py

# 2. Share in Notion UI (manual step)

# 3. Initial sync
python scripts/sync_bidirectional.py to-notion
```

### Daily Operations

```bash
# Morning: Latest from Supabase
python scripts/sync_bidirectional.py to-notion

# [Work in Notion all day]

# Evening: Push to Supabase
python scripts/sync_bidirectional.py from-notion
```

### Automated (Cron)

```bash
# Add to crontab
0 */6 * * * cd /path/to/VITAL-path && python scripts/sync_bidirectional.py to-notion
0 3,9,15,21 * * * cd /path/to/VITAL-path && python scripts/sync_bidirectional.py from-notion
```

## Database Mapping

| Supabase Table | Notion Database | Sync |
|----------------|-----------------|------|
| `organizations` | 🏢 Organizations | ↔ |
| `agents` | 🤖 Agents | ↔ |
| `workflows` | 🔄 Workflows | ↔ |
| `agent_capabilities` | ⚡ Capabilities | → |
| `knowledge_domains` | 📚 Knowledge Domains | → |
| `knowledge_documents` | 📄 Knowledge Documents | → |
| `llm_providers` | 🔌 LLM Providers | → |
| `llm_models` | 🧠 LLM Models | → |
| `chat_sessions` | 💬 Chat Sessions | → |

Legend: ↔ = Bidirectional, → = Supabase to Notion only

## Property Type Mapping

| Supabase | Notion | Notes |
|----------|--------|-------|
| TEXT | Rich Text | Max 2000 chars per block |
| INTEGER | Number | Direct mapping |
| DECIMAL | Number | Preserved precision |
| BOOLEAN | Checkbox | Direct mapping |
| TIMESTAMP | Date | ISO-8601 format |
| UUID | Rich Text | For ID storage |
| ENUM | Select | Pre-configured options |
| TEXT[] | Multi-select | Array → multiple selections |
| JSONB | Rich Text | JSON stringified |

## Relationships

### Supported Patterns

```
Many-to-Many: Agents ↔ Capabilities
Many-to-Many: Agents ↔ Workflows  
Many-to-Many: Workflows ↔ Tools
One-to-Many: LLM Providers → Models
One-to-Many: Domains → Documents
Self-Reference: Domains → Parent Domain
```

## FAQ

### When should I sync to Notion?

- After database migrations
- To populate fresh Notion workspace
- When Supabase is source of truth
- For bulk updates from API

### When should I sync from Notion?

- After team collaboration session
- To deploy configuration changes
- When Notion is source of truth
- For editorial/content updates

### What if both systems have changes?

Choose one as source of truth:
```bash
# Supabase wins
python scripts/sync_bidirectional.py to-notion

# Notion wins
python scripts/sync_bidirectional.py from-notion
```

Or manually merge and pick one direction.

### Can I sync specific tables only?

Yes! Edit `sync_bidirectional.py` and comment out unwanted sync calls:

```python
def sync_supabase_to_notion(self):
    # self.sync_organizations_to_notion()  # Skip this
    self.sync_agents_to_notion()  # Include this
    self.sync_workflows_to_notion()  # Include this
```

### How do I handle sync conflicts?

1. **Prevention:** Establish sync schedule (e.g., DB changes in morning, Notion edits during day)
2. **Detection:** Check `updated_at` timestamps
3. **Resolution:** Choose source of truth and sync in that direction

### Is this safe for production?

Yes! The system uses:
- ✅ UUID-based matching (no duplicates)
- ✅ Upsert operations (safe updates)
- ✅ Transaction support
- ✅ Error handling and rollback
- ✅ Comprehensive logging

### How do I backup before sync?

```bash
# Backup Notion
# Export → Settings & Members → Export all workspace content

# Backup Supabase
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Can I customize property mapping?

Yes! Edit conversion functions in `sync_bidirectional.py`:

```python
def _convert_agent_to_notion(self, agent):
    # Customize mapping here
    return {
        'Name': {...},
        'Custom Field': {'rich_text': [...]},
        # ... more fields
    }
```

## Troubleshooting

### "notion_database_ids.json not found"

Run database creator first:
```bash
python scripts/create_notion_databases_from_supabase.py
```

### "Unauthorized" Error

Share databases with integration in Notion:
1. Open database → "..." → "Add connections"

### No data syncing

Check sync direction:
```bash
# To populate Notion
python scripts/sync_bidirectional.py to-notion

# To update Supabase
python scripts/sync_bidirectional.py from-notion
```

### Duplicate records

Ensure "Supabase ID" property exists in all databases. Delete duplicates manually, then re-sync.

### Relations not working

Sync parent tables before child tables. Order matters:
1. Organizations
2. Domains
3. Agents
4. Capabilities
5. Workflows

## Support

- 📖 Check documentation in this README
- 📋 Review [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- 📚 Read [COMPLETE_NOTION_SUPABASE_INTEGRATION.md](COMPLETE_NOTION_SUPABASE_INTEGRATION.md)
- 🔍 Check logs in `logs/` directory
- ⚙️ Verify `.env` configuration

## Contributing

To add new tables to sync:

1. Add database creation in `create_notion_databases_from_supabase.py`
2. Add sync methods in `sync_bidirectional.py`
3. Add conversion functions for both directions
4. Test thoroughly before production

## License

Proprietary - VITAL Expert System

## Version

- **Version:** 1.0.0
- **Last Updated:** January 8, 2025
- **Status:** ✅ Production Ready

---

**Ready to sync!** 🚀

Start with:
```bash
python scripts/create_notion_databases_from_supabase.py
```

