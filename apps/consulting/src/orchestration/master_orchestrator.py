"""
VITAL Path Master Orchestrator System
Central orchestration system for all VITAL Path interactions
"""

from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from dataclasses import dataclass
import asyncio
import json
import uuid
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger(__name__)

class TriageLevel(Enum):
    SAFETY_CRITICAL = "safety_critical"
    REGULATORY_URGENT = "regulatory_urgent"
    COMPLEX_STRATEGIC = "complex_strategic"
    STANDARD_INQUIRY = "standard_inquiry"
    EXPLORATORY = "exploratory"

class RoutingType(Enum):
    SINGLE_AGENT = "single_agent"
    AGENT_TEAM = "agent_team"
    ADVISORY_BOARD = "advisory_board"
    WORKFLOW = "workflow"
    ESCALATION = "escalation"

@dataclass
class TriageResult:
    triage_id: str
    classification: Dict[str, Any]
    routing: Dict[str, Any]
    requirements: Dict[str, Any]
    estimated_response: Dict[str, Any]
    confidence: float
    reasoning: str

class MasterOrchestrator:
    """
    Central orchestration system for all VITAL Path interactions
    """

    def __init__(self):
        self.triage_classifier = None  # Will be initialized with TriageClassifier()
        self.agent_selector = None     # Will be initialized with AgentSelector()
        self.complexity_analyzer = ComplexityAnalyzer()
        self.urgency_detector = UrgencyDetector()
        self.safety_monitor = SafetyMonitor()
        self.routing_optimizer = RoutingOptimizer()

        # Performance tracking
        self.triage_cache = {}
        self.performance_metrics = {
            "total_requests": 0,
            "avg_triage_time_ms": 0,
            "routing_accuracy": 0.95
        }

        logger.info("Master Orchestrator initialized")

    async def triage(
        self,
        query: str,
        user_context: Dict[str, Any],
        session_id: Optional[str] = None
    ) -> TriageResult:
        """
        Main triage entry point - analyzes request and determines routing
        """
        start_time = datetime.now()
        triage_id = str(uuid.uuid4())

        logger.info(f"Starting triage {triage_id} for query: {query[:100]}...")

        try:
            # Step 1: Safety screening (highest priority)
            safety_flags = await self.safety_monitor.screen_query(query, user_context)
            if safety_flags:
                logger.warning(f"Safety flags detected: {safety_flags}")
                return await self._create_safety_escalation(triage_id, query, safety_flags)

            # Step 2: Classification
            classification = await self._classify_query(query, user_context)

            # Step 3: Complexity assessment
            complexity = await self.complexity_analyzer.assess(query, classification)

            # Step 4: Urgency detection
            urgency = await self.urgency_detector.detect(query, user_context)

            # Step 5: Routing decision
            routing_decision = await self._determine_routing(
                classification=classification,
                complexity=complexity,
                urgency=urgency,
                user_context=user_context
            )

            # Step 6: Requirements gathering
            requirements = await self._gather_requirements(
                routing_decision=routing_decision,
                classification=classification
            )

            # Step 7: Response estimation
            estimated_response = await self._estimate_response(
                routing_decision=routing_decision,
                complexity=complexity
            )

            # Calculate confidence
            confidence = self._calculate_confidence(classification, routing_decision)

            # Generate reasoning
            reasoning = self._generate_reasoning(
                classification, complexity, urgency, routing_decision
            )

            # Create triage result
            result = TriageResult(
                triage_id=triage_id,
                classification=classification,
                routing=routing_decision,
                requirements=requirements,
                estimated_response=estimated_response,
                confidence=confidence,
                reasoning=reasoning
            )

            # Update performance metrics
            triage_time = (datetime.now() - start_time).total_seconds() * 1000
            await self._update_performance_metrics(triage_time)

            logger.info(f"Triage {triage_id} completed: {routing_decision['routing_type']}")

            return result

        except Exception as e:
            logger.error(f"Triage {triage_id} failed: {str(e)}")
            return await self._create_fallback_triage(triage_id, query, str(e))

    async def _classify_query(
        self,
        query: str,
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Classify the query into domains and intents
        """
        # Check cache first
        cache_key = self._generate_cache_key(query, user_context)
        if cache_key in self.triage_cache:
            return self.triage_cache[cache_key]

        classification = {
            "primary_domain": await self._classify_primary_domain(query),
            "secondary_domains": await self._classify_secondary_domains(query),
            "intent": await self._classify_intent(query),
            "entities": await self._extract_entities(query),
            "complexity_indicators": await self._identify_complexity_indicators(query),
            "multi_domain": False,
            "confidence": 0.8
        }

        # Check if multi-domain
        all_domains = [classification["primary_domain"]] + classification["secondary_domains"]
        classification["multi_domain"] = len(set(all_domains)) > 1

        # Cache result
        self.triage_cache[cache_key] = classification

        return classification

    async def _classify_primary_domain(self, query: str) -> str:
        """
        Classify the primary domain of the query
        """
        query_lower = query.lower()

        # Medical domain indicators
        medical_keywords = [
            'clinical', 'patient', 'treatment', 'drug', 'therapy', 'medical',
            'adverse event', 'efficacy', 'safety', 'clinical trial', 'endpoint'
        ]

        # Regulatory domain indicators
        regulatory_keywords = [
            'fda', 'ema', 'regulatory', 'compliance', '510k', 'pma', 'approval',
            'submission', 'guidance', 'pathway', 'clearance'
        ]

        # Digital health indicators
        digital_keywords = [
            'app', 'digital', 'software', 'samd', 'mhealth', 'dtx', 'ai', 'ml',
            'algorithm', 'mobile health', 'digital therapeutic'
        ]

        # Commercial indicators
        commercial_keywords = [
            'market', 'reimbursement', 'pricing', 'commercial', 'business',
            'payer', 'coverage', 'value proposition'
        ]

        # Score each domain
        scores = {
            'medical_affairs': sum(1 for kw in medical_keywords if kw in query_lower),
            'regulatory_compliance': sum(1 for kw in regulatory_keywords if kw in query_lower),
            'digital_health': sum(1 for kw in digital_keywords if kw in query_lower),
            'commercial_strategy': sum(1 for kw in commercial_keywords if kw in query_lower)
        }

        # Return domain with highest score
        if max(scores.values()) == 0:
            return 'general'

        return max(scores, key=scores.get)

    async def _classify_secondary_domains(self, query: str) -> List[str]:
        """
        Identify secondary domains relevant to the query
        """
        # For now, return empty list - can be enhanced with ML models
        return []

    async def _classify_intent(self, query: str) -> str:
        """
        Classify the user's intent
        """
        query_lower = query.lower()

        # Question patterns
        question_indicators = ['what', 'how', 'when', 'where', 'why', 'which', '?']
        if any(indicator in query_lower for indicator in question_indicators):
            return 'question'

        # Request patterns
        request_indicators = ['create', 'design', 'develop', 'build', 'help me']
        if any(indicator in query_lower for indicator in request_indicators):
            return 'request'

        # Analysis patterns
        analysis_indicators = ['analyze', 'compare', 'evaluate', 'assess', 'review']
        if any(indicator in query_lower for indicator in analysis_indicators):
            return 'analysis'

        # Strategy patterns
        strategy_indicators = ['strategy', 'plan', 'approach', 'recommendation']
        if any(indicator in query_lower for indicator in strategy_indicators):
            return 'strategy'

        return 'general_inquiry'

    async def _extract_entities(self, query: str) -> List[str]:
        """
        Extract named entities from the query
        """
        # Simple entity extraction - can be enhanced with NLP models
        entities = []

        # Common healthcare entities
        healthcare_entities = [
            'FDA', 'EMA', 'PMDA', 'Phase I', 'Phase II', 'Phase III',
            'RCT', 'PMA', '510(k)', 'De Novo', 'SaMD', 'DTx'
        ]

        for entity in healthcare_entities:
            if entity.lower() in query.lower():
                entities.append(entity)

        return entities

    async def _identify_complexity_indicators(self, query: str) -> List[str]:
        """
        Identify indicators of query complexity
        """
        indicators = []

        # Length-based complexity
        word_count = len(query.split())
        if word_count > 50:
            indicators.append('long_query')

        # Multiple questions
        question_count = query.count('?')
        if question_count > 1:
            indicators.append('multiple_questions')

        # Complex keywords
        complex_keywords = [
            'comprehensive', 'detailed', 'complete', 'full', 'thorough',
            'strategy', 'analysis', 'comparison', 'evaluation'
        ]
        for keyword in complex_keywords:
            if keyword in query.lower():
                indicators.append(f'complex_keyword_{keyword}')

        return indicators

    async def _determine_routing(
        self,
        classification: Dict[str, Any],
        complexity: str,
        urgency: str,
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Determine the optimal routing strategy
        """
        # Safety critical -> escalation
        if urgency == "critical":
            return {
                "routing_type": RoutingType.ESCALATION.value,
                "reason": "critical_urgency",
                "escalation_type": "safety_review"
            }

        # Complex multi-domain -> advisory board or workflow
        if complexity == "complex" and classification.get("multi_domain"):
            if classification["intent"] == "strategy":
                return {
                    "routing_type": RoutingType.ADVISORY_BOARD.value,
                    "board_size": 5,
                    "required_expertise": [classification["primary_domain"]] + classification["secondary_domains"]
                }
            else:
                return {
                    "routing_type": RoutingType.WORKFLOW.value,
                    "workflow_type": "multi_domain_analysis"
                }

        # Moderate complexity -> agent team
        if complexity == "moderate" or classification.get("multi_domain"):
            return {
                "routing_type": RoutingType.AGENT_TEAM.value,
                "team_size": min(3, len([classification["primary_domain"]] + classification["secondary_domains"])),
                "primary_domain": classification["primary_domain"]
            }

        # Simple queries -> single agent
        return {
            "routing_type": RoutingType.SINGLE_AGENT.value,
            "domain": classification["primary_domain"],
            "agent_type": "specialist"
        }

    async def _gather_requirements(
        self,
        routing_decision: Dict[str, Any],
        classification: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Gather requirements for the chosen routing
        """
        requirements = {
            "domains": [classification["primary_domain"]],
            "expertise_level": "standard",
            "response_format": "comprehensive",
            "evidence_level": "standard"
        }

        # Add secondary domains if multi-domain
        if classification.get("multi_domain"):
            requirements["domains"].extend(classification["secondary_domains"])

        # Adjust requirements based on routing type
        if routing_decision["routing_type"] == RoutingType.ADVISORY_BOARD.value:
            requirements["expertise_level"] = "expert"
            requirements["consensus_required"] = True

        if routing_decision["routing_type"] == RoutingType.WORKFLOW.value:
            requirements["workflow_execution"] = True
            requirements["deliverables"] = ["analysis", "recommendations"]

        return requirements

    async def _estimate_response(
        self,
        routing_decision: Dict[str, Any],
        complexity: str
    ) -> Dict[str, Any]:
        """
        Estimate response time and characteristics
        """
        # Base estimates by routing type
        routing_estimates = {
            RoutingType.SINGLE_AGENT.value: {"time_ms": 5000, "tokens": 500},
            RoutingType.AGENT_TEAM.value: {"time_ms": 15000, "tokens": 1200},
            RoutingType.ADVISORY_BOARD.value: {"time_ms": 45000, "tokens": 2500},
            RoutingType.WORKFLOW.value: {"time_ms": 60000, "tokens": 3000},
            RoutingType.ESCALATION.value: {"time_ms": 120000, "tokens": 800}
        }

        base_estimate = routing_estimates.get(
            routing_decision["routing_type"],
            {"time_ms": 10000, "tokens": 800}
        )

        # Adjust for complexity
        complexity_multipliers = {
            "simple": 0.8,
            "moderate": 1.0,
            "complex": 1.5
        }

        multiplier = complexity_multipliers.get(complexity, 1.0)

        return {
            "estimated_time_ms": int(base_estimate["time_ms"] * multiplier),
            "estimated_tokens": int(base_estimate["tokens"] * multiplier),
            "confidence_level": "high" if multiplier <= 1.0 else "medium"
        }

    def _calculate_confidence(
        self,
        classification: Dict[str, Any],
        routing_decision: Dict[str, Any]
    ) -> float:
        """
        Calculate confidence in the triage decision
        """
        confidence = 0.8  # Base confidence

        # Adjust for classification confidence
        confidence *= classification.get("confidence", 0.8)

        # Adjust for domain clarity
        if classification["primary_domain"] != "general":
            confidence += 0.1

        # Adjust for routing type confidence
        routing_confidence = {
            RoutingType.SINGLE_AGENT.value: 0.9,
            RoutingType.AGENT_TEAM.value: 0.85,
            RoutingType.ADVISORY_BOARD.value: 0.8,
            RoutingType.WORKFLOW.value: 0.75,
            RoutingType.ESCALATION.value: 0.95
        }

        confidence *= routing_confidence.get(routing_decision["routing_type"], 0.7)

        return min(confidence, 1.0)

    def _generate_reasoning(
        self,
        classification: Dict[str, Any],
        complexity: str,
        urgency: str,
        routing_decision: Dict[str, Any]
    ) -> str:
        """
        Generate human-readable reasoning for the triage decision
        """
        reasoning_parts = []

        # Classification reasoning
        reasoning_parts.append(
            f"Classified as {classification['primary_domain']} domain with {classification['intent']} intent"
        )

        # Complexity reasoning
        reasoning_parts.append(f"Assessed complexity: {complexity}")

        # Urgency reasoning
        if urgency != "medium":
            reasoning_parts.append(f"Urgency level: {urgency}")

        # Routing reasoning
        routing_type = routing_decision["routing_type"]
        if routing_type == RoutingType.SINGLE_AGENT.value:
            reasoning_parts.append("Routing to single specialist agent for focused response")
        elif routing_type == RoutingType.AGENT_TEAM.value:
            reasoning_parts.append("Routing to agent team for collaborative analysis")
        elif routing_type == RoutingType.ADVISORY_BOARD.value:
            reasoning_parts.append("Convening advisory board for strategic consultation")
        elif routing_type == RoutingType.WORKFLOW.value:
            reasoning_parts.append("Initiating structured workflow for comprehensive processing")
        elif routing_type == RoutingType.ESCALATION.value:
            reasoning_parts.append("Escalating due to safety or urgency concerns")

        return ". ".join(reasoning_parts) + "."

    async def _create_safety_escalation(
        self,
        triage_id: str,
        query: str,
        safety_flags: List[str]
    ) -> TriageResult:
        """
        Create escalation triage result for safety issues
        """
        return TriageResult(
            triage_id=triage_id,
            classification={
                "primary_domain": "safety_critical",
                "safety_flags": safety_flags,
                "requires_human_review": True
            },
            routing={
                "routing_type": RoutingType.ESCALATION.value,
                "escalation_type": "safety_review",
                "priority": "immediate"
            },
            requirements={
                "human_review": True,
                "safety_protocols": True
            },
            estimated_response={
                "estimated_time_ms": 300000,  # 5 minutes for human review
                "requires_external_review": True
            },
            confidence=0.99,
            reasoning=f"Safety flags detected: {', '.join(safety_flags)}. Immediate escalation required."
        )

    async def _create_fallback_triage(
        self,
        triage_id: str,
        query: str,
        error: str
    ) -> TriageResult:
        """
        Create fallback triage result when processing fails
        """
        return TriageResult(
            triage_id=triage_id,
            classification={
                "primary_domain": "general",
                "intent": "general_inquiry",
                "error": error
            },
            routing={
                "routing_type": RoutingType.SINGLE_AGENT.value,
                "agent_type": "general",
                "fallback": True
            },
            requirements={
                "fallback_mode": True
            },
            estimated_response={
                "estimated_time_ms": 10000,
                "fallback": True
            },
            confidence=0.3,
            reasoning=f"Fallback routing due to processing error: {error}"
        )

    async def _update_performance_metrics(self, triage_time_ms: float):
        """
        Update performance tracking metrics
        """
        self.performance_metrics["total_requests"] += 1

        # Update average triage time
        current_avg = self.performance_metrics["avg_triage_time_ms"]
        total_requests = self.performance_metrics["total_requests"]

        new_avg = ((current_avg * (total_requests - 1)) + triage_time_ms) / total_requests
        self.performance_metrics["avg_triage_time_ms"] = new_avg

    def _generate_cache_key(self, query: str, user_context: Dict[str, Any]) -> str:
        """
        Generate cache key for triage results
        """
        # Simple hash-based cache key
        import hashlib
        context_str = json.dumps(user_context, sort_keys=True)
        combined = f"{query}:{context_str}"
        return hashlib.md5(combined.encode()).hexdigest()

    async def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get current performance metrics
        """
        return self.performance_metrics.copy()

    async def compose_advisory_board(
        self,
        topic: str,
        required_expertise: List[str],
        board_size: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Compose advisory board membership
        """
        # This would integrate with agent selection logic
        board_composition = []

        for i, expertise in enumerate(required_expertise[:board_size]):
            board_composition.append({
                "agent_id": f"agent_{expertise}_{i}",
                "role": f"{expertise.replace('_', ' ').title()} Expert",
                "expertise_areas": [expertise],
                "voting_weight": 1.0
            })

        return board_composition


# Supporting classes (simplified implementations)

class ComplexityAnalyzer:
    async def assess(self, query: str, classification: Dict[str, Any]) -> str:
        """Assess query complexity"""
        word_count = len(query.split())
        complexity_indicators = classification.get("complexity_indicators", [])

        if word_count > 50 or len(complexity_indicators) > 3:
            return "complex"
        elif word_count > 20 or len(complexity_indicators) > 1:
            return "moderate"
        else:
            return "simple"

class UrgencyDetector:
    async def detect(self, query: str, user_context: Dict[str, Any]) -> str:
        """Detect urgency level"""
        urgent_keywords = ['urgent', 'emergency', 'critical', 'immediate', 'asap']

        if any(keyword in query.lower() for keyword in urgent_keywords):
            return "critical"
        elif user_context.get("priority") == "high":
            return "high"
        else:
            return "medium"

class SafetyMonitor:
    async def screen_query(self, query: str, user_context: Dict[str, Any]) -> List[str]:
        """Screen for safety-critical content"""
        safety_flags = []

        safety_keywords = [
            'adverse event', 'death', 'serious injury', 'recall',
            'patient safety', 'malfunction', 'device failure'
        ]

        for keyword in safety_keywords:
            if keyword in query.lower():
                safety_flags.append(f"safety_keyword_{keyword.replace(' ', '_')}")

        return safety_flags

class RoutingOptimizer:
    def __init__(self):
        self.routing_history = []

    async def optimize_routing(self, classification: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize routing based on historical performance"""
        # Placeholder for routing optimization logic
        return {}