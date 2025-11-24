# ✅ Fixed: Column Name Mismatch

## Issue
Migration failed with:
```
ERROR: 42703: column "category" of relation "node_library" does not exist
```

## Root Cause
The actual table schema uses:
- `node_category` (not `category`)
- `node_config` (not `config`)

## Fixed Files

### 1. ✅ `database/migrations/026_seed_legacy_node_library.sql`
**Changed**:
- `category` → `node_category`
- `config` → `node_config`

**All INSERT statements updated**:
```sql
-- Before
INSERT INTO node_library (..., category, ..., config, ...)

-- After  
INSERT INTO node_library (..., node_category, ..., node_config, ...)
```

### 2. ✅ `scripts/generate-legacy-migration.ts`
**Changed**:
- Column names in INSERT statements
- Column names in verification queries

## How to Apply Fix

### Option 1: Use the Fixed SQL File Directly
```sql
-- Copy and run in Supabase SQL Editor
-- File: database/migrations/026_seed_legacy_node_library.sql
```

### Option 2: Regenerate with TypeScript Script
```bash
# This will now generate correct column names
npx tsx scripts/generate-legacy-migration.ts
```

## Verification
After running the migration, verify with:
```sql
-- Check inserted nodes
SELECT node_category, COUNT(*) as count 
FROM node_library 
WHERE is_builtin = true 
GROUP BY node_category 
ORDER BY node_category;

-- Should show counts for:
-- research, data, control_flow, panel, panel_workflow, etc.
```

---

**Status**: ✅ Fixed and ready to run!

The migration will now work correctly with the actual `node_library` table schema.

