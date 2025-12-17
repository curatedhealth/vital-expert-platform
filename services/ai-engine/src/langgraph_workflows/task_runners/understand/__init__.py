"""
UNDERSTAND Category - Knowledge Acquisition Runners

This category contains atomic cognitive operations for acquiring, exploring,
and extracting knowledge from various sources.

Runners (12 total):
    - ScanRunner: Broad landscape scan (breadth-first exploration)
    - ExploreRunner: Deep dive on theme (depth-first analysis)
    - GapDetectRunner: Find missing info (set difference analysis)
    - ExtractRunner: Extract specific info (pattern matching + NER)
    - CapabilityGapMapperRunner: Map capability gaps
    - MarketDiagnosticianRunner: Diagnose market dynamics
    - CompetitivePositionAnalyzerRunner: Analyze competitive positions
    - StakeholderMapperRunner: Map stakeholder landscape
    - StakeholderSegmenterRunner: Segment stakeholders by characteristics
    - InfluenceNetworkAnalyzerRunner: Analyze influence networks
    - EngagementProfilerRunner: Profile engagement preferences
    - SkillGapAnalyzerRunner: Analyze team skill gaps

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
from .stakeholder_mapper_runner import (
    StakeholderMapperRunner,
    StakeholderMapperInput,
    StakeholderMapperOutput,
    Stakeholder,
)
from .stakeholder_segmenter_runner import (
    StakeholderSegmenterRunner,
    StakeholderSegmenterInput,
    StakeholderSegmenterOutput,
    StakeholderSegment,
)
from .influence_network_runner import (
    InfluenceNetworkAnalyzerRunner,
    InfluenceNetworkInput,
    InfluenceNetworkOutput,
    NetworkNode,
    NetworkEdge,
)
from .engagement_profiler_runner import (
    EngagementProfilerRunner,
    EngagementProfilerInput,
    EngagementProfilerOutput,
    EngagementProfile,
)
from .skill_gap_analyzer_runner import (
    SkillGapAnalyzerRunner,
    SkillGapAnalyzerInput,
    SkillGapAnalyzerOutput,
    SkillGapDetail,
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
    # Stakeholder Mapper
    "StakeholderMapperRunner",
    "StakeholderMapperInput",
    "StakeholderMapperOutput",
    "Stakeholder",
    # Stakeholder Segmenter
    "StakeholderSegmenterRunner",
    "StakeholderSegmenterInput",
    "StakeholderSegmenterOutput",
    "StakeholderSegment",
    # Influence Network
    "InfluenceNetworkAnalyzerRunner",
    "InfluenceNetworkInput",
    "InfluenceNetworkOutput",
    "NetworkNode",
    "NetworkEdge",
    # Engagement Profiler
    "EngagementProfilerRunner",
    "EngagementProfilerInput",
    "EngagementProfilerOutput",
    "EngagementProfile",
    # Skill Gap Analyzer
    "SkillGapAnalyzerRunner",
    "SkillGapAnalyzerInput",
    "SkillGapAnalyzerOutput",
    "SkillGapDetail",
]
