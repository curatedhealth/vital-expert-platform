# .claude/ Directory Reorganization Audit

**Date:** December 14, 2025  
**Purpose:** Identify files in `.claude/` root and `.claude/docs/` that should be moved to project root folders

---

## Summary

**`.claude/` Root Files:** 16 files  
**`.claude/docs/` Files:** 3,117 files  
**Status:** Needs reorganization to separate AI assistant config from project documentation

---

## Current Structure

```
.claude/
├── [Root-level files]          # 16 files
│   ├── AGENT_QUICK_START.md
│   ├── CATALOGUE.md
│   ├── CLAUDE.md
│   ├── CONSOLIDATION_COMPLETE.md
│   ├── DOCUMENTATION_GOVERNANCE_PLAN.md
│   ├── EVIDENCE_BASED_RULES.md
│   ├── GOVERNANCE_IMPLEMENTATION_SUMMARY.md
│   ├── INDEX.md
│   ├── MASTER_DOCUMENTATION_INDEX.md
│   ├── NAMING_CONVENTION.md
│   ├── README.md
│   ├── STANDARDIZATION_COMPLETE.md
│   ├── STRUCTURE.md
│   ├── VITAL.md
│   └── settings.local.json
│
├── agents/                      # 38 agent definitions
│   └── [agent files]
│
└── docs/                        # 3,117 files
    ├── architecture/
    │   └── data-schema/         # ⚠️ Contains SQL files + schema docs
    ├── strategy/
    │   ├── vision/
    │   │   └── GOLD_STANDARD_SCHEMA.md
    │   └── ard/
    │       └── GOLD_STANDARD_SCHEMA.md
    ├── services/
    ├── platform/
    ├── operations/
    └── [other subdirectories]
```

---

## Issues Identified

### 1. ⚠️ **Duplicate STRUCTURE.md**

**Problem:** Both `.claude/STRUCTURE.md` (280 lines) and root `STRUCTURE.md` (224 lines) exist and differ.

**Analysis:**
- `.claude/STRUCTURE.md` - More detailed, includes Claude Code structure
- Root `STRUCTURE.md` - Project structure focused

**Recommendation:**
- Keep root `STRUCTURE.md` as canonical project structure
- Update `.claude/STRUCTURE.md` to reference root version or merge differences
- Or move `.claude/STRUCTURE.md` → `.claude/docs/` if it's documentation

### 2. ⚠️ **Schema Files in .claude/docs/**

**Problem:** Gold Standard Schema files in `.claude/docs/strategy/`:
- `strategy/vision/GOLD_STANDARD_SCHEMA.md` - Database schema reference
- `strategy/ard/GOLD_STANDARD_SCHEMA.md` - Database schema reference

**Also Found:**
- `architecture/data-schema/` - Contains 100+ SQL files and schema documentation
- `architecture/data-schema/GOLD_STANDARD_COMPLETE.md`
- `architecture/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md`

**Recommendation:** 
- Move schema documentation to `database/postgres/schemas/` (create if needed)
- Move SQL files to `database/postgres/migrations/` if they're migrations
- Keep in `.claude/docs/` if they're internal reference docs

### 3. ⚠️ **Naming Convention in .claude/**

**Problem:** `NAMING_CONVENTION.md` is in `.claude/` root.

**Current:** `docs/architecture/FILE_ORGANIZATION_STANDARD.md` exists (includes naming)

**Recommendation:**
- Compare both files
- Merge into `FILE_ORGANIZATION_STANDARD.md` if overlapping
- Or move to `docs/architecture/` if it's project-wide standard

### 4. ⚠️ **Documentation Governance in .claude/**

**Problem:** `DOCUMENTATION_GOVERNANCE_PLAN.md` is in `.claude/` root.

**Recommendation:** 
- Move to `.claude/docs/coordination/` (internal governance)
- Or keep in `.claude/` if it's AI assistant-specific governance

### 5. ⚠️ **Master Documentation Index**

**Problem:** `MASTER_DOCUMENTATION_INDEX.md` and `INDEX.md` in `.claude/` root.

