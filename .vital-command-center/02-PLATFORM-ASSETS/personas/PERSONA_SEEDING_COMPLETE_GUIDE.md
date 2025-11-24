# VITAL Platform - Complete Persona Seeding Guide

**Version**: 1.0.0
**Date**: 2025-11-17
**Status**: Production Ready

---

## 🎯 Executive Summary

This guide provides a comprehensive, production-ready solution for seeding persona data across all business functions in the VITAL platform. The solution includes:

- **Automatic Schema Introspection**: Reads deployed database schema in real-time
- **Standardized Data Capture**: Templates for consistent persona collection
- **Robust Transformation Pipeline**: Handles schema mismatches and validation
- **Multi-Business Function Support**: Works for Sales, Marketing, Product, Engineering, etc.
- **Full v5.0 Extension Support**: All 69 persona-related tables
- **Database Golden Rules Compliance**: NO JSONB for structured data, full normalization

---

## 📊 Current State & Solution

### Problems Solved

1. **Schema Mismatches** ✅
   - Column name differences (e.g., `focus_areas` vs actual schema)
   - Data type conflicts (TEXT[] vs JSONB)
   - CHECK constraint violations
   - Missing columns in transformation scripts

2. **Scale Requirements** ✅
   - Support for 10+ business functions
   - 20-50 personas per function
   - 69 related tables per persona
   - Maintainable and repeatable process

3. **Data Quality Issues** ✅
   - Inconsistent data formats
   - Missing validation
   - Foreign key violations
   - Incomplete v5.0 extension data

### Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSONA SEEDING PIPELINE                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. SCHEMA INTROSPECTION                                     │
│     ├── Read deployed Supabase schema                        │
│     ├── Generate column mappings                             │
│     └── Extract constraints & enums                          │
│                           ↓                                   │
│  2. DATA CAPTURE                                             │
│     ├── Generate templates per business function             │
│     ├── Support JSON/YAML/CSV formats                        │
│     └── Include validation rules                             │
│                           ↓                                   │
│  3. TRANSFORMATION                                           │
│     ├── Map source fields to schema                          │
│     ├── Validate constraints                                 │
│     └── Generate normalized SQL                              │
│                           ↓                                   │
│  4. VALIDATION                                               │
│     ├── Check required fields                                │
│     ├── Verify foreign keys                                  │
│     └── Validate enum values                                 │
│                           ↓                                   │
│  5. DEPLOYMENT                                               │
│     ├── Execute transactional SQL                            │
│     ├── Verify data integrity                                │
│     └── Run validation queries                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** with required packages:
```bash
pip install psycopg2-binary pyyaml
```

2. **Database Connection String**:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

3. **Tenant ID**:
```bash
export TENANT_ID="f7aa6fd4-0af9-4706-8b31-034f1f7accda"
```

### One-Command Deployment

```bash
# Deploy Medical Affairs personas
python /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/tools/persona_seeding_orchestrator.py \
    --database-url "$DATABASE_URL" \
    --tenant-id "$TENANT_ID" \
    --business-function medical-affairs \
    --auto-deploy

# Deploy Sales personas
python /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/tools/persona_seeding_orchestrator.py \
    --database-url "$DATABASE_URL" \
    --tenant-id "$TENANT_ID" \
    --business-function sales \
    --auto-deploy
```

---

## 📋 Step-by-Step Process

### Step 1: Schema Introspection

**Purpose**: Automatically read the deployed database schema to understand exact column names, types, and constraints.

```bash
# Run schema introspector
cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/sql/tools
python schema_introspector.py
```

**Output**:
- `sql/schema_mappings/persona_schema_mappings.json` - Complete schema definition
- `sql/schema_mappings/transformation_config.json` - Transformation rules

**What it captures**:
- All table and column names
- Data types (TEXT, INTEGER, UUID, JSONB, etc.)
- Constraints (NOT NULL, CHECK, UNIQUE)
- Enum values from CHECK constraints
- Foreign key relationships
- Default values

