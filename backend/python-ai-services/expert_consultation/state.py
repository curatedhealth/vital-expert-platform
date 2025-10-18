from typing import Annotated, TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
from datetime import datetime

class ReasoningStep(TypedDict):
    """Individual reasoning step with full transparency"""
    id: str
    timestamp: datetime
    iteration: int
    phase: str  # 'think' | 'plan' | 'act' | 'observe' | 'reflect' | 'synthesize'
    content: Dict[str, Any]
    metadata: Dict[str, Any]

class AutonomousAgentState(TypedDict):
    """Complete state for autonomous agent execution"""
    # Identity & Context
    session_id: str
    user_id: str
    expert_type: str
    original_query: str
    business_context: Dict[str, Any]
    
    # Conversation History
    messages: Annotated[List[BaseMessage], "conversation history"]
    
    # Reasoning State
    current_phase: str
    current_iteration: int
    max_iterations: int
    reasoning_steps: List[ReasoningStep]
    
    # Goals & Progress
    original_goal: Dict[str, Any]
    decomposed_goals: List[Dict[str, Any]]
    completed_goals: List[str]
    current_goal: Optional[str]
    goal_progress: float  # 0-1
    
    # Working Memory
    working_memory: Dict[str, Any]
    strategic_insights: List[Dict[str, Any]]
    evidence_chain: List[Dict[str, Any]]
    
    # Tool State
    available_tools: List[str]
    tool_results: List[Dict[str, Any]]
    tool_calls: List[Dict[str, Any]]
    
    # Cost & Resource Tracking
    cost_accumulated: float
    cost_budget: float
    tokens_used: int
    
    # Control Flags
    should_continue: bool
    pause_requested: bool
    user_intervention_needed: bool
    intervention_type: Optional[str]
    
    # Output
    final_synthesis: Optional[Dict[str, Any]]
    execution_complete: bool

def add_reasoning_step(state: AutonomousAgentState, step: ReasoningStep) -> AutonomousAgentState:
    """Add reasoning step and update state"""
    state["reasoning_steps"].append(step)
    return state

def update_working_memory(state: AutonomousAgentState, key: str, value: Any) -> AutonomousAgentState:
    """Update working memory with new information"""
    state["working_memory"][key] = value
    return state

def add_evidence(state: AutonomousAgentState, evidence: Dict[str, Any]) -> AutonomousAgentState:
    """Add evidence to the evidence chain"""
    state["evidence_chain"].append(evidence)
    return state

def update_goal_progress(state: AutonomousAgentState, progress: float) -> AutonomousAgentState:
    """Update goal progress (0-1)"""
    state["goal_progress"] = min(1.0, max(0.0, progress))
    return state

def mark_goal_completed(state: AutonomousAgentState, goal_id: str) -> AutonomousAgentState:
    """Mark a goal as completed"""
    if goal_id not in state["completed_goals"]:
        state["completed_goals"].append(goal_id)
    return state

def add_strategic_insight(state: AutonomousAgentState, insight: Dict[str, Any]) -> AutonomousAgentState:
    """Add strategic insight to working memory"""
    state["strategic_insights"].append(insight)
    return state

def should_continue_execution(state: AutonomousAgentState) -> bool:
    """Determine if execution should continue"""
    return (
        state["should_continue"] and 
        not state["pause_requested"] and 
        not state["execution_complete"] and
        state["current_iteration"] < state["max_iterations"] and
        state["cost_accumulated"] < state["cost_budget"]
    )

def requires_user_intervention(state: AutonomousAgentState) -> bool:
    """Check if user intervention is needed"""
    return (
        state["user_intervention_needed"] or
        state["cost_accumulated"] >= state["cost_budget"] * 0.9 or
        state["current_iteration"] >= state["max_iterations"]
    )
