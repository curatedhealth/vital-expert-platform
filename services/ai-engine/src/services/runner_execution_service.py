# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-19
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.task_runners, langgraph_workflows.modes34.runners, supabase]
"""
Runner Execution Service - Unified execution layer for all runners.

Provides centralized execution for VITAL's 215 runners with:
- Task runner execution (88 cognitive runners)
- Family runner execution (8 workflow runners)
- Execution logging and metrics to database
- Error handling with retries
- Timeout management
- Cost tracking

Usage:
    service = get_runner_execution_service(supabase_client)
    result = await service.execute_task_runner(
        runner_id="critique_runner",
        input_data={"content": "text to critique"},
        tenant_id="tenant-123"
    )
"""

from typing import Any, AsyncIterator, Dict, Optional, Type
from uuid import uuid4
import time
import asyncio
from datetime import datetime

from pydantic import BaseModel, Field
import structlog

from langgraph_workflows.task_runners.unified_registry import (
    get_unified_registry,
    JTBDLevel,
    JobStep,
    RunnerInfo,
    RunnerType,
    RunnerMapping,
)
from langgraph_workflows.task_runners.base_task_runner import (
    TaskRunner,
    TaskRunnerInput,
    TaskRunnerOutput,
)

logger = structlog.get_logger(__name__)


# =============================================================================
# Result Models
# =============================================================================

class ExecutionResult(BaseModel):
    """Unified execution result for all runner types."""
    execution_id: str
    runner_id: str
    runner_type: str
    success: bool
    output: Optional[Dict[str, Any]] = None
    confidence_score: float = 0.0
    quality_score: float = 0.0
    execution_time_ms: int = 0
    tokens_used: int = 0
    cost_usd: float = 0.0
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ExecutionMetrics(BaseModel):
    """Metrics collected during runner execution."""
    input_size_bytes: int = 0
    output_size_bytes: int = 0
    tokens_input: int = 0
    tokens_output: int = 0
    llm_calls: int = 0
    tool_calls: int = 0
    retries: int = 0


# =============================================================================
# Service Class
# =============================================================================

