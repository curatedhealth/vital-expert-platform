# Complete Notion ↔ Supabase Integration Guide

This guide provides the complete workflow for integrating Notion and Supabase with bidirectional sync.

## 🎯 Complete Integration Flow

```
┌─────────────────┐
│   Supabase DB   │ ← Production database with full schema
└────────┬────────┘
         │
         │ Step 1: Create Notion databases
         ▼
┌─────────────────┐
│  Create Notion  │ ← create_notion_databases_from_supabase.py
│   Databases     │
└────────┬────────┘
         │
         │ Step 2: Populate Notion from Supabase
         ▼
┌─────────────────┐
│  Sync to Notion │ ← sync_bidirectional.py to-notion
│  (Populate)     │
└────────┬────────┘
         │
         │ Step 3: Work in Notion
         ▼
┌─────────────────┐
│  Edit in Notion │ ← Team makes changes
│  (Collaborate)  │
└────────┬────────┘
         │
         │ Step 4: Sync back to Supabase
         ▼
┌─────────────────┐
│ Sync to Supabase│ ← sync_bidirectional.py from-notion
│   (Update DB)   │
└─────────────────┘
```

## 📋 Prerequisites

### 1. Environment Variables

Add to `.env`:

```bash
# Notion Configuration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PARENT_PAGE_ID=your-parent-page-id  # Optional

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 2. Python Dependencies

```bash
pip install python-dotenv requests supabase-py
```

## 🚀 Complete Setup Workflow

### Step 1: Create Notion Databases

First, create all Notion databases matching your Supabase schema:

```bash
python scripts/create_notion_databases_from_supabase.py
```

**What this does:**
- Creates 12 Notion databases
- Sets up all property types (text, select, relations, etc.)
- Configures relationships between databases
- Saves database IDs to `notion_database_ids.json`

**Output:**
```
✓ Created database: 🏢 Organizations
✓ Created database: 🤖 Agents
✓ Created database: 🔄 Workflows
... (10 more databases)

Database IDs saved to notion_database_ids.json
```

### Step 2: Share Databases with Integration

For each created database:

1. Open in Notion
2. Click "..." (top right)
3. "Add connections" → Select "VITAL Supabase Sync"

**Faster method:**
- Select all databases at once in Notion
- Right-click → "Add connections" → Select integration

### Step 3: Populate Notion from Supabase

Now sync data from your Supabase database to Notion:

```bash
python scripts/sync_bidirectional.py to-notion
```

**What this does:**
- Reads data from Supabase tables
- Creates Notion pages for each record
- Maps all properties correctly
- Preserves UUIDs for future syncs

**Output:**
```
=== Syncing Organizations: Supabase → Notion ===
Found 15 organizations in Supabase
✓ Synced organization: Acme Pharma
✓ Synced organization: BioTech Inc
...

=== Syncing Agents: Supabase → Notion ===
Found 42 agents in Supabase
✓ Synced agent: Clinical Evidence Analyst
✓ Synced agent: Regulatory Expert
...

✅ Supabase → Notion sync completed in 23.45s
```

### Step 4: Verify Data in Notion

Check your Notion workspace:

- All databases should have records
- Properties should be populated
- Relations should be linked
- Select options should match

### Step 5: Work in Notion

Now your team can:

- ✅ Edit agent configurations
- ✅ Update workflow definitions
- ✅ Add new capabilities
- ✅ Manage knowledge documents
- ✅ Organize with views and filters
- ✅ Collaborate with comments

### Step 6: Sync Changes Back to Supabase

After making changes in Notion, sync back:

```bash
python scripts/sync_bidirectional.py from-notion
```

**What this does:**
- Reads updated data from Notion
- Updates corresponding Supabase records
- Uses UUIDs to match records
- Preserves all relationships

**Output:**
```
=== Syncing Agents: Notion → Supabase ===
Found 42 agents in Notion
✓ Updated agent: Clinical Evidence Analyst
✓ Updated agent: Regulatory Expert
...

