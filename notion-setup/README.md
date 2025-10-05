# VITAL Path ↔ Notion Integration

Complete documentation for integrating VITAL Path healthcare AI platform with Notion, enabling bidirectional sync of all organizational and agent data.

---

## 📋 Overview

This integration creates **12 interconnected Notion databases** that mirror and sync with the VITAL Path Supabase database:

### Organizational Structure (4 databases)
1. **Organizational Functions** - Top-level business functions
2. **Departments** - Organizational departments within functions
3. **Roles** - Job roles within departments
4. **Responsibilities** - Specific responsibilities for each role

### Agent System (8 databases)
5. **Agents Registry** - 254 AI agents with capabilities and configurations
6. **Capabilities Registry** - Agent capabilities and skills
7. **Competencies** - Required competencies for agents and roles
8. **Prompts Library** - Reusable prompt templates
9. **RAG Knowledge Base** - Documents for retrieval-augmented generation
10. **Tools Registry** - External tools and integrations
11. **Workflows** - Multi-agent workflows and processes
12. **Jobs to Be Done** - User needs and use cases

---

## 🎯 Quick Start

**Total Time: ~80 minutes**

1. **Read**: [QUICK_START.md](./QUICK_START.md) - Step-by-step setup guide
2. **Create**: Use [claude-desktop-prompts.md](./claude-desktop-prompts.md) to create databases
3. **Configure**: Add database IDs to `.env.local`
4. **Sync**: Run `node scripts/sync-supabase-to-notion.js`
5. **Verify**: Check all 254 agents appear in Notion

---

## 📚 Documentation Files

### Setup & Configuration
- **[QUICK_START.md](./QUICK_START.md)** - Fast-track setup guide (recommended starting point)
- **[setup-instructions.md](./setup-instructions.md)** - Detailed setup instructions
- **[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)** - Complete migration checklist

### Database Schemas
- **[complete-database-schemas.md](./complete-database-schemas.md)** - All 12 database schemas with properties and relations
- **[agents-database-schema.md](./agents-database-schema.md)** - Detailed agent database schema (32 properties)
- **[capabilities-database-schema.md](./capabilities-database-schema.md)** - Detailed capability database schema

### Implementation Guides
- **[claude-desktop-prompts.md](./claude-desktop-prompts.md)** - Copy-paste prompts for database creation
- **[notion-import-instructions.md](./notion-import-instructions.md)** - Import procedures

---

## 🔧 Scripts

### Data Export
```bash
# Export all data from Supabase to Notion-compatible JSON
node scripts/export-to-notion-format.js

# Output: exports/notion/*.json (one file per table)
```

### Sync to Notion
```bash
# Sync all tables
node scripts/sync-supabase-to-notion.js

# Sync single table
node scripts/sync-supabase-to-notion.js --table=agents
node scripts/sync-supabase-to-notion.js --table=capabilities
```

### Sync from Notion
```bash
# Sync changes from Notion back to Supabase
node scripts/sync-notion-to-supabase.js

# Sync specific database
node scripts/sync-notion-to-supabase.js --database=agents
```

---

## 🏗️ Database Architecture

### Relational Structure

```
org_functions
    ↓ (parent)
org_departments
    ↓ (department)
org_roles ─────────→ org_responsibilities
    ↓                       ↓
  agents              competencies
    ↓ ↘ ↘                  ↑
capabilities ←──────────────┘
    ↓
  tools
    ↓
workflows
    ↓
prompts
    ↓
rag_documents
    ↓
jobs_to_be_done
```

### Key Relations

**Agents → Multiple databases:**
- Department (org_departments)
- Role (org_roles)
- Function (org_functions)
- Capabilities (many-to-many)
- Competencies (many-to-many)
- Tools (many-to-many)
- Workflows (many-to-many)
- Prompts (many-to-many)

**Capabilities → Multiple databases:**
- Agents (many-to-many)
- Required Competencies (competencies)
- Required Tools (tools)

---

## ⚙️ Environment Variables

Add to `.env.local`:

