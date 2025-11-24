# Agents Not Loading - Debug Guide

## Current Status

✅ User logged in correctly (showing "hicham.naim" in top-right)
❌ Agents sidebar shows "No agents found"
✅ /ask-expert page loaded successfully
✅ "Agents" tab is active in sidebar

## Diagnostic Steps

### Step 1: Check Browser Console

Open Browser DevTools Console (F12 or Right-click → Inspect → Console tab) and look for:

**Expected Logs (if working)**:
```
🔍 AgentService: Fetching all agents from /api/agents-crud...
🔄 AgentService: Fetch attempt 1/3 for /api/agents-crud?showAll=true
✅ AgentService: Fetch succeeded on attempt 1
✅ AgentService: Received 254 agents from API
📊 Sample agent: ... | Tier: ... | Status: ...
```

**Error Logs (if failing)**:
```
❌ AgentService: API error after retries
- Status: [status code]
- Error data: [error details]
```

**No Logs**:
If you see NO logs starting with "AgentService", this means the useEffect isn't running at all, possibly due to:
- JavaScript error earlier in the code
- React component not mounting
- AgentService import issue

###

 Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Reload the page (Cmd/Ctrl + R)
3. Look for request to: `/api/agents-crud?showAll=true`

**If Request Exists**:
- Check Status Code (should be 200)
- Check Response (should contain agents array)
- If 401/403: Authentication issue
- If 500: Server error

**If No Request**:
- The fetch isn't happening at all
- Check Console for JavaScript errors

### Step 3: Manual Test

In the Console tab, run this command:

```javascript
// Test the agents API directly
fetch('/api/agents-crud?showAll=true')
  .then(r => r.json())
  .then(d => {
    console.log('✅ API Response:', d);
    console.log('📊 Agent count:', d.agents?.length);
  })
  .catch(e => console.error('❌ API Error:', e));
```

**Expected Output**:
```
✅ API Response: { agents: Array(254), success: true }
📊 Agent count: 254
```

**If Error**:
```
❌ API Error: [error details]
```

### Step 4: Check React Component State

In Console, run:

```javascript
// This checks if the agents state is set
// Note: This might not work if React DevTools aren't available
console.log('Checking React state...');
```

## Possible Issues & Solutions

### Issue 1: API Requires Authentication (LIKELY)

**Symptom**: curl to API returns login redirect
**Cause**: API endpoint requires session cookies
**Solution**: Browser should automatically send cookies, but check Network tab "Cookies" section

**Quick Fix**: None needed if browser is logged in - cookies should work

### Issue 2: JavaScript Error Breaking Component

**Symptom**: No AgentService logs in console at all
**Cause**: Error earlier in component lifecycle
**Solution**: Look for red errors in Console

### Issue 3: CORS or Cookie Issue

**Symptom**: Network request shows but fails
**Cause**: Browser not sending credentials
**Solution**: Check if fetch includes `credentials: 'include'`

The AgentService fetch (line 48-53) doesn't specify credentials, which could be the issue if the page and API are on different origins.

### Issue 4: Agents Tab Not Active

**Symptom**: UI shows Agents tab selected but state is different
**Cause**: UI state mismatch
**Solution**: Click "Chats" tab then click "Agents" tab again

### Issue 5: Tier Filter Hiding All Agents

**Symptom**: API returns agents but UI shows "No agents found"
**Cause**: All agents filtered out by tier
**Solution**: Click "All" tier filter button

## Quick Tests to Run

### Test 1: Check if Page JavaScript is Running
```javascript
console.log('✅ Console is working');
```

### Test 2: Check if AgentService Exists
```javascript
// This will fail, but that's okay - just checking if module loading works
console.log('Testing module imports...');
```

### Test 3: Check API Directly
```javascript
fetch('/api/agents-crud?showAll=true', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(d => console.log('Data:', d))
.catch(e => console.error('Error:', e));
```

### Test 4: Check Auth State
```javascript
// Check if user session exists
fetch('/api/health')
  .then(r => r.text())
  .then(t => console.log('Auth check:', t))
  .catch(e => console.error('Auth error:', e));
```

## Expected Behavior

When the page loads:
1. React useEffect runs on line 165-183 of ask-expert/page.tsx
2. AgentService.getActiveAgents(true) is called
3. Fetch to `/api/agents-crud?showAll=true` happens
4. Server responds with 254 agents
5. Agents are mapped and set in state
6. EnhancedSidebar renders agents list

## Current Theory

Based on the evidence:
- ✅ User is logged in (authentication works)
- ✅ Page loads (/ask-expert works)
- ❌ Agents don't load (API call might not be happening)

**Most Likely**: The fetch is happening but failing silently, OR there's a JavaScript error preventing the useEffect from running.

## Next Step

**Please open Browser DevTools Console and share:**
1. Any red errors you see
2. Any logs mentioning "AgentService"
3. The output of running the Manual Test (Step 3) in the console

This will help me pinpoint the exact issue!

---

**Server Status**: ✅ Running on http://localhost:3001
**User Status**: ✅ Logged in as hicham.naim
**Page Status**: ✅ /ask-expert loaded
**Agents Status**: ❌ Not loading (investigating)
