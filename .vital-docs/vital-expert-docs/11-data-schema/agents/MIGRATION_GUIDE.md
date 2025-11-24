# VITAL Platform - Agent Data Architecture Migration Guide

**Version:** 1.0
**Date:** 2025-11-23
**Owner:** VITAL Data Strategist Agent

---

## Overview

This guide walks through the complete migration from incorrect TypeScript types to the correct agent data architecture, ensuring type safety, query correctness, and HIPAA compliance.

### What We're Fixing

**Problem:**
- TypeScript types claim `display_name` and `tier` are database columns
- They're actually stored in `metadata` JSONB column
- Frontend queries fail with 500 errors when selecting these "columns"

**Solution:**
- Update TypeScript types to match actual database schema
- Transform database rows to application models with computed fields
- Create JSONB indexes for optimal query performance
- Implement materialized views for easier querying

---

## Prerequisites

Before starting the migration:

1. ✅ **Backup database**
   ```bash
   pg_dump $DATABASE_URL > /path/to/backups/agents_pre_migration_$(date +%Y%m%d_%H%M%S).sql
   ```

2. ✅ **Test on staging environment first**

3. ✅ **Review actual database schema**
   ```bash
   psql $DATABASE_URL -c "\d agents"
   ```

4. ✅ **Check existing metadata**
   ```sql
   SELECT
     COUNT(*) as total_agents,
     COUNT(metadata->>'displayName') as has_display_name,
     COUNT(metadata->>'tier') as has_tier,
     COUNT(metadata->'tags') as has_tags
   FROM agents WHERE deleted_at IS NULL;
   ```

---

## Migration Steps

### Phase 1: Database Schema Updates (Week 1)

#### 1.1 Create JSONB Indexes

**File:** `001_create_metadata_indexes.sql`

```bash
# Apply migration
psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/migrations/001_create_metadata_indexes.sql
```

**What it does:**
- Creates expression indexes on metadata fields (displayName, tier, tags)
- Creates GIN indexes for full-text search
- Creates composite indexes for common query patterns

**Validation:**
```sql
-- Verify indexes created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'agents'
  AND indexname LIKE 'idx_agents_metadata%';
```

#### 1.2 Backfill Agent Metadata

**File:** `002_backfill_agent_metadata.sql`

**CRITICAL:** Review this file before running. It modifies data.

```bash
# Dry run: Review what will change
psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/migrations/002_backfill_agent_metadata.sql --echo-all --single-transaction --dry-run

# Apply migration (if dry run looks good)
psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/migrations/002_backfill_agent_metadata.sql
```

**What it does:**
- Initializes empty metadata for agents with NULL
- Adds `displayName` from `name` if missing
- Maps `expertise_level` to `tier`
- Auto-tags based on `function_name` and `department_name`
- Assigns tier-based colors
- Backfills AI config (contextWindow, costPerQuery)
- Sets HIPAA compliance flags based on tags
- Initializes feature flags (ragEnabled, verifyEnabled)

**Validation:**
```sql
-- Check metadata completeness
SELECT
  COUNT(*) as total_agents,
  COUNT(*) FILTER (WHERE metadata->>'displayName' IS NOT NULL) as has_display_name,
  COUNT(*) FILTER (WHERE metadata->>'tier' IS NOT NULL) as has_tier,
  COUNT(*) FILTER (WHERE metadata ? 'tags') as has_tags,
  COUNT(*) FILTER (WHERE metadata->>'schemaVersion' = '1.0') as has_schema_version
FROM agents WHERE deleted_at IS NULL;
```

#### 1.3 Create Enriched View

**File:** `v_agents_enriched.sql`

```bash
# Apply migration
psql $DATABASE_URL -f .vital-docs/vital-expert-docs/11-data-schema/agents/views/v_agents_enriched.sql
```

**What it does:**
- Creates materialized view with computed metadata fields
- Adds indexes for optimal query performance
- Sets up auto-refresh triggers

**Validation:**
```sql
-- Test the view
SELECT id, display_name, tier, tags, color
FROM v_agents_enriched
WHERE status = 'active'
ORDER BY tier DESC, display_name
LIMIT 10;
```

---

### Phase 2: TypeScript Updates (Week 1-2)

#### 2.1 Install Dependencies

