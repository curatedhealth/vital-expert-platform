# 🎯 Agent-Specific Configuration & Confidence Calculation

## Critical Missing Features

### 1. Agent-Specific System Prompts
### 2. Agent-Assigned RAG Domains
### 3. Agent-Assigned Tools
### 4. Multi-Factor Confidence Calculation

---

## 1. Agent Configuration Schema

```python
# Database schema: agents table
{
    "id": "regulatory_expert",
    "name": "FDA Regulatory Expert",
    "system_prompt": "You are an expert FDA regulatory consultant...",
    "assigned_rag_domains": ["regulatory_affairs", "fda_guidelines", "compliance"],
    "assigned_tools": ["fda_search", "regulation_lookup", "submission_checker"],
    "model_preference": "gpt-4",
    "temperature": 0.1,
    "max_tokens": 4000,
    "confidence_weights": {
        "rag_quality": 0.3,
        "response_quality": 0.3,
        "citation_quality": 0.2,
        "context_relevance": 0.2
    }
}
```

---

## 2. Enhanced Agent Selector with Configuration

```python
# services/agent_selector.py - Enhanced

async def get_agent_configuration(
    self,
    agent_id: str,
    tenant_id: str
) -> Dict[str, Any]:
    """
    Fetch complete agent configuration including:
    - System prompt
    - Assigned RAG domains
    - Assigned tools
    - Model preferences
    - Confidence calculation weights
    
    Args:
        agent_id: Agent identifier
        tenant_id: Tenant UUID
        
    Returns:
        Complete agent configuration
    """
    try:
        # Fetch from database with tenant isolation
        result = await self.supabase.client.table('agents') \
            .select('*') \
            .eq('tenant_id', tenant_id) \
            .eq('id', agent_id) \
            .single() \
            .execute()
        
        if not result.data:
            logger.warning(f"Agent {agent_id} not found, using defaults")
            return self._get_default_agent_config(agent_id)
        
        config = result.data
        
        logger.info(
            "Agent configuration loaded",
            agent_id=agent_id,
            has_system_prompt=bool(config.get('system_prompt')),
            rag_domains=len(config.get('assigned_rag_domains', [])),
            tools=len(config.get('assigned_tools', []))
        )
        
        return config
        
    except Exception as e:
        logger.error(f"Failed to load agent config: {e}")
        return self._get_default_agent_config(agent_id)

def _get_default_agent_config(self, agent_id: str) -> Dict[str, Any]:
    """Fallback agent configurations"""
    defaults = {
        "regulatory_expert": {
            "id": "regulatory_expert",
            "name": "FDA Regulatory Expert",
            "system_prompt": "You are an expert FDA regulatory consultant with deep knowledge of submission requirements and compliance.",
            "assigned_rag_domains": ["regulatory_affairs", "fda_guidelines"],
            "assigned_tools": ["fda_search", "regulation_lookup"],
            "model_preference": "gpt-4",
            "temperature": 0.1,
            "max_tokens": 4000
        },
        "medical_specialist": {
            "id": "medical_specialist",
            "name": "Medical Specialist",
            "system_prompt": "You are a board-certified medical specialist with expertise in clinical practice and medical research.",
            "assigned_rag_domains": ["medical_literature", "clinical_guidelines"],
            "assigned_tools": ["pubmed_search", "clinical_trial_lookup"],
            "model_preference": "gpt-4",
            "temperature": 0.1,
            "max_tokens": 4000
        },
        "clinical_researcher": {
            "id": "clinical_researcher",
            "name": "Clinical Research Expert",
            "system_prompt": "You are a clinical research expert specializing in study design, protocols, and research methodology.",
            "assigned_rag_domains": ["clinical_research", "study_protocols"],
            "assigned_tools": ["protocol_analyzer", "statistics_calculator"],
            "model_preference": "gpt-4",
            "temperature": 0.1,
            "max_tokens": 4000
        }
    }
    
    return defaults.get(agent_id, defaults["regulatory_expert"])
```

---

## 3. Enhanced Mode 1 with Agent Configuration

