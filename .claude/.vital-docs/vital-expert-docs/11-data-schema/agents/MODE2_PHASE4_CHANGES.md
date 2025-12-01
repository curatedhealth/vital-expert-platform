# MODE 2 - PHASE 4 ENHANCEMENTS (APPLY THESE CHANGES)

## File: `mode2_auto_query.py`

### 1. DOCSTRING - UPDATED ✅

### 2. IMPORTS - UPDATED ✅

### 3. __INIT__ - UPDATED ✅

### 4. UPDATE build_graph() METHOD

Replace lines 192-233 with:

```python
def build_graph(self) -> StateGraph:
    """
    Build LangGraph workflow for Mode 2.

    **PHASE 4 ENHANCED FLOW:**
    1. Validate tenant
    2. Analyze query
    3. **NEW**: Select expert (Evidence-Based + GraphRAG)
    4. **NEW**: Assess tier
    5. RAG retrieval
    6. Tool execution
    7. Execute expert → **BRANCH**: Tier 3 uses patterns
    8. Format output

    Returns:
        Configured StateGraph
    """
    graph = StateGraph(UnifiedWorkflowState)

    # Add nodes
    graph.add_node("validate_tenant", self.validate_tenant_node)
    graph.add_node("analyze_query", self.analyze_query_node)
    graph.add_node("select_expert_evidence_based", self.select_expert_evidence_based_node)  # PHASE 4
    graph.add_node("assess_tier", self.assess_tier_node)  # PHASE 4
    graph.add_node("rag_retrieval", self.rag_retrieval_node)
    graph.add_node("skip_rag", self.skip_rag_node)
    graph.add_node("execute_tools", self.execute_tools_node)
    graph.add_node("skip_tools", self.skip_tools_node)
    graph.add_node("execute_expert_agent", self.execute_expert_agent_node)
    graph.add_node("execute_with_patterns", self.execute_with_patterns_node)  # PHASE 4
    graph.add_node("format_output", self.format_output_node)

    # Define flow
    graph.set_entry_point("validate_tenant")
    graph.add_edge("validate_tenant", "analyze_query")
    graph.add_edge("analyze_query", "select_expert_evidence_based")  # PHASE 4
    graph.add_edge("select_expert_evidence_based", "assess_tier")  # PHASE 4

    # RAG branch
    graph.add_conditional_edges(
        "assess_tier",
        self.should_use_rag,
        {"use_rag": "rag_retrieval", "skip_rag": "skip_rag"}
    )

    # Tool branch
    graph.add_conditional_edges(
        "rag_retrieval",
        self.should_use_tools,
        {"use_tools": "execute_tools", "skip_tools": "skip_tools"}
    )

    graph.add_conditional_edges(
        "skip_rag",
        self.should_use_tools,
        {"use_tools": "execute_tools", "skip_tools": "skip_tools"}
    )

    # PHASE 4: Pattern branch
    graph.add_conditional_edges(
        "execute_tools",
        self.should_use_patterns,
        {"use_patterns": "execute_with_patterns", "standard": "execute_expert_agent"}
    )

    graph.add_conditional_edges(
        "skip_tools",
        self.should_use_patterns,
        {"use_patterns": "execute_with_patterns", "standard": "execute_expert_agent"}
    )

    # Converge
    graph.add_edge("execute_expert_agent", "format_output")
    graph.add_edge("execute_with_patterns", "format_output")
    graph.add_edge("format_output", END)

    return graph
```

### 5. ADD NEW NODE: select_expert_evidence_based_node

Add after `analyze_query_node`:

```python
@trace_node("mode2_select_expert_evidence_based")
async def select_expert_evidence_based_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    PHASE 4: Node - Select best expert using Evidence-Based Selector + GraphRAG

    Uses GraphRAG Hybrid Search (30/50/20) + 8-factor scoring
    """
    if not EVIDENCE_BASED_AVAILABLE:
        logger.warning("Evidence-Based Selector not available, using fallback")
        return await self._select_expert_fallback(state)

    tenant_id = state['tenant_id']
    query = state['query']

    try:
        # Evidence-Based Selection with GraphRAG
        result = await self.evidence_selector.select_for_service(
            service=VitalService.ASK_EXPERT,
            query=query,
            context={
                'mode': 'auto_interactive',
                'conversation_history': state.get('messages', [])
            },
            tenant_id=tenant_id,
            max_agents=1
        )

        if not result.agents:
            return {**state, 'status': ExecutionStatus.FAILED, 'errors': ["No suitable expert found"]}

        selected_agent = result.agents[0]
        tier = result.tier

        logger.info(
            "Expert selected via Evidence-Based + GraphRAG",
            agent_id=selected_agent.id,
            agent_name=selected_agent.name,
            tier=tier.value,
            confidence=selected_agent.final_score
        )

        return {
            **state,
            'selected_agents': [selected_agent.id],
            'current_agent_id': selected_agent.id,
            'current_agent_type': selected_agent.name,
            'agent_tier': tier.value,
            'tier': tier.level,
            'selection_confidence': selected_agent.final_score,
            'selection_method': 'evidence_based_graphrag',
            'current_node': 'select_expert_evidence_based'
        }

    except Exception as e:
        logger.error("Evidence-Based selection failed", error=str(e))
        return await self._select_expert_fallback(state)

async def _select_expert_fallback(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """Fallback to basic agent selection"""
    selected = await self.agent_selector.select_agents(
        query=state['query'],
        tenant_id=state['tenant_id'],
        max_agents=1
    )
    
    return {
        **state,
        'selected_agents': [selected[0]['id']],
        'current_agent_id': selected[0]['id'],
        'tier': 1,
        'selection_method': 'fallback',
        'current_node': 'select_expert_evidence_based'
    }
```

### 6. COPY FROM MODE 1

Copy these nodes from `mode1_manual_query.py`:
- `assess_tier_node` (lines 288-359)
- `execute_with_patterns_node` (lines 701-789)
- `should_use_patterns` (lines 777-784)
- `should_use_rag` (if not exists)
- `should_use_tools` (if not exists)

---

## ✅ MODE 2 COMPLETE AFTER THESE CHANGES

