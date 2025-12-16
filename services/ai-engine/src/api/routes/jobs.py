# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [core.context, infrastructure.database.repositories.job_repo]
"""
VITAL Path - Jobs API Routes

Endpoints for async job management:
- Check job status
- Get job result
- Cancel job
- List user's jobs
"""

import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from core.context import get_request_context
from infrastructure.database.repositories.job_repo import JobRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


# Response models
class JobProgress(BaseModel):
    """Progress information for a running job."""
    current_step: int = Field(alias="currentStep")
    total_steps: Optional[int] = Field(None, alias="totalSteps")
    current_step_description: Optional[str] = Field(None, alias="currentStepDescription")
    percent_complete: Optional[float] = Field(None, alias="percentComplete")


class JobStatusResponse(BaseModel):
    """Response for job status check."""
    job_id: str = Field(alias="jobId")
    status: str  # pending, running, completed, failed, cancelled
    created_at: datetime = Field(alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    started_at: Optional[datetime] = Field(None, alias="startedAt")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    progress: Optional[JobProgress] = None
    error: Optional[str] = None
    is_retryable: bool = Field(False, alias="isRetryable")
    
    class Config:
        populate_by_name = True


class JobResultResponse(BaseModel):
    """Response for job result retrieval."""
    job_id: str = Field(alias="jobId")
    status: str
    result: Optional[dict] = None
    error: Optional[str] = None
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    
    class Config:
        populate_by_name = True


class JobListItem(BaseModel):
    """Job summary for list responses."""
    job_id: str = Field(alias="jobId")
    job_type: str = Field(alias="jobType")
    status: str
    created_at: datetime = Field(alias="createdAt")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    
    class Config:
        populate_by_name = True


class JobListResponse(BaseModel):
    """Response for job list endpoint."""
    jobs: List[JobListItem]
    total: int
    has_more: bool = Field(alias="hasMore")
    
    class Config:
        populate_by_name = True


# Dependency to get job repository
def get_job_repo() -> JobRepository:
    """Get JobRepository instance."""
    return JobRepository()


@router.get("/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    job_repo: JobRepository = Depends(get_job_repo),
) -> JobStatusResponse:
    """
    Get the current status of an async job.
    
    Returns:
        Job status including progress information if running.
    
    Raises:
        404: Job not found or not accessible
    """
    context = get_request_context()
    
    if not context:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    job = await job_repo.get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify access (user can only see their own jobs)
    if job.user_id != context.user_id and not context.is_admin:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Build progress if available
    progress = None
    if job.progress:
        progress = JobProgress(
            currentStep=job.progress.get("currentStep", 0),
            totalSteps=job.progress.get("totalSteps"),
            currentStepDescription=job.progress.get("currentStepDescription"),
            percentComplete=job.progress.get("percentComplete"),
        )
    
    return JobStatusResponse(
        jobId=job.id,
        status=job.status,
        createdAt=job.created_at,
        updatedAt=job.updated_at,
        startedAt=job.started_at,
        completedAt=job.completed_at,
        progress=progress,
        error=job.error_message,
        isRetryable=job.is_retryable,
    )


@router.get("/{job_id}/result", response_model=JobResultResponse)
async def get_job_result(
    job_id: str,
    job_repo: JobRepository = Depends(get_job_repo),
) -> JobResultResponse:
    """
    Get the result of a completed job.
    
    Returns:
        Job result if completed, or current status if still running.
    
    Raises:
        404: Job not found or not accessible
    """
    context = get_request_context()
    
    if not context:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    job = await job_repo.get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify access
    if job.user_id != context.user_id and not context.is_admin:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobResultResponse(
        jobId=job.id,
        status=job.status,
        result=job.result if job.status == "completed" else None,
        error=job.error_message if job.status == "failed" else None,
        completedAt=job.completed_at,
    )


@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    job_repo: JobRepository = Depends(get_job_repo),
) -> dict:
    """
    Cancel a pending or running job.
    
    Returns:
        Confirmation of cancellation request.
    
    Raises:
        404: Job not found
        400: Job already completed or cannot be cancelled
    """
    context = get_request_context()
    
    if not context:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    job = await job_repo.get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify access
    if job.user_id != context.user_id and not context.is_admin:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if cancellable
    if job.status in ["completed", "failed", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail=f"Job cannot be cancelled (status: {job.status})"
        )
    
    # Request cancellation
    await job_repo.cancel(job_id)
    
    logger.info(f"Job {job_id} cancellation requested by user {context.user_id}")
    
    return {
        "message": "Cancellation requested",
        "job_id": job_id,
    }


@router.get("", response_model=JobListResponse)
async def list_jobs(
    status: Optional[str] = Query(None, description="Filter by status"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    limit: int = Query(20, ge=1, le=100, description="Number of jobs to return"),
    offset: int = Query(0, ge=0, description="Number of jobs to skip"),
    job_repo: JobRepository = Depends(get_job_repo),
) -> JobListResponse:
    """
    List jobs for the current user.
    
    Args:
        status: Filter by job status (pending, running, completed, failed)
        job_type: Filter by job type
        limit: Number of jobs to return (max 100)
        offset: Number of jobs to skip for pagination
    
    Returns:
        List of jobs with pagination info.
    """
    context = get_request_context()
    
    if not context:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get jobs for user
    jobs, total = await job_repo.list_for_user(
        user_id=context.user_id,
        tenant_id=context.tenant_id,
        status=status,
        job_type=job_type,
        limit=limit,
        offset=offset,
    )
    
    job_items = [
        JobListItem(
            jobId=j.id,
            jobType=j.job_type,
            status=j.status,
            createdAt=j.created_at,
            completedAt=j.completed_at,
        )
        for j in jobs
    ]
    
    return JobListResponse(
        jobs=job_items,
        total=total,
        hasMore=(offset + len(jobs)) < total,
    )


# Export router
jobs_router = router










