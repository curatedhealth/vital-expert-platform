# LangChain 1.0 Migration - Critical Files Audit

## 🎯 Strategic Priority: Ensure All LangChain 1.0 Breaking Changes Are Addressed

After upgrading to LangChain 1.0, we need to audit **42 files** that use LangChain/LangGraph.

---

## ✅ **ALREADY FIXED** (Phase 1)

### 1. **Core Migration Files**
- [x] `src/services/agent_orchestrator.py` - Migrated to `create_react_agent` from `langgraph.prebuilt`
- [x] `src/services/medical_rag.py` - Updated `langchain.text_splitter` → `langchain_text_splitters`
- [x] `src/services/knowledge_pipeline_integration.py` - Updated text splitter import
- [x] `src/scripts/reprocess_documents.py` - Updated text splitter import
- [x] `src/scripts/process_documents_huggingface.py` - Updated text splitter import
- [x] `src/services/prompt_enhancement_service.py` - Updated `langchain.schema` → `langchain_core.messages`
- [x] `src/main.py` - Added `workflow.graph.compile()` before `astream()`
- [x] `src/main.py` - Added JSON serialization for `AIMessageChunk` objects

---

## 🔴 **HIGH PRIORITY** - Streaming & Message Handling (Critical for Mode 1-4)

These files handle real-time streaming and need **immediate attention**:

### 2. **LangGraph Workflows** (All Modes)
- [ ] `src/langgraph_workflows/mode1_manual_workflow.py` ✅ **FIXED** (using compiled graph)
- [ ] `src/langgraph_workflows/mode2_automatic_workflow.py` ⚠️ **NEEDS AUDIT**
- [ ] `src/langgraph_workflows/mode3_autonomous_auto_workflow.py` ⚠️ **NEEDS AUDIT** (has AIMessage usage)
- [ ] `src/langgraph_workflows/mode4_autonomous_manual_workflow.py` ⚠️ **NEEDS AUDIT** (has AIMessage usage)
- [ ] `src/langgraph_workflows/base_workflow.py` ⚠️ **NEEDS AUDIT** (base class for all workflows)

**Check for:**
- `.astream()` calls without `.compile()`
- `AIMessageChunk` serialization
- `.dict()` vs `.model_dump()`
- Message object handling

### 3. **Services - Streaming & Messages**
- [ ] `src/services/streaming_manager.py` ⚠️ **HIGH PRIORITY** (handles all streaming logic)
- [ ] `src/services/session_memory_service.py` ⚠️ **NEEDS AUDIT** (stores message history)
- [ ] `src/services/enhanced_agent_selector.py` ⚠️ **NEEDS AUDIT** (has AIMessage usage)
- [ ] `src/services/embedding_service.py` ⚠️ **NEEDS AUDIT**

---

## 🟡 **MEDIUM PRIORITY** - RAG & Knowledge Services

These affect **RAG retrieval** (currently returning 0 sources):

### 4. **RAG Services**
- [ ] `src/services/unified_rag_service.py` ⚠️ **CRITICAL** (RAG not working - 0 sources)
  - Check: Domain name → namespace mapping
  - Check: Pinecone query format
  - Check: Vector search compatibility
  - Check: Embedding model compatibility (text-embedding-3-large)

- [ ] `src/services/medical_rag.py` ✅ **PARTIALLY FIXED** (text splitter updated)
  - Check: Full RAG pipeline for LangChain 1.0
  
- [ ] `src/services/knowledge_pipeline_integration.py` ✅ **PARTIALLY FIXED** (text splitter updated)
  - Check: Document processing pipeline

- [ ] `src/services/graph_relationship_builder.py` ⚠️ **NEEDS AUDIT**
- [ ] `src/services/hybrid_agent_search.py` ⚠️ **NEEDS AUDIT**

---

## 🟢 **LOW PRIORITY** - Support & Utility Files

### 5. **Workflow Support Files**
- [ ] `src/langgraph_workflows/__init__.py` ℹ️ **LOW** (just imports)
- [ ] `src/langgraph_workflows/state_schemas.py` ℹ️ **LOW** (TypedDict definitions)
- [ ] `src/langgraph_workflows/checkpoint_manager.py` ⚠️ **NEEDS AUDIT** (checkpointing)
- [ ] `src/langgraph_workflows/enrichment_nodes.py` ℹ️ **LOW**
- [ ] `src/langgraph_workflows/feedback_nodes.py` ℹ️ **LOW**
- [ ] `src/langgraph_workflows/memory_nodes.py` ⚠️ **NEEDS AUDIT** (memory handling)
- [ ] `src/langgraph_workflows/tool_chain_executor.py` ⚠️ **NEEDS AUDIT** (tool execution)
- [ ] `src/langgraph_workflows/tool_chain_mixin.py` ⚠️ **NEEDS AUDIT**

### 6. **Legacy/Backup Files** (Can be deleted if not used)
- [ ] `src/langgraph_workflows/mode1_enhanced_workflow.py` 🗑️ **DELETE?**
- [ ] `src/langgraph_workflows/mode1_interactive_auto_workflow.py` 🗑️ **DELETE?** (old naming)
- [ ] `src/langgraph_workflows/mode1_manual_workflow_old.py` 🗑️ **DELETE** (backup)
- [ ] `src/langgraph_workflows/mode1_manual_workflow_simple.py` 🗑️ **DELETE?**

