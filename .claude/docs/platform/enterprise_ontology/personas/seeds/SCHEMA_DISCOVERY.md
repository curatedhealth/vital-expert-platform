# Persona Schema Discovery Guide

**Version**: 1.0.0
**Last Updated**: November 27, 2025
**Status**: Critical Reference

---

## ⚠️ IMPORTANT: Always Verify Schema First

The `personas` table schema has changed multiple times. **ALWAYS run this query before creating seed files:**

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'personas' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

---

## Known Schema Versions

### Version A: Migration 007_organizational_hierarchy.sql (Older)

```sql
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns**: `id`, `persona_key`, `display_name`, `description`, `is_active`, `created_at`, `updated_at`

### Version B: Migration 20251120000002_comprehensive_schema.sql (Newer)

```sql
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns**: `id`, `name`, `description`, `role_id`, `function_id`, `department_id`, `created_at`, `updated_at`

---

## How to Determine Which Schema is Active

Run this query:

```sql
-- Check for persona_key column (Version A)
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'persona_key'
) as has_persona_key;

-- Check for role_id column (Version B)
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' 
    AND column_name = 'role_id'
) as has_role_id;
```

---

## Seed File Templates

### For Schema Version A (persona_key)

```sql
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'msl_automator',
    'Dr. Sarah Chen - MSL Automator',
    E'Rich description with all persona data...',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();
```

### For Schema Version B (name, role_id)

```sql
INSERT INTO personas (name, description, role_id, function_id, department_id, created_at, updated_at)
VALUES (
    'Dr. Sarah Chen - MSL Automator',
    E'Rich description with all persona data...',
    (SELECT id FROM org_roles WHERE role_name ILIKE '%Medical Science Liaison%' LIMIT 1),
    (SELECT id FROM org_functions WHERE department_name ILIKE '%Medical%Affairs%' LIMIT 1),
    (SELECT id FROM org_departments WHERE department_name ILIKE '%Field%Medical%' LIMIT 1),
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
```

---

## Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `column "persona_key" does not exist` | Using Version A template on Version B schema | Use `name` instead of `persona_key` |
| `column "description" does not exist` | Schema has different column | Run schema discovery query |
| `column "department_name" does not exist` | Wrong column name for org_functions | Check actual column names |
| `column "role_name" does not exist` | Wrong column name for org_roles | Check actual column names |

---

## Best Practice: Adaptive Seed Script

```sql
DO $$
DECLARE
    has_persona_key BOOLEAN;
    has_role_id BOOLEAN;
BEGIN
    -- Check schema version
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'personas' AND column_name = 'persona_key'
    ) INTO has_persona_key;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'personas' AND column_name = 'role_id'
    ) INTO has_role_id;
    
    IF has_persona_key THEN
        RAISE NOTICE 'Using Schema Version A (persona_key)';
        -- Insert using persona_key
    ELSIF has_role_id THEN
        RAISE NOTICE 'Using Schema Version B (role_id)';
        -- Insert using name
    ELSE
        RAISE EXCEPTION 'Unknown personas schema version!';
    END IF;
END $$;
```

---

## Related Files

- Migration 007: `supabase/migrations/007_organizational_hierarchy.sql`
- Migration 20251120: `supabase/migrations/20251120000002_comprehensive_schema.sql`
- Gold Standard Schema: `.claude/docs/platform/personas/PERSONA_DATABASE_SCHEMA_NORMALIZED.sql`

---

**Maintained By**: VITAL Platform Team  
**Last Review**: 2025-11-27

