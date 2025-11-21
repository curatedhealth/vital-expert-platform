# Persona-SP-JTBD Mappings Setup Guide

**Status:** Ready to execute (2 simple steps)
**Date:** 2025-11-10

---

## 🎯 What This Does

Creates two new mapping tables to track:
1. **Persona → Strategic Pillar** relationships (which personas work in which strategic pillars)
2. **Persona → JTBD** relationships (which personas own/contribute to which JTBDs)

This enriches your existing persona data with relational context.

---

## 📋 Current Status

✅ **Personas updated with pain points** - 39 personas, 609 pain points
✅ **Scripts created** - All migration and population scripts ready
⏸️ **Tables not created yet** - Need to execute SQL in Supabase Dashboard
⏸️ **Mappings not populated yet** - Will run after tables are created

---

## 🚀 Quick Start (2 Steps)

### Step 1: Create Tables (2 minutes)

1. **Open Supabase Dashboard SQL Editor:**
   - URL: https://app.supabase.com/project/xazinxsiglqokwfmogyk/sql/new

2. **Copy and paste this SQL:**

```sql
-- Create persona_strategic_pillar_mapping table
CREATE TABLE IF NOT EXISTS persona_strategic_pillar_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL,
    strategic_pillar_id UUID NOT NULL,
    jtbd_count INTEGER DEFAULT 0,
    pain_points_count INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    priority_score NUMERIC(5,2),
    engagement_metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(persona_id, strategic_pillar_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_sp_mapping_persona
    ON persona_strategic_pillar_mapping(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_sp_mapping_pillar
    ON persona_strategic_pillar_mapping(strategic_pillar_id);

-- Create persona_jtbd_mapping table
CREATE TABLE IF NOT EXISTS persona_jtbd_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL,
    jtbd_id UUID NOT NULL,
    role_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    responsibility_level VARCHAR(50),
    pain_points_count INTEGER DEFAULT 0,
    impact_level VARCHAR(20),
    frequency VARCHAR(50),
    engagement_metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(persona_id, jtbd_id)
);

CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_persona
    ON persona_jtbd_mapping(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_jtbd_mapping_jtbd
    ON persona_jtbd_mapping(jtbd_id);

-- Verify tables were created
SELECT 'persona_strategic_pillar_mapping' as table_name, COUNT(*) as row_count
FROM persona_strategic_pillar_mapping
UNION ALL
SELECT 'persona_jtbd_mapping', COUNT(*)
FROM persona_jtbd_mapping;
```

3. **Click "RUN"**

4. **Verify:** You should see both tables with 0 rows

---

### Step 2: Populate Mappings (30 seconds)

Run this command in your terminal:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/populate_persona_mappings.py
```

**Expected output:**
- Persona-SP mappings: ~140 (39 personas × average 3.6 pillars each)
- Persona-JTBD mappings: ~200 (from MA_Persona_Mapping.json)

---

## 📊 What Gets Created

### Table 1: persona_strategic_pillar_mapping

**Purpose:** Track which personas work in which strategic pillars

**Example Data:**
| Persona | Strategic Pillar | Pain Points | Is Primary |
|---------|------------------|-------------|------------|
| VP Medical Affairs (P001) | SP01: Growth & Market Access | 19 | ✅ |
| VP Medical Affairs (P001) | SP06: Talent Development | 12 | ✅ |
| Medical Director (P002) | SP02: Scientific Excellence | 10 | ✅ |

**Source:** Extracted from pain_points data already in personas table

---

### Table 2: persona_jtbd_mapping

**Purpose:** Track which personas own/contribute to which JTBDs

**Example Data:**
| Persona | JTBD | Role | Is Primary |
|---------|------|------|------------|
| VP Medical Affairs (P001) | JTBD-MA-001: Annual Strategic Planning | owner | ✅ |
| VP Medical Affairs (P001) | JTBD-MA-082: MSL Coaching | contributor | ❌ |
| MSL (P010) | JTBD-MA-010: KOL Engagement | owner | ✅ |

**Source:** MA_Persona_Mapping.json (persona_to_jtbd mappings)

---

## 🔍 Useful Queries After Setup

### Get all strategic pillars for a persona:
```sql
SELECT
    p.name as persona_name,
    sp.code as pillar_code,
    sp.name as pillar_name,
    pspm.pain_points_count,
    pspm.is_primary
