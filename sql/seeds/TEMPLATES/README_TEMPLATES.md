# SQL Seed Templates - VITAL Platform

## Overview

This directory contains **gold standard templates** for creating seed data files across the VITAL platform. These templates have been tested and validated in production environments for both Pharmaceuticals and Digital Health industries.

## Available Templates

### 1. TEMPLATE_personas_seed.sql
**Size:** 325KB | **Lines:** 7,736
**Content:** 16 Medical Affairs personas with complete normalized data

**Features:**
- Fully normalized structure (no JSONB)
- 217+ research citations and evidence sources
- Complete persona attributes across 20+ junction tables
- VPANES scoring methodology implemented
- Multi-tenant ready with tenant_id support

**Tables Populated:**
- `personas` - Core persona data
- `persona_goals` - Strategic and operational goals
- `persona_pain_points` - Pain points with categories
- `persona_challenges` - Challenges with impact levels
- `persona_responsibilities` - Key responsibilities
- `persona_frustrations` - Daily frustrations
- `persona_quotes` - Representative quotes
- `persona_tools` - Tools and software used
- `persona_communication_channels` - Preferred channels
- `persona_decision_makers` - Decision-making relationships
- `persona_success_metrics` - KPIs and success measures
- `persona_motivations` - What drives them
- `persona_personality_traits` - Behavioral traits
- `persona_values` - Core values
- `persona_education` - Educational background
- `persona_certifications` - Professional certifications
- `persona_typical_day` - Daily activities
- `persona_organization_types` - Organization contexts
- `persona_typical_locations` - Work locations
- `persona_evidence_sources` - Research sources
- `persona_vpanes_scoring` - VPANES methodology scores

**Usage Example:**
```bash
# Copy template
cp TEMPLATES/TEMPLATE_personas_seed.sql 03_content/market_access_personas.sql

# Edit with your persona data
# Replace tenant_id: f7aa6fd4-0af9-4706-8b31-034f1f7accda with your tenant
# Replace function_id lookups to match your organizational structure

# Run preparation scripts first!
cd 00_PREPARATION
for script in *.sql; do
    psql $DB_URL -f "$script"
done

# Load your personas
cd ..
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "03_content/market_access_personas.sql"
```

---

### 2. TEMPLATE_org_functions_and_departments.sql
**Size:** 13KB | **Lines:** 176
**Content:** Complete organizational functions and departments for 2 industries

**Features:**
- Functions for Pharmaceuticals (13 functions)
- Functions for Digital Health (7 functions)
- Departments for Pharmaceuticals (17 departments)
- Departments for Digital Health (11 departments)
- Color-coded with icons
- Foreign key relationships established
- Idempotent (ON CONFLICT DO UPDATE)

**Pharmaceutical Functions:**
1. Research & Development
2. Clinical
3. Regulatory
4. Medical Affairs
5. Commercial
6. Market Access
7. Manufacturing
8. Quality
9. IT/Digital
10. Legal
11. Business Development
12. Finance
13. HR

**Digital Health Functions:**
1. IT/Digital (Product Engineering)
2. Clinical
3. Regulatory
4. Operations
5. Commercial (Marketing & Growth)
6. Finance
7. HR

**Usage Example:**
```bash
# Copy template
cp TEMPLATES/TEMPLATE_org_functions_and_departments.sql 02_organization/my_org_structure.sql

# Edit tenant IDs to match your tenants
# Customize function names, descriptions, icons, colors
# Add or remove departments as needed

# Load
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "02_organization/my_org_structure.sql"
```

---

### 3. TEMPLATE_org_roles.sql
**Size:** 47KB | **Lines:** 562
**Content:** Comprehensive organizational roles across all departments and seniority levels

**Features:**
- 80+ role definitions
- 5 seniority levels: executive, senior, mid, junior, entry
- Roles linked to functions and departments
- Cross-industry coverage (Pharma + Digital Health)
- Idempotent INSERT statements

**Pharmaceutical Roles Include:**
- Executive: CEO, CMO, CFO, Head of CMC, etc.
- R&D: Discovery Director, Research Scientist, etc.
- Clinical: Clinical Trials Manager, Clinical Research Associate, etc.
- Medical Affairs: MSL Director, Medical Science Liaison, Publications Manager
- Market Access: HEOR Director, Pricing Lead, Market Access Manager
- Commercial: Brand Manager, Sales Rep, Key Account Manager
- And 50+ more roles across all functions

**Digital Health Roles Include:**
- Executive: CEO, CTO, CPO, CMO, CDO
- Product: Product Manager, Product Designer, UX Researcher
- Engineering: Backend Engineer, Frontend Engineer, DevOps, QA
- Data: Data Scientist, ML Engineer, Analytics Engineer
- Clinical: Clinical Product Manager, Medical Director
- Operations: Customer Success Manager, Support Engineer
- And 30+ more roles

