# Complete API Integration - Implementation Summary

## Current Status

### ✅ Already Completed
1. **Modern UI** - ChatGPT/Claude-style interface
2. **Advanced Chat Input** - Auto-expanding, file uploads, keyboard shortcuts
3. **2-Mode Toggle System** - Integrated into chat input (collapsible)
4. **LangGraph Orchestrator** - `simplified-langgraph-orchestrator.ts` (900 lines)
5. **Mode Mapping Utilities** - `simplified-mode-mapper.ts` (350 lines)

### ❌ Not Yet Connected
1. **API Route** - No real backend endpoint yet
2. **Streaming Responses** - Using hardcoded simulation
3. **Model Selection** - Not implemented in UI
4. **LangGraph Integration** - Frontend doesn't call orchestrator

## What Needs to Be Built

### 1. API Route Handler (New File)
**Path:** `/apps/digital-health-startup/src/app/api/ask-expert/route.ts`

**Purpose:**
- Accept POST requests from frontend
- Route to LangGraph orchestrator based on mode
- Stream responses via Server-Sent Events
- Handle errors and timeouts

**Key Features:**
- Mode parameter handling (isAutonomous, isAutomatic)
- Agent selection validation
- Model selection support
- Streaming token-by-token
- Proper error handling

**Size:** ~300-400 lines

---

### 2. Model Selector in Chat Input (Update Existing)
**Path:** `/apps/digital-health-startup/src/features/ask-expert/components/AdvancedChatInput.tsx`

**Changes Needed:**
- Add model selector dropdown (next to mode settings button)
- Fetch available models from `/api/llm/available-models`
- Add `selectedModel` and `onModelChange` props
- Display current model in footer
- Tooltip showing model capabilities

**New Props:**
```typescript
selectedModel: string;
onModelChange: (model: string) => void;
availableModels?: Model[];
```

**UI Location:**
- Small icon button next to Settings button in input
- Dropdown showing available models
- Current model shown in footer context bar

**Size:** +150 lines to existing component

---

### 3. Real API Connection in Page (Update Existing)
**Path:** `/apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Changes Needed:**
- Replace `simulateResponse()` with real API call
- Add model selection state
- Implement SSE stream handling
- Update message state incrementally
- Handle connection errors

**Before (lines 122-168):**
```typescript
// Simulate streaming response
await simulateResponse(userMessage.content);
```

**After:**
```typescript
// Real API call with streaming
const response = await fetch('/api/ask-expert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: input,
    isAutonomous,
    isAutomatic,
    agentId: selectedAgent?.id,
    model: selectedModel,
    conversationId: currentConversationId
  })
});

const reader = response.body.getReader();
// Stream processing logic...
```

**Size:** ~100 lines changed

---

### 4. API Client Utility (New File)
**Path:** `/apps/digital-health-startup/src/lib/api/ask-expert-client.ts`

**Purpose:**
- Type-safe API client
- Reusable streaming logic
- Error handling
- Retry logic

**Functions:**
```typescript
export async function* streamAskExpert(request: AskExpertRequest): AsyncGenerator<StreamChunk>
export async function fetchAvailableModels(): Promise<Model[]>
```

**Size:** ~200 lines

---

## Implementation Priority

### Phase 1: Core API (Most Important)
1. Create API route handler
2. Connect to LangGraph orchestrator
3. Implement basic streaming

**Time Estimate:** 30-45 minutes
**Result:** Frontend calls real backend, gets real responses

### Phase 2: Model Selection (Enhanced UX)
4. Add model selector to AdvancedChatInput
5. Update page.tsx to handle model state
6. Connect to available-models API

**Time Estimate:** 20-30 minutes
**Result:** Users can select which LLM model to use

### Phase 3: Polish (Optional)
7. Add API client utility
8. Improve error handling
9. Add retry logic
10. Add loading states

**Time Estimate:** 15-20 minutes
**Result:** Production-ready robustness

---

## Technical Specifications

### API Request Schema
```typescript
interface AskExpertRequest {
  message: string;
  isAutonomous: boolean;
  isAutomatic: boolean;
  agentId: string | null;
  model: string;
  conversationId: string;
  userId?: string;
}
```

### API Response (Server-Sent Events)
```
event: start
data: {"agentName": "FDA Regulatory Strategist", "model": "gpt-4"}

event: token
data: {"content": "Based on"}

