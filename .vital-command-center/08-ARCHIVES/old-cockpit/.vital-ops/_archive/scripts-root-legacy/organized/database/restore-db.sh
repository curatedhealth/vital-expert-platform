#!/bin/bash
# Database restore script
# Safely restores from backup without resetting the entire database

BACKUP_DIR="./database/backups"

echo "🔍 Available backups:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lht "$BACKUP_DIR"/*.sql 2>/dev/null | head -10 | awk '{print $9, "(" $6, $7, $8 ")"}'
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore-db.sh <backup-file>"
  echo ""
  echo "Examples:"
  echo "  # Restore full backup:"
  echo "  ./scripts/restore-db.sh database/backups/full_backup_20250104_120000.sql"
  echo ""
  echo "  # Restore single table:"
  echo "  ./scripts/restore-db.sh database/backups/agents_20250104_120000.sql"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will restore data from backup."
echo "📁 Backup file: $BACKUP_FILE"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

echo ""
echo "📦 Restoring from backup..."
cat "$BACKUP_FILE" | docker exec -i supabase_db_VITAL_path psql -U postgres postgres

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Restore completed successfully!"
  echo ""
  echo "📊 Current database statistics:"
  docker exec supabase_db_VITAL_path psql -U postgres -d postgres -c "SELECT COUNT(*) as agents FROM agents;"
else
  echo ""
  echo "❌ Restore failed. Check the error messages above."
  exit 1
fi
