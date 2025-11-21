# How to Apply Part 8 - Quick Reference

## ✅ Part 8 is READY

**File**: [20251113100007_complete_schema_part8_final.sql](./20251113100007_complete_schema_part8_final.sql)

**Status**: All blocking issues resolved ✅

**Size**: 205 lines

**Contents**:
- 27 CREATE INDEX statements
- 10 ANALYZE statements
- RLS skip notice
- Verification message

---

## 📋 Apply via Supabase Dashboard

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq

### Step 2: Open SQL Editor
Navigate to: **SQL Editor** → **New Query**

### Step 3: Copy File Contents
Copy the entire contents of `20251113100007_complete_schema_part8_final.sql`

### Step 4: Paste and Run
1. Paste into the SQL Editor
2. Click the **"Run"** button (or press Cmd/Ctrl + Enter)
3. Wait for completion (~1-2 minutes)

### Step 5: Verify Success
You should see output messages like:
```
NOTICE: Skipping idx_agents_tenant_active and idx_workflows_tenant_active - is_active column does not exist in old schema
NOTICE: Skipping idx_agents_function_status - function_id column may not exist in old agents schema
...
NOTICE: ========================================
NOTICE: ✅ PHASE 26 COMPLETE
NOTICE: ========================================
NOTICE: Total indexes created: [count]
...
NOTICE: ⚠️  RLS POLICIES SKIPPED
NOTICE: ========================================
```

---

## 🔍 Post-Application Verification

Run these queries in Supabase SQL Editor to verify:

### 1. Check Total Index Count
```sql
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';
```
Expected: ~210+ indexes

### 2. Check New Indexes from Part 8
```sql
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_consultations_%'
  OR indexname LIKE 'idx_panels_%'
  OR indexname LIKE 'idx_workflow_execs_%'
  OR indexname LIKE 'idx_jtbd_personas_%'
  OR indexname LIKE 'idx_analytics_events_%'
ORDER BY indexname;
```
Expected: 15-20 new indexes

### 3. Verify Table Count
```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```
Expected: ~123 tables

---

## 📊 What Part 8 Creates

### Indexes by Category:

| Category | Indexes Created | Skipped | Reason for Skip |
|----------|----------------|---------|-----------------|
| Multi-tenant queries | 2 | 2 | is_active column missing |
| User activity | 3 | 0 | ✅ |
| Agent performance | 1 | 1 | function_id missing |
| JTBD/Persona queries | 2 | 1 | is_active column missing |
| Knowledge queries | 1 | 1 | is_active column missing |
| Workflow execution | 2 | 0 | ✅ |
| Messages | 3 | 0 | ✅ |
| Cost tracking | 2 | 2 | tenant_id missing |
| Analytics | 3 | 1 | Expression index removed |
| Audit/Compliance | 2 | 0 | ✅ |
| Alerts/Rate limits | 4 | 0 | ✅ |
| Expression indexes | 0 | 2 | IMMUTABLE requirement |
| **TOTAL** | **27** | **10** | |

### ANALYZE Statements:
Statistics updated for 10 core tables:
- tenants
- user_profiles
- agents
- personas
- jobs_to_be_done
- workflows
- expert_consultations
- panel_discussions
- knowledge_sources
- knowledge_chunks

---

## ⚠️ What Part 8 DOES NOT Include

### 1. RLS Policies (Intentionally Skipped)
- Must be configured manually via Supabase Dashboard
- Reason: Avoid conflicts with Supabase auth system
- See: [RLS Configuration Guide](#rls-configuration)

### 2. Helper Functions (Removed)
- All custom functions removed to avoid IMMUTABLE errors
- Can be added manually if needed

### 3. Expression Indexes (Removed)
- `idx_user_profiles_email_domain` - Uses LOWER() and split_part()
- `idx_analytics_events_year_month` - Uses EXTRACT()
- Reason: Functions must be IMMUTABLE
- Can be created manually with wrapper functions if needed

---

## 🚀 After Part 8 is Applied

### Immediate Next Steps:

1. **Verify Migration Success**
   - Check for any error messages
   - Run verification queries above
   - Confirm ~210+ indexes exist

2. **Update Migration Status**
   - Mark Part 8 as APPLIED in MIGRATION_STATUS.md

3. **Optional: Configure RLS**
   - Follow [RLS Configuration Guide](#rls-configuration)
   - Enable RLS on multi-tenant tables
   - Create tenant isolation policies

4. **Import Production Data**
   - 254 agents → `agents` table
   - 335 personas → `personas` table
   - 338 JTBDs → `jobs_to_be_done` table

5. **Test Application**
   - Verify API endpoints work
   - Check query performance (<200ms target)
   - Test multi-tenant data isolation

---

## 🛡️ RLS Configuration

RLS policies were intentionally skipped in Part 8. Configure manually:

### Step 1: Enable RLS on Tables
```sql
-- Core multi-tenant tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- AI assets
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Services
ALTER TABLE expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Basic Policies
```sql
-- Example: Users can view their own tenant
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

-- Example: Users can view consultations in their tenant
CREATE POLICY "Users can view consultations in their tenant"
  ON expert_consultations FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));
```

### Step 3: Test RLS
```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '<user-id>';
SELECT * FROM tenants; -- Should only return user's tenant
```

---

## 📝 Troubleshooting

### Error: "column X does not exist"
**Solution**: Part 8 is designed to skip indexes on missing columns. This is expected.

### Error: "functions must be marked IMMUTABLE"
**Solution**: This has been fixed in the latest version. Make sure you're using the 205-line version of Part 8.

### Error: "relation X does not exist"
**Solution**: Ensure Parts 1-7 were applied successfully before Part 8.

### No Errors but Indexes Not Created
**Check**: Some indexes are intentionally skipped (10 total). Review NOTICE messages to see which were skipped.

---

## 📞 Need Help?

- **Migration Status**: See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md)
- **Part 8 Details**: See [PART8_FINAL_FIX.md](./PART8_FINAL_FIX.md)
- **Part 5 Issues**: See [PART5_FIX_SUMMARY.md](./PART5_FIX_SUMMARY.md)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/bomltkhixeatxuoxmolq
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: 2025-11-13
**Migration Version**: Gold Standard (123 tables)
**Part 8 Version**: Final (205 lines, all IMMUTABLE errors resolved)
