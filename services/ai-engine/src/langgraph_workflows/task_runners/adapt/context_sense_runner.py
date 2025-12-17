"""
ContextSenseRunner - Sense context using environmental scanning.

Algorithmic Core: Environmental Scanning / Context Detection
- Scans environment for relevant signals
- Identifies contextual factors
- Assesses situational awareness

Use Cases:
- Situation assessment
- Change detection
- Market sensing
- Adaptive response
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

class ContextSenseInput(TaskRunnerInput):
    """Input schema for ContextSenseRunner."""

    domain: str = Field(
        ...,
        description="Domain to scan"
    )
    signals: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Current signals/observations"
    )
    scan_dimensions: List[str] = Field(
        default_factory=lambda: ["political", "economic", "social", "technological"],
        description="Dimensions to scan (PEST)"
    )
    time_horizon: str = Field(
        default="near_term",
        description="near_term | medium_term | long_term"
    )


class ContextFactor(TaskRunnerOutput):
    """A contextual factor."""

    factor_id: str = Field(default="", description="Factor ID")
    dimension: str = Field(default="", description="PEST dimension")
    factor_name: str = Field(default="", description="Factor name")
    description: str = Field(default="", description="Description")
    signal_strength: str = Field(
        default="moderate",
        description="weak | moderate | strong"
    )
    direction: str = Field(
        default="stable",
        description="improving | stable | deteriorating"
    )
    relevance: str = Field(
        default="medium",
        description="low | medium | high | critical"
    )
    implications: List[str] = Field(
        default_factory=list,
        description="What this means"
    )


class ContextSenseOutput(TaskRunnerOutput):
    """Output schema for ContextSenseRunner."""

    context_factors: List[ContextFactor] = Field(
        default_factory=list,
        description="Identified factors"
    )
    context_by_dimension: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Factors by dimension"
    )
    dominant_themes: List[str] = Field(
        default_factory=list,
        description="Key themes emerging"
    )
    uncertainty_level: str = Field(
        default="moderate",
        description="low | moderate | high"
    )
    adaptation_urgency: str = Field(
        default="normal",
        description="low | normal | elevated | urgent"
    )
    key_signals: List[str] = Field(
        default_factory=list,
        description="Most important signals"
    )
    blind_spots: List[str] = Field(
        default_factory=list,
        description="What might be missing"
    )
    context_summary: str = Field(default="", description="Summary")


# =============================================================================
# ContextSenseRunner Implementation
# =============================================================================

@register_task_runner
class ContextSenseRunner(TaskRunner[ContextSenseInput, ContextSenseOutput]):
    """
    Environmental scanning context sensing runner.

    This runner scans the environment and identifies
    contextual factors.

    Algorithmic Pattern:
        1. Scan across dimensions (PEST)
        2. Identify signals and factors
        3. Assess strength and direction
        4. Determine relevance
        5. Identify themes and patterns
        6. Assess uncertainty and urgency

    Best Used For:
        - Situation assessment
        - Strategic planning
        - Change management
        - Adaptive response
    """

    runner_id = "context_sense"
    name = "Context Sense Runner"
    description = "Sense context using environmental scanning"
    category = TaskRunnerCategory.ADAPT
    algorithmic_core = "environmental_scanning"
    max_duration_seconds = 120

    InputType = ContextSenseInput
    OutputType = ContextSenseOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ContextSenseRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: ContextSenseInput) -> ContextSenseOutput:
        """
        Execute context sensing.

        Args:
            input: Context sensing parameters

        Returns:
            ContextSenseOutput with environmental scan
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            signals_text = ""
            if input.signals:
                signals_text = "\nCurrent signals:\n" + json.dumps(
                    input.signals, indent=2, default=str
                )[:2500]

            dimensions_text = ", ".join(input.scan_dimensions)
            horizon_instruction = self._get_horizon_instruction(input.time_horizon)

            system_prompt = f"""You are an expert at environmental scanning and context sensing.

Your task is to scan the environment and identify relevant contextual factors.

Domain: {input.domain}
Scan dimensions: {dimensions_text}
{horizon_instruction}

PEST/Environmental scanning approach:
1. Political: Government, regulation, policy
2. Economic: Markets, costs, growth
3. Social: Culture, demographics, behavior
4. Technological: Innovation, disruption, tools

For each factor:
- Signal strength (weak/moderate/strong)
- Direction (improving/stable/deteriorating)
- Relevance to domain (low/medium/high/critical)
- Implications

Assess:
- Uncertainty level in the environment
- Adaptation urgency required
- Potential blind spots

Return a structured JSON response with:
- context_factors: Array with:
  - factor_id: CF1, CF2, etc.
  - dimension: political | economic | social | technological
  - factor_name: Name
  - description: Description
  - signal_strength: weak | moderate | strong
  - direction: improving | stable | deteriorating
  - relevance: low | medium | high | critical
  - implications: [what this means]
- context_by_dimension: {{dimension: [factor_names]}}
- dominant_themes: [key themes]
- uncertainty_level: low | moderate | high
- adaptation_urgency: low | normal | elevated | urgent
- key_signals: [most important signals]
- blind_spots: [potential gaps]
- context_summary: 2-3 sentence summary"""

            user_prompt = f"""Scan context for:

DOMAIN: {input.domain}
{signals_text}

Perform environmental scan and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_context_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build context factors
            factors_data = result.get("context_factors", [])
            context_factors = [
                ContextFactor(
                    factor_id=f.get("factor_id", f"CF{idx+1}"),
                    dimension=f.get("dimension", ""),
                    factor_name=f.get("factor_name", ""),
                    description=f.get("description", ""),
                    signal_strength=f.get("signal_strength", "moderate"),
                    direction=f.get("direction", "stable"),
                    relevance=f.get("relevance", "medium"),
                    implications=f.get("implications", []),
                )
                for idx, f in enumerate(factors_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ContextSenseOutput(
                success=True,
                context_factors=context_factors,
                context_by_dimension=result.get("context_by_dimension", {}),
                dominant_themes=result.get("dominant_themes", []),
                uncertainty_level=result.get("uncertainty_level", "moderate"),
                adaptation_urgency=result.get("adaptation_urgency", "normal"),
                key_signals=result.get("key_signals", []),
                blind_spots=result.get("blind_spots", []),
                context_summary=result.get("context_summary", ""),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ContextSenseRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ContextSenseOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_horizon_instruction(self, horizon: str) -> str:
        """Get horizon instruction."""
        instructions = {
            "near_term": "Time horizon: Near-term (0-6 months). Focus on immediate factors.",
            "medium_term": "Time horizon: Medium-term (6-18 months). Balance current and emerging.",
            "long_term": "Time horizon: Long-term (18+ months). Focus on strategic trends.",
        }
        return instructions.get(horizon, instructions["near_term"])

    def _parse_context_response(self, content: str) -> Dict[str, Any]:
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
                "context_factors": [],
                "context_by_dimension": {},
                "dominant_themes": [],
                "uncertainty_level": "moderate",
                "adaptation_urgency": "normal",
                "key_signals": [],
                "blind_spots": [],
                "context_summary": content[:200],
            }
