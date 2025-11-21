# ❌ **CRITICAL ISSUE FOUND: Frontend Not Calling AI Engine**

**Date**: November 6, 2025, 6:14 PM
**Status**: ❌ **BLOCKING ISSUE**

---

## **🔍 ROOT CAUSE**

The frontend is **NOT calling the AI Engine** at all!

### **Current Behavior** (WRONG):
```typescript
// apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx:1047
const response = await fetch('/api/ask-expert/orchestrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  // ...
});
```

**This endpoint** (`/api/ask-expert/orchestrate`) is the **old Node.js API Gateway**, which:
- Does **NOT** support LangGraph streaming
- Is a proxy layer that calls the Python AI Engine
- Uses the **legacy** response format

### **What We Need** (CORRECT):
```typescript
// For Mode 1, call the Python AI Engine directly
const response = await fetch('http://localhost:8080/api/mode1/manual', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId || 'vital-default-tenant',
  },
  // ...
});
```

---

## **🔧 THE FIX**

### **Option A: Quick Fix (5 min)**
Change the frontend to call the AI Engine directly for Mode 1:

**File**: `apps/digital-health-startup/src/app/(app)/ask-expert/page.tsx`

```typescript
// Around line 1047, replace:
const response = await fetch('/api/ask-expert/orchestrate', {
  // ...
});

// With:
const apiEndpoint = mode === 'manual' 
  ? `${process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || 'http://localhost:8080'}/api/mode1/manual`
  : '/api/ask-expert/orchestrate';

const response = await fetch(apiEndpoint, {
  // ...
});
```

### **Option B: Update Node.js API Gateway (30 min)**
Update the Node.js API Gateway to proxy streaming responses from the Python AI Engine.

---

## **📊 EVIDENCE**

### **1. AI Engine Logs** (`/tmp/ai-engine.log`):
```
✅ Uvicorn running on http://0.0.0.0:8080
✅ GET /health → 200 OK
❌ NO requests to /api/mode1/manual (streaming endpoint)
```

### **2. Frontend Logs** (Browser Console):
```
✅ [AskExpert] Sending request to /api/ask-expert/orchestrate
❌ NOT sending to /api/mode1/manual
```

### **3. Frontend Code**:
```typescript
// Line 1047: Hardcoded to old endpoint
const response = await fetch('/api/ask-expert/orchestrate', {
```

---

## **🎯 NEXT STEPS**

1. **Apply Option A (Quick Fix)** to test streaming
2. **Verify** that AI Engine receives requests
3. **Test** that streaming works end-to-end

---

**END OF DOCUMENT**

