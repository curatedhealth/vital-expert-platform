# 🚨 CRITICAL BUG FOUND - SSE EVENT FORMAT MISMATCH

**Timestamp**: November 9, 2025 @ 3:00 PM
**Severity**: CRITICAL - Blocks all AI responses

---

## 🔍 ROOT CAUSE IDENTIFIED

### **Backend Sends** (Python LangGraph format):
```json
data: {"stream_mode": "messages", "data": {"type": "AIMessageChunk", "content": "Digital", "id": "..."}}
data: {"stream_mode": "updates", "data": {"validate_inputs": {...}}}
```

### **Frontend Expects** (Simple SSE format):
```
event: content
data: some text

event: done
data: {"status": "complete"}
```

### **Result**: 
- ✅ Backend streams perfectly (verified with curl)
- ❌ Frontend can't parse the events
- ❌ No content displays in UI
- ❌ No reasoning, no sources, no completion

---

## 📊 EVIDENCE

### **✅ Backend Working** (Curl test):
```bash
curl -X POST http://localhost:8080/api/mode1/manual \
  -H "Content-Type: application/json" \
  -d '{"message": "What is digital health?", "agent_id": "c9ba4f33-...", ...}'

# Response (streaming perfectly):
data: {"stream_mode": "messages", "data": {"content": "Digital"}}
data: {"stream_mode": "messages", "data": {"content": " health"}}
data: {"stream_mode": "messages", "data": {"content": " refers"}}
# ... Full AI response streams successfully!
```

### **❌ Frontend Not Parsing**:
```typescript
// Frontend expects:
streaming.onEvent('content', (data) => { ... })

// But backend sends:
{"stream_mode": "messages", "data": {"content": "..."}}
//     ↑                        ↑
//  Wrong event name      Content is nested!
```

---

## 🔧 FIX REQUIRED

### **Option 1: Update Frontend Parser** ⭐ (Recommended)

**File**: `apps/digital-health-startup/src/features/ask-expert/hooks/useStreamingConnection.ts`

**Current parser** (lines 159-182):
```typescript
const events = parseSSEChunk(buffer);

for (const event of events) {
  const handler = eventHandlersRef.current.get(event.event);
  if (handler) {
    handler(event.data);
  }
}
```

**Needs to become**:
```typescript
const events = parseSSEChunk(buffer);

for (const event of events) {
  // Parse backend's stream_mode format
  const parsedData = JSON.parse(event.data);
  
  if (parsedData.stream_mode === 'messages') {
    // Extract content from AIMessageChunk
    const content = parsedData.data?.content;
    if (content) {
      const handler = eventHandlersRef.current.get('content');
      if (handler) {
        handler(content);
      }
    }
  } else if (parsedData.stream_mode === 'updates') {
    // Handle node updates (thinking, RAG, tools)
    const nodeName = Object.keys(parsedData.data)[0];
    const handler = eventHandlersRef.current.get(nodeName);
    if (handler) {
      handler(parsedData.data[nodeName]);
    }
  }
}
```

---

### **Option 2: Update Backend Format** (Not recommended)

Would require changing Python backend to send:
```
event: content
data: Digital

event: content
data:  health
```

**Why not recommended**: 
- Backend format is LangGraph standard
- More work to change backend
- Breaks compatibility with LangGraph ecosystem

---

## 🎯 IMPLEMENTATION PLAN

### **Step 1: Update parseSSEChunk utility**

**File**: `apps/digital-health-startup/src/features/ask-expert/utils/parseSSEChunk.ts`

