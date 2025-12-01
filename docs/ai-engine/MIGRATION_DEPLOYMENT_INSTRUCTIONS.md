# Ask Expert Migrations - Manual Deployment Instructions

**Status:** ⚠️ **NETWORK BLOCKED** - Requires Manual Deployment
**Date:** 2025-11-27

---

## Problem

All automated deployment methods are blocked by network connectivity:
- ❌ `psql` - Cannot resolve `db.bomltkhixeatxuoxmolq.supabase.co`
- ❌ `supabase db push` - No route to host (dial tcp error)
- ❌ Python psycopg2 - Same DNS resolution failure

## Solution: Manual Deployment via Supabase Dashboard

### Quick Option (Recommended): Single Consolidated File

**File:** `/Users/amine/Desktop/vital/supabase/migrations/DEPLOY_ALL_ASK_EXPERT_MIGRATIONS.sql`
**Size:** 247 lines (all 4 migrations combined)

**Steps:**
1. Open Supabase SQL Editor:
   👉 https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql/new

2. Copy the entire contents of:
   ```bash
   cat /Users/amine/Desktop/vital/supabase/migrations/DEPLOY_ALL_ASK_EXPERT_MIGRATIONS.sql
   ```

3. Paste into SQL Editor

4. Click **"Run"** button

5. Verify deployment (see verification section below)

---

### Alternative: Deploy Individual Migrations

If you prefer to deploy one at a time for easier debugging:

#### Migration 1: Enable RLS (Security Fix)
**File:** `20250127000002_enable_rls_agents_user_agents.sql`
**Priority:** CRITICAL

```bash
cat /Users/amine/Desktop/vital/supabase/migrations/20250127000002_enable_rls_agents_user_agents.sql
```

#### Migration 2: Core Tables (Sessions, Queries, Responses)
**File:** `20250127000003_create_ask_expert_core_tables.sql`
**Priority:** HIGH

```bash
cat /Users/amine/Desktop/vital/supabase/migrations/20250127000003_create_ask_expert_core_tables.sql
```

#### Migration 3: Panel Tables (Multi-Expert Features)
**File:** `20250127000004_create_expert_panel_tables.sql`
**Priority:** MEDIUM

```bash
cat /Users/amine/Desktop/vital/supabase/migrations/20250127000004_create_expert_panel_tables.sql
```

#### Migration 4: Performance Indexes
**File:** `20250127000005_add_performance_indexes.sql`
**Priority:** OPTIMIZATION

```bash
cat /Users/amine/Desktop/vital/supabase/migrations/20250127000005_add_performance_indexes.sql
```

---

## Verification

After deploying all migrations, run this verification query in the SQL Editor:

```sql
-- Check all tables exist with RLS enabled
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) AS policy_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'ask_expert%'
    OR tablename IN ('agents', 'user_agents')
  )
ORDER BY tablename;
```

**Expected Output:**

| tablename | rls_enabled | policy_count |
|-----------|-------------|--------------|
| agents | t | 4 |
| ask_expert_queries | t | 3 |
| ask_expert_sessions | t | 4 |
| expert_panel_responses | t | 2 |
| expert_panel_sessions | t | 2 |
| expert_query_responses | t | 2 |
| expert_workflow_executions | t | 2 |
| user_agents | t | 4 |

**Total:** 8 tables, all with RLS enabled

---

## What Gets Created

### Tables (6 new + 2 updated)

1. **ask_expert_sessions** - User consultation sessions
   - Tracks single/panel/workflow sessions
   - Links to user and tenant
   - Stores session context and metadata

2. **ask_expert_queries** - Individual queries within sessions
   - Full-text query storage
   - Query embeddings for semantic search
   - Intent analysis and complexity scores

3. **expert_query_responses** - Expert responses to queries
   - Links query → agent → response
   - Confidence scores and sources
   - Execution time tracking

4. **expert_panel_sessions** - Multi-expert panel sessions
   - Panel configuration (consensus strategy)
   - Status tracking (active/completed/failed)

5. **expert_panel_responses** - Individual expert panel responses
   - Multiple experts per panel
   - Vote weighting and confidence
   - Execution time per expert

6. **expert_workflow_executions** - Custom workflow tracking
   - Workflow definition (JSON steps)
   - Step-by-step execution tracking
   - Current step and results

7. **agents** - UPDATED with RLS enabled
8. **user_agents** - UPDATED with RLS enabled + 4 new policies

### Indexes (30+)

Performance indexes on:
- Tenant ID lookups
- User ID lookups
- Status filtering
- Timestamp sorting (created_at DESC)
- Agent tier and domain lookups
- Session → Query → Response joins

### RLS Policies (21 total)

- **user_agents:** 4 policies (select, insert, delete, service_role)
- **ask_expert_sessions:** 4 policies
- **ask_expert_queries:** 3 policies
- **expert_query_responses:** 2 policies
- **expert_panel_sessions:** 2 policies
- **expert_panel_responses:** 2 policies
- **expert_workflow_executions:** 2 policies

All policies enforce:
- ✅ User can only access their own data
- ✅ Service role has full access
- ✅ Multi-tenant isolation via tenant_id

---

## After Deployment

Once migrations are deployed successfully:

### 1. Test Ask Expert Endpoints

```bash
# Test health check
curl http://localhost:8000/v1/ai/ask-expert/health

# Test Mode 1: Single Expert
curl -X POST http://localhost:8000/v1/ai/ask-expert/unified \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "What are pediatric dosing considerations?",
    "mode": "single_expert",
    "expert_id": "expert_001",
    "tenant_id": "00000000-0000-0000-0000-000000000001"
  }'
```

### 2. Verify Data Persistence

Check that sessions are being saved:
```sql
SELECT * FROM ask_expert_sessions ORDER BY created_at DESC LIMIT 5;
```

### 3. Frontend Integration

Update frontend to call:
```typescript
const response = await fetch('/v1/ai/ask-expert/unified', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: userQuery,
    mode: 'single_expert',
    expert_id: selectedExpertId,
    tenant_id: currentTenantId
  })
});
```

---

## Troubleshooting

### Issue: "table already exists" error

**Solution:** Some tables may already exist. Migrations use `CREATE TABLE IF NOT EXISTS`, so this is safe to ignore.

### Issue: "policy already exists" error

**Solution:** Run this first to drop existing policies, then re-run migration:
```sql
DROP POLICY IF EXISTS "user_agents_select_own" ON user_agents;
DROP POLICY IF EXISTS "user_agents_insert_own" ON user_agents;
DROP POLICY IF EXISTS "user_agents_delete_own" ON user_agents;
DROP POLICY IF EXISTS "service_role_all_user_agents" ON user_agents;
```

### Issue: "relation does not exist" error

**Solution:** Deploy migrations in order (1 → 2 → 3 → 4). Migration 3 depends on tables from Migration 2.

---

## Network Connectivity (For Future Reference)

To fix network issues and enable automated deployment:

1. **Check VPN:** Disable VPN and retry
2. **Check DNS:** `nslookup db.bomltkhixeatxuoxmolq.supabase.co`
3. **Check Firewall:** Allow port 5432 outbound
4. **Use IPv4:** Add `--prefer-ipv4` flag to psql

Once network is fixed, you can use:
```bash
cd /Users/amine/Desktop/vital
supabase db push --db-url "$DATABASE_URL"
```

---

**Ready to deploy?** Start with the Quick Option above! 🚀
