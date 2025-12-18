"""
CriticRunner - Identify weaknesses using analytical critique.

Algorithmic Core: Analytical Critique (Reflexion Step 2)
- Systematically analyzes artifact for weaknesses
- Identifies improvement opportunities
- Prioritizes by impact potential

Use Cases:
- Document critique
- Code review
- Proposal feedback
- Design critique
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

class CriticInput(TaskRunnerInput):
    """Input schema for CriticRunner."""

    artifact: str = Field(
        ...,
        description="Artifact to critique (content, code, design, etc.)"
    )
    artifact_type: str = Field(
        default="document",
        description="Type: document | code | design | proposal | email | presentation"
    )
    baseline_score: Optional[float] = Field(
        default=None,
        description="Current score if known (0-100)"
    )
    evaluation_criteria: List[str] = Field(
        default_factory=lambda: ["clarity", "accuracy", "completeness", "effectiveness"],
        description="Criteria to evaluate against"
    )
    critique_depth: str = Field(
        default="standard",
        description="Depth: quick | standard | thorough"
    )
    focus_areas: List[str] = Field(
        default_factory=list,
        description="Specific areas to focus critique on"
    )


class Weakness(TaskRunnerOutput):
    """A single identified weakness."""

    weakness_id: str = Field(default="", description="Unique weakness ID")
    category: str = Field(
        default="",
        description="clarity | accuracy | completeness | effectiveness | style | structure"
    )
    description: str = Field(default="", description="Weakness description")
    location: str = Field(default="", description="Where in artifact")
    severity: str = Field(default="medium", description="minor | medium | major | critical")
    impact_on_score: float = Field(default=0.0, description="Estimated score impact (-10 to -1)")
    improvement_potential: str = Field(
        default="",
        description="How fixing this would improve artifact"
    )
    suggested_fix: str = Field(default="", description="Specific fix suggestion")
    effort_to_fix: str = Field(default="medium", description="low | medium | high")


class CriticOutput(TaskRunnerOutput):
    """Output schema for CriticRunner."""

    weaknesses: List[Weakness] = Field(
        default_factory=list,
        description="Identified weaknesses"
    )
    critical_weaknesses: List[Weakness] = Field(
        default_factory=list,
        description="Critical/major weaknesses"
    )
    current_score: float = Field(default=0.0, description="Assessed score 0-100")
    potential_score: float = Field(
        default=0.0,
        description="Potential score if all fixed"
    )
    strengths: List[str] = Field(
        default_factory=list,
        description="Notable strengths (for balance)"
    )
    priority_fixes: List[str] = Field(
        default_factory=list,
        description="Highest impact fixes in order"
    )
    critique_summary: str = Field(default="", description="Executive summary")
    improvement_roadmap: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Ordered improvement steps"
    )


# =============================================================================
# CriticRunner Implementation
# =============================================================================

@register_task_runner
class CriticRunner(TaskRunner[CriticInput, CriticOutput]):
    """
    Analytical critique weakness identification runner.

    This runner systematically analyzes an artifact to identify
    weaknesses that can be addressed for improvement.

    Algorithmic Pattern (Reflexion Step 2):
        1. Ingest artifact and establish baseline
        2. Analyze against evaluation criteria
        3. Identify specific weaknesses
        4. Categorize by type and severity
        5. Estimate improvement potential
        6. Prioritize by impact/effort ratio

    Best Used For:
        - Document review
        - Code critique
        - Design feedback
        - Iterative improvement
    """

    runner_id = "critic"
    name = "Critic Runner"
    description = "Identify weaknesses using analytical critique"
    category = TaskRunnerCategory.REFINE
    algorithmic_core = "analytical_critique"
    max_duration_seconds = 120

    InputType = CriticInput
    OutputType = CriticOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize CriticRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,  # Analytical precision
            max_tokens=3000,
        )

    async def execute(self, input: CriticInput) -> CriticOutput:
        """
        Execute analytical critique.

        Args:
            input: Critique parameters

        Returns:
            CriticOutput with weaknesses and improvement roadmap
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            criteria_text = ", ".join(input.evaluation_criteria)

            focus_text = ""
            if input.focus_areas:
                focus_text = f"\nFocus areas: {', '.join(input.focus_areas)}"

            baseline_text = ""
            if input.baseline_score is not None:
                baseline_text = f"\nBaseline score: {input.baseline_score}/100"

            depth_instruction = self._get_depth_instruction(input.critique_depth)

            system_prompt = f"""You are an expert critic using analytical critique methodology.

Your task is to identify weaknesses in an artifact for iterative improvement.

Artifact type: {input.artifact_type}
Evaluation criteria: {criteria_text}
{depth_instruction}

Analytical critique approach (Reflexion Loop):
1. Assess current state and establish score
2. Analyze against each criterion:
   - clarity: Is it easy to understand?
   - accuracy: Is it correct and precise?
   - completeness: Is anything missing?
   - effectiveness: Does it achieve its goal?
   - style: Is the tone/voice appropriate?
   - structure: Is it well-organized?
3. For each weakness:
   - Identify specific location
   - Categorize by type
   - Rate severity (minor/medium/major/critical)
   - Estimate score impact
   - Suggest specific fix
   - Rate effort to fix
4. Note strengths (balanced critique)
5. Calculate potential score if fixed
6. Prioritize by impact/effort ratio

Return a structured JSON response with:
- weaknesses: Array with:
  - weakness_id: W1, W2, etc.
  - category: clarity | accuracy | completeness | effectiveness | style | structure
  - description: What's wrong
  - location: Where in artifact
  - severity: minor | medium | major | critical
  - impact_on_score: -1 to -10
  - improvement_potential: How fixing helps
  - suggested_fix: Specific fix
  - effort_to_fix: low | medium | high
- current_score: Assessed score 0-100
- potential_score: Score if all fixed
- strengths: Notable positives
- priority_fixes: Top fixes in order
- critique_summary: 2-3 sentence summary
- improvement_roadmap: Ordered steps [{{"step": 1, "action": "", "impact": ""}}]"""

            user_prompt = f"""Critique this artifact:

ARTIFACT ({input.artifact_type}):
{input.artifact[:3000]}
{baseline_text}
{focus_text}

Identify weaknesses and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_critic_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build weaknesses
            weak_data = result.get("weaknesses", [])
            weaknesses = [
                Weakness(
                    weakness_id=w.get("weakness_id", f"W{i+1}"),
                    category=w.get("category", ""),
                    description=w.get("description", ""),
                    location=w.get("location", ""),
                    severity=w.get("severity", "medium"),
                    impact_on_score=float(w.get("impact_on_score", -3)),
                    improvement_potential=w.get("improvement_potential", ""),
                    suggested_fix=w.get("suggested_fix", ""),
                    effort_to_fix=w.get("effort_to_fix", "medium"),
                )
                for i, w in enumerate(weak_data)
            ]

            # Filter critical weaknesses
            critical = [w for w in weaknesses if w.severity in ["critical", "major"]]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return CriticOutput(
                success=True,
                weaknesses=weaknesses,
                critical_weaknesses=critical,
                current_score=float(result.get("current_score", 70)),
                potential_score=float(result.get("potential_score", 90)),
                strengths=result.get("strengths", []),
                priority_fixes=result.get("priority_fixes", []),
                critique_summary=result.get("critique_summary", ""),
                improvement_roadmap=result.get("improvement_roadmap", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"CriticRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return CriticOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "quick": "Quick critique: Identify 3-5 most significant weaknesses only.",
            "standard": "Standard critique: Comprehensive analysis, 5-10 weaknesses.",
            "thorough": "Thorough critique: Deep analysis, all weaknesses, detailed fixes.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_critic_response(self, content: str) -> Dict[str, Any]:
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
                "weaknesses": [],
                "current_score": 0,
                "potential_score": 0,
                "strengths": [],
                "priority_fixes": [],
                "critique_summary": content[:200],
                "improvement_roadmap": [],
            }
