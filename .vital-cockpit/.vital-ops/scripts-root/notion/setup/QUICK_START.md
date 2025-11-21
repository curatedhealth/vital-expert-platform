# Notion Integration Quick Start Guide

## 🎯 Objective
Set up 12 interconnected Notion databases and sync with Supabase for VITAL Path.

---

## ⚡ Quick Steps

### 1. Create Notion Integration (5 minutes)

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: `VITAL Path Sync`
4. Select your workspace
5. **Copy the Internal Integration Token** → Save to `.env.local`:
   ```bash
   NOTION_API_KEY=secret_xxxxxxxxxxxxx
   ```

### 2. Create Databases in Notion via Claude Desktop (30 minutes)

**Using your Notion MCP server in Claude Desktop:**

Copy and paste these prompts **one at a time**:

#### Step 1: Organizational Structure
```
Create 4 databases in my Notion workspace using the schemas from complete-database-schemas.md:
1. VITAL Path - Organizational Functions
2. VITAL Path - Departments
3. VITAL Path - Roles
4. VITAL Path - Responsibilities

Use the exact property specifications from the schema document.
```

#### Step 2: Foundation Data
```
Create 3 databases in my Notion workspace:
1. VITAL Path - Competencies
2. VITAL Path - Capabilities Registry
3. VITAL Path - Tools Registry

Use the schemas from complete-database-schemas.md with all properties and select options.
```

#### Step 3: Agent System
```
Create 5 databases in my Notion workspace:
1. VITAL Path - Prompts Library
2. VITAL Path - Agents Registry (this is the main one with 32 properties)
3. VITAL Path - Workflows
4. VITAL Path - RAG Knowledge Base
5. VITAL Path - Jobs to Be Done

Use the complete schemas with all relations defined.
```

### 3. Set Up Relations (15 minutes)

**In Notion, configure these critical relations:**

Priority 1 (Must configure):
- `agents` → Department (org_departments)
- `agents` → Capabilities (capabilities)
- `capabilities` → Agents (agents)
- `org_departments` → Function (org_functions)
- `org_roles` → Department (org_departments)

Priority 2 (Important):
- All other relations as defined in `complete-database-schemas.md`

### 4. Grant Integration Access (5 minutes)

For **each of the 12 databases** you created:

1. Click `•••` (three dots) in top right
2. Click `Connections`
3. Search for `VITAL Path Sync`
4. Click to grant access

### 5. Get Database IDs (10 minutes)

For each database, copy the URL and extract the ID:

**Example URL:**
```
https://www.notion.so/1234567890abcdef1234567890abcdef?v=...
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      This is the Database ID
```

Add all IDs to `.env.local`:

```bash
# Organizational Databases
NOTION_ORG_FUNCTIONS_DB_ID=paste_id_here
NOTION_ORG_DEPARTMENTS_DB_ID=paste_id_here
NOTION_ORG_ROLES_DB_ID=paste_id_here
NOTION_ORG_RESPONSIBILITIES_DB_ID=paste_id_here

# Agent System Databases
NOTION_AGENTS_DB_ID=paste_id_here
NOTION_CAPABILITIES_DB_ID=paste_id_here
NOTION_COMPETENCIES_DB_ID=paste_id_here
NOTION_PROMPTS_DB_ID=paste_id_here
NOTION_RAG_DOCUMENTS_DB_ID=paste_id_here
NOTION_TOOLS_DB_ID=paste_id_here
NOTION_WORKFLOWS_DB_ID=paste_id_here
NOTION_JOBS_TO_BE_DONE_DB_ID=paste_id_here
```

### 6. Run Initial Sync (10 minutes)

```bash
# Export data from Supabase to Notion format
node scripts/export-to-notion-format.js

# Verify export
ls -lh exports/notion/

# Sync to Notion (in dependency order)
node scripts/sync-supabase-to-notion.js --table=org_functions
node scripts/sync-supabase-to-notion.js --table=org_departments
node scripts/sync-supabase-to-notion.js --table=capabilities
node scripts/sync-supabase-to-notion.js --table=agents

# Or sync all at once
node scripts/sync-supabase-to-notion.js
```

### 7. Verify (5 minutes)

**In Notion:**
- [ ] All 254 agents visible
- [ ] Capabilities showing
- [ ] Relations connected properly
- [ ] Select field values displaying correctly

**In Supabase:**
- [ ] Data still intact
- [ ] No duplicate records created

---

## 🔧 Troubleshooting

### "No Notion database ID configured"
→ Add the database ID to `.env.local` (step 5)

### "Missing Notion API key"
→ Set `NOTION_API_KEY` in `.env.local` (step 1)

### "Unauthorized" error
→ Grant integration access to databases (step 4)

### Relations not working
→ Ensure target database created first, then recreate relation

### Select field errors
→ Pre-create all select options in Notion before syncing

---

## 📚 Reference Documents

- **Complete Schemas**: [complete-database-schemas.md](./complete-database-schemas.md)
- **Detailed Instructions**: [setup-instructions.md](./setup-instructions.md)
- **Migration Checklist**: [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)
- **Claude Prompts**: [claude-desktop-prompts.md](./claude-desktop-prompts.md)

---

## 🎯 Success Criteria

✅ **Setup Complete When:**
- All 12 Notion databases created with correct schemas
- All database IDs added to `.env.local`
- Integration has access to all databases
- Initial sync runs successfully
- 254 agents visible in Notion
- Relations properly connected

---

## ⏱️ Total Time: ~80 minutes

- Notion Integration: 5 min
- Database Creation: 30 min
- Relations Setup: 15 min
- Grant Access: 5 min
- Extract IDs: 10 min
- Initial Sync: 10 min
- Verification: 5 min

---

## 💡 Pro Tips

1. **Create databases in order** - Organizational structure first, then agent system
2. **Test with one table** - Sync `capabilities` first (only 5 records)
3. **Backup first** - Run `./scripts/backup-db.sh` before syncing
4. **Use Claude Desktop** - It has direct Notion MCP access
5. **Check rate limits** - Script includes automatic throttling
6. **Verify incrementally** - Check each database after creation

---

## 🆘 Need Help?

**Issue**: Can't access Notion MCP in Claude Code
**Solution**: Use Claude Desktop app instead - it has MCP server access

**Issue**: Too many databases to create manually
**Solution**: Use the batch prompts in [claude-desktop-prompts.md](./claude-desktop-prompts.md)

**Issue**: Don't know which fields are required
**Solution**: All Title fields are required, everything else optional

**Issue**: Sync taking too long
**Solution**: Sync one table at a time with `--table=` flag

---

**Last Updated**: 2025-10-04
**Status**: Ready to execute
