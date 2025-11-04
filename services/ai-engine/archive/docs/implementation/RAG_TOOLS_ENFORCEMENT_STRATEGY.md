# 🎯 RAG and Tools Enforcement Strategy

## Critical Issue: Preventing LLM Hallucination

**Problem:** LLMs have outdated training data and can hallucinate medical/regulatory information.

**Solution:** FORCE the use of RAG retrieval and tools BEFORE allowing LLM to respond.

---

## Golden Rule Addition

**Golden Rule #4:** "LLMs MUST NOT answer from trained knowledge alone. All responses MUST be grounded in retrieved documents or tool outputs."

---

## Implementation Strategy

### 1. **System Prompt Enforcement**

```python
GROUNDING_SYSTEM_PROMPT = """
CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE RULES:

1. DO NOT answer questions using only your trained knowledge
2. DO NOT make assumptions about regulations, guidelines, or medical facts
3. YOU MUST cite specific documents from the provided context
4. IF the context doesn't contain the answer, say "I cannot find this information in the available documents"
5. ALWAYS reference specific sources with [Source: document_name]
6. FOR medical/regulatory queries, ONLY use information from retrieved documents

Your response MUST be based on:
- Retrieved documents (provided in context)
- Tool execution results (if tools were used)
- Conversation history (for context only)

If you cannot answer based on retrieved information, respond:
"I don't have access to verified information about this topic in my current knowledge base. Please provide more context or rephrase your question."
"""
```

### 2. **Validation Node: Check Grounding**

Add a post-processing node that validates the response is grounded:

```python
@trace_node("validate_grounding")
async def validate_grounding_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    Node: Validate that response is grounded in retrieved docs/tools.
    
    Checks:
    1. Are citations present?
    2. Does response reference context?
    3. Are there hallucination indicators?
    """
    agent_response = state.get('agent_response', '')
    retrieved_documents = state.get('retrieved_documents', [])
    context_summary = state.get('context_summary', '')
    
    # Check 1: Citations present
    has_citations = '[Source:' in agent_response or 'according to' in agent_response.lower()
    
    # Check 2: Context was provided
    has_context = len(retrieved_documents) > 0 or len(context_summary) > 0
    
    # Check 3: Hallucination indicators
    hallucination_phrases = [
        'i believe', 'i think', 'probably', 'likely', 'in my opinion',
        'based on my training', 'from what i know', 'generally speaking'
    ]
    has_hallucination_indicators = any(
        phrase in agent_response.lower() 
        for phrase in hallucination_phrases
    )
    
    # Validation result
    is_grounded = has_citations and has_context and not has_hallucination_indicators
    
    if not is_grounded:
        logger.warning(
            "❌ Response not properly grounded",
            has_citations=has_citations,
            has_context=has_context,
            has_hallucination_indicators=has_hallucination_indicators
        )
        
        # Inject warning into response
        warning = "\n\n⚠️ Note: This response may not be fully grounded in verified sources."
        return {
            **state,
            'agent_response': agent_response + warning,
            'response_confidence': state.get('response_confidence', 0.0) * 0.5,  # Reduce confidence
            'grounding_validation': 'failed',
            'current_node': 'validate_grounding'
        }
    
    logger.info("✅ Response properly grounded in sources")
    return {
        **state,
        'grounding_validation': 'passed',
        'current_node': 'validate_grounding'
    }
```

### 3. **Force RAG for Critical Domains**

```python
def route_execution_strategy(self, state: UnifiedWorkflowState) -> str:
    """
    ENHANCED: Force RAG for medical/regulatory queries.
    
    Returns:
        "rag_and_tools" | "rag_only" | "tools_only" | "direct"
    """
    enable_rag = state.get('enable_rag', True)
    enable_tools = state.get('enable_tools', False)
    selected_tools = state.get('selected_tools', [])
    has_tools = enable_tools and len(selected_tools) > 0
    
    query = state.get('query', '').lower()
    
    # FORCE RAG for critical domains (even if frontend disables it)
    critical_keywords = [
        'fda', 'regulation', 'guideline', 'compliance', 'clinical trial',
        'medical device', 'drug', 'medication', 'treatment', 'diagnosis',
        'adverse event', 'safety', 'efficacy', 'approval', 'clearance'
    ]
    
    is_critical_domain = any(keyword in query for keyword in critical_keywords)
    
    if is_critical_domain:
        logger.warning(
            "🚨 Critical domain detected - FORCING RAG retrieval",
            query=query[:100]
        )
        enable_rag = True  # Override frontend setting
    
    # Routing logic
    if enable_rag and has_tools:
        return "rag_and_tools"
    elif enable_rag and not has_tools:
        return "rag_only"
    elif not enable_rag and has_tools:
        return "tools_only"
    else:
        # Even "direct" should warn user
        logger.warning("⚠️ Direct execution without RAG or tools")
        return "direct"
```

