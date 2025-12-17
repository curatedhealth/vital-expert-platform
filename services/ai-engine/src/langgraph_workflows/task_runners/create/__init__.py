"""
CREATE Category - Generation Runners

This category contains atomic cognitive operations for drafting content,
expanding sections, applying formatting, and adding citations.

Runners (11 total):
    - DraftRunner: Generate draft (template expansion)
    - ExpandRunner: Expand section (recursive elaboration)
    - FormatRunner: Apply formatting (style transformation)
    - CitationRunner: Add citations (source linking)
    - NarrativeStorylineConstructorRunner: Construct narrative storylines
    - ProtocolDeveloperRunner: Develop study protocols
    - SolutionIdeatorRunner: Generate solution ideas (divergent ideation)
    - PrototypeDeveloperRunner: Develop prototype specifications
    - ImprovementIdeatorRunner: Generate improvement ideas
    - ConceptGeneratorRunner: Generate service/product concepts
    - BusinessCaseDeveloperRunner: Develop business cases

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
from .solution_ideator_runner import (
    SolutionIdeatorRunner,
    SolutionIdeatorInput,
    SolutionIdeatorOutput,
    SolutionIdea,
)
from .prototype_developer_runner import (
    PrototypeDeveloperRunner,
    PrototypeDeveloperInput,
    PrototypeDeveloperOutput,
    PrototypeSpec,
    PrototypeComponent,
)
from .improvement_ideator_runner import (
    ImprovementIdeatorRunner,
    ImprovementIdeatorInput,
    ImprovementIdeatorOutput,
    ImprovementIdea,
)
from .concept_generator_runner import (
    ConceptGeneratorRunner,
    ConceptGeneratorInput,
    ConceptGeneratorOutput,
    ServiceConcept,
)
from .business_case_developer_runner import (
    BusinessCaseDeveloperRunner,
    BusinessCaseDeveloperInput,
    BusinessCaseDeveloperOutput,
    BusinessCase,
    FinancialProjection,
    RiskAssessment,
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
    # Solution Ideator
    "SolutionIdeatorRunner",
    "SolutionIdeatorInput",
    "SolutionIdeatorOutput",
    "SolutionIdea",
    # Prototype Developer
    "PrototypeDeveloperRunner",
    "PrototypeDeveloperInput",
    "PrototypeDeveloperOutput",
    "PrototypeSpec",
    "PrototypeComponent",
    # Improvement Ideator
    "ImprovementIdeatorRunner",
    "ImprovementIdeatorInput",
    "ImprovementIdeatorOutput",
    "ImprovementIdea",
    # Concept Generator
    "ConceptGeneratorRunner",
    "ConceptGeneratorInput",
    "ConceptGeneratorOutput",
    "ServiceConcept",
    # Business Case Developer
    "BusinessCaseDeveloperRunner",
    "BusinessCaseDeveloperInput",
    "BusinessCaseDeveloperOutput",
    "BusinessCase",
    "FinancialProjection",
    "RiskAssessment",
]
