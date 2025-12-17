"""
ResolveRunner - Resolve conflicts using dialectical synthesis.

Algorithmic Core: Dialectical Synthesis / Conflict Resolution
- Identifies conflicting positions
- Analyzes dialectics (thesis, antithesis)
- Synthesizes resolution

Use Cases:
- Conflicting research findings
- Contradictory requirements
- Opposing viewpoints
- Policy conflicts
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

class ConflictingItem(TaskRunnerOutput):
    """A conflicting position or finding."""

    item_id: str = Field(default="", description="Item ID")
    position: str = Field(default="", description="The position/claim")
    source: str = Field(default="", description="Source of this position")
    evidence: List[str] = Field(default_factory=list, description="Supporting evidence")
    strength: float = Field(default=0.5, description="Position strength 0-1")


class ResolveInput(TaskRunnerInput):
    """Input schema for ResolveRunner."""

    conflicting_items: List[Dict[str, Any]] = Field(
        ...,
        description="Conflicting items [{item_id, position, source, evidence}]"
    )
    conflict_type: str = Field(
        default="factual",
        description="Type: factual | methodological | interpretive | values | scope"
    )
    resolution_strategy: str = Field(
        default="dialectical",
        description="Strategy: dialectical | prioritize | contextualize | integrate"
    )
    priority_criteria: List[str] = Field(
        default_factory=list,
        description="Criteria for prioritization if needed"
    )
    context: Optional[str] = Field(
        default=None,
        description="Context for resolution"
    )


class Resolution(TaskRunnerOutput):
    """A conflict resolution."""

    conflict_id: str = Field(default="", description="Conflict ID")
    items_involved: List[str] = Field(
        default_factory=list,
        description="Item IDs in conflict"
    )
    conflict_description: str = Field(default="", description="What the conflict is")
    conflict_root_cause: str = Field(default="", description="Why they conflict")
    resolution_type: str = Field(
        default="synthesis",
        description="synthesis | selection | contextualization | reframing | deferral"
    )
    resolved_position: str = Field(default="", description="The resolved position")
    resolution_rationale: str = Field(default="", description="Why this resolution")
    confidence: float = Field(default=0.7, description="Resolution confidence 0-1")
    caveats: List[str] = Field(default_factory=list, description="Caveats to resolution")
    requires_further_investigation: bool = Field(
        default=False,
        description="Needs more research"
    )


class ResolveOutput(TaskRunnerOutput):
    """Output schema for ResolveRunner."""

    conflicts_identified: int = Field(default=0, description="Conflicts found")
    conflicts_resolved: int = Field(default=0, description="Conflicts resolved")
    resolutions: List[Resolution] = Field(
        default_factory=list,
        description="All resolutions"
    )
    high_confidence_resolutions: List[Resolution] = Field(
        default_factory=list,
        description="Resolutions with confidence >= 0.8"
    )
    unresolved_conflicts: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Conflicts that couldn't be resolved"
    )
    synthesis_summary: str = Field(default="", description="Overall synthesis")
    integrated_position: str = Field(
        default="",
        description="Unified position if possible"
    )
    remaining_tensions: List[str] = Field(
        default_factory=list,
        description="Tensions that persist"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for handling conflicts"
    )


# =============================================================================
# ResolveRunner Implementation
# =============================================================================

@register_task_runner
class ResolveRunner(TaskRunner[ResolveInput, ResolveOutput]):
    """
    Dialectical synthesis conflict resolution runner.

    This runner resolves conflicts between positions using
    thesis-antithesis-synthesis dialectics.

    Algorithmic Pattern:
        1. Identify conflicts
        2. For each conflict:
           - Thesis: First position
           - Antithesis: Opposing position
           - Analyze root cause
           - Apply resolution strategy
           - Synthesize if possible
        3. Assess confidence
        4. Note unresolved conflicts

    Best Used For:
        - Research reconciliation
        - Requirements conflicts
        - Viewpoint synthesis
        - Policy alignment
    """

    runner_id = "resolve"
    name = "Resolve Runner"
    description = "Resolve conflicts using dialectical synthesis"
    category = TaskRunnerCategory.SYNTHESIZE
    algorithmic_core = "dialectical_synthesis"
    max_duration_seconds = 150

    InputType = ResolveInput
    OutputType = ResolveOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ResolveRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: ResolveInput) -> ResolveOutput:
        """
        Execute conflict resolution.

        Args:
            input: Resolution parameters

        Returns:
            ResolveOutput with resolutions
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            items_text = json.dumps(input.conflicting_items, indent=2, default=str)[:3000]

            context_text = ""
            if input.context:
                context_text = f"\nContext: {input.context}"

            priority_text = ""
            if input.priority_criteria:
                priority_text = f"\nPriority criteria: {', '.join(input.priority_criteria)}"

            strategy_instruction = self._get_strategy_instruction(input.resolution_strategy)

            system_prompt = f"""You are an expert at resolving conflicts using dialectical synthesis.

Your task is to resolve conflicting positions using structured analysis.

Conflict type: {input.conflict_type}
Resolution strategy: {input.resolution_strategy}
{strategy_instruction}

Dialectical synthesis approach:
1. Identify all conflicts between positions
2. For each conflict:
   - Thesis: First position
   - Antithesis: Opposing position
   - Analyze why they conflict:
     * Different evidence?
     * Different methods?
     * Different interpretations?
     * Different values?
     * Different scope/context?
3. Apply resolution strategy:
   - dialectical: Find synthesis that transcends both
   - prioritize: Choose strongest based on criteria
   - contextualize: Show when each applies
   - integrate: Combine compatible elements
4. Resolution types:
   - synthesis: New position combining insights
   - selection: Choose one position
   - contextualization: Both valid in different contexts
   - reframing: Resolve by redefining terms
   - deferral: Cannot resolve with current info
5. Note remaining tensions

Return a structured JSON response with:
- conflicts_identified: Count
- conflicts_resolved: Count
- resolutions: Array with:
  - conflict_id: C1, C2, etc.
  - items_involved: Item IDs in conflict
  - conflict_description: What's conflicting
  - conflict_root_cause: Why they conflict
  - resolution_type: synthesis | selection | contextualization | reframing | deferral
  - resolved_position: The resolution
  - resolution_rationale: Why this resolution
  - confidence: 0-1
  - caveats: Caveats
  - requires_further_investigation: boolean
- unresolved_conflicts: Conflicts not resolved
- synthesis_summary: 2-3 sentence summary
- integrated_position: Unified position if possible
- remaining_tensions: Tensions that persist
- recommendations: Next steps"""

            user_prompt = f"""Resolve conflicts between these positions:

CONFLICTING ITEMS:
{items_text}
{context_text}
{priority_text}

Resolve conflicts and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_resolve_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build resolutions
            res_data = result.get("resolutions", [])
            resolutions = [
                Resolution(
                    conflict_id=r.get("conflict_id", f"C{idx+1}"),
                    items_involved=r.get("items_involved", []),
                    conflict_description=r.get("conflict_description", ""),
                    conflict_root_cause=r.get("conflict_root_cause", ""),
                    resolution_type=r.get("resolution_type", "synthesis"),
                    resolved_position=r.get("resolved_position", ""),
                    resolution_rationale=r.get("resolution_rationale", ""),
                    confidence=float(r.get("confidence", 0.7)),
                    caveats=r.get("caveats", []),
                    requires_further_investigation=r.get("requires_further_investigation", False),
                )
                for idx, r in enumerate(res_data)
            ]

            # Filter high confidence
            high_conf = [r for r in resolutions if r.confidence >= 0.8]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ResolveOutput(
                success=True,
                conflicts_identified=result.get("conflicts_identified", len(resolutions)),
                conflicts_resolved=result.get("conflicts_resolved", len(resolutions)),
                resolutions=resolutions,
                high_confidence_resolutions=high_conf,
                unresolved_conflicts=result.get("unresolved_conflicts", []),
                synthesis_summary=result.get("synthesis_summary", ""),
                integrated_position=result.get("integrated_position", ""),
                remaining_tensions=result.get("remaining_tensions", []),
                recommendations=result.get("recommendations", []),
                confidence_score=0.8,
                quality_score=0.8,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ResolveRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ResolveOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_strategy_instruction(self, strategy: str) -> str:
        """Get strategy instruction."""
        instructions = {
            "dialectical": "Dialectical: Find synthesis transcending thesis and antithesis.",
            "prioritize": "Prioritize: Choose strongest position based on criteria.",
            "contextualize": "Contextualize: Show when each position applies.",
            "integrate": "Integrate: Combine compatible elements from each.",
        }
        return instructions.get(strategy, instructions["dialectical"])

    def _parse_resolve_response(self, content: str) -> Dict[str, Any]:
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
                "conflicts_identified": 0,
                "conflicts_resolved": 0,
                "resolutions": [],
                "unresolved_conflicts": [],
                "synthesis_summary": content[:200],
                "integrated_position": "",
                "remaining_tensions": [],
                "recommendations": [],
            }
