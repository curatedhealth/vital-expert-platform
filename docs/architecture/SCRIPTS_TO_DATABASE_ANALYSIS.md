# Scripts to Database Analysis

**Date:** December 14, 2025  
**Purpose:** Identify files in `/scripts/` that should be moved to `/database/`  
**Status:** ⚠️ Analysis Complete - Ready for Execution

---

## Summary

**Total Files to Move:** 50+ files  
**Categories:**
- SQL files → `database/postgres/`
- Migration scripts → `database/shared/scripts/` or `database/postgres/scripts/`
- Sync scripts → `database/sync/`
- Diagnostic queries → `database/postgres/queries/` or `database/shared/scripts/diagnostics/`

---

## Category 1: SQL Files → `database/postgres/`

### Root-Level SQL Files (Move to `database/postgres/`)

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `apply-all-user-panels-migrations.sql` | `scripts/` | `database/postgres/migrations/` | Migration file |
| `apply-rls-policies-fixed.sql` | `scripts/` | `database/postgres/policies/` | RLS policy |
| `apply-rls-policies.sql` | `scripts/` | `database/postgres/policies/` | RLS policy |
| `check-and-create-user-agents-table.sql` | `scripts/` | `database/postgres/queries/` | Diagnostic query |
| `check-user-panels-table.sql` | `scripts/` | `database/postgres/queries/` | Diagnostic query |
| `create-user-panels-table.sql` | `scripts/` | `database/postgres/migrations/` | Migration file |
| `fix-profiles-rls.sql` | `scripts/` | `database/postgres/policies/` | RLS policy fix |
| `normalized-user-agents-complete.sql` | `scripts/` | `database/postgres/migrations/` | Migration file |
| `safe-migrate-user-agents.sql` | `scripts/` | `database/postgres/migrations/` | Migration file |
| `user-agents-gold-standard-schema.sql` | `scripts/` | `database/postgres/migrations/` | Schema migration |
| `verify-user-panels-schema.sql` | `scripts/` | `database/postgres/queries/` | Verification query |

**Total:** 11 SQL files

### SQL Subdirectory Files (Move to `database/postgres/`)

**Location:** `scripts/sql/` (7 files)

| File | Target Location |
|------|-----------------|
| `ensure_agent_domain_coverage.sql` | `database/postgres/migrations/` |
| `fix_agent_levels.sql` | `database/postgres/migrations/` |
| `fix_agents_domains_sources.sql` | `database/postgres/migrations/` |
| `migrate_knowledge_domains.sql` | `database/postgres/migrations/` |
| `normalize_agents_knowledge_domains.sql` | `database/postgres/migrations/` |
| `normalize_knowledge_sources.sql` | `database/postgres/migrations/` |
| `normalize_knowledge.sql` | `database/postgres/migrations/` |

**Total:** 7 SQL files

### Diagnostic SQL Files (Move to `database/postgres/queries/`)

**Location:** `scripts/diagnostics/` (40+ SQL files)

**All diagnostic queries should move to:**
- `database/postgres/queries/diagnostics/` (create subdirectory)

**Files:**
- All `check_*.sql` files (40+ files)
- `check-env.sh` (shell script, keep in scripts or move to database/shared/scripts/)

**Total:** 40+ SQL files

---

## Category 2: Migration Scripts → `database/shared/scripts/`

### Migration Execution Scripts

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `run-3-phase-migrations.sh` | `scripts/` | `database/shared/scripts/` | Executes migrations |
| `run-security-migrations.sh` | `scripts/` | `database/shared/scripts/` | Executes security migrations |
| `deploy-user-panels-migrations.sh` | `scripts/` | `database/shared/scripts/` | Deploys migrations |
| `apply-user-panels-migration.sh` | `scripts/` | `database/shared/scripts/` | Applies migrations |
| `run_migrations_help.sh` | `scripts/` | `database/shared/scripts/` | Migration help |
| `run_normalize_migration.py` | `scripts/` | `database/shared/scripts/` | Normalization script |
| `sync-migrations-to-supabase.sh` | `scripts/` | `database/shared/scripts/` | Syncs to Supabase |

**Total:** 7 migration scripts

### Migration Generation Scripts

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `extract-legacy-workflows.py` | `scripts/` | `database/shared/scripts/` | Generates migrations |
| `extract-task-library.py` | `scripts/` | `database/shared/scripts/` | Generates migrations |
| `generate-legacy-migration.ts` | `scripts/` | `database/shared/scripts/` | Generates migrations |

**Total:** 3 generation scripts

---

## Category 3: Sync Scripts → `database/sync/`

### Cross-Database Sync Scripts

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `sync_agents_to_pinecone_neo4j.py` | `scripts/` | `database/sync/` | Syncs to Pinecone & Neo4j |
| `sync_agents_capabilities_responsibilities.py` | `scripts/` | `database/sync/` | Syncs agent data |
| `sync_agents_capabilities_responsibilities_robust.py` | `scripts/` | `database/sync/` | Syncs agent data (robust) |

