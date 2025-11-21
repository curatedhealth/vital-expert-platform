# 📊 Data Seeding Guide - VITAL.expert

**Date**: 2025-11-13
**Status**: Ready to seed

---

## Current Status

### ✅ What's Ready
- Schema migrated (123 tables, 237+ indexes)
- RLS policies configured
- Performance monitoring working
- Postman collection ready (30+ endpoints)
- **254 agents** data file ready
- Import scripts tested

### 📦 Data Files Located

| Data Type | File | Records | Status |
|-----------|------|---------|--------|
| Agents | `/database/seeds/data/agents-comprehensive.json` | 254 | ✅ Ready |
| Personas | Need to locate | ? | ⚠️ Search needed |
| JTBDs | `/data/dh_jtbd_library_enhanced_20251108_192510.json` | 2 | ⚠️ Too few |

---

## Option 1: Seed via Supabase Dashboard (Recommended)

### Why Dashboard?
- ✅ Most reliable method
- ✅ No API key issues
- ✅ Built-in validation
- ✅ Progress feedback

### Steps:

#### 1. Check Current Data Count
```sql
-- Run in Supabase Dashboard SQL Editor
SELECT
  'agents' as table_name,
  COUNT(*) as count
FROM agents

UNION ALL

SELECT 'personas', COUNT(*)
FROM personas

UNION ALL

SELECT 'jobs_to_be_done', COUNT(*)
FROM jobs_to_be_done;
```

#### 2. Generate INSERT Script for Agents

Run this on your local machine:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Generate INSERT statements
python3 << 'EOF'
import json

with open('database/seeds/data/agents-comprehensive.json') as f:
    agents = json.load(f)

print("-- INSERT 254 Agents")
print("BEGIN;")

for agent in agents:
    # Escape single quotes
    def escape(val):
        if val is None:
            return 'NULL'
        if isinstance(val, (dict, list)):
            return f"'{json.dumps(val)}'::jsonb"
        if isinstance(val, str):
            return f"'{val.replace(chr(39), chr(39)+chr(39))}'"
        if isinstance(val, bool):
            return 'true' if val else 'false'
        return str(val)

    # Build INSERT
    id_val = agent.get('id')
    name_val = agent.get('name')
    display_name = agent.get('display_name')
    description = agent.get('description')
    avatar = agent.get('avatar')
    color = agent.get('color')
    model = agent.get('model')
    system_prompt = agent.get('system_prompt')
    temperature = agent.get('temperature', 0.7)
    max_tokens = agent.get('max_tokens', 2000)

    print(f"""
INSERT INTO agents (
  id, name, display_name, description, avatar, color,
  model, system_prompt, temperature, max_tokens
) VALUES (
  {escape(id_val)}, {escape(name_val)}, {escape(display_name)},
  {escape(description)}, {escape(avatar)}, {escape(color)},
  {escape(model)}, {escape(system_prompt)}, {temperature}, {max_tokens}
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  avatar = EXCLUDED.avatar,
  color = EXCLUDED.color,
  model = EXCLUDED.model,
  system_prompt = EXCLUDED.system_prompt,
  temperature = EXCLUDED.temperature,
  max_tokens = EXCLUDED.max_tokens;
""")

print("COMMIT;")
print("-- ✅ 254 agents imported")
EOF
```

This will output SQL INSERT statements. Then:

1. Copy the output
2. Go to Supabase Dashboard → SQL Editor
3. Paste and click **Run**
4. Verify: `SELECT COUNT(*) FROM agents;` → Should return 254

---

## Option 2: Seed via REST API (Requires Valid Service Key)

### Get Correct Service Key

1. Go to https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/settings/api
2. Copy the **service_role** key (NOT anon key)
3. Set environment variable:

```bash
export SUPABASE_SERVICE_KEY="paste-your-service-role-key-here"
```

### Run Import Script

```bash
cd scripts/

python3 import_production_data.py \
  --agents "../database/seeds/data/agents-comprehensive.json"
```

**Expected Output**:
```
📦 VITAL.expert - Production Data Import
============================================================
✅ Supabase connection successful
📦 Importing agents from agents-comprehensive.json...
  Imported 50/254 agents...
  Imported 100/254 agents...
  ...
✅ Imported 254 agents

📊 Verifying import...
✅ Current database counts:
  - Agents: 254
```

---

## Option 3: Seed via Python + psycopg2 (Direct Database)

If REST API has issues, use direct PostgreSQL connection:

```python
import json
import psycopg2
from psycopg2.extras import Json

# Connect
conn = psycopg2.connect(
    host="db.bomltkhixeatxuoxmolq.supabase.co",
    port=5432,
    database="postgres",
    user="postgres",
    password="flusd9fqEb4kkTJ1"
)
cur = conn.cursor()

# Load agents
with open('database/seeds/data/agents-comprehensive.json') as f:
    agents = json.load(f)

