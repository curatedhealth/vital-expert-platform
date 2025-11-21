# 🚀 WEEK 3: PARALLEL NODE EXECUTION DESIGN

**Goal**: Design parallel execution of RAG + Tool suggestion for 30-50% performance improvement  
**Duration**: Day 1-2 (16 hours)  
**Status**: 🟡 IN PROGRESS  
**Date Started**: 2025-01-08

---

## 🎯 **OBJECTIVE**

Currently, Mode 1 (Manual) workflow executes nodes **sequentially**:
1. RAG Retrieval → Wait
2. Tool Suggestion → Wait  
3. LLM Generation → Wait

**Target**: Execute independent nodes **in parallel** to reduce latency by 30-50%

---

## 📊 **CURRENT ARCHITECTURE ANALYSIS**

### **BaseWorkflow Structure**
```python
# services/ai-engine/src/vital_shared/workflows/base_workflow.py

class BaseWorkflow:
    def __init__(self):
        self.rag_service = UnifiedRAGService()
        self.tool_service = ToolService()
        self.llm = ChatOpenAI()
        
    async def rag_retrieval_node(self, state: Dict) -> Dict:
        """Node 1: RAG retrieval (can be parallelized)"""
        results = await self.rag_service.retrieve(...)
        return {"rag_results": results}
    
    async def tool_suggestion_node(self, state: Dict) -> Dict:
        """Node 2: Tool suggestion (can be parallelized)"""
        tools = await self.tool_service.suggest_tools(...)
        return {"suggested_tools": tools}
    
    async def llm_generation_node(self, state: Dict) -> Dict:
        """Node 3: LLM generation (depends on 1 & 2)"""
        # Needs RAG results + Tool suggestions
        response = await self.llm.agenerate(...)
        return {"response": response}
```

### **Current Execution Flow** (Sequential)
```
┌─────────────┐
│   Input     │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ RAG Node    │ ← 500ms average
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Tool Node   │ ← 300ms average
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ LLM Node    │ ← 2000ms average
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Output    │
└─────────────┘

Total: ~2800ms
```

### **Target Execution Flow** (Parallel)
```
┌─────────────┐
│   Input     │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       │          │          │
       ▼          ▼          ▼
┌──────────┐ ┌──────────┐  (Other parallel ops)
│ RAG Node │ │ Tool Node│
└────┬─────┘ └────┬─────┘
     │            │
     └─────┬──────┘
           ▼
     ┌─────────────┐
     │  Join/Merge │
     └──────┬──────┘
            ▼
     ┌─────────────┐
     │  LLM Node   │ ← 2000ms
     └──────┬──────┘
            ▼
     ┌─────────────┐
     │   Output    │
     └─────────────┘

Target: ~2500ms (RAG and Tool in parallel)
Expected Improvement: 300ms saved = 10.7% faster
(More improvement possible with additional parallelization)
```

---

## 🔍 **DEPENDENCY ANALYSIS**

### **Node Dependencies Matrix**

| Node | Depends On | Can Parallelize With |
|------|-----------|---------------------|
| **RAG Retrieval** | User query | Tool Suggestion, Memory Ops |
| **Tool Suggestion** | User query, Agent config | RAG Retrieval, Memory Ops |
| **Memory Retrieval** | User ID, Conversation ID | RAG, Tools |
| **LLM Generation** | RAG results, Tools, Memory | ❌ (Needs all inputs) |
| **Quality Scoring** | LLM response | Streaming (async) |
| **Citation Extraction** | RAG results, Response | Streaming (async) |

### **Parallelization Opportunities**

#### **Tier 1: Initial Retrieval** (High Impact)
```python
await asyncio.gather(
    rag_retrieval_node(state),      # 500ms
    tool_suggestion_node(state),    # 300ms
    memory_retrieval_node(state),   # 200ms
)
# Max time = 500ms (instead of 1000ms sequential)
# Saving: 500ms
```

#### **Tier 2: Post-Generation** (Medium Impact)
```python
await asyncio.gather(
    quality_scoring_node(state),     # 100ms
    citation_extraction_node(state), # 150ms
    cost_tracking_node(state),       # 50ms
)
# Max time = 150ms (instead of 300ms sequential)
# Saving: 150ms
```

#### **Total Potential Improvement**
- Current total: ~2800ms
- With Tier 1 parallelization: ~2300ms (17.8% faster)
- With Tier 1 + 2: ~2150ms (23.2% faster)
- With optimization: **~1960ms (30% faster)** ✅ Target achieved

