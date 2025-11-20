# Persona Org Structure Fix - Based on Seed File Analysis

**Date**: 2025-11-19  
**Analysis**: Review of actual seed files in `sql/seeds/00_PREPARATION/`  
**Status**: ✅ Ready for execution

---

## 🔍 Key Findings from Seed Files

### Pattern 1: Market Access & Regulatory Personas
**Files**: `LOAD_MARKET_ACCESS_157_PERSONAS.sql`, `LOAD_REGULATORY_118_PERSONAS.sql`, `GENERATE_MARKET_ACCESS_143_PERSONAS.sql`, `GENERATE_REGULATORY_57_PERSONAS.sql`

**Pattern**: Match by `org_roles.name` during INSERT
```sql
SELECT ... r.id, r.department_id, ...
FROM org_roles r
WHERE r.tenant_id = '...'
  AND r.function_id = '...'
  AND r.name = 'Chief Market Access Officer'  -- Exact name match
```

**Key Insight**: These personas are matched by **exact role name** during insertion.

### Pattern 2: Medical Affairs Personas (UPDATE statements)
**Files**: `SUPPLEMENT_MEDICAL_AFFAIRS_MAPPING.sql`, `CREATE_43_MEDICAL_AFFAIRS_ROLES_AND_MAP_PERSONAS.sql`

**Pattern**: Match by `org_roles.slug` with title ILIKE pattern
```sql
UPDATE personas p
SET role_id = r.id, department_id = r.department_id, function_id = r.function_id
FROM org_roles r
WHERE r.slug = 'chief-medical-officer'
  AND p.title ILIKE '%Chief Medical Officer%'  -- Title contains role name
```

**Key Insight**: These personas are matched by **role slug** with **title pattern matching**.

### Pattern 3: Commercial Personas
**File**: `LOAD_COMMERCIAL_224_PERSONAS.sql`

**Pattern**: Only sets `function_id` directly, no `role_id` or `department_id`
```sql
INSERT INTO personas (..., function_id, ...)
VALUES (..., '598c6096-4894-458c-be34-c82e13a743e8'::uuid, ...)
```

**Key Insight**: Commercial personas need to be matched separately (likely by title or role_slug).

---

## ✅ Comprehensive Fix Strategy

Based on the seed file patterns, our fix script uses a **three-step approach**:

### Step 1: Match by `role_slug` → `org_roles.slug` (Primary)
- Matches personas that have `role_slug` populated
- Uses case-insensitive comparison: `LOWER(TRIM(p.role_slug)) = LOWER(TRIM(r.slug))`
- Populates `role_id`, `function_id`, and `department_id` from matched role

### Step 2: Match by `title` → `org_roles.name` (Fallback)
- For personas that still don't have `role_id`
- Uses pattern matching: `p.title ILIKE '%' || r.name || '%'`
- This matches the pattern from Market Access and Medical Affairs seed files
- Includes logic to prefer more specific/longer matches

### Step 3: Populate Missing Fields from Role
- For personas that have `role_id` but are missing `function_id` or `department_id`
- Populates from `org_roles.function_id` and `org_roles.department_id`

---

## 📋 Execution Plan

### 1. Run Diagnostic Script First
```sql
-- Run: diagnose_personas_before_fix.sql
-- This will show:
-- - Current state by tenant
-- - Sample role_slug values
-- - Potential matches
-- - Data quality issues
```

### 2. Run Fix Script
```sql
-- Run: fix_personas_org_structure_comprehensive_from_seeds.sql
-- This will:
-- 1. Match role_slug to org_roles.slug
-- 2. Fallback to title-based matching
-- 3. Populate function_id and department_id from roles
```

### 3. Review Results
The fix script includes verification queries showing:
- After-fix statistics
- Unmatched role_slug values
- Sample of matched personas
- Summary by tenant
- Remaining unmapped personas

---

## 🎯 Expected Outcomes

### Best Case (80-95% match rate)
- Most personas matched by `role_slug` → `org_roles.slug`
- Remaining matched by `title` → `org_roles.name`
- All three fields populated for 800-950 personas

### Realistic Case (60-80% match rate)
- Some personas matched, some need manual review
- Remaining unmapped personas listed for manual mapping
- May need to create missing roles in `org_roles`

### If Low Match Rate (<50%)
- Check if `org_roles` table has necessary roles
- Review unmatched `role_slug` values
- Consider creating missing roles based on persona data

---

## 📊 Current State (from your query)

| Tenant ID | Total | With Function | With Department | With Role | Missing |
|-----------|-------|---------------|-----------------|-----------|---------|
| c6d221f8-... | 666 | 0 (0%) | 0 (0%) | 0 (0%) | 666 |
| c1977eb4-... | 331 | 5 (1.51%) | 5 (1.51%) | 8 (2.42%) | 326 |
| f7aa6fd4-... | 3 | 3 (100%) | 3 (100%) | 3 (100%) | 0 |

**Total to fix**: 992 personas

---

## ⚠️ Important Notes

1. **Tenant-Specific Matching**: The seed files show that matching is often tenant-specific. Ensure `org_roles` has roles for all tenants.

2. **Role Name vs Slug**: 
   - Market Access/Regulatory use `org_roles.name` (exact match)
   - Medical Affairs use `org_roles.slug` (with title pattern)
   - Our fix tries both approaches

3. **Commercial Personas**: These only have `function_id` set. They'll need title-based matching to find roles.

4. **Multiple Matches**: The script includes logic to prefer more specific matches when multiple roles match.

---

## 🔄 Next Steps After Fix

1. **Verify Data Quality**: Run validation queries
2. **Check Filters**: Test persona filters in UI
3. **Create Missing Roles**: If needed, create roles for unmatched personas
4. **Update Seed Process**: Ensure future seeding includes proper org structure mapping

---

## 📁 Files Created

1. **`diagnose_personas_before_fix.sql`** - Diagnostic queries
2. **`fix_personas_org_structure_comprehensive_from_seeds.sql`** - Comprehensive fix script
3. **`PERSONA_FIX_BASED_ON_SEED_FILES.md`** - This document

---

**Status**: ✅ Ready for execution  
**Risk Level**: Low (script is idempotent, only updates NULL values)  
**Estimated Time**: 5-10 minutes execution + review time

