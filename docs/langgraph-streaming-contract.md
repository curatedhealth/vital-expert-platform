# LangGraph Streaming Contract

**Version**: 1.0  
**Last Updated**: 2025-11-06  
**Status**: Production Standard

---

## 📋 **The Golden Rule**

> **Any content you want emitted via `messages` mode MUST be added to `state['messages']` array as an `AIMessage`.**

If you violate this rule, LangGraph will not emit your response, even if it's present in other state fields.

---

## 🎯 **Why This Matters**

**The Bug That Started It All**:

In November 2025, we spent 4 hours debugging why Mode 1 had:
- ❌ Empty chat completion
- ❌ Missing sources (totalSources: 0)
- ❌ Missing inline citations

**Root Cause**: We were returning `response` in state but **NOT adding AIMessage to messages array**.

**Result**: LangGraph's `messages` stream mode had nothing to emit → Frontend received empty content.

**The Fix**: Add `AIMessage(content=response)` to `state['messages']` → All three features worked instantly.

---

## 🏗️ **Stream Mode Matrix**

LangGraph supports three stream modes, each serving a different purpose:

| Mode | Purpose | Trigger | What It Emits | Use Case |
|------|---------|---------|---------------|----------|
| **`messages`** | Chat completions | `messages` array update | Complete messages when added to state | Primary user response |
| **`updates`** | State changes | Node completion | Full state diff after each node | Metadata, sources, progress |
| **`custom`** | Custom events | `writer()` calls | Custom events you explicitly emit | Reasoning steps, tool calls, debug info |

---

## 🔄 **The Correct Pattern**

### **✅ CORRECT: Full Streaming Setup**

```python
from langchain_core.messages import AIMessage

async def format_output_node(self, state: UnifiedWorkflowState):
    """
    Final node that formats and returns the complete response.
    
    This pattern ensures:
    1. LangGraph emits via messages mode (AIMessage in array)
    2. Frontend receives response content (response field)
    3. Frontend receives sources (sources field)
    4. Frontend receives inline citations (citations field)
    """
    # 1. Extract response
    agent_response = state.get('agent_response', '')
    
    # 2. Format citations
    final_citations = self._format_citations(state.get('sources', []))
    
    # 3. ✅ ADD AIMESSAGE TO MESSAGES ARRAY
    # This is CRITICAL - without this, LangGraph won't emit!
    current_messages = state.get('messages', [])
    current_messages.append(AIMessage(content=agent_response))
    
    # 4. Return complete state
    return {
        **state,
        'messages': current_messages,    # ← LangGraph streaming (messages mode)
        'response': agent_response,      # ← Business logic
        'sources': state.get('sources'), # ← Frontend display
        'citations': final_citations     # ← Inline references
    }
```

---

### **❌ WRONG: Missing AIMessage**

```python
async def format_output_node(self, state: UnifiedWorkflowState):
    """
    BAD PATTERN: This will NOT stream to frontend!
    """
    agent_response = state.get('agent_response', '')
    
    # ❌ NOT updating messages array
    return {
        **state,
        'response': agent_response,  # ✅ Set, but LangGraph won't emit it
        'sources': [...]             # ✅ Set, but not streamed
        # ❌ 'messages' array not updated → LangGraph silent!
    }
```

**Result**: Frontend receives nothing because LangGraph's `messages` mode has nothing to emit.

---

## 🛡️ **Using the StreamingNodeMixin**

To enforce this pattern automatically, use the provided mixin:

```python
from langgraph_workflows.mixins import StreamingNodeMixin

class Mode1Workflow(StreamingNodeMixin):
    """Mode 1 workflow with enforced streaming contract."""
    
    async def format_output_node(self, state: UnifiedWorkflowState):
        """
        Use _complete_with_message() to guarantee correct streaming.
        """
        return self._complete_with_message(
            state,
            response=state.get('agent_response', ''),
            sources=state.get('sources', []),
            citations=self._format_citations(state.get('sources', [])),
            confidence=state.get('confidence', 0.0)
        )
```

**What `_complete_with_message()` does**:
1. ✅ Validates response is not empty
2. ✅ Adds AIMessage to `messages` array
3. ✅ Returns response, sources, citations in state
4. ✅ Includes metadata (confidence, status, etc.)
5. ✅ Logs streaming confirmation

---

## 🧪 **Contract Testing**

Every workflow MUST pass these tests:

```python
from langgraph_workflows.mixins import validate_workflow_state

def test_mode1_streaming_contract():
    """Ensure Mode 1 follows streaming contract."""
    # Run workflow
    state = await mode1_workflow.run(...)
    
    # Validate contract
    results = validate_workflow_state(state)
    
    # ✅ All checks must pass
    assert results['has_messages_array'] is True
    assert results['last_is_aimessage'] is True
    assert results['has_response'] is True
    assert results['has_sources'] is True
    assert results['response_not_empty'] is True
```

**Run contract tests**:
```bash
pytest services/ai-engine/tests/test_streaming_contract.py -v
```

---

## 📊 **State Structure Reference**

### **Required Fields for Streaming**

