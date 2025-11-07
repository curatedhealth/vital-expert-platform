# 🧪 **LANGGRAPH STREAMING - TESTING GUIDE**

**Status**: ✅ Phase 1 Implementation Complete
**AI Engine**: ✅ Running on port 8080
**Frontend**: ✅ Running on port 3000

---

## **🎯 WHAT TO TEST**

### **Test 1: Basic Streaming Verification**

**Goal**: Verify that LangGraph streaming is working end-to-end

**Steps**:
1. Go to `http://localhost:3000/ask-expert`
2. Select agent: "**Digital Therapeutic Advisor**" or "**Market Research Analyst**"
3. Ensure RAG is enabled (should be on by default)
4. Send message: **"What are FDA requirements for digital therapeutics?"**
5. **Watch for**:
   - Message appears in chat
   - "Show AI Reasoning" button appears below the message
   - Click "Show AI Reasoning" to expand

**Expected Result**:
```
✅ Show AI Reasoning button visible
✅ When expanded, you should see:
   - Workflow Progress section (RAG Retrieval → Agent Execution)
   - AI Thinking section (thoughts like "Searching 2 domains...")
   - Steps update in real-time
```

---

### **Test 2: Browser Console Verification**

**Goal**: Verify that streaming events are being received

**Steps**:
1. Open Browser Console (F12 or Cmd+Option+I)
2. Go to Console tab
3. Send a message in Ask Expert
4. **Look for logs**:

**Expected Console Output**:
```javascript
🔄 [LangGraph Update] Node completed: {...}
🔍 [EnhancedMessageDisplay] Metadata check: {
  hasWorkflowSteps: true,
  workflowStepsLength: 2,
  hasReasoningSteps: true,
  reasoningStepsLength: 3-5
}
```

---

### **Test 3: AI Engine Logs Verification**

**Goal**: Verify that backend is streaming correctly

**Steps**:
1. Open terminal
2. Run: `tail -f /tmp/ai-engine.log`
3. Send a message in Ask Expert
4. **Look for logs**:

**Expected AI Engine Output**:
```
🚀 [Mode 1] Starting LangGraph streaming workflow
📡 [Mode 1 Stream] custom: <class 'dict'>
📡 [Mode 1 Stream] custom: <class 'dict'>
📡 [Mode 1 Stream] updates: <class 'dict'>
✅ [Mode 1] LangGraph streaming completed
```

---

### **Test 4: Workflow Steps Display**

**Goal**: Verify that workflow steps appear in the UI

**Expected in "Show AI Reasoning" → "Workflow Progress"**:
```
✅ RAG Retrieval
   Status: completed
   Description: "Searching 2 knowledge domains"
   
✅ Agent Execution
   Status: completed
   Description: "Generating response with Digital Therapeutic Advisor"
```

---

### **Test 5: AI Thinking Display**

**Goal**: Verify that reasoning steps appear in the UI

**Expected in "Show AI Reasoning" → "AI Thinking"**:
```
💭 Searching 2 domains for relevant evidence (85% confidence)
📊 Found 10 relevant sources (90% confidence)
⚡ Generating response with 10 sources (88% confidence)
👁️ Generated response with 8 citations (92% confidence)
```

---

## **🐛 TROUBLESHOOTING**

### **Issue 1: "Show AI Reasoning" button doesn't appear**

**Possible Causes**:
- Frontend not receiving metadata
- Streaming events not being parsed

**Debug Steps**:
1. Check browser console for errors
2. Check if `workflowSteps` or `reasoningSteps` are empty
3. Run this in console:
   ```javascript
   // After sending a message, check the last message
   console.log(messages[messages.length - 1].metadata)
   ```

**Expected**:
```javascript
{
  workflowSteps: [{id: "rag-retrieval", ...}, {id: "agent-execution", ...}],
  reasoningSteps: [{content: "Searching...", type: "thought"}, ...],
  reasoning: ["..."],
  ...
}
```

---

### **Issue 2: "Show AI Reasoning" expands but shows nothing**

**Possible Causes**:
- `workflowSteps` and `reasoningSteps` are empty arrays
- Streaming events not being captured

**Debug Steps**:
1. Check AI Engine logs for streaming events:
   ```bash
   grep "Mode 1 Stream" /tmp/ai-engine.log
   ```
