# Clean SQL Seeds Structure - VITAL Platform

## 📍 Location
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/
```

## 📂 Clean Structure

```
sql/seeds/
├── 00_PREPARATION/          # ⚠️ RUN THESE FIRST! (6 scripts)
│   ├── 00_fix_vpanes_constraints.sql
│   ├── 00_ensure_persona_jtbd_tables.sql
│   ├── 00_add_content_columns.sql
│   ├── 00_make_all_columns_nullable.sql
│   └── 00_drop_personas_check_constraints.sql
│
├── 01_foundation/           # Core foundation data
│   ├── tenants.sql
│   └── org_functions.sql
│
├── 02_organization/         # Organizational structure  
│   ├── org_departments.sql
│   ├── org_roles.sql
│   └── role_mappings.sql
│
├── 03_content/             # Content (personas, JTBDs)
│   ├── 01_personas.sql
│   ├── 02_strategic_priorities.sql
│   └── 03_jobs_to_be_done.sql
│
├── 04_operational/         # Operational data
│   └── (workflows, tasks, configs)
│
├── TEMPLATES/              # 🌟 GOLD STANDARD TEMPLATES
│   ├── TEMPLATE_personas_seed.sql                    (325KB - 16 personas)
│   ├── TEMPLATE_org_functions_and_departments.sql   (13KB - 2 industries)
│   ├── TEMPLATE_org_roles.sql                       (47KB - 80+ roles)
│   └── README_TEMPLATES.md                          (Complete guide)
│
└── *.md                    # Documentation
    ├── INDEX.md                   # Complete index
    ├── QUICK_START.md             # Quick reference
    ├── README_TEMPLATE.md         # Template guide
    └── README_CLEAN_STRUCTURE.md  # This file
```

## 🚀 Quick Start

### 1. Prepare Database Schema (First Time Only)
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION"

export PGPASSWORD='XXX'
export DB_URL="postgresql://postgres:XXX@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

# Run all preparation scripts in order
for script in *.sql; do
    echo "Running $script..."
    psql $DB_URL -f "$script"
done
```

### 2. Load Data in Order
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds"

# Foundation
psql $DB_URL -f "01_foundation/tenants.sql"
psql $DB_URL -f "01_foundation/org_functions.sql"

# Organization
psql $DB_URL -f "02_organization/org_departments.sql"
psql $DB_URL -f "02_organization/org_roles.sql"

