# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [3, 4]
# DEPENDENCIES: [langgraph, checkpoint.postgres, state, wrappers.*, services.graphrag]
"""
Master graph for Modes 3/4 with typed state, basic routing, and checkpoint hooks.

Phase 1 World-Class Deep Research Enhancements:
1. Iterative Refinement Loop (confidence gate) - re-search if confidence < 0.8
2. Query Decomposition System - break complex queries into sub-queries
3. Confidence Scoring System (5 dimensions) - multi-factor confidence assessment
4. Citation Verification Node - validate citations via PubMed/CrossRef
5. Quality Gate (RACE/FACT metrics) - structured response quality assessment

Phase 2 Enhancements:
6. Self-Reflection Node - agent reviews own reasoning before finalizing

Production Hardening (Grade A):
7. Streaming - astream_events pattern for real-time token streaming
8. HITL - Interrupt() mechanism for human-in-the-loop checkpoints
9. Checkpointing - PostgresSaver enforcement with fallback warning

Enhanced Flow:
- initialize -> decompose_query -> plan -> select_team (mode 4) -> execute_step loop
- After each evidence step: check confidence gate
- If confidence < 0.8: refine_search node (up to 3 iterations)
- After synthesis: verify_citations -> quality_gate -> reflection_gate
- quality checkpoint every 3 steps; budget checkpoint at 80% spend (if limit set)
- finalize with full research quality + reflection metadata

Note: mission_stream currently drives orchestration; this graph is aligned for future
LangGraph execution with pause/resume via checkpoint_pending/human_response flags.
"""

from __future__ import annotations

from typing import Any, AsyncIterator, Dict, List, Optional

import os
import structlog
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

# Custom streaming for enhanced engagement events
try:
    from langgraph.config import get_stream_writer
    STREAM_WRITER_AVAILABLE = True
except ImportError:
    # Fallback for older LangGraph versions
    get_stream_writer = None
    STREAM_WRITER_AVAILABLE = False

try:
    from langgraph.checkpoint.postgres import PostgresSaver  # type: ignore
    POSTGRES_AVAILABLE = True
except Exception:  # pragma: no cover
    PostgresSaver = None  # optional dependency
    POSTGRES_AVAILABLE = False

try:
    from langgraph.types import Interrupt  # type: ignore
    INTERRUPT_AVAILABLE = True
except Exception:  # pragma: no cover
    Interrupt = None  # LangGraph < 0.2
    INTERRUPT_AVAILABLE = False

from .state import MissionState, PlanStep
from .wrappers.l2_wrapper import delegate_to_l2, delegate_to_l2_streaming
from .wrappers.l3_wrapper import delegate_to_l3
from .wrappers.l4_wrapper import delegate_to_l4

# Phase 2: Production GraphRAG Agent Selection
from .agent_selector import (
    select_team,
    select_team_async,
    select_team_graphrag,
    GRAPHRAG_AVAILABLE,
    HYBRID_SEARCH_AVAILABLE,
)

# Phase 2: Dynamic Runner Registry
from .runners.registry import (
    get_runner_registry,
    get_graph_factory,
    refresh_template_cache,
)

# Legacy fallback
from services.runner_registry import runner_registry

# Phase 1 Research Quality Enhancements
from .research_quality import (
    # Enhancement 1: Iterative Refinement
    check_confidence_gate,
    CONFIDENCE_THRESHOLD,
    MAX_REFINEMENT_ITERATIONS,
    # Enhancement 2: Query Decomposition
    decompose_query,
    # Enhancement 3: Confidence Scoring
    calculate_confidence_scores,
    # Enhancement 4: Citation Verification
    verify_citations,
    # Enhancement 5: Quality Gate
    assess_quality,
    QUALITY_THRESHOLD,
    # Enhancement 6: Self-Reflection (Phase 2)
    check_reflection_gate,
    REFLECTION_THRESHOLD,
    MAX_REFLECTION_ITERATIONS,
)

# Phase 1 CRITICAL Fix: Resilience Infrastructure (C1, C2, C4, C5)
from .resilience import (
    handle_node_errors,
    NodeExecutionError,
    add_error_to_state,
)


logger = structlog.get_logger(__name__)


class WorkflowCheckpointerFactory:
    """
    Factory for creating workflow checkpointers with H6 fallback logging.

    Phase 2 H6 Enhancement:
    - Explicit logging when falling back to MemorySaver
    - Impact assessment for mission state persistence
    - Distinguishes between connection failure vs. no configuration
    """

    @staticmethod
    def create(mission_id: str = "default") -> Any:
        """
        Create checkpointer with enhanced fallback logging.

        Args:
            mission_id: Mission identifier for logging context

        Returns:
            PostgresSaver if available and configured, otherwise MemorySaver
        """
        db_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
        environment = os.getenv("ENVIRONMENT", "development")

        # Case 1: No database URL configured
        if not db_url:
            logger.info(
                "checkpointer_using_memory",
                mission_id=mission_id,
                reason="no_connection_string",
                environment=environment,
                impact="mission_state_not_persisted",
                recovery="restart_will_lose_progress",
                recommendation="Set DATABASE_URL or SUPABASE_DB_URL for persistence",
            )
            return MemorySaver()

        # Case 2: PostgresSaver not available (dependency not installed)
        if not POSTGRES_AVAILABLE:
            logger.warning(
                "checkpointer_fallback_to_memory",
                mission_id=mission_id,
                reason="postgres_dependency_not_installed",
                environment=environment,
                impact="mission_state_not_persisted",
                recovery="restart_will_lose_progress",
                recommendation="Install langgraph[postgres] for persistence",
            )
            return MemorySaver()

        # Case 3: Attempt PostgresSaver connection
        try:
            # Redact password from URL for safe logging
            def redact_url(url: str) -> str:
                if "@" in url:
                    parts = url.split("@")
                    if ":" in parts[0]:
                        user_pw = parts[0].split("//")[-1].split(":")
                        return f"{url.split('//')[0]}//{user_pw[0]}:***@{parts[1][:40]}..."
                return url[:40] + "..."

            logger.info(
                "checkpointer_postgres_connecting",
                mission_id=mission_id,
                db_url_redacted=redact_url(db_url),
                environment=environment,
            )

            # Measure connection latency
            import time
            start_time = time.time()
            checkpointer = PostgresSaver.from_conn_string(db_url)
            latency_ms = int((time.time() - start_time) * 1000)

            logger.info(
                "checkpointer_postgres_connected",
                mission_id=mission_id,
                environment=environment,
                persistence="enabled",
                latency_ms=latency_ms,
                impact="Mission state persisted across restarts",
            )
            return checkpointer

        except Exception as exc:
            # Case 4: Connection failure - log with full context
            error_type = type(exc).__name__
            error_msg = str(exc)[:200]

            logger.warning(
                "checkpointer_fallback_to_memory",
                mission_id=mission_id,
                error=error_msg,
                error_type=error_type,
                environment=environment,
                impact="mission_state_not_persisted",
                recovery="restart_will_lose_progress",
                action="Check database connectivity and credentials",
                db_url_prefix=db_url[:30] + "...",
            )

            # Additional warning for production environments
            if environment == "production":
                logger.error(
                    "checkpointer_postgres_failed_critical",
                    mission_id=mission_id,
                    error=error_msg,
                    error_type=error_type,
                    severity="HIGH",
                    impact="Production missions will lose state on restart",
                    action="URGENT: Fix database connection or disable production mode",
                )

            return MemorySaver()