FROM personas p
JOIN persona_strategic_pillar_mapping pspm ON p.id = pspm.persona_id
JOIN strategic_priorities sp ON pspm.strategic_pillar_id = sp.id
WHERE p.unique_id = 'ma_persona_p001'
ORDER BY pspm.pain_points_count DESC;
```

### Get all JTBDs for a persona:
```sql
SELECT
    p.name as persona_name,
    j.jtbd_code,
    j.title as jtbd_title,
    pjm.is_primary,
    pjm.role_type
FROM personas p
JOIN persona_jtbd_mapping pjm ON p.id = pjm.persona_id
JOIN jtbd_library j ON pjm.jtbd_id = j.id
WHERE p.unique_id = 'ma_persona_p001'
ORDER BY pjm.is_primary DESC, j.jtbd_code;
```

### Get top personas for a strategic pillar:
```sql
SELECT
    p.name as persona_name,
    pspm.pain_points_count,
    pspm.jtbd_count,
    pspm.is_primary
FROM persona_strategic_pillar_mapping pspm
JOIN personas p ON pspm.persona_id = p.id
JOIN strategic_priorities sp ON pspm.strategic_pillar_id = sp.id
WHERE sp.code = 'SP01'
ORDER BY pspm.pain_points_count DESC
LIMIT 10;
```

---

## 📁 Files Reference

### SQL Files
- `supabase/migrations/20251110_create_persona_sp_jtbd_mappings.sql` - Full migration with views/functions
- `scripts/CREATE_TABLES.sql` - Simple CREATE TABLE statements (generated)
- `scripts/create_mapping_tables_simple.sql` - Minimal version

### Python Scripts
- `scripts/populate_persona_mappings.py` - Main population script ⭐
- `scripts/create_tables_workaround.py` - Shows SQL to copy-paste
- `scripts/apply_persona_mappings_migration.py` - Checks table existence

### Data Sources
- Existing `personas.pain_points` JSONB - For SP mappings
- `/Users/hichamnaim/Downloads/MA_Persona_Mapping.json` - For JTBD mappings

---

## ⚠️ Troubleshooting

### "Table already exists" error
- This is fine! `IF NOT EXISTS` clause prevents errors
- Re-running the SQL is safe

### "No mappings created" after Step 2
- Check that personas have pain_points data: `SELECT unique_id, jsonb_array_length(pain_points) FROM personas WHERE unique_id LIKE 'ma_persona_%'`
- Check that strategic_priorities table exists and has SP01-SP07
- Check that jtbd_library table exists with JTBD-MA-* codes

### Cannot connect to Supabase
- Verify `.env` has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Test connection: `python3 -c "from supabase import create_client; import os; client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY')); print('OK')"`

---

## ✅ Verification Checklist

After completing both steps:

- [ ] Step 1 completed: Tables created in Supabase
- [ ] Step 2 completed: Script ran successfully
- [ ] `persona_strategic_pillar_mapping` has ~140 rows
- [ ] `persona_jtbd_mapping` has ~200 rows
- [ ] Can query relationships using example queries above
- [ ] No error messages in script output

---

## 🎉 Next Steps After Setup

Once mappings are populated, you can:

1. **Display in UI**
   - Show strategic pillar badges on persona cards
   - Display JTBD ownership in persona detail pages
   - Filter personas by strategic pillar

2. **Analytics**
   - Which pillars have the most persona engagement
   - Which personas are overloaded across pillars
   - JTBD coverage analysis per persona

3. **Workflow Automation**
   - Suggest relevant personas for new JTBDs
   - Auto-assign personas to strategic initiatives
   - Generate persona workload reports

---

**Status:** Ready to execute! Start with Step 1. 🚀
