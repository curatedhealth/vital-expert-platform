# 🔧 HOTFIX: UC_CD_010 Part 2 - Invalid `on_failure` Value

## Issue
**Error**: `new row for relation "dh_task_agent" violates check constraint "chk_task_agent_failure"`

**Root Cause**: Used invalid value `CONTINUE` for `on_failure` column in `dh_task_agent` table.

## Valid Values for `on_failure`
Per check constraint `chk_task_agent_failure`:
- ✅ `ESCALATE_TO_HUMAN`
- ✅ `RETRY`
- ✅ `FALLBACK_AGENT`
- ✅ `FAIL`
- ✅ `SKIP`
- ❌ ~~`CONTINUE`~~ (INVALID)

## Fix Applied
**File**: `15_cd_010_protocol_development_part2.sql`

**Line 106**: Changed `on_failure` from `CONTINUE` to `SKIP` for AGT-BIOSTATISTICS REVIEWER assignment in Task TSK-CD-010-02.

```sql
-- BEFORE (INCORRECT):
('TSK-CD-010-02', 'AGT-BIOSTATISTICS', 'REVIEWER', 2, false, 1, 'NONE', true, NULL, NULL, 'CONTINUE', ...

-- AFTER (CORRECTED):
('TSK-CD-010-02', 'AGT-BIOSTATISTICS', 'REVIEWER', 2, false, 1, 'NONE', true, NULL, NULL, 'SKIP', ...
```

## Documentation Updated
**File**: `SCHEMA_REFERENCE_FINAL.md`

Added complete list of valid values for all CHECK constraints in `dh_task_agent`:
- `assignment_type` valid values
- `retry_strategy` valid values
- **`on_failure` valid values** ← NEW
- **`approval_stage` valid values** ← NEW

## Status
✅ **FIXED** - UC_CD_010 Part 2 is now ready for execution.

## Prevention
- Always refer to `SCHEMA_REFERENCE_FINAL.md` for valid CHECK constraint values
- Pre-validate with `validate_seed_file.py` (though this validates codes, not constraint values)
- When adding new agent assignments, double-check constraint values

---

**Date**: November 2, 2025  
**Impact**: Single line change in UC_CD_010 Part 2  
**Severity**: Minor - caught before production deployment

