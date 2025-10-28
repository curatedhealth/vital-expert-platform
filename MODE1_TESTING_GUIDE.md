# Mode 1: Manual Interactive - Testing Guide

## Current Status

✅ **Implementation Complete**
- Mode 1 handler: `src/features/chat/services/mode1-manual-interactive.ts`
- API route: `src/app/api/ask-expert/orchestrate/route.ts`
- Old complex orchestrator: Disabled as `route-old-complex.ts.disabled`
- Dev server running on: http://localhost:3001

## Frontend Integration Required

**The Mode 1 backend is complete but the frontend needs to be updated to send requests in the new format.**

### Current Frontend Issue

The Ask Expert page is likely still calling the old complex orchestrator or using the wrong request format. The frontend needs to:

1. **Send requests to**: `/api/ask-expert/orchestrate`
2. **Use request format**:
   ```typescript
   {
     mode: 'manual',           // When both Automatic and Autonomous toggles are OFF
     agentId: string,          // Selected agent ID
     message: string,          // User's message
     enableRAG: boolean,       // RAG toggle state (default: false)
     enableTools: boolean,     // Tools toggle state (default: false)
     model?: string,           // Optional: Override from prompt composer
     temperature?: number,     // Optional: 0.7 default
     maxTokens?: number        // Optional: 2000 default
     conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>
   }
   ```

### Frontend Files to Check/Update

1. **Main Ask Expert Page**: `src/app/(app)/ask-expert/page.tsx`
   - Check which API endpoint is being called
   - Verify request format matches Mode 1 requirements

2. **Chat Hooks** (if any):
   - `src/features/ask-expert/hooks/useLangGraphOrchestration.ts`
   - Check if this is constructing the correct request

3. **Mode Detection Logic**:
   - When Automatic toggle is OFF AND Autonomous toggle is OFF → `mode: 'manual'`
   - When Automatic toggle is ON → `mode: 'automatic'` (not yet implemented)
   - When Autonomous toggle is ON → `mode: 'autonomous'` (not yet implemented)

## Manual Backend Testing (Direct API Call)

You can test the Mode 1 backend directly with curl, but you'll need authentication. Here's how:

### Step 1: Get Authentication Token

1. Open browser to http://localhost:3001/login
2. Login with your credentials
3. Open browser DevTools → Network tab
4. Make any API request
5. Copy the `Cookie` header from the request

### Step 2: Test Mode 1 with curl

```bash
# Replace AGENT_ID and COOKIE_VALUE
curl -X POST http://localhost:3001/api/ask-expert/orchestrate \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_COOKIE_VALUE_HERE" \
  -d '{
    "mode": "manual",
    "agentId": "AGENT_ID_HERE",
    "message": "What are the key considerations for Phase 3 clinical trials?",
    "enableRAG": false,
    "enableTools": false
  }'
```

### Expected Response (Success)

```
data: {"type":"chunk","content":"Phase","timestamp":"2025-10-27T..."}

data: {"type":"chunk","content":" 3","timestamp":"2025-10-27T..."}

data: {"type":"chunk","content":" clinical","timestamp":"2025-10-27T..."}

... (streaming continues)

data: {"type":"done"}

```

### Expected Response (Error - Missing Agent ID)

```
data: {"error":"Agent ID required for manual mode"}

```

## Testing in Browser

### Step 1: Navigate to Ask Expert
1. Open http://localhost:3001/ask-expert
2. Login if prompted
3. Wait for agents to load in the sidebar

### Step 2: Select an Agent
- Click on any agent in the left sidebar
- Agent should appear selected

### Step 3: Send a Test Message
- Ensure both Automatic and Autonomous toggles are OFF
- Type a message like: "What are the key considerations for clinical trials?"
- Click Send
- **Expected**: See streaming response appear in real-time

### Step 4: Check Browser Console
Open DevTools Console and look for:
- ✅ **Good**: `[Orchestrate] Routing to Mode 1: Manual Interactive`
- ❌ **Bad**: Any database errors about `status` or `knowledge_domains` columns
- ❌ **Bad**: `CachedRAGService.queryRAG is not a function`

### Step 5: Check Dev Server Logs
In the terminal running `npm run dev`, look for:
- ✅ **Good**: `🎯 [Orchestrate] Routing to Mode 1: Manual Interactive`
- ✅ **Good**: `✅ [Mode1] Agent loaded: {agent name}`
- ✅ **Good**: `✅ [Mode1] Direct execution (no RAG, no tools)`
- ❌ **Bad**: Old orchestrator logs like `🚀 Starting chat_manual orchestration`

## Testing Different Mode 1 Paths