### 7. **Agent Templates**
- [ ] `src/agents/clinical_researcher.py` ℹ️ **LOW**
- [ ] `src/agents/medical_specialist.py` ℹ️ **LOW**
- [ ] `src/agents/regulatory_expert.py` ℹ️ **LOW**

### 8. **Utility Services**
- [ ] `src/services/tool_registry_service.py` ⚠️ **NEEDS AUDIT** (tool binding for LLMs)
- [ ] `src/services/confidence_calculator.py` ℹ️ **LOW**
- [ ] `src/services/embedding_service_factory.py` ℹ️ **LOW**
- [ ] `src/services/prompt_enhancement_service.py` ✅ **FIXED** (schema import updated)

---

## 🧪 **TEST FILES** (Update After Fixing Core Files)

### 9. **Integration & Unit Tests**
- [ ] `src/tests/test_mode1_workflow.py` ⚠️ **UPDATE AFTER MODE 1 FIX**
- [ ] `src/tests/test_mode2_workflow.py` ⚠️ **UPDATE AFTER MODE 2 FIX**
- [ ] `src/tests/test_mode3_workflow.py` ⚠️ **UPDATE AFTER MODE 3 FIX**
- [ ] `src/tests/test_mode4_workflow.py` ⚠️ **UPDATE AFTER MODE 4 FIX**
- [ ] `src/tests/integration/test_all_modes_integration.py` ⚠️ **UPDATE LAST**
- [ ] `src/tests/test_memory_integration.py` ℹ️ **LOW**
- [ ] `src/tests/test_phase2_memory.py` ℹ️ **LOW**
- [ ] `src/tests/test_phase5_integration.py` ℹ️ **LOW**
- [ ] `src/tests/test_tool_chain_executor.py` ⚠️ **NEEDS AUDIT**

---

## 📋 **STRATEGIC AUDIT PLAN**

### **Phase 1: Fix Streaming (NOW)** ✅ DONE
1. ✅ `main.py` - Add `.compile()` before `astream()`
2. ✅ `main.py` - Fix JSON serialization for `AIMessageChunk`

### **Phase 2: Fix RAG (URGENT)**
1. 🔴 **`unified_rag_service.py`** - Why RAG returns 0 sources
   - Domain name mapping issue?
   - Pinecone namespace issue?
   - Embedding model mismatch?

### **Phase 3: Audit All Workflows (1-2 hours)**
1. 🟡 `mode2_automatic_workflow.py` - Check for `.astream()` usage
2. 🟡 `mode3_autonomous_auto_workflow.py` - Check AIMessage handling
3. 🟡 `mode4_autonomous_manual_workflow.py` - Check AIMessage handling
4. 🟡 `base_workflow.py` - Check base class for breaking changes

### **Phase 4: Audit Support Services (1-2 hours)**
1. 🟡 `streaming_manager.py` - Check streaming logic
2. 🟡 `session_memory_service.py` - Check message storage
3. 🟡 `tool_registry_service.py` - Check tool binding

### **Phase 5: Update Tests (1 hour)**
1. Run all tests
2. Fix failing tests based on LangChain 1.0 changes

---

## 🔍 **COMMON BREAKING CHANGES TO CHECK**

### 1. **`.dict()` → `.model_dump()`** (Pydantic v2)
```python
# OLD (Pydantic v1 / LangChain 0.2)
message.dict()

# NEW (Pydantic v2 / LangChain 1.0)
message.model_dump()
```

### 2. **`.astream()` Requires `.compile()`**
```python
# OLD
async for chunk in workflow.graph.astream(...):

# NEW
compiled_graph = workflow.graph.compile()
async for chunk in compiled_graph.astream(...):
```

### 3. **Import Paths Changed**
```python
# OLD
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import HumanMessage, AIMessage
from langchain.agents import create_openai_tools_agent

# NEW
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.prebuilt import create_react_agent
```

### 4. **JSON Serialization for Streaming**
```python
# AIMessageChunk needs to be converted before JSON serialization
if hasattr(chunk, 'dict'):
    serializable_chunk = chunk.dict()
elif hasattr(chunk, 'model_dump'):
    serializable_chunk = chunk.model_dump()
```

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **RIGHT NOW** (You should test this):
- Test Mode 1 with the JSON serialization fix
- Verify streaming LLM tokens work
- Check if RAG sources appear

### **NEXT** (If RAG still returns 0 sources):
1. Audit `unified_rag_service.py` for domain mapping issues
2. Check Pinecone namespace mapping
3. Verify embedding model compatibility

### **THEN** (After Mode 1 works):
1. Audit Mode 2, 3, 4 workflows
2. Update all tests
3. Run full integration test suite

---

## 📊 **AUDIT PROGRESS**

**Total Files**: 42  
**Fixed**: 8 (19%)  
**High Priority Remaining**: 9 (21%)  
**Medium Priority Remaining**: 5 (12%)  
**Low Priority Remaining**: 20 (48%)

**Estimated Time to Complete Full Audit**: 6-8 hours  
**Critical Path**: RAG Service → Mode 2-4 Workflows → Tests

---

## 🚨 **CURRENT BLOCKER**

**RAG Returning 0 Sources** despite:
- RAG enabled: ✅
- Domain selected: "Digital Health" ✅
- Pinecone index populated: 3010 vectors in `digital-health` namespace ✅
- Embedding model: `text-embedding-3-large` (3072 dims) ✅

**Hypothesis**: Domain name → namespace mapping issue in `unified_rag_service.py`

**Next Step**: Audit `unified_rag_service.py` line-by-line for LangChain 1.0 compatibility

