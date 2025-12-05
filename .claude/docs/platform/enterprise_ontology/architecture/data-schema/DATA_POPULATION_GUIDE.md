# VITAL Database - Data Population Guide

**Purpose**: Master guide for populating the VITAL database with all required reference and seed data
**Status**: Reference to existing seed files
**Last Updated**: 2025-11-22

---

## Quick Start

### One-Command Population (Full Database)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Run master seed script
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/populate_all_reference_tables.sql
```

---

## Seed Files Location

All seed files are located in:
```
.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/
```

### Directory Structure

```
05-seeds/
├── functions/                    Organizational functions (8 files)
├── departments/                  Departments (15+ departments)
├── roles/                        Roles (15 SQL files, 100+ roles)
├── personas/                     Personas (MECE framework, 4 per role)
├── tenants/                      Multi-tenant setup
├── populate_all_reference_tables.sql    ⭐ MASTER SCRIPT
├── populate_skills_and_tools.sql
└── map_org_to_pharma_tenant.sql
```

---

## Population Order (Critical)

**MUST follow this sequence to avoid foreign key violations**:

### Phase 1: Core Organization (5-10 minutes)

```bash
# 1. Functions (top level)
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/functions/populate_pharma_functions.sql

# 2. Departments (references functions)
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/departments/populate_pharma_departments.sql

# 3. Roles (references functions + departments)
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/roles/populate_all_roles_master.sql
```

**Populated**:
- ✅ 8 Functions (Medical Affairs, R&D, Regulatory, etc.)
- ✅ 15+ Departments
- ✅ 100+ Roles across all functions

---

### Phase 2: Personas (10-15 minutes)

```bash
# Create 4 MECE personas per role
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/personas/create_4_mece_personas_per_role.sql
```

**Populated**:
- ✅ 400+ Personas (4 per role × 100+ roles)
- ✅ VPANES scoring for each
- ✅ Typical day activities
- ✅ Motivations, values, frustrations

---

### Phase 3: Skills & Capabilities (2-3 minutes)

```bash
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/populate_skills_and_tools.sql
```

**Populated**:
- ✅ 50+ Skills
- ✅ 30+ Tools/Capabilities
- ✅ Skill-to-role mappings

---

### Phase 4: Multi-Tenancy (1-2 minutes)

```bash
# Map organization to tenant
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/map_org_to_pharma_tenant.sql
```

**Populated**:
- ✅ Tenant-to-function mappings
- ✅ Tenant-to-department mappings
- ✅ Tenant-to-role mappings
- ✅ Row-Level Security (RLS) ready

---

## Detailed Seed File Catalog

### Functions (8 Total)

**File**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/functions/populate_pharma_functions.sql`

**Populates**:
1. Medical Affairs
2. Market Access & Pricing
3. Commercial Organization
4. Regulatory Affairs
5. Research & Development (R&D)
6. Manufacturing & Supply Chain
7. Finance & Accounting
8. Human Resources

---

### Departments (15+ Total)

**File**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/departments/populate_pharma_departments.sql`

**Populates** (examples):
- Medical Science Liaison (MSL) Team
- Medical Information & Communications
- Clinical Development
- Regulatory Strategy & Submissions
- Pharmacovigilance & Drug Safety
- Commercial Analytics
- Market Access & Reimbursement
- And 8+ more...

---

### Roles (100+ Total, 15 SQL Files)

**Master File**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/roles/populate_all_roles_master.sql`

