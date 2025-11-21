# Strategic Persona Import Plan - 5 Steps

## Overview

This is a systematic, repeatable process to import persona data with zero errors.

## Step 1: Understand Database Schema (DIAGNOSTIC)

### Run This Query
```bash
export PGPASSWORD='flusd9fqEb4kkTJ1'
DB_URL="postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres"

psql "$DB_URL" -f "sql/seeds/00_PREPARATION/DIAGNOSTIC_COMPLETE_SCHEMA.sql" > SCHEMA_ANALYSIS.txt

# Review the output
cat SCHEMA_ANALYSIS.txt
```

### What This Shows
- ✅ All persona tables that exist
- ✅ All columns in each table
- ✅ Data types, nullable status, defaults
- ✅ Foreign keys, constraints, ENUMs
- ✅ Missing tables or columns

### Key Questions to Answer
1. Which tables exist?
2. What columns does each table have?
3. Are there any missing expected tables?
4. What are the exact data types?

## Step 2: Fix Database Gaps

Based on Step 1 results, create/run migration scripts to add missing:

### 2a. Missing Tables
If any tables are missing, create them:
```sql
-- Example: If persona_XYZ is missing
CREATE TABLE IF NOT EXISTS persona_XYZ (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- ... other columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2b. Missing Columns
If columns are missing from existing tables:
```sql
-- Add missing columns
ALTER TABLE persona_goals ADD COLUMN IF NOT EXISTS goal_text TEXT;
ALTER TABLE persona_goals ADD COLUMN IF NOT EXISTS sequence_order INTEGER;
```

### 2c. Run Preparation Scripts
```bash
cd sql/seeds/00_PREPARATION
for script in *.sql; do
    echo "Running $script..."
    psql "$DB_URL" -f "$script"
done
```

## Step 3: Update TEMPLATE_personas_seed.sql

### 3a. Extract Current Schema to Template Format
Create a script that generates the template based on actual database schema:

```bash
python3 scripts/generate_template_from_schema.py
```

This will:
1. Query database for exact column structure
2. Generate INSERT statements using actual columns
3. Update TEMPLATE_personas_seed.sql

### 3b. Verify Template Structure
```bash
# Check that template uses correct columns
grep "INSERT INTO persona_goals" sql/seeds/TEMPLATES/TEMPLATE_personas_seed.sql
# Should show: (persona_id, tenant_id, goal_text, sequence_order)
# NOT: (persona_id, tenant_id, goal_text, goal_category, sequence_order)
```

### 3c. Manual Template Review Checklist
- [ ] persona_goals: 4 columns (persona_id, tenant_id, goal_text, sequence_order)
- [ ] persona_pain_points: 4 columns (persona_id, tenant_id, pain_point_text, sequence_order)
- [ ] persona_challenges: 4 columns (persona_id, tenant_id, challenge_text, sequence_order)
- [ ] persona_organization_types: 3 columns (persona_id, tenant_id, organization_type)
- [ ] persona_typical_locations: 4 columns (persona_id, tenant_id, location_name, is_primary)
- [ ] persona_vpanes_scoring: 9 columns (includes all 6 scores + rationale)

## Step 4: Transform JSON to SQL Using Template

### 4a. Run Transformation Script
```bash
python3 scripts/transform_persona_json_to_sql.py \
  "/Users/hichamnaim/Downloads/Medical_Affairs_Personas_Part2_of_3_COMPLETE.json"
```

### 4b. Verify Output
```bash
# Check generated SQL
head -100 sql/seeds/03_content/medical_affairs_personas_part2.sql

# Verify column counts match
grep "INSERT INTO persona_goals" sql/seeds/03_content/medical_affairs_personas_part2.sql | head -3
grep "INSERT INTO persona_organization_types" sql/seeds/03_content/medical_affairs_personas_part2.sql | head -3
```

### 4c. Validation Checklist
- [ ] All INSERT statements have correct column count
- [ ] No `goal_category`, `pain_category`, etc. columns
- [ ] persona_organization_types has 3 values, not 5
- [ ] persona_typical_locations has 4 values, not 5
- [ ] All quotes properly escaped

## Step 5: Load Data Without Errors

### 5a. Test Load (Dry Run)
```bash
# Test with one persona first (comment out others in SQL file)
psql "$DB_URL" -c "\set ON_ERROR_STOP on" -f "sql/seeds/03_content/medical_affairs_personas_part2.sql"
```

### 5b. Full Load
```bash
cd sql/seeds/03_content
./LOAD_PART2.sh
```

### 5c. Verify Data Loaded
```sql
-- Check personas were created
SELECT COUNT(*) FROM personas WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- Check junction tables populated
SELECT COUNT(*) FROM persona_goals WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';
SELECT COUNT(*) FROM persona_pain_points WHERE tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda';

-- Sample data check
SELECT
    p.name,
    p.title,
    COUNT(DISTINCT g.id) as goals_count,
    COUNT(DISTINCT pp.id) as pain_points_count
FROM personas p
LEFT JOIN persona_goals g ON g.persona_id = p.id
LEFT JOIN persona_pain_points pp ON pp.persona_id = p.id
WHERE p.tenant_id = 'f7aa6fd4-0af9-4706-8b31-034f1f7accda'
GROUP BY p.id, p.name, p.title
ORDER BY p.name;
```

### 5d. Error Handling
If errors occur:

**Error: "column does not exist"**
→ Go back to Step 2, add missing column
→ Update template in Step 3
→ Regenerate SQL in Step 4
→ Retry Step 5

**Error: "INSERT has more expressions than target columns"**
→ Go back to Step 3, fix template column count
→ Regenerate SQL in Step 4
→ Retry Step 5

**Error: "violates foreign key constraint"**
→ Ensure org_functions, org_departments, org_roles exist first
→ Load organizational structure first
→ Retry Step 5

## Repeat for Additional Personas

Once Steps 1-5 work perfectly for Part 2:

```bash
# Part 1
python3 scripts/transform_persona_json_to_sql.py Part1.json
psql "$DB_URL" -c "\set ON_ERROR_STOP on" -f "sql/seeds/03_content/part1.sql"

# Part 3
python3 scripts/transform_persona_json_to_sql.py Part3.json
psql "$DB_URL" -c "\set ON_ERROR_STOP on" -f "sql/seeds/03_content/part3.sql"

# Market Access
python3 scripts/transform_persona_json_to_sql.py Market_Access.json
psql "$DB_URL" -c "\set ON_ERROR_STOP on" -f "sql/seeds/03_content/market_access.sql"
```

## Success Criteria

✅ **Step 1**: Complete schema documented, no unknowns
✅ **Step 2**: All tables exist, all columns present
✅ **Step 3**: Template matches database exactly
✅ **Step 4**: SQL generated with correct column counts
✅ **Step 5**: Data loads with ZERO errors

## Files Created for This Process

| File | Purpose |
|------|---------|
| `00_PREPARATION/DIAGNOSTIC_COMPLETE_SCHEMA.sql` | Step 1 - Schema analysis |
| `scripts/transform_persona_json_to_sql.py` | Step 4 - JSON to SQL transformation |
| `03_content/LOAD_PART2.sh` | Step 5 - Load script |
| `STRATEGIC_PLAN.md` | This file - Complete process |

## Maintenance

When schema changes:
1. Run Step 1 (diagnostic) to see new schema
2. Update Step 2 scripts if needed
3. Regenerate template in Step 3
4. Steps 4-5 work automatically

---

**Status**: Ready to Execute
**Next Action**: Run Step 1 diagnostic when network available
**Goal**: Zero-error persona imports
