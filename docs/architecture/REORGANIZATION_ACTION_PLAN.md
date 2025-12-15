# VITAL Platform - Reorganization Action Plan

**Version:** 1.0  
**Date:** December 14, 2025  
**Based On:** [`PRODUCTION_STRUCTURE_AUDIT.md`](./PRODUCTION_STRUCTURE_AUDIT.md)  
**Purpose:** Quick reference for reorganization tasks

---

## Quick Summary

**Overall Status:** B (78/100) - Good structure with cleanup needed  
**Priority Actions:** 8 HIGH priority items  
**Estimated Time:** 2-3 days

---

## Phase 1: Root Directory Cleanup (HIGH Priority)

### 1.1 Remove/Move Root-Level Artifacts

```bash
# 1. Handle backend/ folder
# Check if it's duplicate of services/ai-engine/
# If duplicate: mv backend/ archive/backend/
# If different: Document purpose and keep

# 2. Handle venv/
# Option A: Move to services/ai-engine/
mv venv/ services/ai-engine/.venv

# Option B: Add to .gitignore (if per-developer)
echo "venv/" >> .gitignore
rm -rf venv/

# 3. Handle logs/ and htmlcov/
echo "logs/" >> .gitignore
echo "htmlcov/" >> .gitignore
# Or move to infrastructure/logs/ if needed

# 4. Move monitoring/
mv monitoring/ infrastructure/monitoring/

# 5. Move documentation files
mv ASK_PANEL_SERVICES_GUIDE.md docs/guides/
```

**Time Estimate:** 1-2 hours

---

## Phase 2: Database Consolidation (HIGH Priority)

### 2.1 Consolidate to `database/` as Source of Truth

```bash
# 1. Backup current state
cp -r supabase/migrations/ supabase/migrations_backup/
cp -r supabase/seeds/ supabase/seeds_backup/

# 2. Move migrations
mv supabase/migrations/* database/postgres/migrations/ 2>/dev/null || true

# 3. Move seeds
mv supabase/seeds/* database/postgres/seeds/ 2>/dev/null || true

# 4. Verify no duplicates
# Check migration timestamps to avoid conflicts

# 5. Update deployment scripts
# Update any scripts that reference supabase/migrations/
# to use database/migrations/ instead
```

**Time Estimate:** 2-3 hours

---

## Phase 3: Documentation Updates (MEDIUM Priority)

### 3.1 Fix Naming Inconsistencies

```bash
# Update all references from apps/web to apps/vital-system
# Files to update:
# - docs/architecture/VITAL_WORLD_CLASS_STRUCTURE_FINAL.md (line 163)
# - docs/architecture/versions/WORLD_CLASS_PROJECT_STRUCTURE.md
```

**Time Estimate:** 30 minutes

### 3.2 Document Undocumented Services

**Services to Document:**
1. `services/api-gateway/` - Determine if active or deprecated
2. `services/shared-kernel/` - Document as shared Python library
3. All packages in `packages/` - Add purpose and usage

**Time Estimate:** 2-3 hours

---

## Phase 4: Verification (MEDIUM Priority)

### 4.1 Run Verification Checks

```bash
# 1. TypeScript check
cd apps/vital-system && npx tsc --noEmit

# 2. Python linting
cd services/ai-engine && ruff check .

# 3. Test suite
pnpm test

# 4. Build verification
cd apps/vital-system && pnpm build
cd services/ai-engine && poetry build
```

**Time Estimate:** 1-2 hours

---

## Checklist

### Phase 1: Root Cleanup
- [ ] Handle `backend/` folder (archive or document)
- [ ] Move or ignore `venv/`
- [ ] Add `logs/` to `.gitignore`
- [ ] Add `htmlcov/` to `.gitignore`
- [ ] Move `monitoring/` to `infrastructure/monitoring/`
- [ ] Move `ASK_PANEL_SERVICES_GUIDE.md` to `docs/guides/`

### Phase 2: Database Consolidation
- [ ] Backup `supabase/migrations/` and `supabase/seeds/`
- [x] Move migrations to `database/postgres/migrations/` ✅
- [x] Move seeds to `database/postgres/seeds/` ✅
- [ ] Verify no duplicate migration timestamps
- [ ] Update deployment scripts to use `database/`
- [ ] Test migration process

### Phase 3: Documentation
- [ ] Fix `apps/web` → `apps/vital-system` in all docs
- [ ] Document `services/api-gateway/` status
- [ ] Document `services/shared-kernel/`
- [ ] Document all packages in `packages/`

### Phase 4: Verification
- [ ] TypeScript compilation succeeds
- [ ] Python linting passes
- [ ] All tests pass
- [ ] Build processes work
- [ ] Deployment scripts updated

---

## Estimated Timeline

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1** | Root cleanup | 1-2 hours | HIGH |
| **Phase 2** | Database consolidation | 2-3 hours | HIGH |
| **Phase 3** | Documentation updates | 2-3 hours | MEDIUM |
| **Phase 4** | Verification | 1-2 hours | MEDIUM |
| **Total** | All phases | **6-10 hours** | |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking migration scripts | HIGH | Backup first, test thoroughly |
| Losing duplicate code | MEDIUM | Verify before removing `backend/` |
| Documentation inconsistencies | LOW | Use find/replace carefully |

---

## Success Criteria

✅ Root directory clean (no artifacts)  
✅ Database structure consolidated  
✅ All documentation accurate  
✅ All builds and tests pass  
✅ Ready for production deployment

---

**See Also:**
- [PRODUCTION_STRUCTURE_AUDIT.md](./PRODUCTION_STRUCTURE_AUDIT.md) - Full audit details
- [DEPLOYMENT_CHECKLIST.md](../guides/DEPLOYMENT_CHECKLIST.md) - Deployment guide