**Current:** `.claude/docs/DOCUMENTATION_INDEX.md` exists

**Recommendation:** 
- `INDEX.md` → `.claude/docs/INDEX.md` (if different from existing)
- `MASTER_DOCUMENTATION_INDEX.md` → `.claude/docs/_historical/` or merge with existing index

### 6. ⚠️ **Consolidation/Standardization History Files**

**Problem:** `CONSOLIDATION_COMPLETE.md`, `STANDARDIZATION_COMPLETE.md`, `GOVERNANCE_IMPLEMENTATION_SUMMARY.md` in root.

**Recommendation:** Move to `.claude/docs/_historical/consolidation/`

### 7. ⚠️ **Data Schema Directory in .claude/docs/**

**Problem:** `.claude/docs/architecture/data-schema/` contains:
- 100+ SQL files (migrations, seeds, diagnostics)
- Schema documentation files
- Implementation guides

**Recommendation:**
- **SQL files** → Move to `database/postgres/` (migrations, seeds, queries)
- **Schema docs** → Move to `database/postgres/schemas/` (create directory)
- **Implementation guides** → Keep in `.claude/docs/` if internal, or move to `docs/architecture/` if public

### 8. ✅ **Keep in .claude/ Root (AI Assistant Config)**

**These should STAY:**
- `CLAUDE.md` - Claude operational rules
- `VITAL.md` - VITAL Platform standards for AI
- `EVIDENCE_BASED_RULES.md` - AI assistant evidence requirements
- `AGENT_QUICK_START.md` - Agent onboarding
- `settings.local.json` - Claude Code settings
- `README.md` - Command center overview
- `CATALOGUE.md` - Master catalog (AI assistant navigation)

---

## Files to Move

### Category 1: Move to Project Root or Merge

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `STRUCTURE.md` | `.claude/` | Merge with root `STRUCTURE.md` or update reference | Project structure doc |
| `NAMING_CONVENTION.md` | `.claude/` | Merge with `docs/architecture/FILE_ORGANIZATION_STANDARD.md` | Project naming standard |

### Category 2: Move to .claude/docs/

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `INDEX.md` | `.claude/` | `.claude/docs/` (if different from existing) | Documentation index |
| `MASTER_DOCUMENTATION_INDEX.md` | `.claude/` | `.claude/docs/_historical/` | Historical documentation index |
| `DOCUMENTATION_GOVERNANCE_PLAN.md` | `.claude/` | `.claude/docs/coordination/` | Internal governance |
| `CONSOLIDATION_COMPLETE.md` | `.claude/` | `.claude/docs/_historical/consolidation/` | Historical record |
| `STANDARDIZATION_COMPLETE.md` | `.claude/` | `.claude/docs/_historical/consolidation/` | Historical record |
| `GOVERNANCE_IMPLEMENTATION_SUMMARY.md` | `.claude/` | `.claude/docs/_historical/consolidation/` | Historical record |

### Category 3: Schema Files to Move

| File | Current Location | Target Location | Reason |
|------|-----------------|-----------------|--------|
| `GOLD_STANDARD_SCHEMA.md` (vision) | `.claude/docs/strategy/vision/` | `database/postgres/schemas/` | Database schema reference |
| `GOLD_STANDARD_SCHEMA.md` (ard) | `.claude/docs/strategy/ard/` | `database/postgres/schemas/` | Database schema reference |
| `GOLD_STANDARD_COMPLETE.md` | `.claude/docs/architecture/data-schema/` | `database/postgres/schemas/` | Schema documentation |
| `DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md` | `.claude/docs/architecture/data-schema/` | `database/postgres/schemas/` or `docs/architecture/` | Schema guide |

### Category 4: SQL Files in data-schema/ to Move

**Location:** `.claude/docs/architecture/data-schema/`

**Files to Move:**
- **Migrations** → `database/postgres/migrations/`
- **Seeds** → `database/postgres/seeds/`
- **Queries/Diagnostics** → `database/postgres/queries/` or `database/postgres/queries/diagnostics/`

