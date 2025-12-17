"""
ObjectiveRunner - Define objectives using goal tree decomposition.

Algorithmic Core: Goal Tree / Objective Decomposition
- Decomposes high-level goals into objectives
- Creates hierarchical objective structure
- Defines measurable key results

Use Cases:
- OKR planning
- Strategic planning
- Project objectives
- KPI definition
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class ObjectiveInput(TaskRunnerInput):
    """Input schema for ObjectiveRunner."""

    goal: str = Field(
        ...,
        description="High-level goal to decompose"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for objectives"
    )
    time_horizon: str = Field(
        default="quarterly",
        description="Time horizon: monthly | quarterly | annual | multi_year"
    )
    objective_count: int = Field(
        default=3,
        description="Target number of objectives (2-5)"
    )
    framework: str = Field(
        default="okr",
        description="Framework: okr | smart | balanced_scorecard | kpi"
    )


class KeyResult(TaskRunnerOutput):
    """A key result for an objective."""

    key_result_id: str = Field(default="", description="Key result ID")
    description: str = Field(default="", description="Description")
    metric: str = Field(default="", description="Metric to track")
    target_value: str = Field(default="", description="Target value")
    baseline_value: Optional[str] = Field(default=None, description="Current value")
    measurement_method: str = Field(default="", description="How to measure")
    confidence: str = Field(
        default="medium",
        description="low | medium | high"
    )


class Objective(TaskRunnerOutput):
    """An objective with key results."""

    objective_id: str = Field(default="", description="Objective ID")
    title: str = Field(default="", description="Objective title")
    description: str = Field(default="", description="Description")
    objective_type: str = Field(
        default="outcome",
        description="outcome | output | activity | input"
    )
    priority: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    owner: Optional[str] = Field(default=None, description="Owner")
    key_results: List[KeyResult] = Field(
        default_factory=list,
        description="Key results"
    )
    dependencies: List[str] = Field(
        default_factory=list,
        description="Dependent objectives"
    )
    risks: List[str] = Field(default_factory=list, description="Risks")


class ObjectiveOutput(TaskRunnerOutput):
    """Output schema for ObjectiveRunner."""

    objectives: List[Objective] = Field(
        default_factory=list,
        description="Decomposed objectives"
    )
    objective_tree: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Hierarchy {parent: [children]}"
    )
    total_key_results: int = Field(default=0, description="Total KRs")
    coverage_assessment: str = Field(
        default="",
        description="Does this cover the goal?"
    )
    alignment_score: float = Field(
        default=0,
        description="Alignment with goal 0-100"
    )
    achievability_assessment: str = Field(
        default="",
        description="Realistic assessment"
    )
    objective_summary: str = Field(default="", description="Summary")


# =============================================================================
# ObjectiveRunner Implementation
# =============================================================================

@register_task_runner
class ObjectiveRunner(TaskRunner[ObjectiveInput, ObjectiveOutput]):
    """
    Goal tree objective decomposition runner.

    This runner decomposes high-level goals into
    measurable objectives with key results.

    Algorithmic Pattern:
        1. Analyze goal
        2. Identify objective dimensions
        3. Decompose into objectives:
           - Clear, actionable objectives
           - Measurable key results
           - SMART criteria
        4. Build hierarchy
        5. Assess coverage and achievability

    Best Used For:
        - OKR planning
        - Strategic planning
        - Project objectives
        - Performance management
    """

    runner_id = "objective"
    name = "Objective Runner"
    description = "Define objectives using goal tree decomposition"
    category = TaskRunnerCategory.ALIGN
    algorithmic_core = "goal_tree"
    max_duration_seconds = 150

    InputType = ObjectiveInput
    OutputType = ObjectiveOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ObjectiveRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: ObjectiveInput) -> ObjectiveOutput:
        """
        Execute objective decomposition.

        Args:
            input: Objective decomposition parameters

        Returns:
            ObjectiveOutput with objectives and key results
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            framework_instruction = self._get_framework_instruction(input.framework)

            system_prompt = f"""You are an expert at strategic objective setting and goal decomposition.

Your task is to decompose a high-level goal into measurable objectives.

Framework: {input.framework}
{framework_instruction}

Time horizon: {input.time_horizon}
Target objectives: {input.objective_count}

Objective decomposition approach:
1. Analyze the goal dimensions
2. Create {input.objective_count} MECE objectives:
   - Mutually Exclusive (no overlap)
   - Collectively Exhaustive (full coverage)
3. For each objective:
   - Clear, action-oriented title
   - 2-4 key results per objective
   - Each KR has specific metric and target
4. Objective types:
   - outcome: End result (e.g., revenue, satisfaction)
   - output: Deliverable (e.g., product launched)
   - activity: Action (e.g., meetings held)
   - input: Resource (e.g., team hired)
5. Prioritize outcomes over outputs

Key Result requirements:
- Specific metric
- Target value
- Baseline if available
- Measurement method

Return a structured JSON response with:
- objectives: Array with:
  - objective_id: O1, O2, etc.
  - title: Clear title
  - description: What this achieves
  - objective_type: outcome | output | activity | input
  - priority: low | medium | high | critical
  - owner: Suggested owner (if applicable)
  - key_results: Array with:
    - key_result_id: O1-KR1, O1-KR2, etc.
    - description: KR description
    - metric: What to measure
    - target_value: Target
    - baseline_value: Current (if known)
    - measurement_method: How to measure
    - confidence: low | medium | high
  - dependencies: [objective_ids that this depends on]
  - risks: [key risks]
- objective_tree: {{goal: [objective_ids]}}
- total_key_results: Count
- coverage_assessment: Does this cover the goal?
- alignment_score: 0-100
- achievability_assessment: Is this realistic?
- objective_summary: 2-3 sentence summary"""

            user_prompt = f"""Decompose this goal into objectives:

GOAL: {input.goal}
{context_text}

Create {input.objective_count} objectives with key results and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_objective_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build objectives
            objectives_data = result.get("objectives", [])
            objectives = []
            total_krs = 0

            for idx, o in enumerate(objectives_data):
                # Build key results
                krs_data = o.get("key_results", [])
                key_results = [
                    KeyResult(
                        key_result_id=kr.get("key_result_id", f"O{idx+1}-KR{kr_idx+1}"),
                        description=kr.get("description", ""),
                        metric=kr.get("metric", ""),
                        target_value=str(kr.get("target_value", "")),
                        baseline_value=kr.get("baseline_value"),
                        measurement_method=kr.get("measurement_method", ""),
                        confidence=kr.get("confidence", "medium"),
                    )
                    for kr_idx, kr in enumerate(krs_data)
                ]
                total_krs += len(key_results)

                objective = Objective(
                    objective_id=o.get("objective_id", f"O{idx+1}"),
                    title=o.get("title", ""),
                    description=o.get("description", ""),
                    objective_type=o.get("objective_type", "outcome"),
                    priority=o.get("priority", "medium"),
                    owner=o.get("owner"),
                    key_results=key_results,
                    dependencies=o.get("dependencies", []),
                    risks=o.get("risks", []),
                )
                objectives.append(objective)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ObjectiveOutput(
                success=True,
                objectives=objectives,
                objective_tree=result.get("objective_tree", {}),
                total_key_results=total_krs,
                coverage_assessment=result.get("coverage_assessment", ""),
                alignment_score=float(result.get("alignment_score", 75)),
                achievability_assessment=result.get("achievability_assessment", ""),
                objective_summary=result.get("objective_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ObjectiveRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ObjectiveOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_framework_instruction(self, framework: str) -> str:
        """Get framework instruction."""
        instructions = {
            "okr": "OKR: Objectives (qualitative, inspiring) + Key Results (quantitative, measurable)",
            "smart": "SMART: Specific, Measurable, Achievable, Relevant, Time-bound",
            "balanced_scorecard": "BSC: Financial, Customer, Process, Learning perspectives",
            "kpi": "KPIs: Key Performance Indicators with targets",
        }
        return instructions.get(framework, instructions["okr"])

    def _parse_objective_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "objectives": [],
                "objective_tree": {},
                "total_key_results": 0,
                "coverage_assessment": "",
                "alignment_score": 0,
                "achievability_assessment": "",
                "objective_summary": content[:200],
            }
