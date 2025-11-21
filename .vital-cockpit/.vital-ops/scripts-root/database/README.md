# Database Scripts

Scripts for database management, migrations, seeding, and maintenance.

## Subdirectories

### migrations/
Schema migrations and database updates.

**Key scripts:**
- `run-migrations.ts` - Execute migrations
- `apply-*-migration.js` - Apply specific migrations
- `run-*-migration.sh` - Migration runners

**Usage:**
```bash
# Run all migrations
node migrations/run-migrations.ts

# Apply specific migration
node migrations/apply-rag-migration.js
```

**Best Practices:**
- Always backup before migrations
- Test in development first
- Review migration SQL before executing
- Keep migrations idempotent

### seeds/
Data seeding and population scripts.

**Key scripts:**
- `seed-basic-agents.js` - Seed basic agent data
- `seed-expert-agents.js` - Seed expert agents
- `load-*.js` - Load various data types
- `populate-*.js` - Populate database tables

**Usage:**
```bash
# Seed basic data
node seeds/seed-basic-agents.js

# Load comprehensive data
node seeds/load-comprehensive-capabilities.js
```

**Notes:**
- Seeds are idempotent - safe to run multiple times
- Use for initial setup and testing
- Production seeds in separate files

### backups/
Database backup and restore utilities.

**Key scripts:**
- `backup-database.sh` - Create database backup
- `restore-database.sh` - Restore from backup
- `backup-remote-agents.js` - Backup specific data

**Usage:**
```bash
# Backup database
bash backups/backup-database.sh

# Restore from backup
bash backups/restore-database.sh <backup-file>
```

**Best Practices:**
- Backup before major changes
- Store backups securely
- Test restore procedures
- Automate regular backups

### queries/
Utility queries and database introspection.

**Key scripts:**
- `create-*.js` - Create database objects
- `query-*.js` - Query utilities
- `force-reset-state.js` - Reset operations

**Usage:**
```bash
# Create database objects
node queries/create-departments-and-roles.ts

# Query database
node queries/query-org-structure.ts
```

### ask-panel/
Ask Expert panel specific database setup.

**SQL Files:**
- `00_complete_setup.sql` - Complete setup
- `01_enable_panel_rls.sql` - Enable RLS policies

## Common Workflows

### Fresh Database Setup

```bash
# 1. Run migrations
node migrations/run-migrations.ts

# 2. Seed basic data
node seeds/seed-basic-agents.js

# 3. Verify setup
node ../validation/schema/check-supabase-schema.ts
```

### Data Refresh

```bash
# 1. Backup current data
bash backups/backup-database.sh

# 2. Load new data
node seeds/load-expert-agents.js

# 3. Verify data
node ../validation/data/verify-agent-org-data.ts
```

### Migration Workflow

```bash
# 1. Backup database
bash backups/backup-database.sh

# 2. Run migration
node migrations/apply-new-migration.js

# 3. Verify migration
node ../validation/schema/check-supabase-schema.ts

# 4. If issues, restore backup
bash backups/restore-database.sh latest-backup.sql
```

## Database Connection

Scripts use environment variables for database connection:

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

**Connection Errors:**
```bash
# Verify credentials
node ../validation/schema/check-supabase-schema.ts

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Migration Failures:**
```bash
# Check migration status
node migrations/check-migration-status.js

# Rollback if needed
bash backups/restore-database.sh
```

**Seed Errors:**
```bash
# Check for existing data
node queries/query-database-schema.js

# Clear and reseed if needed
node seeds/seed-basic-agents.js --force
```

## Safety Guidelines

1. **Always backup before destructive operations**
2. **Test migrations in development first**
3. **Use transactions for data modifications**
4. **Verify changes after execution**
5. **Keep backup rotation policy**
6. **Document schema changes**
7. **Review generated SQL before execution**

## Related Documentation

- [Database Schema](../../docs/architecture/schemas/)
- [Migration Guide](../../docs/database/migrations.md)
- [Seeding Guide](../../docs/database/seeding.md)