# Content
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "03_content/01_personas.sql"
```

### 3. Create New Persona Seeds
```bash
cp TEMPLATES/TEMPLATE_personas_seed.sql 03_content/my_new_personas.sql
# Edit my_new_personas.sql
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "03_content/my_new_personas.sql"
```

## 📋 Directory Purposes

| Directory | Purpose | Run Order | Required |
|-----------|---------|-----------|----------|
| `00_PREPARATION` | Schema fixes | **FIRST** | ✅ Yes |
| `01_foundation` | Core data | 2nd | ✅ Yes |
| `02_organization` | Org structure | 3rd | ✅ Yes |
| `03_content` | Personas, JTBDs | 4th | Depends |
| `04_operational` | Workflows, tasks | 5th | Depends |
| `TEMPLATES` | Copy to create new | N/A | Reference |

## ⚠️ IMPORTANT: Preparation Scripts

**ALWAYS run these BEFORE any persona seed files:**

| Order | Script | Purpose | Time |
|-------|--------|---------|------|
| 1️⃣ | `00_fix_vpanes_constraints.sql` | VPANES scores > 10 allowed | 1s |
| 2️⃣ | `00_ensure_persona_jtbd_tables.sql` | Add structural columns | 2s |
| 3️⃣ | `00_add_content_columns.sql` | Add 42 text columns | 2s |
| 4️⃣ | `00_make_all_columns_nullable.sql` | Remove NOT NULL | 1s |
| 5️⃣ | `00_drop_personas_check_constraints.sql` | Drop CHECKs | 1s |

## 🌟 Templates

We now have **3 production-ready templates** for all organizational data:

### 1. TEMPLATE_personas_seed.sql
- **Size**: 325KB (7,736 lines)
- **Content**: 16 Medical Affairs personas
- **Structure**: Fully normalized (no JSONB)
- **Sources**: 217+ research citations
- **Tables**: 20+ persona junction tables

**Usage:**
```bash
cp TEMPLATES/TEMPLATE_personas_seed.sql 03_content/my_personas.sql
# Edit my_personas.sql to add your data
```

### 2. TEMPLATE_org_functions_and_departments.sql
- **Size**: 13KB (176 lines)
- **Content**: Functions + Departments for 2 industries
- **Pharma**: 13 functions, 17 departments
- **Digital Health**: 7 functions, 11 departments
- **Features**: Color-coded, icons, idempotent

**Usage:**
```bash
cp TEMPLATES/TEMPLATE_org_functions_and_departments.sql 02_organization/my_org.sql
# Edit tenant IDs and customize as needed
```

### 3. TEMPLATE_org_roles.sql
- **Size**: 47KB (562 lines)
- **Content**: 80+ roles across all seniority levels
- **Seniority**: executive, senior, mid, junior, entry
- **Coverage**: Complete role hierarchy for both industries
- **Features**: Dynamic department lookup, idempotent

**Usage:**
```bash
cp TEMPLATES/TEMPLATE_org_roles.sql 02_organization/my_roles.sql
# Requires org_functions and org_departments to exist first!
```

**See [TEMPLATES/README_TEMPLATES.md](TEMPLATES/README_TEMPLATES.md) for detailed documentation.**

## 📁 File Naming Convention

- `00_*` - Preparation (run first)
- `01_*` - Foundation data
- `02_*` - Organization
- `03_*` - Content
- `04_*` - Operational
- `TEMPLATE_*` - Templates (copy, don't modify)
- `README_*` - Documentation

## 🔍 Finding Files

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds"

# All persona files
find . -name "*persona*"

# All preparation scripts
ls -1 00_PREPARATION/

# All templates
ls -1 TEMPLATES/

# All documentation
ls -1 *.md
```

## 📖 Documentation Files

| File | Description |
|------|-------------|
| `README_CLEAN_STRUCTURE.md` | This file - new structure |
| `INDEX.md` | Complete directory index |
| `QUICK_START.md` | Quick reference |
| `README_TEMPLATE.md` | Template usage guide |
| `README_FIXES.md` | Schema fix documentation |

## ✅ Benefits of Clean Structure

1. **Clear Hierarchy** - Numbers indicate run order
2. **Easy Discovery** - Everything in logical locations
3. **Safe Templates** - Separate TEMPLATES directory
4. **No Confusion** - One clear path for each type
5. **Production Ready** - All scripts tested and documented

## 🗂️ Old Locations (Archived)

All old structures moved to:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/archive/
├── sql_ARCHIVED_20251116/
└── seeds_2025_old/
```

## 🆘 Troubleshooting

**Error during persona seed?**
- ✅ Did you run ALL `00_PREPARATION/*.sql` scripts first?
- ✅ Are you using `\set ON_ERROR_STOP on`?
- ✅ Check `README_TEMPLATE.md` for details

**Missing columns?**
- Run `00_PREPARATION/00_add_content_columns.sql`

**NOT NULL constraint violations?**
- Run `00_PREPARATION/00_make_all_columns_nullable.sql`

**CHECK constraint violations?**
- Run `00_PREPARATION/00_drop_personas_check_constraints.sql`

## 🎯 Next Steps

1. ✅ Structure is clean and organized
2. ✅ All preparation scripts are in `00_PREPARATION/`
3. ✅ Template is in `TEMPLATES/`
4. ✅ Content organized by type
5. ✅ Documentation updated

**Ready to use!** See `QUICK_START.md` for common tasks.

---

**Last Updated**: 2025-11-16  
**Status**: ✅ Production Ready  
**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/`
