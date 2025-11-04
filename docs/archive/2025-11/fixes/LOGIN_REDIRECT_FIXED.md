# Login Redirect Issue - FIXED

## Issues Identified

### Issue 1: Login Redirects to /ask-expert Instead of /dashboard ✅ FIXED

**Problem**: After successful login, users were being redirected to `/ask-expert` instead of the main `/dashboard`.

**Root Cause**: Default redirect was hardcoded to `/ask-expert` in two places:

1. **Login Page** (`src/app/(auth)/login/page.tsx` line 17):
   ```typescript
   const [redirectTo, setRedirectTo] = useState('/ask-expert'); // OLD
   ```

2. **Login Actions** (`src/app/(auth)/login/actions.ts` line 18):
   ```typescript
   const redirectTo = formData.get('redirectTo') as string || '/ask-expert'; // OLD
   ```

**Fix Applied**:

1. **Login Page** (line 17):
   ```typescript
   const [redirectTo, setRedirectTo] = useState('/dashboard'); // NEW
   ```

2. **Login Actions** (line 18):
   ```typescript
   const redirectTo = formData.get('redirectTo') as string || '/dashboard'; // NEW
   ```

**Result**: Users will now be redirected to `/dashboard` by default after login.

---

### Issue 2: User Displays as "dev" Instead of Actual Email ⚠️ INVESTIGATION NEEDED

**Problem**: User dropdown shows "dev" (from dev@vitalexpert.com) instead of your actual email (hicham.naim@xroadscatalyst.com).

**What We Found**:

In `src/app/(app)/layout.tsx` (lines 105-109), there's a development fallback:

```typescript
const displayUser = user || (process.env.NODE_ENV === 'development' ? {
  id: 'dev-user',
  email: 'dev@vitalexpert.com',  // Fallback in dev mode
  user_metadata: { name: 'Development User' }
} : null);
```

**Possible Causes**:

1. **Auth Context Not Loading**: The `useAuth()` hook might not be properly loading your user session
2. **Cookie Issue**: Supabase auth cookies might not be persisting correctly
3. **Environment Mode**: App is in development mode, so it's using the fallback

**How to Verify**:

Open browser DevTools Console and check:

```javascript
// Check if user is loaded
console.log('User:', user);
console.log('Loading:', loading);

// Check Supabase session
const supabase = createClient();
supabase.auth.getSession().then(({ data }) => {
  console.log('Session:', data.session);
  console.log('User email:', data.session?.user?.email);
});
```

**Expected**:
- `user` should be an object with your email
- `loading` should be `false`
- Session should show `hicham.naim@xroadscatalyst.com`

**If Session is Correct**:
The issue is in the `useAuth()` hook not properly loading the user. Check `src/lib/auth/supabase-auth-context.tsx`.

**If Session Shows dev@vitalexpert.com**:
The login action is signing in with the wrong user. This could be a database issue or the login credentials are pointing to the dev user.

---

## Testing Instructions

### Test Login Redirect

1. **Logout** (click your profile → Log Out)
2. **Go to login**: http://localhost:3001/login
3. **Enter credentials**:
   - Email: hicham.naim@xroadscatalyst.com
   - Password: [your password]
4. **Click Sign In**
5. **Expected**: You should be redirected to `/dashboard` (NOT `/ask-expert`)

### Test User Display

1. **After login**, check the user dropdown in top-right corner
2. **Expected**: Should show "hicham.naim" (first part of your email)
3. **If shows "dev"**: User session is not loading correctly

### Debug User Session

Open browser DevTools Console and run:

```javascript
// Get current Supabase session
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

const { data: { session }, error } = await supabase.auth.getSession();
console.log('Current session:', session);
console.log('User email:', session?.user?.email);
console.log('User ID:', session?.user?.id);
```

---

## Files Modified

1. ✅ `src/app/(auth)/login/page.tsx` - Line 17: Changed default redirect from `/ask-expert` to `/dashboard`
2. ✅ `src/app/(auth)/login/actions.ts` - Line 18: Changed default redirect from `/ask-expert` to `/dashboard`

---

## Next Steps

### Priority 1: Test Login Redirect
- Logout and login again
- Verify you're redirected to `/dashboard`
- **Status**: Should work immediately (changes applied)

### Priority 2: Investigate User Display
- Open DevTools Console
- Check if `user` object is loaded correctly
- Verify Supabase session has your actual email
- **If not working**: Need to investigate `useAuth()` hook

### Priority 3: Test Mode 1 (Original Task)
- Once login is working correctly
- Go to `/ask-expert`
- Select an agent
- Send a message
- Verify Mode 1 response streams correctly

---

## Summary

✅ **FIXED**: Login redirect now goes to `/dashboard` instead of `/ask-expert`

⚠️ **INVESTIGATING**: User display shows "dev" instead of your actual email
- This requires checking if the Supabase session is correctly loading
- The layout has a fallback that shows "dev" in development mode
- Need to verify if you're actually logged in as hicham.naim or as the dev user

---

**Next Action**: Please logout, login again, and let me know:
1. Are you redirected to `/dashboard`? ✅
2. Does the user dropdown still show "dev"? (If yes, we need to investigate the auth context)
3. Can you open DevTools Console and share what `session?.user?.email` shows?
