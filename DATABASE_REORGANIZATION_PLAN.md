# 📂 Database Folder Analysis & Reorganization Plan

**Date**: November 21, 2024  
**Location**: `/database/`  
**Total Files**: ~570 (384 SQL, 78 MD, 31 TXT, 21 JSON, 18 PY, 14 SH)

---

## 📊 Current Structure Analysis

```
database/
├── backups/              (33 files) - Old database backups from Oct 2024
├── checkpoints/          (3 files)  - SQLite checkpoint files (runtime)
├── debug/                (2 files)  - Debug SQL scripts
├── GOLD_STANDARD_SCHEMA.md           - Master schema reference ⭐
├── migrations/           (4 SQL + subdirs) - Active migrations ✅
│   ├── rls/              - Row-Level Security
│   ├── seeds/            - Use cases, tools, workflows
│   └── archived/         - Old migrations
├── seeds/                           - Seed data (JSON, Python)
│   ├── data/             - Agent data, knowledge domains
│   └── knowledge/        - Knowledge base samples
├── sql/                  (439 files) - MASSIVE SQL archive 🔥
│   ├── migrations/       (182 files) - Duplicated with migrations/
│   ├── seeds/            (231 files) - Duplicated with seeds/
│   ├── schema/           - Legacy schema files
│   ├── functions/        - Database functions
│   ├── policies/         - RLS policies
│   └── setup/            - Setup scripts
└── templates/            (3 files)  - JSON templates

```

---

## 🎯 Recommendations

### ✅ KEEP at `/database/` (Active Production Files)

These are essential for running production database:

1. **`GOLD_STANDARD_SCHEMA.md`** ⭐
   - Master schema reference
   - Keep at root for easy access
   - **Action**: Keep

2. **`migrations/` directory** ✅
   - `20251118_014_create_multitenancy_system.sql`
   - `20251118_015_seed_mvp_tenants.sql`
   - `20251118_016_update_tenant_logos.sql`
   - `20251006_add_enhanced_agent_fields.sql`
   - Plus: `rls/`, `seeds/` subdirectories
   - **Action**: Keep (active migrations)

3. **`seeds/data/`** (JSON files) ✅
   - Active seed data for initialization
   - agents.json, knowledge_domains.json, llm_providers.json
   - **Action**: Keep

4. **`templates/`** ✅
   - agent_template.json, capability_template.json
   - **Action**: Keep

5. **`checkpoints/`** ⚠️
   - Runtime SQLite files (LangGraph checkpoints)
   - **Action**: Keep but add to .gitignore

### 📦 MOVE to `.vital-cockpit/` (Documentation)

1. **`migrations/README.md`** → `.vital-cockpit/vital-expert-docs/11-data-schema/06-migrations/`
   - Excellent migration documentation
   - 295 lines of organized migration guide
   - **Reason**: Documentation belongs in docs

2. **`templates/README.md`** → `.vital-cockpit/vital-expert-docs/11-data-schema/08-templates/`
   - Template documentation
   - **Reason**: Documentation

3. **`sql/README.md`** → `.vital-cockpit/vital-expert-docs/11-data-schema/README.md`
   - SQL documentation overview
   - **Reason**: Documentation

### 🗄️ ARCHIVE to `.vital-cockpit/_archive/database/`

1. **`backups/`** (33 files from Oct 2024)
   - Old table backups (agent_audit_log, agents, capabilities, etc.)
   - Dates: 2025-10-04, 2025-10-06, 2025-10-26
   - **Reason**: Historical backups, not current
   - **Action**: Archive

2. **`sql/` directory** (439 files) 🔥 **MAJOR CLEANUP**
   - Contains duplicates of `migrations/` and `seeds/`
   - Many legacy and superseded files
   - **Subdirectories to archive**:
     - `sql/migrations/` (182 files) - Superseded by `/migrations/`
     - `sql/seeds/` (231 files) - Superseded by `/migrations/seeds/`
     - `sql/schema/` (4 files) - Legacy schemas
     - `sql/workflows-dh-seeds/` (9 files) - Old workflow seeds
   - **Keep minimal**:
     - `sql/functions/` - May have unique functions
     - `sql/policies/` - May have unique RLS policies
     - `sql/setup/` - May have unique setup scripts
   - **Action**: Archive 90% of sql/, keep only unique active files

3. **`seeds/knowledge/samples/`** (Python scripts)
   - AutoGPT samples and digital health examples
   - **Reason**: Example/sample code, not production
   - **Action**: Archive

4. **`debug/`** (2 files)
   - Old debug scripts
   - **Action**: Archive or delete

5. **`migrations/archived/`**
   - Already archived in migrations
   - **Action**: Move to `.vital-cockpit/_archive/database/migrations/`

### 🗑️ DELETE (Unnecessary Files)

