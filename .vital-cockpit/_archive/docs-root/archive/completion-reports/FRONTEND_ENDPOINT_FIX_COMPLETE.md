# ✅ **PHASE 1 STREAMING - FRONTEND ENDPOINT FIX**

**Date**: November 6, 2025, 6:14 PM
**Status**: ✅ **FIXED - READY TO TEST**

---

## **🔧 CHANGES MADE**

### **File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

#### **Change 1: Dynamic Endpoint Selection** (Line 1047-1052)
```typescript
// 🔥 NEW: Call Python AI Engine directly for Mode 1 streaming
const apiEndpoint = mode === 'manual' 
  ? `${process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080'}/api/mode1/manual`
  : '/api/ask-expert/orchestrate';

console.log('[AskExpert] Calling endpoint:', apiEndpoint);
```

**Why**: Mode 1 now calls the Python AI Engine directly for LangGraph streaming, while other modes still use the Node.js API Gateway.

#### **Change 2: Request Body Format** (Line 1060-1093)
```typescript
body: JSON.stringify(
  mode === 'manual' 
    ? {
        // 🔥 Mode 1 (Python AI Engine) format
        user_query: messageContent,
        agent_ids: agentId ? [agentId] : [],
        selected_tools: enableTools ? selectedTools : [],
        selected_rag_domains: enableRAG ? selectedRagDomains : [],
        model: selectedModel || 'gpt-4-turbo',
        temperature: 0.7,
        conversation_id: conversationId || undefined,
      }
    : {
        // Legacy Node.js API Gateway format (unchanged)
        // ...
      }
),
```

**Why**: The Python AI Engine expects a different request format than the Node.js API Gateway.

#### **Change 3: Added Tenant ID Header** (Line 1056-1059)
```typescript
headers: { 
  'Content-Type': 'application/json',
  'x-tenant-id': tenantId || 'vital-default-tenant',
},
```

**Why**: The Python AI Engine requires the tenant ID for multi-tenancy support.

---

## **📊 BEFORE vs. AFTER**

### **BEFORE** ❌
```
Frontend → /api/ask-expert/orchestrate (Node.js) → Python AI Engine
          └─ (Legacy format, no streaming)
```

### **AFTER** ✅
```
Frontend → http://localhost:8080/api/mode1/manual (Python AI Engine)
          └─ (LangGraph streaming format, SSE)
```

---

## **🧪 HOW TO TEST**

### **Step 1: Verify Servers Are Running**
```bash
# AI Engine (Port 8080)
lsof -ti :8080

# Frontend (Port 3000)
lsof -ti :3000
```

### **Step 2: Open Browser**
1. Go to `http://localhost:3000/ask-expert`
2. **Open Browser DevTools** (F12)
3. Go to **Console** tab

### **Step 3: Send a Test Message**
1. Select **"Digital Therapeutic Advisor"** agent
2. Send message: **"What are FDA requirements for digital therapeutics?"**
3. Watch the console logs

### **Step 4: Verify Streaming**

**Expected Console Logs**:
```javascript
[AskExpert] Calling endpoint: http://localhost:8080/api/mode1/manual
[AskExpert] Response OK, starting stream processing
[mode1] 🔵 Stream mode: custom, chunk: Object { event: "workflow_step", data: {...} }
[mode1] 🔵 Stream mode: messages, chunk: Object { event: "data", data: {...} }
[mode1] 🔵 Stream mode: updates, chunk: Object { event: "data", data: {...} }
```

**Expected UI Behavior**:
- ✅ "Show AI Reasoning" button should appear
- ✅ Clicking it should show **workflow steps** and **reasoning thoughts**
- ✅ Response should stream in **token by token**

---

## **🐛 TROUBLESHOOTING**

### **Issue 1: CORS Error**
```
Access to fetch at 'http://localhost:8080/api/mode1/manual' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix**: The AI Engine should have CORS enabled. Check `services/ai-engine/src/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Issue 2: Agent Not Found**
```
[mode1] Error: No agent found with ID: ...
```

**Fix**: The agent ID format needs to be correct. Check the console for the actual agent ID being sent.

### **Issue 3: Empty Streaming**
```
[AskExpert] Response OK, starting stream processing
(No further logs)
```

**Fix**: Check AI Engine logs for errors:
```bash
tail -f /tmp/ai-engine.log
```

---

## **📁 FILES MODIFIED**

1. `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`
   - ✅ Dynamic endpoint selection
   - ✅ Request body format
   - ✅ Tenant ID header

---

## **✅ CHECKLIST**

- [x] Frontend calls Python AI Engine directly for Mode 1
- [x] Request body matches AI Engine's expected format
- [x] Tenant ID header is included
- [x] Streaming event parser is ready (from previous Phase 1 work)
- [ ] **TEST NOW**: Verify streaming works end-to-end

---

**Next**: Test the streaming functionality using the steps above! 🚀

---

**END OF DOCUMENT**

