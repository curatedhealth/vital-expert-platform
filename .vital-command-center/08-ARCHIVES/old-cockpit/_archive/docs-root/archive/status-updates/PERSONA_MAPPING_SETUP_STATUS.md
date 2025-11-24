# Persona Mapping Setup - Current Status

## Overview
Setting up persona-to-strategic-pillar and persona-to-JTBD mapping tables to enable:
- Which strategic pillars each persona works in
- Which JTBDs each persona owns or contributes to
- Pain points distribution across pillars

---

## ✅ Completed Tasks

### 1. Pain Points Update (COMPLETED ✅)
- **Status**: All 39 MA personas updated with pain points
- **Results**: 609 unique pain points from 105 JTBDs across SP01-SP07
- **File**: [scripts/update_existing_personas_with_pain_points.py](scripts/update_existing_personas_with_pain_points.py)
- **Documentation**: [PERSONA_PAIN_POINTS_FINAL_STATUS.md](PERSONA_PAIN_POINTS_FINAL_STATUS.md)

### 2. Strategic Priorities Table (COMPLETED ✅)
- **Status**: Created and seeded with SP01-SP07
- **Execution**: User executed [scripts/1_CREATE_STRATEGIC_PRIORITIES.sql](scripts/1_CREATE_STRATEGIC_PRIORITIES.sql) in Supabase Dashboard
- **Results**: 7 strategic priorities created

### 3. Mapping Tables Creation (COMPLETED ✅)
- **Status**: Both mapping tables created
- **Execution**: User executed [scripts/2_CREATE_MAPPING_TABLES.sql](scripts/2_CREATE_MAPPING_TABLES.sql) in Supabase Dashboard
- **Tables Created**:
  - `persona_strategic_pillar_mapping`
  - `persona_jtbd_mapping`
  - Views: `persona_strategic_summary`, `persona_jtbd_summary`

### 4. Persona-SP Mappings (COMPLETED ✅)
- **Status**: Successfully populated
- **Results**: 73 persona-to-strategic-pillar mappings created
- **File**: [scripts/populate_persona_mappings.py](scripts/populate_persona_mappings.py)
- **Data Source**: Extracted from pain points in personas table

---

## ⚠️ Current Issue

### Persona-JTBD Mapping - Schema Incompatibility

**Problem**: Type mismatch between tables
- `jtbd_library.id` = VARCHAR/string type (e.g., "ma00001", "JTBD-MA-001", "jtbd00081")
- `persona_jtbd_mapping.jtbd_id` = UUID type (expects format like "123e4567-e89b-12d3-a456-426614174000")

**Error Message**:
```
{'code': '22P02', 'message': 'invalid input syntax for type uuid: "ma00001"'}
```

**Impact**: Cannot populate persona-JTBD mappings (~170 mappings pending)

**Root Cause**: The mapping table was created with UUID type for `jtbd_id` column, but the source `jtbd_library` table uses string-based IDs that are not UUIDs.

---

## 🔧 Required Fix

### Execute Schema Migration

**File**: [scripts/3_FIX_JTBD_MAPPING_SCHEMA.sql](scripts/3_FIX_JTBD_MAPPING_SCHEMA.sql)

**Action Required**: Execute this SQL in Supabase Dashboard SQL Editor

**What it does**:
```sql
ALTER TABLE persona_jtbd_mapping
ALTER COLUMN jtbd_id TYPE VARCHAR(50);
```

This changes the `jtbd_id` column from UUID to VARCHAR(50) to match the `jtbd_library.id` column type.

**Why VARCHAR(50)**:
- Accommodates existing ID formats: "ma00001" (7 chars), "JTBD-MA-001" (11 chars), "jtbd00081" (9 chars)
- Provides buffer for future longer IDs
- Maintains data integrity and referential compatibility

---

## 📋 Next Steps

### Step 1: Execute Schema Fix
```bash
# User action: Execute in Supabase Dashboard SQL Editor
# File: scripts/3_FIX_JTBD_MAPPING_SCHEMA.sql
```

### Step 2: Re-run Population Script
```bash
# After schema fix, run:
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path
python3 scripts/populate_persona_mappings.py
```

**Expected Results**:
- ✅ Persona-SP mappings: 73 (already completed, will skip)
- ✅ Persona-JTBD mappings: ~170 (will now succeed)

---

## 📊 Data Sources

### Persona-SP Mappings
- **Source**: Existing pain points in `personas` table
- **Logic**: Aggregates pain points by strategic pillar
- **Primary SP**: Pillars with >10 pain points for a persona

### Persona-JTBD Mappings
- **Source**: [MA_Persona_Mapping.json](/Users/hichamnaim/Downloads/MA_Persona_Mapping.json)
- **Mappings**: 44 personas with primary/secondary JTBDs
- **Structure**:
  ```json
  {
    "persona_id": "P001",
    "primary": ["JTBD-MA-001", "JTBD-MA-002"],
    "secondary": ["JTBD-MA-010", "JTBD-MA-015"]
  }
  ```

---

## 🗂️ Database Schema

### strategic_priorities
```sql
CREATE TABLE strategic_priorities (
    id UUID PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,  -- SP01-SP07
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true
);
```

