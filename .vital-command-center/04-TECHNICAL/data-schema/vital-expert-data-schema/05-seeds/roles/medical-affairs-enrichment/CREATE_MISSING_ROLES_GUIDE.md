# Create Missing Roles - Step-by-Step Guide

**Purpose:** Add 4 missing roles to Supabase database, then update Phase 2 & 3 enrichment files to 100% completion.

**Current Status:** 41/45 roles updated (91%)
**Target Status:** 45/45 roles updated (100%)

---

## Missing Roles to Create

### Phase 2: Medical Information Services (1 role)
- ❌ Global Medical Information Specialist

### Phase 3: Scientific Communications (3 roles)
- ❌ Global Publications Lead
- ❌ Regional Publications Lead
- ❌ Local Publications Lead

---

## Step-by-Step Process

### Step 1: Create Roles in Supabase

1. Open **Supabase SQL Editor**
2. Copy the entire contents of `create_missing_roles.sql`
3. Paste into SQL Editor
4. Click **Run**

**Expected output:**
```
✅ 4 rows inserted into org_roles
✅ Verification query shows 4 new roles with generated UUIDs
```

### Step 2: Get Generated Role IDs

After running the SQL, you'll see a verification query result showing the 4 new roles with their UUIDs:

```
name                                  | geographic_scope | id
--------------------------------------|------------------|--------------------------------------
Global Medical Information Specialist | global           | <generated-uuid-1>
Global Publications Lead              | global           | <generated-uuid-2>
Local Publications Lead               | local            | <generated-uuid-3>
Regional Publications Lead            | regional         | <generated-uuid-4>
```

**Copy these 4 UUIDs** - you'll need them for the next step.

### Step 3: Update Python Script with New UUIDs

**Option A: Automatic (Recommended)**

Re-export your database and run the script again:

```bash
# 1. Export updated database to RTF
#    (Use same method as before to export org_roles and org_departments)

# 2. Parse new export and re-run update
cd .vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/
python3 apply_role_ids_from_export.py
```

**Option B: Manual Update**

Edit `apply_role_ids_from_export.py` and replace the "TBD" placeholders with actual UUIDs:

```python
# In PHASE2_ROLE_MAP, find this line:
("Global Medical Information Specialist", "global"): "TBD",
# Replace with:
("Global Medical Information Specialist", "global"): "<uuid-from-step-2>",

# In PHASE3_ROLE_MAP, find these lines:
("Global Publications Lead", "global"): "TBD",
("Regional Publications Lead", "regional"): "TBD",
("Local Publications Lead", "local"): "TBD",
# Replace with actual UUIDs from Step 2
```

Then run:
```bash
python3 apply_role_ids_from_export.py
```

### Step 4: Verify Complete Update

Check that all roles are now updated:

```bash
# Phase 2 - should show 0 "TBD"
grep -c '"TBD"' phase2_medical_information_enrichment.json
# Expected: 0

# Phase 3 - should show 0 "TBD"
grep -c '"TBD"' phase3_scientific_communications_enrichment.json
# Expected: 0

# Check metadata has real UUIDs
jq '.metadata' phase2_medical_information_enrichment.json
jq '.metadata' phase3_medical_information_enrichment.json

# Verify all 45 roles across all phases
echo "Phase 1: $(jq '.roles | length' phase1_field_medical_enrichment.json) roles"
echo "Phase 2: $(jq '.roles | length' phase2_medical_information_enrichment.json) roles"
echo "Phase 3: $(jq '.roles | length' phase3_scientific_communications_enrichment.json) roles"
# Expected: 15 + 15 + 15 = 45 roles total
```

---

## Troubleshooting

### Issue: SQL Insert Fails

**Error: duplicate key value violates unique constraint**

**Solution:** A role with that name already exists. Check existing roles:

```sql
SELECT id, name, geographic_scope
FROM org_roles
WHERE name ILIKE '%medical information%specialist%'
   OR name ILIKE '%publications%lead%'
ORDER BY name;
```

If similar roles exist with slightly different names, you have two options:
1. Use the existing role UUIDs in your enrichment files
2. Rename the existing roles to match enrichment file names

### Issue: Python Script Still Shows "TBD"

**Problem:** Script has hardcoded "TBD" values that weren't updated

**Solution:**

1. Check if roles were actually created:
```sql
SELECT COUNT(*) FROM org_roles
WHERE name IN (
    'Global Medical Information Specialist',
    'Global Publications Lead',
    'Regional Publications Lead',
    'Local Publications Lead'
);
-- Should return: 4
```

