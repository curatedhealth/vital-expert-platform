# 🚀 Post-Migration Guide - VITAL.expert

## Overview

This guide helps you complete the post-migration tasks after successfully applying all 8 parts of the gold-standard schema migration.

**Migration Status**: ✅ Complete (Parts 1-8 applied)

---

## Quick Start Checklist

- [ ] 1. Verify migration success
- [ ] 2. Configure RLS policies
- [ ] 3. Import production data
- [ ] 4. Test API endpoints
- [ ] 5. Monitor performance

---

## 1. Verify Migration (Optional but Recommended)

### Via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste queries from [verify_migration.sql](supabase/migrations/verify_migration.sql)
4. Run each query and verify results

### Key Verification Queries

```sql
-- Check total tables (Expected: ~123)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check total indexes (Expected: ~237+)
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';

-- Check data counts (if data already exists)
SELECT
  (SELECT COUNT(*) FROM agents) as agents,
  (SELECT COUNT(*) FROM personas) as personas,
  (SELECT COUNT(*) FROM jobs_to_be_done) as jtbds;
```

### Expected Results

✅ **~123 tables** created
✅ **~237+ indexes** for performance
✅ **20 ENUM types** for type safety
✅ **All core tables exist**: agents, personas, jobs_to_be_done, workflows, tasks, etc.

---

## 2. Configure RLS Policies (Recommended)

### Why RLS?

Row Level Security ensures tenant data isolation and prevents unauthorized access to data.

### Apply RLS Policies

1. Go to https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
2. Navigate to **SQL Editor** → **New Query**
3. Copy [configure_rls_policies.sql](supabase/migrations/configure_rls_policies.sql)
4. Review policies before applying (customize if needed)
5. Click **Run** to apply

### What Gets Enabled

- ✅ Tenant isolation on multi-tenant tables
- ✅ User access control (users can only view their own data)
- ✅ Role-based permissions (admin, user, viewer)
- ✅ Public/private content separation

### Test RLS

```sql
-- Test as authenticated user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '<user-id>';

-- Should only return user's tenant
SELECT * FROM tenants;

-- Should only return user's consultations
SELECT * FROM expert_consultations WHERE user_id = auth.uid();
```

### Customize RLS (Optional)

Edit [configure_rls_policies.sql](supabase/migrations/configure_rls_policies.sql) to:
- Add custom permission checks
- Modify public/private access rules
- Add organization-level policies

---

## 3. Import Production Data

### Prerequisites

```bash
# Install Python dependencies
pip3 install supabase python-dotenv

# Set environment variables
export SUPABASE_URL="https://bomltkhixeatxuoxmolq.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key-here"
```

**Important**: Use the **service role key** (not anon key) for data import. Find it in:
- Supabase Dashboard → Settings → API → **service_role key**

### Prepare Data Files

Your data should be in JSON format:

**agents.json** (254 agents):
```json
[
  {
    "id": "uuid-here",
    "name": "Dr. Sarah Chen",
    "role": "expert",
    "specialty": "Digital Health",
    "description": "...",
    ...
  },
  ...
]
```

**personas.json** (335 personas):
```json
[
  {
    "id": "uuid-here",
    "name": "Healthcare CIO",
    "job_title": "Chief Information Officer",
    "industry": "Healthcare",
    ...
  },
  ...
]
```

**jtbds.json** (338 JTBDs):
```json
[
  {
    "id": "uuid-here",
    "job_statement": "Implement a secure patient data platform...",
    "functional_area": "Data & Analytics",
    ...
  },
  ...
]
```

### Run Import Script

```bash
cd scripts/

# Import all data
python3 import_production_data.py \
  --agents ../data/agents.json \
  --personas ../data/personas.json \
  --jtbds ../data/jtbds.json

# Or import individually
python3 import_production_data.py --agents ../data/agents.json
python3 import_production_data.py --personas ../data/personas.json
python3 import_production_data.py --jtbds ../data/jtbds.json

# Verify import
python3 import_production_data.py --verify-only
```

### Expected Output

```
📦 VITAL.expert - Production Data Import
========================================
Supabase URL: https://bomltkhixeatxuoxmolq.supabase.co
========================================
✅ Supabase connection successful

📦 Importing agents from agents.json...
  Imported 50/254 agents...
  Imported 100/254 agents...
  ...
✅ Imported 254 agents

📊 Verifying import...
✅ Current database counts:
  - Agents: 254
  - Personas: 335
  - JTBDs: 338

🎉 Import complete! Total records imported: 927
```