### 4. **Enhanced Agent Prompts**

```python
async def execute_agent_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
    """
    ENHANCED: Execute agent with strict grounding requirements.
    """
    # ... existing code ...
    
    # Build grounding-enforced prompt
    grounding_prompt = self._build_grounding_prompt(
        query=query,
        context=context_summary,
        conversation_history=formatted_conversation,
        agent_type=selected_agent
    )
    
    # Execute with strict instructions
    agent_response = await self.agent_orchestrator.execute_agent(
        agent_id=selected_agent,
        query=grounding_prompt,
        context=context_summary,
        conversation_history=formatted_conversation,
        model=model,
        temperature=0.1,  # Low temperature for factual responses
        max_tokens=state.get('max_tokens', 4000),
        tenant_id=tenant_id,
        system_prompt=GROUNDING_SYSTEM_PROMPT  # Add grounding instructions
    )
    
    # ... rest of code ...

def _build_grounding_prompt(
    self,
    query: str,
    context: str,
    conversation_history: List[Dict],
    agent_type: str
) -> str:
    """
    Build prompt that forces grounding in retrieved context.
    """
    if not context:
        return f"""
{query}

IMPORTANT: No context documents were retrieved for this query. 
You MUST respond: "I don't have access to verified documents about this topic. Could you rephrase your question or provide more specific details?"

DO NOT answer from your training data.
"""
    
    return f"""
Based ONLY on the following retrieved documents, answer this question:

QUESTION: {query}

RETRIEVED CONTEXT:
{context}

INSTRUCTIONS:
1. Answer ONLY using information from the context above
2. Cite specific sources using [Source: document_name]
3. If the context doesn't fully answer the question, say so explicitly
4. DO NOT add information from your training data
5. If uncertain, express that uncertainty clearly

YOUR RESPONSE:
"""
```

### 5. **Response Validation**

```python
async def validate_response_grounding(
    self,
    response: str,
    retrieved_documents: List[Dict[str, Any]],
    query: str
) -> Dict[str, Any]:
    """
    Validate that response is properly grounded.
    
    Returns:
        {
            'is_grounded': bool,
            'confidence': float,
            'issues': List[str],
            'suggestions': List[str]
        }
    """
    issues = []
    suggestions = []
    
    # Check 1: Response has citations
    if '[Source:' not in response and 'according to' not in response.lower():
        issues.append("No explicit source citations found")
        suggestions.append("Add specific document references")
    
    # Check 2: Response references context
    if len(retrieved_documents) > 0:
        # Check if response contains keywords from documents
        doc_keywords = set()
        for doc in retrieved_documents[:3]:  # Top 3 docs
            content = doc.get('content', '').lower()
            # Extract key terms (simplified - could use NLP)
            words = content.split()
            doc_keywords.update(words[:50])  # First 50 words
        
        response_words = set(response.lower().split())
        overlap = len(doc_keywords & response_words)
        
        if overlap < 5:  # Arbitrary threshold
            issues.append("Response doesn't appear to reference retrieved documents")
            suggestions.append("Ensure response uses information from context")
    
    # Check 3: Hallucination phrases
    hallucination_phrases = [
        'i believe', 'i think', 'probably', 'my understanding',
        'in general', 'typically', 'usually', 'based on my knowledge'
    ]
    
    found_phrases = [
        phrase for phrase in hallucination_phrases 
        if phrase in response.lower()
    ]
    
    if found_phrases:
        issues.append(f"Uncertain language detected: {', '.join(found_phrases)}")
        suggestions.append("Use definitive language backed by sources")
    
    # Check 4: Length disparity (hallucination indicator)
    if len(retrieved_documents) == 0 and len(response) > 200:
        issues.append("Long response without retrieved context")
        suggestions.append("Response should be shorter or acknowledge missing information")
    
    # Compute grounding confidence
    is_grounded = len(issues) == 0
    confidence = 1.0 - (len(issues) * 0.25)  # Reduce by 25% per issue
    
    return {
        'is_grounded': is_grounded,
        'confidence': max(0.0, confidence),
        'issues': issues,
        'suggestions': suggestions
    }
```

