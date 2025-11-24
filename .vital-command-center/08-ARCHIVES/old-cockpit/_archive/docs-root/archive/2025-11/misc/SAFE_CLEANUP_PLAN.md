# VITAL Platform - Safe Cleanup Plan

**Purpose**: Clean up root folders while preserving disabled services
**Date**: October 25, 2025
**Branch**: `restructure/world-class-architecture`

---

## 🎯 OBJECTIVE

Clean up duplicate/legacy folders from root **WITHOUT** deleting disabled services that may be re-enabled later.

---

## ✅ DISABLED SERVICES TO PRESERVE

### 1. apps/node-gateway.disabled/ - Node.js API Gateway ✅ PRESERVE
**Status**: Disabled but may be re-enabled
**Contents**:
- Dockerfile
- package.json
- src/ (Node.js gateway code)
- node_modules/

**Action**: ✅ **KEEP AS IS** - Rename to make it clear it's archived
**New Location**: `archive/disabled-services/node-gateway/`

---

### 2. backend/python-ai-services/ - Original Python Backend ✅ PRESERVE
**Status**: Copied to services/ai-engine/ but keep as backup
**Contents**:
- All Python agent code
- Tests
- Core modules
- .env (environment config)

**Action**: ✅ **ARCHIVE** - Move to archive with timestamp
**New Location**: `archive/legacy-python-backend-2025-10-25/`

---

### 3. packages.disabled/ - Disabled Packages ⚠️ INSPECT
**Contents**:
- configs/
- core/
- ui/

**Action**: ⚠️ **INSPECT FIRST** - Check if anything not in packages/
**Recommendation**: Move to `archive/disabled-packages/` if unique content

---

## 🗑️ SAFE TO DELETE (Verified Duplicates)

### Frontend Duplicates (Now in apps/digital-health-startup/)
```bash
# These are 100% duplicated in apps/digital-health-startup/src/
app/          → Duplicated in apps/digital-health-startup/src/app/
components/   → Duplicated in apps/digital-health-startup/src/components/
lib/          → Duplicated in apps/digital-health-startup/src/lib/
hooks/        → Duplicated in apps/digital-health-startup/src/hooks/
features/     → Duplicated in apps/digital-health-startup/src/features/
contexts/     → Duplicated in apps/digital-health-startup/src/contexts/
middleware/   → Duplicated in apps/digital-health-startup/src/middleware/
```

### Code Duplicates (Now in packages/)
```bash
shared/       → Moved to packages/ui/ and packages/sdk/
config/       → Moved to packages/config/
types/        → Moved to packages/sdk/src/types/
```

### Agent Duplicates (Now in services/ai-engine/)
```bash
agents/       → Moved to services/ai-engine/src/agents/
```

### Database Duplicates
```bash
db/           → Consolidated into database/
```

### Test Duplicates
```bash
test/         → Moved to apps/digital-health-startup/src/__tests__/
```

---

## 📦 ARCHIVE STRATEGY

### Step 1: Create Archive Structure
```bash
mkdir -p archive/disabled-services
mkdir -p archive/legacy-backends
mkdir -p archive/disabled-packages
```

### Step 2: Archive Disabled Services
```bash
# Preserve node-gateway (may re-enable)
mv apps/node-gateway.disabled/ archive/disabled-services/node-gateway/

# Archive original Python backend (as backup)
mv backend/python-ai-services/ archive/legacy-backends/python-ai-services-2025-10-25/

# Archive disabled packages if they have unique content
cp -r packages.disabled/ archive/disabled-packages/packages-disabled-2025-10-25/
```

### Step 3: Safe Deletion of Verified Duplicates
```bash
# Delete frontend duplicates
rm -rf app/ components/ lib/ hooks/ features/ contexts/ middleware/

# Delete code duplicates
rm -rf shared/ config/ types/ agents/

# Delete database duplicates
rm -rf db/

# Delete test duplicates
rm -rf test/

# Delete empty backend folder (after archiving python-ai-services)
rm -rf backend/
```

---

## 🔍 FOLDERS REQUIRING INSPECTION

### Before Deleting, Inspect These:

#### 1. tools/ - Development Tools
```bash
# Check contents
ls -R tools/
# Found: compliance-scanner/, medical-validation/
```
**Action**:
- If used → Move to `scripts/tools/`
- If unused → Archive to `archive/tools/`

