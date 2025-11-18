# 🚨 **COMPREHENSIVE FIX PLAN: RAG + Citations + AI Reasoning**

**Date**: 2025-11-05 23:45 UTC  
**Critical Issues Identified from Console**:

```
Has sources: 0          ❌ RAG not retrieving
used: []                ❌ Tools not executing  
First source: undefined ❌ No citations
```

---

## **Root Causes Identified**

### **1. System Prompt Doesn't Enforce RAG/Tools** ❌
**File**: `services/ai-engine/src/services/agent_orchestrator.py` (line 253)

**Current**:
```python
base_prompt = f"""You are a specialized medical AI assistant...
Your responses must maintain the highest standards..."""
```

**Problem**: No explicit instruction to **USE RAG FIRST** or **USE TOOLS**

---

### **2. Mode 1 Doesn't Actually Call Tools** ❌
**File**: `services/ai-engine/src/langgraph_workflows/mode1_manual_workflow.py`

**Current Flow**:
```
1. Validate → 2. RAG Retrieval → 3. Execute Agent → 4. Format
```

**Problem**: No tool execution step! Tools are enabled in UI but never called.

---

### **3. No AI Reasoning Streaming** ❌
**Missing**: LangGraph streaming modes for `messages` and `custom` data

**Problem**: No real-time thinking/reasoning display

---

## **FIXES TO IMPLEMENT**

### **Fix 1: Update System Prompt** (15 min)

**File**: `agent_orchestrator.py` (line 253)

Add this BEFORE `base_prompt`:

```python
async def _build_medical_system_prompt(
    self,
    agent: Dict[str, Any],
    request: AgentQueryRequest
) -> str:
    """Build comprehensive medical system prompt with RAG/Tool enforcement"""
    agent_type = agent.get("type", "general")
    specialty = request.medical_specialty or "general"

    # CRITICAL: Enforce RAG and Tool Usage
    base_prompt = f"""You are a specialized medical AI assistant for {specialty.replace('_', ' ').title()}.

## 🔴 CRITICAL INSTRUCTIONS (MUST FOLLOW):

1. **USE RAG KNOWLEDGE BASE FIRST**:
   - ALWAYS reference the provided context documents below
   - Cite specific sources using [Source 1], [Source 2] format
   - If context is insufficient, explicitly state: "Based on available knowledge..."

2. **USE WEB SEARCH WHEN NEEDED**:
   - For recent updates (2024+)
   - For real-time data
   - For information not in knowledge base

3. **USE TOOLS WHEN APPLICABLE**:
   - calculator: For any numerical calculations
   - database_query: For querying internal data
   - web_search: For latest information

4. **ALWAYS CITE SOURCES**:
   - Every claim must reference a source: [Source N]
   - Format: "According to [Source 1], ..."
   - Include document title and year

## Expert Knowledge Areas:
- Clinical medicine and evidence-based practice
- Regulatory affairs and compliance (FDA, EMA, ICH-GCP)
- Medical research methodology and biostatistics
- Healthcare quality systems and risk management

Your responses must maintain the highest standards of medical accuracy and professional responsibility.
"""
    # ... rest of existing code
```

---

### **Fix 2: Add Tool Execution to Mode 1** (1-2 hours)

**File**: `mode1_manual_workflow.py`

**Implement** (use the guide I created earlier):
1. Import `ToolChainMixin`
2. Add tool execution logic in `execute_agent_node`
3. Check if `enable_tools=True` and `selected_tools` exist
4. Execute tool chain if query requires it

**See**: `GUIDE_TOOLS_INTEGRATION.md` for step-by-step

---

### **Fix 3: Add AI Reasoning Streaming** (1-2 hours)

#### **Backend: LangGraph Streaming**

**File**: `mode1_manual_workflow.py`

Add streaming support:

```python
from langgraph.config import get_stream_writer

@trace_node("mode1_execute_agent")
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Execute agent with reasoning streaming"""
    
    # Get stream writer for custom data
    writer = get_stream_writer()
    
    # Stream reasoning steps
    writer({"type": "reasoning", "content": "🔍 Analyzing query..."})
    
    # ... RAG retrieval logic ...
    
    if retrieved_documents:
        writer({"type": "reasoning", "content": f"📚 Found {len(retrieved_documents)} relevant sources"})
    
    # ... tool execution logic ...
    
    if tools_used:
        writer({"type": "reasoning", "content": f"🔧 Using tools: {', '.join(tools_used)}"})
    
    writer({"type": "reasoning", "content": "💭 Generating response with citations..."})
    
    # ... agent execution ...
    
    return {**state, ...}
```

#### **Frontend: AI Reasoning Component**

Install Shadcn AI components:

```bash
npx shadcn@latest add https://www.shadcn.io/registry/ai.json
```

