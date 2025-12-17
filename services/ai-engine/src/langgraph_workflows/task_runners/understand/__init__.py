"""
UNDERSTAND Category - Knowledge Acquisition Runners

This category contains atomic cognitive operations for acquiring, exploring,
and extracting knowledge from various sources.

Runners:
    - ScanRunner: Broad landscape scan (breadth-first exploration)
    - ExploreRunner: Deep dive on theme (depth-first analysis)
    - GapDetectRunner: Find missing info (set difference analysis)
    - ExtractRunner: Extract specific info (pattern matching + NER)
    - CapabilityGapMapperRunner: Map capability gaps
    - MarketDiagnosticianRunner: Diagnose market dynamics
    - CompetitivePositionAnalyzerRunner: Analyze competitive positions

Each runner is designed for:
    - 30-120 second execution time
    - Single cognitive operation
    - Stateless operation (no memory between invocations)
    - Composable output (feeds into other runners)
"""

from .scan_runner import (
    ScanRunner,
    ScanInput,
    ScanOutput,
    ThemeInfo,
)
from .explore_runner import (
    ExploreRunner,
    ExploreInput,
    ExploreOutput,
    Finding,
)
from .gap_detect_runner import (
    GapDetectRunner,
    GapDetectInput,
    GapDetectOutput,
    Gap,
)
from .extract_runner import (
    ExtractRunner,
    ExtractInput,
    ExtractOutput,
    ExtractedEntity,
    ExtractionSpec,
)
from .capability_gap_mapper_runner import (
    CapabilityGapMapperRunner,
    CapabilityGapMapperInput,
    CapabilityGapMapperOutput,
    CapabilityGap,
)
from .market_diagnostician_runner import (
    MarketDiagnosticianRunner,
    MarketDiagnosticianInput,
    MarketDiagnosticianOutput,
)
from .competitive_position_runner import (
    CompetitivePositionAnalyzerRunner,
    CompetitivePositionInput,
    CompetitivePositionOutput,
    CompetitorPosition,
)

__all__ = [
    # Runners
    "ScanRunner",
    "ExploreRunner",
    "GapDetectRunner",
    "ExtractRunner",
    # Scan schemas
    "ScanInput",
    "ScanOutput",
    "ThemeInfo",
    # Explore schemas
    "ExploreInput",
    "ExploreOutput",
    "Finding",
    # GapDetect schemas
    "GapDetectInput",
    "GapDetectOutput",
    "Gap",
    # Extract schemas
    "ExtractInput",
    "ExtractOutput",
    "ExtractedEntity",
    "ExtractionSpec",
    # Capability Gap Mapper
    "CapabilityGapMapperRunner",
    "CapabilityGapMapperInput",
    "CapabilityGapMapperOutput",
    "CapabilityGap",
    # Market Diagnostician
    "MarketDiagnosticianRunner",
    "MarketDiagnosticianInput",
    "MarketDiagnosticianOutput",
    # Competitive Position
    "CompetitivePositionAnalyzerRunner",
    "CompetitivePositionInput",
    "CompetitivePositionOutput",
    "CompetitorPosition",
]
