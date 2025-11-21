# Seed Data Execution Guide

## ✅ Completed Work

### 1. SQL Transformation Script Fixed
- **Fixed**: Duplicate `DECLARE v_tenant_id` declarations
- **Fixed**: References to undefined `v_tenant_slug` variable
- **Fixed**: RAISE statements with invalid variable references
- **Status**: All 8 seed files successfully transformed ✅

### 2. Transformed Seed Files Ready
Location: `/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed`

**Files Ready for Execution:**
1. ✅ `00_foundation_agents.sql` - 8 foundational AI agents
2. ✅ `01_foundation_personas.sql` - 8 foundational personas
3. ✅ `02_COMPREHENSIVE_TOOLS_ALL.sql` - ~150 AI tools
4. ✅ `05_COMPREHENSIVE_PROMPTS_ALL.sql` - ~100 prompt templates
5. ✅ `06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql` - ~50 RAG knowledge domains
6. ✅ `20_medical_affairs_personas.sql` - Medical Affairs personas
7. ✅ `21_phase2_jtbds.sql` - 127 jobs to be done
8. ✅ `22_digital_health_jtbds.sql` - 110 jobs to be done

### 3. Transformations Applied
- ✅ Table names: `dh_agent` → `agents`, `dh_personas` → `personas`
- ✅ Tenant references: All changed to `digital-health-startup` UUID (`11111111-1111-1111-1111-111111111111`)
- ✅ SQL syntax: Fixed DECLARE blocks, removed v_tenant_slug references
- ✅ Header comments: Added transformation metadata to each file

---

## ⚠️ Current Issue: Database Connection

### Problem
Direct PostgreSQL connection to NEW DB times out:
```bash
psql: error: connection to server at "db.bomltkhixeatxuoxmolq.supabase.co" failed: Operation timed out
```

### Attempted Solutions
1. ❌ Direct `psql` connection - Connection timeout
2. ❌ REST API with service key - Invalid API key error
3. ⏳ Supabase Studio SQL Editor - **RECOMMENDED APPROACH**

---

## 📋 Recommended Execution Method

### Option 1: Supabase Studio SQL Editor (EASIEST)

**Steps:**

1. **Navigate to SQL Editor**
   - URL: `https://bomltkhixeatxuoxmolq.supabase.co/project/_/sql`
   - Or: Supabase Dashboard → SQL Editor

2. **Execute Each File in Order**

   For each file in this order:

   ```
   00_foundation_agents.sql
   01_foundation_personas.sql
   02_COMPREHENSIVE_TOOLS_ALL.sql
   05_COMPREHENSIVE_PROMPTS_ALL.sql
   06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql
   20_medical_affairs_personas.sql
   21_phase2_jtbds.sql
   22_digital_health_jtbds.sql
   ```

   **For each file:**
   - a. Open the file: `/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed/[filename]`
   - b. Copy entire contents
   - c. Paste into SQL Editor
   - d. Click "Run" button
   - e. Verify success message
   - f. Check row count

3. **Verification Queries**

   After each file, run:

   ```sql
   -- After 00_foundation_agents.sql
   SELECT COUNT(*) FROM agents
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: 8 rows

   -- After 01_foundation_personas.sql
   SELECT COUNT(*) FROM personas
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: 8 rows

   -- After 02_COMPREHENSIVE_TOOLS_ALL.sql
   SELECT COUNT(*) FROM tools
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: ~150 rows

   -- After 05_COMPREHENSIVE_PROMPTS_ALL.sql
   SELECT COUNT(*) FROM prompts
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: ~100 rows

   -- After 06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql
   SELECT COUNT(*) FROM knowledge_domains
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: ~50 rows

   -- After 21_phase2_jtbds.sql
   SELECT COUNT(*) FROM jobs_to_be_done
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: 127 rows

   -- After 22_digital_health_jtbds.sql
   SELECT COUNT(*) FROM jobs_to_be_done
   WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
   -- Expected: 237 rows total (127 + 110)
   ```

---

### Option 2: Local psql with VPN/Network Fix

If you have network/firewall issues, try:

```bash
# Navigate to transformed directory
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed"

# Execute each file
for file in 00_foundation_agents.sql \
            01_foundation_personas.sql \
            02_COMPREHENSIVE_TOOLS_ALL.sql \
            05_COMPREHENSIVE_PROMPTS_ALL.sql \
            06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql \
            20_medical_affairs_personas.sql \
            21_phase2_jtbds.sql \
            22_digital_health_jtbds.sql; do

  echo ""
  echo "========================================="
  echo "Executing: $file"
  echo "========================================="

  PGPASSWORD='flusd9fqEb4kkTJ1' psql \
    postgresql://postgres:flusd9fqEb4kkTJ1@db.bomltkhixeatxuoxmolq.supabase.co:5432/postgres \
    -c "\set ON_ERROR_STOP on" \
    -f "$file"

  if [ $? -eq 0 ]; then
    echo "✅ Success: $file"
  else
    echo "❌ Failed: $file"
    exit 1
  fi
done

echo ""
echo "✅ All seed files executed successfully!"
```

