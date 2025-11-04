# Agent Addition Debugging Guide

## Current Error

You're seeing `❌ Failed to add agent to chat: {}` which means the API is returning an error, but the error response is empty or malformed.

## Improved Error Handling (Just Added)

I've enhanced the error handling to capture more details. The new code will:

1. **Log the raw response text** - so you can see exactly what the API is returning
2. **Show the HTTP status code** - to understand what type of error occurred
3. **Handle different error formats** - whether JSON or plain text
4. **Validate originalAgentId** - only include it if it's a valid UUID

## What to Check Next

When you try to add an agent again, check the console for these new log messages:

### 1. Request Payload Log
```
📤 [Add to Chat] Sending request: {
  url: '/api/user-agents',
  method: 'POST',
  payload: {
    userId: "...",
    agentId: "...",
    isUserCopy: false
  }
}
```

**Check**: 
- Is `userId` a valid UUID?
- Is `agentId` a valid UUID?
- Are all fields present?

### 2. Response Log (if error occurs)
```
📄 [Add to Chat] Raw response: <actual response text>
```

**This is key** - this will show you exactly what the API is returning.

### 3. Error Details Log
```
❌ Failed to add agent to chat: {
  status: 400,
  statusText: "Bad Request",
  errorData: {...},
  errorText: "..."
}
```

**Check**:
- What is the status code?
- What does errorText say?
- What validation errors are in errorData?

## Common Error Scenarios

### 400 Bad Request - Validation Failed

**Possible Causes**:
1. **Invalid UUID format** for userId or agentId
2. **Missing required fields** in the request
3. **originalAgentId is null but required to be UUID or omitted**

**Fix**: Check the validation schema in `user-agents-schema.ts`

### 409 Conflict - Already Added

**Cause**: Agent is already in user's chat list

**Fix**: This is handled - user sees "already in your chat list" message

### 503 Service Unavailable

**Cause**: `user_agents` table doesn't exist in database

**Fix**: Run database migrations

### 401 Unauthorized

**Cause**: User is not authenticated

**Fix**: Log in first

## Validation Schema Reference

From `user-agents-schema.ts`:

```typescript
export const UserAgentCreateSchema = z.object({
  userId: z.string().uuid('Invalid UUID format'),
  agentId: z.string().uuid('Invalid UUID format'),
  originalAgentId: z.string().uuid('Invalid UUID format').optional(),
  isUserCopy: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});
```

**Key Points**:
- `userId` and `agentId` are **required** and must be valid UUIDs
- `originalAgentId` is **optional** but if provided, must be a valid UUID
- `isUserCopy` defaults to false

## Testing Steps

### Test 1: Add a Valid Agent
1. Open browser console
2. Navigate to `/agents`
3. Click "Add to Chat" on any agent
4. Check console logs for:
   - Request payload (should have valid UUIDs)
   - Raw response (if error)
   - Error details (if any)

### Test 2: Check User Authentication
1. Open browser console
2. Run: `console.log(document.cookie)`
3. Look for authentication cookie
4. If not logged in, go to `/login`

### Test 3: Verify Agent ID Format
1. Open browser console
2. Navigate to `/agents`
3. Run this in console:
```javascript
// Get all agents on the page
const agents = window.__NEXT_DATA__?.props?.pageProps?.agents || [];
console.log('Agents:', agents.map(a => ({
  id: a.id,
  name: a.display_name,
  isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.id)
})));
```

### Test 4: Check API Directly
Using curl or Postman, test the API endpoint:

```bash
curl -X POST http://localhost:3000/api/user-agents \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "agentId": "AGENT_ID",
    "isUserCopy": false
  }'
```

Replace `YOUR_USER_ID` and `AGENT_ID` with actual UUIDs.

**Expected Success Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "user_id": "...",
    "agent_id": "...",
    "created_at": "..."
  },
  "message": "Agent added to user list successfully"
}
```

**Expected Error Response (400)**:
```json
{
  "error": "Validation failed",
  "errors": {
    "userId": ["Invalid UUID format"],
    "agentId": ["Invalid UUID format"]
  }
}
```

## Quick Fixes

### Fix 1: Clear Invalid Data
If you suspect bad data, clear browser storage:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Verify Database Table
Check if `user_agents` table exists:
```sql
SELECT * FROM user_agents LIMIT 1;
```

If it doesn't exist, run migrations:
```bash
# From project root
cd database
psql -U postgres -d your_database -f sql/migrations/create_user_agents.sql
```

### Fix 3: Check Supabase Environment Variables
Verify these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## What the New Code Does

### Before (Old Code)
```typescript
const errorData = await response.json().catch(() => ({}));
console.error('❌ Failed to add agent to chat:', errorData);
```

**Problem**: If the response isn't JSON, we get `{}` and no useful info.

### After (New Code)
```typescript
let errorText = await response.text();
console.log('📄 [Add to Chat] Raw response:', errorText);

// Try to parse as JSON
try {
  errorData = JSON.parse(errorText);
} catch (parseError) {
  console.warn('⚠️ [Add to Chat] Response is not JSON:', errorText);
  errorData = { error: errorText };
}

console.error('❌ Failed to add agent to chat:', {
  status: response.status,
  statusText: response.statusText,
  errorData,
  errorText,
});
```

**Benefits**:
- See the raw response text
- See the HTTP status code
- Handle both JSON and non-JSON responses
- More detailed error logging

## Next Steps

1. **Try adding an agent again**
2. **Check the console for the new detailed logs**
3. **Share the console output** - specifically:
   - The `📤 [Add to Chat] Sending request` log
   - The `📄 [Add to Chat] Raw response` log
   - The `❌ Failed to add agent to chat` log

With this information, I can pinpoint exactly what's causing the validation failure.

## Additional Debugging

If you want to see what agents are available:

```javascript
// In browser console on /agents page
console.table(
  Array.from(document.querySelectorAll('[data-agent-id]')).map(el => ({
    id: el.getAttribute('data-agent-id'),
    name: el.textContent?.trim(),
    isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      el.getAttribute('data-agent-id') || ''
    )
  }))
);
```

This will show you all agents and whether they have valid UUID IDs.

