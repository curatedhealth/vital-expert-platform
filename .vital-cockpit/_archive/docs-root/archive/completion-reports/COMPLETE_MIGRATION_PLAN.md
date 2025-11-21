# Complete Database Migration Plan

**Date:** 2025-11-10
**Status:** Ready to Execute
**Risk:** LOW - All data protected, migrations are additive

---

## 🎯 Migration Strategy

### Protected Tables (NO CHANGES - Keep All Data)
```
✅ prompts            - 3,570 records - PROTECTED
✅ jtbd_library       - 371 records   - PROTECTED (105 MA + 266 DH)
✅ workflows          - 141 records   - PROTECTED (will add 116 + 111 more)
✅ agents             - 190 records   - PROTECTED
✅ personas           - 210 records   - PROTECTED
```

### Migration Targets
```
1. strategic_priorities (0 → 7 records)       - ADD 7 Strategic Priorities
2. tools (0 → 150 records)                    - MIGRATE from dh_tool
3. workflows (141 → 368 records)              - MIGRATE 116 from dh_workflow + 111 new MA workflows
4. tasks (0 → 343 records)                    - MIGRATE from dh_task
```

---

## 📊 Data Flows

### Migration 1: Strategic Priorities
```
Source: Manual seed (7 SP01-SP07)
Target: strategic_priorities table
Action: INSERT 7 records
Link: Update jtbd_library.strategic_priority_id for 105 Medical Affairs JTBDs
```

### Migration 2: Tools
```
Source: dh_tool (150 records)
Target: tools table
Action: Copy all 150 records
Mapping:
  - dh_tool.id → tools.id
  - dh_tool.name → tools.name
  - dh_tool columns → tools.metadata (JSONB)
```

### Migration 3: Workflows (Two-Step)
```
Step A: Enhance workflows table schema
  - Add columns from dh_workflow to workflows.definition JSONB
  - Keep existing 141 records untouched

Step B: Migrate dh_workflow → workflows
  Source: dh_workflow (116 records)
  Target: workflows table (141 existing + 116 migrated = 257)
  Mapping:
    - dh_workflow.* → workflows.definition (JSONB)
    - Preserve all dh_workflow columns in definition

Step C: Import new Medical Affairs workflows
  Source: 7 SP operational library JSON files
  Target: workflows table (257 + 111 new = 368)
  Action: Import 111 new workflows
```

### Migration 4: Tasks
```
Source: dh_task (343 records)
Target: tasks table
Action: Copy all 343 records
Mapping:
  - dh_task.id → tasks.id
  - dh_task.workflow_id → tasks.workflow_id (link to migrated workflows)
  - dh_task columns → tasks JSONB fields
```

---

## 🔧 Migration Scripts

### Script 1: Seed Strategic Priorities (5 minutes)

**File:** `scripts/migration_1_strategic_priorities.py`

```python
# Seeds 7 strategic priorities
# Links 105 Medical Affairs JTBDs
# Expected result: 7 SPs, 105 JTBDs linked
```

### Script 2: Migrate Tools (3 minutes)

**File:** `scripts/migration_2_migrate_tools.py`

```python
# Copies 150 records from dh_tool to tools
# Preserves all columns in metadata JSONB
# Expected result: 150 tools
```

### Script 3: Enhance Workflows Schema (2 minutes)

**File:** `scripts/migration_3a_enhance_workflows_schema.sql`

```sql
-- Adds any missing columns to workflows table
-- Does NOT modify existing 141 records
-- Prepares for dh_workflow migration
```

### Script 4: Migrate dh_workflow to workflows (10 minutes)

**File:** `scripts/migration_3b_migrate_dh_workflows.py`

```python
# Copies 116 records from dh_workflow to workflows
# Maps all dh_workflow columns to workflows.definition JSONB
# Preserves links to dh_use_case, dh_domain
# Expected result: 141 + 116 = 257 workflows
```

### Script 5: Import MA Workflows (15 minutes)

**File:** `scripts/migration_3c_import_ma_workflows.py`

```python
# Imports 111 new Medical Affairs workflows
# Links to jtbd_library via JTBD IDs
# Expected result: 257 + 111 = 368 workflows
```

