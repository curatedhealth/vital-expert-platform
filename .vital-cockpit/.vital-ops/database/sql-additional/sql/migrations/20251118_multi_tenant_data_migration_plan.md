# VITAL Platform Multi-Tenant Data Migration Plan
## Date: 2025-11-18
## Version: 1.0.0

---

## Executive Summary

This document outlines the comprehensive data migration strategy for transitioning VITAL platform from a single-tenant to a multi-tenant architecture with three distinct tenant applications.

### Tenant Configuration

| Tenant | Tenant ID | Purpose |
|--------|-----------|---------|
| **Platform** | `00000000-0000-0000-0000-000000000001` | Admin/multi-tenant management, shared resources |
| **Digital Health Startup** | `11111111-1111-1111-1111-111111111111` | Digital health focused tenant |
| **Pharmaceuticals** | `f7aa6fd4-0af9-4706-8b31-034f1f7accda` | Pharmaceutical industry tenant |

---

## Phase 1: Schema Analysis & Fixes

### 1.1 Schema Mismatches Identified

#### Issue #1: Tools Table - Missing `category` Column

**Problem:**
- API code (line 42 in `/api/tools-crud/route.ts`) queries `category` column
- Database schema has `category_id` UUID foreign key instead
- This causes 500 errors when loading tools

**Current Schema:**
```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES tool_categories(id),  -- Foreign key
  ...
)
```

**API Expectation:**
```typescript
// Line 42 in tools-crud/route.ts
category,  // Expects string column, not UUID
```

**Resolution Strategy:**
Two options:

**Option A: Add category column (Recommended)**
- Add `category` TEXT column for direct category name
- Maintain `category_id` for normalization
- Simpler API queries, better performance

**Option B: Fix API to use JOIN**
- Keep current schema
- Update API to JOIN with tool_categories
- More complex queries, worse performance

#### Issue #2: Missing/Renamed Tables

**Tables Referenced in Code but Need Verification:**

| Old/Expected Name | Actual Name | Status |
|-------------------|-------------|--------|
| `chat_messages` | `messages` | ✅ Exists, name mismatch in code |
| `business_functions` | Missing | ❌ Need to create |
| `departments` | Missing | ❌ Need to create (org_departments?) |
| `organizational_roles` | Missing | ❌ Need to create (organizational_levels?) |
| `prompts` | Exists | ✅ Schema complete |
| `knowledge_domains` | Exists | ✅ Schema complete |
| `knowledge_sources` | Exists | ✅ Schema complete |
| `knowledge_base` | Exists | ✅ Schema complete |

---

## Phase 2: Data Classification

### 2.1 Platform-Level Data (Shared Across Tenants)

**Tenant ID: `00000000-0000-0000-0000-000000000001`**

Data that should be available to all tenants:

```sql
-- 1. Core System Agents (Tier 1 & Tier 2)
-- Examples: Chief Medical Officer, Research Director, Cardiologist
SELECT * FROM agents WHERE tenant_id IS NULL OR tier IN ('tier_1', 'tier_2');

-- 2. Tool Definitions (NOT assignments)
SELECT * FROM tools WHERE tenant_id IS NULL;

-- 3. Tool Categories
SELECT * FROM tool_categories;

-- 4. Knowledge Domains (Healthcare standards)
SELECT * FROM knowledge_domains;

-- 5. System Prompts (Reusable templates)
SELECT * FROM prompts WHERE created_by IS NULL OR is_system_prompt = true;
```

### 2.2 Tenant-Specific Data

**Digital Health Startup (`11111111-1111-1111-1111-111111111111`)**
- Digital health focused agents
- Digital health knowledge base chunks
- Digital health prompts (DiMe, ICHOM, etc.)
- User-created agents and conversations
- Tenant-specific tool assignments

