"""
DiagnoseRunner - Identify blockers using root cause analysis.

Algorithmic Core: Root Cause Analysis (5 Whys / Fishbone)
- Systematically identifies what's blocking progress
- Traces symptoms to underlying causes
- Prioritizes blockers by impact and solvability

Use Cases:
- Project blocker identification
- Process bottleneck diagnosis
- Technical debt assessment
- Stakeholder alignment issues
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

class DiagnoseInput(TaskRunnerInput):
    """Input schema for DiagnoseRunner."""

    problem_description: str = Field(
        ...,
        description="Description of the problem or stuck state"
    )
    symptoms: List[str] = Field(
        default_factory=list,
        description="Observable symptoms or manifestations"
    )
    context: Optional[str] = Field(
        default=None,
        description="Additional context (project, timeline, stakeholders)"
    )
    diagnosis_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | thorough"
    )
    domain: Optional[str] = Field(
        default=None,
        description="Domain for specialized diagnosis (technical, organizational, process)"
    )


class Blocker(TaskRunnerOutput):
    """A single identified blocker."""

    blocker_id: str = Field(default="", description="Unique blocker ID")
    title: str = Field(default="", description="Short blocker title")
    description: str = Field(default="", description="Full description")
    category: str = Field(
        default="",
        description="technical | organizational | resource | knowledge | external"
    )
    root_cause: str = Field(default="", description="Underlying root cause")
    symptoms: List[str] = Field(default_factory=list, description="Associated symptoms")
    impact_score: float = Field(default=0.0, description="Impact 0-10")
    solvability_score: float = Field(default=0.0, description="Solvability 0-10")
    priority_score: float = Field(default=0.0, description="Priority (impact * solvability)")
    dependencies: List[str] = Field(default_factory=list, description="Dependent blockers")
    suggested_resolution: str = Field(default="", description="Initial resolution suggestion")


class DiagnoseOutput(TaskRunnerOutput):
    """Output schema for DiagnoseRunner."""

    blockers: List[Blocker] = Field(
        default_factory=list,
        description="Identified blockers"
    )
    primary_blocker: Optional[Blocker] = Field(
        default=None,
        description="Highest priority blocker"
    )
    blocker_count: int = Field(default=0, description="Total blockers found")
    root_causes: List[str] = Field(
        default_factory=list,
        description="Unique root causes identified"
    )
    diagnosis_summary: str = Field(default="", description="Executive summary")
    recommended_sequence: List[str] = Field(
        default_factory=list,
        description="Recommended order to address blockers"
    )
    quick_wins: List[str] = Field(
        default_factory=list,
        description="Blockers that can be resolved quickly"
    )


# =============================================================================
# DiagnoseRunner Implementation
# =============================================================================

@register_task_runner
class DiagnoseRunner(TaskRunner[DiagnoseInput, DiagnoseOutput]):
    """
    Root cause analysis blocker diagnosis runner.

    This runner systematically identifies what's blocking progress
    and prioritizes blockers for resolution.

    Algorithmic Pattern:
        1. Parse problem and symptoms
        2. Apply root cause analysis (5 Whys / Fishbone)
        3. Categorize blockers
        4. Score impact and solvability
        5. Identify dependencies between blockers
        6. Recommend resolution sequence

    Best Used For:
        - Project retrospectives
        - Stuck state analysis
        - Bottleneck identification
        - Unblocking sessions
    """

    runner_id = "diagnose"
    name = "Diagnose Runner"
    description = "Identify blockers using root cause analysis"
    category = TaskRunnerCategory.SOLVE
    algorithmic_core = "root_cause_analysis"
    max_duration_seconds = 90

    InputType = DiagnoseInput
    OutputType = DiagnoseOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize DiagnoseRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=3000,
        )

    async def execute(self, input: DiagnoseInput) -> DiagnoseOutput:
        """
        Execute blocker diagnosis.

        Args:
            input: Diagnosis parameters including problem description

        Returns:
            DiagnoseOutput with blockers and recommendations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            symptoms_text = ""
            if input.symptoms:
                symptoms_text = "\nObserved symptoms:\n" + "\n".join(f"- {s}" for s in input.symptoms)

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            domain_text = ""
            if input.domain:
                domain_text = f"\nDomain focus: {input.domain}"

            depth_instruction = self._get_depth_instruction(input.diagnosis_depth)

            system_prompt = f"""You are an expert problem diagnostician using root cause analysis.

Your task is to identify what's blocking progress and prioritize blockers.

{depth_instruction}

Root cause analysis approach:
1. Start with observable symptoms
2. Apply "5 Whys" to trace to root causes
3. Use Fishbone (Ishikawa) categorization:
   - Technical: Code, architecture, infrastructure
   - Organizational: Process, communication, alignment
   - Resource: Time, budget, people, tools
   - Knowledge: Skills, documentation, expertise gaps
   - External: Dependencies, vendors, regulations
4. Score each blocker:
   - Impact (0-10): How much is this blocking progress?
   - Solvability (0-10): How easy is this to resolve?
   - Priority = Impact × Solvability (higher = address first)
5. Identify quick wins (high solvability, any impact)
6. Recommend resolution sequence

Return a structured JSON response with:
- blockers: Array with:
  - blocker_id: B1, B2, etc.
  - title: Short title
  - description: Full description
  - category: technical | organizational | resource | knowledge | external
  - root_cause: Underlying cause
  - symptoms: Related symptoms
  - impact_score: 0-10
  - solvability_score: 0-10
  - priority_score: impact * solvability
  - dependencies: Other blocker IDs this depends on
  - suggested_resolution: Initial suggestion
- root_causes: Unique root causes
- diagnosis_summary: 2-3 sentence summary
- recommended_sequence: Blocker IDs in order
- quick_wins: Blocker IDs that are quick wins"""

            user_prompt = f"""Diagnose this problem:

PROBLEM:
{input.problem_description}
{symptoms_text}
{context_text}
{domain_text}

Identify blockers and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_diagnose_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build blockers
            blockers_data = result.get("blockers", [])
            blockers = [
                Blocker(
                    blocker_id=b.get("blocker_id", f"B{i+1}"),
                    title=b.get("title", ""),
                    description=b.get("description", ""),
                    category=b.get("category", ""),
                    root_cause=b.get("root_cause", ""),
                    symptoms=b.get("symptoms", []),
                    impact_score=float(b.get("impact_score", 5)),
                    solvability_score=float(b.get("solvability_score", 5)),
                    priority_score=float(b.get("priority_score", 25)),
                    dependencies=b.get("dependencies", []),
                    suggested_resolution=b.get("suggested_resolution", ""),
                )
                for i, b in enumerate(blockers_data)
            ]

            # Sort by priority and get primary
            blockers.sort(key=lambda x: x.priority_score, reverse=True)
            primary_blocker = blockers[0] if blockers else None

            duration = (datetime.utcnow() - start_time).total_seconds()

            return DiagnoseOutput(
                success=True,
                blockers=blockers,
                primary_blocker=primary_blocker,
                blocker_count=len(blockers),
                root_causes=result.get("root_causes", []),
                diagnosis_summary=result.get("diagnosis_summary", ""),
                recommended_sequence=result.get("recommended_sequence", []),
                quick_wins=result.get("quick_wins", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"DiagnoseRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return DiagnoseOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get instruction based on diagnosis depth."""
        instructions = {
            "quick": "Quick diagnosis: Focus on 2-3 most obvious blockers. Shallow root cause analysis.",
            "standard": "Standard diagnosis: Identify 3-5 blockers with moderate root cause depth.",
            "thorough": "Thorough diagnosis: Comprehensive analysis, 5+ blockers, deep root causes, full dependency mapping.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_diagnose_response(self, content: str) -> Dict[str, Any]:
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
                "blockers": [],
                "root_causes": [],
                "diagnosis_summary": content[:200],
                "recommended_sequence": [],
                "quick_wins": [],
            }
