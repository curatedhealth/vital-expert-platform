# Quick Start Guide - VITAL Path SQL

**Last Updated**: 2025-11-16

---

## For New Database Deployments

### Step 1: Create Database Schema (Required)

Execute schema files in order via Supabase Studio SQL Editor:

```bash
cd sql/schema/

# Execute each file in order (01 → 10)
# Copy and paste content into Supabase SQL Editor or use psql:

psql -h your-db-host -U postgres -d your-database < 01_complete_schema_part1.sql
psql -h your-db-host -U postgres -d your-database < 02_complete_schema_part2_foundation.sql
psql -h your-db-host -U postgres -d your-database < 03_complete_schema_part3_core.sql
psql -h your-db-host -U postgres -d your-database < 04_complete_schema_part4_content.sql
psql -h your-db-host -U postgres -d your-database < 05_complete_schema_part5_services.sql
psql -h your-db-host -U postgres -d your-database < 06_complete_schema_part6_execution.sql
psql -h your-db-host -U postgres -d your-database < 07_complete_schema_part7_governance.sql
psql -h your-db-host -U postgres -d your-database < 08_complete_schema_part8_final.sql
psql -h your-db-host -U postgres -d your-database < 09_add_comprehensive_persona_jtbd_tables.sql
psql -h your-db-host -U postgres -d your-database < 10_add_comprehensive_org_roles_columns.sql
```

**Time**: ~15-20 minutes total

### Step 2: Update Tenant IDs in Seed Files (Required)

**CRITICAL**: Replace placeholder UUID with your actual tenant ID:

```bash
cd sql/seeds/

# Replace in all seed files at once:
find . -name "*.sql" -exec sed -i '' "s/11111111-1111-1111-1111-111111111111/YOUR-ACTUAL-TENANT-UUID/g" {} +

# Or manually edit each file and replace:
# 11111111-1111-1111-1111-111111111111
# with your real tenant UUID
```

### Step 3: Load Seed Data (Required)

Execute seed files **in phase order**:

```bash
cd sql/seeds/

# Phase 1: Foundation (no dependencies)
psql ... < 01_foundation/01_tenants.sql
psql ... < 01_foundation/02_industries.sql

# Phase 2: Organization (depends on foundation)
psql ... < 02_organization/01_org_functions.sql
psql ... < 02_organization/02_org_departments.sql
psql ... < 02_organization/03_org_roles.sql

# Phase 3: Content (depends on organization + foundation)
psql ... < 03_content/01_personas.sql
psql ... < 03_content/02_strategic_priorities.sql
psql ... < 03_content/03_jobs_to_be_done.sql

# Phase 4: Operational (depends on foundation)
psql ... < 04_operational/01_agents.sql
psql ... < 04_operational/02_tools.sql
psql ... < 04_operational/03_prompts.sql
psql ... < 04_operational/04_knowledge_domains.sql
```

**Time**: ~10-15 minutes total

### Step 4: Apply Policies and Functions (Required)

```bash
cd sql/

# RLS Policies
psql ... < policies/20240101000001_rls_policies.sql

# Vector Search Function
psql ... < functions/vector-search-function.sql
```

**Time**: ~2 minutes

### Step 5: (Optional) Setup Utilities

```bash
cd sql/utilities/

# LLM Providers (if using AI features)
psql ... < 20250919140000_llm_providers_schema.sql
psql ... < insert-providers-only.sql

# LangChain (if using RAG)
psql ... < langchain-setup.sql
```

**Time**: ~5 minutes

---

## For Existing Databases

If you already have a VITAL Path database:

### Option 1: Fresh Start (Recommended)
1. Backup your current data
2. Drop and recreate database
3. Follow "New Database Deployments" steps above
4. Restore data as needed

### Option 2: Update Existing
1. Review schema files to see what's new
2. Apply only new/missing tables or columns
3. Use seed files to add missing reference data
4. Be careful of conflicts with existing data

---

## Verification

After setup, verify everything is working:

