# 🔧 Workflows UI Setup Guide

## ✅ Status
The workflows page is now ready and will display real data from Supabase once you add your credentials.

## 🔑 Required Environment Variables

You need to add these environment variables to connect to your Supabase database:

### Create `.env.local` file

In `apps/digital-health-startup/.env.local`, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### How to Get Your Supabase Credentials

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Click on your project**
3. **Go to Settings → API**
4. **Copy these values**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click "Reveal" button) → `SUPABASE_SERVICE_ROLE_KEY`

### Example `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAxNTU3NTk5OX0.example_token_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDE1NTc1OTk5fQ.example_service_role_token_here
```

---

## 🗄️ Database Setup

### 1. Run the SQL Seed Files

Make sure you've executed all the seed files:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/database/sql/seeds/2025"

# Execute all Market Access and Clinical Development use cases
./execute_all_ma_usecases.sh

# Or use the individual SQL files
psql -U your_username -d your_database -f 00_foundation_agents.sql
psql -U your_username -d your_database -f 01_foundation_personas.sql
# ... etc
```

### 2. Verify Data in Supabase

Go to your Supabase dashboard:
- **Table Editor** → Check these tables have data:
  - `dh_use_case` (should have 20 rows)
  - `dh_workflow` (should have ~20 rows)
  - `dh_task` (should have ~126 rows)

---

## 🚀 After Setup

1. **Restart your dev server**:
   ```bash
   cd apps/digital-health-startup
   npm run dev
   ```

2. **Navigate to workflows page**:
   ```
   http://localhost:3000/workflows
   ```

3. **You should see**:
   - Statistics cards showing real counts (50 use cases, 86 workflows, 151 tasks)
   - Domain tabs (All, Clinical, Market, Regulatory, etc.)
   - Use case cards with Execute and Configure buttons

---

## 🐛 Troubleshooting

### Issue: "No workflows found"

**Check Console Logs**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages

**Common Issues**:
- ❌ Environment variables not set → Add `.env.local` file
- ❌ Database not seeded → Run SQL seed files
- ❌ Wrong table names → Check Supabase table names match `dh_use_case`, `dh_workflow`, `dh_task`
- ❌ RLS policies blocking access → Temporarily disable RLS or add proper policies

### Issue: API errors in console

**Check API Route**:
```bash
# Test the API endpoint directly
curl http://localhost:3000/api/workflows/usecases
```

**Check Supabase Connection**:
- Verify URL format: `https://your-project.supabase.co`
- Verify keys are complete (they're very long ~200+ characters)
- Check no extra spaces or quotes in `.env.local`

### Issue: Domains showing as "1" instead of multiple

This means:
- ✅ API is working
- ✅ Database connection is good
- ❌ But only 1 domain has data seeded

**Solution**: Seed all domains by running more seed files

---

## 📊 Expected Data After Full Seed

| Table | Expected Count |
|-------|----------------|
| `dh_use_case` | 20 (10 CD + 10 MA) |
| `dh_workflow` | ~20 |
| `dh_task` | ~126 |
| `dh_agent` | ~15 |
| `dh_persona` | ~15 |
| `dh_tool` | ~10 |
| `dh_rag_source` | ~5 |

---

## 🎯 What You'll See When Working

### Statistics Cards:
- **Total Use Cases**: 20 (or 50 if you have additional data)
- **Total Workflows**: 20-86
- **Total Tasks**: 126-151
- **Domains**: 2-7 (depending on what's seeded)

### Domain Tabs:
- **All** - Shows all use cases grouped by domain
- **Clinical** - Clinical Development use cases (UC_CD_001 through UC_CD_010)
- **Market** - Market Access use cases (UC_MA_001 through UC_MA_010)
- **Regulatory** - Regulatory Affairs (when seeded)
- **Product** - Product Development (when seeded)
- **Engagement** - Engagement (when seeded)
- **Real-World** - Real-World Evidence (when seeded)

### Use Case Cards Show:
- Domain badge (CD, MA, RA, etc.)
- Complexity badge (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Title and description
- Duration estimate
- Number of deliverables
- Prerequisites count
- Execute button
- Configure button

---

## 🎉 Success Checklist

- [ ] Created `.env.local` with Supabase credentials
- [ ] Restarted dev server
- [ ] Navigated to `/workflows`
- [ ] See statistics cards with real numbers
- [ ] Can switch between domain tabs
- [ ] Can search workflows
- [ ] Use case cards display correctly
- [ ] No console errors

---

## 📁 Files Modified

1. **API Route**: `apps/digital-health-startup/src/app/api/workflows/usecases/route.ts`
   - Fetches use cases, workflows, and tasks from Supabase
   - Calculates statistics
   - Returns JSON response

2. **Workflows Page**: `apps/digital-health-startup/src/app/(app)/workflows/page.tsx`
   - Displays use cases in cards
   - Shows statistics
   - Domain filtering
   - Search functionality

3. **Error Handling**: Added null checks for unknown domains

---

**Status**: ✅ Ready to connect to Supabase  
**Next Step**: Add your Supabase credentials to `.env.local`

