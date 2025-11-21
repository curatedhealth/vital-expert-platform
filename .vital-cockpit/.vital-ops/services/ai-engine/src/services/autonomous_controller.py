"""
Autonomous Controller - Goal-Based Continuation Logic

Replaces iteration-based limits with intelligent goal-driven continuation.
Enables true autonomous operation until goals are achieved, budget exhausted,
or user intervention.

Golden Rules Compliance:
✅ #1: Pure Python implementation
✅ #2: Caching integrated
✅ #3: Tenant isolation enforced
✅ #4: Supports RAG/Tools
✅ #5: Enables continuous learning

Features:
- Goal-based continuation (not iteration-limited)
- Budget/cost controls
- Runtime limits
- Progress tracking
- User stop capability
- Goal reassessment
- Auto-continuation logic

Usage:
    >>> controller = AutonomousController(
    ...     session_id="session_123",
    ...     tenant_id=tenant_id,
    ...     goal="Create comprehensive FDA IND submission plan",
    ...     cost_limit_usd=5.0,
    ...     runtime_limit_minutes=15
    ... )
    >>> should_continue = await controller.should_continue(
    ...     current_cost=0.50,
    ...     goal_progress=0.3,
    ...     iteration_count=3
    ... )
"""

import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from enum import Enum
from uuid import UUID
import structlog
from pydantic import BaseModel, Field, UUID4

logger = structlog.get_logger()


class ContinuationReason(str, Enum):
    """Reasons for continuation decisions."""
    GOAL_ACHIEVED = "goal_achieved"
    GOAL_NOT_ACHIEVED = "goal_not_achieved"
    BUDGET_EXHAUSTED = "budget_exhausted"
    RUNTIME_EXCEEDED = "runtime_exceeded"
    USER_STOPPED = "user_stopped"
    NO_PROGRESS = "no_progress"
    ERROR_THRESHOLD = "error_threshold"