### Step 2: Generate Data Capture Templates

**Purpose**: Create standardized templates for capturing persona data consistently.

```bash
# Generate templates for all business functions
python data_capture_templates.py
```

**Output** (per business function):
- `data_capture_templates/[function]_persona_template.json`
- `data_capture_templates/[function]_persona_template.yaml`
- `data_capture_templates/[function]_README.md`

**Template Structure**:
```json
{
  "core_profile": {
    "name": "Dr. Sarah Chen",
    "slug": "dr-sarah-chen-cmo",
    "title": "Chief Medical Officer",
    "tagline": "Bridging clinical excellence with strategic innovation"
  },
  "professional_context": {
    "seniority_level": "executive",
    "years_of_experience": 20,
    "team_size": 350,
    "budget_authority": 25000000
  },
  "pain_points": [
    {
      "pain_point": "Regulatory compliance complexity",
      "severity": "high",
      "frequency": "daily",
      "impact_description": "Slows innovation cycles",
      "root_cause": "Evolving regulatory landscape"
    }
  ],
  "goals": [...],
  "challenges": [...],
  "week_in_life": [...],
  "internal_stakeholders": [...]
}
```

### Step 3: Fill Out Templates

**For new personas**:
1. Copy the template file
2. Replace placeholder values with actual data
3. Ensure enum values match allowed options
4. Save with descriptive filename

**For existing data**:
- Place JSON files in `data_capture_templates/` directory
- Use the same structure as templates

### Step 4: Transform Data to SQL

**Purpose**: Convert captured data to normalized SQL following database golden rules.

```bash
python transformation_pipeline.py \
    /path/to/persona_data.json \
    --tenant-id "$TENANT_ID" \
    --schema-mapping sql/schema_mappings/persona_schema_mappings.json \
    --output-dir sql/seeds
```

**Features**:
- Automatic schema mapping
- Foreign key lookups
- Data type conversion
- Constraint validation
- Metadata generation for unmapped fields
- Transaction wrapping

**Output Example**:
```sql
-- ============================================================
-- VITAL Platform - Persona Deployment Script
-- Generated: 2025-11-17T10:00:00
-- Personas: 31
-- Tenant ID: f7aa6fd4-0af9-4706-8b31-034f1f7accda
-- ============================================================

BEGIN;

DO $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Insert main persona
    INSERT INTO personas (id, tenant_id, name, slug, ...)
    VALUES (gen_random_uuid(), 'f7aa6fd4-...'::uuid, 'Dr. Sarah Chen', ...)
    RETURNING id INTO v_persona_id;

    -- Insert related records
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, ...)
    VALUES (v_persona_id, 'Regulatory compliance', 'high', ...);

    INSERT INTO persona_goals (persona_id, goal, priority, ...)
    VALUES (v_persona_id, 'Improve patient outcomes', 'critical', ...);

    RAISE NOTICE 'Inserted persona: %', v_persona_id;
END $$;

-- Validation queries...

COMMIT;
```

### Step 5: Validate SQL

**Built-in validations**:
- ✅ Transaction blocks present
- ✅ INSERT statements valid
- ✅ Foreign key references exist
- ✅ Enum values match constraints
- ✅ Required fields populated
- ✅ Data types correct

### Step 6: Deploy to Database

```bash
# Option 1: Using orchestrator with auto-deploy
python persona_seeding_orchestrator.py \
    --database-url "$DATABASE_URL" \
    --tenant-id "$TENANT_ID" \
    --business-function medical-affairs \
    --auto-deploy

# Option 2: Manual deployment
psql "$DATABASE_URL" -f sql/seeds/personas_deployment_20251117_100000.sql
```

### Step 7: Verify Deployment

