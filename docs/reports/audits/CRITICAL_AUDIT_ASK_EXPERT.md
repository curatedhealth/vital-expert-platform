# 🔴 CRITICAL ISSUES FOUND - Ask Expert System Audit

## Executive Summary

**Date:** November 3, 2025  
**Status:** 🔴 **CRITICAL - Non-Functional**  
**Impact:** AI responses not displaying, citations missing, possible mock data

---

## 🚨 Issue 1: NO RESPONSE CONTENT RENDERING

### Observed Behavior
- User message: "Help me understand the current trends in this field"
- Agent header displays: "Accelerated Approval Strategist, 85% confident"
- Sources metadata shows: "Used 2 sources, Sources cited: 2, Inline citations: 2"
- **BUT**: No actual AI response text is visible
- Follow-up prompts appear below the empty response area

### Root Cause Analysis

#### Problem 1: API Endpoint Mismatch
**Current State:**
```typescript
// page.tsx calls:
fetch('/api/ask-expert/orchestrate', { ... })

// But this endpoint may not be properly implemented or returning mock data
```

#### Problem 2: Streaming Component Issue
The `StreamingResponse` wrapper we added is wrapping the `AIResponse` component, but the content is not rendering.

```typescript
<StreamingResponse isAnimating={isStreaming || false}>
  <div>
    <AIResponse>{deferredContent}</AIResponse>  // ← Content not rendering!
  </div>
</StreamingResponse>
```

**Possible causes:**
1. `deferredContent` is undefined/null
2. API is not returning actual content
3. Streaming wrapper is preventing render
4. Content is being filtered out during parsing

---

## 🔍 Issue 2: MULTIPLE API ENDPOINTS

### Discovery
The codebase has **multiple Ask Expert API endpoints**:

1. **`/api/ask-expert`** - LangGraph workflow endpoint (route.ts)
2. **`/api/ask-expert/chat`** - SSE streaming endpoint (route.ts) 
3. **`/api/ask-expert/orchestrate`** - **CURRENTLY BEING CALLED** (route.ts)

### Current Page Usage
```typescript
// page.tsx (line 782)
const response = await fetch('/api/ask-expert/orchestrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: mode,  // 'manual', 'automatic', 'autonomous', 'multi-expert'
    agentId,
    message,
    conversationHistory,
    enableRAG,
    enableTools,
    // ...
  }),
});
```

**Question:** Is `/api/ask-expert/orchestrate` actually implemented and returning real AI responses?

---

## 🔍 Issue 3: 4 MODES AUDIT

### Mode Configuration Analysis

#### Current Frontend Modes (4-Mode System)
From `page.tsx`:

```typescript
// Based on toggles:
const currentMode = useMemo(() => {
  if (!isAutomatic && !isAutonomous) return MODE_DEFS[1];      // Mode 1: Manual Interactive
  if (isAutomatic && !isAutonomous) return MODE_DEFS[2];       // Mode 2: Automatic (Agent Selection)
  if (isAutomatic && isAutonomous) return MODE_DEFS[3];        // Mode 3: Automatic + Autonomous
  if (!isAutomatic && isAutonomous) return MODE_DEFS[4];       // Mode 4: Manual + Autonomous
  return MODE_DEFS[1];
}, [isAutomatic, isAutonomous]);
```

**Mode Definitions:**
1. **Mode 1: Manual Interactive** - User selects agent, RAG on, tools off
2. **Mode 2: Automatic (Agent Selection)** - System selects agent, RAG on, tools on
3. **Mode 3: Automatic + Autonomous** - System-driven, RAG on, tools on, self-guided
4. **Mode 4: Manual + Autonomous** - User-selected agent, tools on, autonomous execution

#### Backend API Mode Mapping
From `/api/ask-expert/chat/route.ts`:

```typescript
const MODE_CONFIG = {
  'mode-1-query-automatic': { ... },     // ← NOT MATCHING FRONTEND
  'mode-2-query-manual': { ... },        // ← NOT MATCHING FRONTEND
  'mode-3-chat-automatic': { ... },      // ← NOT MATCHING FRONTEND
  'mode-4-chat-manual': { ... },         // ← NOT MATCHING FRONTEND
  'mode-5-agent-autonomous': { ... },    // ← EXTRA MODE!
};
```

**🚨 MISMATCH DETECTED:**
- Frontend sends: `'manual'`, `'automatic'`, `'autonomous'`, `'multi-expert'`
- Backend expects: `'mode-1-query-automatic'`, `'mode-2-query-manual'`, etc.

