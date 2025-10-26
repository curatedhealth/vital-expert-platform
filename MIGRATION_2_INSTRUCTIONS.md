# Migration 2 - Add Tenant Columns to Agents

## ✅ Prerequisites

- [x] Migration 1 completed successfully
- [x] Tables created: tenants, user_tenants, user_roles
- [x] 254 agents exist in agents table

---

## 📋 What Migration 2 Does

**File:** `database/sql/migrations/2025/20251026000002_add_tenant_columns_to_resources.sql`

**Purpose:** Adds multi-tenant support to existing `agents` table

### Changes to Agents Table

Adds 5 new columns:

| Column | Type | Purpose |
|--------|------|---------|
| `tenant_id` | UUID | Which tenant owns this agent (FK to tenants) |
| `is_shared` | BOOLEAN | Is agent shared with other tenants? |
| `sharing_mode` | VARCHAR(50) | 'private', 'global', or 'selective' |
| `shared_with` | UUID[] | Array of tenant IDs (for selective sharing) |
| `resource_type` | VARCHAR(50) | 'platform', 'custom', 'shared', 'tenant_specific' |

### Also Creates

- `tools` table (multi-tenant)
- `prompts` table (multi-tenant)
- `workflows` table (multi-tenant)

---

## 🚀 How to Execute

### Step 1: Open SQL File

**File Location:**
```
database/sql/migrations/2025/20251026000002_add_tenant_columns_to_resources.sql
```

### Step 2: Copy to Supabase SQL Editor

1. Open the file in your code editor
2. Select **ALL contents** (entire file)
3. Copy to clipboard
4. Go to: [Supabase SQL Editor](https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/sql)
5. Click "New query"
6. Paste the migration
7. Click **RUN**

### Step 3: Expected Output

You should see:
```
Success. No rows returned
```

Or a notice message like:
```
✅ Migration 20251026000002 completed successfully
   Added tenant columns to: agents
   Created tables: tools, prompts, workflows
   Next step: Run 20251026000003_update_rls_policies.sql
```

### Step 4: Verify Columns Added

Run this query to verify:

```sql
-- Check new columns were added to agents table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'agents'
  AND column_name IN ('tenant_id', 'is_shared', 'sharing_mode', 'shared_with', 'resource_type')
ORDER BY column_name;
```

**Expected:** 5 rows returned

---

## ⚠️ Important Notes

### Migration 2 is Safe

- Uses `ALTER TABLE IF NOT EXISTS` patterns
- Non-destructive - no data deleted
- Adds columns with default values (NULL for tenant_id, false for is_shared)
- All 254 agents preserved

### Default Values

After Migration 2, all existing agents will have:
- `tenant_id` = NULL (not assigned yet)
- `is_shared` = false
- `sharing_mode` = 'private'
- `shared_with` = [] (empty array)
- `resource_type` = NULL

**These will be set in Migration 4** when we assign all agents to the platform tenant!

---

## 🔍 What Happens

### Before Migration 2

```sql
SELECT id, name, description FROM agents LIMIT 1;
```

Returns: 24 columns (id, name, description, model, etc.)

### After Migration 2

```sql
SELECT id, name, tenant_id, is_shared, sharing_mode FROM agents LIMIT 1;
```

Returns: 29 columns (original 24 + 5 new tenant columns)

---

## 📊 New Tables Created

### `tools` Table

Multi-tenant tools that agents can use:

```sql
CREATE TABLE tools (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255),
    is_shared BOOLEAN,
    sharing_mode VARCHAR(50),
    ...
);
```

### `prompts` Table

Reusable prompt templates:

```sql
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title VARCHAR(255),
    content TEXT,
    is_shared BOOLEAN,
    ...
);
```

### `workflows` Table

Multi-step agent workflows:

```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255),
    steps JSONB,
    is_shared BOOLEAN,
    ...
);
```

---

## ✅ Verification Checklist

After running Migration 2:

- [ ] No errors in SQL output
- [ ] 5 new columns in agents table
- [ ] 3 new tables created (tools, prompts, workflows)
- [ ] All 254 agents still exist
- [ ] Ready for Migration 3

---

## 🐛 Troubleshooting

### Error: "column already exists"

**Cause:** Migration 2 was already partially run

**Solution:** Migration uses `IF NOT EXISTS`, so it's safe to re-run the entire file

### Error: "relation 'tenants' does not exist"

**Cause:** Migration 1 didn't complete successfully

**Solution:** Go back and re-run Migration 1 first

### Error: "permission denied"

**Cause:** Not using Service Role key

**Solution:** Ensure you're in Supabase Dashboard with admin access

---

## 📝 After This Migration

**Status:**
- ✅ Tenant infrastructure exists (from Migration 1)
- ✅ Agents table has tenant columns (from Migration 2)
- ⏳ RLS policies NOT yet applied (Migration 3)
- ⏳ Agents NOT yet assigned (Migration 4)

**Next Step:** Migration 3 - Add RLS policies to enforce tenant isolation

---

**Ready to execute Migration 2!**

Copy the file contents to Supabase SQL Editor and click RUN.