**Seniority Levels:**
- `executive` - C-suite and VPs
- `senior` - Senior ICs and Directors
- `mid` - Managers and experienced ICs
- `junior` - Associates and junior ICs
- `entry` - Entry-level roles

**Usage Example:**
```bash
# Copy template
cp TEMPLATES/TEMPLATE_org_roles.sql 02_organization/my_roles.sql

# Prerequisites: org_functions and org_departments must exist!
# The script dynamically fetches department IDs

# Edit to:
# 1. Change tenant IDs
# 2. Update department slugs to match your org structure
# 3. Add/remove roles as needed
# 4. Adjust seniority levels

# Load
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "02_organization/my_roles.sql"
```

---

## Template Characteristics

All templates share these characteristics:

### 1. Idempotent Operations
```sql
-- Functions/Departments
ON CONFLICT (tenant_id, name) DO UPDATE SET
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Roles
ON CONFLICT (tenant_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();
```

### 2. Multi-Tenant Architecture
All templates use `tenant_id UUID` for data isolation:
```sql
-- Pharmaceuticals tenant
'f7aa6fd4-0af9-4706-8b31-034f1f7accda'::uuid

-- Digital Health Startup tenant
'11111111-1111-1111-1111-111111111111'::uuid
```

### 3. Foreign Key Relationships
```
tenants
  └─ org_functions (tenant_id → tenants.id)
       └─ org_departments (function_id → org_functions.id)
            └─ org_roles (department_id → org_departments.id)
                 └─ personas (role_id → org_roles.id)
```

### 4. Dynamic ID Resolution
Templates use PL/pgSQL blocks to fetch IDs:
```sql
DO $$
DECLARE
  v_function_id UUID;
  v_dept_id UUID;
BEGIN
  SELECT id INTO v_function_id FROM org_functions WHERE slug = 'medical-affairs';
  SELECT id INTO v_dept_id FROM org_departments WHERE slug = 'medical-comms';

  INSERT INTO org_roles (function_id, department_id, ...) VALUES (v_function_id, v_dept_id, ...);
END $$;
```

---

## Best Practices

### 1. Always Run Preparation Scripts First
Before loading personas, ensure schema is ready:
```bash
cd 00_PREPARATION
for script in *.sql; do psql $DB_URL -f "$script"; done
```

### 2. Follow Dependency Order
```
01_foundation/tenants.sql
  ↓
02_organization/TEMPLATE_org_functions_and_departments.sql
  ↓
02_organization/TEMPLATE_org_roles.sql
  ↓
03_content/TEMPLATE_personas_seed.sql
```

### 3. Use Error Handling
```bash
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "your_seed.sql"
```

### 4. Customize Tenant IDs
Replace template tenant IDs with your actual tenant UUIDs:
```sql
-- Find your tenant ID
SELECT id, name, slug FROM tenants;

-- Update all instances in your copied template
-- OLD: 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
-- NEW: 'your-actual-tenant-id-here'
```

### 5. Verify After Loading
```sql
-- Check functions
SELECT tenant_id, name, slug FROM org_functions ORDER BY sort_order;

-- Check departments
SELECT
  d.name as department,
  f.name as function
FROM org_departments d
JOIN org_functions f ON f.id = d.function_id
ORDER BY f.name, d.name;

-- Check roles
SELECT
  r.name as role,
  r.seniority_level,
  d.name as department,
  f.name as function
FROM org_roles r
LEFT JOIN org_departments d ON d.id = r.department_id
JOIN org_functions f ON f.id = r.function_id
ORDER BY f.name, r.seniority_level, r.name;

-- Check personas
SELECT
  p.name,
  r.name as role,
  d.name as department,
  f.name as function
FROM personas p
JOIN org_roles r ON r.id = p.role_id
LEFT JOIN org_departments d ON d.id = r.department_id
JOIN org_functions f ON f.id = r.function_id
ORDER BY f.name, r.name;
```

---

## Template Versions

| Template | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| TEMPLATE_personas_seed.sql | 1.0 | 2025-11-16 | Production Ready ✅ |
| TEMPLATE_org_functions_and_departments.sql | 1.0 | 2025-11-16 | Production Ready ✅ |
| TEMPLATE_org_roles.sql | 1.0 | 2025-11-16 | Production Ready ✅ |

---

## Support

For issues or questions:
1. Check [README_CLEAN_STRUCTURE.md](../README_CLEAN_STRUCTURE.md) for directory structure
2. See [README_TEMPLATE.md](../README_TEMPLATE.md) for detailed persona template guide
3. Review [QUICK_START.md](../QUICK_START.md) for common tasks
4. Check [README_FIXES.md](../README_FIXES.md) for schema preparation details

---

**Location:** `/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/TEMPLATES/`
**Last Updated:** 2025-11-16
**Status:** Production Ready ✅
