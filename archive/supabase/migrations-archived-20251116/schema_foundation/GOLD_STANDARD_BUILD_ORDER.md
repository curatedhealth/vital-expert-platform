# Gold-Standard Database Build Order

**Status**: Ready to Build from Scratch
**Approach**: Clean slate, no legacy baggage
**Target**: Production-ready, enterprise-grade database

---

## Build Sequence

Apply these files in order via Supabase Dashboard SQL Editor:

### 🔥 Phase 0: Clean Slate
**File**: `00_WIPE_DATABASE.sql`
- Drops ALL tables, views, functions, types
- Nuclear option - complete fresh start
- **⚠️ ONLY run if you're ready to lose everything in current DB**

### 🎯 Phase 1: Extensions & Types
**File**: `01_extensions_and_enums.sql`
- Enable required PostgreSQL extensions (uuid-ossp, pgcrypto, vector)
- Create 17 ENUM types for type safety
- Foundation for all other tables

### 🏢 Phase 2: Multi-Tenancy Foundation
**File**: `02_tenants_and_auth.sql`
- Create tenants table (5-level hierarchy support)
- Create tenant_members table (RBAC)
- Create user_profiles table (extended auth)
- Create api_keys table (programmatic access)
- Create default tenant + 2 test tenants (Digital Health, Pharma)

### 🗂️ Phase 3: Organizational Structure
**File**: `03_organizational_hierarchy.sql`
- Create industries table
- Create org_functions table (Medical Affairs, Commercial, etc.)
- Create org_departments table
- Create org_roles table
- Create org_responsibilities table
- Junction tables for relationships

### 🤖 Phase 4: AI Agents Core
**File**: `04_agents_core.sql`
- Create agents table (84 columns, gold-standard)
- Create agent_skills junction table
- Create agent_industries junction table
- Indexes and RLS policies

### 👥 Phase 5: Personas & JTBDs
**File**: `05_personas_and_jtbds.sql`
- Create personas table (52 columns)
- Create jobs_to_be_done table (27 columns, NO NULLs!)
- Create jtbd_personas junction table (relevance scoring)
- Indexes and RLS policies

### 📝 Phase 6: Content Library
**File**: `06_content_library.sql`
- Create prompts table (7 role types)
- Create tools table
- Create knowledge_sources table
- Create knowledge_chunks table (RAG with vectors)
- Create skills table
- Create templates table
- Indexes and RLS policies

### 🔗 Phase 7: Agent Relationships
**File**: `07_agent_relationships.sql`
- Create agent_prompts junction table
- Create agent_tools junction table
- Create agent_knowledge junction table
- Create agent_tasks junction table
- Indexes for performance

### 🎯 Phase 8: Capabilities & Domains
**File**: `08_capabilities_and_domains.sql`
- Create domains table (outcome hierarchy top level)
- Create capabilities table
- Create capability_jtbd_mapping junction table
- Create strategic_priorities table
- Indexes and RLS policies

### 🔄 Phase 9: Workflows & Tasks
**File**: `09_workflows_and_tasks.sql`
- Create workflows table
- Create tasks table
- Create steps table (atomic actions)
- Create workflow_step_definitions table
- Create workflow_step_connections table
- Junction tables (workflow_tasks, task_agents, task_tools)
- Indexes and RLS policies

### 💬 Phase 10: Conversations
**File**: `10_conversations.sql`
- Create expert_consultations table (1:1 conversations)
- Create expert_messages table
- Create consultation_sessions table
- Create panel_discussions table (multi-agent panels)
- Create panel_members table
- Create panel_messages table
- Create panel_rounds table
- Create panel_consensus table
- Create panel_votes table
- Indexes and RLS policies

### 🎁 Phase 11: Solutions & Marketplace
**File**: `11_solutions.sql`
- Create solutions table (packaged offerings)
- Create solution_agents junction table
- Create solution_workflows junction table
- Create solution_prompts junction table
- Create solution_templates junction table
- Create solution_knowledge junction table
- Create solution_installations table
- Create solution_industry_matrix table
- Indexes and RLS policies

