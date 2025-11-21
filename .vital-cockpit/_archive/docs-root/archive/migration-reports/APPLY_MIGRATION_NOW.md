# 🚀 Apply Migration NOW - Quick Guide

## ✅ SQL Already Copied to Your Clipboard!

The migration SQL has been copied to your clipboard. Just follow these steps:

---

## 📋 Steps (2 minutes):

### 1. Open Supabase Dashboard
Click this link: **https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk**

### 2. Navigate to SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** button

### 3. Paste and Run
- **Paste** the SQL (Cmd+V) - it's already in your clipboard!
- Click **"Run"** button (or press Cmd+Enter)
- Wait ~5-10 seconds for completion

### 4. Verify Success
You should see messages like:
```
NOTICE: Migrated X prompts from dh_prompt to prompts
NOTICE: Migrated X suites from dh_prompt_suite to prompt_suites
```

### 5. Refresh Your Browser
Go to: **http://localhost:3000/prism**

You should now see:
- ✅ **Total Prompts**: ~3,922
- ✅ **Prompt Suites**: 10
- ✅ **Sub-Suites**: Various counts per suite

---

## 🔍 What the Migration Does:

1. **Creates `prompts` table** - Unified storage for all prompts
2. **Creates `prompt_suites` table** - 10 PRISM suites
3. **Migrates data** from `dh_prompt` → `prompts`
4. **Seeds PRISM suites**:
   - RULES™ (Regulatory Excellence)
   - TRIALS™ (Clinical Development)
   - GUARD™ (Safety Framework)
   - VALUE™ (Market Access)
   - BRIDGE™ (Stakeholder Engagement)
   - PROOF™ (Evidence Analytics)
   - CRAFT™ (Medical Writing)
   - SCOUT™ (Competitive Intelligence)
   - PROJECT™ (Project Management)
   - FORGE™ (Digital Health Development)
5. **Sets up RLS policies** for multi-tenancy
6. **Creates helper functions** for statistics

---

## 🐛 Troubleshooting

### If you see errors about existing tables:
The migration is **idempotent** - it checks if tables exist before creating them. This is safe.

### If you see "relation already exists":
This is normal. The migration will skip creating the table and just proceed.

### If migration takes a long time:
Large data migrations can take 10-30 seconds. Be patient!

### If you see 0 prompts after migration:
1. Check browser console for API errors (F12 → Console tab)
2. Verify migration completed successfully in SQL editor
3. Check database state:
   ```sql
   SELECT COUNT(*) FROM prompts;
   SELECT COUNT(*) FROM prompt_suites;
   ```

---

## 📊 Expected Data After Migration

| Table | Expected Count | Description |
|-------|---------------|-------------|
| `prompt_suites` | 10 | PRISM framework suites |
| `prompts` | ~3,922 | All prompts (merged from dh_prompt + legacy) |
| Unique suites | 10 | RULES™, TRIALS™, GUARD™, etc. |
| Unique subsuites | 50-100 | Depends on data |

---

## ✅ Success Indicators

After migration, the `/prism` page should show:

1. **Hero Section** displays correct totals
2. **10 suite cards** with names and colors
3. **Each suite card** shows prompt counts
4. **Clicking a suite** shows subsuite cards
5. **"View All Prompts"** shows individual prompts
6. **Sidebar filters** work correctly

---

## 🆘 Need the SQL Again?

Run this to copy SQL to clipboard again:
```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
cat supabase/migrations/20251110120000_unified_prompts_schema.sql | pbcopy
```

Or view the file directly:
```bash
cat supabase/migrations/20251110120000_unified_prompts_schema.sql
```

---

## 🎯 Next Steps After Migration

1. ✅ Verify `/prism` page shows data
2. ✅ Test clicking through suites and subsuites
3. ✅ Test search and filters
4. ✅ Test all three view modes (Board, List, Table)
5. ✅ Test copying prompts to clipboard

---

**Status**: ✅ Ready to apply
**Time**: ~2 minutes
**Risk**: Low (migration is idempotent and safe)
