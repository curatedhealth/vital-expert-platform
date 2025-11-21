# 🎯 LangGraph Button Logic - Complete Explanation

## Overview

The **LangGraph Button** is a toggle in the chat input component that switches between two execution modes:
1. **Standard Mode** (`useLangGraph = false`) - Direct mode handlers (Mode 1, Mode 2, Mode 3, Mode 4)
2. **LangGraph Mode** (`useLangGraph = true`) - LangGraph workflow orchestration with state management

---

## 🎨 UI Component (Frontend)

### Location
`apps/digital-health-startup/src/components/prompt-input.tsx` (lines 368-382)

### Visual Appearance
```typescript
{/* LangGraph Toggle */}
<button
  onClick={() => onUseLangGraphChange(!useLangGraph)}
  className={useLangGraph
    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' // ON: Green gradient
    : 'bg-gray-200 dark:bg-gray-700 text-gray-300'               // OFF: Gray
  }
  title={useLangGraph 
    ? 'LangGraph: ON - Workflow orchestration with state management'
    : 'LangGraph: OFF - Standard mode'
  }
>
  <Sparkles className="w-3 h-3" />
  LangGraph
</button>
```

### State Management
- **Default**: `useLangGraph = false` (OFF by default)
- **State**: Stored in `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` (line 217)
- **Prop Flow**: `page.tsx` → `PromptInput` component → Button toggle

---

## 🔄 Request Flow

### Step 1: User Clicks Button
```typescript
// In prompt-input.tsx
onClick={() => onUseLangGraphChange(!useLangGraph)}
// ↓
// Updates state in page.tsx
setUseLangGraph(!useLangGraph)
```

### Step 2: User Sends Message
```typescript
// In page.tsx (line 932)
body: JSON.stringify({
  mode: mode,
  message: message,
  // ... other params
  useLangGraph: useLangGraph, // ← Flag sent to backend
})
```

### Step 3: API Route Decision
```typescript
// In apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts (line 88)

if (body.useLangGraph) {
  // ✅ LangGraph Mode: Use workflow orchestration
  const langGraphStream = streamLangGraphMode({
    mode: body.mode,
    agentId: body.agentId,
    message: body.message,
    // ... other params
  });
  
  // Stream LangGraph workflow updates
  for await (const chunk of langGraphStream) {
    controller.enqueue(encoder.encode(chunk));
  }
} else {
  // ❌ Standard Mode: Direct mode handlers
  switch (body.mode) {
    case 'manual':
      await executeMode1({ ... });
      break;
    case 'automatic':
      await executeMode2({ ... });
      break;
    // ... Mode 3 & 4
  }
}
```

---

## 📊 Two Execution Paths

### Path A: Standard Mode (`useLangGraph = false`)

```
User Input
    ↓
API Route (/api/ask-expert/orchestrate)
    ↓
Direct Mode Handler (executeMode1/2/3/4)
    ↓
Python AI Engine (FastAPI)
    ↓
Response
```

**Characteristics:**
- ✅ Direct execution
- ✅ Lower latency
- ✅ Simpler flow
- ❌ No state persistence
- ❌ No workflow visualization
- ❌ No memory management

---

### Path B: LangGraph Mode (`useLangGraph = true`)

```
User Input
    ↓
API Route (/api/ask-expert/orchestrate)
    ↓
LangGraph Mode Orchestrator (langgraph-mode-orchestrator.ts)
    ↓
    ├─ State Management (MemorySaver)
    ├─ Workflow Visualization
    ├─ Memory Integration
    ├─ Checkpointing
    └─ Mode Handler (executeMode1/2/3/4) ← Still calls Python AI Engine
        ↓
    Python AI Engine (FastAPI)
        ↓
    Response (with state updates)
```

**Characteristics:**
- ✅ State persistence across conversations
- ✅ Workflow visualization and tracking
- ✅ Memory management (long-term context)
- ✅ Human-in-the-loop checkpoints
- ✅ Error recovery
- ✅ Token tracking
- ⚠️ Slightly higher latency (state management overhead)
- ⚠️ More complex flow

---

## 🏗️ LangGraph Workflow Architecture