```sql
-- 1. Check schema exists
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
-- Expected: 30+ tables

-- 2. Check foundation data
SELECT 
    (SELECT COUNT(*) FROM tenants) as tenants,
    (SELECT COUNT(*) FROM industries) as industries;
-- Expected: 1+ tenants, 4+ industries

-- 3. Check organization data
SELECT 
    (SELECT COUNT(*) FROM org_functions) as functions,
    (SELECT COUNT(*) FROM org_departments) as departments,
    (SELECT COUNT(*) FROM org_roles) as roles;
-- Expected: 4+ functions, 10+ departments, 10+ roles

-- 4. Check content data
SELECT 
    (SELECT COUNT(*) FROM personas) as personas,
    (SELECT COUNT(*) FROM strategic_priorities) as priorities,
    (SELECT COUNT(*) FROM jobs_to_be_done) as jtbds;
-- Expected: 8+ personas, 1+ priorities, 10+ JTBDs

-- 5. Check operational data
SELECT 
    (SELECT COUNT(*) FROM agents) as agents,
    (SELECT COUNT(*) FROM tools) as tools,
    (SELECT COUNT(*) FROM prompts) as prompts,
    (SELECT COUNT(*) FROM knowledge_domains) as domains;
-- Expected: 8+ agents, varies by setup
```

---

## Execution Order Summary

**Critical Order**:
1. Schema (01 → 10) - **Must be first**
2. Foundation Seeds (tenants, industries) - **Must be before organization**
3. Organization Seeds (functions → departments → roles) - **Must be before content**
4. Content Seeds (personas, priorities, JTBDs) - **After organization**
5. Operational Seeds (agents, tools, prompts, domains) - **After foundation**
6. Policies - **After schema**
7. Functions - **After schema**
8. Utilities - **Optional, as needed**

**Dependency Tree**:
```
Schema
  ├─> Foundation
  │     ├─> Organization
  │     │     └─> Content
  │     └─> Operational
  ├─> Policies
  ├─> Functions
  └─> Utilities (optional)
```

---

## Common Issues

### "relation does not exist"
**Cause**: Schema not fully loaded
**Fix**: Run all schema files in order (01 → 10)

### "foreign key violation"
**Cause**: Wrong execution order for seeds
**Fix**: Follow phase order (01 → 02 → 03 → 04)

### "duplicate key violation"
**Cause**: Data already exists
**Fix**: Normal if re-running seeds (most use `ON CONFLICT DO NOTHING`)

### "invalid input value for enum"
**Cause**: Trying to use wrong enum value
**Fix**: Check schema files for valid enum values

---

## Files Overview

| Directory | Files | Purpose | When to Use |
|-----------|-------|---------|-------------|
| `schema/` | 10 | Database structure | New database setup |
| `seeds/01_foundation/` | 2 | Base data | After schema |
| `seeds/02_organization/` | 3 | Org structure | After foundation |
| `seeds/03_content/` | 3 | Content data | After organization |
| `seeds/04_operational/` | 4 | AI resources | After foundation |
| `functions/` | 1 | DB functions | After schema |
| `policies/` | 1 | RLS policies | After schema |
| `utilities/` | 4 | Setup scripts | As needed |

**Total**: 28 files

---

## Time Estimates

| Task | Time |
|------|------|
| Schema creation | 15-20 min |
| Seed data loading | 10-15 min |
| Policies & functions | 2-5 min |
| Verification | 2-3 min |
| **Total** | **~30-45 min** |

---

## Need Help?

- **Detailed Guide**: See `/sql/README.md`
- **Seed Instructions**: See `/sql/seeds/00_MASTER_README.md`
- **File Categorization**: See `/sql/FILE_CATEGORIZATION_REPORT.md`

---

## Quick Commands

### Using Supabase Studio
1. Go to SQL Editor
2. Copy file contents
3. Paste and execute
4. Repeat for all files in order

### Using psql
```bash
# Set connection details
export PGHOST=your-db-host
export PGUSER=postgres
export PGDATABASE=your-database

# Run all schema files
for i in sql/schema/*.sql; do psql < "$i"; done

# Run all seed files (in order)
for i in sql/seeds/01_foundation/*.sql; do psql < "$i"; done
for i in sql/seeds/02_organization/*.sql; do psql < "$i"; done
for i in sql/seeds/03_content/*.sql; do psql < "$i"; done
for i in sql/seeds/04_operational/*.sql; do psql < "$i"; done

# Apply policies and functions
psql < sql/policies/20240101000001_rls_policies.sql
psql < sql/functions/vector-search-function.sql
```

### Using Supabase CLI
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations (if using Supabase migrations)
supabase db push

# Or run individual files
supabase db execute -f sql/schema/01_complete_schema_part1.sql
```

---

**Status**: Production Ready
**Last Updated**: 2025-11-16
**Version**: 1.0.0
