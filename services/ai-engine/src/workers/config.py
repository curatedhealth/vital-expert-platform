"""
VITAL Path - Celery Worker Configuration

Configures Celery for async task processing.
Uses Redis as broker and PostgreSQL for result storage.
"""

import os
from celery import Celery
from kombu import Queue

# Get configuration from environment
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/vital")

# Create Celery application
celery_app = Celery(
    "vital_workers",
    broker=REDIS_URL,
    backend=f"db+postgresql://{DATABASE_URL.replace('postgresql://', '')}",
)

# Celery configuration
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    
    # Timezone
    timezone="UTC",
    enable_utc=True,
    
    # Task routing - different queues for different task types
    task_queues=(
        Queue("default", routing_key="default"),
        Queue("execution", routing_key="execution.#"),
        Queue("ingestion", routing_key="ingestion.#"),
        Queue("discovery", routing_key="discovery.#"),
        Queue("cleanup", routing_key="cleanup.#"),
    ),
    
    task_routes={
        "workers.tasks.execution_tasks.*": {"queue": "execution"},
        "workers.tasks.ingestion_tasks.*": {"queue": "ingestion"},
        "workers.tasks.discovery_tasks.*": {"queue": "discovery"},
        "workers.tasks.cleanup_tasks.*": {"queue": "cleanup"},
    },
    
    # Task execution limits
    task_time_limit=600,  # Hard limit: 10 minutes
    task_soft_time_limit=540,  # Soft limit: 9 minutes (allows cleanup)
    
    # Retry policy
    task_default_retry_delay=60,  # 1 minute between retries
    task_max_retries=3,
    
    # Concurrency
    worker_concurrency=4,  # Number of worker processes
    worker_prefetch_multiplier=1,  # Prefetch one task at a time (for long tasks)
    
    # Result expiration
    result_expires=86400,  # 24 hours
    
    # Task acknowledgment
    task_acks_late=True,  # Acknowledge after task completes (safer)
    task_reject_on_worker_lost=True,  # Requeue if worker dies
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Import tasks to register them
celery_app.autodiscover_tasks([
    "workers.tasks.execution_tasks",
    "workers.tasks.ingestion_tasks",
    "workers.tasks.discovery_tasks",
    "workers.tasks.cleanup_tasks",
])






