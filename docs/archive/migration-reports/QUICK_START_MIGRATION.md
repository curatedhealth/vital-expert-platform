# Quick Start: Pharma/Medical Affairs Migration

**Estimated Time:** 25 minutes total
**Risk:** LOW - All operations are additive (no data loss)

---

## Step-by-Step Execution Guide

### ✅ Step 1: Create `strategic_priorities` Table (5 minutes)

**Action:** Run SQL in Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire SQL below and paste it:

```sql
-- Create strategic_priorities table
CREATE TABLE IF NOT EXISTS strategic_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(100),
  function VARCHAR(100) DEFAULT 'Medical Affairs',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_strategic_priorities_code ON strategic_priorities(code);
CREATE INDEX IF NOT EXISTS idx_strategic_priorities_function ON strategic_priorities(function);

-- Seed 7 strategic priorities
INSERT INTO strategic_priorities (code, name, description, color, icon, metadata)
VALUES
  ('SP01', 'Growth & Market Access', 'Market expansion, launch planning, evidence generation for payer access, health economics and outcomes research', 'emerald', 'TrendingUp', '{"jtbd_count": 17, "priority": 1}'::jsonb),
  ('SP02', 'Scientific Excellence', 'Cross-functional product strategy, publication planning, medical information, evidence-based digital therapeutics', 'blue', 'Microscope', '{"jtbd_count": 19, "priority": 2}'::jsonb),
  ('SP03', 'Stakeholder Engagement', 'KOL identification and engagement, medical education, congress planning, advisory boards', 'purple', 'Users', '{"jtbd_count": 18, "priority": 3}'::jsonb),
  ('SP04', 'Compliance & Quality', 'Regulatory compliance, off-label request handling, medical review, quality assurance, risk management', 'red', 'Shield', '{"jtbd_count": 14, "priority": 4}'::jsonb),
  ('SP05', 'Operational Excellence', 'Process optimization, resource allocation, budget planning, performance metrics, cross-functional coordination', 'orange', 'Settings', '{"jtbd_count": 15, "priority": 5}'::jsonb),
  ('SP06', 'Talent Development', 'Training programs, knowledge management, onboarding, competency frameworks, career development', 'indigo', 'GraduationCap', '{"jtbd_count": 8, "priority": 6}'::jsonb),
  ('SP07', 'Innovation & Digital', 'Digital transformation, AI/ML adoption, data analytics, emerging technologies, innovation scouting', 'pink', 'Sparkles', '{"jtbd_count": 14, "priority": 7}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Add strategic_priority_id to jtbd_library
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jtbd_library' AND column_name = 'strategic_priority_id'
  ) THEN
    ALTER TABLE jtbd_library ADD COLUMN strategic_priority_id UUID REFERENCES strategic_priorities(id);
    CREATE INDEX idx_jtbd_library_strategic_priority ON jtbd_library(strategic_priority_id);
  END IF;
END $$;

-- Verify
SELECT 'Strategic Priorities Created:' as status, COUNT(*)::text as count FROM strategic_priorities;
```

6. Click **Run** (or press Cmd/Ctrl + Enter)
7. **Expected Result:** "Strategic Priorities Created: 7"

---

### ✅ Step 2: Link JTBDs to Strategic Priorities (2 minutes)

**Action:** Run Python script

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/execute_phase1.py
```

**Expected Output:**
```
================================================================================
PHASE 1: CREATE STRATEGIC PRIORITIES & LINK TO JTBDs
================================================================================

Step 1: Creating strategic_priorities table...
  ✅ strategic_priorities table already exists

Step 2: Inserting 7 strategic priorities...
  ⏭️  SP01: Growth & Market Access (already exists)
  ⏭️  SP02: Scientific Excellence (already exists)
  ⏭️  SP03: Stakeholder Engagement (already exists)
  ⏭️  SP04: Compliance & Quality (already exists)
  ⏭️  SP05: Operational Excellence (already exists)
  ⏭️  SP06: Talent Development (already exists)
  ⏭️  SP07: Innovation & Digital (already exists)

