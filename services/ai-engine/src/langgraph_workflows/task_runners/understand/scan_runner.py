"""
ScanRunner - Broad landscape scan using breadth-first exploration.

Algorithmic Core: Breadth-First Exploration
- Starts with topic, expands horizontally to discover related themes
- Identifies key actors, trends, and sub-domains
- Creates hierarchical topic map with weighted relevance

Use Cases:
- Market landscape scanning
- Competitive intelligence gathering
- Therapeutic area overview
- Stakeholder ecosystem mapping
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

class ScanInput(TaskRunnerInput):
    """Input schema for ScanRunner."""

    topic: str = Field(..., description="Topic to scan")
    scope: str = Field(
        default="broad",
        description="Scope: narrow | broad | comprehensive"
    )
    max_themes: int = Field(default=10, description="Maximum themes to identify")
    focus_areas: List[str] = Field(
        default_factory=list,
        description="Optional focus areas to prioritize"
    )
    exclude_areas: List[str] = Field(
        default_factory=list,
        description="Areas to exclude from scan"
    )
    depth_limit: int = Field(
        default=2,
        description="How many levels deep to explore (1-3)"
    )


class ThemeInfo(TaskRunnerOutput):
    """Information about a discovered theme."""

    theme_id: str = Field(default="", description="Unique theme identifier")
    name: str = Field(default="", description="Theme name")
    description: str = Field(default="", description="Brief description")
    relevance_score: float = Field(default=0.0, description="Relevance to topic 0-1")
    sub_themes: List[str] = Field(default_factory=list, description="Child themes")
    key_entities: List[str] = Field(default_factory=list, description="Key actors/entities")
    trends: List[str] = Field(default_factory=list, description="Notable trends")


class ScanOutput(TaskRunnerOutput):
    """Output schema for ScanRunner."""

    topic_map: Dict[str, Any] = Field(
        default_factory=dict,
        description="Hierarchical topic map"
    )
    key_themes: List[ThemeInfo] = Field(
        default_factory=list,
        description="Key themes identified"
    )
    theme_names: List[str] = Field(
        default_factory=list,
        description="Simple list of theme names"
    )
    sources_scanned: int = Field(default=0, description="Number of conceptual sources")
    coverage_breadth: float = Field(default=0.0, description="Breadth coverage score 0-1")
    scan_depth_achieved: int = Field(default=0, description="Actual depth explored")
    gaps_identified: List[str] = Field(
        default_factory=list,
        description="Areas needing deeper exploration"
    )


# =============================================================================
# ScanRunner Implementation
# =============================================================================

@register_task_runner
class ScanRunner(TaskRunner[ScanInput, ScanOutput]):
    """
    Breadth-first landscape exploration runner.

    This runner performs horizontal scanning to discover the landscape
    of a topic, identifying key themes, actors, and relationships.

    Algorithmic Pattern:
        1. Parse topic and identify core concepts
        2. Expand breadth-first to related domains
        3. For each domain, identify key themes
        4. Score themes by relevance
        5. Build hierarchical topic map
        6. Identify gaps for deeper exploration

    Best Used For:
        - Initial landscape assessment
        - Competitive intelligence scoping
        - Market overview
        - Stakeholder mapping
    """

    runner_id = "scan"
    name = "Scan Runner"
    description = "Broad landscape scan using breadth-first exploration"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "breadth_first_exploration"
    max_duration_seconds = 120

    InputType = ScanInput
    OutputType = ScanOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ScanRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=2500,
        )

    async def execute(self, input: ScanInput) -> ScanOutput:
        """
        Execute breadth-first landscape scan.

        Args:
            input: Scan parameters including topic, scope, and constraints

        Returns:
            ScanOutput with topic map, themes, and coverage metrics
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build scope-aware prompt
            scope_instruction = self._get_scope_instruction(input.scope)
            focus_instruction = ""
            if input.focus_areas:
                focus_instruction = f"\nPrioritize these areas: {', '.join(input.focus_areas)}"
            exclude_instruction = ""
            if input.exclude_areas:
                exclude_instruction = f"\nExclude these areas: {', '.join(input.exclude_areas)}"

            system_prompt = f"""You are an expert landscape analyst performing breadth-first exploration.

Your task is to scan a topic and identify its key themes, actors, and structure.

{scope_instruction}

Analysis approach:
1. Identify the core concept and its boundaries
2. Expand horizontally to discover related domains
3. For each domain, identify 2-3 key themes
4. Note key entities (companies, people, technologies)
5. Identify emerging trends
6. Flag areas that need deeper exploration

Return a structured JSON response with:
- topic_map: Hierarchical structure {{topic: {{subtopic: [themes]}}}}
- themes: Array of theme objects with:
  - theme_id: Unique ID (T1, T2, etc.)
  - name: Theme name
  - description: Brief description (1-2 sentences)
  - relevance_score: 0.0-1.0 relevance to main topic
  - sub_themes: List of sub-theme names
  - key_entities: Key actors/companies/technologies
  - trends: Notable trends
- gaps: Areas needing deeper exploration"""

            user_prompt = f"""Scan this topic: {input.topic}

Maximum themes to identify: {input.max_themes}
Depth limit: {input.depth_limit} levels
{focus_instruction}
{exclude_instruction}

Perform a comprehensive breadth-first scan and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_scan_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build output
            themes = result.get("themes", [])
            theme_infos = [
                ThemeInfo(
                    theme_id=t.get("theme_id", f"T{i+1}"),
                    name=t.get("name", ""),
                    description=t.get("description", ""),
                    relevance_score=float(t.get("relevance_score", 0.5)),
                    sub_themes=t.get("sub_themes", []),
                    key_entities=t.get("key_entities", []),
                    trends=t.get("trends", []),
                )
                for i, t in enumerate(themes[:input.max_themes])
            ]

            # Calculate coverage metrics
            coverage_breadth = self._calculate_coverage(theme_infos, input)

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ScanOutput(
                success=True,
                topic_map=result.get("topic_map", {input.topic: {}}),
                key_themes=theme_infos,
                theme_names=[t.name for t in theme_infos],
                sources_scanned=len(themes) * 3,  # Conceptual sources per theme
                coverage_breadth=coverage_breadth,
                scan_depth_achieved=min(input.depth_limit, 2),
                gaps_identified=result.get("gaps", []),
                confidence_score=coverage_breadth,
                quality_score=coverage_breadth,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ScanRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ScanOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_scope_instruction(self, scope: str) -> str:
        """Get scope-specific instructions."""
        scope_map = {
            "narrow": "Focus on core, directly related themes only. Limit to 3-5 themes.",
            "broad": "Include adjacent domains and emerging areas. Target 6-10 themes.",
            "comprehensive": "Cover all related domains including peripheral areas. Target 10-15 themes.",
        }
        return scope_map.get(scope, scope_map["broad"])

    def _parse_scan_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            # Extract JSON from markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            # Fallback: create basic structure from text
            return {
                "topic_map": {},
                "themes": [{"name": content[:100], "description": content[:200]}],
                "gaps": [],
            }

    def _calculate_coverage(self, themes: List[ThemeInfo], input: ScanInput) -> float:
        """Calculate coverage breadth score."""
        if not themes:
            return 0.0

        # Factors: theme count, relevance distribution, sub-theme coverage
        theme_count_score = min(len(themes) / input.max_themes, 1.0)
        avg_relevance = sum(t.relevance_score for t in themes) / len(themes)
        has_sub_themes = sum(1 for t in themes if t.sub_themes) / len(themes)

        return (theme_count_score * 0.4 + avg_relevance * 0.4 + has_sub_themes * 0.2)
