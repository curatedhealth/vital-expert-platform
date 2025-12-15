"""
Compatibility shim for legacy imports expecting `api.main.app`.

Exports the FastAPI app defined in the repository root `main.py`.
"""

# Import the root app directly (pythonpath includes src)
from main import app  # type: ignore

__all__ = ["app"]
