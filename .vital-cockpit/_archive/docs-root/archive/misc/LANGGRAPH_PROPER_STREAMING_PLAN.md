# 🎯 **LANGGRAPH PROPER STREAMING IMPLEMENTATION PLAN**

**Issue**: Current implementation uses `workflow.execute()` (non-streaming) instead of LangGraph's `astream()` method

**Goal**: Implement proper LangGraph streaming using official LangChain/LangGraph streaming API

---

## **📋 CURRENT STATE (BROKEN)**

### **Backend** (`services/ai-engine/src/main.py` line 874):
```python
# ❌ CURRENT: Non-streaming execution
result = await workflow.execute(
    tenant_id=tenant_id,
    query=request.message,
    selected_agents=[request.agent_id],
    # ...
)

# Returns complete result after workflow finishes
return Mode1ManualResponse(
    content=content,
    citations=citations,
    # ...
)
```

**Problem**: This waits for the entire workflow to complete before returning anything. No streaming!

---

## **✅ TARGET STATE (PROPER STREAMING)**

### **Using LangGraph's Built-in Streaming**:

```python
# ✅ NEW: Proper LangGraph streaming
async for chunk in workflow.graph.astream(
    state_dict,
    stream_mode=["updates", "messages", "custom"]  # Multiple modes!
):
    # Emit events to frontend via SSE
    yield chunk
```

---

## **🔧 IMPLEMENTATION STEPS**

### **Step 1: Modify Mode1ManualWorkflow to Support Streaming**

**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

#### **Change 1.1: Add `get_stream_writer` to Nodes**

