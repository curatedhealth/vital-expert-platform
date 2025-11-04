# 🏆 MODE 1: LEADING LANGGRAPH PRACTICES & ENHANCEMENTS

**Date:** November 1, 2025  
**Purpose:** Apply industry-leading LangGraph patterns to Mode 1  
**Goal:** Make Mode 1 the gold standard for all other modes

---

## 📚 LEADING LANGGRAPH PRACTICES (2025)

### **1. State Management Best Practices** ✅

#### **Use TypedDict with Annotated Reducers**
```python
from typing import TypedDict, Annotated, List, Dict, Any
import operator

class Mode1State(TypedDict):
    # Use Annotated with operator.add for lists that accumulate
    retrieved_documents: Annotated[List[Dict[str, Any]], operator.add]
    selected_agents: Annotated[List[str], operator.add]
    errors: Annotated[List[str], operator.add]
    
    # Simple fields without reducers
    tenant_id: str
    query: str
    response: str
```

**Why:** Ensures state updates are predictable and type-safe.

---

#### **Immutable State Updates**
```python
# ❌ BAD: Mutating state
def my_node(state):
    state['selected_agents'].append(new_agent)  # Mutates!
    return state

# ✅ GOOD: Return new state
def my_node(state):
    return {
        **state,
        'selected_agents': state.get('selected_agents', []) + [new_agent]
    }
```

**Why:** Prevents state corruption and enables time-travel debugging.

---

### **2. Checkpointing Best Practices** ✅

#### **Use Checkpointing for Long-Running Workflows**
```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Initialize with checkpointing
checkpoint_saver = SqliteSaver("workflow_checkpoints.db")

compiled_graph = graph.compile(checkpointer=checkpoint_saver)

# Execute with config to enable checkpointing
config = {"configurable": {"thread_id": session_id}}
result = await compiled_graph.ainvoke(initial_state, config)
```

**Why:** Enables workflow resumption, time-travel debugging, and audit trails.

---

#### **Checkpoint Only Critical States**
```python
# Add checkpoint after expensive operations
graph.add_node("rag_retrieval", rag_node)
graph.add_node("__checkpoint__", lambda s: s)  # Explicit checkpoint
graph.add_edge("rag_retrieval", "__checkpoint__")
```

**Why:** Reduces overhead while preserving critical states.

---

### **3. Error Handling Best Practices** ✅

#### **Use Error Nodes + Conditional Routing**
```python
def execute_agent_node(state):
    try:
        # ... agent execution ...
        return {**state, 'status': 'success', 'error': None}
    except Exception as e:
        logger.error("Agent execution failed", error=str(e))
        return {**state, 'status': 'error', 'error': str(e)}

def route_execution_result(state):
    if state.get('error'):
        return "handle_error"
    return "continue"

# Add error handling branch
graph.add_conditional_edges(
    "execute_agent",
    route_execution_result,
    {
        "continue": "save_conversation",
        "handle_error": "error_handler"
    }
)
```

**Why:** Separates error handling logic and enables graceful recovery.

---

#### **Implement Retry with Exponential Backoff**
```python
def retry_node(state):
    retry_count = state.get('retry_count', 0) + 1
    delay = min(2 ** retry_count, 32)  # Exponential backoff, cap at 32s
    
    return {
        **state,
        'retry_count': retry_count,
        'retry_delay': delay,
        'status': 'retrying'
    }

def route_retry_decision(state):
    if state.get('retry_count', 0) >= 3:
        return "fallback"  # Max retries reached
    return "retry"
```

**Why:** Handles transient failures without overwhelming services.

---

### **4. Observability Best Practices** ✅

#### **Use LangSmith Tracing**
```python
from langsmith import trace

@trace(name="mode1_select_agent", run_type="chain")
async def select_agent_node(state):
    # Automatically traced in LangSmith
    result = await agent_selector.select_agent(state['query'])
    return {**state, 'selected_agents': [result['agent_id']]}
```

**Why:** Complete visibility into workflow execution.

---

#### **Add Structured Logging**
```python
import structlog

logger = structlog.get_logger()

def my_node(state):
    logger.info(
        "node_executed",
        node="my_node",
        tenant_id=state['tenant_id'][:8],
        query_length=len(state['query']),
        metadata={
            "status": state.get('status'),
            "step": state.get('step_number')
        }
    )
    # ... node logic ...
```

