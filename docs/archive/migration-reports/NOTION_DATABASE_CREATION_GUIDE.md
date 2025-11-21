# Supabase to Notion Database Setup Guide

This guide explains how to create Notion databases that match your Supabase schema, complete with all relationships.

## Overview

The `create_notion_databases_from_supabase.py` script analyzes your Supabase schema and automatically creates matching Notion databases with:

- ✅ Correct property types
- ✅ Pre-configured select options
- ✅ Relationship links between databases
- ✅ Proper field constraints

## Prerequisites

### 1. Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Name it "VITAL Supabase Sync"
4. Select your workspace
5. Copy the **Internal Integration Token**

### 2. Environment Setup

Add to your `.env` file:

```bash
# Notion Configuration
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Parent page ID to organize databases
NOTION_PARENT_PAGE_ID=your-parent-page-id-here
```

**To get Parent Page ID:**
1. Open the parent page in Notion
2. Copy the URL: `https://notion.so/Page-Name-XXXXXXXXX`
3. The ID is the `XXXXXXXXX` part (32-character UUID)

### 3. Python Dependencies

```bash
pip install python-dotenv requests
```

## Databases That Will Be Created

The script creates **12 databases** matching your Supabase schema:

| Database | Description | Key Relationships |
|----------|-------------|-------------------|
| 🏢 Organizations | Organizations using VITAL | → Users, Agents |
| 🤖 Agents | AI agents with configurations | → Capabilities, Workflows, Tools |
| 🔄 Workflows | Business processes | ← Agents, Tools, Use Cases |
| ⚡ Capabilities | Agent skills matrix | ← Agents |
| 🛠️ Tools | External integrations | ← Agents, Workflows |
| 📝 Prompts | AI prompt templates | → Agents, Use Cases |
| 🎯 Use Cases | Jobs to be done | → Agents, Workflows |
| 👤 Personas | User roles | → Agents |
| 📚 Knowledge Domains | Domain taxonomy | → Documents |
| 📄 Knowledge Documents | RAG documents | → Domains |
| 🔌 LLM Providers | LLM provider configs | → Models |
| 🧠 LLM Models | Available LLM models | → Providers |
| 💬 Chat Sessions | User conversations | → Agents |

## Running the Script

### Step 1: Create Databases

```bash
cd /path/to/VITAL-path
python scripts/create_notion_databases_from_supabase.py
```

### Step 2: Review Output

The script will create all databases and output:

```
╔══════════════════════════════════════════════════════════════╗
║   VITAL Expert - Supabase to Notion Database Creator        ║
╚══════════════════════════════════════════════════════════════╝

🚀 Starting Notion database creation...
======================================================================
✓ Created database: 🏢 Organizations (ID: xxx...)
✓ Created database: 🔌 LLM Providers (ID: xxx...)
✓ Created database: 📚 Knowledge Domains (ID: xxx...)
✓ Created database: 🤖 Agents (ID: xxx...)
✓ Created database: 🧠 LLM Models (ID: xxx...)
✓ Created database: 📄 Knowledge Documents (ID: xxx...)
✓ Created database: ⚡ Capabilities (ID: xxx...)
✓ Created database: 🔄 Workflows (ID: xxx...)
✓ Created database: 💬 Chat Sessions (ID: xxx...)
✓ Created database: 🎯 Use Cases (ID: xxx...)
✓ Created database: 🛠️ Tools (ID: xxx...)
✓ Created database: 📝 Prompts (ID: xxx...)
✓ Created database: 👤 Personas (ID: xxx...)

======================================================================
DATABASES CREATED
======================================================================
  Organizations
    ID: 12345678-90ab-cdef-1234-567890abcdef
    URL: https://www.notion.so/12345678...
  
  ... (continued for all databases)
  
Total Databases: 12
======================================================================

✓ Database IDs saved to notion_database_ids.json

✅ All databases created successfully!
```

### Step 3: Configure Relations

The script automatically sets up relations, but you may need to **share databases** with your integration:

1. Open each created database in Notion
2. Click "..." (top right)
3. Click "Add connections"
4. Select your "VITAL Supabase Sync" integration

## Database Property Mapping

### Agents Database

| Supabase Column | Notion Property | Type |
|----------------|-----------------|------|
| name | Name | Title |
| display_name | Display Name | Rich Text |
| description | Description | Rich Text |
| avatar | Avatar | URL |
| color | Color | Select |
| system_prompt | System Prompt | Rich Text |
| model | Model | Select |
| temperature | Temperature | Number |
| max_tokens | Max Tokens | Number |
| business_function | Business Function | Select |
| department | Department | Select |
| tier | Tier | Select |
| status | Status | Select |
| is_public | Is Public | Checkbox |
| is_custom | Is Custom | Checkbox |
| capabilities | Capabilities | Multi-select |

### Workflows Database

| Supabase Column | Notion Property | Type |
|----------------|-----------------|------|
| name | Name | Title |
| description | Description | Rich Text |
| definition | Definition | Rich Text (JSON) |
| status | Status | Select |
| is_public | Is Public | Checkbox |
| - | Agents | Relation → Agents |
| created_at | Created At | Date |

### Capabilities Database

| Supabase Column | Notion Property | Type |
|----------------|-----------------|------|
| capability_name | Name | Title |
| description | Description | Rich Text |
| - | Category | Select |
| proficiency_level | Proficiency Level | Select |
| - | Agents | Relation ← Agents |

