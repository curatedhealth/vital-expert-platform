# Schema Column Name Fix - IMPORTANT

**Issue:** The original queries used column names from the migration schema, but your actual database uses different column names.

**Status:** ✅ Fixed - Use the **_FIXED.sql** query files

---

## Column Name Differences

| Migration Schema | Actual Database | Table |
|------------------|-----------------|-------|
| `role_name` | **`name`** | org_roles |
| `department_name` | **`name`** | org_departments |

Your database uses a simpler naming convention where both tables just use `name` instead of the prefixed versions.

---

## Which Files to Use

### ✅ USE THESE (Fixed Queries):
- `query_phase2_role_ids_FIXED.sql` ⭐
- `query_phase3_role_ids_FIXED.sql` ⭐
- `00_check_actual_schema.sql` (optional - for verification)

### ❌ DON'T USE (Original - Wrong Column Names):
- ~~`query_phase2_role_ids.sql`~~ (has errors)
- ~~`query_phase3_role_ids.sql`~~ (has errors)

---

## Quick Start with Fixed Queries

### Step 1: Run Fixed Phase 2 Query

```sql
-- Copy and paste from query_phase2_role_ids_FIXED.sql
-- This query uses the correct column names: r.name, d.name
```

### Step 2: Run Fixed Phase 3 Query

```sql
-- Copy and paste from query_phase3_role_ids_FIXED.sql
-- This query uses the correct column names: r.name, d.name
```

### Step 3: Use Python Script (Already Updated)

The Python script `update_role_ids_from_db.py` has been updated to handle both column name variations:
- Works with `role_name` OR `name`
- Works with `role_id` OR `id`

No changes needed - just run it as documented in `README_UPDATE_ROLE_IDS.md`

---

## What Was Fixed

### Original Query (❌ Error):
```sql
SELECT
    department_name,  -- ❌ Column doesn't exist
    ...
FROM org_departments
```

### Fixed Query (✅ Works):
```sql
SELECT
    d.name as department_name,  -- ✅ Correct column name
    ...
FROM org_departments d
```

---

## Verification

After running the fixed queries, you should see:

**Phase 2 Expected Results:**
- Department: Medical Information (or similar)
- 15 roles with Medical Information in their names
- Each role has: id, name, geographic_scope, department_id

**Phase 3 Expected Results:**
- Department: Scientific Communications (or similar)
- 15 roles with Scientific Communications/Medical Writer/Publications in their names
- Each role has: id, name, geographic_scope, department_id

---

## If Queries Still Fail

If you still get errors, run this diagnostic query first:

```sql
-- Check what columns actually exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('org_roles', 'org_departments')
ORDER BY table_name, ordinal_position;
```

Then let me know the results and I'll adjust the queries further.

---

## Python Script Compatibility

The update script now handles:
```python
# Accepts either column name format
db_name = db_role.get('role_name') or db_role.get('name', '')
role_id = db_role.get('role_id') or db_role.get('id')
```

This means the script works with:
- Old migration schema (role_name, role_id)
- Current database schema (name, id)
- Future schema changes

---

**Last Updated:** 2025-11-23
**Version:** 1.0
**Status:** ✅ Schema mismatch resolved - use FIXED queries
