# Migration Prerequisites

## ⚠️ Important: Base Schema Required

The `migrate_persona_schema_gen_ai_attributes.sql` migration script **requires** the base persona schema to exist first.

## Required Base Schema

**File**: `.claude/vital-expert-docs/personas/PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`

This base schema includes:
- ✅ Core `personas` table
- ✅ `opportunities` table
- ✅ `persona_pain_points` table
- ✅ `persona_goals` table
- ✅ All required enumerations (`archetype_type`, `service_layer`, etc.)
- ✅ All other supporting tables

## Migration Order

### Step 1: Run Base Schema (if not already done)
```sql
-- Run the base schema first
\i .claude/vital-expert-docs/personas/PERSONA_DATABASE_SCHEMA_NORMALIZED.sql
```

### Step 2: Run Gen AI Migration
```sql
-- Then run the Gen AI enhancement migration
\i migrate_persona_schema_gen_ai_attributes.sql
```

## Verification

Before running the migration, verify the base schema exists:

```sql
-- Check if required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('personas', 'opportunities', 'persona_pain_points', 'persona_goals') 
        THEN '✅ Required'
        ELSE 'Optional'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('personas', 'opportunities', 'persona_pain_points', 'persona_goals')
ORDER BY table_name;
```

If all 4 tables show "✅ Required", you're ready to run the migration.

## Error: "relation does not exist"

If you see this error:
```
ERROR: 42P01: relation "opportunities" does not exist
```

**Solution**: Run the base schema first:
```sql
\i .claude/vital-expert-docs/personas/PERSONA_DATABASE_SCHEMA_NORMALIZED.sql
```

Then run the migration again.

## Quick Check Script

Run this to verify everything is ready:

```sql
DO $$
DECLARE
    missing_tables TEXT[];
BEGIN
    SELECT array_agg(table_name)
    INTO missing_tables
    FROM (
        SELECT 'personas' as table_name
        UNION SELECT 'opportunities'
        UNION SELECT 'persona_pain_points'
        UNION SELECT 'persona_goals'
    ) required
    WHERE NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = required.table_name
    );
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables: %. Please run base schema first.', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All required tables exist. Ready to run migration.';
    END IF;
END $$;
```

