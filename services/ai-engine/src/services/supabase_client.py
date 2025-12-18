"""
Redirect module for backwards compatibility.

The actual implementation is in services.shared.supabase_client.
This module re-exports everything for imports that use `from services.supabase_client import ...`
"""

from services.shared.supabase_client import (
    SupabaseClient,
    get_supabase_client,
)

__all__ = [
    "SupabaseClient",
    "get_supabase_client",
]
