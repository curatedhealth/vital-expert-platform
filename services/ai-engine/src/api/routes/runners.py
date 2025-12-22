# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-19
# MODES_SUPPORTED: [1, 2, 3, 4]
# DEPENDENCIES: [langgraph_workflows.task_runners, ontology.jtbd_runner_service]
"""
Runners API - Direct runner execution and management.

Provides unified access to VITAL's 215 runners:
- 88 Task Runners (22 cognitive categories)
- 8 Family Runners (complex workflows)
- 119 Pharma-specific runners

Endpoints:
- GET  /api/runners/list                    -> List available runners
- GET  /api/runners/{runner_id}             -> Get runner details
- POST /api/runners/{runner_id}/execute     -> Execute a runner directly
- GET  /api/runners/jtbd/{level}/{step}     -> Get runner for JTBD level/step
- GET  /api/runners/categories              -> List 22 cognitive categories
- GET  /api/runners/families                -> List 8 family runner types
"""

from typing import Any, Dict, List, Optional
from uuid import uuid4
import time
import os

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
import structlog

from langgraph_workflows.task_runners.unified_registry import (
    get_unified_registry,
    JTBDLevel,
    JobStep,
    RunnerType,
    AIIntervention,
    RunnerInfo,
    RunnerMapping,
)
from langgraph_workflows.task_runners.base_task_runner import TaskRunnerCategory

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/api/runners", tags=["runners"])


# =============================================================================
# Request/Response Models
# =============================================================================

class RunnerListResponse(BaseModel):
    """Response for listing runners."""
    runners: List[Dict[str, Any]]
    total: int
    runner_type: Optional[str] = None
    category: Optional[str] = None


class RunnerDetailResponse(BaseModel):
    """Response for single runner details."""
    runner_id: str
    name: str
    runner_type: str
    category: Optional[str] = None
    family: Optional[str] = None
    description: Optional[str] = None
    service_layers: List[str] = []
    ai_intervention: Optional[str] = None
    algorithmic_core: Optional[str] = None


class RunnerExecuteRequest(BaseModel):
    """Request to execute a runner."""
    input_data: Dict[str, Any] = Field(..., description="Runner input parameters")
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    trace_id: Optional[str] = Field(default=None, description="Trace ID for observability")
    timeout_seconds: Optional[int] = Field(default=180, ge=10, le=600, description="Execution timeout")


class RunnerExecuteResponse(BaseModel):
    """Response from runner execution."""
    runner_id: str
    execution_id: str
    success: bool
    output: Optional[Dict[str, Any]] = None
    confidence_score: float = 0.0
    quality_score: float = 0.0
    execution_time_ms: int = 0
    tokens_used: int = 0
    error: Optional[str] = None


class JTBDRunnerResponse(BaseModel):
    """Response for JTBD-to-runner mapping."""
    jtbd_level: str
    job_step: str
    runner_id: str
    runner_type: str
    category: Optional[str] = None
    service_layer: str
    ai_intervention: str


class FamilyRunnerInfo(BaseModel):
    """Information about a family runner."""
    family: str
    name: str
    reasoning_pattern: str
    description: Optional[str] = None


# =============================================================================
# Dependencies
# =============================================================================

async def get_tenant_id(x_tenant_id: Optional[str] = Header(None, alias="x-tenant-id")) -> str:
    """Extract tenant ID from header, with fallback for development."""
    if not x_tenant_id:
        # In production, this should be required
        if os.getenv("ENVIRONMENT", "development") == "production":
            raise HTTPException(status_code=400, detail="x-tenant-id header is required")
        return "default-tenant"
    return x_tenant_id


# =============================================================================
# Routes
# =============================================================================

