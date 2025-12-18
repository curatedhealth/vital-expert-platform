"""
L4 Data Processor - formatting/chunking/artifact generation (stateless).

Architecture Pattern:
- PostgreSQL tools table: Worker-specific config (model, temperature, max_tokens)
- Environment variables: L4_LLM_MODEL, L4_LLM_TEMPERATURE, L4_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values
"""

from typing import Any, Dict, List
from .l4_base import L4BaseWorker, WorkerConfig, WorkerCategory


class L4DataProcessor(L4BaseWorker):
    """L4 Worker for data processing tasks - uses dynamic L4 config defaults."""

    def __init__(self, *_args, **_kwargs):
        # model, temperature, max_tokens inherit from L4 env defaults via WorkerConfig
        super().__init__(
            WorkerConfig(
                id="L4-DP",
                name="Data Processor",
                description="Chunk, format, and assemble artifacts.",
                category=WorkerCategory.DATA_PROCESSING,
                # model, temperature, max_tokens inherit from L4 env defaults
                allowed_l5_tools=["L5-FMT", "L5-VIZ", "L5-RAG"],
            )
        )

    async def _execute_task(self, task: str, params: Dict[str, Any]) -> Any:
        # Stub formatting/chunking logic; replace with real operations as needed.
        return {
            "task": task,
            "content": params.get("content") or params.get("text") or "",
            "format": params.get("format", "markdown"),
            "tools_used": ["L5-FMT"] if "format" in params else [],
        }
