"""
VITAL Path - Async Workers Layer

Handles long-running tasks that would timeout in HTTP requests:
- Mode 3/4 AI workflows (1-5+ minutes)
- Panel simulations (2-5 minutes)
- Document ingestion (variable)
- Ontology discovery (hours)

Architecture:
- Celery for task queue management
- Redis as broker
- PostgreSQL for result storage (job tracking)

Usage:
    # Dispatch a task
    from workers.tasks.execution_tasks import run_mode_3_workflow
    run_mode_3_workflow.delay(job_id, tenant_id, user_id, request_data)
    
    # Check job status
    from infrastructure.database.repositories.job_repo import JobRepository
    job = job_repo.get(job_id)
"""

from .config import celery_app

__all__ = ["celery_app"]










