"""
CollectRunner - Gather sources using aggregation.

Algorithmic Core: Source Aggregation
- Collects content from multiple sources
- Deduplicates and organizes
- Assesses source quality and coverage

Use Cases:
- Research aggregation
- Multi-source data collection
- Literature gathering
- Evidence compilation
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

class SourceItem(TaskRunnerOutput):
    """A source to collect from."""

    source_id: str = Field(default="", description="Source identifier")
    source_type: str = Field(
        default="document",
        description="document | url | database | api | file"
    )
    source_location: str = Field(default="", description="Where to find it")
    content: Optional[str] = Field(default=None, description="Pre-loaded content if available")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Source metadata")


class CollectInput(TaskRunnerInput):
    """Input schema for CollectRunner."""

    sources: List[Dict[str, Any]] = Field(
        ...,
        description="Sources to collect [{source_id, source_type, source_location, content}]"
    )
    collection_goal: str = Field(
        default="comprehensive",
        description="Goal: comprehensive | key_points | specific_topic"
    )
    topic_focus: Optional[str] = Field(
        default=None,
        description="Specific topic to focus on"
    )
    deduplication: bool = Field(
        default=True,
        description="Whether to deduplicate content"
    )
    quality_filter: str = Field(
        default="standard",
        description="Filter: none | standard | strict"
    )


class CollectedItem(TaskRunnerOutput):
    """A collected and processed item."""

    item_id: str = Field(default="", description="Item ID")
    source_id: str = Field(default="", description="Original source")
    content: str = Field(default="", description="Collected content")
    content_type: str = Field(
        default="text",
        description="text | data | quote | fact | insight"
    )
    relevance_score: float = Field(default=0.0, description="Relevance to goal 0-1")
    quality_score: float = Field(default=0.0, description="Content quality 0-1")
    is_duplicate: bool = Field(default=False, description="Duplicate of another item")
    duplicate_of: Optional[str] = Field(default=None, description="ID of original if duplicate")
    key_points: List[str] = Field(default_factory=list, description="Key points extracted")


class CollectOutput(TaskRunnerOutput):
    """Output schema for CollectRunner."""

    collected_items: List[CollectedItem] = Field(
        default_factory=list,
        description="All collected items"
    )
    unique_items: List[CollectedItem] = Field(
        default_factory=list,
        description="Deduplicated items"
    )
    sources_processed: int = Field(default=0, description="Sources processed")
    items_collected: int = Field(default=0, description="Total items collected")
    duplicates_found: int = Field(default=0, description="Duplicates identified")
    coverage_assessment: str = Field(
        default="",
        description="Assessment of topic coverage"
    )
    coverage_score: float = Field(default=0.0, description="Coverage score 0-100")
    gaps_identified: List[str] = Field(
        default_factory=list,
        description="Gaps in coverage"
    )
    collection_summary: str = Field(default="", description="Executive summary")
    quality_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        description="Items by quality tier {high, medium, low}"
    )


# =============================================================================
# CollectRunner Implementation
# =============================================================================

@register_task_runner
class CollectRunner(TaskRunner[CollectInput, CollectOutput]):
    """
    Source aggregation collection runner.

    This runner gathers and organizes content from multiple
    sources for synthesis.

    Algorithmic Pattern:
        1. Parse source list
        2. For each source:
           - Extract relevant content
           - Assess quality
           - Rate relevance
        3. Deduplicate if enabled
        4. Assess coverage
        5. Identify gaps

    Best Used For:
        - Research compilation
        - Evidence gathering
        - Literature review
        - Data aggregation
    """

    runner_id = "collect"
    name = "Collect Runner"
    description = "Gather sources using aggregation"
    category = TaskRunnerCategory.SYNTHESIZE
    algorithmic_core = "aggregation"
    max_duration_seconds = 120

    InputType = CollectInput
    OutputType = CollectOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize CollectRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.2,
            max_tokens=4000,
        )

    async def execute(self, input: CollectInput) -> CollectOutput:
        """
        Execute source collection.

        Args:
            input: Collection parameters

        Returns:
            CollectOutput with collected items
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            import json
            sources_text = json.dumps(input.sources, indent=2, default=str)[:3500]

            topic_text = ""
            if input.topic_focus:
                topic_text = f"\nTopic focus: {input.topic_focus}"

            filter_instruction = self._get_filter_instruction(input.quality_filter)

            system_prompt = f"""You are an expert at collecting and aggregating information from sources.

Your task is to gather, organize, and assess content from multiple sources.

Collection goal: {input.collection_goal}
Deduplication: {input.deduplication}
{filter_instruction}

Aggregation approach:
1. For each source:
   - Extract relevant content
   - Identify content type (text, data, quote, fact, insight)
   - Assess quality (0-1)
   - Rate relevance to goal (0-1)
   - Extract key points
2. If deduplication enabled:
   - Identify duplicate/overlapping content
   - Mark duplicates, keep best version
3. Assess coverage:
   - How well do sources cover the topic?
   - What gaps exist?
4. Quality breakdown:
   - high: quality >= 0.8
   - medium: quality 0.5-0.8
   - low: quality < 0.5

Return a structured JSON response with:
- collected_items: Array with:
  - item_id: I1, I2, etc.
  - source_id: Original source
  - content: The collected content
  - content_type: text | data | quote | fact | insight
  - relevance_score: 0-1
  - quality_score: 0-1
  - is_duplicate: boolean
  - duplicate_of: Original item ID if duplicate
  - key_points: Key points extracted
- sources_processed: Total sources
- items_collected: Total items
- duplicates_found: Count
- coverage_assessment: Assessment text
- coverage_score: 0-100
- gaps_identified: What's missing
- collection_summary: 2-3 sentence summary
- quality_breakdown: {{high: X, medium: Y, low: Z}}"""

            user_prompt = f"""Collect content from these sources:

SOURCES:
{sources_text}
{topic_text}

Collect and organize, return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_collect_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build collected items
            items_data = result.get("collected_items", [])
            items = [
                CollectedItem(
                    item_id=i.get("item_id", f"I{idx+1}"),
                    source_id=i.get("source_id", ""),
                    content=i.get("content", ""),
                    content_type=i.get("content_type", "text"),
                    relevance_score=float(i.get("relevance_score", 0.7)),
                    quality_score=float(i.get("quality_score", 0.7)),
                    is_duplicate=i.get("is_duplicate", False),
                    duplicate_of=i.get("duplicate_of"),
                    key_points=i.get("key_points", []),
                )
                for idx, i in enumerate(items_data)
            ]

            # Filter unique items
            unique = [i for i in items if not i.is_duplicate]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return CollectOutput(
                success=True,
                collected_items=items,
                unique_items=unique,
                sources_processed=result.get("sources_processed", len(input.sources)),
                items_collected=len(items),
                duplicates_found=result.get("duplicates_found", 0),
                coverage_assessment=result.get("coverage_assessment", ""),
                coverage_score=float(result.get("coverage_score", 70)),
                gaps_identified=result.get("gaps_identified", []),
                collection_summary=result.get("collection_summary", ""),
                quality_breakdown=result.get("quality_breakdown", {}),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"CollectRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return CollectOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _get_filter_instruction(self, quality_filter: str) -> str:
        """Get filter instruction."""
        instructions = {
            "none": "Quality filter: Include all content regardless of quality.",
            "standard": "Quality filter: Exclude clearly low-quality content.",
            "strict": "Quality filter: Only include high-quality, verified content.",
        }
        return instructions.get(quality_filter, instructions["standard"])

    def _parse_collect_response(self, content: str) -> Dict[str, Any]:
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
                "collected_items": [],
                "sources_processed": 0,
                "items_collected": 0,
                "duplicates_found": 0,
                "coverage_assessment": content[:200],
                "coverage_score": 0,
                "gaps_identified": [],
                "collection_summary": "",
                "quality_breakdown": {},
            }