```bash
cd apps/vital-system
npm install zod  # For runtime validation
```

#### 2.2 Copy Utility Files

Copy these files to your TypeScript source:

```bash
# Create utils directory
mkdir -p src/lib/agents/

# Copy metadata schema
cp .vital-docs/vital-expert-docs/11-data-schema/agents/utils/agent-metadata.schema.ts \
   src/lib/agents/

# Copy data transformer
cp .vital-docs/vital-expert-docs/11-data-schema/agents/utils/agent-data-transformer.ts \
   src/lib/agents/
```

#### 2.3 Update Database Types

**File:** `src/types/database.types.ts`

Find the `agents` table definition and ensure it matches:

```typescript
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          // Core Identity
          id: string;
          tenant_id: string | null;
          name: string;
          slug: string;

          // ... (all other columns from actual schema)

          // Metadata (JSONB - NOT individual columns!)
          metadata: Json;  // ⚠️ This is the ONLY place for metadata

          // NO display_name column!
          // NO tier column!
          // NO tags column!
        }
      }
    }
  }
}
```

**Remove these if they exist:**
```typescript
// ❌ DELETE THESE (they don't exist in database!)
display_name: string;
tier: number;
tags: string[];
```

#### 2.4 Update Agent Service

**File:** `src/features/agents/services/agent-service.ts`

```typescript
import { transformAgentRow } from '@/lib/agents/agent-data-transformer';
import type { Agent, AgentRow } from '@/lib/agents/agent-data-transformer';

export class AgentService {
  async getActiveAgents(showAll: boolean = false): Promise<Agent[]> {
    // Query database (raw rows)
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .in('status', ['active', 'testing'])
      .order('name');

    if (error) throw error;

    // ✅ TRANSFORM: Convert raw rows to application models
    return data.map(transformAgentRow);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // ✅ TRANSFORM
    return transformAgentRow(data);
  }
}
```

#### 2.5 Update API Routes

**Pattern for all `/api/agents/*` routes:**

```typescript
// ❌ OLD (WRONG - queries non-existent columns)
const { data } = await supabase
  .from('agents')
  .select('*, display_name, tier')  // ❌ These don't exist!
  .eq('tier', 3);

// ✅ NEW (CORRECT - query metadata with JSONB operators)
const { data: rawData } = await supabase
  .from('agents')
  .select('*')
  .eq('metadata->tier', 3);  // ✅ JSONB operator

// Transform to add computed fields
const agents = rawData.map(transformAgentRow);

return Response.json({ agents });
```

**Or use the enriched view (easier):**

```typescript
// ✅ BEST: Use materialized view (no JSONB operators needed)
const { data } = await supabase
  .from('v_agents_enriched')
  .select('*')
  .eq('tier', 3)  // ✅ Direct column (computed from metadata)
  .eq('status', 'active');

return Response.json({ agents: data });
```

---

### Phase 3: Frontend Updates (Week 2)

#### 3.1 Update Component Types

```typescript
// ❌ OLD
import type { Agent } from '@/types/database.types';  // Wrong type

// ✅ NEW
import type { Agent } from '@/lib/agents/agent-data-transformer';
```

#### 3.2 Update Agent Display

```typescript
// Agent display component
export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div>
      {/* ✅ Use computed fields directly */}
      <h3>{agent.display_name}</h3>
      <span className="badge" style={{ backgroundColor: agent.color }}>
        Tier {agent.tier}
      </span>
      <div className="tags">
        {agent.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
      </div>
    </div>
  );
}
```

#### 3.3 Update Filters

```typescript
import { AgentFilters } from '@/lib/agents/agent-data-transformer';

// ✅ Use helper functions
const tier3Agents = AgentFilters.filterByTier(agents, 3);
const hipaaAgents = AgentFilters.filterHipaaCompliant(agents);
const clinicalAgents = AgentFilters.filterByTags(agents, ['clinical']);
```

---

### Phase 4: Testing & Validation (Week 2-3)

#### 4.1 Unit Tests

Create `src/lib/agents/__tests__/agent-data-transformer.test.ts`:

