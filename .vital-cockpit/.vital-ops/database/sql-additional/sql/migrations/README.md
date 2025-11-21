# VITAL Multi-Tenant Database Migration

## Overview
This directory contains SQL migration scripts to transform the VITAL database from a single-tenant to a multi-tenant architecture. The migration creates three tenants: Platform (shared resources), Digital Health Startup, and Pharmaceutical Enterprise.

## Migration Files

Execute migrations in this order:

1. **000_pre_migration_validation.sql** - Pre-migration data validation and baseline metrics
2. **001_schema_fixes.sql** - Schema modifications and table creation
3. **002_tenant_setup.sql** - Tenant creation and organizational structure
4. **003_platform_data_migration.sql** - Migrate shared resources to platform tenant
5. **004_tenant_data_migration.sql** - Migrate tenant-specific data
6. **005_post_migration_validation.sql** - Post-migration validation and integrity checks

## Prerequisites

- PostgreSQL 12+ or Supabase instance
- Database credentials with CREATE/ALTER/UPDATE permissions
- psql client installed
- Backup of current database (HIGHLY RECOMMENDED)

## Database Connection

```bash
Host: db.bomltkhixeatxuoxmolq.supabase.co
User: postgres
Database: postgres
Password: flusd9fqEb4kkTJ1
```

## Quick Start

### Option 1: Automated Execution (Recommended)

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/sql/migrations"

# Set password
export PGPASSWORD=flusd9fqEb4kkTJ1

# Run all migrations
./run-migrations.sh
```

### Option 2: Manual Execution

Execute each file individually:

```bash
export PGPASSWORD=flusd9fqEb4kkTJ1

psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f 000_pre_migration_validation.sql
psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f 001_schema_fixes.sql
psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f 002_tenant_setup.sql
psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f 003_platform_data_migration.sql
psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f 004_tenant_data_migration.sql
psql -h db.bomltkhixeatxuoxmolq.supabase.co -U postgres -d postgres -f 005_post_migration_validation.sql
```

### Option 3: Syntax Check Only

Before running the actual migration, verify syntax:

```bash
./test-syntax.sh
```

## What Gets Migrated

### Platform Tenant (Shared Resources)
- All tools (shared across tenants)
- Tier 1 & Tier 2 agents (strategic and specialized)
- System prompts (templates)
- General healthcare knowledge base

### Digital Health Startup Tenant
- Tier 3 agents focused on digital health
- Digital health specific prompts
- Digital health knowledge base
- User-created content

### Pharmaceutical Enterprise Tenant
- Tier 3 agents focused on regulatory/pharma
- PRISM Suite prompts
- Pharmaceutical knowledge base
- Clinical trial and regulatory data

## Migration Tracking

The migration creates a `migration_tracking` table to monitor progress:

```sql
SELECT * FROM migration_tracking
WHERE migration_name = 'multi_tenant_migration'
ORDER BY started_at DESC;
```

## Validation

### Pre-Migration Validation
- Counts all records before migration
- Checks referential integrity
- Exports baseline metrics

### Post-Migration Validation
The final script (005) performs comprehensive validation:

- ✓ All records have tenant_id assigned
- ✓ Referential integrity maintained
- ✓ Tenant data properly distributed
- ✓ Platform resources correctly shared
- ✓ Schema fixes applied
- ✓ Data consistency verified
- ✓ API compatibility confirmed
- ✓ Performance indexes created
- ✓ Tenant isolation enforced

## Rollback

Each migration file has a corresponding rollback file:

```bash
# Rollback in reverse order
psql -h ... -f 005_post_migration_validation_rollback.sql
psql -h ... -f 004_tenant_data_migration_rollback.sql
psql -h ... -f 003_platform_data_migration_rollback.sql
psql -h ... -f 002_tenant_setup_rollback.sql
psql -h ... -f 001_schema_fixes_rollback.sql
```

**Note:** Rollback files need to be created based on the changes made.

## Troubleshooting

### Issue: Syntax errors
**Solution:** All files have been updated to remove psql meta-commands. Ensure you're using the latest versions.

### Issue: Permission denied
**Solution:** Verify your database user has sufficient privileges:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Issue: Migration fails mid-way
**Solution:**
1. Check the migration_tracking table for last successful phase
2. Review error messages
3. Fix the issue
4. Resume from the failed migration file

### Issue: Duplicate key violations
**Solution:** The migrations use `ON CONFLICT` clauses. If you see duplicates, verify you haven't run migrations multiple times.

## Post-Migration Steps

1. **Verify Tenant Data Distribution**
```sql
SELECT
    t.name as tenant,
    COUNT(DISTINCT a.id) as agents,
    COUNT(DISTINCT tl.id) as tools,
    COUNT(DISTINCT p.id) as prompts
FROM tenants t
LEFT JOIN agents a ON a.tenant_id = t.id
LEFT JOIN tools tl ON tl.tenant_id = t.id
LEFT JOIN prompts p ON p.tenant_id = t.id
GROUP BY t.name;
```

2. **Test API Endpoints**
- Verify tools API with tenant filtering
- Test agent queries by tenant
- Check prompt retrieval

3. **Update Application Code**
- Ensure all queries include tenant_id filters
- Update API endpoints to handle tenant context
- Implement tenant-aware authentication

4. **Performance Testing**
- Verify indexes are being used
- Check query performance with tenant filters
- Monitor database metrics

## Files in This Directory

- `000_pre_migration_validation.sql` - Pre-migration validation
- `001_schema_fixes.sql` - Schema modifications
- `002_tenant_setup.sql` - Tenant creation
- `003_platform_data_migration.sql` - Platform data migration
- `004_tenant_data_migration.sql` - Tenant-specific data migration
- `005_post_migration_validation.sql` - Post-migration validation
- `run-migrations.sh` - Automated migration execution script
- `test-syntax.sh` - Syntax verification script
- `README.md` - This file
- `MIGRATION_FIXES_SUMMARY.md` - Details on syntax fixes applied

## Support

For issues or questions:
1. Check the migration_tracking table for error details
2. Review the validation output from 005_post_migration_validation.sql
3. Consult the MIGRATION_FIXES_SUMMARY.md for recent changes

## Important Notes

- **ALWAYS** backup your database before running migrations
- Run migrations during maintenance window
- Test in a staging environment first
- Monitor the migration_tracking table for progress
- All migrations are wrapped in transactions for safety
- RAISE NOTICE messages provide progress feedback
- Validation scripts will show ✅ PASS or ❌ FAIL for each test

## Tenant IDs

```
Platform:      00000000-0000-0000-0000-000000000001
Digital Health: 11111111-1111-1111-1111-111111111111
Pharma:        f7aa6fd4-0af9-4706-8b31-034f1f7accda
```

## License

Internal use only - VITAL System