**Pharmaceuticals (`f7aa6fd4-0af9-4706-8b31-034f1f7accda`)**
- Pharma regulatory agents
- Clinical trial focused knowledge
- PRISM suite prompts
- User-created agents and conversations
- Tenant-specific tool assignments

---

## Phase 3: Migration Strategy

### 3.1 Pre-Migration Checklist

```bash
# 1. Backup current database
pg_dump -h $SUPABASE_HOST -U postgres -d postgres > vital_backup_20251118.sql

# 2. Export current data counts
psql -h $SUPABASE_HOST -U postgres -d postgres -f /path/to/000_pre_migration_counts.sql

# 3. Verify tenant IDs exist
psql -h $SUPABASE_HOST -U postgres -d postgres -c "SELECT id, name, slug FROM tenants ORDER BY created_at;"
```

### 3.2 Migration Sequence

**Order is critical to maintain referential integrity:**

```
1. Schema Fixes (001_schema_fixes.sql)
   ├── Add missing columns to tools table
   ├── Create missing organizational tables
   └── Add tenant_id where missing

2. Tenant Setup (002_tenant_setup.sql)
   ├── Ensure all 3 tenants exist
   ├── Configure tenant settings
   └── Validate tenant configurations

3. Platform Data Migration (003_platform_data_migration.sql)
   ├── Migrate shared agents to platform tenant
   ├── Migrate tool definitions
   ├── Migrate knowledge domains
   └── Migrate system prompts

4. Tenant Data Migration (004_tenant_data_migration.sql)
   ├── Assign existing data to Digital Health
   ├── Create Pharma-specific data
   └── Set up tenant-specific tool assignments

5. Data Validation (005_validation.sql)
   ├── Verify all data has tenant_id
   ├── Check referential integrity
   ├── Validate data counts
   └── Test API queries

6. RLS Policies Update (006_rls_policies.sql)
   ├── Update Row-Level Security policies
   ├── Test tenant isolation
   └── Verify cross-tenant access restrictions
```

---

## Phase 4: ETL Pipeline Design

### 4.1 Data Transformation Rules

#### Tools Migration

```typescript
// Transformation logic for tools
interface ToolTransformation {
  // BEFORE: No tenant_id, category_id only
  // AFTER: tenant_id = platform, category column added

  transformTool(oldTool: OldTool): NewTool {
    return {
      ...oldTool,
      tenant_id: PLATFORM_TENANT_ID, // Shared tools
      category: getCategoryNameById(oldTool.category_id), // Add category name
      // Keep category_id for normalization
    };
  }
}
```

#### Prompts Migration

```typescript
interface PromptTransformation {
  transformPrompt(oldPrompt: OldPrompt): NewPrompt {
    // Determine tenant based on domain/suite
    const tenant_id = classifyPromptTenant(oldPrompt);

    return {
      ...oldPrompt,
      tenant_id,
      // Enrich with suite information
      suite: mapDomainToSuite(oldPrompt.domain),
    };
  }
}

function classifyPromptTenant(prompt: OldPrompt): string {
  // PRISM suite prompts → Pharma tenant
  if (prompt.name.includes('PRISM') ||
      prompt.domain in ['regulatory_affairs', 'clinical_research', 'pharmacovigilance']) {
    return PHARMA_TENANT_ID;
  }

  // Digital health prompts → Digital Health tenant
  if (prompt.domain in ['digital_health', 'digital_medicine']) {
    return DIGITAL_HEALTH_TENANT_ID;
  }

  // System prompts → Platform
  if (prompt.created_by === null || prompt.is_system_prompt) {
    return PLATFORM_TENANT_ID;
  }

  // Default to Digital Health (existing data)
  return DIGITAL_HEALTH_TENANT_ID;
}
```

#### Knowledge Base Migration

