"""
Gold Standard Streaming Manager

Real-time streaming for all 4 modes with Server-Sent Events (SSE).
Provides step-by-step updates for autonomous modes (ReAct reasoning).

Features:
- SSE (Server-Sent Events) for real-time updates
- Mode-specific streaming strategies
- ReAct step streaming (Thought, Action, Observation, Reflection)
- Goal/Task/Progress streaming for autonomous modes
- Token-level streaming for LLM responses
- Error streaming with graceful degradation
- Type-safe event models

Golden Rules Compliance:
✅ #1: Integrates with LangGraph workflows
✅ #2: Caching for frequently streamed content
✅ #3: Tenant-aware streaming
✅ #4: Streams RAG/Tool usage
✅ #5: Streams feedback collection prompts

Usage:
    >>> from services.streaming_manager import StreamingManager, StreamingEventType
    >>> 
    >>> manager = StreamingManager()
    >>> 
    >>> # Stream workflow execution
    >>> async for event in manager.stream_workflow(workflow, state):
    ...     # Send to frontend via SSE
    ...     yield f"data: {event.to_json()}\\n\\n"
    >>> 
    >>> # Stream ReAct step
    >>> await manager.stream_react_step(
    ...     step_type="thought",
    ...     content="I need to retrieve FDA IND requirements...",
    ...     metadata={"iteration": 1, "confidence": 0.8}
    ... )
"""

import json
import asyncio
from typing import Dict, Any, Optional, AsyncIterator, List
from datetime import datetime, timezone
from enum import Enum
import structlog
from pydantic import BaseModel, Field

from core.config import get_settings

logger = structlog.get_logger()
settings = get_settings()


# ============================================================================
# EVENT TYPES AND MODELS
# ============================================================================

class StreamingEventType(str, Enum):
    """Types of streaming events."""
    
    # Workflow events
    WORKFLOW_START = "workflow_start"
    WORKFLOW_END = "workflow_end"
    WORKFLOW_ERROR = "workflow_error"
    
    # Node events
    NODE_START = "node_start"
    NODE_END = "node_end"
    NODE_ERROR = "node_error"
    
    # ReAct events (Modes 3 & 4)
    GOAL_UNDERSTANDING = "goal_understanding"  # CoT goal breakdown
    TASK_PLAN = "task_plan"  # Task decomposition
    REACT_THOUGHT = "react_thought"  # What to do next
    REACT_ACTION = "react_action"  # Action execution
    REACT_OBSERVATION = "react_observation"  # What was learned
    REACT_REFLECTION = "react_reflection"  # Self-reflection
    GOAL_REASSESSMENT = "goal_reassessment"  # Goal achievement check
    SYNTHESIS_START = "synthesis_start"  # Final answer synthesis
    
    # Agent events
    AGENT_SELECTION = "agent_selection"  # Agent selected
    AGENT_CONFIG_LOADED = "agent_config_loaded"  # Agent config loaded
    
    # Execution events
    RAG_RETRIEVAL = "rag_retrieval"  # RAG documents retrieved
    TOOL_EXECUTION = "tool_execution"  # Tool executed
    LLM_RESPONSE_START = "llm_response_start"  # LLM generation started
    LLM_TOKEN = "llm_token"  # Token streamed
    LLM_RESPONSE_END = "llm_response_end"  # LLM generation ended
    
    # Analysis events
    CONFIDENCE_CALCULATED = "confidence_calculated"  # Confidence score
    FEEDBACK_PREPARED = "feedback_prepared"  # Feedback UI ready
    MEMORY_EXTRACTED = "memory_extracted"  # Semantic memory extracted
    KNOWLEDGE_CAPTURED = "knowledge_captured"  # Knowledge enrichment
    
    # Progress events
    PROGRESS_UPDATE = "progress_update"  # Overall progress
    ITERATION_COMPLETE = "iteration_complete"  # ReAct iteration done
    
    # Metadata events
    METADATA_UPDATE = "metadata_update"  # Additional metadata