@router.get("/list", response_model=RunnerListResponse)
async def list_runners(
    runner_type: Optional[str] = None,
    category: Optional[str] = None,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    List all available runners with optional filtering.

    Args:
        runner_type: Filter by 'task', 'family', or 'orchestrator'
        category: Filter by cognitive category (e.g., 'UNDERSTAND', 'EVALUATE')

    Returns:
        List of runners matching the criteria
    """
    registry = get_unified_registry()

    # Validate runner_type if provided
    if runner_type and runner_type not in ['task', 'family', 'orchestrator']:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid runner_type: {runner_type}. Must be 'task', 'family', or 'orchestrator'"
        )

    # Validate category if provided
    if category:
        valid_categories = [c.value.upper() for c in TaskRunnerCategory]
        if category.upper() not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {category}. Valid categories: {valid_categories}"
            )

    # Get runners based on filters
    if runner_type == "task":
        runners = registry.list_task_runners(category=category.upper() if category else None)
    elif runner_type == "family":
        runners = registry.list_family_runners()
    else:
        runners = registry.list_all_runners()
        if category:
            runners = [r for r in runners if r.category and r.category.upper() == category.upper()]

    # Convert to dicts
    runner_dicts = [r.model_dump() for r in runners]

    logger.info(
        "runners_listed",
        tenant_id=tenant_id,
        count=len(runner_dicts),
        runner_type=runner_type,
        category=category,
    )

    return RunnerListResponse(
        runners=runner_dicts,
        total=len(runner_dicts),
        runner_type=runner_type,
        category=category,
    )


@router.get("/categories", response_model=List[str])
async def list_runner_categories(
    tenant_id: str = Depends(get_tenant_id),
):
    """
    List all 22 cognitive runner categories.

    Categories follow the VITAL cognitive framework:
    UNDERSTAND, EVALUATE, DECIDE, INVESTIGATE, WATCH, SOLVE, PREPARE,
    CREATE, REFINE, VALIDATE, SYNTHESIZE, PLAN, PREDICT, ENGAGE,
    ALIGN, INFLUENCE, ADAPT, DISCOVER, DESIGN, GOVERN, SECURE, EXECUTE
    """
    categories = [c.value.upper() for c in TaskRunnerCategory]
    logger.debug("categories_listed", count=len(categories))
    return categories


@router.get("/families", response_model=List[FamilyRunnerInfo])
async def list_runner_families(
    tenant_id: str = Depends(get_tenant_id),
):
    """
    List all 8 family runner types with their reasoning patterns.

    Family runners implement complex multi-step workflows:
    - DEEP_RESEARCH: ToT → CoT → Reflection
    - STRATEGY: Scenario → SWOT → Roadmap
    - EVALUATION: MCDA Scoring
    - INVESTIGATION: RCA → Bayesian
    - PROBLEM_SOLVING: Hypothesis → Test → Iterate
    - COMMUNICATION: Audience → Format → Review
    - MONITORING: Baseline → Delta → Alert
    - GENERIC: Standard Execution
    """
    from langgraph_workflows.modes34.runners.base_family_runner import FamilyType

    family_info = [
        FamilyRunnerInfo(
            family="DEEP_RESEARCH",
            name="Deep Research Runner",
            reasoning_pattern="ToT → CoT → Reflection",
            description="Tree-of-Thought exploration followed by Chain-of-Thought synthesis and self-reflection"
        ),
        FamilyRunnerInfo(
            family="STRATEGY",
            name="Strategy Runner",
            reasoning_pattern="Scenario → SWOT → Roadmap",
            description="Scenario planning with SWOT analysis leading to actionable roadmap"
        ),
        FamilyRunnerInfo(
            family="EVALUATION",
            name="Evaluation Runner",
            reasoning_pattern="MCDA Scoring",
            description="Multi-Criteria Decision Analysis with weighted scoring"
        ),
        FamilyRunnerInfo(
            family="INVESTIGATION",
            name="Investigation Runner",
            reasoning_pattern="RCA → Bayesian",
            description="Root Cause Analysis with Bayesian probability reasoning"
        ),
        FamilyRunnerInfo(
            family="PROBLEM_SOLVING",
            name="Problem Solving Runner",
            reasoning_pattern="Hypothesis → Test → Iterate",
            description="Scientific method-based hypothesis testing and iteration"
        ),
        FamilyRunnerInfo(
            family="COMMUNICATION",
            name="Communication Runner",
            reasoning_pattern="Audience → Format → Review",
            description="Audience-aware content creation with format optimization"
        ),
        FamilyRunnerInfo(
            family="MONITORING",
            name="Monitoring Runner",
            reasoning_pattern="Baseline → Delta → Alert",
            description="Continuous monitoring with delta detection and alerting"
        ),
        FamilyRunnerInfo(
            family="GENERIC",
            name="Generic Runner",
            reasoning_pattern="Plan → Execute → Review",
            description="Standard step-by-step execution for general workflows"
        ),
    ]

    logger.debug("families_listed", count=len(family_info))
    return family_info


@router.get("/jtbd/{level}/{step}", response_model=JTBDRunnerResponse)
async def get_runner_for_jtbd(
    level: str,
    step: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Get the appropriate runner for a JTBD level and job step.

    Implements the 2D Job Matrix: JTBD Level × Job Step → Runner

    Args:
        level: JTBD level (strategic, solution, workflow, task)
        step: Job step (define, locate, prepare, confirm, execute, monitor, modify, conclude)

    Returns:
        Runner mapping with runner_id, type, service_layer, and AI intervention level
    """
    # Validate and convert level
    try:
        jtbd_level = JTBDLevel(level.lower())
    except ValueError:
        valid_levels = [l.value for l in JTBDLevel]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid JTBD level: {level}. Valid levels: {valid_levels}"
        )

    # Validate and convert step
    try:
        job_step = JobStep(step.lower())
    except ValueError:
        valid_steps = [s.value for s in JobStep]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid job step: {step}. Valid steps: {valid_steps}"
        )

    registry = get_unified_registry()
    mapping = registry.get_runner_for_jtbd(jtbd_level, job_step)

    logger.info(
        "jtbd_runner_resolved",
        tenant_id=tenant_id,
        jtbd_level=level,
        job_step=step,
        runner_id=mapping.runner_id,
    )

    return JTBDRunnerResponse(
        jtbd_level=level,
        job_step=step,
        runner_id=mapping.runner_id,
        runner_type=mapping.runner_type.value if isinstance(mapping.runner_type, RunnerType) else mapping.runner_type,
        category=mapping.category,
        service_layer=mapping.service_layer,
        ai_intervention=mapping.ai_intervention.value if isinstance(mapping.ai_intervention, AIIntervention) else mapping.ai_intervention,
    )