**Add**: Stream mode parser function
```typescript
export function parseLangGraphEvent(sseData: string): {
  eventType: string;
  data: any;
} | null {
  try {
    const parsed = JSON.parse(sseData);
    
    // Handle messages stream mode (token-by-token)
    if (parsed.stream_mode === 'messages') {
      return {
        eventType: 'content',
        data: parsed.data?.content || '',
      };
    }
    
    // Handle updates stream mode (node completion)
    if (parsed.stream_mode === 'updates') {
      const nodeName = Object.keys(parsed.data)[0];
      return {
        eventType: nodeName, // e.g., 'validate_inputs', 'fetch_agent', 'rag_retrieval'
        data: parsed.data[nodeName],
      };
    }
    
    // Handle custom events
    if (parsed.stream_mode === 'custom') {
      return {
        eventType: parsed.type || 'custom',
        data: parsed.data,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[parseLangGraphEvent] Error:', error);
    return null;
  }
}
```

### **Step 2: Update useStreamingConnection.ts**

**File**: `useStreamingConnection.ts` (lines 159-182)

**Change from**:
```typescript
for (const event of events) {
  const handler = eventHandlersRef.current.get(event.event);
  if (handler) {
    handler(event.data);
  }
}
```

**Change to**:
```typescript
for (const event of events) {
  // Try to parse as LangGraph event
  const langGraphEvent = parseLangGraphEvent(event.data);
  
  if (langGraphEvent) {
    const handler = eventHandlersRef.current.get(langGraphEvent.eventType);
    if (handler) {
      handler(langGraphEvent.data);
    }
  } else {
    // Fallback to original event handling
    const handler = eventHandlersRef.current.get(event.event);
    if (handler) {
      handler(event.data);
    }
  }
}
```

### **Step 3: Add event mapping**

**File**: `page.tsx` (add after existing event handlers)

**Add**:
```typescript
// Map backend node events to frontend events
streaming.onEvent('validate_inputs', () => {
  console.log('[Phase 2] Validation started');
  streamingProgress.setStage('thinking');
});

streaming.onEvent('fetch_agent', (data) => {
  console.log('[Phase 2] Agent fetched:', data.agent_data?.name);
});

streaming.onEvent('rag_retrieval', (data) => {
  console.log('[Phase 2] RAG completed, sources:', data.total_documents);
  if (data.total_documents > 0) {
    streamingProgress.setStage('rag');
  }
});

streaming.onEvent('tool_suggestion', () => {
  streamingProgress.setStage('tools');
});

streaming.onEvent('generate_response', () => {
  streamingProgress.setStage('streaming');
});
```

---

## 📋 FILES TO CHANGE

1. ✅ Create: `src/features/ask-expert/utils/parseLangGraphEvent.ts`
2. ✅ Update: `src/features/ask-expert/hooks/useStreamingConnection.ts`
3. ✅ Update: `src/app/(app)/ask-expert/page.tsx` (add node event handlers)

---

## 🧪 TESTING PLAN

### **Test 1: Simple Query**
1. Select agent
2. Type: "What is digital health?"
3. Click send
4. ✅ Should see token-by-token streaming
5. ✅ Should see complete response

### **Test 2: RAG Query**
1. Enable RAG domains
2. Type query about specific topic
3. ✅ Should see sources
4. ✅ Should see reasoning

### **Test 3: Tool Query**
1. Enable tools
2. Type query needing calculation
3. ✅ Should see tool suggestions
4. ✅ Should see tool results

---

## 🚀 EXPECTED RESULT

### **Before** (Current - Broken):
```
User: "What is digital health?"
Backend: [Streams response perfectly]
Frontend: [No content displays] ❌
```

### **After** (Fixed):
```
User: "What is digital health?"
Backend: [Streams response perfectly]
Frontend: [Displays: "Digital health refers to..."] ✅
```

---

## ⏰ URGENCY: CRITICAL

This bug **completely blocks** all AI responses from displaying! No content, no reasoning, no sources - nothing reaches the UI even though the backend works perfectly.

**Priority**: FIX IMMEDIATELY

**Estimated time**: 30 minutes
- 10min: Write parseLangGraphEvent utility
- 10min: Update useStreamingConnection
- 10min: Test with real queries

---

**Next Step**: Implement the fix now!


