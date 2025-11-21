# VITAL Path - Final Project Structure

**Date**: 2025-11-16
**Status**: Cleanup Complete

This document describes the final, clean project structure after comprehensive reorganization.

---

## Directory Overview

```
VITAL path/
├── apps/                          # Application implementations
│   ├── digital-health-startup/   # Main application
│   ├── ask-panel/                # Ask panel component
│   ├── consulting/               # Consulting vertical
│   ├── marketing/                # Marketing vertical
│   ├── payers/                   # Payers vertical
│   └── pharma/                   # Pharma vertical
│
├── sql/                           # PRIMARY database directory
│   ├── migrations/               # Database migrations
│   ├── schemas/                  # Schema definitions
│   └── seeds/                    # Seed data (organized)
│       ├── 00_PREPARATION/      # Pre-setup scripts
│       ├── 01_foundation/       # Foundation data
│       ├── 02_organization/     # Organization data
│       ├── 03_content/          # Content seeds
│       ├── 04_operational/      # Operational data
│       │   └── tools/           # Tool seeds (10 files)
│       ├── 05_use_cases/        # Use case seeds (15 files)
│       ├── 06_workflows/        # Workflow seeds (3 files)
│       └── TEMPLATES/           # Protected seed templates
│
├── scripts/                       # Organized operational scripts
│   ├── database/                 # Database operations
│   │   ├── setup/               # Schema & RLS setup (18 files)
│   │   ├── migrations/          # Migration execution (24 files)
│   │   └── maintenance/         # DB maintenance (8 files)
│   ├── data-import/              # Data loading
│   │   ├── agents/              # Agent imports (21 files)
│   │   ├── organizations/       # Org imports (8 files)
│   │   ├── knowledge/           # Knowledge imports (6 files)
│   │   └── [general]/           # Generic imports (28 files)
│   ├── deployment/               # Deployment scripts (6 files)
│   ├── validation/               # Testing & verification (75 files)
│   ├── utilities/                # General utilities (194 files)
│   ├── archive/                  # Archived scripts
│   └── _archive/                 # Older archived scripts
│
├── data/                          # Temporary processing output
│   └── models/                   # Model configurations
│
├── database/                      # LEGACY - being phased out
│   ├── migrations/               # Legacy migrations
│   │   └── seeds/               # MIGRATED to /sql/seeds/
│   ├── seeds/data/              # JSON templates (kept)
│   └── GOLD_STANDARD_SCHEMA.md  # Reference doc
│
├── archive/                       # Archived content
│   ├── data_processing_output_20251116/  # Timestamped data (23 files)
│   └── [other archives]/
│
├── adhoc_sql_ARCHIVED_20251116/   # Archived ad-hoc SQL
├── migration_scripts_ARCHIVED_20251116/  # Archived migration scripts
│
├── docs/                          # Project documentation
├── packages/                      # Shared packages
├── tests/                         # Test suites
├── knowledge/                     # Knowledge base
├── supabase/                      # Supabase configuration
├── services/                      # Backend services
├── infrastructure/                # Infrastructure as code
└── monitoring/                    # Monitoring configs
```

---

## Key Directories Explained

### `/sql/` - PRIMARY Database Directory

**Purpose**: Central location for ALL database schemas, migrations, and seed data.

**Subdirectories**:
- `migrations/` - Database migrations (versioned schema changes)
- `schemas/` - Schema definitions
- `seeds/` - Seed data organized by phase and purpose

**Status**: Active, primary development location

**When to use**: All new database work should use this directory.

---

### `/sql/seeds/` - Organized Seed Data

**Structure**:
```
seeds/
├── 00_PREPARATION/      # Pre-setup verification and utilities
├── 01_foundation/       # Core tables (tenants, users, etc.)
├── 02_organization/     # Organizational data (roles, functions)
├── 03_content/          # Content and knowledge domains
├── 04_operational/      # Operational data
│   └── tools/          # AI tool definitions (10 files)
├── 05_use_cases/        # Complete use case implementations (15 files)
├── 06_workflows/        # Workflow definitions (3 files)
└── TEMPLATES/           # Protected seed templates
```

**Execution Order**: Run in numerical order (00 → 06)

**Recently Migrated** (2025-11-16):
- Tool seeds from `/database/migrations/seeds/tools/` → `04_operational/tools/`
- Use case seeds → `05_use_cases/`
- Workflow seeds → `06_workflows/`

---

### `/scripts/` - Organized Operational Scripts

**Purpose**: All project-wide operational scripts, now organized by function.

**Structure**:
```
scripts/
├── database/           # Database operations (50 files)
├── data-import/        # Data loading (63 files)
├── deployment/         # Deployment automation (6 files)
├── validation/         # Testing & verification (75 files)
├── utilities/          # General utilities (194 files)
└── archive/            # Archived scripts
```

