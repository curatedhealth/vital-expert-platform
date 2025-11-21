# Migration Directories - Complete Guide

**Last Updated**: November 13, 2025

This document explains ALL migration-related directories in the VITAL project and what they're used for.

---

## Quick Reference

| Directory | Purpose | Should Use? |
|-----------|---------|-------------|
| **[migration_scripts/](#migration_scripts)** | 🎯 **PRIMARY** - Python data migration scripts | ✅ **YES - USE THIS** |
| **[supabase/migrations/](#supabasemigrations)** | 🎯 **PRIMARY** - Supabase SQL schema migrations | ✅ **YES - USE THIS** |
| [scripts/archive_old_migrations/](#scriptsarchive_old_migrations) | Archived old JS/TS migration scripts | ❌ Archive only |
| [archive/migrations/](#archivemigrations) | Old archived migrations | ❌ Archive only |
| [database/migrations/](#databasemigrations) | Legacy database migrations | ❌ Check before deleting |
| [database/sql/migrations/](#databasesqlmigrations) | Legacy SQL migrations | ❌ Check before deleting |
| [docs/migrations/](#docsmigrations) | Migration documentation | ℹ️ Reference only |
| [docs/migration-logs/](#docsmigration-logs) | Migration execution logs | ℹ️ Logs only |
| [apps/.../migrations/](#app-specific-migrations) | App-specific migrations | ✅ Keep for app |

---

## Detailed Breakdown

### <a name="migration_scripts"></a>migration_scripts/ 🎯 **PRIMARY DATA MIGRATIONS**

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/migration_scripts/`

**Purpose**: **Main directory for Python-based data migration scripts** to migrate data from old VITAL database to new VITAL-expert database.

**Structure**:
```
migration_scripts/
├── 00_ACTIVE/           → Active migration scripts (run these)
│   ├── phase1/          → Phase 1: Personas migration
│   ├── phase2/          → Phase 2: Agents migration
│   ├── phase3/          → Phase 3: Prompts migration
│   ├── phase1_migrate_foundation.py
│   ├── phase3_migrate_personas_jtbd.py
│   └── migrate_*.py
├── 01_COMPLETED/        → Completed migrations (move here after success)
├── 02_UTILITIES/        → Helper scripts, base classes, tests
│   ├── base_migrator.py
│   ├── test_connection.py
│   └── generate_all_migrations.py
├── 03_ANALYSIS/         → Analysis and diagnostic scripts
│   ├── analyze_*.py
│   ├── diagnose_*.py
│   └── discover_schemas.py
├── 04_DATA_IMPORTS/     → One-time data imports
│   ├── import_*.py
│   ├── map_*.py
│   └── migration_*.py (phase execution scripts)
├── 05_VALIDATION/       → Validation scripts
│   └── verify_*.py
├── docs/                → Documentation and reports
│   ├── README.md (moved from root migration_analysis/)
│   ├── OLDDB.json
│   └── NEWDB.json
├── archive/             → Archived old scripts
│   ├── jtbd_migration/
│   ├── old_migration_utils/
│   └── new_db_setup/
├── README.md            → Main documentation
├── QUICK_START.md       → Quick reference
└── CLEANUP_SUMMARY.md   → Cleanup report
```

**When to Use**:
- ✅ Migrating data between databases (ETL operations)
- ✅ Running Python-based migration scripts
- ✅ Analyzing data before/after migration
- ✅ Validating migration results

**Example**:
```bash
cd migration_scripts/00_ACTIVE
python3 phase3_migrate_personas_jtbd.py --dry-run
```

---

### <a name="supabasemigrations"></a>supabase/migrations/ 🎯 **PRIMARY SCHEMA MIGRATIONS**

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/supabase/migrations/`

**Purpose**: **Supabase schema migrations** - SQL files that define and evolve the database schema. These are managed by Supabase CLI and run automatically on deployment.

**Structure**:
```
supabase/migrations/
├── archive/
│   └── (old migrations)
├── completed/
│   └── (completed migrations)
├── supabase/
│   └── (supabase-specific)
├── utilities/
│   └── (utility migrations)
├── 20240103000001_chat_and_knowledge_schema.sql
├── 20241008000001_complete_vital_schema.sql
├── 20251003_create_advisory_board_tables.sql
├── 20251108_create_comprehensive_persona_jtbd_schema.sql
├── 20251110_create_persona_sp_jtbd_mappings.sql
└── ... (70+ migration files)
```

**Naming Convention**: `YYYYMMDD[HHMMSS]_description.sql`

**When to Use**:
- ✅ Creating/modifying database tables
- ✅ Adding/removing columns
- ✅ Creating indexes, constraints, functions
- ✅ RLS (Row Level Security) policies
- ✅ Database triggers and procedures

**Managed By**: Supabase CLI (`supabase db push`, `supabase migration new`)

**DO NOT**:
- ❌ Manually edit migration files after they've been applied
- ❌ Delete migration files
- ❌ Change the order of migrations

---

### <a name="scriptsarchive_old_migrations"></a>scripts/archive_old_migrations/

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/archive_old_migrations/`

**Purpose**: Archived JavaScript/TypeScript migration scripts that were used in older versions of the project.

**When to Use**:
- ❌ Archive only - **DO NOT USE**
- ℹ️ Reference only if you need to understand old migrations

**Contains**: ~53 old JS/TS migration files (apply-*.js, create-*.js, etc.)

---

### <a name="archivemigrations"></a>archive/migrations/

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/archive/migrations/`

**Purpose**: Very old archived migrations from previous project versions.

**When to Use**:
- ❌ Archive only - **DO NOT USE**
- ℹ️ Historical reference only

---

### <a name="databasemigrations"></a>database/migrations/

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/database/migrations/`

**Purpose**: Legacy database migrations (might be from an older ORM or migration system).

**Status**: ⚠️ **CHECK BEFORE DELETING** - May contain historical migrations that were applied

**Action**:
1. Check if any migrations here are not in `supabase/migrations/`
2. If all are duplicated in Supabase, can be archived
3. Otherwise, keep for reference

---

### <a name="databasesqlmigrations"></a>database/sql/migrations/

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/migrations/`

**Purpose**: Legacy SQL migrations organized by year.

**Structure**:
```
database/sql/migrations/
├── 2025/
│   ├── 20250201000001_migrate_all_rag_domains.sql
│   ├── 20250923001000_comprehensive_healthcare_agents_migration.sql
│   └── ...
└── fixes/
    ├── apply-fix-migration.sql
    └── apply-rag-migration.sql
```

**Status**: ⚠️ **CHECK BEFORE DELETING** - May contain important migrations

**Action**:
1. Compare with `supabase/migrations/`
2. If duplicates, can be archived
3. If unique, consider moving to `supabase/migrations/` or documenting

---

### <a name="docsmigrations"></a>docs/migrations/

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/docs/migrations/`

**Purpose**: Migration-related documentation, plans, and guides.

**When to Use**:
- ℹ️ Read migration documentation
- ℹ️ Understand migration history
- ℹ️ Reference migration plans

**Keep**: ✅ YES - useful documentation

---

### <a name="docsmigration-logs"></a>docs/migration-logs/

**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/docs/migration-logs/`

**Purpose**: Logs from migration executions.

**When to Use**:
- ℹ️ Review past migration results
- ℹ️ Debug issues
- ℹ️ Audit trail

**Maintenance**: Clean up logs older than 90 days

---

### <a name="app-specific-migrations"></a>App-Specific Migration Directories

These are migrations specific to individual apps/services:

#### apps/digital-health-startup/database/migrations/
- App-level database migrations for the digital health app
- **Keep**: ✅ YES - needed by the app

#### apps/digital-health-startup/supabase/migrations/
- Supabase migrations specific to the app
- **Keep**: ✅ YES - needed by the app

#### apps/digital-health-startup/src/app/api/migrations/
- API endpoints for running migrations
- **Keep**: ✅ YES - needed by the app

#### apps/digital-health-startup/src/app/api/admin/apply-healthcare-migration/
- Admin endpoint for applying healthcare-specific migrations
- **Keep**: ✅ YES - needed by the app

---

## Summary: What to Use

### For Data Migrations (ETL - Extract, Transform, Load)
**USE**: [migration_scripts/](#migration_scripts)

```bash
cd migration_scripts/00_ACTIVE
python3 phase3_migrate_personas_jtbd.py --dry-run
python3 phase3_migrate_personas_jtbd.py
```

### For Schema Changes (Tables, Columns, Indexes)
**USE**: [supabase/migrations/](#supabasemigrations)

```bash
# Create new migration
supabase migration new add_new_column

# Edit the generated SQL file
vim supabase/migrations/20251113_add_new_column.sql

# Apply migration
supabase db push
```

### For Reference/Documentation
**USE**: [docs/migrations/](#docsmigrations)

### Everything Else
**IGNORE**: Archive directories (reference only, do not modify)

---

## Recommended Actions

### ✅ Keep These (Active Use)
1. `migration_scripts/` - Main data migration directory
2. `supabase/migrations/` - Active schema migrations
3. `apps/*/migrations/` - App-specific migrations
4. `docs/migrations/` - Documentation

### ⚠️ Review & Decide
1. `database/migrations/` - Check for unique migrations, then archive
2. `database/sql/migrations/` - Check for unique migrations, then archive

### 📦 Already Archived (No Action Needed)
1. `scripts/archive_old_migrations/`
2. `archive/migrations/`
3. `migration_scripts/archive/`

---

## Common Workflows

### Running a Data Migration
```bash
# 1. Test connection
cd migration_scripts/02_UTILITIES
python3 test_connection.py

# 2. Analyze before migration
cd ../03_ANALYSIS
python3 analyze_personas_transformation.py

# 3. Run migration (dry run)
cd ../00_ACTIVE
python3 phase3_migrate_personas_jtbd.py --dry-run

# 4. Run migration (live)
python3 phase3_migrate_personas_jtbd.py

# 5. Validate results
cd ../05_VALIDATION
python3 verify_final_mapping_coverage.py

# 6. Move to completed
mv ../00_ACTIVE/phase3_migrate_personas_jtbd.py ../01_COMPLETED/
```

### Creating a Schema Migration
```bash
# 1. Create new migration
cd supabase
supabase migration new add_user_preferences_table

# 2. Edit the SQL file
vim migrations/20251113120000_add_user_preferences_table.sql

# 3. Test locally
supabase db reset

# 4. Push to remote
supabase db push
```

---

## Migration Directory Decision Tree

```
Need to migrate data between databases?
├─ YES → Use migration_scripts/
└─ NO
   ├─ Need to change database schema?
   │  ├─ YES → Use supabase/migrations/
   │  └─ NO
   │     ├─ Looking for documentation?
   │     │  ├─ YES → Use docs/migrations/
   │     │  └─ NO → Check app-specific migrations
```

---

## Questions & Answers

**Q: Which directory do I use for migrating persona data from old DB to new DB?**
A: `migration_scripts/00_ACTIVE/` - specifically `phase3_migrate_personas_jtbd.py`

**Q: I need to add a new column to the agents table. Which directory?**
A: `supabase/migrations/` - create a new migration with `supabase migration new`

**Q: Where can I find logs from previous migrations?**
A: `docs/migration-logs/` and also `migration_scripts/` has `migration_*.log` files

**Q: I found a migration file in multiple places. Which one should I use?**
A:
- For data migrations: Use `migration_scripts/`
- For schema migrations: Use `supabase/migrations/`
- Others are likely archives or duplicates

**Q: Can I delete the `database/migrations/` directory?**
A: ⚠️ Not yet - first compare with `supabase/migrations/` to ensure nothing unique is lost

**Q: What about the phase1/, phase2/, phase3/ directories in scripts/?**
A: ✅ Already moved to `migration_scripts/00_ACTIVE/`

---

## File Count Summary

| Directory | File/Subdirectory Count | Status |
|-----------|------------------------|--------|
| migration_scripts/ | ~96 files, 8 subdirs | ✅ Organized |
| supabase/migrations/ | ~73 migration files | ✅ Active |
| scripts/archive_old_migrations/ | ~53 files | 📦 Archived |
| database/migrations/ | TBD | ⚠️ Review needed |
| database/sql/migrations/ | ~15 files | ⚠️ Review needed |
| docs/migrations/ | Documentation | ✅ Keep |
| archive/migrations/ | Old files | 📦 Archived |

---

## Maintenance Schedule

### Weekly
- Review `docs/migration-logs/` for errors
- Check migration_scripts/00_ACTIVE/ for completed migrations to move to 01_COMPLETED/

### Monthly
- Clean up logs older than 30 days in migration_scripts/
- Review and archive completed migrations

### Quarterly
- Review `database/migrations/` and `database/sql/migrations/` for cleanup
- Update this documentation

---

## Need Help?

**Documentation**:
- Main guide: [migration_scripts/README.md](./migration_scripts/README.md)
- Quick start: [migration_scripts/QUICK_START.md](./migration_scripts/QUICK_START.md)
- Supabase docs: https://supabase.com/docs/guides/cli/managing-migrations

**Issues**:
- Data migration issues → Check `migration_scripts/` logs
- Schema migration issues → Check `supabase migration list`
- General questions → Review this document

---

**Document Version**: 2.0
**Last Updated**: November 13, 2025
**Status**: Complete consolidation of all migration directories
