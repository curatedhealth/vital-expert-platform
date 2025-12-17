"""
DESIGN Task Runners - Design & Architecture.

This module provides task runners for design and architecture:
- RequirementRunner: Gather requirements using requirements elicitation
- ArchitectRunner: Design architecture using architectural patterns
- PrototypeRunner: Build prototype using rapid prototyping
- UsabilityRunner: Test usability using usability heuristics

Core Logic: Design Thinking / Systems Architecture

Design Pipeline:
    Requirement → Architect → Prototype → Usability

Example:
    >>> from langgraph_workflows.task_runners.design import (
    ...     RequirementRunner, ArchitectRunner, PrototypeRunner, UsabilityRunner,
    ... )
"""

from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

from typing import Any, Dict, List, Optional
from pydantic import Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# REQUIREMENT RUNNER
# =============================================================================

class RequirementInput(TaskRunnerInput):
    project_description: str = Field(..., description="Project to gather requirements for")
    stakeholders: List[str] = Field(default_factory=list)
    requirement_types: List[str] = Field(default_factory=lambda: ["functional", "non_functional", "constraints"])

class Requirement(TaskRunnerOutput):
    requirement_id: str = Field(default="")
    requirement_type: str = Field(default="functional", description="functional | non_functional | constraint")
    title: str = Field(default="")
    description: str = Field(default="")
    priority: str = Field(default="medium", description="low | medium | high | critical")
    source: str = Field(default="")
    acceptance_criteria: List[str] = Field(default_factory=list)

class RequirementOutput(TaskRunnerOutput):
    requirements: List[Requirement] = Field(default_factory=list)
    requirements_by_type: Dict[str, List[str]] = Field(default_factory=dict)
    coverage_assessment: str = Field(default="")
    gaps: List[str] = Field(default_factory=list)
    requirement_summary: str = Field(default="")