**Individual Function Files**:
1. `populate_roles_01_medical_affairs.sql` - 12 roles
2. `populate_roles_02_market_access.sql` - 8 roles
3. `populate_roles_03_commercial_organization.sql` - 10 roles
4. `populate_roles_04_regulatory_affairs.sql` - 9 roles
5. `populate_roles_05_research_development_rd.sql` - 11 roles
6. `populate_roles_06_manufacturing_supply_chain.sql` - 8 roles
7. `populate_roles_07_finance_accounting.sql` - 7 roles
8. `populate_roles_08_human_resources.sql` - 6 roles
9. `populate_roles_09_information_technology_it_digital.sql` - 8 roles
10. `populate_roles_10_legal_compliance.sql` - 6 roles
11. `populate_roles_11_corporate_communications.sql` - 5 roles
12. `populate_roles_12_strategic_planning_corporate_development.sql` - 5 roles
13. `populate_roles_13_business_intelligence_analytics.sql` - 6 roles
14. `populate_roles_14_procurement.sql` - 4 roles
15. `populate_roles_15_facilities_workplace_services.sql` - 4 roles

**Example Roles** (Medical Affairs):
- Medical Science Liaison (MSL)
- Senior Medical Science Liaison
- MSL Manager / Field Medical Director
- Medical Director
- VP Medical Affairs
- Chief Medical Officer (CMO)
- Medical Writer
- Medical Information Specialist
- Medical Reviewer
- Publications Manager
- Medical Training Manager
- Medical Communications Manager

---

### Personas (400+ Total)

**File**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/personas/create_4_mece_personas_per_role.sql`

**Creates**: 4 MECE (Mutually Exclusive, Collectively Exhaustive) personas per role

**Persona Dimensions**:
- **Industry Type**: Large Pharma, Mid-Size Biotech, Small Startup, CRO
- **Experience Level**: Entry (0-2 yrs), Mid (3-7 yrs), Senior (8-15 yrs), Executive (15+ yrs)
- **Geography**: North America, Europe, Asia-Pacific, Emerging Markets
- **Therapeutic Focus**: Oncology, Neurology, Cardiology, Rare Diseases, etc.

**Example** (MSL Role):
1. **Sarah the Enterprise MSL** - Large Pharma, Senior, North America, Oncology
2. **Raj the Biotech MSL** - Mid-Size Biotech, Mid-Level, Asia-Pacific, Neurology
3. **Elena the Startup MSL** - Small Startup, Entry, Europe, Rare Diseases
4. **Marcus the CRO MSL** - CRO, Executive, Emerging Markets, Cardiology

**Data Per Persona**:
- VPANES priority scoring (Visibility, Pain, Actions, Needs, Emotions, Scenarios)
- 6-13 typical day activities
- 3-7 motivations
- 3-5 values
- 5-10 frustrations
- Educational background
- Certifications
- 5-10 evidence sources

---

## Verification & Validation

### Check Population Status

```sql
-- Count records in each table
SELECT 'Functions' as table_name, COUNT(*) as count FROM org_functions
UNION ALL
SELECT 'Departments', COUNT(*) FROM org_departments
UNION ALL
SELECT 'Roles', COUNT(*) FROM org_roles
UNION ALL
SELECT 'Personas', COUNT(*) FROM personas
UNION ALL
SELECT 'Skills', COUNT(*) FROM skills
UNION ALL
SELECT 'Capabilities', COUNT(*) FROM capabilities;
```

**Expected Counts**:
- Functions: 8
- Departments: 15+
- Roles: 100+
- Personas: 400+
- Skills: 50+
- Capabilities: 30+

---

### Validate Data Integrity

```sql
-- Check for orphaned roles (missing function or department)
SELECT role_name
FROM org_roles
WHERE function_id IS NULL OR department_id IS NULL;

-- Check for personas without roles
SELECT name
FROM personas
WHERE role_id IS NULL;

-- Check for duplicate unique_ids
SELECT unique_id, COUNT(*)
FROM org_roles
GROUP BY unique_id
HAVING COUNT(*) > 1;
```

**All queries should return 0 rows** (no orphans, no duplicates)

---

## Troubleshooting

### Error: Foreign Key Constraint Violation

**Cause**: Attempting to insert child record before parent exists

**Solution**: Follow population order (Functions → Departments → Roles → Personas)

```bash
# Reset and start over
psql $DATABASE_URL -c "TRUNCATE org_functions, org_departments, org_roles, personas CASCADE;"

