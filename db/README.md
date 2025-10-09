# Database Management

This directory contains all database-related files for the VITAL Path platform.

## Structure

- `migrations/` - Database schema migrations (SQL files)
- `seeds/` - Database seed data (SQL files)
- `README.md` - This file

## Migration Naming Convention

Migrations should follow this naming pattern:
`YYYYMMDDHHMM__snake_case_description.sql`

Example: `20250108120000_add_user_authentication.sql`

## Running Migrations

### Using Supabase (Recommended)
```bash
# Apply all pending migrations
supabase db push

# Reset database and apply all migrations
supabase db reset

# Check migration status
supabase migration list
```

### Using Direct SQL
```bash
# Run all migrations
psql -f db/migrations/run_all_migrations.sql

# Run specific migration
psql -f db/migrations/20250108120000_add_user_authentication.sql
```

## Migration Guidelines

1. **Always backup before running migrations in production**
2. **Test migrations on staging environment first**
3. **Use transactions for complex migrations**
4. **Include rollback instructions in migration comments**
5. **Never modify existing migration files - create new ones**

## Environment Variables

Required environment variables for database operations:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