```python
from langgraph.config import get_stream_writer  # Add import

@trace_node("mode1_rag_retrieval")
async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """RAG retrieval with streaming updates"""
    writer = get_stream_writer()  # ✅ NEW: Get streaming writer
    
    # Emit workflow step event
    writer({
        "type": "workflow_step",
        "step": {
            "id": "rag-retrieval",
            "name": "RAG Retrieval",
            "description": "Searching knowledge base",
            "status": "running",
            "progress": 0
        }
    })
    
    # Emit reasoning event
    writer({
        "type": "langgraph_reasoning",
        "step": {
            "type": "thought",
            "content": f"Searching {len(selected_rag_domains)} domains for evidence",
            "confidence": 0.85,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    })
    
    # ... do RAG retrieval ...
    
    # Emit completion
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

#### **Change 1.2: Add Streaming to Execute Agent Node**

```python
@trace_node("mode1_execute")
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Execute agent with streaming token output"""
    writer = get_stream_writer()  # ✅ NEW
    
    # Emit workflow step
    writer({
        "type": "workflow_step",
        "step": {
            "id": "agent-execution",
            "name": "Agent Execution",
            "status": "running",
            "progress": 0
        }
    })
    
    # Emit reasoning
    writer({
        "type": "langgraph_reasoning",
        "step": {
            "type": "action",
            "content": "Generating response with inline citations",
            "confidence": 0.90
        }
    })
    
    # ... execute agent ...
    
    # Emit completion
    writer({
        "type": "workflow_step",
        "step": {
            "id": "agent-execution",
            "status": "completed",
            "progress": 100
        }
    })
    
    return state
```

---

### **Step 2: Modify API Handler to Use `astream()`**

**File**: `services/ai-engine/src/main.py` (replace lines 842-976)

```python
@app.post("/api/mode1/manual")
async def execute_mode1_manual_streaming(
    request: Mode1ManualRequest,
    fastapi_request: Request,
    tenant_id: str = Depends(get_tenant_id)
):
    """
    Execute Mode 1 with proper LangGraph streaming.
    
    Uses:
    - stream_mode=["updates", "messages", "custom"]
    - SSE (Server-Sent Events) for real-time updates
    """
    
    async def event_generator():
        """Generate SSE events from LangGraph stream"""
        try:
            # Initialize workflow
            workflow = Mode1ManualWorkflow(
                supabase_client=supabase_client,
                rag_service=unified_rag_service,
                agent_orchestrator=agent_orchestrator,
            )
            await workflow.initialize()
            
            # Build initial state
            state_dict = {
                "query": request.message,
                "selected_agents": [request.agent_id],
                "tenant_id": tenant_id,
                "user_id": request.user_id,
                "session_id": request.session_id,
                "enable_rag": request.enable_rag,
                "enable_tools": request.enable_tools,
                "selected_rag_domains": request.selected_rag_domains or [],
                "requested_tools": request.requested_tools or [],
                "model": request.model or "gpt-4",
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "conversation_history": request.conversation_history or [],
            }
            
            # ✅ NEW: Stream with multiple modes
            async for stream_mode, chunk in workflow.graph.astream(
                state_dict,
                stream_mode=["updates", "messages", "custom"],  # Multiple modes!
                config={"configurable": {"thread_id": request.session_id or "default"}}
            ):
                # Format event for SSE
                event_data = {
                    "stream_mode": stream_mode,
                    "data": chunk
                }
                
                # Emit SSE event
                yield f"data: {json.dumps(event_data)}\n\n"
                
        except Exception as e:
            logger.error(f"❌ Streaming error: {e}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    # Return SSE response
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
```

---

### **Step 3: Update Frontend Event Parser**

**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

The frontend is already set up to parse SSE events! We just need to handle the new format:

```typescript
// Current event parsing (lines 1143-1305)
for (const line of lines) {
  if (line.startsWith('data: ')) {
    const data = JSON.parse(line.slice(6));
    
    // ✅ NEW: Handle LangGraph streaming modes
    if (data.stream_mode === 'custom') {
      // Custom events (workflow steps, reasoning)
      const event = data.data;
      
      if (event.type === 'workflow_step') {
        setWorkflowSteps(prev => {
          const existing = prev.find(s => s.id === event.step.id);
          if (existing) {
            return prev.map(s => s.id === event.step.id ? { ...s, ...event.step } : s);
          }
          return [...prev, event.step];
        });
      }
      
      if (event.type === 'langgraph_reasoning') {
        setReasoningSteps(prev => [...prev, event.step]);
      }
    }
    
    if (data.stream_mode === 'messages') {
      // LLM token streaming
      const token = data.data;
      if (token.content_blocks) {
        for (const block of token.content_blocks) {
          if (block.type === 'text') {
            setStreamingMessage(prev => prev + block.text);
          }
        }
      }
    }
    
    if (data.stream_mode === 'updates') {
      // Node completion updates
      console.log('Node completed:', data.data);
    }
  }
}
```

---

## **📊 STREAMING MODES EXPLAINED**

### **Mode 1: `updates`** - Node-level progress
```python
# Emits after each node completes
{
  "stream_mode": "updates",
  "data": {
    "rag_retrieval_node": {
      "retrieved_documents": [...],
      "context_summary": "..."
    }
  }
}
```

### **Mode 2: `messages`** - Token-level streaming
```python
# Emits each LLM token as it's generated
{
  "stream_mode": "messages",
  "data": {
    "content_blocks": [
      {"type": "text", "text": "The"}
    ]
  }
}
{
  "stream_mode": "messages",
  "data": {
    "content_blocks": [
      {"type": "text", "text": " FDA"}
    ]
  }
}
```

### **Mode 3: `custom`** - Custom events
```python
# Emits custom events via get_stream_writer()
{
  "stream_mode": "custom",
  "data": {
    "type": "workflow_step",
    "step": {
      "id": "rag-retrieval",
      "name": "RAG Retrieval",
      "status": "running",
      "progress": 50
    }
  }
}
```

---

## **🎯 EXPECTED RESULT**

### **User sends message** →

1. **Frontend connects to SSE endpoint**
2. **Backend starts streaming immediately**:
   ```
   data: {"stream_mode":"custom","data":{"type":"workflow_step","step":{...}}}
   data: {"stream_mode":"custom","data":{"type":"langgraph_reasoning","step":{...}}}
   data: {"stream_mode":"messages","data":{"content_blocks":[{"type":"text","text":"The"}]}}
   data: {"stream_mode":"messages","data":{"content_blocks":[{"type":"text","text":" FDA"}]}}
   data: {"stream_mode":"updates","data":{"rag_retrieval_node":{...}}}
   ```
3. **Frontend parses and displays**:
   - Workflow steps update in "Show AI Reasoning"
   - Reasoning steps appear in real-time
   - Text streams word-by-word
4. **Stream completes** → Final message saved

---

## **⚡ IMPLEMENTATION PRIORITY**

### **Phase 1 (CRITICAL - 2-3 hours)**:
1. ✅ Add `get_stream_writer()` to Mode1ManualWorkflow nodes
2. ✅ Modify `/api/mode1/manual` to use `astream()`
3. ✅ Update frontend event parser for new format
4. ✅ Test basic streaming

### **Phase 2 (IMPORTANT - 1-2 hours)**:
1. ✅ Add LLM token streaming (stream_mode="messages")
2. ✅ Add metrics events
3. ✅ Polish UX

### **Phase 3 (NICE-TO-HAVE - 1 hour)**:
1. ✅ Add to Mode 2, 3, 4
2. ✅ Add pause/resume controls
3. ✅ Add replay functionality

---

## **🚀 NEXT STEPS**

**Option A**: Implement Phase 1 now (2-3 hours)
**Option B**: Create detailed implementation files first
**Option C**: Test with a minimal example first

Which would you prefer?

---

**END OF DOCUMENT**