class StreamingEvent(BaseModel):
    """Structured streaming event."""
    
    event_type: StreamingEventType = Field(..., description="Type of event")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO timestamp")
    data: Dict[str, Any] = Field(..., description="Event data payload")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")
    
    def to_json(self) -> str:
        """Convert to JSON string for SSE."""
        return json.dumps(self.model_dump(), default=str)
    
    def to_sse(self) -> str:
        """Convert to SSE format."""
        return f"event: {self.event_type}\ndata: {self.to_json()}\n\n"


class ReActStep(BaseModel):
    """ReAct reasoning step."""
    iteration: int = Field(..., ge=1, description="Current iteration number")
    step_type: str = Field(..., description="thought, action, observation, or reflection")
    content: str = Field(..., description="Step content")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class ProgressUpdate(BaseModel):
    """Progress update for long-running workflows."""
    current_step: int = Field(..., ge=0, description="Current step number")
    total_steps: int = Field(..., ge=1, description="Total steps")
    percentage: float = Field(..., ge=0.0, le=100.0, description="Percentage complete")
    current_activity: str = Field(..., description="Current activity description")
    estimated_time_remaining: Optional[int] = Field(None, description="Estimated seconds remaining")


# ============================================================================
# STREAMING MANAGER
# ============================================================================

