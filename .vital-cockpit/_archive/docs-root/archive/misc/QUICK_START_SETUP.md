# Quick Start: Create Strategic Priorities & Mapping Tables

**Time:** 3 minutes
**Steps:** 2 SQL scripts + 1 Python script

---

## Step 1: Create Strategic Priorities Table (1 minute)

**Open:** https://app.supabase.com/project/xazinxsiglqokwfmogyk/sql/new

**Copy & Execute:** [scripts/1_CREATE_STRATEGIC_PRIORITIES.sql](scripts/1_CREATE_STRATEGIC_PRIORITIES.sql)

**Expected Result:** 7 rows (SP01-SP07)

```
SP01 | Growth & Market Access
SP02 | Scientific Excellence
SP03 | Stakeholder Engagement
SP04 | Compliance & Quality
SP05 | Operational Excellence
SP06 | Talent Development
SP07 | Innovation & Digital
```

---

## Step 2: Create Mapping Tables (1 minute)

**Open:** https://app.supabase.com/project/xazinxsiglqokwfmogyk/sql/new

**Copy & Execute:** [scripts/2_CREATE_MAPPING_TABLES.sql](scripts/2_CREATE_MAPPING_TABLES.sql)

**Expected Result:** 2 tables created with 0 rows each

```
persona_strategic_pillar_mapping | 0 rows | Ready to populate
persona_jtbd_mapping            | 0 rows | Ready to populate
```

---

## Step 3: Populate Mappings (30 seconds)

**Run in terminal:**

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/populate_persona_mappings.py
```

**Expected Result:**
- ✅ Persona-SP mappings: ~140
- ✅ Persona-JTBD mappings: ~200

---

## ✅ Verification

Check that everything worked:

```sql
-- Count strategic priorities
SELECT COUNT(*) FROM strategic_priorities;
-- Should return: 7

-- Count persona-SP mappings
SELECT COUNT(*) FROM persona_strategic_pillar_mapping;
-- Should return: ~140

-- Count persona-JTBD mappings
SELECT COUNT(*) FROM persona_jtbd_mapping;
-- Should return: ~200

-- Example: Get all pillars for VP Medical Affairs
SELECT
    sp.code,
    sp.name,
    pspm.pain_points_count
FROM personas p
JOIN persona_strategic_pillar_mapping pspm ON p.id = pspm.persona_id
JOIN strategic_priorities sp ON pspm.strategic_pillar_id = sp.id
WHERE p.unique_id = 'ma_persona_p001'
ORDER BY pspm.pain_points_count DESC;
```

---

## 📁 Files Reference

**SQL Scripts (Execute in order):**
1. `scripts/1_CREATE_STRATEGIC_PRIORITIES.sql` - Creates SP table
2. `scripts/2_CREATE_MAPPING_TABLES.sql` - Creates mapping tables

**Python Script (Run after SQL):**
3. `scripts/populate_persona_mappings.py` - Populates data

**Alternative (All-in-one):**
- `scripts/FINAL_CREATE_TABLES.sql` - Everything in one file

---

## 🎯 What This Accomplishes

After completing these 3 steps, you'll have:

✅ Strategic priorities table (SP01-SP07)
✅ Persona → Strategic Pillar mappings (~140 records)
✅ Persona → JTBD mappings (~200 records)
✅ Views for easy querying
✅ Complete relational context for all personas

---

## 🚀 Ready to Start!

**Next:** Execute Step 1 in Supabase Dashboard
