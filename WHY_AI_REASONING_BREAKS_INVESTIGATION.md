# Investigation: Why AI Reasoning Breaks When Touching RAG Code

**Date**: 2025-11-07 22:45  
**Status**: 🔍 INVESTIGATING  

---

## 🚨 THE PATTERN

**Every time we try to fix inline citations, AI reasoning disappears.**

### **Timeline:**
1. ✅ AI reasoning works (user confirmed)
2. 🔧 We add code to debug/fix inline citations
3. ❌ AI reasoning breaks
4. ⏪ We revert changes
5. ✅ AI reasoning works again
6. 🔄 REPEAT

---

## 🤔 HYPOTHESIS: Why This Happens

### **Theory 1: Backend Restart Side Effect**
**When:** We restart the backend to apply changes  
**What might happen:**
- Python process cache cleared
- LangGraph state persistence lost
- Environment variables re-read (but potentially stale)
- Redis connection reset
- Memory state lost

**Test:** Check if AI reasoning works without any code changes after a simple restart

### **Theory 2: Logging/Print Statement Interference**
**When:** We add logging to RAG node  
**What might happen:**
- Logging statements might block/delay the event loop
- Large log output might buffer and block
- Logging in async functions might cause timing issues
- UTF-8 characters in logs (emojis) might cause encoding issues

**Evidence:**
- We only added logging, no logic changes
- The logging was in async functions
- We used many emoji characters (🔍, ✅, etc.)

**Test:** Add minimal logging without emojis

### **Theory 3: SSE Stream Corruption**
**When:** Backend processing changes (even just logging)  
**What might happen:**
- SSE stream format corrupted by extra output
- `updates` events getting mixed with log output
- Frontend SSE parser failing to extract `reasoning_steps`
- Buffering issues causing events to arrive out of order

**Evidence:**
- AI reasoning works initially (first query?)
- Breaks after backend restart
- SSE is sensitive to output format

**Test:** Check browser Network tab for SSE stream content

### **Theory 4: State Accumulation/Corruption**
**When:** Workflow runs multiple times  
**What might happen:**
- State from previous runs not being cleared
- `reasoning_steps` array getting overwritten instead of appended
- State updates not being properly merged
- Race condition in state updates

**Evidence:**
- First query might work, subsequent ones fail
- Restarting "fixes" it temporarily

**Test:** Check if AI reasoning works on first query only

### **Theory 5: Frontend State Management**
**When:** Backend sends data in different format  
**What might happen:**
- Frontend SSE handler expects exact format
- Any change to backend output breaks parsing
- `reasoning_steps` extraction logic is fragile
- Race condition between `updates` and `custom` events

**Evidence:**
- We didn't change frontend
- But backend changes might affect event timing/format

**Test:** Add frontend logging to see what events are received

---

## 🧪 INVESTIGATION PLAN

### **Step 1: Baseline Test (NO CODE CHANGES)**
**Goal:** Confirm current AI reasoning works

**Test:**
1. Start fresh shell
2. DON'T change any code
3. Kill and restart backend only
4. Test AI reasoning
5. Record result

**Expected:** AI reasoning should work (user said it works)

---

### **Step 2: Backend Restart Test**
**Goal:** See if backend restart alone breaks AI reasoning

**Test:**
1. Confirm AI reasoning works
2. Kill backend
3. Restart backend (no code changes)
4. Test AI reasoning again
5. Record if it still works

**Expected:** If this breaks AI reasoning, problem is in startup/initialization

---

### **Step 3: Minimal Logging Test**
**Goal:** See if ANY logging breaks AI reasoning

**Test:**
1. Add ONE simple log line to RAG node (no emojis, minimal text):
   ```python
   logger.info("RAG node entered")
   ```
2. Restart backend
3. Test AI reasoning

**Expected:** If this breaks AI reasoning, problem is logging itself

---

### **Step 4: SSE Stream Inspection**
**Goal:** See what the backend is actually sending

**Test:**
1. Browser DevTools → Network tab
2. Find SSE request (usually `/api/langgraph/stream` or similar)
3. Click on it
4. View "EventStream" or "Response"
5. Look for `reasoning_steps` in the `updates` events

**Expected:** 
- Should see `event: updates` with `data: {...reasoning_steps: [...]}`
- If missing, backend isn't sending it
- If present but frontend doesn't show, frontend parser broken

---

### **Step 5: Frontend Logging Test**
**Goal:** See what frontend is receiving from SSE

**Test:**
Add temporary logging to `page.tsx` in SSE handler (around line 1501):

```typescript
if (chunk.event === 'updates' && chunk.data) {
  const actualState = chunk.data?.state || chunk.data;
  
  // 🔍 DEBUG: Log what we're receiving
  console.log('🔍 SSE updates event received:', {
    hasReasoningSteps: 'reasoning_steps' in actualState,
    reasoningStepsLength: actualState.reasoning_steps?.length,
    reasoningStepsValue: actualState.reasoning_steps,
    allKeys: Object.keys(actualState)
  });
  
  // Rest of existing code...
}
```

**Expected:**
- If `hasReasoningSteps: false`, backend isn't sending
- If `hasReasoningSteps: true` but not showing in UI, rendering issue

---

### **Step 6: LangGraph State Inspection**
**Goal:** Verify backend is adding reasoning_steps to state

**Test:**
Add temporary logging to `mode1_manual_workflow.py` in `format_output_node`:

