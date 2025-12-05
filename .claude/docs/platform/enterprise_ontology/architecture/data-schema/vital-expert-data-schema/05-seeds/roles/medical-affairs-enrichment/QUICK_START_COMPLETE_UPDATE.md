# Quick Start: Complete 100% Update

**Goal:** Update Phases 2-3 from 87% to 100% completion
**Time:** 10-15 minutes
**Files Needed:** `create_missing_roles.sql`

---

## ⚡ Fast Track (4 Steps)

### 1️⃣ Run SQL (2 minutes)

Open Supabase SQL Editor and run:

```sql
-- Copy entire contents of create_missing_roles.sql
-- This creates 4 missing roles
```

✅ Expected: "4 rows inserted"

---

### 2️⃣ Get UUIDs (1 minute)

The verification query at the end shows:

```
Global Medical Information Specialist | <copy-this-uuid>
Global Publications Lead              | <copy-this-uuid>
Regional Publications Lead            | <copy-this-uuid>
Local Publications Lead               | <copy-this-uuid>
```

**Copy all 4 UUIDs**

---

### 3️⃣ Update Script (2 minutes)

**Option A: Re-export database** (recommended if you have the export process automated)

**Option B: Manual edit** `apply_role_ids_from_export.py`:

```python
# Line ~35 - Update this:
("Global Medical Information Specialist", "global"): "<paste-uuid-1>",

# Lines ~68-70 - Update these:
("Global Publications Lead", "global"): "<paste-uuid-2>",
("Regional Publications Lead", "regional"): "<paste-uuid-3>",
("Local Publications Lead", "local"): "<paste-uuid-4>",
```

---

### 4️⃣ Re-run Update (1 minute)

```bash
cd .vital-command-center/04-TECHNICAL/data-schema/vital-expert-data-schema/05-seeds/roles/medical-affairs-enrichment/

python3 apply_role_ids_from_export.py
```

✅ Expected: "30/30 roles updated"

---

## ✅ Verify Complete

```bash
# Should return 0 for both
grep -c '"TBD"' phase2_medical_information_enrichment.json
grep -c '"TBD"' phase3_scientific_communications_enrichment.json
```

---

## 🎯 Result

```
Before: 26/30 roles (87%)
After:  30/30 roles (100%) ✅

Phase 1: ✅ 15/15 roles
Phase 2: ✅ 15/15 roles
Phase 3: ✅ 15/15 roles
Total:   ✅ 45/45 roles ready for deployment
```

---

## 🚀 What's Next?

1. **Generate SQL transformation scripts**
2. **Deploy reference data** (71 records)
3. **Deploy enrichment data** (45 roles)
4. **Validate deployment**
5. **Begin Phase 4** (remaining 55 roles)

---

**Full Instructions:** See `CREATE_MISSING_ROLES_GUIDE.md`
**Troubleshooting:** See `ROLE_ID_UPDATE_COMPLETE.md`
