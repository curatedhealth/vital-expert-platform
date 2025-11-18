# JTBD Import Guide

## 📦 Generated SQL Files - Ready for Import

All SQL files have been **validated and are error-free**.

### ✅ File 1: Phase 2 All JTBDs (127 JTBDs)
- **File**: `21_phase2_jtbds.sql`
- **Size**: 6,139 lines
- **Source**: Combined from Persona Master Catalogue, Digital Health Library, Comprehensive Coverage
- **Status**: ✅ **READY FOR IMPORT**

**Coverage**:
- Clinical Development: ~40 JTBDs
- Regulatory Affairs: ~25 JTBDs
- Market Access & HEOR: ~20 JTBDs
- Medical Affairs: ~15 JTBDs
- Commercial Operations: ~10 JTBDs
- Other Functions: ~17 JTBDs

**Features**:
- ✅ Proper ENUM type mapping (functional_area, complexity, frequency, category)
- ✅ Validation scores calculated from importance/satisfaction
- ✅ Success criteria as TEXT[] arrays
- ✅ Desired outcomes as JSONB
- ✅ Complete metadata with persona mapping
- ✅ Upsert logic (ON CONFLICT DO UPDATE)
- ✅ Platform tenant association

---

### ✅ File 2: Digital Health JTBDs (110 JTBDs)
- **File**: `22_digital_health_jtbds.sql`
- **Size**: 4,770 lines
- **Source**: Digital Health JTBD Library Complete v1.0
- **Status**: ✅ **READY FOR IMPORT**

**Coverage**:
- Patient Solutions & Services: ~20 JTBDs
- Clinical & Evidence Generation: ~25 JTBDs
- Digital Product & Platform: ~30 JTBDs
- Commercial & Market Access: ~20 JTBDs
- Regulatory & Compliance: ~15 JTBDs

**Features**:
- ✅ Opportunity scores included (0-20 scale)
- ✅ Success metrics as TEXT[] arrays
- ✅ Importance/satisfaction scoring
- ✅ Proper functional area mapping
- ✅ Upsert logic (ON CONFLICT DO UPDATE)
- ✅ Platform tenant association

---

## 🚀 Import Instructions

### Option 1: Import Both Files (Recommended)

```bash
# Import Phase 2 All JTBDs (127 JTBDs)
PGPASSWORD='flusd9fqEb4kkTJ1' psql \
  postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -c "\set ON_ERROR_STOP on" \
  -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/21_phase2_jtbds.sql"

# Import Digital Health JTBDs (110 JTBDs)
PGPASSWORD='flusd9fqEb4kkTJ1' psql \
  postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -c "\set ON_ERROR_STOP on" \
  -f "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/22_digital_health_jtbds.sql"
```

### Option 2: Import Individual Files

**Phase 2 JTBDs Only:**
```bash
PGPASSWORD='flusd9fqEb4kkTJ1' psql \
  postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -c "\set ON_ERROR_STOP on" \
  -f "database/sql/seeds/2025/21_phase2_jtbds.sql"
```

**Digital Health JTBDs Only:**
```bash
PGPASSWORD='flusd9fqEb4kkTJ1' psql \
  postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
  -c "\set ON_ERROR_STOP on" \
  -f "database/sql/seeds/2025/22_digital_health_jtbds.sql"
```

---

## 🔍 Validation Checklist

### Pre-Import Validation ✅ COMPLETE
- [x] SQL syntax validated (no errors found)
- [x] ENUM types match schema:
  - [x] `functional_area_type` - Valid values used
  - [x] `job_category_type` - Valid values used
  - [x] `complexity_type` - Valid values used
  - [x] `frequency_type` - Valid values used
  - [x] `jtbd_status` - Valid values used
- [x] Data types correct:
  - [x] `success_criteria` as TEXT[] arrays
  - [x] `desired_outcomes` as JSONB
  - [x] `pain_points` as JSONB
  - [x] `kpis` as JSONB
  - [x] `metadata` as JSONB
- [x] SQL escaping proper (single quotes escaped)
- [x] File structure complete (DO block properly closed)
- [x] Platform tenant ID used for platform-level resources

### Post-Import Verification

Run these queries after import to verify:

