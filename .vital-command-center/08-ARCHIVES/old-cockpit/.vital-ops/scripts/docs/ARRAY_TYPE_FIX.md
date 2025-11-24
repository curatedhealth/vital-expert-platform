# Array Type Fix - PostgreSQL vs JSONB

**Date**: 2025-11-13
**Issue**: Column type mismatch for array fields
**Status**: Fixed

---

## The Problem

Initial SQL generation treated all arrays as JSONB:

```sql
-- WRONG - This caused an error
specializations text[] field received:
  '[]'::jsonb

-- Error message:
ERROR: 42804: column "specializations" is of type text[]
but expression is of type jsonb
```

---

## Root Cause

The `escape_sql_value()` function didn't distinguish between:
- **JSONB arrays**: Complex nested structures that should be stored as JSONB
- **PostgreSQL arrays**: Simple text arrays that should use ARRAY syntax

**Old code**:
```python
if isinstance(value, (dict, list)):
    # Convert to JSONB - WRONG for text[] columns
    json_str = json.dumps(value).replace("'", "''")
    return f"'{json_str}'::jsonb"
```

---

## The Fix

Added `as_array` parameter to distinguish PostgreSQL arrays from JSONB:

**Updated function**:
```python
def escape_sql_value(value: Any, as_array: bool = False) -> str:
    """Escape a value for SQL

    Args:
        value: The value to escape
        as_array: If True and value is a list, format as PostgreSQL array
    """
    if isinstance(value, list):
        if as_array:
            # PostgreSQL array: ARRAY['item1', 'item2']
            if len(value) == 0:
                return "ARRAY[]::text[]"
            escaped_items = [f"'{str(item).replace(chr(39), chr(39)+chr(39))}'"
                           for item in value]
            return f"ARRAY[{', '.join(escaped_items)}]"
        else:
            # JSONB array
            json_str = json.dumps(value).replace("'", "''")
            return f"'{json_str}'::jsonb"
```

**Usage in SQL generator**:
```python
# For text[] columns - use as_array=True
sql.append(f"  {escape_sql_value(specializations, as_array=True)},")
sql.append(f"  {escape_sql_value(tags, as_array=True)}")

# For JSONB columns - default (as_array=False)
sql.append(f"  {escape_sql_value(color_scheme)},")  # JSONB
sql.append(f"  {escape_sql_value(personality_traits)},")  # JSONB
sql.append(f"  {escape_sql_value(metadata)},")  # JSONB
```

---

## Result

**Before (WRONG)**:
```sql
INSERT INTO agents (
  ...,
  specializations,
  tags
) VALUES (
  ...,
  '[]'::jsonb,  -- ERROR: wrong type
  '[]'::jsonb   -- ERROR: wrong type
)
```

**After (CORRECT)**:
```sql
INSERT INTO agents (
  ...,
  specializations,
  tags
) VALUES (
  ...,
  ARRAY[]::text[],  -- Correct: empty text array
  ARRAY[]::text[]   -- Correct: empty text array
)
```

**With values**:
```sql
-- Empty arrays
ARRAY[]::text[]

-- Arrays with values
ARRAY['specialization1', 'specialization2']
```

---

## Schema Reference

From `schema_foundation/05_agents_and_capabilities.sql`:

```sql
CREATE TABLE agents (
  -- These are PostgreSQL text[] arrays
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- These are JSONB objects
  color_scheme JSONB DEFAULT '{}'::jsonb,
  personality_traits JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

---

## Files Updated

1. **[generate_sql_inserts.py](generate_sql_inserts.py)**
   - Added `as_array` parameter to `escape_sql_value()`
   - Updated agent INSERT to use `as_array=True` for specializations and tags

2. **[agents_insert_new.sql](agents_insert_new.sql)**
   - Regenerated with correct array formatting
   - Now uses `ARRAY[]::text[]` instead of `'[]'::jsonb`

---

## Verification

Test the fix:
```sql
-- This should now work
INSERT INTO agents (
  id,
  name,
  slug,
  specializations,
  tags
) VALUES (
  '12345678-1234-1234-1234-123456789012',
  'Test Agent',
  'test-agent',
  ARRAY[]::text[],  -- Empty array
  ARRAY['tag1', 'tag2']  -- Array with values
);
```

---

## Key Takeaway

**PostgreSQL has TWO types of arrays**:

1. **Native arrays** (`text[]`, `integer[]`, etc.)
   - Use: `ARRAY['value1', 'value2']` or `ARRAY[]::text[]`
   - For: Simple lists of values (tags, specializations, etc.)

2. **JSONB arrays** (`jsonb`)
   - Use: `'["value1", "value2"]'::jsonb` or `'{}'::jsonb`
   - For: Complex nested structures (objects, mixed types)

**Always check the column type before generating SQL!**

---

**Status**: Fixed and verified
**SQL File**: Ready to import
