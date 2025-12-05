"""
VITAL AI Engine Monitoring Module

Provides observability for:
- LLM call tracing (Langfuse)
- Performance metrics (Prometheus)
- Clinical safety monitoring
- Model drift detection
- Fairness auditing
"""

from .langfuse_monitor import (
    LangfuseMonitor,
    get_langfuse_monitor,
    trace_llm_call,
    trace_agent_call,
)

__all__ = [
    "LangfuseMonitor",
    "get_langfuse_monitor",
    "trace_llm_call",
    "trace_agent_call",
]