```typescript
interface KnowledgeTransformation {
  transformKnowledge(chunk: KnowledgeChunk): NewKnowledgeChunk {
    const tenant_id = classifyKnowledgeTenant(chunk);

    return {
      ...chunk,
      tenant_id,
      tags: [...chunk.tags, getTenantTag(tenant_id)],
    };
  }
}

function classifyKnowledgeTenant(chunk: KnowledgeChunk): string {
  // Check domain and tags
  if (chunk.domain === 'digital_health' ||
      chunk.tags.includes('digital_medicine')) {
    return DIGITAL_HEALTH_TENANT_ID;
  }

  if (chunk.domain in ['regulatory', 'clinical_trials', 'pharmacovigilance']) {
    return PHARMA_TENANT_ID;
  }

  // Shared knowledge → Platform
  if (chunk.domain in ['general_medicine', 'healthcare_standards']) {
    return PLATFORM_TENANT_ID;
  }

  return DIGITAL_HEALTH_TENANT_ID;
}
```

#### Agents Migration

```typescript
interface AgentTransformation {
  transformAgent(agent: Agent): NewAgent {
    // Tier 1 & 2 → Platform (shared)
    if (agent.tier in ['tier_1', 'tier_2']) {
      return {
        ...agent,
        tenant_id: PLATFORM_TENANT_ID,
      };
    }

    // Tier 3 (specialized) → Tenant-specific
    const tenant_id = classifyAgentTenant(agent);

    return {
      ...agent,
      tenant_id,
    };
  }
}

function classifyAgentTenant(agent: Agent): string {
  // Check knowledge domains
  const digitalHealthDomains = ['digital_health', 'telemedicine', 'wearables'];
  const pharmaDomains = ['regulatory_affairs', 'clinical_trials', 'pharmacovigilance'];

  if (agent.knowledge_domains.some(d => digitalHealthDomains.includes(d))) {
    return DIGITAL_HEALTH_TENANT_ID;
  }

  if (agent.knowledge_domains.some(d => pharmaDomains.includes(d))) {
    return PHARMA_TENANT_ID;
  }

  // Default: Digital Health (existing data)
  return DIGITAL_HEALTH_TENANT_ID;
}
```

### 4.2 Data Validation Rules

```sql
-- Validation queries to run after each migration phase

-- 1. Verify all records have tenant_id
SELECT
  'agents' as table_name,
  COUNT(*) as total_records,
  COUNT(tenant_id) as with_tenant_id,
  COUNT(*) - COUNT(tenant_id) as missing_tenant_id
FROM agents
UNION ALL
SELECT 'tools', COUNT(*), COUNT(tenant_id), COUNT(*) - COUNT(tenant_id) FROM tools
UNION ALL
SELECT 'prompts', COUNT(*), COUNT(tenant_id), COUNT(*) - COUNT(tenant_id) FROM prompts
UNION ALL
SELECT 'knowledge_base', COUNT(*), COUNT(tenant_id), COUNT(*) - COUNT(tenant_id) FROM knowledge_base;

-- 2. Verify referential integrity
SELECT
  a.id,
  a.name,
  a.tenant_id,
  t.name as tenant_name
FROM agents a
LEFT JOIN tenants t ON a.tenant_id = t.id
WHERE a.tenant_id IS NOT NULL AND t.id IS NULL;

-- 3. Verify tenant distribution
SELECT
  t.name as tenant,
  COUNT(DISTINCT a.id) as agents,
  COUNT(DISTINCT p.id) as prompts,
  COUNT(DISTINCT kb.id) as knowledge_chunks,
  COUNT(DISTINCT tl.id) as tools
FROM tenants t
LEFT JOIN agents a ON a.tenant_id = t.id
LEFT JOIN prompts p ON p.tenant_id = t.id
LEFT JOIN knowledge_base kb ON kb.tenant_id = t.id
LEFT JOIN tools tl ON tl.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY t.created_at;
```

---

## Phase 5: Rollback Strategy

### 5.1 Rollback Points

Each migration script creates a rollback point:

