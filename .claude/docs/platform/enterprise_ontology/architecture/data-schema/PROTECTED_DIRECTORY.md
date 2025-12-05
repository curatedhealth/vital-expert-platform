# 🛡️ PROTECTED DIRECTORY - SQL Seeds

## ⚠️ CRITICAL: DO NOT DELETE OR MOVE THIS DIRECTORY

This directory contains **PRODUCTION-READY** SQL seed templates and data loading scripts that are essential for the VITAL platform.

---

## 📍 Protected Location
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/
```

## 🔒 Protection Rules

### ✅ ALLOWED
- Reading files for reference
- Copying templates to create new seed files
- Running SQL scripts against databases
- Adding new seed files following the structure
- Updating documentation

### ❌ PROHIBITED
- Deleting the `/sql/` directory
- Moving the `/sql/` directory to a different location
- Deleting template files in `/sql/seeds/TEMPLATES/`
- Modifying template files (copy them first, then modify the copy)
- Removing preparation scripts in `/sql/seeds/00_PREPARATION/`
- Deleting documentation files

---

## 📂 Protected Structure

```
sql/
├── seeds/                              # 🛡️ PROTECTED - All seed data
│   ├── 00_PREPARATION/                 # 🔴 CRITICAL - Schema fixes
│   │   ├── 00_fix_vpanes_constraints.sql
│   │   ├── 00_ensure_persona_jtbd_tables.sql
│   │   ├── 00_add_content_columns.sql
│   │   ├── 00_make_all_columns_nullable.sql
│   │   └── 00_drop_personas_check_constraints.sql
│   │
│   ├── 01_foundation/                  # 🔴 CRITICAL - Core data
│   │   ├── 01_tenants.sql
│   │   └── 02_industries.sql
│   │
│   ├── 02_organization/                # 🟡 IMPORTANT - Org structure
│   │   ├── 01_org_functions.sql
│   │   ├── 02_org_departments.sql
│   │   ├── 03_org_roles.sql
│   │   └── COMPREHENSIVE_*.sql
│   │
│   ├── 03_content/                     # 🟡 IMPORTANT - Content data
│   │   ├── 01_personas.sql
│   │   ├── 02_strategic_priorities.sql
│   │   ├── 03_jobs_to_be_done.sql
│   │   └── COMPREHENSIVE_*.sql
│   │
│   ├── 04_operational/                 # 🟢 OPTIONAL - Operational
│   │   ├── 01_agents.sql
│   │   ├── 02_tools.sql
│   │   ├── 03_prompts.sql
│   │   └── 04_knowledge_domains.sql
│   │
│   ├── TEMPLATES/                      # 🔴 CRITICAL - Gold standard templates
│   │   ├── TEMPLATE_personas_seed.sql (325KB - 16 personas)
│   │   ├── TEMPLATE_org_functions_and_departments.sql (13KB)
│   │   ├── TEMPLATE_org_roles.sql (47KB - 80+ roles)
│   │   ├── README_TEMPLATES.md
│   │   └── SUMMARY.md
│   │
│   └── Documentation/                  # 🟡 IMPORTANT - Guides
│       ├── README_CLEAN_STRUCTURE.md
│       ├── QUICK_START.md
│       ├── INDEX.md
│       └── README_TEMPLATE.md
│
├── schema/                             # 🔴 CRITICAL - Database schema
│   └── [10 schema files]
│
├── functions/                          # 🟡 IMPORTANT - DB functions
├── policies/                           # 🟡 IMPORTANT - RLS policies
└── utilities/                          # 🟢 OPTIONAL - Helper scripts
```

---

## 🎯 Purpose of Protection

### 1. **Single Source of Truth**
This directory is the **ONLY** location for production-ready SQL seed data. All other seed files in the project are either:
- Archived (in `*_ARCHIVED_*` directories)
- Legacy (in `/database/` directories)
- Temporary (in `/data/` directories)

### 2. **Tested and Validated**
All templates in this directory have been:
- ✅ Tested in production environments
- ✅ Validated against real databases
- ✅ Made idempotent (safe to re-run)
- ✅ Multi-tenant verified
- ✅ Research-backed (personas with 217+ citations)

### 3. **Critical Dependencies**
The VITAL platform depends on these files for:
- Setting up new tenant environments
- Seeding organizational structures
- Loading persona data
- Populating operational configs
- Database schema preparation

### 4. **Knowledge Investment**
This directory represents:
- **385KB** of production SQL
- **8,699 lines** of carefully crafted code
- **217+ research citations** for persona data
- **80+ organizational roles** across industries
- **16 complete personas** with full lifecycle data
- **Weeks of research, development, and testing**

---

## 🚨 If You Need to Make Changes

### Instead of Modifying Templates Directly:

1. **Copy the template first:**
   ```bash
   cp TEMPLATES/TEMPLATE_personas_seed.sql 03_content/my_new_personas.sql
   ```

2. **Modify your copy:**
   ```bash
   # Edit my_new_personas.sql with your changes
   ```

3. **Test your changes:**
   ```bash
   psql $DB_URL -c "\set ON_ERROR_STOP on" -f "03_content/my_new_personas.sql"
   ```

4. **Only if successful, consider updating the template:**
   ```bash
   # Create backup first
   cp TEMPLATES/TEMPLATE_personas_seed.sql TEMPLATES/TEMPLATE_personas_seed.sql.backup

   # Then update
   cp 03_content/my_new_personas.sql TEMPLATES/TEMPLATE_personas_seed.sql
   ```

---

## 📊 What's Protected

| Item | Count | Size | Status |
|------|-------|------|--------|
| **Preparation Scripts** | 6 | ~10KB | 🔴 CRITICAL |
| **Foundation Seeds** | 2 | ~5KB | 🔴 CRITICAL |
| **Organization Seeds** | 7 | ~60KB | 🟡 IMPORTANT |
| **Content Seeds** | 4 | ~330KB | 🟡 IMPORTANT |
| **Operational Seeds** | 4 | ~15KB | 🟢 OPTIONAL |
| **Templates** | 3 | 385KB | 🔴 CRITICAL |
| **Documentation** | 5 | ~30KB | 🟡 IMPORTANT |
| **TOTAL** | **31 files** | **~835KB** | 🛡️ PROTECTED |

---

## 🔐 Backup Strategy

### Automatic Protection via Git
The `/sql/` directory is:
- ✅ Tracked in version control
- ✅ Excluded from `.gitignore`
- ✅ Backed up with every commit
- ✅ Recoverable from git history

### Manual Backups (Recommended)
```bash
# Create timestamped backup
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
tar -czf "sql_backup_$(date +%Y%m%d_%H%M%S).tar.gz" sql/

