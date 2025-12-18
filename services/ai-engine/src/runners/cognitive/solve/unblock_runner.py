"""
UnblockRunner - Resolve blocker using constraint relaxation.

Algorithmic Core: Constraint Relaxation / Satisficing
- Analyzes blocker constraints
- Identifies which constraints can be relaxed
- Finds minimal relaxation to unblock

Use Cases:
- Project unblocking
- Resource constraint resolution
- Deadline negotiation
- Stakeholder impasse resolution
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

class UnblockInput(TaskRunnerInput):
    """Input schema for UnblockRunner."""

    blocker: Dict[str, Any] = Field(
        ...,
        description="Blocker to resolve {title, description, category, root_cause}"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Current constraints creating the block"
    )
    resources_available: List[str] = Field(
        default_factory=list,
        description="Resources/options available"
    )
    stakeholders: List[str] = Field(
        default_factory=list,
        description="Stakeholders involved"
    )
    urgency: str = Field(
        default="medium",
        description="Urgency: low | medium | high | critical"
    )
    resolution_approach: str = Field(
        default="balanced",
        description="Approach: minimal | balanced | aggressive"
    )


class ConstraintRelaxation(TaskRunnerOutput):
    """A constraint relaxation option."""

    constraint: str = Field(default="", description="Constraint being relaxed")
    relaxation_type: str = Field(
        default="",
        description="remove | modify | defer | delegate"
    )
    relaxation_description: str = Field(default="", description="How to relax")
    effort_required: str = Field(default="", description="low | medium | high")
    stakeholder_approval_needed: List[str] = Field(
        default_factory=list,
        description="Who needs to approve"
    )
    side_effects: List[str] = Field(default_factory=list, description="Potential consequences")
    reversible: bool = Field(default=True, description="Can be undone")


class Resolution(TaskRunnerOutput):
    """A resolution approach."""

    resolution_id: str = Field(default="", description="Unique resolution ID")
    title: str = Field(default="", description="Short title")
    description: str = Field(default="", description="Full description")
    resolution_type: str = Field(
        default="",
        description="workaround | fix | escalation | pivot | accept"
    )
    relaxations_required: List[ConstraintRelaxation] = Field(
        default_factory=list,
        description="Constraints to relax"
    )
    steps: List[str] = Field(default_factory=list, description="Steps to implement")
    effort_estimate: str = Field(default="", description="low | medium | high")
    time_to_unblock: str = Field(default="", description="Estimated time")
    confidence: float = Field(default=0.0, description="Confidence 0-1")
    risks: List[str] = Field(default_factory=list, description="Associated risks")


class UnblockOutput(TaskRunnerOutput):
    """Output schema for UnblockRunner."""

    resolutions: List[Resolution] = Field(
        default_factory=list,
        description="Resolution options"
    )
    recommended_resolution: Optional[Resolution] = Field(
        default=None,
        description="Recommended resolution"
    )
    quick_fix: Optional[Resolution] = Field(
        default=None,
        description="Fastest resolution (may not be best)"
    )
    proper_fix: Optional[Resolution] = Field(
        default=None,
        description="Best long-term resolution"
    )
    constraints_analyzed: List[str] = Field(
        default_factory=list,
        description="Constraints that were analyzed"
    )
    immutable_constraints: List[str] = Field(
        default_factory=list,
        description="Constraints that cannot be relaxed"
    )
    unblock_summary: str = Field(default="", description="Executive summary")
    escalation_needed: bool = Field(default=False, description="Needs escalation")
    next_steps: List[str] = Field(default_factory=list, description="Immediate next steps")


# =============================================================================
# UnblockRunner Implementation
# =============================================================================

@register_task_runner
class UnblockRunner(TaskRunner[UnblockInput, UnblockOutput]):
    """
    Constraint relaxation unblocking runner.

    This runner finds ways to resolve blockers by identifying
    which constraints can be relaxed with minimal impact.

    Algorithmic Pattern:
        1. Analyze blocker and its constraints
        2. Classify constraints by relaxability
        3. Find minimal constraint set to relax
        4. Generate resolution options
        5. Evaluate trade-offs
        6. Recommend best resolution

    Best Used For:
        - Project unblocking
        - Deadlock resolution
        - Resource negotiation
        - Process bottlenecks
    """

    runner_id = "unblock"
    name = "Unblock Runner"
    description = "Resolve blocker using constraint relaxation"
    category = TaskRunnerCategory.SOLVE
    algorithmic_core = "constraint_relaxation"
    max_duration_seconds = 90

    InputType = UnblockInput
    OutputType = UnblockOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize UnblockRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=3000,
        )

    async def execute(self, input: UnblockInput) -> UnblockOutput:
        """
        Execute blocker resolution.

        Args:
            input: Unblock parameters including blocker details

        Returns:
            UnblockOutput with resolution options
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            blocker_text = self._format_blocker(input.blocker)

            constraints_text = ""
            if input.constraints:
                constraints_text = "\nConstraints:\n" + "\n".join(f"- {c}" for c in input.constraints)

            resources_text = ""
            if input.resources_available:
                resources_text = "\nResources available:\n" + "\n".join(f"- {r}" for r in input.resources_available)

            stakeholders_text = ""
            if input.stakeholders:
                stakeholders_text = f"\nStakeholders: {', '.join(input.stakeholders)}"

            approach_instruction = self._get_approach_instruction(input.resolution_approach)

            system_prompt = f"""You are an expert at resolving blockers through constraint relaxation.

Your task is to find ways to unblock by analyzing which constraints can be relaxed.

Urgency: {input.urgency}
{approach_instruction}

Constraint relaxation approach:
1. List all constraints creating the block
2. Classify each constraint:
   - Immutable: Cannot be changed (legal, physical)
   - Hard: Requires significant effort/approval to change
   - Soft: Can be negotiated/adjusted
3. Identify minimal set of relaxations to unblock
4. Generate resolution options:
   - Workaround: Work around the constraint
   - Fix: Address root cause
   - Escalation: Elevate to authority who can relax
   - Pivot: Change approach entirely
   - Accept: Live with the limitation

For each constraint relaxation, specify:
- How to relax it
- Who needs to approve
- What are side effects
- Is it reversible

Return a structured JSON response with:
- resolutions: Array with:
  - resolution_id: R1, R2, etc.
  - title: Short title
  - description: Full description
  - resolution_type: workaround | fix | escalation | pivot | accept
  - relaxations_required: Array of {{constraint, relaxation_type, relaxation_description, effort_required, stakeholder_approval_needed, side_effects, reversible}}
  - steps: Implementation steps
  - effort_estimate: low | medium | high
  - time_to_unblock: Estimated time
  - confidence: 0-1
  - risks: Associated risks
- constraints_analyzed: List of constraints analyzed
- immutable_constraints: Constraints that cannot be relaxed
- unblock_summary: 2-3 sentence summary
- escalation_needed: boolean
- next_steps: Immediate actions"""

            user_prompt = f"""Unblock this blocker:

BLOCKER:
{blocker_text}
{constraints_text}
{resources_text}
{stakeholders_text}

Find resolutions and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_unblock_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build resolutions
            res_data = result.get("resolutions", [])
            resolutions = []
            for i, r in enumerate(res_data):
                relaxations = [
                    ConstraintRelaxation(
                        constraint=rel.get("constraint", ""),
                        relaxation_type=rel.get("relaxation_type", "modify"),
                        relaxation_description=rel.get("relaxation_description", ""),
                        effort_required=rel.get("effort_required", "medium"),
                        stakeholder_approval_needed=rel.get("stakeholder_approval_needed", []),
                        side_effects=rel.get("side_effects", []),
                        reversible=rel.get("reversible", True),
                    )
                    for rel in r.get("relaxations_required", [])
                ]
                resolutions.append(Resolution(
                    resolution_id=r.get("resolution_id", f"R{i+1}"),
                    title=r.get("title", ""),
                    description=r.get("description", ""),
                    resolution_type=r.get("resolution_type", "workaround"),
                    relaxations_required=relaxations,
                    steps=r.get("steps", []),
                    effort_estimate=r.get("effort_estimate", "medium"),
                    time_to_unblock=r.get("time_to_unblock", ""),
                    confidence=float(r.get("confidence", 0.7)),
                    risks=r.get("risks", []),
                ))

            # Find special resolutions
            recommended = max(resolutions, key=lambda x: x.confidence) if resolutions else None
            quick_fix = min(
                [r for r in resolutions if r.effort_estimate == "low"] or resolutions,
                key=lambda x: x.effort_estimate != "low"
            ) if resolutions else None
            proper_fix = next(
                (r for r in resolutions if r.resolution_type == "fix"),
                recommended
            )

            duration = (datetime.utcnow() - start_time).total_seconds()

            return UnblockOutput(
                success=True,
                resolutions=resolutions,
                recommended_resolution=recommended,
                quick_fix=quick_fix,
                proper_fix=proper_fix,
                constraints_analyzed=result.get("constraints_analyzed", []),
                immutable_constraints=result.get("immutable_constraints", []),
                unblock_summary=result.get("unblock_summary", ""),
                escalation_needed=result.get("escalation_needed", False),
                next_steps=result.get("next_steps", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"UnblockRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return UnblockOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_blocker(self, blocker: Dict[str, Any]) -> str:
        """Format blocker for prompt."""
        import json
        return json.dumps(blocker, indent=2, default=str)[:1500]

    def _get_approach_instruction(self, approach: str) -> str:
        """Get instruction based on resolution approach."""
        instructions = {
            "minimal": "Minimal approach: Find smallest possible change to unblock. Prefer workarounds.",
            "balanced": "Balanced approach: Balance speed and quality. Consider both quick fixes and proper fixes.",
            "aggressive": "Aggressive approach: Focus on proper fixes. Accept more effort for better outcomes.",
        }
        return instructions.get(approach, instructions["balanced"])

    def _parse_unblock_response(self, content: str) -> Dict[str, Any]:
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
                "resolutions": [],
                "constraints_analyzed": [],
                "immutable_constraints": [],
                "unblock_summary": content[:200],
                "escalation_needed": False,
                "next_steps": [],
            }
