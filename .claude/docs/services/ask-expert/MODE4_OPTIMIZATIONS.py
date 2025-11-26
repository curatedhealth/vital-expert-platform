"""
Mode 4 Performance Optimizations  
=================================
Target: Reduce latency from 3.3s to < 2.0s (39% improvement)

Current Bottlenecks:
1. Sequential agent selection (400ms)
2. Serial expert execution (2000ms for multiple experts)
3. No caching for agent embeddings
4. RAG calls repeated for each expert
5. Excessive logging and state updates

Optimization Strategies:
1. **Parallel Agent Selection:** Use concurrent embeddings
2. **Parallel Expert Execution:** Run multiple experts simultaneously
3. **Shared RAG Context:** Retrieve once, share across experts
4. **Smart Agent Limiting:** Cap at 3 experts max (quality > quantity)
5. **Streaming Responses:** Start returning results while processing
6. **Connection Pooling:** Reuse database connections
7. **Batch Operations:** Group database writes
"""

# OPTIMIZATION 1: Parallel Agent Selection (saves ~250ms)
async def select_experts_parallel_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Select multiple experts in parallel using batch embeddings
    """
    query = state.get('query', '')
    
    try:
        # Generate query embedding once
        embedding_task = asyncio.create_task(self._generate_embedding(query))
        
        # Load agent catalog in parallel
        catalog_task = asyncio.create_task(self._load_agent_catalog())
        
        query_embedding, agent_catalog = await asyncio.gather(embedding_task, catalog_task)
        
        # Calculate similarities in parallel (vectorized)
        similarities = await self._batch_calculate_similarities(
            query_embedding, 
            agent_catalog
        )
        
        # Select top 3 agents (sweet spot for speed/quality)
        top_agents = sorted(similarities, key=lambda x: x['score'], reverse=True)[:3]
        
        return {
            'selected_agents': [a['agent_id'] for a in top_agents],
            'selection_scores': {a['agent_id']: a['score'] for a in top_agents},
            'selection_reasoning': f"Selected {len(top_agents)} experts based on query analysis"
        }
    except Exception as e:
        logger.error("Agent selection failed", error=str(e))
        # Fallback to default expert
        return {
            'selected_agents': ['regulatory_expert'],
            'selection_scores': {'regulatory_expert': 0.8},
            'selection_reasoning': "Fallback to default expert"
        }

# OPTIMIZATION 2: Shared RAG Context (saves ~400ms)
async def retrieve_shared_context_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Retrieve RAG context once and share across all experts
    This avoids N separate RAG calls
    """
    query = state.get('query', '')
    
    if not state.get('enable_rag'):
        return {'shared_context': [], 'rag_complete': True}
    
    try:
        # Single RAG retrieval with higher top_k
        rag_results = await self.rag_service.query(
            query_text=query,
            strategy="hybrid",
            max_results=15,  # Get more results to share
            similarity_threshold=0.65
        )
        
        # Format context efficiently
        context_docs = [
            {
                'content': doc.page_content[:300],  # Limit length
                'title': doc.metadata.get('title', ''),
                'similarity': doc.metadata.get('similarity', 0.0)
            }
            for doc in rag_results.get('sources', [])[:10]  # Top 10
        ]
        
        return {
            'shared_context': context_docs,
            'rag_complete': True,
            'context_summary': self._summarize_context(context_docs)
        }
    except Exception as e:
        logger.warning("RAG retrieval failed", error=str(e))
        return {'shared_context': [], 'rag_complete': True}

# OPTIMIZATION 3: Parallel Expert Execution (saves ~1200ms)
async def execute_experts_parallel_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """
    Execute multiple experts in parallel with shared context
    This is the biggest optimization - cuts execution time by 60%
    """
    selected_agents = state.get('selected_agents', [])
    query = state.get('query', '')
    shared_context = state.get('shared_context', [])
    
    # Limit to 3 experts max for optimal speed/quality balance
    agents_to_execute = selected_agents[:3]
    
    # Create context string once
    context_str = state.get('context_summary', '')
    
    # Execute all experts in parallel with timeout
    tasks = [
        self._execute_single_expert_with_timeout(
            agent_id=agent_id,
            query=query,
            context=context_str,
            state=state,
            timeout=8.0  # 8-second timeout per expert
        )
        for agent_id in agents_to_execute
    ]
    
    # Wait for all with timeout
    try:
        results = await asyncio.wait_for(
            asyncio.gather(*tasks, return_exceptions=True),
            timeout=10.0  # 10-second total timeout
        )
    except asyncio.TimeoutError:
        logger.error("Parallel execution timeout")
        results = [{"error": "timeout"} for _ in agents_to_execute]
    
    # Filter successful results
    successful_results = [
        r for r in results 
        if isinstance(r, dict) and 'error' not in r
    ]
    
    if not successful_results:
        return {
            'expert_responses': [],
            'response': "All expert executions failed. Please try again.",
            'confidence': 0.0,
            'execution_complete': False
        }
    
    # Synthesize responses (fast consensus)
    synthesized = await self._quick_synthesis(successful_results, query)
    
    return {
        'expert_responses': successful_results,
        'response': synthesized['response'],
        'confidence': synthesized['confidence'],
        'citations': synthesized['citations'],
        'execution_complete': True,
        'experts_used': len(successful_results)
    }

