# Database Migrations

> **Complete migration history and management for VITAL Expert Platform**

---

## 📋 Migration Index

### Active Migrations

Current active migrations that should be applied to new databases:

| Migration | Date | Description | Status |
|-----------|------|-------------|--------|
| `20251110120000_unified_prompts_schema.sql` | 2025-01-10 | Unified prompts architecture | ✅ Active |
| `20251110000000_create_panel_templates_schema.sql` | 2025-01-10 | Panel templates schema | ✅ Active |
| `20251109_add_uuid_to_jtbd_library.sql` | 2025-01-09 | JTBD UUID support | ✅ Active |
| `20251008000007_final_fix.sql` | 2025-10-08 | Final schema fixes | ✅ Active |
| `20251008000004_complete_cloud_migration.sql` | 2025-10-08 | Cloud migration complete | ✅ Active |
| `20251008000002_clean_migration.sql` | 2025-10-08 | Clean migration | ✅ Active |
| `20241008000001_complete_vital_schema.sql` | 2024-10-08 | Complete VITAL schema | ✅ Active |

### Archived Migrations

Older migrations moved to `/archive` directory for historical reference:

- October 2024 migrations → `archive/2024-10/`
- September 2024 migrations → `archive/2024-09/`

---

## 🔄 Migration Workflow

### Creating a New Migration

```bash
# Create new migration file
supabase migration new <descriptive_name>

# Example:
supabase migration new add_agent_categories

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_agent_categories.sql
```

### Applying Migrations

```bash
# Apply all pending migrations
supabase db push

# Apply to specific database
supabase db push --db-url postgresql://...

# Dry run (show what would be applied)
supabase db push --dry-run
```

### Rolling Back

```bash
# Reset database to fresh state
supabase db reset

# Reset and reapply all migrations
supabase db reset --db-url postgresql://...
```

### Checking Status

```bash
# View migration status
supabase migration list

# Check which migrations have been applied
supabase db diff
```

---

## 📁 Directory Structure

```
supabase/migrations/
├── README.md                 # This file
├── [active_migrations].sql   # Current active migrations
├── archive/                  # Historical migrations
│   ├── 2024-10/             # October 2024 migrations
│   ├── 2024-09/             # September 2024 migrations
│   └── deprecated/          # Deprecated migrations
└── utilities/                # Migration utility scripts
    ├── verify_migrations.sh
    └── backup_before_migrate.sh
```

---

## 🎯 Migration Best Practices

### 1. **Naming Conventions**

```
YYYYMMDDHHMMSS_descriptive_action.sql

Examples:
- 20251110120000_add_agent_categories.sql
- 20251110130000_create_workflow_steps_table.sql
- 20251110140000_update_prompts_add_suite_column.sql
```

### 2. **Migration Structure**

```sql
-- ============================================================================
-- Migration: <Descriptive Title>
-- ============================================================================
-- Purpose: Clear description of what this migration does
-- Author: <Your Name>
-- Date: YYYY-MM-DD
-- Dependencies: List any dependent migrations
-- ============================================================================

-- Enable required extensions (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Your migration SQL here...

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_table_column ON table(column);

-- Add comments for documentation
COMMENT ON TABLE table_name IS 'Description of table purpose';

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  -- Add verification logic
  RAISE NOTICE 'Migration completed successfully';
END $$;
```

### 3. **Safety Practices**

- ✅ **Always test locally first** - Run on local Supabase before production
- ✅ **Use IF EXISTS/IF NOT EXISTS** - Make migrations idempotent
- ✅ **Add rollback instructions** - Comment how to undo changes
- ✅ **Backup before major changes** - Especially for data migrations
- ✅ **Test with real data** - Use production-like data volumes
- ✅ **Version control** - Commit migrations to git immediately

### 4. **Common Patterns**

#### Adding a Table
```sql
CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_tenant
  ON public.new_table(tenant_id);

-- Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "tenant_isolation_new_table"
  ON public.new_table
  USING (tenant_id = (current_setting('app.tenant_id', true))::uuid);
```

#### Adding a Column
```sql
ALTER TABLE public.existing_table
ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Add default value
ALTER TABLE public.existing_table
ALTER COLUMN new_column SET DEFAULT 'default_value';

-- Add constraint
ALTER TABLE public.existing_table
ADD CONSTRAINT check_new_column
  CHECK (new_column IN ('value1', 'value2'));
```

#### Data Migration
```sql
-- Migrate data in batches
DO $$
DECLARE
  batch_size INTEGER := 1000;
  offset_val INTEGER := 0;
  affected_rows INTEGER;
BEGIN
  LOOP
    -- Update batch
    UPDATE public.table
    SET new_column = old_column || '_migrated'
    WHERE id IN (
      SELECT id FROM public.table
      WHERE new_column IS NULL
      ORDER BY id
      LIMIT batch_size
      OFFSET offset_val
    );

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    EXIT WHEN affected_rows = 0;

    offset_val := offset_val + batch_size;
    RAISE NOTICE 'Migrated % rows (offset: %)', affected_rows, offset_val;
  END LOOP;
END $$;
```

---

## 🚨 Troubleshooting

### Migration Fails

```bash
# Check migration syntax
psql -f supabase/migrations/XXXXX_migration.sql

# View error details
supabase logs db

# Reset and retry
supabase db reset
```

### Conflicts with Existing Schema

```bash
# Show differences
supabase db diff

# Generate migration to match current state
supabase db diff | supabase migration new sync_state
```

### Out of Sync Migrations

```bash
# List all migrations
supabase migration list

# Repair migration history
supabase migration repair
```

---

## 📊 Migration History

### Phase 1: Foundation (Sep-Oct 2024)
- Initial schema setup
- Core tables (agents, workflows, prompts)
- Basic RLS policies

### Phase 2: Enhancement (Oct-Nov 2024)
- Multi-tenant architecture
- PRISM™ suite structure
- Workflow editor support

### Phase 3: Optimization (Nov 2024-Jan 2025)
- Unified prompts architecture
- Panel templates
- Performance indexes
- Data normalization

### Current: Continuous Improvement
- Ongoing schema refinements
- Performance optimizations
- Feature additions

[→ View Detailed Migration Log](../../docs/migration-logs/INDEX.md)

---

## 🔧 Utility Scripts

### Verify Migrations
```bash
./utilities/verify_migrations.sh
```

### Backup Before Migration
```bash
./utilities/backup_before_migrate.sh
```

### Generate Types
```bash
cd ../..
pnpm run generate-types
```

---

## 📚 Related Documentation

- [Database Schema](../../docs/architecture/DATABASE_SCHEMA.md)
- [Migration Logs](../../docs/migration-logs/)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)

---

**Last Updated**: January 10, 2025
**Active Migrations**: 7
**Archived Migrations**: 56
**Status**: ✅ Production Ready