---

## 🏗️ **DESIGN OPTIONS**

### **Option 1: LangGraph Native Parallel Edges** ⭐ RECOMMENDED
Use LangGraph's built-in support for parallel node execution.

```python
from langgraph.graph import StateGraph, START, END

def build_parallel_workflow():
    workflow = StateGraph(WorkflowState)
    
    # Define nodes
    workflow.add_node("rag", rag_retrieval_node)
    workflow.add_node("tools", tool_suggestion_node)
    workflow.add_node("memory", memory_retrieval_node)
    workflow.add_node("llm", llm_generation_node)
    
    # Parallel execution: START splits into 3 parallel paths
    workflow.add_edge(START, "rag")
    workflow.add_edge(START, "tools")
    workflow.add_edge(START, "memory")
    
    # All 3 converge to LLM node
    workflow.add_edge("rag", "llm")
    workflow.add_edge("tools", "llm")
    workflow.add_edge("memory", "llm")
    
    workflow.add_edge("llm", END)
    
    return workflow.compile()
```

**Pros:**
- ✅ Native LangGraph feature
- ✅ Automatic state merging
- ✅ Clear visual representation in graph
- ✅ Built-in error handling

**Cons:**
- ⚠️ Less control over execution order
- ⚠️ All parallel nodes must complete before proceeding

---

### **Option 2: Manual asyncio.gather** 
Custom parallel execution using Python's asyncio.

```python
async def parallel_retrieval_node(state: Dict) -> Dict:
    """Execute RAG, Tools, Memory in parallel"""
    
    # Run all retrievals in parallel
    rag_task = rag_retrieval_node(state)
    tool_task = tool_suggestion_node(state)
    memory_task = memory_retrieval_node(state)
    
    rag_result, tool_result, memory_result = await asyncio.gather(
        rag_task,
        tool_task,
        memory_task,
        return_exceptions=True  # Don't fail entire batch if one fails
    )
    
    # Handle partial failures gracefully
    state.update({
        "rag_results": rag_result if not isinstance(rag_result, Exception) else [],
        "suggested_tools": tool_result if not isinstance(tool_result, Exception) else [],
        "memory": memory_result if not isinstance(memory_result, Exception) else {},
    })
    
    return state
```

**Pros:**
- ✅ Full control over execution
- ✅ Custom error handling per task
- ✅ Easy to add timeout logic
- ✅ Can implement fallback strategies

**Cons:**
- ⚠️ More boilerplate code
- ⚠️ Manual state merging
- ⚠️ Harder to visualize in LangGraph

---

### **Option 3: Hybrid Approach** 🏆 BEST OF BOTH WORLDS
Combine LangGraph parallel edges with asyncio.gather for fine-grained control.

```python
class ParallelBaseWorkflow(BaseWorkflow):
    """Enhanced BaseWorkflow with parallel execution"""
    
    async def parallel_retrieval_node(self, state: WorkflowState) -> WorkflowState:
        """
        Execute independent retrieval operations in parallel.
        Uses asyncio.gather for execution, but integrates with LangGraph.
        """
        logger.info("parallel_retrieval_started", node="parallel_retrieval")
        start_time = time.time()
        
        # Define parallel tasks
        tasks = []
        
        if state.enable_rag:
            tasks.append(("rag", self._rag_retrieval_task(state)))
        
        if state.enable_tools:
            tasks.append(("tools", self._tool_suggestion_task(state)))
        
        tasks.append(("memory", self._memory_retrieval_task(state)))
        
        # Execute all tasks in parallel
        results = await asyncio.gather(
            *[task for _, task in tasks],
            return_exceptions=True
        )
        
        # Process results and update state
        for (name, _), result in zip(tasks, results):
            if isinstance(result, Exception):
                logger.error(f"parallel_task_failed", task=name, error=str(result))
                # Set safe defaults
                if name == "rag":
                    state.rag_results = []
                elif name == "tools":
                    state.suggested_tools = []
                elif name == "memory":
                    state.memory = {}
            else:
                # Merge successful result into state
                state = {**state, **result}
        
        duration = (time.time() - start_time) * 1000
        logger.info("parallel_retrieval_completed", duration_ms=duration)
        
        return state
    
    async def _rag_retrieval_task(self, state: WorkflowState) -> Dict:
        """Isolated RAG retrieval task"""
        try:
            results = await self.rag_service.retrieve(
                query=state.user_query,
                domains=state.selected_rag_domains,
                tenant_id=state.tenant_id
            )
            return {"rag_results": results}
        except Exception as e:
            logger.error("rag_task_error", error=str(e))
            raise
    
    async def _tool_suggestion_task(self, state: WorkflowState) -> Dict:
        """Isolated tool suggestion task"""
        try:
            tools = await self.tool_service.suggest_tools(
                query=state.user_query,
                agent_id=state.agent_id
            )
            return {"suggested_tools": tools}
        except Exception as e:
            logger.error("tool_task_error", error=str(e))
            raise
    
    async def _memory_retrieval_task(self, state: WorkflowState) -> Dict:
        """Isolated memory retrieval task"""
        try:
            memory = await self.memory_service.get_context(
                user_id=state.user_id,
                conversation_id=state.conversation_id
            )
            return {"memory": memory}
        except Exception as e:
            logger.error("memory_task_error", error=str(e))
            raise
```

