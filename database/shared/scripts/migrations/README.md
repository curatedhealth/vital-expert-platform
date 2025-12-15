# Database Migration Scripts

**Location:** `database/shared/scripts/migrations/`  
**Purpose:** Scripts for executing and managing database migrations

---

## Scripts

### Migration Execution

- `run-3-phase-migrations.sh` - Executes 3-phase schema standardization migrations
- `run-security-migrations.sh` - Executes critical security migrations
- `deploy-user-panels-migrations.sh` - Deploys user panels migrations
- `apply-user-panels-migration.sh` - Applies user panels migration
- `run_migrations_help.sh` - Migration help and guidance

### Migration Sync

- `sync-migrations-to-supabase.sh` - Syncs `database/postgres/migrations/` to `supabase/migrations/` for CLI compatibility

---

## Usage

### Run Security Migrations

```bash
./database/shared/scripts/migrations/run-security-migrations.sh [environment]
```

### Run 3-Phase Migrations

```bash
./database/shared/scripts/migrations/run-3-phase-migrations.sh [phase] [environment]
```

### Sync to Supabase

```bash
./database/shared/scripts/migrations/sync-migrations-to-supabase.sh
supabase db push
```

---

**See Also:**
- [Database README](../README.md)
- [Multi-Database Organization Standard](../../../../docs/architecture/MULTI_DATABASE_ORGANIZATION_STANDARD.md)
