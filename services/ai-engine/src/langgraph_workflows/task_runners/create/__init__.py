"""
CREATE Category - Generation Runners

This category contains atomic cognitive operations for drafting content,
expanding sections, applying formatting, and adding citations.

Runners (6 total):
    - DraftRunner: Generate draft (template expansion)
    - ExpandRunner: Expand section (recursive elaboration)
    - FormatRunner: Apply formatting (style transformation)
    - CitationRunner: Add citations (source linking)
    - NarrativeStorylineConstructorRunner: Construct narrative storylines
    - ProtocolDeveloperRunner: Develop study protocols

Core Logic: Generative Feedback Loops (GFL) / Latent Space Exploration / Consistency Management

Each runner is designed for:
    - 60-180 second execution time
    - Single generation operation
    - Stateless operation (no memory between invocations)
    - Composable: Draft → Expand → Format → Citation
"""

from .draft_runner import (
    DraftRunner,
    DraftInput,
    DraftOutput,
    DraftSection,
)
from .expand_runner import (
    ExpandRunner,
    ExpandInput,
    ExpandOutput,
    ExpansionElement,
)
from .format_runner import (
    FormatRunner,
    FormatInput,
    FormatOutput,
    FormatTransformation,
)
from .citation_runner import (
    CitationRunner,
    CitationInput,
    CitationOutput,
    Citation,
    Source,
)
from .narrative_constructor_runner import (
    NarrativeStorylineConstructorRunner,
    NarrativeConstructorInput,
    NarrativeConstructorOutput,
    NarrativeElement,
)
from .protocol_developer_runner import (
    ProtocolDeveloperRunner,
    ProtocolDeveloperInput,
    ProtocolDeveloperOutput,
    ProtocolSection,
)

__all__ = [
    # Runners
    "DraftRunner",
    "ExpandRunner",
    "FormatRunner",
    "CitationRunner",
    # Draft schemas
    "DraftInput",
    "DraftOutput",
    "DraftSection",
    # Expand schemas
    "ExpandInput",
    "ExpandOutput",
    "ExpansionElement",
    # Format schemas
    "FormatInput",
    "FormatOutput",
    "FormatTransformation",
    # Citation schemas
    "CitationInput",
    "CitationOutput",
    "Citation",
    "Source",
    # Narrative Constructor
    "NarrativeStorylineConstructorRunner",
    "NarrativeConstructorInput",
    "NarrativeConstructorOutput",
    "NarrativeElement",
    # Protocol Developer
    "ProtocolDeveloperRunner",
    "ProtocolDeveloperInput",
    "ProtocolDeveloperOutput",
    "ProtocolSection",
]
