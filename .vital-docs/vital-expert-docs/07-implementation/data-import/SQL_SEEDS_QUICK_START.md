# Quick Start - SQL Seeds

## 🚀 TL;DR - Complete Setup

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds"

# Replace XXX with your actual password
export PGPASSWORD='XXX'
export DB_URL="postgresql://postgres:XXX@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

# 1. Run all preparation scripts (FIRST TIME ONLY)
cd 00_PREPARATION
for script in *.sql; do
    echo "Running $script..."
    psql $DB_URL -f "$script"
done
cd ..

# 2. Load foundation data
psql $DB_URL -f "01_foundation/tenants.sql"

# 3. Load organizational structure (use templates or existing files)
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "TEMPLATES/TEMPLATE_org_functions_and_departments.sql"
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "TEMPLATES/TEMPLATE_org_roles.sql"

# 4. Load personas
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "TEMPLATES/TEMPLATE_personas_seed.sql"
```

## ✅ What Each Script Does

| Script | Purpose | Time |
|--------|---------|------|
| `00_fix_vpanes_constraints.sql` | Allows VPANES scores > 10 | 1s |
| `00_ensure_persona_jtbd_tables.sql` | Adds tenant_id, sequence_order, etc. | 2s |
| `00_add_content_columns.sql` | Adds 42 text/content columns | 2s |
| `00_make_all_columns_nullable.sql` | Removes NOT NULL from non-PK columns | 1s |
| `00_drop_personas_check_constraints.sql` | Drops restrictive CHECK constraints | 1s |

**Total prep time**: ~7 seconds

## 📋 Creating Your Own Seed Files

### Option 1: Organizational Structure
```bash
# Copy templates
cp TEMPLATES/TEMPLATE_org_functions_and_departments.sql 02_organization/my_org.sql
cp TEMPLATES/TEMPLATE_org_roles.sql 02_organization/my_roles.sql

# Edit tenant IDs and customize
# Load in order (departments must come before roles!)
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "02_organization/my_org.sql"
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "02_organization/my_roles.sql"
```

### Option 2: Personas
```bash
# Copy template
cp TEMPLATES/TEMPLATE_personas_seed.sql 03_content/my_personas.sql

# Edit:
# - Line 18: v_tenant_id (your tenant UUID)
# - Line 22: slug = 'your-function'
# - Persona data starting at line 40

# Run preparation scripts first (if not done)
cd 00_PREPARATION && for script in *.sql; do psql $DB_URL -f "$script"; done && cd ..

# Load personas
psql $DB_URL -c "\set ON_ERROR_STOP on" -f "03_content/my_personas.sql"
```

## 🔧 Common Issues

| Error | Fix Script |
|-------|-----------|
| "column X does not exist" | `00_add_content_columns.sql` |
| "null value violates not-null" | `00_make_all_columns_nullable.sql` |
| "violates check constraint" | `00_drop_personas_check_constraints.sql` |
| "score exceeds maximum" | `00_fix_vpanes_constraints.sql` |

## 📚 Full Documentation

- **TEMPLATES/README_TEMPLATES.md** - Complete templates guide
- **README_CLEAN_STRUCTURE.md** - Directory structure overview
- **README_TEMPLATE.md** - Detailed persona template guide
- **README_FIXES.md** - Schema preparation documentation

## 🎯 Available Templates

| Template | Size | Content |
|----------|------|---------|
| **TEMPLATE_personas_seed.sql** | 325KB | 16 Medical Affairs personas |
| **TEMPLATE_org_functions_and_departments.sql** | 13KB | Pharma + Digital Health org structure |
| **TEMPLATE_org_roles.sql** | 47KB | 80+ roles across all seniority levels |

## 💡 Pro Tips

1. Always run fixes before EVERY new persona seed
2. Fixes are idempotent - safe to run multiple times
3. Use `\set ON_ERROR_STOP on` to catch errors early
4. Check `org_functions` table first to get valid slugs