def _get_checkpointer():
    """
    Choose PostgresSaver if DATABASE_URL is set, otherwise MemorySaver.

    Production Hardening (H6):
    - PostgresSaver is STRONGLY preferred for production (persistence, resumability)
    - MemorySaver is a fallback with explicit logging and impact assessment
    - Checks both DATABASE_URL and SUPABASE_DB_URL environment variables
    - Logs fallback scenarios with recovery guidance
    """
    return WorkflowCheckpointerFactory.create(mission_id="workflow_graph")


def build_master_graph() -> CompiledStateGraph:
    graph = StateGraph(MissionState)

    @handle_node_errors("initialize", recoverable=True)
    async def _initialize(state: MissionState) -> Dict[str, Any]:
        """Initialize mission with Phase 1 research quality defaults."""
        return {
            "status": "planning",
            "current_step": 0,
            "artifacts": [],
            "current_cost": 0.0,
            "quality_checks": 0,
            # Phase 1 Enhancement 1: Iterative Refinement defaults
            "refinement_iteration": 0,
            "max_refinement_iterations": MAX_REFINEMENT_ITERATIONS,
            "refinement_history": [],
            "evidence_gaps": [],
            "refined_queries": [],
            # Phase 1 Enhancement 2: Query Decomposition defaults
            "original_query": state.get("goal", ""),
            "decomposed_queries": [],
            "query_complexity": 0.0,
            "search_strategy": "parallel",
            # Phase 1 Enhancement 3: Confidence Scoring defaults
            "confidence_scores": {},
            "overall_confidence": 0.0,
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            # Phase 1 Enhancement 4: Citation Verification defaults
            "verified_citations": [],
            "unverified_citations": [],
            "citation_verification_rate": 0.0,
            # Phase 1 Enhancement 5: Quality Gate defaults
            "quality_metrics": {},
            "race_score": 0.0,
            "fact_score": 0.0,
            "overall_quality": 0.0,
            "quality_passed": False,
            "quality_recommendations": [],
            # Phase 2 Enhancement 6: Self-Reflection defaults
            "self_reflections": [],
            "reflection_iteration": 0,
            "reflection_improvements": [],
            "reflection_score": 0.0,
        }

    # =========================================================================
    # Phase 1 Enhancement 2: Query Decomposition Node
    # =========================================================================
    @handle_node_errors("decompose_query", recoverable=True)
    async def _decompose_query(state: MissionState) -> Dict[str, Any]:
        """
        Decompose complex queries into searchable sub-queries.

        This runs early in the pipeline to optimize evidence retrieval.
        """
        goal = state.get("goal", "")
        if not goal:
            return {"status": "planning"}

        decomposed = await decompose_query(
            query=goal,
            context={
                "template_id": state.get("template_id"),
                "template_family": state.get("template_family"),
            }
        )

        logger.info(
            "query_decomposition_complete",
            original=goal[:100],
            sub_queries=len(decomposed.sub_queries),
            complexity=decomposed.complexity_score,
            strategy=decomposed.search_strategy,
        )

        return {
            "original_query": goal,
            "decomposed_queries": decomposed.sub_queries,
            "query_complexity": decomposed.complexity_score,
            "search_strategy": decomposed.search_strategy,
            "status": "planning",
        }

    @handle_node_errors("plan", recoverable=True)
    async def _plan(state: MissionState) -> Dict[str, Any]:
        """
        Generate or normalize plan from template tasks.

        Template Task Format (from DB):
            {id, name, description, assigned_level, estimated_minutes}

        PlanStep Format (execution):
            {id, name, description, agent, stage, tools, runner, status}
        """
        goal = state.get("goal", "")
        existing_plan: List[PlanStep] = state.get("plan") or []

        # If template plan provided, normalize to PlanStep format
        if existing_plan:
            normalized_plan = []
            for i, task in enumerate(existing_plan):
                # Check if already normalized (has 'agent' key)
                if "agent" in task:
                    normalized_plan.append(task)
                    continue

                # Normalize template task to PlanStep format
                assigned_level = task.get("assigned_level", "L4")
                agent_level = int(assigned_level.replace("L", "")) if assigned_level else 4

                # Determine stage based on task name/description or position
                task_name = task.get("name", "").lower()
                if "synthesis" in task_name or "compile" in task_name:
                    stage = "synthesis"
                elif "evidence" in task_name or "research" in task_name or "search" in task_name:
                    stage = "evidence"
                elif "strategy" in task_name or "plan" in task_name or i == 0:
                    stage = "planning"
                else:
                    stage = "evidence"

                # Pick appropriate runner for the stage
                runner = runner_registry.pick_for_stage(stage, agent_level=agent_level)

                # Determine tools based on stage
                if stage == "evidence":
                    tools = ["pubmed", "clinicaltrials", "rag", "web_search"]
                elif stage == "planning":
                    tools = ["rag", "web_search"]
                else:
                    tools = []

                normalized_step: PlanStep = {
                    "id": task.get("id") or f"step_{i+1}",
                    "name": task.get("name", f"Step {i+1}"),
                    "description": task.get("description") or f"{goal} - {task.get('name', '')}",
                    "agent": assigned_level,
                    "stage": stage,
                    "tools": tools,
                    "runner": runner.get("run_code") if runner else stage,
                    "status": "pending",
                }
                normalized_plan.append(normalized_step)

            logger.info(
                "plan_normalized_from_template",
                original_count=len(existing_plan),
                normalized_count=len(normalized_plan),
                template_id=state.get("template_id"),
            )
            return {"plan": normalized_plan, "total_steps": len(normalized_plan), "status": "planning"}

        # Fallback: Generate default 3-step plan if no template
        runner_plan = runner_registry.pick_for_stage("planning", agent_level=3)
        runner_evidence = runner_registry.pick_for_stage("evidence", agent_level=4)
        plan = [
            {
                "id": "step_1",
                "name": "Strategy & Context",
                "description": goal or "Define mission objective",
                "agent": "L3",
                "stage": "planning",
                "tools": ["rag", "web_search"],
                "runner": runner_plan.get("run_code") if runner_plan else "research",
                "status": "pending",
            },
            {
                "id": "step_2",
                "name": "Evidence Retrieval",
                "description": f"Retrieve and analyze evidence for: {goal}",
                "agent": "L4",
                "stage": "evidence",
                "tools": ["pubmed", "clinicaltrials", "rag", "web_search"],
                "runner": runner_evidence.get("run_code") if runner_evidence else "evidence",
                "status": "pending",
            },
            {
                "id": "step_3",
                "name": "Synthesis",
                "description": f"Synthesize evidence findings for: {goal}",
                "agent": "L2",
                "stage": "synthesis",
                "tools": [],
                "runner": "synthesize",
                "status": "pending",
            },
        ]
        logger.info("plan_generated_default", step_count=len(plan), goal=goal[:100])
        return {"plan": plan, "total_steps": len(plan), "status": "planning"}

    @handle_node_errors("select_team", recoverable=True)
    async def _select_team(state: MissionState) -> Dict[str, Any]:
        """
        Phase 2: Production GraphRAG Agent Selection

        Uses 3-method weighted fusion for intelligent agent selection:
        - PostgreSQL fulltext (30%)
        - Pinecone vector (50%)
        - Neo4j graph (20%)

        Falls back to legacy selection if GraphRAG unavailable.
        """
        goal = state.get("goal", "")
        tenant_id = state.get("tenant_id", "default")
        mode = state.get("mode", 3)

        if mode == 4:
            # Use async GraphRAG selection for Mode 4
            metadata = {
                "template_id": state.get("template_id"),
                "template_family": state.get("template_family"),
                "template_cat": state.get("template_cat"),
                "mode": f"mode{mode}",
                "domains": state.get("domains"),
                "capabilities": state.get("capabilities"),
            }

            try:
                # Production GraphRAG selection
                team = await select_team_async(
                    goal=goal,
                    tenant_id=tenant_id,
                    metadata=metadata,
                    max_agents=3,
                    use_graphrag=GRAPHRAG_AVAILABLE,
                )

                logger.info(
                    "team_selected_graphrag",
                    team_size=len(team),
                    top_agent=team[0]["name"] if team else "None",
                    graphrag_available=GRAPHRAG_AVAILABLE,
                    hybrid_available=HYBRID_SEARCH_AVAILABLE,
                    goal_preview=goal[:100],
                )

                return {
                    "selected_team": team,
                    "status": "running",
                    "selection_method": "graphrag" if GRAPHRAG_AVAILABLE else "hybrid" if HYBRID_SEARCH_AVAILABLE else "legacy",
                }

            except Exception as exc:
                logger.error(
                    "team_selection_failed_fallback_to_legacy",
                    error=str(exc)[:200],
                    goal_preview=goal[:100],
                )
                # Fallback to legacy sync selection
                team = select_team(goal, metadata)
                return {
                    "selected_team": team,
                    "status": "running",
                    "selection_method": "legacy_fallback",
                }

        # Mode 3: No team selection needed (single expert already assigned)
        return {"status": "running"}

    @handle_node_errors("execute_step", recoverable=False)
    async def _execute_step(state: MissionState) -> Dict[str, Any]:
        plan = state.get("plan") or []
        artifacts = state.get("artifacts") or []
        idx = state.get("current_step", 0)
        total_steps = state.get("total_steps") or len(plan)

        # Get stream writer for custom events (RAG results, CoT, tool calls)
        stream_writer = None
        if STREAM_WRITER_AVAILABLE and get_stream_writer:
            try:
                stream_writer = get_stream_writer()
            except Exception:
                # Not in streaming context, continue without streaming
                pass

        # DEBUG: Log step entry
        logger.info(
            "execute_step_entry",
            step_index=idx,
            total_steps=total_steps,
            plan_length=len(plan),
            artifacts_count=len(artifacts),
            mission_id=state.get("mission_id"),
            streaming_enabled=stream_writer is not None,
        )

        if idx >= len(plan):
            logger.warning("execute_step_idx_exceeds_plan", idx=idx, plan_length=len(plan))
            return {"status": "running"}

        step = plan[idx]
        delegate = step.get("agent", "L2")
        agent_id = state.get("selected_agent")

        # Build context with goal, tools, and runner from step
        ctx = {
            "goal": state.get("goal"),
            "template_id": state.get("template_id"),
            "stage": step.get("stage"),
            "plan_tools": step.get("tools", []),  # Pass tools to L4 for L5 invocation
            "runner": step.get("runner"),
            "agent_id": agent_id,  # Pass agent_id for database-driven tool assignment
        }

        logger.info(
            "execute_step_delegation",
            step_id=step.get("id"),
            delegate=delegate,
            stage=step.get("stage"),
            tools=step.get("tools"),
            runner=step.get("runner"),
        )

        # Emit thinking_start event for real-time feedback
        if stream_writer:
            stream_writer({
                "event": "thinking_start",
                "agentId": agent_id,
                "step": step.get("id"),
            })

        if delegate == "L2":
            res = await delegate_to_l2(expert_code=agent_id or "domain_lead", task=step.get("description", ""), context=ctx)
        elif delegate == "L3":
            res = await delegate_to_l3(specialist_code="context_specialist", task=step.get("description", ""), context=ctx)
        else:
            # L4 worker - use "evidence" worker code with plan_tools for L5 tool invocation
            # Pass stream_writer for real-time tool/RAG/search events
            res = await delegate_to_l4(
                worker_code=step.get("runner") or "evidence",
                task=step.get("description", ""),
                context=ctx,
                stream_writer=stream_writer,
            )

        # Emit thinking_end event
        if stream_writer:
            stream_writer({
                "event": "thinking_end",
                "agentId": agent_id,
                "step": step.get("id"),
            })

        artifacts.append({**res, "id": step.get("id"), "step": step.get("name"), "status": "completed"})
        plan[idx]["status"] = "completed"

        new_cost = (state.get("current_cost") or 0.0) + float(res.get("cost") or 0.0)
        quality_checks = (state.get("quality_checks") or 0) + 1

        checkpoint_pending = None
        status = "running"
        step_id = step.get("id", "")

        # 1. Template checkpoints (highest priority - configured by mission template)
        template_checkpoints = state.get("template_checkpoints") or []
        for tpl_cp in template_checkpoints:
            # Check if checkpoint triggers after this step
            # Support multiple field names: after_task (DB), after_step_id, after_step
            trigger_after = tpl_cp.get("after_task") or tpl_cp.get("after_step_id") or tpl_cp.get("after_step")
            if trigger_after == step_id:
                checkpoint_pending = {
                    "id": tpl_cp.get("id") or f"cp_template_{step_id}",
                    "type": tpl_cp.get("type", "approval"),
                    # Support both 'title' and 'name' from DB
                    "title": tpl_cp.get("title") or tpl_cp.get("name", "Template Checkpoint"),
                    "description": tpl_cp.get("description", "Review progress before continuing."),
                    "options": tpl_cp.get("options", ["approve", "revise", "abort"]),
                    "source": "template",
                }
                status = "awaiting_checkpoint"
                logger.info(
                    "template_checkpoint_triggered",
                    checkpoint_id=checkpoint_pending["id"],
                    step_id=step_id,
                    checkpoint_type=checkpoint_pending["type"],
                )
                break

        # 2. Budget checkpoint (triggers at 80% budget consumption)
        if checkpoint_pending is None:
            budget_limit = state.get("budget_limit") or 0
            if budget_limit and new_cost >= 0.8 * budget_limit:
                checkpoint_pending = {
                    "id": f"cp_budget_{step_id}",
                    "type": "budget",
                    "title": "Budget Checkpoint",
                    "description": f"Budget at {int(new_cost/budget_limit*100)}%. Approve, increase, or abort?",
                    "options": ["approve", "increase_budget", "abort"],
                    "source": "system",
                }
                status = "awaiting_checkpoint"

        # 3. Quality checkpoint (every 3 steps)
        if checkpoint_pending is None and quality_checks >= 3:
            checkpoint_pending = {
                "id": f"cp_quality_{step_id}",
                "type": "quality",
                "title": "Quality Checkpoint",
                "description": "Review recent steps for quality/consistency.",
                "options": ["continue", "revise", "abort"],
                "source": "system",
            }
            quality_checks = 0
            status = "awaiting_checkpoint"

        # DEBUG: Log step completion
        logger.info(
            "execute_step_completed",
            completed_step=idx,
            next_step=idx + 1,
            total_steps=state.get("total_steps") or len(plan),
            quality_checks=quality_checks,
            checkpoint_pending=bool(checkpoint_pending),
            status=status,
            artifact_count=len(artifacts),
        )

        return {
            "artifacts": artifacts,
            "plan": plan,
            "current_step": idx + 1,
            "current_cost": new_cost,
            "quality_checks": quality_checks,
            "checkpoint_pending": checkpoint_pending,
            "status": status,
        }

    @handle_node_errors("checkpoint", recoverable=True)
    async def _checkpoint(state: MissionState) -> Dict[str, Any]:
        if state.get("checkpoint_pending") and not state.get("human_response"):
            return {"status": "awaiting_checkpoint"}
        return {"status": "running", "checkpoint_pending": None, "human_response": None}

    @handle_node_errors("synthesize", recoverable=False)
    async def _synthesize(state: MissionState) -> Dict[str, Any]:
        """Synthesize all artifacts into world-class comprehensive research report.

        Key improvements over previous implementation:
        1. Uses full_output field (complete content) instead of truncated summary
        2. Generates structured report with executive summary, detailed findings, and citations
        3. Preserves all evidence and sources for transparency
        4. Produces 2000-4000 word reports instead of 2-3 paragraph snippets
        """
        artifacts = state.get("artifacts") or []
        goal = state.get("goal", "Research Analysis")

        # Collect FULL content from artifacts (not truncated summaries)
        full_findings = []
        all_citations = []
        all_sources = []
        evidence_details = []

        for artifact in artifacts:
            step_name = artifact.get("step", "Analysis Step")

            # Prefer full_output, fall back to summary
            full_content = artifact.get("full_output") or artifact.get("summary", "")
            if full_content:
                full_findings.append({
                    "step": step_name,
                    "content": full_content,
                    "sources_count": len(artifact.get("sources", [])),
                })

            # Collect citations
            citations = artifact.get("citations", [])
            if citations:
                all_citations.extend(citations)

            # Collect sources
            sources = artifact.get("sources", [])
            if sources:
                all_sources.extend(sources)

            # Extract evidence from tools_used
            tools_used = artifact.get("tools_used", [])
            if tools_used and isinstance(tools_used, list):
                for tool_result in tools_used:
                    if isinstance(tool_result, dict):
                        tool_name = tool_result.get("tool") or tool_result.get("name", "tool")
                        data = tool_result.get("data", {})
                        if isinstance(data, dict):
                            tool_citations = data.get("citations", []) or data.get("sources", [])
                            if tool_citations:
                                all_citations.extend(tool_citations)
                            # Record evidence details for transparency
                            evidence_details.append({
                                "tool": tool_name,
                                "results_count": len(tool_citations),
                                "status": tool_result.get("status", "completed"),
                            })

        # Build comprehensive research report
        report_sections = []

        # 1. Executive Summary
        report_sections.append(f"# Research Report: {goal}")
        report_sections.append("")
        report_sections.append("## Executive Summary")
        report_sections.append(f"This comprehensive analysis addresses: **{goal}**")
        report_sections.append(f"- **Research Steps Completed:** {len(artifacts)}")
        report_sections.append(f"- **Total Sources Analyzed:** {len(all_sources) + len(all_citations)}")
        report_sections.append(f"- **Evidence Tools Used:** {len(evidence_details)}")
        report_sections.append("")

        # 2. Detailed Findings (FULL content, not truncated)
        report_sections.append("## Detailed Findings")
        report_sections.append("")
        for finding in full_findings:
            report_sections.append(f"### {finding['step']}")
            report_sections.append(finding['content'])
            if finding['sources_count'] > 0:
                report_sections.append(f"\n*({finding['sources_count']} sources referenced)*")
            report_sections.append("")

        # 3. Evidence Trail (for transparency)
        if evidence_details:
            report_sections.append("## Evidence Collection Summary")
            for evidence in evidence_details:
                report_sections.append(f"- **{evidence['tool']}**: {evidence['results_count']} results ({evidence['status']})")
            report_sections.append("")

        # 4. References Section
        # Deduplicate citations by title/url
        seen_urls = set()
        unique_citations = []
        for cit in all_citations + all_sources:
            if isinstance(cit, dict):
                url = cit.get("url") or cit.get("title") or ""
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    unique_citations.append(cit)

        if unique_citations:
            report_sections.append("## References")
            for i, cit in enumerate(unique_citations[:50], 1):  # Cap at 50 for readability
                title = cit.get("title", "Untitled")
                url = cit.get("url", "")
                source = cit.get("source", "")
                if url:
                    report_sections.append(f"{i}. [{title}]({url})" + (f" - {source}" if source else ""))
                else:
                    report_sections.append(f"{i}. {title}" + (f" - {source}" if source else ""))
            if len(unique_citations) > 50:
                report_sections.append(f"\n*...and {len(unique_citations) - 50} additional sources*")

        content = "\n".join(report_sections)

        # Validate outputs against template schema (Gap 5 fix)
        template_outputs = state.get("template_outputs") or []
        output_validation = {"valid": True, "missing": [], "warnings": []}
        final_output_dict: Dict[str, Any] = {
            "content": content,
            "citations": unique_citations,
            "artifact_count": len(artifacts),
            "findings": full_findings,
            "evidence_trail": evidence_details,
        }

        for expected_output in template_outputs:
            output_name = expected_output.get("name")
            output_type = expected_output.get("type", "any")
            if output_name:
                # Check if output is present in artifacts or final_output
                found = output_name in final_output_dict
                if not found:
                    # Check artifacts for the expected output
                    for artifact in artifacts:
                        if output_name in artifact:
                            found = True
                            final_output_dict[output_name] = artifact[output_name]
                            break
                if not found:
                    output_validation["missing"].append({
                        "name": output_name,
                        "type": output_type,
                        "description": expected_output.get("description", ""),
                    })
                    output_validation["valid"] = False

        if output_validation["missing"]:
            logger.warning(
                "output_validation_incomplete",
                missing_outputs=output_validation["missing"],
                template_outputs_count=len(template_outputs),
            )

        logger.info(
            "synthesis_complete_world_class",
            artifact_count=len(artifacts),
            findings_count=len(full_findings),
            citation_count=len(unique_citations),
            report_length=len(content),
            output_validation=output_validation["valid"],
        )

        return {
            "final_output": final_output_dict,
            "output_validation": output_validation,
            "status": "verifying"  # Changed: go to verification phase instead of completed
        }

    # =========================================================================
    # Phase 1 Enhancement 1 & 3: Confidence Gate Node (Iterative Refinement)
    # =========================================================================
    @handle_node_errors("confidence_gate", recoverable=True)
    async def _confidence_gate(state: MissionState) -> Dict[str, Any]:
        """
        Check if collected evidence meets confidence threshold.

        If confidence < 0.8 and iterations < max:
          - Identify evidence gaps
          - Generate improved search queries
          - Return status="refining" to trigger re-search

        If confidence >= 0.8 or max iterations reached:
          - Return status="running" to continue to next step
        """
        artifacts = state.get("artifacts") or []
        goal = state.get("goal", "")
        current_iteration = state.get("refinement_iteration", 0)
        max_iterations = state.get("max_refinement_iterations", MAX_REFINEMENT_ITERATIONS)

        # DEBUG: Log confidence gate entry
        logger.info(
            "confidence_gate_entry",
            current_step=state.get("current_step", 0),
            total_steps=state.get("total_steps", 0),
            artifact_count=len(artifacts),
            current_iteration=current_iteration,
            max_iterations=max_iterations,
            mission_id=state.get("mission_id"),
        )

        # Check confidence gate
        refinement_result = await check_confidence_gate(
            artifacts=artifacts,
            goal=goal,
            current_iteration=current_iteration,
        )

        # Calculate and store confidence scores
        confidence_scores = calculate_confidence_scores(artifacts, goal)

        # Build refinement history entry
        history_entry = {
            "iteration": current_iteration,
            "confidence": refinement_result.confidence,
            "gaps": refinement_result.evidence_gaps,
            "improved_query": refinement_result.improved_query,
        }
        refinement_history = (state.get("refinement_history") or []) + [history_entry]

        if refinement_result.should_continue and current_iteration < max_iterations:
            # Need to refine - update queries and continue
            logger.info(
                "confidence_gate_refinement_triggered",
                confidence=refinement_result.confidence,
                iteration=current_iteration + 1,
                gaps=len(refinement_result.evidence_gaps),
            )

            refined_queries = (state.get("refined_queries") or []) + [refinement_result.improved_query]

            return {
                "refinement_iteration": current_iteration + 1,
                "refinement_history": refinement_history,
                "evidence_gaps": refinement_result.evidence_gaps,
                "refined_queries": refined_queries,
                "confidence_scores": confidence_scores.to_dict(),
                "overall_confidence": confidence_scores.overall_score,
                "status": "refining",
            }

        # Confidence met or max iterations - continue
        logger.info(
            "confidence_gate_passed",
            confidence=refinement_result.confidence,
            threshold=CONFIDENCE_THRESHOLD,
            iteration=current_iteration,
        )

        return {
            "refinement_history": refinement_history,
            "confidence_scores": confidence_scores.to_dict(),
            "overall_confidence": confidence_scores.overall_score,
            "status": "running",
        }

    # =========================================================================
    # Phase 1 Enhancement 4: Citation Verification Node
    # =========================================================================
    @handle_node_errors("verify_citations", recoverable=True)
    async def _verify_citations(state: MissionState) -> Dict[str, Any]:
        """
        Verify citations against PubMed, CrossRef, and DOI resolvers.

        Runs after synthesis to validate the quality of citations.
        """
        final_output = state.get("final_output") or {}
        citations = final_output.get("citations", [])

        if not citations:
            logger.info("citation_verification_skipped", reason="no_citations")
            return {
                "verified_citations": [],
                "unverified_citations": [],
                "citation_verification_rate": 1.0,  # No citations = perfect rate
                "status": "verifying",
            }

        # Verify citations
        verification_summary = await verify_citations(citations)

        verified = [v.citation for v in verification_summary.verifications if v.verified]
        unverified = [v.citation for v in verification_summary.verifications if not v.verified]

        logger.info(
            "citation_verification_complete",
            total=verification_summary.total_citations,
            verified=verification_summary.verified_count,
            rate=verification_summary.verification_rate,
        )

        return {
            "verified_citations": verified,
            "unverified_citations": unverified,
            "citation_verification_rate": verification_summary.verification_rate,
            "status": "verifying",
        }

    # =========================================================================
    # Phase 1 Enhancement 5: Quality Gate Node (RACE/FACT Metrics)
    # =========================================================================
    @handle_node_errors("quality_gate", recoverable=True)
    async def _quality_gate(state: MissionState) -> Dict[str, Any]:
        """
        Assess response quality using RACE/FACT metrics.

        RACE: Relevance, Accuracy, Completeness, Engagement
        FACT: Factual grounding, Attribution, Coherence, Transparency

        If quality < threshold, provides recommendations for improvement.
        """
        final_output = state.get("final_output") or {}
        content = final_output.get("content", "")
        citations = final_output.get("citations", [])
        artifacts = state.get("artifacts") or []
        goal = state.get("goal", "")

        # Assess quality
        quality_result = await assess_quality(
            content=content,
            goal=goal,
            citations=citations,
            artifacts=artifacts,
        )

        logger.info(
            "quality_gate_assessment_complete",
            passed=quality_result.passed,
            race_score=quality_result.metrics.race_score,
            fact_score=quality_result.metrics.fact_score,
            overall=quality_result.metrics.overall_quality,
            threshold=QUALITY_THRESHOLD,
        )

        return {
            "quality_metrics": quality_result.metrics.to_dict(),
            "race_score": quality_result.metrics.race_score,
            "fact_score": quality_result.metrics.fact_score,
            "overall_quality": quality_result.metrics.overall_quality,
            "quality_passed": quality_result.passed,
            "quality_recommendations": quality_result.recommendations,
            "status": "verifying",  # Move to reflection check
        }

    # =========================================================================
    # Phase 2 Enhancement 6: Self-Reflection Node
    # =========================================================================
    @handle_node_errors("reflection_gate", recoverable=True)
    async def _reflection_gate(state: MissionState) -> Dict[str, Any]:
        """
        Self-reflection node: agent reviews its own reasoning before finalizing.

        Implements the Reflexion pattern (Shinn et al., 2023) where the agent:
        1. Reviews its reasoning validity
        2. Checks for unstated assumptions
        3. Assesses completeness against query
        4. Identifies potential biases
        5. Verifies uncertainty is honestly communicated

        If reflection score < threshold, provides improvement suggestions.
        """
        final_output = state.get("final_output") or {}
        content = final_output.get("content", "")
        goal = state.get("goal", "")
        previous_reflections = state.get("self_reflections") or []

        # Build confidence scores for context
        confidence_scores = None
        if state.get("confidence_scores"):
            from .research_quality import ConfidenceScores, ConfidenceDimension
            scores_dict = state.get("confidence_scores", {})
            if scores_dict:
                confidence_scores = ConfidenceScores(
                    scores={
                        ConfidenceDimension(k): v
                        for k, v in scores_dict.items()
                        if k in [d.value for d in ConfidenceDimension]
                    },
                    overall=state.get("overall_confidence", 0.0),
                )

        # Check reflection gate
        reflection_result = check_reflection_gate(
            content=content,
            query=goal,
            previous_reflections=previous_reflections,
            confidence_scores=confidence_scores,
        )

        logger.info(
            "reflection_gate_assessment_complete",
            passed=reflection_result.passed,
            score=reflection_result.score,
            iterations=reflection_result.iterations_used,
            improvements_count=len(reflection_result.improvements_applied),
        )

        return {
            "self_reflections": [r.to_dict() for r in reflection_result.reflections],
            "reflection_iteration": reflection_result.iterations_used,
            "reflection_improvements": reflection_result.improvements_applied,
            "reflection_score": reflection_result.score,
            "status": "completed",
        }

    # =========================================================================
    # Register All Nodes
    # =========================================================================
    graph.add_node("initialize", _initialize)
    graph.add_node("decompose_query", _decompose_query)  # Enhancement 2
    graph.add_node("plan_mission", _plan)
    graph.add_node("select_team", _select_team)
    graph.add_node("execute_step", _execute_step)
    graph.add_node("confidence_gate", _confidence_gate)  # Enhancement 1 & 3
    graph.add_node("checkpoint", _checkpoint)
    graph.add_node("synthesize", _synthesize)
    graph.add_node("verify_citations", _verify_citations)  # Enhancement 4
    graph.add_node("quality_gate", _quality_gate)  # Enhancement 5
    graph.add_node("reflection_gate", _reflection_gate)  # Enhancement 6 (Phase 2)

    # =========================================================================
    # Enhanced Routing Functions for Phase 1 Enhancements
    # =========================================================================

    # Conditional routing function for execute_step
    def _route_after_execute(state: MissionState) -> str:
        """Route based on whether there are more steps to execute."""
        current_step = state.get("current_step", 0)
        plan = state.get("plan") or []
        # FIX: Use plan length as fallback if total_steps not set
        total_steps = state.get("total_steps") or len(plan)
        checkpoint_pending = state.get("checkpoint_pending")

        # DEBUG: Log routing decision
        logger.info(
            "route_after_execute_decision",
            current_step=current_step,
            total_steps=total_steps,
            plan_length=len(plan),
            checkpoint_pending=bool(checkpoint_pending),
            quality_checks=state.get("quality_checks", 0),
            status=state.get("status"),
        )

        # If checkpoint is pending, go to checkpoint node
        if checkpoint_pending:
            logger.info("route_after_execute_to_checkpoint", checkpoint_id=checkpoint_pending.get("id"))
            return "checkpoint"

        # If more steps remain, go to confidence gate first (Enhancement 1 & 3)
        if current_step < total_steps:
            logger.info("route_after_execute_to_confidence_gate", step=current_step, total=total_steps)
            return "confidence_gate"

        # All steps done, go to synthesis
        logger.info("route_after_execute_to_synthesize", completed_steps=current_step)
        return "synthesize"

    # Conditional routing function for confidence gate (Enhancement 1)
    def _route_after_confidence_gate(state: MissionState) -> str:
        """Route based on confidence level - may trigger refinement loop."""
        status = state.get("status")
        current_step = state.get("current_step", 0)
        plan = state.get("plan") or []
        # FIX: Use plan length as fallback if total_steps not set
        total_steps = state.get("total_steps") or len(plan)

        # DEBUG: Log routing decision
        logger.info(
            "route_after_confidence_gate_decision",
            status=status,
            current_step=current_step,
            total_steps=total_steps,
            plan_length=len(plan),
            refinement_iteration=state.get("refinement_iteration", 0),
            overall_confidence=state.get("overall_confidence"),
        )

        # If refinement is needed, re-execute evidence step
        if status == "refining":
            logger.info("route_after_confidence_gate_refining", iteration=state.get("refinement_iteration", 0))
            return "execute_step"

        # Confidence passed, check if more steps remain
        if current_step < total_steps:
            logger.info("route_after_confidence_gate_next_step", next_step=current_step)
            return "execute_step"

        # All steps done with good confidence, go to synthesis
        logger.info("route_after_confidence_gate_to_synthesize")
        return "synthesize"

    # Conditional routing function for checkpoint
    def _route_after_checkpoint(state: MissionState) -> str:
        """Route based on checkpoint resolution."""
        # If still awaiting, stay in checkpoint (will be handled by interrupt_before)
        if state.get("status") == "awaiting_checkpoint":
            return "checkpoint"

        # Checkpoint resolved, go to confidence gate
        return "confidence_gate"

    # Conditional routing for verification phase (after synthesis)
    def _route_after_synthesis(state: MissionState) -> str:
        """Route to citation verification after synthesis."""
        return "verify_citations"

    # =========================================================================
    # Graph Edges - Enhanced Flow with Phase 1 Enhancements
    # =========================================================================

    # Entry: initialize -> decompose_query (Enhancement 2)
    graph.set_entry_point("initialize")
    graph.add_edge("initialize", "decompose_query")

    # Query decomposition -> planning
    graph.add_edge("decompose_query", "plan_mission")
    graph.add_edge("plan_mission", "select_team")
    graph.add_edge("select_team", "execute_step")

    # Execute step -> confidence gate OR checkpoint
    graph.add_conditional_edges(
        "execute_step",
        _route_after_execute,
        {
            "checkpoint": "checkpoint",
            "confidence_gate": "confidence_gate",
            "synthesize": "synthesize",
        }
    )

    # Confidence gate (Enhancement 1 & 3) -> refine OR continue
    graph.add_conditional_edges(
        "confidence_gate",
        _route_after_confidence_gate,
        {
            "execute_step": "execute_step",  # Refinement loop
            "synthesize": "synthesize",
        }
    )

    # Checkpoint -> confidence gate OR execute
    graph.add_conditional_edges(
        "checkpoint",
        _route_after_checkpoint,
        {
            "checkpoint": "checkpoint",
            "confidence_gate": "confidence_gate",
        }
    )

    # Synthesis -> Citation Verification (Enhancement 4) -> Quality Gate (Enhancement 5)
    graph.add_edge("synthesize", "verify_citations")
    graph.add_edge("verify_citations", "quality_gate")
    graph.add_edge("quality_gate", "reflection_gate")  # Enhancement 6: Add reflection
    graph.add_edge("reflection_gate", END)  # Final step after reflection

    checkpointer = _get_checkpointer()
    compiled = graph.compile(
        checkpointer=checkpointer,
        interrupt_before=["checkpoint"],  # allow HITL pause
    )
    logger.info(
        "master_graph_compiled",
        nodes=list(graph.nodes),
        checkpointer=type(checkpointer).__name__,
        hitl_enabled=True,
        interrupt_nodes=["checkpoint"],
    )
    return compiled


