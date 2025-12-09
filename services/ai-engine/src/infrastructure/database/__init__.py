"""
VITAL Path - Database Infrastructure

PostgreSQL/Supabase database integration:
- Connection management
- Repositories (data access)
- Query builders
"""

from .repositories import JobRepository

__all__ = [
    "JobRepository",
]


