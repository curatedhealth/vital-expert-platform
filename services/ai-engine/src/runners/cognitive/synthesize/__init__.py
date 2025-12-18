"""
SYNTHESIZE Category - Integration Runners

This category contains atomic cognitive operations for integrating
information from multiple sources into coherent outputs.

Runners (7 total):
    - CollectRunner: Gather sources (aggregation)
    - ThemeRunner: Extract themes (topic modeling)
    - ResolveRunner: Resolve conflicts (dialectical synthesis)
    - NarrateRunner: Build narrative (story arc construction)
    - EvidenceMapperRunner: Map evidence to claims (evidence integration)
    - PositioningFinalizerRunner: Finalize positioning (positioning synthesis)
    - InsightSynthesizerRunner: Synthesize insights from research (insight synthesis)

Core Logic: Semantic Integration / Conflict Resolution / Narrative Construction

Synthesis Pipeline:
    1. COLLECT: Gather and deduplicate sources
    2. THEME: Extract recurring themes and patterns
    3. RESOLVE: Handle conflicts between sources
    4. NARRATE: Weave into coherent narrative

Each runner is designed for:
    - 60-180 second execution time
    - Single synthesis operation
    - Stateless operation (no memory between invocations)
    - Composable pipeline: Collect → Theme → Resolve → Narrate
"""

from .collect_runner import (
    CollectRunner,
    CollectInput,
    CollectOutput,
    CollectedItem,
    SourceItem,
)
from .theme_runner import (
    ThemeRunner,
    ThemeInput,
    ThemeOutput,
    Theme,
)
from .resolve_runner import (
    ResolveRunner,
    ResolveInput,
    ResolveOutput,
    Resolution,
    ConflictingItem,
)
from .narrate_runner import (
    NarrateRunner,
    NarrateInput,
    NarrateOutput,
    NarrativeSection,
)
from .evidence_mapper_runner import (
    EvidenceMapperRunner,
    EvidenceMapperInput,
    EvidenceMapperOutput,
    EvidenceItem,
    EvidenceCluster,
)
from .positioning_finalizer_runner import (
    PositioningFinalizerRunner,
    PositioningFinalizerInput,
    PositioningFinalizerOutput,
    FinalPositioning,
    MessagePillar,
)
from .insight_synthesizer_runner import (
    InsightSynthesizerRunner,
    InsightSynthesizerInput,
    InsightSynthesizerOutput,
    SynthesizedInsight,
)
from .reciprocal_rank_fusion_runner import (
    RankedItem,
    vital_normalize_scores,
    vital_rrf_fuse,
    vital_weighted_rrf_fuse,
)
from .consensus_calculator_runner import (
    SimpleConsensusCalculator,
    ConsensusResult,
)

__all__ = [
    # Runners
    "CollectRunner",
    "ThemeRunner",
    "ResolveRunner",
    "NarrateRunner",
    "EvidenceMapperRunner",
    "PositioningFinalizerRunner",
    # Collect schemas
    "CollectInput",
    "CollectOutput",
    "CollectedItem",
    "SourceItem",
    # Theme schemas
    "ThemeInput",
    "ThemeOutput",
    "Theme",
    # Resolve schemas
    "ResolveInput",
    "ResolveOutput",
    "Resolution",
    "ConflictingItem",
    # Narrate schemas
    "NarrateInput",
    "NarrateOutput",
    "NarrativeSection",
    # Evidence Mapper schemas
    "EvidenceMapperInput",
    "EvidenceMapperOutput",
    "EvidenceItem",
    "EvidenceCluster",
    # Positioning Finalizer schemas
    "PositioningFinalizerInput",
    "PositioningFinalizerOutput",
    "FinalPositioning",
    "MessagePillar",
    # Insight Synthesizer schemas
    "InsightSynthesizerRunner",
    "InsightSynthesizerInput",
    "InsightSynthesizerOutput",
    "SynthesizedInsight",
    # Reciprocal Rank Fusion
    "RankedItem",
    "vital_normalize_scores",
    "vital_rrf_fuse",
    "vital_weighted_rrf_fuse",
    # Consensus Calculator
    "SimpleConsensusCalculator",
    "ConsensusResult",
]
