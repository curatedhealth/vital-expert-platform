# Pharma/Medical Affairs - Migration Ready

**Date:** 2025-11-10
**Status:** ✅ Scripts Ready - Awaiting Execution
**Impact:** HIGH - Correct schema architecture defined, data loss prevented

---

## 🎯 What We Discovered

### Current Database State
- ✅ **141 workflows** already in simple `workflows` table
- ✅ **371 JTBDs** in `jtbd_library` (includes 105 Medical Affairs + Digital Health)
- ✅ **185 personas** in `dh_personas`
- ✅ **190 agents** in `agents` table
- ❌ **No `tasks` table** (needs to be created)
- ❌ **No `tools` table** (needs to be created)

### Key Schema Insights

**Workflows Table Structure (Existing):**
```typescript
{
  id: UUID,
  name: string,
  description: string,
  definition: JSONB,  // Contains phases, tasks, metadata
  status: 'active' | 'inactive',
  is_public: boolean,
  created_at: timestamp
}
```

The `definition` JSONB contains:
- `workflow_id`, `workflow_name`
- `jtbd_id` (VARCHAR link to jtbd_library)
- `phases` (array of phases with tasks)
- `task_count`, `phase_count`
- `duration`, `total_effort`
- `source` metadata

**This is perfect!** The existing structure already supports what we need.

---

## 📋 Correct Architecture (Confirmed)

```
Pharma (Industry)
  └── Medical Affairs (Function)
      └── Strategic Priorities (SP01-SP07)
          └── JTBDs (jtbd_library)
              └── Workflows (workflows table)
                  └── Tasks (need to extract from workflow.definition.phases)
                      ├── Agents (agents table - 190 exist)
                      ├── Prompts (to be created)
                      ├── Tools (to be created)
                      └── RAG Domains (Supabase) → Namespaces (Pinecone)
```

---

## 📁 Files Created

### 1. [PHARMA_SCHEMA_ARCHITECTURE.md](PHARMA_SCHEMA_ARCHITECTURE.md)
**Purpose:** Complete schema mapping and migration plan
**Contents:**
- Current vs correct schema mapping
- Detailed table schemas
- Relationship diagrams
- Migration phases
- Critical decision points

### 2. [scripts/phase1_create_strategic_priorities.sql](scripts/phase1_create_strategic_priorities.sql)
**Purpose:** Create `strategic_priorities` table and link to JTBDs
**Duration:** 5 minutes
**Risk:** LOW - Only adding new structures

**What it does:**
1. Creates `strategic_priorities` table
2. Seeds 7 strategic priorities (SP01-SP07)
3. Adds `strategic_priority_id` column to `jtbd_library`
4. Links 105 Medical Affairs JTBDs to strategic priorities
5. Verification queries

### 3. [scripts/phase2_import_workflows_simple.py](scripts/phase2_import_workflows_simple.py)
**Purpose:** Import ~111 workflows to simple `workflows` table
**Duration:** 15 minutes
**Risk:** LOW - Using existing table structure

**What it does:**
1. Loads 7 SP operational library JSON files
2. Extracts workflows from each JTBD
3. Builds workflow records matching existing schema
4. Inserts into `workflows` table (skips duplicates)
5. Verification and counts

### 4. [scripts/check_table_schemas.py](scripts/check_table_schemas.py)
**Purpose:** Verify existing table structures
**Status:** ✅ Already executed

**What we learned:**
- `workflows` table has 141 records with correct structure
- `definition` JSONB already contains tasks, phases
- Tasks are nested inside workflow definitions, not separate table
- Agents exist (190 records)
- Tools table doesn't exist yet

---

## 🚀 Execution Plan

### Step 1: Run Phase 1 Migration (5 minutes)
**Execute SQL script in Supabase Dashboard:**

```bash
# Option A: Supabase Dashboard SQL Editor
1. Go to https://supabase.com/dashboard
2. Navigate to: Project → SQL Editor
3. Copy contents of: scripts/phase1_create_strategic_priorities.sql
4. Execute
5. Verify: "✅ 7 Strategic Priorities Created"
6. Verify: "✅ 105 JTBDs Linked"
```

