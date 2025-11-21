# 🔄 **LANGGRAPH STREAMING & AI REASONING - FIX PLAN**

**Date**: November 6, 2025
**Status**: 🔍 ROOT CAUSE IDENTIFIED
**Priority**: 🔴 HIGH (Core UX feature missing)

---

## **🐛 ROOT CAUSE ANALYSIS**

### **What's Broken**:
❌ LangGraph streaming components exist but are NOT connected to the main Ask Expert page
❌ Backend is sending SSE events but frontend is NOT consuming them
❌ AI reasoning and workflow progress are NOT displayed to users

---

### **What EXISTS (But Not Used)**:

#### **1. Backend Streaming** ✅ (Working)
**File**: `apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts`
**Lines**: 84-150

```typescript
// Backend IS sending SSE events:
for await (const event of langGraphStream) {
  // Stream workflow state updates
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  
  // Stream chunks
  if (event.state?.streamedChunks) {
    for (const chunk of event.state.streamedChunks) {
      const chunkEvent = {
        type: 'chunk',
        content: chunk,
        timestamp: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkEvent)}\n\n`));
    }
  }
}
```

**Event Types Being Sent**:
- `type: 'chunk'` - Text content chunks
- `type: 'workflow_step'` - LangGraph node execution
- `type: 'reasoning'` - AI thinking steps
- `type: 'done'` - Stream complete
- `type: 'error'` - Errors

---

#### **2. Frontend Components** ✅ (Exist)
**Components Available**:
- `AdvancedStreamingWindow` - Shows workflow steps + reasoning + metrics
- `Reasoning` / `ReasoningTrigger` / `ReasoningContent` - Collapsible AI reasoning
- `StreamingResponse` - Progressive text reveal
- `useLangGraphOrchestration` - Hook with SSE event handlers

---

#### **3. The Disconnect** ❌ (Problem)
**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

**Current State**:
```typescript
// ❌ NOT using AdvancedStreamingWindow
// ❌ NOT consuming SSE events
// ❌ NOT showing reasoning
// ❌ Only showing final response in EnhancedMessageDisplay

// Current flow:
const handleSend = async () => {
  const response = await fetch('/api/ask-expert/orchestrate', {
    method: 'POST',
    body: JSON.stringify(...)
  });
  
  // ❌ Only reads final response, ignores streaming events
  const reader = response.body?.getReader();
  // ... basic chunk reading, no event parsing
};
```

---

## **📋 FIX PLAN (3-4 Hours)**

### **Phase 1: Connect SSE Event Source** (1 hour)
**Goal**: Parse and consume SSE events from `/api/ask-expert/orchestrate`

**Tasks**:
1. ✅ Replace `fetch()` + `getReader()` with `EventSource` for proper SSE handling
2. ✅ Parse `data:` prefixed JSON events
3. ✅ Handle different event types (`chunk`, `workflow_step`, `reasoning`, `done`, `error`)
4. ✅ Store events in React state

**Implementation**:
```typescript
// Add to ask-expert/page.tsx
const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
const [streamingMetrics, setStreamingMetrics] = useState<StreamingMetrics | null>(null);

const handleSend = async () => {
  setIsStreaming(true);
  
  // Initialize EventSource for SSE
  const eventSource = new EventSource('/api/ask-expert/orchestrate');
  
  eventSource.addEventListener('message', (e) => {
    const event = JSON.parse(e.data);
    
    switch (event.type) {
      case 'chunk':
        // Append to current message content
        setStreamingContent(prev => prev + event.content);
        break;
        
      case 'workflow_step':
        // Update workflow progress
        setWorkflowSteps(prev => {
          const existing = prev.find(s => s.id === event.step.id);
          if (existing) {
            return prev.map(s => s.id === event.step.id ? event.step : s);
          }
          return [...prev, event.step];
        });
        break;
        
      case 'reasoning':
        // Add reasoning step
        setReasoningSteps(prev => [...prev, event.step]);
        break;
        
      case 'done':
        // Finalize message
        setIsStreaming(false);
        eventSource.close();
        break;
        
      case 'error':
        // Handle error
        setError(event.message);
        setIsStreaming(false);
        eventSource.close();
        break;
    }
  });
  
  eventSource.onerror = () => {
    setIsStreaming(false);
    eventSource.close();
  };
};
```

---

### **Phase 2: Display Streaming Components** (1 hour)
**Goal**: Show `AdvancedStreamingWindow` and live reasoning

**Tasks**:
1. ✅ Import `AdvancedStreamingWindow`
2. ✅ Conditionally render above messages when `isStreaming === true`
3. ✅ Pass `workflowSteps`, `reasoningSteps`, `streamingMetrics` as props
4. ✅ Add collapsible reasoning section

**Implementation**:
```typescript
// Add to ask-expert/page.tsx JSX
<div className="flex-1 flex flex-col overflow-hidden">
  {/* ✅ NEW: Streaming Window */}
  {isStreaming && (
    <div className="px-6 pt-4">
      <AdvancedStreamingWindow
        workflowSteps={workflowSteps}
        reasoningSteps={reasoningSteps}
        metrics={streamingMetrics}
        isStreaming={isStreaming}
        canPause={false}
      />
    </div>
  )}
  
  {/* Messages */}
  <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
    {messages.map(msg => (
      <EnhancedMessageDisplay key={msg.id} {...msg} />
    ))}
    
    {/* ✅ NEW: Live streaming message */}
    {isStreaming && streamingContent && (
      <div className="mb-6">
        <EnhancedMessageDisplay
          id="temp-streaming"
          role="assistant"
          content={streamingContent}
          isStreaming={true}
          agentName={selectedAgent?.name}
          agentAvatar={selectedAgent?.avatar_url}
        />
      </div>
    )}
  </div>