**Total Organized**: 388 script files

**Organization Date**: 2025-11-16

**When to use**:
- Use categorized subdirectories for new scripts
- Reference README in each category for guidance

---

### `/apps/` - Application Implementations

**Purpose**: Individual application implementations in monorepo structure.

**Primary App**: `digital-health-startup/` - Main VITAL Path application

**App-Specific Resources**:
- Each app has its own `database/migrations/` for app-specific migrations
- Each app has its own `scripts/` for app-specific utilities
- Apps share core schema from `/sql/`

**No Duplication**: App-specific files complement, not duplicate, root resources.

---

### `/data/` - Temporary Processing Output

**Purpose**: Temporary files from data processing scripts.

**Contents**: Timestamped output files (format: `*_YYYYMMDD_HHMMSS.*`)

**Maintenance**:
- Files archived regularly (30-day retention)
- Latest: 23 files archived to `/archive/data_processing_output_20251116/`

**gitignored**: Yes, timestamped files are excluded from git

---

### `/database/` - LEGACY

**Status**: LEGACY - Being phased out

**Still Active**:
- `seeds/data/` - JSON templates (referenced by import scripts)
- `GOLD_STANDARD_SCHEMA.md` - Reference documentation

**Migrated**:
- SQL seed files → `/sql/seeds/`

**When to use**: Only for JSON templates and reference docs

---

### Archived Directories

**Format**: `directory_ARCHIVED_YYYYMMDD/`

**Archived on 2025-11-16**:
- `adhoc_sql_ARCHIVED_20251116/` - Old ad-hoc SQL files
- `migration_scripts_ARCHIVED_20251116/` - Old migration scripts
- `archive/data_processing_output_20251116/` - Timestamped data files

**Purpose**: Preserve history while cleaning active workspace

---

## File Naming Conventions

### SQL Seeds
- `NN_descriptive_name.sql` - Numbered for execution order
- `UPPERCASE_NAME.sql` - Special files (templates, frameworks)

### Scripts
- `kebab-case.js` - JavaScript files
- `kebab-case.ts` - TypeScript files
- `snake_case.py` - Python files
- `kebab-case.sh` - Shell scripts

### Timestamped Files
- Format: `purpose_YYYYMMDD_HHMMSS.ext`
- Example: `import_report_20251116_143022.txt`
- Auto-archived after 30 days

---

## Migration Guide

### Old Location → New Location

| Old Path | New Path | Status |
|----------|----------|--------|
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | ✅ Migrated |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | ✅ Migrated |
| `/database/migrations/seeds/workflows/` | `/sql/seeds/06_workflows/` | ✅ Migrated |
| `/scripts/[loose files]` | `/scripts/[categorized]/` | ✅ Organized |
| `/data/[timestamped files]` | `/archive/data_processing_output_*/` | ✅ Archived |

See `/sql/seeds/SEED_MIGRATION_MAP.md` for complete seed migration details.

---

## Maintenance Guidelines

### Daily Operations
- Run scripts from organized `/scripts/` directories
- Use `/sql/` for all database work
- Temporary files go to `/data/` (auto-archived)

### Weekly Maintenance
- Review `/data/` for old timestamped files
- Archive files older than 30 days
- Update relevant READMEs

### Monthly Cleanup
- Review `/scripts/archive/` for obsolete scripts
- Consolidate archived directories
- Update documentation

---

## Related Documentation

- `/sql/seeds/SEED_MIGRATION_MAP.md` - Detailed seed migration mapping
- `/sql/seeds/README.md` - Seed data documentation
- `/scripts/README.md` - Scripts organization guide
- `/apps/README.md` - Application structure guide
- `/database/README.md` - Legacy database directory status
- `/data/README.md` - Data directory usage guide
- `CLEANUP_COMPLETE_REPORT.md` - Cleanup summary report

---

## Quick Reference

### For New Developers

**Database Work**:
1. Use `/sql/` for schemas and migrations
2. Use `/sql/seeds/` for seed data
3. Ignore `/database/` (legacy)

**Running Scripts**:
1. Check `/scripts/README.md` for category
2. Run from appropriate category directory
3. Document app-specific scripts in app

**Data Processing**:
1. Output to `/data/` with timestamps
2. Files auto-archived after 30 days
3. Check archives if looking for old output

### For System Admins

**Backup Strategy**:
- `/sql/` - Critical, must backup
- `/scripts/` - Important, backup recommended
- `/data/` - Temporary, no backup needed
- `/archive/` - Optional, long-term storage

**Cleanup Tasks**:
- Monthly: Archive old `/data/` files
- Quarterly: Review `/scripts/archive/`
- Annually: Consolidate year-old archives

---

**Last Updated**: 2025-11-16
**Maintained By**: Project Team
**Next Review**: 2025-12-16