```typescript
import { transformAgentRow, parseMetadata } from '../agent-data-transformer';

describe('transformAgentRow', () => {
  it('should extract display_name from metadata', () => {
    const row = {
      id: '123',
      name: 'test-agent',
      metadata: { displayName: 'Test Agent' },
      // ... other fields
    };

    const agent = transformAgentRow(row);
    expect(agent.display_name).toBe('Test Agent');
  });

  it('should fallback to name if displayName missing', () => {
    const row = {
      id: '123',
      name: 'test-agent',
      metadata: {},
      // ... other fields
    };

    const agent = transformAgentRow(row);
    expect(agent.display_name).toBe('test-agent');
  });

  it('should default tier to 1 if not specified', () => {
    const row = {
      id: '123',
      name: 'test-agent',
      metadata: {},
      // ... other fields
    };

    const agent = transformAgentRow(row);
    expect(agent.tier).toBe(1);
  });
});
```

#### 4.2 Integration Tests

Test actual database queries:

```typescript
describe('Agent API', () => {
  it('should return agents with computed fields', async () => {
    const response = await fetch('/api/agents-crud');
    const { agents } = await response.json();

    expect(agents[0]).toHaveProperty('display_name');
    expect(agents[0]).toHaveProperty('tier');
    expect(agents[0]).toHaveProperty('tags');
    expect(agents[0].tier).toBeGreaterThanOrEqual(1);
    expect(agents[0].tier).toBeLessThanOrEqual(3);
  });

  it('should filter by tier correctly', async () => {
    const response = await fetch('/api/agents-crud?tier=3');
    const { agents } = await response.json();

    agents.forEach(agent => {
      expect(agent.tier).toBe(3);
    });
  });
});
```

#### 4.3 Query Performance Tests

```sql
-- Compare query performance (before/after indexes)
EXPLAIN ANALYZE
SELECT * FROM agents
WHERE metadata->>'tier' = '3'
  AND metadata->>'hipaaCompliant' = 'true';

-- Expected: Index scan, not sequential scan
```

---

### Phase 5: Deployment (Week 3)

#### 5.1 Staging Deployment

1. **Apply migrations to staging database**
2. **Deploy code changes to staging**
3. **Run smoke tests**
4. **Monitor error logs for 24 hours**

#### 5.2 Production Deployment

**Deployment Checklist:**

- [ ] Database backup completed
- [ ] Staging tests passed
- [ ] Code review approved
- [ ] Deployment window scheduled (low traffic)
- [ ] Rollback plan ready

**Deployment Steps:**

```bash
# 1. Backup production database
pg_dump $PROD_DATABASE_URL > prod_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply database migrations
psql $PROD_DATABASE_URL -f 001_create_metadata_indexes.sql
psql $PROD_DATABASE_URL -f 002_backfill_agent_metadata.sql
psql $PROD_DATABASE_URL -f v_agents_enriched.sql

# 3. Deploy application code
git push production main

# 4. Refresh materialized view
psql $PROD_DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;"

# 5. Monitor logs
# Check for errors in API responses
# Monitor database query performance
```

#### 5.3 Rollback Plan

If issues occur:

```bash
# 1. Revert application code
git revert <commit-hash>
git push production main

# 2. Restore database from backup (if needed)
psql $PROD_DATABASE_URL < prod_backup_YYYYMMDD_HHMMSS.sql

# 3. Drop new indexes (if they cause issues)
psql $PROD_DATABASE_URL -c "
DROP INDEX CONCURRENTLY IF EXISTS idx_agents_metadata_display_name;
DROP INDEX CONCURRENTLY IF EXISTS idx_agents_metadata_tier;
DROP INDEX CONCURRENTLY IF EXISTS idx_agents_metadata_tags;
DROP MATERIALIZED VIEW IF EXISTS v_agents_enriched;
"
```

---

## Validation Checklist

After migration, verify:

### Database Validation

- [ ] All agents have `metadata` JSONB column populated
- [ ] All agents have `schemaVersion: '1.0'` in metadata
- [ ] All agents have `displayName` or fallback to `name`
- [ ] All agents have `tier` (1, 2, or 3)
- [ ] JSONB indexes exist and are being used (check `EXPLAIN ANALYZE`)
- [ ] Materialized view `v_agents_enriched` exists and is populated

```sql
-- Run validation queries
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE metadata->>'displayName' IS NOT NULL) as has_display_name,
  COUNT(*) FILTER (WHERE metadata->>'tier' IS NOT NULL) as has_tier,
  COUNT(*) FILTER (WHERE metadata->>'schemaVersion' = '1.0') as has_version
FROM agents WHERE deleted_at IS NULL;
```

