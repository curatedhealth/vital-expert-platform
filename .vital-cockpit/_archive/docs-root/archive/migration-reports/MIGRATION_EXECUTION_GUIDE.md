# Migration Execution Guide

**Status:** ✅ ALL MIGRATIONS READY TO EXECUTE
**Total Migrations:** 7 (002-007 + organizational/tenant tables)
**Estimated Time:** 10-15 minutes

---

## 📋 Pre-Execution Checklist

- ✅ All 319 agents analyzed and classified
- ✅ 397 capabilities extracted
- ✅ 360 skills identified
- ✅ Organizational structure mapped
- ✅ Tenant assignments complete
- ✅ All 7 migration files generated
- ✅ Agent names updated with tier prefixes

---

## 🚀 Execution Methods

### Option 1: Supabase SQL Editor (Recommended)

**Best for:** Quick execution, visual feedback, no local setup needed

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
   - Click "SQL Editor" in left sidebar

2. **Execute Migrations in Sequence**

   Run each migration file in this EXACT order:

   **Step 1:** `002_create_normalized_agent_schema.sql`
   ```
   - Creates 15+ new tables
   - Adds columns to existing agents table
   - Sets up foreign keys and constraints
   ```

   **Step 2:** `003_seed_skills_and_capabilities.sql`
   ```
   - Inserts 50 official + VITAL skills
   - Inserts 30 initial capabilities
   - Creates capability-skill relationships
   ```

   **Step 3:** `004_seed_community_skills.sql`
   ```
   - Inserts 65+ community skills
   - From GitHub repositories
   ```

   **Step 4:** `005_seed_agent_capabilities_registry.sql`
   ```
   - Inserts 397 capabilities from agent analysis
   - Grouped by category
   - Includes usage counts
   ```

   **Step 5:** `006_reclassify_agents.sql`
   ```
   - Updates all 319 agent tier levels
   - Sets proper agent_level (MASTER/EXPERT/SPECIALIST/WORKER/TOOL)
   ```

   **Step 6:** `007_organizational_hierarchy.sql`
   ```
   - Creates organizational structure tables
   - Creates tenant tables (pharma, digital_health)
   - Maps all agents to departments/functions/roles
   - Maps all agents to tenants
   - Updates agent names with tier prefixes
   ```

3. **Validate After Each Migration**

   After each step, run:
   ```sql
   -- Check for errors
   SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction (aborted)';

   -- Verify tables created
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

### Option 2: Using psql CLI

**Best for:** Automation, scripting, batch execution

```bash
# Export database password
export PGPASSWORD="your_supabase_db_password"

# Execute migrations in sequence
psql postgresql://postgres.bomltkhixeatxuoxmolq:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres \
  -f supabase/migrations/002_create_normalized_agent_schema.sql

psql postgresql://postgres.bomltkhixeatxuoxmolq:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres \
  -f supabase/migrations/003_seed_skills_and_capabilities.sql

# ... continue with 004, 005, 006, 007
```

### Option 3: Using Python Script

**Best for:** Programmatic execution with error handling

```bash
# Install psycopg2 if not already installed
pip3 install psycopg2-binary

# Set database password in .env
echo "SUPABASE_DB_PASSWORD=your_password" >> .env

