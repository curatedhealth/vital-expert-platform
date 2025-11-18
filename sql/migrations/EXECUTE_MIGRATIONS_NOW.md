# 🚀 EXECUTE VITAL MIGRATIONS - QUICK START GUIDE

## ✅ Status: Ready to Execute

All SQL files have been fixed and verified. They are ready for production execution.

---

## 🎯 RECOMMENDED METHOD: Supabase Dashboard

Since direct `psql` connection is blocked by network/firewall, use the Supabase Dashboard SQL Editor:

### Step 1: Open Supabase Dashboard

```bash
# Run this to open the SQL Editor
open "https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql"
```

Or manually navigate to:
- Dashboard: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
- Click: **SQL Editor** in the left sidebar

---

### Step 2: Execute Migrations in Order

Run each file by copying its contents and pasting into the SQL Editor.

#### 📋 Use the Helper Script

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/migrations"

# Run helper script
./copy-for-dashboard.sh
```

This will:
1. Show a menu of migration files
2. Copy selected file to clipboard
3. You paste into Supabase Dashboard
4. Click "Run"
5. Repeat for next file

---

### Step 3: Migration Execution Order

Execute in this exact order:

```
1️⃣  000_create_migration_tracking.sql   (NEW - creates tracking table)
2️⃣  000_pre_migration_validation.sql    (validates current state)
3️⃣  001_schema_fixes.sql                (adds category column, creates tables)
4️⃣  002_tenant_setup.sql                (creates 3 tenants)
5️⃣  003_platform_data_migration.sql     (assigns platform data)
6️⃣  004_tenant_data_migration.sql       (assigns tenant data)
7️⃣  005_post_migration_validation.sql   (validates results)
```

**IMPORTANT**: Wait for each migration to complete successfully before starting the next one!

---

### Step 4: Monitor Progress

In the SQL Editor output panel, you'll see:

```sql
✅ NOTICE: Creating migration_tracking table...
✅ NOTICE: migration_tracking table created successfully
✅ NOTICE: Verification passed: migration_tracking table exists
```

---

### Step 5: Verify Success

After completing all migrations, run this validation query:

```sql
-- Check migration status
SELECT
  phase,
  status,
  started_at,
  completed_at,
  metrics
FROM migration_tracking
WHERE migration_name = 'multi_tenant_migration'
ORDER BY started_at;

-- Verify tenants
SELECT id, name, slug, is_active
FROM tenants;

-- Verify tools.category column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tools' AND column_name = 'category';
```

---

## 📁 Migration Files Summary

| # | File | Purpose | Est. Time |
|---|------|---------|-----------|
| 0 | 000_create_migration_tracking.sql | Create tracking table | 5s |
| 1 | 000_pre_migration_validation.sql | Validate current state | 10s |
| 2 | 001_schema_fixes.sql | Add missing columns/tables | 30s |
| 3 | 002_tenant_setup.sql | Create 3 tenants | 10s |
| 4 | 003_platform_data_migration.sql | Assign platform data | 20s |
| 5 | 004_tenant_data_migration.sql | Assign tenant data | 30s |
| 6 | 005_post_migration_validation.sql | Validate results | 20s |

**Total Estimated Time**: ~2 minutes

---

## ⚠️ Troubleshooting

### Error: "relation migration_tracking does not exist"
**Solution**: Run `000_create_migration_tracking.sql` FIRST

### Error: "relation tools does not exist"
**Solution**: Your database schema is different than expected. Contact support.

### Error: "duplicate key value violates unique constraint"
**Solution**: The migration has already been run. Check:
```sql
SELECT * FROM migration_tracking;
```

### Connection Timeout with psql
**Solution**: This is expected. Use Supabase Dashboard instead (recommended method above).

---

## 🔄 Alternative Method: Fix Network & Use CLI

If you need CLI access:

```bash
# Test connection
export PGPASSWORD='flusd9fqEb4kkTJ1'
psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -c "SELECT version();"
```

If this works, you can run:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/migrations"

# Run all migrations
for file in 000_create_migration_tracking.sql \
            000_pre_migration_validation.sql \
            001_schema_fixes.sql \
            002_tenant_setup.sql \
            003_platform_data_migration.sql \
            004_tenant_data_migration.sql \
            005_post_migration_validation.sql; do
  echo "Executing: $file"
  psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f "$file"
  if [ $? -ne 0 ]; then
    echo "❌ Migration failed: $file"
    exit 1
  fi
  echo "✅ Completed: $file"
  echo ""
done
```

---

## ✨ After Migration Success

### 1. Restart Dev Server

The tools API fix is already deployed (see running server on port 3000).
No restart needed, but you can if you want:

```bash
# Already running, but if needed:
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/vital-system"
pnpm dev
```

### 2. Test the Applications

Navigate to these pages and verify data loads:

- ✅ Tools: http://localhost:3000/tools
- ✅ Prompts: http://localhost:3000/prism
- ✅ Knowledge: http://localhost:3000/knowledge
- ✅ Personas: http://localhost:3000/personas
- ✅ JTBD: http://localhost:3000/jobs-to-be-done

### 3. Check Browser Console

Open Developer Tools (F12) and check for errors:
- Should see NO "column tools.category does not exist" errors
- Should see data loading successfully
- Check Network tab for 200 status codes

---

## 📊 Expected Results

After successful migration:

1. **Tools page** - Loads with category column populated
2. **Prompts page** - Shows prompts filtered by tenant
3. **Knowledge page** - Shows documents filtered by tenant
4. **3 Tenants created**:
   - Platform (00000000-0000-0000-0000-000000000001)
   - Digital Health Startup (11111111-1111-1111-1111-111111111111)
   - Pharmaceuticals (f7aa6fd4-0af9-4706-8b31-034f1f7accda)

---

## 🆘 Need Help?

1. **Check migration logs** in Supabase Dashboard
2. **Review error messages** carefully
3. **Check migration_tracking table** for status
4. **Consult RUN_MIGRATIONS.md** for detailed troubleshooting

---

## 🎉 Success Criteria

✅ All 7 migrations completed without errors
✅ migration_tracking table shows "completed" status
✅ 3 tenants exist in tenants table
✅ tools.category column exists
✅ Tools page loads without errors
✅ No console errors about missing columns

---

**Ready to execute! Start with the Supabase Dashboard method above.**

**Last Updated**: 2025-11-18
**Database**: bomltkhixeatxuoxmolq.supabase.co
