# Prompt Database Analysis Guide

## Purpose
Understand the existing prompt data and schema in Supabase before implementing Consultation Templates.

---

## Quick Start (5 minutes)

### Option 1: Run Quick Analysis (Recommended First)

1. **Open Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to **SQL Editor**

2. **Run Quick Analysis**
   - Open `QUICK_PROMPT_ANALYSIS.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Review Results**
   - You'll see 6 sections of results:
     - All prompt-related tables
     - Prompts table schema
     - Prompt statistics
     - Sample prompts
     - Category breakdown
     - Foreign key relationships

4. **Document Findings**
   - Copy the results into a new file: `PROMPT_SCHEMA_FINDINGS.md`
   - This will inform the Consultation Templates implementation

---

## Detailed Analysis (30 minutes)

### Option 2: Run Comprehensive Analysis

If you need deeper insights, use the comprehensive analysis file:

1. **Open `ANALYZE_PROMPT_SCHEMA.sql`**
   - This file contains 10 sections with 40+ queries
   - Each section focuses on a specific aspect

2. **Run Queries Section by Section**

   **Section 1: Discover Tables**
   ```sql
   -- Copy and run Query 1.1 and 1.2
   -- This shows all prompt-related tables
   ```

   **Section 2: Analyze Schema**
   ```sql
   -- Copy and run Query 2.1, 2.2, 2.3
   -- This shows columns, constraints, and indexes
   ```

   **Section 3: Analyze Data**
   ```sql
   -- Copy and run Query 3.1 through 3.7
   -- This shows data patterns, categories, tags, ownership
   ```

   **Section 4-5: Analyze Suites**
   ```sql
   -- Copy and run Query 4.1 through 5.3
   -- This shows prompt suites and subsuites (if they exist)
   ```

   **Section 6: Analyze Relationships**
   ```sql
   -- Copy and run Query 6.1 through 6.3
   -- This shows how prompts connect to other tables
   ```

   **Section 7: Identify Improvements**
   ```sql
   -- Copy and run Query 7.1 through 7.4
   -- This shows data quality issues
   ```

   **Section 8-10: Additional Analysis**
   ```sql
   -- Copy and run remaining queries
   -- Versioning, statistics, exports
   ```

3. **Save Results**
   - Export results for each section
   - Document in `PROMPT_SCHEMA_FINDINGS.md`

---

## What to Look For

### Critical Information for Consultation Templates

1. **Prompts Table Structure**
   - ✅ Does it have an `id` column (UUID)?
   - ✅ Does it have `name`, `description`, `prompt_text`?
   - ✅ Does it have `category` or `tags`?
   - ✅ Does it have `variables` (JSONB)?
   - ✅ Does it have `created_by`, `is_public`?

2. **Existing Relationships**
   - ❓ Is `prompts` already referenced by other tables?
   - ❓ Are there foreign keys pointing to prompts?
   - ❓ Do workflow_tasks reference prompts?
   - ❓ Do prompt_subsuites reference prompts?

3. **Data Patterns**
   - ❓ How many prompts exist?
   - ❓ What categories are used?
   - ❓ How are prompts organized?
   - ❓ Are there public vs private prompts?

4. **Potential Conflicts**
   - ⚠️ Are there existing `consultation_templates` tables?
   - ⚠️ Are there existing `template_*` tables?
   - ⚠️ Do we need to rename our proposed tables?

---

## Expected Findings

Based on your codebase, you likely have:

### Likely Tables
- ✅ `prompts` - Main prompt library
- ✅ `prompt_suites` - Collections of prompts
- ✅ `prompt_subsuites` - Sub-collections
- ❓ `prompt_versions` - Version history (maybe)
- ❓ `workflow_tasks` - May reference prompts

### Likely Schema for `prompts`
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  prompt_text TEXT,
  category VARCHAR(100),
  tags TEXT[] or JSONB,
  variables JSONB,
  created_by UUID,
  is_public BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Likely Relationships
- `workflow_tasks.prompt_id -> prompts.id`
- `prompt_subsuites.prompt_id -> prompts.id`

---

## How This Informs Consultation Templates

### If Prompts Table Exists with ID Column
✅ **We can proceed with the designed schema!**

Our proposed `template_steps` table can reference prompts:
```sql
CREATE TABLE template_steps (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES consultation_templates(id),
  prompt_id UUID REFERENCES prompts(id),  -- ✅ This will work!
  -- ... other columns
);
```

### If Prompts Table Has Different Structure
⚠️ **We may need to adjust the schema**

Example adjustments:
- Different column names: Update references
- No `id` column: Add migration to add UUID primary key
- Different primary key type: Adjust foreign key types

### If No Prompts Table Exists
❌ **We need to create it first**

In this case:
1. Create `prompts` table first
2. Migrate any existing prompt data
3. Then create `consultation_templates` tables

---

## Next Steps After Analysis

### Scenario 1: Prompts Table Exists (Most Likely)

1. ✅ Document the exact schema
2. ✅ Verify foreign key compatibility
3. ✅ Proceed with creating consultation_templates tables
4. ✅ Create migration file: `20251114000001_create_consultation_templates.sql`

### Scenario 2: Schema Needs Adjustments

1. ⚠️ Document differences from expected schema
2. ⚠️ Create migration to update prompts table
3. ⚠️ Then proceed with consultation_templates
4. ⚠️ Create two migration files:
   - `20251114000001_update_prompts_schema.sql`
   - `20251114000002_create_consultation_templates.sql`

### Scenario 3: No Prompts Table

1. ❌ Create prompts table first
2. ❌ Import any existing prompt data
3. ❌ Then create consultation_templates
4. ❌ Create three migration files:
   - `20251114000001_create_prompts_table.sql`
   - `20251114000002_migrate_prompt_data.sql`
   - `20251114000003_create_consultation_templates.sql`

---

## Checklist

Before implementing Consultation Templates:

- [ ] Run `QUICK_PROMPT_ANALYSIS.sql`
- [ ] Document findings in `PROMPT_SCHEMA_FINDINGS.md`
- [ ] Verify `prompts` table has `id` column
- [ ] Check existing foreign key relationships
- [ ] Identify any naming conflicts with proposed schema
- [ ] Decide on migration strategy
- [ ] Create migration file(s)
- [ ] Test migration on development database
- [ ] Proceed with implementation

---

## Files Created

1. **`ANALYZE_PROMPT_SCHEMA.sql`** (Comprehensive)
   - 10 sections, 40+ queries
   - Deep analysis of schema, data, relationships
   - Use for detailed investigation

2. **`QUICK_PROMPT_ANALYSIS.sql`** (Quick Start)
   - 6 key queries combined
   - Gets essential information fast
   - Use for initial assessment

3. **`PROMPT_ANALYSIS_GUIDE.md`** (This File)
   - Step-by-step instructions
   - What to look for
   - How to proceed based on findings

---

## Tips

### Running Queries in Supabase
- Use **SQL Editor** in Supabase Dashboard
- Run one section at a time for clarity
- Export results using the **Download CSV** button
- Save results in a separate document

### Handling Errors
- If a query fails, the table/column may not exist
- This is expected and informative
- Document what exists vs what doesn't
- Adjust subsequent queries based on findings

### Performance
- Some queries may take time on large databases
- Add `LIMIT` clauses if needed
- Run during off-peak hours if database is large

---

**Last Updated**: 2025-11-14
**Purpose**: Analyze existing prompt schema before implementing Consultation Templates
**Next Action**: Run QUICK_PROMPT_ANALYSIS.sql and document findings