**Note:** `database/sync/` already exists with:
- `sync_to_neo4j.py`
- `sync_agents_to_pinecone.py`
- `sync_personas_to_pinecone.py`

**Total:** 3 sync scripts to move

---

## Category 4: Data Population Scripts → `database/postgres/scripts/`

### Data Population

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `populate_agent_capabilities.py` | `scripts/` | `database/postgres/scripts/` | Populates database |

**Total:** 1 script

---

## Category 5: Documentation → `database/postgres/` or Keep

### Database Documentation

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `apply-panels-migration.md` | `scripts/` | `database/postgres/` | Migration guide |
| `user-agents-minimal-vs-gold-standard.md` | `scripts/` | `database/postgres/` | Schema documentation |
| `normalization-explained.md` | `scripts/` | `database/postgres/` | Normalization docs |
| `existing-schema-analysis.md` | `scripts/` | `database/postgres/` | Schema analysis |
| `quick-fix-user-agents.md` | `scripts/` | `database/postgres/` | User agents guide |

**Total:** 5 documentation files

---

## Category 6: Keep in `/scripts/` (Not Database-Related)

### Non-Database Scripts (Keep in `/scripts/`)

| File | Reason |
|------|--------|
| `codegen/` | Code generation (not database) |
| `testing/` | API testing (not database) |
| `fix-user-agents-via-api.ts` | API script (not database) |
| `insert-panels.js` | API script (not database) |
| `migrate-agent-avatars.ts` | API script (not database) |
| `map-agent-avatars.ts` | API script (not database) |
| `review-avatar-mappings.ts` | API script (not database) |
| `upload-svg-avatars.ts` | API script (not database) |
| `validate-avatar-mappings.ts` | API script (not database) |
| `sync-llm-models.ts` | API sync (not database) |
| `workflow-migration-note.js` | Workflow note (not database) |
| `AVATAR_MAPPING_GUIDE.md` | API guide (not database) |
| `apply-agent-tenant-migration.js` | API migration (not database) |
| `fix-panels-now.sh` | API fix script (not database) |
| `run-e2e.sh` | E2E testing (not database) |

**Total:** ~15 files to keep in `/scripts/`

---

## Recommended Organization

### Move to `database/postgres/`

```
database/postgres/
├── migrations/          # Add 11 root SQL files + 7 from sql/
├── policies/            # Add 3 RLS policy files
├── queries/             # Add 2 verification queries
│   └── diagnostics/    # Add 40+ diagnostic queries
├── scripts/             # Create new - Add 1 population script
└── [docs]               # Add 5 documentation files
```

### Move to `database/shared/scripts/`

```
database/shared/scripts/
├── migrations/          # Add 7 migration execution scripts
├── generation/          # Add 3 migration generation scripts
└── [existing scripts]  # Keep existing
```

### Move to `database/sync/`

```
database/sync/
├── sync_agents_to_pinecone_neo4j.py          # Add
├── sync_agents_capabilities_responsibilities.py  # Add
└── sync_agents_capabilities_responsibilities_robust.py  # Add
```

---

## Execution Plan

### Phase 1: SQL Files
1. Move root SQL files to `database/postgres/` (migrations/policies/queries)
2. Move `scripts/sql/*` to `database/postgres/migrations/`
3. Move `scripts/diagnostics/*.sql` to `database/postgres/queries/diagnostics/`

### Phase 2: Migration Scripts
1. Move migration execution scripts to `database/shared/scripts/migrations/`
2. Move migration generation scripts to `database/shared/scripts/generation/`

### Phase 3: Sync Scripts
1. Move sync scripts to `database/sync/`

### Phase 4: Documentation
1. Move database docs to `database/postgres/`

### Phase 5: Update References
1. Update all script references to new paths
2. Update documentation

---

## Statistics

| Category | Files | Target Location |
|----------|-------|-----------------|
| SQL files (root) | 11 | `database/postgres/` |
| SQL files (sql/) | 7 | `database/postgres/migrations/` |
| Diagnostic SQL | 40+ | `database/postgres/queries/diagnostics/` |
| Migration scripts | 7 | `database/shared/scripts/migrations/` |
| Generation scripts | 3 | `database/shared/scripts/generation/` |
| Sync scripts | 3 | `database/sync/` |
| Population scripts | 1 | `database/postgres/scripts/` |
| Documentation | 5 | `database/postgres/` |
| **Total to Move** | **77+** | Various `database/` locations |
| **Keep in scripts/** | **~15** | Non-database scripts |

---

## Benefits

✅ **Better Organization:** Database-related files in `/database/`  
✅ **Clear Separation:** Database vs. general scripts  
✅ **Easier Maintenance:** All database assets in one place  
✅ **Scalable:** Easy to find and manage database files

---

**Status:** ⚠️ Ready for Execution  
**Estimated Time:** 30-45 minutes
