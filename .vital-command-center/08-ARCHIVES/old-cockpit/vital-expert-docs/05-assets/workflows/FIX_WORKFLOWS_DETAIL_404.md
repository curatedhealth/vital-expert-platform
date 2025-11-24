# 🔧 Fix: Workflows Detail Page 404 - Environment Variables Not Loaded

## 🔴 Root Cause

The dev server is running, but the **environment variables from `.env.local` are NOT loaded**. This causes the API routes to fail when trying to connect to Supabase.

### Evidence:
```bash
$ node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
# Output: undefined
```

The API route `/api/workflows/usecases/[code]/complete` uses `getServiceSupabaseClient()` which requires:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Since these are not loaded → API fails → Redirects to login → Frontend gets HTML instead of JSON → 404 error

## ✅ Solution: Restart Dev Server

### Step 1: Verify `.env.local` has credentials

You already have them (verified ✓):
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xazinxsiglqokwfmogyk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJh..."
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### Step 2: Stop the dev server

I've already killed it for you:
```bash
✅ Dev server stopped
```

### Step 3: Restart with environment variables

In your terminal, run:

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path"
pnpm --filter @vital/digital-health-startup dev
```

**IMPORTANT**: Make sure you're running this from the project root so that `.env.local` is loaded.

### Step 4: Verify it's working

After the server starts:

1. **Test the workflows list**:
   - Navigate to: http://localhost:3000/workflows
   - Should show 50 use cases ✅ (you saw this already)

2. **Test clicking a use case**:
   - Click on "DTx Clinical Endpoint Selection & Validation"
   - Should navigate to: `/workflows/UC_CD_001`
   - Should show: Use case details + workflows + tasks (NOT 404!)

3. **Test the API directly**:
   ```bash
   curl http://localhost:3000/api/workflows/usecases/UC_CD_001/complete | jq '.success'
   # Expected: true
   ```

## 🔍 Debugging If Still Having Issues

### Check environment variables are loaded:

In your browser console (F12), paste this:

```javascript
fetch('/api/workflows/usecases/UC_CD_001/complete')
  .then(r => r.text())
  .then(text => {
    console.log('Response:', text.substring(0, 200));
    // If you see "/login?redirect=..." → Env vars not loaded
    // If you see '{"success":true...' → Working!
  });
```

### If still getting redirect:

1. **Check `.env.local` is in the right place**:
   ```bash
   ls -la .env.local
   # Should be in: /Users/hichamnaim/Downloads/Cursor/VITAL path/.env.local
   ```

2. **Check the file is not ignored**:
   ```bash
   cat .gitignore | grep env
   # .env.local should NOT be committed, but should be loaded locally
   ```

3. **Manually check Next.js is loading env vars**:
   - Add a test API route or check server logs
   - Should see environment variables when server starts

## 📊 Expected Flow After Fix

```
1. User clicks use case card "DTx Clinical Endpoint Selection & Validation"
   ↓
2. Navigate to /workflows/UC_CD_001
   ↓
3. Page component calls /api/workflows/usecases/UC_CD_001/complete
   ↓
4. API creates Supabase client with SUPABASE_SERVICE_ROLE_KEY ← NOW WORKS!
   ↓
5. API queries database for use case + workflows + tasks
   ↓
6. API returns JSON response
   ↓
7. Frontend renders detailed view with:
   - Use case title & description
   - List of workflows
   - List of tasks per workflow
   - Agents, tools, and RAG sources
   - Deliverables & prerequisites
```

## 🚨 Current Flow (Before Fix)

```
1. User clicks use case card
   ↓
2. Navigate to /workflows/UC_CD_001
   ↓
3. Page component calls API
   ↓
4. API tries to create Supabase client
   ↓
5. Environment variables NOT found → Client creation fails
   ↓
6. API redirects to /login ← PROBLEM
   ↓
7. Frontend receives HTML redirect instead of JSON
   ↓
8. Error: 404 Page not found
```

## ✅ Quick Checklist

- [x] `.env.local` has Supabase credentials (verified)
- [x] Dev server stopped
- [ ] **YOU DO THIS**: Restart dev server with `pnpm --filter @vital/digital-health-startup dev`
- [ ] **YOU DO THIS**: Test clicking a use case card
- [ ] **YOU DO THIS**: Verify you see the detailed view (not 404)

## 💡 Why This Happened

When you start the dev server, Next.js loads environment variables from `.env.local`. If the server was already running when we added/modified the credentials, those changes weren't picked up. A restart is required to load the new values.

---

## 🎓 Summary

**Problem**: Environment variables not loaded → API fails → 404 error

**Solution**: Restart dev server to load `.env.local` credentials

**Expected Result**: Clicking any use case card will show the detailed view with workflows and tasks

Please restart your dev server and try again! 🚀