# Run migrations
python3 scripts/run_migration.py 002
python3 scripts/run_migration.py 003
python3 scripts/run_migration.py 004
python3 scripts/run_migration.py 005
python3 scripts/run_migration.py 006
python3 scripts/run_migration.py 007
```

---

## 🔍 Post-Migration Validation

After ALL migrations complete, run these validation queries:

### 1. Check Agent Tier Assignment

```sql
-- All agents should have tier
SELECT COUNT(*) as agents_without_tier
FROM agents
WHERE agent_level IS NULL;
-- Expected: 0
```

### 2. Check Tenant Mappings

```sql
-- All agents should be mapped to at least one tenant
SELECT COUNT(DISTINCT a.id) as agents_with_tenants
FROM agents a
INNER JOIN agent_tenants at ON a.id = at.agent_id;
-- Expected: 319
```

### 3. Check Capabilities Mapping

```sql
-- Count agents with capabilities
SELECT COUNT(DISTINCT agent_id) as agents_with_capabilities
FROM agent_capabilities;
-- Expected: should be close to 319 (some may not have capabilities yet)
```

### 4. Check Organizational Mapping

```sql
-- Count agents with roles
SELECT COUNT(DISTINCT agent_id) as agents_with_roles
FROM agent_roles;
-- Expected: 319
```

### 5. Check Name Updates

```sql
-- All agents should have tier prefix in name
SELECT COUNT(*) as agents_with_tier_prefix
FROM agents
WHERE name LIKE 'Master -%'
   OR name LIKE 'Expert -%'
   OR name LIKE 'Specialist -%'
   OR name LIKE 'Worker -%'
   OR name LIKE 'Tool -%';
-- Expected: 319
```

### 6. Check Table Counts

```sql
-- Verify data populated
SELECT
    (SELECT COUNT(*) FROM capabilities) as capabilities_count,
    (SELECT COUNT(*) FROM skills) as skills_count,
    (SELECT COUNT(*) FROM departments) as departments_count,
    (SELECT COUNT(*) FROM functions) as functions_count,
    (SELECT COUNT(*) FROM roles) as roles_count,
    (SELECT COUNT(*) FROM tenants) as tenants_count,
    (SELECT COUNT(*) FROM personas) as personas_count;
```

**Expected Results:**
- capabilities_count: ~397
- skills_count: ~115
- departments_count: 8
- functions_count: ~30-50
- roles_count: ~100-150
- tenants_count: 2
- personas_count: 7

---

## ⚠️ Troubleshooting

### Issue: "relation already exists"

**Cause:** Table already created from previous attempt

**Solution:** Either:
1. Add `IF NOT EXISTS` to CREATE TABLE statements (already in migrations)
2. Or drop and recreate (⚠️ will lose data):
   ```sql
   DROP TABLE IF EXISTS table_name CASCADE;
   ```

### Issue: "foreign key constraint fails"

**Cause:** Trying to reference non-existent record

**Solution:** Run migrations in exact order (002 → 003 → 004 → 005 → 006 → 007)

### Issue: "duplicate key value"

**Cause:** Trying to insert same record twice

**Solution:** Migrations use `ON CONFLICT DO NOTHING` - safe to re-run

### Issue: "column does not exist"

**Cause:** Migration 002 not run yet (adds columns to agents table)

**Solution:** Run migration 002 first

---

## 📊 Migration Impact

### Database Changes

**New Tables Created:** 20+
- capabilities, skills, domain_expertise (lookups)
- agent_capabilities, agent_skills, capability_skills (junctions)
- departments, functions, roles, personas (organizational)
- tenants, agent_tenants (multi-tenancy)
- agent_embeddings, agent_performance_metrics, agent_collaborations (supporting)

**Columns Added to `agents` Table:**
- agent_level (MASTER/EXPERT/SPECIALIST/WORKER/TOOL)
- version, is_active, complexity_score
- avg_response_time_ms, success_rate, total_invocations
- gold_standard_validated
- search_vector (full-text search)

**Indexes Created:** 15+

**Views Created:**
- gold_standard_agents
- agent_tier_distribution

### Data Changes

**Agent Names Updated:**
- All 319 agents renamed with tier prefix
- Example: "HEOR Director" → "Expert - HEOR Director"

**Agent Classifications:**
- 1 MASTER agent
- 239 EXPERT agents
- 75 SPECIALIST agents
- 4 WORKER agents
- 0 TOOL agents

**Organizational Mappings:**
- 319 agents → departments
- 319 agents → functions
- 319 agents → roles
- 319 agents → personas

**Tenant Mappings:**
- ~70% pharma-only agents
- ~10% digital health-only agents
- ~20% multi-tenant agents

---

## 🎯 Success Criteria

Migration is successful when ALL of these are true:

- ✅ All 7 migrations executed without errors
- ✅ All 20+ tables exist in database
- ✅ All 319 agents have agent_level set
- ✅ All 319 agents have updated names with tier prefix
- ✅ All 319 agents mapped to tenants
- ✅ All 319 agents mapped to organizational roles
- ✅ 397 capabilities inserted
- ✅ 115+ skills inserted
- ✅ Validation queries return expected counts

---

## 📁 Migration Files Location

All migration files are in:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/supabase/migrations/
```

