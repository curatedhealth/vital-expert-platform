# Clear Browser Cache - CRITICAL STEPS

## The Problem
Your browser is caching old JavaScript files and localStorage has mock auth enabled.

## Solution - Follow These Steps EXACTLY:

### Step 1: Open Browser Console
1. Press `Cmd + Option + J` (Mac) or `F12` (Windows)
2. Go to the **Console** tab

### Step 2: Clear LocalStorage Mock Auth
Paste this in the console and hit Enter:
```javascript
localStorage.removeItem('vital-use-mock-auth');
localStorage.removeItem('vital-mock-user');
localStorage.removeItem('vital-mock-session');
console.log('✅ Mock auth cleared');
```

### Step 3: Hard Refresh
- Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + F5` (Windows)
- This forces browser to load fresh JavaScript

### Step 4: Clear All Site Data (if still showing "dev")
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click "Clear site data" button
4. Reload the page

### Step 5: Verify
1. Open console again
2. Type: `localStorage.getItem('vital-use-mock-auth')`
3. Should return `null`

## After Clearing Cache

Your login should now show your actual email: **hicham.naim@xroadscatalyst.com**

If you still see "dev", you need to logout and login again with your real credentials.
