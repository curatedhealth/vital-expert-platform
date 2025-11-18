# Production-Ready Persona Seeding System

## Overview

This is a **battle-tested, automated persona seeding system** that intelligently transforms JSON persona data into SQL based on the actual database schema. It handles:

- Schema mismatches (enum values, data types)
- Missing required fields
- Multiple slug formats (auto-detection)
- Comprehensive validation
- Transaction-safe deployments

## Quick Start

### 1. Capture Persona Data

Use the JSON format from `Medical_Affairs_Personas_V5_EXTENDED.json` as a template.

### 2. Run the Pipeline

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/seeds/00_PREPARATION"

# Step 1: Capture current database schema
python3 schema_reader.py

# Step 2: (Optional) Discover enum mismatches
python3 discover_enum_mismatches.py

# Step 3: (Optional) Find missing required fields
python3 find_missing_required_fields.py

# Step 4: Generate SQL
python3 smart_transform_v5.py

# Step 5: Test with dry-run
./test_deployment.sh

# Step 6: Deploy to production
psql "$DB_URL" -f DEPLOY_MA_V5_COMPLETE.sql
```

## Files in This System

### Core Scripts

1. **`schema_reader.py`** - Introspects database to capture actual schema
   - Extracts table structures
   - Captures CHECK constraints
   - Finds UNIQUE constraints
   - Maps foreign keys
   - Gets enum types

2. **`smart_transform_v5.py`** - The main transformation engine
   - Validates JSON against schema
   - Maps enum values automatically
   - Applies default values for missing fields
   - Handles multiple slug formats
   - Generates transaction-safe SQL

3. **`discover_enum_mismatches.py`** - Finds all enum value mismatches
   - Compares JSON values vs CHECK constraints
   - Suggests VALUE_MAPPINGS
   - Helps identify data quality issues

4. **`find_missing_required_fields.py`** - Finds missing required fields
   - Identifies NOT NULL columns without values
   - Suggests DEFAULT_VALUES
   - Helps ensure data completeness

5. **`test_deployment.sh`** - Dry-run test script
   - Tests SQL with BEGIN/ROLLBACK
   - Saves output to log file
   - Safe to run multiple times

### Generated Files

1. **`actual_schema.json`** - Complete database schema export
2. **`DEPLOY_MA_V5_COMPLETE.sql`** - Production-ready deployment SQL
3. **`TEST_DEPLOY_MA_V5.sql`** - Test version with ROLLBACK
4. **`test_deployment.log`** - Test execution log

## Configuration

### Value Mappings (`VALUE_MAPPINGS`)

Maps JSON enum values to database-allowed values:

```python
VALUE_MAPPINGS = {
    'persona_annual_conferences': {
        'conference_type': {
            'clinical': 'technical',
            'professional_development': 'leadership',
        },
    },
}
```

### Default Values (`DEFAULT_VALUES`)

Provides defaults for missing required fields:

```python
DEFAULT_VALUES = {
    'persona_case_studies': {
        'industry': 'Healthcare/Pharmaceutical',
        'case_type': 'success_story',
        'relevance_score': 8,
    },
}
```

## How It Works

### 1. Schema Introspection

The system first captures the ACTUAL database schema:
- All persona tables and columns
- Data types (TEXT, INTEGER, ARRAY, etc.)
- Constraints (CHECK, UNIQUE, FOREIGN KEY)
- NOT NULL requirements

### 2. Intelligent Transformation

For each persona:

1. **Slug Matching**: Tries multiple slug variants:
   - Original slug from JSON
   - With `pharma-` prefix
   - By name match (fallback)

2. **Value Mapping**: Applies configured mappings for enum mismatches

3. **Default Values**: Fills in missing required fields

4. **Type Conversion**:
   - Lists → TEXT[] arrays
   - Nested objects → JSON or separate tables
   - Numbers → correct precision
   - Timestamps → TIMESTAMPTZ

5. **Validation**: Checks constraints before generating SQL

### 3. SQL Generation

Generates transaction-safe SQL:
- Single BEGIN/COMMIT block
- Temporary tables for persona ID lookups
- Proper error messages
- Rollback on any error

## Deployment Strategy

### Dry-Run First (ALWAYS!)

```bash
./test_deployment.sh
```

This runs the SQL with `ROLLBACK` instead of `COMMIT`. Review the log:

```bash
grep "ERROR" test_deployment.log | head -20
```

### Production Deployment

Only after successful dry-run:

```bash
DB_URL="postgresql://postgres:PASSWORD@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"
psql "$DB_URL" -f DEPLOY_MA_V5_COMPLETE.sql
```

### Verify Deployment

```sql
-- Check row counts
SELECT 'persona_annual_conferences' as table_name, COUNT(*) as row_count FROM persona_annual_conferences
UNION ALL
SELECT 'persona_case_studies', COUNT(*) FROM persona_case_studies
UNION ALL
SELECT 'persona_evidence_summary', COUNT(*) FROM persona_evidence_summary
-- ... add more tables as needed
;
```

## Extending to New Business Functions

### For a New Business Function (e.g., Sales, Marketing):

1. **Capture Persona Data** in JSON format (use template)

2. **Update Configuration**:
   ```python
   # In smart_transform_v5.py
   JSON_DATA_FILE = "/path/to/Sales_Personas_V5.json"
   OUTPUT_SQL_FILE = "DEPLOY_SALES_V5.sql"
   ```

3. **Run Discovery Scripts**:
   ```bash
   python3 discover_enum_mismatches.py
   python3 find_missing_required_fields.py
   ```

4. **Update Mappings** based on discoveries

5. **Generate and Test**:
   ```bash
   python3 smart_transform_v5.py
   ./test_deployment.sh
   ```

## Troubleshooting

### "Persona not found" Error

The persona slug doesn't exist in database. Options:
1. Load core personas first
2. Update slug in JSON to match database
3. Add slug to name-matching fallback

### CHECK Constraint Violation

An enum value isn't allowed. Options:
1. Add mapping in `VALUE_MAPPINGS`
2. Update JSON data to use valid value
3. Consider if schema needs updating

### NOT NULL Constraint Violation

A required field is missing. Options:
1. Add default in `DEFAULT_VALUES`
2. Add field to JSON data
3. Make field nullable (if business logic allows)

### Data Type Mismatch

JSON type doesn't match database type. Options:
1. Update `format_sql_value()` method
2. Pre-process JSON data
3. Add type conversion mapping

## Success Criteria

✅ All 31 Medical Affairs personas deployed
✅ All 40+ v5.0 extension tables populated
✅ Zero manual SQL writing required
✅ Transaction-safe (rollback on error)
✅ Works for any business function
✅ Clear error messages

## Maintenance

### Updating VALUE_MAPPINGS

When new enum mismatches are found:

1. Run `discover_enum_mismatches.py`
2. Copy suggested mappings
3. Review and adjust as needed
4. Test with dry-run

### Updating DEFAULT_VALUES

When new required fields are added:

1. Run `find_missing_required_fields.py`
2. Copy suggested defaults
3. Replace generic values with meaningful ones
4. Test with dry-run

## Database Connection

```bash
export DB_URL="postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"
```

**Tenant ID**: `f7aa6fd4-0af9-4706-8b31-034f1f7accda`

## Generated Statistics

**Current Deployment**:
- 31 personas
- 1,487 INSERT statements
- 5,356 lines of SQL
- 23 enum mappings
- 8 tables with default values

## Contact & Support

For issues or questions:
1. Check `test_deployment.log` for detailed errors
2. Run discovery scripts to diagnose
3. Review this README
4. Check schema with `schema_reader.py`

---

**Generated**: 2025-11-17
**Version**: 5.0
**Status**: Production-Ready
