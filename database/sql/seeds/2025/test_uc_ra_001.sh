#!/bin/bash
# Test UC_RA_001 execution

set -e

echo "🧪 Testing UC_RA_001 Files..."
echo ""

# Get database URL
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL=$(grep SUPABASE_DB_URL ../../.env.local 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'" | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set"
  exit 1
fi

echo "📁 Executing Part 1 and Part 2 in SAME SESSION (required for session_config)..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 << 'ENDSQL'
\i 26_ra_001_samd_classification_part1.sql
\i 26_ra_001_samd_classification_part2.sql
ENDSQL
echo "✅ Both parts complete"
echo ""

echo "🎉 UC_RA_001 seeded successfully!"
echo ""

# Verify
echo "📊 Verification:"
psql "$DATABASE_URL" <<SQL
SELECT 
  'UC_RA_001 Part 2 Seeded' as status,
  COUNT(DISTINCT ta.id) as agent_assignments,
  COUNT(DISTINCT tp.id) as persona_assignments,
  COUNT(DISTINCT tt.id) as tool_assignments,
  COUNT(DISTINCT tr.id) as rag_assignments
FROM dh_use_case uc
LEFT JOIN dh_workflow wf ON wf.use_case_id = uc.id
LEFT JOIN dh_task t ON t.workflow_id = wf.id
LEFT JOIN dh_task_agent ta ON ta.task_id = t.id
LEFT JOIN dh_task_persona tp ON tp.task_id = t.id
LEFT JOIN dh_task_tool tt ON tt.task_id = t.id
LEFT JOIN dh_task_rag tr ON tr.task_id = t.id
WHERE uc.code = 'UC_RA_001'
GROUP BY uc.code;
SQL

