"""
Lightweight factory for mission-critical L4 workers used by Ask Expert missions.

These are thin wrappers that align with the Mission Runner contract:
- execute(task, params, context) -> dict with output/citations/tools_used
- deterministic and stateless; rely on L5 tools for evidence
"""

from typing import Any, Dict, List


class _BaseSimpleWorker:
    worker_id: str
    allowed_tools: List[str]

    def __init__(self):
        self.tools_used: List[str] = []

    async def execute(self, task: str, params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        # In production, this would orchestrate L5 tool calls; here we return structured output.
        requested_tools = params.get("tools", [])
        tools_used = [t for t in requested_tools if t in self.allowed_tools] or self.allowed_tools
        self.tools_used = tools_used

        return {
            "output": f"{self.worker_id} executed task: {task}",
            "citations": [],
            "tools_used": tools_used,
        }


class L4DataExtractor(_BaseSimpleWorker):
    worker_id = "L4-DE"
    allowed_tools = ["L5-PM", "L5-CT", "L5-OPENFDA", "L5-RAG", "L5-WEB"]


class L4PatternMatcher(_BaseSimpleWorker):
    worker_id = "L4-PM"
    allowed_tools = ["L5-RAG", "L5-WEB"]


class L4GapDetector(_BaseSimpleWorker):
    worker_id = "L4-GD"
    allowed_tools = ["L5-RAG"]


class L4ComparitiveSynthesizer(_BaseSimpleWorker):
    worker_id = "L4-CS"
    allowed_tools = ["L5-FMT", "L5-VIZ"]


class WorkerFactory:
    _WORKERS = {
        "L4-DE": L4DataExtractor,
        "L4-PM": L4PatternMatcher,
        "L4-GD": L4GapDetector,
        "L4-CS": L4ComparitiveSynthesizer,
    }

    @classmethod
    def get_worker(cls, worker_id: str):
        if worker_id not in cls._WORKERS:
            raise ValueError(f"Unknown L4 worker: {worker_id}")
        return cls._WORKERS[worker_id]
