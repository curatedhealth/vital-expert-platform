# AI Reasoning Streaming - Comprehensive Diagnostic Report

**Date**: 2025-11-07  
**Status**: ❌ CRITICAL ISSUE - NOT RESOLVED  
**For Review By**: Next Agent

---

## 🔴 PROBLEM STATEMENT

**AI Reasoning steps from LangGraph are NOT being displayed in the frontend**, despite multiple fix attempts. The frontend consistently shows:

```json
"reasoning": ["Thinking..."],  // ❌ Hardcoded placeholder
"reasoningSteps": 0,            // ❌ Empty array (should have 2-3 steps)
"sources": [],                  // ❌ Also empty (separate RAG issue)
```

**Expected Behavior:**
- Backend emits `reasoning_steps` array in LangGraph state
- Frontend receives them via SSE `updates` event
- `EnhancedMessageDisplay` renders them with Lucide icons
- Steps persist after streaming completes

**Actual Behavior:**
- Reasoning steps are **NEVER received** by the frontend
- Console logs show: `"Reasoning steps: 0"` and `"🧠 Reasoning array: Array(0)"`
- No `"✅ [Updates Mode] Found N reasoning steps from LangGraph"` log appears

---

## 📋 CONSOLE LOG ANALYSIS

### Key Evidence from Logs:

1. **During Streaming:**
   ```
   Has reasoning: 1
   "reasoning": ["Thinking..."]  ← Placeholder only
   Has sources: 0
   ```

2. **After Completion:**
   ```
   Reasoning steps: 0
   🧠 Reasoning array: Array(0)
   📚 Sources array: Array(0)
   ```

3. **Missing Log:**
   - **NEVER** see: `"✅ [Updates Mode] Found N reasoning steps from LangGraph"`
   - This indicates the frontend code to extract `reasoning_steps` is **either not running or the data is not in the expected location**

4. **SSE Events Received:**
   ```
   🔍 [SSE Debug] Received messages event  ← Text streaming (working)
   🔍 [SSE Debug] Received updates event    ← State updates (CHECK THIS!)
   ```

---

## 🔧 FIXES ATTEMPTED (All Failed)

### **Fix #1: Added `reasoning_steps` Extraction to Frontend**
**Location:** `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx` (lines 1501-1510)

**Code Added:**
```typescript
// ✅ FIX: Extract reasoning_steps from LangGraph state
if (actualState.reasoning_steps && Array.isArray(actualState.reasoning_steps)) {
  console.log(`✅ [Updates Mode] Found ${actualState.reasoning_steps.length} reasoning steps from LangGraph`);
  reasoningStepsBuffer = actualState.reasoning_steps;
  setReasoningSteps(actualState.reasoning_steps);
  setStreamingMeta(prev => ({
    ...prev,
    reasoningSteps: actualState.reasoning_steps
  }));
}
```

**Result:** ❌ **FAILED** - Log never appears, indicating `actualState.reasoning_steps` is `undefined` or empty

---

### **Fix #2: Updated Icons to Lucide React**
**Location:** `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx` (lines 1010-1025)

**Code Updated:**
```typescript
const getReasoningIcon = (type: string) => {
  switch (type) {
    case 'thought':
      return <Brain className="h-4 w-4 text-purple-600" />;
    case 'action':
      return <Zap className="h-4 w-4 text-blue-600" />;
    case 'observation':
      return <Eye className="h-4 w-4 text-green-600" />;
    case 'search':
      return <Search className="h-4 w-4 text-orange-600" />;
    case 'reflection':
      return <Lightbulb className="h-4 w-4 text-yellow-600" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};
```

**Result:** ❌ **IRRELEVANT** - This is for rendering, but there's no data to render

---

### **Fix #3: Created Shared AIReasoning Component**
**Location:** `packages/ai-components/src/components/AIReasoning.tsx`

**Purpose:** Extracted reasoning display logic for reuse across all modes

**Result:** ❌ **NOT YET USED** - Component exists but isn't integrated (not the root cause)

---

## 🔍 ROOT CAUSE ANALYSIS

