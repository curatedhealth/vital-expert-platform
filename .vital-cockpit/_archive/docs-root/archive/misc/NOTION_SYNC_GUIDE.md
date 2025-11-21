# Notion to Supabase Sync Guide

This guide explains how to sync your Notion databases (Workflows, Agents, Tools, Capabilities, Prompts, etc.) with your Supabase database.

## Overview

The sync script automatically extracts data from your Notion workspace and synchronizes it with your Supabase database, including:

- **Workflows** - Business processes and automation workflows
- **Agents** - AI agents with their configurations
- **AI Agents Registry** - Detailed agent metadata and performance metrics
- **Capabilities** - Agent capabilities and skills
- **Tools** - External tools and integrations
- **Prompts** - AI prompts and templates
- **Organizational Functions** - Business functions and departments
- **Relationships** - All many-to-many relationships between entities

## Prerequisites

### 1. Notion Integration Setup

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Name it "VITAL Expert Sync"
4. Select your workspace
5. Copy the **Internal Integration Token**
6. Share your databases with this integration:
   - Open each database in Notion
   - Click "..." → "Add connections"
   - Select your integration

### 2. Environment Variables

Add these to your `.env` file:

```bash
# Notion Configuration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
# or
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. Database Setup

Run the migration to create the necessary tables:

```bash
# Using Supabase CLI
supabase db push database/migrations/20250108_notion_sync_tables.sql

# Or apply directly via SQL editor in Supabase Dashboard
# Copy contents of database/migrations/20250108_notion_sync_tables.sql
# and run in SQL Editor
```

### 4. Python Dependencies

Install required packages:

```bash
pip install python-dotenv requests supabase
```

## Usage

### Running the Sync

```bash
# Navigate to the project directory
cd /path/to/VITAL-path

# Run the sync script
python scripts/sync_notion_to_supabase.py
```

### What Gets Synced

The script syncs data in this order:

1. **Tools** - External tools and integrations
2. **Capabilities** - Agent capabilities
3. **Prompts** - AI prompts
4. **Agents** - AI agents (main database)
5. **AI Agents Registry** - Detailed agent info
6. **Workflows** - Business workflows
7. **Organizational Functions** - Business functions
8. **Relationships** - All many-to-many connections

### Output Example

```
╔══════════════════════════════════════════════════════════╗
║   VITAL Expert System - Notion to Supabase Sync         ║
║   Syncing: Workflows, Agents, Tools, Capabilities, etc. ║
╚══════════════════════════════════════════════════════════╝

2025-01-08 10:30:00 - INFO - === Syncing Tools ===
2025-01-08 10:30:01 - INFO - Retrieved 15 pages from database
2025-01-08 10:30:02 - INFO - ✓ Synced tool: Web Search API
2025-01-08 10:30:02 - INFO - ✓ Synced tool: Calculator
...

2025-01-08 10:35:00 - INFO - === Syncing Relationships ===
2025-01-08 10:35:01 - INFO - Syncing Workflow-Agent relationships...
2025-01-08 10:35:05 - INFO - ✓ Relationships synced successfully

============================================================
SYNC SUMMARY
============================================================
  Tools: 15 records
  Capabilities: 42 records
  Prompts: 28 records
  Agents: 35 records
  Agents Registry: 35 records
  Workflows: 12 records
  Organizational Functions: 18 records

  Total Records Synced: 185
============================================================

✅ Sync completed successfully!
```

## Notion Database IDs

The script uses these Notion database IDs (extracted from your workspace):

```python
NOTION_DATABASES = {
    'workflows': 'eb7d52fe-9f7b-455d-a4af-f1b31ebbe524',
    'agents': 'e52a9be9-5c0b-49fa-b6cf-d0e222df6cc8',
    'agents_registry': '02a884e7-ad00-4f0c-9b65-d8fec5d827e3',
    'tools': '5413fbf4-7a25-4b4f-910f-e205feffacd2',
    'capabilities': 'a7428410-393d-4761-8cc5-966c46f91f49',
    'prompts': 'e0f04531-0e95-4702-934a-44e66fb99eec',
    # ... more databases
}
```

## Data Mapping

### Workflows → Supabase

| Notion Property | Supabase Column | Type |
|----------------|-----------------|------|
| Name | name | TEXT |
| Description | description | TEXT |
| Steps | steps | TEXT |
| Is Active | is_active | BOOLEAN |
| Agents | metadata.agent_ids | JSONB |
| Tools | metadata.tool_ids | JSONB |

### Agents → Supabase

| Notion Property | Supabase Column | Type |
|----------------|-----------------|------|
| Name | name | TEXT |
| Display Name | display_name | TEXT |
| Description | description | TEXT |
| Role | role | TEXT |
| Category | category | TEXT |
| Tier | tier | TEXT |
| Model | model | TEXT |
| Temperature | temperature | NUMERIC |
| Max Tokens | max_tokens | INTEGER |
| System Prompt | system_prompt | TEXT |
| Is Active | is_active | BOOLEAN |
| Capabilities | metadata.capability_ids | JSONB |

### Capabilities → Supabase

| Notion Property | Supabase Column | Type |
|----------------|-----------------|------|
| Name | name | TEXT |
| Category | category | TEXT |
| Domain | domain | TEXT |
| VITAL Component | vital_component | TEXT |
| Complexity Level | complexity_level | TEXT |
| Priority | priority | TEXT |
| Stage | stage | TEXT |

## Relationships

The script creates junction tables for many-to-many relationships:

### workflow_agents
Links workflows to their assigned agents
```sql
workflow_id → workflows(id)
agent_id → agents(id)
```

### workflow_tools
Links workflows to the tools they use
```sql
workflow_id → workflows(id)
tool_id → tools(id)
```

### agent_capabilities
Links agents to their capabilities
```sql
agent_id → agents(id)
capability_id → capabilities(id)
```

### agent_prompts
Links agents to their prompts
```sql
agent_id → agents(id)
prompt_id → prompts(id)
```

## Querying Synced Data

### Get all active agents with their capabilities

```sql
SELECT 
    a.name,
    a.display_name,
    a.category,
    ARRAY_AGG(c.name) as capabilities
