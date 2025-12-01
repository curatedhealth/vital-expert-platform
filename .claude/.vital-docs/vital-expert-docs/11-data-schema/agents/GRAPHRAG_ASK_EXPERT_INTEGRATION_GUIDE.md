# 🔗 GraphRAG Integration with Ask Expert - Implementation Guide

**Goal**: Wire GraphRAG service into all 4 Ask Expert modes for intelligent context retrieval

**Estimated Time**: 1 hour

---

## 📋 **Integration Strategy**

### **What GraphRAG Provides**
1. **Multi-modal search** - Vector + Keyword + Graph
2. **Evidence chains** - Provenance for every piece of information
3. **Citations** - [1], [2], [3] with sources
4. **Agent-specific filtering** - RAG profiles + KG views
5. **Fusion-ranked results** - Best context from multiple sources

### **Where to Integrate**
- **Mode 1 (Manual-Interactive)**: Before agent execution
- **Mode 2 (Auto-Interactive)**: Before agent execution
- **Mode 3 (Manual-Autonomous)**: Before planning phase
- **Mode 4 (Auto-Autonomous)**: Before multi-expert orchestration

---

## 🔧 **Implementation Plan**

### **Step 1: Add GraphRAG Service to Workflows** (15 min)

Each mode needs:
1. Import GraphRAG service
2. Initialize service in `__init__`
3. Add GraphRAG query node
4. Pass context to agent

### **Step 2: Update State Models** (10 min)

Add to `UnifiedWorkflowState`:
- `graphrag_context`: Context chunks from GraphRAG
- `evidence_chain`: Evidence provenance
- `citations`: Citation list

### **Step 3: Create GraphRAG Node** (15 min)

Shared node for all modes:
```python
async def graphrag_query_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    # 1. Call GraphRAG service
    # 2. Get context + evidence
    # 3. Add to state
    # 4. Return enhanced state
```

### **Step 4: Integrate into Each Mode** (20 min)

- Mode 1: Insert after `validate_agent_selection`
- Mode 2: Insert after `select_experts_auto`
- Mode 3: Insert after `analyze_task_complexity`
- Mode 4: Insert after `select_experts_auto`

---

## 📝 **Implementation Details**

### **Files to Update**

1. `services/ai-engine/src/langgraph_workflows/state.py`
   - Add GraphRAG fields to state

2. `services/ai-engine/src/langgraph_workflows/shared_nodes.py` (create)
   - Shared GraphRAG query node

3. `services/ai-engine/src/langgraph_workflows/mode1_manual_query.py`
   - Add GraphRAG query before agent execution

4. `services/ai-engine/src/langgraph_workflows/mode2_auto_query.py`
   - Add GraphRAG query before agent execution

5. `services/ai-engine/src/langgraph_workflows/mode3_manual_chat_autonomous.py`
   - Add GraphRAG query before planning

6. `services/ai-engine/src/langgraph_workflows/mode4_auto_chat_autonomous.py`
   - Add GraphRAG query before orchestration

---

## 💡 **Code Examples**

### **Shared GraphRAG Node**

```python
from graphrag.service import get_graphrag_service
from graphrag.models import GraphRAGRequest

async def graphrag_query_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Shared node: Query GraphRAG for context retrieval
    """
    try:
        # Get GraphRAG service
        graphrag = await get_graphrag_service()
        
        # Create request
        request = GraphRAGRequest(
            query=state['query'],
            agent_id=state.get('current_agent_id') or state.get('selected_agents', [None])[0],
            session_id=state['session_id'],
            tenant_id=state['tenant_id'],
            rag_profile_id=state.get('rag_profile_id')
        )
        
        # Execute GraphRAG query
        response = await graphrag.query(request)
        
        # Add to state
        return {
            **state,
            'graphrag_context': response.context_chunks,
            'evidence_chain': response.evidence_chain,
            'citations': [chunk['citation_id'] for chunk in response.context_chunks],
            'graphrag_metadata': response.metadata,
            'current_node': 'graphrag_query'
        }
    
    except Exception as e:
        logger.error("GraphRAG query failed", error=str(e))
        # Continue without GraphRAG if it fails
        return {
            **state,
            'graphrag_context': [],
            'evidence_chain': [],
            'citations': [],
            'graphrag_error': str(e),
            'current_node': 'graphrag_query'
        }
```

### **Integration in Mode 1**

```python
# In build_graph()
graph.add_node("graphrag_query", self.graphrag_query_node)

# Add edge after agent selection
graph.add_edge("validate_agent_selection", "graphrag_query")
graph.add_edge("graphrag_query", "analyze_query_complexity")

# Update agent execution to use GraphRAG context
async def execute_expert_agent_node(self, state: UnifiedWorkflowState):
    # ... existing code ...
    
    # Add GraphRAG context to agent prompt
    context_str = "\n\n".join([
        f"[{chunk['citation_id']}] {chunk['text']}"
        for chunk in state.get('graphrag_context', [])
    ])
    
    enhanced_prompt = f"""
    Context from knowledge base:
    {context_str}
    
    User query: {state['query']}
    
    Please provide a response based on the context above. Cite sources using [1], [2], etc.
    """
    
    # ... rest of agent execution ...
```

---

## 🎯 **Success Criteria**

### **Functional**
- [ ] GraphRAG queries execute successfully
- [ ] Context is retrieved and added to state
- [ ] Evidence chains are built
- [ ] Citations are assigned
- [ ] Agents receive enhanced context
- [ ] Responses include citations

### **Quality**
- [ ] No errors when GraphRAG fails (graceful degradation)
- [ ] Context is relevant to query
- [ ] Evidence chains are complete
- [ ] Citations are properly formatted

### **Performance**
- [ ] GraphRAG adds <7s to response time
- [ ] No blocking of agent execution
- [ ] Proper async/await patterns

---

## 📊 **Expected Results**

### **Before Integration**
```json
{
  "response": "Metformin is used for Type 2 diabetes.",
  "agent_name": "Endocrinology Expert",
  "tier": "tier_2"
}
```

### **After Integration**
```json
{
  "response": "Metformin is used for Type 2 diabetes [1]. It works by reducing glucose production in the liver [2].",
  "agent_name": "Endocrinology Expert",
  "tier": "tier_2",
  "citations": [
    {
      "id": "[1]",
      "text": "Metformin is a first-line medication for Type 2 diabetes",
      "source": "ADA Guidelines 2023",
      "confidence": 0.95
    },
    {
      "id": "[2]",
      "text": "Metformin reduces hepatic glucose production",
      "source": "Pharmacology Review",
      "confidence": 0.88
    }
  ],
  "evidence_chain": [...],
  "graphrag_metadata": {
    "search_methods": ["vector", "graph"],
    "total_results": 8,
    "profile_used": "hybrid_enhanced"
  }
}
```

---

## 🚀 **Implementation Order**

1. ✅ Update state models (5 min)
2. ✅ Create shared GraphRAG node (10 min)
3. ✅ Integrate Mode 1 (10 min)
4. ✅ Integrate Mode 2 (10 min)
5. ✅ Integrate Mode 3 (10 min)
6. ✅ Integrate Mode 4 (10 min)
7. ✅ Test end-to-end (15 min)

**Total**: 1 hour

---

**Ready to implement!** 🎯