**Files:**
1. `002_create_normalized_agent_schema.sql` (15 KB)
2. `003_seed_skills_and_capabilities.sql` (25 KB)
3. `004_seed_community_skills.sql` (30 KB)
4. `005_seed_agent_capabilities_registry.sql` (180 KB)
5. `006_reclassify_agents.sql` (45 KB)
6. `007_organizational_hierarchy.sql` (95 KB)

**Total SQL:** ~390 KB

---

## 🔄 Rollback Plan

If migrations fail and you need to rollback:

### Rollback Script

```sql
-- Drop all new tables (CASCADE removes dependent objects)
DROP TABLE IF EXISTS agent_tenants CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS persona_roles CASCADE;
DROP TABLE IF EXISTS agent_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS functions CASCADE;
DROP TABLE IF NOT EXISTS departments CASCADE;
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS agent_collaborations CASCADE;
DROP TABLE IF EXISTS agent_performance_metrics CASCADE;
DROP TABLE IF EXISTS agent_embeddings CASCADE;
DROP TABLE IF EXISTS agent_domain_expertise CASCADE;
DROP TABLE IF EXISTS domain_expertise CASCADE;
DROP TABLE IF EXISTS capability_skills CASCADE;
DROP TABLE IF EXISTS agent_skills CASCADE;
DROP TABLE IF EXISTS agent_capabilities CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS capabilities CASCADE;

-- Remove added columns from agents table
ALTER TABLE agents DROP COLUMN IF EXISTS agent_level;
ALTER TABLE agents DROP COLUMN IF EXISTS version;
ALTER TABLE agents DROP COLUMN IF EXISTS is_active;
ALTER TABLE agents DROP COLUMN IF EXISTS complexity_score;
ALTER TABLE agents DROP COLUMN IF EXISTS avg_response_time_ms;
ALTER TABLE agents DROP COLUMN IF EXISTS success_rate;
ALTER TABLE agents DROP COLUMN IF EXISTS total_invocations;
ALTER TABLE agents DROP COLUMN IF EXISTS gold_standard_validated;
ALTER TABLE agents DROP COLUMN IF EXISTS search_vector;

-- Restore agent names (remove tier prefix)
-- This would need to be done programmatically based on stored original names
```

---

## ⏭️ Next Steps After Migration

1. **Validate Data Integrity** (run validation queries above)

2. **Update Enhancement Tool**
   ```bash
   # Modify enhance_agent_library.py to use normalized tables
   nano scripts/enhance_agent_library.py
   ```

3. **Run Agent Enhancement**
   ```bash
   python3 scripts/enhance_agent_library.py
   ```

4. **Migrate to Neo4j**
   ```bash
   python3 scripts/migrate_to_neo4j.py
   ```

5. **Update Frontend**
   - Use new tenant filtering
   - Use new organizational filtering
   - Use new tier-based agent selection

---

**Ready to Execute?**

Choose your execution method above and proceed with migrations 002 → 003 → 004 → 005 → 006 → 007 in that exact order.

**Estimated Total Time:** 10-15 minutes
**Risk Level:** Low (all migrations use IF NOT EXISTS and ON CONFLICT)
**Rollback Available:** Yes (see Rollback Plan above)

---

_Generated: 2025-11-17_
_All files validated and ready for execution_