### Troubleshooting

**Error: "Connection failed"**
- Check SUPABASE_URL is correct
- Verify SUPABASE_SERVICE_KEY is set (service role, not anon key)
- Test connection: `curl $SUPABASE_URL/rest/v1/agents?limit=1 -H "apikey: $SUPABASE_SERVICE_KEY"`

**Error: "Foreign key constraint violation"**
- Ensure referenced records exist first (e.g., tenants before agents)
- Check that tenant_id, user_id, etc. match existing records

**Error: "Duplicate key violation"**
- Use `upsert` instead of `insert` (script does this automatically)
- Or filter out existing records before import

---

## 4. Test API Endpoints

### Via Script (Automated)

```bash
cd scripts/

# Set environment variables
export SUPABASE_URL="https://bomltkhixeatxuoxmolq.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"

# Make script executable
chmod +x test_api_endpoints.sh

# Run tests
./test_api_endpoints.sh
```

### Via curl (Manual)

```bash
# Replace with your anon key
ANON_KEY="your-anon-key-here"
BASE_URL="https://bomltkhixeatxuoxmolq.supabase.co/rest/v1"

# Test 1: List agents
curl "$BASE_URL/agents?limit=5" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Test 2: Count agents
curl "$BASE_URL/agents?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Test 3: Filter agents by role
curl "$BASE_URL/agents?role=eq.expert&limit=5" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"

# Test 4: Join agents with capabilities
curl "$BASE_URL/agents?select=name,agent_capabilities(capability_name)&limit=3" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

### Via Supabase Dashboard

1. Go to **Table Editor**
2. Browse agents, personas, jobs_to_be_done tables
3. Verify data appears correctly
4. Test filters and search

### Expected Results

✅ All endpoints return 200 OK
✅ Data is returned in correct format
✅ Filters and pagination work
✅ Joins return related data
✅ RLS policies are enforced (if enabled)

---

## 5. Monitor Performance

### Quick Performance Check

```sql
-- Run in Supabase SQL Editor

-- 1. Check average query time (Target: <200ms)
SELECT
  ROUND(AVG(mean_exec_time)::numeric, 2) as avg_query_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%';

-- 2. Check cache hit ratio (Target: >99%)
SELECT
  ROUND(
    (SUM(blks_hit) / NULLIF(SUM(blks_hit) + SUM(blks_read), 0) * 100)::numeric,
    2
  ) as cache_hit_ratio_pct
FROM pg_stat_database
WHERE datname = current_database();

-- 3. Check slow queries (>200ms)
SELECT
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as avg_time_ms
FROM pg_stat_statements
WHERE mean_exec_time > 200
  AND query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Full Performance Report

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy [monitor_performance.sql](supabase/migrations/monitor_performance.sql)
3. Run the entire script
4. Review results for optimization opportunities

### Key Performance Metrics

| Metric | Target | Action if Below Target |
|--------|--------|----------------------|
| Avg Query Time | <200ms | Optimize slow queries, add indexes |
| Cache Hit Ratio | >99% | Increase shared_buffers, check queries |
| Dead Tuple Ratio | <10% | Run VACUUM on affected tables |
| Sequential Scans | Low | Add indexes for frequently scanned tables |
| Index Usage | High | Remove unused indexes (idx_scan = 0) |

### Performance Optimization Actions

**If queries are slow (>200ms)**:
1. Run EXPLAIN ANALYZE on slow queries
2. Add missing indexes
3. Optimize JOIN operations
4. Use materialized views for complex queries

**If cache hit ratio is low (<99%)**:
1. Check query patterns
2. Consider increasing shared_buffers
3. Review frequently accessed tables

**If dead tuple ratio is high (>10%)**:
```sql
-- Run VACUUM on affected tables
VACUUM ANALYZE agents;
VACUUM ANALYZE personas;
VACUUM ANALYZE jobs_to_be_done;
```

**If sequential scans are high**:
1. Identify tables being sequentially scanned
2. Add appropriate indexes
3. Update table statistics: `ANALYZE table_name;`

---

## 6. Application Integration

### Update Environment Variables

