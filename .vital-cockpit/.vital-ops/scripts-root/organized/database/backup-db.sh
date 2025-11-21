#!/bin/bash
# Comprehensive database backup script
# Backs up all data tables to prevent data loss

BACKUP_DIR="./database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "📦 Starting comprehensive database backup..."
echo "🕐 Timestamp: $TIMESTAMP"
echo ""

# Full database dump
echo "1️⃣  Creating full database dump..."
docker exec supabase_db_VITAL_path pg_dump -U postgres postgres > "$BACKUP_DIR/full_backup_${TIMESTAMP}.sql"
echo "   ✅ Saved: full_backup_${TIMESTAMP}.sql"

# Individual table backups (for easy selective restoration)
echo ""
echo "2️⃣  Creating individual table backups..."

# Core tables
tables=(
  "agents"
  "capabilities"
  "agent_capabilities"
  "agent_audit_log"
  "agent_tier_lifecycle_audit"
  "capability_agents"
  "capability_workflows"
  "expert_agents"
  "virtual_boards"
  "board_memberships"
)

for table in "${tables[@]}"; do
  docker exec supabase_db_VITAL_path pg_dump -U postgres -t "public.$table" postgres > "$BACKUP_DIR/${table}_${TIMESTAMP}.sql" 2>/dev/null
  if [ $? -eq 0 ]; then
    count=$(docker exec supabase_db_VITAL_path psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    echo "   ✅ $table: $count rows"
  fi
done

echo ""
echo "📊 Database Statistics:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec supabase_db_VITAL_path psql -U postgres -d postgres <<'EOF'
SELECT
    table_name,
    row_count,
    pg_size_pretty(pg_total_relation_size('public.' || table_name)) as size
FROM (
    SELECT 'agents' as table_name, COUNT(*) as row_count FROM agents
    UNION ALL SELECT 'capabilities', COUNT(*) FROM capabilities
    UNION ALL SELECT 'agent_capabilities', COUNT(*) FROM agent_capabilities
    UNION ALL SELECT 'expert_agents', COUNT(*) FROM expert_agents
    UNION ALL SELECT 'virtual_boards', COUNT(*) FROM virtual_boards
) t
WHERE row_count > 0
ORDER BY row_count DESC;
EOF
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Backup complete! Files saved to: $BACKUP_DIR/"
echo "💾 Latest backup: full_backup_${TIMESTAMP}.sql"