```sql
-- At start of each migration
BEGIN;
SAVEPOINT pre_migration_<name>;

-- ... migration SQL ...

-- If error occurs:
ROLLBACK TO SAVEPOINT pre_migration_<name>;

-- If successful:
COMMIT;
```

### 5.2 Full Rollback Procedure

```bash
# 1. Stop all applications
pm2 stop all

# 2. Restore from backup
psql -h $SUPABASE_HOST -U postgres -d postgres < vital_backup_20251118.sql

# 3. Verify restoration
psql -h $SUPABASE_HOST -U postgres -d postgres -f /path/to/000_pre_migration_counts.sql

# 4. Compare counts
diff pre_migration_counts.txt post_rollback_counts.txt

# 5. Restart applications
pm2 start all
```

---

## Phase 6: Testing Plan

### 6.1 Pre-Migration Tests

```bash
# Test API endpoints BEFORE migration
curl http://localhost:3000/api/tools-crud
curl http://localhost:3000/api/prompts-crud
curl http://localhost:3000/api/knowledge-domains
curl http://localhost:3000/api/business-functions
```

### 6.2 Post-Migration Tests

```bash
# Test tenant isolation
curl -H "x-tenant-id: 11111111-1111-1111-1111-111111111111" \
  http://localhost:3000/api/tools-crud

curl -H "x-tenant-id: f7aa6fd4-0af9-4706-8b31-034f1f7accda" \
  http://localhost:3000/api/tools-crud

# Test shared data access
curl -H "x-tenant-id: 11111111-1111-1111-1111-111111111111" \
  http://localhost:3000/api/tools-crud?showAll=true

# Test data loading
curl http://localhost:3000/api/prompts-crud?tenantId=<tenant_id>
curl http://localhost:3000/api/knowledge-domains
```

### 6.3 Data Quality Checks

```sql
-- 1. Check for orphaned records
SELECT COUNT(*) FROM agent_tool_assignments ata
LEFT JOIN agents a ON ata.agent_id = a.id
WHERE a.id IS NULL;

-- 2. Check for duplicate data
SELECT name, tenant_id, COUNT(*)
FROM prompts
GROUP BY name, tenant_id
HAVING COUNT(*) > 1;

-- 3. Check tenant isolation (should return 0)
SELECT COUNT(*) FROM agents a1
JOIN agents a2 ON a1.id = a2.id AND a1.tenant_id != a2.tenant_id;

-- 4. Verify category consistency
SELECT
  t.id,
  t.name,
  t.category,
  tc.name as category_from_id
FROM tools t
LEFT JOIN tool_categories tc ON t.category_id = tc.id
WHERE t.category IS NOT NULL AND t.category != tc.name;
```

---

## Phase 7: Performance Considerations

### 7.1 Index Strategy

```sql
-- Ensure tenant_id indexes exist on all tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_tenant_id
  ON agents(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prompts_tenant_id
  ON prompts(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_base_tenant_id
  ON knowledge_base(tenant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tools_tenant_id
  ON tools(tenant_id);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prompts_tenant_domain
  ON prompts(tenant_id, domain);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_tenant_tier
  ON agents(tenant_id, tier, status);
```

### 7.2 Query Optimization

```sql
-- BEFORE: Full table scan
SELECT * FROM tools WHERE category = 'Evidence Research';

-- AFTER: Use category_id with index
SELECT t.*
FROM tools t
JOIN tool_categories tc ON t.category_id = tc.id
WHERE tc.name = 'Evidence Research'
  AND t.tenant_id = $1;

-- BETTER: Add category column (recommended)
SELECT * FROM tools
WHERE category = 'Evidence Research'
  AND tenant_id = $1;
-- Uses: idx_tools_tenant_category
```

---

## Phase 8: Monitoring & Observability

### 8.1 Migration Metrics

```sql
-- Track migration progress
CREATE TABLE migration_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log migration events
INSERT INTO migration_metrics (migration_name, phase, records_processed)
VALUES ('tenant_data_migration', 'agents', 150);
```

