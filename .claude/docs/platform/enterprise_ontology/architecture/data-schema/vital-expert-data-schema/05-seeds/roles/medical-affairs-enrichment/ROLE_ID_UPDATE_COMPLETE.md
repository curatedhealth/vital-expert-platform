# Role ID Update - Completed ✅

**Date:** 2025-11-23
**Status:** 26/30 roles updated (87% complete)
**Source:** Medical Affairs Roles Departments Functions.rtf export

---

## Executive Summary

Successfully updated Phase 2 and Phase 3 enrichment JSON files with actual role_ids from your Supabase database export. Out of 30 roles across both phases, **26 roles (87%)** were successfully matched and updated with their database UUIDs.

---

## Update Results

### Phase 2: Medical Information Services

**Department ID:** `2b320eab-1758-42d7-adfa-7f49c12cdf40`
**Function ID:** `06127088-4d52-40aa-88c9-93f4e79e085a`

| Role Name | Geographic Scope | Status | Role ID |
|-----------|------------------|--------|---------|
| Global Medical Information Specialist | Global | ⚠️ **NOT IN DATABASE** | TBD |
| Regional Medical Information Specialist | Regional | ✅ Updated | 10439276-39a3-488a-8c49-2531934fe511 |
| Local Medical Information Specialist | Local | ✅ Updated | c15316a2-2b06-4d31-890a-86a3f056a68c |
| Global Medical Information Manager | Global | ✅ Updated | d2300d04-9ab9-4402-810d-c41281981047 |
| Regional Medical Information Manager | Regional | ✅ Updated | 99ef84bc-0e17-4b8e-9079-120bb9f5758c |
| Local Medical Information Manager | Local | ✅ Updated | 87614dbc-ddde-4104-9959-18f33382bb84 |
| Global MI Operations Lead | Global | ✅ Updated | e9e4728e-392f-494f-9b77-6392041b6c25 |
| Regional MI Operations Lead | Regional | ✅ Updated | b129992d-31de-47d4-bf1c-ab4a8be7a5c7 |
| Local MI Operations Lead | Local | ✅ Updated | e1a8d2a3-c0b8-4faf-981e-a6c8efdcfa04 |
| Global Medical Info Associate | Global | ✅ Updated | 702f6a9f-372c-49f6-8d4a-3efc8dec8902 |
| Regional Medical Info Associate | Regional | ✅ Updated | 1f7e4517-2e32-4108-b10c-8dc4bf1fa589 |
| Local Medical Info Associate | Local | ✅ Updated | f9fdae17-b752-4211-8ba0-55b0b6423941 |
| Global Medical Info Scientist | Global | ✅ Updated | 4674cdd3-f12c-4b69-9f10-e8edd5138d14 |
| Regional Medical Info Scientist | Regional | ✅ Updated | d969ac11-b1fc-4835-8f4c-3718e0aa5051 |
| Local Medical Info Scientist | Local | ✅ Updated | 7e076164-9acd-46cd-872d-1c4cdc980bda |

**Result:** 14/15 roles updated (93%)

---

### Phase 3: Scientific Communications

**Department ID:** `9871d82a-631a-4cf7-9a00-1ab838a45c3e`
**Function ID:** `06127088-4d52-40aa-88c9-93f4e79e085a`

| Role Name | Geographic Scope | Status | Role ID |
|-----------|------------------|--------|---------|
| Global Scientific Communications Manager | Global | ✅ Updated | 1ee591f8-81ed-40a6-b961-e5eebb58a8eb |
| Regional Scientific Communications Manager | Regional | ✅ Updated | 1fd98496-d670-4199-9e13-87bbf813952f |
| Local Scientific Communications Manager | Local | ✅ Updated | 5587884a-09bc-4377-992b-68ea30623d59 |
| Global Medical Writer | Global | ✅ Updated | bd65ecaf-dfb5-4cc3-bec3-754e0c90dc3d |
| Regional Medical Writer | Regional | ✅ Updated | 15cd4978-60e3-4a80-81aa-43e56216c540 |
| Local Medical Writer | Local | ✅ Updated | 6b09c934-6bcc-4ea0-90af-b616b5543cee |
| Global Publications Lead | Global | ⚠️ **NOT IN DATABASE** | TBD |
| Regional Publications Lead | Regional | ⚠️ **NOT IN DATABASE** | TBD |
| Local Publications Lead | Local | ⚠️ **NOT IN DATABASE** | TBD |
| Global Scientific Affairs Lead | Global | ✅ Updated | e30fbcd9-0c1e-4d54-9d2b-1d2b-1d2b2b78b694 |
| Regional Scientific Affairs Lead | Regional | ✅ Updated | 2d851ef7-14eb-4202-8061-d40b5940b348 |
| Local Scientific Affairs Lead | Local | ✅ Updated | d35eafc0-7003-4c69-a5d4-b160af0e6b23 |
| Global Medical Communications Specialist | Global | ✅ Updated | d39afed7-6cf4-4146-8737-40b21738a795 |
| Regional Medical Communications Specialist | Regional | ✅ Updated | 3202b466-4f2e-4eba-8547-b88354bbc3c3 |
| Local Medical Communications Specialist | Local | ✅ Updated | 6cbddb0a-4ecc-4dad-9885-74072cc4dac0 |

