# VITAL Migration Structure - Final Organization

**Date**: November 13, 2025
**Status**: ✅ Fully Consolidated and Organized

---

## Visual Structure

```
VITAL/
│
├── 🎯 migration_scripts/          ← MAIN DATA MIGRATION DIRECTORY
│   ├── 00_ACTIVE/                 ← Run migrations from here
│   │   ├── phase1/                → Phase 1: Personas (13 files)
│   │   │   ├── 01_create_personas_FINAL.sql
│   │   │   ├── 02_migrate_personas_data.py
│   │   │   ├── 03_validate_persona_migration.py
│   │   │   ├── 04_create_industry_mappings.py
│   │   │   └── README.md
│   │   ├── phase2/                → Phase 2: Agents (15 files)
│   │   │   ├── 01_create_agents_FIXED.sql
│   │   │   ├── 02_migrate_agents_data.py
│   │   │   ├── 03_validate_agent_migration.py
│   │   │   ├── 04_create_agent_industry_mappings.py
│   │   │   └── README.md
│   │   ├── phase3/                → Phase 3: Prompts (9 files)
│   │   │   ├── 01_enhance_prompts_schema.sql
│   │   │   ├── 02_migrate_dh_prompts.py
│   │   │   ├── 03_create_prompt_industry_mappings.py
│   │   │   ├── 04_create_prompt_task_mappings.py
│   │   │   └── README.md
│   │   ├── phase1_migrate_foundation.py
│   │   ├── phase3_migrate_personas_jtbd.py
│   │   ├── migrate_personas_clean.py
│   │   ├── migrate_jtbds_from_library.py
│   │   └── migrate_strategic_priorities.py
│   │
│   ├── 01_COMPLETED/              ← Move completed migrations here
│   │
│   ├── 02_UTILITIES/              ← Helper scripts (11 files)
│   │   ├── base_migrator.py       → Core migration framework
│   │   ├── base_migrator_api.py   → API-based utilities
│   │   ├── test_connection.py     → Test DB connections
│   │   ├── test_*.py              → Various test scripts
│   │   ├── generate_all_migrations.py
│   │   └── create-phase1-files.sh
│   │
│   ├── 03_ANALYSIS/               ← Analysis tools (28 files)
│   │   ├── analyze_*.py           → Data analysis scripts
│   │   ├── diagnose_*.py          → Diagnostic tools
│   │   ├── check_*.py             → Validation checks
│   │   ├── discover_*.py          → Schema discovery
│   │   ├── inspect_*.py           → Data inspection
│   │   ├── discover_schemas.py    → From migration_analysis/
│   │   └── *.json                 → Schema exports
│   │
│   ├── 04_DATA_IMPORTS/           ← Data import scripts (45+ files)
│   │   ├── import_*.py            → Import from external sources
│   │   ├── add_*.py               → Add missing data
│   │   ├── create_*.py            → Create new entities
│   │   ├── map_*.py               → Create mappings
│   │   ├── link_*.py              → Link entities
│   │   ├── apply_*.py             → Apply transformations
│   │   ├── update_*.py            → Update existing data
│   │   ├── migration_*.py         → Phase execution scripts
│   │   └── execute_*.py           → Execution helpers
│   │
│   ├── 05_VALIDATION/             ← Validation scripts (2 files)
│   │   ├── verify_excellence_focus_coverage.py
│   │   └── verify_final_mapping_coverage.py
│   │
│   ├── docs/                      ← Documentation (20 files)
│   │   ├── OLDDB.json             → Old database export
│   │   ├── NEWDB.json             → New database export
│   │   ├── APPLY_MIGRATIONS_GUIDE.md
│   │   ├── MIGRATION_STATUS_AND_NEXT_STEPS.md
│   │   ├── *_SUCCESS.md           → Success reports
│   │   └── *.md                   → Various guides
│   │
│   ├── archive/                   ← Archived old scripts
│   │   ├── jtbd_migration/        → Old JTBD attempts
│   │   ├── new_db_setup/          → Old setup scripts
│   │   └── old_migration_utils/   → From scripts/migration/
│   │
│   ├── README.md                  → Main documentation (400+ lines)
│   ├── QUICK_START.md             → Quick reference guide
│   └── CLEANUP_SUMMARY.md         → Cleanup report
│
├── 🎯 supabase/migrations/        ← MAIN SCHEMA MIGRATION DIRECTORY
│   ├── archive/                   → Archived migrations
│   ├── completed/                 → Completed migrations
│   ├── supabase/                  → Supabase-specific
│   ├── utilities/                 → Utility migrations
│   ├── 20240103000001_chat_and_knowledge_schema.sql
│   ├── 20241008000001_complete_vital_schema.sql
│   ├── 20251003_create_advisory_board_tables.sql
│   ├── 20251108_create_comprehensive_persona_jtbd_schema.sql
│   ├── 20251110_create_persona_sp_jtbd_mappings.sql
│   └── ... (73 total migration files)
│
├── scripts/                       ← General utility scripts
│   ├── archive_old_migrations/    → Archived JS/TS migrations (53 files)
│   ├── database/                  → Database utilities
│   ├── deployment/                → Deployment scripts
│   ├── knowledge/                 → Knowledge base scripts
│   ├── testing/                   → Test scripts
│   ├── tools/                     → Tool utilities
│   └── ... (other non-migration scripts)
│
├── docs/                          ← Project documentation
│   ├── migrations/                → Migration documentation
│   ├── migration-logs/            → Migration execution logs
│   └── archive/
│       └── migration-reports/     → Historical reports
│
├── archive/                       ← Project archives
│   └── migrations/                → Very old migrations (archived)
│
├── database/                      ← Legacy database files
│   ├── migrations/                → ⚠️ Review before deleting
│   └── sql/
│       └── migrations/            → ⚠️ Review before deleting
│           ├── 2025/              → Recent migrations
│           └── fixes/             → Migration fixes
│
├── apps/digital-health-startup/   ← App-specific
│   ├── database/migrations/       → App DB migrations
│   ├── supabase/migrations/       → App Supabase migrations
│   └── src/app/api/
│       ├── migrations/            → API migration endpoints
│       └── admin/
│           └── apply-healthcare-migration/  → Admin endpoint
│
├── MIGRATION_DIRECTORIES_EXPLAINED.md  → Complete guide (this + details)
├── MIGRATION_CLEANUP_COMPLETE.md       → Cleanup summary
└── MIGRATION_STRUCTURE_FINAL.md        → This file
```

