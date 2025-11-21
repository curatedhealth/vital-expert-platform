# 🔧 Database Setup Instructions

## Problem: `board_session` table doesn't exist

The board tables haven't been created in your Supabase database yet.

---

## ✅ Solution: Run Complete Setup Script

I've created a **complete setup script** that will:

1. ✅ Create all board tables (if they don't exist)
2. ✅ Add all indexes for performance
3. ✅ Enable Row-Level Security (RLS)
4. ✅ Create multi-tenant isolation policies
5. ✅ Add helper functions
6. ✅ Verify everything is working

---

## 📝 How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your VITAL project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Run the Script**
   ```bash
   # Copy the contents of this file:
   scripts/database/ask-panel/00_complete_setup.sql
   
   # Paste into SQL Editor
   # Click "Run" or press Cmd+Enter
   ```

4. **Verify Success**
   - You should see: "✅ Ask Panel setup complete!"
   - Check that 5 tables were created
   - Check that policies were created

### Option 2: Command Line (If you have direct DB access)

```bash
# Navigate to your project
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"

# Run the script (if you have psql access)
psql $DATABASE_URL -f scripts/database/ask-panel/00_complete_setup.sql
```

---

## 🔍 What Gets Created

### Tables
- ✅ `board_session` - Panel sessions
- ✅ `board_reply` - Expert responses
- ✅ `board_synthesis` - Consensus results
- ✅ `board_panel_member` - Panel membership
- ✅ `evidence_pack` - RAG knowledge packs

### Indexes (12 total)
- Performance indexes on all key fields
- Composite indexes for common queries
- Organization lookup indexes

### RLS Policies (14 total)
- Multi-tenant data isolation
- Organization-level access control
- Owner-based permissions
- Service role bypass for backend

### Helper Functions (2)
- `has_panel_access(panel_id, user_id)` - Check access
- `is_panel_owner(panel_id, user_id)` - Check ownership

---

## ✅ Verification

After running the script, you should see output like:

```
✅ All board tables exist
✅ RLS enabled on board_session
✅ RLS enabled on board_reply
✅ RLS enabled on board_synthesis
✅ RLS enabled on board_panel_member
✅ RLS enabled on evidence_pack

┌──────────────────────────────────┬────────────────┬─────────────────┬─────────────────┐
│ status                           │ tables_created │ policies_created│ indexes_created │
├──────────────────────────────────┼────────────────┼─────────────────┼─────────────────┤
│ ✅ Ask Panel setup complete!     │ 5              │ 14              │ 12              │
└──────────────────────────────────┴────────────────┴─────────────────┴─────────────────┘
```

---

## 🔄 If Script Fails

### Common Issues

**Issue 1: Tables already exist**
```sql
-- Script handles this with: CREATE TABLE IF NOT EXISTS
-- Safe to rerun
```

**Issue 2: Policies already exist**
```sql
-- Script drops old policies first
-- Safe to rerun
```

**Issue 3: Extension not found**
```sql
-- If you need UUID support:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Issue 4: Permission denied**
```sql
-- Make sure you're using a role with CREATE TABLE permissions
-- Or use the Supabase service role
```

---

## 🎯 Next Steps After Database Setup

1. **Verify Tables Created**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT tablename 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename LIKE 'board_%' OR tablename = 'evidence_pack';
   ```

2. **Add Environment Variables**
   - See: `docs/Ask Panel/ENV_VARIABLES.md`
   - Add to your `.env.local`

3. **Test PanelOrchestrator**
   ```python
   # Test the import
   from services.panel_orchestrator import PanelOrchestrator
   ```

4. **Continue to Phase 1**
   - Create LangGraph workflow
   - Add API endpoints
   - Integrate with frontend

---

## 📊 Alternative: Use Existing Migration

If you prefer to use your existing migration file:

```bash
# 1. Copy the existing migration
cp supabase/migrations/20251003_create_advisory_board_tables.sql \
   supabase/migrations/20251101000000_ask_panel_complete_setup.sql

# 2. Add the created_by field to evidence_pack table
# Edit the file and add:
created_by UUID,

# 3. Apply via Supabase CLI (if you have it)
supabase db push

# 4. Then run the RLS policies script separately
# Run: scripts/database/ask-panel/00_complete_setup.sql
# (It will skip table creation and just add policies)
```

---

## 🆘 Need Help?

If you encounter errors:

1. **Check Supabase logs** in the dashboard
2. **Verify your database permissions**
3. **Try running the script in smaller chunks**
4. **Check if tables already exist** (might just need RLS policies)

---

**File**: `scripts/database/ask-panel/00_complete_setup.sql`  
**Status**: Ready to run  
**Safe to rerun**: Yes (idempotent)

