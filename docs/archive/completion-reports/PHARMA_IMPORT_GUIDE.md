# Pharmaceutical Tenant Import Guide

**Date**: 2025-11-13
**Status**: Ready to import
**Industry**: Pharmaceuticals

---

## Overview

This guide will help you import all pharmaceutical industry data into your multi-tenant system.

**Data Found**:
- ✅ Personas: 8 pharmaceutical personas
- ✅ JTBDs: 127 jobs-to-be-done statements
- ✅ Agents: 90+ pharmaceutical agents (MA, Medical Affairs, Marketing)
- ✅ Org Structure: Functions, Departments, Roles

---

## Import Steps

### Step 1: Create Pharmaceutical Tenant

**File**: [scripts/create_pharma_tenant.sql](scripts/create_pharma_tenant.sql)

**Action**: Copy and run in Supabase Dashboard SQL Editor

```sql
-- This will create:
-- 1. Pharmaceuticals tenant
-- 2. Digital Health Startups tenant (for future use)
```

**After running**, note down the tenant IDs:

```sql
SELECT id, name, slug FROM tenants
WHERE slug IN ('pharmaceuticals', 'digital-health-startups');
```

You'll get something like:
```
id: 123e4567-e89b-12d3-a456-426614174000
name: Pharmaceuticals
slug: pharmaceuticals
```

---

### Step 2: Create Organizational Structure

**File**: [scripts/pharma_org_structure.sql](scripts/pharma_org_structure.sql)

**What it creates**:

**Functions (6)**:
1. Market Access
2. Medical Affairs
3. Regulatory Affairs
4. Clinical Development
5. Commercial
6. Research & Development

**Departments (8)**:
1. HEOR (Health Economics & Outcomes Research)
2. Payer Strategy
3. Pricing & Reimbursement
4. Patient Access
5. Medical Science Liaisons
6. Medical Communications
7. Clinical Operations
8. Biostatistics

**Roles (8)**:
1. VP Market Access (Executive)
2. Director HEOR (Senior)
3. Market Access Manager (Mid)
4. Pricing Manager (Mid)
5. VP Medical Affairs (Executive)
6. Medical Director (Senior)
7. Medical Science Liaison (Mid)
8. Clinical Development Director (Senior)

**Before running**:
1. Open [scripts/pharma_org_structure.sql](scripts/pharma_org_structure.sql)
2. Replace `REPLACE_WITH_PHARMA_TENANT_ID` with your actual tenant ID
3. Run in Supabase Dashboard

**Verification**:
```sql
-- Check counts
SELECT
  'Functions' as type, COUNT(*) as count
FROM org_functions WHERE tenant_id = 'YOUR_TENANT_ID'
UNION ALL
SELECT 'Departments', COUNT(*)
FROM org_departments WHERE tenant_id = 'YOUR_TENANT_ID'
UNION ALL
SELECT 'Roles', COUNT(*)
FROM org_roles WHERE tenant_id = 'YOUR_TENANT_ID';

-- Expected:
-- Functions: 6
-- Departments: 8
-- Roles: 8
```

---

### Step 3: Import Personas

**Source Files**:
- [data/persona_master_catalogue_20251108_204641.json](data/persona_master_catalogue_20251108_204641.json)

**Personas to Import**:
1. **Clinical Development Director** - Clinical trial design and execution
2. **Digital Therapeutics CEO** - DTx product strategy
3. **Regulatory Affairs Director** - FDA regulatory strategy
4. **Payer CMO** - Clinical evidence evaluation
5. **Digital Health Product Manager** - Product development and launch
6. **Clinical Trial Operations Manager** - Trial site management
7. **Medical Affairs Director** - Medical strategy and evidence generation
8. **Health Economics Director** - Economic modeling and value demonstration

**Next Action**: Create persona transformation script (similar to agents)

---

### Step 4: Import Jobs-to-be-Done (JTBDs)

**Source Files**:
- [data/phase2_all_jtbds_20251108_211301.json](data/phase2_all_jtbds_20251108_211301.json)

**What's Included**:
- 127 JTBD statements
- Satisfaction scores
- Importance ratings
- Persona mappings

**Next Action**: Create JTBD transformation script

---

### Step 5: Import Pharmaceutical Agents

**Source Files**:
1. **Market Access** (30 agents): [docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json](docs/MARKET_ACCESS_AGENTS_30_COMPLETE.json)
   - HEOR: 6 agents
   - Payer Strategy: 6 agents
   - Pricing: 5 agents
   - Patient Access: 5 agents
   - Policy: 3 agents
   - Communications: 2 agents
   - Operations: 3 agents

2. **Medical Affairs** (30 agents): [docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json](docs/MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json)
   - Clinical specialists across therapeutic areas