```bash
# .env or .env.local
NEXT_PUBLIC_SUPABASE_URL=https://bomltkhixeatxuoxmolq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### Test Application Features

- [ ] User authentication works
- [ ] Agents list displays correctly
- [ ] Personas list displays correctly
- [ ] JTBDs list displays correctly
- [ ] Expert consultations can be created
- [ ] Panel discussions can be created
- [ ] Workflows can be executed
- [ ] Knowledge search works (RAG)
- [ ] User permissions work correctly

### Update API Clients

If you have custom API clients, update them to use new schema:

```typescript
// Example: TypeScript client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Query agents with new schema
const { data: agents } = await supabase
  .from('agents')
  .select('id, name, role, specialty, agent_capabilities(*)')
  .limit(10)

// Query expert consultations
const { data: consultations } = await supabase
  .from('expert_consultations')
  .select('id, user_id, agent_id, status, expert_messages(*)')
  .eq('user_id', userId)
```

---

## 7. Monitoring & Maintenance

### Set Up Alerts (Optional)

In Supabase Dashboard:
1. Go to **Settings** → **Webhooks**
2. Create webhooks for:
   - Database size approaching limit
   - High CPU usage
   - Failed queries
   - RLS policy violations

### Regular Maintenance Tasks

**Daily**:
- [ ] Monitor slow queries
- [ ] Check error logs
- [ ] Review API usage

**Weekly**:
- [ ] Run performance monitoring script
- [ ] Check for unused indexes
- [ ] Review table bloat (dead tuples)

**Monthly**:
- [ ] VACUUM ANALYZE all tables
- [ ] Review and optimize slow queries
- [ ] Update table statistics
- [ ] Audit RLS policies

---

## 8. Rollback Plan (If Needed)

If you encounter issues, you can:

### Disable RLS Temporarily
```sql
-- Disable RLS on a specific table
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
```

### Revert to Previous Schema (Not Recommended)

If you need to rollback, you'll need to:
1. Export current data
2. Drop new tables
3. Restore from backup
4. Re-import data

**Better approach**: Fix issues rather than rollback

---

## 9. Next Steps & Advanced Features

### Enable Real-time Subscriptions
```sql
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE expert_consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE panel_discussions;
```

### Set Up Full-Text Search
```sql
-- Already configured in migration, test it:
SELECT *
FROM knowledge_sources
WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('digital health')
LIMIT 10;
```

### Enable Vector Search (RAG)
```sql
-- Already configured with pgvector extension
-- Test semantic search:
SELECT
  content,
  embedding <=> '[0.1, 0.2, ...]'::vector AS distance
FROM knowledge_chunks
ORDER BY distance
LIMIT 10;
```

### Set Up Backup Schedule

In Supabase Dashboard:
1. Go to **Settings** → **Database**
2. Configure automatic backups
3. Test restore procedure

---

## 10. Troubleshooting

### Common Issues

**Issue: RLS blocking legitimate queries**
- Check user authentication
- Verify RLS policies match your use case
- Use service role key for admin operations

**Issue: Slow queries after migration**
- Run ANALYZE on all tables
- Check for missing indexes
- Review query execution plans

**Issue: Foreign key constraint errors**
- Verify referenced records exist
- Check cascade delete settings
- Review data integrity

**Issue: Connection pool exhausted**
- Optimize connection usage in app
- Increase connection limit (if needed)
- Close idle connections

---

## 11. Support & Resources

### Documentation

- [MIGRATION_COMPLETE.md](supabase/migrations/MIGRATION_COMPLETE.md) - Complete overview
- [verify_migration.sql](supabase/migrations/verify_migration.sql) - Verification queries
- [configure_rls_policies.sql](supabase/migrations/configure_rls_policies.sql) - RLS setup
- [monitor_performance.sql](supabase/migrations/monitor_performance.sql) - Performance monitoring

### Scripts

- [import_production_data.py](scripts/import_production_data.py) - Data import script
- [test_api_endpoints.sh](scripts/test_api_endpoints.sh) - API testing script

### External Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## ✅ Checklist: Post-Migration Complete

- [ ] Migration verified (tables and indexes exist)
- [ ] RLS policies configured and tested
- [ ] Production data imported (254 agents, 335 personas, 338 JTBDs)
- [ ] API endpoints tested and working
- [ ] Performance monitored (<200ms average)
- [ ] Application updated and tested
- [ ] Monitoring and alerts set up
- [ ] Backup schedule configured

**Congratulations! Your VITAL.expert database is production-ready! 🎉**

---

**Last Updated**: 2025-11-13
**Migration Version**: Gold Standard (123 tables, 237+ indexes)
**Status**: ✅ Production Ready
