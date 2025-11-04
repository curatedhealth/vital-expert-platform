# 🔴 Workflows 404 - Authentication Required!

## The Problem

You're seeing a **404 error** when trying to access `/workflows/UC_CD_001` because you're **NOT LOGGED IN**.

### What's Happening:

1. **You navigate to**: `http://localhost:3000/workflows/UC_CD_001`
2. **App layout checks**: Is user authenticated?
3. **Result**: NO → Redirects to `/login`
4. **Page component tries to fetch API**: `/api/workflows/usecases/UC_CD_001`
5. **API also checks auth**: User not authenticated → Redirects to `/login`
6. **Frontend receives redirect HTML** instead of JSON → **404 error**

### Evidence:

```bash
$ curl http://localhost:3000/api/workflows/usecases/UC_CD_001
# Response: /login?redirect=%2Fapi%2Fworkflows%2Fusecases%2FUC_CD_001
# ← This means the API is redirecting to login!
```

## ✅ Solution: Log In First!

### Step 1: Create a Test User in Supabase

Go to your Supabase dashboard:
1. Navigate to: https://supabase.com/dashboard/project/xazinxsiglqokwfmogyk/auth/users
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - **Email**: `test@vital.expert` (or any email)
   - **Password**: `Test123456!` (or any password)
4. Click **"Create user"**

### Step 2: Log In to Your App

1. Navigate to: http://localhost:3000/login
2. Enter the credentials you just created
3. Click **"Sign In"**

### Step 3: Navigate to Workflows

After logging in, you should be redirected to `/dashboard`.

Now try:
- http://localhost:3000/workflows → Should show all use cases
- Click any use case card → Should show detailed view

## Why This Is Required

The `(app)` route group enforces authentication:

```typescript
// apps/digital-health-startup/src/app/(app)/layout.tsx
export default async function AppLayout({ children }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');  // ← This is why you see 404
  }

  return <AppLayoutClient initialUser={user}>{children}</AppLayoutClient>;
}
```

**ALL pages under `/workflows`, `/dashboard`, `/ask-expert`, etc. require authentication.**

## 🔍 Debugging If Still Having Issues

### Check if you're logged in:

Open browser console (F12) and run:
```javascript
fetch('/api/workflows/usecases/UC_CD_001')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

**If logged in**: You'll see use case data  
**If not logged in**: You'll see a redirect or error

### Check authentication state:

```javascript
// In browser console
fetch('/api/ask-expert?userId=test')
  .then(r => r.json())
  .then(d => console.log('Auth works:', d))
  .catch(e => console.error('Not authenticated:', e));
```

### Clear cookies and try again:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Cookies** → `http://localhost:3000`
4. Delete all cookies
5. Refresh page
6. Log in again

## 🎯 Expected Flow

```
1. Navigate to /workflows
   ↓
2. App layout checks auth
   ↓
3. User IS authenticated → Load page
   ↓
4. Page fetches /api/workflows/usecases
   ↓
5. API checks auth → User IS authenticated → Return data
   ↓
6. Page displays 50 use cases
   ↓
7. Click UC_CD_001 card
   ↓
8. Navigate to /workflows/UC_CD_001
   ↓
9. Page fetches /api/workflows/usecases/UC_CD_001/complete
   ↓
10. API returns use case + workflows + tasks
   ↓
11. Page displays detailed view
```

## 🚨 Current Flow (Your Issue)

```
1. Navigate to /workflows/UC_CD_001
   ↓
2. App layout checks auth
   ↓
3. User NOT authenticated → Redirect to /login ← HERE'S THE PROBLEM
   ↓
4. Page still tries to fetch API (race condition)
   ↓
5. API also redirects to /login
   ↓
6. Frontend receives HTML redirect instead of JSON
   ↓
7. Error: 404 Page not found
```

## ✅ Quick Fix Checklist

- [ ] Create test user in Supabase
- [ ] Log in at http://localhost:3000/login
- [ ] Navigate to http://localhost:3000/dashboard (should work)
- [ ] Navigate to http://localhost:3000/workflows (should show 50 use cases)
- [ ] Click any use case card (should show detailed view)

## 💡 Alternative: Bypass Auth for Development

If you want to test without authentication (NOT RECOMMENDED for production):

1. Comment out the auth check in `apps/digital-health-startup/src/app/(app)/layout.tsx`:
```typescript
export default async function AppLayout({ children }: AppLayoutProps) {
  // const supabase = await createClient();
  // const { data: { user }, error } = await supabase.auth.getUser();

  // if (error || !user) {
  //   redirect('/login');
  // }

  // For development only - bypass auth
  const user = { id: 'dev-user', email: 'dev@test.com' };

  return <AppLayoutClient initialUser={user}>{children}</AppLayoutClient>;
}
```

**⚠️ WARNING**: This is ONLY for local development. NEVER deploy this to production!

---

## 🎓 Summary

**You're not logged in** → App redirects to login → API calls fail → 404 error

**Solution**: Log in first, then navigate to workflows.

The workflows page and API are working correctly - they're just protected by authentication (which is good for security!).