2. Check if `get_stream_writer()` is working:
   ```bash
   grep "workflow_step\|langgraph_reasoning" /tmp/ai-engine.log
   ```

**Expected**:
```
📡 [Mode 1 Stream] custom: <class 'dict'>
📡 [Mode 1 Stream] custom: <class 'dict'>
```

---

### **Issue 3: No streaming at all - response appears all at once**

**Possible Causes**:
- Frontend not connecting to SSE endpoint
- Backend not streaming

**Debug Steps**:
1. Check Network tab in browser:
   - Look for request to `/api/mode1/manual`
   - Type should be `eventsource` or `text/event-stream`
   - Status should be `200` and stay open
2. Check if SSE is being received:
   ```javascript
   // In browser console while message is streaming
   // You should see data: {...} events
   ```

**Expected Network Tab**:
```
POST /api/mode1/manual
Type: eventsource
Status: 200
Transfer-Encoding: chunked
Content-Type: text/event-stream
```

---

### **Issue 4: AI Engine crashes or doesn't start**

**Possible Causes**:
- Missing dependencies
- Port 8080 already in use

**Debug Steps**:
1. Check AI Engine logs:
   ```bash
   cat /tmp/ai-engine.log
   ```
2. Check if port is in use:
   ```bash
   lsof -i :8080
   ```
3. Verify LangGraph version:
   ```bash
   cd /Users/hichamnaim/Downloads/Cursor/VITAL\ path/services/ai-engine
   source venv/bin/activate
   pip show langgraph
   ```

**Expected**: `Version: 0.6.11` (or higher)

---

## **📊 SUCCESS CRITERIA**

### **Phase 1 is successful if**:

✅ **1. Streaming Events Received**
- Browser console shows "LangGraph Update" logs
- Network tab shows SSE connection

✅ **2. Workflow Steps Display**
- "Show AI Reasoning" button appears
- Workflow Progress shows 2+ steps
- Steps show "running" → "completed" status

✅ **3. AI Thinking Display**
- AI Thinking shows 3-5 reasoning steps
- Steps show thought/observation/action types
- Steps have confidence scores

✅ **4. Real-time Updates**
- Steps appear progressively, not all at once
- Status changes from "running" to "completed"

✅ **5. No Errors**
- No console errors
- No AI Engine crashes
- Response generates successfully

---

## **🎥 EXPECTED USER EXPERIENCE**

### **Before (Old Non-Streaming)**:
```
User: "What are FDA requirements?"
[5 seconds of silence]
Agent: "The FDA requires..." [full response appears instantly]
```

### **After (New Streaming)**:
```
User: "What are FDA requirements?"

[AI Reasoning expands automatically]
  ▶ Workflow Progress
    - RAG Retrieval [running] ⏳
      
[1 second later]
  ▶ AI Thinking
    💭 Searching 2 domains for evidence...
    
[2 seconds later]
    📊 Found 10 relevant sources
  ▶ Workflow Progress
    - RAG Retrieval [completed] ✅
    - Agent Execution [running] ⏳
    
[3 seconds later]
    ⚡ Generating response with 10 sources
    
[5 seconds later]
    👁️ Generated response with 8 citations
  ▶ Workflow Progress  
    - Agent Execution [completed] ✅
    
Agent: "The FDA requires..." [response appears]
```

---

## **📝 WHAT TO REPORT**

After testing, please share:

### **1. Screenshots**:
- "Show AI Reasoning" expanded view
- Browser console logs
- Network tab (showing SSE connection)

### **2. Console Logs**:
```bash
# AI Engine logs
tail -50 /tmp/ai-engine.log

# Or copy the specific streaming section
grep "Mode 1 Stream" /tmp/ai-engine.log
```

### **3. Observations**:
- Did workflow steps appear?
- Did reasoning steps appear?
- Were updates real-time or all at once?
- Any errors or issues?

---

## **🚀 NEXT STEPS AFTER TESTING**

### **If Phase 1 Works**:
We can proceed to:
- **Phase 2**: Add LLM token streaming (word-by-word)
- **Phase 3**: Add metrics (tokens/sec, elapsed time)
- **Phase 4**: Apply to Mode 2, 3, 4

### **If Phase 1 Has Issues**:
We'll debug and fix before moving forward.

---

**Ready to test? Go ahead and try Test 1!** 🎉

---

**END OF DOCUMENT**

