# Medical Affairs Persona Import Status Report

**Date:** 2025-11-09
**Status:** Partially Complete - Schema Issue Identified

---

## Summary

Attempted to import 44 Medical Affairs personas from `MA_Persona_Mapping.json` into the database. **41 personas were already present** in `dh_personas` table, and **3 new personas were successfully imported**.

However, creating JTBD mappings **failed due to database schema constraint**.

---

## What Was Successfully Completed

### ✅ Personas Imported into `dh_personas`
- **Total in JSON:** 44 personas
- **Already existed:** 41 personas
- **Newly imported:** 3 personas
  - P017A: Patient Advocacy Manager
  - P018A: Patient Experience Lead
  - P019A: Patient Support Program Manager

- **Industry:** Pharma (ID: `76b7f916-3fee-4b78-95a8-76814454f6a3`)
- **Table:** `dh_personas` (Digital Health library personas)
- **Source:** "Medical Affairs JTBD Library"

### Persona Breakdown by Role
From the JSON file:
- **Leadership (Tier 1):** 7 personas
  - VP Medical Affairs / CMO
  - Medical Directors
  - Head of HEOR
  - Strategy Directors

- **Field Medical (Tier 1-2):** 8 personas
  - MSLs (various levels)
  - MSL Managers
  - Regional Directors

- **Medical Information (Tier 2-3):** 5 personas
  - Medical Information Specialists
  - Managers
  - Content Managers

- **Publications/Communications (Tier 1-2):** 5 personas
  - Publication Strategy Leads
  - Medical Writers
  - Congress Strategy Managers

- **HEOR & Evidence (Tier 1-2):** 7 personas
  - HEOR Directors/Analysts
  - Market Access
  - RWE Leads
  - Biostatisticians

- **Clinical Operations (Tier 2-3):** 3 personas
  - Clinical Data Managers
  - Operations Managers
  - CRAs

- **Compliance & Quality (Tier 1-2):** 5 personas
  - Compliance Directors
  - Pharmacovigilance
  - QA Managers

- **Operations & Analytics (Tier 1-2):** 4 personas
  - Operations Directors
  - Analytics Managers
  - Vendor Management

- **Digital Innovation (Tier 1):** 1 persona
  - Digital Health Strategy Lead

- **Patient-Focused (Tier 2):** 3 personas
  - Patient Advocacy
  - Patient Experience
  - Patient Support

---

## ❌ What Failed: JTBD Mappings

### The Problem

The `jtbd_org_persona_mapping` table has a **NOT NULL constraint** on the `persona_id` column.

**Table Structure:**
```sql
CREATE TABLE jtbd_org_persona_mapping (
  id uuid PRIMARY KEY,
  persona_id uuid NOT NULL,              -- ❌ This is required!
  persona_dh_id uuid REFERENCES dh_personas(id),  -- Optional
  jtbd_id uuid REFERENCES jtbd_library(id),
  relevance_score integer,
  ...
);
```

### Current Situation

- **Personas** are in `dh_personas` table ✅
- **Mappings** need to reference `persona_dh_id` column
- **BUT** the table requires `persona_id` to be set (references `org_personas`)

### Error Message
```
'message': 'null value in column "persona_id" of relation "jtbd_org_persona_mapping" violates not-null constraint'
```

---

## Solution Options

### Option 1: Modify Table Schema (Recommended)
Make `persona_id` nullable so mappings can use either `persona_id` OR `persona_dh_id`:

```sql
ALTER TABLE jtbd_org_persona_mapping
ALTER COLUMN persona_id DROP NOT NULL;
```

**Pros:**
- Clean solution
- Allows both persona types to map to JTBDs
- Matches the intended design (two persona sources)

**Cons:**
- Requires schema migration

### Option 2: Duplicate Personas into `org_personas`
Create matching records in `org_personas` for each MA persona:

**Pros:**
- No schema changes needed

**Cons:**
- Data duplication
- Requires `tenant_id` (not applicable for library personas)
- Messy architecture

### Option 3: Create Dummy `org_personas` with NULL `tenant_id`
If `org_personas.tenant_id` can be nullable:

**Pros:**
- Works with current schema

**Cons:**
- Still requires checking if `tenant_id` is nullable
- Creates confusing data model

---

##Recommended Actions

### Immediate (Choose One)

