# Seed Files Index - PRODUCTION_TEMPLATES

## 📁 Directory Structure

```
PRODUCTION_TEMPLATES/
├── 00_*.sql                    # Schema preparation scripts (run FIRST)
├── 01_foundation/              # Core foundation data
├── 02_organization/            # Organizational structure
├── 03_content/                 # Content (personas, JTBDs, etc.)
├── 04_operational/             # Operational data
├── TEMPLATE_*.sql              # Templates for new seed files
└── *.md                        # Documentation
```

## 🔧 Schema Preparation Scripts (Run First!)

These must be run BEFORE any persona seed files:

| Order | Script | Purpose |
|-------|--------|---------|
| 1️⃣ | `00_fix_vpanes_constraints.sql` | Fix VPANES scoring constraints |
| 2️⃣ | `00_ensure_persona_jtbd_tables.sql` | Add structural columns |
| 3️⃣ | `00_add_content_columns.sql` | Add content/text columns |
| 4️⃣ | `00_make_all_columns_nullable.sql` | Remove NOT NULL constraints |
| 5️⃣ | `00_drop_personas_check_constraints.sql` | Drop restrictive CHECKs |

**Quick Run All:**
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/2025/PRODUCTION_TEMPLATES"
export PGPASSWORD='XXX'
export DB_URL="postgresql://postgres:XXX@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

for script in 00_fix_vpanes_constraints.sql 00_ensure_persona_jtbd_tables.sql 00_add_content_columns.sql 00_make_all_columns_nullable.sql 00_drop_personas_check_constraints.sql; do
    echo "Running $script..."
    psql $DB_URL -f "$script"
done
```

## 📂 01_foundation/ - Core Foundation Data

Foundation data that must be loaded first:

- `tenants.sql` - Tenant definitions
- `org_functions.sql` - Organizational functions
- `org_departments.sql` - Department structure
- Other core reference data

## 📂 02_organization/ - Organizational Structure

Organizational hierarchy and role definitions:

- Role hierarchies
- Department mappings
- Function definitions
- Seniority levels

## 📂 03_content/ - Content Data

### Personas
- `TEMPLATE_personas_seed.sql` - **Use this as template**
- Medical Affairs personas
- Market Access personas
- Digital Health personas

### JTBDs (Jobs to Be Done)
- JTBD definitions
- Persona-JTBD mappings

## 📂 04_operational/ - Operational Data

Runtime operational data:

- Workflows
- Tasks
- Configurations

## 📋 Templates

| Template | Purpose | Size |
|----------|---------|------|
| `TEMPLATE_personas_seed.sql` | Persona seed template | 325KB |

## 📖 Documentation

| File | Description |
|------|-------------|
| `INDEX.md` | This file - directory index |
| `README.md` | General overview |
| `README_TEMPLATE.md` | Template usage guide |
| `README_FIXES.md` | Fix scripts documentation |
| `QUICK_START.md` | Quick reference guide |
| `00_MASTER_README.md` | Master documentation |

## 🚀 Quick Start Workflow

### For New Persona Seeds:

1. **Copy template**
   ```bash
   cp TEMPLATE_personas_seed.sql my_personas.sql
   ```

2. **Run preparation scripts** (if not already done)
   ```bash
   # See "Schema Preparation Scripts" above
   ```

3. **Edit your file**
   - Update tenant_id
   - Update function slug
   - Add your persona data

4. **Load your personas**
   ```bash
   psql $DB_URL -c "\set ON_ERROR_STOP on" -f "my_personas.sql"
   ```

### For Complete Fresh Setup:

```bash
# 1. Foundation
psql $DB_URL -f "01_foundation/tenants.sql"
psql $DB_URL -f "01_foundation/org_functions.sql"

# 2. Organization
psql $DB_URL -f "02_organization/org_roles.sql"

# 3. Schema preparation
# Run all 00_*.sql files (see above)

# 4. Content
psql $DB_URL -f "03_content/your_personas.sql"
psql $DB_URL -f "03_content/your_jtbds.sql"
```

## 📊 File Organization Rules

### Naming Convention:

- `00_*` - Schema preparation (run first, always)
- `01_*` - Foundation data
- `02_*` - Organization structure  
- `03_*` - Content (personas, JTBDs)
- `04_*` - Operational data
- `TEMPLATE_*` - Templates to copy
- `README_*` - Documentation
- `QUICK_*` - Quick references

### Directories:

- `01_foundation/` - Must run before others
- `02_organization/` - Depends on foundation
- `03_content/` - Depends on organization
- `04_operational/` - Depends on content

## 🔍 Finding Files

### By Function:
```bash
# All persona files
find . -name "*personas*"

# All JTBD files
find . -name "*jtbd*"

# All fix scripts
ls -1 00_*.sql

# All templates
ls -1 TEMPLATE_*.sql
```

### By Department:
- Medical Affairs: `03_content/medical_affairs_*`
- Market Access: `03_content/market_access_*`
- Digital Health: `03_content/digital_health_*`

## ⚠️ Important Notes

1. **Always run 00_*.sql scripts first** - They prepare the schema
2. **Scripts are idempotent** - Safe to run multiple times
3. **Use TEMPLATE files** - Don't modify templates directly
4. **Follow naming convention** - For easy organization
5. **Document changes** - Update relevant README files

## 🆘 Troubleshooting

- **Error during seed**: Check you ran all `00_*.sql` scripts first
- **Missing columns**: Run `00_add_content_columns.sql`
- **NOT NULL constraint**: Run `00_make_all_columns_nullable.sql`
- **CHECK constraint**: Run `00_drop_personas_check_constraints.sql`

For detailed troubleshooting, see `README_TEMPLATE.md`.

---

**Last Updated**: 2025-11-16
**Location**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/2025/PRODUCTION_TEMPLATES/`
