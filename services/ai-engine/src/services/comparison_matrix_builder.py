"""
Comparison Matrix Builder for Ask Panel

Builds structured comparison matrices showing expert responses
across different aspects/dimensions of the question.

Supports three view modes:
1. Grid View - Aspects × Experts matrix
2. Table View - Tabular with sorting/filtering
3. Synthesis View - Aggregated recommendations

Based on ASK_PANEL_COMPLETE_GUIDE.md specifications.
"""

import asyncio
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone
import structlog

from services.llm_service import LLMService
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()


@dataclass
class ExpertPosition:
    """An expert's position on a specific aspect"""
    agent_id: str
    agent_name: str
    position: str  # "support", "oppose", "neutral", "qualified"
    summary: str
    confidence: float
    key_points: List[str] = field(default_factory=list)
    evidence_cited: List[str] = field(default_factory=list)


@dataclass
class AspectComparison:
    """Comparison across experts for a single aspect"""
    aspect_name: str
    aspect_description: str
    expert_positions: List[ExpertPosition]
    consensus_status: str  # "consensus", "majority", "divided", "no_consensus"
    consensus_score: float  # 0-1
    majority_position: Optional[str] = None
    key_disagreement: Optional[str] = None


@dataclass
class ComparisonMatrix:
    """Complete comparison matrix"""
    question: str
    aspects: List[AspectComparison]
    experts: List[Dict[str, str]]  # List of {id, name}
    overall_consensus: float
    consensus_areas: List[str]
    divergence_areas: List[str]
    synthesis: str
    generated_at: str
    metadata: Dict[str, Any] = field(default_factory=dict)