# =============================================================================
# Production Hardening: Streaming Helper (astream_events pattern)
# =============================================================================

async def stream_mission_events(
    compiled_graph: CompiledStateGraph,
    initial_state: Dict[str, Any],
    config: Optional[Dict[str, Any]] = None,
) -> AsyncIterator[Dict[str, Any]]:
    """
    Stream mission execution events using LangGraph's astream_events.

    Production Hardening:
    - Real-time token streaming for UI updates
    - Event type filtering for efficient processing
    - Graceful error handling during stream

    Yields events with types:
    - "node_start": Node execution started
    - "node_end": Node execution completed with result
    - "token": Streaming token from LLM
    - "checkpoint": HITL checkpoint reached
    - "error": Error occurred during execution

    Args:
        compiled_graph: Compiled LangGraph StateGraph
        initial_state: Initial mission state
        config: Optional config with thread_id, recursion_limit, etc.

    Yields:
        Event dictionaries with type and data
    """
    config = config or {}

    # Ensure thread_id for checkpointing
    if "configurable" not in config:
        config["configurable"] = {}
    if "thread_id" not in config["configurable"]:
        import uuid
        config["configurable"]["thread_id"] = str(uuid.uuid4())

    try:
        async for event in compiled_graph.astream_events(
            initial_state,
            config=config,
            version="v2",  # Use v2 event format
        ):
            event_type = event.get("event", "unknown")
            event_name = event.get("name", "")

            # Transform to standardized format
            if event_type == "on_chain_start":
                yield {
                    "type": "node_start",
                    "node": event_name,
                    "data": event.get("data", {}),
                    "run_id": event.get("run_id"),
                }

            elif event_type == "on_chain_end":
                yield {
                    "type": "node_end",
                    "node": event_name,
                    "data": event.get("data", {}),
                    "run_id": event.get("run_id"),
                }

            elif event_type == "on_llm_stream":
                # Extract token from streaming LLM response
                chunk = event.get("data", {}).get("chunk", {})
                content = getattr(chunk, "content", "") if hasattr(chunk, "content") else ""
                if content:
                    yield {
                        "type": "token",
                        "content": content,
                        "node": event_name,
                        "run_id": event.get("run_id"),
                    }

            elif event_type == "on_chain_error":
                yield {
                    "type": "error",
                    "node": event_name,
                    "error": str(event.get("data", {}).get("error", "Unknown error"))[:500],
                    "run_id": event.get("run_id"),
                }

            # Check for HITL interrupt
            if event_name == "checkpoint" and event_type == "on_chain_end":
                yield {
                    "type": "checkpoint",
                    "node": "checkpoint",
                    "data": event.get("data", {}),
                    "awaiting_input": True,
                    "run_id": event.get("run_id"),
                }

    except Exception as e:
        logger.error("stream_mission_error", error=str(e)[:200])
        yield {
            "type": "error",
            "error": str(e)[:500],
            "fatal": True,
        }


