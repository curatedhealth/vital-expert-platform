"""
SignalTrendAnalyzerRunner - Analyze weak signals and emerging trends.

Algorithmic Core: Signal Trend Detection
- Identifies weak signals in market/technology/regulatory data
- Categorizes signals by strength (weak, emerging, strong)
- Maps signal relationships and convergence patterns

Use Cases:
- Strategic foresight monitoring
- Technology trend detection
- Competitive intelligence signals
- Regulatory change indicators
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

class Signal(TaskRunnerOutput):
    """Individual signal detected."""

    signal_id: str = Field(default="", description="Unique signal identifier")
    signal_name: str = Field(default="", description="Signal name")
    signal_type: str = Field(default="market", description="market | technology | regulatory | competitive | social")
    description: str = Field(default="", description="Signal description")
    strength: str = Field(default="weak", description="weak | emerging | strong")
    confidence: float = Field(default=0.0, description="Detection confidence 0-1")
    source: str = Field(default="", description="Signal source")
    first_detected: Optional[str] = Field(default=None, description="First detection date")
    trend_direction: str = Field(default="stable", description="growing | stable | declining")
    potential_impact: str = Field(default="low", description="low | medium | high | transformative")


class SignalTrendAnalyzerInput(TaskRunnerInput):
    """Input schema for SignalTrendAnalyzerRunner."""

    data_sources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Data sources to analyze [{source_type, content, date}]"
    )
    focus_areas: List[str] = Field(
        default_factory=list,
        description="Areas to focus signal detection on"
    )
    time_horizon: str = Field(
        default="3_years",
        description="Time horizon for trend analysis"
    )
    industry_context: Optional[str] = Field(
        default=None,
        description="Industry context for signal interpretation"
    )
    existing_signals: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Previously identified signals for tracking"
    )


class SignalTrendAnalyzerOutput(TaskRunnerOutput):
    """Output schema for SignalTrendAnalyzerRunner."""

    signals: List[Signal] = Field(
        default_factory=list,
        description="All detected signals"
    )
    weak_signals: List[Signal] = Field(
        default_factory=list,
        description="Weak/early signals"
    )
    emerging_signals: List[Signal] = Field(
        default_factory=list,
        description="Emerging signals gaining momentum"
    )
    strong_signals: List[Signal] = Field(
        default_factory=list,
        description="Strong established signals"
    )
    signal_map: Dict[str, Any] = Field(
        default_factory=dict,
        description="Signal relationships and clusters"
    )
    convergence_patterns: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Patterns where multiple signals converge"
    )
    signal_count: int = Field(default=0, description="Total signals detected")
    analysis_timestamp: str = Field(default="", description="Analysis timestamp")


# =============================================================================
# Runner Implementation
# =============================================================================

@register_task_runner
class SignalTrendAnalyzerRunner(TaskRunner[SignalTrendAnalyzerInput, SignalTrendAnalyzerOutput]):
    """
    Analyze weak signals and emerging trends for strategic foresight.

    Algorithmic core: Signal trend detection using pattern recognition
    and weak signal amplification techniques.

    Pipeline position: Early-stage foresight (feeds into impact assessment)
    """

    runner_id = "signal_trend_analyzer"
    category = TaskRunnerCategory.WATCH
    algorithmic_core = "signal_trend_detection"
    max_duration_seconds = 120
    temperature = 0.3  # Balanced for pattern detection

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=self.temperature,
            max_tokens=4000,
        )

    async def execute(self, input_data: SignalTrendAnalyzerInput) -> SignalTrendAnalyzerOutput:
        """Execute signal trend analysis."""
        logger.info(f"Executing SignalTrendAnalyzerRunner")

        prompt = """You are a strategic foresight analyst specializing in weak signal detection.

Analyze the provided data sources to identify signals:

1. SIGNAL DETECTION:
   For each signal found:
   - signal_id: Unique identifier (e.g., SIG-001)
   - signal_name: Clear, descriptive name
   - signal_type: market | technology | regulatory | competitive | social
   - description: What the signal indicates
   - strength: weak (early/uncertain) | emerging (gaining momentum) | strong (established)
   - confidence: 0-1 detection confidence
   - source: Where signal was detected
   - trend_direction: growing | stable | declining
   - potential_impact: low | medium | high | transformative

2. SIGNAL CATEGORIZATION:
   - Group signals by strength level
   - Identify weak signals that may become significant
   - Note emerging signals requiring monitoring

3. SIGNAL MAP:
   - relationships: How signals connect to each other
   - clusters: Groups of related signals
   - dependencies: Signals that depend on others

4. CONVERGENCE PATTERNS:
   - pattern_name: Name of convergence
   - signals_involved: List of signal IDs
   - convergence_type: reinforcing | conflicting | transformative
   - timeline: When convergence expected

Return JSON with: signals[], weak_signals[], emerging_signals[], strong_signals[], signal_map{}, convergence_patterns[]"""

        context = f"""Data Sources: {input_data.data_sources[:5]}
Focus Areas: {input_data.focus_areas}
Time Horizon: {input_data.time_horizon}
Industry Context: {input_data.industry_context}
Existing Signals: {input_data.existing_signals[:3]}"""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=prompt),
                HumanMessage(content=context)
            ])
            result = self._parse_json_output(response.content)

            signals = [Signal(**s) for s in result.get("signals", [])]
            weak_signals = [Signal(**s) for s in result.get("weak_signals", [])]
            emerging_signals = [Signal(**s) for s in result.get("emerging_signals", [])]
            strong_signals = [Signal(**s) for s in result.get("strong_signals", [])]

            output = SignalTrendAnalyzerOutput(
                signals=signals,
                weak_signals=weak_signals,
                emerging_signals=emerging_signals,
                strong_signals=strong_signals,
                signal_map=result.get("signal_map", {}),
                convergence_patterns=result.get("convergence_patterns", []),
                signal_count=len(signals),
                analysis_timestamp=datetime.utcnow().isoformat(),
                quality_score=0.8 if signals else 0.4,
                tokens_used=response.usage_metadata.get("total_tokens", 0) if hasattr(response, "usage_metadata") else 0,
            )

            logger.info(f"SignalTrendAnalyzer found {len(signals)} signals")
            return output

        except Exception as e:
            logger.error(f"SignalTrendAnalyzerRunner failed: {e}")
            return SignalTrendAnalyzerOutput(
                error=str(e),
                quality_score=0.0,
                analysis_timestamp=datetime.utcnow().isoformat(),
            )

    def _parse_json_output(self, content: str) -> Dict[str, Any]:
        """Parse JSON from LLM response."""
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON, returning empty dict")
            return {}


# =============================================================================
# Exports
# =============================================================================

__all__ = [
    "SignalTrendAnalyzerRunner",
    "SignalTrendAnalyzerInput",
    "SignalTrendAnalyzerOutput",
    "Signal",
]
