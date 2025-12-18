"""
MutateRunner - Generate variation using hill climbing step.

Algorithmic Core: Hill Climbing / Stochastic Mutation (Reflexion Step 3)
- Generates improved variants based on critique
- Uses targeted mutations for weaknesses
- Preserves strengths while fixing weaknesses

Use Cases:
- Document improvement
- Code refactoring
- Design iteration
- Proposal enhancement
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

class MutateInput(TaskRunnerInput):
    """Input schema for MutateRunner."""

    artifact: str = Field(
        ...,
        description="Original artifact to improve"
    )
    critique: Dict[str, Any] = Field(
        ...,
        description="Critique output with weaknesses and suggestions"
    )
    mutation_strategy: str = Field(
        default="targeted",
        description="Strategy: targeted | exploratory | conservative"
    )
    target_weaknesses: List[str] = Field(
        default_factory=list,
        description="Specific weakness IDs to address (if empty, address all)"
    )
    preserve_elements: List[str] = Field(
        default_factory=list,
        description="Elements to preserve unchanged"
    )
    mutation_intensity: str = Field(
        default="moderate",
        description="Intensity: light | moderate | aggressive"
    )


class Mutation(TaskRunnerOutput):
    """A single mutation applied."""

    mutation_id: str = Field(default="", description="Unique mutation ID")
    weakness_addressed: str = Field(default="", description="Weakness ID addressed")
    mutation_type: str = Field(
        default="",
        description="rewrite | restructure | add | remove | rephrase"
    )
    original: str = Field(default="", description="Original content")
    mutated: str = Field(default="", description="Mutated content")
    rationale: str = Field(default="", description="Why this mutation")
    expected_impact: float = Field(default=0.0, description="Expected score improvement")


class MutateOutput(TaskRunnerOutput):
    """Output schema for MutateRunner."""

    improved_artifact: str = Field(default="", description="Improved artifact")
    mutations_applied: List[Mutation] = Field(
        default_factory=list,
        description="Mutations applied"
    )
    mutation_count: int = Field(default=0, description="Number of mutations")
    weaknesses_addressed: List[str] = Field(
        default_factory=list,
        description="Weakness IDs addressed"
    )
    weaknesses_remaining: List[str] = Field(
        default_factory=list,
        description="Weakness IDs not addressed"
    )
    estimated_new_score: float = Field(
        default=0.0,
        description="Estimated score after mutations"
    )
    preservation_verified: bool = Field(
        default=True,
        description="Whether preserve_elements were maintained"
    )
    mutation_summary: str = Field(default="", description="Summary of changes")
    rollback_available: bool = Field(
        default=True,
        description="Original artifact preserved for rollback"
    )


# =============================================================================
# MutateRunner Implementation
# =============================================================================

@register_task_runner
class MutateRunner(TaskRunner[MutateInput, MutateOutput]):
    """
    Hill climbing mutation runner.

    This runner generates improved variants by applying
    targeted mutations based on critique feedback.

    Algorithmic Pattern (Reflexion Step 3):
        1. Parse artifact and critique
        2. Select weaknesses to address
        3. Apply mutation strategy:
           - targeted: Fix specific weaknesses
           - exploratory: Try creative alternatives
           - conservative: Minimal changes
        4. Generate mutations
        5. Apply while preserving strengths
        6. Estimate improvement

    Best Used For:
        - Iterative improvement
        - Content refinement
        - Code optimization
        - Design iteration
    """

    runner_id = "mutate"
    name = "Mutate Runner"
    description = "Generate variation using hill climbing step"
    category = TaskRunnerCategory.REFINE
    algorithmic_core = "hill_climbing"
    max_duration_seconds = 150

    InputType = MutateInput
    OutputType = MutateOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize MutateRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.4,  # Some creativity for variations
            max_tokens=4000,
        )

    async def execute(self, input: MutateInput) -> MutateOutput:
        """
        Execute mutation generation.

        Args:
            input: Mutation parameters

        Returns:
            MutateOutput with improved artifact
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            critique_text = json.dumps(input.critique, indent=2, default=str)[:2000]

            targets_text = ""
            if input.target_weaknesses:
                targets_text = f"\nTarget weaknesses: {', '.join(input.target_weaknesses)}"
            else:
                targets_text = "\nAddress all identified weaknesses"

            preserve_text = ""
            if input.preserve_elements:
                preserve_text = "\nPreserve these elements:\n" + "\n".join(
                    f"- {p}" for p in input.preserve_elements
                )

            strategy_instruction = self._get_strategy_instruction(input.mutation_strategy)
            intensity_instruction = self._get_intensity_instruction(input.mutation_intensity)

            system_prompt = f"""You are an expert at iterative improvement using hill climbing.

Your task is to generate an improved variant of an artifact.

Mutation strategy: {input.mutation_strategy}
{strategy_instruction}

Mutation intensity: {input.mutation_intensity}
{intensity_instruction}

Hill climbing approach (Reflexion Loop):
1. Review critique and weaknesses
2. For each weakness to address:
   - Identify mutation type needed
   - Generate specific improvement
   - Track what changed and why
3. Apply mutations while:
   - Preserving identified strengths
   - Maintaining element list
   - Ensuring coherence
4. Types of mutations:
   - rewrite: Complete content replacement
   - restructure: Reorganize structure
   - add: Insert new content
   - remove: Delete problematic content
   - rephrase: Change wording/style
5. Estimate score improvement

Return a structured JSON response with:
- improved_artifact: The improved version
- mutations_applied: Array with:
  - mutation_id: M1, M2, etc.
  - weakness_addressed: Weakness ID
  - mutation_type: rewrite | restructure | add | remove | rephrase
  - original: Original content (brief)
  - mutated: New content (brief)
  - rationale: Why this change
  - expected_impact: Score improvement (1-10)
- mutation_count: Number of mutations
- weaknesses_addressed: List of weakness IDs fixed
- weaknesses_remaining: Weakness IDs not addressed
- estimated_new_score: Estimated new score 0-100
- preservation_verified: boolean
- mutation_summary: 2-3 sentence summary"""

            user_prompt = f"""Improve this artifact based on critique:

ORIGINAL ARTIFACT:
{input.artifact[:2500]}

CRITIQUE:
{critique_text}
{targets_text}
{preserve_text}

Generate improved variant and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_mutate_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build mutations
            mut_data = result.get("mutations_applied", [])
            mutations = [
                Mutation(
                    mutation_id=m.get("mutation_id", f"M{i+1}"),
                    weakness_addressed=m.get("weakness_addressed", ""),
                    mutation_type=m.get("mutation_type", "rewrite"),
                    original=m.get("original", ""),
                    mutated=m.get("mutated", ""),
                    rationale=m.get("rationale", ""),
                    expected_impact=float(m.get("expected_impact", 3)),
                )
                for i, m in enumerate(mut_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return MutateOutput(
                success=True,
                improved_artifact=result.get("improved_artifact", ""),
                mutations_applied=mutations,
                mutation_count=len(mutations),
                weaknesses_addressed=result.get("weaknesses_addressed", []),
                weaknesses_remaining=result.get("weaknesses_remaining", []),
                estimated_new_score=float(result.get("estimated_new_score", 80)),
                preservation_verified=result.get("preservation_verified", True),
                mutation_summary=result.get("mutation_summary", ""),
                rollback_available=True,
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"MutateRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return MutateOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_strategy_instruction(self, strategy: str) -> str:
        """Get strategy instruction."""
        instructions = {
            "targeted": "Targeted: Focus only on fixing specific weaknesses identified.",
            "exploratory": "Exploratory: Try creative alternatives beyond just fixing issues.",
            "conservative": "Conservative: Minimal changes, only fix critical issues.",
        }
        return instructions.get(strategy, instructions["targeted"])

    def _get_intensity_instruction(self, intensity: str) -> str:
        """Get intensity instruction."""
        instructions = {
            "light": "Light intensity: Small, incremental changes only.",
            "moderate": "Moderate intensity: Substantive changes where needed.",
            "aggressive": "Aggressive intensity: Major rewrites acceptable.",
        }
        return instructions.get(intensity, instructions["moderate"])

    def _parse_mutate_response(self, content: str) -> Dict[str, Any]:
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
                "improved_artifact": content,
                "mutations_applied": [],
                "mutation_count": 0,
                "weaknesses_addressed": [],
                "weaknesses_remaining": [],
                "estimated_new_score": 0,
                "preservation_verified": False,
                "mutation_summary": "",
            }