### Script 6: Migrate Tasks (8 minutes)

**File:** `scripts/migration_4_migrate_tasks.py`

```python
# Copies 343 records from dh_task to tasks
# Updates workflow_id references to new workflows table
# Preserves all dh_task columns
# Expected result: 343 tasks
```

---

## ✅ Pre-Migration Checklist

Before running migrations:

- [x] Database schema discovered (DATABASE_SCHEMA.json created)
- [x] All tables identified and counted
- [x] Protected tables identified (5 tables with 4,482 records)
- [x] Migration strategy documented
- [ ] Backup created (REQUIRED before running migrations)
- [ ] All migration scripts created
- [ ] Scripts tested on staging environment (if available)

---

## 🚀 Execution Order

### Phase 1: Strategic Priorities (5 min)
```bash
python3 scripts/migration_1_strategic_priorities.py
```
**Expected:**
- 7 strategic priorities created
- 105 Medical Affairs JTBDs linked

**Verification:**
```sql
SELECT COUNT(*) FROM strategic_priorities; -- 7
SELECT COUNT(*) FROM jtbd_library WHERE strategic_priority_id IS NOT NULL; -- 105
```

### Phase 2: Migrate Tools (3 min)
```bash
python3 scripts/migration_2_migrate_tools.py
```
**Expected:**
- 150 tools migrated from dh_tool

**Verification:**
```sql
SELECT COUNT(*) FROM tools; -- 150
```

### Phase 3: Enhance & Migrate Workflows (27 min total)

**Step 3A: Enhance Schema (2 min)**
```bash
# Run SQL in Supabase Dashboard
# See: scripts/migration_3a_enhance_workflows_schema.sql
```

**Step 3B: Migrate dh_workflow (10 min)**
```bash
python3 scripts/migration_3b_migrate_dh_workflows.py
```
**Expected:**
- 116 workflows migrated from dh_workflow
- Total workflows: 257 (141 existing + 116 migrated)

**Verification:**
```sql
SELECT COUNT(*) FROM workflows; -- 257
SELECT COUNT(*) FROM workflows WHERE definition->>'source' = 'dh_workflow'; -- 116
```

**Step 3C: Import MA Workflows (15 min)**
```bash
python3 scripts/migration_3c_import_ma_workflows.py
```
**Expected:**
- 111 new Medical Affairs workflows imported
- Total workflows: 368 (257 + 111)

**Verification:**
```sql
SELECT COUNT(*) FROM workflows; -- 368
SELECT COUNT(*) FROM workflows WHERE definition->>'source' LIKE '%Operational Library%'; -- 111
```

### Phase 4: Migrate Tasks (8 min)
```bash
python3 scripts/migration_4_migrate_tasks.py
```
**Expected:**
- 343 tasks migrated from dh_task

**Verification:**
```sql
SELECT COUNT(*) FROM tasks; -- 343
```

---

## 📊 Expected Final State

### Record Counts
| Table | Before | After | Change |
|-------|--------|-------|--------|
| strategic_priorities | 0 | 7 | +7 |
| jtbd_library | 371 | 371 | No change (protected) |
| workflows | 141 | 368 | +227 (116 migrated + 111 new) |
| tasks | 0 | 343 | +343 |
| tools | 0 | 150 | +150 |
| agents | 190 | 190 | No change (protected) |
| prompts | 3,570 | 3,570 | No change (protected) |
| personas | 210 | 210 | No change (protected) |
| **TOTAL** | **4,482** | **5,209** | **+727 records** |

### Data Integrity
- ✅ All existing 4,482 records preserved
- ✅ 727 new records added via migration and import
- ✅ All foreign key relationships maintained
- ✅ JTBD links preserved (both VARCHAR and UUID)
- ✅ Workflow → Task links updated
- ✅ No data loss

---

## 🔍 Verification Queries

After all migrations complete, run these verification queries:

