# VITAL Path → Notion Integration Flow

Visual guide showing the complete setup and sync process.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VITAL Path Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Supabase   │◄───────►│    Notion    │                  │
│  │   Database   │  Sync   │  Workspace   │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │                        │                           │
│  ┌──────▼────────────────────────▼───────┐                  │
│  │     Bidirectional Sync Engine         │                  │
│  │  • Export scripts                      │                  │
│  │  • Field mappers                       │                  │
│  │  • Relation handlers                   │                  │
│  │  • Conflict resolution                 │                  │
│  └────────────────────────────────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Setup Workflow

```
Phase 1: Prerequisites
┌────────────────────┐
│ Create Notion      │
│ Integration        │
│ (5 min)            │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Get API Token      │
│ Save to .env.local │
└─────────┬──────────┘
          │
          ▼

Phase 2: Database Creation (via Claude Desktop)
┌────────────────────┐
│ Organizational     │
│ Structure (4 DBs)  │
│ (10 min)           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Foundation Data    │
│ (3 DBs)            │
│ (8 min)            │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Agent System       │
│ (5 DBs)            │
│ (12 min)           │
└─────────┬──────────┘
          │
          ▼

Phase 3: Configuration
┌────────────────────┐
│ Extract DB IDs     │
│ (10 min)           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Setup Relations    │
│ (15 min)           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Grant Integration  │
│ Access             │
│ (5 min)            │
└─────────┬──────────┘
          │
          ▼

Phase 4: Data Migration
┌────────────────────┐
│ Export from        │
│ Supabase           │
│ (1 min)            │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Sync to Notion     │
│ (10 min)           │
└─────────┬──────────┘
          │
          ▼

Phase 5: Verification
┌────────────────────┐
│ Verify Data        │
│ Test Relations     │
│ (5 min)            │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ ✅ Integration     │
│    Complete!       │
└────────────────────┘

Total Time: ~80 minutes
```

---

## 🗄️ Database Creation Order

```
Step 1: Organizational Foundation
┌───────────────────┐
│  org_functions    │
│  (11 properties)  │
└────────┬──────────┘
         │ (parent)
         ▼
┌───────────────────┐
│  org_departments  │
│  (11 properties)  │
└────────┬──────────┘
         │ (department)
         ▼
┌───────────────────┐
│    org_roles      │
│  (12 properties)  │
└────────┬──────────┘
         │ (role)
         ▼
┌───────────────────┐
│org_responsibilities│
│   (9 properties)  │
└───────────────────┘

Step 2: Foundation Data
┌───────────────────┐
│   competencies    │
│  (11 properties)  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   capabilities    │◄─────┐
│  (23 properties)  │      │
└────────┬──────────┘      │
         │                 │
         ▼                 │
┌───────────────────┐      │
│      tools        │      │
│  (15 properties)  │      │
└───────────────────┘      │
                           │
Step 3: Agent System       │
┌───────────────────┐      │
│     prompts       │      │
│  (14 properties)  │      │
└────────┬──────────┘      │
         │                 │
         ▼                 │
┌───────────────────┐      │
│ ⭐ AGENTS ⭐     │──────┘
│  (32 properties)  │
│  254 records      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│    workflows      │
│  (15 properties)  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  rag_documents    │
│  (16 properties)  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ jobs_to_be_done   │
│  (18 properties)  │
└───────────────────┘
```

---

## 🔗 Key Relations Map

```
Organizational Hierarchy:
org_functions
    └─► org_departments
           └─► org_roles
                 └─► org_responsibilities
                       └─► competencies

Agent Ecosystem:
agents ───┬─► capabilities ──► competencies
          │                   ┌─► tools
          ├─► org_departments │
          ├─► org_roles       │
          ├─► competencies ───┘
          ├─► workflows
          ├─► prompts
          └─► tools

Knowledge System:
rag_documents ──► agents
              └─► capabilities

Workflow System:
workflows ──► agents
         └─► capabilities

Jobs Framework:
jobs_to_be_done ──► agents
                ├─► workflows
                └─► capabilities
```

---

## 📝 Data Flow

```
Initial Sync (Supabase → Notion):

┌─────────────┐
│  Supabase   │
│  Database   │
└──────┬──────┘
       │
       │ 1. Export
       ▼
┌─────────────┐
│  JSON Files │
│  (12 files) │
└──────┬──────┘
       │
       │ 2. Transform
       ▼
┌─────────────┐
│ Notion API  │
│  Format     │
└──────┬──────┘
       │
       │ 3. Sync
       ▼
┌─────────────┐
│   Notion    │
│  Databases  │
└─────────────┘

Ongoing Sync (Bidirectional):

┌─────────────┐         ┌─────────────┐
│  Supabase   │◄───1───►│   Notion    │
│             │         │             │
│  • Create   │    2    │  • Edit     │
│  • Update   │◄───────►│  • Update   │
│  • Delete   │         │  • Delete   │
└─────────────┘         └─────────────┘
       │                       │
       │                       │
       └───────► 3. Sync ◄─────┘
                Engine
         • Detect changes
         • Resolve conflicts
         • Update both systems
```

---

## 🎯 CLI Commands Flow