**Result:** 12/15 roles updated (80%)

---

## Missing Roles Analysis

### Why These Roles Are Missing

The database export shows:
- **Publications department** exists (`5d5ded20-c30a-48f1-844c-fc9f80fcaacb`)
- But "Publications Lead" roles are **NOT** in the org_roles table
- "Global Medical Information Specialist" role also **NOT** found

**Possible reasons:**
1. These roles haven't been created in the database yet
2. They exist but with different names
3. They're in the Publications department, not Scientific Communications department

---

## Options to Resolve Missing Roles

### Option 1: Remove Missing Roles from Enrichment (Recommended)

Since these roles don't exist in your database, remove them from the enrichment files:

**Phase 2:**
- Remove "Global Medical Information Specialist" (1 role)

**Phase 3:**
- Remove all 3 "Publications Lead" roles (Global, Regional, Local)

**Updated counts:**
- Phase 2: 14 roles (instead of 15)
- Phase 3: 12 roles (instead of 15)
- **Total: 26 roles ready for deployment**

### Option 2: Create Missing Roles in Database

Create the 4 missing roles in your org_roles table first, then re-run the update:

```sql
-- Create Global Medical Information Specialist
INSERT INTO org_roles (
    name,
    department_id,
    function_id,
    geographic_scope,
    seniority_level,
    role_category
) VALUES (
    'Global Medical Information Specialist',
    '2b320eab-1758-42d7-adfa-7f49c12cdf40',  -- Medical Information Services
    '06127088-4d52-40aa-88c9-93f4e79e085a',  -- Medical Affairs
    'global',
    'mid',
    'office'
);

-- Create Publications Lead roles (3 roles)
-- Note: Check if these should be in Publications dept (5d5ded20...) or Sci Comm (9871d82a...)
```

### Option 3: Map to Existing Roles

Check if similar roles exist with different names:

```sql
-- Search for similar roles
SELECT id, name, geographic_scope, department_id
FROM org_roles
WHERE name ILIKE '%publication%'
   OR name ILIKE '%medical information%specialist%'
ORDER BY name;
```

---

## Files Updated

### ✅ Successfully Updated Files:

```
phase2_medical_information_enrichment.json
├── Metadata updated with actual department_id and function_id
├── 14 roles with real UUIDs
└── 1 role still marked "TBD"

phase3_scientific_communications_enrichment.json
├── Metadata updated with actual department_id and function_id
├── 12 roles with real UUIDs
└── 3 roles still marked "TBD"
```

### 📦 Backup Files Created:

```
phase2_medical_information_enrichment.json.backup_20251123_130826
phase3_scientific_communications_enrichment.json.backup_20251123_130826
```

---

## Next Steps

### Immediate (Choose One):

**A. Deploy Without Missing Roles (Fastest)**
1. Edit `phase2_medical_information_enrichment.json` - remove "Global Medical Information Specialist"
2. Edit `phase3_scientific_communications_enrichment.json` - remove 3 "Publications Lead" roles
3. Proceed to SQL transformation and deployment

**B. Create Missing Roles First**
1. Create 4 missing roles in Supabase (use SQL above)
2. Re-export database
3. Re-run `apply_role_ids_from_export.py`
4. Proceed to SQL transformation and deployment

### After Resolving Missing Roles:

1. **Transform JSON to SQL**
   - Use transformation script to convert enrichment data to UPDATE statements
   - Generate INSERT statements for junction tables

2. **Deploy to Supabase**
   - Run reference data seeds (if not done)
   - Execute enrichment SQL
   - Validate deployment

3. **Continue to Phase 4**
   - HEOR & Evidence Generation (15 roles)
   - Medical Education (12 roles)
   - Clinical Operations (12 roles)
   - Medical Governance (8 roles)
   - Medical Leadership (8 roles)

---

## Validation

Check updated files:

```bash
# Count "TBD" occurrences - should be 1 for Phase 2, 3 for Phase 3
grep -c '"TBD"' phase2_medical_information_enrichment.json
# Expected: 2 (role_id + department_id both TBD for 1 role)

grep -c '"TBD"' phase3_scientific_communications_enrichment.json
# Expected: 6 (role_id + department_id both TBD for 3 roles)

# Verify metadata updated
jq '.metadata' phase2_medical_information_enrichment.json
jq '.metadata' phase3_scientific_communications_enrichment.json
```

---

## Technical Details

### Script Used:
`apply_role_ids_from_export.py`

### Data Source:
`Medical Affairs Roles Departments Functions.rtf`

### Matching Logic:
- Exact match on: `(role_name, geographic_scope)`
- All matches case-sensitive
- Department IDs from export metadata

### Update Method:
- Read enrichment JSON
- Match by role name + geographic scope
- Replace "TBD" with actual UUID
- Update metadata with department_id and function_id
- Save with indent=2 formatting

---

**Status:** ✅ 87% Complete - Ready for decision on missing roles
**Recommendation:** Remove missing roles and proceed with 26-role deployment
**Estimated Time to Deploy:** 30-45 minutes after decision

---

**Last Updated:** 2025-11-23
**Updated By:** apply_role_ids_from_export.py
**Backup Files:** Available for rollback if needed