**Why:** Enables filtering, aggregation, and debugging in production.

---

### **5. Caching Best Practices** ✅

#### **Implement Multi-Level Caching**
```python
# Level 1: Query cache (exact match)
cache_key = f"query:{tenant_id}:{hash(query)}"
cached_result = await cache_manager.get(cache_key)
if cached_result:
    return cached_result

# Level 2: Embedding cache (semantic match)
embedding_key = f"embedding:{tenant_id}:{hash(query)}"
cached_embedding = await cache_manager.get(embedding_key)

# Level 3: RAG result cache
rag_key = f"rag:{tenant_id}:{hash(query)}:{domains}"
cached_rag = await cache_manager.get(rag_key)
```

**Why:** Reduces latency and API costs while maintaining freshness.

---

#### **Use TTL-Based Invalidation**
```python
# Medical/regulatory content: 24-hour TTL
await cache_manager.set(
    key=cache_key,
    value=result,
    ttl=86400  # 24 hours
)

# General queries: 1-hour TTL
await cache_manager.set(
    key=cache_key,
    value=result,
    ttl=3600  # 1 hour
)
```

**Why:** Balances performance with data freshness.

---

### **6. Multi-Branching Best Practices** ✅

#### **Use Meaningful Branch Names**
```python
# ❌ BAD: Generic names
def route(state):
    if state['x']:
        return "path1"
    return "path2"

# ✅ GOOD: Descriptive names
def route_execution_strategy(state):
    enable_rag = state.get('enable_rag', False)
    enable_tools = state.get('enable_tools', False)
    
    if enable_rag and enable_tools:
        return "rag_and_tools"
    elif enable_rag:
        return "rag_only"
    elif enable_tools:
        return "tools_only"
    return "direct_execution"
```

**Why:** Self-documenting code and easier debugging.

---

#### **Document Branching Logic**
```python
def route_conversation_type(state: UnifiedWorkflowState) -> str:
    """
    Route based on conversation state.
    
    Branches:
    - "fresh": New conversation, no history
    - "continuing": Existing conversation with history
    
    Decision Logic:
    - Checks if session_id exists and is valid
    - Verifies conversation history is loadable
    
    Returns:
        Branch name as string
    """
    has_session = state.get('session_id') is not None
    has_history = len(state.get('conversation_history', [])) > 0
    
    return "continuing" if (has_session and has_history) else "fresh"
```

**Why:** Clear intent and maintainability.

---

### **7. Performance Optimization** ✅

#### **Parallelize Independent Operations**
```python
# ❌ BAD: Sequential execution
documents = await rag_service.search(query)
agent_info = await agent_selector.get_agent_info(agent_id)

# ✅ GOOD: Parallel execution
documents, agent_info = await asyncio.gather(
    rag_service.search(query),
    agent_selector.get_agent_info(agent_id)
)
```

**Why:** Reduces total latency by running I/O concurrently.

---

#### **Lazy Load Heavy Resources**
```python
class Mode1Workflow(BaseWorkflow):
    def __init__(self):
        self._llm = None
        self._embeddings = None
    
    @property
    async def llm(self):
        """Lazy-load LLM only when needed"""
        if self._llm is None:
            self._llm = ChatOpenAI(...)
        return self._llm
```

**Why:** Faster initialization and lower memory footprint.

---

### **8. Testing Best Practices** ✅

#### **Test Each Node Independently**
```python
@pytest.mark.asyncio
async def test_select_agent_node():
    """Test agent selection node in isolation"""
    workflow = Mode1Workflow(...)
    
    # Create minimal state
    state = {
        'tenant_id': 'test-tenant',
        'query': 'What are FDA requirements?'
    }
    
    # Execute single node
    result = await workflow.select_agent_automatic_node(state)
    
    # Verify outputs
    assert 'selected_agents' in result
    assert len(result['selected_agents']) > 0
    assert result['selection_confidence'] > 0.5
```

**Why:** Isolates failures and enables focused debugging.

---

#### **Test Branching Logic**
```python
@pytest.mark.asyncio
async def test_route_execution_strategy():
    """Test all branching paths"""
    workflow = Mode1Workflow(...)
    
    # Test path 1: RAG + Tools
    state1 = {'enable_rag': True, 'enable_tools': True}
    assert workflow.route_execution_strategy(state1) == "rag_and_tools"
    
    # Test path 2: RAG only
    state2 = {'enable_rag': True, 'enable_tools': False}
    assert workflow.route_execution_strategy(state2) == "rag_only"
    
    # Test path 3: Tools only
    state3 = {'enable_rag': False, 'enable_tools': True}
    assert workflow.route_execution_strategy(state3) == "tools_only"
    
    # Test path 4: Direct
    state4 = {'enable_rag': False, 'enable_tools': False}
    assert workflow.route_execution_strategy(state4) == "direct_execution"
```

