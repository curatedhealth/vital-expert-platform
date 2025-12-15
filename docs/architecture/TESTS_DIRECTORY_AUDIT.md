# Tests Directory Audit

**Date:** December 14, 2025  
**Purpose:** Comprehensive audit of `/tests/` directory structure and recommendations

---

## Summary

**Total Files:** 36 files  
**Total Directories:** 10 directories  
**Total Size:** 360KB  
**Structure:** Mixed organization with some duplication and unclear boundaries

---

## Current Structure

```
tests/
├── additional/              # 296KB (82% of total)
│   ├── integration/
│   ├── unit/
│   ├── *.sql               # Database test queries
│   ├── *.md                # Test documentation
│   ├── *.sh                # Test runner scripts
│   └── *.py                # Python test scripts
│
├── e2e/                     # 32KB (9% of total)
│   ├── helpers/
│   ├── specs/              # Playwright E2E tests
│   ├── playwright.config.ts
│   └── package.json
│
├── performance/             # 16KB (4% of total)
│   ├── api-load-test.js
│   ├── k6-config.js
│   └── README.md
│
├── manual/                  # 8KB (2% of total)
│   ├── master_smoke_test.py
│   └── verify_interactive_engine.py
│
└── test_supabase_connection.js  # Root-level test file
```

---

## Issues Identified

### 1. ❌ **Unclear Directory Purpose**

**Problem:** `additional/` directory name is vague and doesn't indicate what it contains.

**Contents:**
- Integration tests
- Unit tests
- Database test queries (SQL)
- Test documentation
- Test runner scripts
- Python test scripts

**Impact:** Difficult to understand what tests exist and where to add new ones.

### 2. ❌ **Mixed Test Types in One Directory**

**Problem:** `additional/` contains:
- Unit tests (`unit/prompt-*.test.js`)
- Integration tests (`integration/full-flow.test.js`)
- Database tests (SQL files)
- Documentation (markdown files)
- Runner scripts (shell scripts)

**Impact:** No clear separation of concerns, hard to run specific test types.

### 3. ❌ **Root-Level Test File**

**Problem:** `test_supabase_connection.js` is at root of `/tests/`.

**Impact:** Inconsistent with organized structure, should be in appropriate subdirectory.

### 4. ⚠️ **Duplicate Test Locations**

**Problem:** Tests may exist in:
- `/tests/` (root tests directory)
- `/apps/vital-system/` (frontend tests)
- `/services/ai-engine/` (backend tests)

**Impact:** Unclear where to find or add tests.

### 5. ⚠️ **SQL Test Files in Tests Directory**

**Problem:** Database test queries (`.sql` files) are in `/tests/additional/`.

**Recommendation:** These should be in `/database/postgres/queries/` or `/database/postgres/tests/`.

**Files:**
- `agent-relationships-tests.sql`
- `ask-expert-4-mode-tests.sql`
- `corrected-hierarchy-queries.sql`
- `database-integration-tests.sql`
- `database-tests.sql`

### 6. ⚠️ **Documentation Mixed with Tests**

**Problem:** Test documentation (`.md` files) mixed with test code.

**Files:**
- `TEST_DOCUMENTATION.md`
- `agent-relationship-test-results.md`
- `agent-tool-integration.test.md`
- `digital-health-tenant-mapping.md`

**Recommendation:** Move to `/docs/` or create `/tests/docs/` subdirectory.

### 7. ✅ **Well-Organized: E2E Tests**

**Status:** `e2e/` directory is well-organized:
- Clear structure (`specs/`, `helpers/`)
- Proper configuration (`playwright.config.ts`)
- Package management (`package.json`)
- Documentation (`README.md`)

### 8. ✅ **Well-Organized: Performance Tests**

**Status:** `performance/` directory is well-organized:
- Clear purpose
- Proper tooling (k6)
- Documentation

### 9. ⚠️ **Manual Tests Location**

**Problem:** `manual/` directory contains Python scripts that might be:
- Smoke tests (should be automated)
- Verification scripts (should be in `/scripts/` or `/database/shared/scripts/`)

**Files:**
- `master_smoke_test.py` - Could be automated
- `verify_interactive_engine.py` - Could be a diagnostic script

---

## Recommendations

### Option A: Reorganize by Test Type (Recommended) ✅

**Structure:**
```
tests/
├── unit/                    # Unit tests (from additional/unit/)
│   └── [test files]
│
├── integration/             # Integration tests (from additional/integration/)
│   └── [test files]
│
├── e2e/                     # E2E tests (keep as-is)
│   ├── helpers/
│   ├── specs/
│   └── [config files]
│
├── performance/             # Performance tests (keep as-is)
│   └── [test files]
│
├── database/                # Database tests (from additional/*.sql)
│   ├── queries/             # Test queries
│   └── fixtures/            # Test data
│
├── scripts/                 # Test runner scripts (from additional/*.sh)
│   └── [runner scripts]
│
└── docs/                    # Test documentation (from additional/*.md)
    └── [documentation]
```

**Actions:**
1. Rename `additional/unit/` → `tests/unit/`
2. Rename `additional/integration/` → `tests/integration/`
3. Move `additional/*.sql` → `tests/database/queries/`
4. Move `additional/*.sh` → `tests/scripts/`
5. Move `additional/*.md` → `tests/docs/`
6. Move `test_supabase_connection.js` → `tests/integration/`
7. Evaluate `manual/` scripts:
   - If smoke tests → automate in `tests/integration/`
   - If diagnostic → move to `database/shared/scripts/diagnostics/`

