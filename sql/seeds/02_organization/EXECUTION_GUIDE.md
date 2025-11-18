# Execution Guide - Normalized Organization Schema

**Date:** 2025-11-15
**Execution Time:** ~10-15 seconds total
**Prerequisites:** PostgreSQL 12+, Supabase account

---

## ⚡ Quick Execute

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/02_organization"

export PGPASSWORD='flusd9fqEb4kkTJ1'
DB_URL="postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

# Execute in order
psql $DB_URL -f "01_NORMALIZED_SCHEMA_SETUP.sql"
psql $DB_URL -f "02_SEED_ROLES_NORMALIZED.sql"
```

---

## 📋 Step-by-Step Execution

### Step 1: Verify Prerequisites

```bash
# Check PostgreSQL client installed
psql --version

# Test database connection
export PGPASSWORD='flusd9fqEb4kkTJ1'
psql postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres -c "SELECT version();"
```

**Expected:** Connection successful, PostgreSQL version displayed

---

### Step 2: Run Schema Setup

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/PRODUCTION_TEMPLATES/02_organization"

export PGPASSWORD='flusd9fqEb4kkTJ1'

psql postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -f "01_NORMALIZED_SCHEMA_SETUP.sql" \
  2>&1 | tee schema_setup.log
```

**Expected Output:**
```
DO
CREATE TABLE (if not exists)
CREATE INDEX (if not exists)
INSERT 0 15  -- therapeutic_areas
INSERT 0 30  -- countries
INSERT 0 20  -- credentials
... (more inserts)
CREATE TABLE (junction tables)
CREATE INDEX (junction table indexes)

✅ SCHEMA SETUP COMPLETE!
📋 Summary:
   • 11 Master Tables Created & Populated
   • 26 Junction Tables Created (Function/Department/Role levels)
   • 176+ Master Data Records Loaded
```

**Duration:** ~5-10 seconds

---

### Step 3: Run Role Seed Data

```bash
psql postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -f "02_SEED_ROLES_NORMALIZED.sql" \
  2>&1 | tee roles_seed.log
```

**Expected Output:**
```
UPDATE 1  -- Chief Medical Officer
UPDATE 1  -- VP Medical Affairs
UPDATE 1  -- Medical Director
... (7 more UPDATEs)
INSERT 0 5  -- role_therapeutic_areas
INSERT 0 3  -- role_countries
... (more junction table inserts)

📊 COMPREHENSIVE SEED DATA REPORT
========================================
Junction Tables Population Summary:
  role_therapeutic_areas    | 45
  role_countries            | 27
  role_credentials_required | 18
  role_technology_platforms | 36
  role_internal_stakeholders| 54
  role_external_stakeholders| 45

✅ SEED DATA COMPLETE!
🎯 All data successfully migrated to normalized schema!
```

**Duration:** ~3-5 seconds

---

## 🔍 Verification Steps

### 1. Check Master Tables Populated

```sql
SELECT
  'therapeutic_areas' as table_name, COUNT(*) as records FROM therapeutic_areas
UNION ALL
SELECT 'countries', COUNT(*) FROM countries
UNION ALL
SELECT 'credentials', COUNT(*) FROM credentials
UNION ALL
SELECT 'stakeholder_types', COUNT(*) FROM stakeholder_types
UNION ALL
SELECT 'technology_platforms', COUNT(*) FROM technology_platforms
UNION ALL
SELECT 'disease_areas', COUNT(*) FROM disease_areas
UNION ALL
SELECT 'product_lifecycle_stages', COUNT(*) FROM product_lifecycle_stages
UNION ALL
SELECT 'company_size_categories', COUNT(*) FROM company_size_categories
ORDER BY table_name;
```

**Expected:**
```
 table_name                    | records
-------------------------------+---------
 company_size_categories       |     6
 countries                     |    30
 credentials                   |    20
 disease_areas                 |    15
 product_lifecycle_stages      |     6
 stakeholder_types             |    25
 technology_platforms          |    15
 therapeutic_areas             |    15
```

---

### 2. Check Junction Tables Created

```sql
SELECT
  table_name,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (table_name LIKE 'function_%'
    OR table_name LIKE 'department_%'
    OR table_name LIKE 'role_%')
ORDER BY table_name;
```

**Expected:** 26+ tables listed

---

### 3. Check Roles Updated

```sql
SELECT
  r.name,
  r.ta_complexity,
  r.product_focus,
  r.pipeline_exposure,
  r.years_in_pharma_min,
  '$' || r.revenue_range_min/1000000 || 'M - $' || r.revenue_range_max/1000000 || 'M' as revenue_range
FROM org_roles r
WHERE r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY r.name;
```

**Expected:** 9 roles with populated data

---

### 4. Check Relationships Populated

```sql
SELECT
  r.name,
  (SELECT COUNT(*) FROM role_therapeutic_areas WHERE role_id = r.id) as ta_count,
  (SELECT COUNT(*) FROM role_countries WHERE role_id = r.id) as country_count,
  (SELECT COUNT(*) FROM role_credentials_required WHERE role_id = r.id) as cred_count,
  (SELECT COUNT(*) FROM role_technology_platforms WHERE role_id = r.id) as tech_count,
  (SELECT COUNT(*) FROM role_internal_stakeholders WHERE role_id = r.id) as internal_stakeholders,
  (SELECT COUNT(*) FROM role_external_stakeholders WHERE role_id = r.id) as external_stakeholders
FROM org_roles r
WHERE r.function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND r.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
ORDER BY r.name;
```

**Expected:** Each role should have multiple relationships (ta_count > 0, country_count > 0, etc.)

---

## ⚠️ Troubleshooting