**Verification:**
```sql
SELECT COUNT(*) FROM strategic_priorities;
-- Expected: 7

SELECT sp.code, COUNT(j.id) as jtbd_count
FROM strategic_priorities sp
LEFT JOIN jtbd_library j ON j.strategic_priority_id = sp.id
GROUP BY sp.code
ORDER BY sp.code;
-- Expected: SP01-SP07 with counts matching PHARMA_SCHEMA_ARCHITECTURE.md
```

### Step 2: Run Phase 2 Workflow Import (15 minutes)
**Execute Python script:**

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/phase2_import_workflows_simple.py
```

**Expected output:**
```
PHASE 2: MEDICAL AFFAIRS WORKFLOWS IMPORT
==========================================
Target: Simple 'workflows' table (currently has 141 records)

🔄 IMPORTING WORKFLOWS from SP01: Growth & Market Access
  📋 JTBD-MA-001: Annual Strategic Planning
     Workflows: 1
       ✅ Created: Annual Strategic Planning Process...

[... continues for all 7 strategic pillars ...]

IMPORT COMPLETE
==========================================
✅ Total Created: ~111
⏭️  Total Skipped: 0
❌ Total Errors: 0

📊 Total workflows in database: ~252 (141 existing + 111 new)
```

**Verification:**
```python
# Check workflows linked to Medical Affairs JTBDs
supabase.table('workflows')\
  .select('name, description')\
  .filter('description', 'like', '%JTBD-MA-%')\
  .execute()
# Expected: ~111 workflows
```

### Step 3: Verify Data Integrity (5 minutes)

**Run verification queries:**

```sql
-- 1. Count workflows per strategic priority
SELECT
  sp.code,
  sp.name,
  COUNT(DISTINCT w.id) as workflow_count
FROM strategic_priorities sp
JOIN jtbd_library j ON j.strategic_priority_id = sp.id
JOIN workflows w ON w.definition->>'jtbd_id' = j.id
GROUP BY sp.code, sp.name
ORDER BY sp.code;

-- 2. Sample workflow with full definition
SELECT
  name,
  description,
  definition->'phases' as phases,
  definition->'task_count' as task_count
FROM workflows
WHERE definition->>'jtbd_id' = 'JTBD-MA-001'
LIMIT 1;

-- 3. Count tasks across all workflows
SELECT
  SUM((definition->>'task_count')::int) as total_tasks
FROM workflows
WHERE definition->>'source' LIKE '%Operational Library%';
-- Expected: ~500+
```

---

## ✅ Success Criteria

### Phase 1 Complete When:
- [x] Documentation created
- [x] Phase 1 SQL script created
- [ ] `strategic_priorities` table exists with 7 records
- [ ] All 105 Medical Affairs JTBDs linked to strategic priorities
- [ ] Verification queries confirm correct links

### Phase 2 Complete When:
- [x] Phase 2 Python script created
- [ ] ~111 workflows imported to `workflows` table
- [ ] Total workflow count: ~252 (141 existing + 111 new)
- [ ] All workflows have valid `definition` JSONB
- [ ] Can query workflows by JTBD ID

### Data Integrity Confirmed When:
- [ ] No duplicate workflows
- [ ] All JTBDs have at least 1 workflow
- [ ] Task count matches source data (~500+ tasks)
- [ ] Workflow definitions contain phases, tasks, owners, tools, outputs

---

## 🎯 After Migration: Next Steps

### 1. Extract Tasks to Separate Table (Optional)
Currently, tasks are stored in `workflow.definition.phases[].tasks[]`.

If you want a separate `tasks` table:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  task_code VARCHAR,
  title VARCHAR NOT NULL,
  objective TEXT,
  phase_name VARCHAR,
  position INTEGER,
  duration_estimate_minutes INTEGER,
  owner VARCHAR,  -- Persona role
  tools JSONB,    -- Array of tool names
  outputs JSONB,  -- Array of expected outputs
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Then populate from existing workflow definitions.

### 2. Create Tools Table
Extract tool names from `workflow.definition.phases[].tasks[].tools`:

```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  category VARCHAR,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Seed with unique tools from workflows
INSERT INTO tools (name, category)
SELECT DISTINCT
  jsonb_array_elements_text(task->'tools') as tool_name,
  'Medical Affairs' as category
FROM workflows,
  jsonb_array_elements(definition->'phases') as phase,
  jsonb_array_elements(phase->'tasks') as task
