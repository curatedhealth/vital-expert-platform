# Seed Files Execution Order

**Directory:** `.vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/`

---

## 📋 Current File Status

### ✅ Ready to Use (SQL Seed Files)

| File | Records | Purpose | Status |
|------|---------|---------|--------|
| `00_run_all_reference_data_seeds.sql` | Master | Runs all 3 reference seeds | ✅ Ready |
| `01_seed_regulatory_frameworks.sql` | 20 | ICH GCP, FDA, PhRMA, HIPAA | ✅ Ready |
| `02_seed_gxp_training_modules.sql` | 15 | GCP, GVP, pharmacovigilance | ✅ Ready |
| `03_seed_clinical_competencies.sql` | 36 | MAPS framework competencies | ✅ Ready |
| `create_missing_roles.sql` | 4 | Creates missing roles | ✅ Ready |

### 🔄 Need Transformation (JSON Files)

| File | Roles | Status | Next Step |
|------|-------|--------|-----------|
| `phase1_field_medical_enrichment.json` | 15 | ✅ 100% complete | Transform to SQL |
| `phase2_medical_information_enrichment.json` | 15 | ⚠️ 93% complete | Complete missing role first |
| `phase3_scientific_communications_enrichment.json` | 15 | ⚠️ 80% complete | Complete missing roles first |

### ❌ Not Seed Files (Query/Utility Files)

| File | Purpose | Use Case |
|------|---------|----------|
| `query_phase2_role_ids*.sql` | Database queries | NOT for seeding - for lookups only |
| `00_check_actual_schema.sql` | Schema verification | NOT for seeding - diagnostic only |

---

## 🎯 Execution Order (Step-by-Step)

### Phase 1: Prerequisites ✅ (Do First)

**1a. Seed Reference Data** (Run once, foundation for everything)

```bash
# Option A: Run master script (recommended)
psql $DATABASE_URL -f 00_run_all_reference_data_seeds.sql

# Option B: Run individually
psql $DATABASE_URL -f 01_seed_regulatory_frameworks.sql
psql $DATABASE_URL -f 02_seed_gxp_training_modules.sql
psql $DATABASE_URL -f 03_seed_clinical_competencies.sql
```

**Verification:**
```sql
SELECT
  (SELECT COUNT(*) FROM regulatory_frameworks WHERE is_current = true) as frameworks,
  (SELECT COUNT(*) FROM gxp_training_modules) as training,
  (SELECT COUNT(*) FROM clinical_competencies) as competencies;
-- Expected: 20 | 15 | 36
```

**1b. Create Missing Roles** (Must complete before enrichment)

```bash
psql $DATABASE_URL -f create_missing_roles.sql
```

**Verification:**
```sql
-- Should show 4 new roles
SELECT name, geographic_scope, id
FROM org_roles
WHERE name IN (
    'Global Medical Information Specialist',
    'Global Publications Lead',
    'Regional Publications Lead',
    'Local Publications Lead'
);
```

**1c. Update Enrichment Files** (Get to 100%)

```bash
# Copy UUIDs from Step 1b output
# Update apply_role_ids_from_export.py with UUIDs
python3 apply_role_ids_from_export.py
```

**Verification:**
```bash
grep -c '"TBD"' phase2_medical_information_enrichment.json  # Expected: 0
grep -c '"TBD"' phase3_scientific_communications_enrichment.json  # Expected: 0
```

---

### Phase 2: Transform JSON to SQL 🔨 (Need to Create)

**Current situation:** JSON files are NOT directly usable as seeds - they need transformation.

**What needs to be created:**

```python
# Create these transformation scripts:
transform_phase1_to_sql.py  # Converts phase1 JSON → SQL
transform_phase2_to_sql.py  # Converts phase2 JSON → SQL
transform_phase3_to_sql.py  # Converts phase3 JSON → SQL
```

**What they will generate:**

```sql
phase1_enrichment_deployment.sql  # UPDATE statements + INSERTs for junction tables
phase2_enrichment_deployment.sql  # UPDATE statements + INSERTs for junction tables
phase3_enrichment_deployment.sql  # UPDATE statements + INSERTs for junction tables
```

**Each deployment SQL will contain:**
1. UPDATE statements for org_roles table (54 attributes per role)
2. INSERT statements for role_regulatory_frameworks
3. INSERT statements for role_gxp_training
4. INSERT statements for role_clinical_competencies
5. INSERT statements for role_kpis

---

