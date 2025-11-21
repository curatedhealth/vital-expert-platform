# VITAL Platform - Project Root Cleanup EXECUTION PLAN
**Date**: 2025-11-19
**Architect**: Strategy & Vision Architect
**Status**: Awaiting Approval

---

## Overview

This plan details the step-by-step execution of the VITAL project root cleanup, reducing root clutter by 50% (from 84 to 42 items) while organizing all files according to gold-standard practices.

---

## Pre-Execution Checklist

- [ ] Backup current state: `git commit -am "Pre-cleanup checkpoint"`
- [ ] Verify all tests pass: `npm test` or equivalent
- [ ] Document current git branch and status
- [ ] Create dated archive directory: `/archive/2025-11-19-root-cleanup/`
- [ ] Review analysis document: `.claude/PROJECT_ROOT_CLEANUP_ANALYSIS.md`

---

## Phase 1: Create Directory Structure

### 1.1 Database Scripts Organization

```bash
# Create new subdirectories in /database/scripts/
mkdir -p /Users/amine/desktop/vital/database/scripts/admin
mkdir -p /Users/amine/desktop/vital/database/scripts/maintenance
mkdir -p /Users/amine/desktop/vital/database/scripts/migrations
mkdir -p /Users/amine/desktop/vital/database/scripts/multitenancy
mkdir -p /Users/amine/desktop/vital/database/scripts/utilities
mkdir -p /Users/amine/desktop/vital/database/data/agents/gold_standard
```

### 1.2 Archive Structure

```bash
# Create dated archive directories
mkdir -p /Users/amine/desktop/vital/archive/2025-11-19-root-cleanup/documentation
mkdir -p /Users/amine/desktop/vital/archive/2025-11-19-root-cleanup/agent-data
mkdir -p /Users/amine/desktop/vital/archive/2025-11-19-root-cleanup/sql-legacy
```

### 1.3 Scripts Organization

```bash
# Create script subdirectories (if not exist)
mkdir -p /Users/amine/desktop/vital/scripts/deployment
mkdir -p /Users/amine/desktop/vital/scripts/setup
mkdir -p /Users/amine/desktop/vital/scripts/development
mkdir -p /Users/amine/desktop/vital/scripts/utilities/admin
mkdir -p /Users/amine/desktop/vital/scripts/utilities/database
```

**Verification**: Run `tree -L 3 database/ scripts/` to verify structure

---

## Phase 2: Move Documentation Files

### 2.1 Strategy Documentation (3 files)

```bash
# Move to .claude/vital-expert-docs/01-strategy/
git mv DATA_STRATEGY_ASSESSMENT_MULTITENANCY.md .claude/vital-expert-docs/01-strategy/
git mv DATA_STRATEGY_EXECUTIVE_SUMMARY.md .claude/vital-expert-docs/01-strategy/
git mv MIGRATION_STRATEGY.md .claude/vital-expert-docs/01-strategy/
```

### 2.2 Architecture Documentation (1 file)

```bash
# Move to .claude/vital-expert-docs/05-architecture/
git mv APPS_COMPARISON.md .claude/vital-expert-docs/05-architecture/
```

### 2.3 Product Documentation (1 file)

```bash
# Move to .claude/vital-expert-docs/03-product/
git mv SIDEBAR_VISUAL_GUIDE.md .claude/vital-expert-docs/03-product/
```

### 2.4 Implementation Documentation (7 files)

```bash
# Move to .claude/vital-expert-docs/07-implementation/
git mv MIGRATION_EXECUTION_GUIDE.md .claude/vital-expert-docs/07-implementation/
git mv MULTITENANCY_SETUP_COMPLETE.md .claude/vital-expert-docs/07-implementation/
git mv SUBDOMAIN_MULTITENANCY_IMPLEMENTATION.md .claude/vital-expert-docs/07-implementation/
git mv SUBDOMAIN_MULTITENANCY_SETUP.md .claude/vital-expert-docs/07-implementation/

# Move deployment docs to subdirectory
git mv DEPLOYMENT_SUMMARY.md .claude/vital-expert-docs/07-implementation/deployment-guides/
```

### 2.5 Archive Historical Documentation (6 files)