**Action:** Review and categorize 100+ SQL files

### Category 5: Files to Keep in .claude/ Root ✅

| File | Reason |
|------|--------|
| `CLAUDE.md` | AI assistant operational rules |
| `VITAL.md` | AI assistant platform standards |
| `EVIDENCE_BASED_RULES.md` | AI assistant evidence requirements |
| `AGENT_QUICK_START.md` | AI agent onboarding |
| `settings.local.json` | Claude Code configuration |
| `README.md` | Command center overview |
| `CATALOGUE.md` | AI assistant navigation |

---

## .claude/docs/ Review

### Files That Should Move to Public `docs/`

**Criteria:** Documentation that developers/users need, not AI assistant-specific

| Category | Current Location | Target Location | Examples |
|----------|-----------------|-----------------|----------|
| API Documentation | `.claude/docs/architecture/api/` | `docs/api/` | API references (if public) |
| Developer Guides | `.claude/docs/operations/deployment/` | `docs/guides/` | Deployment guides (if public) |
| Architecture Overview | `.claude/docs/architecture/` | `docs/architecture/` | Public architecture docs |

**Note:** Most `.claude/docs/` content should STAY as internal documentation.

### Files That Should Stay in .claude/docs/

**Criteria:** Internal, AI assistant-specific, or strategic planning docs

| Category | Reason |
|----------|--------|
| `strategy/prd/` | Internal PRDs |
| `strategy/ard/` | Internal ARDs |
| `strategy/vision/` | Internal strategic docs |
| `services/` | Internal service documentation |
| `platform/` | Internal platform docs |
| `coordination/` | AI agent coordination |
| `_historical/` | Historical records |
| `operations/` | Internal operations docs |

---

## Recommendations

### Option A: Comprehensive Reorganization (Recommended) ✅

**Actions:**

1. **Create database/postgres/schemas/ directory**
   ```bash
   mkdir -p database/postgres/schemas
   ```

2. **Move Schema Files**
   ```bash
   # Move Gold Standard Schema files
   mv .claude/docs/strategy/vision/GOLD_STANDARD_SCHEMA.md database/postgres/schemas/GOLD_STANDARD_SCHEMA.md
   mv .claude/docs/strategy/ard/GOLD_STANDARD_SCHEMA.md database/postgres/schemas/GOLD_STANDARD_SCHEMA_ARD.md
   mv .claude/docs/architecture/data-schema/GOLD_STANDARD_COMPLETE.md database/postgres/schemas/
   mv .claude/docs/architecture/data-schema/DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md database/postgres/schemas/
   ```

