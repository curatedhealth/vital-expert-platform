# Quick Reference - Database Protection

## ⚡ Quick Commands

### Backup (Before ANY changes)
```bash
./scripts/backup-db.sh
```

### Restore
```bash
./scripts/restore-db.sh database/backups/full_backup_TIMESTAMP.sql
```

### Safe SQL Execution
```bash
docker exec -i supabase_db_VITAL_path psql -U postgres -d postgres <<'SQL'
-- Your SQL here
SQL
```

### Reload Schema Cache
```bash
docker exec -i supabase_db_VITAL_path psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema';"
```

## 🛡️ Protected Tables
- `agents` (254 rows) ✅
- `capabilities`
- `agent_capabilities`
- `agent_audit_log`
- `agent_tier_lifecycle_audit`
- All other data tables

## 📋 Backup Status
Latest backup: `database/backups/full_backup_20251004_110603.sql`

All backups automatically include:
- Full database schema
- All table data
- Indexes and constraints
- Triggers and functions

See [DATABASE_SAFETY.md](DATABASE_SAFETY.md) for detailed guide.
