# Seed Files Migration Map

This document maps the migration of seed files from `/database/migrations/seeds/` to `/sql/seeds/`.

**Migration Date**: 2025-11-16

## Migration Summary

- **Total files migrated**: 28 SQL files
- **Tool seeds**: 10 files
- **Workflow seeds**: 3 files
- **Use case seeds**: 15 files

## Detailed Migration Mapping

### Tool Seeds (10 files)

| Original Location | New Location | File |
|------------------|--------------|------|
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `02_foundation_tools.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `20251102_link_ai_tools_to_tasks.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `20251102_link_tools_to_agents.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `20251102_seed_all_tools.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `20251102_seed_core_tools.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `35_expand_tool_registry_30_new_tools.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `36_academic_medical_literature_tools.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `37_healthcare_pharma_oss_tools_complete.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `37_healthcare_pharma_oss_tools_part1.sql` |
| `/database/migrations/seeds/tools/` | `/sql/seeds/04_operational/tools/` | `38_strategic_intelligence_tools.sql` |

### Workflow Seeds (3 files)

| Original Location | New Location | File |
|------------------|--------------|------|
| `/database/migrations/seeds/workflows/` | `/sql/seeds/06_workflows/` | `02_usecases_workflows.sql` |
| `/database/migrations/seeds/workflows/` | `/sql/seeds/06_workflows/` | `LEGACY_PROMPTS_MIGRATION_FORGE.sql` |
| `/database/migrations/seeds/workflows/` | `/sql/seeds/06_workflows/` | `PROMPTS_FRAMEWORK_SEED.sql` |

### Use Case Seeds (15 files)

| Original Location | New Location | File |
|------------------|--------------|------|
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_CD_002_prompts.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_001.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_001_COMPLETE.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_001_prompts.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_001_prompts_streamlined.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_002.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_003.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_004.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_005.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_006.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_007.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_008.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_009.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `UC_RA_010.sql` |
| `/database/migrations/seeds/use-cases/` | `/sql/seeds/05_use_cases/` | `verify_UC_RA_001.sql` |

## New Directory Structure

```
/sql/seeds/
├── 04_operational/
│   └── tools/              (NEW - 10 files)
├── 05_use_cases/           (NEW - 15 files)
└── 06_workflows/           (NEW - 3 files)
```

## Status of Original Files

The original files in `/database/migrations/seeds/` have been **COPIED** (not moved) to preserve data integrity.
These originals should be:
1. Kept for now as backup
2. Archived in a future cleanup phase once new locations are verified
3. Eventually moved to `/database/migrations_ARCHIVED_20251116/seeds/`

## Usage Notes

### For Developers
- **Use files from**: `/sql/seeds/` (new locations)
- **Old locations**: Deprecated, for reference only

### For Database Setup
Execute seeds in this order:
1. `/sql/seeds/01_foundation/`
2. `/sql/seeds/02_organization/`
3. `/sql/seeds/03_content/`
4. `/sql/seeds/04_operational/` (including tools)
5. `/sql/seeds/05_use_cases/`
6. `/sql/seeds/06_workflows/`

## Related Documentation
- `/sql/seeds/README.md` - Main seeds directory documentation
- `/sql/seeds/04_operational/tools/README.md` - Tool seeds documentation
- `/sql/seeds/05_use_cases/README.md` - Use case seeds documentation
- `/sql/seeds/06_workflows/README.md` - Workflow seeds documentation
