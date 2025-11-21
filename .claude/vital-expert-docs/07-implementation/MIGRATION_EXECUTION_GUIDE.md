# VITAL Platform Migration Execution Guide

## Prerequisites

1. **Backup your database** before starting any migration
2. Have database admin access to your Supabase instance
3. Stop all application instances during migration to prevent data inconsistencies

## Migration Files Created

1. **Strategy Document**: `/MIGRATION_STRATEGY.md` - Complete migration strategy and analysis
2. **Phase 1 - Urgent Fixes**: `/supabase/migrations/20251118_001_urgent_schema_fixes.sql`
3. **Phase 2 - Data Seeding**: `/supabase/migrations/20251118_002_tenant_data_seeding.sql`
4. **Phase 3 - Row Level Security**: `/supabase/migrations/20251118_003_row_level_security.sql`
5. **Rollback Script**: `/supabase/migrations/20251118_000_rollback.sql`

## Step-by-Step Execution

### Step 1: Backup Database
```bash
# Using Supabase CLI
supabase db dump -f backup_before_migration.sql

# Or using pg_dump directly
pg_dump postgresql://[connection-string] > backup_before_migration.sql
```

### Step 2: Execute Phase 1 - Urgent Schema Fixes (IMMEDIATE)

This fixes the immediate issues preventing data from loading in the UI.

```bash
# Using Supabase CLI
supabase db push --include 20251118_001_urgent_schema_fixes.sql

# Or using psql
psql postgresql://[connection-string] -f supabase/migrations/20251118_001_urgent_schema_fixes.sql
```

**Expected Results:**
- Tools table will have `category` and `tenant_id` columns
- Compatibility views created for table name mismatches
- All existing data assigned to platform tenant

**Verification:**
```sql
-- Check tools table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tools'
AND column_name IN ('category', 'tenant_id');

-- Check views exist
SELECT viewname FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('business_functions', 'departments', 'organizational_roles');
```

### Step 3: Test Applications After Phase 1

Start each application and verify data loads:

```bash
# Terminal 1 - Platform tenant
cd apps/vital-system
npm run dev  # Should run on port 3000

# Terminal 2 - Digital Health Startup
cd apps/digital-health-startup
npm run dev  # Should run on port 3001

# Terminal 3 - Pharmaceuticals
cd apps/pharma
npm run dev  # Should run on port 3002
```

**Check each app:**
1. Navigate to Tools page - should display tools
2. Navigate to Knowledge page - should display knowledge items
3. Navigate to Prompts page - should display prompts
4. Navigate to Personas page - should be accessible
5. Navigate to JTBD page - should be accessible

### Step 4: Execute Phase 2 - Tenant Data Seeding

This creates tenant-specific data for each organization.

```bash
# Using Supabase CLI
supabase db push --include 20251118_002_tenant_data_seeding.sql

# Or using psql
psql postgresql://[connection-string] -f supabase/migrations/20251118_002_tenant_data_seeding.sql
```

**Expected Results:**
- Digital Health Startup tenant will have relevant tools and agents
- Pharmaceuticals tenant will have industry-specific resources
- Each tenant will have customized personas and JTBD

**Verification:**
```sql
-- Check data distribution
SELECT tenant_id, COUNT(*) as count
FROM public.agents
GROUP BY tenant_id;

SELECT tenant_id, COUNT(*) as count
FROM public.tools
GROUP BY tenant_id;
```

### Step 5: Execute Phase 3 - Row Level Security (OPTIONAL)

This implements tenant isolation at the database level. Only run this after confirming Phases 1-2 work correctly.

```bash
# Using Supabase CLI
supabase db push --include 20251118_003_row_level_security.sql

# Or using psql
psql postgresql://[connection-string] -f supabase/migrations/20251118_003_row_level_security.sql
```

**Expected Results:**
- RLS policies will prevent cross-tenant data access
- Platform data remains readable by all tenants
- Tenant-specific data is isolated

**Verification:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tools', 'agents', 'prompts');
```

## Rollback Procedure (If Needed)

If you encounter issues and need to rollback:

```bash
# Execute rollback script
psql postgresql://[connection-string] -f supabase/migrations/20251118_000_rollback.sql

# Restore from backup if needed
psql postgresql://[connection-string] < backup_before_migration.sql
```

## Post-Migration Tasks

### 1. Update Application Configuration

Each app needs its tenant ID configured in environment variables:

**apps/vital-system/.env.local:**
```env
NEXT_PUBLIC_TENANT_ID=00000000-0000-0000-0000-000000000001
NEXT_PUBLIC_TENANT_NAME=VITAL Platform
```

**apps/digital-health-startup/.env.local:**
```env
NEXT_PUBLIC_TENANT_ID=11111111-1111-1111-1111-111111111111
NEXT_PUBLIC_TENANT_NAME=Digital Health Startup
```

**apps/pharma/.env.local:**
```env
NEXT_PUBLIC_TENANT_ID=f7aa6fd4-0af9-4706-8b31-034f1f7accda
NEXT_PUBLIC_TENANT_NAME=Pharmaceuticals
```

### 2. Update API Routes

Ensure all API routes include tenant filtering:

```typescript
// Example in API route
const tenantId = request.headers.get('x-tenant-id') ||
                 process.env.NEXT_PUBLIC_TENANT_ID;

const { data } = await supabase
  .from('agents')
  .select('*')
  .eq('tenant_id', tenantId);
```

### 3. Monitor Performance

After migration, monitor query performance:

```sql
-- Check slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Troubleshooting

### Issue: "column does not exist" errors
**Solution:** Run Phase 1 migration again, it's idempotent

### Issue: No data showing for a tenant
**Solution:** Check tenant_id is set correctly in the data and matches app configuration

### Issue: Cross-tenant data visible
**Solution:** Ensure Phase 3 RLS policies are applied and enabled

### Issue: Performance degradation
**Solution:** Check indexes exist on tenant_id columns:
```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('tools', 'agents', 'prompts')
AND indexname LIKE '%tenant%';
```

## Success Criteria

✅ All three apps load without errors
✅ Tools, Knowledge, and Prompts pages display data
✅ Each tenant sees only their data + platform data
✅ No performance degradation (queries < 200ms)
✅ Personas and JTBD pages are functional

## Support

If you encounter issues:
1. Check the migration logs for errors
2. Verify database connection and permissions
3. Ensure all migration scripts completed successfully
4. Review the MIGRATION_STRATEGY.md for context

Remember to test thoroughly in a staging environment before applying to production!