```bash
# Notion Integration
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_WORKSPACE_ID=277345b0299e80ceb179eec50f02a23f

# Organizational Databases
NOTION_ORG_FUNCTIONS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_ORG_DEPARTMENTS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_ORG_ROLES_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_ORG_RESPONSIBILITIES_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Agent System Databases
NOTION_AGENTS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_CAPABILITIES_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_COMPETENCIES_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_PROMPTS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_RAG_DOCUMENTS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_TOOLS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_WORKFLOWS_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NOTION_JOBS_TO_BE_DONE_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 🎨 Notion Database Features

### Agent Tiers (Visual Badges)
- **Core** (Tier 0) - Purple gradient badge
- **Tier 1** - Blue badge
- **Tier 2** - Green badge
- **Tier 3** - Orange badge

### Lifecycle Stages (Status)
- Active
- Inactive
- Development
- Testing
- Deprecated
- Planned
- Pipeline

### Domain Expertise
- General
- Regulatory
- Clinical
- Market Access
- Quality
- Safety
- Commercial
- Legal
- Analytics

---

## 🔄 Sync Strategy

### Initial Sync (Supabase → Notion)
1. Export all data from Supabase
2. Create Notion databases
3. Sync in dependency order:
   - Organizational structure first
   - Foundation data second
   - Agent system third
   - Supporting data last

### Ongoing Sync Options

**Option 1: Manual Sync**
- Run sync scripts manually when needed
- Full control over sync timing

**Option 2: Scheduled Sync**
- Set up cron job for regular syncs
- Recommended: Every 15-30 minutes

**Option 3: Real-time Sync (Future)**
- Notion webhooks → Supabase
- Supabase triggers → Notion
- Near-instant bidirectional updates

---

## 📊 Data Volume

Current database sizes:

| Table | Records | Status |
|-------|---------|--------|
| agents | 254 | ✅ Ready |
| capabilities | 5+ | ✅ Ready |
| org_functions | 0 | ⚠️ Needs data |
| org_departments | 0 | ⚠️ Needs data |
| org_roles | 0 | ⚠️ Needs data |
| org_responsibilities | 0 | ⚠️ Needs data |
| competencies | 0 | ⚠️ Needs data |
| prompts | 0 | ⚠️ Needs data |
| tools | 0 | ⚠️ Needs data |
| workflows | 0 | ⚠️ Needs data |
| rag_documents | 0 | ⚠️ Needs data |
| jobs_to_be_done | 0 | ⚠️ Needs data |

---

## ✅ Verification Checklist

After setup, verify:

### Notion Databases
- [ ] All 12 databases created
- [ ] All properties configured correctly
- [ ] Relations between databases working
- [ ] Select field options populated
- [ ] Integration has access to all databases

### Data Sync
- [ ] All 254 agents visible in Notion
- [ ] Agent properties displaying correctly
- [ ] Tier badges showing correctly
- [ ] Lifecycle stages accurate
- [ ] Relations connected (Department, Capabilities, etc.)

### Environment
- [ ] `.env.local` has all 12 database IDs
- [ ] `NOTION_API_KEY` configured
- [ ] Sync scripts run without errors

---

## 🐛 Troubleshooting

### Common Issues

**"No Notion database ID configured"**
```bash
# Solution: Add database ID to .env.local
NOTION_AGENTS_DB_ID=your_database_id_here
```

**"Unauthorized" error**
```
# Solution: Grant integration access
1. Open database in Notion
2. Click ••• → Connections
3. Add "VITAL Path Sync" integration
```

**Relations not connecting**
```
# Solution: Ensure target database exists
1. Create parent database first
2. Then create relation property
3. Link records after both exist
```

**Select field value errors**
```
# Solution: Pre-create select options
1. Open database in Notion
2. Click property header
3. Add all expected values manually
```

**Sync taking too long**
```bash
# Solution: Sync one table at a time
node scripts/sync-supabase-to-notion.js --table=capabilities
```

---

## 🔒 Security & Compliance

### HIPAA Considerations
- Notion is **NOT** HIPAA-compliant
- **DO NOT** sync PHI (Protected Health Information)
- Agent configurations and metadata are safe
- Patient data must stay in Supabase only

### Data Classification
Notion sync is safe for:
- ✅ Agent configurations
- ✅ Capability definitions
- ✅ Workflow templates
- ✅ Organizational structure
- ✅ Prompt templates

**Never sync:**
- ❌ Patient information
- ❌ Medical records
- ❌ Clinical trial patient data
- ❌ Personal health data

---

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time bidirectional sync
- [ ] Conflict resolution UI
- [ ] Notion → Supabase webhooks
- [ ] Automated relation mapping
- [ ] Bulk import/export tools
- [ ] Sync analytics dashboard

### Integration Possibilities
- Slack notifications on sync
- Email alerts for conflicts
- Backup automation
- Version history tracking

---

## 🆘 Support

### Resources
- **Notion API Docs**: https://developers.notion.com
- **Supabase Docs**: https://supabase.com/docs
- **VITAL Path GitHub**: [Internal repository]

### Getting Help
1. Check [QUICK_START.md](./QUICK_START.md) troubleshooting section
2. Review [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)
3. Verify environment variables in `.env.local`
4. Check Notion integration permissions
5. Review sync script logs for errors

---

## 📝 Notes

- **Database Order Matters**: Create organizational structure before agents
- **Relations Must Match**: Ensure property names exactly match schemas
- **API Rate Limits**: Scripts include automatic throttling
- **Backup First**: Always run `./scripts/backup-db.sh` before syncing
- **Test Small**: Sync capabilities table first (only 5 records)
- **Use Claude Desktop**: For database creation via MCP server

---

## 🎯 Success Criteria

✅ **Integration Complete When:**
- All 12 Notion databases created with correct schemas
- 254 agents synced and visible in Notion
- All relations properly connected
- Sync scripts run without errors
- Data matches between Supabase and Notion
- Team can edit agents in Notion
- Changes sync back to Supabase

---

**Version**: 1.0.0
**Last Updated**: 2025-10-04
**Status**: Ready for Implementation
**Current Phase**: Database Creation (awaiting user action in Claude Desktop)