### persona_strategic_pillar_mapping
```sql
CREATE TABLE persona_strategic_pillar_mapping (
    id UUID PRIMARY KEY,
    persona_id UUID NOT NULL,
    strategic_pillar_id UUID NOT NULL REFERENCES strategic_priorities(id),
    jtbd_count INTEGER DEFAULT 0,
    pain_points_count INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    priority_score NUMERIC(5,2),
    engagement_metadata JSONB,
    UNIQUE(persona_id, strategic_pillar_id)
);
```

### persona_jtbd_mapping (AFTER FIX)
```sql
CREATE TABLE persona_jtbd_mapping (
    id UUID PRIMARY KEY,
    persona_id UUID NOT NULL,
    jtbd_id VARCHAR(50) NOT NULL,  -- ✅ FIXED: Was UUID, now VARCHAR
    role_type VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    responsibility_level VARCHAR(50),
    pain_points_count INTEGER DEFAULT 0,
    impact_level VARCHAR(20),
    frequency VARCHAR(50),
    engagement_metadata JSONB,
    UNIQUE(persona_id, jtbd_id)
);
```

---

## 📈 Summary Statistics

### Pain Points (Completed)
- **Total Pain Points**: 609 unique pain points
- **Total JTBDs**: 105 JTBDs across SP01-SP07
- **Personas Updated**: 39 MA personas

### Mappings (In Progress)
- **Persona-SP Mappings**: ✅ 73 created
- **Persona-JTBD Mappings**: ⚠️ 0 created (awaiting schema fix)
- **Expected JTBD Mappings**: ~170 (from MA_Persona_Mapping.json)

### Strategic Pillars Coverage
| SP Code | Pillar Name | Personas Mapped |
|---------|-------------|-----------------|
| SP01 | Growth & Market Access | 39 |
| SP02 | Scientific Excellence | 39 |
| SP03 | Stakeholder Engagement | 39 |
| SP04 | Compliance & Quality | 38 |
| SP05 | Operational Excellence | 37 |
| SP06 | Talent Development | 35 |
| SP07 | Innovation & Digital | 34 |

---

## 🎯 Final Goal

Once completed, you'll be able to query:

### Example Query 1: Personas by Strategic Pillar
```sql
SELECT
    p.name as persona_name,
    sp.code,
    sp.name as pillar_name,
    pspm.pain_points_count,
    pspm.is_primary
FROM persona_strategic_pillar_mapping pspm
JOIN personas p ON pspm.persona_id = p.id
JOIN strategic_priorities sp ON pspm.strategic_pillar_id = sp.id
WHERE sp.code = 'SP01'
ORDER BY pspm.pain_points_count DESC;
```

### Example Query 2: JTBDs by Persona
```sql
SELECT
    p.name as persona_name,
    j.jtbd_code,
    j.job_title,
    pjm.is_primary,
    pjm.role_type,
    pjm.responsibility_level
FROM persona_jtbd_mapping pjm
JOIN personas p ON pjm.persona_id = p.id
JOIN jtbd_library j ON pjm.jtbd_id = j.id
WHERE p.unique_id = 'ma_persona_p001'
ORDER BY pjm.is_primary DESC;
```

### Example Query 3: Persona Strategic Summary
```sql
SELECT
    persona_name,
    strategic_pillar_count,
    total_jtbds,
    total_pain_points,
    strategic_pillars,
    pillar_names
FROM persona_strategic_summary
WHERE strategic_pillar_count >= 5
ORDER BY total_pain_points DESC;
```

---

## 📁 Related Files

- [scripts/1_CREATE_STRATEGIC_PRIORITIES.sql](scripts/1_CREATE_STRATEGIC_PRIORITIES.sql) - ✅ Executed
- [scripts/2_CREATE_MAPPING_TABLES.sql](scripts/2_CREATE_MAPPING_TABLES.sql) - ✅ Executed
- [scripts/3_FIX_JTBD_MAPPING_SCHEMA.sql](scripts/3_FIX_JTBD_MAPPING_SCHEMA.sql) - ⚠️ EXECUTE NEXT
- [scripts/populate_persona_mappings.py](scripts/populate_persona_mappings.py) - ⚠️ Re-run after schema fix
- [scripts/update_existing_personas_with_pain_points.py](scripts/update_existing_personas_with_pain_points.py) - ✅ Completed
- [PERSONA_PAIN_POINTS_FINAL_STATUS.md](PERSONA_PAIN_POINTS_FINAL_STATUS.md) - Pain points documentation
- [QUICK_START_SETUP.md](QUICK_START_SETUP.md) - Step-by-step setup guide

---

## ⏭️ Immediate Action Required

**Execute this SQL in Supabase Dashboard:**
```sql
-- File: scripts/3_FIX_JTBD_MAPPING_SCHEMA.sql
ALTER TABLE persona_jtbd_mapping
ALTER COLUMN jtbd_id TYPE VARCHAR(50);
```

**Then run:**
```bash
python3 scripts/populate_persona_mappings.py
```

This will complete the persona-JTBD mapping population and finish the setup.
