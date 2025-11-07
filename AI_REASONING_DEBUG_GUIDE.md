# 🐛 **AI REASONING NOT EXPANDING - DEBUGGING**

**Issue**: "Show AI Reasoning" button appears but doesn't expand when clicked

---

## **🔍 ROOT CAUSE INVESTIGATION**

### **Potential Issues**:

1. **Metadata Not Reaching Component**
   - The `metadata` prop may not contain `reasoning`, `workflowSteps`, or `reasoningSteps`
   - The condition `{!isUser && (metadata?.reasoning || metadata?.workflowSteps || metadata?.reasoningSteps)}` evaluates to false

2. **Backend Not Emitting Events**
   - The Python AI Engine may not be sending LangGraph streaming events
   - Events are sent but not in the expected format

3. **Event Parsing Issue**
   - The frontend is receiving events but not parsing them correctly
   - The event handler in `handleSend` is not updating the state

---

## **✅ DEBUG LOGGING ADDED**

### **File**: `EnhancedMessageDisplay.tsx` (Lines 475-488)

```typescript
// ✅ DEBUG: Log metadata to understand what's available
useEffect(() => {
  if (!isUser && metadata) {
    console.log('🔍 [EnhancedMessageDisplay] Metadata check:', {
      hasReasoning: !!metadata.reasoning,
      reasoningLength: metadata.reasoning?.length,
      hasWorkflowSteps: !!metadata.workflowSteps,
      workflowStepsLength: metadata.workflowSteps?.length,
      hasReasoningSteps: !!metadata.reasoningSteps,
      reasoningStepsLength: metadata.reasoningSteps?.length,
      fullMetadata: metadata
    });
  }
}, [metadata, isUser]);
```

---

## **🧪 TESTING INSTRUCTIONS**

### **Step 1: Restart Servers**
```bash
# Terminal 1: Kill and restart AI Engine
lsof -ti :8080 | xargs kill -9
cd services/ai-engine
source venv/bin/activate
export PORT=8080
python src/main.py

# Terminal 2: Kill and restart Frontend
lsof -ti :3000 | xargs kill -9
cd apps/digital-health-startup
npm run dev
```

### **Step 2: Open Browser Console**
```bash
# Open http://localhost:3000/ask-expert
# Press F12 to open Developer Tools
# Go to Console tab
```

### **Step 3: Send a Message**
```bash
# 1. Select "Digital Therapeutic Advisor" from sidebar
# 2. Type any message (e.g., "What are the FDA requirements for DTx?")
# 3. Send
# 4. Watch console logs
```

### **Step 4: Check Console Output**

**Look for these logs**:

```javascript
// ✅ GOOD: Metadata is being logged
🔍 [EnhancedMessageDisplay] Metadata check: {
  hasReasoning: true,
  reasoningLength: 3,
  hasWorkflowSteps: true,
  workflowStepsLength: 3,
  hasReasoningSteps: true,
  reasoningStepsLength: 5,
  fullMetadata: {...}
}

// ❌ BAD: No metadata or all fields are false
🔍 [EnhancedMessageDisplay] Metadata check: {
  hasReasoning: false,
  reasoningLength: 0,
  hasWorkflowSteps: false,
  workflowStepsLength: 0,
  hasReasoningSteps: false,
  reasoningStepsLength: 0,
  fullMetadata: {...}
}
```

---

## **📊 DIAGNOSIS SCENARIOS**

### **Scenario A: No Console Logs at All**
**Problem**: Component not rendering or debug code not running
**Solution**:
1. Check if page loaded correctly
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Check browser console for errors

---

### **Scenario B: Logs Show All False**
**Problem**: Metadata not being passed or events not parsed
**Solution**:

#### **Check 1: Are SSE Events Being Received?**
```javascript
// Look for these in console:
data: {"type":"workflow_step",...}
data: {"type":"langgraph_reasoning",...}
data: {"type":"metrics",...}
```

**If YES** → Event parsing issue (see Fix A)
**If NO** → Backend not emitting (see Fix B)

---

### **Fix A: Event Parsing Issue**

