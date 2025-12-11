from __future__ import annotations

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from services.deepagents_tools import VirtualFilesystem
from services.runner_registry import runner_registry
from .registry import get_l4_class
from .l5_tool_mapper import get_l5_executor, L5ExecutionSummary

logger = logging.getLogger(__name__)
_fs = VirtualFilesystem()


@dataclass
class L4WorkerResult:
    worker_type: str
    worker_class: str
    task: str
    output: str
    summary: str
    evidence: List[Dict] = field(default_factory=list)
    sources: List[Dict] = field(default_factory=list)
    citations: List[Dict] = field(default_factory=list)
    data_retrieved: Dict = field(default_factory=dict)
    l5_tools_called: List[str] = field(default_factory=list)
    l5_results: List[Dict] = field(default_factory=list)
    tool_calls: List[Dict] = field(default_factory=list)
    tokens_used: int = 0
    cost_usd: float = 0.0
    l5_cost_usd: float = 0.0
    execution_time_ms: int = 0
    runners_used: List[str] = field(default_factory=list)
    detail_path: Optional[str] = None
    success: bool = True
    error: Optional[str] = None
    confidence_score: float = 0.8


async def delegate_to_l4(
    *,
    worker_code: str,
    task: str,
    context: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    """
    Wrapper for L4 workers with real L5 tool execution and cost rollup.
    """
    logger.info("modes34_delegate_to_l4 worker=%s task=%s", worker_code, task)
    context = context or {}
    runner = _pick_runner(worker_code, stage=context.get("stage"))
    runner_codes = [runner.get("run_code")] if runner else []
    plan_tools = context.get("plan_tools") or []

    # Execute L5 tools first
    l5_exec = get_l5_executor()
    l5_summary = L5ExecutionSummary()
    if runner_codes:
        l5_summary = await l5_exec.execute_for_runner(runner_code=runner_codes[0], query=task, params=context)
    if plan_tools:
        l5_plan_summary = await l5_exec.execute_for_plan_tools(plan_tools=plan_tools, query=task, params=context)
        _merge_summaries(l5_summary, l5_plan_summary)

    # Resolve worker
    worker_cls = get_l4_class(worker_code)
    if worker_cls is None:
        raise RuntimeError(f"L4 worker not found for code: {worker_code}")
    worker = worker_cls()

    # Inject L5 evidence into context
    exec_context = {
        **context,
        "runner": runner,
        "l5_evidence": l5_summary.combined_output,
        "l5_sources": l5_summary.all_sources,
        "l5_data": l5_summary.raw_results,
    }
    start_time = datetime.utcnow()
    worker_result = await worker.execute(task=task, params={"goal": task, "runner": runner}, context=exec_context)
    exec_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

    summary_text = str(worker_result.get("output") or worker_result.get("analysis") or "")
    tools_used = l5_summary.raw_results
    token_usage = worker_result.get("token_usage") or {}
    citations = worker_result.get("citations", [])
    sources = worker_result.get("sources", []) + l5_summary.all_sources
    cost_usd = l5_summary.total_cost_usd + float(worker_result.get("cost") or 0.0)
    tokens_used = token_usage.get("total_tokens") or worker_result.get("tokens") or 0

    # World-class output: preserve full content for comprehensive research reports
    # Previous limits (500/2000 chars) produced truncated 2-3 paragraph outputs
    # New limits: 16000 chars for artifacts (~4000 words), 8000 for summaries (~2000 words)
    MAX_ARTIFACT_CHARS = 16000  # Full research report capacity
    MAX_SUMMARY_CHARS = 8000   # Comprehensive summary capacity

    content = "\n".join(
        [
            f"# L4 Worker Analysis: {worker_code}",
            "",
            "## Research Task",
            task,
            "",
            "## Execution Context",
            str(context or {}),
            "",
            "## Evidence & Findings",
            summary_text[:MAX_ARTIFACT_CHARS] if len(summary_text) <= MAX_ARTIFACT_CHARS else summary_text[:MAX_ARTIFACT_CHARS] + "\n\n[Content continues in full_output field]",
        ]
    )

    artifact = await _fs.write_file(
        session_id=uuid4(),
        path=f"missions/modes34/l4/{worker_code}.md",
        content=content,
    )

    return {
        "summary": summary_text[:MAX_SUMMARY_CHARS] or f"{worker_code} produced no output.",
        "full_output": summary_text,  # Always preserve complete output
        "artifact_path": artifact.get("path") if artifact else None,
        "citations": citations,
        "sources": sources,
        "runners_used": runner_codes,
        "runner": runner,
        "token_usage": token_usage,
        "tools_used": tools_used,
        "cost": cost_usd,
        "duration_ms": exec_ms,
    }


def _merge_summaries(target: L5ExecutionSummary, source: L5ExecutionSummary) -> None:
    for slug in source.tool_slugs_called:
        if slug not in target.tool_slugs_called:
            target.tool_slugs_called.append(slug)
    target.total_cost_usd += source.total_cost_usd
    target.total_execution_time_ms += source.total_execution_time_ms
    target.total_api_calls += source.total_api_calls
    target.success_count += source.success_count
    target.error_count += source.error_count
    target.errors.extend(source.errors)
    target.raw_results.extend(source.raw_results)
    if source.combined_output:
        if target.combined_output:
            target.combined_output += "\n\n" + source.combined_output
        else:
            target.combined_output = source.combined_output
    existing_urls = {s.get("url") for s in target.all_sources if s.get("url")}
    for s in source.all_sources:
        url = s.get("url")
        if not url or url not in existing_urls:
            target.all_sources.append(s)
            if url:
                existing_urls.add(url)


def _pick_runner(code: str, stage: str | None = None) -> Dict[str, Any] | None:
    try:
        runner = runner_registry.get(code)
        if runner:
            return runner
        return runner_registry.pick_for_stage(stage or "evidence", agent_level=4)
    except Exception as exc:
        logger.error("l4_runner_pick_failed", code=code, stage=stage, error=str(exc))
        return None
