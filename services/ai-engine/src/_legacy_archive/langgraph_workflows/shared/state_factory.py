"""
VITAL Path AI Services - State Factory

Unified state creation for all LangGraph workflows.
Centralizes state initialization logic that was duplicated across Mode 1-4.

Phase 1 Refactoring: Task 1.2.1 - Create State Factory

Golden Rules Compliance:
- ✅ tenant_id is ALWAYS required (Golden Rule #3)
- ✅ TypedDict for type safety
- ✅ Proper validation
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import structlog

from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
    create_initial_state as _create_initial_state,
    validate_state,
)

logger = structlog.get_logger()


class StateFactory:
    """
    Factory class for creating and validating workflow states.
    
    Provides mode-specific state creation while ensuring consistency
    across all workflow modes.
    
    Example:
        >>> state = StateFactory.create_mode1_state(
        ...     tenant_id="uuid",
        ...     query="What are FDA requirements?",
        ...     agent_id="agent_123"
        ... )
    """
    
    @staticmethod
    def create_initial_state(
        tenant_id: str,
        request_id: str,
        mode: WorkflowMode,
        query: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        **kwargs
    ) -> UnifiedWorkflowState:
        """
        Create initial state for any workflow mode.
        
        Args:
            tenant_id: Tenant UUID (REQUIRED - Golden Rule #3)
            request_id: Unique request identifier
            mode: Workflow execution mode
            query: User's question/request
            user_id: Optional user identifier
            session_id: Optional session identifier
            conversation_id: Optional conversation ID for multi-turn
            **kwargs: Additional mode-specific configuration
            
        Returns:
            Initialized UnifiedWorkflowState
            
        Raises:
            ValueError: If tenant_id is missing
        """
        if not tenant_id:
            raise ValueError("tenant_id is REQUIRED (Golden Rule #3)")
        
        # Generate request_id if not provided
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Use the existing create_initial_state function
        state = _create_initial_state(
            tenant_id=tenant_id,
            query=query,
            mode=mode,
            request_id=request_id,
            user_id=user_id,
            session_id=session_id or conversation_id,
            **kwargs
        )
        
        logger.debug(
            "state_factory_created_state",
            mode=mode.value,
            tenant_id=tenant_id,
            request_id=request_id,
        )
        
        return state
    
    @staticmethod
    def create_mode1_state(
        tenant_id: str,
        query: str,
        agent_id: str,
        request_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = False,
        selected_rag_domains: Optional[List[str]] = None,
        requested_tools: Optional[List[str]] = None,
        model: str = "gpt-4",
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
        citation_style: str = "apa",
        include_citations: bool = True,
    ) -> UnifiedWorkflowState:
        """
        Create initial state for Mode 1: Manual Interactive workflow.
        
        Mode 1 Specifics:
        - User manually selects an agent
        - Interactive multi-turn conversation
        - Single expert execution
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            query: User's question
            agent_id: ID of the manually selected agent
            request_id: Unique request ID (auto-generated if not provided)
            enable_rag: Enable RAG retrieval
            enable_tools: Enable tool execution
            selected_rag_domains: RAG domain filters
            requested_tools: Tools to enable
            model: LLM model to use
            temperature: LLM temperature
            max_tokens: Max tokens for response
            user_id: User identifier
            session_id: Session identifier
            conversation_history: Previous conversation turns
            citation_style: Citation style (apa, ama, etc.)
            include_citations: Include citations in response
            
        Returns:
            Mode 1 initialized state
        """
        return StateFactory.create_initial_state(
            tenant_id=tenant_id,
            request_id=request_id or str(uuid.uuid4()),
            mode=WorkflowMode.MODE_1_MANUAL,
            query=query,
            user_id=user_id,
            session_id=session_id,
            selected_agents=[agent_id],
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            selected_rag_domains=selected_rag_domains or [],
            requested_tools=requested_tools or [],
            model=model,
            temperature=temperature or 0.1,
            max_tokens=max_tokens or 4000,
            citation_style=citation_style,
            include_citations=include_citations,
        )
    
    @staticmethod
    def create_mode2_state(
        tenant_id: str,
        query: str,
        request_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = False,
        selected_rag_domains: Optional[List[str]] = None,
        requested_tools: Optional[List[str]] = None,
        model: str = "gpt-4",
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, Any]]] = None,
    ) -> UnifiedWorkflowState:
        """
        Create initial state for Mode 2: Automatic Interactive workflow.
        
        Mode 2 Specifics:
        - System automatically selects best agent
        - Interactive conversation
        - Smart routing based on query analysis
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            query: User's question
            request_id: Unique request ID
            enable_rag: Enable RAG retrieval
            enable_tools: Enable tool execution
            selected_rag_domains: RAG domain filters
            requested_tools: Tools to enable
            model: LLM model to use
            temperature: LLM temperature
            max_tokens: Max tokens for response
            user_id: User identifier
            session_id: Session identifier
            conversation_history: Previous conversation turns
            
        Returns:
            Mode 2 initialized state
        """
        return StateFactory.create_initial_state(
            tenant_id=tenant_id,
            request_id=request_id or str(uuid.uuid4()),
            mode=WorkflowMode.MODE_2_AUTOMATIC,
            query=query,
            user_id=user_id,
            session_id=session_id,
            selected_agents=[],  # Will be populated by agent selection
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            selected_rag_domains=selected_rag_domains or [],
            requested_tools=requested_tools or [],
            model=model,
            temperature=temperature or 0.1,
            max_tokens=max_tokens or 4000,
        )
    
    @staticmethod
    def create_mode3_state(
        tenant_id: str,
        query: str,
        agent_id: str,
        request_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = True,
        selected_rag_domains: Optional[List[str]] = None,
        requested_tools: Optional[List[str]] = None,
        model: str = "gpt-4",
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        max_iterations: int = 10,
        confidence_threshold: float = 0.95,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        hitl_enabled: bool = True,
        hitl_safety_level: str = "balanced",
    ) -> UnifiedWorkflowState:
        """
        Create initial state for Mode 3: Manual Autonomous workflow.
        
        Mode 3 Specifics:
        - User manually selects agent
        - Autonomous multi-step execution
        - HITL checkpoints for approval
        - ReAct reasoning pattern
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            query: User's mission/goal
            agent_id: ID of the manually selected agent
            request_id: Unique request ID
            enable_rag: Enable RAG retrieval
            enable_tools: Enable tool execution
            selected_rag_domains: RAG domain filters
            requested_tools: Tools to enable
            model: LLM model to use
            temperature: LLM temperature
            max_tokens: Max tokens per step
            max_iterations: Max ReAct iterations
            confidence_threshold: Threshold for autonomous decisions
            user_id: User identifier
            session_id: Session identifier
            hitl_enabled: Enable HITL checkpoints
            hitl_safety_level: HITL safety level (minimal/balanced/strict)
            
        Returns:
            Mode 3 initialized state
        """
        return StateFactory.create_initial_state(
            tenant_id=tenant_id,
            request_id=request_id or str(uuid.uuid4()),
            mode=WorkflowMode.MODE_3_AUTONOMOUS,
            query=query,
            user_id=user_id,
            session_id=session_id,
            selected_agents=[agent_id],
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            selected_rag_domains=selected_rag_domains or [],
            requested_tools=requested_tools or [],
            model=model,
            temperature=temperature or 0.1,
            max_tokens=max_tokens or 4000,
            max_iterations=max_iterations,
            confidence_threshold=confidence_threshold,
            hitl_enabled=hitl_enabled,
            hitl_safety_level=hitl_safety_level,
        )
    
    @staticmethod
    def create_mode4_state(
        tenant_id: str,
        query: str,
        request_id: Optional[str] = None,
        agent_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = True,
        selected_rag_domains: Optional[List[str]] = None,
        requested_tools: Optional[List[str]] = None,
        model: str = "gpt-4",
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        max_iterations: int = 10,
        confidence_threshold: float = 0.95,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> UnifiedWorkflowState:
        """
        Create initial state for Mode 4: Automatic Autonomous workflow.
        
        Mode 4 Specifics:
        - System automatically selects agent(s)
        - Autonomous multi-step execution
        - Full autopilot with self-correction
        - Background processing via Celery
        
        Args:
            tenant_id: Tenant UUID (REQUIRED)
            query: User's mission/goal
            request_id: Unique request ID
            agent_id: Optional pre-selected agent ID
            enable_rag: Enable RAG retrieval
            enable_tools: Enable tool execution
            selected_rag_domains: RAG domain filters
            requested_tools: Tools to enable
            model: LLM model to use
            temperature: LLM temperature
            max_tokens: Max tokens per step
            max_iterations: Max ReAct iterations
            confidence_threshold: Threshold for autonomous decisions
            user_id: User identifier
            session_id: Session identifier
            
        Returns:
            Mode 4 initialized state
        """
        selected_agents = [agent_id] if agent_id else []
        
        return StateFactory.create_initial_state(
            tenant_id=tenant_id,
            request_id=request_id or str(uuid.uuid4()),
            mode=WorkflowMode.MODE_4_STREAMING,
            query=query,
            user_id=user_id,
            session_id=session_id,
            selected_agents=selected_agents,
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            selected_rag_domains=selected_rag_domains or [],
            requested_tools=requested_tools or [],
            model=model,
            temperature=temperature or 0.1,
            max_tokens=max_tokens or 4000,
            max_iterations=max_iterations,
            confidence_threshold=confidence_threshold,
        )
    
    @staticmethod
    def validate(state: UnifiedWorkflowState) -> bool:
        """
        Validate a workflow state.
        
        Args:
            state: State to validate
            
        Returns:
            True if valid
            
        Raises:
            ValueError: If validation fails
        """
        return validate_state(state)
    
    @staticmethod
    def update_status(
        state: UnifiedWorkflowState,
        status: ExecutionStatus,
        current_node: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create state update for status change.
        
        Args:
            state: Current state (for context)
            status: New execution status
            current_node: Current node name
            
        Returns:
            Dict of state updates
        """
        update = {
            "status": status,
            "updated_at": datetime.utcnow(),
        }
        if current_node:
            update["current_node"] = current_node
        return update
    
    @staticmethod
    def add_error(
        state: UnifiedWorkflowState,
        error: str,
    ) -> Dict[str, Any]:
        """
        Create state update for adding an error.
        
        Args:
            state: Current state
            error: Error message to add
            
        Returns:
            Dict of state updates
        """
        return {
            "errors": [error],  # Will be accumulated via Annotated reducer
            "updated_at": datetime.utcnow(),
        }
