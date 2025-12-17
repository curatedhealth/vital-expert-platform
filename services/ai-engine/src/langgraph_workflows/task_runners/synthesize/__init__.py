"""
SYNTHESIZE Category - Integration Runners

This category contains atomic cognitive operations for integrating
information from multiple sources into coherent outputs.

Runners:
    - CollectRunner: Gather sources (aggregation)
    - ThemeRunner: Extract themes (topic modeling)
    - ResolveRunner: Resolve conflicts (dialectical synthesis)
    - NarrateRunner: Build narrative (story arc construction)

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

__all__ = [
    # Runners
    "CollectRunner",
    "ThemeRunner",
    "ResolveRunner",
    "NarrateRunner",
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
]
