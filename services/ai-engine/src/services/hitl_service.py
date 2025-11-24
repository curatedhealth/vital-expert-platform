"""
Human-in-the-Loop (HITL) System for Autonomous Modes

Provides approval checkpoints for autonomous agent execution:
- Plan approval
- Tool execution approval
- Sub-agent spawning approval
- Critical decision approval
- Artifact generation approval

Supports 3 safety levels: Conservative, Balanced, Minimal
"""

from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field
import structlog

logger = structlog.get_logger()


# ============================================================================
# ENUMS
# ============================================================================

class HITLCheckpoint(str, Enum):
    """HITL checkpoint types"""
    PLAN_APPROVAL = "plan_approval"
    TOOL_EXECUTION = "tool_execution"
    SUB_AGENT_SPAWNING = "sub_agent_spawning"
    CRITICAL_DECISION = "critical_decision"
    ARTIFACT_GENERATION = "artifact_generation"


class HITLSafetyLevel(str, Enum):
    """HITL safety levels"""
    CONSERVATIVE = "conservative"  # Approve everything
    BALANCED = "balanced"          # Approve risky actions only
    MINIMAL = "minimal"            # Approve critical decisions only


class ApprovalStatus(str, Enum):
    """Approval status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"
    SKIPPED = "skipped"


# ============================================================================
# MODELS
# ============================================================================

class HITLConfig(BaseModel):
    """HITL configuration"""
    enabled: bool = True
    safety_level: HITLSafetyLevel = HITLSafetyLevel.BALANCED
    timeout_seconds: int = 3600  # 1 hour default timeout
    
    # Checkpoint-specific settings
    require_plan_approval: bool = True
    require_tool_approval: bool = True
    require_subagent_approval: bool = True
    require_decision_approval: bool = True
    require_artifact_approval: bool = False  # Usually auto-approve


class PlanApprovalRequest(BaseModel):
    """Plan approval request"""
    checkpoint_type: HITLCheckpoint = HITLCheckpoint.PLAN_APPROVAL
    agent_id: str
    agent_name: str
    plan_steps: List[Dict[str, Any]]
    total_estimated_time_minutes: int
    confidence_score: float
    tools_required: List[str]
    sub_agents_required: List[str]


class ToolExecutionApprovalRequest(BaseModel):
    """Tool execution approval request"""
    checkpoint_type: HITLCheckpoint = HITLCheckpoint.TOOL_EXECUTION
    step_number: int
    step_name: str
    tools: List[Dict[str, Any]]  # [{"name": "web_search", "params": {...}, "cost": 0.02}]
    total_estimated_cost: float
    total_estimated_duration_minutes: int
    has_side_effects: bool = False  # True if tool modifies external state


class SubAgentApprovalRequest(BaseModel):
    """Sub-agent spawning approval request"""
    checkpoint_type: HITLCheckpoint = HITLCheckpoint.SUB_AGENT_SPAWNING
    parent_agent_id: str
    sub_agent_id: str
    sub_agent_name: str
    sub_agent_level: int  # 3 = Specialist, 4 = Worker, 5 = Tool
    sub_agent_specialty: str
    task_description: str
    estimated_duration_minutes: int
    estimated_cost: float
    reasoning: str  # Why this sub-agent is needed


class CriticalDecisionApprovalRequest(BaseModel):
    """Critical decision approval request"""
    checkpoint_type: HITLCheckpoint = HITLCheckpoint.CRITICAL_DECISION
    decision_title: str
    recommendation: str
    reasoning: List[str]
    confidence_score: float
    alternatives_considered: List[Dict[str, Any]]
    expected_impact: str
    evidence: List[Dict[str, Any]]  # Evidence supporting the decision


class ArtifactGenerationApprovalRequest(BaseModel):
    """Artifact generation approval request"""
    checkpoint_type: HITLCheckpoint = HITLCheckpoint.ARTIFACT_GENERATION
    artifacts: List[Dict[str, Any]]  # [{"type": "pdf", "name": "report", "pages": 25}]
    total_estimated_time_minutes: int


class HITLApprovalResponse(BaseModel):
    """HITL approval response from user"""
    checkpoint_id: str
    status: ApprovalStatus
    user_feedback: Optional[str] = None
    modifications: Optional[Dict[str, Any]] = None  # If status = MODIFIED
    approved_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# HITL SERVICE
# ============================================================================

class HITLService:
    """
    Human-in-the-Loop Service
    
    Manages approval checkpoints for autonomous agent execution.
    Pauses execution and waits for user approval before proceeding.
    
    Features:
    - 5 checkpoint types
    - 3 safety levels
    - Auto-approval for safe actions
    - Timeout handling
    - Approval history tracking
    """
    
    def __init__(self, config: HITLConfig):
        """Initialize HITL service"""
        self.config = config
        self.pending_approvals: Dict[str, Any] = {}
        self.approval_history: List[HITLApprovalResponse] = []
        
        logger.info(
            "hitl_service_initialized",
            enabled=config.enabled,
            safety_level=config.safety_level.value
        )
    
    # ========================================================================
    # CHECKPOINT REQUESTS
    # ========================================================================
    
    async def request_plan_approval(
        self,
        request: PlanApprovalRequest,
        session_id: str,
        user_id: str
    ) -> HITLApprovalResponse:
        """
        Request approval for execution plan
        
        Always required if HITL enabled.
        
        Returns:
            Approval response (waits for user input)
        """
        if not self.config.enabled:
            return self._auto_approve("plan_approval")
        
        if not self.config.require_plan_approval:
            return self._auto_approve("plan_approval")
        
        checkpoint_id = f"plan_{session_id}_{datetime.utcnow().timestamp()}"
        
        logger.info(
            "hitl_plan_approval_requested",
            checkpoint_id=checkpoint_id,
            agent=request.agent_name,
            steps=len(request.plan_steps),
            estimated_time=request.total_estimated_time_minutes
        )
        
        # Store pending approval
        self.pending_approvals[checkpoint_id] = {
            "request": request,
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        }
        
        # Wait for user response (via WebSocket or polling)
        response = await self._wait_for_approval(checkpoint_id)
        
        # Log response
        self.approval_history.append(response)
        
        logger.info(
            "hitl_plan_approval_received",
            checkpoint_id=checkpoint_id,
            status=response.status.value
        )
        
        return response
    
    async def request_tool_execution_approval(
        self,
        request: ToolExecutionApprovalRequest,
        session_id: str,
        user_id: str
    ) -> HITLApprovalResponse:
        """
        Request approval for tool execution
        
        Auto-approves safe tools (read-only) in Balanced mode.
        Always requires approval for tools with side effects.
        """
        if not self.config.enabled:
            return self._auto_approve("tool_execution")
        
        # Check if auto-approval is allowed
        if self._should_auto_approve_tools(request):
            logger.info(
                "hitl_tool_auto_approved",
                step=request.step_name,
                tools=[t['name'] for t in request.tools],
                reason="safe_tools_balanced_mode"
            )
            return self._auto_approve("tool_execution")
        
        checkpoint_id = f"tool_{session_id}_{datetime.utcnow().timestamp()}"
        
        logger.info(
            "hitl_tool_approval_requested",
            checkpoint_id=checkpoint_id,
            step=request.step_name,
            tools=[t['name'] for t in request.tools],
            has_side_effects=request.has_side_effects
        )
        
        self.pending_approvals[checkpoint_id] = {
            "request": request,
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        }
        
        response = await self._wait_for_approval(checkpoint_id)
        self.approval_history.append(response)
        
        return response
    
    async def request_subagent_approval(
        self,
        request: SubAgentApprovalRequest,
        session_id: str,
        user_id: str
    ) -> HITLApprovalResponse:
        """
        Request approval for sub-agent spawning
        
        Auto-approves in Minimal mode.
        """
        if not self.config.enabled:
            return self._auto_approve("subagent_spawning")
        
        if self.config.safety_level == HITLSafetyLevel.MINIMAL:
            logger.info(
                "hitl_subagent_auto_approved",
                sub_agent=request.sub_agent_name,
                reason="minimal_mode"
            )
            return self._auto_approve("subagent_spawning")
        
        if not self.config.require_subagent_approval:
            return self._auto_approve("subagent_spawning")
        
        checkpoint_id = f"subagent_{session_id}_{datetime.utcnow().timestamp()}"
        
        logger.info(
            "hitl_subagent_approval_requested",
            checkpoint_id=checkpoint_id,
            sub_agent=request.sub_agent_name,
            level=request.sub_agent_level
        )
        
        self.pending_approvals[checkpoint_id] = {
            "request": request,
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        }
        
        response = await self._wait_for_approval(checkpoint_id)
        self.approval_history.append(response)
        
        return response
    
    async def request_critical_decision_approval(
        self,
        request: CriticalDecisionApprovalRequest,
        session_id: str,
        user_id: str
    ) -> HITLApprovalResponse:
        """
        Request approval for critical decision
        
        Always required unless HITL disabled.
        """
        if not self.config.enabled:
            return self._auto_approve("critical_decision")
        
        if not self.config.require_decision_approval:
            return self._auto_approve("critical_decision")
        
        checkpoint_id = f"decision_{session_id}_{datetime.utcnow().timestamp()}"
        
        logger.info(
            "hitl_decision_approval_requested",
            checkpoint_id=checkpoint_id,
            decision=request.decision_title,
            confidence=request.confidence_score
        )
        
        self.pending_approvals[checkpoint_id] = {
            "request": request,
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        }
        
        response = await self._wait_for_approval(checkpoint_id)
        self.approval_history.append(response)
        
        return response
    
    async def request_artifact_approval(
        self,
        request: ArtifactGenerationApprovalRequest,
        session_id: str,
        user_id: str
    ) -> HITLApprovalResponse:
        """
        Request approval for artifact generation
        
        Auto-approves in Balanced and Minimal modes.
        """
        if not self.config.enabled:
            return self._auto_approve("artifact_generation")
        
        if self.config.safety_level != HITLSafetyLevel.CONSERVATIVE:
            logger.info(
                "hitl_artifact_auto_approved",
                artifacts=[a['name'] for a in request.artifacts],
                reason="non_conservative_mode"
            )
            return self._auto_approve("artifact_generation")
        
        if not self.config.require_artifact_approval:
            return self._auto_approve("artifact_generation")
        
        checkpoint_id = f"artifact_{session_id}_{datetime.utcnow().timestamp()}"
        
        logger.info(
            "hitl_artifact_approval_requested",
            checkpoint_id=checkpoint_id,
            artifacts=[a['name'] for a in request.artifacts]
        )
        
        self.pending_approvals[checkpoint_id] = {
            "request": request,
            "session_id": session_id,
            "user_id": user_id,
            "created_at": datetime.utcnow()
        }
        
        response = await self._wait_for_approval(checkpoint_id)
        self.approval_history.append(response)
        
        return response
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _should_auto_approve_tools(self, request: ToolExecutionApprovalRequest) -> bool:
        """Determine if tools should be auto-approved"""
        if self.config.safety_level == HITLSafetyLevel.CONSERVATIVE:
            return False  # Always require approval
        
        if self.config.safety_level == HITLSafetyLevel.MINIMAL:
            return True  # Auto-approve everything except critical decisions
        
        # Balanced mode: auto-approve safe tools
        if request.has_side_effects:
            return False  # Require approval for tools with side effects
        
        # Check if all tools are safe (read-only)
        safe_tools = {'web_search', 'database_query', 'document_parser', 'rag_search'}
        all_safe = all(tool['name'] in safe_tools for tool in request.tools)
        
        return all_safe
    
    def _auto_approve(self, checkpoint_type: str) -> HITLApprovalResponse:
        """Create auto-approval response"""
        return HITLApprovalResponse(
            checkpoint_id=f"auto_{checkpoint_type}_{datetime.utcnow().timestamp()}",
            status=ApprovalStatus.APPROVED,
            user_feedback="Auto-approved",
            approved_at=datetime.utcnow()
        )
    
    async def _wait_for_approval(self, checkpoint_id: str) -> HITLApprovalResponse:
        """
        Wait for user approval (stub - implement with WebSocket/polling)
        
        In production, this would:
        1. Send approval request to frontend via WebSocket
        2. Wait for user response
        3. Handle timeout if user doesn't respond
        """
        # TODO: Implement actual waiting mechanism
        # For now, return a mock approved response
        
        import asyncio
        
        # Simulate waiting
        timeout = self.config.timeout_seconds
        start_time = datetime.utcnow()
        
        # In production, this would listen for WebSocket message
        # For now, simulate immediate approval
        await asyncio.sleep(0.1)
        
        # Check if approval received (stub)
        # In production, check WebSocket message or database
        approval_received = True  # Mock
        
        if approval_received:
            return HITLApprovalResponse(
                checkpoint_id=checkpoint_id,
                status=ApprovalStatus.APPROVED,
                user_feedback=None,
                approved_at=datetime.utcnow()
            )
        else:
            # Timeout - auto-reject
            logger.warning(
                "hitl_approval_timeout",
                checkpoint_id=checkpoint_id,
                timeout_seconds=timeout
            )
            return HITLApprovalResponse(
                checkpoint_id=checkpoint_id,
                status=ApprovalStatus.REJECTED,
                user_feedback="Timeout - no response received",
                approved_at=datetime.utcnow()
            )
    
    # ========================================================================
    # ANALYTICS
    # ========================================================================
    
    def get_approval_stats(self) -> Dict[str, Any]:
        """Get approval statistics"""
        if not self.approval_history:
            return {"total_approvals": 0}
        
        total = len(self.approval_history)
        approved = sum(1 for a in self.approval_history if a.status == ApprovalStatus.APPROVED)
        rejected = sum(1 for a in self.approval_history if a.status == ApprovalStatus.REJECTED)
        modified = sum(1 for a in self.approval_history if a.status == ApprovalStatus.MODIFIED)
        
        return {
            "total_approvals": total,
            "approved": approved,
            "rejected": rejected,
            "modified": modified,
            "approval_rate": approved / total if total > 0 else 0.0
        }


# ============================================================================
# FACTORY
# ============================================================================

def create_hitl_service(
    enabled: bool = True,
    safety_level: HITLSafetyLevel = HITLSafetyLevel.BALANCED
) -> HITLService:
    """Create HITL service instance"""
    config = HITLConfig(
        enabled=enabled,
        safety_level=safety_level
    )
    return HITLService(config)