### Phase 3: Deploy Enrichment 🚀 (After Phase 2)

```bash
# Run in order:
psql $DATABASE_URL -f phase1_enrichment_deployment.sql
psql $DATABASE_URL -f phase2_enrichment_deployment.sql
psql $DATABASE_URL -f phase3_enrichment_deployment.sql
```

**Verification:**
```sql
-- Check all 45 roles enriched
SELECT COUNT(*)
FROM org_roles
WHERE description IS NOT NULL
  AND array_length(required_skills, 1) > 0
  AND department_id IN (
    SELECT id FROM org_departments
    WHERE function_id = '06127088-4d52-40aa-88c9-93f4e79e085a'
  );
-- Expected: 45

-- Check junction tables populated
SELECT
  'Regulatory Frameworks' as table_name,
  COUNT(*) as records
FROM role_regulatory_frameworks
UNION ALL
SELECT 'GxP Training', COUNT(*) FROM role_gxp_training
UNION ALL
SELECT 'Competencies', COUNT(*) FROM role_clinical_competencies
UNION ALL
SELECT 'KPIs', COUNT(*) FROM role_kpis;
-- Expected: ~225 for frameworks, ~270 for training, ~405 for competencies, ~225 for KPIs
```

---

## 📊 Summary: What to Use When

### ✅ Use NOW (Ready SQL Seeds):

1. **`00_run_all_reference_data_seeds.sql`** ⭐
   - Run FIRST
   - Seeds all foundation data (71 records)
   - Required before any enrichment

2. **`create_missing_roles.sql`** ⭐
   - Run SECOND
   - Creates 4 missing roles
   - Required to complete 100%

### 🔨 Create NEXT (Transformation Scripts):

3. **Need to create these Python scripts:**
   - `transform_phase1_to_sql.py`
   - `transform_phase2_to_sql.py`
   - `transform_phase3_to_sql.py`

4. **They will generate these SQL files:**
   - `phase1_enrichment_deployment.sql`
   - `phase2_enrichment_deployment.sql`
   - `phase3_enrichment_deployment.sql`

### 🚀 Use LAST (Generated Deployment SQL):

5. **Run the generated SQL files** (from step 4)
   - Deploys actual enrichment data
   - Updates 45 roles with all attributes
   - Populates junction tables

### ❌ Do NOT Use for Seeding:

- `query_phase2_role_ids.sql` / `query_phase2_role_ids_FIXED.sql` - Query tools only
- `query_phase3_role_ids.sql` / `query_phase3_role_ids_FIXED.sql` - Query tools only
- `00_check_actual_schema.sql` - Diagnostic tool only
- `phase1_field_medical_enrichment.json` - Not SQL, needs transformation
- `phase2_medical_information_enrichment.json` - Not SQL, needs transformation
- `phase3_scientific_communications_enrichment.json` - Not SQL, needs transformation

---

## 🎯 Quick Start Checklist

- [ ] **Step 1:** Run `00_run_all_reference_data_seeds.sql` (2 min)
- [ ] **Step 2:** Run `create_missing_roles.sql` (2 min)
- [ ] **Step 3:** Update and re-run `apply_role_ids_from_export.py` (5 min)
- [ ] **Step 4:** Create transformation scripts (30-45 min) ⚠️ **NEED HELP WITH THIS**
- [ ] **Step 5:** Run generated deployment SQL files (5 min)
- [ ] **Step 6:** Validate with verification queries (5 min)

**Total Time:** ~1 hour (including transformation script creation)

---

## 🆘 Current Blocker

**You are currently at:** Step 3 (need to complete missing roles to 100%)

**Next blocker:** Step 4 - transformation scripts don't exist yet

**I can help with:**
- Creating the transformation scripts (Step 4)
- Reviewing generated SQL before deployment
- Writing validation queries
- Troubleshooting any issues

---

## 💡 What You Asked vs. What's Available

**You asked:** "Which seed files should I use?"

**Answer:**

**Use immediately:**
1. `00_run_all_reference_data_seeds.sql` ✅
2. `create_missing_roles.sql` ✅

**Can't use yet:**
- The 3 JSON files are NOT SQL seeds - they need transformation first
- I need to create transformation scripts to convert JSON → SQL

**Would you like me to create the transformation scripts now?** This is the critical next step to make the enrichment data usable.

---

**Last Updated:** 2025-11-23
**Current Phase:** Prerequisites (Step 1-3)
**Next Phase:** Transformation (Step 4) - **Need to create scripts**