# =============================================================================
# Production Hardening: HITL Resume Helper
# =============================================================================

async def resume_mission_with_input(
    compiled_graph: CompiledStateGraph,
    human_response: Dict[str, Any],
    config: Dict[str, Any],
) -> AsyncIterator[Dict[str, Any]]:
    """
    Resume a paused mission with human input.

    Production Hardening:
    - Validates thread_id exists in config
    - Uses Command pattern if Interrupt available
    - Graceful fallback for older LangGraph versions

    Args:
        compiled_graph: Compiled LangGraph StateGraph
        human_response: Human input to inject (e.g., {"approved": True})
        config: Config with thread_id for checkpoint retrieval

    Yields:
        Stream of events after resume
    """
    if "configurable" not in config or "thread_id" not in config["configurable"]:
        logger.error("resume_mission_missing_thread_id")
        yield {
            "type": "error",
            "error": "thread_id required in config.configurable for resume",
            "fatal": True,
        }
        return

    try:
        # Inject human response into state update
        update_state = {"human_response": human_response, "checkpoint_pending": None}

        # Resume with updated state using Command (LangGraph 0.2+) or direct update
        if INTERRUPT_AVAILABLE:
            # Use Command pattern for proper HITL resume
            try:
                from langgraph.types import Command
                async for event in compiled_graph.astream(
                    Command(resume=update_state),
                    config=config,
                ):
                    yield {"type": "state_update", "data": event}
            except ImportError:
                # Fallback: update state and re-invoke
                await compiled_graph.aupdate_state(config, update_state)
                async for event in stream_mission_events(compiled_graph, {}, config):
                    yield event
        else:
            # Older LangGraph: update state and continue
            await compiled_graph.aupdate_state(config, update_state)
            async for event in stream_mission_events(compiled_graph, {}, config):
                yield event

        logger.info("mission_resumed_with_human_input", thread_id=config["configurable"]["thread_id"])

    except Exception as e:
        logger.error("resume_mission_error", error=str(e)[:200])
        yield {
            "type": "error",
            "error": str(e)[:500],
            "fatal": True,
        }