### 8.2 Health Checks

```typescript
// Health check endpoint
export async function GET() {
  const healthChecks = {
    database: await checkDatabaseConnection(),
    tenants: await checkTenantData(),
    referentialIntegrity: await checkReferentialIntegrity(),
    apiEndpoints: await checkAPIEndpoints(),
  };

  return NextResponse.json(healthChecks);
}

async function checkTenantData() {
  const results = await db.query(`
    SELECT
      t.id,
      t.name,
      COUNT(DISTINCT a.id) as agent_count,
      COUNT(DISTINCT p.id) as prompt_count,
      COUNT(DISTINCT kb.id) as knowledge_count
    FROM tenants t
    LEFT JOIN agents a ON a.tenant_id = t.id
    LEFT JOIN prompts p ON p.tenant_id = t.id
    LEFT JOIN knowledge_base kb ON kb.tenant_id = t.id
    WHERE t.id IN (
      '00000000-0000-0000-0000-000000000001',
      '11111111-1111-1111-1111-111111111111',
      'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
    )
    GROUP BY t.id, t.name
  `);

  return {
    status: results.rows.length === 3 ? 'healthy' : 'degraded',
    tenants: results.rows,
  };
}
```

---

## Phase 9: Communication Plan

### 9.1 Stakeholder Communication

**Before Migration:**
- [ ] Notify all users of maintenance window
- [ ] Update status page
- [ ] Send email notifications

**During Migration:**
- [ ] Real-time updates on status page
- [ ] Slack/Teams notifications for milestone completion
- [ ] Error alerts to engineering team

**After Migration:**
- [ ] Success notification
- [ ] Data migration summary report
- [ ] Known issues and workarounds

### 9.2 Documentation Updates

- [ ] Update API documentation with tenant_id requirements
- [ ] Update database schema documentation
- [ ] Create tenant onboarding guide
- [ ] Update troubleshooting guides

---

## Phase 10: Success Criteria

### 10.1 Must-Have (Blocking)

✅ **Data Integrity**
- All existing data preserved
- No data loss
- All relationships maintained

✅ **Tenant Isolation**
- Each tenant can only access their own data
- Platform tenant data accessible to all
- RLS policies enforced

✅ **API Functionality**
- All existing API endpoints work
- No 500 errors
- Proper tenant filtering

✅ **Schema Consistency**
- All tables have tenant_id
- No orphaned records
- Referential integrity maintained

### 10.2 Should-Have (Important)

⚠️ **Performance**
- Query response times < 200ms
- Index coverage > 95%
- No full table scans

⚠️ **Data Quality**
- Proper categorization of shared vs tenant data
- Accurate tenant assignments
- Complete data migration

### 10.3 Nice-to-Have (Optional)

💡 **Enhancements**
- Analytics dashboard for tenant usage
- Automated data quality monitoring
- Tenant data export functionality

---

## Next Steps

1. **Review this plan** with vital-platform-orchestrator
2. **Execute migration scripts** in sequence (001-006)
3. **Run validation tests** after each phase
4. **Monitor application health** for 24 hours post-migration
5. **Document lessons learned** for future migrations

---

## Appendix: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loss during migration | Low | Critical | Full backup before migration, transaction-based migration |
| Schema conflicts | Medium | High | Pre-migration schema validation, rollback plan |
| API downtime > 1 hour | Low | High | Staged rollout, health checks, fast rollback |
| Incorrect tenant assignment | Medium | Medium | Validation queries, manual review of edge cases |
| Performance degradation | Medium | Medium | Index optimization, query tuning, load testing |
| Orphaned records | Low | Low | Referential integrity checks, cleanup scripts |

---

**Document Prepared By:** VITAL Data Strategist Agent
**Review Required:** vital-platform-orchestrator
**Execution Date:** TBD (Coordinated with platform team)