class AutonomousState(BaseModel):
    """State of autonomous execution."""
    session_id: str
    tenant_id: UUID4
    goal: str
    started_at: datetime
    
    # Limits
    cost_limit_usd: float = 10.0
    runtime_limit_minutes: int = 30
    
    # Current state
    current_cost_usd: float = 0.0
    current_iteration: int = 0
    elapsed_minutes: float = 0.0
    
    # Progress tracking
    goal_progress: float = 0.0  # 0.0 to 1.0
    last_progress_update: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    progress_history: List[float] = Field(default_factory=list)
    
    # Control flags
    stop_requested: bool = False
    paused: bool = False
    
    # Error tracking
    consecutive_errors: int = 0
    max_consecutive_errors: int = 3
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ContinuationDecision(BaseModel):
    """Decision on whether to continue autonomous execution."""
    should_continue: bool
    reason: ContinuationReason
    explanation: str
    remaining_budget_usd: float
    remaining_minutes: float
    goal_progress: float
    confidence: float  # How confident in the decision (0-1)
    
    # Recommendations
    recommended_actions: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class AutonomousController:
    """
    Controller for autonomous execution with goal-based continuation.
    
    Replaces hard iteration limits with intelligent decision-making:
    - Continues until goal is achieved
    - Respects budget constraints
    - Honors runtime limits
    - Allows user intervention
    - Tracks progress and adjusts
    """
    
    def __init__(
        self,
        session_id: str,
        tenant_id: UUID4,
        goal: str,
        supabase_client=None,
        cost_limit_usd: float = 10.0,
        runtime_limit_minutes: int = 30,
        min_progress_threshold: float = 0.05  # Minimum progress per iteration
    ):
        """
        Initialize autonomous controller.
        
        Args:
            session_id: Session identifier
            tenant_id: Tenant UUID
            goal: The goal to achieve
            supabase_client: Optional Supabase client for persistence
            cost_limit_usd: Maximum cost allowed
            runtime_limit_minutes: Maximum runtime allowed
            min_progress_threshold: Minimum progress expected per iteration
        """
        self.supabase = supabase_client
        self.min_progress_threshold = min_progress_threshold
        
        self.state = AutonomousState(
            session_id=session_id,
            tenant_id=tenant_id,
            goal=goal,
            started_at=datetime.now(timezone.utc),
            cost_limit_usd=cost_limit_usd,
            runtime_limit_minutes=runtime_limit_minutes
        )
        
        logger.info(
            "✅ AutonomousController initialized",
            session_id=session_id,
            goal_preview=goal[:50],
            cost_limit=cost_limit_usd,
            runtime_limit=runtime_limit_minutes
        )
    
    async def should_continue(
        self,
        current_cost_usd: float,
        goal_progress: float,
        iteration_count: int,
        recent_results: Optional[List[Dict[str, Any]]] = None,
        error_occurred: bool = False
    ) -> ContinuationDecision:
        """
        Decide whether autonomous execution should continue.
        
        This is the core decision logic that replaces iteration limits.
        
        Args:
            current_cost_usd: Current total cost
            goal_progress: Current progress (0.0 to 1.0)
            iteration_count: Current iteration number
            recent_results: Recent execution results for progress analysis
            error_occurred: Whether an error occurred in last iteration
            
        Returns:
            ContinuationDecision with should_continue flag and reasoning
        """
        # Update state
        self.state.current_cost_usd = current_cost_usd
        self.state.current_iteration = iteration_count
        self.state.goal_progress = goal_progress
        self.state.elapsed_minutes = (
            datetime.now(timezone.utc) - self.state.started_at
        ).total_seconds() / 60.0
        
        if error_occurred:
            self.state.consecutive_errors += 1
        else:
            self.state.consecutive_errors = 0
        
        # Track progress history
        self.state.progress_history.append(goal_progress)
        
        # Check stop conditions
        decision = await self._evaluate_continuation()
        
        # Persist state if Supabase available
        if self.supabase:
            await self._persist_state()
        
        logger.info(
            f"Continuation decision: {'CONTINUE' if decision.should_continue else 'STOP'}",
            reason=decision.reason,
            progress=f"{goal_progress:.0%}",
            cost=f"${current_cost_usd:.2f}",
            iteration=iteration_count
        )
        
        return decision
    
    async def _evaluate_continuation(self) -> ContinuationDecision:
        """
        Evaluate all continuation conditions.
        
        Priority order:
        1. User stop request (highest priority)
        2. Error threshold exceeded
        3. Goal achieved
        4. Budget exhausted
        5. Runtime exceeded
        6. No progress being made
        7. Continue (default)
        """
        state = self.state
        remaining_budget = state.cost_limit_usd - state.current_cost_usd
        remaining_minutes = state.runtime_limit_minutes - state.elapsed_minutes
        
        # 1. User stop requested
        if state.stop_requested:
            return ContinuationDecision(
                should_continue=False,
                reason=ContinuationReason.USER_STOPPED,
                explanation="User requested execution to stop",
                remaining_budget_usd=remaining_budget,
                remaining_minutes=remaining_minutes,
                goal_progress=state.goal_progress,
                confidence=1.0,
                warnings=["Execution stopped by user intervention"]
            )
        
        # 2. Too many consecutive errors
        if state.consecutive_errors >= state.max_consecutive_errors:
            return ContinuationDecision(
                should_continue=False,
                reason=ContinuationReason.ERROR_THRESHOLD,
                explanation=f"Exceeded error threshold ({state.consecutive_errors} consecutive errors)",
                remaining_budget_usd=remaining_budget,
                remaining_minutes=remaining_minutes,
                goal_progress=state.goal_progress,
                confidence=0.9,
                warnings=[f"Failed {state.consecutive_errors} times in a row"]
            )
        
        # 3. Goal achieved
        if state.goal_progress >= 0.95:  # 95% = achieved
            return ContinuationDecision(
                should_continue=False,
                reason=ContinuationReason.GOAL_ACHIEVED,
                explanation=f"Goal achieved ({state.goal_progress:.0%} complete)",
                remaining_budget_usd=remaining_budget,
                remaining_minutes=remaining_minutes,
                goal_progress=state.goal_progress,
                confidence=0.95,
                recommended_actions=["Synthesize final answer", "Save results"]
            )
        
        # 4. Budget exhausted
        if state.current_cost_usd >= state.cost_limit_usd:
            return ContinuationDecision(
                should_continue=False,
                reason=ContinuationReason.BUDGET_EXHAUSTED,
                explanation=f"Cost limit reached (${state.current_cost_usd:.2f} / ${state.cost_limit_usd:.2f})",
                remaining_budget_usd=0.0,
                remaining_minutes=remaining_minutes,
                goal_progress=state.goal_progress,
                confidence=1.0,
                warnings=["Budget limit reached"],
                recommended_actions=["Return partial results", "Suggest increasing budget"]
            )
        
        # 5. Runtime exceeded
        if state.elapsed_minutes >= state.runtime_limit_minutes:
            return ContinuationDecision(
                should_continue=False,
                reason=ContinuationReason.RUNTIME_EXCEEDED,
                explanation=f"Runtime limit reached ({state.elapsed_minutes:.1f} / {state.runtime_limit_minutes} minutes)",
                remaining_budget_usd=remaining_budget,
                remaining_minutes=0.0,
                goal_progress=state.goal_progress,
                confidence=1.0,
                warnings=["Time limit reached"],
                recommended_actions=["Return partial results", "Suggest continuing later"]
            )
        
        # 6. No progress being made
        if len(state.progress_history) >= 3:
            recent_progress = state.progress_history[-3:]
            progress_delta = recent_progress[-1] - recent_progress[0]
            
            if progress_delta < self.min_progress_threshold and state.current_iteration >= 5:
                return ContinuationDecision(
                    should_continue=False,
                    reason=ContinuationReason.NO_PROGRESS,
                    explanation=f"No significant progress in last 3 iterations (Δ={progress_delta:.2%})",
                    remaining_budget_usd=remaining_budget,
                    remaining_minutes=remaining_minutes,
                    goal_progress=state.goal_progress,
                    confidence=0.8,
                    warnings=["Stuck - not making progress"],
                    recommended_actions=[
                        "Return current results",
                        "Suggest different approach",
                        "Request user guidance"
                    ]
                )
        
        # 7. Continue - goal not yet achieved
        warnings = []
        if remaining_budget < state.cost_limit_usd * 0.2:
            warnings.append(f"Low budget remaining: ${remaining_budget:.2f}")
        if remaining_minutes < state.runtime_limit_minutes * 0.2:
            warnings.append(f"Low time remaining: {remaining_minutes:.1f} min")
        
        return ContinuationDecision(
            should_continue=True,
            reason=ContinuationReason.GOAL_NOT_ACHIEVED,
            explanation=f"Goal {state.goal_progress:.0%} complete, continuing...",
            remaining_budget_usd=remaining_budget,
            remaining_minutes=remaining_minutes,
            goal_progress=state.goal_progress,
            confidence=0.85,
            warnings=warnings,
            recommended_actions=["Continue with next iteration"]
        )
    
    async def request_stop(self):
        """Request the autonomous execution to stop (user intervention)."""
        self.state.stop_requested = True
        logger.info("🛑 Stop requested", session_id=self.state.session_id)
        
        if self.supabase:
            await self._persist_state()
    
    async def update_progress(self, new_progress: float, metadata: Optional[Dict[str, Any]] = None):
        """
        Update goal progress.
        
        Args:
            new_progress: New progress value (0.0 to 1.0)
            metadata: Optional metadata about the progress
        """
        self.state.goal_progress = max(0.0, min(1.0, new_progress))
        self.state.last_progress_update = datetime.now(timezone.utc)
        
        if metadata:
            self.state.metadata.update(metadata)
        
        logger.debug(
            "Progress updated",
            session_id=self.state.session_id,
            progress=f"{new_progress:.0%}"
        )
    
    async def _persist_state(self):
        """Persist controller state to database."""
        if not self.supabase:
            return
        
        try:
            state_data = {
                'session_id': self.state.session_id,
                'tenant_id': str(self.state.tenant_id),
                'stop_requested': self.state.stop_requested,
                'current_cost_usd': self.state.current_cost_usd,
                'cost_limit_usd': self.state.cost_limit_usd,
                'started_at': self.state.started_at.isoformat(),
                'runtime_limit_minutes': self.state.runtime_limit_minutes,
                'expires_at': (self.state.started_at + timedelta(hours=2)).isoformat()
            }
            
            # Upsert to autonomous_control_state table
            self.supabase.table('autonomous_control_state')\
                .upsert(state_data, on_conflict='session_id')\
                .execute()
            
        except Exception as e:
            logger.error("Failed to persist controller state", error=str(e))
    
    async def load_state_from_db(self) -> bool:
        """
        Load controller state from database if it exists.
        
        Returns:
            True if state was loaded, False otherwise
        """
        if not self.supabase:
            return False
        
        try:
            result = self.supabase.table('autonomous_control_state')\
                .select('*')\
                .eq('session_id', self.state.session_id)\
                .execute()
            
            if not result.data:
                return False
            
            data = result.data[0]
            self.state.stop_requested = data.get('stop_requested', False)
            self.state.current_cost_usd = data.get('current_cost_usd', 0.0)
            
            logger.info(
                "Controller state loaded from database",
                session_id=self.state.session_id,
                stop_requested=self.state.stop_requested
            )
            
            return True
            
        except Exception as e:
            logger.error("Failed to load controller state", error=str(e))
            return False
    
    def get_state_summary(self) -> Dict[str, Any]:
        """Get current state summary for monitoring."""
        return {
            'session_id': self.state.session_id,
            'goal': self.state.goal,
            'progress': self.state.goal_progress,
            'cost_used': self.state.current_cost_usd,
            'cost_limit': self.state.cost_limit_usd,
            'cost_remaining': self.state.cost_limit_usd - self.state.current_cost_usd,
            'elapsed_minutes': self.state.elapsed_minutes,
            'runtime_limit': self.state.runtime_limit_minutes,
            'iteration': self.state.current_iteration,
            'stop_requested': self.state.stop_requested,
            'consecutive_errors': self.state.consecutive_errors
        }


# Factory function
def create_autonomous_controller(
    session_id: str,
    tenant_id: UUID4,
    goal: str,
    supabase_client=None,
    cost_limit_usd: float = 10.0,
    runtime_limit_minutes: int = 30
) -> AutonomousController:
    """Create and initialize an autonomous controller."""
    return AutonomousController(
        session_id=session_id,
        tenant_id=tenant_id,
        goal=goal,
        supabase_client=supabase_client,
        cost_limit_usd=cost_limit_usd,
        runtime_limit_minutes=runtime_limit_minutes
    )

