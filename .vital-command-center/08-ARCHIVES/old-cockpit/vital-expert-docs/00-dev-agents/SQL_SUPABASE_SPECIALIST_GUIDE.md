# SQL/Supabase Specialist Agent - Quick Start Guide

**Agent Name**: `sql-supabase-specialist`
**Reports To**: `data-architecture-expert`
**Purpose**: Hands-on SQL execution, data migrations, schema operations, and Supabase deployments

---

## When to Use This Agent

### ✅ Use sql-supabase-specialist when you need to:

1. **Deploy database changes**
   - Execute schema migrations
   - Deploy new tables, columns, indexes
   - Create RLS policies, triggers, functions

2. **Transform data formats**
   - Convert JSON to SQL INSERTs
   - Transform CSV to database records
   - Generate bulk insert scripts

3. **Introspect database schema**
   - Query `information_schema` to understand actual schema
   - Compare deployed schema vs design documents
   - Identify missing tables, columns, indexes

4. **Fix deployment errors**
   - Schema mismatch errors (column doesn't exist)
   - Foreign key violations
   - Type casting issues
   - Constraint violations

5. **Validate data integrity**
   - Verify row counts post-migration
   - Check foreign key integrity
   - Validate data types and constraints
   - Generate validation reports

6. **Optimize query performance**
   - Run EXPLAIN ANALYZE
   - Identify missing indexes
   - Recommend query rewrites
   - Measure performance improvements

---

## How to Invoke the Agent

### Option 1: Direct Invocation (You → sql-supabase-specialist)

```
You: @sql-supabase-specialist

I need to deploy the v5.0 persona schema. I have 31 personas in JSON format
at /Users/hichamnaim/Downloads/Medical_Affairs_Personas_V5_EXTENDED.json

Please:
1. Introspect the current personas table schema
2. Transform the JSON to SQL INSERTs
3. Generate a deployment script with transaction safety
4. Include validation queries

Ready to proceed?
```

### Option 2: Through data-architecture-expert (Recommended)

```
You: @data-architecture-expert

I need to deploy persona data to Supabase. Can you coordinate with the
SQL specialist to handle the deployment?

Context:
- 31 personas in JSON format
- Need to populate 69 tables (personas + 68 related tables)
- Must ensure data integrity

Please coordinate with sql-supabase-specialist to execute this.
```

**What happens:**
- data-architecture-expert reviews the architectural requirements
- Delegates hands-on SQL work to sql-supabase-specialist
- sql-supabase-specialist executes and reports back
- data-architecture-expert validates alignment with design

---

## Example Workflows

### Workflow 1: Schema Deployment

```
Step 1: Design (data-architecture-expert)
├─ Review requirements
├─ Design schema structure
└─ Define constraints and relationships

Step 2: Implementation (sql-supabase-specialist)
├─ Generate CREATE TABLE statements
├─ Add indexes and constraints
├─ Wrap in transaction with validation
└─ Execute deployment

Step 3: Validation (sql-supabase-specialist)
├─ Verify tables created
├─ Check indexes exist
├─ Validate constraints
└─ Report results to data-architecture-expert
```

### Workflow 2: Data Migration

```
Step 1: Plan (data-architecture-expert)
├─ Assess migration scope
├─ Define rollback strategy
└─ Identify validation criteria

Step 2: Introspect (sql-supabase-specialist)
├─ Query current schema
├─ Identify any schema drift
├─ Compare to expected schema
└─ Report mismatches

Step 3: Transform (sql-supabase-specialist)
├─ Read source data (JSON/CSV)
├─ Map to database columns
├─ Generate SQL with proper escaping
└─ Create deployment script

Step 4: Deploy (sql-supabase-specialist)
├─ Execute migration in transaction
├─ Monitor for errors
├─ Run validation queries
└─ Commit or rollback

Step 5: Verify (sql-supabase-specialist)
├─ Check row counts
├─ Validate foreign keys
├─ Test sample queries
└─ Generate validation report
```

### Workflow 3: Fixing Schema Mismatch

```
Problem: Deployment fails with "column does not exist" error

Step 1: Diagnose (sql-supabase-specialist)
├─ Introspect actual deployed schema
├─ Compare to SQL script expectations
├─ Identify all mismatches
└─ Generate comparison report

Step 2: Fix (sql-supabase-specialist)
├─ Regenerate SQL using actual schema
├─ Adjust column mappings
├─ Use metadata JSONB for extra fields
└─ Create corrected deployment script

Step 3: Validate (sql-supabase-specialist)
├─ Test SQL syntax
├─ Verify foreign key lookups
├─ Check data type compatibility
└─ Report ready for deployment

Step 4: Deploy (sql-supabase-specialist)
├─ Execute corrected SQL
├─ Monitor for errors
└─ Confirm success
```

---

## Real-World Example: What We Just Fixed

### The Problem
```
Error: column "employment_status" of relation "personas" does not exist
```

Original SQL tried to insert into columns that don't exist in the deployed schema.

### The Solution (sql-supabase-specialist workflow)

**Step 1: Introspected actual schema**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'personas'
ORDER BY ordinal_position;
```

**Found:**
- ✅ Exists: `id`, `tenant_id`, `name`, `slug`, `title`, `role_id`, `metadata`
- ❌ Missing: `employment_status`, `company_size`, `age_range`, etc.

**Step 2: Analyzed mismatch**
- Deployed schema uses `metadata` JSONB for extra fields
- Original SQL expected individual columns for each field
- Need to restructure INSERT statements

**Step 3: Generated corrected SQL**
```python
# Created transform_json_to_sql_FIXED.py
# Maps extra fields to metadata JSONB column
# Uses only columns that actually exist
```

**Step 4: Produced deployment script**
- `DEPLOY_MEDICAL_AFFAIRS_PERSONAS_V5_FIXED.sql` (754 KB)
- Wrapped in BEGIN/COMMIT transaction
- Includes validation queries
- Ready to deploy

**Step 5: Ready for execution**
```bash
psql "connection_string" -f DEPLOY_MEDICAL_AFFAIRS_PERSONAS_V5_FIXED.sql
```

---

## Agent Capabilities Summary

### Schema Operations
- ✅ Introspect tables, columns, indexes, constraints
- ✅ Compare actual vs expected schema
- ✅ Generate CREATE/ALTER/DROP statements
- ✅ Deploy schema changes with transaction safety

### Data Transformation
- ✅ JSON → SQL INSERTs
- ✅ CSV → SQL INSERTs
- ✅ Handle PostgreSQL data types (JSONB, TEXT[], UUID)
- ✅ Proper SQL escaping and type casting

### Migration Execution
- ✅ Multi-step migrations with rollback
- ✅ Batch inserts for large datasets
- ✅ Progress monitoring and logging
- ✅ Error handling and recovery

### Data Validation
- ✅ Row count verification
- ✅ Foreign key integrity checks
- ✅ Data type validation
- ✅ Cross-reference source vs target

### Performance Optimization
- ✅ EXPLAIN ANALYZE query plans
- ✅ Index recommendations
- ✅ Query rewrites
- ✅ Before/after metrics

---

## Quick Reference: Common Tasks

### Deploy Schema
```
@sql-supabase-specialist

Deploy the schema defined in schema.sql
Include: transaction safety, validation, rollback plan
```

### Transform JSON to SQL
```
@sql-supabase-specialist

Transform personas.json to SQL INSERTs
Target table: personas
Introspect schema first to match columns exactly
```

### Fix Schema Mismatch
```
@sql-supabase-specialist

Deployment failed with: ERROR: column "X" does not exist

Please:
1. Introspect actual schema
2. Compare to SQL expectations
3. Regenerate corrected SQL
```

### Validate Migration
```
@sql-supabase-specialist

Migration completed. Please validate:
- Row counts match expected
- Foreign keys are valid
- No NULL values in required columns
- Data types are correct
```

### Optimize Slow Query
```
@sql-supabase-specialist

This query takes 5 seconds:
SELECT ... FROM ... WHERE ...

Please:
1. Run EXPLAIN ANALYZE
2. Identify bottlenecks
3. Recommend optimizations
4. Show performance improvement
```

---

## Integration with Agent Team

```
┌─────────────────────────────────────────────┐
│      data-architecture-expert (Architect)   │
│      - Designs schemas                      │
│      - Plans migrations                     │
│      - Sets security policies               │
└──────────────┬──────────────────────────────┘
               │
               │ Delegates hands-on work
               ▼
┌─────────────────────────────────────────────┐
│   sql-supabase-specialist (Implementer)     │
│   - Introspects schemas                     │
│   - Generates SQL                           │
│   - Executes migrations                     │
│   - Validates data                          │
│   - Reports results                         │
└─────────────────────────────────────────────┘
```

**Workflow:**
1. User requests database work
2. data-architecture-expert assesses architectural requirements
3. data-architecture-expert delegates implementation to sql-supabase-specialist
4. sql-supabase-specialist executes and validates
5. sql-supabase-specialist reports back to data-architecture-expert
6. data-architecture-expert confirms alignment with design

---

## Best Practices

### ✅ DO:
- Always introspect schema before generating SQL
- Use transactions for all multi-step operations
- Include validation queries in migrations
- Test on staging before production
- Document rollback procedures
- Ask for confirmation before destructive operations

### ❌ DON'T:
- Assume schema matches design docs
- Execute migrations without backups
- Skip validation queries
- Use hard-coded connection strings in scripts
- Deploy directly to production without testing
- Ignore errors (rollback and investigate)

---

## Getting Help

If you need assistance with sql-supabase-specialist:

1. **Review this guide** for common workflows
2. **Check agent examples** in the agent description
3. **Invoke with clear context** about your task
4. **Provide specifics**: file paths, table names, error messages
5. **Ask questions** if requirements are unclear

The agent is designed to be proactive, asking clarifying questions and flagging potential issues before they cause problems.

---

**Status**: ✅ READY FOR USE
**Created**: 2025-11-17
**Agent File**: `.claude/agents/sql-supabase-specialist.md`
**Integration**: Works under `data-architecture-expert`
