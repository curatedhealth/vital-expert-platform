# Force Logout and Fresh Login

## The Problem
You're stuck logged in as "dev" and the logout button isn't working. This is because:
1. The auth context changes haven't taken effect yet
2. There's cached state in localStorage
3. The page needs a hard refresh

## Solution: Manual Logout via Browser Console

### Step 1: Open Browser Console
Press **F12** or right-click → Inspect → Console tab

### Step 2: Run This Script
Copy and paste this into the console and press Enter:

```javascript
// Clear all Supabase auth state
localStorage.removeItem('supabase.auth.token');
localStorage.removeItem('sb-xazinxsiglqokwfmogyk-auth-token');
localStorage.removeItem('vital-mock-user');
localStorage.removeItem('vital-mock-session');

// Clear all localStorage keys with 'supabase' or 'auth'
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  }
});

// Also clear sessionStorage
sessionStorage.clear();

// Reload the page
console.log('✅ All auth state cleared. Reloading page...');
setTimeout(() => {
  window.location.href = '/login';
}, 1000);
```

### Step 3: Wait for Redirect
- You should be redirected to `/login` page
- If not, manually go to: http://localhost:3001/login

### Step 4: Login Again
- Email: hicham.naim@xroadscatalyst.com
- Password: [your password]
- Click "Sign In"

### Step 5: Verify
After login, you should see:
- ✅ "hicham.naim" in top-right (NOT "dev")
- ✅ Console shows: `✅ Using fallback profile from auth session: hicham.naim@xroadscatalyst.com`
- ✅ No red errors about profiles

---

## Alternative: Hard Browser Refresh

If the console script doesn't work, try this:

### Option A: Hard Refresh
1. Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows/Linux)
2. This clears cache and reloads

### Option B: Clear Site Data
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Storage** → **Clear site data**
4. Refresh page

### Option C: Incognito Mode
1. Open a new Incognito/Private window
2. Go to http://localhost:3001/login
3. Login fresh

---

## If Still Showing "dev"

If you still see "dev" after logging in fresh, it means the auth context is using the development fallback. Check console for this message:

```
⚠️ Supabase not configured, checking for mock user in localStorage
```

If you see that, it means Supabase environment variables might not be loaded correctly. The auth context will use "dev" as a fallback when Supabase isn't configured.

### Check Environment Variables
Run this in console:
```javascript
console.log('Supabase URL:', process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND');
```

If it shows "NOT FOUND" or a placeholder URL, the environment isn't configured properly.

---

## Current Issue: Mock Auth Mode

Looking at the auth context code, I see it checks:
```typescript
const useMockAuth = !supabaseUrl ||
                   supabaseUrl === 'undefined' ||
                   supabaseUrl.includes('xazinxsiglqokwfmogyk') ||
                   localStorage.getItem('vital-use-mock-auth') === 'true';
```

If ANY of these conditions are true, it uses "dev@vitalexpert.com" as a mock user.

The URL `xazinxsiglqokwfmogyk` appears to be a placeholder/old Supabase URL that triggers mock mode.

---

## Immediate Fix: Disable Mock Auth Check

Let me update the auth context to NOT use mock auth even with the placeholder URL, since you have a real Supabase instance.
