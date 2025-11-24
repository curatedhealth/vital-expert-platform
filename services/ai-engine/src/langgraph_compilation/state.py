"""
Agent State Models
Defines state structures for LangGraph workflows
"""

from typing import Dict, List, Any, Optional, TypedDict, Annotated
from uuid import UUID
from datetime import datetime
import operator


class AgentState(TypedDict, total=False):
    """
    Standard agent state for LangGraph workflows
    
    This state flows through the graph and can be modified by each node.
    Uses TypedDict for type safety and Annotated for LangGraph reducers.
    """
    # Input
    query: str
    user_id: UUID
    session_id: UUID
    agent_id: UUID
    tenant_id: Optional[UUID]
    
    # Context
    context: str  # RAG context
    context_chunks: List[Dict[str, Any]]
    evidence_chain: List[Dict[str, Any]]
    citations: Dict[str, Any]
    
    # Conversation history
    messages: Annotated[List[Dict[str, Any]], operator.add]  # Append-only
    
    # Agent reasoning
    current_step: str
    reasoning: List[str]  # Agent's thought process
    plan: Optional[Dict[str, Any]]  # For Tree-of-Thoughts
    
    # Tool usage
    tool_calls: List[Dict[str, Any]]
    tool_results: List[Dict[str, Any]]
    
    # Response
    response: Optional[str]
    confidence: Optional[float]
    requires_human_review: bool
    
    # Metadata
    metadata: Dict[str, Any]
    execution_path: List[str]  # Track which nodes were executed
    error: Optional[str]
    
    # Graph control
    next_node: Optional[str]  # For conditional routing
    loop_count: int  # Prevent infinite loops
    max_loops: int


class WorkflowState(TypedDict, total=False):
    """
    Extended state for complex workflows (panels, hierarchies)
    """
    # All fields from AgentState
    query: str
    user_id: UUID
    session_id: UUID
    agent_id: UUID
    
    # Panel-specific
    panel_agents: List[UUID]
    agent_responses: Dict[UUID, str]  # agent_id -> response
    agent_confidences: Dict[UUID, float]
    consensus_reached: bool
    final_decision: Optional[str]
    
    # Hierarchy-specific
    parent_agent_id: Optional[UUID]
    child_agent_ids: List[UUID]
    delegation_results: Dict[UUID, Any]
    
    # Workflow control
    current_stage: str
    stages_completed: List[str]
    can_proceed: bool


class PlanState(TypedDict, total=False):
    """
    State for Tree-of-Thoughts planning
    """
    original_query: str
    thought_tree: Dict[str, Any]  # Tree structure of thoughts
    current_thought_id: str
    evaluated_thoughts: List[Dict[str, Any]]
    best_path: Optional[List[str]]
    plan_steps: List[Dict[str, Any]]
    execution_results: List[Dict[str, Any]]


class CritiqueState(TypedDict, total=False):
    """
    State for Constitutional AI critique
    """
    original_response: str
    constitution: List[Dict[str, str]]  # Rules to check
    critique_results: List[Dict[str, Any]]
    violations_found: List[str]
    revised_response: Optional[str]
    safe_to_return: bool


# State initialization helpers
def init_agent_state(
    query: str,
    user_id: UUID,
    session_id: UUID,
    agent_id: UUID,
    tenant_id: Optional[UUID] = None
) -> AgentState:
    """Initialize standard agent state"""
    return AgentState(
        query=query,
        user_id=user_id,
        session_id=session_id,
        agent_id=agent_id,
        tenant_id=tenant_id,
        context="",
        context_chunks=[],
        evidence_chain=[],
        citations={},
        messages=[],
        current_step="init",
        reasoning=[],
        plan=None,
        tool_calls=[],
        tool_results=[],
        response=None,
        confidence=None,
        requires_human_review=False,
        metadata={},
        execution_path=[],
        error=None,
        next_node=None,
        loop_count=0,
        max_loops=10
    )


def init_workflow_state(
    query: str,
    user_id: UUID,
    session_id: UUID,
    agent_id: UUID,
    panel_agents: Optional[List[UUID]] = None
) -> WorkflowState:
    """Initialize workflow state for panels"""
    return WorkflowState(
        query=query,
        user_id=user_id,
        session_id=session_id,
        agent_id=agent_id,
        panel_agents=panel_agents or [],
        agent_responses={},
        agent_confidences={},
        consensus_reached=False,
        final_decision=None,
        parent_agent_id=None,
        child_agent_ids=[],
        delegation_results={},
        current_stage="init",
        stages_completed=[],
        can_proceed=True
    )