FROM agents a
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
LEFT JOIN capabilities c ON ac.capability_id = c.id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.display_name, a.category;
```

### Get workflows with their agents and tools

```sql
SELECT 
    w.name as workflow_name,
    ARRAY_AGG(DISTINCT a.name) as agents,
    ARRAY_AGG(DISTINCT t.name) as tools
FROM workflows w
LEFT JOIN workflow_agents wa ON w.id = wa.workflow_id
LEFT JOIN agents a ON wa.agent_id = a.id
LEFT JOIN workflow_tools wt ON w.id = wt.workflow_id
LEFT JOIN tools t ON wt.tool_id = t.id
WHERE w.is_active = true
GROUP BY w.id, w.name;
```

### Get agent with full configuration

```sql
SELECT 
    a.*,
    ar.configuration_json,
    ar.hipaa_compliant,
    ar.performance_score,
    ARRAY_AGG(DISTINCT c.name) as capabilities,
    ARRAY_AGG(DISTINCT p.name) as prompts
FROM agents a
LEFT JOIN agents_registry ar ON a.notion_id = ar.notion_id
LEFT JOIN agent_capabilities ac ON a.id = ac.agent_id
LEFT JOIN capabilities c ON ac.capability_id = c.id
LEFT JOIN agent_prompts ap ON a.id = ap.agent_id
LEFT JOIN prompts p ON ap.prompt_id = p.id
WHERE a.name = 'Your Agent Name'
GROUP BY a.id, ar.id;
```

## Scheduling Automatic Syncs

### Using Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line to sync daily at 2 AM
0 2 * * * cd /path/to/VITAL-path && /usr/bin/python3 scripts/sync_notion_to_supabase.py >> logs/notion-sync.log 2>&1
```

### Using GitHub Actions

Create `.github/workflows/notion-sync.yml`:

```yaml
name: Notion Sync

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install python-dotenv requests supabase
      
      - name: Run sync
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: python scripts/sync_notion_to_supabase.py
```

## Troubleshooting

### "NOTION_TOKEN not found"
- Make sure you've added the token to your `.env` file
- The token should start with `secret_`

### "Could not find page with ID"
- Ensure you've shared all databases with your Notion integration
- Check that the database IDs in the script match your workspace

### "403 Forbidden"
- Your integration doesn't have access to the database
- Re-share the database with your integration

### "Failed to sync relationships"
- This can happen if parent entities weren't synced first
- The script handles this gracefully and logs warnings
- Re-run the sync to catch any missed relationships

### Table doesn't exist
- Run the migration first: `database/migrations/20250108_notion_sync_tables.sql`
- Check that all tables were created successfully

## Advanced Configuration

### Custom Database IDs

If your Notion database IDs are different, update them in the script:

```python
NOTION_DATABASES = {
    'workflows': 'your-database-id-here',
    'agents': 'your-database-id-here',
    # ... etc
}
```

### Filtering Sync

To only sync specific databases, comment out unwanted syncs in `run_full_sync()`:

```python
def run_full_sync(self):
    # self.sync_tools()  # Skip tools
    self.sync_capabilities()
    self.sync_agents()
    # ... etc
```

## Best Practices

1. **Run sync during low-traffic periods** to avoid API rate limits
2. **Monitor the first few syncs** to ensure data integrity
3. **Back up your Supabase database** before first sync
4. **Use service role key** for automated syncs (not anon key)
5. **Keep Notion token secure** - never commit to git

## Support

For issues or questions:
- Check logs in the console output
- Review the Notion API documentation: https://developers.notion.com
- Check Supabase documentation: https://supabase.com/docs

## Next Steps

After syncing, you can:
1. Query the data using the examples above
2. Build dashboards using the synced data
3. Create API endpoints that leverage this data
4. Set up real-time subscriptions to Supabase tables
5. Export data for analytics and reporting

---

**Last Updated**: January 8, 2025  
**Version**: 1.0.0