1. **`.DS_Store` files** (7 files)
   - macOS filesystem metadata
   - **Action**: Delete and add to .gitignore

2. **`sql/log.rtf`**
   - Old log file
   - **Action**: Delete

3. **Broken/temporary files**
   - `*.bak2`, `*.broken`, `*.tmp` files
   - **Action**: Delete

4. **Old backup files**
   - `*.backup_wf`, `*.backup` extensions
   - **Action**: Delete if duplicates exist

---

## 🎯 Detailed Reorganization Plan

### Step 1: Move Documentation
```bash
# Move migration docs
cp database/migrations/README.md .vital-cockpit/vital-expert-docs/11-data-schema/06-migrations/

# Move template docs  
cp database/templates/README.md .vital-cockpit/vital-expert-docs/11-data-schema/08-templates/

# Move SQL overview docs
cp database/sql/README.md .vital-cockpit/vital-expert-docs/11-data-schema/SQL_OVERVIEW.md
```

### Step 2: Archive Historical Files
```bash
# Create archive structure
mkdir -p .vital-cockpit/_archive/database/{backups,sql,seeds,debug}

# Archive old backups
mv database/backups .vital-cockpit/_archive/database/

# Archive massive sql/ directory (most files)
mv database/sql/migrations .vital-cockpit/_archive/database/sql/
mv database/sql/seeds .vital-cockpit/_archive/database/sql/
mv database/sql/schema .vital-cockpit/_archive/database/sql/
mv database/sql/workflows-dh-seeds .vital-cockpit/_archive/database/sql/

# Archive samples
mv database/seeds/knowledge .vital-cockpit/_archive/database/seeds/

# Archive debug scripts
mv database/debug .vital-cockpit/_archive/database/

# Archive old migrations
mv database/migrations/archived .vital-cockpit/_archive/database/migrations/
```

### Step 3: Keep Active SQL Functions/Policies
```bash
# These may have unique content, review before archiving
# Keep: database/sql/functions/
# Keep: database/sql/policies/
# Keep: database/sql/setup/

# Or if they're duplicates, archive them too
```

### Step 4: Clean Up
```bash
# Delete unnecessary files
find database -name ".DS_Store" -delete
rm database/sql/log.rtf
find database -name "*.tmp" -delete
find database -name "*.broken" -delete
find database -name "*.bak2" -delete
```

### Step 5: Update .gitignore
```bash
# Add to .gitignore
echo "database/checkpoints/*.sqlite*" >> .gitignore
echo "**/.DS_Store" >> .gitignore
echo "**/*.tmp" >> .gitignore
```

---

## 📊 Impact Summary

### Files to Keep (Production): ~100 files
- `GOLD_STANDARD_SCHEMA.md` (1)
- `migrations/` (4 active + subdirs ~50)
- `seeds/data/` (JSON files ~20)
- `templates/` (3)
- `sql/functions/` (~5)
- `sql/policies/` (~5)
- `sql/setup/` (~5)
- `checkpoints/` (3 runtime)

### Files to Archive: ~450 files
- `backups/` (33)
- `sql/migrations/` (182)
- `sql/seeds/` (231)
- `sql/schema/` (4)
- Other old SQL files

### Files to Delete: ~20 files
- `.DS_Store` files (7)
- Log files (1)
- Temporary/broken files (~10)

### Net Result
- **Before**: 570 files in database/
- **After**: ~100 files in database/ (active production)
- **Archived**: ~450 files in .vital-cockpit/_archive/database/
- **Deleted**: ~20 unnecessary files
- **Reduction**: 82% cleaner!

---

## ✅ Benefits

1. **Clarity**: Only active production files in `/database/`
2. **Performance**: Faster directory operations
3. **Maintenance**: Easy to identify what's active vs. historical
4. **Documentation**: Properly organized in .vital-cockpit/
5. **History Preserved**: Nothing lost, all archived properly

---

## 🚀 Execution Priority

### High Priority (Do First)
1. Archive `backups/` (clear old backups)
2. Archive `sql/migrations/` and `sql/seeds/` (major duplicates)
3. Delete `.DS_Store` and temp files
4. Move documentation to .vital-cockpit/

### Medium Priority
5. Archive `sql/schema/` (legacy)
6. Archive `seeds/knowledge/` (samples)
7. Review sql/functions, policies, setup for uniqueness

### Low Priority
8. Update .gitignore
9. Create summary documentation

---

## 📝 Notes

- **`GOLD_STANDARD_SCHEMA.md`** is critical - already documented in vital-expert-docs but keep at root for dev access
- **`migrations/`** is actively used - do not move or archive
- **`sql/` directory** is the main cleanup target - 439 files, most are duplicates
- **`checkpoints/`** are runtime files from LangGraph - keep but gitignore

---

**Recommendation**: Execute Steps 1-4 to achieve 82% reduction while preserving all important data.

