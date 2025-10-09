# Database Safety Guide

## ⚠️ NEVER USE THESE COMMANDS
```bash
npx supabase db reset        # ❌ WIPES ALL DATA
npx supabase stop && start   # ❌ Can lose data if not careful
```

## ✅ Safe Database Operations

### 1. Backup Database (Do this BEFORE any changes)
```bash
./scripts/backup-db.sh
```

### 2. Apply Schema Changes
```bash
# Safe way to run SQL:
docker exec -i supabase_db_VITAL_path psql -U postgres -d postgres <<'EOF'
-- Your SQL here
ALTER TABLE agents ADD COLUMN new_column TEXT;
EOF
```

### 3. Reload Schema Cache (After schema changes)
```bash
# Option 1: Notify PostgREST
docker exec -i supabase_db_VITAL_path psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema';"

# Option 2: Restart just the API (preserves data)
docker restart supabase_kong_VITAL_path
```

### 4. Restore from Backup
```bash
./scripts/restore-db.sh database/backups/full_backup_TIMESTAMP.sql
```

## 📊 Check Database Status
```bash
# Quick stats
docker exec -i supabase_db_VITAL_path psql -U postgres -d postgres -c "
SELECT 'agents' as table, COUNT(*) FROM agents
UNION ALL
SELECT 'capabilities', COUNT(*) FROM capabilities;
"
```

## 🔄 Safe Workflow
1. **Before changes:** `./scripts/backup-db.sh`
2. **Make changes:** Use `docker exec` with SQL
3. **Reload cache:** `NOTIFY pgrst, 'reload schema'`
4. **If problems:** `./scripts/restore-db.sh`

## 📁 Backup Location
- All backups saved to: `database/backups/`
- Format: `full_backup_YYYYMMDD_HHMMSS.sql`
- Individual tables: `tablename_YYYYMMDD_HHMMSS.sql`

## Current Data (As of last backup)
- **254 agents** with tier and lifecycle stage attributes
- Capabilities registry structure
- Audit logs for tier/lifecycle changes
