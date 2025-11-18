"""
VITAL Path Triage Classification System
Advanced classification system for query triage with pattern matching and ML capabilities
"""

import re
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

class TriageClassifier:
    """
    Advanced classification system for query triage
    """

    def __init__(self):
        self.domain_classifier = DomainClassifier()
        self.complexity_scorer = ComplexityScorer()
        self.urgency_detector = UrgencyDetector()
        self.intent_analyzer = IntentAnalyzer()

        # Initialize pattern matchers
        self.initialize_patterns()

        logger.info("Triage Classifier initialized")

    def initialize_patterns(self):
        """
        Initialize all classification patterns
        """
        # Medical domain patterns
        self.medical_patterns = [
            r'\b(clinical|patient|treatment|drug|disease|medical|therapy|diagnosis)\b',
            r'\b(adverse event|side effect|efficacy|safety|endpoint)\b',
            r'\b(RCT|randomized|controlled trial|phase [123]|pivotal)\b',
            r'\b(biomarker|therapeutic|indication|contraindication)\b',
            r'\b(dosing|administration|pharmacokinetics|pharmacodynamics)\b'
        ]

        # Regulatory domain patterns
        self.regulatory_patterns = [
            r'\b(FDA|EMA|regulatory|compliance|510k|PMA|approval|clearance)\b',
            r'\b(submission|guidance|CFR|pathway|classification)\b',
            r'\b(predicate|substantial equivalence|De Novo)\b',
            r'\b(IND|NDA|BLA|premarket|postmarket)\b',
            r'\b(quality system|QSR|ISO 13485|GMP|GCP)\b'
        ]

        # Digital health patterns
        self.digital_patterns = [
            r'\b(app|digital|software|SaMD|mHealth|DTx|AI|ML)\b',
            r'\b(algorithm|mobile health|digital therapeutic)\b',
            r'\b(wearable|sensor|IoT|connected device)\b',
            r'\b(machine learning|artificial intelligence|neural network)\b'
        ]

        # Commercial patterns
        self.commercial_patterns = [
            r'\b(market|reimbursement|pricing|commercial|business)\b',
            r'\b(payer|coverage|CPT|coding|value proposition)\b',
            r'\b(ROI|revenue|profit|competition|market access)\b',
            r'\b(launch|commercialization|go-to-market)\b'
        ]

        # Clinical research patterns
        self.clinical_research_patterns = [
            r'\b(trial design|study design|protocol|endpoint)\b',
            r'\b(recruitment|enrollment|inclusion|exclusion)\b',
            r'\b(primary endpoint|secondary endpoint|composite)\b',
            r'\b(statistical analysis|power calculation|sample size)\b'
        ]

        # Market access patterns
        self.market_access_patterns = [
            r'\b(health economics|cost effectiveness|HEOR)\b',
            r'\b(payer negotiation|formulary|prior authorization)\b',
            r'\b(budget impact|pharmacoeconomics|QALY)\b'
        ]

    async def classify(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive query classification
        """
        start_time = datetime.now()

        try:
            # 1. Domain classification
            domains = await self.classify_domains(query)

            # 2. Complexity assessment
            complexity = await self.assess_complexity(query, domains)

            # 3. Urgency detection
            urgency = await self.detect_urgency(query, context)

            # 4. Intent analysis
            intent = await self.analyze_intent(query)

            # 5. Safety screening
            safety_flags = await self.screen_safety(query)

            # 6. Regulatory flags
            regulatory_flags = await self.check_regulatory_triggers(query)

            # 7. Entity extraction
            entities = await self.extract_entities(query)

            # 8. Context analysis
            context_factors = await self.analyze_context(context)

            classification_time = (datetime.now() - start_time).total_seconds() * 1000

            result = {
                "primary_domain": domains["primary"],
                "secondary_domains": domains["secondary"],
                "complexity": complexity,
                "urgency": urgency,
                "intent": intent,
                "safety_flags": safety_flags,
                "regulatory_flags": regulatory_flags,
                "entities": entities,
                "context_factors": context_factors,
                "confidence": self.calculate_confidence(domains, complexity, intent),
                "classification_time_ms": classification_time,
                "is_multi_domain": domains.get("is_multi_domain", False)
            }

            logger.debug(f"Classification completed in {classification_time:.2f}ms: {domains['primary']}")
            return result

        except Exception as e:
            logger.error(f"Classification error: {str(e)}")
            return self._create_fallback_classification(query)

    async def classify_domains(self, query: str) -> Dict[str, Any]:
        """
        Multi-label domain classification with confidence scores
        """
        # Score each domain
        scores = {
            "medical_affairs": self.score_patterns(query, self.medical_patterns),
            "regulatory_compliance": self.score_patterns(query, self.regulatory_patterns),
            "digital_health": self.score_patterns(query, self.digital_patterns),
            "commercial_strategy": self.score_patterns(query, self.commercial_patterns),
            "clinical_research": self.score_patterns(query, self.clinical_research_patterns),
            "market_access": self.score_patterns(query, self.market_access_patterns),
            "methodology": self.score_methodology_relevance(query),
            "technology": self.score_technology_relevance(query)
        }

        # Determine primary and secondary domains
        sorted_domains = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_domains[0][0] if sorted_domains[0][1] > 0.3 else "general"
        secondary = [d[0] for d in sorted_domains[1:] if d[1] > 0.2]

        return {
            "primary": primary,
            "secondary": secondary,
            "scores": scores,
            "is_multi_domain": len([s for s in scores.values() if s > 0.3]) > 1,
            "domain_confidence": sorted_domains[0][1] if sorted_domains else 0.0
        }

    def score_patterns(self, query: str, patterns: List[str]) -> float:
        """
        Score query against a set of patterns
        """
        query_lower = query.lower()
        total_score = 0.0

        for pattern in patterns:
            matches = re.findall(pattern, query_lower)
            # Weight by number of matches and pattern specificity
            pattern_score = len(matches) * self.get_pattern_weight(pattern)
            total_score += pattern_score

        # Normalize by query length
        normalization_factor = min(1.0, len(query.split()) / 10)
        return min(total_score * normalization_factor, 1.0)

    def get_pattern_weight(self, pattern: str) -> float:
        """
        Get weight for pattern based on specificity
        """
        # More specific patterns get higher weights
        if r'\b' in pattern and r'|' in pattern:
            return 0.3  # Multi-option specific patterns
        elif r'\b' in pattern:
            return 0.5  # Single specific patterns
        else:
            return 0.1  # General patterns

    def score_methodology_relevance(self, query: str) -> float:
        """
        Score methodology framework relevance
        """
        methodology_keywords = [
            'framework', 'methodology', 'approach', 'best practice',
            'guideline', 'standard', 'process', 'workflow'
        ]

        score = 0.0
        query_lower = query.lower()

        for keyword in methodology_keywords:
            if keyword in query_lower:
                score += 0.2

        return min(score, 1.0)

    def score_technology_relevance(self, query: str) -> float:
        """
        Score technology platform relevance
        """
        technology_keywords = [
            'platform', 'system', 'infrastructure', 'architecture',
            'integration', 'API', 'database', 'cloud', 'technical'
        ]

        score = 0.0
        query_lower = query.lower()

        for keyword in technology_keywords:
            if keyword in query_lower:
                score += 0.15

        return min(score, 1.0)

    async def assess_complexity(self, query: str, domains: Dict) -> str:
        """
        Assess query complexity using multiple factors
        """
        complexity_score = 0.0

        # Length-based scoring
        word_count = len(query.split())
        if word_count > 100:
            complexity_score += 0.4
        elif word_count > 50:
            complexity_score += 0.3
        elif word_count > 20:
            complexity_score += 0.2

        # Multi-domain queries are more complex
        if domains.get("is_multi_domain"):
            complexity_score += 0.3

        # Check for complex keywords
        complex_keywords = [
            "comprehensive", "detailed", "complete", "full", "thorough",
            "strategy", "analysis", "comparison", "evaluation", "assessment",
            "optimize", "design", "develop", "implement", "integrate"
        ]
        for keyword in complex_keywords:
            if keyword in query.lower():
                complexity_score += 0.1

        # Check for multiple questions
        question_marks = query.count("?")
        if question_marks > 2:
            complexity_score += 0.3
        elif question_marks > 1:
            complexity_score += 0.2

        # Check for conditional statements
        conditional_words = ["if", "when", "unless", "provided that", "assuming"]
        for word in conditional_words:
            if word in query.lower():
                complexity_score += 0.1

        # Check for quantitative requirements
        quantitative_indicators = ["calculate", "measure", "quantify", "estimate", "percentage"]
        for indicator in quantitative_indicators:
            if indicator in query.lower():
                complexity_score += 0.1

        # Categorize complexity
        if complexity_score >= 0.8:
            return "complex"
        elif complexity_score >= 0.4:
            return "moderate"
        else:
            return "simple"

    async def detect_urgency(self, query: str, context: Dict) -> str:
        """
        Detect query urgency level with context awareness
        """
        # Critical urgency patterns
        critical_patterns = [
            r'\b(urgent|emergency|critical|immediate|asap|now)\b',
            r'\b(patient safety|adverse event|death|serious)\b',
            r'\b(recall|withdrawal|halt|stop|suspend)\b',
            r'\b(FDA warning|regulatory action|compliance violation)\b'
        ]

        # High urgency patterns
        high_patterns = [
            r'\b(deadline|due date|submission|tomorrow|today)\b',
            r'\b(FDA meeting|inspection|audit|review)\b',
            r'\b(launch|go-live|release|approval pending)\b',
            r'\b(time sensitive|priority|expedited)\b'
        ]

        # Medium urgency patterns
        medium_patterns = [
            r'\b(soon|quickly|prompt|timely)\b',
            r'\b(upcoming|planned|scheduled)\b'
        ]

        # Check patterns in order of priority
        if any(re.search(p, query, re.IGNORECASE) for p in critical_patterns):
            return "critical"
        elif any(re.search(p, query, re.IGNORECASE) for p in high_patterns):
            return "high"
        elif any(re.search(p, query, re.IGNORECASE) for p in medium_patterns):
            return "medium"
        elif context.get("user_priority") == "high":
            return "high"
        elif context.get("session_urgency") == "elevated":
            return "medium"
        else:
            return "low"

    async def analyze_intent(self, query: str) -> Dict[str, Any]:
        """
        Analyze user intent with confidence scoring
        """
        query_lower = query.lower()

        # Define intent patterns
        intent_patterns = {
            "question": [
                r'\b(what|how|when|where|why|which|who)\b',
                r'\?',
                r'\b(explain|describe|clarify)\b'
            ],
            "request": [
                r'\b(create|design|develop|build|generate|make)\b',
                r'\b(help me|assist me|can you)\b',
                r'\b(provide|give me|show me)\b'
            ],
            "analysis": [
                r'\b(analyze|compare|evaluate|assess|review)\b',
                r'\b(examine|investigate|study)\b',
                r'\b(pros and cons|advantages|disadvantages)\b'
            ],
            "strategy": [
                r'\b(strategy|plan|approach|recommendation)\b',
                r'\b(should I|what would you recommend)\b',
                r'\b(best way|optimal|preferred)\b'
            ],
            "guidance": [
                r'\b(guide|guidance|direction|advice)\b',
                r'\b(how to|steps|process|procedure)\b'
            ],
            "validation": [
                r'\b(validate|verify|confirm|check)\b',
                r'\b(correct|accurate|right|wrong)\b'
            ]
        }

        # Score each intent
        intent_scores = {}
        for intent, patterns in intent_patterns.items():
            score = 0.0
            for pattern in patterns:
                matches = len(re.findall(pattern, query_lower))
                score += matches * 0.3

            intent_scores[intent] = min(score, 1.0)

        # Determine primary intent
        if not intent_scores or max(intent_scores.values()) == 0:
            primary_intent = "general_inquiry"
            confidence = 0.3
        else:
            primary_intent = max(intent_scores, key=intent_scores.get)
            confidence = intent_scores[primary_intent]

        return {
            "primary": primary_intent,
            "scores": intent_scores,
            "confidence": confidence
        }

    async def screen_safety(self, query: str) -> List[str]:
        """
        Screen for safety-critical content
        """
        safety_flags = []
        query_lower = query.lower()

        # Adverse event detection
        ae_patterns = [
            r'\b(adverse event|AE|SAE|serious adverse event)\b',
            r'\b(side effect|reaction|complication)\b',
            r'\b(death|mortality|fatality)\b',
            r'\b(hospitalization|emergency room|ER visit)\b'
        ]

        for pattern in ae_patterns:
            if re.search(pattern, query_lower):
                safety_flags.append("potential_adverse_event")
                break

        # Drug safety concerns
        drug_safety_patterns = [
            r'\b(drug interaction|contraindication|warning)\b',
            r'\b(black box|boxed warning|FDA warning)\b',
            r'\b(overdose|toxicity|poisoning)\b'
        ]

        for pattern in drug_safety_patterns:
            if re.search(pattern, query_lower):
                safety_flags.append("drug_safety_concern")
                break

        # Device safety
        device_safety_patterns = [
            r'\b(malfunction|defect|failure|recall)\b',
            r'\b(device error|system failure|software bug)\b',
            r'\b(patient harm|injury|damage)\b'
        ]

        for pattern in device_safety_patterns:
            if re.search(pattern, query_lower):
                safety_flags.append("device_safety_concern")
                break

        # Clinical trial safety
        trial_safety_patterns = [
            r'\b(protocol deviation|safety signal|DSMB)\b',
            r'\b(stopping rule|futility|safety run-in)\b',
            r'\b(safety review|safety committee)\b'
        ]

        for pattern in trial_safety_patterns:
            if re.search(pattern, query_lower):
                safety_flags.append("trial_safety_concern")
                break

        return list(set(safety_flags))  # Remove duplicates

    async def check_regulatory_triggers(self, query: str) -> List[str]:
        """
        Check for regulatory trigger events
        """
        regulatory_flags = []
        query_lower = query.lower()

        # FDA submission triggers
        fda_triggers = [
            r'\b(FDA submission|510k submission|PMA submission)\b',
            r'\b(IDE application|IND submission|NDA submission)\b',
            r'\b(pre-submission|Q-sub|FDA meeting)\b'
        ]

        for pattern in fda_triggers:
            if re.search(pattern, query_lower):
                regulatory_flags.append("fda_submission_trigger")
                break

        # Compliance triggers
        compliance_triggers = [
            r'\b(FDA inspection|warning letter|483)\b',
            r'\b(compliance issue|regulatory deviation)\b',
            r'\b(CAPA|corrective action|quality issue)\b'
        ]

        for pattern in compliance_triggers:
            if re.search(pattern, query_lower):
                regulatory_flags.append("compliance_trigger")
                break

        # International regulatory triggers
        international_triggers = [
            r'\b(CE mark|MDR|IVDR|EMA)\b',
            r'\b(Health Canada|PMDA|NMPA)\b',
            r'\b(international harmonization|ICH)\b'
        ]

        for pattern in international_triggers:
            if re.search(pattern, query_lower):
                regulatory_flags.append("international_regulatory")
                break

        return list(set(regulatory_flags))

    async def extract_entities(self, query: str) -> List[Dict[str, Any]]:
        """
        Extract named entities with types and confidence
        """
        entities = []

        # Regulatory entities
        regulatory_entities = {
            'FDA': 'regulatory_agency',
            'EMA': 'regulatory_agency',
            'PMDA': 'regulatory_agency',
            'Health Canada': 'regulatory_agency',
            '510(k)': 'regulatory_pathway',
            'PMA': 'regulatory_pathway',
            'De Novo': 'regulatory_pathway',
            'IDE': 'regulatory_pathway'
        }

        # Clinical entities
        clinical_entities = {
            'Phase I': 'clinical_phase',
            'Phase II': 'clinical_phase',
            'Phase III': 'clinical_phase',
            'RCT': 'study_type',
            'randomized controlled trial': 'study_type'
        }

        # Technology entities
        technology_entities = {
            'SaMD': 'technology_type',
            'DTx': 'technology_type',
            'AI': 'technology_type',
            'ML': 'technology_type',
            'mHealth': 'technology_type'
        }

        all_entities = {**regulatory_entities, **clinical_entities, **technology_entities}

        for entity_text, entity_type in all_entities.items():
            if entity_text.lower() in query.lower():
                # Find position in query
                start_pos = query.lower().find(entity_text.lower())
                entities.append({
                    "text": entity_text,
                    "type": entity_type,
                    "start": start_pos,
                    "end": start_pos + len(entity_text),
                    "confidence": 0.9
                })

        return entities

    async def analyze_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze contextual factors
        """
        context_factors = {
            "user_type": context.get("user_type", "unknown"),
            "session_length": context.get("session_length", 0),
            "previous_queries": len(context.get("query_history", [])),
            "domain_expertise": context.get("domain_expertise", "general"),
            "urgency_indicators": []
        }

        # Check for urgency indicators in context
        if context.get("deadline"):
            context_factors["urgency_indicators"].append("deadline_specified")

        if context.get("high_priority"):
            context_factors["urgency_indicators"].append("high_priority_flag")

        if context.get("escalated_from"):
            context_factors["urgency_indicators"].append("escalated_session")

        return context_factors

    def calculate_confidence(
        self,
        domains: Dict[str, Any],
        complexity: str,
        intent: Dict[str, Any]
    ) -> float:
        """
        Calculate overall classification confidence
        """
        confidence = 0.5  # Base confidence

        # Domain confidence
        domain_confidence = domains.get("domain_confidence", 0.0)
        confidence += domain_confidence * 0.3

        # Intent confidence
        intent_confidence = intent.get("confidence", 0.0)
        confidence += intent_confidence * 0.2

        # Complexity confidence (simpler queries are more confident)
        complexity_confidence = {
            "simple": 0.3,
            "moderate": 0.2,
            "complex": 0.1
        }
        confidence += complexity_confidence.get(complexity, 0.1)

        # Multi-domain penalty
        if domains.get("is_multi_domain"):
            confidence -= 0.1

        return min(max(confidence, 0.1), 1.0)

    def _create_fallback_classification(self, query: str) -> Dict[str, Any]:
        """
        Create fallback classification when main classification fails
        """
        return {
            "primary_domain": "general",
            "secondary_domains": [],
            "complexity": "simple",
            "urgency": "low",
            "intent": {"primary": "general_inquiry", "confidence": 0.3},
            "safety_flags": [],
            "regulatory_flags": [],
            "entities": [],
            "context_factors": {},
            "confidence": 0.3,
            "is_multi_domain": False,
            "fallback": True,
            "classification_time_ms": 0
        }


# Supporting classes

class DomainClassifier:
    """Domain-specific classification logic"""
    pass

class ComplexityScorer:
    """Complexity assessment logic"""
    pass

class UrgencyDetector:
    """Urgency detection logic"""
    pass

class IntentAnalyzer:
    """Intent analysis logic"""
    pass