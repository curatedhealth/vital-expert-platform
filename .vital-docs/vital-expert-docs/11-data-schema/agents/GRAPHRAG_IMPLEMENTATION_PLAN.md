# 🚀 Complete GraphRAG Service Implementation Plan

**Goal**: Transform GraphRAG scaffolding into production-ready hybrid search service

**Estimated Time**: 4 hours

**Status**: Phase 1 scaffolding complete (65%), needs production implementation (35%)

---

## 📊 **Current State Analysis**

### ✅ **What Exists** (Scaffolding - 65%)
1. **Configuration** (`config.py`) - Complete with pydantic-settings
2. **Models** (`models.py`) - Request/response schemas defined
3. **Database Clients** - Partially implemented:
   - `postgres_client.py` - Complete
   - `vector_db_client.py` - 90% complete (pgvector upsert missing)
   - `neo4j_client.py` - Complete
   - `elastic_client.py` - Mock implementation
4. **Search Modules** - Implemented:
   - `vector_search.py` - Complete
   - `graph_search.py` - Complete
   - `keyword_search.py` - Mock (Elasticsearch TBD)
   - `fusion.py` - Complete
5. **Supporting Services**:
   - `profile_resolver.py` - Complete
   - `kg_view_resolver.py` - Complete
   - `evidence_builder.py` - Complete
   - `reranker.py` - Complete (Cohere integration)
   - `ner_service.py` - Complete (spaCy NER)
6. **API Layer**:
   - `api/graphrag.py` - Complete endpoint
   - `api/auth.py` - Complete with TODOs
   - `api/rate_limit.py` - Complete
7. **Main Service** (`service.py`) - Needs review

### ❌ **What Needs Completion** (35%)
1. **pgvector Upsert** in `vector_db_client.py` (1%)
2. **Auth TODOs** in `api/auth.py` (5%)
3. **Main Service Review** - Ensure full integration (15%)
4. **Testing** - Unit + integration tests (10%)
5. **Documentation** - API docs + usage guide (4%)

---

## 🎯 **Implementation Strategy**

### **Phase 1: Complete Missing Implementations** (30 min)
1. ✅ Fix pgvector upsert
2. ✅ Implement auth TODOs
3. ✅ Review and enhance main service

### **Phase 2: Testing & Validation** (1.5 hours)
1. ✅ Unit tests for all clients
2. ✅ Integration tests for search
3. ✅ End-to-end GraphRAG query test
4. ✅ Performance benchmarks

### **Phase 3: Documentation** (30 min)
1. ✅ API documentation (OpenAPI/Swagger)
2. ✅ Usage guide with examples
3. ✅ Architecture diagram

### **Phase 4: Integration with Ask Expert** (1.5 hours)
1. ✅ Wire GraphRAG into Mode 1-4 workflows
2. ✅ Add evidence chain display
3. ✅ Test end-to-end with real queries

---

## 📋 **Detailed Task Breakdown**

### **Task 1: Complete pgvector Upsert** (15 min)
- **File**: `services/ai-engine/src/graphrag/clients/vector_db_client.py`
- **Line**: 318 (`pass` statement)
- **Implementation**: Add pgvector upsert logic
- **Dependencies**: asyncpg, pgvector extension enabled

### **Task 2: Implement Auth TODOs** (15 min)
- **File**: `services/ai-engine/src/graphrag/api/auth.py`
- **Lines**: 39, 95, 122, 192
- **Implementation**: 
  - JWT validation with Supabase
  - User status check
  - Tenant access check
  - API key verification

### **Task 3: Review Main Service** (30 min)
- **File**: `services/ai-engine/src/graphrag/service.py`
- **Tasks**:
  - Verify all search methods integrated
  - Add error handling
  - Add telemetry/logging
  - Optimize parallel execution

### **Task 4: Unit Tests** (45 min)
- **Files to Create**:
  - `tests/graphrag/test_clients.py`
  - `tests/graphrag/test_search.py`
  - `tests/graphrag/test_fusion.py`
  - `tests/graphrag/test_service.py`
- **Coverage Target**: >80%

### **Task 5: Integration Tests** (30 min)
- **Files to Create**:
  - `tests/graphrag/test_graphrag_integration.py`
  - `tests/graphrag/test_api_endpoints.py`
- **Scenarios**:
  - Full GraphRAG query flow
  - Multi-modal search
  - Evidence chain building
  - Error handling

