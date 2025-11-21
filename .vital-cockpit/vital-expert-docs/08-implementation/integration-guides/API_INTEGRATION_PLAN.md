# API Integration Implementation Plan

## Overview
Connect the Ask Expert frontend to real LangGraph backend with streaming, model selection, and 4-mode support.

## Files to Create/Modify

### 1. API Route Handler
**File:** `/apps/digital-health-startup/src/app/api/ask-expert/route.ts`
- Handle POST requests with mode parameters
- Connect to simplified-langgraph-orchestrator
- Implement Server-Sent Events streaming
- Support 4-mode system

### 2. Update AdvancedChatInput Component
**File:** `/apps/digital-health-startup/src/features/ask-expert/components/AdvancedChatInput.tsx`
- Add model selector dropdown
- Fetch available models from API
- Pass selected model to parent

### 3. Update Page Component
**File:** `/apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
- Add model selection state
- Replace simulated response with real API call
- Implement SSE response handling
- Pass model to API

### 4. Create API Client Utility
**File:** `/apps/digital-health-startup/src/lib/api/ask-expert-client.ts`
- Type-safe API client
- SSE stream handling
- Error handling

## Implementation Steps

1. ✅ Create API route with LangGraph integration
2. ✅ Add model selector to AdvancedChatInput
3. ✅ Update page.tsx with real API calls
4. ✅ Create API client utility
5. ✅ Test all 4 modes
6. ✅ Test model selection
7. ✅ Test streaming responses

## Technical Details

### API Request Format
```typescript
POST /api/ask-expert
{
  "message": string,
  "isAutonomous": boolean,
  "isAutomatic": boolean,
  "agentId": string | null,
  "model": string,
  "conversationId": string
}
```

### API Response Format (SSE)
```
data: {"type": "start", "agentName": "..."}
data: {"type": "token", "content": "..."}
data: {"type": "done"}
```

### Model Selection
- Fetch from `/api/llm/available-models`
- Display in dropdown in AdvancedChatInput
- Default to GPT-4 or first available
- Per-conversation model selection