```
Setup Phase:
┌──────────────────────────────────────────┐
│ # 1. Export data                         │
│ node scripts/export-to-notion-format.js  │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ Output: exports/notion/                  │
│ • agents.json (254 records)              │
│ • capabilities.json (5 records)          │
│ • ... (10 more files)                    │
│ • all_tables.json (combined)             │
│ • export_metadata.json                   │
└──────────────────┬───────────────────────┘
                   │
                   ▼

Sync Phase (Option 1 - Test First):
┌──────────────────────────────────────────┐
│ # 2a. Test with small table              │
│ node scripts/sync-supabase-to-notion.js  │
│      --table=capabilities                │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ ✅ Success? → Continue                   │
│ ❌ Error? → Check config                 │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│ # 2b. Sync main table                    │
│ node scripts/sync-supabase-to-notion.js  │
│      --table=agents                      │
└──────────────────────────────────────────┘

Sync Phase (Option 2 - All At Once):
┌──────────────────────────────────────────┐
│ # 2. Sync all tables                     │
│ node scripts/sync-supabase-to-notion.js  │
│                                          │
│ Syncs in order:                          │
│ 1. org_functions                         │
│ 2. org_departments                       │
│ 3. org_roles                             │
│ 4. org_responsibilities                  │
│ 5. competencies                          │
│ 6. capabilities                          │
│ 7. tools                                 │
│ 8. prompts                               │
│ 9. agents (254 records)                  │
│ 10. workflows                            │
│ 11. rag_documents                        │
│ 12. jobs_to_be_done                      │
└──────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting Flow

```
Error Encountered
       │
       ▼
┌─────────────────────┐
│ Check Error Type    │
└──────┬──────────────┘
       │
       ├─► "No database ID"
       │   └─► Add to .env.local
       │
       ├─► "Unauthorized"
       │   └─► Grant integration access
       │
       ├─► "Invalid properties"
       │   └─► Check schema matches
       │
       ├─► "Relation error"
       │   └─► Create parent DB first
       │
       └─► "Rate limit"
           └─► Automatic retry (built-in)
```

---

## 📊 Progress Tracking

```
┌─────────────────────────────────────────┐
│          Setup Progress: 50%            │
├─────────────────────────────────────────┤
│ ████████████████░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────┘

Completed:
✅ Schema design
✅ Documentation
✅ Scripts developed
✅ Field mappings
✅ Safety systems

Remaining:
⏳ Database creation (user)
⏳ Configuration (user)
⏳ Initial sync (user)
⏳ Verification (user)
```

---

## 🎓 Quick Reference

```
┌───────────────────────────────────────────────┐
│         Essential Files by Use Case           │
├───────────────────────────────────────────────┤
│                                               │
│ 🚀 Just Getting Started?                     │
│ → QUICK_START.md                             │
│                                               │
│ 📋 Want Complete Checklist?                  │
│ → MIGRATION_CHECKLIST.md                     │
│                                               │
│ 🔍 Need Database Schemas?                    │
│ → complete-database-schemas.md               │
│                                               │
│ 💻 Creating Databases?                       │
│ → claude-desktop-prompts.md                  │
│                                               │
│ 📖 Want Full Documentation?                  │
│ → README.md                                  │
│                                               │
│ 🎯 Check Current Status?                     │
│ → IMPLEMENTATION_STATUS.md                   │
│                                               │
│ 🗺️ See Visual Flow?                          │
│ → SETUP_FLOW.md (you are here!)             │
│                                               │
└───────────────────────────────────────────────┘
```

---

## ⏱️ Time Estimates by Phase

```
┌─────────────────────┬──────────┬──────────┐
│ Phase               │ Time     │ Who      │
├─────────────────────┼──────────┼──────────┤
│ Notion Integration  │  5 min   │ User     │
│ Create 12 Databases │ 30 min   │ Claude*  │
│ Extract DB IDs      │ 10 min   │ User     │
│ Setup Relations     │ 15 min   │ User     │
│ Grant Access        │  5 min   │ User     │
│ Export Data         │  1 min   │ Script   │
│ Sync to Notion      │ 10 min   │ Script   │
│ Verification        │  5 min   │ User     │
├─────────────────────┼──────────┼──────────┤
│ TOTAL               │ 81 min   │          │
└─────────────────────┴──────────┴──────────┘

* Via Claude Desktop with Notion MCP
```

---

## 🎯 Success Checkpoints

```
✅ Checkpoint 1: Integration Created
   • NOTION_API_KEY in .env.local
   • Token tested and valid

✅ Checkpoint 2: Databases Created
   • 12 databases in Notion workspace
   • All properties configured
   • Relations set up

✅ Checkpoint 3: Configuration Complete
   • All 12 database IDs in .env.local
   • Integration has access
   • Scripts ready to run

✅ Checkpoint 4: Data Synced
   • Export completed successfully
   • Sync completed without errors
   • All records visible in Notion

✅ Checkpoint 5: Verified
   • 254 agents showing in Notion
   • Relations working
   • Data matches Supabase
   • ✨ Integration Complete!
```

---

**Visual Guide Version**: 1.0
**Last Updated**: 2025-10-04
**Status**: Ready for user execution
