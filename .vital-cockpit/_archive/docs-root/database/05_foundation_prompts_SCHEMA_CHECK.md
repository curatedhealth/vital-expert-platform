# URGENT: Schema Check Needed

The error indicates that the `prompts` table in your database doesn't have a `tenant_id` column.

## Please run this query in Supabase to check the actual schema:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'prompts'
ORDER BY ordinal_position;
```

## Then share the results so I can fix the seed file to match your actual schema.

## Likely Scenarios:

### **Scenario 1**: `prompts` table has NO `tenant_id` (older schema)
If the query shows NO `tenant_id` column, I'll need to use a different approach.

### **Scenario 2**: `prompts` table DOES have `tenant_id` but different name
Maybe it's `tenant` or `organization_id` instead.

### **Scenario 3**: Wrong table - should use `dh_prompt` instead
Maybe we should be using `dh_prompt` table (which definitely has `tenant_id`).

---

**Please paste the query results here so I can fix the seed file!** 🔍

