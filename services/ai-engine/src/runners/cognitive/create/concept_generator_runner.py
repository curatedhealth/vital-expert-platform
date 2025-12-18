"""
ConceptGeneratorRunner - Generate service/product concepts

This runner generates new service or product concepts from
identified opportunities, synthesized insights, or strategic goals.

Algorithmic Core: concept_synthesis
Temperature: 0.7 (creative concept generation)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class ServiceConcept(BaseModel):
    """Individual service/product concept."""
    concept_id: str = Field(..., description="Unique identifier")
    concept_name: str = Field(..., description="Concept name")
    tagline: str = Field(..., description="One-line description")
    description: str = Field(..., description="Full description")
    concept_type: Literal[
        "service", "product", "platform", "experience", "hybrid"
    ] = Field(..., description="Type of concept")
    target_segment: str = Field(..., description="Primary target audience")
    value_proposition: str = Field(..., description="Core value delivered")
    key_features: List[str] = Field(
        default_factory=list, description="Main features"
    )
    differentiators: List[str] = Field(
        default_factory=list, description="What makes it unique"
    )
    revenue_model: str = Field(..., description="How it generates revenue")
    delivery_model: str = Field(..., description="How it's delivered")
    required_capabilities: List[str] = Field(
        default_factory=list, description="Capabilities needed"
    )
    strategic_fit: Literal["low", "medium", "high"] = Field(
        "medium", description="Fit with strategy"
    )
    market_potential: Literal["niche", "growing", "large", "massive"] = Field(
        "growing", description="Market size potential"
    )


class ConceptGeneratorInput(BaseModel):
    """Input for concept generation."""
    opportunity_space: str = Field(..., description="Opportunity to address")
    insights: Optional[List[str]] = Field(
        None, description="Key insights informing concepts"
    )
    strategic_goals: Optional[List[str]] = Field(
        None, description="Strategic goals to align with"
    )
    target_segments: Optional[List[str]] = Field(
        None, description="Target segments to serve"
    )
    existing_capabilities: Optional[List[str]] = Field(
        None, description="Existing capabilities to leverage"
    )
    constraints: Optional[List[str]] = Field(
        None, description="Constraints on concepts"
    )
    num_concepts: int = Field(default=4, ge=2, le=8, description="Number of concepts")


class ConceptGeneratorOutput(BaseModel):
    """Output from concept generation."""
    concepts: List[ServiceConcept] = Field(
        default_factory=list, description="Generated concepts"
    )
    concept_comparison: Dict[str, Dict[str, str]] = Field(
        default_factory=dict, description="Concept ID -> attribute -> value"
    )
    recommended_concept: str = Field(
        ..., description="Recommended concept ID"
    )
    recommendation_rationale: str = Field(
        ..., description="Why this concept is recommended"
    )
    portfolio_view: str = Field(
        ..., description="How concepts relate to each other"
    )
    next_steps_by_concept: Dict[str, List[str]] = Field(
        default_factory=dict, description="Concept ID -> next steps"
    )


@register_task_runner("concept_generator", TaskRunnerCategory.CREATE)
class ConceptGeneratorRunner(TaskRunner[ConceptGeneratorInput, ConceptGeneratorOutput]):
    """
    Generates service/product concepts from opportunities.

    Creates diverse, well-defined concepts that address identified
    opportunities and align with strategic goals.

    Algorithmic approach:
    1. Analyze opportunity space
    2. Synthesize insights
    3. Generate diverse concepts
    4. Define value propositions
    5. Evaluate strategic fit
    6. Recommend lead concept
    """

    name = "concept_generator"
    description = "Generate service/product concepts from opportunities"
    algorithmic_core = "concept_synthesis"
    category = TaskRunnerCategory.CREATE
    temperature = 0.7
    max_tokens = 4000

    async def execute(self, input_data: ConceptGeneratorInput) -> ConceptGeneratorOutput:
        """Execute concept generation."""
        prompt = f"""Generate {input_data.num_concepts} service/product concepts for the following opportunity.

OPPORTUNITY SPACE: {input_data.opportunity_space}

KEY INSIGHTS:
{chr(10).join(input_data.insights or ['Not specified'])}

STRATEGIC GOALS:
{chr(10).join(input_data.strategic_goals or ['Not specified'])}

TARGET SEGMENTS: {', '.join(input_data.target_segments or ['Not specified'])}

EXISTING CAPABILITIES:
{chr(10).join(input_data.existing_capabilities or ['Not specified'])}

CONSTRAINTS:
{chr(10).join(input_data.constraints or ['None specified'])}

Generate diverse concepts across different approaches. For each concept:

1. Name and tagline
2. Full description
3. Concept type (service/product/platform/experience/hybrid)
4. Target segment
5. Value proposition
6. Key features (3-5)
7. Differentiators (what makes it unique)
8. Revenue model
9. Delivery model
10. Required capabilities
11. Strategic fit (low/medium/high)
12. Market potential (niche/growing/large/massive)

Then provide:
- Concept comparison table
- Recommended concept with rationale
- Portfolio view (how concepts relate)
- Next steps for each concept

Return as JSON matching the ConceptGeneratorOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, ConceptGeneratorOutput)
