"""
Observability package for VITAL AI Engine.

Provides LLM observability and distributed tracing via LangFuse.
"""

from vital_shared.observability.langfuse_tracer import (
    LangfuseTracer,
    get_langfuse_tracer,
)

__all__ = [
    "LangfuseTracer",
    "get_langfuse_tracer",
]