### State Definition
```typescript
// In langgraph-mode-orchestrator.ts
export const LangGraphModeState = Annotation.Root({
  // Input fields
  mode: Annotation<string>(),
  agentId: Annotation<string | undefined>(),
  message: Annotation<string>(),
  conversationHistory: Annotation<Array<...>>({
    reducer: (current, update) => update ?? current,
    default: () => []
  }),
  
  // Configuration
  enableRAG: Annotation<boolean>({ default: () => true }),
  enableTools: Annotation<boolean>({ default: () => false }),
  requestedTools: Annotation<string[] | undefined>(),
  
  // Execution state
  currentStep: Annotation<string>({ default: () => 'initializing' }),
  error: Annotation<string | undefined>(),
  
  // Response accumulation
  streamedChunks: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
  finalResponse: Annotation<string | undefined>(),
  
  // Workflow tracking
  startTime: Annotation<number>({ default: () => Date.now() }),
  endTime: Annotation<number | undefined>(),
  totalTokens: Annotation<number>({ default: () => 0 }),
  
  // Memory and checkpoints
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => []
  }),
});
```

### Workflow Graph
```typescript
// Simple 3-node workflow:
START → validateInput → executeMode → formatResponse → END
```

### Node: validateInput
- Validates input parameters
- Initializes state
- Sets up conversation history

### Node: executeMode
- Routes to appropriate mode handler (Mode 1, 2, 3, or 4)
- Still calls Python AI Engine via mode handlers
- Accumulates streamed chunks
- Tracks metadata

### Node: formatResponse
- Combines streamed chunks
- Adds metadata
- Returns final response

---

## 🔑 Key Differences

| Feature | Standard Mode | LangGraph Mode |
|---------|--------------|----------------|
| **Execution** | Direct mode handler → AI Engine | LangGraph workflow → Mode handler → AI Engine |
| **State Persistence** | ❌ No | ✅ Yes (MemorySaver) |
| **Workflow Tracking** | ❌ No | ✅ Yes (nodes, steps, timing) |
| **Memory Management** | ❌ Conversation history only | ✅ Long-term memory integration |
| **Checkpoints** | ❌ No | ✅ Human-in-the-loop support |
| **Error Recovery** | ❌ Basic | ✅ Advanced (state rollback) |
| **Token Tracking** | ❌ No | ✅ Yes (per step) |
| **Visualization** | ❌ No | ✅ Yes (workflow graph) |
| **Latency** | ⚡ Fast | ⚡⚡ Slightly slower (state overhead) |
| **Complexity** | 🟢 Simple | 🟡 Moderate |

---

## 🎯 When to Use LangGraph Mode

### ✅ Use LangGraph Mode When:
- You need **state persistence** across multiple conversations
- You want **workflow visualization** and tracking
- You need **long-term memory** integration
- You want **human-in-the-loop checkpoints**
- You need **error recovery** with state rollback
- You want **token tracking** per workflow step

### ❌ Use Standard Mode When:
- You want **fastest possible response** time
- You don't need **state persistence**
- You want **simpler debugging**
- You don't need **workflow visualization**
- You're doing **one-off queries**

---

## 🔍 Implementation Details

### Mode Handler Wrapping
**Important**: LangGraph mode **still calls the same mode handlers** (Mode 1, 2, 3, 4), but wraps them with:
- State management
- Workflow tracking
- Memory integration
- Checkpointing

```typescript
// In langgraph-mode-orchestrator.ts (line 144)
async function executeMode(state: LangGraphModeStateType) {
  switch (state.mode) {
    case 'manual': {
      // Still calls executeMode1, but with LangGraph state management
      const mode1Stream = executeMode1(config);
      // ... accumulate chunks with state tracking
    }
    case 'automatic': {
      // Still calls executeMode2, but with LangGraph state management
      const mode2Stream = executeMode2(config);
      // ... accumulate chunks with state tracking
    }
    // ... Mode 3 & 4
  }
}
```

### Golden Rule Compliance
✅ **Compliant**: LangGraph mode still follows the Golden Rule:
- **AI/ML calls** → Python AI Engine (FastAPI)
- **LangGraph** → Workflow orchestration layer only
- **Mode handlers** → Call Python AI Engine (unchanged)

---

## 📝 Summary

The **LangGraph Button** is a **toggle between two execution architectures**:

1. **Standard Mode** (OFF): Direct execution path → Fast, simple, no state
2. **LangGraph Mode** (ON): Workflow orchestration → State management, memory, tracking

Both modes **ultimately call the same Python AI Engine**, but LangGraph mode adds:
- State persistence
- Workflow visualization
- Memory management
- Checkpointing
- Error recovery

The button is **OFF by default** for backward compatibility and performance.

