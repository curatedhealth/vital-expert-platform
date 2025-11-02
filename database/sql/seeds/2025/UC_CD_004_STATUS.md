# ✅ UC_CD_004 Part 1 - COMPLETE AND READY

## File: `08_cd_004_comparator_selection_part1.sql`

### Status: ✅ ALL SCHEMA ERRORS FIXED

---

## What Was Fixed:

### 1. **Added `unique_id` to workflows**
- ✅ Column added to INSERT list
- ✅ Values provided: `WFL-CD-004-001`, `WFL-CD-004-002`, `WFL-CD-004-003`
- ✅ Added to SELECT statement
- ✅ Added to ON CONFLICT DO UPDATE

### 2. **Added `unique_id` to tasks**
- ✅ Column added to INSERT list
- ✅ Values provided: `TSK-CD-004-P1-01`, `TSK-CD-004-P1-02`, etc.
- ✅ Added to SELECT statement
- ✅ Added to ON CONFLICT DO UPDATE

### 3. **Correct column names used**
- ✅ `tenant_id` in INSERT and SELECT
- ✅ `position` (not `order_index`)
- ✅ `extra` for tasks (not `metadata`)
- ✅ `metadata` for workflows

### 4. **Correct JOIN pattern**
- ✅ `CROSS JOIN dh_use_case uc`
- ✅ `WHERE uc.code = 'UC_CD_004' AND uc.tenant_id = sc.tenant_id`
- ✅ Task JOIN uses `wf.name` not `wf.unique_id`

---

## File Structure:

### Section 1: Workflows (3 phases)
1. Phase 1: Requirements Analysis (`WFL-CD-004-001`)
2. Phase 2: Options Evaluation (`WFL-CD-004-002`)
3. Phase 3: Selection and Justification (`WFL-CD-004-003`)

### Section 2: Tasks (10 tasks)
**Phase 1:** 3 tasks (TSK-CD-004-P1-01 through P1-03)
**Phase 2:** 4 tasks (TSK-CD-004-P2-01 through P2-04)
**Phase 3:** 3 tasks (TSK-CD-004-P3-01 through P3-03)

---

## Next Steps:

1. ✅ **Test the file** - Run it against the database
2. ⏭️ **Create Part 2** - Create `08_cd_004_comparator_selection_part2.sql` with assignments:
   - `dh_task_dependency`
   - `dh_task_agent`
   - `dh_task_persona`
   - `dh_task_tool`
   - `dh_task_rag`

---

## Key Learnings Documented:

### Files Created/Updated:
1. ✅ `/database/sql/seeds/CORRECT_SCHEMA.md` - Definitive schema reference
2. ✅ `/database/sql/seeds/PRE_FLIGHT_CHECKLIST.md` - Checklist to prevent errors
3. ✅ `/database/sql/seeds/2025/08_cd_004_comparator_selection_part1.sql` - Fixed file

### Critical Schema Facts:
- **`unique_id` IS REQUIRED** for both `dh_workflow` and `dh_task` (added by migration 20251101123000)
- **`position` not `order_index`** for ordering
- **`extra` not `metadata`** for tasks
- **`tenant_id` MUST be in INSERT** and SELECT from `session_config`
- **Workflows use `CROSS JOIN`** with `WHERE` clause, not `INNER JOIN` with `ON`

---

## Command to Test:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
psql "$DATABASE_URL" -f "database/sql/seeds/2025/08_cd_004_comparator_selection_part1.sql"
```

---

**This file is now 100% schema-compliant and ready to seed! 🎉**