---

### Option 3: Split Large Files (if files are too large for SQL Editor)

If any file is too large for the SQL Editor:

```bash
# Split large SQL file into chunks
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed"

# Example for splitting a large file
csplit -f "02_COMPREHENSIVE_TOOLS_ALL_part_" \
       -n 2 \
       "02_COMPREHENSIVE_TOOLS_ALL.sql" \
       '/^-- SECTION/' '{*}'

# Then execute each part separately in SQL Editor
```

---

## 📊 Expected Final Data Counts

After all 8 files are executed successfully:

| Table              | Expected Rows | Tenant                     |
|--------------------|---------------|----------------------------|
| agents             | 8             | digital-health-startup     |
| personas           | 8+            | digital-health-startup     |
| tools              | ~150          | digital-health-startup     |
| prompts            | ~100          | digital-health-startup     |
| knowledge_domains  | ~50           | digital-health-startup     |
| jobs_to_be_done    | 237           | digital-health-startup     |

**Total**: ~596 records across 6 tables

---

## 🔍 Final Verification Query

Run this comprehensive query after all files are executed:

```sql
SELECT
  'agents' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as digital_health_count
FROM agents

UNION ALL

SELECT
  'personas' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as digital_health_count
FROM personas

UNION ALL

SELECT
  'tools' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as digital_health_count
FROM tools

UNION ALL

SELECT
  'prompts' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as digital_health_count
FROM prompts

UNION ALL

SELECT
  'knowledge_domains' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as digital_health_count
FROM knowledge_domains

UNION ALL

SELECT
  'jobs_to_be_done' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE tenant_id = '11111111-1111-1111-1111-111111111111') as digital_health_count
FROM jobs_to_be_done

ORDER BY table_name;
```

Expected output:
```
table_name          | row_count | digital_health_count
--------------------+-----------+---------------------
agents              | 8         | 8
jobs_to_be_done     | 237       | 237
knowledge_domains   | ~50       | ~50
personas            | 8+        | 8+
prompts             | ~100      | ~100
tools               | ~150      | ~150
```

---

## 🎯 Next Steps After Successful Load

1. ✅ Verify all data counts match expectations
2. ✅ Test API endpoints to ensure data is accessible
3. ✅ Update [DATA_GAP_ASSESSMENT_REPORT.md](./DATA_GAP_ASSESSMENT_REPORT.md)
4. ✅ Load remaining organizational data (if needed)
5. ✅ Load workflows and tasks (if needed)

---

## 📞 Troubleshooting

### Issue: "Tenant not found" error
**Solution**: Verify tenant exists with:
```sql
SELECT id, name, slug, status, tier
FROM tenants
WHERE id = '11111111-1111-1111-1111-111111111111';
```

If not found, create it first using:
`/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/00_create_missing_tenants.sql`

### Issue: "Table does not exist" error
**Solution**: Verify table exists:
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('agents', 'personas', 'tools', 'prompts', 'knowledge_domains', 'jobs_to_be_done');
```

### Issue: "Duplicate key violation"
**Solution**: Data already loaded. Verify with:
```sql
SELECT COUNT(*) FROM [table_name]
WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
```

---

## 📁 File Locations

**Transformed Seed Files:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025/transformed/
├── 00_foundation_agents.sql
├── 01_foundation_personas.sql
├── 02_COMPREHENSIVE_TOOLS_ALL.sql
├── 05_COMPREHENSIVE_PROMPTS_ALL.sql
├── 06_COMPREHENSIVE_KNOWLEDGE_DOMAINS_ALL.sql
├── 20_medical_affairs_personas.sql
├── 21_phase2_jtbds.sql
└── 22_digital_health_jtbds.sql
```

**Transformation Script:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts/transform_seed_files_to_new_schema.py
```

**Documentation:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/DATA_GAP_ASSESSMENT_REPORT.md
/Users/hichamnaim/Downloads/Cursor/VITAL path/SEED_DATA_EXECUTION_GUIDE.md (this file)
```

---

## ✅ Summary

**Status**: SQL files are ready for execution ✅

**Recommended Method**: Supabase Studio SQL Editor (manual copy/paste)

**Alternative**: Fix network/firewall to enable direct psql connection

**Total Files**: 8 SQL files, ~596 records to load

**Target Tenant**: digital-health-startup (`11111111-1111-1111-1111-111111111111`)

---

*Last Updated: 2025-11-14*
*Created by: Claude Code - Seed Data Migration Tool*