@router.get("/{runner_id}", response_model=RunnerDetailResponse)
async def get_runner(
    runner_id: str,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Get detailed information about a specific runner.

    Args:
        runner_id: Unique identifier of the runner (e.g., 'critique_runner', 'deep_research_runner')

    Returns:
        Runner details including name, type, category, and capabilities
    """
    registry = get_unified_registry()
    info = registry.get_runner_info(runner_id)

    if not info:
        raise HTTPException(
            status_code=404,
            detail=f"Runner not found: {runner_id}"
        )

    # Get additional details from the runner class if available
    runner_class = registry.get_task_runner(runner_id)
    algorithmic_core = None
    if runner_class:
        algorithmic_core = getattr(runner_class, 'algorithmic_core', None)

    logger.debug("runner_details_retrieved", runner_id=runner_id)

    return RunnerDetailResponse(
        runner_id=info.runner_id,
        name=info.name,
        runner_type=info.runner_type.value if isinstance(info.runner_type, RunnerType) else info.runner_type,
        category=info.category,
        family=info.family,
        description=info.description,
        service_layers=info.service_layers,
        ai_intervention=info.ai_intervention.value if isinstance(info.ai_intervention, AIIntervention) else info.ai_intervention,
        algorithmic_core=algorithmic_core,
    )


@router.post("/{runner_id}/execute", response_model=RunnerExecuteResponse)
async def execute_runner(
    runner_id: str,
    request: RunnerExecuteRequest,
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Execute a task runner directly with provided input.

    This endpoint allows direct execution of any task runner,
    bypassing the mission/workflow layer for atomic operations.

    Args:
        runner_id: ID of the runner to execute
        request: Execution request with input data

    Returns:
        Execution result with output, confidence score, and metrics
    """
    import asyncio

    registry = get_unified_registry()
    execution_id = str(uuid4())
    start_time = time.time()

    # Get runner class
    runner_class = registry.get_task_runner(runner_id)
    if not runner_class:
        # Check if it's a family runner
        family_runner = registry.get_family_runner(runner_id.replace('_runner', '').upper())
        if family_runner:
            raise HTTPException(
                status_code=400,
                detail=f"'{runner_id}' is a family runner. Use /api/missions/stream for family runner execution."
            )
        raise HTTPException(
            status_code=404,
            detail=f"Runner not found: {runner_id}"
        )

    try:
        # Instantiate runner
        runner = runner_class()

        # Prepare input
        input_data = request.input_data.copy()
        input_data["tenant_id"] = tenant_id
        input_data["trace_id"] = request.trace_id or execution_id

        # Get input type from runner
        InputClass = getattr(runner, 'InputType', None)
        if InputClass:
            try:
                runner_input = InputClass(**input_data)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid input for runner {runner_id}: {str(e)}"
                )
        else:
            runner_input = input_data

        logger.info(
            "runner_execution_started",
            runner_id=runner_id,
            execution_id=execution_id,
            tenant_id=tenant_id,
        )

        # Execute with timeout
        timeout = request.timeout_seconds or 180
        result = await asyncio.wait_for(
            runner.execute(runner_input),
            timeout=timeout,
        )

        execution_time_ms = int((time.time() - start_time) * 1000)

        logger.info(
            "runner_execution_completed",
            runner_id=runner_id,
            execution_id=execution_id,
            execution_time_ms=execution_time_ms,
            success=getattr(result, 'success', True),
        )

        # Build response
        output = None
        if hasattr(result, 'model_dump'):
            output = result.model_dump()
        elif isinstance(result, dict):
            output = result
        else:
            output = {"result": str(result)}

        return RunnerExecuteResponse(
            runner_id=runner_id,
            execution_id=execution_id,
            success=getattr(result, 'success', True),
            output=output,
            confidence_score=getattr(result, 'confidence_score', 0.0),
            quality_score=getattr(result, 'quality_score', 0.0),
            execution_time_ms=execution_time_ms,
            tokens_used=getattr(result, 'tokens_used', 0),
            error=getattr(result, 'error', None),
        )

    except asyncio.TimeoutError:
        execution_time_ms = int((time.time() - start_time) * 1000)
        logger.error(
            "runner_execution_timeout",
            runner_id=runner_id,
            execution_id=execution_id,
            timeout_seconds=request.timeout_seconds,
        )
        return RunnerExecuteResponse(
            runner_id=runner_id,
            execution_id=execution_id,
            success=False,
            execution_time_ms=execution_time_ms,
            error=f"Execution timeout after {request.timeout_seconds}s",
        )

    except HTTPException:
        raise

    except Exception as e:
        execution_time_ms = int((time.time() - start_time) * 1000)
        logger.error(
            "runner_execution_failed",
            runner_id=runner_id,
            execution_id=execution_id,
            error=str(e),
            exc_info=True,
        )
        return RunnerExecuteResponse(
            runner_id=runner_id,
            execution_id=execution_id,
            success=False,
            execution_time_ms=execution_time_ms,
            error=str(e),
        )


@router.get("/jtbd/matrix", response_model=Dict[str, Dict[str, JTBDRunnerResponse]])
async def get_jtbd_runner_matrix(
    tenant_id: str = Depends(get_tenant_id),
):
    """
    Get the complete JTBD × Job Step → Runner mapping matrix.

    Returns a 2D mapping of all JTBD levels and job steps to their default runners.
    Useful for understanding the full runner architecture.
    """
    registry = get_unified_registry()

    matrix: Dict[str, Dict[str, JTBDRunnerResponse]] = {}

    for level in JTBDLevel:
        matrix[level.value] = {}
        for step in JobStep:
            mapping = registry.get_runner_for_jtbd(level, step)
            matrix[level.value][step.value] = JTBDRunnerResponse(
                jtbd_level=level.value,
                job_step=step.value,
                runner_id=mapping.runner_id,
                runner_type=mapping.runner_type.value if isinstance(mapping.runner_type, RunnerType) else mapping.runner_type,
                category=mapping.category,
                service_layer=mapping.service_layer,
                ai_intervention=mapping.ai_intervention.value if isinstance(mapping.ai_intervention, AIIntervention) else mapping.ai_intervention,
            )

    logger.debug("jtbd_matrix_generated", levels=len(matrix))
    return matrix
