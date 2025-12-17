"""
DESIGN Task Runners - Design & Architecture.

This module provides task runners for design and architecture (17 total):
- RequirementRunner: Gather requirements using requirements elicitation
- ArchitectRunner: Design architecture using architectural patterns
- PrototypeRunner: Build prototype using rapid prototyping
- UsabilityRunner: Test usability using usability heuristics
- PanelDesignRunner: Design panel discussions
- WorkflowDesignRunner: Design workflow DAGs
- EvalDesignRunner: Design evaluation rubrics
- ResearchDesignRunner: Design research plans
- ScenarioAxisDefinerRunner: Define scenario axes
- SignalDefinerRunner: Define monitoring signals
- ProductPositionerRunner: Design product positioning
- PlaceChannelDesignerRunner: Design channel architecture
- ArchitectureGeneratorRunner: Generate portfolio architecture
- ContentStrategistRunner: Design content strategy
- RealWorldEvidenceMapperRunner: Map RWE opportunities
- TrainingProgramDesignerRunner: Design training programs
- KPIFrameworkDeveloperRunner: Develop KPI frameworks

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


# =============================================================================
# PANEL DESIGN RUNNER
# =============================================================================

class PanelDesignInput(TaskRunnerInput):
    """Input for designing panel interviews/discussions."""
    topic: str = Field(..., description="Topic for the panel discussion")
    goal: str = Field(..., description="Goal of the panel discussion")
    panel_size: int = Field(default=3, description="Number of panelists (2-7)")
    duration_minutes: int = Field(default=60, description="Expected duration in minutes")
    audience: str = Field(default="general", description="Target audience")
    format: str = Field(default="moderated", description="moderated | roundtable | debate | interview")

class PanelRole(TaskRunnerOutput):
    """A role in the panel discussion."""
    role_id: str = Field(default="")
    role_name: str = Field(default="")
    expertise_area: str = Field(default="")
    perspective: str = Field(default="")
    key_questions: List[str] = Field(default_factory=list)
    talking_points: List[str] = Field(default_factory=list)

class DiscussionSegment(TaskRunnerOutput):
    """A segment of the panel discussion."""
    segment_id: str = Field(default="")
    segment_name: str = Field(default="")
    duration_minutes: int = Field(default=10)
    objective: str = Field(default="")
    lead_role: str = Field(default="")
    discussion_prompts: List[str] = Field(default_factory=list)
    expected_outcomes: List[str] = Field(default_factory=list)

class PanelDesignOutput(TaskRunnerOutput):
    """Output from panel design."""
    panel_title: str = Field(default="")
    roles: List[PanelRole] = Field(default_factory=list)
    segments: List[DiscussionSegment] = Field(default_factory=list)
    opening_statement: str = Field(default="")
    closing_statement: str = Field(default="")
    moderation_notes: List[str] = Field(default_factory=list)
    audience_engagement: List[str] = Field(default_factory=list)
    panel_design_summary: str = Field(default="")

@register_task_runner
class PanelDesignRunner(TaskRunner[PanelDesignInput, PanelDesignOutput]):
    """Design panel interview structure using discussion architecture."""
    runner_id = "panel_design"
    name = "Panel Design Runner"
    description = "Design panel interview using discussion architecture"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "discussion_architecture"
    max_duration_seconds = 150
    InputType = PanelDesignInput
    OutputType = PanelDesignOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=4000)

    async def execute(self, input: PanelDesignInput) -> PanelDesignOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Design a {input.format} panel discussion structure.

Topic: {input.topic}
Goal: {input.goal}
Panel Size: {input.panel_size} panelists
Duration: {input.duration_minutes} minutes
Audience: {input.audience}

Return JSON with:
- panel_title: string
- roles: array of {{role_id, role_name, expertise_area, perspective, key_questions[], talking_points[]}}
- segments: array of {{segment_id, segment_name, duration_minutes, objective, lead_role, discussion_prompts[], expected_outcomes[]}}
- opening_statement: string
- closing_statement: string
- moderation_notes: array of strings
- audience_engagement: array of engagement strategies
- summary: string"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are an expert panel discussion architect. Design engaging, balanced panel structures that achieve discussion goals while representing diverse perspectives."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            roles = [PanelRole(**r) for r in result.get("roles", [])]
            segments = [DiscussionSegment(**s) for s in result.get("segments", [])]

            return PanelDesignOutput(
                success=True,
                panel_title=result.get("panel_title", ""),
                roles=roles,
                segments=segments,
                opening_statement=result.get("opening_statement", ""),
                closing_statement=result.get("closing_statement", ""),
                moderation_notes=result.get("moderation_notes", []),
                audience_engagement=result.get("audience_engagement", []),
                panel_design_summary=result.get("summary", ""),
                confidence_score=0.85,
                quality_score=len(roles) * 0.15 + len(segments) * 0.1,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"PanelDesignRunner error: {e}")
            return PanelDesignOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# WORKFLOW DESIGN RUNNER
# =============================================================================

class WorkflowDesignInput(TaskRunnerInput):
    """Input for designing workflows."""
    goal: str = Field(..., description="Goal the workflow should achieve")
    constraints: List[str] = Field(default_factory=list, description="Constraints on the workflow")
    inputs_available: List[str] = Field(default_factory=list, description="Available inputs")
    outputs_required: List[str] = Field(default_factory=list, description="Required outputs")
    workflow_type: str = Field(default="sequential", description="sequential | parallel | conditional | iterative")
    max_steps: int = Field(default=10, description="Maximum number of steps")

class WorkflowNode(TaskRunnerOutput):
    """A node in the workflow DAG."""
    node_id: str = Field(default="")
    node_name: str = Field(default="")
    node_type: str = Field(default="task", description="start | task | decision | fork | join | end")
    description: str = Field(default="")
    inputs: List[str] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    estimated_duration: str = Field(default="")
    responsible_role: str = Field(default="")

class WorkflowEdge(TaskRunnerOutput):
    """An edge connecting workflow nodes."""
    edge_id: str = Field(default="")
    from_node: str = Field(default="")
    to_node: str = Field(default="")
    condition: Optional[str] = Field(default=None)
    edge_type: str = Field(default="sequence", description="sequence | conditional | parallel")

class WorkflowDesignOutput(TaskRunnerOutput):
    """Output from workflow design."""
    workflow_name: str = Field(default="")
    nodes: List[WorkflowNode] = Field(default_factory=list)
    edges: List[WorkflowEdge] = Field(default_factory=list)
    entry_point: str = Field(default="")
    exit_points: List[str] = Field(default_factory=list)
    critical_path: List[str] = Field(default_factory=list)
    parallel_opportunities: List[List[str]] = Field(default_factory=list)
    error_handling: Dict[str, str] = Field(default_factory=dict)
    workflow_design_summary: str = Field(default="")

@register_task_runner
class WorkflowDesignRunner(TaskRunner[WorkflowDesignInput, WorkflowDesignOutput]):
    """Design workflow using DAG construction."""
    runner_id = "workflow_design"
    name = "Workflow Design Runner"
    description = "Design workflow using DAG construction"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "dag_construction"
    max_duration_seconds = 150
    InputType = WorkflowDesignInput
    OutputType = WorkflowDesignOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=4000)

    async def execute(self, input: WorkflowDesignInput) -> WorkflowDesignOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Design a {input.workflow_type} workflow as a DAG (Directed Acyclic Graph).

Goal: {input.goal}
Constraints: {input.constraints}
Available Inputs: {input.inputs_available}
Required Outputs: {input.outputs_required}
Max Steps: {input.max_steps}

Return JSON with:
- workflow_name: string
- nodes: array of {{node_id, node_name, node_type (start|task|decision|fork|join|end), description, inputs[], outputs[], dependencies[], estimated_duration, responsible_role}}
- edges: array of {{edge_id, from_node, to_node, condition (optional), edge_type (sequence|conditional|parallel)}}
- entry_point: node_id of start node
- exit_points: array of node_ids for end nodes
- critical_path: array of node_ids forming the longest path
- parallel_opportunities: array of arrays showing parallelizable node groups
- error_handling: dict of node_id -> error action
- summary: string"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a workflow architect. Design efficient, well-structured workflows as directed acyclic graphs. Identify parallelization opportunities and critical paths."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            nodes = [WorkflowNode(**n) for n in result.get("nodes", [])]
            edges = [WorkflowEdge(**e) for e in result.get("edges", [])]

            return WorkflowDesignOutput(
                success=True,
                workflow_name=result.get("workflow_name", ""),
                nodes=nodes,
                edges=edges,
                entry_point=result.get("entry_point", ""),
                exit_points=result.get("exit_points", []),
                critical_path=result.get("critical_path", []),
                parallel_opportunities=result.get("parallel_opportunities", []),
                error_handling=result.get("error_handling", {}),
                workflow_design_summary=result.get("summary", ""),
                confidence_score=0.85,
                quality_score=min(len(nodes) * 0.1, 1.0),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"WorkflowDesignRunner error: {e}")
            return WorkflowDesignOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# EVAL DESIGN RUNNER
# =============================================================================

class EvalDesignInput(TaskRunnerInput):
    """Input for designing evaluation frameworks."""
    subject: str = Field(..., description="Subject to evaluate")
    criteria: List[str] = Field(default_factory=list, description="Evaluation criteria")
    evaluation_purpose: str = Field(default="assessment", description="assessment | comparison | certification | improvement")
    scale_type: str = Field(default="likert", description="likert | percentage | rubric | pass_fail")
    evaluators: List[str] = Field(default_factory=list, description="Who will use this evaluation")

class EvaluationCriterion(TaskRunnerOutput):
    """A criterion in the evaluation framework."""
    criterion_id: str = Field(default="")
    criterion_name: str = Field(default="")
    description: str = Field(default="")
    weight: float = Field(default=1.0, description="Relative weight 0-1")
    levels: List[Dict[str, Any]] = Field(default_factory=list)
    indicators: List[str] = Field(default_factory=list)
    evidence_required: List[str] = Field(default_factory=list)

class RubricLevel(TaskRunnerOutput):
    """A level in a rubric."""
    level_id: str = Field(default="")
    level_name: str = Field(default="")
    score: float = Field(default=0)
    description: str = Field(default="")
    exemplars: List[str] = Field(default_factory=list)

class EvalDesignOutput(TaskRunnerOutput):
    """Output from evaluation design."""
    evaluation_name: str = Field(default="")
    criteria: List[EvaluationCriterion] = Field(default_factory=list)
    scoring_guide: str = Field(default="")
    total_weight: float = Field(default=0)
    passing_threshold: float = Field(default=0)
    calibration_notes: List[str] = Field(default_factory=list)
    common_pitfalls: List[str] = Field(default_factory=list)
    eval_design_summary: str = Field(default="")

@register_task_runner
class EvalDesignRunner(TaskRunner[EvalDesignInput, EvalDesignOutput]):
    """Design evaluation framework using rubric construction."""
    runner_id = "eval_design"
    name = "Evaluation Design Runner"
    description = "Design evaluation using rubric construction"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "rubric_construction"
    max_duration_seconds = 150
    InputType = EvalDesignInput
    OutputType = EvalDesignOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: EvalDesignInput) -> EvalDesignOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Design an evaluation framework/rubric.

Subject: {input.subject}
Criteria: {input.criteria if input.criteria else "Suggest appropriate criteria"}
Purpose: {input.evaluation_purpose}
Scale Type: {input.scale_type}
Evaluators: {input.evaluators}

Return JSON with:
- evaluation_name: string
- criteria: array of {{criterion_id, criterion_name, description, weight (0-1), levels: [{{level_name, score, description, exemplars[]}}], indicators[], evidence_required[]}}
- scoring_guide: string explaining how to use the rubric
- total_weight: sum of weights (should equal 1.0)
- passing_threshold: minimum score to pass
- calibration_notes: tips for consistent evaluation
- common_pitfalls: mistakes to avoid
- summary: string"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are an evaluation design expert. Create clear, fair, and comprehensive evaluation rubrics that enable consistent assessment."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            criteria = [EvaluationCriterion(**c) for c in result.get("criteria", [])]

            return EvalDesignOutput(
                success=True,
                evaluation_name=result.get("evaluation_name", ""),
                criteria=criteria,
                scoring_guide=result.get("scoring_guide", ""),
                total_weight=float(result.get("total_weight", 1.0)),
                passing_threshold=float(result.get("passing_threshold", 0.7)),
                calibration_notes=result.get("calibration_notes", []),
                common_pitfalls=result.get("common_pitfalls", []),
                eval_design_summary=result.get("summary", ""),
                confidence_score=0.85,
                quality_score=len(criteria) * 0.2,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"EvalDesignRunner error: {e}")
            return EvalDesignOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# RESEARCH DESIGN RUNNER
# =============================================================================

class ResearchDesignInput(TaskRunnerInput):
    """Input for designing research plans."""
    question: str = Field(..., description="Research question to answer")
    research_type: str = Field(default="exploratory", description="exploratory | descriptive | explanatory | evaluative")
    methodology_preference: str = Field(default="mixed", description="qualitative | quantitative | mixed")
    constraints: List[str] = Field(default_factory=list, description="Time, budget, access constraints")
    existing_knowledge: List[str] = Field(default_factory=list, description="What is already known")

class ResearchPhase(TaskRunnerOutput):
    """A phase in the research plan."""
    phase_id: str = Field(default="")
    phase_name: str = Field(default="")
    objective: str = Field(default="")
    methods: List[str] = Field(default_factory=list)
    data_sources: List[str] = Field(default_factory=list)
    deliverables: List[str] = Field(default_factory=list)
    duration_estimate: str = Field(default="")
    dependencies: List[str] = Field(default_factory=list)

class DataCollection(TaskRunnerOutput):
    """Data collection method details."""
    method_id: str = Field(default="")
    method_name: str = Field(default="")
    method_type: str = Field(default="", description="survey | interview | observation | experiment | secondary")
    sample_description: str = Field(default="")
    sample_size: str = Field(default="")
    instruments: List[str] = Field(default_factory=list)
    analysis_approach: str = Field(default="")

class ResearchDesignOutput(TaskRunnerOutput):
    """Output from research design."""
    research_title: str = Field(default="")
    hypotheses: List[str] = Field(default_factory=list)
    phases: List[ResearchPhase] = Field(default_factory=list)
    data_collection: List[DataCollection] = Field(default_factory=list)
    analysis_plan: str = Field(default="")
    validity_measures: List[str] = Field(default_factory=list)
    ethical_considerations: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    research_design_summary: str = Field(default="")

@register_task_runner
class ResearchDesignRunner(TaskRunner[ResearchDesignInput, ResearchDesignOutput]):
    """Design research plan using research methodology."""
    runner_id = "research_design"
    name = "Research Design Runner"
    description = "Design research using research methodology"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "research_methodology"
    max_duration_seconds = 180
    InputType = ResearchDesignInput
    OutputType = ResearchDesignOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=4500)

    async def execute(self, input: ResearchDesignInput) -> ResearchDesignOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Design a comprehensive research plan.

Research Question: {input.question}
Research Type: {input.research_type}
Methodology Preference: {input.methodology_preference}
Constraints: {input.constraints}
Existing Knowledge: {input.existing_knowledge}

Return JSON with:
- research_title: string
- hypotheses: array of testable hypotheses
- phases: array of {{phase_id, phase_name, objective, methods[], data_sources[], deliverables[], duration_estimate, dependencies[]}}
- data_collection: array of {{method_id, method_name, method_type (survey|interview|observation|experiment|secondary), sample_description, sample_size, instruments[], analysis_approach}}
- analysis_plan: string describing analysis approach
- validity_measures: array of validity/reliability measures
- ethical_considerations: array of ethical issues to address
- limitations: array of known limitations
- summary: string"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a research methodology expert. Design rigorous, feasible research plans that address research questions while maintaining scientific validity."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            phases = [ResearchPhase(**p) for p in result.get("phases", [])]
            data_collection = [DataCollection(**d) for d in result.get("data_collection", [])]

            return ResearchDesignOutput(
                success=True,
                research_title=result.get("research_title", ""),
                hypotheses=result.get("hypotheses", []),
                phases=phases,
                data_collection=data_collection,
                analysis_plan=result.get("analysis_plan", ""),
                validity_measures=result.get("validity_measures", []),
                ethical_considerations=result.get("ethical_considerations", []),
                limitations=result.get("limitations", []),
                research_design_summary=result.get("summary", ""),
                confidence_score=0.85,
                quality_score=len(phases) * 0.15 + len(data_collection) * 0.1,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"ResearchDesignRunner error: {e}")
            return ResearchDesignOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}


# =============================================================================
# SCENARIO AXIS DEFINER - Strategic Scenario Structure
# =============================================================================

class ScenarioAxis(TaskRunnerOutput):
    axis_id: str = Field(default="")
    axis_name: str = Field(default="")
    description: str = Field(default="")
    endpoints: Dict[str, str] = Field(default_factory=dict)  # low/high labels
    uncertainty_level: str = Field(default="high", description="low | medium | high")
    impact_level: str = Field(default="high", description="low | medium | high")

class ScenarioAxisInput(TaskRunnerInput):
    strategic_question: str = Field(default="", description="Strategic question to explore")
    key_uncertainties: List[str] = Field(default_factory=list, description="Key uncertainties")
    time_horizon: str = Field(default="5 years", description="Planning horizon")

class ScenarioAxisOutput(TaskRunnerOutput):
    axes: List[ScenarioAxis] = Field(default_factory=list)
    scenario_matrix: Dict[str, Any] = Field(default_factory=dict)
    scenarios: List[Dict[str, Any]] = Field(default_factory=list)
    axis_selection_rationale: str = Field(default="")

@register_task_runner
class ScenarioAxisDefinerRunner(TaskRunner[ScenarioAxisInput, ScenarioAxisOutput]):
    runner_id = "scenario_axis_definer"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "scenario_axis_design"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3000)

    async def execute(self, input: ScenarioAxisInput) -> ScenarioAxisOutput:
        prompt = f"Define 2 primary scenario axes for: {input.strategic_question}. Uncertainties: {input.key_uncertainties}. Horizon: {input.time_horizon}. Return JSON: axes[], scenario_matrix{{}}, scenarios[], axis_selection_rationale"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You design strategic scenario planning frameworks."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ScenarioAxisOutput(
                axes=[ScenarioAxis(**a) for a in result.get("axes", [])],
                scenario_matrix=result.get("scenario_matrix", {}),
                scenarios=result.get("scenarios", []),
                axis_selection_rationale=result.get("axis_selection_rationale", ""),
                quality_score=0.8 if result.get("axes") else 0.4
            )
        except Exception as e:
            return ScenarioAxisOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# SIGNAL DEFINER - Signal Taxonomy Design
# =============================================================================

class SignalDefinition(TaskRunnerOutput):
    signal_id: str = Field(default="")
    signal_name: str = Field(default="")
    signal_category: str = Field(default="", description="market | technology | regulatory | competitive | social")
    indicators: List[str] = Field(default_factory=list)
    data_sources: List[str] = Field(default_factory=list)
    measurement_frequency: str = Field(default="monthly")

class SignalDefinerInput(TaskRunnerInput):
    monitoring_focus: str = Field(default="", description="What to monitor")
    scenarios: List[Dict[str, Any]] = Field(default_factory=list, description="Scenarios to track")
    existing_signals: List[str] = Field(default_factory=list)

class SignalDefinerOutput(TaskRunnerOutput):
    signal_definitions: List[SignalDefinition] = Field(default_factory=list)
    signal_taxonomy: Dict[str, Any] = Field(default_factory=dict)
    monitoring_dashboard: Dict[str, Any] = Field(default_factory=dict)

@register_task_runner
class SignalDefinerRunner(TaskRunner[SignalDefinerInput, SignalDefinerOutput]):
    runner_id = "signal_definer"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "signal_taxonomy_design"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3000)

    async def execute(self, input: SignalDefinerInput) -> SignalDefinerOutput:
        prompt = f"Define monitoring signals for: {input.monitoring_focus}. Scenarios: {input.scenarios[:3]}. Return JSON: signal_definitions[], signal_taxonomy{{}}, monitoring_dashboard{{}}"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You design signal monitoring taxonomies."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return SignalDefinerOutput(
                signal_definitions=[SignalDefinition(**s) for s in result.get("signal_definitions", [])],
                signal_taxonomy=result.get("signal_taxonomy", {}),
                monitoring_dashboard=result.get("monitoring_dashboard", {}),
                quality_score=0.8 if result.get("signal_definitions") else 0.4
            )
        except Exception as e:
            return SignalDefinerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# PRODUCT POSITIONER - Brand Positioning Strategy
# =============================================================================

class PositioningStatement(TaskRunnerOutput):
    product_name: str = Field(default="")
    target_audience: str = Field(default="")
    frame_of_reference: str = Field(default="")
    key_benefit: str = Field(default="")
    reason_to_believe: str = Field(default="")
    brand_personality: List[str] = Field(default_factory=list)

class ProductPositionerInput(TaskRunnerInput):
    product_info: Dict[str, Any] = Field(default_factory=dict, description="Product information")
    competitive_landscape: List[Dict[str, Any]] = Field(default_factory=list)
    target_segments: List[str] = Field(default_factory=list)

class ProductPositionerOutput(TaskRunnerOutput):
    positioning: PositioningStatement = Field(default_factory=PositioningStatement)
    positioning_map: Dict[str, Any] = Field(default_factory=dict)
    differentiation_points: List[str] = Field(default_factory=list)
    messaging_pillars: List[Dict[str, Any]] = Field(default_factory=list)

@register_task_runner
class ProductPositionerRunner(TaskRunner[ProductPositionerInput, ProductPositionerOutput]):
    runner_id = "product_positioner"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "positioning_strategy_design"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3000)

    async def execute(self, input: ProductPositionerInput) -> ProductPositionerOutput:
        prompt = f"Create positioning strategy. Product: {input.product_info}. Competitors: {input.competitive_landscape[:3]}. Segments: {input.target_segments}. Return JSON: positioning{{}}, positioning_map{{}}, differentiation_points[], messaging_pillars[]"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a brand positioning strategist."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ProductPositionerOutput(
                positioning=PositioningStatement(**result.get("positioning", {})),
                positioning_map=result.get("positioning_map", {}),
                differentiation_points=result.get("differentiation_points", []),
                messaging_pillars=result.get("messaging_pillars", []),
                quality_score=0.8 if result.get("positioning") else 0.4
            )
        except Exception as e:
            return ProductPositionerOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# PLACE CHANNEL DESIGNER - Channel Architecture
# =============================================================================

class Channel(TaskRunnerOutput):
    channel_name: str = Field(default="")
    channel_type: str = Field(default="", description="direct | distributor | retail | digital | hybrid")
    target_segment: str = Field(default="")
    coverage_goal: float = Field(default=0.0, description="Target coverage %")
    key_partners: List[str] = Field(default_factory=list)
    margin_structure: Dict[str, float] = Field(default_factory=dict)

class PlaceChannelInput(TaskRunnerInput):
    product_info: Dict[str, Any] = Field(default_factory=dict)
    market_context: str = Field(default="")
    distribution_objectives: List[str] = Field(default_factory=list)

class PlaceChannelOutput(TaskRunnerOutput):
    channel_architecture: Dict[str, Any] = Field(default_factory=dict)
    channels: List[Channel] = Field(default_factory=list)
    channel_mix: Dict[str, float] = Field(default_factory=dict)
    distribution_strategy: str = Field(default="")

@register_task_runner
class PlaceChannelDesignerRunner(TaskRunner[PlaceChannelInput, PlaceChannelOutput]):
    runner_id = "place_channel_designer"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "channel_architecture_design"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=3000)

    async def execute(self, input: PlaceChannelInput) -> PlaceChannelOutput:
        prompt = f"Design distribution channel architecture. Product: {input.product_info}. Market: {input.market_context}. Objectives: {input.distribution_objectives}. Return JSON: channel_architecture{{}}, channels[], channel_mix{{}}, distribution_strategy"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You design distribution channel strategies."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return PlaceChannelOutput(
                channel_architecture=result.get("channel_architecture", {}),
                channels=[Channel(**c) for c in result.get("channels", [])],
                channel_mix=result.get("channel_mix", {}),
                distribution_strategy=result.get("distribution_strategy", ""),
                quality_score=0.8 if result.get("channels") else 0.4
            )
        except Exception as e:
            return PlaceChannelOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# =============================================================================
# ARCHITECTURE GENERATOR - Portfolio Architecture
# =============================================================================

class PortfolioArchitecture(TaskRunnerOutput):
    architecture_type: str = Field(default="", description="house_of_brands | branded_house | endorsed | hybrid")
    brand_tiers: List[Dict[str, Any]] = Field(default_factory=list)
    relationship_rules: List[str] = Field(default_factory=list)

class ArchitectureGeneratorInput(TaskRunnerInput):
    portfolio_elements: List[Dict[str, Any]] = Field(default_factory=list)
    brand_strategy: str = Field(default="")
    growth_objectives: List[str] = Field(default_factory=list)

class ArchitectureGeneratorOutput(TaskRunnerOutput):
    architecture: PortfolioArchitecture = Field(default_factory=PortfolioArchitecture)
    brand_hierarchy: Dict[str, Any] = Field(default_factory=dict)
    naming_guidelines: List[str] = Field(default_factory=list)
    visual_identity_rules: Dict[str, Any] = Field(default_factory=dict)

@register_task_runner
class ArchitectureGeneratorRunner(TaskRunner[ArchitectureGeneratorInput, ArchitectureGeneratorOutput]):
    runner_id = "architecture_generator"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "portfolio_architecture_generation"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.4, max_tokens=3000)

    async def execute(self, input: ArchitectureGeneratorInput) -> ArchitectureGeneratorOutput:
        prompt = f"Generate portfolio brand architecture. Elements: {input.portfolio_elements}. Strategy: {input.brand_strategy}. Growth: {input.growth_objectives}. Return JSON: architecture{{}}, brand_hierarchy{{}}, naming_guidelines[], visual_identity_rules{{}}"
        try:
            response = await self.llm.ainvoke([SystemMessage(content="You design brand portfolio architectures."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return ArchitectureGeneratorOutput(
                architecture=PortfolioArchitecture(**result.get("architecture", {})),
                brand_hierarchy=result.get("brand_hierarchy", {}),
                naming_guidelines=result.get("naming_guidelines", []),
                visual_identity_rules=result.get("visual_identity_rules", {}),
                quality_score=0.8 if result.get("architecture") else 0.4
            )
        except Exception as e:
            return ArchitectureGeneratorOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except: return {}


# Import file-based runners
from .content_strategist_runner import (
    ContentStrategistRunner,
    ContentStrategistInput,
    ContentStrategistOutput,
    ContentPlan,
)
from .rwe_mapper_runner import (
    RealWorldEvidenceMapperRunner,
    RWEMapperInput,
    RWEMapperOutput,
    RWEOpportunity,
)
from .training_program_runner import (
    TrainingProgramDesignerRunner,
    TrainingProgramInput,
    TrainingProgramOutput,
    TrainingModule,
)
from .kpi_framework_runner import (
    KPIFrameworkDeveloperRunner,
    KPIFrameworkInput,
    KPIFrameworkOutput,
    KPIDefinition,
)


__all__ = [
    # Original DESIGN runners
    "RequirementRunner", "RequirementInput", "RequirementOutput", "Requirement",
    "ArchitectRunner", "ArchitectInput", "ArchitectOutput", "ArchitectureComponent",
    "PrototypeRunner", "PrototypeInput", "PrototypeOutput",
    "UsabilityRunner", "UsabilityInput", "UsabilityOutput", "UsabilityIssue",
    # New DESIGN runners (Structure Work)
    "PanelDesignRunner", "PanelDesignInput", "PanelDesignOutput", "PanelRole", "DiscussionSegment",
    "WorkflowDesignRunner", "WorkflowDesignInput", "WorkflowDesignOutput", "WorkflowNode", "WorkflowEdge",
    "EvalDesignRunner", "EvalDesignInput", "EvalDesignOutput", "EvaluationCriterion", "RubricLevel",
    "ResearchDesignRunner", "ResearchDesignInput", "ResearchDesignOutput", "ResearchPhase", "DataCollection",
    # Strategic Design runners (FORESIGHT + BRAND_STRATEGY)
    "ScenarioAxisDefinerRunner", "ScenarioAxisInput", "ScenarioAxisOutput", "ScenarioAxis",
    "SignalDefinerRunner", "SignalDefinerInput", "SignalDefinerOutput", "SignalDefinition",
    "ProductPositionerRunner", "ProductPositionerInput", "ProductPositionerOutput", "PositioningStatement",
    "PlaceChannelDesignerRunner", "PlaceChannelInput", "PlaceChannelOutput", "Channel",
    "ArchitectureGeneratorRunner", "ArchitectureGeneratorInput", "ArchitectureGeneratorOutput", "PortfolioArchitecture",
    # Domain-agnostic DESIGN runners
    "ContentStrategistRunner", "ContentStrategistInput", "ContentStrategistOutput", "ContentPlan",
    "RealWorldEvidenceMapperRunner", "RWEMapperInput", "RWEMapperOutput", "RWEOpportunity",
    "TrainingProgramDesignerRunner", "TrainingProgramInput", "TrainingProgramOutput", "TrainingModule",
    "KPIFrameworkDeveloperRunner", "KPIFrameworkInput", "KPIFrameworkOutput", "KPIDefinition",
]