**Why:** Ensures all paths work correctly.

---

### **9. Security Best Practices** ✅

#### **Validate Tenant ID at Entry Point**
```python
def validate_tenant_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    First node: Validate tenant ID (Golden Rule #3).
    
    Raises:
        ValueError: If tenant_id is missing or invalid
    """
    tenant_id = state.get('tenant_id')
    
    if not tenant_id:
        raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
    
    # Validate UUID format
    try:
        UUID(tenant_id)
    except ValueError:
        raise ValueError(f"Invalid tenant_id format: {tenant_id}")
    
    # Set RLS context
    await supabase_client.set_tenant_context(tenant_id)
    
    logger.info("Tenant validated", tenant_id=tenant_id[:8])
    
    return {**state, 'tenant_validated': True}
```

**Why:** Enforces tenant isolation at the earliest possible point.

---

#### **Sanitize User Inputs**
```python
def analyze_query_node(state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Analyze and sanitize user query"""
    query = state['query']
    
    # Sanitize: remove SQL injection attempts
    query = query.replace("';", "").replace("--", "")
    
    # Truncate excessive length
    if len(query) > 2000:
        query = query[:2000]
        logger.warning("Query truncated", original_length=len(state['query']))
    
    return {**state, 'query': query, 'query_sanitized': True}
```

**Why:** Prevents injection attacks and resource exhaustion.

---

### **10. Documentation Best Practices** ✅

#### **Document Node Purpose and Behavior**
```python
@trace_node("mode1_rag_retrieval")
async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: RAG Retrieval
    
    Purpose:
        Retrieve relevant documents from the knowledge base using semantic search.
    
    Inputs (from state):
        - query: User query text
        - tenant_id: Tenant UUID for isolation
        - agent_config: Agent configuration (for assigned RAG domains)
        - enable_rag: Boolean toggle from frontend
    
    Outputs (updates state):
        - retrieved_documents: List of relevant documents
        - rag_quality_score: Quality score (0-1)
        - domains_used: RAG domains that were searched
    
    Side Effects:
        - Queries Pinecone/Supabase vector database
        - May cache results in Redis
    
    Error Handling:
        - Returns empty documents list if RAG fails
        - Logs error but does not halt workflow
    
    Golden Rules:
        - ✅ Tenant isolation (only searches tenant's documents)
        - ✅ Caching integrated (checks cache before querying)
    
    Performance:
        - Average latency: 200-500ms
        - Cache hit rate: ~60%
    """
    # Implementation...
```

**Why:** Complete understanding without reading implementation.

---

## 🎯 ADDITIONAL MODE 1 ENHANCEMENTS

### **Enhancement 1: Conversation Context Window Management** ✅

```python
def format_conversation_with_sliding_window(
    self,
    conversation: List[Dict[str, str]],
    max_tokens: int = 4000,
    importance_weights: Optional[Dict[int, float]] = None
) -> List[Dict[str, str]]:
    """
    Format conversation using sliding window with importance weighting.
    
    Recent messages get higher weight, but important messages are preserved.
    
    Args:
        conversation: Full conversation history
        max_tokens: Maximum tokens for LLM context
        importance_weights: Optional importance scores per message index
    
    Returns:
        Trimmed conversation with most important messages
    """
    if not importance_weights:
        # Default: recent messages more important
        importance_weights = {
            i: 1.0 / (len(conversation) - i)
            for i in range(len(conversation))
        }
    
    # Sort by importance (descending)
    sorted_messages = sorted(
        enumerate(conversation),
        key=lambda x: importance_weights.get(x[0], 0.5),
        reverse=True
    )
    
    # Greedily add messages until token limit
    selected = []
    current_tokens = 0
    
    for idx, message in sorted_messages:
        msg_tokens = len(message['content']) // 4
        if current_tokens + msg_tokens <= max_tokens:
            selected.append((idx, message))
            current_tokens += msg_tokens
    
    # Re-sort by original order
    selected.sort(key=lambda x: x[0])
    formatted = [msg for _, msg in selected]
    
    logger.info(
        "Conversation formatted with importance weighting",
        original_messages=len(conversation),
        selected_messages=len(formatted),
        tokens_used=current_tokens
    )
    
    return formatted
```