class ComparisonMatrixBuilder:
    """
    Builds comparison matrices for panel responses.

    Extracts key aspects from responses and maps each expert's
    position on each aspect to enable structured comparison.
    """

    def __init__(self, llm_service: LLMService):
        self.llm_service = llm_service
        self._llm_config = get_llm_config_for_level("L3")

    async def build_matrix(
        self,
        question: str,
        responses: List[Dict[str, Any]],
        predefined_aspects: Optional[List[str]] = None,
        max_aspects: int = 6
    ) -> ComparisonMatrix:
        """
        Build a comparison matrix from panel responses.

        Args:
            question: Original question posed to panel
            responses: List of expert response dictionaries
            predefined_aspects: Optional list of aspects to compare
            max_aspects: Maximum number of aspects to extract

        Returns:
            ComparisonMatrix with structured comparison data
        """
        if not responses:
            return self._empty_matrix(question)

        logger.info(
            "Building comparison matrix",
            question=question[:50],
            response_count=len(responses)
        )

        try:
            # Step 1: Extract or use predefined aspects
            if predefined_aspects:
                aspects = predefined_aspects[:max_aspects]
            else:
                aspects = await self._extract_aspects(question, responses, max_aspects)

            if not aspects:
                aspects = ["Overall Assessment"]

            # Step 2: Map each expert's position on each aspect
            aspect_comparisons = []
            for aspect in aspects:
                positions = await self._extract_positions_for_aspect(
                    aspect, question, responses
                )
                comparison = self._build_aspect_comparison(aspect, positions)
                aspect_comparisons.append(comparison)

            # Step 3: Calculate overall metrics
            overall_consensus = self._calculate_overall_consensus(aspect_comparisons)
            consensus_areas = [
                ac.aspect_name for ac in aspect_comparisons
                if ac.consensus_status in ["consensus", "majority"]
            ]
            divergence_areas = [
                ac.aspect_name for ac in aspect_comparisons
                if ac.consensus_status in ["divided", "no_consensus"]
            ]

            # Step 4: Generate synthesis
            synthesis = await self._generate_synthesis(
                question, aspect_comparisons, responses
            )

            # Build expert list
            experts = [
                {"id": r.get("agent_id", f"expert_{i}"), "name": r.get("agent_name", f"Expert {i+1}")}
                for i, r in enumerate(responses)
            ]

            matrix = ComparisonMatrix(
                question=question,
                aspects=aspect_comparisons,
                experts=experts,
                overall_consensus=overall_consensus,
                consensus_areas=consensus_areas,
                divergence_areas=divergence_areas,
                synthesis=synthesis,
                generated_at=datetime.now(timezone.utc).isoformat(),
                metadata={
                    "response_count": len(responses),
                    "aspect_count": len(aspect_comparisons),
                    "predefined_aspects": predefined_aspects is not None
                }
            )

            logger.info(
                "Comparison matrix built",
                aspects=len(aspect_comparisons),
                overall_consensus=overall_consensus
            )

            return matrix

        except Exception as e:
            logger.error(f"Failed to build comparison matrix: {e}")
            return self._empty_matrix(question)

    async def _extract_aspects(
        self,
        question: str,
        responses: List[Dict[str, Any]],
        max_aspects: int
    ) -> List[str]:
        """Extract key aspects/dimensions from responses"""
        combined_responses = "\n\n".join([
            f"**{r.get('agent_name', 'Expert')}**: {r.get('content', r.get('response', ''))[:400]}"
            for r in responses
        ])

        prompt = f"""Analyze these expert responses to identify key aspects for comparison.

Question: {question}

Responses:
{combined_responses}

Identify {max_aspects} distinct aspects/dimensions that experts discussed.
These should be specific topics where experts can be compared.

Good aspects: "Regulatory pathway", "Timeline estimate", "Risk assessment", "Cost considerations"
Bad aspects: "Overall opinion" (too vague), "Expert 1's view" (not comparative)

List exactly {max_aspects} aspects, one per line:
1."""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.3,
                max_tokens=300
            )

            aspects = []
            for line in result.split('\n'):
                # Remove numbering and clean up
                line = line.strip()
                if line:
                    # Remove leading numbers like "1.", "2.", etc.
                    import re
                    cleaned = re.sub(r'^\d+[\.\)]\s*', '', line).strip()
                    if cleaned and len(cleaned) > 3:
                        aspects.append(cleaned)

            return aspects[:max_aspects]

        except Exception as e:
            logger.warning(f"Aspect extraction failed: {e}")
            return ["Overall Assessment", "Key Recommendations", "Risk Factors"]

    async def _extract_positions_for_aspect(
        self,
        aspect: str,
        question: str,
        responses: List[Dict[str, Any]]
    ) -> List[ExpertPosition]:
        """Extract each expert's position on a specific aspect"""
        positions = []

        for response in responses:
            agent_id = response.get("agent_id", "unknown")
            agent_name = response.get("agent_name", "Expert")
            content = response.get("content", response.get("response", ""))

            position = await self._analyze_expert_position(
                aspect, content, agent_id, agent_name
            )
            positions.append(position)

        return positions

    async def _analyze_expert_position(
        self,
        aspect: str,
        response_content: str,
        agent_id: str,
        agent_name: str
    ) -> ExpertPosition:
        """Analyze an expert's position on a specific aspect"""
        prompt = f"""Analyze this expert's position on "{aspect}":

Response:
{response_content[:800]}

Provide:
1. POSITION: support, oppose, neutral, or qualified (supports with caveats)
2. SUMMARY: 1-2 sentence summary of their view on this aspect
3. KEY POINTS: 2-3 bullet points
4. CONFIDENCE: 0.0-1.0 how certain they seem

Format your response as:
POSITION: [position]
SUMMARY: [summary]
KEY POINTS:
- [point 1]
- [point 2]
CONFIDENCE: [0.0-1.0]"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.2,
                max_tokens=400
            )

            # Parse results
            import re

            position_match = re.search(r'POSITION:\s*(\w+)', result, re.IGNORECASE)
            position = position_match.group(1).lower() if position_match else "neutral"
            if position not in ["support", "oppose", "neutral", "qualified"]:
                position = "neutral"

            summary_match = re.search(r'SUMMARY:\s*(.+?)(?=KEY POINTS|CONFIDENCE|$)', result, re.DOTALL | re.IGNORECASE)
            summary = summary_match.group(1).strip() if summary_match else "Position unclear"

            points_section = re.search(r'KEY POINTS:(.*?)(?=CONFIDENCE|$)', result, re.DOTALL | re.IGNORECASE)
            key_points = []
            if points_section:
                for line in points_section.group(1).split('\n'):
                    line = line.strip().lstrip('-').strip()
                    if line and len(line) > 5:
                        key_points.append(line)

            confidence_match = re.search(r'CONFIDENCE:\s*(\d+\.?\d*)', result)
            confidence = float(confidence_match.group(1)) if confidence_match else 0.7
            confidence = min(max(confidence, 0.0), 1.0)

            return ExpertPosition(
                agent_id=agent_id,
                agent_name=agent_name,
                position=position,
                summary=summary[:300],
                confidence=confidence,
                key_points=key_points[:3]
            )

        except Exception as e:
            logger.warning(f"Position analysis failed for {agent_name}: {e}")
            return ExpertPosition(
                agent_id=agent_id,
                agent_name=agent_name,
                position="neutral",
                summary="Unable to determine position",
                confidence=0.5
            )

    def _build_aspect_comparison(
        self,
        aspect: str,
        positions: List[ExpertPosition]
    ) -> AspectComparison:
        """Build comparison for a single aspect"""
        if not positions:
            return AspectComparison(
                aspect_name=aspect,
                aspect_description=f"Analysis of {aspect}",
                expert_positions=[],
                consensus_status="no_consensus",
                consensus_score=0.0
            )

        # Count positions
        position_counts = {
            "support": 0,
            "oppose": 0,
            "neutral": 0,
            "qualified": 0
        }

        for p in positions:
            if p.position in position_counts:
                position_counts[p.position] += 1

        total = len(positions)

        # Determine consensus status
        max_position = max(position_counts, key=position_counts.get)
        max_count = position_counts[max_position]

        if max_count == total:
            consensus_status = "consensus"
            consensus_score = 1.0
        elif max_count >= total * 0.75:
            consensus_status = "consensus"
            consensus_score = max_count / total
        elif max_count >= total * 0.5:
            consensus_status = "majority"
            consensus_score = max_count / total
        elif max_count >= total * 0.4:
            consensus_status = "divided"
            consensus_score = max_count / total
        else:
            consensus_status = "no_consensus"
            consensus_score = max_count / total

        # Find majority position and key disagreement
        majority_position = max_position if max_count > total / 2 else None

        # Find key disagreement if divided
        key_disagreement = None
        if consensus_status in ["divided", "no_consensus"]:
            opposing_positions = [p for p in positions if p.position != max_position]
            if opposing_positions:
                key_disagreement = f"Disagreement between {max_position} and {opposing_positions[0].position} positions"

        return AspectComparison(
            aspect_name=aspect,
            aspect_description=f"Expert positions on {aspect}",
            expert_positions=positions,
            consensus_status=consensus_status,
            consensus_score=consensus_score,
            majority_position=majority_position,
            key_disagreement=key_disagreement
        )

    def _calculate_overall_consensus(
        self,
        aspect_comparisons: List[AspectComparison]
    ) -> float:
        """Calculate overall consensus across all aspects"""
        if not aspect_comparisons:
            return 0.0

        total_score = sum(ac.consensus_score for ac in aspect_comparisons)
        return total_score / len(aspect_comparisons)

    async def _generate_synthesis(
        self,
        question: str,
        aspect_comparisons: List[AspectComparison],
        responses: List[Dict[str, Any]]
    ) -> str:
        """Generate synthesis text for the comparison"""
        aspects_summary = []
        for ac in aspect_comparisons:
            status_emoji = {
                "consensus": "✅",
                "majority": "➕",
                "divided": "⚠️",
                "no_consensus": "❌"
            }.get(ac.consensus_status, "❓")

            aspects_summary.append(
                f"- {ac.aspect_name}: {status_emoji} {ac.consensus_status} "
                f"({ac.consensus_score:.0%})"
            )

        prompt = f"""Synthesize this panel comparison on: "{question}"

