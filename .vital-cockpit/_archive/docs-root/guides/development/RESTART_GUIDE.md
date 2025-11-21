# Quick Fix Guide - Restart Required

## Why You're Still Seeing the Error

The changes I made are to **server-side TypeScript files** in Next.js. These don't hot-reload automatically. You need to restart the Next.js development server.

## How to Fix (2 Steps)

### Step 1: Restart Next.js Server

```bash
# Stop the current server (Ctrl+C in the terminal running it)
# Or kill the process:
kill -9 76032

# Then restart:
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
pnpm dev
```

### Step 2: Test Again

1. Go to `http://localhost:3000/ask-expert`
2. Select your agent
3. Type a message
4. Press Enter

## What Changed

All 4 modes now connect to `http://localhost:8000` (AI Engine) instead of `http://localhost:3001` (API Gateway):

- ✅ Mode 1: `http://localhost:8000/api/mode1/manual`
- ✅ Mode 2: `http://localhost:8000/api/mode2/automatic`
- ✅ Mode 3: `http://localhost:8000/api/mode3/autonomous-automatic`
- ✅ Mode 4: `http://localhost:8000/api/mode4/autonomous-manual`

## If You Still Get Errors After Restart

The AI Engine endpoint might have issues with the request format. Check these:

### Option A: Check AI Engine Logs
```bash
# In a separate terminal:
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/services/ai-engine"
tail -f logs/*.log

# Or check Python process output
ps aux | grep "uvicorn.*8000"
```

### Option B: Quick Test of Endpoint
```bash
curl -X POST http://localhost:8000/api/mode1/manual \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "test query",
    "enable_rag": true,
    "enable_tools": false,
    "user_id": "test-user",
    "tenant_id": "test-tenant",
    "session_id": "test-session"
  }'
```

If this returns JSON (not HTML), then the endpoint works!

### Option C: Check Console After Restart

After restarting Next.js, check your browser console. You should see:
```
[Mode1] Calling AI Engine: http://localhost:8000/api/mode1/manual
```

Instead of the old:
```
[Mode1] Calling API Gateway: http://localhost:3001/api/mode1/manual
```

## Quick Restart Commands

### For macOS/Linux:
```bash
# Kill Next.js process
kill -9 $(lsof -ti:3000)

# Restart
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/digital-health-startup"
pnpm dev
```

### For Windows:
```powershell
# Kill Next.js process
taskkill /F /PID 76032

# Restart  
cd "C:\path\to\VITAL path\apps\digital-health-startup"
pnpm dev
```

## Expected Behavior After Restart

1. **Browser Console**: Should show new endpoint URLs with port 8000
2. **No HTML errors**: Should get JSON responses (or proper JSON errors)
3. **Agent display**: Should show "Accelerated Approval Strategist" properly
4. **Chat**: Should get streaming responses!

## Why Restart is Needed

Next.js development server uses:
- **Hot Module Replacement (HMR)** for client-side React components ✅
- **Fast Refresh** for page components ✅
- **Manual Restart** for API routes and server-side utilities ❌ (our case)

The Mode services are imported by the API route (`/api/ask-expert/orchestrate`), so they need a full restart.

## Files That Changed (Need Restart)

1. `/apps/digital-health-startup/src/features/chat/services/mode1-manual-interactive.ts`
2. `/apps/digital-health-startup/src/features/chat/services/mode2-automatic-agent-selection.ts`
3. `/apps/digital-health-startup/src/features/chat/services/mode3-autonomous-automatic.ts`
4. `/apps/digital-health-startup/src/features/chat/services/mode4-autonomous-manual.ts`
5. `/apps/digital-health-startup/src/contexts/ask-expert-context.tsx` (for agent display)

## After Restart Works, You Should See

✅ Agent name displays correctly
✅ Message sends successfully  
✅ Console shows `http://localhost:8000/api/mode1/manual`
✅ Response streams in
✅ No more `Unexpected token '<'` errors!

**Just restart the Next.js server and try again!** 🚀