### **Hypothesis 1: Backend Not Emitting `reasoning_steps`**

**Evidence:**
- Backend code (`mode1_manual_workflow.py`) shows `reasoning_steps` being added to state:
  - Line 291-313: `rag_retrieval_node` adds "observation" step
  - Line 364-377: `execute_agent_node` adds "thought" step
  - Line 827-840: `format_output_node` preserves steps

**Investigation Needed:**
1. Add debug logging in `mode1_manual_workflow.py` to confirm `reasoning_steps` are in final state
2. Check Python backend console for any errors during state emission
3. Verify SSE stream format - is `reasoning_steps` actually being sent?

**Backend Files to Check:**
```
services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
  - Line 312: return { 'reasoning_steps': reasoning_steps }
  - Line 552: 'reasoning_steps': reasoning_steps (in tool path)
  - Line 837: 'reasoning_steps': reasoning_steps (in final state)
```

---

### **Hypothesis 2: Frontend SSE Handler Not Processing Correctly**

**Evidence:**
- No log appears from the extraction code (line 1502-1503)
- This means either:
  a) `updates` event is not firing
  b) `actualState` doesn't contain `reasoning_steps`
  c) The extraction code is not being reached

**Investigation Needed:**
1. Add debug log **before** the `if` check to see what keys `actualState` has:
   ```typescript
   console.log('🔍 [Updates Debug] actualState keys:', Object.keys(actualState));
   console.log('🔍 [Updates Debug] reasoning_steps value:', actualState.reasoning_steps);
   ```
2. Check if `reasoning_steps` is nested differently (e.g., `actualState.metadata.reasoning_steps`)
3. Verify the `updates` event handler is actually firing

**Frontend Files to Check:**
```
apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx
  - Line 1424-1510: SSE updates event handler
  - Line 1434-1443: State unwrapping logic (CHECK IF THIS IS CORRECT!)
```

---

### **Hypothesis 3: Timing Issue - `reasoning_steps` Arrive After Final Message**

**Evidence:**
- The `updates` event might fire **multiple times**
- Maybe `reasoning_steps` are in a later `updates` event that we're not capturing

**Investigation Needed:**
1. Log **every** `updates` event, not just the first one
2. Check if multiple `updates` events contain different data
3. Verify the order of SSE events: `messages` → `updates` → `final`

---

## 📁 ALL RELEVANT FILES

### **Backend (Python)**

1. **LangGraph Workflow (Main Logic)**
   ```
   services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py
   ```
   - Lines 291-313: RAG retrieval adds "observation" step
   - Lines 364-377: Agent execution adds "thought" step
   - Lines 827-840: Final output preserves steps
   - **KEY CHECK**: Are `reasoning_steps` in the final state dict?

2. **Main AI Engine Entry Point**
   ```
   services/ai-engine/src/main.py
   ```
   - Lines 2771-2776: Port configuration (8080)
   - **KEY CHECK**: Is SSE stream format correct?

3. **Shared Services (Models)**
   ```
   services/vital-ai-services/src/vital_ai_services/core/models.py
   ```
   - Lines 213-225: `ReasoningStep` Pydantic model definition

---

### **Frontend (TypeScript/React)**

1. **Main Ask Expert Page (SSE Handler)**
   ```
   apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx
   ```
   - Lines 1424-1510: `updates` event handler (**CRITICAL SECTION**)
   - Lines 1434-1443: State unwrapping logic
   - Lines 1501-1510: `reasoning_steps` extraction (ADDED IN LAST FIX)
   - Lines 1970-2000: Final message creation

2. **Message Display Component**
   ```
   apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx
   ```
   - Lines 941-1113: AI Reasoning section rendering
   - Lines 1006-1070: Progressive disclosure with Framer Motion
   - Lines 1010-1025: Icon mapping (Brain, Zap, Eye, Search, Lightbulb)

3. **Shadcn AI Reasoning Component**
   ```
   apps/digital-health-startup/src/components/ui/shadcn-io/ai/reasoning.tsx
   ```
   - Provides collapsible reasoning UI
   - Has `keepOpen` prop to prevent auto-close

