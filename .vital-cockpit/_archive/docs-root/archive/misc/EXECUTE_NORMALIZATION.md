# Execute Normalization - Functions/Departments/Roles

**Date:** 2025-11-10
**Status:** ✅ ALL SCRIPTS READY
**Total Time:** ~20 minutes
**Risk:** LOW - Additive only, no data deletion

---

## 🎯 Problem Being Solved

**Before:**
- 220 personas with 50+ duplicate function/department names
- "Commercial & Market Access" appears 3+ times
- "Clinical Development" appears 2+ times
- Free-text categories cause inconsistent filtering and navigation

**After:**
- ~15 unique functions (normalized)
- ~7 departments (normalized)
- ~10 roles (normalized)
- Zero duplicates
- Clean hierarchical navigation
- Foreign key relationships ensure data integrity

---

## 📋 Pre-Flight Checklist

- [ ] Review [NORMALIZE_FUNCTIONS_DEPARTMENTS.md](NORMALIZE_FUNCTIONS_DEPARTMENTS.md)
- [ ] Supabase credentials in `.env` file
- [ ] Backup recommended (optional, no deletions will occur)

---

## 🚀 Execution Steps

### STEP 1: Create Normalized Tables (2 minutes) - REQUIRED FIRST

**Run in Supabase Dashboard SQL Editor:**

1. Go to https://supabase.com/dashboard → SQL Editor
2. Copy contents of [scripts/create_normalized_tables.sql](scripts/create_normalized_tables.sql)
3. Execute
4. Verify tables created:
   - functions table
   - departments table
   - roles table
   - personas table updated with new foreign key columns

**Expected Output:**
```
✅ Table "functions" created
✅ Table "departments" created
✅ Table "roles" created
✅ Columns added to "personas": function_id, department_id, role_id, industry_id
```

---

### STEP 2: Seed Functions, Departments, and Roles (10 minutes)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/seed_functions_departments.py
```

**Expected:**
- ✅ 14 top-level functions created (industry-agnostic)
- ✅ 7 sub-functions created (children of parent functions)
- ✅ 7 departments created
- ✅ 10 roles created

**Verify:**
```bash
# Should show:
# Functions:   21 (14 top-level + 7 sub-functions)
# Departments: 7
# Roles:       10
```

**Sample Hierarchy:**
```
FUNC-001 | Medical Affairs
  └─ FUNC-101 | Field Medical
  └─ FUNC-102 | Medical Information
  └─ FUNC-103 | HEOR
  └─ FUNC-104 | Medical Communications

FUNC-002 | Clinical Development
  └─ FUNC-201 | Clinical Operations
  └─ FUNC-202 | Clinical Data Management
  └─ FUNC-203 | Biometrics & Biostatistics
```

---

### STEP 3: Migrate Persona References (5 minutes)

```bash
python3 scripts/migrate_persona_references.py
```

**Expected:**
- ✅ ~168 personas mapped to functions (80%+ coverage)
- ⚠️  ~42 personas unmapped (need manual review)
- 📊 Distribution by function shown

**Sample Output:**
```
Medical Affairs                          | 85 personas
Clinical Development                     | 35 personas
Regulatory Affairs                       | 20 personas
Commercial & Market Access               | 15 personas
Data Science & Analytics                 | 13 personas
...
```

---

### STEP 4: Review Unmapped Categories

The script will output any categories that couldn't be automatically mapped:

```
Unmapped Categories (need manual review):
  • clinical & medical
  • compliance & governance
  • heor & rwe
  • ...