Aspect Analysis:
{chr(10).join(aspects_summary)}

Write a 2-3 paragraph synthesis that:
1. Summarizes where experts agree
2. Highlights key areas of disagreement
3. Provides actionable recommendations based on the panel's input

SYNTHESIS:"""

        try:
            result = await self.llm_service.generate(
                prompt=prompt,
                model=self._llm_config.model,
                temperature=0.4,
                max_tokens=500
            )

            return result.replace("SYNTHESIS:", "").strip()

        except Exception as e:
            logger.warning(f"Synthesis generation failed: {e}")
            return "Unable to generate synthesis. Please review individual expert positions."

    def _empty_matrix(self, question: str) -> ComparisonMatrix:
        """Return empty matrix when no data available"""
        return ComparisonMatrix(
            question=question,
            aspects=[],
            experts=[],
            overall_consensus=0.0,
            consensus_areas=[],
            divergence_areas=[],
            synthesis="No responses available for comparison.",
            generated_at=datetime.now(timezone.utc).isoformat(),
            metadata={"error": "no_responses"}
        )

    def to_grid_view(self, matrix: ComparisonMatrix) -> Dict[str, Any]:
        """
        Convert matrix to grid view format.

        Returns structure suitable for rendering as an Aspects × Experts grid.
        """
        if not matrix.aspects:
            return {"grid": [], "experts": [], "aspects": []}

        expert_names = [e["name"] for e in matrix.experts]
        aspect_names = [a.aspect_name for a in matrix.aspects]

        # Build grid data
        grid = []
        for aspect in matrix.aspects:
            row = {
                "aspect": aspect.aspect_name,
                "consensus": aspect.consensus_status,
                "positions": {}
            }

            for pos in aspect.expert_positions:
                row["positions"][pos.agent_name] = {
                    "position": pos.position,
                    "summary": pos.summary,
                    "confidence": pos.confidence
                }

            grid.append(row)

        return {
            "grid": grid,
            "experts": expert_names,
            "aspects": aspect_names,
            "overall_consensus": matrix.overall_consensus
        }

    def to_table_view(self, matrix: ComparisonMatrix) -> Dict[str, Any]:
        """
        Convert matrix to table view format.

        Returns flat table structure with rows for each expert-aspect combination.
        """
        rows = []

        for aspect in matrix.aspects:
            for pos in aspect.expert_positions:
                rows.append({
                    "aspect": aspect.aspect_name,
                    "expert_id": pos.agent_id,
                    "expert_name": pos.agent_name,
                    "position": pos.position,
                    "summary": pos.summary,
                    "confidence": pos.confidence,
                    "key_points": pos.key_points,
                    "aspect_consensus": aspect.consensus_status,
                    "aspect_consensus_score": aspect.consensus_score
                })

        return {
            "rows": rows,
            "total_rows": len(rows),
            "columns": [
                "aspect", "expert_name", "position", "summary",
                "confidence", "aspect_consensus"
            ],
            "sortable": ["aspect", "expert_name", "position", "confidence"],
            "filterable": ["position", "aspect_consensus"]
        }

    def to_synthesis_view(self, matrix: ComparisonMatrix) -> Dict[str, Any]:
        """
        Convert matrix to synthesis view format.

        Returns aggregated view focused on recommendations and consensus.
        """
        return {
            "question": matrix.question,
            "synthesis": matrix.synthesis,
            "overall_consensus": matrix.overall_consensus,
            "consensus_level": (
                "high" if matrix.overall_consensus >= 0.75 else
                "medium" if matrix.overall_consensus >= 0.5 else
                "low"
            ),
            "areas_of_agreement": matrix.consensus_areas,
            "areas_of_disagreement": matrix.divergence_areas,
            "expert_count": len(matrix.experts),
            "aspect_count": len(matrix.aspects),
            "aspect_summaries": [
                {
                    "name": a.aspect_name,
                    "consensus": a.consensus_status,
                    "majority_view": a.majority_position,
                    "key_disagreement": a.key_disagreement
                }
                for a in matrix.aspects
            ],
            "generated_at": matrix.generated_at
        }


# Factory function
def create_comparison_matrix_builder(llm_service: LLMService) -> ComparisonMatrixBuilder:
    """Create a comparison matrix builder instance."""
    return ComparisonMatrixBuilder(llm_service)


# Singleton
_matrix_builder: Optional[ComparisonMatrixBuilder] = None


def get_comparison_matrix_builder() -> Optional[ComparisonMatrixBuilder]:
    """Get the global matrix builder instance."""
    return _matrix_builder


def initialize_comparison_matrix_builder(llm_service: LLMService) -> ComparisonMatrixBuilder:
    """Initialize the global matrix builder."""
    global _matrix_builder
    _matrix_builder = ComparisonMatrixBuilder(llm_service)
    logger.info("✅ Comparison Matrix Builder initialized")
    return _matrix_builder