---

## File Count Summary

| Directory | Files/Subdirs | Purpose |
|-----------|---------------|---------|
| **migration_scripts/** | **~110 files total** | **Main data migrations** |
| ├─ 00_ACTIVE/ | 5 scripts + 3 phase dirs | Active migrations |
| │  ├─ phase1/ | 13 files | Persona migration |
| │  ├─ phase2/ | 15 files | Agent migration |
| │  └─ phase3/ | 9 files | Prompt migration |
| ├─ 02_UTILITIES/ | 11 files | Helpers and tests |
| ├─ 03_ANALYSIS/ | 28 files | Analysis tools |
| ├─ 04_DATA_IMPORTS/ | 45+ files | Data imports |
| ├─ 05_VALIDATION/ | 2 files | Validation |
| └─ docs/ | 20 files | Documentation |
| **supabase/migrations/** | **73 .sql files** | **Schema migrations** |
| **scripts/archive_old_migrations/** | 53 files | Archived old migrations |

**Total Migration Files Organized**: ~250+ files

---

## Usage Guide

### For Data Migration (Python/ETL)

```bash
# Navigate to active migrations
cd migration_scripts/00_ACTIVE

# For phase-based migrations:
cd phase1
python3 02_migrate_personas_data.py --dry-run

# For standalone migrations:
python3 phase3_migrate_personas_jtbd.py --dry-run
python3 phase3_migrate_personas_jtbd.py  # Live run

# Test connection first:
cd ../02_UTILITIES
python3 test_connection.py

# Analyze before migrating:
cd ../03_ANALYSIS
python3 analyze_personas_transformation.py

# Validate after migrating:
cd ../05_VALIDATION
python3 verify_final_mapping_coverage.py
```

### For Schema Migration (SQL)

```bash
# Navigate to Supabase directory
cd supabase

# Create new migration
supabase migration new add_user_preferences

# Edit the generated file
vim migrations/20251113120000_add_user_preferences.sql

# Test locally
supabase db reset

# Apply to remote
supabase db push
```

---

## Migration Phases

### Phase 1: Personas
**Location**: `migration_scripts/00_ACTIVE/phase1/`
**Files**: 13 files including migration, validation, and rollback scripts
**Purpose**: Migrate persona data from old DB to new DB

### Phase 2: Agents
**Location**: `migration_scripts/00_ACTIVE/phase2/`
**Files**: 15 files including agent migration and mapping creation
**Purpose**: Migrate AI agent data and create agent-persona mappings

### Phase 3: Prompts
**Location**: `migration_scripts/00_ACTIVE/phase3/`
**Files**: 9 files including prompt migration and task mappings
**Purpose**: Migrate prompt templates and create industry/task mappings

### Standalone Migrations
**Location**: `migration_scripts/00_ACTIVE/*.py`
**Files**: 5 comprehensive migration scripts
**Purpose**: Alternative approach to phased migrations

---

## Key Differences

| Aspect | migration_scripts/ | supabase/migrations/ |
|--------|-------------------|----------------------|
| **Purpose** | Data migration (ETL) | Schema migration (DDL) |
| **Language** | Python | SQL |
| **What it does** | Migrates data between DBs | Creates/modifies DB structure |
| **Examples** | Migrate personas, import JTBDs | Create tables, add columns |
| **Run by** | Manual execution | Supabase CLI |
| **Dry run** | Yes (--dry-run flag) | Yes (local reset) |
| **Rollback** | Custom scripts | Supabase handles it |

---

## Decision Tree: Which Directory?

```
What are you trying to do?
│
├─ Migrate data between databases?
│  └─ Use: migration_scripts/00_ACTIVE/
│     Example: python3 phase3_migrate_personas_jtbd.py
│
├─ Create/modify database tables, columns, indexes?
│  └─ Use: supabase/migrations/
│     Example: supabase migration new my_change
│
├─ Analyze data before migration?
│  └─ Use: migration_scripts/03_ANALYSIS/
│     Example: python3 analyze_personas_transformation.py
│
├─ Import data from external sources?
│  └─ Use: migration_scripts/04_DATA_IMPORTS/
│     Example: python3 import_jtbds_from_json.py
│
├─ Validate migration results?
│  └─ Use: migration_scripts/05_VALIDATION/
│     Example: python3 verify_final_mapping_coverage.py
│
└─ Looking for documentation?
   └─ Check: migration_scripts/docs/ or MIGRATION_DIRECTORIES_EXPLAINED.md
```

---

## What Was Consolidated

### Before (Scattered)
```
❌ migration_scripts/         (98 files, disorganized)
❌ scripts/phase1/             (13 files, wrong location)
❌ scripts/phase2/             (15 files, wrong location)
❌ scripts/phase3/             (9 files, wrong location)
❌ scripts/migration/          (5 files, duplicates)
❌ scripts/migrations/         (empty directory)
❌ scripts/migration_*.py      (scattered files)
❌ migration_analysis/         (separate directory)
❌ database/migrations/        (legacy, unchecked)
❌ database/sql/migrations/    (legacy, unchecked)
```

### After (Organized)
```
✅ migration_scripts/          (all Python data migrations)
   ├── 00_ACTIVE/             (active migrations + phase1,2,3)
   ├── 02_UTILITIES/          (helpers + tests)
   ├── 03_ANALYSIS/           (analysis + former migration_analysis/)
   ├── 04_DATA_IMPORTS/       (data imports + migration_*.py)
   ├── 05_VALIDATION/         (validation scripts)
   └── archive/               (old scripts archived)

✅ supabase/migrations/        (all SQL schema migrations)
   └── *.sql                  (73 migration files)

✅ scripts/                    (clean, migration-free)
   └── archive_old_migrations/ (old JS/TS archived)
```

---

## Maintenance

### After Each Migration
- [ ] Move completed script from `00_ACTIVE/` to `01_COMPLETED/`
- [ ] Update phase status in README.md
- [ ] Document any issues or learnings

### Weekly
- [ ] Review migration logs for errors
- [ ] Check for completed phase migrations to archive

### Monthly
- [ ] Clean up old log files (>30 days)
- [ ] Review `04_DATA_IMPORTS/` for one-time scripts to archive
- [ ] Update documentation

### Quarterly
- [ ] Review `database/migrations/` for deletion/archival
- [ ] Review `database/sql/migrations/` for deletion/archival
- [ ] Clean up `docs/migration-logs/` (>90 days)

---

## Documentation Files

1. **[MIGRATION_DIRECTORIES_EXPLAINED.md](./MIGRATION_DIRECTORIES_EXPLAINED.md)**
   - Complete guide to ALL migration directories
   - What each directory is for
   - When to use each one
   - Decision trees and workflows

2. **[migration_scripts/README.md](./migration_scripts/README.md)**
   - Detailed guide to migration_scripts structure
   - How to run migrations
   - Troubleshooting
   - Safety features

3. **[migration_scripts/QUICK_START.md](./migration_scripts/QUICK_START.md)**
   - Quick reference for common tasks
   - 5-minute setup
   - Command cheat sheet

4. **[MIGRATION_CLEANUP_COMPLETE.md](./MIGRATION_CLEANUP_COMPLETE.md)**
   - High-level cleanup summary
   - Before/after comparison
   - Next steps

5. **[MIGRATION_STRUCTURE_FINAL.md](./MIGRATION_STRUCTURE_FINAL.md)** (this file)
   - Visual structure diagram
   - Complete file organization
   - Usage guide

---

## Quick Reference Commands

```bash
# Data Migration
cd migration_scripts/00_ACTIVE
python3 phase3_migrate_personas_jtbd.py --dry-run

# Schema Migration
cd supabase
supabase migration new my_migration

# Test Connection
cd migration_scripts/02_UTILITIES
python3 test_connection.py

# Analyze Data
cd migration_scripts/03_ANALYSIS
python3 analyze_personas_transformation.py

# Validate Results
cd migration_scripts/05_VALIDATION
python3 verify_final_mapping_coverage.py

# View Documentation
cat MIGRATION_DIRECTORIES_EXPLAINED.md
cat migration_scripts/README.md
cat migration_scripts/QUICK_START.md
```

---

## Status

✅ **COMPLETE** - All migration files consolidated and organized
✅ **DOCUMENTED** - Comprehensive documentation created
✅ **READY** - Ready for use

**Last Updated**: November 13, 2025
**Total Files Organized**: ~250+ files
**Directories Created**: 8 organized categories
**Documentation Created**: 5 comprehensive guides

---

**Need Help?** Read [MIGRATION_DIRECTORIES_EXPLAINED.md](./MIGRATION_DIRECTORIES_EXPLAINED.md) for complete guidance.
