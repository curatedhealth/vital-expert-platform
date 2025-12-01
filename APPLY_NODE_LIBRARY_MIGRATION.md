# Apply Node Library Migration

The Node Library is empty because we need to apply migration `026` to seed it with custom nodes.

## Quick Apply

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy the contents of database/migrations/026_seed_legacy_node_library.sql
-- and paste into Supabase SQL Editor, then click "Run"
```

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Apply the migration
supabase db push

# Or apply specific migration
psql $DATABASE_URL -f database/migrations/026_seed_legacy_node_library.sql
```

## What This Migration Does

✅ Seeds **16 built-in custom nodes** to your `node_library` table:
- 5 Research nodes (PubMed, Clinical Trials, FDA, Web Search, arXiv)
- 5 Data nodes (RAG Query, RAG Archive, Cache, Data Extraction, Text Analysis)
- 6 Control Flow nodes (If/Else, Switch, While Loop, For Each, Parallel, Merge)

These will appear in the **Node Library** section of your designer sidebar!

## After Applying

1. Refresh `http://localhost:3000/designer`
2. Expand the **"Node Library"** section in the sidebar
3. You should see 16 custom nodes ready to drag and drop!

---

**Note**: The current migration (`026_seed_legacy_node_library.sql`) contains a sample set. To generate the FULL migration with all 148 nodes, we need to fix the generator script's import issues first.