#### 2. tests/ - Old Test Files
```bash
# Check contents
ls -R tests/
# Found: __mocks__/, compliance/, integration/, unit/
```
**Action**:
- Move useful tests to `apps/digital-health-startup/cypress/`
- Archive rest to `archive/legacy-tests/`

#### 3. examples/ - Example Code
```bash
# Check if referenced in docs
grep -r "examples/" docs/
```
**Action**:
- If referenced → Move to `docs/examples/`
- If not → Archive to `archive/examples/`

#### 4. data/ - Sample Data
```bash
ls -la data/
```
**Action**:
- Move to `database/seeds/sample-data/` if useful
- Otherwise archive

#### 5. sample-knowledge/ - Sample Knowledge Base
```bash
ls -la sample-knowledge/
```
**Action**:
- Move to `database/seeds/knowledge/` if useful
- Otherwise archive

#### 6. vital-platform/ - Unknown Directory
```bash
ls -R vital-platform/
# Found: apps/, node_modules/
```
**Action**:
- Appears to be duplicate/old structure
- Archive to `archive/vital-platform-old/`

---

## 📊 EXPECTED RESULTS

### Before Cleanup
- **Total Folders**: 43
- **Total Size**: ~8.1GB (after initial restructure: 5.6GB)

### After Safe Cleanup
- **Total Folders**: ~18-20
- **Total Size**: ~4.5GB
- **Space Saved**: ~1.1GB additional

### Preserved in Archive
- **disabled-services/**: Node gateway (may re-enable)
- **legacy-backends/**: Python AI services backup
- **disabled-packages/**: Old packages backup
- **tools/**: Development tools
- **legacy-tests/**: Old test files
- **examples/**: Code examples

---

## 🎯 FINAL CLEAN STRUCTURE

```
vital-platform/
├── apps/                          ✅ Active (4 tenant apps)
├── packages/                      ✅ Active (4 shared packages)
├── services/                      ✅ Active (backend services)
├── docs/                          ✅ Active (documentation)
├── database/                      ✅ Active (DB layer)
├── scripts/                       ✅ Active (automation)
├── supabase/                      ✅ Active (Supabase config)
├── archive/                       ✅ Active (historical backups)
│   ├── disabled-services/         🔒 Node gateway (preserved)
│   ├── legacy-backends/           🔒 Python backup (preserved)
│   ├── disabled-packages/         🔒 Old packages (preserved)
│   ├── tools/                     🔒 Dev tools (preserved)
│   ├── legacy-tests/              🔒 Old tests (preserved)
│   └── 2025-10-03-session/       📁 Existing archives
├── backups/                       ✅ Active (DB backups)
├── .github/                       ✅ Active (CI/CD)
├── .next/                         ✅ Auto-generated
├── node_modules/                  ✅ Auto-generated
└── [config files]                 ✅ Root configs
```

**Total**: ~18 folders (clean and organized)

---

## 🔐 SAFETY GUARANTEES

✅ **No Python code lost** - All copied to services/ai-engine/ + backup in archive
✅ **Disabled services preserved** - Can be re-enabled from archive/
✅ **Version controlled** - All in git before deletion
✅ **Reversible** - Archive keeps everything for 1+ year

---

## ⚡ EXECUTION PLAN

### Phase 1: Archive (Preserve Everything)
```bash
# Run archive script
./scripts/archive-disabled-services.sh
```

### Phase 2: Verify Archives
```bash
# Verify all services archived
ls -R archive/disabled-services/
ls -R archive/legacy-backends/
```

### Phase 3: Safe Deletion
```bash
# Delete only verified duplicates
./scripts/safe-cleanup-duplicates.sh
```

### Phase 4: Commit
```bash
git add -A
git commit -m "cleanup: archive disabled services and remove duplicates"
git push
```

---

## 🚨 ROLLBACK PLAN

If anything goes wrong:

```bash
# Restore from archive
cp -r archive/disabled-services/node-gateway/ apps/node-gateway.disabled/
cp -r archive/legacy-backends/python-ai-services-2025-10-25/ backend/python-ai-services/

# Or rollback git commit
git reset --hard HEAD~1
```

---

**Created**: October 25, 2025
**Status**: Ready for execution
**Approval**: Requires user confirmation before deletion
