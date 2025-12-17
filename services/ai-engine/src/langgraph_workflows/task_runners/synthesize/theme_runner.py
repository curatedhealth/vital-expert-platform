"""
ThemeRunner - Extract themes using topic modeling.

Algorithmic Core: Topic Modeling / Theme Extraction
- Identifies recurring themes across content
- Builds theme hierarchy
- Quantifies theme strength

Use Cases:
- Literature analysis
- Research synthesis
- Content categorization
- Pattern identification
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

class ThemeInput(TaskRunnerInput):
    """Input schema for ThemeRunner."""

    content_set: List[Dict[str, Any]] = Field(
        ...,
        description="Content items to analyze [{item_id, content, source}]"
    )
    theme_depth: str = Field(
        default="standard",
        description="Depth: shallow | standard | deep"
    )
    min_theme_strength: float = Field(
        default=0.3,
        description="Minimum strength to include theme (0-1)"
    )
    max_themes: int = Field(
        default=10,
        description="Maximum themes to extract"
    )
    hierarchical: bool = Field(
        default=True,
        description="Whether to build theme hierarchy"
    )


class Theme(TaskRunnerOutput):
    """An extracted theme."""

    theme_id: str = Field(default="", description="Theme ID")
    theme_name: str = Field(default="", description="Theme name")
    theme_description: str = Field(default="", description="Theme description")
    parent_theme_id: Optional[str] = Field(default=None, description="Parent if sub-theme")
    strength: float = Field(default=0.0, description="Theme strength 0-1")
    frequency: int = Field(default=0, description="Occurrences across content")
    supporting_items: List[str] = Field(
        default_factory=list,
        description="Item IDs that support this theme"
    )
    key_phrases: List[str] = Field(
        default_factory=list,
        description="Key phrases for this theme"
    )
    sentiment: str = Field(
        default="neutral",
        description="positive | neutral | negative | mixed"
    )


class ThemeOutput(TaskRunnerOutput):
    """Output schema for ThemeRunner."""

    themes: List[Theme] = Field(
        default_factory=list,
        description="All extracted themes"
    )
    primary_themes: List[Theme] = Field(
        default_factory=list,
        description="Top-level themes"
    )
    sub_themes: List[Theme] = Field(
        default_factory=list,
        description="Child themes"
    )
    theme_hierarchy: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Theme tree {parent_id: [child_ids]}"
    )
    theme_coverage: float = Field(
        default=0.0,
        description="How much content is covered by themes 0-100"
    )
    uncategorized_items: List[str] = Field(
        default_factory=list,
        description="Items not matching any theme"
    )
    theme_summary: str = Field(default="", description="Executive summary")
    dominant_theme: Optional[str] = Field(
        default=None,
        description="Most prominent theme ID"
    )
    theme_relationships: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Relationships between themes"
    )


# =============================================================================
# ThemeRunner Implementation
# =============================================================================

@register_task_runner
class ThemeRunner(TaskRunner[ThemeInput, ThemeOutput]):
    """
    Topic modeling theme extraction runner.

    This runner identifies and organizes recurring themes
    across a content set.

    Algorithmic Pattern:
        1. Parse content set
        2. Identify recurring concepts/topics
        3. Cluster into themes
        4. Build hierarchy if enabled
        5. Calculate theme strength
        6. Map content to themes

    Best Used For:
        - Research synthesis
        - Content analysis
        - Pattern recognition
        - Literature review
    """

    runner_id = "theme"
    name = "Theme Runner"
    description = "Extract themes using topic modeling"
    category = TaskRunnerCategory.SYNTHESIZE
    algorithmic_core = "topic_modeling"
    max_duration_seconds = 150

    InputType = ThemeInput
    OutputType = ThemeOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ThemeRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=4000,
        )

    async def execute(self, input: ThemeInput) -> ThemeOutput:
        """
        Execute theme extraction.

        Args:
            input: Theme extraction parameters

        Returns:
            ThemeOutput with theme hierarchy
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            content_text = json.dumps(input.content_set, indent=2, default=str)[:4000]

            depth_instruction = self._get_depth_instruction(input.theme_depth)

            system_prompt = f"""You are an expert at extracting themes using topic modeling.

Your task is to identify and organize recurring themes across content.

Theme depth: {input.theme_depth}
{depth_instruction}
Maximum themes: {input.max_themes}
Minimum strength: {input.min_theme_strength}
Hierarchical: {input.hierarchical}

Topic modeling approach:
1. Read through all content
2. Identify recurring:
   - Concepts
   - Topics
   - Patterns
   - Ideas
3. Cluster into themes
4. For each theme:
   - Name it concisely
   - Describe it
   - Calculate strength (frequency × importance)
   - Identify supporting content
   - Extract key phrases
   - Assess sentiment
5. If hierarchical:
   - Identify parent-child relationships
   - Build theme tree
6. Find relationships between themes

Return a structured JSON response with:
- themes: Array with:
  - theme_id: T1, T2, etc.
  - theme_name: Short name
  - theme_description: Description
  - parent_theme_id: Parent ID if sub-theme
  - strength: 0-1
  - frequency: Occurrence count
  - supporting_items: List of item IDs
  - key_phrases: Key phrases
  - sentiment: positive | neutral | negative | mixed
- theme_hierarchy: {{parent_id: [child_ids]}}
- theme_coverage: 0-100
- uncategorized_items: Items not matching themes
- theme_summary: 2-3 sentence summary
- dominant_theme: Strongest theme ID
- theme_relationships: [{{from: T1, to: T2, relationship: "related"}}]"""

            user_prompt = f"""Extract themes from this content set:

CONTENT SET:
{content_text}

Extract themes and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_theme_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build themes
            themes_data = result.get("themes", [])
            themes = [
                Theme(
                    theme_id=t.get("theme_id", f"T{idx+1}"),
                    theme_name=t.get("theme_name", ""),
                    theme_description=t.get("theme_description", ""),
                    parent_theme_id=t.get("parent_theme_id"),
                    strength=float(t.get("strength", 0.5)),
                    frequency=int(t.get("frequency", 1)),
                    supporting_items=t.get("supporting_items", []),
                    key_phrases=t.get("key_phrases", []),
                    sentiment=t.get("sentiment", "neutral"),
                )
                for idx, t in enumerate(themes_data)
            ]

            # Filter by minimum strength
            themes = [t for t in themes if t.strength >= input.min_theme_strength]

            # Separate primary and sub-themes
            primary = [t for t in themes if t.parent_theme_id is None]
            sub = [t for t in themes if t.parent_theme_id is not None]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ThemeOutput(
                success=True,
                themes=themes,
                primary_themes=primary,
                sub_themes=sub,
                theme_hierarchy=result.get("theme_hierarchy", {}),
                theme_coverage=float(result.get("theme_coverage", 80)),
                uncategorized_items=result.get("uncategorized_items", []),
                theme_summary=result.get("theme_summary", ""),
                dominant_theme=result.get("dominant_theme"),
                theme_relationships=result.get("theme_relationships", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ThemeRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ThemeOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_depth_instruction(self, depth: str) -> str:
        """Get depth instruction."""
        instructions = {
            "shallow": "Shallow: Identify only major themes. 3-5 themes max.",
            "standard": "Standard: Comprehensive theme extraction with sub-themes.",
            "deep": "Deep: Exhaustive analysis with fine-grained sub-themes.",
        }
        return instructions.get(depth, instructions["standard"])

    def _parse_theme_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "themes": [],
                "theme_hierarchy": {},
                "theme_coverage": 0,
                "uncategorized_items": [],
                "theme_summary": content[:200],
                "dominant_theme": None,
                "theme_relationships": [],
            }
