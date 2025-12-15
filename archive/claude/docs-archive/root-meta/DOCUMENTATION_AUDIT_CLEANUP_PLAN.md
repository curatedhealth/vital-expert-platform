# Documentation Audit & Cleanup Plan

**Date**: December 5, 2025  
**Status**: 🚨 CRITICAL CLEANUP REQUIRED  
**Estimated Savings**: ~90% storage reduction (removing ~8,000+ redundant files)

---

## 🚨 Executive Summary

Your `.claude/docs` directory has grown organically but now contains:

| Issue | Impact | Files Affected |
|-------|--------|----------------|
| **Duplicate SQL files** | 1,322 SQL files in docs (should be in `database/`) | ~1,300 files |
| **Nested legacy structures** | `.claude/.claude/`, `.vital-command-center/`, `.vital-docs/` | ~7,800+ files |
| **Architecture folder bloat** | 901 files including 565 SQL files | ~565 SQL files |
| **Platform folder bloat** | 1,582 files including 757 SQL files | ~757 SQL files |
| **Deep nesting recursion** | `enterprise_ontology/architecture/` contains another full copy | ~845 files |

**Total redundant files estimate**: ~8,000-10,000 files

---

## 🔍 Detailed Audit Findings

### 1. CRITICAL: Legacy Nested Structures (DELETE)

These folders appear to be previous iterations that were never cleaned up:

```
.claude/
├── .claude/                    # ⚠️ NESTED DUPLICATE (342 files)
│   ├── agents/                 # Duplicate of .claude/agents/
│   ├── archive/                # 162 files - old archived content
│   ├── strategy-docs/          # 13 files - duplicate strategies
│   └── vital-expert-docs/      # 65 files - duplicate expert docs
│
├── .vital-command-center/      # ⚠️ OLD COMMAND CENTER (7,197 files!)
│   ├── 00-STRATEGIC/           # 16 files
│   ├── 01-TEAM/                # 26 files
│   ├── 02-PLATFORM-ASSETS/     # 43 files
│   ├── 03-SERVICES/            # 64 files
│   ├── 04-TECHNICAL/           # 819 files (554 SQL!)
│   ├── 05-OPERATIONS/          # 10 files
│   ├── 07-TOOLING/             # 337 files (scripts)
│   ├── 08-ARCHIVES/            # 5,534 files! (mostly archived)
│   └── skills-main/            # 253 files
│
└── .vital-docs/                # ⚠️ OLD DOCS LOCATION (282 files)
    ├── agents/                 # 166 files - duplicate agents
    ├── data-strategy/          # 2 files
    ├── security/               # 2 files
    └── vital-expert-docs/      # 20 files - duplicates
```

**Recommendation**: Archive to `_archive_legacy/` or DELETE entirely

---

### 2. SQL Files in Documentation (RELOCATE)

SQL files should be in `database/` not in documentation:

| Location | SQL Files | Action |
|----------|-----------|--------|
| `docs/architecture/data-schema/` | 550 SQL | Move to `database/migrations/` |
| `docs/platform/enterprise_ontology/` | 646 SQL | Move to `database/ontology/` |
| `docs/platform/prompts/migrations/` | 28 SQL | Move to `database/prompts/` |
| `docs/platform/agents/sql-seeds/` | 12 SQL | Move to `database/agents/` |
| Other scattered | ~100 SQL | Consolidate |

**Total**: ~1,322 SQL files in docs → should be ~0

---

### 3. Deep Nesting Issue

`enterprise_ontology/architecture/` contains 845 files which is essentially a COPY of the root architecture:

```
docs/platform/enterprise_ontology/
└── architecture/               # 845 files (565 SQL, 237 MD)
    └── data-schema/            # Another copy of data-schema!
        └── vital-expert-data-schema/  # Yet another copy!
```

**This is recursive duplication!**

---

### 4. Diagnostic/Temporary Files (DELETE)

Found in various locations:
- `docs/platform/enterprise_ontology/_archive/temp_scripts/` - 18 temp scripts
- Various `fix_*.sql`, `check_*.sql`, `diagnose_*.sql` files scattered
- `reset_*.sql` files in multiple locations

---

## ✅ Recommended Clean Structure

