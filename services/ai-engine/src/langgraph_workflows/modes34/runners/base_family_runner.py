# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-14
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, pydantic, asyncio]
"""
Base Family Runner - Abstract StateGraph Factory

This module defines the abstract base class for all family-specific runners.
Family runners specialize the generic master graph for domain-specific
reasoning patterns (ToT→CoT, RCA→Bayesian, MCDA scoring, etc.).

Architecture Pattern:
    BaseFamilyRunner[StateT] (Generic)
        ├── build_graph() -> CompiledStateGraph  # Factory method
        ├── execute() -> FamilyResult            # Full execution
        ├── stream() -> AsyncIterator[SSEEvent]  # Streaming execution
        └── _create_nodes() -> Dict[str, Callable]  # Template method

Implementation Guidelines:
    1. Each family runner MUST define its own state class extending BaseFamilyState
    2. Each family runner MUST implement _create_nodes() with specialized logic
    3. Each family runner MUST implement _define_edges() for routing
    4. Family runners inherit common infrastructure (checkpoints, HITL, SSE)
"""

from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import (
    Any,
    AsyncIterator,
    Callable,
    Dict,
    Generic,
    List,
    Optional,
    TypeVar,
    Union,
)
from uuid import uuid4

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph
from langgraph.types import Interrupt
from pydantic import BaseModel, Field

# Resilience imports
from langgraph_workflows.modes34.resilience import (
    graceful_degradation,
    handle_node_errors,
    invoke_llm_with_timeout,
)

logger = logging.getLogger(__name__)


# =============================================================================
# Enums
# =============================================================================

class FamilyType(str, Enum):
    """8 Logic Families from v6.0 Architecture"""
    DEEP_RESEARCH = "DEEP_RESEARCH"      # ToT → CoT → Reflection
    MONITORING = "MONITORING"            # Polling → Delta → Alert
    EVALUATION = "EVALUATION"            # MCDA scoring
    STRATEGY = "STRATEGY"                # Scenario → SWOT → Roadmap
    INVESTIGATION = "INVESTIGATION"      # RCA → Bayesian
    PROBLEM_SOLVING = "PROBLEM_SOLVING"  # Hypothesis → Test → Iterate
    COMMUNICATION = "COMMUNICATION"      # Audience → Format → Review
    GENERIC = "GENERIC"                  # Standard execution


class ExecutionPhase(str, Enum):
    """Standard execution phases for all families"""
    INITIALIZE = "initialize"
    PLAN = "plan"
    EXECUTE = "execute"
    SYNTHESIZE = "synthesize"
    VERIFY = "verify"
    COMPLETE = "complete"


class SSEEventType(str, Enum):
    """25+ SSE event types from v6.0 Architecture"""
    # Lifecycle events
    MISSION_STARTED = "mission_started"
    MISSION_COMPLETED = "mission_completed"
    MISSION_FAILED = "mission_failed"

    # Phase events
    PHASE_START = "phase_start"
    PHASE_COMPLETE = "phase_complete"

    # Step events
    STEP_START = "step_start"
    STEP_COMPLETE = "step_complete"
    STEP_FAILED = "step_failed"

    # Token streaming
    TOKEN = "token"
    REASONING_TOKEN = "reasoning_token"

    # Agent events
    AGENT_SELECTED = "agent_selected"
    AGENT_DELEGATED = "agent_delegated"

    # Tool events
    TOOL_INVOKED = "tool_invoked"
    TOOL_RESULT = "tool_result"

    # Quality events
    CONFIDENCE_UPDATE = "confidence_update"
    QUALITY_CHECK = "quality_check"
    CITATION_VERIFIED = "citation_verified"

    # HITL events
    CHECKPOINT = "checkpoint"
    HITL_REQUIRED = "hitl_required"
    USER_INPUT_RECEIVED = "user_input_received"

    # Progress events
    PROGRESS_UPDATE = "progress_update"
    ITERATION_COMPLETE = "iteration_complete"


# =============================================================================
# Base State Classes
# =============================================================================

