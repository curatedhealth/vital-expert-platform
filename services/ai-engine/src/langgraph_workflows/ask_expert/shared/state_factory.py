# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.state_schemas, structlog]
"""
VITAL Path AI Services - Ask Expert State Factory

Unified state creation for Ask Expert Mode 1-4 workflows.
Ensures consistent state initialization with proper taxonomy.

Naming Convention:
- Class: AskExpertStateFactory
- Methods: create_mode{N}_state
- Logs: ask_expert_state_factory_{action}

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
    create_initial_state as _create_base_state,
    validate_state,
)

logger = structlog.get_logger()


class AskExpertStateFactory:
    """
    Factory for creating Ask Expert workflow states.
    
    Provides mode-specific state creation with consistent
    naming and validation across all 4 modes.
    
    Example:
        >>> state = AskExpertStateFactory.create_mode1_state(
        ...     tenant_id="uuid",
        ...     query="What are FDA requirements?",
        ...     agent_id="agent_123"
        ... )
    """
    
    @staticmethod
    def create_mode1_state(
        tenant_id: str,
        query: str,
        agent_id: str,
        request_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = False,
        model: str = "gpt-4",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        citation_style: str = "apa",
        **kwargs
    ) -> UnifiedWorkflowState:
        """
        Create state for Ask Expert Mode 1: Manual Interactive.
        
        Mode 1 Characteristics:
        - User MANUALLY selects an agent
        - Interactive multi-turn conversation
        - Single expert execution
        - Low latency target: 3-5s per turn
        """
        logger.info(
            "ask_expert_state_factory_mode1_create",
            tenant_id=tenant_id,
            agent_id=agent_id,
        )
        
        return _create_base_state(
            tenant_id=tenant_id,
            query=query,
            mode=WorkflowMode.MODE_1_MANUAL,
            request_id=request_id or str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            selected_agents=[agent_id],
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            model=model,
            citation_style=citation_style,
            **kwargs
        )
    
    @staticmethod
    def create_mode2_state(
        tenant_id: str,
        query: str,
        request_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = False,
        model: str = "gpt-4",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> UnifiedWorkflowState:
        """
        Create state for Ask Expert Mode 2: Automatic Interactive.
        
        Mode 2 Characteristics:
        - System AUTOMATICALLY selects best agent
        - Interactive conversation
        - Smart routing via Fusion Intelligence
        - Moderate latency: 5-10s first turn
        """
        logger.info(
            "ask_expert_state_factory_mode2_create",
            tenant_id=tenant_id,
        )
        
        return _create_base_state(
            tenant_id=tenant_id,
            query=query,
            mode=WorkflowMode.MODE_2_AUTOMATIC,
            request_id=request_id or str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            selected_agents=[],  # Will be auto-selected
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            model=model,
            **kwargs
        )
    
    @staticmethod
    def create_mode3_state(
        tenant_id: str,
        query: str,
        agent_id: str,
        request_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = True,
        model: str = "gpt-4",
        max_iterations: int = 10,
        confidence_threshold: float = 0.95,
        hitl_enabled: bool = True,
        hitl_safety_level: str = "balanced",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> UnifiedWorkflowState:
        """
        Create state for Ask Expert Mode 3: Manual Autonomous.
        
        Mode 3 Characteristics:
        - User MANUALLY selects agent
        - AUTONOMOUS multi-step execution
        - HITL checkpoints (5 types)
        - ReAct reasoning pattern
        - Moderate duration: 30s-5min
        """
        logger.info(
            "ask_expert_state_factory_mode3_create",
            tenant_id=tenant_id,
            agent_id=agent_id,
            hitl_enabled=hitl_enabled,
        )
        
        return _create_base_state(
            tenant_id=tenant_id,
            query=query,
            mode=WorkflowMode.MODE_3_AUTONOMOUS,
            request_id=request_id or str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            selected_agents=[agent_id],
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            model=model,
            max_iterations=max_iterations,
            confidence_threshold=confidence_threshold,
            hitl_enabled=hitl_enabled,
            hitl_safety_level=hitl_safety_level,
            **kwargs
        )
    
    @staticmethod
    def create_mode4_state(
        tenant_id: str,
        query: str,
        request_id: Optional[str] = None,
        agent_id: Optional[str] = None,
        enable_rag: bool = True,
        enable_tools: bool = True,
        model: str = "gpt-4",
        max_iterations: int = 10,
        confidence_threshold: float = 0.95,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        **kwargs
    ) -> UnifiedWorkflowState:
        """
        Create state for Ask Expert Mode 4: Automatic Autonomous.
        
        Mode 4 Characteristics:
        - System AUTOMATICALLY selects agent(s)
        - AUTONOMOUS multi-step execution
        - Full autopilot with self-correction
        - Background processing (Celery)
        - Cost gates and circuit breakers
        - Duration: 1-30min
        """
        logger.info(
            "ask_expert_state_factory_mode4_create",
            tenant_id=tenant_id,
            pre_selected_agent=agent_id,
        )
        
        selected_agents = [agent_id] if agent_id else []
        
        return _create_base_state(
            tenant_id=tenant_id,
            query=query,
            mode=WorkflowMode.MODE_4_STREAMING,
            request_id=request_id or str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            selected_agents=selected_agents,
            enable_rag=enable_rag,
            enable_tools=enable_tools,
            model=model,
            max_iterations=max_iterations,
            confidence_threshold=confidence_threshold,
            **kwargs
        )
    
    @staticmethod
    def validate(state: UnifiedWorkflowState) -> bool:
        """Validate Ask Expert state."""
        return validate_state(state)