✅ Notion → Supabase sync completed in 18.32s
```

### Step 7: Bidirectional Sync (Optional)

For complete two-way sync:

```bash
python scripts/sync_bidirectional.py both
```

This runs both directions sequentially.

## 🔄 Ongoing Workflow

### Daily Operations

```bash
# Morning: Sync latest from Supabase to Notion
python scripts/sync_bidirectional.py to-notion

# Work in Notion throughout the day

# Evening: Sync changes back to Supabase
python scripts/sync_bidirectional.py from-notion
```

### Automated Sync (Cron)

Set up automated bidirectional sync:

```bash
# Every 6 hours: Supabase → Notion
0 */6 * * * cd /path/to/VITAL-path && python scripts/sync_bidirectional.py to-notion >> logs/sync-to-notion.log 2>&1

# Every 6 hours (offset by 3): Notion → Supabase
0 3,9,15,21 * * * cd /path/to/VITAL-path && python scripts/sync_bidirectional.py from-notion >> logs/sync-from-notion.log 2>&1
```

## 📊 Sync Direction Reference

### Supabase → Notion (`to-notion`)

**Use when:**
- Initial population of Notion
- Supabase is the source of truth
- Bulk data updates in Supabase
- After running migrations
- Restoring Notion from backup

**Syncs:**
- ✅ Organizations
- ✅ Agents (all properties)
- ✅ Workflows
- ✅ Capabilities
- ✅ Knowledge Domains
- ✅ Knowledge Documents

**Safe to run:** Yes, uses upsert (won't duplicate)

### Notion → Supabase (`from-notion`)

**Use when:**
- Team made changes in Notion
- Notion is the source of truth
- Collaborative editing session complete
- Before deploying to production
- Periodic sync of editorial changes

**Syncs:**
- ✅ Agents (configuration updates)
- ✅ Workflows (process changes)

**Safe to run:** Yes, updates by UUID (won't duplicate)

### Both Directions (`both`)

**Use when:**
- Complete bidirectional sync needed
- Systems are out of sync
- Initial setup complete
- Periodic full sync

**Order:**
1. Supabase → Notion (populate/update)
2. Notion → Supabase (sync changes)

## 🔍 Data Mapping Examples

### Agent Sync

**Supabase → Notion:**
```
Supabase: agents table
  name: "clinical_expert"
  display_name: "Clinical Evidence Analyst"
  temperature: 0.7
  ↓
Notion: Agents database
  Name: "clinical_expert"
  Display Name: "Clinical Evidence Analyst"
  Temperature: 0.7
```

**Notion → Supabase:**
```
Notion: Agents database
  Name: "clinical_expert" [edited]
  Display Name: "Clinical Expert Pro"
  Temperature: 0.8
  ↓
Supabase: agents table
  name: "clinical_expert"
  display_name: "Clinical Expert Pro"
  temperature: 0.8
  updated_at: NOW()
```

### Workflow Sync

**Supabase → Notion:**
```
Supabase: workflows table
  name: "Drug Development"
  definition: {"steps": [...]}
  status: "active"
  ↓
Notion: Workflows database
  Name: "Drug Development"
  Definition: "{\"steps\": [...]}"
  Status: "Active"
```

## ⚙️ Configuration

### Customizing Sync Behavior

Edit `sync_bidirectional.py` to customize:

#### 1. Add More Tables

```python
def sync_custom_table_to_notion(self):
    """Sync custom table"""
    result = self.supabase.table('your_table').select('*').execute()
    # ... conversion logic
```

#### 2. Filter Data

```python
# Only sync active agents
result = self.supabase.table('agents')\
    .select('*')\
    .eq('status', 'active')\
    .execute()
```

#### 3. Transform Data

```python
def _convert_agent_to_notion(self, agent):
    # Custom transformation
    notion_data = {...}
    
    # Add computed fields
    notion_data['Full Name'] = {
        'rich_text': [{
            'text': {'content': f"{agent['display_name']} ({agent['tier']})"}
        }]
    }
    
    return notion_data