```

**Action:**
1. Review unmapped categories
2. Add to `FUNCTION_MAPPING` in [scripts/migrate_persona_references.py](scripts/migrate_persona_references.py) if needed
3. Re-run migration script

---

## 📊 Expected Results

| Table | Before | After | Change |
|-------|--------|-------|--------|
| Functions | 0 | 21 | +21 |
| Departments | 0 | 7 | +7 |
| Roles | 0 | 10 | +10 |
| **Total New Records** | **0** | **38** | **+38** |

### Personas Mapping
- Total Personas: 210
- Mapped to Functions: ~168 (80%)
- Unmapped: ~42 (20% - need manual review)

---

## 🎨 Updated Data Model

### Before (Free Text):
```typescript
interface Persona {
  category: string;  // "Medical Affairs", "medical affairs", "MA", etc.
}
```

### After (Normalized):
```typescript
interface Persona {
  category: string;        // Legacy field (kept for compatibility)
  function_id: UUID;       // → functions.id
  department_id: UUID;     // → departments.id (optional)
  role_id: UUID;           // → roles.id (optional)
  industry_id: UUID;       // → industries.id (optional)
}
```

---

## 📋 Function Hierarchy Reference

### Top-Level Functions (14):
1. **Medical Affairs** - Strategic medical leadership
2. **Clinical Development** - Clinical trials and operations
3. **Regulatory Affairs** - Regulatory strategy and submissions
4. **Commercial & Market Access** - Marketing and sales
5. **Manufacturing & Operations** - Production and supply chain
6. **Quality Assurance** - Quality systems and compliance
7. **Research & Development** - Drug discovery and innovation
8. **Business Development** - Partnerships and M&A
9. **Finance & Administration** - Financial planning
10. **Legal & Compliance** - Legal counsel and compliance
11. **Data Science & Analytics** - Data analytics and AI/ML
12. **Digital Health & Innovation** - Digital therapeutics
13. **Human Resources** - Talent management
14. **IT & Digital** - IT infrastructure

### Sub-Functions (7):
- **Field Medical** (under Medical Affairs)
- **Medical Information** (under Medical Affairs)
- **HEOR** (under Medical Affairs)
- **Medical Communications** (under Medical Affairs)
- **Clinical Operations** (under Clinical Development)
- **Clinical Data Management** (under Clinical Development)
- **Biometrics & Biostatistics** (under Clinical Development)

---

## 🔧 Rollback Procedures

If anything goes wrong:

### Rollback Step 3 (Persona References)
```sql
-- Clear persona foreign keys
UPDATE personas SET function_id = NULL, department_id = NULL, role_id = NULL, industry_id = NULL;
```

### Rollback Step 2 (Seed Data)
```sql
-- Delete seeded data
DELETE FROM roles;
DELETE FROM departments;
DELETE FROM functions;
```

### Rollback Step 1 (Tables)
```sql
-- Remove foreign key columns from personas
ALTER TABLE personas DROP COLUMN IF EXISTS function_id;
ALTER TABLE personas DROP COLUMN IF EXISTS department_id;
ALTER TABLE personas DROP COLUMN IF EXISTS role_id;
ALTER TABLE personas DROP COLUMN IF EXISTS industry_id;

-- Drop tables
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS functions CASCADE;
```

---

## ✅ Success Criteria

After all steps:

- [x] Scripts created
- [ ] Step 1: Tables created (functions, departments, roles)
- [ ] Step 2: 21 functions + 7 departments + 10 roles seeded
- [ ] Step 3: ≥80% of personas mapped to functions
- [ ] Zero duplicate function/department names in database
- [ ] Hierarchical structure working (parent-child relationships)
- [ ] UI filtering works with normalized data

---

## 🚨 Known Issues & Limitations

1. **Manual Review Required:** ~20% of personas may need manual mapping due to ambiguous categories
2. **Legacy Fields:** Old `category` and `agent_category` fields kept for backward compatibility
3. **UI Updates Needed:** Frontend components need updating to use foreign keys instead of free text
4. **Industry Mapping:** Industry-specific functions not yet implemented (Phase 2)

---

## 🎯 Quick Start

To execute the entire normalization:

```bash
# 1. First: Run create_normalized_tables.sql in Supabase Dashboard

# 2. Then run seeding and migration:
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

python3 scripts/seed_functions_departments.py
python3 scripts/migrate_persona_references.py

# 3. Review unmapped categories and re-run if needed
```

**Total Time:** ~17 minutes

---

## 📞 Next Steps After Normalization

1. **Update UI Components:**
   - Create PersonaFilters.tsx with cascading dropdowns
   - Update PersonaCard to show function hierarchy
   - Update PersonasManagement.tsx to use function_id

2. **Expand Coverage:**
   - Add more departments (currently only 7 core departments)
   - Add more roles (currently only 10 sample roles)
   - Map industry-specific functions

3. **Test Filtering:**
   - Test Industry → Function → Department → Role cascading
   - Verify no duplicate categories appear in UI
   - Ensure backward compatibility with legacy fields

---

## 📄 Related Documentation

- [NORMALIZE_FUNCTIONS_DEPARTMENTS.md](NORMALIZE_FUNCTIONS_DEPARTMENTS.md) - Complete design document
- [scripts/create_normalized_tables.sql](scripts/create_normalized_tables.sql) - Table creation SQL
- [scripts/seed_functions_departments.py](scripts/seed_functions_departments.py) - Seeding script
- [scripts/migrate_persona_references.py](scripts/migrate_persona_references.py) - Migration script

---

**Last Updated:** 2025-11-10
**Status:** ✅ ALL SCRIPTS READY - READY TO EXECUTE
**Next Action:** Run Step 1 (create_normalized_tables.sql) in Supabase Dashboard