### Application Validation

- [ ] TypeScript types match database schema (no `display_name` as column)
- [ ] All API routes use `transformAgentRow()` or enriched view
- [ ] Frontend components render `agent.display_name` correctly
- [ ] Filtering by tier works correctly
- [ ] Searching by display name works correctly
- [ ] No 500 errors when querying agents

### Performance Validation

- [ ] Query performance improved (check slow query logs)
- [ ] JSONB queries use indexes (verify with `EXPLAIN ANALYZE`)
- [ ] Materialized view queries are fast
- [ ] No N+1 query issues

---

## Common Issues & Solutions

### Issue 1: Query Still Fails with "Column display_name does not exist"

**Cause:** Code is still querying `display_name` as a column

**Solution:**
```typescript
// ❌ WRONG
.select('id, name, display_name')  // display_name doesn't exist!

// ✅ CORRECT
.select('*')  // Get all columns, transform later
```

### Issue 2: Metadata is NULL or Empty

**Cause:** Migration script didn't run or failed

**Solution:**
```sql
-- Check if metadata is populated
SELECT COUNT(*) FROM agents WHERE metadata IS NULL OR metadata = '{}'::jsonb;

-- Re-run backfill migration
\i 002_backfill_agent_metadata.sql
```

### Issue 3: JSONB Queries are Slow

**Cause:** Indexes not created or not being used

**Solution:**
```sql
-- Verify indexes exist
\di agents

-- Force index usage
SET enable_seqscan = OFF;

-- Re-analyze table
ANALYZE agents;
```

### Issue 4: Materialized View is Stale

**Cause:** View not refreshed after agent updates

**Solution:**
```sql
-- Refresh manually
REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;

-- Or set up automatic refresh (use pg_cron or app-level trigger)
```

---

## Maintenance & Best Practices

### Daily/Weekly Tasks

1. **Refresh materialized view** (if not auto-refreshing)
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY v_agents_enriched;
   ```

2. **Monitor index usage**
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
   FROM pg_stat_user_indexes
   WHERE tablename = 'agents'
   ORDER BY idx_scan DESC;
   ```

3. **Check for missing metadata**
   ```sql
   SELECT id, name FROM agents
   WHERE deleted_at IS NULL
     AND (metadata->>'displayName' IS NULL OR metadata->>'tier' IS NULL);
   ```

### Monthly Tasks

1. **Reindex JSONB indexes** (if fragmented)
   ```sql
   REINDEX INDEX CONCURRENTLY idx_agents_metadata_display_name;
   REINDEX INDEX CONCURRENTLY idx_agents_metadata_tier;
   REINDEX INDEX CONCURRENTLY idx_agents_metadata_tags;
   ```

2. **Vacuum analyze**
   ```sql
   VACUUM ANALYZE agents;
   ```

3. **Review metadata schema versions**
   ```sql
   SELECT metadata->>'schemaVersion', COUNT(*)
   FROM agents
   GROUP BY metadata->>'schemaVersion';
   ```

### Best Practices

1. **Always use transformation layer**
   - Don't bypass `transformAgentRow()`
   - Consistent data shape across app

2. **Use enriched view for complex queries**
   - Faster than JSONB operators
   - Easier to read and maintain

3. **Validate metadata on insert/update**
   - Use Zod schema validation
   - Prevent invalid data

4. **Keep metadata lightweight**
   - Use columns for frequently queried data
   - Use metadata for flexible/experimental fields

5. **Document metadata changes**
   - Update `AgentMetadata` interface
   - Update Zod schema
   - Increment `schemaVersion`

---

## Support & Resources

- **Architecture Document:** `AGENT_DATA_ARCHITECTURE.md`
- **Metadata Schema:** `utils/agent-metadata.schema.ts`
- **Data Transformer:** `utils/agent-data-transformer.ts`
- **Migrations:** `migrations/`
- **Views:** `views/`

**Questions?** Contact the VITAL Data Strategist Agent or Platform Orchestrator.

---

**Migration Guide Version:** 1.0
**Last Updated:** 2025-11-23
**Next Review:** 2025-12-23