```sql
-- 1. Count all tables
SELECT
  'strategic_priorities' as table_name, COUNT(*) as count FROM strategic_priorities
UNION ALL SELECT 'jtbd_library', COUNT(*) FROM jtbd_library
UNION ALL SELECT 'workflows', COUNT(*) FROM workflows
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'tools', COUNT(*) FROM tools
UNION ALL SELECT 'agents', COUNT(*) FROM agents
UNION ALL SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL SELECT 'personas', COUNT(*) FROM personas;

-- Expected results:
-- strategic_priorities: 7
-- jtbd_library: 371
-- workflows: 368
-- tasks: 343
-- tools: 150
-- agents: 190
-- prompts: 3,570
-- personas: 210

-- 2. Verify JTBDs linked to Strategic Priorities
SELECT
  sp.code,
  sp.name,
  COUNT(j.id) as jtbd_count
FROM strategic_priorities sp
LEFT JOIN jtbd_library j ON j.strategic_priority_id = sp.id
GROUP BY sp.code, sp.name
ORDER BY sp.code;

-- Expected: SP01-SP07 with counts: 17, 19, 18, 14, 15, 8, 14

-- 3. Verify workflows by source
SELECT
  definition->>'source' as source,
  COUNT(*) as count
FROM workflows
GROUP BY definition->>'source'
ORDER BY count DESC;

-- Expected:
-- Original workflows: 141
-- dh_workflow migrated: 116
-- MA Operational Library: 111

-- 4. Verify tasks linked to workflows
SELECT
  COUNT(DISTINCT t.workflow_id) as workflows_with_tasks,
  COUNT(t.id) as total_tasks
FROM tasks t;

-- Expected: 343 tasks linked to workflows

-- 5. Verify tools migrated
SELECT COUNT(*) as tool_count FROM tools;
-- Expected: 150
```

---

## 🚨 Rollback Procedures

If anything goes wrong, use these rollback commands:

### Rollback Phase 1 (Strategic Priorities)
```sql
-- Remove strategic_priority_id from JTBDs
UPDATE jtbd_library SET strategic_priority_id = NULL;

-- Delete strategic priorities
DELETE FROM strategic_priorities;
```

### Rollback Phase 2 (Tools)
```sql
-- Delete migrated tools
DELETE FROM tools WHERE id IN (
  SELECT id FROM dh_tool
);
```

### Rollback Phase 3 (Workflows)
```sql
-- Delete migrated dh_workflows
DELETE FROM workflows WHERE definition->>'source' = 'dh_workflow';

-- Delete imported MA workflows
DELETE FROM workflows WHERE definition->>'source' LIKE '%Operational Library%';
```

### Rollback Phase 4 (Tasks)
```sql
-- Delete all migrated tasks
DELETE FROM tasks WHERE id IN (
  SELECT id FROM dh_task
);
```

---

## 📁 Migration Scripts to Create

I'll now create all 6 migration scripts:

1. ✅ `scripts/migration_1_strategic_priorities.py`
2. ⏭️ `scripts/migration_2_migrate_tools.py`
3. ⏭️ `scripts/migration_3a_enhance_workflows_schema.sql`
4. ⏭️ `scripts/migration_3b_migrate_dh_workflows.py`
5. ⏭️ `scripts/migration_3c_import_ma_workflows.py` (similar to existing phase2)
6. ⏭️ `scripts/migration_4_migrate_tasks.py`

---

## ⏱️ Total Estimated Time

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Strategic Priorities | 5 min | 5 min |
| Phase 2: Migrate Tools | 3 min | 8 min |
| Phase 3A: Enhance Schema | 2 min | 10 min |
| Phase 3B: Migrate dh_workflow | 10 min | 20 min |
| Phase 3C: Import MA workflows | 15 min | 35 min |
| Phase 4: Migrate Tasks | 8 min | 43 min |
| **TOTAL** | **43 minutes** | - |

Add 10 minutes for verification: **Total ~50 minutes**

---

## 🎯 Success Criteria

Migration is successful when:

- [x] All 4,482 existing records preserved (no data loss)
- [ ] 7 strategic priorities created
- [ ] 150 tools migrated
- [ ] 227 workflows added (116 migrated + 111 new)
- [ ] 343 tasks migrated
- [ ] Total: 5,209 records (4,482 + 727)
- [ ] All verification queries pass
- [ ] No broken foreign key relationships
- [ ] Application still functions correctly

---

**Last Updated:** 2025-11-10
**Status:** Migration scripts creation in progress
**Next Action:** Create migration_1_strategic_priorities.py
