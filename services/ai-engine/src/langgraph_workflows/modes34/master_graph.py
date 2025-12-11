"""
Master graph for Modes 3/4 with typed state, basic routing, and checkpoint hooks.

Flow:
- initialize -> plan -> select_team (mode 4) -> execute_step loop
- quality checkpoint every 3 steps; budget checkpoint at 80% spend (if limit set)
- synthesize -> finalize

Note: mission_stream currently drives orchestration; this graph is aligned for future
LangGraph execution with pause/resume via checkpoint_pending/human_response flags.
"""

from __future__ import annotations

from typing import Any, Dict, List

import os
import structlog
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.state import CompiledStateGraph

try:
    from langgraph.checkpoint.postgres import PostgresSaver  # type: ignore
except Exception:  # pragma: no cover
    PostgresSaver = None  # optional dependency

from .state import MissionState, PlanStep
from .wrappers.l2_wrapper import delegate_to_l2
from .wrappers.l3_wrapper import delegate_to_l3
from .wrappers.l4_wrapper import delegate_to_l4
from .agent_selector import select_team
from services.runner_registry import runner_registry


logger = structlog.get_logger(__name__)


def _get_checkpointer():
    """Choose PostgresSaver if DATABASE_URL is set, otherwise MemorySaver."""
    db_url = os.getenv("DATABASE_URL")
    if db_url and PostgresSaver:
        try:
            logger.info("using_postgres_checkpointer")
            return PostgresSaver.from_conn_string(db_url)
        except Exception as exc:  # pragma: no cover
            logger.warning("postgres_checkpointer_failed_fallback_memory", error=str(exc))
    logger.info("using_memory_checkpointer")
    return MemorySaver()


def build_master_graph() -> CompiledStateGraph:
    graph = StateGraph(MissionState)

    async def _initialize(state: MissionState) -> Dict[str, Any]:
        return {"status": "planning", "current_step": 0, "artifacts": [], "current_cost": 0.0, "quality_checks": 0}

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

    async def _select_team(state: MissionState) -> Dict[str, Any]:
        if state.get("mode") == 4:
            team = select_team(
                state.get("goal", ""),
                {
                    "template_id": state.get("template_id"),
                    "template_family": state.get("template_family"),
                    "template_cat": state.get("template_cat"),
                },
            )
            return {"selected_team": team, "status": "running"}
        return {"status": "running"}

    async def _execute_step(state: MissionState) -> Dict[str, Any]:
        plan = state.get("plan") or []
        artifacts = state.get("artifacts") or []
        idx = state.get("current_step", 0)
        if idx >= len(plan):
            return {"status": "running"}

        step = plan[idx]
        delegate = step.get("agent", "L2")
        # Build context with goal, tools, and runner from step
        ctx = {
            "goal": state.get("goal"),
            "template_id": state.get("template_id"),
            "stage": step.get("stage"),
            "plan_tools": step.get("tools", []),  # Pass tools to L4 for L5 invocation
            "runner": step.get("runner"),
        }

        logger.info(
            "execute_step_delegation",
            step_id=step.get("id"),
            delegate=delegate,
            stage=step.get("stage"),
            tools=step.get("tools"),
            runner=step.get("runner"),
        )

        if delegate == "L2":
            res = await delegate_to_l2(expert_code=state.get("selected_agent") or "domain_lead", task=step.get("description", ""), context=ctx)
        elif delegate == "L3":
            res = await delegate_to_l3(specialist_code="context_specialist", task=step.get("description", ""), context=ctx)
        else:
            # L4 worker - use "evidence" worker code with plan_tools for L5 tool invocation
            res = await delegate_to_l4(worker_code=step.get("runner") or "evidence", task=step.get("description", ""), context=ctx)

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
            trigger_after = tpl_cp.get("after_step_id") or tpl_cp.get("after_step")
            if trigger_after == step_id:
                checkpoint_pending = {
                    "id": tpl_cp.get("id") or f"cp_template_{step_id}",
                    "type": tpl_cp.get("type", "approval"),
                    "title": tpl_cp.get("title", "Template Checkpoint"),
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

        return {
            "artifacts": artifacts,
            "plan": plan,
            "current_step": idx + 1,
            "current_cost": new_cost,
            "quality_checks": quality_checks,
            "checkpoint_pending": checkpoint_pending,
            "status": status,
        }

    async def _checkpoint(state: MissionState) -> Dict[str, Any]:
        if state.get("checkpoint_pending") and not state.get("human_response"):
            return {"status": "awaiting_checkpoint"}
        return {"status": "running", "checkpoint_pending": None, "human_response": None}

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

        logger.info(
            "synthesis_complete_world_class",
            artifact_count=len(artifacts),
            findings_count=len(full_findings),
            citation_count=len(unique_citations),
            report_length=len(content),
        )

        return {
            "final_output": {
                "content": content,
                "citations": unique_citations,
                "artifact_count": len(artifacts),
                "findings": full_findings,  # Preserve for downstream use
                "evidence_trail": evidence_details,
            },
            "status": "completed"
        }

    graph.add_node("initialize", _initialize)
    graph.add_node("plan_mission", _plan)  # Renamed from "plan" to avoid state key conflict
    graph.add_node("select_team", _select_team)
    graph.add_node("execute_step", _execute_step)
    graph.add_node("checkpoint", _checkpoint)
    graph.add_node("synthesize", _synthesize)

    # Conditional routing function for execute_step
    def _route_after_execute(state: MissionState) -> str:
        """Route based on whether there are more steps to execute."""
        current_step = state.get("current_step", 0)
        total_steps = state.get("total_steps", 0)
        checkpoint_pending = state.get("checkpoint_pending")

        # If checkpoint is pending, go to checkpoint node
        if checkpoint_pending:
            return "checkpoint"

        # If more steps remain, loop back to execute_step
        if current_step < total_steps:
            return "execute_step"

        # All steps done, go to synthesis
        return "synthesize"

    # Conditional routing function for checkpoint
    def _route_after_checkpoint(state: MissionState) -> str:
        """Route based on checkpoint resolution."""
        # If still awaiting, stay in checkpoint (will be handled by interrupt_before)
        if state.get("status") == "awaiting_checkpoint":
            return "checkpoint"

        # Checkpoint resolved, continue execution
        current_step = state.get("current_step", 0)
        total_steps = state.get("total_steps", 0)

        if current_step < total_steps:
            return "execute_step"
        return "synthesize"

    graph.set_entry_point("initialize")
    graph.add_edge("initialize", "plan_mission")
    graph.add_edge("plan_mission", "select_team")
    graph.add_edge("select_team", "execute_step")

    # Use conditional edges for proper step looping
    graph.add_conditional_edges(
        "execute_step",
        _route_after_execute,
        {
            "checkpoint": "checkpoint",
            "execute_step": "execute_step",
            "synthesize": "synthesize",
        }
    )

    graph.add_conditional_edges(
        "checkpoint",
        _route_after_checkpoint,
        {
            "checkpoint": "checkpoint",
            "execute_step": "execute_step",
            "synthesize": "synthesize",
        }
    )

    graph.add_edge("synthesize", END)

    checkpointer = _get_checkpointer()
    compiled = graph.compile(
        checkpointer=checkpointer,
        interrupt_before=["checkpoint"],  # allow HITL pause
    )
    logger.info("master_graph_compiled", nodes=list(graph.nodes), checkpointer=type(checkpointer).__name__)
    return compiled
