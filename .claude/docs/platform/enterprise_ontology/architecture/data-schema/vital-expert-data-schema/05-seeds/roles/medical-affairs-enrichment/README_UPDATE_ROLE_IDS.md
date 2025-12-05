# Update Phase 2 & 3 Role IDs - Step-by-Step Guide

**Purpose:** Replace "TBD" placeholders in Phase 2 and Phase 3 enrichment files with actual role_ids from your Supabase database.

**Status:** Phase 2 (Medical Information) and Phase 3 (Scientific Communications) files have been created with comprehensive enrichment data, but need actual UUIDs from the database.

---

## Quick Overview

```
Current State:
├── phase2_medical_information_enrichment.json (64 KB)
│   └── 15 roles with "TBD" for role_id and department_id
├── phase3_scientific_communications_enrichment.json (64 KB)
│   └── 15 roles with "TBD" for role_id and department_id

After Update:
├── phase2_medical_information_enrichment.json
│   └── 15 roles with actual UUIDs from database
├── phase3_scientific_communications_enrichment.json
│   └── 15 roles with actual UUIDs from database
```

---

## Step-by-Step Process

### Step 1: Query Medical Information Roles

1. Open Supabase SQL Editor
2. Run the query from `query_phase2_role_ids.sql`
3. Copy the **entire JSON output** from the `json_mapping` column

**Expected output format:**
```json
{
  "role_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role_name": "Global Medical Information Specialist",
  "geographic_scope": "global",
  "seniority_level": "mid",
  "department_id": "d1e2f3a4-b5c6-7890-defg-ab1234567890"
}
```

**Expected count:** 15 roles

### Step 2: Query Scientific Communications Roles

1. In Supabase SQL Editor
2. Run the query from `query_phase3_role_ids.sql`
3. Copy the **entire JSON output** from the `json_mapping` column

**Expected count:** 15 roles

### Step 3: Update JSON Files

**Option A: Automated Update (Recommended)**

```bash
# Navigate to enrichment directory
cd .vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/

# Make script executable
chmod +x update_role_ids_from_db.py

# Run script
python3 update_role_ids_from_db.py

# Follow prompts:
# 1. Paste Phase 2 JSON results when asked
# 2. Paste Phase 3 JSON results when asked
```

The script will:
- ✅ Create timestamped backups of both files
- ✅ Match roles by name and geographic scope
- ✅ Replace "TBD" with actual UUIDs
- ✅ Update department_id in metadata
- ✅ Show summary of matched/unmatched roles

**Option B: Manual Update**

If you prefer manual updates or the script has issues:

1. Open `phase2_medical_information_enrichment.json`
2. For each role, find matching role from database query
3. Replace `"role_id": "TBD"` with actual UUID
4. Update `metadata.department_id` with actual department UUID
5. Repeat for `phase3_scientific_communications_enrichment.json`

---

## Validation

After updating, verify the changes:

```bash
# Check Phase 2 - should show NO "TBD"
grep -c "TBD" phase2_medical_information_enrichment.json
# Expected: 0

# Check Phase 3 - should show NO "TBD"
grep -c "TBD" phase3_scientific_communications_enrichment.json
# Expected: 0

# Count role_ids in Phase 2
jq '.roles | length' phase2_medical_information_enrichment.json
# Expected: 15

# Count role_ids in Phase 3
jq '.roles | length' phase3_scientific_communications_enrichment.json
# Expected: 15

# Verify actual UUIDs (not "TBD")
jq '.roles[0].role_id' phase2_medical_information_enrichment.json
# Expected: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" (actual UUID)
```

---

## Troubleshooting

### Issue: Query returns 0 roles

**Problem:** Department doesn't exist yet or roles haven't been created

**Solution:**
1. Check if departments exist:
```sql
SELECT id, department_name
FROM org_departments
WHERE function_id IN (
  SELECT id FROM org_functions
  WHERE function_name = 'Medical Affairs'
);
```

2. If missing, create departments first using department seed files
3. If departments exist but roles are missing, create roles first using role seed files

### Issue: Query returns < 15 roles

**Problem:** Not all roles have been created yet

**Solution:**
1. Check which roles are missing:
```sql
SELECT name FROM org_roles
WHERE department_id = '<medical-info-dept-id>'
ORDER BY name;
```

2. Compare with expected role list:
   - Phase 2: MI Specialist, Manager, Operations Lead, Associate, Scientist (Global/Regional/Local)
   - Phase 3: Sci Comm Manager, Medical Writer, Publications Lead, Scientific Affairs Lead, Med Comm Specialist (Global/Regional/Local)

3. Create missing roles using base role seed files

### Issue: Script can't match roles

**Problem:** Role names in database don't exactly match enrichment file names

**Solution:**
1. Check database role names:
```sql
SELECT id, name, geographic_scope
FROM org_roles
WHERE department_id = '<dept-id>'
ORDER BY name;
```

2. Update enrichment file `role_name` to match database exactly, OR
3. Update database role names to match enrichment file, OR
4. Manually map IDs using the JSON output from queries

---

## File Locations

All files for this process:

```
.vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/

📁 Enrichment Files (to be updated):
├── phase2_medical_information_enrichment.json
└── phase3_scientific_communications_enrichment.json

📁 Query Files (run in Supabase):
├── query_phase2_role_ids.sql
└── query_phase3_role_ids.sql

📁 Update Tools:
├── update_role_ids_from_db.py (automated script)
└── README_UPDATE_ROLE_IDS.md (this file)

📁 Backups (created automatically):
├── phase2_medical_information_enrichment.json.backup_YYYYMMDD_HHMMSS
└── phase3_scientific_communications_enrichment.json.backup_YYYYMMDD_HHMMSS
```

---

## Next Steps After Update

Once role_ids are updated:

1. **Transform JSON to SQL**
   - Convert enrichment data to SQL UPDATE statements
   - Generate INSERT statements for junction tables

2. **Deploy to Supabase**
   - Run reference data seeds (if not already done)
   - Execute enrichment SQL
   - Validate deployment

3. **Continue to Phase 4**
   - HEOR & Evidence Generation (15 roles)
   - Medical Education (12 roles)
   - Clinical Operations (12 roles)
   - Medical Governance (8 roles)
   - Medical Leadership (8 roles)

---

## Support

**For query issues:**
- Review `query_phase2_role_ids.sql` comments
- Check database schema matches expectations
- Verify department_id values exist

**For script issues:**
- Check Python 3.8+ installed
- Ensure JSON format is valid
- Review script output for specific errors

**For manual update help:**
- See JSON structure in enrichment files
- Match by `role_name` and `geographic_scope`
- Preserve all enrichment data when updating

---

**Last Updated:** 2025-11-23
**Version:** 1.0
**Related Files:** `ORCHESTRATED_RESEARCH_COMPLETE.md`, `phase2_medical_information_enrichment.json`, `phase3_scientific_communications_enrichment.json`