```python
# mode1_interactive_auto_workflow.py - ENHANCEMENTS

@trace_node("mode1_select_expert")
async def select_expert_automatic_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    ENHANCED: Select expert and load their configuration.
    """
    tenant_id = state['tenant_id']
    query = state['query']
    
    # ... existing selection logic ...
    
    selected_agent_id = selection_result.get('agent_id')
    
    # ✨ NEW: Load agent configuration
    agent_config = await self.agent_selector.get_agent_configuration(
        agent_id=selected_agent_id,
        tenant_id=tenant_id
    )
    
    logger.info(
        "Agent configuration loaded",
        agent_id=selected_agent_id,
        system_prompt_length=len(agent_config.get('system_prompt', '')),
        assigned_domains=agent_config.get('assigned_rag_domains', []),
        assigned_tools=agent_config.get('assigned_tools', [])
    )
    
    return {
        **state,
        'selected_agents': state.get('selected_agents', []) + [selected_agent_id],
        'selection_reasoning': reasoning,
        'selection_confidence': confidence,
        'agent_config': agent_config,  # ✨ Store full config
        'current_node': 'select_expert'
    }

@trace_node("mode1_rag_retrieval")
async def rag_retrieval_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    ENHANCED: Use agent's assigned RAG domains.
    """
    tenant_id = state['tenant_id']
    query = state['query']
    agent_config = state.get('agent_config', {})
    
    # ✨ Use agent's assigned RAG domains
    agent_assigned_domains = agent_config.get('assigned_rag_domains', [])
    
    # Frontend selection overrides (if user specified)
    user_selected_domains = state.get('selected_rag_domains', [])
    
    # Priority: User selection > Agent assignment > All domains
    domains_to_search = (
        user_selected_domains 
        if user_selected_domains 
        else agent_assigned_domains
    )
    
    logger.info(
        "RAG retrieval with agent domains",
        agent_domains=agent_assigned_domains,
        user_domains=user_selected_domains,
        final_domains=domains_to_search
    )
    
    # Perform RAG retrieval with agent's domains
    rag_results = await self.rag_service.search(
        query=query,
        tenant_id=tenant_id,
        agent_id=state['selected_agents'][-1],
        domains=domains_to_search if domains_to_search else None,
        max_results=state.get('max_results', 5)
    )
    
    documents = rag_results.get('documents', [])
    
    # ✨ Calculate RAG quality score
    rag_quality_score = self._calculate_rag_quality(documents, query)
    
    return {
        **state,
        'retrieved_documents': state.get('retrieved_documents', []) + documents,
        'rag_quality_score': rag_quality_score,  # ✨ NEW
        'domains_used': domains_to_search,
        'current_node': 'rag_retrieval'
    }

@trace_node("mode1_execute_agent")
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    ENHANCED: Use agent's system prompt, tools, and model preference.
    """
    tenant_id = state['tenant_id']
    query = state['query']
    agent_config = state.get('agent_config', {})
    
    # ✨ Use agent's system prompt
    agent_system_prompt = agent_config.get('system_prompt', '')
    
    # ✨ Combine with grounding enforcement
    full_system_prompt = f"{GROUNDING_SYSTEM_PROMPT}\n\n{agent_system_prompt}"
    
    # ✨ Use agent's assigned tools
    agent_tools = agent_config.get('assigned_tools', [])
    user_selected_tools = state.get('selected_tools', [])
    
    # Priority: User selection > Agent assignment
    tools_to_use = (
        user_selected_tools 
        if user_selected_tools 
        else agent_tools
    )
    
    # ✨ Use agent's model preference (can be overridden by user)
    model = state.get('model') or agent_config.get('model_preference', 'gpt-4')
    temperature = state.get('temperature') or agent_config.get('temperature', 0.1)
    max_tokens = state.get('max_tokens') or agent_config.get('max_tokens', 4000)
    
    logger.info(
        "Executing agent with configuration",
        agent_id=agent_config.get('id'),
        model=model,
        temperature=temperature,
        tools=tools_to_use,
        has_custom_prompt=bool(agent_system_prompt)
    )
    
    # Execute agent
    agent_response = await self.agent_orchestrator.execute_agent(
        agent_id=selected_agent,
        query=grounding_prompt,
        context=context_summary,
        conversation_history=formatted_conversation,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        tenant_id=tenant_id,
        system_prompt=full_system_prompt,  # ✨ Agent-specific
        tools=tools_to_use  # ✨ Agent-specific
    )
    
    response_text = agent_response.get('response', '')
    tokens_used = agent_response.get('tokens_used', 0)
    
    # ✨ Calculate multi-factor confidence
    confidence_breakdown = await self._calculate_confidence(
        state=state,
        response=response_text,
        agent_config=agent_config
    )
    
    final_confidence = confidence_breakdown['final_confidence']
    
    logger.info(
        "Agent executed with confidence calculation",
        final_confidence=final_confidence,
        breakdown=confidence_breakdown
    )
    
    return {
        **state,
        'agent_response': response_text,
        'response_confidence': final_confidence,
        'confidence_breakdown': confidence_breakdown,  # ✨ Detailed breakdown
        'tokens_used': tokens_used,
        'model_used': model,
        'tools_used': tools_to_use,
        'current_node': 'execute_agent'
    }
```