</div>
```

---

### **Phase 3: Backend Event Enhancements** (1 hour)
**Goal**: Ensure backend sends rich workflow and reasoning events

**Tasks**:
1. ✅ Check `mode1_manual_workflow.py` for workflow step emissions
2. ✅ Add `workflow_step` events for each LangGraph node
3. ✅ Add `reasoning` events for agent thinking
4. ✅ Add `metrics` events for token usage

**Implementation** (Python):
```python
# In mode1_manual_workflow.py

# ✅ Add at start of each node
async def rag_retrieval_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """RAG retrieval node with streaming"""
    writer = get_stream_writer()
    
    # ✅ Emit workflow step event
    writer({
        "type": "workflow_step",
        "step": {
            "id": "rag-retrieval",
            "name": "RAG Retrieval",
            "status": "running",
            "progress": 0
        }
    })
    
    # ✅ Emit reasoning event
    writer({
        "type": "reasoning",
        "step": {
            "id": f"reason-{uuid.uuid4()}",
            "type": "thought",
            "content": f"Searching {len(selected_rag_domains)} domains for relevant information",
            "confidence": 0.85
        }
    })
    
    # ... retrieval logic ...
    
    # ✅ Update workflow step to complete
    writer({
        "type": "workflow_step",
        "step": {
            "id": "rag-retrieval",
            "status": "completed",
            "progress": 100
        }
    })
    
    return state
```

---

### **Phase 4: Testing & Polish** (1 hour)
**Goal**: Verify streaming works end-to-end

**Tasks**:
1. ✅ Test Mode 1 streaming with real agent
2. ✅ Verify workflow steps appear in real-time
3. ✅ Verify reasoning shows AI thinking
4. ✅ Verify text streams progressively
5. ✅ Add loading states and error handling

---

## **🎯 EXPECTED UX AFTER FIX**

### **Before** (Current):
```
User sends message
  ↓
[Loading spinner]
  ↓
Complete response appears instantly
```

### **After** (Fixed):
```
User sends message
  ↓
┌─────────────────────────────────────┐
│ 🔄 AI Processing...                 │
│                                      │
│ ✅ RAG Retrieval (Completed)        │
│ ⏳ Agent Execution (Running...)     │
│ ⏸️ Tool Execution (Pending)          │
│                                      │
│ 💭 Reasoning:                        │
│ "Analyzing 2 domains for evidence"  │
│ "Found 10 sources, filtering..."    │
│                                      │
│ ⚡ 45 tokens/sec | 2.3s elapsed     │
└─────────────────────────────────────┘
  ↓
[Text streams word-by-word with inline citations]
  ↓
Complete response with sources
```

---

## **📁 FILES TO MODIFY**

| File | Changes | Time |
|------|---------|------|
| `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` | Add SSE handling + streaming components | 1.5 hours |
| `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py` | Add workflow/reasoning events | 1 hour |
| `apps/digital-health-startup/src/app/api/ask-expert/orchestrate/route.ts` | Verify event format | 30 min |
| `apps/digital-health-startup/src/features/ask-expert/components/AdvancedStreamingWindow.tsx` | Polish UI (optional) | 30 min |

**Total**: ~3.5 hours

---

## **🔧 QUICK FIXES (If Short on Time)**

### **Minimal Fix** (1 hour):
1. Use existing `useLangGraphOrchestration` hook (it already has SSE handling!)
2. Just add `<AdvancedStreamingWindow>` to the page
3. Skip backend enhancements

**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

```typescript
import { useLangGraphOrchestration } from '@/features/ask-expert/hooks/useLangGraphOrchestration';
import { AdvancedStreamingWindow } from '@/features/ask-expert/components/AdvancedStreamingWindow';