# Re-run in correct order
psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/functions/populate_pharma_functions.sql
# ... continue with correct order
```

---

### Error: Duplicate Key Violation

**Cause**: Seed data already exists

**Solution**: Use UPSERT (INSERT ... ON CONFLICT)

All seed files should use:
```sql
INSERT INTO table_name (columns...)
VALUES (...)
ON CONFLICT (unique_id) DO UPDATE SET
  column1 = EXCLUDED.column1,
  updated_at = NOW();
```

This makes seeds **idempotent** (can run multiple times safely)

---

### Error: Null Constraint Violation

**Cause**: Required field missing in seed data

**Solution**: Check seed file and add missing values

```sql
-- Find which columns are NOT NULL
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table'
  AND is_nullable = 'NO';
```

---

## Seed File Templates

### Function Seed Template

**Location**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/functions/function_seed_template.md`

### Role Seed Template

**Location**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/roles/role_seed_template.md`

### Persona Seed Template

**Location**: `.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/personas/create_personas_for_role_template.sql`

---

## Advanced: Custom Seed Data

### Adding a New Function

1. **Edit Function Seed File**:
   ```bash
   nano .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/functions/populate_pharma_functions.sql
   ```

2. **Add INSERT Statement**:
   ```sql
   INSERT INTO org_functions (unique_id, department_name, description)
   VALUES (
     'new-function',
     'New Function Name',
     'Description of new function'
   )
   ON CONFLICT (unique_id) DO UPDATE SET
     department_name = EXCLUDED.department_name,
     updated_at = NOW();
   ```

3. **Run Seed File**:
   ```bash
   psql $DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/functions/populate_pharma_functions.sql
   ```

---

### Adding a New Role

1. **Choose appropriate function file** (e.g., Medical Affairs)
2. **Add role definition**
3. **Reference function_id** from existing functions
4. **Run seed file**

---

### Adding Personas for New Role

1. **Use persona template**:
   ```bash
   cp .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/personas/create_personas_for_role_template.sql \
      .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/personas/create_[role_name]_personas.sql
   ```

2. **Edit template with role-specific data**
3. **Run seed file**

---

## Migration to Production

### Pre-Production Checklist

- [ ] All seed files tested in staging
- [ ] Data counts verified
- [ ] Foreign key integrity validated
- [ ] RLS policies tested with tenant isolation
- [ ] Performance acceptable (<5 min for full population)
- [ ] Rollback plan documented

### Production Deployment

```bash
# 1. Backup production database
pg_dump $PROD_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations first
psql $PROD_DATABASE_URL -f .vital-command-center/04-TECHNICAL/data-schema/06-migrations/...

# 3. Run seed files (in order)
psql $PROD_DATABASE_URL -f .vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/populate_all_reference_tables.sql

# 4. Verify population
psql $PROD_DATABASE_URL -c "SELECT 'Functions', COUNT(*) FROM org_functions ..."
```

---

## Related Documentation

- **Schema Documentation**: `.vital-cockpit/vital-expert-docs/11-data-schema/GOLD_STANDARD_SCHEMA.md`
- **Migration Guide**: `.vital-cockpit/vital-expert-docs/11-data-schema/MIGRATION_EXECUTION_GUIDE.md`
- **Quick Start**: `.vital-cockpit/vital-expert-docs/11-data-schema/QUICK_START_GUIDE.md`
- **Command Center Schema Docs**: `.vital-command-center/04-TECHNICAL/data-schema/README.md`

---

**Maintained By**: Data Architecture Expert, SQL/Supabase Specialist
**Questions?**: Check [CATALOGUE.md](../../CATALOGUE.md) or ask Data Architecture Expert

---

**Status**: All seed files preserved in original location (`.vital-cockpit/vital-expert-docs/11-data-schema/05-seeds/`)
