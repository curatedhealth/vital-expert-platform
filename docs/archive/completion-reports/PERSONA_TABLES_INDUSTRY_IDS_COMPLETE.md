# Persona Tables - Industry-Specific IDs Implementation ✅

## Executive Summary

Successfully restructured persona tables to support multi-industry personas with industry-specific reference IDs.

---

## Changes Implemented

### 1. Added Industry-Specific ID Columns

Both `dh_personas` and `org_personas` tables now have:

```sql
-- Industry-Specific Reference IDs
digital_health_id   VARCHAR(50)  -- Digital Health personas (e.g., DH-P001)
pharma_id           VARCHAR(50)  -- Pharmaceutical personas (e.g., P001)
biotech_id          VARCHAR(50)  -- Biotech personas
meddev_id           VARCHAR(50)  -- Medical Device personas
dx_id               VARCHAR(50)  -- Diagnostics personas
```

### 2. Table Purposes Clarified

| Table | Purpose | Count | Use Case |
|-------|---------|-------|----------|
| **`dh_personas`** | JTBD Persona Library | 182 | Comprehensive persona library with VPANES scoring, goals, pain points, responsibilities |
| **`org_personas`** | Organizational Personas | 35 | Tenant-specific personas for org structure |

### 3. Data Population

✅ **43 Medical Affairs personas** automatically populated with `pharma_id`:
- P001 through P043 (Medical Affairs Complete Library)
- Matched on `persona_code ~ '^P0[0-9]{2}$'` AND `sector LIKE '%Pharmaceutical%'`

---

## Database Schema

### dh_personas (Main JTBD Library)

```sql
CREATE TABLE dh_personas (
  id                    UUID PRIMARY KEY,
  persona_code          TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  title                 TEXT NOT NULL,
  sector                TEXT,
  function              TEXT,
  
  -- Industry-Specific IDs (NEW)
  digital_health_id     VARCHAR(50),
  pharma_id             VARCHAR(50),
  biotech_id            VARCHAR(50),
  meddev_id             VARCHAR(50),
  dx_id                 VARCHAR(50),
  
  -- VPANES Scoring
  tier                  INTEGER,
  value_score           INTEGER,
  pain_score            INTEGER,
  adoption_score        INTEGER,
  network_score         INTEGER,
  ease_score            INTEGER,
  strategic_score       INTEGER,
  priority_score        NUMERIC,
  
  -- Rich Content
  responsibilities      JSONB DEFAULT '[]',
  pain_points           JSONB DEFAULT '[]',
  goals                 JSONB DEFAULT '[]',
  needs                 JSONB DEFAULT '[]',
  behaviors             JSONB DEFAULT '[]',
  frustrations          JSONB DEFAULT '[]',
  motivations           JSONB DEFAULT '[]',
  
  -- References
  industry_id           UUID REFERENCES industries(id),
  primary_role_id       UUID REFERENCES org_roles(id),
  
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

### org_personas (Organizational Structure)

```sql
CREATE TABLE org_personas (
  id                    UUID PRIMARY KEY,
  tenant_id             UUID NOT NULL,
  code                  TEXT NOT NULL,
  name                  TEXT NOT NULL,
  department            TEXT,
  
  -- Industry-Specific IDs (NEW)
  digital_health_id     VARCHAR(50),
  pharma_id             VARCHAR(50),
  biotech_id            VARCHAR(50),
  meddev_id             VARCHAR(50),
  dx_id                 VARCHAR(50),
  industry_id           UUID REFERENCES industries(id),
  
  -- Organizational Details
  primary_role_id       UUID REFERENCES org_roles(id),
  reports_to            TEXT,
  decision_authority    TEXT,
  
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes Created

```sql
-- dh_personas indexes
CREATE INDEX idx_dh_personas_pharma_id 
  ON dh_personas(pharma_id) WHERE pharma_id IS NOT NULL;

-- org_personas indexes  
CREATE INDEX idx_org_personas_pharma_id 
  ON org_personas(pharma_id) WHERE pharma_id IS NOT NULL;

CREATE INDEX idx_org_personas_industry_id 
  ON org_personas(industry_id) WHERE industry_id IS NOT NULL;
```

---

## Current State

### Medical Affairs Personas (dh_personas)

```
✅ 43 personas with pharma_id populated
   P001 - VP Medical Affairs / Chief Medical Officer
   P002 - Medical Director (Therapeutic Area/Product Lead)
   P003 - Head of Field Medical
   ...
   P043 - Medical Affairs Vendor Manager
```

### Sample Data

| persona_code | name | sector | pharma_id | biotech_id |
|-------------|------|--------|-----------|------------|
| P001 | Clinical Development Director | Pharmaceutical & Life Sciences | P001 | NULL |
| P002 | Regulatory Affairs Director | Pharmaceutical & Life Sciences | P002 | NULL |
| P003 | Medical Affairs Leader | Pharmaceutical & Life Sciences | P003 | NULL |

---

## Next Steps - Persona Mapping

### 1. The Original Issue

The persona enrichment script **failed** because:
- ❌ JTBDs are not yet imported (JTBD-MA-001 through JTBD-MA-120)
- ❌ Foreign key constraint violations when trying to map personas to non-existent JTBDs

### 2. What Needs to Happen

#### Option A: Import All 120 Medical Affairs JTBDs First
```bash
# We have the file: MEDICAL_AFFAIRS_JTBD_CONSOLIDATED_AUGMENTED.json
# Contains all 120 JTBDs with full details
```

#### Option B: Skip JTBD Mappings, Focus on Persona Enrichment Only
```python
# Enrich personas with full content from:
# MEDICAL_AFFAIRS_ALL_43_PERSONAS_COMPLETE.json
# But skip the JTBD relationship mapping for now
```

---

## Usage Examples

### Query Personas by Industry

```sql
-- Get all Pharmaceutical personas
SELECT persona_code, name, title
FROM dh_personas
WHERE pharma_id IS NOT NULL;

-- Get Digital Health personas
SELECT persona_code, name, title
FROM dh_personas
WHERE digital_health_id IS NOT NULL;
```

### Cross-Industry Persona Lookup

```sql
-- Find persona by any industry ID
SELECT *
FROM dh_personas
WHERE pharma_id = 'P001'
   OR digital_health_id = 'P001'
   OR biotech_id = 'P001';
```

### Link Industries Table

```sql
-- Get personas with full industry details
SELECT 
  p.persona_code,
  p.name,
  p.pharma_id,
  i.industry_name,
  i.industry_code
FROM dh_personas p
LEFT JOIN industries i ON p.industry_id = i.id
WHERE p.pharma_id IS NOT NULL;
```

---

## Migration Applied

**Migration Name**: `add_industry_ids_to_personas_simple`

**Date**: November 9, 2025

**Status**: ✅ Successfully Applied

---

## Recommendation

**IMPORT THE 111 NEW JTBDs FIRST** before attempting persona-JTBD mappings.

The enrichment script is ready, but it will continue to fail on JTBD mappings until we have the full JTBD library in `jtbd_library` table.

Would you like me to:
1. ✅ **Import all 111 new Medical Affairs JTBDs** from `MEDICAL_AFFAIRS_JTBD_CONSOLIDATED_AUGMENTED.json`
2. ⏸️  Then re-run persona enrichment + mapping

Or:

3. ⚠️  Skip JTBD mappings and just enrich persona content only

---

**Generated**: November 9, 2025  
**Author**: Cursor AI Assistant  
**Status**: ✅ COMPLETE