```

## 🐛 Troubleshooting

### "notion_database_ids.json not found"

**Cause:** Databases haven't been created yet

**Solution:**
```bash
python scripts/create_notion_databases_from_supabase.py
```

### "Unauthorized" Error

**Cause:** Databases not shared with integration

**Solution:**
1. Open each database in Notion
2. "..." → "Add connections" → Select integration

### Duplicate Records

**Cause:** Supabase ID not being tracked

**Solution:**
- Add "Supabase ID" property to databases manually
- Re-run sync (will use UUID matching)

### Data Not Updating

**Cause:** Wrong sync direction

**Solution:**
- Use `to-notion` to populate Notion
- Use `from-notion` to update Supabase
- Check logs for errors

### Relations Not Syncing

**Cause:** Related databases must be synced first

**Solution:**
- Sync in order: Organizations → Domains → Agents → Workflows
- Relations sync automatically on subsequent runs

## 📈 Best Practices

### 1. Initial Setup

```bash
# Day 1: Create structure
python scripts/create_notion_databases_from_supabase.py

# Day 1: Populate data
python scripts/sync_bidirectional.py to-notion

# Verify in Notion before proceeding
```

### 2. Daily Operations

```bash
# Morning: Get latest from Supabase
python scripts/sync_bidirectional.py to-notion

# Throughout day: Work in Notion

# Evening: Push changes to Supabase
python scripts/sync_bidirectional.py from-notion
```

### 3. Team Workflow

```
Monday AM: Tech lead syncs Supabase → Notion
Mon-Fri: Team collaborates in Notion
Friday PM: Tech lead syncs Notion → Supabase
Weekend: Automated processes run on Supabase
```

### 4. Conflict Resolution

**If changes in both systems:**

```bash
# Option 1: Supabase wins
python scripts/sync_bidirectional.py to-notion

# Option 2: Notion wins
python scripts/sync_bidirectional.py from-notion

# Option 3: Manual merge (recommended)
# 1. Export both
# 2. Manually merge
# 3. Import merged data
```

## 🔒 Security Considerations

1. **API Keys:** Never commit `.env` file
2. **Service Key:** Use with caution (full database access)
3. **Notion Integration:** Limit to needed databases only
4. **Sync Logs:** May contain sensitive data
5. **Backup:** Before first sync, backup both systems

## 📊 Monitoring

### Check Sync Status

```bash
# Check last sync
ls -lth logs/sync-*.log | head -5

# View recent sync logs
tail -f logs/sync-to-notion.log

# Count records synced
grep "✓ Synced" logs/sync-to-notion.log | wc -l
```

### Verify Data Consistency

```sql
-- In Supabase: Check agent count
SELECT COUNT(*) FROM agents WHERE status = 'active';

-- Compare with Notion database page count
```

## 🎓 Advanced Usage

### Selective Sync

```bash
# Edit sync_bidirectional.py, comment out unwanted tables:

def sync_supabase_to_notion(self):
    # self.sync_organizations_to_notion()  # Skip
    self.sync_agents_to_notion()  # Include
    self.sync_workflows_to_notion()  # Include
```

### Custom Transformations

```python
# Add business logic during sync
def _convert_agent_to_notion(self, agent):
    notion_data = {...}
    
    # Custom: Compute tier from other fields
    if agent.get('premium_features'):
        notion_data['Tier'] = {'select': {'name': 'Tier 1'}}
    
    return notion_data
```

### Webhooks (Future)

Set up Notion webhooks to trigger instant sync on changes (requires webhook setup).

## 📞 Support

For issues:
1. Check logs in console/files
2. Verify database IDs in `notion_database_ids.json`
3. Ensure all databases shared with integration
4. Test with single table first

---

**Last Updated:** January 8, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

