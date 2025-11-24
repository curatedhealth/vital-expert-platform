# VITAL Platform - Root Folder Consolidation Plan

**Date**: November 21, 2024  
**Goal**: Move all non-code artifacts from root into `.vital-cockpit/`

---

## 🎯 Migration Strategy

### Phase 1: Move to `.vital-cockpit/_archive/`
✅ **Status**: Ready to Execute
- `archive/` → `.vital-cockpit/_archive/`
  - Contains: backups, disabled files, old documentation, legacy code
  - Size: ~476 SQL files, 60 MD files, 39 migration files
  - Action: Direct move (preserve all history)

### Phase 2: Move to `.vital-cockpit/.vital-ops/`
✅ **Status**: Ready to Execute

#### 2.1 SQL & Database Scripts
- `sql/` → `.vital-cockpit/.vital-ops/database/sql-additional/`
  - 177 files (87 MD, 52 SQL, 20 PY)
  - Additional SQL scripts beyond main database/

#### 2.2 Scripts (Root)
- `scripts/` → Check for duplicates with `.vital-ops/scripts/`
  - If duplicate: consolidate
  - If unique: move to `.vital-ops/scripts/`

#### 2.3 Infrastructure & Monitoring
- `monitoring/` → `.vital-cockpit/.vital-ops/monitoring-config/`
  - Grafana, Prometheus, Alertmanager configs
- `infrastructure/` → `.vital-cockpit/.vital-ops/infrastructure/`
  - Terraform, K8s configs

#### 2.4 Standalone SQL Files
Move to `.vital-cockpit/.vital-ops/database/sql-standalone/`:
- `diagnose_personas_in_database.sql`
- `get_all_pharma_org_structure.sql`
- `map_all_personas_to_departments.sql`
- `map_all_personas_to_functions.sql`
- `map_all_personas_to_roles.sql`
- `map_medical_affairs_roles_to_personas.sql`
- `map_personas_by_role_name.sql`
- `map_pharma_roles_to_personas_from_json.sql`
- `verify_medical_affairs_mapping_from_json.sql`
- `verify_pharma_roles_personas_mapping.sql`

#### 2.5 Test Files (Root)
- `test_supabase_connection.js` → `.vital-ops/tests/`
- `test-prompt-starters-api.js` → `.vital-ops/tests/`
- `tests/` → `.vital-ops/tests/`

#### 2.6 Docker & Config Files
- `docker-compose*.yml` → `.vital-ops/docker/`
- `Makefile` → `.vital-ops/`
- Shell scripts:
  - `install-observability.sh` → `.vital-ops/scripts/setup/`
  - `setup-env.sh` → `.vital-ops/scripts/setup/`
  - `setup-subdomains.sh` → `.vital-ops/scripts/setup/`
  - `start-all-services.sh` → `.vital-ops/scripts/startup/`
  - `fix-subdomains.sh` → `.vital-ops/scripts/utilities/`

### Phase 3: Move to `.vital-cockpit/vital-expert-docs/05-assets/`
✅ **Status**: Ready to Execute
- `data_capture_templates/` (if empty, skip; otherwise → `05-assets/templates/data-capture/`)

### Phase 4: Review & Archive Data
⚠️ **Status**: Needs Review
- `data/` folder contents:
  - `models/` - Check if used by active code
  - `persona_*.txt` files (14 files) - Processing reports
  - Recommendation: Move to `.vital-cockpit/_archive/data-processing-reports/`

### Phase 5: Organizational Files
- `REORGANIZATION_PLAN.md` → `.vital-cockpit/vital-expert-docs/13-operations/maintenance/`
- `GIT_COMMIT_SUMMARY.txt` → `.vital-cockpit/_archive/git-history/`

---

## ⚠️ Do NOT Move

### Active Code & Packages
- `apps/` - Active frontend applications
- `services/` - Active backend services
- `packages/` - Shared packages
- `src/` - Source code

### Active Configurations
- `database/` - Production database files (keep at root for access)
- `supabase/` - Supabase config (needs to be at root)
- `node_modules/` - Dependencies
- `package.json`, `pnpm-*`, `tsconfig.json` - Project configs
- `vercel.json`, `railway.toml` - Deployment configs

### Runtime Files
- `logs/` - Runtime logs
- `htmlcov/` - Coverage reports
- `.env`, `.env.*` - Environment files

### Root Documentation
- `README.md` - Must stay at root
- `STRUCTURE.md` - Project overview (keep at root)

---

## 📋 Execution Checklist

### Pre-Migration
- [x] Create consolidation plan
- [ ] Backup current state
- [ ] Verify `.vital-cockpit/.vital-ops/` structure

### Phase 1: Archive
- [ ] Move `archive/` → `.vital-cockpit/_archive/`
- [ ] Update references

### Phase 2: Operations
- [ ] Move standalone SQL files
- [ ] Move `sql/` directory
- [ ] Consolidate `scripts/`
- [ ] Move `monitoring/`
- [ ] Move `infrastructure/`
- [ ] Move docker configs
- [ ] Move test files
- [ ] Move shell scripts
- [ ] Move `Makefile`

### Phase 3: Assets
- [ ] Check `data_capture_templates/`
- [ ] Move if needed

### Phase 4: Data Review
- [ ] Review `data/` contents
- [ ] Move processing reports to archive

### Phase 5: Org Files
- [ ] Move `REORGANIZATION_PLAN.md`
- [ ] Move `GIT_COMMIT_SUMMARY.txt`

### Post-Migration
- [ ] Update all documentation references
- [ ] Update root README.md
- [ ] Update `.vital-cockpit/INDEX.md`
- [ ] Verify all moved files
- [ ] Test key operations
- [ ] Create migration summary

---

## 🎯 Expected Outcome

### Root Directory (After)
```
VITAL-platform/
├── .vital-cockpit/          ← All docs & ops
├── apps/                    ← Active code only
├── services/                ← Active code only
├── packages/                ← Active code only
├── database/                ← Production DB
├── supabase/                ← Active config
├── logs/                    ← Runtime logs
├── node_modules/            ← Dependencies
├── README.md                ← Entry point
├── STRUCTURE.md             ← Overview
└── [config files]           ← package.json, etc.
```

### `.vital-cockpit/` (After)
```
.vital-cockpit/
├── vital-expert-docs/       ← 16 doc sections
├── .vital-ops/              ← All operations
│   ├── database/
│   ├── scripts/
│   ├── docker/
│   ├── infrastructure/
│   ├── monitoring-config/
│   └── tests/
└── _archive/                ← Historical content
    ├── backups/
    ├── docs/
    ├── legacy/
    ├── sql/
    └── data-processing-reports/
```

---

## 📊 Impact Assessment

### Files to Move: ~800+
- Archive: ~476 SQL + 60 MD + misc
- SQL scripts: 177 files
- Scripts: Review for duplicates
- Docker configs: 5 files
- Shell scripts: 5 files
- Standalone SQL: 10 files
- Test files: 3 files + tests folder
- Infrastructure: TF + K8s files
- Monitoring: Grafana + Prometheus configs

### Broken Links: Low Risk
- Most links are within `.vital-cockpit/`
- External references will be updated

### Benefits
- ✅ Clean root directory (code only)
- ✅ All resources in one place
- ✅ Better organization
- ✅ Easier navigation
- ✅ Clear separation of concerns

---

**Ready to Execute**: This plan is ready for implementation.

