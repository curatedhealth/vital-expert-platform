# Documentation Organization Plan

## Current State Analysis
- **351 files** in `10-data-schema/` (many outdated SQL scripts)
- **Root level clutter** with many loose SQL and MD files
- **Duplicate/obsolete** implementation status files
- **Missing structure** for gold standard templates and seeds

## Target Structure

```
.vital-docs/
├── 00-overview/                    ← Keep as is
├── 01-strategy/                    ← Keep as is
├── 02-brand-identity/              ← Keep as is
├── 03-product/                     ← Keep as is
├── 04-services/                    ← Keep as is
├── 05-architecture/                ← Keep as is
├── 06-workflows/                   ← Keep as is
├── 07-implementation/              ← Keep as is
├── 08-agents/                      ← Keep as is
├── 09-api/                         ← Keep as is
├── 10-data-schema/                 ← REORGANIZE
│   ├── 01-core-schema/            ← NEW: Core tables DDL
│   │   ├── evidence-system.sql
│   │   ├── reference-catalogs.sql
│   │   ├── org-roles-enhanced.sql
│   │   └── README.md
│   ├── 02-role-junctions/         ← NEW: Role baseline junctions
│   │   ├── role-junctions-all.sql
│   │   └── README.md
│   ├── 03-persona-junctions/      ← NEW: Persona delta junctions
│   │   ├── persona-junctions-all.sql
│   │   └── README.md
│   ├── 04-views/                  ← NEW: Effective views
│   │   ├── effective-views-all.sql
│   │   └── README.md
│   ├── 05-seeds/                  ← NEW: Seed data templates
│   │   ├── tenants/
│   │   ├── functions/
│   │   ├── departments/
│   │   ├── roles/
│   │   └── personas/
│   ├── 06-migrations/             ← NEW: Version-controlled migrations
│   │   └── README.md
│   ├── 07-utilities/              ← NEW: Helper scripts
│   │   ├── verification/
│   │   ├── cleanup/
│   │   └── diagnostics/
│   ├── GOLD_STANDARD_SCHEMA.md    ← Master schema doc
│   ├── NAMING_CONVENTIONS.md
│   └── INHERITANCE_PATTERN.md
├── 11-testing/                     ← Keep as is
├── 12-operations/                  ← Keep as is
├── 13-compliance/                  ← Keep as is
├── 14-training/                    ← Keep as is
├── 15-releases/                    ← Keep as is
└── _archive/                       ← NEW: Obsolete files
    └── old-implementations/
```

## Actions

### Phase 1: Create New Structure
- [x] Create new subdirectories in `10-data-schema/`
- [ ] Move gold standard scripts to proper locations
- [ ] Archive obsolete files

### Phase 2: Update Documentation
- [ ] Create master `GOLD_STANDARD_SCHEMA.md`
- [ ] Update all README files with current paths
- [ ] Create seed data templates

### Phase 3: Clean Up
- [ ] Delete obsolete SQL files
- [ ] Archive old implementation docs
- [ ] Update cross-references

## Files to Archive
- All `*_STATUS.md` except latest
- All diagnostic SQL files from root
- All duplicate implementation progress files
- Old verification scripts (>30 files)

## Files to Keep & Move
- Evidence system scripts → `01-core-schema/`
- Role junction scripts → `02-role-junctions/`
- Persona junction scripts → `03-persona-junctions/`
- Effective views → `04-views/`
- Gold standard docs → Root of `10-data-schema/`

## Templates to Create
1. Tenant seed template
2. Function seed template (per tenant)
3. Department seed template (per function)
4. Role seed template (per department)
5. Persona seed template (per role - 4 MECE variants)