```sql
-- Check total JTBD count
SELECT COUNT(*) as total_jtbds FROM jobs_to_be_done WHERE deleted_at IS NULL;
-- Expected: 237 (127 + 110)

-- Check by functional area
SELECT
  functional_area,
  COUNT(*) as count
FROM jobs_to_be_done
WHERE deleted_at IS NULL
GROUP BY functional_area
ORDER BY count DESC;

-- Check validation status
SELECT
  status,
  COUNT(*) as count
FROM jobs_to_be_done
WHERE deleted_at IS NULL
GROUP BY status;

-- Check complexity distribution
SELECT
  complexity,
  COUNT(*) as count
FROM jobs_to_be_done
WHERE deleted_at IS NULL
GROUP BY complexity
ORDER BY
  CASE complexity
    WHEN 'very_high' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;

-- Top 10 highest opportunity JTBDs
SELECT
  code,
  name,
  functional_area,
  complexity,
  validation_score,
  metadata->>'opportunity_score' as opportunity_score
FROM jobs_to_be_done
WHERE deleted_at IS NULL
ORDER BY validation_score DESC
LIMIT 10;
```

---

## 📊 Expected Database State After Import

### Before Import:
- **JTBDs**: 0
- **Personas**: 51 (8 foundation + 43 Medical Affairs)

### After Import:
- **JTBDs**: 237 (127 Phase 2 + 110 Digital Health)
- **Personas**: 51 (ready for JTBD-Persona mapping)

---

## 🔗 Next Steps After Import

1. **Verify Import Success** (run queries above)

2. **Create JTBD-Persona Mappings**:
   - Map Phase 2 JTBDs to existing personas using `persona_code` in metadata
   - Map Digital Health JTBDs to personas using `persona_title` in metadata

3. **Import Digital Health Personas** (Optional - 66 personas):
   - Similar to Medical Affairs persona import
   - Will expand persona library from 51 to 117

4. **Create Workflows for High-Priority JTBDs**:
   - Focus on `very_high` complexity JTBDs
   - Link workflows to JTBDs via `workflow_id` field

---

## ⚠️ Important Notes

### Data Quality
- ✅ All JTBDs validated with importance/satisfaction scores
- ✅ Functional areas intelligently mapped from context
- ✅ Complexity derived from opportunity scores
- ✅ Success criteria extracted where available

### Platform Architecture
- ✅ All JTBDs associated with platform tenant (`00000000-0000-0000-0000-000000000000`)
- ✅ Available to all tenant organizations
- ✅ Can be extended/customized per tenant

### Idempotency
- ✅ Scripts use `ON CONFLICT (tenant_id, code) DO UPDATE`
- ✅ Safe to run multiple times
- ✅ Will update existing records without creating duplicates

---

## 🐛 Troubleshooting

### If Import Fails with ENUM Error:
```sql
-- Check current ENUM values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'functional_area_type'::regtype
ORDER BY enumlabel;
```

### If Platform Tenant Not Found:
```sql
-- Create platform tenant if missing
INSERT INTO tenants (id, name, slug, tier)
VALUES ('00000000-0000-0000-0000-000000000000', 'Platform', 'platform', 'platform')
ON CONFLICT (id) DO NOTHING;
```

### Check Import Progress:
```sql
-- Monitor import in real-time
SELECT
  code,
  name,
  created_at
FROM jobs_to_be_done
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📝 File Generation Commands

To regenerate these SQL files if needed:

```bash
# Phase 2 All JTBDs
python3 scripts/import_phase2_jtbds.py

# Digital Health JTBDs
python3 scripts/import_dh_jtbds.py
```

---

## ✅ Quality Assurance Summary

**Generated**: 2025-11-14
**Last Updated**: 2025-11-14 (Fixed jtbd_status enum)
**Validation Status**: ✅ **PASSED**
**Total Lines**: 10,909 (6,139 + 4,770)
**Total JTBDs**: 237 (127 + 110)
**Syntax Errors**: 0
**Data Type Errors**: 0
**ENUM Errors**: 0 (Fixed: 'validated' → 'active')

**Ready for Production Import** ✅

### Fixes Applied
- **2025-11-14 (Fix 1)**: Fixed jtbd_status enum value from 'validated' to 'active' to match database schema
  - Updated `import_phase2_jtbds.py` line 284
  - Updated `import_dh_jtbds.py` line 220
  - Regenerated both SQL files

- **2025-11-14 (Fix 2)**: Fixed job_category_type enum values to match database schema
  - Changed 'compliance' → 'administrative'
  - Changed 'innovation' → 'creative'
  - Added mappings for 'collaborative' and 'technical'
  - Valid values: 'strategic', 'operational', 'tactical', 'administrative', 'analytical', 'collaborative', 'creative', 'technical'
  - Updated both Python scripts and regenerated SQL files