**File**: `ask-expert/page.tsx` (Lines 1271-1305)

Check if these event handlers are being triggered:

```typescript
// Add console.log to debug
case 'workflow_step': {
  console.log('✅ Received workflow_step event:', meta.step);  // ADD THIS
  const step = meta.step || {};
  setWorkflowSteps(prev => {
    // ...
  });
  break;
}

case 'langgraph_reasoning': {
  console.log('✅ Received langgraph_reasoning event:', meta.step);  // ADD THIS
  const reasoningStep = meta.step || {};
  // ...
  break;
}
```

**If logs appear** → Events are being parsed, check state updates
**If no logs** → Check event type string (maybe it's `workflowStep` not `workflow_step`)

---

### **Fix B: Backend Not Emitting**

**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

Check if backend is emitting events:

```python
from langgraph.config import get_stream_writer

async def rag_retrieval_node(state: UnifiedWorkflowState) -> Dict[str, Any]:
    """RAG retrieval node"""
    writer = get_stream_writer()
    
    # ✅ Add this to emit workflow step
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
    
    print("✅ [DEBUG] Emitted workflow step event")  # Add this
    
    # ... rest of code ...
    
    # Emit reasoning
    writer({
        "type": "langgraph_reasoning",
        "step": {
            "type": "thought",
            "content": f"Searching {len(selected_rag_domains)} domains",
            "confidence": 0.85
        }
    })
    
    print("✅ [DEBUG] Emitted reasoning event")  # Add this
    
    return state
```

**Check AI Engine terminal** for these logs:
```
✅ [DEBUG] Emitted workflow step event
✅ [DEBUG] Emitted reasoning event
```

**If logs appear** → Backend is emitting, frontend not receiving (check API route)
**If no logs** → Backend not emitting (add emission code)

---

### **Scenario C: Logs Show Data, But Button Doesn't Work**
**Problem**: Button click handler not working or component not re-rendering
**Solution**:

#### **Test 1: Check Button State**
```javascript
// In browser console, run:
document.querySelector('[data-reasoning-button]');

// Should return the button element
// If null → button not rendered
```

#### **Test 2: Manually Toggle State**
Open React DevTools → Find `EnhancedMessageDisplay` component → Check `showReasoning` state

#### **Test 3: Check AnimatePresence**
The collapsible content uses `AnimatePresence` from Framer Motion. Check if:
1. Framer Motion is installed
2. No console errors related to animations

---

## **🚀 QUICK FIXES**

### **Quick Fix 1: Force Reasoning to Open**
```typescript
// In EnhancedMessageDisplay.tsx, line 464:
const [showReasoning, setShowReasoning] = useState(true);  // Change false to true
```

This will force the reasoning section to be open by default. If content appears, then the issue is with the button click handler. If content still doesn't appear, the issue is with the condition or data.

---

### **Quick Fix 2: Remove Condition (Test Only)**
```typescript
// Line 854 - Temporarily remove condition
{!isUser && (
  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
    <Button onClick={() => setShowReasoning(!showReasoning)}>
      Show AI Reasoning
    </Button>
    {showReasoning && (
      <div>
        <p>Reasoning section is working!</p>
        <p>Has metadata: {!!metadata ? 'YES' : 'NO'}</p>
        <p>Has reasoning: {!!metadata?.reasoning ? 'YES' : 'NO'}</p>
        <p>Has workflow: {!!metadata?.workflowSteps ? 'YES' : 'NO'}</p>
      </div>
    )}
  </div>
)}
```

This will always show the reasoning section. If it appears and works, then the issue is with the metadata not being passed correctly.

---

## **📞 NEXT STEPS**

1. ✅ **Restart servers** (see Step 1 above)
2. ✅ **Open browser console** (F12)
3. ✅ **Send a test message**
4. ✅ **Check console logs** for debug output
5. ✅ **Report back with**:
   - What console logs you see
   - Whether "Show AI Reasoning" button appears
   - Whether clicking it does anything
   - Any errors in console

---

**Once we see the console logs, we can pinpoint the exact issue and fix it!** 🎯

---

**END OF DOCUMENT**

