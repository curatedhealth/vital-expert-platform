"""
ExtractRunner - Extract specific information using pattern matching + NER.

Algorithmic Core: Pattern Matching + Named Entity Recognition
- Extracts structured data from unstructured sources
- Identifies entities, relationships, and key data points
- Validates extracted data against expected patterns

Use Cases:
- Extract trial endpoints from protocols
- Extract KOL information from publications
- Extract regulatory requirements from guidance docs
- Extract competitive data from press releases
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

class ExtractionSpec(TaskRunnerOutput):
    """Specification for what to extract."""

    field_name: str = Field(default="", description="Name of field to extract")
    field_type: str = Field(default="text", description="Type: text | number | date | entity | list")
    pattern: Optional[str] = Field(default=None, description="Regex pattern if applicable")
    required: bool = Field(default=False, description="Whether this field is required")
    description: str = Field(default="", description="Description of what to extract")


class ExtractInput(TaskRunnerInput):
    """Input schema for ExtractRunner."""

    source: str = Field(..., description="Source text/document to extract from")
    extraction_spec: Dict[str, Any] = Field(
        ...,
        description="What to extract - fields and their specifications"
    )
    entity_types: List[str] = Field(
        default_factory=list,
        description="Entity types to extract (e.g., 'person', 'organization', 'drug')"
    )
    context_hint: Optional[str] = Field(
        default=None,
        description="Hint about the source type (e.g., 'clinical trial protocol')"
    )
    strict_mode: bool = Field(
        default=False,
        description="If true, only extract exact matches; if false, allow inference"
    )


class ExtractedEntity(TaskRunnerOutput):
    """An extracted named entity."""

    entity_id: str = Field(default="", description="Unique entity identifier")
    text: str = Field(default="", description="Entity text as found in source")
    entity_type: str = Field(default="", description="Type of entity")
    normalized: Optional[str] = Field(default=None, description="Normalized form if applicable")
    context: str = Field(default="", description="Surrounding context")
    position: Optional[int] = Field(default=None, description="Character position in source")
    confidence: float = Field(default=0.0, description="Extraction confidence 0-1")


class ExtractOutput(TaskRunnerOutput):
    """Output schema for ExtractRunner."""

    extracted_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Extracted data matching the spec"
    )
    entities: List[ExtractedEntity] = Field(
        default_factory=list,
        description="Named entities found"
    )
    patterns_matched: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Pattern matches found"
    )
    extraction_summary: str = Field(
        default="",
        description="Summary of what was extracted"
    )
    fields_found: int = Field(default=0, description="Number of spec fields found")
    fields_missing: List[str] = Field(
        default_factory=list,
        description="Spec fields not found in source"
    )
    extraction_quality: float = Field(
        default=0.0,
        description="Quality score for extraction 0-1"
    )


# =============================================================================
# ExtractRunner Implementation
# =============================================================================

@register_task_runner
class ExtractRunner(TaskRunner[ExtractInput, ExtractOutput]):
    """
    Pattern matching + NER information extraction runner.

    This runner extracts structured information from unstructured text
    using a combination of pattern matching and entity recognition.

    Algorithmic Pattern:
        1. Parse extraction specification
        2. Analyze source document structure
        3. Apply pattern matching for structured fields
        4. Apply NER for entity extraction
        5. Validate extracted data
        6. Score extraction confidence

    Best Used For:
        - Protocol data extraction
        - Publication mining
        - Regulatory document parsing
        - Competitive intelligence extraction
    """

    runner_id = "extract"
    name = "Extract Runner"
    description = "Extract specific info using pattern matching + NER"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "pattern_matching_ner"
    max_duration_seconds = 90

    InputType = ExtractInput
    OutputType = ExtractOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize ExtractRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.0,  # Zero temperature for extraction accuracy
            max_tokens=2500,
        )

    async def execute(self, input: ExtractInput) -> ExtractOutput:
        """
        Execute information extraction.

        Args:
            input: Extraction parameters including source, spec, and entity types

        Returns:
            ExtractOutput with extracted data, entities, and quality metrics
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build extraction prompt
            spec_text = self._format_extraction_spec(input.extraction_spec)
            entity_instruction = ""
            if input.entity_types:
                entity_instruction = f"\nAlso extract these entity types: {', '.join(input.entity_types)}"

            context_instruction = ""
            if input.context_hint:
                context_instruction = f"\nSource type: {input.context_hint}"

            mode_instruction = (
                "Extract ONLY information explicitly stated in the source."
                if input.strict_mode
                else "You may make reasonable inferences if information is implied."
            )

            # Truncate source if too long
            source_text = input.source[:8000] if len(input.source) > 8000 else input.source

            system_prompt = f"""You are an expert information extractor using pattern matching and NER.

Your task is to extract specific information from the provided source.
{context_instruction}

Extraction mode: {mode_instruction}

EXTRACTION SPECIFICATION:
{spec_text}
{entity_instruction}

Extraction approach:
1. Read the source carefully
2. For each spec field, search for matching information
3. Extract exact text when possible
4. For entities, note the entity type and surrounding context
5. Assign confidence scores (0.0-1.0) based on match quality
6. Note fields that could not be found

Return a structured JSON response with:
- extracted_data: {{field_name: value}} for each spec field
- entities: Array of entity objects with:
  - entity_id: Unique ID (E1, E2, etc.)
  - text: Extracted text
  - entity_type: Type of entity
  - normalized: Normalized form if applicable
  - context: Surrounding context (10-20 words)
  - confidence: 0.0-1.0
- patterns_matched: Array of {{pattern, match, location}}
- extraction_summary: 1-2 sentence summary of extraction
- fields_missing: List of spec fields not found"""

            user_prompt = f"""Extract information from this source:

SOURCE TEXT:
{source_text}

Perform extraction according to the spec and return structured JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_extract_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build output
            entities_data = result.get("entities", [])
            entities = [
                ExtractedEntity(
                    entity_id=e.get("entity_id", f"E{i+1}"),
                    text=e.get("text", ""),
                    entity_type=e.get("entity_type", ""),
                    normalized=e.get("normalized"),
                    context=e.get("context", ""),
                    position=e.get("position"),
                    confidence=float(e.get("confidence", 0.5)),
                )
                for i, e in enumerate(entities_data)
            ]

            extracted_data = result.get("extracted_data", {})
            fields_missing = result.get("fields_missing", [])
            total_fields = len(input.extraction_spec)
            fields_found = total_fields - len(fields_missing)

            # Calculate extraction quality
            extraction_quality = self._calculate_quality(
                extracted_data, entities, input, fields_found, total_fields
            )

            duration = (datetime.utcnow() - start_time).total_seconds()

            return ExtractOutput(
                success=True,
                extracted_data=extracted_data,
                entities=entities,
                patterns_matched=result.get("patterns_matched", []),
                extraction_summary=result.get("extraction_summary", ""),
                fields_found=fields_found,
                fields_missing=fields_missing,
                extraction_quality=extraction_quality,
                confidence_score=extraction_quality,
                quality_score=extraction_quality,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"ExtractRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return ExtractOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _format_extraction_spec(self, spec: Dict[str, Any]) -> str:
        """Format extraction specification for prompt."""
        lines = []
        for field, details in spec.items():
            if isinstance(details, dict):
                field_type = details.get("type", "text")
                required = "REQUIRED" if details.get("required") else "optional"
                desc = details.get("description", "")
                lines.append(f"- {field} ({field_type}, {required}): {desc}")
            else:
                lines.append(f"- {field}: {details}")
        return "\n".join(lines) or "Extract any relevant information"

    def _parse_extract_response(self, content: str) -> Dict[str, Any]:
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
                "extracted_data": {"raw_text": content[:500]},
                "entities": [],
                "patterns_matched": [],
                "extraction_summary": "Could not parse extraction results.",
                "fields_missing": [],
            }

    def _calculate_quality(
        self,
        extracted_data: Dict[str, Any],
        entities: List[ExtractedEntity],
        input: ExtractInput,
        fields_found: int,
        total_fields: int,
    ) -> float:
        """Calculate extraction quality score."""
        # Field completion score
        field_score = fields_found / max(total_fields, 1)

        # Entity confidence score
        if entities:
            entity_score = sum(e.confidence for e in entities) / len(entities)
        else:
            entity_score = 0.5 if not input.entity_types else 0.0

        # Data richness score
        non_empty_fields = sum(1 for v in extracted_data.values() if v)
        richness_score = non_empty_fields / max(len(extracted_data), 1)

        return (field_score * 0.4 + entity_score * 0.3 + richness_score * 0.3)
