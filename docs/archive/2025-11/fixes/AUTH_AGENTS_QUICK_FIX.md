# Quick Fix - Authentication & Agents Issue

## Problem
1. "No agents yet" - Agents list is empty
2. "CN User" showing instead of actual username  
3. Error when trying to add agents: "User not authenticated"

## Root Cause
The authentication context is showing:
```
hasUser: false
loading: true
```

This means the user session hasn't fully loaded yet.

## Quick Fix Steps

### Step 1: Refresh the Page
Sometimes the auth context needs a full page reload after server restart.

```bash
# In browser:
1. Go to http://localhost:3000/ask-expert
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Wait 3-5 seconds for auth to load
```

### Step 2: Check Browser Console
Open browser console (F12) and look for:
```
✅ Good: "🔄 [AskExpertContext] User changed, refreshing agents: { userId: 'xxx-xxx-xxx' }"
❌ Bad: "🔄 [AskExpertContext] No user ID, clearing agents"
```

### Step 3: Re-add Agents
If auth loads but no agents:

1. Click "Browse Agent Store" button in sidebar
2. Find "Accelerated Approval Strategist"
3. Click the "+ Add to Chat" button
4. It should now work!

## If Authentication Still Fails

### Option A: Check Supabase Session
```javascript
// Paste in browser console:
const cookies = document.cookie;
console.log('Has auth cookies:', cookies.includes('sb-'));
```

If no `sb-` cookies, you need to log in again.

### Option B: Force Re-login
1. Click your user avatar in sidebar
2. Click "Log out"
3. Log in again
4. Go back to Ask Expert page

### Option C: Check Auth Context Loading
```javascript
// Paste in browser console:
console.log('[Auth Debug] Check auth state');
```

Look for the output in console logs.

## Expected Behavior After Fix

1. ✅ Username shows in sidebar (not "CN User")
2. ✅ "My Agents" section populates with your agents
3. ✅ Can add/remove agents from Agent Store
4. ✅ Can send messages to agents

## Debug Commands

### Check if user is authenticated:
```bash
# In browser console:
localStorage.getItem('supabase.auth.token')
```

### Check API response:
```bash
# In terminal:
curl -X GET "http://localhost:3000/api/user-agents?userId=YOUR_USER_ID"
```

### Check server logs:
```bash
tail -f /tmp/digital-health-dev.log | grep -i auth
```

## Manual Agent Re-add (If Needed)

If the UI doesn't work, you can manually add agents via API:

```bash
# Replace with your actual IDs
USER_ID="your-user-id-here"
AGENT_ID="agent-id-here"

curl -X POST http://localhost:3000/api/user-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "agentId": "'$AGENT_ID'",
    "isUserCopy": false
  }'
```

## Why This Happened

When we restarted the Next.js server:
1. Browser kept old session
2. Server lost in-memory state
3. Auth context needs to re-initialize
4. Agents list was cleared because no user ID was available initially

## Prevention

In the future, after server restart:
1. Always hard refresh (Cmd+Shift+R)
2. Wait for auth to load (3-5 seconds)
3. Check that your username shows in sidebar
4. Then proceed with testing

---

**Try hard refresh first, then let me know if you see your username and agents!**

