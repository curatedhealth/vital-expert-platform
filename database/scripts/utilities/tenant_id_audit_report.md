# Tenant ID Audit Report

**Date:** Based on database query results  
**Total Tables with tenant_id:** 259

## Executive Summary

### ✅ Good News
- **100+ tables** have proper foreign key constraints to `tenants(id)`
- **100+ tables** have indexes on `tenant_id` columns
- Most critical tables (agents, JTBD, sessions) have proper constraints

### ⚠️ Issues Found

1. **Missing Foreign Key Constraints:** ~50+ tables
2. **Missing RLS (Row Level Security):** 5 tables identified
3. **Nullable tenant_id:** 50+ tables (may be intentional for some)

## Detailed Findings

### 1. Tables with Nullable tenant_id (50+ tables)

**Critical Tables (should probably be NOT NULL):**
- `agents` - Core agent table
- `conversations` - User conversations
- `jtbd`, `jtbd_core` - Core JTBD tables
- `org_functions`, `org_departments`, `org_roles` - Org structure
- `personas` - Persona definitions
- `knowledge_documents`, `knowledge_domains` - Knowledge base

**Potentially Acceptable (may be global/shared):**
- `agent_graphs`, `agent_workflows` - May be templates
- `domains`, `domain_*` - May be shared reference data
- `model_configurations` - May be global configs
- `node_library`, `node_collections` - May be shared templates

### 2. Tables Missing Foreign Key Constraints (~50+ tables)

**Critical Tables Missing FK:**
- `conversations` - User conversations
- `agent_sessions`, `agent_interaction_logs` - Agent activity
- `jtbd_core` - Core JTBD table
- `knowledge_documents`, `knowledge_sources` - Knowledge base
- `profiles` - User profiles
- `strategic_pillars` - Strategic planning
- `tenant_agents`, `tenant_apps`, `tenant_configurations` - Tenant config tables

**Backup/Deprecated Tables (can be ignored):**
- `agents_backup_pre_agentos2`
- `capabilities_backup_phase6`
- `jtbd_backup_*`, `jtbd_core_backup_*`
- `personas_backup_phase7`

**Views (expected - views don't have FK constraints):**
- `v_active_sessions`, `v_agent_complete`, etc.

### 3. Tables with Proper Foreign Key Constraints (100+ tables)

✅ These tables have proper FK constraints:
- Most JTBD-related tables (`jtbd_*`)
- Most agent-related tables (`agent_*`)
- Most organizational tables (`org_*`)
- Most persona tables (`persona_*`)
- Compliance tables (`gdpr_*`, `compliance_*`)
- Session tables (`ask_expert_sessions`, `mode3_sessions`)

### 4. Tables with Indexes on tenant_id (100+ indexes found)

✅ Good coverage of indexes:
- Most tables have at least one index on `tenant_id`
- Many have composite indexes (tenant_id + other columns)
- Some have partial indexes (WHERE clauses)

**Examples of good indexing:**
- `idx_agents_tenant` on `agents(tenant_id)`
- `idx_jtbd_tenant` on `jtbd(tenant_id)`
- `idx_analytics_events_tenant_timestamp` on `analytics_events(tenant_id, event_timestamp)`

### 5. Tables Without RLS Enabled (5 identified)

**Critical Security Issue:**
- `agent_sessions` - Agent session data
- `benefit_milestones` - Benefit tracking
- `personas` - Persona definitions
- `strategic_pillars` - Strategic planning
- `value_realization_tracking` - Value tracking

**Note:** This is only a sample (LIMIT 50). There may be more tables without RLS.

## Recommendations

### Priority 1: Add Missing Foreign Keys

**Critical Tables:**
```sql
-- Add FK to conversations
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add FK to agent_sessions
ALTER TABLE agent_sessions 
ADD CONSTRAINT fk_agent_sessions_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add FK to jtbd_core
ALTER TABLE jtbd_core 
ADD CONSTRAINT fk_jtbd_core_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add FK to knowledge_documents
ALTER TABLE knowledge_documents 
ADD CONSTRAINT fk_knowledge_documents_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Add FK to profiles
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- Add FK to strategic_pillars
ALTER TABLE strategic_pillars 
ADD CONSTRAINT fk_strategic_pillars_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
```

### Priority 2: Enable RLS on Critical Tables

```sql
-- Enable RLS
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_realization_tracking ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (example for agent_sessions)
CREATE POLICY agent_sessions_tenant_isolation 
ON agent_sessions FOR ALL
USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

### Priority 3: Review Nullable tenant_id Columns

**Decision needed for each table:**
- Should `agents.tenant_id` be NOT NULL? (probably yes)
- Should `conversations.tenant_id` be NOT NULL? (probably yes)
- Should `jtbd_core.tenant_id` be NOT NULL? (probably yes)
- Should `org_*` tables have NOT NULL? (probably yes)

**If making NOT NULL, need to:**
1. Backfill NULL values with a default tenant
2. Add NOT NULL constraint
3. Update application code to always set tenant_id

### Priority 4: Add Missing Indexes

Check if any high-traffic tables are missing indexes:
```sql
-- Check for tables without indexes (run diagnostic query)
-- Add indexes for frequently queried tables
```

## Migration Script

See `fix_tenant_id_issues.sql` for a comprehensive migration script.

## Next Steps

1. ✅ Review this report with team
2. ⏳ Create migration script for missing FKs
3. ⏳ Create migration script for RLS policies
4. ⏳ Plan data migration for nullable columns
5. ⏳ Test migrations on staging environment
6. ⏳ Apply to production

## Notes

- **Backup tables:** Consider archiving or removing backup tables after verification
- **Views:** Views don't need FK constraints, but should filter by tenant_id in their WHERE clauses
- **Performance:** Most tables already have indexes, which is good for query performance
