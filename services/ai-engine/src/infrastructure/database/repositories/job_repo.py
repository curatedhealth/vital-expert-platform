"""
VITAL Path - Job Repository

Data access for async job tracking.
Jobs are used for long-running operations (Mode 3/4, Panels, etc.)

IMPORTANT: Uses organization_id to match production RLS policies.
"""

import logging
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field
from uuid import uuid4

logger = logging.getLogger(__name__)


@dataclass
class Job:
    """Job entity representing an async task."""
    id: str
    organization_id: str  # Matches RLS (was tenant_id)
    user_id: str
    job_type: str  # mode_3_workflow, mode_4_workflow, panel_simulation, etc.
    status: str  # pending, running, completed, failed, cancelled
    created_at: datetime
    updated_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    is_retryable: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def tenant_id(self) -> str:
        """DEPRECATED: Use organization_id instead."""
        return self.organization_id


class JobRepository:
    """
    Repository for async job management.
    
    Provides CRUD operations and queries for jobs.
    """
    
    # In-memory store for development (replace with actual DB)
    _jobs: Dict[str, Job] = {}
    
    async def create(
        self,
        organization_id: str,
        user_id: str,
        job_type: str,
        metadata: Dict[str, Any] = None,
        job_id: str = None,
        input_data: Dict[str, Any] = None,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> Job:
        """
        Create a new job in pending status.
        
        Args:
            organization_id: Organization for the job (matches RLS)
            user_id: User who initiated the job
            job_type: Type of job (for routing)
            metadata: Additional job metadata
            job_id: Optional job ID (auto-generated if not provided)
            input_data: Optional input data for the job
            tenant_id: DEPRECATED - use organization_id instead
        
        Returns:
            Created job with generated ID
        """
        # Support legacy tenant_id parameter
        org_id = organization_id or tenant_id
        
        job_id = job_id or str(uuid4())
        now = datetime.utcnow()
        
        # Merge input_data into metadata if provided
        job_metadata = metadata or {}
        if input_data:
            job_metadata["input"] = input_data
        
        job = Job(
            id=job_id,
            organization_id=org_id,
            user_id=user_id,
            job_type=job_type,
            status="pending",
            created_at=now,
            metadata=job_metadata,
        )
        
        # TODO: Replace with actual database insert
        # await self._db.execute(
        #     """
        #     INSERT INTO jobs (id, organization_id, user_id, job_type, status, created_at, metadata)
        #     VALUES ($1, $2, $3, $4, $5, $6, $7)
        #     """,
        #     job_id, org_id, user_id, job_type, "pending", now, job_metadata
        # )
        
        self._jobs[job_id] = job
        logger.info(f"Created job {job_id} for organization {org_id}")
        
        return job
    
    async def get(self, job_id: str) -> Optional[Job]:
        """
        Get a job by ID.
        
        Args:
            job_id: The job ID
        
        Returns:
            Job if found, None otherwise
        """
        # TODO: Replace with actual database query
        # row = await self._db.fetchone(
        #     "SELECT * FROM jobs WHERE id = $1",
        #     job_id
        # )
        # if row:
        #     return Job(**row)
        # return None
        
        return self._jobs.get(job_id)
    
    async def update_status(
        self,
        job_id: str,
        status: str,
        progress: Dict[str, Any] = None,
    ) -> None:
        """
        Update job status and progress.
        
        Args:
            job_id: The job ID
            status: New status
            progress: Optional progress information
        """
        now = datetime.utcnow()
        
        # TODO: Replace with actual database update
        # await self._db.execute(
        #     """
        #     UPDATE jobs
        #     SET status = $2, progress = $3, updated_at = $4,
        #         started_at = CASE WHEN status = 'pending' AND $2 = 'running'
        #                      THEN $4 ELSE started_at END
        #     WHERE id = $1
        #     """,
        #     job_id, status, progress, now
        # )
        
        job = self._jobs.get(job_id)
        if job:
            if job.status == "pending" and status == "running":
                job.started_at = now
            job.status = status
            job.updated_at = now
            if progress:
                job.progress = progress
        
        logger.info(f"Updated job {job_id} status to {status}")
    
    async def complete(
        self,
        job_id: str,
        result: Dict[str, Any],
    ) -> None:
        """
        Mark job as completed with result.
        
        Args:
            job_id: The job ID
            result: Job result data
        """
        now = datetime.utcnow()
        
        # TODO: Replace with actual database update
        # await self._db.execute(
        #     """
        #     UPDATE jobs
        #     SET status = 'completed', result = $2, completed_at = $3, updated_at = $3
        #     WHERE id = $1
        #     """,
        #     job_id, result, now
        # )
        
        job = self._jobs.get(job_id)
        if job:
            job.status = "completed"
            job.result = result
            job.completed_at = now
            job.updated_at = now
        
        logger.info(f"Completed job {job_id}")
    
    async def fail(
        self,
        job_id: str,
        error_message: str,
        is_retryable: bool = False,
    ) -> None:
        """
        Mark job as failed with error.
        
        Args:
            job_id: The job ID
            error_message: Error description
            is_retryable: Whether the job can be retried
        """
        now = datetime.utcnow()
        
        # TODO: Replace with actual database update
        
        job = self._jobs.get(job_id)
        if job:
            job.status = "failed"
            job.error_message = error_message
            job.is_retryable = is_retryable
            job.completed_at = now
            job.updated_at = now
        
        logger.error(f"Job {job_id} failed: {error_message}")
    
    async def cancel(self, job_id: str) -> None:
        """
        Cancel a job.
        
        Args:
            job_id: The job ID
        """
        now = datetime.utcnow()
        
        # TODO: Replace with actual database update
        
        job = self._jobs.get(job_id)
        if job:
            job.status = "cancelled"
            job.completed_at = now
            job.updated_at = now
        
        logger.info(f"Cancelled job {job_id}")
    
    async def list_for_user(
        self,
        user_id: str,
        organization_id: str,
        status: Optional[str] = None,
        job_type: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> Tuple[List[Job], int]:
        """
        List jobs for a user with optional filters.
        
        Args:
            user_id: User ID
            organization_id: Organization ID (matches RLS)
            status: Optional status filter
            job_type: Optional job type filter
            limit: Number of jobs to return
            offset: Number of jobs to skip
            tenant_id: DEPRECATED - use organization_id instead
        
        Returns:
            Tuple of (jobs list, total count)
        """
        # Support legacy tenant_id parameter
        org_id = organization_id or tenant_id
        
        # TODO: Replace with actual database query
        # query = """
        #     SELECT * FROM jobs
        #     WHERE user_id = $1 AND organization_id = $2
        # """
        # params = [user_id, org_id]
        #
        # if status:
        #     query += " AND status = $3"
        #     params.append(status)
        #
        # query += " ORDER BY created_at DESC LIMIT $4 OFFSET $5"
        # params.extend([limit, offset])
        #
        # rows = await self._db.fetch(query, *params)
        # total = await self._db.fetchval(count_query, *count_params)
        # return [Job(**row) for row in rows], total
        
        # In-memory implementation
        jobs = [
            j for j in self._jobs.values()
            if j.user_id == user_id and j.organization_id == org_id
        ]
        
        if status:
            jobs = [j for j in jobs if j.status == status]
        
        if job_type:
            jobs = [j for j in jobs if j.job_type == job_type]
        
        # Sort by created_at descending
        jobs.sort(key=lambda j: j.created_at, reverse=True)
        
        total = len(jobs)
        jobs = jobs[offset:offset + limit]
        
        return jobs, total
    
    async def get_pending_for_organization(
        self,
        organization_id: str,
        job_type: Optional[str] = None,
        # Legacy parameter alias
        tenant_id: str = None,
    ) -> List[Job]:
        """
        Get pending jobs for an organization (for workers to pick up).
        
        Args:
            organization_id: Organization ID (matches RLS)
            job_type: Optional job type filter
            tenant_id: DEPRECATED - use organization_id instead
        
        Returns:
            List of pending jobs
        """
        # Support legacy tenant_id parameter
        org_id = organization_id or tenant_id
        
        # TODO: Replace with actual database query
        
        jobs = [
            j for j in self._jobs.values()
            if j.organization_id == org_id and j.status == "pending"
        ]
        
        if job_type:
            jobs = [j for j in jobs if j.job_type == job_type]
        
        return jobs
    
    # Legacy alias
    async def get_pending_for_tenant(
        self,
        tenant_id: str,
        job_type: Optional[str] = None,
    ) -> List[Job]:
        """DEPRECATED: Use get_pending_for_organization instead."""
        return await self.get_pending_for_organization(tenant_id, job_type)