2. If roles exist, manually update the Python script (see Option B above)

3. Re-run the script:
```bash
python3 apply_role_ids_from_export.py
```

### Issue: Wrong Department for Publications Leads

**Problem:** Publications Lead roles might belong in Publications department, not Scientific Communications

**Symptoms:**
- Roles created but organizational structure seems off
- Publications team can't find their roles

**Solution:**

Check which department makes more sense:

```sql
-- See both departments
SELECT id, name, description
FROM org_departments
WHERE name IN ('Publications', 'Scientific Communications');
```

If Publications department is more appropriate, update the INSERT statements:

```sql
-- Change department_id from Scientific Communications:
-- '9871d82a-631a-4cf7-9a00-1ab838a45c3e'
-- To Publications:
-- '5d5ded20-c30a-48f1-844c-fc9f80fcaacb'
```

Then also update Phase 3 metadata in the enrichment JSON file.

---

## Alternative: Quick Fix with Supabase Output

If you want to skip re-export, you can use Supabase SQL output directly:

1. After running `create_missing_roles.sql`, run this query:

```sql
SELECT
    r.name,
    r.geographic_scope,
    r.id
FROM org_roles r
WHERE r.name IN (
    'Global Medical Information Specialist',
    'Global Publications Lead',
    'Regional Publications Lead',
    'Local Publications Lead'
)
ORDER BY r.name, r.geographic_scope;
```

2. Copy the output

3. Manually edit JSON files to replace "TBD" with actual UUIDs:

**For phase2_medical_information_enrichment.json:**
```bash
# Find the role with "TBD" and replace with actual UUID
sed -i '' 's/"role_id": "TBD"/"role_id": "<actual-uuid>"/' phase2_medical_information_enrichment.json
```

**For phase3_scientific_communications_enrichment.json:**
```bash
# Replace each TBD with corresponding UUID
# (Do this carefully for each of the 3 Publications Lead roles)
```

---

## Expected Results

### Before:
```
Phase 2: 14/15 roles (93%)
Phase 3: 12/15 roles (80%)
Total:   26/30 roles (87%)
```

### After:
```
Phase 2: 15/15 roles (100%) ✅
Phase 3: 15/15 roles (100%) ✅
Total:   30/30 roles (100%) ✅
```

### Overall Project Status:
```
Phase 1: 15 roles ✅
Phase 2: 15 roles ✅
Phase 3: 15 roles ✅
Phase 4: 55 roles ⏳ (pending)
---
TOTAL:   45/100 roles complete (45%)
```

---

## Next Steps After Completion

Once all 45 roles have 100% complete enrichment data:

1. **Generate SQL Transformation**
   - Convert JSON enrichment to UPDATE statements
   - Generate INSERT statements for junction tables
   - Create validation queries

2. **Deploy Reference Data** (if not already done)
   - Run `00_run_all_reference_data_seeds.sql`
   - Verify 71 reference records loaded

3. **Deploy Enrichment Data**
   - Run Phase 1 enrichment SQL
   - Run Phase 2 enrichment SQL
   - Run Phase 3 enrichment SQL

4. **Validate Deployment**
   - Check all 45 roles have enriched descriptions
   - Verify junction table relationships
   - Run completeness queries

5. **Begin Phase 4**
   - HEOR & Evidence Generation (15 roles)
   - Medical Education (12 roles)
   - Clinical Operations (12 roles)
   - Medical Governance (8 roles)
   - Medical Leadership (8 roles)

---

## Files Involved

```
✅ create_missing_roles.sql (this creates the 4 roles)
✅ apply_role_ids_from_export.py (updates JSON files)
📝 phase2_medical_information_enrichment.json (will be 100% complete)
📝 phase3_scientific_communications_enrichment.json (will be 100% complete)
```

---

## Support

**If you encounter issues:**

1. Check Supabase SQL logs for error messages
2. Verify role names match exactly (case-sensitive)
3. Confirm department_id and function_id are correct
4. Review `ROLE_ID_UPDATE_COMPLETE.md` for context

**Need help?**
- Review the verification queries in `create_missing_roles.sql`
- Check existing roles: `SELECT * FROM org_roles WHERE department_id = '<dept-id>'`
- Validate schema: `\d org_roles` in psql

---

**Last Updated:** 2025-11-23
**Status:** Ready to Execute
**Estimated Time:** 10-15 minutes
**Outcome:** 100% complete enrichment data for Phases 1-3
