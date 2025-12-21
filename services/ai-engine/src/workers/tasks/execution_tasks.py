"""
VITAL Path - Execution Tasks

Long-running AI workflow execution tasks.
These are dispatched when Mode 3/4 or Panel requests come in.

IMPORTANT: Uses organization_id to match production RLS policies.
"""

import logging
from typing import Dict, Any
from datetime import datetime

from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name="run_mode_3_workflow",
    max_retries=3,
    default_retry_delay=60,
    soft_time_limit=540,
    time_limit=600,
)
def run_mode_3_workflow(
    self,
    job_id: str,
    organization_id: str,
    user_id: str,
    request_data: Dict[str, Any],
    # Legacy parameter alias
    tenant_id: str = None,
) -> Dict[str, Any]:
    """
    Execute Mode 3 deep research workflow asynchronously.
    
    This task:
    1. Sets organization context
    2. Updates job status to "running"
    3. Executes the deep research workflow
    4. Stores result and updates job to "completed"
    5. Handles errors and retries
    
    Args:
        job_id: Unique job identifier
        organization_id: Organization for RLS context (matches get_current_organization_context())
        user_id: User who initiated the request
        request_data: The original ExpertRequest data
        tenant_id: DEPRECATED - use organization_id instead
    
    Returns:
        Dict with status and job_id
    """
    from core.context import set_organization_context
    from infrastructure.database.repositories.job_repo import JobRepository
    
    # Support legacy tenant_id parameter
    org_id = organization_id or tenant_id
    
    logger.info(f"Starting Mode 3 workflow for job {job_id}")
    
    # Set organization context for RLS
    set_organization_context(org_id, user_id)
    
    job_repo = JobRepository()
    
    try:
        # Update job status to running
        job_repo.update_status(job_id, "running", progress={
            "currentStep": 1,
            "totalSteps": 5,
            "currentStepDescription": "Initializing deep research...",
        })
        
        # Execute the actual workflow
        # TODO: Import and run the actual Mode 3 workflow
        # from modules.expert.modes.mode_3_deep_research import Mode3DeepResearch
        # mode_3 = Mode3DeepResearch()
        # result = mode_3.execute(request_data)
        
        # Placeholder for actual implementation
        result = {
            "status": "completed",
            "message": f"Mode 3 workflow completed for job {job_id}",
            "content": "Deep research results would go here...",
            "citations": [],
            "thinking": [],
        }
        
        # Store result and mark complete
        job_repo.complete(job_id, result)
        
        logger.info(f"Mode 3 workflow completed for job {job_id}")
        return {"status": "completed", "job_id": job_id}
        
    except SoftTimeLimitExceeded:
        logger.warning(f"Mode 3 workflow soft timeout for job {job_id}")
        job_repo.fail(job_id, "Workflow exceeded time limit", is_retryable=True)
        raise self.retry(countdown=60)
        
    except Exception as e:
        logger.exception(f"Mode 3 workflow failed for job {job_id}: {str(e)}")
        job_repo.fail(job_id, str(e), is_retryable=True)
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    name="run_mode_4_workflow",
    max_retries=2,
    default_retry_delay=120,
    soft_time_limit=540,
    time_limit=600,
)
def run_mode_4_workflow(
    self,
    job_id: str,
    organization_id: str,
    user_id: str,
    request_data: Dict[str, Any],
    # Legacy parameter alias
    tenant_id: str = None,
) -> Dict[str, Any]:
    """
    Execute Mode 4 full autonomous workflow asynchronously.
    
    Mode 4 workflows can take 5+ minutes and have full tool access.
    They may spawn sub-agents and iterate multiple times.
    """
    from core.context import set_organization_context
    from infrastructure.database.repositories.job_repo import JobRepository
    
    org_id = organization_id or tenant_id
    
    logger.info(f"Starting Mode 4 autonomous workflow for job {job_id}")
    
    set_organization_context(org_id, user_id)
    job_repo = JobRepository()
    
    try:
        job_repo.update_status(job_id, "running", progress={
            "currentStep": 1,
            "totalSteps": 10,
            "currentStepDescription": "Initializing autonomous agent...",
        })
        
        # TODO: Implement Mode 4 workflow
        result = {
            "status": "completed",
            "message": f"Mode 4 workflow completed for job {job_id}",
            "content": "Autonomous research results would go here...",
            "artifacts": [],
            "tool_calls": [],
        }
        
        job_repo.complete(job_id, result)
        
        logger.info(f"Mode 4 workflow completed for job {job_id}")
        return {"status": "completed", "job_id": job_id}
        
    except SoftTimeLimitExceeded:
        logger.warning(f"Mode 4 workflow soft timeout for job {job_id}")
        job_repo.fail(job_id, "Autonomous workflow exceeded time limit", is_retryable=False)
        raise
        
    except Exception as e:
        logger.exception(f"Mode 4 workflow failed for job {job_id}: {str(e)}")
        job_repo.fail(job_id, str(e), is_retryable=True)
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    name="run_panel_simulation",
    max_retries=2,
    default_retry_delay=60,
    soft_time_limit=300,
    time_limit=360,
)
def run_panel_simulation(
    self,
    job_id: str,
    organization_id: str,
    user_id: str,
    panel_config: Dict[str, Any],
    query: str,
    # Legacy parameter alias
    tenant_id: str = None,
) -> Dict[str, Any]:
    """
    Execute a multi-agent panel simulation asynchronously.
    
    Panel simulations involve 3-7 expert agents deliberating
    and reaching consensus on a query.
    """
    from core.context import set_organization_context
    from infrastructure.database.repositories.job_repo import JobRepository
    
    org_id = organization_id or tenant_id
    
    logger.info(f"Starting panel simulation for job {job_id}")
    
    set_organization_context(org_id, user_id)
    job_repo = JobRepository()
    
    try:
        job_repo.update_status(job_id, "running", progress={
            "currentStep": 1,
            "totalSteps": 4,
            "currentStepDescription": "Assembling expert panel...",
        })
        
        # TODO: Implement panel simulation
        result = {
            "status": "completed",
            "consensus": "Panel consensus would go here...",
            "individual_responses": [],
            "voting_record": {},
            "confidence_score": 0.85,
        }
        
        job_repo.complete(job_id, result)
        
        logger.info(f"Panel simulation completed for job {job_id}")
        return {"status": "completed", "job_id": job_id}
        
    except Exception as e:
        logger.exception(f"Panel simulation failed for job {job_id}: {str(e)}")
        job_repo.fail(job_id, str(e), is_retryable=True)
        raise self.retry(exc=e)