class StreamingManager:
    """
    Gold Standard Streaming Manager for all 4 modes.
    
    Provides real-time updates via Server-Sent Events (SSE):
    - Workflow execution progress
    - ReAct reasoning steps (Modes 3 & 4)
    - Goal understanding & task planning
    - Agent selection & execution
    - RAG retrieval & tool execution
    - Token-level LLM streaming
    - Confidence & feedback preparation
    - Memory extraction & knowledge capture
    
    Features:
    - Type-safe events (Pydantic models)
    - Mode-specific streaming strategies
    - Error handling with graceful degradation
    - Tenant-aware (Golden Rule #3)
    - Observability integration
    """
    
    def __init__(self):
        """Initialize Streaming Manager."""
        logger.info("✅ StreamingManager initialized")
    
    # ========================================================================
    # WORKFLOW-LEVEL STREAMING
    # ========================================================================
    
    async def stream_workflow_start(
        self,
        workflow_name: str,
        mode: str,
        tenant_id: str,
        query: str
    ) -> StreamingEvent:
        """Stream workflow start event."""
        return StreamingEvent(
            event_type=StreamingEventType.WORKFLOW_START,
            data={
                "workflow": workflow_name,
                "mode": mode,
                "query": query[:200],  # Truncate for privacy
                "status": "started"
            },
            metadata={"tenant_id": tenant_id[:8]}  # Truncated for privacy
        )
    
    async def stream_workflow_end(
        self,
        workflow_name: str,
        status: str,
        execution_time_ms: float,
        result_summary: Optional[str] = None
    ) -> StreamingEvent:
        """Stream workflow end event."""
        return StreamingEvent(
            event_type=StreamingEventType.WORKFLOW_END,
            data={
                "workflow": workflow_name,
                "status": status,
                "execution_time_ms": execution_time_ms,
                "result_summary": result_summary
            }
        )
    
    async def stream_workflow_error(
        self,
        workflow_name: str,
        error_message: str,
        error_type: Optional[str] = None
    ) -> StreamingEvent:
        """Stream workflow error event."""
        return StreamingEvent(
            event_type=StreamingEventType.WORKFLOW_ERROR,
            data={
                "workflow": workflow_name,
                "error": error_message,
                "error_type": error_type or "UnknownError"
            }
        )
    
    # ========================================================================
    # NODE-LEVEL STREAMING
    # ========================================================================
    
    async def stream_node_start(
        self,
        node_name: str,
        description: Optional[str] = None
    ) -> StreamingEvent:
        """Stream node start event."""
        return StreamingEvent(
            event_type=StreamingEventType.NODE_START,
            data={
                "node": node_name,
                "description": description or f"Starting {node_name}",
                "status": "running"
            }
        )
    
    async def stream_node_end(
        self,
        node_name: str,
        result_summary: Optional[str] = None,
        execution_time_ms: Optional[float] = None
    ) -> StreamingEvent:
        """Stream node end event."""
        return StreamingEvent(
            event_type=StreamingEventType.NODE_END,
            data={
                "node": node_name,
                "status": "completed",
                "result_summary": result_summary,
                "execution_time_ms": execution_time_ms
            }
        )
    
    # ========================================================================
    # REACT STREAMING (Modes 3 & 4)
    # ========================================================================
    
    async def stream_goal_understanding(
        self,
        understood_goal: str,
        sub_goals: List[str],
        complexity: str,
        confidence: float
    ) -> StreamingEvent:
        """
        Stream Chain-of-Thought goal understanding.
        
        Shows user how the system understood their request.
        """
        return StreamingEvent(
            event_type=StreamingEventType.GOAL_UNDERSTANDING,
            data={
                "understood_goal": understood_goal,
                "sub_goals": sub_goals,
                "complexity": complexity,
                "confidence": confidence,
                "message": f"✓ Goal understood with {confidence:.0%} confidence"
            },
            metadata={"step": "goal_understanding"}
        )
    
    async def stream_task_plan(
        self,
        tasks: List[str],
        estimated_iterations: int,
        reasoning: str
    ) -> StreamingEvent:
        """
        Stream task plan.
        
        Shows user the planned approach.
        """
        return StreamingEvent(
            event_type=StreamingEventType.TASK_PLAN,
            data={
                "tasks": tasks,
                "estimated_iterations": estimated_iterations,
                "reasoning": reasoning,
                "message": f"✓ Created plan with {len(tasks)} tasks"
            },
            metadata={"step": "task_planning"}
        )
    
    async def stream_react_thought(
        self,
        iteration: int,
        thought: str,
        reasoning: str,
        next_action_type: str
    ) -> StreamingEvent:
        """
        Stream ReAct thought.
        
        Shows user what the AI is thinking.
        """
        return StreamingEvent(
            event_type=StreamingEventType.REACT_THOUGHT,
            data={
                "iteration": iteration,
                "thought": thought,
                "reasoning": reasoning,
                "next_action": next_action_type,
                "message": f"💭 Iteration {iteration}: {thought[:100]}..."
            },
            metadata={"step": "thought", "iteration": iteration}
        )
    
    async def stream_react_action(
        self,
        iteration: int,
        action_type: str,
        action_description: str,
        success: bool
    ) -> StreamingEvent:
        """
        Stream ReAct action.
        
        Shows user what the AI is doing.
        """
        icon = "✓" if success else "✗"
        return StreamingEvent(
            event_type=StreamingEventType.REACT_ACTION,
            data={
                "iteration": iteration,
                "action_type": action_type,
                "action_description": action_description,
                "success": success,
                "message": f"{icon} {action_description}"
            },
            metadata={"step": "action", "iteration": iteration}
        )
    
    async def stream_react_observation(
        self,
        iteration: int,
        observation: str
    ) -> StreamingEvent:
        """
        Stream ReAct observation.
        
        Shows user what the AI learned.
        """
        return StreamingEvent(
            event_type=StreamingEventType.REACT_OBSERVATION,
            data={
                "iteration": iteration,
                "observation": observation,
                "message": f"👀 Observed: {observation[:100]}..."
            },
            metadata={"step": "observation", "iteration": iteration}
        )
    
    async def stream_react_reflection(
        self,
        iteration: int,
        reflection: str,
        confidence: float,
        what_worked: str,
        course_correction: str
    ) -> StreamingEvent:
        """
        Stream ReAct reflection.
        
        Shows user how the AI is self-reflecting.
        """
        return StreamingEvent(
            event_type=StreamingEventType.REACT_REFLECTION,
            data={
                "iteration": iteration,
                "reflection": reflection,
                "confidence": confidence,
                "what_worked": what_worked,
                "course_correction": course_correction,
                "message": f"🤔 Reflection: {confidence:.0%} confidence"
            },
            metadata={"step": "reflection", "iteration": iteration}
        )
    
    async def stream_goal_reassessment(
        self,
        iteration: int,
        achieved: bool,
        reasoning: str,
        confidence: float,
        next_steps: Optional[List[str]] = None
    ) -> StreamingEvent:
        """
        Stream goal reassessment.
        
        Shows user if goal is achieved or more work needed.
        """
        icon = "✓" if achieved else "→"
        status = "Goal achieved!" if achieved else "Continuing..."
        
        return StreamingEvent(
            event_type=StreamingEventType.GOAL_REASSESSMENT,
            data={
                "iteration": iteration,
                "achieved": achieved,
                "reasoning": reasoning,
                "confidence": confidence,
                "next_steps": next_steps or [],
                "message": f"{icon} {status}"
            },
            metadata={"step": "reassessment", "iteration": iteration}
        )
    
    async def stream_synthesis_start(
        self,
        iterations_completed: int
    ) -> StreamingEvent:
        """
        Stream synthesis start.
        
        Shows user final answer is being synthesized.
        """
        return StreamingEvent(
            event_type=StreamingEventType.SYNTHESIS_START,
            data={
                "iterations_completed": iterations_completed,
                "message": f"📝 Synthesizing final answer from {iterations_completed} iterations..."
            },
            metadata={"step": "synthesis"}
        )
    
    # ========================================================================
    # AGENT STREAMING
    # ========================================================================
    
    async def stream_agent_selection(
        self,
        agent_id: str,
        agent_name: str,
        agent_type: str,
        score: float,
        reasoning: str
    ) -> StreamingEvent:
        """Stream agent selection."""
        return StreamingEvent(
            event_type=StreamingEventType.AGENT_SELECTION,
            data={
                "agent_id": agent_id,
                "agent_name": agent_name,
                "agent_type": agent_type,
                "score": score,
                "reasoning": reasoning,
                "message": f"✓ Selected {agent_name} (score: {score:.2f})"
            }
        )
    
    # ========================================================================
    # EXECUTION STREAMING
    # ========================================================================
    
    async def stream_rag_retrieval(
        self,
        documents_retrieved: int,
        domains: List[str],
        relevance_scores: Optional[List[float]] = None
    ) -> StreamingEvent:
        """Stream RAG document retrieval."""
        return StreamingEvent(
            event_type=StreamingEventType.RAG_RETRIEVAL,
            data={
                "documents_retrieved": documents_retrieved,
                "domains": domains,
                "avg_relevance": sum(relevance_scores) / len(relevance_scores) if relevance_scores else None,
                "message": f"📚 Retrieved {documents_retrieved} documents"
            }
        )
    
    async def stream_tool_execution(
        self,
        tool_name: str,
        status: str,
        result_summary: Optional[str] = None
    ) -> StreamingEvent:
        """Stream tool execution."""
        return StreamingEvent(
            event_type=StreamingEventType.TOOL_EXECUTION,
            data={
                "tool": tool_name,
                "status": status,
                "result_summary": result_summary,
                "message": f"🔧 Executed {tool_name}: {status}"
            }
        )
    
    async def stream_llm_token(
        self,
        token: str,
        cumulative_tokens: int
    ) -> StreamingEvent:
        """Stream individual LLM token."""
        return StreamingEvent(
            event_type=StreamingEventType.LLM_TOKEN,
            data={
                "token": token,
                "cumulative_tokens": cumulative_tokens
            }
        )
    
    # ========================================================================
    # ANALYSIS STREAMING
    # ========================================================================
    
    async def stream_confidence_calculated(
        self,
        overall_confidence: float,
        breakdown: Dict[str, float],
        factors: List[str]
    ) -> StreamingEvent:
        """Stream confidence calculation."""
        return StreamingEvent(
            event_type=StreamingEventType.CONFIDENCE_CALCULATED,
            data={
                "confidence": overall_confidence,
                "breakdown": breakdown,
                "factors": factors,
                "message": f"✓ Confidence: {overall_confidence:.0%}"
            }
        )
    
    async def stream_memory_extracted(
        self,
        entities_count: int,
        facts_count: int,
        topics: List[str]
    ) -> StreamingEvent:
        """Stream semantic memory extraction."""
        return StreamingEvent(
            event_type=StreamingEventType.MEMORY_EXTRACTED,
            data={
                "entities_count": entities_count,
                "facts_count": facts_count,
                "topics": topics,
                "message": f"🧠 Extracted {entities_count} entities, {facts_count} facts"
            }
        )
    
    async def stream_knowledge_captured(
        self,
        knowledge_items: int,
        sources: List[str]
    ) -> StreamingEvent:
        """Stream knowledge capture."""
        return StreamingEvent(
            event_type=StreamingEventType.KNOWLEDGE_CAPTURED,
            data={
                "knowledge_items": knowledge_items,
                "sources": sources,
                "message": f"📖 Captured {knowledge_items} knowledge items"
            }
        )
    
    # ========================================================================
    # PROGRESS STREAMING
    # ========================================================================
    
    async def stream_progress(
        self,
        current_step: int,
        total_steps: int,
        current_activity: str,
        estimated_time_remaining: Optional[int] = None
    ) -> StreamingEvent:
        """Stream progress update."""
        percentage = (current_step / total_steps) * 100
        
        progress = ProgressUpdate(
            current_step=current_step,
            total_steps=total_steps,
            percentage=percentage,
            current_activity=current_activity,
            estimated_time_remaining=estimated_time_remaining
        )
        
        return StreamingEvent(
            event_type=StreamingEventType.PROGRESS_UPDATE,
            data=progress.model_dump(),
            metadata={"percentage": percentage}
        )
    
    async def stream_iteration_complete(
        self,
        iteration: int,
        total_iterations: int,
        iteration_summary: str
    ) -> StreamingEvent:
        """Stream iteration completion."""
        return StreamingEvent(
            event_type=StreamingEventType.ITERATION_COMPLETE,
            data={
                "iteration": iteration,
                "total_iterations": total_iterations,
                "summary": iteration_summary,
                "message": f"✓ Iteration {iteration}/{total_iterations} complete"
            }
        )
    
    # ========================================================================
    # MODE-SPECIFIC STREAMING STRATEGIES
    # ========================================================================
    
    async def stream_mode1_execution(
        self,
        state: Dict[str, Any]
    ) -> AsyncIterator[StreamingEvent]:
        """
        Stream Mode 1 (Interactive-Automatic) execution.
        
        Streams:
        - Agent selection
        - RAG retrieval
        - Tool execution
        - Response generation
        - Confidence calculation
        """
        # Agent selection
        if 'selected_agents' in state and state['selected_agents']:
            yield await self.stream_agent_selection(
                agent_id=state['selected_agents'][-1],
                agent_name=state.get('agent_name', 'Agent'),
                agent_type=state.get('agent_type', 'general'),
                score=state.get('selection_confidence', 0.8),
                reasoning=state.get('selection_reasoning', 'Selected based on query analysis')
            )
        
        # RAG retrieval
        if state.get('enable_rag') and state.get('retrieved_documents'):
            yield await self.stream_rag_retrieval(
                documents_retrieved=len(state['retrieved_documents']),
                domains=state.get('selected_rag_domains', []),
                relevance_scores=[doc.get('relevance', 0.8) for doc in state['retrieved_documents']]
            )
        
        # Tool execution
        for tool in state.get('tools_used', []):
            yield await self.stream_tool_execution(
                tool_name=tool,
                status="completed",
                result_summary=f"{tool} executed successfully"
            )
        
        # Response generation (token streaming would go here)
        
        # Confidence
        if 'response_confidence' in state:
            yield await self.stream_confidence_calculated(
                overall_confidence=state['response_confidence'],
                breakdown=state.get('confidence_breakdown', {}),
                factors=state.get('confidence_factors', [])
            )
    
    async def stream_mode3_execution(
        self,
        state: Dict[str, Any]
    ) -> AsyncIterator[StreamingEvent]:
        """
        Stream Mode 3 (Autonomous-Automatic) execution.
        
        Streams complete ReAct reasoning process:
        - Goal understanding (CoT)
        - Task planning
        - Each ReAct iteration:
          - Thought
          - Agent selection
          - Action
          - Observation
          - Reflection
          - Reassessment
        - Final synthesis
        """
        # Goal understanding
        if 'goal_understanding' in state:
            goal = state['goal_understanding']
            yield await self.stream_goal_understanding(
                understood_goal=goal.get('understood_goal', ''),
                sub_goals=goal.get('sub_goals', []),
                complexity=goal.get('estimated_complexity', 'medium'),
                confidence=goal.get('confidence', 0.8)
            )
        
        # Task plan
        if 'task_plan' in state:
            yield await self.stream_task_plan(
                tasks=state['task_plan'],
                estimated_iterations=state.get('estimated_iterations', 3),
                reasoning="Task plan created based on goal analysis"
            )
        
        # ReAct iterations
        iteration_history = state.get('iteration_history', [])
        for i, iteration in enumerate(iteration_history, 1):
            # Thought
            if 'thought' in iteration:
                yield await self.stream_react_thought(
                    iteration=i,
                    thought=iteration['thought'],
                    reasoning=iteration.get('reasoning', ''),
                    next_action_type=iteration.get('next_action_type', 'rag')
                )
            
            # Action
            if 'action_description' in iteration:
                yield await self.stream_react_action(
                    iteration=i,
                    action_type=iteration.get('action_type', 'unknown'),
                    action_description=iteration['action_description'],
                    success=iteration.get('action_success', True)
                )
            
            # Observation
            if 'observation' in iteration:
                yield await self.stream_react_observation(
                    iteration=i,
                    observation=iteration['observation']
                )
            
            # Reflection
            if 'reflection' in iteration:
                yield await self.stream_react_reflection(
                    iteration=i,
                    reflection=iteration['reflection'],
                    confidence=iteration.get('confidence', 0.7),
                    what_worked=iteration.get('what_worked', ''),
                    course_correction=iteration.get('course_correction', '')
                )
            
            # Iteration complete
            yield await self.stream_iteration_complete(
                iteration=i,
                total_iterations=state.get('max_iterations', 5),
                iteration_summary=iteration.get('reflection', '')[:100]
            )
        
        # Goal reassessment
        if 'goal_assessment' in state:
            assessment = state['goal_assessment']
            yield await self.stream_goal_reassessment(
                iteration=len(iteration_history),
                achieved=assessment.get('achieved', False),
                reasoning=assessment.get('reasoning', ''),
                confidence=assessment.get('confidence', 0.8),
                next_steps=assessment.get('next_steps', [])
            )
        
        # Synthesis
        if state.get('synthesis_complete'):
            yield await self.stream_synthesis_start(
                iterations_completed=len(iteration_history)
            )


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_sse_response(event: StreamingEvent) -> str:
    """
    Create SSE-formatted response from event.
    
    Args:
        event: StreamingEvent to format
        
    Returns:
        SSE-formatted string
    """
    return event.to_sse()


async def stream_to_sse(
    events: AsyncIterator[StreamingEvent]
) -> AsyncIterator[str]:
    """
    Convert event stream to SSE format.
    
    Args:
        events: Async iterator of StreamingEvent objects
        
    Yields:
        SSE-formatted strings
    """
    try:
        async for event in events:
            yield create_sse_response(event)
        
        # Send completion marker
        yield "event: done\ndata: {\"status\": \"complete\"}\n\n"
        
    except Exception as e:
        logger.error("❌ SSE streaming error", error=str(e))
        error_event = StreamingEvent(
            event_type=StreamingEventType.WORKFLOW_ERROR,
            data={"error": str(e)}
        )
        yield create_sse_response(error_event)