```bash
# Archive completion reports
git mv DOCUMENTATION_CLEANUP_COMPLETE.md archive/2025-11-19-root-cleanup/documentation/
git mv PHASE1_IMPLEMENTATION_COMPLETE.md archive/2025-11-19-root-cleanup/documentation/
git mv PHASE_2_SUMMARY.md archive/2025-11-19-root-cleanup/documentation/
git mv SIDEBAR_ENHANCEMENTS_COMPLETED.md archive/2025-11-19-root-cleanup/documentation/
git mv SIDEBAR_FEATURES_CHECKLIST.md archive/2025-11-19-root-cleanup/documentation/
git mv SIDEBAR_PHASE_2_COMPLETED.md archive/2025-11-19-root-cleanup/documentation/
git mv TENANT_SWITCHER_FIXES_APPLIED.md archive/2025-11-19-root-cleanup/documentation/
```

**Verification**: Run `ls -1 *.md` and verify only `README.md` and `VITAL.md` remain

---

## Phase 3: Organize Database Files

### 3.1 Move Root SQL Scripts (7 files)

```bash
# Multitenancy scripts
git mv add_tenant_to_knowledge.sql database/scripts/multitenancy/
git mv complete_tenant_mapping.sql database/scripts/multitenancy/
git mv set_allowed_tenants.sql database/scripts/multitenancy/

# Migration scripts
git mv duplicate_for_pharma.sql database/scripts/migrations/

# Admin scripts
git mv make_super_admins.sql database/scripts/admin/

# Maintenance scripts
git mv remove_duplicates.sql database/scripts/maintenance/

# Utility scripts
git mv run_in_supabase_sql_editor.sql database/scripts/utilities/
```

### 3.2 Consolidate /sql/ Directory

**CRITICAL DECISION POINT**: The `/sql/` directory contains:
- 20 migration files (overlap with `/supabase/migrations/` and `/database/migrations/`)
- 7 seed files
- 20+ tenant/sharing scripts
- 4 tool scripts
- 9 documentation files

**Recommended Action**: ARCHIVE entire `/sql/` directory

```bash
# Archive legacy /sql/ directory
git mv sql/ archive/2025-11-19-root-cleanup/sql-legacy/

# Note: Verify no active dependencies before executing
# Check references: grep -r "sql/" apps/ packages/ --include="*.ts" --include="*.js"
```

**Alternative (Conservative)**: If dependencies found, merge selectively:

```bash
# Merge seeds into /database/seeds/
cp -r sql/seeds/* database/seeds/

# Merge useful scripts into /database/sql/
cp sql/*.sql database/sql/

# Then archive original
git mv sql/ archive/2025-11-19-root-cleanup/sql-legacy/
```

**Verification**:
- Check `grep -r "sql/" apps/ packages/ services/` for hardcoded paths
- Update any found references to new paths

---

## Phase 4: Consolidate Scripts

### 4.1 Move Shell Scripts (5 files)

```bash
# Deployment scripts
git mv fix-subdomains.sh scripts/deployment/
git mv setup-subdomains.sh scripts/deployment/

# Setup scripts
git mv install-observability.sh scripts/setup/
git mv setup-env.sh scripts/setup/

# Development scripts
git mv start-all-services.sh scripts/development/
```

### 4.2 Move JavaScript Utilities (2 files)

```bash
# Admin utilities
git mv make_amine_admin.js scripts/utilities/admin/

# Database utilities
git mv test_supabase_connection.js scripts/utilities/database/
```

**Verification**: Run `ls -1 *.sh *.js` and verify only `.eslintrc.js` remains

---

## Phase 5: Organize Agent Data Files

### 5.1 Preserve Gold Standard Data

```bash
# Move gold standard to permanent location
git mv enhanced_agents_gold_standard.json database/data/agents/gold_standard/
```

### 5.2 Archive Analysis Artifacts (6 files)

```bash
# Archive agent analysis data
git mv agent_capabilities_analysis.json archive/2025-11-19-root-cleanup/agent-data/
git mv agent_organizational_mappings.json archive/2025-11-19-root-cleanup/agent-data/
git mv agent_prompt_starters_mapping.json archive/2025-11-19-root-cleanup/agent-data/
git mv agent_prompt_starters_mapping_complete.json archive/2025-11-19-root-cleanup/agent-data/
git mv agent_reclassification_results.json archive/2025-11-19-root-cleanup/agent-data/
git mv agent_prompt_starters.csv archive/2025-11-19-root-cleanup/agent-data/
```

**Verification**: Run `ls -1 *.json *.csv` and verify only `package.json` and `tsconfig.json` remain