# Store backups safely
mv sql_backup_*.tar.gz ~/Backups/vital-sql/
```

---

## 📝 Change Log

| Date | Action | Description |
|------|--------|-------------|
| 2025-11-16 | Created | Initial protection established |
| 2025-11-16 | Organized | Clean structure with TEMPLATES/ |
| 2025-11-16 | Documented | Complete documentation added |

---

## 🆘 Emergency Recovery

If the `/sql/` directory is accidentally deleted or corrupted:

### Option 1: Restore from Git
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
git checkout HEAD -- sql/
```

### Option 2: Restore from Backup
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
tar -xzf ~/Backups/vital-sql/sql_backup_YYYYMMDD_HHMMSS.tar.gz
```

### Option 3: Restore from Archive
```bash
# Last resort: copy from archived directories
cp -r database/sql_ARCHIVED_20251116/seeds/2025/PRODUCTION_TEMPLATES/* sql/seeds/TEMPLATES/
```

---

## ✅ Verification Checklist

Run this periodically to ensure protection:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Check directory exists
[ -d "sql/seeds" ] && echo "✅ Directory exists" || echo "❌ MISSING!"

# Check template count
template_count=$(find sql/seeds/TEMPLATES -name "TEMPLATE_*.sql" | wc -l)
[ "$template_count" -eq 3 ] && echo "✅ All 3 templates present" || echo "⚠️ Missing templates!"

# Check preparation scripts
prep_count=$(find sql/seeds/00_PREPARATION -name "*.sql" | wc -l)
[ "$prep_count" -ge 5 ] && echo "✅ Preparation scripts present" || echo "⚠️ Missing prep scripts!"

# Check documentation
doc_count=$(find sql/seeds -maxdepth 1 -name "*.md" | wc -l)
[ "$doc_count" -ge 3 ] && echo "✅ Documentation present" || echo "⚠️ Missing docs!"
```

---

## 📞 Support

For questions or concerns about this protected directory:

1. **Read the documentation first:**
   - `/sql/seeds/README_CLEAN_STRUCTURE.md` - Directory structure
   - `/sql/seeds/QUICK_START.md` - Quick reference
   - `/sql/seeds/TEMPLATES/README_TEMPLATES.md` - Template guide

2. **Check the archives:**
   - `/database/sql_ARCHIVED_20251116/` - Historical reference
   - `/migration_scripts_ARCHIVED_20251116/` - Old migrations

3. **Emergency contact:**
   - Check git history for changes
   - Review backup archives
   - Consult this protection document

---

## 🎯 Summary

**DO NOT DELETE OR MOVE `/sql/` directory!**

This is your **single source of truth** for all SQL seed data. Everything else in the project related to seeds/data/migrations has been archived or is legacy.

**Protected:** ✅
**Backed up:** ✅
**Documented:** ✅
**Production-ready:** ✅

---

**Created:** 2025-11-16
**Last Updated:** 2025-11-16
**Status:** 🛡️ ACTIVELY PROTECTED
