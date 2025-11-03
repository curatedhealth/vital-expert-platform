# VITAL Platform - Root Directory In-Depth Audit

**Date**: October 25, 2025
**Auditor**: Claude Code
**Purpose**: Identify redundant folders and files for cleanup

---

## Executive Summary

**Current Status**:
- **26 folders** in root directory
- **30 files** in root directory
- **Total size**: ~1.4GB (excluding node_modules: 3.6GB)

**Major Findings**:
1. ⚠️ **vital-platform/** (428MB) - DUPLICATE folder with old node_modules
2. ⚠️ **mcp-server/** (90MB) - Old node_modules only, no source code
3. ⚠️ **python-services/** (0B) - Empty except for one empty subfolder
4. ⚠️ **logs/** (0B) - Empty log files
5. ⚠️ Multiple old Dockerfiles in root (should be in services/)
6. ⚠️ Multiple old SQL/SQLite files in root
7. ⚠️ Large tsbuildinfo cache files (3.6MB total)

---

## Detailed Folder Analysis

### 🚨 HIGH PRIORITY - DELETE IMMEDIATELY

#### 1. vital-platform/ (428MB) ⚠️ MAJOR DUPLICATE
**Size**: 428MB
**Contents**:
- `apps/digital-health/` - Only contains `next-env.d.ts` and old `node_modules/`
- `apps/pharma/` - Minimal placeholder
- `node_modules/` (415MB) - OLD/STALE dependencies

**Recommendation**: **DELETE ENTIRE FOLDER**
**Reason**: This is an OLD duplicate structure. Current apps are in `/apps/` directory. No source code exists here, only stale node_modules.

**Action**:
```bash
rm -rf vital-platform/
```

**Space Saved**: 428MB

---

#### 2. mcp-server/ (90MB) ⚠️ NO SOURCE CODE
**Size**: 90MB
**Contents**:
- `node_modules/` (90MB) - Dependencies with no accompanying code
- `.DS_Store` - macOS metadata

**Recommendation**: **DELETE ENTIRE FOLDER**
**Reason**: Contains only node_modules with no package.json, no source code, no configuration. Likely leftover from abandoned MCP server experiment.

**Action**:
```bash
rm -rf mcp-server/
```

**Space Saved**: 90MB

---

#### 3. python-services/ (0B) ⚠️ EMPTY
**Size**: 0B
**Contents**:
- `endpoint-selection/` (empty folder)

**Recommendation**: **DELETE ENTIRE FOLDER**
**Reason**: Completely empty. Python services are now in `services/ai-engine/` and archived in `archive/legacy-backends/`.

**Action**:
```bash
rm -rf python-services/
```

**Space Saved**: Negligible

---

#### 4. logs/ (0B) ⚠️ EMPTY LOG FILES
**Size**: 0B
**Contents**:
- `combined.log` (0 bytes)
- `error.log` (0 bytes)
- `http.log` (0 bytes)

**Recommendation**: **DELETE ENTIRE FOLDER** or add to .gitignore
**Reason**: Empty log files. Logs should not be in git. Add logs/ to .gitignore and delete.

**Action**:
```bash
rm -rf logs/
# Add to .gitignore: logs/
```

**Space Saved**: Negligible

---

### 🟡 MEDIUM PRIORITY - RELOCATE OR DELETE

#### 5. tests/ (136KB) ⚠️ OLD ROOT-LEVEL TESTS
**Size**: 136KB
**Contents**:
- `__mocks__/` - Mock data
- `compliance/` - Compliance tests
- `integration/` - Integration tests
- `unit/` - Unit tests
- `jest.setup.js`, `globalSetup.js`, `globalTeardown.js`

**Recommendation**: **MOVE to apps/digital-health-startup/__tests__/**
**Reason**: Tests should live with the app they test. These appear to be for the main app.

**Action**:
```bash
mv tests/ apps/digital-health-startup/__tests__/
```

**Space Saved**: 136KB from root

---

#### 6. cypress/ (24KB) ⚠️ OLD ROOT-LEVEL E2E TESTS
**Size**: 24KB
**Contents**:
- `e2e/` - E2E test specs
- `support/` - Cypress support files

**Recommendation**: **MOVE to apps/digital-health-startup/cypress/**
**Reason**: E2E tests should live with the app. Move to digital-health-startup app folder.

**Action**:
```bash
mv cypress/ apps/digital-health-startup/cypress/
```

**Space Saved**: 24KB from root

---

#### 7. tools/ (24KB)
**Size**: 24KB
**Contents**:
- `compliance-scanner/`
- `medical-validation/`

**Recommendation**: **MOVE to scripts/tools/**
**Reason**: Development tools should be in scripts/ folder for organization.

**Action**:
```bash
mv tools/ scripts/tools/
```

**Space Saved**: 24KB from root

---

#### 8. data/ (832KB)
**Size**: 832KB
**Contents**:
- `agents-comprehensive.json` (384KB)
- `agents-comprehensive.json.backup` (384KB) - DUPLICATE
- `agents-summary.json`
- `agents.json`
- `batch-uploads/`
- `knowledge_domains.json`
- `llm_providers.json`
- `vital_expert_data.json`

**Recommendation**: **MOVE to database/seeds/** and **DELETE backup**
**Reason**: Seed data belongs in database/seeds/. Remove duplicate backup file.

**Action**:
```bash
rm data/agents-comprehensive.json.backup
mv data/ database/seeds/
```

**Space Saved**: 384KB (backup) + 832KB from root

---

#### 9. examples/ (16KB)
**Size**: 16KB
**Contents**:
- `tier1-agent-template.json`
- `tier2-agent-template.json`
- `tier3-agent-template.json`

**Recommendation**: **MOVE to docs/examples/**
**Reason**: Example files are documentation and should live in docs/.

**Action**:
```bash
mv examples/ docs/examples/
```

**Space Saved**: 16KB from root

---

#### 10. exports/ (668KB)
**Size**: 668KB
**Contents**:
- `notion/` - Notion export data

**Recommendation**: **MOVE to archive/notion-exports/**
**Reason**: Export data is historical and should be archived.

**Action**:
```bash
mv exports/ archive/notion-exports/
```

**Space Saved**: 668KB from root

---

#### 11. sample-knowledge/ (228KB)
**Size**: 228KB
**Contents**: Sample knowledge base files

**Recommendation**: **MOVE to database/seeds/knowledge/**
**Reason**: Sample data is seed data and belongs in database folder.

**Action**:
```bash
mv sample-knowledge/ database/seeds/knowledge/
```

**Space Saved**: 228KB from root

---

#### 12. notion-setup/ (128KB)
**Size**: 128KB
**Contents**: Notion integration setup files

**Recommendation**: **MOVE to scripts/notion/**
**Reason**: Setup scripts should be in scripts/ folder.

**Action**:
```bash
mv notion-setup/ scripts/notion/
```

**Space Saved**: 128KB from root

---

#### 13. mock-database/ (8KB)
**Size**: 8KB
**Contents**: Mock database files

**Recommendation**: **MOVE to apps/digital-health-startup/__mocks__/**
**Reason**: Mock data should be with tests.

**Action**:
```bash
mv mock-database/ apps/digital-health-startup/__mocks__/database/
```

**Space Saved**: 8KB from root

---

#### 14. infrastructure/ (56KB)
**Size**: 56KB
**Contents**: Infrastructure configs

**Recommendation**: **KEEP or MOVE to database/infrastructure/**
**Reason**: If K8s/Terraform configs, keep separate. If database-related, move to database/.

**Action**: Review contents first before deciding.

---

#### 15. k8s/ (20KB)
**Size**: 20KB
**Contents**: Kubernetes configurations

**Recommendation**: **MOVE to infrastructure/k8s/** if infrastructure/ folder is kept
**Reason**: K8s configs should be grouped with other infrastructure.

**Action**:
```bash
mkdir -p infrastructure/
mv k8s/ infrastructure/k8s/
```

**Space Saved**: 20KB from root

---

#### 16. monitoring/ (4KB)
**Size**: 4KB
**Contents**: Monitoring configs

**Recommendation**: **MOVE to infrastructure/monitoring/**
**Reason**: Monitoring configs are infrastructure.

**Action**:
```bash
mv monitoring/ infrastructure/monitoring/
```

**Space Saved**: 4KB from root

---

### 📄 FILES TO DELETE OR RELOCATE

#### Root SQL Files ⚠️

**Files**:
- `check_agents_schema.sql` (201B)
- `data_dump.sql` (52KB)

**Recommendation**: **MOVE to database/debug/** or **DELETE**
**Reason**: Ad-hoc SQL files should not be in root.

**Action**:
```bash
mkdir -p database/debug/
mv check_agents_schema.sql data_dump.sql database/debug/
```

---

#### SQLite Files ⚠️

**Files**:
- `checkpoints.sqlite` (4KB)
- `checkpoints.sqlite-shm` (32KB)
- `checkpoints.sqlite-wal` (24KB)

**Recommendation**: **MOVE to database/checkpoints/** or **ADD to .gitignore**
**Reason**: SQLite files should not be committed to git.

**Action**:
```bash
mkdir -p database/checkpoints/
mv checkpoints.sqlite* database/checkpoints/
# Add to .gitignore: database/checkpoints/*.sqlite*
```

---

#### Python Script ⚠️

**File**: `vital_langchain_tracker_complete.py` (23KB)

**Recommendation**: **MOVE to scripts/langchain/**
**Reason**: Python scripts belong in scripts/ folder.

**Action**:
```bash
mkdir -p scripts/langchain/
mv vital_langchain_tracker_complete.py scripts/langchain/
```

---

#### Empty File ⚠️

**File**: `parsing-errors.txt` (0 bytes)

**Recommendation**: **DELETE**
**Reason**: Empty file, no purpose.

**Action**:
```bash
rm parsing-errors.txt
```

---

#### Dockerfiles ⚠️

**Files**:
- `Dockerfile.advisory-board` (2.2KB)
- `Dockerfile.clinical-agent-registry` (2.1KB)
- `Dockerfile.clinical-prompt-library` (2.4KB)
- `Dockerfile.frontend` (2.1KB)
- `Dockerfile.orchestrator` (2.2KB)

**Recommendation**: **MOVE to services/** or **ARCHIVE**
**Reason**: Old Dockerfiles from previous architecture. Should be in services/ or archived.

**Action**:
```bash
mkdir -p archive/old-dockerfiles/
mv Dockerfile.* archive/old-dockerfiles/
```

---

#### Docker Compose Files

**Files**:
- `docker-compose.yml` (12KB)
- `docker-compose.dev.yml` (3.4KB)
- `docker-compose.phase2-enhanced.yml` (17KB)

**Recommendation**: **KEEP docker-compose.yml, ARCHIVE others**
**Reason**: Multiple docker-compose files suggest evolution. Keep main, archive old versions.

**Action**:
```bash
mv docker-compose.phase2-enhanced.yml archive/old-docker-compose/
mv docker-compose.dev.yml docker-compose.dev.yml.backup
```

---

#### TypeScript Build Info Files ⚠️

**Files**:
- `tsconfig.tsbuildinfo` (2.8MB)
- `tsconfig.core.tsbuildinfo` (303KB)
- `tsconfig.deploy.tsbuildinfo` (481KB)

**Recommendation**: **ADD to .gitignore and DELETE**
**Reason**: Build cache files should never be committed.

**Action**:
```bash
rm tsconfig*.tsbuildinfo
# Add to .gitignore: *.tsbuildinfo
```

**Space Saved**: 3.6MB

---

## Summary of Recommended Actions

### Phase 1: Delete Large Duplicates (518MB saved)

```bash
# HIGH PRIORITY DELETIONS
rm -rf vital-platform/          # 428MB - Old duplicate with stale node_modules
rm -rf mcp-server/              # 90MB - No source code, only node_modules
rm -rf python-services/         # 0B - Empty folder
rm -rf logs/                    # 0B - Empty log files
```

**Space Saved**: 518MB

---

### Phase 2: Delete Small Redundant Files (3.6MB saved)

```bash
# Delete build cache files
rm tsconfig*.tsbuildinfo        # 3.6MB

# Delete duplicate data
rm data/agents-comprehensive.json.backup  # 384KB

# Delete empty file
rm parsing-errors.txt           # 0B
```

**Space Saved**: 4MB

---

### Phase 3: Relocate to Proper Locations

```bash
# Move tests to app
mv tests/ apps/digital-health-startup/__tests__/
mv cypress/ apps/digital-health-startup/cypress/
mv mock-database/ apps/digital-health-startup/__mocks__/database/

# Move development tools to scripts
mv tools/ scripts/tools/
mv notion-setup/ scripts/notion/
mv vital_langchain_tracker_complete.py scripts/langchain/

# Move data to database
mv data/ database/seeds/
mv sample-knowledge/ database/seeds/knowledge/
mv check_agents_schema.sql data_dump.sql database/debug/
mkdir -p database/checkpoints && mv checkpoints.sqlite* database/checkpoints/

# Move examples to docs
mv examples/ docs/examples/

# Move exports to archive
mv exports/ archive/notion-exports/

# Move infrastructure files
mkdir -p infrastructure/
mv k8s/ infrastructure/k8s/
mv monitoring/ infrastructure/monitoring/

# Archive old Docker files
mkdir -p archive/old-dockerfiles/
mv Dockerfile.* archive/old-dockerfiles/
mv docker-compose.phase2-enhanced.yml archive/old-docker-compose/
```

---

### Phase 4: Update .gitignore

Add these patterns to `.gitignore`:

```gitignore
# Build cache
*.tsbuildinfo

# Logs
logs/
*.log

# SQLite databases
*.sqlite
*.sqlite-shm
*.sqlite-wal
database/checkpoints/*.sqlite*

# OS files
.DS_Store
```

---

## Expected Results

### After Cleanup:

**Root Structure** (clean & organized):
```
vital-platform/
├── apps/                  ✅ 4 tenant applications (604MB)
├── packages/              ✅ Shared packages (756KB)
├── services/              ✅ Backend services (872KB)
├── docs/                  ✅ Documentation + examples (12MB)
├── database/              ✅ Database + seeds + debug (8MB)
├── scripts/               ✅ Scripts + tools + notion (6MB)
├── supabase/              ✅ Supabase config (576KB)
├── archive/               ✅ Historical backups (160MB + new archives)
├── backups/               ✅ DB backups (60MB)
├── infrastructure/        ✅ K8s + monitoring (80KB)
├── node_modules/          ✅ Dependencies (3.6GB)
└── [config files]         ✅ Root configs only
```

**Folders in Root**: ~12-15 (down from 26)
**Files in Root**: ~20 (down from 30)

### Space Saved

- **Phase 1 (delete duplicates)**: 518MB
- **Phase 2 (delete redundant)**: 4MB
- **Phase 3 (relocate)**: 2.2MB from root (organized better)
- **Total Space Freed**: ~522MB
- **Total Cleanup**: ~2.2MB relocated from root to proper locations

---

## Risk Assessment

### Low Risk (Delete Immediately) ✅
- `vital-platform/` - Verified duplicate, no source code
- `mcp-server/` - Only node_modules, no code
- `python-services/` - Empty
- `logs/` - Empty log files
- `*.tsbuildinfo` - Build cache
- `parsing-errors.txt` - Empty
- Duplicate backup files

### Medium Risk (Review First) ⚠️
- Old Dockerfiles - May be referenced somewhere
- `docker-compose.phase2-enhanced.yml` - Check if still used
- SQLite checkpoint files - Check if LangGraph needs them

### No Risk (Relocate) ✅
- All relocations are safe as we're just moving files to better organized locations

---

## Validation Steps

After cleanup, verify:

```bash
# 1. Check apps still build
cd apps/digital-health-startup && pnpm build

# 2. Check Python services work
cd services/ai-engine && python -m pytest

# 3. Check database migrations work
cd database && ls migrations/

# 4. Check scripts are accessible
ls scripts/

# 5. Verify git status
git status
```

---

## Next Steps

1. **Review this audit** with the team
2. **Execute Phase 1** (delete large duplicates) - saves 518MB
3. **Execute Phase 2** (delete small redundant files) - saves 4MB
4. **Execute Phase 3** (relocate to proper locations) - organizes structure
5. **Update .gitignore** to prevent future clutter
6. **Test builds** to ensure nothing broke
7. **Commit cleanup** with detailed message
8. **Push to GitHub**

---

**Audit Complete**
**Total Potential Space Savings**: ~522MB
**Total Files to Relocate**: ~2.2MB to proper locations
**Expected Root Folders After Cleanup**: 12-15 (from 26)
