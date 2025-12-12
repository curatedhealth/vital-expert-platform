from __future__ import annotations

from typing import Any, Dict
from uuid import uuid4
import structlog

from services.deepagents_tools import VirtualFilesystem
from .utils import make_config
from services.runner_registry import runner_registry
from .registry import get_l3_class
from .l5_tool_mapper import get_l5_executor, L5ExecutionSummary

logger = structlog.get_logger()
_fs = VirtualFilesystem()


async def delegate_to_l3(
    *,
    specialist_code: str,
    task: str,
    context: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    """
    Wrapper for L3 specialists.
    """
    logger.info("modes34_delegate_to_l3", specialist_code=specialist_code, task=task)

    specialist_cls = get_l3_class(specialist_code)
    if specialist_cls is None:
        raise RuntimeError(f"L3 specialist not found for code: {specialist_code}")

    expert = specialist_cls(
        make_config(
            specialist_code,
            "You are an L3 specialist. Provide concise, evidence-aware output.",
        )
    )
    runner = _pick_runner(specialist_code, stage=(context or {}).get("stage"))
    exec_context = {**(context or {}), "runner": runner} if runner else (context or {})

    # Execute L5 tools (runner + plan tools)
    # Phase 2: Use database-driven agent tools when agent_id is available
    l5_exec = get_l5_executor()
    l5_summary: L5ExecutionSummary = L5ExecutionSummary()
    agent_id = (context or {}).get("agent_id")
    plan_tools = context.get("plan_tools") if context else None

    if agent_id:
        # Database-driven: use agent_tool_assignments table
        logger.info("l3_using_agent_tools", agent_id=agent_id[:8], specialist_code=specialist_code)
        l5_summary = await l5_exec.execute_for_agent(
            agent_id=agent_id,
            query=task,
            params=exec_context,
            tool_filter=plan_tools,  # Apply plan_tools as filter
        )
    else:
        # Legacy: use runner code mapping
        runner_code = runner.get("run_code") if runner else None
        if runner_code:
            l5_summary = await l5_exec.execute_for_runner(runner_code=runner_code, query=task, params=exec_context)
        if plan_tools:
            l5_plan_summary = await l5_exec.execute_for_plan_tools(plan_tools=plan_tools, query=task, params=exec_context)
            for slug in l5_plan_summary.tool_slugs_called:
                if slug not in l5_summary.tool_slugs_called:
                    l5_summary.tool_slugs_called.append(slug)
            l5_summary.total_cost_usd += l5_plan_summary.total_cost_usd
            l5_summary.total_execution_time_ms += l5_plan_summary.total_execution_time_ms
            l5_summary.total_api_calls += l5_plan_summary.total_api_calls
            l5_summary.all_sources.extend(l5_plan_summary.all_sources)
            l5_summary.raw_results.extend(l5_plan_summary.raw_results)

    try:
        result = await expert.execute(task=task, params={"query": task, "runner": runner}, context=exec_context)
    except Exception as exc:
        logger.error(
            "l3_specialist_execution_failed",
            specialist_code=specialist_code,
            error=str(exc),
            error_type=type(exc).__name__,
            task_preview=task[:120],
            exc_info=True,
        )
        raise
    summary = str(result.get("output") or result.get("analysis") or "")
    tools_used = result.get("tools_used") or result.get("tool_calls") or []
    if not tools_used and l5_summary.raw_results:
        tools_used = l5_summary.raw_results
    token_usage = result.get("token_usage") or {}
    tokens_used = token_usage.get("total_tokens") or result.get("tokens") or 0
    total_cost = float(result.get("cost") or 0.0) + l5_summary.total_cost_usd
    if tokens_used and not result.get("cost"):
        total_cost += float(tokens_used) * 0.000002

    # World-class output: preserve full content for comprehensive research reports
    # Previous limits (500/2000 chars) produced truncated 2-3 paragraph outputs
    # New limits: 16000 chars for artifacts (~4000 words), 8000 for summaries (~2000 words)
    MAX_ARTIFACT_CHARS = 16000  # Full research report capacity
    MAX_SUMMARY_CHARS = 8000   # Comprehensive summary capacity

    content = "\n".join(
        [
            f"# L3 Specialist Analysis: {specialist_code}",
            "",
            "## Research Task",
            task,
            "",
            "## Analysis Context",
            str(context or {}),
            "",
            "## Comprehensive Findings",
            summary[:MAX_ARTIFACT_CHARS] if len(summary) <= MAX_ARTIFACT_CHARS else summary[:MAX_ARTIFACT_CHARS] + "\n\n[Content continues in full_output field]",
        ]
    )

    artifact = await _fs.write_file(
        session_id=uuid4(),
        path=f"missions/modes34/l3/{specialist_code}.md",
        content=content,
    )

    return {
        "summary": summary[:MAX_SUMMARY_CHARS] or f"{specialist_code} produced no output.",
        "full_output": summary,  # Always preserve complete output
        "artifact_path": artifact.get("path"),
        "citations": result.get("citations", []),
        "runners_used": [runner.get("run_code")] if runner else [],
        "runner": runner,
        "token_usage": token_usage,
        "tools_used": tools_used,
        "sources": (result.get("sources") or []) + l5_summary.all_sources,
        "cost": total_cost,
        "tokens": tokens_used,
        "duration_ms": result.get("duration_ms"),
    }


def _pick_runner(code: str, stage: str | None = None) -> Dict[str, Any] | None:
    try:
        runner = runner_registry.get(code)
        if runner:
            return runner
        return runner_registry.pick_for_stage(stage or "analysis", agent_level=3)
    except Exception:
        return None
