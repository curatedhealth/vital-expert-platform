"""
Execution Controller for VITAL Expert Consultation

Provides pause/resume/intervention capabilities for autonomous agent execution
with real-time state management and user control.
"""

from typing import Dict, List, Any, Optional, Callable
import asyncio
import uuid
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict

from ..session.session_manager import SessionManager, SessionMetadata
from ..redis.redis_manager import RedisManager, ExecutionState
from ..streaming.reasoning_streamer import ReasoningStreamer


class ExecutionStatus(Enum):
    """Execution status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class InterventionType(Enum):
    """Types of user interventions"""
    PAUSE = "pause"
    RESUME = "resume"
    STOP = "stop"
    MODIFY_QUERY = "modify_query"
    CHANGE_AGENT = "change_agent"
    ADJUST_BUDGET = "adjust_budget"
    ADD_CONTEXT = "add_context"
    SKIP_PHASE = "skip_phase"


@dataclass
class InterventionRequest:
    """User intervention request"""
    intervention_id: str
    session_id: str
    user_id: str
    intervention_type: InterventionType
    parameters: Dict[str, Any]
    timestamp: datetime
    status: str = "pending"  # pending, applied, rejected
    response: Optional[str] = None


@dataclass
class ExecutionCheckpoint:
    """Execution checkpoint for pause/resume"""
    checkpoint_id: str
    session_id: str
    phase: str
    iteration: int
    state: Dict[str, Any]
    timestamp: datetime
    can_resume: bool = True


class ExecutionController:
    """Controls autonomous agent execution with user intervention capabilities"""
    
    def __init__(
        self,
        session_manager: SessionManager,
        redis_manager: RedisManager,
        streamer: ReasoningStreamer
    ):
        self.session_manager = session_manager
        self.redis_manager = redis_manager
        self.streamer = streamer
        
        # Active executions
        self.active_executions: Dict[str, asyncio.Task] = {}
        self.execution_states: Dict[str, ExecutionState] = {}
        
        # Intervention queue
        self.intervention_queue: Dict[str, List[InterventionRequest]] = {}
        
        # Execution callbacks
        self.execution_callbacks: Dict[str, List[Callable]] = {
            "on_pause": [],
            "on_resume": [],
            "on_stop": [],
            "on_complete": [],
            "on_error": []
        }
    
    async def start_execution(
        self,
        session_id: str,
        execution_function: Callable,
        *args,
        **kwargs
    ) -> bool:
        """Start autonomous execution for a session"""
        try:
            # Check if session exists
            session = await self.session_manager.get_session(session_id)
            if not session:
                return False
            
            # Check if already running
            if session_id in self.active_executions:
                return False
            
            # Create execution state
            execution_state = ExecutionState(
                session_id=session_id,
                user_id=session.session_id,
                status=ExecutionStatus.RUNNING.value,
                current_phase="initializing",
                iteration=0,
                total_iterations=session.max_iterations,
                progress_percentage=0.0,
                current_step="Starting execution",
                last_activity=datetime.utcnow(),
                cost_so_far=0.0,
                budget=session.budget
            )
            
            # Store state
            self.execution_states[session_id] = execution_state
            await self.redis_manager.set_execution_state(execution_state)
            
            # Create execution task
            task = asyncio.create_task(
                self._execute_with_control(
                    session_id, 
                    execution_function, 
                    *args, 
                    **kwargs
                )
            )
            
            self.active_executions[session_id] = task
            
            # Notify start
            await self.streamer.send_step({
                "phase": "execution_control",
                "content": "Execution started successfully",
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {"session_id": session_id, "status": "started"}
            })
            
            return True
            
        except Exception as e:
            print(f"Error starting execution: {e}")
            return False
    
    async def pause_execution(self, session_id: str, user_id: str) -> bool:
        """Pause execution for a session"""
        try:
            # Check if execution is active
            if session_id not in self.active_executions:
                return False
            
            # Create intervention request
            intervention = InterventionRequest(
                intervention_id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                intervention_type=InterventionType.PAUSE,
                parameters={},
                timestamp=datetime.utcnow()
            )
            
            # Add to intervention queue
            if session_id not in self.intervention_queue:
                self.intervention_queue[session_id] = []
            self.intervention_queue[session_id].append(intervention)
            
            # Update execution state
            await self.redis_manager.pause_execution(session_id)
            
            # Notify pause
            await self.streamer.send_step({
                "phase": "execution_control",
                "content": "Execution paused by user",
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "session_id": session_id,
                    "intervention": "pause",
                    "user_id": user_id
                }
            })
            
            # Trigger pause callbacks
            await self._trigger_callbacks("on_pause", session_id, intervention)
            
            return True
            
        except Exception as e:
            print(f"Error pausing execution: {e}")
            return False
    
    async def resume_execution(self, session_id: str, user_id: str) -> bool:
        """Resume execution for a session"""
        try:
            # Check if execution exists and is paused
            if session_id not in self.active_executions:
                return False
            
            # Create intervention request
            intervention = InterventionRequest(
                intervention_id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                intervention_type=InterventionType.RESUME,
                parameters={},
                timestamp=datetime.utcnow()
            )
            
            # Add to intervention queue
            if session_id not in self.intervention_queue:
                self.intervention_queue[session_id] = []
            self.intervention_queue[session_id].append(intervention)
            
            # Update execution state
            await self.redis_manager.resume_execution(session_id)
            
            # Notify resume
            await self.streamer.send_step({
                "phase": "execution_control",
                "content": "Execution resumed by user",
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "session_id": session_id,
                    "intervention": "resume",
                    "user_id": user_id
                }
            })
            
            # Trigger resume callbacks
            await self._trigger_callbacks("on_resume", session_id, intervention)
            
            return True
            
        except Exception as e:
            print(f"Error resuming execution: {e}")
            return False
    
    async def stop_execution(
        self, 
        session_id: str, 
        user_id: str,
        reason: str = "Stopped by user"
    ) -> bool:
        """Stop execution for a session"""
        try:
            # Check if execution is active
            if session_id not in self.active_executions:
                return False
            
            # Create intervention request
            intervention = InterventionRequest(
                intervention_id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                intervention_type=InterventionType.STOP,
                parameters={"reason": reason},
                timestamp=datetime.utcnow()
            )
            
            # Add to intervention queue
            if session_id not in self.intervention_queue:
                self.intervention_queue[session_id] = []
            self.intervention_queue[session_id].append(intervention)
            
            # Cancel execution task
            task = self.active_executions[session_id]
            task.cancel()
            
            # Update execution state
            await self.redis_manager.complete_execution(
                session_id, 
                error=f"Stopped: {reason}"
            )
            
            # Clean up
            del self.active_executions[session_id]
            if session_id in self.execution_states:
                del self.execution_states[session_id]
            
            # Notify stop
            await self.streamer.send_step({
                "phase": "execution_control",
                "content": f"Execution stopped: {reason}",
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "session_id": session_id,
                    "intervention": "stop",
                    "user_id": user_id,
                    "reason": reason
                }
            })
            
            # Trigger stop callbacks
            await self._trigger_callbacks("on_stop", session_id, intervention)
            
            return True
            
        except Exception as e:
            print(f"Error stopping execution: {e}")
            return False
    
    async def modify_query(
        self, 
        session_id: str, 
        user_id: str, 
        new_query: str
    ) -> bool:
        """Modify the query during execution"""
        try:
            # Create intervention request
            intervention = InterventionRequest(
                intervention_id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                intervention_type=InterventionType.MODIFY_QUERY,
                parameters={"new_query": new_query},
                timestamp=datetime.utcnow()
            )
            
            # Add to intervention queue
            if session_id not in self.intervention_queue:
                self.intervention_queue[session_id] = []
            self.intervention_queue[session_id].append(intervention)
            
            # Update session with new query
            await self.session_manager.update_session(session_id, {
                "query": new_query
            })
            
            # Notify modification
            await self.streamer.send_step({
                "phase": "execution_control",
                "content": f"Query modified: {new_query[:100]}...",
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "session_id": session_id,
                    "intervention": "modify_query",
                    "user_id": user_id,
                    "new_query": new_query
                }
            })
            
            return True
            
        except Exception as e:
            print(f"Error modifying query: {e}")
            return False
    
    async def adjust_budget(
        self, 
        session_id: str, 
        user_id: str, 
        new_budget: float
    ) -> bool:
        """Adjust budget during execution"""
        try:
            # Create intervention request
            intervention = InterventionRequest(
                intervention_id=str(uuid.uuid4()),
                session_id=session_id,
                user_id=user_id,
                intervention_type=InterventionType.ADJUST_BUDGET,
                parameters={"new_budget": new_budget},
                timestamp=datetime.utcnow()
            )
            
            # Add to intervention queue
            if session_id not in self.intervention_queue:
                self.intervention_queue[session_id] = []
            self.intervention_queue[session_id].append(intervention)
            
            # Update session budget
            await self.session_manager.update_session(session_id, {
                "budget": new_budget
            })
            
            # Update execution state
            if session_id in self.execution_states:
                self.execution_states[session_id].budget = new_budget
                await self.redis_manager.set_execution_state(
                    self.execution_states[session_id]
                )
            
            # Notify budget adjustment
            await self.streamer.send_step({
                "phase": "execution_control",
                "content": f"Budget adjusted to ${new_budget:.2f}",
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "session_id": session_id,
                    "intervention": "adjust_budget",
                    "user_id": user_id,
                    "new_budget": new_budget
                }
            })
            
            return True
            
        except Exception as e:
            print(f"Error adjusting budget: {e}")
            return False
    
    async def get_execution_status(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current execution status"""
        try:
            if session_id in self.execution_states:
                state = self.execution_states[session_id]
                return {
                    "session_id": session_id,
                    "status": state.status,
                    "current_phase": state.current_phase,
                    "progress": state.progress_percentage,
                    "iteration": state.iteration,
                    "total_iterations": state.total_iterations,
                    "cost": state.cost_so_far,
                    "budget": state.budget,
                    "last_activity": state.last_activity.isoformat(),
                    "current_step": state.current_step,
                    "error": state.error,
                    "is_active": session_id in self.active_executions
                }
            
            return None
            
        except Exception as e:
            print(f"Error getting execution status: {e}")
            return None
    
    async def get_pending_interventions(self, session_id: str) -> List[Dict[str, Any]]:
        """Get pending interventions for a session"""
        try:
            if session_id in self.intervention_queue:
                return [asdict(intervention) for intervention in self.intervention_queue[session_id]]
            return []
            
        except Exception as e:
            print(f"Error getting pending interventions: {e}")
            return []
    
    async def apply_intervention(
        self, 
        session_id: str, 
        intervention_id: str
    ) -> bool:
        """Apply a pending intervention"""
        try:
            if session_id not in self.intervention_queue:
                return False
            
            # Find intervention
            intervention = None
            for i, interv in enumerate(self.intervention_queue[session_id]):
                if interv.intervention_id == intervention_id:
                    intervention = interv
                    # Remove from queue
                    del self.intervention_queue[session_id][i]
                    break
            
            if not intervention:
                return False
            
            # Apply intervention based on type
            if intervention.intervention_type == InterventionType.PAUSE:
                # Already handled in pause_execution
                intervention.status = "applied"
                intervention.response = "Execution paused successfully"
                
            elif intervention.intervention_type == InterventionType.RESUME:
                # Already handled in resume_execution
                intervention.status = "applied"
                intervention.response = "Execution resumed successfully"
                
            elif intervention.intervention_type == InterventionType.STOP:
                # Already handled in stop_execution
                intervention.status = "applied"
                intervention.response = "Execution stopped successfully"
                
            elif intervention.intervention_type == InterventionType.MODIFY_QUERY:
                # Already handled in modify_query
                intervention.status = "applied"
                intervention.response = "Query modified successfully"
                
            elif intervention.intervention_type == InterventionType.ADJUST_BUDGET:
                # Already handled in adjust_budget
                intervention.status = "applied"
                intervention.response = "Budget adjusted successfully"
            
            return True
            
        except Exception as e:
            print(f"Error applying intervention: {e}")
            return False
    
    def add_callback(self, event: str, callback: Callable):
        """Add execution callback"""
        if event in self.execution_callbacks:
            self.execution_callbacks[event].append(callback)
    
    async def _execute_with_control(
        self,
        session_id: str,
        execution_function: Callable,
        *args,
        **kwargs
    ):
        """Execute function with control capabilities"""
        try:
            # Get session
            session = await self.session_manager.get_session(session_id)
            if not session:
                return
            
            # Execute the function
            result = await execution_function(*args, **kwargs)
            
            # Mark as completed
            await self.redis_manager.complete_execution(session_id)
            
            # Clean up
            if session_id in self.active_executions:
                del self.active_executions[session_id]
            if session_id in self.execution_states:
                del self.execution_states[session_id]
            
            # Trigger completion callbacks
            await self._trigger_callbacks("on_complete", session_id, result)
            
            return result
            
        except asyncio.CancelledError:
            # Execution was cancelled
            await self.redis_manager.complete_execution(
                session_id, 
                error="Execution cancelled"
            )
            
            # Clean up
            if session_id in self.active_executions:
                del self.active_executions[session_id]
            if session_id in self.execution_states:
                del self.execution_states[session_id]
            
            # Trigger stop callbacks
            await self._trigger_callbacks("on_stop", session_id, {"reason": "cancelled"})
            
        except Exception as e:
            # Execution failed
            await self.redis_manager.complete_execution(
                session_id, 
                error=str(e)
            )
            
            # Clean up
            if session_id in self.active_executions:
                del self.active_executions[session_id]
            if session_id in self.execution_states:
                del self.execution_states[session_id]
            
            # Trigger error callbacks
            await self._trigger_callbacks("on_error", session_id, {"error": str(e)})
    
    async def _trigger_callbacks(self, event: str, session_id: str, data: Any):
        """Trigger execution callbacks"""
        try:
            if event in self.execution_callbacks:
                for callback in self.execution_callbacks[event]:
                    try:
                        if asyncio.iscoroutinefunction(callback):
                            await callback(session_id, data)
                        else:
                            callback(session_id, data)
                    except Exception as e:
                        print(f"Error in callback {event}: {e}")
        except Exception as e:
            print(f"Error triggering callbacks: {e}")
    
    async def cleanup_completed_executions(self):
        """Clean up completed executions"""
        try:
            completed_sessions = []
            
            for session_id, task in self.active_executions.items():
                if task.done():
                    completed_sessions.append(session_id)
            
            for session_id in completed_sessions:
                del self.active_executions[session_id]
                if session_id in self.execution_states:
                    del self.execution_states[session_id]
                if session_id in self.intervention_queue:
                    del self.intervention_queue[session_id]
            
            return len(completed_sessions)
            
        except Exception as e:
            print(f"Error cleaning up completed executions: {e}")
            return 0
