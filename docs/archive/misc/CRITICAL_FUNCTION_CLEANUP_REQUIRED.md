# CRITICAL: Function Duplicates Cleanup Required ⚠️

**Date:** 2025-11-10
**Severity:** HIGH - Data integrity issue affecting UX
**Impact:** 105 functions with 18+ exact duplicates, ~15 estimated unique

---

## 🚨 Problem Summary

### Current State:
- **Total functions in `org_functions` table:** 105
- **Exact duplicates:** 18+
- **Estimated unique functions:** ~15-20
- **Duplicate ratio:** **83% are duplicates or variations!**

### Examples of Duplicates:

**Exact Duplicates (Same Name, Different IDs):**
- ❌ "Clinical Development" (2 times)
- ❌ "Clinical & Medical" (2 times)
- ❌ "Commercial" (2 times)
- ❌ "Commercial & Market Access" (3 times)
- ❌ "Digital Health & Innovation" (2 times)
- ❌ "Manufacturing & Operations" (2 times)
- ❌ "Medical Affairs" (2 times)
- ❌ "Quality & Compliance" (3 times)
- ❌ "Regulatory Affairs" (2 times)
- ❌ "Regulatory & Quality" (2 times)
- ❌ "Research & Development" (3 times)

**Variations (Similar Names):**
- ⚠️  "Medical Affairs" + 25 variations:
  - "Medical Affairs - Field Leadership"
  - "Medical Affairs - HEOR Leadership"
  - "Medical Affairs - Scientific Writing"
  - "Medical Affairs & Clinical Operations"
  - "Medical Affairs & Pharmacy"
  - ... and 20 more!

---

## 💡 Solution

The normalization architecture has already been designed and scripts created:

### Phase 1: Normalize to `functions` table (NEW)
Use the scripts created earlier:
1. ✅ [scripts/create_normalized_tables.sql](scripts/create_normalized_tables.sql) - Creates normalized `functions` table
2. ✅ [scripts/seed_functions_departments.py](scripts/seed_functions_departments.py) - Seeds 14 canonical functions
3. ✅ [scripts/migrate_persona_references.py](scripts/migrate_persona_references.py) - Maps personas to normalized structure

### Phase 2: Consolidate `org_functions` duplicates
Need new script to:
1. Identify all 18+ exact duplicates in `org_functions`
2. Choose canonical version (usually oldest or most used)
3. Migrate all `org_roles` and `org_departments` references
4. Migrate all `dh_personas` and `org_personas` references
5. Delete duplicate entries

### Phase 3: Map to normalized `functions` table
1. Map remaining 90 unique `org_functions` to 14 canonical `functions`
2. Update personas to use normalized `function_id`
3. Deprecate `org_functions` usage in favor of normalized `functions`

---

## 🎯 Recommended Approach

### Option A: Quick Fix (Consolidate Duplicates Only)
**Time:** ~30 minutes
**Risk:** LOW

1. Run consolidation script to merge exact duplicates
2. Keep `org_functions` table but with ~90 unique entries instead of 105

**Pros:**
- Quick fix, minimal disruption
- Reduces duplicates immediately

**Cons:**
- Still have 90 functions (should be ~15)
- Doesn't solve root normalization issue

### Option B: Complete Normalization (Recommended)
**Time:** ~2 hours
**Risk:** MEDIUM (requires testing)

1. Run [EXECUTE_NORMALIZATION.md](EXECUTE_NORMALIZATION.md) guide
2. Create `functions`, `departments`, `roles` normalized tables
3. Migrate all personas to use normalized structure
4. Deprecate `org_functions`, `org_departments`, `org_roles`

**Pros:**
- Proper normalized architecture
- Single source of truth (14-20 canonical functions)
- Eliminates all duplicates permanently
- Supports industry-specific functions

**Cons:**
- Requires more time
- Needs UI updates
- More testing required

---

## 📊 Detailed Duplicate Analysis

### Exact Duplicates Found:

| Function Name | Count | IDs |
|---------------|-------|-----|
| Clinical Development | 2 | b6a569ea..., 355a0c33... |
| Clinical & Medical | 2 | 9bc8dbc9..., bb5def91... |
| Commercial | 2 | 25fe5d84..., 8dcf64c3... |
| Commercial & Market Access | 3 | 115bf0d4..., a66e04b2..., 03431d38... |
| Digital Health & Innovation | 2 | bc56d29b..., b2b24035... |
| Manufacturing & Operations | 2 | f40662d4..., 567fba58... |
| Market Access & HEOR | 2 | 4f3e7fa2..., ed81a7f9... |
| Medical Affairs | 2 | 3b42b4d4..., 91ff36a2... |
| Quality & Compliance | 3 | cc095fc3..., b2aad738..., 9e406ba4... |
| Regulatory Affairs | 2 | 40dd5c4a..., 2dfcfb97... |
| Regulatory & Quality | 2 | 64bc5b10..., 1b9fe2d0... |
| Research & Development | 3 | efabb89e..., 0be08050..., fa3e03f1... |

---

## 🚀 Immediate Action Required

### Critical Issue #1: Function Duplicates
**Priority:** HIGH
**Blocking:** User experience, data integrity

**Action:**
```bash
# Option A: Quick consolidation
python3 scripts/cleanup_org_function_duplicates.py

# Option B: Full normalization (recommended)
# See EXECUTE_NORMALIZATION.md
```

### Critical Issue #2: JTBD-Persona Mapping
**Priority:** HIGH
**User Report:** "Many personas have no JTBD"

**Root Cause:** Likely mapping table `jtbd_org_persona_mapping` has gaps

**Action:**
```bash
python3 scripts/verify_jtbd_persona_mapping.py
```

### Critical Issue #3: No Icon Avatars
**Priority:** MEDIUM
**Enhancement:** Add Lucide React icons to personas

**Action:**
Update PersonaCard component to show role-based icons

---

## 📋 Next Steps

**Immediate (Today):**
1. ✅ Create `cleanup_org_function_duplicates.py` script
2. ✅ Run consolidation to merge exact duplicates (105 → ~90)
3. ✅ Verify JTBD-Persona mapping integrity
4. ✅ Add icon avatars to PersonaCard component

**Short-term (This Week):**
1. Execute full normalization ([EXECUTE_NORMALIZATION.md](EXECUTE_NORMALIZATION.md))
2. Migrate personas to normalized `functions` table
3. Update UI to use normalized data
4. Test thoroughly

**Long-term (Next Week):**
1. Add database constraints to prevent future duplicates
2. Update import scripts to use normalized tables
3. Deprecate `org_functions`, `org_departments`, `org_roles`
4. Documentation updates

---

## 🔍 How Duplicates Occurred

**Analysis:**
1. Multiple data imports from different sources (dh_personas, org_personas)
2. No unique constraints on function names
3. Case-sensitive vs case-insensitive matching issues
4. No validation during import
5. Manual entries without checking existing data

**Prevention:**
```sql
-- Add unique constraint
ALTER TABLE org_functions
ADD CONSTRAINT org_functions_name_unique UNIQUE (org_function);

-- Or use normalized functions table with proper constraints
```

---

**Status:** 🔴 CRITICAL - Requires immediate attention
**Next Action:** Create consolidation script and run it
**Estimated Fix Time:** Option A: 30 min | Option B: 2 hours