---

## 4. Multi-Factor Confidence Calculation

```python
async def _calculate_confidence(
    self,
    state: UnifiedWorkflowState,
    response: str,
    agent_config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate multi-factor confidence score.
    
    Factors:
    1. RAG Quality (30%) - How good are the retrieved documents?
    2. Response Quality (30%) - How well-formed is the response?
    3. Citation Quality (20%) - How well does it cite sources?
    4. Context Relevance (20%) - How relevant is context to query?
    
    Returns:
        {
            'final_confidence': float (0-1),
            'rag_quality': float,
            'response_quality': float,
            'citation_quality': float,
            'context_relevance': float,
            'weights_used': dict
        }
    """
    # Get agent's confidence weights (or use defaults)
    weights = agent_config.get('confidence_weights', {
        'rag_quality': 0.3,
        'response_quality': 0.3,
        'citation_quality': 0.2,
        'context_relevance': 0.2
    })
    
    # Factor 1: RAG Quality Score
    rag_quality = state.get('rag_quality_score', 0.5)
    
    # Factor 2: Response Quality Score
    response_quality = self._score_response_quality(response)
    
    # Factor 3: Citation Quality Score
    citation_quality = self._score_citation_quality(
        response=response,
        documents=state.get('retrieved_documents', [])
    )
    
    # Factor 4: Context Relevance Score
    context_relevance = self._score_context_relevance(
        query=state.get('query', ''),
        context=state.get('context_summary', ''),
        response=response
    )
    
    # Calculate weighted confidence
    final_confidence = (
        rag_quality * weights['rag_quality'] +
        response_quality * weights['response_quality'] +
        citation_quality * weights['citation_quality'] +
        context_relevance * weights['context_relevance']
    )
    
    # Apply grounding validation penalty
    if state.get('grounding_validation') == 'failed':
        final_confidence *= 0.5  # 50% penalty for failed grounding
    
    logger.info(
        "Confidence calculated",
        final=final_confidence,
        rag_quality=rag_quality,
        response_quality=response_quality,
        citation_quality=citation_quality,
        context_relevance=context_relevance
    )
    
    return {
        'final_confidence': min(1.0, max(0.0, final_confidence)),
        'rag_quality': rag_quality,
        'response_quality': response_quality,
        'citation_quality': citation_quality,
        'context_relevance': context_relevance,
        'weights_used': weights,
        'grounding_penalty_applied': state.get('grounding_validation') == 'failed'
    }

def _calculate_rag_quality(
    self,
    documents: List[Dict[str, Any]],
    query: str
) -> float:
    """
    Calculate RAG quality score based on:
    - Number of documents retrieved
    - Average similarity scores
    - Document recency
    - Source authority
    """
    if not documents:
        return 0.0
    
    scores = []
    
    for doc in documents[:5]:  # Top 5 documents
        doc_score = 0.0
        
        # Similarity score (if available)
        similarity = doc.get('similarity', doc.get('score', 0.5))
        doc_score += similarity * 0.4  # 40% weight
        
        # Recency score (prefer recent documents)
        doc_date = doc.get('date', doc.get('created_at'))
        if doc_date:
            # Simple recency: documents from last 2 years = 1.0
            # Older documents decay linearly
            from datetime import datetime
            try:
                date_obj = datetime.fromisoformat(doc_date.replace('Z', '+00:00'))
                age_days = (datetime.now() - date_obj).days
                recency_score = max(0.0, 1.0 - (age_days / 730))  # 2 years = 730 days
                doc_score += recency_score * 0.3  # 30% weight
            except:
                doc_score += 0.5 * 0.3  # Default if parsing fails
        else:
            doc_score += 0.5 * 0.3
        
        # Source authority (if available)
        source_type = doc.get('source_type', 'unknown')
        authority_scores = {
            'fda_guideline': 1.0,
            'peer_reviewed': 0.9,
            'clinical_trial': 0.85,
            'regulatory_document': 0.95,
            'internal_document': 0.7,
            'unknown': 0.5
        }
        authority_score = authority_scores.get(source_type, 0.5)
        doc_score += authority_score * 0.3  # 30% weight
        
        scores.append(doc_score)
    
    # Average score across documents
    avg_score = sum(scores) / len(scores) if scores else 0.0
    
    # Bonus for having multiple high-quality documents
    if len(documents) >= 3 and avg_score > 0.7:
        avg_score = min(1.0, avg_score * 1.1)  # 10% bonus
    
    return avg_score

def _score_response_quality(self, response: str) -> float:
    """
    Score response quality based on:
    - Length appropriateness
    - Structure (paragraphs, formatting)
    - Language clarity
    - Completeness indicators
    """
    if not response:
        return 0.0
    
    score = 0.5  # Base score
    
    # Length appropriateness (50-2000 chars is good)
    length = len(response)
    if 50 <= length <= 2000:
        score += 0.2
    elif length > 2000:
        score += 0.1  # Verbose
    
    # Has structure (multiple sentences/paragraphs)
    sentences = response.count('.') + response.count('!') + response.count('?')
    if sentences >= 3:
        score += 0.1
    
    # Has proper formatting (lists, citations)
    if '[Source:' in response or '1.' in response or '-' in response:
        score += 0.1
    
    # Clarity indicators (avoids filler words)
    filler_words = ['basically', 'actually', 'literally', 'just', 'really']
    filler_count = sum(response.lower().count(word) for word in filler_words)
    if filler_count < 3:
        score += 0.1
    
    return min(1.0, score)

def _score_citation_quality(
    self,
    response: str,
    documents: List[Dict[str, Any]]
) -> float:
    """
    Score how well the response cites sources.
    """
    if not response:
        return 0.0
    
    score = 0.0
    
    # Has explicit citations
    citation_count = response.count('[Source:')
    if citation_count > 0:
        score += 0.4
        if citation_count >= 2:
            score += 0.2  # Multiple citations bonus
    
    # References document content
    if documents:
        doc_keywords = set()
        for doc in documents[:3]:
            content = doc.get('content', '').lower()
            # Extract key terms
            words = content.split()[:100]
            doc_keywords.update(words)
        
        response_words = set(response.lower().split())
        overlap = len(doc_keywords & response_words)
        
        if overlap >= 10:
            score += 0.4
    
    return min(1.0, score)

def _score_context_relevance(
    self,
    query: str,
    context: str,
    response: str
) -> float:
    """
    Score how relevant the context is to the query and response.
    """
    if not query or not context:
        return 0.3  # Low score if missing
    
    score = 0.0
    
    # Query keywords in context
    query_words = set(query.lower().split())
    context_words = set(context.lower().split())
    
    query_context_overlap = len(query_words & context_words)
    if query_context_overlap >= 3:
        score += 0.5
    
    # Context keywords in response
    response_words = set(response.lower().split())
    context_response_overlap = len(context_words & response_words)
    
    if context_response_overlap >= 10:
        score += 0.5
    
    return min(1.0, score)
```

