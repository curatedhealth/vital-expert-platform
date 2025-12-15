# Ask Expert Streaming Implementation Guide

> **CRITICAL**: This document captures the working state of token-by-token streaming and real-time reasoning. Any changes to the files listed here MUST be tested thoroughly to prevent regressions.

**Last Verified Working**: December 15, 2025
**Commit**: `b0c6868b`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Components](#frontend-components)
3. [Backend Components](#backend-components)
4. [Critical Files - DO NOT MODIFY WITHOUT TESTING](#critical-files)
5. [Token Streaming Flow](#token-streaming-flow)
6. [Real-Time Reasoning Flow](#real-time-reasoning-flow)
7. [Key Implementation Details](#key-implementation-details)
8. [Common Regression Causes](#common-regression-causes)
9. [Testing Checklist](#testing-checklist)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  InteractiveView.tsx                                                     │
│       │                                                                  │
│       ├── useSSEStream (hook) ──────► EventSource connection             │
│       │        │                                                         │
│       │        ├── onToken ─────────► dispatch(CONTENT_APPEND)           │
│       │        ├── onReasoning ─────► dispatch(REASONING_ADD)            │
│       │        ├── onCitation ──────► dispatch(CITATION_ADD)             │
│       │        └── onDone ──────────► dispatch(COMPLETE)                 │
│       │                                                                  │
│       └── streamReducer (state) ────► StreamingMessage.tsx               │
│                                              │                           │
│                                              ├── VitalThinking (reasoning)│
│                                              └── VitalStreamText (tokens) │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SSE (Server-Sent Events)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  /api/expert/mode1/stream (or mode2)                                     │
│       │                                                                  │
│       └── LangGraph Workflow                                             │
│                │                                                         │
│                ├── execute_expert node ──► OpenAI streaming              │
│                │                                                         │
│                └── SSE Formatter ────────► Event types:                  │
│                                            • reasoning (thinking steps)  │
│                                            • token (content chunks)      │
│                                            • citation (references)       │
│                                            • done (completion)           │
│                                            • error (failures)            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Components

### Base Path: `apps/vital-system/src/`

### Views

| Component | Path | Description |
|-----------|------|-------------|
| `InteractiveView` | `features/ask-expert/views/InteractiveView.tsx` | Main orchestrator for Modes 1 & 2. Manages streaming state, SSE connection, and renders conversation UI. |

### Hooks (State Management)

| Hook | Path | Description |
|------|------|-------------|
| `useSSEStream` | `features/ask-expert/hooks/useSSEStream.ts` | Creates EventSource connection, parses SSE events, provides callbacks for token/reasoning/citation/done/error events. |
| `streamReducer` | `features/ask-expert/hooks/streamReducer.ts` | Reducer for streaming state. Handles CONTENT_APPEND, REASONING_ADD, CITATION_ADD, COMPLETE, ERROR actions. Contains `_updateTrigger` for React re-render detection. |
| `streamActions` | `features/ask-expert/hooks/streamReducer.ts` | Action creators for stream reducer (appendContent, addReasoning, addCitation, complete, error, reset). |

### Interactive Components

| Component | Path | Description |
|-----------|------|-------------|
| `StreamingMessage` | `features/ask-expert/components/interactive/StreamingMessage.tsx` | Renders the AI response during streaming. Shows VitalThinking, VitalStreamText, citations, and loading states. |
| `VitalMessage` | `features/ask-expert/components/interactive/VitalMessage.tsx` | Renders completed messages (both user and assistant). Uses VitalThinking for reasoning display. |
| `VitalThinking` | `features/ask-expert/components/interactive/VitalThinking.tsx` | Expandable reasoning/thinking display. Shows step-by-step thinking process with animations. |
| `VitalThinkingCompact` | `features/ask-expert/components/interactive/VitalThinking.tsx` | Compact version of thinking display for inline use. |
| `ExpertPicker` | `features/ask-expert/components/interactive/ExpertPicker.tsx` | Expert selection UI. Exports `Expert` type used throughout streaming. |
| `FusionSelector` | `features/ask-expert/components/interactive/FusionSelector.tsx` | Mode 2 auto-selection UI with Fusion Intelligence. |
| `CitationList` | `features/ask-expert/components/interactive/CitationList.tsx` | Renders list of citations/references from AI response. |
| `ToolCallList` | `features/ask-expert/components/interactive/ToolCallList.tsx` | Renders tool calls made by the AI during response generation. |
| `VitalSuggestionChips` | `features/ask-expert/components/interactive/VitalSuggestionChips.tsx` | Follow-up suggestion chips shown after response completion. |
| `ChatInput` | `features/ask-expert/components/interactive/ChatInput.tsx` | Legacy chat input component. |
| `AgentSelectionCard` | `features/ask-expert/components/interactive/AgentSelectionCard.tsx` | Card UI for expert selection. Exports `VitalLevelBadge`. |
| `ConversationHistorySidebar` | `features/ask-expert/components/interactive/ConversationHistorySidebar.tsx` | Sidebar showing conversation history. |

### HITL Components (Human-in-the-Loop)

| Component | Path | Description |
|-----------|------|-------------|
| `HITLCheckpointModal` | `features/ask-expert/components/interactive/HITLCheckpointModal.tsx` | Modal for human checkpoints during AI execution. |
| `PlanApprovalCard` | `features/ask-expert/components/interactive/PlanApprovalCard.tsx` | Card UI for approving AI execution plans. |
| `SubAgentDelegationCard` | `features/ask-expert/components/interactive/SubAgentDelegationCard.tsx` | Card UI for sub-agent delegation decisions. |
| `ToolExecutionFeedback` | `features/ask-expert/components/interactive/ToolExecutionFeedback.tsx` | Feedback UI for tool execution results. |

### Shared UI Components (vital-ai-ui)

| Component | Path | Description |
|-----------|------|-------------|
| `VitalStreamText` | `components/vital-ai-ui/conversation/VitalStreamText.tsx` | Renders streaming text with markdown parsing. Handles incomplete markdown during streaming. Supports inline citations. |
| `VitalPromptInput` | `components/vital-ai-ui/conversation/VitalPromptInput.tsx` | Enhanced prompt input with AI enhance, drag-drop, character counter. |
| `VitalThinking` (shared) | `packages/vital-ai-ui/src/reasoning/VitalThinking.tsx` | Shared version of thinking component in package. |
| `VitalSourceList` | `packages/vital-ai-ui/src/reasoning/VitalSourceList.tsx` | Renders source/reference lists. |
| `VitalCitation` | `packages/vital-ai-ui/src/reasoning/VitalCitation.tsx` | Single citation component. |
| `VitalInlineCitation` | `packages/vital-ai-ui/src/reasoning/VitalInlineCitation.tsx` | Inline citation pill component. |
| `VitalSources` | `packages/vital-ai-ui/src/reasoning/VitalSources.tsx` | Sources container component. |

### Context Providers

| Context | Path | Description |
|---------|------|-------------|
| `HeaderActionsContext` | `contexts/header-actions-context.tsx` | Allows pages to inject content into global header. Used by InteractiveView to show expert info in header. |
| `AskExpertContext` | `contexts/ask-expert-context.tsx` | Global state for Ask Expert feature. |

### Layout Components

| Component | Path | Description |
|-----------|------|-------------|
| `UnifiedDashboardLayout` | `components/dashboard/unified-dashboard-layout.tsx` | Main layout with sidebar, breadcrumb, header. Wraps with `HeaderActionsProvider`. |
| `SidebarAskExpert` | `components/sidebar-ask-expert.tsx` | Sidebar content for Ask Expert section. |
| `AppSidebar` | `components/app-sidebar.tsx` | Main application sidebar. |

### UI Primitives (shadcn/ui)

| Component | Path | Description |
|-----------|------|-------------|
| `Breadcrumb` | `components/ui/breadcrumb.tsx` | Breadcrumb navigation components (BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator). |
| `Button` | `components/ui/button.tsx` | Button component. |
| `Card` | `components/ui/card.tsx` | Card container components. |
| `Tooltip` | `components/ui/tooltip.tsx` | Tooltip components. |
| `Separator` | `components/ui/separator.tsx` | Visual separator. |

---

## Backend Components

### Base Path: `services/ai-engine/src/`

### API Routes

| Route | Path | Description |
|-------|------|-------------|
| `ask_expert_interactive` | `api/routes/ask_expert_interactive.py` | Main SSE streaming endpoint for Mode 1 & 2. Handles `/api/expert/mode1/stream` and `/api/expert/mode2/stream`. |
| `ask_expert` | `api/routes/ask_expert.py` | Non-streaming Ask Expert endpoints. |
| `core` | `api/routes/core.py` | Health check and core endpoints. |

### Streaming Infrastructure

| Module | Path | Description |
|--------|------|-------------|
| `sse_formatter` | `streaming/sse_formatter.py` | Formats events for SSE protocol. Creates `token`, `reasoning`, `citation`, `done`, `error` event types. |
| `stream_manager` | `streaming/stream_manager.py` | Manages stream lifecycle, buffering, and delivery. |

### LangGraph Workflows

| Workflow | Path | Description |
|----------|------|-------------|
| `ask_expert_mode1_workflow` | `langgraph_workflows/ask_expert/ask_expert_mode1_workflow.py` | Mode 1 (Manual Selection) workflow. Orchestrates agent execution with streaming support. |
| `ask_expert_mode2_workflow` | `langgraph_workflows/ask_expert/ask_expert_mode2_workflow.py` | Mode 2 (Auto Selection) workflow. Includes Fusion Intelligence for agent selection. |

### LangGraph Nodes

| Node | Path | Description |
|------|------|-------------|
| `input_processor` | `langgraph_workflows/ask_expert/shared/nodes/input_processor.py` | Processes and validates input for workflows. |
| `execute_expert` | `langgraph_workflows/ask_expert/ask_expert_mode1_workflow.py` | Executes the expert agent with OpenAI streaming. |
| `format_output` | `langgraph_workflows/ask_expert/shared/nodes/format_output.py` | Formats final output with citations and metadata. |
| `rag_retriever` | `langgraph_workflows/ask_expert/shared/nodes/rag_retriever.py` | Retrieves relevant documents for context. |
| `l3_context_engineer` | `langgraph_workflows/ask_expert/shared/nodes/l3_context_engineer.py` | L3 context engineering for advanced queries. |

### Services

| Service | Path | Description |
|---------|------|-------------|
| `agent_instantiation_service` | `services/agent_instantiation_service.py` | Instantiates agents with proper configuration, personalities, and tools. |
| `unified_rag_service` | `services/unified_rag_service.py` | Unified RAG service for document retrieval. |
| `graphrag_selector` | `services/graphrag_selector.py` | GraphRAG-based agent selection (Pinecone + Neo4j + PostgreSQL fusion). |
| `supabase_client` | `services/supabase_client.py` | Supabase database client. |
| `cache_manager` | `services/cache_manager.py` | Redis/memory caching for performance. |

### LLM Infrastructure

| Module | Path | Description |
|--------|------|-------------|
| `llm_factory` | `infrastructure/llm/llm_factory.py` | Creates LLM clients (OpenAI, Anthropic, etc.). |
| `openai_client` | `infrastructure/llm/openai_client.py` | OpenAI API client with streaming support. |

### Domain Models

| Model | Path | Description |
|-------|------|-------------|
| `Agent` | `domain/entities/agent.py` | Agent entity with configuration. |
| `Conversation` | `domain/entities/conversation.py` | Conversation entity. |
| `Message` | `domain/entities/message.py` | Message entity (user/assistant). |

### API Schemas

| Schema | Path | Description |
|--------|------|-------------|
| `StreamEvent` | `api/schemas/streaming.py` | SSE event schemas (TokenEvent, ReasoningEvent, CitationEvent, etc.). |
| `AskExpertRequest` | `api/schemas/ask_expert.py` | Request schema for Ask Expert endpoints. |
| `AskExpertResponse` | `api/schemas/ask_expert.py` | Response schema for Ask Expert endpoints. |

### Middleware

| Middleware | Path | Description |
|------------|------|-------------|
| `request_context` | `api/middleware/request_context.py` | Request context middleware for logging and tracing. |
| `error_handler` | `api/middleware/error_handler.py` | Global error handling middleware. |

---

## Critical Files

### ⚠️ DO NOT MODIFY WITHOUT THOROUGH TESTING

| File | Purpose | Risk Level |
|------|---------|------------|
| `hooks/streamReducer.ts` | Manages all streaming state | 🔴 CRITICAL |
| `hooks/useSSEStream.ts` | SSE connection & event parsing | 🔴 CRITICAL |
| `components/interactive/StreamingMessage.tsx` | Renders streaming content | 🔴 CRITICAL |
| `components/interactive/VitalThinking.tsx` | Real-time reasoning display | 🟡 HIGH |
| `views/InteractiveView.tsx` | Orchestrates streaming | 🟡 HIGH |
| `components/vital-ai-ui/conversation/VitalStreamText.tsx` | Token rendering | 🟡 HIGH |

### Backend Critical Files

| File | Purpose | Risk Level |
|------|---------|------------|
| `api/routes/ask_expert_interactive.py` | SSE endpoint | 🔴 CRITICAL |
| `streaming/sse_formatter.py` | Event formatting | 🔴 CRITICAL |
| `streaming/stream_manager.py` | Stream lifecycle | 🔴 CRITICAL |

---

## Token Streaming Flow

### 1. SSE Connection Established

```typescript
// useSSEStream.ts - Creates EventSource connection
const eventSource = new EventSource(url);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Route to appropriate handler based on event type
};
```

### 2. Token Events Received

```typescript
// Event format from backend:
{
  "type": "token",
  "content": "Hello",  // Single token or small chunk
  "timestamp": "2025-12-15T..."
}
```

### 3. State Update with flushSync

```typescript
// InteractiveView.tsx - CRITICAL: flushSync bypasses React 18 batching
onToken: useCallback((event: TokenEvent) => {
  flushSync(() => {
    dispatch(streamActions.appendContent(event));
  });
}, []),
```

**⚠️ WHY flushSync IS CRITICAL:**
- React 18 batches state updates for performance
- This causes tokens to appear in chunks instead of real-time
- `flushSync` forces immediate DOM updates
- Removing `flushSync` WILL cause streaming regression

### 4. Reducer Updates State

```typescript
// streamReducer.ts - CRITICAL: _updateTrigger forces re-render detection
case 'CONTENT_APPEND':
  return {
    ...state,
    content: state.content + action.payload.content,
    contentTokens: state.contentTokens + 1,
    status: 'streaming',
    _updateTrigger: Date.now(),  // CRITICAL: Forces React to detect change
  };
```

**⚠️ WHY _updateTrigger IS CRITICAL:**
- React's shallow comparison may miss rapid string concatenation
- `_updateTrigger` with `Date.now()` guarantees unique value each update
- Removing this WILL cause intermittent streaming issues

### 5. Component Renders Token

```typescript
// StreamingMessage.tsx
<VitalStreamText
  content={state.content}
  isStreaming={isStreaming}
  citations={inlineCitations}
/>
```

---

## Real-Time Reasoning Flow

### 1. Reasoning Events from Backend

```typescript
// Event format:
{
  "type": "reasoning",
  "id": "step-1",
  "step": "Analyzing query context...",
  "status": "active"  // active | complete | error
}
```

### 2. State Update with flushSync

```typescript
// InteractiveView.tsx - CRITICAL: Same flushSync pattern
onReasoning: useCallback((event: ReasoningEvent) => {
  flushSync(() => {
    dispatch(streamActions.addReasoning(event));
  });
}, []),
```

### 3. Reducer Updates Reasoning State

```typescript
// streamReducer.ts
case 'REASONING_ADD':
  return {
    ...state,
    reasoning: updateOrAppendReasoning(state.reasoning, action.payload),
    isThinking: action.payload.status !== 'complete' && action.payload.status !== 'error',
    status: action.payload.status !== 'complete' ? 'thinking' : state.status,
    _updateTrigger: Date.now(),  // CRITICAL: Real-time thinking updates
  };
```

### 4. VitalThinking Renders Steps

```typescript
// StreamingMessage.tsx
{isThinking && state.reasoning.length > 0 && (
  <VitalThinking
    steps={state.reasoning}
    isActive={true}
  />
)}
```

**⚠️ VitalThinking Props:**
- `isActive={true}` during streaming shows animated state
- `isActive={false}` for completed messages
- Do NOT pass `isExpanded={false}` - this makes it controlled and breaks toggle

---

## Key Implementation Details

### StreamState Interface

```typescript
interface StreamState {
  // Content
  content: string;           // Accumulated response text
  contentTokens: number;     // Token count for debugging

  // Status
  status: 'idle' | 'thinking' | 'streaming' | 'complete' | 'error';
  isThinking: boolean;       // True during reasoning phase

  // Reasoning
  reasoning: ReasoningStep[]; // Array of thinking steps

  // Citations
  citations: CitationEvent[]; // Source references

  // CRITICAL: Re-render trigger
  _updateTrigger: number;    // Timestamp to force React updates
}
```

### Status Transitions

```
idle ──► thinking ──► streaming ──► complete
                  │               │
                  └───────────────┴──► error
```

### isStreaming Logic

```typescript
// StreamingMessage.tsx - CRITICAL: Include 'thinking' status
const isStreaming = state.status === 'streaming' || state.status === 'thinking';
```

This ensures `VitalStreamText` uses `parseIncompleteMarkdown` mode during the entire response generation.

---

## Common Regression Causes

### 🚫 DO NOT DO THESE:

1. **Remove `flushSync` from token/reasoning handlers**
   - Causes: Tokens appear in batches instead of real-time
   - Symptom: Content jumps in chunks

2. **Remove `_updateTrigger` from reducer**
   - Causes: React misses rapid state updates
   - Symptom: Intermittent freezing, content not appearing

3. **Pass `isExpanded={false}` to VitalThinking**
   - Causes: Component becomes controlled, can't be toggled
   - Symptom: Can't expand reasoning section

4. **Remove 'thinking' from isStreaming check**
   - Causes: Markdown parsing breaks during reasoning phase
   - Symptom: Raw markdown shown during thinking

5. **Change SSE event type names**
   - Causes: Frontend doesn't recognize events
   - Symptom: Nothing renders

6. **Batch multiple dispatch calls without flushSync**
   - Causes: Updates get batched
   - Symptom: Delayed rendering

---

## Testing Checklist

### Before Modifying Any Critical File:

- [ ] **Token Streaming Test**
  1. Start a conversation with any expert
  2. Ask a question that generates a long response
  3. Verify tokens appear one-by-one (not in chunks)
  4. Verify no freezing or delays

- [ ] **Reasoning Test**
  1. Start a conversation
  2. Verify "Thinking..." box appears immediately
  3. Verify reasoning steps update in real-time
  4. Verify reasoning can be expanded/collapsed after completion

- [ ] **Status Transition Test**
  1. Verify status goes: idle → thinking → streaming → complete
  2. Verify loading indicators match status
  3. Verify no stuck states

- [ ] **Error Handling Test**
  1. Test with network interruption
  2. Verify error state shows properly
  3. Verify retry works

- [ ] **Performance Test**
  1. Generate 1000+ token response
  2. Verify no memory leaks
  3. Verify smooth scrolling during stream

### After Modifications:

```bash
# Run these commands to verify no regressions:

# 1. Check TypeScript compilation
cd apps/vital-system && npx tsc --noEmit

# 2. Run the dev server
npm run dev

# 3. Test in browser with console open
# Look for [streamReducer] and [StreamingMessage] debug logs
```

---

## Debug Logging

The following debug logs are enabled in development:

```typescript
// streamReducer.ts - First 5 tokens logged
console.debug('[streamReducer] CONTENT_APPEND:', {
  incoming: action.payload.content,
  currentLength: state.content.length,
  tokenCount: state.contentTokens + 1,
});

// StreamingMessage.tsx - First 5 renders logged
console.debug('[StreamingMessage] render:', {
  status: state.status,
  contentLength: state.content.length,
  isStreaming,
});
```

Use these to diagnose streaming issues.

---

## Session Progress (December 15, 2025)

### Commits Made:

1. `af665e23` - feat: Add header actions context and UI improvements
   - Added HeaderActionsContext for page→header injection
   - Added flushSync for real-time streaming
   - Added _updateTrigger to streamReducer
   - Fixed VitalThinking expansion

2. `0a27fc61` - fix: Breadcrumb alignment and use Lucide icons
   - Fixed breadcrumb vertical alignment
   - Added Bot/Circle Lucide icons for agent header

3. `b0c6868b` - fix: Breadcrumb separator vertical alignment
   - Added inline-flex items-center to BreadcrumbSeparator

### Current Working State:

- ✅ Token-by-token streaming working
- ✅ Real-time reasoning display working
- ✅ VitalThinking expandable
- ✅ Expert info in header row
- ✅ Breadcrumb alignment fixed
- ✅ Lucide icons for agent avatar

---

## Contact

For streaming issues, check:
1. This document first
2. Backend logs for SSE errors
3. Browser console for frontend errors
4. Network tab for SSE connection status