# Insert agents
for agent in agents:
    cur.execute("""
        INSERT INTO agents (
            id, name, display_name, description, avatar, color,
            model, system_prompt, temperature, max_tokens
        ) VALUES (
            %(id)s, %(name)s, %(display_name)s, %(description)s,
            %(avatar)s, %(color)s, %(model)s, %(system_prompt)s,
            %(temperature)s, %(max_tokens)s
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            display_name = EXCLUDED.display_name,
            description = EXCLUDED.description,
            avatar = EXCLUDED.avatar,
            color = EXCLUDED.color,
            model = EXCLUDED.model,
            system_prompt = EXCLUDED.system_prompt,
            temperature = EXCLUDED.temperature,
            max_tokens = EXCLUDED.max_tokens
    """, agent)

conn.commit()
print(f"✅ Imported {len(agents)} agents")

# Verify
cur.execute("SELECT COUNT(*) FROM agents")
count = cur.fetchone()[0]
print(f"📊 Total agents in database: {count}")

cur.close()
conn.close()
```

---

## Finding Missing Data

### Search for Personas

```bash
# Search for persona files
find "/Users/hichamnaim/Downloads/Cursor/VITAL path" -name "*persona*.json" -type f ! -path "*/node_modules/*" 2>/dev/null

# Count records in found files
python3 << 'EOF'
import json
import glob

for file in glob.glob('**/*persona*.json', recursive=True):
    if 'node_modules' not in file:
        try:
            with open(file) as f:
                data = json.load(f)
                if isinstance(data, list):
                    print(f"{file}: {len(data)} records")
        except:
            pass
EOF
```

### Search for JTBDs

```bash
# Search for JTBD files
find "/Users/hichamnaim/Downloads/Cursor/VITAL path" -name "*jtbd*.json" -type f ! -path "*/node_modules/*" 2>/dev/null

# Count records
python3 << 'EOF'
import json
import glob

for file in glob.glob('**/*jtbd*.json', recursive=True):
    if 'node_modules' not in file:
        try:
            with open(file) as f:
                data = json.load(f)
                if isinstance(data, list):
                    print(f"{file}: {len(data)} records")
        except:
            pass
EOF
```

---

## Verification After Seeding

### 1. Check Counts
```sql
-- Run in Supabase Dashboard
SELECT
  'agents' as table, COUNT(*) as count FROM agents
UNION ALL
SELECT 'personas', COUNT(*) FROM personas
UNION ALL
SELECT 'jobs_to_be_done', COUNT(*) FROM jobs_to_be_done;
```

**Expected**:
- Agents: 254
- Personas: 335 (or your actual count)
- JTBDs: 338 (or your actual count)

### 2. Test in Postman

Open Postman collection and run:
1. `Agents > Count Agents` → Should return 254
2. `Agents > Get All Agents` → Should return 10 agents
3. `Personas > Count Personas` → Check count
4. `Jobs-to-be-Done > Count JTBDs` → Check count

### 3. Test API via curl

```bash
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNzAxNDIsImV4cCI6MjA0Njg0NjE0Mn0.uWHqh-sD3VFv_6nBBygFdD1z9FPYFCLQxTv8X0JjMj8"

# Count agents
curl -s "https://bomltkhixeatxuoxmolq.supabase.co/rest/v1/agents?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Prefer: count=exact"
```

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: Get the correct service_role key from Supabase Dashboard → Settings → API

### Issue: "Connection timeout"
**Solution**:
1. Check if Supabase database is paused (free tier auto-pauses)
2. Wake it up by visiting the Dashboard
3. Try again after 30 seconds

### Issue: "Foreign key constraint violation"
**Solution**:
1. Ensure referenced records exist first
2. Import in order: tenants → organizations → agents → personas → jtbds

### Issue: "Duplicate key violation"
**Solution**: The import script uses `UPSERT` (ON CONFLICT DO UPDATE), so duplicates are handled automatically

---

## Data File Summary

### Agents ✅
- **Location**: `/database/seeds/data/agents-comprehensive.json`
- **Records**: 254
- **Fields**: id, name, display_name, description, avatar, color, model, system_prompt, temperature, max_tokens
- **Status**: Ready to import

### Personas ⚠️
- **Location**: Need to find comprehensive file
- **Expected**: ~335 records
- **Found**: Only small sample files (4 records)
- **Action**: Search for production persona export

### JTBDs ⚠️
- **Location**: Multiple files found, need to identify best one
- **Expected**: ~338 records
- **Found**: Files with 2-3 records only
- **Action**: Search for complete JTBD library export

---

## Next Steps

1. ✅ **Seed Agents** (254 records ready)
   - Use Option 1 (Dashboard SQL) - Most reliable
   - Or Option 2 (REST API) if service key is correct

2. 🔍 **Find Complete Persona Data**
   - Search database exports
   - Check if already in database
   - May need to export from production

3. 🔍 **Find Complete JTBD Data**
   - Search database exports
   - Check comprehensive JTBD library files
   - May need to consolidate multiple sources

4. ✅ **Test APIs** after seeding
   - Use Postman collection
   - Verify all counts
   - Test filters and search

---

**Created**: 2025-11-13
**Status**: Ready to seed agents, searching for complete persona/JTBD data