---

## 5. Updated State Schema

```python
class UnifiedWorkflowState(TypedDict):
    # ... existing fields ...
    
    # Agent configuration
    agent_config: NotRequired[Dict[str, Any]]  # ✨ NEW
    domains_used: NotRequired[List[str]]  # ✨ NEW
    tools_used: NotRequired[List[str]]  # ✨ NEW
    
    # Confidence calculation
    rag_quality_score: NotRequired[float]  # ✨ NEW
    response_quality: NotRequired[float]  # ✨ NEW
    citation_quality: NotRequired[float]  # ✨ NEW
    context_relevance: NotRequired[float]  # ✨ NEW
    confidence_breakdown: NotRequired[Dict[str, Any]]  # ✨ NEW
```

---

## 6. Database Migration

```sql
-- Add agent configuration fields to agents table

ALTER TABLE agents ADD COLUMN IF NOT EXISTS system_prompt TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS assigned_rag_domains TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS assigned_tools TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS model_preference VARCHAR(50) DEFAULT 'gpt-4';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS temperature FLOAT DEFAULT 0.1;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 4000;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS confidence_weights JSONB;

-- Example data
UPDATE agents SET 
    system_prompt = 'You are an expert FDA regulatory consultant...',
    assigned_rag_domains = ARRAY['regulatory_affairs', 'fda_guidelines'],
    assigned_tools = ARRAY['fda_search', 'regulation_lookup'],
    model_preference = 'gpt-4',
    temperature = 0.1,
    confidence_weights = '{"rag_quality": 0.3, "response_quality": 0.3, "citation_quality": 0.2, "context_relevance": 0.2}'
WHERE id = 'regulatory_expert';
```

