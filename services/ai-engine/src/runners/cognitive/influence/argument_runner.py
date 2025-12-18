"""
ArgumentRunner - Build argument using argumentation theory.

Algorithmic Core: Argumentation Theory / Structured Arguments
- Constructs structured arguments
- Links claims to evidence
- Addresses counterarguments

Use Cases:
- Business case development
- Proposal writing
- Debate preparation
- Decision justification
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

class ArgumentInput(TaskRunnerInput):
    """Input schema for ArgumentRunner."""

    claim: str = Field(
        ...,
        description="The main claim/thesis to argue"
    )
    audience: Optional[str] = Field(
        default=None,
        description="Target audience"
    )
    evidence_available: List[str] = Field(
        default_factory=list,
        description="Available evidence/facts"
    )
    argument_style: str = Field(
        default="balanced",
        description="Style: logical | emotional | balanced | authoritative"
    )
    strength_required: str = Field(
        default="strong",
        description="Strength: basic | moderate | strong | compelling"
    )


class Premise(TaskRunnerOutput):
    """A supporting premise."""

    premise_id: str = Field(default="", description="Premise ID")
    statement: str = Field(default="", description="Premise statement")
    premise_type: str = Field(
        default="factual",
        description="factual | logical | value | definitional"
    )
    evidence: List[str] = Field(default_factory=list, description="Evidence")
    strength: str = Field(
        default="moderate",
        description="weak | moderate | strong"
    )


class Counterargument(TaskRunnerOutput):
    """A counterargument with rebuttal."""

    counter_id: str = Field(default="", description="Counter ID")
    counterargument: str = Field(default="", description="The counterargument")
    severity: str = Field(
        default="moderate",
        description="weak | moderate | strong"
    )
    rebuttal: str = Field(default="", description="Rebuttal")
    rebuttal_strength: str = Field(
        default="moderate",
        description="weak | moderate | strong"
    )


class ArgumentOutput(TaskRunnerOutput):
    """Output schema for ArgumentRunner."""

    main_claim: str = Field(default="", description="The main claim")
    premises: List[Premise] = Field(
        default_factory=list,
        description="Supporting premises"
    )
    logical_chain: str = Field(
        default="",
        description="How premises support claim"
    )
    counterarguments: List[Counterargument] = Field(
        default_factory=list,
        description="Counterarguments with rebuttals"
    )
    argument_structure: str = Field(
        default="",
        description="Structured argument format"
    )
    argument_strength: str = Field(
        default="moderate",
        description="Overall strength"
    )
    persuasion_elements: List[str] = Field(
        default_factory=list,
        description="Persuasion techniques used"
    )
    argument_summary: str = Field(default="", description="Summary")


# =============================================================================
# ArgumentRunner Implementation
# =============================================================================

@register_task_runner
class ArgumentRunner(TaskRunner[ArgumentInput, ArgumentOutput]):
    """
    Argumentation theory structured argument runner.

    This runner builds structured arguments with
    premises, evidence, and counterargument handling.

    Algorithmic Pattern:
        1. Analyze claim
        2. Identify supporting premises
        3. Link evidence to premises
        4. Construct logical chain
        5. Anticipate counterarguments
        6. Prepare rebuttals
        7. Structure argument

    Best Used For:
        - Business cases
        - Proposals
        - Debate prep
        - Decision justification
    """

    runner_id = "argument"
    name = "Argument Runner"
    description = "Build argument using argumentation theory"
    category = TaskRunnerCategory.INFLUENCE
    algorithmic_core = "argumentation_theory"
    max_duration_seconds = 150

    InputType = ArgumentInput
    OutputType = ArgumentOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ArgumentRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.4,
            max_tokens=4000,
        )

    async def execute(self, input: ArgumentInput) -> ArgumentOutput:
        """
        Execute argument construction.

        Args:
            input: Argument construction parameters

        Returns:
            ArgumentOutput with structured argument
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            audience_text = ""
            if input.audience:
                audience_text = f"\nTarget audience: {input.audience}"

            evidence_text = ""
            if input.evidence_available:
                evidence_text = "\nAvailable evidence:\n" + "\n".join(
                    f"- {e}" for e in input.evidence_available
                )

            style_instruction = self._get_style_instruction(input.argument_style)
            strength_instruction = self._get_strength_instruction(input.strength_required)

            system_prompt = f"""You are an expert at argumentation theory and persuasive reasoning.

Your task is to build a structured argument supporting a claim.

{style_instruction}
{strength_instruction}

Argumentation approach:
1. Premises (reasons supporting the claim):
   - factual: Based on facts/data
   - logical: Based on reasoning
   - value: Based on values/principles
   - definitional: Based on definitions
2. Evidence linking:
   - Connect evidence to premises
   - Assess evidence strength
3. Logical chain:
   - Show how premises lead to claim
   - Use valid reasoning patterns
4. Counterarguments:
   - Anticipate objections
   - Prepare rebuttals
5. Persuasion elements:
   - Ethos (credibility)
   - Logos (logic)
   - Pathos (emotion)

Return a structured JSON response with:
- main_claim: The claim being argued
- premises: Array with:
  - premise_id: P1, P2, etc.
  - statement: The premise
  - premise_type: factual | logical | value | definitional
  - evidence: [supporting evidence]
  - strength: weak | moderate | strong
- logical_chain: How premises support claim
- counterarguments: Array with:
  - counter_id: C1, C2, etc.
  - counterargument: The objection
  - severity: weak | moderate | strong
  - rebuttal: Response to counterargument
  - rebuttal_strength: weak | moderate | strong
- argument_structure: Full structured argument text
- argument_strength: Overall strength
- persuasion_elements: [techniques used]
- argument_summary: 2-3 sentence summary"""

            user_prompt = f"""Build an argument for this claim:

CLAIM: {input.claim}
{audience_text}
{evidence_text}

Construct structured argument and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_argument_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build premises
            premises_data = result.get("premises", [])
            premises = [
                Premise(
                    premise_id=p.get("premise_id", f"P{idx+1}"),
                    statement=p.get("statement", ""),
                    premise_type=p.get("premise_type", "factual"),
                    evidence=p.get("evidence", []),
                    strength=p.get("strength", "moderate"),
                )
                for idx, p in enumerate(premises_data)
            ]

            # Build counterarguments
            counters_data = result.get("counterarguments", [])
            counterarguments = [
                Counterargument(
                    counter_id=c.get("counter_id", f"C{idx+1}"),
                    counterargument=c.get("counterargument", ""),
                    severity=c.get("severity", "moderate"),
                    rebuttal=c.get("rebuttal", ""),
                    rebuttal_strength=c.get("rebuttal_strength", "moderate"),
                )
                for idx, c in enumerate(counters_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ArgumentOutput(
                success=True,
                main_claim=result.get("main_claim", input.claim),
                premises=premises,
                logical_chain=result.get("logical_chain", ""),
                counterarguments=counterarguments,
                argument_structure=result.get("argument_structure", ""),
                argument_strength=result.get("argument_strength", "moderate"),
                persuasion_elements=result.get("persuasion_elements", []),
                argument_summary=result.get("argument_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ArgumentRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ArgumentOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_style_instruction(self, style: str) -> str:
        """Get style instruction."""
        instructions = {
            "logical": "Style: Focus on logic, data, and reasoning.",
            "emotional": "Style: Connect emotionally, use stories and values.",
            "balanced": "Style: Balance logic and emotion appropriately.",
            "authoritative": "Style: Lead with expertise and credibility.",
        }
        return instructions.get(style, instructions["balanced"])

    def _get_strength_instruction(self, strength: str) -> str:
        """Get strength instruction."""
        instructions = {
            "basic": "Strength: Basic argument, 2-3 premises.",
            "moderate": "Strength: Solid argument, 3-4 premises with evidence.",
            "strong": "Strength: Comprehensive, 4-5 premises with counterargument handling.",
            "compelling": "Strength: Compelling, robust argument with thorough rebuttals.",
        }
        return instructions.get(strength, instructions["strong"])

    def _parse_argument_response(self, content: str) -> Dict[str, Any]:
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
                "main_claim": "",
                "premises": [],
                "logical_chain": "",
                "counterarguments": [],
                "argument_structure": content[:500],
                "argument_strength": "moderate",
                "persuasion_elements": [],
                "argument_summary": "",
            }