4. **Shared AI Components (Not Yet Integrated)**
   ```
   packages/ai-components/src/components/AIReasoning.tsx
   packages/ai-components/src/index.ts
   ```
   - Extracted reusable component (created but not used)

---

### **Configuration Files**

1. **Frontend Environment**
   ```
   apps/digital-health-startup/.env.local
   ```
   - `NEXT_PUBLIC_PYTHON_AI_ENGINE_URL=http://localhost:8080`

2. **Backend Environment**
   ```
   services/ai-engine/.env
   ```
   - `PORT=8080`
   - `OPENAI_API_KEY=[key]`

---

## 🧪 DEBUGGING STEPS FOR NEXT AGENT

### **Step 1: Verify Backend Emits `reasoning_steps`**

Add debug logging to `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`:

**In `format_output_node` (line ~840):**
```python
reasoning_steps = state.get('reasoning_steps', [])

# 🔍 DEBUG: Log reasoning steps before emission
logger.info(f"🔍 [Final State] reasoning_steps count: {len(reasoning_steps)}")
logger.info(f"🔍 [Final State] reasoning_steps: {reasoning_steps}")

return {
    **state,
    'reasoning_steps': reasoning_steps,
    ...
}
```

**Expected Output in Backend Console:**
```
🔍 [Final State] reasoning_steps count: 2
🔍 [Final State] reasoning_steps: [
  {"id": "...", "type": "observation", "content": "..."},
  {"id": "...", "type": "thought", "content": "..."}
]
```

---

### **Step 2: Verify SSE Stream Contains `reasoning_steps`**

Add debug logging to `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`:

**Before line 1501 (in the `updates` handler):**
```typescript
// 🔍 DEBUG: Log all keys in actualState
console.log('🔍 [Updates Debug] actualState type:', typeof actualState);
console.log('🔍 [Updates Debug] actualState keys:', Object.keys(actualState));
console.log('🔍 [Updates Debug] actualState.reasoning_steps:', actualState.reasoning_steps);
console.log('🔍 [Updates Debug] Full actualState:', JSON.stringify(actualState).substring(0, 500));
```

**Expected Output in Browser Console:**
```
🔍 [Updates Debug] actualState type: object
🔍 [Updates Debug] actualState keys: ["tenant_id", "user_id", "query", "reasoning_steps", "sources", ...]
🔍 [Updates Debug] actualState.reasoning_steps: [{"id": "...", "type": "observation", ...}]
```

**If Keys Don't Include `reasoning_steps`:**
- Check if it's nested (e.g., `actualState.metadata.reasoning_steps`)
- Check if the unwrapping logic (lines 1434-1443) is correct
- Check if `reasoning_steps` is in a different SSE event

---

### **Step 3: Check SSE Event Order**

Add comprehensive logging to see **all** SSE events:

**In the main SSE loop (around line 1201):**
```typescript
while (reader) {
  const { done, value } = await reader.read();
  if (done) break;

  const data = parseSSE(value);
  
  // 🔍 DEBUG: Log every SSE event
  console.log('🔍 [SSE Event]', {
    type: data.type,
    hasReasoningSteps: !!data.reasoning_steps,
    hasUpdates: !!data.updates,
    keys: Object.keys(data)
  });
  
  // ... existing switch statement ...
}
```

**Look for:**
- Which SSE event contains `reasoning_steps`?
- Are there multiple `updates` events?
- Is `reasoning_steps` in a different event type?

---

### **Step 4: Test with Minimal Example**

Create a minimal test to isolate the issue:

**Backend Test:**
1. Add a simple endpoint that returns hardcoded `reasoning_steps`
2. Verify SSE stream format

**Frontend Test:**
1. Create a test page that only handles SSE
2. Log **everything** received
3. Confirm extraction logic works with known data

---

## 🚨 CRITICAL UNKNOWNS

1. **Is `reasoning_steps` actually in the SSE stream?**
   - Need backend console logs to confirm

