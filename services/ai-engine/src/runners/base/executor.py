"""
Runner Executor - Bridge between database runner metadata and cognitive runners.

This module connects:
1. services/runner_registry.py (database-backed metadata)
2. runners/registry.py (cognitive runner implementations)

And provides mission-level execution with streaming support.
"""

from __future__ import annotations

from typing import Any, AsyncIterator, Dict, List, Optional
import structlog

from .base import (
    BaseRunner,
    RunnerInput,
    RunnerOutput,
    RunnerCategory,
    KnowledgeLayer,
)
from .registry import RunnerRegistry, runner_registry as cognitive_registry
from .assembler import TaskAssembler, PersonaConfig, KnowledgeConfig, ContextConfig

logger = structlog.get_logger()


# Mapping from database stage names to cognitive runner categories
STAGE_TO_CATEGORY: Dict[str, RunnerCategory] = {
    "planning": RunnerCategory.PLAN,
    "decompose": RunnerCategory.PLAN,
    "plan": RunnerCategory.PLAN,
    "evidence": RunnerCategory.INVESTIGATE,
    "research": RunnerCategory.INVESTIGATE,
    "investigate": RunnerCategory.INVESTIGATE,
    "analysis": RunnerCategory.EVALUATE,
    "evaluate": RunnerCategory.EVALUATE,
    "assess": RunnerCategory.EVALUATE,
    "critique": RunnerCategory.EVALUATE,
    "synthesis": RunnerCategory.SYNTHESIZE,
    "synthesize": RunnerCategory.SYNTHESIZE,
    "summarize": RunnerCategory.SYNTHESIZE,
    "qa": RunnerCategory.VALIDATE,
    "validate": RunnerCategory.VALIDATE,
    "verify": RunnerCategory.VALIDATE,
    "decision": RunnerCategory.DECIDE,
    "recommend": RunnerCategory.DECIDE,
}

# Mapping from database run_code to cognitive runner IDs
CODE_TO_RUNNER: Dict[str, str] = {
    "plan": "decompose_basic",
    "decompose": "decompose_basic",
    "clarify": "decompose_basic",
    "scan": "investigate_basic",
    "map": "investigate_basic",
    "research": "investigate_advanced",
    "rank": "critique_basic",
    "assess_risk": "critique_advanced",
    "validate_evidence": "validate_basic",
    "compare": "critique_basic",
    "synthesize": "synthesize_basic",
    "compose": "synthesize_advanced",
    "contextualize": "synthesize_basic",
    "audit": "validate_advanced",
    "proofread": "validate_basic",
    "recommend": "recommend_basic",
    "decide": "recommend_advanced",
}


