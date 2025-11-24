# Import 254 Agents - Ready to Execute

**Date**: 2025-11-13
**Status**: Data validated and ready to import
**Quality**: All validation checks passed

---

## What's Ready

- **Transformed Data**: `scripts/agents_transformed.json` (254 agents)
- **SQL File**: `scripts/agents_insert_new.sql` (18,551 lines)
- **Validation**: All quality checks passed
- **Schema**: Matches new gold-standard database schema

---

## Data Quality Report

### Validation Results

```
Total agents: 254

✅ All required fields present (id, name, slug, base_model)
✅ All slugs properly formatted (lowercase-with-hyphens)
✅ All numeric types correct
✅ All JSONB fields are proper dicts
✅ All array fields are proper lists
✅ All status values valid
✅ Unique IDs: 254/254
✅ Unique slugs: 254/254
✅ Unique names: 254/254
```

### Coverage Statistics

- Agents with system_prompt: **254/254 (100%)**
- Agents with avatar_url: **254/254 (100%)**
- Agents with color_scheme: **254/254 (100%)**
- Active agents: **254/254 (100%)**
- Published agents: **254/254 (100%)**

---

## Import Instructions (5 Minutes)

### Step 1: Copy the SQL File

```bash
# Option A: Copy to clipboard (Mac)
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/scripts"
cat agents_insert_new.sql | pbcopy

# Option B: Open in editor and manually copy
open agents_insert_new.sql
# Then Cmd+A, Cmd+C
```

### Step 2: Open Supabase Dashboard

1. Visit: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq/sql
2. Click **"New Query"** button
3. Paste the SQL (Cmd+V)

### Step 3: Run the Import

1. Review the first few lines to confirm it looks correct
2. Click **"Run"** button (bottom right)
3. Wait for completion (should take 30-60 seconds)

### Step 4: Verify Success

After import completes, run this query in a new SQL editor tab:

```sql
-- Check total count
SELECT COUNT(*) as total_agents FROM agents;
-- Expected: 254

-- Sample first 5 agents
SELECT
  id,
  name,
  slug,
  base_model,
  status,
  validation_status
FROM agents
ORDER BY name
LIMIT 5;
```

---

## What the SQL Does

The generated SQL file:

1. **Starts a transaction** (`BEGIN;`)
2. **Inserts 254 agents** with all new schema fields:
   - Identity: id, tenant_id, name, slug, tagline, description
   - Professional: title, role_id, function_id, department_id
   - Expertise: expertise_level, specializations, years_of_experience
   - Branding: avatar_url, avatar_description, color_scheme (JSONB)
   - AI Config: system_prompt, base_model, temperature, max_tokens
   - Personality: personality_traits (JSONB), communication_style
   - Status: status, validation_status
   - Metrics: usage_count, average_rating, total_conversations
   - Metadata: metadata (JSONB), tags (array)

3. **Uses UPSERT** (`ON CONFLICT (id) DO UPDATE SET ...`)
   - Safe to run multiple times
   - Updates existing agents instead of erroring

4. **Commits transaction** (`COMMIT;`)

---

## Field Mapping Summary

Old JSON structure → New database schema:

| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| `display_name` | `name` | TEXT | Human-readable name |
| `name` | `slug` | TEXT | URL-friendly identifier |
| `avatar` | `avatar_url` | TEXT | Image URL |
| `color` | `color_scheme` | JSONB | `{"primary": "#HEX"}` |
| `model` | `base_model` | TEXT | LLM model name |
| `description` | `description` | TEXT | (unchanged) |
| `system_prompt` | `system_prompt` | TEXT | (unchanged) |
| `temperature` | `temperature` | DECIMAL | (unchanged) |
| `max_tokens` | `max_tokens` | INTEGER | (unchanged) |
| (new) | `expertise_level` | TEXT | Default: 'intermediate' |
| (new) | `status` | TEXT | Default: 'active' |
| (new) | `validation_status` | TEXT | Default: 'published' |
| (new) | `tenant_id` | UUID | NULL (global agents) |

---

## Example: First Agent in SQL

