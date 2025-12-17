"""
ConsensusRunner - Build consensus using Delphi method.

Algorithmic Core: Delphi Method / Consensus Building
- Collects diverse viewpoints
- Identifies areas of agreement/disagreement
- Facilitates convergence

Use Cases:
- Multi-stakeholder decisions
- Expert consensus
- Team alignment
- Strategic direction
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

class ConsensusInput(TaskRunnerInput):
    """Input schema for ConsensusRunner."""

    topic: str = Field(
        ...,
        description="Topic to build consensus on"
    )
    viewpoints: List[Dict[str, Any]] = Field(
        ...,
        description="List of viewpoints [{source, position, rationale}]"
    )
    decision_criteria: List[str] = Field(
        default_factory=list,
        description="Criteria for evaluation"
    )
    consensus_threshold: float = Field(
        default=0.7,
        description="Threshold for consensus (0.5-1.0)"
    )


class ViewpointAnalysis(TaskRunnerOutput):
    """Analysis of a viewpoint."""

    viewpoint_id: str = Field(default="", description="Viewpoint ID")
    source: str = Field(default="", description="Source")
    position: str = Field(default="", description="Position")
    key_arguments: List[str] = Field(default_factory=list, description="Arguments")
    strengths: List[str] = Field(default_factory=list, description="Strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Weaknesses")
    alignment_with_consensus: str = Field(
        default="partial",
        description="aligned | partial | divergent"
    )


class ConsensusOutput(TaskRunnerOutput):
    """Output schema for ConsensusRunner."""

    consensus_reached: bool = Field(
        default=False,
        description="Whether consensus was reached"
    )
    consensus_level: float = Field(
        default=0,
        description="Consensus level 0-100"
    )
    consensus_position: str = Field(
        default="",
        description="The consensus position"
    )
    viewpoint_analyses: List[ViewpointAnalysis] = Field(
        default_factory=list,
        description="Analysis of each viewpoint"
    )
    areas_of_agreement: List[str] = Field(
        default_factory=list,
        description="Points of agreement"
    )
    areas_of_disagreement: List[str] = Field(
        default_factory=list,
        description="Points of disagreement"
    )
    key_tradeoffs: List[str] = Field(
        default_factory=list,
        description="Key tradeoffs identified"
    )
    synthesis_rationale: str = Field(
        default="",
        description="How consensus was synthesized"
    )
    next_steps: List[str] = Field(
        default_factory=list,
        description="Steps to strengthen consensus"
    )
    consensus_summary: str = Field(default="", description="Summary")


# =============================================================================
# ConsensusRunner Implementation
# =============================================================================

@register_task_runner
class ConsensusRunner(TaskRunner[ConsensusInput, ConsensusOutput]):
    """
    Delphi method consensus building runner.

    This runner analyzes diverse viewpoints and
    builds toward consensus.

    Algorithmic Pattern:
        1. Analyze each viewpoint
        2. Identify common ground
        3. Identify disagreements
        4. Apply decision criteria
        5. Synthesize consensus position
        6. Assess consensus level
        7. Recommend next steps

    Best Used For:
        - Expert panels
        - Multi-stakeholder decisions
        - Strategy alignment
        - Policy development
    """

    runner_id = "consensus"
    name = "Consensus Runner"
    description = "Build consensus using Delphi method"
    category = TaskRunnerCategory.ALIGN
    algorithmic_core = "delphi_method"
    max_duration_seconds = 150

    InputType = ConsensusInput
    OutputType = ConsensusOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ConsensusRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4500,
        )

    async def execute(self, input: ConsensusInput) -> ConsensusOutput:
        """
        Execute consensus building.

        Args:
            input: Consensus building parameters

        Returns:
            ConsensusOutput with consensus position
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            viewpoints_text = json.dumps(input.viewpoints, indent=2, default=str)[:3000]

            criteria_text = ""
            if input.decision_criteria:
                criteria_text = "\nDecision criteria:\n" + "\n".join(
                    f"- {c}" for c in input.decision_criteria
                )

            system_prompt = f"""You are an expert facilitator skilled in the Delphi method for building consensus.

Your task is to analyze viewpoints and build toward consensus.

Topic: {input.topic}
Consensus threshold: {input.consensus_threshold * 100}%
{criteria_text}

Delphi consensus approach:
1. Analyze each viewpoint:
   - Extract position
   - Identify key arguments
   - Assess strengths/weaknesses
2. Find common ground:
   - What do all/most agree on?
   - What are shared values?
3. Identify disagreements:
   - Where do positions diverge?
   - What are root causes?
4. Synthesize consensus:
   - Build on areas of agreement
   - Address key concerns
   - Create integrated position
5. Assess consensus level:
   - 90-100%: Strong consensus
   - 70-89%: Moderate consensus
   - 50-69%: Weak consensus
   - <50%: No consensus

Return a structured JSON response with:
- consensus_reached: true if level >= threshold
- consensus_level: 0-100
- consensus_position: The synthesized position
- viewpoint_analyses: Array with:
  - viewpoint_id: V1, V2, etc.
  - source: Source name
  - position: Their position
  - key_arguments: [arguments]
  - strengths: [strengths]
  - weaknesses: [weaknesses]
  - alignment_with_consensus: aligned | partial | divergent
- areas_of_agreement: [points of agreement]
- areas_of_disagreement: [points of disagreement]
- key_tradeoffs: [tradeoffs identified]
- synthesis_rationale: How consensus was built
- next_steps: [steps to strengthen consensus]
- consensus_summary: 2-3 sentence summary"""

            user_prompt = f"""Build consensus from these viewpoints:

TOPIC: {input.topic}

VIEWPOINTS:
{viewpoints_text}

Synthesize consensus and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_consensus_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build viewpoint analyses
            analyses_data = result.get("viewpoint_analyses", [])
            viewpoint_analyses = [
                ViewpointAnalysis(
                    viewpoint_id=a.get("viewpoint_id", f"V{idx+1}"),
                    source=a.get("source", ""),
                    position=a.get("position", ""),
                    key_arguments=a.get("key_arguments", []),
                    strengths=a.get("strengths", []),
                    weaknesses=a.get("weaknesses", []),
                    alignment_with_consensus=a.get("alignment_with_consensus", "partial"),
                )
                for idx, a in enumerate(analyses_data)
            ]

            consensus_level = float(result.get("consensus_level", 50))
            consensus_reached = consensus_level >= (input.consensus_threshold * 100)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ConsensusOutput(
                success=True,
                consensus_reached=result.get("consensus_reached", consensus_reached),
                consensus_level=consensus_level,
                consensus_position=result.get("consensus_position", ""),
                viewpoint_analyses=viewpoint_analyses,
                areas_of_agreement=result.get("areas_of_agreement", []),
                areas_of_disagreement=result.get("areas_of_disagreement", []),
                key_tradeoffs=result.get("key_tradeoffs", []),
                synthesis_rationale=result.get("synthesis_rationale", ""),
                next_steps=result.get("next_steps", []),
                consensus_summary=result.get("consensus_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ConsensusRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ConsensusOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_consensus_response(self, content: str) -> Dict[str, Any]:
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
                "consensus_reached": False,
                "consensus_level": 0,
                "consensus_position": "",
                "viewpoint_analyses": [],
                "areas_of_agreement": [],
                "areas_of_disagreement": [],
                "key_tradeoffs": [],
                "synthesis_rationale": "",
                "next_steps": [],
                "consensus_summary": content[:200],
            }