```sql
-- Check persona count
SELECT
    f.name as function,
    COUNT(p.id) as persona_count
FROM personas p
JOIN org_functions f ON p.function_id = f.id
WHERE p.tenant_id = 'YOUR_TENANT_ID'
GROUP BY f.name;

-- Check v5.0 extension data
SELECT
    'Week in Life' as table_name,
    COUNT(*) as records
FROM persona_week_in_life
WHERE tenant_id = 'YOUR_TENANT_ID'
UNION ALL
SELECT
    'Pain Points',
    COUNT(*)
FROM persona_pain_points
WHERE tenant_id = 'YOUR_TENANT_ID'
UNION ALL
SELECT
    'Goals',
    COUNT(*)
FROM persona_goals
WHERE tenant_id = 'YOUR_TENANT_ID';
```

---

## 🔧 Fixing Medical Affairs v5.0 Extensions

### Special Command for Medical Affairs

```bash
python persona_seeding_orchestrator.py \
    --database-url "$DATABASE_URL" \
    --tenant-id "$TENANT_ID" \
    --fix-medical-affairs
```

This will:
1. Find existing Medical Affairs personas
2. Map v5.0 extension data correctly
3. Generate fix SQL for missing tables
4. Deploy extension data

---

## 📁 File Structure

```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
├── sql/
│   ├── tools/                           # Core tools
│   │   ├── schema_introspector.py       # Read database schema
│   │   ├── data_capture_templates.py    # Generate templates
│   │   ├── transformation_pipeline.py   # Transform to SQL
│   │   └── persona_seeding_orchestrator.py # Main orchestrator
│   │
│   ├── schema_mappings/                 # Generated schema info
│   │   ├── persona_schema_mappings.json
│   │   └── transformation_config.json
│   │
│   └── seeds/                          # Generated SQL files
│       └── personas_deployment_*.sql
│
├── data_capture_templates/              # Data templates
│   ├── medical-affairs_persona_template.json
│   ├── sales_persona_template.json
│   └── [function]_persona_template.json
│
└── .claude/
    └── DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md
```

---

## 🎯 Business Function Templates

### Supported Functions

1. **Medical Affairs** (`medical-affairs`)
2. **Sales** (`sales`)
3. **Marketing** (`marketing`)
4. **Product** (`product`)
5. **Engineering** (`engineering`)
6. **Customer Success** (`customer-success`)
7. **Operations** (`operations`)
8. **Finance** (`finance`)
9. **Human Resources** (`human-resources`)
10. **Legal** (`legal`)
11. **Research & Development** (`research-development`)
12. **Executive** (`executive`)

### Example: Sales Persona

```json
{
  "core_profile": {
    "name": "Michael Thompson",
    "slug": "michael-thompson-enterprise-sales",
    "title": "Enterprise Sales Director",
    "tagline": "Driving healthcare transformation through partnerships"
  },
  "professional_context": {
    "seniority_level": "senior",
    "years_of_experience": 18,
    "team_size": 15,
    "budget_authority": 5000000,
    "decision_making_style": "relationship-driven"
  },
  "business_function": "sales",
  "department": "sales",
  "role_slug": "enterprise-sales-director",
  "pain_points": [
    {
      "pain_point": "Long sales cycles with healthcare enterprises",
      "severity": "high",
      "frequency": "daily"
    }
  ]
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Schema Mismatch Errors

**Error**: `column "employment_status" of relation "personas" does not exist`

**Solution**:
1. Re-run schema introspection
2. Check that transformation uses latest schema mapping
3. Verify column names match exactly (case-sensitive)

### Issue 2: Foreign Key Violations

**Error**: `insert or update on table "personas" violates foreign key constraint`

**Solution**:
1. Ensure org tables are populated first
2. Check that slug values match exactly
3. Use SELECT subqueries for lookups:
```sql
(SELECT id FROM org_roles WHERE slug = 'medical-affairs-leader' LIMIT 1)
```

### Issue 3: CHECK Constraint Violations

**Error**: `new row violates check constraint "personas_seniority_level_check"`

**Solution**:
1. Check allowed enum values in schema
2. Use exact values (case-sensitive)
3. Valid options: 'junior', 'mid', 'senior', 'executive'

### Issue 4: JSONB vs TEXT[] Confusion

**Rule**: NO JSONB for structured data (per golden rules)

**Correct approach**:
- Simple lists → TEXT[]
- Complex objects → Separate normalized tables
- Metadata only → JSONB

---

## 📊 Validation Checklist

### Pre-Deployment
- [ ] Schema introspection completed
- [ ] Templates filled with valid data
- [ ] Enum values match constraints
- [ ] Foreign key references valid
- [ ] Required fields populated

### Post-Deployment
- [ ] Row counts match expectations
- [ ] Foreign key integrity verified
- [ ] No orphaned records
- [ ] v5.0 extension tables populated
- [ ] Validation queries pass

---

## 🚀 Advanced Usage

### Batch Processing Multiple Functions

```bash
#!/bin/bash
# deploy_all_personas.sh