---

## 🔍 Issue 4: LangGraph Workflow Status

### Available LangGraph Implementations

1. **`ask-expert-graph.ts`** - Simple workflow (check_budget → retrieve_context → generate_response)
2. **`unified-langgraph-orchestrator.ts`** - Complex 5-mode system with full workflow
3. **`simplified-langgraph-orchestrator.ts`** - Simplified version
4. **Mode-specific handlers:**
   - `mode1-manual-interactive.ts`
   - `mode2-automatic-agent-selection.ts`
   - `mode3-autonomous-automatic.ts`
   - `mode4-autonomous-manual.ts`

### Current Usage
The `/api/ask-expert` endpoint uses:
```typescript
import { streamAskExpertWorkflow } from '@/features/chat/services/ask-expert-graph';
```

But the main page calls `/api/ask-expert/orchestrate` which may not be using any LangGraph workflow!

---

## 📊 Critical Findings Summary

| Issue | Severity | Impact | Status |
|-------|----------|--------|--------|
| No content rendering | 🔴 Critical | Users see empty responses | Confirmed |
| API endpoint mismatch | 🔴 Critical | Wrong endpoint being called | Confirmed |
| Mode name mismatch | 🟠 High | Backend can't match modes | Confirmed |
| Multiple API endpoints | 🟠 High | Confusion, inconsistency | Confirmed |
| LangGraph not integrated | 🟠 High | Missing advanced features | Suspected |
| Inline citations missing | 🔴 Critical | No source attribution | Confirmed |
| Possible mock responses | 🔴 Critical | Not real AI answers | Suspected |

---

## 🔧 Immediate Actions Required

### 1. Check `/api/ask-expert/orchestrate` Implementation
```bash
# Need to verify if this endpoint:
1. Exists and is implemented
2. Calls actual AI models (not mock data)
3. Returns proper streaming responses
4. Includes citations in response
```

### 2. Fix Frontend-Backend Mode Mapping
```typescript
// Frontend needs to send backend-compatible mode strings:
const modeMapping = {
  'manual': 'mode-2-query-manual',           // Mode 1 → Mode 2 backend
  'automatic': 'mode-1-query-automatic',     // Mode 2 → Mode 1 backend
  'autonomous': 'mode-5-agent-autonomous',   // Mode 3 → Mode 5 backend
  'multi-expert': 'mode-3-chat-automatic',   // Mode 4 → Mode 3 backend
};
```

### 3. Fix Content Rendering
```typescript
// Remove StreamingResponse wrapper temporarily:
<AIResponse
  remarkPlugins={citationRemarkPlugins}
  components={citationComponents}
>
  {deferredContent}
</AIResponse>
```

### 4. Add Debug Logging
```typescript
console.log('[DEBUG] Response content:', {
  deferredContent,
  isStreaming,
  messageContent: msg.content,
  metadataSources: msg.metadata?.sources
});
```

---

## 🎯 Recommended Fix Order

1. **[IMMEDIATE]** Check browser console for errors
2. **[IMMEDIATE]** Verify `/api/ask-expert/orchestrate` returns content
3. **[HIGH]** Remove StreamingResponse wrapper to test content rendering
4. **[HIGH]** Fix mode name mapping between frontend/backend
5. **[MEDIUM]** Integrate proper LangGraph workflow
6. **[MEDIUM]** Add comprehensive error handling
7. **[LOW]** Re-add streaming animation after content works

---

## 🧪 Testing Checklist

- [ ] Verify API endpoint exists and responds
- [ ] Check API returns actual AI content (not mock)
- [ ] Confirm citations are in response format
- [ ] Test content renders without StreamingResponse
- [ ] Verify mode mapping works correctly
- [ ] Test all 4 modes individually
- [ ] Confirm LangGraph workflow is being called
- [ ] Verify RAG is retrieving context
- [ ] Check inline citations render correctly
- [ ] Test source cards expand properly

---

## 📝 Next Steps

1. **User**: Check browser console (F12) for errors
2. **User**: Share any error messages or network tab responses
3. **Developer**: Audit `/api/ask-expert/orchestrate/route.ts`
4. **Developer**: Fix mode mapping
5. **Developer**: Restore content rendering
6. **Developer**: Add proper error handling

---

**Generated:** November 3, 2025, 01:58 PM  
**Priority:** 🔴 **P0 - System Non-Functional**  
**Assigned:** Immediate attention required