@register_task_runner
class RequirementRunner(TaskRunner[RequirementInput, RequirementOutput]):
    runner_id = "requirement"
    name = "Requirement Runner"
    description = "Gather requirements using requirements elicitation"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "requirements_elicitation"
    max_duration_seconds = 150
    InputType = RequirementInput
    OutputType = RequirementOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=4000)

    async def execute(self, input: RequirementInput) -> RequirementOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Elicit requirements for: {input.project_description}. Stakeholders: {input.stakeholders}. Types: {input.requirement_types}. Return JSON with requirements array."
            response = await self.llm.ainvoke([SystemMessage(content="You gather comprehensive requirements."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            requirements = [Requirement(**r) for r in result.get("requirements", [])]
            return RequirementOutput(success=True, requirements=requirements, gaps=result.get("gaps", []), requirement_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return RequirementOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# ARCHITECT RUNNER
# =============================================================================

class ArchitectInput(TaskRunnerInput):
    requirements: List[str] = Field(..., description="Requirements to satisfy")
    constraints: List[str] = Field(default_factory=list)
    architecture_style: str = Field(default="layered", description="layered | microservices | event_driven | serverless")

class ArchitectureComponent(TaskRunnerOutput):
    component_id: str = Field(default="")
    component_name: str = Field(default="")
    component_type: str = Field(default="")
    responsibilities: List[str] = Field(default_factory=list)
    interfaces: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)

class ArchitectOutput(TaskRunnerOutput):
    components: List[ArchitectureComponent] = Field(default_factory=list)
    patterns_applied: List[str] = Field(default_factory=list)
    architecture_diagram: str = Field(default="")
    tradeoffs: List[str] = Field(default_factory=list)
    architecture_summary: str = Field(default="")

@register_task_runner
class ArchitectRunner(TaskRunner[ArchitectInput, ArchitectOutput]):
    runner_id = "architect"
    name = "Architect Runner"
    description = "Design architecture using architectural patterns"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "architectural_patterns"
    max_duration_seconds = 150
    InputType = ArchitectInput
    OutputType = ArchitectOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=4000)

    async def execute(self, input: ArchitectInput) -> ArchitectOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Design {input.architecture_style} architecture for requirements: {input.requirements}. Constraints: {input.constraints}. Return JSON with components array."
            response = await self.llm.ainvoke([SystemMessage(content="You design system architectures."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            components = [ArchitectureComponent(**c) for c in result.get("components", [])]
            return ArchitectOutput(success=True, components=components, patterns_applied=result.get("patterns", []), tradeoffs=result.get("tradeoffs", []), architecture_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return ArchitectOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# PROTOTYPE RUNNER
# =============================================================================

class PrototypeInput(TaskRunnerInput):
    concept: str = Field(..., description="Concept to prototype")
    fidelity: str = Field(default="medium", description="low | medium | high")
    prototype_type: str = Field(default="interactive", description="sketch | wireframe | interactive | functional")

class PrototypeOutput(TaskRunnerOutput):
    prototype_spec: str = Field(default="")
    screens: List[str] = Field(default_factory=list)
    interactions: List[str] = Field(default_factory=list)
    test_scenarios: List[str] = Field(default_factory=list)
    prototype_summary: str = Field(default="")

@register_task_runner
class PrototypeRunner(TaskRunner[PrototypeInput, PrototypeOutput]):
    runner_id = "prototype"
    name = "Prototype Runner"
    description = "Build prototype using rapid prototyping"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "rapid_prototyping"
    max_duration_seconds = 120
    InputType = PrototypeInput
    OutputType = PrototypeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3500)

    async def execute(self, input: PrototypeInput) -> PrototypeOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Design {input.fidelity} fidelity {input.prototype_type} prototype for: {input.concept}. Return JSON with prototype spec."
            response = await self.llm.ainvoke([SystemMessage(content="You create rapid prototypes."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return PrototypeOutput(success=True, prototype_spec=result.get("spec", ""), screens=result.get("screens", []), interactions=result.get("interactions", []), test_scenarios=result.get("scenarios", []), prototype_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return PrototypeOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# USABILITY RUNNER
# =============================================================================

class UsabilityInput(TaskRunnerInput):
    design_description: str = Field(..., description="Design to evaluate")
    target_users: List[str] = Field(default_factory=list)
    heuristics: List[str] = Field(default_factory=lambda: ["visibility", "feedback", "consistency", "error_prevention", "efficiency"])

class UsabilityIssue(TaskRunnerOutput):
    issue_id: str = Field(default="")
    heuristic: str = Field(default="")
    description: str = Field(default="")
    severity: str = Field(default="medium", description="cosmetic | minor | major | critical")
    location: str = Field(default="")
    recommendation: str = Field(default="")

class UsabilityOutput(TaskRunnerOutput):
    usability_score: float = Field(default=0, description="0-100")
    issues: List[UsabilityIssue] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    usability_summary: str = Field(default="")

@register_task_runner
class UsabilityRunner(TaskRunner[UsabilityInput, UsabilityOutput]):
    runner_id = "usability"
    name = "Usability Runner"
    description = "Test usability using usability heuristics"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "usability_heuristics"
    max_duration_seconds = 120
    InputType = UsabilityInput
    OutputType = UsabilityOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=3500)

    async def execute(self, input: UsabilityInput) -> UsabilityOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"Evaluate usability of: {input.design_description}. Users: {input.target_users}. Heuristics: {input.heuristics}. Return JSON with issues and score."
            response = await self.llm.ainvoke([SystemMessage(content="You evaluate usability using Nielsen's heuristics."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            issues = [UsabilityIssue(**i) for i in result.get("issues", [])]
            return UsabilityOutput(success=True, usability_score=float(result.get("score", 70)), issues=issues, strengths=result.get("strengths", []), recommendations=result.get("recommendations", []), usability_summary=result.get("summary", ""), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)
        except Exception as e:
            return UsabilityOutput(success=False, error=str(e), duration_seconds=(datetime.utcnow()-start_time).total_seconds(), runner_id=self.runner_id)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


__all__ = [
    "RequirementRunner", "RequirementInput", "RequirementOutput", "Requirement",
    "ArchitectRunner", "ArchitectInput", "ArchitectOutput", "ArchitectureComponent",
    "PrototypeRunner", "PrototypeInput", "PrototypeOutput",
    "UsabilityRunner", "UsabilityInput", "UsabilityOutput", "UsabilityIssue",
]