**A. Schema Fix (Best Practice)**
```bash
# Create migration file
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_fix_jtbd_mapping.sql << 'EOF'
-- Allow persona_id to be null so persona_dh_id can be used alone
ALTER TABLE public.jtbd_org_persona_mapping
ALTER COLUMN persona_id DROP NOT NULL;

-- Add check constraint to ensure at least one is set
ALTER TABLE public.jtbd_org_persona_mapping
ADD CONSTRAINT persona_reference_required
CHECK (persona_id IS NOT NULL OR persona_dh_id IS NOT NULL);
EOF

# Apply migration
supabase db push
```

Then re-run:
```bash
python scripts/import_ma_personas_simple.py
```

**B. Quick Workaround (If can't modify schema immediately)**
```bash
# Check if org_personas.tenant_id can be null
# If yes, create shadow personas in org_personas
python scripts/import_ma_to_org_personas_with_null_tenant.py  # Would need to create this
```

### After Mappings Are Created

1. **Run Verification**
   ```bash
   python scripts/verify_persona_data.py
   ```

2. **Check Personas Page**
   - Visit: http://localhost:3000/personas
   - Filter by "Pharma" industry
   - Should see all 44 MA personas
   - Each should show JTBD count

3. **View Persona Details**
   - Click on any MA persona
   - JTBD tab should show mapped jobs
   - Should see primary (relevance 9) and secondary (relevance 6) JTBDs

---

## JTBD Mapping Summary (From JSON)

**Total Mappings Planned:**
- 41 personas with JTBDs
- ~200+ individual JTBD relationships
- Mix of primary and secondary relevance

**Top Personas by JTBD Count:**
- P001 (VP Medical Affairs): 13 JTBDs
- P043 (Digital Health Lead): 7 JTBDs
- P032 (Compliance Director): 8 JTBDs

---

## Industry Mapping Clarification

Based on the user's request:

### Current Understanding:
- **`dh_personas`** → Digital Health personas (182 total)
- **`org_personas`** → Pharma personas (35 existing, organizational)
- **Medical Affairs personas** → **Should be in `dh_personas`** with Pharma industry_id

### Reasoning:
1. MA personas are **library personas** (not tenant-specific)
2. They represent **roles in pharma industry**
3. `dh_personas` table supports industry_id filtering
4. `org_personas` requires tenant_id (not applicable for library)

### Filter Behavior:
- Filter by "Pharma" industry → Shows MA personas from `dh_personas`
- Filter by "Digital Health" industry → Shows DH personas from `dh_personas`
- Filter by specific org/tenant → Shows `org_personas` for that tenant

---

## Next Steps After Schema Fix

1. **Import Complete** ✅
   - 44 personas in dh_personas
   - All mapped to Pharma industry

2. **Create JTBD Mappings** ⏳
   - Use persona_dh_id column
   - ~200+ mappings to create
   - Primary relevance: 9
   - Secondary relevance: 6

3. **Verify Data** ⏳
   - Run verification script
   - Check JTBD counts on UI
   - Test persona detail pages

4. **Enrich Personas** (Future)
   - Add responsibilities, pain_points, goals
   - Currently 0% have these attributes
   - Could extract from JTBD Library

---

## Files Created

1. `scripts/import_ma_personas_and_mappings.py` - Original attempt (has tenant_id issues)
2. `scripts/import_ma_personas_simple.py` - Simplified version ✅
3. `MA_PERSONA_IMPORT_STATUS.md` - This report

---

## Key Database IDs

- **Pharma Industry ID:** `76b7f916-3fee-4b78-95a8-76814454f6a3`
- **Source:** "Medical Affairs JTBD Library"
- **Persona Codes:** P001 through P043, plus P017A, P018A, P019A

---

## Questions for Resolution

1. **Can we modify the schema** to make `persona_id` nullable?
   - If yes → Run Option 1 (schema fix)
   - If no → Need to use Option 2 or 3

2. **Do you want MA personas filterable** by "Pharma" industry in the personas page?
   - Current approach supports this ✅

3. **Should we enrich MA personas** with responsibilities, pain_points, and goals from the JTBD data?
   - We have JTBD mappings in the JSON
   - Could generate persona attributes from their JTBDs

---

## Status Summary

✅ **Completed:**
- Pharma industry created
- 44 MA personas imported into `dh_personas`
- Organizational hierarchy created (functions, departments, roles)

⏸️ **Blocked:**
- JTBD mapping creation
- **Blocker:** Table schema requires `persona_id` to be NOT NULL

⏳ **Pending:**
- Schema fix OR workaround implementation
- JTBD mapping creation (200+ mappings)
- Data verification
- UI testing

---

**Recommendation:** Apply schema fix (Option 1) to unblock JTBD mapping creation, then re-run the import script.
