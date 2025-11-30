"""
LangGraph State Schemas for VITAL Path AI Services

This module defines TypedDict state classes for all LangGraph workflows.
Following LangGraph best practices:
- Use TypedDict for type safety (NOT Dict[str, Any])
- Include tenant_id in ALL states (Golden Rule #3)
- Clear, specific field names
- Comprehensive documentation
- Immutable state updates via reducers

Reference: https://langchain-ai.github.io/langgraph/concepts/low_level/
"""

from typing import TypedDict, List, Dict, Any, Optional, Annotated, Sequence
from typing_extensions import NotRequired
from datetime import datetime
from enum import Enum
import operator


# =============================================================================
# BASE ENUMS FOR TYPE SAFETY
# =============================================================================

class WorkflowMode(str, Enum):
    """
    Workflow execution modes (PRD v1.2.1 compliant naming)

    Mode naming convention:
    - First part: Selection method (manual = user selects, auto = system selects)
    - Second part: Execution style (selection = interactive, autonomous = agentic)
    """
    # Mode 1: User manually selects agent, interactive execution
    MANUAL_SELECTION = "manual_selection"

    # Mode 2: System auto-selects best agent, interactive execution
    AUTO_SELECTION = "auto_selection"

    # Mode 3: User selects agent(s), autonomous multi-agent execution
    MANUAL_AUTONOMOUS = "manual_autonomous"

    # Mode 4: System selects, autonomous execution with streaming
    AUTO_AUTONOMOUS = "auto_autonomous"

    # Legacy aliases for backward compatibility (will be deprecated)
    MODE_1_MANUAL = "manual_selection"
    MODE_2_AUTOMATIC = "auto_selection"
    MODE_3_AUTONOMOUS = "manual_autonomous"
    MODE_4_STREAMING = "auto_autonomous"
    

class AgentType(str, Enum):
    """Available agent types"""
    REGULATORY_EXPERT = "regulatory_expert"
    MEDICAL_SPECIALIST = "medical_specialist"
    CLINICAL_RESEARCHER = "clinical_researcher"
    PHARMACOVIGILANCE = "pharmacovigilance"
    MEDICAL_WRITER = "medical_writer"


