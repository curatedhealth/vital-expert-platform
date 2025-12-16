# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [services.deepagents_tools, services.runner_registry, resilience.llm_timeout, l5_tool_mapper, registry]
from __future__ import annotations

import asyncio
import structlog
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional
from uuid import uuid4

from services.deepagents_tools import VirtualFilesystem
from services.runner_registry import runner_registry
from .registry import get_l4_class
from .l5_tool_mapper import get_l5_executor, L5ExecutionSummary, StreamWriterCallback

# Phase 1 CRITICAL Fix C1: LLM timeout protection
from langgraph_workflows.modes34.resilience import (
    invoke_llm_with_timeout,
    LLMTimeoutError,
    LLMRetryExhaustedError,
    L4_WORKER_TIMEOUT,
    L4_WORKER_MAX_RETRIES,
)

logger = structlog.get_logger()
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
    stream_writer: StreamWriterCallback = None,
) -> Dict[str, Any]:
    """
    Wrapper for L4 workers with real L5 tool execution, cost rollup, and streaming events.

    Args:
        worker_code: L4 worker code (e.g., "evidence", "research", "synthesize")
        task: Task description for the worker
        context: Execution context with goal, runner, agent_id, plan_tools
        stream_writer: Optional callback to emit streaming events (tool_start, rag_results, etc.)
    """
    logger.info("modes34_delegate_to_l4", worker=worker_code, task=task)
    context = context or {}
    runner = _pick_runner(worker_code, stage=context.get("stage"))
    runner_codes = [runner.get("run_code")] if runner else []
    plan_tools = context.get("plan_tools") or []

    # Emit CoT reasoning event at start of L4 execution
    if stream_writer:
        stream_writer({
            "event": "cot_step",
            "stepNumber": 1,
            "thought": f"Starting {worker_code} analysis for: {task[:100]}...",
            "action": f"Execute L5 tools: {', '.join(plan_tools) if plan_tools else 'default tools'}",
            "agentId": context.get("agent_id"),
        })

    # Execute L5 tools first
    # Phase 2: Use database-driven agent tools when agent_id is available
    l5_exec = get_l5_executor()
    l5_summary = L5ExecutionSummary()
    agent_id = context.get("agent_id")

    if agent_id:
        # Database-driven: use agent_tool_assignments table
        logger.info("l4_using_agent_tools", agent_id=agent_id[:8], worker=worker_code)
        l5_summary = await l5_exec.execute_for_agent(
            agent_id=agent_id,
            query=task,
            params=context,
            tool_filter=plan_tools,  # Apply plan_tools as filter
            stream_writer=stream_writer,  # Pass stream_writer for real-time events
        )
    else:
        # Legacy: use runner code mapping
        if runner_codes:
            l5_summary = await l5_exec.execute_for_runner(
                runner_code=runner_codes[0],
                query=task,
                params=context,
                stream_writer=stream_writer,
            )
        if plan_tools:
            l5_plan_summary = await l5_exec.execute_for_plan_tools(
                plan_tools=plan_tools,
                query=task,
                params=context,
                stream_writer=stream_writer,
            )
            _merge_summaries(l5_summary, l5_plan_summary)

    # Emit CoT reasoning event after L5 tools complete
    if stream_writer:
        stream_writer({
            "event": "cot_step",
            "stepNumber": 2,
            "thought": f"L5 tools completed. Retrieved {len(l5_summary.all_sources)} sources.",
            "observation": f"Tools used: {', '.join(l5_summary.tool_slugs_called)}",
            "agentId": agent_id,
        })

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

    # Phase 1 CRITICAL Fix C1: Wrap LLM call with timeout protection
    # L4 workers get 60s timeout (faster task execution), 3 retries
    async def _execute_worker():
        return await worker.execute(
            task=task,
            params={"goal": task, "runner": runner},
            context=exec_context,
        )

    try:
        worker_result = await invoke_llm_with_timeout(
            llm_callable=_execute_worker,
            timeout_seconds=L4_WORKER_TIMEOUT,  # Environment-configurable (default: 60s)
            max_retries=L4_WORKER_MAX_RETRIES,  # Environment-configurable (default: 3)
            operation_name=f"L4_{worker_code}",
        )
    except asyncio.CancelledError:
        # CRITICAL C5: NEVER swallow CancelledError
        logger.warning(
            "l4_worker_execution_cancelled",
            worker=worker_code,
            task_preview=task[:120],
        )
        raise
    except (LLMTimeoutError, LLMRetryExhaustedError) as exc:
        logger.error(
            "l4_worker_timeout_or_retry_exhausted",
            worker=worker_code,
            error=str(exc),
        )
        raise
    except Exception as exc:
        logger.error(
            "l4_worker_execution_failed",
            worker=worker_code,
            error=str(exc),
            exc_info=True,
        )
        raise

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

    # Emit final CoT step with synthesis summary
    if stream_writer:
        stream_writer({
            "event": "cot_step",
            "stepNumber": 3,
            "thought": f"Analysis complete. Generated {len(summary_text)} character response with {len(citations)} citations.",
            "observation": f"Sources: {len(sources)} | Duration: {exec_ms}ms | Cost: ${cost_usd:.4f}",
            "agentId": agent_id,
        })

        # Emit content chunk with the summary
        if summary_text:
            stream_writer({
                "event": "content_chunk",
                "content": summary_text[:500] + ("..." if len(summary_text) > 500 else ""),
                "chunkType": "text",
                "step": worker_code,
                "agentId": agent_id,
                "isFinal": True,
            })

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
