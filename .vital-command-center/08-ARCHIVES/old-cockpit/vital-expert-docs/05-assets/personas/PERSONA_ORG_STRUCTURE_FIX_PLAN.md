# Persona Org Structure Fix Plan

**Date**: 2025-11-19  
**Issue**: 997 personas (666 + 331) missing `role_id`, `function_id`, and `department_id`  
**Status**: Ready for execution

---

## 📊 Current State

Based on your query results:

| Tenant ID | Total Personas | With Function | With Department | With Role | Missing Function | Missing Department |
|-----------|---------------|--------------|-----------------|-----------|------------------|-------------------|
| c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b | 666 | 0 (0%) | 0 (0%) | 0 (0%) | 666 | 666 |
| c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244 | 331 | 5 (1.51%) | 5 (1.51%) | 8 (2.42%) | 326 | 326 |
| f7aa6fd4-0af9-4706-8b31-034f1f7accda | 3 | 3 (100%) | 3 (100%) | 3 (100%) | 0 | 0 |

**Total unmapped**: 992 personas

---

## 🔍 Root Cause Analysis

Based on seed files in `sql/seeds/00_PREPARATION/`:

1. **Regulatory personas** (`LOAD_REGULATORY_118_PERSONAS.sql`): Use direct matching by `org_roles.name` during INSERT
2. **Medical Affairs/Market Access personas** (`CREATE_43_MEDICAL_AFFAIRS_ROLES_AND_MAP_PERSONAS.sql`): Use title-based pattern matching (ILIKE) in UPDATE statements
3. **Commercial personas** (`LOAD_COMMERCIAL_224_PERSONAS.sql`): Set `function_id` directly but may not set `role_id`

The issue: Personas in tenants `c6d221f8` and `c1977eb4` were likely loaded without proper org structure mapping.

---

## ✅ Solution Approach

Based on the transformation pipeline (`sql/tools/transformation_pipeline.py`) and seed file patterns, we'll use a **two-step matching strategy**:

### Step 1: Match by `role_slug` → `org_roles.slug` (Primary)
- This follows the transformation pipeline approach
- Matches `personas.role_slug` to `org_roles.slug` (case-insensitive)
- Populates `role_id`, `function_id`, and `department_id` from the matched role

### Step 2: Fallback to Title-Based Matching (Secondary)
- For personas that still don't have `role_id`
- Uses pattern matching: `personas.title ILIKE '%' || org_roles.name || '%'`
- This follows the pattern from `CREATE_43_MEDICAL_AFFAIRS_ROLES_AND_MAP_PERSONAS.sql`

### Step 3: Populate Missing Fields from Role
- For personas that have `role_id` but are missing `function_id` or `department_id`
- Populates from `org_roles.function_id` and `org_roles.department_id`

---

## 📝 Execution Steps

### Step 1: Diagnose Current State
```sql
-- Run: diagnose_personas_before_fix.sql
-- This will show:
-- - Overall statistics by tenant
-- - Sample role_slug values
-- - Potential matches
-- - Unmatched personas
```

### Step 2: Apply Fix
```sql
-- Run: fix_personas_org_structure_comprehensive_from_seeds.sql
-- This will:
-- 1. Match role_slug to org_roles.slug
-- 2. Fallback to title-based matching
-- 3. Populate function_id and department_id from roles
```

### Step 3: Verify Results
The fix script includes verification queries that will show:
- After-fix statistics
- Unmatched role_slug values (for manual review)
- Sample of matched personas
- Summary by tenant
- Remaining unmapped personas

---

## 🎯 Expected Outcomes

### Best Case Scenario
- **100% match rate**: All personas matched by `role_slug` → `org_roles.slug`
- All 992 personas get `role_id`, `function_id`, and `department_id`

### Realistic Scenario
- **80-95% match rate**: Most personas matched, some need manual review
- Remaining unmapped personas will be listed in Step 6 of the fix script

### If Matching Fails
If the match rate is low (<50%), we may need to:
1. Check if `org_roles` table has the necessary roles
2. Create missing roles based on `personas.role_slug` values
3. Use a more sophisticated matching algorithm

---

## 📋 Files Created

1. **`diagnose_personas_before_fix.sql`**
   - Diagnostic queries to understand current state
   - Shows potential matches
   - Identifies data quality issues

2. **`fix_personas_org_structure_comprehensive_from_seeds.sql`**
   - Comprehensive fix script
   - Uses both role_slug and title-based matching
   - Includes verification queries

3. **`PERSONA_ORG_STRUCTURE_FIX_PLAN.md`** (this file)
   - Documentation of the approach
   - Execution steps
   - Expected outcomes

---

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running the fix script
2. **Test on Staging**: If possible, test on a staging environment first
3. **Review Unmatched**: After running, review the list of unmatched personas (Step 6)
4. **Manual Mapping**: Some personas may need manual mapping if automatic matching fails
5. **Role Creation**: If many personas can't be matched, we may need to create missing roles in `org_roles`

---

## 🔄 Next Steps After Fix

1. **Verify Data Quality**: Run validation queries to ensure all mappings are correct
2. **Check Filters**: Test the persona filters in the UI to ensure they work correctly
3. **Create Missing Roles**: If needed, create roles for unmatched personas
4. **Update Seed Process**: Ensure future persona seeding includes proper org structure mapping

---

## 📞 Support

If you encounter issues:
1. Check the diagnostic script output first
2. Review the unmatched personas list
3. Check if `org_roles` has the necessary roles
4. Verify that roles have `function_id` and `department_id` populated

---

**Status**: ✅ Ready for execution  
**Risk Level**: Low (script is idempotent and only updates NULL values)  
**Estimated Time**: 5-10 minutes for execution + review time