class RunnerExecutor:
    """
    Executes cognitive runners within mission steps.

    Bridges the database runner metadata with actual cognitive runner implementations.
    Provides both sync and streaming execution modes.
    """

    def __init__(self):
        self.cognitive_registry = cognitive_registry
        self.assembler = TaskAssembler()
        self._db_registry = None

    @property
    def db_registry(self):
        """Lazy load database registry to avoid circular imports."""
        if self._db_registry is None:
            from services.workflows.runner_registry import runner_registry
            self._db_registry = runner_registry
        return self._db_registry

    def get_runner_for_stage(self, stage: str) -> Optional[BaseRunner]:
        """
        Get cognitive runner for a given stage.

        Args:
            stage: Stage name (planning, evidence, analysis, synthesis, qa)

        Returns:
            BaseRunner instance or None if not found
        """
        # First try to get from database registry
        db_runner = self.db_registry.pick_for_stage(stage)
        if db_runner:
            run_code = db_runner.get("run_code")
            # Map database run_code to cognitive runner ID
            runner_id = CODE_TO_RUNNER.get(run_code)
            if runner_id:
                runner = self.cognitive_registry.get(runner_id)
                if runner:
                    logger.debug(
                        "runner_matched",
                        stage=stage,
                        run_code=run_code,
                        runner_id=runner_id,
                    )
                    return runner

        # Fallback: map stage directly to category
        category = STAGE_TO_CATEGORY.get(stage.lower())
        if category:
            runners = self.cognitive_registry.get_by_category(category)
            if runners:
                # Prefer basic variant
                for r in runners:
                    if "basic" in r.runner_id:
                        return r
                return runners[0]

        logger.warning("runner_not_found", stage=stage)
        return None

    def get_runner_for_code(self, run_code: str) -> Optional[BaseRunner]:
        """
        Get cognitive runner by database run_code.

        Args:
            run_code: Runner code from vital_runners table

        Returns:
            BaseRunner instance or None if not found
        """
        runner_id = CODE_TO_RUNNER.get(run_code)
        if runner_id:
            return self.cognitive_registry.get(runner_id)

        # Try direct lookup
        return self.cognitive_registry.get(run_code)

    async def execute_step(
        self,
        step: Dict[str, Any],
        context: Dict[str, Any],
        persona: Optional[PersonaConfig] = None,
    ) -> RunnerOutput:
        """
        Execute a single mission step using the appropriate cognitive runner.

        Args:
            step: Step configuration from mission plan
            context: Execution context (goal, session_id, tenant_id, etc.)

        Returns:
            RunnerOutput with result, confidence, quality scores
        """
        stage = step.get("stage", "analysis")
        run_code = step.get("runner")
        task = step.get("description", "")

        # Get runner
        runner = None
        if run_code:
            runner = self.get_runner_for_code(run_code)
        if not runner:
            runner = self.get_runner_for_stage(stage)

        if not runner:
            logger.error("no_runner_for_step", step_id=step.get("id"), stage=stage)
            return RunnerOutput(
                result={"error": f"No runner found for stage: {stage}"},
                confidence=0.0,
                quality_scores={},
                sources=[],
                artifacts=[],
                iterations_used=0,
                tokens_used=0,
                cost_usd=0.0,
                duration_ms=0,
            )

        # Build persona if not provided
        if not persona:
            persona = PersonaConfig(
                persona_id="default",
                name="Mission Agent",
                archetype="analyst",
                tone="professional",
            )

        # Build knowledge config
        knowledge = KnowledgeConfig(
            layers=[KnowledgeLayer.L1_FUNCTION],
            domains=context.get("domains", []),
            rag_enabled=context.get("rag_enabled", True),
            web_search_enabled=context.get("web_search_enabled", True),
        )

        # Build context config
        ctx_config = ContextConfig(
            mission_id=context.get("mission_id"),
            session_id=context.get("session_id"),
            tenant_id=context.get("tenant_id"),
            constraints=context.get("constraints", {}),
            history=context.get("history", []),
            goals=[context.get("goal", "")],
        )

        # Assemble and execute
        assembled = await self.assembler.assemble(
            task=task,
            runner_id=runner.runner_id,
            persona=persona,
            knowledge=knowledge,
            context=ctx_config,
        )

        logger.info(
            "executing_step",
            step_id=step.get("id"),
            runner_id=runner.runner_id,
            task_preview=task[:100],
        )

        return await assembled.runner.execute(assembled.to_runner_input())

    async def execute_step_streaming(
        self,
        step: Dict[str, Any],
        context: Dict[str, Any],
        persona: Optional[PersonaConfig] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Execute a step with streaming output for real-time UI updates.

        Yields SSE-compatible events:
        - thinking: Token-by-token output
        - progress: Step progress updates
        - quality: Quality metric updates
        - complete: Final result

        Args:
            step: Step configuration
            context: Execution context

        Yields:
            Dict events for SSE streaming
        """
        stage = step.get("stage", "analysis")
        run_code = step.get("runner")
        task = step.get("description", "")
        step_id = step.get("id", "unknown")

        # Get runner
        runner = None
        if run_code:
            runner = self.get_runner_for_code(run_code)
        if not runner:
            runner = self.get_runner_for_stage(stage)

        if not runner:
            yield {
                "event": "error",
                "step_id": step_id,
                "message": f"No runner found for stage: {stage}",
            }
            return

        # Emit start event
        yield {
            "event": "step_start",
            "step_id": step_id,
            "runner_id": runner.runner_id,
            "runner_name": runner.name,
            "category": runner.category.value,
        }

        # Build persona if not provided
        if not persona:
            persona = PersonaConfig(
                persona_id="default",
                name="Mission Agent",
                archetype="analyst",
                tone="professional",
            )

        # Build runner input
        knowledge_layers = [KnowledgeLayer.L1_FUNCTION]
        runner_input = RunnerInput(
            task=task,
            context={
                "mission_id": context.get("mission_id"),
                "session_id": context.get("session_id"),
                "goal": context.get("goal"),
                "persona": {
                    "id": persona.persona_id,
                    "archetype": persona.archetype,
                    "tone": persona.tone,
                },
            },
            persona_id=persona.persona_id,
            knowledge_layers=knowledge_layers,
            constraints=context.get("constraints", {}),
        )

        # Stream execution
        token_index = 0
        async for chunk in runner.execute_streaming(runner_input):
            if chunk.get("type") == "token":
                yield {
                    "event": "thinking",
                    "step_id": step_id,
                    "token": chunk.get("content", ""),
                    "token_index": token_index,
                }
                token_index += 1
            elif chunk.get("type") == "progress":
                yield {
                    "event": "progress",
                    "step_id": step_id,
                    "iteration": chunk.get("iteration", 0),
                    "max_iterations": chunk.get("max_iterations", 3),
                    "quality_score": chunk.get("quality_score", 0),
                }
            elif chunk.get("type") == "complete":
                output = chunk.get("output")
                yield {
                    "event": "step_complete",
                    "step_id": step_id,
                    "runner_id": runner.runner_id,
                    "result": output.to_dict() if hasattr(output, "to_dict") else output,
                    "confidence": output.confidence if hasattr(output, "confidence") else 0.8,
                    "quality_scores": output.quality_scores if hasattr(output, "quality_scores") else {},
                    "iterations": chunk.get("iterations", 1),
                }

    async def execute_plan(
        self,
        plan: List[Dict[str, Any]],
        context: Dict[str, Any],
        persona: Optional[PersonaConfig] = None,
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        Execute a full mission plan with streaming.

        Args:
            plan: List of steps from mission planning
            context: Execution context

        Yields:
            SSE events for each step and overall progress
        """
        total_steps = len(plan)
        artifacts = []

        yield {
            "event": "plan_start",
            "total_steps": total_steps,
            "mission_id": context.get("mission_id"),
        }

        for idx, step in enumerate(plan):
            step_id = step.get("id", f"step_{idx + 1}")

            # Emit step progress
            yield {
                "event": "progress",
                "current_step": idx + 1,
                "total_steps": total_steps,
                "percent": int(((idx) / total_steps) * 100),
                "step_id": step_id,
                "step_name": step.get("name", ""),
            }

            # Execute step with streaming
            step_result = None
            async for event in self.execute_step_streaming(step, context, persona):
                yield event
                if event.get("event") == "step_complete":
                    step_result = event

            # Collect artifact
            if step_result:
                artifacts.append({
                    "id": step_id,
                    "summary": step_result.get("result", {}).get("summary", ""),
                    "step": step.get("name"),
                    "runner": step_result.get("runner_id"),
                    "confidence": step_result.get("confidence", 0.8),
                })

        # Emit completion
        yield {
            "event": "plan_complete",
            "mission_id": context.get("mission_id"),
            "total_steps": total_steps,
            "artifacts": artifacts,
        }


# Singleton instance
runner_executor = RunnerExecutor()