**Why:** Preserves important context even in long conversations.

---

### **Enhancement 2: Dynamic Agent Switching** ✅

```python
@trace_node("mode1_evaluate_agent_performance")
async def evaluate_agent_performance_node(
    self,
    state: UnifiedWorkflowState
) -> UnifiedWorkflowState:
    """
    Node: Evaluate if current agent is performing well.
    
    If confidence is low, may trigger agent switch.
    """
    current_agent = state['selected_agents'][-1]
    confidence = state.get('response_confidence', 0.0)
    conversation_history = state.get('conversation_history', [])
    
    # Check if agent switch is needed
    should_switch = (
        confidence < 0.6 and  # Low confidence
        len(conversation_history) > 2  # Not first turn
    )
    
    if should_switch:
        logger.warning(
            "Low agent performance, evaluating switch",
            current_agent=current_agent,
            confidence=confidence
        )
        
        # Analyze why confidence is low
        issues = state.get('grounding_issues', [])
        
        # Suggest better agent based on issues
        suggested_agent = await self._suggest_better_agent(
            query=state['query'],
            current_agent=current_agent,
            issues=issues,
            tenant_id=state['tenant_id']
        )
        
        if suggested_agent != current_agent:
            return {
                **state,
                'agent_switch_suggested': True,
                'suggested_agent': suggested_agent,
                'switch_reason': 'low_confidence'
            }
    
    return {**state, 'agent_switch_suggested': False}
```

**Why:** Adapts to changing conversation needs dynamically.

---

### **Enhancement 3: Confidence Calibration** ✅

```python
async def calibrate_confidence(
    self,
    state: UnifiedWorkflowState
) -> float:
    """
    Calibrate confidence based on historical accuracy.
    
    If agent historically overestimates confidence, adjust down.
    If agent underestimates, adjust up.
    """
    agent_id = state['selected_agents'][-1]
    raw_confidence = state['response_confidence']
    
    # Get historical calibration factor from database
    calibration = await self.supabase.client.table('agent_calibration') \
        .select('calibration_factor') \
        .eq('agent_id', agent_id) \
        .eq('tenant_id', state['tenant_id']) \
        .single() \
        .execute()
    
    if calibration.data:
        factor = calibration.data['calibration_factor']
        calibrated = raw_confidence * factor
        
        logger.info(
            "Confidence calibrated",
            agent_id=agent_id,
            raw=raw_confidence,
            calibrated=calibrated,
            factor=factor
        )
        
        return min(max(calibrated, 0.0), 0.99)
    
    return raw_confidence
```

**Why:** Improves confidence accuracy over time.

---

## ✅ FINAL CHECKLIST: LEADING PRACTICES

- [ ] TypedDict with Annotated reducers
- [ ] Immutable state updates
- [ ] Checkpointing for long workflows
- [ ] Error nodes + conditional routing
- [ ] Retry with exponential backoff
- [ ] LangSmith tracing
- [ ] Structured logging
- [ ] Multi-level caching
- [ ] TTL-based cache invalidation
- [ ] Meaningful branch names
- [ ] Documented branching logic
- [ ] Parallel async operations
- [ ] Lazy resource loading
- [ ] Independent node testing
- [ ] Branching path testing
- [ ] Tenant validation at entry
- [ ] Input sanitization
- [ ] Comprehensive documentation
- [ ] Conversation window management
- [ ] Dynamic agent switching
- [ ] Confidence calibration

---

## 🎉 RESULT: GOLD-STANDARD MODE 1

By applying these leading practices, Mode 1 will be:

✅ **Type-safe** (TypedDict + Pydantic)  
✅ **Resilient** (Error handling + retries)  
✅ **Observable** (LangSmith + structured logs)  
✅ **Performant** (Caching + parallelization)  
✅ **Secure** (Tenant isolation + input sanitization)  
✅ **Testable** (Independent nodes + full coverage)  
✅ **Maintainable** (Clear documentation + clean code)  
✅ **Adaptable** (Dynamic agent switching)  
✅ **Accurate** (Confidence calibration)

**This is the gold standard template for Modes 2, 3, and 4!** 🏆