WHERE definition->>'source' LIKE '%Operational Library%';
```

### 3. Create Prompts Table
Link tasks to prompt templates:

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  template TEXT NOT NULL,
  category VARCHAR,
  variables JSONB,
  is_active BOOLEAN DEFAULT true
);
```

### 4. Create RAG Domains Table
Link to Pinecone namespaces:

```sql
CREATE TABLE rag_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  namespace VARCHAR,  -- Pinecone namespace
  description TEXT,
  pinecone_index VARCHAR,
  is_active BOOLEAN DEFAULT true
);
```

---

## 🔍 Current vs Target State

### Current State (Before Migration)
```
✅ 371 JTBDs in jtbd_library
✅ 141 workflows in workflows table
✅ 190 agents in agents table
✅ 185 personas in dh_personas
❌ No strategic_priorities table
❌ No separate tasks table
❌ No tools table
❌ No prompts table
❌ No rag_domains table
```

### Target State (After Phase 1 & 2)
```
✅ 7 strategic priorities
✅ 371 JTBDs linked to strategic priorities
✅ ~252 workflows (141 existing + 111 new)
✅ ~500+ tasks (nested in workflow definitions)
✅ 190 agents
✅ 185 personas
⏭️  Tools (to be extracted and created)
⏭️  Prompts (to be created)
⏭️  RAG Domains (to be created)
```

---

## 📊 Expected Data Counts

| Data Type | Before | After Phase 1 | After Phase 2 | Notes |
|-----------|--------|---------------|---------------|-------|
| Strategic Priorities | 0 | 7 | 7 | SP01-SP07 |
| JTBDs | 371 | 371 | 371 | 105 MA + 266 DH |
| JTBDs Linked to SP | 0 | 105 | 105 | Only MA linked |
| Workflows | 141 | 141 | ~252 | +111 MA workflows |
| Tasks (nested) | ~? | ~? | ~500+ | In workflow.definition |
| Personas | 185 | 185 | 185 | To be renamed |
| Agents | 190 | 190 | 190 | Already exists |
| Tools | 0 | 0 | 0 | To be extracted |
| Prompts | ? | ? | ? | To be created |
| RAG Domains | ? | ? | ? | To be created |

---

## 🚨 Important Notes

### Data Loss Prevention
- ✅ All scripts use **INSERT** or **ADD COLUMN** only
- ✅ No **DROP** or **DELETE** commands
- ✅ Duplicate checking with `maybe_single()` before inserts
- ✅ ON CONFLICT clauses for idempotency
- ✅ Verification queries after each phase

### Rollback Plan
If anything goes wrong:

**Phase 1 Rollback:**
```sql
ALTER TABLE jtbd_library DROP COLUMN IF EXISTS strategic_priority_id;
DROP TABLE IF EXISTS strategic_priorities CASCADE;
```

**Phase 2 Rollback:**
```sql
-- Delete only newly imported workflows
DELETE FROM workflows
WHERE definition->>'source' LIKE '%Operational Library%'
  AND created_at > '2025-11-10';
```

---

## 🎨 Visual Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Medical Affairs Data Architecture              │
└─────────────────────────────────────────────────────────────┘

Strategic Priorities (7)
├── SP01: Growth & Market Access (17 JTBDs)
├── SP02: Scientific Excellence (19 JTBDs)
├── SP03: Stakeholder Engagement (18 JTBDs)
├── SP04: Compliance & Quality (14 JTBDs)
├── SP05: Operational Excellence (15 JTBDs)
├── SP06: Talent Development (8 JTBDs)
└── SP07: Innovation & Digital (14 JTBDs)

Each JTBD has 1-3 workflows → ~111 total workflows
Each workflow has 3-5 phases → Each phase has 3-6 tasks → ~500+ tasks

Tasks linked to:
- Agents (190 available)
- Prompts (to be created)
- Tools (to be extracted)
- RAG Domains → Pinecone Namespaces
```

---

**END OF MIGRATION PLAN**

📅 **Last Updated:** 2025-11-10
✅ **Status:** Scripts Ready - Awaiting Execution
🚀 **Next Action:** Execute Phase 1 SQL script
📊 **Total Records to Import:** ~118 (7 strategic priorities + 111 workflows)
⏱️ **Estimated Time:** 20 minutes (5 min Phase 1 + 15 min Phase 2)
🎯 **Risk Level:** LOW - No data loss, all inserts are additive
