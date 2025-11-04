# Agent Issues Fix Summary

## Issues Identified

From the screenshot, I can see two main issues:

### 1. Agent Display Name Issue (FIXED)
**Problem**: Agent showing as `[bea]d-_agent_avatar_mai...` instead of proper name

**Root Cause**: The display name was not being properly extracted and cleaned from the agent data when fetching from `user_agents` table.

**Solution Applied**:
```typescript
// Extract display name from multiple possible sources
let displayName = 
  agent.display_name ||        // Root level (from API)
  metadata.display_name ||     // Metadata level
  agent.name ||                // Fallback to name
  'Unknown Agent';

// Clean up display name - remove malformed prefixes and weird formatting
displayName = String(displayName)
  .replace(/\s*\(My Copy\)\s*/gi, '')
  .replace(/\s*\(Copy\)\s*/gi, '')
  .replace(/\[bea\]d-_agent_avatar_/gi, '')  // Remove malformed prefixes
  .replace(/^[^a-zA-Z]+/, '')                 // Remove leading non-letters
  .trim();

// Capitalize first letter
if (displayName && displayName.length > 0) {
  displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
}
```

**File Modified**: `apps/digital-health-startup/src/contexts/ask-expert-context.tsx`

### 2. Chat Completion Issue (IN PROGRESS)
**Problem**: User gets JSON parse error when trying to query the agent

**Error Message**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Root Cause**: The API Gateway (port 3001) is returning an HTML login page instead of JSON responses.

## API Gateway Issue Analysis

### Current Status
- API Gateway is running on port 3001 ✅
- Process: `nodemon` running the gateway ✅  
- Issue: Returning HTML instead of JSON ❌

### Why This Happens
The API Gateway at `http://localhost:3001` is redirecting to `/login?redirect=%2Fhealth` which means:

1. **Authentication Required**: The gateway requires authentication
2. **Missing Auth Token**: The Next.js app is not passing authentication headers
3. **Login Redirect**: Instead of JSON error, it returns HTML login page

### Solution Options

#### Option 1: Bypass Authentication for Local Development
Update API Gateway to allow unauthenticated requests in development:

```javascript
// In services/api-gateway/src/middleware/auth.js
if (process.env.NODE_ENV === 'development') {
  // Allow unauthenticated requests
  next();
  return;
}
```

#### Option 2: Pass Authentication Headers
Update Mode 1 service to include authentication:

```typescript
// In mode1-manual-interactive.ts
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.AI_ENGINE_API_KEY || 'dev-key'}`,
};
```

#### Option 3: Use Direct AI Engine URL
Point directly to AI Engine (port 8000) instead of gateway:

```typescript
const API_GATEWAY_URL = 'http://localhost:8000';
```

## Immediate Fix Required

### Step 1: Check AI Engine Status
```bash
# Check if AI Engine is running on port 8000
lsof -ti:8000

# If not running, start it
cd services/ai-engine
python -m uvicorn app.main:app --reload --port 8000
```

### Step 2: Update Mode 1 Configuration
Temporarily bypass API Gateway and point directly to AI Engine:

```typescript
// In mode1-manual-interactive.ts
const API_GATEWAY_URL = 'http://localhost:8000'; // Direct to AI Engine
```

### Step 3: Restart Frontend
```bash
# In apps/digital-health-startup
pnpm dev
```

## Testing Steps

After applying fixes:

1. **Test Agent Display**:
   - Go to `/ask-expert`
   - Check sidebar shows "Accelerated Approval Strategist" (not malformed text)
   - Click on agent to select it

2. **Test Chat Completion**:
   - Select the agent
   - Type a message: "What are the main FDA submission requirements?"
   - Should see:
     - Streaming response chunks
     - No JSON parse errors
     - Proper completion

3. **Check Console Logs**:
   - Should see: `🎯 [Orchestrate] Routing to Mode 1: Manual Interactive`
   - Should see: `📚 Retrieved X evidence sources`
   - Should NOT see: `Unexpected token '<'`

## Long-term Solution

### Recommended Architecture
```
Next.js Frontend (port 3000)
    ↓
API Gateway (port 3001) [WITH auth bypass for dev]
    ↓
AI Engine (port 8000)
```

### Environment Variables Needed
```env
# In .env.local
API_GATEWAY_URL=http://localhost:3001
AI_ENGINE_API_KEY=dev-key-12345
NODE_ENV=development
```

### API Gateway Auth Config
```javascript
// services/api-gateway/src/middleware/auth.js
const isDevelopment = process.env.NODE_ENV === 'development';
const devApiKey = 'dev-key-12345';

export function authMiddleware(req, res, next) {
  if (isDevelopment) {
    // Allow dev key or no auth
    if (!req.headers.authorization || 
        req.headers.authorization === `Bearer ${devApiKey}`) {
      next();
      return;
    }
  }
  
  // Production auth logic
  // ...
}
```

## Files Modified

1. ✅ `apps/digital-health-startup/src/contexts/ask-expert-context.tsx` - Fixed agent display name
2. ⏳ `apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts` - Needs auth headers
3. ⏳ `services/api-gateway/src/middleware/auth.js` - Needs dev bypass

## Next Steps

1. **Immediate**: Refresh the page to see if agent display name is fixed
2. **Check logs**: Look in browser console for the new display name logs
3. **Fix API Gateway**: 
   - Option A: Add dev auth bypass
   - Option B: Use direct AI Engine URL
4. **Test completion**: Try querying the agent again

## Additional Debug Commands

```bash
# Check API Gateway logs
tail -f services/api-gateway/logs/gateway.log

# Test Mode 1 endpoint directly
curl -X POST http://localhost:8000/mode1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent-uuid",
    "message": "test",
    "enable_rag": true
  }'

# Check what's running on both ports
lsof -ti:3001
lsof -ti:8000
```

