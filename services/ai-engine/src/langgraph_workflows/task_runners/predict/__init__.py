"""
PREDICT Category - Forecasting Runners

This category contains atomic cognitive operations for forecasting
using simulation and scenario planning.

Runners:
    - TrendAnalyzeRunner: Analyze trends (regression analysis)
    - ScenarioRunner: Generate scenario (scenario construction)
    - ProjectRunner: Project future (Monte Carlo simulation)
    - UncertaintyRunner: Quantify uncertainty (confidence estimation)
    - ImplicationModelerRunner: Model strategic implications
    - ProbabilityEstimatorRunner: Estimate scenario probabilities (Bayesian)
    - CannibalizationModelerRunner: Model portfolio cannibalization

Core Logic: Monte Carlo Simulation / Scenario Planning

Forecasting Pipeline:
    1. TREND ANALYZE: Identify historical patterns
    2. SCENARIO: Build plausible future scenarios
    3. PROJECT: Generate probabilistic projections
    4. UNCERTAINTY: Quantify prediction confidence

Each runner is designed for:
    - 60-150 second execution time
    - Single forecasting operation
    - Stateless operation (no memory between invocations)
    - Composable pipeline: TrendAnalyze → Scenario → Project → Uncertainty
"""

from .trend_analyze_runner import (
    TrendAnalyzeRunner,
    TrendAnalyzeInput,
    TrendAnalyzeOutput,
    TrendSegment,
    DataPoint,
)
from .scenario_runner import (
    ScenarioRunner,
    ScenarioInput,
    ScenarioOutput,
    Scenario,
)
from .project_runner import (
    ProjectRunner,
    ProjectInput,
    ProjectOutput,
    ProjectionPath,
    MetricProjection,
)
from .uncertainty_runner import (
    UncertaintyRunner,
    UncertaintyInput,
    UncertaintyOutput,
    UncertaintySource,
    ConfidenceInterval,
)
from .implication_modeler_runner import (
    ImplicationModelerRunner,
    ImplicationModelerInput,
    ImplicationModelerOutput,
    Implication,
)
from .probability_estimator_runner import (
    ProbabilityEstimatorRunner,
    ProbabilityEstimatorInput,
    ProbabilityEstimatorOutput,
    ProbabilityEstimate,
)
from .cannibalization_modeler_runner import (
    CannibalizationModelerRunner,
    CannibalizationModelerInput,
    CannibalizationModelerOutput,
    CannibalizationEffect,
)

__all__ = [
    # Runners
    "TrendAnalyzeRunner",
    "ScenarioRunner",
    "ProjectRunner",
    "UncertaintyRunner",
    # Trend analyze schemas
    "TrendAnalyzeInput",
    "TrendAnalyzeOutput",
    "TrendSegment",
    "DataPoint",
    # Scenario schemas
    "ScenarioInput",
    "ScenarioOutput",
    "Scenario",
    # Project schemas
    "ProjectInput",
    "ProjectOutput",
    "ProjectionPath",
    "MetricProjection",
    # Uncertainty schemas
    "UncertaintyInput",
    "UncertaintyOutput",
    "UncertaintySource",
    "ConfidenceInterval",
    # Implication Modeler
    "ImplicationModelerRunner",
    "ImplicationModelerInput",
    "ImplicationModelerOutput",
    "Implication",
    # Probability Estimator
    "ProbabilityEstimatorRunner",
    "ProbabilityEstimatorInput",
    "ProbabilityEstimatorOutput",
    "ProbabilityEstimate",
    # Cannibalization Modeler
    "CannibalizationModelerRunner",
    "CannibalizationModelerInput",
    "CannibalizationModelerOutput",
    "CannibalizationEffect",
]