class BaseFamilyState(BaseModel):
    """
    Base state class for all family runners.

    All family-specific states MUST extend this class and add
    domain-specific fields while preserving these core fields.
    """
    # Identity
    mission_id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str = Field(default="")
    tenant_id: str = Field(default="")

    # Query/Goal
    query: str = Field(default="")
    goal: str = Field(default="")
    context: Dict[str, Any] = Field(default_factory=dict)

    # Execution state
    phase: ExecutionPhase = Field(default=ExecutionPhase.INITIALIZE)
    current_step: int = Field(default=0)
    total_steps: int = Field(default=0)

    # Plan
    plan: List[Dict[str, Any]] = Field(default_factory=list)

    # Results
    results: List[Dict[str, Any]] = Field(default_factory=list)
    final_output: Optional[str] = Field(default=None)

    # Quality metrics
    confidence_score: float = Field(default=0.0)
    quality_score: float = Field(default=0.0)
    citations: List[Dict[str, Any]] = Field(default_factory=list)

    # HITL state
    requires_hitl: bool = Field(default=False)
    hitl_reason: Optional[str] = Field(default=None)
    user_input: Optional[str] = Field(default=None)

    # Error handling
    error: Optional[str] = Field(default=None)
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)

    # Timing
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)

    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        arbitrary_types_allowed = True


class FamilyResult(BaseModel):
    """Result returned from family runner execution"""
    mission_id: str
    success: bool
    output: Optional[str] = None
    confidence_score: float = 0.0
    quality_score: float = 0.0
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    execution_time_seconds: float = 0.0
    steps_completed: int = 0
    total_steps: int = 0
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SSEEvent(BaseModel):
    """Server-Sent Event structure for streaming"""
    event_type: SSEEventType
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    mission_id: Optional[str] = None
    session_id: Optional[str] = None


# =============================================================================
# Type Variables
# =============================================================================

StateT = TypeVar("StateT", bound=BaseFamilyState)


# =============================================================================
# Abstract Base Class
# =============================================================================