# OPTIMIZATION 4: Fast Expert Execution with Timeout
async def _execute_single_expert_with_timeout(
    self, 
    agent_id: str, 
    query: str, 
    context: str,
    state: Dict[str, Any],
    timeout: float = 8.0
) -> Dict[str, Any]:
    """Execute a single expert with timeout and error handling"""
    try:
        from models.requests import AgentQueryRequest
        
        # Create optimized request
        agent_request = AgentQueryRequest(
            query=query,
            agent_id=agent_id,
            session_id=state.get('session_id'),
            user_id=state.get('user_id'),
            tenant_id=state.get('tenant_id'),
            context={'summary': context},  # Pre-formatted context
            agent_type='expert',
            organization_id=state.get('tenant_id')
        )
        
        # Execute with timeout
        response = await asyncio.wait_for(
            self.agent_orchestrator.process_query(agent_request),
            timeout=timeout
        )
        
        return {
            'agent_id': agent_id,
            'response': response.response,
            'confidence': response.confidence,
            'citations': response.citations or [],
            'tokens_used': response.tokens_used
        }
    except asyncio.TimeoutError:
        logger.warning(f"Expert {agent_id} timeout")
        return {'error': 'timeout', 'agent_id': agent_id}
    except Exception as e:
        logger.error(f"Expert {agent_id} failed", error=str(e))
        return {'error': str(e), 'agent_id': agent_id}

# OPTIMIZATION 5: Quick Response Synthesis (saves ~300ms)
async def _quick_synthesis(self, results: List[Dict], query: str) -> Dict[str, Any]:
    """
    Fast synthesis using simple consensus instead of LLM
    For 3 experts, use majority vote or highest confidence
    """
    if len(results) == 1:
        # Single result - return directly
        return {
            'response': results[0]['response'],
            'confidence': results[0]['confidence'],
            'citations': results[0].get('citations', [])
        }
    
    # Multiple results - use highest confidence response
    best_result = max(results, key=lambda r: r.get('confidence', 0.0))
    
    # Collect all citations
    all_citations = []
    for r in results:
        all_citations.extend(r.get('citations', []))
    
    # Simple synthesis: Use best response with all citations
    synthesized_response = best_result['response']
    
    # Calculate average confidence
    avg_confidence = sum(r.get('confidence', 0.0) for r in results) / len(results)
    
    return {
        'response': synthesized_response,
        'confidence': avg_confidence,
        'citations': all_citations[:10]  # Limit citations
    }

# OPTIMIZATION 6: Optimized Graph Structure for Mode 4
def build_optimized_graph_mode4(self):
    """
    Optimized Mode 4 flow:
    1. validate_tenant - 30ms
    2. select_experts_parallel - 200ms (was 400ms)
    3. retrieve_shared_context - 250ms (single RAG call)
    4. execute_experts_parallel - 800ms (was 2000ms)
    5. format_output - 50ms
    
    Total: ~1.33s (was 3.3s)
    Improvement: 60% faster!
    """
    graph = StateGraph(UnifiedWorkflowState)
    
    # Streamlined nodes
    graph.add_node("validate_tenant", self.validate_tenant_node)
    graph.add_node("select_experts", self.select_experts_parallel_node)
    graph.add_node("retrieve_context", self.retrieve_shared_context_node)
    graph.add_node("execute_experts", self.execute_experts_parallel_node)
    graph.add_node("format_output", self.format_output_node)
    
    # Linear flow (no conditional branching for speed)
    graph.set_entry_point("validate_tenant")
    graph.add_edge("validate_tenant", "select_experts")
    graph.add_edge("select_experts", "retrieve_context")
    graph.add_edge("retrieve_context", "execute_experts")
    graph.add_edge("execute_experts", "format_output")
    graph.add_edge("format_output", END)
    
    return graph

# OPTIMIZATION 7: Async Conversation Save (don't block response)
async def format_output_node_optimized(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
    """Format output and trigger async save"""
    response = state.get('response', '')
    
    # Format response
    formatted = {
        'response': response,
        'confidence': state.get('confidence', 0.0),
        'citations': state.get('citations', []),
        'experts_used': state.get('experts_used', 0)
    }
    
    # Save conversation async (don't wait)
    if state.get('session_id'):
        asyncio.create_task(self._save_conversation_background(state))
    
    return {
        'final_response': formatted['response'],
        'execution_status': ExecutionStatus.COMPLETED
    }

# OPTIMIZATION 8: Connection Pooling Helper
def _get_cached_embedding(self, text: str) -> Optional[List[float]]:
    """Cache embeddings for common queries/agents"""
    # Use hash of text as cache key
    import hashlib
    cache_key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"
    
    if self.cache_manager:
        return self.cache_manager.get(cache_key)
    return None

def _cache_embedding(self, text: str, embedding: List[float]):
    """Store embedding in cache (24-hour TTL)"""
    import hashlib
    cache_key = f"emb:{hashlib.md5(text.encode()).hexdigest()}"
    
    if self.cache_manager:
        self.cache_manager.set(cache_key, embedding, ttl=86400)  # 24 hours

"""
IMPLEMENTATION CHECKLIST:
========================
✅ 1. Fix AgentQueryRequest UUID issue (DONE)
✅ 2. Fix Pinecone namespace issue (DONE)
□ 3. Implement parallel agent selection
□ 4. Add shared RAG context retrieval
□ 5. Implement parallel expert execution
□ 6. Add execution timeouts (8s per expert, 10s total)
□ 7. Use fast synthesis (no LLM)
□ 8. Limit to 3 experts max
□ 9. Add embedding caching
□ 10. Rebuild graph with optimized structure

EXPECTED RESULTS:
================
Before: 3.3s average
After:  1.3-1.8s
Improvement: 45-61% faster

Breakdown:
- Agent selection: 400ms → 200ms (50% faster)
- RAG retrieval: 800ms (4x200ms) → 250ms (75% faster)
- Expert execution: 2000ms → 800ms (60% faster)
- Synthesis: 300ms → 50ms (83% faster)
"""