Summary: ✅ 0 created | ⏭️  7 already existed

Step 3: Checking jtbd_library schema...
  ✅ jtbd_library has strategic_priority_id column

Step 4: Linking JTBDs to strategic priorities...
  ✅ JTBD-MA-001 → SP01
  ✅ JTBD-MA-002 → SP01
  ✅ JTBD-MA-003 → SP02
  ✅ JTBD-MA-004 → SP05
  ✅ JTBD-MA-005 → SP04

Summary: ✅ 105 linked | ⏭️  0 already linked | ❌ 0 errors

================================================================================
VERIFICATION
================================================================================

Strategic Priorities: 7

JTBDs per Strategic Priority:
  ✅ SP01: 17 JTBDs (expected: 17)
  ✅ SP02: 19 JTBDs (expected: 19)
  ✅ SP03: 18 JTBDs (expected: 18)
  ✅ SP04: 14 JTBDs (expected: 14)
  ✅ SP05: 15 JTBDs (expected: 15)
  ✅ SP06: 8 JTBDs (expected: 8)
  ✅ SP07: 14 JTBDs (expected: 14)

Unlinked Medical Affairs JTBDs: 0 (should be 0)

================================================================================
PHASE 1 COMPLETE!
================================================================================
```

---

### ✅ Step 3: Import Workflows (15 minutes)

**Action:** Run Python script

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
python3 scripts/phase2_import_workflows_simple.py
```

**Expected Output:**
```
================================================================================
PHASE 2: MEDICAL AFFAIRS WORKFLOWS IMPORT
================================================================================
Target: Simple 'workflows' table (currently has 141 records)
================================================================================

📂 Loading SP01_Growth_MarketAccess_OperationalLibrary_FULL.json...

================================================================================
🔄 IMPORTING WORKFLOWS from SP01: Growth & Market Access
================================================================================

Found 17 JTBDs in SP01

  📋 JTBD-MA-001: Annual Strategic Planning
     Workflows: 1
       ✅ Created: Annual Strategic Planning Process...

  📋 JTBD-MA-002: Evidence Generation Strategy
     Workflows: 1
       ✅ Created: Evidence Generation Planning...

[... continues for all 7 strategic pillars ...]

SP01 Summary: ✅ 15 created | ⏭️  2 skipped | ❌ 0 errors

[... SP02 through SP07 ...]

================================================================================
IMPORT COMPLETE
================================================================================
✅ Total Created: 111
⏭️  Total Skipped: 0
❌ Total Errors: 0

📊 Total workflows in database: 252

📋 Sample workflows:
  • Annual Strategic Planning Process for JTBD-MA-001...
  • Evidence Generation Planning for JTBD-MA-002...
  • KOL Identification and Profiling for JTBD-MA-030...
  • Medical Information Response Workflow for JTBD-MA-015...
  • Publication Planning Process for JTBD-MA-020...

================================================================================
Next Step: Create tasks and link to agents/prompts/tools
================================================================================
```

---

### ✅ Step 4: Verify Migration Success (3 minutes)

**Action:** Run verification queries in Supabase SQL Editor