---

## Integration Points

### Enhanced Workflow with Grounding Validation

```
select_expert 
    ↓
route_execution_strategy (FORCES RAG for critical domains)
    ↓
rag_retrieval (REQUIRED for medical/regulatory)
    ↓
execute_agent (with GROUNDING_SYSTEM_PROMPT)
    ↓
validate_grounding (NEW NODE)
    ↓
    BRANCH: grounded → save_conversation
            not_grounded → regenerate_with_sources
    ↓
format_output
```

### Updated State Schema

```python
class UnifiedWorkflowState(TypedDict):
    # ... existing fields ...
    
    # Grounding validation
    grounding_validation: NotRequired[Literal['passed', 'failed', 'pending']]
    grounding_issues: NotRequired[List[str]]
    grounding_suggestions: NotRequired[List[str]]
    forced_rag: NotRequired[bool]  # If RAG was forced for critical domain
```

---

## Configuration

```python
# config/grounding_config.py

GROUNDING_CONFIG = {
    # Domains that REQUIRE RAG retrieval
    'critical_domains': [
        'regulatory', 'fda', 'ema', 'compliance',
        'medical', 'clinical', 'drug', 'device',
        'safety', 'adverse events', 'pharmacovigilance'
    ],
    
    # Minimum documents required
    'min_documents_required': 2,
    
    # Confidence threshold for grounding
    'min_grounding_confidence': 0.7,
    
    # Enforce citations
    'require_citations': True,
    
    # Hallucination detection
    'detect_hallucinations': True,
    'hallucination_phrases': [
        'i believe', 'i think', 'probably', 'likely',
        'in my opinion', 'based on my training',
        'from what i know', 'generally speaking'
    ]
}
```

---

## Testing Grounding

```python
@pytest.mark.asyncio
async def test_rag_enforcement_for_critical_queries():
    """Test that RAG is forced for medical/regulatory queries"""
    workflow = Mode1InteractiveAutoWorkflow(...)
    
    result = await workflow.execute(
        tenant_id="test",
        query="What are FDA IND requirements?",
        enable_rag=False  # User disabled, but should be forced
    )
    
    # Should force RAG despite frontend toggle
    assert result['forced_rag'] == True
    assert len(result['retrieved_documents']) > 0
    assert result['grounding_validation'] == 'passed'

@pytest.mark.asyncio
async def test_response_grounding_validation():
    """Test that ungrounded responses are caught"""
    workflow = Mode1InteractiveAutoWorkflow(...)
    
    # Mock response without citations
    state = {
        'agent_response': 'FDA requires several things for IND submissions...',  # No sources
        'retrieved_documents': [{'content': 'FDA guideline...'}],
        'context_summary': 'FDA requires...'
    }
    
    validated = await workflow.validate_grounding_node(state)
    
    assert validated['grounding_validation'] == 'failed'
    assert '⚠️ Note' in validated['agent_response']
```

---

## Summary

**Enforcement Mechanisms:**

1. ✅ **System Prompt:** Explicit instructions to not use trained knowledge
2. ✅ **Forced RAG:** Critical domains auto-enable RAG retrieval
3. ✅ **Grounding Validation:** Post-processing checks for citations and context usage
4. ✅ **Hallucination Detection:** Identifies uncertain/opinion-based language
5. ✅ **Response Rejection:** Can force regeneration if not grounded
6. ✅ **Confidence Adjustment:** Reduces confidence for ungrounded responses
7. ✅ **User Warnings:** Injects warnings for potentially ungrounded content

**This ensures the system ALWAYS retrieves current, verified information rather than relying on potentially outdated or hallucinated LLM knowledge.** 🎯