function AskExpertPageContent() {
  // ✅ Use existing hook!
  const {
    workflowSteps,
    reasoningSteps,
    metrics,
    isStreaming,
    sendQuery,
    response
  } = useLangGraphOrchestration();
  
  const handleSend = async () => {
    // ✅ Use hook's sendQuery instead of manual fetch
    await sendQuery({
      message: messageContent,
      mode: 'mode1',
      agentId: selectedAgent?.id,
      // ...
    });
  };
  
  return (
    <div className="flex-1 flex flex-col">
      {/* ✅ Add streaming window */}
      {isStreaming && (
        <AdvancedStreamingWindow
          workflowSteps={workflowSteps}
          reasoningSteps={reasoningSteps}
          metrics={metrics}
          isStreaming={isStreaming}
        />
      )}
      
      {/* Existing messages */}
      {/* ... */}
    </div>
  );
}
```

**Pros**:
- ✅ Uses existing, tested code
- ✅ Minimal changes (50 lines)
- ✅ Works immediately

**Cons**:
- ⚠️ Backend might not emit all events (need to verify)
- ⚠️ Hook might not match current API route structure

---

## **🚀 IMPLEMENTATION ORDER**

### **Step 1: Quick Win** (30 min)
1. Try using `useLangGraphOrchestration` hook
2. Add `<AdvancedStreamingWindow>` to page
3. Test if backend events are already flowing

### **Step 2: If Hook Works** (30 min)
1. Polish event handling
2. Add error states
3. Test thoroughly

### **Step 3: If Hook Doesn't Work** (2-3 hours)
1. Implement custom SSE handling (Phase 1)
2. Connect components (Phase 2)
3. Add backend events (Phase 3)
4. Test (Phase 4)

---

## **📊 SUCCESS METRICS**

After implementation, verify:
- ✅ **Workflow Steps**: Can see "RAG Retrieval", "Agent Execution", "Tool Execution" in real-time
- ✅ **Reasoning Steps**: Can see AI thinking ("Analyzing query", "Searching domains", etc.)
- ✅ **Progressive Text**: Response streams word-by-word, not all at once
- ✅ **Metrics**: Can see tokens/sec, elapsed time
- ✅ **Error Handling**: Errors display gracefully, don't break UI

---

## **📝 TESTING CHECKLIST**

### **Test 1: Basic Streaming**
```
Action: Send message "What are the FDA requirements for DTx?"
Expected:
- ✅ Streaming window appears
- ✅ Workflow steps update in real-time
- ✅ Text streams progressively
- ✅ Citations appear inline
- ✅ Sources collapse at bottom
```

### **Test 2: Reasoning Display**
```
Action: Send complex query requiring multi-step reasoning
Expected:
- ✅ Reasoning section shows AI thinking steps
- ✅ Steps are collapsible
- ✅ Confidence scores displayed
- ✅ Timestamps accurate
```

### **Test 3: Error Handling**
```
Action: Trigger error (invalid agent, network failure)
Expected:
- ✅ Error message displays clearly
- ✅ Streaming stops gracefully
- ✅ Can recover and try again
```

### **Test 4: Performance**
```
Action: Send 3 messages in rapid succession
Expected:
- ✅ No memory leaks
- ✅ EventSource connections close properly
- ✅ UI remains responsive
```

---

## **🎓 KEY LEARNINGS**

### **Why Streaming Wasn't Working**:
1. **Backend was sending events** ✅
2. **Frontend components existed** ✅
3. **But they were never connected** ❌

### **The Missing Link**:
- `useLangGraphOrchestration` hook exists but NOT used in main page
- `AdvancedStreamingWindow` component exists but NOT rendered
- `EventSource` / SSE parsing logic exists but NOT active

### **Solution**:
- Use existing `useLangGraphOrchestration` hook
- Render `AdvancedStreamingWindow` conditionally
- Connect the dots!

---

## **🎉 READY TO IMPLEMENT!**

**Recommended Approach**: Start with **Quick Fix** (Step 1)
- Try `useLangGraphOrchestration` first
- If it works → celebrate! 🎉
- If not → implement custom solution (Phase 1-4)

**Next Step**: Apply the Quick Fix to `ask-expert/page.tsx`

---

**END OF DOCUMENT**