FUNCTIONS=("medical-affairs" "sales" "marketing" "product" "engineering")

for func in "${FUNCTIONS[@]}"; do
    echo "Processing $func..."
    python persona_seeding_orchestrator.py \
        --database-url "$DATABASE_URL" \
        --tenant-id "$TENANT_ID" \
        --business-function "$func" \
        --auto-deploy
done
```

### Custom Validation Rules

Add to `transformation_pipeline.py`:

```python
def custom_validation(persona_data):
    """Add custom business rules"""
    if persona_data.get('seniority_level') == 'executive':
        if not persona_data.get('budget_authority'):
            raise ValueError("Executives must have budget authority")
    return True
```

### Dry Run Mode

Test without database changes:

```bash
python persona_seeding_orchestrator.py \
    --database-url "$DATABASE_URL" \
    --tenant-id "$TENANT_ID" \
    --business-function sales \
    --dry-run
```

---

## 📞 Support & Troubleshooting

### Logs Location
- Schema introspection: Check console output
- Transformation: Look for warnings/errors in output
- SQL generation: Review generated SQL files
- Deployment: Check PostgreSQL logs

### Debug Mode

Set logging level for detailed output:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Common Commands

```bash
# Check if tables exist
psql "$DATABASE_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'persona%' ORDER BY table_name;"

# Count personas by function
psql "$DATABASE_URL" -c "SELECT f.name, COUNT(p.id) FROM personas p JOIN org_functions f ON p.function_id = f.id GROUP BY f.name;"

# Check for orphaned records
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM persona_pain_points pp WHERE NOT EXISTS (SELECT 1 FROM personas p WHERE p.id = pp.persona_id);"
```

---

## ✅ Success Metrics

**Target State**:
- ✅ All 31 Medical Affairs personas with full v5.0 data
- ✅ Reusable pipeline for any business function
- ✅ Zero schema mismatch errors
- ✅ 100% foreign key integrity
- ✅ Compliant with database golden rules
- ✅ < 5 minutes per business function deployment

---

## 🔄 Next Steps

1. **Immediate**:
   - Deploy Medical Affairs v5.0 extensions
   - Validate all 69 tables populated

2. **Week 1**:
   - Deploy Sales personas
   - Deploy Marketing personas
   - Deploy Product personas

3. **Week 2**:
   - Complete all business functions
   - Create automated testing suite
   - Document lessons learned

4. **Future**:
   - Implement schema normalization migration
   - Add GraphQL API integration
   - Create persona management UI

---

## 📝 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-11-17 | Initial complete guide | VITAL Platform Orchestrator |

---

**Status**: ✅ PRODUCTION READY
**Compliance**: Database Golden Rules v1.0
**Support**: VITAL Platform Team

---

*This guide is the authoritative source for persona seeding processes in the VITAL platform.*