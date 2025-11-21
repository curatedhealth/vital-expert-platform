# Mode 1 Streaming Issue - Root Cause & Fix

## 🔴 **ROOT CAUSE**

The LLM calls in `mode1_manual_workflow.py` use `.ainvoke()` (non-streaming) instead of `.astream()`:

```python
# Line 555: With tools
tool_response = await llm_with_tools.ainvoke(messages)

# Line 594: With structured output  
response = await llm_with_structure.ainvoke(messages)

# Line 658: Fallback
fallback_response = await self.llm.ainvoke(messages)
```

This means:
- ✅ Workflow steps stream (`custom` mode works)
- ❌ LLM tokens don't stream (`messages` mode doesn't emit anything)
- ❌ Response arrives all at once, but LangGraph doesn't capture it for streaming

---

## 💡 **THE FIX**

We have **3 options**:

### **Option A: Manual Streaming in Node** (Quick, 30 min)
Stream tokens manually inside `execute_agent_node()` using `.astream()` and emit them via `writer()`.

**Pros**: 
- Direct control over streaming
- Works with structured output
- Can format chunks before emitting

**Cons**:
- More code in the node
- Need to handle chunks manually

### **Option B: Use LangGraph ReAct Agent** (Medium, 1-2 hours)
Replace the custom LLM call with `create_react_agent` from `langgraph.prebuilt`.

**Pros**:
- LangGraph handles streaming automatically
- Built-in tool execution
- Clean, minimal code

**Cons**:
- Harder to enforce custom citation format
- Less control over system prompt structure

### **Option C: Hybrid - Stream Regular, Fallback Structured** (Recommended, 1 hour)
- Use `.astream()` for regular responses (streams tokens)
- Use `.ainvoke()` with structured output as fallback (for guaranteed citations)
- Let prompt engineering enforce citations

**Pros**:
- Best UX (streaming tokens)
- Still gets citations via strong prompt
- Balanced complexity

---

## 🚀 **RECOMMENDED: Option C (Hybrid)**

### **Implementation**:

1. **Change `.ainvoke()` to `.astream()`** in all 3 locations
2. **Manually emit chunks** via `writer()` for LangGraph to capture
3. **Keep strong prompt** to enforce citations

### **Code Changes Needed**:

```python
# Instead of:
response = await self.llm.ainvoke(messages)
return {"agent_response": response.content, ...}

# Do this:
full_response = ""
async for chunk in self.llm.astream(messages):
    if hasattr(chunk, 'content') and chunk.content:
        full_response += chunk.content
        # No need to manually emit - LangGraph captures this automatically!

return {"agent_response": full_response, ...}
```

**Key Insight**: When using `stream_mode=["messages"]`, LangGraph automatically captures **any `.astream()` calls** made within nodes and emits them as `messages` mode events!

---

## 📋 **ACTION PLAN**

### **Step 1: Update `execute_agent_node()`** (20 min)
Replace all 3 `.ainvoke()` calls with `.astream()` pattern

### **Step 2: Test streaming** (10 min)
1. Restart AI Engine
2. Test Mode 1
3. Verify tokens stream word-by-word

### **Step 3: Verify citations** (10 min)
Check if inline `[1]`, `[2]` markers appear in response

### **Step 4: If citations missing** (20 min)
Strengthen system prompt further or add post-processing

---

## 🎯 **ESTIMATED TIME**: 1 hour total

**Current Status**: 
- ✅ JSON serialization fixed
- ✅ Workflow steps streaming
- ❌ LLM tokens not streaming (`.ainvoke()` issue)
- ⚠️ RAG returning 0 sources (separate issue)

**After Fix**:
- ✅ Full streaming chat completion
- ✅ Real-time tokens word-by-word
- ⚠️ Still need to fix RAG (domain mapping issue)