### 📊 Phase 12: Workflow Execution
**File**: `12_workflow_execution.sql`
- Create workflow_executions table
- Create workflow_steps table (runtime)
- Create workflow_approvals table
- Create workflow_logs table
- Create deliverables table
- Indexes and RLS policies

### 📈 Phase 13: Feedback & Voting
**File**: `13_feedback_and_voting.sql`
- Create consultation_feedback table
- Create votes table
- Create vote_records table
- Indexes and RLS policies

### 🔍 Phase 14: Audit & Compliance
**File**: `14_audit_and_compliance.sql`
- Create audit_log table (7-year retention)
- Create service_role_audit table
- Create data_retention_policies table
- Indexes for compliance queries

### ⚡ Phase 15: Performance Indexes
**File**: `15_performance_indexes.sql`
- Composite indexes for common query patterns
- GIN indexes for arrays, JSONB, full-text search
- Partial indexes for filtered queries
- Covering indexes for read-heavy queries

### 🔐 Phase 16: Row Level Security
**File**: `16_row_level_security.sql`
- Enable RLS on all tenant-scoped tables
- Create tenant isolation policies
- Create user-specific policies
- Create role-based access policies

### 🛠️ Phase 17: Helper Functions
**File**: `17_helper_functions.sql`
- create_consultation() function
- create_panel_discussion() function
- execute_workflow() function
- match_documents() function (RAG)
- search_agents() function
- search_jtbds() function
- update_consultation_stats() trigger
- update_panel_stats() trigger
- Various utility functions

### 🌱 Phase 18: Seed Data (Optional)
**File**: `18_seed_data.sql`
- Seed industries
- Seed org_functions
- Seed capabilities
- Seed domains
- Test data for development

---

## Estimated Time

| Phase | Time | Cumulative |
|-------|------|------------|
| 0. Wipe | 2 min | 2 min |
| 1. Extensions & ENUMs | 5 min | 7 min |
| 2. Tenants & Auth | 5 min | 12 min |
| 3. Org Structure | 8 min | 20 min |
| 4. Agents | 5 min | 25 min |
| 5. Personas & JTBDs | 8 min | 33 min |
| 6. Content Library | 10 min | 43 min |
| 7. Agent Relationships | 5 min | 48 min |
| 8. Capabilities | 5 min | 53 min |
| 9. Workflows | 10 min | 63 min |
| 10. Conversations | 12 min | 75 min |
| 11. Solutions | 8 min | 83 min |
| 12. Workflow Execution | 8 min | 91 min |
| 13. Feedback & Voting | 5 min | 96 min |
| 14. Audit & Compliance | 5 min | 101 min |
| 15. Performance Indexes | 10 min | 111 min |
| 16. Row Level Security | 15 min | 126 min |
| 17. Helper Functions | 10 min | 136 min |
| 18. Seed Data | 5 min | 141 min |

**Total: ~2.5 hours** for complete gold-standard database

---

## After Schema Creation

Once all 18 phases are complete, you'll have:

✅ **Complete schema** with 50+ tables
✅ **Multi-tenant architecture** with RLS
✅ **Type safety** with 17 ENUMs
✅ **Performance optimized** with comprehensive indexes
✅ **RAG-ready** with pgvector support
✅ **Audit trail** with 7-year retention
✅ **Helper functions** for common operations

Then proceed to data import:

1. Import 254 agents from JSON
2. Import 335 personas from JSON
3. Import 338 JTBDs from JSON (with 0 NULL functional_areas)
4. Map personas to JTBDs
5. Link agents to JTBDs
6. Import prompts, tools, knowledge

---

## Verification After Each Phase

After applying each file, run:

```sql
-- Check for errors
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction (aborted)';

-- Count tables created
SELECT COUNT(*) as tables_created
FROM pg_tables
WHERE schemaname = 'public';

-- Check last applied phase
SELECT tablename, pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC
LIMIT 10;
```

---

## Ready to Build?

When you're ready:
1. Apply `00_WIPE_DATABASE.sql` (clean slate)
2. Apply phases 1-18 in order
3. Verify each phase before moving to next
4. Report any errors immediately

Let's build something beautiful! 🚀