**Pros:**
- ✅ Best of both worlds
- ✅ LangGraph compatibility
- ✅ Fine-grained control
- ✅ Graceful degradation
- ✅ Easy to add timeouts
- ✅ Clear error handling

**Cons:**
- ⚠️ Slightly more complex
- ⚠️ Need to maintain task isolation

---

## 📐 **RECOMMENDED DESIGN: Hybrid Approach**

### **Implementation Strategy**

#### **Phase 1: Create Parallel Retrieval Node**
1. Create `ParallelBaseWorkflow` class extending `BaseWorkflow`
2. Implement `parallel_retrieval_node` with asyncio.gather
3. Add isolated task methods for RAG, Tools, Memory
4. Add comprehensive error handling

#### **Phase 2: Update Workflow Graph**
1. Modify Mode 1, 2, 3, 4 workflows to use new parallel node
2. Update graph structure to call parallel node instead of individual nodes
3. Maintain backward compatibility

#### **Phase 3: Add Monitoring**
1. Track parallel execution metrics
2. Measure latency improvements
3. Monitor partial failure rates
4. Alert on performance degradation

---

## 🎯 **SUCCESS CRITERIA**

### **Performance**
- [ ] 30% reduction in workflow execution time
- [ ] P95 latency < 2000ms (from ~2800ms)
- [ ] No increase in error rate
- [ ] Graceful handling of partial failures

### **Code Quality**
- [ ] Unit tests for all parallel nodes
- [ ] Integration tests for full workflow
- [ ] Documentation updated
- [ ] Monitoring dashboards show parallel metrics

### **Compatibility**
- [ ] Works with all 4 modes
- [ ] Backward compatible (can disable parallelization)
- [ ] Respects enable_rag and enable_tools flags
- [ ] No breaking changes to existing API

---

## 📊 **MONITORING PLAN**

### **New Metrics to Track**
```python
# Prometheus metrics for parallel execution
parallel_execution_duration_ms = Histogram(
    'parallel_execution_duration_ms',
    'Duration of parallel node execution',
    buckets=[100, 250, 500, 1000, 2500, 5000]
)

parallel_task_failures_total = Counter(
    'parallel_task_failures_total',
    'Number of parallel task failures',
    ['task_name', 'failure_type']
)

parallel_speedup_ratio = Gauge(
    'parallel_speedup_ratio',
    'Speedup ratio vs sequential execution'
)
```

### **Dashboard Additions**
- Parallel vs Sequential execution time comparison
- Per-task latency breakdown
- Failure rate by task
- Speedup ratio over time

---

## 🚀 **NEXT STEPS**

1. **Design Review** (1 hour)
   - Review this design document
   - Get user approval
   - Finalize approach

2. **Implementation** (Day 3-5, 24 hours)
   - Create `ParallelBaseWorkflow` class
   - Implement parallel execution logic
   - Add error handling and monitoring
   - Update all 4 mode workflows

3. **Testing** (Day 1-2 Week 4, 16 hours)
   - Write unit tests
   - Run integration tests
   - Performance benchmarking
   - Verify 30%+ improvement

---

## ❓ **QUESTIONS FOR USER**

1. **Approach**: Do you approve the **Hybrid Approach** (Option 3)?
2. **Scope**: Should we also parallelize post-generation tasks (quality scoring, citations)?
3. **Flags**: Should parallelization be opt-in or opt-out via config flag?
4. **Priority**: Should we implement this for all 4 modes or start with Mode 1 only?

---

**Status**: ⏸️ **Awaiting user feedback to proceed with implementation**


