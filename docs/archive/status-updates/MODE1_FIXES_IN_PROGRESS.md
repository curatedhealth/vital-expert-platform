# ✅ MODE 1 FIXES - In Progress

## **Status**: 1 of 3 Fixed

### ✅ **Fix 1: Python Error Fixed** (DONE - 5 min)
**File**: `services/ai-engine/src/services/unified_rag_service.py`  
**Change**: Moved `effective_threshold = 0.3` **outside** the loop (line 642)  
**Before**: Line 649 (inside loop)  
**After**: Line 642 (before loop)  
**Impact**: No more `UnboundLocalError` crashes

---

### 🔄 **Fix 2: RAG Domain Mapping** (IN PROGRESS - 20-30 min)

**Problem**: Agent sends domain slugs, Pinecone uses different namespaces.

**Current Flow**:
1. Agent metadata: `rag_domains: ["clinical_validation", "digital_therapeutics", ...]`
2. AI Engine: Queries `knowledge_domains` table for namespace mapping
3. Cache lookup: `_get_namespace_for_domain("clinical_validation")` → NOT FOUND
4. Fallback: Uses `"domains-knowledge"` → Returns 0 sources

**Fix Required**:
- Update `_load_domain_namespace_mappings()` to map **all domain naming conventions**:
  - UUID: `domain_id`
  - Slug: `domain_name` (from table)
  - Lowercase: `domain_name.lower()`
  - Kebab: Convert spaces/underscores to hyphens

**Implementation** (2 sub-tasks):

#### **Sub-task 2a: Update Domain Mapping Cache**
File: `unified_rag_service.py` → `_load_domain_namespace_mappings()`

```python
async def _load_domain_namespace_mappings(self):
    # Query: SELECT domain_id, domain_name, pinecone_namespace FROM knowledge_domains WHERE is_active = true
    
    for domain in domains:
        domain_id = domain['domain_id']
        domain_name = domain['domain_name']
        namespace = domain.get('pinecone_namespace') or self._slug_to_namespace(domain_name)
        
        # Cache ALL naming conventions:
        self.domain_namespace_cache[domain_id] = namespace  # UUID
        self.domain_namespace_cache[domain_name] = namespace  # Original name
        self.domain_namespace_cache[domain_name.lower()] = namespace  # Lowercase
        self.domain_namespace_cache[self._to_slug(domain_name)] = namespace  # Slug
```

#### **Sub-task 2b: Add Helper Methods**
```python
def _to_slug(self, name: str) -> str:
    """Convert name to slug: 'Digital Health' → 'digital_health'"""
    return name.lower().replace(' ', '_').replace('-', '_')

def _slug_to_namespace(self, name: str) -> str:
    """Convert name to namespace: 'Digital Health' → 'digital-health'"""
    return name.lower().replace(' ', '-').replace('_', '-')
```

**Expected Outcome**:
- `_get_namespace_for_domain("clinical_validation")` → `"clinical-validation"`
- `_get_namespace_for_domain("digital_therapeutics")` → `"digital-health"` (if mapped in DB)
- No more fallback to `"domains-knowledge"`

---

### 🔄 **Fix 3: Chat Streaming** (PENDING - 20 min)

**Problem**: Response generated but not streamed to frontend.

**Root Cause**: `.astream()` chunks not emitted via `writer()`.

**Fix Required**:
File: `langgraph_workflows/mode1_manual_workflow.py` → `execute_agent_node()`

**Before** (Line 557-559):
```python
async for chunk in llm_with_tools.astream(messages):
    if hasattr(chunk, 'content') and chunk.content:
        full_response += chunk.content
```

**After**:
```python
async for chunk in llm_with_tools.astream(messages):
    if hasattr(chunk, 'content') and chunk.content:
        full_response += chunk.content
        # ✅ Emit chunk for LangGraph to stream
        if hasattr(chunk, 'model_dump'):
            writer({
                "type": "message_chunk",
                "chunk": chunk.model_dump()
            })
```

**Apply to 3 locations**:
1. Line 557: With tools binding
2. Line 602: With structured output
3. Line 678: Fallback execution

**Expected Outcome**:
- Frontend receives tokens word-by-word
- Real-time chat completion display
- No more empty responses

---

## **NEXT STEPS**

1. ✅ **DONE**: Fix Python error
2. **NOW**: Fix RAG domain mapping
3. **THEN**: Fix chat streaming
4. **FINALLY**: Restart AI Engine and test

**Estimated Total Time**: 45-60 minutes  
**Current Progress**: 1/3 fixes complete (33%)

