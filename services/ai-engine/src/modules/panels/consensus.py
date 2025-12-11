"""
Consensus Builder - Synthesizes panel responses into unified consensus.

This module analyzes all panel member responses and builds a coherent
consensus that represents the collective wisdom of the panel.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import logging

from infrastructure.llm.client import LLMClient

logger = logging.getLogger(__name__)


@dataclass
class ConsensusResult:
    """Result of consensus building."""
    summary: str
    key_points: List[str]
    areas_of_agreement: List[str]
    areas_of_disagreement: List[str]
    recommendations: List[str]
    confidence_score: float


class ConsensusBuilder:
    """
    Builds consensus from multiple panel member responses.
    
    Uses LLM to analyze and synthesize diverse expert opinions
    into a coherent, actionable consensus.
    """
    
    CONSENSUS_SYSTEM_PROMPT = """You are an expert facilitator tasked with synthesizing 
a panel discussion into a clear consensus. You should:
1. Identify common themes and agreements
2. Note important disagreements and their reasoning
3. Provide balanced, actionable recommendations
4. Be objective and not favor any single perspective"""
    
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
    
    async def build(
        self,
        topic: str,
        question: str,
        responses: Dict[str, List[Dict[str, Any]]],
        panel_members: List[Any],
    ) -> str:
        """
        Build consensus from panel responses.
        
        Args:
            topic: The panel discussion topic
            question: The original question
            responses: Dict mapping member_id to list of responses
            panel_members: List of PanelMember objects
            
        Returns:
            Consensus summary as a string
        """
        # Build context from all responses
        context = self._format_responses_for_consensus(responses, panel_members)
        
        prompt = f"""Analyze the following expert panel discussion and provide a comprehensive consensus summary.

**Topic:** {topic}

**Question:** {question}

**Panel Discussion:**
{context}

Please provide:

## Consensus Summary
A clear, balanced summary of the panel's collective view (2-3 paragraphs).

## Key Points of Agreement
- List the main points where experts agreed

## Areas of Disagreement
- Note any significant disagreements and the reasoning behind different positions

## Recommendations
Based on this discussion, what are the key takeaways and recommended actions?

## Confidence Level
Rate the overall consensus strength (Strong/Moderate/Weak) and explain why."""

        response = await self.llm_client.generate(
            prompt=prompt,
            system_prompt=self.CONSENSUS_SYSTEM_PROMPT,
            temperature=0.3,  # Lower temperature for more focused synthesis
        )
        
        logger.info(f"Built consensus for topic: {topic}")
        return response
    
    async def build_structured(
        self,
        topic: str,
        question: str,
        responses: Dict[str, List[Dict[str, Any]]],
        panel_members: List[Any],
    ) -> ConsensusResult:
        """
        Build structured consensus with detailed breakdown.
        
        Returns a ConsensusResult with parsed components.
        """
        raw_consensus = await self.build(topic, question, responses, panel_members)
        
        # Parse the consensus into structured format
        return self._parse_consensus(raw_consensus)
    
    def _format_responses_for_consensus(
        self,
        responses: Dict[str, List[Dict[str, Any]]],
        panel_members: List[Any],
    ) -> str:
        """Format all responses for consensus prompt."""
        member_map = {m.id: m for m in panel_members}
        formatted_parts = []
        
        for member_id, member_responses in responses.items():
            member = member_map.get(member_id)
            member_name = member.name if member else f"Member {member_id}"
            member_role = member.role if member else "Expert"
            
            formatted_parts.append(f"### {member_name} ({member_role})")
            
            for resp in member_responses:
                phase = resp.get("phase", "unknown")
                content = resp.get("content", "")
                formatted_parts.append(f"**{phase.replace('_', ' ').title()}:**")
                formatted_parts.append(content)
                formatted_parts.append("")
        
        return "\n".join(formatted_parts)
    
    def _parse_consensus(self, raw_consensus: str) -> ConsensusResult:
        """Parse raw consensus into structured result."""
        # Simple parsing - could be enhanced with more sophisticated extraction
        lines = raw_consensus.split("\n")
        
        summary = ""
        key_points = []
        agreements = []
        disagreements = []
        recommendations = []
        confidence = 0.7  # Default moderate confidence
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if "## Consensus Summary" in line:
                current_section = "summary"
            elif "## Key Points" in line:
                current_section = "key_points"
            elif "## Areas of Agreement" in line or "Agreement" in line:
                current_section = "agreements"
            elif "## Areas of Disagreement" in line or "Disagreement" in line:
                current_section = "disagreements"
            elif "## Recommendations" in line:
                current_section = "recommendations"
            elif "## Confidence" in line:
                current_section = "confidence"
            elif line.startswith("- "):
                item = line[2:].strip()
                if current_section == "key_points":
                    key_points.append(item)
                elif current_section == "agreements":
                    agreements.append(item)
                elif current_section == "disagreements":
                    disagreements.append(item)
                elif current_section == "recommendations":
                    recommendations.append(item)
            elif line and current_section == "summary":
                summary += line + " "
            elif current_section == "confidence":
                if "Strong" in line:
                    confidence = 0.9
                elif "Moderate" in line:
                    confidence = 0.7
                elif "Weak" in line:
                    confidence = 0.4
        
        return ConsensusResult(
            summary=summary.strip(),
            key_points=key_points,
            areas_of_agreement=agreements,
            areas_of_disagreement=disagreements,
            recommendations=recommendations,
            confidence_score=confidence,
        )
    
    async def summarize_for_user(
        self,
        consensus_result: ConsensusResult,
        verbosity: str = "standard",
    ) -> str:
        """
        Create user-friendly summary of consensus.
        
        Args:
            consensus_result: The structured consensus
            verbosity: "brief", "standard", or "detailed"
        """
        if verbosity == "brief":
            return consensus_result.summary
        
        parts = [consensus_result.summary]
        
        if consensus_result.key_points:
            parts.append("\n**Key Takeaways:**")
            for point in consensus_result.key_points[:3]:
                parts.append(f"• {point}")
        
        if verbosity == "detailed":
            if consensus_result.recommendations:
                parts.append("\n**Recommendations:**")
                for rec in consensus_result.recommendations:
                    parts.append(f"• {rec}")
            
            if consensus_result.areas_of_disagreement:
                parts.append("\n**Note:** Experts had differing views on:")
                for diff in consensus_result.areas_of_disagreement[:2]:
                    parts.append(f"• {diff}")
        
        return "\n".join(parts)