---

## 7. Testing

```python
@pytest.mark.asyncio
async def test_agent_configuration_loading():
    """Test that agent configuration is properly loaded"""
    workflow = Mode1InteractiveAutoWorkflow(...)
    
    result = await workflow.execute(
        tenant_id="test",
        query="What are FDA requirements?"
    )
    
    # Should have agent config
    assert 'agent_config' in result
    assert result['agent_config']['id'] == 'regulatory_expert'
    assert 'system_prompt' in result['agent_config']
    assert 'assigned_rag_domains' in result['agent_config']
    assert 'assigned_tools' in result['agent_config']

@pytest.mark.asyncio
async def test_agent_rag_domains_used():
    """Test that agent's assigned RAG domains are used"""
    workflow = Mode1InteractiveAutoWorkflow(...)
    
    result = await workflow.execute(
        tenant_id="test",
        query="What are FDA requirements?"
    )
    
    # Should use agent's assigned domains
    assert 'domains_used' in result
    assert 'regulatory_affairs' in result['domains_used']
    assert 'fda_guidelines' in result['domains_used']

@pytest.mark.asyncio
async def test_confidence_calculation():
    """Test multi-factor confidence calculation"""
    workflow = Mode1InteractiveAutoWorkflow(...)
    
    result = await workflow.execute(
        tenant_id="test",
        query="What are FDA IND requirements?"
    )
    
    # Should have confidence breakdown
    assert 'confidence_breakdown' in result
    breakdown = result['confidence_breakdown']
    
    assert 'final_confidence' in breakdown
    assert 'rag_quality' in breakdown
    assert 'response_quality' in breakdown
    assert 'citation_quality' in breakdown
    assert 'context_relevance' in breakdown
    
    # All scores should be 0-1
    for key, value in breakdown.items():
        if key != 'weights_used':
            assert 0.0 <= value <= 1.0
```

---

## Summary

✅ **Agent-Specific System Prompts** - Each agent uses their configured prompt
✅ **Agent-Assigned RAG Domains** - Retrieves from agent's designated domains  
✅ **Agent-Assigned Tools** - Uses agent's specific toolset
✅ **Multi-Factor Confidence** - 4-factor weighted calculation
✅ **Confidence Breakdown** - Detailed scores for each factor
✅ **Model Preferences** - Agent-specific model/temp/tokens
✅ **User Overrides** - Frontend selections override agent defaults

**This ensures each agent uses their specialized configuration while maintaining user control.** 🎯

