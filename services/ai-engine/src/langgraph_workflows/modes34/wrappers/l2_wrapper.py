from __future__ import annotations

from typing import Any, Dict, AsyncIterator, Callable, Optional
from uuid import uuid4
import structlog

from services.deepagents_tools import VirtualFilesystem
from .utils import make_config
from services.runner_registry import runner_registry
from .registry import get_l2_class
from .l5_tool_mapper import get_l5_executor, L5ExecutionSummary

logger = structlog.get_logger()
_fs = VirtualFilesystem()

# Type alias for streaming callback
StreamingCallback = Callable[[Dict[str, Any]], None]


async def delegate_to_l2(
    *,
    expert_code: str,
    task: str,
    context: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    """
    Phase 2 scaffold: wrap an existing L2 expert without redefining it.

    In Phase 3, this should invoke a LangGraph subgraph that uses the real
    L2 agent (with L3/L4/L5 spawning). For now, persist the request and
    return a concise summary so upstream nodes can proceed.
    """
    logger.info("modes34_delegate_to_l2", expert_code=expert_code, task=task)

    expert_cls = get_l2_class(expert_code)
    if expert_cls is None:
        raise RuntimeError(f"L2 expert not found for code: {expert_code}")

    expert = expert_cls(
        make_config(
            expert_code,
            "You are an L2 domain expert. Provide concise, evidence-aware output.",
        )
    )

    # Call the agent's execute/generate path
    runner = _pick_runner(expert_code, agent_level=2, stage=(context or {}).get("stage"))
    exec_context = {**(context or {}), "runner": runner} if runner else (context or {})

    # Execute mapped L5 tools first
    l5_exec = get_l5_executor()
    l5_summary: L5ExecutionSummary = L5ExecutionSummary()
    runner_code = runner.get("run_code") if runner else None
    if runner_code:
        l5_summary = await l5_exec.execute_for_runner(runner_code=runner_code, query=task, params=exec_context)
    plan_tools = context.get("plan_tools") if context else None
    if plan_tools:
        l5_plan_summary = await l5_exec.execute_for_plan_tools(plan_tools=plan_tools, query=task, params=exec_context)
        # merge summaries
        for slug in l5_plan_summary.tool_slugs_called:
            if slug not in l5_summary.tool_slugs_called:
                l5_summary.tool_slugs_called.append(slug)
        l5_summary.total_cost_usd += l5_plan_summary.total_cost_usd
        l5_summary.total_execution_time_ms += l5_plan_summary.total_execution_time_ms
        l5_summary.total_api_calls += l5_plan_summary.total_api_calls
        l5_summary.all_sources.extend(l5_plan_summary.all_sources)
        l5_summary.raw_results.extend(l5_plan_summary.raw_results)

    try:
        result = await expert.execute(
            task=task,
            params={"goal": task, "runner": runner},
            context=exec_context,
        )
    except Exception as exc:
        logger.error(
            "l2_agent_execution_failed",
            expert_code=expert_code,
            error=str(exc),
            error_type=type(exc).__name__,
            task_preview=task[:120],
            exc_info=True,
        )
        raise
    summary = result.get("output") or result.get("analysis") or ""
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
            f"# L2 Expert Analysis: {expert_code}",
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
        path=f"missions/modes34/l2/{expert_code}.md",
        content=content,
    )

    return {
        "summary": summary[:MAX_SUMMARY_CHARS] or f"{expert_code} produced no output.",
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


def _pick_runner(code: str, agent_level: int = 2, stage: str | None = None) -> Dict[str, Any] | None:
    try:
        runner = runner_registry.get(code)
        if runner:
            return runner
        return runner_registry.pick_for_stage(stage or "analysis", agent_level=agent_level)
    except Exception:
        return None


async def delegate_to_l2_streaming(
    *,
    expert_code: str,
    task: str,
    context: Dict[str, Any] | None = None,
) -> AsyncIterator[Dict[str, Any]]:
    """
    Streaming version of delegate_to_l2 that yields tokens as they are generated.

    This enables real-time AI thinking/reasoning display in the UI.

    Yields:
        Dict with either:
        - {"event": "thinking", "token": "..."} for partial tokens
        - {"event": "tool_call", ...} for L5 tool executions
        - {"event": "complete", ...} for final result
    """
    logger.info("modes34_delegate_to_l2_streaming", expert_code=expert_code, task=task)

    expert_cls = get_l2_class(expert_code)
    if expert_cls is None:
        yield {"event": "error", "error": f"L2 expert not found for code: {expert_code}"}
        return

    expert = expert_cls(
        make_config(
            expert_code,
            "You are an L2 domain expert. Provide concise, evidence-aware output.",
        )
    )

    # Call the agent's execute/generate path
    runner = _pick_runner(expert_code, agent_level=2, stage=(context or {}).get("stage"))
    exec_context = {**(context or {}), "runner": runner} if runner else (context or {})

    # Execute mapped L5 tools first (emit tool events)
    l5_exec = get_l5_executor()
    l5_summary: L5ExecutionSummary = L5ExecutionSummary()
    runner_code = runner.get("run_code") if runner else None

    if runner_code:
        yield {"event": "tool_start", "tool": runner_code, "type": "runner"}
        l5_summary = await l5_exec.execute_for_runner(runner_code=runner_code, query=task, params=exec_context)
        yield {
            "event": "tool_end",
            "tool": runner_code,
            "sources_count": len(l5_summary.all_sources),
            "cost": l5_summary.total_cost_usd,
        }

    plan_tools = context.get("plan_tools") if context else None
    if plan_tools:
        for tool_slug in plan_tools:
            yield {"event": "tool_start", "tool": tool_slug, "type": "plan_tool"}

        l5_plan_summary = await l5_exec.execute_for_plan_tools(plan_tools=plan_tools, query=task, params=exec_context)

        for slug in l5_plan_summary.tool_slugs_called:
            yield {"event": "tool_end", "tool": slug, "type": "plan_tool"}
            if slug not in l5_summary.tool_slugs_called:
                l5_summary.tool_slugs_called.append(slug)

        l5_summary.total_cost_usd += l5_plan_summary.total_cost_usd
        l5_summary.total_execution_time_ms += l5_plan_summary.total_execution_time_ms
        l5_summary.total_api_calls += l5_plan_summary.total_api_calls
        l5_summary.all_sources.extend(l5_plan_summary.all_sources)
        l5_summary.raw_results.extend(l5_plan_summary.raw_results)

    # Emit sources found so far
    if l5_summary.all_sources:
        yield {"event": "sources", "sources": l5_summary.all_sources}

    # Now stream the LLM generation
    yield {"event": "thinking_start", "agent": expert_code}

    summary = ""
    citations = []

    try:
        # Check if expert has streaming support
        if hasattr(expert, "execute_streaming"):
            async for chunk in expert.execute_streaming(
                task=task,
                params={"goal": task, "runner": runner},
                context=exec_context,
            ):
                if chunk.get("token"):
                    yield {"event": "thinking", "token": chunk["token"]}
                if chunk.get("complete"):
                    summary = chunk.get("output") or chunk.get("analysis") or ""
                    citations = chunk.get("citations", [])
        else:
            # Fallback to non-streaming
            result = await expert.execute(
                task=task,
                params={"goal": task, "runner": runner},
                context=exec_context,
            )
            summary = result.get("output") or result.get("analysis") or ""
            citations = result.get("citations", [])
    except Exception as exc:
        logger.error(
            "l2_agent_streaming_failed",
            expert_code=expert_code,
            error=str(exc),
            exc_info=True,
        )
        yield {"event": "error", "error": str(exc)}
        return

    yield {"event": "thinking_end", "agent": expert_code}

    # Calculate metrics
    tools_used = l5_summary.raw_results or []
    total_cost = l5_summary.total_cost_usd

    # World-class output limits
    MAX_ARTIFACT_CHARS = 16000
    MAX_SUMMARY_CHARS = 8000

    content = "\n".join(
        [
            f"# L2 Expert Analysis: {expert_code}",
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
        path=f"missions/modes34/l2/{expert_code}.md",
        content=content,
    )

    # Yield final complete event
    yield {
        "event": "complete",
        "summary": summary[:MAX_SUMMARY_CHARS] or f"{expert_code} produced no output.",
        "full_output": summary,
        "artifact_path": artifact.get("path"),
        "citations": citations,
        "runners_used": [runner.get("run_code")] if runner else [],
        "runner": runner,
        "tools_used": tools_used,
        "sources": l5_summary.all_sources,
        "cost": total_cost,
    }
