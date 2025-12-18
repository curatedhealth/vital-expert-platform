"""
SYNTHESIZE Category - Positioning Finalizer Runner

Synthesizes positioning elements into a final, coherent positioning
strategy that integrates all inputs and resolves conflicts.

Core Logic: Positioning Synthesis / Strategy Integration
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
# DATA SCHEMAS
# =============================================================================

class FinalPositioning(TaskRunnerOutput):
    """The finalized positioning statement."""
    positioning_statement: str = Field(default="")
    target_audience: str = Field(default="")
    frame_of_reference: str = Field(default="")
    key_benefit: str = Field(default="")
    reason_to_believe: str = Field(default="")
    emotional_benefit: str = Field(default="")
    brand_personality: List[str] = Field(default_factory=list)


class MessagePillar(TaskRunnerOutput):
    """A messaging pillar derived from positioning."""
    pillar_id: str = Field(default="")
    pillar_name: str = Field(default="")
    core_message: str = Field(default="")
    supporting_points: List[str] = Field(default_factory=list)
    evidence_references: List[str] = Field(default_factory=list)
    stakeholder_relevance: Dict[str, str] = Field(default_factory=dict)


class PositioningFinalizerInput(TaskRunnerInput):
    """Input for positioning finalization."""
    positioning_options: List[Dict[str, Any]] = Field(..., description="Candidate positioning options")
    evidence_support: Dict[str, Any] = Field(default_factory=dict, description="Evidence mapped to claims")
    competitive_context: Dict[str, Any] = Field(default_factory=dict, description="Competitive positioning landscape")
    stakeholder_priorities: Dict[str, List[str]] = Field(default_factory=dict, description="Priorities by stakeholder")
    constraints: List[str] = Field(default_factory=list, description="Positioning constraints")


class PositioningFinalizerOutput(TaskRunnerOutput):
    """Output from positioning finalization."""
    final_positioning: FinalPositioning = Field(default_factory=FinalPositioning)
    message_pillars: List[MessagePillar] = Field(default_factory=list)
    positioning_rationale: str = Field(default="")
    tradeoffs_made: List[str] = Field(default_factory=list)
    differentiation_points: List[str] = Field(default_factory=list)
    competitive_advantages: List[str] = Field(default_factory=list)
    implementation_guidance: List[str] = Field(default_factory=list)
    stakeholder_adaptations: Dict[str, str] = Field(default_factory=dict)
    synthesis_summary: str = Field(default="")


# =============================================================================
# POSITIONING FINALIZER RUNNER
# =============================================================================

@register_task_runner
class PositioningFinalizerRunner(TaskRunner[PositioningFinalizerInput, PositioningFinalizerOutput]):
    """
    Synthesize positioning elements into final strategy.

    Algorithmic Core: positioning_synthesis
    Temperature: 0.3 (balanced creativity)

    Synthesizes:
    - Candidate positioning options
    - Evidence support
    - Competitive context
    - Stakeholder priorities
    - Constraints and tradeoffs
    """
    runner_id = "positioning_finalizer"
    name = "Positioning Finalizer Runner"
    description = "Finalize positioning using positioning synthesis"
    category = TaskRunnerCategory.SYNTHESIZE
    algorithmic_core = "positioning_synthesis"
    max_duration_seconds = 150
    InputType = PositioningFinalizerInput
    OutputType = PositioningFinalizerOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.3, max_tokens=4000)

    async def execute(self, input: PositioningFinalizerInput) -> PositioningFinalizerOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Synthesize positioning elements into a final positioning strategy.

Positioning Options: {input.positioning_options}
Evidence Support: {input.evidence_support}
Competitive Context: {input.competitive_context}
Stakeholder Priorities: {input.stakeholder_priorities}
Constraints: {input.constraints}

Create a final positioning that:
1. Selects and refines the best positioning approach
2. Ensures evidence-backed claims
3. Differentiates from competition
4. Addresses stakeholder priorities
5. Resolves conflicts between options

Return JSON with:
- final_positioning: {{positioning_statement, target_audience, frame_of_reference, key_benefit, reason_to_believe, emotional_benefit, brand_personality[]}}
- message_pillars: array of {{pillar_id, pillar_name, core_message, supporting_points[], evidence_references[], stakeholder_relevance (dict)}}
- positioning_rationale: why this positioning was chosen
- tradeoffs_made: array of tradeoffs accepted
- differentiation_points: array of unique differentiators
- competitive_advantages: array of competitive advantages
- implementation_guidance: array of implementation recommendations
- stakeholder_adaptations: dict mapping stakeholder -> how to adapt messaging
- synthesis_summary: overall positioning synthesis summary
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are a positioning strategist. Synthesize multiple inputs into a coherent, differentiated, and evidence-backed positioning strategy that can be implemented across stakeholders."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            final_positioning = FinalPositioning(**result.get("final_positioning", {}))
            message_pillars = [MessagePillar(**p) for p in result.get("message_pillars", [])]

            return PositioningFinalizerOutput(
                success=True,
                final_positioning=final_positioning,
                message_pillars=message_pillars,
                positioning_rationale=result.get("positioning_rationale", ""),
                tradeoffs_made=result.get("tradeoffs_made", []),
                differentiation_points=result.get("differentiation_points", []),
                competitive_advantages=result.get("competitive_advantages", []),
                implementation_guidance=result.get("implementation_guidance", []),
                stakeholder_adaptations=result.get("stakeholder_adaptations", {}),
                synthesis_summary=result.get("synthesis_summary", ""),
                confidence_score=0.85,
                quality_score=len(message_pillars) * 0.2 + (0.3 if final_positioning.positioning_statement else 0),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"PositioningFinalizerRunner error: {e}")
            return PositioningFinalizerOutput(
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
