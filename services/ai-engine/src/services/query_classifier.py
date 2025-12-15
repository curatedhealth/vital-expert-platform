"""
Query Classification Service for RAG Strategy Selection

Automatically classifies queries and recommends optimal RAG strategies.
Uses pattern matching and intent detection to route queries to
the most effective search configuration.

Strategy Mappings:
- regulatory_precision: FDA, compliance, 510(k), approval questions
- clinical_evidence: Treatment, dosage, efficacy, safety questions
- research_comprehensive: Literature review, meta-analysis, discovery
- hybrid_enhanced: General pharma questions
- graphrag_entity: Entity-specific queries (drugs, companies, diseases)
- keyword_dominant: Exact term lookup, acronyms, codes
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import re
import structlog

logger = structlog.get_logger()


class QueryIntent(str, Enum):
    """Primary query intent categories"""
    REGULATORY = "regulatory"          # FDA, compliance, submissions
    CLINICAL = "clinical"              # Treatment, efficacy, safety
    RESEARCH = "research"              # Literature, studies, discovery
    OPERATIONAL = "operational"        # Manufacturing, quality, supply
    COMMERCIAL = "commercial"          # Market access, pricing, strategy
    TECHNICAL = "technical"            # Formulation, chemistry, process
    ENTITY_LOOKUP = "entity_lookup"    # Specific drug/company/disease
    GENERAL = "general"                # General pharma questions


class QueryComplexity(str, Enum):
    """Query complexity levels"""
    SIMPLE = "simple"           # Single fact lookup
    MODERATE = "moderate"       # Multi-fact question
    COMPLEX = "complex"         # Analysis, comparison, reasoning
    EXPLORATORY = "exploratory" # Open-ended research


@dataclass
class QueryClassification:
    """Classification result for a query"""
    query: str
    primary_intent: QueryIntent
    secondary_intents: List[QueryIntent]
    complexity: QueryComplexity
    recommended_strategy: str
    confidence: float
    detected_entities: List[str]
    detected_keywords: List[str]
    reasoning: str

    def to_dict(self) -> Dict:
        return {
            "query": self.query[:100],
            "primary_intent": self.primary_intent.value,
            "secondary_intents": [i.value for i in self.secondary_intents],
            "complexity": self.complexity.value,
            "recommended_strategy": self.recommended_strategy,
            "confidence": round(self.confidence, 3),
            "detected_entities": self.detected_entities[:5],
            "detected_keywords": self.detected_keywords[:10],
            "reasoning": self.reasoning
        }


class QueryClassifier:
    """
    Intelligent query classifier for RAG strategy selection

    Routes queries to optimal strategies based on:
    1. Intent detection (regulatory, clinical, research, etc.)
    2. Entity detection (drugs, companies, diseases)
    3. Complexity assessment (simple lookup vs. complex analysis)
    4. Keyword patterns (FDA, 510(k), clinical trial, etc.)
    """

    # Intent-to-Strategy mapping
    STRATEGY_MAP = {
        QueryIntent.REGULATORY: "regulatory_precision",
        QueryIntent.CLINICAL: "clinical_evidence",
        QueryIntent.RESEARCH: "research_comprehensive",
        QueryIntent.OPERATIONAL: "agent_optimized",
        QueryIntent.COMMERCIAL: "hybrid_enhanced",
        QueryIntent.TECHNICAL: "semantic_standard",
        QueryIntent.ENTITY_LOOKUP: "graphrag_entity",
        QueryIntent.GENERAL: "hybrid_enhanced"
    }

    # Regulatory patterns
    REGULATORY_PATTERNS = [
        r'\bFDA\b', r'\bEMA\b', r'\bICH\b', r'\bPMDA\b', r'\bMHRA\b',
        r'\b510\(k\)\b', r'\bPMA\b', r'\bIND\b', r'\bNDA\b', r'\bANDA\b',
        r'\bBLA\b', r'\bDe Novo\b', r'\bCFR\b', r'\bcompliance\b',
        r'\bregulator', r'\bapproval\b', r'\bsubmission\b',
        r'\bguidance\b', r'\bclassification\b', r'\bclearance\b',
        r'\bGxP\b', r'\bGMP\b', r'\bGCP\b', r'\bGLP\b',
        r'\baudit\b', r'\binspection\b', r'\bcitation\b'
    ]

    # Clinical patterns
    CLINICAL_PATTERNS = [
        r'\btreatment\b', r'\befficacy\b', r'\bsafety\b', r'\bdosage\b',
        r'\bdose\b', r'\bside effect', r'\badverse\b', r'\bcontraindication',
        r'\bindication\b', r'\bclinical trial', r'\bphase [123]\b',
        r'\bpatient\b', r'\btherapy\b', r'\bprescri', r'\bpharmaco',
        r'\bdrug interaction', r'\bhalf.?life\b', r'\bbioavailability\b',
        r'\bpharmacokinetic', r'\bpharmacodynamic', r'\btoxicity\b'
    ]

    # Research patterns
    RESEARCH_PATTERNS = [
        r'\bstudy\b', r'\bresearch\b', r'\bliterature\b', r'\bpublication\b',
        r'\bmeta.?analysis\b', r'\bsystematic review\b', r'\bevidence\b',
        r'\bpubmed\b', r'\bjournal\b', r'\bdiscovery\b', r'\binnovation\b',
        r'\bhypothesis\b', r'\bexperiment', r'\bpreclinical\b', r'\bin.?vitro\b',
        r'\bin.?vivo\b', r'\bmodel\b', r'\bmechanism\b', r'\bpathway\b'
    ]

    # Operational patterns
    OPERATIONAL_PATTERNS = [
        r'\bmanufactur', r'\bproduction\b', r'\bsupply chain\b', r'\bquality\b',
        r'\bprocess\b', r'\bscale.?up\b', r'\bvalidation\b', r'\bbatch\b',
        r'\byield\b', r'\bspecification\b', r'\brelease\b', r'\bstability\b',
        r'\bpackaging\b', r'\blabeling\b', r'\bstorage\b', r'\bshelf.?life\b'
    ]

    # Commercial patterns
    COMMERCIAL_PATTERNS = [
        r'\bmarket\b', r'\bpricing\b', r'\breimburse', r'\bpayer\b',
        r'\bHTA\b', r'\bhealth technology assessment\b', r'\baccess\b',
        r'\bcompetit', r'\bcommercial', r'\blaunch\b', r'\bsales\b',
        r'\bforecast\b', r'\brevenue\b', r'\bpatent\b', r'\bexclusivity\b'
    ]

    # Technical patterns
    TECHNICAL_PATTERNS = [
        r'\bformulation\b', r'\bexcipient\b', r'\bAPI\b', r'\bsynthesis\b',
        r'\bchemistry\b', r'\bstructure\b', r'\bsolubility\b', r'\bstability\b',
        r'\bpurity\b', r'\bdegradation\b', r'\banalytical\b', r'\bHPLC\b',
        r'\bspectro', r'\bcrystall', r'\bpolymorp', r'\bdelivery system'
    ]

    # Entity patterns (drug names, companies, etc.)
    ENTITY_PATTERNS = [
        r'\b[A-Z][a-z]+(?:mab|nib|zumab|ximab|tinib|cillin|pril|sartan)\b',  # Drug suffixes
        r'\b(?:Pfizer|Merck|Novartis|Roche|J&J|AstraZeneca|Sanofi|GSK|Bristol|Lilly)\b',  # Big pharma
        r'\bICD-\d+', r'\bCPT\b', r'\bNDC\b',  # Medical codes
    ]

    # Complexity indicators
    SIMPLE_INDICATORS = [
        r'^what is\b', r'^define\b', r'^who is\b', r'^when was\b',
        r'\?$',  # Single question
    ]

    COMPLEX_INDICATORS = [
        r'\bcompare\b', r'\bversus\b', r'\bvs\b', r'\bdifference\b',
        r'\brelationship\b', r'\bimpact\b', r'\beffect on\b',
        r'\bwhy\b', r'\bhow does\b', r'\banalysis\b', r'\bstrategy\b',
        r'\band\b.*\band\b',  # Multiple 'and' = complex query
    ]

    EXPLORATORY_INDICATORS = [
        r'\bexplore\b', r'\bdiscover\b', r'\bwhat.*options\b',
        r'\boverview\b', r'\blandscape\b', r'\btrends\b',
        r'\bopportunit', r'\bpossibil', r'\balternativ'
    ]

    def __init__(self):
        """Initialize query classifier with compiled patterns"""
        # Pre-compile all patterns for performance
        self._regulatory_patterns = [re.compile(p, re.IGNORECASE) for p in self.REGULATORY_PATTERNS]
        self._clinical_patterns = [re.compile(p, re.IGNORECASE) for p in self.CLINICAL_PATTERNS]
        self._research_patterns = [re.compile(p, re.IGNORECASE) for p in self.RESEARCH_PATTERNS]
        self._operational_patterns = [re.compile(p, re.IGNORECASE) for p in self.OPERATIONAL_PATTERNS]
        self._commercial_patterns = [re.compile(p, re.IGNORECASE) for p in self.COMMERCIAL_PATTERNS]
        self._technical_patterns = [re.compile(p, re.IGNORECASE) for p in self.TECHNICAL_PATTERNS]
        self._entity_patterns = [re.compile(p) for p in self.ENTITY_PATTERNS]
        self._simple_patterns = [re.compile(p, re.IGNORECASE) for p in self.SIMPLE_INDICATORS]
        self._complex_patterns = [re.compile(p, re.IGNORECASE) for p in self.COMPLEX_INDICATORS]
        self._exploratory_patterns = [re.compile(p, re.IGNORECASE) for p in self.EXPLORATORY_INDICATORS]

    def classify(self, query: str) -> QueryClassification:
        """
        Classify a query and recommend optimal RAG strategy

        Args:
            query: User query string

        Returns:
            QueryClassification with recommended strategy
        """
        if not query or len(query.strip()) < 3:
            return self._default_classification(query)

        # Detect intents and score them
        intent_scores = self._score_intents(query)
        primary_intent, secondary_intents, confidence = self._rank_intents(intent_scores)

        # Detect complexity
        complexity = self._assess_complexity(query)

        # Detect entities
        entities = self._detect_entities(query)

        # Extract keywords
        keywords = self._extract_keywords(query)

        # Override strategy for entity-heavy queries
        if entities and primary_intent == QueryIntent.GENERAL:
            primary_intent = QueryIntent.ENTITY_LOOKUP
            confidence = max(confidence, 0.7)

        # Get recommended strategy
        strategy = self._get_strategy(primary_intent, complexity, entities)

        # Generate reasoning
        reasoning = self._generate_reasoning(
            primary_intent, complexity, entities, keywords, confidence
        )

        result = QueryClassification(
            query=query,
            primary_intent=primary_intent,
            secondary_intents=secondary_intents,
            complexity=complexity,
            recommended_strategy=strategy,
            confidence=confidence,
            detected_entities=entities,
            detected_keywords=keywords,
            reasoning=reasoning
        )

        logger.info(
            "query_classified",
            query=query[:50],
            intent=primary_intent.value,
            strategy=strategy,
            confidence=confidence,
            complexity=complexity.value
        )

        return result

    def _score_intents(self, query: str) -> Dict[QueryIntent, float]:
        """Score each intent based on pattern matches"""
        scores = {intent: 0.0 for intent in QueryIntent}

        # Count matches for each intent
        scores[QueryIntent.REGULATORY] = self._count_matches(query, self._regulatory_patterns) * 0.15
        scores[QueryIntent.CLINICAL] = self._count_matches(query, self._clinical_patterns) * 0.12
        scores[QueryIntent.RESEARCH] = self._count_matches(query, self._research_patterns) * 0.10
        scores[QueryIntent.OPERATIONAL] = self._count_matches(query, self._operational_patterns) * 0.12
        scores[QueryIntent.COMMERCIAL] = self._count_matches(query, self._commercial_patterns) * 0.12
        scores[QueryIntent.TECHNICAL] = self._count_matches(query, self._technical_patterns) * 0.10
        scores[QueryIntent.ENTITY_LOOKUP] = self._count_matches(query, self._entity_patterns) * 0.20

        # Normalize scores
        max_score = max(scores.values()) if scores.values() else 0
        if max_score > 0:
            scores = {k: min(v / max_score, 1.0) for k, v in scores.items()}

        # If no strong signal, mark as GENERAL
        if max_score < 0.1:
            scores[QueryIntent.GENERAL] = 0.5

        return scores

    def _count_matches(self, query: str, patterns: List[re.Pattern]) -> int:
        """Count pattern matches in query"""
        count = 0
        for pattern in patterns:
            if pattern.search(query):
                count += 1
        return count

    def _rank_intents(
        self,
        scores: Dict[QueryIntent, float]
    ) -> Tuple[QueryIntent, List[QueryIntent], float]:
        """Rank intents and return primary, secondaries, and confidence"""
        sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)

        primary = sorted_intents[0][0]
        confidence = sorted_intents[0][1]

        # Get secondary intents (score > 0.3)
        secondaries = [
            intent for intent, score in sorted_intents[1:4]
            if score > 0.3
        ]

        return primary, secondaries, confidence

    def _assess_complexity(self, query: str) -> QueryComplexity:
        """Assess query complexity"""
        # Check exploratory first (highest priority)
        if any(p.search(query) for p in self._exploratory_patterns):
            return QueryComplexity.EXPLORATORY

        # Check complex
        complex_count = sum(1 for p in self._complex_patterns if p.search(query))
        if complex_count >= 2:
            return QueryComplexity.COMPLEX

        # Check simple
        if any(p.search(query) for p in self._simple_patterns):
            return QueryComplexity.SIMPLE

        # Default to moderate
        word_count = len(query.split())
        if word_count <= 5:
            return QueryComplexity.SIMPLE
        elif word_count <= 15:
            return QueryComplexity.MODERATE
        else:
            return QueryComplexity.COMPLEX

    def _detect_entities(self, query: str) -> List[str]:
        """Detect named entities in query"""
        entities = []

        for pattern in self._entity_patterns:
            matches = pattern.findall(query)
            entities.extend(matches)

        # Also detect capitalized multi-word entities
        cap_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b'
        cap_matches = re.findall(cap_pattern, query)
        entities.extend(cap_matches)

        # Deduplicate
        return list(set(entities))[:10]

    def _extract_keywords(self, query: str) -> List[str]:
        """Extract important keywords"""
        # Remove stop words
        stop_words = {
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
            'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between', 'under',
            'again', 'further', 'then', 'once', 'here', 'there', 'when',
            'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most',
            'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
            'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but',
            'if', 'or', 'because', 'as', 'until', 'while', 'this', 'that',
            'these', 'those', 'what', 'which', 'who', 'whom', 'whose'
        }

        words = re.findall(r'\b\w+\b', query.lower())
        keywords = [w for w in words if w not in stop_words and len(w) > 2]

        return keywords[:15]

    def _get_strategy(
        self,
        intent: QueryIntent,
        complexity: QueryComplexity,
        entities: List[str]
    ) -> str:
        """Determine optimal RAG strategy"""
        # Entity-heavy queries benefit from graph search
        if len(entities) >= 2:
            return "graphrag_entity"

        # Base strategy from intent
        base_strategy = self.STRATEGY_MAP.get(intent, "hybrid_enhanced")

        # Adjust for complexity
        if complexity == QueryComplexity.EXPLORATORY:
            return "research_comprehensive"
        elif complexity == QueryComplexity.COMPLEX:
            # Complex queries benefit from hybrid search
            if base_strategy in ["semantic_standard", "keyword_dominant"]:
                return "hybrid_enhanced"

        return base_strategy

    def _generate_reasoning(
        self,
        intent: QueryIntent,
        complexity: QueryComplexity,
        entities: List[str],
        keywords: List[str],
        confidence: float
    ) -> str:
        """Generate human-readable reasoning"""
        parts = []

        # Intent reasoning
        intent_reasons = {
            QueryIntent.REGULATORY: "regulatory/compliance focus detected",
            QueryIntent.CLINICAL: "clinical/therapeutic focus detected",
            QueryIntent.RESEARCH: "research/literature focus detected",
            QueryIntent.OPERATIONAL: "operational/manufacturing focus detected",
            QueryIntent.COMMERCIAL: "commercial/market focus detected",
            QueryIntent.TECHNICAL: "technical/scientific focus detected",
            QueryIntent.ENTITY_LOOKUP: "specific entity lookup detected",
            QueryIntent.GENERAL: "general pharmaceutical query"
        }
        parts.append(intent_reasons.get(intent, ""))

        # Complexity reasoning
        if complexity == QueryComplexity.COMPLEX:
            parts.append("complex analysis required")
        elif complexity == QueryComplexity.EXPLORATORY:
            parts.append("exploratory research needed")

        # Entity reasoning
        if entities:
            parts.append(f"entities detected: {', '.join(entities[:3])}")

        # Confidence note
        if confidence < 0.5:
            parts.append("low confidence - may benefit from query refinement")

        return "; ".join(filter(None, parts))

    def _default_classification(self, query: str) -> QueryClassification:
        """Return default classification for invalid queries"""
        return QueryClassification(
            query=query or "",
            primary_intent=QueryIntent.GENERAL,
            secondary_intents=[],
            complexity=QueryComplexity.SIMPLE,
            recommended_strategy="hybrid_enhanced",
            confidence=0.3,
            detected_entities=[],
            detected_keywords=[],
            reasoning="insufficient query content for classification"
        )


# Singleton instance
_query_classifier: Optional[QueryClassifier] = None


def get_query_classifier() -> QueryClassifier:
    """Get or create query classifier singleton"""
    global _query_classifier

    if _query_classifier is None:
        _query_classifier = QueryClassifier()

    return _query_classifier


# Convenience function
def classify_query(query: str) -> QueryClassification:
    """Classify a query and get recommended strategy"""
    classifier = get_query_classifier()
    return classifier.classify(query)


# Test function
def test_query_classifier():
    """Test the query classifier with sample queries"""
    classifier = get_query_classifier()

    test_queries = [
        "What is the FDA approval pathway for 510(k) submissions?",
        "Compare the efficacy of metformin vs sitagliptin for type 2 diabetes",
        "What are the side effects of pembrolizumab?",
        "Explore recent publications on CRISPR gene therapy applications",
        "What is the manufacturing process for mRNA vaccines?",
        "How does Pfizer's pricing strategy for Paxlovid affect market access?",
        "What is the structure of aspirin?",
        "Tell me about AstraZeneca's oncology pipeline"
    ]

    print("\n=== Query Classification Test ===\n")

    for query in test_queries:
        result = classifier.classify(query)
        print(f"Query: {query}")
        print(f"  Intent: {result.primary_intent.value}")
        print(f"  Strategy: {result.recommended_strategy}")
        print(f"  Complexity: {result.complexity.value}")
        print(f"  Confidence: {result.confidence:.2f}")
        print(f"  Reasoning: {result.reasoning}")
        print()


if __name__ == "__main__":
    test_query_classifier()