```
.claude/
├── 📜 ROOT FILES (Keep - Core Governance)
│   ├── CLAUDE.md
│   ├── VITAL.md
│   ├── EVIDENCE_BASED_RULES.md
│   ├── NAMING_CONVENTION.md
│   ├── CATALOGUE.md
│   ├── README.md
│   ├── STRUCTURE.md
│   ├── AGENT_QUICK_START.md
│   └── DOCUMENTATION_GOVERNANCE_PLAN.md
│
├── 🤖 agents/                  (Keep - 14 production agents)
│
└── 📁 docs/                    (Reorganize - documentation only)
    ├── architecture/           (~50 MD files max, NO SQL)
    │   ├── VITAL_WORLD_CLASS_STRUCTURE_FINAL.md
    │   ├── api/
    │   ├── backend/
    │   └── frontend/
    │
    ├── platform/               (~300 MD files max, NO SQL)
    │   ├── agents/             (Agent MD files only)
    │   ├── personas/           (Persona MD files only)
    │   ├── jtbds/              (JTBD MD files only)
    │   ├── workflows/
    │   ├── prompts/            (Prompt templates only, NO SQL)
    │   ├── rls/                (RLS documentation)
    │   └── users/
    │
    ├── services/               (~45 MD files)
    │
    ├── strategy/               (~25 MD files)
    │
    ├── operations/             (~15 files)
    │
    ├── testing/                (~5 MD files)
    │
    ├── coordination/           (~14 MD files)
    │
    └── brand/                  (~5 MD files)

# SQL FILES GO HERE:
database/
├── migrations/                 (Numbered migrations)
├── seeds/                      (Data seeds)
├── functions/                  (Postgres functions)
├── policies/                   (RLS policies)
├── ontology/                   (Ontology-specific SQL)
├── agents/                     (Agent-related SQL)
└── prompts/                    (Prompt SQL seeds)
```

---

## 🛠️ Cleanup Execution Plan

### Phase 1: Archive Legacy Structures (IMMEDIATE)

```bash
# Create archive directory
mkdir -p /path/.claude/_archive_legacy_$(date +%Y%m%d)

# Move legacy nested structures
mv .claude/.claude .claude/_archive_legacy_$(date +%Y%m%d)/
mv .claude/.vital-command-center .claude/_archive_legacy_$(date +%Y%m%d)/
mv .claude/.vital-docs .claude/_archive_legacy_$(date +%Y%m%d)/
```

**Files affected**: ~7,800+
**Risk**: Low (these appear to be old copies)

---

### Phase 2: Consolidate SQL Files

1. Create proper database structure:
```bash
mkdir -p database/{migrations,seeds,functions,policies,ontology,agents,prompts}
```

2. Move SQL from docs to database:
```bash
# Example - do carefully with verification
find .claude/docs -name "*.sql" -exec mv {} database/migrations/ \;
```

**Files affected**: ~1,322
**Risk**: Medium (verify no active references first)

---

### Phase 3: Flatten Deep Nesting

Remove recursive copies:
```bash
# After verifying content is duplicate
rm -rf docs/platform/enterprise_ontology/architecture/
```

**Files affected**: ~845
**Risk**: Medium (verify duplicates first)

---

### Phase 4: Clean Temporary Files

```bash
# Remove temp scripts
rm -rf docs/platform/enterprise_ontology/_archive/

# Remove diagnostic SQL
find .claude/docs -name "check_*.sql" -delete
find .claude/docs -name "diagnose_*.sql" -delete
find .claude/docs -name "fix_*.sql" -delete
find .claude/docs -name "reset_*.sql" -delete
find .claude/docs -name "tmp_*.py" -delete
find .claude/docs -name "tmp_*.sh" -delete
```

---

## ⚠️ Before Cleanup Checklist

- [ ] Confirm `.vital-command-center/08-ARCHIVES/` content is truly archived
- [ ] Verify no active scripts reference SQL files in docs
- [ ] Check if any SQL files are "canonical" (not in database yet)
- [ ] Backup `.claude/` directory before any deletions
- [ ] Review `skills-main/` folder - appears to be project dependency

---

## 📊 Expected Results After Cleanup

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total files in `.claude/` | ~10,000+ | ~600 | 94% |
| SQL files in docs | 1,322 | 0 | 100% |
| Documentation folders | 12+ | 8 | 33% |
| Nested duplicates | 3 | 0 | 100% |

---

## 🎯 Immediate Actions Required

### DO NOW:
1. **Confirm** `.vital-command-center` is legacy (check git history)
2. **Confirm** `.claude/.claude` is duplicate (compare to root)
3. **Identify** which SQL files are "source of truth" vs copies

### ASK USER:
1. Is `.vital-command-center/` still in use?
2. Are there any SQL files that should NOT be moved?
3. Should we archive or permanently delete legacy content?

---

## 📝 Notes

- The `rag docs/` folder (541 files, 488 PDFs) should probably be in a separate asset storage, not in `.claude/docs`
- Some SQL files appear to be "migrations" that should follow a numbered convention
- The `skills-main/` folder appears to be a separate project/dependency

---

**Created by**: Claude Code  
**For**: Documentation cleanup initiative  
**Next step**: User confirmation on legacy folder status
