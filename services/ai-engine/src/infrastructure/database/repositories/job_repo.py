"""
VITAL Path - Job Repository

Data access for async job tracking.
Jobs are used for long-running operations (Mode 3/4, Panels, etc.)

PRODUCTION VERSION: Uses PostgreSQL via Supabase for persistence.

IMPORTANT: Uses organization_id to match production RLS policies.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field
from uuid import uuid4

from services.tenant_aware_supabase import TenantAwareSupabaseClient

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

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> "Job":
        """Create Job from database row."""
        return cls(
            id=row["id"],
            organization_id=row.get("organization_id") or row.get("tenant_id", ""),
            user_id=row["user_id"],
            job_type=row["job_type"],
            status=row["status"],
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")) if isinstance(row["created_at"], str) else row["created_at"],
            updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00")) if row.get("updated_at") and isinstance(row["updated_at"], str) else row.get("updated_at"),
            started_at=datetime.fromisoformat(row["started_at"].replace("Z", "+00:00")) if row.get("started_at") and isinstance(row["started_at"], str) else row.get("started_at"),
            completed_at=datetime.fromisoformat(row["completed_at"].replace("Z", "+00:00")) if row.get("completed_at") and isinstance(row["completed_at"], str) else row.get("completed_at"),
            progress=row.get("progress"),
            result=row.get("result"),
            error_message=row.get("error_message"),
            is_retryable=row.get("is_retryable", False),
            metadata=row.get("metadata") or {},
        )


class JobRepository:
    """
    Repository for async job management.

    Provides CRUD operations and queries for jobs.
    Uses PostgreSQL via Supabase for persistence.
    """

    # Table name - uses organization_id to match RLS policies
    JOBS_TABLE = "jobs"

    def __init__(self, db_client: TenantAwareSupabaseClient):
        """
        Initialize repository with database client.

        Args:
            db_client: Tenant-aware Supabase client for database operations
        """
        self._db = db_client

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
        now = datetime.now(timezone.utc)

        # Merge input_data into metadata if provided
        job_metadata = metadata or {}
        if input_data:
            job_metadata["input"] = input_data

        data = {
            "id": job_id,
            "organization_id": org_id,
            "user_id": user_id,
            "job_type": job_type,
            "status": "pending",
            "created_at": now.isoformat(),
            "metadata": job_metadata,
        }

        # Insert via tenant-aware client
        # Note: We use organization_id directly since this table may not use tenant_id
        result = self._db._client.client.table(self.JOBS_TABLE).insert(data).execute()

        logger.info(f"Created job {job_id} for organization {org_id}")

        return Job.from_db_row(result.data[0]) if result.data else Job.from_db_row(data)

    async def get(self, job_id: str) -> Optional[Job]:
        """
        Get a job by ID.

        Args:
            job_id: The job ID

        Returns:
            Job if found, None otherwise
        """
        result = self._db._client.client.table(self.JOBS_TABLE)\
            .select("*")\
            .eq("id", job_id)\
            .execute()

        if not result.data:
            return None

        return Job.from_db_row(result.data[0])

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
        now = datetime.now(timezone.utc)

        update_data = {
            "status": status,
            "updated_at": now.isoformat(),
        }

        if progress:
            update_data["progress"] = progress

        # Check if transitioning from pending to running
        job = await self.get(job_id)
        if job and job.status == "pending" and status == "running":
            update_data["started_at"] = now.isoformat()

        self._db._client.client.table(self.JOBS_TABLE)\
            .update(update_data)\
            .eq("id", job_id)\
            .execute()

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
        now = datetime.now(timezone.utc)

        update_data = {
            "status": "completed",
            "result": result,
            "completed_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        self._db._client.client.table(self.JOBS_TABLE)\
            .update(update_data)\
            .eq("id", job_id)\
            .execute()

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
        now = datetime.now(timezone.utc)

        update_data = {
            "status": "failed",
            "error_message": error_message,
            "is_retryable": is_retryable,
            "completed_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        self._db._client.client.table(self.JOBS_TABLE)\
            .update(update_data)\
            .eq("id", job_id)\
            .execute()

        logger.error(f"Job {job_id} failed: {error_message}")

    async def cancel(self, job_id: str) -> None:
        """
        Cancel a job.

        Args:
            job_id: The job ID
        """
        now = datetime.now(timezone.utc)

        update_data = {
            "status": "cancelled",
            "completed_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }

        self._db._client.client.table(self.JOBS_TABLE)\
            .update(update_data)\
            .eq("id", job_id)\
            .execute()

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

        # Build base query for count
        count_query = self._db._client.client.table(self.JOBS_TABLE)\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .eq("organization_id", org_id)

        if status:
            count_query = count_query.eq("status", status)

        if job_type:
            count_query = count_query.eq("job_type", job_type)

        count_result = count_query.execute()
        total = count_result.count if hasattr(count_result, 'count') else len(count_result.data or [])

        # Build query for data
        data_query = self._db._client.client.table(self.JOBS_TABLE)\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("organization_id", org_id)

        if status:
            data_query = data_query.eq("status", status)

        if job_type:
            data_query = data_query.eq("job_type", job_type)

        data_query = data_query.order("created_at", desc=True)
        data_query = data_query.range(offset, offset + limit - 1)

        result = data_query.execute()

        jobs = [Job.from_db_row(row) for row in (result.data or [])]

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

        query = self._db._client.client.table(self.JOBS_TABLE)\
            .select("*")\
            .eq("organization_id", org_id)\
            .eq("status", "pending")

        if job_type:
            query = query.eq("job_type", job_type)

        query = query.order("created_at", desc=False)  # FIFO for pending jobs

        result = query.execute()

        return [Job.from_db_row(row) for row in (result.data or [])]

    # Legacy alias
    async def get_pending_for_tenant(
        self,
        tenant_id: str,
        job_type: Optional[str] = None,
    ) -> List[Job]:
        """DEPRECATED: Use get_pending_for_organization instead."""
        return await self.get_pending_for_organization(tenant_id, job_type)


# Factory function for dependency injection
def create_job_repository(db_client: TenantAwareSupabaseClient) -> JobRepository:
    """
    Create a JobRepository instance.

    Args:
        db_client: Tenant-aware Supabase client

    Returns:
        JobRepository instance
    """
    return JobRepository(db_client)