---

## Phase 6: Clean Up System Files

### 6.1 Delete Temporary/Generated Files

```bash
# Delete macOS metadata
rm .DS_Store

# Delete empty files
rm pnpm
rm vital-path@1.0.0

# Delete build cache
rm tsconfig.tsbuildinfo
```

### 6.2 Update .gitignore

Add the following to `.gitignore`:

```
# Build artifacts
*.tsbuildinfo
dist/
build/

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/

# Logs
*.log
logs/
*.log.*

# Environment
.env
.env.local
.env.*.local
```

**Verification**: Run `git status` to ensure ignored files are not tracked

---

## Phase 7: Update Documentation

### 7.1 Create Archive README

Create `/archive/2025-11-19-root-cleanup/README.md`:

```markdown
# Root Cleanup Archive - 2025-11-19

This directory contains files moved during the project root cleanup initiative.

## Contents

### documentation/
Completion reports and historical documentation from root directory.

### agent-data/
Agent analysis artifacts (JSON/CSV) from agent classification work.

### sql-legacy/
Legacy `/sql/` directory with migrations, seeds, and scripts.

## Reason for Archival

These files were moved to:
1. Reduce root directory clutter (84 → 42 items)
2. Organize by gold-standard project structure
3. Preserve historical artifacts without active use

## Restoration

If any file is needed:
```bash
git log -- archive/2025-11-19-root-cleanup/<file>
git checkout <commit> -- <original-path>
```

## Related Documents

- Analysis: `.claude/PROJECT_ROOT_CLEANUP_ANALYSIS.md`
- Execution Plan: `.claude/PROJECT_ROOT_CLEANUP_PLAN.md`
- Report: `.claude/vital-expert-docs/07-implementation/PROJECT_ROOT_CLEANUP_REPORT.md`
```

### 7.2 Update /database/README.md

Add section about new script organization:

```markdown
## Scripts Organization

Database scripts are organized by category:

- `scripts/admin/` - Administrative setup (super admin, user management)
- `scripts/maintenance/` - Database maintenance (cleanup, optimization)
- `scripts/migrations/` - One-time migration scripts
- `scripts/multitenancy/` - Tenant setup and management
- `scripts/utilities/` - General database utilities
```

### 7.3 Update /scripts/README.md

Document the addition of root scripts to organized structure.

---

## Phase 8: Verification & Testing

### 8.1 File Structure Verification

```bash
# Verify root cleanup
ls -la /Users/amine/desktop/vital | wc -l
# Expected: ~45 items (down from 84)

# Verify documentation organized
find .claude/vital-expert-docs -name "*.md" | wc -l

# Verify database scripts
ls -la database/scripts/*/

# Verify archive
ls -la archive/2025-11-19-root-cleanup/*/
```

### 8.2 Functional Testing

```bash
# Test environment setup
./scripts/setup/setup-env.sh

# Test service startup
./scripts/development/start-all-services.sh

# Run test suite
npm test
# or
pnpm test
```

### 8.3 Path Reference Verification

```bash
# Check for broken references
grep -r "sql/" apps/ packages/ services/ --include="*.ts" --include="*.js"
grep -r "scripts/" apps/ packages/ --include="*.ts" --include="*.js"

# Check import statements
grep -r "import.*\.sql" apps/ packages/
grep -r "import.*\.sh" apps/ packages/
```

### 8.4 Git Status Check

```bash
# Verify clean working tree
git status

# Review all changes
git diff --cached --stat

# Review specific file moves
git log --follow --oneline -- <file>
```

---

## Phase 9: Documentation Deliverables

### 9.1 Create PROJECT_ROOT_CLEANUP_REPORT.md

Location: `.claude/vital-expert-docs/07-implementation/PROJECT_ROOT_CLEANUP_REPORT.md`

Contents:
- Executive summary of cleanup
- Before/after comparison
- Complete file inventory with actions taken
- Verification results
- Recommendations for maintenance

### 9.2 Create PROJECT_STRUCTURE_GOLD_STANDARD.md

Location: `.claude/vital-expert-docs/05-architecture/PROJECT_STRUCTURE_GOLD_STANDARD.md`

Contents:
- Gold-standard directory structure
- Purpose of each directory
- File organization rules
- Naming conventions
- Examples and anti-patterns

### 9.3 Create DATABASE_FILES_ORGANIZATION.md

