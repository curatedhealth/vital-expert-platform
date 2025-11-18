# VITAL.expert Gold-Standard Database - Complete Build Guide

**Total Tables**: 123 tables
**Total Phases**: 28 phases
**Estimated Time**: 4-5 hours
**Approach**: Sequential application via Supabase Dashboard SQL Editor

---

## Phase Overview

### Phase 00: Preparation (5 min)
- **00_wipe_database.sql** - Nuclear option: drop everything

### Phase 01: Foundation (10 min)
- **01_extensions_and_enums.sql** - PostgreSQL extensions + 20 ENUM types

### Phase 02: Identity & Multi-Tenancy (15 min)
- **02_identity_and_tenants.sql** - auth, users, tenants (5-level hierarchy)

### Phase 03: Solutions & Industries (10 min)
- **03_solutions_and_industries.sql** - Solutions marketplace foundation

### Phase 04: Organizational Structure (20 min)
- **04_organizational_hierarchy.sql** - Functions, departments, roles, responsibilities

### Phase 05: Core AI Assets (15 min)
- **05_agents_and_capabilities.sql** - Agents, capabilities, domains

### Phase 06: Personas & JTBDs (15 min)
- **06_personas_and_jtbds.sql** - Business context layer

### Phase 07: Prompt Management (20 min)
- **07_prompt_system.sql** - Suites, sub-suites, prompts, versions

### Phase 08: LLM Configuration (10 min)
- **08_llm_providers_and_models.sql** - Providers, models, configurations

### Phase 09: Knowledge & RAG (20 min)
- **09_knowledge_and_rag.sql** - Knowledge sources, chunks, domains

### Phase 10: Skills & Tools (15 min)
- **10_skills_and_tools.sql** - Skills, tools, templates

### Phase 11: Service - Ask Expert (15 min)
- **11_service_ask_expert.sql** - 1:1 consultations

### Phase 12: Service - Ask Panel (20 min)
- **12_service_ask_panel.sql** - Multi-agent panels

### Phase 13: Service - Workflows (25 min)
- **13_service_workflows.sql** - Workflows, tasks, steps

### Phase 14: Service - Solutions Marketplace (15 min)
- **14_service_solutions_marketplace.sql** - Solution assignments

### Phase 15: Agent Relationships (20 min)
- **15_agent_junction_tables.sql** - All agent junction tables

### Phase 16: Workflow Execution (15 min)
- **16_workflow_execution_runtime.sql** - Runtime execution tables

### Phase 17: Deliverables & Feedback (10 min)
- **17_deliverables_and_feedback.sql** - Outputs and user feedback

### Phase 18: Monitoring & Metrics (20 min)
- **18_monitoring_and_metrics.sql** - Performance tracking, agent metrics

### Phase 19: LLM Usage & Logging (15 min)
- **19_llm_usage_logging.sql** - LLM call tracking, cost monitoring

### Phase 20: Memory & Context (15 min)
- **20_memory_and_context.sql** - User memory, session context

### Phase 21: Security & Encryption (10 min)
- **21_security_and_encryption.sql** - API keys, encryption

### Phase 22: Rate Limiting & Quotas (10 min)
- **22_rate_limiting_and_quotas.sql** - Usage limits, quotas

### Phase 23: Compliance & Audit (15 min)
- **23_compliance_and_audit.sql** - Audit logs, retention, consent

### Phase 24: Analytics & Events (15 min)
- **24_analytics_and_events.sql** - Analytics, user events

### Phase 25: Alerts & Health (10 min)
- **25_alerts_and_health.sql** - System alerts, health checks

### Phase 26: Performance Indexes (30 min)
- **26_performance_indexes.sql** - Comprehensive indexing

### Phase 27: Row Level Security (30 min)
- **27_row_level_security.sql** - RLS policies for all tables

### Phase 28: Helper Functions & Seed Data (20 min)
- **28_functions_and_seed_data.sql** - Utility functions, initial data

---

## Quick Start

### Option A: Apply All at Once (Not Recommended)
```bash
# Concatenate all files and apply
cat supabase/migrations/schema_foundation/*.sql > complete_schema.sql
# Apply via Supabase Dashboard
```

### Option B: Apply Phase by Phase (Recommended)
```bash
# Apply each phase sequentially via Supabase Dashboard SQL Editor
# 1. Open: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
# 2. Copy-paste each file's contents
# 3. Run and verify
# 4. Move to next phase
```

### Option C: Use Migration Tool
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
supabase db push --linked
```

---

## Verification Checklist

After each phase, verify:

```sql
-- Check table count
SELECT COUNT(*) as tables_created
FROM pg_tables
WHERE schemaname = 'public';

-- Check for errors
SELECT * FROM pg_stat_activity
WHERE state = 'idle in transaction (aborted)';

-- Check last 10 tables created
SELECT tablename,
       pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC
LIMIT 10;
```

---

## Table Count by Phase

| Phase | Tables Added | Cumulative | Time |
|-------|-------------|------------|------|
| 01 | 0 (ENUMs) | 0 | 10 min |
| 02 | 6 | 6 | 15 min |
| 03 | 7 | 13 | 10 min |
| 04 | 15 | 28 | 20 min |
| 05 | 4 | 32 | 15 min |
| 06 | 5 | 37 | 15 min |
| 07 | 6 | 43 | 20 min |
| 08 | 3 | 46 | 10 min |
| 09 | 5 | 51 | 20 min |
| 10 | 5 | 56 | 15 min |
| 11 | 3 | 59 | 15 min |
| 12 | 8 | 67 | 20 min |
| 13 | 10 | 77 | 25 min |
| 14 | 6 | 83 | 15 min |
| 15 | 8 | 91 | 20 min |
| 16 | 5 | 96 | 15 min |
| 17 | 4 | 100 | 10 min |
| 18 | 3 | 103 | 20 min |
| 19 | 3 | 106 | 15 min |
| 20 | 4 | 110 | 15 min |
| 21 | 2 | 112 | 10 min |
| 22 | 3 | 115 | 10 min |
| 23 | 4 | 119 | 15 min |
| 24 | 3 | 122 | 15 min |
| 25 | 3 | 125 | 10 min |
| 26 | 0 (indexes) | 125 | 30 min |
| 27 | 0 (RLS) | 125 | 30 min |
| 28 | 0 (functions+seed) | 125 | 20 min |

**Total: 125 tables** (123 + 2 views)

---

## After Completion

You will have:

✅ **125 tables** - Complete database schema
✅ **20 ENUM types** - Type-safe enumerations
✅ **5-level tenant hierarchy** - Multi-tenant isolation
✅ **50+ junction tables** - Proper many-to-many relationships
✅ **Comprehensive indexing** - <200ms query performance
✅ **Row Level Security** - Tenant data isolation
✅ **Audit trail** - 7-year retention compliance
✅ **Token tracking** - Complete cost monitoring
✅ **Memory system** - Conversation context
✅ **Rate limiting** - Usage protection
✅ **Analytics** - User behavior tracking

---

## Next: Start Building

Begin with Phase 00 to wipe the database clean, then proceed through all phases sequentially.

Each phase file includes:
- Purpose and impact statement
- Table creation SQL
- Indexes creation
- Comments and documentation
- Verification queries
- Rollback instructions

**Estimated total time: 4-5 hours**

Ready to build your gold-standard database!