### Tools Database

| Supabase Column | Notion Property | Type |
|----------------|-----------------|------|
| name | Name | Title |
| description | Description | Rich Text |
| tool_type | Tool Type | Select |
| configuration | Configuration | Rich Text (JSON) |
| is_active | Is Active | Checkbox |
| - | Workflows | Relation ↔ Workflows |
| - | Agents | Relation ↔ Agents |

## Relationship Structure

### Primary Relationships

```
Organizations
  ├── Users
  ├── Agents
  └── Knowledge Documents

Agents
  ├── Capabilities (many-to-many)
  ├── Workflows (many-to-many)
  ├── Tools (many-to-many)
  ├── Prompts (one-to-many)
  ├── Chat Sessions (one-to-many)
  └── Knowledge Domains (many-to-many)

Workflows
  ├── Agents (many-to-many)
  ├── Tools (many-to-many)
  └── Use Cases (many-to-many)

Knowledge Domains
  ├── Parent Domain (self-reference)
  └── Documents (one-to-many)

LLM Providers
  └── Models (one-to-many)
```

### Relation Types in Notion

- **One-to-Many**: Using single relation property
- **Many-to-Many**: Using dual-property relations (automatic backlinks)
- **Self-Reference**: Knowledge Domains → Parent Domain

## After Creation

### 1. Verify Databases

Check each database in Notion to ensure:
- All properties are present
- Select options are appropriate
- Relations are properly linked

### 2. Customize (Optional)

You can add additional properties:
- **Icons**: Add custom icons to select options
- **Formulas**: Add calculated fields
- **Rollups**: Aggregate data from relations
- **Templates**: Create page templates for common entries

### 3. Populate Data

You have two options:

#### Option A: Manual Entry
Create sample pages in each database to test the structure

#### Option B: Sync from Supabase
Run the sync script to populate with existing data:

```bash
python scripts/sync_supabase_to_notion.py
```

## Database IDs File

The script saves all database IDs to `notion_database_ids.json`:

```json
{
  "agents": "12345678-90ab-cdef-1234-567890abcdef",
  "workflows": "23456789-01bc-def1-2345-6789abcdef01",
  "capabilities": "34567890-12cd-ef12-3456-789abcdef012",
  ...
}
```

**Use this file for:**
- Sync scripts
- API integrations
- Backup/restore operations

## Troubleshooting

### "Unauthorized" Error

**Cause**: Integration token is invalid or not set

**Solution**:
1. Verify `NOTION_TOKEN` in `.env`
2. Token should start with `secret_`
3. Regenerate token if needed

### "Parent not found" Error

**Cause**: `NOTION_PARENT_PAGE_ID` is invalid

**Solution**:
1. Remove `NOTION_PARENT_PAGE_ID` from `.env` (creates at workspace level)
2. Or verify the page ID is correct
3. Ensure the integration has access to the parent page

### Relations Not Working

**Cause**: Databases need to be shared with integration

**Solution**:
1. Open each database
2. "..." → "Add connections" → Select your integration
3. Re-run the script if needed

### "Rate limit exceeded"

**Cause**: Too many API calls too quickly

**Solution**:
1. Wait a few minutes
2. Re-run the script (it skips existing databases)

## Advanced Configuration

### Custom Select Options

Edit the script to add domain-specific options:

```python
'Industry': {'select': {'options': [
    {'name': 'Your Custom Industry', 'color': 'blue'},
    # Add more options...
]}}
```

### Additional Properties

Add custom properties to any database:

```python
properties = {
    # Existing properties...
    'Your Custom Field': {'rich_text': {}},
    'Your Number Field': {'number': {}},
}
```

### Database Descriptions

Customize descriptions for better documentation:

```python
db_id = self.create_database(
    'Your Database Name',
    properties,
    'Your detailed description here'
)
```

## Next Steps

After creating the databases:

1. ✅ Review all databases in Notion
2. ✅ Share with integration
3. ✅ Customize properties if needed
4. ✅ Create templates for common entries
5. ✅ Set up views (filters, sorts, groups)
6. ✅ Run sync to populate data
7. ✅ Train team on structure

## Integration with Other Tools

### With Supabase Sync

After creating databases, sync data:
```bash
python scripts/sync_supabase_to_notion.py
```

### With API

Use the saved database IDs in your API calls:
```python
import json

with open('notion_database_ids.json') as f:
    db_ids = json.load(f)

agents_db_id = db_ids['agents']
# Use in API calls...
```

### With Webhooks

Set up Notion webhooks to sync changes back to Supabase (requires additional setup).

## Best Practices

1. **Naming Convention**: Use consistent naming (e.g., all databases with icons)
2. **Relations**: Always use dual-property relations for many-to-many
3. **Select Options**: Keep options limited and meaningful
4. **Documentation**: Add descriptions to databases and properties
5. **Permissions**: Share only necessary databases with integrations
6. **Backup**: Save `notion_database_ids.json` securely
7. **Versioning**: Track changes to database structure

## Support

For issues or questions:
- Check logs in console output
- Review Notion API docs: https://developers.notion.com
- Check database IDs in `notion_database_ids.json`

---

**Last Updated**: January 8, 2025  
**Version**: 1.0.0  
**Supabase Schema**: 20251007222509_complete_vital_schema

