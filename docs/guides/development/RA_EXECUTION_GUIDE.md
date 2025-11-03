# Regulatory Affairs (RA) Use Cases - Execution Guide

**Issue**: `relation "session_config" does not exist`

**Solution**: The RA seed files require `session_config` to be set up first.

---

## 🚀 **Quick Start - 3 Options**

### **Option 1: Automated Script (Recommended)** ⭐

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Execute all RA use cases automatically
./execute_ra_usecases.sh
```

**What it does:**
- ✅ Checks for foundation seeds
- ✅ Creates `session_config` for each file
- ✅ Executes all 20 RA seed files in order
- ✅ Shows progress and handles errors
- ✅ Provides verification summary

---

### **Option 2: Manual Execution with Session Config**

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Set your database URL
export DATABASE_URL="postgresql://..."
# OR use from .env.local
export DATABASE_URL=$(grep SUPABASE_DB_URL ../../.env.local | cut -d= -f2)

# Execute each pair of files
psql "$DATABASE_URL" <<'SQL'
-- Setup session_config
CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- Execute Part 1
\i 26_ra_001_samd_classification_part1.sql
SQL

psql "$DATABASE_URL" <<'SQL'
-- Setup session_config (must recreate for each psql session)
CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- Execute Part 2
\i 26_ra_001_samd_classification_part2.sql
SQL

# Repeat for all 20 files...
```

---

### **Option 3: Interactive psql Session**

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Start psql
psql "$DATABASE_URL"
```

Then in psql:

```sql
-- 1. Setup session_config (do this ONCE per session)
CREATE TEMP TABLE IF NOT EXISTS session_config (tenant_id UUID, tenant_slug TEXT);
DELETE FROM session_config;
INSERT INTO session_config (tenant_id, tenant_slug)
SELECT id, slug FROM tenants WHERE slug = 'digital-health-startup';

-- 2. Verify tenant
SELECT * FROM session_config;

-- 3. Execute RA seed files
\i 26_ra_001_samd_classification_part1.sql
\i 26_ra_001_samd_classification_part2.sql
\i 27_ra_002_pathway_determination_part1.sql
\i 27_ra_002_pathway_determination_part2.sql
-- ... continue for all files
```

---

## 🔧 **Understanding session_config**

The `session_config` is a **temporary table** that stores the tenant ID for multi-tenant operations. It must be created **before** executing any RA seed files.

### Why is it needed?
- The seed files use `SELECT tenant_id FROM session_config` to get the tenant ID
- This allows the same seed files to work for different tenants
- It's temporary (exists only for the current database session)

### The foundation seeds create it:
If you've already run the foundation seeds (`00_foundation_agents.sql`, etc.), they created `session_config`. However, it's **temporary**, so it only exists in that psql session.

---

## ✅ **Verification**

After seeding, verify with:

```sql
-- Check RA use cases
SELECT code, title, complexity, estimated_duration_minutes 
FROM dh_use_case 
WHERE domain = 'RA' 
ORDER BY code;

-- Should show 10 use cases: UC_RA_001 through UC_RA_010

-- Check tasks
SELECT 
    uc.code,
    uc.title,
    COUNT(DISTINCT t.id) as task_count,
    COUNT(DISTINCT ta.id) as agent_assignments
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
WHERE uc.domain = 'RA'
GROUP BY uc.code, uc.title
ORDER BY uc.code;

-- Should show 62 total tasks, 101 agent assignments
```

---

## 🐛 **Troubleshooting**

### Error: `relation "session_config" does not exist`
**Solution**: Use one of the 3 options above to create `session_config` before executing seed files.

### Error: `Tenant "digital-health-startup" not found`
**Solution**: Create the tenant first:
```sql
INSERT INTO tenants (slug, name) 
VALUES ('digital-health-startup', 'Digital Health Startup')
ON CONFLICT (slug) DO NOTHING;
```

### Error: `relation "dh_agent" does not exist`
**Solution**: Run foundation seeds first:
```bash
psql "$DATABASE_URL" -f 00_foundation_agents.sql
psql "$DATABASE_URL" -f 01_foundation_personas.sql
psql "$DATABASE_URL" -f 02_foundation_tools.sql
psql "$DATABASE_URL" -f 03_foundation_rag_sources.sql
psql "$DATABASE_URL" -f 05_foundation_prompts.sql
```

---

## 📋 **File Execution Order**

All 20 RA seed files must be executed in this order:

1. `26_ra_001_samd_classification_part1.sql`
2. `26_ra_001_samd_classification_part2.sql`
3. `27_ra_002_pathway_determination_part1.sql`
4. `27_ra_002_pathway_determination_part2.sql`
5. `28_ra_003_predicate_identification_part1.sql`
6. `28_ra_003_predicate_identification_part2.sql`
7. `29_ra_004_presub_meeting_part1.sql`
8. `29_ra_004_presub_meeting_part2.sql`
9. `30_ra_005_clinical_evaluation_part1.sql`
10. `30_ra_005_clinical_evaluation_part2.sql`
11. `31_ra_006_breakthrough_designation_part1.sql`
12. `31_ra_006_breakthrough_designation_part2.sql`
13. `32_ra_007_international_harmonization_part1.sql`
14. `32_ra_007_international_harmonization_part2.sql`
15. `33_ra_008_cybersecurity_documentation_part1.sql`
16. `33_ra_008_cybersecurity_documentation_part2.sql`
17. `34_ra_009_software_validation_part1.sql`
18. `34_ra_009_software_validation_part2.sql`
19. `35_ra_010_post_market_surveillance_part1.sql`
20. `35_ra_010_post_market_surveillance_part2.sql`

The automated script (`execute_ra_usecases.sh`) handles this automatically! ⭐

---

## 🎯 **Recommended Approach**

**Use the automated script:**

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"
./execute_ra_usecases.sh
```

This is the **easiest and safest** method! ✅

