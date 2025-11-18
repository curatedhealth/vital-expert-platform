# 🚀 Seed 254 Agents - Quick Guide

**Status**: SQL file generated and ready!
**File**: `scripts/agents_insert.sql` (6,879 lines)

---

## 📋 Quick Steps (5 minutes)

### Step 1: Open the SQL File
```bash
# Open in your editor
open scripts/agents_insert.sql

# Or view first 100 lines
head -100 scripts/agents_insert.sql
```

### Step 2: Copy the Entire SQL File
```bash
# Copy entire file to clipboard (Mac)
cat scripts/agents_insert.sql | pbcopy

# Or open and manually select all (Cmd+A) and copy (Cmd+C)
```

### Step 3: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql
2. Click **"New Query"**
3. Paste the SQL (Cmd+V)
4. Click **"Run"** button

### Step 4: Verify Import
After running, execute this query:
```sql
SELECT COUNT(*) FROM agents;
```

**Expected**: 254 agents

---

## 📊 What the SQL Does

The generated SQL file:
- ✅ Inserts all 254 agents
- ✅ Uses `ON CONFLICT DO UPDATE` (upsert) - safe to run multiple times
- ✅ Properly escapes all special characters
- ✅ Handles NULL values correctly
- ✅ Converts JSON fields to JSONB
- ✅ Wrapped in a transaction (BEGIN/COMMIT)

**File structure**:
```sql
-- ============================================
-- INSERT 254 AGENTS
-- ============================================
BEGIN;

-- Agent 1/254: anticoagulation_specialist
INSERT INTO agents (...) VALUES (...) ON CONFLICT (id) DO UPDATE SET ...;

-- Agent 2/254: clinical-trial-designer
INSERT INTO agents (...) VALUES (...) ON CONFLICT (id) DO UPDATE SET ...;

... (252 more agents)

COMMIT;
-- ✅ 254 agents imported/updated
```

---

## 🔍 Preview First Agent

Here's what the first INSERT looks like:

```sql
INSERT INTO agents (
  id, name, display_name, description, avatar, color,
  model, system_prompt, temperature, max_tokens
) VALUES (
  'ed83433a-c04d-4789-9fde-5bf4310a8f73',
  'anticoagulation_specialist',
  'Anticoagulation Specialist',
  'Anticoagulation management and monitoring',
  'http://127.0.0.1:54321/storage/v1/object/public/avatars/avatar_0009.png',
  '#2196F3',
  'gpt-4o-mini',
  'YOU ARE: Anticoagulation Specialist...',
  0.70,
  2000
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  ...;
```

---

## ✅ Expected Output

When you run the SQL in Supabase:

**Success Message**:
```
Query executed successfully
Rows affected: 254
```

**Verification Query Result**:
```sql
SELECT COUNT(*) FROM agents;
-- Result: 254
```

---

## 🧪 Test After Import

### Test 1: Count Agents
```sql
SELECT COUNT(*) FROM agents;
-- Expected: 254
```

### Test 2: Sample Agent
```sql
SELECT id, name, display_name, description
FROM agents
LIMIT 5;
```

### Test 3: Via Postman
Open Postman collection:
1. `Agents > Count Agents` → Should return `{"count": 254}`
2. `Agents > Get All Agents` → Should return array of 10 agents

### Test 4: Via curl
```bash
curl "https://bomltkhixeatxuoxmolq.supabase.co/rest/v1/agents?select=count" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNzAxNDIsImV4cCI6MjA0Njg0NjE0Mn0.uWHqh-sD3VFv_6nBBygFdD1z9FPYFCLQxTv8X0JjMj8" \
  -H "Prefer: count=exact"
```

---

## 🔄 Re-generating SQL (if needed)

If you need to regenerate the SQL from JSON:

```bash
cd scripts/

# Generate SQL for agents
python3 generate_sql_inserts.py agents ../database/seeds/data/agents-comprehensive.json > agents_insert.sql

# Check output
wc -l agents_insert.sql  # Should be ~6,879 lines
```

---

## 📝 Script Usage (for other data)

The generator script works for all data types:

```bash
# Agents
python3 generate_sql_inserts.py agents agents.json > agents_insert.sql

# Personas
python3 generate_sql_inserts.py personas personas.json > personas_insert.sql

# JTBDs
python3 generate_sql_inserts.py jtbds jtbds.json > jtbds_insert.sql
```

**Script features**:
- ✅ Escapes single quotes properly (`'` becomes `''`)
- ✅ Handles NULL values
- ✅ Converts complex objects to JSONB
- ✅ Uses UPSERT (ON CONFLICT DO UPDATE)
- ✅ Transaction safety (BEGIN/COMMIT)
- ✅ Progress comments (Agent 1/254, Agent 2/254, etc.)

---

## 🛠️ Troubleshooting

### Issue: "Syntax error near..."
**Cause**: Special characters not escaped properly
**Solution**: Re-generate SQL with the script (it handles escaping)

### Issue: "Duplicate key violation"
**Not an Issue**: Script uses `ON CONFLICT DO UPDATE`, so duplicates are updated, not inserted again. This is intentional.

### Issue: "Foreign key constraint violation"
**Solution**: Make sure referenced tables (tenants, etc.) have data first

### Issue: "Query too large"
**Solution**: Split the SQL file into smaller batches:
```bash
# Split into 50-agent batches
split -l 1350 agents_insert.sql agents_batch_

# Then run each batch separately:
# agents_batch_aa (agents 1-50)
# agents_batch_ab (agents 51-100)
# etc.
```

---

## ✨ Summary

**What you have**:
- ✅ `scripts/agents_insert.sql` - 254 agents ready to import
- ✅ `scripts/generate_sql_inserts.py` - Generator for future use
- ✅ Complete agent data with all fields

**Next**:
1. Copy `agents_insert.sql` content
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Verify with `SELECT COUNT(*) FROM agents;`
5. Test in Postman

**After agents are seeded**:
- 🔍 Find persona data
- 🔍 Find JTBD data
- 📊 Import those next

---

**Ready to import! 🚀**

The SQL file is in: `scripts/agents_insert.sql`
Just copy, paste into Supabase, and run!
