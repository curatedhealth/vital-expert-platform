# Database Directory Cleanup Plan

**Date:** December 14, 2025  
**Purpose:** Clean up `/database` and `/supabase` directories for production  
**Status:** ⚠️ Analysis Complete - Ready for Execution

---

## Current State Analysis

### `/database/` Directory
- **Migrations:** 292 SQL files (includes consolidated from supabase)
- **Seeds:** Multiple seed files
- **Policies:** RLS policies
- **Functions:** Postgres functions
- **Scripts:** Migration utilities
- **Status:** ✅ Single source of truth (after Phase 2 consolidation)

### `/supabase/` Directory
- **Migrations:** 84 SQL files (DUPLICATES - already in database/)
- **Seeds:** 3 SQL files (DUPLICATES - already in database/)
- **config.toml:** Supabase configuration (KEEP)
- **.branches/:** Supabase branching feature (KEEP)
- **.temp/:** Supabase temporary files (KEEP)
- **Status:** ⚠️ Contains duplicates + Supabase-specific configs

---

## Decision: Do We Need Both?

### Answer: **NO** - Consolidate to `/database/` but keep Supabase configs

**Rationale:**
1. ✅ Migrations already consolidated to `database/migrations/`
2. ✅ Seeds already consolidated to `database/seeds/`
3. ⚠️ `supabase/migrations/` and `supabase/seeds/` are now duplicates
4. ✅ `supabase/config.toml` is needed for Supabase CLI
5. ✅ `supabase/.branches/` is needed for Supabase branching
6. ✅ `supabase/.temp/` is needed for Supabase operations

---

## Cleanup Plan

### Phase 1: Remove Duplicate Migrations and Seeds

**Action:** Archive `supabase/migrations/` and `supabase/seeds/` since they're duplicates

```bash
# Archive duplicates (don't delete - keep for reference)
mv supabase/migrations archive/supabase-migrations-duplicates/
mv supabase/seeds archive/supabase-seeds-duplicates/
```

**Result:** `supabase/` will only contain Supabase-specific configs

### Phase 2: Update Script References

**Action:** Update scripts that reference `supabase/migrations/` to use `database/migrations/`

**Files to Update:**
- `database/shared/scripts/migrations/deploy-user-panels-migrations.sh` (line 88)
- `database/postgres/apply-panels-migration.md` (lines 7, 10, 31, 32)
- `scripts/apply-agent-tenant-migration.js` (line 5)
- Any other scripts referencing `supabase/migrations/`

### Phase 3: Verify Supabase CLI Compatibility

**Action:** Ensure Supabase CLI can work with `database/migrations/`

**Options:**
1. **Symlink approach:** `ln -s ../database/migrations supabase/migrations`
2. **Config approach:** Update `supabase/config.toml` to point to `database/migrations/`
3. **Script approach:** Update deployment scripts to copy from `database/` to `supabase/` before `supabase db push`

**Recommended:** Option 3 (script approach) - Most explicit and maintainable

---

## Final Structure

### After Cleanup

```
database/                          # ✅ Single source of truth
├── migrations/                    # All migrations (292 files)
├── seeds/                         # All seeds
├── policies/                      # RLS policies
├── functions/                     # Postgres functions
├── scripts/                       # Migration utilities
└── [other database assets]

supabase/                          # ✅ Supabase-specific only
├── config.toml                    # Supabase configuration (KEEP)
├── .branches/                     # Supabase branching (KEEP)
├── .temp/                         # Supabase temp files (KEEP)
└── .gitignore                     # Supabase gitignore (KEEP)
```

---

## Execution Steps

### Step 1: Archive Duplicates

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Create archive directory
mkdir -p archive/supabase-duplicates

# Archive migrations (they're already in database/migrations/)
mv supabase/migrations archive/supabase-duplicates/migrations

# Archive seeds (they're already in database/seeds/)
mv supabase/seeds archive/supabase-duplicates/seeds
```

### Step 2: Update Script References

**Files to update:**
1. `database/shared/scripts/migrations/deploy-user-panels-migrations.sh`
2. `database/postgres/apply-panels-migration.md`
3. `scripts/apply-agent-tenant-migration.js`

**Change:** `supabase/migrations/` → `database/migrations/`

### Step 3: Create Migration Sync Script (Optional)

**For Supabase CLI compatibility:**

Create `database/shared/scripts/migrations/sync-migrations-to-supabase.sh`:

```bash
#!/bin/bash
# Sync database/migrations/ to supabase/migrations/ for Supabase CLI
cp -r database/migrations/* supabase/migrations/ 2>/dev/null || true
cp -r database/seeds/* supabase/seeds/ 2>/dev/null || true
```

**Usage:** Run before `supabase db push`

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking Supabase CLI | HIGH | Test `supabase db push` after cleanup |
| Lost migrations | LOW | Already backed up in database/ |
| Script failures | MEDIUM | Update all script references |

---

## Verification Checklist

- [ ] `supabase/migrations/` archived
- [ ] `supabase/seeds/` archived
- [ ] `supabase/config.toml` still exists
- [ ] `supabase/.branches/` still exists
- [ ] All script references updated
- [ ] Supabase CLI still works (test `supabase db push`)

---

## Benefits

✅ **Single source of truth:** `database/` is the only place for migrations/seeds  
✅ **Cleaner structure:** `supabase/` only contains Supabase-specific configs  
✅ **Easier maintenance:** No duplicate files to keep in sync  
✅ **Clear separation:** Database assets vs Supabase tooling

---

**Status:** Ready for execution  
**Estimated Time:** 30 minutes  
**Risk Level:** Medium (requires script updates)
