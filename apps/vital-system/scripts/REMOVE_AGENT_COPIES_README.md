# Remove Agent Copies

This directory contains scripts to remove all agent copies from the database.

## Quick Fix: Clean Display Names (Already Applied)

The frontend code has been updated to automatically remove "(My Copy)" and "(Copy)" suffixes from display names when showing agents. This means you'll see clean names in the UI immediately after refreshing.

## Option 1: SQL Script (Recommended)

If you have direct database access, this is the fastest way:

```bash
# Connect to your Supabase database and run:
psql <your-connection-string> -f apps/digital-health-startup/scripts/remove-agent-copies.sql
```

Or run it through Supabase Dashboard:
1. Go to SQL Editor
2. Copy and paste contents of `remove-agent-copies.sql`
3. Run the query

## Option 2: TypeScript Script

Run via Node.js:

```bash
cd apps/digital-health-startup
npx tsx scripts/remove-agent-copies.ts
```

Or use the shell script wrapper:

```bash
./scripts/remove-agent-copies.sh
```

**Requirements:**
- `.env.local` file with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## What Gets Deleted

The scripts will remove:

1. **All agents with `is_user_copy = true`**
2. **All agents with "(My Copy)" in display_name** (from metadata)
3. **All agents with "(Copy)" in display_name** (from metadata)
4. **Related entries in `user_agents` table** (to maintain referential integrity)

## Before Running

**⚠️ WARNING:** This operation is **irreversible**. Make sure you:

1. Back up your database first
2. Verify which agents will be deleted:
   ```sql
   SELECT id, name, metadata->>'display_name' as display_name, is_user_copy
   FROM agents
   WHERE is_user_copy = true 
      OR (metadata->>'display_name')::text ILIKE '%My Copy%'
      OR (metadata->>'display_name')::text ILIKE '%(Copy)%';
   ```

## After Running

1. Refresh your browser on the Ask Expert page
2. Agent copies should be gone
3. Display names will no longer show "(My Copy)" or "(Copy)" suffixes (frontend handles this automatically)

## Troubleshooting

### Script fails with permission error
- Make sure you're using the service role key (not anon key)
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Script runs but agents still appear
- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check if agents are being created from a different source

### Foreign key constraint errors
- The script handles `user_agents` deletion first
- If you still get FK errors, manually delete from `user_agents` first:
  ```sql
  DELETE FROM user_agents 
  WHERE agent_id IN (SELECT id FROM agents WHERE is_user_copy = true);
  ```
