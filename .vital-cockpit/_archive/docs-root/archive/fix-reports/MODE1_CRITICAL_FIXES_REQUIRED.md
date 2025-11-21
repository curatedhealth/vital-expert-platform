# 🔴 MODE 1 CRITICAL ISSUES - Fix Required

## **Issue 1: RAG Domain Mapping Failure** 

### **Problem**: 
Agent's `rag_domains` metadata uses **slugs** that don't exist as Pinecone namespaces:

**Agent sends**:
```json
["clinical_validation", "cybersecurity_medical_devices", "digital_health_reimbursement", 
 "digital_therapeutics", "fda_samd_regulation", "health_technology_assessment", "real_world_evidence"]
```

**Pinecone actually has**:
```
digital-health (3010 vectors)
regulatory-affairs (511 vectors)
```

**Result**: All 7 domain lookups fail → fallback to `'domains-knowledge'` (empty namespace) → **0 sources**

### **Root Cause**:
1. `knowledge_domains` table has `domain_name` column
2. Agent's `metadata.rag_domains` are stored as **slugs** (e.g., `"digital_therapeutics"`)
3. Pinecone namespaces use **kebab-case** (e.g., `"digital-health"`)
4. No mapping between slugs → namespaces

### **Fix Strategy**:
**Option A**: Query `knowledge_domains` table to map `domain_name` → `pinecone_namespace`  
**Option B**: Standardize all domain identifiers to use `domain_id` (UUID)  
**Option C**: Add explicit slug → namespace mapping in code

**Recommended**: **Option A** (database-driven, scalable)

---

##

 **Issue 2: Python Error in `unified_rag_service.py`**

### **Problem**:
```
⚠️ [HYBRID_SEARCH] Namespace 'domains-knowledge' failed: 
cannot access local variable 'effective_threshold' where it is not associated with a value
```

### **Root Cause**:
Line 649: `effective_threshold = 0.3` is defined **inside** the `for match in matches` loop  
Line 663: `logger.info(f"...score < {effective_threshold:.4f}")` tries to access it **outside** the loop  
If `matches` is empty, `effective_threshold` is never defined → Python error

### **Fix**:
Move `effective_threshold = 0.3` **outside** the loop (before line 635)

---

## **Issue 3: Chat Completion Not Streaming**

### **Problem**:
- Response generated: `response_length": 2154` (2.1KB)
- Frontend received: `Content length: 0` (nothing!)
- Streaming works for workflow steps, but **NOT** for LLM tokens

### **Root Cause**:
LangGraph's `stream_mode=["messages"]` expects the node to either:
1. Use a **ReAct agent** (which streams automatically), OR
2. **Manually emit chunks** via `writer()` during `.astream()`

Our current code collects chunks into `full_response` but **never emits them**:
```python
full_response = ""
async for chunk in self.llm.astream(messages):
    if hasattr(chunk, 'content') and chunk.content:
        full_response += chunk.content
        # ❌ MISSING: writer(chunk) to stream to frontend!
```

### **Fix**:
Emit chunks as they arrive:
```python
async for chunk in self.llm.astream(messages):
    if hasattr(chunk, 'content') and chunk.content:
        full_response += chunk.content
        # ✅ Emit chunk for LangGraph to stream
        writer({
            "type": "message_chunk",
            "chunk": chunk.content
        })
```

---

## **RECOMMENDED FIX ORDER**

### **Priority 1**: Fix Python Error (5 min)
- Move `effective_threshold` declaration outside loop
- Prevents crashes in RAG service

### **Priority 2**: Fix RAG Domain Mapping (20-30 min)
- Query `knowledge_domains` table
- Map agent's domain slugs to Pinecone namespaces
- Update domain mapping cache

### **Priority 3**: Fix Chat Streaming (20 min)
- Add `writer()` calls in `.astream()` loop
- Emit chunks as they arrive
- Test token-by-token streaming

---

## **ESTIMATED TIME**: 1 hour total

**After These Fixes**:
- ✅ RAG will retrieve sources from correct namespaces
- ✅ Chat completion will stream word-by-word
- ✅ Mode 1 will be production-ready