This adds:
- `<Reasoning>` component (collapsible thinking blocks)
- Auto-expands during streaming
- Auto-collapses when complete
- Shows duration

**Update** `EnhancedMessageDisplay.tsx`:

```typescript
import { Reasoning } from '@/components/ai/reasoning'

// In message display:
{metadata?.reasoning && (
  <Reasoning
    isAnimating={isStreaming}
    duration={metadata.reasoningDuration}
  >
    {metadata.reasoning.map((step, i) => (
      <div key={i}>{step}</div>
    ))}
  </Reasoning>
)}
```

---

### **Fix 4: Citations Display** (30 min)

**Issue**: RAG returns sources but they're not formatted correctly for frontend

**File**: `mode1_manual_workflow.py` (line 357)

**Current**:
```python
sources.append({
    'id': doc.get('id', f'source_{idx}'),
    'title': doc.get('title', doc.get('source', f'Source {idx}')),
    'content': doc.get('content', '')[:500],
    'url': doc.get('url', ''),
    'similarity_score': doc.get('similarity', 0.0),
    'metadata': doc.get('metadata', {})
})
```

**Fix**: Add citation numbers:

```python
sources.append({
    'id': doc.get('id', f'source_{idx}'),
    'number': idx,  # ADD THIS for [Source N] format
    'title': doc.get('title', doc.get('source', f'Source {idx}')),
    'content': doc.get('content', '')[:500],
    'excerpt': doc.get('content', '')[:200],  # ADD THIS for hover preview
    'url': doc.get('url', ''),
    'similarity': doc.get('similarity', 0.0),  # Rename similarity_score → similarity
    'metadata': doc.get('metadata', {})
})
```

---

## **IMPLEMENTATION PRIORITY**

### **Phase 1: Quick Wins** (1-2 hours)
1. ✅ **Update system prompt** (15 min) - Force RAG/tool usage
2. ✅ **Fix citations format** (30 min) - Add number, excerpt fields
3. ✅ **Test RAG retrieval** (15 min) - Verify sources appear

### **Phase 2: Tools** (2-3 hours)
4. **Add tool execution to Mode 1** - Follow `GUIDE_TOOLS_INTEGRATION.md`

### **Phase 3: AI Reasoning** (2-3 hours)
5. **Add reasoning streaming backend** - LangGraph custom mode
6. **Add reasoning UI frontend** - Shadcn AI components

---

## **EXPECTED RESULTS AFTER FIXES**

### **Console Output**:
```json
{
  "ragSummary": {
    "totalSources": 5-10,  // ✅ NOT 0
    "domains": ["Digital Health", "Regulatory Affairs"]
  },
  "toolSummary": {
    "used": ["web_search", "calculator"],  // ✅ NOT []
    "totals": { "calls": 2 }
  },
  "sources": [
    {
      "number": 1,  // ✅ For [Source 1]
      "title": "FDA Guidance 2019",
      "excerpt": "Clinical decision support...",  // ✅ For hover preview
      "similarity": 0.85
    }
  ],
  "reasoning": [  // ✅ NEW
    "🔍 Analyzing query...",
    "📚 Found 7 relevant sources",
    "🔧 Using web_search tool",
    "💭 Generating response..."
  ]
}
```

### **UI Display**:
```
┌─ 🤔 Thinking... (2.3s) ─┐  ← Collapsible reasoning
│ 🔍 Analyzing query...    │
│ 📚 Found 7 sources       │
│ 🔧 Using web_search      │
└──────────────────────────┘

Response text with [Source 1] [Source 2] citations...

┌─ 📚 7 Sources ─┐  ← Collapsible sources
│ 1. FDA Guidance (2019) - 0.85 similarity │
│ 2. Clinical Decision... │
└────────────────────────┘
```

---

## **FILES TO MODIFY**

| File | Changes | Time |
|------|---------|------|
| `agent_orchestrator.py` | Update system prompt | 15 min |
| `mode1_manual_workflow.py` | Fix citations format | 30 min |
| `mode1_manual_workflow.py` | Add tool execution | 2-3 hrs |
| `mode1_manual_workflow.py` | Add reasoning streaming | 1-2 hrs |
| `EnhancedMessageDisplay.tsx` | Add reasoning UI | 30 min |

**Total Time**: 4-6 hours for full implementation

---

## **NEXT STEPS**

**IMMEDIATE** (Do now):
1. Update system prompt ← **Start here!**
2. Fix citations format
3. Test RAG

**THIS WEEK**:
4. Implement tools (use guide)
5. Add AI reasoning streaming

---

**Would you like me to start with Phase 1 (Quick Wins)?**
- Update system prompt (15 min)
- Fix citations format (30 min)
- Test immediately

Or implement everything end-to-end? (4-6 hours)