class BaseFamilyRunner(ABC, Generic[StateT]):
    """
    Abstract base class for family-specific LangGraph runners.

    Each family runner specializes the execution pattern for its domain:
    - DEEP_RESEARCH: Tree-of-Thought → Chain-of-Thought → Reflection
    - MONITORING: Polling → Delta Detection → Alert Generation
    - EVALUATION: Multi-Criteria Decision Analysis scoring
    - STRATEGY: Scenario Planning → SWOT → Roadmap
    - INVESTIGATION: Root Cause Analysis → Bayesian reasoning
    - PROBLEM_SOLVING: Hypothesis → Test → Iterate
    - COMMUNICATION: Audience → Format → Review
    - GENERIC: Standard step-by-step execution

    Usage:
        class DeepResearchRunner(BaseFamilyRunner[DeepResearchState]):
            family = FamilyType.DEEP_RESEARCH

            def _create_nodes(self) -> Dict[str, Callable]:
                return {
                    "tree_of_thought": self._tree_of_thought_node,
                    "chain_of_thought": self._chain_of_thought_node,
                    "reflection": self._reflection_node,
                }
    """

    # Class attributes to be overridden
    family: FamilyType = FamilyType.GENERIC
    state_class: type[StateT] = BaseFamilyState  # type: ignore

    def __init__(
        self,
        checkpointer: Optional[MemorySaver] = None,
        hitl_enabled: bool = True,
        max_iterations: int = 10,
        confidence_threshold: float = 0.8,
    ):
        """
        Initialize the family runner.

        Args:
            checkpointer: LangGraph checkpointer for state persistence
            hitl_enabled: Enable Human-in-the-Loop checkpoints
            max_iterations: Maximum iterations before forcing completion
            confidence_threshold: Minimum confidence for auto-approval
        """
        self.checkpointer = checkpointer or MemorySaver()
        self.hitl_enabled = hitl_enabled
        self.max_iterations = max_iterations
        self.confidence_threshold = confidence_threshold
        self._graph: Optional[CompiledStateGraph] = None

        logger.info(
            f"Initialized {self.__class__.__name__} "
            f"(family={self.family.value}, hitl={hitl_enabled})"
        )

    # =========================================================================
    # Abstract Methods (MUST implement)
    # =========================================================================

    @abstractmethod
    def _create_nodes(self) -> Dict[str, Callable[[StateT], StateT]]:
        """
        Create family-specific graph nodes.

        Returns:
            Dictionary mapping node names to node functions.
            Each node function takes state and returns updated state.

        Example:
            return {
                "initialize": self._initialize_node,
                "plan": self._plan_node,
                "execute": self._execute_node,
                "synthesize": self._synthesize_node,
            }
        """
        raise NotImplementedError

    @abstractmethod
    def _define_edges(
        self,
        graph: StateGraph
    ) -> StateGraph:
        """
        Define edges and conditional routing for the graph.

        Args:
            graph: StateGraph with nodes already added

        Returns:
            StateGraph with edges defined

        Example:
            graph.add_edge(START, "initialize")
            graph.add_edge("initialize", "plan")
            graph.add_conditional_edges(
                "plan",
                self._route_after_plan,
                {"execute": "execute", "complete": END}
            )
            return graph
        """
        raise NotImplementedError

    @abstractmethod
    def _get_interrupt_nodes(self) -> List[str]:
        """
        Return list of node names that should trigger HITL checkpoints.

        Returns:
            List of node names for interrupt_before in graph.compile()

        Example:
            return ["execute", "synthesize"]  # Checkpoint before these nodes
        """
        raise NotImplementedError

    # =========================================================================
    # Template Methods (CAN override)
    # =========================================================================

    def _create_initial_state(
        self,
        query: str,
        session_id: str = "",
        tenant_id: str = "",
        context: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> StateT:
        """
        Create the initial state for execution.

        Override this to customize initial state creation.
        """
        return self.state_class(
            query=query,
            goal=query,  # Default goal is the query
            session_id=session_id,
            tenant_id=tenant_id,
            context=context or {},
            started_at=datetime.utcnow(),
            metadata=kwargs,
        )

    def _should_checkpoint(self, state: StateT) -> bool:
        """
        Determine if current state requires HITL checkpoint.

        Override this to customize checkpoint logic.
        """
        if not self.hitl_enabled:
            return False

        # Checkpoint if confidence is below threshold
        if state.confidence_score < self.confidence_threshold:
            return True

        # Checkpoint if explicitly required
        if state.requires_hitl:
            return True

        return False

    def _format_result(self, state: StateT) -> FamilyResult:
        """
        Format final state into FamilyResult.

        Override this to customize result formatting.
        """
        execution_time = 0.0
        if state.started_at and state.completed_at:
            execution_time = (state.completed_at - state.started_at).total_seconds()

        return FamilyResult(
            mission_id=state.mission_id,
            success=state.error is None,
            output=state.final_output,
            confidence_score=state.confidence_score,
            quality_score=state.quality_score,
            citations=state.citations,
            execution_time_seconds=execution_time,
            steps_completed=state.current_step,
            total_steps=state.total_steps,
            error=state.error,
            metadata=state.metadata,
        )

    # =========================================================================
    # Core Public Methods
    # =========================================================================

    def build_graph(self) -> CompiledStateGraph:
        """
        Build and compile the LangGraph StateGraph.

        This is the factory method that creates the family-specific graph.

        Returns:
            Compiled StateGraph ready for execution
        """
        if self._graph is not None:
            return self._graph

        logger.info(f"Building graph for {self.family.value} family")

        # Create StateGraph with typed state
        graph = StateGraph(self.state_class)

        # Add family-specific nodes
        nodes = self._create_nodes()
        for node_name, node_func in nodes.items():
            # Wrap every node with standardized error handling
            safe_node = handle_node_errors(node_name, recoverable=True)(node_func)
            graph.add_node(node_name, safe_node)
            logger.debug(f"Added node: {node_name}")

        # Add family-specific edges
        graph = self._define_edges(graph)

        # Get HITL interrupt nodes
        interrupt_nodes = self._get_interrupt_nodes() if self.hitl_enabled else []

        # Compile with checkpointer and interrupts
        self._graph = graph.compile(
            checkpointer=self.checkpointer,
            interrupt_before=interrupt_nodes,
        )

        logger.info(
            f"Graph compiled for {self.family.value}: "
            f"{len(nodes)} nodes, {len(interrupt_nodes)} interrupt points"
        )

        return self._graph

    async def execute(
        self,
        query: str,
        session_id: str = "",
        tenant_id: str = "",
        context: Optional[Dict[str, Any]] = None,
        thread_id: Optional[str] = None,
        **kwargs: Any,
    ) -> FamilyResult:
        """
        Execute the family runner to completion.

        Args:
            query: The research query or goal
            session_id: Session identifier for conversation context
            tenant_id: Tenant identifier for multi-tenancy
            context: Additional context dictionary
            thread_id: Thread ID for checkpoint persistence
            **kwargs: Additional parameters passed to initial state

        Returns:
            FamilyResult with output, confidence, citations, etc.
        """
        graph = self.build_graph()
        initial_state = self._create_initial_state(
            query=query,
            session_id=session_id,
            tenant_id=tenant_id,
            context=context,
            **kwargs,
        )

        config = {"configurable": {"thread_id": thread_id or initial_state.mission_id}}

        try:
            logger.info(
                f"Starting {self.family.value} execution: "
                f"mission_id={initial_state.mission_id}"
            )

            # Execute graph
            final_state = await graph.ainvoke(initial_state.model_dump(), config)

            # Convert dict back to state object
            if isinstance(final_state, dict):
                final_state = self.state_class(**final_state)

            # Mark completion
            final_state.completed_at = datetime.utcnow()

            logger.info(
                f"Completed {self.family.value} execution: "
                f"confidence={final_state.confidence_score:.2f}"
            )

            return self._format_result(final_state)

        except Exception as e:
            logger.error(f"Execution failed: {e}", exc_info=True)
            initial_state.error = str(e)
            initial_state.completed_at = datetime.utcnow()
            return self._format_result(initial_state)

    async def stream(
        self,
        query: str,
        session_id: str = "",
        tenant_id: str = "",
        context: Optional[Dict[str, Any]] = None,
        thread_id: Optional[str] = None,
        **kwargs: Any,
    ) -> AsyncIterator[SSEEvent]:
        """
        Stream execution events as SSE.

        Args:
            query: The research query or goal
            session_id: Session identifier
            tenant_id: Tenant identifier
            context: Additional context
            thread_id: Thread ID for checkpoints
            **kwargs: Additional parameters

        Yields:
            SSEEvent objects for each execution event
        """
        graph = self.build_graph()
        initial_state = self._create_initial_state(
            query=query,
            session_id=session_id,
            tenant_id=tenant_id,
            context=context,
            **kwargs,
        )

        config = {"configurable": {"thread_id": thread_id or initial_state.mission_id}}

        # Emit mission started
        yield SSEEvent(
            event_type=SSEEventType.MISSION_STARTED,
            data={
                "family": self.family.value,
                "query": query,
            },
            mission_id=initial_state.mission_id,
            session_id=session_id,
        )

        try:
            # Stream graph execution
            async for event in graph.astream_events(
                initial_state.model_dump(),
                config,
                version="v2",
            ):
                # Convert LangGraph events to SSE events
                sse_event = self._convert_to_sse_event(
                    event,
                    initial_state.mission_id,
                    session_id,
                )
                if sse_event:
                    yield sse_event

            # Emit mission completed
            yield SSEEvent(
                event_type=SSEEventType.MISSION_COMPLETED,
                data={"status": "success"},
                mission_id=initial_state.mission_id,
                session_id=session_id,
            )

        except Exception as e:
            logger.error(f"Stream execution failed: {e}", exc_info=True)
            yield SSEEvent(
                event_type=SSEEventType.MISSION_FAILED,
                data={"error": str(e)},
                mission_id=initial_state.mission_id,
                session_id=session_id,
            )

    def _convert_to_sse_event(
        self,
        langgraph_event: Dict[str, Any],
        mission_id: str,
        session_id: str,
    ) -> Optional[SSEEvent]:
        """Convert LangGraph event to SSE event."""
        event_type = langgraph_event.get("event")

        # Map LangGraph events to SSE events
        if event_type == "on_chain_start":
            node_name = langgraph_event.get("name", "")
            return SSEEvent(
                event_type=SSEEventType.STEP_START,
                data={"node": node_name},
                mission_id=mission_id,
                session_id=session_id,
            )

        elif event_type == "on_chain_end":
            node_name = langgraph_event.get("name", "")
            return SSEEvent(
                event_type=SSEEventType.STEP_COMPLETE,
                data={"node": node_name},
                mission_id=mission_id,
                session_id=session_id,
            )

        elif event_type == "on_chat_model_stream":
            # Token streaming
            content = langgraph_event.get("data", {}).get("chunk", {})
            if hasattr(content, "content"):
                return SSEEvent(
                    event_type=SSEEventType.TOKEN,
                    data={"token": content.content},
                    mission_id=mission_id,
                    session_id=session_id,
                )

        return None

    # =========================================================================
    # Utility Methods
    # =========================================================================

    def emit_progress(
        self,
        state: StateT,
        message: str,
    ) -> SSEEvent:
        """Create a progress update event."""
        return SSEEvent(
            event_type=SSEEventType.PROGRESS_UPDATE,
            data={
                "message": message,
                "phase": state.phase.value,
                "step": state.current_step,
                "total_steps": state.total_steps,
                "confidence": state.confidence_score,
            },
            mission_id=state.mission_id,
            session_id=state.session_id,
        )

    def trigger_hitl(
        self,
        state: StateT,
        reason: str,
    ) -> StateT:
        """Mark state as requiring HITL intervention."""
        state.requires_hitl = True
        state.hitl_reason = reason
        logger.info(f"HITL triggered: {reason}")
        return state

    def _emit_sse_event(
        self,
        event_type: SSEEventType,
        data: Dict[str, Any],
        mission_id: Optional[str] = None,
        session_id: str = "",
    ) -> SSEEvent:
        """Helper to emit a standardized SSE event."""
        return SSEEvent(
            event_type=event_type,
            data=data,
            mission_id=mission_id,
            session_id=session_id,
        )

    def _create_hitl_checkpoint_node(
        self,
        checkpoint_id: str,
        checkpoint_type: str = "approval",
    ) -> Callable[[StateT], StateT]:
        """
        Create a reusable HITL checkpoint node with error handling and interrupt.
        """

        @handle_node_errors(checkpoint_id, recoverable=True)
        async def checkpoint_node(state: StateT) -> StateT:
            # Notify UI that a checkpoint is required
            self._emit_sse_event(
                SSEEventType.HITL_REQUIRED,
                {
                    "checkpoint_id": checkpoint_id,
                    "checkpoint_type": checkpoint_type,
                },
                mission_id=state.mission_id,
                session_id=state.session_id,
            )
            # Pause execution for HITL
            raise Interrupt(checkpoint_id)

        return checkpoint_node


# =============================================================================
# Family Runner Registry
# =============================================================================

# This will be populated by concrete runner implementations
FAMILY_RUNNERS: Dict[FamilyType, type[BaseFamilyRunner]] = {}


def register_family_runner(family: FamilyType):
    """Decorator to register a family runner class."""
    def decorator(cls: type[BaseFamilyRunner]):
        FAMILY_RUNNERS[family] = cls
        logger.info(f"Registered runner for {family.value}: {cls.__name__}")
        return cls
    return decorator


def get_family_runner(family: FamilyType) -> Optional[type[BaseFamilyRunner]]:
    """Get the runner class for a family type."""
    return FAMILY_RUNNERS.get(family)


def get_runner_for_template(template_family: str) -> Optional[type[BaseFamilyRunner]]:
    """Get the runner class for a template's family."""
    try:
        family = FamilyType(template_family)
        return get_family_runner(family)
    except ValueError:
        logger.warning(f"Unknown family type: {template_family}")
        return FAMILY_RUNNERS.get(FamilyType.GENERIC)