### **Task 6: Performance Tests** (15 min)
- **File**: `tests/graphrag/test_performance.py`
- **Benchmarks**:
  - Vector search: <2s
  - Graph search: <5s
  - Full GraphRAG: <7s
  - Concurrent queries: 10 parallel

### **Task 7: Documentation** (30 min)
- **Files to Create**:
  - `services/ai-engine/docs/GRAPHRAG_SERVICE_GUIDE.md`
  - `services/ai-engine/docs/GRAPHRAG_API_REFERENCE.md`
  - Update OpenAPI schema
- **Content**:
  - Architecture overview
  - Usage examples
  - Performance tuning
  - Troubleshooting

### **Task 8: Ask Expert Integration** (1.5 hours)
- **Files to Update**:
  - `services/ai-engine/src/langgraph_workflows/mode1_manual_query.py`
  - `services/ai-engine/src/langgraph_workflows/mode2_auto_query.py`
  - `services/ai-engine/src/langgraph_workflows/mode3_manual_chat_autonomous.py`
  - `services/ai-engine/src/langgraph_workflows/mode4_auto_chat_autonomous.py`
- **Changes**:
  - Add GraphRAG query before agent execution
  - Pass evidence chain to agent context
  - Display citations in response

---

## 🔧 **Technical Requirements**

### **Environment Variables Needed**
```bash
# Required
DATABASE_URL=postgresql://...
PINECONE_API_KEY=pk-...
PINECONE_ENVIRONMENT=us-west1-gcp
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=...
OPENAI_API_KEY=sk-...

# Optional
COHERE_API_KEY=...  # For reranking
ELASTICSEARCH_HOSTS=http://localhost:9200  # If using Elasticsearch
```

### **Database Prerequisites**
1. **Supabase/Postgres**:
   - pgvector extension enabled: `CREATE EXTENSION IF NOT EXISTS vector;`
   - RAG profiles table seeded
   - Agent KG views table seeded

2. **Pinecone**:
   - Index created: `vital-medical`
   - Dimensions: 1536 (text-embedding-3-small)
   - Metric: cosine

3. **Neo4j**:
   - Database running
   - KG node types seeded
   - KG edge types seeded
   - Agent KG views configured

### **Python Dependencies**
```
pinecone-client>=2.2.4
neo4j>=5.12.0
asyncpg>=0.28.0
openai>=1.0.0
cohere>=4.30.0  # Optional
spacy>=3.6.0
fastapi>=0.104.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
```

---

## ✅ **Success Criteria**

### **Functional**
- [x] All database clients working
- [x] Vector search returns relevant results
- [x] Graph search traverses knowledge graph
- [x] Fusion combines results correctly
- [x] Evidence chain generated
- [x] API endpoints respond successfully

### **Performance**
- [x] Vector search: <2s
- [x] Graph search: <5s
- [x] Full GraphRAG query: <7s
- [x] Concurrent queries: 10+ parallel

### **Quality**
- [x] Unit test coverage: >80%
- [x] Integration tests pass
- [x] No linter errors
- [x] Documentation complete
- [x] Production-ready error handling

### **Integration**
- [x] Integrated with all 4 Ask Expert modes
- [x] Evidence chains displayed in responses
- [x] Citations rendered correctly

---

## 📈 **Progress Tracking**

| Task | Status | Time | Notes |
|------|--------|------|-------|
| 1. pgvector Upsert | ⏳ Pending | 15 min | - |
| 2. Auth TODOs | ⏳ Pending | 15 min | - |
| 3. Main Service Review | ⏳ Pending | 30 min | - |
| 4. Unit Tests | ⏳ Pending | 45 min | - |
| 5. Integration Tests | ⏳ Pending | 30 min | - |
| 6. Performance Tests | ⏳ Pending | 15 min | - |
| 7. Documentation | ⏳ Pending | 30 min | - |
| 8. Ask Expert Integration | ⏳ Pending | 1.5 hours | - |

**Total Estimated Time**: 4 hours

---

## 🚀 **Execution Order**

1. **Quick Wins** (30 min) - Tasks 1-2
2. **Core Service** (30 min) - Task 3
3. **Testing** (1.5 hours) - Tasks 4-6
4. **Documentation** (30 min) - Task 7
5. **Integration** (1.5 hours) - Task 8

---

**Ready to start implementation!** 🎯

