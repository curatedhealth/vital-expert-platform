"""
WATCH Category - Monitoring Runners

This category contains atomic cognitive operations for establishing
baselines, detecting changes, evaluating alerts, and projecting trends.

Runners:
    - BaselineRunner: Establish baseline (statistical profiling)
    - DeltaRunner: Detect changes (change detection / CUSUM)
    - AlertRunner: Evaluate alerts (threshold evaluation)
    - TrendRunner: Extrapolate trends (time series projection)
    - SignalTrendAnalyzerRunner: Analyze weak signals and emerging trends
    - AlertGeneratorRunner: Generate alert stream from monitoring data

Core Logic: CUSUM / Delta Tracking / Time Series Analysis / Signal Detection

Each runner is designed for:
    - 60-120 second execution time
    - Single monitoring operation
    - Stateless operation (no memory between invocations)
    - Composable: Baseline → Delta → Alert → Trend
"""

from .baseline_runner import (
    BaselineRunner,
    BaselineInput,
    BaselineOutput,
    MetricBaseline,
)
from .delta_runner import (
    DeltaRunner,
    DeltaInput,
    DeltaOutput,
    MetricDelta,
)
from .alert_runner import (
    AlertRunner,
    AlertInput,
    AlertOutput,
    AlertEvaluation,
    AlertThreshold,
)
from .trend_runner import (
    TrendRunner,
    TrendInput,
    TrendOutput,
    MetricTrend,
)
from .signal_trend_analyzer_runner import (
    SignalTrendAnalyzerRunner,
    SignalTrendAnalyzerInput,
    SignalTrendAnalyzerOutput,
    Signal,
)
from .alert_generator_runner import (
    AlertGeneratorRunner,
    AlertGeneratorInput,
    AlertGeneratorOutput,
    Alert,
)

__all__ = [
    # Runners
    "BaselineRunner",
    "DeltaRunner",
    "AlertRunner",
    "TrendRunner",
    # Baseline schemas
    "BaselineInput",
    "BaselineOutput",
    "MetricBaseline",
    # Delta schemas
    "DeltaInput",
    "DeltaOutput",
    "MetricDelta",
    # Alert schemas
    "AlertInput",
    "AlertOutput",
    "AlertEvaluation",
    "AlertThreshold",
    # Trend schemas
    "TrendInput",
    "TrendOutput",
    "MetricTrend",
    # Signal Trend Analyzer
    "SignalTrendAnalyzerRunner",
    "SignalTrendAnalyzerInput",
    "SignalTrendAnalyzerOutput",
    "Signal",
    # Alert Generator
    "AlertGeneratorRunner",
    "AlertGeneratorInput",
    "AlertGeneratorOutput",
    "Alert",
]
