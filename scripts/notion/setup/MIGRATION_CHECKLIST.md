# VITAL Path → Notion Migration Checklist

## Overview
Complete checklist for migrating all VITAL Path data to Notion with bidirectional sync.

---

## Phase 1: Notion Database Creation ✓

### Prerequisites
- ✅ Notion workspace access
- ✅ Claude Desktop with Notion MCP server connected
- ✅ Complete database schemas documented

### Databases to Create (12 total)

#### Organizational Structure (4 databases)
- [ ] **org_functions** - 11 properties
- [ ] **org_departments** - 11 properties
- [ ] **org_roles** - 12 properties
- [ ] **org_responsibilities** - 9 properties

#### Agent System (8 databases)
- [ ] **agents** - 32 properties (CENTRAL DATABASE)
- [ ] **capabilities** - 23 properties
- [ ] **competencies** - 11 properties
- [ ] **prompts** - 14 properties
- [ ] **rag_documents** - 16 properties
- [ ] **tools** - 15 properties
- [ ] **workflows** - 15 properties
- [ ] **jobs_to_be_done** - 18 properties

### Creation Process
1. Use [claude-desktop-prompts.md](./claude-desktop-prompts.md) for copy-paste commands
2. Create databases in order (org structure first, then agent system)
3. After each database creation, record its Database ID
4. Set up relations between databases

---

## Phase 2: Database ID Collection

### Record Database IDs
After creating each database in Notion, extract and record the database ID:

```bash
# Database IDs format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# Extract from Notion database URL after last slash

ORG_FUNCTIONS_DB_ID=
ORG_DEPARTMENTS_DB_ID=
ORG_ROLES_DB_ID=
ORG_RESPONSIBILITIES_DB_ID=
AGENTS_DB_ID=
CAPABILITIES_DB_ID=
COMPETENCIES_DB_ID=
PROMPTS_DB_ID=
RAG_DOCUMENTS_DB_ID=
TOOLS_DB_ID=
WORKFLOWS_DB_ID=
JOBS_TO_BE_DONE_DB_ID=
```

### Update Environment Variables
Add to `.env.local`:

```bash
# Notion Integration
NOTION_API_KEY=your_integration_key_here
NOTION_WORKSPACE_ID=277345b0299e80ceb179eec50f02a23f

# Organizational Databases
NOTION_ORG_FUNCTIONS_DB_ID=
NOTION_ORG_DEPARTMENTS_DB_ID=
NOTION_ORG_ROLES_DB_ID=
NOTION_ORG_RESPONSIBILITIES_DB_ID=

# Agent System Databases
NOTION_AGENTS_DB_ID=
NOTION_CAPABILITIES_DB_ID=
NOTION_COMPETENCIES_DB_ID=
NOTION_PROMPTS_DB_ID=
NOTION_RAG_DOCUMENTS_DB_ID=
NOTION_TOOLS_DB_ID=
NOTION_WORKFLOWS_DB_ID=
NOTION_JOBS_TO_BE_DONE_DB_ID=
```

---

## Phase 3: Relation Setup

### Critical Relations (must be configured in Notion)

#### org_functions
- [ ] Parent Function → self-relation

#### org_departments
- [ ] Function → org_functions
- [ ] Department Count → Rollup from org_roles

#### org_roles
- [ ] Function → org_functions
- [ ] Department → org_departments
- [ ] Responsibilities Count → Rollup from org_responsibilities

#### org_responsibilities
- [ ] Role → org_roles
- [ ] Required Competencies → competencies

#### agents (MOST COMPLEX)
- [ ] Department → org_departments
- [ ] Role → org_roles
- [ ] Function → org_functions
- [ ] Capabilities → capabilities
- [ ] Competencies → competencies
- [ ] Tools → tools
- [ ] Workflows → workflows
- [ ] Prompts → prompts

#### capabilities
- [ ] Required Competencies → competencies
- [ ] Required Tools → tools
- [ ] Agents → agents

#### competencies
- [ ] Capabilities → capabilities
- [ ] Roles → org_roles

#### prompts
- [ ] Agents → agents

#### rag_documents
- [ ] Agents → agents
- [ ] Capabilities → capabilities

#### tools
- [ ] Agents → agents
- [ ] Capabilities → capabilities

#### workflows
- [ ] Agents Involved → agents
- [ ] Capabilities Required → capabilities

#### jobs_to_be_done
- [ ] Agents → agents
- [ ] Workflows → workflows
- [ ] Capabilities → capabilities

---

## Phase 4: Data Migration Scripts

### Initial Data Export from Supabase

```bash
# 1. Backup current database
./scripts/backup-db.sh

# 2. Export data to JSON format for Notion import
node scripts/export-to-notion-format.js
```

