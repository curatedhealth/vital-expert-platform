"""
Simple Consensus Calculator

Calculates consensus from expert responses using simple algorithms.
For MVP: majority agreement, keyword matching, basic synthesis.
"""

from typing import List, Dict, Any, Set
from collections import Counter
import re
from dataclasses import dataclass
import structlog

logger = structlog.get_logger()


@dataclass
class ConsensusResult:
    """
    Result of consensus calculation.
    """
    consensus_level: float  # 0-1
    agreement_points: Dict[str, Any]
    disagreement_points: Dict[str, Any]
    recommendation: str
    dissenting_opinions: Dict[str, Any]
    key_themes: List[str]


class SimpleConsensusCalculator:
    """
    Calculates consensus using simple algorithms for MVP.
    
    Algorithm:
    1. Extract key points from each response (simple text analysis)
    2. Find common themes (keyword matching)
    3. Calculate agreement percentage
    4. Generate recommendation from majority view
    5. Track dissenting opinions
    
    For MVP we use:
    - Simple keyword extraction
    - Basic similarity matching
    - Majority voting
    - Template-based synthesis
    """
    
    # Common stop words to ignore
    STOP_WORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    }
    
    def __init__(self, min_agreement_threshold: float = 0.5):
        """
        Initialize calculator.
        
        Args:
            min_agreement_threshold: Minimum agreement for consensus (default 0.5)
        """
        self.min_threshold = min_agreement_threshold
    
    def calculate_consensus(
        self,
        responses: List[Dict[str, Any]],
        query: str
    ) -> ConsensusResult:
        """
        Calculate consensus from expert responses.
        
        Args:
            responses: List of expert responses with structure:
                {
                    "agent_id": str,
                    "agent_name": str,
                    "content": str,
                    "confidence_score": float
                }
            query: Original panel query
            
        Returns:
            ConsensusResult with consensus level and analysis
        """
        if not responses:
            return self._empty_consensus()
        
        logger.info(
            "calculating_consensus",
            response_count=len(responses),
            query_length=len(query)
        )
        
        # Extract key points from each response
        expert_points = {}
        all_keywords = []
        
        for response in responses:
            agent_id = response["agent_id"]
            content = response["content"]
            
            # Extract keywords and key phrases
            keywords = self._extract_keywords(content)
            expert_points[agent_id] = {
                "keywords": keywords,
                "content": content,
                "confidence": response.get("confidence_score", 0.5)
            }
            all_keywords.extend(keywords)
        
        # Find common themes (most frequent keywords)
        keyword_counts = Counter(all_keywords)
        common_themes = [word for word, count in keyword_counts.most_common(10) 
                        if count >= len(responses) * 0.3]  # Mentioned by 30%+ of experts
        
        # Calculate agreement on common themes
        agreements = self._find_agreements(expert_points, common_themes)
        
        # Find disagreements
        disagreements = self._find_disagreements(expert_points, responses)
        
        # Calculate overall consensus level
        consensus_level = self._calculate_consensus_level(
            agreements,
            disagreements,
            len(responses)
        )
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            responses,
            agreements,
            common_themes,
            consensus_level
        )
        
        # Track dissenting opinions (responses that significantly differ)
        dissents = self._identify_dissents(
            expert_points,
            common_themes,
            responses
        )
        
        result = ConsensusResult(
            consensus_level=consensus_level,
            agreement_points=agreements,
            disagreement_points=disagreements,
            recommendation=recommendation,
            dissenting_opinions=dissents,
            key_themes=common_themes
        )
        
        logger.info(
            "consensus_calculated",
            consensus_level=round(consensus_level, 2),
            agreement_count=len(agreements),
            disagreement_count=len(disagreements),
            dissent_count=len(dissents)
        )
        
        return result
    
    def _extract_keywords(self, text: str, min_length: int = 4) -> List[str]:
        """
        Extract keywords from text using simple heuristics.
        
        Args:
            text: Text to analyze
            min_length: Minimum word length
            
        Returns:
            List of keywords
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Split into words
        words = text.split()
        
        # Filter: remove stop words, short words, numbers
        keywords = [
            word for word in words
            if (word not in self.STOP_WORDS and
                len(word) >= min_length and
                not word.isdigit())
        ]
        
        return keywords
    
    def _find_agreements(
        self,
        expert_points: Dict[str, Dict],
        common_themes: List[str]
    ) -> Dict[str, Any]:
        """
        Find points of agreement among experts.
        
        Args:
            expert_points: Expert analysis results
            common_themes: Common keywords/themes
            
        Returns:
            Dictionary of agreement points
        """
        agreements = {}
        
        for theme in common_themes:
            # Find which experts mentioned this theme
            experts_mentioning = [
                agent_id for agent_id, data in expert_points.items()
                if theme in data["keywords"]
            ]
            
            if len(experts_mentioning) >= len(expert_points) * 0.5:
                # More than 50% mentioned it
                agreements[f"theme_{theme}"] = {
                    "theme": theme,
                    "expert_count": len(experts_mentioning),
                    "experts": experts_mentioning,
                    "agreement_ratio": len(experts_mentioning) / len(expert_points)
                }
        
        return agreements
    
    def _find_disagreements(
        self,
        expert_points: Dict[str, Dict],
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Find points of disagreement.
        
        Args:
            expert_points: Expert analysis results
            responses: Original responses
            
        Returns:
            Dictionary of disagreement points
        """
        disagreements = {}
        
        # Simple heuristic: look for negation words near common terms
        negation_words = {'not', 'no', 'never', 'neither', 'cannot', 'dont', 'doesnt'}
        
        # Compare each pair of experts
        agent_ids = list(expert_points.keys())
        for i, agent1 in enumerate(agent_ids):
            for agent2 in agent_ids[i+1:]:
                keywords1 = set(expert_points[agent1]["keywords"])
                keywords2 = set(expert_points[agent2]["keywords"])
                
                # Check if they have very different keywords (low overlap)
                overlap = len(keywords1 & keywords2) / max(len(keywords1), len(keywords2), 1)
                
                if overlap < 0.3:  # Less than 30% overlap
                    disagreements[f"divergence_{agent1}_{agent2}"] = {
                        "expert1": agent1,
                        "expert2": agent2,
                        "overlap": overlap,
                        "description": "Significant difference in focus areas"
                    }
        
        return disagreements
    
    def _calculate_consensus_level(
        self,
        agreements: Dict[str, Any],
        disagreements: Dict[str, Any],
        expert_count: int
    ) -> float:
        """
        Calculate overall consensus level (0-1).
        
        Args:
            agreements: Agreement points
            disagreements: Disagreement points
            expert_count: Number of experts
            
        Returns:
            Consensus level between 0 and 1
        """
        if expert_count == 0:
            return 0.0
        
        # Weight by number of agreement points
        agreement_score = len(agreements) / max(expert_count, 1)
        
        # Penalize for disagreements
        disagreement_penalty = len(disagreements) * 0.1
        
        # Calculate consensus
        consensus = max(0.0, min(1.0, agreement_score - disagreement_penalty))
        
        # Adjust based on agreement ratios
        if agreements:
            avg_agreement_ratio = sum(
                a["agreement_ratio"] for a in agreements.values()
            ) / len(agreements)
            consensus = (consensus + avg_agreement_ratio) / 2
        
        return round(consensus, 2)
    
    def _generate_recommendation(
        self,
        responses: List[Dict[str, Any]],
        agreements: Dict[str, Any],
        common_themes: List[str],
        consensus_level: float
    ) -> str:
        """
        Generate recommendation based on consensus.
        
        Args:
            responses: Expert responses
            agreements: Agreement points
            common_themes: Common themes
            consensus_level: Calculated consensus level
            
        Returns:
            Recommendation text
        """
        if consensus_level >= 0.7:
            strength = "strong"
        elif consensus_level >= 0.5:
            strength = "moderate"
        else:
            strength = "weak"
        
        # Build recommendation from most confident responses
        sorted_responses = sorted(
            responses,
            key=lambda r: r.get("confidence_score", 0),
            reverse=True
        )
        
        # Take key sentences from top responses
        recommendation_parts = []
        
        if common_themes:
            themes_str = ", ".join(common_themes[:5])
            recommendation_parts.append(
                f"Based on {len(responses)} expert analyses with {strength} consensus "
                f"({consensus_level:.0%}), the key themes identified are: {themes_str}."
            )
        
        # Add summary from highest confidence response
        if sorted_responses:
            top_response = sorted_responses[0]
            # Extract first sentence or first 200 chars
            content = top_response["content"]
            first_sentence = content.split('.')[0] + '.'
            if len(first_sentence) > 200:
                first_sentence = content[:200] + "..."
            
            recommendation_parts.append(
                f"\nPrimary recommendation: {first_sentence}"
            )
        
        if consensus_level < 0.5:
            recommendation_parts.append(
                "\nNote: Consensus is weak. Consider additional expert input or "
                "further analysis of divergent viewpoints."
            )
        
        return " ".join(recommendation_parts)
    
    def _identify_dissents(
        self,
        expert_points: Dict[str, Dict],
        common_themes: List[str],
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Identify dissenting opinions.
        
        Args:
            expert_points: Expert analysis
            common_themes: Common themes
            responses: Original responses
            
        Returns:
            Dictionary of dissenting opinions
        """
        dissents = {}
        
        # Find experts whose keywords have little overlap with common themes
        for agent_id, data in expert_points.items():
            keywords = set(data["keywords"])
            theme_overlap = len(keywords & set(common_themes)) / max(len(keywords), 1)
            
            if theme_overlap < 0.3:  # Less than 30% overlap with common themes
                # Find the response
                response = next(
                    (r for r in responses if r["agent_id"] == agent_id),
                    None
                )
                
                if response:
                    dissents[agent_id] = {
                        "expert": agent_id,
                        "expert_name": response.get("agent_name", agent_id),
                        "theme_overlap": round(theme_overlap, 2),
                        "unique_points": list(keywords - set(common_themes))[:5],
                        "summary": response["content"][:200] + "..."
                    }
        
        return dissents
    
    def _empty_consensus(self) -> ConsensusResult:
        """Return empty consensus result"""
        return ConsensusResult(
            consensus_level=0.0,
            agreement_points={},
            disagreement_points={},
            recommendation="No expert responses available for consensus analysis.",
            dissenting_opinions={},
            key_themes=[]
        )


# Factory function
def create_consensus_calculator(min_threshold: float = 0.5) -> SimpleConsensusCalculator:
    """
    Create a consensus calculator.
    
    Args:
        min_threshold: Minimum agreement threshold
        
    Returns:
        SimpleConsensusCalculator instance
    """
    return SimpleConsensusCalculator(min_threshold)