class RunnerExecutionService:
    """
    Centralized service for executing runners with full observability.

    Handles:
    - Runner instantiation and lifecycle
    - Input validation
    - Execution with configurable timeout
    - Metrics collection and logging
    - Error handling with retries
    - Cost estimation
    """

    # Cost estimates per token (USD)
    COST_PER_INPUT_TOKEN = 0.00001   # $0.01 per 1K input tokens
    COST_PER_OUTPUT_TOKEN = 0.00003  # $0.03 per 1K output tokens

    def __init__(
        self,
        supabase_client=None,
        default_timeout_seconds: int = 180,
        max_retries: int = 2,
        enable_logging: bool = True,
    ):
        """
        Initialize the runner execution service.

        Args:
            supabase_client: Supabase async client for logging executions
            default_timeout_seconds: Default execution timeout
            max_retries: Maximum retry attempts on transient failures
            enable_logging: Whether to log executions to database
        """
        self.supabase = supabase_client
        self.default_timeout = default_timeout_seconds
        self.max_retries = max_retries
        self.enable_logging = enable_logging
        self._registry = get_unified_registry()

    async def execute_task_runner(
        self,
        runner_id: str,
        input_data: Dict[str, Any],
        tenant_id: str,
        session_id: Optional[str] = None,
        mission_id: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
        retry_on_failure: bool = True,
    ) -> ExecutionResult:
        """
        Execute a task runner with the given input.

        Args:
            runner_id: ID of the task runner to execute
            input_data: Input parameters for the runner
            tenant_id: Tenant identifier
            session_id: Optional session for context
            mission_id: Optional mission ID for correlation
            timeout_seconds: Execution timeout (overrides default)
            retry_on_failure: Whether to retry on transient failures

        Returns:
            ExecutionResult with output and metrics
        """
        execution_id = str(uuid4())
        start_time = time.time()
        timeout = timeout_seconds or self.default_timeout
        metrics = ExecutionMetrics()
        retries = 0

        # Track input size
        import json
        metrics.input_size_bytes = len(json.dumps(input_data))

        # Get runner class
        runner_class = self._registry.get_task_runner(runner_id)
        if not runner_class:
            logger.warning("runner_not_found", runner_id=runner_id)
            return ExecutionResult(
                execution_id=execution_id,
                runner_id=runner_id,
                runner_type="task",
                success=False,
                error=f"Runner not found: {runner_id}",
            )

        # Execution loop with retries
        last_error = None
        while retries <= (self.max_retries if retry_on_failure else 0):
            try:
                # Instantiate runner
                runner = runner_class()

                # Prepare input
                input_data["tenant_id"] = tenant_id
                input_data["trace_id"] = execution_id

                # Create typed input
                InputClass = getattr(runner, 'InputType', TaskRunnerInput)
                try:
                    runner_input = InputClass(**input_data)
                except Exception as e:
                    return ExecutionResult(
                        execution_id=execution_id,
                        runner_id=runner_id,
                        runner_type="task",
                        success=False,
                        error=f"Invalid input: {str(e)}",
                    )

                logger.info(
                    "task_runner_executing",
                    runner_id=runner_id,
                    execution_id=execution_id,
                    tenant_id=tenant_id,
                    attempt=retries + 1,
                )

                # Execute with timeout
                result = await asyncio.wait_for(
                    runner.execute(runner_input),
                    timeout=timeout,
                )

                execution_time_ms = int((time.time() - start_time) * 1000)

                # Extract metrics from result
                tokens_used = getattr(result, 'tokens_used', 0)
                confidence_score = getattr(result, 'confidence_score', 0.0)
                quality_score = getattr(result, 'quality_score', 0.0)

                # Calculate cost
                cost_usd = self._estimate_cost(tokens_used)

                # Build output
                output = None
                if hasattr(result, 'model_dump'):
                    output = result.model_dump()
                elif isinstance(result, dict):
                    output = result
                else:
                    output = {"result": str(result)}

                metrics.output_size_bytes = len(json.dumps(output)) if output else 0
                metrics.retries = retries

                # Log to database
                if self.enable_logging:
                    await self._log_execution(
                        execution_id=execution_id,
                        runner_id=runner_id,
                        tenant_id=tenant_id,
                        session_id=session_id,
                        mission_id=mission_id,
                        execution_time_ms=execution_time_ms,
                        success=True,
                        tokens_used=tokens_used,
                        cost_usd=cost_usd,
                        confidence_score=confidence_score,
                        quality_score=quality_score,
                        metrics=metrics,
                    )

                logger.info(
                    "task_runner_completed",
                    runner_id=runner_id,
                    execution_id=execution_id,
                    execution_time_ms=execution_time_ms,
                    confidence_score=confidence_score,
                )

                return ExecutionResult(
                    execution_id=execution_id,
                    runner_id=runner_id,
                    runner_type="task",
                    success=getattr(result, 'success', True),
                    output=output,
                    confidence_score=confidence_score,
                    quality_score=quality_score,
                    execution_time_ms=execution_time_ms,
                    tokens_used=tokens_used,
                    cost_usd=cost_usd,
                    metadata={"retries": retries},
                )

            except asyncio.TimeoutError:
                last_error = f"Timeout after {timeout}s"
                logger.warning(
                    "task_runner_timeout",
                    runner_id=runner_id,
                    execution_id=execution_id,
                    timeout=timeout,
                    attempt=retries + 1,
                )
                retries += 1

            except Exception as e:
                last_error = str(e)
                logger.warning(
                    "task_runner_error",
                    runner_id=runner_id,
                    execution_id=execution_id,
                    error=str(e),
                    attempt=retries + 1,
                )
                retries += 1

        # All retries exhausted
        execution_time_ms = int((time.time() - start_time) * 1000)
        metrics.retries = retries

        if self.enable_logging:
            await self._log_execution(
                execution_id=execution_id,
                runner_id=runner_id,
                tenant_id=tenant_id,
                session_id=session_id,
                mission_id=mission_id,
                execution_time_ms=execution_time_ms,
                success=False,
                error=last_error,
                metrics=metrics,
            )

        logger.error(
            "task_runner_failed",
            runner_id=runner_id,
            execution_id=execution_id,
            error=last_error,
            retries=retries,
        )

        return ExecutionResult(
            execution_id=execution_id,
            runner_id=runner_id,
            runner_type="task",
            success=False,
            execution_time_ms=execution_time_ms,
            error=last_error,
            metadata={"retries": retries},
        )

    async def execute_family_runner(
        self,
        family: str,
        query: str,
        tenant_id: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        thread_id: Optional[str] = None,
    ) -> ExecutionResult:
        """
        Execute a family runner for complex multi-step workflows.

        Family runners implement sophisticated reasoning patterns:
        - DEEP_RESEARCH: ToT → CoT → Reflection
        - STRATEGY: Scenario → SWOT → Roadmap
        - EVALUATION: MCDA Scoring
        - etc.

        Args:
            family: Family type (DEEP_RESEARCH, STRATEGY, etc.)
            query: The research query or goal
            tenant_id: Tenant identifier
            session_id: Session for context
            context: Additional context dictionary
            thread_id: Thread ID for checkpoint persistence

        Returns:
            ExecutionResult with family runner output
        """
        from langgraph_workflows.modes34.runners.base_family_runner import (
            FamilyResult,
            get_family_runner,
            FamilyType,
        )

        execution_id = str(uuid4())
        start_time = time.time()

        # Normalize family name
        family_upper = family.upper()

        # Get runner class
        try:
            family_type = FamilyType(family_upper)
            runner_class = get_family_runner(family_type)
        except (ValueError, KeyError):
            # Fallback to generic
            runner_class = get_family_runner(FamilyType.GENERIC)
            logger.warning(
                "family_runner_fallback",
                requested_family=family,
                using="GENERIC",
            )

        if not runner_class:
            return ExecutionResult(
                execution_id=execution_id,
                runner_id=f"{family.lower()}_runner",
                runner_type="family",
                success=False,
                error=f"Family runner not found: {family}",
            )

        try:
            # Instantiate and execute
            runner = runner_class()

            logger.info(
                "family_runner_executing",
                family=family,
                execution_id=execution_id,
                tenant_id=tenant_id,
            )

            result: FamilyResult = await runner.execute(
                query=query,
                tenant_id=tenant_id,
                session_id=session_id or str(uuid4()),
                context=context or {},
                thread_id=thread_id,
            )

            execution_time_ms = int((time.time() - start_time) * 1000)

            # Log execution
            if self.enable_logging:
                await self._log_execution(
                    execution_id=execution_id,
                    runner_id=f"{family.lower()}_runner",
                    tenant_id=tenant_id,
                    session_id=session_id,
                    execution_time_ms=execution_time_ms,
                    success=result.success,
                    confidence_score=result.confidence_score,
                    quality_score=result.quality_score,
                )

            logger.info(
                "family_runner_completed",
                family=family,
                execution_id=execution_id,
                execution_time_ms=execution_time_ms,
                confidence_score=result.confidence_score,
            )

            return ExecutionResult(
                execution_id=execution_id,
                runner_id=f"{family.lower()}_runner",
                runner_type="family",
                success=result.success,
                output={
                    "mission_id": result.mission_id,
                    "output": result.output,
                    "citations": result.citations,
                    "steps_completed": result.steps_completed,
                    "total_steps": result.total_steps,
                },
                confidence_score=result.confidence_score,
                quality_score=result.quality_score,
                execution_time_ms=execution_time_ms,
                error=result.error,
            )

        except Exception as e:
            execution_time_ms = int((time.time() - start_time) * 1000)
            logger.error(
                "family_runner_failed",
                family=family,
                execution_id=execution_id,
                error=str(e),
                exc_info=True,
            )

            if self.enable_logging:
                await self._log_execution(
                    execution_id=execution_id,
                    runner_id=f"{family.lower()}_runner",
                    tenant_id=tenant_id,
                    session_id=session_id,
                    execution_time_ms=execution_time_ms,
                    success=False,
                    error=str(e),
                )

            return ExecutionResult(
                execution_id=execution_id,
                runner_id=f"{family.lower()}_runner",
                runner_type="family",
                success=False,
                execution_time_ms=execution_time_ms,
                error=str(e),
            )

    async def stream_family_runner(
        self,
        family: str,
        query: str,
        tenant_id: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Stream execution events from a family runner.

        Yields SSE-compatible events for real-time UI updates.

        Args:
            family: Family type
            query: The research query
            tenant_id: Tenant identifier
            session_id: Session for context
            context: Additional context

        Yields:
            Dict events with type and data for SSE streaming
        """
        from langgraph_workflows.modes34.runners.base_family_runner import (
            get_family_runner,
            FamilyType,
            SSEEvent,
        )

        family_upper = family.upper()

        try:
            family_type = FamilyType(family_upper)
            runner_class = get_family_runner(family_type)
        except (ValueError, KeyError):
            runner_class = get_family_runner(FamilyType.GENERIC)

        if not runner_class:
            yield {
                "event": "error",
                "data": {"error": f"Family runner not found: {family}"}
            }
            return

        runner = runner_class()

        async for event in runner.stream(
            query=query,
            tenant_id=tenant_id,
            session_id=session_id or str(uuid4()),
            context=context or {},
        ):
            yield {
                "event": event.event_type.value,
                "data": event.data,
                "timestamp": event.timestamp.isoformat(),
                "mission_id": event.mission_id,
            }

    def get_runner_for_jtbd(
        self,
        jtbd_level: JTBDLevel,
        job_step: JobStep,
    ) -> RunnerMapping:
        """
        Get the appropriate runner for a JTBD level and job step.

        Args:
            jtbd_level: JTBD hierarchy level
            job_step: Current job step

        Returns:
            RunnerMapping with runner details
        """
        return self._registry.get_runner_for_jtbd(jtbd_level, job_step)

    def get_runner_info(self, runner_id: str) -> Optional[RunnerInfo]:
        """Get information about a specific runner."""
        return self._registry.get_runner_info(runner_id)

    def list_runners(
        self,
        runner_type: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[RunnerInfo]:
        """List available runners with optional filtering."""
        if runner_type == "task":
            return self._registry.list_task_runners(category=category)
        elif runner_type == "family":
            return self._registry.list_family_runners()
        else:
            runners = self._registry.list_all_runners()
            if category:
                runners = [r for r in runners if r.category == category]
            return runners

    def _estimate_cost(self, tokens_used: int) -> float:
        """Estimate execution cost based on token usage."""
        # Assume 70% input, 30% output ratio
        input_tokens = int(tokens_used * 0.7)
        output_tokens = tokens_used - input_tokens
        return (
            input_tokens * self.COST_PER_INPUT_TOKEN +
            output_tokens * self.COST_PER_OUTPUT_TOKEN
        )

    async def _log_execution(
        self,
        execution_id: str,
        runner_id: str,
        tenant_id: str,
        session_id: Optional[str] = None,
        mission_id: Optional[str] = None,
        execution_time_ms: int = 0,
        success: bool = True,
        tokens_used: int = 0,
        cost_usd: float = 0.0,
        confidence_score: float = 0.0,
        quality_score: float = 0.0,
        error: Optional[str] = None,
        metrics: Optional[ExecutionMetrics] = None,
    ):
        """Log execution to database for metrics and observability."""
        if not self.supabase:
            return

        try:
            data = {
                "id": execution_id,
                "runner_id": runner_id,
                "tenant_id": tenant_id,
                "session_id": session_id,
                "mission_id": mission_id,
                "execution_time_ms": execution_time_ms,
                "status": "completed" if success else "failed",
                "tokens_used": tokens_used,
                "cost_usd": cost_usd,
                "confidence_score": confidence_score,
                "quality_score": quality_score,
                "error_message": error,
            }

            if metrics:
                data["input_size_bytes"] = metrics.input_size_bytes
                data["output_size_bytes"] = metrics.output_size_bytes

            await self.supabase.table("runner_executions").insert(data).execute()

        except Exception as e:
            # Don't fail the execution if logging fails
            logger.warning(
                "failed_to_log_execution",
                execution_id=execution_id,
                error=str(e),
            )


# =============================================================================
# Singleton Access
# =============================================================================

_runner_service: Optional[RunnerExecutionService] = None


def get_runner_execution_service(
    supabase_client=None,
) -> RunnerExecutionService:
    """
    Get the runner execution service singleton.

    Args:
        supabase_client: Optional Supabase client for execution logging

    Returns:
        RunnerExecutionService instance
    """
    global _runner_service
    if _runner_service is None:
        _runner_service = RunnerExecutionService(
            supabase_client=supabase_client,
        )
    elif supabase_client and _runner_service.supabase is None:
        _runner_service.supabase = supabase_client
    return _runner_service


def reset_runner_service():
    """Reset the singleton (for testing)."""
    global _runner_service
    _runner_service = None