```sql
-- 1. Count strategic priorities
SELECT COUNT(*) as strategic_priorities FROM strategic_priorities;
-- Expected: 7

-- 2. Count JTBDs linked to strategic priorities
SELECT
  sp.code,
  sp.name,
  COUNT(j.id) as jtbd_count
FROM strategic_priorities sp
LEFT JOIN jtbd_library j ON j.strategic_priority_id = sp.id
GROUP BY sp.code, sp.name
ORDER BY sp.code;
-- Expected: SP01-SP07 with counts: 17, 19, 18, 14, 15, 8, 14

-- 3. Count total workflows
SELECT COUNT(*) as total_workflows FROM workflows;
-- Expected: ~252 (141 existing + 111 new)

-- 4. Count workflows by strategic priority
SELECT
  sp.code,
  sp.name,
  COUNT(DISTINCT w.id) as workflow_count
FROM strategic_priorities sp
JOIN jtbd_library j ON j.strategic_priority_id = sp.id
JOIN workflows w ON w.definition->>'jtbd_id' = j.id
WHERE w.definition->>'source' LIKE '%Operational Library%'
GROUP BY sp.code, sp.name
ORDER BY sp.code;
-- Expected: Workflows distributed across SP01-SP07

-- 5. Sample workflow with tasks
SELECT
  w.name,
  w.description,
  w.definition->'task_count' as task_count,
  w.definition->'phase_count' as phase_count,
  w.definition->'duration' as duration
FROM workflows w
WHERE w.definition->>'jtbd_id' = 'JTBD-MA-001'
LIMIT 1;
-- Expected: Shows workflow with phases and tasks

-- 6. Count total tasks (nested in workflows)
SELECT
  SUM((w.definition->>'task_count')::int) as total_tasks
FROM workflows w
WHERE w.definition->>'source' LIKE '%Operational Library%';
-- Expected: ~500+
```

---

## ✅ Success Criteria

After completing all steps, you should have:

- [x] 7 strategic priorities in `strategic_priorities` table
- [x] 105 Medical Affairs JTBDs linked to strategic priorities
- [x] ~252 total workflows (141 existing + 111 new)
- [x] ~500+ tasks (nested in `workflow.definition.phases[]`)
- [x] All workflows have valid JTBD links
- [x] Zero data loss from existing records

---

## 🚨 Troubleshooting

### Issue: "Table strategic_priorities does not exist"
**Solution:** Run Step 1 SQL in Supabase Dashboard first

### Issue: "Column strategic_priority_id does not exist"
**Solution:** The ALTER TABLE command in Step 1 SQL should have created it. Re-run Step 1 SQL.

### Issue: Workflows already exist (skipped)
**Solution:** This is normal if you've run the import before. The script skips duplicates automatically.

### Issue: Import script shows errors
**Solution:** Check the error message. Common issues:
- Missing JSON files in `/Users/hichamnaim/Downloads/`
- Supabase credentials not loaded (check `.env` file)

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| [scripts/phase1_create_strategic_priorities.sql](scripts/phase1_create_strategic_priorities.sql) | Complete Phase 1 SQL (run in Supabase) |
| [scripts/execute_phase1.py](scripts/execute_phase1.py) | Phase 1 Python script (link JTBDs) |
| [scripts/phase2_import_workflows_simple.py](scripts/phase2_import_workflows_simple.py) | Phase 2 Python script (import workflows) |
| [PHARMA_SCHEMA_ARCHITECTURE.md](PHARMA_SCHEMA_ARCHITECTURE.md) | Complete schema documentation |
| [PHARMA_MIGRATION_READY.md](PHARMA_MIGRATION_READY.md) | Detailed migration guide |

---

## 🎯 What's Next?

After successful migration:

1. **Extract Tasks to Separate Table** (optional)
   - Currently tasks are nested in `workflow.definition.phases[]`
   - Can create dedicated `tasks` table if needed

2. **Create Tools Table**
   - Extract unique tools from workflow definitions
   - Link tasks to tools

3. **Create Prompts Table**
   - Define prompt templates for task execution
   - Link tasks to prompts

4. **Create RAG Domains Table**
   - Define knowledge domains
   - Link to Pinecone namespaces
   - Associate tasks with RAG domains

5. **Apply Same Pattern to Digital Health**
   - Rename `dh_domain` → `strategic_imperatives`
   - Migrate `dh_use_case` → `jtbd_library`
   - Use shared `workflows`, `tasks`, `personas` tables

---

**Last Updated:** 2025-11-10
**Status:** Ready to Execute
**Total Time:** ~25 minutes
**Risk Level:** LOW (all operations are additive)
