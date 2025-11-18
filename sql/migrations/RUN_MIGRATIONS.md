# VITAL Multi-Tenant Migration - Execution Guide

## Problem
Direct `psql` connection to remote Supabase database times out due to network/firewall restrictions.

## Solution Options

### Option 1: Supabase Dashboard SQL Editor (RECOMMENDED)

This is the easiest and most reliable method:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
   - Navigate to: **SQL Editor**

2. **Execute migrations in order** (copy-paste each file):

   ```
   Step 1: 000_pre_migration_validation.sql
   Step 2: 001_schema_fixes.sql
   Step 3: 002_tenant_setup.sql
   Step 4: 003_platform_data_migration.sql
   Step 5: 004_tenant_data_migration.sql
   Step 6: 005_post_migration_validation.sql
   ```

3. **For each file:**
   - Open the file in your editor
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for completion
   - Check for errors in the output panel
   - **IMPORTANT**: Only proceed to the next file if current one succeeds!

4. **Monitor progress:**
   - Each file will output NOTICE messages showing progress
   - Look for "Migration completed successfully" messages
   - Check validation results in step 6

---

### Option 2: Test Locally First (OPTIONAL)

Test migrations on your local Supabase instance before applying to production:

```bash
# Navigate to migrations directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/migrations"

# Set password for local instance
export PGPASSWORD='postgres'

# Run each migration on local database
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f 000_pre_migration_validation.sql
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f 001_schema_fixes.sql
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f 002_tenant_setup.sql
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f 003_platform_data_migration.sql
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f 004_tenant_data_migration.sql
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f 005_post_migration_validation.sql
```

After testing locally, apply to production using Option 1.

---

### Option 3: Use Supabase CLI with Connection Pooler

Try using Supabase's connection pooler which may bypass firewall:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Link to remote project (if not already linked)
supabase link --project-ref bomltkhixeatxuoxmolq

# Try executing via Supabase CLI
supabase db execute --file sql/migrations/001_schema_fixes.sql
```

**Note**: This may also fail due to same network restrictions.

---

### Option 4: VPN/Network Configuration

If you need command-line access:

1. **Check if VPN is required**
   - Some organizations block direct database connections
   - Contact your IT/DevOps team

2. **Whitelist your IP in Supabase**
   - Supabase Dashboard → Settings → Database
   - Add your current IP to allowed list
   - Retry psql connection

3. **Use connection pooler URL**
   ```bash
   psql "postgresql://postgres.bomltkhixeatxuoxmolq:flusd9fqEb4kkTJ1@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
   ```

---

## Post-Migration Verification

After running all migrations successfully:

1. **Check migration tracking table:**
   ```sql
   SELECT * FROM migration_tracking
   WHERE migration_name = 'multi_tenant_migration'
   ORDER BY started_at;
   ```

2. **Verify tenants created:**
   ```sql
   SELECT id, name, slug, is_active FROM tenants;
   ```
   Should show 3 tenants:
   - Platform (00000000-0000-0000-0000-000000000001)
   - Digital Health Startup (11111111-1111-1111-1111-111111111111)
   - Pharmaceuticals (f7aa6fd4-0af9-4706-8b31-034f1f7accda)

3. **Verify tools.category column:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'tools' AND column_name = 'category';
   ```

4. **Test the apps:**
   - Navigate to http://localhost:3000/tools
   - Should load without errors
   - Check browser console for any errors

---

## Rollback

If something goes wrong:

1. **Full rollback:**
   ```sql
   -- This will undo all changes (be careful!)
   ROLLBACK;
   ```

2. **Partial rollback:**
   - Each migration uses SAVEPOINTs
   - You can rollback to specific savepoint if needed

3. **Restore from backup:**
   - Use Supabase Dashboard → Database → Backups
   - Restore to point before migration

---

## Troubleshooting

### Error: "column tools.category does not exist"
**Solution**: Run migration 001_schema_fixes.sql first

### Error: "table tenants does not exist"
**Solution**: Tenants table should already exist. Check your schema.

### Error: "relation migration_tracking does not exist"
**Solution**: Create the table first:
```sql
CREATE TABLE IF NOT EXISTS migration_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL,
  phase TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metrics JSONB DEFAULT '{}'::jsonb
);
```

### Warnings about CREATE INDEX CONCURRENTLY
**Note**: These are normal. CONCURRENTLY prevents table locks during index creation.

---

## Migration File Summary

| File | Purpose | Safe to Rerun |
|------|---------|---------------|
| 000_pre_migration_validation.sql | Validates current state | ✅ Yes |
| 001_schema_fixes.sql | Adds missing columns/tables | ✅ Yes (idempotent) |
| 002_tenant_setup.sql | Creates 3 tenants | ⚠️ Check first |
| 003_platform_data_migration.sql | Assigns platform data | ⚠️ Check first |
| 004_tenant_data_migration.sql | Assigns tenant data | ⚠️ Check first |
| 005_post_migration_validation.sql | Validates results | ✅ Yes |

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Review the SQL file that failed
3. Check Supabase Dashboard logs
4. Consult the README_MIGRATION_EXECUTION.md for detailed troubleshooting

---

**Last Updated**: 2025-11-18
**Database**: bomltkhixeatxuoxmolq.supabase.co