class ExecutionStatus(str, Enum):
    """Workflow execution status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# =============================================================================
# CORE STATE SCHEMAS (TypedDict - GOLDEN RULE)
# =============================================================================

class BaseWorkflowState(TypedDict):
    """
    Base state for all LangGraph workflows.
    
    Golden Rules Compliance:
    - ✅ TypedDict (not Dict[str, Any])
    - ✅ tenant_id required (Golden Rule #3)
    - ✅ Clear field names
    - ✅ Comprehensive types
    """
    # REQUIRED: Tenant isolation (Golden Rule #3)
    tenant_id: str  # UUID - REQUIRED for ALL workflows
    
    # Request metadata
    request_id: str  # Unique request identifier
    user_id: NotRequired[Optional[str]]  # User who initiated request
    session_id: NotRequired[Optional[str]]  # Session identifier
    
    # Workflow control
    mode: WorkflowMode  # Execution mode
    status: ExecutionStatus  # Current execution status
    
    # Timestamps
    created_at: datetime  # Workflow creation time
    updated_at: datetime  # Last update time
    
    # Error handling
    errors: NotRequired[List[str]]  # Accumulated errors
    retry_count: NotRequired[int]  # Number of retries
    
    # Observability
    trace_id: NotRequired[str]  # Distributed tracing ID
    metrics: NotRequired[Dict[str, Any]]  # Performance metrics


class QueryInputState(TypedDict):
    """
    User query input state.
    
    Used at the beginning of ALL workflows to capture user intent.
    """
    # User query
    query: str  # User's question/request
    
    # Query metadata
    query_language: NotRequired[str]  # Detected language
    query_length: NotRequired[int]  # Character count
    
    # Optional filters
    medical_specialty: NotRequired[Optional[str]]  # Target specialty
    phase: NotRequired[Optional[str]]  # VITAL phase
    domains: NotRequired[List[str]]  # Knowledge domains to search
    
    # Configuration
    enable_rag: NotRequired[bool]  # Enable RAG retrieval
    enable_tools: NotRequired[bool]  # Enable tool execution
    max_results: NotRequired[int]  # Max RAG results
    temperature: NotRequired[float]  # LLM temperature
    max_tokens: NotRequired[int]  # LLM max tokens


class AgentSelectionState(TypedDict):
    """
    Agent selection state for Mode 2 and Mode 3 workflows.
    
    Stores agent selection logic and confidence scores.
    """
    # Selected agents (use Annotated for list append reducer)
    selected_agents: Annotated[List[AgentType], operator.add]
    
    # Selection metadata
    selection_reasoning: NotRequired[str]  # Why these agents were selected
    selection_confidence: NotRequired[float]  # Confidence in selection
    
    # Query analysis
    detected_intent: NotRequired[str]  # User intent
    detected_domains: NotRequired[List[str]]  # Relevant domains
    complexity_score: NotRequired[float]  # Query complexity
    
    # Multi-agent coordination
    agent_roles: NotRequired[Dict[str, str]]  # Agent role assignments
    execution_order: NotRequired[List[str]]  # Execution sequence


class RAGRetrievalState(TypedDict):
    """
    RAG retrieval state with caching support (Golden Rule #2).
    
    Stores document retrieval results and caching metadata.
    """
    # Query for retrieval
    rag_query: str  # Processed query for RAG
    
    # Embeddings (with caching)
    query_embedding: NotRequired[List[float]]  # Query embedding vector
    embedding_cached: NotRequired[bool]  # Was embedding from cache
    embedding_cache_key: NotRequired[str]  # Cache key used
    
    # Retrieved documents (use Annotated for list extend reducer)
    retrieved_documents: Annotated[List[Dict[str, Any]], operator.add]
    
    # Retrieval metadata
    retrieval_confidence: NotRequired[float]  # Retrieval quality
    total_documents: NotRequired[int]  # Total docs found
    filtered_documents: NotRequired[int]  # After filtering
    
    # Caching metadata (Golden Rule #2)
    rag_cache_hit: NotRequired[bool]  # Was result from cache
    rag_cache_key: NotRequired[str]  # Cache key used
    
    # Context summary
    context_summary: NotRequired[Dict[str, Any]]  # Aggregated context
    evidence_level: NotRequired[str]  # Overall evidence level
    specialties_covered: NotRequired[List[str]]  # Specialties in results


class AgentExecutionState(TypedDict):
    """
    Agent execution state for running AI agents.
    
    Stores agent prompts, responses, and execution metadata.
    """
    # Agent identification
    agent_id: str  # Agent being executed
    agent_type: AgentType  # Type of agent
    
    # Agent prompt
    system_prompt: NotRequired[str]  # System prompt for agent
    user_prompt: NotRequired[str]  # User prompt
    context: NotRequired[str]  # RAG context
    
    # Agent response
    agent_response: NotRequired[str]  # Generated response
    response_confidence: NotRequired[float]  # Response confidence
    
    # LLM metadata
    model_used: NotRequired[str]  # LLM model name
    tokens_used: NotRequired[int]  # Token count
    cost_estimate: NotRequired[float]  # Cost in USD
    
    # Response quality
    citations: NotRequired[List[Dict[str, Any]]]  # Source citations
    confidence_breakdown: NotRequired[Dict[str, float]]  # Confidence components
    
    # Caching (Golden Rule #2)
    response_cached: NotRequired[bool]  # Was response from cache
    cache_key: NotRequired[str]  # Cache key used


class ConsensusState(TypedDict):
    """
    Multi-agent consensus state for Mode 3 workflows.
    
    Aggregates responses from multiple agents.
    """
    # Agent responses (use Annotated for list extend reducer)
    agent_responses: Annotated[List[Dict[str, Any]], operator.add]
    
    # Consensus building
    consensus_method: NotRequired[str]  # How consensus was reached
    agreement_score: NotRequired[float]  # Level of agreement
    
    # Synthesized output
    synthesized_response: NotRequired[str]  # Final combined response
    synthesis_confidence: NotRequired[float]  # Confidence in synthesis
    
    # Conflict resolution
    conflicts_detected: NotRequired[List[str]]  # Conflicting information
    conflict_resolution: NotRequired[str]  # How conflicts were resolved


class OutputState(TypedDict):
    """
    Final output state returned to user.
    
    Clean, structured response with all metadata.
    """
    # Primary response
    response: str  # Final answer to user
    confidence: float  # Overall confidence score
    
    # Response metadata
    agents_used: List[str]  # Which agents contributed
    sources_used: NotRequired[int]  # Number of sources cited
    
    # Citations and evidence
    citations: List[Dict[str, Any]]  # Source citations
    evidence_level: NotRequired[str]  # Evidence quality
    
    # Quality indicators
    confidence_breakdown: NotRequired[Dict[str, float]]  # Confidence components
    quality_indicators: NotRequired[Dict[str, Any]]  # Quality metrics
    
    # Processing metadata
    processing_time_ms: NotRequired[float]  # Total processing time
    tokens_used: NotRequired[int]  # Total tokens
    cost_estimate: NotRequired[float]  # Total cost
    cache_hits: NotRequired[int]  # Cache hit count
    
    # Recommendations
    follow_up_questions: NotRequired[List[str]]  # Suggested follow-ups
    related_topics: NotRequired[List[str]]  # Related areas


# =============================================================================
# UNIFIED WORKFLOW STATE (ALL MODES)
# =============================================================================

class UnifiedWorkflowState(TypedDict):
    """
    Unified state for all workflow modes.
    
    This is the SINGLE SOURCE OF TRUTH for LangGraph workflows.
    
    Golden Rules Compliance:
    - ✅ TypedDict (not Dict[str, Any])
    - ✅ tenant_id REQUIRED (Golden Rule #3)
    - ✅ Caching fields included (Golden Rule #2)
    - ✅ Clear separation of concerns
    - ✅ Comprehensive type safety
    
    Usage:
        from langgraph.graph import StateGraph
        
        workflow = StateGraph(UnifiedWorkflowState)
        workflow.add_node("process_query", process_query_node)
        ...
    """
    # =========================================================================
    # BASE STATE (REQUIRED FOR ALL WORKFLOWS)
    # =========================================================================
    
    # GOLDEN RULE #3: Tenant isolation (REQUIRED)
    tenant_id: str  # UUID - MUST be set by middleware
    
    # Request identification
    request_id: str  # Unique request ID
    user_id: NotRequired[Optional[str]]  # User ID
    session_id: NotRequired[Optional[str]]  # Session ID
    
    # Workflow control
    mode: WorkflowMode  # Execution mode
    status: ExecutionStatus  # Current status
    current_node: NotRequired[str]  # Current execution node
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # =========================================================================
    # INPUT STATE
    # =========================================================================
    
    # User query
    query: str  # User's question/request
    query_language: NotRequired[str]
    query_length: NotRequired[int]
    
    # Query filters
    medical_specialty: NotRequired[Optional[str]]
    phase: NotRequired[Optional[str]]
    domains: NotRequired[List[str]]
    
    # Configuration
    enable_rag: NotRequired[bool]
    enable_tools: NotRequired[bool]
    max_results: NotRequired[int]
    temperature: NotRequired[float]
    max_tokens: NotRequired[int]
    
    # =========================================================================
    # AGENT SELECTION STATE
    # =========================================================================
    
    # Selected agents (Annotated for reducer)
    selected_agents: Annotated[List[str], operator.add]
    
    # Selection metadata
    selection_reasoning: NotRequired[str]
    selection_confidence: NotRequired[float]
    detected_intent: NotRequired[str]
    detected_domains: NotRequired[List[str]]
    complexity_score: NotRequired[float]
    
    # =========================================================================
    # RAG RETRIEVAL STATE (WITH CACHING - GOLDEN RULE #2)
    # =========================================================================
    
    # Query embedding
    query_embedding: NotRequired[List[float]]
    embedding_cached: NotRequired[bool]  # Cache hit indicator
    embedding_cache_key: NotRequired[str]
    
    # Retrieved documents (Annotated for reducer)
    retrieved_documents: Annotated[List[Dict[str, Any]], operator.add]
    
    # Retrieval metadata
    retrieval_confidence: NotRequired[float]
    total_documents: NotRequired[int]
    rag_cache_hit: NotRequired[bool]  # Cache hit indicator
    rag_cache_key: NotRequired[str]
    context_summary: NotRequired[Dict[str, Any]]
    
    # =========================================================================
    # AGENT PREFERENCES (Citation style, formatting, etc.)
    # =========================================================================

    # Citation preferences (flows from agent metadata to tools)
    citation_style: NotRequired[str]  # apa, ama, chicago, harvard, vancouver, icmje, mla
    include_citations: NotRequired[bool]  # Whether to include citations in responses

    # =========================================================================
    # GRAPHRAG STATE (PHASE 4: HYBRID SEARCH WITH EVIDENCE CHAINS)
    # =========================================================================

    # GraphRAG configuration
    rag_profile_id: NotRequired[Optional[str]]  # RAG profile to use
    graphrag_enabled: NotRequired[bool]  # Whether GraphRAG was executed
    
    # GraphRAG results
    graphrag_context: NotRequired[List[Dict[str, Any]]]  # Context chunks with citations
    evidence_chain: NotRequired[List[Dict[str, Any]]]  # Evidence provenance
    citations: NotRequired[List[Dict[str, Any]]]  # Citation list
    
    # GraphRAG metadata
    graphrag_metadata: NotRequired[Dict[str, Any]]  # Search methods, profile used, etc.
    graphrag_error: NotRequired[Optional[str]]  # Error if GraphRAG failed
    
    # =========================================================================
    # AGENT EXECUTION STATE (WITH CACHING - GOLDEN RULE #2)
    # =========================================================================
    
    # Current agent
    current_agent_id: NotRequired[str]
    current_agent_type: NotRequired[str]
    
    # Agent prompts
    system_prompt: NotRequired[str]
    user_prompt: NotRequired[str]
    context: NotRequired[str]
    
    # Agent response
    agent_response: NotRequired[str]
    response_confidence: NotRequired[float]
    response_cached: NotRequired[bool]  # Cache hit indicator
    
    # LLM metadata
    model_used: NotRequired[str]
    tokens_used: NotRequired[int]
    cost_estimate: NotRequired[float]
    
    # =========================================================================
    # MULTI-AGENT CONSENSUS STATE (MODE 3)
    # =========================================================================
    
    # Agent responses (Annotated for reducer)
    agent_responses: Annotated[List[Dict[str, Any]], operator.add]
    
    # Consensus
    consensus_method: NotRequired[str]
    agreement_score: NotRequired[float]
    synthesized_response: NotRequired[str]
    synthesis_confidence: NotRequired[float]
    
    # =========================================================================
    # OUTPUT STATE
    # =========================================================================
    
    # Final response
    response: NotRequired[str]
    confidence: NotRequired[float]
    agents_used: NotRequired[List[str]]
    
    # Citations
    citations: NotRequired[List[Dict[str, Any]]]
    evidence_level: NotRequired[str]
    
    # Metadata
    processing_time_ms: NotRequired[float]
    cache_hits: NotRequired[int]  # Total cache hits (GOLDEN RULE #2)
    
    # =========================================================================
    # ERROR HANDLING & OBSERVABILITY
    # =========================================================================
    
    # Errors
    errors: Annotated[List[str], operator.add]
    retry_count: NotRequired[int]
    
    # Tracing
    trace_id: NotRequired[str]
    metrics: NotRequired[Dict[str, Any]]


# =============================================================================
# STATE FACTORY FUNCTIONS
# =============================================================================

def create_initial_state(
    tenant_id: str,
    query: str,
    mode: WorkflowMode,
    request_id: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    **kwargs
) -> UnifiedWorkflowState:
    """
    Create initial workflow state with required fields.
    
    Golden Rules:
    - ✅ tenant_id is REQUIRED
    - ✅ Returns properly typed state
    - ✅ Sets safe defaults
    
    Args:
        tenant_id: Tenant UUID (REQUIRED - Golden Rule #3)
        query: User query
        mode: Workflow mode
        request_id: Unique request ID
        user_id: Optional user ID
        session_id: Optional session ID
        **kwargs: Additional configuration
        
    Returns:
        Initial workflow state
        
    Example:
        >>> state = create_initial_state(
        ...     tenant_id="550e8400-e29b-41d4-a716-446655440000",
        ...     query="What are FDA IND requirements?",
        ...     mode=WorkflowMode.MODE_2_AUTOMATIC,
        ...     request_id="req_123"
        ... )
    """
    now = datetime.utcnow()
    
    # Handle agent_id vs selected_agents (Mode 1 uses agent_id, Mode 2/3/4 use selected_agents)
    selected_agents = kwargs.get('selected_agents', [])
    if not selected_agents and 'agent_id' in kwargs and kwargs['agent_id']:
        # Convert single agent_id to list for consistency
        selected_agents = [kwargs['agent_id']]
    
    return UnifiedWorkflowState(
        # Required fields
        tenant_id=tenant_id,
        request_id=request_id,
        query=query,
        mode=mode,
        status=ExecutionStatus.PENDING,
        created_at=now,
        updated_at=now,
        
        # Optional fields
        user_id=user_id,
        session_id=session_id,
        
        # Lists (empty defaults)
        selected_agents=selected_agents,
        retrieved_documents=[],
        agent_responses=[],
        errors=[],
        
        # Configuration from kwargs
        enable_rag=kwargs.get('enable_rag', True),
        enable_tools=kwargs.get('enable_tools', False),
        max_results=kwargs.get('max_results', 5),
        temperature=kwargs.get('temperature', 0.1),
        max_tokens=kwargs.get('max_tokens', 4000),

        # Agent preferences (citation style, etc.)
        citation_style=kwargs.get('citation_style', 'apa'),
        include_citations=kwargs.get('include_citations', True),
    )


def validate_state(state: UnifiedWorkflowState) -> bool:
    """
    Validate state has required fields.
    
    Golden Rule #3: tenant_id must always be present
    
    Args:
        state: State to validate
        
    Returns:
        True if valid, False otherwise
        
    Raises:
        ValueError: If critical fields are missing
    """
    # GOLDEN RULE #3: tenant_id is REQUIRED
    if not state.get('tenant_id'):
        raise ValueError("tenant_id is REQUIRED in all workflow states (Golden Rule #3)")
    
    # Other required fields
    required_fields = ['request_id', 'query', 'mode', 'status']
    missing = [f for f in required_fields if not state.get(f)]
    
    if missing:
        raise ValueError(f"Missing required fields: {missing}")
    
    return True

