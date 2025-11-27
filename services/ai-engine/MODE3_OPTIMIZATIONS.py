"""
Mode 3 Performance Optimizations
=================================
Target: Reduce latency from 620ms to < 400ms (35% improvement)

Optimization Strategies:
1. **Node Consolidation:** Merge validation nodes (2→1)
2. **Parallel Execution:** Run independent nodes concurrently
3. **Conditional Skipping:** Skip HITL/ToT for simple queries
4. **Caching:** Cache agent configs and conversation history
5. **Lazy Loading:** Defer pattern agent initialization
6. **Database Optimization:** Batch database operations
7. **RAG Optimization:** Use cached embeddings when available
"""

# Apply these optimizations to mode3_manual_chat_autonomous.py:

# OPTIMIZATION 1: Merge validation nodes (saves ~50ms)
async def validate_tenant_and_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """Combined validation - runs in parallel internally"""
    tenant_id = state.get('tenant_id')
    agent_id = state.get('selected_agents', [None])[0]
    
    # Run validations in parallel
    tenant_task = asyncio.create_task(self._validate_tenant(tenant_id))
    agent_task = asyncio.create_task(self._validate_agent(agent_id))
    
    tenant_valid, agent_valid = await asyncio.gather(tenant_task, agent_task)
    
    return {
        'tenant_validated': tenant_valid,
        'agent_validated': agent_valid,
        'execution_status': ExecutionStatus.IN_PROGRESS if (tenant_valid and agent_valid) else ExecutionStatus.FAILED
    }

# OPTIMIZATION 2: Conditional HITL/ToT (saves ~100ms for simple queries)
def should_use_deep_patterns(self, state: UnifiedWorkflowState) -> str:
    """Smart routing based on query complexity"""
    query = state.get('query', '')
    
    # Fast path for simple queries (< 50 words, no complex requirements)
    word_count = len(query.split())
    has_complex_intent = any(kw in query.lower() for kw in [
        'comprehensive', 'complete', 'detailed', 'analyze', 'design', 
        'create', 'develop', 'strategy', 'plan'
    ])
    
    if word_count < 50 and not has_complex_intent:
        return "skip_patterns"  # Direct to execution
    else:
        return "use_patterns"  # Use ToT/ReAct/Constitutional

# OPTIMIZATION 3: Parallel RAG + Agent Config Loading (saves ~80ms)
async def prepare_execution_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """Load agent config and RAG results in parallel"""
    agent_id = state.get('selected_agents', [None])[0]
    query = state.get('query', '')
    
    # Run in parallel
    config_task = asyncio.create_task(self._load_agent_config(agent_id))
    rag_task = asyncio.create_task(self._perform_rag_retrieval(query)) if state.get('enable_rag') else None
    
    if rag_task:
        config, rag_results = await asyncio.gather(config_task, rag_task)
        return {
            'agent_config': config,
            'rag_results': rag_results['sources'],
            'context_loaded': True
        }
    else:
        config = await config_task
        return {
            'agent_config': config,
            'rag_results': [],
            'context_loaded': True
        }