3. **Review and Move SQL Files from data-schema/**
   ```bash
   # Review SQL files in .claude/docs/architecture/data-schema/
   # Categorize:
   # - Migrations → database/postgres/migrations/
   # - Seeds → database/postgres/seeds/
   # - Queries → database/postgres/queries/
   ```

4. **Move Historical Files**
   ```bash
   mkdir -p .claude/docs/_historical/consolidation
   mv .claude/CONSOLIDATION_COMPLETE.md .claude/docs/_historical/consolidation/
   mv .claude/STANDARDIZATION_COMPLETE.md .claude/docs/_historical/consolidation/
   mv .claude/GOVERNANCE_IMPLEMENTATION_SUMMARY.md .claude/docs/_historical/consolidation/
   ```

5. **Move Documentation Indexes**
   ```bash
   # Compare and merge or move
   mv .claude/MASTER_DOCUMENTATION_INDEX.md .claude/docs/_historical/
   # Handle INDEX.md based on comparison
   ```

6. **Move Governance Plan**
   ```bash
   mv .claude/DOCUMENTATION_GOVERNANCE_PLAN.md .claude/docs/coordination/
   ```

7. **Handle Naming Convention**
   ```bash
   # Compare with docs/architecture/FILE_ORGANIZATION_STANDARD.md
   # Merge or move to docs/architecture/
   ```

8. **Handle STRUCTURE.md**
   ```bash
   # Compare .claude/STRUCTURE.md with root STRUCTURE.md
   # Update .claude/STRUCTURE.md to reference root version
   # Or merge differences
   ```

### Option B: Minimal Cleanup

**Actions:**
1. Move historical files to `_historical/`
2. Move schema files to `database/postgres/schemas/`
3. Move documentation indexes
4. Keep everything else as-is

---

## Implementation Plan

### Phase 1: Analyze Files (High Priority)

1. **Compare STRUCTURE.md files**
   - Compare `.claude/STRUCTURE.md` vs root `STRUCTURE.md`
   - Determine canonical version
   - Merge or document differences

2. **Analyze Schema Files**
   - Read `GOLD_STANDARD_SCHEMA.md` files
   - Determine if database or architecture schema
   - Decide target location

3. **Review Naming Convention**
   - Compare with `FILE_ORGANIZATION_STANDARD.md`
   - Merge or keep separate

4. **Review data-schema/ SQL Files**
   - Categorize SQL files (migrations, seeds, queries)
   - Determine which should move to `database/postgres/`

### Phase 2: Move Files (High Priority)

1. Create `database/postgres/schemas/` directory
2. Move schema files
3. Move historical files
4. Move documentation indexes
5. Move governance plan
6. Handle SQL files from data-schema/

### Phase 3: Update References (Medium Priority)

1. Update all references to moved files
2. Update `.claude/README.md`
3. Update `CATALOGUE.md`
4. Update canonical docs

---

## Final Recommended Structure

```
.claude/
├── README.md                    # Command center overview (KEEP)
├── CLAUDE.md                    # Claude rules (KEEP)
├── VITAL.md                     # VITAL standards (KEEP)
├── EVIDENCE_BASED_RULES.md      # Evidence rules (KEEP)
├── AGENT_QUICK_START.md         # Agent onboarding (KEEP)
├── CATALOGUE.md                 # Master catalog (KEEP)
├── settings.local.json          # Settings (KEEP)
│
├── agents/                      # Agent definitions (KEEP)
│
└── docs/                        # Internal documentation
    ├── INDEX.md                 # Moved from root (if different)
    ├── _historical/             # Historical records
    │   └── consolidation/      # Consolidation history
    ├── coordination/            # AI coordination
    │   └── DOCUMENTATION_GOVERNANCE_PLAN.md  # Moved from root
    └── [other subdirectories]

[Project Root]
├── STRUCTURE.md                 # Project structure (canonical)
└── docs/
    └── architecture/
        └── FILE_ORGANIZATION_STANDARD.md  # Includes naming convention

database/postgres/
├── schemas/                     # NEW - Schema documentation
│   ├── GOLD_STANDARD_SCHEMA.md  # Moved from .claude/docs/
│   ├── GOLD_STANDARD_SCHEMA_ARD.md
│   ├── GOLD_STANDARD_COMPLETE.md
│   └── DATABASE_SCHEMA_COMPREHENSIVE_GUIDE.md
├── migrations/                 # SQL migrations (from data-schema/)
├── seeds/                       # SQL seeds (from data-schema/)
└── queries/                     # SQL queries (from data-schema/)
```

---

## Benefits

✅ **Clear Separation:** AI assistant config vs project docs  
✅ **Better Organization:** Schema files in logical locations  
✅ **Easier Navigation:** Historical files archived  
✅ **Consistent Structure:** Follows world-class patterns  
✅ **Database Assets Together:** All schema/docs with database

---

## Statistics

| Metric | Current | Recommended | Change |
|--------|---------|-------------|--------|
| Root-level files in .claude/ | 16 | 7 | ✅ Cleaner |
| Schema files location | `.claude/docs/` | `database/postgres/schemas/` | ✅ Logical |
| Historical files | Root | `_historical/` | ✅ Organized |
| SQL files in .claude/ | 100+ | 0 | ✅ Moved to database/ |

---

**Status:** ⚠️ Needs Reorganization  
**Priority:** High  
**Estimated Time:** 3-4 hours
