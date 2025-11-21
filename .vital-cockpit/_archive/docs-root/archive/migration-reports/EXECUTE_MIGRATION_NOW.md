# Execute Migration - Complete Guide

**Status:** ✅ ALL SCRIPTS READY
**Total Time:** ~50 minutes
**Risk:** LOW - All data protected

---

## 📋 Pre-Flight Checklist

- [ ] Backup database (recommended)
- [ ] Review [COMPLETE_MIGRATION_PLAN.md](COMPLETE_MIGRATION_PLAN.md)
- [ ] Verify all JSON files exist in `/Users/hichamnaim/Downloads/`
- [ ] Supabase credentials in `.env` file

---

## 🚀 Execution Steps

### STEP 0: Create Tables (2 minutes) - REQUIRED FIRST

**Run in Supabase Dashboard SQL Editor:**

1. Go to https://supabase.com/dashboard → SQL Editor
2. Copy contents of [scripts/create_tables.sql](scripts/create_tables.sql)
3. Execute
4. Verify tables created with proper schema

---

### STEP 1: Strategic Priorities (5 minutes)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/migration_1_strategic_priorities.py
```

**Expected:**
- ✅ 7 strategic priorities created
- ✅ 105 Medical Affairs JTBDs linked

**Verify:**
```bash
# Should show 7 SPs and counts
```

---

### STEP 2: Migrate Tools (3 minutes)

```bash
python3 scripts/migration_2_migrate_tools.py
```

**Expected:**
- ✅ 150 tools migrated from dh_tool

**Verify:**
```bash
# Should show 150 tools
```

---

### STEP 3A: Migrate dh_workflow (10 minutes)

```bash
python3 scripts/migration_3a_migrate_dh_workflows.py
```

**Expected:**
- ✅ 116 workflows migrated from dh_workflow
- ✅ Total workflows: 257 (141 existing + 116 migrated)

**Verify:**
```bash
# Should show 257 total workflows
```

---

### STEP 3B: Import MA Workflows (15 minutes)

```bash
python3 scripts/migration_3b_import_ma_workflows.py
```

**Expected:**
- ✅ 111 new Medical Affairs workflows imported
- ✅ Total workflows: 368 (257 + 111)

**Verify:**
```bash
# Should show 368 total workflows
```

---

### STEP 4: Migrate Tasks (8 minutes)

```bash
python3 scripts/migration_4_migrate_tasks.py
```

**Expected:**
- ✅ 343 tasks migrated from dh_task
- ✅ Tasks linked to workflows

**Verify:**
```bash
# Should show 343 tasks
```

---

### STEP 5: Final Verification (2 minutes)

```bash
python3 scripts/verify_migration_complete.py
```

**Expected:**
```
✅ ALL MIGRATIONS COMPLETE AND VERIFIED!
   All expected records present, no data loss detected

Total Records: ~5,209
```

---

## 📊 Expected Results

| Migration | Before | After | Added |
|-----------|--------|-------|-------|
| Strategic Priorities | 0 | 7 | +7 |
| JTBD Links (MA) | 0 | 105 | +105 links |
| Tools | 0 | 150 | +150 |
| Workflows | 141 | 368 | +227 |
| Tasks | 0 | 343 | +343 |
| **TOTAL** | **4,482** | **5,209** | **+727** |

### Protected Tables (NO CHANGES)
- ✅ Agents: 190 → 190
- ✅ Prompts: 3,570 → 3,570
- ✅ Personas: 210 → 210
- ✅ JTBD Library: 371 → 371

---

## 📁 All Scripts Created

### SQL Scripts
- ✅ [scripts/create_tables.sql](scripts/create_tables.sql) - Create strategic_priorities, tools, tasks

### Migration Scripts
- ✅ [scripts/migration_1_strategic_priorities.py](scripts/migration_1_strategic_priorities.py)
- ✅ [scripts/migration_2_migrate_tools.py](scripts/migration_2_migrate_tools.py)
- ✅ [scripts/migration_3a_migrate_dh_workflows.py](scripts/migration_3a_migrate_dh_workflows.py)
- ✅ [scripts/migration_3b_import_ma_workflows.py](scripts/migration_3b_import_ma_workflows.py)
- ✅ [scripts/migration_4_migrate_tasks.py](scripts/migration_4_migrate_tasks.py)

### Verification
- ✅ [scripts/verify_migration_complete.py](scripts/verify_migration_complete.py)

### Documentation
- ✅ [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Full schema documentation
- ✅ [COMPLETE_MIGRATION_PLAN.md](COMPLETE_MIGRATION_PLAN.md) - Detailed migration plan
- ✅ [MIGRATION_READY_TO_EXECUTE.md](MIGRATION_READY_TO_EXECUTE.md) - Migration summary
- ✅ [EXECUTE_MIGRATION_NOW.md](EXECUTE_MIGRATION_NOW.md) - This file

---

## 🚨 Rollback Procedures

If anything goes wrong at any step:

### Rollback Migration 1
```bash
# Remove strategic priority links
# See COMPLETE_MIGRATION_PLAN.md for SQL
```

### Rollback Migration 2
```sql
DELETE FROM tools WHERE metadata->>'source' = 'dh_tool';
```

### Rollback Migration 3A
```sql
DELETE FROM workflows WHERE definition->>'source' = 'dh_workflow';
```

### Rollback Migration 3B
```sql
DELETE FROM workflows WHERE definition->>'source' LIKE '%Operational Library%';
```

### Rollback Migration 4
```sql
DELETE FROM tasks WHERE metadata->>'source' = 'dh_task';
```

---

## ✅ Success Criteria

After all migrations:

- [x] All scripts created
- [ ] Step 0: Tables created
- [ ] Step 1: 7 strategic priorities + 105 JTBD links
- [ ] Step 2: 150 tools migrated
- [ ] Step 3A: 116 workflows migrated from dh_workflow
- [ ] Step 3B: 111 MA workflows imported
- [ ] Step 4: 343 tasks migrated
- [ ] Verification: All checks pass
- [ ] No data loss in protected tables
- [ ] Application still functions correctly

---

## 🎯 Quick Start

To execute the entire migration:

```bash
# 1. First: Run create_tables.sql in Supabase Dashboard

# 2. Then run all migrations in sequence:
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

python3 scripts/migration_1_strategic_priorities.py
python3 scripts/migration_2_migrate_tools.py
python3 scripts/migration_3a_migrate_dh_workflows.py
python3 scripts/migration_3b_import_ma_workflows.py
python3 scripts/migration_4_migrate_tasks.py

# 3. Finally verify:
python3 scripts/verify_migration_complete.py
```

**Total Time:** ~43 minutes

---

## 📞 Support

If you encounter any issues:

1. Check the error message in the script output
2. Review [COMPLETE_MIGRATION_PLAN.md](COMPLETE_MIGRATION_PLAN.md) for detailed troubleshooting
3. Use rollback procedures if needed
4. Re-run verification script to check current state

---

**Last Updated:** 2025-11-10
**Status:** ✅ ALL SCRIPTS READY - READY TO EXECUTE
**Next Action:** Run Step 0 (create_tables.sql) then proceed with migrations