Location: `.claude/vital-expert-docs/07-implementation/DATABASE_FILES_ORGANIZATION.md`

Contents:
- Database file structure
- Migration strategy
- Script categorization guide
- Seed data management
- Backup procedures

---

## Phase 10: Git Commit & Finalization

### 10.1 Commit Strategy

```bash
# Stage documentation moves
git add .claude/vital-expert-docs/

# Stage database reorganization
git add database/

# Stage scripts reorganization
git add scripts/

# Stage archive
git add archive/2025-11-19-root-cleanup/

# Stage deletions and .gitignore
git add .gitignore

# Commit with detailed message
git commit -m "Project root cleanup: Gold-standard structure

- Moved 17 markdown docs to .claude/vital-expert-docs/
- Organized 7 SQL scripts into database/scripts/ categories
- Consolidated 5 shell scripts into scripts/ subdirectories
- Moved 2 JS utilities to scripts/utilities/
- Archived 13 files to dated archive directory
- Preserved agent gold standard in database/data/
- Deleted 4 temporary/generated files
- Updated .gitignore for build artifacts

Root directory reduced from 84 to 42 items (50% reduction)

See .claude/PROJECT_ROOT_CLEANUP_ANALYSIS.md for full details"
```

### 10.2 Create Git Tag

```bash
# Tag this milestone
git tag -a v1.0-root-cleanup -m "Gold-standard project root structure"
```

### 10.3 Final Verification

```bash
# Ensure clean state
git status

# Verify tag
git tag -l -n1 v1.0-root-cleanup

# Check recent commits
git log --oneline -5
```

---

## Rollback Plan (If Needed)

If issues arise during execution:

```bash
# Soft rollback (keep changes, unstage)
git reset HEAD~1

# Hard rollback (discard all changes)
git reset --hard HEAD~1

# Restore specific file
git checkout HEAD -- <file-path>

# Restore from archive
cp archive/2025-11-19-root-cleanup/<category>/<file> <original-location>
```

---

## Post-Execution Tasks

### Immediate
- [ ] Update team documentation
- [ ] Notify developers of structure changes
- [ ] Update CI/CD if path-dependent
- [ ] Update any deployment scripts with path references

### Short-term (Week 1)
- [ ] Monitor for broken references
- [ ] Address any path-related issues
- [ ] Update onboarding documentation

### Long-term (Month 1)
- [ ] Establish file organization standards
- [ ] Create pre-commit hook to prevent root clutter
- [ ] Document maintenance procedures

---

## Success Criteria

- ✅ Root directory reduced to 42 items (< 50 items)
- ✅ All documentation in `.claude/vital-expert-docs/`
- ✅ All database scripts categorized
- ✅ All shell scripts in `/scripts/` subdirectories
- ✅ Agent data preserved and organized
- ✅ Historical files archived with date
- ✅ All tests pass
- ✅ No broken path references
- ✅ Git history preserved
- ✅ Comprehensive documentation created

---

## Risk Mitigation Summary

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Broken path references | Medium | High | Grep search before/after, testing |
| Lost git history | Low | High | Use `git mv` exclusively |
| Service disruption | Low | Medium | Test all services after reorganization |
| Confusion during transition | Medium | Low | Clear documentation, team notification |
| Accidental deletion | Low | High | Archive instead of delete, git tracking |

---

## Approval Required

**Before proceeding with execution:**

- [ ] Review analysis document (`.claude/PROJECT_ROOT_CLEANUP_ANALYSIS.md`)
- [ ] Review this execution plan
- [ ] Confirm no active development blockers
- [ ] Approve archival of `/sql/` directory (critical decision)
- [ ] Approve deletion of 4 system files
- [ ] Schedule execution window (low-activity period)

**Approved by**: _________________ **Date**: _________

---

## Execution Checklist

- [ ] Phase 1: Create directory structure
- [ ] Phase 2: Move documentation files (17 files)
- [ ] Phase 3: Organize database files (7+ files)
- [ ] Phase 4: Consolidate scripts (7 files)
- [ ] Phase 5: Organize agent data (7 files)
- [ ] Phase 6: Clean up system files (4 files)
- [ ] Phase 7: Update documentation
- [ ] Phase 8: Verification & testing
- [ ] Phase 9: Create deliverable documents
- [ ] Phase 10: Git commit & finalization

**Estimated Time**: 2-3 hours (with testing)
**Recommended Execution**: Outside peak development hours