# OPTIMIZATION 4: Cached Conversation Loading with TTL
async def load_conversation_node_cached(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """Load conversation with caching"""
    session_id = state.get('session_id')
    
    if not session_id:
        return {'conversation_history': [], 'session_loaded': True}
    
    # Check cache first (5-minute TTL)
    cache_key = f"conversation:{session_id}"
    cached = await self.cache_manager.get(cache_key) if self.cache_manager else None
    
    if cached:
        return {'conversation_history': cached, 'session_loaded': True, 'cache_hit': True}
    
    # Load from database
    try:
        history = await self.conversation_manager.get_conversation_history(
            session_id, max_messages=10  # Limit to last 10 for faster loading
        )
        
        # Cache for 5 minutes
        if self.cache_manager:
            await self.cache_manager.set(cache_key, history, ttl=300)
        
        return {'conversation_history': history, 'session_loaded': True, 'cache_hit': False}
    except Exception as e:
        logger.error("Conversation load failed", error=str(e))
        return {'conversation_history': [], 'session_loaded': True}

# OPTIMIZATION 5: Streamlined Agent Execution (saves ~50ms)
async def execute_expert_streamlined_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """Streamlined execution without unnecessary pattern overhead"""
    query = state.get('query', '')
    agent_id = state.get('selected_agents', [None])[0]
    tenant_id = state.get('tenant_id')
    context = state.get('rag_results', [])
    
    # Prepare context efficiently
    context_str = "\n\n".join([
        f"[{i+1}] {doc.get('content', '')[:200]}"  # Limit context size
        for i, doc in enumerate(context[:5])  # Only top 5 results
    ])
    
    # Create request (already optimized with Union[UUID, str] support)
    from models.requests import AgentQueryRequest
    agent_request = AgentQueryRequest(
        query=query,
        agent_id=agent_id,
        session_id=state.get('session_id'),
        user_id=state.get('user_id'),
        tenant_id=tenant_id,
        context={'summary': context_str},
        agent_type='expert',
        organization_id=tenant_id
    )
    
    # Execute with timeout
    try:
        response = await asyncio.wait_for(
            self.agent_orchestrator.process_query(agent_request),
            timeout=10.0  # 10-second timeout
        )
        
        return {
            'response': response.response,
            'confidence': response.confidence,
            'citations': response.citations or [],
            'tokens_used': response.tokens_used,
            'execution_complete': True
        }
    except asyncio.TimeoutError:
        logger.error("Agent execution timeout")
        return {
            'response': "Request timed out. Please try a simpler query.",
            'confidence': 0.0,
            'execution_complete': False,
            'error': 'timeout'
        }

# OPTIMIZATION 6: Optimized Graph Structure
def build_optimized_graph(self):
    """
    Optimized flow:
    1. validate_all (tenant + agent in parallel) - 50ms
    2. prepare_execution (config + RAG in parallel) - 80ms  
    3. route_complexity (decides patterns vs direct) - 5ms
    4. [CONDITIONAL] plan_with_tot OR skip - 0-100ms
    5. execute_expert_streamlined - 150ms
    6. [CONDITIONAL] validate_constitutional OR skip - 0-50ms
    7. format_and_save (parallel) - 50ms
    
    Total optimized path: ~335ms (simple) to ~485ms (complex)
    Current path: ~620ms
    Improvement: 46% faster (simple) to 22% faster (complex)
    """
    graph = StateGraph(UnifiedWorkflowState)
    
    # Consolidated nodes
    graph.add_node("validate_all", self.validate_tenant_and_agent_node)
    graph.add_node("load_conversation", self.load_conversation_node_cached)
    graph.add_node("prepare_execution", self.prepare_execution_node)
    graph.add_node("plan_with_tot", self.plan_with_tot_node)  # Conditional
    graph.add_node("execute_expert", self.execute_expert_streamlined_node)
    graph.add_node("validate_constitutional", self.validate_with_constitutional_node)  # Conditional
    graph.add_node("format_output", self.format_and_save_parallel_node)
    
    # Optimized flow
    graph.set_entry_point("validate_all")
    graph.add_edge("validate_all", "load_conversation")
    graph.add_edge("load_conversation", "prepare_execution")
    graph.add_conditional_edges(
        "prepare_execution",
        self.should_use_deep_patterns,
        {
            "use_patterns": "plan_with_tot",
            "skip_patterns": "execute_expert"
        }
    )
    graph.add_edge("plan_with_tot", "execute_expert")
    graph.add_conditional_edges(
        "execute_expert",
        lambda state: "validate" if state.get('confidence', 1.0) < 0.7 else "output",
        {
            "validate": "validate_constitutional",
            "output": "format_output"
        }
    )
    graph.add_edge("validate_constitutional", "format_output")
    graph.add_edge("format_output", END)
    
    return graph

# OPTIMIZATION 7: Parallel Format and Save
async def format_and_save_parallel_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """Format output and save conversation in parallel"""
    response = state.get('response', '')
    
    # Format output
    formatted = {
        'response': response,
        'confidence': state.get('confidence', 0.0),
        'citations': state.get('citations', []),
        'reasoning_steps': state.get('reasoning_steps', [])
    }
    
    # Save conversation async (don't wait)
    if state.get('session_id'):
        asyncio.create_task(self._save_conversation_async(state))
    
    return {
        'final_response': formatted['response'],
        'execution_status': ExecutionStatus.COMPLETED
    }

"""
IMPLEMENTATION CHECKLIST:
========================
✅ 1. Add Union[UUID, str] support to AgentQueryRequest (DONE)
✅ 2. Fix Pinecone namespace callable issue (DONE)
□ 3. Apply node consolidation (validate_all)
□ 4. Add conditional pattern routing (should_use_deep_patterns)
□ 5. Implement parallel loading (prepare_execution)
□ 6. Add conversation caching (load_conversation_node_cached)
□ 7. Streamline agent execution with timeout
□ 8. Rebuild graph with optimized structure
□ 9. Add parallel save (format_and_save_parallel)
□ 10. Test and verify < 400ms target

EXPECTED RESULTS:
================
Before: 620ms average
After:  350ms (simple queries) to 450ms (complex queries)
Improvement: 27-44% faster
"""


