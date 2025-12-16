"""
AlternativeRunner - Generate alternatives using lateral thinking.

Algorithmic Core: Lateral Thinking / Divergent Generation
- Generates alternative approaches to current solution
- Uses multiple thinking modes (reversal, analogy, random entry)
- Evaluates alternatives for viability

Use Cases:
- Creative problem solving
- Backup plan generation
- Strategy alternatives
- Innovation ideation
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

class AlternativeInput(TaskRunnerInput):
    """Input schema for AlternativeRunner."""

    current_solution: str = Field(
        ...,
        description="Current approach or solution"
    )
    problem_context: str = Field(
        ...,
        description="What problem this solution addresses"
    )
    why_alternatives_needed: str = Field(
        default="exploring options",
        description="Why alternatives are being sought"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Constraints alternatives must satisfy"
    )
    thinking_modes: List[str] = Field(
        default_factory=lambda: ["reversal", "analogy", "combination", "random_entry"],
        description="Lateral thinking modes to apply"
    )
    min_alternatives: int = Field(default=3, description="Minimum alternatives to generate")
    max_alternatives: int = Field(default=6, description="Maximum alternatives")


class Alternative(TaskRunnerOutput):
    """A single alternative approach."""

    alternative_id: str = Field(default="", description="Unique alternative ID")
    title: str = Field(default="", description="Short title")
    description: str = Field(default="", description="Full description")
    thinking_mode: str = Field(
        default="",
        description="How this alternative was generated"
    )
    key_difference: str = Field(default="", description="How it differs from current")
    viability_score: float = Field(default=0.0, description="Viability 0-10")
    novelty_score: float = Field(default=0.0, description="Novelty 0-10")
    risk_level: str = Field(default="medium", description="low | medium | high")
    pros: List[str] = Field(default_factory=list, description="Advantages")
    cons: List[str] = Field(default_factory=list, description="Disadvantages")
    constraints_met: List[str] = Field(default_factory=list, description="Which constraints satisfied")
    constraints_violated: List[str] = Field(default_factory=list, description="Which constraints broken")
    implementation_hint: str = Field(default="", description="How to implement")


class AlternativeOutput(TaskRunnerOutput):
    """Output schema for AlternativeRunner."""

    alternatives: List[Alternative] = Field(
        default_factory=list,
        description="Generated alternatives"
    )
    best_alternative: Optional[Alternative] = Field(
        default=None,
        description="Recommended best alternative"
    )
    most_novel: Optional[Alternative] = Field(
        default=None,
        description="Most innovative alternative"
    )
    safest_alternative: Optional[Alternative] = Field(
        default=None,
        description="Lowest risk alternative"
    )
    alternatives_summary: str = Field(default="", description="Summary of alternatives")
    thinking_modes_used: List[str] = Field(
        default_factory=list,
        description="Which thinking modes produced results"
    )
    current_solution_still_best: bool = Field(
        default=False,
        description="Whether current solution remains best"
    )
    recommendation: str = Field(default="", description="Final recommendation")


# =============================================================================
# AlternativeRunner Implementation
# =============================================================================

@register_task_runner
class AlternativeRunner(TaskRunner[AlternativeInput, AlternativeOutput]):
    """
    Lateral thinking alternative generation runner.

    This runner generates alternative approaches using various
    lateral thinking techniques.

    Algorithmic Pattern:
        1. Understand current solution
        2. Apply multiple thinking modes:
           - Reversal: What if we did the opposite?
           - Analogy: How do others solve similar problems?
           - Combination: Can we combine approaches?
           - Random entry: What if we started from X?
        3. Generate alternatives for each mode
        4. Evaluate viability and novelty
        5. Identify best options

    Best Used For:
        - Creative exploration
        - Backup planning
        - Innovation sessions
        - Decision alternatives
    """

    runner_id = "alternative"
    name = "Alternative Runner"
    description = "Generate alternatives using lateral thinking"
    category = TaskRunnerCategory.SOLVE
    algorithmic_core = "lateral_thinking"
    max_duration_seconds = 120

    InputType = AlternativeInput
    OutputType = AlternativeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize AlternativeRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,  # Higher for creativity
            max_tokens=3500,
        )

    async def execute(self, input: AlternativeInput) -> AlternativeOutput:
        """
        Execute alternative generation.

        Args:
            input: Alternative generation parameters

        Returns:
            AlternativeOutput with alternatives and recommendations
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            constraints_text = ""
            if input.constraints:
                constraints_text = "\nConstraints:\n" + "\n".join(f"- {c}" for c in input.constraints)

            modes_instruction = self._get_modes_instruction(input.thinking_modes)

            system_prompt = f"""You are a creative problem solver using lateral thinking techniques.

Your task is to generate alternatives to the current solution.

Reason for seeking alternatives: {input.why_alternatives_needed}
Generate {input.min_alternatives} to {input.max_alternatives} alternatives.

{modes_instruction}

For each alternative:
1. Apply a specific thinking mode
2. Describe the alternative clearly
3. Explain how it differs from current approach
4. Score viability (0-10): Can this actually work?
5. Score novelty (0-10): How different/innovative is it?
6. Assess risk level
7. List pros and cons
8. Check against constraints

Return a structured JSON response with:
- alternatives: Array with:
  - alternative_id: A1, A2, etc.
  - title: Short title
  - description: Full description
  - thinking_mode: Which mode generated this
  - key_difference: How it differs
  - viability_score: 0-10
  - novelty_score: 0-10
  - risk_level: low | medium | high
  - pros: List of advantages
  - cons: List of disadvantages
  - constraints_met: Which constraints satisfied
  - constraints_violated: Which constraints broken
  - implementation_hint: How to implement
- alternatives_summary: 2-3 sentence summary
- thinking_modes_used: Which modes produced results
- current_solution_still_best: boolean
- recommendation: What you recommend"""

            user_prompt = f"""Generate alternatives to this solution:

CURRENT SOLUTION:
{input.current_solution}

PROBLEM CONTEXT:
{input.problem_context}
{constraints_text}

Generate creative alternatives and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_alternative_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build alternatives
            alts_data = result.get("alternatives", [])
            alternatives = [
                Alternative(
                    alternative_id=a.get("alternative_id", f"A{i+1}"),
                    title=a.get("title", ""),
                    description=a.get("description", ""),
                    thinking_mode=a.get("thinking_mode", ""),
                    key_difference=a.get("key_difference", ""),
                    viability_score=float(a.get("viability_score", 5)),
                    novelty_score=float(a.get("novelty_score", 5)),
                    risk_level=a.get("risk_level", "medium"),
                    pros=a.get("pros", []),
                    cons=a.get("cons", []),
                    constraints_met=a.get("constraints_met", []),
                    constraints_violated=a.get("constraints_violated", []),
                    implementation_hint=a.get("implementation_hint", ""),
                )
                for i, a in enumerate(alts_data)
            ]

            # Find best alternatives
            best = max(alternatives, key=lambda x: x.viability_score) if alternatives else None
            most_novel = max(alternatives, key=lambda x: x.novelty_score) if alternatives else None
            safest = min(
                [a for a in alternatives if a.risk_level == "low"] or alternatives,
                key=lambda x: x.risk_level == "high"
            ) if alternatives else None

            duration = (datetime.utcnow() - start_time).total_seconds()

            return AlternativeOutput(
                success=True,
                alternatives=alternatives,
                best_alternative=best,
                most_novel=most_novel,
                safest_alternative=safest,
                alternatives_summary=result.get("alternatives_summary", ""),
                thinking_modes_used=result.get("thinking_modes_used", []),
                current_solution_still_best=result.get("current_solution_still_best", False),
                recommendation=result.get("recommendation", ""),
                confidence_score=0.8,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"AlternativeRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return AlternativeOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_modes_instruction(self, modes: List[str]) -> str:
        """Get instruction for thinking modes."""
        mode_descriptions = {
            "reversal": "REVERSAL: What if we did the opposite? Flip assumptions.",
            "analogy": "ANALOGY: How do other industries/domains solve this?",
            "combination": "COMBINATION: Can we combine existing approaches?",
            "random_entry": "RANDOM ENTRY: Start from an unexpected point.",
            "subtraction": "SUBTRACTION: What if we removed a key component?",
            "exaggeration": "EXAGGERATION: What if we 10x'd a parameter?",
        }
        instructions = [mode_descriptions.get(m, f"{m.upper()}: Apply {m} thinking")
                       for m in modes]
        return "Apply these lateral thinking modes:\n" + "\n".join(instructions)

    def _parse_alternative_response(self, content: str) -> Dict[str, Any]:
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
                "alternatives": [],
                "alternatives_summary": content[:200],
                "thinking_modes_used": [],
                "current_solution_still_best": True,
                "recommendation": "",
            }