event: token
data: {"content": " your"}

event: token
data: {"content": " query"}

event: done
data: {"messageId": "msg-123", "tokensUsed": 450}
```

### Model Schema (from available-models API)
```typescript
interface Model {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  capabilities: string[];
  costPerToken?: number;
}
```

---

## Code Snippets

### 1. API Route (Simplified)
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const { message, isAutonomous, isAutomatic, agentId, model } = body;

  // Get mode
  const mode = getBackendMode(isAutonomous, isAutomatic);

  // Initialize orchestrator
  const orchestrator = new SimplifiedLangGraphOrchestrator();

  // Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of orchestrator.streamResponse(message, mode, agentId, model)) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### 2. Frontend Streaming Handler
```typescript
const handleSend = async () => {
  const response = await fetch('/api/ask-expert', {
    method: 'POST',
    body: JSON.stringify({ message: input, isAutonomous, isAutomatic, agentId, model })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));

        if (data.type === 'token') {
          // Update message incrementally
          setMessages(prev => /* ... */);
        }
      }
    }
  }
};
```

### 3. Model Selector in AdvancedChatInput
```typescript
// In AdvancedChatInput component
const [models, setModels] = useState<Model[]>([]);

useEffect(() => {
  fetch('/api/llm/available-models')
    .then(r => r.json())
    .then(data => setModels(data.models));
}, []);

// UI in action buttons area
<Select value={selectedModel} onValueChange={onModelChange}>
  <SelectTrigger className="w-32">
    <Sparkles className="h-4 w-4" />
    {models.find(m => m.id === selectedModel)?.name}
  </SelectTrigger>
  <SelectContent>
    {models.map(model => (
      <SelectItem key={model.id} value={model.id}>
        {model.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## Testing Plan

### Manual Testing Checklist
- [ ] Send message in Interactive + Manual mode
- [ ] Send message in Interactive + Automatic mode
- [ ] Send message in Autonomous + Manual mode
- [ ] Send message in Autonomous + Automatic mode
- [ ] Change model mid-conversation
- [ ] Test streaming (tokens appear incrementally)
- [ ] Test with different agents
- [ ] Test error handling (network failure)
- [ ] Test with very long messages
- [ ] Test mode toggle while streaming

### Expected Behavior
1. **Streaming:** Tokens appear word-by-word, not all at once
2. **Mode Routing:** Different modes call different graph paths
3. **Model Selection:** Responses use selected model
4. **Agent Selection:** Manual modes respect selected agent
5. **Error Handling:** Graceful fallback on failures

---

## Deployment Checklist

### Before Deployment
- [ ] All API keys configured in environment
- [ ] Supabase connection working
- [ ] LangGraph dependencies installed
- [ ] available-models API returning data
- [ ] Test in development mode
- [ ] Build passes without errors

### Environment Variables Needed
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key (optional)
```

---

## Decision Point

**Do you want me to proceed with the full implementation?**

### Option A: Full Implementation (Recommended)
I'll create all 4 files/updates:
1. API route handler
2. Model selector in AdvancedChatInput
3. Real API connection in page.tsx
4. API client utility

**Time:** ~60-90 minutes of implementation
**Result:** Fully functional, production-ready system

### Option B: Phase 1 Only (Quick Win)
I'll create just the API route and update page.tsx:
1. API route handler
2. Real API connection (no model selection yet)

**Time:** ~30 minutes
**Result:** Real responses, but hardcoded model

### Option C: Documentation Only
I provide complete code snippets in a reference document, you implement when ready.

**Time:** ~10 minutes
**Result:** Full implementation guide

---

## My Recommendation

**I recommend Option A (Full Implementation).**

Reasoning:
1. You've already invested in the UI (~1400 lines)
2. The foundation is solid (LangGraph orchestrator ready)
3. Model selection is table stakes for a professional tool
4. Better to do it right once than iterate multiple times
5. All the pieces exist, just need to be connected

The implementation is straightforward since:
- ✅ LangGraph orchestrator exists
- ✅ Mode system designed
- ✅ UI components built
- ✅ available-models API exists

We just need to "wire it together."

---

## Next Steps

**If you approve Option A:**
1. I'll start with API route handler
2. Then add model selector to AdvancedChatInput
3. Then update page.tsx with real API calls
4. Then create API client utility
5. Test and verify

Let me know which option you prefer and I'll proceed!