```sql
-- Agent 1/254: anticoagulation-specialist
INSERT INTO agents (
  id, tenant_id, name, slug, tagline, description,
  title, role_id, function_id, department_id,
  expertise_level, specializations, years_of_experience,
  avatar_url, avatar_description, color_scheme,
  system_prompt, base_model, temperature, max_tokens,
  personality_traits, communication_style,
  status, validation_status,
  usage_count, average_rating, total_conversations,
  metadata, tags
) VALUES (
  'ed83433a-c04d-4789-9fde-5bf4310a8f73',
  NULL,
  'Anticoagulation Specialist',
  'anticoagulation-specialist',
  NULL,
  'Anticoagulation management and monitoring',
  NULL,
  NULL,
  NULL,
  NULL,
  'intermediate',
  '[]'::jsonb,
  NULL,
  'http://127.0.0.1:54321/storage/v1/object/public/avatars/avatar_0009.png',
  NULL,
  '{"primary": "#2196F3"}'::jsonb,
  'YOU ARE: Anticoagulation Specialist...',
  'gpt-4o-mini',
  0.7,
  2000,
  '{}'::jsonb,
  'professional',
  'active',
  'published',
  0,
  NULL,
  0,
  '{}'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  ...
  updated_at = NOW();
```

---

## Testing After Import

### Test 1: Via Supabase Dashboard

```sql
-- Count by status
SELECT status, COUNT(*)
FROM agents
GROUP BY status;

-- Count by validation status
SELECT validation_status, COUNT(*)
FROM agents
GROUP BY validation_status;

-- Sample agents with full details
SELECT
  name,
  slug,
  base_model,
  expertise_level,
  status
FROM agents
LIMIT 10;
```

### Test 2: Via Postman

Open the **VITAL_AI_Platform_Complete.postman_collection.json**:

1. **Agents > Count Agents**
   - Expected: `{"count": 254}`

2. **Agents > Get All Agents**
   - Expected: Array of 10 agents
   - Check fields: name, slug, base_model, status

3. **Agents > Get Agent by ID**
   - Use ID: `ed83433a-c04d-4789-9fde-5bf4310a8f73`
   - Expected: Full agent details

### Test 3: Via curl

```bash
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNzAxNDIsImV4cCI6MjA0Njg0NjE0Mn0.uWHqh-sD3VFv_6nBBygFdD1z9FPYFCLQxTv8X0JjMj8"

# Count agents
curl -s "https://bomltkhixeatxuoxmolq.supabase.co/rest/v1/agents?select=count" \
  -H "apikey: $ANON_KEY" \
  -H "Prefer: count=exact"

# Get first 5 agents
curl -s "https://bomltkhixeatxuoxmolq.supabase.co/rest/v1/agents?select=name,slug,base_model&limit=5" \
  -H "apikey: $ANON_KEY" | python3 -m json.tool
```

---

## Troubleshooting

### Issue: "Syntax error near..."

**Cause**: SQL file corrupted during copy/paste
**Solution**: Re-copy from file, ensure entire file is copied

### Issue: "Column does not exist"

**Cause**: Database schema doesn't match expected structure
**Solution**:
1. Check if schema migration completed successfully
2. Verify table structure: `\d agents` in psql
3. Compare with [schema_foundation/05_agents_and_capabilities.sql](supabase/schema_foundation/05_agents_and_capabilities.sql)

### Issue: "Duplicate key violation"

**Not an Issue**: Script uses `ON CONFLICT DO UPDATE`, so this is handled automatically

### Issue: Query timeout

**Solution**: Split into smaller batches:
```bash
# Split SQL file into 50-agent chunks
split -l 3650 agents_insert_new.sql agents_batch_

# Import each batch separately
# agents_batch_aa (agents 1-50)
# agents_batch_ab (agents 51-100)
# etc.
```

---

## Files Created

### Source Files
- `database/seeds/data/agents-comprehensive.json` - Original 254 agents (old schema)

### Transformation Pipeline
- `scripts/transform_agents_data.py` - Transformation script
- `scripts/generate_sql_inserts.py` - SQL generator (updated for new schema)

### Output Files
- `scripts/agents_transformed.json` - 254 agents (new schema) ✅
- `scripts/agents_insert_new.sql` - Ready to import (18,551 lines) ✅

---

## Next Steps After Import

1. ✅ **Verify agent count** (should be 254)
2. ✅ **Test via Postman** (use existing collection)
3. ✅ **Test API endpoints** (GET, POST, PATCH)
4. **Find and transform persona data** (need ~335 records)
5. **Find and transform JTBD data** (need ~338 records)
6. **Import personas and JTBDs** using same process

---

## Summary

**What you have**:
- ✅ 254 agents transformed to new schema
- ✅ All data quality validations passed
- ✅ SQL file ready to import (18,551 lines)
- ✅ Zero errors, zero warnings

**Next action**:
1. Copy `scripts/agents_insert_new.sql`
2. Paste into Supabase Dashboard SQL Editor
3. Click "Run"
4. Verify with `SELECT COUNT(*) FROM agents;`

**Expected result**: 254 agents imported successfully

---

**Ready to import!**

File location: `scripts/agents_insert_new.sql`
