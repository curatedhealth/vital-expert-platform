"""
Task Assembler - Implements TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import structlog

from .base import BaseRunner, RunnerInput, KnowledgeLayer
from .registry import RunnerRegistry

logger = structlog.get_logger()


@dataclass
class PersonaConfig:
    """Persona configuration for task assembly"""
    persona_id: str
    name: str
    archetype: str  # Analyst, Strategist, Critic, Synthesizer, etc.
    tone: str
    expertise_areas: List[str] = field(default_factory=list)
    behavioral_traits: Dict[str, Any] = field(default_factory=dict)


@dataclass
class KnowledgeConfig:
    """Knowledge configuration for task assembly"""
    layers: List[KnowledgeLayer] = field(default_factory=list)
    domains: List[str] = field(default_factory=list)
    sources: List[Dict[str, Any]] = field(default_factory=list)
    rag_enabled: bool = True
    web_search_enabled: bool = True


@dataclass
class ContextConfig:
    """Context configuration for task assembly"""
    mission_id: Optional[str] = None
    session_id: Optional[str] = None
    tenant_id: Optional[str] = None
    user_id: Optional[str] = None
    constraints: Dict[str, Any] = field(default_factory=dict)
    history: List[Dict[str, Any]] = field(default_factory=list)
    goals: List[str] = field(default_factory=list)


@dataclass
class AssembledTask:
    """Fully assembled task ready for execution"""
    task: str
    runner: BaseRunner
    persona: PersonaConfig
    knowledge: KnowledgeConfig
    context: ContextConfig

    def to_runner_input(self) -> RunnerInput:
        """Convert to RunnerInput for execution"""
        return RunnerInput(
            task=self.task,
            context={
                "persona": {
                    "id": self.persona.persona_id,
                    "archetype": self.persona.archetype,
                    "tone": self.persona.tone,
                },
                "mission_id": self.context.mission_id,
                "session_id": self.context.session_id,
                "tenant_id": self.context.tenant_id,
                "history": self.context.history,
                "sources": self.knowledge.sources,
            },
            persona_id=self.persona.persona_id,
            knowledge_layers=self.knowledge.layers,
            constraints=self.context.constraints,
        )


class TaskAssembler:
    """
    Assembles tasks from the four libraries.

    Formula: TASK = PERSONA + SKILL + KNOWLEDGE + CONTEXT

    The assembler:
    1. Selects appropriate runner (SKILL) based on task type
    2. Applies persona configuration (behavioral layer)
    3. Injects knowledge context (domain expertise)
    4. Adds execution context (session, constraints, history)
    """

    def __init__(self):
        self.registry = RunnerRegistry()

    async def assemble(
        self,
        task: str,
        runner_id: str,
        persona: PersonaConfig,
        knowledge: KnowledgeConfig,
        context: ContextConfig,
    ) -> AssembledTask:
        """
        Assemble a complete task from components.
        """
        # Get runner from registry
        runner = self.registry.get(runner_id)
        if not runner:
            raise ValueError(f"Runner not found: {runner_id}")

        # Validate knowledge layers match runner requirements
        missing_layers = set(runner.required_knowledge_layers) - set(knowledge.layers)
        if missing_layers:
            logger.warning(
                "missing_knowledge_layers",
                runner_id=runner_id,
                missing=list(missing_layers),
            )

        # Assemble task
        assembled = AssembledTask(
            task=task,
            runner=runner,
            persona=persona,
            knowledge=knowledge,
            context=context,
        )

        logger.info(
            "task_assembled",
            runner_id=runner_id,
            persona=persona.persona_id,
            knowledge_layers=[l.value for l in knowledge.layers],
        )

        return assembled

    async def auto_select_runner(
        self,
        task: str,
        context: ContextConfig,
    ) -> str:
        """
        Automatically select best runner for a task.
        Uses task classification to match to runner categories.
        """
        # Task classification keywords
        classification_keywords = {
            "critique": ["review", "assess", "evaluate", "critique", "analyze quality", "audit"],
            "synthesize": ["combine", "synthesize", "summarize", "merge", "integrate", "consolidate"],
            "decompose": ["break down", "decompose", "split", "divide", "plan", "structure"],
            "validate": ["validate", "verify", "check", "confirm", "test", "ensure"],
            "predict": ["predict", "forecast", "project", "estimate future", "anticipate"],
            "recommend": ["recommend", "suggest", "advise", "propose", "guide"],
            "investigate": ["research", "investigate", "explore", "discover", "find", "search"],
        }

        task_lower = task.lower()

        for runner_type, keywords in classification_keywords.items():
            if any(kw in task_lower for kw in keywords):
                return f"{runner_type}_basic"

        # Default to synthesize for general tasks
        return "synthesize_basic"

    async def execute_assembled(
        self,
        assembled: AssembledTask,
    ) -> Dict[str, Any]:
        """Execute an assembled task and return results"""
        runner_input = assembled.to_runner_input()
        output = await assembled.runner.execute(runner_input)
        return output.to_dict()