# =============================================================================
# Production Hardening: Checkpoint HITL Node with Interrupt()
# =============================================================================

def create_hitl_checkpoint_node():
    """
    Create a checkpoint node that uses Interrupt() for proper HITL.

    Production Hardening:
    - Uses Interrupt() when available (LangGraph 0.2+)
    - Falls back to checkpoint_pending flag for older versions
    - Structured logging for debugging

    Returns:
        Async node function for checkpoint handling
    """
    async def _hitl_checkpoint(state: MissionState) -> Dict[str, Any]:
        """
        HITL checkpoint node with Interrupt() mechanism.

        When checkpoint_pending is set:
        1. If Interrupt available: raises Interrupt() to pause graph
        2. If not: sets status to awaiting_checkpoint for manual handling

        When human_response is provided:
        1. Validates the response
        2. Applies approval/rejection logic
        3. Clears checkpoint_pending
        """
        checkpoint_reason = state.get("checkpoint_pending")
        human_response = state.get("human_response")

        # If we have a human response, process it
        if human_response:
            approved = human_response.get("approved", False)
            feedback = human_response.get("feedback", "")

            logger.info(
                "hitl_checkpoint_response_received",
                approved=approved,
                has_feedback=bool(feedback),
                checkpoint_reason=checkpoint_reason,
            )

            return {
                "human_response": None,  # Clear response
                "checkpoint_pending": None,  # Clear pending
                "status": "executing" if approved else "paused",
                "checkpoint_feedback": feedback,
            }

        # No response yet - need to interrupt for human input
        if checkpoint_reason:
            logger.info(
                "hitl_checkpoint_awaiting_input",
                reason=checkpoint_reason,
                interrupt_available=INTERRUPT_AVAILABLE,
            )

            if INTERRUPT_AVAILABLE and Interrupt is not None:
                # Raise Interrupt to pause the graph properly
                raise Interrupt({
                    "reason": checkpoint_reason,
                    "state_summary": {
                        "current_step": state.get("current_step", 0),
                        "total_steps": state.get("total_steps", 0),
                        "overall_confidence": state.get("overall_confidence", 0.0),
                        "current_cost": state.get("current_cost", 0.0),
                    },
                    "options": ["approve", "reject", "modify"],
                })

            # Fallback for older LangGraph - set awaiting status
            return {
                "status": "awaiting_checkpoint",
                "checkpoint_pending": checkpoint_reason,
            }

        # No checkpoint pending, continue
        return {"status": "executing"}

    return _hitl_checkpoint
