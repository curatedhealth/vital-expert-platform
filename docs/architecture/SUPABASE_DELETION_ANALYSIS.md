# Supabase Directory Deletion Analysis

**Date:** December 14, 2025  
**Question:** Can we safely delete `/supabase/` directory?  
**Answer:** ❌ **NO** - Required for Supabase CLI operations

---

## Current Contents

```
supabase/
├── config.toml          # Supabase CLI configuration (REQUIRED)
├── .branches/           # Supabase branching feature
├── .temp/               # Supabase temporary files (used by scripts)
└── .gitignore           # Supabase gitignore
```

---

## Why We Cannot Delete `/supabase/`

### 1. Supabase CLI Requirement ✅

**Supabase CLI requires `supabase/config.toml` at root** (or use `--workdir` flag)

**Evidence:**
- `config.toml` contains project configuration
- CLI commands like `supabase db push` expect this file
- Default location is `supabase/config.toml` at project root

**Alternative:** Can use `--workdir` flag, but requires updating all scripts

### 2. Script Dependencies ✅

**Scripts check for Supabase directory:**

1. **`database/shared/scripts/migrations/apply-user-panels-migration.sh`** (line 32)
   ```bash
   if [ ! -f "supabase/.temp/project-ref" ]; then
   ```
   - Checks for `.temp/project-ref` file
   - Used to verify Supabase project linking

2. **`database/shared/scripts/migrations/sync-migrations-to-supabase.sh`**
   - Creates `supabase/migrations/` and `supabase/seeds/` dynamically
   - Required for `supabase db push` compatibility

3. **`Makefile`** (lines 134, 143, 149, 156)
   ```makefile
   supabase db push
   supabase db seed
   supabase db reset
   supabase db execute --file
   ```
   - Multiple Makefile targets use Supabase CLI
   - All require `supabase/config.toml`

### 3. Deployment Workflow ✅

**Supabase CLI is used for:**
- Local development: `supabase start`
- Database migrations: `supabase db push`
- Database seeding: `supabase db seed`
- Project linking: `supabase link`

**All require `supabase/config.toml`**

---

## Options

### Option A: Keep `/supabase/` (✅ RECOMMENDED)

**Keep for:**
- `config.toml` - CLI configuration
- `.branches/` - Branching feature
- `.temp/` - Temporary files (used by scripts)
- `.gitignore` - Supabase-specific ignores

**Structure:**
```
supabase/                    # Supabase CLI tooling
├── config.toml              # CLI configuration (KEEP)
├── .branches/               # Branching (KEEP)
├── .temp/                   # Temp files (KEEP)
└── .gitignore               # Gitignore (KEEP)

# Migrations/seeds created dynamically by sync script
supabase/migrations/         # Created by sync script
supabase/seeds/              # Created by sync script
```

**Benefits:**
- ✅ No script changes needed
- ✅ Standard Supabase CLI workflow
- ✅ Works out of the box

### Option B: Move to Custom Location (⚠️ Complex)

**Use `--workdir` flag:**
```bash
supabase db push --workdir infrastructure/supabase
```

**Requirements:**
- Update all scripts to use `--workdir`
- Update Makefile targets
- Update documentation
- More complex, less standard

**Not Recommended:** Adds complexity without significant benefit

---

## Recommendation

### ✅ **KEEP `/supabase/` Directory**

**Rationale:**
1. **Required by Supabase CLI** - Standard workflow expects it
2. **Script dependencies** - Multiple scripts check for it
3. **Makefile integration** - Build targets use it
4. **Minimal footprint** - Only config files, no duplicate data
5. **Industry standard** - Standard Supabase project structure

**What to Keep:**
- ✅ `config.toml` - Required for CLI
- ✅ `.branches/` - Branching feature
- ✅ `.temp/` - Used by scripts
- ✅ `.gitignore` - Supabase-specific

**What's Dynamic:**
- `migrations/` - Created by sync script (not in git)
- `seeds/` - Created by sync script (not in git)

---

## Final Answer

**❌ NO - Cannot safely delete `/supabase/`**

**Reason:** Required for Supabase CLI operations and script dependencies

**Action:** Keep `/supabase/` with minimal contents (config files only)

---

**Status:** ✅ Analysis Complete  
**Recommendation:** Keep `/supabase/` directory