@shared_task(
    bind=True,
    name="execute_workflow",
    max_retries=2,
    soft_time_limit=540,
    time_limit=600,
)
def execute_workflow(
    self,
    job_id: str,
    organization_id: str,
    user_id: str,
    workflow_id: str,
    input_data: Dict[str, Any],
    # Legacy parameter alias
    tenant_id: str = None,
) -> Dict[str, Any]:
    """
    Execute a compiled LangGraph workflow asynchronously.
    
    This is used for custom workflows created in the Visual Designer.
    """
    from core.context import set_organization_context
    from infrastructure.database.repositories.job_repo import JobRepository
    from infrastructure.database.repositories.workflow_repo import WorkflowRepository
    from modules.translator import WorkflowCompiler
    
    org_id = organization_id or tenant_id
    
    logger.info(f"Starting workflow execution for job {job_id}, workflow {workflow_id}")
    
    set_organization_context(org_id, user_id)
    job_repo = JobRepository()
    
    try:
        job_repo.update_status(job_id, "running", progress={
            "currentStep": 1,
            "totalSteps": 3,
            "currentStepDescription": "Loading workflow...",
        })
        
        # Load workflow definition
        workflow_repo = WorkflowRepository()
        workflow = workflow_repo.get(workflow_id)
        
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Compile to LangGraph
        job_repo.update_status(job_id, "running", progress={
            "currentStep": 2,
            "totalSteps": 3,
            "currentStepDescription": "Compiling workflow...",
        })
        
        compiler = WorkflowCompiler()
        compilation = compiler.compile(workflow.definition)
        
        if not compilation.success:
            raise ValueError(f"Workflow compilation failed: {compilation.error}")
        
        # Execute
        job_repo.update_status(job_id, "running", progress={
            "currentStep": 3,
            "totalSteps": 3,
            "currentStepDescription": "Executing workflow...",
        })
        
        # TODO: Execute the compiled graph
        # result = await compilation.compiled.ainvoke(input_data)
        
        result = {
            "status": "completed",
            "output": "Workflow execution result would go here...",
        }
        
        job_repo.complete(job_id, result)
        
        logger.info(f"Workflow execution completed for job {job_id}")
        return {"status": "completed", "job_id": job_id}
        
    except Exception as e:
        logger.exception(f"Workflow execution failed for job {job_id}: {str(e)}")
        job_repo.fail(job_id, str(e), is_retryable=False)
        raise



