```python
{
    # ✅ CRITICAL: Messages array with AIMessage
    'messages': [
        HumanMessage(content="User query"),
        AIMessage(content="Agent response with [1] citations")
    ],
    
    # ✅ Response content
    'response': "Agent response with [1] citations",
    'agent_response': "Agent response with [1] citations",  # Alias
    
    # ✅ Sources for display
    'sources': [
        {
            'id': 'source-1',
            'number': 1,
            'title': 'FDA Guidance on SaMD',
            'url': 'https://fda.gov/samd',
            'excerpt': 'Software as a Medical Device...',
            'domain': 'regulatory-affairs',
            'similarity': 0.92,
            'metadata': {...}
        }
    ],
    
    # ✅ Citations for inline references
    'citations': [
        {
            'number': 1,
            'id': 'source-1',
            'title': 'FDA Guidance on SaMD',
            'url': 'https://fda.gov/samd',
            'excerpt': 'Software as a Medical Device...'
        }
    ],
    
    # ✅ Metadata
    'confidence': 0.92,
    'status': 'COMPLETED',
    'current_node': 'format_output'
}
```

---

## 🎓 **Understanding LangGraph Streaming**

### **How LangGraph Emits Events**

```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph Workflow                         │
│                                                               │
│  Node 1 (RAG)      Node 2 (Agent)      Node 3 (Format)      │
│      │                  │                    │                │
│      │                  │                    │                │
│      │                  │     ┌──────────────┴──────────┐    │
│      │                  │     │ Update state:           │    │
│      │                  │     │ messages.append(        │    │
│      │                  │     │   AIMessage(content="") │    │
│      │                  │     │ )                       │    │
│      │                  │     └─────────────────────────┘    │
│      │                  │                    │                │
│      └──────────────────┴────────────────────┘                │
│                         │                                     │
│                    State Updates                              │
│                         │                                     │
│                         ▼                                     │
│              ┌─────────────────────┐                          │
│              │  Stream Modes:      │                          │
│              │                     │                          │
│              │  • messages:        │  ← Emits AIMessage       │
│              │    Triggered by     │     from messages[]      │
│              │    messages[]       │                          │
│              │    array update     │                          │
│              │                     │                          │
│              │  • updates:         │  ← Emits full state      │
│              │    Triggered by     │     diff after node      │
│              │    node completion  │                          │
│              │                     │                          │
│              │  • custom:          │  ← Emits writer() calls  │
│              │    Triggered by     │                          │
│              │    writer()         │                          │
│              └─────────────────────┘                          │
│                         │                                     │
│                         ▼                                     │
│                   SSE Stream                                  │
│                         │                                     │
│                         ▼                                     │
│                    Frontend                                   │
└─────────────────────────────────────────────────────────────┘
```

### **Key Insight**

LangGraph's `messages` mode is **declarative**, not **imperative**:

- ❌ **Imperative** (doesn't work): "Emit this content" → `writer(chunk)`
- ✅ **Declarative** (works): "Update the messages array" → LangGraph detects and emits

---

## 🐛 **Debugging Checklist**

If your workflow isn't streaming:

### **Level 1: State Validation**

```bash
# Check AI Engine logs for state validation
tail -f /tmp/ai-engine.log | grep "StreamingMixin"
```

**Look for**:
- ✅ `"Added AIMessage to state"` (good)
- ❌ `"Validation failed: messages array is empty"` (bad)
- ❌ `"Validation failed: last message is not AIMessage"` (bad)

---

### **Level 2: LangGraph Emission**

```bash
# Check for LangGraph stream events
tail -f /tmp/ai-engine.log | grep -E "stream_mode|emitting"
```

**Look for**:
- ✅ `stream_mode: messages, data: {...}` (good)
- ❌ `stream_mode: updates only, no messages` (bad)

---

### **Level 3: Frontend Parsing**

```javascript
// Check browser console
console.log('Content length:', message.content.length);
console.log('Sources count:', metadata.sources?.length);
```

**Look for**:
- ✅ `Content length: 2500` (good)
- ❌ `Content length: 0` (bad - check backend)

---

## 🚀 **Applying to All Modes**

This pattern applies to **all four modes**:

### **Mode 1: Manual Interactive**
```python
class Mode1Workflow(StreamingNodeMixin):
    async def format_output_node(self, state):
        return self._complete_with_message(state, ...)
```

### **Mode 2: Automatic Interactive**
```python
class Mode2Workflow(StreamingNodeMixin):
    async def format_output_node(self, state):
        return self._complete_with_message(state, ...)
```

### **Mode 3: Manual Autonomous**
```python
class Mode3Workflow(StreamingNodeMixin):
    async def format_output_node(self, state):
        return self._complete_with_message(state, ...)
```

### **Mode 4: Automatic Autonomous**
```python
class Mode4Workflow(StreamingNodeMixin):
    async def format_output_node(self, state):
        return self._complete_with_message(state, ...)
```

**Consistency is key** - same pattern across all modes prevents bugs.

---

## 📚 **Additional Resources**

- **Mixin Implementation**: `services/ai-engine/src/langgraph_workflows/mixins/streaming.py`
- **Contract Tests**: `services/ai-engine/tests/test_streaming_contract.py`
- **Root Cause Analysis**: `MODE1_STREAMING_COMPREHENSIVE_ANALYSIS.md`
- **Test Guide**: `MODE1_FINAL_TEST_GUIDE.md`

---

## 🎯 **Summary**

1. **Always** add `AIMessage` to `state['messages']` array
2. **Use** `StreamingNodeMixin._complete_with_message()` for consistency
3. **Test** with `validate_workflow_state()` before deployment
4. **Monitor** AI Engine logs for streaming confirmation
5. **Apply** same pattern to all four modes

**Remember**: LangGraph is opinionated - follow its patterns, don't fight them! 🚀