### Error: "relation does not exist"

**Cause:** Tables not created yet
**Solution:** Run `01_NORMALIZED_SCHEMA_SETUP.sql` first

```bash
psql $DB_URL -f "01_NORMALIZED_SCHEMA_SETUP.sql"
```

---

### Error: "column does not exist"

**Cause:** org_roles table doesn't have new scalar columns
**Solution:** The DO block should create them automatically. If it fails, org_roles might be a view.

**Check:**
```sql
SELECT table_type
FROM information_schema.tables
WHERE table_name = 'org_roles';
```

**If VIEW:** You need to convert it to a table or create a new table

---

### Error: "foreign key constraint violation"

**Cause:** Referenced IDs don't exist (tenant_id, function_id, etc.)
**Solution:** Verify IDs exist before running seed

```sql
-- Check tenant exists
SELECT id, name FROM tenants WHERE id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- Check function exists
SELECT id, name FROM org_functions WHERE id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d';

-- Check roles exist
SELECT id, name, slug FROM org_roles
WHERE function_id = 'bd4cbbef-e3a2-4b22-836c-61ccfd7f042d'
  AND tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
```

**If missing:** You need to create the pharma tenant and medical affairs function first

---

### Error: "permission denied"

**Cause:** Database user doesn't have CREATE/INSERT/UPDATE permissions
**Solution:** Grant permissions or use superuser

```sql
-- As superuser, grant permissions
GRANT ALL ON DATABASE postgres TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

---

### Warning: "cannot drop columns from view"

**Cause:** org_roles is a view, not a table
**Status:** This is non-fatal - the DO block will skip the ALTER TABLE

**To fix permanently:**
1. Create a new base table for org_roles
2. Migrate data from view to table
3. Drop view and rename table

---

## 🔄 Re-running the Scripts

Both scripts are **idempotent** - safe to re-run multiple times:

- `CREATE TABLE IF NOT EXISTS` - Won't fail if table exists
- `ADD COLUMN IF NOT EXISTS` - Won't fail if column exists
- `ON CONFLICT DO NOTHING` - Won't fail on duplicates
- `UPDATE WHERE ...` - Updates existing records

```bash
# Safe to re-run
psql $DB_URL -f "01_NORMALIZED_SCHEMA_SETUP.sql"
psql $DB_URL -f "02_SEED_ROLES_NORMALIZED.sql"
```

---

## 📊 Performance Monitoring

### Execution Time Tracking

```bash
# With timing enabled
psql $DB_URL -f "01_NORMALIZED_SCHEMA_SETUP.sql" -c "\timing on"

# Expected times:
# 01_NORMALIZED_SCHEMA_SETUP.sql: 5-10 seconds
# 02_SEED_ROLES_NORMALIZED.sql: 3-5 seconds
```

### Query Performance After Setup

```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT r.*, ta.name as ta_name
FROM org_roles r
JOIN role_therapeutic_areas rta ON rta.role_id = r.id
JOIN therapeutic_areas ta ON ta.id = rta.therapeutic_area_id
WHERE r.slug = 'chief-medical-officer';
```

**Expected:** Query should use index scans, execution time < 1ms

---

## 🎯 Success Criteria

After successful execution, you should have:

- [x] 11 master tables with 176+ records
- [x] 26 junction tables created
- [x] 9 Medical Affairs roles updated with scalar fields
- [x] Junction tables populated with relationships
- [x] All indexes created
- [x] All foreign key constraints active
- [x] Verification queries return expected data
- [x] No errors in log files

---

## 📝 Logging

Save execution logs for troubleshooting:

```bash
# Schema setup log
psql $DB_URL -f "01_NORMALIZED_SCHEMA_SETUP.sql" 2>&1 | tee schema_setup_$(date +%Y%m%d_%H%M%S).log

# Seed data log
psql $DB_URL -f "02_SEED_ROLES_NORMALIZED.sql" 2>&1 | tee roles_seed_$(date +%Y%m%d_%H%M%S).log

# View logs
ls -lh *.log
```

---

## 🔒 Rollback Plan

If you need to rollback:

### Rollback Junction Tables Only
```sql
-- Drop all junction tables
DROP TABLE IF EXISTS role_therapeutic_areas CASCADE;
DROP TABLE IF EXISTS role_countries CASCADE;
DROP TABLE IF EXISTS role_credentials_required CASCADE;
-- ... (repeat for all junction tables)
```

### Rollback Master Tables
```sql
-- Drop all master tables
DROP TABLE IF EXISTS therapeutic_areas CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;
-- ... (repeat for all master tables)
```

### Rollback Scalar Columns
```sql
-- Remove added columns from org_roles
ALTER TABLE org_roles
DROP COLUMN IF EXISTS ta_complexity,
DROP COLUMN IF EXISTS revenue_range_min,
DROP COLUMN IF EXISTS revenue_range_max,
DROP COLUMN IF EXISTS product_focus,
DROP COLUMN IF EXISTS pipeline_exposure,
DROP COLUMN IF EXISTS products_supported_min,
DROP COLUMN IF EXISTS products_supported_max;
```

---

## ✅ Post-Execution Checklist

- [ ] Schema setup completed without errors
- [ ] Seed data loaded successfully
- [ ] Master tables have expected record counts
- [ ] Junction tables created (26 total)
- [ ] Roles updated (9 total)
- [ ] Relationships populated (check counts)
- [ ] Verification queries return data
- [ ] Logs saved for reference
- [ ] Application tested with new schema
- [ ] Performance acceptable (queries < 100ms)

---

**Last Updated:** 2025-11-15
**Next Steps:** Test application queries, create additional roles, populate more relationships