2. **What is the exact structure of the `updates` event?**
   - Need to log the full event to see nesting

3. **Are we looking in the right place?**
   - Maybe `reasoning_steps` is in `metadata` or a different field

4. **Is there a caching issue?**
   - Try clearing `.next` cache and restarting

5. **Is the unwrapping logic correct?**
   - Lines 1434-1443 extract state from node wrapper
   - Maybe this is wrong for `reasoning_steps`?

---

## 📊 SUMMARY OF CHANGES MADE

### **Files Modified:**

1. `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
   - ✅ Added `reasoning_steps` extraction (lines 1501-1510)
   - ❌ Result: Not working (log never appears)

2. `apps/digital-health-startup/src/features/ask-expert/components/EnhancedMessageDisplay.tsx`
   - ✅ Updated icons to Lucide React (Brain, Zap, Eye, etc.)
   - ✅ Added support for 5 reasoning types (thought, action, observation, search, reflection)
   - ✅ Implemented progressive disclosure with Framer Motion
   - ⚠️ Result: Rendering code is correct, but no data to render

3. `packages/ai-components/src/components/AIReasoning.tsx`
   - ✅ Created shared component
   - ⚠️ Result: Not yet integrated into main app

4. `packages/ai-components/src/index.ts`
   - ✅ Exported `AIReasoning` component

5. `apps/digital-health-startup/src/components/ui/shadcn-io/ai/reasoning.tsx`
   - ✅ Added `keepOpen` prop to prevent auto-close
   - ⚠️ Result: Prop is correct, but component never opens (no data)

### **Files Created:**

1. `AI_REASONING_STREAMING_FIXED.md` - Documentation of fix attempt
2. `AI_REASONING_COMPONENT_REFACTORED.md` - Documentation of refactoring
3. `packages/ai-components/src/components/AIReasoning.tsx` - Shared component

---

## 🎯 RECOMMENDED NEXT STEPS

### **Priority 1: Verify Backend Emission (CRITICAL)**
1. Add debug logging to `mode1_manual_workflow.py` (Step 1 above)
2. Restart backend and check console for `reasoning_steps` logs
3. If NOT present → Fix backend state management
4. If present → Move to Priority 2

### **Priority 2: Verify Frontend Reception**
1. Add debug logging to SSE handler (Step 2 above)
2. Check if `reasoning_steps` is in `actualState`
3. Check if it's nested or in a different field
4. If NOT present → SSE stream format issue
5. If present but not extracted → Fix extraction logic

### **Priority 3: Check Event Order**
1. Log all SSE events (Step 3 above)
2. Identify which event contains `reasoning_steps`
3. Ensure handler processes the correct event

### **Priority 4: Integration Testing**
1. Once data flows correctly, test progressive disclosure
2. Verify icons render correctly
3. Test `keepOpen` prop behavior
4. Ensure reasoning persists after streaming

---

## 🔗 RELATED ISSUES

### **Issue #2: Empty Sources Array**
```json
"sources": [],
"ragSummary": {
  "totalSources": 0,
  "domains": ["digital-health", "regulatory-affairs"]
}
```

- **Related to**: RAG retrieval returning no documents
- **Separate from**: Reasoning steps issue
- **Impact**: No inline citations possible without sources
- **File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py` (RAG node)

---

## 📞 CONTACT / HANDOFF

**Current State:**
- Backend claims to emit `reasoning_steps` (unverified)
- Frontend claims to extract them (not working)
- No console logs confirm data flow
- **Need: Backend console logs + SSE event inspection**

**Testing Commands:**
```bash
# Backend (Terminal 1)
cd services/ai-engine
python3 src/main.py
# Watch for: "🔍 [Final State] reasoning_steps count: N"

# Frontend (Terminal 2)
cd apps/digital-health-startup
pnpm dev
# Watch browser console for: "🔍 [Updates Debug] actualState keys: ..."
```

**Test Query:**
"Develop a digital strategy for patients with ADHD"

---

**END OF DIAGNOSTIC REPORT**

This document contains all information needed for the next agent to continue debugging.

