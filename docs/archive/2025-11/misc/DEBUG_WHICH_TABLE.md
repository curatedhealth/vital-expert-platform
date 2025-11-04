# 🔍 DEBUGGING: Which Tables Exist?

There are **TWO DIFFERENT** agent assignment table definitions in the migrations:

## Option 1: OLD TABLE (from `20251101123000`)
```sql
CREATE TABLE dh_task_agent_assignment (
  ...
  UNIQUE (task_id, agent_id, role_type)  -- No tenant_id!
);
```

## Option 2: NEW TABLE (from `20251102`)
```sql
CREATE TABLE dh_task_agent (
  ...
  UNIQUE(tenant_id, task_id, agent_id, assignment_type)  -- Has tenant_id!
);
```

## 🚨 THE PROBLEM

Your seed files are written for the **NEW TABLE** (`dh_task_agent`), but your database might have the **OLD TABLE** (`dh_task_agent_assignment`) or BOTH tables exist causing conflicts.

## ✅ SOLUTION

Run this query to check which tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%task_agent%'
ORDER BY table_name;
```

Expected result: Should show `dh_task_agent` (not `dh_task_agent_assignment`)

If you see `dh_task_agent_assignment`, then the newer migration `20251102_create_persona_agent_separation.sql` hasn't been run yet!