### Option B: Move Database Tests to Database Directory

**Alternative:** Move SQL test files to database directory:

```
database/postgres/
├── tests/                    # NEW
│   ├── queries/             # Test queries
│   └── fixtures/            # Test data
```

**Rationale:** Database tests belong with database assets.

### Option C: Consolidate with App/Service Tests

**Alternative:** Move tests closer to code:
- Frontend tests → `apps/vital-system/tests/`
- Backend tests → `services/ai-engine/tests/`
- Shared tests → `tests/` (E2E, performance, cross-cutting)

---

## Detailed File Analysis

### Files to Keep in `/tests/`

| File | Current Location | Recommended Location | Reason |
|------|-----------------|---------------------|--------|
| E2E tests | `e2e/` | `tests/e2e/` | ✅ Well-organized, keep |
| Performance tests | `performance/` | `tests/performance/` | ✅ Well-organized, keep |
| Unit tests | `additional/unit/` | `tests/unit/` | Reorganize |
| Integration tests | `additional/integration/` | `tests/integration/` | Reorganize |
| Test runners | `additional/*.sh` | `tests/scripts/` | Reorganize |

### Files to Move

| File | Current Location | Recommended Location | Reason |
|------|-----------------|---------------------|--------|
| SQL test queries | `additional/*.sql` | `database/postgres/tests/queries/` | Database tests belong with DB |
| Test docs | `additional/*.md` | `tests/docs/` or `/docs/tests/` | Documentation separation |
| Root test file | `test_supabase_connection.js` | `tests/integration/` | Consistent structure |
| Manual scripts | `manual/*.py` | Evaluate: automate or move to scripts | Should be automated or diagnostic |

### Files to Evaluate

| File | Current Location | Action | Reason |
|------|-----------------|--------|--------|
| `master_smoke_test.py` | `manual/` | Automate or move | Should be automated |
| `verify_interactive_engine.py` | `manual/` | Move to scripts or automate | Diagnostic or test? |
| `test_interactive_engine.py` | `additional/` | Move to `tests/integration/` | Integration test |

---

## Implementation Plan

### Phase 1: Reorganize Structure (High Priority)

1. **Create new directories:**
   ```bash
   mkdir -p tests/unit tests/integration tests/database/queries tests/scripts tests/docs
   ```

2. **Move unit tests:**
   ```bash
   mv tests/additional/unit/* tests/unit/
   ```

3. **Move integration tests:**
   ```bash
   mv tests/additional/integration/* tests/integration/
   mv tests/test_supabase_connection.js tests/integration/
   ```

4. **Move database tests:**
   ```bash
   mkdir -p database/postgres/tests/queries
   mv tests/additional/*.sql database/postgres/tests/queries/
   ```

5. **Move test runners:**
   ```bash
   mv tests/additional/*.sh tests/scripts/
   ```

6. **Move documentation:**
   ```bash
   mv tests/additional/*.md tests/docs/
   ```

7. **Remove empty directories:**
   ```bash
   rmdir tests/additional/unit tests/additional/integration tests/additional tests/manual
   ```

### Phase 2: Evaluate Manual Tests (Medium Priority)

1. Review `manual/master_smoke_test.py`:
   - If smoke test → automate in `tests/integration/`
   - If diagnostic → move to `database/shared/scripts/diagnostics/`

2. Review `manual/verify_interactive_engine.py`:
   - If test → automate in `tests/integration/`
   - If diagnostic → move to `scripts/` or `database/shared/scripts/`

### Phase 3: Update References (Medium Priority)

1. Update test runner scripts to reference new paths
2. Update CI/CD configurations
3. Update documentation references
4. Update package.json scripts

### Phase 4: Create Test Documentation (Low Priority)

1. Create `tests/README.md` with:
   - Test structure overview
   - How to run tests
   - Test organization principles
   - Contributing guidelines

2. Update individual test directory READMEs

---

## Final Recommended Structure

```
tests/
├── unit/                    # Unit tests
│   └── [test files]
│
├── integration/             # Integration tests
│   └── [test files]
│
├── e2e/                     # E2E tests (Playwright)
│   ├── helpers/
│   ├── specs/
│   └── [config files]
│
├── performance/             # Performance tests (k6)
│   └── [test files]
│
├── scripts/                 # Test runner scripts
│   └── [runner scripts]
│
└── docs/                    # Test documentation
    └── [documentation]

database/postgres/
└── tests/                   # Database tests
    ├── queries/             # Test queries (SQL)
    └── fixtures/            # Test data
```

---

## Benefits

✅ **Clear Organization:** Tests organized by type  
✅ **Easy Navigation:** Know where to find/add tests  
✅ **Consistent Structure:** Follows world-class patterns  
✅ **Better Maintenance:** Easier to update and maintain  
✅ **CI/CD Ready:** Clear test categories for pipelines

---

## Statistics

| Metric | Current | Recommended | Change |
|--------|---------|-------------|--------|
| Root-level files | 1 | 0 | ✅ Cleaner |
| Unclear directories | 1 (`additional/`) | 0 | ✅ Clear |
| Test type separation | Mixed | Separated | ✅ Better |
| Database test location | `/tests/` | `/database/` | ✅ Logical |

---

**Status:** ✅ Reorganization Complete  
**Priority:** High  
**Completed:** December 14, 2025