```python
# Just before return statement (line 847)
logger.info(f"FINAL STATE KEYS: {list(state.keys())}")
logger.info(f"REASONING STEPS IN STATE: {'reasoning_steps' in state}")
if 'reasoning_steps' in state:
    logger.info(f"REASONING STEPS COUNT: {len(state['reasoning_steps'])}")
    logger.info(f"FIRST REASONING STEP: {state['reasoning_steps'][0] if state['reasoning_steps'] else 'NONE'}")
```

**Expected:**
- Should see reasoning_steps in final state
- Should have at least 2-3 steps

---

## 🎯 ROOT CAUSE CANDIDATES (Ranked by Likelihood)

### **1. SSE Stream Format Sensitivity** (MOST LIKELY)
**Why:** 
- SSE is very sensitive to output format
- Any extra output can corrupt the stream
- Logging to stdout might mix with SSE events

**How it breaks AI reasoning:**
- Backend logs get mixed with SSE `data:` lines
- Frontend SSE parser fails
- No updates received, no reasoning_steps extracted

**Fix:**
- Ensure all logging goes to file, not stdout
- Use structured logging (JSON)
- Don't use `print()`, only `logger.()`

---

### **2. Async/Await Timing Issue** (LIKELY)
**Why:**
- We're adding code to async functions
- Timing might affect state updates
- Race condition between RAG node and state streaming

**How it breaks AI reasoning:**
- RAG node takes longer (due to logging)
- State update for reasoning_steps arrives too late
- Frontend has already processed final response

**Fix:**
- Ensure reasoning_steps added early in workflow
- Don't block async operations
- Test if reasoning appears after a delay

---

### **3. State Mutation Issue** (POSSIBLE)
**Why:**
- LangGraph state is complex
- Multiple nodes updating same state keys
- Possible race condition

**How it breaks AI reasoning:**
- `reasoning_steps` gets overwritten instead of merged
- Later nodes clobber earlier reasoning
- Final state has empty reasoning_steps

**Fix:**
- Always use `state.get('reasoning_steps', [])` and append
- Never replace, only extend
- Use state checkpointing

---

### **4. Frontend State Management** (LESS LIKELY)
**Why:**
- We didn't change frontend code
- But backend timing changes might affect it

**How it breaks AI reasoning:**
- Frontend expects events in specific order
- Backend change affects event timing
- Frontend state gets out of sync

**Fix:**
- Make frontend more robust
- Don't rely on event order
- Use latest state from any event

---

### **5. Backend Initialization Issue** (UNLIKELY)
**Why:**
- Restart alone might be the issue
- But user confirmed it works after restart

**How it breaks AI reasoning:**
- Some service not initializing correctly
- State persistence not working
- But this would affect everything, not just reasoning

---

## 🔬 IMMEDIATE NEXT STEPS

1. **DO NOT CHANGE ANY CODE**
2. **Test current state** - Does AI reasoning work right now?
3. **If yes:** Proceed with investigation plan
4. **If no:** Something else broke it (not our changes)

---

## 💡 SAFE WAY FORWARD

### **Option A: Fix Inline Citations Without Touching Backend**
**Idea:** Maybe the backend is already sending sources, but frontend isn't displaying them correctly

**Steps:**
1. Use browser DevTools to inspect SSE stream
2. Check if `sources` are in the final state
3. If yes, fix frontend rendering only
4. No backend changes = no AI reasoning breakage

**Pros:** 
- Minimal risk
- AI reasoning stays working
- Can iterate quickly

**Cons:**
- If backend isn't sending sources, this won't help

---

### **Option B: Fix Backend But Test Carefully**
**Idea:** Make ONE change at a time, test immediately

**Steps:**
1. Add ONE log line
2. Restart backend
3. Test AI reasoning immediately
4. If broken, revert and document why
5. If working, add next change

**Pros:**
- Methodical
- Find exact breaking point
- Learn root cause

**Cons:**
- Slow
- Multiple iterations

---

### **Option C: Parallel Investigation**
**Idea:** Clone the approach - have two backends running

**Steps:**
1. Keep current backend running on port 8080 (AI reasoning works)
2. Start second backend on port 8081 with debug code
3. Compare outputs side-by-side
4. See what's different

**Pros:**
- Can compare directly
- Don't break working version
- Safe experimentation

**Cons:**
- More complex setup
- Need to manage two processes

---

## 📊 CURRENT STATUS

- ✅ **Reverted backend to working state**
- ✅ **Backend restarted and healthy**
- ✅ **Test endpoint still available** (doesn't affect main workflow)
- ❓ **AI reasoning should now work** (NEEDS VERIFICATION)
- ❓ **Sources issue still not fixed**

---

## 🎯 RECOMMENDATION

**Before making ANY more changes:**

1. **USER: Please test AI reasoning right now**
   - Navigate to http://localhost:3000/ask-expert
   - Ask: "What is digital health?"
   - Confirm AI reasoning appears and works
   - Take a screenshot if possible

2. **Once confirmed working:**
   - We'll investigate using **Option A first** (frontend-only inspection)
   - Check if sources are already being sent but not displayed
   - If sources are there, fix frontend rendering only (SAFE)
   - If sources are missing, we need Option B (careful backend changes)

3. **Document the exact breaking point:**
   - Every change that breaks AI reasoning
   - Pattern recognition
   - Find root cause before more attempts

---

**END OF INVESTIGATION REPORT**

User: Please confirm if AI reasoning is working now before we proceed.