Mode 1 has 4 execution paths you can test:

### Path 1: Direct (No RAG, No Tools)
**Fastest** - Direct LLM call
```json
{
  "mode": "manual",
  "agentId": "agent-id",
  "message": "Explain the FDA approval process",
  "enableRAG": false,
  "enableTools": false
}
```
**Expected time**: 2-3 seconds
**Expected log**: `✅ [Mode1] Direct execution (no RAG, no tools)`

### Path 2: With RAG Only
Retrieves context from knowledge base first
```json
{
  "mode": "manual",
  "agentId": "agent-id",
  "message": "What are the latest FDA guidelines?",
  "enableRAG": true,
  "enableTools": false
}
```
**Expected time**: 4-5 seconds
**Expected log**: `✅ [Mode1] Executing with RAG only`

### Path 3: With Tools Only
Uses LangGraph for tool execution
```json
{
  "mode": "manual",
  "agentId": "agent-id",
  "message": "Calculate the sample size for a trial",
  "enableRAG": false,
  "enableTools": true
}
```
**Expected time**: 5-10 seconds (depends on tools)
**Expected log**: `✅ [Mode1] Executing with tools only`

### Path 4: Full Featured (RAG + Tools)
Combines context retrieval and tool execution
```json
{
  "mode": "manual",
  "agentId": "agent-id",
  "message": "Design a clinical trial based on recent FDA guidance",
  "enableRAG": true,
  "enableTools": true
}
```
**Expected time**: 8-12 seconds
**Expected log**: `✅ [Mode1] Executing with RAG and tools`

## Common Issues & Solutions

### Issue 1: Old Orchestrator Still Running
**Symptoms**: Logs show `🚀 Starting chat_manual orchestration` and database errors
**Solution**:
```bash
rm -rf apps/digital-health-startup/.next
killall -9 node
cd apps/digital-health-startup && npm run dev
```

### Issue 2: Frontend Not Sending Correct Format
**Symptoms**: Backend receives request but mode is undefined or wrong format
**Solution**: Update frontend to send `{mode: 'manual', agentId: ..., message: ...}`

### Issue 3: RAG Not Working
**Symptoms**: Error about `match_documents` function not found
**Solution**: RAG integration needs the Supabase `match_documents` function to be set up
**Workaround**: Test with `enableRAG: false` first

### Issue 4: Tools Not Working
**Symptoms**: Tool execution returns empty or errors
**Solution**: Tool implementation is stubbed in Mode 1, needs real tool definitions
**Workaround**: Test with `enableTools: false` first

## Next Steps

1. **Priority 1**: Update frontend to call Mode 1 API with correct format
2. **Priority 2**: Test Direct path (no RAG, no tools) - simplest path
3. **Priority 3**: Once Direct works, test RAG path
4. **Priority 4**: Implement Mode 2 (Automatic)
5. **Priority 5**: Implement Mode 3 (Autonomous)
6. **Priority 6**: Implement Mode 4 (Multi-Expert)

## Frontend Code Example

Here's what the frontend fetch should look like:

```typescript
// In Ask Expert page or hook
const sendMessage = async (message: string) => {
  const response = await fetch('/api/ask-expert/orchestrate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'manual',              // When both toggles are OFF
      agentId: selectedAgent?.id,  // Currently selected agent
      message: message,
      enableRAG: ragEnabled,       // RAG toggle state
      enableTools: toolsEnabled,   // Tools toggle state
      // Optional overrides from prompt composer:
      model: selectedModel,
      temperature: temperature,
      maxTokens: maxTokens,
      conversationHistory: history
    })
  });

  // Read SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const events = text.split('\n\n').filter(Boolean);

    for (const event of events) {
      if (event.startsWith('data: ')) {
        const data = JSON.parse(event.slice(6));

        if (data.type === 'chunk') {
          // Append data.content to UI
          appendToChat(data.content);
        } else if (data.type === 'done') {
          console.log('Response complete');
        } else if (data.type === 'error') {
          console.error('Error:', data.message);
        }
      }
    }
  }
};
```

## Success Criteria

- [ ] Frontend sends requests in Mode 1 format
- [ ] Agent is selected and ID is passed correctly
- [ ] Mode is set to 'manual' when both toggles are OFF
- [ ] Direct path (no RAG, no tools) streams response successfully
- [ ] Response appears in chat UI in real-time
- [ ] No database schema errors in logs
- [ ] No old orchestrator logs appear

---

**Status**: Mode 1 backend is complete and ready for frontend integration testing.
**Server**: Running on http://localhost:3001
**Next Action**: Update frontend or test with browser DevTools