3. **Marketing** (30 agents): [docs/MARKETING_AGENTS_30_ENHANCED.json](docs/MARKETING_AGENTS_30_ENHANCED.json)
   - Brand managers, product marketers, commercial strategists

**Total**: 90 pharmaceutical agents

**Next Action**: Use existing agent transformation pipeline with tenant_id

---

## Data File Locations

```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
├── data/
│   ├── persona_master_catalogue_20251108_204641.json (17 KB)
│   └── phase2_all_jtbds_20251108_211301.json (91 KB)
├── docs/
│   ├── MARKET_ACCESS_AGENTS_30_COMPLETE.json (48 KB)
│   ├── MEDICAL_AFFAIRS_AGENTS_30_COMPLETE.json (35 KB)
│   └── MARKETING_AGENTS_30_ENHANCED.json (33 KB)
└── scripts/
    ├── create_pharma_tenant.sql
    ├── pharma_org_structure.sql
    └── import_pharma_data.py
```

---

## Import Order (Critical)

**MUST follow this order due to foreign key dependencies**:

1. ✅ **Tenants** → Required by all other tables
2. ✅ **Org Functions** → Required by departments & roles
3. ✅ **Org Departments** → References functions
4. ✅ **Org Roles** → References functions
5. **Personas** → References tenant, optionally roles
6. **JTBDs** → References tenant
7. **Agents** → References tenant, optionally roles/functions

---

## Multi-Tenant Architecture

### How Tenant Filtering Works

**In Frontend (Your Dropdown)**:
```typescript
// When user selects tenant
const selectedTenant = 'pharmaceuticals'; // or 'digital-health-startups'

// Fetch tenant-specific data
const response = await fetch(`/api/personas?tenant_slug=${selectedTenant}`);
const personas = await response.json();
// Returns only personas for selected tenant
```

**In Database Queries**:
```sql
-- Get tenant ID from slug
SELECT id FROM tenants WHERE slug = 'pharmaceuticals';

-- Then filter all queries
SELECT * FROM personas WHERE tenant_id = 'tenant-uuid';
SELECT * FROM agents WHERE tenant_id = 'tenant-uuid';
SELECT * FROM org_functions WHERE tenant_id = 'tenant-uuid';
```

**In API Routes**:
```typescript
// Example: app/api/personas/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = searchParams.get('tenant_slug');

  // Get tenant_id
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', tenantSlug)
    .single();

  // Query with tenant filter
  const { data: personas } = await supabase
    .from('personas')
    .select('*')
    .eq('tenant_id', tenant.id);

  return Response.json(personas);
}
```

---

## Next Steps

1. **Run Step 1**: Create tenants
   ```bash
   # Copy scripts/create_pharma_tenant.sql
   # Paste in Supabase Dashboard SQL Editor
   # Click "Run"
   # Note the tenant IDs
   ```

2. **Run Step 2**: Create org structure
   ```bash
   # Edit scripts/pharma_org_structure.sql
   # Replace REPLACE_WITH_PHARMA_TENANT_ID
   # Run in Supabase Dashboard
   ```

3. **Create Transformation Scripts**:
   - Persona transformation (map to new schema)
   - JTBD transformation (map to new schema)
   - Agent transformation (reuse existing with tenant_id)

4. **Import Data**:
   - Transform → Generate SQL → Import
   - Verify counts after each step

---

## Verification Queries

After each import step, run these queries:

```sql
-- Tenant verification
SELECT id, name, slug, status FROM tenants;

-- Org structure verification
SELECT
  (SELECT COUNT(*) FROM org_functions WHERE tenant_id = 'YOUR_TENANT_ID') as functions,
  (SELECT COUNT(*) FROM org_departments WHERE tenant_id = 'YOUR_TENANT_ID') as departments,
  (SELECT COUNT(*) FROM org_roles WHERE tenant_id = 'YOUR_TENANT_ID') as roles;

-- Data verification
SELECT
  (SELECT COUNT(*) FROM personas WHERE tenant_id = 'YOUR_TENANT_ID') as personas,
  (SELECT COUNT(*) FROM jobs_to_be_done WHERE tenant_id = 'YOUR_TENANT_ID') as jtbds,
  (SELECT COUNT(*) FROM agents WHERE tenant_id = 'YOUR_TENANT_ID') as agents;
```

---

## Files Created

1. ✅ [scripts/create_pharma_tenant.sql](scripts/create_pharma_tenant.sql)
2. ✅ [scripts/pharma_org_structure.sql](scripts/pharma_org_structure.sql)
3. ✅ [scripts/import_pharma_data.py](scripts/import_pharma_data.py)
4. ✅ [PHARMA_IMPORT_GUIDE.md](PHARMA_IMPORT_GUIDE.md) (this file)

---

**Ready to Start!**

Begin with Step 1: Run [scripts/create_pharma_tenant.sql](scripts/create_pharma_tenant.sql)