### Data Files Generated (expected)
- [ ] `exports/org_functions.json`
- [ ] `exports/org_departments.json`
- [ ] `exports/org_roles.json`
- [ ] `exports/org_responsibilities.json`
- [ ] `exports/agents.json` (254 agents)
- [ ] `exports/capabilities.json` (5+ capabilities)
- [ ] `exports/competencies.json`
- [ ] `exports/prompts.json`
- [ ] `exports/rag_documents.json`
- [ ] `exports/tools.json`
- [ ] `exports/workflows.json`
- [ ] `exports/jobs_to_be_done.json`

---

## Phase 5: Initial Sync (Supabase → Notion)

### Sync Order (important!)
Data must be synced in dependency order:

1. **First: Organizational Structure**
   ```bash
   node scripts/sync-to-notion.js --table org_functions
   node scripts/sync-to-notion.js --table org_departments
   node scripts/sync-to-notion.js --table org_roles
   node scripts/sync-to-notion.js --table org_responsibilities
   ```

2. **Second: Foundation Data**
   ```bash
   node scripts/sync-to-notion.js --table competencies
   node scripts/sync-to-notion.js --table capabilities
   node scripts/sync-to-notion.js --table tools
   ```

3. **Third: Agent System**
   ```bash
   node scripts/sync-to-notion.js --table prompts
   node scripts/sync-to-notion.js --table agents
   node scripts/sync-to-notion.js --table workflows
   ```

4. **Fourth: Supporting Data**
   ```bash
   node scripts/sync-to-notion.js --table rag_documents
   node scripts/sync-to-notion.js --table jobs_to_be_done
   ```

### Verification After Sync
- [ ] All 254 agents visible in Notion
- [ ] All capabilities visible in Notion
- [ ] Relations properly connected
- [ ] Select/Multi-select values populated correctly

---

## Phase 6: Bidirectional Sync Setup

### Webhook Configuration
1. **Notion → Supabase webhooks**
   - Configure in Notion integration settings
   - Point to: `https://your-domain.com/api/webhooks/notion`

2. **Supabase → Notion triggers**
   - Database triggers already configured
   - Update sync script with Notion DB IDs

### Sync Scripts
- [ ] `scripts/sync-notion-to-supabase.js` - configured with DB IDs
- [ ] `scripts/sync-supabase-to-notion.js` - configured with DB IDs
- [ ] `scripts/bidirectional-sync.js` - main sync orchestrator

### Test Sync
1. **Notion → Supabase**
   - [ ] Create test agent in Notion
   - [ ] Verify appears in Supabase
   - [ ] Verify all fields mapped correctly

2. **Supabase → Notion**
   - [ ] Create test capability in Supabase
   - [ ] Verify appears in Notion
   - [ ] Verify all fields mapped correctly

3. **Update Sync**
   - [ ] Update agent in Notion
   - [ ] Verify updates in Supabase
   - [ ] Update capability in Supabase
   - [ ] Verify updates in Notion

---

## Phase 7: Production Readiness

### Monitoring
- [ ] Sync logs configured
- [ ] Error alerting setup
- [ ] Conflict resolution strategy defined

### Backup Strategy
- [ ] Daily Supabase backups scheduled
- [ ] Notion export automation configured
- [ ] Rollback procedure documented

### Documentation
- [ ] Sync workflow documented
- [ ] Field mapping reference created
- [ ] Troubleshooting guide written

---

## Current Status

### ✅ Completed
- Complete database schemas documented (12 databases)
- Copy-paste prompts for Claude Desktop ready
- Sync script framework created
- Backup/restore system operational
- 254 agents in Supabase ready for sync
- 5 capabilities in Supabase ready for sync

### ⏳ In Progress
- Awaiting Notion database creation via Claude Desktop
- Database ID collection

### 🔜 Next Steps
1. User creates databases in Notion using Claude Desktop
2. User provides database IDs
3. Configure sync scripts with IDs
4. Run initial data migration
5. Test bidirectional sync
6. Enable production sync

---

## Troubleshooting

### Common Issues

**Issue: Relation fields not connecting**
- Solution: Ensure target database created first
- Solution: Verify database IDs correct in sync config

**Issue: Select field values not matching**
- Solution: Pre-create all select options in Notion
- Solution: Update field mapping in sync script

**Issue: Sync conflicts**
- Solution: Implement last-write-wins strategy
- Solution: Add conflict resolution logic

**Issue: Missing required fields**
- Solution: Ensure all required fields have default values
- Solution: Add validation before sync

---

## Support Resources

- **Database Schemas**: [complete-database-schemas.md](./complete-database-schemas.md)
- **Setup Instructions**: [setup-instructions.md](./setup-instructions.md)
- **Claude Desktop Prompts**: [claude-desktop-prompts.md](./claude-desktop-prompts.md)
- **Sync Script**: `scripts/sync-notion-to-supabase.js`

---

## Notes

- **Database Dependencies**: Organizational structure must be created first
- **Relation Order**: Create parent databases before child databases
- **Field Mapping**: Some Supabase fields may need transformation for Notion
- **API Limits**: Notion API has rate limits - sync scripts include throttling
- **Data Integrity**: Always backup before running sync operations

---

**Last Updated**: 2025-10-04
**Status**: Ready for Notion database creation phase
